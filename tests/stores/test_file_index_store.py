"""Tests for FileIndexStore — workspace-scoped file intelligence index (plan 039)."""

from __future__ import annotations

import os
import tempfile

from agent_meow.entities.file_index import (
    KIND_DOCUMENT,
    KIND_IMAGE,
    STATUS_GONE,
    STATUS_INDEXED,
    STATUS_PENDING,
    STATUS_PROCESSING,
    classify_kind,
)
from agent_meow.stores.file_index_store.sqlalchemy_store import SqlAlchemyFileIndexStore

_WS = "C:/Users/1/agent-meow-workspace"


def _make_store() -> SqlAlchemyFileIndexStore:
    db_path = os.path.join(tempfile.mkdtemp(), "test.db")
    return SqlAlchemyFileIndexStore(f"sqlite:///{db_path}")


def _add(store: SqlAlchemyFileIndexStore, path: str, *, size: int = 10, mtime: int = 1) -> str:
    return store.upsert_pending(
        host_id="h1", workspace=_WS, path=path, kind=KIND_IMAGE, size=size, mtime_ns=mtime
    )


def test_classify_kind_buckets_extensions():
    assert classify_kind("a/b/photo.JPG") == KIND_IMAGE
    assert classify_kind("notes.pdf") == KIND_DOCUMENT
    assert classify_kind("notes.md") == KIND_DOCUMENT
    assert classify_kind("script.py") == "other"


def test_upsert_pending_inserts_then_idempotent():
    store = _make_store()
    fid = _add(store, f"{_WS}/a.jpg")
    rows = store.list_workspace(host_id="h1", workspace=_WS)
    assert len(rows) == 1
    assert rows[0].status == STATUS_PENDING
    assert rows[0].id == fid

    # Same size+mtime → not requeued (stays pending here since never indexed).
    fid2 = _add(store, f"{_WS}/a.jpg")
    assert fid2 == fid
    assert len(store.list_workspace(host_id="h1", workspace=_WS)) == 1


def test_changed_file_requeues_after_index():
    store = _make_store()
    fid = _add(store, f"{_WS}/a.jpg", size=10, mtime=1)
    claimed = store.claim_pending(limit=1)
    assert [c.id for c in claimed] == [fid]
    store.mark_indexed(fid, content_hash="h-a", meta={"exif": {"date": "2026"}}, thumb_path=None)

    # Unchanged → stays indexed.
    _add(store, f"{_WS}/a.jpg", size=10, mtime=1)
    assert (
        store.find_by_path(host_id="h1", workspace=_WS, path=f"{_WS}/a.jpg").status
        == STATUS_INDEXED
    )

    # Modified (new mtime) → back to pending.
    _add(store, f"{_WS}/a.jpg", size=12, mtime=2)
    assert (
        store.find_by_path(host_id="h1", workspace=_WS, path=f"{_WS}/a.jpg").status
        == STATUS_PENDING
    )


def test_claim_pending_transitions_and_limits():
    store = _make_store()
    _add(store, f"{_WS}/1.jpg")
    _add(store, f"{_WS}/2.jpg")
    _add(store, f"{_WS}/3.jpg")
    claimed = store.claim_pending(limit=2)
    assert len(claimed) == 2
    assert all(c.status == STATUS_PROCESSING for c in claimed)
    # Second claim sees only the remaining pending row.
    rest = store.claim_pending(limit=8)
    assert len(rest) == 1
    assert store.claim_pending(limit=8) == []


def test_mark_indexed_stores_meta_and_reads_back():
    store = _make_store()
    fid = _add(store, f"{_WS}/x.png")
    store.claim_pending()
    store.mark_indexed(
        fid,
        content_hash="phash123",
        meta={"exif": {"camera": "Canon", "gps": [22.3, 114.2]}, "words": None},
        thumb_path=f"{_WS}/.thumbs/x.webp",
    )
    entry = store.find_by_path(host_id="h1", workspace=_WS, path=f"{_WS}/x.png")
    assert entry.status == STATUS_INDEXED
    assert entry.content_hash == "phash123"
    assert entry.meta["exif"]["camera"] == "Canon"
    assert entry.thumb_path == f"{_WS}/.thumbs/x.webp"


