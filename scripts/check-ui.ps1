$ErrorActionPreference = "Continue"

Write-Output "=== 1. What :6767 serves (index.html) ==="
$html = (Invoke-WebRequest -Uri "http://127.0.0.1:6767/" -UseBasicParsing -TimeoutSec 5).Content
# Extract the main JS chunk name
if ($html -match 'src="/assets/(index-[A-Za-z0-9_-]+\.js)"') { "  main bundle: $($Matches[1])" }
# Check for openui/genui/pyodide references in the HTML
if ($html -match 'openui|genui|pyodide|PyodideRun') { "  HTML has new-feature refs: YES" } else { "  HTML has new-feature refs: no (expected — they're in JS chunks)" }

Write-Output "=== 2. Verify new features are in the served bundle ==="
$assetsDir = "C:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets"
$mainJs = Get-ChildItem "$assetsDir\index-*.js" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
"  bundle file: $($mainJs.Name), $($mainJs.Length) bytes, modified $($mainJs.LastWriteTime)"

# Search the bundle for Phase 1-4 feature markers
$content = [System.IO.File]::ReadAllText($mainJs.FullName)
$markers = @{
  "OpenUI/openui" = "openui"
  "genUiToolProvider" = "createGenUiToolProvider"
  "HtmlRawRenderedTabs" = "RawRendered\|HtmlRaw\|renderedTab"
  "PyodideRunner/pyodideRunner" = "pyodide\|PyodideRun\|runPython"
  "settings.runtime (i18n fix)" = "Runtime Status"
}
foreach ($kv in $markers.GetEnumerator()) {
  if ($content -match $kv.Value) { "  [FOUND] $($kv.Key)" } else { "  [MISSING] $($kv.Key)" }
}

Write-Output "=== 3. Electron app architecture ==="
$electronDir = "C:\Users\1\github-pr\agent-meow\web\electron"
if (Test-Path $electronDir) {
  # Check if Electron loads from server URL or bundles SPA statically
  $mainJs = Get-Content "$electronDir\src\main.js" -Raw -ErrorAction SilentlyContinue
  if ($mainJs -match "loadURL.*6767|localhost:6767|127\.0\.0\.1:6767") {
    "  Electron loads SPA from server URL (:6767) — NO rebuild needed for SPA changes"
  } elseif ($mainJs -match "loadFile|file://|app.asar") {
    "  Electron bundles SPA statically — rebuild NEEDED for SPA changes"
  } else {
    "  Electron load mechanism unclear — checking..."
  }
  # Check if there's a prebuilt app.asar
  $asarPath = "$electronDir\dist\*.asar"
  $asar = Get-ChildItem $asarPath -ErrorAction SilentlyContinue
  if ($asar) { "  existing app.asar: $($asar.Name), $($asar.LastWriteTime)" } else { "  no app.asar found (not built yet)" }
} else {
  "  no electron dir found"
}

Write-Output "=== 4. Gateway 8642 vs server 6767 — what serves the UI ==="
"  :6767 = agent-meow Python server (serves SPA + REST API + voice proxy)"
"  :8642 = Hermes gateway (LLM brain only — NO UI, NO SPA)"
"  The chat UI is served exclusively by :6767, not the gateway."
