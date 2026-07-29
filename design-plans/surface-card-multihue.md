# Restore the multi-hue surface-card treatment and make the MeowCat IP pattern visible on the new-chat landing

Written against: 6a06f8b1

## Companion work: surface the MeowCat IP pattern

The cat/circle/paw/X motif is the official MeowCat IP pattern (proven by
`web/public/patterns/cat-wallpaper-source-thumb.png`, the MeowCat brand sheet
with Pantone 1365C `#FCB44C` / 148C `#FCC88B` / 2001C / 715C `#D98E2A`, mascot,
and logo lockups). It is brand identity, not decoration, so it should read on
the dashboard canvas. The correct pair of assets already exists and is already
wired — it is just rendered at near-invisible opacity.

### Pattern asset analysis (measured, not guessed)

| Asset | Size | Alpha | Background | Glyphs | Status |
|---|---|---|---|---|---|
| `cat-element-pattern-light.png` | 1000×1666 | opaque | cream `#F8E0B6` | ✅ ember `#F4C68A` cat/circle/paw/X | **correct light pattern — wired** (`.app-shell::before`, opacity .08) |
| `cat-element-pattern-dark.png` | 2457×4096 | 92% transparent | transparent | ✅ ember glyphs float | **correct dark pattern — wired** (`.dark .app-shell::before`, opacity .06) |
| `cat-element-tile-light.png` | 480×480 | opaque | cream `#F8E0B6` | ✅ same glyphs | small tile crop of the light pattern — unused |
| `cat-element-tile-dark.png` | 480×480 | opaque | **olive `#7C705B`** | ✅ glyphs | ❌ off-brand bg (not `#1A1410`) — unused |
| `cat-wallpaper-tile-light.png` | 480×480 | — | pure `#FFFFFF` | ❌ 1 color, blank | ❌ empty swatch — not a pattern source |
| `cat-wallpaper-tile-dark.png` | 480×480 | — | solid `#181614` | ❌ 1 color, blank | ❌ empty swatch — not a pattern source |
| `cat-element-source.png` | 8504×14174 | opaque | cream `#F8E0B6` | ✅ | master pattern file |
| `cat-wallpaper-source-thumb.png` | 1600×770 | — | — | — | MeowCat IP brand sheet (reference only) |

**Conclusion.** "Wallpaper should match the element pattern" is correct as
intent, but the `cat-wallpaper-tile-*` files cannot supply it — both are blank
single-color swatches with zero glyphs (verified by histogram: 1 distinct color
each). The matched light/dark pair the brand calls for is the already-wired
`cat-element-pattern-light.png` (cream + glyphs) and
`cat-element-pattern-dark.png` (transparent + floating ember glyphs). The real
gap is that this IP is rendered at `.08` / `.06` opacity and is effectively
invisible. `cat-element-tile-dark.png` is not a substitute — its background is
off-brand olive `#7C705B`, not `#1A1410`.

## Evidence chain

- Surface: new-chat landing, `data-testid="new-chat-landing"` — rendered by
  `NewChatLandingScreen` in `web/src/shell/NewChatDialog.tsx` (surface cards at
  lines 4326-4369), routed inside `.app-shell` (`web/src/shell/AppShell.tsx:1281`
  → `web/src/pages/ChatPage.tsx:169`).
- Problem: the three workspace surface cards (图片 / 视频 / 文档生成) render as
  white `bg-card` buttons with a single all-ember icon chip
  (`bg-brand-primary/15` + `text-brand-primary`). The Figma source shows each
  card with its own accent hue and a tinted gradient wash across the whole
  card — 图片 = purple, 视频 = blue, 文档 = orange/ember.
- Design evidence: `.hallmark/figma-main-frame.png` and
  `.hallmark/figma-page2-frame.png` (both full-res frames show the multi-hue,
  gradient-washed cards). Note: `figma-full.json` carries no styles — both
  frames are empty shells — so the PNGs are the only evidence.
- Owner: `web/src/shell/NewChatDialog.tsx` (card markup) + `web/src/index.css`
  (tokens).
- Scope and affected surfaces: the landing surface only. The cards deep-link to
  the right-rail Docs/Images/Videos panels but those panels are unaffected.
- Uncertainty: the exact hue values are not recoverable from the style-less
  JSON; they must be sampled from the PNGs or chosen to match. Executor should
  sample the frames rather than invent new hex values.

## Design decision

Give each of the three surface cards its own accent hue and a tinted gradient
card background matching the Figma, driven by three new named tokens. This
resolves the root problem (the landing lost its primary color moment and the
cards are visually indistinct) without touching any functional surface — the
cards' `onClick`, `createSessionForSurface`, disabled gating, and deep-link
behavior are unchanged.

This also **reverses the stale recommendation in `.hallmark/audit.md` item #3**
("unify surface-card accent to ember"), which was written against the low-res
thumbnail before the full-res frames existed. Do not unify to ember.

## Reuse

- Token pattern: the existing brand tokens in `web/src/index.css` `:root`
  (`--brand-primary`, `--brand-bg-light`, lines 245-247 light / 326-328 dark).
  New tokens must follow the same light/dark paired pattern and be referenced
  by name in the component (no inline hex), per the locked-token rule.
- Exemplar: the ember icon-chip treatment already on the cards
  (`NewChatDialog.tsx:4360` `bg-brand-primary/15`) — the per-card accent chip
  mirrors this shape with a per-card token instead of the shared ember token.

No new primitive is required; three tokens plus a per-card class/token
reference in the existing `.map()` is sufficient. Do not introduce a shared
`SurfaceCard` component — the card is single-use.

