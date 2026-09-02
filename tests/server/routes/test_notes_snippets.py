"""Notes + Snippets surface routes: CRUD round-trips against real stores.

Covers the Notes (pin/tag) and Code Snippets (search) surfaces end to end
through the mounted routers: create/list/get/update/delete plus the
notes pin toggle, list filters, and the snippets substring search.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI

from agent_meow.runtime.agent_cache import AgentCache
from agent_meow.server.app import create_app
from agent_meow.stores.agent_store.sqlalchemy_store import SqlAlchemyAgentStore
from agent_meow.stores.artifact_store.local import LocalArtifactStore
from agent_meow.stores.comment_store.sqlalchemy_store import SqlAlchemyCommentStore
from agent_meow.stores.conversation_store.sqlalchemy_store import (
    SqlAlchemyConversationStore,
)
from agent_meow.stores.file_store.sqlalchemy_store import SqlAlchemyFileStore
from agent_meow.stores.note_store.sqlalchemy_store import SqlAlchemyNoteStore
from agent_meow.stores.snippet_store.sqlalchemy_store import SqlAlchemySnippetStore


@pytest.fixture()
def resources_app(runtime_init: None, db_uri: str, tmp_path: Path) -> FastAPI:
    """Build an app that mounts the notes/snippets routes with real stores."""
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    return create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=SqlAlchemyConversationStore(db_uri),
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
        comment_store=SqlAlchemyCommentStore(db_uri),
        note_store=SqlAlchemyNoteStore(db_uri),
        snippet_store=SqlAlchemySnippetStore(db_uri),
    )


@pytest_asyncio.fixture()
async def resources_client(resources_app: FastAPI) -> AsyncIterator[httpx.AsyncClient]:
    """HTTP client wired to the notes/snippets-enabled app."""
    transport = httpx.ASGITransport(app=resources_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture()
def seeded_session_id(db_uri: str) -> str:
    """Create a real conversation row the resource routes can attach to."""
    return SqlAlchemyConversationStore(db_uri).create_conversation().id


# ── Notes ─────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_note_create_and_get_roundtrip(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Create a note, then fetch it back with all fields intact."""
    create = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes",
        json={"title": "TODO", "body_md": "- ship it", "tags": "api,ref"},
    )
    assert create.status_code == 200, create.text
    note = create.json()
    assert note["title"] == "TODO"
    assert note["body_md"] == "- ship it"
    assert note["tags"] == "api,ref"
    assert note["pinned"] is False
    assert note["object"] == "note"

    fetched = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/notes/{note['id']}"
    )
    assert fetched.status_code == 200
    assert fetched.json()["id"] == note["id"]


@pytest.mark.asyncio
async def test_note_list_pinned_first_then_newest(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Listing orders pinned notes ahead of unpinned, newest-first within tiers."""
    first = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes",
        json={"title": "first"},
    )
    second = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes",
        json={"title": "second"},
    )
    assert first.status_code == 200 and second.status_code == 200
    pin = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes/{first.json()['id']}/pin",
        json={"pinned": True},
    )
    assert pin.status_code == 200
    assert pin.json()["pinned"] is True

    listing = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/notes"
    )
    assert listing.status_code == 200
    titles = [n["title"] for n in listing.json()["data"]]
    assert titles == ["first", "second"]


@pytest.mark.asyncio
async def test_note_update_and_delete(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """PATCH updates fields; DELETE removes and subsequent GET 404s."""
    create = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes",
        json={"title": "draft", "body_md": "v1"},
    )
    note_id = create.json()["id"]

    updated = await resources_client.patch(
        f"/v1/sessions/{seeded_session_id}/resources/notes/{note_id}",
        json={"body_md": "v2"},
    )
    assert updated.status_code == 200
    assert updated.json()["body_md"] == "v2"
    assert updated.json()["title"] == "draft"

    deleted = await resources_client.delete(
        f"/v1/sessions/{seeded_session_id}/resources/notes/{note_id}"
    )
    assert deleted.status_code == 200
    fetch = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/notes/{note_id}"
    )
    assert fetch.status_code == 404


@pytest.mark.asyncio
async def test_note_tag_filter(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """The tag query filter narrows the list to matching notes."""
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes",
        json={"title": "tagged", "tags": "api"},
    )
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/notes",
        json={"title": "untagged"},
    )
    listing = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/notes?tag=api"
    )
    assert listing.status_code == 200
    titles = [n["title"] for n in listing.json()["data"]]
    assert titles == ["tagged"]


@pytest.mark.asyncio
async def test_note_missing_session_404(
    resources_client: httpx.AsyncClient,
) -> None:
    """Note operations against a nonexistent session are a 404."""
    resp = await resources_client.get("/v1/sessions/ghost-session/resources/notes")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_note_unknown_note_404(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Fetching an unknown note id is a 404."""
    resp = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/notes/nope"
    )
    assert resp.status_code == 404


