# Comprehensive Front-End Rebranding Plan: agent-meow → agent-meow (ColorFire / Meow)

**Date:** 2026-07-11  
**Scope:** `web/` directory — all CSS, components, assets, Electron shell, PWA, i18n  
**Brand source:** `agent-meow-business/architecture/design-scope.md`, `agent-meow-business/architecture/colorfire-branding-index.md`, `agent-meow-business/assets/branding/`  
**Design skill:** taste-skill-design-rules.instructions.md — VARIANCE 6 / MOTION 2 / DENSITY 4 (business workspace, not marketing landing)

---

## Executive Summary

The current `web/` frontend is the inherited agent-meow UI with a **lavender/pink brand accent** (`#df3c85`) and the **Otto starfish mascot**. The rebrand replaces these with the agent-meow identity system:

| Dimension | Current (agent-meow) | Target (agent-meow) |
|---|---|---|
| Brand accent | `#df3c85` (pink) | `#E8651A` ColorFire ember / `#5B8DEF` Meow sky |
| App-shell gradient | Near-white lavender/pink drift | Warm white `#FFFBF5` (ColorFire) / cool white `#F5F8FC` (Meow) |
| Dark canvas | Purple radial glows over `#0d1218` | Warm dark `#1A1410` (ColorFire) / cool dark `#0F1419` (Meow) |
| Mascot | Otto starfish (pink/green) | 橘宝疾风 orange cat (brand-neutral silhouette) |
| Favicon | Otto starfish SVG | Cat mascot silhouette SVG |
| Typography | Geist Mono + system sans | Inter + Noto Sans SC + JetBrains Mono |
| Share button | Hardcoded pink gradient | Brand-primary gradient (ember/sky) |
| Text selection | Pink `#f22286` | Brand-primary |
| CSS var prefix | `--agent-meow-*` | `--agentmeow-*` (with compat shim) |
| PWA theme_color | `#0d1218` | `--brand-bg-dark` (warm/cool dark) |
| Service worker | `agent-meow-pwa-${version}` | `agentmeow-pwa-${version}` |

The plan is organized into **8 phases**, each scoped to a single PR:

1. **CSS token migration** (color palette, app-shell gradient, brand tokens)
2. **Mascot replacement** (OttoIcon → MeowCatIcon, OttoEyes → cat eye-tracking)
3. **Static assets** (favicon, PWA icons, platform-assets logos)
4. **Share button + selection** (hardcoded pink → brand tokens)
5. **CSS variable rename** (`--agent-meow-*` → `--agentmeow-*`)
6. **Service worker + PWA manifest** (cache name, theme_color)
7. **Electron shell branding** (logos, window title, package metadata)
8. **Font stack migration** (Geist Mono → Inter + Noto Sans SC + JetBrains Mono)

---

## Phase 1: CSS Token Migration (Color Palette + App-Shell)

**Effort:** M (3–4 hours)  
**Risk:** Low — CSS variable swaps, no structural layout changes

### 1.1 Brand color tokens

**File:** `web/src/index.css`

The current `--brand-accent` is a single hardcoded pink. The design system calls for a **two-variant brand system** driven by `[data-brand="colorfire"]` (default) and `[data-brand="meow"]` CSS attribute selectors.

**Changes in `:root` (light mode):**

```diff
- --brand-accent: #df3c85;
+ /* ColorFire default — Meow overrides via [data-brand="meow"] */
+ --brand-primary: #E8651A;
+ --brand-primary-hover: #D4571A;
+ --brand-accent: #FFB347;
+ --brand-bg-light: #FFFBF5;
+ --brand-bg-dark: #1A1410;
+ --brand-surface: #FFFFFF;
+ --brand-text-primary: #1A1410;
+ --brand-text-secondary: #6B5D4F;
+ --brand-border: rgba(232,101,26,0.15);
```

**Changes in `.dark`:**

