// Realtime API voice transport: a single WebSocket carries mic audio in and
// spoken audio out, replacing the old three-piece flow (wake-word detector →
// Voicebox TTS reply → mic dictation). The browser connects to the agent-meow
// server's `/v1/realtime` proxy, which forwards to the speech-to-speech
// process at port 8765 speaking the OpenAI Realtime API protocol.
//
// This module owns only the transport: the WebSocket lifecycle, the audio
// capture graph (mic → 24 kHz PCM16), the playback queue (PCM16 → AudioBuffer),
// and the event dispatch. The `useRealtimeVoice` hook wires the parsed events
// into React state.
//
// Wire protocol (OpenAI Realtime API, server events we receive):
//   - `session.created` / `session.updated` — session config echo
//   - `input_audio_buffer.speech_started` / `.speech_stopped` — VAD events
//   - `input_audio_buffer.committed` — audio chunk handed to the model
//   - `conversation.item.created` — a user or assistant turn item
//   - `response.created` / `.done` — response lifecycle
//   - `response.output_audio.delta` — incremental spoken audio (base64 PCM16)
//   - `response.output_audio.done` — final spoken audio for a response
//   - `response.audio_transcript.delta` / `.done` — transcript of spoken reply
//   - `conversation.item.input_audio_transcription.completed` — user transcript
//   - `error` — server-side error
//
// Client events we send:
//   - `session.update` — configure turn detection, voice, modalities
//   - `input_audio_buffer.append` — raw base64 PCM16 mic audio
//   - `input_audio_buffer.commit` — (manual mode) hand audio to the model
//   - `response.create` — (manual mode) request a response
//
// Identity rides the ingress / dev proxy on the handshake, exactly like the
// session-updates and terminal-attach sockets — the browser cannot set
// `X-Forwarded-Email` on a WebSocket handshake.

import { resolveWebSocketUrl } from "@/lib/host";

// ── Audio constants ────────────────────────────────────────────────────────
// The S2S server (speech_to_speech) runs its pipeline at 16 kHz internally
// and resamples from the client rate declared in session.update. We send
// 16 kHz natively to avoid a server-side resample round-trip.
const TARGET_RATE = 16_000;
// 100 ms chunks — matches the dictation worklet cadence and keeps latency low.
const CHUNK_MS = 100;
const CHUNK_SAMPLES = (TARGET_RATE * CHUNK_MS) / 1000;

// ── Base64 helpers (works on Int16Array buffers without node Buffer) ───────
function int16ToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToInt16Array(b64: string): Int16Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

// ── Server event types ─────────────────────────────────────────────────────
export type RealtimeServerEvent =
  | { type: "session.created"; session: RealtimeSession }
  | { type: "session.updated"; session: RealtimeSession }
  | { type: "input_audio_buffer.speech_started"; item_id?: string; audio_start_ms?: number }
  | { type: "input_audio_buffer.speech_stopped"; item_id?: string; audio_end_ms?: number }
  | { type: "input_audio_buffer.committed"; item_id: string }
  | { type: "conversation.item.created"; item: RealtimeConversationItem }
  | { type: "response.created"; response: RealtimeResponse }
  | { type: "response.done"; response: RealtimeResponse }
  | { type: "response.output_audio.delta"; response_id: string; item_id: string; delta: string }
  | { type: "response.output_audio.done"; response_id: string; item_id: string; audio: string }
  | {
      type: "response.audio_transcript.delta";
      response_id: string;
      item_id: string;
      delta: string;
    }
  | { type: "response.audio_transcript.done"; response_id: string; item_id: string; transcript: string }
  | {
      type: "conversation.item.input_audio_transcription.completed";
      item_id: string;
      transcript: string;
    }
  | { type: "error"; error: { type: string; code?: string; message: string } };

export interface RealtimeSession {
  id: string;
  voice?: string;
  modalities?: string[];
  turn_detection?: {
    type: "server_vad" | "none";
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  };
  input_audio_format?: string;
  output_audio_format?: string;
  input_audio_transcription?: { model: string };
}

export interface RealtimeConversationItem {
  id: string;
  type: "message" | "function_call" | "function_call_output";
  role?: "user" | "assistant" | "system";
  content?: Array<{ type: string; text?: string; audio?: string; transcript?: string }>;
}

