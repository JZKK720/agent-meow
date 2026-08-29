# Test TTS through agent-meow voice proxy using .NET HttpClient
# (avoids PowerShell's Invoke-WebRequest encoding issues with Chinese text)
Add-Type -AssemblyName System.Net.Http

$hermesKey = (Select-String -Path "c:\Users\1\github-pr\agent-meow\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1).Matches[0].Groups[1].Value.Trim()

$client = New-Object System.Net.Http.HttpClient
$client.Timeout = [TimeSpan]::FromSeconds(30)
$client.DefaultRequestHeaders.Add("Authorization", "Bearer $hermesKey")

# TTS test
$body = '{"input":"hello world","model":"qwen3-tts","voice":"Serena"}'
$content = New-Object System.Net.Http.StringContent($body, [System.Text.Encoding]::UTF8, "application/json")
$response = $client.PostAsync("http://127.0.0.1:6767/v1/audio/speech", $content).Result
$bytes = $response.Content.ReadAsByteArrayAsync().Result
Write-Output "TTS: $($response.StatusCode), $($bytes.Length) bytes"

# STT test - create a simple WAV file with silence
$wavBytes = [byte[]]@(82,73,70,70, 38,0,0,0, 87,65,86,69, 102,109,116,32, 16,0,0,0, 1,0, 1,0, 64,31,0,0, 64,31,0,0, 1,0, 8,0, 100,97,116,97, 2,0,0,0, 128,128)
$stream = New-Object System.IO.MemoryStream(,$wavBytes)
$httpContent = New-Object System.Net.Http.StreamContent($stream)
$httpContent.Headers.Add("Content-Type", "audio/wav")
$sttResponse = $client.PostAsync("http://127.0.0.1:6767/v1/audio/transcriptions", $httpContent).Result
$sttText = $sttResponse.Content.ReadAsStringAsync().Result
Write-Output "STT: $($sttResponse.StatusCode), $sttText"
