// Tests for SharedFolderSelector — the Files panel header's folder-path
// input + scan button.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SharedFolderSelector } from "./SharedFolderSelector";

// Mock useScanWorkspace — records calls and returns a controlled result.
const scanMutate = vi.fn();
vi.mock("@/hooks/useScanWorkspace", () => ({
  useScanWorkspace: () => ({
    mutate: scanMutate,
    isPending: false,
  }),
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

// Mock sharedFolderPreferences — backed by an in-memory store.
let storedPath: string | null = null;
vi.mock("@/lib/sharedFolderPreferences", () => ({
  readSharedFolderPath: () => storedPath,
  writeSharedFolderPath: (p: string | null) => {
    storedPath = p;
  },
}));

describe("SharedFolderSelector", () => {
  beforeEach(() => {
    recents = [];
    storedPath = null;
    scanMutate.mockReset();
  });

  it("renders the path input and scan button", () => {
    render(<SharedFolderSelector conversationId="conv_1" />);
    expect(screen.getByTestId("shared-folder-path-input")).toBeTruthy();
    expect(screen.getByTestId("shared-folder-scan-button")).toBeTruthy();
  });

  it("calls scanMutate with the typed path on Enter", () => {
    render(<SharedFolderSelector conversationId="conv_1" />);
    const input = screen.getByTestId("shared-folder-path-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "/tmp/my-project" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(scanMutate).toHaveBeenCalledWith(
      { conversationId: "conv_1", path: "/tmp/my-project" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("calls scanMutate when the Scan button is clicked", () => {
    render(<SharedFolderSelector conversationId="conv_1" />);
    const input = screen.getByTestId("shared-folder-path-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "/opt/data" } });
    fireEvent.click(screen.getByTestId("shared-folder-scan-button"));
    expect(scanMutate).toHaveBeenCalledWith(
      { conversationId: "conv_1", path: "/opt/data" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("shows recent paths in a dropdown on focus", async () => {
    recents = ["/tmp/project-a", "/home/me/repo"];
    render(<SharedFolderSelector conversationId="conv_1" />);
    const input = screen.getByTestId("shared-folder-path-input") as HTMLInputElement;
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByTestId("shared-folder-recent-dropdown")).toBeTruthy();
    });
    expect(screen.getByText("project-a")).toBeTruthy();
  });

  it("disables the scan button when path is empty", () => {
    render(<SharedFolderSelector conversationId="conv_1" />);
    const btn = screen.getByTestId("shared-folder-scan-button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("seeds the input from localStorage on mount", () => {
    storedPath = "/persisted/workspace";
    render(<SharedFolderSelector conversationId="conv_1" />);
    const input = screen.getByTestId("shared-folder-path-input") as HTMLInputElement;
    expect(input.value).toBe("/persisted/workspace");
  });
});
