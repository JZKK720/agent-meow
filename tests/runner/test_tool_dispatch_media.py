"""Tests for the image/video tool dispatch logic (Phase B/C runner dispatch).

Exercises ``_resolve_image_provider`` and the dispatch helpers with a
mocked ``server_client`` so no real provider or binary is required.
"""

from __future__ import annotations

import json
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from omnigent.runner.tool_dispatch import (
    _execute_image_generate,
    _execute_image_remove_bg,
    _execute_video_generate,
    _resolve_image_provider,
    _resolve_video_provider,
)


class _FakeResponse:
    def __init__(self, status_code: int, json_data: dict | None = None, content: bytes = b"", text: str = "") -> None:
        self.status_code = status_code
        self._json = json_data or {}
        self.content = content
        self.text = text or ""

    def json(self) -> dict:
        return self._json


@pytest.fixture
def _clear_image_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for var in ("IMAGE_GEN_PROVIDER", "IMAGE_GEN_API_URL", "IMAGE_GEN_API_KEY", "A1111_API_URL", "COMFYUI_MCP_SERVER"):
        monkeypatch.delenv(var, raising=False)


def test_resolve_image_provider_returns_none_when_unset(_clear_image_env: None) -> None:
    assert _resolve_image_provider() is None


def test_resolve_image_provider_explicit_hosted(_clear_image_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IMAGE_GEN_PROVIDER", "hosted")
    assert _resolve_image_provider() == "hosted"


def test_resolve_image_provider_explicit_a1111(_clear_image_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IMAGE_GEN_PROVIDER", "a1111")
    assert _resolve_image_provider() == "a1111"


def test_resolve_image_provider_auto_hosted(_clear_image_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IMAGE_GEN_API_URL", "https://api.openai.com")
    assert _resolve_image_provider() == "hosted"


def test_resolve_image_provider_auto_a1111(_clear_image_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("A1111_API_URL", "http://localhost:7860")
    assert _resolve_image_provider() == "a1111"


@pytest.mark.asyncio
async def test_image_generate_no_provider_returns_helpful_error(_clear_image_env: None) -> None:
    client = MagicMock()
    result = await _execute_image_generate(
        {"session_id": "s1", "prompt": "a cat"},
        base="/v1/sessions/s1/resources/images",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "no image-generation provider" in data["error"]


@pytest.mark.asyncio
async def test_image_generate_requires_prompt(_clear_image_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IMAGE_GEN_API_URL", "https://api.openai.com")
    client = MagicMock()
    result = await _execute_image_generate(
        {"session_id": "s1", "prompt": ""},
        base="/v1/sessions/s1/resources/images",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "prompt" in data["error"]


@pytest.mark.asyncio
async def test_image_remove_bg_no_rembg_returns_install_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("shutil.which", lambda _: None)
    monkeypatch.delenv("REMBG_BIN", raising=False)
    client = MagicMock()
    result = await _execute_image_remove_bg(
        {"session_id": "s1", "image_id": "img1"},
        base="/v1/sessions/s1/resources/images",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "rembg" in data["error"]


@pytest.mark.asyncio
async def test_video_generate_no_provider_returns_helpful_error(monkeypatch: pytest.MonkeyPatch) -> None:
    for var in ("VIDEO_GEN_PROVIDER", "FAL_KEY", "VIDEO_GEN_API_URL", "HAPPY_HORSE_API_URL", "PIXELLE_VIDEO_URL"):
        monkeypatch.delenv(var, raising=False)
    client = MagicMock()
    result = await _execute_video_generate(
        {"session_id": "s1", "text": "how black holes form"},
        base="/v1/sessions/s1/resources/videos",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "no video-generation provider" in data["error"]


@pytest.mark.asyncio
async def test_video_generate_requires_text(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PIXELLE_VIDEO_URL", "http://localhost:8000")
    client = MagicMock()
    result = await _execute_video_generate(
        {"session_id": "s1", "text": ""},
        base="/v1/sessions/s1/resources/videos",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "text" in data["error"]


# ── video provider resolution ────────────────────────────────────────────────


@pytest.fixture
def _clear_video_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for var in ("VIDEO_GEN_PROVIDER", "FAL_KEY", "VIDEO_GEN_API_URL", "HAPPY_HORSE_API_URL", "PIXELLE_VIDEO_URL"):
        monkeypatch.delenv(var, raising=False)


def test_resolve_video_provider_returns_none_when_unset(_clear_video_env: None) -> None:
    assert _resolve_video_provider() is None


def test_resolve_video_provider_explicit_fal(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "fal")
    assert _resolve_video_provider() == "fal"


def test_resolve_video_provider_explicit_happy_horse(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "happy-horse")
    assert _resolve_video_provider() == "happy-horse"


def test_resolve_video_provider_explicit_pixelle(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "pixelle")
    assert _resolve_video_provider() == "pixelle"


def test_resolve_video_provider_auto_happy_horse(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("HAPPY_HORSE_API_URL", "https://api.happy-horse.art")
    assert _resolve_video_provider() == "happy-horse"


def test_resolve_video_provider_auto_fal(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FAL_KEY", "test-key")
    assert _resolve_video_provider() == "fal"


def test_resolve_video_provider_auto_pixelle(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PIXELLE_VIDEO_URL", "http://localhost:8000")
    assert _resolve_video_provider() == "pixelle"


@pytest.mark.asyncio
async def test_video_generate_fal_missing_key_returns_error(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "fal")
    monkeypatch.delenv("FAL_KEY", raising=False)
    client = MagicMock()
    result = await _execute_video_generate(
        {"session_id": "s1", "text": "a cat"},
        base="/v1/sessions/s1/resources/videos",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "FAL_KEY" in data["error"]


@pytest.mark.asyncio
async def test_video_generate_happy_horse_missing_url_returns_error(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "happy-horse")
    monkeypatch.delenv("HAPPY_HORSE_API_URL", raising=False)
    client = MagicMock()
    result = await _execute_video_generate(
        {"session_id": "s1", "text": "a cat"},
        base="/v1/sessions/s1/resources/videos",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "HAPPY_HORSE_API_URL" in data["error"]


@pytest.mark.asyncio
async def test_video_generate_openmontage_returns_mcp_hint(_clear_video_env: None, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "openmontage")
    client = MagicMock()
    result = await _execute_video_generate(
        {"session_id": "s1", "text": "a cat"},
        base="/v1/sessions/s1/resources/videos",
        server_client=client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "MCP" in data["error"]


# ---------------------------------------------------------------------------
# Image surface REST-proxy happy-path tests (Plan 006)
# ---------------------------------------------------------------------------

from omnigent.runner.tool_dispatch import _execute_image_tool


@pytest.mark.asyncio
async def test_image_list_returns_rows() -> None:
    """image_list GETs from the images base and returns the data array."""
    client = MagicMock()
    client.get = AsyncMock(return_value=_FakeResponse(200, {"data": [{"id": "img1", "filename": "cat.png"}]}))
    result = await _execute_image_tool(
        "image_list", {}, conversation_id="conv_1", server_client=client, runner_workspace=None,
    )
    data = json.loads(result)
    assert "images" in data
    assert data["images"] == [{"id": "img1", "filename": "cat.png"}]
    client.get.assert_called_once_with("/v1/sessions/conv_1/resources/images", timeout=30.0)


@pytest.mark.asyncio
async def test_image_get_filters_list() -> None:
    """image_get fetches the list and filters to the requested image_id."""
    client = MagicMock()
    client.get = AsyncMock(return_value=_FakeResponse(200, {"data": [
        {"id": "img1", "filename": "a.png"},
        {"id": "img2", "filename": "b.png"},
    ]}))
    result = await _execute_image_tool(
        "image_get", {"image_id": "img2"}, conversation_id="conv_1", server_client=client, runner_workspace=None,
    )
    data = json.loads(result)
    assert data["image"]["id"] == "img2"


@pytest.mark.asyncio
async def test_image_upload_posts_multipart(tmp_path) -> None:
    """image_upload reads a local file and POSTs it as multipart."""
    test_file = tmp_path / "photo.png"
    test_file.write_bytes(b"\x89PNG fake image data")
    client = MagicMock()
    client.post = AsyncMock(return_value=_FakeResponse(200, {"id": "img_new", "filename": "photo.png"}))
    result = await _execute_image_tool(
        "image_upload", {"path": str(test_file)}, conversation_id="conv_1", server_client=client, runner_workspace=None,
    )
    data = json.loads(result)
    assert data["image"]["id"] == "img_new"
    client.post.assert_called_once()
    _, kwargs = client.post.call_args
    assert "files" in kwargs


@pytest.mark.asyncio
async def test_image_edit_patches_json() -> None:
    """image_edit PATCHes the edit_json to the image's edit sub-route."""
    client = MagicMock()
    client.patch = AsyncMock(return_value=_FakeResponse(200, {"id": "img1", "edit_json": "{\"x\":1}"}))
    result = await _execute_image_tool(
        "image_edit", {"image_id": "img1", "edit_json": "{\"x\":1}"},
        conversation_id="conv_1", server_client=client, runner_workspace=None,
    )
    data = json.loads(result)
    assert data["image"]["id"] == "img1"
    client.patch.assert_called_once_with(
        "/v1/sessions/conv_1/resources/images/img1/edit",
        json={"edit_json": "{\"x\":1}"},
        timeout=30.0,
    )