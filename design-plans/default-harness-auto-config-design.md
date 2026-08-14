# Default Harness & Host Auto-Configuration — Design Spec

**Date:** 2026-08-14
**Status:** Draft
**Depends on:** `designs/SERVER_LOCAL_HOST.md`, `design-plans/server-local-host-plan.md`

## Problem

The landing screen requires the user to manually select:

1. Host (wait for connection, pick from dropdown)
2. Working directory (pick from file browser)
3. Worktree (optional, usually "No worktree")
4. Agent/harness (pick from dropdown)

For a shipped Electron desktop app, this is unnecessary friction. The app should "just work" with sensible defaults.

## Solution: Mode-Dependent UI (Option C)

### Single-User Mode (`OMNIGENT_LOCAL_SINGLE_USER=1`)

- **Hide** the host/workdir/worktree/agent selectors from the landing screen
- **Auto-configure:**
  - Host: the local self-registered host (server spawns it on startup per `server-local-host-plan.md`)
  - Working directory: user's home directory (`~`) or last-used directory
  - Worktree: none (not needed for single-user)
  - Agent: `hermes-gateway` (hardcoded as the primary harness)
- The "Start session" button is **always enabled** (no dropdowns to block it)
- The voice paw-mic works immediately
- A small "Advanced" toggle can reveal the selectors for power users

### Multi-User/Cloud Mode (default)

- **Show** all selectors as before
- Auto-fill with last-used choices (existing localStorage persistence)
- User must explicitly select host/agent to start a session

## Architecture

### Frontend changes (`web/src/shell/NewChatDialog.tsx`)

```typescript
// New: check if we're in single-user mode
const isSingleUser = useCapabilities().data?.local_single_user ?? false;

// In single-user mode:
// - Skip host selection UI (use auto-detected local host)
// - Skip workdir selection (use home dir or last-used)
// - Skip agent selection (use hermes-gateway)
// - "Start session" button is always enabled
// - Show minimal landing: just the text input + paw-mic + Start button

// In multi-user mode:
// - Show all selectors as before
// - Auto-fill from localStorage preferences
```

### Backend changes

The `server-local-host-plan.md` already defines the server-side self-host:

- Server spawns `omnigent host` as a child process on startup
- Host connects via WebSocket tunnel
- Host is immediately available — no "connect a host" CTA

### Default agent registration

Ensure `hermes-gateway` agent is always registered:

- The Hermes agent is configured in the server's agent registry
- In single-user mode, it's the only agent (no others needed)
- The frontend auto-selects it without showing a dropdown

### Default working directory

- Use `os.path.expanduser("~")` (user's home directory) as the default
- Persist the last-used directory in localStorage for subsequent sessions
- In single-user mode, don't show the workdir selector at all

## Implementation Plan

### Phase 1: Capability detection (frontend)

- Add `local_single_user` to the capabilities API response
- Create a `useSingleUserMode()` hook
- Gate the selector UI visibility on this flag

### Phase 2: Auto-fill defaults (frontend)

- When `isSingleUser`, auto-select:
  - First available host (the self-registered local host)
  - Hermes-gateway agent (by name lookup)
  - Home directory as workdir
- "Start session" becomes enabled immediately when host is online

### Phase 3: Server self-host (backend)

- Implement `design-plans/server-local-host-plan.md`
- Server spawns `omnigent host` on startup in single-user mode
- Host is ready before the browser loads

### Phase 4: Simplified landing UI (frontend)

- In single-user mode, show a simplified landing:
  - "What should we do?" heading
  - Paw-mic voice button (as-is)
  - Text input (as-is)
  - "Start session" button (always enabled)
  - Surface cards (Images/Videos/Docs) — enabled when runner is online
  - **No** host/workdir/worktree/agent selectors
- Optional "Advanced settings" collapsible for power users

## Key Files to Modify

| File                                       | Change                                    |
| ------------------------------------------ | ----------------------------------------- |
| `web/src/shell/NewChatDialog.tsx`          | Gate selector UI on `isSingleUser`        |
| `web/src/hooks/useCapabilities.ts`         | Add `local_single_user` capability        |
| `web/src/lib/hostPreferences.ts`           | Auto-select first host in single-user     |
| `web/src/lib/harnessPreferences.ts`        | Auto-select hermes-gateway in single-user |
| `agent_meow/server/local_host.py`          | New: spawn local host on startup          |
| `agent_meow/server/routes/capabilities.py` | Add `local_single_user` to response       |

## Success Criteria

1. In single-user mode, the landing screen shows **no selectors** — just the text input, paw-mic, and Start button
2. "Start session" is enabled as soon as the local host connects (within 2s of page load)
3. Voice surface works immediately (paw-mic → STT → LLM → TTS)
4. Surface cards (Images/Videos/Docs) are clickable when runner is online
5. In multi-user mode, all selectors are visible as before (no regression)
