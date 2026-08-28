$ErrorActionPreference = "Continue"
$env:PATH = "C:\Windows\System32;C:\Program Files\nodejs;" + $env:PATH
Set-Location C:\Users\1\github-pr\agent-meow\web

# 1. Type-check
node node_modules\typescript\bin\tsc -b
Write-Output "TSC_EXIT=$LASTEXITCODE"
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Rebuild SPA
npm.cmd run build 2>&1 | Out-Null
Write-Output "BUILD_EXIT=$LASTEXITCODE"
if ($LASTEXITCODE -ne 0) { exit 1 }

# 3. Verify fresh bundle
$bundle = Get-ChildItem ..\agent_meow\server\static\web-ui\assets\index-*.js |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Output "BUNDLE=$($bundle.Name) AT=$($bundle.LastWriteTime)"
