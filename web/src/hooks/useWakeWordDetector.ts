// WakeWordDetector — background always-listening keyword spotter for 橘宝 (júbǎo).
//
// Two detection modes, auto-selected by browser capability:
//
// 1. Web Speech API (Chrome/Edge/Safari): continuous SpeechRecognition with
//    a keyword filter. Zero-dependency, uses the browser's cloud STT backend.
//
// 2. Server-side dictation fallback (Electron/Firefox): opens a DictationSession
//    over the /v1/dictation/stream WebSocket, receives partial/final transcripts,
//    and filters for the wake word. Requires the server's dictation capability
//    (Handy CLI or VibeVoice-ASR). This is the path that works in the Electron
//    app where Web Speech API has no cloud backend.
//
// When the wake word is detected, fires onWakeWord callback. The parent then:
// 1. Plays "橘宝在呢" auto-reply via browser SpeechSynthesis
// 2. Activates the main mic for the user's actual command

import { useCallback, useEffect, useRef, useState } from "react";
import { DictationSession, type DictationSessionEvents } from "@/lib/dictation";

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
// Includes common homophone mis-transcriptions from Web Speech API and
// faster-whisper: 橘宝 (jú bǎo) is frequently transcribed as 继绞/拘保/
// 据报/去保 (all pronounced jì/jū/jù bǎo) because the models lack
// disambiguation context for this proper noun. Without these variants,
// saying "橘宝" produces a transcript that doesn't match and the wake
// callback never fires — the user hears nothing and thinks the button
// is broken.
const WAKE_WORDS = [
  "橘宝", "橘寶",
  "jubao", "ju bao",
  // Homophone mis-transcriptions (all pronounced jù/jú/jī bǎo):
  "继绞", "拘保", "据报", "去保",
];

/** Check if a transcript contains any wake word. */
function containsWakeWord(transcript: string): boolean {
  const lower = transcript.toLowerCase().trim();
  return WAKE_WORDS.some((word) => lower.includes(word.toLowerCase()));
}

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
  const [mode, setMode] = useState<"web-speech" | "server-dictation" | "none">("none");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sessionRef = useRef<DictationSession | null>(null);
  const onWakeWordRef = useRef(onWakeWord);
  onWakeWordRef.current = onWakeWord;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // ── Web Speech API mode ──────────────────────────────────────────────
  const startWebSpeech = useCallback(() => {
    if (recognitionRef.current) return;
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
      if (containsWakeWord(transcript)) {
        onWakeWordRef.current();
      }
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
        if (containsWakeWord(text)) {
          onWakeWordRef.current();
        }
      },
      onFinal: (text: string) => {
        if (containsWakeWord(text)) {
          onWakeWordRef.current();
        }
      },
      onError: () => {
        sessionRef.current = null;
        setIsListening(false);
        // Retry after a short delay if still enabled.
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
      // Server dictation unavailable — detector stays inactive.
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

  // ── Unified start/stop ───────────────────────────────────────────────
  const start = useCallback(() => {
    // Try Web Speech API first (Chrome/Edge/Safari).
    if (startWebSpeech()) return;
    // Fallback to server-side dictation (Electron/Firefox).
    void startServerDictation();
  }, [startWebSpeech, startServerDictation]);

  const stop = useCallback(() => {
    stopWebSpeech();
    stopServerDictation();
    setIsListening(false);
    setMode("none");
  }, [stopWebSpeech, stopServerDictation]);

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

  return { isListening, mode, start, stop };
}
