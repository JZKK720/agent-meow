# HANDOFF: Plan-039 Phase 1-3 — ImagesPanel EXIF + Search + Reveal + Intent

## Context

You are picking up plan-039 (`plans/039-file-intelligence-research-and-architecture.md`)
on branch `feat/039-file-index-phase0`. Phase 0 (backend index spine) is
shipped and working. The Files panel has EXIF/dimension badges. But the
Images panel, search endpoint, panel-reveal SSE, and intent classifier
were never started — they are Phase 1-3 work.

## What's DONE (don't redo)

### Backend (shipped, 5 commits, all pushed to origin)
- `agent_meow/stores/file_index_store/` — SQLite store: `file_index` +
  `file_meta` tables, workspace-scoped `(host_id, workspace, path)`.
  Alembic migration `c2d3e4f5a9b0`.
- `agent_meow/runner/file_watcher.py` — watchdog Observer, recursive,
  1s debounce, `AGENT_MEOW_FILE_WATCH` default ON.
- `agent_meow/runner/file_meta_worker.py` — Pillow EXIF (GPS DMS→decimal,
  camera, orientation), dHash dedup, WebP thumbnails, pypdf/docx text.
- `agent_meow/runner/file_intel.py` — composition + lifecycle wiring.
- `agent_meow/server/routes/file_index.py` — TWO endpoints only:
  - `GET /v1/sessions/{id}/resources/file-index` (list indexed files)
  - `GET /v1/sessions/{id}/resources/file-index/stats` (status histogram)
  **NO search endpoint exists.** `FileIndexStore` has `list_workspace` +
  `count_by_status` but NO `search` method.

### Frontend (partially shipped)
- `web/src/hooks/useFileIndex.ts` — react-query hook, polls while
  pending>0, returns `{ byPath: Map<string, FileIndexRow>, counts, isLoading }`.
- `web/src/lib/fileIndexApi.ts` — `getFileIndex()`, `toRelative()`,
  `metaBadge()` (returns date → camera → WxH dimensions → null).
- `web/src/shell/FilesPanel.tsx:328` — calls `useFileIndex(conversationId)`,
  passes `fileIndexMap` to `FolderTree`.
- `web/src/shell/FolderTree.tsx:556` — `fileIndexMap?.get(file.path)?.badge`
  renders `[data-testid="file-index-badge"]` on file rows.
- **Verified live**: 6 image rows show dimension badges (1389×1491, etc.)

### Voice fixes (shipped today, all pushed)
- Paw-mic `voiceState` phases (处理中/播报中) — `NewChatDialog.tsx`
- G1 single-Listening mutex — `ComposerMicButton.tsx`
- G2 rebind-not-reconnect — `ChatPage.tsx`
- G3/G4 unified VoiceState enum — `hermesVoice.ts` + `useRealtimeVoice.ts`
- STT language query-param fix — `dictation.py`
- Session-deadlock fix (assistant string content + error-item filter) —
  `open_responses_sdk.py` + `openai_agents_sdk_executor.py`

## What's NOT DONE (your work)

### 1. ImagesPanel EXIF badges + tags (Phase 0, Task 0.5 — quick)

**File**: `web/src/shell/ImagesPanel.tsx`
**Current state**: Plain upload gallery. Zero `useFileIndex` integration.
No badges, no EXIF, no tags, no search, no sorting.
**What to do**:
- Import `useFileIndex` + `metaBadge` from `@/hooks/useFileIndex` + `@/lib/fileIndexApi`.
- For each image in the gallery, look up `fileIndexMap.get(relativePath)?.badge`
  and render it as a chip below/over the thumbnail.
- The Images panel uses `useImages(conversationId)` which returns uploaded
  images (server-stored, not workspace files). The file index tracks
  workspace files. You need to match by filename — the image's `filename`
  field vs the index entry's `path` (relative posix, e.g.
  `Screenshot 2026-07-20 164118.png`).
- Also show the "Tags" section (currently in FilesPanel at line ~1079:
  "No tags yet. Click Analyze to ask the agent to classify images").
  The Analyze button posts to the agent — that's the `image_analyze` tool
  path, which writes to `file_tags`. The Images panel should show those
  tags too.

### 2. FTS5 search table (Phase 1, Task 1.1)

**File**: `agent_meow/stores/file_index_store/sqlalchemy_store.py`
**What to do**:
- Add an FTS5 virtual table: `content = filename + EXIF words + tag names
  + doc text first-K chars`, with `trigram` tokenizer for CJK substring.
- Migration to create the FTS5 table + triggers to keep it in sync with
  `file_index` inserts/updates.
- `FileIndexStore.search(query, workspace)` method returning ranked
  `{path, score, meta, tags, thumb}`.

### 3. Search endpoint (Phase 1, Task 1.2)

**File**: `agent_meow/server/routes/file_index.py`
**What to do**:
- `GET /v1/files/search?q=&kind=&date=&tag=` → ranked results from the
  FTS5 search.
- `search_files_semantic` agent tool (replaces `search_by_tag`, keeps
  old name as alias). The tool calls the same endpoint and returns
  paths to the agent.

### 4. Panel reveal SSE (Phase 1, Task 1.3)

**Files**: `web/src/store/revealStore.ts` (new), `web/src/shell/AppShell.tsx`
**What to do**:
- SSE event `files.revealed {paths, tab}` from the server when a search
  completes (or the agent calls the search tool).
