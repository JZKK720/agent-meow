"""Tests for the Hermes voice proxy (agent_meow.server.voice_proxy).

Covers the three behaviors the production stack depends on:
- No router when HERMES_VOICE_URL is unset (voice features off, no crash).
- Header hygiene: hop-by-hop and browser headers stripped, Authorization
  always overridden with the server-side HERMES_API_KEY.
- Hermes outage surfaces as a clean 502, not an unhandled 500.
"""

from __future__ import annotations

import json

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


def test_openapi_schema_documents_voice_routes(monkeypatch: pytest.MonkeyPatch) -> None:
    """The webhook/OpenAPI schema must document the voice surface with real
    summaries.

    Root cause of the \"schema is wrong\" report (2026-09-02): the proxy's
    bare handlers collapsed every voice route into one anonymous \" H\"
    operation in /openapi.json, so the schema looked broken to clients.
    Each route must now carry a distinct summary (and the STT route a
    description of the VAD-segmented upload contract).
    """
    app = _build_app(monkeypatch, HERMES_VOICE_URL="http://hermes:8642")
    assert app is not None
    schema = app.openapi()
    stt = schema["paths"]["/v1/audio/transcriptions"]["post"]
    tts = schema["paths"]["/v1/audio/speech"]["post"]
    assert stt["summary"] == "Speech-to-text (VAD-segmented WAV)"
    assert tts["summary"] == "Text-to-speech (voice replies)"
    # The STT description documents the mic-ownership rule.
    assert "user gesture" in stt["description"]
    # Summaries are unique — no two routes share the same operation title.
    summaries = [
        schema["paths"][p]["post"]["summary"]
        for p in (
            "/v1/audio/transcriptions",
            "/v1/audio/speech",
            "/v1/audio/speech/stream",
            "/v1/audio/speech/edge",
            "/v1/chat/completions",
        )
        if p in schema["paths"]
    ]
    assert len(summaries) == len(set(summaries))


def test_speech_routed_to_qwen_tts_when_configured(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """With QWEN_TTS_URL set, /v1/audio/speech (the browser's primary TTS
    path for voice replies) goes to Qwen3-TTS /tts — NOT Hermes. Qwen is
    the primary TTS (reliable for zh/en, Serena voice); Hermes Edge TTS
    has a Chinese-text event-loop bug. Mirrors web/vite.config.ts."""
    captured: dict[str, str | bytes] = {}

    class _FakeResponse:
        status_code = 200
        headers = {"content-type": "audio/wav"}

        async def aiter_bytes(self):
            yield b"audio"

        async def aclose(self) -> None:
            pass

    class _FakeClient:
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            captured["body"] = content
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
    resp = client.post("/v1/audio/speech", json={"input": "hello", "response_format": "wav"})
    assert resp.status_code == 200
    assert captured["url"] == "http://qwen3-tts:8889/tts"
    payload = json.loads((captured["body"] or b"{}").decode())
    assert payload["text"] == "hello"
    assert "input" not in payload


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
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

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
    resp = client.post("/v1/audio/speech", json={"input": "hello"})
    assert resp.status_code == 200
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
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

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
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

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


# --- Playback ownership contract (REQ-001..003, REQ-006, REQ-007) ----------


@pytest.fixture(autouse=True)
def _reset_playback_registry(monkeypatch: pytest.MonkeyPatch):
    """Clear the playback ownership registry between tests."""
    voice_proxy._active_playbacks.clear()
    # Reset the counter so request IDs are deterministic per test.
    monkeypatch.setattr(voice_proxy, "_playback_counter", __import__("itertools").count(1))
    yield
    voice_proxy._active_playbacks.clear()


def _fake_hermes_client(captured: dict, *, status_code: int = 200) -> type:
    """A fake httpx.AsyncClient that records the upstream URL and body."""

    class _FakeResponse:
        def __init__(self):
            self.status_code = status_code
            self.headers = {"content-type": "audio/mpeg"}

        async def aiter_bytes(self):
            yield b"audio"

        async def aclose(self) -> None:
            pass

    class _FakeClient:
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            captured["body"] = content
            return object()

        async def send(self, req, stream=False):
            return _FakeResponse()

    return _FakeClient


def test_bom_prefixed_json_body_tolerated(monkeypatch: pytest.MonkeyPatch) -> None:
    """A UTF-8 BOM-prefixed JSON body for /v1/audio/speech must be parsed
    and forwarded without the BOM (REQ-006)."""
    captured: dict[str, bytes] = {}
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _fake_hermes_client(captured))
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    # \xef\xbb\xbf is the UTF-8 BOM.
    bom_body = b"\xef\xbb\xbf" + json.dumps({"input": "hello"}).encode()
    resp = client.post(
        "/v1/audio/speech",
        content=bom_body,
        headers={"content-type": "application/json"},
    )
    assert resp.status_code == 200
    # The forwarded body must be valid JSON without a BOM.
    forwarded = captured["body"]
    assert forwarded[:3] != b"\xef\xbb\xbf"
    payload = json.loads(forwarded.decode())
    assert payload["input"] == "hello"


