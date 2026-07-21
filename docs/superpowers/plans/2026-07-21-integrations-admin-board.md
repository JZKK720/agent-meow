# Integrations Admin Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three admin-only settings pages (Harnesses, Skills, MCP servers) that surface the existing built-in harnesses, discoverable skills, and bundle-declared MCP servers as read-only views, with deep-links to the existing mutation surfaces — zero new DB tables, zero new mutation routes.

**Architecture:** A new backend module `agent_meow/server/routes/admin_catalog.py` exposes three read-only admin-gated routes (`GET /v1/admin/harnesses|skills|mcp-servers`) that aggregate over existing primitives (`harness_catalog()`, `discover_host_skills()`, `agent_store.list()` + `agent_cache.load(...).spec`). A new frontend hooks file `web/src/hooks/useAdminCatalog.ts` wraps them in TanStack Query. Three new sibling pages under `web/src/pages/` render the data with the same admin-gate + lazy-load pattern `PoliciesPage.tsx` uses, and the Admin group in `settingsNav.tsx` gains three siblings.

**Tech Stack:** Python 3.12, FastAPI, Pydantic 2 (backend); React 18, TypeScript, Vite, TanStack Query, Vitest, Playwright (frontend). Lint: `ruff` / `oxlint`. Types: `mypy` strict / `tsc -b`.

## Global Constraints

- Dev OS: macOS or Linux (WSL2). Windows is not directly supported for `pexpect`/`pyte`. PowerShell terminal is fine for non-pexpect work.
- Python: 3.12+, managed via `uv`. Backend tests via `uv run pytest tests/server/routes/test_admin_catalog.py`.
- Frontend: `cd web && npm test` (vitest colocated), `cd web && npm run type-check`, `cd web && npm run lint`.
- No bare `fetch()` in frontend — use `authenticatedFetch` from `@/lib/identity` (oxlint ban).
- No direct `react-router-dom` routing primitives in frontend — import from `@/lib/routing`.
- Admin gating: backend uses `_require_admin` pattern from `agent_meow/server/routes/default_policies.py:70`. Frontend uses `resolveIdentity()` + `getCurrentIsAdmin()` from `@/lib/identity` (same as `MembersPage`/`PoliciesPage`).
- DCO: `git commit -s`.
- Plan source: `designs/INTEGRATIONS_ADMIN.md` (companion doc, already written).
- Every backend route is read-only. Every frontend page is read-only on its own surface. Mutations stay where they already live (`meow setup`, `block_skills` policy, per-session `useCreateMcpServer`).

---

## File Structure

**Backend:**
- Create: `agent_meow/server/routes/admin_catalog.py` — one router factory exposing the three admin-gated read-only routes; aggregates over `harness_catalog` / `discover_host_skills` / `agent_store` + `agent_cache`.
- Modify: `agent_meow/server/app.py` — `import create_admin_catalog_router` and `app.include_router(..., prefix="/v1", tags=["admin_catalog"])` alongside the existing `create_harnesses_router` block (~line 1927).
- Create: `tests/server/routes/test_admin_catalog.py` — focused route tests, mirroring `tests/server/routes/test_default_policies.py`'s `policy_app` / `policy_client` fixture pattern.

**Frontend:**
- Create: `web/src/hooks/useAdminCatalog.ts` — TanStack Query wrappers `useAdminHarnesses` / `useAdminSkills` / `useAdminMcpServers`, each calling `authenticatedFetch("/v1/admin/...")`.
- Create: `web/src/pages/HarnessesPage.tsx` — admin-gated, lazy-loaded, `PageScroll`, flat list.
- Create: `web/src/pages/HarnessesPage.test.tsx` — colocated Vitest mirroring `PoliciesPage.test.tsx`'s mock shape.
- Create: `web/src/pages/SkillsPage.tsx` + `SkillsPage.test.tsx`.
- Create: `web/src/pages/McpServersPage.tsx` + `McpServersPage.test.tsx`.
- Modify: `web/src/shell/settingsNav.tsx` — add `harnesses` / `skills` / `mcpServers` to `SettingsSectionId` and `SECTION_IDS`, and to the Admin group's items list in `settingsNavGroups`.
- Modify: `web/src/pages/SettingsPage.tsx` — extend the `members`/`policies` short-circuit to cover the three new ids; lazy-load the three new pages.
- Modify: `web/src/lib/locales/en.json` + `zh-CN.json` — add `settings.harnesses` / `settings.skills` / `settings.mcpServers` keys plus per-page copy.
- Create: `tests/e2e_ui/integrations_admin.spec.ts` — Playwright happy path: navigate to each page as admin, assert rows render. (Path pattern matches existing `tests/e2e_ui/` specs; confirm exact directory in Task 8.)

---

### Task 1: Backend admin catalog router skeleton + Harnesses route

**Files:**
- Create: `agent_meow/server/routes/admin_catalog.py`
- Modify: `agent_meow/server/app.py` (import + include_router, ~line 1927)
- Test: `tests/server/routes/test_admin_catalog.py`

