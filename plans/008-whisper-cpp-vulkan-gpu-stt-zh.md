# 计划 008：使用 Vulkan 构建 whisper.cpp 实现 GPU 加速语音识别（离线预热优化）

> **执行者须知**：请逐步按此计划执行。每一步完成后运行验证命令并确认
> 预期结果，再进入下一步。如果出现"停止条件"中的任何情况，请停止并
> 报告——不要自行发挥。完成后，更新 `plans/README.md` 中此计划的状态行。
>
> **偏移检查（首先执行）**：`git diff --stat ff786767..HEAD -- scripts/start-speech-to-speech.ps1 scripts/start-s2s-detached.ps1`
> 如果计划编写后范围内的文件有变更，请将"当前状态"摘录与实际代码
> 对照；不匹配则视为停止条件。

## 状态

- **优先级**：P2
- **工作量**：中
- **风险**：中
- **依赖**：无（独立于计划 006-007；可并行执行）
- **类别**：性能优化
- **编写于**：提交 `ff786767`，2026-08-04

## 为什么重要

本地 S2S 服务器（离线模式）有 90 秒预热时间，原因是 faster-whisper
（CTranslate2 引擎）只支持 CUDA GPU 加速——而我们机器的 AMD Radeon 8060S
集成显卡（支持 Vulkan 1.4.329）和 XDNA 2 NPU 都在闲置。whisper.cpp 支持
Vulkan（`GGML_VULKAN=1`）和 AMD ROCm（`GGML_HIP=1`），任一方案都能将语音
识别放到 GPU 上运行，将预热时间从 ~60 秒降到 ~3 秒。配合现有的看门狗预热
机制，离线模式可达到 ~0 秒预热——与在线 DashScope 云端路径持平。

## 当前状态

- **机器配置**：AMD Ryzen AI MAX+ 395，16 核 32 线程，32GB 内存，AMD Radeon
  8060S 集成显卡（Vulkan 1.4.329，AMD 官方驱动），XDNA 2 NPU，ROCm 7.1
  已安装在 `C:\Program Files\AMD\ROCm\7.1\`。
- **语音识别**：`faster-whisper` medium 模型，`--device cpu`，~60 秒预热
  （将模型权重加载到 CPU 内存）。
- S2S 启动脚本（`scripts/start-speech-to-speech.ps1`）启动
  `.venv\Scripts\speech-to-speech.exe`，参数为 `--stt faster-whisper`
  `--faster_whisper_stt_device cpu`。
- whisper.cpp v1.9.1 支持 Vulkan、ROCm/HIP，并有 `whisper-server` 示例
  提供 OpenAI 兼容的 HTTP 语音转写 API。
- Vulkan 已确认可用：`vulkaninfo --summary` 显示 GPU0 =
  AMD Radeon 8060S Graphics，apiVersion 1.4.329。

## 需要的命令

| 用途             | 命令                                                                        | 成功预期                                 |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| 检查 Vulkan      | `vulkaninfo --summary`                                                      | GPU0 = AMD Radeon 8060S                  |
| 检查 CMake       | `cmake --version`                                                           | ≥ 3.16                                   |
| 检查 ROCm        | `hipcc --version`                                                           | ROCm 7.1                                 |
| 构建 whisper.cpp | `cmake -B build -DGGML_VULKAN=1 && cmake --build build -j --config Release` | `build/bin/Release/whisper-cli.exe` 存在 |
| 性能测试         | `.\build\bin\Release\whisper-bench.exe -m models\ggml-medium.bin`           | 打印耗时                                 |

## 范围

**范围内**（可创建/修改的文件）：

- `C:\Users\1\whisper.cpp\`（克隆、构建——在仓库之外，不修改仓库）
- `scripts/start-whisper-server-vulkan.ps1`（创建）——whisper-server 启动脚本
- `scripts/start-speech-to-speech.ps1`（修改）——添加使用 whisper-server 作为 STT 的选项

**范围外**（不要修改）：

- `web/`——无前端变更
- `agent_meow/server/`——无服务器变更
- S2S Python 包（`.venv/Lib/site-packages/speech_to_speech/`）——如果
  S2S 包不支持远程 STT 端点，使用方案 C（独立 whisper-stream）并将文本
  输出馈送到 S2S 的 LLM+TTS 管道

## Git 工作流

- 分支：`feat/whisper-cpp-vulkan-stt`
- 每步提交；提交信息风格：`feat(s2s): <描述>`
- 除非收到指示，不要推送。

## 步骤

### 第 1 步：克隆并使用 Vulkan 构建 whisper.cpp

```powershell
cd C:\Users\1
git clone https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp
cmake -B build -DGGML_VULKAN=1
cmake --build build -j --config Release
```

**验证**：`.\build\bin\Release\whisper-cli.exe --help` 打印用法。
先下载模型：`.\models\download-ggml-model.cmd medium`，然后运行
`.\build\bin\Release\whisper-bench.exe -m .\models\ggml-medium.bin`。

### 第 2 步：对比 Vulkan GPU 与 CPU 的 STT 延迟

```powershell
# GPU（Vulkan）：
.\build\bin\Release\whisper-bench.exe -m models\ggml-medium.bin -t 4

