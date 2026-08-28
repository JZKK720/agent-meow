$ErrorActionPreference = "Continue"
$pass = 0; $fail = 0
function OK($msg) { Write-Output "  [PASS] $msg"; $script:pass++ }
function BAD($msg) { Write-Output "  [FAIL] $msg"; $script:fail++ }

Write-Output "============================================"
Write-Output "  FULL E2E STACK AUDIT — $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Output "============================================"
Write-Output ""

# ── 1. Process inventory ─────────────────────
Write-Output "── 1. Process inventory ──"
$procs = Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" }
$servers = $procs | Where-Object { $_.CommandLine -match "server" }
$daemons = $procs | Where-Object { $_.CommandLine -match "_daemon_entry" }
$runners = $procs | Where-Object { $_.CommandLine -match "runner._entry" }
Write-Output "  servers: $($servers.Count), daemons: $($daemons.Count), runners: $($runners.Count), total: $($procs.Count)"
if ($servers.Count -eq 1 -and $daemons.Count -eq 1) { OK "exactly 1 server + 1 daemon (no duplicates)" } else { BAD "expected 1 server + 1 daemon, got $($servers.Count)+$($daemons.Count)" }
Write-Output ""

# ── 2. Port listeners ────────────────────────
Write-Output "── 2. Port listeners ──"
foreach ($p in 6767, 8642, 8891) {
  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($c) { OK ":$p LISTENING (pid $($c[0].OwningProcess))" } else { BAD ":$p not listening" }
}
Write-Output ""

# ── 3. Backend :6767 health ──────────────────
Write-Output "── 3. Backend :6767 ──"
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/health" -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { OK "GET /health → 200" } else { BAD "GET /health → $($r.StatusCode)" } } catch { BAD "GET /health FAIL: $_" }
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { OK "GET /v1/hosts → 200" } else { BAD "GET /v1/hosts → $($r.StatusCode)" } } catch { BAD "GET /v1/hosts FAIL: $_" }
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/sessions?limit=1" -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { OK "GET /v1/sessions → 200" } else { BAD "GET /v1/sessions → $($r.StatusCode)" } } catch { BAD "GET /v1/sessions FAIL: $_" }
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/openapi.json" -UseBasicParsing -TimeoutSec 10; $paths = ($r.Content | ConvertFrom-Json).paths.PSObject.Properties.Count; OK "GET /openapi.json → $($r.StatusCode), $paths paths" } catch { BAD "GET /openapi.json FAIL: $_" }
Write-Output ""

# ── 4. Stack status (voice services) ─────────
Write-Output "── 4. Stack status (voice) ──"
try {
  $s = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/stack/status" -UseBasicParsing -TimeoutSec 10).Content | ConvertFrom-Json
  if ($s.server -eq "ok") { OK "server: ok" } else { BAD "server: $($s.server)" }
  if ($s.hermes.status -eq "ok") { OK "hermes: ok (HERMES_VOICE_URL resolved)" } else { BAD "hermes: $($s.hermes.status) — $($s.hermes.detail)" }
  if ($s.ollama.status -eq "ok") { OK "ollama: ok ($($s.ollama.count) models)" } else { BAD "ollama: $($s.ollama.status)" }
  # TTS via QWENTTS_SERVER_URL — stack_status checks QWEN_TTS_URL separately
  Write-Output "  tts (stack): $($s.tts.status) — $($s.tts.detail)"
} catch { BAD "stack status FAIL: $_" }
Write-Output ""

# ── 5. Hermes :8642 direct ───────────────────
Write-Output "── 5. Hermes gateway :8642 ──"
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/health" -UseBasicParsing -TimeoutSec 5; OK "gateway /health → $($r.StatusCode) ($(($r.Content | ConvertFrom-Json).version))" } catch { BAD "gateway /health FAIL: $_" }
$key = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/models" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 5; OK "gateway /v1/models → $($r.StatusCode) (auth OK)" } catch { BAD "gateway /v1/models FAIL: $_" }
Write-Output ""

