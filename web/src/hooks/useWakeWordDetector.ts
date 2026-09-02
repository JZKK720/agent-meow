// WakeWordDetector — background keyword spotter for 橘宝 (júbǎo).
//
// Uses the Silero VAD (via hermesVoice) to segment speech, then transcribes
// each segment via Hermes STT and checks for the wake word. This is the
// Thelliez pipeline pattern: VAD → STT → keyword check, all on one audio
// stream — one mic consumer, zero mic conflicts.
//
// Mic-ownership rule (2026-09-02): this detector is VAD-ONLY. It never
// opens its own mic consumer. The VAD must already be connected
// (hermesVoice.connect() called from a user gesture — paw/mic click) before
// enabling the detector; when it is, the VAD switches to wake word mode:
// speech segments go to keyword checking, not the LLM+TTS pipeline. When
// the wake word is found, fires onWakeWord callback.
//
// The old Web Speech / server-dictation fallbacks are deliberately REMOVED.
// They were the root cause of the "constantly pulling the MIC" bug: with
// the VAD disconnected, the detector silently opened a SpeechRecognition or
// DictationSession the moment it was enabled, turning on the browser's
// mic-in-use indicator with no visible listening UI. Wake word detection
// is a MODE of the user-armed VAD, never an independent mic consumer.
// When the VAD is disconnected there is nothing to arm — the hook is inert.

import { useEffect, useRef, useState } from "react";
import type { RealtimeEventListener } from "@/lib/hermesVoice";

export type WakeWordDetectorProps = {
  /** Fired when the wake word is detected. Parent should play TTS reply + activate mic. */
  onWakeWord: () => void;
  /** Enable/disable the detector. When false, stops listening. */
  enabled?: boolean;
};

export function useWakeWordDetector({
  onWakeWord,
  enabled = false,
}: WakeWordDetectorProps) {
  const [isListening, setIsListening] = useState(false);
  const onWakeWordRef = useRef(onWakeWord);
  onWakeWordRef.current = onWakeWord;

  // ── VAD mode (the ONLY mode) ─────────────────────────────────────────
  // Subscribes to the connected VAD's `wake.word` events and arms wake
  // word mode on it. One mic consumer (the VAD, owned by the user's
  // explicit connect), zero conflicts with the voice session or
  // dictation. hermesVoice is dynamically imported to avoid pulling
  // @ricky0123/vad-web + onnxruntime-web into the initial bundle,
  // which breaks React context initialization.
  useEffect(() => {
    if (!enabled) {
      // Release the wake-word gate if it was armed.
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        hermesVoice.stopWakeWordMode();
      });
      setIsListening(false);
      return;
    }

    // VAD-only: arm the gate when the transport is already connected
    // (user gesture pulled the mic via the paw/mic button). When the VAD
    // is disconnected there is NOTHING to arm — do not open any fallback
    // mic consumer. The mic-in-use indicator must never appear without a
    // visible listening UI.
    let unsub: (() => void) | null = null;
    let cancelled = false;
    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      if (cancelled) return;
      if (hermesVoice.getState() !== "connected") return;
      const handler: RealtimeEventListener = (event) => {
        if (event.type === "wake.word") {
          onWakeWordRef.current();
        }
      };
      unsub = hermesVoice.subscribeEvents(handler);
      hermesVoice.startWakeWordMode();
      setIsListening(true);
    });

    return () => {
      cancelled = true;
      if (unsub) unsub();
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        hermesVoice.stopWakeWordMode();
      });
      setIsListening(false);
    };
  }, [enabled]);

  return { isListening, mode: "vad" as const, start: () => {}, stop: () => {} };
}
