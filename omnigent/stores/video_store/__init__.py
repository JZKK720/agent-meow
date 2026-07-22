"""Video store: manages per-session video metadata (Video surface).

Abstract base + SQLAlchemy implementation. Binary content lives in the
ArtifactStore; this store holds only metadata.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from omnigent.entities import VideoAsset


class VideoStore(ABC):
    """Abstract base for video metadata persistence."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the video store.

        :param storage_location: Backend-specific storage URI.
        """
        self.storage_location = storage_location

    @abstractmethod
    def get(self, video_id: str, conversation_id: str) -> VideoAsset | None:
        """Fetch a single video's metadata by id, scoped to a conversation."""
        ...

    @abstractmethod
    def add(
        self,
        conversation_id: str,
        filename: str,
        mime: str,
        artifact_key: str,
        *,
        duration_seconds: float = 0.0,
        width: int = 0,
        height: int = 0,
        bytes_size: int = 0,
        created_by: str | None = None,
    ) -> VideoAsset:
        """Create and persist a new video metadata record."""
        ...

    @abstractmethod
    def list_for_conversation(self, conversation_id: str) -> list[VideoAsset]:
        """Return all videos for a conversation, newest-first."""
        ...

    @abstractmethod
    def delete(self, video_id: str, conversation_id: str) -> VideoAsset | None:
        """Delete a single video metadata record by id, scoped to a conversation."""
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all video metadata for a conversation. Returns the count deleted."""
        ...