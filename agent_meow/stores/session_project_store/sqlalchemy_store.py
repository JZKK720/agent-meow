"""SQLAlchemy-backed session-project store (agent-meow Projects surface)."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select

from agent_meow.db.db_models import SqlSessionProject
from agent_meow.db.utils import (
    get_or_create_engine,
    make_managed_session_maker,
    now_epoch_us,
)
from agent_meow.entities import SessionProject
from agent_meow.stores.session_project_store import SessionProjectStore


def _to_entity(row: SqlSessionProject) -> SessionProject:
    """Convert a :class:`SqlSessionProject` ORM row to a :class:`SessionProject`."""
    return SessionProject(
        id=row.id,
        conversation_id=row.conversation_id,
        name=row.name,
        description=row.description,
        status=row.status,
        created_at=row.created_at,
        updated_at=row.updated_at,
        created_by=row.created_by,
    )


class SqlAlchemySessionProjectStore(SessionProjectStore):
    """SQLAlchemy-backed implementation of :class:`SessionProjectStore`."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the SQLAlchemy session-projects store.

        :param storage_location: SQLAlchemy database URI,
            e.g. ``"sqlite:///agent-meow.db"``.
        """
        super().__init__(storage_location)
        self._engine = get_or_create_engine(storage_location)
        self._session = make_managed_session_maker(self._engine)

    def get(self, project_id: str, conversation_id: str) -> SessionProject | None:
        """Fetch a single project by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlSessionProject, project_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            return _to_entity(row)

    def add(
        self,
        conversation_id: str,
        name: str,
        *,
        description: str = "",
        status: str = "active",
        created_by: str | None = None,
    ) -> SessionProject:
        """Create and persist a new project."""
        created_us = now_epoch_us()
        row = SqlSessionProject(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            name=name,
            description=description,
            status=status,
            created_at=created_us // 1_000_000,
            updated_at=created_us,
            created_by=created_by,
        )
        with self._session() as session:
            session.add(row)
            return _to_entity(row)

    def list_for_conversation(self, conversation_id: str) -> list[SessionProject]:
        """Return projects for a conversation, newest-first."""
        stmt = (
            select(SqlSessionProject)
            .where(SqlSessionProject.conversation_id == conversation_id)
            .order_by(SqlSessionProject.updated_at.desc())
        )
        with self._session() as session:
            rows = list(session.execute(stmt).scalars().all())
            return [_to_entity(r) for r in rows]

    def update(
        self,
        project_id: str,
        conversation_id: str,
        *,
        name: str | None = None,
        description: str | None = None,
        status: str | None = None,
    ) -> SessionProject | None:
        """Update mutable fields on a project, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlSessionProject, project_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            if name is not None:
                row.name = name
            if description is not None:
                row.description = description
            if status is not None:
                row.status = status
            row.updated_at = now_epoch_us()
            return _to_entity(row)

    def delete(self, project_id: str, conversation_id: str) -> SessionProject | None:
        """Delete a single project by id, scoped to a conversation."""
        with self._session() as session:
            row = session.get(SqlSessionProject, project_id)
            if row is None or row.conversation_id != conversation_id:
                return None
            entity = _to_entity(row)
            session.delete(row)
            return entity

    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all projects for a conversation. Returns the count deleted."""
        with self._session() as session:
            result = session.execute(
                delete(SqlSessionProject).where(
                    SqlSessionProject.conversation_id == conversation_id
                )
            )
            return int(result.rowcount or 0)