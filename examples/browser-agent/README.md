# browser-agent

A live-browser-control assistant demonstrating the **skill-only pattern** (no MCP server) for browser-harness.

This is the reference for the per-agent browser-harness integration. Unlike the three MCP-only bundles (`memory-agent`, `scrapling-agent`, `voicebox-agent`) and the skill+MCP bundle (`reach-agent`), this one declares **no MCP server at all**. browser-harness is a **CLI** driven by inline Python heredocs, not an MCP server. The agent uses agent-meow's existing shell/terminal tools to run it, routed by a bundled skill. **Zero core agent-meow code changes, zero MCP registration.**

## What it gives you

- **Live CDP control of the user's real Chrome.** Fill forms, click buttons, navigate apps they're signed into — with their logins, cookies, and extensions intact.
- **Pre-imported helpers.** `page_info`, `goto_url`, `click_at_xy`, `type_text`, `fill_input`, `js`, `wait_for_load`, `wait_for_element`, `cdp`, `new_tab`, `switch_tab`, `screenshot`, and more — all available in the heredoc scope, no imports needed.
- **Screenshots.** Capture the current page render.
- **Browser-action videos.** `browser-harness video init/review/export` records browser actions and produces explanatory MP4s with privacy review.
- **Cloud browsers.** Browser Use Cloud for isolated / headless / parallel work (free tier: 3 concurrent, proxies, captcha solving). Your own IP and local browser stay out of it.
- **Domain skills.** Site-specific skills (Framer editor, Wayback Machine, package registries) under `~/.config/browser-harness/agent-workspace/domain-skills/` — enable with `BH_DOMAIN_SKILLS=1`.

## How it differs from the other research/browser agents

| Agent | Pattern | Use for |
| --- | --- | --- |
| `scrapling-agent` | MCP only (9 fetch tools) | Stateless scrape of any URL, anti-bot bypass (Cloudflare, fingerprinting) |
| `reach-agent` | Skill + minimal MCP | Platform-aware research across 15 named social/content platforms (Twitter, Reddit, XiaoHongShu, YouTube, etc.) |
| **`browser-agent`** | **Skill only (no MCP)** | **Stateful live control of YOUR Chrome — fill forms, click buttons, navigate logged-in apps, screenshot, record video** |

They coexist. Use `scrapling-agent` to fetch a public page. Use `reach-agent` to research a named platform. Use `browser-agent` to *do something in* the user's logged-in browser.

## Setup

### 1. Install browser-harness (one-time)

```bash
uv tool install --python 3.12 --upgrade --force browser-harness
command -v browser-harness   # should print a path
```

### 2. Connect it to Chrome (one-time)

1. Open `chrome://inspect/#remote-debugging` in Chrome.
2. Tick the checkbox so agents can connect to your browser.
3. Click **Allow** when the per-attach popup appears (Chrome 144+).

Verify:

```bash
browser-harness --doctor
```

If `page_info()` prints, you're connected:

```bash
browser-harness <<'PY'
print(page_info())
PY
```

### 3. Run the agent

```bash
meow run examples/browser-agent/config.yaml
```

The runner reads `config.yaml`, auto-discovers `skills/browser-harness/SKILL.md`, and exposes it to the model. No MCP server is spawned. The agent uses agent-meow's existing shell tool to run `browser-harness <<'PY' ... PY` heredocs.

## How the wiring works (no core code change)

- `agent_meow/spec/parser.py::_discover_skills` — auto-discovers `skills/<name>/SKILL.md` inside the bundle and parses it into a `SkillSpec` on `AgentSpec.skills`.
- agent-meow's existing shell/terminal tools (the `sys_terminal_*` / shell builtins) — the agent uses these to run the `browser-harness` CLI. No new tool needed.

This example adds one bundled skill. No `MCPServerConfig`, no MCP manager involvement, no core code change.

## Trying it

1. Install + connect browser-harness (steps 1–2 above).
2. Run the agent (step 3 above).
3. In the session:
   - "What page am I on right now?" → the agent runs `browser-harness <<'PY' print(page_info()) PY`.
   - "Go to github.com and tell me what I see." → `goto_url("https://github.com"); wait_for_load(); print(page_info())`.
   - "Fill the search box with 'agent memory' and submit." → `fill_input("[name=q]", "agent memory", clear_first=True); js("document.querySelector('form').submit()"); wait_for_load(); print(page_info())`.
   - "Take a screenshot of the current page." → uses the `screenshot` helper.
   - "Do this task in an isolated cloud browser." → the agent starts a Browser Use Cloud browser and prefixes commands with `BU_NAME=<name>`.

## Safety

browser-agent drives the user's **real** Chrome with their **real** logins. The agent should read and navigate freely but **ask before any irreversible action** — submitting forms, making purchases, posting content, deleting data. The skill's prompt enforces this, but review the agent's plan before approving risky tool calls via agent-meow's policy/ASK system if you want a hard guardrail.

## Notes

- **Not an MCP server.** browser-harness is a CLI driven by heredoc Python snippets. Do not expect MCP tools from it. The skill is the routing layer; the shell is the transport.
- **Chrome must be running with remote debugging.** The `chrome://inspect/#remote-debugging` checkbox + per-attach Allow popup are mandatory. `browser-harness --doctor` diagnoses what's missing.
- **Cloud browsers are optional.** Local Chrome does not need a Browser Use API key. Use cloud only for isolated/parallel/captcha-heavy work.
- **Domain skills are off by default.** Set `BH_DOMAIN_SKILLS=1` to enable site-specific skills (Framer, Wayback Machine, etc.).
- **Not server-wide.** Same per-agent caveat: only sessions from agents that bundle the skill get browser-harness routing.

<!-- trailing newline below -->