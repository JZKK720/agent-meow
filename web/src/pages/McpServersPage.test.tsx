// Tests for the admin McpServersPage (cross-agent MCP server catalog).
//
// Mirrors HarnessesPage.test.tsx / SkillsPage.test.tsx's mock shape: mock the
// mode-agnostic identity probe (resolveIdentity / getCurrentIsAdmin gate admin
// — works under OIDC too) and the useAdminMcpServers hook so no QueryClient
// or network is needed. The page is read-only — no mutations to mock.

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { McpServersPage } from "./McpServersPage";
import * as identity from "@/lib/identity";
import * as catalog from "@/hooks/useAdminCatalog";

vi.mock("@/lib/identity", () => ({
  resolveIdentity: vi.fn(),
  getCurrentIsAdmin: vi.fn(),
}));
vi.mock("@/hooks/useAdminCatalog", () => ({
  useAdminMcpServers: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(identity.resolveIdentity).mockResolvedValue("admin");
  vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(true);
});

afterEach(() => cleanup());

type Server = ReturnType<typeof server>;
function server(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: "scrapling",
    transport: "stdio",
    url: null,
    command: "scrapling mcp",
    args: [],
    description: "Scrapling scraping tools",
    used_by_agents: [
      { id: "ag_abc", name: "web-research-agent", session_id: null, session_scoped: false },
    ],
    used_by_session_count: 0,
    ...overrides,
  };
}

function setServers(list: Server[]) {
  vi.mocked(catalog.useAdminMcpServers).mockReturnValue({ data: list } as never);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <McpServersPage />
    </MemoryRouter>,
  );
}

describe("McpServersPage", () => {
  it("shows a loading state until the identity probe resolves", () => {
    vi.mocked(identity.resolveIdentity).mockReturnValue(new Promise(() => {}));
    setServers([]);
    renderPage();
    expect(screen.getByText(/Loading/i)).toBeTruthy();
  });

  it("blocks non-admins with a permission message", async () => {
    vi.mocked(identity.resolveIdentity).mockResolvedValue("alice");
    vi.mocked(identity.getCurrentIsAdmin).mockReturnValue(false);
    setServers([]);
    renderPage();
    expect(
      await screen.findByText("You don't have permission to view MCP servers."),
    ).toBeTruthy();
  });

  it("renders one card per MCP server with name + transport summary", async () => {
    setServers([
      server({ name: "scrapling", transport: "stdio", command: "scrapling mcp" }),
      server({
        name: "sentry",
        transport: "http",
        url: "https://mcp.sentry.dev/mcp",
        command: null,
        description: null,
      }),
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("scrapling")).toBeTruthy();
      expect(screen.getByText("sentry")).toBeTruthy();
    });
  });

  it("renders the used-by-agents list with agent names", async () => {
    setServers([
      server({
        name: "sentry",
        transport: "http",
        url: "https://mcp.sentry.dev",
        command: null,
        used_by_agents: [
          { id: "ag_a", name: "web-research-agent", session_id: null, session_scoped: false },
          { id: "ag_b", name: "ops-agent", session_id: null, session_scoped: false },
        ],
        used_by_session_count: 0,
      }),
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("web-research-agent")).toBeTruthy();
      expect(screen.getByText("ops-agent")).toBeTruthy();
    });
  });

  it("renders an empty-state message when no MCP servers are declared", async () => {
    setServers([]);
    renderPage();
    expect(await screen.findByText("No MCP servers found.")).toBeTruthy();
  });
});