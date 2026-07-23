# voicebox-agent

A voice-output assistant example demonstrating **per-agent high-quality TTS + voice cloning via MCP**.

This is the reference for the per-agent voicebox integration: declare the voicebox MCP server (FastMCP at `/mcp`, Streamable HTTP) inside one agent bundle's `config.yaml`, so every session created from that agent gets voicebox's TTS surface with **zero core agent-meow code changes**.

## What it gives you

- **7 TTS engines.** Qwen3-TTS, Qwen CustomVoice, LuxTTS, Chatterbox (23 langs, cloning), Chatterbox Turbo (English, paralinguistic tags), TADA/HumeAI (long-form cloning), Kokoro 82M (CPU realtime, preset voices).
- **Voice cloning.** Zero-shot cloning from a reference audio clip (Chatterbox, TADA, Qwen3-TTS, LuxTTS).
- **Multilingual.** Up to 23 languages (Chatterbox), 10 (Qwen), 8 (Kokoro).
- **No GPU required for Kokoro.** 82M params, CPU realtime — runs on any laptop.
- **Style control.** Qwen CustomVoice supports `instruct` for tone/emotion/prosody. Chatterbox Turbo supports inline paralinguistic tags (`[laugh]`, `[cough]`).
- **Whisper STT.** Transcribe audio the user uploads (PyTorch or MLX-Whisper depending on platform).
- **Complements the existing `voice-agent`.** That one uses VibeVoice-Realtime (~300ms first-audible, best for live streaming agent voice) + Handy (offline STT). This one uses voicebox (best for quality, cloning, multilingual, no-GPU). Use both when you want both low-latency live voice AND high-quality cloned voice.

## Setup

### 1. Run the voicebox server (one terminal, runs forever)

voicebox is a full FastAPI + Tauri + React app. Run the backend server locally:

```bash
# From the voicebox repo (https://github.com/JZKK720/voicebox)
cd backend
pip install -r requirements.txt
# On Apple Silicon (optional, for MLX backends):
#   pip install -r requirements-mlx.txt
# A couple of engines need --no-deps to avoid torch version conflicts:
pip install --no-deps chatterbox-tts hume-tada
pip install git+https://github.com/QwenLM/Qwen3-TTS.git
python main.py
```

The server listens on `http://localhost:17493` with the MCP endpoint at `/mcp` (FastMCP, Streamable HTTP). Models download on first use and cache locally.

Verify it's up:

```bash
curl http://localhost:17493/health
```

### 2. Run the agent (another terminal)

```bash
meow run examples/voicebox-agent/config.yaml
```

The runner reads `config.yaml`, sees the `voicebox` entry under `tools:` with `transport: http`, and the MCP client manager dials `http://localhost:17493/mcp`. The agent gets voicebox's TTS + STT tools.

## How the wiring works (no core code change)

Same pattern as `examples/memory-agent` and `examples/scrapling-agent`:

- `agent_meow/tools/mcp.py` — MCP client manager (HTTP / Streamable HTTP transport).
- `agent_meow/spec/types.py::MCPServerConfig` — the typed config this `config.yaml` parses into (`transport: http`, `url: http://localhost:17493/mcp`).
- `AgentSpec.mcp_servers` — populated from `tools:` entries with `type: mcp`.

This example adds one `MCPServerConfig` entry. The runner's `RunnerMcpManager` connects to the voicebox MCP server at session start and exposes its tools to the model.

## Trying it

1. Start the voicebox server (step 1 above).
2. Run the agent (step 2 above).
3. In the session:
   - "Say 'Hello, this is a test' using Kokoro." → the agent calls the voicebox TTS tool with `engine=kokoro`.
   - "Clone this voice and say 'Welcome back.'" (with a reference audio file) → the agent uses `engine=chatterbox` (or `tada`, `qwen`) with the reference audio path.
   - "Say this in Japanese: こんにちは" → `engine=chatterbox` with `language=ja`.
   - "Transcribe this audio file." (with an upload) → the agent calls the voicebox Whisper STT tool.

## Engine selection guide

| Need | Engine | Why |
| --- | --- | --- |
| Fast, no GPU, preset voice | `kokoro` | 82M, CPU realtime, 8 langs |
| Clone a specific voice, multilingual | `chatterbox` | 23 langs, zero-shot cloning |
| Expressive English (laughs, coughs) | `chatterbox_turbo` | Paralinguistic tags |
| Highest quality, 10 langs, cloning | `qwen` (qwen3-tts) | Top quality, voice cloning |
| Preset voice + style instructions | `qwen_custom_voice` | `instruct` param for tone/emotion |
| Long-form (700s+), high-fidelity cloning | `tada` (HumeAI) | Text-acoustic dual alignment |
| Fast, CPU-friendly, 48kHz cloning | `luxtts` | ~1GB VRAM, 150x realtime on CPU |

## Tuning

voicebox's knobs live on the **tool call arguments** (engine, voice_prompt, language, seed, instruct) and on the **server** side (model download/cache, device selection — automatic via `utils/platform_detect.py`).

## Notes

- **Port:** voicebox's default backend port is `17493`. If you run it on a different port, update `url:` in `config.yaml`.
- **Models download on first use.** The first TTS call for each engine downloads its weights (Kokoro ~350MB, Chatterbox ~3.2GB, TADA 1B ~2GB / 3B ~8GB, Qwen ~3.5GB). Subsequent calls use the cache.
- **Platform backends.** Apple Silicon → MLX; NVIDIA → CUDA; AMD → ROCm; Intel Arc → IPEX/XPU; Windows any GPU → DirectML; else → CPU. Detection is automatic.
- **Coexists with `voice-agent` (VibeVoice).** Use `voice-agent` for low-latency live streaming voice (~300ms first-audible via VibeVoice-Realtime). Use `voicebox-agent` for quality, cloning, multilingual, or CPU-only TTS. They can even be sub-agents of the same parent if you want both.
- **Not server-wide.** Same per-agent caveat: only sessions from agents that declare `voicebox` get it.
