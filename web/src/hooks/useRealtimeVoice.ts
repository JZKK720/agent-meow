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
  type VoiceState,
} from "@/lib/hermesVoice";
import { createSession } from "@/lib/sessionsApi";
import { renameConversation } from "@/hooks/useConversations";
import { getCachedServerInfo } from "@/lib/capabilities";
import { setVoiceActive, stopReadAloud } from "@/lib/readAloudAudio";
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
  /** Wake-word gate consumer. When provided, the hook defers to it on a
   *  `wake.word` event instead of running the inline pause→open→resume
   *  sequence. Surfaces that also mount the wake-word detector (which owns
   *  the spoken ack "橘宝在呢" + its echo-back wait) must pass their handler
   *  here — otherwise two consumers race the gate and the ack's
   *  echo-back guard is undercut (2026-09-02 mic-race fix). */
  onWakeWord?: () => void;
  /** Create a standalone "Voice conversation" session on connect. Landing
   *  surfaces disable this because they create the visible selected-agent
   *  session when the wake word fires, before the command utterance. */
  createSessionOnConnect?: boolean;
};

export type UseRealtimeVoiceResult = {
  /** Current connection state. */
  state: RealtimeConnectionState;
  /** True when the VAD is connected in wake-word-only mode (background
   *  listening for "橘宝", not a full voice turn). The UI uses this to
   *  show "Start" on the paw button and "Wake word on" on the chip. */
  isWakeWordOnly: boolean;
  /** The unified voice state enum (G3/G4, 橘宝 rules). One authoritative
   *  signal derived from the transport — replaces the implicit
   *  isProcessing+ttsPlaying+isAudioPlaying+vadPaused scatter.
   *  Use this for state-machine decisions (e.g. mic locking, ASR gating);
   *  the boolean fields remain for fine-grained UI affordances. */
  voiceState: VoiceState;
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
  /** The last file-search query from a voice "search local" intent, or null.
   *  Consumers call the file-search endpoint and reveal the hits in the
   *  right rail (plan 039 P1) — no LLM turn. */
  voiceFileSearch: string | null;
  /** Clear the voice file-search query after it's been consumed. */
  clearVoiceFileSearch: () => void;
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
export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}): UseRealtimeVoiceResult {
  const {
    turnDetection,
    enabled = true,
    provider = null,
    onWakeWord,
    createSessionOnConnect = true,
  } = options;
  const queryClient = useQueryClient();
  // Sync the callback into a ref so the stable handleEvent closure always
  // calls the latest handler without re-subscribing.
  const onWakeWordRef = useRef(onWakeWord);
  onWakeWordRef.current = onWakeWord;

  // Connection state — synced from the transport via useState + useEffect.
  const [state, setState] = useState<RealtimeConnectionState>(() => hermesVoice.getState());
  const [isWakeWordOnly, setIsWakeWordOnly] = useState<boolean>(() => hermesVoice.isWakeWordOnly);

  useEffect(() => {
    return hermesVoice.subscribeState(() => {
      setState(hermesVoice.getState());
      setIsWakeWordOnly(hermesVoice.isWakeWordOnly);
      // Connection flips re-derive the unified state too — connect lands in
      // listening, disconnect in disconnected. Mid-turn disconnects (the G2
      // rebind path never does this, but the toggle-off does) must not leave
      // a stale "processing"/"speaking" in the UI.
      setVoiceState(hermesVoice.getVoiceState());
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
  // Unified voice state (G3/G4) — seeded from the transport, then re-derived
  // from the same events that drive the booleans above. Every transition of
  // the 橘宝 state machine passes through handleEvent, so this mirrors the
  // transport's getVoiceState() without adding a second subscription.
  const [voiceState, setVoiceState] = useState<VoiceState>(() => hermesVoice.getVoiceState());
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);
  const [voiceFileSearch, setVoiceFileSearch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The voice-call session id (created in connect() so transcript events
  // post to it). Mirrored from the ref below so the rendered memo actually
  // updates when the id changes — refs don't trigger re-renders.
  const [voiceSessionId, setVoiceSessionId] = useState<string | null>(
    // Inherit an existing voice session from the singleton transport —
    // when the user navigates from NewChatDialog to ChatPage mid-voice-turn,
    // the transport already has a session bound. Starting from null would
    // make the hook think no session exists and create a new one on the
    // next connect(), duplicating the conversation.
    () => hermesVoice.getAgentMeowSession(),
  );

  // ── Session integration: create an agent-meow session for each voice call
  // and post transcript events so voice conversations appear in the sidebar
  // and are reviewable like text chats.
  //
  // The ref is the source of truth for synchronous reads inside the
  // transport event callback (setState would be stale by the time the next
  // event fires). The mirrored state above is for the public `sessionId`
  // return value.
  const voiceSessionIdRef = useRef<string | null>(hermesVoice.getAgentMeowSession());
  const lastUserTranscriptRef = useRef<string>("");
  const lastAssistantTranscriptRef = useRef<string>("");
  // Guards so we only rename the session once per voice call (to the
  // first user prompt) — subsequent prompts don't overwrite the title.
  const titleRenamedRef = useRef(false);

  // Subscribe to server events. The subscription is stable across re-renders
  // (the transport dedupes), so we only re-subscribe when our event handler
  // identity changes — which it doesn't, because the setters are stable.
  const handleEvent = useCallback(
    (event: RealtimeServerEvent) => {
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
          setVoiceState("processing");
          break;
        case "voice.command":
          // Intent classifier detected a task command — auto-submit.
          setVoiceCommand(event.content);
          break;
        case "voice.file_search":
          // plan 039 P1: file_search intent — surface the hits in the right
          // rail (search endpoint + reveal). No LLM turn.
          setVoiceFileSearch(event.query);
          break;
        case "wake.word":
          // Wake-word gate consumer: when the gate is armed (startWakeWordMode
          // after connect), a `wake.word` event must OPEN it for one turn.
          // When the surface owns the full sequence (ack TTS + echo-back wait
          // + gate open), it passes onWakeWord and this hook defers to it.
          // Without a callback (in-session composer) the inline sequence runs:
          // pause the VAD, open the gate via stopWakeWordModeForTurn (sets
          // the transport's one-shot auto-stop marker), then resume the VAD.
          // Without this consumer
          // the in-session gate was armed but wake.word fired into the void —
          // no voice turn ever ran.
          if (onWakeWordRef.current) {
            onWakeWordRef.current();
          } else if (hermesVoice.getState() === "connected") {
            hermesVoice.pauseVad();
            hermesVoice.stopWakeWordModeForTurn();
            hermesVoice.resumeVad();
          }
          break;
        case "playback.started":
          // First audio chunk is playing — switch from "Responding" to "Speaking".
          // Stop any active Read-aloud clip so the two audio systems don't overlap.
          // Mark voice active so speakText()'s isVoiceActive() guard blocks
          // auto-speak from starting a second TTS while voice TTS drains.
          stopReadAloud();
          setVoiceActive(true);
          setIsAudioPlaying(true);
          setVoiceState("speaking");
          break;
        case "audio.done":
          // Response audio complete.
          setIsResponding(false);
          setIsAudioPlaying(false);
          // TTS drained → back to Listening (rule 8).
          setVoiceState("listening");
          // Clear the voice-active flag so auto-speak (speakText) can run again.
          setVoiceActive(false);
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
            if (voiceSessionIdRef.current && event.content && !titleRenamedRef.current) {
              titleRenamedRef.current = true;
              const title = event.content.slice(0, 80).trim() || "Voice conversation";
              renameConversation(voiceSessionIdRef.current, title)
                .then(() => {
                  void queryClient.invalidateQueries({ queryKey: ["conversations"] });
                })
                .catch(() => {
                  /* best-effort; title stays as default */
                });
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
          // Interrupt/Stop returns directly to Listening (rule 13).
          setVoiceState("listening");
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
          // H2 (2026-09-03 audit): an error thrown MID-REPLY (after
          // playback.started) never emits audio.done, so isAudioPlaying
          // and voiceState stuck at speaking/processing — the paw showed
          // "Speaking…" while the transport had already recovered. The
          // error path must reset the full audio state, mirroring what
          // audio.done does. isSpeaking covers the pre-response phase
          // (turn.started sets it; only response.started cleared it).
          setIsAudioPlaying(false);
          setIsSpeaking(false);
          setVoiceState(hermesVoice.getState() === "connected" ? "listening" : "disconnected");
          setError(event.message);
          break;
        default:
          // Other events (gateway.connected, voice.ready, voice.ownership,
          // voice.deactivated, transcript.discard, timeline.inline,
          // client.state, response.interrupted) are dispatched but don't
          // drive the derived state this hook exposes.
          break;
      }
    },
    [queryClient],
  );

  // Subscribe to server events via useEffect — not useSyncExternalStore,
  // which is for state stores, not event subscriptions.
  useEffect(() => {
    const unsub = hermesVoice.subscribeEvents(handleEvent);
    return unsub;
  }, [handleEvent]);

  // Session-creation in-flight guard — shared across the hook's lifetime.
  // The transport's connect() guards re-entry, but the session-creation
  // prefix (agent catalog → POST /v1/sessions → bind) is a long await the
  // transport guard doesn't cover: two rapid clicks both entered the
  // createSession branch (ref still null) and spawned an orphaned "Voice
  // conversation" in the sidebar (multi-agent audit finding 2, 2026-09-02).
  const connectInFlightRef = useRef<Promise<void> | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    // Serialize the whole connect: a second caller while one is in flight
    // awaits the first's result instead of racing the createSession branch.
    if (connectInFlightRef.current) {
      await connectInFlightRef.current;
      return;
    }
    connectInFlightRef.current = (async () => {
      try {
        // Reuse the existing voice session if we still have one — avoids
        // creating a new conversation on every reconnect (which caused
        // "second voice task in new window": the old session's queued
        // turn ran in the background while the new command opened a new
        // session). Only create a new session when there is none yet.
        if (voiceSessionIdRef.current) {
          hermesVoice.setAgentMeowSession(voiceSessionIdRef.current);
        } else if (createSessionOnConnect) {
          // Create an agent-meow session for this voice conversation so it
          // appears in the sidebar and is reviewable later. /v1/sessions
          // expects the agent's durable ID (32-char hex), not its display
          // name — the legacy /v1/responses flow accepted the name as
          // `model`, but /v1/sessions rejects unknown ids with 404. Resolve
          // the name through the agent catalog first.
          try {
            const agents = queryClient.getQueryData<AvailableAgent[]>(["available-agents"]);
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
            console.warn("[useRealtimeVoice] could not create voice session:", sessionErr);
          }
        }

        await hermesVoice.connect({ turnDetection, provider });
        // Persist the voice auto-start preference so the next app launch
        // auto-starts VAD + wake word mode (Electron main process reads
        // this flag and sends the "agent-meow:auto-start-voice" IPC event).
        try {
          const bridge = (
            window as unknown as { electron?: { ipcRenderer?: { send: (ch: string) => void } } }
          ).electron;
          bridge?.ipcRenderer?.send("agent-meow:voice-enabled");
        } catch {
          /* best-effort */
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err; // re-throw so callers can also catch if needed
      } finally {
        connectInFlightRef.current = null;
      }
    })();
    await connectInFlightRef.current;
  }, [turnDetection, provider, queryClient, createSessionOnConnect]);

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
    setVoiceFileSearch(null);
    setError(null);
    // The unified state follows the transport — disconnect → disconnected.
    setVoiceState(hermesVoice.getVoiceState());
    // Clear the voice session reference — the session persists in
    // agent-meow's DB and can be reviewed in the sidebar.
    voiceSessionIdRef.current = null;
    setVoiceSessionId(null);
    lastUserTranscriptRef.current = "";
    lastAssistantTranscriptRef.current = "";
    titleRenamedRef.current = false;
  }, []);

  const send = useCallback((event: Parameters<typeof hermesVoice.send>[0]) => {
    hermesVoice.send(event);
  }, []);

  const clearVoiceCommand = useCallback(() => {
    setVoiceCommand(null);
  }, []);

  const clearVoiceFileSearch = useCallback(() => {
    setVoiceFileSearch(null);
  }, []);

  // Auto-disconnect when the hook is disabled.
  useEffect(() => {
    if (!enabled && state !== "disconnected") {
      hermesVoice.disconnect();
    }
  }, [enabled, state]);

  // Auto-start voice on Electron app launch if the user previously
  // enabled it. The Electron main process sends "agent-meow:auto-start-voice"
  // after createWindow() when a voice_auto_start flag file exists in
  // userData. The first launch still requires a user gesture (clicking
  // the voice button) — a Chromium security requirement. After that,
  // the flag persists and the app auto-starts on subsequent launches.
  useEffect(() => {
    if (!enabled) return;
    const bridge = (
      window as unknown as {
        electron?: {
          ipcRenderer?: {
            on: (ch: string, cb: () => void) => void;
            off: (ch: string, cb: () => void) => void;
          };
        };
      }
    ).electron;
    if (!bridge?.ipcRenderer) return;
    const handleAutoStart = () => {
      // Check mic permission before auto-starting.
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((result) => {
          if (result.state === "granted") {
            connect()
              .then(() => {
                hermesVoice.startWakeWordMode();
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    };
    bridge.ipcRenderer.on("agent-meow:auto-start-voice", handleAutoStart);
    return () => {
      bridge.ipcRenderer?.off("agent-meow:auto-start-voice", handleAutoStart);
    };
  }, [enabled, connect]);

  return useMemo(
    () => ({
      state,
      isWakeWordOnly,
      voiceState,
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
      voiceFileSearch,
      clearVoiceFileSearch,
      error,
      sessionId: voiceSessionId,
    }),
    [
      state,
      isWakeWordOnly,
      voiceState,
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
      voiceFileSearch,
      clearVoiceFileSearch,
      error,
      voiceSessionId,
      // voiceSessionIdRef.current intentionally NOT a dep — refs don't
      // trigger re-renders, and the synchronous reads inside the
      // event handler use the ref. The mirror state above is what
      // drives the rendered memo.
    ],
  );
}
