// Video file rendering in chat markdown.
//
// `ZoomableMarkdownImage` detects video file extensions on the resolved src
// (`.mp4`/`.webm`/`.mov`/`.avi`/`.mkv`) and renders a `<video controls>`
// element instead of passing the src to `ZoomableImage` (which renders an
// `<img>`). Image extensions (`.png`, etc.) keep rendering through the
// lightbox `ZoomableImage`.
//
// These tests exercise the real `ZoomableMarkdownImage` (the `img` slot of
// `FILE_PATH_AWARE_COMPONENTS`) by rendering markdown through a real
// react-markdown + remark-gfm pipeline standing in for `MessageResponse`, the
// same pattern used by `BlockRenderer.image-path.test.tsx`. The Streamdown /
// MessageResponse layer is mocked so we don't pull in the full chat stack;
// react-markdown parses `![alt](src)` and routes the `<img>` to the component
// under test, which resolves the path (Task 3) and then either renders
// `<video controls>` or falls back to `ZoomableImage` (mocked to capture the
// resolved `src` for the non-video cases).

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// `useFileViewerConversationId` is the only FileViewerContext hook the image
// resolver consumes; the inline-code renderer (also wired into the shared
// components map) additionally needs the others, so mock the whole surface.
vi.mock("@/shell/FileViewerContext", () => ({
  useFileViewer: () => null,
  useFileViewerConversationId: () => "conv123",
  useIsChangedPath: () => () => false,
  useWorkspacePaths: () => ({ root: "/workspace", home: "/home" }),
}));

// The inline-code renderer calls `useWorkspaceFileExists`; stub the hook (and
// `toWorkspaceRelativePath`) so the module loads without the filesystem query.
vi.mock("@/hooks/useWorkspaceChangedFiles", () => ({
  toWorkspaceRelativePath: (text: string) => text,
  useWorkspaceFileExists: () => false,
}));

// Capture the resolved src/alt without pulling in the lightbox provider.
vi.mock("@/components/ImageLightbox", () => ({
  ZoomableImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <div data-testid="zi" data-src={src ?? ""} data-alt={alt ?? ""} />
  ),
}));

// Stand in for the chat MessageResponse: parse the markdown with the same
// components map the production code wires (so the real `ZoomableMarkdownImage`
// runs as the `img` renderer). This isolates the video-detection behavior from
// Streamdown's own plugin/remark pipeline while still exercising react-markdown
// image parsing + the component under test.
vi.mock("@/components/ai-elements/message", () => ({
  MessageResponse: ({
    children,
    components,
  }: {
    children?: React.ReactNode;
    components?: Record<string, React.ComponentType<any>>;
  }) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as never}>
      {typeof children === "string" ? children : ""}
    </ReactMarkdown>
  ),
}));

// `defaultRemarkPlugins` and `defaultRehypePlugins` are imported at module load
// (the latter transitively, via ReasoningView → reasoning → streamdown-security);
// provide benign values so the imports resolve without the real Streamdown bundle.
vi.mock("streamdown", () => ({
  defaultRemarkPlugins: {},
  defaultRehypePlugins: {},
  // `StreamdownProps`/`LinkSafetyConfig` are type-only; vitest ignores them.
}));

import { FilePathAwareMessageResponse } from "./BlockRenderer";

describe("Video rendering", () => {
  it("renders <video controls> for .mp4 image links with resolved src", () => {
    const md = "![demo](demo.mp4)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe(
      "/v1/sessions/conv123/resources/files/demo.mp4/content",
    );
    // `controls` is a boolean attribute; presence is what matters.
    expect(video?.hasAttribute("controls")).toBe(true);
  });

  it("renders <video> for .webm", () => {
    const md = "![clip](clip.webm)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe(
      "/v1/sessions/conv123/resources/files/clip.webm/content",
    );
  });

  it("renders <video> for .mov, .avi, and .mkv", () => {
    for (const ext of ["mov", "avi", "mkv"] as const) {
      const md = `![clip](clip.${ext})`;
      const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
      const video = container.querySelector("video");
      expect(video, `expected <video> for .${ext}`).toBeTruthy();
    }
  });

  it("still renders <img> (ZoomableImage) for .png and not a video", () => {
    const md = "![chart](chart.png)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    expect(container.querySelector("video")).toBeFalsy();
    const img = container.querySelector('[data-testid="zi"]');
    expect(img).toBeTruthy();
    expect(img?.getAttribute("data-src")).toBe(
      "/v1/sessions/conv123/resources/files/chart.png/content",
    );
  });

  it("passes absolute video URLs through unchanged and renders <video>", () => {
    const md = "![clip](https://example.com/clip.mp4)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe("https://example.com/clip.mp4");
  });
});