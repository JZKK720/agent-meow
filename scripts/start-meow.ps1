#!/usr/bin/env powershell
# Launch agent-meow with auto-host connection for zero-config demo.
# Usage: .\scripts\start-meow.ps1
# Then open http://127.0.0.1:6767

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$OmniExe = Join-Path $RepoRoot ".venv\Scripts\omni.exe"
$Port = 6767
$AgentDir = Join-Path $RepoRoot "examples\hermes-gateway\config.yaml"

# Kill any existing omni/python processes
Get-Process -Name omni, python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start the server in the background
Start-Process -FilePath $OmniExe `
    -ArgumentList "server", "--port", $Port, "--agent", $AgentDir `
    -WorkingDirectory $RepoRoot `
    -WindowStyle Hidden

Write-Host "Server starting on http://127.0.0.1:$Port ..."
Start-Sleep -Seconds 8

# Connect this machine as a host
Start-Process -FilePath $OmniExe `
    -ArgumentList "host", "--server", "http://127.0.0.1:$Port", "--non-interactive" `
    -WorkingDirectory $RepoRoot `
    -WindowStyle Hidden

Write-Host "Host connecting..."
Start-Sleep -Seconds 3

# Verify
try {
    $health = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Health: $($health.Content)" -ForegroundColor Green

    $hosts = (Invoke-WebRequest -Uri "http://127.0.0.1:$Port/v1/hosts" -UseBasicParsing -TimeoutSec 5).Content | ConvertFrom-Json
    $hosts.hosts | ForEach-Object { Write-Host "Host: $($_.name) | status=$($_.status)" -ForegroundColor Cyan }

    Write-Host ""
    Write-Host "agent-meow is ready! Open http://127.0.0.1:$Port" -ForegroundColor Green
} catch {
    Write-Host "Server not ready yet: $_" -ForegroundColor Yellow
    Write-Host "Wait a few seconds and refresh http://127.0.0.1:$Port" -ForegroundColor Yellow
}