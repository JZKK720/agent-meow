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


def _seed_indexed(store, path, *, meta=None, kind=KIND_IMAGE):
    """Helper: upsert + claim + mark_indexed in one step."""
    fid = store.upsert_pending(
        host_id="h1", workspace=_WS, path=path, kind=kind, size=10, mtime_ns=1
    )
    store.claim_pending()
    store.mark_indexed(fid, content_hash=f"h-{path}", meta=meta or {}, thumb_path=None)
    return fid


def test_search_returns_empty_for_blank_query():
    store = _make_store()
    _seed_indexed(store, f"{_WS}/cat.jpg", meta={"camera_model": "Canon"})
    assert store.search(host_id="h1", workspace=_WS, query="") == []


def test_search_matches_basename():
    store = _make_store()
    _seed_indexed(store, f"{_WS}/vacation_beach.jpg")
    _seed_indexed(store, f"{_WS}/notes.txt", kind=KIND_DOCUMENT)
    hits = store.search(host_id="h1", workspace=_WS, query="vacation")
    assert len(hits) == 1
    assert hits[0][0].path.endswith("vacation_beach.jpg")
    # score is a float (negated bm25)
    assert isinstance(hits[0][1], float)


def test_search_matches_exif_camera():
    store = _make_store()
    _seed_indexed(store, f"{_WS}/a.jpg", meta={"camera_model": "Canon EOS R5"})
    _seed_indexed(store, f"{_WS}/b.jpg", meta={"camera_model": "Nikon"})
    hits = store.search(host_id="h1", workspace=_WS, query="Canon")
    assert len(hits) == 1
    assert hits[0][0].path.endswith("a.jpg")


def test_search_matches_doc_text_excerpt():
    store = _make_store()
    _seed_indexed(
        store, f"{_WS}/report.pdf", kind=KIND_DOCUMENT,
        meta={"text_excerpt": "Quarterly revenue exceeded expectations"},
    )
    hits = store.search(host_id="h1", workspace=_WS, query="revenue")
    assert len(hits) == 1
    assert hits[0][0].kind == "document"


def test_search_filters_by_kind():
    store = _make_store()
    _seed_indexed(store, f"{_WS}/photo.jpg", kind=KIND_IMAGE)
    _seed_indexed(store, f"{_WS}/doc.pdf", kind=KIND_DOCUMENT)
    # "photo" matches the image basename; "doc" matches the doc basename.
    img_hits = store.search(host_id="h1", workspace=_WS, query="photo", kind=KIND_IMAGE)
    assert all(e.kind == "image" for e, _ in img_hits)
    doc_hits = store.search(host_id="h1", workspace=_WS, query="doc", kind=KIND_DOCUMENT)
    assert all(e.kind == "document" for e, _ in doc_hits)


def test_search_excludes_non_indexed_rows():
    store = _make_store()
    # A pending row (never indexed) should not surface in search.
    store.upsert_pending(
        host_id="h1", workspace=_WS, path=f"{_WS}/pending.jpg", kind=KIND_IMAGE, size=1, mtime_ns=1
    )
    _seed_indexed(store, f"{_WS}/indexed.jpg")
    # trigram needs >=3 chars; "indexed" matches the basename.
    hits = store.search(host_id="h1", workspace=_WS, query="indexed")
    paths = [e.path for e, _ in hits]
    assert any(p.endswith("indexed.jpg") for p in paths)
    assert not any(p.endswith("pending.jpg") for p in paths)


def test_search_cjk_substring_match():
    """The trigram tokenizer gives CJK substring match (needs >=3 chars)."""
    store = _make_store()
    _seed_indexed(store, f"{_WS}/海边日落.jpg", meta={"camera_model": "Sony"})
    # trigram needs 3 chars; "海边日" is a 3-char substring of the basename.
    hits = store.search(host_id="h1", workspace=_WS, query="海边日")
    assert len(hits) == 1
    assert hits[0][0].path.endswith("海边日落.jpg")


def test_search_self_heals_legacy_external_content_fts(tmp_path):
    """A legacy external-content FTS table (rowid-keyed, no file_id) must be
    detected, dropped, recreated standalone, and backfilled — otherwise every
    search dies with ``no such column: file_index_fts.file_id``."""
    import sqlite3

    db_path = tmp_path / "legacy.db"
    # Create the legacy shape by hand: the external-content FTS table an
    # intermediate dev build shipped (rowid-keyed, no file_id column).
    raw = sqlite3.connect(db_path)
    raw.execute(
        "CREATE TABLE file_index (id VARCHAR(64) PRIMARY KEY, host_id VARCHAR(64), "
        "workspace VARCHAR(1024), path VARCHAR(2048), kind VARCHAR(16), size INTEGER, "
        "mtime_ns INTEGER, content_hash VARCHAR(64), status VARCHAR(16), "
        "thumb_path VARCHAR(2048), error TEXT, indexed_at INTEGER, created_at INTEGER)"
    )
    raw.execute(
        "CREATE VIRTUAL TABLE file_index_fts USING fts5("
        "body, content='file_index', content_rowid='rowid', "
        "tokenize='trigram case_sensitive 0')"
    )
    raw.commit()
    raw.close()

    # Opening the store must self-heal the schema and backfill the bodies.
    store = SqlAlchemyFileIndexStore(f"sqlite:///{db_path}")
    fid = _add(store, f"{_WS}/legacy.jpg")
    store.claim_pending()
    store.mark_indexed(fid, content_hash="h", meta={"camera_model": "Canon"}, thumb_path=None)
    hits = store.search(host_id="h1", workspace=_WS, query="legacy")
    assert len(hits) == 1
    assert hits[0][0].path.endswith("legacy.jpg")

    # The healed schema carries file_id.
    raw = sqlite3.connect(db_path)
    cols = raw.execute(
        "SELECT sql FROM sqlite_master WHERE name = 'file_index_fts'"
    ).fetchone()[0]
    assert "file_id" in cols
    raw.close()


def test_search_matches_dimensions():
    """width/height are searchable (the badge text users see)."""
    store = _make_store()
    _seed_indexed(store, f"{_WS}/wide.png", meta={"width": 2560, "height": 1528})
    _seed_indexed(store, f"{_WS}/small.jpg", meta={"width": 640, "height": 480})
    hits = store.search(host_id="h1", workspace=_WS, query="2560")
    assert len(hits) == 1
    assert hits[0][0].path.endswith("wide.png")


def test_body_version_bump_reindexes_existing_rows(tmp_path):
    """A body-function change (version bump) rebuilds existing FTS rows,
    so dimension searches work on rows indexed before the change."""
    import sqlite3

    db_path = tmp_path / "v1.db"
    # Simulate a v1-built index: row indexed, version stamped 1.
    store = SqlAlchemyFileIndexStore(f"sqlite:///{db_path}")
    fid = _add(store, f"{_WS}/oldshot.png")
    store.claim_pending()
    store.mark_indexed(fid, content_hash="h", meta={"width": 1920, "height": 1080}, thumb_path=None)
    raw = sqlite3.connect(db_path)
    raw.execute("UPDATE file_index_fts_version SET version = 1 WHERE id = 1")
    raw.execute("DELETE FROM file_index_fts")
    raw.commit()
    raw.close()
    # Reopen (runs _install_fts): version 1 < current → rebuild bodies.
    store2 = SqlAlchemyFileIndexStore(f"sqlite:///{db_path}")
    hits = store2.search(host_id="h1", workspace=_WS, query="1920")
    assert len(hits) == 1
    assert hits[0][0].path.endswith("oldshot.png")
