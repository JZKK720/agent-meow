# agent-meow native stack launcher for Task Scheduler.
# Starts the GPU TTS server (:8890) and the agent-meow server (:6767) with
# the full required environment. Idempotent: skips services already up.
$ErrorActionPreference = "Continue"
# Derive repo root from the script location so this works on any machine.
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$TtsPython = Join-Path $RepoRoot ".venv-tts-gpu\Scripts\python.exe"

function Test-Port($p) {
  (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

# Load the Hermes API key from web/.env (never logged).
$hermesKey = $null
$webEnv = Join-Path $RepoRoot "web\.env"
if (Test-Path $webEnv) {
  $m = Select-String -Path $webEnv -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1
  if ($m) { $hermesKey = $m.Matches[0].Groups[1].Value }
}

# 1. tts-server.exe on :8891 (Vulkan native C++, model load ~5s)
#    NOT the Python wrapper on :8890 which hangs on ROCm/PyTorch.
# External tool paths — override via env vars, default to K16 layout.
# PowerShell 5.1 compatible null-coalescing (?? is PS7+ only)
$QwenttsRoot = if ($env:QWENTTS_ROOT) { $env:QWENTTS_ROOT } else { "C:\Users\K16\github-pr\qwentts.cpp" }
$WhisperRoot = if ($env:WHISPER_ROOT) { $env:WHISPER_ROOT } else { "C:\Users\K16\whisper.cpp" }
$VoiceModels = if ($env:VOICE_MODELS_DIR) { $env:VOICE_MODELS_DIR } else { "$env:APPDATA\agent-meow\voice\models" }
$ttsServerExe = Join-Path $QwenttsRoot "build\Release\tts-server.exe"
$ttsModel = Join-Path $QwenttsRoot "models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$ttsCodec = Join-Path $QwenttsRoot "models\qwen-tokenizer-12hz-Q8_0.gguf"
$whisperServerExe = Join-Path $WhisperRoot "build\bin\Release\whisper-server.exe"
# STT model: prefer non-turbo (large-v3.bin) for accuracy; fall back to
# turbo (large-v3-turbo.bin) for speed. Non-turbo is ~2x slower but
# significantly more accurate on Chinese speech. With Vulkan iGPU the
# speed penalty is acceptable (0.3-0.5s vs 0.1-0.2s per utterance).
# Override via $env:WHISPER_MODEL.
$whisperModel = $env:WHISPER_MODEL
if (-not $whisperModel) {
  $nonTurbo = Join-Path $VoiceModels "ggml-large-v3.bin"
  $turbo = Join-Path $VoiceModels "ggml-large-v3-turbo.bin"
  if (Test-Path $nonTurbo) {
    $whisperModel = $nonTurbo
    Write-Host "STT: using non-turbo model (large-v3.bin, higher accuracy)"
  } elseif (Test-Path $turbo) {
    $whisperModel = $turbo
    Write-Host "STT: using turbo model (large-v3-turbo.bin, faster)"
  } else {
    $whisperModel = $turbo  # default path even if not found (error will show on start)
  }
}

# 1a. whisper-server.exe on :8001 (Vulkan STT)
# Settings match the 472ms benchmark (commit d7d917214):
#   --no-flash-attn: flash attention OFF (benchmark used this)
#   --no-speech-thold 0.5: original tuned value
#   --beam-size 5: accuracy/speed tradeoff
#   --suppress-nst: suppress non-speech tokens
#   --language zh: force Chinese (added after benchmark for better zh detection)
#   --prompt: bias toward agent-meow vocabulary
# Note: --flash-attn and --threads 8 were tested but did NOT improve
# performance over the benchmark settings. The Vulkan iGPU does the
# heavy lifting; CPU thread count and flash-attn have minimal impact.
if (-not (Test-Port 8001)) {
  Start-Process -FilePath $whisperServerExe `
    -ArgumentList "--model",$whisperModel,"--port","8001","--suppress-nst","--no-speech-thold","0.5","--beam-size","5","--no-flash-attn","--language","zh","--prompt","橘宝agent-meow语音工作目录会话" `
    -WorkingDirectory $WhisperRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$RepoRoot\whisper-vulkan.log" `
    -RedirectStandardError "$RepoRoot\whisper-vulkan-err.log"
}

# 1b. tts-server.exe on :8891 (Vulkan native C++, model load ~5s)
#    NOT the Python wrapper on :8890 which hangs on ROCm/PyTorch.
if (-not (Test-Port 8891)) {
  Start-Process -FilePath $ttsServerExe `
    -ArgumentList "--model",$ttsModel,"--codec",$ttsCodec,"--port","8891","--lang","auto","--codec-chunk-dur","10.0","--max-batch","2" `
    -WorkingDirectory $QwenttsRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$RepoRoot\tts-vulkan.log" `
    -RedirectStandardError "$RepoRoot\tts-vulkan-err.log"
}

# 2. agent-meow server on :6767 (auto-spawns the host daemon)
if (-not (Test-Port 6767)) {
  $envCmd = "`$env:AGENT_MEOW_LOCAL_SINGLE_USER='1';" +
    "`$env:AGENT_MEOW_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml';" +
    "`$env:HERMES_VOICE_URL='http://127.0.0.1:8642';" +
    "`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1';" +
    "`$env:QWENTTS_SERVER_URL='http://127.0.0.1:8891';" +
    "`$env:QWENTTS_SERVER_EXE='$ttsServerExe';" +
    "`$env:QWENTTS_MODEL='$ttsModel';" +
    "`$env:QWENTTS_CODEC='$ttsCodec';" +
    "`$env:QWENTTS_LANG='auto';" +
    "`$env:QWENTTS_CODEC_CHUNK_DUR='10.0';" +
    "`$env:WHISPER_STT_URL='http://127.0.0.1:8001';" +
    "`$env:WHISPER_SERVER_EXE='$whisperServerExe';" +
    "`$env:WHISPER_SERVER_MODEL='$whisperModel';" +
    # Composer dictation uses the whisper.cpp server (:8001) instead of
    # the sherpa-onnx engine (extra + models not installed on this box).
    "`$env:AGENT_MEOW_DICTATION_ENGINE='whisper';" +
    # Keep Ollama models warm in VRAM for 30 minutes after last use.
    # Without this, Ollama unloads models after 5min default, causing
    # 10-20s cold-start latency on the next voice turn.
    "`$env:OLLAMA_KEEP_ALIVE='30m';"
  if ($hermesKey) { $envCmd += "`$env:HERMES_API_KEY='$hermesKey';" }
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "Set-Location '$RepoRoot'; $envCmd & '$VenvPython' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri sqlite:///$RepoRoot\agent_meow.db *> server-native.log"
}
