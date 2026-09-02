// Landing-surface voice render test (audit-gap closer, 2026-09-02).
//
// The unified-surface audit verified the voice state machine at the hook
// level but never mount-tested the rendered landing — the gap that let the
// wake-word mic-pull bug and the gate dead-end hide. This suite renders the
// REAL NewChatLandingScreen and asserts the three voice affordances end to
// end:
//   1. The mic chip (ComposerMicButton, "Voice dictation") renders.
//   2. Clicking it arms the wake gate — connect() then
//      hermesVoice.startWakeWordMode() (the paw-mic fallback path).
//   3. The dictation path works WITHOUT the wake word: ComposerMicButton's
//      onHermesVoice is the Hermes fallback; server dictation is mocked
//      unavailable here so the click routes to the transport, and the
//      transcript feeds the composer (the wake gate is a MODE of the same
//      VAD, not a precondition for dictation).
//   4. Mic-ownership regression: the rendered surface never opens a server
//      dictation take on its own (the mic is pulled only by the user's
//      click on the VAD-backed paw/mic).

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";

import { authenticatedFetch } from "@/lib/identity";
import type { Host } from "@/hooks/useHosts";
import { useHosts } from "@/hooks/useHosts";
import type { AvailableAgent } from "@/hooks/useAvailableAgents";
import { useAvailableAgents } from "@/hooks/useAvailableAgents";
import { NewChatLandingScreen, resetLandingDraft } from "./NewChatDialog";

// ── Voice transport mock (vi.hoisted — mock factories are hoisted) ────────
type StateListener = () => void;
type EventListener = (event: { type: string }) => void;

const mockTransport = vi.hoisted(() => {
  const stateListeners = new Set<StateListener>();
  const eventListeners = new Set<EventListener>();
  return {
    _state: "disconnected" as string,
    getState: () => mockTransport._state,
    getVoiceState: () => (mockTransport._state === "connected" ? "listening" : "disconnected"),
    isWakeWordOnly: false,
    subscribeState: (cb: StateListener) => {
      stateListeners.add(cb);
      return () => stateListeners.delete(cb);
    },
    subscribeEvents: (cb: EventListener) => {
      eventListeners.add(cb);
      return () => eventListeners.delete(cb);
    },
    emitEvent: (event: { type: string }) => {
      for (const l of eventListeners) l(event);
    },
    notifyState() {
      for (const l of stateListeners) l();
    },
    connect: vi.fn(async () => {
      mockTransport._state = "connected";
      mockTransport.notifyState();
    }),
    disconnect: vi.fn(() => {
      mockTransport._state = "disconnected";
      mockTransport.notifyState();
    }),
    send: vi.fn(),
    setAgentMeowSession: vi.fn(),
    getAgentMeowSession: vi.fn((): string | null => null),
    startWakeWordMode: vi.fn(),
    stopWakeWordMode: vi.fn(),
    stopWakeWordModeForTurn: vi.fn(),
    pauseVad: vi.fn(),
    resumeVad: vi.fn(),
  };
});

vi.mock("@/lib/hermesVoice", () => ({
  hermesVoice: mockTransport,
  splitSentences: (text: string) => ({ sentences: [text], remainder: "" }),
  containsWakeWord: () => false,
  WAKE_WORDS: [],
  int16ToBase64: () => "",
}));

// Server dictation unavailable → the mic chip takes the Hermes voice
// fallback path (the code path under test). Also fails loudly if anything
// opens a dictation take — the landing must never pull the mic on its own.
const dictationStartSpy = vi.hoisted(() =>
  vi.fn(async () => {
    throw new Error("BUG: landing surface opened a dictation take without a click");
  }),
);
vi.mock("@/lib/dictation", () => ({
  DictationSession: { start: dictationStartSpy },
  DictationBusyError: class extends Error {},
}));

vi.mock("@/lib/routing", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock("@/store/chatStore", () => ({
  useChatStore: { getState: () => ({ beginQueuedSession: vi.fn() }) },
}));

vi.mock("@/lib/identity", () => ({ authenticatedFetch: vi.fn() }));
vi.mock("@/hooks/useHosts", () => ({
  useHosts: vi.fn(),
  useInstallHarness: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock("@/hooks/useAvailableAgents", () => ({
  useAvailableAgents: vi.fn(),
  prefetchAvailableAgentDetails: vi.fn(),
}));
vi.mock("@/hooks/useHostFilesystem", () => ({
  useHostFilesystem: () => ({ data: undefined }),
  useCreateHostDirectory: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/useHostWorktrees", () => ({
  useHostWorktrees: () => ({ data: undefined }),
}));
vi.mock("@/hooks/useDirectorySessions", () => ({
  useDirectorySessions: () => ({ data: [] }),
}));
vi.mock("@/hooks/RunnerHealthProvider", () => ({
  useRunnerHealthRegistration: () => new Map<string, boolean>(),
}));
vi.mock("@/hooks/useConversations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useConversations")>()),
  useProjects: () => ({ data: [] }),
}));
vi.mock("@/lib/agentLabels", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agentLabels")>()),
  useBrainHarnessLabels: () => ({}),
  useHarnessSetupSteps: () => ({}),
}));

