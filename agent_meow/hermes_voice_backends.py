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

    def synthesize(self, text: str, settings: HermesVoiceSettings) -> SynthesisResult: ...


# --- Edge backend -------------------------------------------------------

# Default voices per language. The gateway detects the input language
# and selects the matching Edge TTS voice so Chinese responses sound
# Chinese and English responses sound English.
_EDGE_VOICES = {
    "zh": "zh-CN-XiaoxiaoNeural",
    "en": "en-US-AriaNeural",
}
_DEFAULT_EDGE_VOICE = _EDGE_VOICES["zh"]

# Full language names for Qwen3-TTS (expects "Chinese", "English", "Auto", etc.)
_QWEN_LANGUAGES = {
    "zh": "Chinese",
    "en": "English",
}


def _detect_language(text: str) -> str:
    """Detect whether text is primarily Chinese or English.

    Returns "zh" if CJK characters dominate, "en" otherwise. This lets the
    TTS backends select the correct voice so responses match the user's
    language — Chinese in → Chinese voice out, English in → English voice out.
    """
    cjk = sum(
        1
        for ch in text
        if "\u4e00" <= ch <= "\u9fff" or "\u3400" <= ch <= "\u4dbf" or "\uf900" <= ch <= "\ufaff"
    )
    ascii_letters = sum(1 for ch in text if ch.isascii() and ch.isalpha())
    return "zh" if cjk > ascii_letters else "en"


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
        import tempfile
        from pathlib import Path as _Path
        from concurrent.futures import ThreadPoolExecutor

        edge_tts = self._import_edge()

        # Select voice based on detected language so Chinese text gets a
        # Chinese voice and English text gets an English voice.
        lang = _detect_language(text)
        voice = _EDGE_VOICES.get(lang, self.voice)

        async def _gen() -> bytes:
            tmp = _Path(tempfile.mktemp(suffix=".mp3"))
            comm = edge_tts.Communicate(text, voice)
            await comm.save(str(tmp))
            return tmp.read_bytes()

        # Run the async Edge TTS call in a dedicated thread with its own
        # event loop. The gateway module sets WindowsSelectorEventLoopPolicy
        # at import time (before uvicorn/aiohttp), so asyncio.run() here
        # uses the selector loop which is compatible with edge-tts's
        # aiohttp WebSocket transport.
        with ThreadPoolExecutor(max_workers=1) as pool:
            audio = pool.submit(lambda: asyncio.run(_gen())).result()
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

_DEFAULT_QWEN_MODEL = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"


@dataclass
class QwenBackend:
    """Qwen3-TTS backend (offline neural, host-side via a separate bridge).

    This backend calls a **separate** Qwen3-TTS server process (not the voice
    gateway itself). The default URL ``http://127.0.0.1:8889`` matches the
    Qwen3-TTS bridge launched by ``scripts/qwen3_tts_server.py``.

    **Important:** The previous default was ``http://127.0.0.1:17494`` (the
    voice gateway's own port), which caused infinite recursion — the gateway
    would call itself via the Qwen backend, which would call the gateway
    again, etc. The URL must point to a different process.

    The 0.6B model is used by default (vs 1.7B) to reduce load time from
    ~30-40s to ~10-15s on CPU while keeping all 10 languages and 9 speakers.
    """

    base_url: str = "http://127.0.0.1:8889"
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

        # Detect language and select the matching speaker. Qwen3-TTS has
        # 9 premium speakers but only 2 are English (Ryan, Aiden — both male).
        # To keep a unified female voice persona across languages (matching
        # Edge TTS which uses XiaoxiaoNeural/AriaNeural — both female), we use
        # Serena (warm Chinese female) for Chinese and Vivian (bright Chinese
        # female, can speak English with slight accent) for English. This
        # ensures the MeowCat persona always sounds like a female cat.
        # When Edge TTS is available (online), it overrides with native
        # female voices for both languages.
        lang = _detect_language(text)
        speaker = "Serena" if lang == "zh" else "Vivian"
        qwen_lang = _QWEN_LANGUAGES.get(lang, "Auto")
        payload = json.dumps(
            {
                "text": text,
                "language": qwen_lang,
                "speaker": speaker,
            }
        ).encode()
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
