# Plan 036: Fix shared folder path — make FilesPanel workspace selector actually work

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 7d79bb9bb..HEAD -- web/src/shell/SharedFolderSelector.ts web/src/shell/FilesPanel.tsx web/src/hooks/useScanWorkspace.ts web/src/lib/workspaceScanApi.ts agent_meow/server/routes/workspace_scan.py agent_meow/server/routes/sessions.py agent_meow/server/schemas.py`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: bug + direction
- **Planned at**: commit `7d79bb9bb`, 2026-08-29

## Why this matters

The FilesPanel (right panel) has a `SharedFolderSelector` that lets the user
type a folder path and click "Scan". But the path input is **cosmetic only** —
it stores the path in localStorage and records it in recents, but does NOT
change the session's workspace on the server. The scan always uses the
session's existing workspace (set at creation time via `POST /v1/sessions`).

This means:
1. The user types a path in the FilesPanel → clicks Scan → the scan scans the
   **wrong folder** (the session's original workspace, not the typed path).
2. The `PATCH /v1/sessions/{id}` endpoint does NOT have a `workspace` field —
   the workspace cannot be changed after session creation.
3. The `SharedFolderSelector` comment (line 38-46) explicitly says: "does NOT
   update conv.workspace on the server (that requires adding a workspace field
   to PATCH /v1/sessions/{id}, which is a future backend change)."

The user expects: typing a path in the FilesPanel and clicking Scan should
scan THAT path, not the session's original workspace. The left sidebar
(`WorkspaceFolderSelector`) is just an indication — the right panel
(`SharedFolderSelector` in `FilesPanel`) is the working surface.

## Current state

### Files and their roles

- `web/src/shell/SharedFolderSelector.tsx` — Path input + scan button in the
  FilesPanel header. Stores path in localStorage, calls `scanWorkspace()`.
  Does NOT send the path to the server.
- `web/src/shell/FilesPanel.tsx` — Right panel file tree/flat list. Shows
  files from the session's workspace (via `useWorkspaceEnvironment`).
- `web/src/hooks/useScanWorkspace.ts` — Mutation hook that calls
  `POST /v1/sessions/{id}/resources/scan-workspace`. Does NOT send a path.
- `web/src/lib/workspaceScanApi.ts` — HTTP client for the scan endpoint.
  Calls `POST /v1/sessions/{conversationId}/resources/scan-workspace` with
  no body — the server reads `conv.workspace`.
- `agent_meow/server/routes/workspace_scan.py` — Server endpoint. Reads
  `conv.workspace` from the conversation store. Does NOT accept a path
  parameter.
- `agent_meow/server/schemas.py` — `UpdateSessionRequest` (line 1850) does
  NOT have a `workspace` field. `model_config = ConfigDict(extra="forbid")`
  rejects unknown fields.
- `agent_meow/server/routes/sessions.py` — `PATCH /v1/sessions/{id}` (line
  16163) updates title, labels, runner_id, etc. but NOT workspace.

### Key code excerpts

**SharedFolderSelector.tsx — the path input doesn't send the path (line 38-46)**

```typescript
// NOTE: The scan-workspace endpoint reads from conv.workspace server-side.
// The path input persists the user's preference (localStorage) and records
// it in recents, but does NOT update conv.workspace on the server (that
// requires adding a workspace field to PATCH /v1/sessions/{id}, which is
// a future backend change). The scan uses the session's existing workspace.
// The path input serves as a quick-access record of recently used folders.
```

**workspaceScanApi.ts — scanWorkspace sends no path (line 57-70)**

```typescript
export async function scanWorkspace(
  conversationId: string,
): Promise<WorkspaceScanResult> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/scan-workspace`,
    { method: "POST" },
  );
```

**workspace_scan.py — server reads conv.workspace (line 190-200)**

```python
conv = await asyncio.to_thread(conversation_store.get_conversation, session_id)
if conv is None:
    raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)
if not conv.workspace:
    raise AgentMeowError(
        "Session has no workspace path configured",
        code=ErrorCode.INVALID_INPUT,
    )
workspace = conv.workspace
```

**schemas.py — UpdateSessionRequest has no workspace field (line 1910-1920)**

```python
class UpdateSessionRequest(BaseModel):
    runner_id: str | None = None
    title: str | None = None
    labels: dict[str, str] | None = None
    # ... no workspace field ...
    model_config = ConfigDict(extra="forbid")
```

### Repo conventions

- Backend: Python 3.12, FastAPI, Pydantic v2. Test: `uv run pytest`.
- Frontend: TypeScript, React, Vite. Test: `cd web && node node_modules/vitest/vitest.mjs run <file>`.
- SPA build: `cd web && npx vite build`.
- Commit style: conventional commits with `Signed-off-by` (DCO).
- API patterns: `authenticatedFetch` for frontend HTTP, `@router.post/patch` for FastAPI.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Backend tests | `uv run pytest tests/server/routes/test_workspace_scan.py -q` | all pass |
| Frontend tests | `cd web && node node_modules/vitest/vitest.mjs run src/shell/SharedFolderSelector.test.tsx` | all pass |
| Typecheck | `cd web && npx tsc -b` | exit 0 (pre-existing errors in FilesPanel.tsx/Sidebar.tsx are OK) |
| SPA build | `cd web && npx vite build` | "built in Xs" with no errors |

