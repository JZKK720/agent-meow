# Plan 040 Phase 0 — agent handoff (2026-08-31, before PC log-off)

## State to transfer

Branch **`feat/040-unified-workspace`** contains 3 commits beyond
`origin/feat/039-file-index-phase0` (base `1b17aa094`):

```
d54b6e303 wip(clip): image embedding pipeline skeleton (plan 039 phase 2)
b7538ec28 feat(voice): gate every voice turn behind the wake word after connect
daf53f239 refactor(plan-040): extract VoicePawButton from NewChatDialog hero (no behavior change)
1b17aa094 (origin/feat/039-file-index-phase0) docs(plan-040): phase-0 ...
```

Pull with: `git fetch origin feat/040-unified-workspace && git checkout feat/040-unified-workspace && git pull origin feat/040-unified-workspace`
(may need `-b` if it doesn't exist yet on the other PC).

## Task 1 status (the only Phase 0 task attempted)

**Code shipped, verification NOT complete — do not mark Task 1 complete.**

- `web/src/components/VoicePawButton.tsx` + `.test.tsx` exist and are wired into
  `NewChatLandingScreen` (commit `daf53f239`).
- **Known defect:** `NewChatDialog.tsx` has 2 unused imports left behind
  (`MicIcon` line 28, `VoiceWaveBand` line 170) → `tsc -b` and `npm run lint`
  FAIL with TS6133. First fix on the other PC.
- The landing hero block now renders `<VoicePawButton .../>` at ~:3558. The
  parent still owns all state; the component consumes
  `{realtimeVoice, voiceListening, creating, dictationActive, wakeWordActive,
  wakeWordEnabled, onVoiceStart, onTranscriptAppend, onAttachClick,
  onToggleWakeWord}` (deliberate deviation from plan's speculative
  props — `onDictationActiveChange` belongs to the chip block at :3968, not the
  hero; ruled in `.superpowers/sdd/PLAN_040_PHASE_0.md/progress.md`).
- New tests exist (`VoicePawButton.test.tsx`, 11 cases) but **zero test suite
  ran in the last gate** — vitest failed to load ALL suites with
  "Cannot read properties of undefined (reading 'config')" /
  "Vitest failed to find the runner". This is an environment/harness error,
  NOT proof the tests fail: an earlier run of the same commands worked from
  `web/` (baseline: 329 tests, 98 pre-existing failures documented below).
  Suspect: concurrent vitest processes corrupt shared caches (a stray
  `web/src/__smoke__.test.ts` was created during the incident and deleted).
  On the other PC, re-run the 5 suites fresh and compare against baseline.

## Test baselines (pristine HEAD 1b17aa094, from vitest-baseline-plan040.txt)

| Suite | pass/fail | Meaning |
|---|---|---|
| ChatPage.composer.test.tsx | 22 / 55 | pre-existing, root-caused: Composer → useRealtimeVoice → useQueryClient() throws (no QueryClient in test harness). Fix is NOT in Phase 0 scope. |
| NewChatDialog.flow.test.tsx | 17 / 34 | pre-existing: authenticatedFetch call-count theft (2 calls at submit where 1 expected). Out of scope. |
| NewChatDialog.projectPrefill.test.tsx | 0 / 9 | same call-count theft family |
| NewChatDialog.test.tsx | all pass | must stay green |
| useRealtimeVoice.test.ts | all pass | must stay green |

**Phase 0 gate rule:** non-regression against these numbers; do not fix the
98 baseline failures in this branch (they pre-date Phase 0).

## Remaining Phase 0 tasks (none started)

Task 2 ComposerSpeechChip → Task 3 SessionConfigSheet (largest, ~1,100 lines
moved with re-exports) → Task 4 SessionComposer → Task 5 WorkspaceHero →
Task 6 full gate + SPA build + push + PR. Full text: `PLAN_040_PHASE_0.md`.

Task briefs / reports / verdicts live in
`.superpowers/sdd/PLAN_040_PHASE_0.md/` (ledger: `progress.md`).

## Pre-existing vitest-load-error triage hint

If suites again fail with "Cannot read properties of undefined (reading
'config')": it appeared while MULTIPLE vitest invocations raced. Try:
1. single suite at a time; 2. delete `web/node_modules/.vite`; 3. delete
`web/src/__smoke__.test.ts` (stray, not part of any suite — safe to remove);
4. run `npx vitest run --pool=forks --poolOptions.forks.singleFork`.

## Environment notes for the next PC

- Windows; run vitest/tsc/lint **from `web/`** (repo gotcha: `@/` aliases).
- PowerShell degrades after ~15 commands → use `cmd /c "..."` or .bat files.
- `Set-Content -Encoding UTF8` injects BOM — use edit tools or
  `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))`.
- NEVER `git add -A`: worktree has scratch noise (t1-*.txt, diag-*.txt,
  .bat helpers, `whisper-vulkan-err.log` locked by a running daemon —
  leave it modified/ignored).
- DCO: commit with `-s`.
- Repo rule: UI PRs need a Demo section (screenshots) — Task 6 captures them.

## Wake-word commit (b7538ec28) — verification owed

`startWakeWordMode()` now gates every voice turn behind the wake word on 4
call sites. NOT yet verified: browser E2E (say wake word → turn runs; noise →
no turn), `useRealtimeVoice.test.ts` staying green, and whether
`hermesVoice.startWakeWordMode` exists with that exact name (grep before
trusting the call sites compile).