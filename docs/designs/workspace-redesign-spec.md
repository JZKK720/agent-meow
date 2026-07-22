# agent-meow workspace UI redesign spec

> **⚠️ SUPERSEDED — 2026-07-22.** This spec was written against the premise of
> decorating agent-meow's *existing* landing screen with example-prompt and
> recent-agent strips. That premise is obsolete. The current task is
> **reintegrating upstream `JZKK720/omnigent` workspace UI** (547 commits ahead)
> into agent-meow while preserving agent-meow branding. The active design is
> **`docs/superpowers/specs/2026-07-22-workspace-reintegration-design.md`**.
> This file is retained for history only — do not implement from it.
>
> Companion to `workspace-design-new-01.png` and `workspace-design-new-02.png`.
> Methodology: Hallmark (anti-slop audit + spec) × gbrain (codebase context) × Karpathy (surgical change, surfaced assumptions, verifiable success).

## 0. How to read this document

The screenshots in the brief show a **left-sidebar workspace** with a hero, three bordered "tool" cards, three "agent" cards, and a bottom input bar with model/workdir/workspace selectors. The current `web/` codebase does **not** ship that layout. Its home `/` renders a centered `max-w-[840px]` landing composer with a cat mascot; its in-session composer is a sticky form at the bottom of the chat column. Tools surface **only** as inline chat-transcript rows, and agents surface only in a picker dropdown.

This spec therefore has two readings of "re-render":

- **A. Re-render the home `/` landing screen** to match the brief. This is *net-new UI* that fits inside the existing 2-pane shell. It is surgical and additive. **Recommended.**
- **B. Re-render the in-session composer** to expose the same affordances (model, workdir, "Claude Code" toggle). This is *additive UI* to the existing `ChatPage` composer. **Recommended.**

It is **not** "replace the 2-pane shell with a dashboard". That would break Sidebar, ChatHeader, the right rail, every existing test, and the `useNativeServerSwitcherForMainSurface(landingSurface, true)` iOS hook (see `NewChatDialog.tsx` and `AppShell.tsx`).

## 1. Existing system — what's already wired (do not re-implement)

These are the gbrain-pinned entities the redesign chains into. Each one already exists and is load-bearing; the spec only **calls** them.

| Concern | Existing entity | Where |
|---|---|---|
| 2-pane shell | `AppShell` | `web/src/shell/AppShell.tsx` (~880 lines) |
| Left conversation list | `Sidebar` (brand + Inbox + pinned + projects + archived) | `web/src/shell/Sidebar.tsx` (~1500 lines) |
| Landing home `/` | `NewChatLandingScreen` (in `NewChatDialog.tsx`) | `web/src/shell/NewChatDialog.tsx:2604+` |
| Floating top bar over chat | `ChatHeader` | `web/src/shell/ChatHeader.tsx` (~500 lines) |
| Right rail tabs | Files / Terminals / Subagents / Todos / Logs / Comments / Docs | `web/src/shell/railTabs.ts` + `AppShell.tsx` |
| In-session composer | inline in `ChatPage` | `web/src/pages/ChatPage.tsx` |
| Active-session streaming state | `chatStore` (Zustand, module-scope) | `web/src/store/chatStore.ts` (~2000 lines) |
| Server-cached state (conversations, agents, hosts, MCP) | TanStack Query, keys via `lib/queryKeys.ts` | `web/src/lib/queryKeys.ts` |
| Cat mascot asset | `MeowCatMascot` → `web/public/mascot-hero.png` | `web/src/components/icons/MeowCatMascot.tsx` |
| Per-harness SVG icons | `ClaudeIcon`, `CodexIcon`, `CursorIcon`, `GooseIcon`, `HermesIcon`, `KimiIcon`, `KiroIcon`, `MeowCatIcon`, `NessieIcon`, `OpenCodeIcon`, `OttoIcon`, `PiIcon`, `AntigravityIcon` | `web/src/components/icons/` |
| Inline tool call row | `ToolCard` (header comment: "the big border-stripe / badge / pill card shell was removed deliberately") | `web/src/components/blocks/ToolCard.tsx` |
| Slash-command menu | `SlashCommandMenu` + `BUILTIN_SLASH_COMMANDS` | `web/src/components/SlashCommandMenu.tsx` |
| Workspace path picker | `WorkspacePicker` (full popover, host-FS browser) | `web/src/shell/WorkspacePicker.tsx` |
| i18n (EN + ZH-CN) | i18next with `en.json` + `zh-CN.json` | `web/src/lib/i18n.ts` + `web/src/lib/locales/` |
| Design tokens | Tailwind v4 `@theme inline` block | `web/src/index.css:18+` |
| Server tool registry | `ToolManager` (register_*, `invoke`, `tool_definitions`) | `agent_meow/tools/manager.py` |
| Server tools endpoint (per-session) | `POST /v1/sessions/{id}/mcp` (JSON-RPC) | `agent_meow/server/routes/sessions.py:13272+` |
| Per-session MCP proxy | server delegates to runner `McpManager` | `agent_meow/inner/databricks_mcps/...` |
| Native harness terminal mode | `MainTerminalView` (xterm.js) gated by `TerminalFirstContext` | `web/src/shell/MainTerminalView.tsx` |
| Approval cards (permission) | `ApprovalCard` (replaces "agent card" grid) | `web/src/components/blocks/ApprovalCard.tsx` |

