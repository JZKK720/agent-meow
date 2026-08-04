// useWakeWordReply — plays the TTS auto-reply "橘宝在呢" when the wake word fires.
//
// Uses the browser's built-in SpeechSynthesis API (Web Speech). No server
// required — the old Voicebox /speak proxy at port 17493 is no longer wired.
// Falls back gracefully if SpeechSynthesis is unavailable (Firefox without
// it, or voices not loaded yet).

import { useCallback, useRef, useState } from "react";

// The auto-reply phrase — 橘宝在呢 ("Meow is here").
const WAKE_REPLY_TEXT = "橘宝在呢";

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

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    speechSynthesis.speak(utterance);
  }, [enabled]);

  return { playReply, isPlaying };
}
