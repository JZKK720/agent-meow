"""Snippet store: manages per-session code snippets (Code Snippets surface).

Abstract base + SQLAlchemy implementation. Mirrors the NoteStore pattern.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from agent_meow.entities import Snippet


class SnippetStore(ABC):
    """Abstract base for snippet persistence.

    Manages the lifecycle of per-session snippets: creation, listing,
    searching, fetching, updating, and deletion.
    """

    def __init__(self, storage_location: str) -> None:
        """Initialize the snippet store.

        :param storage_location: Backend-specific storage URI,
            e.g. ``"sqlite:///chat.db"`` for SQLAlchemy.
        """
        self.storage_location = storage_location

    @abstractmethod
    def get(self, snippet_id: str, conversation_id: str) -> Snippet | None:
        """Fetch a single snippet by id, scoped to a conversation.

        :param snippet_id: The snippet to fetch.
        :param conversation_id: The conversation the snippet must belong to.
        :returns: The :class:`Snippet`, or ``None`` if not found.
        """
        ...

    @abstractmethod
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
        """Create and persist a new snippet.

        :param conversation_id: Owning conversation id.
        :param title: Snippet title.
        :param language: Programming language tag. Defaults to ``"text"``.
        :param code: The code text. Defaults to ``""``.
        :param description: Optional description. Defaults to ``""``.
        :param tags: Comma-separated tags. Defaults to ``""``.
        :param created_by: Email of the creating user, or ``None``.
        :returns: The newly created :class:`Snippet`.
        """
        ...

    @abstractmethod
    def list_for_conversation(
        self,
        conversation_id: str,
        *,
        language: str | None = None,
        tag: str | None = None,
    ) -> list[Snippet]:
        """Return snippets for a conversation, newest-first.

        :param conversation_id: The conversation to list snippets for.
        :param language: If set, filter to snippets with this language.
        :param tag: If set, filter to snippets containing this tag.
        :returns: List of :class:`Snippet` instances.
        """
        ...

    @abstractmethod
    def search(self, conversation_id: str, query: str) -> list[Snippet]:
        """Search snippets by text in title, code, description, or tags.

        :param conversation_id: The conversation to search in.
        :param query: Search query (case-insensitive substring match).
        :returns: List of matching :class:`Snippet` instances.
        """
        ...

    @abstractmethod
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
        """Update mutable fields on a snippet, scoped to a conversation.

        :param snippet_id: The snippet to update.
        :param conversation_id: The conversation the snippet must belong to.
        :param title: New title, or ``None`` to leave unchanged.
        :param language: New language, or ``None`` to leave unchanged.
        :param code: New code, or ``None`` to leave unchanged.
        :param description: New description, or ``None`` to leave unchanged.
        :param tags: New tags, or ``None`` to leave unchanged.
        :returns: The updated :class:`Snippet`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def delete(self, snippet_id: str, conversation_id: str) -> Snippet | None:
        """Delete a snippet, scoped to a conversation.

        :param snippet_id: The snippet to delete.
        :param conversation_id: The conversation the snippet must belong to.
        :returns: The deleted :class:`Snippet`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all snippets for a conversation. Returns the count deleted.

        :param conversation_id: The conversation to clean up.
        :returns: Number of snippets deleted.
        """
        ...