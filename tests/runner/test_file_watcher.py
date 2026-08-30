"""Tests for the workspace file watcher (plan 039 Phase 0, task 0.2).

Deterministic by construction: the handler's debounce is injected at 0
and flush() is called directly, so no sleeps and no watchdog Observer
needed for the logic tests. The real SqlAlchemyFileIndexStore backs the
integration-style assertions (temp DB per test), and one test uses
inotify/ReadDirectoryChangesW end-to-end via the Observer when
watchdog is available.
"""

from __future__ import annotations

import os
import time
from pathlib import Path

import pytest

from agent_meow.entities.file_index import (
    KIND_DOCUMENT,
    KIND_IMAGE,
    STATUS_GONE,
    STATUS_PENDING,
)
from agent_meow.runner.file_watcher import (
    FileWatchHandler,
    _is_watched,
    bootstrap_scan,
    file_watch_enabled,
    start_file_watch,
)
from agent_meow.stores.file_index_store.sqlalchemy_store import SqlAlchemyFileIndexStore


def _make_store(tmp_path: Path) -> SqlAlchemyFileIndexStore:
    return SqlAlchemyFileIndexStore(f"sqlite:///{tmp_path / 'idx.db'}")


def _handler(store, workspace: str, **kw) -> FileWatchHandler:
    # Large debounce so the auto-timer never races the test's manual
    # flush(); the coalescing window is exercised deterministically.
    return FileWatchHandler(store, host_id="h1", workspace=workspace, debounce=60.0, **kw)


# ── _is_watched ─────────────────────────────────────────────────────────────


def test_is_watched_accepts_image_and_doc_extensions(tmp_path: Path):
    assert _is_watched(Path(tmp_path / "a.jpg"))
    assert _is_watched(Path(tmp_path / "b.PNG"))
    assert _is_watched(Path(tmp_path / "c.pdf"))
    assert _is_watched(Path(tmp_path / "d.docx"))


def test_is_watched_rejects_unwatched_extensions(tmp_path: Path):
    assert not _is_watched(Path(tmp_path / "script.py"))
    assert not _is_watched(Path(tmp_path / "notes.txt.bak"))
    assert not _is_watched(Path(tmp_path / "noext"))


def test_is_watched_skips_build_dirs_and_dotfiles(tmp_path: Path):
    assert not _is_watched(Path(tmp_path / "node_modules" / "x.png"))
    assert not _is_watched(Path(tmp_path / ".git" / "hooks" / "y.jpg"))
    assert not _is_watched(Path(tmp_path / ".hidden" / "z.png"))
    assert not _is_watched(Path(tmp_path / "sub" / ".dotfile.pdf"))


def test_is_watched_allows_normal_subfolders(tmp_path: Path):
    assert _is_watched(Path(tmp_path / "photos" / "2026" / "beach.jpg"))


# ── handler debounce + enqueue ──────────────────────────────────────────────