export interface RealtimeResponse {
  id: string;
  status: "in_progress" | "completed" | "cancelled" | "failed" | "incomplete";
  output?: RealtimeConversationItem[];
}

// ── Client event types ─────────────────────────────────────────────────────
// Note: `input_audio_buffer.commit` is NOT supported by the S2S server —
// it uses server VAD which commits audio automatically. `response.create`
// is supported for manual turn triggering.
export type RealtimeClientEvent =
  | { type: "session.update"; session: Partial<RealtimeSession> }
  | { type: "input_audio_buffer.append"; audio: string }
  | { type: "response.create" };

// ── Listener types ─────────────────────────────────────────────────────────
export type RealtimeEventListener = (event: RealtimeServerEvent) => void;
export type RealtimeStatusListener = () => void;

export type RealtimeConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * Parse one text frame from the realtime socket into a typed event.
 * Returns null for frames that don't match the protocol (ignored for
 * forward compatibility).
 */
export function parseRealtimeEvent(raw: string): RealtimeServerEvent | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const frame = data as Record<string, unknown>;
  const type = frame.type;
  if (typeof type !== "string") return null;
  // Trust the server's shape — it speaks the Realtime API. We cast through
  // unknown to the discriminated union; the server is the authority.
  return { ...(frame as object), type } as unknown as RealtimeServerEvent;
}

/**
 * Build the `ws(s)://` URL for the realtime endpoint.
 *
 * In dev, connect directly to the gateway (:6767) instead of going through
 * the Vite proxy — the Vite WebSocket proxy for /v1/realtime is unreliable
 * (ECONNREFUSED on reconnect after the gateway restarts).
 */
function buildRealtimeUrl(): string {
  const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
  // In dev, connect directly to the gateway to bypass the flaky Vite WS proxy.
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${scheme}//localhost:6767/v1/realtime`;
  }
  return resolveWebSocketUrl("/v1/realtime");
}

/**
 * One live Realtime API session: owns the WebSocket, the mic capture graph,
 * and the speaker playback queue.
 *
 * Construct via {@link RealtimeVoiceSession.start}, which resolves once the
 * WebSocket is open and the session has been configured. End it with
 * {@link stop} (graceful) or {@link cancel} (immediate teardown).
 */
export class RealtimeVoiceSession {
  private readonly ws: WebSocket;
  private readonly mediaStream: MediaStream;
  private readonly audioContext: AudioContext;
  private readonly processorNode: ScriptProcessorNode;
  private readonly sourceNode: MediaStreamAudioSourceNode;
  private readonly listeners = new Set<RealtimeEventListener>();
  private closed = false;
  private playbackQueue: AudioBuffer[] = [];
  private playing = false;
  private nextPlayTime = 0;
  private onClose: (() => void) | null = null;
  private pendingSamples: Int16Array;
  private filled = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly IDLE_TIMEOUT_MS = 60_000; // 60s — generous for multi-turn
  private responseInProgress = false;

