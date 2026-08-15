---
name: voice-stack-diagnose
description: >
  Diagnose agent-meow voice/TTS failures — "no audio back", "voice replies
  hang", "transcripts appear but no response", or "utterances chopped into
  fragments". Use when the mic→STT→LLM→TTS pipeline misbehaves, when TTS is
  silent or intermittent, or when you need to tell whether Edge TTS or
  Qwen3-TTS served a reply. Covers the full stack: Hermes :8642, Qwen3-TTS
  :8889, Vite proxy :5173, and the browser hermesVoice.ts client.
license: MIT
metadata:
  author: agent-meow
  version: "1.0"
---

# Voice stack diagnosis — mic → STT → LLM → TTS

Golden path for isolating voice failures in agent-meow. The pipeline is:
mic → POST /v1/audio/transcriptions (STT) → POST /v1/chat/completions
(LLM, SSE) → POST /v1/audio/speech (TTS) → browser playback. A break at ANY
stage looks like "no voice back", so probe each stage independently before
touching code.

**Failure pattern:** voice replies die silently, hang forever, or arrive as
chopped fragments — while individual services appear "up" (ports listening).
**Verified by:** Edge TTS probe returned 200 + decodable MP3, Qwen3-TTS log
showed zero requests (fallback never fired), and the user heard audio after
the fix. Not "seemed to work".

## Stack map (ports + roles)

| Port  | Service              | Role                               |
| ----- | -------------------- | ---------------------------------- |
| :5173 | Vite dev server      | Serves SPA + proxies /v1/\*        |
| :8642 | Hermes voice gateway | STT + LLM + **Edge TTS** (primary) |
| :8889 | Qwen3-TTS server     | Offline TTS fallback (CPU, slow)   |
| :6767 | agent-meow backend   | Sessions, agents, catalog          |

Vite proxy routes (web/vite.config.ts):

- `/v1/audio/transcriptions` → Hermes :8642
- `/v1/audio/speech/edge` → Hermes :8642 `/v1/audio/speech` (Edge TTS)
- `/v1/audio/speech` → Qwen3-TTS :8889 `/tts` (fallback)
- `/v1/chat/completions` → Hermes :8642 (SSE)

**API key:** `web/.env` → `VITE_HERMES_API_KEY` (baked into the bundle).
Always send it as `Authorization: Bearer <key>` on Edge/chat probes, or you
get a false **401**. Never commit the value.

## Procedure

- [ ] 1. **Confirm services are LISTENING** (not just "started"):
     `netstat -ano | Select-String ":8889|:8642|:6767|:5173" | Select-String LISTENING`.
     A listening port does NOT mean healthy — Qwen3-TTS can listen and still
     be wedged.
