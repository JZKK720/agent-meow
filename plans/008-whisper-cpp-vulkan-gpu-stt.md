# Plan 008: Build whisper.cpp with Vulkan for GPU-accelerated STT (offline warmup fix)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ff786767..HEAD -- scripts/start-speech-to-speech.ps1 scripts/start-s2s-detached.ps1`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (independent of Plans 006-007; can run in parallel)
- **Category**: perf
- **Planned at**: commit `ff786767`, 2026-08-04

## Why this matters

The local S2S server (offline fallback) has a 90s warmup because
faster-whisper (CTranslate2) only supports CUDA for GPU — it runs STT on
CPU while the machine's AMD Radeon 8060S iGPU (Vulkan 1.4.329) and XDNA 2
NPU sit idle. whisper.cpp supports Vulkan (`GGML_VULKAN=1`) and AMD ROCm
(`GGML_HIP=1`), either of which puts STT on the GPU, cutting warmup from
~60s to ~3s. Combined with the existing watchdog pre-warm, the offline
path can achieve ~0s warmup — closing the gap with the online DashScope
cloud path.

## Current state

- Machine: AMD Ryzen AI MAX+ 395, 16C/32T, 32GB RAM, AMD Radeon 8060S
  iGPU (Vulkan 1.4.329, AMD proprietary driver), XDNA 2 NPU, ROCm 7.1
  installed at `C:\Program Files\AMD\ROCm\7.1\`.
- STT: `faster-whisper` medium model, `--device cpu`, ~60s warmup (model
  weight load into CPU memory).
- The S2S startup script (`scripts/start-speech-to-speech.ps1`) launches
  `.venv\Scripts\speech-to-speech.exe` with `--stt faster-whisper`
  `--faster_whisper_stt_device cpu`.
- whisper.cpp v1.9.1 supports Vulkan, ROCm/HIP, and has a `whisper-server`
  example that exposes an OpenAI-compatible HTTP transcription API.
- Vulkan is confirmed working: `vulkaninfo --summary` shows GPU0 =
  AMD Radeon 8060S Graphics, apiVersion 1.4.329.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Check Vulkan | `vulkaninfo --summary` | GPU0 = AMD Radeon 8060S |
| Check CMake | `cmake --version` | ≥ 3.16 |
| Check ROCm | `hipcc --version` | ROCm 7.1 |
| Build whisper.cpp | `cmake -B build -DGGML_VULKAN=1 && cmake --build build -j --config Release` | `build/bin/Release/whisper-cli.exe` exists |
| Benchmark | `.\build\bin\Release\whisper-bench.exe -m models\ggml-medium.bin` | prints timing |

## Scope

**In scope** (files you should create/modify):
- `C:\Users\1\whisper.cpp\` (clone, build — outside the repo, no repo changes)
- `scripts/start-whisper-server-vulkan.ps1` (create) — boot script for whisper-server
- `scripts/start-speech-to-speech.ps1` (modify) — add option to use whisper-server as STT

**Out of scope** (do NOT touch):
- `web/` — no frontend changes
- `agent_meow/server/` — no server changes
- The S2S Python package (`.venv/Lib/site-packages/speech_to_speech/`) — if
  the S2S package can't use a remote STT endpoint, use Option C (standalone
  whisper-stream) and feed text to the S2S LLM+TTS pipeline

## Git workflow

- Branch: `feat/whisper-cpp-vulkan-stt`
- Commit per step; message style: `feat(s2s): <description>`
- Do NOT push unless instructed.

## Steps

### Step 1: Clone and build whisper.cpp with Vulkan

```powershell
cd C:\Users\1
git clone https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp
cmake -B build -DGGML_VULKAN=1
cmake --build build -j --config Release
```

**Verify**: `.\build\bin\Release\whisper-cli.exe --help` prints usage.
`.\build\bin\Release\whisper-bench.exe -m .\models\download-ggml-model.sh medium`
(note: download the model first with `.\models\download-ggml-model.cmd medium`).

### Step 2: Benchmark STT latency on Vulkan GPU vs CPU

```powershell
# GPU (Vulkan):
.\build\bin\Release\whisper-bench.exe -m models\ggml-medium.bin -t 4

# CPU (for comparison):
.\build\bin\Release\whisper-bench.exe -m models\ggml-medium.bin -t 4 --no-gpu
```

Record the encoder + decoder times. The GPU path should be significantly
faster for the encoder (the model-load bottleneck).

**Verify**: GPU benchmark completes and prints timing. GPU encoder time
should be <5s (vs ~30-60s on CPU).

### Step 3: Start whisper-server (OpenAI-compatible HTTP STT)

```powershell
.\build\bin\Release\whisper-server.exe --host 127.0.0.1 --port 8888 -m models\ggml-medium.bin
```

Test with a curl:
```powershell
# Create a test WAV (16kHz, mono, 16-bit)
ffmpeg -i samples\jfk.wav -ar 16000 -ac 1 -c:a pcm_s16le test.wav
curl -F "audio=@test.wav" http://127.0.0.1:8888/v1/audio/transcriptions
```

**Verify**: The server returns a JSON transcription. The model is loaded
into GPU VRAM at startup (~3-5s), then subsequent requests are fast.

### Step 4: Create boot script for whisper-server

Create `scripts/start-whisper-server-vulkan.ps1`:

```powershell
# Start whisper.cpp server with Vulkan GPU acceleration.
# Model loads into GPU VRAM at startup (~3-5s), then stays hot.
# Usage: .\scripts\start-whisper-server-vulkan.ps1
$WhisperDir = "C:\Users\1\whisper.cpp"
$Model = Join-Path $WhisperDir "models\ggml-medium.bin"
$Server = Join-Path $WhisperDir "build\bin\Release\whisper-server.exe"

