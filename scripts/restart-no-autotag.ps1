# Clean restart: no AUTO_TAG, venv Python, proper voice stack env vars
# Usage: powershell -ExecutionPolicy Bypass -File scripts/restart-no-autotag.ps1

$ErrorActionPreference = "SilentlyContinue"

# Kill anything on the voice ports
foreach ($port in @(6767, 8001, 8890, 8891)) {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

# Clear the auto-tag flag — this is the key fix.
# The background_file_watcher (interval=300s) was poisoning Hermes state
# with spurious "friendly request" turns every 5 minutes.
$env:AGENT_MEOW_AUTO_TAG = $null

# Voice stack env vars
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"
$env:QWEN_TTS_URL        = "http://127.0.0.1:8890"
$env:QWENTTS_SERVER_EXE   = "C:\Users\K16\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWENTTS_MODEL        = "C:\Users\K16\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWENTTS_CODEC        = "C:\Users\K16\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:WHISPER_SERVER_EXE   = "C:\Users\K16\whisper.cpp\build\bin\Release\whisper-server.exe"
$env:WHISPER_SERVER_MODEL = "C:\Users\K16\AppData\Roaming\agent-meow\voice\models\ggml-large-v3-turbo.bin"
$env:WHISPER_STT_URL      = "http://127.0.0.1:8001"
$env:HERMES_VOICE_URL      = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL       = "http://127.0.0.1:8642/v1"

# Start with venv Python (has requests, fastapi, uvicorn for the TTS wrapper)
& ".\.venv\Scripts\python.exe" -m agent_meow server --host 127.0.0.1 --port 6767 `
    --database-uri "sqlite:///C:/Users/K16/.agent-meow/chat.db"
