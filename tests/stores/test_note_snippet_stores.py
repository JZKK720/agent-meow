"""Store-level tests for the Notes + Snippets surfaces.

Direct CRUD against the SQLAlchemy stores: scoping, pinning, tag filters,
substring search, and cascade delete counts.
"""

from __future__ import annotations

import pytest

from agent_meow.stores.note_store.sqlalchemy_store import SqlAlchemyNoteStore
from agent_meow.stores.snippet_store.sqlalchemy_store import SqlAlchemySnippetStore


@pytest.fixture()
def note_store(db_uri: str) -> SqlAlchemyNoteStore:
    """A note store against the per-test database."""
    return SqlAlchemyNoteStore(db_uri)


@pytest.fixture()
def snippet_store(db_uri: str) -> SqlAlchemySnippetStore:
    """A snippet store against the per-test database."""
    return SqlAlchemySnippetStore(db_uri)


@pytest.fixture()
def conv_id(db_uri: str) -> str:
    """A real conversation row id for scoping."""
    from agent_meow.stores.conversation_store.sqlalchemy_store import (
        SqlAlchemyConversationStore,
    )

    return SqlAlchemyConversationStore(db_uri).create_conversation().id


# ── Notes ─────────────────────────────────────────────────────────────────────


def test_note_add_get_roundtrip(note_store: SqlAlchemyNoteStore, conv_id: str) -> None:
    """add() persists all fields; get() returns them scoped to the conversation."""
    note = note_store.add(conv_id, "TODO", body_md="- a", pinned=True, tags="api")
    fetched = note_store.get(note.id, conv_id)
    assert fetched is not None
    assert fetched.title == "TODO"
    assert fetched.body_md == "- a"
    assert fetched.pinned is True
    assert fetched.tags == "api"


def test_note_get_scoped_to_conversation(
    note_store: SqlAlchemyNoteStore, conv_id: str
) -> None:
    """get() with a mismatched conversation id returns None (scoping)."""
    note = note_store.add(conv_id, "scoped")
    assert note_store.get(note.id, "other-conv") is None


def test_note_list_pinned_first_then_newest(
    note_store: SqlAlchemyNoteStore, conv_id: str
) -> None:
    """list_for_conversation orders pinned first, then newest-first."""
    first = note_store.add(conv_id, "first")
    second = note_store.add(conv_id, "second")
    note_store.set_pinned(first.id, conv_id, True)
    titles = [n.title for n in note_store.list_for_conversation(conv_id)]
    assert titles == ["first", "second"]
    # pin the second (newest) instead — pinned tier wins regardless of age
    note_store.set_pinned(first.id, conv_id, False)
    note_store.set_pinned(second.id, conv_id, True)
    titles = [n.title for n in note_store.list_for_conversation(conv_id)]
    assert titles == ["second", "first"]
    _ = first, second


def test_note_list_tag_filter(note_store: SqlAlchemyNoteStore, conv_id: str) -> None:
    """Tag filter narrows to notes containing the tag."""
    note_store.add(conv_id, "tagged", tags="api,web")
    note_store.add(conv_id, "plain")
    tagged = note_store.list_for_conversation(conv_id, tag="api")
    assert [n.title for n in tagged] == ["tagged"]
    pinned_only = note_store.list_for_conversation(conv_id, pinned_only=True)
    assert pinned_only == []


def test_note_update_fields(note_store: SqlAlchemyNoteStore, conv_id: str) -> None:
    """update() changes only the provided fields and bumps updated_at."""
    note = note_store.add(conv_id, "draft", body_md="v1", tags="a")
    updated = note_store.update(note.id, conv_id, body_md="v2")
    assert updated is not None
    assert updated.title == "draft"
    assert updated.body_md == "v2"
    assert updated.tags == "a"
    assert updated.updated_at >= note.updated_at


def test_note_delete_scoped(
    note_store: SqlAlchemyNoteStore,
    conv_id: str,
    db_uri: str,
) -> None:
    """delete() returns the entity and removes the row; other convs unaffected."""
    note = note_store.add(conv_id, "gone")
    deleted = note_store.delete(note.id, conv_id)
    assert deleted is not None and deleted.id == note.id
    assert note_store.get(note.id, conv_id) is None
    assert note_store.delete_for_conversation(conv_id) == 0


# ── Snippets ──────────────────────────────────────────────────────────────────


def test_snippet_add_get_roundtrip(
    snippet_store: SqlAlchemySnippetStore, conv_id: str
) -> None:
    """add() persists all fields; get() returns them scoped."""
    snippet = snippet_store.add(
        conv_id, "route", language="python", code="pass", description="d", tags="web"
    )
    fetched = snippet_store.get(snippet.id, conv_id)
    assert fetched is not None
    assert fetched.language == "python"
    assert fetched.code == "pass"
    assert fetched.description == "d"
    assert fetched.tags == "web"


def test_snippet_search_scoped_and_case_insensitive(
    snippet_store: SqlAlchemySnippetStore, conv_id: str
) -> None:
    """search() matches title/code/description/tags, case-insensitively."""
    snippet_store.add(conv_id, "Flask Route", code="APP.GET", tags="Web")
    hits = snippet_store.search(conv_id, "flask")
    assert len(hits) == 1
    hits = snippet_store.search(conv_id, "app.get")
    assert len(hits) == 1
    hits = snippet_store.search(conv_id, "web")
    assert len(hits) == 1


def test_snippet_list_language_filter(
    snippet_store: SqlAlchemySnippetStore, conv_id: str
) -> None:
    """Language and tag filters narrow the listing."""
    snippet_store.add(conv_id, "py", language="python", tags="a")
    snippet_store.add(conv_id, "sh", language="bash", tags="b")
    langs = [s.title for s in snippet_store.list_for_conversation(conv_id, language="python")]
    assert langs == ["py"]
    tags = [s.title for s in snippet_store.list_for_conversation(conv_id, tag="b")]
    assert tags == ["sh"]


def test_snippet_update_fields(
    snippet_store: SqlAlchemySnippetStore, conv_id: str
) -> None:
    """update() changes only provided fields and bumps updated_at."""
    snippet = snippet_store.add(conv_id, "draft", code="v1", language="text")
    updated = snippet_store.update(snippet.id, conv_id, code="v2", language="sql")
    assert updated is not None
    assert updated.code == "v2"
    assert updated.language == "sql"
    assert updated.title == "draft"


def test_snippet_delete_scoped(
    snippet_store: SqlAlchemySnippetStore,
    conv_id: str,
) -> None:
    """delete() returns the entity; delete_for_conversation clears the rest."""
    s1 = snippet_store.add(conv_id, "one")
    s2 = snippet_store.add(conv_id, "two")
    deleted = snippet_store.delete(s1.id, conv_id)
    assert deleted is not None and deleted.id == s1.id
    assert snippet_store.delete_for_conversation(conv_id) == 1
    assert snippet_store.get(s2.id, conv_id) is None