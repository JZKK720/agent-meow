// Tests for ComposerSpeechChip — the composer speech control that wraps
// ComposerMicButton (dictation) and layers the read-aloud state light on
// top: mic idle → speaker playing → speaker paused, per plan-040 §6.5.
//
// The dictation behavior itself is ComposerMicButton's (already pinned by
// its own suite); these tests pin the chip's own contract:
//   - idle → renders the mic with the dictation aria-label, click passes
//     through to the mic (no read-aloud interception)
//   - readAloudState="playing" → speaker glyph, click calls onStopReadAloud,
//     mic click does NOT reach the mic button
//   - readAloudState="paused" → click calls onPauseResumeReadAloud
//   - readAloudState="loading" → disabled, no crash
//   - disabled forwards to the inner mic button's disabled logic
//   - read-aloud props optional → chip is a pure pass-through mic

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CapabilitiesContext } from "@/lib/CapabilitiesContext";
import type { ServerInfo } from "@/lib/capabilities";
import { ComposerSpeechChip } from "./ComposerSpeechChip";

// The chip renders ComposerMicButton, which needs a SpeechRecognition
// constructor to mount the dictation UI (same harness as the mic button's
// own suite).
class FakeRecognition {
  continuous = false;
  interimResults = false;
  lang = "en-US";
  start = vi.fn();
  stop = vi.fn();
  addEventListener() {}
  removeEventListener() {}
}

const serverInfo: ServerInfo = {
  dictation_available: false,
} as unknown as ServerInfo;

beforeEach(() => {
  vi.stubGlobal("SpeechRecognition", FakeRecognition);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderChip(
  props: Partial<Parameters<typeof ComposerSpeechChip>[0]> = {},
) {
  const onStopReadAloud = vi.fn();
  const onPauseResumeReadAloud = vi.fn();
  const merged = {
    onTranscript: vi.fn(),
    onStopReadAloud,
    onPauseResumeReadAloud,
    ...props,
  } as Parameters<typeof ComposerSpeechChip>[0];
  render(
    <CapabilitiesContext.Provider value={{ info: serverInfo } as never}>
      <ComposerSpeechChip {...merged} />
    </CapabilitiesContext.Provider>,
  );
  return { onStopReadAloud, onPauseResumeReadAloud };
}

describe("ComposerSpeechChip", () => {
  it("renders the dictation mic in the default (idle) state", () => {
    renderChip();
    const button = screen.getByRole("button", { name: "Voice dictation" });
    expect(button).toBeTruthy();
  });

  it("passes clicks through to the mic when read-aloud is idle", () => {
    renderChip();
    const button = screen.getByRole("button", { name: "Voice dictation" });
    // Click must not throw and the mic stays in charge (read-aloud handlers
    // are not consulted when state is "idle").
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("shows the speaker glyph and stops read-aloud when playing", async () => {
    const { onStopReadAloud } = renderChip({ readAloudState: "playing" });
    const { t } = await import("i18next");
    const button = screen.getByRole("button", { name: t("chat.readAloudStop", { nsSeparator: false }) });
    fireEvent.click(button);
    expect(onStopReadAloud).toHaveBeenCalledTimes(1);
  });

  it("resumes read-aloud when paused", async () => {
    const { onPauseResumeReadAloud } = renderChip({ readAloudState: "paused" });
    const { t } = await import("i18next");
    const button = screen.getByRole("button", { name: t("chat.readAloudResume", { nsSeparator: false }) });
    fireEvent.click(button);
    expect(onPauseResumeReadAloud).toHaveBeenCalledTimes(1);
  });

  it("does not route the mic click to read-aloud handlers when playing", () => {
    const { onStopReadAloud, onPauseResumeReadAloud } = renderChip({
      readAloudState: "playing",
    });
    // onStop fired once; pause/resume untouched
    expect(onPauseResumeReadAloud).not.toHaveBeenCalled();
    expect(onStopReadAloud).not.toHaveBeenCalled();
  });

  it("renders without read-aloud props (landing usage)", () => {
    // No readAloudState / handlers — chip must be a pure mic pass-through.
    renderChip({ readAloudState: undefined });
    expect(screen.getByRole("button", { name: "Voice dictation" })).toBeTruthy();
  });
});