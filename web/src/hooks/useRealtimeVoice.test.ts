// Tests for useRealtimeVoice — the React binding for the Realtime API voice
// transport.
//
// The transport (`realtimeVoice`) is a singleton that owns the WebSocket and
// audio graph. We mock it at the module boundary so the hook test stays
// deterministic and doesn't touch `navigator.mediaDevices` or real WebSockets.

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRealtimeVoice } from "./useRealtimeVoice";

// ── Transport mock ─────────────────────────────────────────────────────────
// We replace the singleton with a minimal stand-in that records calls and
// lets the test drive state changes and event dispatch by hand.
//
// `vi.mock` factories are hoisted to the top of the file by Vitest, so any
// variable referenced inside must itself be hoisted via `vi.hoisted` —
// otherwise the factory runs before the `const` is initialized.

type StateListener = () => void;
type RealtimeServerEventLike = Record<string, unknown> & { type: string };
type EventListener = (event: RealtimeServerEventLike) => void;

const mockTransport = vi.hoisted(() => {
  return {
    state: "disconnected" as string,
    stateListeners: new Set<StateListener>(),
    eventListeners: new Set<EventListener>(),
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(),
    send: vi.fn(),
    subscribeState(listener: StateListener) {
      this.stateListeners.add(listener);
      return () => this.stateListeners.delete(listener);
    },
    subscribeEvents(listener: EventListener) {
      this.eventListeners.add(listener);
      return () => this.eventListeners.delete(listener);
    },
    getState() {
      return this.state;
    },
    setState(state: string) {
      this.state = state;
      for (const l of this.stateListeners) l();
    },
    emitEvent(event: RealtimeServerEventLike) {
      for (const l of this.eventListeners) l(event);
    },
    reset() {
      this.state = "disconnected";
      this.stateListeners.clear();
      this.eventListeners.clear();
      this.connect.mockReset();
      this.connect.mockResolvedValue(undefined);
      this.disconnect.mockReset();
      this.send.mockReset();
    },
  };
});

vi.mock("@/lib/realtimeVoice", () => ({
  realtimeVoice: mockTransport,
}));

beforeEach(() => {
  mockTransport.reset();
});

afterEach(() => {
  cleanup();
});

describe("useRealtimeVoice", () => {
  it("starts disconnected and exposes the transport state", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    expect(result.current.state).toBe("disconnected");
    expect(result.current.userTranscript).toBe("");
    expect(result.current.assistantTranscript).toBe("");
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isResponding).toBe(false);
  });

  it("connect calls the transport with voice and turnDetection options", async () => {
    const { result } = renderHook(() =>
      useRealtimeVoice({ voice: "nova", turnDetection: "server_vad" }),
    );
    await act(async () => {
      await result.current.connect();
    });
    expect(mockTransport.connect).toHaveBeenCalledWith({
      voice: "nova",
      turnDetection: "server_vad",
    });
  });

  it("disconnect calls the transport and resets derived state", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    // Simulate a connected session with accumulated state.
    act(() => {
      mockTransport.setState("connected");
      mockTransport.emitEvent({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "i1",
        transcript: "hello",
      });
    });
    expect(result.current.userTranscript).toBe("hello");
    act(() => {
      result.current.disconnect();
    });
    expect(mockTransport.disconnect).toHaveBeenCalled();
    expect(result.current.userTranscript).toBe("");
  });

  it("tracks isSpeaking from VAD events", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    act(() => {
      mockTransport.emitEvent({ type: "input_audio_buffer.speech_started" });
    });
    expect(result.current.isSpeaking).toBe(true);
    act(() => {
      mockTransport.emitEvent({ type: "input_audio_buffer.speech_stopped" });
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("accumulates userTranscript from transcription.completed events", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    act(() => {
      mockTransport.emitEvent({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "i1",
        transcript: "hello",
      });
    });
    expect(result.current.userTranscript).toBe("hello");
    act(() => {
      mockTransport.emitEvent({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "i2",
        transcript: "world",
      });
    });
    expect(result.current.userTranscript).toBe("hello world");
  });

  it("clears userTranscript at the start of a new utterance", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    act(() => {
      mockTransport.emitEvent({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "i1",
        transcript: "hello",
      });
    });
    expect(result.current.userTranscript).toBe("hello");
    act(() => {
      mockTransport.emitEvent({ type: "input_audio_buffer.speech_started" });
    });
    expect(result.current.userTranscript).toBe("");
  });

  it("tracks isResponding and assistantTranscript from response events", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    act(() => {
      mockTransport.emitEvent({
        type: "response.created",
        response: { id: "r1", status: "in_progress" },
      });
    });
    expect(result.current.isResponding).toBe(true);
    expect(result.current.assistantTranscript).toBe("");
    act(() => {
      mockTransport.emitEvent({
        type: "response.audio_transcript.delta",
        response_id: "r1",
        item_id: "i1",
        delta: "Hi ",
      });
    });
    expect(result.current.assistantTranscript).toBe("Hi ");
    act(() => {
      mockTransport.emitEvent({
        type: "response.audio_transcript.delta",
        response_id: "r1",
        item_id: "i1",
        delta: "there",
      });
    });
    expect(result.current.assistantTranscript).toBe("Hi there");
    act(() => {
      mockTransport.emitEvent({
        type: "response.audio_transcript.done",
        response_id: "r1",
        item_id: "i1",
        transcript: "Hi there!",
      });
    });
    expect(result.current.assistantTranscript).toBe("Hi there!");
    act(() => {
      mockTransport.emitEvent({
        type: "response.done",
        response: { id: "r1", status: "completed" },
      });
    });
    expect(result.current.isResponding).toBe(false);
  });

  it("send forwards client events to the transport", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    act(() => {
      result.current.send({ type: "response.create" });
    });
    expect(mockTransport.send).toHaveBeenCalledWith({ type: "response.create" });
  });

  it("reflects transport state changes", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    expect(result.current.state).toBe("disconnected");
    act(() => {
      mockTransport.setState("connecting");
    });
    expect(result.current.state).toBe("connecting");
    act(() => {
      mockTransport.setState("connected");
    });
    expect(result.current.state).toBe("connected");
    act(() => {
      mockTransport.setState("error");
    });
    expect(result.current.state).toBe("error");
  });

  it("error event clears isResponding", () => {
    const { result } = renderHook(() => useRealtimeVoice());
    act(() => {
      mockTransport.emitEvent({
        type: "response.created",
        response: { id: "r1", status: "in_progress" },
      });
    });
    expect(result.current.isResponding).toBe(true);
    act(() => {
      mockTransport.emitEvent({
        type: "error",
        error: { type: "server_error", message: "boom" },
      });
    });
    expect(result.current.isResponding).toBe(false);
  });
});
