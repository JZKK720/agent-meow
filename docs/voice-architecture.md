# Voice Stack Architecture

**Status:** Canonical — fork `main` is the source of truth.
**Last verified:** 2026-08-24

This document captures the voice pipeline design decisions, tuning parameters,
and experimental alternatives so future sessions don't re-guess them.

---

## Pipeline overview

```
Mic → Silero VAD (ONNX worklet, @ricky0123/vad-web)
  → speech segment (16 kHz mono PCM16)
  → POST /v1/audio/transcriptions  [STT: Hermes faster-whisper :8642]
  → transcript
  → POST /v1/chat/completions       [LLM: cloud model, stream:true]
  → SSE text_delta events
  → accumulate sentences (split at 16+ chars, max 80)
  → POST /tts                        [TTS: qwentts.cpp Vulkan :8890, RTF 0.29]
  → WAV audio chunks (24kHz mono S16)
  → play per-sentence (~1-3s to first audio — RTF 0.29 is 6.9x faster than PyTorch)
```

Wake word (橘宝/jubao + homophones) detection runs inside the same VAD
pipeline — one mic consumer, STT per speech segment, keyword check via
`containsWakeWord()`. No separate SpeechRecognition-based detector.

---

## STT — Hermes faster-whisper (canonical)

**Decision:** Hermes faster-whisper is the canonical STT engine.

