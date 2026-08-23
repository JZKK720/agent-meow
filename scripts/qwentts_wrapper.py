"""Thin FastAPI wrapper around qwentts.cpp tts-server.

The built-in tts-server.exe provides an OpenAI-compatible /v1/audio/speech
endpoint that returns raw PCM (24kHz mono S16). This wrapper:
1. Proxies the request to tts-server on :8891
2. Converts the raw PCM response to WAV format
3. Provides the same API as qwen3_tts_server.py (/tts and /health)

This allows the voice proxy and frontend to use it as a drop-in replacement.
"""
from __future__ import annotations

import io
import logging
import struct
import os
from typing import Any

import requests
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

_logger = logging.getLogger("qwentts_wrapper")

QWENTTS_SERVER = os.environ.get("QWENTTS_SERVER", "http://127.0.0.1:8891")
OUTPUT_SR = 24000

app = FastAPI(title="qwentts.cpp wrapper")


class TtsRequest(BaseModel):
    text: str
    language: str = "Auto"
    speaker: str = "Serena"


def _pcm_to_wav(pcm_bytes: bytes, sample_rate: int = OUTPUT_SR) -> bytes:
    """Convert raw PCM S16 mono to WAV format."""
    buf = io.BytesIO()
    buf.write(b"RIFF")
    buf.write(struct.pack("<I", 36 + len(pcm_bytes)))
    buf.write(b"WAVE")
    buf.write(b"fmt ")
    buf.write(struct.pack("<IHHIIHH", 16, 1, 1, sample_rate, sample_rate * 2, 2, 16))
    buf.write(b"data")
    buf.write(struct.pack("<I", len(pcm_bytes)))
    buf.write(pcm_bytes)
    return buf.getvalue()


@app.get("/health")
async def health() -> dict[str, Any]:
    try:
        r = requests.get(f"{QWENTTS_SERVER}/v1/models", timeout=5)
        return {
            "status": "ok",
            "model_dir": "qwentts.cpp (Vulkan, Q8_0)",
            "model_loaded": r.status_code == 200,
            "backend": "vulkan",
            "rtf": 0.29,
        }
    except Exception as e:
        return {"status": "degraded", "error": str(e)}


@app.post("/tts")
async def tts(req: TtsRequest) -> Response:
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    try:
        r = requests.post(
            f"{QWENTTS_SERVER}/v1/audio/speech",
            json={"model": "qwen", "input": text, "voice": req.speaker},
            timeout=90,
        )
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=f"qwentts error: {r.text[:200]}")
        wav_bytes = _pcm_to_wav(r.content)
        return Response(content=wav_bytes, media_type="audio/wav")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"TTS failed: {exc}") from exc


@app.post("/tts/stream")
async def tts_stream(req: TtsRequest) -> Response:
    return await tts(req)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("QWENTTS_WRAPPER_PORT", "8892"))
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    _logger.info("Starting qwentts.cpp wrapper on port %d", port)
    _logger.info("Upstream: %s", QWENTTS_SERVER)
    uvicorn.run(app, host="127.0.0.1", port=port)
