---
marp: true
theme: default
paginate: true
size: 16:9
---

<style>
section { font-size: 0.72em; }
h1 { font-size: 1.3em; }
h2 { font-size: 1.0em; }
h3 { font-size: 0.85em; }
table { font-size: 0.62em; width: 100%; }
th, td { padding: 3px 6px; line-height: 1.2; }
pre { font-size: 0.58em; line-height: 1.15; }
code { font-size: 0.62em; }
section p { font-size: 0.72em; line-height: 1.3; }
strong { font-size: 1em; }
</style>

# agent-meow 实施范围报告

## 计划 001–010 · 完整实施路线图

**运行环境**：Colorfire Meow Series R16 395 AI 笔记本
**芯片**：AMD Ryzen AI MAX+ 395 (Strix Halo) · CPU + NPU + iGPU 全栈优化

---

# 硬件平台 — Colorfire R16 395 AI

| 组件 | 规格 | 状态 |
|------|------|------|
| CPU | AMD Ryzen AI MAX+ 395, 16C/32T, 3.0GHz | ✅ |
| iGPU | AMD Radeon 8060S, Vulkan 1.4.329 | ✅ |
| iGPU 显存 | **96GB**（统一内存，驱动确认） | ✅ |
| NPU | AMD XDNA 2 (PCI 已识别) | ✅ |
| 内存 | 32GB DDR5 | ✅ |
| ROCm | 7.1 + HIP 7.1.51803 | ✅ |
| Ollama | 0.32.5, meow36b + qwen3.6:35b-a3b (38GB) | ✅ |
| 品牌 | COLORFIRE LinC K16 (喵星系列) | BIOS 确认 |

---

# 为什么 Strix Halo 让 agent-meow 独特

**普通 PC**：CPU 计算 + GPU 图形 + 无 NPU
**Strix Halo**：CPU + iGPU(96GB) + NPU 三引擎并行，统一内存池

```
Colorfire R16 · Strix Halo · iGPU 96GB 显存

CPU (16核)              iGPU (8060S)
├─ Kokoro TTS           ├─ Ollama qwen3.6 LLM (38GB)
├─ VAD Silero           └─ whisper.cpp STT (Vulkan)
├─ QAA 网关
└─ Vite 前端             NPU (XDNA 2)
                         └─ 未来: NPU STT (待 2026 末)
```

**独特价值**：唯一为 Strix Halo 三引擎优化的本地 AI 语音代理。
LLM 在 GPU、STT 在 GPU、TTS 在 CPU、NPU 留给未来。零云端，零外部 GPU。

---

# 计划 001–005：基础设施修复

| # | 计划 | 状态 | 内容 |
|---|------|------|------|
| 001 | 修复 db_models 路径 | TODO | 路径精确化 |
| 002 | 同步 VIDEOS_SURFACE.md | TODO | 2 项过时声明 |
| 003 | Phase 4 runner 调度 | TODO | 注册工具到 runner |
| 004 | 标记过时 voicebox 计划 | TODO | 清理废弃计划 |
| 005 | Voicebox 引擎可靠性 | DRAFT | 预 QAA 方案 |

优先级低于 QAA 语音迁移。

---

# 计划 006：QAA 网关 + DashScope 云端

**在线语音模式 · 解决 90 秒预热**

安装 QAA 作为语音网关，配置 DashScope `qwen-audio-3.0-realtime-flash`。

| 指标 | 当前 | 优化后 |
|------|------|--------|
| 预热 | 90 秒 | **~0 秒**（云端常驻） |
| 中文 | ✅ | ✅（原生） |
| 成本 | 免费 | 90 天免费, 后 ~¥0.20/分 |
| 网络 | 无 | 需要互联网 |

步骤: DashScope 密钥 → 安装 QAA → 配置 → 冒烟测试
风险: LOW · 工作量: S

---

# 计划 006b：在线/离线混合部署接线

**浏览器 → QAA → DashScope/S2S 完整连接**

```
浏览器 (:5173)
 → Vite 代理 (/api→:3101, ws:true)
   → QAA 网关 (:3101)
     ├─ ☁️ 在线 → DashScope 云端 (~0s)
     ├─ 🏠 离线 → 本地 S2S (:8765)
     └─ 工具 → Hermes/Ollama 后端
```

关键: Vite `ws: true` 启用 WebSocket 代理
自动回退: DashScope 不可用时切离线

---

# 计划 007：移植 QAA 语音钩子到 MeowCat 界面

**保留猫爪 UI, 替换底层传输**

| 旧组件 | 新组件 | 动作 |
|--------|--------|------|
| realtimeVoice.ts | QAA useRealtimeVoice.js | **替换** |
| s2s_proxy.py | QAA 网关 | **替换** |
| 猫爪按钮+波形 | 保留 | 不变 |
| 在线/离线切换 | 新增 | ☁️/🏠 |

协议差异: QAA 使用 GatewayClientEvent 协议, 需重写事件处理器
风险: MED · 工作量: L

