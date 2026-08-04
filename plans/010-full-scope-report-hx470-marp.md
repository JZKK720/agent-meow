---
marp: true
theme: meowcat
paginate: true
size: 16:9
---

<!-- theme: meowcat — unified MeowCat/ColorFire brand identity.
  See plans/themes/meowcat.css for token source (mirrors web/src/index.css). -->

# agent-meow 实施范围报告

## 计划 001–010 · 完整实施路线图（橘宝R16）

**运行环境**：橘宝R16 · AMD Ryzen AI 9 HX 470 + RTX 5060 (8GB CUDA)
**四引擎**：CPU 12C + dGPU 8GB CUDA + iGPU 890M + NPU XDNA 2 · **日期**：2026-08-04
**状态**：可行性评估中 · 灵创K16 方案已推送至 `origin/main`

---

# 硬件平台 & HX470+5060 架构

| 组件      | 规格                                          | 状态 |
| --------- | --------------------------------------------- | ---- |
| CPU       | AMD Ryzen AI 9 HX 470, 12C/24T (Gorgon Point) | ✅   |
| iGPU      | Radeon 890M (RDNA 3.5)                        | ✅   |
| iGPU 显存 | **32GB** 统一内存                             | ✅   |
| dGPU      | **RTX 5060 Laptop (8GB GDDR7, Blackwell)**    | ✅   |
| dGPU 计算 | **CUDA + Vulkan** (原生支持)                  | ✅   |
| NPU       | AMD XDNA 2 (~50 TOPS)                         | ✅   |
| CUDA      | **RTX 5060 原生 CUDA 支持**                   | ✅   |
| ROCm      | 7.1 (iGPU Vulkan 优先)                        | ✅   |
| 内存      | 32GB DDR5-5600                                | ✅   |

**HX470+5060 独特性**：RTX 5060 提供原生 CUDA → faster-whisper **直接可用**，无需 whisper.cpp Vulkan 替代。8GB GDDR7 独立显存 + 32GB 统一内存 = 混合 offload 架构。预填充 A3B 活跃层 + Whisper 到 dGPU 后，iGPU 890M + NPU 通过统一内存承担辅助计算。

```
CPU: TTS+VAD+QAA网关    dGPU: LLM(3B激活)+STT(CUDA)    NPU: 辅助推理
iGPU 890M: MoE 专家 offload + 辅助计算    RAM: 统一 32GB 共享池
```

---

# 计划 001–005：基础设施修复

| #   | 计划              | 状态  | 内容            |
| --- | ----------------- | ----- | --------------- |
| 001 | db_models 路径    | TODO  | 路径精确化      |
| 002 | VIDEOS_SURFACE.md | TODO  | 过时声明        |
| 003 | Phase 4 runner    | TODO  | 注册工具        |
| 004 | 过时 voicebox     | TODO  | 清理废弃        |
| 005 | Voicebox 可靠性   | DRAFT | 被 006+008 取代 |

**优先级**：低于 QAA 语音迁移。代码卫生修复不依赖硬件平台，与灵创K16 完全通用。

---

# 计划 006+006b：QAA 网关 + 混合部署

**已解决**：原 S2S 冷启动 90 秒问题已通过 QAA 网关 + GPU STT 解决。

**橘宝R16 优势**：RTX 5060 **有 CUDA** → faster-whisper 直接可用，无需替代方案！

**混合方案**：QAA v1.3.0 网关支持在线/离线双模式切换——在线用 DashScope `qwen-audio-3.0-realtime-flash`（阿里云，OpenAI Realtime 协议，中国可直连），离线用本地 faster-whisper + Ollama + Kokoro。

| 指标 | 优化前 | 已实现                                    |
| ---- | ------ | ----------------------------------------- |
| 预热 | 90s    | **~0s** 在线 / **~3s** 离线               |
| 成本 | 免费   | 在线 90天免费, 后 ~¥0.20/分 · 离线 **零** |

```
浏览器 → Vite(ws:true) → QAA(:3101)
  ├─ ☁️ DashScope (~0s)   └─ 自动回退
  └─ 🏠 本地 S2S (:8765)
       ├─ STT: faster-whisper CUDA (GPU, ~1s)
       ├─ LLM: Ollama CUDA (GPU, ~3-5s)
       └─ TTS: Kokoro (CPU, ~0s)
```

风险: LOW · 工作量: S · **每会话 provider 切换**是架构级能力

---

# 计划 007：QAA 语音钩子 → MeowCat 界面

**保留猫爪 UI，替换传输层** — 与硬件无关

| 旧组件                   | 新组件                  | 动作     |
| ------------------------ | ----------------------- | -------- |
| realtimeVoice.ts (221行) | QAA useRealtimeVoice.js | **替换** |
| s2s_proxy.py (233行)     | QAA 网关                | **替换** |
| 猫爪按钮+波形            | 保留                    | 不变     |

