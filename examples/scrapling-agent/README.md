# scrapling-agent

A web-research assistant example demonstrating **per-agent anti-bot-aware scraping via MCP**.

This is the reference for the per-agent Scrapling integration: declare the `scrapling mcp` server inside one agent bundle's `config.yaml`, so every session created from that agent gets the full 9-tool Scrapling surface with **zero core agent-meow code changes**.

## What it gives you

- **Three fetch tiers.** `get` (HTTP + fingerprint impersonation, static pages), `fetch` (Playwright, JS-rendered/SPA), `stealthy_fetch` (stealth Chromium, Cloudflare Turnstile/Interstitial bypass).
- **Concurrent variants.** `bulk_get`, `bulk_fetch`, `bulk_stealthy_fetch` for parallel scraping across different domains.
- **Persistent sessions.** `open_session` / `close_session` / `list_sessions` to reuse one browser across many fetches (avoids relaunch overhead, keeps cookies/login state).
- **Screenshots.** `screenshot` captures a page render (requires an open session).
- **Auto ad-blocking.** All browser-based tools block ~3,500 known ad/tracker domains — faster page loads, less noise, fewer tokens.
- **Output formats.** `extraction_type`: `markdown` (default), `html`, or `text`. `css_selector` to narrow content. `main_content_only` to restrict to `<body>`.

## Setup

### 1. Install Scrapling + Playwright Chromium (one-time)

```bash
pip install scrapling
scrapling install
```

`scrapling install` downloads the bundled Chromium that `fetch` / `stealthy_fetch` / `open_session` drive. `get` / `bulk_get` don't need a browser — they use HTTP with TLS fingerprint impersonation.

### 2. Run the agent

```bash
meow run examples/scrapling-agent/config.yaml
```

The runner reads `config.yaml`, sees the `scrapling` entry under `tools:`, spawns `scrapling mcp` as a stdio MCP subprocess, and exposes its 9 tools to the model. No separate server process needed — unlike agentmemory, Scrapling's MCP server is the scraper itself, launched per-session.

## How the wiring works (no core code change)

Same pattern as `examples/memory-agent`:

- `agent_meow/tools/mcp.py` — MCP client manager (stdio transport).
- `agent_meow/spec/types.py::MCPServerConfig` — the typed config this `config.yaml` parses into.
- `AgentSpec.mcp_servers` — populated from `tools:` entries with `type: mcp`.

This example adds one `MCPServerConfig` entry. The runner's `RunnerMcpManager` spawns `scrapling mcp` at session start and exposes its tools to the model.

## Trying it

1. Install Scrapling (step 1 above).
2. Run the agent (step 2 above).
3. In the session:
   - "Scrape <https://example.com> and summarize it." → the agent calls `get`.
   - "What does this SPA render? <https://app.example.com/dashboard>" → `fetch`.
   - "This page is behind Cloudflare: <https://protected.example.com>" → `stealthy_fetch` with `solve_cloudflare=true`.
   - "Grab these 10 product pages: [list]" → `bulk_get` or `bulk_fetch`.
   - "Open a session on acme.com, then fetch 5 pages from it." → `open_session`, then `fetch` with the returned `session_id` for each page.

## Tool selection guide

| Scenario | Tool |
| --- | --- |
| Static page, no bot protection | `get` |
| Multiple static pages | `bulk_get` |
| JS-rendered / SPA page | `fetch` |
| Multiple JS-rendered pages | `bulk_fetch` |
| Cloudflare or strong anti-bot | `stealthy_fetch` (`solve_cloudflare=true` for Turnstile) |
| Multiple protected pages | `bulk_stealthy_fetch` |
| Multiple pages from the same site | `open_session` + `fetch`/`stealthy_fetch` with `session_id` |
| Need a screenshot | `open_session` + `screenshot` with `session_id` |

## Tuning

Scrapling's knobs live on the **tool call arguments**, not in `config.yaml`:

| Argument | Default | Purpose |
| --- | --- | --- |
| `extraction_type` | `markdown` | `markdown` / `html` / `text` output format. |
| `css_selector` | null | Narrow content to a CSS selector before extraction. |
| `main_content_only` | true | Restrict to `<body>` content. |
| `headless` | true | `false` to run the browser visibly (debugging). |
| `google_search` | true | Set a Google referer header. |
| `real_chrome` | false | Use your installed Chrome instead of bundled Chromium. |
| `cdp_url` | null | Connect to an existing browser via CDP URL. |
| `proxy` | null | Proxy URL or `{server, username, password}` dict. |
| `solve_cloudflare` | false | (stealthy only) Auto-solve Cloudflare Turnstile/Interstitial. |
| `hide_canvas` | false | (stealthy only) Canvas fingerprint noise. |
| `block_webrtc` | false | (stealthy only) Force WebRTC to respect proxy (prevent IP leak). |

## Custom browser executable

To use a custom Chromium-compatible browser instead of the bundled one, pass `--executable-path` to the MCP server:

```yaml
tools:
  scrapling:
    type: mcp
    command: scrapling
    args:
      - mcp
      - --executable-path
      - /path/to/chromium
```

## Notes

- **Be a good web citizen.** Respect `robots.txt`. Don't hammer a single domain — use `bulk_*` for parallelism across *different* domains, not the same one. Escalate `get` → `fetch` → `stealthy_fetch` only when the lighter tool fails.
- **Streamable HTTP alternative.** If you'd rather run Scrapling as a long-running HTTP server (shared across sessions, no per-session subprocess), start `scrapling mcp --http --host 127.0.0.1 --port 8000` and switch the `config.yaml` entry to `transport: http` with `url: http://127.0.0.1:8000`. The stdio form above is simpler for per-agent isolation.
- **Coexists with agent-reach.** Scrapling is your generic web-scrape layer (any URL, anti-bot bypass). For platform-aware research (Twitter, Reddit, XiaoHongShu, Bilibili, etc.), use agent-reach — it knows which upstream CLI to call per platform. The two don't overlap except on baseline URL fetch, where Scrapling is strictly more capable (stealth, Cloudflare).
- **Not server-wide.** Same per-agent caveat as memory-agent: only sessions from agents that declare `scrapling` get it.
