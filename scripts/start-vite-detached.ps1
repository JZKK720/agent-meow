#!/usr/bin/env powershell
# Start the Vite dev server as a detached Windows process that survives
# terminal kills. Binds to all interfaces so both localhost (::1 IPv6) and
# 127.0.0.1 (IPv4) work — Windows resolves localhost to IPv6 first.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\start-vite-detached.ps1
# Check:  netstat -an | findstr LISTENING | findstr 5173
# Stop:   taskkill /f /im node.exe  (kills ALL node — or find the PID below)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$WebDir = Join-Path $RepoRoot "web"
$LogFile = Join-Path $RepoRoot "dev\vite-detached.log"
$ErrLogFile = Join-Path $RepoRoot "dev\vite-detached.err.log"

# Kill any existing vite/node processes bound to 5173 first.
$existing = & netstat.exe -ano | Select-String "LISTENING" | Select-String "5173"
if ($existing) {
    $pids = $existing | ForEach-Object {
        if ($_ -match '\s+(\d+)$') { $matches[1] }
    } | Sort-Object -Unique
    foreach ($procId in $pids) {
        Write-Host "Killing existing process on :5173 (PID $procId)" -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

# Ensure the dev directory exists for the log file.
$devDir = Join-Path $RepoRoot "dev"
if (-not (Test-Path $devDir)) { New-Item -ItemType Directory -Path $devDir -Force | Out-Null }

Write-Host "Starting Vite dev server (detached) on http://127.0.0.1:5173/ ..." -ForegroundColor Cyan
Write-Host "  Web dir: $WebDir" -ForegroundColor Gray
Write-Host "  Log: $LogFile" -ForegroundColor Gray

# Use node.exe directly (a real Win32 binary) with the vite.js entry point.
# This avoids the cmd.exe /c wrapper whose child gets killed on session cleanup.
$ViteJs = Join-Path $WebDir "node_modules\vite\bin\vite.js"
$NodeExe = (Get-Command node.exe -ErrorAction Stop).Source

$proc = Start-Process -FilePath $NodeExe `
    -ArgumentList @($ViteJs, "--host", "::") `
    -WorkingDirectory $WebDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError $ErrLogFile `
    -PassThru

Write-Host "  PID: $($proc.Id)" -ForegroundColor Green
Start-Sleep -Seconds 4

# Verify it's listening.
$listening = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:5173/" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $listening = $true }
}
catch {}

if ($listening) {
    Write-Host "  Vite is UP on http://127.0.0.1:5173/" -ForegroundColor Green
}
else {
    Write-Host "  Vite still starting... check logs: $LogFile" -ForegroundColor Yellow
}

Write-Host "`nTo stop:  taskkill /f /id $($proc.Id)" -ForegroundColor Gray
Write-Host "To view logs:  Get-Content dev\vite-detached.log -Tail 20" -ForegroundColor Gray