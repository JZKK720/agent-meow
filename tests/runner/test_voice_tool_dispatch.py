"""Tests for voice tool dispatch (_execute_voice_tool) in the runner.

Covers the three TTS/STT paths:
- transcribe_audio ΓåÆ shells out to handy --transcribe-file --json
- text_to_speech / speak ΓåÆ routes to Voicebox REST (VOICEBOX_URL) or
  VibeVoice vLLM (VIBEVOICE_TTS_URL)
- transcribe_audio_high_quality ΓåÆ routes to VibeVoice-ASR (VIBEVOICE_ASR_URL)
"""

from __future__ import annotations

import json
import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _mock_httpx_response(
    status_code: int = 200,
    json_data: dict[str, Any] | None = None,
    content: bytes = b"",
    text: str = "",
) -> MagicMock:
    """Build a mock httpx.Response."""
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data or {}
    resp.content = content
    resp.text = text
    resp.raise_for_status = MagicMock()
    return resp


class _MockAsyncClient:
    """Minimal async context-manager httpx.AsyncClient mock."""

    def __init__(self, post_response: MagicMock | None = None) -> None:
        self._post_response = post_response
        self.post = AsyncMock(return_value=post_response)
        self.get = AsyncMock(return_value=post_response)

    async def __aenter__(self) -> "_MockAsyncClient":
        return self

    async def __aexit__(self, *args: Any) -> None:
        pass


# ---------------------------------------------------------------------------
# transcribe_audio tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_transcribe_audio_calls_handy_cli(tmp_path) -> None:
    """transcribe_audio shells out to handy --transcribe-file --json."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    # Create a dummy WAV file so the file-existence check passes.
    wav_file = tmp_path / "test.wav"
    wav_file.write_bytes(b"RIFF" + b"\x00" * 100)

    mock_proc = AsyncMock()
    mock_proc.returncode = 0
    mock_proc.communicate = AsyncMock(
        return_value=(
            json.dumps({"text": "hello world", "model": "whisper-small"}).encode(),
            b"",
        ),
    )

    with patch("asyncio.create_subprocess_exec", return_value=mock_proc):
        with patch.dict(os.environ, {"HANDY_CLI_PATH": "/usr/local/bin/handy"}):
            result = await _execute_voice_tool(
                "transcribe_audio",
                {"path": str(wav_file)},
                conversation_id=None,
                server_client=None,
                runner_workspace=None,
            )

    parsed = json.loads(result)
    assert parsed["transcription"] == "hello world"


@pytest.mark.asyncio
async def test_transcribe_audio_missing_path() -> None:
    """transcribe_audio returns an error when path is missing."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    result = await _execute_voice_tool(
        "transcribe_audio",
        {},
        conversation_id=None,
        server_client=None,
        runner_workspace=None,
    )
    parsed = json.loads(result)
    assert "error" in parsed
    assert "path" in parsed["error"]


@pytest.mark.asyncio
async def test_transcribe_audio_file_not_found() -> None:
    """transcribe_audio returns an error when the file doesn't exist."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    result = await _execute_voice_tool(
        "transcribe_audio",
        {"path": "/nonexistent/path/audio.wav"},
        conversation_id=None,
        server_client=None,
        runner_workspace=None,
    )
    parsed = json.loads(result)
    assert "error" in parsed
    assert "not found" in parsed["error"]


# ---------------------------------------------------------------------------
# text_to_speech / speak ΓÇö Voicebox path
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_tts_voicebox_routes_to_speak_endpoint() -> None:
    """text_to_speech routes to Voicebox POST /speak when VOICEBOX_URL is set."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    mock_resp = _mock_httpx_response(
        json_data={"generation_id": "gen_123", "profile": "Morgan"},
    )
    mock_client = _MockAsyncClient(post_response=mock_resp)

    with patch.dict(os.environ, {"VOICEBOX_URL": "http://127.0.0.1:17493"}):
        result = await _execute_voice_tool(
            "text_to_speech",
            {"text": "Hello world", "profile": "Morgan"},
            conversation_id=None,
            server_client=mock_client,
            runner_workspace=None,
        )

    parsed = json.loads(result)
    assert parsed["audio_url"] == "http://127.0.0.1:17493/generate/gen_123/status"
    assert parsed["text"] == "Hello world"
    assert parsed["source"] == "voicebox"
    assert parsed["profile"] == "Morgan"
    assert parsed["generation_id"] == "gen_123"

    # Verify the POST was made to /speak with the right payload
    mock_client.post.assert_called_once()
    call_args = mock_client.post.call_args
    assert "/speak" in call_args.args[0]
    body = call_args.kwargs["json"]
    assert body["text"] == "Hello world"
    assert body["profile"] == "Morgan"


