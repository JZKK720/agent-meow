"""SQLAlchemy implementation of FileIndexStore.

Uses a raw SQLite connection (same pattern as SqlAlchemyFileTagStore) to
avoid coupling to the global engine/session lifecycle. The runner's meta
worker and the server's search endpoint both open the shared
``~/.agent-meow/chat.db`` — WAL mode is enabled on connect so the two
processes can read/write concurrently.
"""

from __future__ import annotations

import json
import time
import uuid
from collections.abc import Sequence
from typing import Any

from agent_meow.entities.file_index import (
    STATUS_FAILED,
    STATUS_GONE,
    STATUS_INDEXED,
    STATUS_PENDING,
    STATUS_PROCESSING,
    FileIndexEntry,
)
from agent_meow.stores.file_index_store import FileIndexStore

_CREATE_INDEX_SQL = """
CREATE TABLE IF NOT EXISTS file_index (
    id VARCHAR(64) PRIMARY KEY,
    host_id VARCHAR(64) NOT NULL DEFAULT '',
    workspace VARCHAR(1024) NOT NULL,
    path VARCHAR(2048) NOT NULL,
    kind VARCHAR(16) NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    mtime_ns INTEGER NOT NULL DEFAULT 0,
    content_hash VARCHAR(64) NOT NULL DEFAULT '',
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    thumb_path VARCHAR(2048),
    error TEXT,
    indexed_at INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
)
"""

_CREATE_META_SQL = """
CREATE TABLE IF NOT EXISTS file_meta (
    file_id VARCHAR(64) PRIMARY KEY REFERENCES file_index(id) ON DELETE CASCADE,
    meta_json TEXT NOT NULL DEFAULT '{}'
)
"""

_CREATE_INDEXES_SQL = [
    "CREATE UNIQUE INDEX IF NOT EXISTS uix_file_index_ws_path "
    "ON file_index (host_id, workspace, path)",
    "CREATE INDEX IF NOT EXISTS ix_file_index_status ON file_index (status)",
    "CREATE INDEX IF NOT EXISTS ix_file_index_ws_kind ON file_index (host_id, workspace, kind)",
    "CREATE INDEX IF NOT EXISTS ix_file_index_hash "
    "ON file_index (host_id, workspace, content_hash)",
]

_SELECT_COLS = (
    "f.id, f.host_id, f.workspace, f.path, f.kind, f.size, f.mtime_ns, "
    "f.content_hash, f.status, f.thumb_path, f.error, f.indexed_at, "
    "f.created_at, COALESCE(m.meta_json, '{}')"
)


