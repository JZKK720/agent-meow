// Realtime voice transport for QAA (Qwen Audio Agent) gateway.
// A single WebSocket carries mic audio in and spoken audio out.
// The browser connects to QAA's `/api/realtime` endpoint on :3101,
// which wires audio to Hermes ACP (MeowCat persona) and streams back
// spoken responses + transcripts.
//
// QAA uses its own GatewayClientEvent / GatewayServerEvent protocol
// (NOT OpenAI Realtime API). See:
//   qwen-audio-agent/shared/realtime-events.mjs
//
// This module owns only the transport: the WebSocket lifecycle, the audio
// capture graph (mic → 24 kHz PCM16), the playback queue (PCM16 → AudioBuffer),
// and the event dispatch. The `useRealtimeVoice` hook wires the parsed events
// into React state.
//
// Wire protocol (QAA GatewayServerEvent, server events we receive):
//   - `gateway.connected` — initial handshake
//   - `voice.connection` — realtime provider state (connected/disconnected/unavailable)
//   - `voice.ready` — session ready, includes inputSampleRate and provider info
//   - `voice.state` — voice state (idle/active/busy)
//   - `voice.ownership` — voice ownership arbitration
//   - `turn.started` — a new turn started
//   - `response.started` — response generation started
//   - `audio.delta` — incremental spoken audio (base64 PCM16)
//   - `audio.done` — final spoken audio for a response
//   - `transcript.delta` — partial transcript (assistant or user)
//   - `transcript.final` — final transcript
//   - `playback.clear` — clear playback queue
//   - `error` — server-side error
//
// Client events we send (QAA GatewayClientEvent):
//   - `connect` — configure session (inputEnabled, outputEnabled, clientType)
//   - `audio.append` — raw base64 PCM16 mic audio
//   - `unmute` — activate voice (start sending audio)
//   - `mute` — deactivate voice
//   - `interrupt` — interrupt current response
//   - `playback.started` / `playback.ended` — playback lifecycle feedback

import { resolveWebSocketUrl } from "@/lib/host";

// ── Audio constants ────────────────────────────────────────────────────────
// QAA's realtime provider typically runs at 24 kHz (DashScope) or 16 kHz (local S2S).
// We send 24 kHz by default for QAA — it handles resampling internally.
const TARGET_RATE = 24_000;
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

// ── Server event types (QAA GatewayServerEvent) ──────────────────────────────
export type RealtimeServerEvent =
  | { type: "gateway.connected"; instanceId?: string }
  | { type: "voice.connection"; state: "connected" | "disconnected" | "unavailable"; provider?: string; message?: string }
  | { type: "voice.ready"; inputSampleRate: number; provider: string; providerLabel: string }
  | { type: "voice.state"; state: "idle" | "active" | "busy" }
  | { type: "voice.ownership"; state: "active" | "busy" | "available"; holder?: unknown }
  | { type: "voice.deactivated"; holder?: unknown }
  | { type: "turn.started"; turnId: string }
  | { type: "response.started"; responseId?: string; turnId?: string }
  | { type: "response.interrupted"; responseId?: string }
  | { type: "audio.delta"; audio: string; sampleRate?: number; responseId?: string; turnId?: string }
  | { type: "audio.done"; responseId?: string; turnId?: string }
  | { type: "transcript.delta"; role?: "user" | "assistant"; content: string; responseId?: string; turnId?: string }
  | { type: "transcript.final"; role?: "user" | "assistant"; content: string; responseId?: string; turnId?: string }
  | { type: "transcript.discard"; turnId?: string }
  | { type: "playback.clear" }
  | { type: "timeline.inline"; item?: unknown }
  | { type: "client.state"; states?: string[] }
  | { type: "error"; message: string }

// Legacy S2S event types (for backward compat, not used with QAA)
export type LegacyS2SEvent =
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
  | { type: "response.audio_transcript.delta"; response_id: string; item_id: string; delta: string }
  | { type: "response.audio_transcript.done"; response_id: string; item_id: string; transcript: string }
  | { type: "conversation.item.input_audio_transcription.completed"; item_id: string; transcript: string }
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

