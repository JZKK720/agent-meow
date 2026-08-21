# One-shot native Windows bootstrap for agent-meow + GPU Qwen3-TTS.
#
# Pulls and installs the full native runtime stack from scratch:
#   1. Git-clones (or updates) the agent-meow repo
#   2. Installs uv if missing, then `uv sync` the main venv
#   3. Runs scripts\install-qwen-tts-gpu.ps1 (GPU-detected torch:
#      AMD gfx1151 Strix Halo iGPU / NVIDIA CUDA / CPU fallback)
#   4. Optionally starts the whole stack (TTS + agent-meow server)
#
# Usage (fresh machine, admin NOT required):
#   powershell -ExecutionPolicy Bypass -File scripts\install-agent-meow-native.ps1
#
# Options:
#   -RepoUrl https://github.com/<you>/agent-meow.git
#   -InstallDir C:\agent-meow
#   -SkipTTS        (skip the GPU TTS install)
#   -Start          (start TTS + agent-meow after install)

param(
    [string]$RepoUrl = "https://github.com/omnigent-ai/omnigent.git",
    [string]$InstallDir = "",
    [switch]$SkipTTS,
    [switch]$Start
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "[install] $msg" -ForegroundColor Cyan }
function Test-Port($p) {
    (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

# ── 1. Locate or clone the repo ───────────────────────────────────────────
if (-not $InstallDir) {
    # Default: install beside the current repo's parent (or cwd if standalone).
    if ($PSScriptRoot -and (Test-Path (Join-Path (Split-Path -Parent $PSScriptRoot) "pyproject.toml"))) {
        $InstallDir = Split-Path -Parent $PSScriptRoot   # running from inside the repo
    } else {
        $InstallDir = Join-Path $env:USERPROFILE "agent-meow"
    }
}

if (Test-Path (Join-Path $InstallDir "pyproject.toml")) {
    Write-Step "Repo already present at $InstallDir — pulling latest..."
    Push-Location $InstallDir
    git pull --ff-only 2>&1 | Select-Object -Last 1
    Pop-Location
} else {
    Write-Step "Cloning $RepoUrl → $InstallDir..."
    git clone $RepoUrl $InstallDir
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: clone failed." -ForegroundColor Red; exit 1 }
}

# ── 2. uv + main venv ─────────────────────────────────────────────────────
$uv = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uv) {
    Write-Step "Installing uv..."
    powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex" | Out-Null
    # Refresh PATH for this session.
    $env:PATH = "$env:USERPROFILE\.local\bin;$env:PATH"
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if (-not $uv) { Write-Host "ERROR: uv install failed." -ForegroundColor Red; exit 1 }
}

Write-Step "uv sync (main agent-meow venv)..."
Push-Location $InstallDir
uv sync --extra all
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: uv sync failed." -ForegroundColor Red; Pop-Location; exit 1 }
Pop-Location

# ── 3. GPU Qwen3-TTS (Strix Halo gfx1151 / CUDA / CPU) ────────────────────
if (-not $SkipTTS) {
    Write-Step "Installing GPU Qwen3-TTS runtime..."
    & powershell -ExecutionPolicy Bypass -File (Join-Path $InstallDir "scripts\install-qwen-tts-gpu.ps1")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: GPU TTS install reported an error — agent-meow still works, Edge TTS stays primary." -ForegroundColor Yellow
    }
} else {
    Write-Step "Skipping GPU TTS (-SkipTTS)."
}

# ── 4. Optional: start the stack ──────────────────────────────────────────
if ($Start) {
    Write-Step "Starting GPU TTS server (:8890)..."
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$InstallDir\scripts\start-qwen-tts-gpu.ps1`""
    # Wait for the model load (first boot downloads/loads ~2.3GB weights).
    Write-Step "Waiting for TTS :8890 (model load can take a minute on first boot)..."
    for ($i = 0; $i -lt 60 -and -not (Test-Port 8890); $i++) { Start-Sleep 2 }
    if (Test-Port 8890) { Write-Step "TTS UP on :8890" }
    else { Write-Host "WARNING: TTS did not come up in 2min — check its window." -ForegroundColor Yellow }

    Write-Step "Starting agent-meow native server (:6767)..."
    & powershell -ExecutionPolicy Bypass -File (Join-Path $InstallDir "scripts\start-agent-meow-native.ps1")
} else {
    Write-Host ""
    Write-Host "Install complete. To start the stack:" -ForegroundColor Green
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$InstallDir\scripts\start-qwen-tts-gpu.ps1`""
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$InstallDir\scripts\start-agent-meow-native.ps1`""
    Write-Host "  Web UI: http://127.0.0.1:6767"
}