class SqlAlchemyFileIndexStore(FileIndexStore):
    """SQLite-backed file index (shared chat.db)."""

    def __init__(self, db_uri: str) -> None:
        super().__init__(db_uri)
        # Accept both "sqlite:///path" URIs and bare paths; the runner and
        # server construct this the same way as SqlAlchemyFileTagStore.
        from sqlalchemy import create_engine

        self._engine = create_engine(db_uri)
        self._ensure_table()

    def _ensure_table(self) -> None:
        from sqlalchemy import text

        with self._engine.begin() as conn:
            conn.execute(text("PRAGMA foreign_keys=ON"))
            conn.execute(text(_CREATE_INDEX_SQL))
            conn.execute(text(_CREATE_META_SQL))
            for sql in _CREATE_INDEXES_SQL:
                conn.execute(text(sql))

    # ── write path ──────────────────────────────────────────────────────

    def upsert_pending(
        self,
        *,
        host_id: str,
        workspace: str,
        path: str,
        kind: str,
        size: int,
        mtime_ns: int,
    ) -> str:
        from sqlalchemy import text

        now = int(time.time())
        with self._engine.begin() as conn:
            row = conn.execute(
                text(
                    "SELECT id, size, mtime_ns, status FROM file_index "
                    "WHERE host_id = :hid AND workspace = :ws AND path = :p"
                ),
                {"hid": host_id, "ws": workspace, "p": path},
            ).fetchone()
            if row is not None:
                existing_id, ex_size, ex_mtime, ex_status = row
                if ex_status == STATUS_INDEXED and ex_size == size and ex_mtime == mtime_ns:
                    # Unchanged file — leave the indexed row alone.
                    return str(existing_id)
                conn.execute(
                    text(
                        "UPDATE file_index SET size = :s, mtime_ns = :m, "
                        "status = :st, error = NULL WHERE id = :id"
                    ),
                    {"s": size, "m": mtime_ns, "st": STATUS_PENDING, "id": existing_id},
                )
                return str(existing_id)
            new_id = str(uuid.uuid4())
            conn.execute(
                text(
                    "INSERT INTO file_index (id, host_id, workspace, path, kind, "
                    "size, mtime_ns, content_hash, status, thumb_path, error, "
                    "indexed_at, created_at) VALUES (:id, :hid, :ws, :p, :k, :s, "
                    ":m, '', :st, NULL, NULL, 0, :c)"
                ),
                {
                    "id": new_id,
                    "hid": host_id,
                    "ws": workspace,
                    "p": path,
                    "k": kind,
                    "s": size,
                    "m": mtime_ns,
                    "st": STATUS_PENDING,
                    "c": now,
                },
            )
            return new_id

    def claim_pending(self, limit: int = 8) -> list[FileIndexEntry]:
        from sqlalchemy import text

        out: list[FileIndexEntry] = []
        with self._engine.begin() as conn:
            rows = conn.execute(
                text(
                    f"SELECT {_SELECT_COLS} FROM file_index f "
                    "LEFT JOIN file_meta m ON m.file_id = f.id "
                    "WHERE f.status = :st ORDER BY f.created_at LIMIT :lim"
                ),
                {"st": STATUS_PENDING, "lim": limit},
            ).fetchall()
            ids = [r[0] for r in rows]
            if ids:
                conn.execute(
                    text(
                        "UPDATE file_index SET status = :st WHERE id IN "
                        "(" + ",".join(f":i{i}" for i in range(len(ids))) + ")"
                    ),
                    {"st": STATUS_PROCESSING, **{f"i{i}": v for i, v in enumerate(ids)}},
                )
        # Return the just-claimed rows (status now 'processing').
        for r in rows:
            entry = _row_to_entry(r)
            out.append(FileIndexEntry(**{**entry.__dict__, "status": STATUS_PROCESSING}))
        return out

    def mark_indexed(
        self,
        entry_id: str,
        *,
        content_hash: str,
        meta: dict[str, object],
        thumb_path: str | None,
    ) -> None:
        from sqlalchemy import text

        now = int(time.time())
        with self._engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE file_index SET status = :st, content_hash = :h, "
                    "thumb_path = :t, error = NULL, indexed_at = :ts WHERE id = :id"
                ),
                {
                    "st": STATUS_INDEXED,
                    "h": content_hash,
                    "t": thumb_path,
                    "ts": now,
                    "id": entry_id,
                },
            )
            conn.execute(
                text(
                    "INSERT INTO file_meta (file_id, meta_json) VALUES (:id, :m) "
                    "ON CONFLICT(file_id) DO UPDATE SET meta_json = :m"
                ),
                {"id": entry_id, "m": json.dumps(meta, ensure_ascii=False)},
            )

    def mark_failed(self, entry_id: str, error: str) -> None:
        from sqlalchemy import text

        # Park in FAILED (not PENDING): a permanently broken file would
        # otherwise bounce through claim→fail→claim in a hot loop. The row
        # re-queues when the file itself changes (upsert_pending resets).
        with self._engine.begin() as conn:
            conn.execute(
                text("UPDATE file_index SET status = :st, error = :e WHERE id = :id"),
                {"st": STATUS_FAILED, "e": error[:500], "id": entry_id},
            )

    def mark_duplicate(self, entry_id: str, *, content_hash: str) -> None:
        from sqlalchemy import text

        with self._engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE file_index SET status = :st, content_hash = :h, "
                    "indexed_at = :ts WHERE id = :id"
                ),
                {
                    "st": "duplicate",
                    "h": content_hash,
                    "ts": int(time.time()),
                    "id": entry_id,
                },
            )

    def mark_gone(self, *, host_id: str, workspace: str, path: str) -> None:
        from sqlalchemy import text

        with self._engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE file_index SET status = :st WHERE host_id = :hid "
                    "AND workspace = :ws AND path = :p"
                ),
                {"st": STATUS_GONE, "hid": host_id, "ws": workspace, "p": path},
            )

    # ── read path ───────────────────────────────────────────────────────

    def find_by_path(self, *, host_id: str, workspace: str, path: str) -> FileIndexEntry | None:
        from sqlalchemy import text

        with self._engine.connect() as conn:
            row = conn.execute(
                text(
                    f"SELECT {_SELECT_COLS} FROM file_index f "
                    "LEFT JOIN file_meta m ON m.file_id = f.id "
                    "WHERE f.host_id = :hid AND f.workspace = :ws AND f.path = :p"
                ),
                {"hid": host_id, "ws": workspace, "p": path},
            ).fetchone()
        return _row_to_entry(row) if row else None

    def list_workspace(
        self,
        *,
        host_id: str,
        workspace: str,
        kind: str | None = None,
        statuses: tuple[str, ...] | None = None,
        limit: int = 500,
        offset: int = 0,
    ) -> list[FileIndexEntry]:
        from sqlalchemy import text

        where = ["f.host_id = :hid", "f.workspace = :ws"]
        params: dict[str, object] = {"hid": host_id, "ws": workspace, "lim": limit, "off": offset}
        if kind is not None:
            where.append("f.kind = :kind")
            params["kind"] = kind
        if statuses:
            where.append("f.status IN (" + ",".join(f":s{i}" for i in range(len(statuses))) + ")")
            params.update({f"s{i}": s for i, s in enumerate(statuses)})
        else:
            where.append("f.status != :gone")
            params["gone"] = STATUS_GONE
        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    f"SELECT {_SELECT_COLS} FROM file_index f "
                    "LEFT JOIN file_meta m ON m.file_id = f.id WHERE "
                    + " AND ".join(where)
                    + " ORDER BY f.indexed_at DESC, f.path LIMIT :lim OFFSET :off"
                ),
                params,
            ).fetchall()
        return [_row_to_entry(r) for r in rows]

    def count_by_status(self, *, host_id: str, workspace: str) -> dict[str, int]:
        from sqlalchemy import text

        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT status, COUNT(*) FROM file_index WHERE host_id = :hid "
                    "AND workspace = :ws GROUP BY status"
                ),
                {"hid": host_id, "ws": workspace},
            ).fetchall()
        return {r[0]: r[1] for r in rows}

    def find_hash_owner(
        self, *, host_id: str, workspace: str, content_hash: str, exclude_id: str
    ) -> FileIndexEntry | None:
        from sqlalchemy import text

        if not content_hash:
            return None
        with self._engine.connect() as conn:
            row = conn.execute(
                text(
                    f"SELECT {_SELECT_COLS} FROM file_index f "
                    "LEFT JOIN file_meta m ON m.file_id = f.id "
                    "WHERE f.host_id = :hid AND f.workspace = :ws "
                    "AND f.content_hash = :h AND f.id != :x AND f.status = :st "
                    "ORDER BY f.indexed_at LIMIT 1"
                ),
                {
                    "hid": host_id,
                    "ws": workspace,
                    "h": content_hash,
                    "x": exclude_id,
                    "st": STATUS_INDEXED,
                },
            ).fetchone()
        return _row_to_entry(row) if row else None


def _row_to_entry(row: Sequence[Any]) -> FileIndexEntry:
    """Map a joined ``file_index`` + ``file_meta`` row to an entity.

    Column order matches ``_SELECT_COLS`` (f.id … f.created_at, meta_json).
    """
    try:
        meta: dict[str, Any] = json.loads(row[13])
    except (ValueError, TypeError):
        meta = {}
    return FileIndexEntry(
        id=row[0],
        host_id=row[1],
        workspace=row[2],
        path=row[3],
        kind=row[4],
        size=row[5],
        mtime_ns=row[6],
        content_hash=row[7],
        status=row[8],
        thumb_path=row[9],
        error=row[10],
        indexed_at=row[11],
        created_at=row[12],
        meta=meta,
    )
