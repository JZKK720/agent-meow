# Plan 040 — Phase 0: Extraction (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the voice controls, session-config pickers, and the in-session composer out of the `NewChatDialog.tsx` / `ChatPage.tsx` god-modules into focused components — **zero behavior change** — so Phases 1–3 (unified workspace page, hero bricks, voice state machine) build on clean interfaces instead of inline edits.

**Architecture:** Pure refactor. `NewChatLandingScreen` keeps rendering the extracted components in place; the `/` and `/c/:id` routes are untouched. Each extraction is a mechanical move of an existing JSX block + its local state into a colocated component file, with prop seams that Phase 1 will later re-point. No new hooks, no new state, no new routes.

**Tech Stack:** React 19 + TypeScript, Tailwind (existing tokens only), vitest + @testing-library/react for colocated tests, oxlint, `tsc -b`.

**Spec:** `RESEARCH_PLAN_040_UNIFIED_WORKSPACE.md` (§3.1 target shape, §4 Phase 0, §6.5 voice-control merge spec, §7 test checklist, §5 design-skill gates).

**Branch:** cut `feat/040-unified-workspace` from `feat/039-file-index-phase0` at `d19e5d703` (or from `main` once 039 merges).

## Global Constraints

- **Zero behavior change** — this is refactor-only. Identical rendered DOM (except where a prop name moves), identical test outcomes, no user-visible diff.
- **Edge-TTS is always primary; Qwen3-TTS is offline fallback only** (client hard rule, spec §6.3) — Phase 0 must not touch engine-selection code.
- **No new design tokens, fonts, palettes, or corner-radius scales** (spec §5.1 hallmark pre-flight: preserve ember palette, glass cards, `rounded-2xl` system).
- Components ≤ 200 lines after extraction (spec §5.1 frontend-ui-engineering red flag).
- Every task ships green: `tsc -b` clean, `npx vitest run <affected>` green, `npm run lint` clean — run via `cmd /c` or a `.bat` file because PowerShell degrades after ~15 commands (repo gotcha).
- Commit with `-s` (DCO) after each task; push to `origin` per repo push-before-you-lose-work policy.
- Do NOT batch-string-edit `.ts/.tsx` via `Set-Content -Encoding UTF8` — it injects BOM (repo gotcha, 37 files affected historically). Use edit tools or `[System.IO.File]::WriteAllText` with `UTF8Encoding($false)`.

## Current-state anchors (verified 2026-08-31 at `d19e5d703`)

| What | Where |
|---|---|
| Landing screen (4,100-line module) | `web/src/shell/NewChatDialog.tsx:1875` `export function NewChatLandingScreen()` |
| Paw-mic voice card (hero, inline) | `NewChatDialog.tsx:3550–3660` (uses `VoiceWaveBand` from `@/components/VoiceWaveBand`) |
| Wake-word chip | `NewChatDialog.tsx:3668–3690` (`wakeWordActive` toggle + `useWakeWordDetector` at `:2161`) |
| `handleCreate()` session create | `NewChatDialog.tsx:3315` |
| Agent/harness picker | `NewChatDialog.tsx:1017` `function AgentHarnessPicker` |
| Project picker | `NewChatDialog.tsx:852` `function LandingProjectPicker` |
| Harness config modal | `NewChatDialog.tsx:1480` `function HarnessConfigModal` |
| In-session composer | `web/src/pages/ChatPage.tsx:4275` `export function Composer({` (props interface at `:3694`) |
| `ComposerMicButton` (dictation, already separate) | `web/src/components/ComposerMicButton.tsx` |
| Read-aloud engine (shared singleton) | `web/src/lib/readAloudAudio.ts` |
| Landing early-return swap | `web/src/pages/ChatPage.tsx:1244` `if (!urlConvId) return <NewChatLandingScreen/>;` |
| `NewChatDialog` importers (must keep compiling) | `ForkSessionDialog.tsx:48`, `ResumeWithDirectoryDialog.tsx:28`, `ChatPage.tsx:205`, `SlashCommandMenu.tsx:13/66/158`, `useDictationInsert.ts:9`, `agentGrouping.ts:4`, `composerMentions.ts:6`, `useHosts.test.tsx:75`, `useAvailableAgents.ts:370` |
| Landing tests to keep green | `NewChatDialog.test.tsx`, `NewChatDialog.flow.test.tsx`, `NewChatDialog.projectPrefill.test.tsx`, `ChatPage.composer.test.tsx`, `useRealtimeVoice.test.ts` |

