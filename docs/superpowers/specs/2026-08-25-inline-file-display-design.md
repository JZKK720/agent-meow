# Inline File Display Pipeline + Shared Workspace Path

**Date:** 2026-08-25
**Status:** Draft — pending user review
**Scope:** `web/src/components/blocks/` (Phase 1), `agent_meow/server/routes/` + `web/src/hooks/` (Phase 2), `agent_meow/host/` (Phase 3)

## Problem

The agent-meow chat surface can render text and uploaded images, but
agent-generated files (images, videos, markdown, HTML, Mermaid diagrams)
do not appear inline in the chat stream. The agent writes files to the
workspace; the user has to click into the file tree or the right-panel
FileViewer to see them.

Additionally, the default workspace path differs between agent-meow
running locally (`~/.omnigent` data dir, `OMNIGENT_RUNNER_WORKSPACE` = cwd)
and hermes-gateway running in a Docker container (container-internal
paths like `/data` or `/workspace`). Files generated inside the container
are not visible to the agent-meow server running on the host, and vice
versa.

## Design goals

1. Any file (user-uploaded or agent-generated) that enters a session
   should render inline in the chat stream — images as `<img>`, videos as
   `<video>`, markdown as rendered markdown, HTML as sandboxed HTML,
   Mermaid as SVG diagrams.
2. The agent does not need to do anything special — writing a file with
   a markdown reference (`![](output.png)`) or a code block
   (` ```mermaid ` / ` ```html `) is enough.
3. A shared workspace path that both agent-meow (local) and
   hermes-gateway (Docker) can use by default, without manual path
   mapping.

## Architecture

```mermaid
graph TD
    Agent[Agent writes file to workspace]
    Agent -->|markdown text| Streamdown[Streamdown renderer]
    Agent -->|file on disk| Workspace[Session workspace dir]

    Streamdown -->|```mermaid block| MermaidPlugin["@streamdown/mermaid<br/>(already in package.json)"]
    Streamdown -->|```html block| HtmlRenderer[Custom Renderer:<br/>sandboxed iframe srcdoc]
    Streamdown -->|![](relative.png)| ImageResolver[Relative path resolver<br/>→ /v1/sessions/.../content]
    Streamdown -->|![](video.mp4)| VideoRenderer[Custom Renderer:<br/>&lt;video controls&gt;]
    Streamdown -->|```markdown block| MdRenderer[Custom Renderer:<br/>nested Streamdown]

    Workspace -->|Phase 2: file watch| SSE[SSE push to web UI]
    SSE --> ChatCard[Inline 'file produced' card]

    Workspace -->|Phase 3: path config| PathConfig[Shared workspace path]
    PathConfig -->|local| LocalPath["~/.omnigent/sessions/{id}/workspace"]
    PathConfig -->|docker| DockerPath["/workspace (mounted volume)"]
```

## Phase 1 — Wire existing dependencies (chat-side only, no server changes)

**Effort:** ~50 lines of new code, all in `web/src/components/blocks/BlockRenderer.tsx`
**Risk:** Low — uses packages already in `package.json`, no new dependencies
**Files touched:** `BlockRenderer.tsx` only

### 1.1 Mermaid diagrams

The `@streamdown/mermaid` package (v1.0.2) is already in `web/package.json`
but never imported. Streamdown's `plugins` prop accepts a `mermaid` plugin
that renders ` ```mermaid ` code blocks as interactive SVG diagrams.

**Current state:** `BlockRenderer.tsx` imports `defaultRemarkPlugins` from
`streamdown` but never passes a `plugins` prop to `MessageResponse` /
Streamdown. Mermaid code blocks render as plain text.

**Change:** Import `mermaid` from `@streamdown/mermaid` and pass it through
to the Streamdown component chain. The `MessageResponse` component wraps
Streamdown; we need to thread the `plugins` prop through.

```tsx
// BlockRenderer.tsx — new import
import { mermaid } from "@streamdown/mermaid";

// In FilePathAwareMessageResponse — pass plugins to MessageResponse
// (MessageResponse must forward the plugins prop to Streamdown)
<MessageResponse
  {...props}
  components={components}
  remarkPlugins={remarkPlugins}
  plugins={{ mermaid }}
>
```

If `MessageResponse` does not currently accept a `plugins` prop, we add
one that it forwards to the underlying `Streamdown` component.