## 2. Hallmark anti-slop audit (the two screenshots)

### 2a. What's actually good in the brief

- **The mascot carries the brand.** Orange cat silhouette + "MEOW AI" wordmark + a small functional question. That aligns with `MeowCatMascot` + the existing `<h1>What should we do?</h1>` in `NewChatLandingScreen`.
- **i18n parity.** Both screenshots show CN copy (`新建对话`, `技能广场`, `图片生成`, `视频生成`, `文档生成`, `Polly`, `Debby`, `智能超级记忆`, `工作目录`, `Claude Code`) and the codebase ships `zh-CN.json`. Nothing new here.
- **Bottom input bar with model/workdir/workspace chips.** The codebase already has these chips in the landing composer (`workspaceChip` in `NewChatDialog.tsx:2667`; `pickedModel` / `pickedEffort` in the `ModelEffortOptions` submenu). The brief is a **rearrangement** of existing affordances, not new affordances.

### 2b. What's *not* in the codebase and would be a slop-red flag if added naively

- **Bordered card grids for "tools" (图片生成 / 视频生成 / 文档生成).** The codebase *deliberately* removed bordered tool cards — see the header comment of [ToolCard.tsx](web/src/components/blocks/ToolCard.tsx). Three card-shaped placeholders labeled "Image gen / Video gen / Doc gen" are **not** "tools" in this codebase; tools are `sys_*` server callables (`sys_upload_file`, `sys_list_files`, `sys_transcribe`, `sys_list_videos`, `sys_list_documents`, …) and they surface only inside the chat transcript as `function_call` rows. Adding a 3-card "tools gallery" to the landing is a fabricated affordance and a regression of the design intent.
- **Bordered card grid for "agents" (Polly / Debby / 智能超级记忆).** The codebase exposes agents through the `AgentHarnessPicker` dropdown in the landing composer, filtered server-side by `useAvailableAgents()`. Polly and Debby are example agents under `examples/polly/` and `examples/debby/`. They are **not** part of the global "start screen" — they're picked at conversation create time. A static 3-card "agents gallery" on the landing is a fabricated affordance; the equivalent in the current code is the `AgentHarnessPicker` popover.
- **"Skills square" (技能广场) as a top-level sidebar entry.** Skills already live in `/settings/skills` (table view, not a card grid). Promoting it to a top-level sidebar entry beside "New chat" is a UX-direction call; the existing settings page layout is intentional.
- **"Workspace" as a left-sidebar view.** The current left sidebar is the conversation list — it is the global `Sidebar` component. Re-skinning it as a "workspace" dashboard breaks the brand-link-to-`/` invariant, the Inbox button, the pinned-projects-archived grouping, every `Sidebar.*.test.tsx`, and the bulk-action keyboard shortcuts.

### 2c. The two screenshots vs. each other

- **Screenshot 01** ("新建对话" landing, no agent selected) — three tool cards + three agent cards + model/workdir chips in the bottom bar. This is the *empty-state landing screen*.
- **Screenshot 02** (a session is open, chat messages visible) — same sidebar + model/workdir chips, but the three tool cards are gone, replaced by a chat thread, and a "Claude Code" pill appears in the chips. The three agent cards are also gone, replaced by a "Stop" pill.

