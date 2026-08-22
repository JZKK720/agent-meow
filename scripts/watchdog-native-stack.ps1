# Watchdog: every 5 minutes, restart any dead native-stack service.
# Scheduled alongside start-native-stack.ps1 (logon trigger + 5min repeat).
#
# Checks (in order):
#   1. GPU TTS port :8890        -> restart when down
#   2. agent-meow server :6767   -> restart (with full env) when down
#   3. Host daemon health        -> the server can be UP while the host
#      tunnel is wedged by orphaned _daemon_entry processes (each manual
#      server restart can orphan the previous daemon; they fight over the
#      single tunnel and none stays connected). Detect via /v1/hosts
#      reporting offline, then kill the orphans and restart the server so
#      it auto-spawns one clean daemon.
$ErrorActionPreference = "Continue"
$RepoRoot = "C:\Users\1\github-pr\agent-meow"
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$TtsPython = Join-Path $RepoRoot ".venv-tts-gpu\Scripts\python.exe"

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
  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "`$env:TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL='1'; Set-Location '$RepoRoot'; & '$TtsPython' scripts\qwen3_tts_server.py --port 8890 *> tts-server.log"
}

function Start-MeowServer {
  $envCmd = "`$env:OMNIGENT_LOCAL_SINGLE_USER='1';" +
    "`$env:OMNIGENT_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml';" +
    "`$env:HERMES_VOICE_URL='http://127.0.0.1:8642';" +
    "`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1';" +
    "`$env:QWEN_TTS_URL='http://127.0.0.1:8890';"
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

# 1. GPU TTS down -> restart
if (-not (Test-Port 8890)) {
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
