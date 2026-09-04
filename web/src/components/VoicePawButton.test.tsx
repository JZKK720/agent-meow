// Tests for VoicePawButton — the landing hero voice card (paw mic button +
// wave bands + status line + attach/wake-word rows), extracted from
// NewChatDialog's NewChatLandingScreen (plan 040 Phase 0, Task 1).
//
// The component is presentational: all state lives in the parent. These
// tests drive it through props with a stubbed useRealtimeVoice result shape
// (state "disconnected") and assert the affordances that carry behavior:
// the paw SVG, the aria-label/aria-pressed flip, the wake-word chip, and
// tolerance for the absent error field.

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VoicePawButton } from "./VoicePawButton";
import type { UseRealtimeVoiceResult } from "@/hooks/useRealtimeVoice";

// i18n: mirror i18next's t(key) behavior — the en locale has no explicit
// default registered for these keys, so production renders the key itself.
// Tests assert on the key string for exactness (same convention as the
// FirstBootChecklist i18n mock).
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function stubRealtimeVoice(
  overrides: Partial<UseRealtimeVoiceResult> = {},
): UseRealtimeVoiceResult {
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
    const paw = document.querySelector(
      'button[data-voice-state="disconnected"] svg[viewBox="0 0 64 64"]',
    );
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
        realtimeVoice: stubRealtimeVoice({
          state: "connected",
          voiceState: "listening",
          userTranscript: "hello",
        }),
        voiceListening: true,
      });
      fireEvent.click(screen.getByRole("button", { name: "Stop voice input" }));
      expect(onTranscriptAppend).toHaveBeenCalledWith("hello");
    });

    it("empty transcript on stop does not call onTranscriptAppend", () => {
      const { onTranscriptAppend } = renderButton({
        realtimeVoice: stubRealtimeVoice({
          state: "connected",
          voiceState: "listening",
          userTranscript: "",
        }),
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
      expect(screen.getByRole("button", { name: "Stop voice input" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      // The status line renders the t("newChat.voiceListening") value. The
      // suite's vi.mock for react-i18next does not override the real i18n
      // instance initialized by test-setup.ts, so the live translation
      // ("Listening…") renders — assert the element exists with the
      // listening voice state, not a specific string.
      const statusLine = document.querySelector('p[data-voice-state="listening"]');
      expect(statusLine).toBeTruthy();
      expect(statusLine?.textContent).toBeTruthy();
    });
  });

  describe("dock variant", () => {
    it("renders the compact paw in the footer without card chrome", () => {
      renderButton({ variant: "dock" });
      const paw = screen.getByTestId("composer-voice-paw");
      expect(paw).toBeInTheDocument();
      expect(paw).toHaveAttribute("aria-pressed", "false");
      expect(paw.getAttribute("class")).toContain("size-9");
      // No hero-card chrome: no wave bands, no attach/wake-word rows.
      expect(screen.queryByTestId("new-chat-landing-voice-attach")).toBeNull();
      expect(screen.queryByTestId("new-chat-landing-wake-word-chip")).toBeNull();
    });

    it("renders the unified 4-toe paw glyph (not the old 3-finger design)", () => {
      // Paw redesign (2026-09-02): the dock glyph had 3 rotated-ellipse
      // toes that read as a "3-finger" paw. The unified glyph matches the
      // hero variant: 4 toe circles + a pad ellipse, no rotated ellipses,
      // no path pad.
      renderButton({ variant: "dock" });
      const svg = screen.getByTestId("composer-voice-paw").querySelector("svg");
      expect(svg).not.toBeNull();
      // 4 toe circles + 1 pad ellipse.
      expect(svg?.querySelectorAll("circle")).toHaveLength(4);
      expect(svg?.querySelectorAll("ellipse")).toHaveLength(1);
      // No rotated toe ellipses (the old 3-finger design) and no path pad.
      expect(svg?.querySelectorAll("[transform]")).toHaveLength(0);
      expect(svg?.querySelectorAll("path")).toHaveLength(0);
      // The pad sits BELOW the toes (cx 32 cy 42) — same geometry as hero.
      const pad = svg?.querySelector("ellipse");
      expect(pad?.getAttribute("cx")).toBe("32");
      expect(pad?.getAttribute("cy")).toBe("42");
    });

    it("click while disconnected connects via onClick", () => {
      const rv = stubRealtimeVoice();
      renderButton({ variant: "dock", realtimeVoice: rv });
      fireEvent.click(screen.getByTestId("composer-voice-paw"));
      expect(rv.connect).toHaveBeenCalledTimes(1);
    });

    it("dock click delegates Hermes toggling when the parent owns session binding", () => {
      const rv = stubRealtimeVoice();
      const onHermesVoice = vi.fn();
      renderButton({ variant: "dock", realtimeVoice: rv, onHermesVoice });
      fireEvent.click(screen.getByTestId("composer-voice-paw"));
      expect(onHermesVoice).toHaveBeenCalledTimes(1);
      expect(rv.connect).not.toHaveBeenCalled();
      expect(rv.disconnect).not.toHaveBeenCalled();
    });

    it("click while connected appends transcript and disconnects", () => {
      const rv = stubRealtimeVoice({
        state: "connected",
        voiceState: "listening",
        userTranscript: "typed by voice",
      });
      const { onTranscriptAppend } = renderButton({
        variant: "dock",
        realtimeVoice: rv,
        voiceListening: true,
      });
      fireEvent.click(screen.getByTestId("composer-voice-paw"));
      expect(onTranscriptAppend).toHaveBeenCalledWith("typed by voice");
      expect(rv.disconnect).toHaveBeenCalledTimes(1);
    });

    it("click while connected in wake-word-only mode keeps the gate armed", () => {
      const rv = stubRealtimeVoice({
        state: "connected",
        isWakeWordOnly: true,
        voiceState: "listening",
        userTranscript: "",
      });
      const { onTranscriptAppend, onVoiceStart } = renderButton({
        variant: "dock",
        realtimeVoice: rv,
        voiceListening: true,
      });
      fireEvent.click(screen.getByTestId("composer-voice-paw"));
      expect(rv.disconnect).not.toHaveBeenCalled();
      expect(rv.connect).not.toHaveBeenCalled();
      expect(onVoiceStart).not.toHaveBeenCalled();
      expect(onTranscriptAppend).not.toHaveBeenCalled();
    });

    it("long-press ≥500ms arms wake-word mode and the trailing click is a no-op", () => {
      vi.useFakeTimers();
      try {
        const rv = stubRealtimeVoice();
        const { onVoiceStart } = renderButton({ variant: "dock", realtimeVoice: rv });
        const paw = screen.getByTestId("composer-voice-paw");

        fireEvent.pointerDown(paw);
        // Before the threshold: nothing armed yet.
        act(() => {
          vi.advanceTimersByTime(499);
        });
        expect(onVoiceStart).not.toHaveBeenCalled();
        // Crossing 500ms arms wake-word mode.
        act(() => {
          vi.advanceTimersByTime(1);
        });
        expect(onVoiceStart).toHaveBeenCalledTimes(1);
        expect(rv.connect).toHaveBeenCalledTimes(1);
        fireEvent.pointerUp(paw);
        // The click that follows the long-press must not disconnect.
        fireEvent.click(paw);
        expect(rv.disconnect).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it("pointerup before 500ms cancels the arm timer (plain click path)", () => {
      vi.useFakeTimers();
      try {
        const rv = stubRealtimeVoice();
        const { onVoiceStart } = renderButton({ variant: "dock", realtimeVoice: rv });
        const paw = screen.getByTestId("composer-voice-paw");

        fireEvent.pointerDown(paw);
        act(() => {
          vi.advanceTimersByTime(200);
        });
        fireEvent.pointerUp(paw);
        act(() => {
          vi.advanceTimersByTime(500);
        });
        expect(onVoiceStart).not.toHaveBeenCalled();
        expect(rv.connect).not.toHaveBeenCalled();
        // Plain click still connects.
        fireEvent.click(paw);
        expect(rv.connect).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
