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
}
else {
    npm install -g qwen-audio-agent 2>&1 | Out-Null
    Write-Host "  Installed qwen-audio-agent" -ForegroundColor Green
}

# ── 2. Create config.env + hermes.cmd wrapper ───────────────────────────────
Write-Host "`n2. Configuring QAA..." -ForegroundColor Yellow
$configDir = "$env:USERPROFILE\.config\qwaudio"
$configPath = "$configDir\config.env"

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Create hermes.cmd wrapper for QAA to spawn Hermes ACP via Docker
$hermesContainer = "hermes-gateway"
$hermesWrapperDir = "$env:APPDATA\npm\hermes-wrapper"
$hermesWrapperPath = "$hermesWrapperDir\hermes.cmd"
if (-not (Test-Path $hermesWrapperDir)) {
    New-Item -ItemType Directory -Path $hermesWrapperDir -Force | Out-Null
}
Set-Content -Path $hermesWrapperPath -Value "@echo off`r`ndocker exec -i $hermesContainer hermes %*" -Encoding ASCII
Write-Host "  Hermes wrapper: $hermesWrapperPath" -ForegroundColor Green

$configContent = @"
# qwen-audio-agent config — agent-meow
# Hybrid: DashScope online + local S2S offline + Hermes backend
DASHSCOPE_API_KEY=$DashScopeKey
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-flash
SPEECH_TO_SPEECH_REALTIME_URL=ws://127.0.0.1:8765/v1/realtime
AGENT_PROTOCOL=hermes
QWEN_AUDIO_AGENT_BACKEND_PERMISSION_MODE=native
HERMES_BIN=$hermesWrapperPath
"@

Set-Content -Path $configPath -Value $configContent -Encoding UTF8
Write-Host "  Config written to: $configPath" -ForegroundColor Green

if ($DashScopeKey) {
    Write-Host "  DashScope API key: set" -ForegroundColor Green
}
else {
    Write-Host "  DashScope API key: NOT SET (online mode unavailable until set)" -ForegroundColor Yellow
    Write-Host "  Get key from: https://dashscope.console.aliyun.com" -ForegroundColor Gray
}

# ── 3. Patch QAA for Windows .cmd spawn support ────────────────────────────
Write-Host "`n3. Patching QAA for Windows Hermes wrapper..." -ForegroundColor Yellow
$qaaBase = "$env:APPDATA\npm\node_modules\qwen-audio-agent"
$hermesBackend = "$qaaBase\server\src\agent\backends\hermes.mjs"
$acpClient = "$qaaBase\server\src\agent\acp-process-client.mjs"
$acpAdapter = "$qaaBase\server\src\agent\acp-backend-adapter.mjs"

# Patch hermes.mjs: add spawnOptions for Windows
if (Test-Path $hermesBackend) {
    $content = Get-Content $hermesBackend -Raw
    if ($content -notmatch 'spawnOptions') {
        $content = $content -replace '(backendUi: false,\s*)', "`$1      // Windows: spawn needs shell:true to resolve .cmd wrappers`r`n      spawnOptions: process.platform === 'win32' ? { shell: true } : undefined,`r`n"
        Set-Content -Path $hermesBackend -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Patched hermes.mjs (spawnOptions)" -ForegroundColor Green
    } else {
        Write-Host "  hermes.mjs already patched" -ForegroundColor Gray
    }
}

# Patch acp-process-client.mjs: accept and use spawnOptions
if (Test-Path $acpClient) {
    $content = Get-Content $acpClient -Raw
    if ($content -notmatch 'this\.spawnOptions') {
        $content = $content -replace '(this\.spawn = spawnImpl;\r?\n)', "`$1    this.spawnOptions = spawnOptions`r`n"
        $content = $content -replace '(formatRequestError,\r?\n)', "`$1    spawnOptions,`r`n"
        $content = $content -replace '(stdio: \[''pipe'', ''pipe'', ''pipe''\],\r?\n)', "`$1      ...(this.spawnOptions || {}),`r`n"
        Set-Content -Path $acpClient -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Patched acp-process-client.mjs (spawnOptions)" -ForegroundColor Green
    } else {
        Write-Host "  acp-process-client.mjs already patched" -ForegroundColor Gray
    }
}

# Patch acp-backend-adapter.mjs: pass spawnOptions from profile to client
if (Test-Path $acpAdapter) {
    $content = Get-Content $acpAdapter -Raw
    if ($content -notmatch 'spawnOptions: this\.profile\.spawnOptions') {
        $content = $content -replace '(sanitizeProcessOutput: this\.profile\.sanitizeProcessOutput,\r?\n)', "`$1      spawnOptions: this.profile.spawnOptions,`r`n"
        Set-Content -Path $acpAdapter -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Patched acp-backend-adapter.mjs (spawnOptions pass-through)" -ForegroundColor Green
    } else {
        Write-Host "  acp-backend-adapter.mjs already patched" -ForegroundColor Gray
    }
}

# ── 4. Check prerequisites ──────────────────────────────────────────────────
Write-Host "`n4. Checking prerequisites..." -ForegroundColor Yellow

# Check Hermes
$hermesUp = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $hermesUp = $true }
}
catch {}
Write-Host "  Hermes (:8642): $(if ($hermesUp) {'UP'} else {'DOWN — start Hermes first'})" -ForegroundColor $(if ($hermesUp) { 'Green' } else { 'Red' })

# Check S2S
$s2sUp = $false
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8765/v1/pool" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($r.StatusCode -eq 200) { $s2sUp = $true }
}
catch {}
Write-Host "  S2S (:8765): $(if ($s2sUp) {'UP'} else {'DOWN — run start-voice-stack.ps1'})" -ForegroundColor $(if ($s2sUp) { 'Green' } else { 'Yellow' })

# ── 5. Summary ──────────────────────────────────────────────────────────────
Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Gateway port:  :3101 (default)" -ForegroundColor White
Write-Host "Online:  DashScope qwen-audio-3.0-realtime-flash" -ForegroundColor White
Write-Host "Offline: S2S at ws://127.0.0.1:8765/v1/realtime" -ForegroundColor White
Write-Host "Backend: Hermes (:8642) via $hermesWrapperPath" -ForegroundColor White
Write-Host ""
Write-Host "Start QAA gateway (with Hermes backend):" -ForegroundColor Yellow
Write-Host "  `$env:HERMES_BIN = '$hermesWrapperPath'" -ForegroundColor White
Write-Host "  qwenaudio gateway run --backend hermes" -ForegroundColor White
Write-Host ""
Write-Host "Start QAA WebUI:" -ForegroundColor Yellow
Write-Host "  qwenaudio webui" -ForegroundColor White