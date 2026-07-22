"""SQLAlchemy-backed video store (agent-meow Video surface)."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select

from omnigent.db.db_models import SqlVideo
from omnigent.db.utils import (
    get_or_create_engine,
    make_managed_session_maker,
    now_epoch_us,
)
from omnigent.entities import VideoAsset
from omnigent.stores.video_store import VideoStore


def _to_entity(row: SqlVideo) -> VideoAsset:
    """Convert a :class:`SqlVideo` ORM row to a :class:`VideoAsset`."""
    return VideoAsset(
        id=row.id,
        conversation_id=row.conversation_id,
        filename=row.filename,
        mime=row.mime,
        artifact_key=row.artifact_key,
        duration_seconds=row.duration_seconds,
        width=row.width,
        height=row.height,
        bytes_size=row.bytes_size,
        created_at=row.created_at,
        updated_at=row.updated_at,
        created_by=row.created_by,
    )


class SqlAlchemyVideoStore(VideoStore):
    """SQLAlchemy-backed implementation of :class:`VideoStore`."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the SQLAlchemy videos store.

        :param storage_location: SQLAlchemy database URI.
        """
        super().__init__(storage_location)
        self._engine = get_or_create_engine(storage_location)
        self._session = make_managed_session_maker(self._engine)

    def get(self, video_id: str, conversation_id: str) -> VideoAsset | None:
        """Fetch a single video's metadata by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlVideo, video_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            return _to_entity(row)

    def add(
        self,
        conversation_id: str,
        filename: str,
        mime: str,
        artifact_key: str,
        *,
        duration_seconds: float = 0.0,
        width: int = 0,
        height: int = 0,
        bytes_size: int = 0,
        created_by: str | None = None,
    ) -> VideoAsset:
        """Create and persist a new video metadata record."""
        created_us = now_epoch_us()
        row = SqlVideo(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            filename=filename,
            mime=mime,
            artifact_key=artifact_key,
            duration_seconds=duration_seconds,
            width=width,
            height=height,
            bytes_size=bytes_size,
            created_at=created_us // 1_000_000,
            updated_at=created_us,
            created_by=created_by,
        )
        with self._session() as session:
            session.add(row)
            return _to_entity(row)

    def list_for_conversation(self, conversation_id: str) -> list[VideoAsset]:
        """Return videos for a conversation, newest-first."""
        stmt = (
            select(SqlVideo)
            .where(SqlVideo.conversation_id == conversation_id)
            .order_by(SqlVideo.created_at.desc())
        )
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def delete(self, video_id: str, conversation_id: str) -> VideoAsset | None:
        """Delete a single video metadata record by id."""
        with self._session() as session:
            row = session.get(SqlVideo, video_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            entity = _to_entity(row)
            session.delete(row)
            return entity

    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all video metadata for a conversation."""
        with self._session() as session:
            result = session.execute(
                delete(SqlVideo).where(SqlVideo.conversation_id == conversation_id)
            )
            return int(result.rowcount or 0)