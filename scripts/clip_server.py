"""CLIP image/text embedding server — local visual search backend (plan 039 P2).

Serves a FastAPI app on port 8893 (default) exposing:
  GET  /health       → {"status": "ok", "model": "...", "dim": 512}
  POST /embed/image  → {"vector": [...], "model": "...", "dim": 512}
  POST /embed/text   → {"vector": [...], "model": "...", "dim": 512}

Request bodies:
  /embed/image  {"path": "C:/.../img.png"}   server-side read (preferred)
                {"b64": "<base64 image bytes>"}   or inline bytes
  /embed/text   {"text": "a photo of a beach at sunset"}

Model: openai CLIP ViT-B/32 via transformers (downloads to the HF cache on
first start, ~600MB, then loads in ~3-5s and stays resident). CPU-only by
default — the target machines (AMD iGPU, no CUDA torch) embed an image in
~100-200ms on CPU, which is plenty for a personal workspace.

Launch (host python, NOT the agent-meow venv — the venv stays lean and the
model loads once in this process):
  py -3.13 scripts/clip_server.py --port 8893

Environment:
  CLIP_MODEL_ID   model id (default "openai/clip-vit-base-patch32")

The agent-meow runner talks to this over HTTP (file_embed_worker) and
treats it as optional: connection refused → visual search silently
degrades to FTS-only, the same lazy-optional posture as qwen-tts and
the dictation engine.
"""

from __future__ import annotations

import argparse
import base64
import io
import logging
import os
import threading
from typing import Any

import torch
from fastapi import FastAPI, HTTPException
from PIL import Image
from pydantic import BaseModel

_logger = logging.getLogger("clip_server")

MODEL_ID = os.environ.get("CLIP_MODEL_ID", "openai/clip-vit-base-patch32")

# --- lazy model singleton ---------------------------------------------------

_lock = threading.Lock()
_model: Any = None
_processor: Any = None
_dim: int | None = None


def load_model() -> tuple[Any, Any]:
    """Load CLIP once (singleton). Raises on failure — endpoints 503."""
    global _model, _processor, _dim
    with _lock:
        if _model is not None:
            return _model, _processor
        from transformers import CLIPModel, CLIPProcessor

        _logger.info("loading CLIP model %s ...", MODEL_ID)
        _processor = CLIPProcessor.from_pretrained(MODEL_ID)
        _model = CLIPModel.from_pretrained(MODEL_ID)
        _model.eval()
        _dim = int(_model.config.projection_dim)
        _logger.info("CLIP model ready (dim=%s)", _dim)
        return _model, _processor


def _unavailable(exc: Exception) -> HTTPException:
    return HTTPException(status_code=503, detail=f"model unavailable: {exc}")


def _normalize(vec: list[float]) -> list[float]:
    norm = sum(v * v for v in vec) ** 0.5 or 1.0
    return [v / norm for v in vec]


def _embed_image(img: Image.Image) -> list[float]:
    """L2-normalized image embedding for a PIL image."""
    model, processor = load_model()
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        feats = model.get_image_features(**inputs)
    return _normalize(feats[0].tolist())


def _embed_text(content: str) -> list[float]:
    """L2-normalized text embedding (same space as the image vectors)."""
    model, processor = load_model()
    inputs = processor(
        text=[content], return_tensors="pt", padding=True, truncation=True, max_length=77
    )
    with torch.no_grad():
        feats = model.get_text_features(**inputs)
    return _normalize(feats[0].tolist())


def _image_from(path: str | None, b64: str | None) -> Image.Image:
    if path:
        with open(path, "rb") as fh:
            return Image.open(io.BytesIO(fh.read())).convert("RGB")
    if b64:
        return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    raise HTTPException(status_code=422, detail="need 'path' or 'b64'")


# --- FastAPI app -------------------------------------------------------------

app = FastAPI(title="agent-meow clip server", version="0.1.0")


class ImageRequest(BaseModel):
    path: str | None = None
    b64: str | None = None


class TextRequest(BaseModel):
    text: str


class EmbedReply(BaseModel):
    vector: list[float]
    model: str
    dim: int


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "model": MODEL_ID, "loaded": _model is not None, "dim": _dim}


@app.post("/embed/image", response_model=EmbedReply)
def embed_image(req: ImageRequest) -> EmbedReply:
    try:
        img = _image_from(req.path, req.b64)
        vec = _embed_image(img)
    except HTTPException:
        raise
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"file not found: {req.path}") from exc
    except Exception as exc:  # noqa: BLE001 — decode/model failures → 400/503
        if _model is None and isinstance(exc, (ModuleNotFoundError, OSError)):
            raise _unavailable(exc) from exc
        raise HTTPException(status_code=400, detail=f"embed failed: {exc}") from exc
    return EmbedReply(vector=vec, model=MODEL_ID, dim=len(vec))


@app.post("/embed/text", response_model=EmbedReply)
def embed_text(req: TextRequest) -> EmbedReply:
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="text must be non-empty")
    try:
        vec = _embed_text(req.text)
    except Exception as exc:  # noqa: BLE001
        raise _unavailable(exc) from exc
    return EmbedReply(vector=vec, model=MODEL_ID, dim=len(vec))


# --- CLI ---------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="CLIP embedding server for agent-meow visual search"
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8893)
    parser.add_argument(
        "--preload", action="store_true", help="load the model at startup"
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s"
    )

    if args.preload:
        try:
            load_model()
        except Exception as exc:  # noqa: BLE001 — keep serving /health
            _logger.warning("model preload failed (will retry on request): %s", exc)

    import uvicorn

    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()