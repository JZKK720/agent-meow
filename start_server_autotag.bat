@echo off
REM agent-meow server launcher with full voice pipeline env vars.
REM This file is the canonical restart script for the K16 dev machine.
REM The Hermes API key comes from web/.env (VITE_HERMES_API_KEY).

set HERMES_API_KEY=28765d337208aa3c0b6671cb1969e8cad9c22d7b7967b216
set HERMES_BASE_URL=http://127.0.0.1:8642/v1
set HERMES_VOICE_URL=http://127.0.0.1:8642
set AGENT_MEOW_BUILTIN_AGENT_DIRS=C:\Users\K16\github-pr\agent-meow\examples\hermes-gateway\config.yaml
set AGENT_MEOW_AUTO_TAG=true
set AGENT_MEOW_AUTO_TAG_INTERVAL=300
set AGENT_MEOW_AUTO_TAG_BATCH=5
set AGENT_MEOW_AUTO_TAG_COOLDOWN=600
set AGENT_MEOW_DICTATION_ENGINE=whisper
set AGENT_MEOW_DICTATION_WHISPER_URL=http://127.0.0.1:8001/inference
REM TTS routing: Edge TTS (Hermes) is primary, Qwen3-TTS is fallback.
REM QWENTTS_SERVER_URL points to the native Vulkan tts-server.exe (:8891).
set QWENTTS_SERVER_URL=http://127.0.0.1:8891
set QWENTTS_SERVER_EXE=C:\Users\K16\github-pr\qwentts.cpp\build\Release\tts-server.exe
set QWENTTS_MODEL=C:\Users\K16\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf
set QWENTTS_CODEC=C:\Users\K16\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf
set QWENTTS_LANG=auto
set QWENTTS_CODEC_CHUNK_DUR=10.0
set WHISPER_STT_URL=http://127.0.0.1:8001
set WHISPER_SERVER_EXE=C:\Users\K16\whisper.cpp\build\bin\Release\whisper-server.exe
set WHISPER_SERVER_MODEL=C:\Users\K16\AppData\Roaming\agent-meow\voice\models\ggml-large-v3-turbo.bin
REM UTF-8 console encoding (prevents GBK crash on Chinese text)
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
REM Keep Ollama models warm in VRAM for 30 minutes after last use.
set OLLAMA_KEEP_ALIVE=30m
REM Raise the harness idle turn watchdog from 600s to 900s so local Ollama
REM models processing large context windows don't get killed prematurely.
set HARNESS_TURN_TIMEOUT_S=900
cd /d C:\Users\K16\github-pr\agent-meow
C:\Users\K16\github-pr\agent-meow\.venv\Scripts\python.exe -m agent_meow server start
