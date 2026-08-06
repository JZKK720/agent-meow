#!/usr/bin/env powershell
# Start all voice-stack servers and keep them running.
# Usage: .\scripts\start-voice-stack.ps1
#        .\scripts\start-voice-stack.ps1 -Profile k16-strix-halo
#        .\scripts\start-voice-stack.ps1 -Profile r16-hx470-5060
#
# Auto-detects the platform profile unless -Profile is specified.
# Profiles live in profiles/<name>.yaml and configure:
#   - STT model (Qwen3-ASR-1.7B for K16, Qwen3-ASR-0.6B for HX470)
#   - LLM model + quantization
#   - GPU backend (ROCm vs CUDA)
#   - VRAM budget
#
# Starts:
#   1. Gateway          :6767  (omni server)
#   2. Vite dev server   :5173  (hot-reload frontend)
#
# Hermes (:8642) is assumed to be already running (external).
# QAA (:3101) is started separately via start-qaa.bat or qwenaudio CLI.
# All processes run as child processes of this script —
# they stay alive as long as this PowerShell window stays open.
# Press Ctrl+C to stop all.
#
# Mode: Voice STT/TTS will be wired directly to the Hermes gateway voice API
# (/v1/audio/transcriptions + /v1/audio/speech) in Phase A. Until then,
# the voice surface returns a not-configured error. QAA (:3101) remains the
# realtime voice orchestrator for the browser (online via DashScope, offline
# TBD via Hermes voice endpoints).

param(
    [string]$Profile = ""  # auto-detect if empty
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$OmniExe = Join-Path $RepoRoot ".venv\Scripts\omni.exe"

# SoX is required by qwen_tts for audio processing
$SoxDir = "C:\Users\1\sox\sox-14.4.2"
if (Test-Path $SoxDir) {
    $env:PATH = "$SoxDir;" + $env:PATH
    Write-Host "SoX found at: $SoxDir" -ForegroundColor Gray
}

# ── Platform profile detection ─────────────────────────────────────────────
if (-not $Profile) {
    $Profile = & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "detect-platform.ps1")
    if (-not $Profile -or $Profile -eq "unknown") {
        Write-Host "Could not detect platform. Specify -Profile <name>." -ForegroundColor Red
        Write-Host "Available profiles:" -ForegroundColor Yellow
        Get-ChildItem (Join-Path $RepoRoot "profiles") -Filter "*.yaml" | ForEach-Object { Write-Host "  $($_.BaseName)" }
        exit 1
    }
}

$ProfilePath = Join-Path $RepoRoot "profiles\$Profile.yaml"
if (-not (Test-Path $ProfilePath)) {
    Write-Host "Profile not found: $ProfilePath" -ForegroundColor Red
    exit 1
}

Write-Host "Platform profile: $Profile" -ForegroundColor Magenta
Write-Host "  Config: $ProfilePath" -ForegroundColor Gray

# Read key profile settings (simple YAML parse for the fields we need)
$profileContent = Get-Content $ProfilePath -Raw
$sttModel = if ($profileContent -match 'model:\s*"(Qwen/[^"]+)"') { $matches[1] } else { "Qwen/Qwen3-ASR-1.7B" }
$llmModel = if ($profileContent -match 'model:\s*"(qwen3\.6[^"]+)"') { $matches[1] } else { "qwen3.6:35b-a3b-q8_0" }
$gpuBackend = if ($profileContent -match 'backend:\s*(rocm|cuda)') { $matches[1] } else { "rocm" }

# Set GPU environment per profile
if ($gpuBackend -eq "rocm") {
    $env:HIP_VISIBLE_DEVICES = "0"
    Write-Host "  GPU backend: ROCm 7.1 (HIP_VISIBLE_DEVICES=0)" -ForegroundColor Gray
}
elseif ($gpuBackend -eq "cuda") {
    $env:CUDA_VISIBLE_DEVICES = "0"
    Write-Host "  GPU backend: CUDA (CUDA_VISIBLE_DEVICES=0)" -ForegroundColor Gray
}

Write-Host "  STT: $sttModel" -ForegroundColor Gray
Write-Host "  LLM: $llmModel" -ForegroundColor Gray
Write-Host ""

# ── Pre-flight checks ──────────────────────────────────────────────────────
if (-not (Test-Path $OmniExe)) {
    Write-Host "Missing: $OmniExe" -ForegroundColor Red
    exit 1
}

# Check Hermes is up
$hermesUp = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $hermesUp = $true }
}
catch {}
if (-not $hermesUp) {
    Write-Host "WARNING: Hermes gateway at :8642 is not responding." -ForegroundColor Yellow
    Write-Host "  Start it first, then re-run this script." -ForegroundColor Yellow
    exit 1
}
Write-Host "Hermes gateway :8642  OK" -ForegroundColor Green

# ── Kill any stale instances ────────────────────────────────────────────────
Get-Process -Name omni, node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ── 1. Gateway (:6767) ─────────────────────────────────────────────────────
Write-Host "`nStarting gateway on :6767 ..." -ForegroundColor Cyan
$gatewayArgs = @("server", "--port", "6767", "--agent", (Join-Path $RepoRoot "examples\hermes-gateway\config.yaml"))
$gatewayProc = Start-Process -FilePath $OmniExe -ArgumentList $gatewayArgs -WorkingDirectory $RepoRoot -PassThru -NoNewWindow
Start-Sleep -Seconds 5
Write-Host "  Gateway PID: $($gatewayProc.Id)" -ForegroundColor Gray

# ── 2. Vite dev server (:5173) ─────────────────────────────────────────────
Write-Host "Starting Vite dev server on :5173 ..." -ForegroundColor Cyan
$webDir = Join-Path $RepoRoot "web"
$viteProc = Start-Process -FilePath "cmd" -ArgumentList @("/c", "npx vite --port 5173 --host 127.0.0.1") -WorkingDirectory $webDir -PassThru -NoNewWindow
Start-Sleep -Seconds 3
Write-Host "  Vite PID: $($viteProc.Id)" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Voice Stack Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Hermes LLM    :8642  $(if ($hermesUp) {'UP'} else {'DOWN'})" -ForegroundColor $(if ($hermesUp) { 'Green' } else { 'Red' })
Write-Host " Gateway       :6767  UP (PID $($gatewayProc.Id))" -ForegroundColor Green
Write-Host " Vite dev      :5173  UP (PID $($viteProc.Id))" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nBrowser:  http://127.0.0.1:5173/" -ForegroundColor White
Write-Host "Voice:    Click the paw button to start/stop" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop all servers.`n" -ForegroundColor Cyan

# ── Keep alive — wait for all child processes ───────────────────────────────
try {
    while ($true) {
        Start-Sleep -Seconds 5
        if ($gatewayProc.HasExited -and $viteProc.HasExited) {
            Write-Host "All servers have exited." -ForegroundColor Yellow
            break
        }
        if ($gatewayProc.HasExited) { Write-Host "Gateway exited!" -ForegroundColor Red }
        if ($viteProc.HasExited) { Write-Host "Vite exited!" -ForegroundColor Red }
    }
}
finally {
    # Clean up on exit
    Get-Process -Id $gatewayProc.Id, $viteProc.Id -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All servers stopped." -ForegroundColor Yellow
}