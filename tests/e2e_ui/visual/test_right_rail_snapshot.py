"""Functional / plain-UI snapshots of the right "Workspace" rail panels.

One committed baseline per rail tab (files, docs, images, subagents, terminals,
todos) with the brand layer stripped (``plain_page`` hides mascot/hero/wallpaper
+ blanks raster assets). Each tab's data endpoints are ``page.route``-stubbed
with fixed fixtures so the panel renders a deterministic, fully-populated
state — the captured frame shows the functional panel chrome and content, not
the logo or hero art.

All six tabs share the chat-page bind stubs (SSE ``[DONE]``, items, slim
session, health, agents, hosts) so the session at ``/c/{id}`` hydrates and the
rail has content to show; each tab then adds its own panel-specific route
stubs on top.

Same gate, renderer, and update flow as the brand snapshots — see ``README.md``
→ "Functional / plain-UI snapshots".
"""

from __future__ import annotations

import re

import pytest
from playwright.sync_api import Page, expect

_SESSION_ID = "conv_rail_plain"
_AGENT_ID = "ag_claude_e2e"
_AGENT_NAME = "claude-native-ui"
_HOST_ID = "host_e2e"

# ── Shared chat-bind stubs (so the session hydrates and the rail has content) ─

_SESSIONS_LIST_RE = re.compile(r"/v1/sessions(\?.*)?$")
_FILESYSTEM_RE = re.compile(r"/v1/hosts/[^/]+/filesystem")
_SESSION_DETAIL_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}(\?.*)?$")
_ITEMS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/items")
_STREAM_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/stream")
_AGENT_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/agent")
_HEALTH_RE = re.compile(r"/health(\?.*)?$")

