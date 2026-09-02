"""SQLAlchemy-backed snippet store (agent-meow Code Snippets surface)."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, or_, select

from agent_meow.db.db_models import SqlSnippet
from agent_meow.db.utils import (
    get_or_create_engine,
    make_managed_session_maker,
    now_epoch_us,
)
from agent_meow.entities import Snippet
from agent_meow.stores.snippet_store import SnippetStore


def _to_entity(row: SqlSnippet) -> Snippet:
    """Convert a :class:`SqlSnippet` ORM row to a :class:`Snippet`.

    :param row: The SQLAlchemy ORM row to convert.
    :returns: A :class:`Snippet` dataclass instance.
    """
    return Snippet(
        id=row.id,
        conversation_id=row.conversation_id,
        title=row.title,
        language=row.language,
        code=row.code,
        description=row.description,
        tags=row.tags,
        created_at=row.created_at,
        updated_at=row.updated_at,
        created_by=row.created_by,
    )


class SqlAlchemySnippetStore(SnippetStore):
    """SQLAlchemy-backed implementation of :class:`SnippetStore`."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the SQLAlchemy snippets store.

        :param storage_location: SQLAlchemy database URI,
            e.g. ``"sqlite:///agent-meow.db"``.
        """
        super().__init__(storage_location)
        self._engine = get_or_create_engine(storage_location)
        self._session = make_managed_session_maker(self._engine)

    def get(self, snippet_id: str, conversation_id: str) -> Snippet | None:
        """Fetch a single snippet by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlSnippet, snippet_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            return _to_entity(row)

    def add(
        self,
        conversation_id: str,
        title: str,
        *,
        language: str = "text",
        code: str = "",
        description: str = "",
        tags: str = "",
        created_by: str | None = None,
    ) -> Snippet:
        """Create and persist a new snippet."""
        created_us = now_epoch_us()
        row = SqlSnippet(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            title=title,
            language=language,
            code=code,
            description=description,
            tags=tags,
            created_at=created_us // 1_000_000,
            updated_at=created_us,
            created_by=created_by,
        )
        with self._session() as session:
            session.add(row)
            return _to_entity(row)

    def list_for_conversation(
        self,
        conversation_id: str,
        *,
        language: str | None = None,
        tag: str | None = None,
    ) -> list[Snippet]:
        """Return snippets for a conversation, newest-first."""
        stmt = select(SqlSnippet).where(SqlSnippet.conversation_id == conversation_id)
        if language:
            stmt = stmt.where(SqlSnippet.language == language)
        if tag:
            stmt = stmt.where(SqlSnippet.tags.contains(tag))
        stmt = stmt.order_by(SqlSnippet.updated_at.desc())
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def search(self, conversation_id: str, query: str) -> list[Snippet]:
        """Search snippets by text in title, code, description, or tags."""
        pattern = f"%{query}%"
        stmt = select(SqlSnippet).where(
            SqlSnippet.conversation_id == conversation_id,
            or_(
                SqlSnippet.title.ilike(pattern),
                SqlSnippet.code.ilike(pattern),
                SqlSnippet.description.ilike(pattern),
                SqlSnippet.tags.ilike(pattern),
            ),
        )
        stmt = stmt.order_by(SqlSnippet.updated_at.desc())
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def update(
        self,
        snippet_id: str,
        conversation_id: str,
        *,
        title: str | None = None,
        language: str | None = None,
        code: str | None = None,
        description: str | None = None,
        tags: str | None = None,
    ) -> Snippet | None:
        """Update mutable fields on a snippet, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlSnippet, snippet_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            if title is not None:
                row.title = title
            if language is not None:
                row.language = language
            if code is not None:
                row.code = code
            if description is not None:
                row.description = description
            if tags is not None:
                row.tags = tags
            row.updated_at = now_epoch_us()
            session.flush()
            return _to_entity(row)

    def delete(self, snippet_id: str, conversation_id: str) -> Snippet | None:
        """Delete a snippet, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlSnippet, snippet_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            entity = _to_entity(row)
            session.delete(row)
            return entity

    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all snippets for a conversation. Returns the count deleted."""
        with self._session() as session:
            result = session.execute(
                delete(SqlSnippet).where(SqlSnippet.conversation_id == conversation_id)
            )
            return int(result.rowcount or 0)  # type: ignore[attr-defined]