# CPU（对比用）：
.\build\bin\Release\whisper-bench.exe -m models\ggml-medium.bin -t 4 --no-gpu
```

记录编码器 + 解码器耗时。GPU 路径的编码器速度应显著更快
（模型加载是瓶颈所在）。

**验证**：GPU 基准测试完成并打印耗时。GPU 编码器时间应 <5 秒
（CPU 上约 30-60 秒）。

### 第 3 步：启动 whisper-server（OpenAI 兼容 HTTP 语音识别服务）

```powershell
.\build\bin\Release\whisper-server.exe --host 127.0.0.1 --port 8888 -m models\ggml-medium.bin
```

用 curl 测试：

```powershell
# 创建测试 WAV 文件（16kHz，单声道，16 位）
ffmpeg -i samples\jfk.wav -ar 16000 -ac 1 -c:a pcm_s16le test.wav
curl -F "audio=@test.wav" http://127.0.0.1:8888/v1/audio/transcriptions
```

**验证**：服务器返回 JSON 转写结果。模型在启动时加载到 GPU 显存
（~3-5 秒），之后请求速度很快。

### 第 4 步：创建 whisper-server 启动脚本

创建 `scripts/start-whisper-server-vulkan.ps1`：

```powershell
# 使用 Vulkan GPU 加速启动 whisper.cpp 服务器。
# 模型在启动时加载到 GPU 显存（~3-5 秒），之后保持热状态。
# 用法：.\scripts\start-whisper-server-vulkan.ps1
$WhisperDir = "C:\Users\1\whisper.cpp"
$Model = Join-Path $WhisperDir "models\ggml-medium.bin"
$Server = Join-Path $WhisperDir "build\bin\Release\whisper-server.exe"

if (-not (Test-Path $Server)) {
    Write-Host "未找到 whisper-server，请先构建 whisper.cpp。" -ForegroundColor Red
    exit 1
}

Start-Process $Server -ArgumentList "--host", "127.0.0.1", "--port", "8888", "-m", $Model -WindowStyle Hidden
Write-Host "whisper-server (Vulkan) 已启动，地址 http://127.0.0.1:8888" -ForegroundColor Cyan
```

**验证**：运行脚本启动后台 whisper-server 进程。
`curl http://127.0.0.1:8888/health`（或类似端点）有响应。

### 第 5 步：将 whisper-server 接入 S2S 管道

**方案 A（首选）**：检查 `speech-to-speech` 包是否支持远程 STT 端点。
如果有 `--stt whisper-server` 或 `--stt_url http://127.0.0.1:8888` 参数，
更新 `scripts/start-speech-to-speech.ps1` 使用它。

**方案 B（备选）**：如果 S2S 包不支持远程 STT，使用 `whispercpp` Python
绑定。在 S2S 虚拟环境中安装：`pip install whispercpp`，然后修改 S2S 的
STT 处理器，用 `whispercpp`（支持 Vulkan）替代 `faster_whisper`。

