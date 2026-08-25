@echo off
REM === Stop agent-meow backend, web, and Qwen3-TTS ===
REM Hermes (:8642) and Ollama (:11434) are NOT stopped — they run in Docker.

echo Stopping agent-meow servers...
powershell -NoProfile -Command "foreach ($p in @(6767,8890,5173)) { $conns = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue; foreach ($c in $conns) { Write-Host "  Killing PID $($c.OwningProcess) on :$p"; Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"
echo Done.