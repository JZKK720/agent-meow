@echo off
set OMNIGENT_SKIP_WEB_UI=true
cd /d C:\Users\1\github-pr\agent-meow
.venv\Scripts\python.exe -m agent_meow server --port 6767 --host 127.0.0.1
