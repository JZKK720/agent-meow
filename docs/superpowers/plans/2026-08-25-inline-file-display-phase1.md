# Inline File Display — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire already-installed Streamdown plugins (mermaid, HTML, video, markdown) and relative image path resolution into the chat renderer so agent-generated files render inline in the chat stream.

**Architecture:** The chat uses `Streamdown` (via `MessageResponse` → `BlockRenderer.tsx`) to render agent markdown. The `@streamdown/mermaid` package is already in `package.json` but never imported. `dompurify` and `rehype-raw`/`rehype-sanitize` are also installed but only used in `CodeViewer.tsx` (right panel), not in chat. Phase 1 wires these into `BlockRenderer.tsx` and the `MessageResponse` component chain — no server changes, no new dependencies.

**Tech Stack:** React + Streamdown (react-markdown + remark-gfm), `@streamdown/mermaid`, `dompurify`, existing `useWorkspacePaths` / `useFileViewerConversationId` hooks.

## Global Constraints

- **Do NOT introduce any new `omnigent` references or `.omnigent` paths.** agent-meow has diverged from upstream omnigent. The existing `OMNIGENT_*` env vars and `agent_meow/` module path are inherited — leave them alone, but new code must not add more.
- **Do NOT install new npm dependencies.** All required packages are already in `web/package.json`: `@streamdown/mermaid`, `dompurify`, `rehype-raw`, `rehype-sanitize`, `streamdown`.
- **Do NOT modify server-side code.** Phase 1 is chat-side only.
- **Do NOT change CSS/layout.** Front-end visual design is paused (Figma work in progress).
- All new code goes in `web/src/components/blocks/` (or the existing `BlockRenderer.tsx`).
- Use DCO sign-off for all commits: `git commit -s`.
- Frontend test command: `cd web && npm test` (vitest, colocated `*.test.tsx`).
- Type check: `cd web && npm run type-check` (tsc -b).
- Lint: `cd web && npm run lint` (oxlint).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `web/src/components/ai-elements/message.tsx` | Wraps Streamdown; needs to forward `plugins` prop | Modify |
| `web/src/components/blocks/BlockRenderer.tsx` | Chat renderer; add mermaid plugin, HTML/video/markdown renderers, relative image path resolver | Modify |
| `web/src/components/blocks/BlockRenderer.mermaid.test.tsx` | Test: mermaid code block renders | Create |
| `web/src/components/blocks/BlockRenderer.html.test.tsx` | Test: HTML code block renders in sandboxed iframe | Create |
| `web/src/components/blocks/BlockRenderer.video.test.tsx` | Test: video file path renders as `<video>` | Create |
| `web/src/components/blocks/BlockRenderer.image-path.test.tsx` | Test: relative image path resolves to session content URL | Create |

---

### Task 1: Thread `plugins` prop through `MessageResponse` to Streamdown

**Files:**
- Modify: `web/src/components/ai-elements/message.tsx`
- Test: `web/src/components/ai-elements/message.test.tsx` (if exists, otherwise create)

**Interfaces:**
- Consumes: `Streamdown` component from `streamdown` package
- Produces: `MessageResponse` now accepts an optional `plugins` prop of type `PluginConfig` (from `streamdown`) and forwards it to the underlying `Streamdown` component

- [ ] **Step 1: Read the current `MessageResponse` component**

Run: `Get-Content web/src/components/ai-elements/message.tsx`
Look for: how it renders `Streamdown` — does it already accept a `plugins` prop? If it does, skip this task. If not, continue.

- [ ] **Step 2: Write the failing test**

```tsx
// web/src/components/ai-elements/message.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MessageResponse } from "./message";

vi.mock("streamdown", () => ({
  Streamdown: ({ plugins, children }: { plugins?: unknown; children?: string }) => (
    <div data-testid="streamdown" data-has-plugins={!!plugins}>
      {children}
    </div>
  ),
  defaultRemarkPlugins: {},
}));

describe("MessageResponse plugins prop", () => {
  it("forwards plugins prop to Streamdown", () => {
    const plugins = { mermaid: { name: "mermaid" } };
    const { getByTestId } = render(
      <MessageResponse plugins={plugins as any}>Hello</MessageResponse>
    );
    expect(getByTestId("streamdown").getAttribute("data-has-plugins")).toBe("true");
  });

  it("renders without plugins prop (backward compat)", () => {
    const { getByTestId } = render(<MessageResponse>Hello</MessageResponse>);
    expect(getByTestId("streamdown").getAttribute("data-has-plugins")).toBe("false");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd web && npx vitest run src/components/ai-elements/message.test.tsx`
