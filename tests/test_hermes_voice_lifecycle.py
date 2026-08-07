"""Lifecycle tests for the agent-meow Hermes voice gateway (Task 3).

Verifies the gateway can be started via ``python -m agent_meow.hermes_voice_gateway``
and the health-check helper works. Uses TestClient for the app-level checks
and does not bind a real port.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from agent_meow import hermes_voice_gateway as gw


def test_main_exists_and_is_callable() -> None:
    """The gateway module has a main() entrypoint for ``python -m``."""
    assert callable(gw.main)


def test_check_gateway_health_returns_false_on_dead_port() -> None:
    """check_gateway_health returns False when nothing is listening."""
    assert gw.check_gateway_health("http://127.0.0.1:99999", timeout_s=1.0) is False


def test_gateway_app_responds_to_health_check() -> None:
    """The gateway app responds to /health, simulating a live gateway."""
    client = TestClient(gw.create_app())
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "mode" in body
    assert "attempt_order" in body


def test_gateway_app_responds_to_tts() -> None:
    """The gateway app responds to /tts with audio bytes."""
    from agent_meow.hermes_voice_gateway import _tiny_wav, HermesVoiceSettings

    class _FakeBackend:
        @property
        def name(self) -> str:
            return "edge"

        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> gw.SynthesisResult:
            return gw.SynthesisResult(
                audio_bytes=_tiny_wav(), provider="edge", attempted=("edge",)
            )

    client = TestClient(gw.create_app(backends=[_FakeBackend()]))
    r = client.post("/tts", json={"text": "你好世界"})
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/wav"
    assert len(r.content) > 44