## Scope

**In scope** (the only files you should modify):
- `agent_meow/server/routes/workspace_scan.py` — accept an optional `path` in the scan request body; if provided, scan that path instead of `conv.workspace`
- `web/src/lib/workspaceScanApi.ts` — send the path in the scan request body
- `web/src/hooks/useScanWorkspace.ts` — accept a `path` parameter and pass it through
- `web/src/shell/SharedFolderSelector.tsx` — pass the typed path to `scan.mutate({ conversationId, path })`
- `web/src/shell/SharedFolderSelector.test.tsx` — update tests for the new path parameter

**Out of scope** (do NOT touch):
- `agent_meow/server/schemas.py` — do NOT add `workspace` to `UpdateSessionRequest`. The workspace is set at session creation and should not be mutable via PATCH (it would break runner bindings). Instead, the scan endpoint accepts a path directly.
- `agent_meow/server/routes/sessions.py` — no changes to PATCH endpoint
- `web/src/shell/WorkspaceFolderSelector.tsx` — the left sidebar selector is separate; it navigates to "/" with the workspace pre-filled for new sessions. Not part of this fix.
- `web/src/shell/FilesPanel.tsx` — no changes needed; the FilesPanel already renders the SharedFolderSelector

## Git workflow

- Branch: `fix/shared-folder-scan-path`
- Commit per logical unit; message style: `fix(files): description`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add optional `path` parameter to the scan-workspace server endpoint

In `agent_meow/server/routes/workspace_scan.py`, modify the `scan_workspace`
endpoint to accept an optional `path` in the request body. If provided,
scan that path instead of `conv.workspace`.

```python
# BEFORE:
@router.post("/sessions/{session_id}/resources/scan-workspace")
async def scan_workspace(
    request: Request,
    session_id: str,
) -> dict[str, Any]:
    # ...
    conv = await asyncio.to_thread(conversation_store.get_conversation, session_id)
    if conv is None:
        raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)
    if not conv.workspace:
        raise AgentMeowError(
            "Session has no workspace path configured",
            code=ErrorCode.INVALID_INPUT,
        )
    workspace = conv.workspace

# AFTER:
from pydantic import BaseModel

class ScanWorkspaceRequest(BaseModel):
    """Optional path override for the workspace scan."""
    path: str | None = None
    model_config = ConfigDict(extra="forbid")

@router.post("/sessions/{session_id}/resources/scan-workspace")
async def scan_workspace(
    request: Request,
    session_id: str,
    body: ScanWorkspaceRequest | None = None,
) -> dict[str, Any]:
    # ...
    user_id = get_user_id(request, auth_provider)
    await _require_session_access(user_id, session_id)
    created_by = attribution_user(user_id)

    conv = await asyncio.to_thread(conversation_store.get_conversation, session_id)
    if conv is None:
        raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    # Use the path from the request body if provided, otherwise fall back
    # to the session's workspace. This lets the FilesPanel scan any folder
    # the user picks, not just the session's original workspace.
    workspace = (body.path if body and body.path else conv.workspace)
    if not workspace:
        raise AgentMeowError(
            "No workspace path: provide a 'path' in the request body or "
            "configure the session's workspace.",
            code=ErrorCode.INVALID_INPUT,
        )
```

**Security**: The path must be validated against the host's filesystem. Add
a check that the path exists and is a directory (the existing code already
does `os.path.isdir(workspace)`). For external hosts, the path is on the
host's filesystem, not the server's — the scan runs over the host tunnel.
Keep the existing `os.path.isdir` check for local hosts; for external hosts,
the host daemon handles the path validation.

**Verify**: `uv run pytest tests/server/routes/test_workspace_scan.py -q` → all pass

### Step 2: Send the path in the scan request from the frontend

In `web/src/lib/workspaceScanApi.ts`, modify `scanWorkspace` to accept an
optional `path` parameter and send it in the request body:

```typescript
// BEFORE:
export async function scanWorkspace(
  conversationId: string,
): Promise<WorkspaceScanResult> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/scan-workspace`,
    { method: "POST" },
  );

// AFTER:
export async function scanWorkspace(
  conversationId: string,
  path?: string,
): Promise<WorkspaceScanResult> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/scan-workspace`,
    {
      method: "POST",
      headers: path ? { "Content-Type": "application/json" } : undefined,
      body: path ? JSON.stringify({ path }) : undefined,
    },
  );
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "workspaceScanApi"` → no errors

### Step 3: Pass the path through useScanWorkspace

In `web/src/hooks/useScanWorkspace.ts`, update the mutation to accept and
pass the path:

