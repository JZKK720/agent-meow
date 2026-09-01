# Accessibility & performance audit — landing surface (plan 040 P1)

> Companion to `unified-surface-audit.md` (visual). Method: live render on a
> fresh-DB server (chromium, this session's browser tools) + static scans of
> `web/src`. Read-only; findings below are conclusions, not fixes.

## Accessibility — PASS with one minor

| Check | Result | Evidence |
|---|---|---|
| Landmark structure | ✅ Complete | Live a11y snapshot: `aside[Conversations]` + `banner` + `main` + `nav` — no orphan content |
| Icon-only buttons with accessible names | ✅ 0 violations | Static scan of all non-test `.tsx` (`size="icon"` buttons without `aria-label`/`sr-only` sibling) |
| Images without alt | ✅ 0 violations | Multiline-safe scan found 3 candidates; all were comment references or pass-through renderers (`FileProducedCard` has `alt={file.path}` at :82, `CodeViewer` passes markdown-sourced props through) |
| Reduced motion | ✅ Respected | `prefers-reduced-motion` blocks at `index.css:783, 1006, 1215` |
| Text size floor | ✅ Deliberate | The one sub-12px usage is the paw button's 10px phase label (inside a 32-44px control); the 13px `text-13` step is a documented type token |
| Live console | ⚠️ Minor | `[wake-word] SpeechRecognition error: not-allowed` logs on every landing load without mic permission — harmless but noisy; could be gated behind the first voice gesture |

## Performance — PASS (no quick wins needed)

| Check | Result |
|---|---|
| Bundle-splitting | ✅ Per-route lazy chunks already (`lazy(() => import(...))` in `App.tsx` for settings/inbox/members/policies/accounts) |
| Heavy imports | ✅ No whole-`lodash` or `moment` imports anywhere in `web/src` |
| Render discipline | ✅ `BubbleView` memoized (`bubblesEqual`), trailing invalidation throttled, background flush cooldowns in place |

## Follow-ups (optional, not blockers)

1. Gate the wake-word SpeechRecognition bootstrap behind a user gesture to
   silence the `not-allowed` console warning on first load.
2. Right-rail snapshot stubs for `files/subagents/terminals/todos` tabs —
   the tabs are conditional on data the current stubs don't fully satisfy
   (tracked in the ui-snapshot commit `93bfdf836`); needs a follow-up stub
   pass to raise baseline coverage from 15 to the full ~21.