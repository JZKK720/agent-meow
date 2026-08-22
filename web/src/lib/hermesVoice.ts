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
export const TARGET_RATE = 16_000;

// Endpoint detection: same energy-based approach as the server-side
// HermesDictationEngine. When RMS drops below a fraction of the running
// peak for a sustained number of chunks, the accumulated audio is sent.
// Each onaudioprocess chunk is ~100ms at typical Web Audio buffer sizes;
// ENDPOINT_SILENCE_CHUNKS * 100ms ≈ 2s of silence. Long enough to ride
// out natural mid-sentence pauses without chopping one utterance into
// two turns (a split made the user repeat themselves and the transcript
// recorded the phrase twice), short enough to stay responsive.
export const ENDPOINT_SILENCE_CHUNKS = 20;
export const ENDPOINT_THRESHOLD_RATIO = 0.15;

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
export function int16ToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function rms(data: Int16Array): number {
  if (data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

// Sentence terminator regex — splits on . ! ? 。 ！ ？ and newlines only.
// Commas/semicolons are NOT split points: fragments are complete clauses,
// so a TTS failure never leaves a hole mid-sentence.
// Exported for unit testing the sentence splitter used in processTurn.
export const SENTENCE_END_REGEX = /[.!?。！？\n]/;

/**
 * Split text into sentence/phrase chunks at boundary characters.
 * Each chunk includes its trailing boundary character. Remaining text
 * after the last boundary is returned as the "remainder" (not a complete
 * sentence yet). The 60-char safety net forces a split for long CJK
 * text without punctuation to prevent Edge TTS timeouts.
 *
 * @param text - Accumulated text to split.
 * @param maxLen - Safety net: force a split if a chunk exceeds this length.
 * @returns Object with `sentences` (complete chunks) and `remainder` (leftover).
 */
export function splitSentences(
  text: string,
  maxLen = 60,
): { sentences: string[]; remainder: string } {
  const sentences: string[] = [];
  let buf = text;
  let match;
  while ((match = SENTENCE_END_REGEX.exec(buf)) !== null) {
    sentences.push(buf.slice(0, match.index + 1));
    buf = buf.slice(match.index + 1);
  }
  // Safety net: force-split an over-long buffer without punctuation into
  // maxLen-sized chunks so Edge TTS doesn't time out on long CJK text.
  while (buf.length > maxLen) {
    sentences.push(buf.slice(0, maxLen));
    buf = buf.slice(maxLen);
  }
  return { sentences, remainder: buf };
}

/**
 * Strip text down to what a TTS engine can speak cleanly.
 *
 * LLM replies carry emoji, markdown, and decorative symbols. Qwen3-TTS
 * vocalizes them as paralinguistic noise — laughs, breaths, gibberish
 * syllables — which the listener hears as extra voices/giggles mid-reply
 * (measured: the same sentence with emoji synthesized 40% longer audio
 * than without). Remove everything that isn't speakable prose:
 * - emoji / pictographs / symbols (kept: CJK, letters, digits, basic
 *   punctuation, currency, and the tilde/ellipsis/dash pairs people write)
 * - markdown emphasis, code spans, links, headings markers
 * - zero-width and control characters
 */
export function sanitizeForTts(text: string): string {
  return (
    text
      // Markdown: links [label](url) → label; images ![alt](url) → alt.
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Markdown: bold/italic/strip markers around words.
      .replace(/(\*\*|__|\*|~~|`+)/g, "")
      // Markdown: heading hashes and list bullets at line starts.
      .replace(/^\s*(#{1,6}\s+|[-*+]\s+|\d+\.\s+)/gm, "")
      // URLs bare (after link unwrap above).
      .replace(/https?:\/\/\S+/g, "")
      // Zero-width / control chars.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000b-\u001f\u007f\u200b-\u200f\u2028\u2029\ufeff]/g, "")
      // Emoji, pictographs, symbols, and flags — everything outside
      // letters, marks, numbers, punctuation, CJK, and a small allowlist
      // of prosody marks (～ … — ― ♪ kept out deliberately: ♪ vocalizes).
      .replace(
        /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu,
        "",
      )
      // Collapse the whitespace left behind by removals.
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{2,}/g, "\n")
  );
}

/**
 * Normalize a transcript for duplicate-turn comparison.
 *
 * Strips punctuation/whitespace and lowercases so "早呀, 早呀!" and
 * "早呀早呀" compare equal — the recorded duplicates showed whisper
 * joining a repeated phrase with a comma, so exact-match alone would
 * miss the common case.
 */
function normalizeTranscriptForCompare(text: string): string {
  return text
    .toLowerCase()
    // eslint-disable-next-line no-irregular-whitespace
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

/**
 * Detect a consecutive duplicate STT turn.
 *
 * When the endpoint detector splits one utterance into two turns (or the
 * user repeats themselves because the first turn was still processing),
 * the second transcript is often the same phrase again — recorded as
 * "phrase,phrase" in the session. A turn whose normalized text equals the
 * previous turn's (or is a substring of it, covering the split-then-repeat
 * case where the second fragment is the tail of the first) is a duplicate.
 *
 * @param current - This turn's transcript.
 * @param previous - The immediately preceding turn's transcript ("" when
 *   none).
 * @returns True when `current` should be dropped as a repeat.
 */
export function isDuplicateSttTurn(current: string, previous: string): boolean {
  const cur = normalizeTranscriptForCompare(current);
  if (!cur) return false;
  const prev = normalizeTranscriptForCompare(previous);
  if (!prev) return false;
  // Exact repeat of the whole previous turn.
  if (cur === prev) return true;
  // Short-phrase guard: only apply substring matching for brief turns —
  // a long second utterance legitimately containing the first phrase is
  // conversation, not a repeat.
  if (cur.length <= 12 && prev.includes(cur)) return true;
  return false;
}

/**
 * Build a short 440Hz beep as a WAV ArrayBuffer (~150ms). Used as an
 * audible placeholder when both TTS engines fail, so the user hears a
 * marker instead of a silent hole in the reply.
 */
export function makeBeepPlaceholder(sampleRate = 24000): ArrayBuffer {
  const durationSec = 0.15;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i += 1) {
    const fade = Math.min(1, i / (numSamples * 0.1), (numSamples - i) / (numSamples * 0.1));
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.25 * fade;
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, Math.round(sample * 32767))), true);
  }
  return buffer;
}

/**
 * Simple counting semaphore limiting concurrent TTS requests. Edge TTS
 * throttles beyond ~3 parallel requests (measured 3.6–11.9s for 11
 * parallel), so cap in-flight synthesis at 3 to keep the pipe full
 * without triggering throttling.
 */
export class Semaphore {
  private active = 0;
  private readonly waiters: (() => void)[] = [];
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  async acquire(): Promise<void> {
    if (this.active < this.limit) {
      this.active += 1;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
    this.active += 1;
  }

  release(): void {
    this.active -= 1;
    const next = this.waiters.shift();
    if (next) next();
  }
}

/**
 * Detect whether text contains CJK characters.
 * Used by synthesize() to pick the TTS language and speaker.
 */
export function isCJK(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text);
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
  /** Speaker pinned for the current turn — set once from the user's
   *  utterance language so every sentence of the reply uses ONE voice.
   *  Mixed zh/en replies must not flip speakers mid-sentence. */
  private turnSpeaker: string | null = null;
  /** Transcript of the previous accepted turn — used to drop consecutive
   *  duplicate STT results (endpoint splits / user self-repetition that
   *  recorded "phrase,phrase" in voice sessions). */
  private lastAcceptedTranscript = "";

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

  // agent-meow session id for persona-aware voice replies. When set,
  // chatStream routes the LLM call through agent-meow's session runner
  // (persona, memory, tools, session history) instead of Hermes directly.
  private agentMeowSessionId: string | null = null;

  /** Set the agent-meow session used for voice LLM turns (persona-aware). */
  setAgentMeowSession(sessionId: string | null): void {
    this.agentMeowSessionId = sessionId;
  }

  /** Return the current model used for chat completions. */
  getModel(): string {
    return this.model;
  }

  /** Set the model used for chat completions (e.g. "auto", "qwen-max"). */
  setModel(model: string): void {
    this.model = model;
  }

  /** Return the Hermes API key for use by external callers (e.g. Read aloud). */
  getApiKey(): string | null {
    return this.apiKey;
  }

  // STT language hint — helps faster-whisper avoid misdetecting Chinese
  // speech as English (which produces garbage transliteration like "nee
  // how" instead of "你好"). Default is "zh" (the primary user language);
  // the auto-adjust below pins "en" after 2 consecutive English transcripts
  // and back to "zh" the moment a transcript contains CJK.
  private sttLanguage: string =
    (typeof window !== "undefined" && (window as any).__HERMES_STT_LANGUAGE__) ||
    import.meta.env.VITE_HERMES_STT_LANGUAGE ||
    "zh";

  // Consecutive non-CJK transcript counter for STT language auto-adjustment.
  // Only pins "en" after 2 consecutive non-CJK results, so a single
  // misdetection (Chinese → English garbage) doesn't lock the wrong language.
  private _nonCjkStreak = 0;

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

      // Drop a consecutive duplicate turn: the endpoint detector can split
      // one utterance into two turns (or the user repeats themselves while
      // the first turn is still processing), and the repeat was recorded as
      // "phrase,phrase" in the session transcript.
      if (isDuplicateSttTurn(userText, this.lastAcceptedTranscript)) {
        console.warn(`[hermes-voice] Dropping duplicate STT turn: "${userText.slice(0, 40)}"`);
        this.isProcessing = false;
        return;
      }
      this.lastAcceptedTranscript = userText;

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
      // Serena/Auto for every turn — user-confirmed pick. Serena handles
      // both zh and en natively; Auto lets the model code-switch inside
      // mixed-language sentences without prosody breaks. (Previously the
      // speaker flipped per sentence on mixed zh/en replies, heard as
      // multiple characters / tune changes.)
      this.turnSpeaker = "Serena";

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

      // Parallel TTS synthesis with ordered playback, capped at 3
      // concurrent requests (Edge TTS throttles beyond that).
      const pendingTts: { promise: Promise<ArrayBuffer>; idx: number }[] = [];
      const ttsSemaphore = new Semaphore(3);
      // sentenceIdx is 1-based (incremented before assignment in
      // flushSentence), so the drainer must start at 1 — starting at 0
      // means no idx ever matches and nothing is played.
      let drainIdx = 1;
      let skippedCount = 0;

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
            skippedCount += 1;
            // Continue to next sentence — one failure shouldn't kill the chain.
          }
        }
      };

      // Flush a sentence: fire TTS synthesis (concurrency-limited), drain in order.
      const flushSentence = (text: string): void => {
        const trimmed = sanitizeForTts(text).trim();
        if (!trimmed) return;
        sentenceIdx += 1;
        const idx = sentenceIdx;
        const ttsStart = performance.now();
        const promise = ttsSemaphore.acquire().then(() => {
          if (this.turnCancelled) return new ArrayBuffer(0);
          return this.synthesize(trimmed, voice);
        }).then((audioData) => {
          ttsSemaphore.release();
          const ttsEnd = performance.now();
          if (idx === 1) firstAudioAt = ttsEnd;
          console.log(`[hermes-voice] TTS #${idx}: ${(ttsEnd - ttsStart).toFixed(0)}ms (${audioData.byteLength} bytes, ${trimmed.length} chars)`);
          return audioData;
        }).catch((err) => {
          ttsSemaphore.release();
          console.error(`[hermes-voice] TTS #${idx} failed:`, err);
          skippedCount += 1;
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
        // Accumulate into full sentences — split on terminators only
        // (. ! ? 。 ！ ？ \n) so each TTS fragment is a complete clause.
        sentenceBuf += delta;
        let match;
        while ((match = SENTENCE_END_REGEX.exec(sentenceBuf)) !== null) {
          const sentence = sentenceBuf.slice(0, match.index + 1);
          sentenceBuf = sentenceBuf.slice(match.index + 1);
          flushSentence(sentence);
        }
        // Safety net: if the buffer grows too long without hitting a boundary
        // (common for long Chinese sentences without punctuation), force a
        // split to prevent Edge TTS timeouts on oversized text.
        if (sentenceBuf.length > 60) {
          flushSentence(sentenceBuf);
          sentenceBuf = "";
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
      console.log(`[hermes-voice] Total: ${(t2 - t0).toFixed(0)}ms (STT ${(t1-t0).toFixed(0)} + LLM+TTS stream ${(t2-t1).toFixed(0)}, ${sentenceIdx} sentences, ${skippedCount} skipped, first audio at ${(firstAudioAt - t0).toFixed(0)}ms)`);
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

  /** POST audio to Hermes /v1/audio/transcriptions.
   *  Sends a language hint so faster-whisper doesn't misdetect Chinese
   *  speech as English (producing garbage transliteration). */
  private async transcribe(wavBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", wavBlob, "dictation.wav");
    // Send the language hint — "auto" lets whisper detect, "zh" forces
    // Chinese, "en" forces English. The backend passes this through to
    // faster-whisper's model.transcribe(language=...) parameter.
    if (this.sttLanguage && this.sttLanguage !== "auto") {
      formData.append("language", this.sttLanguage);
    }
    const headers: Record<string, string> = {};
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    // eslint-disable-next-line no-restricted-globals -- Hermes STT is a separate service, not agent-meow.
    const resp = await fetch(hermesSttUrl(), { method: "POST", headers, body: formData });
    if (!resp.ok) throw new Error(`STT failed: ${resp.status}`);
    const result = await resp.json();
    const text = result.text || "";
    // Auto-adjust the language hint for the next utterance based on what
    // was actually spoken. If the transcript contains CJK characters, the
    // user is speaking Chinese — pin "zh" so the next utterance doesn't get
    // misdetected. If it's purely ASCII, increment a counter and only pin
    // "en" after TWO consecutive non-CJK transcripts, so a single misdetection
    // (e.g. Chinese speech garbled into English ASCII by whisper) doesn't
    // lock the user into the wrong language.
    //
    // Empty or very short transcripts (<3 chars) are likely misdetections
    // from a wrong language hint — reset to "auto" so whisper can detect
    // freely on the next utterance instead of being locked into the wrong
    // language. This unblocks mid-session zh→en or en→zh switches: the
    // first utterance in the new language may produce garbage, but the
    // reset lets the next one auto-detect correctly.
    if (text && text.trim().length >= 3) {
      if (isCJK(text)) {
        this.sttLanguage = "zh";
        this._nonCjkStreak = 0;
      } else {
        this._nonCjkStreak += 1;
        if (this._nonCjkStreak >= 2) {
          this.sttLanguage = "en";
        }
      }
    } else if (!text || text.trim().length === 0) {
      // Empty transcript — likely a wrong language hint caused whisper to
      // produce nothing. Reset to the default "zh" (not "auto" — whisper's
      // auto-detect frequently misdetects Chinese as English) for the next
      // utterance.
      this.sttLanguage = "zh";
      this._nonCjkStreak = 0;
    }
    return text;
  }

  /** Stream LLM tokens for one voice turn.
   *  When an agent-meow session is bound (setAgentMeowSession), the turn is
   *  routed through agent-meow's session runner — the agent's persona,
   *  memory, tools, and session history all apply, and the transcript is
   *  persisted. Otherwise falls back to Hermes /v1/chat/completions.
   *  Calls onDelta for each content chunk as it arrives. */
  private async chatStream(text: string, onDelta: (delta: string) => void, signal?: AbortSignal): Promise<void> {
    if (this.agentMeowSessionId) {
      await this.chatStreamViaAgentMeow(text, onDelta, signal);
      return;
    }
    await this.chatStreamViaHermes(text, onDelta, signal);
  }

  /** Stream a turn through agent-meow's session runner (persona-aware).
   *  POSTs a message event, then tails the session SSE stream for
   *  text_delta events until the response completes. */
  private async chatStreamViaAgentMeow(text: string, onDelta: (delta: string) => void, signal?: AbortSignal): Promise<void> {
    const { postEvent, openSessionStream } = await import("./sessionsApi");
    const { parseSseStream } = await import("./sse");
    const sessionId = this.agentMeowSessionId!;

    // Open the SSE stream BEFORE posting so no early deltas are missed.
    const streamController = new AbortController();
    const onAbort = () => streamController.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    const streamResp = await openSessionStream(sessionId, streamController.signal);
    if (!streamResp.ok) {
      signal?.removeEventListener("abort", onAbort);
      throw new Error(`Agent-meow stream open failed: ${streamResp.status}`);
    }

    try {
      // Post the user message — the runner picks it up and streams the reply.
      await postEvent(sessionId, {
        type: "message",
        data: { role: "user", content: [{ type: "input_text", text }] },
      });

      // Tail the stream for text deltas until the response completes.
      for await (const event of parseSseStream(streamResp.body!)) {
        if (event.type === "text_delta" && event.delta) {
          onDelta(event.delta);
        } else if (
          event.type === "response_completed" ||
          event.type === "response_failed" ||
          event.type === "response_cancelled" ||
          event.type === "response_incomplete"
        ) {
          break;
        }
      }
    } finally {
      signal?.removeEventListener("abort", onAbort);
      streamController.abort();
    }
  }

  /** Stream LLM tokens via SSE from Hermes /v1/chat/completions (fallback). */
  private async chatStreamViaHermes(text: string, onDelta: (delta: string) => void, signal?: AbortSignal): Promise<void> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    // eslint-disable-next-line no-restricted-globals -- Hermes LLM is a separate service, not agent-meow.
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

  /** Synthesize speech via Qwen3-TTS (local GPU, Serena/Auto).
   *
   *  Single engine, single voice: no Edge-TTS fallback — Edge speaks in a
   *  different voice (Xiaoxiao), so a mid-reply switch sounded like a second
   *  TTS replaying over the first. When Qwen fails, the sentence is skipped
   *  (empty audio) and the drainer moves on. */
  private async synthesize(text: string, _voice?: string): Promise<ArrayBuffer> {
    // Speaker is pinned per TURN (see processTurn), not per sentence:
    // flipping Serena↔Vivian mid-reply on mixed zh/en text sounds like
    // multiple characters and breaks prosody continuity. Serena handles
    // both languages natively, so she is the single voice for a turn.
    const ttsHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const ttsBody: Record<string, unknown> = {
      text,
      language: "Auto",
      speaker: this.turnSpeaker ?? "Serena",
    };
    try {
      // eslint-disable-next-line no-restricted-globals -- Qwen3-TTS is a separate service.
      const resp = await fetch(hermesTtsUrl(), {
        method: "POST",
        headers: ttsHeaders,
        body: JSON.stringify(ttsBody),
        signal: AbortSignal.timeout(90000),
      });
      if (resp.ok) {
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
        } else {
          // Raw audio bytes — return as ArrayBuffer (not Int16Array, which corrupts MP3).
          return resp.arrayBuffer();
        }
      } else {
        console.warn(`[hermes-voice] Qwen3-TTS failed: ${resp.status}`);
      }
    } catch (err) {
      console.warn(`[hermes-voice] Qwen3-TTS unavailable: ${err}`);
    }

    // 2. No Edge-TTS fallback: Edge speaks in a different voice (Xiaoxiao),
    //    so a mid-reply Qwen failure switching to Edge sounded like a second
    //    TTS replaying over the first. When Qwen fails, skip the sentence —
    //    one engine, one voice, always.
    console.warn(`[hermes-voice] TTS SKIPPED (Qwen3-TTS failed): "${text.slice(0, 40)}"`);
    return new ArrayBuffer(0);
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
      this.turnSpeaker = null;
      this.lastAcceptedTranscript = "";
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
    // Fresh comparison base for the next voice session.
    this.lastAcceptedTranscript = "";
    this.setState("disconnected");
  }
}

/** Singleton transport instance — one voice session per tab. */
export const hermesVoice = new HermesVoiceTransport();