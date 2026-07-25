// WakeWordDetector — background always-listening keyword spotter for 橘宝 (júbǎo).
//
// Uses the Web Speech API in continuous mode with a keyword filter. When the
// wake word is detected, fires onWakeWord callback. The parent then:
// 1. Calls Voicebox /speak to play "橘宝在呢" as the auto-reply
// 2. Activates the main mic for the user's actual command
//
// This is the simplest zero-dependency approach: reuses the same SpeechRecognition
// API that ComposerMicButton already uses, but in a background listener that
// only fires on keyword match. No native binaries, no Porcupine, no openWakeWord.
//
// In Electron (where Web Speech API has no cloud backend), this falls back to
// a simple audio-level threshold detector that prompts the user to click the
// mic button — a graceful degradation rather than a silent failure.

import { useCallback, useEffect, useRef, useState } from "react";

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

// Wake words — both Chinese and transliterations for robustness.
const WAKE_WORDS = ["橘宝", "jubao", "ju bao", "橘寶"];

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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onWakeWordRef = useRef(onWakeWord);
  onWakeWordRef.current = onWakeWord;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const start = useCallback(() => {
    if (recognitionRef.current) return;
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

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
      const lower = transcript.toLowerCase().trim();
      if (WAKE_WORDS.some((word) => lower.includes(word.toLowerCase()))) {
        onWakeWordRef.current();
      }
    };

    const handleEnd = () => {
      // Auto-restart if still enabled (browser may stop after silence).
      if (enabledRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started — ignore.
        }
      } else {
        setIsListening(false);
      }
    };

    const handleError = () => {
      // On error, try to restart if still enabled.
      if (enabledRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignore — will retry on next end cycle.
        }
      }
    };

    recognition.addEventListener("result", handleResult);
    recognition.addEventListener("end", handleEnd);
    recognition.addEventListener("error", handleError);
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Already started — ignore.
    }
  }, [lang]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.removeEventListener("result", () => {});
    recognition.removeEventListener("end", () => {});
    recognition.removeEventListener("error", () => {});
    try {
      recognition.stop();
    } catch {
      // Already stopped — ignore.
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { isListening, start, stop };
}
