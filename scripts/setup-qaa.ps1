# QAA Gateway Setup — agent-meow voice stack
#
# This script installs and configures the Qwen Audio Agent (QAA) gateway
# for the agent-meow voice stack. QAA provides:
#   - Online: DashScope qwen-audio-3.0-realtime-flash (cloud, ~0s warmup)
#   - Offline: local S2S server (:8765, whisper/Qwen3-ASR + Ollama + Kokoro)
#   - Backend: Hermes (:8642, agent OS with skills+memory+cron+MCP)
#
# Prerequisites:
#   - Node.js >= 22.22.2 (check: node --version)
#   - Hermes running on :8642 (check: curl http://127.0.0.1:8642/health)
#   - S2S server running on :8765 (check: start-voice-stack.ps1)
#   - DashScope API key (get from: https://dashscope.console.aliyun.com)
#
# Usage:
#   .\scripts\setup-qaa.ps1                    # install + configure QAA
#   .\scripts\setup-qaa.ps1 -DashScopeKey sk-xxx  # install + configure with API key

param(
    [string]$DashScopeKey = ""
)

$ErrorActionPreference = "Stop"

Write-Host "=== QAA Gateway Setup ===" -ForegroundColor Cyan

# ── 1. Install QAA ──────────────────────────────────────────────────────────
Write-Host "`n1. Installing qwen-audio-agent..." -ForegroundColor Yellow
$existing = Get-Command qwenaudio -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "  Already installed: $($existing.Source)" -ForegroundColor Green
} else {
    npm install -g qwen-audio-agent 2>&1 | Out-Null
    Write-Host "  Installed qwen-audio-agent" -ForegroundColor Green
}

# ── 2. Create config.env ────────────────────────────────────────────────────
Write-Host "`n2. Configuring QAA..." -ForegroundColor Yellow
$configDir = "$env:USERPROFILE\.config\qwaudio"
$configPath = "$configDir\config.env"

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$configContent = @"
# qwen-audio-agent config — agent-meow
# Hybrid: DashScope online + local S2S offline + Hermes backend
DASHSCOPE_API_KEY=$DashScopeKey
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-flash
SPEECH_TO_SPEECH_REALTIME_URL=ws://127.0.0.1:8765/v1/realtime
AGENT_PROTOCOL=hermes
QWEN_AUDIO_AGENT_BACKEND_PERMISSION_MODE=native
"@

Set-Content -Path $configPath -Value $configContent -Encoding UTF8
Write-Host "  Config written to: $configPath" -ForegroundColor Green

if ($DashScopeKey) {
    Write-Host "  DashScope API key: set" -ForegroundColor Green
} else {
    Write-Host "  DashScope API key: NOT SET (online mode unavailable until set)" -ForegroundColor Yellow
    Write-Host "  Get key from: https://dashscope.console.aliyun.com" -ForegroundColor Gray
}

# ── 3. Check prerequisites ──────────────────────────────────────────────────
Write-Host "`n3. Checking prerequisites..." -ForegroundColor Yellow

# Check Hermes
$hermesUp = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $hermesUp = $true }
} catch {}
Write-Host "  Hermes (:8642): $(if ($hermesUp) {'UP'} else {'DOWN — start Hermes first'})" -ForegroundColor $(if ($hermesUp) {'Green'} else {'Red'})

# Check S2S
$s2sUp = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8765/v1/pool" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $s2sUp = $true }
} catch {}
Write-Host "  S2S (:8765): $(if ($s2sUp) {'UP'} else {'DOWN — run start-voice-stack.ps1'})" -ForegroundColor $(if ($s2sUp) {'Green'} else {'Yellow'})

# ── 4. Summary ──────────────────────────────────────────────────────────────
Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Gateway port:  :3101 (default)" -ForegroundColor White
Write-Host "Online:  DashScope qwen-audio-3.0-realtime-flash" -ForegroundColor White
Write-Host "Offline: S2S at ws://127.0.0.1:8765/v1/realtime" -ForegroundColor White
Write-Host "Backend: Hermes (:8642)" -ForegroundColor White
Write-Host ""
Write-Host "Start QAA gateway:" -ForegroundColor Yellow
Write-Host "  qwenaudio" -ForegroundColor White
Write-Host ""
Write-Host "Start QAA TUI (terminal UI):" -ForegroundColor Yellow
Write-Host "  qwenaudio tui" -ForegroundColor White
Write-Host ""
Write-Host "Start QAA WebUI:" -ForegroundColor Yellow
Write-Host "  qwenaudio webui" -ForegroundColor White