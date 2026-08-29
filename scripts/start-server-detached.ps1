# Start agent-meow server as a detached background process with voice env vars
$RepoRoot = "c:\Users\1\github-pr\agent-meow"
$hermesKey = (Select-String -Path "$RepoRoot\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1).Matches[0].Groups[1].Value.Trim()

# Kill any existing server
$pid6767 = (Get-NetTCPConnection -LocalPort 6767 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($pid6767) { Stop-Process -Id $pid6767 -Force; Start-Sleep -Seconds 2 }

# Remove pidfile/sigfile
Remove-Item "$env:USERPROFILE\.agent-meow\server.pid" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.agent-meow\server.sig" -Force -ErrorAction SilentlyContinue

# Build the env var prefix for the detached process
$envPrefix = @"
`$env:AGENT_MEOW_LOCAL_SINGLE_USER='1'
`$env:AGENT_MEOW_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml'
`$env:HERMES_VOICE_URL='http://127.0.0.1:8642'
`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1'
`$env:HERMES_API_KEY='$hermesKey'
`$env:WHISPER_STT_URL='http://127.0.0.1:8001'
`$env:QWEN_TTS_URL='http://127.0.0.1:8891'
`$env:OLLAMA_KEEP_ALIVE='30m'
"@

# Start as a detached hidden process
$cmd = "Set-Location '$RepoRoot'; $envPrefix & '$RepoRoot\.venv\Scripts\python.exe' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri 'sqlite:///$RepoRoot\agent_meow.db'"
Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-Command",$cmd

Write-Output "Server starting in background..."
