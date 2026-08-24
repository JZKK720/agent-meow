<div align="center">

# <img src="docs/assets/branding/favicon.png" alt="" height="38" valign="middle" /> agent-meow

### ColorFire 与 Meow 系列 AI PC 的 AI 智能体工作台

agent-meow 是由智方云（Cubecloud）开发的开源 **AI 智能体工作台**，专为
ColorFire 和 Meow 系列 AI PC 及笔记本设计。它提供本地优先的语音 + 文字智能体体验，
由你自己的 GPU 驱动 —— 基础功能无需云端 API 密钥。

基于 [Omnigent](https://github.com/omnigent-ai/omnigent)（Apache-2.0）构建，agent-meow 增加了
Windows 桌面安装器、首次运行设置向导、实时语音管线（STT → LLM → TTS）、
服务监控器，以及橘宝疾风（Jubao）品牌形象。

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-JZKK720%2Fagent--meow-181717?logo=github)](https://github.com/JZKK720/agent-meow)
![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)

**[⬇️ 下载 Windows 安装器](https://github.com/JZKK720/agent-meow/releases/tag/v0.7.0)**

</div>

<p align="center">
  <img src="docs/assets/branding/thumbnails/workspace-design-01.png" alt="agent-meow 桌面应用" width="720" />
</p>

---

## agent-meow 是什么？

agent-meow 提供：

- **🎤 实时语音对话。** 对你的 AI 助手实时说话 ——
  语音识别（whisper.cpp，Vulkan GPU）→ LLM（Hermes 网关或 Ollama）→
  语音合成（Qwen3-TTS，Vulkan GPU）。无需云端 STT/TTS API。
- **🖥️ 一键 Windows 安装器。** 下载、运行，首次运行向导自动检测你的 GPU，
  安装 Ollama + 本地 LLM、Hermes CLI 和语音栈 —— 无需终端、Python 或 Docker。
- **🐱 橘宝疾风品牌。** 一只活泼的橘猫 AI 助手，
  配有专属形象素材、表情包和品牌 UI。
- **🔧 本地优先。** 完全在你的机器上运行。你的模型（Ollama 或 Hermes），
  你的 GPU（AMD / NVIDIA / Intel），你的数据。
- **📊 运行状态仪表盘。** 在 设置 → 运行状态 中监控所有语音服务
  （whisper-server、Qwen3-TTS、Hermes 网关）。首次启动检查清单验证整个栈是否健康。
- **🛡️ 服务监控器。** 语音服务崩溃后自动重启。无需人工干预 —— 监控器自动监视并重启。
- **🤖 多引擎支持。** 使用 Claude Code、Codex、Cursor、OpenCode、
  Hermes、Pi 或自定义 YAML 智能体 —— 全部通过同一界面。
- **🌐 网页 + 桌面 + 手机。** 同一会话在 Electron 桌面应用、浏览器
  和你网络中的手机上同步。

---

## 快速开始

### Windows 桌面应用（推荐）

从 [发布页面](https://github.com/JZKK720/agent-meow/releases/tag/v0.7.0) 下载自包含安装器：

1. **下载** `agent-meow Setup 0.7.0.exe`（约 164 MB）
2. **运行** 安装器 —— 无需 Python、Docker 或终端
3. **首次运行向导** 引导你完成：
   - **GPU 检测** —— 自动识别 AMD / NVIDIA / Intel / CPU
   - **Ollama 安装** —— 静默安装 + 模型选择（Qwen 3.5、Nemotron、DeepSeek 等）
   - **Hermes CLI 安装** —— curl 安装（无需 Docker）
   - **语音栈** —— whisper.cpp（Vulkan STT）+ Qwen3-TTS（Vulkan TTS）
4. **开始聊天** —— 应用启动，一切已预配置完成

安装器包含：
- 内嵌 Python 3.12（便携版 CPython）
- agent-meow 核心（预装在内嵌 venv 中）
- 完整 React 网页 UI
- 首次运行引导向导
- 服务监控器（事件驱动的语音服务崩溃重启）
- 运行状态仪表盘（设置 → 运行状态）
- VAD WASM 多线程所需的 COOP/COEP 头
- 橘宝疾风品牌素材（吉祥物、图标、壁纸图案）

> [!NOTE]
> PyPI 包名为 `omnigent`（模块目录为 `agent_meow/`）。
> CLI 入口 `omnigent`、`omni` 和 `agent-meow` 可互换使用。

### Linux / macOS（CLI 安装）

agent-meow 需要 **Python 3.12+**：

```bash
uv tool install omnigent        # 或: pip install "omnigent"
```

或从仓库安装：

```bash
uv tool install -q --python 3.12 git+https://github.com/JZKK720/agent-meow.git
```

---

## 语音管线架构

agent-meow 内置完整的本地语音管线 —— STT 和 TTS 无需云端 API 调用：

```
🎤 麦克风
    ↓  Silero VAD（浏览器，WASM）
    ↓  PCM16 音频片段
    ↓
🔊 whisper.cpp（Vulkan iGPU，端口 8001）
    ↓  /inference → 文字转写
    ↓
🧠 Hermes 网关（端口 8642）或 Ollama（端口 11434）
    ↓  /v1/chat/completions → 流式文字回复
    ↓
🗣️ Qwen3-TTS（Vulkan dGPU，端口 8890）
    ↓  /tts → 音频片段
    ↓
🔊 浏览器音频播放（队列 + 句子级排序）
```

### 组件

| 组件 | 功能 | 端口 | GPU |
|------|------|------|-----|
| **whisper.cpp** | 语音转文字（Vulkan GPU） | 8001 | iGPU (8060S) |
| **Qwen3-TTS** | 文字转语音（Vulkan GPU） | 8890 | dGPU (7900 XTX) |
| **Hermes 网关** | LLM 推理（OpenAI 兼容） | 8642 | CPU（云端或本地） |
| **Ollama** | 备选本地 LLM | 11434 | GPU 或 CPU |
| **服务监控器** | 所有语音服务的崩溃重启 | — | — |

### 浏览器端语音传输

网页 UI 使用 `@ricky0123/vad-web` 通过 WASM 在浏览器中运行 Silero VAD（语音活动检测）。
音频以 Float32 → PCM16 → WAV 格式捕获，以 FormData 上传，
回复通过句子排序的音频队列播放，并采用子句级 TTS 分块以消除回复中途的停顿。

### Hermes 网关智能体

[`examples/hermes-gateway/config.yaml`](examples/hermes-gateway/config.yaml)
内置了一个预配置的 Hermes 智能体，带有橘宝（Jubao）人格 ——
一个双语（中文 + 英文）猫助手角色，具有 TTS 优化约束：
短句、口语化中文、简洁回复，语音回复中不含 emoji 或 markdown。

---

## 首次运行向导

Windows 安装器包含引导向导（`web/electron/src/wizard/`），在首次启动时运行：

| 步骤 | 功能 |
|------|------|
| **1. GPU 检测** | 通过 Windows WMI 检测 GPU 厂商（AMD / NVIDIA / Intel） |
| **2. 核心运行时** | 验证内嵌 Python，检测/安装 Hermes CLI |
| **3. Ollama** | 下载 + 静默安装 Ollama，拉取用户选择的模型 |
| **4. 语音栈** | 下载 whisper-server.exe + tts-server.exe（Vulkan），获取模型 |
| **5. 端口检查** | 验证所有服务可达（端口 8001、8890、8642、11434） |
| **6. 验证** | 最终健康检查 —— 全绿 = 可以聊天了 |

---

## 运行状态仪表盘

设置完成后，在网页 UI 的 **设置 → 运行状态** 中监控所有服务：

- whisper-server 健康（端口 8001）
- Qwen3-TTS 健康（端口 8890）
- Hermes 网关健康（端口 8642）
- Ollama 健康（端口 11434）

**首次启动检查清单** 在服务器首次启动时自动运行，
为语音栈中的每个服务显示绿色/红色状态卡片。

---

## 多引擎支持

agent-meow 支持与上游 Omnigent 相同的引擎：

```bash
agent-meow                    # 选择模型，开始会话
agent-meow claude             # Claude Code
agent-meow codex              # Codex
agent-meow cursor             # Cursor
agent-meow opencode           # OpenCode
agent-meow hermes             # Hermes Agent（Nous Research）
agent-meow pi                 # Pi
agent-meow run examples/hermes-gateway/   # 橘宝语音智能体
```

### 编写自己的智能体

智能体就是一个简短的 YAML 文件 —— 你的提示词、你的工具、你的子智能体：

```yaml
name: my_agent
prompt: 你是一个有用的数据分析师。

executor:
  harness: openai-agents     # 或: claude-sdk, codex, cursor, hermes, pi, ...

tools:
  word_count:
    type: function
    callable: mypackage.mymodule.word_count

  docs:
    type: mcp
    url: https://example.com/mcp

  researcher:
    type: agent
    prompt: 搜索相关信息并总结。
```

```bash
agent-meow run path/to/my_agent.yaml
```

参见 [`examples/hermes-gateway/config.yaml`](examples/hermes-gateway/config.yaml)
获取带有橘宝人格的完整示例，
以及 [`examples/polly/`](examples/polly/) 获取多智能体编码编排器。

---

## 本地服务器

启动本地服务器和网页 UI：

```bash
agent-meow server start      # 在 http://localhost:6767 启动
agent-meow server status      # 检查健康状态
agent-meow stop               # 停止一切
```

网页 UI 支持移动端 —— 在手机上打开 `http://<你的笔记本IP>:6767`。

### 环境变量

语音管线服务通过环境变量配置：

| 变量 | 设置内容 |
|------|----------|
| `WHISPER_STT_URL` | whisper-server URL（默认 `http://127.0.0.1:8001`） |
| `WHISPER_SERVER_EXE` | whisper-server.exe 路径 |
| `WHISPER_SERVER_MODEL` | GGML 模型文件路径 |
| `WHISPER_VAD_MODEL` | Silero VAD 模型路径 |
| `HERMES_VOICE_URL` | Hermes 网关语音端点 |
| `HERMES_API_KEY` | Hermes 网关 API 密钥 |
| `HERMES_BASE_URL` | Hermes 网关基础 URL |
| `QWEN_TTS_URL` | Qwen3-TTS 包装器 URL（默认 `http://127.0.0.1:8890`） |
| `QWEN_TTS_SERVER_EXE` | tts-server.exe 路径 |
| `QWEN_TTS_MODEL` | Qwen3-TTS GGUF 模型路径 |
| `QWEN_TTS_CODEC` | Qwen3-TTS 编解码器 GGUF 路径 |

> [!NOTE]
> 部分环境变量使用 `OMNIGENT_` 前缀（继承自上游）——
> 代码同时读取 `OMNIGENT_*` 和新命名。这是为了向后兼容。

---

## 策略

策略决定智能体可以做什么 —— 运行 shell 命令、编辑文件、
花费 token。它们检查每个操作，允许、阻止或暂停等待你的批准。

```yaml
policies:
  approve_shell:
    type: function
    handler: agent_meow.policies.builtins.safety.ask_on_os_tools
  budget:
    type: function
    handler: agent_meow.policies.builtins.cost.cost_budget
    factory_params:
      max_cost_usd: 5.00
      ask_thresholds_usd: [3.00]
```

策略在三个层级叠加：**服务器级**（管理员）、**智能体级**
（开发者）和**会话级**（你）。

---

## 品牌形象

agent-meow 使用橘宝疾风品牌 —— 一只特定的橘猫角色：

- **粉色护目镜带 + 浅蓝色护目镜镜片**（`#c8f8f8`）
- **橘猫身体**（`#e88020`），奶油色腹部（`#f8f0e0`），玫瑰色腮红（`#f8c8a8`）
- **单色奶油 + 橘色图案**用于壁纸
- 专属吉祥物素材、表情包和 Figma 设计文件在 `docs/assets/branding/`

---

## 与 Omnigent 的关系

agent-meow 基于 [Omnigent](https://github.com/omnigent-ai/omnigent)
（Apache-2.0）衍生，由智方云（Cubecloud）为 ColorFire 和 Meow 系列 AI PC 开发。

Python 模块目录为 `agent_meow/`（从 `omnigent/` 重命名）。PyPI 包名保持 `omnigent`，
以兼容 SDK 子包（`omnigent-client`、`omnigent-ui-sdk`）。完整归属见 `NOTICE`。

本分支的关键新增：
- Windows 桌面安装器（NSIS + 内嵌 Python）
- 首次运行设置向导（GPU 检测、Ollama、Hermes、语音栈）
- 实时语音管线（whisper.cpp STT → Hermes LLM → Qwen3-TTS）
- 带崩溃重启的服务监控器
- 运行状态仪表盘 + 首次启动检查清单
- 橘宝疾风品牌形象

---

## 贡献

欢迎贡献。参见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何设置环境、
运行检查和提交 Pull Request。

### 贡献者

感谢所有贡献者！

<a href="https://github.com/JZKK720/agent-meow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=JZKK720/agent-meow" />
</a>

---

## 许可证

Apache 2.0 —— 详见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)，
包括对 Databricks, Inc. 原始 Omnigent 软件的归属。