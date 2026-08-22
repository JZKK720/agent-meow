// Regression tests for hermesVoice.ts pure helpers.
//
// Covers the functions that were fixed in the 2026-08-16 session:
//   - rms() — RMS energy calculation
//   - int16ToBase64() — base64 encoding of PCM audio
//   - splitSentences() — sentence/phrase boundary splitting (CJK + ASCII)
//   - isCJK() — CJK character detection for TTS language routing
//   - Constants: TARGET_RATE, ENDPOINT_SILENCE_CHUNKS, ENDPOINT_THRESHOLD_RATIO
//
// The transport class itself (connect/processTurn/synthesize) requires
// AudioContext + fetch mocking and is covered by e2e_ui voice tests; these
// unit tests guard the pure logic that is easy to regress silently.

import { describe, expect, it } from "vitest";
import {
  ENDPOINT_SILENCE_CHUNKS,
  ENDPOINT_THRESHOLD_RATIO,
  Semaphore,
  TARGET_RATE,
  int16ToBase64,
  isCJK,
  isDuplicateSttTurn,
  makeBeepPlaceholder,
  rms,
  sanitizeForTts,
  splitSentences,
} from "./hermesVoice";

describe("sanitizeForTts", () => {
  it("strips emoji but keeps CJK text and prosody marks", () => {
    expect(sanitizeForTts("好的喵～ 🐱 让我帮你看看！😄")).toBe("好的喵～ 让我帮你看看！");
  });

  it("unwraps markdown links and strips emphasis markers", () => {
    expect(sanitizeForTts("**马上**处理 `config.yaml`，详见 [文档](https://x.com)")).toBe(
      "马上处理 config.yaml，详见 文档",
    );
  });

  it("strips heading hashes and list bullets", () => {
    expect(sanitizeForTts("## 标题\n- 列表项\n**加粗**")).toBe("标题\n列表项\n加粗");
  });

  it("removes bare URLs", () => {
    expect(sanitizeForTts("see https://example.com/foo for details")).toBe(
      "see for details",
    );
  });

  it("removes zero-width and control characters", () => {
    expect(sanitizeForTts("a\u200bb\u0000c")).toBe("abc");
  });

  it("keeps clean text unchanged", () => {
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
  it("ENDPOINT_SILENCE_CHUNKS is at least 10 (~1s of silence)", () => {
    expect(ENDPOINT_SILENCE_CHUNKS).toBeGreaterThanOrEqual(10);
  });

  it("ENDPOINT_SILENCE_CHUNKS tolerates mid-utterance pauses (~2s)", () => {
    // 14 chunks (~1.4s) split one utterance into two turns — the user
    // repeated themselves and the transcript recorded "phrase,phrase".
    expect(ENDPOINT_SILENCE_CHUNKS).toBeGreaterThanOrEqual(20);
  });

  it("ENDPOINT_THRESHOLD_RATIO is between 0 and 1", () => {
    expect(ENDPOINT_THRESHOLD_RATIO).toBeGreaterThan(0);
    expect(ENDPOINT_THRESHOLD_RATIO).toBeLessThan(1);
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
    const p1 = sem.acquire().then(() => { order.push(1); sem.release(); });
    const p2 = sem.acquire().then(() => { order.push(2); sem.release(); });
    const p3 = sem.acquire().then(() => { order.push(3); sem.release(); });
    sem.release(); // kick the chain — each waiter releases for the next
    await Promise.all([p1, p2, p3]);
    expect(order).toEqual([1, 2, 3]);
  });
});