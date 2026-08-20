import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssistantAvatar } from "./AssistantAvatar";

// The persistent MeowCat avatar beside every assistant reply. It must reuse
// the working-indicator's `meowcat-working` class so the bob + blink
// animation (index.css keyframes) drives it — a bare icon would render
// static and lose the "alive" feel the working indicator established.
describe("AssistantAvatar", () => {
  it("renders the MeowCat icon with the meowcat-working animation class", () => {
    const { container } = render(<AssistantAvatar />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.className.baseVal ?? svg?.getAttribute("class")).toContain("meowcat-working");
  });

  it("is decorative (aria-hidden) so screen readers skip it", () => {
    const { container } = render(<AssistantAvatar />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("merges a caller className without dropping the animation class", () => {
    const { container } = render(<AssistantAvatar className="mt-0.5" />);
    const cls = container.querySelector("svg")?.getAttribute("class") ?? "";
    expect(cls).toContain("meowcat-working");
    expect(cls).toContain("mt-0.5");
  });
});