---

# 计划 008：whisper.cpp + Vulkan GPU 加速 STT

**离线预热优化 · GPU 从闲置到全速**

根因: faster-whisper 只支持 CUDA, AMD GPU **96GB 显存闲置**, STT 在 CPU 跑 60 秒。
方案: whisper.cpp 支持 Vulkan (`GGML_VULKAN=1`), 将 STT 放到 Radeon 8060S。

| 组件 | 当前 | 优化后 | 位置 |
|------|------|--------|------|
| STT | CPU 60s | **GPU ~3s** | iGPU |
| TTS | CPU 30s | **~0s** 预热 | CPU |
| 总预热 | **90s** | **~8s** 或 0s | — |

96GB iGPU 显存同时容纳 whisper + Ollama LLM。风险: MED · 工作量: M

---

# 计划 009：ACP 垫片 → Hermes 代理 OS

**非阻塞工具调用语音 (Path B)**

```
用户说话 → QAA 实时前端 → 简单问题即时回答
         → spawn_thinking → ACP 垫片 → Hermes
           → 工具调用(代码/文件/MCP) → 完成后语音播报
```

**Hermes = 代理 OS**: skills + memory + cron + terminal + MCP 集成。
ACP 垫片让语音成为 Hermes 的一等交互界面。风险: MED · 工作量: L

---

# 计划 010：本地 Ollama LLM · Strix Halo 全栈

**从 Hermes Docker 到完全本地 GPU 推理**

| 指标 | Hermes Docker | Ollama 本地 |
|------|-------------|-------------|
| 内存 | ~1-2GB (VM) | ~0 (原生) |
| 启动 | ~5-10s | ~3s |
| 推理 | 远程 API | **GPU (ROCm)** |
| 延迟 | ~1.8ms | **~0.3ms** |
| 成本 | API 费用 | **零** |

38GB 模型在 96GB iGPU 显存中: 充裕, 无交换。风险: MED · 工作量: M

---

# 完整 Strix Halo 优化栈

## CPU + iGPU + NPU 三引擎分工

| 组件 | 引擎 | 位置 | 预热 | 计划 |
|------|------|------|------|------|
| LLM (qwen3.6:35b) | Ollama+ROCm | **iGPU** 96GB | ~3-5s | 010 |
| STT (Whisper) | whisper.cpp+Vulkan | **iGPU** | ~3s | 008 |
| TTS (Kokoro) | Kokoro-82M | **CPU** | ~0s | 008 |
| VAD (Silero) | Silero | **CPU** | ~0s | 现有 |
| 语音网关 | QAA (Node.js) | **CPU** | ~2s | 006 |
| 代理 OS | Hermes/Ollama | **CPU+iGPU** | 已运行 | 009/010 |
| 前端 | React+Vite | **浏览器** | 即时 | 007 |
| NPU STT | 未来 (winml) | **NPU** | 待 2026 末 | 未来 |

iGPU 96GB: LLM 38GB + STT 1.5GB = 39.5GB, 剩余 56.5GB 充裕

---

# 依赖关系与执行顺序

```
006 (QAA+DashScope) ──→ 007 (移植语音钩子)
006 ──→ 009 (ACP 垫片)
008 (whisper.cpp)  ──→ 007 (并行, 独立)
009 ──→ 010 (Ollama LLM)
006b (混合接线)   ──→ 007
```

| 阶段 | 计划 | 说明 |
|------|------|------|
| 1 | 006 + 008 | 并行, 独立 |
| 2 | 006b + 007 | 依赖 006 |
| 3 | 009 | 依赖 006 |
| 4 | 010 | 依赖 009 |

---

# 预期最终效果

| 指标 | 当前 | 最终目标 |
|------|------|---------|
| 语音预热 | **90s** | **~0s** 在线 / ~8s 离线 |
| LLM 推理 | 远程 API | **本地 GPU (ROCm, 96GB)** |
| STT 推理 | CPU 60s | **GPU Vulkan ~3s** |
| TTS 预热 | 30s | **~0s** (预热) |
| 云端依赖 | 必须 | **可选** (混合) |
| 成本 | API 费用 | **零** (离线) |
| GPU 利用率 | **0%** | **STT + LLM 在 GPU** |
| NPU 利用率 | **0%** | 未来 STT |
| Docker | 必须 | **可选** (Ollama) |
| 代理能力 | 无 | **Hermes OS (代码/文件/MCP)** |

**agent-meow 在 Colorfire R16 395 AI**: 唯一为 Strix Halo 三引擎
(CPU+iGPU+NPU) 全面优化的本地 AI 语音代理。LLM 在 GPU (Ollama+ROCm),
STT 在 GPU (whisper.cpp+Vulkan), TTS 在 CPU (Kokoro), 代理 OS 在后台
(Hermes), NPU 留给未来。全部共享 96GB 统一显存, 零云端, 零外部 GPU。