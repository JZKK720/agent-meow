# Regenerate all MeowCat-branded plan report HTML + PDF exports.
# Usage:  powershell -ExecutionPolicy Bypass -File plans/build-reports.ps1
#
# Prerequisites:
#   - @marp-team/marp-cli installed globally (npm install -g @marp-team/marp-cli)
#   - A Chromium-based browser for PDF export (Marp auto-detects Edge/Chrome)

param(
    [switch]$PdfOnly,
    [switch]$HtmlOnly,
    [switch]$PptxOnly
)

$ErrorActionPreference = "Continue"
$repoRoot = Split-Path -Parent $PSScriptRoot
$marp = "C:\Users\1\AppData\Roaming\npm\marp.cmd"
if (-not (Test-Path $marp)) {
    $marp = (Get-Command marp.cmd -ErrorAction SilentlyContinue).Source
}
if (-not $marp) { Write-Error "marp CLI not found. Run: npm install -g @marp-team/marp-cli"; exit 1 }

$theme = "$repoRoot\plans\themes\meowcat.css"
$outDir = "$repoRoot\artifacts\reports-viewers"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# Source marp → output base name mapping (outputs go to artifacts/reports-viewers/)
$reports = @(
    @{ src = "$repoRoot\plans\010-full-scope-report-marp.md"; out = "$outDir\010-full-scope-report-zh" },
    @{ src = "$repoRoot\plans\010-full-scope-report-marp.md"; out = "$outDir\010-full-scope-report-395-zh" },
    @{ src = "$repoRoot\plans\010-full-scope-report-en-marp.md"; out = "$outDir\010-full-scope-report-en" },
    @{ src = "$repoRoot\plans\010-full-scope-report-en-marp.md"; out = "$outDir\010-full-scope-report-395-en" },
    @{ src = "$repoRoot\plans\010-full-scope-report-hx470-marp.md"; out = "$outDir\010-full-scope-report-hx470" },
    @{ src = "$repoRoot\plans\010-full-scope-report-hx470-marp.md"; out = "$outDir\010-full-scope-report-hx470-zh" },
    @{ src = "$repoRoot\plans\010-full-scope-report-hx470-en-marp.md"; out = "$outDir\010-full-scope-report-hx470-en" },
    @{ src = "$repoRoot\plans\010-full-scope-report-combined-zh-marp.md"; out = "$outDir\010-full-scope-report-combined-zh" },
    @{ src = "$repoRoot\plans\010-full-scope-report-combined-en-marp.md"; out = "$outDir\010-full-scope-report-combined-en" },
    @{ src = "$repoRoot\plans\010-client-overview-marp.md"; out = "$outDir\010-client-overview-zh" },
    @{ src = "$repoRoot\plans\010-dual-platform-scope-report-marp.md"; out = "$outDir\010-dual-platform-scope-report-zh" },
    @{ src = "$repoRoot\plans\010-ollama-local-llm-marp.md"; out = "$outDir\010-ollama-local-llm-zh" },
    @{ src = "$repoRoot\plans\008-overview-zh-marp.md"; out = "$outDir\008-overview-zh" }
)

Push-Location $repoRoot
try {
    foreach ($r in $reports) {
        if (-not $PdfOnly) {
            Write-Host "  HTML  $($r.out).html"
            & $marp --theme-set $theme --html $r.src -o "$($r.out).html" 2>&1 | Out-Null
        }
        if (-not $HtmlOnly -and -not $PptxOnly) {
            Write-Host "  PDF   $($r.out).pdf"
            # --allow-local-files is required so Marp's PDF pipeline bundles
            # the ./diagrams/*.png assets referenced by the slide sources.
            & $marp --theme-set $theme --pdf --allow-local-files $r.src -o "$($r.out).pdf" 2>&1 | Out-Null
        }
        if (-not $PdfOnly -and -not $HtmlOnly) {
            Write-Host "  PPTX  $($r.out).pptx"
            & $marp --theme-set $theme --pptx --allow-local-files $r.src -o "$($r.out).pptx" 2>&1 | Out-Null
        }
    }
    Write-Host "`nDone. $(($reports | Measure-Object).Count) reports × $(if ($PptxOnly) {'1 (PPTX)'} elseif ($PdfOnly) {'1 (PDF)'} else {'3 (HTML+PDF+PPTX)'}) format(s)."
}
finally {
    Pop-Location
}