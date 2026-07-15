---
name: frontend-dev
description: Frontend development guide for the web/ React app — covers component patterns, state management, the fetch/routing IoC seams, testing conventions, and special UI libraries (Tiptap, Fabric.js, xterm.js). Load when developing, testing, or debugging frontend code under web/src/ — adding components, hooks, stores, or pages; writing colocated Vitest tests; or working with the Tiptap, Fabric.js, or xterm.js integrations.
---

# Frontend development guide (`web/`)

The `web/` directory is a **React 18 + TypeScript + Vite** SPA that serves as
the agent-meow UI. It runs standalone or embedded in a Databricks monolith.
This skill covers the conventions an agent needs to write idiomatic frontend
code.

## Commands

```bash
cd web
npm install                # or pnpm i
npm run dev                # Vite dev server
npm run build              # tsc -b && vite build
npm run build:embed        # embed config (for Databricks monolith)
npm test                   # vitest run
npm run test:watch         # vitest (watch mode)
npm run lint               # oxlint .
npm run lint:fix           # oxlint --fix .
npm run format             # prettier --write .
npm run format:check       # prettier --check .
npm run type-check         # tsc -b
```

## Directory structure (`web/src/`)

| Directory | Purpose |
|---|---|
| `components/` | Reusable presentational + feature components (colocated tests) |
| `components/ui/` | Vendored shadcn/ui primitives — **excluded from oxlint** |
| `components/ai-elements/` | Vendored AI UI kit — **excluded from oxlint & coverage** |
| `components/blocks/` | Chat block renderers (tool cards, terminal, reasoning, approval) |
| `components/icons/` | Brand-specific SVG icon wrappers |
| `shell/` | App-level layout (AppShell, Sidebar, ChatHeader, panels, editors) |
| `pages/` | Route-level page components (ChatPage, LoginPage, SettingsPage) |
| `hooks/` | Custom React hooks (colocated tests) |
| `lib/` | Pure logic: API clients, stores helpers, utilities, types, contexts |
| `lib/locales/` | i18n translation JSON (`en.json`, `zh-CN.json`) |
| `store/` | Zustand stores (`chatStore.ts`, `terminalActivity.ts`) |

## Critical conventions — enforced by oxlint

### 1. No bare `fetch()` — use `hostFetch` or `authenticatedFetch`

oxlint **bans** the global `fetch()`. Use the layered fetch architecture:

- `hostFetch(path, init)` — `@/lib/host` — the single network choke point. Only
  `host.ts` and `accountsApi.ts` are exempt from this rule.
- `authenticatedFetch(input, init)` — `@/lib/identity` — wraps `hostFetch`,
  injects `X-Forwarded-Email` header, handles 401 → login redirect.
- API logic lives in `lib/sessionsApi.ts`, `lib/documentsApi.ts`,
  `lib/filesApi.ts`, `lib/imagesApi.ts` — these call `hostFetch`/`authenticatedFetch`.
- TanStack Query hooks in `hooks/` wrap the API modules.

```ts
// ❌ banned by oxlint
const res = await fetch("/api/sessions");

// ✅ correct
import { authenticatedFetch } from "@/lib/identity";
const res = await authenticatedFetch("/api/sessions");
```

### 2. No direct `react-router-dom` routing primitives — use `@/lib/routing`

oxlint **bans** importing `useNavigate`, `useParams`, `useSearchParams`,
`useLocation`, `Link`, `Outlet` from `react-router-dom`. Import them from
`@/lib/routing` instead — the IoC seam that embedded mode overrides.

```tsx
// ❌ banned by oxlint
import { useNavigate, Link } from "react-router-dom";

// ✅ correct
import { useNavigate, Link } from "@/lib/routing";
```

`Route`, `Routes`, `BrowserRouter`, `MemoryRouter` are structural and **may**
stay on `react-router-dom`.

### 3. Prettier formatting

Double quotes, semicolons, trailing comma `all`, 100-char width, 2-space indent.
Run `npm run format` before committing.

### 4. `verbatimModuleSyntax: true`

Use `import type` for type-only imports:

```ts
// ✅ correct
import type { AvailableAgent } from "@/lib/types";
import { someFunction } from "@/lib/types";

// ❌ error with verbatimModuleSyntax
import { AvailableAgent, someFunction } from "@/lib/types";
```

## Component patterns

- **Named exports only** — no `export default`
- **Inline prop type literals** — no separate `Props` interface unless reused
- **JSDoc** on every exported function
- **`@/` path alias** for all imports: `import { Tooltip } from "@/components/ui/tooltip"`
- **`cn()` from `@/lib/utils`** for class merging (clsx + tailwind-merge)
- **Icons**: `lucide-react` (generic) + `@/components/icons/*` (brand-specific)

