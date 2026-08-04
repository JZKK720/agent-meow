# Evaluate qwen-audio-agent (QAA) as the agent-meow voice runtime

Written: 2026-08-04 · Revised 2026-08-04 · Methodology: deep-research (agent-reach + repo source dive + DashScope pricing docs) + karpathy-guidelines (simplicity, surgical, verifiable).

## TL;DR (revised)

**Adopt QAA as the voice Gateway + transport, with a hybrid online/offline
realtime backend.** The pre-warmup problem disappears in online mode
(cloud realtime is always-on, ~0s cold start); the local S2S server stays
as the offline/free fallback. No 90s warmup when online; no recurring
cost when offline.

**Cloud path (China-accessible, online default):**

- **DashScope** (`qwen-audio-3.0-realtime-flash`) — the ONLY China-accessible
  OpenAI-Realtime-native S2S cloud model. Native Chinese, ~0s cold start,
  1M-token free quota (~11h audio, 90-day trial). After trial: ~¥0.20/min
  (~$0.03/min) — negligible for personal use. **No forever-free tier exists
  in China**; cheap-paid is the pragmatic choice.
- **Gemini Flash-Lite (forever-free) is blocked in China** — see Addendum 2.
  If a non-China network path becomes available, it becomes the best option.

**Offline path (free forever):**

- The **local S2S server stays** (faster-whisper + Hermes + Kokoro) as the
  `speech-to-speech` provider. 90s warmup, but $0 recurring cost, works
  with no internet. See "Hybrid online/offline mode" below for the
  auto-switch + manual dashboard toggle design.

QAA's Gateway replaces agent-meow's `s2s_proxy.py`; QAA's
`useRealtimeVoice.js` replaces the hand-rolled `realtimeVoice.ts`; and the
MeowCat paw-talk button + waveform UI is preserved by porting QAA's
realtime hook into agent-meow's existing `VoicePanel.tsx` shell.

| Layer                 | Current (agent-meow)                         | Revised target                                       | Action             |
| --------------------- | -------------------------------------------- | ---------------------------------------------------- | ------------------ |
| Browser audio I/O     | `web/src/lib/realtimeVoice.ts` (hand-rolled) | QAA `useRealtimeVoice.js` ported into MeowCat shell  | **Replace**        |
| WS proxy / gateway    | `agent_meow/server/routes/s2s_proxy.py`      | QAA Gateway (:3101) — auth, reconnect, ownership     | **Replace**        |
| S2S model server      | `speech-to-speech` exe (:8765)               | **Hybrid:** DashScope (online) + local S2S (offline) | **Keep (offline)** |
| STT                   | faster-whisper medium (CPU, 90s warmup)      | DashScope (online) / faster-whisper (offline)        | **Keep (offline)** |
| LLM                   | Hermes gateway (:8642)                       | DashScope realtime (online) / Hermes (offline)       | **Keep (offline)** |
| TTS                   | Kokoro-82M CPU (90s warmup)                  | DashScope realtime (online) / Kokoro (offline)       | **Keep (offline)** |
| Backend agent / tools | (none — voice is transport-only)             | QAA backend Agent (ACP) → **Hermes runtime**         | **New**            |
| Warmup / cold start   | 90s (faster-whisper + Kokoro on CPU)         | **~0s** (DashScope is always-on managed cloud)       | **Solved**         |

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

| File / component                           | Why remove                                |
| ------------------------------------------ | ----------------------------------------- |
| `agent_meow/server/routes/s2s_proxy.py`    | QAA Gateway replaces it                   |
| `web/src/lib/realtimeVoice.ts`             | QAA `useRealtimeVoice.js` replaces it     |
| `scripts/start-speech-to-speech.ps1`       | No local S2S server to start              |
| `scripts/start-speech-to-speech-zh.ps1`    | Same                                      |
| `scripts/start-speech-to-speech-qwen3.ps1` | Same                                      |
| `scripts/start-s2s-detached.ps1`           | Same                                      |
| `scripts/start-s2s-watchdog.ps1`           | No warmup → no watchdog needed            |
| `scripts/start-voice-stack.ps1`            | Replaced by `qwenaudio` Gateway startup   |
| `scripts/run_s2s_with_patches.py`          | No `.venv` site-packages patches needed   |
| `scripts/s2s_voice_patch.py`               | Same                                      |
| `tests/server/routes/test_s2s_proxy.py`    | Proxy is retired                          |
| `web/src/hooks/useRealtimeVoice.test.ts`   | Transport replaced (rewrite for QAA hook) |
| `.venv/.../speech_to_speech/` patches      | No local S2S pip package to patch         |

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

| Criterion                  | DashScope realtime-flash                          |
| -------------------------- | ------------------------------------------------- |
| Cold-start latency         | **~0s** (always-on managed cloud service)         |
| Free tier                  | **1M tokens free, 90 days** (~11h of audio)       |
| Free API key               | Yes — create at bailian.console.aliyun.com        |
| OpenAI-Realtime compatible | Yes — QAA uses `openAiCompatibleProtocol`         |
| Chinese support            | Yes — native zh (voice `longanqian` default)      |
| STT + LLM + TTS            | End-to-end in one model (no separate warmup)      |
| WebSocket endpoint         | `wss://dashscope.aliyuncs.com/api-ws/v1/realtime` |
| VAD                        | `smart_turn` (server-side, cloud)                 |
| Audio format               | Input 16kHz PCM, output 24kHz PCM                 |

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

