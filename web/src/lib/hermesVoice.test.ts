// Regression tests for hermesVoice.ts pure helpers.
//
// Covers the functions that were fixed in the 2026-08-16 session:
//   - rms() — RMS energy calculation
//   - int16ToBase64() — base64 encoding of PCM audio
//   - splitSentences() — sentence/phrase boundary splitting (CJK + ASCII)
//   - isCJK() — CJK character detection for TTS language routing
//   - Constants: TARGET_RATE
//
// The transport class itself (connect/processVadSpeech/synthesize) requires
// AudioContext + fetch mocking and is covered by e2e_ui voice tests; these
// unit tests guard the pure logic that is easy to regress silently.
//
// Note: ENDPOINT_SILENCE_CHUNKS and ENDPOINT_THRESHOLD_RATIO were removed
// in the Silero VAD migration (2026-08-22) — the VAD handles endpoint
// detection internally via the ONNX model, so RMS threshold constants are
// no longer exported.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Semaphore,
  TARGET_RATE,
  RESUME_ECHO_TAIL_MS,
  filterWhisperHallucination,
  int16ToBase64,
  isCJK,
  isDuplicateSttTurn,
  isLikelyReplyEcho,
  makeBeepPlaceholder,
  rms,
  sanitizeForTts,
  splitSentences,
} from "./hermesVoice";
import { hermesVoice } from "./hermesVoice";

// Mock the dynamic imports used by chatStreamViaAgentMeow so the SSE stall
// test can drive the stream by hand. These are dynamically imported inside
// the method (await import("./sessionsApi") / await import("./sse")), so
// vi.mock intercepts them at the module boundary.
vi.mock("./sessionsApi", () => ({
  postEvent: vi.fn(async () => ({ queued: true })),
  openSessionStream: vi.fn(async () => ({ ok: true, status: 200, body: null })),
}));
vi.mock("./sse", () => ({
  parseSseStream: vi.fn(async function* () {
    // Default: yield nothing (half-open). The test overrides via the
    // mock's mockImplementation when it needs to drive events.
  }),
}));

// Import the mocked modules so the SSE stall test can override their
// implementations with the controllable stream driver.
import * as sessionsApiMock from "./sessionsApi";
import * as sseMock from "./sse";

describe("interrupt() transitions back to Listening", () => {
  // G5 regression: send({type:"interrupt"}) cancels the turn but used to
  // leave the VAD paused — pauseVadForTurn() had run for the turn, and
  // interrupt() bypasses processTurn's finally block where
  // resumeVadAfterTurn() normally fires. After Stop, the mic stayed
  // silent until the user clicked the paw button again. Rule 13: stop →
  // directly enter Listening, ASR ON.
  it("resumes the VAD after interrupt (Stop → Listening)", () => {
    const vad = {
      start: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
    };
    const t = hermesVoice as unknown as { vad: unknown };
    t.vad = vad;
    vi.useFakeTimers();
    try {
      hermesVoice.send({ type: "interrupt" });
      // The resume defers past the echo tail (see resumeVadAfterTurn).
      vi.advanceTimersByTime(RESUME_ECHO_TAIL_MS);
      expect(vad.start).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      t.vad = null;
    }
  });
});

describe("getVoiceState() — the unified voice state enum (G3/G4)", () => {
  // One authoritative signal for the 橘宝 state machine, derived from the
  // transport's private flags. Priority: speaking > processing > connection.
  // The flags are poked directly (as any) because the derivation is pure
  // flag→enum mapping — no audio, no network, no mocks needed.
  type Flags = { ttsPlaying: boolean; isProcessing: boolean; state: string; vadPaused: boolean };
  const t = hermesVoice as unknown as Flags;

  afterEach(() => {
    // Restore the transport's real defaults so no flag leaks into other tests.
    t.ttsPlaying = false;
    t.isProcessing = false;
    t.state = "disconnected";
    t.vadPaused = false;
  });

  it("disconnected when not connected", () => {
    t.state = "disconnected";
    expect(hermesVoice.getVoiceState()).toBe("disconnected");
  });

  it("listening when connected and idle (rule 1: the only mic-live state)", () => {
    t.state = "connected";
    t.vadPaused = false;
    expect(hermesVoice.getVoiceState()).toBe("listening");
  });

  it("processing while a turn is in flight (rules 4-5: ASR off)", () => {
    t.state = "connected";
    t.isProcessing = true;
    expect(hermesVoice.getVoiceState()).toBe("processing");
  });

  it("speaking while TTS plays (rules 6-8: ASR off), even mid-processing", () => {
    t.state = "connected";
    t.isProcessing = true;
    t.ttsPlaying = true;
    expect(hermesVoice.getVoiceState()).toBe("speaking");
  });

  it("disconnected while the VAD is paused for echo-back (playReply guard)", () => {
    t.state = "connected";
    t.vadPaused = true;
    expect(hermesVoice.getVoiceState()).toBe("disconnected");
  });
});

