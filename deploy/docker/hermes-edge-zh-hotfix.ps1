# Hermes Edge Chinese hotfix — no clone, client-side post-start patch.
#
# Fixes the stock ghcr.io/jzkk720/hermes-agent image when Chinese Edge TTS
# returns NoAudioReceived. Applies two runtime-only changes inside the running
# container:
#   1. Upgrade edge-tts to 7.2.8
#   2. Change DEFAULT_EDGE_VOICE to zh-CN-XiaoxiaoNeural
#
# Usage (after docker compose up -d):
#   .\hermes-edge-zh-hotfix.ps1
#
# Safe to re-run: it is idempotent.

param(
    [string]$ContainerName = "hermes-gateway"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed." -ForegroundColor Red
    exit 1
}

$running = docker ps --format "{{.Names}}" | Select-String -SimpleMatch $ContainerName
if (-not $running) {
    Write-Host "ERROR: Container '$ContainerName' is not running." -ForegroundColor Red
    exit 1
}

Write-Host "==> Upgrading edge-tts in $ContainerName..." -ForegroundColor Cyan
$null = docker exec $ContainerName /opt/hermes/.venv/bin/pip install -q --upgrade edge-tts==7.2.8

Write-Host "==> Patching default Edge voice to zh-CN-XiaoxiaoNeural..." -ForegroundColor Cyan
$patch = @'
from pathlib import Path
p = Path('/opt/hermes/tools/tts_tool.py')
src = p.read_text(encoding='utf-8')
old = 'DEFAULT_EDGE_VOICE = "en-US-AriaNeural"'
new = 'DEFAULT_EDGE_VOICE = "zh-CN-XiaoxiaoNeural"'
if old in src:
    p.write_text(src.replace(old, new), encoding='utf-8')
    print('PATCHED')
else:
    print('NO-CHANGE')
'@
$bytes = [System.Text.Encoding]::UTF8.GetBytes($patch)
$patchB64 = [Convert]::ToBase64String($bytes)
$null = docker exec $ContainerName /opt/hermes/.venv/bin/python -c "import base64,sys; exec(base64.b64decode('$patchB64').decode('utf-8'))"

Write-Host "==> Clearing cached bytecode..." -ForegroundColor Cyan
$null = docker exec $ContainerName sh -c "find /opt/hermes/tools/__pycache__ -name 'tts_tool*' -delete 2>/dev/null || true"

Write-Host "==> Restarting $ContainerName..." -ForegroundColor Cyan
$null = docker restart $ContainerName

Write-Host "==> Waiting for healthy status..." -ForegroundColor Cyan
$deadline = (Get-Date).AddMinutes(2)
do {
    Start-Sleep -Seconds 3
    $status = docker inspect $ContainerName --format "{{.State.Health.Status}}" 2>$null
} while ($status -ne "healthy" -and (Get-Date) -lt $deadline)

if ($status -ne "healthy") {
    Write-Host "WARNING: $ContainerName did not report healthy within 2 minutes." -ForegroundColor Yellow
    exit 1
}

Write-Host "==> Patch applied. $ContainerName is healthy." -ForegroundColor Green
Write-Host "==> Note: if you recreate this container from the stock GHCR image, rerun this script." -ForegroundColor Yellow
