"""Note store: manages per-session lightweight notes (Notes surface).

Abstract base + SQLAlchemy implementation. Mirrors the DocumentStore
pattern: a storage-location-agnostic base with a SqlAlchemy backend.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from agent_meow.entities import Note


class NoteStore(ABC):
    """Abstract base for note persistence.

    Manages the lifecycle of per-session notes: creation,
    listing, fetching, updating, pinning, and deletion.
    """

    def __init__(self, storage_location: str) -> None:
        """Initialize the note store.

        :param storage_location: Backend-specific storage URI,
            e.g. ``"sqlite:///chat.db"`` for SQLAlchemy.
        """
        self.storage_location = storage_location

    @abstractmethod
    def get(self, note_id: str, conversation_id: str) -> Note | None:
        """Fetch a single note by id, scoped to a conversation.

        :param note_id: The note to fetch.
        :param conversation_id: The conversation the note must belong to.
        :returns: The :class:`Note`, or ``None`` if not found.
        """
        ...

    @abstractmethod
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
        """Create and persist a new note.

        :param conversation_id: Owning conversation id.
        :param title: Note title.
        :param body_md: Markdown body. Defaults to ``""``.
        :param pinned: Whether the note is pinned. Defaults to ``False``.
        :param tags: Comma-separated tags. Defaults to ``""``.
        :param created_by: Email of the creating user, or ``None``.
        :returns: The newly created :class:`Note`.
        """
        ...

    @abstractmethod
    def list_for_conversation(
        self,
        conversation_id: str,
        *,
        pinned_only: bool = False,
        tag: str | None = None,
    ) -> list[Note]:
        """Return notes for a conversation, pinned-first then newest-first.

        :param conversation_id: The conversation to list notes for.
        :param pinned_only: If True, return only pinned notes.
        :param tag: If set, filter to notes containing this tag.
        :returns: List of :class:`Note` instances.
        """
        ...

    @abstractmethod
    def update(
        self,
        note_id: str,
        conversation_id: str,
        *,
        title: str | None = None,
        body_md: str | None = None,
        tags: str | None = None,
    ) -> Note | None:
        """Update mutable fields on a note, scoped to a conversation.

        :param note_id: The note to update.
        :param conversation_id: The conversation the note must belong to.
        :param title: New title, or ``None`` to leave unchanged.
        :param body_md: New markdown body, or ``None`` to leave unchanged.
        :param tags: New tags string, or ``None`` to leave unchanged.
        :returns: The updated :class:`Note`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def set_pinned(self, note_id: str, conversation_id: str, pinned: bool) -> Note | None:
        """Set the pinned flag on a note.

        :param note_id: The note to pin/unpin.
        :param conversation_id: The conversation the note must belong to.
        :param pinned: The new pinned state.
        :returns: The updated :class:`Note`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def delete(self, note_id: str, conversation_id: str) -> Note | None:
        """Delete a note, scoped to a conversation.

        :param note_id: The note to delete.
        :param conversation_id: The conversation the note must belong to.
        :returns: The deleted :class:`Note`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all notes for a conversation. Returns the count deleted.

        :param conversation_id: The conversation to clean up.
        :returns: Number of notes deleted.
        """
        ...