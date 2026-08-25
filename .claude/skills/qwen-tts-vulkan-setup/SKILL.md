---
name: qwen-tts-vulkan-setup
description: >
  Install and build Qwen3-TTS (qwentts.cpp) with Vulkan GPU backend on Windows
  for agent-meow's voice pipeline. Use when: setting up TTS for the first time,
  rebuilding after a Vulkan SDK update, troubleshooting "tts-server.exe not found"
  or "no audio from TTS", or configuring QWEN_TTS_* environment variables.
  Covers prerequisites (Vulkan SDK, CMake, MSVC), build steps, model download,
  and wiring into agent-meow's service supervisor.
---

# Qwen3-TTS Vulkan Setup for agent-meow

## Prerequisites

### 1. Vulkan SDK (required)

Install the LunarG Vulkan SDK for Vulkan GPU compute (AMD / NVIDIA / Intel):

- **Download**: https://vulkan.lunarg.com/sdk/home
- **Tested version**: 1.4.357.0
- **Install path**: `C:\VulkanSDK\1.4.357.0`
- **Set environment variable**:
  ```powershell
  [System.Environment]::SetEnvironmentVariable("VULKAN_SDK", "C:\VulkanSDK\1.4.357.0", "User")
  $env:VULKAN_SDK = "C:\VulkanSDK\1.4.357.0"
  $env:Path = "$env:VULKAN_SDK\Bin;$env:Path"
  ```
- **Verify**:
  ```powershell
  glslangValidator --version    # should print version
  vulkaninfo --summary           # should list your GPU(s)
  ```

### 2. CMake (required)

- **Tested version**: 4.2.0+ (3.14+ minimum)
- **Download**: https://cmake.org/download/
- **Verify**: `cmake --version`

### 3. C++ Compiler (required)

- **Windows**: Visual Studio 2022 with "Desktop development with C++" workload
  - Includes MSVC v143 and Windows SDK
  - `cl.exe` must be on PATH (run from "x64 Native Tools Command Prompt for VS 2022"
    or `vcvarsall.bat x64`)
- **Linux**: `gcc-13+` or `clang-16+`
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)

### 4. Git (required)

- For cloning the qwentts.cpp repo
- `git --version` should work

## GPU Requirements

| GPU | Support | Backend | Notes |
|-----|---------|---------|-------|
| **AMD Radeon** (7900 XTX, 8060S, etc.) | ✅ Full | Vulkan | Primary target — Strix Halo iGPU + dGPU |
| **NVIDIA GeForce/RTX** | ✅ Full | Vulkan or CUDA | Use `-DGGML_VULKAN=ON` or `buildcuda.sh` |
| **Intel Arc/iGPU** | ✅ Full | Vulkan | Use `-DGGML_VULKAN=ON` |
| **CPU only** | ✅ Slow | CPU | Use `buildcpu.sh` — no GPU needed |

> **AMD Strix Halo (Ryzen AI MAX+ 395)**: The iGPU (8060S, 96GB VRAM) runs
> whisper.cpp STT. The dGPU (7900 XTX) runs Qwen3-TTS. Both use Vulkan.

## Build Steps (Windows / Vulkan)

### Step 1: Clone qwentts.cpp

```powershell
cd C:\Users\<your-user>\github-pr
git clone https://github.com/ggml-org/qwentts.cpp.git
cd qwentts.cpp
```

> If the repo is not public yet, clone from your fork or local copy.

### Step 2: Configure with CMake (Vulkan backend)

```powershell
# Ensure Vulkan SDK is in PATH
$env:VULKAN_SDK = "C:\VulkanSDK\1.4.357.0"
$env:Path = "$env:VULKAN_SDK\Bin;$env:Path"

# Create build directory
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
mkdir build
cd build

# Configure with Vulkan
cmake .. -DGGML_VULKAN=ON
```

### Step 3: Build

```powershell
cmake --build . --config Release -j 4
```

**Output**: `build\Release\tts-server.exe` (Windows) or `build/tts-server` (Linux)

### Step 4: Verify the binary

```powershell
.\Release\tts-server.exe --help
```

