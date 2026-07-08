"""Focused tests for the agent-meow docs/images/voice runner dispatch paths."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from omnigent.runner.tool_dispatch import (
    _execute_doc_tool,
    _execute_image_tool,
    _execute_voice_tool,
)


class _JsonResponse:
    def __init__(self, body: dict[str, object], status_code: int = 200) -> None:
        self._body = body
        self.status_code = status_code
        self.content = b""

    def json(self) -> dict[str, object]:
        return self._body


class _BytesResponse:
    def __init__(self, body: bytes, status_code: int = 200) -> None:
        self.status_code = status_code
        self.content = body

    def json(self) -> dict[str, object]:  # pragma: no cover - not used by the tests
        raise AssertionError("json() should not be called for byte responses")


class _FakeServerClient:
    def __init__(self, response: _JsonResponse | _BytesResponse) -> None:
        self.response = response
        self.post_calls: list[tuple[str, dict[str, object], float | None]] = []
        self.patch_calls: list[tuple[str, dict[str, object], float | None]] = []

    async def post(
        self,
        url: str,
        json: dict[str, object] | None = None,
        timeout: float | None = None,
    ) -> _JsonResponse | _BytesResponse:
        self.post_calls.append((url, json or {}, timeout))
        return self.response

    async def patch(
        self,
        url: str,
        json: dict[str, object] | None = None,
        timeout: float | None = None,
    ) -> _JsonResponse | _BytesResponse:
        self.patch_calls.append((url, json or {}, timeout))
        return self.response


@pytest.mark.asyncio
async def test_text_to_speech_returns_data_url_not_image_resource(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """TTS returns an inline audio URL and never hits the images surface."""
    monkeypatch.setenv("VIBEVOICE_TTS_URL", "http://tts.local/v1")
    client = _FakeServerClient(_BytesResponse(b"RIFFdemo-wav"))

    result = await _execute_voice_tool(
        "text_to_speech",
        {"text": "hello world"},
        conversation_id="conv_voice",
        server_client=client,  # type: ignore[arg-type]
        runner_workspace=None,
    )

    payload = json.loads(result)
    assert payload["audio_url"].startswith("data:audio/wav;base64,")
    assert client.post_calls == [
        ("http://tts.local/v1/audio/speech", {"model": "vibevoice-tts", "input": "hello world"}, 120.0)
    ]


@pytest.mark.asyncio
async def test_doc_generate_returns_placeholder_metadata() -> None:
    """doc_generate advertises placeholder creation explicitly in v1."""
    client = _FakeServerClient(_JsonResponse({"id": "doc_123", "title": "Roadmap"}))

    result = await _execute_doc_tool(
        "doc_generate",
        {"topic": "Roadmap", "outline": "- Ship it", "instructions": "Be concise"},
        "{}",
        conversation_id="conv_docs",
        server_client=client,  # type: ignore[arg-type]
    )

    payload = json.loads(result)
    assert payload["placeholder"] is True
    assert payload["generated"] is False
    assert client.post_calls[0][0] == "/v1/sessions/conv_docs/resources/documents"
    assert "placeholder" in client.post_calls[0][1]["content_md"]


@pytest.mark.asyncio
async def test_image_generate_returns_stub_error() -> None:
    """image_generate stays an explicit stub until a provider is wired."""
    result = await _execute_image_tool(
        "image_generate",
        {"prompt": "a cat"},
        conversation_id="conv_images",
        server_client=_FakeServerClient(_JsonResponse({})),  # type: ignore[arg-type]
        runner_workspace=Path("."),
    )

    payload = json.loads(result)
    assert payload["stub"] is True
    assert "not yet wired" in payload["error"]