---

### Task 1: Extract `VoicePawButton` (paw-mic + wake-word, one control)

**Files:**
- Create: `web/src/components/VoicePawButton.tsx`
- Create: `web/src/components/VoicePawButton.test.tsx`
- Modify: `web/src/shell/NewChatDialog.tsx:3550–3690` (render site only)

**Interfaces:**
- Consumes: `useRealtimeVoice()` result type from `@/hooks/useRealtimeVoice`; `VoiceWaveBand` from `@/components/VoiceWaveBand`; `useWakeWordDetector` result shape.
- Produces: `export function VoicePawButton(props: { realtimeVoice: UseRealtimeVoiceResult; wakeWordActive: boolean; onToggleWakeWord: (next: boolean) => void; dictationActive: boolean; onDictationActiveChange: (active: boolean) => void; disabled?: boolean; onTranscriptAppend: (text: string) => void; compact?: boolean })` — Phase 1 will re-point `onTranscriptAppend` at the unified composer; Phase 3 adds long-press/wake merge (spec §6.5).

This task extracts the **existing** two-control hero block (paw card + wake chip render as-is — the visual merge is Phase 2, not Phase 0). The component owns the JSX only; all state stays in `NewChatLandingScreen` and passes down. That keeps the move mechanical.

- [ ] **Step 1.1: Write the failing test** — `VoicePawButton.test.tsx` renders the button with a stubbed `useRealtimeVoice` shape (state `"disconnected"`) and asserts: paw SVG present, `aria-label="Start voice input"`, `aria-pressed={false}`, wake chip renders, no crash without `realtimeVoice.error`.
- [ ] **Step 1.2: Run it** — `cmd /c "npx vitest run web/src/components/VoicePawButton.test.tsx"` → fails (module missing).
- [ ] **Step 1.3: Extract** — Move the JSX from `NewChatDialog.tsx:3550–3690` (the voice card `div` + wave bands + paw `button` + status line + attach row + wake chip) into `VoicePawButton.tsx`. Props per the interface above; **copy class strings verbatim** (no token improvisation, spec §5.1). `NewChatLandingScreen` replaces the inline block with `<VoicePawButton {...}/>`.
- [ ] **Step 1.4: Run the new test** → green.
- [ ] **Step 1.5: Run the landing suites** — `cmd /c "npx vitest run web/src/shell/NewChatDialog.test.tsx web/src/shell/NewChatDialog.flow.test.tsx"` → green (the suites render the landing; selectors like `data-testid="new-chat-landing-wake-word-chip"` must still resolve).
- [ ] **Step 1.6: Type-check + lint** — `cmd /c "npm run type-check"` and `cmd /c "npm run lint"` → clean.
- [ ] **Step 1.7: Commit** — `git add web/src/components/VoicePawButton.tsx web/src/components/VoicePawButton.test.tsx web/src/shell/NewChatDialog.tsx && git commit -s -m "refactor(plan-040): extract VoicePawButton from NewChatDialog hero (no behavior change)"`

### Task 2: Extract `ComposerSpeechChip` (dictation + read-aloud state light)

**Files:**
- Create: `web/src/components/ComposerSpeechChip.tsx`
- Create: `web/src/components/ComposerSpeechChip.test.tsx`
- Modify: `web/src/components/ComposerMicButton.tsx` (thin re-export shim only)