**Reading 02 as an in-session state is correct**: the card grid is the *empty/landing* decoration, and the chips are the *only persistent* surface. That maps cleanly to: cards live on the landing screen (under the hero, above the composer); chips persist into the in-session composer. The brief is internally consistent: the brief is "decorate the empty state, persist the controls into the live state."

### 2d. Specificity check (Hallmark gate)

Every visible element in the brief maps to a code entity:

| Brief element | Code entity | Action |
|---|---|---|
| Sidebar brand "MEOW AI" | `Sidebar` brand link | keep (no change) |
| Sidebar "新建对话" button | Sidebar "New chat" button | keep (no change) |
| Sidebar "技能广场" | not present; closest is `/settings/skills` | **decision: add a section link, not a new page** |
| Sidebar conversation list | `Sidebar` conversation list | keep (no change) |
| Hero mascot | `MeowCatMascot` + greeting h1 | keep; lift greeting from `NewChatLandingScreen` line 2604 |
| Three tool cards | none — fabricated | **decision: do not ship; see §3 for the correct interpretation** |
| Three agent cards | none — fabricated | **decision: replace with a "Recent agents" strip showing the 3 most recently used agents from `useAvailableAgents()`** |
| Bottom input textarea | `LandingProjectPicker` + textarea | keep (no change to internals) |
| Model chip | `pickedModel` in `NewChatDialog.tsx` | move to bottom-bar left, persist into `ChatPage` composer |
| Workdir chip | `workspaceChip` in `NewChatDialog.tsx:2667` | keep, persist into `ChatPage` composer |
| "Claude Code" agent pill | `AgentHarnessPicker` entry | persist into `ChatPage` composer as a single visible pill, rest in dropdown |

### 2e. Variety + anti-templated check (Hallmark gate)

- **No two consecutive elements have the same shape.** Hero > cards > chips. ✓
- **No "Pill · Pill · Pill · Pill" trim row.** The chips are visually different sizes (workdir > model > agent pill > send). ✓
- **No emoji icons in chrome.** The codebase imports lucide; new chrome must use lucide. ✓
- **No generic "What can I help you with today?" greeting.** Use the existing `<h1>What should we do?</h1>` (en) / 帮我做点什么 (zh-CN). ✓
- **No gradient backgrounds, no glassmorphism.** The token system is shadcn default + a few custom extensions; no new tokens are introduced by this spec. ✓

## 3. Reinterpretation — the "tool cards" and "agent cards"

### 3a. "Tool cards" → 3 example prompts

The three bordered boxes labeled 图片生成 / 视频生成 / 文档生成 are best read as **3 example prompts that prime the user**, not a tool gallery. Concretely:

- `画一只在写代码的橘猫` (Draw an orange cat writing code) → prime the image-tooling path.
- `把这段会议录音整理成纪要` (Summarize this meeting recording into minutes) → prime the transcript/docs path.
- `给这段短视频加字幕` (Add subtitles to this short video) → prime the video-tooling path.

These are example prompts, not tools. They live in a horizontal scrollable strip between the hero and the composer. Each tile is a single line of Chinese text on a muted background, no icon chrome, no description. Click → fills the textarea. The user can dismiss the strip with a small `×` in the corner; the dismissal is stored in `localStorage` under `landing.examplesDismissed` so it stays out of the way for power users.

This is a **show, not tell** pattern: the user is given the *kind* of thing the agent can do, not a taxonomy.

### 3b. "Agent cards" → 3 most recently used agents

The three bordered boxes labeled Polly / Debby / 智能超级记忆 are best read as **3 most recently used agents**, not a static agent gallery. Concretely:

- Query `useAvailableAgents()`.
- Order by `lastUsedAt` desc.
- Render the top 3 as a horizontal strip *between the example-prompts strip and the composer*, with each card showing the harness SVG icon, the agent name, and a one-line `description` (from `AvailableAgent.description`).
- Click → sets `pickedAgent` and focuses the textarea.

This is a **recency surface**, not a catalog. The full catalog stays where it is: behind the `AgentHarnessPicker` dropdown.

