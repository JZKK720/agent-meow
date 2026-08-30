// Regression test: dictating in a ChatPage conversation must bind the
// CURRENT session to the voice transport so the turn routes through
// agent-meow's runner and renders in the chat stream.
//
// Root cause of the "hear TTS, see no text" bug: ChatPage's composer mic
// falls back to the Hermes voice pipeline (server dictation is unavailable
// in this build), and its onHermesVoice handler called hermesVoice.connect()
// WITHOUT setAgentMeowSession(conversationId). With no session bound, the
// transport's chatStream() talks to Hermes /v1/chat/completions directly, so
// the user message never enters the session, no session_input_consumed fires,
// and chatStore renders neither the user prompt nor the reply — yet the local
// TTS still plays, so the reply is heard but never shown.
//
// The discriminating assertion: clicking the mic binds the active conversation
// id to the transport BEFORE connecting.

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useChatStore } from "@/store/chatStore";
import { Composer } from "./ChatPage";

const CONV_ID = "conv_voice_bind_test";

// ── Voice transport mock ────────────────────────────────────────────────────
// Records setAgentMeowSession calls and lets the test drive the connect
// toggle. Covers the surface useRealtimeVoice + ComposerMicButton + the
// onHermesVoice handler touch.
const transport = vi.hoisted(() => {
  const stateListeners = new Set<() => void>();
  return {
    _state: "disconnected" as string,
    getState: () => transport._state,
    subscribeState: (cb: () => void) => {
      stateListeners.add(cb);
      return () => stateListeners.delete(cb);
    },
    subscribeEvents: () => () => {},
    connect: vi.fn(async () => {
      transport._state = "connected";
      for (const l of stateListeners) l();
    }),
    disconnect: vi.fn(() => {
      transport._state = "disconnected";
      for (const l of stateListeners) l();
    }),
    send: vi.fn(),
    setAgentMeowSession: vi.fn(),
    getAgentMeowSession: vi.fn(() => null),
    isWakeWordOnly: false,
    startWakeWordMode: vi.fn(),
    pauseVad: vi.fn(),
    resumeVad: vi.fn(),
    stopWakeWordModeForTurn: vi.fn(),
  };
});

vi.mock("@/lib/hermesVoice", () => ({
  hermesVoice: transport,
  splitSentences: (text: string) => ({ sentences: [text], remainder: "" }),
  containsWakeWord: () => false,
  WAKE_WORDS: [],
  int16ToBase64: () => "",
}));

// Server dictation unavailable → the mic takes the Hermes voice fallback
// (the code path under test).
vi.mock("@/lib/CapabilitiesContext", () => ({
  useServerInfo: () => ({ dictation_available: false }),
  getCachedServerInfo: () => ({ default_workspace: "~/ws" }),
}));

// Composer reads workspace files + session/host for the status line; stub
// the query hooks so the render needs nothing beyond the QueryClient.
vi.mock("@/hooks/useWorkspaceChangedFiles", () => ({
  useWorkspaceAllFiles: () => ({ data: undefined }),
  useWorkspaceDirectory: () => ({ data: undefined }),
}));
vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({ session: { hostId: null }, isLoading: false, error: null }),
}));
vi.mock("@/hooks/useHosts", () => ({ useHosts: () => ({ data: [] }) }));
vi.mock("@/hooks/RunnerHealthProvider", () => ({
  useSessionHostOnline: () => undefined,
  useSessionRunnerOnline: () => undefined,
}));
vi.mock("@/hooks/useConversations", () => ({
  renameConversation: vi.fn(async () => ({ id: CONV_ID, title: "x" })),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderComposer() {
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        TooltipProvider,
        null,
        createElement(Composer, {
          status: "idle",
          isWorking: false,
          disabled: false,
          onSend: vi.fn(),
          onStop: vi.fn(),
          agents: undefined,
          agentsLoading: false,
          selectedAgentId: null,
          onSelectAgent: vi.fn(),
          permissionLevel: null,
          readOnlyReason: null,
          replyQuotes: [],
          onRemoveQuote: vi.fn(),
          onClearAllQuotes: vi.fn(),
          effortLevels: ["low", "medium", "high"] as const,
          showEffort: true,
          showModels: false,
          modelPickerKind: null,
          codexModelOptions: [],
          showCodexPlanMode: false,
        }),
      ),
    ),
  );
}

describe("ChatPage composer mic binds the active conversation", () => {
  beforeEach(() => {
    transport.setAgentMeowSession.mockClear();
    transport.connect.mockClear();
    transport.disconnect.mockClear();
    transport._state = "disconnected";
    useChatStore.setState({ conversationId: CONV_ID });
  });
  afterEach(() => {
    cleanup();
  });

  it("calls setAgentMeowSession(conversationId) before connecting the voice pipeline", async () => {
    renderComposer();
    const mic = screen.getByRole("button", { name: "Voice dictation" });
    fireEvent.click(mic);

    // onHermesVoice runs inside a dynamic-import .then — wait for the tick.
    await waitFor(() => expect(transport.connect).toHaveBeenCalled());
    // The fix: the CURRENT conversation is bound so the turn routes through
    // agent-meow's runner and renders in the chat stream. Without it the
    // transport talks to Hermes directly → audio plays, no bubbles.
    expect(transport.setAgentMeowSession).toHaveBeenCalledWith(CONV_ID);
  });
});
