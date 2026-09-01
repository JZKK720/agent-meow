# Voice pipeline smoke test + benchmark.
# Tests each stage: STT, LLM, TTS, measuring latency at each step.
# Requires all 4 services: :8001 (whisper), :8642 (hermes), :8891 (tts), :6767 (agent-meow).

$RepoRoot = "C:\Users\K16\github-pr\agent-meow"
$hermesKey = (Select-String -Path "$RepoRoot\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1).Matches[0].Groups[1].Value

function Test-Port($p) {
  (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) -ne $null
}

function Fmt($ms) { "{0,8:N0}ms" -f $ms }

# Chinese strings as Unicode escapes (avoids PS5.1 encoding issues)
# ni hao shi jie
$zhHello = [char]0x4F60 + [char]0x597D + [char]0x4E16 + [char]0x754C
# ni hao ma? jin tian tian qi zen me yang?
$zhQuestion = [char]0x4F60 + [char]0x597D + [char]0x5417 + [char]0xFF1F + [char]0x4ECA + [char]0x5929 + [char]0x5929 + [char]0x6C14 + [char]0x600E + [char]0x4E48 + [char]0x6837 + [char]0xFF1F
# zhe shi yi ge shao chang de ju zi ce shi yu yin he cheng
$zhMedium = [char]0x8FD9 + [char]0x662F + [char]0x4E00 + [char]0x4E2A + [char]0x7A0D + [char]0x957F + [char]0x7684 + [char]0x53E5 + [char]0x5B50 + [char]0x6D4B + [char]0x8BD5 + [char]0x8BED + [char]0x97F3 + [char]0x5408 + [char]0x6210
# yong yi ju hua jie shao ni zi ji
$zhIntro = [char]0x7528 + [char]0x4E00 + [char]0x53E5 + [char]0x8BDD + [char]0x4ECB + [char]0x7ECD + [char]0x4F60 + [char]0x81EA + [char]0x5DF1
# ni hao shi jie, wo shi ju bao, yi ge jin hua de ju mao AIRR
$zhLong = $zhHello + [char]0xFF0C + [char]0x6211 + [char]0x662F + [char]0x6A58 + [char]0x5B9D + [char]0xFF0C + [char]0x4E00 + [char]0x4E2A + [char]0x8FDB + [char]0x5316 + [char]0x7684 + [char]0x6A58 + [char]0x732B + "AIRR"

Write-Host "=== Voice Pipeline Benchmark ===" -ForegroundColor Cyan
Write-Host ""

# Pre-flight
$ports = @(8001, 8642, 8891, 6767)
$names = @("whisper :8001", "hermes  :8642", "tts     :8891", "meow    :6767")
$allUp = $true
for ($i = 0; $i -lt 4; $i++) {
  $up = Test-Port $ports[$i]
  $st = if ($up) { "UP" } else { "DOWN" }
  $cl = if ($up) { "Green" } else { "Red" }
  Write-Host "  $($names[$i]) : $st" -ForegroundColor $cl
  if (-not $up) { $allUp = $false }
}
if (-not $allUp) { Write-Host "`nABORT: Not all services up." -ForegroundColor Red; exit 1 }
Write-Host ""

# Stage 1: TTS direct
Write-Host "--- Stage 1: TTS Direct (:8891) ---" -ForegroundColor Yellow
$ttsTests = @(
  @{ text = $zhHello; label = "short-zh" },
  @{ text = $zhQuestion; label = "question-zh" },
  @{ text = $zhMedium; label = "medium-zh" }
)
foreach ($t in $ttsTests) {
  $body = @{ input = $t.text; model = "qwen3-tts"; voice = "Serena" } | ConvertTo-Json -Depth 3
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8891/v1/audio/speech" -Method POST -Body $bytes -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -UseBasicParsing
    $sw.Stop()
    $audioMs = [math]::Round($r.Content.Length / 48.0)
    Write-Host ("  {0,-15} {1}  {2,7:N0}B  audio={3,6:N0}ms" -f $t.label, (Fmt $sw.ElapsedMilliseconds), $r.Content.Length, $audioMs)
  } catch {
    $sw.Stop()
    Write-Host ("  {0,-15} {1}  ERROR" -f $t.label, (Fmt $sw.ElapsedMilliseconds)) -ForegroundColor Red
  }
}
Write-Host ""

# Stage 2: TTS via Hermes
Write-Host "--- Stage 2: TTS via Hermes (:8642) ---" -ForegroundColor Yellow
# Note: Do NOT send model="qwen3-tts" 鈥?Hermes interprets it as a provider
# name lookup. The configured provider is "qwen-offline", not "qwen3-tts".
# Sending an unknown provider name causes Hermes to fall back to Edge TTS.
# When no model/provider is sent, Hermes uses its configured default.
$body = @{ input = $zhHello; voice = "Serena" } | ConvertTo-Json -Depth 3
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$headers = @{ "Authorization" = "Bearer $hermesKey" }
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/audio/speech" -Method POST -Body $bytes -Headers $headers -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -UseBasicParsing
  $sw.Stop()
  Write-Host ("  hermes-tts      {0}  {1,7:N0}B" -f (Fmt $sw.ElapsedMilliseconds), $r.Content.Length)
} catch {
  $sw.Stop()
  Write-Host ("  hermes-tts      {0}  ERROR: {1}" -f (Fmt $sw.ElapsedMilliseconds), $_.Exception.Message) -ForegroundColor Red
}
Write-Host ""

