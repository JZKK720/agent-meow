// Hermes-direct voice transport — replaces QAA WebSocket realtime.
//
// Instead of a single WebSocket to QAA :3101, this transport uses HTTP
// calls to the Hermes gateway (:8642):
//   1. Mic audio → POST /v1/audio/transcriptions (STT) → transcript text
//   2. Transcript → POST /v1/chat/completions (LLM) → response text
//   3. Response → POST /v1/audio/speech (TTS) → audio bytes → play
//
// This is a batch (request/response) pipeline, not streaming. The tradeoff
// is higher latency vs the old WebSocket realtime, but it eliminates the
// QAA middleman entirely and works with any Hermes gateway instance.

// ── Event types (formerly in realtimeVoice.ts, now inlined here) ──────────
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
  | { type: "error"; message: string };

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

export type RealtimeEventListener = (event: RealtimeServerEvent) => void;
export type RealtimeStatusListener = () => void;

export type RealtimeConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

import type {
  RealtimeServerEvent,
  RealtimeConnectionState,
  RealtimeEventListener,
  RealtimeStatusListener,
  RealtimeClientEvent,
} from "./hermesVoice";

// ── Audio constants ────────────────────────────────────────────────────────
// Hermes STT (faster-whisper) expects 16 kHz mono PCM16.
const TARGET_RATE = 16_000;
const CHUNK_MS = 100;
const CHUNK_SAMPLES = (TARGET_RATE * CHUNK_MS) / 1000;

// Endpoint detection: same energy-based approach as the server-side
// HermesDictationEngine. When RMS drops below a fraction of the running
// peak for a sustained number of chunks, the accumulated audio is sent.
const ENDPOINT_SILENCE_CHUNKS = 32; // ~3.2s of silence at 100ms chunks
const ENDPOINT_THRESHOLD_RATIO = 0.15;

// ── Hermes API URL helpers ────────────────────────────────────────────────
// Use relative URLs so the Vite dev proxy (or production reverse proxy)
// handles the cross-origin request to Hermes :8642 — avoids CORS issues.
function hermesSttUrl(): string {
  return "/v1/audio/transcriptions";
}

function hermesTtsUrl(): string {
  return "/v1/audio/speech";
}

function hermesChatUrl(): string {
  return "/v1/chat/completions";
}

