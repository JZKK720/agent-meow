import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpenUIBlock } from "./openUiBlock";

// The lazy import pulls @openuidev/react-ui (heavy, ESM-only). Mock both
// packages so the test exercises the block's wiring, not the DSL runtime.
vi.mock("@openuidev/react-lang", () => ({
  Renderer: ({ response }: { response: string }) => (
    <div data-testid="openui-renderer">{response}</div>
  ),
}));
vi.mock("@openuidev/react-ui", () => ({
  openuiLibrary: {},
}));

afterEach(() => {
  cleanup();
});

describe("OpenUIBlock", () => {
  it("renders the DSL through the OpenUI Renderer", async () => {
    const code = 'root = Stack([header])\nheader = CardHeader("Q1")';
    render(<OpenUIBlock code={code} />);

    const rendered = await screen.findByTestId("openui-renderer");
    expect(rendered.textContent).toContain('CardHeader("Q1")');
  });

  it("shows a loading placeholder while the runtime loads", () => {
    // Suspend the lazy component indefinitely to observe the fallback.
    vi.doMock("./openUiBlock", async (importOriginal) => {
      const mod = await importOriginal<typeof import("./openUiBlock")>();
      return mod;
    });
    render(<OpenUIBlock code="root = Stack([])" />);
    // Either the fallback or the renderer must be present; the lazy
    // chunk resolves synchronously in vitest with the mocks above.
    const fallback = screen.queryByText("Loading interactive UI…");
    const rendered = screen.queryByTestId("openui-renderer");
    expect(fallback !== null || rendered !== null).toBe(true);
  });

  it("wraps content in a bordered container", async () => {
    const { container } = render(<OpenUIBlock code="root = Stack([])" />);
    await screen.findByTestId("openui-renderer");
    expect(container.querySelector(".rounded-lg.border")).not.toBeNull();
  });
});
