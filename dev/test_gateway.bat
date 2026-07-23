@echo off
set OMNIGENT_SKIP_WEB_UI=true
cd /d C:\Users\1\github-pr\agent-meow
start /b .venv\Scripts\python.exe -m agent_meow server --port 6767 --host 127.0.0.1 > dev\gateway_output.log 2>&1
echo Server started, waiting 8 seconds...
timeout /t 8 /nobreak >nul
echo Checking port 6767...
netstat -an | findstr "6767"
echo === Server log (first 30 lines) ===
type dev\gateway_output.log | more +0