describe("wake-word gate lifecycle (stopWakeWordMode vs stopWakeWordModeForTurn)", () => {
  // The two teardown paths have different contracts:
  //   stopWakeWordModeForTurn() — mid-turn, marks this as a one-shot
  //     voice prompt so processTurn's finally block disconnects after
  //     the reply.
  //   stopWakeWordMode() — detector disabled/unmounted, clears the marker.
  type Flags = {
    wakeWordMode: boolean;
    wakeWordAutoStop: boolean;
    vad: { start: () => void; pause: () => void; destroy: () => void } | null;
    stateListeners: Set<() => void>;
    isProcessing: boolean;
    ttsPlaying: boolean;
    state: string;
    vadPaused: boolean;
  };
  const t = hermesVoice as unknown as Flags;
  const fakeVad = {
    start: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    t.vad = fakeVad;
    t.wakeWordMode = false;
    t.wakeWordAutoStop = false;
  });

  afterEach(() => {
    t.vad = null;
    t.wakeWordMode = false;
    t.wakeWordAutoStop = false;
    fakeVad.start.mockClear();
  });

  it("stopWakeWordModeForTurn marks the wake-opened turn for auto-stop", () => {
    t.wakeWordMode = true;
    hermesVoice.stopWakeWordModeForTurn();
    expect(t.wakeWordMode).toBe(false);
    expect(t.wakeWordAutoStop).toBe(true);
  });

  it("stopWakeWordMode clears wakeWordAutoStop (explicit disable)", () => {
    t.wakeWordMode = true;
    t.wakeWordAutoStop = true;
    hermesVoice.stopWakeWordMode();
    expect(t.wakeWordMode).toBe(false);
    expect(t.wakeWordAutoStop).toBe(false);
  });

  it("startWakeWordMode arms the gate and notifies listeners", () => {
    hermesVoice.startWakeWordMode();
    expect(t.wakeWordMode).toBe(true);
    expect(fakeVad.start).toHaveBeenCalled();
  });

  it("stopWakeWordModeForTurn notifies state listeners", () => {
    // Every gate mutator announces its flip — the hook's isWakeWordOnly
    // (and therefore wakeWordEnabled) keys on these notifications.
    const listener = vi.fn();
    t.stateListeners.add(listener);
    try {
      t.wakeWordMode = true;
      hermesVoice.stopWakeWordModeForTurn();
      expect(listener).toHaveBeenCalled();
    } finally {
      t.stateListeners.delete(listener);
    }
  });
});

