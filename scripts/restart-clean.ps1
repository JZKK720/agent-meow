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
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
Start-Process -FilePath "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" `
  -ArgumentList "-m","agent_meow","server","start" `
  -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 12

Write-Output "=== health ==="
try { (Invoke-WebRequest -Uri "http://127.0.0.1:6767/health" -UseBasicParsing -TimeoutSec 5).Content } catch { "FAIL: $_" }

Write-Output "=== agent_meow processes now ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object {
  "pid=$($_.ProcessId) cmd=$($_.CommandLine.Substring(0,[Math]::Min(100,$_.CommandLine.Length)))"
}
