// Tests for fileIndexApi — the file-index client's path normalization and
// metadata badges (plan 039). The runner stores absolute paths; the panel
// keys rows by workspace-relative posix paths, so toRelative is the seam.

import { afterEach, describe, expect, it, vi } from "vitest";

import { getFileIndex, metaBadge, toRelative } from "./fileIndexApi";

const identityMock = vi.hoisted(() => ({ authenticatedFetch: vi.fn() }));
vi.mock("./identity", () => ({ authenticatedFetch: identityMock.authenticatedFetch }));

describe("toRelative", () => {
  it("strips the workspace prefix on posix paths", () => {
    expect(toRelative("/home/me/ws/photos/a.jpg", "/home/me/ws")).toBe("photos/a.jpg");
  });

  it("handles a trailing slash on the workspace", () => {
    expect(toRelative("/home/me/ws/a.jpg", "/home/me/ws/")).toBe("a.jpg");
  });

  it("normalizes Windows backslashes on both sides", () => {
    expect(toRelative("C:\\Users\\me\\ws\\trip\\beach.jpg", "C:\\Users\\me\\ws")).toBe(
      "trip/beach.jpg",
    );
  });

  it("returns null for paths outside the workspace (stale rows)", () => {
    expect(toRelative("/other/place/a.jpg", "/home/me/ws")).toBeNull();
  });

  it("returns null for the workspace itself", () => {
    expect(toRelative("/home/me/ws", "/home/me/ws")).toBeNull();
  });
});

describe("metaBadge", () => {
  it("prefers the capture date, reformatted EXIF-style to YYYY-MM-DD", () => {
    expect(metaBadge({ kind: "image", meta: { datetime_original: "2026:08:30 12:00:00" } })).toBe(
      "2026-08-30",
    );
  });

  it("falls back to exif_datetime when DateTimeOriginal is absent", () => {
    expect(metaBadge({ kind: "image", meta: { exif_datetime: "2025:01:02 03:04:05" } })).toBe(
      "2025-01-02",
    );
  });

  it("falls back to the camera model when there is no date", () => {
    expect(metaBadge({ kind: "image", meta: { camera_model: "EOS R5" } })).toBe("EOS R5");
  });

  it("prefers date over camera when both exist", () => {
    expect(
      metaBadge({
        kind: "image",
        meta: { datetime_original: "2026:08:30 12:00:00", camera_model: "X" },
      }),
    ).toBe("2026-08-30");
  });

  it("shows page count for documents, word count when no pages", () => {
    expect(metaBadge({ kind: "document", meta: { pages: 12, words: 500 } })).toBe("12p");
    expect(metaBadge({ kind: "document", meta: { words: 500 } })).toBe("500w");
  });

  it("returns null for empty metadata or other kinds", () => {
    expect(metaBadge({ kind: "image", meta: {} })).toBeNull();
    expect(metaBadge({ kind: "document", meta: {} })).toBeNull();
    expect(metaBadge({ kind: "other", meta: { pages: 3 } })).toBeNull();
  });

  it("ignores a truncated/short date string", () => {
    expect(metaBadge({ kind: "image", meta: { exif_datetime: "2026" } })).toBeNull();
  });
});

describe("getFileIndex", () => {
  afterEach(() => {
    identityMock.authenticatedFetch.mockReset();
  });

  it("normalizes wire rows to relative paths and skips out-of-workspace entries", async () => {
    identityMock.authenticatedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "file_index_response",
        session_id: "s1",
        workspace: "/home/me/ws",
        counts: { indexed: 2, pending: 1 },
        files: [
          {
            path: "/home/me/ws/a.jpg",
            kind: "image",
            size: 10,
            status: "indexed",
            content_hash: "h1",
            thumb_path: null,
            error: null,
            indexed_at: 5,
            meta: { camera_make: "Nikon" },
          },
          {
            path: "/elsewhere/b.jpg",
            kind: "image",
            size: 1,
            status: "indexed",
            content_hash: "h2",
            thumb_path: null,
            error: null,
            indexed_at: 5,
            meta: {},
          },
        ],
      }),
    });

    const res = await getFileIndex("s1");
    expect(res.files.map((f) => f.path)).toEqual(["a.jpg"]);
    expect(res.files[0].meta.camera_make).toBe("Nikon");
    expect(res.counts.indexed).toBe(2);
  });

  it("passes the kind filter through to the query string", async () => {
    identityMock.authenticatedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "file_index_response",
        session_id: "s1",
        workspace: null,
        counts: {},
        files: [],
      }),
    });
    await getFileIndex("s1", "image");
    const url = identityMock.authenticatedFetch.mock.calls[0][0] as string;
    expect(url).toContain("resources/file-index?kind=image");
  });
});
