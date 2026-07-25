"""Tests for the Docs/Images/Videos/Voice surface tool dispatch.

Verifies that the surface tool names are registered in ``_BUILTIN_REGISTRY``
and ``_ALL_LOCAL_TOOLS``, and that the dispatch functions handle the CRUD
paths (proxying to server REST) and the shell-out paths (resolving external
CLIs) correctly.

The dispatch functions return JSON strings; tests parse them and assert on
the shape. External CLIs (officecli, markitdown, rembg, handy) are not
installed in the test environment — the tests verify the error messages
are clear and actionable when the binaries are absent.
"""

from __future__ import annotations

import json

import httpx
import pytest

from agent_meow.runner.tool_dispatch import (
    _ALL_LOCAL_TOOLS,
    _DOC_TOOLS,
    _IMAGE_TOOLS,
    _NATIVE_RELAY_BUILTIN_TOOLS,
    _VIDEO_TOOLS,
    _VOICE_TOOLS,
    _execute_doc_tool,
    _execute_image_tool,
    _execute_video_tool,
    _execute_voice_tool,
)
from agent_meow.tools.builtins import BUILTIN_NAMES, _BUILTIN_REGISTRY


# ── Registration tests ─────────────────────────────────────────────


class TestSurfaceToolRegistration:
    """Verify all surface tool names are registered in the right places."""

    @pytest.mark.parametrize(
        "tool_name",
        [
            "doc_create",
            "doc_get",
            "doc_list",
            "doc_update",
            "doc_create_office",
            "doc_edit_office",
            "doc_export",
            "doc_convert",
            "image_list",
            "image_get",
            "image_upload",
            "image_edit",
            "image_generate",
            "image_remove_bg",
            "image_edit_ai",
            "video_list",
            "video_get",
            "video_generate",
            "transcribe_audio",
            "transcribe_audio_high_quality",
            "text_to_speech",
            "speak",
        ],
    )
    def test_tool_in_builtin_registry(self, tool_name: str) -> None:
        """Every surface tool name is reserved in _BUILTIN_REGISTRY."""
        assert tool_name in _BUILTIN_REGISTRY, (
            f"{tool_name} not in _BUILTIN_REGISTRY — user specs could shadow it"
        )

    @pytest.mark.parametrize(
        "tool_name",
        [
            "doc_create",
            "doc_list",
            "image_list",
            "image_generate",
            "video_list",
            "video_generate",
            "transcribe_audio",
            "text_to_speech",
            "speak",
        ],
    )
    def test_tool_in_all_local_tools(self, tool_name: str) -> None:
        """Surface tools are in _ALL_LOCAL_TOOLS so the runner dispatches them."""
        assert tool_name in _ALL_LOCAL_TOOLS, (
            f"{tool_name} not in _ALL_LOCAL_TOOLS — the runner won't dispatch it"
        )

    @pytest.mark.parametrize(
        "tool_name",
        [
            "doc_create",
            "image_list",
            "video_list",
            "transcribe_audio",
        ],
    )
    def test_tool_in_native_relay(self, tool_name: str) -> None:
        """Surface tools are relayed to native harnesses."""
        assert tool_name in _NATIVE_RELAY_BUILTIN_TOOLS, (
            f"{tool_name} not in _NATIVE_RELAY_BUILTIN_TOOLS"
        )

    def test_frozenset_sizes(self) -> None:
        """Verify the frozensets have the expected number of tools."""
        assert len(_DOC_TOOLS) == 8
        assert len(_IMAGE_TOOLS) == 7
        assert len(_VIDEO_TOOLS) == 3
        assert len(_VOICE_TOOLS) == 4


# ── Doc dispatch tests ─────────────────────────────────────────────


