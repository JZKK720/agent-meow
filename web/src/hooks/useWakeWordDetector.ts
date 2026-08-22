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
import { hermesVoice, type RealtimeServerEvent } from "@/lib/hermesVoice";

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

  // ── VAD mode (primary) ───────────────────────────────────────────────
  // Uses the Silero VAD from hermesVoice to segment speech, then transcribes
  // each segment and checks for the wake word. One mic consumer, zero
  // conflicts with the voice session or dictation.
  useEffect(() => {
    if (!enabled) {
      // Stop VAD wake word mode if it was active.
      hermesVoice.stopWakeWordMode();
      if (mode === "vad") {
        setIsListening(false);
        setMode("none");
      }
      return;
    }

    // If the VAD is connected, use VAD wake word mode — the primary path.
    if (hermesVoice.getState() === "connected") {
      const handler = (event: RealtimeServerEvent) => {
        if (event.type === "wake.word") {
          onWakeWordRef.current();
        }
      };
      const unsub = hermesVoice.subscribeEvents(handler);
      hermesVoice.startWakeWordMode();
      setIsListening(true);
      setMode("vad");
      return () => {
        hermesVoice.stopWakeWordMode();
        unsub();
        setIsListening(false);
        setMode("none");
      };
    }

    // VAD not connected — fall back to Web Speech API or server dictation.
    return undefined;
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
      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i += 1) {
        const result = speechEvent.results[i];
        transcript += result[0]?.transcript ?? "";
      }
      // Use the shared containsWakeWord from hermesVoice — single source
      // of truth for the wake word list, including homophone variants.
      import("@/lib/hermesVoice").then(({ containsWakeWord }) => {
        if (containsWakeWord(transcript)) {
          onWakeWordRef.current();
        }
      });
    };

    const handleEnd = () => {
      if (enabledRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setIsListening(false);
      }
    };

    const handleError = () => {
      if (enabledRef.current) {
        try { recognition.start(); } catch { /* will retry on end */ }
      }
    };

    recognition.addEventListener("result", handleResult);
    recognition.addEventListener("end", handleEnd);
    recognition.addEventListener("error", handleError);
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
      setMode("web-speech");
      return true;
    } catch {
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
        import("@/lib/hermesVoice").then(({ containsWakeWord }) => {
          if (containsWakeWord(text)) onWakeWordRef.current();
        });
      },
      onFinal: (text: string) => {
        import("@/lib/hermesVoice").then(({ containsWakeWord }) => {
          if (containsWakeWord(text)) onWakeWordRef.current();
        });
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
  useEffect(() => {
    if (!enabled) {
      stopWebSpeech();
      stopServerDictation();
      return;
    }
    // Only use fallbacks when VAD mode is not active.
    if (mode === "vad") return;
    // Try Web Speech API first (Chrome/Edge/Safari).
    if (startWebSpeech()) return;
    // Fallback to server-side dictation (Electron/Firefox).
    void startServerDictation();

    return () => {
      stopWebSpeech();
      stopServerDictation();
    };
  }, [enabled, mode, startWebSpeech, startServerDictation, stopWebSpeech, stopServerDictation]);

  return { isListening, mode, start: () => {}, stop: () => {} };
}
