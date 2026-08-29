"""Tests for FileTagStore — file tag persistence for vision model classification."""

from __future__ import annotations

import tempfile
from agent_meow.entities.file_tag import FileTag, TagEntry
from agent_meow.stores.file_tag_store.sqlalchemy_store import SqlAlchemyFileTagStore


def _make_store() -> SqlAlchemyFileTagStore:
    """Create a store backed by a temp SQLite DB."""
    db_path = tempfile.mktemp(suffix=".db")
    store = SqlAlchemyFileTagStore(f"sqlite:///{db_path}")
    store._ensure_table()
    return store


def test_upsert_stores_tags_for_file():
    store = _make_store()
    tags = [
        TagEntry(tag="cat", confidence=0.95, description="A cat on grass"),
        TagEntry(tag="outdoor", confidence=0.88, description=None),
    ]
    count = store.upsert("conv1", "/workspace/photo.jpg", tags, model="gemma4:26b")
    assert count == 2
    results = store.list_for_conversation("conv1")
    assert len(results) == 2
    assert results[0].tag == "cat"
    assert results[0].file_path == "/workspace/photo.jpg"
    assert results[0].model == "gemma4:26b"


def test_upsert_replaces_existing_tags_for_same_file():
    store = _make_store()
    store.upsert("conv1", "/workspace/photo.jpg",
                 [TagEntry(tag="old_tag", confidence=0.5, description=None)],
                 model="old_model")
    store.upsert("conv1", "/workspace/photo.jpg",
                 [TagEntry(tag="new_tag", confidence=0.9, description=None)],
                 model="new_model")
    results = [r for r in store.list_for_conversation("conv1") if r.file_path == "/workspace/photo.jpg"]
    assert len(results) == 1
    assert results[0].tag == "new_tag"
    assert results[0].model == "new_model"


def test_list_tags_returns_unique_tags_with_counts():
    store = _make_store()
    store.upsert("conv1", "/workspace/a.jpg",
                 [TagEntry(tag="cat", confidence=0.9, description=None)], model="m")
    store.upsert("conv1", "/workspace/b.jpg",
                 [TagEntry(tag="cat", confidence=0.8, description=None),
                  TagEntry(tag="dog", confidence=0.7, description=None)], model="m")
    tags = store.list_tags("conv1")
    tag_map = {t.tag: t.count for t in tags}
    assert tag_map == {"cat": 2, "dog": 1}


def test_delete_for_conversation_removes_all_tags():
    store = _make_store()
    store.upsert("conv1", "/workspace/a.jpg",
                 [TagEntry(tag="cat", confidence=0.9, description=None)], model="m")
    deleted = store.delete_for_conversation("conv1")
    assert deleted == 1
    assert store.list_for_conversation("conv1") == []
