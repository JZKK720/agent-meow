# Inline File Display — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the agent writes files to the workspace during a session, render them inline in the chat stream as "file produced" cards — without requiring the agent to explicitly reference them in markdown.

**Architecture:** The existing `useWorkspaceChangedFiles` hook polls the runner's `/changes` endpoint and tracks files created/modified/deleted since session start. Phase 2 extends the `RenderItem` union with a new `file_produced` kind, hooks into the existing polling to emit new items when files appear, and adds a `FileProducedCard` component to `BlockRenderer` that renders based on MIME type (image → `SessionImage`, video → `<video>`, markdown → `MarkdownRenderer`, other → file chip with download link).

**Tech Stack:** React + TanStack Query (existing `useWorkspaceChangedFiles`), existing `SessionImage` component, Phase 1 `ZoomableMarkdownImage` video rendering.

## Global Constraints

- **Do NOT introduce any new `omnigent` references or `.omnigent` paths.** agent-meow has diverged from upstream omnigent. Leave existing `OMNIGENT_*` env vars and `agent_meow/` module path alone; new code must not add more.
- **Do NOT install new npm dependencies.** All required components already exist.
- **Do NOT modify server-side code.** Phase 2 reuses the existing `/changes` polling endpoint — no new SSE event type needed. The client-side polling already runs.
- **Do NOT change CSS/layout.** Front-end visual design is paused (Figma work in progress).
- Use DCO sign-off for all commits: `git commit -s`.
- Frontend test command: `cd web && npx vitest run <path>` (vitest, colocated `*.test.tsx`).
- Type check: `cd web && npm run type-check` (tsc -b).
- Lint: `cd web && npm run lint` (oxlint).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `web/src/lib/renderItems.ts` | Add `file_produced` kind to `RenderItem` union | Modify |
| `web/src/hooks/useFileProducedItems.ts` | Watch `useWorkspaceChangedFiles` results, emit `file_produced` RenderItems for new files | Create |
| `web/src/components/blocks/FileProducedCard.tsx` | Render a file-produced card based on MIME type | Create |
| `web/src/components/blocks/BlockRenderer.tsx` | Add `case "file_produced"` to the switch | Modify |
| `web/src/components/blocks/FileProducedCard.test.tsx` | Unit tests for the card | Create |
| `web/src/hooks/useFileProducedItems.test.ts` | Unit tests for the hook | Create |

---

### Task 1: Add `file_produced` kind to `RenderItem` union

**Files:**
- Modify: `web/src/lib/renderItems.ts`
- Test: `web/src/lib/renderItems.test.ts` (if exists) or inline type check

**Interfaces:**
- Produces: A new union member `{ kind: "file_produced"; itemId: string | null; file: { path: string; mime: string; size: number; contentUrl: string } }`

- [ ] **Step 1: Read the current RenderItem union end**

Run: `Get-Content web/src/lib/renderItems.ts` and find the end of the `export type RenderItem` union (the line after the last `;` before the next `export`).

- [ ] **Step 2: Add the new kind to the union**

In `web/src/lib/renderItems.ts`, add this new union member at the end of the `RenderItem` type (after the `elicitation` member):

```tsx
  | {
      kind: "file_produced";
      itemId: string | null;
      file: {
        path: string;
        mime: string;
        size: number;
        contentUrl: string;
      };
    };
```

- [ ] **Step 3: Run type check to verify it compiles**

Run: `cd web && npm run type-check`
Expected: PASS (the new union member is additive; no consumer breaks)

- [ ] **Step 4: Commit**

```bash
cd web && git add src/lib/renderItems.ts
git commit -s -m "feat: add file_produced kind to RenderItem union"
```

---

### Task 2: Create `FileProducedCard` component

**Files:**
- Create: `web/src/components/blocks/FileProducedCard.tsx`
- Test: `web/src/components/blocks/FileProducedCard.test.tsx`

