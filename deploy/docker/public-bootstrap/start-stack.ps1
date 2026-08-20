# agent-meow public bootstrap starter
#
# Run from a directory containing:
# - docker-compose.yml
# - .env
# - hermes-config.yaml
# - hermes-edge-zh-hotfix.ps1
#
# This script pulls the images, starts the stack, waits for hermes-gateway,
# then applies the optional Chinese Edge TTS hotfix.

param(
    [switch]$SkipHermesHotfix
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed." -ForegroundColor Red
    exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is installed but not running." -ForegroundColor Red
    exit 1
}

Write-Host "==> Pulling images..." -ForegroundColor Cyan

docker compose pull

Write-Host "==> Starting stack..." -ForegroundColor Cyan

docker compose up -d

if (-not $SkipHermesHotfix -and (Test-Path .\hermes-edge-zh-hotfix.ps1)) {
    Write-Host "==> Waiting for hermes-gateway container..." -ForegroundColor Cyan
    $deadline = (Get-Date).AddMinutes(3)
    do {
        Start-Sleep -Seconds 2
        $found = docker ps --format "{{.Names}}" | Select-String -SimpleMatch "hermes-gateway"
    } while (-not $found -and (Get-Date) -lt $deadline)

    if ($found) {
        Write-Host "==> Applying Hermes Chinese Edge TTS hotfix..." -ForegroundColor Cyan
        powershell -NoProfile -ExecutionPolicy Bypass -File .\hermes-edge-zh-hotfix.ps1
    } else {
        Write-Host "WARNING: hermes-gateway did not appear in time; skipping hotfix." -ForegroundColor Yellow
    }
}

Write-Host "" 
Write-Host "==> Stack is up. Open http://localhost:6767" -ForegroundColor Green
Write-Host "==> Check status: docker compose ps"
Write-Host "==> View logs:    docker compose logs -f agent-meow-server"
Write-Host "==> Stop stack:   docker compose down -v"
