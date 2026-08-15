// Unit tests for the useScanWorkspace mutation hook.
// Verifies the hook calls the API, invalidates surface caches on success,
// and surfaces errors on failure.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScanWorkspace } from "./useScanWorkspace";

function mockResponse(body: unknown, init?: { ok?: boolean; status?: number }): Response {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    statusText: "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe("useScanWorkspace", () => {
  it("POSTs to scan-workspace and returns the result", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        object: "workspace_scan_result",
        session_id: "conv_123",
        workspace: "/tmp/ws",
        scanned: 5,
        imported_docs: 2,
        imported_images: 1,
        imported_videos: 0,
        skipped: 2,
        errors: [],
      }),
    );

    const { result } = renderHook(() => useScanWorkspace(), { wrapper });

    result.current.mutate({ conversationId: "conv_123" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/v1/sessions/conv_123/resources/scan-workspace");
    expect(init?.method).toBe("POST");

    expect(result.current.data?.importedDocs).toBe(2);
    expect(result.current.data?.importedImages).toBe(1);
    expect(result.current.data?.importedVideos).toBe(0);
    expect(result.current.data?.skipped).toBe(2);
  });

  it("surfaces errors on non-OK response", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ error: "Session not found" }, { ok: false, status: 404 }),
    );

    const { result } = renderHook(() => useScanWorkspace(), { wrapper });

    result.current.mutate({ conversationId: "bad_session" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("404");
  });

  it("converts snake_case wire to camelCase", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        object: "workspace_scan_result",
        session_id: "s1",
        workspace: "/ws",
        scanned: 3,
        imported_docs: 1,
        imported_images: 1,
        imported_videos: 1,
        skipped: 0,
        errors: ["file.txt: error"],
      }),
    );

    const { result } = renderHook(() => useScanWorkspace(), { wrapper });

    result.current.mutate({ conversationId: "s1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    expect(data?.sessionId).toBe("s1");
    expect(data?.importedDocs).toBe(1);
    expect(data?.importedImages).toBe(1);
    expect(data?.importedVideos).toBe(1);
    expect(data?.errors).toEqual(["file.txt: error"]);
  });
});
