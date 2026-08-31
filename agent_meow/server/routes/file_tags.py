"""File tags route — read-only tag query endpoint.

GET /v1/sessions/{id}/resources/tags
    Returns all unique tags with counts for the session, used by the
    FilesPanel tag-filter UI. Tags are populated by the agent calling
    the ``image_analyze`` tool (runner-dispatched), not by this endpoint.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id, require_access
from agent_meow.stores import ConversationStore
from agent_meow.stores.file_tag_store import FileTagStore
from agent_meow.stores.permission_store import PermissionStore

logger = logging.getLogger(__name__)


class TagSummaryWire(BaseModel):
    """One tag with its file count, for the tag-filter UI."""

    tag: str
    count: int


class TagsResponse(BaseModel):
    """All tags for a session."""

    tags: list[TagSummaryWire] = []


def create_file_tags_router(
    file_tag_store: FileTagStore,
    conversation_store: ConversationStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
) -> APIRouter:
    """Build the file tags router.

    :returns: A configured :class:`APIRouter` with the GET /resources/tags endpoint.
    """
    router = APIRouter()

    async def _require_session(user_id: str | None, session_id: str) -> None:
        if permission_store is not None:
            await require_access(
                user_id, session_id, None, permission_store, conversation_store
            )
        conversation = conversation_store.get_conversation(session_id)
        if conversation is None:
            raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.get("/sessions/{session_id}/resources/tags")
    async def get_tags(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """Return all unique tags with file counts for the session."""
        user_id = get_user_id(request, auth_provider)
        await _require_session(user_id, session_id)

        summaries = file_tag_store.list_tags(session_id)
        return {
            "object": "tags_response",
            "session_id": session_id,
            "tags": [{"tag": s.tag, "count": s.count} for s in summaries],
        }

    @router.get("/sessions/{session_id}/resources/tags/by-file")
    async def get_tags_by_file(
        request: Request,
        session_id: str,
        filename: str,
    ) -> dict[str, Any]:
        """Return all tags for one file (matched by trailing path segment).

        Used by the ImagesPanel to surface AI-generated tags on each gallery
        thumbnail. The panel only knows the uploaded image's ``filename``;
        the agent stores tags under a workspace-relative or absolute path, so
        the store matches on the basename.
        """
        user_id = get_user_id(request, auth_provider)
        await _require_session(user_id, session_id)

        tags = file_tag_store.list_for_file(session_id, filename)
        return {
            "object": "file_tags_response",
            "session_id": session_id,
            "filename": filename,
            "tags": [
                {
                    "tag": t.tag,
                    "confidence": t.confidence,
                    "description": t.description,
                    "model": t.model,
                }
                for t in tags
            ],
        }

    @router.get("/sessions/{session_id}/resources/tags/by-session")
    async def get_all_tags_grouped(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """Return all tags for a session grouped by file basename.

        One query for the whole ImagesPanel gallery — the panel keys its
        thumbnails by uploaded-image ``filename`` (a basename), while the
        agent stores tags under workspace-relative or absolute paths. This
        endpoint returns ``{basename: [{tag, confidence, ...}]}`` so the
        panel can look up tags per thumbnail without N round-trips.
        """
        import os

        user_id = get_user_id(request, auth_provider)
        await _require_session(user_id, session_id)

        all_tags = file_tag_store.list_all_for_conversation(session_id)
        grouped: dict[str, list[dict[str, Any]]] = {}
        for t in all_tags:
            base = os.path.basename(t.file_path.replace("\\", "/"))
            grouped.setdefault(base, []).append(
                {
                    "tag": t.tag,
                    "confidence": t.confidence,
                    "description": t.description,
                    "model": t.model,
                }
            )
        return {
            "object": "session_tags_response",
            "session_id": session_id,
            "tags_by_file": grouped,
        }

    return router
