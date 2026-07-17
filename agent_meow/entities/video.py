"""Video asset domain entity for the Video surface.

A Video is a per-session video file with binary blob stored in the
``ArtifactStore`` and metadata in the ``video_store``. Videos are exposed
via the ``/v1/sessions/{id}/resources/videos`` routes.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VideoAsset:
    """Metadata for one video owned by a session/conversation.

    The binary content lives in the ``ArtifactStore`` under
    ``artifact_key``; this record holds only metadata.

    :param id: UUID primary key, e.g. ``"a1b2c3d4-..."``.
    :param conversation_id: Owning session/conversation id,
        e.g. ``"conv_abc123"``.
    :param filename: Original or user-supplied filename,
        e.g. ``"generated.mp4"``.
    :param mime: MIME type, e.g. ``"video/mp4"``.
    :param artifact_key: ArtifactStore key for the binary blob,
        e.g. ``"videos/conv_abc/a1b2c3d4.mp4"``.
    :param duration_seconds: Video duration in seconds, or ``0.0`` when unknown.
    :param width: Pixel width, or ``0`` when unknown.
    :param height: Pixel height, or ``0`` when unknown.
    :param bytes_size: Binary size in bytes.
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
    duration_seconds: float = 0.0
    width: int = 0
    height: int = 0
    bytes_size: int = 0
    created_at: int = 0
    updated_at: int = 0
    created_by: str | None = None