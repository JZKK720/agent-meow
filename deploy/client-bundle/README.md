# agent-meow Client Bundle — Windows Setup Guide

This bundle gives you the agent-meow desktop app with the full voice
runtime stack (local LLM chat + GPU-accelerated text-to-speech).

## What's in the bundle

```
agent-meow-client\
├── agent-meow Setup 0.7.0.exe    ← Electron desktop app installer
├── scripts\
│   ├── install-qwen-tts-gpu.ps1    ← one-time GPU TTS setup
│   ├── start-qwen-tts-gpu.ps1      ← TTS server launcher
│   └── start-agent-meow-native.ps1 ← agent-meow server launcher
├── update-feed\latest.yml          ← auto-update manifest
└── README.md                       ← this file
```

> **IMPORTANT — the scripts are not standalone.** They expect to live
> inside a clone of the agent-meow repo (they locate the Python venv,
> the TTS server code, and `web\.env` relative to the repo root).
> After cloning the repo (prerequisite 4 below), copy the three
> `.ps1` files from this bundle's `scripts\` folder into the repo's
> `scripts\` folder, then run them **from the repo root**.

## Prerequisites (install these first)

1. **Python 3.12** — https://www.python.org/downloads/ (or `uv`, which
   manages it for you: https://docs.astral.sh/uv/)
2. **Docker Desktop** — https://www.docker.com/products/docker-desktop/
   (runs the Hermes gateway container)
3. **Ollama** — https://ollama.com/ with a model pulled:
   `ollama pull nemotron-3.5-lightning:30b-a3b` (or your preferred model)
4. **The agent-meow repo** cloned and set up:
   ```
   git clone https://github.com/JZKK720/agent-meow.git
   cd agent-meow
   uv sync
   ```
5. **Hermes gateway container running**:
   ```
   docker start hermes-gateway
   ```
   (If you don't have it yet, see deploy/docker/ in the repo.)
6. **web/.env** in the repo with your Hermes API key:
   ```
   VITE_HERMES_API_KEY=<your-key>
   ```

## Setup (one time)

### Step 1 — Install the desktop app
Run `agent-meow-setup.exe` and follow the installer.

### Step 2 — Install the GPU TTS stack
First copy the bundle's scripts into the repo (see the note above):
```powershell
copy <bundle-path>\scripts\*.ps1 <repo-path>\scripts\
cd <repo-path>
```
Then run the installer from the repo root:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-qwen-tts-gpu.ps1
```
This creates a dedicated Python 3.12 venv, installs GPU PyTorch
(auto-detects AMD ROCm / NVIDIA CUDA / CPU), and downloads the
Qwen3-TTS model (~2.3GB). Takes 10-15 minutes.

## Daily startup

### Step 3 — Start the runtime stack
From the repo root (where you copied the scripts):
```powershell
# Terminal 1: the GPU TTS server
powershell -ExecutionPolicy Bypass -File scripts\start-qwen-tts-gpu.ps1

# Terminal 2: the agent-meow server
powershell -ExecutionPolicy Bypass -File scripts\start-agent-meow-native.ps1
```

The launcher auto-detects what's running (Hermes, Ollama, GPU TTS)
and wires everything together. The web UI is at http://127.0.0.1:6767.

### Step 4 — Connect the desktop app
Launch the installed agent-meow desktop app. On first run use
**Server → Change Server…** and enter:
```
http://127.0.0.1:6767
```

## Troubleshooting

- **"GPU Qwen3-TTS :8890 — DOWN"** in the launcher output: start the
  TTS server first (Terminal 1 above). Voice still works via Edge TTS
  (online) in the meantime.
- **"Hermes gateway :8642 — DOWN"**: `docker start hermes-gateway`
- **Port 6767 already in use**: the launcher auto-stops the Docker
  agent-meow-server container; pass `-KeepDockerServer` to prevent that.
- **AMD GPU + "device kernel image is invalid"**: the installer handles
  the gfx1151 fix automatically; if you hit this, re-run
  `install-qwen-tts-gpu.ps1`.

## What you get

- **Chat** with local LLMs via Ollama (sub-second responses with KV
  cache warm)
- **Voice replies** with GPU-accelerated Qwen3-TTS (~2-3s per sentence,
  works offline) falling back to Edge TTS (online)
- **The full agent-meow desktop experience**: notifications, mic
  dictation, multi-window
