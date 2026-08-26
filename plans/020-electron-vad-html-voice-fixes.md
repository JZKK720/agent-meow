# v0.9.0 Electron + Voice + HTML Artifact Fixes — Stage Log

> **Written against commit**: `e834fca2`
> **Status**: COMMITTED to `origin/main`
> **Effort**: Completed (Medium, ~3 hours)
> **Prerequisites**: None — all changes are committed

## Problem

Three blocking issues in the v0.9.0 Electron shell + SPA:

1. **VAD permanently blocked in Electron** — voice activity detection (Silero
   VAD) can't start because Electron's default autoplay policy blocks
   `AudioContext.resume()` without a user gesture. Works in Chrome/Edge but
   not in the Electron wrapper.
2. **Agent-generated HTML artifacts can't open** — `openHtmlArtifactInNewTab()`
   calls `window.open("about:blank", "_blank")` but Electron's popup policy
   only allows `http:`/`https:` schemes. Games and HTML previews are blocked.
3. **Voice session creates duplicate conversations** — `useRealtimeVoice.connect()`
   creates a new session on every call, even on reconnect. Causes "second voice
   task in new window" when the transport drops mid-turn.

## Root cause analysis

### Fix 1: VAD blocked (systematic debugging — Phase 1 evidence)

- `web/electron/src/main.js` has **no `autoplayPolicy` setting** anywhere
- `webPreferences` objects have no `autoplayPolicy` key
- `hermesVoice.ts` line 670: `new AudioContext()` → suspended state
- Line 673-675: `await this.audioContext.resume()` → fails silently in Electron
- Electron default: `document-user-activation-required`
- Chrome/Edge: lenient (getUserMedia grants audio activation); Electron: not

**Fix**: `autoplayPolicy: "no-user-gesture-required"` in main window webPreferences.

### Fix 2: HTML artifact popup blocked

- `web/src/shell/codeViewerHelpers.ts` line 341: `opener.open("about:blank", "_blank")`
- `web/electron/src/popupPolicy.js` line 62: `WEB_SCHEMES = new Set(["http:", "https:", "mailto:"])`
- `about:` not in set → `protocol-consent` → blocked

**Fix**: Added `about:blank` exemption in `decideWindowOpen()`. Security preserved —
artifact runs in sandboxed opaque-origin iframe.

### Fix 3: Duplicate voice sessions

- `useRealtimeVoice.ts` line 321: `createSession()` on every `connect()`
- Line 367-368: `voiceSessionIdRef.current = null` on disconnect
- When transport drops without `disconnect()`, ref stays set but `connect()`
  still creates a new session

**Fix**: `connect()` reuses `voiceSessionIdRef` if set, skipping `createSession`.

## Scope

### In scope
- Electron `autoplayPolicy` setting
- `popupPolicy.js` `about:blank` exemption
- `useRealtimeVoice.ts` session reuse
- `ChatPage.tsx` voice command auto-submit
- Test fixes (stale `postEvent` test, missing mock method, new regression test)

### Out of scope
- Wake-free voice auto-start (requires app launch hook)
- TTS sentence splitting optimization
- Automated SPA/Electron version sync
- Image generation provider configuration
- Agent package-install policy

## Changes

| File | Lines | Change |
|------|-------|--------|
| `web/electron/src/main.js` | +7 | `autoplayPolicy` in webPreferences |
| `web/electron/src/popupPolicy.js` | +8 | `about:blank` exemption in `decideWindowOpen()` |
| `web/electron/test/popupPolicy.test.js` | +20 | 2 new tests for `about:blank` |
| `web/src/hooks/useRealtimeVoice.ts` | +127/-83 | Session reuse on reconnect |
| `web/src/hooks/useRealtimeVoice.test.ts` | +66/-50 | Mock fix + stale test + regression test |
| `web/src/pages/ChatPage.tsx` | +26 | `voiceCommand` auto-submit effect |

## Verification

```
popupPolicy:       20/20 pass  (node --test)
useRealtimeVoice:  20/20 pass  (vitest)
codeViewerHelpers: 108/108 pass (vitest)
TypeScript:        tsc -b clean
SPA build:         succeeded, version 4c2557a1
```

## Remaining action items

| # | Action | Priority | Blocking |
|---|--------|----------|----------|
| 1 | Rebuild Electron app (`npm run build:win`) | Critical | VAD + HTML fixes not live until rebuilt |
| 2 | Restart backend server | Critical | SDK fix + SPA rebuild not live until restarted |
| 3 | Restart TTS server | High | Punctuation sanitization not live until restarted |
| 4 | Configure `IMAGE_GEN_PROVIDER` | Medium | Agent auto-installs ComfyUI without it |
| 5 | Add agent policy: no package installs | Medium | Prevents future auto-install behavior |

## Related plans

- `018-chinese-voice-quality.md` — TTS quality (partially addressed by punctuation fix)
- `019-supervise-tts-server.md` — TTS server supervision (related to restart requirement)
