# Design: BrowserPanel — first-class browser control surface in the right rail

Status: **Draft — design sketch for approval before implementation.**
Date: 2026-07-20

## 1. Summary

Add a **Browser** tab to the right workspace rail (alongside Files, Docs,
Images, Videos, Agents, Shells, Tasks) that gives the user a live, clickable
browser view inside the agent-meow UI. The agent can navigate, click, fill
forms, and take screenshots via MCP tools; the user sees the live page render
in the rail panel and can interact with it directly (click links, scroll,
navigate). This is the first-class browser surface the user requested —
"browser research etc." as a clickable tool, not just an agent-internal CLI.

## 2. Why a surface (not just an MCP server)

The shipped `browser-agent` example uses the `browser-harness` CLI via shell
heredocs — the agent can drive the browser, but the **user** can't see or
interact with it in the UI. A first-class `BrowserPanel` surface makes the
browser a **shared, visible workspace resource** (like Files, Docs, Images):
the agent navigates, the user sees the page render in real time, and both can
interact. This is the same upgrade path that turned the Docs/Images/Videos
backends from "agent-only tools" into "clickable workspace surfaces."

## 3. Architecture (mirrors the Images/Videos surface pattern)

```text
agent-meow Browser surface
├── Backend
│   ├── agent_meow/entities/browser.py            — BrowserSession dataclass
│   ├── agent_meow/db/db_models.py                — SqlBrowserSession table (optional; sessions may be ephemeral)
│   ├── agent_meow/stores/browser_store/          — BrowserStore (optional)
│   ├── agent_meow/server/routes/browser.py       — REST + WebSocket routes
│   └── agent_meow/tools/builtins/browser.py      — browser_navigate / browser_click / browser_fill / browser_screenshot tools
├── Runner dispatch
│   └── agent_meow/runner/tool_dispatch.py        — _execute_browser_tool handler
├── Frontend
│   ├── web/src/lib/browserApi.ts                 — typed API client
│   ├── web/src/hooks/useBrowser.ts               — react-query + WebSocket hooks
│   ├── web/src/shell/BrowserPanel.tsx            — right-rail panel (live browser view)
│   └── web/src/shell/railTabs.ts                 — "browser" added to RightRailTab union
└── Example agent
    └── examples/browser-agent/config.yaml        — (already shipped; skill-only)
```

## 4. Backend design

### 4.A Two implementation paths

| Path | How | Pros | Cons |
| --- | --- | --- | --- |
| **A. CDP relay** (recommended) | Server holds a CDP WebSocket connection to a Playwright-launched Chromium. The frontend connects to a server-side WebSocket that relays CDP frames. The BrowserPanel renders the page via CDP's `Page.getNavigationHistory` + screenshot streaming, or via an `<iframe>` pointing at a server-side reverse proxy. | Real browser, full fidelity, agent + user share the same session. | Complex: needs a CDP proxy + screenshot/streaming pipeline. |
| **B. Screenshot polling** (simpler MVP) | Server runs Playwright headless, takes screenshots on each agent action, serves them via REST. The BrowserPanel shows the latest screenshot + a URL bar + a "back" button. Agent calls `browser_navigate` / `browser_click` / `browser_fill`; the panel polls for the latest screenshot. | Simple: REST + polling, no WebSocket. No live user interaction (view-only). | Not interactive — user can't click/scroll in the panel. Just a live screenshot viewer. |

**Recommendation:** start with **Path B (screenshot polling)** as the MVP —
it's the same complexity as the Images surface (REST + react-query) and gives
the user a live view of what the agent is doing in the browser. Upgrade to
Path A (CDP relay with live interaction) in a follow-up if the user wants to
click inside the panel.

