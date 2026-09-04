"""Focused tests for the agent-meow docs/images/voice runner dispatch paths."""

from __future__ import annotations

import json

import pytest

from agent_meow.runner.tool_dispatch import (
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
async def test_text_to_speech_returns_not_configured_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """TTS returns a not-configured error until HERMES_TTS_URL is wired (Phase A)."""
    monkeypatch.delenv("HERMES_TTS_URL", raising=False)
    result = await _execute_voice_tool(
        "text_to_speech",
        json.dumps({"text": "hello world"}),
    )
    payload = json.loads(result)
    assert "error" in payload
    assert "HERMES_TTS_URL" in payload["error"]


@pytest.mark.asyncio
async def test_doc_generate_returns_placeholder_metadata() -> None:
    """doc_generate builds a structured draft and posts it as a markdown doc."""
    client = _FakeServerClient(_JsonResponse({"id": "doc_123", "title": "Roadmap"}))

    result = await _execute_doc_tool(
        "doc_generate",
        json.dumps({"topic": "Roadmap", "outline": "- Ship it", "instructions": "Be concise"}),
        conversation_id="conv_docs",
        server_client=client,  # type: ignore[arg-type]
    )

    payload = json.loads(result)
    assert payload["document"]["id"] == "doc_123"
    assert client.post_calls[0][0] == "/v1/sessions/conv_docs/resources/documents"
    posted = client.post_calls[0][1]["content_md"]
    assert "Roadmap" in posted and "- Ship it" in posted


@pytest.mark.asyncio
async def test_image_generate_returns_stub_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """image_generate without a configured provider returns a setup error."""
    for var in ("IMAGE_GEN_PROVIDER", "FAL_KEY", "DASHSCOPE_API_KEY",
                "IMAGE_GEN_API_URL", "A1111_API_URL", "DASHSCOPE_BASE_URL",
                "IMAGE_GEN_MODEL"):
        monkeypatch.delenv(var, raising=False)
    result = await _execute_image_tool(
        "image_generate",
        json.dumps({"prompt": "a cat"}),
        conversation_id="conv_images",
        server_client=_FakeServerClient(_JsonResponse({})),  # type: ignore[arg-type]
    )

    payload = json.loads(result)
    assert "no image-generation provider configured" in payload["error"]