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
  ; Delete stale Electron userData so the wizard runs clean and the app
  ; doesn't try to load a stale server URL from a broken previous version.
  ; userData lives in %APPDATA%/agent-meow/ (Electron's app.getPath("userData")).
  ; We delete setup_complete (forces wizard) + settings.json (clears stale
  ; server_url that would skip server startup → ERR_CONNECTION_REFUSED).
  ; runtime.env is preserved so voice/Hermes config from a prior wizard run
  ; is reused by the skip-if-already-installed checks.
  ;
  ; NSIS relative jumps count from the instruction AFTER StrCmp.
  ; +2 = skip the 2 Delete instructions (when APPDATA is empty).
  ; 0 = continue to next instruction (when APPDATA is set).
  ReadEnvStr $R0 "APPDATA"
  StrCmp $R0 "" +2 0
    Delete "$R0\agent-meow\setup_complete"
    Delete "$R0\agent-meow\settings.json"
!macroend