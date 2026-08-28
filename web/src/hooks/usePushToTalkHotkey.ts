// Push-to-talk (PTT) hotkey: press-and-hold AltLeft to start dictation,
// release to stop — the same UX as WeChat's voice message button.
//
// Only active in the Electron shell (isElectronShell) because:
// - In a browser, bare Alt activates the menu bar.
// - In Electron, our app has no menu bar, so Alt is safe.
//
// Uses e.code === "AltLeft" (not e.altKey) to avoid the Alt+Shift IME
// switch conflict: Alt+Shift fires e.altKey=true but e.code is "ShiftLeft",
// so checking e.code ensures only a bare AltLeft press triggers PTT.
//
// Also guards against TTS playback: when voice TTS is active
// (isVoiceActive()), the PTT start is suppressed so the mic doesn't
// pick up the TTS audio (the same half-duplex guard the VAD uses).

import { useEffect, useRef } from "react";
import { isElectronShell } from "@/lib/nativeBridge";
import { isVoiceActive, subscribeVoiceActive } from "@/lib/readAloudAudio";

/** Selector for surfaces that own their keystrokes (terminals, code editor). */
const HOTKEY_OWNING_SURFACES = ".xterm, .monaco-editor";

/** Does focus sit inside a surface that owns its keystrokes (xterm / Monaco)? */
function focusOwnsHotkey(): boolean {
  const el = document.activeElement;
  return el instanceof Element && el.closest(HOTKEY_OWNING_SURFACES) !== null;
}

/**
 * Bind AltLeft press-and-hold to push-to-talk dictation.
 *
 * keydown → start dictation (if TTS is not playing).
 * keyup → stop dictation.
 *
 * @param onStart Called when AltLeft is pressed (start recording).
 * @param onStop Called when AltLeft is released (stop recording).
 * @param enabled Pass false to skip binding. Defaults to isElectronShell().
 */
export function usePushToTalkHotkey(
  onStart: () => void,
  onStop: () => void,
  enabled: boolean = isElectronShell(),
): void {
  const startRef = useRef(onStart);
  const stopRef = useRef(onStop);
  startRef.current = onStart;
  stopRef.current = onStop;
  // Track whether PTT is active so we only call onStop if we called onStart.
  const pttActiveRef = useRef(false);
  // Track voice-active state so we can suppress start during TTS playback.
  const voiceActiveRef = useRef(isVoiceActive());

  useEffect(() => {
    if (!enabled) return;

    const unsubVoice = subscribeVoiceActive((active) => {
      voiceActiveRef.current = active;
    });

    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      // Only bare AltLeft — no other modifiers (reject Alt+Shift, Alt+Tab, etc.)
      if (e.code !== "AltLeft") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (e.repeat) return; // ignore auto-repeat
      if (focusOwnsHotkey()) return;
      // Suppress PTT while TTS is playing (half-duplex).
      if (voiceActiveRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      pttActiveRef.current = true;
      startRef.current();
    };

    const handleKeyUp = (e: globalThis.KeyboardEvent): void => {
      if (e.code !== "AltLeft") return;
      if (!pttActiveRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      pttActiveRef.current = false;
      stopRef.current();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      unsubVoice();
    };
  }, [enabled]);
}