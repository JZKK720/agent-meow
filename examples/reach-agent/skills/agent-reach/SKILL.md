---
name: agent-reach
description: >-
  MUST USE when the user wants to research/search/look up/find anything on the
  internet across social and content platforms — e.g. "research this topic on
  Twitter", "do a deep dive on X across Reddit", "search the web for X", "see
  what people say about X on XiaoHongShu", "look this up on YouTube". Also
  MUST USE when the user mentions any platform or shares any URL/link: Twitter/X,
  Reddit, Facebook, Instagram, YouTube, GitHub, Bilibili, XiaoHongShu, Xiaoyuzhou
  Podcast, LinkedIn/jobs/recruiting, V2EX, Xueqiu (stocks), RSS. 15 platforms,
  multi-backend routing (OpenCLI / per-platform CLIs / APIs). Run `agent-reach
  doctor --json` to see which backend serves each platform right now. NOT for:
  writing reports/analysis/translation (this skill only FETCHES internet content);
  posting/commenting/liking (write operations); generic web scraping of arbitrary
  URLs (use the scrapling-agent's Scrapling tools for that).
---

# agent-reach — internet capability router

agent-reach is a **capability layer**, not yet another fetcher. It sits one level
above any specific implementation: it handles **selection, installation, health
checks, and routing** for 15 platforms. The actual reading is done by you (the
agent) calling the upstream CLI it tells you to use. There is no wrapper layer.

## When to use

- The user names a platform: "search Twitter for X", "read this Reddit thread",
  "what's on XiaoHongShu about Y", "transcribe this YouTube video", "read this
  GitHub repo".
- The user shares a URL from any of the 15 supported platforms.
- The user asks to "research" or "deep dive" across social/content platforms.

## When NOT to use

- Generic web scraping of an arbitrary URL with anti-bot bypass → use Scrapling
  (`get` / `fetch` / `stealthy_fetch` tools).
- Writing reports, analysis, or translation from fetched content → fetch first
  with agent-reach, then do the writing yourself.
- Posting, commenting, liking, or any write operation → agent-reach is fetch-only.

## First step: diagnose what's available

```bash
agent-reach doctor --json
```

This prints, per platform, which backend is currently active (OpenCLI /
per-platform CLI / MCP) and what's broken. Use it to decide which command to
call. If `agent-reach` is not installed, install it first:

```bash
pip install agent-reach
agent-reach install --env=auto           # core channels (lightweight, zero-config)
agent-reach install --env=auto --channels=twitter,xiaohongshu   # + optional channels
agent-reach install --env=auto --channels=all                   # everything
```

## The 15 platforms and their commands

| Platform | Read with | Search with | Setup |
| --- | --- | --- | --- |
| Web (any URL) | `jina` (Jina Reader, zero config) | — | Zero config |
| Twitter/X | `twitter tweet <id>` / `twitter thread <id>` | `twitter search "query"` | Cookie (twitter-cli) |
| YouTube | `yt-dlp` (transcripts + metadata) | `yt-dlp "ytsearch10:query"` | Zero config |
| GitHub | `gh repo view`, `gh issue list`, `gh pr view` | `gh search repos "query"` | `gh auth login` |
| Bilibili | `bili hot` / `bili rank` / `bili search "query"` | `bili search "query"` | Zero config (bili-cli) |
| Reddit | `opencli reddit ...` (desktop) / `rdt ...` (server) | `opencli reddit search "query"` | Login required |
| Facebook | `opencli facebook search "query"` / `opencli facebook profile <id>` | `opencli facebook search "query"` | OpenCLI (desktop Chrome) |
| Instagram | `opencli instagram search "query"` / `opencli instagram profile <id>` | `opencli instagram search "query"` | OpenCLI (desktop Chrome) |
| XiaoHongShu | `opencli xiaohongshu ...` (desktop) / `xiaohongshu-mcp` (server) | `opencli xiaohongshu search "query"` | OpenCLI or xiaohongshu-mcp |
| LinkedIn | `mcporter call 'linkedin.get_person_profile(...)'` | `mcporter call 'linkedin.search_people(...)'` | linkedin-scraper-mcp |
| V2EX | `v2ex hot` / `v2ex node <name>` / `v2ex topic <id>` | `v2ex search "query"` | Zero config |
| Xueqiu (stocks) | `xueqiu quote <symbol>` / `xueqiu hot` | `xueqiu search "query"` | Browser cookie |
| RSS | `feedparser` (Python: `import feedparser; feedparser.parse(url)`) | — | Zero config |
| Xiaoyuzhou Podcast | `agent-reach transcribe <url>` (Whisper via Groq/OpenAI) | — | Zero config |
| BossZhipin (jobs) | `boss search "query"` | `boss search "query"` | Zero config |

**Always** run `agent-reach doctor --json` first to confirm which backend is
active for the platform you're about to query — the active backend can change
when an access path dies and agent-reach re-routes.

## Multi-backend routing

Each platform is an ordered backend list (primary + fallbacks). When a backend
breaks, agent-reach switches to the next. Examples:

- Twitter: `twitter-cli` → OpenCLI → bird
- Bilibili: `bili-cli` → OpenCLI → search API (yt-dlp retired, 412-blocked)
- Reddit: OpenCLI → rdt-cli (no zero-config path, login required)
- XiaoHongShu: OpenCLI (desktop) → xiaohongshu-mcp (server) → xhs-cli (legacy)

`agent-reach doctor --json` tells you exactly which one is active right now.

## Privacy

Cookies stay local. Never uploaded. agent-reach is fully open source — audit
anytime. For platforms that need cookies (Twitter, Reddit, Facebook, Instagram,
XiaoHongShu, Xueqiu), prefer a dedicated/secondary account to limit blast
radius if credentials are ever compromised.

## Environment detection

agent-reach auto-detects local computer vs server:

- **Local:** OpenCLI reuses your Chrome login state (desktop only). No proxy
  needed.
- **Server:** OpenCLI is skipped (needs a desktop Chrome). Use per-platform
  CLIs or MCP backends instead. A proxy (~$1/month) may be needed for
  region-locked platforms.

## MCP companion (diagnostics only)

This agent also declares the `@agent-reach/mcp` MCP server. It exposes ONE
tool: `get_status` (returns the `agent-reach doctor` report as JSON). Use it to
check platform availability without shelling out. The actual fetching is done
by calling the upstream CLIs above, not via MCP.