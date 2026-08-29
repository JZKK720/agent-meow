# Watchdog: every 5 minutes, restart any dead native-stack service.
# Scheduled alongside start-native-stack.ps1 (logon trigger + 5min repeat).
#
# Checks (in order):
#   1. tts-server.exe :8891       -> restart when down (Vulkan native C++)
#   2. agent-meow server :6767   -> restart (with full env) when down
#   3. Host daemon health        -> the server can be UP while the host
#      tunnel is wedged by orphaned _daemon_entry processes (each manual
#      server restart can orphan the previous daemon; they fight over the
#      single tunnel and none stays connected). Detect via /v1/hosts
#      reporting offline, then kill the orphans and restart the server so
#      it auto-spawns one clean daemon.
$ErrorActionPreference = "Continue"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"

# External tool paths — override via env vars, default to K16 layout.
$QwenttsRoot = if ($env:QWENTTS_ROOT) { $env:QWENTTS_ROOT } else { "C:\Users\K16\github-pr\qwentts.cpp" }
$WhisperRoot = if ($env:WHISPER_ROOT) { $env:WHISPER_ROOT } else { "C:\Users\K16\whisper.cpp" }
$VoiceModels = if ($env:VOICE_MODELS_DIR) { $env:VOICE_MODELS_DIR } else { "$env:APPDATA\agent-meow\voice\models" }
$TtsServerExe = Join-Path $QwenttsRoot "build\Release\tts-server.exe"
$TtsModel = Join-Path $QwenttsRoot "models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$TtsCodec = Join-Path $QwenttsRoot "models\qwen-tokenizer-12hz-Q8_0.gguf"
$WhisperServerExe = Join-Path $WhisperRoot "build\bin\Release\whisper-server.exe"
# STT model: prefer non-turbo (large-v3.bin) for accuracy; fall back to turbo.
$WhisperModel = $env:WHISPER_MODEL
if (-not $WhisperModel) {
  $nonTurbo = Join-Path $VoiceModels "ggml-large-v3.bin"
  $turbo = Join-Path $VoiceModels "ggml-large-v3-turbo.bin"
  if (Test-Path $nonTurbo) {
    $WhisperModel = $nonTurbo
  } else {
    $WhisperModel = $turbo
  }
}

function Test-Port($p) {
  (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

function Test-HostOnline {
  try {
    $resp = Invoke-WebRequest "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 10
    if ($resp.StatusCode -ne 200) { return $false }
    $hosts = $resp.Content | ConvertFrom-Json
    foreach ($h in $hosts.hosts) {
      if ($h.status -eq "online") { return $true }
    }
    return $false
  } catch {
    return $false
  }
}

function Start-TtsServer {
  # Start tts-server.exe (Vulkan native C++) — NOT the Python wrapper
  # which hangs on ROCm/PyTorch. The native binary uses OpenAI format
  # (/v1/audio/speech) with greedy temperature=0, WAV output, --max-batch 2.
  Start-Process -FilePath $TtsServerExe `
    -ArgumentList "--model",$TtsModel,"--codec",$TtsCodec,"--port","8891","--lang","auto","--codec-chunk-dur","10.0","--max-batch","2" `
    -WorkingDirectory $QwenttsRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$RepoRoot\tts-vulkan.log" `
    -RedirectStandardError "$RepoRoot\tts-vulkan-err.log"
}

function Start-WhisperServer {
  # Start whisper-server.exe (whisper.cpp, Vulkan iGPU STT).
  # --suppress-nst reduces hallucination; --no-speech-thold 0.5 filters
  # non-speech audio; --beam-size 5 improves accuracy; VAD further reduces false triggers.
  Start-Process -FilePath $WhisperServerExe `
    -ArgumentList "--model",$WhisperModel,"--port","8001","--suppress-nst","--no-speech-thold","0.5","--beam-size","5","--no-flash-attn","--language","zh","--prompt","橘宝agent-meow语音工作目录会话" `
    -WorkingDirectory $WhisperRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$RepoRoot\whisper-vulkan.log" `
    -RedirectStandardError "$RepoRoot\whisper-vulkan-err.log"
}

function Start-MeowServer {
  # PYTHONUTF8: without it the host daemon crashes on GBK-locale encode
  # errors ('gbk' codec can't encode '\ufffd') and reconnect-loops forever.
  $envCmd = "`$env:PYTHONUTF8='1';" +
    "`$env:PYTHONIOENCODING='utf-8';" +
    "`$env:AGENT_MEOW_LOCAL_SINGLE_USER='1';" +
    "`$env:AGENT_MEOW_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml';" +
    "`$env:HERMES_VOICE_URL='http://127.0.0.1:8642';" +
    "`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1';" +
    "`$env:QWENTTS_SERVER_URL='http://127.0.0.1:8891';" +
    "`$env:QWENTTS_SERVER_EXE='$TtsServerExe';" +
    "`$env:QWENTTS_MODEL='$TtsModel';" +
    "`$env:QWENTTS_CODEC='$TtsCodec';" +
    "`$env:QWENTTS_LANG='auto';" +
    "`$env:QWENTTS_CODEC_CHUNK_DUR='10.0';" +
    "`$env:WHISPER_STT_URL='http://127.0.0.1:8001';" +
    "`$env:WHISPER_SERVER_EXE='$WhisperServerExe';" +
    "`$env:WHISPER_SERVER_MODEL='$WhisperModel';"
  if ($script:hermesKey) { $envCmd += "`$env:HERMES_API_KEY='$script:hermesKey';" }
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "Set-Location '$RepoRoot'; $envCmd & '$VenvPython' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri sqlite:///$RepoRoot\agent_meow.db *> server-native.log"
}

$script:hermesKey = $null
$webEnv = Join-Path $RepoRoot "web\.env"
if (Test-Path $webEnv) {
  $m = Select-String -Path $webEnv -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1
  if ($m) { $script:hermesKey = $m.Matches[0].Groups[1].Value }
}

# 1a. whisper-server.exe down -> restart (Vulkan STT)
if (-not (Test-Port 8001)) {
  Start-WhisperServer
}

# 1b. tts-server.exe down -> restart (Vulkan native, NOT Python wrapper)
if (-not (Test-Port 8891)) {
  Start-TtsServer
}

# 2. agent-meow server down -> restart with full env
if (-not (Test-Port 6767)) {
  Start-MeowServer
  # The server needs ~15s to bind and spawn its host daemon; skip the
  # host check this cycle — the next run verifies it.
  exit 0
}

# 3. Server up but host offline -> orphaned daemons. Kill every
#    _daemon_entry process AND the server, then restart the server once
#    so it auto-spawns a single clean daemon.
if (-not (Test-HostOnline)) {
  # Give a freshly-started server time to connect its daemon before
  # declaring it wedged (the tunnel takes a few seconds after boot).
  Start-Sleep -Seconds 10
  if (Test-HostOnline) { exit 0 }

  Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" |
    Where-Object { $_.CommandLine -match "_daemon_entry" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" |
    Where-Object { $_.CommandLine -match "agent_meow server" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 3
  Start-MeowServer
}
