# Plan 007: Port QAA realtime hook into MeowCat VoicePanel + retire old transport

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ff786767..HEAD -- web/src/shell/VoicePanel.tsx web/src/lib/realtimeVoice.ts web/src/hooks/useRealtimeVoice.ts agent_meow/server/routes/s2s_proxy.py`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/006-install-qaa-gateway-dashscope.md (QAA Gateway must be running)
- **Category**: tech-debt
- **Planned at**: commit `ff786767`, 2026-08-04

## Why this matters

agent-meow's hand-rolled voice transport (`realtimeVoice.ts` + `s2s_proxy.py`)
was hardened in the 2026-08-04 stability pass, but QAA's Gateway already solves
all those problems (auth, reconnect, ownership, close-code propagation) plus
adds voice-ownership/takeover and nonblocking backend-agent capabilities.
Porting QAA's `useRealtimeVoice.js` into the MeowCat `VoicePanel.tsx` shell
preserves the paw-talk button + waveform UI while replacing the fragile
transport underneath. This is the bridge between "QAA works standalone" and
"agent-meow's web UI talks to QAA."

## Current state

- `web/src/shell/VoicePanel.tsx` (~177 lines changed in the 2026-08-04 commit)
  renders the paw-talk mic button + waveform. It imports from
  `web/src/lib/realtimeVoice.ts` for the WebSocket transport.
- `web/src/lib/realtimeVoice.ts` (~221 lines) implements a hand-rolled
  OpenAI Realtime client: AudioContext, ScriptProcessor, PCM playback,
  teardownPromise, close-code handling. Connects to `:8765/v1/realtime`
  (or `:6767` in dev mode).
- `web/src/hooks/useRealtimeVoice.ts` (~8 lines changed) wraps the
  transport in a React hook with state management.
- `agent_meow/server/routes/s2s_proxy.py` (~233 lines) is the FastAPI
  WebSocket proxy. QAA's Gateway replaces it.
- QAA's `web/src/useRealtimeVoice.js` is the target — it speaks QAA's
  `GatewayClientEvent` / `GatewayServerEvent` protocol (NOT raw OpenAI
  Realtime), connects to `ws://127.0.0.1:3101/api/realtime`, and handles
  AudioContext + PCM playback + provider switching.

### Critical protocol difference

QAA's Gateway uses a custom event protocol, not raw OpenAI Realtime:
- Client sends: `{type: "connect", voiceEnabled: true, provider: "dashscope", ...}`
- Server sends: `{type: "audio.delta", ...}`, `{type: "turn.started", ...}`,
  `{type: "voice.state", ...}`, `{type: "gateway.disconnected", ...}`

The existing `realtimeVoice.ts` handles OpenAI events (`session.update`,
`input_audio_buffer.append`, `response.audio.delta`). The port means
**rewriting the event handlers**, not just swapping the WebSocket URL.

### Repo conventions

- Frontend: React + TypeScript + Tailwind + AntD, Vite build.
- Tests: colocated `*.test.ts` / `*.test.tsx`, run with `cd web && npm test`.
- Type check: `cd web && npm run type-check` (tsc -b).
- Lint: `cd web && npm run lint` (oxlint).
- Brand tokens: `web/src/index.css` — all colors via named tokens, no inline hex.
- The MeowCat paw-talk button + waveform visuals are brand identity — preserve them.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Type check | `cd web && npm run type-check` | exit 0, no errors |
| Tests | `cd web && npm test` | all pass |
| Lint | `cd web && npm run lint` | exit 0 |
| Build | `cd web && npm run build` | exit 0, dist/ updated |

## Scope

**In scope** (files you should modify):
- `web/src/shell/VoicePanel.tsx` — rewrite the transport layer under the UI
- `web/src/hooks/useRealtimeVoice.ts` — adapt to QAA's Gateway protocol
- `web/src/hooks/useRealtimeVoice.test.ts` — update tests for the new protocol
- `web/src/lib/realtimeVoice.ts` — retire (delete or empty stub with deprecation comment)
- `agent_meow/server/routes/s2s_proxy.py` — retire (delete or gate behind a flag)
- `agent_meow/server/routes/test_s2s_proxy.py` — retire or update
- `scripts/start-gateway-detached.ps1` — update to start QAA Gateway instead
- `scripts/start-voice-stack.ps1` — update to start QAA + optional S2S

