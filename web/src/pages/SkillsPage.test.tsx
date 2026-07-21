// Tests for the admin SkillsPage (discoverable skills catalog).
//
// Mirrors HarnessesPage.test.tsx's mock shape: mock the mode-agnostic identity
// probe (resolveIdentity / getCurrentIsAdmin gate admin — works under OIDC
// too) and the useAdminSkills hook so no QueryClient or network is needed.
// The page is read-only — no mutations to mock.

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SkillsPage } from "./SkillsPage";
import * as identity from "@/lib/identity";
import * as catalog from "@/hooks/useAdminCatalog";

vi.mock("@/lib/identity", () => ({
  resolveIdentity: vi.fn(),
  getCurrentIsAdmin: vi.fn(),
}));
vi.mock("@/hooks/useAdminCatalog", () => ({
  useAdminSkills: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(identity.resolveIdentity).mockResolvedValue("admin");
  vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(true);
});

afterEach(() => cleanup());

type Skill = ReturnType<typeof skill>;
function skill(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: "code-review",
    description: "Review PRs for convention compliance.",
    source: "bundle",
    source_path: "/agents/skills/code-review",
    bundled_in_agents: ["ag_abc"],
    blocked: false,
    blocked_by_policy: null,
    ...overrides,
  };
}

function setSkills(list: Skill[]) {
  vi.mocked(catalog.useAdminSkills).mockReturnValue({ data: list } as never);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SkillsPage />
    </MemoryRouter>,
  );
}

describe("SkillsPage", () => {
  it("shows a loading state until the identity probe resolves", () => {
    vi.mocked(identity.resolveIdentity).mockReturnValue(new Promise(() => {}));
    setSkills([]);
    renderPage();
    expect(screen.getByText(/Loading/i)).toBeTruthy();
  });

  it("blocks non-admins with a permission message", async () => {
    vi.mocked(identity.resolveIdentity).mockResolvedValue("alice");
    vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(false);
    setSkills([]);
    renderPage();
    expect(
      await screen.findByText("You don't have permission to view skills."),
    ).toBeTruthy();
  });

  it("renders one row per skill with name + source", async () => {
    setSkills([
      skill({ name: "code-review", source: "bundle", bundled_in_agents: ["ag_abc"] }),
      skill({
        name: "summarize-changes",
        source: "host",
        source_path: "~/.claude/skills/summarize-changes",
        bundled_in_agents: [],
      }),
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("code-review")).toBeTruthy();
      expect(screen.getByText("summarize-changes")).toBeTruthy();
    });
  });

  it("renders a blocked badge + manage link for blocked skills", async () => {
    setSkills([
      skill({
        name: "dangerous-skill",
        blocked: true,
        blocked_by_policy: "block_risky_skills",
      }),
    ]);
    renderPage();
    expect(await screen.findByText("dangerous-skill")).toBeTruthy();
    // The blocked badge + a link to the Policies page (block_skills policy).
    expect(screen.getByText(/blocked/i)).toBeTruthy();
  });

  it("renders an empty-state message when no skills are discoverable", async () => {
    setSkills([]);
    renderPage();
    expect(await screen.findByText("No skills found.")).toBeTruthy();
  });
});