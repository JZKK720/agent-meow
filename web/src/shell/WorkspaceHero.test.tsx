import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// WorkspaceHero renders the greeting (MeowCatMascot + i18n title) and the
// FirstBootChecklist. Stub the checklist (it self-hides on non-Docker deploys
// and persists state to localStorage — not under test here) and the i18n
// translation so the heading text is deterministic.
vi.mock("@/components/FirstBootChecklist", () => ({
  FirstBootChecklist: ({ onOpenSettings }: { onOpenSettings?: () => void }) => (
    <div data-testid="first-boot-checklist-stub" onClick={() => onOpenSettings?.()}>
      checklist
    </div>
  ),
}));
vi.mock("@/components/icons/MeowCatMascot", () => ({
  MeowCatMascot: () => <svg data-testid="meow-cat-mascot" />,
}));
vi.mock("@/lib/routing", () => ({
  useNavigate: () => vi.fn(),
}));

import { WorkspaceHero } from "./WorkspaceHero";

afterEach(() => {
  cleanup();
});

function renderHero(children: ReactNode) {
  return render(<WorkspaceHero>{children}</WorkspaceHero>);
}

describe("WorkspaceHero frame", () => {
  it("renders the mascot and the localized greeting heading", () => {
    renderHero(null);
    expect(screen.getByTestId("meow-cat-mascot")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByText("Start a new chat")).toBeTruthy();
  });

  it("renders the first-boot checklist", () => {
    renderHero(null);
    expect(screen.getByTestId("first-boot-checklist-stub")).toBeTruthy();
  });

  it("renders children inside the centered container", () => {
    renderHero(<div data-testid="hero-child">bricks</div>);
    const child = screen.getByTestId("hero-child");
    expect(child).toBeTruthy();
    // The child must sit inside the max-width flex container (the hero
    // frame owns the centering; children slot in beneath the checklist).
    expect(child.closest('[data-testid="workspace-hero"]')).toBeTruthy();
  });
});