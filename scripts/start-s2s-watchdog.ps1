#!/usr/bin/env powershell
# S2S Voice Server Watchdog — auto-restarts the S2S server if it crashes.
#
# The S2S server crashes whenever Hermes (:8642) goes down — the LLM handler
# raises ConnectError and the process exits. This watchdog monitors the S2S
# process and restarts it after a cooldown when it dies.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\start-s2s-watchdog.ps1
# Stop:   taskkill /f /im powershell.exe /fi "WINDOWTITLE eq S2S-Watchdog"  (or just Ctrl+C)
#
# The watchdog runs in the foreground — keep this terminal open.
# For detached mode, use start-s2s-detached.ps1 instead.

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$S2SExe = Join-Path $RepoRoot ".venv\Scripts\speech-to-speech.exe"
$HermesUrl = "http://127.0.0.1:8642/v1"
$HermesKey = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$LogDir = Join-Path $RepoRoot "dev"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$env:OPENAI_API_KEY = $HermesKey

$s2sArgs = @(
    "--mode", "realtime",
    "--stt", "faster-whisper",
    "--faster_whisper_stt_model_name", "medium",
    "--faster_whisper_stt_device", "cpu",
    "--llm_backend", "chat-completions",
    "--tts", "kokoro",
    "--kokoro_voice", "zf_xiaoyi",
    "--kokoro_lang_code", "z",
    "--model_name", "hermes-agent",
    "--enable_lang_prompt",
    "--responses_api_base_url", $HermesUrl,
    "--responses_api_api_key", $HermesKey,
    "--language", "auto"
)

$restartCount = 0
$maxRestarts = 50
$baseDelay = 5   # seconds
$maxDelay = 300  # 5 minutes

Write-Host "S2S Voice Server Watchdog" -ForegroundColor Cyan
Write-Host "  Auto-restarts on crash. Ctrl+C to stop." -ForegroundColor Gray
Write-Host "  TTS: zf_xiaoyi (zh female) / af_heart (en female)" -ForegroundColor Gray
Write-Host ""

while ($true) {
    if ($restartCount -ge $maxRestarts) {
        Write-Host "Max restarts ($maxRestarts) reached. Stopping." -ForegroundColor Red
        break
    }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logFile = Join-Path $LogDir "s2s-watchdog-$($restartCount).log"
    $errFile = Join-Path $LogDir "s2s-watchdog-$($restartCount).err.log"

    Write-Host "[$timestamp] Starting S2S server (attempt $($restartCount + 1))..." -ForegroundColor Green

    $proc = Start-Process -FilePath $S2SExe `
        -ArgumentList $s2sArgs `
        -WorkingDirectory $RepoRoot `
        -NoNewWindow `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError $errFile `
        -PassThru

    Write-Host "  PID: $($proc.Id)  Log: $errFile" -ForegroundColor Gray

    # Wait for the process to exit.
    $proc.WaitForExit()

    $exitCode = $proc.ExitCode
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    if ($exitCode -eq 0) {
        Write-Host "[$timestamp] S2S exited cleanly (code 0). Stopping watchdog." -ForegroundColor Green
        break
    }

    $restartCount++
    $delay = [Math]::Min($baseDelay * [Math]::Pow(2, $restartCount - 1), $maxDelay)

    Write-Host "[$timestamp] S2S crashed (exit code $exitCode). Restarting in $delay s..." -ForegroundColor Yellow
    Start-Sleep -Seconds $delay
}