"""Routes for per-session code snippets (agent-meow Code Snippets surface).

Snippets are reusable language-tagged code fragments owned by a
conversation, with description and comma-separated tags. The search
endpoint does a case-insensitive substring match across title, code,
description, and tags.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.entities import Snippet
from agent_meow.errors import AgentMeowError, ErrorCode
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ConversationStore
from agent_meow.stores.permission_store import PermissionStore
from agent_meow.stores.snippet_store import SnippetStore


def _snippet_to_dict(snippet: Snippet) -> dict[str, Any]:
    """Project a :class:`Snippet` to the API response shape."""
    return {
        "id": snippet.id,
        "object": "snippet",
        "conversation_id": snippet.conversation_id,
        "title": snippet.title,
        "language": snippet.language,
        "code": snippet.code,
        "description": snippet.description,
        "tags": snippet.tags,
        "created_at": snippet.created_at,
        "updated_at": snippet.updated_at,
        "created_by": snippet.created_by,
    }


class CreateSnippetRequest(BaseModel):
    """Request body for ``POST /sessions/{id}/resources/snippets``.

    :param title: Snippet title. Defaults to ``"Untitled"``.
    :param language: Language tag. Defaults to ``"text"``.
    :param code: The code text. Defaults to ``""``.
    :param description: Optional description. Defaults to ``""``.
    :param tags: Comma-separated tags. Defaults to ``""``.
    """

    title: str = "Untitled"
    language: str = "text"
    code: str = ""
    description: str = ""
    tags: str = ""


class UpdateSnippetRequest(BaseModel):
    """Request body for ``PATCH /sessions/{id}/resources/snippets/{snippet_id}``.

    All fields optional; ``None`` leaves the field unchanged.
    """

    title: str | None = None
    language: str | None = None
    code: str | None = None
    description: str | None = None
    tags: str | None = None


def create_snippets_router(
    store: SnippetStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the snippets router.

    All routes are scoped to ``/sessions/{session_id}/resources/snippets``.

    :param store: The shared :class:`SnippetStore` instance.
    :param auth_provider: Auth provider. ``None`` in single-user mode.
    :param permission_store: Permission store. ``None`` disables enforcement.
    :param conversation_store: Conversation store for session existence checks.
    :returns: A configured :class:`APIRouter`.
    """
    if permission_store is not None and conversation_store is None:
        raise ValueError("conversation_store is required when permission_store is provided")
    router = APIRouter()

    async def _require_session_access(user_id: str | None, session_id: str, level: int) -> None:
        """Require access and a real session before snippet mutations."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(user_id, session_id, level, permission_store, conversation_store)
        if conversation_store is not None:
            conversation = await asyncio.to_thread(conversation_store.get_conversation, session_id)
            if conversation is None:
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.post("/sessions/{session_id}/resources/snippets")
    async def create_snippet(
        request: Request,
        session_id: str,
        body: CreateSnippetRequest,
    ) -> dict[str, Any]:
        """Create a new snippet in a session."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        snippet = await asyncio.to_thread(
            store.add,
            session_id,
            body.title,
            language=body.language,
            code=body.code,
            description=body.description,
            tags=body.tags,
            created_by=created_by,
        )
        return _snippet_to_dict(snippet)

    @router.get("/sessions/{session_id}/resources/snippets")
    async def list_snippets(
        request: Request,
        session_id: str,
        language: str | None = None,
        tag: str | None = None,
    ) -> dict[str, Any]:
        """List snippets in a session, newest-first."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        snippets = await asyncio.to_thread(
            store.list_for_conversation, session_id, language=language, tag=tag
        )
        return {
            "object": "list",
            "data": [_snippet_to_dict(s) for s in snippets],
        }

    @router.get("/sessions/{session_id}/resources/snippets/search")
    async def search_snippets(
        request: Request,
        session_id: str,
        q: str,
    ) -> dict[str, Any]:
        """Search snippets by text in title, code, description, or tags."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        snippets = await asyncio.to_thread(store.search, session_id, q)
        return {
            "object": "list",
            "data": [_snippet_to_dict(s) for s in snippets],
        }

    @router.get("/sessions/{session_id}/resources/snippets/{snippet_id}")
    async def get_snippet(
        request: Request,
        session_id: str,
        snippet_id: str,
    ) -> dict[str, Any]:
        """Fetch a single snippet by id."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        snippet = await asyncio.to_thread(store.get, snippet_id, session_id)
        if snippet is None:
            raise AgentMeowError("Snippet not found", code=ErrorCode.NOT_FOUND)
        return _snippet_to_dict(snippet)

    @router.patch("/sessions/{session_id}/resources/snippets/{snippet_id}")
    async def update_snippet(
        request: Request,
        session_id: str,
        snippet_id: str,
        body: UpdateSnippetRequest,
    ) -> dict[str, Any]:
        """Update a snippet's fields."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        snippet = await asyncio.to_thread(
            store.update,
            snippet_id,
            session_id,
            title=body.title,
            language=body.language,
            code=body.code,
            description=body.description,
            tags=body.tags,
        )
        if snippet is None:
            raise AgentMeowError("Snippet not found", code=ErrorCode.NOT_FOUND)
        return _snippet_to_dict(snippet)

    @router.delete("/sessions/{session_id}/resources/snippets/{snippet_id}")
    async def delete_snippet(
        request: Request,
        session_id: str,
        snippet_id: str,
    ) -> dict[str, Any]:
        """Delete a snippet."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        snippet = await asyncio.to_thread(store.delete, snippet_id, session_id)
        if snippet is None:
            raise AgentMeowError("Snippet not found", code=ErrorCode.NOT_FOUND)
        return _snippet_to_dict(snippet)

    return router