```diff
- --brand-accent: #df3c85;
+ --brand-primary: #E8651A;
+ --brand-primary-hover: #D4571A;
+ --brand-accent: #FFB347;
+ --brand-bg-dark: #1A1410;
+ --brand-text-primary: #F5F0E8;
+ --brand-text-secondary: #A89A8C;
+ --brand-border: rgba(232,101,26,0.15);
```

**Add Meow variant block after `.dark`:**

```css
[data-brand="meow"] {
  --brand-primary: #5B8EF;
  --brand-primary-hover: #4A7DD6;
  --brand-accent: #A0C4FF;
  --brand-bg-light: #F5F8FC;
  --brand-bg-dark: #0F1419;
  --brand-text-primary: #0F1419;
  --brand-text-secondary: #5A6B7A;
  --brand-border: rgba(91,141,239,0.15);
}
.dark[data-brand="meow"] {
  --brand-text-primary: #E8EDF3;
  --brand-text-secondary: #8A9BAE;
}
```

**Files that consume `--brand-accent` (must keep working):**

| File | Usage | Notes |
|---|---|---|
| `web/src/index.css` | `::selection`, `.share-button-glassy`, `.imc-toggle`, `.imc-halo`, `.imc-ping` | See Phase 4 |
| `web/src/components/SessionStateBadge.tsx` | `bg-brand-accent` class for dot | Automatic via Tailwind var |
| `web/src/components/SkillPills.tsx` | `text-brand-accent`, `bg-brand-accent/10` | Automatic via Tailwind var |
| `web/src/components/blocks/SlashCommandCard.tsx` | `text-brand-accent` | Automatic |
| `web/src/lib/userBadge.ts` | `var(--brand-accent)` in palette array | Automatic |

The Tailwind `--color-brand-accent` already maps to `var(--brand-accent)` in the `@theme inline` block (line 63), so Tailwind utility classes like `text-brand-accent` will automatically resolve to the new ColorFire/Meow value. **No component-level class changes needed.**

### 1.2 App-shell gradient

**File:** `web/src/index.css`

The `.app-shell` gradient is currently a near-white lavender/pink drift. Replace with a warm-white gradient for ColorFire:

**Current (light):**
```css
.app-shell {
  background: linear-gradient(45deg,
    rgb(253, 250, 250), rgb(253, 249, 251) 8%, ...
    rgb(254, 253, 253));
}
```

**Target (ColorFire light):**
```css
.app-shell {
  background: linear-gradient(45deg,
    #FFFBF5, #FFFAF2 8%, #FFF9EF 17%, #FFF8EC 25%,
    #FFF7E9 33%, #FFF6E6 42%, #FFF7E8 50%, #FFF8EB 58%,
    #FFF9EE 67%, #FFFAF1 75%, #FFFAF3 83%, #FFFBF5 92%,
    #FFFBF5);
}
```

**Current (dark):**
```css
.dark .app-shell {
  background: radial-gradient(ellipse at 20% 50%, rgba(100, 40, 180, 0.15) ...),
    linear-gradient(145deg, #1e1035 0%, #11171c 50%, #161020 100%);
}
```

**Target (ColorFire dark):**
```css
.dark .app-shell {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(232,101,26,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255,179,71,0.06) 0%, transparent 45%),
    linear-gradient(145deg, #1A1410 0%, #15110D 50%, #1A1410 100%);
}
```

**Meow variant** — add `[data-brand="meow"].app-shell` rules:

```css
[data-brand="meow"].app-shell {
  background: linear-gradient(45deg,
    #F5F8FC, #F4F8FD 8%, #F3F7FD 17%, #F2F7FE 25%,
    #F1F6FE 33%, #F0F6FF 42%, #F1F7FF 50%, #F2F8FE 58%,
    #F3F8FC 67%, #F4F8FC 75%, #F5F8FC 83%, #F5F8FC 92%, #F5F8FC);
}
.dark[data-brand="meow"].app-shell {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(91,141,239,0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(160,196,255,0.06) 0%, transparent 45%),
    linear-gradient(145deg, #0F1419 0%, #0D1218 50%, #0F1419 100%);
}
```

