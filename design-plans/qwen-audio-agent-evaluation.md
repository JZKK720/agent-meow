# Evaluate qwen-audio-agent (QAA) as the agent-meow voice runtime

Written: 2026-08-04 · Revised 2026-08-04 · Methodology: deep-research (agent-reach + repo source dive + DashScope pricing docs) + karpathy-guidelines (simplicity, surgical, verifiable).

## TL;DR (revised)

**Swap the entire voice stack to QAA + DashScope cloud realtime, and
retire the local S2S server.** The pre-warmup problem disappears because
DashScope is an always-on managed cloud service with near-zero cold-start
— no 90s CPU/NPU warmup, no `.venv` site-packages patches, no watchdog,
no warm pool. The free tier (1M tokens ≈ 11 hours of audio, 90 days) covers
development and light use at zero cost. QAA's Gateway replaces
agent-meow's `s2s_proxy.py`; QAA's `useRealtimeVoice.js` replaces the
hand-rolled `realtimeVoice.ts`; and the MeowCat paw-talk button +
waveform UI is preserved by porting QAA's realtime hook into agent-meow's
existing `VoicePanel.tsx` shell.

| Layer                 | Current (agent-meow)                         | Revised target                                       | Action      |
| --------------------- | -------------------------------------------- | ---------------------------------------------------- | ----------- |
| Browser audio I/O     | `web/src/lib/realtimeVoice.ts` (hand-rolled) | QAA `useRealtimeVoice.js` ported into MeowCat shell  | **Replace** |
| WS proxy / gateway    | `agent_meow/server/routes/s2s_proxy.py`      | QAA Gateway (:3101) — auth, reconnect, ownership     | **Replace** |
| S2S model server      | `speech-to-speech` exe (:8765)               | **DashScope cloud** (`wss://dashscope.aliyuncs.com`) | **Retire**  |
| STT                   | faster-whisper medium (CPU, 90s warmup)      | DashScope realtime (cloud, ~0s cold start)           | **Retire**  |
| LLM                   | Hermes gateway (:8642)                       | DashScope realtime (cloud) or Hermes (Path B)        | **Swap**    |
| TTS                   | Kokoro-82M CPU (90s warmup)                  | DashScope realtime (cloud)                           | **Retire**  |
| Backend agent / tools | (none — voice is transport-only)             | QAA backend Agent (ACP) → **Hermes runtime**         | **New**     |
| Warmup / cold start   | 90s (faster-whisper + Kokoro on CPU)         | **~0s** (DashScope is always-on managed cloud)       | **Solved**  |

### Why this is better than the original "keep S2S" recommendation

The original recommendation (Path A) kept the local S2S server to avoid
rewiring the LLM. But the user's core pain is the **90s warmup**, and
keeping S2S keeps that pain. DashScope's `qwen-audio-3.0-realtime-flash`
is an end-to-end S2S cloud model — it does STT + LLM + TTS in one
always-on WebSocket, speaks the OpenAI Realtime protocol natively, and
supports Chinese. Switching to it **eliminates the warmup problem
entirely**, not just papers over it.

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

| agent-meow fix (today)       | QAA equivalent (already shipped)                       |
| ---------------------------- | ------------------------------------------------------ |
| auth gate on WS proxy        | Gateway auth + `QWEN_AUDIO_AGENT_AUTH_SECRET`          |
| bounded upstream connect     | `connectTimeoutMessage` + provider connect logic       |
| ping keepalive (15s/110s)    | `responseCompletionTimeoutMs` + reconnect with backoff |
| close-code propagation       | `voice.deactivated` / `voice.ownership` events         |
| teardownPromise restart race | `voice.ownership` multi-frontend takeover protocol     |
| dev-mode direct-connect hack | Gateway is the single endpoint; no Vite-proxy bypass   |

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
- **Surgical**: The only source change is porting QAA's realtime hook into
  `VoicePanel.tsx`. The MeowCat UI, surface cards, workspace rails are
  untouched. S2S cleanup is a follow-up PR, not mixed in.
- **Verifiable success criteria** (revised, DashScope path):
  1. `qwenaudio` Gateway starts and reports `realtimeProvider: dashscope`.
  2. Browser connects, mic works, voice round-trips in **<2s** (no warmup).
  3. Kill the Gateway, browser gets a clean `gateway.disconnected` + reconnect.
  4. Restart the Gateway, reconnect works (QAA reconnect + backoff).
  5. Chinese + English mixed speech works (DashScope supports both natively).
- **Assumptions surfaced**: QAA needs Node 22.22.2+. The QAA Gateway client
  protocol (`GatewayClientEvent`/`GatewayServerEvent`) is different from raw
  OpenAI Realtime — porting means rewriting the event handlers in
  `VoicePanel.tsx`, not just swapping the WebSocket URL.

