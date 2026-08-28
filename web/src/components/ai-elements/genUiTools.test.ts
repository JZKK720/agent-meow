import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createGenUiToolProvider,
  handleGenUiAction,
} from "./genUiTools";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("createGenUiToolProvider", () => {
  it("returns null when fetch is unavailable (SSR/tests)", () => {
    // jsdom provides fetch, so stub it away to simulate SSR.
    vi.stubGlobal("fetch", undefined);
    expect(createGenUiToolProvider()).toBeNull();
  });

  it("returns a callTool function in the browser", () => {
    const provider = createGenUiToolProvider();
    expect(provider).not.toBeNull();
    expect(typeof provider?.callTool).toBe("function");
  });

  it("fetches the mapped endpoint for a known tool", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: "conv_1" }]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = createGenUiToolProvider();
    const result = await provider!.callTool("list_sessions", { limit: 5 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/sessions?limit=5",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(result).toEqual([{ id: "conv_1" }]);
  });

  it("uses the default limit when args omit it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = createGenUiToolProvider();
    await provider!.callTool("list_sessions", {});

    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/sessions?limit=20",
      expect.anything(),
    );
  });

  it.each(["list_hosts", "stack_status", "list_projects"])(
    "maps %s to its endpoint",
    async (tool) => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal("fetch", fetchMock);

      const provider = createGenUiToolProvider();
      await provider!.callTool(tool, {});

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url.startsWith("/v1/")).toBe(true);
    },
  );

  it("throws for unknown tool names", async () => {
    const provider = createGenUiToolProvider();
    await expect(provider!.callTool("drop_database", {})).rejects.toThrow(
      /Unknown genui tool/,
    );
  });

  it("throws on HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const provider = createGenUiToolProvider();
    await expect(provider!.callTool("list_hosts", {})).rejects.toThrow(
      /HTTP 500/,
    );
  });
});

describe("handleGenUiAction", () => {
  it("opens http(s) URLs in a new tab", () => {
    const openSpy = vi.fn();
    vi.stubGlobal("open", openSpy);

    handleGenUiAction({ type: "open_url", params: { url: "https://example.com" } });

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("ignores non-http URL schemes", () => {
    const openSpy = vi.fn();
    vi.stubGlobal("open", openSpy);

    handleGenUiAction({ type: "open_url", params: { url: "javascript:alert(1)" } });
    handleGenUiAction({ type: "open_url", params: { url: "file:///etc/passwd" } });

    expect(openSpy).not.toHaveBeenCalled();
  });

  it("invokes the continue callback with the message", () => {
    const onContinue = vi.fn();
    handleGenUiAction(
      {
        type: "continue_conversation",
        params: { message: "Show me last week" },
      },
      onContinue,
    );
    expect(onContinue).toHaveBeenCalledWith("Show me last week");
  });

  it("ignores unknown action types", () => {
    const onContinue = vi.fn();
    const openSpy = vi.fn();
    vi.stubGlobal("open", openSpy);

    handleGenUiAction({ type: "custom_thing", params: {} }, onContinue);

    expect(onContinue).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });
});
