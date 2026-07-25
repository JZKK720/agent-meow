"""Tests for the Docs/Images/Videos resource routers mounted in create_app.

Verifies the three workspace surface routers are mounted when their stores
are provided, and that the endpoints enforce session existence + return the
expected shapes. Uses in-memory SQLite + real SQLAlchemy stores.
"""

from __future__ import annotations

from pathlib import Path

import httpx
import pytest
from fastapi import FastAPI

from agent_meow.runtime.agent_cache import AgentCache
from agent_meow.server.app import create_app
from agent_meow.stores.agent_store.sqlalchemy_store import SqlAlchemyAgentStore
from agent_meow.stores.artifact_store.local import LocalArtifactStore
from agent_meow.stores.conversation_store.sqlalchemy_store import (
    SqlAlchemyConversationStore,
)
from agent_meow.stores.document_store.sqlalchemy_store import SqlAlchemyDocumentStore
from agent_meow.stores.file_store.sqlalchemy_store import SqlAlchemyFileStore
from agent_meow.stores.image_store.sqlalchemy_store import SqlAlchemyImageStore
from agent_meow.stores.video_store.sqlalchemy_store import SqlAlchemyVideoStore


@pytest.fixture
def db_uri(tmp_path: Path) -> str:
    """In-memory SQLite URI shared across stores for one test."""
    return f"sqlite:///{tmp_path / 'test.db'}"


def _build_app(db_uri: str, tmp_path: Path) -> FastAPI:
    """Build an app with all three surface stores wired."""
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    conversation_store = SqlAlchemyConversationStore(db_uri)
    return create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=conversation_store,
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
        document_store=SqlAlchemyDocumentStore(db_uri),
        image_store=SqlAlchemyImageStore(db_uri),
        video_store=SqlAlchemyVideoStore(db_uri),
    )


@pytest.mark.asyncio
async def test_documents_router_mounted_and_lists_empty(db_uri: str, tmp_path: Path):
    """GET /v1/sessions/{id}/resources/documents returns an empty list for a
    real session, proving the documents router is mounted and wired."""
    app = _build_app(db_uri, tmp_path)
    # Create a conversation directly in the store so the session exists.
    conv_store = SqlAlchemyConversationStore(db_uri)
    conv = conv_store.create_conversation(agent_id=None)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        resp = await c.get(f"/v1/sessions/{conv.id}/resources/documents")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["object"] == "list"
    assert body["data"] == []


@pytest.mark.asyncio
async def test_images_router_mounted_and_lists_empty(db_uri: str, tmp_path: Path):
    """GET /v1/sessions/{id}/resources/images returns an empty list."""
    app = _build_app(db_uri, tmp_path)
    conv_store = SqlAlchemyConversationStore(db_uri)
    conv = conv_store.create_conversation(agent_id=None)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        resp = await c.get(f"/v1/sessions/{conv.id}/resources/images")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["object"] == "list"
    assert body["data"] == []


@pytest.mark.asyncio
async def test_videos_router_mounted_and_lists_empty(db_uri: str, tmp_path: Path):
    """GET /v1/sessions/{id}/resources/videos returns an empty list."""
    app = _build_app(db_uri, tmp_path)
    conv_store = SqlAlchemyConversationStore(db_uri)
    conv = conv_store.create_conversation(agent_id=None)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        resp = await c.get(f"/v1/sessions/{conv.id}/resources/videos")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["object"] == "list"
    assert body["data"] == []


@pytest.mark.asyncio
async def test_documents_router_404_for_missing_session(db_uri: str, tmp_path: Path):
    """A non-existent session returns 404, proving the router's session
    existence check is enforced."""
    app = _build_app(db_uri, tmp_path)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        resp = await c.get("/v1/sessions/nonexistent/resources/documents")
    assert resp.status_code == 404, resp.text


@pytest.mark.asyncio
async def test_surface_routers_not_mounted_when_stores_none(db_uri: str, tmp_path: Path):
    """When document_store/image_store/video_store are None, the routes are
    not mounted — a request returns 404, not 500."""
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    app = create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=SqlAlchemyConversationStore(db_uri),
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
        # document_store / image_store / video_store intentionally omitted (None)
    )
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        resp = await c.get("/v1/sessions/any/resources/documents")
    assert resp.status_code == 404, resp.text
