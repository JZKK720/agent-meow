// Persisted, per-device preference for speaking assistant replies aloud.
//
// The composer mic used to route through the Hermes voice pipeline, which
// synthesizes and plays every reply. When dictation moved to the text-only
// server path (whisper/sherpa engines), replies started arriving silently as
// chat bubbles. This preference drives the page-level auto-speak effect in
// ChatPage that reads completed replies aloud via the same TTS endpoint the
// manual "Read aloud" button uses.
//
// Defaults ON — the hands-free voice flow is the expected behavior; users
// who want silence toggle it off in Settings.

const STORAGE_KEY = "agent-meow:auto-speak-replies";

export const DEFAULT_AUTO_SPEAK_REPLIES = true;

/**
 * Read the persisted "speak replies aloud" preference. Returns the default
 * (on) when nothing is stored, on a server render (no `window`), or when the
 * stored value is malformed — never throws, so a corrupt entry can't break
 * the app. Only the exact string "false" disables auto-speak.
 */
export function readAutoSpeakReplies(): boolean {
  if (typeof window === "undefined") return DEFAULT_AUTO_SPEAK_REPLIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_AUTO_SPEAK_REPLIES;
    return raw !== "false";
  } catch {
    return DEFAULT_AUTO_SPEAK_REPLIES;
  }
}

/**
 * Persist the "speak replies aloud" preference. Swallows quota/access
 * errors so a failed write can't break the app.
 */
export function writeAutoSpeakReplies(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  } catch {
    // localStorage quota or access errors shouldn't break the app.
  }
}
