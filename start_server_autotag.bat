@echo off
set HERMES_API_KEY=3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb
set HERMES_BASE_URL=http://127.0.0.1:8642/v1
set HERMES_VOICE_URL=http://127.0.0.1:8642
set AGENT_MEOW_BUILTIN_AGENT_DIRS=C:\Users\1\github-pr\agent-meow\examples\hermes-gateway\config.yaml
set AGENT_MEOW_AUTO_TAG=true
set AGENT_MEOW_AUTO_TAG_INTERVAL=300
set AGENT_MEOW_AUTO_TAG_BATCH=5
set AGENT_MEOW_AUTO_TAG_COOLDOWN=600
cd /d C:\Users\1\github-pr\agent-meow
C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe -m agent_meow server start
