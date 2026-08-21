# Start the GPU Qwen3-TTS server (installed by install-qwen-tts-gpu.ps1).
#
# Binds 0.0.0.0 so Docker containers can reach it via host.docker.internal.
# The model loads on first start (~30s); subsequent starts are faster.

param(
    [int]$Port = 8890,
    [string]$Host_ = "0.0.0.0"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv-tts-gpu\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "ERROR: .venv-tts-gpu not found. Run scripts\install-qwen-tts-gpu.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "[qwen-tts-gpu] Starting server on ${Host_}:${Port} (model loads on first request)..."
& $VenvPython (Join-Path $RepoRoot "scripts\qwen3_tts_server.py") --port $Port --host $Host_
