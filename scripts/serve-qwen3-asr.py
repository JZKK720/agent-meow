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
DEVICE = os.environ.get("QWEN3_ASR_DEVICE", "cuda")  # cuda or cpu

# ── Model loader ────────────────────────────────────────────────────
_model = None
_processor = None

def load_model():
    """Load Qwen3-ASR model into VRAM at startup."""
    global _model, _processor
    print(f"[ASR] Loading Qwen3-ASR from {MODEL_DIR} on {DEVICE}...", flush=True)
    t0 = time.time()
    try:
        import torch
        from transformers import Qwen3ASRForConditionalGeneration, AutoProcessor

        _processor = AutoProcessor.from_pretrained(MODEL_DIR)
        _model = Qwen3ASRForConditionalGeneration.from_pretrained(
            MODEL_DIR,
            dtype=torch.bfloat16 if DEVICE == "cuda" else torch.float32,
            device_map=DEVICE,
        )
        elapsed = time.time() - t0
        print(f"[ASR] Model loaded in {elapsed:.1f}s", flush=True)
    except Exception as e:
        print(f"[ASR] FAILED to load model: {e}", flush=True)
        raise

def transcribe(audio_bytes: bytes, sample_rate: int = 16000) -> dict:
    """Transcribe PCM16 audio bytes to text."""
    import torch
    import numpy as np

    # Convert bytes to numpy int16 array
    audio = np.frombuffer(audio_bytes, dtype=np.int16)
    # Convert to float32 normalized
    audio_f32 = audio.astype(np.float32) / 32768.0

    # Process through the model
    inputs = _processor(
        audio=audio_f32,
        sampling_rate=sample_rate,
        return_tensors="pt",
    ).to(DEVICE)

    with torch.no_grad():
        output = _model.generate(
            **inputs,
            max_new_tokens=256,
        )

    # Decode
    text = _processor.batch_decode(output, skip_special_tokens=True)[0]
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
    parser = argparse.ArgumentParser(description="Qwen3-ASR server")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--model-dir", type=str, default=MODEL_DIR)
    parser.add_argument("--device", type=str, default=DEVICE)
    args = parser.parse_args()

    global MODEL_DIR, DEVICE
    MODEL_DIR = args.model_dir
    DEVICE = args.device

    load_model()

    import uvicorn
    app = create_app()
    print(f"[ASR] Server starting on :{args.port}", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="info")

if __name__ == "__main__":
    main()