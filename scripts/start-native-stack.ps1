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
$QwenttsRoot = $env:QWENTTS_ROOT ?? "C:\Users\K16\github-pr\qwentts.cpp"
$WhisperRoot = $env:WHISPER_ROOT ?? "C:\Users\K16\whisper.cpp"
$VoiceModels = $env:VOICE_MODELS_DIR ?? "$env:APPDATA\agent-meow\voice\models"
$ttsServerExe = Join-Path $QwenttsRoot "build\Release\tts-server.exe"
$ttsModel = Join-Path $QwenttsRoot "models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$ttsCodec = Join-Path $QwenttsRoot "models\qwen-tokenizer-12hz-Q8_0.gguf"
$whisperServerExe = Join-Path $WhisperRoot "build\bin\Release\whisper-server.exe"
$whisperModel = Join-Path $VoiceModels "ggml-large-v3-turbo.bin"

# 1a. whisper-server.exe on :8001 (Vulkan STT)
if (-not (Test-Port 8001)) {
  Start-Process -FilePath $whisperServerExe `
    -ArgumentList "--model",$whisperModel,"--port","8001","--suppress-nst","--no-speech-thold","0.5","--beam-size","5","--no-flash-attn" `
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
    "`$env:WHISPER_SERVER_MODEL='$whisperModel';"
  if ($hermesKey) { $envCmd += "`$env:HERMES_API_KEY='$hermesKey';" }
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "Set-Location '$RepoRoot'; $envCmd & '$VenvPython' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri sqlite:///$RepoRoot\agent_meow.db *> server-native.log"
}
