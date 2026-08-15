// Hermes-direct voice transport — replaces QAA WebSocket realtime.
//
// Instead of a single WebSocket to QAA :3101, this transport uses HTTP
// calls to the Hermes gateway (:8642):
//   1. Mic audio → POST /v1/audio/transcriptions (STT) → transcript text
//   2. Transcript → POST /v1/chat/completions (LLM, stream:true) → SSE deltas
//   3. Deltas accumulated into sentences → POST /v1/audio/speech (TTS) → audio
//
// The LLM response is streamed via SSE and TTS is fired per-sentence, so
// audio starts playing after the first sentence (~5-10s) instead of waiting
// for the full response (~60s for a 35B model).

import { acquireMicStream } from "@/lib/micPermission";

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
  | { type: "voice.command"; content: string; turnId?: string }
  // playback.started on the server side signals "first audio chunk is now
  // playing locally" — emitted by the transport (via the local emit()) when
  // its playAudio() queue fires the first chunk. Subscribers (the
  // useRealtimeVoice hook) use it to flip from "Responding" to "Speaking".
  // The same event name on the client side (RealtimeClientEvent) means
  // "client told server it's starting playback" — different transport
  // semantics, different field set; both names coexist on purpose.
  | { type: "playback.started"; responseId?: string; turnId?: string }
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

// ── Audio constants ────────────────────────────────────────────────────────
// Hermes STT (faster-whisper) expects 16 kHz mono PCM16.
const TARGET_RATE = 16_000;

