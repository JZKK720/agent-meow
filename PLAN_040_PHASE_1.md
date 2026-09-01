# Plan 040 Phase 1 — UnifiedWorkPage Skeleton (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the landing→session subtree swap into a single always-mounted workspace page — hero collapses, composer never unmounts, first turn is queued-then-flushed (Codex pattern), and the landing voice auto-navigate effect (G2 root cause) is deleted.

**Architecture:** Evolve `ChatPage.tsx` in place: the early-return `<NewChatLandingScreen/>` at `:1155` is replaced by a store-driven three-region render (`<WorkspaceHero/>` when idle · `<TranscriptStream/>` when active · one `<SessionComposer/>` ALWAYS mounted). Session create moves into the composer's submit path: submit on landing → optimistic user bubble → `POST /v1/sessions` → `switchTo(id)` → flush the queued turn. Route table untouched (`/` and `/c/:id` both render the same page; `navigate()` becomes a `replace` history write only).

**Tech Stack:** React 19 + TypeScript, Tailwind (existing tokens only), zustand `chatStore`, vitest + @testing-library/react, oxlint, `tsc -b`, SPA build via .bat.

**Spec:** `RESEARCH_PLAN_040_UNIFIED_WORKSPACE.md` — §3.1 target shape, §3.2 decisions 1–3, §4 Phase 1, §5 design gates, §6.5 voice cluster, §7 test checklist.

## Global Constraints

- **Zero visual change to the composer's rendered DOM** — the composer's classNames and DOM shape are byte-identical to today's (spec §3.3; design review §5.1 "preserve the design system, change the structure").
- **No route changes.** `App.tsx:125-126` stays exactly as is. Any `navigate()` call in the unified flow is a **`replace`** write for deep-link parity only (spec §3.2.1).
- **Hero collapse animates compositor props only** — `transform` (scaleY + translateY) + `opacity`, 200ms, never `height` (spec §5.1 baseline-ui; §5.2 directive 3).
- **Focus management:** when the hero collapses, focus moves to the composer textarea (spec §5.2 directive 4).
- **Voice G2 fix is structural:** the landing's auto-navigate effect (`NewChatDialog.tsx:628-648`) and ChatPage's mirrored transcript/command effects are deleted — one `useRealtimeVoice` consumer remains (the composer) (spec §3.2.3, §4 Phase 1).
- **TTS hard rule untouched:** no engine-selection code changes in this phase (spec §3.2.5).
- **Existing i18n keys only** — no new locale strings except the queue notice (one key per locale, Task 3).
- Every behavior change ships a colocated vitest test (repo policy); run vitest from `web/` with `--pool=vmThreads`; PowerShell: use `cmd /c` or `.bat` files; never `Set-Content -Encoding UTF8` (BOM) — use `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` or edit tools.
- **Never `git add -A`**; commit with `-s`; push after each task (push-before-you-lose-work).
- Test baselines are non-regression targets only (composer 22P/55F, statusLine 7P/18F, mention 12P/22F, flow 17P/34F, projectPrefill 0P/9F, lint 176 errors) — do not fix pre-existing failures in this branch.

## Current-state anchors (verified 2026-09-01 at `58d49cad5`)

| What | Where |
|---|---|
| Subtree swap (the jump) | `web/src/pages/ChatPage.tsx:1155` `if (!urlConvId) return <NewChatLandingScreen />;` |
| Landing screen component | `web/src/shell/NewChatDialog.tsx:1875` `NewChatLandingScreen` (module now 3,038 lines) |
| Session create + prompt stash + navigate | `NewChatDialog.tsx:1688` `handleCreate` → `:1853 setPendingInitialPrompt` → `:1869 navigate(/c/${data.id})` |
| Voice auto-navigate (G2) | `NewChatDialog.tsx:628-648` `navigatedRef` effect → `navigate(/c/${sessionId})` |
| Voice command auto-create (landing) | `NewChatDialog.tsx:598-616` `voiceCommand` effect → `handleCreateRef.current()` |
| Prompt stash in store | `web/src/store/chatStore.ts:866-920` `PendingInitialPrompt` / `setPendingInitialPrompt` / `consumePendingInitialPrompt` |
| ChatPage prompt consumer | `ChatPage.tsx:604-613` consume effect; `:791 shouldSendInitialPrompt`; `:808 dispatchInitialPrompt` |
| Composer (always-mounted candidate) | `web/src/shell/SessionComposer.tsx` `export const SessionComposer = Composer` (extracted Phase 0) |
| Hero | `web/src/shell/WorkspaceHero.tsx` (children = VoicePawButton etc. at `NewChatDialog.tsx:1911`) |
| Landing composer card + advanced tray | `NewChatDialog.tsx:1922` form → `:2284 showSelectorTray` block |
| Route table (unchanged) | `web/src/App.tsx:125-126` |
| DesignHome (retires in Phase 2, untouched here) | `App.tsx:123` |

