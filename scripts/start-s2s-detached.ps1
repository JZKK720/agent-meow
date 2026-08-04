#!/usr/bin/env powershell
# Permanently start the S2S voice server as a detached Windows process.
# The process survives terminal kills because it's not a child of any
# terminal — Start-Process creates an independent process.
#
# Output is redirected to a log file so crashes are diagnosable.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\start-s2s-detached.ps1
# Check:  netstat -an | findstr LISTENING | findstr 8765
# Logs:   dev\s2s-detached.log
# Stop:   taskkill /f /im speech-to-speech.exe

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$S2SExe = Join-Path $RepoRoot ".venv\Scripts\speech-to-speech.exe"
$LogFile = Join-Path $RepoRoot "dev\s2s-detached.log"
$HermesUrl = "http://127.0.0.1:8642/v1"
$HermesKey = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"

# Kill any existing S2S process first.
Get-Process -Name speech-to-speech -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Ensure the dev directory exists for the log file.
$devDir = Join-Path $RepoRoot "dev"
if (-not (Test-Path $devDir)) { New-Item -ItemType Directory -Path $devDir -Force | Out-Null }

Write-Host "Starting S2S voice server (detached) on :8765 ..." -ForegroundColor Cyan
Write-Host "  STT: faster-whisper (medium, multilingual auto-detect)" -ForegroundColor Gray
Write-Host "  TTS: Kokoro-82M (zf_xiaoyi for zh, af_heart for en)" -ForegroundColor Gray
Write-Host "  Log: $LogFile" -ForegroundColor Gray

$env:OPENAI_API_KEY = $HermesKey

# Force HuggingFace Hub offline mode so the Kokoro-82M TTS model loads from
# the local cache (~/.cache/huggingface/hub) instead of hanging on HEAD
# requests to huggingface.co when the network is unreachable.
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
# Force torch.hub offline mode so the Silero VAD model loads from the local
# cache (~/.cache/torch/hub) instead of hanging on HEAD requests to github.com
# when the network is unreachable. torch.hub still pings github.com even when
# the model is cached, unless this is set.
$env:TORCH_HUB_OFFLINE = "1"

# Start-Process with -RedirectStandardOutput and -RedirectStandardError
# creates a truly independent process — it does NOT die when the terminal
# that launched it exits. This is the key difference from `start /b`.
$proc = Start-Process -FilePath $S2SExe `
    -ArgumentList @(
    "--mode", "realtime",
    "--stt", "faster-whisper",
    "--faster_whisper_stt_model_name", "medium",
    "--faster_whisper_stt_device", "cpu",
    "--faster_whisper_stt_gen_max_new_tokens", "299",
    "--llm_backend", "chat-completions",
    "--tts", "kokoro",
    "--kokoro_voice", "zf_xiaoyi",
    "--kokoro_lang_code", "z",
    "--model_name", "hermes-agent",
    "--enable_lang_prompt",
    "--responses_api_base_url", $HermesUrl,
    "--responses_api_api_key", $HermesKey,
    "--language", "auto",
    "--speculative_reopen_ms", "1500"
) `
    -WorkingDirectory $RepoRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError (Join-Path $devDir "s2s-detached.err.log") `
    -PassThru

Write-Host "  PID: $($proc.Id)" -ForegroundColor Green
Write-Host "`nS2S server is starting (warmup ~60s). Check :8765 with:" -ForegroundColor Yellow
Write-Host "  netstat -an | findstr LISTENING | findstr 8765" -ForegroundColor Gray
Write-Host "`nTo stop:  taskkill /f /im speech-to-speech.exe" -ForegroundColor Gray
Write-Host "To view logs:  Get-Content dev\s2s-detached.log -Tail 20" -ForegroundColor Gray