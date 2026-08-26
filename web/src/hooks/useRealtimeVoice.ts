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
import { createSession } from "@/lib/sessionsApi";
import { renameConversation } from "@/hooks/useConversations";
import { getCachedServerInfo } from "@/lib/capabilities";
import { stopReadAloud } from "@/lib/readAloudAudio";
import type { Host } from "@/hooks/useHosts";
import { useQueryClient } from "@tanstack/react-query";
import type { AvailableAgent } from "@/hooks/useAvailableAgents";

/**
 * Display name of the voice-capable agent configured in the Hermes gateway.
 * We resolve this to its durable `agent_id` (returned by GET /v1/agents)
 * before calling `createSession`, which the /v1/sessions route requires.
 * The legacy /v1/responses flow accepted the agent name as `model`, but
 * /v1/sessions expects `agent_id` (32-char hex) — see sessionsApi docs.
 */
const VOICE_AGENT_NAME = "hermes-gateway";

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
  /** True while audio is actively playing back (after first TTS chunk). */
  isAudioPlaying: boolean;
  /** The last voice command to auto-submit as a task, or null. */
  voiceCommand: string | null;
  /** Clear the voice command after it's been consumed. */
  clearVoiceCommand: () => void;
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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The voice-call session id (created in connect() so transcript events
  // post to it). Mirrored from the ref below so the rendered memo actually
  // updates when the id changes — refs don't trigger re-renders.
  const [voiceSessionId, setVoiceSessionId] = useState<string | null>(null);

  // ── Session integration: create an agent-meow session for each voice call
  // and post transcript events so voice conversations appear in the sidebar
  // and are reviewable like text chats.
  //
  // The ref is the source of truth for synchronous reads inside the
  // transport event callback (setState would be stale by the time the next
  // event fires). The mirrored state above is for the public `sessionId`
  // return value.
  const voiceSessionIdRef = useRef<string | null>(null);
  const lastUserTranscriptRef = useRef<string>("");
  const lastAssistantTranscriptRef = useRef<string>("");
  // Guards so we only rename the session once per voice call (to the
  // first user prompt) — subsequent prompts don't overwrite the title.
  const titleRenamedRef = useRef(false);

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
      case "voice.command":
        // Intent classifier detected a task command — auto-submit.
        setVoiceCommand(event.content);
        break;
      case "playback.started":
        // First audio chunk is playing — switch from "Responding" to "Speaking".
        // Stop any active Read-aloud clip so the two audio systems don't overlap.
        stopReadAloud();
        setIsAudioPlaying(true);
        break;
      case "audio.done":
        // Response audio complete.
        setIsResponding(false);
        setIsAudioPlaying(false);
        // Clear transcripts after a brief delay so the user sees the
        // final text before it disappears. The turn is persisted in the
        // session (visible in the sidebar + session page), so the
        // landing page transcripts are ephemeral display only.
        // 1.5s delay: enough to read the last sentence, short enough
        // to not feel stale when the next turn starts.
        setTimeout(() => {
          setUserTranscript("");
          setAssistantTranscript("");
        }, 1500);
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
          // Rename the voice session to the first user prompt so the
          // sidebar shows what was said instead of "Voice conversation".
          // Only the first prompt becomes the title; subsequent prompts
          // are left alone (like text chats where the title stays).
          if (
            voiceSessionIdRef.current &&
            event.content &&
            !titleRenamedRef.current
          ) {
            titleRenamedRef.current = true;
            const title = event.content.slice(0, 80).trim() || "Voice conversation";
            renameConversation(voiceSessionIdRef.current, title)
              .then(() => {
                void queryClient.invalidateQueries({ queryKey: ["conversations"] });
              })
              .catch(() => {/* best-effort; title stays as default */});
          }
          // User message persistence is handled by the session runner
          // (chatStreamViaAgentMeow posts the message via postEvent,
          // and the runner persists it). Do NOT post external_conversation_item
          // here — that creates a duplicate message in the conversation.
        } else {
          setAssistantTranscript(event.content);
          lastAssistantTranscriptRef.current = event.content;
          // Assistant message persistence is handled by the session
          // runner (chatStreamViaAgentMeow streams the LLM response
          // through the runner, which persists it). Do NOT post
          // external_assistant_message here — that creates a duplicate.
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
      case "tts.skipped":
        // A sentence failed synthesis twice and was dropped from voice-back.
        // Surface it as a non-fatal warning so the user knows why a piece
        // of the reply is missing from audio (text still shows it).
        setError(`语音合成跳过了一句：${event.sentence.slice(0, 30)}…`);
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
  }, [queryClient]);

  // Subscribe to server events via useEffect — not useSyncExternalStore,
  // which is for state stores, not event subscriptions.
  useEffect(() => {
    const unsub = hermesVoice.subscribeEvents(handleEvent);
    return unsub;
  }, [handleEvent]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      // Reuse the existing voice session if we still have one — avoids
      // creating a new conversation on every reconnect (which caused
      // "second voice task in new window": the old session's queued
      // turn ran in the background while the new command opened a new
      // session). Only create a new session when there is none yet.
      if (voiceSessionIdRef.current) {
        hermesVoice.setAgentMeowSession(voiceSessionIdRef.current);
      } else {
        // Create an agent-meow session for this voice conversation so it
        // appears in the sidebar and is reviewable later. /v1/sessions
        // expects the agent's durable ID (32-char hex), not its display
        // name — the legacy /v1/responses flow accepted the name as
        // `model`, but /v1/sessions rejects unknown ids with 404. Resolve
        // the name through the agent catalog first.
        try {
          const agents = queryClient.getQueryData<AvailableAgent[]>([
            "available-agents",
          ]);
          const voiceAgent = agents?.find((a) => a.name === VOICE_AGENT_NAME);
          if (voiceAgent === undefined) {
            // Catalog not warmed yet (or the agent isn't registered).
            // Surface this so the user knows the conversation won't be
            // recorded, but don't block the voice call — real-time audio
            // doesn't depend on persistence.
            setError(
              `Voice agent "${VOICE_AGENT_NAME}" not found in catalog; conversation will not be recorded.`,
            );
          } else {
            // Resolve the first online host + default workspace so
            // the server binds a runner at creation time (same fix as
            // chatStore's ensureBoundSession — without host_id the
            // session has no runner and messages 503).
            const hosts = queryClient.getQueryData<Host[]>(["hosts", { includeSandbox: false }]);
            const onlineHost = hosts?.find((h) => h.status === "online");
            const createOpts: { title: string; hostId?: string; workspace?: string } = {
              title: "Voice conversation",
            };
            if (onlineHost) {
              createOpts.hostId = onlineHost.host_id;
              const info = getCachedServerInfo();
              // The server requires an absolute workspace when host_id is set,
              // but the tilde default (~/agent-meow-workspace) is host-OS
              // agnostic — the server stats it on the host and expands ``~``
              // itself (Windows → C:\Users\..., Linux → /root/...). Send it
              // as-is; expanding client-side guesses the host OS and breaks
              // session creation (voice conversations silently not recorded).
              if (info?.default_workspace) {
                createOpts.workspace = info.default_workspace;
              }
            }
            const session = await createSession(voiceAgent.id, [], createOpts);
            voiceSessionIdRef.current = session.id;
            setVoiceSessionId(session.id);
            // Bind the session to the voice transport so LLM turns route
            // through agent-meow's runner (persona, memory, tools) instead
            // of Hermes directly.
            hermesVoice.setAgentMeowSession(session.id);
            // Invalidate the conversations cache so the new voice session
            // appears in the sidebar immediately (not after the next poll).
            void queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        } catch (sessionErr) {
          // Session creation is best-effort — voice should still work
          // even if the agent-meow gateway is unavailable. Log so the
          // failure is visible during development.
          // eslint-disable-next-line no-console
          console.warn(
            "[useRealtimeVoice] could not create voice session:",
            sessionErr,
          );
        }
      }

      await hermesVoice.connect({ turnDetection, provider });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err; // re-throw so callers can also catch if needed
    }
  }, [turnDetection, provider, queryClient]);

  const disconnect = useCallback(() => {
    hermesVoice.disconnect();
    // Unbind the agent-meow session so the transport falls back to
    // direct Hermes chat on the next connect (if no session is created).
    hermesVoice.setAgentMeowSession(null);
    // Reset derived state on disconnect.
    setUserTranscript("");
    setAssistantTranscript("");
    setIsSpeaking(false);
    setIsResponding(false);
    setIsAudioPlaying(false);
    setVoiceCommand(null);
    setError(null);
    // Clear the voice session reference — the session persists in
    // agent-meow's DB and can be reviewed in the sidebar.
    voiceSessionIdRef.current = null;
    setVoiceSessionId(null);
    lastUserTranscriptRef.current = "";
    lastAssistantTranscriptRef.current = "";
    titleRenamedRef.current = false;
  }, []);

  const send = useCallback(
    (event: Parameters<typeof hermesVoice.send>[0]) => {
      hermesVoice.send(event);
    },
    [],
  );

  const clearVoiceCommand = useCallback(() => {
    setVoiceCommand(null);
  }, []);

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
      isAudioPlaying,
      voiceCommand,
      clearVoiceCommand,
      error,
      sessionId: voiceSessionId,
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
      isAudioPlaying,
      voiceCommand,
      clearVoiceCommand,
      error,
      voiceSessionId,
      // voiceSessionIdRef.current intentionally NOT a dep — refs don't
      // trigger re-renders, and the synchronous reads inside the
      // event handler use the ref. The mirror state above is what
      // drives the rendered memo.
    ],
  );
}
