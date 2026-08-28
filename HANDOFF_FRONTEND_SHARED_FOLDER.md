# Handoff: Shared-Folder Selector for agent-meow Files Panel

## Context

A backend fix for file sharing/access has been committed and pushed to
`origin/main` (commit `41c3e208`). The backend now supports:

1. **`?download=true`** on `POST /v1/sessions/{id}/resources/files` —
   accepts any file type (pptx, docx, xlsx, zip, etc.) as a download-only
   artifact, bypassing the inline-attachment type allowlist.
2. **`GET /v1/sessions/{id}/resources/environments/{env}/filesystem/{path}/raw`**
   — serves raw bytes with a real `Content-Type` (guessed from path) +
   `Content-Disposition: attachment` + `nosniff`. Gives the browser a
   stable, shareable URL for any workspace file (image, video, PDF,
   pptx) that renders inline or downloads directly.

Your task: implement the **frontend** "shared folder" selector in the
web UI so the user can pick a workspace path, scan it, and see/download
the files in the right-rail panels.

## Prerequisites

1. **Restore the web source** (it's deleted from the working tree —
   pre-existing uncommitted deletion, but exists in git HEAD):

   ```bash
   git checkout HEAD -- web/src/
   ```

2. **Install dependencies:**

   ```bash
   cd web && npm install
   ```

3. **Start the backend** (the `/raw` endpoint is already live):

   ```bash
   # From repo root:
   .venv/Scripts/python.exe -m agent_meow.server --agent examples/hello_world.yaml
   # Or: meow server --agent examples/hello_world.yaml
   ```

   The Vite dev server proxies `/v1` to `http://localhost:6767`.

## What to build

### 1. Shared-folder path selector in the Files panel header

Add a **folder-path input** to the Files panel header that lets the user:
- Type or paste an absolute path (e.g. `/opt/data/workspace` or
  `C:\Users\K16\Downloads`)
- Pick from recent workspaces (use the existing `useRecentWorkspaces`
  hook — `web/src/hooks/useRecentWorkspaces.ts`)
- On selection, persist the path via a new preference (follow the
  `filesPanelPreferences.ts` pattern — localStorage, never throws,
  degrades gracefully)

### 2. Wire it to the session workspace

The selected path should:
- Set `conv.workspace` for the current session (the server's
  `scan-workspace` endpoint reads from `conv.workspace`). If there's
  no existing API to set the workspace, add a `PATCH` or `PUT` to
  `/v1/sessions/{id}` that updates the `workspace` field.
- Trigger `useScanWorkspace` (`web/src/hooks/useScanWorkspace.ts`) to
  scan and populate the Docs/Images/Videos panels
- The `/raw` endpoint is already live — point media elements and
  download links at:
  `/v1/sessions/{sessionId}/resources/environments/default/filesystem/{path}/raw`

### 3. Render workspace files with download links

For each file in the Files panel:
- Images (`png`, `jpg`, `gif`, `webp`, `svg`): render inline via
  `<img src="/v1/sessions/{id}/resources/environments/default/filesystem/{path}/raw">`
- Videos (`mp4`, `webm`, `mov`): render inline via `<video>`
- PDFs: render in an `<iframe>` or link to download
- Other binary files (pptx, docx, xlsx, zip): show a download button
  linking to the `/raw` URL
- Text/code files: existing file viewer (unchanged)

### 4. Design principles (taste/hallmark/impeccable)

- **No AI slop**: use the existing design system (shadcn/ui + Tailwind v4).
  No custom modal — use a native combobox or the existing dropdown-menu
  pattern. No decorative badges or gradient buttons.
- **Match existing patterns**: `filesPanelPreferences.ts` for the
  preference, `useRecentWorkspaces.ts` for the recent-paths combobox,
  `useScanWorkspace.ts` for the scan trigger. Don't invent new patterns.
- **One-line scan action**: a "Scan now" button that calls
  `useScanWorkspace` — mirrors the existing mutation hook. No loading
  spinner animation; use the existing skeleton/disabled state pattern.
- **Accessible**: the folder input must have a proper `<label>`, the
  scan button must have `aria-label`, and the download links must have
  descriptive link text (not "click here").

## Key files

| File | Purpose |
|------|---------|
| `web/src/hooks/useScanWorkspace.ts` | Existing scan mutation hook — call this |
| `web/src/lib/workspaceScanApi.ts` | Existing scan API client |
| `web/src/hooks/useRecentWorkspaces.ts` | Recent workspace paths (localStorage, per-host) |
| `web/src/lib/filesPanelPreferences.ts` | Panel preference pattern (localStorage, never throws) |
| `web/src/lib/fileViewPreferences.ts` | File viewer preference pattern |
| `web/src/lib/filesApi.ts` | Files API client (upload/list) |
| `web/src/hooks/useFileContent.ts` | File content fetch (JSON, base64 for binary) |
| `web/src/components/blocks/FileProducedCard.tsx` | File-produced card in chat |
| `web/src/hooks/useWorkspaceChangedFiles.ts` | Changed-files list hook |
| `agent_meow/server/routes/sessions.py` | Server routes (new `/raw` endpoint at ~line 19680, `?download=true` on upload) |
| `agent_meow/client_tools/save_artifact.py` | Returns `/raw` URL for workspace files |

## Backend endpoints available (all live, no backend changes needed)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/v1/sessions/{id}/resources/environments/default/filesystem` | List root dir |
| `GET` | `/v1/sessions/{id}/resources/environments/default/filesystem/{path}` | Read file (JSON, base64 for binary) |
| **`GET`** | **`/v1/sessions/{id}/resources/environments/default/filesystem/{path}/raw`** | **Raw bytes with Content-Type + download disposition (NEW)** |
| `GET` | `/v1/sessions/{id}/resources/environments/default/filesystem/{path}?limit=1000&order=asc` | List dir with pagination |
| `POST` | `/v1/sessions/{id}/resources/scan-workspace` | Scan workspace for .md/images/videos → import to stores |
| `POST` | `/v1/sessions/{id}/resources/files?download=true` | Upload download-only artifact (any type) |
| `GET` | `/v1/sessions/{id}/resources/files/{file_id}/content` | Download session-file content |

## Build & deploy

After implementing:

```bash
cd web && npm run build
```

This outputs to `agent_meow/server/static/web-ui/` (the served SPA bundle).
The Vite build config is at `web/vite.config.ts`.

## Tests to run

```bash
# Backend tests (should still pass)
.venv/Scripts/python.exe -m pytest tests/client_tools/test_save_artifact.py -v

# Frontend tests (after restoring web/src/)
cd web && npm test -- --run
```

## Commit message convention

```
feat(files-panel): add shared-folder selector + raw file download links

- Folder-path input in Files panel header (useRecentWorkspaces +
  filesPanelPreferences pattern)
- Scan-now button triggers useScanWorkspace
- Media elements point at /raw endpoint for inline render + download
- All files: stable /raw URL for direct browser download
```

## Do NOT

- Do NOT touch `agent_meow/server/routes/sessions.py` or
  `agent_meow/client_tools/save_artifact.py` — the backend is done.
- Do NOT add a new "drop-box scanner" endpoint — `scan-workspace`
  already exists.
- Do NOT rebuild the SPA until the frontend changes are complete and
  tests pass.
- Do NOT add custom CSS animations or gradient buttons — use the
  existing shadcn/ui + Tailwind v4 design system.
