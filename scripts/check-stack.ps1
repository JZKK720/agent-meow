$ErrorActionPreference = "Continue"
$base = "http://127.0.0.1:6767"

Write-Output "=== health ==="
try { (Invoke-WebRequest -Uri "$base/health" -UseBasicParsing -TimeoutSec 5).Content } catch { "FAIL: $_" }

Write-Output "=== stack status ==="
try { (Invoke-WebRequest -Uri "$base/v1/stack/status" -UseBasicParsing -TimeoutSec 15).Content } catch { "FAIL: $_" }

Write-Output "=== hermes 8642 ==="
try { (Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 5).StatusCode } catch { "FAIL: $_" }

Write-Output "=== tts 8891 ==="
try { (Invoke-WebRequest -Uri "http://127.0.0.1:8891/health" -UseBasicParsing -TimeoutSec 5).StatusCode } catch { "FAIL: $_" }

Write-Output "=== TTS via proxy (POST /v1/audio/speech) ==="
try {
  $r = Invoke-WebRequest -Uri "$base/v1/audio/speech" -Method POST -Body '{"text":"hello","voice":"Serena"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  "status=$($r.StatusCode) bytes=$($r.RawContentLength) type=$($r.Headers['Content-Type'])"
} catch { "FAIL: $_" }

Write-Output "=== SPA bundle ==="
try {
  $html = (Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 5).Content
  if ($html -match 'index-([A-Za-z0-9_-]+)\.js') { "bundle: index-$($Matches[1]).js" }
} catch { "FAIL: $_" }