**协议差异**：QAA 用 `GatewayClientEvent` JSON 协议 vs 当前自定义二进制帧。需重写事件处理器，React 组件树不变。风险: MED · 工作量: L

---

# 计划 008：Qwen3-ASR + CUDA GPU STT（离线）

**已选定**：**Qwen3-ASR-0.6B** 作为离线 STT 模型（替代 faster-whisper）。
- Qwen 团队开源，支持 52 种语言，在开源 ASR 中达到 SOTA
- vLLM 部署，RTX 5060 dGPU 运行，~2.5GB 显存
- 流式/离线统一推理，0.6B 版本达到 2000 倍吞吐量（并发 128）
- **为何不用 1.7B**：8GB dGPU 需与 MoE 3B 活跃层共存，1.7B (5GB) + 3B (3GB) = 8GB 无余量；0.6B (2.5GB) + 3B (3GB) = 5.5GB，剩余 2.5GB ✅

| 组件   | 优化前  | 已实现        | 位置 |
| ------ | ------- | ------------- | ---- |
| STT    | CPU 60s | **GPU ~1s**   | dGPU |
| TTS    | CPU 30s | **~0s** 预热  | CPU  |
| 总预热 | **90s** | **~3s** 或 0s | —    |

**显存**：Qwen3-ASR-0.6B ~2.5GB + MoE 活跃层 3B ~3GB = 5.5GB，剩余 2.5GB。风险: **LOW** · 工作量: **S** (`pip install vllm` + 模型下载)

**对比灵创K16**：K16 用 Qwen3-ASR-1.7B（96GB 充裕）；R16 用 Qwen3-ASR-0.6B（8GB dGPU 适配）

---

# Qwen3 开源语音模型（已选定）

**已确认模型选型**——Qwen3-ASR-0.6B 替代 faster-whisper，Kokoro 保留

| 模型               | 大小          | 用途                    | R16 选用 | 来源        |
| ------------------ | ------------- | ----------------------- | -------- | ----------- |
| Qwen3-ASR-1.7B     | ~4.7GB (BF16) | STT（52 语言 SOTA）     | ❌ 太大(8GB dGPU) | HuggingFace |
| **Qwen3-ASR-0.6B** | ~1.9GB (BF16) | STT（轻量）             | ✅ **已选** | HuggingFace |
| Qwen3-TTS-0.6B     | ~1.9GB        | TTS（轻量）             | 未来升级 | HuggingFace |
| Qwen3-Omni-30B-A3B | ~60GB (BF16)  | 全栈 S2S（端到端）      | ❌ 不可行(需15GB+) | HuggingFace |

**vLLM 集成**：`vllm serve Qwen/Qwen3-ASR-0.6B` → QAA 网关指向新 STT 端点。

**离线管道**：QAA (:3101) → Qwen3-ASR-0.6B (dGPU) → Hermes (:8642) → Ollama (dGPU+RAM) → Kokoro (CPU)

---

# 计划 009+010：ACP 垫片 → Hermes → Ollama 本地

**009**：ACP 垫片解耦语音前端与 Hermes 代理 OS。简单问题即时回答；工具调用 `spawn_thinking` 后台异步执行，完成后播报。

**010**：Ollama + CUDA (RTX 5060) 本地 GPU 推理。

| 指标 | Hermes Docker | Ollama 本地 (CUDA) |
| ---- | ------------- | ------------------ |
| 推理 | 远程 API      | **GPU (CUDA)**     |
| 延迟 | ~1.8ms        | **~0.3ms**         |
| 成本 | API 费用      | **零**             |

**模型策略**：Qwen3.6-35B-A3B (MoE, 仅 3B 激活) — 与灵创K16 同模型架构

- 活跃层 (3B) 驻留 8GB dGPU GDDR7
- 256 专家分布 dGPU + iGPU 890M + 系统 RAM（IQ3_XXS ~13GB 或 Q4_K_M ~22GB）
- iGPU 890M 通过 32GB 统一内存辅助 MoE 专家推理
- NPU XDNA 2 (~50 TOPS) 承担辅助推理/未来 STT 卸载
- 预填充后：dGPU 跑活跃层+STT，iGPU+NPU 跑专家/辅助，CPU 跑 TTS+网关

风险: MED · 工作量: M

---

# HX470+5060 四引擎混合 offload 优化栈