**Streaming behavior:** Mermaid diagrams appear as code blocks until
the closing ` ``` ` is received, then render as SVG. This is built into
the plugin — no additional handling needed.

**Interactive controls:** Fullscreen, download SVG/PNG/MMD, copy source,
pan/zoom. All built-in. Configurable via the `controls` prop.

**Theme:** Defaults to `securityLevel: "strict"` (no inline scripts in
the SVG). Theme follows the app's light/dark mode via `createMermaidPlugin({
  config: { theme: "neutral" }
})`.

### 1.2 HTML rendering (sandboxed)

Streamdown's `renderers` prop accepts custom code-block renderers. We
register an `html` renderer that renders the code block content in a
sandboxed `<iframe srcdoc>` with a strict Content Security Policy.

**Current state:** ` ```html ` code blocks render as syntax-highlighted
text (Shiki). No HTML execution.

**Change:** Add a custom renderer for the `html` language:

```tsx
// BlockRenderer.tsx — new component
function HtmlRenderer({ code, isIncomplete }: CustomRendererProps) {
  // Sanitize with DOMPurify (already in package.json)
  const clean = DOMPurify.sanitize(code, {
    ALLOWED_TAGS: ["div", "span", "p", "h1", "h2", "h3", "style",
      "table", "tr", "td", "th", "ul", "ol", "li", "img", "a",
      "br", "hr", "strong", "em", "code", "pre", "blockquote"],
    ALLOWED_ATTR: ["style", "class", "href", "src", "alt", "width", "height"],
    FORBID_ATTR: ["onclick", "onload", "onerror", "onmouseover"],
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

// Register alongside mermaid
<Streamdown
  plugins={{
    mermaid,
    renderers: [
      { language: "html", component: HtmlRenderer },
    ],
  }}
>
```

**Security:** `sandbox="allow-same-origin"` (no `allow-scripts`) means
the iframe cannot execute JavaScript. DOMPurify strips event handlers
and dangerous tags. The CSP is `default-src 'none'; style-src 'unsafe-inline'`
— styles work, but no external resources, no scripts, no fetches.

**Incomplete state:** While streaming, show a loading placeholder
(matching the Mermaid pattern).

### 1.3 Relative image path resolution

**Current state:** `ZoomableMarkdownImage` in `BlockRenderer.tsx` (line
141) passes `src` straight through. A relative path like `![](output.png)`
becomes `<img src="output.png">` which resolves against the browser's
base URL — broken.

**Change:** Extend `ZoomableMarkdownImage` to resolve relative paths to
session file-content URLs. Use the existing `useWorkspacePaths` hook
(from `FileViewerContext`) to get the workspace root, and the
conversation ID from the route.

```tsx
function ZoomableMarkdownImage({ src, alt, ...props }) {
  const { root } = useWorkspacePaths();
  const conversationId = useFileViewerConversationId();

  // Resolve relative paths to session file-content URLs
  const resolvedSrc = useMemo(() => {
    if (!src) return undefined;
    // Absolute URLs (http://, https://, data:) pass through
    if (/^(https?:|data:|blob:)/.test(src)) return src;
    // API paths pass through
    if (src.startsWith("/v1/")) return src;
    // Relative path → session file-content URL
    if (conversationId) {
      const encoded = encodeURIComponent(src);
      return `/v1/sessions/${conversationId}/resources/files/${encoded}/content`;
    }
    return src;
  }, [src, conversationId, root]);

  return <ZoomableImage {...props} src={resolvedSrc} alt={alt ?? ""} />;
}
```

### 1.4 Video rendering

Register a custom renderer for video file paths. When the agent writes
a markdown link to a video file (`![](demo.mp4)` or `[demo.mp4](demo.mp4)`),
render as `<video controls>`.

**Two approaches:**

**A. Custom renderer for `video` language** — for ` ```video ` code
blocks containing a file path:

```tsx
function VideoRenderer({ code, isIncomplete }: CustomRendererProps) {
  const conversationId = useFileViewerConversationId();
  const src = code.trim().startsWith("/")
    ? code.trim()
    : `/v1/sessions/${conversationId}/resources/files/${encodeURIComponent(code.trim())}/content`;
  return <video controls src={src} className="w-full rounded-md" />;
}
```

**B. Override the `img` component** to detect video extensions and
render `<video>` instead of `<img>`:

```tsx
function ZoomableMarkdownImage({ src, alt, ...props }) {
  // ... (path resolution from 1.3)
  if (/\.(mp4|webm|mov|avi|mkv)$/i.test(resolvedSrc)) {
    return <video controls src={resolvedSrc} className="w-full rounded-md" />;
  }
  return <ZoomableImage {...props} src={resolvedSrc} alt={alt ?? ""} />;
}
```

**Recommendation:** Approach B — it works with standard markdown image
syntax (`![](demo.mp4)`) without requiring the agent to use a special
code block. The `img` component override already exists
(`ZoomableMarkdownImage`); we just add a video check.

### 1.5 Markdown file rendering

Register a custom renderer for `markdown` / `md` language code blocks.
When the agent writes ` ```markdown ` blocks (or references a `.md` file),
render the content as nested Streamdown.

