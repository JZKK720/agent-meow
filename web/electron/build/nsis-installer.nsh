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
  ; Only force the wizard to re-run when the version changes.
  ; Read the previously installed version from the registry; if it matches
  ; the current version, preserve setup_complete + settings.json so upgrade
  ; installs don't re-trigger the full wizard.
  ReadEnvStr $R0 "APPDATA"
  StrCmp $R0 "" skipCleanup 0

  ; Check if a previous version was installed
  ReadRegStr $R1 SHCTX "Software\agent-meow-desktop-electron" "Version"
  ReadRegStr $R2 SHCTX "Software\${APP_ID}" "Version"
  ${If} $R1 == ""
  ${AndIf} $R2 == ""
    ; No previous version — fresh install, delete everything
    Delete "$R0\agent-meow\setup_complete"
    Delete "$R0\agent-meow\settings.json"
  ${Else}
    ; Previous version exists — only delete setup_complete if version changed
    ${If} $R1 != "${VERSION}"
    ${AndIf} $R2 != "${VERSION}"
      ; Version changed — force wizard to re-run for new features
      Delete "$R0\agent-meow\setup_complete"
      Delete "$R0\agent-meow\settings.json"
    ${EndIf}
  ${EndIf}

  skipCleanup:
!macroend