### 1.3 Sidebar canvas color

**File:** `web/src/index.css`

The `--sidebar` token currently matches the lavender gradient's lightest tone (`#fdfafa`). Update to match the ColorFire warm white:

**Light:**
```diff
- --sidebar: #fdfafa;
+ --sidebar: #FFFBF5;
```

**Dark:**
```diff
- --sidebar: rgba(17, 23, 28, 0.75);
+ --sidebar: rgba(26, 20, 16, 0.75);
```

### 1.4 Theme color meta

**File:** `web/index.html`

```diff
- <meta name="theme-color" content="#0d1218" />
+ <meta name="theme-color" content="#1A1410" />
```

### 1.5 Brand data-attribute wiring

**File:** `web/src/main.tsx` or `web/src/components/theme/ThemeProvider.tsx`

Add `data-brand` attribute on `<html>` or the app root, sourced from the server's brand config (from `config.yaml` → `/v1/info` response). Default to `colorfire`:

```tsx
// In ThemeProvider or main.tsx, after capabilities resolve:
document.documentElement.setAttribute("data-brand", serverInfo.brand ?? "colorfire");
```

This requires a new `brand` field in the `ServerInfo` type (`web/src/lib/capabilities.ts`) and the server-side `/v1/info` endpoint, which is **out of scope for the web-only PR** — wire it with a static `colorfire` default first and add the server-side field as a follow-up.

### 1.6 Tests

- `web/src/index.css.test.ts` — update any color assertion if it checks brand values
- Visual: verify light/dark mode in both ColorFire and Meow variants

---

## Phase 2: Mascot Replacement (Otto → MeowCat)

**Effort:** L (4–6 hours)  
**Risk:** Medium — replaces a core identity component with eye-tracking logic

### 2.1 Create MeowCatIcon

**New file:** `web/src/components/icons/MeowCatIcon.tsx`

The mascot "橘宝疾风" (orange cat) from the `.ai` source files needs to be rendered as an inline SVG (same pattern as `OttoIcon.tsx`). The SVG should:

