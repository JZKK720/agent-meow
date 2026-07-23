@echo off
set OMNIGENT_SKIP_WEB_UI=true
cd /d C:\Users\1\github-pr\agent-meow
uv sync --extra all --extra dev
