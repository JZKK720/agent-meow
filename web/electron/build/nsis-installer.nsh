; web/electron/build/nsis-installer.nsh
; NSIS custom installer hook.
;
; On fresh install: setup_complete doesn't exist → wizard runs automatically.
; On upgrade: setup_complete exists → app launches normally (no wizard).
; The user can manually re-run the wizard from Settings → Runtime Status.
;
; We do NOT delete setup_complete on upgrade — that would force the wizard
; on every update, which is annoying for users who already have everything
; configured. The wizard's port detection (Ollama 11434, Hermes 8642) and
; model-already-pulled checks make re-runs fast if the user chooses to.

!macro customInstall
  ; No-op on upgrade — preserve the user's setup_complete flag.
  ; The wizard only runs on first install (when the flag doesn't exist).
!macroend