## 4. Spec — what to build

### 4a. Landing screen (`/` route)

**File to edit:** `web/src/shell/NewChatDialog.tsx` (the `NewChatLandingScreen` function at `NewChatDialog.tsx:2604-2680`, inside the existing `ref={setLandingSurface}` container).

**Order of children, top → bottom (within the existing `max-w-[840px]` cap):**

1. **Hero** — keep the existing `MeowCatMascot` + `<h1>What should we do?</h1>`. Center, no change.
2. **Example prompts strip** — NEW. 3 tiles, horizontal scroll-snap-x, each tile is `text-sm text-muted-foreground` on a `bg-muted/40` rounded surface, no border. Tile text comes from a new constant `LANDING_EXAMPLE_PROMPTS` in `NewChatDialog.tsx` (en + zh-CN strings added to `en.json` and `zh-CN.json` under the `landing.examplePrompts.*` namespace). Click → fills `composerDraft`. Dismiss button in the strip's top-right stores the dismissal in `localStorage` and collapses the strip.
3. **Recent agents strip** — NEW. At most 3 entries, derived from `useAvailableAgents()` ordered by `lastUsedAt` desc. Each entry: `harness icon` (24px) + `agent name` (text-sm font-medium) + `description` (text-xs text-muted-foreground, truncated to 1 line). Click → `setPickedAgent(agent.id)` and focus the textarea. If the user has fewer than 3 recently used agents, show fewer tiles, do not pad with static entries.
4. **Composer** — keep the existing composer form (textarea, paperclip, send). No internal changes to `NewChatDialog.tsx`'s `useAutoGrowTextarea` / submit logic.
5. **Composer footer chips** — MOVE the existing `pickedModel` / `pickedEffort` / `workspaceChip` / `AgentHarnessPicker` chips into a single horizontal tray *under* the textarea, *above* the keyboard hint. Already implemented as subcomponents; this is a layout change only.

**Width:** keep `max-w-[840px]`. The strips inside are `overflow-x-auto snap-x snap-mandatory` with `scrollbar-width: none` and each tile `min-w-[260px] flex-shrink-0`.

**Token usage:** `bg-muted/40`, `text-muted-foreground`, `rounded-2xl`, `gap-3`. No new tokens. No new colors.

**Accessibility:** each tile is a `<button>` with `aria-label` set to the prompt/agent name; the strip is `role="group" aria-label="Example prompts"` / `"Recent agents"`.

**iOS shell hook:** keep the `ref={setLandingSurface}` so `useNativeServerSwitcherForMainSurface(landingSurface, true)` continues to find the surface for the iOS server switcher overlay.

### 4b. In-session composer (`/c/:id`) — minimal

**Karpathy check (you-can-do-less):** in-session, the model and agent are *already locked* — they live in the `chatStore` and are surfaced in `ChatHeader.tsx` (agent icon, name, and stop button). Re-rendering the full chip tray in the bottom composer would duplicate `ChatHeader` state and add noise mid-flight. Only one chip is mutable mid-session: the **workdir picker** (you can `Resume…` into a new directory). Model and agent pickers stay where they are (in `ChatHeader` / the kebab menu / the right-rail agent info button).

**File to edit:** `web/src/pages/ChatPage.tsx` (the inline composer region around line 600+).

**Order of children, top → bottom (within the existing composer card):**

1. **Textarea** — keep, no change.
2. **Composer footer tray** — *one chip only*: a **workdir pill** that opens the `WorkspacePicker` and shows the active session's `workspace` path. (Identical to the landing's `workspaceChip`, just bound to the active session instead of the new-conversation state.)
3. **Send button** — keep, no change.

**Agent / model / stop / share controls:** stay in `ChatHeader.tsx` (the floating h-14 bar) exactly as they are. Do not duplicate them in the bottom chip row. The brief's "Stop" placement in screenshot 02 is a screenshot artifact, not a spec.

### 4c. Sidebar — add "技能广场" link

**File to edit:** `web/src/shell/Sidebar.tsx`.

**Action:** add a new section under the brand link + Inbox button, before the conversation list. Section contains a single nav item: label "技能广场" (zh) / "Skill Library" (en), icon `BookOpenIcon` (lucide), route `/settings/skills`. Active state matches the Inbox button's active state.

