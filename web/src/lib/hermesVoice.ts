// Hermes-direct voice transport — replaces QAA WebSocket realtime.
//
// Instead of a single WebSocket to QAA :3101, this transport uses HTTP
// calls to the Hermes gateway (:8642):
//   1. Mic audio → Silero VAD (onnxruntime-web) segments speech
//   2. Speech segment → POST /v1/audio/transcriptions (STT) → transcript
//   3. Transcript → POST /v1/chat/completions (LLM, stream:true) → SSE deltas
//   4. Deltas accumulated into sentences → POST /v1/audio/speech (TTS) → audio
//
// The LLM response is streamed via SSE and TTS is fired per-sentence, so
// audio starts playing after the first sentence (~5-10s) instead of waiting
// for the full response (~60s for a 35B model).
//
// VAD: Silero ONNX model via @ricky0123/vad-web replaces the old RMS-based
// endpoint detection. Silero runs in an AudioWorklet — accurate speech
// segmentation without the false triggers (keyboard, breathing, fan noise)
// that plagued the RMS threshold approach. The worklet, ONNX model, and
// onnxruntime WASM files are served from /public (see public/vad.worklet*,
// public/silero_vad_*, public/ort-wasm-*).
// MicVAD is dynamically imported in connect() to avoid pulling
// @ricky0123/vad-web + onnxruntime-web into the initial bundle,
// which breaks React context initialization (useContext null crash).

// ── Wake words ────────────────────────────────────────────────────────────
// Re-exported from wakeWords.ts so hooks can import containsWakeWord
// without pulling in @ricky0123/vad-web and onnxruntime-web.
export { WAKE_WORDS, containsWakeWord } from "@/lib/wakeWords";
// Local import for use within this module (re-export alone doesn't bind
// the name in the current scope).
import { containsWakeWord } from "@/lib/wakeWords";

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
  // Wake word detected in VAD wake-word mode. Emitted when the VAD
  // captures a speech segment, STT transcribes it, and the transcript
  // contains a wake word (橘宝/jubao/homophones). The subscriber
  // (useWakeWordDetector) plays the auto-reply and activates the voice
  // session. This replaces the old separate SpeechRecognition-based
  // wake word detector — one mic consumer (the VAD), zero conflicts.
  | { type: "wake.word"; transcript: string }
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
  | { type: "tts.skipped"; sentence: string; reason: string }
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
// Hermes STT (faster-whisper) expects 16 kHz mono PCM16. The Silero VAD
// worklet also operates at 16 kHz internally, so no resampling is needed
// between VAD output and the STT upload.
export const TARGET_RATE = 16_000;

// ── Hermes API URL helpers ────────────────────────────────────────────────
// Use relative URLs so the Vite dev proxy (or production reverse proxy)
// handles the cross-origin request to Hermes :8642 — avoids CORS issues.
function hermesSttUrl(): string {
  return "/v1/audio/transcriptions";
}

function hermesTtsUrl(): string {
  // /v1/audio/speech → backend proxy → Qwen3-TTS :8890 /tts
  // Non-streaming endpoint: the streaming endpoint (/tts/stream) was
  // tested but provided no benefit since synthesize() concatenates all
  // chunks before returning. The streaming endpoint added ~40ms overhead.
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
// Exported for unit testing the sentence splitter used in processVadSpeech.
export const SENTENCE_END_REGEX = /[.!?。！？\n]/;

// Minimum buffer length before clause-level splitting kicks in. Below this,
// chunks are short enough that synthesis (~1-3s) outruns playback, so no
// split is needed and prosody stays maximally continuous.
// Tuned for 1.7B model (2026-08-23): the 1.7B model has a ~1.8x ratio
// (synthesis time / playback time). Shorter chunks synthesize faster and
// the 3-wide parallel pipeline can overlap synthesis of sentence N+1
// with playback of sentence N. CLAUSE_SPLIT_MIN=10 keeps chunks ~10-20
// chars: synthesis ~2-4s for ~1-2.5s audio, so the pipeline stays ahead.
export const CLAUSE_SPLIT_MIN = 10;

// Natural pause marks — where a human speaker breathes. Splitting here
// (instead of mid-word) preserves prosody across chunk boundaries.
const CLAUSE_BREAK_REGEX = /[,、；;:：,，—]/;

/**
 * Find the index of the LAST clause break mark in the first
 * CLAUSE_SPLIT_MIN..(len-1) chars of buf, or -1 if none.
 * We take the latest break before the end so chunks are as long as
 * possible (fewer chunks = fewer prosody resets) while still bounded.
 */
export function findClauseBreak(buf: string): number {
  const end = buf.length - 1; // keep at least 1 char after the cut
  for (let i = end; i >= CLAUSE_SPLIT_MIN - 1; i -= 1) {
    if (CLAUSE_BREAK_REGEX.test(buf[i])) return i;
  }
  return -1;
}

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
  maxLen = 80,
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
      // letters, marks, numbers, punctuation, CJK.
      .replace(
        /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu,
        "",
      )
      // Pause-causing symbols → commas or periods (2026-08-23):
      // Qwen3-TTS interprets these as long pauses or wavering sounds.
      // Em-dash / en-dash / horizontal bar → comma (clause separator).
      .replace(/[\u2014\u2013\u2015]/g, ",")
      // Ellipsis → period (sentence ending).
      .replace(/\u2026/g, "。")
      // Tildes (fullwidth and ASCII) → strip (causes wavering vocalization).
      .replace(/[\uFF5E~]/g, "")
      // Middle dot, bullet, reference mark → strip (causes pauses).
      .replace(/[\u00B7\u2022\u203B]/g, "")
      // Paralinguistic text → strip (2026-08-24):
      // Qwen3-TTS vocalizes these as actual sounds — cat noises, laughter,
      // humming — not as read text. "喵" becomes a meow sound (+1.4s audio),
      // "哈哈" becomes laughter (+1.4s), "嗯" becomes humming. These are
      // the "giggles and tune changes" the user hears mid-reply.
      // Strip them so only speakable prose reaches the TTS engine.
      // NOTE: 喵 is the brand persona's cat sound (橘宝疾风). We strip
      // repeated 喵喵喵 (paralinguistic burst) but keep a single 喵 at
      // sentence start (greeting) — replacing it with a comma so the TTS
      // reads it as a pause, not a meow. Mid-sentence 喵 is also replaced
      // with a comma to avoid the double-comma glitch from stripping.
      .replace(/喵{2,}/g, "")  // Repeated meows → strip entirely
      .replace(/喵/g, ",")     // Single 喵 → comma (pause, not meow)
      .replace(/哈哈+/g, "")
      .replace(/呵呵+/g, "")
      .replace(/嘻嘻+/g, "")
      .replace(/嗯[嗯哈]+/g, "")
      .replace(/啊[啊哈]+/g, "")
      .replace(/呜[呜哈]+/g, "")
      // Collapse consecutive punctuation: ！！！→！, ？？？→？, 。。。→。
      // Multiple consecutive marks cause multiple TTS pauses.
      .replace(/([！？。！？.!?])\1+/g, "$1")
      // Collapse consecutive commas from 喵→comma replacement and
      // paralinguistic stripping (e.g. "橘宝疾风，喵，你好" → "橘宝疾风，，你好" → "橘宝疾风，你好").
      // Use [，,]{2,} to match mixed fullwidth/ASCII consecutive commas.
      .replace(/[，,]{2,}/g, "，")
      // Strip leading comma left by 喵 at sentence start (e.g. "喵，你好" → "，你好" → "你好").
      .replace(/^[，,]\s*/g, "")
      // Collapse the whitespace left behind by removals.
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{2,}/g, "\n")
  );
}