# Stage 3: LLM via Hermes
Write-Host "--- Stage 3: LLM via Hermes (:8642) ---" -ForegroundColor Yellow
# Hermes ignores the model field and uses its configured default
# (nemotron-3.5-lightning:30b-a3b). We send the correct model name for clarity.
$llmBody = @{ model = "nemotron-3.5-lightning:30b-a3b"; messages = @(@{ role = "user"; content = $zhIntro }); max_tokens = 50; stream = $false } | ConvertTo-Json -Depth 5
$llmBytes = [System.Text.Encoding]::UTF8.GetBytes($llmBody)
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8642/v1/chat/completions" -Method POST -Body $llmBytes -Headers $headers -ContentType "application/json; charset=utf-8" -TimeoutSec 60 -UseBasicParsing
  $sw.Stop()
  $resp = $r.Content | ConvertFrom-Json
  $text = $resp.choices[0].message.content
  $preview = $text.Substring(0, [math]::Min(30, $text.Length))
  Write-Host ("  llm-response    {0}  tokens={1}" -f (Fmt $sw.ElapsedMilliseconds), $resp.usage.completion_tokens)
  Write-Host "  text: $preview"
} catch {
  $sw.Stop()
  Write-Host ("  llm-response    {0}  ERROR: {1}" -f (Fmt $sw.ElapsedMilliseconds), $_.Exception.Message) -ForegroundColor Red
}
Write-Host ""

# Stage 4: STT via whisper-server
Write-Host "--- Stage 4: STT via whisper-server (:8001) ---" -ForegroundColor Yellow
# Synthesize a LONGER test audio for reliable language detection.
# Short clips (<1s) cause whisper to misdetect language as English.
$body = @{ input = $zhLong; model = "qwen3-tts"; voice = "Serena" } | ConvertTo-Json -Depth 3
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$r = Invoke-WebRequest -Uri "http://127.0.0.1:8891/v1/audio/speech" -Method POST -Body $bytes -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -UseBasicParsing
$pcmBytes = $r.Content
Write-Host ("  synthesized: {0:N0}B ({1:N1}s audio)" -f $pcmBytes.Length, ($pcmBytes.Length / 48000.0))

# Wrap PCM into WAV (48kHz, 16-bit, mono)
$sr = 48000; $bps = 16; $ch = 1; $dl = $pcmBytes.Length
$wh = New-Object byte[] 44
[BitConverter]::GetBytes([uint32]0x46464952).CopyTo($wh, 0)
[BitConverter]::GetBytes([uint32]($dl + 36)).CopyTo($wh, 4)
[BitConverter]::GetBytes([uint32]0x45564157).CopyTo($wh, 8)
[BitConverter]::GetBytes([uint32]0x20746d66).CopyTo($wh, 12)
[BitConverter]::GetBytes([uint32]16).CopyTo($wh, 16)
[BitConverter]::GetBytes([uint16]1).CopyTo($wh, 20)
[BitConverter]::GetBytes([uint16]$ch).CopyTo($wh, 22)
[BitConverter]::GetBytes([uint32]$sr).CopyTo($wh, 24)
[BitConverter]::GetBytes([uint32]($sr * $ch * $bps / 8)).CopyTo($wh, 28)
[BitConverter]::GetBytes([uint16]($ch * $bps / 8)).CopyTo($wh, 32)
[BitConverter]::GetBytes([uint16]$bps).CopyTo($wh, 34)
[BitConverter]::GetBytes([uint32]0x61746164).CopyTo($wh, 36)
[BitConverter]::GetBytes([uint32]$dl).CopyTo($wh, 40)
$wavBytes = New-Object byte[] ($wh.Length + $dl)
$wh.CopyTo($wavBytes, 0)
$pcmBytes.CopyTo($wavBytes, 44)

# POST multipart to whisper-server
$boundary = "----FormBoundary7MA4YWxkTrZu0gW"
$LF = "`r`n"
# Include language=zh form field 鈥?the /inference API endpoint has its own
# default language (en) that overrides the CLI --language flag. Must send
# language=zh in the form data to get Chinese transcription.
$bodyHead = "--$boundary$LF" + "Content-Disposition: form-data; name=`"language`"$LF$LF" + "zh$LF" + "--$boundary$LF" + "Content-Disposition: form-data; name=`"file`"; filename=`"test.wav`"$LF" + "Content-Type: audio/wav$LF$LF"
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyHead)
$endBound = [System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF")
$multipart = New-Object byte[] ($bodyBytes.Length + $wavBytes.Length + $endBound.Length)
$bodyBytes.CopyTo($multipart, 0)
$wavBytes.CopyTo($multipart, $bodyBytes.Length)
$endBound.CopyTo($multipart, $bodyBytes.Length + $wavBytes.Length)

$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8001/inference" -Method POST -Body $multipart -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30 -UseBasicParsing
  $sw.Stop()
  $resp = $r.Content | ConvertFrom-Json
  Write-Host ("  stt-result      {0}  text={1}" -f (Fmt $sw.ElapsedMilliseconds), $resp.text)
} catch {
  $sw.Stop()
  Write-Host ("  stt-result      {0}  ERROR: {1}" -f (Fmt $sw.ElapsedMilliseconds), $_.Exception.Message) -ForegroundColor Red
}
Write-Host ""

# Stage 5: agent-meow health
Write-Host "--- Stage 5: agent-meow Health (:6767) ---" -ForegroundColor Yellow
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $h = Invoke-RestMethod -Uri "http://127.0.0.1:6767/health" -TimeoutSec 5
  $sw.Stop()
  Write-Host ("  health          {0}  status={1}" -f (Fmt $sw.ElapsedMilliseconds), $h.status)
} catch {
  $sw.Stop()
  Write-Host ("  health          {0}  ERROR" -f (Fmt $sw.ElapsedMilliseconds)) -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Benchmark Complete ===" -ForegroundColor Cyan
