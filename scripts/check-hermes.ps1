$ErrorActionPreference = "Continue"
Write-Output "=== hermes 8642 direct ==="
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 5; "status=$($r.StatusCode) body=$($r.Content)" } catch { "FAIL: $_" }

Write-Output "=== hermes models (auth check) ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/models" -Headers @{Authorization="Bearer 3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"} -UseBasicParsing -TimeoutSec 5
  "status=$($r.StatusCode)"
} catch { $resp=$_.Exception.Response; if($resp){"HTTP $([int]$resp.StatusCode)"}else{"FAIL: $_"} }

Write-Output "=== LLM via gateway ==="
$body = '{"model":"auto","messages":[{"role":"user","content":"say ok"}],"max_tokens":10}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer 3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"} -UseBasicParsing -TimeoutSec 60
  "status=$($r.StatusCode) body=$($r.Content.Substring(0,[Math]::Min(200,$r.Content.Length)))"
} catch { $resp=$_.Exception.Response; if($resp){"HTTP $([int]$resp.StatusCode)"}else{"FAIL: $_"} }

Write-Output "=== LLM via 6767 proxy ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 60
  "status=$($r.StatusCode) body=$($r.Content.Substring(0,[Math]::Min(200,$r.Content.Length)))"
} catch { $resp=$_.Exception.Response; if($resp){"HTTP $([int]$resp.StatusCode)"}else{"FAIL: $_"} }

Write-Output "=== python processes (server + host runner) ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | ForEach-Object {
  $cmd = $_.CommandLine
  if ($cmd -match "agent_meow") { "pid=$($_.ProcessId) cmd=$($cmd.Substring(0,[Math]::Min(120,$cmd.Length)))" }
}
