@echo off
cd /d C:\Users\1\github-pr\agent-meow\web
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173.*LISTENING"') do taskkill /f /pid %%a 2>nul
timeout /t 2 /nobreak >nul
start /b npx vite --port 5173 --host 127.0.0.1 > ..\dev\web_output3.log 2>&1
echo Web started, waiting 10s...
timeout /t 10 /nobreak >nul
echo === PORT CHECK ===
netstat -an | findstr "5173" | findstr "LISTENING"
echo === WEB LOG ===
powershell -Command "Get-Content ..\dev\web_output3.log -Tail 10"