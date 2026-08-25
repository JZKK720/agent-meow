// Relative image path resolution in chat markdown.
//
// Agent-authored markdown often references generated files by a bare relative
// path (`![chart](output.png)`). `ZoomableMarkdownImage` must rewrite that to
// the session's file-content API (`/v1/sessions/{id}/resources/files/.../content`)
// so the image actually loads, while leaving absolute URLs and existing `/v1/`
// API paths untouched.
//
// These tests exercise the real `ZoomableMarkdownImage` (the `img` slot of
// `FILE_PATH_AWARE_COMPONENTS`) by rendering markdown through a real
// react-markdown + remark-gfm pipeline standing in for `MessageResponse`. The
// Streamdown/MessageResponse layer is mocked so we don't pull in the full chat
// stack; react-markdown parses `![alt](src)` and routes the `<img>` to the
// component under test, which then resolves the path and renders `ZoomableImage`
// (also mocked, to capture the resolved `src`).

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
// runs as the `img` renderer). This isolates the path-resolution behavior from
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

describe("Relative image path resolution", () => {
  it("resolves a relative path to the session file-content URL", () => {
    const md = "![chart](output.png)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    expect(img?.getAttribute("data-src")).toBe(
      "/v1/sessions/conv123/resources/files/output.png/content",
    );
    expect(img?.getAttribute("data-alt")).toBe("chart");
  });

  it("URL-encodes spaces in relative paths", () => {
    // Angle-bracket URL form so react-markdown parses a path with spaces.
    const md = "![plot](<sub dir/plot 1.png>)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    // react-markdown percent-encodes spaces itself; the resolver then encodes
    // the remaining special chars (slash). The key assertion: the rewritten URL
    // targets the session file-content endpoint with no raw spaces.
    const src = img?.getAttribute("data-src") ?? "";
    expect(src).toContain("/v1/sessions/conv123/resources/files/");
    expect(src).toContain("/content");
    expect(src).not.toContain(" ");
  });

  it("passes absolute http URLs through unchanged", () => {
    const md = "![logo](https://example.com/logo.png)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    expect(img?.getAttribute("data-src")).toBe("https://example.com/logo.png");
  });

  it("passes existing /v1/ API paths through unchanged", () => {
    const md = "![img](/v1/sessions/abc/images/xyz)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    expect(img?.getAttribute("data-src")).toBe("/v1/sessions/abc/images/xyz");
  });
});