$ErrorActionPreference = "Continue"
$assetsDir = "C:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets"
$mainJs = (Get-ChildItem "$assetsDir\index-*.js" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
$content = [System.IO.File]::ReadAllText($mainJs)

# String literals that survive minification (not function names)
$checks = @{
  "OpenUI fence (```openui)" = "openui"
  "genUi tools: /v1/sessions" = "/v1/sessions"
  "genUi tools: /v1/hosts" = "/v1/hosts"
  "genUi tools: stack_status" = "stack_status"
  "genUi tools: list_projects" = "list_projects"
  "HTML tabs: Rendered" = "Rendered"
  "HTML tabs: Raw" = "Raw"
  "Pyodide: runPythonInPyodide" = "runPythonInPyodide"
  "Pyodide: Failed to load" = "Failed to load Pyodide"
  "Pyodide CDN url" = "pyodide"
  "i18n: Runtime Status" = "Runtime Status"
  "i18n: 运行状态 (zh)" = [char]0x8FD0 + [char]0x884C  # 运行
}

Write-Output "Bundle: $((Split-Path $mainJs -Leaf)), $($content.Length) chars"
Write-Output ""
foreach ($kv in $checks.GetEnumerator() | Sort-Object Name) {
  $found = $content -match [regex]::Escape($kv.Value)
  $status = if ($found) { "FOUND" } else { "MISSING" }
  Write-Output "  [$status] $($kv.Key)"
}

# Also check all JS chunks for pyodide
Write-Output ""
Write-Output "=== All chunks with pyodide/Pyodide ==="
Get-ChildItem "$assetsDir\*.js" | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName)
  if ($c -match "pyodide|Pyodide") { "  $($_.Name): has pyodide" }
}

Write-Output ""
Write-Output "=== All chunks with Rendered/Raw tab ==="
Get-ChildItem "$assetsDir\*.js" | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName)
  if ($c -match "Rendered.*Raw|HtmlRawRendered") { "  $($_.Name): has HTML tabs" }
}

Write-Output ""
Write-Output "=== All chunks with genui tools ==="
Get-ChildItem "$assetsDir\*.js" | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName)
  if ($c -match "list_projects|stack_status|createGenUi") { "  $($_.Name): has genui" }
}