**i18n keys:** `sidebar.skillLibrary` in `en.json` and `zh-CN.json`.

### 4d. State

- **No new store.** All new state is local to `NewChatLandingScreen` and `ChatPage` composer:
  - `dismissedExamplePrompts: boolean` — `useState` + `localStorage` (`landing.examplePromptsDismissed`).
  - `recentAgents: AvailableAgent[]` — derived from `useAvailableAgents()` TanStack Query.
  - `pickedAgent` / `pickedModel` / `pickedEffort` / `workspacePath` — already in `NewChatDialog.tsx` and `ChatPage.tsx`; no new fields.
- **No new query keys.** The recent-agents ordering is computed in-component via `useMemo`.

### 4e. Tool wiring (the "tool cards" → real tools mapping)

The brief's three example prompts are wired to the existing tool call surface — they are **prompts, not buttons**. When the user clicks a tile, the composer fills with the prompt and the user has to press send. The actual tool calls (image gen, transcript, video) happen in the chat transcript via the existing `ToolCard` + `BlockRenderer` path.

Concretely: a tile click is a **state mutation** (`setComposerDraft("画一只在写代码的橘猫")` + `textareaRef.current?.focus()`). It does **not** call `POST /v1/sessions/{id}/mcp`, does **not** invoke `ToolManager.invoke`, does **not** touch the runner. The MCP JSON-RPC proxy is per-session and is not available on the landing; that's correct — the user has not yet picked an agent or workdir.

### 4f. i18n

Add the following keys to **both** `web/src/lib/locales/en.json` and `web/src/lib/locales/zh-CN.json`:

```jsonc
// en.json
{
  "landing": {
    "examplePrompts": {
      "label": "Try a prompt",
      "dismiss": "Hide examples",
      "drawCat": "Draw an orange cat writing code",
      "summarize": "Summarize this meeting recording into minutes",
      "subtitles": "Add subtitles to this short video"
    },
    "recentAgents": {
      "label": "Recent agents",
      "emptyHint": "Your most-used agents will show up here."
    }
  },
  "sidebar": {
    "skillLibrary": "Skill Library"
  }
}
```

```jsonc
// zh-CN.json
{
  "landing": {
    "examplePrompts": {
      "label": "试试这些",
      "dismiss": "隐藏示例",
      "drawCat": "画一只在写代码的橘猫",
      "summarize": "把这段会议录音整理成纪要",
      "subtitles": "给这段短视频加字幕"
    },
    "recentAgents": {
      "label": "最近使用的 Agent",
      "emptyHint": "你常用的 Agent 会显示在这里。"
    }
  },
  "sidebar": {
    "skillLibrary": "技能广场"
  }
}
```

### 4g. Tests to add

- `web/src/shell/NewChatLandingScreen.examplePrompts.test.tsx` — renders 3 tiles, click → composer fills, dismiss → strip hidden + localStorage set.
- `web/src/shell/NewChatLandingScreen.recentAgents.test.tsx` — shows at most 3 entries ordered by `lastUsedAt` desc, empty-state when no agents.
- `web/src/shell/Sidebar.skillLibrary.test.tsx` — sidebar nav item active when on `/settings/skills`.
- `web/src/pages/ChatPage.composer.test.tsx` — existing; extend to assert the workdir chip opens `WorkspacePicker` and that the bottom tray does NOT contain model/agent/stop chips (regression guard against re-adding duplicate chrome).
- `web/src/lib/locales/__snapshots__/landing.*.test.ts` — assert both en + zh-CN include the new keys.

## 5. Karpathy principles applied

### 5a. Surgical change (the "don't rewrite" rule)

| File | Lines touched (estimate) | Why |
|---|---|---|
| `web/src/shell/NewChatDialog.tsx` | ~80 added, ~10 moved | Add the two strips above the composer; move chips into the footer tray. |
| `web/src/shell/Sidebar.tsx` | ~15 added | New "Skill Library" nav item. |
- `web/src/pages/ChatPage.tsx` | ~15 added | Workdir chip only in the in-session composer footer tray. |
| `web/src/lib/locales/en.json` | ~15 added | New keys. |
| `web/src/lib/locales/zh-CN.json` | ~15 added | New keys. |
| `web/src/index.css` | 0 | No new tokens. |
| `web/src/shell/ChatHeader.tsx` | 0 | Stop button stays where it is. |
| `web/src/components/blocks/ToolCard.tsx` | 0 | Deliberately untouched. |

