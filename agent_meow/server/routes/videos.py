"""Routes for per-session videos (agent-meow Video surface).

Videos are binary assets owned by a conversation. Binary content lives in
the ``ArtifactStore``; metadata lives in the ``VideoStore``. The routes
support upload (multipart), list, get (binary), and delete.
"""

from __future__ import annotations

import asyncio
import mimetypes
import uuid
from typing import Any

from fastapi import APIRouter, File, Request, UploadFile

from agent_meow.entities import VideoAsset
from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ArtifactStore, ConversationStore
from agent_meow.stores.permission_store import PermissionStore
from agent_meow.stores.video_store import VideoStore


# ── Response models ───────────────────────────────────────────────────────────


def _video_to_dict(vid: VideoAsset) -> dict[str, Any]:
    """Project a :class:`VideoAsset` to the API response shape (no binary)."""
    return {
        "id": vid.id,
        "object": "video",
        "conversation_id": vid.conversation_id,
        "filename": vid.filename,
        "mime": vid.mime,
        "duration_seconds": vid.duration_seconds,
        "width": vid.width,
        "height": vid.height,
        "bytes_size": vid.bytes_size,
        "created_at": vid.created_at,
        "updated_at": vid.updated_at,
        "created_by": vid.created_by,
    }


# ── Router factory ────────────────────────────────────────────────────────────


def create_videos_router(
    video_store: VideoStore,
    artifact_store: ArtifactStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the videos router.

    All routes are scoped to ``/sessions/{session_id}/resources/videos``.

    :param video_store: The shared :class:`VideoStore` instance (metadata).
    :param artifact_store: The shared :class:`ArtifactStore` (binary blobs).
    :param auth_provider: Auth provider. ``None`` in single-user mode.
    :param permission_store: Permission store. ``None`` disables enforcement.
    :param conversation_store: Conversation store for session existence checks.
    :returns: A configured :class:`APIRouter`.
    """
    if permission_store is not None and conversation_store is None:
        raise ValueError("conversation_store is required when permission_store is provided")
    router = APIRouter()

    async def _require_session_access(user_id: str | None, session_id: str, level: int) -> None:
        """Require access and a real session before video mutations."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(user_id, session_id, level, permission_store, conversation_store)
        if conversation_store is not None:
            conversation = await asyncio.to_thread(conversation_store.get_conversation, session_id)
            if conversation is None:
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.post("/sessions/{session_id}/resources/videos")
    async def upload_video(
        request: Request,
        session_id: str,
        file: UploadFile = File(...),
    ) -> dict[str, Any]:
        """Upload a video to a session. Binary stored in the ArtifactStore."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        data = await file.read()
        if not data:
            raise AgentMeowError("Empty upload", code=ErrorCode.BAD_REQUEST)
        video_id = str(uuid.uuid4())
        mime = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
        if not mime.startswith("video/"):
            raise AgentMeowError(
                f"Unsupported video upload type: {mime or 'unknown'}",
                code=ErrorCode.INVALID_INPUT,
            )
        artifact_key = f"videos/{session_id}/{video_id}"
        await asyncio.to_thread(artifact_store.put, artifact_key, data)
        vid = await asyncio.to_thread(
            video_store.add,
            session_id,
            file.filename or "untitled.mp4",
            mime,
            artifact_key,
            bytes_size=len(data),
            created_by=created_by,
        )
        return _video_to_dict(vid)

    @router.get("/sessions/{session_id}/resources/videos")
    async def list_videos(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """List all videos in a session, newest-first."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        vids = await asyncio.to_thread(video_store.list_for_conversation, session_id)
        return {
            "object": "list",
            "data": [_video_to_dict(v) for v in vids],
        }

    @router.get("/sessions/{session_id}/resources/videos/{video_id}")
    async def get_video(
        request: Request,
        session_id: str,
        video_id: str,
    ) -> Any:
        """Fetch a video's binary content."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        vid = await asyncio.to_thread(video_store.get, video_id, session_id)
        if vid is None:
            raise AgentMeowError("Video not found", code=ErrorCode.NOT_FOUND)
        data = await asyncio.to_thread(artifact_store.get, vid.artifact_key)
        from fastapi import Response

        return Response(content=data, media_type=vid.mime or "application/octet-stream")

    @router.delete("/sessions/{session_id}/resources/videos/{video_id}")
    async def delete_video(
        request: Request,
        session_id: str,
        video_id: str,
    ) -> dict[str, Any]:
        """Delete a video (metadata + binary blob)."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        vid = await asyncio.to_thread(video_store.delete, video_id, session_id)
        if vid is None:
            raise AgentMeowError("Video not found", code=ErrorCode.NOT_FOUND)
        # Best-effort binary cleanup; a missing blob is not a failure.
        try:
            await asyncio.to_thread(artifact_store.delete, vid.artifact_key)
        except Exception:
            pass
        return _video_to_dict(vid)

    return router