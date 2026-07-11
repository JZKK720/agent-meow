import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MeowCatIcon } from "./MeowCatIcon";

afterEach(cleanup);

describe("MeowCatIcon", () => {
  it("exposes two meowcat-eye groups for the blink animation", () => {
    const { container } = render(<MeowCatIcon />);
    // The blink keyframes target `.meowcat-working .meowcat-eye` in index.css;
    // CSS selectors fail silently, so renaming/flattening these groups would
    // freeze the eyes with no other signal.
    const eyes = container.querySelectorAll("svg > g.meowcat-eye");
    // 2 = the cat's two eyes (no buddy starfish, unlike Otto's 4).
    expect(eyes).toHaveLength(2);
    // 3 paths per eye = sclera + pupil + glint; losing one shifts the
    // group's fill-box bounds and the blink no longer collapses on center.
    for (const eye of eyes) {
      expect(eye.querySelectorAll("path")).toHaveLength(3);
    }
  });

  it("wraps the cat's two pupils in meowcat-pupil groups for cursor tracking", () => {
    const { container } = render(<MeowCatIcon />);
    // MeowCatEyes finds these groups by class through the forwarded ref;
    // querySelectorAll fails silently, so renaming the class would break
    // tracking with no other signal. 2 = the cat's two eyes.
    const pupils = container.querySelectorAll("svg g.meowcat-eye > g.meowcat-pupil");
    expect(pupils).toHaveLength(2);
    // 2 paths per group = black disc + glint. The sclera must stay outside
    // the group, or it would slide along with the pupil instead of framing it.
    for (const pupil of pupils) {
      expect(pupil.querySelectorAll("path")).toHaveLength(2);
    }
  });

  it("spreads props onto the root svg and stays hidden from screen readers", () => {
    const { container } = render(<MeowCatIcon className="meowcat-working h-4" />);
    const svg = container.querySelector("svg");
    // The animation is opt-in via className, so the spread must reach the root.
    expect(svg).toHaveClass("meowcat-working");
    // The art's coordinate space; consumers size via className so a viewBox
    // change silently distorts the mascot everywhere.
    expect(svg).toHaveAttribute("viewBox", "0 0 1024 1024");
    // Decorative by default; the pin's aria-live region must only
    // ever announce the "Working…" text.
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("lets callers override aria-hidden for the new-chat hero render", () => {
    const { container } = render(
      <MeowCatIcon role="img" aria-label="agent-meow" aria-hidden={false} />,
    );
    const svg = container.querySelector("svg");
    // NewChatDialog renders the mascot as a meaningful image; the override
    // only works while the spread stays after the aria-hidden default.
    expect(svg).toHaveAttribute("aria-hidden", "false");
    expect(svg).toHaveAttribute("aria-label", "agent-meow");
  });
});