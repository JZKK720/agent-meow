"""File-intelligence composition — watcher + metadata worker (plan 039 P0).

One entry point the runner lifespan calls: :func:`start_file_intel`
constructs the shared-DB :class:`FileIndexStore`, starts the watchdog
watcher (:mod:`agent_meow.runner.file_watcher`) for the runner
workspace, and spins a daemon thread running
:func:`~agent_meow.runner.file_meta_worker.worker_loop` to drain the
pending queue. :func:`stop_file_intel` unwinds both cleanly.

Scope note: this watches the runner's *global* workspace (where users
drop files, e.g. ``~/agent-meow-workspace``). Per-session worktree
directories are covered by the existing post-turn ``workspace_scan``;
indexing them too is a follow-up.

Everything degrades to a no-op (returns ``None``) when disabled by env
or when the ``fileintel`` extra (watchdog/Pillow) is absent — the same
lazy-optional posture as the dictation engine.
"""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass

from agent_meow.runner.file_embed_worker import worker_loop as embed_worker_loop
from agent_meow.runner.file_meta_worker import worker_loop
from agent_meow.runner.file_watcher import (
    WatchHandle,
    file_watch_enabled,
    start_file_watch,
)
from agent_meow.stores.file_index_store import FileIndexStore

_logger = logging.getLogger(__name__)

# Worker consume cadence. The watcher enqueues on fs events (sub-second);
# this interval only bounds extraction latency for missed events.
WORKER_INTERVAL_S = 2.0
# Embed worker cadence — CLIP CPU inference is ~150ms/image; a slightly
# slower poll is fine (embedding is a background enrichment, not a UX gate).
EMBED_WORKER_INTERVAL_S = 5.0


@dataclass
class FileIntelHandle:
    """A running file-intelligence stack: watcher + worker threads."""

    watch: WatchHandle
    store: FileIndexStore
    stop_event: threading.Event
    thread: threading.Thread
    embedding_store: object | None = None
    embed_thread: threading.Thread | None = None


def _default_store() -> FileIndexStore:
    """Open the file index on the shared local chat.db (file_tag pattern).

    The server propagates ``AGENT_MEOW_DATA_DIR`` to the runner, so both
    processes resolve the same SQLite file. Raises on an unopenable DB
    (read-only data dir); the caller degrades to a no-op.
    """
    from agent_meow.host.local_server import _local_data_dir
    from agent_meow.stores.file_index_store.sqlalchemy_store import (
        SqlAlchemyFileIndexStore,
    )

    data_dir = _local_data_dir()
    data_dir.mkdir(parents=True, exist_ok=True)
    return SqlAlchemyFileIndexStore(f"sqlite:///{data_dir / 'chat.db'}")


def start_file_intel(
    *,
    workspace: str,
    host_id: str = "",
    store: FileIndexStore | None = None,
    enabled: bool | None = None,
) -> FileIntelHandle | None:
    """Start watcher + worker for ``workspace``. Returns a handle or None.

    None = not running (disabled, watchdog missing, workspace absent, or
    DB unopenable). Never raises — the runner must boot without file
    intelligence rather than fail on it.
    """
    if enabled is None:
        enabled = file_watch_enabled()
    if not enabled:
        return None
    try:
        if store is None:
            store = _default_store()
        watch = start_file_watch(store, host_id=host_id, workspace=workspace, enabled=True)
        if watch is None:
            return None
        stop_event = threading.Event()
        thread = threading.Thread(
            target=worker_loop,
            args=(store,),
            kwargs={"stop_event": stop_event, "interval": WORKER_INTERVAL_S},
            name="file-meta-worker",
            daemon=True,
        )
        thread.start()
        embed_store, embed_thread = _start_embed_worker(store, stop_event)
        return FileIntelHandle(
            watch=watch,
            store=store,
            stop_event=stop_event,
            thread=thread,
            embedding_store=embed_store,
            embed_thread=embed_thread,
        )
    except Exception:  # noqa: BLE001 — degrade, never crash the runner
        _logger.warning("file intelligence disabled (startup failed)", exc_info=True)
        return None


def _start_embed_worker(
    store: FileIndexStore,
    stop_event: threading.Event,
) -> tuple[object | None, threading.Thread | None]:
    """Start the CLIP embed worker if its deps + DB open cleanly.

    Never raises: embedding is an enrichment — when the CLIP server,
    numpy, or the shared DB are unavailable, visual search silently
    degrades to FTS-only (the meta worker's posture).
    """
    try:
        from agent_meow.host.local_server import _local_data_dir
        from agent_meow.stores.file_embedding_store.sqlalchemy_store import (
            SqlAlchemyFileEmbeddingStore,
        )

        data_dir = _local_data_dir()
        data_dir.mkdir(parents=True, exist_ok=True)
        embed_store = SqlAlchemyFileEmbeddingStore(
            f"sqlite:///{data_dir / 'chat.db'}"
        )
        thread = threading.Thread(
            target=embed_worker_loop,
            args=(store, embed_store),
            kwargs={"stop_event": stop_event, "interval": EMBED_WORKER_INTERVAL_S},
            name="file-embed-worker",
            daemon=True,
        )
        thread.start()
        return embed_store, thread
    except Exception:  # noqa: BLE001 — visual search is optional
        _logger.warning(
            "visual embedding disabled (clip server or deps unavailable)",
            exc_info=True,
        )
        return None, None


def stop_file_intel(handle: FileIntelHandle | None) -> None:
    """Stop the worker threads and the watchdog observer. Safe on None."""
    if handle is None:
        return
    handle.stop_event.set()
    handle.thread.join(timeout=5)
    if handle.embed_thread is not None:
        handle.embed_thread.join(timeout=5)
    handle.watch.observer.stop()
    handle.watch.observer.join(timeout=5)