### 5b. Surfaced assumptions

1. **The 3 example prompts are placeholders.** The actual prompts should be picked by the product team based on the most common first-message patterns in production telemetry. The spec ships 3 representative ones; replace before launch.
2. **"最近使用" ordering of agents.** `useAvailableAgents()` may not expose `lastUsedAt` today. If not, add it to the `AvailableAgent` interface (backend `agent_meow/agent_registry.py` or similar) and persist it on the conversation row. This is a one-line schema change; do it before merging the UI.
3. **The "Stop" pill in screenshot 02 is not a spec.** It is the existing `ChatHeader` stop button, screenshot at a different viewport. The spec keeps it in `ChatHeader.tsx`.
4. **iOS overlay.** `setLandingSurface` ref must remain on the new strips' parent container so `useNativeServerSwitcherForMainSurface` keeps working. The strips are inside the existing `setLandingSurface` div, so this is automatic — but verified in §4a.
5. **No new tokens.** The spec uses only `bg-muted/40`, `text-muted-foreground`, `rounded-2xl`. If a future PR wants gradient or glass, it must add tokens to `index.css` and a re-audit. The current spec stays in the existing token system.

### 5c. Verifiable success criteria

1. Landing page renders 3 example prompt tiles + up to 3 recent agent tiles + composer + chips, all within `max-w-[840px]`. Playwright assertion: at viewport 1440×900 the landing `<main>` has `scrollHeight <= clientHeight` (no page-level scroll).
2. Click a prompt tile → textarea contains the prompt text + is focused.
3. Dismiss button → strip hidden + `localStorage.landing.examplePromptsDismissed === "true"`.
4. Reload page → strip stays hidden.
5. Sidebar "技能广场" / "Skill Library" link → `/settings/skills`; active state on that route.
6. In-session composer has a workdir chip + send button. No duplicate model/agent/stop chips — those live in `ChatHeader.tsx`.
7. No new tokens in `index.css`. No changes to `ToolCard.tsx`. No changes to `ChatHeader.tsx`. No changes to `AppShell.tsx`.
8. `npm run type-check` clean. `npm run lint` clean. `npm test` passes for `web/src/shell/NewChat*` and `web/src/pages/ChatPage.composer`.

### 5d. Things explicitly NOT in this spec

- New "tools gallery" page at `/tools` (would conflict with ToolCard's design intent).
- New "agents gallery" page at `/agents` (would conflict with the picker dropdown).
- New "workspace" view in the left sidebar (would break the conversation list invariant).
- Re-skinning the brand mark to a different cat (the existing orange cat is the brand asset).
- New icons (use existing lucide + per-harness SVGs).
- New colors or gradients.
- Changes to the right rail (Files / Terminals / Subagents / Todos / Logs / Comments / Docs).
- Changes to the native-terminal first mode (xterm.js view).
- Changes to the in-chat approval cards.

## 6. Open questions for the user

1. **The 3 example prompts.** Are `画一只在写代码的橘猫` / `把这段会议录音整理成纪要` / `给这段短视频加字幕` the actual desired prompts, or do you want different ones?
2. **"技能广场" placement.** Top-level sidebar item (this spec) or settings sub-section (current behavior)? Top-level means a one-click jump from the landing; sub-section is one extra click.
3. **Recent agents ordering source.** If `useAvailableAgents()` doesn't expose `lastUsedAt`, is a backend schema change acceptable, or should the recent-agents strip pull from the local conversation list (cheaper, no schema change)?
4. **Stop button in screenshot 02.** Confirm it is a screenshot artifact and the spec keeps it in `ChatHeader.tsx`.
5. **In-session composer chrome — final check.** Spec now ships a workdir-only chip in the bottom tray (model/agent/stop stay in `ChatHeader.tsx`). If you actually want the full chip tray mirrored for visual consistency with the landing, say so and I'll restore §4b to the four-chip version — but the Karpathy default is "don't duplicate state that's already surfaced one row up."
