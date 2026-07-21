// Tests for the admin HarnessesPage (built-in harness status dashboard).
//
// Mirrors PoliciesPage.test.tsx's mock shape: mock the mode-agnostic identity
// probe (resolveIdentity / getCurrentIsAdmin gate admin — works under OIDC
// too) and the useAdminHarnesses hook so no QueryClient or network is needed.
// The page is read-only — no mutations to mock.

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HarnessesPage } from "./HarnessesPage";
import * as identity from "@/lib/identity";
import * as catalog from "@/hooks/useAdminCatalog";

vi.mock("@/lib/identity", () => ({
  resolveIdentity: vi.fn(),
  getCurrentIsAdmin: vi.fn(),
}));
vi.mock("@/hooks/useAdminCatalog", () => ({
  useAdminHarnesses: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(identity.resolveIdentity).mockResolvedValue("admin");
  vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(true);
});

afterEach(() => cleanup());

type Harness = ReturnType<typeof harness>;
function harness(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "claude-sdk",
    label: "Claude SDK",
    binary: null,
    install_status: "installed",
    login_status: "n/a",
    install_command: null,
    auth_hint: null,
    capabilities: { integration_mode: "sdk-in-process" },
    ...overrides,
  };
}

function setHarnesses(list: Harness[]) {
  vi.mocked(catalog.useAdminHarnesses).mockReturnValue({ data: list } as never);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <HarnessesPage />
    </MemoryRouter>,
  );
}

describe("HarnessesPage", () => {
  it("shows a loading state until the identity probe resolves", () => {
    vi.mocked(identity.resolveIdentity).mockReturnValue(new Promise(() => {}));
    setHarnesses([]);
    renderPage();
    expect(screen.getByText(/Loading/i)).toBeTruthy();
  });

  it("blocks non-admins with a permission message", async () => {
    vi.mocked(identity.resolveIdentity).mockResolvedValue("alice");
    vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(false);
    setHarnesses([]);
    renderPage();
    expect(
      await screen.findByText("You don't have permission to view harness status."),
    ).toBeTruthy();
  });

  it("renders one row per harness with install + login status", async () => {
    setHarnesses([
      harness({
        id: "claude-native",
        label: "Claude",
        binary: "claude",
        install_status: "installed",
        login_status: "logged_in",
        install_command: "npm install -g @anthropic-ai/claude-code",
        capabilities: { integration_mode: "native-tui" },
      }),
      harness({
        id: "antigravity-native",
        label: "Antigravity",
        binary: "agy",
        install_status: "missing",
        login_status: "n/a",
        install_command: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
        auth_hint: "run `agy` once and complete the browser sign-in",
        capabilities: { integration_mode: "native-tui" },
      }),
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Claude")).toBeTruthy();
      expect(screen.getByText("Antigravity")).toBeTruthy();
    });
  });

  it("renders the copy-meow-setup footer guidance", async () => {
    setHarnesses([harness()]);
    renderPage();
    expect(
      await screen.findByText("To install or sign in, run meow setup on the host."),
    ).toBeTruthy();
  });

  it("renders an empty-state message when the catalog is empty", async () => {
    setHarnesses([]);
    renderPage();
    expect(await screen.findByText("No harnesses found.")).toBeTruthy();
  });
});