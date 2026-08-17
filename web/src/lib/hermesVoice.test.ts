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
  TARGET_RATE,
  int16ToBase64,
  isCJK,
  rms,
  splitSentences,
} from "./hermesVoice";

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

  it("splits on commas for faster first-audio", () => {
    const { sentences } = splitSentences("Well, hello there, how are you.");
    expect(sentences).toEqual(["Well,", " hello there,", " how are you."]);
  });

  it("splits on Chinese commas ；，", () => {
    const { sentences } = splitSentences("你好，世界；再见。");
    expect(sentences).toEqual(["你好，", "世界；", "再见。"]);
  });

  it("returns remaining text as remainder when no boundary is found", () => {
    const { sentences, remainder } = splitSentences("no punctuation here");
    expect(sentences).toEqual([]);
    expect(remainder).toBe("no punctuation here");
  });

  it("force-splits long text without punctuation at maxLen", () => {
    const long = "a".repeat(80);
    const { sentences, remainder } = splitSentences(long, 60);
    expect(sentences).toHaveLength(1);
    expect(sentences[0]).toBe(long);
    expect(remainder).toBe("");
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

  it("ENDPOINT_THRESHOLD_RATIO is between 0 and 1", () => {
    expect(ENDPOINT_THRESHOLD_RATIO).toBeGreaterThan(0);
    expect(ENDPOINT_THRESHOLD_RATIO).toBeLessThan(1);
  });
});