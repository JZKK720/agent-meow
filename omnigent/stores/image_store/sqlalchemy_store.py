"""SQLAlchemy-backed image store (agent-meow Images surface)."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select

from omnigent.db.db_models import SqlImage
from omnigent.db.utils import (
    get_or_create_engine,
    make_managed_session_maker,
    now_epoch_us,
)
from omnigent.entities import ImageAsset
from omnigent.stores.image_store import ImageStore


def _to_entity(row: SqlImage) -> ImageAsset:
    """Convert a :class:`SqlImage` ORM row to an :class:`ImageAsset`."""
    return ImageAsset(
        id=row.id,
        conversation_id=row.conversation_id,
        filename=row.filename,
        mime=row.mime,
        artifact_key=row.artifact_key,
        width=row.width,
        height=row.height,
        bytes_size=row.bytes_size,
        edit_json=row.edit_json,
        created_at=row.created_at,
        updated_at=row.updated_at,
        created_by=row.created_by,
    )


class SqlAlchemyImageStore(ImageStore):
    """SQLAlchemy-backed implementation of :class:`ImageStore`."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the SQLAlchemy images store.

        :param storage_location: SQLAlchemy database URI.
        """
        super().__init__(storage_location)
        self._engine = get_or_create_engine(storage_location)
        self._session = make_managed_session_maker(self._engine)

    def get(self, image_id: str, conversation_id: str) -> ImageAsset | None:
        """Fetch a single image's metadata by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlImage, image_id)
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
        width: int = 0,
        height: int = 0,
        bytes_size: int = 0,
        created_by: str | None = None,
    ) -> ImageAsset:
        """Create and persist a new image metadata record."""
        created_us = now_epoch_us()
        row = SqlImage(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            filename=filename,
            mime=mime,
            artifact_key=artifact_key,
            width=width,
            height=height,
            bytes_size=bytes_size,
            edit_json=None,
            created_at=created_us // 1_000_000,
            updated_at=created_us,
            created_by=created_by,
        )
        with self._session() as session:
            session.add(row)
            return _to_entity(row)

    def list_for_conversation(self, conversation_id: str) -> list[ImageAsset]:
        """Return images for a conversation, newest-first."""
        stmt = (
            select(SqlImage)
            .where(SqlImage.conversation_id == conversation_id)
            .order_by(SqlImage.created_at.desc())
        )
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def update_edit(
        self,
        image_id: str,
        conversation_id: str,
        edit_json: str,
    ) -> ImageAsset | None:
        """Update the Fabric.js edit JSON for an image."""
        with self._session() as session:
            row = session.get(SqlImage, image_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            row.edit_json = edit_json
            row.updated_at = now_epoch_us()
            return _to_entity(row)

    def delete(self, image_id: str, conversation_id: str) -> ImageAsset | None:
        """Delete a single image metadata record by id."""
        with self._session() as session:
            row = session.get(SqlImage, image_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            entity = _to_entity(row)
            session.delete(row)
            return entity

    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all image metadata for a conversation."""
        with self._session() as session:
            result = session.execute(
                delete(SqlImage).where(SqlImage.conversation_id == conversation_id)
            )
            return int(result.rowcount or 0)