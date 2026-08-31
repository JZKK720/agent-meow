"""Image-embedding worker — CLIP visual vectors for indexed images (P2).

Mirrors :mod:`agent_meow.runner.file_meta_worker`: a durable claim from the
``file_index`` queue, process on a worker thread, persist, mark. For every
``indexed`` image that doesn't yet have an embedding row, reads the stored
thumbnail (already extracted by the meta worker — no re-decode of the
original), calls the local CLIP server (scripts/clip_server.py, default
http://127.0.0.1:8893), and upserts the vector via
:class:`~agent_meow.stores.file_embedding_store.SqlAlchemyFileEmbeddingStore`.

Everything degrades quietly: CLIP server down → worker logs once and
exits its cycle (rows stay un-embedded; the next cycle retries); numpy
absent → the worker no-ops (knn search falls back to FTS-only).
"""

from __future__ import annotations

import base64
import logging
import os
import threading
from typing import Any

from agent_meow.entities.file_index import KIND_IMAGE, STATUS_INDEXED
from agent_meow.stores.file_index_store import FileIndexStore
from agent_meow.stores.file_embedding_store.sqlalchemy_store import (
    SqlAlchemyFileEmbeddingStore,
)

_logger = logging.getLogger(__name__)

# Claim batch per cycle (matches the meta worker).
_DEFAULT_BATCH = 8
# Embeddings stored per (file, model). Bumping MODEL_ID re-embeds.
MODEL_ID = os.environ.get("AGENT_MEOW_CLIP_MODEL", "openai/clip-vit-base-patch32")
# Where the clip server listens (started separately, host python).
CLIP_SERVER_URL = os.environ.get("AGENT_MEOW_CLIP_SERVER", "http://127.0.0.1:8893")


def _clip_ready() -> tuple[bool, str]:
    """Health-check the CLIP server. (ok, detail)."""
    import httpx

    try:
        resp = httpx.get(f"{CLIP_SERVER_URL}/health", timeout=3)
    except Exception as exc:  # noqa: BLE001 — connection refused etc.
        return False, f"{type(exc).__name__}: {exc}"
    if resp.status_code != 200:
        return False, f"HTTP {resp.status_code}"
    data = resp.json()
    if not data.get("loaded"):
        return False, "model still loading"
    return True, str(data.get("model", ""))


def _embed_thumbnail(thumb_path: str) -> list[float] | None:
    """Send the thumbnail to the CLIP server; return its vector."""
    import httpx

    with open(thumb_path, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode("ascii")
    resp = httpx.post(
        f"{CLIP_SERVER_URL}/embed/image",
        json={"b64": b64},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    vec = data.get("vector")
    if not isinstance(vec, list) or not vec:
        raise ValueError("clip server returned an empty vector")
    return [float(v) for v in vec]


def _pending_images(
    index_store: FileIndexStore,
    embedding_store: SqlAlchemyFileEmbeddingStore,
    *,
    batch: int,
) -> list[Any]:
    """Indexed images that lack an embedding under MODEL_ID.

    Uses claim_pending to flip rows to processing (same durable queue as
    the meta worker — a crash mid-embed leaves rows claimable again via
    the processing-timeout path), filtered client-side to images that
    need embeddings. Non-image rows are immediately re-marked indexed so
    they are never blocked from FTS search.
    """
    claimed = index_store.claim_pending(limit=batch * 4)
    done: set[str] = embedding_store.embedded_file_ids(model=MODEL_ID)
    out: list[Any] = []
    reindexed = 0
    for entry in claimed:
        if entry.kind != KIND_IMAGE or entry.id in done:
            # Not our job — hand it straight back as indexed. The meta
            # worker already marked it indexed; claim_pending flipped the
            # status, restore it so search never loses the row.
            index_store.mark_indexed(
                entry.id,
                content_hash=entry.content_hash,
                meta=entry.meta,
                thumb_path=entry.thumb_path,
            )
            reindexed += 1
            continue
        out.append(entry)
        if len(out) >= batch:
            break
    _ = reindexed
    return out


def process_entry(
    index_store: FileIndexStore,
    embedding_store: SqlAlchemyFileEmbeddingStore,
    entry: Any,
) -> str:
    """Embed one claimed image row. Returns ``embedded`` | ``failed``."""
    thumb = entry.thumb_path
    try:
        if not thumb or not os.path.isfile(thumb):
            # No thumbnail (undecodable image) — nothing to embed; return
            # the row to indexed so FTS keeps serving it.
            index_store.mark_indexed(
                entry.id,
                content_hash=entry.content_hash,
                meta=entry.meta,
                thumb_path=entry.thumb_path,
            )
            return "skipped"
        vec = _embed_thumbnail(thumb)
        embedding_store.upsert(file_id=entry.id, model=MODEL_ID, vector=vec)
        index_store.mark_indexed(
            entry.id,
            content_hash=entry.content_hash,
            meta=entry.meta,
            thumb_path=entry.thumb_path,
        )
        return "embedded"
    except Exception as exc:  # noqa: BLE001 — one bad file must not kill the batch
        _logger.warning("embed worker failed for %s: %s", entry.path, exc)
        index_store.mark_failed(entry.id, f"embed: {type(exc).__name__}: {exc}")
        return "failed"


def run_once(
    index_store: FileIndexStore,
    embedding_store: SqlAlchemyFileEmbeddingStore,
    *,
    batch: int = _DEFAULT_BATCH,
    clip_ok: bool | None = None,
) -> dict[str, int]:
    """Claim and embed one batch. Returns an outcome histogram.

    ``clip_ok`` lets callers inject the server check result (tests); when
    None the worker health-checks the CLIP server itself.
    """
    if clip_ok is None:
        ok, _detail = _clip_ready()
        clip_ok = ok
    if not clip_ok:
        return {}  # server down — silent no-op, FTS search keeps working
    tally: dict[str, int] = {}
    for entry in _pending_images(index_store, embedding_store, batch=batch):
        outcome = process_entry(index_store, embedding_store, entry)
        tally[outcome] = tally.get(outcome, 0) + 1
    return tally


def worker_loop(
    index_store: FileIndexStore,
    embedding_store: SqlAlchemyFileEmbeddingStore,
    *,
    stop_event: threading.Event,
    interval: float = 5.0,
    batch: int = _DEFAULT_BATCH,
) -> None:
    """Poll-and-embed loop until ``stop_event`` is set.

    Slower cadence than the meta worker: embedding is ~100-200ms/image
    CPU and thumbnails don't change once extracted.
    """
    while not stop_event.is_set():
        try:
            run_once(index_store, embedding_store, batch=batch)
        except Exception:  # noqa: BLE001 — store hiccups don't kill the thread
            _logger.warning("file embed worker cycle failed", exc_info=True)
        stop_event.wait(interval)