class TestExecuteDocTool:
    """Tests for _execute_doc_tool."""

    @pytest.mark.asyncio
    async def test_doc_list_proxies_to_server(self) -> None:
        """doc_list calls GET /v1/sessions/{id}/resources/documents."""
        call_count = 0

        def handler(request: httpx.Request) -> httpx.Response:
            nonlocal call_count
            call_count += 1
            assert request.method == "GET"
            assert "resources/documents" in str(request.url)
            return httpx.Response(200, json={"object": "list", "data": []})

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport, base_url="http://test")
        try:
            result = await _execute_doc_tool(
                "doc_list",
                "{}",
                conversation_id="conv_123",
                server_client=client,
            )
            data = json.loads(result)
            assert data == {"documents": []}
            assert call_count == 1
        finally:
            await client.aclose()

    @pytest.mark.asyncio
    async def test_doc_list_requires_session(self) -> None:
        """doc_list returns an error when conversation_id is None."""
        result = await _execute_doc_tool(
            "doc_list",
            "{}",
            conversation_id=None,
            server_client=None,
        )
        data = json.loads(result)
        assert "error" in data
        assert "session id" in data["error"]

    @pytest.mark.asyncio
    async def test_doc_list_requires_server(self) -> None:
        """doc_list returns an error when server_client is None."""
        result = await _execute_doc_tool(
            "doc_list",
            "{}",
            conversation_id="conv_123",
            server_client=None,
        )
        data = json.loads(result)
        assert "error" in data
        assert "server access" in data["error"]

    @pytest.mark.asyncio
    async def test_doc_convert_no_markitdown(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """doc_convert returns a clear error when markitdown is not installed."""
        monkeypatch.delenv("MARKITDOWN_BIN", raising=False)
        monkeypatch.setattr("shutil.which", lambda _: None)
        result = await _execute_doc_tool(
            "doc_convert",
            json.dumps({"source": "/tmp/file.pdf"}),
            conversation_id="conv_123",
            server_client=None,
        )
        data = json.loads(result)
        assert "error" in data
        assert "markitdown" in data["error"]


# ── Image dispatch tests ───────────────────────────────────────────


class TestExecuteImageTool:
    """Tests for _execute_image_tool."""

    @pytest.mark.asyncio
    async def test_image_list_proxies_to_server(self) -> None:
        """image_list calls GET /v1/sessions/{id}/resources/images."""

        def handler(request: httpx.Request) -> httpx.Response:
            assert request.method == "GET"
            assert "resources/images" in str(request.url)
            return httpx.Response(200, json={"object": "list", "data": []})

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport, base_url="http://test")
        try:
            result = await _execute_image_tool(
                "image_list",
                "{}",
                conversation_id="conv_123",
                server_client=client,
            )
            data = json.loads(result)
            assert data == {"images": []}
        finally:
            await client.aclose()

    @pytest.mark.asyncio
    async def test_image_generate_no_provider(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """image_generate returns a clear error when no provider is configured."""
        monkeypatch.delenv("IMAGE_GEN_PROVIDER", raising=False)
        monkeypatch.delenv("IMAGE_GEN_API_URL", raising=False)
        monkeypatch.delenv("A1111_API_URL", raising=False)
        result = await _execute_image_tool(
            "image_generate",
            json.dumps({"prompt": "a cat"}),
            conversation_id="conv_123",
            server_client=None,
        )
        data = json.loads(result)
        assert "error" in data
        assert "provider" in data["error"]


# ── Video dispatch tests ───────────────────────────────────────────


class TestExecuteVideoTool:
    """Tests for _execute_video_tool."""

    @pytest.mark.asyncio
    async def test_video_list_proxies_to_server(self) -> None:
        """video_list calls GET /v1/sessions/{id}/resources/videos."""

        def handler(request: httpx.Request) -> httpx.Response:
            assert request.method == "GET"
            assert "resources/videos" in str(request.url)
            return httpx.Response(200, json={"object": "list", "data": []})

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport, base_url="http://test")
        try:
            result = await _execute_video_tool(
                "video_list",
                "{}",
                conversation_id="conv_123",
                server_client=client,
            )
            data = json.loads(result)
            assert data == {"videos": []}
        finally:
            await client.aclose()

    @pytest.mark.asyncio
    async def test_video_generate_no_provider(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """video_generate returns a clear error when no provider is configured."""
        monkeypatch.delenv("VIDEO_GEN_PROVIDER", raising=False)
        monkeypatch.delenv("FAL_KEY", raising=False)
        monkeypatch.delenv("PIXELLE_VIDEO_URL", raising=False)
        monkeypatch.delenv("HAPPY_HORSE_API_URL", raising=False)
        result = await _execute_video_tool(
            "video_generate",
            json.dumps({"text": "a sunset"}),
            conversation_id="conv_123",
            server_client=None,
        )
        data = json.loads(result)
        assert "error" in data
        assert "provider" in data["error"]


# ── Voice dispatch tests ───────────────────────────────────────────


class TestExecuteVoiceTool:
    """Tests for _execute_voice_tool."""

    @pytest.mark.asyncio
    async def test_transcribe_audio_no_handy(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """transcribe_audio returns a clear error when handy is not installed."""
        monkeypatch.delenv("HANDY_CLI_PATH", raising=False)
        monkeypatch.setattr("shutil.which", lambda _: None)
        result = await _execute_voice_tool(
            "transcribe_audio",
            json.dumps({"path": "/tmp/audio.wav"}),
        )
        data = json.loads(result)
        assert "error" in data
        assert "handy" in data["error"]

    @pytest.mark.asyncio
    async def test_text_to_speech_no_gateway(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """text_to_speech returns a clear error when no TTS gateway is configured."""
        monkeypatch.delenv("VOICEBOX_URL", raising=False)
        monkeypatch.delenv("VIBEVOICE_TTS_URL", raising=False)
        result = await _execute_voice_tool(
            "text_to_speech",
            json.dumps({"text": "hello"}),
        )
        data = json.loads(result)
        assert "error" in data
        assert "VOICEBOX_URL" in data["error"] or "VIBEVOICE_TTS_URL" in data["error"]

    @pytest.mark.asyncio
    async def test_speak_no_gateway(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """speak returns a clear error when no TTS gateway is configured."""
        monkeypatch.delenv("VOICEBOX_URL", raising=False)
        monkeypatch.delenv("VIBEVOICE_TTS_URL", raising=False)
        result = await _execute_voice_tool(
            "speak",
            json.dumps({"text": "hello"}),
        )
        data = json.loads(result)
        assert "error" in data
