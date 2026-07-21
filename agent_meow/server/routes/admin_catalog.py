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
import os
from functools import partial
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Request

from agent_meow.errors import ErrorCode, OmnigentError
from agent_meow.harness_install_spec import HarnessInstallSpec
from agent_meow.harness_plugins import harness_catalog
from agent_meow.onboarding.harness_install import (
    harness_cli_installed,
    harness_cli_logged_in,
    harness_install_command,
    required_cli_for_harness,
)
from agent_meow.runtime.agent_cache import AgentCache
from agent_meow.server.auth import AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id
from agent_meow.spec.parser import discover_host_skills
from agent_meow.stores import AgentStore
from agent_meow.stores.permission_store import PermissionStore
from agent_meow.stores.policy_store import PolicyStore


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


def _install_status(harness_id: str, spec: HarnessInstallSpec | None) -> str:
    """Map the CLI presence probe to a UI status.

    SDK / in-process harnesses (``spec is None``) report ``"installed"`` —
    they need no CLI binary. CLI-backed harnesses report ``"installed"`` /
    ``"missing`` based on :func:`harness_cli_installed` of their install key.

    :param harness_id: Executor harness identifier, e.g. ``"claude-native"``.
    :param spec: Install spec for the harness's required CLI, or ``None``
        when the harness needs no CLI (SDK in-process).
    :returns: ``"installed"`` or ``"missing"``.
    """
    if spec is None:
        return "installed"
    # ``harness_cli_installed`` is keyed by the family/install key, which
    # ``required_cli_for_harness`` already resolved to a spec; reuse the
    # same resolution by re-deriving the key from the harness id.
    key = _harness_install_key(harness_id)
    if key is None:
        return "missing"
    return "installed" if harness_cli_installed(key) else "missing"


def _login_status(spec: HarnessInstallSpec | None) -> str:
    """Map the CLI login probe to a tri-state for the UI.

    :param spec: Install spec for the harness's required CLI, or ``None``
        when the harness needs no CLI.
    :returns: ``"logged_in"``, ``"logged_out"``, or ``"n/a"`` (no CLI or
        the CLI has no status/login command).
    """
    if spec is None or (spec.login_args is None and spec.status_args is None):
        return "n/a"
    key = _harness_install_key_by_spec(spec)
    if key is None:
        return "n/a"
    return "logged_in" if harness_cli_logged_in(key) else "logged_out"


def _harness_install_key(harness_id: str) -> str | None:
    """Return the install family key for a harness id, or ``None``.

    Reuses :func:`required_cli_for_harness`'s resolution path indirectly —
    that helper already does the ``_HARNESS_NAME_TO_KEY`` lookup. We need
    the key itself here to call :func:`harness_cli_installed` /
    :func:`harness_cli_logged_in`, so we re-derive it via
    :func:`required_cli_for_harness`'s underlying merged map.

    :param harness_id: Executor harness identifier, e.g. ``"claude-native"``.
    :returns: Install family key, e.g. ``"anthropic"``, or ``None``.
    """
    spec = required_cli_for_harness(harness_id)
    if spec is None:
        return None
    return _harness_install_key_by_spec(spec)


def _harness_install_key_by_spec(spec: HarnessInstallSpec) -> str | None:
    """Return the install family key whose spec dict contains *spec*.

    The install-spec dict is keyed by family (``"anthropic"`` / ``"openai"`` /
    ``"pi"`` / ``"cursor"`` / …). Reverse-lookup by identity is fine — the
    values are unique per family.

    :param spec: Install spec to find the key for.
    :returns: Family key, or ``None`` if the spec is not in the merged table
        (a community plugin spec not reachable through the built-in map).
    """
    from agent_meow.onboarding.harness_install import _all_harness_install

    for key, candidate in _all_harness_install().items():
        if candidate is spec:
            return key
    return None


def _install_command(spec: HarnessInstallSpec | None) -> str | None:
    """Return a copy-pasteable install command for the UI, or ``None``.

    npm-backed harnesses get ``npm install -g <package>`` (via the existing
    :func:`harness_install_command`). Harnesses installed out-of-band
    (cursor-agent, agy, kiro-cli, goose, hermes — ``package is None``) get
    their ``install_hint``. SDK / in-process harnesses (``spec is None``)
    get ``None``.

    :param spec: Install spec, or ``None`` for SDK harnesses.
    :returns: Copy-pasteable install command string, or ``None``.
    """
    if spec is None:
        return None
    if spec.package is not None:
        key = _harness_install_key_by_spec(spec)
        if key is None:
            return f"npm install -g {spec.package}"
        try:
            return " ".join(harness_install_command(key))
        except KeyError:
            return f"npm install -g {spec.package}"
    return spec.install_hint


# Handler path for the bundled "block skills" policy. The skills admin page
# annotates each skill with whether any default policy with this handler lists
# it in its ``blocked`` factory param, so the UI can deep-link into Policies
# for blocking instead of duplicating the blocklist here.
_BLOCK_SKILLS_HANDLER = "agent_meow.policies.builtins.safety.block_skills"


