$ErrorActionPreference = "Continue"
$pass = 0; $fail = 0
function OK($m) { Write-Output "  [PASS] $m"; $script:pass++ }
function BAD($m) { Write-Output "  [FAIL] $m"; $script:fail++ }
$curl = "C:\Windows\System32\curl.exe"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

Write-Output "============================================"
Write-Output "  FULL E2E AUDIT $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Output "============================================"

# ── A1. Process inventory ──
Write-Output "── A1. Process inventory ──"
$procs = Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match "agent_meow" }
Write-Output "  total=$(@($procs).Count)"

# ── A2. Port listeners ──
Write-Output "── A2. Port listeners ──"
foreach ($p in 6767, 8642, 8891, 11434) {
  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($c) { OK ":$p LISTENING" } else { BAD ":$p not listening" }
}

# ── A3. Backend :6767 REST ──
Write-Output "── A3. Backend REST ──"
$h = & $curl -s http://127.0.0.1:6767/health
if ($h -match '"ok"') { OK "/health 200" } else { BAD "/health: $h" }
$ho = & $curl -s http://127.0.0.1:6767/v1/hosts
if ($ho -match '"hosts"') { OK "/v1/hosts 200" } else { BAD "/v1/hosts" }
$se = & $curl -s "http://127.0.0.1:6767/v1/sessions?limit=1"
if ($se -match '"data"') { OK "/v1/sessions 200" } else { BAD "/v1/sessions" }

# ── A4. Stack status ──
Write-Output "── A4. Stack status ──"
$st = & $curl -s http://127.0.0.1:6767/v1/stack/status
if ($st -match '"hermes":\{"status":"ok"') { OK "hermes ok" } else { BAD "hermes NOT ok" }
if ($st -match '"ollama":\{"status":"ok"') { OK "ollama ok" } else { BAD "ollama NOT ok" }

# ── A5. Ollama keep-alive ──
Write-Output "── A5. Ollama keep-alive ──"
$psj = & $curl -s http://127.0.0.1:11434/api/ps
if ($psj -match '"expires_at":"([^"]+)"') {
  $exp = [DateTime]::Parse($Matches[1])
  $m = [math]::Round(($exp - (Get-Date)).TotalMinutes, 0)
  if ($m -gt 15) { OK "keep-alive ~$m min (30m confirmed)" }
  elseif ($m -gt 0) { BAD "keep-alive ~$m min (short, not 30m)" }
  else { BAD "keep-alive: model expired ($m min)" }
} else { BAD "no model loaded in VRAM" }

# ── B1. Gateway health ──
Write-Output "── B1. Gateway health ──"
$gw = & $curl -s http://127.0.0.1:8642/health
if ($gw -match '"ok"') { OK "gateway /health 200" } else { BAD "gateway: $gw" }

# ── B2. LLM via gateway ──
Write-Output "── B2. LLM via gateway ──"
$key = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
$llmBody = '{"model":"auto","messages":[{"role":"user","content":"reply with exactly: OK"}],"max_tokens":10,"stream":false}'
[System.IO.File]::WriteAllText("$env:TEMP\llm.json", $llmBody, $utf8NoBom)
$llm = & $curl -s --max-time 120 -X POST http://127.0.0.1:8642/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer $key" -d "@$env:TEMP\llm.json"
if ($llm -match '"content":"([^"]*)"') { OK "gateway LLM: $($Matches[1])" } else { BAD "gateway LLM: $($llm.Substring(0,[Math]::Min(80,$llm.Length)))" }

# ── B3. LLM via :6767 proxy ──
Write-Output "── B3. LLM via :6767 proxy ──"
$llm2 = & $curl -s --max-time 120 -X POST http://127.0.0.1:6767/v1/chat/completions -H "Content-Type: application/json" -d "@$env:TEMP\llm.json"
if ($llm2 -match '"content":"([^"]*)"') { OK "proxy LLM: $($Matches[1])" } else { BAD "proxy LLM: $($llm2.Substring(0,[Math]::Min(80,$llm2.Length)))" }

# ── B4. TTS via :6767 ──
Write-Output "── B4. TTS via :6767 ──"
$ttsBody = '{"text":"Hello world","voice":"Vivian"}'
[System.IO.File]::WriteAllText("$env:TEMP\tts.json", $ttsBody, $utf8NoBom)
$tc = & $curl -s --max-time 30 -X POST http://127.0.0.1:6767/v1/audio/speech -H "Content-Type: application/json" -d "@$env:TEMP\tts.json" -o "$env:TEMP\tts.bin" -w "%{http_code}"
if ($tc -eq "200") { OK "TTS proxy 200 ($([math]::Round((Get-Item "$env:TEMP\tts.bin").Length/1KB,0))KB)" } else { BAD "TTS proxy HTTP $tc" }

# ── B5. TTS :8891 direct ──
Write-Output "── B5. TTS :8891 direct ──"
$td = & $curl -s --max-time 30 -X POST http://127.0.0.1:8891/v1/audio/speech -H "Content-Type: application/json" -d "@$env:TEMP\tts.json" -o "$env:TEMP\ttsd.bin" -w "%{http_code}"
if ($td -eq "200") { OK "TTS direct 200 ($([math]::Round((Get-Item "$env:TEMP\ttsd.bin").Length/1KB,0))KB)" } else { BAD "TTS direct HTTP $td" }

