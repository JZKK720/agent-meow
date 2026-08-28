# Compare TTS latency: direct :8891 vs via agent-meow :6767.
$zhHello = [char]0x4F60 + [char]0x597D + [char]0x4E16 + [char]0x754C

# Test 1: Direct to tts-server :8891
$body1 = @{ input = $zhHello; model = "qwen3-tts"; voice = "Serena" } | ConvertTo-Json -Depth 3
$bytes1 = [System.Text.Encoding]::UTF8.GetBytes($body1)
$sw1 = [System.Diagnostics.Stopwatch]::StartNew()
$r1 = Invoke-WebRequest -Uri "http://127.0.0.1:8891/v1/audio/speech" -Method POST -Body $bytes1 -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -UseBasicParsing
$sw1.Stop()
Write-Host "Direct :8891:  $($sw1.ElapsedMilliseconds)ms  Bytes=$($r1.Content.Length)"

Start-Sleep -Seconds 1

# Test 2: Via agent-meow :6767 (production path)
$body2 = @{ text = $zhHello; language = "Auto"; speaker = "Serena" } | ConvertTo-Json -Depth 3
$bytes2 = [System.Text.Encoding]::UTF8.GetBytes($body2)
$sw2 = [System.Diagnostics.Stopwatch]::StartNew()
$r2 = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/speech" -Method POST -Body $bytes2 -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -UseBasicParsing
$sw2.Stop()
Write-Host "Via :6767:     $($sw2.ElapsedMilliseconds)ms  Bytes=$($r2.Content.Length)"

Start-Sleep -Seconds 1

# Test 3: Via agent-meow :6767 again (warm)
$sw3 = [System.Diagnostics.Stopwatch]::StartNew()
$r3 = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/speech" -Method POST -Body $bytes2 -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -UseBasicParsing
$sw3.Stop()
Write-Host "Via :6767 (2):  $($sw3.ElapsedMilliseconds)ms  Bytes=$($r3.Content.Length)"

Write-Host ""
$overhead = $sw2.ElapsedMilliseconds - $sw1.ElapsedMilliseconds
Write-Host "Proxy overhead: ${overhead}ms"
