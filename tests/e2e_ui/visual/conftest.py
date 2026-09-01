"""Shared fixtures for the visual-snapshot suite (one committed baseline per page).

Every page snapshot is a pure function of the committed SPA bundle plus a fixed
set of ``page.route`` stubs, captured at a fixed viewport in a pinned renderer
(see ``README.md``). These fixtures hold the parts every page shares -- the
deterministic viewport/palette, a JSON-route helper, and the pre-capture settle
-- so each ``test_*_snapshot.py`` only has to declare its page-specific stubs.

The ``plain_page`` / ``hide_brand_style`` / ``blank_brand_routes`` fixtures
power the *functional* snapshot track: they strip branding (mascot, hero
heading, cat wallpaper, favicon/PNG assets) via CSS + route stubbing so the
committed baselines show only the functional UI (panels, pickers, lists), not
the product's logo/IP/hero art. See ``README.md`` → "Functional / plain-UI
snapshots".
"""

from __future__ import annotations

import json

import pytest
from playwright.sync_api import Page, Route

# Same fixed viewport for every page so baselines are comparable and stable.
_VIEWPORT = {"width": 1280, "height": 800}

# CSS that hides every brand/hero/logo element so the functional surfaces are
# the only thing left in frame. Injected via ``add_init_script`` (before first
# paint) so the mascot/hero/wallpaper never flash before the capture. Targets:
#   * ``MeowCatMascot`` (``<img src="/mascot-hero.png">``) and the geometric
#     ``MeowCatIcon`` SVG (``[class*="meowcat"]`` / ``svg.meowcat``).
#   * The landing hero row (``MeowCatMascot`` + the ``<h1>What should we do?</h1>
#     `` wrapper) inside ``[data-testid="new-chat-landing"]`` — the composer
#     below it stays visible.
#   * The cat-element wallpaper pattern on ``.new-chat-landing-pattern``.
#   * The sidebar "agent-meow" wordmark link (the text ``<Link to="/">`` in the
#     sidebar header) — scoped to the sidebar header so it can't accidentally
#     hide an in-content link.
_HIDE_BRAND_CSS = """
/* Hide the raster mascot + geometric SVG cat wherever they render. */
img[src*="mascot-hero"], img[src*="mascot"], [class*="meowcat"], svg.meowcat {
  display: none !important;
}
/* Hide the landing hero row (mascot + "What should we do?" h1) but keep the
   composer form below it. The hero is the first flex child of the inner
   column inside [data-testid="new-chat-landing"]. */
[data-testid="new-chat-landing"] > div > div:first-child {
  display: none !important;
}
/* Strip the cat-element wallpaper pattern so the landing is a plain surface. */
.new-chat-landing-pattern {
  background-image: none !important;
}
/* Hide the sidebar wordmark ("agent-meow" text link in the sidebar header)
   so the frame shows only functional chrome. */
[data-testid="sidebar"] a[href="/"],
[data-testid="app-sidebar"] a[href="/"] {
  visibility: hidden !important;
}
"""

# Raster brand assets served from ``web/public`` — intercepted with a 1×1
# transparent PNG so no mascot/pattern/favicon pixels ever reach the page.
# Inline-SVG mascots are handled by the CSS above (routes can't blank an inline
# ``<svg>`` without also nuking every other svg icon, so CSS is the lever).
_BRAND_ASSET_GLOBS = (
    "**/mascot-hero.png",
    "**/mascot*.png",
    "**/patterns/*",
    "**/favicon*",
    "**/pwa-*",
    "**/apple-touch-icon*",
    "**/agent-meow-hero.png",
)