# ── B6. STT via :6767 ──
Write-Output "── B6. STT via :6767 ──"
$wavHeader = [byte[]](0x52,0x49,0x46,0x46,0x24,0x07,0x00,0x00,0x57,0x41,0x56,0x45,0x66,0x6D,0x74,0x20,0x10,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x80,0x3E,0x00,0x00,0x00,0x7D,0x00,0x00,0x02,0x00,0x10,0x00,0x64,0x61,0x74,0x61,0x00,0x07,0x00,0x00)
$wavData = New-Object byte[] 3200
$wavFull = $wavHeader + $wavData
[System.IO.File]::WriteAllBytes("$env:TEMP\stt.wav", $wavFull)
$sc = & $curl -s --max-time 60 -X POST http://127.0.0.1:6767/v1/audio/transcriptions -F "file=@$env:TEMP\stt.wav" -w "%{http_code}"
if ($sc -match "200|500") { OK "STT HTTP $sc (route mounted)" } else { BAD "STT HTTP $sc" }

# ── C1. SPA bundle ──
Write-Output "── C1. SPA bundle ──"
& $curl -s -o "$env:TEMP\idx.html" http://127.0.0.1:6767/
$html = [System.IO.File]::ReadAllText("$env:TEMP\idx.html")
if ($html -match 'index-([A-Za-z0-9_-]+)\.js') {
  $bundleName = $Matches[1]
  $bundlePath = "C:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets\index-$bundleName.js"
  $bf = Get-ChildItem $bundlePath -ErrorAction SilentlyContinue
  if ($bf) {
    $ageMin = [math]::Round(((Get-Date) - $bf.LastWriteTime).TotalMinutes, 0)
    OK "bundle index-$bundleName.js ($ageMin min old)"
  } else { BAD "bundle file not found on disk" }
} else { BAD "no bundle in index.html" }

# ── C2. UI features ──
Write-Output "── C2. UI/UX feature markers ──"
if ($bf -and (Test-Path $bf.FullName)) {
  $bundleContent = [System.IO.File]::ReadAllText($bf.FullName)
  $featureNames = @(
    @("Phase1 OpenUI", "openui"),
    @("Phase2 genUi /v1/sessions", "/v1/sessions"),
    @("Phase2 genUi /v1/hosts", "/v1/hosts"),
    @("Phase2 genUi stack_status", "stack_status"),
    @("Phase2 genUi list_projects", "list_projects"),
    @("Phase3 HTML Rendered", "Rendered"),
    @("Phase3 HTML Raw", "Raw"),
    @("Phase4 Pyodide", "pyodide"),
    @("Phase4 Pyodide error", "Failed to load Pyodide"),
    @("i18n Runtime Status", "Runtime Status")
  )
  foreach ($pair in $featureNames) {
    $name = $pair[0]
    $needle = $pair[1]
    if ($bundleContent -match [regex]::Escape($needle)) { OK $name } else { BAD "$name MISSING" }
  }
  # Check zh separately
  $zhNeedle = [string]([char]0x8FD0) + [string]([char]0x884C)
  if ($bundleContent -match [regex]::Escape($zhNeedle)) { OK "i18n Runtime Status (zh)" } else { BAD "i18n Runtime Status (zh) MISSING" }
} else { BAD "cannot read bundle for feature check" }

# ── C3. SPA routes ──
Write-Output "── C3. SPA routes ──"
foreach ($r in "/settings", "/settings/runtime", "/settings/appearance", "/settings/media") {
  $rc = & $curl -s -o NUL -w "%{http_code}" "http://127.0.0.1:6767$r"
  if ($rc -eq "200") { OK "route $r 200" } else { BAD "route $r -> $rc" }
}

# ── C4. Host tunnel ──
Write-Output "── C4. Host tunnel ──"
$hj = & $curl -s http://127.0.0.1:6767/v1/hosts
if ($hj -match '"status":"online"') { OK "host tunnel online" } else { BAD "host tunnel" }

# ── C5. OpenAPI ──
Write-Output "── C5. OpenAPI ──"
$oa = & $curl -s http://127.0.0.1:6767/openapi.json
if ($oa -match '"paths"') {
  $oaObj = $oa | ConvertFrom-Json
  OK "OpenAPI $($oaObj.paths.PSObject.Properties.Count) paths"
} else { BAD "OpenAPI not served" }

# ── D1. Fallback config ──
Write-Output "── D1. Fallback config ──"
$cfg = Get-Content "C:\Users\1\github-pr\hermes-agent\data\config.yaml" -Raw
if ($cfg -match "default:\s*(nemotron\S+)") { OK "primary: $($Matches[1])" } else { BAD "primary not found" }
if ($cfg -match "model:\s*(ornith\S+)") { OK "fallback: $($Matches[1])" } else { BAD "fallback not ornith" }

Write-Output ""
Write-Output "============================================"
Write-Output "  RESULT: $pass passed, $fail failed"
Write-Output "============================================"

# Cleanup
Remove-Item "$env:TEMP\llm.json", "$env:TEMP\tts.json", "$env:TEMP\tts.bin", "$env:TEMP\ttsd.bin", "$env:TEMP\stt.wav", "$env:TEMP\idx.html" -Force -ErrorAction SilentlyContinue
