$ErrorActionPreference = "Continue"
Write-Output "=== health ==="
try { (Invoke-WebRequest -Uri "http://127.0.0.1:6767/health" -UseBasicParsing -TimeoutSec 5).Content } catch { "FAIL: $_" }

Write-Output "=== stack ==="
$s = try { (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/stack/status" -UseBasicParsing -TimeoutSec 10).Content } catch { "FAIL: $_" }
$s

Write-Output "=== processes ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object {
  "pid=$($_.ProcessId) $($_.CommandLine.Substring(0,[Math]::Min(90,$_.CommandLine.Length)))"
}

Write-Output "=== TTS ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/speech" -Method POST -Body '{"text":"hello","voice":"Serena"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  "$($r.StatusCode) $($r.RawContentLength) bytes"
} catch { "FAIL: $_" }

Write-Output "=== host ==="
try {
  $h = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 5).Content
  if ($h -match '"status":"online"') { "online" } else { $h.Substring(0,[Math]::Min(100,$h.Length)) }
} catch { "FAIL: $_" }

Write-Output "=== bundle ==="
$html = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/" -UseBasicParsing -TimeoutSec 5).Content
if ($html -match 'index-([A-Za-z0-9_-]+)\.js') { "index-$($Matches[1]).js" }