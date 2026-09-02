// Regression tests: the wake-word detector must NEVER pull the microphone
// outside an active, user-gesture-granted VAD connection.
//
// Root cause of the "constantly pulling the MIC" bug (2026-09-02): when the
// VAD was NOT connected, useWakeWordDetector's fallback effect started a
// background Web Speech API SpeechRecognition (or server DictationSession)
// the moment the detector was enabled — which happens on the landing surface
// via the ComposerMicButton wake-gate path. SpeechRecognition.acquire = the
// browser's mic-usage indicator turns on with no visible "listening" UI, so
// the mic looked hijacked. The product rule is: the mic is only ever pulled
// by the Silero VAD after an explicit user gesture (paw/mic click); wake
// word detection is a MODE of that VAD, never an independent mic consumer.
//
// The discriminating assertions:
//   1. Detector enabled with the VAD disconnected → no Web Speech
//      recognition is started, no server dictation take is opened
//      (mic stays free).
//   2. Detector enabled with the VAD connected → VAD wake-word mode is
//      armed (startWakeWordMode), and no fallback consumer races it.
//   3. Detector disabled → stopWakeWordMode is called (gate released).
//   4. A wake.word event from the transport fires onWakeWord.

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Transport mock (vi.hoisted — vi.mock factories are hoisted) ───────────
type EventListener = (event: { type: string }) => void;

const mockTransport = vi.hoisted(() => {
  const listeners = new Set<EventListener>();
  const stateListeners = new Set<() => void>();
  return {
    _state: "disconnected" as string,
    _isWakeWordOnly: false,
    getState: () => mockTransport._state,
    get isWakeWordOnly() {
      return mockTransport._isWakeWordOnly;
    },
    subscribeEvents: (cb: EventListener) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    // The detector tracks the transport's connection lifecycle via this
    // subscription (it must arm on a LATE connect, not just mount-time).
    subscribeState: (cb: () => void) => {
      stateListeners.add(cb);
      return () => stateListeners.delete(cb);
    },
    emitState() {
      for (const l of stateListeners) l();
    },
    setState(s: string) {
      mockTransport._state = s;
      mockTransport.emitState();
    },
    emitEvent: (event: { type: string }) => {
      for (const l of listeners) l(event);
    },
    startWakeWordMode: vi.fn(),
    stopWakeWordMode: vi.fn(),
    stopWakeWordModeForTurn: vi.fn(),
    pauseVad: vi.fn(),
    resumeVad: vi.fn(),
    reset() {
      listeners.clear();
      stateListeners.clear();
      mockTransport._isWakeWordOnly = false;
      mockTransport.startWakeWordMode.mockClear();
      mockTransport.stopWakeWordMode.mockClear();
      mockTransport.stopWakeWordModeForTurn.mockClear();
      mockTransport.pauseVad.mockClear();
      mockTransport.resumeVad.mockClear();
    },
  };
});

vi.mock("@/lib/hermesVoice", () => ({ hermesVoice: mockTransport }));
vi.mock("@/lib/wakeWords", () => ({
  WAKE_WORDS: ["橘宝"],
  containsWakeWord: (t: string) => t.includes("橘宝"),
}));

// Web Speech API: deliberately NOT installed (undefined constructor) so any
// attempt to start it must route through the guarded fallback path. The
// detector's guard must stop it BEFORE reaching DictationSession.start()
// (which would acquire the mic).
vi.stubGlobal("SpeechRecognition", undefined);
vi.stubGlobal("webkitSpeechRecognition", undefined);

// Server dictation: if anything tries to open a take, fail the test loudly.
const dictationStartSpy = vi.hoisted(() =>
  vi.fn(async () => {
    throw new Error("BUG: detector opened a server dictation take (mic pull outside VAD)");
  }),
);
vi.mock("@/lib/dictation", () => ({
  DictationSession: { start: dictationStartSpy },
  DictationBusyError: class extends Error {},
}));

import { useWakeWordDetector } from "./useWakeWordDetector";