**Interfaces:**
- Consumes: `ComposerMicButtonProps` (existing, `ComposerMicButton.tsx:60`); `subscribeReadAloudState` / `ReadAloudState` from `@/lib/readAloudAudio`; `useReadAloudState` pattern from `ChatPage.tsx:3518`.
- Produces: `export function ComposerSpeechChip(props: ComposerMicButtonProps & { readAloudState?: ReadAloudState; onStopReadAloud?: () => void; onPauseResumeReadAloud?: () => void })`. The chip renders `ComposerMicButton` internally (dictation), and adds the read-aloud glyph state (mic idle → mic animating → speaker animating → speaker paused) per spec §6.5 table.

Phase 0 scope: the chip is created and used by `NewChatLandingScreen` in place of the bare `ComposerMicButton`, with read-aloud props optional (landing has no read-aloud). ChatPage's `Composer` adopts it in Task 4. The per-message read-aloud *start* buttons and the per-message stop are untouched in Phase 0 (their removal is Phase 2, spec §6.5).

- [ ] **Step 2.1: Failing test** — renders chip in default state (mic glyph, `aria-label` from existing dictation labels); with `readAloudState="playing"` shows speaker glyph and click calls `onStopReadAloud`; with `"paused"` click calls `onPauseResumeReadAloud`; disabled state inherits `ComposerMicButton` disabled logic.
- [ ] **Step 2.2: Run → fails (missing module).**
- [ ] **Step 2.3: Implement** — wrapper around `ComposerMicButton` + glyph switch driven by `readAloudState`. Copy existing class strings; add `aria-label`s for the speaker states (i18n keys exist: `chat.readAloud`, `chat.readAloudStop`, `chat.readAloudResume`).
- [ ] **Step 2.4: New test green; landing suites green** (landing still wires dictation the same way — `useDictationInsert` seam untouched, `useDictationInsert.ts:9` comment stays true).
- [ ] **Step 2.5: type-check + lint clean.**
- [ ] **Step 2.6: Commit** — `git commit -s -m "refactor(plan-040): extract ComposerSpeechChip (dictation + read-aloud state light)"`

### Task 3: Extract `SessionConfigSheet` (agent/host/sandbox/worktree pickers)

**Files:**
- Create: `web/src/shell/SessionConfigSheet.tsx`
- Create: `web/src/shell/SessionConfigSheet.test.tsx`
- Modify: `web/src/shell/NewChatDialog.tsx` (render sites: `AgentHarnessPicker` `:1017`, `LandingProjectPicker` `:852`, `HarnessConfigModal` `:1480`, `ConfigRow` `:1373`, `DescribedSelect` `:1410` move into the new file; `NewChatDialog.tsx` re-imports them)
- Verify: `ForkSessionDialog.tsx:48`, `ResumeWithDirectoryDialog.tsx:28` still compile (they import `HostOption`, `ConnectHostInstructions`, `sanitizeInitialPrompt`, etc. — those exports stay in `NewChatDialog.tsx` OR move and are re-exported; choose move-and-re-export via `export { … } from "./SessionConfigSheet"` to keep both import paths stable)

**Interfaces:**
- Produces: `export function AgentHarnessPicker(...)`, `export function LandingProjectPicker(...)`, `export function HarnessConfigModal(...)`, `export function ConfigRow(...)`, `export function DescribedSelect(...)` — same prop signatures as today (copy the existing interfaces verbatim).
- Consumes: `useAvailableAgents`, `useHosts`, `useDirectorySessions`, `useRecentWorkspaces`, `useBrainHarnessLabels`, `useServerInfo` — all existing hooks, imported not re-wired.

