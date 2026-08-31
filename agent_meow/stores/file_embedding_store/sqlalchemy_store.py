"""SQLAlchemy implementation of the image-embedding store (plan 039 P2).

Mirrors :mod:`agent_meow.stores.file_index_store.sqlalchemy_store`: a raw
SQLite connection to the shared ``chat.db`` (WAL) so the runner's embed
worker and the server's search endpoint interleave safely. Vectors are
little-endian float32 blobs; KNN is brute-force cosine — at
personal-workspace scale (<100k images) a pure-Python scan completes in
tens of milliseconds (numpy is absent from the base venv by design); a
C extension or sqlite-vec pass is a future optimization.
"""

from __future__ import annotations

import json
import logging
import struct
import time
import uuid
from collections.abc import Sequence
from typing import Any

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine

from agent_meow.entities.file_index import FileIndexEntry

_logger = logging.getLogger(__name__)

_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS file_image_embedding (
    id VARCHAR(64) PRIMARY KEY,
    file_id VARCHAR(64) NOT NULL REFERENCES file_index(id) ON DELETE CASCADE,
    model VARCHAR(128) NOT NULL,
    dim INTEGER NOT NULL,
    vector BLOB NOT NULL,
    created_at INTEGER NOT NULL
)
"""

_CREATE_INDEXES_SQL = [
    "CREATE UNIQUE INDEX IF NOT EXISTS uix_file_image_embedding_file_model "
    "ON file_image_embedding (file_id, model)",
    "CREATE INDEX IF NOT EXISTS ix_file_image_embedding_model "
    "ON file_image_embedding (model)",
]


def _vec_to_blob(vec: Sequence[float]) -> bytes:
    """Pack a float sequence as little-endian float32 bytes."""
    return struct.pack(f"<{len(vec)}f", *[float(v) for v in vec])


def _blob_to_vec(blob: bytes) -> list[float]:
    """Unpack a little-endian float32 blob to a list of floats."""
    usable = len(blob) - (len(blob) % 4)
    return list(struct.unpack(f"<{usable // 4}f", blob[:usable]))


class SqlAlchemyFileEmbeddingStore:
    """Store + KNN query for per-image CLIP embeddings."""

    def __init__(self, storage_location: str) -> None:
        self._engine: Engine = create_engine(storage_location, future=True)

        @event.listens_for(self._engine, "connect")
        def _on_connect(dbapi_conn: Any, _record: Any) -> None:
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA busy_timeout=5000")
            _ = cursor  # sqlite3 DBAPI cursor
            cursor.close()
            self._ensure_table(dbapi_conn)

    def _ensure_table(self, dbapi_conn: Any) -> None:
        cursor = dbapi_conn.cursor()
        cursor.execute(_CREATE_TABLE_SQL)
        for stmt in _CREATE_INDEXES_SQL:
            cursor.execute(stmt)
        dbapi_conn.commit()
        cursor.close()

    def upsert(
        self,
        *,
        file_id: str,
        model: str,
        vector: Sequence[float],
    ) -> None:
        """Insert or replace the embedding for one file under one model."""
        blob = _vec_to_blob(vector)
        now = int(time.time())
        with self._engine.connect() as conn:
            conn.execute(
                text(
                    "INSERT INTO file_image_embedding "
                    "(id, file_id, model, dim, vector, created_at) "
                    "VALUES (:id, :fid, :model, :dim, :vec, :ts) "
                    "ON CONFLICT(file_id, model) DO UPDATE SET "
                    "dim = excluded.dim, vector = excluded.vector, "
                    "created_at = excluded.created_at"
                ),
                {
                    "id": uuid.uuid4().hex,
                    "fid": file_id,
                    "model": model,
                    "dim": len(vector),
                    "vec": blob,
                    "ts": now,
                },
            )
            conn.commit()

    def delete_for_file(self, file_id: str) -> None:
        """Drop embeddings for one file (e.g. before a re-embed)."""
        with self._engine.connect() as conn:
            conn.execute(
                text("DELETE FROM file_image_embedding WHERE file_id = :fid"),
                {"fid": file_id},
            )
            conn.commit()

    def embedded_file_ids(self, *, model: str) -> set[str]:
        """All file_ids that already have an embedding under ``model``."""
        with self._engine.connect() as conn:
            rows = conn.execute(
                text("SELECT file_id FROM file_image_embedding WHERE model = :m"),
                {"m": model},
            ).fetchall()
        return {r[0] for r in rows}

    def knn_search(
        self,
        *,
        host_id: str,
        workspace: str,
        query_vector: Sequence[float],
        model: str,
        kind: str | None = None,
        limit: int = 50,
        min_similarity: float = 0.15,
    ) -> list[tuple[FileIndexEntry, float]]:
        """Brute-force cosine KNN over the workspace's embedded images.

        Loads every vector for ``(host_id, workspace)`` — personal-scale
        workspaces hold thousands, not millions, so a pure-Python cosine
        scan (no numpy in the base venv by design) completes in tens of
        milliseconds; a C extension or sqlite-vec is a later optimization,
        not a correctness need. Only images whose parent ``file_index``
        row is ``indexed`` are returned.
        """
        q = [float(v) for v in query_vector]
        qdim = len(q)
        where = [
            "f.host_id = :hid",
            "f.workspace = :ws",
            "f.status = 'indexed'",
            "e.model = :model",
            "e.dim = :qdim",
        ]
        params: dict[str, object] = {
            "hid": host_id,
            "ws": workspace,
            "model": model,
            "qdim": qdim,
        }
        if kind is not None:
            where.append("f.kind = :kind")
            params["kind"] = kind
        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT e.id, e.file_id, e.model, e.dim, e.vector, "
                    "f.id, f.host_id, f.workspace, f.path, f.kind, f.size, "
                    "f.mtime_ns, f.content_hash, f.status, f.thumb_path, "
                    "f.error, f.indexed_at, f.created_at, "
                    "COALESCE(m.meta_json, '{}') "
                    "FROM file_image_embedding e "
                    "JOIN file_index f ON f.id = e.file_id "
                    "LEFT JOIN file_meta m ON m.file_id = f.id "
                    "WHERE " + " AND ".join(where)
                ),
                params,
            ).fetchall()

        if not rows:
            return []

        def _l2(v: list[float]) -> list[float]:
            norm = sum(x * x for x in v) ** 0.5
            if norm == 0.0:
                return list(v)
            return [x / norm for x in v]

        qn = _l2(q)
        scored: list[tuple[int, float]] = []
        for pos, r in enumerate(rows):
            vec = _blob_to_vec(r[4])
            if len(vec) != qdim:
                continue  # mismatched dim under this model — skip defensively
            sim = sum(a * b for a, b in zip(qn, _l2(vec)))
            scored.append((pos, sim))
        scored.sort(key=lambda pair: -pair[1])

        out: list[tuple[FileIndexEntry, float]] = []
        for pos, sim in scored[:limit]:
            if sim < min_similarity:
                break
            r: Sequence[Any] = rows[pos]
            try:
                meta: dict[str, Any] = json.loads(r[18])
            except (ValueError, TypeError):
                meta = {}
            entry = FileIndexEntry(
                id=r[5],
                host_id=r[6],
                workspace=r[7],
                path=r[8],
                kind=r[9],
                size=r[10],
                mtime_ns=r[11],
                content_hash=r[12],
                status=r[13],
                thumb_path=r[14],
                error=r[15],
                indexed_at=r[16],
                created_at=r[17],
                meta=meta,
            )
            out.append((entry, sim))
        return out