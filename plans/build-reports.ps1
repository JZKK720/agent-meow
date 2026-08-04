# Regenerate all MeowCat-branded plan report HTML + PDF exports.
# Usage:  powershell -ExecutionPolicy Bypass -File plans/build-reports.ps1
#
# Prerequisites:
#   - @marp-team/marp-cli installed globally (npm install -g @marp-team/marp-cli)
#   - A Chromium-based browser for PDF export (Marp auto-detects Edge/Chrome)

param(
  [switch]$PdfOnly,
  [switch]$HtmlOnly
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$marp = "C:\Users\1\AppData\Roaming\npm\marp.cmd"
if (-not (Test-Path $marp)) {
  $marp = (Get-Command marp.cmd -ErrorAction SilentlyContinue).Source
}
if (-not $marp) { Write-Error "marp CLI not found. Run: npm install -g @marp-team/marp-cli"; exit 1 }

$theme = "plans/themes/meowcat.css"

# Source marp → output base name mapping (all -zh suffix for Chinese reports)
$reports = @(
  @{ src = "plans/010-full-scope-report-marp.md";        out = "plans/010-full-scope-report-zh" },
  @{ src = "plans/010-client-overview-marp.md";          out = "plans/010-client-overview-zh" },
  @{ src = "plans/010-dual-platform-scope-report-marp.md"; out = "plans/010-dual-platform-scope-report-zh" },
  @{ src = "plans/010-ollama-local-llm-marp.md";          out = "plans/010-ollama-local-llm-zh" },
  @{ src = "plans/008-overview-zh-marp.md";               out = "plans/008-overview-zh" }
)

Push-Location $repoRoot
try {
  foreach ($r in $reports) {
    if (-not $PdfOnly) {
      Write-Host "  HTML  $($r.out).html"
      & $marp --theme-set $theme --html $r.src -o "$($r.out).html" 2>&1 | Out-Null
    }
    if (-not $HtmlOnly) {
      Write-Host "  PDF   $($r.out).pdf"
      & $marp --theme-set $theme --pdf $r.src -o "$($r.out).pdf" 2>&1 | Out-Null
    }
  }
  Write-Host "`nDone. $(($reports | Measure-Object).Count) reports × $(if ($PdfOnly) {'1'} else {'2'}) format(s)."
}
finally {
  Pop-Location
}