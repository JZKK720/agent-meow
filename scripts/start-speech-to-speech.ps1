#!/usr/bin/env powershell
# Launch speech-to-speech server pointing at the Hermes gateway.
# This replaces Voicebox Docker + Web Speech API with a single unified
# VAD → STT → LLM → TTS pipeline.
#
# Uses faster-whisper (multilingual, supports Chinese + English with auto-detect)
# instead of Parakeet TDT (which only supports 25 European languages, NOT Chinese).
# Language is auto-detected per utterance so mixed Chinese/English speech works:
# the STT detects each language, the LLM replies in the detected language, and
# Kokoro TTS auto-switches voice per language (zf_xiaoyi for zh, af_heart for en).
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
Write-Host "  STT: faster-whisper (medium, multilingual auto-detect)" -ForegroundColor Gray
Write-Host "  LLM: Hermes gateway at $HermesUrl" -ForegroundColor Gray
Write-Host "  TTS: Kokoro-82M (local, CPU, female voice: zf_xiaoyi)" -ForegroundColor Gray
Write-Host "  Language: auto (per-utterance auto-detect zh/en)" -ForegroundColor Gray
Write-Host ""

$env:OPENAI_API_KEY = $HermesKey
& $S2SExe `
    --mode realtime `
    --stt faster-whisper `
    --faster_whisper_stt_model_name medium `
    --faster_whisper_stt_device cpu `
    --faster_whisper_stt_gen_max_new_tokens 299 `
    --llm_backend chat-completions `
    --tts kokoro `
    --kokoro_voice zf_xiaoyi `
    --kokoro_lang_code z `
    --model_name hermes-agent `
    --enable_lang_prompt `
    --responses_api_base_url $HermesUrl `
    --responses_api_api_key $HermesKey `
    --language auto `
    --speculative_reopen_ms 1500 `
    --ws_port $WsPort
