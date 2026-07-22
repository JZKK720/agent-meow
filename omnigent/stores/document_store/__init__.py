"""Document store: manages per-session rich-text documents (Docs surface).

Abstract base + SQLAlchemy implementation. Mirrors the CommentStore
pattern: a storage-location-agnostic base with a SqlAlchemy backend.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from omnigent.entities import Document


class DocumentStore(ABC):
    """Abstract base for document persistence.

    Manages the lifecycle of per-session documents: creation,
    listing, fetching, updating, and deletion.
    """

    def __init__(self, storage_location: str) -> None:
        """Initialize the document store.

        :param storage_location: Backend-specific storage URI,
            e.g. ``"sqlite:///chat.db"`` for SQLAlchemy.
        """
        self.storage_location = storage_location

    @abstractmethod
    def get(self, document_id: str, conversation_id: str) -> Document | None:
        """Fetch a single document by id, scoped to a conversation.

        :param document_id: The document to fetch.
        :param conversation_id: The conversation the document must belong to.
        :returns: The :class:`Document`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def add(
        self,
        conversation_id: str,
        title: str,
        *,
        format: str = "markdown",
        content_md: str = "",
        content_json: str | None = None,
        created_by: str | None = None,
    ) -> Document:
        """Create and persist a new document.

        :param conversation_id: Owning conversation id.
        :param title: Document title.
        :param format: Content format — ``"markdown"`` or ``"prosemirror"``.
        :param content_md: Markdown body. Defaults to ``""``.
        :param content_json: ProseMirror JSON body, or ``None``.
        :param created_by: Email of the creating user, or ``None``.
        :returns: The newly created :class:`Document`.
        """
        ...

    @abstractmethod
    def list_for_conversation(self, conversation_id: str) -> list[Document]:
        """Return all documents for a conversation, ordered by ``updated_at`` desc.

        :param conversation_id: The conversation to query.
        :returns: List of :class:`Document` objects.
        """
        ...

    @abstractmethod
    def update(
        self,
        document_id: str,
        conversation_id: str,
        *,
        title: str | None = None,
        content_md: str | None = None,
        content_json: str | None = None,
    ) -> Document | None:
        """Update mutable fields on a document, scoped to a conversation.

        Bumps ``version`` and ``updated_at`` on every successful update.

        :param document_id: The document to update.
        :param conversation_id: The conversation the document must belong to.
        :param title: New title, or ``None`` to leave unchanged.
        :param content_md: New markdown body, or ``None`` to leave unchanged.
        :param content_json: New ProseMirror JSON, or ``None`` to leave unchanged.
        :returns: The updated :class:`Document`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def delete(self, document_id: str, conversation_id: str) -> Document | None:
        """Delete a single document by id, scoped to a conversation.

        :param document_id: The document to delete.
        :param conversation_id: The conversation the document must belong to.
        :returns: The deleted :class:`Document`, or ``None`` if not found.
        """
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all documents for a conversation. Returns the count deleted.

        :param conversation_id: The conversation to clean up.
        :returns: Number of documents deleted.
        """
        ...