# A 1×1 transparent PNG (67 bytes) — the smallest valid PNG. Returned for every
# brand-asset route so the ``<img>`` / CSS ``background-image`` paints nothing.
_TRANSPARENT_PNG = bytes(
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture
def snapshot_page(page: Page) -> Page:
    """A page pinned to a fixed viewport and light palette, ready for stubbing.

    Both are set before navigation so the SPA reads them on boot. The light
    scheme pins the whole palette regardless of the runner's
    ``prefers-color-scheme`` default.

    :param page: pytest-playwright page (fresh context per test).
    :returns: The same page, configured for a deterministic capture.
    """
    page.set_viewport_size(_VIEWPORT)
    page.emulate_media(color_scheme="light")
    return page


@pytest.fixture
def fulfill_json():
    """Return a helper that answers a route with a 200 JSON body.

    :returns: ``fulfill(route, payload)`` -- serializes *payload* and fulfills.
    """

    def _fulfill(route: Route, payload: object) -> None:
        route.fulfill(status=200, content_type="application/json", body=json.dumps(payload))

    return _fulfill


@pytest.fixture
def settle_for_snapshot():
    """Return a helper that settles time-dependent rendering before capture.

    Waits for web fonts (so glyph metrics don't shift mid-capture) and kills the
    blinking caret. The fonts expression must *return* the Promise so Playwright's
    sync API awaits it -- an arrow function calling ``.then()`` returns undefined
    and never waits.

    :returns: ``settle(page)`` -- call once the page's content has painted.
    """

    def _settle(page: Page) -> None:
        page.evaluate("document.fonts.ready")
        page.add_style_tag(content="* { caret-color: transparent !important; }")

    return _settle


# ── Functional / plain-UI track ──────────────────────────────────────────────


@pytest.fixture
def hide_brand_style() -> str:
    """Return the CSS string that hides every brand/hero/logo element.

    Inject this via ``page.add_init_script`` (not ``add_style_tag``) so it
    applies *before* first paint — the mascot, hero heading, and cat wallpaper
    never flash into the captured frame.

    :returns: A CSS string targeting mascot SVGs, the hero row, the landing
        wallpaper, and the sidebar wordmark.
    """
    return _HIDE_BRAND_CSS


@pytest.fixture
def blank_brand_routes():
    """Return a helper that registers ``page.route`` handlers for brand assets.

    Every raster brand asset (mascot PNG, pattern tiles, favicons, PWA icons)
    is fulfilled with a 1×1 transparent PNG so no brand pixels reach the page.
    Inline-SVG mascots are handled by :func:`hide_brand_style` (routes can't
    blank an inline ``<svg>`` without nuking every other svg icon).

    :returns: ``register(page)`` -- call once after creating the page, before
        navigation.
    """

    def _register(page: Page) -> None:
        def _blank(route: Route) -> None:
            route.fulfill(
                status=200,
                content_type="image/png",
                body=_TRANSPARENT_PNG,
            )

        for glob in _BRAND_ASSET_GLOBS:
            page.route(glob, _blank)

    return _register


@pytest.fixture
def plain_page(page: Page, hide_brand_style: str, blank_brand_routes) -> Page:
    """A ``snapshot_page`` with all branding stripped, ready for functional capture.

    Composes :func:`snapshot_page` (fixed viewport + light palette) with the
    brand-hiding CSS (injected as an init script so it applies before first
    paint) and the raster-asset route stubs. Use this in place of
    ``snapshot_page`` for any *functional* snapshot that should show only the
    UI's panels/pickers/lists, not the logo, hero, or wallpaper.

    :param page: pytest-playwright page (fresh context per test).
    :param hide_brand_style: CSS string hiding mascot/hero/wallpaper/wordmark.
    :param blank_brand_routes: helper registering ``page.route`` blank PNGs.
    :returns: The same page, configured for a brand-free deterministic capture.
    """
    page.set_viewport_size(_VIEWPORT)
    page.emulate_media(color_scheme="light")
    # add_init_script runs on every navigation *before* the page's own scripts,
    # so the hide CSS is in place before the SPA's first paint. (The Python
    # Playwright kwarg is `script=`, not `content=` — the latter is the
    # ElementHandle/add_style_tag signature and raises TypeError.)
    page.add_init_script(
        script=f"(() => {{ const s = document.createElement('style'); "
        f"s.textContent = {json.dumps(hide_brand_style)}; "
        f"(document.head || document.documentElement).appendChild(s); }})();"
    )
    blank_brand_routes(page)
    return page
