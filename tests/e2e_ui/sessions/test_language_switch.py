"""E2E: switching language updates the live session UI, not only settings."""

from __future__ import annotations

import httpx
from playwright.sync_api import Page, expect

from tests.e2e_ui.conftest import open_right_rail


def test_language_switch_updates_session_chrome(
    page: Page,
    live_server: str,
) -> None:
    """Settings → Language → 中文 updates sidebar, composer, and workspace tabs."""
    agents_resp = httpx.get(f"{live_server}/v1/agents", timeout=30.0)
    agents_resp.raise_for_status()
    agents = agents_resp.json()["data"]
    agent = next((a for a in agents if a["name"] == "claude-native-ui"), agents[0])

    create_resp = httpx.post(
        f"{live_server}/v1/sessions",
        json={"agent_id": agent["id"], "model": "claude-sonnet-4-20250514"},
        timeout=30.0,
    )
    create_resp.raise_for_status()
    session_id = create_resp.json()["id"]

    page.goto(f"{live_server}/settings/language")
    page.get_by_role("button", name="中文").click()

    expect(page.get_by_role("heading", name="语言")).to_be_visible(timeout=30_000)
    expect(page.get_by_role("link", name="返回 agent-meow")).to_be_visible()
    expect(page.get_by_role("link", name="外观")).to_be_visible()

    page.goto(f"{live_server}/c/{session_id}")
    expect(page.get_by_role("link", name="新会话")).to_be_visible(timeout=30_000)
    expect(page.get_by_role("searchbox", name="搜索会话")).to_be_visible()
    expect(page.get_by_placeholder("向代理提问…")).to_be_visible(timeout=30_000)

    open_right_rail(page)
    expect(page.get_by_role("tab", name="文件")).to_be_visible()
    expect(page.get_by_role("tab", name="文档")).to_be_visible()
    expect(page.get_by_role("tab", name="图片")).to_be_visible()

    page.get_by_role("tab", name="文档").click()
    expect(page.get_by_role("button", name="新建文档")).to_be_visible()

    page.get_by_role("tab", name="图片").click()
    expect(page.get_by_role("button", name="上传图片")).to_be_visible()