## What you CANNOT do with QAA (gaps, revised)

1. **NPU STT is not viable today.** The `winml` CLI explicitly excludes
   Whisper (seq2seq) — NPU STT support is "planned for late 2026." This
   rules out the NPU STT + cloud LLM + cloud TTS hybrid. The all-cloud
   DashScope path is the only zero-cold-start option available now.

2. **QAA's web UI is not agent-meow's web UI** — but this is solved by
   porting QAA's `useRealtimeVoice.js` hook into agent-meow's `VoicePanel.tsx`
   shell (Stage 2). The paw-talk button, waveform, MeowCat IP pattern, and
   surface cards stay; only the transport layer under them changes.

3. **QAA is Node-only; agent-meow is Python+React.** The Gateway is
   `node scripts/start.mjs`. It's a separate process alongside the
   Python server. This is fine (it's how S2S already works) but adds a
   runtime dependency.

## Q1 — If we swap to QAA, do we still need to tackle warmup? + S2S cleanup

### Warmup: NO — if we switch to DashScope cloud realtime.

The 90s warmup is caused by faster-whisper (STT) and Kokoro-82M (TTS)
loading model weights into CPU memory on first use. **DashScope
`qwen-audio-3.0-realtime-flash` is an always-on managed cloud model** —
it does STT + LLM + TTS end-to-end in one WebSocket, so there is no local
model to warm. The connection is hot in <1s (the QAA Gateway has a 25s
connect timeout, but real cold-start is ~200-500ms for a TLS handshake to
an already-running cloud service).

If you keep the local S2S server (the old Path A), the warmup problem
**stays exactly as-is** — QAA is just a Gateway, it doesn't warm the
upstream. So the warmup question reduces to: **cloud or local?** The
revised recommendation is cloud (DashScope), which makes warmup a
non-issue.

### NPU STT: NOT viable today.

Research finding: the `winml` CLI skill explicitly says **"Skip for
generative models — LLMs (GPT, LLaMA, Phi, Mistral), Stable Diffusion,
Whisper, or any decoder-only / seq2seq architecture are out of scope
(planned for late 2026)."** Whisper is a seq2seq encoder-decoder, so NPU
STT via `winml` is **not available yet**. faster-whisper uses CTranslate2
(CPU/GPU), not ONNX/NPU execution providers. There is no production path
to NPU-accelerated Whisper STT on Windows AI PCs as of 2026-08-04.

### S2S cleanup: YES — retire the whole local S2S layer.

If we adopt DashScope cloud realtime, the following become dead code and
should be removed for a clean codebase:

| File / component                         | Why remove                                      |
| ---------------------------------------- | ----------------------------------------------- |
| `agent_meow/server/routes/s2s_proxy.py`  | QAA Gateway replaces it                         |
| `web/src/lib/realtimeVoice.ts`           | QAA `useRealtimeVoice.js` replaces it           |
| `scripts/start-speech-to-speech.ps1`     | No local S2S server to start                    |
| `scripts/start-speech-to-speech-zh.ps1`  | Same                                            |
| `scripts/start-speech-to-speech-qwen3.ps1` | Same                                          |
| `scripts/start-s2s-detached.ps1`         | Same                                            |
| `scripts/start-s2s-watchdog.ps1`         | No warmup → no watchdog needed                  |
| `scripts/start-voice-stack.ps1`          | Replaced by `qwenaudio` Gateway startup         |
| `scripts/run_s2s_with_patches.py`        | No `.venv` site-packages patches needed         |
| `scripts/s2s_voice_patch.py`             | Same                                            |
| `tests/server/routes/test_s2s_proxy.py`  | Proxy is retired                                |
| `web/src/hooks/useRealtimeVoice.test.ts` | Transport replaced (rewrite for QAA hook)       |
| `.venv/.../speech_to_speech/` patches    | No local S2S pip package to patch               |

**Keep** (not S2S-specific, still used):
- `web/src/shell/VoicePanel.tsx` — the MeowCat paw-talk + waveform UI
  shell; we port QAA's hook into it.
- `web/src/hooks/useWakeWordDetector.ts`, `useWakeWordReply.ts` —
  wake-word is browser-side, independent of the transport.
- `agent_meow/server/routes/voicebox_proxy.py` — legacy Voicebox path
  (separate decision; leave for now).
- `docs/VOICE_SURFACE.md` — design doc, update rather than delete.

### Cleanup staging

Don't delete in the same PR as the QAA adoption. Stage it:
1. **Adopt QAA + DashScope** (new voice path lives alongside old).
2. **Verify** the new path works end-to-end (smoke test).
3. **Delete** the S2S files above in a follow-up cleanup PR.
4. **Update** docs (`docs/VOICE_SURFACE.md`, `post-reboot-recovery`
   memory) to reflect the new startup sequence.

## Q2 — Path B: QAA backend → Hermes, with MeowCat frontend UI/TUI

### Is the syntax logical and doable? YES.

The architecture is clean and the pieces fit:

```
MeowCat browser UI (paw-talk + waveform)
    │  (WebSocket to QAA Gateway)
    ▼
QAA Gateway (:3101)
    │
    ├── Realtime frontend → DashScope cloud (STT+LLM+TTS, ~0s cold start)
    │
    └── Backend Agent (ACP) → agent-meow runner → Hermes (:8642)
         (tool use: code, files, MCP — nonblocking, user keeps talking)
```

**Why this works syntactically:**

1. **QAA Gateway is UI-agnostic.** It serves a WebSocket
   (`/api/realtime`) that any frontend can connect to — its own React
   app, the TUI (`tui/fullscreen/app.py`), or agent-meow's MeowCat shell.
   The Gateway doesn't know or care what UI is on the other end. It just
   requires the client to send `connect`, `audio.append`,
   `playback.started`, etc. (the `GatewayClientEvent` protocol in
   `web/src/useRealtimeVoice.js`).

2. **The MeowCat paw-talk button** is just a UI trigger that calls
   `voice.activateAudio()` — the same gesture agent-meow's
   `VoicePanel.tsx` already implements. Port QAA's
   `useRealtimeVoice.js` hook (the Gateway client) into the existing
   `VoicePanel.tsx`, keep the paw button + waveform visuals, and point
   it at `ws://127.0.0.1:3101/api/realtime` instead of the old
   `:8765/v1/realtime`.

3. **The waveform** is driven by the `audio.delta` events from the
   Gateway — the same PCM audio chunks agent-meow already renders.
   QAA's `useRealtimeVoice.js` already has the AudioContext + analyser
   graph for this (`web/src/useRealtimeVoice.js:512-533`).

4. **Path B (backend agent → Hermes)** uses ACP. QAA's
   `AcpBackendAdapter` (`server/src/agent/acp-backend-adapter.mjs`)
   speaks the Agent Client Protocol. agent-meow's `openai-agents` harness
   already wraps Hermes at `:8642`. A thin ACP shim (FastAPI endpoint
   translating ACP ↔ agent-meow's runner app) is the only new code. The
   syntax is: QAA sends `spawn_thinking(objective)` → ACP shim →
   agent-meow runner → Hermes → result → QAA speaks it back.

5. **TUI option:** QAA ships a full TUI (`qwenaudio tui`). If you want a
   MeowCat-branded TUI, you'd skin QAA's `tui/fullscreen/app.py` (it's
   Python/textual, easy to rebrand). But the primary surface is the web
   UI — the TUI is a bonus.

### The one syntax caveat

QAA's Gateway events use a custom `GatewayClientEvent` / `GatewayServerEvent`
protocol (not raw OpenAI Realtime). The browser client sends
`{type: "connect", voiceEnabled: true, ...}` and receives
`{type: "audio.delta", ...}`, `{type: "turn.started", ...}`, etc. This is
**different from** the raw OpenAI Realtime events agent-meow's
`realtimeVoice.ts` currently handles. So porting means **rewriting the
event handlers** in `VoicePanel.tsx` to speak QAA's gateway protocol, not
just swapping the WebSocket URL. This is straightforward (the event
names are clear) but it's not a drop-in.

## Q3 — Solving the pre-warmup problem (near-zero delay, free)

### The optimum solution: DashScope cloud realtime (free tier)

**DashScope `qwen-audio-3.0-realtime-flash`** is the best fit:

| Criterion                          | DashScope realtime-flash                     |
| ---------------------------------- | -------------------------------------------- |
| Cold-start latency                 | **~0s** (always-on managed cloud service)    |
| Free tier                          | **1M tokens free, 90 days** (~11h of audio)  |
| Free API key                       | Yes — create at bailian.console.aliyun.com    |
| OpenAI-Realtime compatible         | Yes — QAA uses `openAiCompatibleProtocol`    |
| Chinese support                    | Yes — native zh (voice `longanqian` default) |
| STT + LLM + TTS                    | End-to-end in one model (no separate warmup) |
| WebSocket endpoint                 | `wss://dashscope.aliyuncs.com/api-ws/v1/realtime` |
| VAD                                | `smart_turn` (server-side, cloud)             |
| Audio format                       | Input 16kHz PCM, output 24kHz PCM             |

**Pricing after free tier** (per million tokens):
- Input: text ¥3 / audio ¥30
- Output: text ¥30 / audio ¥100
- Audio = 25 tokens/second, so 1 minute of audio ≈ 1,500 tokens ≈ ¥0.045
  (input) + ¥0.15 (output) ≈ **¥0.20/min after free tier** (~$0.03/min).

**Setup:**
```dotenv
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
DASHSCOPE_API_KEY=<free key from bailian.console.aliyun.com>
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-flash
AGENT_PROTOCOL=none   # or openclaw for Path B
```

### Why not NPU STT + cloud realtime as a hybrid?

You asked about "NPU STT and cloud realtime provider." The answer:

- **NPU STT alone is not viable** (winml doesn't support Whisper yet, see
  Q1). Even if it did, you'd still need a separate LLM + TTS, each with
  their own cold-start. NPU STT solves only 1/3 of the pipeline.
- **DashScope cloud realtime is the complete solution** — it replaces
  STT + LLM + TTS in one shot, with zero cold-start, for free. There's no
  need to split STT to NPU when the cloud model handles everything.
- **Hybrid (NPU STT + cloud LLM + cloud TTS) is worse**, not better — it
  adds the complexity of running a local STT, the NPU-availability
  constraint, and you still pay for cloud LLM + TTS. The all-cloud path
  is simpler (karpathy: simplicity) and cheaper.

### Fallback: local S2S for offline / privacy

If you need a fully offline path (no cloud API key), keep the local S2S
server as a **secondary provider** (`QWEN_AUDIO_REALTIME_PROVIDER=speech-to-speech`).
QAA supports both providers simultaneously — the user picks at connect
time. The warmup pain stays for the local path, but it's a fallback, not
the default.

## Revised recommended path (most optimum)

**Stage 1 — DashScope cloud realtime (solves warmup NOW):**

1. Get a free DashScope API key at `bailian.console.aliyun.com`.
2. `npm i -g qwen-audio-agent`.
3. Configure: `QWEN_AUDIO_REALTIME_PROVIDER=dashscope`,
   `DASHSCOPE_API_KEY=<key>`, `QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-flash`,
   `AGENT_PROTOCOL=none`.
4. Start `qwenaudio` — Gateway is hot in <2s, no warmup.
5. Connect via QAA's web UI to verify voice round-trips (zh + en).

**Stage 2 — Port QAA realtime hook into MeowCat shell:**

1. Port QAA's `web/src/useRealtimeVoice.js` (Gateway client protocol,
   AudioContext graph, PCM playback) into agent-meow's `web/src/shell/VoicePanel.tsx`.
2. Keep the paw-talk button, waveform, MeowCat IP pattern — only the
   transport layer under them changes.
3. Point the client at `ws://127.0.0.1:3101/api/realtime` (QAA Gateway).
4. Retire `web/src/lib/realtimeVoice.ts` + `agent_meow/server/routes/s2s_proxy.py`.

**Stage 3 — Backend agent → Hermes (Path B, additive):**

1. Write a thin ACP shim (FastAPI) exposing agent-meow's Hermes-backed
   `openai-agents` executor as an ACP endpoint.
2. Set `AGENT_PROTOCOL=openclaw` (or another ACP driver) + point at the
   shim. Now voice can do tool-using work via Hermes while the user
   keeps talking.
3. QAA's nonblocking `spawn_thinking` flow: simple questions answered
   instantly by DashScope realtime; tool work delegated to Hermes backend.

**Stage 4 — S2S cleanup (follow-up PR):**

1. Delete the retired S2S files (see Q1 table).
2. Update `docs/VOICE_SURFACE.md` + `post-reboot-recovery` memory to
   reflect: `qwenaudio` Gateway startup (no S2S, no warmup, no watchdog).
3. Keep the local S2S scripts in a `scripts/legacy-s2s/` folder (or
   delete) — they're only needed if someone wants the offline fallback.

## Decision (revised)

**Adopt QAA + DashScope cloud realtime as the primary voice path.** This
solves the #1 customer pain (90s warmup → ~0s) for free, retires the
fragile local S2S stack (patches, watchdog, warm pool), and unlocks
QAA's nonblocking backend-agent + voice-ownership capabilities. The
MeowCat paw-talk + waveform UI is preserved by porting QAA's realtime
hook into the existing `VoicePanel.tsx` shell. Path B (ACP → Hermes)
adds tool-using voice work as an additive stage.

**NPU STT is not viable today** (winml doesn't support Whisper until late
2026). **The all-cloud DashScope path is simpler, cheaper, and
zero-cold-start** — it's the karpathy-optimal solution.
