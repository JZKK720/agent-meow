# Phase 3 finisher: tsc, SPA build, commit, push.
$ErrorActionPreference = "Continue"
$env:PATH = "C:\Windows\System32;C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:PATH
Set-Location C:\Users\1\github-pr\agent-meow\web

Write-Output "=== 1. tsc -b ==="
node node_modules\typescript\bin\tsc -b .
Write-Output "TSC_EXIT=$LASTEXITCODE"
if ($LASTEXITCODE -ne 0) { Write-Output "TSC FAILED"; exit 1 }

Write-Output "=== 2. SPA build ==="
npm.cmd run build
Write-Output "BUILD_EXIT=$LASTEXITCODE"
if ($LASTEXITCODE -ne 0) { Write-Output "BUILD FAILED"; exit 1 }

Write-Output "=== 3. Commit + push ==="
Set-Location C:\Users\1\github-pr\agent-meow
git add web/src/shell/HtmlRawRenderedTabs.tsx web/src/shell/HtmlRawRenderedTabs.test.tsx web/src/shell/CodeViewer.tsx agent_meow/server/static/web-ui
git commit -s -m "feat(fileviewer): Raw/Rendered tabs for HTML artifacts (Phase 3)

Port of OpenUI's html-artifact pattern: the HTML preview surface now
has Rendered (live sandboxed iframe with comment bridge) and Raw
(read-only source) tabs. Truncation note shows on the Raw tab only.
The existing preview/source toolbar toggle is unchanged — the tabs
live inside the preview mode.

Tests: HtmlRawRenderedTabs.test.tsx 5/5, CodeViewer suite 38/38.
tsc -b clean. SPA rebuilt."
Write-Output "COMMIT_EXIT=$LASTEXITCODE"
git push origin main
Write-Output "PUSH_EXIT=$LASTEXITCODE"
git log --oneline -2
