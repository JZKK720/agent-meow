"""Host-side voice backends for the agent-meow Hermes voice gateway.

Each backend adapts one TTS engine (Edge, Piper, Qwen) behind a common
``synthesize(text, settings) -> SynthesisResult`` interface so the gateway
can try them in a configured fallback order without Hermes knowing the
chain.

Backends are imported lazily so the gateway can start without
``edge-tts``, ``piper-tts``, or ``qwen_tts`` installed. A backend that
cannot import raises ``BackendUnavailable``; the chain caller catches
that and moves to the next provider.
"""

from __future__ import annotations

import io
import logging
import time
from dataclasses import dataclass
from typing import Any, Callable, Protocol

from agent_meow.hermes_voice_gateway import HermesVoiceSettings, SynthesisResult

_logger = logging.getLogger(__name__)


class BackendUnavailable(Exception):
    """Raised when a backend's dependency is not installed or the backend is off."""


class VoiceBackend(Protocol):
    """Common interface for all TTS backends."""

    @property
    def name(self) -> str: ...

    def is_available(self) -> bool: ...

    def synthesize(
        self, text: str, settings: HermesVoiceSettings
    ) -> SynthesisResult: ...


# --- Edge backend -------------------------------------------------------

_DEFAULT_EDGE_VOICE = "zh-CN-XiaoxiaoNeural"


@dataclass
class EdgeBackend:
    """Edge TTS backend (cloud, free, needs internet)."""

    voice: str = _DEFAULT_EDGE_VOICE
    _import_fn: Callable[[], Any] | None = None

    @property
    def name(self) -> str:
        return "edge"

    def is_available(self) -> bool:
        try:
            self._import_edge()
            return True
        except BackendUnavailable:
            return False

    def _import_edge(self) -> Any:
        if self._import_fn is not None:
            return self._import_fn()
        try:
            import edge_tts  # noqa: F401
        except ImportError as exc:
            raise BackendUnavailable("edge-tts not installed") from exc
        return edge_tts

    def synthesize(self, text: str, settings: HermesVoiceSettings) -> SynthesisResult:
        import asyncio

        edge_tts = self._import_edge()

        async def _gen() -> bytes:
            import tempfile
            from pathlib import Path as _Path

            tmp = _Path(tempfile.mktemp(suffix=".mp3"))
            comm = edge_tts.Communicate(text, self.voice)
            await comm.save(str(tmp))
            return tmp.read_bytes()

        audio = asyncio.run(_gen())
        # Edge outputs MP3, not WAV. We keep it as-is — the gateway contract
        # says audio/wav, but Hermes writes the bytes to disk and the platform
        # delivers by filename extension. Task 1B keeps the contract simple;
        # a future task can transcode if a strict WAV-only contract is needed.
        return SynthesisResult(
            audio_bytes=audio,
            sample_rate=24000,
            provider="edge",
            attempted=("edge",),
        )


# --- Piper backend ------------------------------------------------------

_DEFAULT_PIPER_VOICE = "zh_CN-huayan-medium"


@dataclass
class PiperBackend:
    """Piper TTS backend (offline, local neural VITS)."""

    voice: str = _DEFAULT_PIPER_VOICE
    _import_fn: Callable[[], Any] | None = None

    @property
    def name(self) -> str:
        return "piper"

    def is_available(self) -> bool:
        try:
            self._import_piper()
            return True
        except BackendUnavailable:
            return False

    def _import_piper(self) -> Any:
        if self._import_fn is not None:
            return self._import_fn()
        try:
            from piper import PiperVoice  # noqa: F401
        except ImportError as exc:
            raise BackendUnavailable("piper-tts not installed") from exc
        from piper import PiperVoice

        return PiperVoice

    def synthesize(self, text: str, settings: HermesVoiceSettings) -> SynthesisResult:
        import wave

        PiperVoice = self._import_piper()
        voice = PiperVoice.load(self.voice)
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(22050)
            for audio_bytes in voice.synthesize(text):
                wf.writeframes(audio_bytes)
        return SynthesisResult(
            audio_bytes=buf.getvalue(),
            sample_rate=22050,
            provider="piper",
            attempted=("piper",),
        )


# --- Qwen backend -------------------------------------------------------

_DEFAULT_QWEN_MODEL = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"


@dataclass
class QwenBackend:
    """Qwen3-TTS backend (offline neural, host-side via the existing bridge).

    This backend calls the existing host-side Qwen bridge at the configured
    URL (default ``http://127.0.0.1:17494/tts``) rather than loading the model
    directly. This keeps the heavy ``qwen_tts`` dependency in the external
    bridge process, not in the gateway process.
    """

    base_url: str = "http://127.0.0.1:17494"
    model: str = _DEFAULT_QWEN_MODEL
    _post_fn: Callable[..., Any] | None = None

    @property
    def name(self) -> str:
        return "qwen"

    def is_available(self) -> bool:
        try:
            import urllib.request

            req = urllib.request.Request(f"{self.base_url}/health")
            with urllib.request.urlopen(req, timeout=3) as resp:
                import json

                data = json.loads(resp.read())
                return data.get("status") == "ok"
        except Exception:
            return False

    def synthesize(self, text: str, settings: HermesVoiceSettings) -> SynthesisResult:
        import json
        import urllib.request

        payload = json.dumps({"text": text}).encode()
        req = urllib.request.Request(
            f"{self.base_url}/tts",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            audio = resp.read()
        return SynthesisResult(
            audio_bytes=audio,
            sample_rate=16000,
            provider="qwen",
            attempted=("qwen",),
        )


# --- Fallback chain -----------------------------------------------------


def synthesize_with_chain(
    text: str,
    settings: HermesVoiceSettings,
    backends: list[VoiceBackend] | None = None,
) -> SynthesisResult:
    """Try each backend in order; return the first successful result.

    If all backends fail, raise ``RuntimeError`` listing every attempted
    provider and its error.
    """
    if backends is None:
        backends = _default_backends(settings)

    attempted: list[str] = []
    errors: list[str] = []

    for backend in backends:
        name = backend.name
        attempted.append(name)
        if not backend.is_available():
            errors.append(f"{name}: unavailable")
            _logger.info("voice backend %s unavailable, trying next", name)
            continue
        try:
            result = backend.synthesize(text, settings)
            # Augment the ``attempted`` tuple with the full chain so far.
            return SynthesisResult(
                audio_bytes=result.audio_bytes,
                sample_rate=result.sample_rate,
                provider=result.provider,
                attempted=tuple(attempted),
            )
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{name}: {exc}")
            _logger.warning("voice backend %s failed: %s", name, exc)
            continue

    raise RuntimeError("All voice backends failed. Attempted: " + "; ".join(errors))


def _default_backends(settings: HermesVoiceSettings) -> list[VoiceBackend]:
    """Build the default fallback chain from settings.

    Order: Edge → Piper → Qwen. This matches the intended Chinese behavior
    in Plan 005: fast cloud first, offline local second, offline neural last.
    """
    return [
        EdgeBackend(),
        PiperBackend(),
        QwenBackend(),
    ]