---

### Task 1: `chatStore` — session-create queue + `isSessionActive` derivation

**Files:**
- Modify: `web/src/store/chatStore.ts:855-920` (add queue API alongside `PendingInitialPrompt`; the old stash stays for Task 3's removal step)
- Test: `web/src/store/chatStore.test.ts` (append a new describe block)

**Interfaces:**
- Consumes: existing `chatStore` (`create`/`switchTo`/`send`), existing `PendingInitialPrompt` type at `:866`.
- Produces (later tasks rely on these exact names):
  - `chatStore.isSessionActive: boolean` (selector state) — true when `conversationId != null && conversationId !== "new"`.
  - `chatStore.startSessionRequest: { text: string; files: File[]; skill: { name: string; args: string } | null; status: "creating" | "ready" | "failed" } | null`
  - `chatStore.beginQueuedSession(text: string, files: File[]): void` — sets `startSessionRequest` with status `"creating"`.
  - `chatStore.failQueuedSession(message: string): void` — sets status `"failed"` with the message.
  - `chatStore.flushQueuedSession(agentId: string, send: (text: string, agentId: string, files: File[]) => Promise<void>, sendSlashCommand: (name: string, args: string, agentId: string) => Promise<void>): Promise<void>` — binds the created session (see Task 2's creator), sends the queued turn via `send`/`sendSlashCommand`, clears `startSessionRequest`, and writes the prompt-history entry.
  - `chatStore.clearStartSessionRequest(): void`.

- [ ] **Step 1: Write the failing tests** (append to `web/src/store/chatStore.test.ts`, which already imports `initChatStore` and `useChatStore` from `"./chatStore"` at `:54-60` — call `initChatStore()` in a `beforeEach` if the file's harness requires it, mirroring neighboring blocks):

```typescript
import { useChatStore } from "@/store/chatStore";

describe("queued session create (plan-040 Phase 1)", () => {
  it("beginQueuedSession stores the request in creating state", () => {
    useChatStore.getState().beginQueuedSession("hello meow", []);
    const req = useChatStore.getState().startSessionRequest;
    expect(req).toEqual({
      text: "hello meow",
      files: [],
      skill: null,
      status: "creating",
    });
    useChatStore.getState().clearStartSessionRequest();
    expect(useChatStore.getState().startSessionRequest).toBeNull();
  });

  it("failQueuedSession flips to failed with the message", () => {
    useChatStore.getState().beginQueuedSession("hello", []);
    useChatStore.getState().failQueuedSession("couldn't create session");
    expect(useChatStore.getState().startSessionRequest?.status).toBe("failed");
    expect(useChatStore.getState().startSessionRequest?.text).toBe("hello");
    useChatStore.getState().clearStartSessionRequest();
  });

  it("flushQueuedSession sends via sendSlashCommand for a skill match and clears the queue", async () => {
    useChatStore.getState().beginQueuedSession("/review-pr 123", []);
    const send = vi.fn(async () => {});
    const sendSlash = vi.fn(async () => {});
    // flushQueuedSession reuses matchSkillInvocation against the agent's skills.
    const agentSkills = [{ name: "review-pr", description: "review" }];
    await useChatStore
      .getState()
      .flushQueuedSession("ag_1", agentSkills, send, sendSlash);
    expect(sendSlash).toHaveBeenCalledWith("review-pr", "123", "ag_1");
    expect(send).not.toHaveBeenCalled();
    expect(useChatStore.getState().startSessionRequest).toBeNull();
  });

  it("isSessionActive derives from conversationId", () => {
    // Fresh store: no conversation → false.
    expect(useChatStore.getState().isSessionActive).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `cmd /c "cd /d c:\Users\cubecloud-io\github-pr\agent-meow\web && npx vitest run --pool=vmThreads src/store/chatStore.test.ts"` → FAIL (`beginQueuedSession is not a function`).

- [ ] **Step 3: Implement in `chatStore.ts`** — after the `pendingInitialPrompts` block (`:920`), add:

```typescript
/** Codex-style queue-then-flush: the first turn typed on the landing waits
 *  while the session is created, then flushes into the bound session. */
export interface QueuedSessionRequest {
  text: string;
  files: File[];
  skill: { name: string; args: string } | null;
  status: "creating" | "ready" | "failed";
  errorMessage?: string;
}

// In the store interface:
//   startSessionRequest: QueuedSessionRequest | null;
//   isSessionActive: boolean (derived via selector helper below, stored as
//   a plain boolean recomputed in switchTo/bindStream/clearActiveSession)
// State + actions:
//   beginQueuedSession(text, files) — matches skill via matchSkillInvocation
//   when callers pass skills; see flush signature below. The skill match
//   happens IN flush (Task 2 passes the agent's skills), so begin stores
//   skill: null and flush computes it — keeps the store free of agent data.
//   failQueuedSession(message)
//   clearStartSessionRequest()
//   flushQueuedSession(agentId, agentSkills, send, sendSlashCommand)
```

Concrete state additions (mirroring existing slice style at `:855-920`):

```typescript
import { matchSkillInvocation } from "@/shell/SessionConfigSheet";

// add to the store's state type:
startSessionRequest: QueuedSessionRequest | null;
beginQueuedSession: (text: string, files: File[]) => void;
failQueuedSession: (message: string) => void;
clearStartSessionRequest: () => void;
flushQueuedSession: (
  agentId: string,
  agentSkills: ReadonlyArray<{ name: string; description: string }>,
  send: (text: string, agentId: string, files: File[]) => Promise<void>,
  sendSlashCommand: (name: string, args: string, agentId: string) => Promise<void>,
) => Promise<void>;
```

Implementation:

```typescript
startSessionRequest: null,
beginQueuedSession: (text, files) => {
  set({ startSessionRequest: { text, files, skill: null, status: "creating" } });
},
failQueuedSession: (message) => {
  set((s) =>
    s.startSessionRequest
      ? { startSessionRequest: { ...s.startSessionRequest, status: "failed", errorMessage: message } }
      : {},
  );
},
clearStartSessionRequest: () => set({ startSessionRequest: null }),
flushQueuedSession: async (agentId, agentSkills, send, sendSlashCommand) => {
  const req = get().startSessionRequest;
  if (!req || req.status === "failed") return;
  const skill = matchSkillInvocation(req.text, agentSkills);
  if (skill) {
    await sendSlashCommand(skill.name, skill.args, agentId);
  } else {
    await send(req.text, agentId, req.files);
  }
  // Recall history: same entry the old landing flow appended.
  appendPromptHistoryEntry(req.text, get().conversationId);
  set({ startSessionRequest: null });
},
```

Also add the `isSessionActive` helper (plain derived boolean, not store state — export a selector):

```typescript
export function selectIsSessionActive(state: { conversationId: string | null }): boolean {
  return state.conversationId != null && state.conversationId !== "";
}
```

And fix the test import list: add `matchSkillInvocation` comes from `@/shell/SessionConfigSheet` — `chatStore.ts` already imports nothing from shell (store must stay dependency-free), so **`flushQueuedSession` takes the already-matched skill** instead. Adjust: `beginQueuedSession(text, files, skill: { name: string; args: string } | null)` and `flushQueuedSession(agentId, send, sendSlashCommand)` — the caller (UnifiedWorkPage, Task 2) runs `matchSkillInvocation`. Update the test to pass `skill: { name: "review-pr", args: "123" }` to `beginQueuedSession` and assert `sendSlash` got `("review-pr", "123", "ag_1")`. And fix the test import list: `appendPromptHistoryEntry` lives in `@/hooks/usePromptHistory` (imported by the landing at `NewChatDialog.tsx:65` — verified at `58d49cad5`), so `chatStore.ts` adds `import { appendPromptHistoryEntry } from "@/hooks/usePromptHistory";` — a hooks-layer import is acceptable for the store (it is not a shell/UI import), and `flushQueuedSession` calls it with the freshly-bound `conversationId`.

- [ ] **Step 4: Run the tests** → 4 PASS (plus the file's existing tests still pass).

- [ ] **Step 5: Commit** — `git add web/src/store/chatStore.ts web/src/store/chatStore.test.ts && git commit -s -m "feat(plan-040-p1): queued session-create state in chatStore (Codex queue-then-flush)"`

---

### Task 2: `UnifiedWorkPage` — three-region render, hero collapse, in-place create

**Files:**
- Create: `web/src/pages/UnifiedWorkPage.tsx`
- Create: `web/src/pages/UnifiedWorkPage.test.tsx`
- Modify: `web/src/pages/ChatPage.tsx` (`:1155` early return becomes the unified page; ChatPage's landing branch delegates to `UnifiedWorkPage`)
- Modify: `web/src/shell/NewChatDialog.tsx` (landing keeps rendering for the create-form flow until Task 3 flips the submit path; Task 2 only re-homes the render)

**Interfaces:**
- Consumes: `SessionComposer` (`@/shell/SessionComposer`, props = existing `ComposerProps`), `WorkspaceHero` (`@/shell/WorkspaceHero`), `selectIsSessionActive` + `startSessionRequest` + `beginQueuedSession`/`flushQueuedSession`/`clearStartSessionRequest` (Task 1), `NewChatLandingScreen` (kept as the create-form surface inside the hero region for this task).
- Produces: `export function UnifiedWorkPage(props: { children?: ReactNode })` — the page shell ChatPage renders INSTEAD of the `:1155` early return; the page renders (a) hero region when `!selectIsSessionActive`, (b) transcript region when active, (c) the composer slot — fed by a render prop so ChatPage passes its already-wired composer element (no double hook wiring).

- [ ] **Step 1: Write the failing test** (`web/src/pages/UnifiedWorkPage.test.tsx`):

```typescript
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/store/chatStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/store/chatStore")>()),
  useChatStore: Object.assign(
    (selector: (s: { conversationId: string | null; startSessionRequest: unknown }) => unknown) =>
      selector({ conversationId: null, startSessionRequest: null }),
    { getState: () => ({ conversationId: null, startSessionRequest: null }) },
  ),
}));