```tsx
function MarkdownRenderer({ code, isIncomplete }: CustomRendererProps) {
  if (isIncomplete) return <CodeBlockSkeleton />;
  return (
    <div className="border rounded-md p-4 prose dark:prose-invert">
      <Streamdown plugins={{ mermaid }}>{code}</Streamdown>
    </div>
  );
}
```

### Phase 1 summary

| Sub-feature | Package used | Already installed? | Lines of code |
|---|---|---|---|
| Mermaid diagrams | `@streamdown/mermaid` | ✅ | ~5 (import + pass plugin) |
| Sandboxed HTML | `dompurify` | ✅ | ~25 (renderer component) |
| Relative image paths | (existing hooks) | ✅ | ~15 (resolver in ZoomableMarkdownImage) |
| Video rendering | (existing hooks) | ✅ | ~5 (video check in ZoomableMarkdownImage) |
| Markdown rendering | `streamdown` | ✅ | ~10 (renderer component) |

**Total: ~60 lines, 0 new dependencies, 1 file touched (`BlockRenderer.tsx`).**
If `MessageResponse` needs a `plugins` prop threaded through, add ~5
lines to `web/src/components/ai-elements/message.tsx`.

## Phase 2 — File-watch for agent-generated files

**Effort:** Medium — server + chat changes
**Risk:** Medium — new SSE event type, new chat card component
**Files touched:** `agent_meow/server/routes/sessions.py`,
`web/src/hooks/useWorkspaceChangedFiles.ts`, `web/src/components/blocks/`

### 2.1 Problem

The agent writes files to the workspace during a session, but the chat
only shows them if the agent explicitly references them in markdown. Files
the agent creates without referencing (intermediate outputs, logs,
temp files) are invisible until the user opens the file tree.

### 2.2 Design

Extend the existing `useWorkspaceChangedFiles` hook (which already
tracks changed files in the workspace) to push new files to the chat
stream as inline "file produced" cards.

**Server side:** The session SSE stream already pushes events for
tool calls, text, reasoning, etc. Add a new `file_produced` event type:

```python
# sessions.py — in the SSE event loop
if new_files := workspace_scan.detect_new_files(session_id, since):
    for f in new_files:
        yield {
            "type": "file_produced",
            "file": {
                "path": f.path,
                "mime": f.mime,
                "size": f.size,
                "content_url": f"/v1/sessions/{session_id}/resources/files/{f.path}/content",
            }
        }
```

**Chat side:** `BlockRenderer` adds a case for `file_produced` render
items:

```tsx
case "file_produced":
  return <FileProducedCard file={item.file} />;
```

`FileProducedCard` renders based on MIME type:
- `image/*` → `<SessionImage>` (existing component)
- `video/*` → `<video controls>` (from Phase 1.4)
- `text/markdown` → `<MarkdownRenderer>` (from Phase 1.5)
- `text/html` → `<HtmlRenderer>` (from Phase 1.2)
- Other → file chip with download link

### 2.3 Polling vs. watch

The existing `useWorkspaceChangedFiles` hook already polls the
filesystem API (`/v1/sessions/.../resources/files`). Phase 2 reuses
this — when the hook detects a new file, it emits a `file_produced`
event to the chat stream. No new server-side watcher needed; the
client-side polling already runs.

Alternative: server-side filesystem watcher (`watchdog` library) pushes
events via SSE. More real-time but adds a dependency and OS-specific
watcher code. Defer to Phase 2b if polling latency is unacceptable.

## Phase 3 — Shared workspace path (agent-meow vs. hermes-gateway Docker)

### 3.1 Current path architecture

| Component | Path source | Default |
|---|---|---|
| agent-meow data dir | `OMNIGENT_DATA_DIR` env var | `~/.omnigent` |
| agent-meow config home | `OMNIGENT_CONFIG_HOME` env var | `~/.omnigent/config` |
| Runner workspace (cwd) | `OMNIGENT_RUNNER_WORKSPACE` env var | current working directory |
| Hermes CLI binary | `OMNIGENT_HERMES_PATH` env var | searches `PATH` |
| Session workspace | per-session subdirectory under data dir | `{data_dir}/sessions/{id}/workspace` |
| Hermes-gateway (Docker) | container-internal path | `/workspace` or `/data` |

### 3.2 The mismatch

When hermes-gateway runs inside a Docker container:
- The container's filesystem sees `/workspace` (or whatever the
  Dockerfile/compose sets)
- The agent-meow server running on the host sees the host's filesystem
- If the container mounts a host directory (e.g.,
  `-v /home/user/projects:/workspace`), the same files have two paths:
  - Host: `/home/user/projects/output.png`
  - Container: `/workspace/output.png`
