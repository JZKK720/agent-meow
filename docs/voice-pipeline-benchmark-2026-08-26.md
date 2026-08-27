# agent-meow Voice Pipeline — Full Benchmark & Diagnostic Report

**Generated:** 2026-08-26
**Machine:** AMD Radeon 8060S Graphics (Strix Halo iGPU), Windows 11
**Status:** ✅ Voice pipeline operational (STT + LLM + TTS all working)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ Browser (SPA)                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Mic → VAD    │  │ hermesVoice  │  │ Audio playback│              │
│  │ (Silero)     │→ │ transport    │→ │ (Web Audio)   │              │
│  └──────────────┘  └──────┬───────┘  └──────────────┘              │
│                           │ HTTP POST                                │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │ agent-meow    │  :6767 (loopback)
                    │ server        │  Python 3.12, SQLite
                    │ voice_proxy   │  Mounts /v1/audio/* routes
                    └───┬───┬───┬───┘  when HERMES_VOICE_URL set
                        │   │   │
          ┌─────────────┘   │   └──────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
  │ STT           │ │ LLM           │ │ TTS           │
  │ POST /v1/     │ │ POST /v1/     │ │ POST /v1/     │
  │ audio/        │ │ chat/         │ │ audio/speech  │
  │ transcriptions│ │ completions   │ │               │
  └──────┬────────┘ └──────┬────────┘ └──────┬────────┘
         │                 │                 │
         ▼                 ▼                 ▼
  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
  │ Hermes        │ │ Hermes        │ │ Hermes        │
  │ :8642         │ │ :8642         │ │ :8642         │
  │ (faster-      │ │ (OpenAI API)  │ │ (Edge TTS)    │
  │  whisper)     │ │               │ │ XiaoxiaoNeural │
  │ Docker        │ │ Docker        │ │ Docker        │
  └───────────────┘ └──────┬────────┘ └───────────────┘
                           │
                    ┌──────▼──────┐
                    │ Ollama      │  :11434 (host)
                    │ :11434      │  Local LLM inference
                    └─────────────┘
```

> **Note**: `tts-server.exe` (:8891, Qwen3-TTS Serena) is running on the host
> but is NOT in the voice-turn path. The voice proxy routes TTS to Hermes →
> Edge TTS (XiaoxiaoNeural) because `QWENTTS_SERVER_URL` is not set.
> See §4 and §6 for the two TTS paths.

### Data flow (voice turn)

1. **User speaks** → Silero VAD detects speech → browser captures PCM16 audio
2. **STT**: Browser `POST /v1/audio/transcriptions` → agent-meow voice_proxy → Hermes :8642 (faster-whisper) → transcript text
3. **LLM**: Browser `POST /v1/chat/completions` → agent-meow voice_proxy → Hermes :8642 → Ollama :11434 → response text
4. **TTS**: Browser `POST /v1/audio/speech` → agent-meow voice_proxy → Hermes :8642 → Edge TTS (`zh-CN-XiaoxiaoNeural`) → MP3 audio
   - **Note**: `tts-server.exe` (:8891, Qwen3-TTS Serena) is running but NOT in the voice-turn path — neither `QWENTTS_SERVER_URL` nor `QWEN_TTS_URL` is set, so the voice proxy falls through to Hermes, which uses its configured `provider: edge`. The browser sends `speaker: Serena` but Hermes ignores it (Edge TTS uses its own voice config).
   - To route voice turns through Qwen3-TTS instead, set `QWENTTS_SERVER_URL=http://127.0.0.1:8891` on the agent-meow server.
5. **Playback**: Browser plays audio via Web Audio API

### Dictation (live transcription) — separate path

- Browser opens `WS /v1/dictation/stream` → agent-meow server → sherpa-onnx streaming recognizer
- Real-time partial + final transcripts for the message composer
- Engine selected by `AGENT_MEOW_DICTATION_ENGINE` env var (default: sherpa)

---

## 2. Port Map

| Port  | Process              | Purpose                          | Binding     |
|-------|----------------------|----------------------------------|-------------|
| 6767  | agent-meow server    | Backend API + SPA + voice proxy  | 127.0.0.1   |
| 8642  | Hermes gateway       | STT + LLM API + TTS (Edge)       | 0.0.0.0     |
| 8644  | Hermes webhook       | WeChat/Weixin platform           | 0.0.0.0     |
| 8789  | Hermes gateway       | Gateway auxiliary port           | 0.0.0.0     |
| 8891  | tts-server.exe       | Qwen3-TTS native (Vulkan GPU)   | 127.0.0.1   |
| 9119  | Hermes web dashboard | Dashboard UI                     | 127.0.0.1   |
| 11434 | Ollama               | Local LLM inference              | 127.0.0.1   |
| 5433  | Hermes Postgres      | Hermes conversation DB           | 0.0.0.0     |

---

## 3. Process Inventory

### agent-meow server (PID 32452)

```
python -m agent_meow server --host 127.0.0.1 --port 6767 \
  --database-uri sqlite:///C:\Users\1\.omnigent\chat.db \
  --artifact-location C:\Users\1\.omnigent\artifacts
```

**Required env vars (set in launching shell):**

| Env var              | Value                                          | Purpose                                              |
|----------------------|------------------------------------------------|------------------------------------------------------|
| `HERMES_VOICE_URL`   | `http://127.0.0.1:8642`                        | Mounts voice proxy router for `/v1/audio/*` POSTs    |
| `HERMES_API_KEY`     | `3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb` | Bearer token for Hermes API auth |
| `HERMES_BASE_URL`    | `http://127.0.0.1:8642/v1`                     | LLM base URL forwarded to runner via agent spec      |
| `AGENT_MEOW_LOCAL_SINGLE_USER` | `1`                                  | Single-user mode (no accounts auth)                 |

> ⚠️ **Critical**: All three `HERMES_*` vars must be set. Missing any one causes a different failure:
> - No `HERMES_VOICE_URL` → voice proxy not mounted → `405 Method Not Allowed`
> - No `HERMES_API_KEY` → no auth header to Hermes → `401 Unauthorized`
> - No `HERMES_BASE_URL` → runner can't resolve `${HERMES_BASE_URL}` in agent spec → `runner_error`

### tts-server.exe (PID 22824) — available but NOT in the voice-turn path

```
tts-server.exe \
  --model C:\Users\1\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf \
  --codec C:\Users\1\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf \
  --host 127.0.0.1 --port 8891
```

- **Backend**: Vulkan GPU (AMD Radeon 8060S)
- **Model**: Qwen3-TTS 1.7B custom voice, Q8_0 quantization
- **Codec**: Qwen tokenizer 12Hz, Q8_0 quantization
- **API**: OpenAI-compatible `POST /v1/audio/speech` (input/voice format)
- **Voice**: Serena (zh/en bilingual)
- **RTF**: ~0.27 (Vulkan) vs ~0.9 (Python model)
- **⚠️ Status**: Running on :8891 but **not used for voice turns** — neither `QWENTTS_SERVER_URL` nor `QWEN_TTS_URL` is set on the agent-meow server, so the voice proxy routes TTS to Hermes (Edge TTS) instead. The browser sends `speaker: Serena` in the request body, but Hermes ignores it and uses its configured Edge TTS voice (`zh-CN-XiaoxiaoNeural`).
- **Used by**: Hermes's `qwen-offline` command provider (for WeChat/Weixin voice messages), reachable from inside the container via `host.docker.internal:8891`.
- **To activate for voice turns**: Set `QWENTTS_SERVER_URL=http://127.0.0.1:8891` on the agent-meow server, then restart. The voice proxy will route `POST /v1/audio/speech` directly to `tts-server.exe` instead of Hermes.

### Ollama (PID 47436)

- **Port**: 11434 (host)
- **Models**: deepseek-v4-flash:0731-cloud (primary), nemotron-3.5-lightning:30b-a3b (fallback), qwen3.5:9b-q8_0 (compression), qwen3.8:27b (vision)

### Hermes gateway (Docker container)

- **Image**: `ghcr.io/jzkk720/hermes-agent:latest`
- **Container**: `hermes-gateway`
- **Compose file**: `C:\Users\1\github-pr\hermes-agent\docker-compose.upstream.yml`
- **API_SERVER_KEY**: `28765d337208aa3c0b6671cb1969e8cad9c22d7b7967b216` (container env)
- **⚠️ Note**: The running Hermes process (PID 201, started Aug 24) actually uses a *different* key: `3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb` (from `deploy/docker/.env`). The container env was updated but the process was never restarted. Always test the key directly against Hermes to find the one the running process accepts.

---

## 4. Hermes Config (`/opt/data/config.yaml`)

### Model

```yaml
model:
  base_url: http://host.docker.internal:11434/v1
  default: deepseek-v4-flash:0731-cloud
  ollama_num_ctx: 65536
  provider: custom
```

### Fallback model

```yaml
fallback_model:
  - base_url: http://host.docker.internal:11434/v1
    model: nemotron-3.5-lightning:30b-a3b
    provider: custom
```

### Auxiliary models

```yaml
auxiliary:
  compression:
    base_url: http://host.docker.internal:11434/v1
    model: qwen3.5:9b-q8_0
    provider: custom
    reasoning_effort: none
  vision:
    base_url: http://host.docker.internal:11434/v1
    model: qwen3.8:27b
    provider: custom
    reasoning_effort: none
```

### STT

```yaml
stt:
  local:
    initial_prompt: "简体中文，简体字，规范汉字。"
    language: zh
```

### TTS (Hermes config — controls Hermes-internal TTS, NOT the voice proxy)

```yaml
tts:
  provider: edge              # ← ACTIVE: Edge TTS is the default for all Hermes TTS
  edge:
    voice: zh-CN-XiaoxiaoNeural
  providers:
    qwen-offline:             # ← AVAILABLE: opt-in alternative, not the default
      command: "python3 -c \"... urllib.request.Request('http://host.docker.internal:8891/v1/audio/speech', ...)\""
      output_format: wav
      timeout: 120
      type: command
```

> **⚠️ Two TTS paths — do not confuse them:**
>
> | Path | Who calls it | Active TTS backend | Voice | How to change |
> |------|-------------|-------------------|-------|---------------|
> | **Voice turns** (browser → voice_proxy → Hermes) | Browser `POST /v1/audio/speech` via agent-meow voice proxy | **Edge TTS** (`zh-CN-XiaoxiaoNeural`) — because `QWENTTS_SERVER_URL`/`QWEN_TTS_URL` is not set, the proxy falls through to Hermes, which uses `provider: edge` | Xiaoxiao | Set `QWENTTS_SERVER_URL=http://127.0.0.1:8891` to route to Qwen3-TTS (Serena) instead |
> | **Hermes-internal TTS** (WeChat voice messages, read-aloud) | Hermes gateway directly | **Edge TTS** (`zh-CN-XiaoxiaoNeural`) — `provider: edge` is the default; `qwen-offline` is opt-in | Xiaoxiao (default) / Serena (if switched) | Change `tts.provider` to `qwen-offline` in Hermes config |
>
> **Current state**: Both paths use Edge TTS (XiaoxiaoNeural). The `tts-server.exe` on :8891 is running but idle — it only gets called if (a) the voice proxy env var is set, or (b) Hermes's `tts.provider` is switched to `qwen-offline`.

---

## 5. agent-meow Agent Spec (`examples/hermes-gateway/config.yaml`)

```yaml
spec_version: 1
name: hermes-gateway
executor:
  type: agent-meow
  config:
    harness: openai-agents
  model: hermes-agent
  context_window: 1048576
  auth:
    type: api_key
    api_key: ${HERMES_API_KEY}      # resolved from runner env
    base_url: ${HERMES_BASE_URL}    # resolved from runner env
tools:
  builtins: []                      # Hermes handles tools internally
```

### Env var forwarding (host → runner)

The host daemon forwards these credential env vars to the runner via `HARNESS_CREDENTIAL_ENV_VARS` (`agent_meow/host/connect.py`):

- `HERMES_API_KEY` — Bearer token for Hermes API
- `HERMES_BASE_URL` — LLM base URL (`http://127.0.0.1:8642/v1`)
- `HERMES_VOICE_URL` — Voice proxy URL (for reference)

---

## 6. Voice Proxy Routing Contract

The agent-meow voice proxy (`agent_meow/server/voice_proxy.py`) routes based on env vars:

| Route                            | Env var checked         | Target                          | Notes                           |
|----------------------------------|-------------------------|---------------------------------|---------------------------------|
| `POST /v1/audio/transcriptions`  | `WHISPER_SERVER_URL`    | `{whisper}/inference`           | Vulkan iGPU whisper-server      |
| `POST /v1/audio/transcriptions`  | `LEMONADE_STT_URL`      | `{lemonade}/v1/audio/transcriptions` | OpenAI-compatible, injects model |
| `POST /v1/audio/transcriptions`  | (neither set)           | Hermes :8642                    | faster-whisper (default)        |
| `POST /v1/audio/speech`          | `QWENTTS_SERVER_URL`    | `{qwentts_native}/v1/audio/speech` | Native Vulkan C++ binary       |
| `POST /v1/audio/speech`          | `QWEN_TTS_URL`          | `{qwen_base}/tts`              | Python Qwen3-TTS wrapper        |
| `POST /v1/audio/speech`          | (neither set)           | Hermes :8642                    | Edge TTS (Xiaoxiao)             |
| `POST /v1/audio/speech/edge`     | (always)                | Hermes :8642/v1/audio/speech   | Manual read-aloud (Edge TTS)   |
| `POST /v1/chat/completions`      | (always)                | Hermes :8642                    | LLM inference via Ollama        |

**Current active routing** (this machine):
- STT → Hermes :8642 (faster-whisper) — no WHISPER_SERVER_URL or LEMONADE_STT_URL set
- TTS → Hermes :8642 → **Edge TTS** (`zh-CN-XiaoxiaoNeural`) — neither `QWENTTS_SERVER_URL` nor `QWEN_TTS_URL` is set, so the proxy falls through to Hermes. The browser sends `speaker: Serena` but Hermes ignores it.
- LLM → Hermes :8642 → Ollama :11434

> **⚠️ Correction**: An earlier version of this report stated TTS routes to `tts-server.exe :8891`. That is incorrect — `tts-server.exe` is running but the voice proxy env vars (`QWENTTS_SERVER_URL` / `QWEN_TTS_URL`) are not set, so TTS goes to Hermes → Edge TTS. To switch to Qwen3-TTS (Serena), set `QWENTTS_SERVER_URL=http://127.0.0.1:8891`.

---

## 7. Frontend Voice Architecture

### `useRealtimeVoice.ts` — React hook

- Connects to Hermes via HTTP endpoints (not WebSocket for voice turns)
- Uses `hermesVoice` singleton transport (`web/src/lib/hermesVoice.ts`)
- State machine: `disconnected → connecting → connected → error`
- Events: `turn.started`, `transcript.delta`, `transcript.final`, `audio.done`, `error`
- Session reuse on reconnect (fix from v0.9.0 — prevents duplicate conversations)

### `dictation.ts` — Live transcription

- AudioWorklet name: `agent-meow-pcm16-downsampler` (rebranded in source)
- WebSocket endpoint: `WS /v1/dictation/stream` on agent-meow server
- Engine: sherpa-onnx streaming transducer (default)
- Model dir: `~/.omnigent/models/dictation/asr` (env: `AGENT_MEOW_DICTATION_MODEL_DIR`)

### Vite dev proxy (`web/vite.config.ts`)

- `/v1` → `AGENT_MEOW_URL` (default `http://localhost:6767`) with `ws: true`
- `/v1/audio/*` → Hermes :8642 (registered before the generic `/v1` proxy)
- Auth: `AGENT_MEOW_AUTH_TOKEN` or Databricks token injection

---

## 8. Startup Procedure

### Option A: Start script (recommended)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-agent-meow-native.ps1
```

The script:
1. Probes Hermes (:8642), Ollama (:11434), TTS (:8890/:8891)
2. Sets `QWENTTS_*` env vars for TTS server supervision
3. Auto-detects `HERMES_API_KEY` from: env → `web/.env` → Docker container
4. Sets `HERMES_VOICE_URL`, `HERMES_BASE_URL`, `AGENT_MEOW_LOCAL_SINGLE_USER`
5. Launches `python -m agent_meow server --host 0.0.0.0 --port 6767`

### Option B: Manual start (all env vars required)

```powershell
# TTS server supervision paths
$env:QWENTTS_SERVER_EXE = "C:\Users\1\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWENTTS_MODEL = "C:\Users\1\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWENTTS_CODEC = "C:\Users\1\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:QWENTTS_LANG = "auto"

# Voice pipeline wiring (ALL THREE required)
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"

# Single-user mode
$env:AGENT_MEOW_LOCAL_SINGLE_USER = "1"

# Start server
.venv\Scripts\python.exe -m agent_meow server --host 127.0.0.1 --port 6767 `
  --database-uri "sqlite:///$env:USERPROFILE\.omnigent\chat.db" `
  --artifact-location "$env:USERPROFILE\.omnigent\artifacts"
```

### Prerequisites

1. **Hermes gateway** (Docker): `docker start hermes-gateway` or `docker compose -f docker-compose.upstream.yml up -d`
2. **Ollama** with models: `ollama pull deepseek-v4-flash:0731-cloud` (or use cloud models)
3. **Qwen3-TTS** (optional, for GPU TTS): Build `qwentts.cpp` with Vulkan, run `tts-server.exe`
4. **agent-meow venv**: `uv sync --extra all --extra dev`

---

## 9. Prompt Engineering & System Prompts

### agent-meow agent spec prompt (`examples/hermes-gateway/config.yaml`)

The `prompt:` field is sent to Hermes as the first message in every `/v1/chat/completions` call. This is the persona that shapes all voice replies:

```yaml
prompt: |
  你是橘宝 (Jubao / MEOW)，一只活泼可爱的 AI 猫咪助手。
  You are Jubao (橘宝), a playful and helpful AI cat assistant powered by agent-meow.

  人格设定 / Personality:
  - 活泼、好奇、有点贪吃 — 喜欢披萨和零食 🐾
  - Lively, curious, a bit food-motivated — loves pizza and snacks 🐾
  - 中文和英文都可以，默认用用户的语言回复；中文一律用简体中文
  - Bilingual (Chinese + English); reply in the user's language.
    Chinese replies use SIMPLIFIED characters (简体) — never Traditional
  - 回答要简洁有趣，像一个可爱的猫咪朋友
  - Keep responses concise and fun, like a cute cat friend

  TTS safety constraints (critical for voice quality):
  - Do NOT use emoji, decorative symbols (～, —, …, ♪), or markdown
    formatting (**bold**, - lists) in replies — replies are sent to a
    TTS voice synthesizer and these symbols cause abnormal pauses and
    noise. Use plain text with standard punctuation only.

  Capabilities (executed via Hermes backend):
  - File I/O, terminal, web search, browser, skills, memory, media generation

  Conversation memory is managed by the agent-meow framework — you
  remember what was discussed earlier in this session.
```

### Hermes internal system prompt (`/opt/data/config.yaml` → `agent.system_prompt`)

Hermes has its own system prompt for the gateway's internal agent loop (separate from agent-meow's persona prompt above):

```
I am 橘宝 (Jubao / MEOW), a friendly evolved orange-cat AI assistant.
I am NOT Hermes or Qwen. Hermes Agent is my platform, not my name.
Language: English in -> English out, Chinese in -> SIMPLIFIED Chinese out
(jian ti zi, never traditional unless the user writes traditional first).
Never mix. I generate copy, documents, code, images. I manage local files.
I control the system via voice. I stay in character as 橘宝 always.
Professional with cat humor. Short answers first, expand when needed.
```

### Prompt chunking (TTS sentence splitting)

The LLM response is streamed via SSE and TTS is fired **per-sentence** — audio starts playing after the first sentence (~5-10s) instead of waiting for the full response (~60s). The chunking pipeline:

1. **SSE stream** → LLM tokens arrive as `data: {"choices":[{"delta":{"content":"..."}}]}`
2. **Sentence buffer** → tokens accumulate until a sentence terminator is hit
3. **`splitSentences()`** → splits on `. ! ? 。 ！ ？ \n` (commas/semicolons are NOT split points — fragments are complete clauses)
4. **`sanitizeForTts()`** → strips emoji, markdown, URLs, zero-width chars; replaces pause-causing symbols (em-dash → comma; Chinese 。：？ → ； to avoid tts-server.exe hangs)
5. **Clause splitting** → if a sentence exceeds `CLAUSE_SPLIT_MIN=10` chars, splits at the last clause break mark (`,、；;:：,，—`) for bounded chunk size
6. **TTS synthesis** → each chunk synthesized in parallel (semaphore=3), played back in strict sentence order

**Key constants:**
- `CLAUSE_SPLIT_MIN = 10` — below this, chunks are short enough that synthesis outruns playback
- `MAX_TTS_TEXT_LEN = 200` — skip TTS for excessively long text (prevents tts-server.exe 46s hangs)
- `SENTENCE_END_REGEX = /[.!?。！？\n]/` — sentence terminators only
- `CLAUSE_BREAK_REGEX = /[,、；;:：,，—]/` — natural pause marks for clause splitting

---

## 10. Safeguards & Safety Policies

### Whisper hallucination filtering (`filterWhisperHallucination`)

faster-whisper hallucinates predictable text from silence. Known patterns are filtered before the transcript reaches the LLM:

| Pattern | Language | Source |
|---------|----------|--------|
| `简体中文`, `简体字`, `规范汉字` | Chinese | STT metadata headers |
| `请订阅`, `感谢观看` | Chinese | YouTube captions |
| `thankyouforwatching`, `pleasesubscribe`, `subscribe` | English | YouTube captions |

Matching: substring match on normalized text (no punctuation, lowercase). Dropped silently with a console warning.

### Duplicate STT turn detection (`isDuplicateSttTurn`)

The VAD can split one utterance into two segments, or the user repeats themselves while the first turn is still processing. Duplicates are detected by normalizing both transcripts (strip punctuation/whitespace, lowercase) and comparing:

- Exact match after normalization → duplicate, dropped
- Tail-substring match (second fragment is the tail of the first) → duplicate, dropped
- Prevents "phrase,phrase" recordings in the session transcript

### STT language auto-adjustment

- Default: `zh` (Simplified Chinese) — prevents Whisper auto-detect from defaulting to English on noisy mic audio
- Auto-adjusts to `en` after 2 consecutive non-CJK transcripts
- Configurable via `VITE_HERMES_STT_LANGUAGE` env var or `window.__HERMES_STT_LANGUAGE__`

### Voice intent classification (`voiceIntent.ts`)

Each transcript is classified as `chat` or `task` before routing:

| Intent | Routing | Trigger |
|--------|---------|---------|
| `chat` | Conversational TTS reply (Hermes LLM → TTS per sentence) | Default |
| `task` | Auto-submit as agent-meow session (no TTS reply, short confirmation) | Action verbs + confidence ≥ 0.6 |

**Task verb detection:**
- English: `create`, `search for`, `generate`, `deploy`, `fix the`, `write a`, `build a`, `open the`, `run the`, etc.
- Chinese: `创建`, `搜索`, `生成`, `部署`, `修复`, `写一个`, `画一个`, `打开`, `安装`, `配置`, etc.
- Conversational fillers (`帮我`) alone do NOT trigger task mode — require an action verb

**Primary classifier:** Fast LLM call to Hermes `/v1/chat/completions` (stream:false)
**Fallback:** Keyword detection (confidence=0.5)

### agent-meow policy framework (`agent_meow/policies/builtins/safety.py`)

Built-in safety policies for tool execution guardrails:
- `sys_os_read`, `sys_os_write`, `sys_os_edit`, `sys_os_shell` — agent-meow MCP tools
- `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` — Claude Code / Codex native tools
- `Shell` — Cursor SDK native tool
- `read`, `bash`, `write`, `edit` — Pi native tools

Policies are evaluated via `PreToolUse` / `PostToolUse` hooks and return `ALLOW` / `DENY` / `REDACT` verdicts.

### Hermes delegation limits

```yaml
delegation:
  default_toolsets: [terminal, file, web]
  max_iterations: 250      # max tool calls per agent turn
code_execution:
  max_tool_calls: 50
  timeout: 300              # seconds
```

### Hermes memory & session reset

```yaml
memory:
  memory_enabled: true
  memory_char_limit: 2200
  user_char_limit: 1375
  user_profile_enabled: true
  flush_min_turns: 6
  nudge_interval: 10        # turns between memory nudges
session_reset:
  mode: both                # reset both memory and session
  at_hour: 4                # 4 AM daily reset
  idle_minutes: 1440        # 24h idle reset
```

---

## 11. Temperature & Decoding Parameters

### LLM (Ollama via Hermes)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `model` | `deepseek-v4-flash:0731-cloud` | Primary; cloud model via Ollama |
| `fallback_model` | `nemotron-3.5-lightning:30b-a3b` | Local fallback |
| `ollama_num_ctx` | 65536 | Ollama context window override |
| `context_window` | 1048576 | agent-meow agent spec override (1M tokens) |
| `stream` | `true` | SSE streaming for voice turns |
| `temperature` | (Hermes default) | Not explicitly set — Hermes gateway controls |
| `reasoning_effort` | `none` | Auxiliary models (compression, vision) |

> The LLM temperature is not explicitly set in the voice pipeline — Hermes gateway uses its default. The agent-meow voice proxy passes through whatever Hermes returns. For the `chatStreamViaHermes` fallback path, the request body is `{model, messages, stream:true}` with no temperature field.

### TTS — Active: Edge TTS (via Hermes)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `provider` | `edge` | Hermes config default; Edge TTS (Microsoft cloud, free) |
| `voice` | `zh-CN-XiaoxiaoNeural` | Bright female Mandarin voice |
| `format` | MP3/Opus | Edge TTS output format (not WAV) |
| `temperature` | N/A | Edge TTS has no temperature parameter |

> **⚠️ The browser sends `speaker: Serena` in the TTS request body, but Hermes ignores it** — Edge TTS uses its own configured voice. The `speaker` field only matters when the voice proxy routes to `tts-server.exe` (Qwen3-TTS), which requires `QWENTTS_SERVER_URL` to be set.

### TTS — Available: Qwen3-TTS (tts-server.exe, NOT currently active for voice turns)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `temperature` | `0` (greedy) | Hardcoded in tts-server.exe; comment: "greedy temperature=0" |
| `speaker` | `Serena` | Pinned per turn (not per sentence) for prosody continuity |
| `language` | `Auto` | Auto-detect zh/en per chunk |
| `response_format` | `wav` | WAV container |
| `model` | `qwen-talker-1.7b-customvoice-Q8_0.gguf` | Q8_0 quantization |
| `codec` | `qwen-tokenizer-12hz-Q8_0.gguf` | 12Hz codec, Q8_0 quantization |

> **Why greedy temp=0**: Deterministic voice output — same text always produces the same audio. Higher temperatures introduce prosody variation that sounds inconsistent across turns.
>
> **To activate**: Set `QWENTTS_SERVER_URL=http://127.0.0.1:8891` on the agent-meow server and restart. The voice proxy will route `POST /v1/audio/speech` directly to `tts-server.exe` instead of Hermes.

### STT (faster-whisper via Hermes)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `language` | `zh` | Default; auto-adjusts to `en` after 2 non-CJK transcripts |
| `initial_prompt` | `简体中文，简体字，规范汉字。` | Biases Whisper toward Simplified Chinese |
| `sample_rate` | 16000 | 16 kHz mono PCM16 (Silero VAD output rate) |

### Edge TTS (Hermes built-in — ACTIVE for voice turns AND manual read-aloud)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `voice` | `zh-CN-XiaoxiaoNeural` | Edge TTS voice — used for ALL TTS (voice turns + read-aloud) |
| `provider` | `edge` | Hermes config default; the active TTS backend |
| `format` | MP3/Opus | Edge TTS output (not WAV) |

---

## 12. Voice Loop & Turn Detection Configuration

### Silero VAD parameters (`hermesVoice.ts` → `MicVAD.new`)

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `model` | `v5` | Silero VAD model version |
| `positiveSpeechThreshold` | `0.6` | Probability above which speech is detected |
| `negativeSpeechThreshold` | `0.45` | Probability below which speech ends |
| `preSpeechPadMs` | `500` | Pad 500ms before speech start (captures word beginnings) |
| `redemptionMs` | `1500` | 1.5s of silence before `onSpeechEnd` fires |
| `minSpeechMs` | `300` | Minimum speech segment length (filters noise transients) |
| `submitUserSpeechOnPause` | `false` | Don't submit partial speech on pause |
| `startOnLoad` | `false` | Manual start after setup |
| `echoCancellation` | `true` | Mic stream processing (AGC + noiseSuppression) |
| `channelCount` | `1` | Mono |

> **`redemptionMs=1500`**: Tuned for Chinese speakers who pause shorter between sentences. Long enough to ride out natural mid-sentence pauses without chopping one utterance into two, short enough to stay responsive.

### Voice turn state machine

```
[disconnected]
    │ connect()
    ▼
[connecting] ── VAD loaded, mic acquired
    │ vad.start()
    ▼
[connected] ── listening for speech
    │ onSpeechEnd (VAD fires after 1.5s silence)
    ▼
[processing] ── half-duplex: VAD paused, mic muted
    │
    ├─ STT: WAV → Hermes /v1/audio/transcriptions
    ├─ Hallucination filter → duplicate check
    ├─ Intent classification (chat vs task)
    │
    ├─ [task] → emit voice.command, play "好的!" confirmation → [connected]
    │
    └─ [chat] → LLM stream + TTS pipeline:
         │
         ├─ response.started
         ├─ SSE stream → sentence buffer → splitSentences → sanitizeForTts
         ├─ TTS synthesis (3-wide parallel semaphore) → ordered playback queue
         ├─ playback.started (first audio chunk)
         ├─ audio.delta (each chunk)
         ├─ audio.done (last chunk played)
         │
         ▼
    [connected] ── VAD resumed, listening for next utterance
```

### Half-duplex operation

- **TTS playing** → VAD paused (saves CPU, prevents self-listening)
- **TTS done** → 300ms tail (speaker physical decay) → VAD resumed
- **Interrupt** → `AbortController` cancels in-flight SSE stream + TTS playback

### TTS playback pipeline (3-wide parallel synthesis)

```
LLM SSE stream
    │
    ▼
sentence buffer ── splitSentences() ── sanitizeForTts()
    │
    ▼
flushSentence() ── split into chunks ── enqueue TTS synthesis
    │                    │
    │              Semaphore(3) ── 3 concurrent synthesis requests
    │                    │
    ▼                    ▼
drainPending() ── strict order by sentence index
    │
    ▼
ttsQueue[] ── playQueue() ── sequential playback
    │
    ▼
Web Audio API ── AudioContext.decodeAudioData → play
```

**Why 3-wide**: Measured 2026-08-23 on 1.7B model — 3 concurrent 18-char requests took 13.8s total. The GPU is the bottleneck; higher concurrency made each request slower. The 1.7B model is efficient enough that 3-wide keeps production ahead of playback.

**Strict order**: Out-of-order playback was tried but scrambling sentence order was heard as dropped/garbled audio — worse than the gap it avoided. The real gap fix is server-side parallel synthesis.

### STT warmup (pre-flight)

On `connect()`, a tiny silent WAV is sent to Hermes `/v1/audio/transcriptions` to trigger the faster-whisper model load (60-90s on CPU) **before** the user speaks. The result is discarded — only the side effect of loading the model into the process-global singleton matters.

### Session reuse on reconnect

`connect()` reuses `voiceSessionIdRef` if set, skipping `createSession` and re-binding the existing session to the transport. Prevents duplicate conversations when the transport drops and reconnects (fix from v0.9.0).

---

## 13. Diagnostic Checklist

### Verify each layer

```powershell
# Layer 1: agent-meow server
Invoke-WebRequest http://127.0.0.1:6767/health -UseBasicParsing
# Expected: 200 OK

# Layer 2: Hermes gateway
Invoke-WebRequest http://127.0.0.1:8642/health -UseBasicParsing
# Expected: 200 OK

# Layer 3: Hermes API auth (test with candidate key)
Invoke-WebRequest http://127.0.0.1:8642/v1/models `
  -Headers @{Authorization="Bearer <key>"} -UseBasicParsing
# Expected: 200 OK (401 = wrong key)

# Layer 4: STT through voice proxy
Invoke-WebRequest http://127.0.0.1:6767/v1/audio/transcriptions `
  -Method POST -ContentType "multipart/form-data" -UseBasicParsing
# Expected: 500 (no audio) — NOT 405 (proxy not mounted) or 401 (auth failure)

# Layer 5: TTS server
Invoke-WebRequest http://127.0.0.1:8891/v1/audio/speech `
  -Method POST -ContentType "application/json" `
  -Body '{"input":"test","voice":"Serena"}' -UseBasicParsing
# Expected: 200 OK with WAV audio

# Layer 6: Ollama
Invoke-WebRequest http://127.0.0.1:11434/api/tags -UseBasicParsing
# Expected: 200 OK with model list
```

### Server log verification

```
# Voice proxy mounted (line 1 of server log):
voice-proxy: /v1/audio/* routes enabled → http://127.0.0.1:8642

# Runner tunnel accepted (no 403):
WebSocket /v1/runners/runner_.../tunnel [accepted]

# No "Unresolved environment variable" (HERMES_BASE_URL forwarded):
# No "rejected invalid API key" (HERMES_API_KEY correct):
# No "forbidden origin" (WS origin sentinel matches):
```

---

## 14. Known Issues & Fixes Applied (2026-08-26)

| # | Issue | Root cause | Fix |
|---|-------|------------|-----|
| 1 | `runner tunnel rejected (HTTP 403)` | WS origin sentinel rebrand (`omnigent://internal` → `agent-meow://internal`); stale server | Added legacy alias in `ws_origin.py`; restarted server |
| 2 | `POST /v1/audio/transcriptions → 405` | `HERMES_VOICE_URL` not set → voice proxy router not mounted | Set `HERMES_VOICE_URL` env var |
| 3 | `POST /v1/audio/transcriptions → 401` | `HERMES_API_KEY` not set / wrong key | Set correct key (running Hermes process's key, not container env) |
| 4 | `runner_error: Unresolved '${HERMES_BASE_URL}'` | `HERMES_BASE_URL` not set → host can't forward to runner | Set `HERMES_BASE_URL` env var |
| 5 | `NameError: playback_state` on STT responses | Closure variable only bound in TTS if-block, referenced unconditionally | Initialize `playback_state = None` before if-block |
| 6 | Alembic multiple heads | Rebrand migration on parallel chain from session_projects | Added merge migration `z11b4c5d6e7f` |
| 7 | Broken rebrand migration `z10` | Renamed table to itself (no-op that errors) | Guarded with `has_table()` check |

---

## 15. Replication Guide for Other Machines

### Minimum requirements

- **Python 3.12+** (managed via `uv`)
- **Docker** (for Hermes gateway) OR native Hermes installation
- **Ollama** (for local LLM) OR cloud model access
- **Vulkan-compatible GPU** (for Qwen3-TTS) OR use Edge TTS fallback

### Step-by-step replication

1. **Clone and setup agent-meow:**
   ```bash
   git clone https://github.com/JZKK720/agent-meow.git
   cd agent-meow
   uv sync --extra all --extra dev
   ```

2. **Start Hermes gateway (Docker):**
   ```bash
   cd /path/to/hermes-agent
   docker compose -f docker-compose.upstream.yml up -d
   ```

3. **Find the Hermes API key:**
   ```powershell
   # Test candidate keys against Hermes (401=wrong, 500=right for STT)
   docker exec hermes-gateway printenv API_SERVER_KEY
   # If that key returns 401, try the key from deploy/docker/.env
   ```

4. **Start Ollama and pull models:**
   ```bash
   ollama pull deepseek-v4-flash:0731-cloud
   ollama pull nemotron-3.5-lightning:30b-a3b
   ```

5. **(Optional) Build Qwen3-TTS with Vulkan:**
   - See `.claude/skills/qwen-tts-vulkan-setup/SKILL.md`
   - Requires Vulkan SDK, CMake, MSVC
   - Model: `qwen-talker-1.7b-customvoice-Q8_0.gguf`

6. **Set env vars and start agent-meow:**
   ```powershell
   $env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
   $env:HERMES_API_KEY = "<your-hermes-key>"
   $env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
   $env:AGENT_MEOW_LOCAL_SINGLE_USER = "1"
   # Optional TTS:
   $env:QWENTTS_SERVER_EXE = "<path-to-tts-server.exe>"
   $env:QWENTTS_MODEL = "<path-to-model.gguf>"
   $env:QWENTTS_CODEC = "<path-to-codec.gguf>"
   .venv\Scripts\python.exe -m agent_meow server --host 127.0.0.1 --port 6767
   ```

7. **Verify:**
   - Open `http://127.0.0.1:6767` in browser
   - Check server log for `voice-proxy: /v1/audio/* routes enabled`
   - Start a new chat with the `hermes-gateway` agent
   - Test voice input (mic button) and voice output (TTS playback)

### Environment variable summary

| Env var | Required | Default | Purpose |
|---------|----------|---------|---------|
| `HERMES_VOICE_URL` | ✅ | — | Mounts voice proxy router (fixes 405) |
| `HERMES_API_KEY` | ✅ | — | Bearer token for Hermes API (fixes 401) |
| `HERMES_BASE_URL` | ✅ | — | LLM base URL for runner agent spec (fixes runner_error) |
| `AGENT_MEOW_LOCAL_SINGLE_USER` | ✅ | — | Single-user mode (no accounts auth) |
| `QWENTTS_SERVER_EXE` | Optional | — | Path to native Vulkan TTS binary |
| `QWENTTS_MODEL` | Optional | — | Path to Qwen3-TTS model GGUF |
| `QWENTTS_CODEC` | Optional | — | Path to Qwen tokenizer codec GGUF |
| `QWENTTS_LANG` | Optional | `auto` | TTS language auto-detection |
| `WHISPER_SERVER_URL` | Optional | — | Whisper STT server URL (Vulkan iGPU) |
| `LEMONADE_STT_URL` | Optional | — | Lemonade STT server URL |
| `QWEN_TTS_URL` | Optional | — | Python Qwen3-TTS wrapper URL |
| `QWENTTS_SERVER_URL` | Optional | — | Native TTS server URL (alternative to QWENTTS_SERVER_EXE) |