beforeEach(() => {
  mockTransport.reset();
  dictationStartSpy.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("useWakeWordDetector never pulls the mic outside the VAD", () => {
  it("does NOT start Web Speech or server dictation when the VAD is disconnected", async () => {
    mockTransport._state = "disconnected";

    renderHook(() => useWakeWordDetector({ onWakeWord: vi.fn(), enabled: true }));

    // Flush the (mocked) dynamic import microtask — nothing transport-side
    // ever fires when the VAD is disconnected, which is exactly the point.
    await act(async () => {});
    // The transport must not be asked to arm wake-word mode (VAD absent).
    expect(mockTransport.startWakeWordMode).not.toHaveBeenCalled();
    // RED (mic-pull bug): no fallback mic consumer may be opened.
    expect(dictationStartSpy).not.toHaveBeenCalled();
  });

  it("arms VAD wake-word mode and does NOT race fallback consumers when the VAD is connected", async () => {
    mockTransport._state = "connected";

    renderHook(() => useWakeWordDetector({ onWakeWord: vi.fn(), enabled: true }));

    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));
    expect(dictationStartSpy).not.toHaveBeenCalled();
  });

  it("releases the gate (stopWakeWordMode) when disabled while armed", async () => {
    mockTransport._state = "connected";
    // The gate must be genuinely armed for the disable path to release it —
    // with a wake-opened turn in flight (isWakeWordOnly false) the disable
    // path must NOT clobber the auto-resume (see the next test).
    mockTransport._isWakeWordOnly = true;

    const { unmount } = renderHook(() =>
      useWakeWordDetector({ onWakeWord: vi.fn(), enabled: true }),
    );
    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));

    unmount();
    await waitFor(() => expect(mockTransport.stopWakeWordMode).toHaveBeenCalled());
    expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1); // never re-armed
  });

  it("fires onWakeWord when the transport emits wake.word", async () => {
    mockTransport._state = "connected";
    const onWakeWord = vi.fn();

    renderHook(() => useWakeWordDetector({ onWakeWord, enabled: true }));
    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));

    act(() => {
      mockTransport.emitEvent({ type: "wake.word", transcript: "橘宝" } as unknown as {
        type: string;
      });
    });
    expect(onWakeWord).toHaveBeenCalledTimes(1);
  });

  it("does NOT stop the gate while a wake-opened turn is in flight (auto-resume preserved)", async () => {
    // Mic-race fix (2026-09-02): when the wake word opens a turn,
    // isWakeWordOnly flips false → wakeWordEnabled recomputes false → this
    // hook's cleanup would run stopWakeWordMode(), clobbering
    // wakeWordAutoResume and the gate would never re-arm ("wake word only
    // works once"). The disable path must only release the gate when it is
    // genuinely still armed (isWakeWordOnly true, no turn in flight).
    mockTransport._state = "connected";
    mockTransport._isWakeWordOnly = true;

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useWakeWordDetector({ onWakeWord: vi.fn(), enabled }),
      { initialProps: { enabled: true } },
    );
    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));

    // Simulate the wake word opening a turn: the gate flips off (the
    // transport consumed wakeWordMode, wakeWordAutoResume pending).
    mockTransport._isWakeWordOnly = false;
    rerender({ enabled: false });

    // Flush the dynamic import microtask.
    await act(async () => {});
    // The gate was NOT torn down — auto-resume survives the turn.
    expect(mockTransport.stopWakeWordMode).not.toHaveBeenCalled();
  });

  it("releases the gate when disabled while genuinely armed (mid-turn guard does not over-retain)", async () => {
    mockTransport._state = "connected";
    mockTransport._isWakeWordOnly = true;

    const { unmount } = renderHook(() =>
      useWakeWordDetector({ onWakeWord: vi.fn(), enabled: true }),
    );
    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));

    unmount();
    await act(async () => {});
    // The gate is genuinely armed (no turn in flight) — release it.
    expect(mockTransport.stopWakeWordMode).toHaveBeenCalledTimes(1);
  });

  it("arms the gate when the transport connects AFTER mount (late-connect lifecycle)", async () => {
    // Audit finding 2's companion (2026-09-02): the old effect keyed on
    // `enabled` alone — a transport that connected after mount never armed
    // the gate, and a toggle-off left isListening stale-true. The detector
    // now subscribes to transport state and follows the real lifecycle.
    mockTransport._state = "disconnected";

    const { result } = renderHook(
      () => useWakeWordDetector({ onWakeWord: vi.fn(), enabled: true }),
    );
    // Flush the dynamic import — subscribeState registered, nothing armed.
    await act(async () => {});
    expect(mockTransport.startWakeWordMode).not.toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);

    // The user clicks the paw → transport connects → state listeners fire.
    act(() => {
      mockTransport.setState("connected");
    });
    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));
    expect(result.current.isListening).toBe(true);

    // Toggle-off: disconnect mirrors isListening down immediately (the
    // dictation chip must not stay locked while disconnected).
    act(() => {
      mockTransport.setState("disconnected");
    });
    await waitFor(() => expect(result.current.isListening).toBe(false));
  });
});