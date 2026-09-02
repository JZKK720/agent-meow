"""SQLAlchemy-backed document store (agent-meow Docs surface)."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select

from agent_meow.db.db_models import SqlDocument
from agent_meow.db.utils import (
    get_or_create_engine,
    make_managed_session_maker,
    now_epoch_us,
)
from agent_meow.entities import Document
from agent_meow.stores.document_store import DocumentStore


def _to_entity(row: SqlDocument) -> Document:
    """Convert a :class:`SqlDocument` ORM row to a :class:`Document`.

    :param row: The SQLAlchemy ORM row to convert.
    :returns: A :class:`Document` dataclass instance.
    """
    return Document(
        id=row.id,
        conversation_id=row.conversation_id,
        title=row.title,
        format=row.format,
        content_md=row.content_md,
        content_json=row.content_json,
        created_at=row.created_at,
        updated_at=row.updated_at,
        version=row.version,
        created_by=row.created_by,
        filename=row.filename,
        mime=row.mime,
        artifact_key=row.artifact_key,
        bytes_size=row.bytes_size or 0,
    )


class SqlAlchemyDocumentStore(DocumentStore):
    """SQLAlchemy-backed implementation of :class:`DocumentStore`."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the SQLAlchemy documents store.

        :param storage_location: SQLAlchemy database URI,
            e.g. ``"sqlite:///agent-meow.db"``.
        """
        super().__init__(storage_location)
        self._engine = get_or_create_engine(storage_location)
        self._session = make_managed_session_maker(self._engine)

    def get(self, document_id: str, conversation_id: str) -> Document | None:
        """Fetch a single document by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlDocument, document_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            return _to_entity(row)

    def add(
        self,
        conversation_id: str,
        title: str,
        *,
        format: str = "markdown",
        content_md: str = "",
        content_json: str | None = None,
        created_by: str | None = None,
        filename: str | None = None,
        mime: str | None = None,
        artifact_key: str | None = None,
        bytes_size: int = 0,
    ) -> Document:
        """Create and persist a new document."""
        created_us = now_epoch_us()
        row = SqlDocument(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            title=title,
            format=format,
            content_md=content_md,
            content_json=content_json,
            created_at=created_us // 1_000_000,
            updated_at=created_us,
            version=1,
            created_by=created_by,
            filename=filename,
            mime=mime,
            artifact_key=artifact_key,
            bytes_size=bytes_size,
        )
        with self._session() as session:
            session.add(row)
            return _to_entity(row)

    def list_for_conversation(self, conversation_id: str) -> list[Document]:
        """Return documents for a conversation, newest-first."""
        stmt = (
            select(SqlDocument)
            .where(SqlDocument.conversation_id == conversation_id)
            .order_by(SqlDocument.updated_at.desc())
        )
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def update(
        self,
        document_id: str,
        conversation_id: str,
        *,
        title: str | None = None,
        content_md: str | None = None,
        content_json: str | None = None,
    ) -> Document | None:
        """Update mutable fields on a document, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlDocument, document_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            if title is not None:
                row.title = title
            if content_md is not None:
                row.content_md = content_md
            if content_json is not None:
                row.content_json = content_json
            row.updated_at = now_epoch_us()
            row.version = (row.version or 1) + 1
            return _to_entity(row)

    def delete(self, document_id: str, conversation_id: str) -> Document | None:
        """Delete a single document by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlDocument, document_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            entity = _to_entity(row)
            session.delete(row)
            return entity

    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all documents for a conversation. Returns the count deleted."""
        with self._session() as session:
            result = session.execute(
                delete(SqlDocument).where(SqlDocument.conversation_id == conversation_id)
            )
            return int(result.rowcount or 0)