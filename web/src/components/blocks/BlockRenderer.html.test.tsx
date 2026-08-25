// HTML code-block rendering in chat markdown.
//
// `STREAMDOWN_PLUGINS.renderers` (defined in `streamdown-security.ts`)
// wires a custom renderer for ```html code blocks: the `HtmlRenderer` in
// `htmlRenderer.tsx` sanitizes the fenced content with DOMPurify and renders
// it in a `<iframe sandbox="allow-same-origin">` (no `allow-scripts`). These
// tests drive the real `FilePathAwareMessageResponse` (which forwards the
// real `STREAMDOWN_PLUGINS`, including the `renderers` array) through a
// mocked `Streamdown` that simulates dispatching an ```html code block to
// the registered html renderer — the same simulation the plan's Task 5
// specifies. The test then asserts: (1) an <iframe> is rendered, (2) its
// `srcdoc` carries the sanitized HTML, and (3) `<script>` tags are stripped.

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock Streamdown to simulate dispatching an ```html code block to the
// `renderers` entry wired in `STREAMDOWN_PLUGINS`. `defaultRehypePlugins`
// must be present (even empty) because `streamdown-security.ts` calls
// `Object.entries(defaultRehypePlugins)` at import time; `defaultRemarkPlugins`
// is imported by `BlockRenderer.tsx` at module load. The real
// `STREAMDOWN_PLUGINS` (with our `renderers` array) flows through because we
// do NOT mock `streamdown-security` — only the `Streamdown` component.
vi.mock("streamdown", () => ({
  Streamdown: ({ plugins, children }: {
    plugins?: { renderers?: Array<{ language: string | string[]; component: React.ComponentType<any> }> };
    children?: React.ReactNode;
  }) => {
    const renderers = plugins?.renderers ?? [];
    const htmlRenderer = renderers.find((r) =>
      Array.isArray(r.language) ? r.language.includes("html") : r.language === "html",
    );
    if (htmlRenderer && typeof children === "string") {
      const match = children.match(/```html\n([\s\S]*?)```/);
      if (match) {
        const HtmlComp = htmlRenderer.component;
        return <HtmlComp code={match[1] ?? ""} isIncomplete={false} language="html" />;
      }
    }
    return <div>{children}</div>;
  },
  defaultRehypePlugins: {},
  defaultRemarkPlugins: {},
}));

// `@streamdown/mermaid` is imported by `streamdown-security.ts`; provide a
// benign plugin value so that import resolves without the real bundle.
vi.mock("@streamdown/mermaid", () => ({
  mermaid: { name: "mermaid", type: "diagram", language: "mermaid" },
}));

// `@streamdown/cjk` / `@streamdown/math` are also imported by
// `streamdown-security.ts`; stub them so module load does not pull the real
// (heavy) bundles.
vi.mock("@streamdown/cjk", () => ({ cjk: { type: "cjk" } }));
vi.mock("@streamdown/math", () => ({ math: {} }));

// The inline-code and image renderers in `BlockRenderer.tsx` consume the
// FileViewerContext and workspace hooks; mock the surface so the module
// loads cleanly without the filesystem queries.
vi.mock("@/shell/FileViewerContext", () => ({
  useFileViewer: () => null,
  useFileViewerConversationId: () => "conv123",
  useIsChangedPath: () => () => false,
  useWorkspacePaths: () => ({ root: "/workspace", home: "/home" }),
}));

vi.mock("@/hooks/useWorkspaceChangedFiles", () => ({
  toWorkspaceRelativePath: (text: string) => text,
  useWorkspaceFileExists: () => false,
}));

vi.mock("@/components/ImageLightbox", () => ({
  ZoomableImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <div data-testid="zi" data-src={src ?? ""} data-alt={alt ?? ""} />
  ),
}));

import { FilePathAwareMessageResponse } from "./BlockRenderer";

describe("HTML rendering", () => {
  it("renders an HTML code block in a sandboxed iframe", () => {
    const md = '```html\n<div style="color:red">Hi</div>\n```';
    const { container } = render(
      <FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    // No allow-scripts: scripts must not execute inside the frame.
    expect(iframe?.getAttribute("sandbox")).toContain("allow-same-origin");
    expect(iframe?.getAttribute("sandbox")).not.toContain("allow-scripts");
    // The sanitized HTML survives into srcdoc.
    expect(iframe?.getAttribute("srcdoc")).toContain("color:red");
    // Accessibility: the iframe has a title.
    expect(iframe?.getAttribute("title")).toBeTruthy();
  });

  it("strips <script> tags from the HTML before rendering", () => {
    const md = "```html\n<div>safe</div><script>alert(1)</script>\n```";
    const { container } = render(
      <FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("srcdoc")).toContain("safe");
    expect(iframe?.getAttribute("srcdoc")).not.toContain("script");
  });

  it("strips inline event handlers (onclick) from the HTML", () => {
    const md = '```html\n<div onclick="alert(1)">safe</div>\n```';
    const { container } = render(
      <FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("srcdoc")).toContain("safe");
    expect(iframe?.getAttribute("srcdoc")).not.toContain("onclick");
  });
});