def test_note_then_flush_enqueues_pending(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    f = ws / "photo.jpg"
    f.write_bytes(b"\xff\xd8fake")
    store = _make_store(tmp_path)
    h = _handler(store, str(ws))

    h._note(str(f))
    h.flush()

    rows = store.list_workspace(host_id="h1", workspace=str(ws))
    assert len(rows) == 1
    assert rows[0].path == str(f.resolve())
    assert rows[0].status == STATUS_PENDING
    assert rows[0].kind == KIND_IMAGE
    assert rows[0].size == f.stat().st_size


def test_debounce_coalesces_repeated_notes(tmp_path: Path):
    """Many events for one path within the window → one enqueue."""
    ws = tmp_path / "ws"
    ws.mkdir()
    f = ws / "a.png"
    f.write_bytes(b"x")
    store = _make_store(tmp_path)
    enqueued: list[str] = []
    # Large debounce so the auto-timer never fires during the test; we
    # flush() manually after the burst — that's the coalescing window.
    h = FileWatchHandler(
        store, host_id="h1", workspace=str(ws), on_enqueue=enqueued.append, debounce=60.0
    )

    for _ in range(5):
        h._note(str(f))
    h.flush()

    # Compare via normcase(realpath) — Windows resolve() can yield
    # short-name vs long-name forms that differ as strings but name the
    # same file.
    assert len(enqueued) == 1
    assert os.path.normcase(os.path.realpath(enqueued[0])) == os.path.normcase(
        os.path.realpath(str(f))
    )
    rows = store.list_workspace(host_id="h1", workspace=str(ws))
    assert len(rows) == 1
    assert os.path.normcase(os.path.realpath(rows[0].path)) == os.path.normcase(
        os.path.realpath(str(f))
    )


def test_auto_timer_flushes_without_manual_call(tmp_path: Path):
    """A short debounce fires on its own — no manual flush needed."""
    ws = tmp_path / "ws"
    ws.mkdir()
    f = ws / "auto.jpg"
    f.write_bytes(b"x")
    store = _make_store(tmp_path)
    h = FileWatchHandler(store, host_id="h1", workspace=str(ws), debounce=0.05)

    h._note(str(f))
    deadline = time.time() + 3.0
    while time.time() < deadline:
        if store.list_workspace(host_id="h1", workspace=str(ws)):
            break
        time.sleep(0.05)
    rows = store.list_workspace(host_id="h1", workspace=str(ws))
    assert len(rows) == 1
    assert os.path.normcase(os.path.realpath(rows[0].path)) == os.path.normcase(
        os.path.realpath(str(f))
    )


def test_unwatched_path_never_enqueues(tmp_path: Path):
    ws = tmp_path / "ws"
    (ws / "src").mkdir(parents=True)
    f = ws / "src" / "main.py"
    f.write_text("print()")
    store = _make_store(tmp_path)
    h = _handler(store, str(ws))

    h._note(str(f))
    h.flush()
    assert store.list_workspace(host_id="h1", workspace=str(ws)) == []


def test_deleted_path_marks_gone(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    f = ws / "old.jpg"
    f.write_bytes(b"x")
    store = _make_store(tmp_path)
    h = _handler(store, str(ws))

    h._note(str(f))
    h.flush()
    assert store.list_workspace(host_id="h1", workspace=str(ws))[0].status == STATUS_PENDING

    h._gone(str(f))
    rows = store.list_workspace(host_id="h1", workspace=str(ws), statuses=(STATUS_GONE,))
    assert [r.path for r in rows] == [str(f.resolve())]


def test_flush_skips_vanished_files(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    ghost = ws / "ghost.jpg"
    store = _make_store(tmp_path)
    h = _handler(store, str(ws))

    h._note(str(ghost))  # never created on disk
    h.flush()
    assert store.list_workspace(host_id="h1", workspace=str(ws)) == []


def test_document_extension_classifies_as_document(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    f = ws / "report.pdf"
    f.write_bytes(b"%PDF-1.4 fake")
    store = _make_store(tmp_path)
    h = _handler(store, str(ws))
    h._note(str(f))
    h.flush()
    rows = store.list_workspace(host_id="h1", workspace=str(ws))
    assert rows[0].kind == KIND_DOCUMENT


# ── bootstrap_scan ──────────────────────────────────────────────────────────


def test_bootstrap_scan_recurses_subfolders(tmp_path: Path):
    """The old poller was top-level only; bootstrap must cover subfolders."""
    ws = tmp_path / "ws"
    (ws / "trip" / "day1").mkdir(parents=True)
    (ws / "top.jpg").write_bytes(b"a")
    (ws / "trip" / "mid.png").write_bytes(b"b")
    (ws / "trip" / "day1" / "deep.pdf").write_bytes(b"c")
    (ws / "trip" / "day1" / "skipme.py").write_text("x")
    (ws / ".hidden").mkdir()
    (ws / ".hidden" / "secret.jpg").write_bytes(b"d")
    (ws / "node_modules").mkdir()
    (ws / "node_modules" / "pkg.jpg").write_bytes(b"e")

    store = _make_store(tmp_path)
    n = bootstrap_scan(store, host_id="h1", workspace=str(ws))

    paths = {Path(r.path).name for r in store.list_workspace(host_id="h1", workspace=str(ws))}
    assert n == 3
    assert paths == {"top.jpg", "mid.png", "deep.pdf"}


def test_bootstrap_scan_is_idempotent(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    (ws / "a.jpg").write_bytes(b"x")
    store = _make_store(tmp_path)
    bootstrap_scan(store, host_id="h1", workspace=str(ws))
    bootstrap_scan(store, host_id="h1", workspace=str(ws))
    assert len(store.list_workspace(host_id="h1", workspace=str(ws))) == 1


# ── start_file_watch gating ─────────────────────────────────────────────────


def test_file_watch_enabled_defaults_on(monkeypatch: pytest.MonkeyPatch):
    """Zero-config: unset env means the watcher is on (plan 039)."""
    monkeypatch.delenv("AGENT_MEOW_FILE_WATCH", raising=False)
    assert file_watch_enabled() is True
    monkeypatch.setenv("AGENT_MEOW_FILE_WATCH", "off")
    assert file_watch_enabled() is False
    monkeypatch.setenv("AGENT_MEOW_FILE_WATCH", "0")
    assert file_watch_enabled() is False
    monkeypatch.setenv("AGENT_MEOW_FILE_WATCH", "true")
    assert file_watch_enabled() is True


def test_start_returns_none_when_disabled(tmp_path: Path):
    ws = tmp_path / "ws"
    ws.mkdir()
    store = _make_store(tmp_path)
    assert start_file_watch(store, host_id="h1", workspace=str(ws), enabled=False) is None


def test_start_returns_none_for_missing_workspace(tmp_path: Path):
    store = _make_store(tmp_path)
    assert (
        start_file_watch(store, host_id="h1", workspace=str(tmp_path / "nope"), enabled=True)
        is None
    )


def test_start_returns_none_when_watchdog_missing(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    import builtins
    import sys

    ws = tmp_path / "ws"
    ws.mkdir()
    (ws / "a.jpg").write_bytes(b"x")
    store = _make_store(tmp_path)
    real_import = builtins.__import__

    def fake_import(name: str, *args: object, **kwargs: object):
        if name.startswith("watchdog"):
            raise ImportError("no watchdog")
        return real_import(name, *args, **kwargs)  # type: ignore[arg-type]

    monkeypatch.setattr(builtins, "__import__", fake_import)
    # watchdog already in sys.modules — force the lazy import to fail.
    watchdog_mods = {k: v for k, v in sys.modules.items() if k.startswith("watchdog")}
    for k in watchdog_mods:
        del sys.modules[k]
    try:
        assert start_file_watch(store, host_id="h1", workspace=str(ws), enabled=True) is None
        # Bootstrap still ran before the Observer import failed? No — the
        # import check happens first, so nothing is enqueued.
        assert store.list_workspace(host_id="h1", workspace=str(ws)) == []
    finally:
        sys.modules.update(watchdog_mods)


@pytest.mark.skipif(
    not os.environ.get("AGENT_MEOW_TEST_WATCHDOG_E2E"),
    reason="live Observer test is timing-flaky in CI; run locally with the env var set",
)
def test_live_observer_end_to_end(tmp_path: Path):
    """Real watchdog events: drop a file → it lands in the index."""
    ws = tmp_path / "ws"
    ws.mkdir()
    store = _make_store(tmp_path)
    handle = start_file_watch(store, host_id="h1", workspace=str(ws), enabled=True)
    assert handle is not None
    try:
        time.sleep(0.3)
        (ws / "live.jpg").write_bytes(b"\xff\xd8live")
        deadline = time.time() + 5.0
        while time.time() < deadline:
            rows = store.list_workspace(host_id="h1", workspace=str(ws))
            if rows:
                break
            time.sleep(0.2)
        rows = store.list_workspace(host_id="h1", workspace=str(ws))
        assert [Path(r.path).name for r in rows] == ["live.jpg"]
    finally:
        handle.observer.stop()
        handle.observer.join(timeout=2)
