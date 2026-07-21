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
    harness_cli_installed,
    harness_cli_logged_in,
    harness_install_command,
    required_cli_for_harness,
)
from agent_meow.server.auth import AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id
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


def create_admin_catalog_router(
    *,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
) -> APIRouter:
    """Build the admin catalog router (all routes admin-gated, read-only).

    :param auth_provider: Auth provider, or ``None`` in single-user mode.
    :param permission_store: Permission store, or ``None`` to disable gating.
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

        :param request: Incoming request for auth.
        :returns: ``{"object": "list", "data": [HarnessAdminEntry]}``.
        """
        await _require_admin(request, auth_provider, permission_store)
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
        return {"object": "list", "data": entries}

    return router