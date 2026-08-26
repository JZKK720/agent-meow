"""Tests for the image/video tool dispatch logic (Phase B/C runner dispatch).

Exercises ``_resolve_image_provider`` and the dispatch helpers with a
mocked ``server_client`` so no real provider or binary is required.
"""

from __future__ import annotations

import asyncio
import json
import os
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from agent_meow.runner.tool_dispatch import (
    _execute_image_generate,
    _execute_image_remove_bg,
    _execute_video_generate,
    _resolve_image_provider,
    _resolve_video_provider,
)


class _FakeResponse:
    def __init__(
        self, status_code: int, json_data: dict | None = None, content: bytes = b"", text: str = ""
    ) -> None:
        self.status_code = status_code
        self._json = json_data or {}
        self.content = content
        self.text = text or ""

    def json(self) -> dict:
        return self._json


@pytest.fixture
def _clear_image_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for var in (
        "IMAGE_GEN_PROVIDER",
        "IMAGE_GEN_API_URL",
        "IMAGE_GEN_API_KEY",
        "A1111_API_URL",
        "COMFYUI_MCP_SERVER",
        "FAL_KEY",
        "DASHSCOPE_API_KEY",
        "AGENT_MEOW_DASHSCOPE_API_KEY",
    ):
        monkeypatch.delenv(var, raising=False)


def test_resolve_image_provider_returns_none_when_unset(_clear_image_env: None) -> None:
    assert _resolve_image_provider() is None


