# Assemble the agent-meow client bundle for Windows.
#
# Collects the Electron installer (downloaded from the CI workflow
# artifacts) plus the phase-1 runtime scripts into a single zip the
# client can download, install, and run.
#
# Usage:
#   1. Trigger the Electron build:
#        gh workflow run electron-build.yml --ref main
#   2. Wait for it to finish, then:
#        gh run download <run-id> -n win -D dist\electron-win
#   3. Assemble:
#        powershell -ExecutionPolicy Bypass -File scripts\assemble-client-bundle.ps1

param(
    # Directory containing the downloaded electron-builder output
    # (the .exe installer + latest.yml).
    [string]$ElectronArtifacts = "dist\electron-win",
    # Output directory for the assembled bundle.
    [string]$OutDir = "dist\client-bundle"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($msg) { Write-Host "[bundle] $msg" -ForegroundColor Cyan }

# ── Locate the installer ──────────────────────────────────────────────────
$artifactDir = Join-Path $RepoRoot $ElectronArtifacts
$setupExe = Get-ChildItem $artifactDir -Filter "*.exe" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notmatch "uninstall|blockmap" } | Select-Object -First 1

if (-not $setupExe) {
    Write-Host "ERROR: No setup .exe found in $artifactDir." -ForegroundColor Red
    Write-Host "Download the CI artifacts first:"
    Write-Host "  gh run download <run-id> -n win -D $ElectronArtifacts"
    exit 1
}
Write-Step "Found installer: $($setupExe.Name)"

# ── Assemble ───────────────────────────────────────────────────────────────
$bundleDir = Join-Path $RepoRoot $OutDir
if (Test-Path $bundleDir) { Remove-Item $bundleDir -Recurse -Force }
New-Item -ItemType Directory -Path $bundleDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $bundleDir "scripts") | Out-Null

Copy-Item $setupExe.FullName $bundleDir
Copy-Item (Join-Path $RepoRoot "scripts\install-qwen-tts-gpu.ps1") (Join-Path $bundleDir "scripts\")
Copy-Item (Join-Path $RepoRoot "scripts\start-qwen-tts-gpu.ps1") (Join-Path $bundleDir "scripts\")
Copy-Item (Join-Path $RepoRoot "scripts\start-agent-meow-native.ps1") (Join-Path $bundleDir "scripts\")
Copy-Item (Join-Path $RepoRoot "deploy\client-bundle\README.md") $bundleDir

# Include the updater feed manifest if present (for auto-update setup).
$latestYml = Join-Path $artifactDir "latest.yml"
if (Test-Path $latestYml) {
    New-Item -ItemType Directory -Path (Join-Path $bundleDir "update-feed") | Out-Null
    Copy-Item $latestYml (Join-Path $bundleDir "update-feed\")
}

# ── Zip ────────────────────────────────────────────────────────────────────
$zipPath = "$bundleDir.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$bundleDir\*" -DestinationPath $zipPath

Write-Step "Bundle assembled:"
Get-ChildItem $bundleDir -Recurse -File | ForEach-Object {
    Write-Host "  $($_.FullName.Replace($bundleDir, ''))"
}
Write-Host ""
Write-Host "Zip: $zipPath ($([math]::Round((Get-Item $zipPath).Length / 1MB, 1)) MB)" -ForegroundColor Green
