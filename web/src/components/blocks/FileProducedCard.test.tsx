import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/components/SessionImage", () => ({
  SessionImage: ({ path, alt }: any) => (
    <div data-testid="session-image" data-path={path} data-alt={alt} />
  ),
}));

vi.mock("@/components/ImageLightbox", () => ({
  ZoomableImage: ({ src, alt }: any) => (
    <div data-testid="zoomable" data-src={src} data-alt={alt} />
  ),
}));

import { FileProducedCard } from "./FileProducedCard";

const baseFile = {
  path: "output.png",
  mime: "image/png",
  size: 1024,
  contentUrl: "/v1/sessions/abc/resources/files/output.png/content",
};

describe("FileProducedCard", () => {
  it("renders SessionImage for image/* MIME", () => {
    const { getByTestId } = render(<FileProducedCard file={baseFile} />);
    expect(getByTestId("session-image")).toBeTruthy();
    expect(getByTestId("session-image").getAttribute("data-path")).toBe(baseFile.contentUrl);
  });

  it("renders <video> for video/* MIME", () => {
    const videoFile = { ...baseFile, mime: "video/mp4", path: "demo.mp4", contentUrl: "/v1/sessions/abc/resources/files/demo.mp4/content" };
    const { container } = render(<FileProducedCard file={videoFile} />);
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe(videoFile.contentUrl);
    expect(video?.getAttribute("controls")).not.toBeNull();
  });

  it("renders file chip for other MIME types", () => {
    const otherFile = { ...baseFile, mime: "application/pdf", path: "report.pdf", contentUrl: "/v1/sessions/abc/resources/files/report.pdf/content" };
    const { getByText } = render(<FileProducedCard file={otherFile} />);
    expect(getByText("report.pdf")).toBeTruthy();
  });

  it("formats file size in human-readable format", () => {
    const bigFile = { ...baseFile, mime: "application/pdf", path: "report.pdf", size: 1048576, contentUrl: "/v1/sessions/abc/resources/files/report.pdf/content" };
    const { container } = render(<FileProducedCard file={bigFile} />);
    expect(container.textContent).toMatch(/1\.0 MB|1 MB|1024 KB/);
  });
});