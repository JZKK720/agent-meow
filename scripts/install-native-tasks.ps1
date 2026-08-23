# Register the agent-meow native-stack Task Scheduler jobs (idempotent).
#
# Wires up:
#   - agent-meow-native-stack : runs start-native-stack.ps1 at logon
#   - agent-meow-watchdog     : runs watchdog-native-stack.ps1 every 5 min
#
# Safe to re-run: existing tasks are replaced (-Force). Run from an
# elevated PowerShell if the tasks must run whether-or-not the user is
# logged in; otherwise a normal shell suffices for logon-triggered tasks.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\install-native-tasks.ps1
#   # From another machine / checkout path: the scripts resolve $PSScriptRoot,
#   # so the tasks always point at THIS checkout's scripts.
param(
  [int]$WatchdogIntervalMinutes = 5
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$StackScript = Join-Path $PSScriptRoot "start-native-stack.ps1"
$WatchdogScript = Join-Path $PSScriptRoot "watchdog-native-stack.ps1"

foreach ($f in @($StackScript, $WatchdogScript)) {
  if (-not (Test-Path $f)) {
    Write-Host "ERROR: required script not found: $f" -ForegroundColor Red
    exit 1
  }
}

# Stack launcher at logon (current user).
$action1 = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$StackScript`""
$trigger1 = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Watchdog every N minutes. Bounded repetition duration — Task Scheduler
# XML rejects [TimeSpan]::MaxValue (error 0x80041318); 10 years is the
# practical "forever".
$action2 = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$WatchdogScript`""
$trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $WatchdogIntervalMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -Hidden

Register-ScheduledTask -TaskName "agent-meow-native-stack" -Action $action1 `
  -Trigger $trigger1 -Settings $settings -Force | Out-Null
Write-Host "[install] registered agent-meow-native-stack (at logon)" -ForegroundColor Green

Register-ScheduledTask -TaskName "agent-meow-watchdog" -Action $action2 `
  -Trigger $trigger2 -Settings $settings -Force | Out-Null
Write-Host "[install] registered agent-meow-watchdog (every $WatchdogIntervalMinutes min)" -ForegroundColor Green

# Start the stack now so this machine is live without a re-login.
Start-ScheduledTask -TaskName "agent-meow-native-stack"
Write-Host "[install] stack start triggered — check http://127.0.0.1:6767 in ~60s" -ForegroundColor Green