_AGENTS_BODY = {
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
_HOSTS_BODY = {
    "hosts": [{"host_id": _HOST_ID, "name": "e2e-host", "owner": "e2e", "status": "online"}]
}
_EMPTY_LIST_BODY = {"object": "list", "data": [], "has_more": False}

_USER_TEXT = "List the files in the workspace."
_ASSISTANT_TEXT = "Here are the files in your workspace:\n\n- `src/app.ts`\n- `README.md`\n"

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

# Session includes a todos array so the Todos tab has content to render.
_SESSION_BODY = {
    "id": _SESSION_ID,
    "agent_id": _AGENT_ID,
    "agent_name": _AGENT_NAME,
    "status": "idle",
    "created_at": 1704067200,
    "updated_at": 1704067200,
    "todos": [
        {
            "content": "Review workspace files",
            "status": "completed",
            "activeForm": "Reviewing workspace files",
        },
        {
            "content": "Write summary doc",
            "status": "in_progress",
            "activeForm": "Writing summary doc",
        },
        {
            "content": "Clean up temp images",
            "status": "pending",
            "activeForm": "Cleaning up temp images",
        },
    ],
    # Marks the session claude-native → todosSupported (Tasks tab gate).
    "labels": {"agent_meow.wrapper": "claude-code-native-ui"},
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
_DONE_SSE = (
    # A session.todos frame so the Tasks rail tab renders (the chatStore's
    # todos come from the stream, not the session detail).
    'event: session.todos\n'
    'data: {"conversation_id": "%s", "todos": ['
    '{"content": "Review workspace files", "status": "completed", "activeForm": "Reviewing workspace files"},'
    '{"content": "Write summary doc", "status": "in_progress", "activeForm": "Writing summary doc"}'
    ']}\n\n'
    "data: [DONE]\n\n" % _SESSION_ID
)

# ── Panel-specific stubs ────────────────────────────────────────────────────

# Regexes for the per-session resource sub-paths. All anchored after the id so
# they don't overlap the slim-session detail or items/stream routes.
_ENV_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/resources/environments/default$")
_CHANGES_RE = re.compile(
    rf"/v1/sessions/{_SESSION_ID}/resources/environments/default/changes"
)
_ALL_FILES_RE = re.compile(
    rf"/v1/sessions/{_SESSION_ID}/resources/environments/default/filesystem"
)
_SEARCH_RE = re.compile(
    rf"/v1/sessions/{_SESSION_ID}/resources/environments/default/search"
)
_DOCS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/resources/documents$")
_IMAGES_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/resources/images$")
_CHILD_SESSIONS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/child_sessions")
_TERMINALS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/resources/terminals")

_ENV_BODY = {"metadata": {"root": "/work/repo", "home": "/home/user"}}

_CHANGED_FILES_BODY = {
    "object": "list",
    "data": [
        {
            "path": "src/app.ts", "name": "app.ts",
            "status": "modified", "bytes": 1024, "modified_at": 1704067200,
        },
        {
            "path": "README.md", "name": "README.md",
            "status": "created", "bytes": 256, "modified_at": 1704067200,
        },
    ],
    "has_more": False,
}

_ALL_FILES_BODY = {
    "object": "list",
    "data": [
        {
            "id": "f1", "name": "src", "path": "src",
            "type": "directory", "bytes": None, "modified_at": 1704067200,
        },
        {
            "id": "f2", "name": "app.ts", "path": "src/app.ts",
            "type": "file", "bytes": 1024, "modified_at": 1704067200,
        },
        {
            "id": "f3", "name": "README.md", "path": "README.md",
            "type": "file", "bytes": 256, "modified_at": 1704067200,
        },
    ],
    "has_more": False,
}

_DOCS_BODY = {
    "data": [
        {
            "id": "doc_1",
            "object": "document",
            "conversation_id": _SESSION_ID,
            "title": "Project Notes",
            "format": "markdown",
            "content_md": "# Project Notes\n\nA short summary.",
            "content_json": None,
            "created_at": 1704067200,
            "updated_at": 1704067200,
            "version": 1,
            "created_by": "admin",
        }
    ]
}

_IMAGES_BODY = {
    "data": [
        {
            "id": "img_1",
            "object": "image",
            "conversation_id": _SESSION_ID,
            "filename": "screenshot.png",
            "mime": "image/png",
            "width": 800,
            "height": 600,
            "bytes_size": 20480,
            "has_edits": False,
            "created_at": 1704067200,
            "updated_at": 1704067200,
            "created_by": "admin",
        }
    ]
}

_CHILD_SESSIONS_BODY = {
    "object": "list",
    "data": [
        {
            "id": "child_1",
            "title": "Investigate bug",
            "tool": "codex",
            "session_name": "codex-native",
            "labels": {},
            "current_task_status": "completed",
            "busy": False,
            "last_message_preview": "Found the root cause.",
            "pending_elicitations_count": 0,
        },
        {
            "id": "child_2",
            "title": "Write tests",
            "tool": "claude",
            "session_name": "claude-code",
            "labels": {},
            "current_task_status": "in_progress",
            "busy": True,
            "last_message_preview": "Adding test cases…",
            "pending_elicitations_count": 0,
        },
    ],
}

_TERMINALS_BODY = {
    "data": [
        {
            "id": "term_1", "name": "main", "session": _SESSION_ID,
            "running": True, "transport": "pty",
        },
    ]
}


def _register_chat_stubs(page: Page, fulfill_json) -> None:
    """Register the shared chat-bind route stubs so the session hydrates."""

    def _done_sse(route):
        route.fulfill(status=200, content_type="text/event-stream", body=_DONE_SSE)

    page.route("**/v1/agents", lambda r: fulfill_json(r, _AGENTS_BODY))
    page.route("**/v1/hosts", lambda r: fulfill_json(r, _HOSTS_BODY))
    page.route(_FILESYSTEM_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))
    page.route(_SESSIONS_LIST_RE, lambda r: fulfill_json(r, _EMPTY_LIST_BODY))
    page.route(_ITEMS_RE, lambda r: fulfill_json(r, _ITEMS_BODY))
    page.route(_AGENT_RE, lambda r: fulfill_json(r, _AGENT_BODY))
    page.route(_SESSION_DETAIL_RE, lambda r: fulfill_json(r, _SESSION_BODY))
    page.route(_HEALTH_RE, lambda r: fulfill_json(r, _HEALTH_BODY))
    page.route(_STREAM_RE, _done_sse)
    # Workspace environment: every rail view reads it (showFilesPanel gates
    # the Files tab; its absence silently falls back to the Voice tab).
    # Wildcard — no end anchor — so it also matches the /changes, /filesystem
    # and /search sub-paths registered per-tab below.
    page.route("**/resources/environments/default", lambda r: fulfill_json(r, _ENV_BODY))


def _goto_session(page: Page, live_server: str) -> None:
    """Navigate to the session and wait for the chat surface to hydrate."""
    page.goto(f"{live_server}/c/{_SESSION_ID}")
    expect(page.locator('[data-testid="message-bubble"][data-role="user"]')).to_have_count(
        1, timeout=30_000
    )


# ── Tests ───────────────────────────────────────────────────────────────────


@pytest.mark.visual
def test_plain_rail_files(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Files rail tab with branding stripped — file tree + scope switch.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)
    # Files panel stubs.
    page.route(_ENV_RE, lambda r: fulfill_json(r, _ENV_BODY))
    page.route(_CHANGES_RE, lambda r: fulfill_json(r, _CHANGED_FILES_BODY))
    page.route(_ALL_FILES_RE, lambda r: fulfill_json(r, _ALL_FILES_BODY))
    page.route(_SEARCH_RE, lambda r: fulfill_json(r, _ALL_FILES_BODY))

    _goto_session(page, live_server)
    # Open the right rail and switch to the Files tab. Tab accessible names
    # carry the badge count ("Files2" when 2 files changed) — prefix match.
    files_tab = page.get_by_role("tab", name=re.compile(r"^Files", re.IGNORECASE))
    expect(files_tab).to_be_visible(timeout=15_000)
    files_tab.click()
    expect(page.get_by_text("Working folder")).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


@pytest.mark.visual
def test_plain_rail_docs(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Docs rail tab with branding stripped — document list.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)
    page.route(_DOCS_RE, lambda r: fulfill_json(r, _DOCS_BODY))

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Docs", re.IGNORECASE)).click()
    expect(page.get_by_text("Project Notes")).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


@pytest.mark.visual
def test_plain_rail_images(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Images rail tab with branding stripped — image gallery.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)
    page.route(_IMAGES_RE, lambda r: fulfill_json(r, _IMAGES_BODY))

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Images", re.IGNORECASE)).click()
    expect(page.get_by_text("screenshot.png")).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


@pytest.mark.visual
def test_plain_rail_subagents(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Subagents rail tab with branding stripped — child session list.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)
    page.route(_CHILD_SESSIONS_RE, lambda r: fulfill_json(r, _CHILD_SESSIONS_BODY))

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Agents", re.IGNORECASE)).click()
    expect(page.get_by_test_id("subagent-row").first).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


@pytest.mark.visual
def test_plain_rail_terminals(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Terminals rail tab with branding stripped — terminal list.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)
    page.route(_TERMINALS_RE, lambda r: fulfill_json(r, _TERMINALS_BODY))

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Shells", re.IGNORECASE)).click()
    # The rail's Shells tab is a lightweight shell index (no full
    # TerminalsPanel — that lives in the hidden push panel and its
    # "main" span is aria-hidden/invisible). Scope to the Workspace rail.
    expect(
        page.get_by_role("complementary", name="Workspace").get_by_text("main")
    ).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


@pytest.mark.visual
def test_plain_rail_todos(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Todos rail tab with branding stripped — task list.

    Todos are populated from the session snapshot's ``todos`` field (already in
    ``_SESSION_BODY``), so no extra route stub is needed beyond the chat binds.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Tasks", re.IGNORECASE)).click()
    expect(page.get_by_text("Review workspace files")).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


# ── Panel-specific stubs for Projects and Voice ──────────────────────────

_PROJECTS_RE = re.compile(rf"/v1/sessions/{_SESSION_ID}/resources/projects$")

_PROJECTS_BODY = {
    "object": "list",
    "data": [
        {
            "id": "proj_1",
            "object": "session_project",
            "conversation_id": _SESSION_ID,
            "name": "Q3 Launch",
            "description": "Launch the new feature set",
            "status": "active",
            "created_at": 1704067200,
            "updated_at": 1704067200,
            "created_by": "admin",
        }
    ],
}


@pytest.mark.visual
def test_plain_rail_projects(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Projects rail tab with branding stripped — project list.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)
    page.route(_PROJECTS_RE, lambda r: fulfill_json(r, _PROJECTS_BODY))

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Projects", re.IGNORECASE)).click()
    expect(page.get_by_text("Q3 Launch")).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)


