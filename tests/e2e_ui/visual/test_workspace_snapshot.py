"""Functional / plain-UI snapshots of the main workspace surface.

A committed baseline of the workspace *without* the brand layer — the mascot,
"What should we do?" hero, and cat-element wallpaper are stripped via the
``plain_page`` fixture (CSS + route stubbing), so the captured frame shows only
the functional UI: the sidebar (conversation list, "New chat" button, inbox
affordance), the composer with its agent/host/workspace/model/effort/permission
pickers, and — for the chat variant — the message-stream bubbles.

Two baselines:

* ``test_plain_landing`` — the empty ``/`` view (sidebar + landing composer).
  Same route stubs as ``test_landing_snapshot.py`` (agents/hosts/sessions/
  filesystem) so the picker chips and "No active sessions" state are
  deterministic; only the brand layer is removed.
* ``test_plain_chat`` — a mocked one-turn transcript at ``/c/{id}``. Same
  stubs as ``test_chat_snapshot.py`` (SSE ``[DONE]``, items, slim session,
  health, agents, hosts) so the bubble layout is deterministic; the mascot and
  any in-chat ``MeowCatIcon`` are hidden.

Same gate, renderer, and update flow as the brand snapshots — see
``README.md`` → "Functional / plain-UI snapshots".
"""

from __future__ import annotations

import re

import pytest
from playwright.sync_api import Page, expect

# ── Landing stubs (mirror test_landing_snapshot.py) ──────────────────────────

_HOST_ID = "host_e2e"
_SESSIONS_RE = re.compile(r"/v1/sessions(\?.*)?$")
_FILESYSTEM_RE = re.compile(r"/v1/hosts/[^/]+/filesystem")

_AGENTS_BODY = {
    "data": [
        {
            "id": "ag_claude_e2e",
            "name": "claude-native-ui",
            "display_name": "Claude Code",
            "description": "Anthropic's coding agent",
            "harness": None,
            "skills": [],
        }
    ]
}
_HOSTS_BODY = {
    "hosts": [{"host_id": _HOST_ID, "name": "e2e-host", "owner": "e2e", "status": "online"}]
}
_EMPTY_LIST_BODY = {"object": "list", "data": [], "has_more": False}


