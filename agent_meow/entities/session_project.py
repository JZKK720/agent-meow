"""SessionProject domain entity for the Projects surface.

A SessionProject is a per-session named project with a status, managed by
the ``project_store`` and exposed via
``/v1/sessions/{id}/resources/projects`` routes. Distinct from the
top-level ``Project`` entity which groups sessions.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SessionProject:
    """A single project owned by a session/conversation.

    :param id: UUID primary key, e.g. ``"a1b2c3d4-..."``.
    :param conversation_id: Owning session/conversation id,
        e.g. ``"conv_abc123"``.
    :param name: Human-readable project name, e.g. ``"Q3 Launch"``.
    :param description: Optional longer description. ``""`` when empty.
    :param status: Project status — ``"active"``, ``"archived"``, or
        ``"completed"``. Defaults to ``"active"``.
    :param created_at: Unix epoch seconds at row creation.
    :param updated_at: Unix epoch **microseconds** of the last mutation.
    :param created_by: Email of the creating user, or ``None`` in
        single-user mode.
    """

    id: str
    conversation_id: str
    name: str
    description: str = ""
    status: str = "active"
    created_at: int = 0
    updated_at: int = 0
    created_by: str | None = None