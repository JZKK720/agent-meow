# Build whisper.cpp with Vulkan GPU acceleration for AMD Radeon 8060S
#
# This script clones whisper.cpp, builds it with GGML_VULKAN=1 to use the
# AMD Radeon 8060S iGPU for STT inference, and verifies the build works.
#
# Vulkan is chosen over HIP/ROCm because:
#   - ROCm 7.1.x breaks ggml's HIP backend (hipBLAS API changes, issue #3553)
#   - ROCm 7.0.1 works but requires downgrade from the installed 7.1
#   - Vulkan 1.4.329 is already installed and confirmed working on this machine
#   - Vulkan is cross-vendor — no ROCm version dependency
#   - Performance: ~2x slower than HIP but still ~20x faster than CPU
#   - STT cold-start: 60s (CPU) → ~3s (Vulkan GPU)
#
# Usage:
#   .\scripts\build-whisper-vulkan.ps1
#
# After building, the whisper-server binary can serve STT on a local port:
#   .\whisper.cpp\build\bin\Release\whisper-server.exe --model .\whisper.cpp\models\ggml-base.bin --port 8888

param(
    [string]$WhisperDir = "C:\Users\1\github-pr\whisper.cpp",
    [string]$Model = "base"
)

$ErrorActionPreference = "Stop"

Write-Host "=== whisper.cpp Vulkan GPU Build ===" -ForegroundColor Cyan
Write-Host "Target GPU: AMD Radeon 8060S Graphics (Vulkan 1.4.329)"
Write-Host "Build dir:  $WhisperDir"
Write-Host ""

# 1. Clone whisper.cpp if not already present
if (-not (Test-Path $WhisperDir)) {
    Write-Host "[1/5] Cloning whisper.cpp..." -ForegroundColor Yellow
    git clone https://github.com/ggml-org/whisper.cpp.git $WhisperDir
} else {
    Write-Host "[1/5] whisper.cpp already exists at $WhisperDir" -ForegroundColor Green
}

# 2. Check Vulkan SDK
Write-Host "[2/5] Checking Vulkan SDK..." -ForegroundColor Yellow
$vulkanInfo = Get-Command vulkaninfo -ErrorAction SilentlyContinue
if ($vulkanInfo) {
    Write-Host "  Vulkan SDK found: $($vulkanInfo.Source)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: vulkaninfo not found in PATH" -ForegroundColor Red
    Write-Host "  Install Vulkan SDK from: https://vulkan.lunarg.com/sdk/home#windows"
    exit 1
}

# 3. Check cmake
Write-Host "[3/5] Checking build tools..." -ForegroundColor Yellow
$cmake = Get-Command cmake -ErrorAction SilentlyContinue
if (-not $cmake) {
    Write-Host "  ERROR: cmake not found. Install from https://cmake.org/download/" -ForegroundColor Red
    exit 1
}
Write-Host "  cmake found: $($cmake.Source)" -ForegroundColor Green

# 4. Build with Vulkan
Write-Host "[4/5] Building whisper.cpp with GGML_VULKAN=ON..." -ForegroundColor Yellow
Set-Location $WhisperDir

# Configure with Vulkan enabled
cmake -B build -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release 2>&1 | Write-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "  CMake configuration failed!" -ForegroundColor Red
    exit 1
}

# Build
cmake --build build --config Release -j 2>&1 | Write-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  Build successful!" -ForegroundColor Green

# 5. Download model and test
Write-Host "[5/5] Downloading $Model model and testing..." -ForegroundColor Yellow

$modelFile = "$WhisperDir\models\ggml-$Model.bin"
if (-not (Test-Path $modelFile)) {
    & "$WhisperDir\models\download-ggml-model.cmd" $Model 2>&1 | Write-Host
}

if (Test-Path $modelFile) {
    Write-Host "  Model downloaded: $modelFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Verifying GPU detection ===" -ForegroundColor Cyan
    & "$WhisperDir\build\bin\Release\whisper-cli.exe" -m $modelFile -f "$WhisperDir\samples\jfk.wav" 2>&1 | Select-String "vulkan|ggml|device|GPU" | Write-Host
    Write-Host ""
    Write-Host "=== Build complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start a whisper-server for STT:"
    Write-Host "  & '$WhisperDir\build\bin\Release\whisper-server.exe' --model '$modelFile' --port 8888"
    Write-Host ""
    Write-Host "To configure Hermes to use this GPU-accelerated STT:"
    Write-Host "  Set stt.provider to 'local_command' in Hermes config.yaml"
    Write-Host "  pointing to: whisper-server --port 8888"
} else {
    Write-Host "  Model download failed. Manual download:" -ForegroundColor Red
    Write-Host "  & '$WhisperDir\models\download-ggml-model.cmd' $Model"
}

Write-Host ""
Write-Host "Note: For 2x faster GPU inference, build with GGML_HIP=ON instead"
Write-Host "      (requires ROCm 7.0.1 — 7.1.x has a known breakage, issue #3553)"
Write-Host "      cmake -B build -DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_ROCM=1"