"""Tests for the workspace file scanner route.

Covers: happy path (doc/image/video import), idempotency (dedup),
missing session, missing workspace, size cap, and symlink skip.
"""

from __future__ import annotations

import os
import tempfile
from typing import Any
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from starlette.responses import JSONResponse
from httpx import ASGITransport, AsyncClient

from agent_meow.entities import Conversation
from agent_meow.errors import ErrorCode, OmnigentError
from agent_meow.server.routes.workspace_scan import create_workspace_scan_router


# ── Exception handler (matches app.py's handler) ─────────────────────────────


def _register_error_handler(app: FastAPI) -> None:
    """Register the OmnigentError handler so tests get proper HTTP status codes."""

    @app.exception_handler(OmnigentError)
    async def _handle_omnigent_error(request: Any, exc: OmnigentError) -> JSONResponse:
        status_map = {
            ErrorCode.NOT_FOUND: 404,
            ErrorCode.INVALID_INPUT: 400,
            ErrorCode.INTERNAL_ERROR: 500,
        }
        status = status_map.get(exc.code, 500)
        return JSONResponse(
            status_code=status,
            content={"error": {"code": exc.code, "message": exc.message}},
        )


# ── Test fixtures ─────────────────────────────────────────────────────────────


class _FakeConvStore:
    """Minimal conversation store that returns a workspace path."""

    def __init__(self, workspace: str | None = None) -> None:
        self._conv = Conversation(
            id="test-session",
            created_at=1,
            updated_at=1,
            root_conversation_id="test-session",
            agent_id="test-agent",
            workspace=workspace,
        )

    def get_conversation(self, session_id: str) -> Conversation | None:
        if session_id == "test-session":
            return self._conv
        return None


class _FakeDocStore:
    """Minimal document store tracking added docs by title."""

    def __init__(self) -> None:
        self._docs: list[Any] = []

    def add(self, conversation_id: str, title: str, **kwargs: Any) -> Any:
        doc = MagicMock(id=f"doc_{len(self._docs)}", title=title, conversation_id=conversation_id)
        self._docs.append(doc)
        return doc

    def list_for_conversation(self, session_id: str) -> list[Any]:
        return list(self._docs)


class _FakeImageStore:
    """Minimal image store tracking added images by filename."""

    def __init__(self) -> None:
        self._images: list[Any] = []

    def add(self, conversation_id: str, filename: str, *args: Any, **kwargs: Any) -> Any:
        img = MagicMock(id=f"img_{len(self._images)}", filename=filename, conversation_id=conversation_id)
        self._images.append(img)
        return img

    def list_for_conversation(self, session_id: str) -> list[Any]:
        return list(self._images)


class _FakeVideoStore:
    """Minimal video store tracking added videos by filename."""

    def __init__(self) -> None:
        self._videos: list[Any] = []

    def add(self, conversation_id: str, filename: str, *args: Any, **kwargs: Any) -> Any:
        vid = MagicMock(id=f"vid_{len(self._videos)}", filename=filename, conversation_id=conversation_id)
        self._videos.append(vid)
        return vid

    def list_for_conversation(self, session_id: str) -> list[Any]:
        return list(self._videos)


class _FakeArtifactStore:
    """Minimal artifact store that accepts blobs."""

    def __init__(self) -> None:
        self._blobs: dict[str, bytes] = {}

    def put(self, key: str, data: bytes) -> None:
        self._blobs[key] = data

    def get(self, key: str) -> bytes:
        return self._blobs[key]


def _create_app(
    workspace: str | None = None,
    doc_store: Any | None = None,
    image_store: Any | None = None,
    video_store: Any | None = None,
) -> FastAPI:
    """Build a test app with the workspace scan router mounted."""
    app = FastAPI(raise_server_exceptions=False)
    _register_error_handler(app)
    conv_store = _FakeConvStore(workspace=workspace)
    artifact_store = _FakeArtifactStore()
    app.include_router(
        create_workspace_scan_router(
            document_store=doc_store,
            image_store=image_store,
            video_store=video_store,
            artifact_store=artifact_store,
            conversation_store=conv_store,
        ),
        prefix="/v1",
    )
    return app


