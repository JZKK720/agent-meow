"""Tests for the admin catalog routes (``/v1/admin/harnesses|skills|mcp-servers``).

Read-only views for admins. The router is mounted on every app (it does not
need a policy_store — the routes authenticate in multi-user mode and gate on
``permission_store.is_admin`` when a store is present, matching the
default_policies pattern).
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
from agent_meow.stores.conversation_store.sqlalchemy_store import (
    SqlAlchemyConversationStore,
)
from agent_meow.stores.file_store.sqlalchemy_store import SqlAlchemyFileStore


@pytest.fixture()
def admin_app(runtime_init: None, db_uri: str, tmp_path: Path) -> FastAPI:
    """Build a FastAPI app with the minimal stores the admin catalog needs."""
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    return create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=SqlAlchemyConversationStore(db_uri),
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
    )


@pytest_asyncio.fixture()
async def admin_client(admin_app: FastAPI) -> AsyncIterator[httpx.AsyncClient]:
    transport = httpx.ASGITransport(app=admin_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ── GET /v1/admin/harnesses ───────────────────────────────────────────


async def test_list_harnesses_returns_catalog(admin_client: httpx.AsyncClient) -> None:
    """Every built-in harness appears in the admin catalog."""
    resp = await admin_client.get("/v1/admin/harnesses")
    assert resp.status_code == 200
    body = resp.json()
    assert body["object"] == "list"
    # The catalog is keyed by harness id; the two flagship native harnesses
    # plus at least one SDK harness must appear.
    ids = {entry["id"] for entry in body["data"]}
    # harness_catalog() surfaces the canonical (non-alias) harness ids.
    # The SDK harnesses plus the headless CLI harnesses must appear.
    assert "claude-sdk" in ids
    assert "codex" in ids
    assert "pi" in ids
    assert "openai-agents" in ids
    # Every entry has the required fields.
    for entry in body["data"]:
        assert "id" in entry
        assert "label" in entry
        assert "install_status" in entry
        assert "login_status" in entry
        assert "install_command" in entry  # may be None for SDK harnesses
        assert "auth_hint" in entry  # may be None
        assert "capabilities" in entry
        assert entry["install_status"] in {"installed", "missing"}
        assert entry["login_status"] in {"logged_in", "logged_out", "n/a"}