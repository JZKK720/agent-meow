# Plan 011: Custom QAA Provider — Local Realtime with Qwen3-ASR + Hermes LLM + Qwen3-TTS

**Commit:** `5057e384`  
**Date:** 2026-08-06  
**Status:** Draft  
**Effort:** L (large — new server + model integration)  
**Risk:** Medium — running 3 local models, implementing OpenAI Realtime API protocol

## Problem

Currently, offline voice mode uses the S2S server (:8765) as a middleman:

```
QAA → S2S (:8765) → faster-whisper (STT, CPU) → Hermes HTTP (LLM) → Kokoro (TTS, CPU)
```

This has three issues:

1. **S2S is a monolith** — it bundles STT + LLM + TTS in one process, adding latency and complexity
2. **faster-whisper is CPU-only** — it doesn't use the GPU, missing Qwen3-ASR-1.7B (already downloaded, ~4.7GB)
3. **Kokoro-82M is basic** — Qwen3-TTS (open-source, released Jan 2026) offers better quality, voice cloning, and voice design

## Goal

Create a custom QAA provider (`local-realtime`) that eliminates the S2S middleman and directly orchestrates:

```
QAA → local-realtime provider
       → Qwen3-ASR-1.7B (STT, GPU, 52 languages)
       → Hermes ACP (LLM, qwen3.6 + 橘宝 persona)
       → Qwen3-TTS-12Hz-1.7B-CustomVoice (TTS, GPU, voice cloning)
```

This gives:

- **Lower latency** — no S2S middleman, GPU-accelerated STT
- **Better quality** — Qwen3-ASR (52 languages) + Qwen3-TTS (voice design, cloning)
- **Full offline** — no cloud API needed, works without internet
- **Seamless switch** — QAA's existing provider switch UI (Auto / DashScope / Local) works as-is

## Available Models (all downloaded/ downloadable)

| Component     | Model                                | Size   | Location                                | Status              |
| ------------- | ------------------------------------ | ------ | --------------------------------------- | ------------------- |
| STT           | Qwen/Qwen3-ASR-1.7B                  | ~4.7GB | `C:\Users\1\models\Qwen_Qwen3-ASR-1.7B` | ✅ Downloaded       |
| STT (R16)     | Qwen/Qwen3-ASR-0.6B                  | ~1.9GB | `C:\Users\1\models\Qwen_Qwen3-ASR-0.6B` | ✅ Downloaded       |
| LLM           | qwen3.6:35b-a3b-q8_0                 | ~38GB  | Ollama :11434                           | ✅ Running          |
| TTS           | Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice | ~6.8GB | HuggingFace                             | ⬜ Need to download |
| TTS tokenizer | Qwen/Qwen3-TTS-Tokenizer-12Hz        | ~100MB | HuggingFace                             | ⬜ Need to download |

### Qwen3-TTS model variants (from research)

| Model                           | Size   | Purpose                              |
| ------------------------------- | ------ | ------------------------------------ |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~6.8GB | Predefined voices + 3s voice cloning |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ~6.8GB | Text-described voice creation        |
| Qwen3-TTS-12Hz-1.7B-Base        | ~6.8GB | Base model (in-context learning)     |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~2.5GB | Smaller for R16 (8GB dGPU)           |

**Recommendation**: Start with `Qwen3-TTS-12Hz-1.7B-CustomVoice` for K16 (96GB VRAM), `0.6B-CustomVoice` for R16 (8GB dGPU).

### Alternative: Qwen3-Omni-30B-A3B

Qwen3-Omni is a **full end-to-end omni-modal model** (ASR + LLM + TTS in one 30B MoE model, 3B active). It could replace the entire pipeline:

```
QAA → Qwen3-Omni-30B-A3B (ASR + LLM + TTS, all local, ~211ms audio latency)
```

- Pros: Single model, lowest latency, no orchestration needed
- Cons: 30B model (~60GB Q8), needs significant VRAM, can't use Hermes persona/tools
- **Not recommended for now** — it bypasses Hermes ACP (loses 橘宝 persona, tools, cron, memory)

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser (:5173)                                                    │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────────────────┐  │
│  │ Auto    │  │ DashScope│  │ Local Realtime (new)              │  │
│  │         │  │ (online)  │  │ (offline, GPU-accelerated)        │  │
│  └────┬────┘  └─────┬────┘  └──────────────┬─────────────────────┘  │
└───────┼─────────────┼─────────────────────┼────────────────────────┘
        │             │                     │
        ▼             ▼                     ▼
     QAA (:3101)   QAA (:3101)          QAA (:3101)
     provider=auto provider=dashscope  provider=local-realtime
        │             │                     │
        ▼             ▼                     ▼
     DashScope    DashScope           local-realtime provider
     (cloud)      (cloud)              (new file in QAA)
                                         │
                              ┌──────────┼──────────┐
                              ▼          ▼          ▼
                         Qwen3-ASR   Hermes ACP   Qwen3-TTS
                         (:8888)     (:8642)      (:8889)
                         STT (GPU)   LLM+橘宝     TTS (GPU)
