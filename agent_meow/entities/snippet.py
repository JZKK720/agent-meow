"""Snippet domain entity for the Code Snippets surface.

A Snippet is a per-session reusable code snippet with language tagging,
description, and comma-separated tags. Agents can save code patterns
and users can search and insert them into terminals or editors.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Snippet:
    """A single code snippet owned by a session/conversation.

    :param id: UUID primary key, e.g. ``"a1b2c3d4-..."``.
    :param conversation_id: Owning session/conversation id.
    :param title: Human-readable snippet title, e.g. ``"Flask route"``.
    :param language: Programming language tag, e.g. ``"python"``.
    :param code: The code text.
    :param description: Optional description of what the snippet does.
    :param tags: Comma-separated tags, e.g. ``"web,api"``.
    :param created_at: Unix epoch seconds at row creation.
    :param updated_at: Unix epoch **microseconds** of the last mutation.
    :param created_by: Email of the creating user, or ``None`` in
        single-user mode.
    """

    id: str
    conversation_id: str
    title: str
    language: str = "text"
    code: str = ""
    description: str = ""
    tags: str = ""
    created_at: int = 0
    updated_at: int = 0
    created_by: str | None = None