### 4.B REST API (Path B — screenshot polling)

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/sessions/{id}/resources/browser/navigate` | Navigate to a URL; returns a screenshot + page metadata |
| `POST` | `/v1/sessions/{id}/resources/browser/click` | Click an element by selector; returns updated screenshot |
| `POST` | `/v1/sessions/{id}/resources/browser/fill` | Fill an input by selector; returns updated screenshot |
| `POST` | `/v1/sessions/{id}/resources/browser/screenshot` | Take a screenshot; returns PNG bytes |
| `GET` | `/v1/sessions/{id}/resources/browser/state` | Get current URL, title, page text (accessibility tree or innerText) |
| `POST` | `/v1/sessions/{id}/resources/browser/back` | Go back; returns updated screenshot |
| `POST` | `/v1/sessions/{id}/resources/browser/forward` | Go forward; returns updated screenshot |
| `DELETE` | `/v1/sessions/{id}/resources/browser` | Close the browser session |

### 4.C Builtin tools (agent-callable)

| Tool | Description |
| --- | --- |
| `browser_navigate` | Navigate to a URL |
| `browser_click` | Click an element by CSS selector or text |
| `browser_fill` | Fill an input field by selector |
| `browser_screenshot` | Take a screenshot |
| `browser_get_text` | Extract the page's text content |
| `browser_back` / `browser_forward` | Navigation history |

These can be either builtin tools (dispatched via `_execute_browser_tool`) or
MCP tools (if using `@playwright/mcp`). The builtin path gives the server
control over the browser lifecycle (one Chromium per session, cleaned up on
session close); the MCP path is zero-code but the browser is owned by the MCP
subprocess, not the server.

### 4.D Browser session lifecycle

- One Playwright Chromium instance per session (launched on first
  `browser_navigate` call, cleaned up on session close/delete).
- Headless by default; `headless: false` for debugging.
- The browser runs server-side (in the runner process or a managed sandbox);
  the frontend never launches a browser directly.

## 5. Frontend design (BrowserPanel.tsx)

### 5.A Layout

```text
┌─────────────────────────────────────────┐
│ 🌐 Browser                    [↻] [✕]  │  ← header (refresh, close)
├─────────────────────────────────────────┤
│ ← → │ https://example.com        [Go]  │  ← URL bar + back/forward
├─────────────────────────────────────────┤
│                                         │
│         [screenshot of the page]        │  ← latest screenshot (PNG)
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ Page title: "Example Domain"            │  ← page metadata
│ Text: "This domain is for use in..."    │
└─────────────────────────────────────────┘
```

### 5.B Components

- **URL bar** — text input showing the current URL; typing a new URL + Enter
  calls `browser_navigate` (via the API or an agent tool call).
- **Back / Forward** — calls the REST endpoints.
- **Screenshot view** — `<img>` showing the latest screenshot PNG. Polls
  `browser/state` every 2s (or on agent tool-call completion) for a fresh
  screenshot. This is the "live view" in Path B.
- **Page metadata** — title, URL, and a text excerpt below the screenshot.
- **Empty state** — "No browser session. Ask the agent to navigate to a URL,
  or enter one above."

### 5.C React Query hooks

- `useBrowserState(conversationId)` — polls `GET /browser/state` every 2s
  when the Browser tab is active.
- `useBrowserNavigate(conversationId)` — mutation: POST to `/browser/navigate`.
- `useBrowserClick(conversationId)` — mutation: POST to `/browser/click`.
- `useBrowserScreenshot(conversationId)` — query: GET latest screenshot URL.

### 5.D Rail tab wiring

Same pattern as Videos:

- `railTabs.ts`: add `"browser"` to `RightRailTab`.
- `WorkspacePanel.tsx`: import `BrowserPanel`, add the tab pill, add the
  render branch.
- `AppShell.tsx`: add `browser: true` to `railTabsAvailable`.
- `en.json` / `zh-CN.json`: add `workspace.browser` + `browser.*` strings.

## 6. Effort estimate

| Component | Effort |
| --- | --- |
| Backend: `routes/browser.py` + Playwright integration | Medium |
| Backend: `tools/builtins/browser.py` + `_execute_browser_tool` | Low |
| Frontend: `browserApi.ts` + `useBrowser.ts` | Low |
| Frontend: `BrowserPanel.tsx` (URL bar + screenshot view + metadata) | Medium |
| Rail tab wiring (railTabs + WorkspacePanel + AppShell + i18n) | Low (same as Videos) |
| Tests | Medium |
| **Total** | **Medium** — comparable to the Videos surface |

## 7. Relationship to existing browser integrations

| Integration | Pattern | User can see/interact? |
| --- | --- | --- |
| `examples/browser-agent` (shipped) | Skill only — agent shells out to `browser-harness` CLI | No — browser runs in a tmux pane, not the web UI |
| `examples/web-research-agent` (shipped) | MCP only — Scrapling + @playwright/mcp tools | No — agent calls MCP tools; user sees results in chat |
| **BrowserPanel surface** (this design) | First-class rail tab — live browser view in the UI | **Yes** — user sees the page render + can navigate via URL bar |

The BrowserPanel is the **upgrade path** from "agent-internal browser tool"
to "shared, visible workspace surface" — the same upgrade that turned
Docs/Images/Videos from agent-only tools into clickable panels.

## 8. Open questions

1. **Path A vs Path B?** Start with Path B (screenshot polling, view-only)?
   Or go straight to Path A (CDP relay, live interaction)?
2. **Playwright or browser-harness?** Use Playwright directly (server-side)
   or integrate with the `browser-harness` CLI (which already has CDP +
   cloud browser support)?
3. **One browser per session, or shared?** One Chromium per session is
   simpler but heavier. A shared browser pool (like terminal sessions) is
   more scalable but adds lifecycle complexity.
4. **Agent tools or MCP?** Builtin `browser_*` tools (server owns the
   browser) or `@playwright/mcp` (MCP subprocess owns it)? Builtin gives
   the server control over cleanup; MCP is zero-code.