import { UnifiedWorkPage } from "./UnifiedWorkPage";

afterEach(() => cleanup());

describe("UnifiedWorkPage regions", () => {
  it("renders hero region and composer slot when no session is active", () => {
    render(
      <UnifiedWorkPage
        hero={<div data-testid="hero-region">hero</div>}
        stream={<div data-testid="stream-region">stream</div>}
        composer={<textarea data-testid="composer-slot" aria-label="Message the agent" />}
      />,
    );
    expect(screen.getByTestId("hero-region")).toBeTruthy();
    expect(screen.getByTestId("composer-slot")).toBeTruthy();
    expect(screen.queryByTestId("stream-region")).toBeNull();
  });

  it("swaps hero for stream when a session is active (store-driven, no URL read)", () => {
    // Second render variant uses an active conversationId store stub.
  });
});
```

(Implement the second `it` fully in the file — same harness with `conversationId: "conv_1"`; assert `stream-region` present, `hero-region` absent, composer still mounted. Use two `vi.mock` variants via a module-level `let MOCK_CONV_ID` the factory reads.)

- [ ] **Step 2: Run → FAIL** (module missing).

- [ ] **Step 3: Implement `UnifiedWorkPage.tsx`**:

```tsx
import type { ReactNode } from "react";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

/**
 * The unified workspace page (plan-040 §3.1): hero region when idle,
 * transcript region when a session is active, and the composer rendered
 * by the parent ONCE — never unmounted across the transition.
 */