@pytest.mark.asyncio
async def test_tts_voicebox_maps_voice_to_profile() -> None:
    """The generic 'voice' arg maps to Voicebox's 'profile' parameter."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    mock_resp = _mock_httpx_response(
        json_data={"generation_id": "gen_456", "profile": "Scarlett"},
    )
    mock_client = _MockAsyncClient(post_response=mock_resp)

    with patch.dict(os.environ, {"VOICEBOX_URL": "http://127.0.0.1:17493"}):
        result = await _execute_voice_tool(
            "speak",
            {"text": "Hi there", "voice": "Scarlett"},
            conversation_id=None,
            server_client=mock_client,
            runner_workspace=None,
        )

    parsed = json.loads(result)
    assert parsed["source"] == "voicebox"

    call_args = mock_client.post.call_args
    body = call_args.kwargs["json"]
    assert body["profile"] == "Scarlett"


@pytest.mark.asyncio
async def test_tts_voicebox_error_response() -> None:
    """Voicebox HTTP errors are surfaced in the tool output."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    mock_resp = _mock_httpx_response(
        status_code=500,
        text="Internal Server Error",
    )
    mock_client = _MockAsyncClient(post_response=mock_resp)

    with patch.dict(os.environ, {"VOICEBOX_URL": "http://127.0.0.1:17493"}):
        result = await _execute_voice_tool(
            "text_to_speech",
            {"text": "Hello"},
            conversation_id=None,
            server_client=mock_client,
            runner_workspace=None,
        )

    parsed = json.loads(result)
    assert "error" in parsed
    assert "500" in parsed["error"]


# ---------------------------------------------------------------------------
# text_to_speech / speak ΓÇö VibeVoice fallback path
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_tts_vibevoice_fallback() -> None:
    """text_to_speech falls back to VibeVoice vLLM when VOICEBOX_URL is unset."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    mock_resp = _mock_httpx_response(
        content=b"fake_audio_bytes",
    )
    mock_client = _MockAsyncClient(post_response=mock_resp)

    env = {k: v for k, v in os.environ.items() if k != "VOICEBOX_URL"}
    env["VIBEVOICE_TTS_URL"] = "http://127.0.0.1:8000/v1"
    with patch.dict(os.environ, env, clear=True):
        result = await _execute_voice_tool(
            "text_to_speech",
            {"text": "Hello from VibeVoice"},
            conversation_id=None,
            server_client=mock_client,
            runner_workspace=None,
        )

    parsed = json.loads(result)
    assert parsed["source"] == "vibevoice"
    assert parsed["audio_url"].startswith("data:audio/wav;base64,")
    assert parsed["text"] == "Hello from VibeVoice"


# ---------------------------------------------------------------------------
# text_to_speech / speak ΓÇö no endpoint configured
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_tts_no_endpoint_configured() -> None:
    """text_to_speech returns a helpful error when no TTS endpoint is set."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    env = {
        k: v
        for k, v in os.environ.items()
        if k not in ("VOICEBOX_URL", "VIBEVOICE_TTS_URL")
    }
    with patch.dict(os.environ, env, clear=True):
        result = await _execute_voice_tool(
            "text_to_speech",
            {"text": "Hello"},
            conversation_id=None,
            server_client=None,
            runner_workspace=None,
        )

    parsed = json.loads(result)
    assert "error" in parsed
    assert "VOICEBOX_URL" in parsed["error"]
    assert "VIBEVOICE_TTS_URL" in parsed["error"]


@pytest.mark.asyncio
async def test_tts_missing_text() -> None:
    """text_to_speech returns an error when text is missing."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    result = await _execute_voice_tool(
        "speak",
        {},
        conversation_id=None,
        server_client=None,
        runner_workspace=None,
    )
    parsed = json.loads(result)
    assert "error" in parsed
    assert "text" in parsed["error"]


# ---------------------------------------------------------------------------
# transcribe_audio_high_quality tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_hq_transcribe_no_asr_url() -> None:
    """transcribe_audio_high_quality returns error when VIBEVOICE_ASR_URL is unset."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    env = {k: v for k, v in os.environ.items() if k != "VIBEVOICE_ASR_URL"}
    with patch.dict(os.environ, env, clear=True):
        result = await _execute_voice_tool(
            "transcribe_audio_high_quality",
            {"path": "/tmp/test.wav"},
            conversation_id=None,
            server_client=None,
            runner_workspace=None,
        )

    parsed = json.loads(result)
    assert "error" in parsed
    assert "VIBEVOICE_ASR_URL" in parsed["error"]


# ---------------------------------------------------------------------------
# Unknown tool
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_unknown_voice_tool() -> None:
    """Unknown voice tool names return an error."""
    from omnigent.runner.tool_dispatch import _execute_voice_tool

    result = await _execute_voice_tool(
        "unknown_voice_tool",
        {},
        conversation_id=None,
        server_client=None,
        runner_workspace=None,
    )
    parsed = json.loads(result)
    assert "error" in parsed
    assert "unknown" in parsed["error"]