- [ ] 2. **Probe each pipeline stage independently** through the Vite proxy
     (that's what the browser uses). Use the probe script pattern in
     `dev/` (PowerShell `Invoke-WebRequest`). Order: Edge TTS → Qwen TTS →
     chat completions → Hermes /health. Read results from the output FILE —
     this terminal swallows inline output.
- [ ] 3. **Check the Qwen3-TTS log** (`dev/qwen-tts.log` / `-err.log`) for new
     `POST /tts` lines. Zero new lines = the fallback never fired = Edge is
     serving. This is the fastest way to tell which engine answered.
- [ ] 4. **Verify the served bundle has your fix.** Fetch
     `/src/lib/hermesVoice.ts` from :5173 and grep for your change. NOTE:
     esbuild minifies numeric literals (`20000` → `2e4`) and strips comments,
     so grep for a stable string, not the raw literal.
- [ ] 5. **Test the REAL playback path**, not just fetch+decode. A round-trip
     that only does `fetch` + `decodeAudioData` does NOT prove audio plays.
     You must create an `AudioContext`, `resume()` it, build a
     `BufferSource`, `connect(destination)`, and `start()` it, then confirm
     `ctx.state === "running"` at start.

### Probe script skeleton

```powershell
$key = "<from web/.env VITE_HERMES_API_KEY>"
# Edge TTS (primary) — must include Bearer key or you get 401
Invoke-WebRequest -Uri 'http://127.0.0.1:5173/v1/audio/speech/edge' `
  -Method POST -Body '{"input":"test","response_format":"mp3"}' `
  -ContentType 'application/json' -Headers @{Authorization="Bearer $key"} `
  -TimeoutSec 15 -UseBasicParsing
# Qwen TTS (fallback) — no key needed
Invoke-WebRequest -Uri 'http://127.0.0.1:5173/v1/audio/speech' `
  -Method POST -Body '{"text":"hello","language":"English","speaker":"Vivian"}' `
  -ContentType 'application/json' -TimeoutSec 45 -UseBasicParsing
```

## Gotchas

- **Qwen3-TTS can wedge solidly** (listen on :8889 but never respond, >3 min).
  The fallback `fetch` in `synthesize()` MUST carry a timeout
  (`AbortSignal.timeout(20000)`) or one wedged fallback hangs the whole turn
  forever. Restart with `uv run python scripts/qwen3_tts_server.py --port 8889`.
- **`peakRms` must decay.** In `processChunk()` the loudness peak ratchets up
  and never falls; after any loud transient, normal speech reads as "silence"
  and endpointing chops utterances every ~1s. Decay it (`*0.997`, floor ~200)
  and keep the silence window ≥1.4s (`ENDPOINT_SILENCE_CHUNKS`).
- **Edge TTS voice is hard-coded Chinese.** `detectVoice()` always returns
  `zh-CN-XiaoxiaoNeural`, so English replies sound Chinese-accented BY DESIGN
  until the Hermes `/v1/audio/speech` endpoint honors the `voice` param. This
  is not a bug to "fix" casually — it's a documented endpoint limitation.
- **getUserMedia needs a secure context.** `navigator.mediaDevices` is
  undefined on a LAN IP over HTTP (e.g. `http://100.x.x.x:5173`). Only
  `localhost` and HTTPS work. Route all mic calls through
  `acquireMicStream()` (web/src/lib/micPermission.ts) so insecure origins get
  a friendly error instead of a TypeError.
- **This terminal swallows inline output.** Redirect every probe to a file
  under `dev/` and read the file back. Also `powershell.exe`/cmdlets
  intermittently fail to resolve — invoke via full path
  `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` or run a `.ps1`.
- **Vite dev server caches transforms.** When checking the served bundle, add
  `?t=<Date.now()>` and `cache:"no-store"` or you may read a stale module.

## Per-stage timing baseline (measured 2026-08-15)

Use these to judge whether a stage is regressed. Measure, don't guess.

| Stage                                        | Typical   | Notes                                                                   |
| -------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| Endpoint silence wait                        | 1.4s      | Fixed by design (`ENDPOINT_SILENCE_CHUNKS=14`)                          |
| STT (warm)                                   | 245–460ms | faster-whisper, warmed by silent-WAV preflight                          |
| Intent classify                              | ~0ms      | Keyword-only since the LLM classifier was removed (saved up to 3s/turn) |
| LLM TTFB (`hermes-agent`, warm)              | ~3.9s     | Cold start can hit 25s                                                  |
| LLM TTFB (`auto` → local Ollama qwen3.6:35b) | 15–31s    | **Slower, not faster** — see below                                      |
| TTS Edge (single sentence)                   | ~3s       | Network-bound to Microsoft                                              |
| TTS Edge (11 parallel)                       | 3.6–11.9s | Edge throttles concurrency                                              |
| Decode                                       | 4–15ms    | Negligible                                                              |

**LLM backend facts:** `auto` routes to Ollama's local `qwen3.6:35b-a3b-q8_0`
(36B MoE, ~42GB VRAM) — check with `http://127.0.0.1:11434/api/ps`. Hermes
:8642 `/v1/models` exposes only `hermes-agent`. The LLM stage dominates
perceived voice-reply latency.

## What didn't work

- **Assuming TTS synthesis was broken.** Early probes showed Edge TTS
  returning 200 with valid audio — synthesis was fine the whole time. The real
  faults were a timeout-less fallback, a non-decaying loudness peak, and an
  insecure-context crash. Probe before you patch.
- **A fetch+decode "round-trip test" as proof of playback.** It passed while
  the user still heard nothing, because it never called `source.start()` on a
  running AudioContext. Decode ≠ play.
- **Trusting inline terminal output.** Repeated `Command produced no output`
  even on success. Always write to a file and read it.
- **Switching `VITE_HERMES_MODEL` to `auto` for speed.** A single warm
  measurement showed 1.6s and looked like a win, but repeated runs showed
  15–31s TTFB (local 36B model). The hypothesis was falsified and reverted.
  Lesson: measure a stage ≥3 times before acting on it; one warm outlier lies.
