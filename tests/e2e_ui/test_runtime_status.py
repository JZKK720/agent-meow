"""E2E: Dashboard renders, polls, shows correct states."""

from __future__ import annotations

import pytest
from playwright.async_api import Page

pytestmark = pytest.mark.asyncio


async def test_runtime_status_page_renders(page: Page, server_url: str) -> None:
    """The /settings/runtime page shows all service status cards."""
    await page.goto(f"{server_url}/settings/runtime")

    # Wait for status cards to render (the page polls /v1/stack/status)
    await page.wait_for_selector("text=agent-meow Server", timeout=15000)
    await page.wait_for_selector("text=Qwen3-TTS", timeout=5000)

    # Verify status cards are present
    cards = await page.query_selector_all(".rounded-lg.border")
    assert len(cards) >= 4  # server, hermes, ollama, tts


async def test_runtime_status_shows_watchdog_info(page: Page, server_url: str) -> None:
    """The dashboard shows watchdog status at the bottom."""
    await page.goto(f"{server_url}/settings/runtime")
    await page.wait_for_selector("text=Watchdog", timeout=15000)
    await page.wait_for_selector("text=Active", timeout=5000)
