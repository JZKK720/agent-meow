# Start agent-meow server as a truly detached background process
# Uses Start-Process with -PassThru to get the process handle
$RepoRoot = "c:\Users\1\github-pr\agent-meow"
$hermesKey = (Select-String -Path "$RepoRoot\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1).Matches[0].Groups[1].Value.Trim()

# Kill any existing server
$pid6767 = (Get-NetTCPConnection -LocalPort 6767 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($pid6767) { Stop-Process -Id $pid6767 -Force; Start-Sleep -Seconds 2 }
Remove-Item "$env:USERPROFILE\.agent-meow\server.pid" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.agent-meow\server.sig" -Force -ErrorAction SilentlyContinue

# Create a temporary launcher script that sets env vars and starts the server
$launcher = "$env:TEMP\start-agent-meow-voice.ps1"
@"
`$env:AGENT_MEOW_LOCAL_SINGLE_USER = '1'
`$env:AGENT_MEOW_BUILTIN_AGENT_DIRS = '$RepoRoot\examples\hermes-gateway\config.yaml'
`$env:HERMES_VOICE_URL = 'http://127.0.0.1:8642'
`$env:HERMES_BASE_URL = 'http://127.0.0.1:8642/v1'
`$env:HERMES_API_KEY = '$hermesKey'
`$env:WHISPER_STT_URL = 'http://127.0.0.1:8001'
`$env:QWEN_TTS_URL = 'http://127.0.0.1:8891'
`$env:OLLAMA_KEEP_ALIVE = '30m'
Set-Location '$RepoRoot'
& '$RepoRoot\.venv\Scripts\python.exe' -m agent_meow server start
"@ | Out-File -FilePath $launcher -Encoding ASCII

# Start the launcher as a detached process
$proc = Start-Process -FilePath "powershell" -WindowStyle Hidden -PassThru -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File",$launcher
Write-Output "Server starting (PID: $($proc.Id))..."
Start-Sleep -Seconds 10

# Check if it's up
$up = Get-NetTCPConnection -LocalPort 6767 -State Listen -ErrorAction SilentlyContinue
if ($up) {
  Write-Output "Server UP on port 6767 (PID: $($up.OwningProcess))"
  # Test health
  try {
    $h = (Invoke-WebRequest -Uri 'http://127.0.0.1:6767/health' -UseBasicParsing -TimeoutSec 5).Content
    Write-Output "Health: $h"
  } catch {
    Write-Output "Health check failed: $_"
  }
} else {
  Write-Output "Server DOWN"
}