@pytest.mark.visual
def test_plain_rail_voice(
    plain_page: Page,
    live_server: str,
    fulfill_json,
    settle_for_snapshot,
    assert_snapshot,
) -> None:
    """The Voice rail tab with branding stripped — Voicebox status + TTS history.

    The Voicebox health check is CORS-blocked in the test environment (no
    Access-Control-Allow-Origin header), so the panel shows the offline state.
    The TTS history is empty because no conversation items have audio_url.

    :param plain_page: ``snapshot_page`` with brand CSS + asset routes applied.
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param fulfill_json: 200-JSON route helper (suite ``conftest.py``).
    :param settle_for_snapshot: fonts + caret settle, run before capture.
    :param assert_snapshot: visual-snapshot fixture.
    """
    page = plain_page
    _register_chat_stubs(page, fulfill_json)

    _goto_session(page, live_server)
    from tests.e2e_ui.conftest import open_right_rail

    open_right_rail(page)
    page.get_by_role("tab", name=re.compile(r"^Voice", re.IGNORECASE)).click()
    # The shipped Voice panel's header + empty state (the pre-rebrand
    # "Voicebox TTS" copy no longer exists).
    expect(page.get_by_text("Hermes Voice Gateway")).to_be_visible(timeout=30_000)
    expect(
        page.get_by_text("No active voice session. Click the paw-mic button to start talking.")
    ).to_be_visible(timeout=30_000)

    settle_for_snapshot(page)
    assert_snapshot(page)