// useRealtimeVoice — React binding for the Hermes-direct voice transport.
//
// Connects to the Hermes gateway (:8642) via HTTP endpoints:
//   /v1/audio/transcriptions (STT), /v1/chat/completions (LLM),
//   /v1/audio/speech (TTS). No QAA middleman — the browser talks
// directly to Hermes.
//
// The hook exposes:
//   - `state` — the connection state (disconnected / connecting / connected / error)
//   - `connect()` / `disconnect()` — start/stop the voice session
//   - `userTranscript` — the user's spoken words (from transcript.final role=user)
//   - `assistantTranscript` — the model's spoken reply (from transcript.delta/final role=assistant)
//   - `isSpeaking` — true while the user is speaking (approximated by turn.started)
//   - `isResponding` — true while a response is streaming (response.started → audio.done)
//   - `error` — error message from the last failed connect or server error
//
// The transport (`hermesVoice`) is a singleton — one session per tab. The
// hook subscribes to its state and events via `useSyncExternalStore`, so
// multiple components can read the same session without prop-drilling.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  hermesVoice,
  type RealtimeConnectionState,
  type RealtimeServerEvent,
} from "@/lib/hermesVoice";
import { createSession, postEvent } from "@/lib/sessionsApi";
import { useQueryClient } from "@tanstack/react-query";

export type UseRealtimeVoiceOptions = {
  /** Turn detection mode. Defaults to "server_vad" (interruptible). */
  turnDetection?: "server_vad" | "none";
  /** Enable/disable the hook. When false, disconnects if active. */
  enabled?: boolean;
  /** QAA realtime provider override: null = auto, "dashscope" = cloud, "speech-to-speech" = local. */
  provider?: string | null;
};

export type UseRealtimeVoiceResult = {
  /** Current connection state. */
  state: RealtimeConnectionState;
  /** Open the Realtime session. Throws on mic denial or WS failure. */
  connect: () => Promise<void>;
  /** Close the Realtime session. */
  disconnect: () => void;
  /** Send a client event (e.g. `response.create` in manual mode). */
  send: (event: Parameters<typeof hermesVoice.send>[0]) => void;
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
  /** The agent-meow session ID for this voice call, or null if not connected. */
  sessionId: string | null;
};

/**
 * Subscribe to the Realtime voice transport. The hook is read-only with
 * respect to React state — `connect`/`disconnect` are imperative calls
 * driven by user action (e.g. a mic button click).
 */