```

## Implementation Steps

### Step 1: Download Qwen3-TTS models

```bash
# K16 (Strix Halo, 96GB VRAM)
python scripts/download-qwen3-tts.py --model Qwen3-TTS-12Hz-1.7B-CustomVoice
python scripts/download-qwen3-tts.py --model Qwen3-TTS-Tokenizer-12Hz

# R16 (HX470, 8GB dGPU) — use smaller model
python scripts/download-qwen3-tts.py --model Qwen3-TTS-12Hz-0.6B-CustomVoice
```

Models download to `C:\Users\1\models\Qwen_Qwen3-TTS-*`.

**Verification**: `dir C:\Users\1\models\Qwen_Qwen3-TTS-*\*.safetensors`

### Step 2: Create Qwen3-ASR server (:8888)

Write a lightweight FastAPI server that loads Qwen3-ASR-1.7B and exposes an HTTP endpoint:

```
POST /v1/asr
  Body: { audio: base64_pcm16, sample_rate: 16000 }
  Response: { text: "transcribed text", language: "zh" }
```

File: `scripts/serve-qwen3-asr.py`

Uses `transformers` + `Qwen3ASRForConditionalGeneration`:

```python
from transformers import Qwen3ASRForConditionalGeneration, AutoProcessor
model = Qwen3ASRForConditionalGeneration.from_pretrained("C:/Users/1/models/Qwen_Qwen3-ASR-1.7B", device="cuda")
```

**Verification**: `curl -X POST http://127.0.0.1:8888/v1/asr -d @test_audio.json`

### Step 3: Create Qwen3-TTS server (:8889)

Write a lightweight FastAPI server that loads Qwen3-TTS-1.7B-CustomVoice:

```
POST /v1/tts
  Body: { text: "你好世界", voice: "Cherry", speed: 1.0 }
  Response: { audio: base64_pcm24, sample_rate: 24000 }
```

File: `scripts/serve-qwen3-tts.py`

Uses `qwen_tts` package:

```python
from qwen_tts import Qwen3TTSModel
tts = Qwen3TTSModel.from_pretrained("C:/Users/1/models/Qwen_Qwen3-TTS-12Hz-1.7B-CustomVoice", device="cuda")
```

**Verification**: `curl -X POST http://127.0.0.1:8889/v1/tts -d '{"text":"你好","voice":"Cherry"}'`

### Step 4: Create the QAA `local-realtime` provider

Write a new provider file that QAA loads as a third provider option:

File: `C:\Users\1\AppData\Roaming\npm\node_modules\qwen-audio-agent\server\src\voice\providers\local-realtime.mjs`

This provider:

1. Opens a WebSocket that QAA connects to (like s2sProvider but different endpoint)
2. Receives audio chunks from QAA
3. Forwards audio to Qwen3-ASR server (:8888) for STT
4. Sends transcript to Hermes ACP (:8642) for LLM response
5. Sends LLM response to Qwen3-TTS server (:8889) for TTS
6. Streams audio back to QAA

The provider implements the OpenAI Realtime API protocol (same as s2sProvider) but orchestrates the three local services instead of connecting to a single S2S server.

Alternatively, create a standalone WebSocket server (`scripts/serve-local-realtime.py`) that:

- Listens on `ws://127.0.0.1:8890/v1/realtime`
- Speaks the OpenAI Realtime API protocol
- Orchestrates Qwen3-ASR + Hermes + Qwen3-TTS internally
- QAA's `speech-to-speech` provider points to this instead of S2S

**The standalone WebSocket server approach is the only approach** — it replaces S2S entirely. No QAA provider registry patching needed, just change `SPEECH_TO_SPEECH_REALTIME_URL` in config.env.

### Step 5: Remove S2S server entirely

The S2S server (:8765) is **fully retired**:

1. Remove S2S startup from `scripts/start-voice-stack.ps1` (the entire S2S section)
2. Remove S2S-related args: `--llm_backend`, `--responses_api_base_url`, `--model_name`, etc.
3. Remove `scripts/run_s2s_with_patches.py` (no longer needed)
4. Remove S2S health probe from `scripts/start-voice-stack.ps1` (the `/v1/pool` check)
5. The `speech-to-speech` provider label in QAA now points to our local-realtime server (:8890)
6. Update VoicePanel label from "S2S" to "Local" (offline GPU-accelerated)

No fallback to S2S — the local-realtime server IS the offline provider.

### Step 6: Update start-voice-stack.ps1

Add startup for the new local services:

```powershell
# Start Qwen3-ASR server (:8888)
$asrProc = Start-Process -FilePath $VenvPython -ArgumentList @("scripts/serve-qwen3-asr.py", "--port", "8888") ...

# Start Qwen3-TTS server (:8889)
$ttsProc = Start-Process -FilePath $VenvPython -ArgumentList @("scripts/serve-qwen3-tts.py", "--port", "8889") ...

# Start local-realtime orchestrator (:8890) — if using standalone approach
$realtimeProc = Start-Process -FilePath $VenvPython -ArgumentList @("scripts/serve-local-realtime.py", "--port", "8890") ...
```

