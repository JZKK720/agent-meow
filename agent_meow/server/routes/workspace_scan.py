"""Workspace file scanner — bridges workspace filesystem to surface stores.

When Hermes (or any agent that handles tools internally) writes files to the
session workspace directory, those files exist on disk but never enter the
ImageStore / VideoStore / DocumentStore. This route scans the session's
workspace path for ``.md``, image, and video files and imports them into the
appropriate store so they appear in the Docs / Images / Videos panels.

Idempotent: files already imported (tracked by filename + size) are skipped.
"""

from __future__ import annotations

import asyncio
import logging
import mimetypes
import os
import uuid
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import LEVEL_EDIT, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ArtifactStore, ConversationStore
from agent_meow.stores.document_store import DocumentStore
from agent_meow.stores.image_store import ImageStore
from agent_meow.stores.permission_store import PermissionStore
from agent_meow.stores.video_store import VideoStore

logger = logging.getLogger(__name__)

# File extensions mapped to surface type.
_DOC_EXTENSIONS = frozenset({".md", ".markdown", ".txt"})
_IMAGE_EXTENSIONS = frozenset({".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"})
_VIDEO_EXTENSIONS = frozenset({".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".ogg"})

# Skip files that are clearly not user content.
_SKIP_NAMES = frozenset({".ds_store", "thumbs.db", ".gitkeep", "__pycache__"})
_SKIP_PREFIXES = (".", "__")

# Maximum file size to import (256 MB) — prevents memory blowup on huge files.
_MAX_FILE_BYTES = 256 * 1024 * 1024

# Cap on the number of per-file errors returned in the response.
_MAX_ERRORS_IN_RESPONSE = 50


class ScanResult(BaseModel):
    """Result of a workspace scan operation."""

    scanned: int = 0
    imported_docs: int = 0
    imported_images: int = 0
    imported_videos: int = 0
    skipped: int = 0
    errors: list[str] = []


def create_workspace_scan_router(
    document_store: DocumentStore | None = None,
    image_store: ImageStore | None = None,
    video_store: VideoStore | None = None,
    artifact_store: ArtifactStore | None = None,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the workspace scan router.

    :returns: A configured :class:`APIRouter` with a single POST endpoint.
    """
    if permission_store is not None and conversation_store is None:
        raise ValueError("conversation_store is required when permission_store is provided")
    router = APIRouter()

    # Per-session locks prevent concurrent scans from creating duplicate entries.
    _session_locks: dict[str, asyncio.Lock] = {}
    _locks_guard = asyncio.Lock()

    async def _get_session_lock(session_id: str) -> asyncio.Lock:
        async with _locks_guard:
            if session_id not in _session_locks:
                _session_locks[session_id] = asyncio.Lock()
            return _session_locks[session_id]

    async def _require_session_access(user_id: str | None, session_id: str) -> None:
        """Require edit access and a real session."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(
                user_id, session_id, LEVEL_EDIT, permission_store, conversation_store
            )
        if conversation_store is not None:
            conversation = await asyncio.to_thread(conversation_store.get_conversation, session_id)
            if conversation is None:
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    def _should_skip(name: str) -> bool:
        """Check if a file should be skipped."""
        lower = name.lower()
        if lower in _SKIP_NAMES:
            return True
        if name.startswith(_SKIP_PREFIXES):
            return True
        return False

    def _classify(name: str) -> str | None:
        """Classify a file by extension into a surface type."""
        lower = name.lower()
        if lower.endswith(tuple(_DOC_EXTENSIONS)):
            return "doc"
        if lower.endswith(tuple(_IMAGE_EXTENSIONS)):
            return "image"
        if lower.endswith(tuple(_VIDEO_EXTENSIONS)):
            return "video"
        return None

    def _scan_dir(workspace: str) -> list[tuple[str, str, int, str]]:
        """Walk the workspace directory and return (path, name, size, type) tuples.

        Only top-level files are scanned — subdirectories are not recursed
        to avoid importing build artifacts, venvs, and .git contents.
        Symlinks are not followed to prevent directory traversal.
        """
        results: list[tuple[str, str, int, str]] = []
        try:
            for entry in os.scandir(workspace):
                # follow_symlinks=False prevents importing files outside the
                # workspace via symlinks (e.g. a symlink to /etc/passwd).
                if not entry.is_file(follow_symlinks=False):
                    continue
                if _should_skip(entry.name):
                    continue
                surface_type = _classify(entry.name)
                if surface_type is None:
                    continue
                try:
                    size = entry.stat(follow_symlinks=False).st_size
                except OSError:
                    continue
                results.append((entry.path, entry.name, size, surface_type))
        except (OSError, PermissionError):
            pass
        return results

    def _existing_filenames(
        store: DocumentStore | ImageStore | VideoStore | None,
        session_id: str,
    ) -> set[str] | None:
        """Get the set of existing filenames/titles for a session from a store."""
        if store is None:
            return None
        items = store.list_for_conversation(session_id)
        # Documents have ``title``, images/videos have ``filename``.
        # Collect both so dedup works regardless of store type.
        names: set[str] = set()
        for item in items:
            fname = getattr(item, "filename", None)
            title = getattr(item, "title", None)
            if fname:
                names.add(fname)
            if title:
                names.add(title)
        return names

    @router.post("/sessions/{session_id}/resources/scan-workspace")
    async def scan_workspace(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """Scan the session workspace for files and import them into surface stores.

        Reads the session's ``workspace`` path, scans top-level files,
        and imports any new ``.md``/image/video files into the appropriate
        store. Idempotent — files already in the store (by filename) are
        skipped.
        """
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id)
        created_by = attribution_user(user_id)

        # Get the workspace path from the session.
        if conversation_store is None:
            raise AgentMeowError("Conversation store not configured", code=ErrorCode.INTERNAL_ERROR)
        conv = await asyncio.to_thread(conversation_store.get_conversation, session_id)
        if conv is None:
            raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)
        if not conv.workspace:
            raise AgentMeowError(
                "Session has no workspace path configured",
                code=ErrorCode.INVALID_INPUT,
            )

        workspace = conv.workspace
        if not os.path.isdir(workspace):
            raise AgentMeowError(
                f"Workspace path does not exist: {workspace}",
                code=ErrorCode.NOT_FOUND,
            )

        # Acquire per-session lock to prevent concurrent scans from
        # creating duplicate entries (TOCTOU race on dedup check).
        session_lock = await _get_session_lock(session_id)
        async with session_lock:
            # Scan the workspace directory.
            files = await asyncio.to_thread(_scan_dir, workspace)
            result = ScanResult(scanned=len(files))

            # Get existing filenames to avoid duplicates. Wrapped in to_thread
            # to avoid blocking the event loop on DB reads.
            existing_docs = await asyncio.to_thread(
                _existing_filenames, document_store, session_id
            )
            existing_images = await asyncio.to_thread(_existing_filenames, image_store, session_id)
            existing_videos = await asyncio.to_thread(_existing_filenames, video_store, session_id)

            for file_path, filename, size, surface_type in files:
                try:
                    # Reject files exceeding the size cap.
                    if size > _MAX_FILE_BYTES:
                        if len(result.errors) < _MAX_ERRORS_IN_RESPONSE:
                            result.errors.append(f"{filename}: too large ({size} bytes)")
                        result.skipped += 1
                        continue

                    if surface_type == "doc":
                        # Documents use title (not filename) — title is set to
                        # the filename without extension.
                        doc_title = os.path.splitext(filename)[0]
                        if existing_docs is not None and doc_title in existing_docs:
                            result.skipped += 1
                            continue
                        if document_store is None:
                            result.skipped += 1
                            continue
                        # Read the file content as markdown.
                        with open(file_path, encoding="utf-8", errors="replace") as f:
                            content = f.read()
                        await asyncio.to_thread(
                            document_store.add,
                            session_id,
                            doc_title,
                            format="markdown",
                            content_md=content,
                            created_by=created_by,
                        )
                        result.imported_docs += 1

                    elif surface_type == "image":
                        if existing_images is not None and filename in existing_images:
                            result.skipped += 1
                            continue
                        if image_store is None or artifact_store is None:
                            result.skipped += 1
                            continue
                        with open(file_path, "rb") as f:
                            data = f.read()
                        if not data:
                            result.skipped += 1
                            continue
                        image_id = str(uuid.uuid4())
                        mime = mimetypes.guess_type(filename)[0] or "image/png"
                        artifact_key = f"images/{session_id}/{image_id}"
                        await asyncio.to_thread(artifact_store.put, artifact_key, data)
                        await asyncio.to_thread(
                            image_store.add,
                            session_id,
                            filename,
                            mime,
                            artifact_key,
                            bytes_size=len(data),
                            created_by=created_by,
                        )
                        result.imported_images += 1

                    elif surface_type == "video":
                        if existing_videos is not None and filename in existing_videos:
                            result.skipped += 1
                            continue
                        if video_store is None or artifact_store is None:
                            result.skipped += 1
                            continue
                        with open(file_path, "rb") as f:
                            data = f.read()
                        if not data:
                            result.skipped += 1
                            continue
                        video_id = str(uuid.uuid4())
                        mime = mimetypes.guess_type(filename)[0] or "video/mp4"
                        artifact_key = f"videos/{session_id}/{video_id}"
                        await asyncio.to_thread(artifact_store.put, artifact_key, data)
                        await asyncio.to_thread(
                            video_store.add,
                            session_id,
                            filename,
                            mime,
                            artifact_key,
                            bytes_size=len(data),
                            created_by=created_by,
                        )
                        result.imported_videos += 1

                except (OSError, ValueError, RuntimeError) as exc:
                    logger.warning("workspace_scan: error importing %s: %s", filename, exc)
                    if len(result.errors) < _MAX_ERRORS_IN_RESPONSE:
                        result.errors.append(f"{filename}: {exc}")

        return {
            "object": "workspace_scan_result",
            "session_id": session_id,
            "workspace": workspace,
            **result.model_dump(),
        }

    return router
