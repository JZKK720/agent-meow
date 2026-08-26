# Agent guidance

Guidance for AI agents (Claude Code, Copilot, Cursor, etc.) working in this
repository. See `CONTRIBUTING.md` for the full contributor workflow.

## Committing

Run the `pre-commit` hook before committing (`pre-commit run --all-files`, or
let it run on staged files via `git commit`). Fix any issues it reports so the
commit lands clean — CI runs the same checks.

## Pull requests

When you open a pull request, fill in the repo's PR template at
`.github/pull_request_template.md` (case-sensitive on Linux — note the lowercase
filename). Keep every section and checkbox row so reviewers can skim them.

- **Summary** — what changed and why.
- **Test Plan** — how you verified it.
- **Demo** — a **video or images** showing the change. Expected on contributor
  PRs for UI / frontend changes (check the "UI / frontend change" box under
  *Type of change*) so reviewers can see the new behaviour without checking out
  the branch. Use `N/A` for non-visual changes.
- **Type of change** / **Test coverage** — check all that apply (at least one
  each).
- **Coverage notes** — required if you checked "Manual verification completed"
  or "Not applicable".

Generate the description from the actual diff and this session's context — lead
with the motivation, then the change. Don't pass a `--body` that skips these
sections.

## Finishing a task

When you finish a task, print instructions to the user on how to test it: the
commands to run, the inputs to provide, or the steps to reproduce so they can
verify the result themselves. Don't leave the user guessing how to confirm the
work — tell them exactly what to do.

## Deprecating features

When deprecating a feature, note the version in which it is expected to be
removed so we can clean it up when that version ships. Call out the deprecation
version in code (e.g. a `@deprecated` tag or comment naming the target release)
and in the PR/commit description, so there's a clear marker to act on later.

## Code comments

Keep comments short and focused on the code, not on the change history.

- **Keep them brief** — prefer one or two lines. Avoid comments longer than
  three lines; if you need more, the code likely needs refactoring or a doc
  string, not a wall of inline commentary.
- **Describe the scenario, not the PR** — explain *what* the code handles or
  *why* it exists, in terms a future reader needs. Don't reference PR numbers,
  issue numbers, or ticket IDs (e.g. `#1646`, `fixes JIRA-123`); the scenario
  should be clear without chasing external links.

## Framework-owned instructions

Keep runtime lifecycle and metadata instructions separate from portable agent
instructions:

- Agent-spec and per-request instructions are user-authored. Framework-owned
  instructions are additive runtime behavior and are appended after them in
  `omnigent/runtime/prompt.py`.
- Keep the canonical instruction text and lifecycle gate in the owning framework
  module. Harness adapters should only transport the composed instructions; do
  not duplicate policy across adapters or add lifecycle metadata to `AgentSpec`.
- If framework instructions grow beyond a small ordered list, introduce a
  structured `FrameworkInstructions` value at the prompt-composition boundary.

## Stage log — v0.9.0 Electron + voice + HTML artifact fixes

**Commit**: `e834fca2` (on `origin/main`, fast-forward from `43b724a5`)
**Date**: 2026-08-26
**Branch**: `fix/electron-vad-html-voice` (merged to main)

### What was done (3 fixes, 6 files, +171/-83 lines)

#### Fix 1: VAD permanently blocked in Electron
- **Root cause**: Electron's default autoplay policy
  (`document-user-activation-required`) blocks `AudioContext.resume()` without
  a user gesture. The Silero VAD creates an AudioContext on `connect()` and
  `resume()` fails silently → mic permanently blocked. Chrome/Edge grant audio
  activation with `getUserMedia`; Electron does not.
- **Fix**: `autoplayPolicy: "no-user-gesture-required"` in main window
  `webPreferences` (`web/electron/src/main.js`).
- **Tests**: existing popupPolicy tests still pass (20/20).

#### Fix 2: Agent-generated HTML artifacts (games) can't open in new tab
- **Root cause**: `openHtmlArtifactInNewTab()` calls
  `window.open("about:blank", "_blank")` but Electron's `popupPolicy.js`
  `decideWindowOpen()` only allowed `http:`/`https:`/`mailto:` schemes.
  `about:blank` fell through to `protocol-consent` → blocked.
- **Fix**: Added `about:blank` exemption in `decideWindowOpen()` — returns
  `{kind: "popup"}`. The artifact still runs in a sandboxed opaque-origin
  iframe, so security is preserved.
- **File**: `web/electron/src/popupPolicy.js`
- **Tests**: 2 new tests in `web/electron/test/popupPolicy.test.js` (20/20
  pass).

