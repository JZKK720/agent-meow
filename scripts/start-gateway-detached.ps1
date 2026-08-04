#!/usr/bin/env powershell
# Permanently start the agent-meow gateway server as a detached Windows process.
# The process survives terminal kills because Start-Process creates an
# independent process, not a child of any terminal.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\start-gateway-detached.ps1
# Check:  netstat -an | findstr LISTENING | findstr 6767
# Stop:   taskkill /f /im omni.exe

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$OmniExe = Join-Path $RepoRoot ".venv\Scripts\omni.exe"
$LogFile = Join-Path $RepoRoot "dev\gateway-detached.log"
$AgentConfig = Join-Path $RepoRoot "examples\hermes-gateway\config.yaml"

# Kill any existing gateway process first.
Get-Process -Name omni -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Ensure the dev directory exists for the log file.
$devDir = Join-Path $RepoRoot "dev"
if (-not (Test-Path $devDir)) { New-Item -ItemType Directory -Path $devDir -Force | Out-Null }

Write-Host "Starting gateway server (detached) on :6767 ..." -ForegroundColor Cyan
Write-Host "  Log: $LogFile" -ForegroundColor Gray

$proc = Start-Process -FilePath $OmniExe `
    -ArgumentList @("server", "--port", "6767", "--agent", $AgentConfig) `
    -WorkingDirectory $RepoRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError (Join-Path $devDir "gateway-detached.err.log") `
    -PassThru

Write-Host "  PID: $($proc.Id)" -ForegroundColor Green
Start-Sleep -Seconds 5

# Verify it's listening.
$listening = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $listening = $true }
} catch {}

if ($listening) {
    Write-Host "  Gateway is UP on :6767" -ForegroundColor Green
} else {
    Write-Host "  Gateway still starting... check logs: $LogFile" -ForegroundColor Yellow
}

Write-Host "`nTo stop:  taskkill /f /im omni.exe" -ForegroundColor Gray