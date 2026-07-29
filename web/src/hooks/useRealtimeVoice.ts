// useRealtimeVoice — React binding for the Realtime API voice transport.
//
// Replaces the old three-piece voice flow (wake-word detector → Voicebox TTS
// reply → mic dictation) with a single WebSocket connection to the S2S
// server's `/v1/realtime` proxy. The server speaks the OpenAI Realtime API:
// mic audio streams in as PCM16, the model's spoken reply streams back as
// PCM16, and VAD/turn events arrive as JSON.
//
// The hook exposes:
//   - `state` — the connection state (disconnected / connecting / connected / error)
//   - `connect()` / `disconnect()` — start/stop the voice session
//   - `userTranscript` — the user's spoken words (from input transcription)
//   - `assistantTranscript` — the model's spoken reply (from audio transcript)
//   - `isSpeaking` — true while the user is speaking (VAD)
//   - `isResponding` — true while a response is streaming
//
// The transport (`realtimeVoice`) is a singleton — one session per tab. The
// hook subscribes to its state and events via `useSyncExternalStore`, so
// multiple components can read the same session without prop-drilling.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  realtimeVoice,
  type RealtimeConnectionState,
  type RealtimeServerEvent,
} from "@/lib/realtimeVoice";

export type UseRealtimeVoiceOptions = {
  /** Voice profile for the model's spoken reply. Defaults to "alloy". */
  voice?: string;
  /** Turn detection mode. Defaults to "server_vad" (interruptible). */
  turnDetection?: "server_vad" | "none";
  /** Enable/disable the hook. When false, disconnects if active. */
  enabled?: boolean;
};

export type UseRealtimeVoiceResult = {
  /** Current connection state. */
  state: RealtimeConnectionState;
  /** Open the Realtime session. Throws on mic denial or WS failure. */
  connect: () => Promise<void>;
  /** Close the Realtime session. */
  disconnect: () => void;
  /** Send a client event (e.g. `response.create` in manual mode). */
  send: (event: Parameters<typeof realtimeVoice.send>[0]) => void;
  /** The user's spoken words so far this turn. */
  userTranscript: string;
  /** The model's spoken reply transcript (accumulating). */
  assistantTranscript: string;
  /** True while the user's speech is detected (VAD). */
  isSpeaking: boolean;
  /** True while a response is streaming back. */
  isResponding: boolean;
  /** Error message from the last failed connect attempt, or null. */
  error: string | null;
};

/**
 * Subscribe to the Realtime voice transport. The hook is read-only with
 * respect to React state — `connect`/`disconnect` are imperative calls
 * driven by user action (e.g. a mic button click).
 */
export function useRealtimeVoice(
  options: UseRealtimeVoiceOptions = {},
): UseRealtimeVoiceResult {
  const { voice, turnDetection, enabled = true } = options;

  // Connection state — synced from the transport via useState + useEffect.
  const [state, setState] = useState<RealtimeConnectionState>(() => realtimeVoice.getState());

  useEffect(() => {
    return realtimeVoice.subscribeState(() => {
      setState(realtimeVoice.getState());
    });
  }, []);

  // Derived state accumulated from server events. We keep these in local
  // React state rather than the transport so the transport stays a pure
  // transport — multiple hooks could derive differently from the same stream.
  const [userTranscript, setUserTranscript] = useState("");
  const [assistantTranscript, setAssistantTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to server events. The subscription is stable across re-renders
  // (the transport dedupes), so we only re-subscribe when our event handler
  // identity changes — which it doesn't, because the setters are stable.
  const handleEvent = useCallback((event: RealtimeServerEvent) => {
    switch (event.type) {
      case "input_audio_buffer.speech_started":
        setIsSpeaking(true);
        // Clear the user transcript at the start of a new utterance.
        setUserTranscript("");
        break;
      case "input_audio_buffer.speech_stopped":
        setIsSpeaking(false);
        break;
      case "conversation.item.input_audio_transcription.completed":
        setUserTranscript((prev) => (prev ? `${prev} ` : "") + event.transcript);
        break;
      case "response.created":
        setIsResponding(true);
        setAssistantTranscript("");
        break;
      case "response.audio_transcript.delta":
        setAssistantTranscript((prev) => prev + event.delta);
        break;
      case "response.audio_transcript.done":
        // The `.done` event carries the full transcript — replace, don't append.
        setAssistantTranscript(event.transcript);
        break;
      case "response.done":
        setIsResponding(false);
        break;
      case "error":
        // A server error mid-response ends the response.
        setIsResponding(false);
        break;
      default:
        // Other events (session.created, conversation.item.created, etc.)
        // are dispatched but don't drive the derived state this hook exposes.
        break;
    }
  }, []);

  // Subscribe to server events via useEffect — not useSyncExternalStore,
  // which is for state stores, not event subscriptions.
  useEffect(() => {
    const unsub = realtimeVoice.subscribeEvents(handleEvent);
    return unsub;
  }, [handleEvent]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      await realtimeVoice.connect({ voice, turnDetection });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err; // re-throw so callers can also catch if needed
    }
  }, [voice, turnDetection]);

  const disconnect = useCallback(() => {
    realtimeVoice.disconnect();
    // Reset derived state on disconnect.
    setUserTranscript("");
    setAssistantTranscript("");
    setIsSpeaking(false);
    setIsResponding(false);
    setError(null);
  }, []);

  const send = useCallback(
    (event: Parameters<typeof realtimeVoice.send>[0]) => {
      realtimeVoice.send(event);
    },
    [],
  );

  // Auto-disconnect when the hook is disabled.
  useEffect(() => {
    if (!enabled && state !== "disconnected") {
      realtimeVoice.disconnect();
    }
  }, [enabled, state]);

  return useMemo(
    () => ({
      state,
      connect,
      disconnect,
      send,
      userTranscript,
      assistantTranscript,
      isSpeaking,
      isResponding,
      error,
    }),
    [
      state,
      connect,
      disconnect,
      send,
      userTranscript,
      assistantTranscript,
      isSpeaking,
      isResponding,
      error,
    ],
  );
}
