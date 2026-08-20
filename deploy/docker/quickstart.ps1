# agent-meow quickstart — one command, full stack on localhost:6767
# Requires: Docker Desktop running, PowerShell 5.1+
#
# Usage:
#   irm https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 | iex

$ErrorActionPreference = "Stop"
$base = "https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker"

# Precheck: Docker must be installed and running before anything else.
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed." -ForegroundColor Red
    Write-Host "Install Docker Desktop from https://www.docker.com/products/docker-desktop/ and re-run this script."
    exit 1
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is installed but not running." -ForegroundColor Red
    Write-Host "Start Docker Desktop (wait for it to fully launch), then re-run this script."
    exit 1
}

# Create a dedicated directory so the compose/.env files don't clutter the user's cwd
$stackDir = "agent-meow-stack"
if (!(Test-Path $stackDir)) { New-Item -ItemType Directory -Path $stackDir | Out-Null }
Set-Location $stackDir

Write-Host "==> Fetching docker-compose.quickstart.yaml..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$base/docker-compose.quickstart.yaml" -OutFile "docker-compose.yml"

Write-Host "==> Fetching .env.all-in-one..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$base/.env.all-in-one" -OutFile ".env"

Write-Host "==> Pulling images and starting the stack..." -ForegroundColor Cyan
docker compose up -d

Write-Host ""
Write-Host "==> Stack is up! Open http://localhost:6767" -ForegroundColor Green
Write-Host "==> First boot takes ~60s (database init + model loading)."
Write-Host "==> Check status:  docker compose ps"
Write-Host "==> View logs:     docker compose logs -f agent-meow-server"
Write-Host "==> To stop:       docker compose down -v"