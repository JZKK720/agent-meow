// Tests for WorkspaceFolderSelector — the left-Sidebar surface for
// picking a local path as the dedicated file folder for agent-meow.

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceFolderSelector } from "./WorkspaceFolderSelector";

// Mock useServerInfo — single-user mode with a default_workspace.
vi.mock("@/lib/CapabilitiesContext", () => ({
  useServerInfo: () => ({
    single_user: true,
    default_workspace: "~/agent-meow-workspace",
    accounts_enabled: false,
    login_url: null,
    needs_setup: false,
  }),
}));

// Mock isSingleUserMode — delegates to the mocked useServerInfo shape.
vi.mock("@/lib/capabilities", () => ({
  isSingleUserMode: (info: { single_user?: boolean }) => info?.single_user === true,
}));

// Mock useHosts — one online local host.
vi.mock("@/hooks/useHosts", () => ({
  useHosts: () => ({
    data: [{ host_id: "host_1", name: "local", owner: "me", status: "online" }],
  }),
}));

// Mock useRecentWorkspaces — starts empty, addRecent records into state.
let recents: string[] = [];
vi.mock("@/hooks/useRecentWorkspaces", () => ({
  useRecentWorkspaces: () => ({
    recent: recents,
    addRecent: (path: string) => {
      recents = [path, ...recents.filter((p) => p !== path)].slice(0, 8);
    },
  }),
}));

// Mock WorkspacePathField — just render a text input so we can type
// and commit via onCommit.
vi.mock("./WorkspacePathField", () => ({
  WorkspacePathField: ({
    value,
    onChange,
    onCommit,
  }: {
    value: string;
    onChange: (v: string) => void;
    onCommit: (path: string) => void;
  }) => (
    <input
      data-testid="workspace-path-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(value);
      }}
    />
  ),
}));

describe("WorkspaceFolderSelector", () => {
  beforeEach(() => {
    recents = [];
  });

  it("renders the default workspace in single-user mode", () => {
    render(<WorkspaceFolderSelector onSelectWorkspace={vi.fn()} />);
    // The default_workspace basename is "agent-meow-workspace".
    expect(screen.getByText("agent-meow-workspace")).toBeTruthy();
  });

  it("expands on click to reveal the path field", () => {
    render(<WorkspaceFolderSelector onSelectWorkspace={vi.fn()} />);
    const toggle = screen.getByTestId("workspace-folder-selector");
    fireEvent.click(toggle);
    expect(screen.getByTestId("workspace-path-field")).toBeTruthy();
  });

  it("calls onSelectWorkspace when the user commits a path via Enter", () => {
    const onSelect = vi.fn();
    render(<WorkspaceFolderSelector onSelectWorkspace={onSelect} />);
    fireEvent.click(screen.getByTestId("workspace-folder-selector"));
    const field = screen.getByTestId("workspace-path-field") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "/tmp/my-project" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("/tmp/my-project");
  });

  it("shows recent paths as quick-select rows after a selection", () => {
    const onSelect = vi.fn();
    render(<WorkspaceFolderSelector onSelectWorkspace={onSelect} />);
    // Expand and commit a path to populate recents.
    fireEvent.click(screen.getByTestId("workspace-folder-selector"));
    const field = screen.getByTestId("workspace-path-field") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "/tmp/project-a" } });
    fireEvent.keyDown(field, { key: "Enter" });
    // Re-expand (selection collapsed the picker).
    fireEvent.click(screen.getByTestId("workspace-folder-selector"));
    // The recent row should show the basename.
    expect(screen.getByText("project-a")).toBeTruthy();
  });
});
