"""File tag store: manages per-session AI-generated file tags.

Abstract base + SQLAlchemy implementation. Tags are produced by the
agent's vision model and persisted via the runner's ``image_analyze``
tool dispatch handler. One row per (file, tag) pair.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from agent_meow.entities.file_tag import FileTag, TagEntry, TagSummary


class FileTagStore(ABC):
    """Abstract base for file tag persistence."""

    def __init__(self, storage_location: str) -> None:
        self.storage_location = storage_location

    @abstractmethod
    def upsert(
        self,
        conversation_id: str,
        file_path: str,
        tags: list[TagEntry],
        model: str,
    ) -> int:
        """Replace all tags for a given (conversation_id, file_path) pair.

        Deletes existing tags for that file, then inserts the new ones.
        Returns the number of tags inserted.
        """
        ...

    @abstractmethod
    def list_for_conversation(self, conversation_id: str) -> list[FileTag]:
        """Return all file tags for a conversation."""
        ...

    @abstractmethod
    def list_tags(self, conversation_id: str) -> list[TagSummary]:
        """Return unique tags with counts for a conversation."""
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all file tags for a conversation. Returns count deleted."""
        ...