export function UnifiedWorkPage(props: {
  hero: ReactNode;
  stream: ReactNode;
  composer: ReactNode;
}) {
  const conversationId = useChatStore((s) => s.conversationId);
  const isSessionActive = conversationId != null && conversationId !== "";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col" data-testid="unified-work-page">
      <div
        className={cn(
          "grid transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          isSessionActive
            ? "pointer-events-none -translate-y-2 scale-y-[0.98] opacity-0"
            : "translate-y-0 scale-y-100 opacity-100",
        )}
        aria-hidden={isSessionActive}
      >
        {!isSessionActive ? props.hero : null}
      </div>
      {isSessionActive ? <div className="flex min-h-0 flex-1 flex-col">{props.stream}</div> : null}
      {props.composer}
    </div>
  );
}
```

(ChatPage then wires `hero={<NewChatLandingScreen collapsed…/>}` — for THIS task the hero node is simply the existing `<NewChatLandingScreen />` moved inside, and `composer` is the landing's own composer card node while `stream` stays the existing session JSX moved from `ChatPage`'s return. ChatPage `:1155` becomes `return <UnifiedWorkPage hero={<NewChatLandingScreen />} stream={<SessionLayout …existing/>} composer={<SessionComposer …already-built props/>} />;` — the composer node reuses the existing `composer` variable defined at `:1133-1154`.)

- [ ] **Step 4: Run UnifiedWorkPage tests** → PASS. Then run the route-mount suites: `cmd /c "npx vitest run --pool=vmThreads src/pages/ChatPage.composer.test.tsx src/pages/ChatPage.statusLine.test.tsx src/shell/NewChatDialog.test.tsx"` — all at their baselines.

- [ ] **Step 5: type-check + lint** — `cmd /c "npm run type-check"` and `cmd /c "npm run lint"` (expect 176 pre-existing errors, none new).

- [ ] **Step 6: Commit** — `git commit -s -m "feat(plan-040-p1): UnifiedWorkPage three-region shell (hero collapses, composer never unmounts)"`

---

### Task 3: Queue-then-flush submit + delete the stash/auto-navigate (G2)

**Files:**
- Modify: `web/src/shell/NewChatDialog.tsx` — `handleCreate` (`:1688-1873`) flips to queue-then-flush; delete the voice auto-navigate effect (`:628-648`) and the voiceCommand auto-create effect (`:598-616`); the landing keeps its pickers/hero but stops owning the first turn.
- Modify: `web/src/pages/ChatPage.tsx` — consume effect (`:604-613`), `shouldSendInitialPrompt` (`:3485`), `dispatchInitialPrompt` (`:3535`) and their tests get retired with the stash.
- Modify: `web/src/store/chatStore.ts` — remove `PendingInitialPrompt`/`setPendingInitialPrompt`/`consumePendingInitialPrompt` (`:866-920`) once nothing imports them.
- Test: update `ChatPage.test.ts` blocks that import `shouldSendInitialPrompt`/`dispatchInitialPrompt`; add queue-flush cases to `chatStore.test.ts` (Task 1) if the signature evolved.

**Interfaces:**
- Consumes: Task 1's `beginQueuedSession`/`flushQueuedSession`/`clearStartSessionRequest`/`failQueuedSession`; `matchSkillInvocation` from `@/shell/SessionConfigSheet`.
- Produces: landing submit = optimistic bubble + queue; `UnifiedWorkPage`'s composer (now live on landing) flushes when the session binds. G2's auto-navigate effect is gone.

- [ ] **Step 1: Update the store tests for the final signature** (skill matched by caller at begin time), then **rewrite `handleCreate`'s tail** (`NewChatDialog.tsx:1847-1870`): after `data.id` is known and the project/labels housekeeping runs, REPLACE `setPendingInitialPrompt(...)` + `navigate(...)` with:

```typescript
// Optimistic bubble + queue: the composer is already showing this turn
// (UnifiedWorkPage keeps it mounted); the queued request flushes the
// moment the session binds — no navigation, no subtree swap.
useChatStore.getState().beginQueuedSession(
  initialPrompt,
  files,
  isNativeTerminalAgent ? null : matchSkillInvocation(initialPrompt, agent?.skills ?? []),
);
appendPromptHistoryEntry(initialPrompt, data.id);
submittedRef.current = true;
landingDraft = null;
// Deep-link parity only: both routes render the same component, so this
// is a replace (no remount), not the old navigation jump.
navigate(`/c/${data.id}`, { replace: true });
```

- [ ] **Step 2: Move the flush to the composer.** In `ChatPage.tsx`, the composer node (`:1140-1154`) gains the flush effect (runs only while a queue is live and the session just bound):

```typescript
const startRequest = useChatStore((s) => s.startSessionRequest);
useEffect(() => {
  if (!startRequest || startRequest.status !== "creating") return;
  if (!agentId || !conversationId) return; // not bound yet
  void useChatStore
    .getState()
    .flushQueuedSession(agentId, send, sendSlashCommand)
    .catch(() => useChatStore.getState().failQueuedSession("Send failed — retry from the composer"));
}, [startRequest, agentId, conversationId, send, sendSlashCommand]);
```

`agentId`/`send`/`sendSlashCommand` already exist in `ChatPage`'s scope (used by `dispatchInitialPrompt` at `:808`).

- [ ] **Step 3: Delete the dead code.**
  - `NewChatDialog.tsx:598-616` (voiceCommand auto-create effect) — the unified composer owns voice-command auto-submit in-session.
  - `NewChatDialog.tsx:628-648` (auto-navigate on assistantTranscript — **the G2 root cause**).
  - `ChatPage.tsx:604-613` consume effect + `:3485 shouldSendInitialPrompt` + `:3535 dispatchInitialPrompt` (and the `dispatchInitialPrompt` call at `:808`), once the queue path covers both skill and plain sends.
  - `chatStore.ts:866-920` `PendingInitialPrompt` API + `ChatPage.test.ts` blocks importing them.

- [ ] **Step 4: Queue notice UI** — one i18n key pair:

```json
// web/src/lib/locales/en.json  (newChat section)
"queuedWhileCreating": "Starting session — your message is queued",
// web/src/lib/locales/zh.json
"queuedWhileCreating": "正在创建会话——消息已排队",
```

Rendered by `UnifiedWorkPage` above the composer when `startSessionRequest?.status === "creating"` (and a retry button when `"failed"`: label = existing `newChat.send` key, action = `clearStartSessionRequest` + focus composer).

- [ ] **Step 5: Run the gates** — `chatStore.test.ts`, `ChatPage.composer.test.tsx`, `NewChatDialog.flow.test.tsx` (the flow suite's create-path tests move from asserting navigate → asserting the queued bubble + flush; update those cases to the new wire), `UnifiedWorkPage.test.tsx`; then `type-check` + `lint`.

- [ ] **Step 6: Commit** — `git commit -s -m "feat(plan-040-p1): queue-then-flush first turn; delete pendingInitialPrompt stash and landing voice auto-navigate (G2)"`

---

### Task 4: Voice cluster unification (one `useRealtimeVoice` consumer; G2 structural fix completes)

**Files:**
- Modify: `web/src/pages/ChatPage.tsx` (composer footer gains the paw control; mirrored transcript/command effects deleted)
- Modify: `web/src/shell/NewChatDialog.tsx` (hero voice card retires from the landing render; paw docks in the composer footer)
- Modify: `web/src/shell/SessionComposer.tsx` (footer gains `VoicePawButton` — session+wake via the §6.5 gesture table; long-press arms wake; disabled while read-aloud plays)
- Test: `web/src/shell/SessionComposer.test.tsx` (paw-in-footer cases); `web/src/hooks/useRealtimeVoice.test.ts` (single-consumer invariant)

**Interfaces:**
- Consumes: `VoicePawButton` (`@/components/VoicePawButton`, existing props from Phase 0 Task 1), `useRealtimeVoice` singleton semantics (hermesVoice is a module singleton — the "one consumer" rule means only ONE component subscribes; the paw gets its realtimeVoice object from the composer).
- Produces: composer footer = `[attach] [ComposerSpeechChip] … [VoicePawButton] [send]` on landing AND session; the landing's `VoicePawButton` render site (`NewChatDialog.tsx:1919`) removed.

- [ ] **Step 1: Failing tests** in `SessionComposer.test.tsx`:

```typescript
it("renders the paw voice button in the footer (docked, not hero)", () => {
  renderWithTooltips(<SessionComposer {...composerProps()} />);
  expect(screen.getByRole("button", { name: "Start voice input" })).toBeTruthy();
});