def test_owner_inferred_from_route(monkeypatch: pytest.MonkeyPatch) -> None:
    """/v1/audio/speech → owner=autoplay; /v1/audio/speech/edge → owner=manual."""
    captured: dict[str, str] = {}

    class _FakeClient:
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            return object()

        async def send(self, req, stream=False):
            class _R:
                status_code = 200
                headers = {"content-type": "audio/mpeg"}

                async def aiter_bytes(self):
                    yield b"audio"

                async def aclose(self) -> None:
                    pass

            return _R()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    # Generic speech → autoplay.
    client.post("/v1/audio/speech", json={"input": "auto"})
    assert "vp-000001" in voice_proxy._active_playbacks
    assert voice_proxy._active_playbacks["vp-000001"]["owner"] == "autoplay"
    # Explicit edge → manual.
    client.post("/v1/audio/speech/edge", json={"input": "manual"})
    assert "vp-000002" in voice_proxy._active_playbacks
    assert voice_proxy._active_playbacks["vp-000002"]["owner"] == "manual"


def test_manual_cancels_active_autoplay_for_same_message(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Manual read-aloud for the same message cancels active autoplay
    (REQ-001, REQ-002). The autoplay playback's cancel_event is set."""
    captured: dict[str, str] = {}

    class _FakeClient:
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            return object()

        async def send(self, req, stream=False):
            class _R:
                status_code = 200
                headers = {"content-type": "audio/mpeg"}

                async def aiter_bytes(self):
                    yield b"audio"

                async def aclose(self) -> None:
                    pass

            return _R()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    # Autoplay for a message.
    client.post(
        "/v1/audio/speech", json={"input": "same text", "message_id": "msg-1"}
    )
    auto_state = voice_proxy._active_playbacks["vp-000001"]
    assert auto_state["owner"] == "autoplay"
    assert not auto_state["cancel_event"].is_set()
    # Manual for the same message — should cancel the autoplay.
    client.post(
        "/v1/audio/speech/edge", json={"input": "same text", "message_id": "msg-1"}
    )
    assert auto_state["cancel_event"].is_set()
    assert auto_state["cancel_reason"] == "manual_override"


def test_autoplay_blocked_by_active_manual_for_same_message(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Autoplay is blocked (409) while a manual playback is active for the
    same message (REQ-001, REQ-003)."""
    captured: dict[str, str] = {}

    class _FakeClient:
        def __init__(self, timeout=None, **kwargs):
            pass

        async def aclose(self) -> None:
            pass

        def build_request(self, method, url, content=None, headers=None, params=None):
            captured["url"] = url
            return object()

        async def send(self, req, stream=False):
            class _R:
                status_code = 200
                headers = {"content-type": "audio/mpeg"}

                async def aiter_bytes(self):
                    yield b"audio"

                async def aclose(self) -> None:
                    pass

            return _R()

    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _FakeClient)
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    # Manual first.
    resp_manual = client.post(
        "/v1/audio/speech/edge", json={"input": "shared", "message_id": "msg-2"}
    )
    assert resp_manual.status_code == 200
    # Autoplay for the same message — must be blocked.
    resp_auto = client.post(
        "/v1/audio/speech", json={"input": "shared", "message_id": "msg-2"}
    )
    assert resp_auto.status_code == 409
    assert "blocked" in resp_auto.json()["error"]


def test_edge_tts_forces_xiaoxiao_voice(monkeypatch: pytest.MonkeyPatch) -> None:
    """The /v1/audio/speech/edge route forces voice=zh-CN-XiaoxiaoNeural
    in the forwarded body."""
    captured: dict[str, bytes] = {}
    monkeypatch.setattr(voice_proxy.httpx, "AsyncClient", _fake_hermes_client(captured))
    app = _build_app(
        monkeypatch,
        HERMES_VOICE_URL="http://hermes:8642",
        HERMES_API_KEY="k",
    )
    assert app is not None
    client = TestClient(app)
    client.post("/v1/audio/speech/edge", json={"input": "hello"})
    payload = json.loads(captured["body"].decode())
    assert payload["voice"] == "zh-CN-XiaoxiaoNeural"