```tsx
export function AgentCard({
  agent,
  selected,
  onSelect,
  compact = false,
}: {
  agent: AvailableAgent;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  // ...
}
```

## State management — three layers

| Layer | What | Where |
|---|---|---|
| **Zustand** | Module-scope client state (chat, terminal activity) | `store/chatStore.ts` |
| **TanStack Query** | Server state (sessions, conversations, files) | `hooks/useConversations.ts`, etc. |
| **React Context** | App-wide config (server info, theme, lightbox, runner health) | `lib/CapabilitiesContext.tsx`, `shell/ThemeProvider.tsx` |

- Single `QueryClient` in `main.tsx` with `staleTime: 30_000, refetchOnWindowFocus: false`.
- Mutations patch cached lists in-place, then invalidate on success.
- Query keys are exported constants.
- Zustand stores can inject the QueryClient (`initChatStore(queryClient)`) to
  invalidate caches from store actions.

## Provider hierarchy (`main.tsx`)

```
CapabilitiesProvider → QueryClientProvider → ThemeProvider →
  TooltipProvider → ImageLightboxProvider → BrowserRouter →
    SessionUpdatesProvider → RunnerHealthProvider → App
```

## i18n

- **i18next** + **react-i18next**, initialized before React renders.
- Two locales: `en`, `zh-CN` (translation files in `lib/locales/`).
- Language detection: localStorage (`agent-meow.language`) → `navigator.language` → `en`.
- Usage: `const { t } = useTranslation();`

## Testing conventions

- **Vitest** + `@testing-library/react` + `@testing-library/jest-dom`
- **Colocated tests**: `AgentCard.tsx` → `AgentCard.test.tsx` (same directory)
- Test files are exempt from the `fetch` and routing import bans
- `vi.mock()` to stub modules (especially brand icons)
- `vi.stubGlobal("fetch", fetchMock)` for fetch mocking in tests
- `renderHook` + `waitFor` for hook testing
- Factory functions for test data: `function agent(overrides = {}): AvailableAgent { ... }`
- `afterEach(cleanup)` to clean DOM between tests
- TanStack Query tests wrap in `QueryClientProvider` with a fresh `QueryClient`

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentCard } from "./AgentCard";

vi.mock("@/components/icons/ClaudeIcon", () => ({ ClaudeIcon: () => null }));
afterEach(cleanup);

describe("AgentCard", () => {
  it("renders the agent name", () => {
    render(<AgentCard agent={...} selected={false} onSelect={() => {}} />);
    expect(screen.getByText("some-agent")).toBeDefined();
  });
});
```

## Special UI libraries

### Tiptap (docs / rich text)

- `useEditor` hook + `EditorContent` in `shell/DocEditor.tsx`
- Extensions: StarterKit, Link, Image, Markdown
- Custom extensions: `TipTapCommentExtension`, `TipTapGitHubAlert`,
  `TipTapHtmlPassthrough`, `TipTapWorkspaceImage`
- `useEditorAutoSave.ts` — shared autosave hook

### Fabric.js (image editing)

- Fabric.js **v6** (`import * as fabric from "fabric"`) in `shell/ImageEditor.tsx`
- Canvas in `useEffect` with cleanup via `canvas.dispose()`
- Save/load via `canvas.toJSON()` / `canvas.loadFromJSON()`

### xterm.js (terminals)

- `components/blocks/TerminalSession.ts` — **pure-JS class** (not a React component)
- `TerminalView.tsx` mounts/unmounts the session via callback ref
- Addons: FitAddon, WebLinksAddon, WebglAddon
- Server→client: raw PTY bytes → `term.write`; client→server: `term.onData`

## Vendored code (do not modify or lint)

- `components/ui/` — shadcn/ui primitives (excluded from oxlint)
- `components/ai-elements/` — AI UI kit (excluded from oxlint & coverage)
- Build output goes to `agent_meow/server/static/web-ui/` (standalone) — never lint

## Adding a new feature — checklist

1. Create the component in `components/` (or `shell/` for app-level layout)
2. Use `@/` imports, named exports, inline prop types
3. Use `hostFetch`/`authenticatedFetch` for API calls — never bare `fetch()`
4. Use `@/lib/routing` for navigation — never direct `react-router-dom` primitives
5. Add a colocated `*.test.tsx` with `@testing-library/react` + `vi.mock` stubs
6. Run: `npm run lint && npm run type-check && npm test && npm run format`
7. If it's a user-facing UI behaviour change, add a Playwright test under `tests/e2e_ui/`