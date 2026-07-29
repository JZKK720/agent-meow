#!/usr/bin/env powershell
# Launch speech-to-speech server with faster-whisper STT (Chinese support)
# and Kokoro TTS (Chinese male voice).
#
# Parakeet TDT only supports 25 European languages — NOT Chinese.
# faster-whisper with a multilingual model (e.g. large-v3) supports Chinese.
#
# Usage: .\scripts\start-speech-to-speech-zh.ps1
# The server runs at ws://localhost:8765/v1/realtime

param(
    [string]$WhisperModel = "medium",
    [string]$KokoroVoice = "zm_yunjian"
)

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
Write-Host "  STT: faster-whisper ($WhisperModel, multilingual, Chinese)" -ForegroundColor Gray
Write-Host "  LLM: Hermes gateway at $HermesUrl" -ForegroundColor Gray
Write-Host "  TTS: Kokoro-82M (local, CPU, male voice: $KokoroVoice)" -ForegroundColor Gray
Write-Host "  Language: zh (Chinese)" -ForegroundColor Gray
Write-Host ""

$env:OPENAI_API_KEY = $HermesKey
& $S2SExe `
    --mode realtime `
    --stt faster-whisper `
    --faster_whisper_stt_model_name $WhisperModel `
    --faster_whisper_stt_device cpu `
    --faster_whisper_stt_gen_language zh `
    --llm_backend chat-completions `
    --tts kokoro `
    --kokoro_voice $KokoroVoice `
    --kokoro_lang_code z `
    --model_name hermes-agent `
    --responses_api_base_url $HermesUrl `
    --responses_api_api_key $HermesKey `
    --language zh `
    --ws_port $WsPort