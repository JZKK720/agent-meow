# Watchdog: every 5 minutes, restart any dead native-stack service.
# Scheduled alongside start-native-stack.ps1 (logon trigger + 5min repeat).
#
# Checks (in order):
#   1. tts-server.exe :8891       -> restart when down (Vulkan native C++)
#   2. agent-meow server :6767   -> restart (with full env) when down
#   3. Host daemon health        -> the server can be UP while the host
#      tunnel is wedged by orphaned _daemon_entry processes (each manual
#      server restart can orphan the previous daemon; they fight over the
#      single tunnel and none stays connected). Detect via /v1/hosts
#      reporting offline, then kill the orphans and restart the server so
#      it auto-spawns one clean daemon.
$ErrorActionPreference = "Continue"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"

# External tool paths — override via env vars, default to K16 layout.
$QwenttsRoot = if ($env:QWENTTS_ROOT) { $env:QWENTTS_ROOT } else { "C:\Users\K16\github-pr\qwentts.cpp" }
$WhisperRoot = if ($env:WHISPER_ROOT) { $env:WHISPER_ROOT } else { "C:\Users\K16\whisper.cpp" }
$VoiceModels = if ($env:VOICE_MODELS_DIR) { $env:VOICE_MODELS_DIR } else { "$env:APPDATA\agent-meow\voice\models" }
$TtsServerExe = Join-Path $QwenttsRoot "build\Release\tts-server.exe"
$TtsModel = Join-Path $QwenttsRoot "models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$TtsCodec = Join-Path $QwenttsRoot "models\qwen-tokenizer-12hz-Q8_0.gguf"
$WhisperServerExe = Join-Path $WhisperRoot "build\bin\Release\whisper-server.exe"
# STT model: prefer non-turbo (large-v3.bin) for accuracy; fall back to turbo.
$WhisperModel = $env:WHISPER_MODEL
if (-not $WhisperModel) {
  $nonTurbo = Join-Path $VoiceModels "ggml-large-v3.bin"
  $turbo = Join-Path $VoiceModels "ggml-large-v3-turbo.bin"
  if (Test-Path $nonTurbo) {
    $WhisperModel = $nonTurbo
  } else {
    $WhisperModel = $turbo
  }
}

