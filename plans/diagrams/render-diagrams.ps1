# Render all Mermaid diagrams to SVG
# Usage: powershell -ExecutionPolicy Bypass -File plans/diagrams/render-diagrams.ps1

$diagramDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $diagramDir)

$mmdc = $null
$candidates = @(
  "C:\Users\1\AppData\Roaming\npm\mmdc.cmd",
  (Get-Command mmdc.cmd -ErrorAction SilentlyContinue).Source,
  (Get-Command mmdc -ErrorAction SilentlyContinue).Source
)
foreach ($c in $candidates) {
  if ($c -and (Test-Path $c)) { $mmdc = $c; break }
}

if (-not $mmdc) {
  Write-Host "mmdc not found. Install with: npm install -g @mermaid-js/mermaid-cli"
  exit 1
}

Write-Host "Using mmdc: $mmdc"
$pptrConfig = Join-Path $diagramDir "puppeteer-config.json"

$mmdFiles = Get-ChildItem $diagramDir -Filter "*.mmd"
$count = 0
foreach ($f in $mmdFiles) {
  $svgOutFile = [System.IO.Path]::ChangeExtension($f.FullName, ".svg")
  $pngOutFile = [System.IO.Path]::ChangeExtension($f.FullName, ".png")

  Write-Host "  SVG  $($f.Name) -> $(Split-Path -Leaf $svgOutFile)"
  & $mmdc -i $f.FullName -o $svgOutFile -b transparent -p $pptrConfig 2>&1 | Out-Null

  Write-Host "  PNG  $($f.Name) -> $(Split-Path -Leaf $pngOutFile)"
  & $mmdc -i $f.FullName -o $pngOutFile -b white -s 2 -p $pptrConfig 2>&1 | Out-Null

  $count++
}
Write-Host "`nDone. $count diagrams rendered to SVG and PNG."