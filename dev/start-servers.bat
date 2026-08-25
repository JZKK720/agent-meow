@echo off
REM === agent-meow permanent server launcher ===
REM Uses PowerShell Start-Process to create detached hidden processes
REM that survive terminal/VS Code close. Run once at startup.

set REPO=c:\Users\1\github-pr\agent-meow

echo Starting agent-meow servers as detached processes...

REM Kill existing instances on these ports
powershell -NoProfile -Command "foreach ($p in @(6767,8890,5173)) { $conns = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue; foreach ($c in $conns) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"

powershell -NoProfile -Command "Start-Sleep -Seconds 2"

REM Backend :6767
powershell -NoProfile -Command "$repo='%REPO%'; $uv='C:\Users\1\.local\bin\uv.exe'; Start-Process -FilePath powershell -ArgumentList '-NoProfile -WindowStyle Hidden -Command \"cd ''$repo''; & ''$uv'' run python -m agent_meow server --port 6767 --host 127.0.0.1 *>&1 | Out-File -Encoding utf8 ''$repo\dev\backend.log'''\" -WindowStyle Hidden"

REM Qwen3-TTS :8890 (qwentts_wrapper)
powershell -NoProfile -Command "$repo='%REPO%'; $uv='C:\Users\1\.local\bin\uv.exe'; Start-Process -FilePath powershell -ArgumentList '-NoProfile -WindowStyle Hidden -Command "cd ''$repo''; & ''$uv'' run python -m uvicorn scripts.qwentts_wrapper:app --port 8890 --host 127.0.0.1 *>&1 | Out-File -Encoding utf8 ''$repo\dev\qwen-tts.log'''" -WindowStyle Hidden"

REM Web/Vite :5173
powershell -NoProfile -Command "$repo='%REPO%'; Start-Process -FilePath powershell -ArgumentList '-NoProfile -WindowStyle Hidden -Command \"cd ''$repo\web''; npm.cmd run dev -- --host *>&1 | Out-File -Encoding utf8 ''$repo\dev\web.log'''\" -WindowStyle Hidden"

powershell -NoProfile -Command "Start-Sleep -Seconds 10; Write-Host '=== Port Status ==='; $ports = @(5173,6767,8642,8890,11434); foreach ($p in $ports) { $up = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue; if ($up) { Write-Host "  :$p UP" } else { Write-Host "  :$p DOWN" } }"

echo.
echo Servers started as detached processes.
echo Web UI: http://localhost:5173/
echo Check: dev\check-servers.bat
echo Stop:  dev\stop-servers.bat