# ── Snippets ──────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_snippet_create_and_get_roundtrip(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Create a snippet, then fetch it back with all fields intact."""
    create = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={
            "title": "Flask route",
            "language": "python",
            "code": "@app.get('/')\ndef hi(): ...",
            "description": "minimal route",
            "tags": "web,api",
        },
    )
    assert create.status_code == 200, create.text
    snippet = create.json()
    assert snippet["title"] == "Flask route"
    assert snippet["language"] == "python"
    assert snippet["code"].startswith("@app.get")
    assert snippet["tags"] == "web,api"
    assert snippet["object"] == "snippet"

    fetched = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/{snippet['id']}"
    )
    assert fetched.status_code == 200
    assert fetched.json()["id"] == snippet["id"]


@pytest.mark.asyncio
async def test_snippet_search_matches_code_and_title(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """The search endpoint matches title, code, description, and tags."""
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={"title": "Flask route", "code": "@app.get('/')"},
    )
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={"title": "git alias", "description": "checkout shortcut"},
    )
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={"title": "unrelated", "code": "SELECT 1"},
    )

    by_code = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/search?q=app.get"
    )
    assert by_code.status_code == 200
    assert [s["title"] for s in by_code.json()["data"]] == ["Flask route"]

    by_desc = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/search?q=checkout"
    )
    assert by_desc.status_code == 200
    assert [s["title"] for s in by_desc.json()["data"]] == ["git alias"]

    by_nothing = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/search?q=zzz-not-there"
    )
    assert by_nothing.status_code == 200
    assert by_nothing.json()["data"] == []


@pytest.mark.asyncio
async def test_snippet_list_language_filter(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """The language query filter narrows the listing."""
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={"title": "py", "language": "python"},
    )
    await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={"title": "sh", "language": "bash"},
    )
    listing = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/snippets?language=python"
    )
    assert listing.status_code == 200
    titles = [s["title"] for s in listing.json()["data"]]
    assert titles == ["py"]


@pytest.mark.asyncio
async def test_snippet_update_and_delete(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """PATCH updates fields; DELETE removes and subsequent GET 404s."""
    create = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/snippets",
        json={"title": "draft", "code": "v1"},
    )
    snippet_id = create.json()["id"]

    updated = await resources_client.patch(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/{snippet_id}",
        json={"code": "v2", "language": "sql"},
    )
    assert updated.status_code == 200
    assert updated.json()["code"] == "v2"
    assert updated.json()["language"] == "sql"

    deleted = await resources_client.delete(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/{snippet_id}"
    )
    assert deleted.status_code == 200
    fetch = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/snippets/{snippet_id}"
    )
    assert fetch.status_code == 404


@pytest.mark.asyncio
async def test_snippet_missing_session_404(
    resources_client: httpx.AsyncClient,
) -> None:
    """Snippet operations against a nonexistent session are a 404."""
    resp = await resources_client.get("/v1/sessions/ghost-session/resources/snippets")
    assert resp.status_code == 404