# Check voice proxy in uvicorn log
$logDir = "$env:USERPROFILE\.omnigent\logs\server"
$latest = Get-ChildItem -Path $logDir -Filter "*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($latest) {
  Write-Output "Log: $($latest.FullName)"
  $matches = Select-String -Path $latest.FullName -Pattern "voice-proxy|HERMES_VOICE|audio.*route|voice.*router"
  if ($matches) {
    foreach ($m in $matches) { Write-Output $m.Line }
  } else {
    Write-Output "No voice-proxy messages found"
    # Show last 10 lines to see what was logged
    Write-Output "--- Last 10 lines ---"
    Get-Content $latest.FullName -Tail 10
  }
} else {
  Write-Output "No log files found in $logDir"
}
