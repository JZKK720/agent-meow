@echo off
cd /d C:\Users\1\github-pr\agent-meow
del omnigent.db 2>nul
del agent_meow.db 2>nul
del "%USERPROFILE%\.omnigent\chat.db" 2>nul
echo DB cleaned

REM Kill any existing server processes on 6767 and 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":6767.*LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173.*LISTENING"') do taskkill /f /pid %%a 2>nul
echo Old servers killed

REM Start gateway server
set OMNIGENT_SKIP_WEB_UI=true
start /b .venv\Scripts\python.exe -m agent_meow server --port 6767 --host 127.0.0.1 > dev\gateway_output3.log 2>&1
echo Gateway started, waiting 10s...
timeout /t 10 /nobreak >nul

REM Start web dev server
cd web
start /b npx vite --port 5173 --host 127.0.0.1 > ..\dev\web_output2.log 2>&1
echo Web started, waiting 8s...
timeout /t 8 /nobreak >nul
cd ..

REM Check ports
echo === PORT CHECK ===
netstat -an | findstr "6767 5173" | findstr "LISTENING"

REM Run smoke test
echo === SMOKE TEST ===
.venv\Scripts\python.exe dev\smoke_test.py
