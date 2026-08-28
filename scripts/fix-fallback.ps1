$ErrorActionPreference = "Continue"
$dockerExe = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

Write-Output "=== Restarting hermes-gateway ==="
& $dockerExe restart hermes-gateway
Write-Output "Waiting 20s for startup..."
Start-Sleep -Seconds 20

Write-Output "=== Gateway status ==="
& $dockerExe ps --filter "name=hermes-gateway" --format "{{.Names}} {{.Status}}"

Write-Output "=== Health ==="
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 10; "status=$($r.StatusCode) $($r.Content)" } catch { "FAIL: $_" }

Write-Output "=== Models ==="
$key = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/models" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 10; "status=$($r.StatusCode)" } catch { "FAIL: $_" }

Write-Output "=== LLM test (gateway direct) ==="
$body = '{"model":"auto","messages":[{"role":"user","content":"reply with exactly: OK"}],"max_tokens":10,"stream":false}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 120
  $j = $r.Content | ConvertFrom-Json
  "status=$($r.StatusCode) reply=$($j.choices[0].message.content)"
  "model=$($j.model)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { "HTTP $([int]$resp.StatusCode)" } else { "FAIL: $_" }
}

Write-Output "=== LLM test (via :6767 proxy) ==="
try {
  $r2 = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 120
  $j2 = $r2.Content | ConvertFrom-Json
  "status=$($r2.StatusCode) reply=$($j2.choices[0].message.content)"
  "model=$($j2.model)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { "HTTP $([int]$resp.StatusCode)" } else { "FAIL: $_" }
}

Write-Output "=== Config verify ==="
$cfg = Get-Content "C:\Users\1\github-pr\hermes-agent\data\config.yaml" -Raw
if ($cfg -match "model: ornith-1.5:35b") { "fallback_model: ornith-1.5:35b (confirmed)" } else { "fallback_model: NOT SET" }
if ($cfg -match "default: nemotron-3.5-lightning:30b-a3b") { "primary: nemotron-3.5-lightning:30b-a3b (confirmed)" } else { "primary: NOT SET" }
