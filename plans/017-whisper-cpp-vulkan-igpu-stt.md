# Plan 017: Wire whisper.cpp + Vulkan iGPU as STT engine for voice pipeline

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bbf826ac..HEAD -- agent_meow/server/voice_proxy.py agent_meow/server/service_supervisor.py web/vite.config.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (drop-in OpenAI-compatible API, no code changes to browser)
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `bbf826ac`, 2026-08-24

## Why this matters

The current STT engine is Hermes's faster-whisper running inside Docker on
CPU. This works but has two problems:

1. **Cold-start latency**: The `medium` model takes ~51s to load weights on
   first call (measured 2026-08-24). The browser's `warmupStt()` hides this
   by pre-firing during `connect()`, but if the user speaks before warmup
   completes, the first STT call blocks for 51s.

2. **Docker isolation**: Hermes runs in a Docker container without GPU
   access. The host's AMD Radeon 8060S iGPU (96GB allocatable VRAM,
   Vulkan 1.4.329) sits idle during STT. The NPU is also unavailable to
   Docker without special device mapping.

whisper.cpp with Vulkan support runs natively on the host, using the iGPU
for inference. The `whisper-server` binary exposes a drop-in OpenAI-compatible
HTTP API (`/inference` endpoint) that the voice proxy can route to — same
pattern as the existing Lemonade STT integration.

**Expected improvement**: STT warmup 51s → ~3s (VRAM model load vs CPU).
STT inference latency should drop from ~780ms to ~200-400ms.

## Current state

- **STT routing**: `voice_proxy.py` routes `/v1/audio/transcriptions` to
  Hermes gateway (`http://127.0.0.1:8642`) by default. When
  `LEMONADE_STT_URL` env var is set, it routes to Lemonade instead.
- **Hermes STT config**: `medium` model, `int8` compute type, CPU only,
  inside Docker container `hermes-gateway` (no GPU access).
- **Service supervisor**: `agent_meow/server/service_supervisor.py` already
  has a pattern for spawning STT services (Lemonade) as supervised
  subprocesses with crash-restart.
- **Voice proxy**: `agent_meow/server/voice_proxy.py` has a
  `_inject_model_into_multipart()` function that injects the `model` field
  into multipart form data — whisper-server also needs this (it requires
  the model path, not a model ID).
- **Vite dev proxy**: `web/vite.config.ts` has a `hermesVoiceProxy` config
  that mirrors the backend's STT routing for dev mode.
- **Machine**: AMD Ryzen AI MAX+ 395, AMD Radeon 8060S iGPU (Vulkan
  1.4.329), 96GB allocatable VRAM.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Check Vulkan | `vulkaninfo --summary` | GPU = AMD Radeon 8060S |
| Check CMake | `cmake --version` | ≥ 3.16 |
| Build whisper.cpp | `cmake -B build -DGGML_VULKAN=1 && cmake --build build -j --config Release` | `build/bin/Release/whisper-server.exe` exists |
| Download model | `.\models\download-ggml-model.cmd small` | `models/ggml-small.bin` exists (466MB) |
| Test whisper-server | `.\build\bin\Release\whisper-server.exe -m models\ggml-small.bin --port 8001` | `http://127.0.0.1:8001/health` returns 200 |
| STT test | `curl -F file=@test.wav http://127.0.0.1:8001/inference` | JSON with `text` field |

## Scope

**In scope** (files to create/modify):