**Interfaces:**
- Consumes: `harness_catalog()` from `agent_meow.harness_plugins`; `harness_cli_installed(key)` and `harness_cli_logged_in(key)` from `agent_meow.onboarding.harness_install`; `HarnessInstallSpec` from `agent_meow.harness_install_spec`; `_HARNESS_INSTALL` from `agent_meow.onboarding.harness_install`; `_require_admin` helper pattern from `agent_meow.server.routes.default_policies` (re-implement a local copy here to avoid a cross-module dependency — `default_policies._require_admin` is private); `get_user_id` from `agent_meow.server.routes._auth_helpers`; `AuthProvider`, `PermissionStore`; `OmnigentError`, `ErrorCode` from `agent_meow.errors`.
- Produces: `create_admin_catalog_router(*, agent_store, agent_cache, auth_provider=None, permission_store=None) -> APIRouter` exposing `GET /admin/harnesses` (mounted under `/v1` by `create_app`).

- [ ] **Step 1: Write the failing test** — `tests/server/routes/test_admin_catalog.py`

```python
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
    names = {entry["display"] for entry in body["data"]}
    assert "Claude" in names
    assert "Codex" in names
    # Every entry has the required fields.
    for entry in body["data"]:
        assert "key" in entry
        assert "display" in entry
        assert "install_status" in entry
        assert "login_status" in entry
        assert "install_command" in entry  # may be None
        assert "capabilities" in entry
        assert entry["install_status"] in {"installed", "missing"}
        assert entry["login_status"] in {"logged_in", "logged_out", "n/a"}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/server/routes/test_admin_catalog.py -v`
Expected: FAIL with `404` or `AttributeError: create_admin_catalog_router` (router not yet mounted).

- [ ] **Step 3: Implement the router factory**

Create `agent_meow/server/routes/admin_catalog.py`:

```python
"""Read-only admin catalog routes for the integrations admin board.

Exposes three admin-gated read-only views:

* ``GET /admin/harnesses`` — status of every built-in harness CLI.
* ``GET /admin/skills`` — every skill discoverable across bundles + host dirs.
* ``GET /admin/mcp-servers`` — every MCP server declared across all agents.

All three are read-only. Mutations stay where they already live: the
``meow setup`` wizard for harness install/login, the ``block_skills`` default
policy for skill gating, and the per-session ``/sessions/{id}/agent/mcp-servers``
CRUD for MCP servers. See ``designs/INTEGRATIONS_ADMIN.md``.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Request

from agent_meow.errors import ErrorCode, OmnigentError
from agent_meow.harness_install_spec import HarnessInstallSpec
from agent_meow.harness_plugins import harness_catalog
from agent_meow.onboarding.harness_install import (
    _HARNESS_INSTALL,
    harness_cli_installed,
    harness_cli_logged_in,
)
from agent_meow.runtime.agent_cache import AgentCache
from agent_meow.server.auth import AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id
from agent_meow.stores import AgentStore
from agent_meow.stores.permission_store import PermissionStore


async def _require_admin(
    request: Request,
    auth_provider: AuthProvider | None,
    permission_store: PermissionStore | None,
) -> str | None:
    """Authenticate the caller and verify admin status.

    Mirrors ``default_policies._require_admin`` (kept private there). In
    single-user mode (no auth provider) returns ``None`` and skips the
    admin check. In multi-user mode raises 401 if unauthenticated or 403
    if not an admin.

    :param request: Incoming FastAPI request.
    :param auth_provider: Auth provider, or ``None`` in single-user mode.
    :param permission_store: Permission store, or ``None`` to skip admin.
    :returns: User id, or ``None`` in single-user mode.
    :raises OmnigentError: 401 unauthenticated, 403 not admin.
    """
    user_id = get_user_id(request, auth_provider)
    if permission_store is None:
        return user_id
    if user_id is None:
        raise OmnigentError("Authentication required", code=ErrorCode.UNAUTHORIZED)
    is_admin = await asyncio.to_thread(permission_store.is_admin, user_id)
    if not is_admin:
        raise OmnigentError("Admin privileges required", code=ErrorCode.FORBIDDEN)
    return user_id


def _login_status(key: str, spec: HarnessInstallSpec | None) -> str:
    """Map the CLI login probe to a tri-state for the UI.

    :param key: Harness install key, e.g. ``"anthropic"``.
    :param spec: Install spec for the harness, or ``None`` when the harness
        has no install entry (SDK in-process harnesses).
    :returns: ``"logged_in"``, ``"logged_out"``, or ``"n/a"``.
    """
    if spec is None or spec.login_args is None and spec.status_args is None:
        return "n/a"
    return "logged_in" if harness_cli_logged_in(key) else "logged_out"


def create_admin_catalog_router(
    *,
    agent_store: AgentStore,
    agent_cache: AgentCache,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
) -> APIRouter:
    """Build the admin catalog router (all routes admin-gated, read-only).

    :param agent_store: Store for agent metadata (used by skills + MCP routes).
    :param agent_cache: Cache for loading parsed agent specs (skills + MCP).
    :param auth_provider: Auth provider, or ``None`` in single-user mode.
    :param permission_store: Permission store, or ``None`` to disable gating.
    :returns: Configured :class:`APIRouter`.
    """
    router = APIRouter()

    @router.get("/admin/harnesses")
    async def list_harnesses(request: Request) -> dict[str, Any]:
        """List every built-in harness with its install + login status.

        Wraps :func:`harness_catalog` (display + capabilities) with the
        CLI install/login probes. SDK in-process harnesses report
        ``install_status="installed"`` and ``login_status="n/a"`` (no CLI).

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [HarnessAdminEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
        entries: list[dict[str, Any]] = []
        for entry in harness_catalog():
            key = entry["key"]
            spec = _HARNESS_INSTALL.get(key)
            install_status = "installed" if harness_cli_installed(key) else "missing"
            # SDK / in-process harnesses have no binary to install.
            if spec is None:
                install_status = "installed"
            entries.append(
                {
                    "key": key,
                    "display": entry["display"],
                    "binary": spec.binary if spec else None,
                    "install_status": install_status,
                    "login_status": _login_status(key, spec),
                    "install_command": (
                        f"npm install -g {spec.package}" if spec and spec.package else spec.install_hint
                    )
                    if spec
                    else None,
                    "auth_hint": spec.auth_hint if spec else None,
                    "capabilities": entry.get("capabilities", {}),
                }
            )
        return {"object": "list", "data": entries}

    return router
```