**方案 C（解耦）**：运行 `whisper-stream`（使用 Vulkan 的实时麦克风转写）
作为独立进程。将其文本输出馈送到 S2S 的 LLM+TTS。这完全绕过 S2S 的 STT。

先尝试方案 A。如果 S2S 包不支持，退回 B 或 C。记录使用了哪个方案。

**验证**：S2S 服务器启动并使用 GPU 加速的 STT。第一个转写请求在 <5 秒内
完成（CPU faster-whisper 约 ~60 秒）。

### 第 6 步：开机时预热 Kokoro TTS

更新 `scripts/start-s2s-detached.ps1`（或 `start-voice-stack.ps1`），
在 S2S 启动后立即发送一个虚拟语音合成请求，预热 Kokoro 模型：

```powershell
# S2S 启动后，发送预热 TTS 请求：
Start-Sleep -Seconds 5  # 等待 S2S 绑定端口
Invoke-WebRequest -Uri "http://127.0.0.1:8765/v1/audio/speech" -Method POST -Body '{"text":"warmup","voice":"zf_xiaoyi"}' -ContentType "application/json" -ErrorAction SilentlyContinue
```

**验证**：启动脚本运行后，第一个真实语音请求没有 TTS 预热延迟。

### 第 7 步：完整离线冒烟测试

1. 启动 Hermes Docker（用户自行管理）。
2. 运行 `scripts/start-whisper-server-vulkan.ps1`（GPU 语音识别）。
3. 运行 `scripts/start-s2s-detached.ps1`（S2S + GPU STT + 预热 Kokoro）。
4. 运行 `scripts/start-qaa-gateway.ps1`（QAA 网关）。
5. 运行 `cd web && npm run dev`（Vite 开发服务器）。
6. 打开浏览器，切换到离线模式，点击猫爪麦克风按钮。
7. 说一句话——验证响应在 <10 秒内返回（之前约 ~90 秒）。

**验证**：离线语音在 <10 秒内完成往返。STT 预热 ~3-5 秒（GPU），
不再是 ~60 秒（CPU）。TTS 预热 ~0 秒（已预热）。

## 测试计划

- 不需要单元测试（这是基础设施/工具，不是应用代码）。
- 验证方式是性能测试（第 2 步）+ 冒烟测试（第 7 步）。
- 在计划执行记录中记录 GPU 与 CPU 的性能测试数据。

## 完成标准

- [ ] `whisper-cli.exe` 已用 Vulkan 构建（`GGML_VULKAN=1`）
- [ ] `whisper-server.exe` 启动并在 `:8888` 提供转写服务
- [ ] GPU 性能测试显示编码器时间 <5 秒（CPU 约 30-60 秒）
- [ ] `scripts/start-whisper-server-vulkan.ps1` 存在且可用
- [ ] S2S 服务器使用 GPU 加速的 STT（方案 A、B 或 C 已记录）
- [ ] Kokoro TTS 在开机时已预热
- [ ] 离线语音在 <10 秒内完成往返（冒烟测试通过）
- [ ] 范围外的文件未被修改
- [ ] `plans/README.md` 状态行已更新

## 停止条件

- `cmake -B build -DGGML_VULKAN=1` 失败——检查 Vulkan SDK 是否已安装，
  AMD 驱动是否支持 Vulkan 1.4+。报告 CMake 错误。
- `whisper-server` 示例未构建或此版本的 whisper.cpp 中不存在——检查
  `examples/server/` 是否存在；如不存在，改用 `whisper-cli` 循环代替。
- S2S `speech-to-speech` 包无法使用远程 STT 端点（方案 A 和 B 均失败）
  ——报告回来；方案 C（独立流）需要不同的集成方式。
- GPU 性能测试不快于 CPU——Vulkan 后端可能未针对此集成显卡优化。
  改试 ROCm/HIP（`GGML_HIP=1`）。如果两者都慢于 CPU，报告回来——预热
  优化可能需要不同方案（更小模型、仅使用预加载热池）。
