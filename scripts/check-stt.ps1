$ErrorActionPreference = "Continue"
# STT round-trip: generate a tiny wav, POST to /v1/audio/transcriptions via proxy.
$wavPath = "$env:TEMP\stt-test.wav"
# 44-byte header + 8000 samples of silence (16-bit mono 16kHz) = valid empty wav
$fs = [System.IO.File]::Create($wavPath)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([byte[]](0x52,0x49,0x46,0x46,0x24,0x3E,0x00,0x00,0x57,0x41,0x56,0x45,0x66,0x6D,0x74,0x20,0x10,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x80,0x3E,0x00,0x00,0x00,0x7D,0x00,0x00,0x02,0x00,0x10,0x00,0x64,0x61,0x74,0x61,0x00,0x3E,0x00,0x00))
$bw.Write((New-Object byte[] 16000))
$bw.Close()

try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6767/v1/audio/transcriptions" -Method POST -InFile $wavPath -ContentType "multipart/form-data" -UseBasicParsing -TimeoutSec 30
  "STT via proxy: status=$($r.StatusCode) body=$($r.Content)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) { "STT via proxy: HTTP $([int]$resp.StatusCode)" } else { "STT via proxy: FAIL $_" }
}
Remove-Item $wavPath -Force -ErrorAction SilentlyContinue
