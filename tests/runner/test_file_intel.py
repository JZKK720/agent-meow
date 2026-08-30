"""Tests for the file-intelligence composition (plan 039 Phase 0, task 0.4).

start_file_intel wires watcher + worker against the real store; the
enabled/disabled + degradation paths are the contract the runner
lifespan relies on (it must boot cleanly without the fileintel extra or
when the feature is off)."""

from __future__ import annotations

import time
from pathlib import Path

import pytest

# The composition needs watchdog (watcher) + Pillow (worker); skip the
# module cleanly when the fileintel extra is absent.
pytest.importorskip("watchdog", reason="fileintel extra (watchdog) not installed")
pytest.importorskip("PIL", reason="fileintel extra (pillow) not installed")

from agent_meow.entities.file_index import classify_kind
from agent_meow.runner.file_intel import start_file_intel, stop_file_intel
from agent_meow.stores.file_index_store.sqlalchemy_store import (
    SqlAlchemyFileIndexStore,
)


def _make_store(tmp_path: Path) -> SqlAlchemyFileIndexStore:
    return SqlAlchemyFileIndexStore(f"sqlite:///{tmp_path / 'idx.db'}")


def test_start_returns_none_when_disabled(tmp_path: Path):
    store = _make_store(tmp_path)
    assert start_file_intel(workspace=str(tmp_path), store=store, enabled=False) is None


def test_start_returns_none_when_watchdog_missing(tmp_path: Path, monkeypatch):
    import builtins
    import sys

    store = _make_store(tmp_path)
    real = builtins.__import__

    def fake(name, *a, **k):
        if name.startswith("watchdog"):
            raise ImportError("no watchdog")
        return real(name, *a, **k)

    monkeypatch.setattr(builtins, "__import__", fake)
    saved = {k: v for k, v in sys.modules.items() if k.startswith("watchdog")}
    for k in saved:
        del sys.modules[k]
    try:
        assert start_file_intel(workspace=str(tmp_path), store=store, enabled=True) is None
    finally:
        sys.modules.update(saved)


def test_start_indexes_then_worker_extracts(tmp_path: Path):
    """End-to-end: a dropped image is enqueued by bootstrap + indexed by
    the worker thread within a few seconds."""
    ws = tmp_path / "ws"
    ws.mkdir()
    img = ws / "photo.jpg"
    # A tiny valid JPEG with EXIF via Pillow.
    from PIL import Image

    im = Image.new("RGB", (48, 36), (5, 6, 7))
    exif = im.getexif()
    exif[0x010F] = "Nikon"
    im.save(img, "JPEG", exif=exif)

    store = _make_store(tmp_path)
    handle = start_file_intel(workspace=str(ws), store=store, enabled=True)
    assert handle is not None
    try:
        # Bootstrap enqueued it; worker (2s cadence) extracts within ~6s.
        row = None
        deadline = time.time() + 8.0
        while time.time() < deadline:
            row = store.find_by_path(host_id="", workspace=str(ws), path=str(img.resolve()))
            if row is not None and row.status == "indexed":
                break
            time.sleep(0.2)
        assert row is not None
        assert row.status == "indexed"
        assert row.kind == classify_kind("photo.jpg")
        assert row.meta.get("camera_make") == "Nikon"
        assert row.content_hash  # dHash recorded
    finally:
        stop_file_intel(handle)
    assert not handle.thread.is_alive()


def test_stop_is_safe_on_none():
    stop_file_intel(None)  # no crash
