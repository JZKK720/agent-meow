"""agent-meow-owned Hermes voice gateway.

Exposes one stable Hermes-facing HTTP contract:
  GET  /health  → JSON status + provider-chain metadata
  POST /tts      → raw audio/wav bytes

The gateway owns the Edge→Piper→Qwen fallback chain so Hermes only sees
one provider. Payload is byte-compatible with the existing Hermes-side
Qwen bridge (scripts/qwen3-tts-server.py) so Hermes config changes are
minimal.

Launch:
    python -m agent_meow.hermes_voice_gateway --port 17494
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response

_logger = logging.getLogger(__name__)

# --- Minimal settings ---------------------------------------------------

_DEFAULT_ATTEMPT_ORDER = ("stub",)
_DEFAULT_CHAIN_ORDER = ("edge", "piper", "qwen")


@dataclass(frozen=True)
class HermesVoiceSettings:
    """Voice gateway settings for the current slice.

    Only enough structure to prove the contract boundary. Real provider
    names and fallback order arrive in Task 1B.
    """

    mode: str = "stub"
    attempt_order: tuple[str, ...] = _DEFAULT_ATTEMPT_ORDER


def load_hermes_voice_settings(
    config: dict[str, Any] | None = None,
) -> HermesVoiceSettings:
    """Load voice settings from the effective Omnigent config.

    Task 1B: defaults to chain mode (edge → piper → qwen) but falls back to
    stub mode when the ``hermes_voice.mode`` config key is ``"stub""``.
    """
    cfg = config or {}
    mode = cfg.get("mode", "chain")
    if mode == "stub":
        return HermesVoiceSettings(mode="stub", attempt_order=_DEFAULT_ATTEMPT_ORDER)
    return HermesVoiceSettings(mode="chain", attempt_order=_DEFAULT_CHAIN_ORDER)


# --- Stub synthesizer ---------------------------------------------------


@dataclass(frozen=True)
class SynthesisResult:
    """Result of one synthesis attempt."""

    audio_bytes: bytes
    sample_rate: int = 16000
    provider: str = "stub"
    attempted: tuple[str, ...] = ("stub",)


def _tiny_wav(sample_rate: int = 16000, duration_s: float = 0.05) -> bytes:
    """Return a tiny valid WAV file (silence) for contract tests."""
    import wave

    n_samples = int(sample_rate * duration_s)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * n_samples)
    return buf.getvalue()


def synthesize_stub(text: str, settings: HermesVoiceSettings) -> SynthesisResult:
    """Return a tiny valid WAV without calling any real provider."""
    _ = text  # stub ignores text content
    _ = settings
    return SynthesisResult(
        audio_bytes=_tiny_wav(), provider="stub", attempted=("stub",)
    )


# --- HTTP app -----------------------------------------------------------


def create_app(backends: list[Any] | None = None) -> FastAPI:
    """Build the FastAPI app exposing /health and /tts.

    :param backends: Optional list of voice backends for chain mode. When
        ``None``, the app uses stub mode (for tests) or builds the default
        chain (for production). Pass a list of fakes in tests to avoid real
        provider calls.
    """
    app = FastAPI(title="agent-meow Hermes voice gateway")
    settings = load_hermes_voice_settings()

    @app.get("/health")
    async def health() -> dict[str, Any]:
        return {
            "status": "ok",
            "mode": settings.mode,
            "attempt_order": list(settings.attempt_order),
        }

    @app.post("/tts")
    async def tts(request: Request) -> Response:
        data = await request.json()
        text = data.get("text")
        text_file = data.get("text_file")

        if text:
            text = text.strip()
        elif text_file:
            try:
                text = Path(text_file).read_text(encoding="utf-8").strip()
            except (OSError, FileNotFoundError):
                raise HTTPException(
                    status_code=400, detail=f"Cannot read text_file: {text_file}"
                )
        else:
            raise HTTPException(status_code=400, detail="Missing 'text' or 'text_file'")

        if not text:
            raise HTTPException(status_code=400, detail="Empty text")

        if settings.mode == "chain":
            from agent_meow.hermes_voice_backends import synthesize_with_chain

            try:
                result = synthesize_with_chain(text, settings, backends=backends)
            except RuntimeError as exc:
                raise HTTPException(status_code=503, detail=str(exc)) from exc
        else:
            result = synthesize_stub(text, settings)

        output_path = data.get("output_path")
        if output_path:
            try:
                Path(output_path).write_bytes(result.audio_bytes)
            except OSError:
                pass  # cross-platform path — ignore

        return Response(content=result.audio_bytes, media_type="audio/wav")

    return app


def check_gateway_health(
    url: str = "http://127.0.0.1:17494", timeout_s: float = 3.0
) -> bool:
    """Return True if the voice gateway at *url* is healthy.

    Used by the Omnigent ``hermes`` launcher to verify the gateway is up
    before starting a Hermes session that depends on it.
    """
    import json
    import urllib.request

    try:
        req = urllib.request.Request(f"{url.rstrip('/')}/health")
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            data = json.loads(resp.read())
            return data.get("status") == "ok"
    except Exception:
        return False


def main() -> None:
    """Run the gateway with uvicorn for local/operator smoke tests.

    This is the one supported startup path for standalone Docker Hermes:
        python -m agent_meow.hermes_voice_gateway --port 17494
    """
    import argparse

    import uvicorn

    parser = argparse.ArgumentParser(description="agent-meow Hermes voice gateway")
    parser.add_argument("--port", type=int, default=17494, help="Listen port")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host")
    args = parser.parse_args()
    uvicorn.run(create_app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
