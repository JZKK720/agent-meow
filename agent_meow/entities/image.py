"""Image asset domain entity for the Images surface.

An Image is a per-session image file with binary blob stored in the
``ArtifactStore`` and metadata in the ``image_store``. Images are exposed
via the ``/v1/sessions/{id}/resources/images`` routes.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ImageAsset:
    """Metadata for one image owned by a session/conversation.

    The binary content lives in the ``ArtifactStore`` under
    ``artifact_key``; this record holds only metadata.

    :param id: UUID primary key, e.g. ``"a1b2c3d4-..."``.
    :param conversation_id: Owning session/conversation id,
        e.g. ``"conv_abc123"``.
    :param filename: Original or user-supplied filename,
        e.g. ``"screenshot.png"``.
    :param mime: MIME type, e.g. ``"image/png"``.
    :param artifact_key: ArtifactStore key for the binary blob,
        e.g. ``"images/conv_abc/a1b2c3d4.png"``.
    :param width: Pixel width, or ``0`` when unknown.
    :param height: Pixel height, or ``0`` when unknown.
    :param bytes_size: Binary size in bytes.
    :param edit_json: Fabric.js canvas JSON for the last saved edit
        state, or ``None`` when no edits have been applied.
    :param created_at: Unix epoch seconds at row creation.
    :param updated_at: Unix epoch **microseconds** of the last mutation.
    :param created_by: Email of the creating user, or ``None`` in
        single-user mode.
    """

    id: str
    conversation_id: str
    filename: str
    mime: str
    artifact_key: str
    width: int = 0
    height: int = 0
    bytes_size: int = 0
    edit_json: str | None = None
    created_at: int = 0
    updated_at: int = 0
    created_by: str | None = None