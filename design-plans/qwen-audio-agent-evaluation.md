# Evaluate qwen-audio-agent (QAA) as the agent-meow voice runtime

Written: 2026-08-04 · Methodology: deep-research (agent-reach + repo source dive) + karpathy-guidelines (simplicity, surgical, verifiable).

## TL;DR

**QAA is a near-perfect drop-in replacement for agent-meow's hand-built
S2S-transport layer — but NOT for the S2S model server itself.** QAA is a
**Gateway + realtime-frontend runtime** that already speaks the *exact*
OpenAI-Realtime protocol agent-meow's S2S server exposes
(`ws://127.0.0.1:8765/v1/realtime`). The optimum setup is to **keep the
local S2S server (faster-whisper + Hermes + Kokoro) and let QAA's Gateway
sit in front of it**, replacing agent-meow's `s2s_proxy.py` + the browser
`realtimeVoice.ts` transport with QAA's battle-tested Gateway.

| Layer | Current (agent-meow) | With QAA | Keep? |
|-------|----------------------|----------|-------|
| Browser audio I/O | `web/src/lib/realtimeVoice.ts` (hand-rolled) | QAA `web/useRealtimeVoice.js` (proven, duplex) | **Replace** |
| WS proxy / gateway | `agent_meow/server/routes/s2s_proxy.py` | QAA Gateway (`server/`) — auth, reconnect, ownership | **Replace** |
| S2S model server | `speech-to-speech` exe (:8765) | **same** — QAA just connects to it | **Keep** |
| STT | faster-whisper medium | **same** (S2S owns it) | Keep |
| LLM | Hermes gateway (:8642) | **same** (S2S owns it) | Keep |
| TTS | Kokoro-82M CPU | **same** (S2S owns it) | Keep |
| Backend agent / tools | (none — voice is transport-only) | QAA backend Agent (ACP) → **Hermes runtime** | **New** |

## What QAA actually is (verified from source)

QAA (v1.3.0, 2026-08-03) is a **realtime voice runtime** with two layers
(see `docs/architecture.md`):

1. **Realtime frontend** — full-duplex speech + simple direct answers. A
   `RealtimeFrontend` class (`server/src/voice/realtime-provider.mjs`)
   speaks the OpenAI Realtime API and supports two **swappable providers**:
   - `dashscope` — Qwen-Audio-3.0-realtime cloud model (needs API key).
   - `speech-to-speech` — connects to a user-run HF speech-to-speech server.
     Default URL: **`ws://127.0.0.1:8765/v1/realtime`** — agent-meow's exact
     endpoint. (`shared/realtime-provider-catalog.mjs`)
2. **Backend Agent** — one persistent ACP-compatible Agent Session
   (OpenCode / OpenClaw / Qoder / Kimi Code) that owns tool-using work.
   The realtime layer delegates via `spawn_thinking(objective)` and never
   blocks — the user keeps talking while the agent works.

Key invariants (`docs/architecture.md` §1-3):
- Realtime never controls backend execution (one exception: a per-turn
  permission decision). It can't select tools, cancel sessions, or choose
  execution strategy.
- The backend Agent returns one final `presentation.speech` (semantic
  material, not a script) + optional `inline` markdown/code. Realtime adapts
  the speech to the live conversation.
- Results are injected only after a safe duplex window, with bounded
  retries so one malformed result can't block later completions.

## Why QAA solves agent-meow's real pain points

The work committed today (2026-08-04) was **transport stability**:
auth gate, bounded connect, ping keepalive, clean pump, close-code
propagation, teardownPromise restart-race fix, await-resume. Every one
of those is a problem **QAA's Gateway already solves**:

| agent-meow fix (today) | QAA equivalent (already shipped) |
|------------------------|----------------------------------|
| auth gate on WS proxy | Gateway auth + `QWEN_AUDIO_AGENT_AUTH_SECRET` |
| bounded upstream connect | `connectTimeoutMessage` + provider connect logic |
| ping keepalive (15s/110s) | `responseCompletionTimeoutMs` + reconnect with backoff |
| close-code propagation | `voice.deactivated` / `voice.ownership` events |
| teardownPromise restart race | `voice.ownership` multi-frontend takeover protocol |
| dev-mode direct-connect hack | Gateway is the single endpoint; no Vite-proxy bypass |

QAA also adds things agent-meow **doesn't have**:
- **Voice ownership/takeover** — multiple frontends (web, TUI, desktop orb)
  can share one session; `--takeover` to grab the mic from a busy peer.
- **Nonblocking task flow** — backend Agent work runs while the user keeps
  talking; results are delivered back into the conversation when ready.
- **A TUI** (`tui/fullscreen/app.py`) and a **macOS desktop orb** —
  agent-meow is web-only.
- **ACP backend agents** — real tool use (code, files, MCP) behind voice.

## Wiring QAA's backend Agent to the Hermes runtime

This is the most interesting integration. QAA's backend is ACP-compatible
(Agent Client Protocol); agent-meow's Hermes is an **OpenAI-compatible API**
on `:8642`. Two viable paths:

### Path A — QAA frontend only, Hermes stays behind S2S (simplest)

Keep the S2S server as the LLM. QAA's realtime frontend connects to S2S
(:8765); S2S's `--llm_backend chat-completions` already points at Hermes
(:8642). **No backend Agent needed** — QAA runs in "foreground-only mode"
(`AGENT_PROTOCOL=none`). This is the **minimum viable** swap:
- agent-meow ships its browser transport + proxy → QAA's Gateway + web UI.
- Hermes stays where it is (behind S2S). Zero LLM rewiring.

```
browser ─► QAA Gateway (:3101) ─► S2S (:8765) ─► Hermes (:8642)
                                └─ Kokoro TTS, faster-whisper STT
```

