# reach-agent

A cross-platform internet research assistant demonstrating the **skill + minimal-MCP pattern** for agent-reach.

This is the reference for the per-agent agent-reach integration. Unlike `memory-agent`, `scrapling-agent`, and `voicebox-agent` — where the MCP server *is* the capability — agent-reach is a **capability router**, not a fetcher. So this bundle uses a different shape:

1. **A bundled skill** (`skills/agent-reach/SKILL.md`, auto-discovered) — tells the agent which upstream CLI to call per platform.
2. **A minimal MCP server** (`@agent-reach/mcp`, one tool: `get_status`) — diagnostics only.

The actual fetching is done by the agent calling upstream CLIs directly (`twitter-cli`, `yt-dlp`, `mcporter`, `gh`, `opencli`, `bili-cli`). Zero core agent-meow code changes.

## What it gives you

- **15 platforms.** Twitter/X, Reddit, Facebook, Instagram, YouTube, GitHub, Bilibili, XiaoHongShu, LinkedIn, V2EX, Xueqiu (stocks), RSS, Xiaoyuzhou Podcast, BossZhipin (jobs), and generic web (Jina Reader).
- **Multi-backend routing.** Each platform is an ordered backend list (primary + fallbacks). When one access path dies, agent-reach re-routes to the next — you don't notice. (Example: Bilibili's `yt-dlp` got 412-blocked; agent-reach switched to `bili-cli` with zero user action.)
- **Environment-aware.** Auto-detects local computer vs server. Local: OpenCLI reuses your Chrome login state. Server: OpenCLI is skipped (needs a desktop Chrome), per-platform CLIs / MCP backends used instead.
- **Fetch-only.** No posting, commenting, liking, or any write operations. Safe to expose to agents.
- **Diagnostics via MCP.** The `get_status` MCP tool returns the `agent-reach doctor` report as JSON, so the agent can check which backend is active without shelling out.

## Setup

### 1. Install agent-reach + its upstream CLIs (one-time)

```bash
pip install agent-reach
agent-reach install --env=auto                              # core channels (lightweight)
agent-reach install --env=auto --channels=twitter,xiaohongshu  # + optional channels
# or everything:
agent-reach install --env=auto --channels=all
```

This installs the agent-reach CLI, the upstream CLIs for the channels you picked, `mcporter` (for Exa search + LinkedIn + XiaoHongShu MCP), and registers the SKILL.md with agent-meow when run in that context. Verify:

```bash
agent-reach doctor
```

### 2. Configure credentials for platforms that need login

| Platform | How |
| --- | --- |
| Twitter | `agent-reach configure twitter-cookies "key=val; ..."` (Cookie-Editor export) |
| Reddit | OpenCLI (desktop, login at reddit.com) or rdt-cli + cookie |
| Facebook / Instagram | OpenCLI (desktop, login in Chrome) |
| XiaoHongShu | OpenCLI (desktop) or xiaohongshu-mcp (server, QR login) |
| Xueqiu | `agent-reach configure xueqiu-cookies "key=val; ..."` |
| LinkedIn | `linkedin-scraper-mcp --login` (one-time, saves session) |
| GitHub | `gh auth login` |

Prefer a **dedicated/secondary account** for platforms that need cookies — limits blast radius if credentials are ever compromised. Cookies stay local; agent-reach never uploads them.

### 3. Run the agent

```bash
meow run examples/reach-agent/config.yaml
```

The runner reads `config.yaml`, auto-discovers `skills/agent-reach/SKILL.md`, and spawns `npx -y @agent-reach/mcp` as a stdio MCP subprocess (diagnostics). The agent loads the skill and calls upstream CLIs directly to fetch content.

## How the wiring works (no core code change)

- `agent_meow/spec/parser.py::_discover_skills` — auto-discovers `skills/<name>/SKILL.md` inside the bundle and parses it into a `SkillSpec` on `AgentSpec.skills`.
- `agent_meow/spec/types.py::MCPServerConfig` — the typed config for the `agentreach` entry under `tools:`.
- `AgentSpec.mcp_servers` + `AgentSpec.skills` — both populated by the spec loader.

This example adds one bundled skill + one `MCPServerConfig` entry. No core code change.

## Trying it

1. Install agent-reach (step 1 above).
2. Run the agent (step 3 above).
3. In the session:
   - "What are people saying about Claude 4.5 on Twitter?" → the agent calls `get_status` to confirm twitter-cli is active, then `twitter search "Claude 4.5"`, then summarizes.
   - "Read this Reddit thread: <https://reddit.com/...>" → the agent routes to OpenCLI or rdt-cli per the doctor report.
   - "Transcribe this YouTube video: <https://youtube.com/watch?v=...>" → `yt-dlp` (transcript) or `agent-reach transcribe <url>` (Whisper).
   - "What's hot on XiaoHongShu about AIPC?" → `opencli xiaohongshu search "AIPC"` (desktop) or `xiaohongshu-mcp` (server).
   - "Search GitHub for repos matching 'agent memory'" → `gh search repos "agent memory"`.

## When to use reach-agent vs scrapling-agent

| Need | Use |
| --- | --- |
| Research a named platform (Twitter, Reddit, XiaoHongShu, YouTube, etc.) | **reach-agent** — knows the right CLI per platform, handles login/cookies |
| Scrape an arbitrary URL with anti-bot bypass (Cloudflare, fingerprinting) | **scrapling-agent** — Scrapling's `get` / `fetch` / `stealthy_fetch` |
| Simple read of any URL to markdown | Either — reach-agent's `jina` (Jina Reader) or scrapling-agent's `get` |

They coexist. reach-agent is platform-aware (knows Twitter needs `twitter-cli`, XiaoHongShu needs OpenCLI on desktop vs `xiaohongshu-mcp` on server). scrapling-agent is generic (any URL, stealth, Cloudflare). The only overlap is baseline URL fetch, where Scrapling is strictly more capable.

## Notes

- **Fetch-only.** agent-reach does NOT post, comment, like, or take any write action. Its SKILL.md explicitly says "NOT for posting/commenting/liking." Safe to expose to agents.
- **MCP is diagnostics-only.** The `@agent-reach/mcp` server exposes ONE tool (`get_status`). Do not expect it to fetch content — that's the upstream CLIs' job, routed by the skill.
- **Upstream CLIs are the real dependency.** The agent calls `twitter`, `yt-dlp`, `gh`, `opencli`, `bili`, `mcporter`, etc. directly. `agent-reach install --env=auto` installs the ones you need; `agent-reach doctor` tells you what's ready.
- **Not server-wide.** Same per-agent caveat: only sessions from agents that bundle the skill + declare the MCP server get agent-reach.

<!-- trailing newline below -->