// ── Client event types (QAA GatewayClientEvent) ──────────────────────────────
export type RealtimeClientEvent =
  | { type: "connect"; clientType: "web"; inputEnabled: boolean; outputEnabled: boolean; voiceEnabled?: boolean; provider?: string }
  | { type: "audio.append"; audio: string }
  | { type: "unmute"; takeover?: boolean }
  | { type: "input.unmute"; takeover?: boolean }
  | { type: "mute" }
  | { type: "input.mute" }
  | { type: "interrupt" }
  | { type: "playback.started"; responseId?: string; turnId?: string }
  | { type: "playback.ended"; responseId?: string; turnId?: string }
  | { type: "playback.cancelled"; responseId?: string; turnId?: string }
  | { type: "text.message"; text: string };

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
 * Build the `ws(s)://` URL for the QAA realtime endpoint.
 *
 * QAA runs on :3101 and exposes /api/realtime as its WebSocket endpoint.
 * In dev (Vite on :5173), connect directly to QAA on :3101.
 * In production (served by the gateway itself), use the host seam as normal
 * but override the port to QAA's :3101.
 */
function buildRealtimeUrl(): string {
  // In dev, the page is served from :5173 but QAA is on :3101.
  // Bypass the Vite proxy and connect directly to QAA.
  if (window.location.port === "5173") {
    const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${scheme}//${window.location.hostname}:3101/api/realtime`;
  }
  // In production, if served from :6767 (agent-meow gateway), connect to QAA.
  if (window.location.port === "6767") {
    const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${scheme}//${window.location.hostname}:3101/api/realtime`;
  }
  // Otherwise, use the same host with QAA's path — QAA may be behind a reverse proxy.
  return resolveWebSocketUrl("/api/realtime");
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
  private onClose: ((code: number, reason: string) => void) | null = null;
  private pendingSamples: Int16Array;
  private filled = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly IDLE_TIMEOUT_MS = 60_000; // 60s — generous for multi-turn
  private responseInProgress = false;
  // Resolves once the session has fully torn down (AudioContext closed,
  // mic tracks stopped, WS closed). Every teardown path sets this so the
  // transport can await it before starting a new session — the fix for the
  // restart race where a new AudioContext was created while the old one
  // was still closing, leaving the new context suspended and unable to
  // listen.
  private teardownPromiseResolve: () => void = () => {};
  readonly teardownPromise: Promise<void> = new Promise((resolve) => {
    this.teardownPromiseResolve = resolve;
  });

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
            ws.send(JSON.stringify({ type: "audio.append", audio }));
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
      // Handle audio playback internally — QAA's audio.delta events carry
      // the spoken audio that we schedule into the AudioContext.
      if (parsed.type === "audio.delta") {
        void this.enqueueAudioDelta(parsed.audio);
      }
      // Track response lifecycle so the idle timer doesn't fire while
      // the LLM is thinking (which can take 35+ seconds).
      if (parsed.type === "response.started" || parsed.type === "turn.started") {
        this.responseInProgress = true;
      } else if (parsed.type === "audio.done" || parsed.type === "error") {
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
      // Async teardown so the AudioContext close is awaited and the
      // teardownPromise resolves — the transport awaits it before allowing
      // a reconnect. Fire-and-forget here because onClose must stay sync.
      void this.teardownAsync();
      this.onClose?.(event.code, event.reason);
    };
    ws.onerror = (event: Event) => {
      console.log(`[realtime] WebSocket error:`, event);
      // onerror is always followed by onclose — let close drive teardown.
    };
  }

  /** Register a callback fired when the WebSocket closes unexpectedly.
   * The callback receives the close code and reason so the transport can
   * distinguish a normal idle timeout (1000) from a server restart/crash
   * (1011) and surface that to the user. */
  set onCloseHandler(fn: ((code: number, reason: string) => void) | null) {
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
      // Fire-and-forget the async teardown — the AudioContext close is
      // awaited internally so the hardware is released, but we don't block
      // the timer callback. The transport's onCloseHandler records this
      // promise so a subsequent connect() can await it before restarting.
      // Idle timeout is a normal close (1000) — distinct from a server
      // restart (1011), so the client knows this wasn't a drop.
      void this.teardownAsync();
      this.onClose?.(1000, "idle timeout");
    }, RealtimeVoiceSession.IDLE_TIMEOUT_MS);
  }

  /**
   * Open a QAA Realtime session: connect the WebSocket, acquire the mic,
   * build the audio graph, and send the `connect` event to configure the
   * session. Resolves once the WebSocket is open and the connect event sent.
   *
   * @throws if the mic is denied or the WebSocket fails to open.
   */
  static async start(_options?: {
    turnDetection?: "server_vad" | "none";
    language?: string;
    provider?: string | null;
  }): Promise<RealtimeVoiceSession> {
    // 1. Create the AudioContext FIRST and kick off resume() within the
    //    user gesture (button click) — Chrome only honors resume() for a
    //    context created inside a gesture. We do NOT await it here because
    //    awaiting would consume the gesture before getUserMedia runs.
    const audioContext = new AudioContext();
    const resumePromise =
      audioContext.state !== "running" ? audioContext.resume() : Promise.resolve();
    console.log(`[realtime] AudioContext state: ${audioContext.state}, sampleRate: ${audioContext.sampleRate}`);

    // 2. Acquire the microphone. This await consumes the gesture stack, so
    //    any resume() we deferred must be awaited AFTER this to guarantee
    //    the context is running before the audio graph is built — otherwise
    //    onaudioprocess never fires (the restart bug: session "connects"
    //    but never listens, then auto-stops on idle timeout).
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    // Await the resume we started in the gesture so the context is truly
    // running before we wire up the ScriptProcessorNode. On a cold start
    // this is usually already resolved; on a restart (where the previous
    // context was just closed async) this is the critical fix — without it
    // the new context stays suspended and no audio flows.
    await resumePromise;
    if (audioContext.state !== "running") {
      // Last-resort resume after the await — still gesture-initiated, so
      // Chrome honors it. Awaiting ensures we don't build the graph on a
      // suspended context.
      await audioContext.resume();
    }
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
    // Connect through a zero-gain GainNode — this keeps the audio graph
    // pulling (so onaudioprocess fires reliably) without actually emitting
    // the mic signal to the speakers. Connecting directly to destination
    // created an audio feedback loop: TTS playback → speakers → mic → VAD
    // → infinite speculative-turn reopenings (36+ revisions in one turn).
    // Browser echoCancellation is NOT reliable enough to prevent this.
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    processorNode.connect(silentGain);
    silentGain.connect(audioContext.destination);
    console.log(`[realtime] Audio graph: source → processor → silent-gain → destination, tracks: ${mediaStream.getTracks().length}, track state: ${mediaStream.getTracks()[0]?.readyState}`);

    // 3. Open the WebSocket.
    const ws = new WebSocket(buildRealtimeUrl());
    console.log(`[realtime] WebSocket opening: ${buildRealtimeUrl()}`);

    const session = new RealtimeVoiceSession(ws, mediaStream, audioContext, sourceNode, processorNode);

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        console.log(`[realtime] WebSocket open, sending QAA connect event`);
        // 4. Send the QAA `connect` event to configure the session.
        //    This tells QAA we're a web client with input (mic) and output
        //    (speaker) enabled. QAA will wire us to the configured realtime
        //    provider (DashScope or local S2S) and respond with voice.ready.
        //    If a provider is specified, QAA switches to it for this session.
        const connectEvent: Record<string, unknown> = {
          type: "connect",
          clientType: "web",
          inputEnabled: true,
          outputEnabled: true,
          voiceEnabled: true,
        };
        if (_options?.provider) {
          connectEvent.provider = _options.provider;
          console.log(`[realtime] Requesting provider: ${_options.provider}`);
        }
        ws.send(JSON.stringify(connectEvent));
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
   * Graceful stop: send any remaining audio, then tear down the audio
   * graph and close the WebSocket. Resolves once the AudioContext has
   * closed so callers can await full resource release before starting a
   * new session (prevents the restart race).
   */
  async stop(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    // Send any partially-filled chunk before closing.
    if (this.filled > 0 && this.ws.readyState === WebSocket.OPEN) {
      const partial = this.pendingSamples.slice(0, this.filled);
      const audio = int16ToBase64(partial.buffer);
      this.ws.send(JSON.stringify({ type: "audio.append", audio }));
    }

    // Send mute to tell QAA we're done sending audio.
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "mute" }));
    }

    await this.teardownAsync();
  }

  /** Immediate teardown — no flush. Safe to call multiple times. */
  async cancel(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await this.teardownAsync();
  }

  /**
   * Async teardown — same as {@link teardown} but awaits the
   * AudioContext close so callers can be sure the browser has released
   * the audio hardware before starting a new session. This is the path
   * used by {@link stop} / {@link cancel} (intentional disconnect),
   * which the transport awaits via the teardown barrier before allowing
   * a reconnect.
   */
  private async teardownAsync(): Promise<void> {
    this.teardown();
    // audioContext.close() resolves once the context is fully closed and
    // the hardware is released. Awaiting it guarantees a fresh
    // AudioContext on restart won't race with this one's shutdown.
    try {
      await this.audioContext.close();
    } catch {
      // already closed
    }
    this.teardownPromiseResolve();
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
    // Backpressure cap: if the speaker falls behind (e.g. the AudioContext
    // was suspended, or the S2S server sent a burst faster than realtime),
    // drop the oldest queued chunks rather than grow the queue unbounded.
    // A long backlog also means stale audio the user no longer wants to
    // hear. Cap at ~2s of 16 kHz mono (~32 chunks of 100ms).
    const MAX_QUEUED_CHUNKS = 32;
    if (this.playbackQueue.length >= MAX_QUEUED_CHUNKS) {
      this.playbackQueue.splice(0, this.playbackQueue.length - MAX_QUEUED_CHUNKS + 1);
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
  private startOptions: { turnDetection?: "server_vad" | "none" } = {};
  // The most recent session's teardown promise — awaited in doConnect()
  // before starting a new session so a quick restart doesn't race with
  // the old AudioContext's async close. Every teardown path (intentional
  // stop, idle timeout, WS close) resolves the session's teardownPromise,
  // so we just keep a reference to the last one we saw.
  private lastTeardown: Promise<void> = Promise.resolve();
  // Reconnect backoff: prevents a tight loop hammering a down S2S server.
  // Tracks consecutive failed connect attempts; reset on a successful
  // connect. A user-initiated connect() (paw click) always proceeds — the
  // guard only throttles automatic/rapid retries.
  private consecutiveFailures = 0;
  private static readonly MAX_CONSECUTIVE_FAILURES = 5;
  // The last close code/reason received from the server, surfaced via
  // state so the hook can show "server restarted" vs "idle timeout".
  private lastCloseCode: number | null = null;
  private lastCloseReason = "";

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
    turnDetection?: "server_vad" | "none";
    provider?: string | null;
  }): Promise<void> {
    this.startOptions = options ?? {};
    await this.doConnect();
  }

  private async doConnect(): Promise<void> {
    // Guard against reconnecting while a previous session is still tearing
    // down. disconnect() nulls this.session synchronously but the old
    // AudioContext.close() / track.stop() are async; a restart that lands
    // in that window would race with the teardown and the new context
    // could start suspended. Await the previous teardown first.
    if (this.session !== null) return;
    await this.lastTeardown;
    if (this.session !== null) return; // re-check after await
    // Reconnect backoff guard: after a run of consecutive failures, refuse
    // further attempts until the user explicitly re-engages (a fresh
    // connect() call from a paw click resets the counter via disconnect()).
    // This prevents a tight client loop from hammering a down S2S server.
    if (this.consecutiveFailures >= RealtimeVoiceTransport.MAX_CONSECUTIVE_FAILURES) {
      console.log(
        `[realtime] Refusing connect — ${this.consecutiveFailures} consecutive failures (S2S server may be down)`,
      );
      this.setState("error");
      throw new Error(
        `S2S server unreachable after ${this.consecutiveFailures} attempts`,
      );
    }
    this.setState("connecting");
    try {
      const session = await RealtimeVoiceSession.start(this.startOptions);
      this.session = session;
      // Success: reset the backoff counter.
      this.consecutiveFailures = 0;
      this.setState("connected");
      console.log(`[realtime] Connected, state=connected`);
      // Wire server events to all listeners.
      session.subscribe((event) => {
        for (const listener of this.eventListeners) listener(event);
      });
      // When the server closes the connection unexpectedly, update state.
      // Do NOT auto-reconnect — reconnect calls getUserMedia which requires
      // a user gesture. The user must click the mic button to reconnect.
      // Track the session's teardown promise so a restart awaits full
      // resource release (AudioContext close) before reconnecting.
      // Record the close code/reason so the hook can surface "server
      // restarted" (1011) vs "idle timeout" (1000) to the user.
      this.lastTeardown = session.teardownPromise;
      session.onCloseHandler = (code: number, reason: string) => {
        if (this.session === session) {
          console.log(
            `[realtime] Session closed (code=${code}, reason="${reason}"), setting state=disconnected`,
          );
          this.session = null;
          this.lastCloseCode = code;
          this.lastCloseReason = reason;
          this.setState("disconnected");
        }
      };
    } catch (err) {
      console.log(`[realtime] Connect failed:`, err);
      this.session = null;
      this.consecutiveFailures += 1;
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
      // Record the async teardown so a subsequent connect() can await it
      // before starting a new session — prevents the restart race where
      // the new AudioContext is created while the old one is still closing.
      this.lastTeardown = session.stop();
    }
    // A user-initiated disconnect is a fresh start: reset the backoff
    // counter so the next paw click isn't blocked by prior failures.
    this.consecutiveFailures = 0;
    this.setState("disconnected");
  }

  /** Send a client event through the active session. No-op if not connected. */
  send(event: RealtimeClientEvent): void {
    this.session?.send(event);
  }

  /** The close code from the last session end, or null if none. */
  get lastCloseInfo(): { code: number | null; reason: string } {
    return { code: this.lastCloseCode, reason: this.lastCloseReason };
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
