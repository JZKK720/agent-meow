"""SQLAlchemy implementation of FileTagStore.

Uses a raw SQLite connection (same pattern as other stores in this repo)
to avoid coupling to the global engine/session lifecycle.
"""

from __future__ import annotations

import time
import uuid
from collections import Counter

from sqlalchemy import create_engine, text

from agent_meow.entities.file_tag import FileTag, TagEntry, TagSummary
from agent_meow.stores.file_tag_store import FileTagStore

_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS file_tags (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    tag VARCHAR(64) NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    description TEXT,
    model VARCHAR(128) NOT NULL DEFAULT '',
    analyzed_at INTEGER NOT NULL
)
"""

_CREATE_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS ix_file_tags_conversation_id ON file_tags (conversation_id)",
    "CREATE UNIQUE INDEX IF NOT EXISTS uix_file_tags_conv_path_tag ON file_tags (conversation_id, file_path, tag)",
]


class SqlAlchemyFileTagStore(FileTagStore):
    """SQLite-backed file tag store."""

    def __init__(self, db_uri: str) -> None:
        super().__init__(db_uri)
        self._engine = create_engine(db_uri)
        self._ensure_table()

    def _ensure_table(self) -> None:
        """Create the table if it doesn't exist (for test fixtures)."""
        with self._engine.begin() as conn:
            conn.execute(text(_CREATE_TABLE_SQL))
            for sql in _CREATE_INDEXES_SQL:
                conn.execute(text(sql))

    def upsert(
        self,
        conversation_id: str,
        file_path: str,
        tags: list[TagEntry],
        model: str,
    ) -> int:
        now = int(time.time())
        with self._engine.begin() as conn:
            conn.execute(
                text(
                    "DELETE FROM file_tags WHERE conversation_id = :cid AND file_path = :fp"
                ),
                {"cid": conversation_id, "fp": file_path},
            )
            for entry in tags:
                conn.execute(
                    text(
                        """INSERT INTO file_tags (id, conversation_id, file_path, tag, confidence, description, model, analyzed_at)
                           VALUES (:id, :cid, :fp, :tag, :conf, :desc, :model, :ts)"""
                    ),
                    {
                        "id": str(uuid.uuid4()),
                        "cid": conversation_id,
                        "fp": file_path,
                        "tag": entry.tag,
                        "conf": entry.confidence,
                        "desc": entry.description,
                        "model": model,
                        "ts": now,
                    },
                )
        return len(tags)

    def list_for_conversation(self, conversation_id: str) -> list[FileTag]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT id, conversation_id, file_path, tag, confidence, description, model, analyzed_at "
                    "FROM file_tags WHERE conversation_id = :cid ORDER BY file_path, tag"
                ),
                {"cid": conversation_id},
            ).fetchall()
        return [
            FileTag(
                id=r[0], conversation_id=r[1], file_path=r[2], tag=r[3],
                confidence=r[4], description=r[5], model=r[6], analyzed_at=r[7],
            )
            for r in rows
        ]

    def list_tags(self, conversation_id: str) -> list[TagSummary]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT tag, COUNT(*) as cnt FROM file_tags "
                    "WHERE conversation_id = :cid GROUP BY tag ORDER BY cnt DESC, tag"
                ),
                {"cid": conversation_id},
            ).fetchall()
        return [TagSummary(tag=r[0], count=r[1]) for r in rows]

    def delete_for_conversation(self, conversation_id: str) -> int:
        with self._engine.begin() as conn:
            result = conn.execute(
                text("DELETE FROM file_tags WHERE conversation_id = :cid"),
                {"cid": conversation_id},
            )
            return result.rowcount
