// useWakeWordReply — plays the TTS auto-reply "橘宝在呢" when the wake word fires.
//
// Uses the browser's built-in SpeechSynthesis API (Web Speech). No server
// required — the old Voicebox /speak proxy at port 17493 is no longer wired.
// Falls back gracefully if SpeechSynthesis is unavailable (Firefox without
// it, or voices not loaded yet).

import { useCallback, useRef, useState } from "react";

// The auto-reply phrase — 橘宝在呢 ("Meow is here").
const WAKE_REPLY_TEXT = "橘宝在呢";

// H1 (2026-09-03 audit): Chrome has documented cases where a
// SpeechSynthesis utterance never fires onend OR onerror (cancel()
// immediately before speak(), backgrounded tab, voices not yet loaded).
// Without a watchdog the ack promise never settled, the sequencer never
// reached stopWakeWordModeForTurn, and vadPaused stayed true — the mic
// was dead after one ack. The ack is ~1s of speech; 5s covers the
// slowest real utterance with margin.
export const WAKE_REPLY_TIMEOUT_MS = 5_000;

export type UseWakeWordReplyProps = {
  /** Enable/disable the TTS auto-reply. */
  enabled?: boolean;
};

export function useWakeWordReply({ enabled = true }: UseWakeWordReplyProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const playReply = useCallback(async () => {
    if (!enabled) return;
    if (typeof speechSynthesis === "undefined") return;

    // Cancel any in-progress utterance.
    speechSynthesis.cancel();

    // Return a Promise that resolves when the utterance finishes,
    // so the caller can wait before starting the VAD (prevents
    // echo-back: VAD picks up the TTS audio as user speech).
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(WAKE_REPLY_TEXT);
      utterance.lang = "zh-CN";
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      // Try to pick a Chinese voice if available.
      const voices = speechSynthesis.getVoices();
      const zhVoice = voices.find((v) => v.lang.startsWith("zh"));
      if (zhVoice) utterance.voice = zhVoice;

      utteranceRef.current = utterance;
      setIsPlaying(true);

      // H1 watchdog: settle the promise even when Chrome never fires
      // onend/onerror. The first settler wins — subsequent resolutions
      // are no-ops for a promise.
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(watchdog);
        setIsPlaying(false);
        utteranceRef.current = null;
        resolve();
      };
      const watchdog = window.setTimeout(settle, WAKE_REPLY_TIMEOUT_MS);

      utterance.onend = () => {
        settle();
      };
      utterance.onerror = () => {
        settle(); // resolve even on error — don't block the caller
      };

      speechSynthesis.speak(utterance);
    });
  }, [enabled]);

  return { playReply, isPlaying };
}
