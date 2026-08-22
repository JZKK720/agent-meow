# Launch agent-meow natively on Windows with the full voice runtime stack.
#
# Connects in one go:
#   - agent-meow server on :6767 (SQLite — no Postgres needed)
#   - Hermes gateway on :8642 (Docker or native — auto-detected)
#   - Ollama on :11434 (auto-detected)
#   - GPU Qwen3-TTS on :8890 (auto-detected; falls back to Edge TTS if absent)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\start-agent-meow-native.ps1
#
# Prerequisites (one-time):
#   - agent-meow venv at .venv (uv sync)
#   - Hermes gateway running (Docker: docker start hermes-gateway)
#   - Optional: scripts\install-qwen-tts-gpu.ps1 for local GPU TTS

param(
    [int]$Port = 6767,
    # Stop the Docker agent-meow-server first (port clash).
    [switch]$KeepDockerServer
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"

function Write-Step($msg) { Write-Host "[agent-meow] $msg" -ForegroundColor Cyan }
function Test-Port($p) {
    (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

if (-not (Test-Path $VenvPython)) {
    Write-Host "ERROR: .venv not found. Run 'uv sync' in the repo root first." -ForegroundColor Red
    exit 1
}

# ── Stop the Docker agent-meow-server if it holds :6767 ────────────────────
if (-not $KeepDockerServer -and (Test-Port $Port)) {
    $dockerServer = docker ps --filter "name=agent-meow-server" --format "{{.Names}}" 2>$null
    if ($dockerServer) {
        Write-Step "Stopping Docker agent-meow-server (port $Port clash)..."
        docker stop $dockerServer | Out-Null
    }
}

# ── Probe the runtime stack ────────────────────────────────────────────────
Write-Step "Probing runtime stack..."

$hermesUp = Test-Port 8642
$ollamaUp = Test-Port 11434
$ttsUp = Test-Port 8890

Write-Step "Hermes gateway :8642  — $(if ($hermesUp) {'UP'} else {'DOWN (voice/chat via Hermes disabled)'})"
Write-Step "Ollama :11434           — $(if ($ollamaUp) {'UP'} else {'DOWN (local LLM disabled)'})"
Write-Step "GPU Qwen3-TTS :8890     — $(if ($ttsUp) {'UP'} else {'DOWN (Edge TTS stays primary)'})"

if (-not $hermesUp) {
    Write-Host "WARNING: Hermes gateway is not running. Start it first:" -ForegroundColor Yellow
    Write-Host "  docker start hermes-gateway   (or your native hermes launch)"
}

# ── Env wiring ─────────────────────────────────────────────────────────────
# Single-user mode: the native Windows path has no accounts DB, so disable
# accounts auth — without this every API call returns 401 Unauthorized.
$env:OMNIGENT_LOCAL_SINGLE_USER = "1"
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
# API key: prefer the running gateway's key, fall back to the web build key.
$hermesKey = $env:HERMES_API_KEY
if (-not $hermesKey) {
    $webEnv = Join-Path $RepoRoot "web\.env"
    if (Test-Path $webEnv) {
        $match = Select-String -Path $webEnv -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1
        if ($match) { $hermesKey = $match.Matches[0].Groups[1].Value }
    }
}
if ($hermesKey) {
    $env:HERMES_API_KEY = $hermesKey
    Write-Step "Hermes API key: loaded"
} else {
    Write-Host "WARNING: No HERMES_API_KEY found (env or web/.env)." -ForegroundColor Yellow
}

if ($ttsUp) {
    $env:QWEN_TTS_URL = "http://127.0.0.1:8890"
    Write-Step "QWEN_TTS_URL → GPU TTS :8890"
} else {
    # Fall back to the Docker CPU container if it's running.
    $dockerTts = docker ps --filter "name=qwen3-tts" --format "{{.Names}}" 2>$null
    if ($dockerTts) {
        $env:QWEN_TTS_URL = "http://127.0.0.1:8889"
        Write-Step "QWEN_TTS_URL → Docker CPU TTS :8889"
    }
}

# ── Launch ─────────────────────────────────────────────────────────────────
$DbPath = Join-Path $RepoRoot "agent_meow.db"
Write-Step "Starting agent-meow server on 0.0.0.0:$Port (SQLite: $DbPath)"
Write-Step "Web UI: http://127.0.0.1:$Port"
& $VenvPython -m agent_meow server --host 0.0.0.0 --port $Port --database-uri "sqlite:///$DbPath"
