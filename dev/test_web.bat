@echo off
cd /d C:\Users\1\github-pr\agent-meow\web
start /b npx vite --port 5173 --host 127.0.0.1 > ..\dev\web_output.log 2>&1
echo Web dev server started, waiting 10 seconds...
timeout /t 10 /nobreak >nul
echo Checking port 5173...
netstat -an | findstr "5173"
echo.
echo === Web log (last 20 lines) ===
powershell -Command "Get-Content ..\dev\web_output.log -Tail 20"
