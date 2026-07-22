"""Route coverage for the agent-meow docs/images resources."""

from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI

from omnigent.runtime.agent_cache import AgentCache
from omnigent.server.app import create_app
from omnigent.stores.agent_store.sqlalchemy_store import SqlAlchemyAgentStore
from omnigent.stores.artifact_store.local import LocalArtifactStore
from omnigent.stores.comment_store.sqlalchemy_store import SqlAlchemyCommentStore
from omnigent.stores.conversation_store.sqlalchemy_store import SqlAlchemyConversationStore
from omnigent.stores.document_store.sqlalchemy_store import SqlAlchemyDocumentStore
from omnigent.stores.file_store.sqlalchemy_store import SqlAlchemyFileStore
from omnigent.stores.image_store.sqlalchemy_store import SqlAlchemyImageStore


@pytest.fixture()
def resources_app(runtime_init: None, db_uri: str, tmp_path: Path) -> FastAPI:
    """Build an app that mounts the docs/images routes with real stores."""
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    return create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=SqlAlchemyConversationStore(db_uri),
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
        comment_store=SqlAlchemyCommentStore(db_uri),
        document_store=SqlAlchemyDocumentStore(db_uri),
        image_store=SqlAlchemyImageStore(db_uri),
    )


@pytest_asyncio.fixture()
async def resources_client(resources_app: FastAPI) -> AsyncIterator[httpx.AsyncClient]:
    """HTTP client wired to the docs/images-enabled app."""
    transport = httpx.ASGITransport(app=resources_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture()
def seeded_session_id(db_uri: str) -> str:
    """Create a real conversation row the resource routes can attach to."""
    return SqlAlchemyConversationStore(db_uri).create_conversation().id


@pytest.mark.asyncio
async def test_documents_create_and_list(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Document resources can be created and listed for a session."""
    create_resp = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/documents",
        json={"title": "Release Notes", "content_md": "# Hello"},
    )
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["title"] == "Release Notes"
    assert created["content_md"] == "# Hello"

    list_resp = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/documents"
    )
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["object"] == "list"
    assert body["data"][0]["id"] == created["id"]


@pytest.mark.asyncio
async def test_images_get_preserves_mime_type(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Binary image fetches return the stored image MIME instead of octet-stream."""
    upload_resp = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/images",
        files={"file": ("demo.png", b"png-bytes", "image/png")},
    )
    assert upload_resp.status_code == 200
    image_id = upload_resp.json()["id"]

    get_resp = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/images/{image_id}"
    )
    assert get_resp.status_code == 200
    assert get_resp.headers["content-type"].startswith("image/png")
    assert get_resp.content == b"png-bytes"


@pytest.mark.asyncio
async def test_images_reject_non_image_uploads(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """The images surface rejects non-image binaries instead of storing them."""
    resp = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/images",
        files={"file": ("tts.wav", b"RIFFdemo", "audio/wav")},
    )
    assert resp.status_code == 400
    assert "Unsupported image upload type" in resp.text