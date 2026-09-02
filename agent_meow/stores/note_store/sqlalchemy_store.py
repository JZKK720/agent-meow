"""SQLAlchemy-backed note store (agent-meow Notes surface)."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select

from agent_meow.db.db_models import SqlNote
from agent_meow.db.utils import (
    get_or_create_engine,
    make_managed_session_maker,
    now_epoch_us,
)
from agent_meow.entities import Note
from agent_meow.stores.note_store import NoteStore


def _to_entity(row: SqlNote) -> Note:
    """Convert a :class:`SqlNote` ORM row to a :class:`Note`.

    :param row: The SQLAlchemy ORM row to convert.
    :returns: A :class:`Note` dataclass instance.
    """
    return Note(
        id=row.id,
        conversation_id=row.conversation_id,
        title=row.title,
        body_md=row.body_md,
        pinned=row.pinned,
        tags=row.tags,
        created_at=row.created_at,
        updated_at=row.updated_at,
        created_by=row.created_by,
    )


class SqlAlchemyNoteStore(NoteStore):
    """SQLAlchemy-backed implementation of :class:`NoteStore`."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the SQLAlchemy notes store.

        :param storage_location: SQLAlchemy database URI,
            e.g. ``"sqlite:///agent-meow.db"``.
        """
        super().__init__(storage_location)
        self._engine = get_or_create_engine(storage_location)
        self._session = make_managed_session_maker(self._engine)

    def get(self, note_id: str, conversation_id: str) -> Note | None:
        """Fetch a single note by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlNote, note_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            return _to_entity(row)

    def add(
        self,
        conversation_id: str,
        title: str,
        *,
        body_md: str = "",
        pinned: bool = False,
        tags: str = "",
        created_by: str | None = None,
    ) -> Note:
        """Create and persist a new note."""
        created_us = now_epoch_us()
        row = SqlNote(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            title=title,
            body_md=body_md,
            pinned=pinned,
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
        pinned_only: bool = False,
        tag: str | None = None,
    ) -> list[Note]:
        """Return notes for a conversation, pinned-first then newest-first."""
        stmt = select(SqlNote).where(SqlNote.conversation_id == conversation_id)
        if pinned_only:
            stmt = stmt.where(SqlNote.pinned.is_(True))
        if tag:
            stmt = stmt.where(SqlNote.tags.contains(tag))
        stmt = stmt.order_by(SqlNote.pinned.desc(), SqlNote.updated_at.desc())
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def update(
        self,
        note_id: str,
        conversation_id: str,
        *,
        title: str | None = None,
        body_md: str | None = None,
        tags: str | None = None,
    ) -> Note | None:
        """Update mutable fields on a note, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlNote, note_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            if title is not None:
                row.title = title
            if body_md is not None:
                row.body_md = body_md
            if tags is not None:
                row.tags = tags
            row.updated_at = now_epoch_us()
            session.flush()
            return _to_entity(row)

    def set_pinned(self, note_id: str, conversation_id: str, pinned: bool) -> Note | None:
        """Set the pinned flag on a note."""
        with self._session() as session:
            row = session.get(SqlNote, note_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            row.pinned = pinned
            row.updated_at = now_epoch_us()
            session.flush()
            return _to_entity(row)

    def delete(self, note_id: str, conversation_id: str) -> Note | None:
        """Delete a note, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlNote, note_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            entity = _to_entity(row)
            session.delete(row)
            return entity

    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all notes for a conversation. Returns the count deleted."""
        with self._session() as session:
            result = session.execute(
                delete(SqlNote).where(SqlNote.conversation_id == conversation_id)
            )
            return int(result.rowcount or 0)  # type: ignore[attr-defined]