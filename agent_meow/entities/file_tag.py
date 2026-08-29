"""File tag entity for vision model image classification.

Each ``FileTag`` records one AI-generated tag for one workspace image file.
Multiple tags per file are stored as separate rows (one per tag). The agent
generates tags from its vision model context, then calls the ``image_analyze``
tool to persist them via the runner dispatch.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FileTag:
    """One AI-generated tag for one file.

    :param id: UUID primary key.
    :param conversation_id: Owning session/conversation id.
    :param file_path: Absolute or workspace-relative path of the tagged file.
    :param tag: Classification label, e.g. ``"cat"``, ``"outdoor"``.
    :param confidence: Model confidence score, 0.0-1.0.
    :param description: Optional natural-language description from the model.
    :param model: Model name that produced the tag, e.g. ``"gemma4:26b"``.
    :param analyzed_at: Unix epoch seconds when the tag was stored.
    """

    id: str
    conversation_id: str
    file_path: str
    tag: str
    confidence: float
    description: str | None
    model: str
    analyzed_at: int


@dataclass(frozen=True)
class TagEntry:
    """Input tag for :meth:`FileTagStore.upsert` — no id/timestamp."""

    tag: str
    confidence: float
    description: str | None


@dataclass(frozen=True)
class TagSummary:
    """Aggregated tag count for the tag-filter UI."""

    tag: str
    count: int
