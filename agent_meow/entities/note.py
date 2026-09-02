"""Note domain entity for the Notes surface.

A Note is a lightweight per-session markdown note — lighter than a
Document (no Tiptap, no ProseMirror JSON, just markdown). Notes can be
pinned and tagged for quick retrieval.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Note:
    """A single lightweight note owned by a session/conversation.

    :param id: UUID primary key, e.g. ``"a1b2c3d4-..."``.
    :param conversation_id: Owning session/conversation id,
        e.g. ``"conv_abc123"``.
    :param title: Human-readable note title, e.g. ``"TODO"``.
    :param body_md: Markdown body of the note. ``""`` for a new note.
    :param pinned: Whether the note is pinned to the top of the list.
    :param tags: Comma-separated tags, e.g. ``"api,ref"``. ``""`` for none.
    :param created_at: Unix epoch seconds at row creation.
    :param updated_at: Unix epoch **microseconds** of the last mutation;
        set at creation for never-edited notes.
    :param created_by: Email of the creating user, or ``None`` in
        single-user mode.
    """

    id: str
    conversation_id: str
    title: str
    body_md: str = ""
    pinned: bool = False
    tags: str = ""
    created_at: int = 0
    updated_at: int = 0
    created_by: str | None = None