"""Routes for per-session projects (agent-meow Projects surface).

Projects are lightweight named items owned by a conversation. Each has a
name, optional description, and status (active/archived/completed).
Distinct from the top-level ``/v1/projects`` routes which group sessions.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.entities import SessionProject
from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ConversationStore, SessionProjectStore
from agent_meow.stores.permission_store import PermissionStore

# ── Response models ───────────────────────────────────────────────────────────


def _project_to_dict(proj: SessionProject) -> dict[str, Any]:
    """Project a :class:`SessionProject` to the API response shape."""
    return {
        "id": proj.id,
        "object": "session_project",
        "conversation_id": proj.conversation_id,
        "name": proj.name,
        "description": proj.description,
        "status": proj.status,
        "created_at": proj.created_at,
        "updated_at": proj.updated_at,
        "created_by": proj.created_by,
    }


# ── Request models ────────────────────────────────────────────────────────────


class CreateSessionProjectRequest(BaseModel):
    """Request body for ``POST /sessions/{id}/resources/projects``."""

    name: str = "Untitled Project"
    description: str = ""
    status: str = "active"


class UpdateSessionProjectRequest(BaseModel):
    """Request body for ``PATCH /sessions/{id}/resources/projects/{project_id}``.

    All fields optional; ``None`` leaves the field unchanged.
    """

    name: str | None = None
    description: str | None = None
    status: str | None = None


# ── Router factory ────────────────────────────────────────────────────────────


def create_session_projects_router(
    store: SessionProjectStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the session-projects router.

    All routes are scoped to ``/sessions/{session_id}/resources/projects``.

    :param store: The shared :class:`SessionProjectStore` instance.
    :param auth_provider: Auth provider. ``None`` in single-user mode.
    :param permission_store: Permission store. ``None`` disables enforcement.
    :param conversation_store: Conversation store for session existence checks.
    :returns: A configured :class:`APIRouter`.
    """
    if permission_store is not None and conversation_store is None:
        raise ValueError(
            "conversation_store is required when permission_store is provided"
        )
    router = APIRouter()

    async def _require_session_access(
        user_id: str | None, session_id: str, level: int
    ) -> None:
        """Require access and a real session before project mutations."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(
                user_id, session_id, level, permission_store, conversation_store
            )
        if conversation_store is not None:
            conversation = await asyncio.to_thread(
                conversation_store.get_conversation, session_id
            )
            if conversation is None:
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.post("/sessions/{session_id}/resources/projects")
    async def create_project(
        request: Request,
        session_id: str,
        body: CreateSessionProjectRequest,
    ) -> dict[str, Any]:
        """Create a new project in a session."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        proj = await asyncio.to_thread(
            store.add,
            session_id,
            body.name,
            description=body.description,
            status=body.status,
            created_by=created_by,
        )
        return _project_to_dict(proj)

    @router.get("/sessions/{session_id}/resources/projects")
    async def list_projects(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """List all projects in a session, newest-first."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        projs = await asyncio.to_thread(store.list_for_conversation, session_id)
        return {
            "object": "list",
            "data": [_project_to_dict(p) for p in projs],
        }

    @router.get("/sessions/{session_id}/resources/projects/{project_id}")
    async def get_project(
        request: Request,
        session_id: str,
        project_id: str,
    ) -> dict[str, Any]:
        """Fetch a single project by id."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        proj = await asyncio.to_thread(store.get, project_id, session_id)
        if proj is None:
            raise AgentMeowError("Project not found", code=ErrorCode.NOT_FOUND)
        return _project_to_dict(proj)

    @router.patch("/sessions/{session_id}/resources/projects/{project_id}")
    async def update_project(
        request: Request,
        session_id: str,
        project_id: str,
        body: UpdateSessionProjectRequest,
    ) -> dict[str, Any]:
        """Update a project's name, description, and/or status."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        proj = await asyncio.to_thread(
            store.update,
            project_id,
            session_id,
            name=body.name,
            description=body.description,
            status=body.status,
        )
        if proj is None:
            raise AgentMeowError("Project not found", code=ErrorCode.NOT_FOUND)
        return _project_to_dict(proj)

    @router.delete("/sessions/{session_id}/resources/projects/{project_id}")
    async def delete_project(
        request: Request,
        session_id: str,
        project_id: str,
    ) -> dict[str, Any]:
        """Delete a project."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        proj = await asyncio.to_thread(store.delete, project_id, session_id)
        if proj is None:
            raise AgentMeowError("Project not found", code=ErrorCode.NOT_FOUND)
        return _project_to_dict(proj)

    return router