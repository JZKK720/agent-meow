"""Contract tests for the agent-meow Hermes voice gateway skeleton.

No real Edge/Piper/Qwen calls — the stub synthesizer returns a tiny valid WAV.
"""

from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from agent_meow import hermes_voice_gateway as gw


def _is_valid_wav_header(data: bytes) -> bool:
    """Minimal WAV validation: RIFF header + 'fmt ' chunk present."""
    return (
        len(data) >= 44
        and data[:4] == b"RIFF"
        and data[8:12] == b"WAVE"
        and data[12:16] == b"fmt "
    )


def test_create_app_returns_fastapi_with_health_and_tts_routes() -> None:
    app = gw.create_app()
    paths = {route.path for route in app.routes}
    assert "/health" in paths
    assert "/tts" in paths


def test_health_returns_ok_with_stub_mode_and_attempt_order() -> None:
    client = TestClient(gw.create_app())
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["mode"] == "stub"
    assert isinstance(body["attempt_order"], list)
    assert len(body["attempt_order"]) >= 1


def test_tts_with_direct_text_returns_wav_bytes() -> None:
    client = TestClient(gw.create_app())
    r = client.post("/tts", json={"text": "你好世界"})
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/wav"
    assert _is_valid_wav_header(r.content)
    assert len(r.content) > 44


def test_tts_with_text_file_and_output_path_writes_file(tmp_path: Path) -> None:
    text_file = tmp_path / "input.txt"
    text_file.write_text("你好世界", encoding="utf-8")
    out = tmp_path / "out.wav"
    client = TestClient(gw.create_app())
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


def test_load_hermes_voice_settings_defaults() -> None:
    settings = gw.load_hermes_voice_settings({})
    assert settings.mode == "stub"
    assert isinstance(settings.attempt_order, tuple)
    assert settings.attempt_order == ("stub",)