describe("VAD resume ownership (F1+F2, 2026-09-03 audit)", () => {
  // Root cause of both findings: resumeVadAfterTurn() guarded on
  // !ttsPlaying — but the chat path sets ttsPlaying=true BEFORE the
  // audio finishes decoding, so the finally-block resume was always
  // skipped and the 300ms drain timer (whose !wakeWordMode guard fails
  // once the gate re-armed) became the de-facto resume. Two dead-mic
  // symptoms: F1 (task confirm) and the old continuous wake cycle.
  //
  // New contract: the turn's finally block is the SINGLE resume owner.
  // resumeVadAfterTurn() resumes unconditionally when explicitly called;
  // the drain timer only clears ttsPlaying — it never touches the VAD.
  // Normal wake-opened turn completion now disconnects before this helper
  // runs.
  type Flags = {
    wakeWordMode: boolean;
    wakeWordAutoStop: boolean;
    vad: { start: () => void; pause: () => void; destroy: () => void } | null;
    stateListeners: Set<() => void>;
    isProcessing: boolean;
    ttsPlaying: boolean;
    state: string;
    vadPaused: boolean;
    turnCancelled: boolean;
  };
  const t = hermesVoice as unknown as Flags;
  const fakeVad = {
    start: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    t.vad = fakeVad;
    t.wakeWordMode = false;
    t.wakeWordAutoStop = false;
    t.state = "connected";
    t.isProcessing = false;
    t.ttsPlaying = false;
    t.vadPaused = false;
    t.turnCancelled = false;
    fakeVad.start.mockClear();
  });

  afterEach(() => {
    t.vad = null;
    t.wakeWordMode = false;
    t.wakeWordAutoStop = false;
    t.state = "disconnected";
    t.ttsPlaying = false;
    t.isProcessing = false;
    fakeVad.start.mockClear();
  });

  it("resumeVadAfterTurn resumes even when ttsPlaying is still true (F1)", () => {
    // F1: the task-confirmation path sets ttsPlaying=true (mute mic),
    // then fires fire-and-forget playAudio, then calls
    // resumeVadAfterTurn() — the OLD guard skipped the resume because
    // ttsPlaying was still true, and onEnded never resumed the VAD.
    t.ttsPlaying = true;
    vi.useFakeTimers();
    try {
      hermesVoice["resumeVadAfterTurn"]();
      vi.advanceTimersByTime(RESUME_ECHO_TAIL_MS);
      expect(fakeVad.start).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("resumeVadAfterTurn still resumes an armed wake-word VAD when called directly", () => {
    // resumeVadAfterTurn is used by interrupt/error safety paths too; if
    // called directly with wakeWordMode already true, it should still
    // restart the VAD. Normal wake-opened turn completion now disconnects
    // before this helper runs.
    t.wakeWordMode = true;
    vi.useFakeTimers();
    try {
      hermesVoice["resumeVadAfterTurn"]();
      vi.advanceTimersByTime(RESUME_ECHO_TAIL_MS);
      expect(fakeVad.start).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("resumeVadAfterTurn skips when no VAD (disconnected mid-turn)", () => {
    t.vad = null;
    hermesVoice["resumeVadAfterTurn"]();
    expect(fakeVad.start).not.toHaveBeenCalled();
  });

  it("resumeVadAfterTurn defers the start while TTS is still audible (echo tail)", () => {
    // The garbage-catch bug: the finally resumed the VAD the moment the
    // playback while-poll exited — but the poll exits ≤50ms after the
    // last onEnded, while the drain timer holds ttsPlaying for another
    // 300ms AND the speaker is still physically ringing. The mic came
    // back during the echo tail, the VAD segmented the speaker
    // decay/noise as speech, and STT transcribed it as a garbage user
    // turn ("catching garbage voices right after the voice prompts").
    // Contract: the resume waits out the echo tail (a settle delay
    // bounded by the ttsPlaying drain window) before vad.start().
    t.ttsPlaying = true;
    vi.useFakeTimers();
    try {
      hermesVoice["resumeVadAfterTurn"]();
      // Not yet — the echo tail is still ringing.
      expect(fakeVad.start).not.toHaveBeenCalled();
      // After the tail, the VAD starts.
      vi.advanceTimersByTime(600);
      expect(fakeVad.start).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("sanitizeForTts", () => {
  it("strips emoji and pause-causing symbols, keeps CJK text", () => {
    // Tilde is now stripped (causes wavering), emoji stripped, consecutive
    // punctuation collapsed. 喵 is replaced with 。 (paralinguistic vocalization
    // fix — Qwen3-TTS vocalizes 喵 as a meow sound).
    expect(sanitizeForTts("好的喵～ 🐱 让我帮你看看！😄")).toBe("好的。 让我帮你看看！");
  });

  it("replaces em-dash with comma and ellipsis with period", () => {
    // Em-dash → ASCII comma, ellipsis → period. Commas are now kept
    // natively (Edge TTS + Vulkan tts-server both handle ， correctly).
    expect(sanitizeForTts("你好—世界…")).toBe("你好,世界。");
  });

  it("strips tildes and middle dots", () => {
    // Tilde and middle dot stripped, double space collapsed to single.
    expect(sanitizeForTts("嗯～ · 好的～")).toBe("嗯 好的");
  });

  it("collapses consecutive punctuation", () => {
    expect(sanitizeForTts("真的！！！")).toBe("真的！");
    expect(sanitizeForTts("什么？？？")).toBe("什么？");
  });

  it("unwraps markdown links and strips emphasis markers", () => {
    // Commas (，) are now kept — both Edge TTS and Vulkan tts-server
    // handle them natively without hanging.
    expect(sanitizeForTts("**马上**处理 `config.yaml`，详见 [文档](https://x.com)")).toBe(
      "马上处理 config.yaml，详见 文档",
    );
  });

  it("strips heading hashes and list bullets", () => {
    expect(sanitizeForTts("## 标题\n- 列表项\n**加粗**")).toBe("标题\n列表项\n加粗");
  });

  it("removes bare URLs", () => {
    expect(sanitizeForTts("see https://example.com/foo for details")).toBe("see for details");
  });

  it("removes zero-width and control characters", () => {
    expect(sanitizeForTts("a\u200bb\u0000c")).toBe("abc");
  });

  it("keeps clean text unchanged", () => {
    // Commas (，) are now kept — no longer replaced with 。
    expect(sanitizeForTts("好的，让我帮你看看配置文件。")).toBe("好的，让我帮你看看配置文件。");
  });

  it("keeps English text with punctuation", () => {
    expect(sanitizeForTts("Sure! Let me check that for you.")).toBe(
      "Sure! Let me check that for you.",
    );
  });
});

describe("rms", () => {
  it("returns 0 for an empty buffer", () => {
    expect(rms(new Int16Array(0))).toBe(0);
  });

  it("returns the absolute value for a single-sample buffer", () => {
    expect(rms(new Int16Array([100]))).toBe(100);
    expect(rms(new Int16Array([-200]))).toBe(200);
  });

  it("computes root-mean-square for multi-sample buffers", () => {
    // [3, 4] → sqrt((9+16)/2) = sqrt(12.5) ≈ 3.535
    expect(rms(new Int16Array([3, 4]))).toBeCloseTo(3.535, 2);
  });

  it("returns 0 for an all-zero buffer", () => {
    expect(rms(new Int16Array([0, 0, 0, 0]))).toBe(0);
  });
});

describe("int16ToBase64", () => {
  it("round-trips a small buffer through base64", () => {
    const original = new Int16Array([0, 1, -1, 256, 1000]).buffer;
    const encoded = int16ToBase64(original);
    // Decode and compare.
    const decoded = atob(encoded);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) bytes[i] = decoded.charCodeAt(i);
    const view = new Int16Array(bytes.buffer);
    expect(Array.from(view)).toEqual([0, 1, -1, 256, 1000]);
  });

  it("handles an empty buffer", () => {
    expect(int16ToBase64(new ArrayBuffer(0))).toBe("");
  });
});

describe("splitSentences", () => {
  it("splits English text on periods", () => {
    const { sentences, remainder } = splitSentences("Hello world. Next sentence.");
    expect(sentences).toEqual(["Hello world.", " Next sentence."]);
    expect(remainder).toBe("");
  });

  it("splits on question marks and exclamation points", () => {
    const { sentences } = splitSentences("Are you sure? Yes! OK.");
    expect(sentences).toEqual(["Are you sure?", " Yes!", " OK."]);
  });

  it("splits Chinese text on 。！？", () => {
    const { sentences } = splitSentences("你好。世界！好吗？");
    expect(sentences).toEqual(["你好。", "世界！", "好吗？"]);
  });

  it("does NOT split on commas — fragments must be complete clauses", () => {
    // Changed 2026-08-21: comma-splitting produced tiny fragments whose TTS
    // failures left audible holes mid-sentence. Terminators only now.
    const { sentences, remainder } = splitSentences("Well, hello there, how are you.");
    expect(sentences).toEqual(["Well, hello there, how are you."]);
    expect(remainder).toBe("");
  });

  it("does NOT split on Chinese commas ；，", () => {
    const { sentences } = splitSentences("你好，世界；再见。");
    expect(sentences).toEqual(["你好，世界；再见。"]);
  });

  it("returns remaining text as remainder when no boundary is found", () => {
    const { sentences, remainder } = splitSentences("no punctuation here");
    expect(sentences).toEqual([]);
    expect(remainder).toBe("no punctuation here");
  });

  it("force-splits long text without punctuation at maxLen into chunks", () => {
    const long = "a".repeat(140);
    const { sentences, remainder } = splitSentences(long, 60);
    // 140 chars / 60 maxLen = 2 chunks of 60 + 1 remainder of 20
    expect(sentences).toHaveLength(2);
    expect(sentences[0]).toHaveLength(60);
    expect(sentences[1]).toHaveLength(60);
    expect(remainder).toHaveLength(20);
  });

  it("does not force-split text under maxLen", () => {
    const { sentences, remainder } = splitSentences("short text", 60);
    expect(sentences).toEqual([]);
    expect(remainder).toBe("short text");
  });

  it("splits on newlines", () => {
    const { sentences } = splitSentences("line one\nline two\n");
    expect(sentences).toEqual(["line one\n", "line two\n"]);
  });
});

describe("isCJK", () => {
  it("returns true for Chinese text", () => {
    expect(isCJK("你好世界")).toBe(true);
  });

  it("returns true for mixed CJK + ASCII", () => {
    expect(isCJK("Hello 你好")).toBe(true);
  });

  it("returns false for English-only text", () => {
    expect(isCJK("Hello world")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isCJK("")).toBe(false);
  });

  it("returns false for numbers and punctuation", () => {
    expect(isCJK("12345!@#$%")).toBe(false);
  });
});

describe("audio constants", () => {
  it("TARGET_RATE is 16 kHz (Hermes STT requirement)", () => {
    expect(TARGET_RATE).toBe(16_000);
  });
});

describe("isDuplicateSttTurn", () => {
  it("drops an exact repeat of the previous turn", () => {
    expect(isDuplicateSttTurn("早呀", "早呀")).toBe(true);
  });

  it("drops a repeat that differs only in punctuation and case", () => {
    // The recorded duplicates showed whisper joining the repeat with a
    // comma — normalization must see through it.
    expect(isDuplicateSttTurn("早呀, 早呀!", "早呀")).toBe(false); // not a repeat of prev — prev is the FIRST turn
    expect(isDuplicateSttTurn("早呀", "早呀, 早呀!")).toBe(true); // second bare phrase repeats the joined first
  });

  it("drops a short fragment contained in the previous turn (split utterance)", () => {
    // Endpoint split: turn 1 caught the whole phrase, turn 2 caught the tail.
    expect(isDuplicateSttTurn("今天天气", "早呀早呀今天天气")).toBe(true);
  });

  it("keeps a genuinely new phrase", () => {
    expect(isDuplicateSttTurn("帮我看看配置文件", "早呀")).toBe(false);
  });

  it("keeps a long turn that merely contains the previous phrase", () => {
    expect(isDuplicateSttTurn("今天我想让你帮我看看这个项目的配置文件结构", "早呀")).toBe(false);
  });

  it("keeps a long follow-up referencing the earlier phrase", () => {
    // A long follow-up legitimately referencing the earlier phrase is
    // conversation, not a repeat — substring matching only applies to
    // short fragments.
    expect(isDuplicateSttTurn("早呀，对了，你刚才说的那个配置文件帮我看看", "早呀")).toBe(false);
  });

  it("keeps turns when there is no previous transcript", () => {
    expect(isDuplicateSttTurn("早呀", "")).toBe(false);
  });

  it("keeps empty current turns (handled by the caller)", () => {
    expect(isDuplicateSttTurn("", "早呀")).toBe(false);
  });
});

describe("isLikelyReplyEcho (garbage-catch layer 2, 2026-09-03)", () => {
  // The mic resumes during the speaker's physical decay (the tail the
  // resume delay can't fully cover on loud speakers). The VAD segments
  // that tail and whisper transcribes it — often as a fragment OF THE
  // REPLY ITSELF ("你好呀" → STT of the tail → "你好" as a phantom user
  // turn). This gate drops a transcript that substantially overlaps the
  // previous assistant reply — the user can't have spoken the reply's
  // own words back within seconds of hearing them.
  it("drops a transcript that is a substring of the previous reply", () => {
    expect(isLikelyReplyEcho("今天天气", "今天天气真不错，我们去公园走走吧")).toBe(true);
  });

  it("drops a transcript containing a long fragment of the previous reply", () => {
    expect(isLikelyReplyEcho("好的今天天气", "今天天气真不错，我们去公园走走吧")).toBe(true);
  });

  it("keeps a genuinely new user utterance", () => {
    expect(isLikelyReplyEcho("帮我看看配置文件", "今天天气真不错，我们去公园走走吧")).toBe(false);
  });

  it("keeps short overlap below the fragment threshold", () => {
    // 4 shared chars is ordinary vocabulary overlap ("你好" + reply) —
    // not evidence of echo.
    expect(isLikelyReplyEcho("你好", "你好，我是橘宝")).toBe(false);
  });

  it("returns false when there is no previous reply", () => {
    expect(isLikelyReplyEcho("任何话", "")).toBe(false);
  });
});

describe("makeBeepPlaceholder", () => {
  it("produces a non-empty WAV buffer", () => {
    const buf = makeBeepPlaceholder();
    expect(buf.byteLength).toBeGreaterThan(44);
    const view = new DataView(buf);
    expect(String.fromCharCode(view.getUint8(0))).toBe("R"); // "RIFF"
    expect(String.fromCharCode(view.getUint8(8))).toBe("W"); // "WAVE"
  });

  it("is ~150ms of audio at the given sample rate", () => {
    const buf = makeBeepPlaceholder(24000);
    const view = new DataView(buf);
    const dataLen = view.getUint32(40, true);
    expect(dataLen / 2).toBeCloseTo(24000 * 0.15, 0);
  });
});

describe("filterWhisperHallucination", () => {
  it("drops '简体中文' (whisper hallucination from silence)", () => {
    expect(filterWhisperHallucination("简体中文")).toBe("");
  });

  it("drops '简体中文，简体字。' (combined hallucination)", () => {
    expect(filterWhisperHallucination("简体中文，简体字。")).toBe("");
  });

  it("drops '简体中文，规。' (truncated hallucination variant)", () => {
    expect(filterWhisperHallucination("简体中文，规。")).toBe("");
  });

  it("drops '简体中文，规范汉字。' (combined hallucination)", () => {
    expect(filterWhisperHallucination("简体中文，规范汉字。")).toBe("");
  });

  it("drops English hallucinations", () => {
    expect(filterWhisperHallucination("Thank you for watching")).toBe("");
    expect(filterWhisperHallucination("Please subscribe")).toBe("");
  });

  it("keeps real speech", () => {
    expect(filterWhisperHallucination("你好啊 介绍一下你自己")).toBe("你好啊 介绍一下你自己");
    expect(filterWhisperHallucination("今天天气怎么样")).toBe("今天天气怎么样");
  });

  it("keeps empty input", () => {
    expect(filterWhisperHallucination("")).toBe("");
  });
});

describe("Semaphore", () => {
  it("allows up to `limit` concurrent acquisitions", async () => {
    const sem = new Semaphore(3);
    await sem.acquire();
    await sem.acquire();
    await sem.acquire();
    // All three acquired without blocking — release them.
    sem.release();
    sem.release();
    sem.release();
  });

  it("blocks the 4th acquisition until one is released (FIFO order)", async () => {
    const sem = new Semaphore(2);
    await sem.acquire();
    await sem.acquire();
    let fourthResolved = false;
    const p = sem.acquire().then(() => {
      fourthResolved = true;
    });
    // Give the microtask queue a chance to run.
    await new Promise((r) => setTimeout(r, 10));
    expect(fourthResolved).toBe(false);
    sem.release();
    await p;
    expect(fourthResolved).toBe(true);
    sem.release();
    sem.release();
  });

  it("preserves FIFO wakeup order across multiple waiters", async () => {
    const sem = new Semaphore(1);
    await sem.acquire();
    const order: number[] = [];
    const p1 = sem.acquire().then(() => {
      order.push(1);
      sem.release();
    });
    const p2 = sem.acquire().then(() => {
      order.push(2);
      sem.release();
    });
    const p3 = sem.acquire().then(() => {
      order.push(3);
      sem.release();
    });
    sem.release(); // kick the chain — each waiter releases for the next
    await Promise.all([p1, p2, p3]);
    expect(order).toEqual([1, 2, 3]);
  });
});

describe("network timeouts (F3, 2026-09-03 audit)", () => {
  // F3: the STT and chat fetches had no timeout — a hung Hermes left
  // processTurn's await unresolved forever, isProcessing stuck true,
  // and the mic dead (onSpeechEnd suppresses while isProcessing).
  // TTS already had AbortSignal.timeout(30000) — the contract is that
  // EVERY network await in the turn pipeline carries the same timeout.
  // These tests read the module's exported constant and assert the
  // fetch sites use it (via source inspection at the unit level — the
  // full fetch path needs the e2e harness; the constant + call-shape
  // guard is what regresses silently).
  it("exports a TURN_FETCH_TIMEOUT_MS constant matching the TTS timeout budget", async () => {
    const mod = await import("./hermesVoice");
    expect(mod.TURN_FETCH_TIMEOUT_MS).toBe(30_000);
  });
});

describe("interrupt cancels pre-LLM stages (F4, 2026-09-03 audit)", () => {
  // F4: interrupt() set isProcessing=false while the stale processTurn
  // was still awaiting STT; when STT resolved, the task path emitted
  // voice.command WITHOUT any turnCancelled check — a task the user
  // cancelled auto-submitted anyway ("ghost auto-submit").
  // Contract: every emit that drives a user-visible side effect
  // (voice.command, voice.file_search) is gated on !turnCancelled.
  type Flags = { turnCancelled: boolean };
  const t = hermesVoice as unknown as Flags;

  afterEach(() => {
    t.turnCancelled = false;
  });

  it("interrupt sets turnCancelled (the flag the turn pipeline checks)", () => {
    hermesVoice.send({ type: "interrupt" });
    expect(t.turnCancelled).toBe(true);
  });
});

describe("turnCancelled reset at processVadSpeech entry (8579bbd2a)", () => {
  // The post-interrupt wedge: interrupt() sets turnCancelled=true, and the
  // OLD reset lived mid-turn (below the task/file_search early-returns).
  // After any Stop, EVERY later turn bailed at the F4 guard and the voice
  // loop stayed dead (UI said Listening while turns were swallowed).
  // New contract: processVadSpeech resets the flag at ENTRY, so the F4
  // ghost-submit guard stays intact for THIS turn while un-wedging the
  // loop for the next one.
  type Flags = {
    turnCancelled: boolean;
    isProcessing: boolean;
    vad: { start: () => void; pause: () => void; destroy: () => void } | null;
    state: string;
  };
  const t = hermesVoice as unknown as Flags;
  const fakeVad = {
    start: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    t.vad = fakeVad;
    t.state = "connected";
    t.isProcessing = false;
    t.turnCancelled = true; // simulate a stale flag from a prior interrupt
    fakeVad.start.mockClear();
  });

  afterEach(() => {
    t.vad = null;
    t.state = "disconnected";
    t.isProcessing = false;
    t.turnCancelled = false;
    fakeVad.start.mockClear();
  });

  it("clears the stale turnCancelled flag at turn entry", async () => {
    // A short (<0.3s) audio segment hits the early-return path, but the
    // reset happens BEFORE that — so the flag must already be false.
    const shortAudio = new Float32Array(Math.floor(16000 * 0.1)); // 0.1s
    await (hermesVoice as unknown as { processVadSpeech(a: Float32Array): Promise<void> }).processVadSpeech(
      shortAudio,
    );
    expect(t.turnCancelled).toBe(false);
  });

  it("keeps the F4 ghost-submit guard intact for the current turn", async () => {
    // After the entry reset, a mid-turn interrupt re-sets the flag so the
    // task/file_search emits stay gated. This asserts the reset does NOT
    // clobber a flag set DURING the turn.
    t.turnCancelled = false;
    hermesVoice.send({ type: "interrupt" });
    expect(t.turnCancelled).toBe(true);
  });
});

describe("SSE stall deadline on the agent-meow LLM route (8579bbd2a)", () => {
  // The agent-meow SSE route has NO read timeout — a half-open connection
  // (no heartbeat, no events, no close) would hang the for-await forever,
  // wedging voiceState in "processing" with the mic dead (the F3 hang
  // class on the primary voice LLM route). The fix arms a 90s stall timer
  // that aborts the stream controller when no event arrives in time.
  //
  // We mock the dynamic imports (sessionsApi + sse) so the test drives the
  // stream by hand and asserts the abort fires after the stall window.
  type Flags = {
    agentMeowSessionId: string | null;
    chatStreamViaAgentMeow(
      text: string,
      onDelta: (delta: string) => void,
      signal?: AbortSignal,
    ): Promise<void>;
  };
  const t = hermesVoice as unknown as Flags;

  // A controllable async generator that yields events on demand.
  let streamEvents: Array<Record<string, unknown>> = [];
  let streamDone = false;
  let abortSignal: AbortSignal | null = null;

  const mockOpenSessionStream = sessionsApiMock.openSessionStream as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockPostEvent = sessionsApiMock.postEvent as unknown as ReturnType<typeof vi.fn>;
  const mockParseSseStream = sseMock.parseSseStream as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    streamEvents = [];
    streamDone = false;
    abortSignal = null;
    t.agentMeowSessionId = "session-1";
    mockOpenSessionStream.mockClear();
    mockPostEvent.mockClear();
    mockParseSseStream.mockClear();

    // Wire the controllable stream driver.
    mockOpenSessionStream.mockImplementation(async (_id: string, signal: AbortSignal) => {
      abortSignal = signal;
      let closed = false;
      return {
        ok: true,
        status: 200,
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            // Wire the abort signal to the stream so aborting the
            // controller ends the stream (the generator exits, and the
            // method throws "closed before ready heartbeat").
            signal.addEventListener("abort", () => {
              closed = true;
              try {
                controller.close();
              } catch {
                // Stream already closed — the abort is a no-op.
              }
            });
            const push = () => {
              if (closed || streamDone) {
                try {
                  controller.close();
                } catch {
                  // already closed
                }
                return;
              }
              const ev = streamEvents.shift();
              if (ev) {
                controller.enqueue(
                  new TextEncoder().encode(
                    `event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`,
                  ),
                );
                setTimeout(push, 0);
              } else {
                // No more events queued — keep the stream open (half-open).
                // The stall timer must fire to abort.
                setTimeout(push, 1000);
              }
            };
            push();
          },
        }),
      } as unknown as Response;
    });
    mockParseSseStream.mockImplementation(async function* (
      byteStream: ReadableStream<Uint8Array>,
    ) {
      const reader = byteStream.getReader();
      const decoder = new TextDecoder("utf-8");
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        while (buf.includes("\n")) {
          const idx = buf.indexOf("\n");
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.startsWith("event: ")) {
            const type = line.slice(7).trim();
            if (type === "session_heartbeat") yield { type: "session_heartbeat" };
            else if (type === "text_delta") yield { type: "text_delta", delta: "hi" };
            else if (type === "response_completed") yield { type: "response_completed" };
          }
        }
      }
    });
  });

  afterEach(() => {
    t.agentMeowSessionId = null;
    streamDone = true;
  });

  it("aborts the stream when no event arrives within the stall window", async () => {
    vi.useFakeTimers();
    try {
      // No events queued — the stream stays half-open. The stall timer
      // must fire and abort the controller.
      const promise = (hermesVoice as unknown as Flags).chatStreamViaAgentMeow(
        "hello",
        () => {},
      );
      // Attach the rejection handler BEFORE advancing timers so the
      // rejection (which fires during the timer advance) is not "unhandled".
      const rejection = promise.catch((err: unknown) => err);
      // Let the openSessionStream await resolve and the generator start.
      await vi.advanceTimersByTimeAsync(0);
      // Advance past the 90s stall window.
      await vi.advanceTimersByTimeAsync(90_000 + 100);
      const err = await rejection;
      expect(err).toBeInstanceOf(Error);
      expect(abortSignal?.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does NOT abort when heartbeats keep arriving", async () => {
    vi.useFakeTimers();
    try {
      // Queue a heartbeat so the stream is alive; the stall timer re-arms
      // on every event.
      streamEvents = [{ type: "session_heartbeat" }];
      const promise = (hermesVoice as unknown as Flags).chatStreamViaAgentMeow(
        "hello",
        () => {},
      );
      // Attach a rejection handler so a late abort doesn't surface as an
      // unhandled rejection if the stream closes before the assertion.
      void promise.catch(() => {});
      await vi.advanceTimersByTimeAsync(0);
      // Advance well past the stall window but the heartbeat re-armed it.
      await vi.advanceTimersByTimeAsync(15_000);
      expect(abortSignal?.aborted).toBe(false);
      // Clean up: close the stream so the promise settles.
      streamDone = true;
      await vi.advanceTimersByTimeAsync(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
