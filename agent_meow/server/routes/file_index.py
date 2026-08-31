"""File index route — read-only workspace file index query (plan 039 P0).

GET /v1/sessions/{id}/resources/file-index
    Returns the indexed files for the session's workspace (metadata:
    EXIF, dimensions, kind, status, thumbnail path) plus a status
    histogram the FilesPanel uses for its progress chip. The index is
    populated by the runner's file watcher + metadata worker, never by
    this endpoint.

GET /v1/sessions/{id}/resources/file-index/stats
    Just the status counts (pending/indexed/duplicate/failed/gone).

Scoping: the runner writes rows with host_id="" (the local single-host
deployment); this read path queries the same. Multi-host workspaces are
a documented follow-up (the index schema already carries host_id).
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.errors import AgentMeowError, ErrorCode
from agent_meow.server.auth import LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id, require_access
from agent_meow.stores import ConversationStore
from agent_meow.stores.file_index_store import FileIndexStore
from agent_meow.stores.permission_store import PermissionStore

# Cap so a huge workspace doesn't blow up the panel's first paint.
_MAX_LIST = 1000


def _resolve_index_workspace(workspace: str | None) -> str | None:
    """Map a session's stored workspace to the path the runner indexed under.

    The web UI sends the default workspace as a raw ``~/…`` string (the
    server must not guess the host OS by expanding client-side), while
    the runner's watcher writes rows keyed by its own resolved absolute
    path. On a local server+runner pair (the deployment where the index
    lives in the same chat.db) ``expanduser`` reproduces that path; a
    non-existent expansion means a remote host, so fall back to the raw
    value and let the query return empty rather than wrong rows.
    """
    if not workspace:
        return None
    expanded = os.path.expanduser(workspace)
    if expanded != workspace and os.path.isdir(expanded):
        return expanded
    return workspace


class FileIndexEntryWire(BaseModel):
    """One indexed file for the panel."""

    path: str
    kind: str
    size: int
    status: str
    content_hash: str
    thumb_path: str | None
    error: str | None
    indexed_at: int
    meta: dict[str, Any] = {}


class FileIndexResponse(BaseModel):
    """The indexed files + status histogram for a workspace."""

    object: str = "file_index_response"
    session_id: str
    workspace: str | None
    files: list[FileIndexEntryWire] = []
    counts: dict[str, int] = {}


class FileSearchResultWire(BaseModel):
    """One ranked search hit."""

    path: str
    kind: str
    size: int
    status: str
    content_hash: str
    thumb_path: str | None
    error: str | None
    indexed_at: int
    meta: dict[str, Any] = {}
    score: float = 0.0


class FileSearchResponse(BaseModel):
    """Ranked search results for a workspace file query."""

    object: str = "file_search_response"
    session_id: str
    workspace: str | None
    query: str
    kind: str | None = None
    results: list[FileSearchResultWire] = []


def create_file_index_router(
    file_index_store: FileIndexStore,
    conversation_store: ConversationStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
) -> APIRouter:
    """Build the file index router.

    :returns: A configured :class:`APIRouter` with the two GET endpoints.
    """
    router = APIRouter()

    async def _resolve_workspace(user_id: str | None, session_id: str) -> str | None:
        """Authorize the session and return its bound workspace (or None)."""
        if permission_store is not None:
            await require_access(
                user_id, session_id, LEVEL_READ, permission_store, conversation_store
            )
        conversation = conversation_store.get_conversation(session_id)
        if conversation is None:
            raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)
        # Expand ~/… to the host-absolute path the runner's watcher keyed
        # rows under (see _resolve_index_workspace).
        return _resolve_index_workspace(conversation.workspace)

    @router.get("/sessions/{session_id}/resources/file-index")
    async def get_file_index(
        request: Request,
        session_id: str,
        kind: str | None = None,
        limit: int = 200,
        offset: int = 0,
    ) -> dict[str, Any]:
        """Return indexed files for the session's workspace."""
        user_id = get_user_id(request, auth_provider)
        workspace = await _resolve_workspace(user_id, session_id)
        if workspace is None:
            return FileIndexResponse(session_id=session_id, workspace=None).model_dump()
        bounded = max(1, min(limit, _MAX_LIST))
        entries = file_index_store.list_workspace(
            host_id="", workspace=workspace, kind=kind, limit=bounded, offset=offset
        )
        counts = file_index_store.count_by_status(host_id="", workspace=workspace)
        return FileIndexResponse(
            session_id=session_id,
            workspace=workspace,
            files=[
                FileIndexEntryWire(
                    path=e.path,
                    kind=e.kind,
                    size=e.size,
                    status=e.status,
                    content_hash=e.content_hash,
                    thumb_path=e.thumb_path,
                    error=e.error,
                    indexed_at=e.indexed_at,
                    meta=e.meta,
                )
                for e in entries
            ],
            counts=counts,
        ).model_dump()

    @router.get("/sessions/{session_id}/resources/file-index/stats")
    async def get_file_index_stats(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """Return just the status histogram for the session's workspace."""
        user_id = get_user_id(request, auth_provider)
        workspace = await _resolve_workspace(user_id, session_id)
        counts: dict[str, int] = {}
        if workspace is not None:
            counts = file_index_store.count_by_status(host_id="", workspace=workspace)
        return {
            "object": "file_index_stats",
            "session_id": session_id,
            "workspace": workspace,
            "counts": counts,
        }

    @router.get("/sessions/{session_id}/resources/file-search")
    async def search_files(
        request: Request,
        session_id: str,
        q: str,
        kind: str | None = None,
        limit: int = 50,
    ) -> dict[str, Any]:
        """Full-text search the indexed files in the session's workspace.

        Returns ranked hits (path, kind, meta, score) from the FTS5 index.
        The ``trigram`` tokenizer gives CJK substring match, so ``q`` can be
        a basename, a camera model, a date, or a phrase from a document's
        text excerpt. Only ``indexed`` rows are searchable.
        """
        user_id = get_user_id(request, auth_provider)
        workspace = await _resolve_workspace(user_id, session_id)
        if workspace is None or not q.strip():
            return FileSearchResponse(
                session_id=session_id, workspace=None, query=q, kind=kind
            ).model_dump()
        bounded = max(1, min(limit, _MAX_LIST))
        hits = file_index_store.search(
            host_id="",
            workspace=workspace,
            query=q,
            kind=kind,
            limit=bounded,
        )
        return FileSearchResponse(
            session_id=session_id,
            workspace=workspace,
            query=q,
            kind=kind,
            results=[
                FileSearchResultWire(
                    path=e.path,
                    kind=e.kind,
                    size=e.size,
                    status=e.status,
                    content_hash=e.content_hash,
                    thumb_path=e.thumb_path,
                    error=e.error,
                    indexed_at=e.indexed_at,
                    meta=e.meta,
                    score=score,
                )
                for e, score in hits
            ],
        ).model_dump()

    return router
