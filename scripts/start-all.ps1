# Start all agent-meow voice services in separate background windows
# Usage: .\scripts\start-all.ps1
#
# This starts 4 services in separate PowerShell windows so they persist
# even after the VS Code terminal session ends:
#   1. Backend (omnigent server) on :6767
#   2. Qwen3-TTS server on :8890 (qwentts_wrapper, Vulkan backend)
#   3. Hermes :8642 (Docker — assumed already running)
#   4. Web (Vite) on :5173 with --host

param(
    [switch]$SkipHermes
)

$ErrorActionPreference = "SilentlyContinue"
$repoRoot = "C:\Users\K16\github-pr\agent-meow"
$uvPath = "C:\Users\K16\.local\bin"
$nodePath = "C:\Program Files\nodejs"

# TTS server supervision env vars for ServiceSupervisor
$env:QWENTTS_SERVER_EXE = "C:\Users\K16\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWENTTS_MODEL = "C:\Users\K16\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWENTTS_CODEC = "C:\Users\K16\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:QWENTTS_LANG = "auto"
$env:QWENTTS_CODEC_CHUNK_DUR = "10.0"

# 1. Backend on :6767
$backend = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:Path = '$uvPath;`$env:Path'; `$env:QWENTTS_SERVER_EXE='$env:QWENTTS_SERVER_EXE'; `$env:QWENTTS_MODEL='$env:QWENTTS_MODEL'; `$env:QWENTTS_CODEC='$env:QWENTTS_CODEC'; `$env:QWENTTS_LANG='$env:QWENTTS_LANG'; `$env:QWENTTS_CODEC_CHUNK_DUR='$env:QWENTTS_CODEC_CHUNK_DUR'; Set-Location '$repoRoot'; uv run omnigent server --port 6767"
) -WindowStyle Minimized -PassThru
Write-Host "[1/3] Backend starting on :6767 (PID $($backend.Id))" -ForegroundColor Green

# 2. Qwen3-TTS on :8890 (qwentts_wrapper)
$tts = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:Path = '$uvPath;`$env:Path'; Set-Location '$repoRoot'; uv run python -m uvicorn scripts.qwentts_wrapper:app --port 8890 --host 127.0.0.1"
) -WindowStyle Minimized -PassThru
Write-Host "[2/3] Qwen3-TTS starting on :8890 (PID $($tts.Id))" -ForegroundColor Green

# 3. Web on :5173 with --host
$web = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned; `$env:Path = '$nodePath;`$env:Path'; Set-Location '$repoRoot\web'; npm run dev -- --host"
) -WindowStyle Minimized -PassThru
Write-Host "[3/3] Web starting on :5173 (PID $($web.Id))" -ForegroundColor Green

# Check Hermes
$hermesUp = (Test-NetConnection -ComputerName 127.0.0.1 -Port 8642 -WarningAction SilentlyContinue).TcpTestSucceeded
if ($hermesUp) {
    Write-Host "[OK] Hermes already running on :8642" -ForegroundColor Green
} elseif (-not $SkipHermes) {
    Write-Host "[!] Hermes :8642 is down. Start it with:" -ForegroundColor Yellow
    Write-Host "    cd C:\Users\K16\github-pr\hermes-agent; docker compose -f docker-compose.upstream.yml up -d"
}

Write-Host ""
Write-Host "All services started in background windows." -ForegroundColor Cyan
Write-Host "  Backend:   http://127.0.0.1:6767"
Write-Host "  Qwen3-TTS: http://127.0.0.1:8890"
Write-Host "  Hermes:    http://127.0.0.1:8642"
Write-Host "  Web:       http://localhost:5173 (also http://100.124.82.112:5173)"
Write-Host ""
Write-Host "To stop all: kill the PowerShell windows or run:" -ForegroundColor Gray
Write-Host "  Stop-Process -Id $($backend.Id),$($tts.Id),$($web.Id) -Force" -ForegroundColor Gray

# Wait for services to be ready
Write-Host ""
Write-Host "Waiting for services to come up..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$ports = @{6767="Backend"; 8890="Qwen3-TTS"; 5173="Web"; 8642="Hermes"}
foreach ($kv in $ports.GetEnumerator()) {
    $up = (Test-NetConnection -ComputerName 127.0.0.1 -Port $kv.Key -WarningAction SilentlyContinue).TcpTestSucceeded
    $status = if ($up) { "UP" } else { "DOWN (still loading)" }
    $color = if ($up) { "Green" } else { "Yellow" }
    Write-Host "  $($kv.Value) (:$($kv.Key)): $status" -ForegroundColor $color
}

Write-Host ""
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Cyan