"""Tests for the Hermes voice proxy (agent_meow.server.voice_proxy).

Covers the three behaviors the production stack depends on:
- No router when HERMES_VOICE_URL is unset (voice features off, no crash).
- Header hygiene: hop-by-hop and browser headers stripped, Authorization
  always overridden with the server-side HERMES_API_KEY.
- Hermes outage surfaces as a clean 502, not an unhandled 500.
"""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import agent_meow.server.voice_proxy as voice_proxy


@pytest.fixture(autouse=True)
def _reset_router_cache(monkeypatch: pytest.MonkeyPatch):
    """Each test builds a fresh router — the module caches one globally."""
    monkeypatch.setattr(voice_proxy, "_router", None)
    yield
    monkeypatch.setattr(voice_proxy, "_router", None)


def _build_app(monkeypatch: pytest.MonkeyPatch, **env: str) -> FastAPI | None:
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    router = voice_proxy.get_voice_proxy_router()
    if router is None:
        return None
    app = FastAPI()
    app.include_router(router)
    return app


def test_no_router_when_hermes_url_unset(monkeypatch: pytest.MonkeyPatch) -> None:
    """Without HERMES_VOICE_URL the proxy is inert — voice features off."""
    monkeypatch.delenv("HERMES_VOICE_URL", raising=False)
    assert voice_proxy.get_voice_proxy_router() is None


def test_router_built_when_hermes_url_set(monkeypatch: pytest.MonkeyPatch) -> None:
    """With HERMES_VOICE_URL set, the proxy registers the voice paths."""
    app = _build_app(monkeypatch, HERMES_VOICE_URL="http://hermes:8642")
    assert app is not None
    paths = {route.path for route in app.routes}
    assert "/v1/audio/transcriptions" in paths
    assert "/v1/audio/speech" in paths
    assert "/v1/chat/completions" in paths


def test_speech_routed_to_qwen_tts_when_configured(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """With QWEN_TTS_URL set, /v1/audio/speech (the browser's Edge-failure
    fallback) must go to Qwen3-TTS /tts — NOT back to Hermes, whose Edge
    path just failed. Mirrors the Vite dev proxy routing."""
    captured: dict[str, str] = {}

    class _FakeResponse:
        status_code = 200
        headers = {"content-type": "audio/wav"}

        async def aiter_bytes(self):
            yield b"audio"

        async def aclose(self) -> None:
            pass

    class _FakeClient:
        def __init__(self, timeout=None):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            return object()

        async def send(self, req, stream=False):
            return _FakeResponse()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        QWEN_TTS_URL="http://qwen3-tts:8889",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    resp = client.post("/v1/audio/speech", json={"text": "hello"})
    assert resp.status_code == 200
    assert captured["url"] == "http://qwen3-tts:8889/tts"


def test_speech_still_routes_to_hermes_without_qwen(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Without QWEN_TTS_URL, /v1/audio/speech keeps going to Hermes
    (previous behavior — no regression for stacks without Qwen3-TTS)."""
    captured: dict[str, str] = {}

    class _FakeResponse:
        status_code = 200
        headers = {"content-type": "audio/mpeg"}

        async def aiter_bytes(self):
            yield b"audio"

        async def aclose(self) -> None:
            pass

    class _FakeClient:
        def __init__(self, timeout=None):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            return object()

        async def send(self, req, stream=False):
            return _FakeResponse()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    client.post("/v1/audio/speech", json={"input": "hello"})
    assert captured["url"] == "http://hermes:8642/v1/audio/speech"


def test_hermes_outage_returns_502(monkeypatch: pytest.MonkeyPatch) -> None:
    """A connection failure surfaces as a clean 502 JSON error."""
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes-unreachable.invalid:8642",
        HERMES_API_KEY="test-key",
    )
    assert app is not None
    client = TestClient(app)
    resp = client.post("/v1/chat/completions", json={"model": "hermes-agent"})
    assert resp.status_code == 502
    assert "unreachable" in resp.json()["error"]


def test_authorization_overridden_with_server_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The browser's (possibly stale) Authorization header is replaced by
    the server-side HERMES_API_KEY — httpx would otherwise send the first
    matching header, letting a stale lowercase value shadow the override."""
    captured: dict[str, str] = {}

    class _FakeResponse:
        status_code = 200
        headers = {"content-type": "application/json"}

        async def aiter_bytes(self):
            yield b'{"ok": true}'

        async def aclose(self) -> None:
            pass

    class _FakeClient:
        def __init__(self, timeout=None):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            captured["headers"] = dict(headers or {})
            return object()

        async def send(self, req, stream=False):
            return _FakeResponse()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="server-side-key",
    )
    assert app is not None
    client = TestClient(app)
    # Browser sends a stale key — the proxy must replace it.
    resp = client.post(
        "/v1/chat/completions",
        json={"model": "hermes-agent"},
        headers={"Authorization": "Bearer stale-browser-key"},
    )
    assert resp.status_code == 200
    assert captured["headers"]["Authorization"] == "Bearer server-side-key"
    assert captured["url"] == "http://hermes:8642/v1/chat/completions"


def test_browser_headers_stripped(monkeypatch: pytest.MonkeyPatch) -> None:
    """origin/referer/sec-* headers are dropped — Hermes's origin checks
    reject browser-originated requests with 403 otherwise."""
    captured: dict[str, str] = {}

    class _FakeResponse:
        status_code = 200
        headers = {"content-type": "application/json"}

        async def aiter_bytes(self):
            yield b"{}"

        async def aclose(self) -> None:
            pass

    class _FakeClient:
        def __init__(self, timeout=None):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["headers"] = dict(headers or {})
            return object()

        async def send(self, req, stream=False):
            return _FakeResponse()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    client.post(
        "/v1/audio/transcriptions",
        content=b"audio-bytes",
        headers={
            "Origin": "http://localhost:6767",
            "Referer": "http://localhost:6767/",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
        },
    )
    forwarded = {k.lower() for k in captured["headers"]}
    assert "origin" not in forwarded
    assert "referer" not in forwarded
    assert "sec-fetch-site" not in forwarded
    assert "sec-fetch-mode" not in forwarded