# Phase 2 finisher: type-check, rebuild SPA, commit, push.
# Written as a script to avoid the flaky PowerShell call-operator parsing.
$ErrorActionPreference = "Continue"
$env:PATH = "C:\Windows\System32;C:\Program Files\nodejs;" + $env:PATH
Set-Location C:\Users\1\github-pr\agent-meow\web

Write-Output "=== 1. tsc -b ==="
node node_modules\typescript\bin\tsc -b .
Write-Output "TSC_EXIT=$LASTEXITCODE"
if ($LASTEXITCODE -ne 0) { Write-Output "TSC FAILED — aborting"; exit 1 }

Write-Output "=== 2. SPA build ==="
npm.cmd run build
Write-Output "BUILD_EXIT=$LASTEXITCODE"
if ($LASTEXITCODE -ne 0) { Write-Output "BUILD FAILED — aborting"; exit 1 }

Write-Output "=== 3. Fresh bundle ==="
Get-ChildItem ..\agent_meow\server\static\web-ui\assets\index-*.js |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 Name,LastWriteTime

Write-Output "=== 4. Commit ==="
Set-Location C:\Users\1\github-pr\agent-meow
git add web/src/components/ai-elements/genUiTools.ts web/src/components/ai-elements/genUiTools.test.ts web/src/components/ai-elements/openUiBlock.tsx agent_meow/runtime/prompt.py tests/runtime/test_prompt_genui.py agent_meow/server/static/web-ui
git commit -s -m "feat(genui): wire Query() tools to /v1 endpoints + action handling (Phase 2)

- genUiTools.ts: toolProvider mapping list_sessions/list_hosts/
  stack_status/list_projects to same-origin /v1 GET endpoints
  (browser already authenticated; no third-party hosts contacted).
  handleGenUiAction: open_url via window.open (http/https only),
  continue_conversation surfaced via callback.
- openUiBlock.tsx: pass toolProvider + onAction to the Renderer.
- runtime/prompt.py: genui instructions now list the four available
  Query() tools with a usage example.
- Tests: genUiTools.test.ts 13/13, ai-elements suite 54/54,
  test_prompt_genui.py 6/6. tsc -b clean. SPA rebuilt."
Write-Output "COMMIT_EXIT=$LASTEXITCODE"

Write-Output "=== 5. Push ==="
git push origin main
Write-Output "PUSH_EXIT=$LASTEXITCODE"
git log --oneline -2
