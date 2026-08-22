"""Qwen3-TTS local server — offline TTS with language-matched voices.

Serves a FastAPI app on port 8889 (default) exposing:
  GET  /health  → {"status": "ok"}
  POST /tts     → audio/wav bytes

The POST /tts body accepts:
  {
    "text": "你好世界",
    "language": "Chinese",      // "Chinese", "English", or "Auto"
    "speaker": "Serena"         // Serena(zh female), Vivian(zh female, can speak en), ...
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
import asyncio
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


# --- Sampling params (single source of truth) ----------------------------
# Stable sampling: the library default (temperature=0.9, top_p=1.0) makes
# the 0.6B model randomly emit laughs/breaths and shift prosody
# mid-sentence — even on clean text. temp 0.5 measured the most consistent
# output (lowest duration spread across runs); lower temps (0.1-0.3) caused
# repetition loops. The subtalker has its own sampling params that default
# to the same unstable regime (0.9/1.0) — pin them to match the main talker
# or the laughs/breaths persist through the subtalker.
# Exposed via /health so a stale process (started before a param change)
# is detectable without restarting.
SAMPLING_PARAMS: dict[str, float] = {
    "temperature": 0.5,
    "top_p": 0.85,
    "top_k": 50,
    "repetition_penalty": 1.05,
    "subtalker_temperature": 0.5,
    "subtalker_top_p": 0.85,
    "subtalker_top_k": 50,
    "subtalker_repetition_penalty": 1.05,
}


# --- FastAPI request model (module-level for Pydantic) -------------------

try:
    from pydantic import BaseModel

    class TtsRequest(BaseModel):
        text: str
        language: str = "Auto"
        speaker: str = "Serena"

except ImportError:
    TtsRequest = None  # type: ignore[assignment, misc]


# Minimum plausible speech duration per CJK character (seconds). The 0.6B
# model sometimes emits an early EOS on multi-sentence input, producing
# ~1s of audio for a 30+ char request (measured 2026-08-22: 32-char input
# → 0.9-1.5s speech on 2 of 3 runs, while single sentences are stable).
# Below this ratio the output is treated as truncated and regenerated
# sentence-by-sentence, which the model handles reliably.
_MIN_SEC_PER_CHAR = 0.12

# Sentence terminators for the per-sentence regeneration fallback.
_SENTENCE_END = "。！？.!?\n"


def _split_sentences(text: str) -> list[str]:
    """Split text into sentence chunks at terminators (kept inclusive)."""
    parts: list[str] = []
    buf = ""
    for ch in text:
        buf += ch
        if ch in _SENTENCE_END:
            parts.append(buf)
            buf = ""
    if buf.strip():
        parts.append(buf)
    return [p for p in parts if p.strip()]


def _generate(model: Any, text: str, speaker: str, language: str) -> tuple[Any, int]:
    """One generation call with the pinned sampling params."""
    wavs, sr = model.generate_custom_voice(
        text=text,
        speaker=speaker,
        language=language,
        **SAMPLING_PARAMS,
    )
    return wavs, sr


def _generate_with_guard(
    model: Any,
    text: str,
    speaker: str,
    language: str,
) -> tuple[Any, int]:
    """Generate with a truncation guard.

    Generates the full text; if the audio is implausibly short for the
    input length (early-EOS truncation), splits at sentence boundaries and
    regenerates each sentence, concatenating the WAVs. Single sentences
    are stable (verified 12/12 runs), so per-sentence regeneration
    reliably recovers the full content.
    """
    wavs, sr = _generate(model, text, speaker, language)
    wav = wavs[0]
    dur = len(wav) / sr
    # Count "speech-bearing" chars: CJK chars and letters (punctuation
    # and whitespace don't add duration).
    speech_chars = sum(1 for ch in text if not ch.isspace() and ch not in "，。！？、；：,.!?;:…—～\"'`()[]{}")
    if speech_chars == 0 or dur >= _MIN_SEC_PER_CHAR * speech_chars:
        return wavs, sr

    _logger.warning(
        "Truncated output suspected (%.1fs for %d chars) — regenerating per-sentence: %s",
        dur, speech_chars, text[:60],
    )
    import numpy as np

    sentences = _split_sentences(text)
    if len(sentences) <= 1:
        # Single sentence that came out short — one retry, then accept.
        _logger.warning("Single-sentence short output (%.1fs) — retrying once", dur)
        wavs2, sr2 = _generate(model, text, speaker, language)
        if len(wavs2[0]) / sr2 > dur:
            return wavs2, sr2
        return wavs, sr

    chunks: list[Any] = []
    out_sr = sr
    for sent in sentences:
        w, s = _generate(model, sent, speaker, language)
        if not chunks:
            out_sr = s
            chunks.append(w[0])
        else:
            # Resample-free concat: Qwen3-TTS always returns 24kHz, but
            # guard anyway — skip mismatched-rate chunks rather than
            # producing garbage audio.
            if s != out_sr:
                _logger.warning("Skipping chunk with mismatched rate %d != %d", s, out_sr)
                continue
            chunks.append(w[0])
    if not chunks:
        return wavs, sr
    return [np.concatenate(chunks, axis=0)], out_sr


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
            "sampling_params": SAMPLING_PARAMS,
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

            # asyncio.to_thread: generate_custom_voice is a blocking,
            # CPU/GPU-bound call (8-20s). Calling it directly in the async
            # handler froze the event loop, serializing the client's 3
            # concurrent requests into sequential 8-20s waits — the main
            # cause of the inter-sentence gaps. _generate_with_guard
            # regenerates per-sentence when the 0.6B model emits an early
            # EOS on multi-sentence input (truncation guard).
            wavs, sr = await asyncio.to_thread(
                _generate_with_guard,
                model,
                text,
                speaker,
                language,
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
    # Log the active sampling params so a stale process (started before a
    # param change) is identifiable in `docker logs` / console output.
    _logger.info("Sampling params: %s", SAMPLING_PARAMS)

    # Pre-load the model at startup so the first request is fast.
    # This runs in the main thread before uvicorn starts.
    _logger.info("Pre-loading model (this may take 10-30s)...")
    try:
        _get_model(model_dir, tokenizer_dir)
        _logger.info("Model pre-loaded successfully")
    except Exception as exc:
        _logger.warning("Model pre-load failed: %s — will retry on first request", exc)

    # Warm up synthesis kernels: the first generate() call triggers MIOpen
    # autotuning per shape (~15s). A short warmup per language keeps the
    # first real request in the ~2-3s warm range instead of ~18s. Runs as
    # a background task AFTER uvicorn binds so the port (and /health) is
    # up immediately — a watchdog health-checking the port sees the server
    # as alive during warmup instead of "down" for ~1 minute.
    async def _warmup() -> None:
        try:
            await asyncio.to_thread(_warmup_synthesis, model_dir, tokenizer_dir)
        except Exception as exc:  # never block the server on warmup failure
            _logger.warning("Warmup synthesis failed (first request will be slow): %s", exc)

    def _schedule_warmup(app: Any) -> None:
        @app.on_event("startup")
        async def _start_warmup() -> None:
            asyncio.get_running_loop().create_task(_warmup())

    import uvicorn

    app = create_app(model_dir, tokenizer_dir)
    _schedule_warmup(app)
    # Windows: the default ProactorEventLoop's accept loop dies on transient
    # socket errors (WinError 64/10054), taking the whole server down mid-
    # request. The selector loop survives them.
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    uvicorn.run(app, host=args.host, port=args.port)


def _warmup_synthesis(model_dir: str, tokenizer_dir: str) -> None:
    """Warm MIOpen autotuning per language with a native sentence each."""
    for lang, speaker, text in (
        ("Chinese", "Serena", "你好。"),
        ("English", "Vivian", "Hello there."),
    ):
        model = _get_model(model_dir, tokenizer_dir)
        model.generate_custom_voice(text=text, speaker=speaker, language=lang)
    _logger.info("Synthesis kernels warmed up")


if __name__ == "__main__":
    main()
