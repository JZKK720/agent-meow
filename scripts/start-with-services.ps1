# Start agent-meow server with all voice pipeline env vars configured.
# Hermes gateway: :8642, TTS server: :8891, whisper-server (Vulkan STT): :8080
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642"
$env:HERMES_API_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$env:QWEN_TTS_URL = "http://127.0.0.1:8891"
$env:WHISPER_STT_URL = "http://127.0.0.1:8080"

& "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" -m agent_meow server start
