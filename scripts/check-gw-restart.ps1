$ErrorActionPreference = "Continue"
Write-Output "=== Gateway status ==="
docker ps --filter "name=hermes-gateway" --format "{{.Names}} {{.Status}}"

Write-Output "=== Gateway health ==="
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 10; "status=$($r.StatusCode) $($r.Content)" } catch { "FAIL: $_" }

Write-Output "=== Gateway models ==="
$key = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/models" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 10; "status=$($r.StatusCode)" } catch { "FAIL: $_" }

Write-Output "=== LLM test (gateway) ==="
Start-Sleep -Seconds 5
$body = '{"model":"auto","messages":[{"role":"user","content":"reply with exactly: OK"}],"max_tokens":5,"stream":false}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 120
  $j = $r.Content | ConvertFrom-Json
  "status=$($r.StatusCode) reply=$($j.choices[0].message.content)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { "HTTP $([int]$resp.StatusCode)" } else { "FAIL: $_" }
}

Write-Output "=== LLM test (via :6767 proxy) ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 120
  $j = $r.Content | ConvertFrom-Json
  "status=$($r.StatusCode) reply=$($j.choices[0].message.content)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { "HTTP $([int]$resp.StatusCode)" } else { "FAIL: $_" }
}

Write-Output "=== Gateway logs (recent, no stuck lock) ==="
docker logs hermes-gateway --since 30s 2>&1 | Select-String -Pattern "waiting|429|error|started|ready" | Select-Object -Last 5
