"""Functional / plain-UI snapshots of the Settings pages.

One committed baseline per settings section (appearance, shortcuts, language,
account, members, policies, archived) with the brand layer stripped
(``plain_page`` hides mascot/hero/wallpaper + blanks raster assets). Each
section's data endpoints are ``page.route``-stubbed with fixed fixtures so the
section renders a deterministic, populated state.

The ``cli`` section is Electron-only and never renders in a browser Playwright
run, so it is excluded from the parametrize list.

Same gate, renderer, and update flow as the brand snapshots — see ``README.md``
→ "Functional / plain-UI snapshots".
"""

from __future__ import annotations

import re

import pytest
from playwright.sync_api import Page, expect

# ── Boot stubs (required for any settings section to render) ─────────────────

_INFO_BODY = {
    "accounts_enabled": True,
    "login_url": "/login",
    "needs_setup": False,
    "databricks_features": False,
    "managed_sandboxes_enabled": False,
    "sandbox_provider": None,
    "server_version": "0.0.0-test",
    "smart_routing_enabled": False,
}

_ME_BODY = {"user_id": "admin", "is_admin": True, "login_url": None}

# ── Per-section stubs ────────────────────────────────────────────────────────

_USERS_BODY = [
    {
        "id": "admin",
        "is_admin": True,
        "created_at": 1700000000,
        "last_login_at": 1704067200,
        "has_password": True,
    },
    {
        "id": "alice",
        "is_admin": False,
        "created_at": 1700000000,
        "last_login_at": 1704067200,
        "has_password": True,
    },
]

_POLICIES_BODY = [
    {
        "id": "p1", "name": "deny_localhost", "type": "python",
        "handler": "deny_localhost", "enabled": True,
    },
    {
        "id": "p2", "name": "max_cost", "type": "python",
        "handler": "cost_limit", "enabled": False,
    },
]

_POLICY_REGISTRY_BODY = [
    {
        "handler": "deny_localhost",
        "name": "Deny Localhost",
        "kind": "simple",
        "description": "Block localhost network access",
    },
    {
        "handler": "cost_limit",
        "name": "Cost Limit",
        "kind": "factory",
        "description": "Cap spending per session",
    },
]

_ARCHIVED_SESSIONS_RE = re.compile(r"/v1/sessions(\?.*)?$")
_ARCHIVED_SESSIONS_BODY = {
    "object": "list",
    "data": [
        {
            "id": "c_old",
            "object": "conversation",
            "title": "Old research session",
            "created_at": 1700000000,
            "updated_at": 1700000000,
            "labels": {},
            "archived": True,
            "pending_elicitations_count": 0,
            "comments_count": 0,
            "status": "idle",
            "agent_id": "ag_1",
            "agent_name": "researcher",
        }
    ],
    "has_more": False,
}

# Sections that render in a browser (cli is Electron-only → excluded).
# Parametrize ids match the URL segment and the settings-nav testid suffix.
_BROWSER_SECTIONS = [
    "appearance", "shortcuts", "language",
    "account", "members", "policies", "archived",
]


def _register_boot_stubs(page: Page, fulfill_json) -> None:
    """Register the boot probes (/v1/info, /v1/me) every settings section needs."""
    page.route("**/v1/info", lambda r: fulfill_json(r, _INFO_BODY))
    page.route("**/v1/me", lambda r: fulfill_json(r, _ME_BODY))


def _register_section_stubs(page: Page, fulfill_json, section: str) -> None:
    """Register the section-specific route stubs."""
    if section == "members":
        page.route("**/auth/users", lambda r: fulfill_json(r, _USERS_BODY))
    elif section == "policies":
        page.route("**/v1/policies", lambda r: fulfill_json(r, _POLICIES_BODY))
        page.route("**/v1/policy-registry", lambda r: fulfill_json(r, _POLICY_REGISTRY_BODY))
    elif section == "archived":
        page.route(_ARCHIVED_SESSIONS_RE, lambda r: fulfill_json(r, _ARCHIVED_SESSIONS_BODY))


@pytest.mark.visual
@pytest.mark.parametrize("section", _BROWSER_SECTIONS)
def test_plain_settings(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
    section: str,
) -> None:
    """A settings section with branding stripped — section content + sidebar nav.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    :param section: The settings section id (URL segment).
    """
    page = plain_page
    _register_boot_stubs(page, fulfill_json)
    _register_section_stubs(page, fulfill_json, section)

    page.goto(f"{live_server}/settings/{section}")

    # Wait for the section's nav link to be marked active — proves the shell
    # has booted and the settings router has resolved the section.
    expect(
        page.locator(f'[data-testid="settings-nav-{section}"][aria-current="page"]')
    ).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)