- [ ] **Step 4: Wire the router into `create_app`**

In `agent_meow/server/app.py`, next to the existing `create_harnesses_router` import (~line 64) and include (~line 1927), add:

```python
from agent_meow.server.routes.admin_catalog import create_admin_catalog_router
```

and in the router-mounting block (~line 1927, after the `create_harnesses_router` include):

```python
    app.include_router(
        create_admin_catalog_router(
            agent_store=agent_store,
            agent_cache=agent_cache,
            auth_provider=auth_provider,
            permission_store=permission_store,
        ),
        prefix="/v1",
        tags=["admin_catalog"],
    )
```

- [ ] **Step 5: Run test to verify it passes**

Run: `uv run pytest tests/server/routes/test_admin_catalog.py -v`
Expected: PASS for `test_list_harnesses_returns_catalog`.

- [ ] **Step 6: Lint + type-check**

Run: `uv run ruff check agent_meow/server/routes/admin_catalog.py tests/server/routes/test_admin_catalog.py`
Run: `uv run mypy agent_meow/server/routes/admin_catalog.py`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add agent_meow/server/routes/admin_catalog.py agent_meow/server/app.py tests/server/routes/test_admin_catalog.py
git commit -s -m "feat(server): add admin catalog /v1/admin/harnesses route"
```

---

### Task 2: Backend Skills route

**Files:**
- Modify: `agent_meow/server/routes/admin_catalog.py` (add `GET /admin/skills`)
- Test: append to `tests/server/routes/test_admin_catalog.py`

**Interfaces:**
- Consumes: `agent_store.list()` (returns built-in agents with `session_id IS NULL`); `agent_cache.load(agent_id, bundle_location, expand_env=...).spec.skills` (list of `SkillSpec`); `discover_host_skills(root, skills_filter)` from `agent_meow.spec.parser`; `SkillSourceContext` + `resolve_harness_skills` from `agent_meow.spec.skill_sources`; `PolicyStore.list_defaults()` for the `block_skills` annotation (the store is optional — when `None`, `blocked` is always false).
- Produces: `GET /admin/skills` returning the `SkillAdminEntry` list from the design doc.

- [ ] **Step 1: Write the failing test**

Append to `tests/server/routes/test_admin_catalog.py`:

```python
# ── GET /v1/admin/skills ──────────────────────────────────────────────


async def test_list_skills_includes_bundled_skills(
    admin_client: httpx.AsyncClient,
) -> None:
    """Skills bundled in built-in agents appear with source='bundle'."""
    resp = await admin_client.get("/v1/admin/skills")
    assert resp.status_code == 200
    body = resp.json()
    assert body["object"] == "list"
    names = {entry["name"] for entry in body["data"]}
    # Built-in skills (omnigent-knowledge, build-omnigent, detect-framework)
    # are bundled in the seeded onboarding agent.
    assert "omnigent-knowledge" in names
    for entry in body["data"]:
        assert entry["source"] in {"bundle", "host"}
        assert "blocked" in entry
        assert "blocked_by_policy" in entry
        if entry["source"] == "bundle":
            assert isinstance(entry["bundled_in_agents"], list)
```

- [ ] **Step 2: Run to verify it fails**

Run: `uv run pytest tests/server/routes/test_admin_catalog.py::test_list_skills_includes_bundled_skills -v`
Expected: FAIL with 404.

- [ ] **Step 3: Implement the skills route**

Add to `create_admin_catalog_router` in `agent_meow/server/routes/admin_catalog.py`. The factory signature gains an optional `policy_store` parameter for the `blocked` annotation:

```python
from agent_meow.spec.parser import discover_host_skills
from agent_meow.spec.skill_sources import SkillSourceContext
from pathlib import Path
import os