def test_resolve_image_provider_explicit_hosted(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("IMAGE_GEN_PROVIDER", "hosted")
    assert _resolve_image_provider() == "hosted"


def test_resolve_image_provider_explicit_a1111(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("IMAGE_GEN_PROVIDER", "a1111")
    assert _resolve_image_provider() == "a1111"


def test_resolve_image_provider_auto_hosted(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("IMAGE_GEN_API_URL", "https://api.openai.com")
    assert _resolve_image_provider() == "hosted"


def test_resolve_image_provider_auto_a1111(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
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
async def test_image_generate_requires_prompt(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
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
async def test_image_remove_bg_no_rembg_returns_install_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
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
async def test_video_generate_no_provider_returns_helpful_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    for var in (
        "VIDEO_GEN_PROVIDER",
        "FAL_KEY",
        "VIDEO_GEN_API_URL",
        "HAPPY_HORSE_API_URL",
        "PIXELLE_VIDEO_URL",
        "DASHSCOPE_API_KEY",
        "AGENT_MEOW_DASHSCOPE_API_KEY",
        "HYPERFRAMES_BIN",
    ):
        monkeypatch.delenv(var, raising=False)
    # Hermetic even on machines with the HyperFrames CLI installed.
    monkeypatch.setattr("shutil.which", lambda _: None)
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
    for var in (
        "VIDEO_GEN_PROVIDER",
        "FAL_KEY",
        "VIDEO_GEN_API_URL",
        "HAPPY_HORSE_API_URL",
        "PIXELLE_VIDEO_URL",
        "DASHSCOPE_API_KEY",
        "AGENT_MEOW_DASHSCOPE_API_KEY",
        "HYPERFRAMES_BIN",
    ):
        monkeypatch.delenv(var, raising=False)
    # Keep hyperframes auto-detection hermetic even on machines that have
    # the CLI installed.
    monkeypatch.setattr("shutil.which", lambda _: None)


def test_resolve_video_provider_returns_none_when_unset(_clear_video_env: None) -> None:
    assert _resolve_video_provider() is None


def test_resolve_video_provider_explicit_fal(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "fal")
    assert _resolve_video_provider() == "fal"


def test_resolve_video_provider_explicit_happy_horse(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "happy-horse")
    assert _resolve_video_provider() == "happy-horse"


def test_resolve_video_provider_explicit_pixelle(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "pixelle")
    assert _resolve_video_provider() == "pixelle"


def test_resolve_video_provider_auto_happy_horse(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("HAPPY_HORSE_API_URL", "https://api.happy-horse.art")
    assert _resolve_video_provider() == "happy-horse"


def test_resolve_video_provider_auto_fal(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FAL_KEY", "test-key")
    assert _resolve_video_provider() == "fal"


def test_resolve_video_provider_auto_pixelle(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("PIXELLE_VIDEO_URL", "http://localhost:8000")
    assert _resolve_video_provider() == "pixelle"


@pytest.mark.asyncio
async def test_video_generate_fal_missing_key_returns_error(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
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
async def test_video_generate_happy_horse_missing_url_returns_error(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
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
async def test_video_generate_openmontage_returns_mcp_hint(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
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


# ── DashScope provider ───────────────────────────────────────────────────────


class _FakeAsyncClient:
    """Scripted stand-in for ``httpx.AsyncClient`` (async context manager)."""

    def __init__(self, responses: list[_FakeResponse]) -> None:
        self._responses = list(responses)
        self.calls: list[tuple[str, str]] = []

    async def __aenter__(self) -> _FakeAsyncClient:
        return self

    async def __aexit__(self, *exc: object) -> bool:
        return False

    async def post(self, url: str, **kwargs: object) -> _FakeResponse:
        self.calls.append(("POST", str(url)))
        return self._responses.pop(0)

    async def get(self, url: str, **kwargs: object) -> _FakeResponse:
        self.calls.append(("GET", str(url)))
        return self._responses.pop(0)


def test_resolve_image_provider_auto_dashscope(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    assert _resolve_image_provider() == "dashscope"


def test_resolve_image_provider_fal_wins_over_dashscope(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FAL_KEY", "fal-key")
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    assert _resolve_image_provider() == "fal"


def test_resolve_video_provider_auto_dashscope(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    assert _resolve_video_provider() == "dashscope"


def test_resolve_video_provider_auto_hyperframes(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr("shutil.which", lambda name: "/usr/local/bin/hyperframes")
    assert _resolve_video_provider() == "hyperframes"


def test_resolve_video_provider_dashscope_wins_over_hyperframes(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    monkeypatch.setattr("shutil.which", lambda name: "/usr/local/bin/hyperframes")
    assert _resolve_video_provider() == "dashscope"


@pytest.mark.asyncio
async def test_image_generate_dashscope_full_flow(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DashScope image gen: submit → poll task → download → upload."""
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    monkeypatch.setattr(asyncio, "sleep", AsyncMock(return_value=None))
    fake = _FakeAsyncClient(
        [
            # 1. submit → task id
            _FakeResponse(200, {"output": {"task_id": "t1", "task_status": "PENDING"}}),
            # 2. poll → succeeded with image URL
            _FakeResponse(
                200,
                {
                    "output": {
                        "task_status": "SUCCEEDED",
                        "results": [{"url": "https://img.example/x.png"}],
                    }
                },
            ),
            # 3. download image bytes
            _FakeResponse(200, content=b"PNGDATA"),
        ]
    )
    monkeypatch.setattr(httpx, "AsyncClient", lambda *a, **kw: fake)
    server_client = MagicMock()
    server_client.post = AsyncMock(return_value=_FakeResponse(200, {"id": "img_1"}))
    result = await _execute_image_generate(
        {"prompt": "a cat"},
        base="/v1/sessions/s1/resources/images",
        server_client=server_client,
    )
    data = json.loads(result)
    assert data["provider"] == "dashscope"
    assert data["image"] == {"id": "img_1"}
    # Submit hit the text2image endpoint with the async header.
    method, url = fake.calls[0]
    assert method == "POST"
    assert url.endswith("/api/v1/services/aigc/text2image/image-synthesis")


@pytest.mark.asyncio
async def test_image_edit_ai_dashscope_unsupported(
    _clear_image_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    result = await _execute_image_generate(
        {"prompt": "make it blue", "image_id": "img1"},
        base="/v1/sessions/s1/resources/images",
        server_client=MagicMock(),
        edit_mode=True,
    )
    data = json.loads(result)
    assert "error" in data
    assert "dashscope" in data["error"]


@pytest.mark.asyncio
async def test_video_generate_dashscope_full_flow(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DashScope video gen: submit → poll task → download → upload."""
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    monkeypatch.setattr(asyncio, "sleep", AsyncMock(return_value=None))
    fake = _FakeAsyncClient(
        [
            _FakeResponse(200, {"output": {"task_id": "v1", "task_status": "PENDING"}}),
            _FakeResponse(
                200,
                {
                    "output": {
                        "task_status": "SUCCEEDED",
                        "video_url": "https://vid.example/out.mp4",
                    }
                },
            ),
            _FakeResponse(200, content=b"MP4DATA"),
        ]
    )
    monkeypatch.setattr(httpx, "AsyncClient", lambda *a, **kw: fake)
    server_client = MagicMock()
    server_client.post = AsyncMock(return_value=_FakeResponse(200, {"id": "vid_1"}))
    result = await _execute_video_generate(
        {"text": "a sunset over the sea"},
        base="/v1/sessions/s1/resources/videos",
        server_client=server_client,
    )
    data = json.loads(result)
    assert data["provider"] == "dashscope"
    assert data["video"] == {"id": "vid_1"}
    method, url = fake.calls[0]
    assert method == "POST"
    assert url.endswith("/api/v1/services/aigc/video-generation/video-synthesis")


@pytest.mark.asyncio
async def test_video_generate_dashscope_task_failure(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    monkeypatch.setattr(asyncio, "sleep", AsyncMock(return_value=None))
    fake = _FakeAsyncClient(
        [
            _FakeResponse(200, {"output": {"task_id": "v1", "task_status": "PENDING"}}),
            _FakeResponse(200, {"output": {"task_status": "FAILED", "message": "content policy"}}),
        ]
    )
    monkeypatch.setattr(httpx, "AsyncClient", lambda *a, **kw: fake)
    result = await _execute_video_generate(
        {"text": "a sunset"},
        base="/v1/sessions/s1/resources/videos",
        server_client=MagicMock(),
    )
    data = json.loads(result)
    assert "error" in data
    assert "failed" in data["error"]


# ── HyperFrames provider (free local HTML→MP4) ───────────────────────────────


@pytest.mark.asyncio
async def test_video_generate_hyperframes_requires_html(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "hyperframes")
    monkeypatch.setenv("HYPERFRAMES_BIN", "C:/fake/hyperframes.exe")
    result = await _execute_video_generate(
        {"text": "a cat"},
        base="/v1/sessions/s1/resources/videos",
        server_client=MagicMock(),
    )
    data = json.loads(result)
    assert "error" in data
    assert "html" in data["error"]


@pytest.mark.asyncio
async def test_video_generate_hyperframes_full_flow(
    _clear_video_env: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    """HyperFrames: write composition → CLI render → upload the mp4."""
    monkeypatch.setenv("VIDEO_GEN_PROVIDER", "hyperframes")
    monkeypatch.setenv("HYPERFRAMES_BIN", "C:/fake/hyperframes.exe")

    async def fake_exec(*cmd: str, **kwargs: object) -> object:
        cwd = kwargs.get("cwd")

        class _Proc:
            returncode = 0

            async def communicate(self) -> tuple[bytes, bytes]:
                # Simulate the renderer writing the output mp4 into the project.
                with open(os.path.join(cwd, "out.mp4"), "wb") as f:  # type: ignore[arg-type]
                    f.write(b"MP4DATA")
                return b"", b""

        return _Proc()

    monkeypatch.setattr(asyncio, "create_subprocess_exec", fake_exec)
    server_client = MagicMock()
    server_client.post = AsyncMock(return_value=_FakeResponse(200, {"id": "vid_hf"}))
    result = await _execute_video_generate(
        {"text": "intro", "html": "<div id='stage' data-composition-id='c'></div>"},
        base="/v1/sessions/s1/resources/videos",
        server_client=server_client,
    )
    data = json.loads(result)
    assert data["provider"] == "hyperframes"
    assert data["video"] == {"id": "vid_hf"}