### Step 7: Update VoicePanel provider switch

The existing provider switch already reads from QAA's `/api/health` `realtimeProviders` array. Once the new provider is registered, it will automatically appear as a third option (☁️ DashScope / 🖥️ S2S / 🏠 Local).

## Simplified Approach (Recommended)

Instead of writing a full QAA provider (complex), use the **standalone WebSocket server** approach:

1. Write `scripts/serve-local-realtime.py` — a Python WebSocket server on :8890 that:
   - Speaks the OpenAI Realtime API protocol (like S2S)
   - Receives audio from QAA
   - Calls Qwen3-ASR (:8888) for STT
   - Calls Hermes HTTP API (:8642) for LLM
   - Calls Qwen3-TTS (:8889) for TTS
   - Streams audio back to QAA

2. Change QAA config:

```
SPEECH_TO_SPEECH_REALTIME_URL=ws://127.0.0.1:8890/v1/realtime
```

3. QAA's existing `speech-to-speech` provider now connects to our local-realtime server — **S2S is gone**.

This is simpler because:

- No QAA provider registry patching needed
- QAA sees the local-realtime server as just another S2S endpoint
- The VoicePanel already shows the provider button — just relabel to "Local"
- No S2S server process, no faster-whisper, no Kokoro — fully retired

## VRAM Budget (K16 Strix Halo, 96GB)

| Component                        | VRAM      | Notes                            |
| -------------------------------- | --------- | -------------------------------- |
| qwen3.6:35b-a3b-q8_0 (LLM)       | ~38GB     | iGPU VRAM                        |
| Qwen3-ASR-1.7B (STT)             | ~5GB      | iGPU VRAM                        |
| Qwen3-TTS-1.7B-CustomVoice (TTS) | ~7GB      | iGPU VRAM                        |
| **Total**                        | **~50GB** | **46GB free** — fits comfortably |

## VRAM Budget (R16 HX470, 8GB dGPU + 32GB RAM)

| Component                        | VRAM                  | Notes             |
| -------------------------------- | --------------------- | ----------------- |
| qwen3.6:35b-a3b (LLM, MoE)       | ~3GB active + offload | dGPU + iGPU + RAM |
| Qwen3-ASR-0.6B (STT)             | ~2.5GB                | dGPU              |
| Qwen3-TTS-0.6B-CustomVoice (TTS) | ~2.5GB                | dGPU              |
| **Total dGPU**                   | **~8GB**              | Tight but fits    |

## Files to Create

| File                              | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `scripts/download-qwen3-tts.py`   | Download Qwen3-TTS models via HF mirror  |
| `scripts/serve-qwen3-asr.py`      | FastAPI server for Qwen3-ASR STT (:8888) |
| `scripts/serve-qwen3-tts.py`      | FastAPI server for Qwen3-TTS (:8889)     |
| `scripts/serve-local-realtime.py` | WebSocket orchestrator (:8890)           |

## Files to Modify

| File                              | Change                                          |
| --------------------------------- | ----------------------------------------------- |
| `scripts/start-voice-stack.ps1`   | Replace S2S startup with local-realtime servers |
| `~/.config/qwaudio/config.env`    | Change S2S URL to local-realtime server (:8890) |
| `scripts/run_s2s_with_patches.py` | **Delete** — no longer needed                   |
| `web/src/shell/VoicePanel.tsx`    | Relabel "S2S" button to "Local"                 |

## Verification

1. Start all services: `.\scripts\start-voice-stack.ps1 -Profile k16-strix-halo`
2. Start QAA: `C:\Users\1\.config\qwaudio\start-qaa.bat`
3. Open `http://localhost:5173`
4. In VoicePanel, select **🖥️ S2S** (now points to local-realtime)
5. Click mic, say "你是谁"
6. Expected: 橘宝 responds via Qwen3-TTS voice, transcript appears in session
7. Check VRAM: all 3 models loaded, <96GB used

## Escape Hatches

- If Qwen3-ASR doesn't support streaming, use batch mode (accumulate audio, then transcribe)
- If VRAM is insufficient on R16, use 0.6B models for both ASR and TTS
- If the OpenAI Realtime API protocol is too complex to implement in the orchestrator, pause and report — do NOT fall back to S2S
- If Qwen3-TTS `qwen_tts` package has Windows compatibility issues, pause and report

## Maintenance Notes

- Qwen3-TTS and Qwen3-ASR are from the same model family — future Qwen updates may bundle them
- Qwen3-Omni (30B) could eventually replace the entire pipeline if VRAM allows
- The `qwen_tts` pip package is required: `pip install qwen-tts`
- Hermes ACP connection stays the same — the LLM path is unchanged
- Watch for QAA updates that might overwrite provider patches (npm updates)
- The S2S server and all its dependencies (faster-whisper, Kokoro, run_s2s_with_patches.py) are fully retired