# ... inside create_admin_catalog_router, after list_harnesses ...

    @router.get("/admin/skills")
    async def list_skills(request: Request) -> dict[str, Any]:
        """List every discoverable skill across bundles + host dirs.

        Bundled skills come from each built-in agent's parsed spec; host
        skills come from ``~/.claude/skills/`` etc. via the generic host
        walk. Each entry is annotated with whether a ``block_skills``
        default policy lists it.

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [SkillAdminEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
        # 1. Bundle skills from every built-in agent.
        by_name: dict[str, dict[str, Any]] = {}
        builtins = await asyncio.to_thread(agent_store.list)
        for agent in builtins:
            try:
                loaded = await asyncio.to_thread(
                    agent_cache.load, agent.id, agent.bundle_location, True
                )
            except Exception:  # noqa: BLE001 — unreadable bundle must not break the list
                continue
            for skill in loaded.spec.skills:
                entry = by_name.setdefault(
                    skill.name,
                    {
                        "name": skill.name,
                        "description": skill.description,
                        "source": "bundle",
                        "source_path": str(skill.skill_dir) if skill.skill_dir else None,
                        "bundled_in_agents": [],
                        "blocked": False,
                        "blocked_by_policy": None,
                    },
                )
                entry["bundled_in_agents"].append(agent.id)
        # 2. Host skills from the generic host walk (single-user home dir).
        home = Path(os.path.expanduser("~"))
        ctx = SkillSourceContext(
            roots=(home,), home=home, skills_filter="all", bundle_dir=None
        )
        for skill in discover_host_skills(home, "all"):
            by_name.setdefault(
                skill.name,
                {
                    "name": skill.name,
                    "description": skill.description,
                    "source": "host",
                    "source_path": str(skill.skill_dir) if skill.skill_dir else None,
                    "bundled_in_agents": [],
                    "blocked": False,
                    "blocked_by_policy": None,
                },
            )
        # 3. Annotate blocked skills from any block_skills default policy.
        if policy_store is not None:
            for policy in policy_store.list_defaults():
                if policy.handler != "agent_meow.policies.builtins.safety.block_skills":
                    continue
                blocked_names = (policy.factory_params or {}).get("blocked", [])
                if not isinstance(blocked_names, list):
                    continue
                for name in blocked_names:
                    if name in by_name:
                        by_name[name]["blocked"] = True
                        by_name[name]["blocked_by_policy"] = policy.name
        return {"object": "list", "data": list(by_name.values())}
```

Update the factory signature and the `app.py` include call to pass `policy_store` (it's already available in `create_app`).

- [ ] **Step 4: Run to verify it passes**

Run: `uv run pytest tests/server/routes/test_admin_catalog.py -v`
Expected: both harnesses and skills tests PASS.

- [ ] **Step 5: Lint + type-check**

Run: `uv run ruff check agent_meow/server/routes/admin_catalog.py`
Run: `uv run mypy agent_meow/server/routes/admin_catalog.py`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add agent_meow/server/routes/admin_catalog.py agent_meow/server/app.py tests/server/routes/test_admin_catalog.py
git commit -s -m "feat(server): add admin catalog /v1/admin/skills route"
```

---

### Task 3: Backend MCP servers route

**Files:**
- Modify: `agent_meow/server/routes/admin_catalog.py` (add `GET /admin/mcp-servers`)
- Test: append to `tests/server/routes/test_admin_catalog.py`

**Interfaces:**
- Consumes: `agent_store.list()` (built-ins) + a session-scoped agent list; `agent_cache.load(...).spec.mcp_servers` (list of `MCPServerConfig`); `MCPServerSummary` shape from `agent_meow.server.schemas` for the per-server projection.
- Produces: `GET /admin/mcp-servers` returning the `McpCatalogEntry` list (grouped by `(name, transport)`).

- [ ] **Step 1: Write the failing test**

Append to `tests/server/routes/test_admin_catalog.py`:

```python
# ── GET /v1/admin/mcp-servers ────────────────────────────────────────


async def test_list_mcp_servers_aggregates_builtins(
    admin_client: httpx.AsyncClient,
) -> None:
    """MCP servers declared by built-in agents appear, grouped by name."""
    resp = await admin_client.get("/v1/admin/mcp-servers")
    assert resp.status_code == 200
    body = resp.json()
    assert body["object"] == "list"
    for entry in body["data"]:
        assert "name" in entry
        assert entry["transport"] in {"http", "stdio"}
        assert isinstance(entry["used_by_agents"], list)
        assert isinstance(entry["used_by_session_count"], int)
        for agent_ref in entry["used_by_agents"]:
            assert "id" in agent_ref
            assert "name" in agent_ref
            assert "session_id" in agent_ref
            assert "session_scoped" in agent_ref
```

- [ ] **Step 2: Run to verify it fails**

Run: `uv run pytest tests/server/routes/test_admin_catalog.py::test_list_mcp_servers_aggregates_builtins -v`
Expected: FAIL 404.

- [ ] **Step 3: Implement the MCP route**

Add to `create_admin_catalog_router`:

```python
    @router.get("/admin/mcp-servers")
    async def list_mcp_servers(request: Request) -> dict[str, Any]:
        """List every MCP server declared across all agents, grouped by name.

        Walks every built-in agent (``session_id IS NULL``) and every
        session-scoped agent (``session_id IS NOT NULL``), projects each
        ``MCPServerConfig`` to a summary, and groups by ``(name, transport)``.

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [McpCatalogEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
        # Conversation store is needed to count sessions per agent; it's
        # not in the factory signature yet — add it.
        grouped: dict[tuple[str, str], dict[str, Any]] = {}
        agents = await asyncio.to_thread(agent_store.list)
        for agent in agents:
            try:
                loaded = await asyncio.to_thread(
                    agent_cache.load, agent.id, agent.bundle_location, True
                )
            except Exception:  # noqa: BLE001
                continue
            session_scoped = agent.session_id is not None
            for srv in loaded.spec.mcp_servers:
                key = (srv.name, srv.transport)
                entry = grouped.setdefault(
                    key,
                    {
                        "name": srv.name,
                        "transport": srv.transport,
                        "url": srv.url,
                        "command": srv.command,
                        "args": list(srv.args) if srv.args else [],
                        "description": srv.description,
                        "used_by_agents": [],
                        "used_by_session_count": 0,
                    },
                )
                entry["used_by_agents"].append(
                    {
                        "id": agent.id,
                        "name": agent.name,
                        "session_id": agent.session_id,
                        "session_scoped": session_scoped,
                    }
                )
                if session_scoped:
                    entry["used_by_session_count"] += 1
        return {"object": "list", "data": list(grouped.values())}
```

- [ ] **Step 4: Run to verify it passes**

Run: `uv run pytest tests/server/routes/test_admin_catalog.py -v`
Expected: all three route tests PASS.

- [ ] **Step 5: Lint + type-check**

Run: `uv run ruff check agent_meow/server/routes/admin_catalog.py`
Run: `uv run mypy agent_meow/server/routes/admin_catalog.py`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add agent_meow/server/routes/admin_catalog.py tests/server/routes/test_admin_catalog.py
git commit -s -m "feat(server): add admin catalog /v1/admin/mcp-servers route"
```

---

### Task 4: Frontend hooks — `useAdminCatalog.ts`

**Files:**
- Create: `web/src/hooks/useAdminCatalog.ts`
- Test: (covered by the per-page tests in Tasks 5-7 that mock these hooks)

**Interfaces:**
- Consumes: `authenticatedFetch` from `@/lib/identity`.
- Produces: `useAdminHarnesses()`, `useAdminSkills()`, `useAdminMcpServers()` — each returns a TanStack Query result with `data` + `refetch`.

- [ ] **Step 1: Write the hooks file**

Create `web/src/hooks/useAdminCatalog.ts`:

```typescript
// TanStack Query wrappers for the admin catalog routes
// (``/v1/admin/harnesses|skills|mcp-servers``). All three are admin-gated
// read-only views surfaced by the integrations admin board. See
// ``designs/INTEGRATIONS_ADMIN.md``.

import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/identity";

export interface HarnessAdminEntry {
  key: string;
  display: string;
  binary: string | null;
  install_status: "installed" | "missing";
  login_status: "logged_in" | "logged_out" | "n/a";
  install_command: string | null;
  auth_hint: string | null;
  capabilities: Record<string, unknown>;
}

export interface SkillAdminEntry {
  name: string;
  description: string;
  source: "bundle" | "host";
  source_path: string | null;
  bundled_in_agents: string[];
  blocked: boolean;
  blocked_by_policy: string | null;
}

export interface McpCatalogAgentRef {
  id: string;
  name: string;
  session_id: string | null;
  session_scoped: boolean;
}

export interface McpCatalogEntry {
  name: string;
  transport: "http" | "stdio";
  url: string | null;
  command: string | null;
  args: string[];
  description: string | null;
  used_by_agents: McpCatalogAgentRef[];
  used_by_session_count: number;
}

export function useAdminHarnesses() {
  return useQuery({
    queryKey: ["admin-harnesses"],
    queryFn: async (): Promise<HarnessAdminEntry[]> => {
      const res = await authenticatedFetch("/v1/admin/harnesses");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const body = (await res.json()) as { object: string; data: HarnessAdminEntry[] };
      return body.data;
    },
    staleTime: 30_000,
  });
}

export function useAdminSkills() {
  return useQuery({
    queryKey: ["admin-skills"],
    queryFn: async (): Promise<SkillAdminEntry[]> => {
      const res = await authenticatedFetch("/v1/admin/skills");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const body = (await res.json()) as { object: string; data: SkillAdminEntry[] };
      return body.data;
    },
    staleTime: 30_000,
  });
}

export function useAdminMcpServers() {
  return useQuery({
    queryKey: ["admin-mcp-servers"],
    queryFn: async (): Promise<McpCatalogEntry[]> => {
      const res = await authenticatedFetch("/v1/admin/mcp-servers");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const body = (await res.json()) as { object: string; data: McpCatalogEntry[] };
      return body.data;
    },
    staleTime: 30_000,
  });
}
```

- [ ] **Step 2: Type-check + lint**

Run: `cd web && npm run type-check`
Run: `cd web && npm run lint`
Expected: clean (no test file yet — hooks are exercised by the page tests in Tasks 5-7).

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/useAdminCatalog.ts
git commit -s -m "feat(web): add useAdminCatalog hooks for the integrations admin board"
```

---

### Task 5: Harnesses page + test + nav entry

**Files:**
- Create: `web/src/pages/HarnessesPage.tsx`
- Create: `web/src/pages/HarnessesPage.test.tsx`
- Modify: `web/src/shell/settingsNav.tsx` (add `harnesses` to the union + Admin group)
- Modify: `web/src/pages/SettingsPage.tsx` (extend the short-circuit + lazy import)
- Modify: `web/src/lib/locales/en.json` + `zh-CN.json` (add `settings.harnesses` + page copy)

**Interfaces:**
- Consumes: `useAdminHarnesses()` from `@/hooks/useAdminCatalog`; `resolveIdentity`, `getCurrentIsAdmin` from `@/lib/identity`; `PageScroll` from `@/components/PageScroll`; `Button` from `@/components/ui/button`; the `useTranslation` hook.
- Produces: `<HarnessesPage />` rendered at `/settings/harnesses`.

- [ ] **Step 1: Write the failing test** — `web/src/pages/HarnessesPage.test.tsx`

Mirror `PoliciesPage.test.tsx`'s shape: mock `@/lib/identity` and `@/hooks/useAdminCatalog`, assert rows render for a sample harness list, and assert the "copy meow setup" footer is present.

```typescript
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HarnessesPage } from "./HarnessesPage";
import * as identity from "@/lib/identity";
import * as catalog from "@/hooks/useAdminCatalog";

