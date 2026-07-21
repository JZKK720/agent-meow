"""E2E smoke test: the three integrations admin pages render against a live server.

Drives the real in-app flow — open Settings, navigate to each of the three
admin sub-categories (Harnesses, Skills, MCP servers), and assert the page
heading renders and at least the section nav is marked active. Keeps the
checks smoke-test-thin: the colocated Vitest tests already cover the row
content; this test only proves the pages mount end-to-end against a booted
server and the admin gate passes in single-user mode (``/v1/me`` returns
``is_admin: true``).

No LLM turn is involved. Mirrors ``test_settings_back_navigation.py``'s
fixture shape (``page`` + ``live_server``).
"""

from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

# The three admin sub-categories added by the integrations admin board
# (designs/INTEGRATIONS_ADMIN.md). Each is a sibling of members/policies
# under the Admin group in settingsNav.tsx.
_ADMIN_SECTIONS = ["harnesses", "skills", "mcpServers"]


@pytest.mark.parametrize("section", _ADMIN_SECTIONS)
def test_admin_integrations_page_renders(
    page: Page,
    live_server: str,
    section: str,
) -> None:
    """An integrations admin page renders its heading + active nav link.

    :param page: Playwright page fixture (fresh context per test).
    :param live_server: Base URL of the spawned ``agent-meow server``.
    :param section: The admin section id (URL segment + settings-nav testid).
    """
    page.goto(f"{live_server}/settings/{section}")

    # The settings nav link for this section is marked active — proves the
    # shell booted, the settings router resolved the section, and the admin
    # gate passed (non-admins never see these nav items).
    expect(
        page.locator(f'[data-testid="settings-nav-{section}"][aria-current="page"]')
    ).to_be_visible(timeout=30_000)

    # The page heading renders. Each admin page's heading is the section's
    # i18n title (Harnesses / Skills / MCP servers), so assert the heading
    # role is present rather than a specific string — the exact copy lives
    # in the locale files and is already pinned by the colocated Vitest tests.
    expect(page.get_by_role("heading", level=1)).to_be_visible(timeout=30_000)