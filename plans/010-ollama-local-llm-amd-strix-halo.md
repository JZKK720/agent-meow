# 计划 010：本地 Ollama LLM（meow36b / qwen3.6:35b-a3b）替代 Hermes Docker

> **执行者须知**：本计划扩展项目开发范围，将 agent-meow 的 LLM 后端从
> Hermes Docker 切换到本地 Ollama 运行的 qwen3.6:35b-a3b 模型，利用 AMD
> Strix Halo 的统一内存和 GPU 加速，实现完全自包含的本地 AI 栈。

## 状态

- **优先级**：P2
- **工作量**：M
- **风险**：MED
- **依赖**：006b（混合部署接线，了解 agent-meow 如何连接 LLM 后端）
- **编写于**：提交 `a0ed3a86`，2026-08-04

## 问题

当前 agent-meow 依赖 Hermes Docker（:8642）作为 LLM 后端。Docker 容器
占用 ~1-2GB RAM，需要 Docker Desktop 运行，增加了启动延迟和系统复杂度。
而本机已有：

- **Ollama 0.32.5** 已安装
- **meow36b:latest**（38GB）和 **qwen3.6:35b-a3b-q8_0**（38GB）模型已拉取
- **AMD ROCm 7.1** + **HIP 7.1.51803** 已安装
- **AMD Radeon 8060S** 集成显卡（Vulkan 1.4.329）

Strix Halo 的统一内存架构允许 iGPU (Radeon 8060S) 直接访问高达
**96GB** 显存（通过 AMD 驱动 `qwMemorySize = 103079215104` 确认），
远超系统物理 32GB RAM 的限制。Ollama 利用 ROCm 将 LLM 推理放到
GPU 上运行，38GB 的 qwen3.6:35b 模型完全放入 96GB iGPU 显存。

## 为什么 agent-meow 在 AMD Strix Halo 上独特

| 特性      | 普通 PC             | AMD Strix Halo (Ryzen AI MAX+ 395)           |
| --------- | ------------------- | -------------------------------------------- |
| CPU       | 普通 x86            | 16 核 Zen5/Zen5c，32 线程                    |
| GPU       | 独立显卡或无        | Radeon 8060S 集成显卡（Vulkan + ROCm）       |
| NPU       | 无                  | XDNA 2 NPU（AI 加速器）                      |
| 内存架构  | 独立显存 + 系统内存 | **统一内存**——iGPU 可访问 **96GB** 显存      |
| LLM 推理  | 需要独立 GPU + CUDA | **本地 Ollama + ROCm**，无需独立 GPU         |
| STT/TTS   | CPU 推理（慢）      | **whisper.cpp Vulkan**（GPU 加速，Plan 008） |
| 端到端 AI | 需要多个独立组件    | **CPU + GPU + NPU 统一 SoC**                 |

agent-meow 在 Strix Halo 上的独特价值：**完全本地、零云端依赖、零延迟
预热的端到端 AI 语音代理**——LLM 在 GPU 上跑（Ollama），STT 在 GPU 上跑
（whisper.cpp Vulkan），TTS 在 CPU 上跑（Kokoro），所有组件共享统一内存，
无需任何外部 API 密钥或网络连接。

## 目标

将 agent-meow 的 LLM 后端从 Hermes Docker 切换到本地 Ollama，使整个
AI 栈（LLM + STT + TTS + 语音代理）完全自包含在本机上。

## 范围

| 范围内                                                    | 范围外                       |
| --------------------------------------------------------- | ---------------------------- |
| 创建 `examples/ollama-llm/config.yaml`（新 agent 配置）   | 修改 Ollama 本身             |
| `scripts/start-ollama-llm.ps1`（创建）                    | 修改 whisper.cpp（Plan 008） |
| `scripts/start-voice-stack.ps1`（修改，支持 Ollama 模式） | 修改 QAA（Plan 007）         |
| ACP shim 后端 URL 可指向 Ollama（Plan 009 扩展）          | 修改 agent-meow 核心代码     |

