import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useWorkspaceChangedFiles", () => ({
  useWorkspaceChangedFiles: vi.fn(),
}));

import { useWorkspaceChangedFiles } from "@/hooks/useWorkspaceChangedFiles";
import { useFileProducedItems } from "./useFileProducedItems";
import type { WorkspaceChangedFile, WorkspaceChangedFilesResult } from "./useWorkspaceChangedFiles";

const useWorkspaceChangedFilesMock = vi.mocked(useWorkspaceChangedFiles);

function makeChangedFile(
  overrides: Partial<WorkspaceChangedFile> = {},
): WorkspaceChangedFile {
  return {
    path: "src/foo.txt",
    name: "foo.txt",
    status: "created",
    bytes: 42,
    modified_at: null,
    lines_added: null,
    lines_removed: null,
    ...overrides,
  };
}

function setQueryData(result: WorkspaceChangedFilesResult | undefined) {
  useWorkspaceChangedFilesMock.mockReturnValue({ data: result } as never);
}

beforeEach(() => {
  useWorkspaceChangedFilesMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useFileProducedItems", () => {
  it("returns file_produced RenderItems for files with status 'created'", async () => {
    setQueryData({
      available: true,
      data: [
        makeChangedFile({ path: "src/created.txt", status: "created", bytes: 128 }),
        makeChangedFile({ path: "src/also-created.md", status: "created", bytes: 0 }),
      ],
    });

    const { result } = renderHook(() => useFileProducedItems("conv-123"));

    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current).toEqual([
      {
        kind: "file_produced",
        itemId: null,
        file: {
          path: "src/created.txt",
          mime: "application/octet-stream",
          size: 128,
          contentUrl:
            "/v1/sessions/conv-123/resources/files/src%2Fcreated.txt/content",
        },
      },
      {
        kind: "file_produced",
        itemId: null,
        file: {
          path: "src/also-created.md",
          mime: "application/octet-stream",
          size: 0,
          contentUrl:
            "/v1/sessions/conv-123/resources/files/src%2Falso-created.md/content",
        },
      },
    ]);
  });

  it("excludes files with status 'modified' or 'deleted'", async () => {
    setQueryData({
      available: true,
      data: [
        makeChangedFile({ path: "src/created.txt", status: "created", bytes: 10 }),
        makeChangedFile({ path: "src/modified.txt", status: "modified", bytes: 20 }),
        makeChangedFile({ path: "src/deleted.txt", status: "deleted", bytes: 30 }),
      ],
    });

    const { result } = renderHook(() => useFileProducedItems("conv-123"));

    await waitFor(() => expect(result.current).toHaveLength(1));
    const first = result.current[0];
    expect(first.kind).toBe("file_produced");
    if (first.kind !== "file_produced") return;
    expect(first.file.path).toBe("src/created.txt");
  });

  it("returns empty array when conversationId is undefined", () => {
    setQueryData({ available: true, data: [makeChangedFile()] });

    const { result } = renderHook(() => useFileProducedItems(undefined));

    expect(result.current).toEqual([]);
  });

  it("returns empty array when query data is undefined", () => {
    setQueryData(undefined);

    const { result } = renderHook(() => useFileProducedItems("conv-123"));

    expect(result.current).toEqual([]);
  });

  it("uses null bytes as size 0", async () => {
    setQueryData({
      available: true,
      data: [makeChangedFile({ path: "src/no-size.txt", status: "created", bytes: null })],
    });

    const { result } = renderHook(() => useFileProducedItems("conv-123"));

    await waitFor(() => expect(result.current).toHaveLength(1));
    const first = result.current[0];
    expect(first.kind).toBe("file_produced");
    if (first.kind !== "file_produced") return;
    expect(first.file.size).toBe(0);
  });
});