function host(overrides: Partial<Host> = {}): Host {
  return {
    host_id: "host_1",
    name: "corey-laptop",
    owner: "corey",
    status: "online",
    ...overrides,
  };
}

function agent(overrides: Partial<AvailableAgent> = {}): AvailableAgent {
  return {
    id: "ag_hello",
    name: "hello_world",
    display_name: "Hello World",
    description: null,
    harness: null,
    skills: [],
    ...overrides,
  };
}

function renderLanding(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <NewChatLandingScreen />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(authenticatedFetch).mockReset();
  vi.mocked(useHosts).mockReturnValue({ data: [host()] } as ReturnType<typeof useHosts>);
  vi.mocked(useAvailableAgents).mockReturnValue({
    data: [agent()],
  } as ReturnType<typeof useAvailableAgents>);
  resetLandingDraft();
  localStorage.clear();
  mockTransport._state = "disconnected";
  mockTransport.isWakeWordOnly = false;
  // Reset spy call history — the transport mock is module-scoped, so call
  // counts from a previous test would leak into the mount-purity assertion.
  mockTransport.connect.mockClear();
  mockTransport.disconnect.mockClear();
  mockTransport.startWakeWordMode.mockClear();
  mockTransport.stopWakeWordMode.mockClear();
  mockTransport.stopWakeWordModeForTurn.mockClear();
  mockTransport.setAgentMeowSession.mockClear();
  dictationStartSpy.mockClear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("NewChatDialog landing voice affordances (rendered surface)", () => {
  it("renders the mic chip on the landing surface", () => {
    renderLanding();
    // The ComposerMicButton with a stable accessible name — the same chip
    // the audit gap let hide because no render test mounted the landing.
    expect(screen.getByRole("button", { name: "Voice dictation" })).toBeInTheDocument();
  });

  it("arms the wake gate when the mic chip is clicked (connect → startWakeWordMode)", async () => {
    renderLanding();
    fireEvent.click(screen.getByRole("button", { name: "Voice dictation" }));

    // onHermesVoice runs inside a dynamic-import .then — wait for the tick.
    await waitFor(() => expect(mockTransport.connect).toHaveBeenCalledTimes(1));
    // The gate: every voice turn is keyed on the wake word after connect.
    await waitFor(() => expect(mockTransport.startWakeWordMode).toHaveBeenCalledTimes(1));
    // No dictation take was opened — the VAD is the only mic consumer.
    expect(dictationStartSpy).not.toHaveBeenCalled();
  });

  it("dictation works without the wake word: transcript feeds the composer", async () => {
    renderLanding();
    // Server dictation is mocked unavailable, so the FIRST click routes to
    // the Hermes fallback (arms the gate). The wake word is a MODE of the
    // VAD — dictation text still reaches the composer via the transcript
    // events, without any wake word being spoken. Simulate the transport
    // delivering a final user transcript and assert the composer shows it.
    fireEvent.click(screen.getByRole("button", { name: "Voice dictation" }));
    await waitFor(() => expect(mockTransport.connect).toHaveBeenCalled());

    // The hook's event subscription receives the transcript and feeds
    // dictation.replaceInterim → the composer draft.
    mockTransport.emitEvent({
      type: "transcript.final",
      role: "user",
      content: "orange cat storm",
    } as unknown as { type: string });

    await waitFor(() =>
      expect(
        (screen.getByTestId("new-chat-landing-input") as HTMLTextAreaElement).value,
      ).toContain("orange cat storm"),
    );
  });

  it("never opens a dictation take on mount (mic-ownership regression)", () => {
    renderLanding();
    // Pure mount + a render settle — no user interaction. The landing must
    // not touch the mic (no dictation take, no transport connect).
    expect(dictationStartSpy).not.toHaveBeenCalled();
    expect(mockTransport.connect).not.toHaveBeenCalled();
    expect(mockTransport.startWakeWordMode).not.toHaveBeenCalled();
  });
});