- **Endpoint:** `http://127.0.0.1:8642/v1/audio/transcriptions`
- **Env var:** `HERMES_STT_URL` (e.g. `http://127.0.0.1:8642/v1/audio/transcriptions`)
- **Model:** faster-whisper (runs inside the Hermes Docker container)
- **Auth:** `HERMES_API_KEY` header (shared with Hermes gateway)
- **No `model` field needed** in the multipart body (Hermes doesn't require it)

### Language handling

- Default `sttLanguage` is `'zh'` (not `'auto'`) — auto-detect on real mic
  audio defaults to English, pinning `'en'` after 2 misdetections.
- Don't reset to `'auto'` on empty transcripts when already `'zh'` — VAD
  splits cause empty fragments that trigger false language resets.

### Lemonade STT (experimental alternative — NOT default)

**Decision:** Lemonade STT is kept as an optional, env-gated alternative.
It was tested and **did not outperform** Hermes faster-whisper on this
local runtime.

- **Env var:** `LEMONADE_STT_URL` (e.g. `http://127.0.0.1:13305`)
- **Model:** Whisper-Large-v3-Turbo (on NPU/GPU via lemonade server)
- **Requires `model` field** in multipart body (injected by voice proxy)
- **No auth** when lemonade is configured (runs locally)
- **Supervisor:** `service_supervisor.py` can auto-spawn `lemonade.server`
  on `:13305` when `LEMONADE_STT_URL` is set.

The lemonade code path is cleanly isolated:
- `dictation.py`: `_is_lemonade_stt()` guard, `_lemonade_stt_model()` injection
- `voice_proxy.py`: routes `/v1/audio/transcriptions` to lemonade when configured
- `stack_status.py`: probes lemonade `/v1/models` only when `LEMONADE_STT_URL` is set
- `FirstBootChecklist`: lemonade row is conditional on the env var

**Keeping it is free** — when `LEMONADE_STT_URL` is unset, all lemonade code
paths are skipped. No churn from removing it; no risk from keeping it.

---

## TTS — qwentts.cpp Vulkan (canonical, production)

**Decision:** qwentts.cpp Vulkan (GGUF Q8_0, `tts-server.exe` + FastAPI
wrapper) is the canonical TTS backend. It is **much better in performance**
than the PyTorch+ROCm path — 6.9x faster (RTF 0.29 vs 1.8), 2.7x less VRAM,
and bypasses MIOpen entirely via cross-vendor Vulkan.

This is the TTS backend designated for the desktop `.exe` packaging (see
`docs/superpowers/specs/2026-08-24-desktop-exe-packaging-design.md`) and
supervised by `service_supervisor.py` as a managed child process.

### Architecture

```
voice_proxy / hermesVoice.ts
  → POST :8890/tts (qwentts_wrapper.py — FastAPI)
    → POST :8891/v1/audio/speech (tts-server.exe — native C++ Vulkan)
      → raw PCM S16 24kHz mono
    ← WAV (wrapper converts PCM → WAV)
  ← audio/wav
```

- **Binary:** `tts-server.exe` (built from https://github.com/ServeurpersoCom/qwentts.cpp)
- **Build:** MSVC + CMake + GGML Vulkan (`buildvulkan.cmd`)
- **Models:** `qwen-talker-1.7b-customvoice-Q8_0.gguf` (1.95 GB) +
  `qwen-tokenizer-12hz-Q8_0.gguf` (278 MB) = **2.2 GB total**
- **Ports:** `tts-server.exe` on `:8891`, wrapper on `:8890`
- **Env vars:** `QWENTTS_SERVER` (default `http://127.0.0.1:8891`),
  `QWENTTS_WRAPPER_PORT` (default `8892`, but supervisor maps wrapper to `:8890`)
- **VRAM:** ~2.2 GB (vs 6 GB for PyTorch bf16)

### Performance

| Metric | PyTorch+ROCm | qwentts.cpp+Vulkan | Improvement |
|---|---|---|---|
| RTF | ~1.8x | 0.29x | **6.9x faster** |
| VRAM | 6 GB | 2.2 GB | 2.7x less |
| TTFA | N/A | 46.7ms | New |
| Backend | MIOpen (slow) | Vulkan (cross-vendor) | Bypasses MIOpen |

Per-frame: 8.17ms talker + 10.13ms code predictor = 18.3ms/frame.
At 12.5 Hz, 1 frame = 80ms audio → RTF = 18.3/80 = 0.23.

### Why HTTP server, not CLI subprocess

The subprocess approach (`qwen-tts.exe` per request) reloads the model
each call (RTF 1.89) — unacceptable. The HTTP server (`tts-server.exe`)
keeps the model loaded in VRAM (RTF 0.29). See commit `33d51f10e`.

### Sampling

`tts-server.exe` uses default params (temp=0.9, top_p=1.0). Q8_0
quantization constrains sampling enough that duration spread is only
0.08s across 3 runs — stable enough for voice.

### Wrapper

`scripts/qwentts_wrapper.py` — thin FastAPI proxy that:
1. Forwards `/tts` requests to `tts-server.exe` on `:8891`
2. Converts raw PCM S16 24kHz → WAV
3. Exposes `/health` and `/tts/stream` (same API as `qwen3_tts_server.py`)

This makes it a **drop-in replacement** for the PyTorch server — the voice
proxy and frontend don't need to know which backend is running.

### Supervisor

`service_supervisor.py` spawns and supervises both processes:
- `tts-server.exe` on `:8891` (native C++ Vulkan binary)
- `qwentts_wrapper.py` on `:8890` (Python FastAPI)
- Event-driven crash restart with backoff (3 attempts, 5s/10s/30s)

### Text sanitization (applied before TTS, in voice pipeline)

Before sending text to TTS, strip paralinguistic content:
- `喵` → comma (Qwen3-TTS vocalizes as actual cat meow)
- `哈哈`, `嗯嗯`, `啊啊` → stripped (vocalized as laughter, humming)
- Collapse consecutive commas left by stripping

### Sentence splitting (applied before TTS, in voice pipeline)

- `CLAUSE_SPLIT_MIN = 16` (was 12 for 0.6B)
- `maxLen = 80` (was 60)
- Sweet spot for 1.7B: 33% faster than 0.6B for medium-long sentences
- Most sentences land in the 16-80 char range where 1.7B is fastest

### PyTorch+ROCm (development fallback)

**Status:** Fallback for development / when `tts-server.exe` is unavailable.

- **Server:** `python scripts/qwen3_tts_server.py --port 8890 --model 1.7b`
  with `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1`
- **Weights:** `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` (3.66 GB + 651 MB tokenizer)
- **Decoding:** Greedy (`do_sample=False`, `GREEDY_MODE=True`)
- **Attention:** SDPA flash via AOTRITON (9.61x faster than MATH)
- **VRAM:** ~6 GB
- **RTF:** ~1.8x (6.9x slower than Vulkan)

The PyTorch path shares the same `/tts` and `/health` API, so the voice
proxy can target either backend by changing `QWEN_TTS_URL`.

---

## LLM — Cloud model for voice turns

**Decision:** Voice turns use a cloud model to avoid local LLM latency.

- **Model:** deepseek-v4-flash (cloud) — switched in commit `361bc2049`
- **Previous:** local nemotron-3.5-lightning:30b-a3b (Q4_K_M) — 32s latency
  from 19.8k-token prompt inflation (system prompt + tool schemas + skills
  + memory sent for every turn)
- **Hermes gateway:** routes the request, handles streaming SSE

### Known issue: speculative LLM 0-delta bug

The speculative LLM path sometimes produces 0 buffered deltas:
1. Speculative STT fires at ~0.8s silence, gets transcript
2. `startSpeculativeLlm(text)` opens a session stream, waits for heartbeat
3. If the stream fails silently (`.catch(() => {})` swallows errors),
   `speculativeLlmDone` is set to true with 0 deltas
4. `processTurn` adopts the speculative stream, sees 0 deltas, exits → no TTS

**Fix direction:** Remove the `.catch(() => {})` in `startSpeculativeLlm`,
log the error to see why the stream produces 0 deltas.

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `HERMES_STT_URL` | `http://127.0.0.1:8642/v1/audio/transcriptions` | Canonical STT endpoint |
| `HERMES_API_KEY` | (set in `.env`) | Auth for Hermes gateway |
| `LEMONADE_STT_URL` | (unset) | Optional lemonade STT — experimental, underperformed |
| `LEMONADE_STT_MODEL` | `Whisper-Large-v3-Turbo` | Model id for lemonade (required field) |
| `QWEN_TTS_URL` | `http://127.0.0.1:8890` | TTS wrapper endpoint (qwentts.cpp or PyTorch — same API) |
| `QWENTTS_SERVER` | `http://127.0.0.1:8891` | Upstream tts-server.exe (native C++ Vulkan binary) |
| `QWENTTS_WRAPPER_PORT` | `8892` | Wrapper port (supervisor maps it to :8890) |
| `VITE_HERMES_MODEL` | `hermes-agent` | LLM model id for Hermes gateway |

---

## Startup commands

### TTS — qwentts.cpp Vulkan (canonical)

```bash
# 1. Start the native C++ Vulkan binary (keeps model in VRAM)
tts-server.exe --port 8891

# 2. Start the FastAPI wrapper (PCM→WAV, drop-in API)
python -m uvicorn scripts.qwentts_wrapper:app --port 8890
```

Or via the service supervisor (spawns both as supervised children):
```python
# The supervisor starts tts-server.exe :8891 + wrapper :8890
# with event-driven crash restart (backoff: 3 attempts, 5s/10s/30s)
```

### TTS — PyTorch+ROCm (development fallback)

```bash
TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1 \
  python scripts/qwen3_tts_server.py --port 8890 --model 1.7b
```

### Hermes gateway (Docker)

```bash
docker compose -f deploy/docker/compose.yaml up hermes-gateway
```

Config lives in the Docker volume `/opt/data/config.yaml` — not in the repo.
`deploy/docker/hermes-config.yaml` is a template that seeds on first boot only.

### Lemonade STT (optional, experimental)

```bash
python -m lemonade.server --port 13305
# Set LEMONADE_STT_URL=http://127.0.0.1:13305
```

---

## Key files

| File | Role |
|---|---|
| `agent_meow/server/voice_proxy.py` | Routes STT/TTS requests, injects lemonade model field |
| `agent_meow/server/dictation.py` | STT URL resolution (lemonade vs Hermes), language handling |
| `agent_meow/server/service_supervisor.py` | Spawns/supervises lemonade STT + tts-server |
| `agent_meow/server/stack_status.py` | Health checks for lemonade_stt, tts, services |
| `web/src/lib/hermesVoice.ts` | Client-side voice transport (VAD → STT → LLM → TTS) |
| `web/src/hooks/useWakeWordDetector.ts` | Wake word detection via VAD pipeline |
| `web/src/lib/wakeWords.ts` | Wake word list + `containsWakeWord()` |
| `web/vite.config.ts` | Vite proxy config for STT/TTS/Hermes endpoints |
| `scripts/qwentts_wrapper.py` | FastAPI wrapper around tts-server.exe (canonical TTS) |
| `scripts/qwen3_tts_server.py` | Qwen3-TTS HTTP server (PyTorch+ROCm fallback) |

---

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-24 | Hermes faster-whisper is canonical STT | Lemonade underperformed in testing |
| 2026-08-24 | Keep lemonade code as optional, env-gated | No cost when disabled; preserves work |
| 2026-08-24 | qwentts.cpp Vulkan is canonical TTS | 6.9x faster (RTF 0.29 vs 1.8), 2.7x less VRAM, bypasses MIOpen |
| 2026-08-24 | PyTorch+ROCm TTS is development fallback | Same API, 6.9x slower, used when tts-server.exe unavailable |
| 2026-08-23 | Qwen3-TTS 1.7B + greedy tuning established | SOTA quality, deterministic, fine-tuned splitting/sanitization |
| 2026-08-22 | Cloud LLM for voice turns | Local nemotron 32s latency from prompt inflation |
