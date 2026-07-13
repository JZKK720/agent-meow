# Brand Assets — agent-meow for ColorFire

**Owner:** 智方云 (Cubecloud)
**Date:** 2026-07-11
**Status:** Active

> **See also:** [colorfire-branding-index.md](../../architecture/colorfire-branding-index.md)
> for the full brand asset checklist and OEM config variants, and
> [design-scope.md](../../architecture/design-scope.md) for the design system spec.

---

## Source files (`original/`)

| File | Size | Description | Intended use |
|---|---|---|---|
| `橘宝疾风素材（形象元素表情包系列图标等）.ai` | 88.8 MB | 橘宝疾风 (Orange Treasure Storm) — orange cat mascot character, expressions, emoji/sticker series, icon set. Adobe Illustrator source. | Product mascot, agent avatars, onboarding illustrations, empty-state art, PWA icon |
| `橘猫壁纸图案2ai.ai` | 3.5 MB | Orange cat wallpaper pattern #2. Adobe Illustrator source. | Boot screen, splash background, empty-state backgrounds |
| `猫元素图案.ai` | 1.2 MB | Cat element pattern. Adobe Illustrator source. | Loading states, decorative borders, sidebar texture |

> **Note:** `.ai` files are Adobe Illustrator sources. Export to SVG (for web)
> and PNG (for raster) during the OEM integration phase. Do not edit the
> source files directly.

---

## Generated workspace designs

| File | Size | Dimensions | Description |
|---|---|---|---|
| `workspace-design-01.png` | 10.5 MB | 4085 × 3099 px | Workspace/dashboard design reference #1 — Docs/Images/Voice panel layout, shell, right-rail |
| `workspace-design-02.png` | 14.2 MB | 4086 × 3151 px | Workspace/dashboard design reference #2 — alternate layout variant |
| `workspace-hero-16x9.png` | 3.3 MB | 3840 × 2160 px (16:9) | Hero/splash screen design — for index page hero, PWA install screen, onboarding welcome |

> **Note:** These are generated design references, not production assets.
> They inform the web UI design direction. The actual web UI is built in
> the runtime repo (`agent-meow/web/`).

---

## Brand identity summary

| Element | ColorFire | Meow |
|---|---|---|
| **Mascot** | 橘宝疾风 (orange cat) with ember accent | 橘宝疾风 (orange cat) with sky accent |
| **Primary color** | `#E8651A` (ember orange) | `#5B8DEF` (sky blue) |
| **Accent color** | `#FFB347` (warm amber) | `#A0C4FF` (light sky) |
| **Background (light)** | `#FFFBF5` (warm white) | `#F5F8FC` (cool white) |
| **Background (dark)** | `#1A1410` (warm dark) | `#0F1419` (cool dark) |
| **Typography** | Noto Serif SC (headings) / Noto Sans SC (body) / JetBrains Mono (code) | Same |

> Full design system spec: [design-scope.md](../../architecture/design-scope.md)
> Full brand asset checklist: [colorfire-branding-index.md](../../architecture/colorfire-branding-index.md)
> Visual gallery: [brand-assets-gallery.html](../../architecture/brand-assets-gallery.html)

---

## Exports (`original/exports/`)

High-resolution PNG exports from the .ai source files (rendered at 2x via PyMuPDF):

| File | Dimensions | Source |
|---|---|---|
| `橘宝疾风素材（...）_p1.png` | 10621 × 15056 px | Mascot character sheet (page 1) |
| `橘宝疾风素材（...）_p2.png` | 6840 × 15054 px | Mascot emoji/icons (page 2) |
| `橘猫壁纸图案2ai_p1.png` | 28214 × 13572 px | Cat wallpaper pattern |
| `猫元素图案_p1.png` | 8504 × 14174 px | Cat element pattern |

## Thumbnails (`original/thumbnails/`)

Web-optimized thumbnails (1000px max width) for HTML display:

| File | Dimensions | Size | Source |
|---|---|---|---|
| `mascot-character-sheet.png` | 1000 × 1417 px | 835 KB | Mascot page 1 |
| `mascot-emoji-icons.png` | 1000 × 2200 px | 977 KB | Mascot page 2 |
| `cat-wallpaper-pattern.png` | 1000 × 481 px | 178 KB | Wallpaper pattern |
| `cat-element-pattern.png` | 1000 × 1666 px | 115 KB | Element pattern |

## Workspace thumbnails (`thumbnails/`)

Web-optimized thumbnails of the workspace design PNGs:

| File | Dimensions | Size | Source |
|---|---|---|---|
| `workspace-design-01.png` | 800 × 606 px | 446 KB | Workspace design #1 |
| `workspace-design-02.png` | 800 × 616 px | 498 KB | Workspace design #2 |
| `workspace-hero-16x9.png` | 1200 × 675 px | 556 KB | Hero/splash screen |