- `revealStore.ts` Zustand store action that AppShell subscribes to.
- AppShell already has `setRightRailTab` (line 146) and `openFileViewer`
  (line 876) — wire the reveal action to call these.
- E2E: search in chat → right panel auto-opens on the best match.

### 5. Intent classifier (Phase 1, Task 1.4)

**File**: `web/src/lib/voiceIntent.ts`
**What to do**:
- Add `file_search` intent with prefixes `search local -`, `查询本地`,
  `搜本地`, `/find <query>`.
- A `file_search` hit routes straight to the search endpoint and renders
  a `FileResultCard` in the chat stream (no LLM turn).
- Tests: intent classifier cases both EN/ZH directions. Watch for
  over-match: "查询本地天气" must stay `chat`, not `file_search`.

### 6. CLIP/SigLIP embeddings (Phase 2 — larger, defer if needed)

- Smoke-test `sherpa-onnx` CLIP vs `onnxruntime` + SigLIP2 ViT-B/16 ONNX.
- `sqlite-vec` `vec0` table for vector KNN.
- Hybrid merge: FTS5 top-50 + KNN top-50 → RRF.
- This is the "search local - 海边的日落 finds sunset photos with no
  manual tags" feature.

## Key files to read before starting

- `plans/039-file-intelligence-research-and-architecture.md` — the full
  spec with architecture, phased tasks, and demo UX acceptance criteria.
- `web/src/shell/ImagesPanel.tsx` — the panel to enhance (currently bare).
- `web/src/shell/FilesPanel.tsx:328` — the working pattern to copy
  (`useFileIndex` → `fileIndexMap` → badge rendering).
- `web/src/shell/FolderTree.tsx:541-556` — the row-level badge rendering.
- `web/src/lib/fileIndexApi.ts` — `metaBadge()`, `toRelative()`, `getFileIndex()`.
- `web/src/hooks/useFileIndex.ts` — the react-query hook.
- `agent_meow/server/routes/file_index.py` — the two existing endpoints
  (add the search endpoint here).
- `agent_meow/stores/file_index_store/sqlalchemy_store.py` — the SQLite
  store (add FTS5 + search method here).
- `web/src/shell/AppShell.tsx:146,876` — `setRightRailTab` +
  `openFileViewer` seams for the reveal.
- `web/src/lib/voiceIntent.ts` — the intent classifier (add `file_search`).

## Server restart recipe (CRITICAL — don't skip)

```powershell
# Kill BOTH python trees (venv + uv-python legacy)
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -match "agent_meow" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# Env vars (HERMES_BASE_URL must include /v1!)
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
$env:AGENT_MEOW_DICTATION_ENGINE = "whisper"

Start-Process -FilePath ".venv\Scripts\python.exe" `
  -ArgumentList "-m","agent_meow","server","start" `
  -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
```

Or use `scripts/restart-with-fixes.ps1` (already written, does the same).

## Current branch state

```
feat/039-file-index-phase0 (origin/feat/039-file-index-phase0)
Latest commits:
  8b1d591ff fix(dictation): send STT language as query param
  61a24b6ee fix(voice+files): paw-mic ASR-off phases + EXIF badges
  54a3c9a4f fix(executor): assistant string content + error items
  5b28bf58a rebuild SPA: VoiceState enum + voice session-inheritance
  c954d37f2 feat(voice): unified VoiceState enum + FilesPanel harness
  410d23173 fix(voice): single-Listening mutex + workspace inherits
  1df49a540 Merge origin/main: voice fixes 036+037
```

## Known issues (don't forget)

1. **Drawio conversation lost**: session `659738005...` (28 items) is
   gone from chat.db — likely lost during a process-kill mid-WAL-write.
   Other 12 conversations intact. Not investigated; user aware.
2. **Terminal degradation**: after ~15 commands, PowerShell loses
   cmdlet resolution. Use `scripts/restart-with-fixes.ps1` or full
   paths. Prefer `cmd.exe /c "..."` for curl/netstat.
3. **pytest INTERNALERROR**: local pytest has a plugin crash during
   teardown reporting. Use `python -m unittest` for clean output.
4. **SPA rebuild required**: after any `web/src/` change, run
   `cd web && npm run build` then restart the server. The server serves
   from `agent_meow/server/static/web-ui/` (immutable cache headers).
5. **STT language**: the paw-mic VAD path (hermesVoice.ts) has its own
   language auto-adjust. The dictation path (composer mic) uses the
   server-side whisper engine — the `?language=zh` query param fix
   (commit 8b1d591ff) is the correct approach for that path.

## Separate session: paw-mic/dictation + VAD-STT-LLM-TTS audit

The user will start a separate session for:
- Full audit of the paw-mic → dictation button sequence (rule 1-14
  state machine from the 橘宝 Voice Session 执行规则).
- VAD → STT → LLM → TTS bottleneck smoke tests.
- The voice fixes (G1-G5, voiceState, STT language) are all shipped
  but need live end-to-end verification with real speech.

## Acceptance criteria (from plan-039 §7)

1. Drop a file into workspace → ≤2s the Images tab shows it with
   capture date, camera, GPS place, thumbnail.
2. Type `search local - 海边的日落` → chat shows a FileResultCard list
   AND the right panel auto-opens on the best match.
3. Type `查询本地 发票` → PDFs whose extracted text contains 发票 rank
   first (FTS5 trigram).
4. Ask the agent "where's that invoice from August?" → it calls
   `search_files_semantic`, answers with paths, panel reveals.