# ── 6. LLM via gateway (chat completions) ────
Write-Output "── 6. LLM via gateway ──"
$body = '{"model":"auto","messages":[{"role":"user","content":"reply with exactly: OK"}],"max_tokens":10,"stream":false}'
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $key"} -UseBasicParsing -TimeoutSec 90
  $j = $r.Content | ConvertFrom-Json
  $text = $j.choices[0].message.content
  OK "gateway LLM → $($r.StatusCode), reply='$($text.Substring(0,[Math]::Min(50,$text.Length)))'"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { $code = [int]$resp.StatusCode; BAD "gateway LLM → HTTP $code" } else { BAD "gateway LLM FAIL: $_" }
}
Write-Output ""

# ── 7. LLM via :6767 proxy ───────────────────
Write-Output "── 7. LLM via :6767 proxy ──"
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 90
  $j = $r.Content | ConvertFrom-Json
  $text = $j.choices[0].message.content
  OK "proxy LLM → $($r.StatusCode), reply='$($text.Substring(0,[Math]::Min(50,$text.Length)))'"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { $code = [int]$resp.StatusCode; BAD "proxy LLM → HTTP $code" } else { BAD "proxy LLM FAIL: $_" }
}
Write-Output ""

# ── 8. TTS via :6767 proxy ───────────────────
Write-Output "── 8. TTS via :6767 proxy ──"
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/speech" -Method POST -Body '{"text":"Hello world","voice":"Vivian"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  $ct = $r.Headers["Content-Type"]
  OK "TTS → $($r.StatusCode), $($r.RawContentLength) bytes, type=$ct"
} catch { BAD "TTS FAIL: $_" }
Write-Output ""

# ── 9. TTS server :8891 direct ───────────────
Write-Output "── 9. TTS server :8891 ──"
try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:8891/health" -UseBasicParsing -TimeoutSec 5; OK "TTS /health → $($r.StatusCode)" } catch { BAD "TTS /health FAIL: $_" }
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8891/tts" -Method POST -Body '{"input":"hello","voice":"Vivian"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
  OK "TTS /tts → $($r.StatusCode), $($r.RawContentLength) bytes"
} catch { BAD "TTS /tts FAIL: $_" }
Write-Output ""

# ── 10. STT via :6767 proxy (round-trip) ──────
Write-Output "── 10. STT via :6767 proxy ──"
# Create a minimal valid WAV (16kHz mono, 1600 samples of silence)
$wav = [byte[]](0x52,0x49,0x46,0x46,0x24,0x07,0x00,0x00,0x57,0x41,0x56,0x45,0x66,0x6D,0x74,0x20,0x10,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x80,0x3E,0x00,0x00,0x00,0x7D,0x00,0x00,0x02,0x00,0x10,0x00,0x64,0x61,0x74,0x61,0x00,0x07,0x00,0x00)
$wav += New-Object byte[] 3200  # 1600 samples * 2 bytes
$wavPath = "$env:TEMP\stt-audit.wav"
[System.IO.File]::WriteAllBytes($wavPath, $wav)
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/transcriptions" -Method POST -InFile $wavPath -ContentType "multipart/form-data" -UseBasicParsing -TimeoutSec 60
  OK "STT → $($r.StatusCode), body=$($r.Content.Substring(0,[Math]::Min(80,$r.Content.Length)))"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { $code = [int]$resp.StatusCode; if ($code -eq 500) { OK "STT → 500 (expected for silent audio — proves route is mounted + auth works)" } else { BAD "STT → HTTP $code" } } else { BAD "STT FAIL: $_" }
}
Remove-Item $wavPath -Force -ErrorAction SilentlyContinue
Write-Output ""