if (-not (Test-Path $Server)) {
    Write-Host "whisper-server not found. Build whisper.cpp first." -ForegroundColor Red
    exit 1
}

Start-Process $Server -ArgumentList "--host", "127.0.0.1", "--port", "8888", "-m", $Model -WindowStyle Hidden
Write-Host "whisper-server (Vulkan) started on http://127.0.0.1:8888" -ForegroundColor Cyan
```

**Verify**: Running the script starts a background whisper-server process.
`curl http://127.0.0.1:8888/health` (or similar) responds.

### Step 5: Wire whisper-server into the S2S pipeline

**Option A (preferred):** Check if the `speech-to-speech` package supports
a remote STT endpoint. If it has a `--stt whisper-server` or
`--stt_url http://127.0.0.1:8888` flag, update
`scripts/start-speech-to-speech.ps1` to use it.

**Option B (fallback):** If the S2S package doesn't support remote STT, use
the `whispercpp` Python binding instead. Install it in the S2S venv:
`pip install whispercpp`, then patch the S2S STT handler to load via
`whispercpp` with Vulkan instead of `faster_whisper`.

**Option C (decoupled):** Run `whisper-stream` (real-time mic transcription
with Vulkan) as a separate process. Feed its text output to the S2S LLM+TTS.
This bypasses the S2S STT entirely.

Try Option A first. If the S2S package doesn't support it, fall back to B
or C. Document which option was used.

**Verify**: The S2S server starts and uses the GPU-accelerated STT. The
first transcription request completes in <5s (vs ~60s with CPU
faster-whisper).

### Step 6: Pre-warm Kokoro TTS at boot

Update `scripts/start-s2s-detached.ps1` (or `start-voice-stack.ps1`) to
send a dummy text-to-speech request immediately after S2S startup, warming
the Kokoro model:

```powershell
# After S2S starts, send a warmup TTS request:
Start-Sleep -Seconds 5  # wait for S2S to bind
Invoke-WebRequest -Uri "http://127.0.0.1:8765/v1/audio/speech" -Method POST -Body '{"text":"warmup","voice":"zf_xiaoyi"}' -ContentType "application/json" -ErrorAction SilentlyContinue
```

**Verify**: After the boot script runs, the first real voice request has
no TTS warmup delay.

### Step 7: Full offline smoke test

1. Start Hermes Docker (user manages).
2. Run `scripts/start-whisper-server-vulkan.ps1` (GPU STT).
3. Run `scripts/start-s2s-detached.ps1` (S2S with GPU STT + warm Kokoro).
4. Run `scripts/start-qaa-gateway.ps1` (QAA Gateway).
5. Run `cd web && npm run dev` (Vite).
6. Open browser, switch to offline mode, click paw-talk.
7. Say something — verify response in <10s (down from ~90s).

**Verify**: Offline voice round-trips in <10s. STT warmup is ~3-5s (GPU)
not ~60s (CPU). TTS warmup is ~0s (pre-warmed).

## Test plan

- No unit tests needed (this is infrastructure/tooling, not application code).
- The verification is the benchmark (Step 2) + smoke test (Step 7).
- Document the GPU vs CPU benchmark numbers in the plan's execution notes.

## Done criteria

- [ ] `whisper-cli.exe` built with Vulkan (`GGML_VULKAN=1`)
- [ ] `whisper-server.exe` starts and serves transcriptions on `:8888`
- [ ] GPU benchmark shows encoder time <5s (vs ~30-60s CPU)
- [ ] `scripts/start-whisper-server-vulkan.ps1` exists and works
- [ ] S2S server uses GPU-accelerated STT (Option A, B, or C documented)
- [ ] Kokoro TTS pre-warmed at boot
- [ ] Offline voice round-trips in <10s (smoke test passes)
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `cmake -B build -DGGML_VULKAN=1` fails — check Vulkan SDK is installed
  and the AMD driver supports Vulkan 1.4+. Report the CMake error.
- The `whisper-server` example is not built or not present in this version
  of whisper.cpp — check `examples/server/` exists; if not, use
  `whisper-cli` in a loop instead.
- The S2S `speech-to-speech` package has no way to use a remote STT
  endpoint (Options A and B both fail) — report back; Option C (standalone
  stream) requires a different integration approach.
- GPU benchmark is not faster than CPU — the Vulkan backend may not be
  optimized for this iGPU. Try ROCm/HIP (`GGML_HIP=1`) instead. If both
  are slower than CPU, report back — the warmup fix may need a different
  approach (smaller model, pre-loaded warm pool only).