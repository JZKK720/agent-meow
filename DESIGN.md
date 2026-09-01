# agent-meow Design System

> Source of truth for the web SPA's visual language. Every claim here is
> extracted from the shipped implementation (`web/src/index.css`, shell
> components) and the brand assets — not aspiration. Coding agents: treat
> this file as binding when touching UI chrome. When this file and a
> component comment disagree, the component comment (more specific) wins.

## Brand identity

- **Mascot**: 橘宝疾风 ("Orange Treasure Storm") — a specific orange tabby
  cat with a pink goggle strap + light-blue goggle lenses (`#c8f8f8`).
  Head-only portrait is canonical for chrome; full-body variants exist in
  `docs/assets/branding/original/exports/`. Never substitute a generic cat.
- **Assets** (shipped): `mascot-static.png`, `mascot-hero.png`,
  `mascot-animated.gif`, `favicon-brand.png` under
  `agent_meow/server/static/web-ui/`; pattern tiles under
  `web/public/patterns/` (`cat-element-tile-{light,dark}.png`, 480×480
  seamless).
- **Brand pattern**: two-color cream `#f8e0b6` + orange `#f4c68a` cat-element
  tile. Monochromatic — no rose, no purple accents in the pattern itself.

## Color tokens (governed)

All defined in `web/src/index.css`. JSX uses the Tailwind aliases
(`bg-brand-primary`, `text-brand-accent`, …).

| Token | Value | Role |
|---|---|---|
| `--brand-primary` | `#e8651a` (ember) | **Main action accent** — buttons, active states, landing surface |
| `--brand-primary-hover` | `#d4571a` | Hover for the above |
| `--brand-accent` | `#ffb347` (warm amber) | **Brand moments only, never status** |
| `--brand-bg-light` / `--brand-bg-dark` | `#fffbf5` / `#1a1410` | Brand canvas extremes |
| `--brand-border` | `rgba(232,101,26,0.15)` | Ember-tinted borders |
| `--surface-images` | `#c965f1` (+wash `#f1e3f9`) | Images surface card (icon chip + gradient wash) |
| `--surface-videos` | `#8199fa` (+wash `#e0e8ff`) | Videos surface card |
| `--surface-docs` | `#faa575` (+wash `#f8e0d8`) | Docs surface card |
| `--status-{blue,green,yellow,red,gray}` | see `index.css` | Status hues only |

Rules:

1. Ember = action; amber = brand moment; the two are never interchangeable.
2. Status never borrows brand hues — status uses the `--status-*` family.
3. Each surface card owns exactly one hue + its light wash (gradient
   background from the Figma frames); accents drive the icon chip only.
4. Ember glows (`rgba(232,101,26,…)` shadows) are a family — keep them
   consistent across paws/cards; change them together (see audit
   `design-plans/unified-surface-audit.md`, finding 2).

## Canvas & layering

- The app canvas is a **warm-white `.app-shell` gradient** (light) — cards
  float on it. `--card` stays white; `--sidebar` matches the gradient's
  lightest tone so translucent chrome blends instead of banding.
- Dark mode: `dark:bg-card-solid` (`--card-solid`) is the opaque card fill
  used wherever translucent glass would ghost an underlying tray
  (`bg-card` is 60% alpha in dark; `card-solid` prevents the tucked tray
  from bleeding through the composer card).

## Shape

- **`rounded-2xl`** is the card family: composer card, hero checklist,
  surface cards, wave-band card. Consistent across landing and session.
- `--radius: 0.5rem` is the base radius for small controls.
- Circular controls (`rounded-full`): paw buttons, icon buttons, chips.

## Typography

- UI font: **native system stack** (`ui-sans-serif, system-ui, …`) — the app
  reads as native chrome per-OS. Heading = same stack (no display face).
- Mono: `"Geist Mono Variable", "JetBrains Mono", ui-monospace` — code
  surfaces are immune to the user's UI font-family override.
- Extra step: `text-13` (13px/20px) between `text-xs` and `text-sm` for
  compact chrome (composer footer selectors, slash-menu rows).
- Landing greeting: `text-3xl font-medium tracking-[-0.03em]`.

## Layout

- Chat column width: `CHAT_COLUMN_WIDTH` = `max-w-3xl` (<1921px),
  `max-w-4xl` (<2561px), `max-w-5xl` above — with `mx-auto w-full px-6`.
  Exported from `SessionComposer.tsx`; the transcript, status line, and
  composer all consume it so edges align.
- Landing hero cap: `max-w-[840px]` with `px-4` (mobile) / `md:px-10`
  gutters (documented as 840 − 80 = 760px desktop composer). **Note**:
  the width-delta between this and `CHAT_COLUMN_WIDTH` at the hero→session
  transition is a known finding (`design-plans/unified-surface-audit.md`).
- Footer trays tuck under the composer card: landing tray `-mt-9/pt-8`
  (24px tuck under the card's z-10 edge); session tray `-mt-4/pt-5.5`
  (16px overlap exceeds the ~14px corner radius). Both are deliberate —
  don't "harmonize" them without re-deriving the corner math.

## Voice / mascot controls

- Paw button states: disconnected = `bg-brand-primary/90`; listening =
  ember→amber gradient (`from-brand-primary via-brand-accent`) + glow +
  `animate-pulse` paw + halo blur ring.
- Wake word ("橘宝") gating is **functional** — its ZH strings live in
  voice-pipeline code and must not be "translated away".

## i18n rules for UI chrome

- All user-visible chrome copy goes through `t("newChat.*")` etc.;
  locales: `web/src/lib/locales/{en,zh-CN}.json` (fallback `en`).
- ZH appearing in code is allowed **only** for: wake-word matching data,
  intent parsing, TTS splitting rules, brand names (万相), and the
  design-review page (`DesignHome.tsx`).

## Verification

- Playwright visual baselines: `tests/e2e_ui/visual/` (landing, chat,
  sidebar, settings, inbox, right-rail, workspace).
- CUJ e2e: `tests/e2e_ui/start_session/test_unified_workspace.py` asserts
  the hero→stream swap with zero page reloads.
- Component tests colocate (`*.test.tsx` next to sources; `--pool=vmThreads`).