## 架构对比

### 当前（Hermes Docker）

```
浏览器 → QAA 网关 → S2S → Hermes Docker (:8642, Linux 容器)
                              ↓
                         远程 LLM API (OpenAI/DashScope)
```

- Docker Desktop 占用 ~1-2GB RAM
- Hermes 容器需要 Linux VM 运行
- LLM 推理可能走云端 API（如果 Hermes 配置了远程模型）

### 目标（Ollama 本地）

```
浏览器 → QAA 网关 → S2S → Ollama (:11434, 本地进程)
                              ↓
                         qwen3.6:35b-a3b 在 AMD GPU 上推理
                         (iGPU 显存 96GB, ROCm 加速)
```

- 无 Docker，无 Linux VM
- LLM 在本地 GPU 上推理（ROCm 加速）
- 零网络延迟（localhost）
- 零 API 成本（完全本地）
- qwen3.6 支持 agentic coding + thinking preservation

## 步骤

### 第 1 步：确认 Ollama 在 AMD GPU 上运行

```powershell
# 检查 Ollama 是否使用 GPU：
ollama ps
# 查看正在运行的模型和 GPU/CPU 分配

# 测试推理速度：
ollama run qwen3.6:35b-a3b-q8_0 "你好，请用中文回答：1+1等于几"
# 记录 tokens/s 速度
```

如果 Ollama 没有使用 GPU（显示 CPU only），设置环境变量：

```powershell
$env:HIP_VISIBLE_DEVICES = "0"
# 或对于 Strix Halo 统一内存：
$env:OLLAMA_GPU_OVERHEAD = "0"
ollama serve  # 重启 Ollama
```

**验证**：`ollama ps` 显示 GPU 分配。推理速度 >10 tokens/s（35b 模型在
GPU 上）。

### 第 2 步：创建 Ollama LLM agent 配置

创建 `examples/ollama-llm/config.yaml`：

```yaml
spec_version: 1
name: ollama-local
description: >-
  使用本地 Ollama 运行的 qwen3.6:35b-a3b 模型作为 LLM 后端。
  无需 Docker，无需云端 API，完全本地推理。
  Ollama 提供 OpenAI 兼容 API (http://127.0.0.1:11434/v1)。

executor:
  type: agent-meow
  config:
    harness: openai-agents
  model: qwen3.6:35b-a3b-q8_0
  auth:
    type: api_key
    api_key: ollama # Ollama 不验证密钥，任意值即可
    base_url: http://127.0.0.1:11434/v1

prompt: |
  你是 agent-meow 的 AI 助手，运行在本地 AMD Strix Halo 处理器上。
  你可以通过工具调用执行代码、操作文件、访问 MCP 服务器。
  请用用户使用的语言回答。
```

**验证**：`OMNIGENT_BUILTIN_AGENT_DIRS` 环境变量包含 `examples/ollama-llm`
路径，或通过 agent-meow 的 agent 注册机制加载此配置。

### 第 3 步：创建 Ollama 启动脚本

创建 `scripts/start-ollama-llm.ps1`：

```powershell
# 启动本地 Ollama LLM 服务（qwen3.6:35b-a3b 模型）。
# Ollama 使用 AMD ROCm 在 GPU 上运行推理。
# 用法：.\scripts\start-ollama-llm.ps1
$ErrorActionPreference = "Stop"

# 确保 Ollama 使用 GPU
$env:HIP_VISIBLE_DEVICES = "0"

# 检查 Ollama 是否已在运行
$ollamaRunning = Get-Process ollama -ErrorAction SilentlyContinue
if (-not $ollamaRunning) {
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "Ollama 服务已启动" -ForegroundColor Green
} else {
    Write-Host "Ollama 已在运行" -ForegroundColor Gray
}

# 预加载模型到 GPU（避免首次请求延迟）
Write-Host "预加载 qwen3.6:35b-a3b 模型到 GPU..." -ForegroundColor Cyan
ollama run qwen3.6:35b-a3b-q8_0 "" --keepalive 30m 2>$null
Write-Host "Ollama LLM 就绪：http://127.0.0.1:11434/v1" -ForegroundColor Cyan
Write-Host "模型：qwen3.6:35b-a3b-q8_0 (38GB, AMD GPU + 统一内存)" -ForegroundColor Gray
```

