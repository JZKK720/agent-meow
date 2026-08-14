"""Qwen3-TTS local server — offline TTS with language-matched voices.

Serves a FastAPI app on port 8889 (default) exposing:
  GET  /health  → {"status": "ok"}
  POST /tts     → audio/wav bytes

The POST /tts body accepts:
  {
    "text": "你好世界",
    "language": "Chinese",      // "Chinese", "English", or "Auto"
    "speaker": "Vivian"         // Vivian(zh), Serena(zh), Ryan(en), Aiden(en), ...
  }

Uses the 0.6B CustomVoice model by default (~2.3GB, loads in ~10-15s on CPU).
The model stays loaded in memory after the first request (singleton).

Launch:
  python scripts/qwen3_tts_server.py --port 8889
  python scripts/qwen3_tts_server.py --port 8889 --model 1.7b  # higher quality

Environment:
  Set QWEN3_TTS_MODEL_DIR to override the model directory path.
  Default: ~/models/Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import threading
from pathlib import Path
from typing import Any

_logger = logging.getLogger("qwen3_tts_server")

# --- Model path resolution ------------------------------------------------

_DEFAULT_MODEL_DIR = os.path.join(
    os.path.expanduser("~"),
    "models",
    "Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice",
)
_DEFAULT_TOKENIZER_DIR = os.path.join(
    os.path.expanduser("~"),
    "models",
    "Qwen_Qwen3-TTS-Tokenizer-12Hz",
)

_MODEL_SIZES = {
    "0.6b": "Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice",
    "1.7b": "Qwen_Qwen3-TTS-12Hz-1.7B-CustomVoice",
}


def _resolve_model_dir(size: str) -> str:
    """Resolve the model directory for the given size."""
    env_override = os.environ.get("QWEN3_TTS_MODEL_DIR")
    if env_override:
        return env_override
    model_name = _MODEL_SIZES.get(size, _MODEL_SIZES["0.6b"])
    return os.path.join(os.path.expanduser("~"), "models", model_name)


# --- Singleton model holder -----------------------------------------------

_model_lock = threading.Lock()
_model: Any = None
_model_dir_loaded: str | None = None


def _get_model(model_dir: str, tokenizer_dir: str) -> Any:
    """Load the Qwen3-TTS model lazily (singleton, thread-safe).

    The model loads on first call and stays in memory for the process
    lifetime. Subsequent calls return the cached singleton.
    """
    global _model, _model_dir_loaded
    if _model is not None and _model_dir_loaded == model_dir:
        return _model

    with _model_lock:
        if _model is not None and _model_dir_loaded == model_dir:
            return _model

        _logger.info("Loading Qwen3-TTS model from %s ...", model_dir)
        import torch
        from qwen_tts import Qwen3TTSModel

        # Use CPU with float32 when no CUDA is available (AMD GPU without
        # ROCm torch support). On CUDA machines, device_map="cuda:0" with
        # bfloat16 is preferred for ~10x faster inference.
        if torch.cuda.is_available():
            _model = Qwen3TTSModel.from_pretrained(
                model_dir,
                device_map="cuda:0",
                dtype=torch.bfloat16,
            )
            _logger.info("Model loaded on CUDA (bfloat16)")
        else:
            _model = Qwen3TTSModel.from_pretrained(
                model_dir,
                device_map="cpu",
                dtype=torch.float32,
            )
            _logger.info("Model loaded on CPU (float32)")

        _model_dir_loaded = model_dir
        return _model


# --- FastAPI request model (module-level for Pydantic) -------------------

try:
    from pydantic import BaseModel

    class TtsRequest(BaseModel):
        text: str
        language: str = "Auto"
        speaker: str = "Vivian"

except ImportError:
    TtsRequest = None  # type: ignore[assignment, misc]


# --- FastAPI app ----------------------------------------------------------


def create_app(model_dir: str, tokenizer_dir: str) -> Any:
    """Build the FastAPI app exposing /health and /tts."""
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import Response

    app = FastAPI(title="Qwen3-TTS local server")

    @app.get("/health")
    async def health() -> dict[str, Any]:
        return {
            "status": "ok",
            "model_dir": model_dir,
            "model_loaded": _model is not None,
        }

    @app.post("/tts")
    async def tts(req: TtsRequest):
        import io

        text = req.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Empty text")

        language = req.language
        speaker = req.speaker

        try:
            model = _get_model(model_dir, tokenizer_dir)
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Model load failed: {exc}",
            ) from exc

        try:
            import soundfile as sf

            wavs, sr = model.generate_custom_voice(
                text=text,
                speaker=speaker,
                language=language,
            )
            # Return the first wav as a WAV byte stream.
            buf = io.BytesIO()
            sf.write(buf, wavs[0], sr, format="WAV")
            return Response(content=buf.getvalue(), media_type="audio/wav")
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"TTS synthesis failed: {exc}",
            ) from exc

    return app


def main() -> None:
    """Run the Qwen3-TTS server with uvicorn."""
    parser = argparse.ArgumentParser(description="Qwen3-TTS local server")
    parser.add_argument(
        "--port",
        type=int,
        default=8889,
        help="Port to listen on (default: 8889)",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--model",
        choices=["0.6b", "1.7b"],
        default="0.6b",
        help="Model size (default: 0.6b — faster load, same languages)",
    )
    args = parser.parse_args()

    model_dir = _resolve_model_dir(args.model)
    if not Path(model_dir).exists():
        print(f"ERROR: Model directory not found: {model_dir}", file=sys.stderr)
        print(
            "Download with: python scripts/download-qwen3-tts.py",
            file=sys.stderr,
        )
        sys.exit(1)

    tokenizer_dir = _DEFAULT_TOKENIZER_DIR
    if not Path(tokenizer_dir).exists():
        print(f"WARNING: Tokenizer not found at {tokenizer_dir}", file=sys.stderr)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    _logger.info("Starting Qwen3-TTS server on %s:%d", args.host, args.port)
    _logger.info("Model: %s (%s)", args.model, model_dir)

    # Pre-load the model at startup so the first request is fast.
    # This runs in the main thread before uvicorn starts.
    _logger.info("Pre-loading model (this may take 10-30s)...")
    try:
        _get_model(model_dir, tokenizer_dir)
        _logger.info("Model pre-loaded successfully")
    except Exception as exc:
        _logger.warning("Model pre-load failed: %s — will retry on first request", exc)

    import uvicorn

    app = create_app(model_dir, tokenizer_dir)
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