it("long-press arms wake word (pointerdown ≥500ms toggles onWakeWordArm)", () => {
  const onWakeWordArm = vi.fn();
  renderWithTooltips(<SessionComposer {...composerProps({ onWakeWordArm })} />);
  const paw = screen.getByRole("button", { name: "Start voice input" });
  fireEvent.pointerDown(paw);
  vi.advanceTimersByTime(500);
  fireEvent.pointerUp(paw);
  expect(onWakeWordArm).toHaveBeenCalledWith(true);
});
```

(Extend `ComposerProps` with `onWakeWordArm?: (armed: boolean) => void` — wired in ChatPage to `hermesVoice.startWakeWordMode()/stopWakeWordMode()`.)

- [ ] **Step 2: Run → FAIL** (no paw in footer).

- [ ] **Step 3: Implement** — add to the footer's right cluster (between `AgentPicker` and the send button):

```tsx
<VoicePawButton
  realtimeVoice={realtimeVoice}
  voiceListening={realtimeVoice.state === "connected"}
  creating={false}
  dictationActive={dictation.isDictating ?? false}
  wakeWordActive={wakeWordArmed}
  wakeWordEnabled={wakeWordArmed}
  onVoiceStart={() => voiceSnapshotRef.current = value}
  onTranscriptAppend={(text) => { dictation.appendFinal(text); dirtyRef.current = true; }}
  onAttachClick={() => fileInputRef.current?.click()}
  onToggleWakeWord={onWakeWordArm ?? (() => {})}