**验证**：运行脚本后 `curl http://127.0.0.1:11434/v1/models` 返回
模型列表包含 `qwen3.6:35b-a3b-q8_0`。

### 第 4 步：更新启动脚本支持 Ollama 模式

修改 `scripts/start-voice-stack.ps1`，添加 Ollama 作为 LLM 后端选项：

```powershell
param(
    [string]$LLMBackend = "ollama",  # "ollama" | "hermes" | "dashscope"
    [string]$VoiceMode = "online"    # "online" | "offline"
)

# ... 根据 $LLMBackend 启动对应的 LLM 后端 ...
if ($LLMBackend -eq "ollama") {
    .\scripts\start-ollama-llm.ps1
} elseif ($LLMBackend -eq "hermes") {
    # 保持 Hermes Docker 不变
}
```

**验证**：`.\scripts\start-voice-stack.ps1 -LLMBackend ollama` 启动
Ollama + QAA + Vite，不启动 Docker。

### 第 5 步：ACP shim 后端 URL 可指向 Ollama（Plan 009 扩展）

Plan 009 的 ACP shim 将 `spawn_thinking` 转发到 Hermes API
（`http://127.0.0.1:8642/v1`）。只需将 `base_url` 改为
`http://127.0.0.1:11434/v1` 即可指向 Ollama。

QAA 配置：

```dotenv
AGENT_PROTOCOL=acp
QWEN_AUDIO_AGENT_BACKEND_URL=ws://127.0.0.1:<agent-meow端口>/acp/realtime
```

ACP shim 内部：

```python
# 可配置的 LLM 后端 URL：
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "http://127.0.0.1:11434/v1")
# Ollama: http://127.0.0.1:11434/v1 (model: qwen3.6:35b-a3b-q8_0)
# Hermes: http://127.0.0.1:8642/v1 (model: hermes-agent)
```

**验证**：QAA 后端健康检查显示 `backend.ok: true`，后端连接到 Ollama。

### 第 6 步：端到端冒烟测试

1. 启动 Ollama：`.\scripts\start-ollama-llm.ps1`
2. 启动 QAA 网关：`.\scripts\start-qaa-gateway.ps1`
3. 启动 Vite：`cd web; npm run dev`
4. 打开浏览器，点击猫爪麦克风
5. 说："请帮我写一个 Python 函数计算斐波那契数列"
6. 验证：
   - 简单问题由 DashScope 实时回答（在线模式）或本地 S2S 回答（离线模式）
   - 工具调用由 Ollama 本地 LLM 处理（通过 ACP shim）
   - 响应中包含代码
   - 无 Docker 运行，无外部 API 调用（除 DashScope 语音）

**验证**：完整端到端语音 + 工具调用在本地完成（LLM 在 Ollama GPU 上）。

## AMD Strix Halo 优化总结

agent-meow 在 Strix Halo 上的完整优化栈：

```
┌─────────────────────────────────────────────────┐
│         AMD Ryzen AI MAX+ 395 (Strix Halo)       │
│         16C/32T · 32GB RAM · iGPU 96GB 显存         │
│                                                   │
│  ┌─────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ GPU     │  │ NPU       │  │ CPU (16核)     │  │
│  │ Radeon  │  │ XDNA 2    │  │               │  │
│  │ 8060S   │  │           │  │               │  │
│  │         │  │           │  │               │  │
│  │ Ollama  │  │ (未来:    │  │ Kokoro TTS    │  │
│  │ qwen3.6 │  │  NPU STT  │  │ (语音合成)    │  │
│  │ 35b LLM │  │  待2026末)│  │               │  │
│  │         │  │           │  │               │  │
│  │ whisper. │  │           │  │ VAD (Silero)  │  │
│  │ cpp STT │  │           │  │               │  │
│  │ (Vulkan)│  │           │  │               │  │
│  └─────────┘  └───────────┘  └───────────────┘  │
│                                                   │
│  iGPU 显存 96GB: LLM 38GB + STT + TTS 充裕      │
│  ROCm 7.1: GPU 计算后端                           │
│  Vulkan 1.4: 跨平台 GPU 加速                      │
└─────────────────────────────────────────────────┘
```

