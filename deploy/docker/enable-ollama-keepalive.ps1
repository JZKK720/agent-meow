<#
.SYNOPSIS
  Set OLLAMA_KEEP_ALIVE persistently on the host for the host-runtime override path.

.DESCRIPTION
  When using docker-compose.override.yml (host-runtime mode), Ollama runs on
  the host OS, not in a container. The OLLAMA_KEEP_ALIVE env var in
  docker-compose.yml only affects the containerized Ollama service, which is
  reset to null in the override. This script sets OLLAMA_KEEP_ALIVE at the
  Windows Machine scope so it survives reboots and applies to the host
  `ollama serve` process.

  Default value is 30m (30 minutes). Ollama's built-in default is 5m, which
  causes 10-30s cold-start reload gaps in the voice pipeline after 5 minutes
  of idle time.

  Run this ONCE per machine. It requires elevation (machine-scope env var).

.PARAMETER Value
  The keep_alive duration. Default: 30m. Ollama accepts: 5m, 10m, 30m, 1h, 2h, etc.

.EXAMPLE
  .\enable-ollama-keepalive.ps1
  .\enable-ollama-keepalive.ps1 -Value 1h
#>

param(
    [string]$Value = "30m"
)

$ErrorActionPreference = "Stop"

# Check elevation
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script sets a Machine-scope environment variable and requires elevation." -ForegroundColor Yellow
    Write-Host "Re-run from an elevated PowerShell (Run as Administrator)." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative (User scope, no elevation needed):" -ForegroundColor Cyan
    Write-Host "  [Environment]::SetEnvironmentVariable('OLLAMA_KEEP_ALIVE', '$Value', 'User')"
    Write-Host "  # Then restart Ollama"
    exit 1
}

# Check current value
$current = [Environment]::GetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "Machine")
if ($current -eq $Value) {
    Write-Host "OLLAMA_KEEP_ALIVE is already set to '$Value' at Machine scope. Nothing to do." -ForegroundColor Green
    exit 0
}

if ($current) {
    Write-Host "Current OLLAMA_KEEP_ALIVE (Machine): '$current'" -ForegroundColor DarkGray
}

# Set it
[Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", $Value, "Machine")
Write-Host "Set OLLAMA_KEEP_ALIVE='$Value' at Machine scope." -ForegroundColor Green

# Restart Ollama to pick up the new env var
$ollamaProcs = Get-Process -Name "ollama", "ollama app" -ErrorAction SilentlyContinue
if ($ollamaProcs) {
    Write-Host "Restarting Ollama to apply the new setting..." -ForegroundColor Cyan
    $ollamaProcs | Stop-Process -Force
    Start-Sleep -Seconds 2
    $ollamaApp = "$env:LOCALAPPDATA\Programs\Ollama\ollama app.exe"
    if (Test-Path $ollamaApp) {
        Start-Process $ollamaApp
        Write-Host "Ollama restarted." -ForegroundColor Green
    } else {
        Write-Host "Could not find ollama app at $ollamaApp" -ForegroundColor Yellow
        Write-Host "Start Ollama manually to apply the new setting." -ForegroundColor Yellow
    }
} else {
    Write-Host "Ollama is not currently running. The setting will apply on next start." -ForegroundColor DarkGray
}

# Verify
Start-Sleep -Seconds 2
$verify = [Environment]::GetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "Machine")
Write-Host ""
Write-Host "Verification:" -ForegroundColor Cyan
Write-Host "  OLLAMA_KEEP_ALIVE (Machine) = '$verify'" -ForegroundColor Green
Write-Host ""
Write-Host "To verify model residency after use:" -ForegroundColor Cyan
Write-Host "  ollama run nemotron-3.5-lightning:30b-a3b 'hi'" -ForegroundColor White
Write-Host "  # wait 31 minutes..." -ForegroundColor DarkGray
Write-Host "  ollama ps   # model should still be listed" -ForegroundColor White
