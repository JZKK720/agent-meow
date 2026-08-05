---
marp: true
theme: meowcat
paginate: true
size: 16:9
---

<!-- MeowCat theme source: plans/themes/meowcat.css -->

# agent-meow Dual-Platform Combined Report

## LinC K16 (395) + Orange Treasure R16 (HX470)

**Date**: 2026-08-05 · **Status**: K16 pushed, R16 under assessment

> Turn a 90-second cold start into near-0s online / 3-8s offline local voice agent

---

# Hardware Comparison

| Component | LinC K16 (AI MAX+ 395)  | Orange R16 (HX 470+5060)        |
| --------- | ----------------------- | ------------------------------- |
| CPU       | 16C/32T Zen5            | 12C/24T Zen5 (Gorgon Point)     |
| iGPU      | Radeon 8060S (RDNA 3.5) | Radeon 890M (RDNA 3.5)          |
| iGPU VRAM | **96GB** (128GB total)  | **32GB** unified memory         |
| dGPU      | None                    | **RTX 5060 Laptop (8GB GDDR7)** |
| CUDA      | None                    | **RTX 5060 native**             |
| NPU       | XDNA 2 assist           | XDNA 2 (~50 TOPS)               |
| Memory    | **128GB** LPDDR5x-8000  | 32GB DDR5-5600                  |

**Key difference**: K16 fits large models via 96GB VRAM (full quality); R16 accelerates via RTX 5060 CUDA, faster STT

---

# Architecture Division

![w:720](./diagrams/395-architecture-en.png)

**K16**: LLM + STT both on iGPU (96GB VRAM), NPU assists. The subject is **unified memory**
**R16**: dGPU runs LLM active layers + STT (CUDA), iGPU 890M assists MoE experts, NPU assists. The subject is **hybrid division**

---

# Voice Path: Dual-Mode Entry + GPU Offline

![h:360](./diagrams/395-voice-pipeline-en.png)

**QAA gateway is the turning point** — online via DashScope (~0s first response), offline via GPU STT + local LLM

| Platform | Offline STT             | Warmup  |
| -------- | ----------------------- | ------- |
| K16      | whisper.cpp Vulkan      | ~3s     |
| R16      | **faster-whisper CUDA** | **~1s** |

---

# VRAM Budget Comparison

| Metric    | K16                  | R16                          |
| --------- | -------------------- | ---------------------------- |
| LLM model | 35B-A3B Q8_0 (38GB)  | **35B-A3B IQ3** (~13GB)      |
| ASR       | Qwen3-ASR 1.7B (5GB) | Qwen3-ASR **0.6B** (2.5GB)   |
| Inference | iGPU 96GB (ROCm)     | dGPU 8GB+RAM (CUDA)          |
| Headroom  | **53GB** buffer      | **2.5GB** dGPU remaining     |
| Speed     | ~20-30 tok/s         | ~15-25 tok/s (MoE 3B active) |

**K16 strategy**: full Q8_0 load, quality first · **R16 strategy**: active layers on dGPU, experts spill to RAM, IQ3 quant

---

# Delivery Map: Four Stages

![w:640](./diagrams/395-dependencies-en.png)

| Stage | Core move  | Note                                       |
| ----- | ---------- | ------------------------------------------ |
| 1     | 006 + 008  | QAA gateway + GPU STT (R16 008 is lighter) |
| 2     | 006b + 007 | Reconnect MeowCat front-end, same UI       |
| 3     | 009        | Hermes separates speaking from doing       |
| 4     | 010        | Local LLM closes the loop                  |

> 001-005 are hygiene fixes, not experience ceiling. R16's 008 is close to install-and-run.

---

# Optimized Stack Comparison

| Component | K16 Engine         | K16 Loc   | R16 Engine              | R16 Loc           |
| --------- | ------------------ | --------- | ----------------------- | ----------------- |
| LLM       | Ollama+ROCm        | iGPU 96GB | **Ollama+CUDA**         | **dGPU+RAM+iGPU** |
| STT       | whisper.cpp+Vulkan | iGPU      | **faster-whisper+CUDA** | **dGPU**          |
| TTS/VAD   | Kokoro / Silero    | CPU       | Same                    | CPU               |
| Gateway   | QAA                | CPU       | QAA                     | CPU               |
| Agent OS  | Hermes/Ollama      | CPU+iGPU  | Hermes/Ollama           | CPU+dGPU          |
| MoE exp   | —                  | —         | **iGPU 890M**           | **32GB unified**  |
| Assist    | NPU XDNA 2         | NPU       | **NPU ~50 TOPS**        | **NPU**           |

---

# Achieved Results

| Metric          | K16 (before → after)      | R16 (before → after)      |
| --------------- | ------------------------- | ------------------------- |
| Voice warmup    | 90s → **~0s**             | 90s → **~0s**             |
| STT warmup      | 60s → **~3s** (Vulkan)    | 60s → **~1s** (CUDA)      |
| LLM             | 35B-A3B Q8_0 full load    | 35B-A3B IQ3 hybrid        |
| GPU utilization | 0% → **4 engines active** | 0% → **4 engines active** |
| Cloud dep.      | Required → **Optional**   | Required → **Optional**   |
| Cost            | API → **Zero** (offline)  | API → **Zero** (offline)  |
| Effort          | MED (Vulkan compile)      | **LOW** (native CUDA)     |

---

# Final Delivered Shape

![w:680](./diagrams/395-achievements-en.png)

- **Instant online**: speak immediately
- **Real offline**: voice resolves end-to-end without cloud
- **No external GPU**: CPU / iGPU / dGPU / NPU four-engine coordination
- **Upgrade runway**: NPU, Qwen3-TTS, WinML still future levers

---

# Dual-Platform Delivery Strategy

![w:640](./diagrams/dual-hardware-compare-en.png)

**K16 and R16 are not competitors**: K16 preserves quality ceiling, R16 broadens deployment surface

- K16 validates **35B quality ceiling + fully local experience**
- R16 validates **native CUDA adaptation + broader hardware rollout**
- Both share the same agent-meow core, QAA gateway, Hermes, and profile-driven launch
- Delivery order: mature on K16 first, then package profiles for HX470
