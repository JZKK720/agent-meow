$ErrorActionPreference = "Continue"
Write-Output "=== agent_meow processes ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object {
  "pid=$($_.ProcessId) cmd=$($_.CommandLine.Substring(0,[Math]::Min(110,$_.CommandLine.Length)))"
}

Write-Output "=== LLM via 6767 (was 429) ==="
$body = '{"model":"auto","messages":[{"role":"user","content":"say ok"}],"max_tokens":10}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 90
  "status=$($r.StatusCode) body=$($r.Content.Substring(0,[Math]::Min(300,$r.Content.Length)))"
} catch { $resp=$_.Exception.Response; if($resp){"HTTP $([int]$resp.StatusCode)"}else{"FAIL: $_"} }

Write-Output "=== host tunnel status ==="
try { (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 5).Content } catch { "FAIL: $_" }
