# Start agent-meow server with all voice pipeline env vars
$RepoRoot = "C:\Users\1\github-pr\agent-meow"
$hermesKey = (Select-String -Path "$RepoRoot\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$").Matches[0].Groups[1].Value

$env:OMNIGENT_LOCAL_SINGLE_USER = '1'
$env:OMNIGENT_BUILTIN_AGENT_DIRS = "$RepoRoot\examples\hermes-gateway\config.yaml"
$env:HERMES_VOICE_URL = 'http://127.0.0.1:8642'
$env:HERMES_BASE_URL = 'http://127.0.0.1:8642/v1'
$env:QWEN_TTS_URL = 'http://127.0.0.1:8890'
$env:QWENTTS_SERVER_URL = 'http://127.0.0.1:8891'
$env:WHISPER_SERVER_URL = 'http://127.0.0.1:8080'
$env:HERMES_API_KEY = $hermesKey

Set-Location $RepoRoot
& "$RepoRoot\.venv\Scripts\python.exe" -m agent_meow server --host 127.0.0.1 --port 6767 --database-uri "sqlite:///$RepoRoot\agent_meow.db"