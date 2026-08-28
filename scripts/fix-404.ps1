$ErrorActionPreference = "Continue"
# Kill all agent_meow processes
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 3

# Restart with env vars
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
Start-Process -FilePath "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" -ArgumentList "-m","agent_meow","server","start" -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 15

# Verify
$curl = "C:\Windows\System32\curl.exe"
Write-Output "=== health ==="
& $curl -s http://127.0.0.1:6767/health

Write-Output ""
Write-Output "=== agents (check hermes-gateway registered) ==="
& $curl -s http://127.0.0.1:6767/v1/agents 2>&1 | Select-String "hermes" | Select-Object -First 3

Write-Output ""
Write-Output "=== LLM test via proxy ==="
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("C:\Users\1\github-pr\agent-meow\llm-fix.json", '{"model":"auto","messages":[{"role":"user","content":"reply with exactly: OK"}],"max_tokens":10,"stream":false}', $utf8NoBom)
& $curl -s --max-time 120 -X POST http://127.0.0.1:6767/v1/chat/completions -H "Content-Type: application/json" -d "@C:\Users\1\github-pr\agent-meow\llm-fix.json"

Remove-Item "C:\Users\1\github-pr\agent-meow\llm-fix.json" -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\1\github-pr\agent-meow\llm-404.json" -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\1\github-pr\agent-meow\responses-test.json" -Force -ErrorAction SilentlyContinue
