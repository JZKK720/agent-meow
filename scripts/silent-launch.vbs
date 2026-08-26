' Silent launcher: runs a PowerShell script with no console window.
' Task Scheduler's powershell.exe action flashes a console even with
' -WindowStyle Hidden. wscript.exe has no console host, so this VBS
' wrapper is the reliable way to run background scripts silently.
'
' Usage: wscript.exe //nologo silent-launch.vbs <script.ps1>

Dim shell, args, scriptPath
Set shell = CreateObject("WScript.Shell")

' Get the script path from arguments
If WScript.Arguments.Count < 1 Then
  WScript.Quit 1
End If
scriptPath = WScript.Arguments(0)

' Build the PowerShell command with all remaining arguments
Dim cmd
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """"

' Run hidden (0 = hidden window, False = don't wait)
shell.Run cmd, 0, False

Set shell = Nothing