**Cost:** you lose QAA's backend-agent capability (tool use while talking).
But agent-meow's voice surface is transport-only today anyway, so this is
a **pure transport upgrade** with no behavior loss.

### Path B — QAA backend Agent = Hermes via openai-agents harness (full power)

QAA's backend speaks ACP; agent-meow's `openai-agents` harness already
wraps Hermes (`examples/hermes-gateway/config.yaml`):

```yaml
executor:
  type: agent-meow
  config:
    harness: openai-agents
  model: hermes-agent
  auth:
    type: api_key
    api_key: ${HERMES_GATEWAY_KEY}
    base_url: http://127.0.0.1:8642/v1
```

Wire QAA's backend to this via `AGENT_PROTOCOL=openclaw` (or another ACP
driver) pointing at a small agent-meow runner exposing the Hermes-backed
openai-agents executor as an ACP endpoint. Then:
- Simple questions → realtime frontend answers immediately (S2S + Hermes).
- Tool-using work → `spawn_thinking` → backend Hermes Agent (code, files,
  MCP, the full agent-meow tool surface) → result spoken back when ready.

```
browser ─► QAA Gateway (:3101) ┬─► S2S (:8765) ─► Hermes (:8642)   [realtime]
                               └─► ACP ─► agent-meow runner ─► Hermes  [tools]
```

This is the **most optimum** long-term setup: one Hermes model, two
execution paths (instant speech vs. deep tool work), nonblocking.

## Karpathy-guideline check

- **Simplicity**: Path A is the surgical change — swap the transport layer,
  leave the model stack untouched. Path B is additive, not a rewrite.
- **Surgical**: No change to S2S server, STT, LLM, or TTS config. The
  `.venv` site-packages patch problem stays exactly where it is.
- **Verifiable success criteria** (Path A):
  1. `qwenaudio` Gateway starts and reports `realtimeProvider: speech-to-speech`.
  2. Browser connects to QAA web UI, mic works, voice round-trips.
  3. S2S warmup still ~90s (unchanged — QAA doesn't touch it).
  4. Kill S2S, browser gets a clean "service unavailable" (QAA close path).
  5. Restart S2S, reconnect works (QAA reconnect + ownership).
- **Assumptions surfaced**: QAA needs Node 22.22.2+. agent-meow's web is
  Vite/React; QAA's web is a separate React app served by its Gateway —
  the two UIs don't merge automatically. You'd run QAA's web UI as the voice
  surface, or embed QAA's `useRealtimeVoice.js` into agent-meow's shell.

## What you CANNOT do with QAA (gaps)

1. **QAA does not warm up the S2S server.** The 90s CPU/NPU warmup is
   inherent to faster-whisper + Kokoro on CPU. QAA is a Gateway — it
   connects to S2S and will itself wait. To cut warmup you must either
   (a) move STT/TTS to GPU/NPU, (b) use QAA's `dashscope` cloud provider
   for instant speech, or (c) keep a warm pool (agent-meow's watchdog
   already does this). QAA does not solve the warmup problem.

2. **QAA's web UI is not agent-meow's web UI.** agent-meow has the
   multi-hue surface cards, MeowCat IP pattern, workspace rails. QAA
   ships its own React app. Merging means either embedding QAA's
   realtime hook into agent-meow's shell (Port A), or running QAA
   standalone and dropping agent-meow's web voice surface.

3. **QAA is Node-only; agent-meow is Python+React.** The Gateway is
   `node scripts/start.mjs`. It's a separate process alongside the
   Python server. This is fine (it's how S2S already works) but adds a
   runtime dependency.

## Recommended path (most optimum, staged)

**Stage 1 — Transport swap (Path A, low risk):**
- Install QAA (`npm i -g qwen-audio-agent`).
- Configure: `QWEN_AUDIO_REALTIME_PROVIDER=speech-to-speech`,
  `SPEECH_TO_SPEECH_REALTIME_URL=ws://127.0.0.1:8765/v1/realtime`,
  `AGENT_PROTOCOL=none`.
- Keep agent-meow's S2S server + Hermes + Kokoro + faster-whisper.
- Adopt QAA's web UI for voice *or* port its `useRealtimeVoice.js` into
  agent-meow's `VoicePanel.tsx`. (Porting is more work but preserves the
  MeowCat design surface.)
- Retire `agent_meow/server/routes/s2s_proxy.py` + `realtimeVoice.ts`.
- Verify the 5 success criteria above.

**Stage 2 — Backend agent (Path B, additive):**
- Expose agent-meow's Hermes-backed `openai-agents` executor as an ACP
  endpoint (small FastAPI shim or the existing runner app).
- Set `AGENT_PROTOCOL=openclaw` + point at the ACP endpoint.
- Now voice can do tool-using work (code, files, MCP) via Hermes while
  the user keeps talking — the nonblocking flow QAA is built for.

**Stage 3 — Warmup (orthogonal, do anytime):**
- Move STT to NPU (whisper.cpp with QNN EP via `winml` — see use-winml-cli
  skill) or use `dashscope` cloud realtime for instant speech.
- Keep the S2S watchdog + warm pool for the local path.

## Decision

**Yes — use QAA to replace the agent-meow S2S *transport* layer (proxy +
browser realtime), keeping the S2S model server.** This retires the
hand-rolled stability code shipped today (which QAA already does better)
and unlocks QAA's voice-ownership, TUI, desktop-orb, and nonblocking
backend-agent capabilities. The Hermes runtime wires in cleanly via the
existing `openai-agents` harness (Path B) once an ACP shim exists.

The one thing QAA does **not** fix is the 90s warmup — that's a
CPU/NPU compute problem, solved by GPU/NPU STT or the dashscope cloud
provider, not by a Gateway swap.