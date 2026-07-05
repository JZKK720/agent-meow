"""Document domain entity for the Docs surface.

A Document is a per-session rich-text document with markdown + ProseMirror
JSON representations. Documents are managed by the ``document_store`` and
exposed via the ``/v1/sessions/{id}/resources/documents`` routes.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Document:
    """A single document owned by a session/conversation.

    :param id: UUID primary key, e.g. ``"a1b2c3d4-..."``.
    :param conversation_id: Owning session/conversation id,
        e.g. ``"conv_abc123"``.
    :param title: Human-readable document title, e.g. ``"Release Notes"``.
    :param format: Content format identifier. ``"markdown"`` or
        ``"prosemirror"`` (Tiptap JSON). Defaults to ``"markdown"``.
    :param content_md: Markdown text of the document body. ``""`` for a
        new document.
    :param content_json: ProseMirror JSON (Tiptap) of the document body.
        ``None`` when only markdown is stored.
    :param created_at: Unix epoch seconds at row creation.
    :param updated_at: Unix epoch **microseconds** of the last mutation;
        set at creation for never-edited documents.
    :param version: Monotonic version counter. Starts at 1, incremented
        on each update.
    :param created_by: Email of the creating user, or ``None`` in
        single-user mode.
    """

    id: str
    conversation_id: str
    title: str
    format: str = "markdown"
    content_md: str = ""
    content_json: str | None = None
    created_at: int = 0
    updated_at: int = 0
    version: int = 1
    created_by: str | None = None