"""Tests for the file embed worker (plan 039 P2).

Uses in-memory fakes for the stores and a stubbed CLIP probe so no HTTP
or model is needed — the worker's queue/claim/degrade behavior is what's
under test.
"""

from __future__ import annotations

import threading
from typing import Any

import pytest

from agent_meow.entities.file_index import (
    KIND_DOCUMENT,
    KIND_IMAGE,
    STATUS_INDEXED,
    FileIndexEntry,
)
from agent_meow.runner import file_embed_worker as few


class FakeIndexStore:
    """Minimal claim/mark double for the index store.

    FileIndexEntry is frozen, so claim() returns fresh copies with
    status flipped instead of mutating in place — mirroring the real
    store's row-level updates.
    """

    def __init__(self, entries: list[FileIndexEntry]) -> None:
        self.entries = list(entries)
        self.claimed: list[str] = []
        self.marked: list[tuple[str, str]] = []  # (id, status)

    def claim_pending(self, limit: int = 8) -> list[FileIndexEntry]:
        out: list[FileIndexEntry] = []
        for e in self.entries:
            if len(out) >= limit:
                break
            if not e.id in {c for c, _s in self.marked}:
                out.append(e)
                self.claimed.append(e.id)
                self.marked.append((e.id, "processing"))
        return out

    def mark_indexed(self, entry_id: str, **_: Any) -> None:
        self.marked.append((entry_id, STATUS_INDEXED))

    def mark_failed(self, entry_id: str, error: str) -> None:
        self.marked.append((entry_id, f"failed: {error}"))


class FakeEmbedStore:
    def __init__(self) -> None:
        self.embedded: dict[str, list[float]] = {}
        self.fail_ids: set[str] = set()

    def embedded_file_ids(self, *, model: str) -> set[str]:
        return set(self.embedded)

    def upsert(self, *, file_id: str, model: str, vector: list[float]) -> None:
        if file_id in self.fail_ids:
            raise RuntimeError("boom")
        self.embedded[file_id] = vector


def _entry(
    id_: str, kind: str = KIND_IMAGE, thumb: str | None = None
) -> FileIndexEntry:
    return FileIndexEntry(
        id=id_,
        host_id="h1",
        workspace="C:/ws",
        path=f"C:/ws/{id_}.png",
        kind=kind,
        size=1,
        mtime_ns=1,
        content_hash="h",
        status="pending",
        thumb_path=thumb,
        error=None,
        indexed_at=0,
        created_at=0,
        meta={},
    )


def test_run_once_skips_when_clip_server_down(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(few, "_clip_ready", lambda: (False, "conn refused"))
    idx = FakeIndexStore([_entry("a")])
    emb = FakeEmbedStore()
    assert few.run_once(idx, emb, clip_ok=None) == {}  # server check path → no-op
    assert emb.embedded == {}


def test_run_once_hands_nonimage_rows_back(monkeypatch: pytest.MonkeyPatch) -> None:
    doc = _entry("doc1", kind=KIND_DOCUMENT)
    idx = FakeIndexStore([doc])
    emb = FakeEmbedStore()
    tally = few.run_once(idx, emb, batch=4, clip_ok=True)
    # Document rows are re-marked indexed and not attempted for embedding.
    assert ("doc1", STATUS_INDEXED) in idx.marked
    assert emb.embedded == {}


def test_run_once_embeds_image_with_thumbnail(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Any
) -> None:
    thumb = tmp_path / "t.webp"
    thumb.write_bytes(b"\x00\x01")
    img = _entry("img1", thumb=str(thumb))
    idx = FakeIndexStore([img])
    emb = FakeEmbedStore()
    monkeypatch.setattr(few, "_embed_thumbnail", lambda p: [0.1, 0.9])
    tally = few.run_once(idx, emb, batch=4, clip_ok=True)
    assert tally == {"embedded": 1}
    assert emb.embedded["img1"] == [0.1, 0.9]
    assert ("img1", STATUS_INDEXED) in idx.marked


def test_failed_embed_marks_failed_and_batch_continues(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Any
) -> None:
    t1 = tmp_path / "t1.webp"
    t1.write_bytes(b"x")
    t2 = tmp_path / "t2.webp"
    t2.write_bytes(b"y")
    good = _entry("good", thumb=str(t2))
    bad = _entry("bad", thumb=str(t1))
    idx = FakeIndexStore([bad, good])
    emb = FakeEmbedStore()
    emb.fail_ids.add("bad")
    monkeypatch.setattr(few, "_embed_thumbnail", lambda p: [1.0, 0.0])
    tally = few.run_once(idx, emb, batch=4, clip_ok=True)
    # 'bad' fails on upsert; 'good' still embeds — batch isolation works.
    assert tally == {"failed": 1, "embedded": 1}
    assert emb.embedded.get("good") == [1.0, 0.0]
    assert any(fid == "bad" and status.startswith("failed") for fid, status in idx.marked)


def test_worker_loop_stops_on_event(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(few, "run_once", lambda *a, **k: {"embedded": 0})
    idx = FakeIndexStore([])
    emb = FakeEmbedStore()
    stop = threading.Event()
    stop.set()  # exit immediately
    few.worker_loop(idx, emb, stop_event=stop, interval=0.01)


@pytest.fixture()
def CLIP_MODEL() -> str:  # noqa: N802 — used only as a walrus target above
    return "m"