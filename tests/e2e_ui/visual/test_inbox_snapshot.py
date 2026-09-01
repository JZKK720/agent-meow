"""Functional / plain-UI snapshot of the Inbox page.

A committed baseline of ``/inbox`` with the brand layer stripped
(``plain_page`` hides mascot/hero/wallpaper + blanks raster assets). The inbox
page's data endpoints (session list, per-session snapshot for pending
elicitations, comments) are ``page.route``-stubbed with fixed fixtures so the
page renders a deterministic, populated state — one approval row and one
comment row — showing the functional inbox list, not the logo or hero art.

Same gate, renderer, and update flow as the brand snapshots — see ``README.md``
→ "Functional / plain-UI snapshots".
"""

from __future__ import annotations

import re

import pytest
from playwright.sync_api import Page, expect

# ── Boot stubs ───────────────────────────────────────────────────────────────

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

# ── Inbox data stubs ─────────────────────────────────────────────────────────

_SESSION_ID = "c1"
_AGENT_ID = "ag_1"

# Bare session list — the inbox drains all pages, so stub consistently.
_SESSIONS_LIST_RE = re.compile(r"/v1/sessions(\?.*)?$")
# Per-session detail (slim session) for the row with pending elicitations.
_SESSION_DETAIL_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}(\?.*)?$")
_COMMENTS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/comments")

_SESSIONS_BODY = {
    "object": "list",
    "data": [
        {
            "id": _SESSION_ID,
            "object": "conversation",
            "title": "Fix login bug",
            "created_at": 1704067200,
            "updated_at": 1704067200,
            "labels": {},
            "archived": False,
            "pending_elicitations_count": 1,
            "comments_count": 1,
            "status": "idle",
            "agent_id": _AGENT_ID,
            "agent_name": "claude-code",
            "host_id": "host_e2e",
            "workspace": "/work/repo",
            "permission_level": 1,
        }
    ],
    "has_more": False,
}

# The per-session snapshot carries the pending_elicitations array so the inbox
# renders an ApprovalCard.
_SESSION_DETAIL_BODY = {
    "id": _SESSION_ID,
    "agent_id": _AGENT_ID,
    "agent_name": "claude-code",
    "status": "idle",
    "created_at": 1704067200,
    "title": "Fix login bug",
    "labels": {},
    "items": [],
    # MCP shape: the parser (web/src/lib/sse.ts) requires a top-level
    # elicitation_id plus a `params` object carrying message/schema/mode —
    # a flat entry is dropped by parseEvent and the approval row vanishes.
    "pending_elicitations": [
        {
            "type": "response.elicitation_request",
            "elicitation_id": "el_1",
            "params": {
                "message": "Allow file edit to src/auth.ts?",
                "requestedSchema": {},
                "mode": "form",
                "phase": "approval",
            },
        }
    ],
}

_COMMENTS_BODY = [
    {
        "id": "cm_1",
        "conversation_id": _SESSION_ID,
        "path": "src/auth.ts",
        "start_index": 0,
        "end_index": 10,
        "body": "Should this use bcrypt?",
        "status": "draft",
        "created_at": 1704067200,
        "updated_at": 1704067200,
        "anchor_content": "function hashPassword(",
        "created_by": "alice",
    }
]


@pytest.mark.visual
def test_plain_inbox(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The inbox page with branding stripped — approval + comment rows.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page

    # Boot probes.
    page.route("**/v1/info", lambda r: fulfill_json(r, _INFO_BODY))
    page.route("**/v1/me", lambda r: fulfill_json(r, _ME_BODY))
    # Inbox data.
    page.route(_SESSIONS_LIST_RE, lambda r: fulfill_json(r, _SESSIONS_BODY))
    page.route(_SESSION_DETAIL_RE, lambda r: fulfill_json(r, _SESSION_DETAIL_BODY))
    page.route(_COMMENTS_RE, lambda r: fulfill_json(r, _COMMENTS_BODY))

    page.goto(f"{live_server}/inbox")

    # Wait for both row types to render — proves the inbox has assembled.
    expect(page.get_by_test_id("inbox-item").first).to_be_visible(timeout=30_000)
    expect(page.get_by_test_id("inbox-comment").first).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)