def test_mark_failed_parks_row_and_requeues_on_change():
    store = _make_store()
    fid = _add(store, f"{_WS}/bad.jpg")
    store.claim_pending()
    store.mark_failed(fid, "cannot decode")
    entry = store.find_by_path(host_id="h1", workspace=_WS, path=f"{_WS}/bad.jpg")
    assert entry.status == "failed"
    assert entry.error == "cannot decode"
    # Not claimable again until the file changes.
    assert store.claim_pending() == []
    _add(store, f"{_WS}/bad.jpg", size=99, mtime=99)
    assert store.claim_pending() != []


def test_duplicate_detection_via_hash_owner():
    store = _make_store()
    a = _add(store, f"{_WS}/a.jpg")
    store.claim_pending()
    store.mark_indexed(a, content_hash="same", meta={}, thumb_path=None)

    b = _add(store, f"{_WS}/copy.jpg")
    store.claim_pending()
    owner = store.find_hash_owner(host_id="h1", workspace=_WS, content_hash="same", exclude_id=b)
    assert owner is not None and owner.id == a
    store.mark_duplicate(b, content_hash="same")
    assert (
        store.find_by_path(host_id="h1", workspace=_WS, path=f"{_WS}/copy.jpg").status
        == "duplicate"
    )


def test_mark_gone_hides_from_default_list():
    store = _make_store()
    fid = _add(store, f"{_WS}/gone.jpg")
    store.claim_pending()
    store.mark_indexed(fid, content_hash="g", meta={}, thumb_path=None)
    store.mark_gone(host_id="h1", workspace=_WS, path=f"{_WS}/gone.jpg")
    listing = store.list_workspace(host_id="h1", workspace=_WS)
    assert [e for e in listing if e.id == fid] == []
    hist = store.count_by_status(host_id="h1", workspace=_WS)
    assert hist.get(STATUS_GONE) == 1


def test_list_workspace_filters_by_kind_and_status():
    store = _make_store()
    img = store.upsert_pending(
        host_id="h1", workspace=_WS, path=f"{_WS}/p.jpg", kind=KIND_IMAGE, size=1, mtime_ns=1
    )
    store.upsert_pending(
        host_id="h1", workspace=_WS, path=f"{_WS}/d.pdf", kind=KIND_DOCUMENT, size=1, mtime_ns=1
    )
    store.claim_pending(limit=8)
    store.mark_indexed(img, content_hash="i", meta={}, thumb_path=None)

    docs = store.list_workspace(host_id="h1", workspace=_WS, kind=KIND_DOCUMENT)
    assert [d.path for d in docs] == [f"{_WS}/d.pdf"]
    indexed = store.list_workspace(host_id="h1", workspace=_WS, statuses=(STATUS_INDEXED,))
    assert [e.path for e in indexed] == [f"{_WS}/p.jpg"]


def test_scoping_is_per_host_and_workspace():
    store = _make_store()
    _add(store, f"{_WS}/a.jpg")
    store.upsert_pending(
        host_id="h2", workspace=_WS, path=f"{_WS}/a.jpg", kind=KIND_IMAGE, size=1, mtime_ns=1
    )
    store.upsert_pending(
        host_id="h1",
        workspace="D:/other",
        path=f"{_WS}/a.jpg",
        kind=KIND_IMAGE,
        size=1,
        mtime_ns=1,
    )
    assert len(store.list_workspace(host_id="h1", workspace=_WS)) == 1
    assert len(store.list_workspace(host_id="h2", workspace=_WS)) == 1
    assert len(store.list_workspace(host_id="h1", workspace="D:/other")) == 1
