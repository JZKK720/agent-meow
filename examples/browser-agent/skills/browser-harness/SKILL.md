---
name: browser-harness
description: >-
  Use for ANY web interaction that needs a real, logged-in browser: filling
  forms, clicking buttons, navigating apps you're signed into, taking
  screenshots, recording browser-action videos. Drives the user's actual
  Chrome via CDP (Chrome DevTools Protocol) through the `browser-harness` CLI.
  Different from Scrapling (stateless fetch-and-return with anti-bot bypass)
  and agent-reach (platform-aware social research via upstream CLIs):
  browser-harness is STATEFUL live control of YOUR Chrome with YOUR logins,
  cookies, and extensions. Also supports Browser Use Cloud for isolated /
  headless / parallel browsers (free tier: 3 concurrent, with proxies + captcha
  solving). Setup: `uv tool install --python 3.12 --upgrade --force
  browser-harness`, then tick the remote-debugging checkbox at
  chrome://inspect/#remote-debugging and click Allow on the per-attach popup.
---

# browser-harness — live CDP browser control via CLI

browser-harness is a **CLI + skill** (not an MCP server). You (the agent) drive
the user's real Chrome by shelling out to the `browser-harness` command with
inline Python heredocs. The CLI auto-starts a daemon that connects to Chrome's
remote-debugging CDP endpoint and relays your commands.

## When to use

- Fill forms, click buttons, navigate apps the user is signed into (stateful,
  needs their cookies/login).
- Take screenshots of a logged-in page.
- Record a browser-action video (`browser-harness video init/review/export`).
- Run parallel isolated browsers via Browser Use Cloud (one per task).
- Scrape a page that needs JS + login that Scrapling's stateless fetch can't reach.

## When NOT to use

- Stateless scrape of a public URL with anti-bot bypass → use Scrapling
  (`get` / `fetch` / `stealthy_fetch`).
- Research a named social platform (Twitter, Reddit, XiaoHongShu, YouTube, etc.)
  → use agent-reach (knows the right CLI per platform).
- Simple read of any URL to markdown → Scrapling `get` or agent-reach's `jina`.

## Setup (one-time)

```bash
uv tool install --python 3.12 --upgrade --force browser-harness
command -v browser-harness   # should print a path
```

Then connect it to Chrome:

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

## How to call it

Use agent-meow's shell/terminal tools to run `browser-harness` with a heredoc.
Helpers (`page_info`, `goto_url`, `click_at_xy`, `type_text`, `fill_input`,
`js`, `wait_for_load`, `wait_for_element`, `cdp`, `new_tab`, `switch_tab`,
`screenshot`, etc.) are pre-imported in the heredoc scope.

### Read the current page

```bash
browser-harness <<'PY'
print(page_info())
PY
```

### Navigate

```bash
browser-harness <<'PY'
goto_url("https://example.com")
wait_for_load()
print(page_info())
PY
```

### Click at coordinates and type

```bash
browser-harness <<'PY'
goto_url("https://example.com/login")
wait_for_load()
click_at_xy(420, 310)
type_text("my_username")
click_at_xy(420, 360)
type_text("my_password")
click_at_xy(420, 410)
wait_for_load()
print(page_info())
PY
```

### Fill a form field by CSS selector

```bash
browser-harness <<'PY'
fill_input("#email", "user@example.com", clear_first=True)
fill_input("#password", "hunter2", clear_first=True)
js("document.querySelector('button[type=submit]').click()")
wait_for_load()
print(page_info())
PY
```

### Run raw CDP

```bash
browser-harness <<'PY'
cdp('Page.navigate', url='https://example.com')
PY
```

### Take a screenshot

```bash
browser-harness <<'PY'
from browser_harness.helpers import screenshot
screenshot("/tmp/page.png")
PY
```

## Cloud browsers (isolated / headless / parallel)

Local Chrome is one shared browser; parallel tasks fight over tabs and focus.
For isolated work, captchas, or bot-sensitive sites, use Browser Use Cloud:

```bash
# Authenticate once
browser-harness auth login

# Start a cloud browser named "r7k2"
browser-harness <<'PY'
start_remote_daemon("r7k2")
PY

# Use it by name
BU_NAME=r7k2 browser-harness <<'PY'
print(page_info())
PY
```

Cloud browsers run with clean managed IPs + stealth settings — your own IP and
local browser stay out of it. Free tier: 3 concurrent browsers, proxies, captcha
solving. No card required. Grab a key at cloud.browser-use.com/new-api-key.

## Recordings and videos

browser-harness can record browser actions and produce explanatory MP4s with
privacy review:

```bash
browser-harness recordings enable    # save actions locally by default
# ... do the browser actions ...
browser-harness recordings --latest  # print the newest recording directory
browser-harness video init <recording>      # prepare for editing
browser-harness video review <recording>    # compile + review
browser-harness video export <recording> --reviewed   # export verified MP4
```

Requires `ffmpeg` and `ffprobe` for export.

## Domain skills (optional, advanced)

browser-harness ships site-specific domain skills (Framer editor, Wayback
Machine, package registries, etc.) under
`${XDG_CONFIG_HOME:-~/.config}/browser-harness/agent-workspace/domain-skills/`.
Enable with `BH_DOMAIN_SKILLS=1`. If the task is site-specific, read every file
in the matching `domain-skills/<site>/` directory before inventing an approach.

## Design constraints

- Helpers attach to the **running** Chrome/Chromium CDP endpoint. For isolated
  automation, launch Chrome yourself with `--remote-debugging-port` and pass
  `BU_CDP_URL`, or use a Browser Use cloud browser.
- The daemon auto-starts and connects. If `--doctor` fails, inspect
  `src/browser_harness/admin.py`, `daemon.py`, `_ipc.py`.
- State lives under `${XDG_CONFIG_HOME:-~/.config}/browser-harness` (auth,
  telemetry id, agent workspace, sockets, logs, screenshots, temp files).
  Override with `BH_HOME` or `BROWSER_HARNESS_HOME`.

## Gotchas

- Keep the browser-harness tab focused during video export — rAF throttles in
  background tabs and stalls MediaRecorder capture.
- Snap Chromium on Linux blocks CDP; `browser-harness doctor --fix-snap` prints
  the workaround.
- If an old `browser` or `browser-use` skill is being picked instead of this
  one, remove that stale skill directory manually.