- Use `currentColor` for the body silhouette (brand-neutral, follows theme)
- Have `g.meowcat-eye` groups with `g.meowcat-pupil` sub-groups for eye-tracking (same pattern as Otto's `g.otto-eye` / `g.otto-pupil`)
- Be geometric and minimalist — a cat head silhouette with pointed ears, not a detailed illustration
- Support `className="meowcat-working"` for the bob + blink animation (renamed from `otto-working`)

**Source:** The 3 `.ai` files in `agent-meow-business/assets/branding/original/`:
- `橘宝疾风素材（形象元素表情包系列图标等）.ai` — mascot source
- Export to SVG, simplify to a geometric cat silhouette, inline as a React component

### 2.2 Create MeowCatEyes (replace OttoEyes)

**New file:** `web/src/components/MeowCatEyes.tsx`

Port the eye-tracking logic from `OttoEyes.tsx`:
- Update `EYE_CENTERS` to match the cat silhouette's eye positions
- Update `WHITE_RADIUS` and `PUPIL_RADIUS` to the cat's eye geometry
- Update class name references from `otto-pupil` to `meowcat-pupil`
- Keep the same caret-tracking and reduced-motion behavior

### 2.3 Update consumers

**Files that import OttoIcon/OttoEyes:**

| File | Change |
|---|---|
| `web/src/pages/ChatPage.tsx` (line 61) | `import { OttoIcon }` → `import { MeowCatIcon }`; update JSX |
| `web/src/components/OttoEyes.tsx` | Replace with `MeowCatEyes.tsx` (or keep file name, just swap the icon import) |
| `web/src/components/OttoEyes.test.tsx` | Update to test MeowCatEyes |
| `web/src/components/icons/OttoIcon.test.tsx` | Replace with `MeowCatIcon.test.tsx` |

### 2.4 Update CSS animations

**File:** `web/src/index.css`

Rename animation classes and keyframes:

```diff
- @keyframes otto-bob { ... }
- @keyframes otto-blink { ... }
- .otto-working { animation: otto-bob 1.6s ease-in-out infinite; }
- .otto-working .otto-eye { animation: otto-blink 3.4s ease-in-out infinite; }
+ @keyframes meowcat-bob { ... }
+ @keyframes meowcat-blink { ... }
+ .meowcat-working { animation: meowcat-bob 1.6s ease-in-out infinite; }
+ .meowcat-working .meowcat-eye { animation: meowcat-blink 3.4s ease-in-out infinite; }
```

### 2.5 Keep old OttoIcon as compat (optional)

If any third-party code or embed consumers reference OttoIcon, keep it as a thin wrapper that renders MeowCatIcon. Otherwise, delete it.

### 2.6 Tests

- `MeowCatIcon.test.tsx` — verify SVG renders, aria-label, className pass-through
- `MeowCatEyes.test.tsx` — verify eye-tracking behavior (cursor follow, caret follow, reduced motion)
- E2E: verify mascot appears in sidebar and animates when a session is active

---

## Phase 3: Static Assets (Favicon, PWA Icons, Platform Logos)

**Effort:** M (2–3 hours)  
**Risk:** Low — file replacements

### 3.1 Favicon

**File:** `web/public/favicon.svg`

Replace the Otto starfish SVG (32×32) with a simplified cat silhouette SVG at the same size. The cat silhouette should use `--brand-primary` as its fill (or a fixed warm orange `#E8651A` since SVG favicons don't resolve CSS vars).

### 3.2 PWA icons

**Files:**
- `web/public/pwa-192.png`
- `web/public/pwa-512.png`
- `web/public/pwa-maskable-512.png`
- `web/public/apple-touch-icon.png`

Generate from the cat mascot source (`.ai` file → export PNG at required sizes). The maskable icon needs safe-zone padding per the PWA spec.

### 3.3 Platform-assets logos

**Files:**
- `web/platform-assets/logos/omnigents-logo.svg`
- `web/platform-assets/logos/omnigents-logo-reverse.svg`

Replace with agent-meow branded logos. The Electron setup screen and iOS SwiftUI setup screen consume these.

### 3.4 AppIcon.icon (Apple Icon Composer)

**File:** `web/platform-assets/AppIcon.icon/`

Regenerate from the cat mascot source using Apple Icon Composer. The iOS project references this directly.

### 3.5 Electron icons

**Files:**
- `web/electron/icons/icon.icns`
- `web/electron/icons/icon.ico`
- `web/electron/icons/icon.png`
- `web/electron/icons/Assets.car`

Regenerate from the cat mascot source at the required platform sizes.

### 3.6 Tests

- Visual: verify favicon in browser tab
- Visual: verify PWA install icon on Chrome/Edge
- Visual: verify Electron dock/taskbar icon

---

## Phase 4: Share Button + Text Selection (Hardcoded Pink → Brand)

**Effort:** S (1–2 hours)  
**Risk:** Low

### 4.1 Share button gradient

**File:** `web/src/index.css`

The `.share-button-glassy` class uses hardcoded pink gradients. Replace with `--brand-primary`:

**Light:**
```diff
- background: linear-gradient(to bottom, #fa3d99 0%, #f22286 40%, #d51d74 100%);
+ background: linear-gradient(to bottom, var(--brand-primary) 0%, var(--brand-primary-hover) 40%, color-mix(in srgb, var(--brand-primary), #000 12%) 100%);
```

**Dark:**
```diff
- background: linear-gradient(150deg, #ff4da6 0%, #f22286 40%, #b8185f 100%);
+ background: linear-gradient(150deg, color-mix(in srgb, var(--brand-primary), white 8%) 0%, var(--brand-primary) 40%, color-mix(in srgb, var(--brand-primary), #000 20%) 100%);
```

Update hover states similarly.

### 4.2 Text selection

**File:** `web/src/index.css`

```diff
::selection {
-   background: color-mix(in srgb, #f22286 20%, transparent);
-   color: #f22286;
+   background: color-mix(in srgb, var(--brand-primary) 20%, transparent);
+   color: var(--brand-primary);
}
.dark ::selection {
-   background: #f22286;
+   background: var(--brand-primary);
    color: #ffffff;
}
```

### 4.3 IMC toggle + halo + ping

**File:** `web/src/index.css`

All `.imc-*` rules that reference `var(--brand-accent)` will **automatically** pick up the new ColorFire amber/Meow sky value from the token swap in Phase 1. **No changes needed here.**

### 4.4 Tests

- Visual: verify share button in light/dark, ColorFire/Meow
- Visual: verify text selection color

---

## Phase 5: CSS Variable Rename (`--agent-meow-*` → `--agentmeow-*`)

**Effort:** M (2–3 hours)  
**Risk:** Medium — many references across CSS + TS; requires compat shim

### 5.1 Variables to rename

**File:** `web/src/index.css`

| Current | New |
|---|---|
| `--agent-meow-header-height` | `--agentmeow-header-height` |
| `--agent-meow-safe-top` | `--agentmeow-safe-top` |
| `--agent-meow-safe-bottom` | `--agentmeow-safe-bottom` |
| `--agent-meow-native-top-bar` | `--agentmeow-native-top-bar` |
| `--agent-meow-native-bottom-bar` | `--agentmeow-native-bottom-bar` |
| `--agent-meow-top-bar-visible` | `--agentmeow-top-bar-visible` |
| `--agent-meow-bottom-bar-visible` | `--agentmeow-bottom-bar-visible` |
| `--agent-meow-inset-top` | `--agentmeow-inset-top` |
| `--agent-meow-inset-bottom` | `--agentmeow-inset-bottom` |
| `--agent-meow-viewport-height` | `--agentmeow-viewport-height` |

**Note:** `--agentmeow-android-safe-area-*` already uses the new prefix — no change needed.

### 5.2 Compatibility shim

Add a compatibility block at the end of `:root` so any code that still references `--agent-meow-*` keeps working during the migration:

```css
:root {
  /* Compat: --agent-meow-* aliases for the new --agentmeow-* tokens.
     Remove after all consumers are updated. */
  --agent-meow-header-height: var(--agentmeow-header-height);
  --agent-meow-safe-top: var(--agentmeow-safe-top);
  /* ... etc for each renamed var ... */
}
```

### 5.3 Update TypeScript consumers

**Files that read `--agent-meow-*` via `getComputedStyle`:**

| File | Variable | Notes |
|---|---|---|
| `web/src/lib/nativeInsets.ts` | `--agent-meow-native-top-bar`, `--agent-meow-native-bottom-bar` | Updates native bridge |
| `web/src/hooks/useIOSViewportLock.ts` | `--agent-meow-viewport-height` | Updates viewport lock |
| `web/src/components/PageScroll.tsx` | `--agent-meow-header-height`, `--agent-meow-inset-*` | Updates scroll insets |

### 5.4 Update CSS class consumers

**Classes that reference `--agent-meow-*` in CSS:**

Search `web/src/index.css` for all `var(--agent-meow-*)` references and update to `var(--agentmeow-*)`.

### 5.5 Tests

- `web/src/components/PageScroll.tsx` tests
- `web/src/hooks/useIOSViewportLock.ts` tests (if present)
- Visual: verify iOS/Android/Electron native shell insets still work

---

## Phase 6: Service Worker + PWA Manifest

**Effort:** S (1 hour)  
**Risk:** Low

### 6.1 Service worker cache name

**File:** `web/sw-src/sw.js`

```diff
- const CACHE_NAME = `agent-meow-pwa-${BUILD_VERSION}`;
+ const CACHE_NAME = `agentmeow-pwa-${BUILD_VERSION}`;
```

### 6.2 PWA manifest

**File:** `web/vite.config.ts`

```diff
const PWA_MANIFEST = {
  id: "/",
  name: "agent-meow",
  short_name: "agent-meow",
  description: "agent-meow — a common layer over coding agents.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "any",
- theme_color: "#0d1218",
- background_color: "#0d1218",
+ theme_color: "#1A1410",
+ background_color: "#FFFBF5",
  icons: [ ... ], // updated in Phase 3
};
```

### 6.3 Tests

- Build: verify `manifest.webmanifest` is emitted with correct values
- PWA: verify install prompt shows correct name + icon

---

## Phase 7: Electron Shell Branding

**Effort:** M (2–3 hours)  
**Risk:** Low — mostly metadata + asset paths

### 7.1 Package metadata

**File:** `web/electron/package.json`

Already has `productName: "agent-meow"` and `appId: "io.cubecloud.agentmeow.desktop"`. No changes needed.

### 7.2 Window title + about panel

**File:** `web/electron/src/main.js`

Search for any hardcoded "agent-meow" strings in window titles, about panels, or notification text. The file already uses "agent-meow" in comments — verify there are no user-facing "agent-meow" strings.

### 7.3 Preload bridge naming

**File:** `web/electron/src/preload.js`

The preload exposes `window.omnigentDesktop` and `window.omnigentSetup`. These are consumed by `web/src/lib/nativeBridge.ts`. Renaming the bridge object name is a **coordinated change** between Electron and web:

| Current | New |
|---|---|
| `window.omnigentDesktop` | `window.agentmeowDesktop` |
| `window.omnigentSetup` | `window.agentmeowSetup` |
| `window.omnigentFind` | `window.agentmeowFind` |
| `window.omnigentUrl` | `window.agentmeowUrl` |
| IPC channels `agent-meow:*` | `agentmeow:*` |

**Web-side consumers:**

| File | Variable |
|---|---|
| `web/src/lib/nativeBridge.ts` | `window.omnigentDesktop` |
| `web/src/lib/browserNotifications.ts` | `window.omnigentDesktop` |
| `web/src/lib/nativeInsets.ts` | reads from native bridge |
| `web/electron/src/url.js` | `window.omnigentUrl` |

**Recommendation:** Keep the bridge names as-is for now (they are internal, not user-facing) and rename in a separate coordination PR. The `agent-meow` CLI binary name is also still the pip package name — renaming it is a Phase 2 (v0.7) task per `colorfire-branding-index.md` §2.

### 7.4 Logo references in setup page

**File:** `web/electron/setup/` (HTML setup page)

Update logo references from `omnigents-logo.svg` to the new agent-meow logos (produced in Phase 3).

### 7.5 Tests

- `web/electron/test/omnigent_cli.test.js` — update if test checks for brand strings
- Visual: verify Electron setup page shows new logo

---

## Phase 8: Font Stack Migration

**Effort:** M (2–3 hours)  
**Risk:** Medium — changes global typography, needs bilingual testing

### 8.1 Font imports

**File:** `web/src/index.css`

Currently uses `@fontsource-variable/geist-mono` for the monospace font. The design system calls for:

- **Sans:** Inter + Noto Sans SC (for CJK)
- **Mono:** JetBrains Mono (replaces Geist Mono)

**Changes:**

```diff
- @import "@fontsource-variable/geist-mono";
+ @import "@fontsource-variable/inter";
+ @import "@fontsource-variable/jetbrains-mono";
```

**Note:** Check if `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` are available in the `@fontsource` ecosystem. If not, use `@fontsource/inter` and `@fontsource/jetbrains-mono`.

### 8.2 Font tokens

**File:** `web/src/index.css`

```diff
@theme inline {
- --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", ...;
- --font-mono: "Geist Mono Variable", "JetBrains Mono", ui-monospace, monospace;
+ --font-sans: "Inter Variable", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
+ --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;
}
```

### 8.3 Package dependencies

**File:** `web/package.json`

```diff
dependencies:
- "@fontsource-variable/geist-mono": "^5.2.7",
+ "@fontsource-variable/inter": "^5.x.x",
+ "@fontsource-variable/jetbrains-mono": "^5.x.x",
```

### 8.4 Chinese rendering

The design system spec says "Inter has limited CJK; Noto Sans SC fills in." The font stack above puts Noto Sans SC as the first fallback after Inter, so CJK characters fall through to Noto Sans SC automatically.

**Note:** Per the user's memory preference: "Chinese typography and bilingual polish matter; preserve intentional type choices and clean Chinese rendering." Test with both `en.json` and `zh-CN.json` locales.

### 8.5 Tests

- Visual: verify font rendering in en + zh-CN
- Visual: verify code blocks render in JetBrains Mono
- Bundle: verify font imports don't bloat the bundle excessively (Inter Variable is ~340KB woff2)

---

## Dependency Graph

```
Phase 1 (CSS tokens) ──────┬──→ Phase 2 (Mascot)
                            ├──→ Phase 4 (Share/Selection)
                            ├──→ Phase 6 (SW/PWA)
                            │
Phase 3 (Static assets) ────┘
Phase 5 (CSS var rename) ─── independent
Phase 7 (Electron) ───── depends on Phase 3 (logos)
Phase 8 (Fonts) ──────── independent
```

**Recommended PR order:**
1. Phase 3 (static assets — unblocks Electron + favicon)
2. Phase 1 (CSS tokens — the core color swap)
3. Phase 4 (share/selection — depends on Phase 1)
4. Phase 2 (mascot — depends on Phase 1 for animation class names)
5. Phase 6 (SW/PWA — depends on Phase 3 for icons)
6. Phase 5 (CSS var rename — independent, can go anytime after Phase 1)
7. Phase 7 (Electron — depends on Phase 3 for logos)
8. Phase 8 (fonts — independent, can go anytime)

---

## File Inventory

### Files to modify

| File | Phases |
|---|---|
| `web/src/index.css` | 1, 2, 4, 5, 8 |
| `web/index.html` | 1 |
| `web/vite.config.ts` | 6 |
| `web/sw-src/sw.js` | 6 |
| `web/package.json` | 8 |
| `web/src/main.tsx` or `web/src/components/theme/ThemeProvider.tsx` | 1 (brand attribute) |
| `web/src/lib/nativeBridge.ts` | 5 (optional) |
| `web/src/lib/nativeInsets.ts` | 5 |
| `web/src/hooks/useIOSViewportLock.ts` | 5 |
| `web/src/components/PageScroll.tsx` | 5 |
| `web/electron/src/main.js` | 7 |
| `web/electron/src/preload.js` | 7 (optional) |
| `web/electron/setup/` | 7 |

### Files to create

| File | Phase |
|---|---|
| `web/src/components/icons/MeowCatIcon.tsx` | 2 |
| `web/src/components/MeowCatEyes.tsx` | 2 |
| `web/src/components/icons/MeowCatIcon.test.tsx` | 2 |
| `web/src/components/MeowCatEyes.test.tsx` | 2 |

### Files to delete (after Phase 2)

| File | Notes |
|---|---|
| `web/src/components/icons/OttoIcon.tsx` | Replaced by MeowCatIcon |
| `web/src/components/icons/OttoIcon.test.tsx` | Replaced |
| `web/src/components/OttoEyes.tsx` | Replaced by MeowCatEyes |
| `web/src/components/OttoEyes.test.tsx` | Replaced |

### Static assets to replace

| File | Phase |
|---|---|
| `web/public/favicon.svg` | 3 |
| `web/public/pwa-192.png` | 3 |
| `web/public/pwa-512.png` | 3 |
| `web/public/pwa-maskable-512.png` | 3 |
| `web/public/apple-touch-icon.png` | 3 |
| `web/platform-assets/logos/omnigents-logo.svg` | 3 |
| `web/platform-assets/logos/omnigents-logo-reverse.svg` | 3 |
| `web/platform-assets/AppIcon.icon/` | 3 |
| `web/electron/icons/icon.icns` | 3 |
| `web/electron/icons/icon.ico` | 3 |
| `web/electron/icons/icon.png` | 3 |
| `web/electron/icons/Assets.car` | 3 |
| `web/src/assets/otto-no-padding.svg` | 3 (delete or replace) |

---

## What Stays the Same (Out of Scope)

These are **not** changed in the web rebranding:

1. **`agent-meow` CLI binary name** — the pip package is still `agent-meow` for SDK compatibility; rename is Phase 2 (v0.7) per `colorfire-branding-index.md` §2
2. **`omnigent_*` env vars** — deferred to v0.7 with compat shim
3. **`agent_meow.*` label keys** in conversation labels (`agent_meow.wrapper`, `agent_meow.ui`, etc.) — these are API protocol keys, not user-facing brand strings
4. **`agent-meow-client` / `agent-meow-ui-sdk`** package names — SDK dependency pins
5. **Embed component name** `OmnigentApp` / `OmnigentHostConfig` in `web/src/embed.tsx` — public API surface for embed consumers, rename is a breaking change
6. **localStorage keys** like `agent-meow:lastLoginUsername`, `agent-meow:last-agent-id`, `agent_meow.sessionDrafts` — renaming would lose saved user state; add aliases if needed
7. **Backend `agent_meow/` module** — this plan is web-only
8. **i18n locale strings** — already say "agent-meow" in both `en.json` and `zh-CN.json`; no changes needed

---

## Design Taste Skill — Pre-Flight Checklist

Applied to the rebranded UI:

- [x] One design system per project — shadcn/ui (existing), customized with brand tokens
- [x] Navigation on ONE line at desktop, height ≤ 80px — existing ChatHeader (h-14 = 56px)
- [x] Copy self-audit — i18n strings already use "agent-meow", no AI-hallucinated phrases
- [x] Motion motivated — Otto bob/blink → MeowCat bob/blink (same justification: session active indicator)
- [x] Marquee max-one-per-page — no marquees in the app
- [x] Real images used — workspace design PNGs from `agent-meow-business/assets/branding/` inform the UI direction
- [x] Reduced motion wrapped — existing `@media (prefers-reduced-motion: reduce)` rule freezes otto/meowcat animations
- [x] Dark mode tokens defined and tested — ColorFire dark `#1A1410` + Meow dark `#0F1419`
- [x] Mobile collapse explicit — existing responsive breakpoints (Sidebar drawer, ChatHeader mobile FAB)
- [x] Viewport stability — existing `h-dvh` / `100lvh` usage
- [x] `useEffect` animations have strict cleanup functions — OttoEyes/MeowCatEyes cleanup pattern (existing)
- [x] Icons from allowed library — Lucide (existing) + `@lobehub/icons` for harness glyphs (existing)

---

## Anti-Slop Audit

The rebranding must not introduce any AI tells:

- [x] **No AI-purple** — replacing `#df3c85` (pink) with `#E8651A` (ember orange) or `#5B8DEF` (sky blue)
- [x] **No pure black/white** — using `#1A1410` (warm dark) / `#FFFBF5` (warm white), not `#000`/`#fff`
- [x] **No emoji bullets** — existing UI has none
- [x] **No "Trusted by" logo wall** — not applicable (app UI, not marketing page)
- [x] **No three-equal-card grids** — existing layout is sidebar + chat + right-rail
- [x] **No version footers** — existing UI has none
- [x] **No Inter as default font** — using Inter + Noto Sans SC pairing (Inter is the design system spec, not a default LLM choice)

---

## References

- `agent-meow-business/architecture/design-scope.md` — full design system spec (colors, typography, tokens, onboarding)
- `agent-meow-business/architecture/colorfire-branding-index.md` — brand asset index, OEM config variants, mascot/avatar system
- `agent-meow-business/assets/branding/` — source `.ai` files + 3 workspace design screenshots
- `agent-meow-business/plans/002-brand-asset-integration-and-index.md` — brand asset integration plan (business repo)
- `taste-skill-design-rules.instructions.md` — anti-slop frontend design rules