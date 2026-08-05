#!/usr/bin/env python3
"""Qwen3-ASR server — GPU-accelerated speech-to-text on :8888.

Loads Qwen3-ASR-1.7B (or 0.6B for R16) and exposes:
  POST /v1/asr  →  { audio: base64_pcm16, sample_rate } → { text, language }

Pre-loads the model at startup so first-request latency is zero.
"""

import argparse
import base64
import io
import json
import os
import sys
import time

# ── Config ──────────────────────────────────────────────────────────
MODEL_DIR = os.environ.get(
    "QWEN3_ASR_MODEL_DIR",
    os.path.join(os.path.expanduser("~"), "models", "Qwen_Qwen3-ASR-1.7B"),
)
PORT = int(os.environ.get("QWEN3_ASR_PORT", "8888"))
DEVICE = os.environ.get("QWEN3_ASR_DEVICE", "cpu")  # cpu (DirectML/CUDA not compatible with qwen_asr + transformers)

# ── Model loader ────────────────────────────────────────────────────
_model = None
_processor = None


def load_model():
    """Load Qwen3-ASR model into memory at startup."""
    global _model, _processor
    print(f"[ASR] Loading Qwen3-ASR from {MODEL_DIR} on {DEVICE}...", flush=True)
    t0 = time.time()
    try:
        import torch
        from qwen_asr import Qwen3ASRModel

        _model = Qwen3ASRModel.from_pretrained(
            MODEL_DIR,
            dtype=torch.float32,
        )
        elapsed = time.time() - t0
        print(f"[ASR] Model loaded in {elapsed:.1f}s", flush=True)
    except Exception as e:
        print(f"[ASR] FAILED to load model: {e}", flush=True)
        raise


def transcribe(audio_bytes: bytes, sample_rate: int = 16000) -> dict:
    """Transcribe PCM16 audio bytes to text using qwen_asr."""
    import numpy as np

    # Convert bytes to numpy int16 array
    audio = np.frombuffer(audio_bytes, dtype=np.int16)
    # Convert to float32 normalized
    audio_f32 = audio.astype(np.float32) / 32768.0

    # qwen_asr's transcribe method
    results = _model.transcribe(audio=audio_f32, language=None)
    text = results[0].text if isinstance(results, list) else str(results)
    return {"text": text.strip(), "language": "auto"}


# ── HTTP server ────────────────────────────────────────────────────
def create_app():
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Qwen3-ASR Server")

    class AsrRequest(BaseModel):
        audio: str  # base64-encoded PCM16
        sample_rate: int = 16000

    @app.get("/health")
    def health():
        return {"ok": _model is not None, "model": "Qwen3-ASR", "device": DEVICE}

    @app.post("/v1/asr")
    def asr(req: AsrRequest):
        audio_bytes = base64.b64decode(req.audio)
        result = transcribe(audio_bytes, req.sample_rate)
        return result

    return app


def main():
    global MODEL_DIR, DEVICE
    parser = argparse.ArgumentParser(description="Qwen3-ASR server")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--model-dir", type=str, default=MODEL_DIR)
    parser.add_argument("--device", type=str, default=DEVICE)
    args = parser.parse_args()

    MODEL_DIR = args.model_dir
    DEVICE = args.device

    load_model()

    import uvicorn

    app = create_app()
    print(f"[ASR] Server starting on :{args.port}", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="info")


if __name__ == "__main__":
    main()