```typescript
// BEFORE:
export function useScanWorkspace() {
  const qc = useQueryClient();
  return useMutation<
    WorkspaceScanResult,
    Error,
    { conversationId: string }
  >({
    mutationFn: ({ conversationId }) => scanWorkspace(conversationId),

// AFTER:
export function useScanWorkspace() {
  const qc = useQueryClient();
  return useMutation<
    WorkspaceScanResult,
    Error,
    { conversationId: string; path?: string }
  >({
    mutationFn: ({ conversationId, path }) => scanWorkspace(conversationId, path),
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "useScanWorkspace"` → no errors

### Step 4: Pass the typed path from SharedFolderSelector

In `web/src/shell/SharedFolderSelector.tsx`, update `handleScan` to pass the
typed path:

```typescript
// BEFORE (line ~75):
scan.mutate(
  { conversationId },
  {

// AFTER:
scan.mutate(
  { conversationId, path: trimmed },
  {
```

Also update the comment at line 38-46 to reflect that the path IS now sent
to the server:

```typescript
// The scan-workspace endpoint accepts an optional `path` in the request
// body. If provided, the server scans that path instead of the session's
// workspace. This lets the user pick any folder to scan, not just the
// session's original workspace. The path is also persisted in localStorage
// for quick access to recently used folders.
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "SharedFolderSelector"` → no errors

### Step 5: Update SharedFolderSelector tests

In `web/src/shell/SharedFolderSelector.test.tsx`, update the test mock to
expect the `path` parameter in the scan call:

```typescript
// Update the mock to verify the path is passed:
scan.mutate({ conversationId: "test-conv", path: "/some/path" });
```

**Verify**: `cd web && node node_modules/vitest/vitest.mjs run src/shell/SharedFolderSelector.test.tsx` → all pass

### Step 6: Add a backend test for the path parameter

In `tests/server/routes/test_workspace_scan.py` (or create it if it doesn't
exist), add a test that verifies the scan endpoint accepts a `path` in the
request body and scans that path:

```python
async def test_scan_with_path_override(client, mock_conv):
    """Scan-workspace accepts a path override in the request body."""
    response = await client.post(
        "/v1/sessions/test-conv/resources/scan-workspace",
        json={"path": "/tmp/test-workspace"},
    )
    assert response.status_code == 200
    # Verify the scan used /tmp/test-workspace, not mock_conv.workspace
```

**Verify**: `uv run pytest tests/server/routes/test_workspace_scan.py -q` → all pass

### Step 7: Rebuild SPA

```bash
cd web && npx vite build
```

**Verify**: Build succeeds with "built in Xs" and no errors.

## Test plan

- **Backend test**: `tests/server/routes/test_workspace_scan.py` — verify
  the scan endpoint accepts a `path` in the request body and scans that path
  instead of `conv.workspace`. Also verify backward compatibility: when no
  `path` is provided, it falls back to `conv.workspace`.
- **Frontend test**: `web/src/shell/SharedFolderSelector.test.tsx` — verify
  the typed path is passed to `scan.mutate({ conversationId, path })`.
- **Manual verification**: In the browser, type a different folder path in
  the FilesPanel path input → click Scan → verify the scan results reflect
  the typed path, not the session's original workspace.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `uv run pytest tests/server/routes/test_workspace_scan.py -q` exits 0
- [ ] `cd web && node node_modules/vitest/vitest.mjs run src/shell/SharedFolderSelector.test.tsx` exits 0
- [ ] `cd web && npx tsc -b` exits 0 (or only pre-existing errors)
- [ ] `grep -rn "path.*trimmed\|path.*body" web/src/shell/SharedFolderSelector.tsx web/src/lib/workspaceScanApi.ts` returns matches
- [ ] `grep -rn "body.path" agent_meow/server/routes/workspace_scan.py` returns a match
- [ ] SPA build succeeds (`npx vite build`)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
  (the codebase has drifted since this plan was written).
- The scan-workspace endpoint already accepts a `path` parameter (someone
  already added it — verify it's wired correctly before proceeding).
- The `os.path.isdir` check fails for external hosts (the path validation
  may need to be host-aware — check `designs/SESSION_WORKSPACE_SELECTION.md`
  for the host tunnel path resolution pattern).
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file.

## Maintenance notes

- **Future: AI file management features**: The user mentioned vision models
  sorting/classifying photos. This requires the scan endpoint to not just
  import files but also trigger AI analysis (e.g., image classification,
  document summarization). This is a separate feature — the current plan
  only fixes the path issue so the scan actually scans the right folder.
  Future work: add a `POST /v1/sessions/{id}/resources/analyze` endpoint
  that triggers AI analysis on scanned files (vision models for images,
  LLM for documents).
- **Future: Workspace switching**: The current design sets the workspace at
  session creation and doesn't allow changing it. A future feature could
  allow workspace switching via `PATCH /v1/sessions/{id}` with a `workspace`
  field — but this requires re-binding the runner to the new workspace,
  which is a complex operation. The current plan avoids this by letting the
  scan endpoint accept a path directly, without changing the session's
  workspace.
- **Reviewer should scrutinize**: the security of the `path` parameter —
  ensure the path cannot escape the host's filesystem boundaries (path
  traversal). The existing `os.path.isdir` check is necessary but may not
  be sufficient for external hosts.
