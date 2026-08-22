# Preinstall Qwen3-TTS with GPU PyTorch for agent-meow voice.
#
# What this does (verified working on Strix Halo 2026-08-21):
#   1. Creates a dedicated Python 3.12 venv (.venv-tts-gpu) — the main
#      agent-meow venv keeps its CPU torch untouched.
#   2. Installs AMD ROCm torch (gfx1151 = Ryzen AI Max / Strix Halo) or
#      NVIDIA CUDA torch, detected from the GPU hardware.
#   3. Installs qwen-tts + FastAPI server deps.
#   4. Downloads the Qwen3-TTS 0.6B model (~2.3GB) on first launch.
#
# Usage (admin NOT required):
#   powershell -ExecutionPolicy Bypass -File scripts\install-qwen-tts-gpu.ps1
#
# After install, start the TTS server with:
#   scripts\start-qwen-tts-gpu.ps1

param(
    # Port the TTS server will listen on.
    [int]$Port = 8890,
    # Skip the model download (downloads on first server start instead).
    [switch]$SkipModelDownload
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvDir = Join-Path $RepoRoot ".venv-tts-gpu"
$AmdTorchIndex = "https://repo.amd.com/rocm/whl-multi-arch/"

function Write-Step($msg) { Write-Host "[qwen-tts-gpu] $msg" -ForegroundColor Cyan }
function Invoke-PipInstall {
    param(
        [string]$Label,
        [string[]]$Args
    )

    $installOutput = & $VenvPython -m pip @Args 2>&1
    $installExitCode = $LASTEXITCODE
    if ($installOutput) {
        $installOutput | Select-Object -Last 5
    }
    if ($installExitCode -ne 0) {
        Write-Host "ERROR: $Label failed." -ForegroundColor Red
        exit $installExitCode
    }
}

# ── 1. Find a Python 3.12 ─────────────────────────────────────────────────
# The AMD ROCm wheels target 3.12. Try py launcher, then uv's managed 3.12.
Write-Step "Locating Python 3.12..."
$py312 = $null
try { $py312 = (Get-Command py -ErrorAction Stop).Source } catch { }
if ($py312) {
    $v = & py -3.12 --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $v -match "3\.12") {
        # py -3.12 works — but the system 3.12 can be broken by PYTHONSTARTUP
        # pollution; uv's copy is more reliable. Prefer uv if present.
    }
}
$uvPy = Join-Path $env:APPDATA "uv\python\cpython-3.12.13-windows-x86_64-none\python.exe"
if (Test-Path $uvPy) {
    $py312 = $uvPy
    Write-Step "Using uv-managed Python 3.12 ($uvPy)"
} elseif ($py312) {
    Write-Step "Using py launcher Python 3.12"
} else {
    # Last resort: create with py -3.12 and hope the env is clean.
    $env:PYTHONSTARTUP = $null; $env:PYTHONUTF8 = $null; $env:PYTHON_BASIC_REPL = $null
    & py -3.12 -m venv $VenvDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No usable Python 3.12 found. Install Python 3.12 or uv first." -ForegroundColor Red
        exit 1
    }
}

# ── 2. Create the venv ────────────────────────────────────────────────────
if (-not (Test-Path (Join-Path $VenvDir "Scripts\python.exe"))) {
    Write-Step "Creating venv at $VenvDir..."
    if ($py312 -and (Test-Path $py312)) {
        & $py312 -m venv $VenvDir
    } else {
        & py -3.12 -m venv $VenvDir
    }
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: venv creation failed." -ForegroundColor Red; exit 1 }
}
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
Write-Step "Venv ready: $VenvPython"

# ── 3. Detect GPU and install the right torch ─────────────────────────────
Write-Step "Detecting GPU..."
$gpuName = (Get-CimInstance Win32_VideoController | Select-Object -First 1).Name
Write-Step "GPU: $gpuName"

if ($gpuName -match "AMD|Radeon") {
    # Strix Halo (Ryzen AI Max) is gfx1151. The base torch[device-gfx1150]
    # install alone gives "device kernel image is invalid" — the gfx1151
    # extra is REQUIRED. Both are installed to be safe across AMD gens.
    Write-Step "Installing AMD ROCm torch (gfx1150 + gfx1151)..."
    Invoke-PipInstall -Label "AMD ROCm torch gfx1150" -Args @("install", "--index-url", $AmdTorchIndex, "torch[device-gfx1150]==2.12.0+rocm7.14.0")
    Invoke-PipInstall -Label "AMD ROCm torch gfx1151" -Args @("install", "--index-url", $AmdTorchIndex, "torch[device-gfx1151]")
} elseif ($gpuName -match "NVIDIA|GeForce|RTX") {
    Write-Step "Installing NVIDIA CUDA torch..."
    Invoke-PipInstall -Label "NVIDIA CUDA torch" -Args @("install", "torch", "--index-url", "https://download.pytorch.org/whl/cu128")
} else {
    Write-Step "No recognized GPU — installing CPU torch (TTS will be slow; Edge TTS stays primary)."
    Invoke-PipInstall -Label "CPU torch" -Args @("install", "torch", "--index-url", "https://download.pytorch.org/whl/cpu")
}

# ── 4. Verify GPU visibility ──────────────────────────────────────────────
Write-Step "Verifying torch GPU access..."
& $VenvPython -c "import torch; print('cuda:', torch.cuda.is_available())"
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: torch import failed — check the install output above." -ForegroundColor Yellow
}

# ── 5. Install TTS server deps ────────────────────────────────────────────
Write-Step "Installing qwen-tts + server dependencies..."
Invoke-PipInstall -Label "qwen-tts dependencies" -Args @("install", "numpy", "fastapi", "uvicorn", "pydantic", "qwen-tts")

# ── 6. Model weights ──────────────────────────────────────────────────────
$ModelDir = Join-Path $env:USERPROFILE "models\Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice"
$TokenizerDir = Join-Path $env:USERPROFILE "models\Qwen_Qwen3-TTS-Tokenizer-12Hz"
if (-not $SkipModelDownload) {
    if (-not (Test-Path $ModelDir)) {
        Write-Step "Downloading Qwen3-TTS 0.6B model (~2.3GB)..."
        & $VenvPython -c "from huggingface_hub import snapshot_download; snapshot_download('Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice', local_dir=r'$ModelDir')"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: model download failed." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } else {
        Write-Step "Model already present at $ModelDir."
    }

    if (-not (Test-Path $TokenizerDir)) {
        Write-Step "Downloading Qwen3-TTS tokenizer..."
        & $VenvPython -c "from huggingface_hub import snapshot_download; snapshot_download('Qwen/Qwen3-TTS-Tokenizer-12Hz', local_dir=r'$TokenizerDir')"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: tokenizer download failed." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } else {
        Write-Step "Tokenizer already present at $TokenizerDir."
    }
} else {
    Write-Step "Model/tokenizer download skipped."
}

Write-Host ""
Write-Host "Done. Start the TTS server with:" -ForegroundColor Green
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\start-qwen-tts-gpu.ps1 -Port $Port"
