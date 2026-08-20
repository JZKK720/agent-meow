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

function Invoke-GhcrLoginIfConfigured {
    $ghcrUser = if ($null -ne $env:GHCR_USERNAME) { $env:GHCR_USERNAME.Trim() } else { "" }
    $ghcrToken = if ($null -ne $env:GHCR_TOKEN) { $env:GHCR_TOKEN } else { "" }
    if (-not $ghcrUser -and -not $ghcrToken) {
        return
    }
    if (-not $ghcrUser -or -not $ghcrToken) {
        Write-Host "ERROR: Set both GHCR_USERNAME and GHCR_TOKEN, or neither." -ForegroundColor Red
        exit 1
    }

    Write-Host "==> Logging in to GHCR..." -ForegroundColor Cyan
    $ghcrToken | docker login ghcr.io -u $ghcrUser --password-stdin *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: docker login to ghcr.io failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed." -ForegroundColor Red
    exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is installed but not running." -ForegroundColor Red
    exit 1
}

Invoke-GhcrLoginIfConfigured

Write-Host "==> Pulling images..." -ForegroundColor Cyan

docker compose pull
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker compose pull failed." -ForegroundColor Red
    if (-not $ghcrUser -or -not $ghcrToken) {
        Write-Host "If GHCR packages are private, set GHCR_USERNAME and GHCR_TOKEN first." -ForegroundColor Yellow
    }
    exit $LASTEXITCODE
}

Write-Host "==> Starting stack..." -ForegroundColor Cyan

docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker compose up failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

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