**Out of scope** (do NOT touch):
- `web/src/hooks/useWakeWordDetector.ts`, `useWakeWordReply.ts` — browser-side, independent
- `web/src/components/VoiceWaveform.tsx` — waveform visual, stays as-is
- `web/src/shell/NewChatDialog.tsx` — surface cards, unrelated
- `scripts/start-speech-to-speech*.ps1`, `scripts/start-s2s-*.ps1` — stay for offline mode (Plan 008)
- `agent_meow/server/routes/voicebox_proxy.py` — legacy Voicebox, separate decision

## Git workflow

- Branch: `feat/port-qaa-realtime-hook`
- Commit per step; message style: `feat(voice): <description>` (conventional commits, match repo)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Read QAA's useRealtimeVoice.js and understand the Gateway protocol

Clone or download QAA source: `git clone https://github.com/QwenAudio/qwen-audio-agent.git` (or read online).

Read these files:
- `web/src/useRealtimeVoice.js` — the hook (Gateway client, AudioContext, PCM)
- `shared/realtime-events.mjs` — the `GatewayClientEvent` / `GatewayServerEvent` enums
- `web/src/audio.js` — PCM decode/resample utilities
- `web/src/App.jsx` (lines 600-660) — how the hook is used (provider selection, event handling)

Document the event mapping (old → new) in a comment at the top of the new
`useRealtimeVoice.ts`:
```
// QAA Gateway protocol (replaces raw OpenAI Realtime):
// connect → {type:"connect", voiceEnabled, provider, ...}
// audio in → {type:"audio.append", audio: base64PCM}
// audio out ← {type:"audio.delta", audio: base64PCM}
// turn ← {type:"turn.started", turnId} / {type:"transcript.final", ...}
// state ← {type:"voice.state", state:"idle"|"listening"|"speaking"}
// errors ← {type:"error", message}
// disconnect ← {type:"gateway.disconnected"} → auto-reconnect
```

**Verify**: You can list all GatewayClientEvent and GatewayServerEvent values
from `realtime-events.mjs`.

### Step 2: Create the new useRealtimeVoice.ts (TypeScript port)

Port QAA's `useRealtimeVoice.js` to TypeScript, adapting to agent-meow's
conventions:
- TypeScript types for all events (use a discriminated union for GatewayServerEvent)
- Connect to `ws://127.0.0.1:3101/api/realtime` (configurable via env or prop)
- Support `realtimeProvider` prop ("dashscope" | "speech-to-speech" | "" for default)
- Keep the AudioContext + ScriptProcessor + PCM playback logic from QAA
- Keep the reconnect-with-backoff logic from QAA
- Expose: `state`, `connectionState`, `visualState`, `ownership`, `activateAudio()`,
  `connect()`, `disconnect()`

Keep the existing hook's public API shape as close as possible so
`VoicePanel.tsx` changes are minimal.

**Verify**: `cd web && npm run type-check` exits 0 (no type errors in the new file).

### Step 3: Update VoicePanel.tsx to use the new hook

Change the import from `@/lib/realtimeVoice` to the new `@/hooks/useRealtimeVoice`.
Update event handlers to use QAA's Gateway event types. Keep:
- The paw-talk mic button (same CSS classes, same onClick gesture)
- The waveform visual (same `VoiceWaveform` component)
- The MeowCat IP pattern overlay
- The voice/text mode toggle

Add the provider dropdown (online/offline toggle) — a small pill switch:
```tsx
<div className="voice-mode-toggle">
  <button className={mode === 'online' ? 'active' : ''} onClick={() => setProvider('dashscope')}>☁️ Online</button>
  <button className={mode === 'offline' ? 'active' : ''} onClick={() => setProvider('speech-to-speech')}>🏠 Offline</button>
</div>
```