// ── Base64 / PCM helpers ──────────────────────────────────────────────────
function int16ToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function rms(data: Int16Array): number {
  if (data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

// ── Hermes voice transport ────────────────────────────────────────────────
class HermesVoiceTransport {
  private state: RealtimeConnectionState = "disconnected";
  private readonly stateListeners = new Set<RealtimeStatusListener>();
  private readonly eventListeners = new Set<RealtimeEventListener>();

  // Audio capture state.
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // PCM buffer + endpoint detection.
  private pcmBuffer: Int16Array[] = [];
  private peakRms = 1;
  private silenceCount = 0;
  private isProcessing = false;
  private stopped = false;

  // Hermes API key (bearer token) — from Vite env var or window.__HERMES_API_KEY__.
  private apiKey: string | null =
    (typeof window !== "undefined" && (window as any).__HERMES_API_KEY__) ||
    import.meta.env.VITE_HERMES_API_KEY ||
    null;

  // Hermes model for chat completions.
  private model =
    (typeof window !== "undefined" && (window as any).__HERMES_MODEL__) ||
    import.meta.env.VITE_HERMES_MODEL ||
    "auto";

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

  private emit(event: RealtimeServerEvent): void {
    for (const listener of this.eventListeners) listener(event);
  }

  /**
   * Open a Hermes voice session: acquire the mic, build the audio graph,
   * and start listening for speech. Resolves once the mic is active.
   */
  async connect(_options?: {
    turnDetection?: "server_vad" | "none";
    provider?: string | null;
  }): Promise<void> {
    if (this.state === "connected" || this.state === "connecting") return;
    this.setState("connecting");
    this.stopped = false;

    try {
      // 1. Create AudioContext within the user gesture.
      this.audioContext = new AudioContext();
      const resumePromise =
        this.audioContext.state !== "running"
          ? this.audioContext.resume()
          : Promise.resolve();

      // 2. Acquire the microphone.
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      await resumePromise;
      if (this.audioContext.state !== "running") {
        await this.audioContext.resume();
      }

      // 3. Build the audio graph.
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.sourceNode.connect(this.processorNode);
      const silentGain = this.audioContext.createGain();
      silentGain.gain.value = 0;
      this.processorNode.connect(silentGain);
      silentGain.connect(this.audioContext.destination);

      // 4. Start processing audio chunks.
      this.pcmBuffer = [];
      this.peakRms = 1;
      this.silenceCount = 0;
      this.processorNode.onaudioprocess = (e) => {
        if (this.stopped) return;
        const input = e.inputBuffer.getChannelData(0);
        // Downsample to 16kHz if needed.
        const ratio = this.audioContext!.sampleRate / TARGET_RATE;
        const targetLength = Math.floor(input.length / ratio);
        const pcm16 = new Int16Array(targetLength);
        for (let i = 0; i < targetLength; i += 1) {
          const srcIdx = Math.floor(i * ratio);
          const sample = Math.max(-1, Math.min(1, input[srcIdx]));
          pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        this.processChunk(pcm16);
      };

      this.setState("connected");
      this.emit({ type: "gateway.connected" });
      console.log("[hermes-voice] Connected, listening for speech");
    } catch (err) {
      this.setState("error");
      throw err;
    }
  }

  /** Process one PCM chunk — buffer it and detect endpoints. */
  private processChunk(chunk: Int16Array): void {
    if (this.isProcessing) return;

    this.pcmBuffer.push(chunk);
    const chunkRms = rms(chunk);
    if (chunkRms > this.peakRms) this.peakRms = chunkRms;

    if (chunkRms < this.peakRms * ENDPOINT_THRESHOLD_RATIO) {
      this.silenceCount += 1;
    } else {
      this.silenceCount = 0;
    }

    // Endpoint detected — send accumulated audio to Hermes STT.
    if (this.silenceCount >= ENDPOINT_SILENCE_CHUNKS && this.pcmBuffer.length > 0) {
      void this.processTurn();
    }
  }

  /** Process one voice turn: STT → LLM → TTS. */
  private async processTurn(): Promise<void> {
    if (this.isProcessing || this.pcmBuffer.length === 0) return;
    this.isProcessing = true;

    // Concatenate buffered PCM.
    const totalLength = this.pcmBuffer.reduce((sum, c) => sum + c.length, 0);
    const audio = new Int16Array(totalLength);
    let offset = 0;
    for (const chunk of this.pcmBuffer) {
      audio.set(chunk, offset);
      offset += chunk.length;
    }
    this.pcmBuffer = [];
    this.silenceCount = 0;

    // Skip very short audio (noise).
    if (audio.length < TARGET_RATE * 0.3) {
      this.isProcessing = false;
      return;
    }

    this.emit({ type: "turn.started" });

    try {
      // 1. STT: POST audio to Hermes /v1/audio/transcriptions.
      const wavBlob = this.pcm16ToWav(audio);
      const userText = await this.transcribe(wavBlob);
      if (!userText.trim()) {
        this.isProcessing = false;
        return;
      }

      this.emit({ type: "transcript.final", role: "user", text: userText });
      this.emit({ type: "response.started" });

      // 2. LLM: POST transcript to Hermes /v1/chat/completions.
      const assistantText = await this.chat(userText);
      if (!assistantText.trim()) {
        this.isProcessing = false;
        return;
      }

      this.emit({ type: "transcript.delta", role: "assistant", text: assistantText });
      this.emit({ type: "transcript.final", role: "assistant", text: assistantText });

      // 3. TTS: POST assistant text to Hermes /v1/audio/speech.
      const audioBytes = await this.synthesize(assistantText);
      if (audioBytes.byteLength > 0) {
        this.emit({ type: "audio.delta", audio: int16ToBase64(audioBytes.buffer) });
        this.emit({ type: "audio.done" });
        // Play the audio.
        this.playAudio(audioBytes);
      }
    } catch (err) {
      console.error("[hermes-voice] Turn failed:", err);
      this.emit({ type: "error", message: String(err) });
    } finally {
      this.isProcessing = false;
    }
  }

  /** Convert Int16Array PCM to a WAV Blob for multipart upload. */
  private pcm16ToWav(pcm: Int16Array): Blob {
    const buffer = new ArrayBuffer(44 + pcm.byteLength);
    const view = new DataView(buffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcm.byteLength, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, TARGET_RATE, true);
    view.setUint32(28, TARGET_RATE * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, "data");
    view.setUint32(40, pcm.byteLength, true);
    new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer));
    return new Blob([buffer], { type: "audio/wav" });
  }

  /** POST audio to Hermes /v1/audio/transcriptions. */
  private async transcribe(wavBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", wavBlob, "dictation.wav");
    const headers: Record<string, string> = {};
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const resp = await fetch(hermesSttUrl(), { method: "POST", headers, body: formData });
    if (!resp.ok) throw new Error(`STT failed: ${resp.status}`);
    const result = await resp.json();
    return result.text || "";
  }

  /** POST text to Hermes /v1/chat/completions. */
  private async chat(text: string): Promise<string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const resp = await fetch(hermesChatUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: text }],
        stream: false,
      }),
    });
    if (!resp.ok) throw new Error(`Chat failed: ${resp.status}`);
    const result = await resp.json();
    return result.choices?.[0]?.message?.content || "";
  }

  /** POST text to Hermes /v1/audio/speech. */
  private async synthesize(text: string): Promise<Int16Array> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const resp = await fetch(hermesTtsUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ input: text, response_format: "mp3" }),
    });
    if (!resp.ok) throw new Error(`TTS failed: ${resp.status}`);
    const contentType = resp.headers.get("content-type") || "audio/mpeg";
    if (contentType.includes("json")) {
      // JSON envelope with base64 data URL.
      const result = await resp.json();
      const dataUrl = result.audio || "";
      if (dataUrl.startsWith("data:")) {
        const b64 = dataUrl.split(",")[1] || "";
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        return new Int16Array(bytes.buffer);
      }
      return new Int16Array(0);
    }
    // Raw audio bytes.
    const arrayBuffer = await resp.arrayBuffer();
    return new Int16Array(arrayBuffer);
  }

  /** Play audio bytes through the browser. */
  private playAudio(pcm: Int16Array): void {
    if (!this.audioContext || pcm.length === 0) return;
    // Decode and play — for MP3/OGG, use decodeAudioData.
    const arrayBuffer = pcm.buffer.slice(0);
    this.audioContext.decodeAudioData(
      arrayBuffer,
      (audioBuffer) => {
        const source = this.audioContext!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext!.destination);
        source.start();
      },
      (err) => console.error("[hermes-voice] Audio decode failed:", err),
    );
  }

  /** Send a client event (no-op for Hermes transport — no WebSocket). */
  send(_event: RealtimeClientEvent): void {
    // The Hermes transport is HTTP-based; there's no bidirectional
    // WebSocket to send events on. The only meaningful client action
    // is interrupt, which we handle by stopping the current turn.
    if (_event.type === "interrupt") {
      this.isProcessing = false;
      this.pcmBuffer = [];
      this.silenceCount = 0;
    }
  }

  /** Disconnect: stop the mic and tear down the audio graph. */
  disconnect(): void {
    this.stopped = true;
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.pcmBuffer = [];
    this.silenceCount = 0;
    this.isProcessing = false;
    this.setState("disconnected");
  }
}

/** Singleton transport instance — one voice session per tab. */
export const hermesVoice = new HermesVoiceTransport();