- `C:\Users\cubecloud-io\whisper.cpp\` — clone and build (outside repo)
- `agent_meow/server/service_supervisor.py` — add `_spawn_whisper_server()` method
- `agent_meow/server/voice_proxy.py` — add `WHISPER_STT_URL` env var routing
- `web/vite.config.ts` — add whisper-server dev proxy option

**Out of scope** (do NOT touch):

- `web/src/lib/hermesVoice.ts` — no browser changes (the browser already
  sends `file` + `language` multipart fields; whisper-server accepts both)
- `agent_meow/server/app.py` — no startup changes (service supervisor
  handles spawning)
- Hermes Docker config — Hermes STT stays as fallback

## Git workflow

- Branch: `feat/whisper-cpp-vulkan-igpu-stt`
- Commit per step; message style: `feat(voice): <description>`
- Do NOT push unless instructed.

## Steps

### Step 1: Clone and build whisper.cpp with Vulkan

```powershell
cd C:\Users\cubecloud-io
git clone https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp
cmake -B build -DGGML_VULKAN=1
cmake --build build -j --config Release
```

**Verify**: `.\build\bin\Release\whisper-server.exe --help` prints usage.

### Step 2: Download the small model

```powershell
cd C:\Users\cubecloud-io\whisper.cpp
.\models\download-ggml-model.cmd small
```

**Verify**: `Test-Path models\ggml-small.bin` returns True (466MB).

### Step 3: Test whisper-server manually

```powershell
.\build\bin\Release\whisper-server.exe -m models\ggml-small.bin --port 8001
```

In another terminal:
```powershell
# Health check
Invoke-WebRequest -Uri "http://127.0.0.1:8001/health" -UseBasicParsing

# STT test with a WAV file
curl -F "file=@dev\probe-stt-input.wav" -F "language=zh" http://127.0.0.1:8001/inference
```

**Verify**: Health returns 200. STT returns JSON with `text` field (empty
for silence probe, which is expected).

### Step 4: Add whisper-server to service_supervisor.py

Add a new service handle and spawn method in
`agent_meow/server/service_supervisor.py`:

```python
# In __init__, add to self._services:
"whisper_server": _ServiceHandle(name="whisper_server", port=8001),

# In _is_configured(), add:
"whisper_server": bool(os.environ.get("WHISPER_STT_URL", "").strip()),

# In start(), add after lemonade:
if configured["whisper_server"]:
    await self._spawn_whisper_server()

