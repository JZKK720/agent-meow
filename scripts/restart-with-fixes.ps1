$ErrorActionPreference = "Continue"
# Kill BOTH python trees serving agent-meow (venv + uv-python legacy).
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -match "agent_meow" } |
  ForEach-Object {
    Write-Output "killing $($_.ProcessId)"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
Start-Sleep -Seconds 3

$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
$env:AGENT_MEOW_DICTATION_ENGINE = "whisper"

Start-Process -FilePath "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" `
  -ArgumentList "-m","agent_meow","server","start" `
  -WorkingDirectory "C:\Users\1\github-pr\agent-meow" -WindowStyle Hidden
Start-Sleep -Seconds 20
& C:\Windows\System32\curl.exe -s -m 5 http://127.0.0.1:6767/health
& C:\Windows\System32\curl.exe -s -m 5 http://127.0.0.1:6767/version.json