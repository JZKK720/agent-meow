// Tests for VoicePawButton — the landing hero voice card (paw mic button +
// wave bands + status line + attach/wake-word rows), extracted from
// NewChatDialog's NewChatLandingScreen (plan 040 Phase 0, Task 1).
//
// The component is presentational: all state lives in the parent. These
// tests drive it through props with a stubbed useRealtimeVoice result shape
// (state "disconnected") and assert the affordances that carry behavior:
// the paw SVG, the aria-label/aria-pressed flip, the wake-word chip, and
// tolerance for the absent error field.

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VoicePawButton } from "./VoicePawButton";
import type { UseRealtimeVoiceResult } from "@/hooks/useRealtimeVoice";

// i18n: surface the raw keys so assertions pin exact label sources.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function stubRealtimeVoice(overrides: Partial<UseRealtimeVoiceResult> = {}): UseRealtimeVoiceResult {
  return {
    state: "disconnected",
    isWakeWordOnly: false,
    voiceState: "disconnected",
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(),
    send: vi.fn(),
    userTranscript: "",
    assistantTranscript: "",
    isSpeaking: false,
    isResponding: false,
    isAudioPlaying: false,
    voiceCommand: null,
    clearVoiceCommand: vi.fn(),
    voiceFileSearch: null,
    clearVoiceFileSearch: vi.fn(),
    error: null,
    sessionId: null,
    ...overrides,
  };
}

function renderButton(props: Partial<Parameters<typeof VoicePawButton>[0]> = {}) {
  const onAttachClick = vi.fn();
  const onToggleWakeWord = vi.fn();
  const onVoiceStart = vi.fn();
  const onTranscriptAppend = vi.fn();
  const view = render(
    <VoicePawButton
      realtimeVoice={stubRealtimeVoice()}
      voiceListening={false}
      creating={false}
      dictationActive={false}
      wakeWordActive={false}
      wakeWordEnabled={false}
      onAttachClick={onAttachClick}
      onToggleWakeWord={onToggleWakeWord}
      onVoiceStart={onVoiceStart}
      onTranscriptAppend={onTranscriptAppend}
      {...props}
    />,
  );
  return { ...view, onAttachClick, onToggleWakeWord, onVoiceStart, onTranscriptAppend };
}

describe("VoicePawButton", () => {
  it("renders the paw SVG and Start affordance in the disconnected state", () => {
    renderButton();
    const paw = document.querySelector('button[data-voice-state="disconnected"] svg[viewBox="0 0 64 64"]');
    expect(paw).not.toBeNull();
    // 4 toe beans + main pad
    expect(paw?.querySelectorAll("ellipse, circle")).toHaveLength(5);

    const button = screen.getByRole("button", { name: "Start voice input" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("renders the wake-word chip", () => {
    renderButton();
    expect(screen.getByTestId("new-chat-landing-wake-word-chip")).toBeInTheDocument();
  });

  it("does not crash without realtimeVoice.error and omits the error line", () => {
    const { container } = renderButton({ realtimeVoice: stubRealtimeVoice({ error: null }) });
    expect(container.querySelector(".text-destructive")).toBeNull();
  });

  it("shows the error message when realtimeVoice.error is set", () => {
    renderButton({ realtimeVoice: stubRealtimeVoice({ error: "mic denied" }) });
    expect(screen.getByText("mic denied")).toBeInTheDocument();
  });

  describe("interactions", () => {
    it("clicking the paw while disconnected snapshots and connects", () => {
      const { onVoiceStart } = renderButton();
      expect(onVoiceStart).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
      expect(onVoiceStart).toHaveBeenCalledTimes(1);
    });

    it("clicking the paw while connected appends the transcript and disconnects", () => {
      const { onTranscriptAppend } = renderButton({
        realtimeVoice: stubRealtimeVoice({ state: "connected", voiceState: "listening", userTranscript: "hello" }),
        voiceListening: true,
      });
      fireEvent.click(screen.getByRole("button", { name: "Stop voice input" }));
      expect(onTranscriptAppend).toHaveBeenCalledWith("hello");
    });

    it("empty transcript on stop does not call onTranscriptAppend", () => {
      const { onTranscriptAppend } = renderButton({
        realtimeVoice: stubRealtimeVoice({ state: "connected", voiceState: "listening", userTranscript: "" }),
        voiceListening: true,
      });
      fireEvent.click(screen.getByRole("button", { name: "Stop voice input" }));
      expect(onTranscriptAppend).not.toHaveBeenCalled();
    });

    it("clicking attach fires onAttachClick", () => {
      const { onAttachClick } = renderButton();
      fireEvent.click(screen.getByTestId("new-chat-landing-voice-attach"));
      expect(onAttachClick).toHaveBeenCalledTimes(1);
    });

    it("wake chip click passes the flipped next value", () => {
      const { onToggleWakeWord } = renderButton({ wakeWordActive: false });
      fireEvent.click(screen.getByTestId("new-chat-landing-wake-word-chip"));
      expect(onToggleWakeWord).toHaveBeenCalledWith(true);
    });

    it("creating disables the paw button", () => {
      renderButton({ creating: true });
      expect(screen.getByRole("button", { name: "Start voice input" })).toBeDisabled();
    });
  });

  describe("listening state", () => {
    it("flips to Stop and shows the phase status line", () => {
      renderButton({
        realtimeVoice: stubRealtimeVoice({ state: "connected", voiceState: "listening" }),
        voiceListening: true,
      });
      expect(screen.getByRole("button", { name: "Stop voice input" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByText("newChat.voiceListening")).toBeInTheDocument();
    });
  });
});