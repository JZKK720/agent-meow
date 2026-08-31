# Agent Handoff Memo — 2026-08-29 Session

> **For the next agent on the other dev machine:** This memo contains everything you need to pull, sync, upgrade, and restart the agent-meow server. Read it completely before starting.

## Current State

- **Repo:** `JZKK720/agent-meow` (fork of `omnigent-ai/omnigent`)
- **Branch:** `main`
- **HEAD:** `d4eb50637` (pushed to `origin/main`)
- **Base:** `092f7e621` (the commit before this session's work)
- **Total new commits:** 18 (9 feature + 6 fix + 3 test/wiring)
- **All commits pushed to `origin/main`** — a simple `git pull` will get everything

## What Was Built This Session

### Plan 037: Vision Model File Tagging (agent-driven, Option B)

The agent can now classify workspace images using its vision capability and persist tags via a new `image_analyze` tool.

**Architecture:** The agent sees images via its vision modality (`input: [text, image, file]`), generates classification tags, and calls `image_analyze` (a runner-dispatched tool) to store them in the `file_tags` SQLite table. The FilesPanel has a tag-chip filter bar with an "Analyze" button that sends a chat message to the agent.

**Files created/modified:**
- `agent_meow/db/migrations/versions/b1c2d3e4f8a9_add_file_tags_table.py` — migration
- `agent_meow/entities/file_tag.py` — FileTag, TagEntry, TagSummary dataclasses
- `agent_meow/stores/file_tag_store/__init__.py` — FileTagStore ABC
- `agent_meow/stores/file_tag_store/sqlalchemy_store.py` — SQLite implementation
- `agent_meow/server/routes/file_tags.py` — GET /resources/tags endpoint
- `agent_meow/tools/builtins/images.py` — ImageAnalyzeTool + SearchByTagTool (schema-only)
- `agent_meow/runner/tool_dispatch.py` — _execute_image_analyze + _execute_search_by_tag handlers
- `agent_meow/runner/app.py` — file_tag_store wired into runner
- `agent_meow/server/app.py` — file_tags router + background watcher wired
- `agent_meow/cli.py` — SqlAlchemyFileTagStore created and passed to create_app
- `agent_meow/server/background_file_watcher.py` — auto-prediction watcher
- `web/src/lib/fileTagsApi.ts` — API client
- `web/src/hooks/useFileTags.ts` — useFileTags + useAnalyzeFiles hooks
- `web/src/shell/FileTagFilter.tsx` — tag-chip filter bar + Analyze button
- `web/src/shell/FilesPanel.tsx` — integrated FileTagFilter
- `web/src/shell/SharedFolderSelector.tsx` — auto_tag=true on scan
- `web/src/pages/ChatPage.tsx` — initialPrompt mic disable fix

### Plan 038: Auto-Tag + Search + Prediction

- `search_by_tag` tool — agent calls it when user says "find cat photos"
- Auto-tag on scan — scan-workspace endpoint accepts `auto_tag=true`, frontend auto-triggers analysis
- Background watcher — opt-in via `AGENT_MEOW_AUTO_TAG=true`, scans every 300s, 5-image batches, 10-min cooldown per conversation

### Bug Fixes

1. **Alembic multiple heads** — migration `down_revision` was wrong (`z10a3b4c5d6e` instead of `98003f09ea51`)
2. **file_tag_store not wired in cli.py** — `create_app` call didn't pass the store
3. **Mixed language replies** — analyze message was bilingual, changed to Chinese-only
4. **Context window overflow** — added batch instruction (5 images at a time)
5. **Dictation timing gap** — mic was enabled during pending initial prompt, added `!!initialPrompt` to disabled prop
6. **PagedList.data not .items** — background watcher used wrong attribute name
7. **Watcher too aggressive** — increased interval from 60s to 300s, added cooldown + vision check
8. **initialPrompt scope error** — variable was in ChatPage scope but referenced in Composer component

## How to Pull and Sync on the Other Dev Machine

```powershell
# 1. Navigate to the repo
cd C:\Users\1\github-pr\agent-meow

# 2. Fetch and pull all commits
git fetch origin
git pull origin main

# 3. Verify HEAD
git log --oneline -1
# Expected: d4eb50637 fix: move initialPrompt check to ChatPage scope (was undefined in Composer)

# 4. Verify all 18 commits are present
git log --oneline 092f7e621..HEAD --format='%h %s' | Measure-Object -Line
# Expected: 18
```

## How to Upgrade and Restart the Server

### Step 1: Run the database migration

The `file_tags` table must be created in the server's DB. The DB location depends on `AGENT_MEOW_DATA_DIR` (defaults to `~/.agent-meow/chat.db`).

```powershell
cd C:\Users\1\github-pr\agent-meow

# Set the DB URL to the server's DB
$env:AGENT_MEOW_DB_URL = "sqlite:///C:/Users/1/.agent-meow/chat.db"

# Run the migration
uv run alembic upgrade head
```

**If the migration fails with "table file_tags already exists":**
The table was already created by `SqlAlchemyFileTagStore._ensure_table()`. Stamp the DB instead:
```powershell
python -c "import sqlite3; c=sqlite3.connect('C:/Users/1/.agent-meow/chat.db'); c.execute(\"UPDATE alembic_version SET version_num='b1c2d3e4f8a9'\"); c.commit(); print('Stamped')"
```

### Step 2: Rebuild the SPA

The SPA bundle must include the new FileTagFilter component and updated ChatPage.

```powershell
cd C:\Users\1\github-pr\agent-meow\web
node node_modules\vite/bin/vite.js build
```

Verify the new bundle exists:
```powershell
Select-String -Path "..\agent_meow\server\static\web-ui\index.html" -Pattern 'index-.*\.js'
```

### Step 3: Reinstall the Python package (if needed)

```powershell
cd C:\Users\1\github-pr\agent-meow
pip install --user --no-deps --no-build-isolation .
pip install --user --no-deps --no-build-isolation sdks/python-client sdks/ui
```

### Step 4: Restart the server

**Without auto-prediction (default):**
```powershell
cd C:\Users\1\github-pr\agent-meow
$env:HERMES_API_KEY = "<your-hermes-api-key>"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:AGENT_MEOW_BUILTIN_AGENT_DIRS = "C:\Users\1\github-pr\agent-meow\examples\hermes-gateway\config.yaml"
.venv\Scripts\python.exe -m agent_meow server start
```

**With auto-prediction (opt-in):**
```powershell
# Same as above PLUS:
$env:AGENT_MEOW_AUTO_TAG = "true"
$env:AGENT_MEOW_AUTO_TAG_INTERVAL = "300"    # 5 minutes
$env:AGENT_MEOW_AUTO_TAG_BATCH = "5"         # 5 images per cycle
$env:AGENT_MEOW_AUTO_TAG_COOLDOWN = "600"    # 10 min per conversation
```

Or use the batch file `start_server_autotag.bat` (already created, adjust the HERMES_API_KEY).

### Step 5: Verify

```powershell
# Check server health
Invoke-RestMethod -Uri "http://127.0.0.1:6767/health"

# Check tags endpoint
$sessions = Invoke-RestMethod -Uri "http://127.0.0.1:6767/v1/sessions?limit=1"
$sid = $sessions.data[0].id
Invoke-RestMethod -Uri "http://127.0.0.1:6767/v1/sessions/$sid/resources/tags"

# Check background watcher (if auto-tag enabled)
Get-ChildItem "C:\Users\1\.agent-meow\logs\server\" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Get-Content $_.FullName | Select-String "watcher" | Select-Object -First 2 }
```

## Test Results

- **Backend tests:** 28 tests pass (4 store + 3 route + 5 image_analyze dispatch + 3 search_by_tag dispatch + 3 scan auto_tag + 10 background watcher)
- **Frontend tests:** 4 vitest tests pass (FileTagFilter)
- **TypeScript:** compiles clean
- **E2e test:** created but requires running server + vision model

## Key Architecture Decisions

1. **Option B (agent-driven) over Option A (direct API):** The agent uses its existing vision capability to see images, then calls `image_analyze` to persist tags. No separate vision API call — the agent's LLM does the classification.

2. **Images surface tools are auto-registered:** `image_analyze` and `search_by_tag` are in the `_IMAGE_TOOLS` frozenset in `tool_dispatch.py`. They don't need to be declared in `tools.builtins:` in the agent's config.yaml.

3. **Background watcher is opt-in:** Disabled by default. Enable via `AGENT_MEOW_AUTO_TAG=true`. The watcher posts chat messages to the agent (same as the "Analyze" button) — it never calls the vision model directly.

4. **Cooldown prevents VRAM burn:** Each conversation is only queued once per 10 minutes, preventing concurrent VRAM-heavy LLM turns.

## Known Issues

- The `start_server_autotag.bat` file contains a hardcoded HERMES_API_KEY — replace it with the other machine's key
- The SPA bundle is rebuilt from source but the Electron app is NOT rebuilt — if using the desktop app, run `cd web/electron && npm run build:win`
- The `file_tags` table may already exist if the server was run before the migration — use the stamp command above
- The background watcher logs to the server log at `~/.agent-meow/logs/server/`

## Files to Clean Up (temp scripts, not committed)

These scripts were created during debugging but are NOT committed (untracked):
- `scripts/check_file_tags.py`
- `scripts/find_heads.py`
- `scripts/stamp_db.py`
- `scripts/verify_heads.py`
- `scripts/test_llm.py`
- `scripts/test_voice_e2e.py`
- `start_server_autotag.bat` (committed but contains a hardcoded API key — sanitize before sharing)
- `commit_msg.txt`

Delete them or add to `.gitignore`.

## Next Steps (Future Plans)

- **Plan 037 Phase 2:** EXIF metadata extraction (date, GPS, location) — `file_metadata` table
- **Plan 037 Phase 3:** CLIP semantic search — vector embeddings in SQLite with `sqlite-vec`
- **Plan 037 Phase 4:** Facial recognition — `insightface` or Ollama vision model
- **Multi-tag search:** `search_by_tags` that accepts multiple tags (ALL or ANY matching)
- **Tag confidence threshold:** `min_confidence` param to filter low-confidence tags
