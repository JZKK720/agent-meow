import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionComposer } from "./SessionComposer";
import type { ComposerProps } from "./SessionComposer";

// SessionComposer reads workspace files via a TanStack query hook (for
// "@"-file mentions) and the host binding via TanStack Query. These mount
// tests don't exercise either, so stub the hooks to avoid needing a
// QueryClientProvider around every bare render (same harness as
// ChatPage.composer.test.tsx).
vi.mock("@/hooks/useWorkspaceChangedFiles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useWorkspaceChangedFiles")>();
  return {
    ...actual,
    useWorkspaceAllFiles: () => ({ data: undefined }),
    useWorkspaceDirectory: () => ({ data: undefined }),
  };
});
// useRealtimeVoice calls useQueryClient() — stub it so the composer mounts
// without a QueryClientProvider (the documented pre-existing baseline gap).
vi.mock("@/hooks/useRealtimeVoice", () => ({
  useRealtimeVoice: () => ({
    state: "disconnected",
    userTranscript: "",
    voiceCommand: null,
    voiceFileSearch: null,
    isAudioPlaying: false,
    clearVoiceCommand: vi.fn(),
    clearVoiceFileSearch: vi.fn(),
  }),
}));
vi.mock("@/hooks/useSession", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useSession")>()),
  useSession: () => ({ session: { hostId: null }, isLoading: false, error: null }),
}));
vi.mock("@/hooks/useHosts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useHosts")>()),
  useHosts: () => ({ data: [] }),
}));
vi.mock("@/hooks/RunnerHealthProvider", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/RunnerHealthProvider")>()),
  useSessionHostOnline: () => undefined,
}));
vi.mock("@/lib/agentLabels", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agentLabels")>()),
  useBrainHarnessLabels: () => ({
    "claude-sdk": "Claude SDK",
    codex: "Codex",
    pi: "Pi",
  }),
}));

/** Minimal ComposerProps for an idle, writable composer. */
function composerProps(overrides: Partial<ComposerProps> = {}): ComposerProps {
  return {
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
    ...overrides,
  };
}

/** The composer textarea, located by its aria-label. */
function textarea() {
  return screen.getByLabelText("Message the agent") as HTMLTextAreaElement;
}

function renderWithTooltips(ui: ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

describe("SessionComposer mount", () => {
  it("renders the textarea, attach button, and speech chip", () => {
    renderWithTooltips(<SessionComposer {...composerProps()} />);
    expect(textarea()).toBeTruthy();
    expect(screen.getByTitle("Attach files")).toBeTruthy();
    // The speech chip renders the dictation mic (aria-label from ComposerMicButton).
    expect(document.querySelector("button[aria-label*='voice' i]")).toBeTruthy();
  });

  it("Enter with a draft fires onSend exactly once", () => {
    const onSend = vi.fn();
    renderWithTooltips(<SessionComposer {...composerProps({ onSend })} />);
    const ta = textarea();
    fireEvent.change(ta, { target: { value: "hello meow" } });
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("hello meow", undefined);
  });

  it("empty Enter does not fire onSend", () => {
    const onSend = vi.fn();
    renderWithTooltips(<SessionComposer {...composerProps({ onSend })} />);
    fireEvent.keyDown(textarea(), { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe("SessionComposer harness label helper", () => {
  it("names native wrappers and agent/harness pairs", async () => {
    const { composerHarnessLabel } = await import("./SessionComposer");
    expect(composerHarnessLabel("claude", null, "claude-native")).toBe("Claude");
    expect(composerHarnessLabel(null, "polly", "pi")).toBe("Polly (Pi)");
  });
});