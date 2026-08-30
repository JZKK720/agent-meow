"""File index entities for workspace-scoped file intelligence.

The file index is **workspace-scoped** (not conversation-scoped like
``file_tags``): a file dropped into a workspace is indexed once and is
visible to every session bound to that workspace. This is the storage
spine behind plan 039's auto-detect → EXIF → search → reveal pipeline.

``FileIndexEntry`` is one row of ``file_index``; the parsed metadata
(EXIF / document text excerpt / perceptual hash) lives in ``file_meta``
and is surfaced as ``meta`` (a JSON-decoded dict) on reads.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

# ── File kinds ──────────────────────────────────────────────────────────────

KIND_IMAGE = "image"
KIND_DOCUMENT = "document"
KIND_OTHER = "other"

# Extensions treated as images for metadata extraction (EXIF + dHash + thumb).
# Keep in sync with the watcher's watch list; documents get their own set.
IMAGE_EXTENSIONS = frozenset({".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".tif"})
# Document extensions for text extraction (pypdf / python-docx / plain).
DOCUMENT_EXTENSIONS = frozenset({".pdf", ".docx", ".txt", ".md", ".markdown", ".csv"})


def classify_kind(path: str) -> str:
    """Return the index kind (image|document|other) for a file path."""
    import os

    ext = os.path.splitext(path)[1].lower()
    if ext in IMAGE_EXTENSIONS:
        return KIND_IMAGE
    if ext in DOCUMENT_EXTENSIONS:
        return KIND_DOCUMENT
    return KIND_OTHER


# ── Statuses ────────────────────────────────────────────────────────────────

STATUS_PENDING = "pending"  # enqueued by the watcher, not yet processed
STATUS_PROCESSING = "processing"  # claimed by a meta worker
STATUS_INDEXED = "indexed"  # metadata extracted, searchable
STATUS_FAILED = "failed"  # extraction raised (error message stored)
STATUS_DUPLICATE = "duplicate"  # same content hash as an existing file
STATUS_GONE = "gone"  # path deleted since indexing


@dataclass(frozen=True)
class FileIndexEntry:
    """One indexed workspace file.

    :param id: UUID primary key.
    :param host_id: Runner host that owns the file, e.g. ``"host_abc"``.
        Empty string for the local (single-host) deployment.
    :param workspace: Absolute workspace root the file lives under — the
        index's partition key (shared across sessions of that workspace).
    :param path: Absolute file path.
    :param kind: ``image`` | ``document`` | ``other`` (see :func:`classify_kind`).
    :param size: File size in bytes at last observation.
    :param mtime_ns: Modification time (ns) at last observation.
    :param content_hash: dHash (images) / sha256-of-first-1MB (docs/other),
        computed by the meta worker; empty until indexed.
    :param status: Lifecycle status (see ``STATUS_*``).
    :param thumb_path: Thumbnail file path for images, or ``None``.
    :param error: Last extraction error message, or ``None``.
    :param indexed_at: Unix seconds of last successful index, 0 if never.
    :param created_at: Unix seconds the row was first enqueued.
    :param meta: Decoded ``file_meta.meta_json`` — EXIF/doc fields, or ``{}``.
    """

    id: str
    host_id: str
    workspace: str
    path: str
    kind: str
    size: int
    mtime_ns: int
    content_hash: str
    status: str
    thumb_path: str | None
    error: str | None
    indexed_at: int
    created_at: int
    meta: dict[str, Any] = field(default_factory=dict)