This is the largest move (~1,100 lines). Keep it mechanical: cut-paste the five functions + their module-local constants (`SINGLE_USER_PRIMARY_AGENT_NAME`, `NEW_SESSION_HIDDEN_AGENTS`, `AGENT_PICKER_DESCRIPTIONS`, `SKILL_PILL_AGENTS`, the Claude/Codex/Cursor mode tables `:187–:355`), then re-export from `NewChatDialog.tsx` so `ForkSessionDialog` / `ResumeWithDirectoryDialog` / the three landing test files keep their imports unchanged.

- [ ] **Step 3.1: Failing test** — `SessionConfigSheet.test.tsx` renders `AgentHarnessPicker` with a stub agent list and asserts the harness/agent split sections appear (port 2 assertions from `NewChatDialog.test.tsx`'s picker block — do not delete the originals; the original suite must stay green).
- [ ] **Step 3.2: Run → fails.**
- [ ] **Step 3.3: Move** the five components + constants into `SessionConfigSheet.tsx`; add `export { AgentHarnessPicker, LandingProjectPicker, HarnessConfigModal, ConfigRow, DescribedSelect } from "./SessionConfigSheet"` in `NewChatDialog.tsx`. Target: `NewChatDialog.tsx` drops from ~4,100 to ~2,900 lines.
- [ ] **Step 3.4: Full landing suite + Fork/Resume suites green** — `cmd /c "npx vitest run web/src/shell/"` (whole shell dir; catches every import break).
- [ ] **Step 3.5: type-check + lint clean** (this is the task most likely to break `tsc` — run the full check, not just affected files).
- [ ] **Step 3.6: Commit** — `git commit -s -m "refactor(plan-040): extract SessionConfigSheet (agent/host/sandbox pickers) from NewChatDialog, re-export stable paths"`

### Task 4: Extract in-session `Composer` from ChatPage

**Files:**
- Create: `web/src/shell/SessionComposer.tsx`
- Create: `web/src/shell/SessionComposer.test.tsx`
- Modify: `web/src/pages/ChatPage.tsx:4275` (`export function Composer({...})` moves out; ChatPage imports it; `composerHarnessLabel` at `:4051` moves with it or stays exported from ChatPage — move it too, re-export from ChatPage for its existing importers)

**Interfaces:**
- Produces: `export function SessionComposer(props: ComposerProps)` — `ComposerProps` (`ChatPage.tsx:3694`) moves into `SessionComposer.tsx` and is re-exported. All existing prop names preserved verbatim (Phase 1 changes the prop set, not Phase 0).
- Consumes: `useRealtimeVoice`, `useDictationInsert`, `useReadAloudState` pattern, `useMentionBrowser`, `SlashCommandMenu`, `FileMentionMenu`, `ComposerSpeechChip` (from Task 2 — swap `ComposerMicButton` → `ComposerSpeechChip` here, the single deliberate behavior-adjacent change in Phase 0, but the chip defaults to identical mic behavior when read-aloud props are absent).

- [ ] **Step 4.1: Failing test** — `SessionComposer.test.tsx` mounts the composer with a minimal `ComposerProps` stub and asserts the textarea, attach button, and speech chip render; type-send via Enter with an `onSend` spy fires once. (Port the mount harness from `ChatPage.composer.test.tsx` — that suite keeps running against `ChatPage`, which now renders `SessionComposer`.)
- [ ] **Step 4.2: Run → fails.**
- [ ] **Step 4.3: Move** `Composer` + `ComposerProps` + `composerHarnessLabel` into `SessionComposer.tsx`; ChatPage imports and re-exports. Inside the moved component, replace the bare `ComposerMicButton` usage with `ComposerSpeechChip` (default behavior identical). Target: ChatPage drops from ~5,900 to ~4,400 lines.
- [ ] **Step 4.4: ChatPage suites green** — `cmd /c "npx vitest run web/src/pages/ChatPage.composer.test.tsx web/src/pages/ChatPage.test.ts"` (plus indicators/historyLoad suites).
- [ ] **Step 4.5: type-check + lint clean.**
- [ ] **Step 4.6: Commit** — `git commit -s -m "refactor(plan-040): extract SessionComposer from ChatPage; adopt ComposerSpeechChip in-session"`

### Task 5: Landing-hero assembly extraction (`WorkspaceHero` shell)

**Files:**
- Create: `web/src/shell/WorkspaceHero.tsx`
- Create: `web/src/shell/WorkspaceHero.test.tsx`
- Modify: `web/src/shell/NewChatDialog.tsx` (`NewChatLandingScreen` becomes a thin composition: hero shell + VoicePawButton + SessionConfigSheet + landing composer card)

**Interfaces:**
- Produces: `export function WorkspaceHero(props: { children: ReactNode })` — the hero *frame* only: greeting row (`MeowCatMascot` + `t("newChat.title")`), `FirstBootChecklist`, and the max-width/centering container. Capability bricks and SkillPills slot in as `children` (Phase 2 adds the real bricks; Phase 0 keeps the current children — the greeting + checklist).
- Consumes: `MeowCatMascot` (`@/components/icons/MeowCatMascot`), `FirstBootChecklist` (`@/components/FirstBootChecklist`).

- [ ] **Step 5.1: Failing test** — renders with children text, asserts mascot `img`/svg role, heading text via i18n stub, checklist present.
- [ ] **Step 5.2: Run → fails.**
- [ ] **Step 5.3: Extract** the greeting + checklist JSX from `NewChatLandingScreen` (`:3536–:3549`) into `WorkspaceHero`; landing composes it. Class strings verbatim.
- [ ] **Step 5.4: Landing suites green; type-check + lint clean.**
- [ ] **Step 5.5: Commit** — `git commit -s -m "refactor(plan-040): extract WorkspaceHero frame from landing screen"`

### Task 6: Phase-0 gate — full verification + SPA build

**Files:** none created (verification only)

- [ ] **Step 6.1: Full frontend unit run** — `cmd /c "npx vitest run"` → zero failures (the repo's green baseline; any pre-existing failure must be shown to pre-date Phase 0 by stashing the branch first, per the label-key split-brain lesson — do not "fix" unrelated failures in this PR).
- [ ] **Step 6.2: `cmd /c "npm run type-check"` + `cmd /c "npm run lint"`** → clean.
- [ ] **Step 6.3: SPA build via .bat** (PowerShell degradation workaround) — reuse the `build-039.bat` pattern pointed at `web/`; build succeeds.
- [ ] **Step 6.4: Manual smoke on the built SPA** — start server, open `http://127.0.0.1:6767/`: landing renders identically (greeting, voice card, composer, advanced tray); start a session; in-session composer + mic + read-aloud work; sidebar still navigates. Capture screenshots for the PR Demo section (required for UI-adjacent PRs even when "no visual change" — attach them as evidence of parity).
- [ ] **Step 6.5: Push all commits** — `git push origin feat/040-unified-workspace`.
- [ ] **Step 6.6: Open PR** (or stage for one combined 040 PR per the client's preference) with the repo template: Summary (extraction table: file → lines moved → new home), Test Plan (Task 6 evidence), Demo (screenshots), Type of change = refactor (no behavior change), Test coverage = existing suites + 5 new colocated test files.

## Post-Phase-0 state (handoff to the Phase 1 plan)

- `NewChatDialog.tsx` ≈ 2,600 lines (landing composition + create-flow logic + re-export shim)
- `ChatPage.tsx` ≈ 4,400 lines (stream, bubbles, session wiring)
- New seam components ready for Phase 1: `VoicePawButton`, `ComposerSpeechChip`, `SessionConfigSheet`, `SessionComposer`, `WorkspaceHero`
- Phase 1 (the unification itself — hero collapse, always-mounted composer, queue-then-flush session create, G2 voice fix) gets its own plan: `PLAN_040_PHASE_1.md`, drafted from spec §3.1 + §4 Phase 1.