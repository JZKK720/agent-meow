"""Image store: manages per-session image metadata (Images surface).

Abstract base + SQLAlchemy implementation. Binary content lives in the
ArtifactStore; this store holds only metadata plus the optional Fabric.js
edit JSON.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from omnigent.entities import ImageAsset


class ImageStore(ABC):
    """Abstract base for image metadata persistence."""

    def __init__(self, storage_location: str) -> None:
        """Initialize the image store.

        :param storage_location: Backend-specific storage URI.
        """
        self.storage_location = storage_location

    @abstractmethod
    def get(self, image_id: str, conversation_id: str) -> ImageAsset | None:
        """Fetch a single image's metadata by id, scoped to a conversation."""
        ...

    @abstractmethod
    def add(
        self,
        conversation_id: str,
        filename: str,
        mime: str,
        artifact_key: str,
        *,
        width: int = 0,
        height: int = 0,
        bytes_size: int = 0,
        created_by: str | None = None,
    ) -> ImageAsset:
        """Create and persist a new image metadata record."""
        ...

    @abstractmethod
    def list_for_conversation(self, conversation_id: str) -> list[ImageAsset]:
        """Return all images for a conversation, newest-first."""
        ...

    @abstractmethod
    def update_edit(
        self,
        image_id: str,
        conversation_id: str,
        edit_json: str,
    ) -> ImageAsset | None:
        """Update the Fabric.js edit JSON for an image, scoped to a conversation."""
        ...

    @abstractmethod
    def delete(self, image_id: str, conversation_id: str) -> ImageAsset | None:
        """Delete a single image metadata record by id, scoped to a conversation."""
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all image metadata for a conversation. Returns the count deleted."""
        ...