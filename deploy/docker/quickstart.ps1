# agent-meow quickstart — one command, full stack on localhost:6767
# Requires: Docker Desktop running, PowerShell 5.1+
#
# Usage:
#   irm https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 | iex

$ErrorActionPreference = "Stop"
$base = "https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker"

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