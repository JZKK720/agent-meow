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

# FTS5 virtual table for full-text search over indexed files (plan 039 P1).
# The searchable blob is: basename + kind + EXIF camera/date + doc text
# excerpt + tag names. The ``trigram`` tokenizer gives CJK substring match
# (a plain ``unicode61`` tokenizer can't segment Chinese). We use a
# standalone (non-external-content) FTS5 table that stores the body
# directly + a ``file_id`` column to join back to file_index — simpler
# and more robust than external-content (which requires the content
# table to mirror the FTS columns).
_CREATE_FTS_SQL = """
CREATE VIRTUAL TABLE IF NOT EXISTS file_index_fts USING fts5(
    body,
    file_id UNINDEXED,
    tokenize='trigram case_sensitive 0'
)
"""

# Keep the FTS table in sync with file_index inserts/updates. The meta
# worker writes meta_json separately (mark_indexed), so we re-index on
# both the row insert and the meta upsert. ``DELETE`` then ``INSERT`` is
# the standard sync pattern (FTS5 has no UPSERT).
_FTS_SYNC_TRIGGER_INSERT = """
CREATE TRIGGER IF NOT EXISTS file_index_fts_ai AFTER INSERT ON file_index BEGIN
    INSERT INTO file_index_fts(body, file_id)
    VALUES (_file_index_fts_body(new.id), new.id);
END
"""
_FTS_SYNC_TRIGGER_UPDATE = """
CREATE TRIGGER IF NOT EXISTS file_index_fts_au AFTER UPDATE ON file_index BEGIN
    DELETE FROM file_index_fts WHERE file_id = old.id;
    INSERT INTO file_index_fts(body, file_id)
    VALUES (_file_index_fts_body(new.id), new.id);
END
"""
_FTS_SYNC_TRIGGER_DELETE = """
CREATE TRIGGER IF NOT EXISTS file_index_fts_ad AFTER DELETE ON file_index BEGIN
    DELETE FROM file_index_fts WHERE file_id = old.id;
END
"""
# Re-index when file_meta changes (the worker writes EXIF/doc text after
# the row is already inserted). The body function reads meta_json live.
# mark_indexed does INSERT ... ON CONFLICT DO UPDATE, so we need both an
# INSERT and an UPDATE trigger on file_meta. Both delete-then-insert to
# stay idempotent (the file_index UPDATE trigger may have already inserted
# a row for the same file_id — the DELETE clears it before re-inserting).
_FTS_SYNC_META_TRIGGER = """
CREATE TRIGGER IF NOT EXISTS file_index_fts_meta_ai
AFTER INSERT ON file_meta BEGIN
    DELETE FROM file_index_fts WHERE file_id = new.file_id;
    INSERT INTO file_index_fts(body, file_id)
    VALUES (_file_index_fts_body(new.file_id), new.file_id);
END
"""
_FTS_SYNC_META_TRIGGER_UPDATE = """
CREATE TRIGGER IF NOT EXISTS file_index_fts_meta_au
AFTER UPDATE ON file_meta BEGIN
    DELETE FROM file_index_fts WHERE file_id = new.file_id;
    INSERT INTO file_index_fts(body, file_id)
    VALUES (_file_index_fts_body(new.file_id), new.file_id);
END
"""

# A SQL function that builds the searchable body for one file_id by
# concatenating the basename, kind, and the meta_json fields that carry
# searchable text (camera, date, doc text excerpt). Registered per-conn.
# SQLite Python's ``create_function`` is per-connection, so we install it
# in _ensure_table and again on every search connection.
_FTS_BODY_FUNC_NAME = "_file_index_fts_body"

# Version of the body-building function. Bump whenever _build_fts_body's
# output changes (e.g. adding dimensions) so already-indexed rows get their
# bodies rebuilt once — the FTS triggers only fire on row/meta writes, so
# without this marker a body change would never propagate to existing rows.
_FTS_BODY_VERSION = 2

