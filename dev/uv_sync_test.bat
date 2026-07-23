@echo off
set OMNIGENT_SKIP_WEB_UI=true
cd /d C:\Users\1\github-pr\agent-meow
uv sync --extra all --extra dev
if errorlevel 1 exit /b 1
.venv\Scripts\python.exe dev\smoke_imports.py