| 组件              | 运行位置      | 引擎        | 预热时间        |
| ----------------- | ------------- | ----------- | --------------- |
| LLM (qwen3.6:35b) | GPU (ROCm)    | Ollama      | ~5-10s 模型加载 |
| STT (Whisper)     | GPU (Vulkan)  | whisper.cpp | ~3s (Plan 008)  |
| TTS (Kokoro)      | CPU           | Kokoro-82M  | ~0s (预热)      |
| VAD               | CPU           | Silero      | ~0s             |
| 语音网关          | CPU (Node.js) | QAA         | ~2s             |
| 前端              | CPU (浏览器)  | React/Vite  | 即时            |

## 与 Hermes Docker 对比

| 指标     | Hermes Docker                | Ollama 本地                        |
| -------- | ---------------------------- | ---------------------------------- |
| 内存占用 | ~1-2GB (Linux VM)            | ~0 (原生进程)                      |
| 启动延迟 | ~5-10s (容器启动)            | ~3s (进程启动)                     |
| LLM 推理 | 远程 API 或容器内            | **GPU 本地推理**                   |
| 冷启动   | 依赖网络/容器                | **预加载到 GPU**                   |
| 模型     | hermes-agent (固定)          | **可切换** (qwen3.6, deepseek, 等) |
| 成本     | 云端 API 费用或容器资源      | **零成本** (本地)                  |
| 网络     | localhost:8642 (Docker 代理) | **localhost:11434** (直接)         |
| 延迟     | ~1.8ms (Docker 代理)         | **~0.3ms** (原生)                  |
| 隔离     | 强 (Linux 容器)              | 弱 (共享主机)                      |

## 验收标准

- [ ] `ollama ps` 显示 qwen3.6 模型在 GPU 上运行
- [ ] `curl http://127.0.0.1:11434/v1/models` 返回模型列表
- [ ] `examples/ollama-llm/config.yaml` 存在且格式正确
- [ ] `scripts/start-ollama-llm.ps1` 启动 Ollama 并预加载模型
- [ ] agent-meow 可通过 Ollama 后端执行 LLM 推理
- [ ] ACP shim 可配置指向 Ollama（`LLM_BASE_URL` 环境变量）
- [ ] 端到端冒烟测试通过（语音 + 工具调用，无 Docker）
- [ ] `plans/README.md` 状态行已更新

## 停止条件

- Ollama 未使用 GPU（`ollama ps` 显示 CPU only）——检查 ROCm 驱动和
  `HIP_VISIBLE_DEVICES` 环境变量。Strix Halo 统一内存可能需要特殊配置。
- qwen3.6:35b 模型推理速度 <5 tokens/s——38GB 模型在 96GB iGPU 显存中
  应该充裕。如果速度仍然慢，检查 Ollama 是否实际使用了 GPU（而非 CPU
  回退）。尝试更小的模型（qwen3.6:27b, 17GB）作为对比基准。
- agent-meow 的 `openai-agents` harness 不兼容 Ollama 的 OpenAI API——
  检查 Ollama 的 `/v1/chat/completions` 端点是否完全兼容。报告不兼容项。
- Hermes 的特定功能（skills, memory, cron）在 Ollama 后端不可用——
  这是预期的。Ollama 提供纯 LLM 推理，不含 agent 框架功能。
  如果需要这些功能，保留 Hermes 作为 agent 框架，仅将 LLM 模型切换
  为 Ollama 提供的模型。