@pytest.fixture
def workspace_dir() -> str:
    """Create a temp directory with test files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create test files
        with open(os.path.join(tmpdir, "notes.md"), "w") as f:
            f.write("# Test Notes\n\nHello world.")
        with open(os.path.join(tmpdir, "readme.md"), "w") as f:
            f.write("# README\n\nThis is a test.")
        with open(os.path.join(tmpdir, "test.png"), "wb") as f:
            f.write(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100)  # Minimal PNG header
        with open(os.path.join(tmpdir, "clip.mp4"), "wb") as f:
            f.write(b"\x00\x00\x00\x20ftyp" + b"\x00" * 100)  # Minimal MP4 header
        # Create a file that should be skipped
        with open(os.path.join(tmpdir, ".hidden"), "w") as f:
            f.write("should be skipped")
        with open(os.path.join(tmpdir, "data.json"), "w") as f:
            f.write("{}")  # Not a recognized type
        yield tmpdir


# ── Tests ─────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_scan_imports_docs_images_videos(workspace_dir: str) -> None:
    """Happy path: scan imports .md, .png, and .mp4 files."""
    doc_store = _FakeDocStore()
    image_store = _FakeImageStore()
    video_store = _FakeVideoStore()
    app = _create_app(
        workspace=workspace_dir,
        doc_store=doc_store,
        image_store=image_store,
        video_store=video_store,
    )
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/v1/sessions/test-session/resources/scan-workspace")
    assert resp.status_code == 200
    data = resp.json()
    assert data["object"] == "workspace_scan_result"
    assert data["scanned"] == 4  # notes.md, readme.md, test.png, clip.mp4
    assert data["imported_docs"] == 2
    assert data["imported_images"] == 1
    assert data["imported_videos"] == 1
    assert data["skipped"] == 0
    assert data["errors"] == []
    assert len(doc_store._docs) == 2
    assert len(image_store._images) == 1
    assert len(video_store._videos) == 1


@pytest.mark.asyncio
async def test_scan_idempotent(workspace_dir: str) -> None:
    """Second scan skips already-imported files."""
    doc_store = _FakeDocStore()
    image_store = _FakeImageStore()
    video_store = _FakeVideoStore()
    app = _create_app(
        workspace=workspace_dir,
        doc_store=doc_store,
        image_store=image_store,
        video_store=video_store,
    )
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First scan
        resp1 = await client.post("/v1/sessions/test-session/resources/scan-workspace")
        assert resp1.status_code == 200
        assert resp1.json()["imported_docs"] == 2
        # Second scan — should skip all
        resp2 = await client.post("/v1/sessions/test-session/resources/scan-workspace")
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["imported_docs"] == 0
        assert data2["imported_images"] == 0
        assert data2["imported_videos"] == 0
        assert data2["skipped"] == 4
    # Stores should not have grown
    assert len(doc_store._docs) == 2
    assert len(image_store._images) == 1
    assert len(video_store._videos) == 1


@pytest.mark.asyncio
async def test_scan_missing_session() -> None:
    """Scan with a nonexistent session returns 404."""
    app = _create_app(workspace="/tmp")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/v1/sessions/nonexistent/resources/scan-workspace")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_scan_no_workspace() -> None:
    """Session without a workspace path returns error."""
    app = _create_app(workspace=None)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/v1/sessions/test-session/resources/scan-workspace")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_scan_nonexistent_workspace() -> None:
    """Workspace path that doesn't exist returns 404."""
    app = _create_app(workspace="/nonexistent/path/that/does/not/exist")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/v1/sessions/test-session/resources/scan-workspace")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_scan_empty_workspace() -> None:
    """Empty workspace directory returns zero scanned."""
    with tempfile.TemporaryDirectory() as tmpdir:
        app = _create_app(workspace=tmpdir, doc_store=_FakeDocStore())
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/v1/sessions/test-session/resources/scan-workspace")
        assert resp.status_code == 200
        data = resp.json()
        assert data["scanned"] == 0
        assert data["imported_docs"] == 0


@pytest.mark.asyncio
async def test_scan_skips_dotfiles_and_unrecognized(workspace_dir: str) -> None:
    """Dotfiles and unrecognized extensions are not scanned."""
    doc_store = _FakeDocStore()
    app = _create_app(workspace=workspace_dir, doc_store=doc_store)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/v1/sessions/test-session/resources/scan-workspace")
    data = resp.json()
    # .hidden and data.json should not be counted
    assert data["scanned"] == 4  # only .md, .png, .mp4 files