@pytest.mark.visual
def test_plain_landing(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The empty ``/`` view with branding stripped — sidebar + composer only.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture (writes baseline under
        ``--update-snapshots``, otherwise compares).
    """
    page = plain_page

    page.route("**/v1/agents", lambda r: fulfill_json(r, _AGENTS_BODY))
    page.route("**/v1/hosts", lambda r: fulfill_json(r, _HOSTS_BODY))
    page.route(_FILESYSTEM_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))
    page.route(_SESSIONS_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))

    page.add_init_script(
        f'window.localStorage.setItem("agent-meow:recent-workspaces",'
        f' JSON.stringify({{"{_HOST_ID}": ["/work/repo"]}}));'
    )

    page.goto(f"{live_server}/")

    landing = page.get_by_test_id("new-chat-landing")
    expect(landing).to_be_visible(timeout=30_000)
    expect(page.get_by_text("No active sessions")).to_be_visible(timeout=30_000)
    # Single-user mode gates the selector tray behind "Advanced settings"
    # (tests/conftest.py sets AGENT_MEOW_LOCAL_SINGLE_USER=1); open it so the
    # tray renders for the baseline.
    page.get_by_test_id("new-chat-landing-advanced-toggle").click()
    expect(page.get_by_test_id("new-chat-landing-agent-select")).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    page.get_by_test_id("new-chat-landing-input").focus()

    assert_snapshot(page)


# ── Chat stubs (mirror test_chat_snapshot.py) ───────────────────────────────

_SESSION_ID = "conv_e2e_plain"
_AGENT_ID = "ag_claude_e2e"
_AGENT_NAME = "claude-native-ui"

_SESSIONS_LIST_RE = re.compile(r"/v1/sessions(\?.*)?$")
_CHAT_FILESYSTEM_RE = re.compile(r"/v1/hosts/[^/]+/filesystem")
_SESSION_DETAIL_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}(\?.*)?$")
_ITEMS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/items")
_STREAM_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/stream")
_AGENT_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/agent")
_SUBRESOURCE_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/(child_sessions|resources)")
_HEALTH_RE = re.compile(r"/health(\?.*)?$")

_CHAT_AGENTS_BODY = {
    "data": [
        {
            "id": _AGENT_ID,
            "name": _AGENT_NAME,
            "display_name": "Claude Code",
            "description": "Anthropic's coding agent",
            "harness": None,
            "skills": [],
        }
    ]
}
_CHAT_HOSTS_BODY = {
    "hosts": [{"host_id": _HOST_ID, "name": "e2e-host", "owner": "e2e", "status": "online"}]
}

_USER_TEXT = "How do I read a file in Python?"
_ASSISTANT_TEXT = (
    "Use a `with` block so the file closes itself:\n\n"
    "```python\n"
    "with open('notes.txt') as f:\n"
    "    print(f.read())\n"
    "```\n\n"
    "A couple of notes:\n\n"
    "- `with` frees the handle even on an error.\n"
    "- Use `f.read()` for all of it, or loop to stream.\n"
)

_ITEMS_BODY = {
    "object": "list",
    "data": [
        {
            "id": "msg_assistant",
            "response_id": "resp_1",
            "type": "message",
            "role": "assistant",
            "status": "completed",
            "content": [{"type": "output_text", "text": _ASSISTANT_TEXT}],
        },
        {
            "id": "msg_user",
            "response_id": "resp_1",
            "type": "message",
            "role": "user",
            "status": "completed",
            "content": [{"type": "input_text", "text": _USER_TEXT}],
        },
    ],
    "first_id": "msg_assistant",
    "last_id": "msg_user",
    "has_more": False,
}
_SESSION_BODY = {
    "id": _SESSION_ID,
    "agent_id": _AGENT_ID,
    "agent_name": _AGENT_NAME,
    "status": "idle",
    "created_at": 1704067200,
    "updated_at": 1704067200,
}
_AGENT_BODY = {
    "id": _AGENT_ID,
    "object": "agent",
    "name": _AGENT_NAME,
    "description": "Anthropic's coding agent",
    "harness": None,
    "mcp_servers": [],
    "policies": [],
    "terminals": [],
}
_HEALTH_BODY = {"sessions": {_SESSION_ID: {"runner_online": True, "host_online": True}}}
_DONE_SSE = "data: [DONE]\n\n"
_BUBBLE = '[data-testid="message-bubble"]'


@pytest.mark.visual
def test_plain_chat(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """A mocked chat transcript with branding stripped — bubbles + composer only.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture (writes baseline under
        ``--update-snapshots``, otherwise compares).
    """
    page = plain_page

    page.route("**/v1/agents", lambda r: fulfill_json(r, _CHAT_AGENTS_BODY))
    page.route("**/v1/hosts", lambda r: fulfill_json(r, _CHAT_HOSTS_BODY))
    page.route(_CHAT_FILESYSTEM_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))
    page.route(_SESSIONS_LIST_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))
    page.route(_ITEMS_RE, lambda r: fulfill_json(r, _ITEMS_BODY))
    page.route(_AGENT_RE, lambda r: fulfill_json(r, _AGENT_BODY))
    page.route(_SUBRESOURCE_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))
    page.route(_SESSION_DETAIL_RE, lambda r: fulfill_json(r, _SESSION_BODY))
    page.route(_HEALTH_RE, lambda r: fulfill_json(r, _HEALTH_BODY))
    page.route(
        _STREAM_RE,
        lambda r: r.fulfill(status=200, content_type="text/event-stream", body=_DONE_SSE),
    )

    page.goto(f"{live_server}/c/{_SESSION_ID}")

    expect(page.locator(f'{_BUBBLE}[data-role="user"]')).to_have_count(1, timeout=30_000)
    expect(page.locator(f'{_BUBBLE}[data-role="assistant"]')).to_be_visible(timeout=30_000)
    expect(page.locator('[data-testid="working-indicator"]')).to_have_count(0)

    settle_for_snapshot(page)

    assert_snapshot(page)