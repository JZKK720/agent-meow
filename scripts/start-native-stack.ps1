# agent-meow native stack launcher for Task Scheduler.
# Starts the GPU TTS server (:8890) and the agent-meow server (:6767) with
# the full required environment. Idempotent: skips services already up.
$ErrorActionPreference = "Continue"
$RepoRoot = "C:\Users\1\github-pr\agent-meow"
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

# 1. GPU Qwen3-TTS on :8890 (model load takes 10-30s; health-checked later)
if (-not (Test-Port 8890)) {
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "`$env:TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL='1'; Set-Location '$RepoRoot'; & '$TtsPython' scripts\qwen3_tts_server.py --port 8890 *> tts-server.log"
}

# 2. agent-meow server on :6767 (auto-spawns the host daemon)
if (-not (Test-Port 6767)) {
  $envCmd = "`$env:OMNIGENT_LOCAL_SINGLE_USER='1';" +
    "`$env:OMNIGENT_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml';" +
    "`$env:HERMES_VOICE_URL='http://127.0.0.1:8642';" +
    "`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1';" +
    "`$env:QWEN_TTS_URL='http://127.0.0.1:8890';"
  if ($hermesKey) { $envCmd += "`$env:HERMES_API_KEY='$hermesKey';" }
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "Set-Location '$RepoRoot'; $envCmd & '$VenvPython' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri sqlite:///$RepoRoot\agent_meow.db *> server-native.log"
}