**Verify**: `cd web && npm run type-check` exits 0. `cd web && npm run lint` exits 0.

### Step 4: Update tests

Rewrite `web/src/hooks/useRealtimeVoice.test.ts` to test the new Gateway
protocol:
- Mock WebSocket that responds to `connect` with `voice.ready`
- Assert state transitions: idle → connecting → listening → speaking → idle
- Assert provider selection is sent in the `connect` event
- Assert reconnect-on-disconnect behavior

Use the existing test as a structural pattern but adapt the assertions.

**Verify**: `cd web && npm test -- useRealtimeVoice` passes all tests.

### Step 5: Retire old transport

Delete `web/src/lib/realtimeVoice.ts` (or replace with a deprecation stub:
`// Deprecated: replaced by QAA Gateway protocol in useRealtimeVoice.ts`).

Delete `agent_meow/server/routes/s2s_proxy.py` and
`tests/server/routes/test_s2s_proxy.py` — QAA Gateway replaces the proxy.

Remove the s2s proxy router registration from wherever it's mounted
(search for `s2s_proxy` or `create_s2s_proxy_router` in the server setup).

**Verify**: `grep -rn "realtimeVoice" web/src/` returns no imports of the
old module. `grep -rn "s2s_proxy" agent_meow/` returns no imports.
`cd web && npm run type-check` exits 0. `uv run pytest tests/ -q` passes
(no import errors from the deleted proxy).

### Step 6: Update startup scripts

Update `scripts/start-gateway-detached.ps1` to start the QAA Gateway
(`qwenaudio`) instead of the old Python gateway. Update
`scripts/start-voice-stack.ps1` to start QAA + optionally the local S2S
(for offline mode).

**Verify**: Running `scripts/start-voice-stack.ps1` starts the QAA Gateway
and the Vite dev server. `curl http://127.0.0.1:3101/api/health` returns
`ok: true`.

### Step 7: End-to-end smoke test

1. Start QAA Gateway: `scripts/start-qaa-gateway.ps1`
2. Start Vite: `cd web && npm run dev`
3. Open `http://127.0.0.1:5173/`
4. Click the paw-talk button
5. Say something in Chinese — verify spoken response in <3s
6. Switch to offline mode (if S2S is running) — verify it connects to :8765
7. Switch back to online — verify it reconnects to DashScope

**Verify**: Both online and offline modes work from the agent-meow UI.
The paw-talk button + waveform render correctly.

## Test plan

- `web/src/hooks/useRealtimeVoice.test.ts` — rewrite for QAA Gateway protocol:
  - connect event sends correct provider
  - state transitions (idle → connecting → listening → speaking → idle)
  - reconnect on gateway.disconnected
  - provider switch tears down + reconnects
- `web/src/shell/VoicePanel.test.tsx` (if exists) — update for new hook API
- Pattern: model after existing `useRealtimeVoice.test.ts` structure
- Verification: `cd web && npm test` — all pass

## Done criteria

- [ ] `cd web && npm run type-check` exits 0
- [ ] `cd web && npm test` exits 0; new tests for QAA Gateway protocol pass
- [ ] `cd web && npm run lint` exits 0
- [ ] `cd web && npm run build` exits 0
- [ ] `grep -rn "realtimeVoice" web/src/lib/` returns no results (old module retired)
- [ ] `grep -rn "s2s_proxy" agent_meow/` returns no results (proxy retired)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] E2e smoke test: voice round-trips in both online + offline modes
- [ ] `plans/README.md` status row updated

## STOP conditions

- QAA's `useRealtimeVoice.js` uses APIs or patterns not available in
  agent-meow's React/TypeScript setup — report the specific incompatibility.
- The `GatewayClientEvent` / `GatewayServerEvent` protocol has changed since
  the QAA v1.3.0 source was read — re-clone QAA and re-document the events.
- The s2s_proxy router is mounted in a file not listed in scope — report the
  file path and stop.
- Voice doesn't work after the port — check the QAA Gateway is running and
  the WebSocket URL is correct (`ws://127.0.0.1:3101/api/realtime`).