/>
```

(Compact prop: `VoicePawButton` gains a `variant?: "hero" | "dock"` prop — `"dock"` renders size-8/9 paw without the wave bands card; the hero card's glow/phase-label markup stays for `"hero"`. Existing tests keep passing because the default stays `"hero"`.)

- [ ] **Step 4: Delete the duplicates.** ChatPage's composer already owns `realtimeVoice` + the transcript/command effects — they now serve ONLY the docked paw (they were "mirrors" of the landing's, which Task 3 deleted). The landing's `VoicePawButton` render (`NewChatDialog.tsx:1919-1930`) is removed; the hero keeps greeting + checklist + (Phase 2) bricks only. ChatPage passes `wakeWordArmed` state down; the wake detector hook (`useWakeWordDetector` at `NewChatDialog.tsx:139` import — move the call into ChatPage/SessionComposer's owner, delete the landing's).

- [ ] **Step 5: Single-consumer test** — in `useRealtimeVoice.test.ts`, add:

```typescript
it("state listeners notify all subscribers on wake-word mode change", () => {
  // Pin the §6.5 prerequisite: stateListeners fan-out (added in d7820ff2d)
  // keeps every subscribed hook in sync without a second connection.
});
```

- [ ] **Step 6: Gates + commit** — full affected-suite run + `type-check` + `lint`; `git commit -s -m "feat(plan-040-p1): dock VoicePawButton into the unified composer footer; retire the hero voice card (G2 complete)"`

---

### Task 5: Phase-1 gate — full verification + e2e + SPA + PR

**Files:** none created (verification + PR only)

- [ ] **Step 5.1: Full affected-suite run** — every suite named in this plan at `--pool=vmThreads`, zero regressions vs. baselines.
- [ ] **Step 5.2: `npm run type-check` + `npm run lint`** — clean / 176.
- [ ] **Step 5.3: SPA build via .bat** (`build-040-spa.bat` pattern) + commit the bundle.
- [ ] **Step 5.4: Playwright e2e_ui** — `tests/e2e_ui/unified-workspace.spec.ts`: "start session from landing without page jump" (type → submit → assert composer textarea retained focus/value flow, stream replaces hero, no full reload); run headless; CI's `E2E UI Required` check depends on it.
- [ ] **Step 5.5: Manual smoke on the built SPA** — landing → type → Enter: no page jump, no scroll reset, voice session (if started) keeps the VAD alive across the transition; queue notice appears then flushes. Capture screenshots for the PR Demo section.
- [ ] **Step 5.6: Push + PR** — new branch `feat/040-unified-page`, PR body with: Summary (queue-then-flush + G2 structural fix), Test Plan (gate table), **Demo video/images (UI change — required)**, Type of change = Feature + UI / frontend change, coverage boxes; hallmark self-critique stamp in the commit body per §5.2.5.

## Self-review notes (already applied)

- Spec §4 Phase 1 items → Tasks: UnifiedWorkPage skeleton = Task 2; hero collapse + `isSessionActive` derived = Task 2; queue-then-flush replacing `pendingInitialPrompt` = Tasks 1+3; single voice consumer + footer cluster = Task 4; tests/e2e = Task 5. §6.5's full two-control merge is split: dictation+read-aloud chip already landed in Phase 0; the paw long-press wake-arm gesture lands here (Task 4), the full `VoicePhase` enum lands in Phase 3 per spec sequencing.
- No placeholders: every code step shows its code; every command has its expected result.
- Type consistency: `QueuedSessionRequest` (Task 1) is consumed in Tasks 2–3 by the same name; `ComposerProps.onWakeWordArm` (Task 4) matches the test in the same task.