#### Fix 3: Voice session creates duplicate conversations on reconnect
- **Root cause**: `useRealtimeVoice.connect()` called `createSession()` on
  every connect, even when the hook still held a valid `sessionId`. When the
  transport dropped and reconnected, the old session's queued turn ran in the
  background while the new command opened a new session ("second voice task
  in new window").
- **Fix**: `connect()` now reuses `voiceSessionIdRef` if set, skipping
  `createSession` and re-binding the existing session to the transport.
- **File**: `web/src/hooks/useRealtimeVoice.ts`
- **Tests**: 1 new regression test + fixed stale `postEvent` test + added
  `setAgentMeowSession` to mock transport (20/20 pass).

#### Also: ChatPage voice command auto-submit
- ChatPage's `onHermesVoice` toggled voice but didn't auto-submit
  `voiceCommand` — dictated text sat in the composer requiring manual Send.
- Added `voiceCommand` auto-submit effect in ChatPage Composer (mirrors
  NewChatDialog's behavior). Uses `submitRef` pattern to avoid
  use-before-declaration.
- **File**: `web/src/pages/ChatPage.tsx`

### Remaining action items (for the next agent)

| # | Action | Why | How |
|---|--------|-----|-----|
| 1 | **Rebuild Electron app** | The `app.asar` must be repackaged with the `autoplayPolicy` fix and `about:blank` popup exemption. Source changes are committed but the installed Electron app still runs the old 0.8.1 binary. | `cd web/electron && npm run build:win` then reinstall |
| 2 | **Restart backend server** | The running server process predates the SPA rebuild (version `4c2557a1`) and the SDK "No user message" fix (already in source at `agent_meow/inner/openai_agents_sdk_executor.py`). | Kill the `:6767` process, then `.venv\Scripts\python.exe -m agent_meow server start` |
| 3 | **Restart TTS server** | The running TTS process predates the punctuation sanitization fix from the prior session. | Kill `:8891`/`:8892`, restart `scripts/qwen3_tts_server.py` or `tts-server.exe` |
| 4 | **Configure image gen provider** | `image_generate` returns "no provider configured" error → the LLM agent decides to install ComfyUI itself. Set `IMAGE_GEN_PROVIDER` env var. | `IMAGE_GEN_PROVIDER=dashscope DASHSCOPE_API_KEY=<key>` or `fal`/`a1111`/`hosted` |
| 5 | **Add agent policy: no package installs** | The agent's system prompt should prohibit installing packages without approval. The `image_generate` error message triggers the agent to `pip install comfyui`. | Add to agent system prompt or `policies/` config |

### Known issues NOT yet fixed

| Issue | Status | Notes |
|-------|--------|-------|
| Wake-free voice (免唤醒) | Blocked by Fix 1 | Wake word mode requires VAD to be connected. Fix 1 unblocks VAD in Electron, but wake word still requires manual toggle of the wake word chip. True always-on would need auto-start on app launch. |
| TTS mid-sentence pause | Partially fixed | `sanitizeForTts()` strips unspeakable punctuation (prior session). If still happening after TTS restart, check sentence splitting — short first sentences create TTS gaps. |
| SPA/Electron version drift | Structural | The SPA is rebuilt from source (`npm run build`) but the Electron shell is a separate build (`npm run build:win`). No automated version sync exists. Both must be rebuilt and deployed together. |

### Test verification

```
popupPolicy:       20/20 pass  (web/electron, node --test)
useRealtimeVoice:  20/20 pass  (web, vitest)
codeViewerHelpers: 108/108 pass (web, vitest)
TypeScript:        tsc -b clean
SPA build:         succeeded, version 4c2557a1
```

### Key files changed

| File | Lines | Change |
|------|-------|--------|
| `web/electron/src/main.js` | +7 | `autoplayPolicy` in webPreferences |
| `web/electron/src/popupPolicy.js` | +8 | `about:blank` exemption |
| `web/electron/test/popupPolicy.test.js` | +20 | 2 new tests |
| `web/src/hooks/useRealtimeVoice.ts` | +127/-83 | Session reuse on reconnect |
| `web/src/hooks/useRealtimeVoice.test.ts` | +66/-50 | Mock fix + stale test fix + regression test |
| `web/src/pages/ChatPage.tsx` | +26 | voiceCommand auto-submit |

## Stage log — v0.9.1 Rebrand completion + voice pipeline rebuild

**Commit**: uncommitted (on `main`, HEAD `7a652ae42`)
**Date**: 2026-08-26
**Branch**: `main` (fork `JZKK720/agent-meow`)

### What was done (4 functional rebrand fixes + full rebuild)

#### Fix 1: Electron env vars OMNIGENT_* → AGENT_MEOW_*
- **Root cause**: Electron source read `process.env.OMNIGENT_DATA_DIR`,
  `OMNIGENT_CONFIG_HOME`, `OMNIGENT_BUILTIN_AGENT_DIRS` while Python
  already used `AGENT_MEOW_*`. A user setting `AGENT_MEOW_DATA_DIR`
  would be invisible to the Electron shell.
- **Fix**: Primary reads changed to `AGENT_MEOW_*` with `|| OMNIGENT_*`
  backward-compat fallback for pre-rebrand envs.
- **Files**: `web/electron/src/agent_meow_cli.js`, `web/electron/src/main.js`

#### Fix 2: Stale omnigent packages in embedded Python (blocked)
- **Root cause**: `C:\Program Files\agent-meow\...\site-packages\` had both
  `omnigent*` 0.9.1 AND `agent-meow*` 0.9.1 installed. The `omnigent*`
  packages are compat shims (`import omnigent` → `agent_meow/__init__.py`).
- **Status**: Cannot remove — Program Files is read-only, `pip uninstall`
  fails with `PermissionError [WinError 5]`. No functional impact (shims
  resolve correctly). Requires admin elevation to clean up.

#### Fix 3: DB migration self-rename bug
- **Root cause**: Migration `z10a3b4c5d6e` called
  `op.rename_table("agent_meow_conversation_metadata", "agent_meow_conversation_metadata")`
  — renaming a table to itself. The old name `omnigent_conversation_metadata`
  had been rebranded in the model source but the migration's first arg was
  also changed, making it a no-op that crashes on fresh DBs
  (`sqlite3.OperationalError: there is already another table or index with
  this name`).
- **Fix**: Migration now checks if `omnigent_conversation_metadata` exists
  and only renames when the old table is present and the new one isn't.
  No-op on fresh DBs where the model already creates `agent_meow_*`.
- **File**: `agent_meow/db/migrations/versions/z10a3b4c5d6e_rename_omnigent_to_agent_meow_metadata.py`

#### Fix 4: Default data dir ~/.omnigent → ~/.agent-meow
- **Root cause**: `_local_data_dir()` in `local_server.py` and
  `_omnigent_persistent_dir()` in `chat.py` both defaulted to
  `Path.home() / ".omnigent"` when `AGENT_MEOW_DATA_DIR` was not set.
  Server wrote logs, DB, and pidfiles to `~/.omnigent/`.
- **Fix**: Both now default to `Path.home() / ".agent-meow"`.
- **Files**: `agent_meow/host/local_server.py`, `agent_meow/chat.py`

### Rebuild + reinstall performed

| Step | Command | Result |
|------|---------|--------|
| Reinstall Python package | `pip install --user --no-deps --no-build-isolation .` | agent-meow 0.9.1 installed to user site |
| Reinstall SDKs | `pip install --user --no-deps --no-build-isolation sdks/python-client sdks/ui` | agent-meow-client + agent-meow-ui-sdk 0.9.1 |
| Rebuild SPA | `cd web && npm run build` | Built in 4.55s, 0 omnigent refs |
| Rebuild Electron | `cd web/electron && npm run build:win` | `dist-clean/agent-meow Setup 0.9.1.exe` (287MB), 0 omnigent in app.asar |
| Delete old DBs | Removed `~/.omnigent/chat.db`, `~/.agent-meow/chat.db` | Fresh DB created at `~/.agent-meow/chat.db` |
| Restart server | `python -m agent_meow server start` | Running at `:6767`, logs at `~/.agent-meow/logs/` |

### Endpoint verification (all 6 pass)

| Endpoint | HTTP | Detail |
|----------|------|--------|
| `GET /health` | 200 | `{"status":"ok"}` |
| `GET /v1/stack/status` | 200 | `whisper_stt: {status:"ok"}`, `tts: {status:"ok"}` |
| `GET /v1/hosts` | 200 | `{"hosts":[]}` (fresh DB) |
| `GET /v1/sessions` | 200 | Empty list |
| `POST /v1/audio/speech` | 200 | 46,124 bytes (Serena voice) |
| `POST /v1/audio/transcriptions` | 200 | `{"text":" Hello Word!\n"}` (round-trip) |

### Uncommitted changes (5 source files + SPA bundle)

| File | Change |
|------|--------|
| `agent_meow/host/local_server.py` | Default data dir `.omnigent` → `.agent-meow` |
| `agent_meow/chat.py` | Default persistent dir `.omnigent` → `.agent-meow` |
| `agent_meow/db/migrations/versions/z10a3b4c5d6e_...py` | Migration self-rename fix (conditional) |
| `web/electron/src/agent_meow_cli.js` | Env vars `OMNIGENT_*` → `AGENT_MEOW_*` + fallback |
| `web/electron/src/main.js` | Env var `OMNIGENT_BUILTIN_AGENT_DIRS` → `AGENT_MEOW_*` + fallback |
| `agent_meow/server/static/web-ui/**` | SPA bundle rebuild (74 files, content-hash renames) |
| `agent_meow/_build_info.py` | Build stamp (auto-generated) |

### Remaining rebrand items (cosmetic, no runtime impact)

| Item | Count | Impact |
|------|-------|--------|
| `omnigent` in Python comments/docstrings | ~363 | Cosmetic |
| `OMNIGENT_*` env-var names in comments | ~341 | Cosmetic |
| Internal Python constants (`OMNIGENT_EXECUTOR_TYPE`, etc.) | ~25 | Internal, not user-facing |
| `_OmnigentYamlLoader`, `_OmnigentToolCompleteHook` class names | 2 | Internal |
| Stale `omnigent*` packages in system site-packages | 3 | Need admin to remove |
| `omnigent` in web/src test fixtures (folder names in test data) | ~20 | Test data, not code |
