# agent-meow durable server launcher for the cubecloud-io dev machine.
# Uses the MANAGED `server start` path (registers local_server.pid, is reused by
# `run`/`claude`/`codex`, survives terminal cleanup) — NOT a raw Start-Process.
#
# Sets the env vars the server+runners need. The managed server inherits the
# full parent env (local_server.py: child_env = {**os.environ}).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1 -Restart
#
# Params:
#   -Restart  Stop any running server first, then start fresh (after config/env changes).

param(
    [switch]$Restart
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot   # scripts/ -> repo root
$venvPy = Join-Path $repo ".venv\Scripts\python.exe"
$markitdownBin = "$env:USERPROFILE\.local\bin\markitdown.exe"

Write-Host "== agent-meow server launcher (cubecloud-io) ==" -ForegroundColor Cyan

# ── 1. Required env vars ─────────────────────────────────────────
# The Hermes gateway .env key (the .env value WINS at runtime; the container
# env API_SERVER_KEY is overridden by /opt/data/.env).
$env:HERMES_API_KEY = "1df44db64dae6c295636e5b67ca878ae4d7d001ab1f554f0007535120efa77f1"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:QWEN_TTS_URL = "http://127.0.0.1:8890"
$env:QWENTTS_SERVER_URL = "http://127.0.0.1:8891"

# doc_convert (markitdown) — the binary EXISTS at ~/.local/bin but that dir is
# NOT on the venv PATH, so point the tool at it explicitly.
if (Test-Path $markitdownBin) {
    $env:MARKITDOWN_BIN = $markitdownBin
    Write-Host "  MARKITDOWN_BIN = $env:MARKITDOWN_BIN" -ForegroundColor Green
} else {
    Write-Host "  [warn] markitdown.exe not found at $markitdownBin — doc_convert will report it missing" -ForegroundColor Yellow
}

# officecli — installed at ~/.local/bin/officecli.exe (v1.0.147), not on the
# venv PATH, so point the tool at it explicitly.
if (Test-Path "$env:USERPROFILE\.local\bin\officecli.exe") {
    $env:OFFICECLI_BIN = "$env:USERPROFILE\.local\bin\officecli.exe"
    Write-Host "  OFFICECLI_BIN = $env:OFFICECLI_BIN" -ForegroundColor Green
} else {
    Write-Host "  [warn] officecli not found — doc_create_office/edit/export will report it missing" -ForegroundColor Yellow
}

# UTF-8 for Chinese text in logs.
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

# ── 2. Optional restart ──────────────────────────────────────────
if ($Restart) {
    Write-Host "  -Restart given: stopping existing server..." -ForegroundColor Yellow
    & $venvPy -m agent_meow.cli server stop 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}

# ── 3. Start via the MANAGED path ────────────────────────────────
Write-Host "  Running: python -m agent_meow.cli server start" -ForegroundColor Cyan
& $venvPy -m agent_meow.cli server start
Write-Host ""

# ── 4. Verify health ─────────────────────────────────────────────
Write-Host "  Verifying health..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $health = Invoke-WebRequest -Uri "http://127.0.0.1:6767/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "  /health -> $($health.StatusCode) $($health.Content)" -ForegroundColor Green
    $status = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/stack/status" -UseBasicParsing -TimeoutSec 10).Content | ConvertFrom-Json
    Write-Host "  stack: server=$($status.server) hermes=$($status.hermes.status) ollama=$($status.ollama.status) tts=$($status.tts.status)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] server did not come up: $_" -ForegroundColor Red
    exit 1
}

Write-Host "== done ==" -ForegroundColor Green
