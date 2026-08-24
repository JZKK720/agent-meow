; web/electron/build/nsis-installer.nsh
; NSIS custom installer hook.
;
; Deletes the setup_complete flag on EVERY install (fresh, upgrade, or
; reinstall after uninstall). This forces the bootstrap wizard to run so
; the runtime is configured correctly. The wizard's skip-if-already-installed
; checks (port detection for Ollama/Hermes, model-already-pulled, 
; whisper-server.exe exists) make re-runs fast — a user with everything 
; already configured will breeze through in seconds.
;
; This is critical because deleteAppDataOnUninstall is false, so a stale
; setup_complete from a broken previous version survives uninstall and
; would prevent the wizard from running on the new install.

!macro customInstall
  ; Delete setup_complete so the wizard always runs after install.
  ; The flag lives in %APPDATA%/agent-meow/ (Electron's userData dir).
  ; Using raw NSIS StrCmp + Delete (no LogicLib dependency).
  ReadEnvStr $R0 "APPDATA"
  StrCmp $R0 "" +2 0
    Delete "$R0\agent-meow\setup_complete"
!macroend