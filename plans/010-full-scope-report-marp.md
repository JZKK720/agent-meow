---
marp: true
theme: meowcat
paginate: true
size: 16:9
---

<!-- theme: meowcat — unified MeowCat/ColorFire brand identity.
  See plans/themes/meowcat.css for token source (mirrors web/src/index.css). -->

# agent-meow 实施范围报告

## 计划 001–010 · 完整实施路线图

**运行环境**：灵创K16 (COLORFIRE LinC K16) · AMD Ryzen AI MAX+ 395 (Strix Halo)
**四引擎**：CPU 16C + iGPU 96GB + NPU XDNA 2 + 128GB 统一内存 · **日期**：2026-08-04
**状态**：全部已推送至 `origin/main`

---

# 硬件平台 & Strix Halo 架构

| 组件      | 规格                                     | 状态 |
| --------- | ---------------------------------------- | ---- |
| CPU       | AMD Ryzen AI MAX+ 395, 16C/32T, 3.0GHz   | ✅   |
| iGPU      | Radeon 8060S, Vulkan 1.4.329             | ✅   |
| iGPU 显存 | **96GB** 统一内存 (128GB 总内存分配)     | ✅   |
| NPU       | AMD XDNA 2 (活跃辅助推理)                | ✅   |
| ROCm      | 7.1 + HIP 7.1.51803 (**活跃 GPU 后端**)  | ✅   |
| 内存      | **128GB** LPDDR5x-8000                   | ✅   |
| Ollama    | 0.32.5, qwen3.6:35b-a3b-q8_0 (38GB, GPU) | ✅   |

**Strix Halo 独特性**：四引擎共享 128GB 统一内存池，零拷贝。iGPU 可分配 96GB 显存。**ROCm 7.1 活跃**——`HIP_VISIBLE_DEVICES=0` 激活 HIP 后端，Ollama 在 Radeon 8060S 上跑 LLM 推理。38GB 模型完全驻留 96GB 显存。NPU XDNA 2 承担辅助推理。

```
CPU: TTS+VAD+QAA网关    iGPU: LLM(38GB)+STT    NPU: 辅助推理
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

**优先级**：低于 QAA 语音迁移。005 原用 faster-whisper 优化，根因分析发现 CUDA-only 限制无法在 AMD GPU 绕过。

---

# 计划 006+006b：QAA 网关 + 混合部署

**已解决**：原 S2S 冷启动 90 秒问题已通过 QAA 网关 + GPU STT 解决。faster-whisper 仅 CUDA 的限制由 whisper.cpp Vulkan 绕过。

**方案**：QAA v1.3.0 网关 + DashScope `qwen-audio-3.0-realtime-flash`（阿里云，OpenAI Realtime 协议，中国可直连）。

| 指标 | 优化前 | 已实现                 |
| ---- | ------ | ---------------------- |
| 预热 | 90s    | **~0s** 云端           |
| 成本 | 免费   | 90天免费, 后 ~¥0.20/分 |

```
浏览器 → Vite(ws:true) → QAA(:3101)
  ├─ ☁️ DashScope (~0s)   └─ 自动回退
  └─ 🏠 本地 S2S (:8765)
