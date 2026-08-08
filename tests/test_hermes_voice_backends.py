"""Unit tests for the agent-meow Hermes voice backends (Task 1B).

All tests use fakes/mocks — no real Edge/Piper/Qwen calls.
"""

from __future__ import annotations

import pytest

from agent_meow.hermes_voice_backends import (
    BackendUnavailable,
    EdgeBackend,
    PiperBackend,
    QwenBackend,
    synthesize_with_chain,
)
from agent_meow.hermes_voice_gateway import HermesVoiceSettings, SynthesisResult


_SETTINGS = HermesVoiceSettings(mode="chain", attempt_order=("edge", "piper", "qwen"))


# --- EdgeBackend --------------------------------------------------------


def test_edge_backend_is_available_false_when_import_fails() -> None:
    def _fail():
        raise BackendUnavailable("edge-tts not installed")

    backend = EdgeBackend(_import_fn=_fail)
    assert backend.is_available() is False


def test_edge_backend_is_available_true_when_import_succeeds() -> None:
    def _ok():
        return object()  # fake edge_tts module

    backend = EdgeBackend(_import_fn=_ok)
    assert backend.is_available() is True


# --- synthesize_with_chain: fallback -----------------------------------


def test_chain_falls_back_to_second_when_first_unavailable() -> None:
    """Edge unavailable → Piper succeeds."""
    fake_wav = b"RIFF" + b"\x00" * 36 + b"WAVE" + b"fmt " + b"\x00" * 4

    class _FakePiper(PiperBackend):
        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> SynthesisResult:
            return SynthesisResult(
                audio_bytes=fake_wav, provider="piper", attempted=("piper",)
            )

    def _edge_unavailable():
        raise BackendUnavailable("no edge")

    backends = [
        EdgeBackend(_import_fn=_edge_unavailable),
        _FakePiper(),
    ]
    result = synthesize_with_chain("hello", _SETTINGS, backends=backends)
    assert result.provider == "piper"
    assert "edge" in result.attempted
    assert "piper" in result.attempted


def test_chain_falls_back_to_third_when_first_two_unavailable() -> None:
    """Edge and Piper unavailable → Qwen succeeds."""

    class _FakeQwen(QwenBackend):
        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> SynthesisResult:
            return SynthesisResult(
                audio_bytes=b"\x00" * 100, provider="qwen", attempted=("qwen",)
            )

    def _fail():
        raise BackendUnavailable("not installed")

    backends = [
        EdgeBackend(_import_fn=_fail),
        PiperBackend(_import_fn=_fail),
        _FakeQwen(),
    ]
    result = synthesize_with_chain("hello", _SETTINGS, backends=backends)
    assert result.provider == "qwen"
    assert result.attempted == ("edge", "piper", "qwen")


def test_chain_raises_when_all_backends_fail() -> None:
    """All backends fail → RuntimeError listing all attempted providers."""

    class _FailingBackend:
        def __init__(self, name: str) -> None:
            self._name = name

        @property
        def name(self) -> str:
            return self._name

        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> SynthesisResult:
            raise RuntimeError(f"{self._name} boom")

    backends = [
        _FailingBackend("edge"),
        _FailingBackend("piper"),
        _FailingBackend("qwen"),
    ]
    with pytest.raises(RuntimeError, match="All voice backends failed"):
        synthesize_with_chain("hello", _SETTINGS, backends=backends)


def test_chain_reports_attempted_in_order() -> None:
    """The ``attempted`` tuple preserves the chain order, not just the winner."""

    class _SecondWins:
        def __init__(self, name: str) -> None:
            self._name = name

        @property
        def name(self) -> str:
            return self._name

        def is_available(self) -> bool:
            return True

        def synthesize(
            self, text: str, settings: HermesVoiceSettings
        ) -> SynthesisResult:
            if self._name == "first":
                raise RuntimeError("fail on purpose")
            return SynthesisResult(
                audio_bytes=b"\x00" * 50, provider=self._name, attempted=(self._name,)
            )

    backends = [_SecondWins("first"), _SecondWins("second")]
    result = synthesize_with_chain("hello", _SETTINGS, backends=backends)
    assert result.provider == "second"
    assert result.attempted == ("first", "second")


# --- QwenBackend availability check -----------------------------------


def test_qwen_backend_is_available_false_on_network_error() -> None:
    backend = QwenBackend(base_url="http://127.0.0.1:99999")
    assert backend.is_available() is False
