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
#   2. S2S voice server  :8765  (offline: faster-whisper + Hermes LLM + Kokoro TTS)
#   3. QAA gateway      :3101   (online: DashScope cloud, offline: S2S)
#   4. Vite dev server   :5173  (hot-reload frontend)
#
# Hermes (:8642) is assumed to be already running (external).
# QAA (:3101) is started separately via start-qaa.bat or qwenaudio CLI.
# All processes run as child processes of this script —
# they stay alive as long as this PowerShell window stays open.
# Press Ctrl+C to stop all.
#
# Mode: The S2S server provides offline STT+TTS and connects to Hermes
# for the LLM (with MeowCat persona). QAA can switch between:
#   - Online: DashScope cloud (qwen-audio-3.0-realtime-flash) — needs API key
#   - Offline: S2S server (:8765) — local STT + Hermes LLM + local TTS
# The switch is per-session via QAA's connect event `provider` field.

param(
    [string]$Profile = ""  # auto-detect if empty
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$S2SExe = Join-Path $RepoRoot ".venv\Scripts\speech-to-speech.exe"
$OmniExe = Join-Path $RepoRoot ".venv\Scripts\omni.exe"
# We launch S2S via the patches wrapper (scripts/run_s2s_with_patches.py) so the
# voice patches (markdown strip, non-fatal warmup, extended timeout) are applied
# before the S2S pipeline imports its handlers.
# Hermes (:8642) is the LLM brain, accessed by QAA via ACP — not by S2S directly.

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
foreach ($exe in @($S2SExe, $OmniExe)) {
    if (-not (Test-Path $exe)) {
        Write-Host "Missing: $exe" -ForegroundColor Red
        exit 1
    }
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
Get-Process -Name omni, speech-to-speech, node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ── 1. Gateway (:6767) ─────────────────────────────────────────────────────
Write-Host "`nStarting gateway on :6767 ..." -ForegroundColor Cyan
$gatewayArgs = @("server", "--port", "6767", "--agent", (Join-Path $RepoRoot "examples\hermes-gateway\config.yaml"))
$gatewayProc = Start-Process -FilePath $OmniExe -ArgumentList $gatewayArgs -WorkingDirectory $RepoRoot -PassThru -NoNewWindow
Start-Sleep -Seconds 5
Write-Host "  Gateway PID: $($gatewayProc.Id)" -ForegroundColor Gray

# ── 2. Local-realtime servers (plan 011) ────────────────────────────────────
# Three servers that replace S2S entirely:
#   :8888 — Qwen3-ASR (GPU STT)
#   :8889 — Qwen3-TTS (GPU TTS)
#   :8890 — Local-realtime WebSocket orchestrator (QAA connects here)
# ALL LLM goes through Hermes ACP (:8642) with 橘宝 persona.

Write-Host "Starting local-realtime servers (plan 011)..." -ForegroundColor Cyan

# :8888 — Qwen3-ASR
Write-Host "  Qwen3-ASR on :8888 (GPU STT)..." -ForegroundColor Gray
$asrProc = Start-Process -FilePath $VenvPython -ArgumentList @(
    (Join-Path $RepoRoot "scripts\serve-qwen3-asr.py"),
    "--port", "8888"
) -WorkingDirectory $RepoRoot -PassThru -NoNewWindow

# :8889 — Qwen3-TTS
Write-Host "  Qwen3-TTS on :8889 (GPU TTS)..." -ForegroundColor Gray
$ttsProc = Start-Process -FilePath $VenvPython -ArgumentList @(
    (Join-Path $RepoRoot "scripts\serve-qwen3-tts.py"),
    "--port", "8889"
) -WorkingDirectory $RepoRoot -PassThru -NoNewWindow

# :8890 — Local-realtime orchestrator (QAA connects here as S2S)
Write-Host "  Local-realtime on :8890 (QAA endpoint)..." -ForegroundColor Gray
$rtProc = Start-Process -FilePath $VenvPython -ArgumentList @(
    (Join-Path $RepoRoot "scripts\serve-local-realtime.py"),
    "--port", "8890"
) -WorkingDirectory $RepoRoot -PassThru -NoNewWindow

# ── 3. Vite dev server (:5173) ─────────────────────────────────────────────
Write-Host "Starting Vite dev server on :5173 ..." -ForegroundColor Cyan
$webDir = Join-Path $RepoRoot "web"
$viteProc = Start-Process -FilePath "cmd" -ArgumentList @("/c", "npx vite --port 5173 --host 127.0.0.1") -WorkingDirectory $webDir -PassThru -NoNewWindow
Start-Sleep -Seconds 3
Write-Host "  Vite PID: $($viteProc.Id)" -ForegroundColor Gray

# ── Wait for local-realtime to be ready ────────────────────────────────────
Write-Host "`nWaiting for local-realtime servers to warm up..." -ForegroundColor Yellow
$rtReady = $false
for ($i = 0; $i -lt 36; $i++) {
    Start-Sleep -Seconds 5
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:8765/v1/pool" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { $s2sReady = $true; break }
    }
    catch {}
    Write-Host "  ... waiting ($($i*5)s)" -ForegroundColor DarkGray
}

if ($s2sReady) {
    Write-Host "`nAll servers are UP!" -ForegroundColor Green
}
else {
    Write-Host "`nS2S still warming up (check its console output)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Voice Stack Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Hermes LLM    :8642  $(if ($hermesUp) {'UP'} else {'DOWN'})" -ForegroundColor $(if ($hermesUp) { 'Green' } else { 'Red' })
Write-Host " Gateway       :6767  UP (PID $($gatewayProc.Id))" -ForegroundColor Green
Write-Host " S2S voice     :8765  $(if ($s2sReady) {'UP'} else {'WARMING'}) (PID $($s2sProc.Id))" -ForegroundColor $(if ($s2sReady) { 'Green' } else { 'Yellow' })
Write-Host " Vite dev      :5173  UP (PID $($viteProc.Id))" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nBrowser:  http://127.0.0.1:5173/" -ForegroundColor White
Write-Host "Voice:    Click the paw button to start/stop" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop all servers.`n" -ForegroundColor Cyan

# ── Keep alive — wait for all child processes ───────────────────────────────
try {
    while ($true) {
        Start-Sleep -Seconds 5
        if ($gatewayProc.HasExited -and $s2sProc.HasExited -and $viteProc.HasExited) {
            Write-Host "All servers have exited." -ForegroundColor Yellow
            break
        }
        if ($gatewayProc.HasExited) { Write-Host "Gateway exited!" -ForegroundColor Red }
        if ($s2sProc.HasExited) { Write-Host "S2S exited!" -ForegroundColor Red }
        if ($viteProc.HasExited) { Write-Host "Vite exited!" -ForegroundColor Red }
    }
}
finally {
    # Clean up on exit
    Get-Process -Id $gatewayProc.Id, $s2sProc.Id, $viteProc.Id -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All servers stopped." -ForegroundColor Yellow
}