## Addendum — Forever-free cloud realtime provider research (2026-08-04)

> Deep-research follow-up: is there a **permanent** (not trial) free cloud
> STT/realtime service that connects with QAA? Sources: DashScope quota
> docs, Gemini API pricing/rate-limits, Inworld Realtime API docs.

### Finding: DashScope free quota is a 90-day TRIAL, not forever-free

Confirmed from `help.aliyun.com/zh/model-studio/new-free-quota`:

> 免费额度的有效期为 90 天，从开通阿里云百炼、模型发布或模型申请通过之日起
> 计算（以较晚者为准），到期或耗尽后将不再显示，继续调用模型将产生计费。

Translation: the 100万-token free quota is valid **90 days from activation**,
**one-time, not renewed**. After expiry or exhaustion, calls are billed. So
DashScope is a **trial**, not a forever-free tier. The earlier "free tier"
framing in this doc was accurate for the first 90 days but **not sustainable
as a permanent free path**.

### Comparison: forever-free cloud realtime providers

| Provider                                | Free tier type                | Free quota               | Rate limit                | OpenAI-Realtime compatible        | Chinese (zh)        | Cold start | Notes                                            |
| --------------------------------------- | ----------------------------- | ------------------------ | ------------------------- | --------------------------------- | ------------------- | ---------- | ------------------------------------------------ |
| **Google Gemini 2.5 Flash-Lite**        | **FOREVER** (daily reset)     | Input/output free, daily | 15 RPM, 1,000 RPD, 1M TPM | **No** (Google's own WS protocol) | **Yes** (70+ langs) | ~0s        | Best forever-free quota; needs protocol adapter  |
| **Google Gemini 2.5 Flash**             | **FOREVER** (daily reset)     | Input/output free, daily | 10 RPM, 250 RPD           | **No** (Google's own WS protocol) | **Yes** (70+ langs) | ~0s        | Lower quota than Lite; needs adapter             |
| **Google Gemini 3.1 Flash Live**        | **FOREVER** (preview)         | Free tier exists (audio) | TBD (preview)             | **No** (Live API protocol)        | **Yes** (90+ langs) | ~0s        | Newest; realtime-native; preview limits volatile |
| DashScope qwen-audio-3.0-realtime-flash | **TRIAL** (90 days, one-time) | 1M tokens (~11h audio)   | None (token-bounded)      | **Yes** (native)                  | **Yes**             | ~0s        | Easiest for QAA; expires                         |
| Inworld Realtime API                    | **Paid** (no free tier found) | —                        | —                         | **Yes** (OpenAI-compatible)       | 15 GA / 90+ preview | ~0s        | OpenAI-protocol-compatible; not free             |
| OpenAI Realtime (gpt-4o-realtime)       | **Paid** (no free tier)       | —                        | —                         | **Yes** (native)                  | Yes                 | ~0s        | No free tier                                     |
| Groq                                    | **No realtime audio**         | —                        | —                         | N/A                               | —                   | —          | STT/LLM only, no S2S realtime                    |
| Deepgram                                | **Paid** (trial only)         | Limited trial            | —                         | **No** (own protocol)             | Yes                 | ~0s        | STT only, not S2S                                |

### The forever-free winner: Google Gemini Live API

**Gemini 2.5 Flash-Lite** is the only provider with a **permanent,
daily-renewing free tier** generous enough for development and light
daily use:

- **Free forever** — 15 RPM, **1,000 requests/day**, 1M TPM. Resets
  daily at midnight Pacific. No expiry, no credit card required for the
  free tier.
- **70+ languages** including Chinese (Mandarin) — native multilingual.
- **Realtime WebSocket** (WSS), raw 16-bit PCM 24kHz output, server VAD.
- **~0s cold start** (always-on managed cloud).
- **Models:** `gemini-2.5-flash-native-audio-preview`, `gemini-3.1-flash-live-preview`.

### The catch: Gemini Live is NOT OpenAI-Realtime-protocol compatible

Gemini Live uses Google's own WebSocket protocol (`client.aio.live.connect`,
`send_client_content`, `LiveConnectConfig`), **not** the OpenAI Realtime
events (`session.update`, `input_audio_buffer.append`, `response.create`).
QAA's `dashscopeProvider` and `s2sProvider` both use
`openAiCompatibleProtocol` — so **QAA cannot connect to Gemini Live
directly**.

Two ways to bridge this:

**Option A — Write a Gemini Live provider for QAA** (medium effort).
QAA's provider system is pluggable (`server/src/voice/providers/registry.mjs`).
Add a `geminiProvider` that implements the QAA provider interface
(`buildSession`, `url`, `headers`, `protocol`) but uses a small
protocol-translation shim mapping QAA's OpenAI-style events ↔ Gemini
Live events. This is the clean long-term fix but requires understanding
both protocols.

**Option B — Run a thin OpenAI-Realtime ↔ Gemini proxy** (lower effort).
Run a small Node/Python WebSocket proxy that presents an OpenAI-Realtime
endpoint to QAA and translates to Gemini Live protocol upstream. Point
QAA's `SPEECH_TO_SPEECH_REALTIME_URL` at this proxy. This is a hack but
gets you running fast, and QAA treats it as a local S2S server (which it
already supports).

### Revised recommendation for the forever-free path

**Short-term (now → 90 days): DashScope trial.** Use the 1M-token free
quota for development and initial deployment. It's the easiest path
(native OpenAI-Realtime, native Chinese, zero adapter code). Just be
aware it expires.

**Long-term (forever-free): Gemini Live + adapter.** Before the DashScope
trial expires, implement Option B (proxy) or Option A (native provider)
to switch to Gemini 2.5 Flash-Lite's permanent free tier (1,000 RPD).
1,000 requests/day is plenty for a personal assistant or small-team use.

**Hybrid (best of both):** Configure QAA with DashScope as the primary
realtime provider during the trial, then swap to the Gemini-proxy
endpoint when the trial expires. QAA supports switching providers via
`QWEN_AUDIO_REALTIME_PROVIDER` + URL config — no code change needed if
the Gemini proxy exposes the OpenAI-Realtime protocol.

### Cost reality check (if you outgrow free tiers)

| Path                         | Cost after free tier                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| DashScope realtime-flash     | ~¥0.20/min (~$0.03/min)                                                             |
| Gemini 2.5 Flash (paid)      | $1.00/1M audio-input tokens, $1.80/1M audio-output ≈ $0.005/min in + $0.018/min out |
| Gemini 2.5 Flash-Lite (paid) | $0.30/1M audio-in, $0.54/1M audio-out ≈ $0.0015/min in + $0.0054/min out            |

Gemini Flash-Lite paid is **~10× cheaper** than DashScope after the free
tier, and its free tier is permanent. For a budget-conscious always-on
voice assistant, **Gemini Flash-Lite is the economic winner** once the
adapter exists.

## Addendum 2 — China network reality check (2026-08-04)

> Correction: the Gemini recommendation above is **invalid for users in
> China** — Google APIs (Gemini Live, AI Studio) are network-blocked there.
> This section re-evaluates against China-accessible providers only.

### The hard truth: no forever-free OpenAI-Realtime S2S in China

Deep-research across all major China-accessible cloud providers (DashScope,
iFlytek/讯飞, Tencent Cloud, Baidu) confirms: **none offer a permanent
forever-free tier for realtime speech-to-speech**. Every free offering is a
one-time trial (days-to-months), then paid. There is no Chinese equivalent
of Gemini's daily-renewing 1,000 RPD free tier for realtime audio.

### China-accessible provider comparison (2026-08-04)

| Provider                                    | Accessible in CN      | Free tier                      | Free quota                                  | Type         | OpenAI-Realtime  | Chinese                   | Cold start |
| ------------------------------------------- | --------------------- | ------------------------------ | ------------------------------------------- | ------------ | ---------------- | ------------------------- | ---------- |
| **DashScope** qwen-audio-3.0-realtime-flash | ✅ (Alibaba, Beijing) | **Trial 90d** (1×, no renewal) | 1M tokens (~11h audio)                      | **S2S**      | **Yes (native)** | **Yes**                   | ~0s        |
| **DashScope** qwen3.5-omni-flash-realtime   | ✅                    | Trial 90d                      | 1M tokens                                   | S2S          | Yes (native)     | Yes                       | ~0s        |
| **iFlytek** 实时语音转写 (rtasr)            | ✅                    | Trial (limited)                | Free trial pack, then paid                  | **STT only** | No (own WS)      | Yes (zh+en, 202 dialects) | ~0s        |
| **Tencent Cloud** ASR realtime              | ✅                    | Trial                          | 5h realtime (new user) + monthly gift quota | **STT only** | No (own WS)      | Yes (zh+en+27 dialects)   | ~0s        |
| **Baidu** 语音识别                          | ✅                    | Trial                          | Limited free calls                          | STT only     | No               | Yes                       | ~0s        |
| Google Gemini Live                          | ❌ **blocked**        | Forever free                   | 1,000 RPD (daily)                           | S2S          | No (adapter)     | Yes (70+)                 | ~0s        |
| OpenAI Realtime                             | ❌ blocked            | Paid                           | —                                           | S2S          | Yes (native)     | Yes                       | ~0s        |
| Inworld                                     | ❌ blocked            | Paid                           | —                                           | S2S          | Yes (compatible) | 15+                       | ~0s        |

### Key finding: only DashScope offers OpenAI-Realtime S2S in China

DashScope is the **only** China-accessible provider that:

- Is a true **end-to-end S2S** model (STT + LLM + TTS in one WebSocket),
- Speaks the **OpenAI Realtime protocol natively** (QAA connects with zero adapter),
- Supports **Chinese** natively,
- Has near-zero cold start.

Its free quota (1M tokens, 90 days) is a trial, but the paid rate after
expiry is **cheap** (~¥0.20/min ≈ $0.03/min for realtime-flash). For a
personal assistant used ~30 min/day, that's ~¥6/month (~$0.85/month) after
the trial — negligible.

The STT-only providers (iFlytek, Tencent, Baidu) are NOT viable for QAA's
S2S provider slot. They'd require you to run a local LLM + TTS behind them,
re-introducing the warmup problem you're trying to eliminate. They're
useful only if you build a **custom S2S pipeline** (their STT → your LLM →
your TTS), which is exactly the fragile local stack QAA replaces.

### Revised recommendation (China-final)

**There is no forever-free path in China. Accept cheap-paid.**

1. **Now (90 days free):** DashScope `qwen-audio-3.0-realtime-flash`.
   Native OpenAI-Realtime, native Chinese, zero adapter, 1M tokens free.
   This is the karpathy-optimal path: simplest thing that works.

2. **After trial (cheap-paid):** Stay on DashScope realtime-flash at
   ~¥0.20/min. For typical personal use (~30 min/day) this is <¥6/month.
   Enable "免费额度用完即停" (stop when free quota exhausted) in the console
   to avoid surprise bills, then switch to pay-as-you-go with a budget cap.

3. **If cost must be zero forever:** the only option is the **local S2S
   server** (faster-whisper + Hermes + Kokoro) you already have, with its
   90s warmup. QAA can use it via `QWEN_AUDIO_REALTIME_PROVIDER=speech-to-speech`
   as the offline/free fallback. You accept the warmup pain in exchange
   for $0 recurring cost. The watchdog + warm pool mitigates (but doesn't
   eliminate) the cold start.

4. **Gemini is off the table** until the user has a non-China network path
   (VPN, overseas relay, or deployment outside CN). If that ever becomes
   available, the Gemini Flash-Lite path (forever-free, 10× cheaper paid)
   from Addendum 1 becomes viable again.

### Bottom line

| Constraint                         | Best option                                              |
| ---------------------------------- | -------------------------------------------------------- |
| China + zero-cold-start + simplest | **DashScope realtime-flash** (free 90d, then ~¥0.20/min) |
| China + must-be-free-forever       | **Local S2S** (free, but 90s warmup)                     |
| Non-China network + forever-free   | Gemini Flash-Lite (Addendum 1)                           |

The honest answer to "is there a forever-free cloud STT for QAA in China?"
is **no**. DashScope's trial is the best free on-ramp; after it, cheap-paid
is the pragmatic choice. The local S2S server remains the only truly-free
option, at the cost of the warmup latency you wanted to eliminate.

## Hybrid online/offline mode (2026-08-04)

> Can we auto-switch: online → DashScope + QAA, offline → local STT + QAA,
> with a manual toggle on the agent-meow dashboard?

**Yes — QAA supports this natively, and the manual toggle already exists in
QAA's web UI.** Here is the design.

### How QAA's provider switching works (verified from source)

QAA's Gateway advertises **all configured realtime providers** to the
browser on connect (`api/health` → `realtimeProviders` array,
`server/src/voice/providers/registry.mjs:listRealtimeProviders()`). A
provider is advertised only if `provider.isConfigured()` returns true.

The browser picks a provider **per session** in the `connect` WebSocket
event:

```js
// web/src/useRealtimeVoice.js — the connect event
socket.send(
  JSON.stringify({
    type: GatewayClientEvent.CONNECT,
    // ...
    ...(realtimeProvider ? { provider: realtimeProvider } : {}),
  }),
);
```

QAA's web UI already renders a `<select>` dropdown when more than one
provider is configured (`web/src/App.jsx:880`):

```jsx
{
  realtimeProviders.length > 1 && (
    <select
      className="ghost frontend-provider"
      value={realtimeProvider}
      onChange={(event) => selectRealtimeProvider(event.target.value)}
      title="选择前台语音引擎"
    >
      <option value="">前台：默认（{frontend.label}）</option>
      {realtimeProviders.map((item) => (
        <option key={item.key} value={item.key}>
          前台：{item.label}
        </option>
      ))}
    </select>
  );
}
```

Changing the selection tears the current WebSocket down and reconnects
with the new provider (`realtimeProvider` is a dependency of the realtime
effect — `App.jsx` comment: "Switching the front end reconnects on its
own"). **This is the manual human switch you asked for — it already
exists.**

### Configuration: both providers configured simultaneously

Set both in the QAA Gateway's `config.env` so both pass `isConfigured()`:

```dotenv
# === Online (cloud) ===
DASHSCOPE_API_KEY=<your-key>
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-flash
# Default provider — which one is selected at Gateway startup:
QWEN_AUDIO_REALTIME_PROVIDER=dashscope

# === Offline (local S2S) ===
# Configure the S2S URL so isConfigured() returns true for s2s too.
# agent-meow's existing S2S server endpoint:
SPEECH_TO_SPEECH_REALTIME_URL=ws://127.0.0.1:8765/v1/realtime
# Optional: SPEECH_TO_SPEECH_AUTH_TOKEN=<token-if-behind-proxy>
```

With both configured, `listRealtimeProviders()` returns both
`dashscope` and `speech-to-speech`, so `realtimeProviders.length > 1`
is true → the dropdown appears. The user switches between them at will.

**Critical caveat — one Gateway, one default provider.** QAA's Gateway
process starts with ONE `QWEN_AUDIO_REALTIME_PROVIDER` as its default
(the `config.audioProvider` in `server/src/core/config.mjs`). The
per-session `connect` event can override it, but the Gateway's
health-check signature (`realtimeConfigurationSignature`) is derived
from the default. A running Gateway will refuse to be "reused" by a
client whose configured default differs
(`assertRealtimeGatewayCompatibility`). This is fine for the hybrid
case — both providers are configured, the default is just the starting
point; per-session overrides work without a Gateway restart.

### The manual dashboard toggle (agent-meow side)

When you port QAA's `useRealtimeVoice.js` into agent-meow's
`VoicePanel.tsx` (Stage 2 of the plan), render a toggle in the MeowCat
dashboard — e.g. a small pill switch next to the paw-talk button:

```
[ ☁️ Online (DashScope) ]  [ 🏠 Offline (Local) ]
```

Clicking it sets `realtimeProvider` to `'dashscope'` or
`'speech-to-speech'` and lets the realtime effect tear down + reconnect
(QAA does this automatically). Persist the choice in `localStorage`
(QAA already does: `qwen-audio-agent.realtimeProvider`).

### Automated switching (online/offline detection)

For the **automatic** switch, add a connectivity probe that picks the
provider on session start:

1. **On connect**, the browser tries the preferred provider (last-used,
   persisted in `localStorage`).
2. **If it fails fast** (QAA's `connect` has a 25s timeout for dashscope,
   25s for s2s — but the s2s `connectTimeoutMessage` fires if the local
   S2S server isn't running), fall back to the other provider.
3. **Background health probe:** every 30s, ping `wss://dashscope.aliyuncs.com`
   (a cheap TLS handshake) to detect online state. If offline → auto-switch
   to `speech-to-speech`; when back online → switch back to `dashscope`.

This logic lives in the browser (a small `useVoiceMode` hook wrapping
QAA's `useRealtimeVoice`), not in the Gateway — so it works without
modifying QAA's server. Pseudocode:

```ts
function useVoiceMode() {
  const [mode, setMode] = useState<"online" | "offline">(
    () => localStorage.getItem("voiceMode") ?? "online",
  );
  const [dashscopeReachable, setDashscopeReachable] = useState(true);

  // Background probe — DashScope reachability
  useEffect(() => {
    const probe = setInterval(async () => {
      try {
        await fetch("https://dashscope.aliyuncs.com", {
          mode: "no-cors",
          signal: AbortSignal.timeout(3000),
        });
        setDashscopeReachable(true);
      } catch {
        setDashscopeReachable(false);
      }
    }, 30_000);
    return () => clearInterval(probe);
  }, []);

  // Auto-fallback: if online mode selected but DashScope unreachable → offline
  const effectiveProvider =
    mode === "online" && !dashscopeReachable
      ? "speech-to-speech" // auto-fallback
      : mode === "online"
        ? "dashscope"
        : "speech-to-speech";

  return { mode, setMode, effectiveProvider, dashscopeReachable };
}
```

Then pass `effectiveProvider` as `realtimeProvider` to QAA's hook. The
manual toggle (`setMode`) overrides; the auto-fallback only kicks in when
the selected provider is unreachable.

### The full hybrid architecture

```
agent-meow dashboard
  ┌─────────────────────────────────────────────┐
  │  [paw-talk]  [waveform]   [Online ☁️ | Offline 🏠] │
  └──────────────────────┬──────────────────────┘
                         │ (realtimeProvider in connect event)
                         ▼
                 QAA Gateway (:3101)
                         │
            ┌────────────┴────────────┐
            │                         │
   dashscope provider        speech-to-speech provider
   (isConfigured: API key)   (isConfigured: S2S URL)
            │                         │
            ▼                         ▼
   wss://dashscope.aliyuncs.com   ws://127.0.0.1:8765/v1/realtime
   (cloud, ~0s cold start)         (local S2S: faster-whisper + Hermes + Kokoro)
                                   (90s warmup, but free forever)

   ── backend agent (Path B, both modes) ──
   QAA ACP → agent-meow runner → Hermes (:8642)
   (Hermes is local Docker, works in both online & offline modes)
```

### Mode comparison

| Aspect                 | Online (DashScope)         | Offline (Local S2S)                             |
| ---------------------- | -------------------------- | ----------------------------------------------- |
| Cold start             | ~0s (always-on cloud)      | 90s warmup (faster-whisper + Kokoro)            |
| Cost                   | Free 90d, then ~¥0.20/min  | Free forever                                    |
| Quality                | Cloud S2S (qwen-audio-3.0) | Local: faster-whisper + Hermes LLM + Kokoro TTS |
| Needs internet         | Yes                        | No (fully local)                                |
| Backend agent (Hermes) | Works (Path B)             | Works (Hermes is local Docker)                  |
| Best for               | Daily driving, low latency | Travel, offline, privacy, zero cost             |

### What you need to build

1. **QAA Gateway config** (above) — both providers configured. ~5 min.
2. **Start the local S2S server** when you want offline available — use
   the existing `scripts/start-voice-stack.ps1` (or the watchdog). QAA's
   s2s provider `isConfigured()` checks the URL is set, not that the
   server is running — so it's advertised even when S2S is down; the
   fallback probe catches the connect failure.
3. **Port QAA's `useRealtimeVoice.js`** into `VoicePanel.tsx` (Stage 2).
   The provider dropdown comes for free (`realtimeProviders.length > 1`).
4. **Add `useVoiceMode`** hook (~30 lines) for the auto-fallback probe +
   the manual toggle UI in the MeowCat shell. This is the only new
   agent-meow code.
5. **Keep both stacks running** in the background: QAA Gateway always;
   local S2S optional (start it when you want offline mode available).

### Why this is the optimum setup

- **Online default** = zero warmup, best UX (the #1 pain, solved).
- **Offline fallback** = zero cost, privacy, works on a plane.
- **Manual toggle** = user control (the dashboard switch you asked for).
- **Auto-fallback** = graceful — if DashScope is unreachable (network
  drop, quota exhausted), voice silently moves to local without the user
  noticing unless they watch the toggle.
- **Hermes backend** works in both modes (it's local Docker, independent
  of the realtime provider) — so Path B (tool-using voice) is available
  online OR offline.

This is the karpathy-optimal hybrid: the simplest design that gives you
both zero-latency-when-online and zero-cost-when-offline, with a single
manual switch and automatic failover.

## Hermes Docker vs Native Windows — response-time benchmark (2026-08-04)

> Is the Docker-hosted Hermes gateway (:8642) slower than a native
> Windows install? Measured + researched.

### Current setup (measured)

- **Image:** `ghcr.io/jzkk720/hermes-agent:latest` — **Linux/amd64**
  (runs inside the Docker Desktop Linux VM)
- **Network:** custom bridge `hermes-agent_default`, container IP
  `172.20.0.4`, published port `0.0.0.0:8642->8642/tcp`
- **Containers:** `hermes-gateway` (8642/8644/8789), `hermes-web` (9119),
  `hermes-postgres` (5433)

### Measured latency (localhost round-trip, 30 HTTP requests)

| Path                                                   | avg       | min   | max   |
| ------------------------------------------------------ | --------- | ----- | ----- |
| Host → `127.0.0.1:8642` (through Docker Desktop proxy) | **1.8ms** | 1.4ms | 4.7ms |

The request hits the Docker Desktop backend (`com.docker.backend.exe`),
which forwards over a **shared-memory channel** into the Linux VM, then
NAT to the container. Despite that hop chain, the measured round-trip is
~1.8ms — the shared-memory transport is fast.

### The Docker Desktop networking path (why it's still fast)

From Docker's own docs: outbound/inbound localhost traffic goes
host → `com.docker.backend` → **shared-memory channel** → Linux VM →
container `eth0`. This is NOT a traditional TCP socket through a virtual
NIC — it's a memory-channel proxy, so localhost latency stays sub-2ms.
The overhead is real but small (a user-space proxy hop + context switch),
not a network round-trip.

### Native Windows Hermes — fully supported

NousResearch now officially supports **native Windows** (no WSL):

> "Heads up: Native Windows runs Hermes without WSL — CLI, gateway, TUI,
> and tools all work natively."

Install (PowerShell, no admin required):

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

Installs to `%LOCALAPPDATA%\hermes` — uv, Python 3.11, Node.js, ripgrep,
ffmpeg, and a portable Git Bash. The gateway runs as a native Windows
process, listening on `127.0.0.1:8642` directly (no VM, no proxy).

### Docker vs Native — comparison

| Aspect                        | Docker (current)                                    | Native Windows                                                    |
| ----------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| localhost RTT (measured)      | **~1.8ms** (through VM proxy)                       | **~0.1-0.5ms** (direct loopback, no proxy)                        |
| Cold start (container boot)   | ~5-10s (VM already running) / ~30s+ (cold VM start) | ~2-5s (process start, no VM)                                      |
| Steady-state overhead         | Proxy hop + context switches (~1.5ms/req)           | None (direct TCP loopback)                                        |
| Memory overhead               | Linux VM + 3 containers (~1-2GB RAM)                | Just the process (~200-400MB)                                     |
| Isolation                     | Strong (Linux container)                            | Weak (shares host OS)                                             |
| Postgres dependency           | Bundled (`hermes-postgres` container)               | Need to install/run Postgres separately                           |
| Updates                       | `docker pull` (image swap)                          | `hermes update` (in-place)                                        |
| WSL/Linux tools compatibility | Native (it IS Linux)                                | Bundled Git Bash (MinGit) — works for shell tools, not full Linux |
| Multi-container orchestration | `docker-compose` (gateway + web + db)               | Manual (start each process)                                       |

### Is the latency difference meaningful for voice?

**For the voice use case: marginal.** The Hermes LLM response time
itself (the actual model inference) is **1.5–90 seconds** for a coding
prompt (measured in the S2S read-timeout-fix work). The ~1.8ms Docker
network overhead is **0.002–0.1%** of the total response time. Switching
to native saves ~1.5ms per request — invisible to the user.

**For Path B (high-frequency ACP tool calls): slightly more relevant.**
If the backend agent makes many small tool calls in sequence (e.g. 20
file reads), Docker adds ~20 × 1.8ms = ~36ms total. Still small vs the
LLM thinking time, but measurable in a tight loop. Native would cut
that to ~20 × 0.3ms = ~6ms.

### Recommendation

**Keep Docker for now.** The measured ~1.8ms localhost overhead is
negligible compared to LLM inference time (seconds). Docker gives you:

- Strong isolation (Hermes runs in a Linux container, can't affect host)
- Easy orchestration (gateway + web + postgres in one compose)
- Easy updates (`docker pull`)
- The same environment as production deployments

**Switch to native only if:**

1. You need to reclaim the ~1-2GB RAM the Docker VM uses, OR
2. You're doing high-frequency ACP tool loops where 1.5ms × N matters, OR
3. You want Hermes to start faster after a reboot (no VM boot delay), OR
4. Docker Desktop itself is causing issues (resource-saver mode, WSL
   conflicts, etc.)

If you do switch, the native install is one PowerShell line
(`iex (irm .../install.ps1)`), runs as a normal Windows process, and
agent-meow connects to it the same way (`http://127.0.0.1:8642/v1`).
The only extra work is running Postgres natively (or using SQLite if
Hermes supports it for single-user mode).

### The real bottleneck is LLM inference, not the network

The S2S read-timeout fix (see repo memory `s2s-read-timeout-fix.md`)
showed Hermes takes 1.5–90s per response for coding prompts. That's
**3-5 orders of magnitude** larger than the Docker-vs-native network
difference. Optimizing the network hop is premature optimization — the
LLM model size, quantization, and prompt complexity dominate.

If you want faster Hermes responses, the levers are:

- Smaller/faster model (qwen3.7-flash instead of qwen3.7-max)
- Quantization (if running a local model in the gateway)
- Prompt caching (Hermes supports context caching)
- Speculative decoding (if the backend supports it)

None of those are affected by Docker-vs-native.

## S2S warmup optimization — machine profile + GPU acceleration (2026-08-04)

> The local S2S server stays as the offline fallback, so the 90s warmup
> is still a real bottleneck. Can we cut it? Deep-research + machine
> profiling.

### Machine profile (verified)

| Component  | Value                                                                      | Compute relevance                                 |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| CPU        | AMD Ryzen AI MAX+ 395 (16C/32T, 3.0GHz)                                    | Fast, but STT/TTS model loading is the bottleneck |
| RAM        | 31.6 GB                                                                    | Plenty for all models                             |
| iGPU       | AMD Radeon 8060S Graphics (Vulkan 1.4.329)                                 | **GPU STT is possible** via whisper.cpp Vulkan    |
| NPU        | AMD XDNA 2 (`PCI\VEN_1022&DEV_17F0`, status OK)                            | Available but no Whisper support yet              |
| ROCm       | **AMD ROCm 7.1 installed** (`C:\Program Files\AMD\ROCm\7.1\bin\hipcc.exe`) | **GPU STT via whisper.cpp HIP/ROCm**              |
| Vulkan SDK | `vulkaninfo.exe` present, GPU0 = AMD Radeon 8060S                          | **GPU STT via whisper.cpp Vulkan**                |

### Root cause of the 90s warmup

The current S2S stack runs **everything on CPU**:

| Component | Engine                       | Device         | Warmup cause                                                                                                         |
| --------- | ---------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| STT       | faster-whisper (CTranslate2) | `--device cpu` | CTranslate2 **only supports CUDA** for GPU — no AMD/ROCm/Vulkan backend. Loads ~1.5GB model weights into CPU memory. |
| LLM       | Hermes (Docker, remote)      | network        | No local warmup — Hermes is already running. The ~90s is mostly STT + TTS.                                           |
| TTS       | Kokoro-82M (CPU)             | CPU            | Loads model weights into CPU memory.                                                                                 |
| VAD       | Silero (CPU, in-process)     | CPU            | Tiny (~2MB), negligible warmup.                                                                                      |

**The 90s is ~60s STT model load + ~30s TTS model load + warmup LLM call.**
The GPU and NPU are **sitting idle** the entire time.

### Solution: whisper.cpp with Vulkan or ROCm for STT

**whisper.cpp** supports your AMD GPU via two paths:

1. **Vulkan** (cross-vendor, easiest): `cmake -B build -DGGML_VULKAN=1`
   - Works with any Vulkan-compatible GPU (your Radeon 8060S confirmed)
   - No ROCm-specific driver needed
   - Build: `git clone whisper.cpp && cmake -B build -DGGML_VULKAN=1 && cmake --build build -j --config Release`
   - Run: `whisper-cli -m models/ggml-medium.bin -f audio.wav`
   - Model load is near-instant on GPU (weights stay in VRAM, not paged into CPU memory)

2. **AMD ROCm/HIP** (AMD-native, potentially faster): `cmake -B build -DGGML_HIP=1`
   - ROCm 7.1 is already installed on this machine
   - Need to determine the GPU architecture (`rocminfo | grep gfx`)
   - Build: `cmake -B build -DGGML_HIP=1 -DAMDGPU_TARGETS="gfxXXXX"`
   - May give better performance than Vulkan for AMD-specific kernels

### Expected warmup reduction

| Approach                          | STT warmup                 | TTS warmup        | Total warmup | Notes                                 |
| --------------------------------- | -------------------------- | ----------------- | ------------ | ------------------------------------- |
| Current (CPU)                     | ~60s                       | ~30s              | **~90s**     | faster-whisper CPU + Kokoro CPU       |
| whisper.cpp Vulkan (STT only)     | **~3-5s** (GPU model load) | ~30s (Kokoro CPU) | **~35s**     | Big STT win; TTS unchanged            |
| whisper.cpp Vulkan + Kokoro GPU   | ~3-5s                      | **~2-3s**         | **~8s**      | Need to check if Kokoro supports GPU  |
| Pre-loaded (warm pool / watchdog) | 0s                         | 0s                | **~0s**      | Already have a watchdog; keep it warm |

### The architecture change

Currently the S2S server uses `faster-whisper` as the STT backend
(`--stt faster-whisper` in the startup scripts). The S2S package
(`speech-to-speech`) also supports `--stt paraformer` and potentially
a custom STT backend. **whisper.cpp has a `whisper-server` mode** that
exposes an OpenAI-compatible HTTP API — it could serve as a drop-in
STT endpoint.

But the simpler path: **build whisper.cpp with Vulkan, pre-load the
model at boot, and keep the process warm.** The S2S server connects to
it via HTTP instead of loading the model in-process. The warmup drops
from 60s to ~3s (one-time GPU model load at boot).

### Pre-warmup strategy (non-blocking startup)

The goal is "next to zero delays" for the user. Three layers:

1. **Boot-time pre-load** (background, before user clicks paw-talk):
   - Start whisper.cpp `whisper-server` with Vulkan at system boot
   - It loads the model into GPU VRAM immediately (~3-5s, invisible to user)
   - Keep it running as a background service (like the current watchdog)

2. **Kokoro TTS pre-load** (background):
   - Start Kokoro with a dummy text at boot to warm the model
   - Keep the S2S process running (warm pool, pool size 1)

3. **Hermes is already warm** (Docker, always running)

Result: by the time the user clicks the paw-talk button, **all three
components are already loaded and warm**. The first voice round-trip
is ~0s warmup + LLM inference time (1.5-90s depending on prompt).

### whisper.cpp as the STT backend — integration options

**Option A: whisper-server as an HTTP STT endpoint (simplest)**

```
whisper-server --host 127.0.0.1 --port 8888 -m models/ggml-medium.bin
```

whisper.cpp ships a `whisper-server` example that exposes an
OpenAI-compatible transcription API. The S2S server could use it as a
remote STT backend instead of in-process faster-whisper. This requires
checking if the `speech-to-speech` package supports custom STT endpoints.

**Option B: Replace faster-whisper with whispercpp Python binding**
The `whispercpp` Python package (`pip install whispercpp`) wraps
whisper.cpp and supports Vulkan. The S2S server's STT module would
load the model via `whispercpp` instead of `faster_whisper`. This is a
code change in the S2S package's STT handler.

**Option C: Standalone whisper.cpp stream (separate from S2S)**
Run `whisper-stream` (real-time mic transcription with Vulkan) as a
separate process. Feed its text output to the S2S LLM + TTS pipeline.
This bypasses the S2S STT entirely — the S2S server only handles
LLM + TTS. More moving parts but decouples STT from the S2S package.

### Recommended warmup optimization plan

| Priority | Action                                                      | Effort                             | Expected gain                |
| -------- | ----------------------------------------------------------- | ---------------------------------- | ---------------------------- |
| **P0**   | Build whisper.cpp with Vulkan, run `whisper-server` at boot | Medium (CMake build + boot script) | STT warmup 60s → ~3s         |
| **P1**   | Wire whisper-server as the S2S STT backend                  | Medium (S2S config or code patch)  | End-to-end warmup 90s → ~35s |
| **P2**   | Pre-warm Kokoro TTS at boot (dummy text generation)         | Low (startup script tweak)         | TTS warmup 30s → ~0s         |
| **P3**   | Keep the existing watchdog + warm pool running              | Already done                       | First-request warmup → 0s    |
| **P4**   | Explore Kokoro GPU acceleration (DirectML/ROCm)             | Research needed                    | If viable: TTS on GPU too    |
| **P5**   | Explore NPU STT when winml adds Whisper support             | Blocked until late 2026            | Future: NPU STT              |

### The non-blocking startup sequence (target)

```powershell
# At system boot (background, invisible to user):
# 1. Hermes Docker (user manages, already running)
# 2. whisper-server with Vulkan (new):
Start-Process whisper-server -ArgumentList "--host 127.0.0.1 --port 8888 -m models/ggml-medium.bin" -WindowStyle Hidden
# 3. S2S server with warmup (existing, modified to use whisper-server for STT):
Start-Process speech-to-speech -ArgumentList "--stt whisper-server --stt_url http://127.0.0.1:8888 ..."
# 4. QAA Gateway:
Start-Process qwenaudio -WindowStyle Hidden
# 5. Vite dev server:
Start-Process npm -ArgumentList "run dev" -WindowStyle Hidden

# User opens browser → paw-talk → voice is HOT immediately
# (all models pre-loaded in VRAM/RAM, no cold start)
```

### Bottom line

The 90s warmup is **not a hardware limitation** — your machine has an
AMD Radeon 8060S iGPU + XDNA 2 NPU + ROCm 7.1, and they're all sitting
idle while faster-whisper runs on CPU. **whisper.cpp with Vulkan** can
put STT on the GPU, cutting STT warmup from ~60s to ~3s. Combined with
the existing watchdog pre-warm strategy, the total warmup can drop from
90s to **~8s** (STT GPU load + TTS CPU load) or **~0s** if the warm pool
keeps everything hot.

This is the **offline-mode warmup fix** that makes the local S2S path
viable as a near-zero-delay fallback — closing the gap with the online
DashScope cloud path.
