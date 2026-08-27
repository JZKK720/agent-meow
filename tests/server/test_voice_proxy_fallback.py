"""Smoke test for the TTS Edge→Qwen3-TTS offline fallback.

Verifies:
1. When Hermes (Edge TTS) is reachable, it serves the request (primary path).
2. When Hermes is unreachable, the proxy falls back to tts-server.exe.
3. The fallback body preserves the original speaker (Serena), not the
   Edge TTS voice (XiaoxiaoNeural) that _force_edge_voice would have set.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi import FastAPI
from starlette.testclient import TestClient

from agent_meow.server import voice_proxy


def _build_app(monkeypatch, **env):
    """Build a voice proxy app with the given env vars."""
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    # Reset the singleton router so it picks up the new env.
    voice_proxy._router = None
    # Clear the playback registry so prior test runs don't block with 409.
    voice_proxy._active_playbacks.clear()
    router = voice_proxy.get_voice_proxy_router()
    assert router is not None, "voice proxy router not mounted"
    app = FastAPI()
    app.include_router(router)
    return app


class _FakeResponse:
    """Minimal fake httpx.Response for streaming."""

    def __init__(self, status_code=200, content=b"audio", headers=None):
        self.status_code = status_code
        self._content = content
        self.headers = headers or {"content-type": "audio/mpeg"}

    async def aiter_bytes(self):
        yield self._content

    async def aclose(self):
        pass


class _FakeClient:
    """Fake httpx.AsyncClient that simulates connection failures."""

    def __init__(self, fail_primary=False, fail_fallback=False):
        self._fail_primary = fail_primary
        self._fail_fallback = fail_fallback
        self._call_count = 0

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    async def aclose(self):
        pass

    def build_request(self, method, url, **kwargs):
        return MagicMock(method=method, url=url)

    async def send(self, req, stream=True):
        self._call_count += 1
        # First call = primary (Hermes). Second call = fallback (tts-server.exe).
        if self._call_count == 1 and self._fail_primary:
            raise httpx.ConnectError("Hermes unreachable")
        if self._call_count == 2 and self._fail_fallback:
            raise httpx.ConnectError("tts-server.exe unreachable")
        return _FakeResponse()


def test_tts_primary_succeeds_when_hermes_online(monkeypatch):
    """When Hermes is reachable, Edge TTS serves the request — no fallback."""
    fake_client = _FakeClient(fail_primary=False)
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", lambda **kw: fake_client)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
        QWENTTS_SERVER_URL="http://tts:8891",
    )
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello", "speaker": "Serena"})
    assert resp.status_code == 200
    assert fake_client._call_count == 1  # only primary was called


def test_tts_falls_back_to_qwen_when_hermes_offline(monkeypatch):
    """When Hermes is unreachable, the proxy retries against tts-server.exe."""
    fake_client = _FakeClient(fail_primary=True)
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", lambda **kw: fake_client)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
        QWENTTS_SERVER_URL="http://tts:8891",
    )
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello", "speaker": "Serena"})
    assert resp.status_code == 200
    assert fake_client._call_count == 2  # primary failed, fallback succeeded


def test_tts_fallback_preserves_speaker_not_edge_voice(monkeypatch):
    """The fallback body should have speaker=Serena, not XiaoxiaoNeural.

    _force_edge_voice overwrites voice to zh-CN-XiaoxiaoNeural for the
    primary (Edge TTS) request. The fallback must use the ORIGINAL body
    (before edge-voice forcing) so tts-server.exe gets speaker=Serena.
    """
    captured_bodies = []

    class _CapturingClient(_FakeClient):
        def build_request(self, method, url, **kwargs):
            content = kwargs.get("content", b"")
            captured_bodies.append({"url": url, "content": content})
            return super().build_request(method, url, **kwargs)

    fake_client = _CapturingClient(fail_primary=True)
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", lambda **kw: fake_client)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
        QWENTTS_SERVER_URL="http://tts:8891",
    )
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello", "speaker": "Serena"})
    assert resp.status_code == 200

    # Two requests: primary (Hermes) and fallback (tts-server.exe)
    assert len(captured_bodies) == 2

    # The fallback body should contain Serena, not XiaoxiaoNeural
    fallback_body = json.loads(captured_bodies[1]["content"])
    assert fallback_body.get("voice") == "Serena" or fallback_body.get("speaker") == "Serena", \
        f"Fallback body should have Serena, got: {fallback_body}"
    # It should NOT have the Edge TTS voice
    assert "XiaoxiaoNeural" not in json.dumps(fallback_body), \
        f"Fallback body should not contain XiaoxiaoNeural, got: {fallback_body}"


def test_tts_no_fallback_when_qwentts_not_set(monkeypatch):
    """Without QWENTTS_SERVER_URL, a Hermes failure returns 502 (no fallback)."""
    fake_client = _FakeClient(fail_primary=True)
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", lambda **kw: fake_client)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
        # QWENTTS_SERVER_URL NOT set
    )
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello", "speaker": "Serena"})
    assert resp.status_code == 502
    assert fake_client._call_count == 1  # only primary attempted


def test_tts_both_fail_returns_502(monkeypatch):
    """When both Hermes and tts-server.exe are unreachable, return 502."""
    fake_client = _FakeClient(fail_primary=True, fail_fallback=True)
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", lambda **kw: fake_client)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
        QWENTTS_SERVER_URL="http://tts:8891",
    )
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello", "speaker": "Serena"})
    assert resp.status_code == 502
    assert fake_client._call_count == 2  # both attempted


def test_tts_falls_back_on_hermes_5xx(monkeypatch):
    """When Hermes returns HTTP 500 (Edge TTS failed inside Hermes),
    the proxy retries against tts-server.exe.

    This is the most common offline scenario: Hermes is reachable but
    Edge TTS can't reach the internet, so Hermes returns 500.
    """

    class _FakeClient5xx(_FakeClient):
        async def send(self, req, stream=True):
            self._call_count += 1
            if self._call_count == 1:
                # Primary returns 500 (Edge TTS failed inside Hermes)
                return _FakeResponse(status_code=500, content=b'{"error":"edge tts failed"}')
            # Fallback succeeds
            return _FakeResponse(status_code=200, content=b"wav audio")

    fake_client = _FakeClient5xx()
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", lambda **kw: fake_client)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
        QWENTTS_SERVER_URL="http://tts:8891",
    )
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello", "speaker": "Serena"})
    assert resp.status_code == 200
    assert fake_client._call_count == 2  # primary 500'd, fallback succeeded