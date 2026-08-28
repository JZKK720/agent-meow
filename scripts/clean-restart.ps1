$ErrorActionPreference = "Continue"

Write-Output "=== 1. Kill ALL agent_meow python processes ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object {
  Write-Output "  killing pid=$($_.ProcessId)"
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 3
$left = Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" }
Write-Output "  remaining: $(if ($left) { $left.Count } else { 0 })"

Write-Output "=== 2. Start ONE clean server with full env ==="
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL   = "http://127.0.0.1:8642"
$env:HERMES_API_KEY    = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
Start-Process -FilePath "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" `
  -ArgumentList "-m","agent_meow","server","start" `
  -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 15

Write-Output "=== 3. Verify health ==="
try { "  health: $((Invoke-WebRequest -Uri 'http://127.0.0.1:6767/health' -UseBasicParsing -TimeoutSec 5).Content)" } catch { "  health FAIL: $_" }

Write-Output "=== 4. Verify env vars reached the server ==="
$stack = try { (Invoke-WebRequest -Uri 'http://127.0.0.1:6767/v1/stack/status' -UseBasicParsing -TimeoutSec 10).Content } catch { "FAIL" }
if ($stack -match '"hermes":\{"status":"ok"') { "  hermes: ok (HERMES_VOICE_URL resolved)" } else { "  hermes: NOT ok — $stack" }

Write-Output "=== 5. Verify process count (should be 2: server + host daemon) ==="
$procs = Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" }
$procs | ForEach-Object { "  pid=$($_.ProcessId) $($_.CommandLine.Substring(0,[Math]::Min(80,$_.CommandLine.Length)))" }
Write-Output "  total: $($procs.Count)"

Write-Output "=== 6. TTS via proxy ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/speech" -Method POST -Body '{"text":"hello","voice":"Serena"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  "  TTS: $($r.StatusCode) $($r.RawContentLength) bytes"
} catch { "  TTS FAIL: $_" }

Write-Output "=== 7. SPA bundle ==="
try {
  $html = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/" -UseBasicParsing -TimeoutSec 5).Content
  if ($html -match 'index-([A-Za-z0-9_-]+)\.js') { "  bundle: index-$($Matches[1]).js" }
} catch { "  SPA FAIL: $_" }

Write-Output "=== 8. Host tunnel ==="
try {
  $h = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 5).Content
  if ($h -match '"status":"online"') { "  host: online" } else { "  host: $h" }
} catch { "  host FAIL: $_" }