export function useRealtimeVoice(
  options: UseRealtimeVoiceOptions = {},
): UseRealtimeVoiceResult {
  const { turnDetection, enabled = true, provider = null } = options;
  const queryClient = useQueryClient();

  // Connection state — synced from the transport via useState + useEffect.
  const [state, setState] = useState<RealtimeConnectionState>(() => hermesVoice.getState());

  useEffect(() => {
    return hermesVoice.subscribeState(() => {
      setState(hermesVoice.getState());
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

  // ── Session integration: create an agent-meow session for each voice call
  // and post transcript events so voice conversations appear in the sidebar
  // and are reviewable like text chats.
  const voiceSessionIdRef = useRef<string | null>(null);
  const lastUserTranscriptRef = useRef<string>("");
  const lastAssistantTranscriptRef = useRef<string>("");

  // Subscribe to server events. The subscription is stable across re-renders
  // (the transport dedupes), so we only re-subscribe when our event handler
  // identity changes — which it doesn't, because the setters are stable.
  const handleEvent = useCallback((event: RealtimeServerEvent) => {
    switch (event.type) {
      case "turn.started":
        // A new turn started — user is speaking.
        setIsSpeaking(true);
        setUserTranscript("");
        break;
      case "response.started":
        // Response generation started — assistant is responding.
        setIsResponding(true);
        setIsSpeaking(false);
        setAssistantTranscript("");
        break;
      case "audio.done":
        // Response audio complete.
        setIsResponding(false);
        break;
      case "transcript.delta":
        // Partial transcript — could be user or assistant.
        if (event.role === "user") {
          setUserTranscript((prev) => prev + event.content);
        } else {
          setAssistantTranscript((prev) => prev + event.content);
        }
        break;
      case "transcript.final":
        // Final transcript — replace accumulated partial.
        if (event.role === "user") {
          setUserTranscript(event.content);
          lastUserTranscriptRef.current = event.content;
          // Post user message to agent-meow session if we have one.
          if (voiceSessionIdRef.current && event.content) {
            postEvent(voiceSessionIdRef.current, {
              type: "message",
              data: { role: "user", content: [{ type: "input_text", text: event.content }] },
            }).catch(() => {/* best-effort */});
          }
        } else {
          setAssistantTranscript(event.content);
          lastAssistantTranscriptRef.current = event.content;
          // Post assistant message to agent-meow session if we have one.
          if (voiceSessionIdRef.current && event.content) {
            postEvent(voiceSessionIdRef.current, {
              type: "message",
              data: { role: "assistant", content: [{ type: "output_text", text: event.content }] },
            }).catch(() => {/* best-effort */});
          }
        }
        break;
      case "playback.clear":
        // Playback was cleared — reset response state.
        setIsResponding(false);
        break;
      case "voice.state":
        // Voice state update — idle/active/busy.
        if (event.state === "idle") {
          setIsSpeaking(false);
          setIsResponding(false);
        }
        break;
      case "voice.connection":
        // Realtime provider connection state.
        if (event.state === "unavailable") {
          setError(event.message || "Voice provider unavailable");
        }
        break;
      case "error":
        // A server error ends the response.
        setIsResponding(false);
        setError(event.message);
        break;
      default:
        // Other events (gateway.connected, voice.ready, voice.ownership,
        // voice.deactivated, transcript.discard, timeline.inline,
        // client.state, response.interrupted) are dispatched but don't
        // drive the derived state this hook exposes.
        break;
    }
  }, []);

  // Subscribe to server events via useEffect — not useSyncExternalStore,
  // which is for state stores, not event subscriptions.
  useEffect(() => {
    const unsub = hermesVoice.subscribeEvents(handleEvent);
    return unsub;
  }, [handleEvent]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      // Create an agent-meow session for this voice conversation so it
      // appears in the sidebar and is reviewable later. Use the "hermes-gateway"
      // agent ID which is the voice-capable agent configured in the gateway.
      try {
        const session = await createSession("hermes-gateway", [], {
          title: "Voice conversation",
        });
        voiceSessionIdRef.current = session.id;
        // Invalidate the conversations cache so the new voice session
        // appears in the sidebar immediately (not after the next poll).
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } catch {
        // Session creation is best-effort — voice should still work
        // even if the agent-meow gateway is unavailable.
      }

      await hermesVoice.connect({ turnDetection, provider });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err; // re-throw so callers can also catch if needed
    }
  }, [turnDetection, queryClient]);

  const disconnect = useCallback(() => {
    hermesVoice.disconnect();
    // Reset derived state on disconnect.
    setUserTranscript("");
    setAssistantTranscript("");
    setIsSpeaking(false);
    setIsResponding(false);
    setError(null);
    // Clear the voice session reference — the session persists in
    // agent-meow's DB and can be reviewed in the sidebar.
    voiceSessionIdRef.current = null;
    lastUserTranscriptRef.current = "";
    lastAssistantTranscriptRef.current = "";
  }, []);

  const send = useCallback(
    (event: Parameters<typeof hermesVoice.send>[0]) => {
      hermesVoice.send(event);
    },
    [],
  );

  // Auto-disconnect when the hook is disabled.
  useEffect(() => {
    if (!enabled && state !== "disconnected") {
      hermesVoice.disconnect();
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
      sessionId: voiceSessionIdRef.current,
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
      voiceSessionIdRef.current,
    ],
  );
}