  private constructor(
    ws: WebSocket,
    mediaStream: MediaStream,
    audioContext: AudioContext,
    sourceNode: MediaStreamAudioSourceNode,
    processorNode: ScriptProcessorNode,
  ) {
    this.ws = ws;
    this.mediaStream = mediaStream;
    this.audioContext = audioContext;
    this.sourceNode = sourceNode;
    this.processorNode = processorNode;
    this.pendingSamples = new Int16Array(CHUNK_SAMPLES);
    this.resetIdleTimer();

    // Mic audio → WebSocket. ScriptProcessorNode's onaudioprocess fires
    // reliably (unlike AudioWorklet which needs the graph to pull audio).
    const step = audioContext.sampleRate / TARGET_RATE;
    let pos = 0;
    let chunkCount = 0;
    processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      const channel = event.inputBuffer.getChannelData(0);
      if (!channel || channel.length === 0) return;
      // Resume the AudioContext if it got suspended (browser autoplay policy).
      if (audioContext.state === "suspended") void audioContext.resume();

      // Linear-interpolation downsample from context rate to TARGET_RATE.
      while (pos < channel.length) {
        const i = Math.floor(pos);
        const s0 = channel[i];
        const s1 = i + 1 < channel.length ? channel[i + 1] : s0;
        const sample = s0 + (s1 - s0) * (pos - i);
        const clamped = Math.max(-1, Math.min(1, sample));
        this.pendingSamples[this.filled++] =
          clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
        if (this.filled === CHUNK_SAMPLES) {
          if (ws.readyState === WebSocket.OPEN) {
            const audio = int16ToBase64(this.pendingSamples.buffer);
            ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio }));
            chunkCount++;
            if (chunkCount <= 3 || chunkCount % 50 === 0) {
              console.log(`[realtime] sent chunk #${chunkCount}, ${this.pendingSamples.length} samples`);
            }
            // Reset idle timer on every audio chunk sent.
            this.resetIdleTimer();
          }
          this.pendingSamples = new Int16Array(CHUNK_SAMPLES);
          this.filled = 0;
        }
        pos += step;
      }
      pos -= channel.length;
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const parsed = parseRealtimeEvent(event.data);
      if (parsed === null) return;
      // Handle audio playback internally — the delta/done events carry the
      // spoken audio that we schedule into the AudioContext.
      if (parsed.type === "response.output_audio.delta") {
        void this.enqueueAudioDelta(parsed.delta);
      } else if (parsed.type === "response.output_audio.done" && parsed.audio) {
        void this.enqueueAudioDelta(parsed.audio);
      }
      // Track response lifecycle so the idle timer doesn't fire while
      // the LLM is thinking (which can take 35+ seconds).
      if (parsed.type === "response.created") {
        this.responseInProgress = true;
      } else if (parsed.type === "response.done" || parsed.type === "error") {
        this.responseInProgress = false;
      }
      // Reset the idle timer on any server event — activity means the
      // session is still alive.
      this.resetIdleTimer();
      // Dispatch every event (including audio deltas) to listeners so the
      // hook can drive transcripts, VAD indicators, etc.
      for (const listener of this.listeners) listener(parsed);
    };

    // When the server closes the connection, tear down and notify the
    // transport so it can update state and schedule a reconnect if intended.
    ws.onclose = (event: CloseEvent) => {
      console.log(`[realtime] WebSocket closed: code=${event.code}, reason="${event.reason}", wasClean=${event.wasClean}`);
      if (this.closed) return;
      this.closed = true;
      this.teardown();
      this.onClose?.();
    };
    ws.onerror = (event: Event) => {
      console.log(`[realtime] WebSocket error:`, event);
      // onerror is always followed by onclose — let close drive teardown.
    };
  }

  /** Register a callback fired when the WebSocket closes unexpectedly. */
  set onCloseHandler(fn: (() => void) | null) {
    this.onClose = fn;
  }

  /** Reset the idle timer — closes the session after 30s of no audio sent. */
  private resetIdleTimer(): void {
    if (this.idleTimer !== null) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      // Don't close while a response is in progress — the LLM can take
      // 35+ seconds to respond, and closing early cancels the response.
      if (this.responseInProgress) {
        console.log(`[realtime] Idle timeout suppressed — response in progress`);
        this.resetIdleTimer(); // re-arm for after the response finishes
        return;
      }
      console.log(`[realtime] Idle timeout (${RealtimeVoiceSession.IDLE_TIMEOUT_MS}ms), closing session`);
      this.closed = true;
      this.teardown();
      this.onClose?.();
    }, RealtimeVoiceSession.IDLE_TIMEOUT_MS);
  }

  /**
   * Open a Realtime session: connect the WebSocket, acquire the mic, build
   * the audio graph, and send the `session.update` to configure turn
   * detection. Resolves once the server echoes `session.updated`.
   *
   * @throws if the mic is denied or the WebSocket fails to open.
   */
  static async start(options?: {
    voice?: string;
    turnDetection?: "server_vad" | "none";
    language?: string;
  }): Promise<RealtimeVoiceSession> {
    const voice = options?.voice ?? "alloy";
    const turnDetection = options?.turnDetection ?? "server_vad";

    // 1. Create the AudioContext FIRST and resume it — this must happen
    //    synchronously within the user gesture (button click). If we
    //    await getUserMedia first, the gesture context is consumed and
    //    resume() silently fails, leaving the context suspended and
    //    onaudioprocess never firing.
    const audioContext = new AudioContext();
    if (audioContext.state !== "running") {
      // Fire-and-forget — don't await, so we stay in the gesture context.
      void audioContext.resume();
    }
    console.log(`[realtime] AudioContext state: ${audioContext.state}, sampleRate: ${audioContext.sampleRate}`);

    // 2. Acquire the microphone.
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    console.log(`[realtime] getUserMedia OK, tracks: ${mediaStream.getTracks().length}, AudioContext: ${audioContext.state}`);

    // 3. Build the audio graph: mic → ScriptProcessorNode → destination.
    //    ScriptProcessorNode (deprecated but universally reliable) fires
    //    onaudioprocess regardless of graph connectivity — AudioWorklet
    //    requires the graph to pull audio, which didn't happen.
    //    We use the default AudioContext sample rate (usually 48000) and
    //    downsample inside onaudioprocess — requesting 16000 may silently
    //    fail on some browsers, leaving the context in a broken state.
    const sourceNode = audioContext.createMediaStreamSource(mediaStream);
    const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    sourceNode.connect(processorNode);
    // Connect directly to destination — a zero-gain node doesn't draw
    // enough to fire onaudioprocess on some browsers. echoCancellation
    // in getUserMedia prevents feedback.
    processorNode.connect(audioContext.destination);
    console.log(`[realtime] Audio graph: source → processor → destination, tracks: ${mediaStream.getTracks().length}, track state: ${mediaStream.getTracks()[0]?.readyState}`);

    // 3. Open the WebSocket.
    const ws = new WebSocket(buildRealtimeUrl());
    console.log(`[realtime] WebSocket opening: ${buildRealtimeUrl()}`);

    const session = new RealtimeVoiceSession(ws, mediaStream, audioContext, sourceNode, processorNode);

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        console.log(`[realtime] WebSocket open, sending session.update`);
        // 4. Configure the session: server VAD, audio + text modalities.
        //    The `type: "realtime"` field is required by the OpenAI SDK's
        //    SessionUpdateEvent model — without it the server rejects the
        //    update with a validation error.
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              type: "realtime",
              turn_detection: { type: turnDetection },
              voice,
              modalities: ["text", "audio"],
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: { model: "whisper-1" },
            },
          }),
        );
        resolve();
      };
      const onError = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        reject(new Error("Realtime WebSocket failed to connect"));
      };
      ws.addEventListener("open", onOpen, { once: true });
      ws.addEventListener("error", onError, { once: true });
    });

    return session;
  }

  /** Subscribe to parsed server events. Returns an unsubscribe function. */
  subscribe(listener: RealtimeEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Send a client event to the server. No-op if the socket isn't open. */
  send(event: RealtimeClientEvent): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Graceful stop: send any remaining audio, then tear down the
   * audio graph and close the WebSocket.
   */
  async stop(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    // Send any partially-filled chunk before closing.
    if (this.filled > 0 && this.ws.readyState === WebSocket.OPEN) {
      const partial = this.pendingSamples.slice(0, this.filled);
      const audio = int16ToBase64(partial.buffer);
      this.ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio }));
    }

    this.teardown();
  }

  /** Immediate teardown — no flush. Safe to call multiple times. */
  cancel(): void {
    if (this.closed) return;
    this.closed = true;
    this.teardown();
  }

  private teardown(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.processorNode.onaudioprocess = null;
    try {
      this.sourceNode.disconnect();
      this.processorNode.disconnect();
    } catch {
      // already disconnected
    }
    this.mediaStream.getTracks().forEach((t) => t.stop());
    void this.audioContext.close();
    this.ws.onmessage = this.ws.onerror = this.ws.onclose = null;
    if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
      try {
        this.ws.close();
      } catch {
        // already closing
      }
    }
    this.playbackQueue = [];
    this.playing = false;
  }

  // ── Audio playback ──────────────────────────────────────────────────────
  /**
   * Decode a base64 PCM16 chunk and schedule it for gapless playback.
   * Chunks are queued and played in order via the AudioContext's clock.
   */
  private async enqueueAudioDelta(base64: string): Promise<void> {
    const samples = base64ToInt16Array(base64);
    const audioBuffer = this.audioContext.createBuffer(1, samples.length, TARGET_RATE);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) {
      channelData[i] = samples[i] / 0x8000;
    }
    this.playbackQueue.push(audioBuffer);
    void this.drainQueue();
  }

  private async drainQueue(): Promise<void> {
    if (this.playing) return;
    this.playing = true;
    while (this.playbackQueue.length > 0) {
      const buffer = this.playbackQueue.shift()!;
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      // Gapless: schedule the next chunk right after the previous one.
      const now = this.audioContext.currentTime;
      const startAt = Math.max(this.nextPlayTime, now);
      source.start(startAt);
      this.nextPlayTime = startAt + buffer.duration;
      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
      });
    }
    this.playing = false;
    this.nextPlayTime = 0;
  }
}

