$ErrorActionPreference = "Continue"
Write-Output "=== killing all agent_meow processes ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object {
  Write-Output "killing pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 3

Write-Output "=== remaining ==="
$left = Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" }
if ($left) { $left | ForEach-Object { "still alive: pid=$($_.ProcessId)" } } else { "none" }

Write-Output "=== starting fresh server with env ==="
$RepoRoot = Split-Path -Parent $PSScriptRoot
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
# Load the Hermes API key from web/.env (never logged).
$webEnv = Join-Path $RepoRoot "web\.env"
if (Test-Path $webEnv) {
  $m = Select-String -Path $webEnv -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1
  if ($m) { $env:HERMES_API_KEY = $m.Matches[0].Groups[1].Value }
}
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
$env:QWENTTS_SERVER_EXE = "C:\Users\K16\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWENTTS_MODEL = "C:\Users\K16\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWENTTS_CODEC = "C:\Users\K16\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:WHISPER_STT_URL = "http://127.0.0.1:8001"
$env:WHISPER_SERVER_EXE = "C:\Users\K16\whisper.cpp\build\bin\Release\whisper-server.exe"
$env:WHISPER_SERVER_MODEL = "C:\Users\K16\AppData\Roaming\agent-meow\voice\models\ggml-large-v3-turbo.bin"
$env:AGENT_MEOW_DICTATION_ENGINE = "whisper"
$env:AGENT_MEOW_DICTATION_WHISPER_URL = "http://127.0.0.1:8001/inference"
$env:AGENT_MEOW_AUTO_TAG = "true"
$env:OLLAMA_KEEP_ALIVE = "30m"
# Give ollama enough time to process large context windows (1M tokens)
# without the 600s idle watchdog killing the turn prematurely.
$env:HARNESS_TURN_TIMEOUT_S = "900"
Start-Process -FilePath "C:\Users\K16\github-pr\agent-meow\.venv\Scripts\python.exe" `
  -ArgumentList "-m","agent_meow","server","start" `
  -WorkingDirectory "C:\Users\K16\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 12

Write-Output "=== health ==="
try { (Invoke-WebRequest -Uri "http://127.0.0.1:6767/health" -UseBasicParsing -TimeoutSec 5).Content } catch { "FAIL: $_" }

Write-Output "=== agent_meow processes now ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object {
  "pid=$($_.ProcessId) cmd=$($_.CommandLine.Substring(0,[Math]::Min(100,$_.CommandLine.Length)))"
}
