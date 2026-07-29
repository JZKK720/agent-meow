#!/usr/bin/env powershell
# Launch speech-to-speech server with Qwen3-TTS (Chinese male voice).
#
# Qwen3-TTS CustomVoice speakers (Chinese-capable):
#   aiden      — male, general Chinese (default)
#   dylan      — male, Beijing dialect
#   eric       — male, Sichuan dialect
#   uncle_fu   — male, older voice
#   serena     — female
#   vivian     — female
#
# Usage: .\scripts\start-speech-to-speech-qwen3.ps1
# The server runs at ws://localhost:8765/v1/realtime
#
# Prerequisites:
#   - pip install qwentts-cpp-python (ggml backend, needed on CPU)
#   - OR a CUDA GPU (torch backend with --qwen3_tts_backend torch)
#   - The model downloads automatically from HuggingFace on first run (~4.3 GB)

param(
    [string]$Speaker = "aiden",
    [string]$Device = "cpu"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$S2SExe = Join-Path $RepoRoot ".venv\Scripts\speech-to-speech.exe"
$HermesUrl = "http://127.0.0.1:8642/v1"
$HermesKey = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$WsPort = 8765
$ModelName = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"

if (-not (Test-Path $S2SExe)) {
    Write-Host "speech-to-speech not found. Install with:" -ForegroundColor Red
    Write-Host "  pip install `"speech-to-speech[qwen3]`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting speech-to-speech server on ws://localhost:$WsPort/v1/realtime" -ForegroundColor Cyan
Write-Host "  STT: Parakeet TDT (local, CPU)" -ForegroundColor Gray
Write-Host "  LLM: Hermes gateway at $HermesUrl" -ForegroundColor Gray
Write-Host "  TTS: Qwen3-TTS 1.7B CustomVoice ($Device, speaker: $Speaker)" -ForegroundColor Gray
Write-Host "  Language: zh (Chinese)" -ForegroundColor Gray
Write-Host ""

$env:OPENAI_API_KEY = $HermesKey
& $S2SExe `
    --mode realtime `
    --stt parakeet-tdt `
    --llm_backend chat-completions `
    --tts qwen3 `
    --qwen3_tts_model_name $ModelName `
    --qwen3_tts_device $Device `
    --qwen3_tts_backend ggml `
    --qwen3_tts_speaker $Speaker `
    --qwen3_tts_language chinese `
    --model_name hermes-agent `
    --responses_api_base_url $HermesUrl `
    --responses_api_api_key $HermesKey `
    --language zh `
    --ws_port $WsPort