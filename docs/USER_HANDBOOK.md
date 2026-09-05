# agent-meow User Handbook — Working with the Tools Step by Step

This handbook is a practical, end-user guide to using the agent-meow workspace
and its built-in tools. It walks through each capability step by step, so you
can go from first launch to full productivity — document creation and
conversion, image and video work, file/EXIF auto-search, notes & snippets,
and the voice pipeline.

> **Scope:** covers the local server + web UI. For the one-click Windows desktop
> app, the first-run wizard installs everything for you and you can start at
> [§1](#1-get-started) directly.

---

## Table of contents

1. [Get started](#1-get-started)
2. [Start the server the right way (durable launcher)](#2-start-the-server-the-right-way)
3. [Open and navigate the app](#3-open-and-navigate-the-app)
4. [Documents — create, convert, edit (incl. Word/Excel/PowerPoint)](#4-documents)
5. [Images — upload, generate, edit, tag](#5-images)
6. [Videos — upload and play](#6-videos)
7. [Files + EXIF auto-searching and sorting](#7-files--exif-auto-searching-and-sorting)
8. [Notes and snippets](#8-notes-and-snippets)
9. [Voice pipeline — talk to the agent](#9-voice-pipeline)
10. [Troubleshooting common issues](#10-troubleshooting)

---

## 1. Get started

**Prerequisites (CLI install):**
- Windows / Linux / macOS
- Python 3.12+

**Install from GitHub:**

```bash
uv tool install -q --python 3.12 git+https://github.com/JZKK720/agent-meow.git
```

Or with pip:

```bash
pip install git+https://github.com/JZKK720/agent-meow.git
```

Then, one time, configure the optional doc-conversion and office tools
(see [§4.6](#46-install-the-office-and-conversion-clis) for details):

```bash
# markitdown — converts HTML/PDF/DOCX/XLSX/PPTX → Markdown
uv tool install "markitdown[all]"

# officecli — create/edit/export real Word/Excel/PowerPoint files
# Download officecli-win-x64.exe from the OfficeCLI releases page and place it
# at ~/.local/bin/officecli.exe
```

> [!NOTE]
> The PyPI package name is `omnigent` (module dir is `agent_meow/`). The CLI
> entry points `omnigent`, `omni`, and `agent-meow` are interchangeable.

---

## 2. Start the server the right way

Agent-meow runs a background local server on `http://127.0.0.1:6767` that
serves the web UI and the REST API. **Always use the managed launcher** so the
server persists across sessions and is reused by the CLI.

### Option A — the durable launcher (recommended, Windows)

`scripts/start-server.ps1` sets all required environment variables
(`HERMES_API_KEY`, `MARKITDOWN_BIN`, `OFFICECLI_BIN`) and starts the server
through the managed path, then verifies it is healthy:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1
```

- **First run / after config changes** — add `-Restart` to stop any stale server
  first, then start fresh:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1 -Restart
  ```
- It is **idempotent**: if a healthy server is already up, it prints
  `Background server already running` and reuses it.

**What the launcher sets:**

| Variable | Value | Why |
|----------|-------|-----|
| `HERMES_API_KEY` | (your gateway key) | Auth to the Hermes gateway |
| `MARKITDOWN_BIN` | `~/.local/bin/markitdown.exe` | So `doc_convert` finds markitdown |
| `OFFICECLI_BIN` | `~/.local/bin/officecli.exe` | So office doc tools find officecli |
| `PYTHONUTF8` / `PYTHONIOENCODING` | `1` / `utf-8` | Correct Chinese text in logs |

### Option B — the built-in management subcommands

```bash
agent-meow server start    # ensure the background server is running (reuses healthy one)
agent-meow server status   # is it up? what port / pid / sessions?
agent-meow stop            # stop the server + local host daemon
```

> [!IMPORTANT]
> Don't run `agent-meow server` (bare, foreground) for long-running work — a
> foreground child dies with the terminal. Use `server start` so the background
> server is detached, registered in the pidfile (`~/.agent-meow/local_server.pid`),
> and survives terminal cleanup.

### Verify it's healthy

```bash
agent-meow server status
# Background server: running at http://127.0.0.1:6767 (pid …, port 6767)
```

Or hit the health endpoint:

```bash
curl http://127.0.0.1:6767/health     # → {"status":"ok"}
curl http://127.0.0.1:6767/v1/stack/status
# → server=ok hermes=ok ollama=ok tts=ok …
```

---

## 3. Open and navigate the app

Open `http://127.0.0.1:6767` in your browser (or the packaged app window).

The **right workspace rail** has tabs for each surface:

```
Files │ Docs │ Notes │ Snippets │ Images │ Videos │ Projects │ Voice │ Subagents │ Terminals │ Todos │ Browser
```

- Click a tab to open that panel (e.g. **Docs**, **Images**, **Videos**).
- The **starter chips** above the composer are quick-start prompts.
- Pick an **agent** and a **workspace** — surface panels become live once a
  session is bound to a workspace.

On a mobile device, open `http://<your-laptop-ip>:6767`.

---

## 4. Documents

The **Docs** panel manages rich-text and office documents. Use it to create,
convert, edit, and export documents.

### 4.1 Create a document

Two ways:

- **In chat:** type a natural-language request, e.g.
  `Create a meeting-notes doc titled "ABC Sync" with an agenda section.` The
  agent calls the `doc_create` / `doc_generate` tool.
- **In the Docs panel:** use the create button / prompt seed to generate a doc.

### 4.2 List and open documents

The Docs panel lists your session's documents (newest first). Click one to open
the rich-text editor.

### 4.3 Convert any file to Markdown (`doc_convert`)

Convert an HTML/PDF/DOCX/XLSX/PPTX file into Markdown using `markitdown`:

```
Convert docs/report.docx to Markdown and show the result
```

This runs the `doc_convert` tool. **Requires `markitdown`** (install in
§4.6). Ensure `MARKITDOWN_BIN` is set (the launcher does this for you).

### 4.4 Create real Office files (`doc_create_office`)

Create native Word/Excel/PowerPoint files:

```
Create a .docx instruction sheet titled "Onboarding" with sections:
- Welcome
- First steps
- Contacts
```

This runs officecli to build a real `.docx`/`.xlsx`/`.pptx`, then uploads it to
your Docs panel. **Requires `officecli`** (install in §4.6).

### 4.5 Edit / export Office files (`doc_edit_office`, `doc_export`)

- **Edit** an existing office doc:
  ```
  Edit the "Onboarding.docx" doc — add a "Troubleshooting" section before "Contacts".
  ```
- **Export** it to PDF, HTML, PNG, or text:
  ```
  Export the "Onboarding.docx" to PDF.
  ```

### 4.6 Install the Office and conversion CLIs

agent-meow shells out to two external CLIs. Both are optional but enable the
full office-document feature set.

**markitdown** (doc/core format → Markdown):

```bash
uv tool install "markitdown[all]"
# → installs markitdown.exe into ~/.local/bin/
```

**officecli** (create/edit/export Word/Excel/PowerPoint):

1. Download `officecli-win-x64.exe` from the
   [OfficeCLI releases](https://github.com/iOfficeAI/OfficeCLI/releases) page.
2. Place it at `~/.local/bin/officecli.exe`.
3. Verify: `officecli --version` → `1.0.147`.

Because `~/.local/bin` is usually **not** on PATH, the tools won't find them
by default. Set the env vars (the launcher does this):

```powershell
$env:MARKITDOWN_BIN = "$env:USERPROFILE\.local\bin\markitdown.exe"
$env:OFFICECLI_BIN  = "$env:USERPROFILE\.local\bin\officecli.exe"
```

> [!NOTE]
> `officecli` runs a **resident process** that keeps the file handle open.
> agent-meow now calls `officecli close <file>` before reading/uploading, which
> flushes and **releases** the file — fixing a Windows "file in use" (WinError 32)
> error. You don't need to do anything; it's handled.

---

## 5. Images

The **Images** panel is a gallery for the session's images. Use it to upload,
generate, edit, and tag images.

### 5.1 Upload / list images

Drop an image into the panel or upload via the button. Images list newest-first.

### 5.2 Generate an image

Use a **Generate** button in the Images panel (or prompt seed) — the agent runs
an image-generation provider (fal / DashScope, configured under
**Settings → Media & Generation**) and auto-uploads the result into the gallery.

```
Create a wide hero image of a sunset over a calm sea.
```

### 5.3 Edit an image

`image_edit` supports operations like background removal (rembg), resizing, and
other edits. Ask the agent in chat:

```
Remove the background from the photo "beach.png".
```

### 5.4 Auto-tag by LLM (`image_analyze`)

The agent's vision model classifies an image and calls `image_analyze` to store
lowercase, deduped tags (up to 10, ≤20 chars each) for that file. These tags
power the file/EXIF search ([§7](#7-files--exif-auto-searching-and-sorting)).

---

## 6. Videos

The **Videos** panel is a gallery for the session's videos.

- **Upload** a video file, or **generate** one via a **Generate** button (e.g.
  fal / Pixelle / DashScope / Hyperframes providers).
- **Play** any listed video in the panel.
- Videos appear in the panel automatically when the agent generates them.

---

## 7. Files + EXIF auto-searching and sorting

This is the "file intelligence" feature: agent-meow automatically indexes the
workspace, extracts EXIF/date/camera metadata from images, and lets you search
and sort by content — including by LLM-generated tags.

### How it works (the pipeline)

```
You drop a file in the workspace
   ↓
File watcher detects it → enqueued in the file index
   ↓
Metadata worker extracts (no LLM, always works):
   images → Pillow EXIF (capture date, GPS, camera make/model, lens,
            dimensions, orientation) + a perceptual dHash + a WebP thumbnail
   docs   → text excerpt + page/word counts + SHA-256
   other  → size/mtime + SHA-256
   ↓
Embed worker (optional) adds CLIP visual embeddings for "search by meaning"
   ↓
The file-index + file-search endpoints make everything searchable
```

### Search by keyword / EXIF / content

Use the search box in the Files panel, or ask in chat:

```
Find my photos taken with the Sony camera
Find images from last week
Find the file about "quarterly report"
```

The search is **full-text** (FTS5 with a trigram tokenizer — so it matches
Chinese substrings too) over a blob of **basename + kind + EXIF camera/date +
document text excerpt**. Where a CLIP server is available it also merges
**visual search** (searching "by meaning", e.g. "sunset at the beach" with no
keyword overlap), fused via reciprocal-rank fusion.

### Sort by LLM tags

The agent writes LLM-generated tags via `image_analyze`. The
`/tags/by-file` endpoint serves those tags per file so the Images panel can
display "what is this" chips on each thumbnail. So:

1. The agent analyzes an image and tags it (e.g. `sunset`, `beach`, `ocean`).
2. The panel shows those tags.
3. You can hunt for images by tag.

### Where the index lives

The file index is stored in the shared `chat.db` (`~/.agent-meow/`), and the
file watcher indexes the runner's **global workspace** (e.g.
`~/agent-meow-workspace`). A per-session worktree is indexed by the post-turn
workspace scan.

> [!NOTE]
> The pipeline degrades gracefully: if `watchdog`/`Pillow` or the CLIP server
> isn't installed, it no-ops or falls back to FTS-only — it never crashes.

---

## 8. Notes and snippets

Two lightweight right-rail tools for quick capture.

### Notes

- **Add** a note from the **Notes** panel (title + body, optional tags).
- **Pin** a note so it stays on top — right-click / the pin action.
- Notes persist per session.

### Snippets

- **Save** a code snippet (title, language, code, optional description/tags).
- **Search** snippets by keyword (`/snippets/search`).
- Reuse a saved snippet in chat.

---

## 9. Voice pipeline

Talk to the agent with the mic. The pipeline is fully local — no cloud STT/TTS.

```
🎤 Mic → Silero VAD (detects speech) → Whisper (STT, transcription)
   → agent turns → Qwen3-TTS (Speech) → speaker 🔊
```

- Click the **mic / paw** button (or use wake-word) to start a voice turn.
- The **ComposerMicButton / VoicePawButton** shows voice state.
- A **voice waveform** appears while the agent is speaking.
- STT defaults to Chinese (`zh`); the browser sends a per-request language that
  can override it for English.

> [!TIP]
> If voice replies are silent, check **Settings → Runtime Status** — it shows
> live health for the server, host daemon, Hermes, Ollama, STT and TTS services,
> with process metrics (PID, uptime, restart count).

---

## 10. Troubleshooting

### The server "keeps stopping between sessions"

You were probably running the foreground `agent-meow server`. Use the managed
path instead — the durable launcher or `agent-meow server start`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1 -Restart
```

### `doc_convert` says "markitdown CLI not found"

`markitdown` is installed but not on PATH. Set `MARKITDOWN_BIN`:

```powershell
$env:MARKITDOWN_BIN = "$env:USERPROFILE\.local\bin\markitdown.exe"
```

(or run the launcher, which sets it).

### `doc_create_office` / `doc_edit_office` say "officecli CLI not found"

`officecli` isn't installed or isn't found. Install it (§4.6) and set
`OFFICECLI_BIN`, or run the launcher.

### Office doc create/edit fails with "file is in use" (WinError 32)

Fixed in the code — agent-meow now calls `officecli close <file>` to release the
file handle before reading it. If you still see it, make sure you're on the
latest `main` (`git pull`).

### The stack shows `hermes: auth_error` / `401`

The Hermes gateway key is wrong. The live key is in the gateway's
`/opt/data/.env` (`API_SERVER_KEY=…`). Set `HERMES_API_KEY` to that value before
starting the server (the launcher does this).

### EXIF search returns nothing

- Confirm the file is in the **indexed workspace** (the global workspace).
- Give the watcher a moment — extraction runs on a ~2s worker cycle.
- Make sure the file is actually indexed (not `pending`/`failed`).

### STT transcribes English as Chinese

Expected when the STT default language is `zh`. Send a per-request language of
`en` (the browser client does this automatically for English speech).

---

## Quick reference — the tool commands

| Tool | What it does | Needs |
|------|--------------|-------|
| `doc_create` / `doc_generate` | Create a Markdown document | — |
| `doc_convert` | Convert a file to Markdown | `markitdown` |
| `doc_create_office` / `doc_edit_office` / `doc_export` | Create / edit / export Word, Excel, PowerPoint | `officecli` |
| `image_generate` | Generate an image | image provider (fal/DashScope) |
| `image_edit` | Edit an image (e.g. rembg, resize) | — |
| `image_analyze` | LLM-classify an image → store tags | vision model |
| `file-search` / `file-index` | Search / list indexed workspace files | file-intel (watchdog+Pillow) |
| `note_create` / `note_pin` | Add / pin a note | — |
| `snippet_create` / `snippet_search` | Save / search code snippets | — |
