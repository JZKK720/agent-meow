# Test voice pipeline through agent-meow server
$hermesKey = (Select-String -Path "c:\Users\1\github-pr\agent-meow\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1).Matches[0].Groups[1].Value.Trim()
$headers = @{ "Authorization" = "Bearer $hermesKey" }

# Test 1: TTS through agent-meow voice proxy
$body = '{"input":"你好，世界。","model":"qwen3-tts","voice":"Serena"}'
try {
  $r = Invoke-WebRequest -Uri 'http://127.0.0.1:6767/v1/audio/speech' -Method POST -Body $body -ContentType 'application/json' -Headers $headers -TimeoutSec 30 -UseBasicParsing
  Write-Output "TTS via agent-meow: $($r.StatusCode), $($r.Content.Length) bytes"
} catch {
  Write-Output "TTS via agent-meow: ERROR - $($_.Exception.Message)"
}

# Test 2: Health
try {
  $h = (Invoke-WebRequest -Uri 'http://127.0.0.1:6767/health' -UseBasicParsing -TimeoutSec 5).Content
  Write-Output "Health: $h"
} catch {
  Write-Output "Health: ERROR - $($_.Exception.Message)"
}

# Test 3: Stack status (with long timeout)
try {
  $s = (Invoke-WebRequest -Uri 'http://127.0.0.1:6767/v1/stack/status' -UseBasicParsing -TimeoutSec 60).Content
  Write-Output "Stack: $s"
} catch {
  Write-Output "Stack: ERROR - $($_.Exception.Message)"
}
