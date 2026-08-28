$ErrorActionPreference = "Continue"
$curl = "C:\Windows\System32\curl.exe"

Write-Output "=== Ollama version ==="
& $curl -s http://127.0.0.1:11434/api/version

Write-Output ""
Write-Output "=== Ollama /api/ps ==="
& $curl -s http://127.0.0.1:11434/api/ps

Write-Output ""
Write-Output "=== Ollama direct LLM (120s timeout) ==="
& $curl -s --max-time 120 -X POST http://127.0.0.1:11434/v1/chat/completions -H "Content-Type: application/json" -d "@C:\Users\1\github-pr\agent-meow\llm-ollama.json"

Write-Output ""
Write-Output "=== Hermes gateway LLM (120s timeout) ==="
& $curl -s --max-time 120 -X POST http://127.0.0.1:8642/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer 3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb" -d "@C:\Users\1\github-pr\agent-meow\llm-body.json"

Write-Output ""
Write-Output "=== :6767 proxy LLM (120s timeout) ==="
& $curl -s --max-time 120 -X POST http://127.0.0.1:6767/v1/chat/completions -H "Content-Type: application/json" -d "@C:\Users\1\github-pr\agent-meow\llm-body.json"