## Changes

1. `web/src/index.css`
   - Change: add three accent tokens in both the light `:root` block (near
     line 245) and the dark block (near line 326): `--surface-images`,
     `--surface-videos`, `--surface-docs`, plus a matching `*-wash` (card
     background tint) per surface if the gradient wash needs a separate value.
     Sample hues from the Figma frames (purple / blue / orange); dark variants
     lighten for contrast exactly as `--brand-primary` does (L326).
   - Preserve: existing brand tokens and the `.app-shell` canvas.
   - Verify: tokens resolve in both modes; no inline hex in the component.

2. `web/src/shell/NewChatDialog.tsx` (surface-card `.map()`, lines 4326-4369)
   - Change: extend each entry in the card array with its accent token
     reference; apply the per-card accent to the icon chip and the tinted
     gradient wash to the card background. Keep the existing `ImageIcon` /
     `FilmIcon` / `FileTextIcon` Lucide icons (the filled-icon decision is a
     separate, deferred finding — do not change icons here).
   - Preserve: `data-testid="new-chat-landing-surface-card-{id}"`,
     `disabled={!canCreateSurfaceSession || creating}`,
     `onClick={() => void createSessionForSurface(tool.id)}`, the hover /
     disabled classes, and all i18n keys.
   - Verify: each card shows its own hue; hover / disabled states still read.

3. MeowCat IP pattern visibility — `web/src/index.css:395-410` (`.app-shell::before`)
   - Change: make the already-wired, on-brand pattern actually read. The motif
     (cat heads / circles / paw prints / X marks) is already present in both
     wired assets — this change does **not** add or alter glyphs, it raises
     visibility. Confirmed decisions:
     - **Dark-mode treatment (decided):** the motif renders as ember outlines
       floating transparently over the dark `#1A1410` gradient — **no cream /
       solid tile**. This is the existing `cat-element-pattern-dark.png` (92%
       transparent) behavior and is the intended on-brand look. Keep it.
     - (a) **Opacity (still to pick):** raise from `.08` (light) / `.06` (dark)
       to a picked value. The pattern is the MeowCat IP and should be
       perceptible, but must not fight foreground content. Candidate range
       `.12`–`.18` (light) / `.10`–`.15` (dark); confirm against the Figma
       frame's subtlety.
     - (b) **Tile vs full-page (still to pick):** the wired assets are the
       large full-page patterns (1000×1666 light, 2457×4096 dark) at
       `background-size: 512px`. If a smaller seamless tile is preferred,
       generate on-brand light/dark tiles from the master
       `cat-element-source.png` (8504×14174). Do **not** reuse
       `cat-element-tile-dark.png` (off-brand olive `#7C705B` bg) or the blank
       `cat-wallpaper-tile-*` swatches.
   - Preserve: `position: fixed; pointer-events: none; z-index: 0` overlay
     behavior and the light/dark asset swap; the `.app-shell` gradient beneath;
     the dark floating-ember treatment (no solid tile).
   - Verify: pattern is perceptible in both modes at 375/414/768/1440px without
     reducing foreground legibility (spot-check text-over-pattern contrast).

## Scope

- Inherit: the new-chat landing surface; the pattern change is on `.app-shell`
  so it reaches every surface inside the shell (sidebar, chat, right-rail) —
  that is intended, since the IP belongs product-wide.
- Verify: no other consumer of `bg-brand-primary/15` icon chips is affected
  (the card change is scoped to the landing card map, not the shared class).
- Exclude: right-rail Docs/Images/Videos panels; filled-icon replacement;
  headline copy (separate finding); backend. Do not delete the unused
  `cat-element-tile-*.png` / `cat-wallpaper-*` assets in this plan — but do not
  wire them either (wallpaper tiles are blank; dark element tile is off-brand).

## Validation

- Product: open the new-chat landing; the three cards read as purple / blue /
  orange with a tinted wash, matching `.hallmark/figma-main-frame.png`.
- Interface: light + dark mode; 375 / 414 / 768 / 1440 px; hover and disabled
  (`!canCreateSurfaceSession`) states; existing tests
  `new-chat-landing-surface-card-{docs,images,videos}` still pass.
- System: tokens referenced by name only; no new parallel card pattern.
- Repository: `cd web && npm test -- NewChatDialog` → pass;
  `cd web && npm run lint` → clean.

## Stop conditions

- Stop if the sampled hues cannot be made to pass contrast in dark mode without
  a second token — surface that rather than shipping a low-contrast card.
- Stop if restoring the wash requires changing the shared `bg-card` token —
  that is out of scope; use a per-card override instead.
- Stop if raising pattern opacity makes foreground text fail contrast anywhere
  on the shell — reduce opacity rather than occlude content. The IP pattern is
  a backdrop, never a legibility cost.
- Stop if the user wants the dark pattern rebuilt — the correct source is the
  master `cat-element-source.png`, not the off-brand `cat-element-tile-dark.png`
  or the blank wallpaper swatches.

## Design documentation

- After acceptance and validation: regenerate `.hallmark/audit.md` against the
  full-res frames (its items #2, #3, #4 are stale or inverted) and correct the
  surface-card recommendation. Record the three new surface tokens in the token
  block comment, and record the pattern-visibility decision (chosen opacity,
  tile vs full-page) plus the canonical asset pair
  (`cat-element-pattern-light.png` / `cat-element-pattern-dark.png`) so future
  runs don't reach for the blank wallpaper swatches or the off-brand dark tile.
