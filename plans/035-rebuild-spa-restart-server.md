# Plan 035: Rebuild SPA + restart server with voice fixes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

> **Drift check (run first)**: `git diff --stat e09d5542..HEAD -- web/src/lib/hermesVoice.ts web/src/lib/dictation.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / build
- **Planned at**: commit `e09d5542`, 2026-08-31

## Why this matters

Two voice-pipeline fixes are committed to source (`e09d5542`) but **not yet
in the running SPA bundle** (still at version `39002815`). Until the SPA is
rebuilt and the server restarted, the running app does not have the TTS
engine pinning fix (double-voice) or the dictation WS guard (garbage
transcripts on navigation). Every subsequent voice fix (plans 036, 037)
depends on this baseline being live so the fixes can be smoke-tested.

## Current state

- **HEAD**: `e09d5542` ("fix(voice): pin TTS engine per turn + drop trailing
  dictation WS events")
- **SPA bundle version**: `39002815` (OLD — `agent_meow/server/static/web-ui/version.json`)
- **Working tree**: 159 untracked files (leftover SPA bundle assets from a
  plan-039 checkout mishap + temp `.txt` debugging files)
- **Server**: running on port 6767 (PID varies — check with netstat)
- **Voice stack**: whisper STT ok, TTS ok, ollama ok (per `GET /v1/stack/status`)

The two fixes in source (confirmed by reading the code):

1. `web/src/lib/hermesVoice.ts:623` — `private pinnedTtsEngine: "edge" | "qwen" | null = null;`
   (reset at `:1054`, used in `synthesize()` at `:1768-1808`)
2. `web/src/lib/dictation.ts:200` — `if (this.closed) return;` at the top of
   `ws.onmessage`

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `cd web && npx tsc --noEmit` | exit 0, no errors |
| Voice tests | `cd web && npx vitest run src/lib/hermesVoice.test.ts src/lib/dictation.test.ts` | all pass |
| Rebuild SPA | `cd web && npm run build` | build succeeds, 0 errors |
| Health check | `curl -s http://localhost:6767/health` | `{"status":"ok"}` |
| Stack status | `curl -s http://localhost:6767/v1/stack/status` | server/whisper/tts/ollama ok |

## Scope

**In scope**:
- Clean untracked SPA bundle assets from `agent_meow/server/static/web-ui/assets/`
- Rebuild the SPA bundle (`cd web && npm run build`)
- Kill and restart the agent-meow server on port 6767

**Out of scope**:
- Any source code changes (this is a build + restart, not a code fix)
- Merging the `feat/039-file-index-phase0` branch (separate concern)
- Cleaning temp `.txt` files outside `agent_meow/server/static/web-ui/assets/`
  (optional; do not delete `design-plans/` or other legitimate untracked content)
- Running `git clean -fd` without a path — it would delete legitimate untracked
  content. **Always scope it to `agent_meow/server/static/web-ui/assets/`**.

## Git workflow

- No branch, no commit — this plan produces no source changes. The SPA bundle
  is build output, not source.
- If the executor is on `main`, stay on `main`.

## Steps

### Step 1: Verify source state

```powershell
cd C:\Users\K16\github-pr\agent-meow
git rev-parse --short HEAD
```
**Verify**: outputs `e09d5542` (or a descendant — if HEAD has advanced past
`e09d5542`, that's fine as long as the two fix files are still present; run
the drift check at the top of this plan).

### Step 2: Clean untracked SPA bundle assets

```powershell
git clean -fd agent_meow/server/static/web-ui/assets/
```
**Verify**: `git status --short agent_meow/server/static/web-ui/assets/`
returns no output (the directory may be empty or absent — the rebuild
repopulates it).

**STOP if**: `git clean` reports deleting files outside
`agent_meow/server/static/web-ui/assets/` — you ran it without the path
scope. Report immediately.

### Step 3: Typecheck

```powershell
cd web
npx tsc --noEmit
cd ..
```
**Verify**: exit 0, no errors.

### Step 4: Run voice tests

```powershell
cd web
npx vitest run src/lib/hermesVoice.test.ts src/lib/dictation.test.ts
cd ..
```
**Verify**: all tests pass (50 hermesVoice + 2 dictation expected).

### Step 5: Rebuild the SPA

```powershell
cd web
npm run build
cd ..
```
**Verify**: `type agent_meow\server\static\web-ui\version.json` outputs a
JSON object with a `"build"` key whose value is **NOT** `39002815` (it
should be a new hash).

### Step 6: Kill the old server

```powershell
netstat -ano | findstr :6767 | findstr LISTENING
```
Note the PID (last column), then:
```powershell
taskkill /PID <PID> /F
```
**Verify**: `netstat -ano | findstr :6767` returns no LISTENING line.

### Step 7: Restart the server

The server needs the Hermes API key. From the repo root:

```powershell
cd C:\Users\K16\github-pr\agent-meow
$env:HERMES_API_KEY = (Get-Content web\.env | Where-Object { $_ -match 'HERMES_API_KEY=' } | ForEach-Object { ($_ -split '=', 2)[1].Trim() })
.venv\Scripts\python.exe -m agent_meow server start
```

(If the env-var extraction fails, the key is in `web/.env` under
`HERMES_API_KEY=`. Do NOT print the key value in any log or output.)

**Verify**: wait ~8 seconds, then `curl -s http://localhost:6767/health`
returns `{"status":"ok"}`.

### Step 8: Verify the SPA has the voice fixes

```powershell
curl -s http://localhost:6767/version.json
```
**Verify**: the `"build"` value matches the new hash from Step 5.

```powershell
findstr /s "pinnedTtsEngine" agent_meow\server\static\web-ui\assets\index-*.js
```
**Verify**: at least one match (the TTS engine pinning fix is in the bundle).

### Step 9: Verify the voice stack

```powershell
curl -s http://localhost:6767/v1/stack/status
```
**Verify**: `server` ok, `whisper_stt` ok, `tts` ok, `ollama` ok.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run src/lib/hermesVoice.test.ts src/lib/dictation.test.ts` all pass
- [ ] `version.json` has a new build hash (not `39002815`)
- [ ] `findstr /s "pinnedTtsEngine" agent_meow\server\static\web-ui\assets\index-*.js` returns matches
- [ ] `curl -s http://localhost:6767/health` returns `{"status":"ok"}`
- [ ] `curl -s http://localhost:6767/v1/stack/status` shows all services ok
- [ ] No source files modified (`git status --short` shows no tracked-file changes)

## STOP conditions

- HEAD is not `e09d5542` or a descendant (the voice fixes are not in source).
- `tsc --noEmit` reports errors (do not rebuild a broken bundle).
- `npm run build` fails (report the error — do not restart the server with a
  broken bundle).
- The server fails to start or `/health` does not return ok after 15 seconds.
- `findstr` does not find `pinnedTtsEngine` in the rebuilt bundle (the fix
  did not make it into the build — investigate before proceeding).

## Maintenance notes

- After this plan, the running SPA matches source `e09d5542`. Any further
  voice fixes (plans 036, 037) require another rebuild + restart.
- The `feat/039-file-index-phase0` branch is NOT part of this rebuild. Merge
  it separately and rebuild again after validating the voice fixes.
- The Hermes API key in `web/.env` must not be committed or logged. If you
  suspect it has leaked, rotate it.
