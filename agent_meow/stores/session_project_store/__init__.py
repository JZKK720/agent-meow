"""Session-project store: manages per-session projects (Projects surface).

Abstract base + SQLAlchemy implementation. Mirrors the DocumentStore
pattern: a storage-location-agnostic base with a SqlAlchemy backend.
Distinct from the top-level ``ProjectStore`` which groups sessions.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from agent_meow.entities import SessionProject


class SessionProjectStore(ABC):
    """Abstract base for per-session project persistence.

    Manages the lifecycle of per-session projects: creation,
    listing, fetching, updating, and deletion.
    """

    def __init__(self, storage_location: str) -> None:
        """Initialize the session-project store.

        :param storage_location: Backend-specific storage URI,
            e.g. ``"sqlite:///chat.db"`` for SQLAlchemy.
        """
        self.storage_location = storage_location

    @abstractmethod
    def get(self, project_id: str, conversation_id: str) -> SessionProject | None:
        """Fetch a single project by id, scoped to a conversation."""
        ...

    @abstractmethod
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
        ...

    @abstractmethod
    def list_for_conversation(self, conversation_id: str) -> list[SessionProject]:
        """Return all projects for a conversation, newest-first."""
        ...

    @abstractmethod
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
        ...

    @abstractmethod
    def delete(self, project_id: str, conversation_id: str) -> SessionProject | None:
        """Delete a single project by id, scoped to a conversation."""
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all projects for a conversation. Returns the count deleted."""
        ...