_CREATE_FTS_VERSION_SQL = """
CREATE TABLE IF NOT EXISTS file_index_fts_version (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    version INTEGER NOT NULL
)
"""

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
            self._install_fts(conn)

    def _install_fts(self, conn: Any) -> None:
        """Create the FTS5 table + sync triggers and register the body fn.

        Called once during ``_ensure_table`` and again on every search
        connection (``create_function`` is per-connection in SQLite's
        Python binding, so a fresh connection from the pool won't have it).
        """
        from sqlalchemy import text

        # Register the body-builder as a Python-side SQL function so the
        # triggers can call it. Per-connection: safe to re-register.
        # SQLAlchemy wraps the raw DBAPI connection; unwrap it.
        dbapi_conn = conn.connection.driver_connection
        dbapi_conn.create_function(
            _FTS_BODY_FUNC_NAME,
            1,
            lambda file_id: self._build_fts_body(dbapi_conn, file_id),
        )
        self._repair_legacy_fts(conn)
        conn.execute(text(_CREATE_FTS_SQL))
        conn.execute(text(_FTS_SYNC_TRIGGER_INSERT))
        conn.execute(text(_FTS_SYNC_TRIGGER_UPDATE))
        conn.execute(text(_FTS_SYNC_TRIGGER_DELETE))
        conn.execute(text(_FTS_SYNC_META_TRIGGER))
        conn.execute(text(_FTS_SYNC_META_TRIGGER_UPDATE))
        # AFTER the table exists: rebuild bodies once when the body fn
        # changes (dimension search etc. — see _FTS_BODY_VERSION).
        self._maybe_reindex_on_body_version_bump(conn)

    def _maybe_reindex_on_body_version_bump(self, conn: Any) -> None:
        """Rebuild all FTS bodies once when the body function changes.

        The sync triggers only fire on file_index/file_meta writes, so a
        change to what _build_fts_body emits (e.g. adding dimensions) would
        leave existing rows searchable under the old body forever. A tiny
        version table records which body version the index was built with;
        on a mismatch, drop + rebuild the FTS rows, then stamp the new
        version. Runs at most once per version bump (guarded by the version
        row), and only from the write-mode _ensure_table path — the
        read-mode _install_fts callers share the same check but only
        trigger a rebuild inside a transaction, which is fine since
        the store opens _ensure_table first.
        """
        from sqlalchemy import text

        conn.execute(text(_CREATE_FTS_VERSION_SQL))
        row = conn.execute(
            text("SELECT version FROM file_index_fts_version WHERE id = 1")
        ).fetchone()
        if row is not None and int(row[0]) >= _FTS_BODY_VERSION:
            return
        # Rebuild every body against the current function. The triggers
        # would double-insert, so wipe the FTS rows first.
        conn.execute(text("DELETE FROM file_index_fts"))
        conn.execute(
            text(
                "INSERT INTO file_index_fts (file_id, body) "
                "SELECT id, " + _FTS_BODY_FUNC_NAME + "(id) FROM file_index"
            )
        )
        conn.execute(
            text(
                "INSERT INTO file_index_fts_version (id, version) VALUES (1, :v) "
                "ON CONFLICT(id) DO UPDATE SET version = :v"
            ),
            {"v": _FTS_BODY_VERSION},
        )

    def _repair_legacy_fts(self, conn: Any) -> None:
        """Self-heal a legacy external-content FTS table, if present.

        An intermediate dev build created ``file_index_fts`` with
        ``content='file_index'`` (rowid-keyed, no ``file_id`` column) before
        the standalone schema landed. Because the migration stamps
        ``d3e4f5a9b0c1`` regardless, the store's ``IF NOT EXISTS`` then
        masked the wrong schema forever — every search on such a DB dies
        with ``no such column: file_index_fts.file_id``. Detect that shape,
        drop the FTS table + its triggers, recreate with the standalone
        schema, and backfill the bodies from the live rows.
        Idempotent: a healthy table passes straight through.
        """
        from sqlalchemy import text

        row = conn.execute(
            text("SELECT sql FROM sqlite_master WHERE name = 'file_index_fts'")
        ).fetchone()
        if row is None or row[0] is None:
            return
        schema_sql = str(row[0])
        if "file_id" in schema_sql:
            return  # current standalone schema — nothing to do
        # Legacy external-content shape: drop the FTS table + sync
        # triggers (old-style and new-style names both), then recreate.
        for trigger in (
            "file_index_fts_ai",
            "file_index_fts_au",
            "file_index_fts_ad",
            "file_index_fts_meta_ai",
            "file_index_fts_meta_au",
        ):
            conn.execute(text(f"DROP TRIGGER IF EXISTS {trigger}"))
        conn.execute(text("DROP TABLE IF EXISTS file_index_fts"))
        conn.execute(text(_CREATE_FTS_SQL))
        conn.execute(text(_FTS_SYNC_TRIGGER_INSERT))
        conn.execute(text(_FTS_SYNC_TRIGGER_UPDATE))
        conn.execute(text(_FTS_SYNC_TRIGGER_DELETE))
        conn.execute(text(_FTS_SYNC_META_TRIGGER))
        conn.execute(text(_FTS_SYNC_META_TRIGGER_UPDATE))
        # Backfill: rebuild the body for every indexed row. The Python-side
        # body fn is registered on this connection, so the INSERT below can
        # call it directly.
        conn.execute(
            text(
                "INSERT INTO file_index_fts (file_id, body) "
                "SELECT id, " + _FTS_BODY_FUNC_NAME + "(id) FROM file_index"
            )
        )

    @staticmethod
    def _build_fts_body(dbapi_conn: Any, file_id: Any) -> str:
        """Concatenate the searchable text for one file_id.

        Reads the basename (from file_index.path), kind, and the meta_json
        fields that carry searchable text (camera, date, doc text excerpt).
        Returns a space-joined blob; empty string if the row is gone.
        """
        import os

        row = dbapi_conn.execute(
            "SELECT f.path, f.kind, COALESCE(m.meta_json, '{}') "
            "FROM file_index f LEFT JOIN file_meta m ON m.file_id = f.id "
            "WHERE f.id = ?",
            (file_id,),
        ).fetchone()
        if row is None:
            return ""
        path, kind, meta_json = row
        parts: list[str] = []
        if path:
            parts.append(os.path.basename(path))
        if kind:
            parts.append(kind)
        try:
            meta = json.loads(meta_json) if meta_json else {}
        except (ValueError, TypeError):
            meta = {}
        # EXIF / image fields
        for key in (
            "camera_make", "camera_model", "lens_model",
            "datetime_original", "exif_datetime",
        ):
            v = meta.get(key)
            if isinstance(v, str) and v:
                parts.append(v)
        # Pixel dimensions — the badge the panels render, and a common
        # search key ("find my 2560 wide screenshots").
        width = meta.get("width")
        height = meta.get("height")
        if isinstance(width, (int, float)) and width and isinstance(height, (int, float)) and height:
            parts.append(f"{int(width)}x{int(height)}")
            parts.append(f"{int(width)}×{int(height)}")
        # Document text excerpt (first ~2k chars — trigram indexes the
        # whole thing, but capping keeps the blob from blowing up on huge
        # PDFs the worker already truncated to text_excerpt).
        excerpt = meta.get("text_excerpt")
        if isinstance(excerpt, str) and excerpt:
            parts.append(excerpt[:2000])
        return " ".join(parts)

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

    def search(
        self,
        *,
        host_id: str,
        workspace: str,
        query: str,
        kind: str | None = None,
        limit: int = 50,
    ) -> list[tuple[FileIndexEntry, float]]:
        """FTS5 search over indexed files in a workspace.

        Returns ``(entry, score)`` pairs ranked by bm25 (lower = better in
        FTS5, so we negate to a higher-is-better score). The trigram
        tokenizer gives CJK substring match; the body blob is basename +
        EXIF camera/date + doc text excerpt. Only ``indexed`` rows are
        searchable (the FTS triggers fire on insert/update, but we filter
        to indexed so pending/failed/gone rows never surface).
        """
        from sqlalchemy import text

        q = query.strip()
        if not q:
            return []
        # FTS5 query syntax: wrap the user query as a quoted phrase so
        # punctuation/special chars don't break the parser. trigram
        # tokenizer treats the quoted string as a substring scan.
        fts_query = '"' + q.replace('"', '""') + '"'
        where = [
            "f.host_id = :hid",
            "f.workspace = :ws",
            "f.status = :st",
        ]
        params: dict[str, object] = {
            "hid": host_id,
            "ws": workspace,
            "st": STATUS_INDEXED,
            "q": fts_query,
            "lim": limit,
        }
        if kind is not None:
            where.append("f.kind = :kind")
            params["kind"] = kind
        with self._engine.connect() as conn:
            # Re-register the body fn on this pooled connection (the
            # triggers don't fire on a SELECT, but the FTS table's
            # external-content shadow may need it for integrity checks).
            self._install_fts(conn)
            rows = conn.execute(
                text(
                    f"SELECT {_SELECT_COLS}, bm25(file_index_fts) AS rank "
                    "FROM file_index f "
                    "LEFT JOIN file_meta m ON m.file_id = f.id "
                    "JOIN file_index_fts ON file_index_fts.file_id = f.id "
                    "WHERE file_index_fts MATCH :q AND "
                    + " AND ".join(where)
                    + " ORDER BY rank ASC, f.indexed_at DESC LIMIT :lim"
                ),
                params,
            ).fetchall()
        out: list[tuple[FileIndexEntry, float]] = []
        for r in rows:
            entry = _row_to_entry(r)
            # bm25 returns lower-is-better; negate so callers can sort
            # higher-is-better. The raw value is small (typically < 0).
            score = -float(r[14]) if r[14] is not None else 0.0
            out.append((entry, score))
        return out

    def visual_search(
        self,
        *,
        host_id: str,
        workspace: str,
        query: str,
        kind: str | None = None,
        limit: int = 50,
    ) -> list[tuple[FileIndexEntry, float]]:
        """CLIP content search over embedded images in a workspace.

        Embeds ``query`` via the local CLIP server (scripts/clip_server.py
        — a lazy-optional service; absent → returns [] and callers fall
        back to FTS-only) then cosine-KNNs :class:`file_image_embedding`.
        Same-shape return as :meth:`search` so the route layer can merge.
        """
        from agent_meow.runner.file_embed_worker import (
            CLIP_SERVER_URL,
            MODEL_ID,
            _clip_ready,
        )

        ok, _detail = _clip_ready()
        if not ok:
            return []
        try:
            import httpx

            resp = httpx.post(
                f"{CLIP_SERVER_URL.rstrip('/')}/embed/text",
                json={"text": query},
                timeout=15,
            )
            resp.raise_for_status()
            vec = resp.json()["vector"]
        except Exception:  # noqa: BLE001 — server hiccup → FTS-only
            _logger.debug("clip text embed failed", exc_info=True)
            return []

        from agent_meow.host.local_server import _local_data_dir
        from agent_meow.stores.file_embedding_store.sqlalchemy_store import (
            SqlAlchemyFileEmbeddingStore,
        )

        embed_store = SqlAlchemyFileEmbeddingStore(
            f"sqlite:///{_local_data_dir() / 'chat.db'}"
        )
        try:
            return embed_store.knn_search(
                host_id=host_id,
                workspace=workspace,
                query_vector=vec,
                model=MODEL_ID,
                kind=kind,
                limit=limit,
            )
        except Exception:  # noqa: BLE001 — any store failure → FTS-only
            _logger.debug("visual knn search failed", exc_info=True)
            return []


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
