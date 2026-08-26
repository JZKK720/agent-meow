# Plan 033: Frontend Bridges + CSS Variables + IPC Channels + HTTP Headers

**Written against commit**: `a49b4479f` (2026-08-26)
**Depends on**: Plan 031 (server contract names), Plan 032 (env vars)
**Blocks**: Plan 034
**Effort**: L (Large) — ~60 files, ~500 replacements
**Risk**: Medium — cross-layer contract changes, storage key migration

---

## Goal

Rename all `omnigent*` references in the frontend (`web/src/`) to `agentMeow*` / `agent-meow*`: JS bridge globals, CSS variables, function/type names, IPC channel names, HTTP headers, storage keys, and user-facing strings.

## Why this matters

The frontend has ~267 "omnigent" references across 59 files. The JS bridge globals (`window.omnigentDesktop`, `window.omnigentNative`) are cross-layer contracts with the Electron preload scripts. CSS variables (`--omnigent-*`) are set by native bridges and consumed in inline styles. The `X-Omnigent-Client` HTTP header is a server telemetry contract.

## Files in scope

### JS bridge globals (~45 sites)
- `window.omnigentDesktop` → `window.agentMeowDesktop` (Electron bridge)
- `window.omnigentNative` → `window.agentMeowNative` (iOS/Android bridge)
- `window.omnigentSetup` → `window.agentMeowSetup` (setup page bridge)
- `window.omnigentFind` → `window.agentMeowFind` (find bar bridge)
- `window.omnigentUrl` → `window.agentMeowUrl` (URL helpers)
- `window.omnigentUpdateOverlay` → `window.agentMeowUpdateOverlay`

**Cross-layer**: Must rename in lockstep across `web/electron/src/preload.js`, `web/electron/src/find_preload.js`, `web/electron/src/update_overlay_preload.js`, `web/electron/setup/index.html`, `web/electron/find/index.html`, and all web consumers + test mocks.

### CSS variables (46 sites)
- `--omnigent-header-height` → `--agent-meow-header-height`
- `--omnigent-safe-top` → `--agent-meow-safe-top`
- `--omnigent-safe-bottom` → `--agent-meow-safe-bottom`
- `--omnigent-native-top-bar` → `--agent-meow-native-top-bar`
- `--omnigent-native-bottom-bar` → `--agent-meow-native-bottom-bar`
- `--omnigent-top-bar-visible` → `--agent-meow-top-bar-visible`
- `--omnigent-bottom-bar-visible` → `--agent-meow-bottom-bar-visible`
- `--omnigent-android-switcher-margin` → `--agent-meow-android-switcher-margin`
- `--omnigent-android-switcher-height` → `--agent-meow-android-switcher-height`
- `--omnigent-android-safe-area-top` → `--agent-meow-android-safe-area-top`
- `--omnigent-android-safe-area-bottom` → `--agent-meow-android-safe-area-bottom`
- `--omnigent-inset-top` → `--agent-meow-inset-top`
- `--omnigent-inset-bottom` → `--agent-meow-inset-bottom`
- `--omnigent-viewport-height` → `--agent-meow-viewport-height`

**Note**: CSS variables set by native bridges (via `omnigentNative` → `agentMeowNative`) must be updated in the bridge injection code too.

### Function/type names (~45 sites)
- `OmnigentHostConfig` → `AgentMeowHostConfig` (interface in `web/src/lib/host.ts`)
- `setOmnigentHostConfig` → `setAgentMeowHostConfig`
- `getOmnigentHostConfig` → `getAgentMeowHostConfig`
- `getOmnigentUserSearch` → `getAgentMeowUserSearch`
- `getOmnigentTransformShareLink` → `getAgentMeowTransformShareLink`
- `OmnigentApp` → `AgentMeowApp` (component in `web/src/embed.tsx`)
- `OmnigentAppProps` → `AgentMeowAppProps`
- `OmnigentProviders` → `AgentMeowProviders`
- `parseOmnigentDeepLink` → `parseAgentMeowDeepLink` (in `deepLink.js` — Plan 034)

### IPC channels (~80 sites)
All `omnigent:*` IPC channel strings → `agent-meow:*` in:
- `web/electron/src/main.js` (handlers)
- `web/electron/src/preload.js` (sends/on)
- `web/electron/src/browserIpc.js`
- `web/electron/src/desktop_updater.js`
- `web/electron/src/update_overlay.js`
- `web/electron/src/update_overlay_preload.js`
- All test files

### HTTP header (4 sites)
- `X-Omnigent-Client` → `X-Agent-Meow-Client` in `web/src/lib/sessionsApi.ts`
- **Server contract**: The server must also accept the new header name. Update `agent_meow/server/` to read `X-Agent-Meow-Client` (with fallback to `X-Omnigent-Client`).

### Storage keys (4 sites) — migration needed
- `omnigent:recent-harnesses` → `agent-meow:recent-harnesses` (localStorage)
- `omnigent.web.panel-key:*` → `agent-meow.web.panel-key:*` (sessionStorage)