def _build_harness_entries() -> list[dict[str, Any]]:
    """Build the harness admin catalog entries (sync — call via to_thread).

    Wraps :func:`harness_catalog` + the CLI install/login probes
    (:func:`required_cli_for_harness`, :func:`harness_cli_installed`,
    :func:`harness_cli_logged_in`) into one sync helper so the async route can
    offload the whole blocking batch (subprocess calls) to a worker thread.

    :returns: A list of ``HarnessAdminEntry`` dicts.
    """
    entries: list[dict[str, Any]] = []
    for row in harness_catalog():
        harness_id = row["id"]
        spec = required_cli_for_harness(harness_id)
        entries.append(
            {
                "id": harness_id,
                "label": row["label"],
                "binary": spec.binary if spec else None,
                "install_status": _install_status(harness_id, spec),
                "login_status": _login_status(spec),
                "install_command": _install_command(spec),
                "auth_hint": spec.auth_hint if spec else None,
                "capabilities": row.get("capabilities", {}),
            }
        )
    return entries


def create_admin_catalog_router(
    *,
    agent_store: AgentStore,
    agent_cache: AgentCache,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    policy_store: PolicyStore | None = None,
) -> APIRouter:
    """Build the admin catalog router (all routes admin-gated, read-only).

    :param agent_store: Store for agent metadata (used by skills + MCP routes).
    :param agent_cache: Cache for loading parsed agent specs (skills + MCP).
    :param auth_provider: Auth provider, or ``None`` in single-user mode.
    :param permission_store: Permission store, or ``None`` to disable gating.
    :param policy_store: Policy store, or ``None`` to skip the ``block_skills``
        annotation on the skills route (the route still works; every entry
        reports ``blocked=False``).
    :returns: Configured :class:`APIRouter`.
    """
    router = APIRouter()

    @router.get("/admin/harnesses")
    async def list_harnesses(request: Request) -> dict[str, Any]:
        """List every built-in harness with its install + login status.

        Wraps :func:`harness_catalog` (id + label + capabilities) with the
        CLI install/login probes via :func:`required_cli_for_harness`. SDK
        in-process harnesses report ``install_status="installed"`` and
        ``login_status="n/a"`` (no CLI).

        The catalog + CLI probes (``harness_cli_installed`` /
        ``harness_cli_logged_in``) run subprocess calls, so the whole list is
        built inside ``asyncio.to_thread`` to avoid blocking the event loop.

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [HarnessAdminEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
        entries = await asyncio.to_thread(_build_harness_entries)
        return {"object": "list", "data": entries}

    @router.get("/admin/skills")
    async def list_skills(request: Request) -> dict[str, Any]:
        """List every discoverable skill across bundles + host dirs.

        Bundled skills come from each built-in agent's parsed spec; host skills
        come from ``~/.claude/skills/`` / ``~/.agents/skills/`` via the generic
        host walk (:func:`discover_host_skills`). Each entry is annotated with
        whether a ``block_skills`` default policy lists it in its ``blocked``
        factory param, so the UI can deep-link into the Policies page for
        blocking instead of duplicating the blocklist here.

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [SkillAdminEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
        by_name: dict[str, dict[str, Any]] = {}
        # 1. Bundle skills from every built-in agent (session_id IS NULL).
        #    ``AgentStore.list(limit, after, before, order)`` — pass limit
        #    positionally because ``asyncio.to_thread`` forwards *args, not
        #    kwargs, to the callable.
        builtins_page = await asyncio.to_thread(agent_store.list, 500)
        for agent in builtins_page.data:
            try:
                # ``AgentCache.load``'s ``expand_env`` is keyword-only, and
                # ``asyncio.to_thread`` forwards *args only — wrap in
                # ``functools.partial`` to pass the keyword. Built-in agents
                # are operator-authored (``session_id IS None``), so env
                # expansion is safe here.
                loaded = await asyncio.to_thread(
                    partial(agent_cache.load, expand_env=True),
                    agent.id,
                    agent.bundle_location,
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
        # 2. Host skills from the user-global skills directories.
        home = Path(os.path.expanduser("~"))
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
                if policy.handler != _BLOCK_SKILLS_HANDLER:
                    continue
                blocked_names = (policy.factory_params or {}).get("blocked", [])
                if not isinstance(blocked_names, list):
                    continue
                for name in blocked_names:
                    if not isinstance(name, str):
                        continue
                    if name in by_name:
                        by_name[name]["blocked"] = True
                        by_name[name]["blocked_by_policy"] = policy.name
        return {"object": "list", "data": list(by_name.values())}

    @router.get("/admin/mcp-servers")
    async def list_mcp_servers(request: Request) -> dict[str, Any]:
        """List every MCP server declared across all template agents, grouped.

        Walks every built-in (template) agent's ``spec.mcp_servers`` via
        ``agent_store.list`` (which filters to ``session_id IS NULL``) and
        groups by ``(name, transport)``. Session-scoped agents are out of
        scope here — they're created on demand and already editable via the
        per-session ``/sessions/{id}/agent/mcp-servers`` route; the catalog
        deep-links into that flow for edits, so it doesn't need to enumerate
        them. Each entry carries the list of template agents that declare it
        (with ``session_scoped=False``) and a ``used_by_session_count`` that
        is always 0 for the template-only walk.

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [McpCatalogEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
        grouped: dict[tuple[str, str], dict[str, Any]] = {}
        builtins_page = await asyncio.to_thread(agent_store.list, 500)
        for agent in builtins_page.data:
            try:
                loaded = await asyncio.to_thread(
                    partial(agent_cache.load, expand_env=True),
                    agent.id,
                    agent.bundle_location,
                )
            except Exception:  # noqa: BLE001 — unreadable bundle must not break the list
                continue
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
                        "session_scoped": agent.session_id is not None,
                    }
                )
                if agent.session_id is not None:
                    entry["used_by_session_count"] += 1
        return {"object": "list", "data": list(grouped.values())}

    return router