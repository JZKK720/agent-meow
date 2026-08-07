"""agent-meow-owned Hermes voice gateway — minimal skeleton (Task 1A).

Exposes one stable Hermes-facing HTTP contract:
  GET  /health  → JSON status + provider-chain metadata
  POST /tts      → raw audio/wav bytes

This slice uses a stub synthesizer that returns a tiny valid WAV payload
without calling Edge, Piper, or Qwen. Real backends arrive in Task 1B.

Payload is byte-compatible with the existing Hermes-side Qwen bridge
(scripts/qwen3-tts-server.py) so Hermes config does not change here.
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

    This slice ignores most config keys; it only proves the boundary.
    Task 1B will read real provider/voice/model settings here.
    """
    _ = config or {}
    return HermesVoiceSettings(mode="stub", attempt_order=_DEFAULT_ATTEMPT_ORDER)


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


def create_app() -> FastAPI:
    """Build the FastAPI app exposing /health and /tts."""
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

        result = synthesize_stub(text, settings)

        output_path = data.get("output_path")
        if output_path:
            try:
                Path(output_path).write_bytes(result.audio_bytes)
            except OSError:
                pass  # cross-platform path — ignore

        return Response(content=result.audio_bytes, media_type="audio/wav")

    return app


def main() -> None:
    """Run the gateway with uvicorn for local/operator smoke tests."""
    import argparse

    import uvicorn

    parser = argparse.ArgumentParser(description="agent-meow Hermes voice gateway")
    parser.add_argument("--port", type=int, default=17494, help="Listen port")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host")
    args = parser.parse_args()
    uvicorn.run(create_app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
