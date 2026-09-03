// Tests for the wake-word list + matcher (web/src/lib/wakeWords.ts).
//
// Pins the contract the wake gate depends on:
// - The canonical words (橘宝 incl. traditional, 橘猫 the orange-cat
//   alternative, the jubao transliteration) MUST stay matched.
// - The whisper homophone list (继绞/拘保/据报/去保/去吧/…) MUST stay —
//   these are what faster-whisper actually emitted for "橘宝" in live
//   testing; removing one silently breaks wake-word detection for that
//   pronunciation.
// - Matching is lowercase substring (not exact-equality) so "橘宝在呢"
//   and "hey jubao" both trigger.

import { describe, expect, it } from "vitest";

import { WAKE_WORDS, containsWakeWord } from "./wakeWords";

describe("containsWakeWord", () => {
  it("matches the canonical wake word 橘宝", () => {
    expect(containsWakeWord("橘宝")).toBe(true);
    expect(containsWakeWord("橘宝在呢")).toBe(true);
    expect(containsWakeWord("嘿，橘宝！")).toBe(true);
  });

  it("matches the traditional form 橘寶", () => {
    expect(containsWakeWord("橘寶")).toBe(true);
  });

  it("matches the orange-cat alternative 橘猫 / 橘貓", () => {
    expect(containsWakeWord("橘猫")).toBe(true);
    expect(containsWakeWord("橘貓")).toBe(true);
    expect(containsWakeWord("橘猫橘猫")).toBe(true);
  });

  it("matches the jubao transliteration (case-insensitive)", () => {
    expect(containsWakeWord("jubao")).toBe(true);
    expect(containsWakeWord("Jubao")).toBe(true);
    expect(containsWakeWord("hey jubao")).toBe(true);
  });

  it("matches the observed whisper homophones", () => {
    // Each of these is a transcription faster-whisper actually produced
    // for spoken 橘宝 in live sessions. Removing any from WAKE_WORDS
    // re-breaks that pronunciation.
    for (const homophone of ["继绞", "拘保", "据报", "去保", "去吧", "主宝", "与宝", "舉寶"]) {
      expect(containsWakeWord(homophone), homophone).toBe(true);
      expect(WAKE_WORDS).toContain(homophone);
    }
  });

  it("does NOT match ordinary speech without a wake word", () => {
    expect(containsWakeWord("今天天气怎么样")).toBe(false);
    expect(containsWakeWord("hello")).toBe(false);
    expect(containsWakeWord("")).toBe(false);
    // Near-miss vocabulary that must not false-trigger:
    expect(containsWakeWord("橘子")).toBe(false);
    expect(containsWakeWord("熊猫")).toBe(false);
    expect(containsWakeWord("report")).toBe(false);
  });

  it("matches when the wake word is embedded in a longer utterance", () => {
    // The real usage: the wake word is the START of a command sentence.
    expect(containsWakeWord("橘宝帮我查一下天气")).toBe(true);
    expect(containsWakeWord("橘猫，打开终端")).toBe(true);
  });
});