$ErrorActionPreference = "Continue"
Write-Output "=== Ollama :11434 direct ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -UseBasicParsing -TimeoutSec 5
  $tags = ($r.Content | ConvertFrom-Json).models
  Write-Output "  models loaded: $($tags.Count)"
  foreach ($t in $tags) { Write-Output "    $($t.name) size=$($t.size)" }
} catch { Write-Output "  FAIL: $_" }

Write-Output ""
Write-Output "=== Ollama chat (direct, small) ==="
$body = '{"model":"nemotron-3.5-lightning:30b-a3b","messages":[{"role":"user","content":"say OK"}],"stream":false}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 60
  $j = $r.Content | ConvertFrom-Json
  Write-Output "  status=$($r.StatusCode) reply=$($j.message.content.Substring(0,[Math]::Min(50,$j.message.content.Length)))"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { Write-Output "  HTTP $([int]$resp.StatusCode)" } else { Write-Output "  FAIL: $_" }
}

Write-Output ""
Write-Output "=== Hermes /v1/chat/completions (retry, with delay) ==="
$key = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
Start-Sleep -Seconds 3
$body2 = '{"model":"auto","messages":[{"role":"user","content":"reply OK"}],"max_tokens":5,"stream":false}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/chat/completions" -Method POST -Body $body2 -ContentType "application/json" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 120
  $j = $r.Content | ConvertFrom-Json
  Write-Output "  status=$($r.StatusCode) reply=$($j.choices[0].message.content)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { Write-Output "  HTTP $([int]$resp.StatusCode)" } else { Write-Output "  FAIL: $_" }
}

Write-Output ""
Write-Output "=== TTS :8891 correct endpoint ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8891/v1/audio/speech" -Method POST -Body '{"input":"hello","voice":"Vivian"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  Write-Output "  TTS /v1/audio/speech → $($r.StatusCode), $($r.RawContentLength) bytes"
} catch { Write-Output "  FAIL: $_" }