You should see usage info. If you get a Vulkan error, verify:
- `vulkaninfo --summary` lists your GPU
- Vulkan SDK is in PATH
- GPU drivers are up to date (AMD Adrenalin, NVIDIA GeForce, Intel Arc)

## Build Steps (Linux / Vulkan)

```bash
git clone https://github.com/ggml-org/qwentts.cpp.git
cd qwentts.cpp
./buildvulkan.sh    # runs: cmake .. -DGGML_VULKAN=ON && cmake --build . --config Release -j $(nproc)
```

**Output**: `build/tts-server`

## Download Models

Qwen3-TTS requires two GGUF model files:

### 1. Qwen3-TTS voice model

```powershell
# Download Q8_0 quantized model (~1.8 GB)
mkdir models -Force
Invoke-WebRequest -Uri "https://huggingface.co/Qwen/Qwen3-TTS-GGUF/resolve/main/qwen3-tts-q8_0.gguf" `
  -OutFile "models\qwen3-tts-q8_0.gguf"
```

Or use the custom-voice variant (if available):
```powershell
# Custom voice model (~1.7B params, Q8_0)
Invoke-WebRequest -Uri "<your-model-url>/qwen-talker-1.7b-customvoice-Q8_0.gguf" `
  -OutFile "models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
```

### 2. Qwen3-TTS tokenizer/codec

```powershell
# 12Hz tokenizer codec (~75 MB)
Invoke-WebRequest -Uri "<your-model-url>/qwen-tokenizer-12hz-Q8_0.gguf" `
  -OutFile "models\qwen-tokenizer-12hz-Q8_0.gguf"
```

> **Model file naming**: The exact filenames must match what you set in
> `QWEN_TTS_MODEL` and `QWEN_TTS_CODEC` env vars.

## Configure agent-meow Environment Variables

Set these in your terminal session before starting the agent-meow server:

```powershell
# Path to the tts-server.exe binary
$env:QWEN_TTS_SERVER_EXE = "C:\Users\<your-user>\github-pr\qwentts.cpp\build\Release\tts-server.exe"

# Path to the TTS voice model (GGUF)
$env:QWEN_TTS_MODEL = "C:\Users\<your-user>\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"

# Path to the TTS tokenizer/codec (GGUF)
$env:QWEN_TTS_CODEC = "C:\Users\<your-user>\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"

# Voice alias (used by the /tts API)
$env:QWEN_TTS_ALIAS = "qwen3-tts-customvoice"

# TTS wrapper URL (Python wrapper on port 8890, C++ binary on 8891)
$env:QWEN_TTS_URL = "http://127.0.0.1:8890"
```

### Auto-detection (no env vars needed)

If you don't set `QWEN_TTS_SERVER_EXE`, agent-meow's service supervisor
auto-detects the binary at:
```
~/github-pr/qwentts.cpp/build/Release/tts-server.exe
```

## Start the TTS Server

### Via agent-meow service supervisor (recommended)

The service supervisor in `agent_meow/server/service_supervisor.py`
automatically spawns and monitors `tts-server.exe` with crash-restart:

```powershell
# Set all env vars (see above), then:
omnigent server start
```

The supervisor will:
1. Spawn `tts-server.exe` on port 8891
2. Spawn the Python TTS wrapper on port 8890
3. Monitor both — restart on crash

### Manual start (for debugging)

```powershell
# Start the C++ TTS server directly
& $env:QWEN_TTS_SERVER_EXE --model $env:QWEN_TTS_MODEL --codec $env:QWEN_TTS_CODEC --port 8891
```

## Verify the TTS Server

```powershell
# Check if the server is listening
netstat -ano | Select-String ":8891"

# Test with a simple TTS request
curl -X POST http://127.0.0.1:8891/tts `
  -H "Content-Type: application/json" `
  -d '{"text":"你好，我是橘宝。","voice":"qwen3-tts-customvoice"}' `
  -o test_tts.wav

