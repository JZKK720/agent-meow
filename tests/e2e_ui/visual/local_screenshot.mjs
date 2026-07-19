"""Local visual inspection — capture plain-UI screenshots without the CI pipeline.

This script boots the Vite dev server (no backend needed — the SPA renders its
own loading/empty states), navigates to each functional surface, injects CSS to
strip branding (mascot, hero, wallpaper, wordmark), and saves a PNG screenshot
per surface to ``tests/e2e_ui/visual/local_screenshots/``.

Unlike the CI ``ui-snapshot.yml`` gate (which renders in a pinned Docker image
for byte-stable regression baselines), these PNGs are for **human visual
inspection only** — they are NOT committable regression baselines (the renderer
differs across machines). They exist so you can eyeball the functional UI
without the logo/hero art.

Requirements:
    - Node.js + ``npm install`` already run in ``web/``
    - Playwright Chromium installed (``npx playwright install chromium``)

Usage (from the repo root, on any OS):
    npx playwright install chromium
    node tests/e2e_ui/visual/local_screenshot.mjs

Output:
    tests/e2e_ui/visual/local_screenshots/<surface>.png
"""

// @ts-check
import { chromium } from "playwright";
import { createServer } from "vite";
import { fileURLToPath, URL } from "node:url";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..");
const webDir = resolve(repoRoot, "web");
const outDir = resolve(__dirname, "local_screenshots");

// CSS that hides every brand/hero/logo element so the functional surfaces are
// the only thing left in frame. Mirrors tests/e2e_ui/visual/conftest.py
// _HIDE_BRAND_CSS.
const HIDE_BRAND_CSS = `
img[src*="mascot-hero"], img[src*="mascot"], [class*="meowcat"], svg.meowcat {
  display: none !important;
}
[data-testid="new-chat-landing"] > div > div:first-child {
  display: none !important;
}
.new-chat-landing-pattern {
  background-image: none !important;
}
[data-testid="sidebar"] a[href="/"],
[data-testid="app-sidebar"] a[href="/"] {
  visibility: hidden !important;
}
* { caret-color: transparent !important; }
`;

// Each surface: route path + a selector to wait for before capturing.
const SURFACES = [
  { name: "01-workspace-landing", path: "/", waitFor: '[data-testid="new-chat-landing"]' },
  { name: "02-settings-appearance", path: "/settings/appearance", waitFor: "h1" },
  { name: "03-settings-shortcuts", path: "/settings/shortcuts", waitFor: "h1" },
  { name: "04-settings-language", path: "/settings/language", waitFor: "h1" },
  { name: "05-settings-archived", path: "/settings/archived", waitFor: "h1" },
  { name: "06-inbox", path: "/inbox", waitFor: "h1" },
];

async function main() {
  mkdirSync(outDir, { recursive: true });

  console.log("Starting Vite dev server...");
  const server = await createServer({
    root: webDir,
    server: { port: 0, strictPort: false },
    logLevel: "error",
  });
  await server.listen();
  const port = server.httpServer.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Vite dev server ready on ${baseUrl}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  });

  try {
    for (const surface of SURFACES) {
      const page = await context.newPage();
      const url = `${baseUrl}${surface.path}`;
      console.log(`  Capturing ${surface.name} → ${url}`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => {});
      // Inject the brand-hiding CSS before waiting for content.
      await page.addStyleTag({ content: HIDE_BRAND_CSS });
      // Wait for the surface's key selector (or fall back to a short timeout).
      await page.waitForSelector(surface.waitFor, { timeout: 15_000 }).catch(() => {});
      // Extra settle time for fonts + async chrome.
      await page.waitForTimeout(1500);
      const outPath = resolve(outDir, `${surface.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`    → saved ${outPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }

  console.log(`\nDone. Screenshots saved to ${outDir}`);
  console.log("Note: these are for human visual inspection only — NOT CI baselines.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});