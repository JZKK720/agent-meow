@echo off
set OMNIGENT_SKIP_WEB_UI=true
cd /d C:\Users\1\github-pr\agent-meow
start /b .venv\Scripts\python.exe -m agent_meow server --port 6767 --host 127.0.0.1 > dev\gateway_output2.log 2>&1
echo Server started, waiting 10 seconds...
timeout /t 10 /nobreak >nul
echo Checking port 6767...
netstat -an | findstr "6767"
echo.
echo === Server log (last 30 lines) ===
powershell -Command "Get-Content dev\gateway_output2.log -Tail 30"