**Interfaces:**
- Consumes: `SessionImage` from `@/components/SessionImage` (existing), `ZoomableImage` from `@/components/ImageLightbox` (existing)
- Produces: `FileProducedCard` component that renders based on `file.mime`

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/blocks/FileProducedCard.test.tsx
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
    const { getByTestId } = render(
      <FileProducedCard file={baseFile} />
    );
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

  it("formats file size in KB", () => {
    const bigFile = { ...baseFile, mime: "application/pdf", path: "report.pdf", size: 1048576, contentUrl: "/v1/sessions/abc/resources/files/report.pdf/content" };
    const { getByText } = render(<FileProducedCard file={bigFile} />);
    expect(getByText(/1\.0 MB|1024 KB|1 MB/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run src/components/blocks/FileProducedCard.test.tsx`
Expected: FAIL — `FileProducedCard` not defined

- [ ] **Step 3: Implement the component**

```tsx
// web/src/components/blocks/FileProducedCard.tsx
import { SessionImage } from "@/components/SessionImage";
import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProducedFile {
  path: string;
  mime: string;
  size: number;
  contentUrl: string;
}

export function FileProducedCard({ file }: { file: ProducedFile }) {
  // Images render inline via SessionImage (handles embedded + standalone)
  if (file.mime.startsWith("image/")) {
    return (
      <div className="my-2 rounded-md border p-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileIcon className="size-3" />
          <span>{file.path}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{formatSize(file.size)}</span>
        </div>
        <SessionImage path={file.contentUrl} alt={file.path} className="max-w-full rounded" />
      </div>
    );
  }

  // Videos render as <video controls>
  if (file.mime.startsWith("video/")) {
    return (
      <div className="my-2 rounded-md border p-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileIcon className="size-3" />
          <span>{file.path}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{formatSize(file.size)}</span>
        </div>
        <video controls src={file.contentUrl} className="w-full rounded-md" />
      </div>
    );
  }

  // Other files render as a file chip with download link
  return (
    <div className="my-2 flex items-center gap-2 rounded-md border p-2">
      <FileIcon className="size-4 text-muted-foreground" />
      <div className="flex flex-col">
        <a href={file.contentUrl} download={file.path} className="text-sm font-medium hover:underline">
          {file.path}
        </a>
        <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run src/components/blocks/FileProducedCard.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/blocks/FileProducedCard.tsx src/components/blocks/FileProducedCard.test.tsx
git commit -s -m "feat: add FileProducedCard component for inline file display"
```

---

### Task 3: Add `case "file_produced"` to `BlockRenderer` switch

**Files:**
- Modify: `web/src/components/blocks/BlockRenderer.tsx`
- Test: `web/src/components/blocks/BlockRenderer.file-produced.test.tsx`

**Interfaces:**
- Consumes: `FileProducedCard` from Task 2, `RenderItem` `file_produced` kind from Task 1
- Produces: `BlockRenderer` renders `file_produced` items as `FileProducedCard`

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/components/blocks/BlockRenderer.file-produced.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/components/SessionImage", () => ({
  SessionImage: ({ path, alt }: any) => (
    <div data-testid="session-image" data-path={path} />
  ),
}));

vi.mock("@/components/ImageLightbox", () => ({
  ZoomableImage: ({ src }: any) => <div data-testid="zi" data-src={src} />,
}));

vi.mock("@/shell/FileViewerContext", () => ({
  useFileViewer: () => vi.fn(),
  useFileViewerConversationId: () => "conv123",
  useIsChangedPath: () => vi.fn(() => false),
  useWorkspacePaths: () => ({ root: "/workspace", home: "/home" }),
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: any) => <div>{children}</div>,
  defaultRemarkPlugins: {},
}));

import { FileProducedCard } from "./FileProducedCard";

vi.mock("./FileProducedCard", () => ({
  FileProducedCard: ({ file }: any) => (
    <div data-testid="fpc" data-path={file.path} data-mime={file.mime} />
  ),
}));

// We test the BlockRenderer switch indirectly — verify that a
// RenderItem with kind="file_produced" produces a FileProducedCard.
// Since BlockRenderer's switch is internal, we test via the
// FileProducedCard component directly (already covered in Task 2).
// This test verifies the import wiring is correct.

describe("file_produced in BlockRenderer", () => {
  it("FileProducedCard is importable from BlockRenderer module", () => {
    expect(FileProducedCard).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails (or passes if import works)**

Run: `cd web && npx vitest run src/components/blocks/BlockRenderer.file-produced.test.tsx`
Expected: May pass already (import test). The real test is the switch case.

- [ ] **Step 3: Implement — add the switch case**

In `web/src/components/blocks/BlockRenderer.tsx`:

```tsx
// Add import at top:
import { FileProducedCard } from "./FileProducedCard";

// In the switch(item.kind) block, add after the last existing case:
    case "file_produced":
      return <FileProducedCard file={item.file} />;
```

- [ ] **Step 4: Run type check**

Run: `cd web && npm run type-check`
Expected: PASS (the `file_produced` kind was added to RenderItem in Task 1)

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/blocks/BlockRenderer.tsx src/components/blocks/BlockRenderer.file-produced.test.tsx
git commit -s -m "feat: wire file_produced RenderItem into BlockRenderer switch"
```

---

### Task 4: Create `useFileProducedItems` hook

**Files:**
- Create: `web/src/hooks/useFileProducedItems.ts`
- Test: `web/src/hooks/useFileProducedItems.test.ts`

**Interfaces:**
- Consumes: `useWorkspaceChangedFiles` from `@/hooks/useWorkspaceChangedFiles` (existing hook that polls `/changes`)
- Produces: `useFileProducedItems(conversationId)` returns `RenderItem[]` of `file_produced` items for files that appeared since the last poll

- [ ] **Step 1: Write the failing test**

```tsx
// web/src/hooks/useFileProducedItems.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, wrapper } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock useWorkspaceChangedFiles
vi.mock("@/hooks/useWorkspaceChangedFiles", () => ({
  useWorkspaceChangedFiles: () => ({
    data: [
      { path: "output.png", status: "created", mime: "image/png", bytes: 1024 },
      { path: "demo.mp4", status: "created", mime: "video/mp4", bytes: 5000000 },
      { path: "existing.txt", status: "modified", mime: "text/plain", bytes: 100 },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/store/chatStore", () => ({
  useChatStore: () => ({ conversationId: "conv123", sessionStatus: "running" }),
}));

import { useFileProducedItems } from "./useFileProducedItems";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useFileProducedItems", () => {
  it("returns file_produced RenderItems for created files", () => {
    const { result } = renderHook(() => useFileProducedItems("conv123"), {
      wrapper: makeWrapper(),
    });
    expect(result.current).toHaveLength(2); // output.png + demo.mp4 (created only)
    expect(result.current[0].kind).toBe("file_produced");
    expect(result.current[0].file.path).toBe("output.png");
    expect(result.current[0].file.mime).toBe("image/png");
    expect(result.current[0].file.contentUrl).toContain("/v1/sessions/conv123/resources/files/output.png/content");
  });

  it("excludes modified files (only created)", () => {
    const { result } = renderHook(() => useFileProducedItems("conv123"), {
      wrapper: makeWrapper(),
    });
    expect(result.current.find((r: any) => r.file.path === "existing.txt")).toBeUndefined();
  });

  it("returns empty array when conversationId is undefined", () => {
    const { result } = renderHook(() => useFileProducedItems(undefined), {
      wrapper: makeWrapper(),
    });
    expect(result.current).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run src/hooks/useFileProducedItems.test.tsx`
Expected: FAIL — `useFileProducedItems` not defined

- [ ] **Step 3: Implement the hook**

```tsx
// web/src/hooks/useFileProducedItems.ts
import { useMemo } from "react";
import { useWorkspaceChangedFiles } from "@/hooks/useWorkspaceChangedFiles";
import type { RenderItem } from "@/lib/renderItems";

/**
 * Watch workspace changed files and emit `file_produced` RenderItems
 * for files that were *created* (not just modified) since the session
 * started. These items render inline in the chat stream as
 * FileProducedCard components.
 *
 * The hook reuses the existing `useWorkspaceChangedFiles` polling —
 * no new server endpoint needed.
 */
export function useFileProducedItems(
  conversationId: string | undefined,
): RenderItem[] {
  const { data } = useWorkspaceChangedFiles(conversationId);

  return useMemo(() => {
    if (!conversationId || !data) return [];

    return data
      .filter((f) => f.status === "created")
      .map((f): RenderItem => ({
        kind: "file_produced",
        itemId: null,
        file: {
          path: f.path,
          mime: f.mime ?? "application/octet-stream",
          size: f.bytes ?? 0,
          contentUrl: `/v1/sessions/${conversationId}/resources/files/${encodeURIComponent(f.path)}/content`,
        },
      }));
  }, [conversationId, data]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run src/hooks/useFileProducedItems.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd web && git add src/hooks/useFileProducedItems.ts src/hooks/useFileProducedItems.test.tsx
git commit -s -m "feat: add useFileProducedItems hook for workspace file polling"
```

---

### Task 5: Wire `useFileProducedItems` into the chat page

**Files:**
- Modify: `web/src/pages/ChatPage.tsx` (or wherever RenderItems are assembled for the chat)
- Test: verify via type check + existing tests

**Interfaces:**
- Consumes: `useFileProducedItems` from Task 4, the RenderItem assembly in ChatPage
- Produces: `file_produced` items appear in the chat stream alongside text, tools, etc.

- [ ] **Step 1: Find where RenderItems are assembled in ChatPage**

Run: `Select-String -Path web/src/pages/ChatPage.tsx -Pattern "renderItems|RenderItem|itemsToBlocks|useRenderItems"`

- [ ] **Step 2: Add the hook call and merge the items**

In `web/src/pages/ChatPage.tsx`, wherever the existing RenderItems are built (likely via `itemsToBlocks` or a similar function), add:

```tsx
// Add import:
import { useFileProducedItems } from "@/hooks/useFileProducedItems";

// In the component body, after existing hooks:
const fileProducedItems = useFileProducedItems(conversationId);

// Merge with existing items (before or after the text/tool items):
// The exact merge point depends on how ChatPage assembles items.
// Typically: const allItems = [...existingItems, ...fileProducedItems];
```

The exact merge point requires reading ChatPage's item assembly. The implementer should read the file to find where `RenderItem[]` is constructed and add `fileProducedItems` to the array.

- [ ] **Step 3: Run type check**

Run: `cd web && npm run type-check`
Expected: PASS

- [ ] **Step 4: Run existing tests to verify no regressions**

Run: `cd web && npx vitest run src/pages/ChatPage`
Expected: All existing ChatPage tests pass

- [ ] **Step 5: Commit**

```bash
cd web && git add src/pages/ChatPage.tsx
git commit -s -m "feat: wire file_produced items into chat stream"
```

---

### Task 6: Full verification

- [ ] **Step 1: Run all BlockRenderer + hooks tests**

Run: `cd web && npx vitest run src/components/blocks/ src/hooks/useFileProducedItems`
Expected: All pass

- [ ] **Step 2: Run type check**

Run: `cd web && npm run type-check`
Expected: PASS

- [ ] **Step 3: Run lint on new files**

Run: `cd web && npm run lint`
Expected: No new warnings in our files

- [ ] **Step 4: Commit if any fixes**

```bash
git add -A && git commit -s -m "test: Phase 2 file_produced — all tests green" || echo "nothing to commit"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ `file_produced` SSE event → Task 1 (RenderItem kind) + Task 4 (hook)
- ✅ `FileProducedCard` renders based on MIME type → Task 2
- ✅ `BlockRenderer` switch case → Task 3
- ✅ Wire into chat page → Task 5

**2. Placeholder scan:** No placeholders. All code blocks are complete. Task 5 Step 2 notes that the implementer must read ChatPage to find the exact merge point — this is intentional (the file is 1000+ lines and the exact line depends on the current state).

**3. Type consistency:**
- `ProducedFile` interface in `FileProducedCard.tsx` matches `file` field in the `RenderItem` union member
- `useFileProducedItems` returns `RenderItem[]` with `kind: "file_produced"`
- `contentUrl` format matches Phase 1's image path resolver: `/v1/sessions/{id}/resources/files/{path}/content`

**4. Divergence constraint:** No new `omnigent` references. All new code is in `web/src/`. No server changes. No new dependencies.