/**
 * Detect and filter whisper hallucinations from silence.
 *
 * faster-whisper (and OpenAI whisper) hallucinate predictable text when
 * given silence or very low-quality audio — the model's training data
 * includes metadata headers and YouTube captions that leak through as
 * phantom transcriptions. Common hallucinations:
 * - Chinese: "简体中文", "简体字", "规范汉字", "请订阅", "感谢观看"
 * - English: "Thank you for watching", "Subscribe", "Please subscribe"
 *
 * These are short, repeat identically across sessions, and never match
 * what the user actually said. Drop them before the transcript reaches
 * processVadSpeech so they don't create phantom LLM turns.
 *
 * @param text - The raw STT result.
 * @returns The text unchanged if it's real speech, or "" if it's a
 *   known hallucination pattern.
 */
export function filterWhisperHallucination(text: string): string {
  const normalized = normalizeTranscriptForCompare(text);
  if (!normalized) return "";
  // Known hallucination patterns (normalized: no punctuation, lowercase).
  // These are the strings whisper emits from silence in our testing.
  // Use substring matching: whisper truncates or combines these patterns
  // (e.g. "简体中文，规" → "简体中文规"), so an exact match misses variants.
  const hallucinationPatterns = [
    "简体中文",
    "简体字",
    "规范汉字",
    "请订阅",
    "感谢观看",
    "thankyouforwatching",
    "pleasesubscribe",
    "subscribe",
  ];
  for (const pattern of hallucinationPatterns) {
    if (normalized === pattern || normalized.startsWith(pattern) || normalized.includes(pattern)) {
      console.warn(`[hermes-voice] Dropped whisper hallucination: "${text}" (matched "${pattern}")`);
      return "";
    }
  }
  return text;
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

  // Audio capture state. The AudioContext is owned by MicVAD when VAD is
  // active; we hold a reference for TTS playback (decodeAudioData + buffer
  // source) which runs on the same context.
  private audioContext: AudioContext | null = null;
  /** Silero VAD instance — null when disconnected. Owns the mic stream,
   *  the AudioWorklet, and the ONNX inference loop. start()/pause()
   *  control whether speech is being detected. */
  // Type is from @ricky0123/vad-web, which is dynamically imported in
  // connect(). Use a loose type here to avoid a static import.
  private vad: { start(): Promise<void>; pause(): Promise<void>; destroy(): Promise<void> } | null = null;

  /** Wake word mode: when true, the VAD runs but speech segments are
   *  transcribed and checked for the wake word instead of running a
   *  full LLM+TTS turn. If the wake word is found, a `wake.word` event
   *  is emitted. This replaces the old separate SpeechRecognition-based
   *  wake word detector — one mic consumer (the VAD), zero conflicts.
   *  The Thelliez pipeline pattern: wake word → VAD → STT, all on one
   *  audio stream, sequential not parallel. */
  private wakeWordMode = false;
  /** When true, processTurn will re-enable wake word mode after the
   *  turn completes. Set by stopWakeWordModeForTurn() — called when
   *  the wake word fires and we switch to a voice turn. The VAD keeps
   *  running; only the routing changes (keyword check → LLM+TTS → back
   *  to keyword check). */
  private wakeWordAutoResume = false;

  private isProcessing = false;
  /** Pending VAD speech segments queued while a turn is in flight.
   *  When the VAD splits one utterance into two segments (natural
   *  mid-sentence pause ≥ redemptionMs), the second segment would be
   *  silently dropped by the isProcessing guard. Instead, queue it
   *  here and process it after the current turn completes — the
   *  duplicate-STT check (isDuplicateSttTurn) handles the case where
   *  the second segment is a repeat of the first. */
  private pendingSegments: Float32Array[] = [];
  /** True while TTS audio is playing — the VAD is paused (half-duplex)
   *  so the reply's own voice can't be picked up, transcribed, and fed
   *  back to the LLM as a phantom user turn (the echo-back loop). */
  private ttsPlaying = false;

  // Interrupt support: abort in-flight SSE stream and TTS playback.
  private abortController: AbortController | null = null;
  private activeAudioSources: Set<AudioBufferSourceNode> = new Set();
  private turnCancelled = false;
  /** Speaker pinned for the current turn — set once from the user's
   *  utterance language so every sentence of the reply uses ONE voice.
   *  Mixed zh/en replies must not flip speakers mid-sentence. */
  private turnSpeaker: string | null = null;
  /** Transcript of the previous accepted turn — used to drop consecutive
   *  duplicate STT results (VAD splits / user self-repetition that
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

  // STT language hint — helps Whisper avoid misdetecting Chinese
  // speech as English (which produces garbage transliteration like "nee
  // how" instead of "你好"). Default is "zh" because:
  // 1. The primary user speaks Chinese — starting with "auto" lets
  //    Whisper auto-detect, but on real microphone audio with background
  //    noise and partial utterances (VAD splits), auto-detect frequently
  //    defaults to English. After 2 English detections, the auto-adjust
  //    pins "en" and gets stuck — all subsequent Chinese speech is forced
  //    through the English decoder, producing garbage.
  // 2. Whisper-Large-v3 (lemonade, full model not Turbo) handles forced-zh
  //    homophone errors that plagued the smaller faster-whisper model
  //    (橘宝→继绞/拘保) do not occur with the larger model.
  // 3. The auto-adjust below still switches to "en" after 2 consecutive
  //    non-CJK transcripts, so English speech is handled correctly.
  private sttLanguage: string =
    (typeof window !== "undefined" && (window as any).__HERMES_STT_LANGUAGE__) ||
    import.meta.env.VITE_HERMES_STT_LANGUAGE ||
    "zh";

  // Consecutive non-CJK transcript counter for STT language auto-adjustment.
  // Only pins "en" after 2 consecutive non-CJK results, so a single
  // misdetection (Chinese → English garbage) doesn't lock the wrong language.
  private _nonCjkStreak = 0;

  // Consecutive "en"-pinned transcripts without any CJK. Once this exceeds
  // EN_PIN_PROBE_LIMIT, the next utterance is probed with "auto" so whisper
  // can re-detect Chinese. Without this, the en-pin is self-reinforcing:
  // Chinese speech forced through the English decoder yields ASCII garbage,
  // which counts as non-CJK and keeps the pin stuck at "en" forever.
  private _enPinStreak = 0;
  private static readonly EN_PIN_PROBE_LIMIT = 3;

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
   * Open a Hermes voice session: create the Silero VAD, acquire the mic,
   * and start listening for speech. Resolves once the VAD is loaded and
   * listening.
   *
   * The VAD runs in an AudioWorklet and calls onSpeechEnd with a
   * Float32Array of speech audio (16 kHz mono) when the user stops
   * talking. That audio is converted to WAV and sent to Hermes STT.
   */
  async connect(_options?: {
    turnDetection?: "server_vad" | "none";
    provider?: string | null;
  }): Promise<void> {
    if (this.state === "connected" || this.state === "connecting") return;
    this.setState("connecting");

    try {
      // 1. Create AudioContext within the user gesture and pre-warm the
      // decoder so the first decodeAudioData call isn't slow (~100-300ms).
      // MicVAD will adopt this context (we pass it via the audioContext
      // option) so TTS playback and VAD share one context.
      this.audioContext = new AudioContext();
      // Pre-warm: decode a tiny silent buffer to initialize the audio decoder.
      this.audioContext.decodeAudioData(new ArrayBuffer(44 + 2), () => {}, () => {});
      if (this.audioContext.state !== "running") {
        await this.audioContext.resume();
      }

      // 2. Create the Silero VAD. MicVAD.new handles mic acquisition
      //    internally (getStream default uses echoCancellation + AGC +
      //    noiseSuppression, channelCount 1). The worklet, ONNX model,
      //    and onnxruntime WASM files are served from / (public/).
      //    redemptionMs=1500 → ~1.5s of silence before onSpeechEnd fires.
      //    Long enough to ride out natural mid-sentence pauses without
      //    chopping one utterance into two. Chinese consonant transitions
      //    (e.g. "sh" in 上海) can dip speech probability to 0.35-0.45 for
      //    200-400ms — negativeSpeechThreshold=0.35 (not 0.45) ensures
      //    the redemption counter only ticks on true silence, not on
      //    these normal dips. positiveSpeechThreshold stays high (0.6)
      //    to prevent false speech triggers from background noise.
      //    Dynamic import — @ricky0123/vad-web pulls in onnxruntime-web
      //    (WASM), which must not be in the initial bundle.
      const { MicVAD } = await import("@ricky0123/vad-web");
      this.vad = await MicVAD.new({
        audioContext: this.audioContext,
        baseAssetPath: "/",
        onnxWASMBasePath: "/",
        model: "v5",
        positiveSpeechThreshold: 0.6,
        negativeSpeechThreshold: 0.35,
        preSpeechPadMs: 500,
        redemptionMs: 1500,
        minSpeechMs: 300,
        submitUserSpeechOnPause: false,
        startOnLoad: false,
        onSpeechStart: () => {
          console.log("[hermes-voice] VAD: speech start");
        },
        onSpeechEnd: (audio: Float32Array) => {
          // Half-duplex: ignore speech while our own TTS is playing.
          if (this.ttsPlaying) return;
          // Queue segments that arrive while a turn is in flight instead
          // of dropping them. The VAD can split one utterance into two
          // segments (natural mid-sentence pause ≥ redemptionMs); the
          // second segment is the tail of the same utterance, not a new
          // turn. processVadSpeech will drain the queue after the current
          // turn completes, and isDuplicateSttTurn handles repeats.
          if (this.isProcessing) {
            this.pendingSegments.push(audio);
            return;
          }
          if (this.wakeWordMode) {
            void this.processWakeWordSpeech(audio);
          } else {
            void this.processVadSpeech(audio);
          }
        },
        onVADMisfire: () => {
          // Audio segment too short (< minSpeechMs) — likely a noise
          // transient. Silero already filtered it; nothing to do.
        },
      });

      // 3. Start listening.
      this.vad.start();

      this.setState("connected");
      this.emit({ type: "gateway.connected" });
      console.log("[hermes-voice] Connected (Silero VAD), listening for speech");

      // 4. Pre-flight STT warmup: send a tiny silent WAV to Hermes
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
   * Start wake word mode: the VAD listens for speech segments, transcribes
   * each one, and checks for the wake word. When found, emits a `wake.word`
   * event. No LLM/TTS turn runs — just quick STT + keyword check.
   *
   * This replaces the old separate SpeechRecognition-based wake word
   * detector. One mic consumer (the VAD), zero mic conflicts.
   *
   * Requires connect() to have been called first (the VAD must exist).
   * If the VAD is already running in voice mode, it switches to wake word
   * mode — subsequent speech segments go to keyword checking, not the
   * LLM+TTS pipeline.
   */
  startWakeWordMode(): void {
    if (!this.vad) {
      console.warn("[hermes-voice] startWakeWordMode: VAD not connected");
      return;
    }
    this.wakeWordMode = true;
    // If the VAD was paused (e.g. after a voice turn), resume it.
    this.vad.start().catch(() => {});
    console.log("[hermes-voice] Wake word mode started (VAD → STT → keyword check)");
  }

  /**
   * Stop wake word mode: the VAD stops checking for wake words, but
   * the VAD itself keeps running — speech segments will route to
   * processVadSpeech (the full LLM+TTS pipeline) instead of
   * processWakeWordSpeech (keyword check). This is the correct
   * behavior when the voice session is active: the VAD should keep
   * listening for speech, just not in keyword-spotting mode.
   *
   * To fully stop the VAD (release the mic), call disconnect().
   */
  stopWakeWordMode(): void {
    this.wakeWordMode = false;
    this.wakeWordAutoResume = false;
    // Do NOT pause the VAD here — the voice session may need it to
    // keep listening for speech. Only the routing changes (keyword
    // check → LLM+TTS). The VAD is paused/destroyed only by
    // disconnect() or pause().
    console.log("[hermes-voice] Wake word mode stopped (VAD keeps running)");
  }

  /**
   * Switch from wake word mode to voice session mode for one turn.
   * Sets wakeWordMode=false so the next speech segment goes to
   * processVadSpeech (full LLM+TTS pipeline). Sets wakeWordAutoResume
   * so after the turn completes, wake word mode is automatically
   * re-enabled — the user can say "橘宝" again without re-toggling.
   * The VAD keeps running throughout — no mic re-acquisition.
   */
  stopWakeWordModeForTurn(): void {
    this.wakeWordMode = false;
    this.wakeWordAutoResume = true;
    console.log("[hermes-voice] Wake word → voice turn (auto-resume after turn)");
  }

  /**
   * Process one VAD speech segment in wake word mode: convert to WAV,
   * transcribe via Hermes STT, check for the wake word. If found, emit
   * `wake.word`. No LLM/TTS — just keyword spotting.
   *
   * This is the Thelliez pipeline pattern: VAD segments speech → STT
   * transcribes → keyword check decides whether to activate.
   */
  private async processWakeWordSpeech(audio: Float32Array): Promise<void> {
    // Convert Float32 [-1, 1] → PCM16 for WAV encoding.
    const pcm16 = new Int16Array(audio.length);
    for (let i = 0; i < audio.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, audio[i]));
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    // Skip very short audio (< 0.3s) — not enough to contain a wake word.
    if (pcm16.length < TARGET_RATE * 0.3) return;

    const wavBlob = this.pcm16ToWav(pcm16);
    try {
      const transcript = await this.transcribe(wavBlob);
      // Re-check state after the async STT round-trip — a voice turn
      // may have started, TTS may be playing, or wake word mode may
      // have been disabled during the await. Without this guard, a
      // wake.word event can fire mid-turn, clobbering turn state.
      if (!this.wakeWordMode || this.isProcessing || this.ttsPlaying) return;
      if (transcript.trim() && containsWakeWord(transcript)) {
        console.log(`[hermes-voice] Wake word detected: "${transcript.slice(0, 40)}"`);
        this.emit({ type: "wake.word", transcript });
      }
    } catch (err) {
      // STT failure in wake word mode is non-fatal — the next speech
      // segment will try again. Don't log as error to avoid noise.
      console.debug("[hermes-voice] Wake word STT failed:", err);
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

  /**
   * Process one VAD speech segment: convert Float32 → PCM16 → WAV,
   * then run the STT → LLM → TTS turn pipeline.
   *
   * Called from the VAD's onSpeechEnd callback. The audio is already
   * segmented (Silero determined speech boundaries), so no endpoint
   * detection is needed here — just transcribe and respond.
   */
  private async processVadSpeech(audio: Float32Array): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Convert Float32 [-1, 1] → PCM16 for WAV encoding.
    const pcm16 = new Int16Array(audio.length);
    for (let i = 0; i < audio.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, audio[i]));
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    // Skip very short audio (< 0.3s) — Silero's minSpeechMs should filter
    // these, but double-check so a misconfigured threshold doesn't waste
    // an STT round-trip on noise.
    if (pcm16.length < TARGET_RATE * 0.3) {
      this.isProcessing = false;
      return;
    }

    const wavBlob = this.pcm16ToWav(pcm16);
    await this.processTurn(wavBlob);
  }

  /** Process one voice turn: STT → LLM → TTS.
   *
   *  The audio is already segmented by the VAD — no endpoint detection,
   *  no speculative STT, no streaming STT. Just: transcribe the WAV,
   *  classify intent, stream the LLM reply, fire TTS per sentence. */
  private async processTurn(wavBlob: Blob): Promise<void> {
    this.emit({ type: "turn.started", turnId: `turn-${Date.now()}` });

    try {
      // 1. STT — batch upload the VAD-segmented WAV.
      const t0 = performance.now();
      let userText = await this.transcribe(wavBlob);
      const t1 = performance.now();
      console.log(`[hermes-voice] STT: ${(t1 - t0).toFixed(0)}ms (${userText.length} chars)`);
      if (!userText.trim()) {
        this.isProcessing = false;
        return;
      }

      // Drop a consecutive duplicate turn: the VAD can split one
      // utterance into two segments (or the user repeats themselves while
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
            this.ttsPlaying = true; // mute mic during the confirmation
            this.playAudio(audioData, () => {
              this.ttsPlaying = false;
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
        if (!next) {
          // Queue drained — unmute the mic (with a short tail so the
          // speaker's physical decay doesn't clip into capture).
          setTimeout(() => {
            if (!playing) {
              this.ttsPlaying = false;
              // Resume the VAD — start listening for the next utterance.
              if (this.vad && !this.wakeWordMode) {
                this.vad.start().catch(() => {});
              }
            }
          }, 300);
          return;
        }
        playing = true;
        this.ttsPlaying = true; // mute mic while our voice plays
        // Pause the VAD during TTS playback — saves CPU (no ONNX
        // inference on audio that will be discarded) and enables clean
        // barge-in when we add interrupt support.
        if (this.vad && !this.wakeWordMode) {
          this.vad.pause().catch(() => {});
        }
        if (!playbackStarted) {
          playbackStarted = true;
          this.emit({ type: "playback.started" });
        }
        this.playAudio(next, () => {
          playing = false;
          playQueue();
        });
      };

      // Parallel TTS synthesis with ordered playback. The GPU Qwen3-TTS
      // server parallelizes via asyncio.to_thread and comfortably handles
      // more than 3 in-flight requests; the previous cap of 3 (tuned for
      // Edge TTS throttling) starved the strict-order playback queue when
      // one chunk took 10-20s — heard as mid-reply gaps/skips.
      // Kept at 3: measured 2026-08-23, 3 concurrent 18-char requests on the
      // 0.6B model took 13.8s total (each ~13s vs 6.4s sequential) — the GPU
      // is the bottleneck and higher concurrency made each request slower.
      // The 1.7B model is more efficient per token, so 3-wide is sufficient.
      const pendingTts: { promise: Promise<ArrayBuffer>; idx: number }[] = [];
      const ttsSemaphore = new Semaphore(3);
      // sentenceIdx is 1-based (incremented before assignment in
      // flushSentence), so the drainer must start at 1 — starting at 0
      // means no idx ever matches and nothing is played.
      let drainIdx = 1;
      let skippedCount = 0;

      // SINGLE drainer: every flushSentence kick just resolves
      // drainTick; exactly one drainPending loop runs at a time.
      // The previous fire-and-forget `void drainPending()` per flush
      // let multiple loops interleave across `await` boundaries: loop A
      // could splice idx N+1 while loop B was still awaiting idx N,
      // scrambling playback order — and at end of turn the final
      // `await drainPending()` spawned a fresh loop that saw an empty
      // pendingTts (the other loop had already spliced the last entry
      // and was awaiting its synthesis), returned immediately, and the
      // turn ended before the last sentence's audio arrived — heard as
      // the reply's tail going missing.
      let drainTick: (() => void) | null = null;
      let drainLoopRunning = false;
      const kickDrainer = () => {
        if (drainLoopRunning) {
          // Loop is running but may be parked on `break` waiting for the
          // next sequential chunk. Tick it so it re-scans pendingTts.
          drainTick?.();
        } else {
          // Loop exited (break on !next or finished a pass). Restart it
          // so newly-arrived chunks drain immediately. Without this, the
          // drainer breaks when the next chunk hasn't arrived yet (LLM
          // stream gap between sentence boundaries), sets
          // drainLoopRunning=false, and all subsequent chunks pile up
          // undrained until end-of-turn — heard as mid-sentence silence.
          // Safe from interleaving: drainLoopRunning is checked first;
          // the new loop sets it true before any await boundary.
          void drainPending();
        }
      };
      const drainPending = async (): Promise<void> => {
        if (drainLoopRunning) {
          // A loop is already running — wait for it to process the
          // newly-pushed entries before returning (end-of-turn needs
          // this: the final flush must be fully drained).
          await new Promise<void>((resolve) => {
            drainTick = resolve;
          });
          return;
        }
        drainLoopRunning = true;
        try {
          while (pendingTts.length > 0 && !this.turnCancelled) {
            // Strict sequential playback by sentence index. Out-of-order
            // playback was tried (play any resolved sentence when the next
            // sequential one lags) but scrambling sentence order was heard
            // as dropped/garbled audio — worse than the gap it avoided.
            // The real gap fix is server-side: parallel synthesis via
            // asyncio.to_thread keeps production ahead of playback.
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
              console.error(`[hermes-voice] TTS #${next.idx} failed:`, err);
              skippedCount += 1;
              // Continue to next sentence — one failure shouldn't kill the chain.
            }
          }
        } finally {
          drainLoopRunning = false;
          // Wake any waiter parked in the branch above.
          const tick = drainTick;
          drainTick = null;
          tick?.();
        }
      };

      // Flush a sentence: fire TTS synthesis (concurrency-limited), drain in order.
      // Multi-sentence chunks (from the 60-char safety net, the 100-char
      // force-split, or the final stream-end flush) are split before
      // synthesis: the 0.6B Qwen3-TTS model emits an early EOS on
      // multi-sentence input, truncating the audio to the first clause
      // (measured 2026-08-22: 32-char input → ~1s speech on 2 of 3 runs,
      // while single sentences are stable 12/12).
      const flushSentence = (text: string): void => {
        const trimmed = sanitizeForTts(text).trim();
        if (!trimmed) return;
        const chunks = splitSentences(trimmed).sentences;
        const remainder = splitSentences(trimmed).remainder;
        if (remainder.trim()) chunks.push(remainder);
        if (chunks.length === 0) return;
        for (const chunk of chunks) {
          flushSingleChunk(chunk);
        }
      };
      const flushSingleChunk = (trimmed: string): void => {
        if (!trimmed.trim()) return;
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
        kickDrainer();
      };

      // Stream LLM tokens via SSE and split into sentences.
      // AbortController allows interrupt to cancel the stream mid-flight.
      const handleDelta = (delta: string) => {
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
        // Clause-level split: a long sentence (measured 60-100 chars →
        // 8-20s synthesis vs 3-6s playback) starves the strict-order
        // playback queue — the drainer waits on the next chunk while the
        // speaker finishes early, heard as mid-reply gaps. Splitting at
        // natural pause marks (, 、 ； , ; : —) once a chunk reaches
        // CLAUSE_SPLIT_MIN keeps each TTS chunk ~16-30 chars: synthesis
        // time ≈ playback time with the 1.7B model (ratio ~1.33-1.55x),
        // so the 3-wide parallel pipeline stays ahead of the speaker.
        // Pause-mark boundaries are where a human speaker breathes, so
        // prosody continuity is preserved.
        while (sentenceBuf.length >= CLAUSE_SPLIT_MIN) {
          const cut = findClauseBreak(sentenceBuf);
          if (cut < 0) break;
          flushSentence(sentenceBuf.slice(0, cut + 1));
          sentenceBuf = sentenceBuf.slice(cut + 1);
        }
        // Safety net: if the buffer grows too long without ANY boundary
        // (common for long Chinese sentences without punctuation), force
        // a split. 80 chars ≈ the longest natural clause for the 1.7B model
        // (measured: 64 chars → 20.6s synth, 13.4s audio, ratio 1.54x).
        // A smaller cap chopped mid-clause, and each forced boundary reset
        // prosody (heard as emotion/tune changes between segments).
        if (sentenceBuf.length > 80) {
          flushSentence(sentenceBuf);
          sentenceBuf = "";
        }
      };

      this.abortController = new AbortController();
      await this.chatStream(userText, handleDelta, this.abortController.signal);

      // Flush any remaining text after stream ends.
      if (sentenceBuf.trim() && !this.turnCancelled) {
        flushSentence(sentenceBuf);
      }
      // Wait for all pending TTS to drain.
      await drainPending();
      // Wait for playback to finish. Must check BOTH `playing` and the
      // queue: between chunks `playing` is briefly false (onEnded →
      // playQueue transition), so polling only `playing` could observe
      // a false while the tail chunks were still queued — ending the
      // turn and cutting the reply's last sentences.
      // Also check pendingTts: the drainer may have returned but the
      // last sentence's TTS synthesis is still in-flight (the drainer
      // breaks when the next sequential chunk hasn't arrived, then
      // kickDrainer restarts it — but the end-of-turn drainPending
      // may have parked on drainTick and returned before the restart
      // loop processed the last entry). Checking pendingTts ensures
      // we don't exit while synthesis is still running.
      while ((playing || ttsQueue.length > 0 || pendingTts.length > 0) && !this.turnCancelled) {
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
      // Safety net: if the turn errored before emitting audio.done,
      // voiceActive stays true and blocks the read-aloud button.
      // Reset it here so the UI is always recoverable.
      if (this.ttsPlaying) {
        this.ttsPlaying = false;
      }
      // Drain any VAD segments that were queued while this turn was
      // in flight (the VAD split one utterance into two segments).
      // isDuplicateSttTurn will drop a repeat; a genuine continuation
      // (the tail of a split utterance) will start a new turn.
      if (this.pendingSegments.length > 0 && !this.ttsPlaying) {
        const next = this.pendingSegments.shift()!;
        void this.processVadSpeech(next);
      }
      // Auto-resume wake word mode after a voice turn — the user can
      // say "橘宝" again without re-toggling the chip. Only fires if
      // stopWakeWordModeForTurn() was called (wake word → voice turn).
      if (this.wakeWordAutoResume) {
        this.wakeWordAutoResume = false;
        this.wakeWordMode = true;
        console.log("[hermes-voice] Wake word mode auto-resumed after turn");
      }
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
   *  speech as English (producing garbage transliteration).
   *
   *  The initial_prompt is NOT sent from the browser — Hermes's
   *  faster-whisper has its own initial_prompt in /opt/data/config.yaml
   *  that provides Chinese decoder context (橘宝疾风 persona vocabulary).
   *  The browser only sends the audio file + language hint. */
  private async transcribe(wavBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", wavBlob, "dictation.wav");
    // Send the language hint — "auto" lets whisper detect, "zh" forces
    // Chinese, "en" forces English. The backend passes this through to
    // faster-whisper's model.transcribe(language=...) parameter.
    // Probe with "auto" when the en-pin looks stuck: after several
    // consecutive en-pinned non-CJK transcripts, let whisper detect freely
    // so a Chinese-speaking user isn't locked into the English decoder.
    const langToSend =
      this.sttLanguage === "en" && this._enPinStreak >= HermesVoiceTransport.EN_PIN_PROBE_LIMIT
        ? "auto"
        : this.sttLanguage;
    if (langToSend && langToSend !== "auto") {
      formData.append("language", langToSend);
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
        this._enPinStreak = 0;
      } else {
        this._nonCjkStreak += 1;
        if (this._nonCjkStreak >= 2) {
          this.sttLanguage = "en";
          this._enPinStreak += 1;
        }
      }
    } else if (!text || text.trim().length === 0) {
      // Empty transcript — likely a wrong language hint caused whisper to
      // produce nothing. Reset to "auto" so whisper can detect freely on
      // the next utterance instead of being locked into the wrong language.
      // BUT: if we're already pinned to "zh", keep it — VAD often splits a
      // Chinese utterance into fragments, and some fragments produce empty
      // transcripts. Resetting to "auto" here would let the next fragment
      // auto-detect as English (lemonade's auto-detect on tone-like audio
      // defaults to English), which then pins "en" after 2 occurrences.
      // Only reset when stuck in "en" (to unblock en→zh switches).
      if (this.sttLanguage !== "zh") {
        this.sttLanguage = "auto";
        this._nonCjkStreak = 0;
      }
    }
    // Filter whisper hallucinations (phantom text from silence) before
    // returning. Without this, "简体中文" / "简体字" / "规范汉字" appear
    // as phantom user turns — the user never said them, but whisper
    // hallucinates these metadata-like strings from silence.
    return filterWhisperHallucination(text);
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

    console.log(`[hermes-voice] chatStreamViaAgentMeow: session=${sessionId}, text="${text.slice(0, 40)}"`);
    // Open the SSE stream BEFORE posting so no early deltas are missed.
    const streamController = new AbortController();
    const onAbort = () => streamController.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    const streamResp = await openSessionStream(sessionId, streamController.signal);
    console.log(`[hermes-voice] chatStreamViaAgentMeow: stream open ok=${streamResp.ok} status=${streamResp.status}`);
    if (!streamResp.ok) {
      signal?.removeEventListener("abort", onAbort);
      throw new Error(`Agent-meow stream open failed: ${streamResp.status}`);
    }

    try {
      let posted = false;
      let eventCount = 0;
      let deltaCount = 0;
      for await (const event of parseSseStream(streamResp.body!)) {
        eventCount += 1;
        if (event.type === "session_heartbeat" && !posted) {
          console.log(`[hermes-voice] chatStreamViaAgentMeow: heartbeat received (event #${eventCount}), posting message`);
          posted = true;
          await postEvent(sessionId, {
            type: "message",
            data: { role: "user", content: [{ type: "input_text", text }] },
          });
          console.log(`[hermes-voice] chatStreamViaAgentMeow: postEvent done, tailing for deltas`);
          continue;
        }
        if (!posted) {
          // Log pre-heartbeat events for debugging
          console.log(`[hermes-voice] chatStreamViaAgentMeow: pre-heartbeat event #${eventCount} type=${event.type}`);
          continue;
        }
        if (event.type === "text_delta" && event.delta) {
          deltaCount += 1;
          if (deltaCount <= 3) console.log(`[hermes-voice] chatStreamViaAgentMeow: delta #${deltaCount}="${(event as any).delta?.slice(0, 30)}"`);
          onDelta((event as any).delta);
        } else if (event.type === "tool_call") {
          // Forward tool-call events as short status narrations so the
          // user hears that the agent is working, not just silence.
          // The narration is injected as a delta — it appears in the
          // transcript but is NOT sent to TTS (it's too short for a
          // sentence boundary). The user sees "正在查看文件..." in the
          // chat box while the agent works.
          const toolName = (event as any).tool_name || (event as any).name || "";
          if (toolName) {
            const narration = this.toolNameToNarration(toolName);
            if (narration) {
              onDelta(narration);
            }
          }
        } else if (
          event.type === "response_completed" ||
          event.type === "response_failed" ||
          event.type === "response_cancelled" ||
          event.type === "response_incomplete"
        ) {
          console.log(`[hermes-voice] chatStreamViaAgentMeow: ${event.type} (event #${eventCount}, ${deltaCount} deltas total)`);
          break;
        }
      }
      console.log(`[hermes-voice] chatStreamViaAgentMeow: stream ended (posted=${posted}, ${eventCount} events, ${deltaCount} deltas)`);
      if (!posted) {
        throw new Error("Session stream closed before ready heartbeat");
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

  /**
   * Map a tool name to a short narration string for the chat box.
   * This gives the user visual feedback that the agent is working
   * (reading files, running code, etc.) instead of staring at silence.
   * The narration is injected as a text delta — it appears in the
   * transcript but is too short for TTS (no sentence boundary).
   */
  private toolNameToNarration(toolName: string): string {
    const lower = toolName.toLowerCase();
    if (lower.includes("file") || lower.includes("read") || lower.includes("write")) {
      return "正在查看文件…\n";
    }
    if (lower.includes("terminal") || lower.includes("bash") || lower.includes("shell")) {
      return "正在执行命令…\n";
    }
    if (lower.includes("search") || lower.includes("web")) {
      return "正在搜索…\n";
    }
    if (lower.includes("code") || lower.includes("edit")) {
      return "正在编辑代码…\n";
    }
    return `正在使用 ${toolName}…\n`;
  }

  /** Synthesize speech via Qwen3-TTS streaming endpoint.
   *
   *  The streaming endpoint decodes codec tokens in ~1s chunks and streams
   *  each as a WAV segment. This method reads the stream and concatenates
   *  all chunks into a single ArrayBuffer for the playback queue.
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
    // One retry on failure: transient 4xx/5xx/network errors otherwise
    // permanently drop the sentence from voice-back (the skip path below
    // is silent — text shows, audio never plays).
    const attempt = async (): Promise<ArrayBuffer | null> => {
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
          } else if (resp.body) {
            // Streaming response: concatenate all WAV chunks into one
            // ArrayBuffer. The streaming endpoint sends ~1s WAV segments
            // sequentially — concatenating them produces a valid audio
            // blob that decodeAudioData can handle (each WAV has its own
            // header, and the browser decoder handles concatenated WAVs
            // by reading the first one — but since all chunks share the
            // same format/sample rate, we concatenate the raw PCM data
            // and let the playback queue handle them as separate chunks).
            //
            // For now, collect all chunks and return as a single buffer.
            // The streaming benefit is that the server starts sending
            // data sooner (first chunk decoded while later chunks are
            // still being decoded by the vocoder).
            const chunks: Uint8Array[] = [];
            const reader = resp.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }
            // Concatenate all chunks.
            const totalLen = chunks.reduce((s, c) => s + c.length, 0);
            const result = new Uint8Array(totalLen);
            let offset = 0;
            for (const chunk of chunks) {
              result.set(chunk, offset);
              offset += chunk.length;
            }
            return result.buffer;
          } else {
            // Raw audio bytes — return as ArrayBuffer.
            return resp.arrayBuffer();
          }
        } else {
          console.warn(`[hermes-voice] Qwen3-TTS failed: ${resp.status}`);
        }
      } catch (err) {
        console.warn(`[hermes-voice] Qwen3-TTS unavailable: ${err}`);
      }
      return null;
    };
    const first = await attempt();
    if (first && first.byteLength > 0) return first;
    console.warn(`[hermes-voice] TTS retrying once: "${text.slice(0, 40)}"`);
    const second = await attempt();
    if (second && second.byteLength > 0) return second;

    // 2. No Edge-TTS fallback: Edge speaks in a different voice (Xiaoxiao),
    //    so a mid-reply Qwen failure switching to Edge sounded like a second
    //    TTS replaying over the first. When Qwen fails, skip the sentence —
    //    one engine, one voice, always. Emit tts.skipped so the UI can show
    //    a "voice unavailable" indicator instead of a silent hole.
    console.warn(`[hermes-voice] TTS SKIPPED (Qwen3-TTS failed): "${text.slice(0, 40)}"`);
    this.emit({ type: "tts.skipped", sentence: text, reason: "qwen3-tts-failed" });
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
      this.ttsPlaying = false;
      this.isProcessing = false;
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

  /** Disconnect: destroy the VAD and tear down the AudioContext. */
  disconnect(): void {
    this.wakeWordMode = false;
    this.wakeWordAutoResume = false;
    // Destroy the VAD — this stops the AudioWorklet, releases the mic
    // stream, and cleans up the ONNX inference session.
    if (this.vad) {
      this.vad.destroy().catch((err) => {
        console.warn("[hermes-voice] VAD destroy failed:", err);
      });
      this.vad = null;
    }
    // The AudioContext is shared between VAD and TTS playback. Close it
    // after the VAD is gone so no decodeAudioData callback dangles.
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.isProcessing = false;
    this.ttsPlaying = false;
    // Clear any queued segments — they belong to the old session.
    this.pendingSegments = [];
    // Fresh comparison base for the next voice session.
    this.lastAcceptedTranscript = "";
    this.setState("disconnected");
  }
}

/** Singleton transport instance — one voice session per tab. */
export const hermesVoice = new HermesVoiceTransport();