**Migration**: On app load, check for old keys and migrate to new names:
```typescript
function migrateStorageKey(oldKey: string, newKey: string, storage: Storage) {
  const val = storage.getItem(oldKey);
  if (val !== null) {
    storage.setItem(newKey, val);
    storage.removeItem(oldKey);
  }
}
```

### User-facing strings (~12 sites)
- `web/src/pages/SettingsPage.tsx`: "The Omnigent command-line tool..." → "The agent-meow command-line tool..."
- `web/electron/src/main.js`: "Locate the Omnigent CLI binary" → "Locate the agent-meow CLI binary"
- `web/electron/src/main.js`: "The omnigent CLI was not found..." → "The agent-meow CLI was not found..."
- `web/electron/package.json`: `NSMicrophoneUsageDescription` → "agent-meow uses the microphone..."
- `web/electron/overlay/update-overlay.html`: `<title>Omnigent Update</title>` → `<title>agent-meow Update</title>`

### Other
- `mcp__omnigent__` → `mcp__agent_meow__` tool prefix in `BlockRenderer.tsx` (server contract — update server too)
- `omnigent-pcm16-downsampler` AudioWorklet name → `agent-meow-pcm16-downsampler` (must match registration + instantiation in `dictation.ts`)
- `omnigent.fork.source_id` / `omnigent.closed` label keys → `agent_meow.fork.source_id` / `agent_meow.closed` (server contract)
- `omnigent.policies.*` handler namespace → `agent_meow.policies.*` (server contract)
- `omnigent-worktree-branch` input name → `agent-meow-worktree-branch`

## Files explicitly OUT of scope
- `web/electron/src/deepLink.js` function name `parseOmnigentDeepLink` — Plan 034 (Electron shell)
- `web/electron/src/omnigent_cli.js` module rename — Plan 034
- `web/electron/src/main.js` deep-link argv parsing — already fixed in Option B
- `omnigent/__init__.py` compat shim — Plan 034

## Steps

### Step 1: Rename CSS variables in `web/src/index.css`
Global find-replace `--omnigent-` → `--agent-meow-` in `index.css` + all `var(--omnigent-*)` references in `.tsx` inline styles + `ui/dialog.tsx`.

### Step 2: Rename JS bridge globals
Rename in `web/src/lib/nativeBridge.ts` first (detection + API), then update all consumers:
- `web/src/shell/AppShell.tsx`
- `web/src/hooks/useBrowserAgentRelay.ts`
- `web/src/components/BrowserPane/BrowserPane.tsx`
- `web/src/update-overlay.tsx`
- All test mocks

### Step 3: Rename function/type names in `web/src/lib/host.ts` + `web/src/embed.tsx`
Then update all consumers (`identity.ts`, `SessionImage.tsx`, `PermissionsModal.tsx`, `NewChatDialog.tsx`, `useUserSearch.ts`, etc.).

### Step 4: Rename IPC channels
Global find-replace `omnigent:` → `agent-meow:` in IPC channel strings across `main.js`, `preload.js`, `browserIpc.js`, `desktop_updater.js`, `update_overlay.js`, `update_overlay_preload.js`, and all test files.

### Step 5: Rename HTTP header
`X-Omnigent-Client` → `X-Agent-Meow-Client` in `sessionsApi.ts`. Update server-side header reading in `agent_meow/server/` with fallback.

### Step 6: Storage key migration
Add a migration utility that runs on app load, copies old `omnigent:*` storage keys to `agent-meow:*`, and deletes the old keys.

### Step 7: User-facing strings
Update all user-visible "Omnigent" / "omnigent" strings to "agent-meow".

### Step 8: Server contract updates
Update `agent_meow/server/` to accept new names for:
- `X-Agent-Meow-Client` header (with `X-Omnigent-Client` fallback)
- `mcp__agent_meow__` tool prefix (with `mcp__omnigent__` fallback)
- `agent_meow.fork.source_id` / `agent_meow.closed` label keys (with old fallback)
- `agent_meow.policies.*` handler namespace (with old fallback)

## Verification gates

1. `cd web && npm run type-check` → no TypeScript errors
2. `cd web && npm test` → all vitest tests pass
3. `cd web/electron && node --test test/*.test.js` → all Electron tests pass
4. `grep -ri "omnigent" web/src/ | grep -v node_modules | grep -v ".test."` → 0 results (excluding tests, which may keep legacy aliases)
5. Manual: load the web UI, verify CSS layout still works (safe areas, header height)
6. Manual: verify `window.agentMeowDesktop` is defined in Electron context

## Escape hatches

- If CSS variable rename breaks layout, the native bridge may still be setting `--omnigent-*`. Update the bridge injection in `preload.js` to set BOTH old and new names during the transition.
- If storage key migration orphans data, add a one-time migration on app load that checks both old and new keys.
- If IPC channel rename breaks Electron↔web communication, the preload and main must be updated in the SAME commit — a partial rename breaks the bridge.

## Maintenance note

The server-side fallbacks for old header/label/policy names should be removed in Plan 034 (or a later cleanup). The storage key migration is one-way — once old keys are deleted, there's no rollback. Test on a fresh browser profile first.