# Play the output
Start-Process test_tts.wav
```

## Full Voice Pipeline Environment (STT + LLM + TTS)

For the complete voice pipeline, set ALL environment variables together:

```powershell
# === Vulkan SDK ===
$env:VULKAN_SDK = "C:\VulkanSDK\1.4.357.0"
$env:Path = "$env:VULKAN_SDK\Bin;$env:Path"

# === STT (whisper.cpp) ===
$env:WHISPER_STT_URL = "http://127.0.0.1:8001"
$env:WHISPER_SERVER_EXE = "C:\Users\<your-user>\whisper.cpp\build\bin\Release\whisper-server.exe"
$env:WHISPER_SERVER_MODEL = "C:\Users\<your-user>\whisper.cpp\ggml-medium.bin"
$env:WHISPER_VAD_MODEL = "C:\Users\<your-user>\.cache\lemonade\models\ggml-silero-v6.2.0.bin"

# === LLM (Hermes gateway) ===
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "<your-hermes-api-key>"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"

# === TTS (Qwen3-TTS) ===
$env:QWEN_TTS_URL = "http://127.0.0.1:8890"
$env:QWEN_TTS_SERVER_EXE = "C:\Users\<your-user>\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWEN_TTS_MODEL = "C:\Users\<your-user>\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWEN_TTS_CODEC = "C:\Users\<your-user>\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:QWEN_TTS_ALIAS = "qwen3-tts-customvoice"
```

## Troubleshooting

### "tts-server.exe not found"

- Check `QWEN_TTS_SERVER_EXE` env var is set and path is correct
- Check the build completed: `Test-Path build\Release\tts-server.exe`
- If not built, run the build steps above

### Vulkan initialization failure

- Verify Vulkan SDK: `glslangValidator --version`
- Verify GPU is detected: `vulkaninfo --summary`
- Update GPU drivers (AMD Adrenalin / NVIDIA GeForce / Intel Arc)
- On AMD, ensure the dGPU (not just iGPU) has Vulkan support

### No audio output

- Check port 8891 is listening: `netstat -ano | Select-String ":8891"`
- Check model files exist and are valid GGUF
- Check the Python wrapper on port 8890 is running
- Test the C++ server directly (bypass the wrapper)

### TTS sounds garbled or wrong language

- Verify model files are the correct Q8_0 quantized versions
- Check `QWEN_TTS_ALIAS` matches the voice name expected by the API
- The Hermes gateway system prompt should specify the output language

### Port conflicts

- TTS C++ server: port 8891
- TTS Python wrapper: port 8890
- If ports are in use, kill the stale process:
  ```powershell
  netstat -ano | Select-String ":889[01]"
  Stop-Process -Id <pid> -Force
  ```

## Port Reference

| Service | Port | Binary | GPU |
|---------|------|--------|-----|
| TTS C++ server | 8891 | `tts-server.exe` | dGPU (Vulkan) |
| TTS Python wrapper | 8890 | Python `tts_wrapper` | — (proxies to 8891) |
| STT (whisper.cpp) | 8001 | `whisper-server.exe` | iGPU (Vulkan) |
| LLM (Hermes) | 8642 | Docker container | CPU / cloud |
| Ollama (alt LLM) | 11434 | `ollama` | GPU or CPU |

## Model File Reference

| Model | File | Size | Source |
|-------|------|------|--------|
| Qwen3-TTS voice (Q8_0) | `qwen3-tts-q8_0.gguf` | ~1.8 GB | HuggingFace: Qwen/Qwen3-TTS-GGUF |
| Custom voice (Q8_0) | `qwen-talker-1.7b-customvoice-Q8_0.gguf` | ~1.7 GB | Custom / fork release |
| Tokenizer codec (Q8_0) | `qwen-tokenizer-12hz-Q8_0.gguf` | ~75 MB | Custom / fork release |
| Whisper medium | `ggml-medium.bin` | ~1.5 GB | HuggingFace: ggerganov/whisper.cpp |
| Whisper large-v3-turbo | `ggml-large-v3-turbo.bin` | ~1.6 GB | HuggingFace: ggerganov/whisper.cpp |
| Silero VAD | `ggml-silero-v6.2.0.bin` | ~2 MB | HuggingFace: ggml-org/silero-vad |