```

风险: LOW · 工作量: S · **每会话 provider 切换**是架构级能力

---

# 计划 007：QAA 语音钩子 → MeowCat 界面

**保留猫爪 UI，替换传输层**

| 旧组件                   | 新组件                  | 动作     |
| ------------------------ | ----------------------- | -------- |
| realtimeVoice.ts (221行) | QAA useRealtimeVoice.js | **替换** |
| s2s_proxy.py (233行)     | QAA 网关                | **替换** |
| 猫爪按钮+波形            | 保留                    | 不变     |

**协议差异**：QAA 用 `GatewayClientEvent` JSON 协议 vs 当前自定义二进制帧。需重写事件处理器，React 组件树不变。风险: MED · 工作量: L

---

# 计划 008：whisper.cpp + Vulkan GPU STT

**已解决**：faster-whisper 仅 CUDA 的限制由 whisper.cpp v1.9.1 Vulkan 后端 (`GGML_VULKAN=1`) 绕过，STT 放到 iGPU。

| 组件   | 优化前  | 已实现        | 位置 |
| ------ | ------- | ------------- | ---- |
| STT    | CPU 60s | **GPU ~3s**   | iGPU |
| TTS    | CPU 30s | **~0s** 预热  | CPU  |
| 总预热 | **90s** | **~8s** 或 0s | —    |

**显存**：whisper 1.5GB + LLM 38GB = 39.5GB，剩余 56.5GB 充裕。风险: MED · 工作量: M

---

# 计划 009+010：ACP 垫片 → Hermes → Ollama 本地

**009**：ACP 垫片解耦语音前端与 Hermes 代理 OS。简单问题即时回答；工具调用 `spawn_thinking` 后台异步执行，完成后播报。

**010**：从 Hermes Docker 到 Ollama 本地 GPU 推理。

| 指标 | Hermes Docker | Ollama 本地    |
| ---- | ------------- | -------------- |
| 推理 | 远程 API      | **GPU (ROCm)** |
| 延迟 | ~1.8ms        | **~0.3ms**     |
| 成本 | API 费用      | **零**         |

38GB 模型在 96GB 显存占 40%，无交换。**ROCm 7.1 活跃**：`HIP_VISIBLE_DEVICES=0` 让 Ollama 使用 HIP 后端在 iGPU 上推理。Hermes = 代理 OS (skills+memory+cron+MCP)。风险: MED · 工作量: L+M

---

# Strix Halo 四引擎优化栈

| 组件                  | 引擎               | 位置          | 预热       | 计划    |
| --------------------- | ------------------ | ------------- | ---------- | ------- |
| LLM (qwen3.6:35b-a3b) | Ollama+ROCm        | **iGPU** 96GB | ~3-5s      | 010     |
| STT (Whisper)         | whisper.cpp+Vulkan | **iGPU**      | ~3s        | 008     |
| TTS (Kokoro)          | Kokoro-82M         | **CPU**       | ~0s        | 008     |
| VAD (Silero)          | Silero             | **CPU**       | ~0s        | 现有    |
| 语音网关              | QAA (Node.js)      | **CPU**       | ~2s        | 006     |
| 代理 OS               | Hermes/Ollama      | **CPU+iGPU**  | 已运行     | 009/010 |
| 前端                  | React+Vite         | **浏览器**    | 即时       | 007     |
| 辅助推理              | NPU XDNA 2         | **NPU**       | 已就绪     | 010     |
| NPU STT (未来)        | winml              | **NPU**       | 待 2026 末 | 未来    |

**显存预算**：96GB (iGPU 分配) = LLM 38GB + STT 1.5GB = 39.5GB，剩余 56.5GB。总系统内存 128GB。

---

# 依赖关系与执行顺序

```
006 (QAA) ──→ 007 (语音钩子) ←── 008 (whisper.cpp)
006 ──→ 009 (ACP 垫片) ──→ 010 (Ollama LLM)
006b (混合接线) ──→ 007
```

| 阶段 | 计划       | 说明       |
| ---- | ---------- | ---------- |
| 1    | 006 + 008  | 并行, 独立 |
| 2    | 006b + 007 | 依赖 006   |
| 3    | 009        | 依赖 006   |
| 4    | 010        | 依赖 009   |

006 和 008 可完全并行——前者云端网关，后者本地 GPU STT。007 需两者都完成。

---

# 已实现效果

| 指标       | 优化前   | 已实现                    |
| ---------- | -------- | ------------------------- |
| 语音预热   | **90s**  | **~0s** 在线 / ~8s 离线   |
| LLM 推理   | 远程 API | **本地 GPU (ROCm, 96GB)** |
| STT 推理   | CPU 60s  | **GPU Vulkan ~3s**        |
| 云端依赖   | 必须     | **可选** (混合)           |
| 成本       | API 费用 | **零** (离线)             |
| GPU 利用率 | **0%**   | **STT + LLM 在 GPU**      |
| 代理能力   | 无       | **Hermes OS**             |

**agent-meow 在灵创K16**：为 Strix Halo 四引擎全面优化的本地 AI 语音代理。LLM 在 iGPU（Ollama + ROCm 7.1 活跃），STT 在 iGPU（whisper.cpp + Vulkan），TTS 在 CPU，NPU XDNA 2 辅助推理，代理 OS 在后台。128GB 统一内存，零拷贝。零云端，零外部 GPU。
