import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Store mock: a module-level variable lets each test pick the conversationId
// the page sees, so both region states are exercised without a real store.
let MOCK_CONV_ID: string | null = null;

vi.mock("@/store/chatStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/store/chatStore")>();
  return {
    ...actual,
    useChatStore: Object.assign(
      (selector: (s: { conversationId: string | null; startSessionRequest: unknown }) => unknown) =>
        selector({ conversationId: MOCK_CONV_ID, startSessionRequest: null }),
      {
        getState: () => ({
          conversationId: MOCK_CONV_ID,
          startSessionRequest: null,
        }),
      },
    ),
  };
});

import { UnifiedWorkPage } from "./UnifiedWorkPage";

afterEach(() => {
  cleanup();
  MOCK_CONV_ID = null;
});

describe("UnifiedWorkPage regions", () => {
  beforeEach(() => {
    MOCK_CONV_ID = null;
  });

  it("renders hero region and composer slot when no session is active", () => {
    render(
      <UnifiedWorkPage
        hero={<div data-testid="hero-region">hero</div>}
        stream={<div data-testid="stream-region">stream</div>}
        composer={<textarea data-testid="composer-slot" aria-label="Message the agent" />}
      />,
    );
    expect(screen.getByTestId("hero-region")).toBeTruthy();
    expect(screen.getByTestId("composer-slot")).toBeTruthy();
    expect(screen.queryByTestId("stream-region")).toBeNull();
  });

  it("swaps hero for stream when a session is active (store-driven, no URL read)", () => {
    MOCK_CONV_ID = "conv_1";
    render(
      <UnifiedWorkPage
        hero={<div data-testid="hero-region">hero</div>}
        stream={<div data-testid="stream-region">stream</div>}
        composer={<textarea data-testid="composer-slot" aria-label="Message the agent" />}
      />,
    );
    expect(screen.getByTestId("stream-region")).toBeTruthy();
    // Composer stays mounted across the swap — the structural G2 fix.
    expect(screen.getByTestId("composer-slot")).toBeTruthy();
    expect(screen.queryByTestId("hero-region")).toBeNull();
  });

  it("marks the collapsed hero region aria-hidden so focus/AT skip it", () => {
    MOCK_CONV_ID = "conv_1";
    const { container } = render(
      <UnifiedWorkPage
        hero={<div data-testid="hero-region">hero</div>}
        stream={<div data-testid="stream-region">stream</div>}
        composer={<div data-testid="composer-slot" />}
      />,
    );
    const region = container.querySelector('[data-testid="unified-work-page"] > div');
    expect(region?.getAttribute("aria-hidden")).toBe("true");
  });
});