/**
 * Singleton transport manager for the Realtime voice session. Owns the
 * reconnect logic and exposes the connection state to React via
 * `useSyncExternalStore`. One instance per tab.
 *
 * Unlike `sessionUpdatesSocket` (always-on), this transport is
 * request-driven: {@link connect} opens a session when the user activates
 * voice, and {@link disconnect} tears it down when they're done. Reconnect
 * only fires if an active session drops unexpectedly.
 */
class RealtimeVoiceTransport {
  private session: RealtimeVoiceSession | null = null;
  private state: RealtimeConnectionState = "disconnected";
  private readonly stateListeners = new Set<RealtimeStatusListener>();
  private readonly eventListeners = new Set<RealtimeEventListener>();
  private startOptions: { voice?: string; turnDetection?: "server_vad" | "none" } = {};

  /** Current connection state. */
  getState(): RealtimeConnectionState {
    return this.state;
  }

  /** Subscribe to connection-state changes. */
  subscribeState(listener: RealtimeStatusListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /** Subscribe to parsed server events. */
  subscribeEvents(listener: RealtimeEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private setState(value: RealtimeConnectionState): void {
    if (this.state === value) return;
    this.state = value;
    for (const listener of this.stateListeners) listener();
  }

  /**
   * Open a Realtime voice session. Resolves once connected and configured.
   * Throws on mic denial or WebSocket failure.
   */
  async connect(options?: {
    voice?: string;
    turnDetection?: "server_vad" | "none";
  }): Promise<void> {
    this.startOptions = options ?? {};
    await this.doConnect();
  }

  private async doConnect(): Promise<void> {
    if (this.session !== null) return;
    this.setState("connecting");
    try {
      const session = await RealtimeVoiceSession.start(this.startOptions);
      this.session = session;
      this.setState("connected");
      console.log(`[realtime] Connected, state=connected`);
      // Wire server events to all listeners.
      session.subscribe((event) => {
        for (const listener of this.eventListeners) listener(event);
      });
      // When the server closes the connection unexpectedly, update state.
      // Do NOT auto-reconnect — reconnect calls getUserMedia which requires
      // a user gesture. The user must click the mic button to reconnect.
      session.onCloseHandler = () => {
        if (this.session === session) {
          console.log(`[realtime] Session closed, setting state=disconnected`);
          this.session = null;
          this.setState("disconnected");
        }
      };
    } catch (err) {
      console.log(`[realtime] Connect failed:`, err);
      this.session = null;
      this.setState("error");
      throw err;
    }
  }

  /** Disconnect and stop reconnecting. */
  disconnect(): void {
    const session = this.session;
    this.session = null;
    if (session) {
      session.onCloseHandler = null; // suppress reconnect on intentional close
      session.cancel();
    }
    this.setState("disconnected");
  }

  /** Send a client event through the active session. No-op if not connected. */
  send(event: RealtimeClientEvent): void {
    this.session?.send(event);
  }
}

/** Shared transport instance for the current tab. */
export const realtimeVoice = new RealtimeVoiceTransport();

// Destroy the transport on page unload so the WebSocket doesn't reconnect
// during HMR or page reload — the old singleton's onclose handler would
// fire and schedule a reconnect, causing a connection storm that exhausts
// the S2S server's pool (size 1).
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    realtimeVoice.disconnect();
  });
}
