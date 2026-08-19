// Tests for useRealtimeVoice — the React binding for the Hermes-direct voice
// transport.
//
// The transport (`hermesVoice`) is a singleton that owns the HTTP voice
// pipeline (STT → LLM → TTS). We mock it at the module boundary so the hook
// test stays deterministic and doesn't touch `navigator.mediaDevices` or
// real HTTP calls.

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

import { useRealtimeVoice } from "./useRealtimeVoice";

// ── QueryClient wrapper ─────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

// ── Transport mock ─────────────────────────────────────────────────────────
// We replace the singleton with a minimal stand-in that records calls and
// lets the test drive state changes and event dispatch by hand.
//
// `vi.mock` factories are hoisted to the top of the file by Vitest, so any
// variable referenced inside must itself be hoisted via `vi.hoisted` �?
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

vi.mock("@/lib/hermesVoice", () => ({
  hermesVoice: mockTransport,
}));

const mockCreateSession = vi.fn<(...args: unknown[]) => Promise<{ id: string }>>(
  async () => ({ id: "voice-session-1" }),
);
const mockPostEvent = vi.fn<(...args: unknown[]) => Promise<{ queued: boolean }>>(
  async () => ({ queued: true }),
);

vi.mock("@/lib/sessionsApi", () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  postEvent: (...args: unknown[]) => mockPostEvent(...args),
}));

const mockRenameConversation = vi.fn<(...args: unknown[]) => Promise<{ id: string; title: string }>>(
  async (id: unknown, title: unknown) => ({ id: id as string, title: title as string }),
);

vi.mock("@/hooks/useConversations", () => ({
  renameConversation: (...args: unknown[]) => mockRenameConversation(...args),
}));

import type { AvailableAgent } from "@/hooks/useAvailableAgents";

const HERMES_AGENT_ID = "0ba82079fc1c4eefbdcb7155083f947f";

function seedAgentCatalog(
  agents: AvailableAgent[] = [
    {
      id: HERMES_AGENT_ID,
      name: "hermes-gateway",
      display_name: "Hermes Gateway",
      description: null,
      harness: null,
      skills: [],
    },
  ],
): void {
  // The hook reads the catalog via queryClient.getQueryData, not via the
  // useAvailableAgents hook itself — so we seed the cache directly. This
  // mirrors the realistic flow: NewChatDialog triggers the fetch when the
  // app boots, and the catalog is warm by the time the user clicks mic.
  queryClient.setQueryData<AvailableAgent[]>(["available-agents"], agents);
}

beforeEach(() => {
  mockTransport.reset();
  mockCreateSession.mockReset();
  mockCreateSession.mockResolvedValue({ id: "voice-session-1" });
  mockPostEvent.mockReset();
  mockPostEvent.mockResolvedValue({ queued: true });
  mockRenameConversation.mockReset();
  mockRenameConversation.mockResolvedValue({ id: "voice-session-1", title: "test" });
  seedAgentCatalog();
});

afterEach(() => {
  cleanup();
});

