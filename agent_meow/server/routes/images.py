"""Routes for per-session images (agent-meow Images surface).

Images are binary assets owned by a conversation. Binary content lives in
the ``ArtifactStore``; metadata lives in the ``ImageStore``. The routes
support upload (multipart), list, get (binary), edit (Fabric.js JSON
patch), and delete.
"""

from __future__ import annotations

import asyncio
import mimetypes
import uuid
from typing import Any

from fastapi import APIRouter, File, Request, UploadFile
from pydantic import BaseModel

from agent_meow.entities import ImageAsset
from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ArtifactStore, ConversationStore
from agent_meow.stores.image_store import ImageStore
from agent_meow.stores.permission_store import PermissionStore


# ── Response models ───────────────────────────────────────────────────────────


def _image_to_dict(img: ImageAsset) -> dict[str, Any]:
    """Project an :class:`ImageAsset` to the API response shape (no binary)."""
    return {
        "id": img.id,
        "object": "image",
        "conversation_id": img.conversation_id,
        "filename": img.filename,
        "mime": img.mime,
        "width": img.width,
        "height": img.height,
        "bytes_size": img.bytes_size,
        "has_edits": img.edit_json is not None,
        "created_at": img.created_at,
        "updated_at": img.updated_at,
        "created_by": img.created_by,
    }


class UpdateImageEditRequest(BaseModel):
    """Request body for ``PATCH .../images/{image_id}/edit``.

    :param edit_json: Fabric.js canvas JSON string for the saved edit state.
    """

    edit_json: str


# ── Router factory ────────────────────────────────────────────────────────────


def create_images_router(
    image_store: ImageStore,
    artifact_store: ArtifactStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the images router.

    All routes are scoped to ``/sessions/{session_id}/resources/images``.

    :param image_store: The shared :class:`ImageStore` instance (metadata).
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
        """Require access and a real session before image mutations."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(user_id, session_id, level, permission_store, conversation_store)
        if conversation_store is not None:
            conversation = await asyncio.to_thread(conversation_store.get_conversation, session_id)
            if conversation is None:
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.post("/sessions/{session_id}/resources/images")
    async def upload_image(
        request: Request,
        session_id: str,
        file: UploadFile = File(...),
    ) -> dict[str, Any]:
        """Upload an image to a session. Binary stored in the ArtifactStore."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        data = await file.read()
        if not data:
            raise AgentMeowError("Empty upload", code=ErrorCode.BAD_REQUEST)
        image_id = str(uuid.uuid4())
        mime = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
        if not mime.startswith("image/"):
            raise AgentMeowError(
                f"Unsupported image upload type: {mime or 'unknown'}",
                code=ErrorCode.INVALID_INPUT,
            )
        artifact_key = f"images/{session_id}/{image_id}"
        await asyncio.to_thread(artifact_store.put, artifact_key, data)
        img = await asyncio.to_thread(
            image_store.add,
            session_id,
            file.filename or "untitled",
            mime,
            artifact_key,
            bytes_size=len(data),
            created_by=created_by,
        )
        return _image_to_dict(img)

    @router.get("/sessions/{session_id}/resources/images")
    async def list_images(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """List all images in a session, newest-first."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        imgs = await asyncio.to_thread(image_store.list_for_conversation, session_id)
        return {
            "object": "list",
            "data": [_image_to_dict(i) for i in imgs],
        }

    @router.get("/sessions/{session_id}/resources/images/{image_id}")
    async def get_image(
        request: Request,
        session_id: str,
        image_id: str,
    ) -> Any:
        """Fetch an image's binary content."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        img = await asyncio.to_thread(image_store.get, image_id, session_id)
        if img is None:
            raise AgentMeowError("Image not found", code=ErrorCode.NOT_FOUND)
        data = await asyncio.to_thread(artifact_store.get, img.artifact_key)
        from fastapi import Response

        return Response(content=data, media_type=img.mime or "application/octet-stream")

    @router.patch("/sessions/{session_id}/resources/images/{image_id}/edit")
    async def update_image_edit(
        request: Request,
        session_id: str,
        image_id: str,
        body: UpdateImageEditRequest,
    ) -> dict[str, Any]:
        """Update the Fabric.js edit JSON for an image (store-and-forward)."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        img = await asyncio.to_thread(
            image_store.update_edit,
            image_id,
            session_id,
            body.edit_json,
        )
        if img is None:
            raise AgentMeowError("Image not found", code=ErrorCode.NOT_FOUND)
        return _image_to_dict(img)

    @router.delete("/sessions/{session_id}/resources/images/{image_id}")
    async def delete_image(
        request: Request,
        session_id: str,
        image_id: str,
    ) -> dict[str, Any]:
        """Delete an image (metadata + binary blob)."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        img = await asyncio.to_thread(image_store.delete, image_id, session_id)
        if img is None:
            raise AgentMeowError("Image not found", code=ErrorCode.NOT_FOUND)
        # Best-effort binary cleanup; a missing blob is not a failure.
        try:
            await asyncio.to_thread(artifact_store.delete, img.artifact_key)
        except Exception:
            pass
        return _image_to_dict(img)

    return router