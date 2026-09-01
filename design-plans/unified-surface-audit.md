# UI audit — unified landing/session surface (plan 040 P1)

> Produced by the improve-ui methodology: read-only on product source. One
> coherent surface family audited: the always-mounted workspace page
> (`UnifiedWorkPage` → `WorkspaceHero` + landing composer + `SessionComposer`).
> Findings below survived the three-proof gate (contract, runtime,
> correction). Accessibility/behavioral findings are excluded per scope.

## Design language

- Audited surface: `/` and `/c/:id` (both render `ChatPage` → `UnifiedWorkPage`); landing composer (`NewChatLandingScreen`), hero (`WorkspaceHero`), in-session composer (`SessionComposer`), voice paw (`VoicePawButton`).
- Design sources:
  - `web/src/index.css` — brand token block (`--brand-primary: #e8651a` ember, `--brand-accent: #ffb347` amber, `--surface-*` multi-hue card washes, `--radius: 0.5rem`) with an explicit governance comment ("--brand-accent is reserved for brand moments, not status").
  - `PLAN_040_PHASE_1.md` — Global Constraints: "Zero visual change to the composer's rendered DOM… preserve the design system, change the structure."
  - Inline geometry contracts in `NewChatDialog.tsx` (landing tray: `-mt-9` tuck, `pt-8` re-reserve) and `SessionComposer.tsx` (`-mt-4` overlap "exceeds the card's ~14px corner radius").
  - Design references: `docs/assets/branding/workspace-design-01.png` (landing), `.hallmark/figma-main-frame.png` (surface-card hues).
- Documented decisions: ember = action color; amber = brand-moment accent only; surface cards own one hue + wash each; composer card = `rounded-2xl border border-border bg-card dark:bg-card-solid`; width caps: hero 840px (`max-w-[840px]`), chat column `CHAT_COLUMN_WIDTH` (`max-w-3xl` @ <1921px).
- Governing owners and consumers: `UnifiedWorkPage` (region shell) ← `ChatPage`; `WorkspaceHero` ← `NewChatDialog`; `VoicePawButton` (dock) ← `SessionComposer` footer; `CHAT_COLUMN_WIDTH` ← composer + status line + transcript wrappers.
- Explicit exceptions: None documented.

## Findings

| # | Problem | Evidence | Proposed change | Scope | Confidence |
|---|---|---|---|---|---|
| 1 | **Composer column width jumps at the hero→session transition.** The landing renders inside `WorkspaceHero`'s `max-w-[840px]` cap (840 − 80px gutters = 760px composer), while the in-session composer uses `CHAT_COLUMN_WIDTH` = `max-w-3xl` (768px) at <1921px. Both sit in the same visual slot of `UnifiedWorkPage`, so at 769–760px-of-content widths the composer visibly changes width the moment the hero collapses — a layout jump on the exact transition the unified page was built to make seamless. | Contract: `PLAN_040_PHASE_1.md` "Zero visual change to the composer's rendered DOM… change the structure" + plan goal "composer never unmounts… the seam Task 3 uses to unify." Runtime: `WorkspaceHero.tsx:35` `max-w-[840px]` renders `NewChatLandingScreen`'s composer at 760px; `SessionComposer.tsx:1956-1957` applies `CHAT_COLUMN_WIDTH` (768px cap) — both verified mounted in the same `UnifiedWorkPage` slot via `ChatPage.tsx:1076` (landing) and `ChatPage.tsx:1769`/`MainAgentSurface` (session). Correction: give the landing composer the same responsive column so both states resolve to the same content width — either set `WorkspaceHero`'s cap to `CHAT_COLUMN_WIDTH` + `px-6` gutters (matching the session column's `mx-auto w-full px-6`), or pass `CHAT_COLUMN_WIDTH` through to the landing form so 760px becomes 768px in both states. | `web/src/shell/WorkspaceHero.tsx` (width cap) or `web/src/shell/NewChatDialog.tsx` (form wrapper) | High |
| 2 | **Dock paw glow uses a raw ember rgba instead of the governed token pair.** `DockPawCore`'s listening state paints `shadow-[0_0_16px_rgba(232,101,26,0.45)]`; every other ember glow on this surface (hero paw, hero card) is documented to derive from `--brand-primary`/`--brand-accent`, and the `index.css` comment establishes token governance for the ember family. This is the only `rgba(232,101,26,…)` literal (4 occurrences in this file) not paired with a token. | Contract: `index.css:241-243` comment governing ember usage; hero paw's glow is the same visual idea expressed as `shadow-[0_0_24px_rgba(232,101,26,0.55)]` (also raw). Runtime: `VoicePawButton.tsx:311-312` renders in the `SessionComposer` footer, adjacent to `ComposerSpeechChip`/`AgentPicker` whose states use semantic tokens (`bg-card`, `border-ring/30`). Correction: extract the dock glow to the shared ember-glow definition used by the hero paw (single constant, e.g. `shadow-[0_0_16px_rgba(var(--brand-primary-rgb),0.45)]` or a shared `emberGlow` utility) so a future brand tweak updates both paws together. | `web/src/components/VoicePawButton.tsx` (DockPawCore + hero button glow) | Medium |

## Improve first

**Finding 1 (composer width continuity).** The unified page's whole purpose is a seamless hero→session transition; the width cap difference (840px hero vs 768px column) is the one place where the transition still visibly shifts layout. It is a one-token change in `WorkspaceHero` (or the landing form wrapper), is fully covered by the existing e2e (`unified-work-page` stays visible) and snapshot baselines, and directly serves the plan's "preserve the design system, change the structure" constraint.

---

*Not findings (vetted and discarded):* the two footer trays' different geometries (landing `-mt-9/pt-8` vs session `-mt-4/pt-5.5`) — both carry explicit, different, correct geometry contracts in their comments (different corner-radius overlaps for different card shapes); `万相` in `MediaSection.tsx` — product name, not UI language; hardcoded ZH in `VoicePawButton` — already fixed at `25b4e59f2` in this session.