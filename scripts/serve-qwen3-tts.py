#!/usr/bin/env python3
"""Qwen3-TTS server — GPU-accelerated text-to-speech on :8889.

Loads Qwen3-TTS-12Hz-1.7B-CustomVoice (or 0.6B for R16) and exposes:
  POST /v1/tts  →  { text, voice } → { audio: base64_pcm24, sample_rate }

Pre-loads the model at startup so first-request latency is zero.
"""

import argparse
import base64
import io
import os
import sys
import time

# ── Config ──────────────────────────────────────────────────────────
MODEL_DIR = os.environ.get(
    "QWEN3_TTS_MODEL_DIR",
    os.path.join(os.path.expanduser("~"), "models", "Qwen_Qwen3-TTS-12Hz-1.7B-CustomVoice"),
)
TOKENIZER_DIR = os.environ.get(
    "QWEN3_TTS_TOKENIZER_DIR",
    os.path.join(os.path.expanduser("~"), "models", "Qwen_Qwen3-TTS-Tokenizer-12Hz"),
)
PORT = int(os.environ.get("QWEN3_TTS_PORT", "8889"))
DEVICE = os.environ.get("QWEN3_TTS_DEVICE", "cpu")  # cpu (DirectML/CUDA not compatible with qwen_tts)
DEFAULT_VOICE = os.environ.get("QWEN3_TTS_VOICE", "Cherry")

# ── Model loader ────────────────────────────────────────────────────
_model = None
_tokenizer = None


def load_model():
    """Load Qwen3-TTS model into VRAM at startup."""
    global _model, _tokenizer
    print(f"[TTS] Loading Qwen3-TTS from {MODEL_DIR} on {DEVICE}...", flush=True)
    t0 = time.time()
    try:
        import torch

        from qwen_tts import Qwen3TTSModel

        _model = Qwen3TTSModel.from_pretrained(
            MODEL_DIR,
            tokenizer_dir=TOKENIZER_DIR,
            device=DEVICE,
            dtype=torch.float32,
        )
        elapsed = time.time() - t0
        print(f"[TTS] Model loaded in {elapsed:.1f}s", flush=True)
    except Exception as e:
        print(f"[TTS] FAILED to load model: {e}", flush=True)
        print(f"[TTS] Make sure 'pip install qwen-tts' has been run", flush=True)
        raise


def synthesize(text: str, voice: str = DEFAULT_VOICE) -> dict:
    """Synthesize text to 24kHz PCM audio."""
    import numpy as np

    # Generate audio
    audio = _model.synthesize(text, voice=voice)

    # Qwen3-TTS outputs at 24kHz, int16
    audio_bytes = audio.tobytes()
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    return {
        "audio": audio_b64,
        "sample_rate": 24000,
    }


# ── HTTP server ────────────────────────────────────────────────────
def create_app():
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Qwen3-TTS Server")

    class TtsRequest(BaseModel):
        text: str
        voice: str = DEFAULT_VOICE

    @app.get("/health")
    def health():
        return {"ok": _model is not None, "model": "Qwen3-TTS", "device": DEVICE}

    @app.post("/v1/tts")
    def tts(req: TtsRequest):
        result = synthesize(req.text, req.voice)
        return result

    return app


def main():
    global MODEL_DIR, TOKENIZER_DIR, DEVICE, DEFAULT_VOICE
    parser = argparse.ArgumentParser(description="Qwen3-TTS server")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--model-dir", type=str, default=MODEL_DIR)
    parser.add_argument("--tokenizer-dir", type=str, default=TOKENIZER_DIR)
    parser.add_argument("--device", type=str, default=DEVICE)
    parser.add_argument("--voice", type=str, default=DEFAULT_VOICE)
    args = parser.parse_args()

    MODEL_DIR = args.model_dir
    TOKENIZER_DIR = args.tokenizer_dir
    DEVICE = args.device
    DEFAULT_VOICE = args.voice

    load_model()

    import uvicorn

    app = create_app()
    print(f"[TTS] Server starting on :{args.port}", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="info")


if __name__ == "__main__":
    main()
