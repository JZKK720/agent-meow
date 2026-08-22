# Watchdog: every 5 minutes, restart any dead native-stack service.
# Scheduled alongside start-native-stack.ps1 (logon trigger + 5min repeat).
# RepoRoot auto-detects: prefers the directory containing this script's
# parent (repo checkout), so the same script works on any machine.
$ErrorActionPreference = "Continue"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$TtsPython = Join-Path $RepoRoot ".venv-tts-gpu\Scripts\python.exe"

function Test-Port($p) {
  (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

$hermesKey = $null
$webEnv = Join-Path $RepoRoot "web\.env"
if (Test-Path $webEnv) {
  $m = Select-String -Path $webEnv -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1
  if ($m) { $hermesKey = $m.Matches[0].Groups[1].Value }
}

# GPU TTS down -> restart
if (-not (Test-Port 8890)) {
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "`$env:TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL='1'; Set-Location '$RepoRoot'; & '$TtsPython' scripts\qwen3_tts_server.py --port 8890 *> tts-server.log"
}

# agent-meow server down -> restart with full env
if (-not (Test-Port 6767)) {
  # PYTHONUTF8: without it the host daemon crashes on GBK-locale encode
  # errors ('gbk' codec can't encode '\ufffd') and reconnect-loops forever.
  $envCmd = "`$env:PYTHONUTF8='1';" +
    "`$env:PYTHONIOENCODING='utf-8';" +
    "`$env:OMNIGENT_LOCAL_SINGLE_USER='1';" +
    "`$env:OMNIGENT_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml';" +
    "`$env:HERMES_VOICE_URL='http://127.0.0.1:8642';" +
    "`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1';" +
    "`$env:QWEN_TTS_URL='http://127.0.0.1:8890';"
  if ($hermesKey) { $envCmd += "`$env:HERMES_API_KEY='$hermesKey';" }
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "Set-Location '$RepoRoot'; $envCmd & '$VenvPython' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri sqlite:///$RepoRoot\agent_meow.db *> server-native.log"
}
