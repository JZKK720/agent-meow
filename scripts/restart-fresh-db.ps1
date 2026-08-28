$ErrorActionPreference = "Continue"
# Kill all agent_meow processes
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 3

# Delete the DB to force fresh agent registration
Remove-Item "C:\Users\1\.agent-meow\chat.db" -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\1\.agent-meow\chat.db-shm" -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\1\.agent-meow\chat.db-wal" -Force -ErrorAction SilentlyContinue

# Restart with env vars
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
Start-Process -FilePath "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" -ArgumentList "-m","agent_meow","server","start" -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 15

$curl = "C:\Windows\System32\curl.exe"
Write-Output "health: $(& $curl -s http://127.0.0.1:6767/health)"
$agents = & $curl -s http://127.0.0.1:6767/v1/agents
if ($agents -match '"name":"hermes-gateway","version":(\d+)') { Write-Output "hermes-gateway version: $($Matches[1])" }
# Check if use_responses is in the agent spec
if ($agents -match 'use_responses') { Write-Output "use_responses: found in agents response" } else { Write-Output "use_responses: not in agents response (expected — it's in the bundle, not the API)" }
