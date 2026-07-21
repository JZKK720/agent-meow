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


# ── GET /v1/admin/skills ──────────────────────────────────────────────


async def test_list_skills_returns_list_shape(admin_client: httpx.AsyncClient) -> None:
    """The skills catalog returns a well-formed list of skill entries.

    Bundle skills come from the seeded built-in agents (the onboarding agent
    bundles omnigent-knowledge / build-omnigent / detect-framework); host
    skills come from the user's ``~/.claude/skills/`` walk. We don't assert
    specific names here (host discovery depends on the dev machine), only
    the per-entry shape and that the response is a list.
    """
    resp = await admin_client.get("/v1/admin/skills")
    assert resp.status_code == 200
    body = resp.json()
    assert body["object"] == "list"
    assert isinstance(body["data"], list)
    for entry in body["data"]:
        assert "name" in entry and isinstance(entry["name"], str)
        assert "description" in entry
        assert entry["source"] in {"bundle", "host"}
        assert "source_path" in entry  # may be None
        assert isinstance(entry["bundled_in_agents"], list)
        assert "blocked" in entry and isinstance(entry["blocked"], bool)
        assert "blocked_by_policy" in entry  # policy name or None


async def test_list_skills_bundle_entries_well_formed(
    admin_client: httpx.AsyncClient,
) -> None:
    """Any bundle-sourced skill in the catalog carries a non-empty agent list.

    The default seeded agents (claude-native-ui, codex-native-ui, ...) are
    synthesized CLI wrappers with no bundled skills, so a fresh test app may
    surface zero bundle skills. When bundle skills ARE present (a deploy that
    registered a custom agent with a ``skills/`` dir), each must carry at
    least one agent id. This keeps the bundle-walk code path under test without
    depending on a specific seeded skill.
    """
    resp = await admin_client.get("/v1/admin/skills")
    assert resp.status_code == 200
    body = resp.json()
    for entry in body["data"]:
        if entry["source"] == "bundle":
            assert len(entry["bundled_in_agents"]) >= 1, (
                f"bundle skill {entry['name']!r} has no agents: {entry}"
            )
            assert all(isinstance(aid, str) for aid in entry["bundled_in_agents"])


async def test_list_skills_host_walk_runs_without_error(
    admin_client: httpx.AsyncClient,
) -> None:
    """The host-skills walk over ``~/.claude/skills/`` completes and returns 200.

    On a dev machine this surfaces many host skills; on a clean CI box it
    surfaces none. Either way the route must not 500 — it must return a list
    (possibly empty) so the UI can render the discovery view.
    """
    resp = await admin_client.get("/v1/admin/skills")
    assert resp.status_code == 200
    body = resp.json()
    assert body["object"] == "list"
    assert isinstance(body["data"], list)


# ── GET /v1/admin/mcp-servers ────────────────────────────────────────


async def test_list_mcp_servers_returns_list_shape(
    admin_client: httpx.AsyncClient,
) -> None:
    """The MCP catalog returns a well-formed list of server entries.

    Walks every built-in (template) agent's ``spec.mcp_servers`` and groups
    by ``(name, transport)``. The default seeded agents (claude-native-ui,
    codex-native-ui, ...) declare no MCP servers, so a fresh test app may
    surface zero entries — the route must still return a list, not 500.
    """
    resp = await admin_client.get("/v1/admin/mcp-servers")
    assert resp.status_code == 200
    body = resp.json()
    assert body["object"] == "list"
    assert isinstance(body["data"], list)
    for entry in body["data"]:
        assert "name" in entry and isinstance(entry["name"], str)
        assert entry["transport"] in {"http", "stdio"}
        assert "url" in entry  # one of url/command is set
        assert "command" in entry
        assert isinstance(entry["args"], list)
        assert "description" in entry  # may be None
        assert isinstance(entry["used_by_agents"], list)
        assert isinstance(entry["used_by_session_count"], int)
        for agent_ref in entry["used_by_agents"]:
            assert "id" in agent_ref and isinstance(agent_ref["id"], str)
            assert "name" in agent_ref and isinstance(agent_ref["name"], str)
            assert "session_id" in agent_ref  # None for built-ins
            assert "session_scoped" in agent_ref and isinstance(
                agent_ref["session_scoped"], bool
            )


async def test_list_mcp_servers_session_count_zero_for_builtins(
    admin_client: httpx.AsyncClient,
) -> None:
    """Built-in (template) agents never contribute to ``used_by_session_count``.

    ``session_scoped`` is ``False`` for every agent ref surfaced by
    ``agent_store.list`` (which filters to ``session_id IS NULL``), so the
    per-entry ``used_by_session_count`` is the count of session-scoped
    agents only — built-ins don't increment it.
    """
    resp = await admin_client.get("/v1/admin/mcp-servers")
    assert resp.status_code == 200
    body = resp.json()
    for entry in body["data"]:
        for agent_ref in entry["used_by_agents"]:
            assert agent_ref["session_scoped"] is False, agent_ref
            assert agent_ref["session_id"] is None, agent_ref
        # All refs are built-in, so session count must be 0.
        assert entry["used_by_session_count"] == 0, entry