| 组件              | 引擎                | 位置                   | 预热     | 计划    |
| ----------------- | ------------------- | ---------------------- | -------- | ------- |
| LLM (35B-A3B MoE) | Ollama+CUDA         | **dGPU** 8GB+RAM+iGPU  | ~3-5s    | 010     |
| STT (Qwen3-ASR-0.6B) | vLLM+CUDA       | **dGPU**               | **~1s**  | 008     |
| TTS (Kokoro)      | Kokoro-82M          | **CPU**                | ~0s      | 008     |
| VAD (Silero)      | Silero              | **CPU**                | ~0s      | 现有    |
| 语音网关          | QAA (Node.js)       | **CPU**                | ~2s      | 006     |
| 代理 OS           | Hermes/Ollama       | **CPU+dGPU**           | 已运行   | 009/010 |
| MoE 专家 offload  | iGPU 890M+RAM       | **iGPU** 32GB 统一内存 | 已预填充 | 010     |
| 辅助推理          | NPU XDNA 2          | **NPU** ~50 TOPS       | 已就绪   | 010     |
| 前端              | React+Vite          | **浏览器**             | 即时     | 007     |

**显存预算**：8GB GDDR7 = MoE 活跃层 3B (~3GB) + Qwen3-ASR-0.6B (~2.5GB) = 5.5GB，剩余 2.5GB。
**统一内存**：32GB = MoE 专家层 (IQ3_XXS ~13GB) + 系统开销。预填充后 iGPU 890M + NPU 均活跃。

---

# 依赖关系与执行顺序

```
006 (QAA) ──→ 007 (语音钩子) ←── 008 (faster-whisper CUDA)
006 ──→ 009 (ACP 垫片) ──→ 010 (Ollama LLM CUDA)
006b (混合接线) ──→ 007
```

| 阶段 | 计划       | 说明                     |
| ---- | ---------- | ------------------------ |
| 1    | 006 + 008  | 并行 (008 = pip install) |
| 2    | 006b + 007 | 依赖 006                 |
| 3    | 009        | 依赖 006                 |
| 4    | 010        | 依赖 009                 |

**对比灵创K16**：橘宝R16 用 Qwen3-ASR-0.6B（8GB dGPU 适配）；K16 用 1.7B（96GB 充裕）。计划 010 使用同一 35B-A3B MoE 模型，但 IQ3 量化 + GPU/RAM 混合 offload。

---

# 已实现效果

| 指标       | 优化前   | 已实现                       |
| ---------- | -------- | ---------------------------- |
| 语音预热   | **90s**  | **~0s** 在线 / ~3s 离线      |
| LLM 推理   | 远程 API | **本地 GPU (CUDA, 8GB+RAM)** |
| STT 推理   | CPU 60s  | **GPU Qwen3-ASR ~1s**         |
| 云端依赖   | 必须     | **可选** (混合)              |
| 成本       | API 费用 | **在线付费 / 离线零**        |
| GPU 利用率 | **0%**   | **四引擎全活跃**             |
| 代理能力   | 无       | **Hermes OS**                |

**agent-meow 在橘宝R16**：四引擎协同的混合部署 AI 语音代理。在线模式 QAA + DashScope 即时响应，离线模式 Qwen3-ASR-0.6B (dGPU vLLM) → Hermes (:8642) → Ollama qwen3.6:35b-a3b IQ3_XXS (dGPU+RAM CUDA) → Kokoro (CPU)。iGPU 890M 辅助 MoE 专家，NPU XDNA 2 辅助推理。预填充后所有引擎活跃，混合部署，零外部 GPU。**实现难度低于灵创K16**（CUDA 原生 vs ROCm）。

---

# 双平台部署与交付策略

**目标**：agent-meow 同时交付灵创K16 (395) 和橘宝R16 (HX470+5060) 两台 AIPC

| 维度 | 灵创K16 (395) | 橘宝R16 (HX470+5060) |
| ---- | ------------ | -------------------- |
| STT 模型 | Qwen3-ASR-1.7B (~5GB) | Qwen3-ASR-0.6B (~2.5GB) |
| LLM 模型 | qwen3.6:35b-a3b-q8_0 (38GB) | qwen3.6:35b-a3b IQ3_XXS (~13GB) |
| GPU 后端 | ROCm 7.1 (HIP) | CUDA (RTX 5060) |
| VRAM | 96GB iGPU | 8GB dGPU + 32GB 统一内存 |
| 配置差异 | `HIP_VISIBLE_DEVICES=0` | `CUDA_VISIBLE_DEVICES=0` |

**交付方案**（研究阶段）：
1. **统一安装包** — agent-meow 核心 + 平台检测脚本自动选择模型配置
2. **平台 profile** — `profiles/k16-strix-halo.yaml` vs `profiles/r16-hx470-5060.yaml`
3. **模型预下载** — 安装时按 profile 下载对应 STT/LLM 模型
4. **启动脚本** — `start-voice-stack.ps1` 读取 profile 自动配置 QAA + Hermes + Ollama
5. **实施顺序**：先在此 395 开发机上实现 K16 profile，验证后打包 HX470 profile
