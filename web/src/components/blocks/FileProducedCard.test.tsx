import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

// Mock authenticatedFetch to return JSON with base64 content
const mockFetch = vi.fn();
vi.mock("@/lib/identity", () => ({
  authenticatedFetch: (...args: any[]) => mockFetch(...args),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockObjectURL = "blob:mock-url";
vi.stubGlobal("URL", {
  ...URL,
  createObjectURL: vi.fn(() => mockObjectURL),
  revokeObjectURL: vi.fn(),
});

import { FileProducedCard } from "./FileProducedCard";

const baseFile = {
  path: "output.png",
  mime: "application/octet-stream",
  size: 1024,
  contentUrl: "/v1/sessions/abc/resources/environments/default/filesystem/output.png",
};

describe("FileProducedCard", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        object: "session.environment.filesystem.file_content",
        path: "output.png",
        content_type: "image/png",
        encoding: "base64",
        content: btoa("fake-image-data"),
        bytes: 15,
      }),
    });
  });

  it("renders <img> with blob URL for image files", async () => {
    const { container } = render(<FileProducedCard file={baseFile} />);
    // Wait for blob URL to be created
    await waitFor(() => {
      const img = container.querySelector("img");
      expect(img).toBeTruthy();
      expect(img?.getAttribute("src")).toBe(mockObjectURL);
    });
  });

  it("renders <video> with blob URL for video files", async () => {
    const videoFile = { ...baseFile, path: "demo.mp4" };
    const { container } = render(<FileProducedCard file={videoFile} />);
    await waitFor(() => {
      const video = container.querySelector("video");
      expect(video).toBeTruthy();
      expect(video?.getAttribute("src")).toBe(mockObjectURL);
      expect(video?.getAttribute("controls")).not.toBeNull();
    });
  });

  it("renders file chip for non-image/non-video files", () => {
    const pdfFile = { ...baseFile, path: "report.pdf" };
    const { getByText } = render(<FileProducedCard file={pdfFile} />);
    expect(getByText("report.pdf")).toBeTruthy();
  });

  it("formats file size in human-readable format", () => {
    const bigFile = { ...baseFile, path: "report.pdf", size: 1048576 };
    const { container } = render(<FileProducedCard file={bigFile} />);
    expect(container.textContent).toMatch(/1\.0 MB|1 MB|1024 KB/);
  });
});