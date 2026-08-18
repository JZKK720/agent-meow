@echo off
REM === Check all agent-meow server ports ===
echo === Server Status ===
for %%p in (6767 8889 5173 8642 11434) do (
    netstat -ano | findstr ":%%p " | findstr "LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   :%%p  UP
    ) else (
        echo   :%%p  DOWN
    )
)
echo.
REM Show health if backend is up
netstat -ano | findstr ":6767 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    "%PYTHON%" -c "import urllib.request; r=urllib.request.urlopen('http://127.0.0.1:6767/v1/info',timeout=3); print('Backend health:', r.status)"
) else (
    echo Backend is DOWN - run dev\start-servers.bat
)