$ErrorActionPreference = "Continue"

Write-Output "=== Ollama model details (keep_alive) ==="
$models = @("nemotron-3.5-lightning:30b-a3b", "ornith-1.5:35b")
foreach ($m in $models) {
  try {
    $body = @{ model = $m } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/show" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    $j = $r.Content | ConvertFrom-Json
    $ka = $j.parameters.ollama_keep_alive
    if (-not $ka) { $ka = $j.model_info."ollama.keep_alive" }
    Write-Output "  ${m}: keep_alive=$ka"
    # Also check parameters
    Write-Output "    parameters: $($j.parameters | ConvertTo-Json -Compress -Depth 3)"
  } catch { Write-Output "  ${m}: FAIL: $_" }
}

Write-Output ""
Write-Output "=== Ollama loaded models (in VRAM) ==="
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/ps" -UseBasicParsing -TimeoutSec 5
  $j = $r.Content | ConvertFrom-Json
  foreach ($m in $j.models) {
    Write-Output "  $($m.name): expires=$($m.expires_vram) size_vram=$($m.size_vram) size=$($m.size)"
  }
  if (-not $j.models) { Write-Output "  (no models currently loaded in VRAM)" }
} catch { Write-Output "  /api/ps FAIL: $_" }

Write-Output ""
Write-Output "=== Hermes config: model section ==="
$cfg = Get-Content "C:\Users\1\github-pr\hermes-agent\data\config.yaml" -Raw
# Extract model section
if ($cfg -match "(?ms)^(model:.*?)(?=^[a-z])") { Write-Output $Matches[1] }

Write-Output ""
Write-Output "=== Hermes config: fallback_model section ==="
if ($cfg -match "(?ms)^(fallback_model:.*?)(?=^mcp_servers)") { Write-Output $Matches[1] }

Write-Output ""
Write-Output "=== Does Hermes config support keep_alive? ==="
# Check the hermes-agent source for keep_alive handling
$hermesSrc = "C:\Users\1\github-pr\hermes-agent"
if (Test-Path "$hermesSrc\src") {
  $found = Get-ChildItem "$hermesSrc\src" -Recurse -Filter "*.py" -ErrorAction SilentlyContinue | Select-String -Pattern "keep_alive|keep.alive" -ErrorAction SilentlyContinue | Select-Object -First 5
  if ($found) { foreach ($f in $found) { "  $($f.Path):$($f.LineNumber) $($f.Line.Trim())" } } else { "  no keep_alive references in hermes-agent src" }
} else { "  no src dir found at $hermesSrc" }
