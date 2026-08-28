$ErrorActionPreference = "Continue"
# Kill all agent_meow processes and restart with env vars
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 3

$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
Start-Process -FilePath "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" -ArgumentList "-m","agent_meow","server","start" -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 15

# Now test TTS with clean state
$curl = "C:\Windows\System32\curl.exe"
$health = & $curl -s http://127.0.0.1:6767/health
Write-Output "health: $health"

$ttsCode = & $curl -s --max-time 30 -X POST http://127.0.0.1:6767/v1/audio/speech -H "Content-Type: application/json" -d "@C:\Users\1\github-pr\agent-meow\tts-verify.json" -o "C:\Users\1\github-pr\agent-meow\tts-verify.bin" -w "%{http_code}"
$ttsSize = (Get-Item "C:\Users\1\github-pr\agent-meow\tts-verify.bin" -ErrorAction SilentlyContinue).Length
Write-Output "TTS: HTTP $ttsCode, $ttsSize bytes"

# Also test LLM
$llmBody = '{"model":"auto","messages":[{"role":"user","content":"reply with exactly: OK"}],"max_tokens":10,"stream":false}'
[System.IO.File]::WriteAllText("C:\Users\1\github-pr\agent-meow\llm-verify.json", $llmBody, (New-Object System.Text.UTF8Encoding $false))
$llm = & $curl -s --max-time 120 -X POST http://127.0.0.1:6767/v1/chat/completions -H "Content-Type: application/json" -d "@C:\Users\1\github-pr\agent-meow\llm-verify.json"
Write-Output "LLM: $($llm.Substring(0, [Math]::Min(200, $llm.Length)))"

# Cleanup
Remove-Item "C:\Users\1\github-pr\agent-meow\tts-verify.json","C:\Users\1\github-pr\agent-meow\tts-verify.bin","C:\Users\1\github-pr\agent-meow\llm-verify.json" -Force -ErrorAction SilentlyContinue