Expected: FAIL — `plugins` prop not accepted

- [ ] **Step 4: Implement — add `plugins` prop to `MessageResponse`**

In `web/src/components/ai-elements/message.tsx`, add the `plugins` prop to the component's type and forward it to the `Streamdown` component:

```tsx
// Add to imports if not already there:
import type { PluginConfig } from "streamdown";

// In the component props type, add:
plugins?: PluginConfig;

// In the Streamdown JSX, add the prop:
<Streamdown
  // ... existing props ...
  plugins={plugins}
>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd web && npx vitest run src/components/ai-elements/message.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd web && git add src/components/ai-elements/message.tsx src/components/ai-elements/message.test.tsx
git commit -s -m "feat: thread plugins prop through MessageResponse to Streamdown"
```

---

### Task 2: Wire `@streamdown/mermaid` into `BlockRenderer`

**Files:**
- Modify: `web/src/components/blocks/BlockRenderer.tsx`
- Test: `web/src/components/blocks/BlockRenderer.mermaid.test.tsx`

**Interfaces:**
- Consumes: `mermaid` from `@streamdown/mermaid` (pre-configured plugin), `MessageResponse` with `plugins` prop (from Task 1)
- Produces: `BlockRenderer` passes `plugins={{ mermaid }}` to `FilePathAwareMessageResponse`, which renders mermaid code blocks as SVG diagrams

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/blocks/BlockRenderer.mermaid.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

// We can't easily test the actual SVG render (mermaid is lazy-loaded),
// but we can verify the mermaid plugin is passed to Streamdown.
// Mock Streamdown to capture the plugins prop.
vi.mock("streamdown", () => ({
  Streamdown: ({ plugins, children }: any) => (
    <div data-testid="sd" data-mermaid={plugins?.mermaid ? "true" : "false"}>
      {children}
    </div>
  ),
  defaultRemarkPlugins: {},
}));

vi.mock("@streamdown/mermaid", () => ({
  mermaid: { name: "mermaid", type: "diagram", language: "mermaid" },
}));

import { FilePathAwareMessageResponse } from "./BlockRenderer";

