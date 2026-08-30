"""Workspace file watcher — event-driven enqueue into the file index (plan 039).

Replaces the 300s poll + chat-message round-trip of
``BackgroundFileWatcher`` with OS file events (watchdog: inotify on
POSIX, ReadDirectoryChangesW on Windows). On start it performs ONE
recursive bootstrap scan (so an existing workspace is indexed without
waiting for edits), then maintains the index incrementally:

- created/modified (image|document extension) -> ``upsert_pending``
- deleted -> ``mark_gone``
- everything debounced per-path (default 1s) so a multi-file copy or an
  editor's write-then-rename doesn't enqueue the same path repeatedly.

The handler logic (:class:`FileWatchHandler`) is pure and testable
without watchdog; :func:`start_file_watch` wires it to a real Observer
and degrades to a no-op when ``watchdog`` is not installed (the
``fileintel`` extra) or the env flag is off.
"""

from __future__ import annotations

import logging
import os
import threading
from collections.abc import Callable
from pathlib import Path

from agent_meow.entities.file_index import (
    DOCUMENT_EXTENSIONS,
    IMAGE_EXTENSIONS,
    classify_kind,
)
from agent_meow.runner.workspace_scan import _SKIP_DIRS
from agent_meow.stores.file_index_store import FileIndexStore

_logger = logging.getLogger(__name__)

# Env flag gating the watcher. Default OFF during the phased rollout —
# Task 0.4 flips the default to on once the meta worker consumes the
# queue end to end.
FILE_WATCH_ENV = "AGENT_MEOW_FILE_WATCH"
DEBOUNCE_ENV = "AGENT_MEOW_FILE_WATCH_DEBOUNCE_S"

_WATCHED_EXTENSIONS = IMAGE_EXTENSIONS | DOCUMENT_EXTENSIONS


def file_watch_enabled() -> bool:
    """Return whether the file watcher is enabled via env (default off)."""
    raw = os.environ.get(FILE_WATCH_ENV, "").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def _debounce_seconds() -> float:
    try:
        return max(0.1, float(os.environ.get(DEBOUNCE_ENV, "1.0")))
    except ValueError:
        return 1.0


def _is_watched(path: Path) -> bool:
    """True when a path is a watched file kind outside skip dirs/dotfiles.

    Mirrors ``workspace_scan``'s skip rules so the watcher's view matches
    what the Files panel shows.
    """
    if any(part in _SKIP_DIRS for part in path.parts):
        return False
    if any(part.startswith(".") for part in path.parts):
        return False
    ext = path.suffix.lower()
    return ext in _WATCHED_EXTENSIONS


class FileWatchHandler:
    """Debounce + translate watchdog events into index-store calls.

    :param store: A :class:`~agent_meow.stores.file_index_store.FileIndexStore`.
    :param host_id: Runner host identity ("" for local single-host).
    :param workspace: Absolute workspace root being watched.
    :param on_enqueue: Test seam — invoked per path flushed from the
        debounce window.
    :param debounce: Coalescing window in seconds; None reads
        ``AGENT_MEOW_FILE_WATCH_DEBOUNCE_S`` (default 1.0).
    """

    def __init__(
        self,
        store: FileIndexStore,
        *,
        host_id: str,
        workspace: str,
        on_enqueue: Callable[[str], None] | None = None,
        debounce: float | None = None,
    ) -> None:
        self._store = store
        self._host_id = host_id
        self._workspace = workspace
        self._on_enqueue = on_enqueue
        self._pending_paths: set[str] = set()
        self._lock = threading.Lock()
        self._timer: threading.Timer | None = None
        self._debounce = _debounce_seconds() if debounce is None else max(0.0, debounce)

    # ── watchdog event surface ──────────────────────────────────────────
    # start_file_watch wires these through a FileSystemEventHandler
    # adapter, so the module keeps no hard watchdog import (graceful
    # degradation when the fileintel extra is absent).

    def on_created(self, event: object) -> None:
        if not getattr(event, "is_directory", False):
            self._note(str(getattr(event, "src_path", "")))

    def on_modified(self, event: object) -> None:
        if not getattr(event, "is_directory", False):
            self._note(str(getattr(event, "src_path", "")))

    def on_moved(self, event: object) -> None:
        dest = str(getattr(event, "dest_path", ""))
        if dest:
            self._note(dest)

    def on_deleted(self, event: object) -> None:
        path = str(getattr(event, "src_path", ""))
        if path:
            self._gone(path)

    # ── internals ────────────────────────────────────────────────────────

    def _note(self, path: str) -> None:
        try:
            p = Path(path).resolve()
        except OSError:
            return
        if not _is_watched(p):
            return
        with self._lock:
            self._pending_paths.add(str(p))
            if self._timer is not None:
                self._timer.cancel()
            self._timer = threading.Timer(self._debounce, self.flush)
            self._timer.daemon = True
            self._timer.start()

    def _gone(self, path: str) -> None:
        try:
            p = Path(path).resolve()
        except OSError:
            return
        if not _is_watched(p):
            return
        try:
            self._store.mark_gone(host_id=self._host_id, workspace=self._workspace, path=str(p))
        except Exception:  # noqa: BLE001
            _logger.warning("file watch mark_gone failed for %s", p, exc_info=True)

    def flush(self) -> None:
        """Enqueue all debounced paths (idempotent upsert per file)."""
        with self._lock:
            paths = sorted(self._pending_paths)
            self._pending_paths.clear()
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None
        for path in paths:
            try:
                stat = os.stat(path)
            except OSError:
                continue  # vanished between event and flush
            try:
                self._store.upsert_pending(
                    host_id=self._host_id,
                    workspace=self._workspace,
                    path=path,
                    kind=classify_kind(path),
                    size=stat.st_size,
                    mtime_ns=getattr(stat, "st_mtime_ns", int(stat.st_mtime * 1e9)),
                )
                if self._on_enqueue is not None:
                    self._on_enqueue(path)
            except Exception:  # noqa: BLE001
                _logger.warning("file watch enqueue failed for %s", path, exc_info=True)