describe("useRealtimeVoice", () => {
  it("starts disconnected and exposes the transport state", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    expect(result.current.state).toBe("disconnected");
    expect(result.current.userTranscript).toBe("");
    expect(result.current.assistantTranscript).toBe("");
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isResponding).toBe(false);
  });

  it("connect calls the transport with turnDetection options", async () => {
    const { result } = renderHook(() =>
      useRealtimeVoice({ turnDetection: "server_vad" }),
      { wrapper },
    );
    await act(async () => {
      await result.current.connect();
    });
    expect(mockTransport.connect).toHaveBeenCalledWith({
      turnDetection: "server_vad",
      provider: null,
    });
  });

  it("disconnect calls the transport and resets derived state", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    // Simulate a connected session with accumulated state.
    act(() => {
      mockTransport.setState("connected");
      mockTransport.emitEvent({
        type: "transcript.final", role: "user", content: "hello" });
    });
    expect(result.current.userTranscript).toBe("hello");
    act(() => {
      result.current.disconnect();
    });
    expect(mockTransport.disconnect).toHaveBeenCalled();
    expect(result.current.userTranscript).toBe("");
  });

  it("tracks isSpeaking from turn.started and response.started events", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    act(() => {
      mockTransport.emitEvent({ type: "turn.started", turnId: "t1" });
    });
    expect(result.current.isSpeaking).toBe(true);
    act(() => {
      mockTransport.emitEvent({ type: "response.started", responseId: "r1" });
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("accumulates userTranscript from transcript.delta events", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    act(() => {
      mockTransport.emitEvent({ type: "transcript.delta", role: "user", content: "hello" });
    });
    expect(result.current.userTranscript).toBe("hello");
    act(() => {
      mockTransport.emitEvent({ type: "transcript.delta", role: "user", content: " world" });
    });
    expect(result.current.userTranscript).toBe("hello world");
  });

  it("clears userTranscript at the start of a new turn", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    act(() => {
      mockTransport.emitEvent({ type: "transcript.final", role: "user", content: "hello" });
    });
    expect(result.current.userTranscript).toBe("hello");
    act(() => {
      mockTransport.emitEvent({ type: "turn.started", turnId: "t2" });
    });
    expect(result.current.userTranscript).toBe("");
  });

  it("tracks isResponding and assistantTranscript from QAA events", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    act(() => {
      mockTransport.emitEvent({ type: "response.started", responseId: "r1" });
    });
    expect(result.current.isResponding).toBe(true);
    expect(result.current.assistantTranscript).toBe("");
    act(() => {
      mockTransport.emitEvent({ type: "transcript.delta", role: "assistant", content: "Hi " });
    });
    expect(result.current.assistantTranscript).toBe("Hi ");
    act(() => {
      mockTransport.emitEvent({ type: "transcript.delta", role: "assistant", content: "there" });
    });
    expect(result.current.assistantTranscript).toBe("Hi there");
    act(() => {
      mockTransport.emitEvent({ type: "transcript.final", role: "assistant", content: "Hi there!" });
    });
    expect(result.current.assistantTranscript).toBe("Hi there!");
    act(() => {
      mockTransport.emitEvent({ type: "audio.done", responseId: "r1" });
    });
    expect(result.current.isResponding).toBe(false);
  });

  it("send forwards client events to the transport", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    act(() => {
      result.current.send({ type: "interrupt" });
    });
    expect(mockTransport.send).toHaveBeenCalledWith({ type: "interrupt" });
  });

  it("reflects transport state changes", () => {
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
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
    const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
    act(() => {
      mockTransport.emitEvent({ type: "response.started", responseId: "r1" });
    });
    expect(result.current.isResponding).toBe(true);
    act(() => {
      mockTransport.emitEvent({ type: "error", message: "boom" });
    });
    expect(result.current.isResponding).toBe(false);
  });

  // Regression: the cat-paw mic restart bug. After a disconnect (user
  // clicks Stop, or the session auto-stops on idle timeout), clicking the
  // paw again must drive a fresh connect and the hook must report a clean
  // disconnected �?connecting �?connected cycle with no stale state. The
  // real fix lives in the transport (await previous teardown before
  // reconnecting + resume AudioContext after getUserMedia); this test
  // pins the hook contract the restart depends on.
  describe("restart after disconnect (paw-mic restart bug)", () => {
    it("drives connect �?disconnect �?connect and resets state each cycle", async () => {
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      // Cycle 1: connect.
      await act(async () => {
        await result.current.connect();
      });
      expect(mockTransport.connect).toHaveBeenCalledTimes(1);
      // Simulate the transport reaching connected.
      act(() => mockTransport.setState("connected"));
      expect(result.current.state).toBe("connected");

      // Accumulate some state that must be cleared on disconnect.
      act(() => {
        mockTransport.emitEvent({ type: "transcript.final", role: "user", content: "first turn" });
      });
      expect(result.current.userTranscript).toBe("first turn");

      // Stop the session �?the paw button's Stop path. The real transport
      // sets state=disconnected; the mock doesn't, so drive it by hand.
      act(() => {
        result.current.disconnect();
        mockTransport.setState("disconnected");
      });
      expect(mockTransport.disconnect).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("disconnected");
      // Derived state must reset so the next turn starts clean.
      expect(result.current.userTranscript).toBe("");
      expect(result.current.assistantTranscript).toBe("");
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.isResponding).toBe(false);

      // Cycle 2: reconnect �?the paw button's Start path after a stop.
      mockTransport.connect.mockClear();
      await act(async () => {
        await result.current.connect();
      });
      expect(mockTransport.connect).toHaveBeenCalledTimes(1);
      act(() => mockTransport.setState("connected"));
      expect(result.current.state).toBe("connected");
      // No stale transcript leaks into the new session.
      expect(result.current.userTranscript).toBe("");
    });

    it("reconnects after an unexpected close (idle auto-stop / server drop)", async () => {
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });
      await act(async () => {
        await result.current.connect();
      });
      act(() => mockTransport.setState("connected"));
      expect(result.current.state).toBe("connected");

      // The transport fires state=disconnected when the server closes the
      // socket (idle timeout / unexpected drop). The hook must mirror it.
      act(() => mockTransport.setState("disconnected"));
      expect(result.current.state).toBe("disconnected");

      // User clicks the paw again to restart.
      mockTransport.connect.mockClear();
      await act(async () => {
        await result.current.connect();
      });
      expect(mockTransport.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe("voice session recording", () => {
    // The voice hook must persist voice conversations as agent-meow sessions
    // so they show up in the sidebar like text chats. The catch: the
    // /v1/sessions route expects the agent's durable agent_id (e.g.
    // "0ba82079fc1c4eefbdcb7155083f947f"), not the agent's display name
    // ("hermes-gateway"). The legacy /v1/responses route accepted the name
    // as `model`, but /v1/sessions rejects unknown ids with 404. The hook
    // must resolve the name through the cached agent catalog.
    //
    // If the agent isn't in the catalog, the hook must NOT block the voice
    // call (the user can still talk); it must surface the failure via the
    // `error` channel and skip persistence.

    it("resolves 'hermes-gateway' name to its agent_id before calling createSession", async () => {
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      // First call to createSession must pass the durable agent_id from
      // the catalog, NOT the display name "hermes-gateway" — that would
      // 404 on the /v1/sessions route.
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
      const [agentArg, initialItems, options] = mockCreateSession.mock.calls[0];
      expect(agentArg).toBe(HERMES_AGENT_ID);
      expect(agentArg).not.toBe("hermes-gateway");
      expect(initialItems).toEqual([]);
      expect(options).toMatchObject({ title: "Voice conversation" });

      // And the resulting session id is exposed to callers.
      expect(result.current.sessionId).toBe("voice-session-1");
    });

    it("falls through to error state when the catalog has no hermes-gateway", async () => {
      // Simulate a server that doesn't expose the voice agent — either
      // because it's misconfigured, or the catalog fetch hasn't warmed
      // yet. The hook must not throw; it must surface a user-visible
      // message and continue with the audio connection.
      queryClient.setQueryData<AvailableAgent[]>(["available-agents"], []);
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      // createSession is NOT called — there's no agent id to pass.
      expect(mockCreateSession).not.toHaveBeenCalled();
      // The transport still connects so the user can talk.
      expect(mockTransport.connect).toHaveBeenCalledTimes(1);
      // And the error state explains why the conversation won't be saved.
      expect(result.current.error).toMatch(/not found in catalog/i);
      expect(result.current.error).toMatch(/will not be recorded/i);
      // sessionId stays null — postEvent calls will short-circuit on it.
      expect(result.current.sessionId).toBeNull();
    });

    it("still connects the transport when createSession throws", async () => {
      // The /v1/sessions route can fail for transient reasons (network,
      // server unavailable). Voice should keep working even if recording
      // can't start — but we should log the failure, not silently swallow
      // it (the original code's `catch {}` made this bug invisible).
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        mockCreateSession.mockRejectedValueOnce(new Error("503 gateway"));
        const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

        await act(async () => {
          await result.current.connect();
        });

        // Transport connected regardless of the persistence failure.
        expect(mockTransport.connect).toHaveBeenCalledTimes(1);
        // The error is logged so the failure is visible during dev.
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining("could not create voice session"),
          expect.any(Error),
        );
        // sessionId is null — events posted to it would be no-ops.
        expect(result.current.sessionId).toBeNull();
      } finally {
        warn.mockRestore();
      }
    });

    it("forwards transcript.final events to postEvent with the resolved sessionId", async () => {
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });
      act(() => mockTransport.setState("connected"));

      // User turn finalised.
      act(() => {
        mockTransport.emitEvent({
          type: "transcript.final",
          role: "user",
          content: "hello there",
        });
      });

      expect(mockPostEvent).toHaveBeenCalledWith(
        "voice-session-1",
        expect.objectContaining({
          type: "external_conversation_item",
          data: expect.objectContaining({
            item_type: "message",
            item_data: {
              role: "user",
              content: [{ type: "input_text", text: "hello there" }],
            },
          }),
        }),
      );

      // Assistant turn finalised.
      act(() => {
        mockTransport.emitEvent({
          type: "transcript.final",
          role: "assistant",
          content: "general kenobi",
        });
      });
      expect(mockPostEvent).toHaveBeenCalledWith(
        "voice-session-1",
        expect.objectContaining({
          type: "external_assistant_message",
          data: expect.objectContaining({
            agent: "hermes-agent",
            text: "general kenobi",
          }),
        }),
      );
    });

    it("renames the session to the first user prompt on first transcript.final", async () => {
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });
      act(() => mockTransport.setState("connected"));

      // First user prompt — should trigger a rename.
      act(() => {
        mockTransport.emitEvent({
          type: "transcript.final",
          role: "user",
          content: "What's the weather in Shanghai?",
        });
      });

      expect(mockRenameConversation).toHaveBeenCalledTimes(1);
      const [renameId, renameTitle] = mockRenameConversation.mock.calls[0];
      expect(renameId).toBe("voice-session-1");
      expect(renameTitle).toBe("What's the weather in Shanghai?");

      // Second user prompt — should NOT trigger another rename.
      mockRenameConversation.mockClear();
      act(() => {
        mockTransport.emitEvent({
          type: "turn.started",
          turnId: "t2",
        });
        mockTransport.emitEvent({
          type: "transcript.final",
          role: "user",
          content: "And what about tomorrow?",
        });
      });
      expect(mockRenameConversation).not.toHaveBeenCalled();
    });

    it("truncates long first prompts to 80 chars for the title", async () => {
      const longPrompt = "A".repeat(120);
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });
      act(() => mockTransport.setState("connected"));

      act(() => {
        mockTransport.emitEvent({
          type: "transcript.final",
          role: "user",
          content: longPrompt,
        });
      });

      expect(mockRenameConversation).toHaveBeenCalledTimes(1);
      const [, title] = mockRenameConversation.mock.calls[0];
      expect(title).toHaveLength(80);
    });

    it("does not rename when the session was not created (no agent in catalog)", async () => {
      queryClient.setQueryData<AvailableAgent[]>(["available-agents"], []);
      const { result } = renderHook(() => useRealtimeVoice(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      act(() => {
        mockTransport.emitEvent({
          type: "transcript.final",
          role: "user",
          content: "hello",
        });
      });

      expect(mockRenameConversation).not.toHaveBeenCalled();
    });
  });
});
