// WakeWordDetector — background always-listening keyword spotter for 橘宝 (júbǎo).
//
// Uses the Silero VAD (via hermesVoice) to segment speech, then transcribes
// each segment via Hermes STT and checks for the wake word. This is the
// Thelliez pipeline pattern: VAD → STT → keyword check, all on one audio
// stream — one mic consumer, zero mic conflicts.
//
// The VAD must already be connected (hermesVoice.connect() called) before
// enabling the wake word detector. When enabled, the VAD switches to wake
// word mode: speech segments go to keyword checking, not the LLM+TTS
// pipeline. When the wake word is found, fires onWakeWord callback.
//
// Fallback: if the VAD is not connected (e.g. the user hasn't clicked the
// paw-mic yet), falls back to Web Speech API or server-side dictation —
// the old detection modes. This covers the case where the user enables
// the wake word chip before ever starting a voice session.

import { useCallback, useEffect, useRef, useState } from "react";
import { DictationSession, type DictationSessionEvents } from "@/lib/dictation";
import { containsWakeWord } from "@/lib/wakeWords";

// Same SpeechRecognition types as ComposerMicButton.
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

interface SpeechRecognitionEventLike extends Event {
  results: {
    readonly length: number;
    [index: number]: {
      readonly length: number;
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export type WakeWordDetectorProps = {
  /** Fired when the wake word is detected. Parent should play TTS reply + activate mic. */
  onWakeWord: () => void;
  /** Language for the recognizer. Defaults to zh-CN for Chinese wake word. */
  lang?: string;
  /** Enable/disable the detector. When false, stops listening. */
  enabled?: boolean;
};

export function useWakeWordDetector({
  onWakeWord,
  lang = "zh-CN",
  enabled = false,
}: WakeWordDetectorProps) {
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<"vad" | "web-speech" | "server-dictation" | "none">("none");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sessionRef = useRef<DictationSession | null>(null);
  const onWakeWordRef = useRef(onWakeWord);
  onWakeWordRef.current = onWakeWord;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  // Cooldown timestamp — prevents multiple onWakeWord() calls from
  // interim SpeechRecognition results and TTS echo-back.
  const lastWakeWordTimeRef = useRef(0);

  // ── VAD mode (primary) ───────────────────────────────────────────────
  // Uses the Silero VAD from hermesVoice to segment speech, then transcribes
  // each segment and checks for the wake word. One mic consumer, zero
  // conflicts with the voice session or dictation.
  // hermesVoice is dynamically imported to avoid pulling
  // @ricky0123/vad-web + onnxruntime-web into the initial bundle,
  // which breaks React context initialization.
  useEffect(() => {
    if (!enabled) {
      // Stop VAD wake word mode if it was active.
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        hermesVoice.stopWakeWordMode();
      });
      // Reset mode to "none" regardless of which mode was active —
      // the fallback effect checks modeRef to decide whether to start
      // a fallback. If mode stays "web-speech" after stopWebSpeech()
      // ran, the fallback effect will skip starting on re-enable
      // because it thinks Web Speech is already running (but it was
      // stopped). This was the root cause of "wake word only works
      // once" — toggling off left mode="web-speech", toggling on
      // skipped the fallback start.
      if (mode !== "none") {
        setIsListening(false);
        setMode("none");
      }
      return;
    }

    // If the VAD is connected, use VAD wake word mode — the primary path.
    let unsub: (() => void) | null = null;
    let cancelled = false;
    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      if (cancelled) return;
      if (hermesVoice.getState() !== "connected") return;
      const handler = (event: { type: string }) => {
        if (event.type === "wake.word") {
          onWakeWordRef.current();
        }
      };
      unsub = hermesVoice.subscribeEvents(handler as (e: never) => void);
      hermesVoice.startWakeWordMode();
      setIsListening(true);
      setMode("vad");
    });

    return () => {
      cancelled = true;
      if (unsub) unsub();
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        hermesVoice.stopWakeWordMode();
      });
      setIsListening(false);
      setMode("none");
    };
  }, [enabled, mode]);

  // ── Web Speech API fallback ──────────────────────────────────────────
  const startWebSpeech = useCallback(() => {
    if (recognitionRef.current) return false;
    const Ctor = getRecognitionCtor();
    if (!Ctor) return false;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    const handleResult = (event: Event) => {
      const speechEvent = event as SpeechRecognitionEventLike;
      let transcript = "";
      let hasFinal = false;
      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i += 1) {
        const result = speechEvent.results[i];
        transcript += result[0]?.transcript ?? "";
        if (result.isFinal) hasFinal = true;
      }
      console.log(`[wake-word] SpeechRecognition result: "${transcript}" (final=${hasFinal})`);
      // Only match on final results — interim results fire repeatedly
      // as the user speaks, causing multiple onWakeWord() calls.
      // Also add a 3-second cooldown to prevent the TTS auto-reply
      // ("橘宝在呢") from being picked up as a new wake word.
      if (containsWakeWord(transcript) && hasFinal) {
        const now = Date.now();
        if (now - lastWakeWordTimeRef.current < 3000) {
          console.log(`[wake-word] Wake word debounced (cooldown)`);
          return;
        }
        lastWakeWordTimeRef.current = now;
        console.log(`[wake-word] Wake word MATCHED in transcript`);
        onWakeWordRef.current();
      }
    };

    const handleEnd = () => {
      console.log(`[wake-word] SpeechRecognition ended, restarting (enabled=${enabledRef.current})`);
      if (enabledRef.current) {
        // Small delay before restart — Chrome throws InvalidStateError
        // if start() is called too quickly after end().
        setTimeout(() => {
          if (enabledRef.current) {
            try { recognition.start(); } catch { /* already started */ }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    const handleError = (event: Event) => {
      const err = (event as SpeechRecognitionErrorEventLike).error;
      console.warn(`[wake-word] SpeechRecognition error: ${err}`);
      if (enabledRef.current && err !== "not-allowed" && err !== "service-not-allowed") {
        try { recognition.start(); } catch { /* will retry on end */ }
      }
    };

    recognition.addEventListener("result", handleResult);
    recognition.addEventListener("end", handleEnd);
    recognition.addEventListener("error", handleError);
    recognitionRef.current = recognition;

    try {
      recognition.start();
      console.log(`[wake-word] SpeechRecognition started (lang=${lang}, continuous=true)`);
      setIsListening(true);
      setMode("web-speech");
      return true;
    } catch (err) {
      console.warn(`[wake-word] SpeechRecognition.start() threw: ${err}`);
      return false;
    }
  }, [lang]);

  const stopWebSpeech = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try { recognition.stop(); } catch { /* already stopped */ }
    recognitionRef.current = null;
  }, []);

  // ── Server-side dictation fallback (Electron/Firefox) ────────────────
  const startServerDictation = useCallback(async () => {
    if (sessionRef.current) return;

    const events: DictationSessionEvents = {
      onPartial: (text: string) => {
        if (containsWakeWord(text)) onWakeWordRef.current();
      },
      onFinal: (text: string) => {
        if (containsWakeWord(text)) onWakeWordRef.current();
      },
      onError: () => {
        sessionRef.current = null;
        setIsListening(false);
        if (enabledRef.current) {
          setTimeout(() => {
            if (enabledRef.current) void startServerDictation();
          }, 2000);
        }
      },
    };

    try {
      const session = await DictationSession.start(events);
      sessionRef.current = session;
      setIsListening(true);
      setMode("server-dictation");
    } catch {
      setIsListening(false);
      setMode("none");
    }
  }, []);

  const stopServerDictation = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    session.cancel();
    sessionRef.current = null;
  }, []);

  // ── Fallback start/stop (when VAD is not connected) ──────────────────
  // This effect starts fallback detection when the VAD is not connected.
  // It does NOT depend on `mode` — that would cause a re-run when
  // startWebSpeech sets mode to "web-speech", which would then try to
  // start server dictation in parallel (double mic consumer bug).
  // Instead, we check mode via a ref to avoid the re-run.
  const modeRef = useRef(mode);
  modeRef.current = mode;
  useEffect(() => {
    if (!enabled) {
      stopWebSpeech();
      stopServerDictation();
      return;
    }
    // Only use fallbacks when VAD mode is not active.
    if (modeRef.current === "vad") return;
    // Already running a fallback? Don't start another.
    if (modeRef.current === "web-speech" || modeRef.current === "server-dictation") return;
    // Try Web Speech API first (Chrome/Edge/Safari).
    if (startWebSpeech()) return;
    // Fallback to server-side dictation (Electron/Firefox).
    void startServerDictation();

    return () => {
      stopWebSpeech();
      stopServerDictation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, startWebSpeech, startServerDictation, stopWebSpeech, stopServerDictation]);

  return { isListening, mode, start: () => {}, stop: () => {} };
}
