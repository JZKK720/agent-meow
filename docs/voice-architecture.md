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
  → POST /v1/audio/speech           [TTS: Qwen3-TTS 1.7B :8890, greedy]
  → audio chunks
  → play per-sentence (~5-10s to first audio vs ~60s for full response)
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

## TTS — Qwen3-TTS 1.7B (canonical, fine-tuned)

**Decision:** Qwen3-TTS 1.7B with greedy decoding and current tuning is
the canonical TTS. This setup is much better than the previous 0.6B config
and has been fine-tuned over multiple iterations.

### Model

- **Weights:** `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` (3.66 GB model + 651 MB tokenizer)
- **Server:** `python scripts/qwen3_tts_server.py --port 8890 --model 1.7b`
- **Env var:** `QWEN_TTS_URL` (e.g. `http://127.0.0.1:8890`)
- **Backend:** PyTorch + ROCm (AMD 8060S)
- **Attention:** SDPA flash attention via AOTRITON
  (`TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1`) — 9.61x faster than MATH
- **VRAM:** ~6 GB (107.9 GB total, no pressure alongside Ollama ~38 GB)

### Decoding

- **Greedy mode:** `do_sample=False`, `GREEDY_MODE=True`
- Fully deterministic — no random laughs, breaths, or tune changes
- 1.7B supports instruct control (emotion/style) — 0.6B disabled this

### Sentence splitting

- `CLAUSE_SPLIT_MIN = 16` (was 12 for 0.6B)
- `maxLen = 80` (was 60)
- Sweet spot for 1.7B: 33% faster than 0.6B for medium-long sentences
- Most sentences land in the 16-80 char range where 1.7B is fastest

### Text sanitization

Before sending text to TTS, strip paralinguistic content:
- `喵` → comma (Qwen3-TTS vocalizes as actual cat meow)
- `哈哈`, `嗯嗯`, `啊啊` → stripped (vocalized as laughter, humming)
- Collapse consecutive commas left by stripping

### Benchmark (1.7B + greedy + AOTRITON)

| Test | Synth | Audio | Ratio | vs 0.6B |
|---|---|---|---|---|
| short-5 | 1.77s | 1.12s | 1.58x | -30% (slower for short) |
| medium-15 | 4.92s | 3.17s | 1.55x | -8% |
| medium-30 | 6.33s | 4.75s | 1.33x | +33% (faster) |
| long-60 | 20.64s | 13.39s | 1.54x | N/A |

### qwentts.cpp Vulkan (experimental alternative)

**Status:** Works but has EOS issue — not ready to replace PyTorch path.

- **Repo:** https://github.com/ServeurpersoCom/qwentts.cpp
- **Build:** MSVC + CMake + GGML Vulkan (`buildvulkan.cmd`)
- **Models:** `qwen-talker-1.7b-customvoice-Q8_0.gguf` (1.95 GB) +
  `qwen-tokenizer-12hz-Q8_0.gguf` (278 MB) = 2.2 GB total
- **Performance:** RTF 0.26 (6.9x faster than PyTorch+ROCm), TTFA 46.7ms
- **VRAM:** 2.2 GB (vs 6 GB PyTorch bf16)
- **Issue:** EOS not triggering — generates full `--max-new` tokens without
  stopping. May be Q8_0 quantization or greedy decoding issue.
- **Next step:** Test without `--greedy`, try different sampling params,
  then build a FastAPI wrapper if EOS is resolved.

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
| `QWEN_TTS_URL` | `http://127.0.0.1:8890` | TTS server endpoint |
| `VITE_HERMES_MODEL` | `hermes-agent` | LLM model id for Hermes gateway |

---

## Startup commands

### TTS server

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
| `scripts/qwen3_tts_server.py` | Qwen3-TTS HTTP server (PyTorch+ROCm) |

---

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-24 | Hermes faster-whisper is canonical STT | Lemonade underperformed in testing |
| 2026-08-24 | Keep lemonade code as optional, env-gated | No cost when disabled; preserves work |
| 2026-08-23 | Qwen3-TTS 1.7B + greedy is canonical TTS | SOTA quality, deterministic, fine-tuned |
| 2026-08-23 | qwentts.cpp Vulkan is experimental | EOS issue blocks production use |
| 2026-08-22 | Cloud LLM for voice turns | Local nemotron 32s latency from prompt inflation |
