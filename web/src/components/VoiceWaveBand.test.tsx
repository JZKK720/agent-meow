// Tests for VoiceWaveBand — the visual wave-band decoration flanking the
// paw mic button. Pure CSS animation, so we don't assert on motion; we
// assert on the structure that makes the bars look organic:
//
//   1. Bars have varied (non-uniform) base heights — sound-wave look
//      requires asymmetry, not synchronized squares.
//   2. Each bar carries its own --bar-lo / --bar-peak CSS variables so
//      the shared keyframe (voicewaveband-wiggle) reads distinct values
//      per bar.
//   3. Each bar has its own animation period — preventing lockstep.
//   4. The right side mirrors the left side (profiles reversed) so the
//      two bands read as a mirrored waveform.
//   5. When isListening is false, the animation is "none" (bars are still).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VoiceWaveBand } from "./VoiceWaveBand";

function getBarStyle(node: HTMLElement): CSSStyleDeclaration {
  // jsdom implements inline `style` as a CSSStyleDeclaration proxy; reading
  // `.getPropertyValue` on it returns the value the React render emitted.
  return (node as unknown as { style: CSSStyleDeclaration }).style;
}

describe("VoiceWaveBand", () => {
  it("renders 5 bars with varied heights (no two adjacent bars equal)", () => {
    const { container } = render(
      <VoiceWaveBand isListening side="left" />,
    );
    const bars = container.querySelectorAll("span");
    expect(bars).toHaveLength(5);

    const heights = Array.from(bars).map(
      (b) => getBarStyle(b as HTMLElement).height,
    );
    // Every bar should have a px height; none should be the "uniform" 32px
    // the previous implementation emitted.
    for (const h of heights) {
      expect(h).toMatch(/^\d+(\.\d+)?px$/);
      expect(h).not.toBe("32px");
    }

    // At least one adjacent pair must differ — otherwise the look is the
    // "evenly squared waveband" the user reported.
    let differingAdjacent = false;
    for (let i = 1; i < heights.length; i += 1) {
      if (heights[i] !== heights[i - 1]) {
        differingAdjacent = true;
        break;
      }
    }
    expect(differingAdjacent).toBe(true);
  });

  it("emits per-bar --bar-lo and --bar-peak CSS variables for the shared keyframe", () => {
    const { container } = render(
      <VoiceWaveBand isListening side="left" />,
    );
    const bars = Array.from(container.querySelectorAll("span"));

    const loValues = bars.map(
      (b) => getBarStyle(b as HTMLElement).getPropertyValue("--bar-lo"),
    );
    const peakValues = bars.map(
      (b) => getBarStyle(b as HTMLElement).getPropertyValue("--bar-peak"),
    );

    // Every bar should set both variables; at least one pair must differ
    // for the wave to look organic.
    expect(loValues.every((v) => v.length > 0)).toBe(true);
    expect(peakValues.every((v) => v.length > 0)).toBe(true);
    expect(new Set(loValues).size).toBeGreaterThan(1);
    expect(new Set(peakValues).size).toBeGreaterThan(1);
  });

  it("uses distinct animation periods so bars desync", () => {
    const { container } = render(
      <VoiceWaveBand isListening side="left" />,
    );
    const animations = Array.from(container.querySelectorAll("span")).map(
      (b) => getBarStyle(b as HTMLElement).animation,
    );
    // Pull the duration token out of each shorthand — second numeric field.
    // "voicewaveband-wiggle 1.2s ease-in-out -180ms infinite"
    const durations = animations.map((a) => a.split(/\s+/)[1]);
    expect(new Set(durations).size).toBeGreaterThan(1);
  });

  it("mirrors the left band on the right (reversed profiles)", () => {
    // Render both bands in the same tree — @testing-library's render
    // returns a single container; both VoiceWaveBand instances share it.
    const { container } = render(
      <>
        <VoiceWaveBand isListening side="left" />
        <VoiceWaveBand isListening side="right" />
      </>,
    );

    const bands = container.querySelectorAll(":scope > div");
    expect(bands).toHaveLength(2);

    const leftBars = Array.from(bands[0].querySelectorAll("span"));
    const rightBars = Array.from(bands[1].querySelectorAll("span"));
    expect(leftBars).toHaveLength(5);
    expect(rightBars).toHaveLength(5);

    const leftHeights = leftBars.map(
      (b) => getBarStyle(b as HTMLElement).height,
    );
    const rightHeights = rightBars.map(
      (b) => getBarStyle(b as HTMLElement).height,
    );

    // Right band = reverse of left band. The mirror effect makes the
    // paw button feel "framed" by the wave.
    expect(rightHeights).toEqual([...leftHeights].reverse());
  });

  it("stops animation when not listening", () => {
    const { container } = render(
      <VoiceWaveBand isListening={false} side="left" />,
    );
    const bars = Array.from(container.querySelectorAll("span"));
    for (const b of bars) {
      expect(getBarStyle(b as HTMLElement).animation).toBe("none");
    }
  });

  it("does not render when only one side is needed (sanity)", () => {
    const { container } = render(
      <VoiceWaveBand isListening side="left" />,
    );
    // One wrapper, five spans. No stray elements.
    expect(container.children).toHaveLength(1);
    expect(container.querySelectorAll("span")).toHaveLength(5);
  });
});