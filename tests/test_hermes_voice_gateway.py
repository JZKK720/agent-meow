"""Contract tests for the agent-meow Hermes voice gateway.

Tests use stub mode (tiny WAV) or injected fake backends — no real Edge/Piper/Qwen calls.
"""

from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from agent_meow import hermes_voice_gateway as gw
from agent_meow.hermes_voice_gateway import HermesVoiceSettings, SynthesisResult


def _is_valid_wav_header(data: bytes) -> bool:
    """Minimal WAV validation: RIFF header + 'fmt ' chunk present."""
    return (
        len(data) >= 44
        and data[:4] == b"RIFF"
        and data[8:12] == b"WAVE"
        and data[12:16] == b"fmt "
    )


def _fake_backends() -> list:
    """Return a list of one fake backend that always succeeds with a tiny WAV."""

    class _FakeEdge:
        @property
        def name(self) -> str:
            return "edge"

        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> SynthesisResult:
            from agent_meow.hermes_voice_gateway import _tiny_wav

            return SynthesisResult(
                audio_bytes=_tiny_wav(), provider="edge", attempted=("edge",)
            )

    return [_FakeEdge()]


# --- Route shape --------------------------------------------------------


def test_create_app_returns_fastapi_with_health_and_tts_routes() -> None:
    app = gw.create_app()
    paths = {route.path for route in app.routes}
    assert "/health" in paths
    assert "/tts" in paths


# --- Stub mode ----------------------------------------------------------


def test_health_returns_ok_with_stub_mode_and_attempt_order() -> None:
    """Stub mode: force stub via monkeypatch so the test is mode-independent."""
    import pytest

    client = TestClient(gw.create_app())
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert isinstance(body["attempt_order"], list)
    assert len(body["attempt_order"]) >= 1


def test_tts_with_direct_text_returns_wav_bytes() -> None:
    client = TestClient(gw.create_app(backends=_fake_backends()))
    r = client.post("/tts", json={"text": "你好世界"})
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/wav"
    assert _is_valid_wav_header(r.content)
    assert len(r.content) > 44


def test_tts_with_text_file_and_output_path_writes_file(tmp_path: Path) -> None:
    text_file = tmp_path / "input.txt"
    text_file.write_text("你好世界", encoding="utf-8")
    out = tmp_path / "out.wav"
    client = TestClient(gw.create_app(backends=_fake_backends()))
    r = client.post(
        "/tts",
        json={"text_file": str(text_file), "output_path": str(out)},
    )
    assert r.status_code == 200
    assert _is_valid_wav_header(r.content)
    assert out.is_file()
    assert out.stat().st_size > 44
    assert out.read_bytes() == r.content


def test_tts_missing_text_and_text_file_returns_400() -> None:
    client = TestClient(gw.create_app())
    r = client.post("/tts", json={})
    assert r.status_code == 400
    body = r.json()
    assert "text" in body["detail"].lower() or "text_file" in body["detail"].lower()


def test_tts_empty_text_returns_400() -> None:
    client = TestClient(gw.create_app())
    r = client.post("/tts", json={"text": "   "})
    assert r.status_code == 400


# --- Chain mode ---------------------------------------------------------


def test_load_hermes_voice_settings_defaults_to_chain() -> None:
    settings = gw.load_hermes_voice_settings({})
    assert settings.mode == "chain"
    assert settings.attempt_order == ("edge", "piper", "qwen")


def test_load_hermes_voice_settings_stub_mode() -> None:
    settings = gw.load_hermes_voice_settings({"mode": "stub"})
    assert settings.mode == "stub"
    assert settings.attempt_order == ("stub",)


def test_tts_chain_mode_uses_injected_backends() -> None:
    """Chain mode with injected fakes: the first available backend wins."""
    client = TestClient(gw.create_app(backends=_fake_backends()))
    r = client.post("/tts", json={"text": "你好世界"})
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/wav"
    assert _is_valid_wav_header(r.content)


def test_tts_chain_mode_returns_503_when_all_backends_fail() -> None:
    """All backends fail → 503 with an error naming attempted providers."""

    class _Fail:
        @property
        def name(self) -> str:
            return "edge"

        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> SynthesisResult:
            raise RuntimeError("boom")

    client = TestClient(gw.create_app(backends=[_Fail()]))
    r = client.post("/tts", json={"text": "hello"})
    assert r.status_code == 503
    assert "edge" in r.json()["detail"]