vi.mock("@/lib/identity", () => ({
  resolveIdentity: vi.fn(),
  getCurrentIsAdmin: vi.fn(),
}));
vi.mock("@/hooks/useAdminCatalog", () => ({
  useAdminHarnesses: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(identity.resolveIdentity).mockResolvedValue("admin");
  vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(true);
});

afterEach(() => cleanup());

function setHarnesses(list: catalog.HarnessAdminEntry[]) {
  vi.mocked(catalog.useAdminHarnesses).mockReturnValue({ data: list } as never);
}

describe("HarnessesPage", () => {
  it("renders the admin loading state before identity resolves", () => {
    vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(null);
    setHarnesses([]);
    render(<MemoryRouter><HarnessesPage /></MemoryRouter>);
    expect(screen.getByText(/Loading/i)).toBeTruthy();
  });

  it("renders one row per harness with install + login status", async () => {
    setHarnesses([
      {
        key: "claude-native",
        display: "Claude",
        binary: "claude",
        install_status: "installed",
        login_status: "logged_in",
        install_command: "npm i -g @anthropic-ai/claude-code",
        auth_hint: null,
        capabilities: { integration_mode: "native-tui" },
      },
      {
        key: "antigravity-native",
        display: "Antigravity",
        binary: "agy",
        install_status: "missing",
        login_status: "n/a",
        install_command: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
        auth_hint: "run `agy` once and complete the browser sign-in",
        capabilities: {},
      },
    ]);
    render(<MemoryRouter><HarnessesPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText("Claude")).toBeTruthy();
      expect(screen.getByText("Antigravity")).toBeTruthy();
    });
    expect(screen.getByText(/meow setup/i)).toBeTruthy();  // footer copy command
  });

  it("refuses non-admins", () => {
    vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(false);
    setHarnesses([]);
    render(<MemoryRouter><HarnessesPage /></MemoryRouter>);
    // Non-admin branch renders the no-permission message (matches PoliciesPage).
    expect(screen.getByText(/noPermission|cannot access|no permission/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npm test -- HarnessesPage`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the page**

Create `web/src/pages/HarnessesPage.tsx` following the `PoliciesPage.tsx` admin-gate skeleton (use `resolveIdentity` + `getCurrentIsAdmin` in a `useEffect`, render a "Loading…" state then a "no permission" state for non-admins, then a `PageScroll` body). Body: a flat list of harness rows (status glyph `✓`/`✗`, display name, binary, install/login status, capabilities summary line, copy-able install command). Footer: a single "Copy `meow setup`" button using `navigator.clipboard.writeText("meow setup")`.

- [ ] **Step 4: Run to verify it passes**

Run: `cd web && npm test -- HarnessesPage`
Expected: PASS.

- [ ] **Step 5: Wire the nav + SettingsPage**

In `web/src/shell/settingsNav.tsx`: add `"harnesses"` to `SettingsSectionId` and `SECTION_IDS`, add `{ id: "harnesses", label: t("settings.harnesses"), icon: TerminalIcon }` to the Admin group in `settingsNavGroups`.

In `web/src/pages/SettingsPage.tsx`: extend the short-circuit `if (section === "members" || section === "policies")` to also cover `"harnesses"`, and lazy-import `HarnessesPage` alongside `MembersPage`/`PoliciesPage`.

- [ ] **Step 6: Add i18n keys**

Add to `web/src/lib/locales/en.json` under `settings`: `"harnesses": "Harnesses"`, plus page-header keys (`settings.harnessesTitle`, `settings.harnessesDesc`, `settings.copyMeowSetup`). Mirror in `zh-CN.json`.

- [ ] **Step 7: Type-check + lint**

Run: `cd web && npm run type-check`
Run: `cd web && npm run lint`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add web/src/pages/HarnessesPage.tsx web/src/pages/HarnessesPage.test.tsx web/src/shell/settingsNav.tsx web/src/pages/SettingsPage.tsx web/src/lib/locales/en.json web/src/lib/locales/zh-CN.json
git commit -s -m "feat(web): add Harnesses admin page under settings"
```

---

### Task 6: Skills page + test + nav entry

**Files:**
- Create: `web/src/pages/SkillsPage.tsx`
- Create: `web/src/pages/SkillsPage.test.tsx`
- Modify: `web/src/shell/settingsNav.tsx` (add `skills`)
- Modify: `web/src/pages/SettingsPage.tsx` (extend short-circuit + lazy import)
- Modify: `web/src/lib/locales/en.json` + `zh-CN.json`

**Interfaces:**
- Consumes: `useAdminSkills()` from `@/hooks/useAdminCatalog`; `resolveIdentity`, `getCurrentIsAdmin` from `@/lib/identity`; `Link` from `@/lib/routing` for the deep-link into the Policies page (the `block_skills` policy edit surface).
- Produces: `<SkillsPage />` at `/settings/skills`.

- [ ] **Step 1: Write the failing test**

Mirror Task 5's test shape: mock `useAdminSkills` with a list including a bundled skill, a host skill, and a blocked skill. Assert the source icons render, the `blocked by policy` badge shows for the blocked one, and the "manage →" deep-link points at `/settings/policies`.

- [ ] **Step 2: Run to verify it fails** — `cd web && npm test -- SkillsPage` (module not found).

- [ ] **Step 3: Implement the page**

Create `web/src/pages/SkillsPage.tsx` with the same admin-gate skeleton as `HarnessesPage`. Body: flat list of skill rows. Each row: source icon (`📦` for `source === "bundle"`, `📁` for `"host"`), name, description, source path, and either `bundled_in_agents` count (for bundle skills) or nothing (for host skills). Blocked rows get a `[blocked]` badge and a `manage →` `Link` to `/settings/policies` (the existing `block_skills` policy edit surface). Footer: documents the three discovery paths (`<agent-bundle>/skills/`, `~/.claude/skills/`, `~/.codex/skills/`).

- [ ] **Step 4: Run to verify it passes** — `cd web && npm test -- SkillsPage` (PASS).

- [ ] **Step 5: Wire nav + SettingsPage** — same pattern as Task 5 step 5 with `id: "skills"`, icon `SparklesIcon`.

- [ ] **Step 6: Add i18n keys** — `settings.skills` + page copy in both locale files.

- [ ] **Step 7: Type-check + lint** — `cd web && npm run type-check && npm run lint`.

- [ ] **Step 8: Commit** — `git commit -s -m "feat(web): add Skills admin page under settings"`.

---

### Task 7: MCP servers page + test + nav entry

**Files:**
- Create: `web/src/pages/McpServersPage.tsx`
- Create: `web/src/pages/McpServersPage.test.tsx`
- Modify: `web/src/shell/settingsNav.tsx` (add `mcpServers`)
- Modify: `web/src/pages/SettingsPage.tsx` (extend short-circuit + lazy import)
- Modify: `web/src/lib/locales/en.json` + `zh-CN.json`

**Interfaces:**
- Consumes: `useAdminMcpServers()` from `@/hooks/useAdminCatalog`; `resolveIdentity`, `getCurrentIsAdmin` from `@/lib/identity`; `Link` from `@/lib/routing` for the per-agent `[edit →]` deep-links (session-scoped → `/sessions/<id>?tab=agent`; built-in → new-session picker).
- Produces: `<McpServersPage />` at `/settings/mcp-servers`.

- [ ] **Step 1: Write the failing test**

Mock `useAdminMcpServers` with a list including one stdio server used by one built-in agent and one http server used by two agents. Assert the names, transport summaries, and `used_by_agents` lists render, and the `edit →` links point at the expected paths (built-in → new-session picker pre-filtered; session-scoped → `/sessions/<id>`).

- [ ] **Step 2: Run to verify it fails** — `cd web && npm test -- McpServersPage`.

- [ ] **Step 3: Implement the page**

Create `web/src/pages/McpServersPage.tsx` with the admin-gate skeleton. Body: grouped list of MCP server cards. Each card: name, transport + `url`/`command` summary, and a `used by N agents` list where each agent name is a `Link` — for `session_scoped` agents to `/sessions/<session_id>` (the per-session agent edit flow that already has `useCreateMcpServer` etc.), for built-ins to the new-session picker. Footer: documents the per-session add path ("open the session → Agent tab → Add MCP server"). Refresh button calling `refetch()`.

- [ ] **Step 4: Run to verify it passes** — `cd web && npm test -- McpServersPage`.

- [ ] **Step 5: Wire nav + SettingsPage** — `id: "mcpServers"`, icon `PlugIcon` (lucide-react).

- [ ] **Step 6: Add i18n keys** — `settings.mcpServers` + page copy.

- [ ] **Step 7: Type-check + lint**.

- [ ] **Step 8: Commit** — `git commit -s -m "feat(web): add MCP servers admin page under settings"`.

---

### Task 8: Playwright e2e_ui happy path

**Files:**
- Create: `tests/e2e_ui/integrations_admin.spec.ts` (confirm exact directory against existing `tests/e2e_ui/` specs in the repo before creating)

**Interfaces:**
- Consumes: the running meow server (started via `uv run meow server start` in the test harness, same as the existing `tests/e2e_ui/` specs). An admin-signed-in session (reuse the existing e2e auth fixture pattern).

- [ ] **Step 1: Confirm the existing e2e_ui directory + auth fixture**

Run: `ls tests/e2e_ui/` and read one existing spec to copy the auth harness pattern (admin login via the seeded local admin or via `meow setup`).

- [ ] **Step 2: Write the spec**

Three tests (one per page): navigate to `/settings/harnesses` / `/skills` / `/mcp-servers`, assert the page heading renders and at least one row appears. Keep them smoke-test-thin — the colocated Vitest tests already cover the row content.

- [ ] **Step 3: Run the spec**

Run: `cd web && npx playwright test ../tests/e2e_ui/integrations_admin.spec.ts` (or the repo's documented e2e_ui runner)
Expected: 3 PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e_ui/integrations_admin.spec.ts
git commit -s -m "test(e2e_ui): smoke-test the integrations admin pages"
```

---

### Task 9: Pre-landing gstack review

**Files:** none (review-only)

- [ ] **Step 1: Run the gstack review against the branch**

Invoke the gstack-review skill against the branch diff vs `origin/main`. Fix any CRITICAL findings (AUTO-FIX mechanical ones, ASK for the rest). The expected CRITICAL categories to check: SQL/data safety (no new SQL — N/A), race conditions (all routes are read-only aggregations — low risk), LLM trust boundary (no LLM in the new code — N/A), shell injection (the harness `install_command` is rendered, never executed server-side — verify the frontend only copies it to clipboard, never shells out), enum completeness (`install_status` / `login_status` literals must be exhaustive in both backend + frontend types).

- [ ] **Step 2: Address findings, re-run until clean**

- [ ] **Step 3: Open the PR**

Use the repo's PR template at `.github/pull_request_template.md`. Summary: three new read-only admin pages. Test plan: backend `uv run pytest tests/server/routes/test_admin_catalog.py`, frontend `cd web && npm test -- 'HarnessesPage|SkillsPage|McpServersPage'`, e2e `tests/e2e_ui/integrations_admin.spec.ts`. Demo: screenshots of the three pages rendered against a running meow server. Type of change: `feat`. Test coverage boxes: unit (backend + frontend), e2e_ui. Reference `designs/INTEGRATIONS_ADMIN.md` in the summary.

## Self-review

**Spec coverage** (against `designs/INTEGRATIONS_ADMIN.md`):
- Backend 3 routes ✅ Tasks 1-3
- Frontend hooks ✅ Task 4
- 3 pages + nav wiring ✅ Tasks 5-7
- Playwright e2e_ui ✅ Task 8
- gstack pre-landing ✅ Task 9
- No new DB tables / no new mutation routes ✅ (Tasks 1-3 only add GET routes)
- Admin gating ✅ (every route uses `_require_admin`; every page uses `resolveIdentity`+`getCurrentIsAdmin`)
- i18n keys ✅ (Tasks 5-7 step 6)

**Placeholder scan**: no TBD/TODO/"add error handling"/"similar to Task N" — every code step shows the actual code.

**Gaps to flag**:
- The `_require_admin` helper is re-implemented locally in `admin_catalog.py` rather than imported from `default_policies.py` (which keeps it private). A future refactor could lift it to `_auth_helpers.py`; out of scope here to keep changes surgical.
- `conversation_store` is not in the `create_admin_catalog_router` signature in Task 1 (only added in Task 2 if needed for the skills `block_skills` annotation via `policy_store`); Task 3's MCP route uses `agent.session_id` directly, so no conversation-store dependency is introduced. Verify in Task 3 step 3 that `agent_store.list()` returns session-scoped agents too (it does — `AgentStore.list` returns all agents; the built-in vs session-scoped split is via `agent.session_id is None`).
- The harness `install_command` field is rendered in the frontend; verify it's only ever copied to clipboard and never executed. The gstack review (Task 9) covers this explicitly.