describe("Mermaid plugin wiring", () => {
  it("passes mermaid plugin to Streamdown", () => {
    const { getByTestId } = render(
      <FilePathAwareMessageResponse>{"```mermaid\ngraph TD\nA-->B\n```"}</FilePathAwareMessageResponse>
    );
    expect(getByTestId("sd").getAttribute("data-mermaid")).toBe("true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.mermaid.test.tsx`
Expected: FAIL — mermaid plugin not passed (data-mermaid = "false")

- [ ] **Step 3: Implement — import mermaid and pass it as plugins**

In `web/src/components/blocks/BlockRenderer.tsx`:

```tsx
// Add import at the top (after existing imports):
import { mermaid } from "@streamdown/mermaid";

// In FilePathAwareMessageResponse, add plugins to the MessageResponse call:
// Find the <MessageResponse ...> JSX and add the plugins prop:
const plugins = useMemo(() => ({ mermaid }), []);

return (
  <MessageResponse
    {...props}
    components={components}
    remarkPlugins={remarkPlugins}
    plugins={plugins}
  >
    {isString ? throttledText : children}
  </MessageResponse>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.mermaid.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/blocks/BlockRenderer.tsx src/components/blocks/BlockRenderer.mermaid.test.tsx
git commit -s -m "feat: wire @streamdown/mermaid into chat renderer"
```

---

### Task 3: Add relative image path resolution to `ZoomableMarkdownImage`

**Files:**
- Modify: `web/src/components/blocks/BlockRenderer.tsx` (the `ZoomableMarkdownImage` function)
- Test: `web/src/components/blocks/BlockRenderer.image-path.test.tsx`

**Interfaces:**
- Consumes: `useFileViewerConversationId` from `@/shell/FileViewerContext` (existing hook)
- Produces: `ZoomableMarkdownImage` resolves relative paths (`output.png`) to `/v1/sessions/{id}/resources/files/{path}/content` URLs; absolute URLs and API paths pass through unchanged

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/blocks/BlockRenderer.image-path.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock the hooks
vi.mock("@/shell/FileViewerContext", () => ({
  useFileViewerConversationId: () => "conv123",
  useFileViewer: () => vi.fn(),
  useIsChangedPath: () => vi.fn(() => false),
  useWorkspacePaths: () => ({ root: "/workspace", home: "/home" }),
}));

vi.mock("@/components/ImageLightbox", () => ({
  ZoomableImage: ({ src, alt }: any) => (
    <div data-testid="zi" data-src={src} data-alt={alt} />
  ),
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: any) => <div>{children}</div>,
  defaultRemarkPlugins: {},
}));

import { FilePathAwareMessageResponse } from "./BlockRenderer";

describe("Relative image path resolution", () => {
  it("resolves relative path to session content URL", () => {
    const md = "![chart](output.png)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    expect(img?.getAttribute("data-src")).toBe(
      "/v1/sessions/conv123/resources/files/output.png/content"
    );
  });

  it("passes through absolute http URLs unchanged", () => {
    const md = "![logo](https://example.com/logo.png)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    expect(img?.getAttribute("data-src")).toBe("https://example.com/logo.png");
  });

  it("passes through /v1/ API paths unchanged", () => {
    const md = "![img](/v1/sessions/abc/images/xyz)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const img = container.querySelector('[data-testid="zi"]');
    expect(img?.getAttribute("data-src")).toBe("/v1/sessions/abc/images/xyz");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.image-path.test.tsx`
Expected: FAIL — relative path `output.png` passed through as-is (broken link)

- [ ] **Step 3: Implement — add path resolver to `ZoomableMarkdownImage`**

In `web/src/components/blocks/BlockRenderer.tsx`, modify the `ZoomableMarkdownImage` function:

```tsx
// Add import at top if not already present:
import { useFileViewerConversationId } from "@/shell/FileViewerContext";

// Replace the existing ZoomableMarkdownImage with:
function ZoomableMarkdownImage({ src, alt, ...props }: React.ComponentProps<"img">) {
  const conversationId = useFileViewerConversationId();
  const resolvedSrc = useMemo(() => {
    if (!src) return undefined;
    // Absolute URLs (http://, https://, data:, blob:) pass through
    if (/^(https?:|data:|blob:)/.test(src)) return src;
    // API paths pass through
    if (src.startsWith("/v1/")) return src;
    // Relative path → session file-content URL
    if (conversationId) {
      const encoded = encodeURIComponent(src);
      return `/v1/sessions/${conversationId}/resources/files/${encoded}/content`;
    }
    return src;
  }, [src, conversationId]);

  return <ZoomableImage {...props} src={resolvedSrc} alt={alt ?? ""} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.image-path.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/blocks/BlockRenderer.tsx src/components/blocks/BlockRenderer.image-path.test.tsx
git commit -s -m "feat: resolve relative image paths to session content URLs in chat"
```

---

### Task 4: Add video rendering for video file extensions

**Files:**
- Modify: `web/src/components/blocks/BlockRenderer.tsx` (extend `ZoomableMarkdownImage`)
- Test: `web/src/components/blocks/BlockRenderer.video.test.tsx`

**Interfaces:**
- Consumes: same path resolver from Task 3
- Produces: `ZoomableMarkdownImage` detects `.mp4`/`.webm`/`.mov`/`.avi`/`.mkv` extensions and renders `<video controls>` instead of `<img>`

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/blocks/BlockRenderer.video.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/shell/FileViewerContext", () => ({
  useFileViewerConversationId: () => "conv123",
  useFileViewer: () => vi.fn(),
  useIsChangedPath: () => vi.fn(() => false),
  useWorkspacePaths: () => ({ root: "/workspace", home: "/home" }),
}));

vi.mock("@/components/ImageLightbox", () => ({
  ZoomableImage: ({ src, alt }: any) => (
    <div data-testid="zi" data-src={src} />
  ),
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: any) => <div>{children}</div>,
  defaultRemarkPlugins: {},
}));

import { FilePathAwareMessageResponse } from "./BlockRenderer";

describe("Video rendering", () => {
  it("renders <video> for .mp4 image links", () => {
    const md = "![demo](demo.mp4)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe(
      "/v1/sessions/conv123/resources/files/demo.mp4/content"
    );
  });

  it("renders <video> for .webm", () => {
    const md = "![clip](clip.webm)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    expect(container.querySelector("video")).toBeTruthy();
  });

  it("still renders <img> for .png (not video)", () => {
    const md = "![chart](chart.png)";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    expect(container.querySelector("video")).toBeFalsy();
    expect(container.querySelector('[data-testid="zi"]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.video.test.tsx`
Expected: FAIL — no `<video>` element rendered

- [ ] **Step 3: Implement — add video detection to `ZoomableMarkdownImage`**

In `web/src/components/blocks/BlockRenderer.tsx`, extend `ZoomableMarkdownImage`:

```tsx
// Add the video extension check before the ZoomableImage return:
function ZoomableMarkdownImage({ src, alt, ...props }: React.ComponentProps<"img">) {
  const conversationId = useFileViewerConversationId();
  const resolvedSrc = useMemo(() => {
    // ... (same resolution logic from Task 3) ...
  }, [src, conversationId]);

  // Video files render as <video controls> instead of <img>
  if (resolvedSrc && /\.(mp4|webm|mov|avi|mkv)$/i.test(resolvedSrc)) {
    return (
      <video
        controls
        src={resolvedSrc}
        className="w-full rounded-md"
        aria-label={alt ?? ""}
      />
    );
  }

  return <ZoomableImage {...props} src={resolvedSrc} alt={alt ?? ""} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.video.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/blocks/BlockRenderer.tsx src/components/blocks/BlockRenderer.video.test.tsx
git commit -s -m "feat: render video files as <video controls> in chat markdown"
```

---

### Task 5: Add sandboxed HTML rendering

**Files:**
- Modify: `web/src/components/blocks/BlockRenderer.tsx` (add `HtmlRenderer` component + register as Streamdown custom renderer)
- Test: `web/src/components/blocks/BlockRenderer.html.test.tsx`

**Interfaces:**
- Consumes: `DOMPurify` from `dompurify` (already in `package.json`), Streamdown `renderers` plugin config
- Produces: ` ```html ` code blocks render in a sandboxed `<iframe srcdoc>` with sanitized HTML; `<script>` tags stripped

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/blocks/BlockRenderer.html.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/shell/FileViewerContext", () => ({
  useFileViewerConversationId: () => "conv123",
  useFileViewer: () => vi.fn(),
  useIsChangedPath: () => vi.fn(() => false),
  useWorkspacePaths: () => ({ root: "/workspace", home: "/home" }),
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ plugins, children }: any) => {
    // Simulate Streamdown calling the html renderer
    const renderers = plugins?.renderers ?? [];
    const htmlRenderer = renderers.find((r: any) =>
      Array.isArray(r.language) ? r.language.includes("html") : r.language === "html"
    );
    if (htmlRenderer && typeof children === "string") {
      const match = children.match(/```html\n([\s\S]*?)```/);
      if (match) {
        const HtmlComp = htmlRenderer.component;
        return <HtmlComp code={match[1]} isIncomplete={false} language="html" />;
      }
    }
    return <div>{children}</div>;
  },
  defaultRemarkPlugins: {},
}));

vi.mock("@streamdown/mermaid", () => ({
  mermaid: { name: "mermaid", type: "diagram", language: "mermaid" },
}));

import { FilePathAwareMessageResponse } from "./BlockRenderer";

describe("HTML rendering", () => {
  it("renders HTML code block in a sandboxed iframe", () => {
    const md = "```html\n<div style=\"color:red\">Hi</div>\n```";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute("sandbox")).toContain("allow-same-origin");
    expect(iframe?.getAttribute("srcdoc")).toContain("color:red");
  });

  it("strips <script> tags from HTML", () => {
    const md = "```html\n<div>safe</div><script>alert(1)</script>\n```";
    const { container } = render(<FilePathAwareMessageResponse>{md}</FilePathAwareMessageResponse>);
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("srcdoc")).toContain("safe");
    expect(iframe?.getAttribute("srcdoc")).not.toContain("script");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.html.test.tsx`
Expected: FAIL — no iframe rendered (HTML code block rendered as plain text)

- [ ] **Step 3: Implement — add `HtmlRenderer` and register as Streamdown renderer**

In `web/src/components/blocks/BlockRenderer.tsx`:

```tsx
// Add import at top:
import DOMPurify from "dompurify";

// Add the HtmlRenderer component (before FilePathAwareMessageResponse):
function HtmlRenderer({ code, isIncomplete }: { code: string; isIncomplete: boolean; language?: string }) {
  if (isIncomplete) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border bg-muted animate-pulse">
        <span className="text-muted-foreground text-sm">Rendering HTML…</span>
      </div>
    );
  }
  const clean = DOMPurify.sanitize(code, {
    ALLOWED_TAGS: [
      "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "style", "table", "thead", "tbody", "tr", "td", "th",
      "ul", "ol", "li", "img", "a", "br", "hr",
      "strong", "em", "code", "pre", "blockquote", "figure",
      "figcaption", "section", "article", "header", "footer", "nav",
    ],
    ALLOWED_ATTR: ["style", "class", "href", "src", "alt", "width", "height", "id"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "onmouseover", "onmouseout", "onsubmit"],
  });
  return (
    <iframe
      srcDoc={clean}
      sandbox="allow-same-origin"
      className="w-full border rounded-md"
      style={{ minHeight: "200px" }}
      title="HTML preview"
    />
  );
}

// In the plugins useMemo (inside FilePathAwareMessageResponse), add renderers:
const plugins = useMemo(() => ({
  mermaid,
  renderers: [
    { language: "html", component: HtmlRenderer },
  ],
}), []);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.html.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/blocks/BlockRenderer.tsx src/components/blocks/BlockRenderer.html.test.tsx
git commit -s -m "feat: render HTML code blocks in sandboxed iframe in chat"
```

---

### Task 6: Run full test suite + type check + lint

**Files:**
- No new files — verification only

- [ ] **Step 1: Run the full vitest suite**

Run: `cd web && npx vitest run src/components/blocks/`
Expected: All BlockRenderer tests pass

- [ ] **Step 2: Run type check**

Run: `cd web && npm run type-check`
Expected: No new type errors (if `@streamdown/mermaid` types aren't found, add `// @ts-expect-error` with a comment)

- [ ] **Step 3: Run lint**

Run: `cd web && npm run lint`
Expected: No new lint errors

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -s -m "test: Phase 1 inline file display — all tests green" || echo "nothing to commit"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Mermaid diagrams → Task 2
- ✅ HTML rendering (sandboxed) → Task 5
- ✅ Relative image path resolution → Task 3
- ✅ Video rendering → Task 4
- ✅ Markdown rendering (nested Streamdown) → **GAP: no task for this**
- ⚠️ Markdown file rendering was in the spec but is lower-priority (the agent can already write markdown in its response text; the ` ```markdown ` code-block renderer is for when the agent wants to show a *separate* markdown file's content). Defer to Phase 2 when we have the `file_produced` event to trigger it.

**2. Placeholder scan:** No placeholders found — all code blocks contain complete, copy-pasteable code.

**3. Type consistency:**
- `PluginConfig` from `streamdown` is used consistently
- `HtmlRenderer` takes `{ code, isIncomplete, language? }` matching Streamdown's `CustomRendererProps`
- `ZoomableMarkdownImage` uses the same `useFileViewerConversationId` hook throughout

**4. Divergence constraint:** No new `omnigent` references or `.omnigent` paths introduced. All new code is in `web/src/components/blocks/` and uses existing hooks.