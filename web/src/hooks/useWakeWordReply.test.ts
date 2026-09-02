// Tests for useWakeWordReply — the browser SpeechSynthesis wake-word ack.
//
// H1 (2026-09-03 audit): playReply() resolved only via utterance
// onend/onerror. Chrome has documented cases where neither fires
// (speechSynthesis.cancel() immediately before speak(), backgrounded
// tabs, voices not yet loaded) — the promise never settled, the ack
// sequencer in NewChatDialog never reached stopWakeWordModeForTurn,
// and vadPaused stayed true → mic dead after one ack. The contract
// now: a watchdog resolves the promise even when SpeechSynthesis
// never settles.

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWakeWordReply, WAKE_REPLY_TIMEOUT_MS } from "./useWakeWordReply";

type UtteranceCallbacks = {
  onend?: () => void;
  onerror?: () => void;
};

let lastUtterance: (SpeechSynthesisUtterance & UtteranceCallbacks) | null = null;
let speakSpied = vi.fn();

class FakeSpeechSynthesisUtterance {
  lang = "";
  rate = 1;
  pitch = 1;
  voice: unknown = null;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

function installSpeechSynthesis(): void {
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      cancel: vi.fn(),
      speak: (u: SpeechSynthesisUtterance & UtteranceCallbacks) => {
        lastUtterance = u as SpeechSynthesisUtterance & UtteranceCallbacks;
        speakSpied(u);
      },
      getVoices: vi.fn(() => []),
    },
  });
  vi.stubGlobal("SpeechSynthesisUtterance", FakeSpeechSynthesisUtterance);
}

beforeEach(() => {
  vi.useFakeTimers();
  lastUtterance = null;
  speakSpied = vi.fn();
  installSpeechSynthesis();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.unstubAllGlobals();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test cleanup of a window-level stub
  delete (window as any).speechSynthesis;
});

describe("useWakeWordReply — ack watchdog (H1)", () => {
  it("resolves when onend fires (normal path)", async () => {
    const { result } = renderHook(() => useWakeWordReply({ enabled: true }));
    const promise = result.current.playReply();
    // The speak call is sync inside the hook; flush microtasks.
    await vi.advanceTimersByTimeAsync(0);
    expect(lastUtterance).not.toBeNull();
    lastUtterance!.onend?.();
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves via the watchdog when onend/onerror NEVER fire (H1)", async () => {
    const { result } = renderHook(() => useWakeWordReply({ enabled: true }));
    const promise = result.current.playReply();
    await vi.advanceTimersByTimeAsync(0);
    expect(speakSpied).toHaveBeenCalled();
    // Neither onend nor onerror fires — the Chrome stuck-speech case.
    // The watchdog must settle the promise instead of hanging forever.
    await vi.advanceTimersByTimeAsync(WAKE_REPLY_TIMEOUT_MS + 100);
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves immediately when speechSynthesis is unavailable", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).speechSynthesis;
    const { result } = renderHook(() => useWakeWordReply({ enabled: true }));
    const promise = result.current.playReply();
    await expect(promise).resolves.toBeUndefined();
  });
});