// Endpoint detection: same energy-based approach as the server-side
// HermesDictationEngine. When RMS drops below a fraction of the running
// peak for a sustained number of chunks, the accumulated audio is sent.
// Each onaudioprocess chunk is ~100ms at typical Web Audio buffer sizes;
// ENDPOINT_SILENCE_CHUNKS * 100ms ≈ 1.4s of silence. Long enough to ride
// out natural mid-sentence pauses without chopping utterances into
// fragments, short enough to stay responsive.
const ENDPOINT_SILENCE_CHUNKS = 14;
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
  // Running peak RMS with slow decay. A loud transient (cough, keyboard,
  // raised voice) would otherwise pin the peak forever and make normal
  // speech register as "silence" — chopping utterances into fragments.
  private peakRms = 200;
  private silenceCount = 0;
  private isProcessing = false;
  private stopped = false;

  // Interrupt support: abort in-flight SSE stream and TTS playback.
  private abortController: AbortController | null = null;
  private activeAudioSources: Set<AudioBufferSourceNode> = new Set();
  private turnCancelled = false;

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
      // 1. Create AudioContext within the user gesture and pre-warm the
      // decoder so the first decodeAudioData call isn't slow (~100-300ms).
      this.audioContext = new AudioContext();
      // Pre-warm: decode a tiny silent buffer to initialize the audio decoder.
      this.audioContext.decodeAudioData(new ArrayBuffer(44 + 2), () => {}, () => {});
      const resumePromise =
        this.audioContext.state !== "running"
          ? this.audioContext.resume()
          : Promise.resolve();

      // 2. Acquire the microphone.
      this.mediaStream = await acquireMicStream({
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

      // 5. Pre-flight STT warmup: send a tiny silent WAV to Hermes
      // /v1/audio/transcriptions to trigger the faster-whisper model
      // load (60-90s on CPU) NOW, while the user is still getting ready
      // to speak. The result is discarded — we only care about the side
      // effect of loading the model into the process-global singleton.
      void this.warmupStt();
    } catch (err) {
      this.setState("error");
      throw err;
    }
  }

  /**
   * Send a tiny silent WAV to Hermes STT to trigger model loading.
   * The first call to /v1/audio/transcriptions loads faster-whisper
   * weights into a module-global singleton (60-90s on CPU). By firing
   * this during connect() — before the user speaks — the model is
   * already warm when the first real audio arrives. The returned
   * transcript is discarded; only the side effect matters.
   *
   * This is fire-and-forget (void) so it never blocks connect().
   */
  private async warmupStt(): Promise<void> {
    try {
      const t0 = performance.now();
      // 100ms of silence at 16kHz mono PCM16 = 1600 samples * 2 bytes.
      const silence = new Int16Array(1600);
      const wavBlob = this.pcm16ToWav(silence);
      await this.transcribe(wavBlob);
      const t1 = performance.now();
      console.log(`[hermes-voice] STT warmup complete: ${(t1 - t0).toFixed(0)}ms`);
    } catch {
      // Warmup failure is non-fatal — the real transcription will
      // retry and pay the cold-start cost if the model wasn't loaded.
      console.warn("[hermes-voice] STT warmup failed (non-fatal)");
    }
  }

  /** Process one PCM chunk — buffer it and detect endpoints. */
  private processChunk(chunk: Int16Array): void {
    if (this.isProcessing) return;

    this.pcmBuffer.push(chunk);
    const chunkRms = rms(chunk);
    if (chunkRms > this.peakRms) this.peakRms = chunkRms;
    // Slowly decay the peak (~23s half-life at 100ms chunks) so a stale
    // loud peak stops misclassifying normal speech as silence.
    this.peakRms = Math.max(200, this.peakRms * 0.997);

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

    this.emit({ type: "turn.started", turnId: `turn-${Date.now()}` });

    try {
      // 1. STT: POST audio to Hermes /v1/audio/transcriptions.
      const t0 = performance.now();
      const wavBlob = this.pcm16ToWav(audio);
      const userText = await this.transcribe(wavBlob);
      const t1 = performance.now();
      console.log(`[hermes-voice] STT: ${(t1 - t0).toFixed(0)}ms (${userText.length} chars)`);
      if (!userText.trim()) {
        this.isProcessing = false;
        return;
      }

      this.emit({ type: "transcript.final", role: "user", content: userText });

      // 1b. Intent classification: is this a "task" (auto-submit session)
      // or "chat" (conversational TTS reply)?
      const { classifyIntent } = await import("./voiceIntent");
      const intent = await classifyIntent(userText, this.apiKey, this.model);
      console.log(`[hermes-voice] Intent: ${intent.intent} (${(intent.confidence * 100).toFixed(0)}%)`);

      if (intent.intent === "task" && intent.confidence >= 0.6) {
        // Task mode: emit voice.command for auto-submit, play short TTS confirmation.
        this.emit({ type: "voice.command", content: userText });
        const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
        const confirmText = cjkRegex.test(userText) ? "好的！" : "On it!";
        const voice = this.detectVoice("");
        try {
          const audioData = await this.synthesize(confirmText, voice);
          if (audioData.byteLength > 0) {
            this.emit({ type: "playback.started" });
            this.emit({ type: "audio.delta", audio: int16ToBase64(audioData) });
            this.playAudio(audioData, () => {
              this.emit({ type: "audio.done" });
            });
          }
        } catch (err) {
          console.error("[hermes-voice] TTS confirmation failed:", err);
          this.emit({ type: "audio.done" });
        }
        this.isProcessing = false;
        return;
      }

      this.emit({ type: "response.started" });

      // 2. LLM + TTS pipeline: stream LLM tokens, fire TTS per sentence.
      // This is the key latency optimization — audio starts playing after
      // the first sentence (~5-10s) instead of waiting for the full
      // response (~60s for qwen3.6:35b).
      const voice = this.detectVoice("");
      let fullText = "";
      let sentenceBuf = "";
      let sentenceIdx = 0;
      let firstAudioAt = 0;
      const ttsQueue: ArrayBuffer[] = [];
      let playing = false;
      let playbackStarted = false;
      this.turnCancelled = false;

      // Play queued audio chunks sequentially.
      const playQueue = () => {
        if (playing) return;
        const next = ttsQueue.shift();
        if (!next) return;
        playing = true;
        if (!playbackStarted) {
          playbackStarted = true;
          this.emit({ type: "playback.started" });
        }
        this.playAudio(next, () => {
          playing = false;
          playQueue();
        });
      };

      // Parallel TTS synthesis with ordered playback.
      // Each sentence's synthesize() fires immediately (not chained),
      // but results are enqueued in arrival order via an ordered drainer.
      const pendingTts: { promise: Promise<ArrayBuffer>; idx: number }[] = [];
      // sentenceIdx is 1-based (incremented before assignment in
      // flushSentence), so the drainer must start at 1 — starting at 0
      // means no idx ever matches and nothing is played.
      let drainIdx = 1;

      const drainPending = async () => {
        while (pendingTts.length > 0 && !this.turnCancelled) {
          // Find the next sequential promise (by idx).
          const next = pendingTts.find((p) => p.idx === drainIdx);
          if (!next) break; // Not yet arrived — will drain when it does.
          pendingTts.splice(pendingTts.indexOf(next), 1);
          drainIdx += 1;
          try {
            const audioData = await next.promise;
            if (audioData.byteLength > 0 && !this.turnCancelled) {
              this.emit({ type: "audio.delta", audio: int16ToBase64(audioData) });
              ttsQueue.push(audioData);
              playQueue();
            }
          } catch (err) {
            console.error(`[hermes-voice] TTS #${drainIdx} failed:`, err);
            // Continue to next sentence — one failure shouldn't kill the chain.
          }
        }
      };

      // Flush a sentence: fire TTS synthesis in parallel, drain in order.
      const flushSentence = (text: string): void => {
        const trimmed = text.trim();
        if (!trimmed) return;
        sentenceIdx += 1;
        const idx = sentenceIdx;
        const ttsStart = performance.now();
        const promise = this.synthesize(trimmed, voice).then((audioData) => {
          const ttsEnd = performance.now();
          if (idx === 1) firstAudioAt = ttsEnd;
          console.log(`[hermes-voice] TTS #${idx}: ${(ttsEnd - ttsStart).toFixed(0)}ms (${audioData.byteLength} bytes, ${trimmed.length} chars)`);
          return audioData;
        }).catch((err) => {
          console.error(`[hermes-voice] TTS #${idx} failed:`, err);
          return new ArrayBuffer(0); // Empty audio — drainer skips it.
        });
        pendingTts.push({ promise, idx });
        // Kick the drainer — it will await in order and enqueue.
        void drainPending();
      };

      // Stream LLM tokens via SSE and split into sentences.
      // AbortController allows interrupt to cancel the stream mid-flight.
      this.abortController = new AbortController();
      await this.chatStream(userText, (delta) => {
        if (this.turnCancelled) return;
        fullText += delta;
        this.emit({ type: "transcript.delta", role: "assistant", content: delta });
        // Accumulate into phrase-sized chunks for faster first audio.
        sentenceBuf += delta;
        // Split on sentence AND phrase boundaries: . ! ? 。 ！ ？ , ; ， ； and newlines.
        // Splitting on commas means TTS fires on shorter chunks (~2-3s of text
        // instead of ~5-10s), so the first audio arrives sooner.
        const sentenceEnd = /[,;.!?。！？，；\n]/;
        let match;
        while ((match = sentenceEnd.exec(sentenceBuf)) !== null) {
          const sentence = sentenceBuf.slice(0, match.index + 1);
          sentenceBuf = sentenceBuf.slice(match.index + 1);
          flushSentence(sentence);
        }
      }, this.abortController.signal);

      // Flush any remaining text after stream ends.
      if (sentenceBuf.trim() && !this.turnCancelled) {
        flushSentence(sentenceBuf);
      }
      // Wait for all pending TTS to drain.
      await drainPending();
      // Wait for playback to finish.
      while (playing && !this.turnCancelled) {
        await new Promise((r) => setTimeout(r, 50));
      }

      const t2 = performance.now();
      this.emit({ type: "transcript.final", role: "assistant", content: fullText });
      this.emit({ type: "audio.done" });
      console.log(`[hermes-voice] Total: ${(t2 - t0).toFixed(0)}ms (STT ${(t1-t0).toFixed(0)} + LLM+TTS stream ${(t2-t1).toFixed(0)}, ${sentenceIdx} sentences, first audio at ${(firstAudioAt - t0).toFixed(0)}ms)`);
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

  /** Stream LLM tokens via SSE from Hermes /v1/chat/completions.
   *  Calls onDelta for each content chunk as it arrives.
   *  Optional AbortSignal allows interrupting the stream mid-flight. */
  private async chatStream(text: string, onDelta: (delta: string) => void, signal?: AbortSignal): Promise<void> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const resp = await fetch(hermesChatUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: text }],
        stream: true,
      }),
      signal,
    });
    if (!resp.ok) throw new Error(`Chat stream failed: ${resp.status}`);
    if (!resp.body) throw new Error("No response body for stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let sseBuf = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      sseBuf += decoder.decode(value, { stream: true });
      // SSE events are separated by \n\n.
      const events = sseBuf.split("\n\n");
      sseBuf = events.pop() || "";
      for (const evt of events) {
        if (streamDone) break;
        const lines = evt.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { streamDone = true; break; }
          try {
            const chunk = JSON.parse(data);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) onDelta(delta);
          } catch {
            // Skip malformed chunks.
          }
        }
      }
    }
  }

  /** Detect if text is Chinese or English and return the appropriate edge-tts voice.
   *  NOTE: The Hermes /v1/audio/speech endpoint currently ignores the voice parameter
   *  and uses the config default (zh-CN-XiaoxiaoNeural). This voice can speak both
   *  Chinese and English text. Until the endpoint is fixed to pass voice through to
   *  text_to_speech_tool(), we always use the Chinese voice for reliability. */
  private detectVoice(_text: string): string {
    return "zh-CN-XiaoxiaoNeural";
  }

  /** Synthesize speech: try Edge TTS first (online, fast), fall back to
   *  Qwen3-TTS (offline, reliable for both zh and en).
   *
   *  Edge TTS is routed via /v1/audio/speech/edge → Hermes :8642 (built-in
   *  Edge TTS with zh-CN-XiaoxiaoNeural voice). If it fails (offline, network
   *  error, or Hermes Edge TTS thread bug), falls back to Qwen3-TTS via
   *  /v1/audio/speech → :8889/tts.
   *
   *  Qwen3-TTS uses Serena (zh female) and Vivian (en female) for
   *  language-matched output. */
  private async synthesize(text: string, _voice?: string): Promise<ArrayBuffer> {
    const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
    const isChinese = cjkRegex.test(text);

    // 1. Try Edge TTS first (online, fast, ~0.5s latency).
    try {
      const edgeHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (this.apiKey) edgeHeaders["Authorization"] = `Bearer ${this.apiKey}`;
      const edgeBody = JSON.stringify({ input: text, response_format: "mp3" });
      const edgeResp = await fetch("/v1/audio/speech/edge", {
        method: "POST",
        headers: edgeHeaders,
        body: edgeBody,
        signal: AbortSignal.timeout(10000), // 10s timeout — Edge should be fast
      });
      if (edgeResp.ok) {
        const contentType = edgeResp.headers.get("content-type") || "audio/mpeg";
        if (!contentType.includes("json")) {
          return edgeResp.arrayBuffer();
        }
      }
      // Edge TTS failed — fall through to Qwen3-TTS.
    } catch {
      // Network error or timeout — fall through to Qwen3-TTS.
    }

    // 2. Fall back to Qwen3-TTS (offline, reliable for both zh and en).
    const ttsHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const ttsBody: Record<string, unknown> = {
      text,
      language: isChinese ? "Chinese" : "English",
      speaker: isChinese ? "Serena" : "Vivian",
    };
    // 20s timeout: a wedged offline TTS must not hang the whole turn.
    const resp = await fetch(hermesTtsUrl(), {
      method: "POST",
      headers: ttsHeaders,
      body: JSON.stringify(ttsBody),
      signal: AbortSignal.timeout(20000),
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
        return bytes.buffer;
      }
      return new ArrayBuffer(0);
    }
    // Raw audio bytes — return as ArrayBuffer (not Int16Array, which corrupts MP3).
    return resp.arrayBuffer();
  }

  /** Play audio ArrayBuffer through the browser. Calls onEnded when done. */
  private playAudio(audioData: ArrayBuffer, onEnded?: () => void): void {
    if (!this.audioContext || audioData.byteLength === 0) {
      onEnded?.();
      return;
    }
    // Decode and play — decodeAudioData handles MP3/WAV/OGG containers.
    const arrayBuffer = audioData.slice(0);
    this.audioContext.decodeAudioData(
      arrayBuffer,
      (audioBuffer) => {
        if (this.turnCancelled) { onEnded?.(); return; }
        const source = this.audioContext!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext!.destination);
        source.onended = () => {
          this.activeAudioSources.delete(source);
          onEnded?.();
        };
        this.activeAudioSources.add(source);
        source.start();
      },
      (err) => {
        console.error("[hermes-voice] Audio decode failed:", err);
        onEnded?.();
      },
    );
  }

  /** Send a client event (no-op for Hermes transport — no WebSocket). */
  send(_event: RealtimeClientEvent): void {
    // The Hermes transport is HTTP-based; there's no bidirectional
    // WebSocket to send events on. The only meaningful client action
    // is interrupt, which we handle by aborting the SSE stream,
    // stopping all active audio sources, and clearing the TTS queue.
    if (_event.type === "interrupt") {
      this.turnCancelled = true;
      this.isProcessing = false;
      this.pcmBuffer = [];
      this.silenceCount = 0;
      // Abort the in-flight SSE stream.
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      // Stop all currently-playing audio sources.
      for (const source of this.activeAudioSources) {
        try { source.stop(); } catch { /* already stopped */ }
      }
      this.activeAudioSources.clear();
      this.emit({ type: "playback.clear" });
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