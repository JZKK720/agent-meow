; web/electron/build/nsis-installer.nsh
; NSIS custom installer hook — runs before the main install section.
; Deletes the setup_complete flag so the bootstrap wizard launches on
; first app start after install/upgrade.

!macro customInstall
  ; Delete the setup_complete flag from userData (%APPDATA%/agent-meow/)
  ; so the wizard re-runs after install or upgrade.
  IfFileExists "$APPDATA\agent-meow\setup_complete" 0 +2
    Delete "$APPDATA\agent-meow\setup_complete"
!macroend