# New method:
async def _spawn_whisper_server(self) -> None:
    """Start whisper.cpp server with Vulkan iGPU backend."""
    handle = self._services["whisper_server"]
    exe = os.environ.get("WHISPER_SERVER_EXE", "")
    model = os.environ.get("WHISPER_SERVER_MODEL", "")
    if not exe or not os.path.exists(exe):
        handle.state = "unconfigured"
        handle.last_error = "whisper-server exe not found"
        return
    if not model or not os.path.exists(model):
        handle.state = "unconfigured"
        handle.last_error = "whisper model not found"
        return
    handle.state = "starting"
    try:
        handle.process = subprocess.Popen(
            [exe, "-m", model, "--port", str(handle.port),
             "--vad", "--vad-model", os.environ.get("WHISPER_VAD_MODEL", ""),
             "--vad-threshold", "0.6"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            creationflags=_NO_WINDOW,
        )
        handle.start_time = time.monotonic()
        handle.state = "running"
        handle.last_error = None
        _logger.info(
            "whisper-server STT started (pid=%s, exe=%s, model=%s, port=%s)",
            handle.process.pid, exe, model, handle.port,
        )
    except Exception as exc:
        handle.state = "degraded"
        handle.last_error = str(exc)
        _logger.error("Failed to start whisper-server: %s", exc)
```

**Verify**: `cd web && npx tsc --noEmit` passes (no type errors from
Python — this is a Python file, so run `uv run ruff check
agent_meow/server/service_supervisor.py` instead).

### Step 5: Add WHISPER_STT_URL routing to voice_proxy.py

In `agent_meow/server/voice_proxy.py`, add a new env var and routing
branch. The whisper-server uses `/inference` (not `/v1/audio/transcriptions`),
so the proxy needs to rewrite the path:

```python
# Near the other env var constants:
WHISPER_STT_URL_ENV = "WHISPER_STT_URL"

def _whisper_stt_url() -> str | None:
    """Return the whisper-server base URL, or None if not configured."""
    url = os.environ.get(WHISPER_STT_URL_ENV, "").strip()
    return url or None

# In the _proxy function, BEFORE the lemonade_stt branch:
whisper_stt = _whisper_stt_url()
if path == "/v1/audio/transcriptions" and whisper_stt:
    # whisper-server uses /inference (not /v1/audio/transcriptions)
    target = f"{whisper_stt}/inference"
    is_qwen_tts = False
elif path == "/v1/audio/transcriptions" and lemonade_stt:
    # ... existing lemonade branch ...
```

**Important**: whisper-server does NOT require a `model` field in the
multipart body (the model is specified at startup via `-m`). So do NOT
call `_inject_model_into_multipart()` for whisper-server — just forward
the body as-is.

**Verify**: `uv run ruff check agent_meow/server/voice_proxy.py` passes.

### Step 6: Add Vite dev proxy for whisper-server

In `web/vite.config.ts`, add a `WHISPER_STT_URL` option:

```typescript
const WHISPER_STT_URL = process.env.WHISPER_STT_URL ?? "";

// In hermesVoiceProxy, add BEFORE the lemonade branch:
if (WHISPER_STT_URL) {
  hermesVoiceProxy["/v1/audio/transcriptions"] = {
    target: WHISPER_STT_URL,
    changeOrigin: true,
    rewrite: (path: string) => "/inference",
  };
}
```

**Verify**: `cd web && npx tsc --noEmit` passes.

### Step 7: Start server with whisper-server STT

```powershell
# Set env vars
$env:WHISPER_STT_URL = "http://127.0.0.1:8001"
$env:WHISPER_SERVER_EXE = "C:\Users\cubecloud-io\whisper.cpp\build\bin\Release\whisper-server.exe"
$env:WHISPER_SERVER_MODEL = "C:\Users\cubecloud-io\whisper.cpp\models\ggml-small.bin"
$env:WHISPER_VAD_MODEL = "C:\Users\cubecloud-io\.cache\lemonade\models\ggml-silero-v6.2.0.bin"
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:QWEN_TTS_URL = "http://127.0.0.1:8890"
$env:HERMES_API_KEY = "<from docker inspect hermes-gateway --format '{{range .Config.Env}}{{println .}}{{end}}' | Select-String API_SERVER_KEY>"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"

# Start server
.venv\Scripts\omnigent.exe server start
```

**Verify**:
1. Server log shows `whisper-server STT started`
2. `Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/transcriptions" -Method POST` returns 400 (not 405 — voice proxy is mounted)
3. STT test with probe WAV returns 200 with `{"text":""}`

### Step 8: Rebuild SPA bundle and test E2E

```powershell
cd web
npm run build
```

Hard-refresh browser (Ctrl+Shift+R), connect voice, speak a test phrase.

**Verify**: STT transcription appears in the session. Latency should be
noticeably faster than Hermes CPU (warmup <5s, inference <400ms).

## STOP conditions

- If `cmake -B build -DGGML_VULKAN=1` fails — Vulkan SDK may not be
  installed. STOP and report. Install Vulkan SDK from
  https://vulkan.lunarg.com/ and retry.
- If `whisper-server.exe` crashes on startup — the iGPU may not support
  the required Vulkan extensions. STOP and report. Try with
  `GGML_VULKAN_DEVICE=0` env var or fall back to CPU (`-DGGML_VULKAN=0`).
- If the voice proxy returns 405 — the `WHISPER_STT_URL` env var was not
  set on the server process. STOP and verify env var propagation.
- If STT returns 200 but with garbage text — check the audio format
  (16kHz mono PCM16 WAV). whisper.cpp expects this format.

## Test plan

1. **Unit test**: Add a test in `tests/` that verifies
   `_whisper_stt_url()` returns None when env var is unset, and the URL
   when set.
2. **Integration test**: Start whisper-server manually, set
   `WHISPER_STT_URL`, send a probe WAV through the voice proxy, verify
   200 + `{"text":""}`.
3. **E2E test**: Speak "你好世界" through the browser voice UI, verify
   the transcript appears and the LLM responds.

## Maintenance note

- The whisper-server binary and model files live outside the repo
  (`C:\Users\cubecloud-io\whisper.cpp\`). Future CI/CD or Docker builds
  need to either bundle these or build from source.
- The `WHISPER_STT_URL` env var takes precedence over `LEMONADE_STT_URL`
  and Hermes (the default). If both are set, whisper-server wins.
- The Silero VAD model path (`WHISPER_VAD_MODEL`) is shared with
  Lemonade's VAD — both use `ggml-silero-v6.2.0.bin`.
- When upgrading whisper.cpp, re-run `cmake -B build -DGGML_VULKAN=1 &&
  cmake --build build -j --config Release` — the binary is not auto-updated.
