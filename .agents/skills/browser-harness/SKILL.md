---
description: "browser-harness skill for agent-meow. Use when: user needs to automate complex web tasks that require JavaScript rendering, login, captcha solving, or interaction with dynamic SPAs. NOT for simple content extraction — use web_scrape for that."
applyTo: "**"
---

# browser-harness — Advanced Web Automation for agent-meow

browser-harness (at `https://github.com/browser-use/browser-harness`) is a self-healing browser automation framework. It connects an LLM to Chrome over WebSocket and generates missing domain skills on the fly.

## Architecture

```
agent-meow agent
  → browser_* tools (desktop app) — interactive browsing with user
  → web_scrape (Scrapling) — resilient content extraction
  → browser-harness (MCP) — advanced automation (login, SPA, captcha)
```

## When to Use Which

| Tool | Use Case | Speed | Capabilities |
|------|----------|-------|--------------|
| `browser_*` | Interactive browsing with user | Fast | Navigate, click, type, screenshot |
| `web_scrape` | Content extraction from blocked pages | Fast | Stealth fetch, JS rendering |
| `browser-harness` | Complex automation (login, forms, SPAs) | Slower | Self-healing, domain skills, cloud browsers |

## Setup

```bash
# Clone and install
git clone https://github.com/browser-use/browser-harness
cd browser-harness
npm install
```

## Agent-Meow Configuration

Add as MCP server in agent spec:

```yaml
tools:
  mcp_servers:
    - name: browser-harness
      command: npx
      args: ["browser-harness"]
```

## Key Features

- **Self-healing**: Generates missing domain skills on the fly
- **Cloud browsers**: Free cloud browsers (3 concurrent) with proxies + captcha solving
- **Domain skills**: Auto-generates site-specific interaction skills
- **WebSocket control**: Real-time browser control from the LLM

## vs agent-meow's Existing browser_* Tools

| Feature | browser_* (agent-meow) | browser-harness |
|---------|----------------------|-----------------|
| Browser | Embedded in desktop app | Headless Chrome |
| Use case | Interactive browsing | Automated tasks |
| Captcha | No | Yes (cloud) |
| Login | Manual (user does it) | Automated |
| SPA support | Basic | Full (self-healing) |
| Setup | Built-in | Requires Chrome + npm |

**Recommendation**: Use `browser_*` for interactive sessions, `web_scrape` for content extraction, `browser-harness` for complex automation. They complement each other.
