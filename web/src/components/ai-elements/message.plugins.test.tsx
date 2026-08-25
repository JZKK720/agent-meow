import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock Streamdown to capture the `plugins` prop forwarded by MessageResponse.
// `defaultRehypePlugins` must be present (even if empty) because
// streamdown-security.ts calls Object.entries(defaultRehypePlugins) at import
// time — omitting it crashes the module.
vi.mock("streamdown", () => ({
  Streamdown: ({
    plugins,
    children,
  }: {
    plugins?: Record<string, unknown>;
    children?: React.ReactNode;
  }) => (
    <div
      data-testid="streamdown"
      data-plugins={plugins ? JSON.stringify(Object.keys(plugins)) : "none"}
    >
      {children}
    </div>
  ),
  defaultRehypePlugins: {},
  defaultRemarkPlugins: {},
}));

import type { PluginConfig } from "streamdown";
import { MessageResponse } from "./message";

describe("MessageResponse plugins prop", () => {
  it("forwards a caller-provided plugins prop to Streamdown, overriding defaults", () => {
    // Caller passes a plugins set with only mermaid. Because MessageResponse
    // spreads {...props} after the default plugins={STREAMDOWN_PLUGINS}, the
    // caller's value wins.
    const customPlugins = {
      mermaid: { name: "test-mermaid" },
    } as unknown as PluginConfig;

    const { getByTestId } = render(<MessageResponse plugins={customPlugins}>Hello</MessageResponse>);

    const keys = getByTestId("streamdown").getAttribute("data-plugins");
    expect(keys).toContain("mermaid");
    // Caller's plugins replace the defaults, so cjk/code/math should NOT be
    // present (the default STREAMDOWN_PLUGINS would include them).
    expect(keys).not.toContain("cjk");
    expect(keys).not.toContain("math");
  });

  it("forwards default plugins when no plugins prop is provided (backward compat)", () => {
    const { getByTestId } = render(<MessageResponse>Hello</MessageResponse>);

    const keys = getByTestId("streamdown").getAttribute("data-plugins");
    // STREAMDOWN_PLUGINS = { cjk, code, math, mermaid } — the defaults must
    // still be forwarded when the caller does not override them.
    expect(keys).toContain("mermaid");
    expect(keys).toContain("cjk");
    expect(keys).toContain("math");
  });
});