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
  /**
   * When true, the detector acts as a pure STATE MIRROR: it tracks whether
   * the gate is armed and reports isListening, but does NOT subscribe its
   * own wake.word handler. Surfaces that pass the same handler to
   * useRealtimeVoice({ onWakeWord }) set this so the hook's handleEvent is
   * the ONLY wake.word consumer — the detector re-subscribing on top made
   * the ack sequencer fire twice and undercut the echo-back guard
   * (multi-agent audit findings 1+5, 2026-09-02).
   */
  mirrorOnly?: boolean;
};

export function useWakeWordDetector({
  onWakeWord,
  enabled = false,
  mirrorOnly = false,
}: WakeWordDetectorProps) {
  const [isListening, setIsListening] = useState(false);
  const onWakeWordRef = useRef(onWakeWord);
  onWakeWordRef.current = onWakeWord;

  // ── VAD mode (the ONLY mode) ─────────────────────────────────────────
  // Arms wake word mode on the connected VAD and (unless mirrorOnly)
  // subscribes to its `wake.word` events. Arming follows the TRANSPORT's
  // connection state via subscribeState — the effect previously keyed on
  // `enabled` alone, so a transport that connected AFTER mount never armed
  // the gate, and a toggle-off left isListening stale-true (locking the
  // dictation chip while disconnected). One mic consumer (the VAD, owned
  // by the user's explicit connect), zero conflicts with the voice session
  // or dictation. hermesVoice is dynamically imported to avoid pulling
  // @ricky0123/vad-web + onnxruntime-web into the initial bundle, which
  // breaks React context initialization.
  useEffect(() => {
    let unsubEvents: (() => void) | null = null;
    let unsubState: (() => void) | null = null;
    let cancelled = false;
    // Tracks the last connection state we armed/disarmed for, so the
    // state listener only acts on real transitions (startWakeWordMode is
    // idempotent but the setIsListening churn is not free).
    let armed = false;

    const sync = (connected: boolean) => {
      if (!enabled) {
        if (armed) {
          // Release the wake-word gate if it was armed — but NOT mid-turn.
          // When the wake word opened a turn, wakeWordAutoResume is set
          // (the transport's finally block re-arms the gate after the
          // turn) and isWakeWordOnly has flipped false (gate open for the
          // turn). Clearing the gate here would clobber the auto-resume
          // flag and the gate would never re-arm — the "wake word only
          // works once" instability. Only stop when the gate is genuinely
          // still armed (no turn in flight).
          import("@/lib/hermesVoice").then(({ hermesVoice }) => {
            if (hermesVoice.isWakeWordOnly) {
              hermesVoice.stopWakeWordMode();
            }
          });
          armed = false;
          setIsListening(false);
        }
        return;
      }
      if (connected && !armed) {
        // Arm on the connected VAD. mirrorOnly surfaces keep the hook's
        // handleEvent as the sole wake.word consumer — the detector only
        // mirrors the gate state.
        import("@/lib/hermesVoice").then(({ hermesVoice }) => {
          if (cancelled) return;
          if (!enabled || hermesVoice.getState() !== "connected") return;
          if (!mirrorOnly) {
            const handler: RealtimeEventListener = (event) => {
              if (event.type === "wake.word") {
                onWakeWordRef.current();
              }
            };
            unsubEvents = hermesVoice.subscribeEvents(handler);
          }
          hermesVoice.startWakeWordMode();
          armed = true;
          setIsListening(true);
        });
      } else if (!connected && armed) {
        // VAD went away (toggle-off/disconnect): mirror the state down.
        // The gate flags are already cleared by disconnect(); isListening
        // must follow or the dictation chip stays locked while
        // disconnected (audit finding 4).
        armed = false;
        setIsListening(false);
      }
    };

    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      if (cancelled) return;
      // Track the transport's connection lifecycle, not just the mount-time
      // snapshot — the gate arms when the user's gesture connects the VAD
      // and disarms when it disconnects, whatever the order.
      unsubState = hermesVoice.subscribeState(() => {
        sync(hermesVoice.getState() === "connected");
      });
      sync(hermesVoice.getState() === "connected");
    });

    return () => {
      cancelled = true;
      if (unsubState) unsubState();
      if (unsubEvents) unsubEvents();
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        // Same mid-turn guard as the disable path: when a wake-opened turn
        // is in flight (isWakeWordOnly false + wakeWordAutoResume pending),
        // releasing the gate here would clobber the auto-resume.
        if (hermesVoice.isWakeWordOnly) {
          hermesVoice.stopWakeWordMode();
        }
      });
      setIsListening(false);
    };
  }, [enabled, mirrorOnly]);

  return { isListening, mode: "vad" as const, start: () => {}, stop: () => {} };
}
