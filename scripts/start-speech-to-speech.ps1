#!/usr/bin/env powershell
# Launch speech-to-speech server pointing at the Hermes gateway.
# This replaces Voicebox Docker + Web Speech API with a single unified
# VAD → STT → LLM → TTS pipeline.
#
# Usage: .\scripts\start-speech-to-speech.ps1
# The server runs at ws://localhost:8765/v1/realtime

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$S2SExe = Join-Path $RepoRoot ".venv\Scripts\speech-to-speech.exe"
$HermesUrl = "http://127.0.0.1:8642/v1"
$HermesKey = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$WsPort = 8765

if (-not (Test-Path $S2SExe)) {
    Write-Host "speech-to-speech not found. Install with:" -ForegroundColor Red
    Write-Host "  pip install `"speech-to-speech[kokoro]`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting speech-to-speech server on ws://localhost:$WsPort/v1/realtime" -ForegroundColor Cyan
Write-Host "  STT: Parakeet TDT (local, CPU)" -ForegroundColor Gray
Write-Host "  LLM: Hermes gateway at $HermesUrl" -ForegroundColor Gray
Write-Host "  TTS: Kokoro-82M (local, CPU, male voice: zm_yunjian)" -ForegroundColor Gray
Write-Host "  Language: zh (Chinese)" -ForegroundColor Gray
Write-Host ""

$env:OPENAI_API_KEY = $HermesKey
& $S2SExe `
    --mode realtime `
    --stt parakeet-tdt `
    --llm_backend chat-completions `
    --tts kokoro `
    --kokoro_voice zm_yunjian `
    --kokoro_lang_code z `
    --model_name hermes-agent `
    --responses_api_base_url $HermesUrl `
    --responses_api_api_key $HermesKey `
    --language zh `
    --ws_port $WsPort