- The agent (inside the container) writes `/workspace/output.png`
- The agent-meow server (on the host) tries to serve
  `/workspace/output.png` → file not found (that path doesn't exist on
  the host)

### 3.3 Three approaches

**A. Shared mount point — both sides use the same path**

Mount the workspace at the same path on both host and container:

```yaml
# docker-compose.yml
volumes:
  - /home/user/projects:/home/user/projects
```

Both the agent (in the container) and the agent-meow server (on the
host) see the workspace at `/home/user/projects`. No path translation
needed.

**Pros:** Zero code changes. Files are at the same path everywhere.
**Cons:** Requires the host path to exist and be mountable. Doesn't
work if the container runs on a different OS (Linux container on
Windows host — paths differ in format).

**B. Path mapping config — translate between host and container paths**

Add a `OMNIGENT_WORKSPACE_HOST_PATH` env var that tells the
agent-meow server the host-side equivalent of the container's
workspace:

```python
# In the server's file-serving route
container_path = file.path  # /workspace/output.png
host_path = translate_path(container_path, workspace_host_path)
# → /home/user/projects/output.png
```

**Pros:** Works with any mount configuration.
**Cons:** Requires the user to set the env var. Path translation is
fragile (symlinks, case sensitivity, trailing slashes).

**C. ArtifactStore as the shared layer — files go through the API, not the filesystem**

Instead of the agent writing files directly to the workspace and the
server serving them from disk, the agent uploads files through the
`ArtifactStore` API (which already exists for images and videos). The
`ArtifactStore` stores binary content in its own storage (database or
object store), and the server serves it via `/v1/sessions/.../resources/`
URLs. The filesystem path is irrelevant — the file is identified by
its session ID and artifact ID.

**Pros:** No path mismatch possible — files are addressed by API URL,
not filesystem path. Works across any container/host boundary.
**Cons:** The agent needs to upload files through the API instead of
just writing to disk. This requires a tool/bridge that the agent calls.
The existing `images.py` and `videos.py` routes already work this way
— the gap is that the agent doesn't have a "save file to artifact
store" tool.

### 3.4 Recommendation

**C (ArtifactStore) for the long term, A (shared mount) for the
short term.**

- **Short term:** Use approach A — mount the workspace at the same
  path on both sides. The Electron app's `main.js` already has
  workspace mount handling (lines 934-958). Document the recommended
  mount configuration.
- **Long term:** Approach C — add a `save_artifact` tool that the agent
  calls to upload files to the `ArtifactStore`. The server serves them
  via the existing `/v1/sessions/.../resources/` API. No path
  translation, no mount configuration, works in any topology.

The long-term approach aligns with Phase 2's `file_produced` event —
the event carries a `content_url` that's already an API path, not a
filesystem path. The chat renders the URL directly; the filesystem path
never reaches the browser.

## Testing

### Phase 1 tests

- Unit test: `BlockRenderer` with ` ```mermaid ` code block renders an
  SVG (mock the mermaid plugin, assert `data-streamdown="mermaid"` element)
- Unit test: `ZoomableMarkdownImage` resolves `output.png` to
  `/v1/sessions/{id}/resources/files/output.png/content`
- Unit test: `ZoomableMarkdownImage` with `demo.mp4` renders `<video>`
- Unit test: `HtmlRenderer` sanitizes `<script>alert(1)</script>` →
  removed
- Unit test: `HtmlRenderer` renders `<div style="color:red">Hi</div>`
  in iframe srcdoc
- E2E test: agent session produces a markdown message with ` ```mermaid `
  block → chat shows diagram

### Phase 2 tests

- Integration test: agent writes a file to workspace → `file_produced`
  event appears in SSE stream → chat shows file card
- Unit test: `FileProducedCard` renders image / video / markdown / file
  chip based on MIME type

### Phase 3 tests

- Unit test: path translation with `OMNIGENT_WORKSPACE_HOST_PATH` set
- Integration test: agent in container writes file → server on host
  serves it via API URL

## Error handling

- Mermaid render failure → error component with "Show Code" collapse
  (built into the plugin)
- HTML sanitize failure → fallback to code block display
- Image/video path resolution failure → broken-image placeholder with
  alt text
- File not found on disk → 404 from server, chat shows error state
- Streaming incomplete block → loading placeholder (Mermaid pattern)

## Out of scope

- Otto starfish vs. 橘宝疾风 mascot decision (separate rebrand work)
- `OMNIGENT_*` env var rename (deferred per REBRAND_AUDIT.md)
- `agent_meow/` → `meow/` module rename (deferred)
- Front-end CSS/layout design (paused — Figma work in progress)
- Brand color migration (deferred per WEB_REBRANDING_PLAN.md)