function Test-Port($p) {
  (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

function Test-HostOnline {
  try {
    $resp = Invoke-WebRequest "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 10
    if ($resp.StatusCode -ne 200) { return $false }
    $hosts = $resp.Content | ConvertFrom-Json
    foreach ($h in $hosts.hosts) {
      if ($h.status -eq "online") { return $true }
    }
    return $false
  } catch {
    return $false
  }
}

function Test-VoiceStackHealthy {
  # Edge TTS (Hermes) is PRIMARY; Qwen3-TTS (tts-server.exe :8891) is the
  # FALLBACK. The tts_wrapper (:8890, Python proxy) is a secondary fallback
  # that frequently crashes on port conflict with a manually-started instance.
  # A degraded tts_wrapper is NOT a reason to kill and restart the whole
  # server — it's a non-critical service that the primary (Edge TTS) and
  # the native fallback (tts-server.exe :8891) cover without it.
  #
  # Critical services that DO warrant a server restart when degraded:
  #   - whisper_server (:8001) — the only STT engine; no fallback if down
  #   - tts_server (:8891) — the native Qwen3-TTS fallback; if this is down
  #     AND Hermes Edge TTS is also down, voice replies have no TTS at all
  # Non-critical (degraded is OK, no restart):
  #   - tts_wrapper (:8890) — Python proxy, frequently crashes on port conflict
  try {
    $resp = Invoke-WebRequest "http://127.0.0.1:6767/v1/stack/status" -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -ne 200) { return $false }
    $status = $resp.Content | ConvertFrom-Json
    
    # 1. Verify QWENTTS or Whisper STT aren't misconfigured or unconfigured in the active process
    if ($status.whisper_stt.status -eq "unconfigured") { return $false }
    
    # 2. Check critical services only — skip tts_wrapper (non-critical fallback proxy)
    $criticalServices = @("whisper_server", "tts_server")
    foreach ($srv in $status.services) {
      if ($criticalServices -contains $srv.name -and $srv.state -eq "degraded") {
        return $false
      }
    }
    return $true
  } catch {
    return $false
  }
}

function Test-LlmInferencingHealthy {
  # Probe Hermes gateway with a minimal chat completion to detect LLM hangs.
  # The server can be UP (port listening, /health 200) while the LLM is
  # wedged — e.g. Ollama model unloaded, Hermes gateway 429 retry storm,
  # or a truncated-response infinite continuation loop. A simple 1-token
  # completion with a short timeout detects these without consuming
  # significant context or compute.
  #
  # Retry once on a transient failure (cold-start LLM, brief 429, network
  # blip) so a single slow probe does NOT trigger a server restart. A real
  # hang fails both attempts; a cold start usually succeeds on the second.
  $key = $script:hermesKey
  if (-not $key) { return $true }  # can't test without key — assume OK
  $body = @{
    model = "hermes-agent"
    messages = @(@{ role = "user"; content = "1" })
    max_tokens = 5
    stream = $false
  } | ConvertTo-Json -Depth 3 -Compress
  # Timeout: the local 1M-context model (nemotron-1m-ctx) can take ~30-60s to
  # cold-load after `OLLAMA_KEEP_ALIVE=30m` idle. A 30s probe times out on a
  # perfectly healthy cold start and false-positives as "LLM hung", which then
  # triggers the host-killing server restart. Use a generous 90s timeout so a
  # cold load completes; only a genuine hang exceeds it.
  for ($attempt = 1; $attempt -le 2; $attempt++) {
    try {
      $resp = Invoke-WebRequest "http://127.0.0.1:8642/v1/chat/completions" `
        -Method POST -Body $body -ContentType "application/json" `
        -Headers @{Authorization = "Bearer $key"} `
        -UseBasicParsing -TimeoutSec 90
      if ($resp.StatusCode -ne 200) { continue }
      # Verify the response has actual content (not an empty/truncated response)
      $json = $resp.Content | ConvertFrom-Json
      if (-not $json.choices -or $json.choices.Count -eq 0) { continue }
      $content = $json.choices[0].message.content
      if (-not $content -or $content.Trim() -eq "") { continue }
      return $true
    } catch {
      # Transient failure — retry once before declaring the LLM unhealthy.
      # A cold load may legitimately exceed the first attempt; give it more
      # time on the retry (the model is now mid-load).
      Start-Sleep -Seconds 15
    }
  }
  return $false
}

function Start-TtsServer {
  # Start tts-server.exe (Vulkan native C++) — NOT the Python wrapper
  # which hangs on ROCm/PyTorch. The native binary uses OpenAI format
  # (/v1/audio/speech) with greedy temperature=0, WAV output, --max-batch 2.
  Start-Process -FilePath $TtsServerExe `
    -ArgumentList "--model",$TtsModel,"--codec",$TtsCodec,"--port","8891","--lang","auto","--codec-chunk-dur","10.0","--max-batch","2" `
    -WorkingDirectory $QwenttsRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$RepoRoot\tts-vulkan.log" `
    -RedirectStandardError "$RepoRoot\tts-vulkan-err.log"
}

function Start-WhisperServer {
  # Start whisper-server.exe (whisper.cpp, Vulkan iGPU STT).
  # --suppress-nst reduces hallucination; --no-speech-thold 0.5 filters
  # non-speech audio; --beam-size 5 improves accuracy; VAD further reduces false triggers.
  Start-Process -FilePath $WhisperServerExe `
    -ArgumentList "--model",$WhisperModel,"--port","8001","--suppress-nst","--no-speech-thold","0.5","--beam-size","5","--no-flash-attn","--language","zh","--prompt","橘宝agent-meow语音工作目录会话" `
    -WorkingDirectory $WhisperRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$RepoRoot\whisper-vulkan.log" `
    -RedirectStandardError "$RepoRoot\whisper-vulkan-err.log"
}

function Start-MeowServer {
  # PYTHONUTF8: without it the host daemon crashes on GBK-locale encode
  # errors ('gbk' codec can't encode '\ufffd') and reconnect-loops forever.
  # Use the canonical DB at ~/.agent-meow/chat.db (NOT repo-relative
  # agent_meow.db — the two diverge and sessions created under one are
  # invisible to the other).
  $CanonicalDb = "sqlite:///C:/Users/K16/.agent-meow/chat.db"
  $envCmd = "`$env:PYTHONUTF8='1';" +
    "`$env:PYTHONIOENCODING='utf-8';" +
    "`$env:AGENT_MEOW_LOCAL_SINGLE_USER='1';" +
    "`$env:AGENT_MEOW_BUILTIN_AGENT_DIRS='$RepoRoot\examples\hermes-gateway\config.yaml';" +
    "`$env:HERMES_VOICE_URL='http://127.0.0.1:8642';" +
    "`$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1';" +
    "`$env:QWENTTS_SERVER_URL='http://127.0.0.1:8891';" +
    "`$env:QWENTTS_SERVER_EXE='$TtsServerExe';" +
    "`$env:QWENTTS_MODEL='$TtsModel';" +
    "`$env:QWENTTS_CODEC='$TtsCodec';" +
    "`$env:QWENTTS_LANG='auto';" +
    "`$env:QWENTTS_CODEC_CHUNK_DUR='10.0';" +
    "`$env:WHISPER_STT_URL='http://127.0.0.1:8001';" +
    "`$env:WHISPER_SERVER_EXE='$WhisperServerExe';" +
    "`$env:WHISPER_SERVER_MODEL='$WhisperModel';" +
    "`$env:AGENT_MEOW_AUTO_TAG='true';" +
    "`$env:AGENT_MEOW_AUTO_TAG_INTERVAL='300';" +
    "`$env:AGENT_MEOW_AUTO_TAG_BATCH='5';" +
    "`$env:AGENT_MEOW_AUTO_TAG_COOLDOWN='600';" +
    "`$env:AGENT_MEOW_DICTATION_ENGINE='whisper';" +
    "`$env:AGENT_MEOW_DICTATION_WHISPER_URL='http://127.0.0.1:8001/inference';" +
    # Raise the harness idle turn watchdog from 600s to 900s so local
    # ollama models processing large context windows (1M tokens) don't
    # get killed prematurely with "run_turn emitted no events for 600s".
    "`$env:HARNESS_TURN_TIMEOUT_S='900';" +
    "`$env:OLLAMA_KEEP_ALIVE='30m';"
  if ($script:hermesKey) { $envCmd += "`$env:HERMES_API_KEY='$script:hermesKey';" }

  # Wait for STT and TTS ports to bind before launching agent-meow server,
  # preventing agent-meow's internal supervisor from double-spawning duplicates.
  $portsWaited = 0
  while ($portsWaited -lt 15 -and (-not (Test-Port 8001) -or -not (Test-Port 8891))) {
    Start-Sleep -Seconds 1
    $portsWaited++
  }

  Start-Process -FilePath "powershell" -WindowStyle Hidden -ArgumentList "-NoProfile","-Command",`
    "Set-Location '$RepoRoot'; $envCmd & '$VenvPython' -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri $CanonicalDb *> server-native.log"
}

$script:hermesKey = $null
$webEnv = Join-Path $RepoRoot "web\.env"
if (Test-Path $webEnv) {
  $m = Select-String -Path $webEnv -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1
  if ($m) { $script:hermesKey = $m.Matches[0].Groups[1].Value }
}

function Stop-MeowServer {
  # Kill the agent_meow server process, then VERIFY it is gone and port 6767
  # is released before returning. This prevents the "too many PIDs"
  # tunnel-stuck scenario: if the old server doesn't die before the new one
  # starts, they fight over the single host tunnel and neither stays
  # connected. A fixed 3s sleep is NOT enough — a stuck server can hold port
  # 6767 for much longer, so we poll until it's actually free.
  #
  # NOTE: we do NOT kill `_daemon_entry` host processes here. The host daemon
  # has its own reconnect loop and reconnects to the restarted server on its
  # own; force-killing it was what kept the host permanently offline. The
  # server's LocalHostSupervisor (agent_meow/server/local_host.py) also
  # auto-respawns a host if none reconnects.
  Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" |
    Where-Object { $_.CommandLine -match "agent_meow server" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  # Remove stale pidfile so server start doesn't see a dead PID.
  Remove-Item (Join-Path $env:USERPROFILE ".agent-meow\local_server.pid") -Force -ErrorAction SilentlyContinue
  # Wait up to 15s for port 6767 to be released (the old server may be stuck
  # in shutdown). If it's still bound, the next cycle retries rather than
  # spawning a duplicate that fights the tunnel.
  $released = 0
  while ($released -lt 15 -and (Test-Port 6767)) {
    Start-Sleep -Seconds 1
    $released++
  }
  if (Test-Port 6767) {
    "[watchdog] Stop-MeowServer: port 6767 still bound after ${released}s — skipping restart this cycle" |
      Out-File "$RepoRoot\watchdog-start-failed.log" -Append
    return $false
  }
  return $true
}

# 2. agent-meow server down -> restart with full env
if (-not (Test-Port 6767)) {
  # Kill orphaned daemons + stale server procs before restart so the
  # new server isn't fighting old _daemon_entry workers for the tunnel.
  if (-not (Stop-MeowServer)) { exit 0 }
  Start-MeowServer
  # Post-start verification: wait up to 20s for the server to bind
  # port 6767. If it doesn't come up, the next watchdog cycle will
  # try again — but at least we don't silently report success.
  $waited = 0
  while ($waited -lt 20 -and -not (Test-Port 6767)) {
    Start-Sleep -Seconds 2
    $waited += 2
  }
  if (Test-Port 6767) {
    # Server bound — skip the host check this cycle; the next run
    # verifies the daemon tunnel is connected.
    exit 0
  } else {
    # Server failed to start within 20s — log it but still exit 0
    # so the scheduled task doesn't pile up. The next cycle retries.
    "[watchdog] Start-MeowServer fired but port 6767 not listening after ${waited}s" |
      Out-File "$RepoRoot\watchdog-start-failed.log" -Append
    exit 0
  }
}

# 3. Server up but LLM inferencing hung -> restart the server. The host
#    daemon's offline/online state is handled by the server's own
#    LocalHostSupervisor (agent_meow/server/local_host.py), which auto-restarts
#    a dead host with backoff — the watchdog should NOT restart the server just
#    because the host is transiently offline (that was the recurring cause of
#    the host flap: a cold-start LLM probe or a brief liveness blip triggered a
#    kill-and-restart that knocked the host offline).
#    LLM hang detection: the server can be UP (port 6767 listening, /health
#    200) while Hermes/Ollama LLM inferencing is wedged — Ollama model
#    unloaded, Hermes 429 retry storm, or truncated-response continuation
#    loop. Test-LlmInferencingHealthy probes with a 1-token completion to
#    detect this without consuming significant context. It now tolerates a
#    cold 1M-model load (90s timeout), so it only returns false on a genuine
#    hang.
$llmHealthy = Test-LlmInferencingHealthy
if (-not $llmHealthy) {
  "[watchdog] LLM inferencing unhealthy — restarting server (Hermes/Ollama hang detected)" |
    Out-File "$RepoRoot\watchdog-llm-restart.log" -Append
  # Give the LLM a final chance to recover (a cold load may have just
  # finished) before declaring it wedged.
  Start-Sleep -Seconds 10
  if (Test-LlmInferencingHealthy) { exit 0 }

  # Kill the server (NOT the host daemon) and VERIFY port 6767 is released
  # before restarting. Without this, a stuck server holds the port and the new
  # server spawns as a duplicate that fights the tunnel (the "too many PIDs"
  # scenario). Stop-MeowServer polls until the port is free.
  if (-not (Stop-MeowServer)) { exit 0 }
  Start-MeowServer
}

# 4. TTS-server.exe :8891 down -> restart (the native Vulkan C++ binary).
#    Edge TTS (Hermes) is primary; tts-server.exe is the offline fallback.
#    If tts-server.exe is down AND Hermes Edge TTS is also down, voice
#    replies have no TTS — so restart tts-server.exe independently.
if (-not (Test-Port 8891)) {
  Start-TtsServer
  Start-Sleep -Seconds 5
}
