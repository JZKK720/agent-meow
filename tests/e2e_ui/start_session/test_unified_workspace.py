"""Unified workspace e2e: start a session from the landing page with no page
navigation (plan 040 phase 1).

The CUJ: type a first message on the landing surface, hit Send, and the SPA
swaps the hero for the chat stream **in place** — the composer keeps its
value/focus flow, the stream region replaces the collapsed hero, and the
browser never performs a full navigation (no page reload, no ``framenavigated``
for the SPA route).

The stubs mirror ``test_start_session.py``: hosts/agents bodies + a create
POST returning a real pre-seeded session id, with the auto-sent first-turn
event swallowed so no LLM turn runs.
"""

from __future__ import annotations

import asyncio
import json
import re
from collections.abc import Coroutine
from typing import Any

from playwright.async_api import Route, async_playwright, expect

# Same stub shape as test_start_session.py.
_HOST_ID = "host_e2e"
_SESSIONS_RE = re.compile(r"/v1/sessions(\?.*)?$")


def _run_in_fresh_loop(coro: Coroutine[Any, Any, None]) -> None:
    """Run *coro* in a dedicated thread with its own event loop (see
    test_start_session._run_in_fresh_loop for the pytest-asyncio rationale)."""
    import threading

    captured: dict[str, Exception] = {}

    def _worker() -> None:
        try:
            asyncio.run(coro)
        except Exception as exc:  # noqa: BLE001 - re-raised below
            captured["exc"] = exc

    t = threading.Thread(target=_worker)
    t.start()
    t.join()
    if "exc" in captured:
        raise captured["exc"]


async def _wait_until(predicate, *, timeout_s: float = 15.0) -> None:
    import time

    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        if predicate():
            return
        await asyncio.sleep(0.1)
    raise AssertionError("predicate never became true")


def _hosts_body() -> str:
    return json.dumps(
        {
            "hosts": [
                {
                    "host_id": _HOST_ID,
                    "name": "e2e-host",
                    "owner": "e2e",
                    "status": "online",
                }
            ]
        }
    )


def _agents_body() -> str:
    return json.dumps(
        {
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
    )


async def _register_common_routes(
    page,
    *,
    created_session_id: str,
    create_bodies: list[dict[str, Any]],
) -> None:
    async def handle_hosts(route: Route) -> None:
        await route.fulfill(status=200, content_type="application/json", body=_hosts_body())

    async def handle_agents(route: Route) -> None:
        await route.fulfill(status=200, content_type="application/json", body=_agents_body())

    async def handle_events(route: Route) -> None:
        await route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"queued": True, "item_id": "ci_e2e"}),
        )

    async def handle_sessions(route: Route) -> None:
        if route.request.method == "POST":
            create_bodies.append(route.request.post_data_json)
            await route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"id": created_session_id}),
            )
        else:
            await route.continue_()

    await page.route("**/v1/hosts", handle_hosts)
    await page.route("**/v1/agents", handle_agents)
    await page.route("**/v1/sessions/*/events", handle_events)
    await page.route(_SESSIONS_RE, handle_sessions)

    # Multi-user mode so the recent-workspaces seed drives the workspace
    # field (single-user mode owns seeding via a dedicated-workspace RPC
    # that needs a real host).
    await page.route(
        "**/v1/info",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"single_user": False, "default_workspace": None}),
        ),
    )

    # Single-user mode seeds a dedicated workspace via create-dir; stub the
    # filesystem listing + creation endpoints so the SPA gets an absolute
    # home path without a real host.
    async def handle_filesystem(route: Route) -> None:
        await route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(
                {
                    "object": "list",
                    "data": [
                        {
                            "name": "e2e-home",
                            "path": "/home/e2e/projects",
                            "kind": "directory",
                            "bytes": None,
                            "modified_at": 0,
                        }
                    ],
                    "has_more": False,
                }
            ),
        )

    async def handle_mkdir(route: Route) -> None:
        await route.fulfill(status=409, content_type="application/json", body="{}")

    await page.route("**/v1/hosts/**/filesystem", handle_filesystem)
    await page.route("**/v1/hosts/**/directories", handle_mkdir)


def test_start_session_from_landing_without_page_reload(seeded_session: tuple[str, str]) -> None:
    """The unified page swaps hero→stream in place; the composer never unmounts
    and the browser does not navigate/reload between landing and session."""
    base_url, session_id = seeded_session
    _run_in_fresh_loop(_drive_unified_workspace(base_url, session_id))


async def _drive_unified_workspace(base_url: str, session_id: str) -> None:
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page()
        try:
            create_bodies: list[dict[str, Any]] = []
            await _register_common_routes(
                page, created_session_id=session_id, create_bodies=create_bodies
            )

            # Keep the agent-discovery scan empty (same reason as the
            # permission-mode test in test_start_session.py).
            async def handle_agent_scan(route: Route) -> None:
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({"data": []}),
                )

            await page.route(re.compile(r"/v1/sessions\?.*kind=any"), handle_agent_scan)

            await page.add_init_script(
                'window.localStorage.setItem("agent-meow:recent-workspaces",'
                f' JSON.stringify({{{_HOST_ID!r}: ["/work/repo"]}}));'
            )

            # Track SPA-level navigations (pushState/replaceState) vs full
            # reloads. The CUJ allows URL updates but not a document load.
            loads: list[str] = []
            page.on("load", lambda _: loads.append("load"))

            await page.goto(f"{base_url}/")
            await page.get_by_test_id("new-chat-landing-input").wait_for(
                state="visible", timeout=30_000
            )
            # Select the stubbed Claude agent. Multi-user mode renders the
            # selector tray (host / directory / agent chips) unconditionally.
            await page.get_by_test_id("new-chat-landing-agent-select").click()
            await page.get_by_test_id("new-chat-landing-agent-ag_claude_e2e").click()

            await expect(
                page.get_by_test_id("unified-work-page")
            ).to_be_visible()
            # Landing region: hero visible, stream region absent.
            await expect(page.get_by_test_id("workspace-hero")).to_be_visible()

            await page.get_by_test_id("new-chat-landing-input").fill("set up the project")
            await expect(page.get_by_test_id("new-chat-landing-submit")).to_be_enabled(
                timeout=20_000
            )
            await page.get_by_test_id("new-chat-landing-submit").click()

            # The create POST is captured and answered with the real session id.
            await _wait_until(lambda: len(create_bodies) == 1)

            # The same shell persists: unified-work-page stays mounted, the
            # composer input never unmounts (it is the in-session composer's
            # textarea now — same slot), and the hero collapses away.
            await expect(page.get_by_test_id("unified-work-page")).to_be_visible(
                timeout=30_000
            )
            await expect(page.get_by_test_id("workspace-hero")).to_have_count(
                0, timeout=30_000
            )

            # No full page load happened after the initial goto.
            assert loads == ["load"], loads

            # The URL was rewritten to the conversation route (history.replaceState
            # is fine — it is not a document load).
            assert f"/c/{session_id}" in page.url, page.url
        finally:
            await browser.close()