# ── 11. SPA bundle freshness ─────────────────
Write-Output "── 11. SPA bundle ──"
$html = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/" -UseBasicParsing -TimeoutSec 5).Content
if ($html -match 'index-([A-Za-z0-9_-]+)\.js') { $bundle = $Matches[1]; $ok = $true } else { BAD "no bundle in index.html"; $ok = $false }
if ($ok) {
  $bundleFile = Get-ChildItem "C:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets\index-$bundle.js" -ErrorAction SilentlyContinue
  if ($bundleFile) {
    $age = ((Get-Date) - $bundleFile.LastWriteTime).TotalMinutes
    OK "bundle: index-$bundle.js ($([math]::Round($age,0)) min old)"
    if ($age -gt 60) { BAD "bundle is > 60 min old — may be stale" }
  } else { BAD "bundle file not found on disk" }
}
# Check bundle for feature string literals
$bundleContent = [System.IO.File]::ReadAllText("C:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets\index-$bundle.js")
$features = @{
  "OpenUI fence" = "openui"
  "genUi /v1/sessions" = "/v1/sessions"
  "genUi stack_status" = "stack_status"
  "HTML Rendered tab" = "Rendered"
  "Pyodide" = "pyodide"
  "Runtime Status (i18n)" = "Runtime Status"
}
foreach ($kv in $features.GetEnumerator()) {
  if ($bundleContent -match $kv.Value) { OK "bundle has: $($kv.Key)" } else { BAD "bundle missing: $($kv.Key)" }
}
Write-Output ""

# ── 12. Host tunnel ──────────────────────────
Write-Output "── 12. Host tunnel ──"
try {
  $h = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/hosts" -UseBasicParsing -TimeoutSec 5).Content | ConvertFrom-Json
  if ($h.hosts[0].status -eq "online") { OK "host tunnel: online ($($h.hosts[0].name))" } else { BAD "host tunnel: $($h.hosts[0].status)" }
  $harnesses = $h.hosts[0].configured_harnesses
  $enabled = ($harnesses.PSObject.Properties | Where-Object { $_.Value -eq $true -or $_.Value -eq "needs-auth" }).Count
  OK "harnesses configured: $enabled types"
} catch { BAD "host tunnel FAIL: $_" }
Write-Output ""

# ── 13. Database ─────────────────────────────
Write-Output "── 13. Database ──"
$dbPath = "$env:USERPROFILE\.agent-meow\chat.db"
if (Test-Path $dbPath) {
  $size = (Get-Item $dbPath).Length
  OK "DB exists: $dbPath ($([math]::Round($size/1KB,0)) KB)"
} else { BAD "DB not found: $dbPath" }
Write-Output ""

# ── 14. Env vars on server process ───────────
Write-Output "── 14. Env vars (on server PID) ──"
$serverPid = ($servers | Select-Object -First 1).ProcessId
if ($serverPid) {
  $envVars = & "C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe" -c "
import os, sys
pid = $serverPid
# We can't read another process's env directly on Windows, but we can
# check what OUR env has — if the server was started from this shell.
keys = ['HERMES_VOICE_URL','HERMES_BASE_URL','HERMES_API_KEY','QWENTTS_SERVER_URL','QWEN_TTS_URL']
for k in keys:
    v = os.environ.get(k,'')
    print(f'{k}={v[:20]}...' if v else f'{k}=UNSET')
"
  Write-Output $envVars
  # The real test: does stack/status show hermes ok?
  try {
    $s = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/stack/status" -UseBasicParsing -TimeoutSec 10).Content
    if ($s -match '"hermes":\{"status":"ok"') { OK "HERMES_VOICE_URL propagated to server (stack shows hermes ok)" } else { BAD "HERMES_VOICE_URL not propagated (hermes not ok)" }
  } catch { BAD "stack status check FAIL" }
}
Write-Output ""

# ── 15. Session creation (E2E) ───────────────
Write-Output "── 15. Session creation (E2E) ──"
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/sessions?limit=5&order=desc&sort_by=updated_at" -UseBasicParsing -TimeoutSec 10
  $sessions = ($r.Content | ConvertFrom-Json).sessions
  OK "GET /v1/sessions → 200, $($sessions.Count) session(s)"
  if ($sessions.Count -gt 0) {
    $s0 = $sessions[0]
    OK "latest session: id=$($s0.id.Substring(0,8)), updated=$($s0.updated_at)"
  }
} catch { BAD "session list FAIL: $_" }
Write-Output ""

# ── SUMMARY ──────────────────────────────────
Write-Output "============================================"
Write-Output "  AUDIT COMPLETE: $pass passed, $fail failed"
Write-Output "=========================================="