def bootstrap_scan(store: FileIndexStore, *, host_id: str, workspace: str) -> int:
    """One-time recursive scan enqueueing every watched file. Idempotent.

    Mirrors ``workspace_scan``'s pruning so the index covers exactly the
    files the Files panel shows — including SUBFOLDERS, which the old
    top-level-only poller missed.
    """
    count = 0
    root = Path(workspace)
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in _SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            p = Path(dirpath) / name
            if not _is_watched(p):
                continue
            try:
                stat = p.stat()
            except OSError:
                continue
            try:
                store.upsert_pending(
                    host_id=host_id,
                    workspace=str(root),
                    path=str(p),
                    kind=classify_kind(str(p)),
                    size=stat.st_size,
                    mtime_ns=getattr(stat, "st_mtime_ns", int(stat.st_mtime * 1e9)),
                )
                count += 1
            except Exception:  # noqa: BLE001
                _logger.warning("bootstrap enqueue failed for %s", p, exc_info=True)
    return count


def start_file_watch(
    store: FileIndexStore,
    *,
    host_id: str,
    workspace: str,
    enabled: bool | None = None,
) -> dict[str, object] | None:
    """Start the watcher for one workspace. Returns a handle or None.

    None means "not running": disabled by env, watchdog missing (the
    ``fileintel`` extra not installed), or the workspace path not
    existing. Never raises — file intelligence degrades gracefully like
    the dictation engine does.
    """
    if enabled is None:
        enabled = file_watch_enabled()
    if not enabled:
        return None
    if not os.path.isdir(workspace):
        return None
    try:
        from watchdog.events import FileSystemEvent, FileSystemEventHandler
        from watchdog.observers import Observer
    except ImportError:
        _logger.info(
            "watchdog not installed — file watch disabled (pip install agent-meow[fileintel])"
        )
        return None

    handler = FileWatchHandler(store, host_id=host_id, workspace=workspace)

    class _Adapter(FileSystemEventHandler):
        """Route watchdog's typed events to the pure FileWatchHandler.

        The adapter lives here (not at module scope) so the module keeps
        no hard watchdog import — the watcher degrades to a no-op when
        the fileintel extra is absent.
        """

        def on_created(self, event: FileSystemEvent) -> None:
            handler.on_created(event)

        def on_modified(self, event: FileSystemEvent) -> None:
            handler.on_modified(event)

        def on_moved(self, event: FileSystemEvent) -> None:
            handler.on_moved(event)

        def on_deleted(self, event: FileSystemEvent) -> None:
            handler.on_deleted(event)

    bootstrapped = bootstrap_scan(store, host_id=host_id, workspace=workspace)
    observer = Observer()
    observer.schedule(_Adapter(), workspace, recursive=True)
    observer.daemon = True
    observer.start()
    _logger.info(
        "file watch started: workspace=%s bootstrap=%d debounce=%.1fs",
        workspace,
        bootstrapped,
        handler._debounce,
    )
    return {"observer": observer, "handler": handler, "bootstrapped": bootstrapped}
