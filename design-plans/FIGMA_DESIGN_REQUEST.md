# Figma Design Request — agent-meow UI

**Date:** 2026-07-24 · **From:** agent-meow engineering · **To:** Figma design team
**Purpose:** Complete inventory of design assets needed from Figma to finalize the agent-meow product UI

---

## Design Read

> Reading this as: **multi-surface AI agent workspace** for developers and power users, with a **ColorFire ember** brand language, leaning toward **Tailwind v4 + Radix UI + shadcn** with warm-dark glassmorphism.

**Current design system:**
- **Brand:** ColorFire (Cubecloud) — ember orange (`#E8651A`), warm amber accent (`#FFB347`), warm-dark canvas (`#1A1410`)
- **Typography:** System UI sans (San Francisco/Segoe UI/Roboto) + Geist Mono for code
- **Component library:** Radix UI primitives + shadcn wrappers
- **Theme:** Light (warm-white `#FFFBF5` canvas) + Dark (warm-dark `#1A1410` glassmorphism)
- **Radius:** `0.5rem` base, scaling via Tailwind `--radius-*`
- **Icon set:** Lucide React (stroke-width 1.5)
- **Mascot:** MeowCat (橘宝疾风 / "Orange Treasure Storm") — geometric cat silhouette with eye-tracking pupils

---

## What We Need from Figma

### 1. Brand Assets

| Item | Spec | Current state |
|---|---|---|
| **MeowCat mascot** — full character | Vector illustration of 橘宝疾风 (Orange Treasure Storm) cat. Needs: full-body pose, sitting pose, working pose (for loading states), sleeping pose (for idle). SVG with separated layers for eye-tracking animation. | Current: geometric silhouette only (`MeowCatIcon.tsx`), no full character |
| **App icon** — all platforms | 1024×1024 master + exported sizes for: macOS (16/32/64/128/256/512/1024), iOS (20/29/40/60/76/83.2/1024 + Settings/Spotlight/Notification), Android (48/72/96/144/192/512), web favicon (16/32/180), PWA maskable (512). | Current: `mascot-hero.png` exists but may need Cubecloud rebrand |
| **Logo lockup** | Horizontal + stacked variants of "agent-meow" wordmark + MeowCat icon. Light and dark versions. SVG. | None — text-only currently |
| **Splash/loading screen** | Animated or static splash for Electron/iOS/Android. Should feature the mascot. | None |

### 2. Landing Screen (NewChatLandingScreen)

This is the first thing users see. Current layout: central mic button with FFT wave band + 3 surface cards (Docs/Images/Videos) + composer.

| Item | Spec | Notes |
|---|---|---|
| **Hero composition** | The landing screen's visual hierarchy: mascot placement, headline, mic button prominence, card layout. Desktop (1440×900) + mobile (390×844). | Current: mascot + wave band + cards, but no designed hero |
| **Mic button + wave band** | The central CTA: 56px circle with ember ring, 4-bar FFT visualizer inside. States: idle (baseline bars), listening (animated bars), permission-denied (error). | Implemented in `ComposerMicButton.tsx` — needs design polish |
| **3 surface cards** | Docs (📄), Images (🖼️), Videos (🎬) — each a card with icon, title, description, hover state. Grid layout on desktop, stacked on mobile. | Implemented but using generic Lucide icons — need branded icons |
| **Surface card icons** | Custom icons for each surface: Docs (document with pen), Images (photo with edit), Videos (film with play). Should match the ember brand. 24×24 SVG. | Currently using `FileTextIcon`, `ImageIcon`, `FilmIcon` from Lucide |
| **Empty state illustrations** | When a surface panel has no content (no docs, no images, no videos): a small illustration + CTA. 3 variants. | Currently text-only ("No documents yet") |
| **Attach button (+)** | The orange plus affordance on the landing screen. 32px circle, brand-primary. | Implemented but may need design refinement |

### 3. Chat Surface

| Item | Spec | Notes |
|---|---|---|
| **Chat header** | 56px height bar with: sidebar toggle, conversation title, agent picker, host badge, panel toggle. Light + dark. | Implemented (`ChatHeader.tsx`) — needs design review |
| **Message bubbles** | User vs agent message styling. Code blocks, inline images, file chips, tool cards. Light + dark. | Implemented via `ai-elements` — needs brand alignment |
| **Tool cards** | Collapsible cards for tool calls (function name, args, output, status). States: running (shimmer), success, error. | Implemented (`ToolCard.tsx`) — needs design polish |
| **Approval/elicitation cards** | Policy ASK cards: permission request, code review, file access. States: pending, approved, denied. | Implemented (`ApprovalCard.tsx`) |
| **Composer** | Text area with: mic button, attach button, send button, agent picker, model picker, effort picker. Light + dark. Desktop + mobile. | Implemented — needs design review for mobile layout |
| **Slash command menu** | Dropdown for `/skill` commands. Searchable, keyboard-navigable. | Implemented (`SlashCommandMenu.tsx`) |
| **Mention menu** | `@file` mention dropdown for workspace files. | Implemented (`FileMentionMenu.tsx`) |

### 4. Workspace Rail (Right Panel)

| Item | Spec | Notes |
|---|---|---|
| **Tab strip** | Files, Docs, Images, Videos, Agents, Shells, Tasks, Browser — pill-style tabs with badges. Scroll behavior on narrow rails. | Implemented (`WorkspacePanel.tsx`) — needs design review |
| **FilesPanel** | File tree with changed-files toggle, sort dropdown, hidden-files toggle. | Implemented |
| **DocsPanel** | Document list with new-doc button, delete, relative dates. Empty state. | Implemented |
| **DocEditor** | Tiptap rich-text editor with toolbar (bold, italic, heading, lists, quote, code, link). Save status indicator. | Implemented (`DocEditor.tsx`) |
| **ImagesPanel** | Gallery grid with upload dropzone, thumbnails, delete, edit indicator. Empty state. | Implemented (`ImagesPanel.tsx`) |
| **ImageEditor** | Fabric.js canvas editor with rotate, download, save-edit. | Implemented (`ImageEditor.tsx`) |
| **VideosPanel** | Gallery grid with first-frame thumbnails, duration badges, inline player, upload. Empty state. | Implemented (`VideosPanel.tsx`) |
| **SubagentsPanel** | Agent tree with working/idle status dots. | Implemented |
| **TerminalsPanel** | Inline terminal list + expand to full panel. | Implemented |
| **TodoPanel** | Task list with completion checkboxes. | Implemented |
| **BrowserPane** | Embedded browser (Electron only) with address bar, back/forward, design mode. | Implemented |

### 5. Sidebar (Left Panel)

| Item | Spec | Notes |
|---|---|---|
| **Conversation list** | Searchable list with: title, agent badge, timestamp, unread dot, status icon. Hover states, selected state. | Implemented (`Sidebar.tsx`) |
| **New session button** | Primary CTA at top. | Implemented |
| **Project folders** | Collapsible project groups with session counts. | Implemented |
| **Sidebar footer** | Server picker, settings, user menu. | Implemented |

### 6. Settings Pages

| Item | Spec | Notes |
|---|---|---|
| **Settings sections** | Appearance (theme, font, density), Language, Members, Policies, Skills, MCP Servers, Sharing. Each needs a settings layout. | Implemented (`SettingsPage.tsx`) |
| **Harness setup dialog** | Install/login flow for Claude, Codex, Cursor, etc. Progress states. | Implemented (`HarnessSetupDialog.tsx`) |
| **Connect host dialog** | Instructions for connecting a machine as a host. Copyable commands. | Implemented |

### 7. Auth Pages

| Item | Spec | Notes |
|---|---|---|
| **Login page** | Centered card, no chrome. OIDC redirect button or accounts login form. | Implemented (`LoginPage.tsx`) |
| **Register page** | Same layout, registration form. | Implemented (`RegisterPage.tsx`) |
| **Setup page** | First-run admin creation form. | Implemented (`SetupPage.tsx`) |
| **Approve page** | Elicitation approval for CLI-linked sessions. | Implemented (`ApprovePage.tsx`) |

### 8. Mobile-Specific Layouts

| Item | Spec | Notes |
|---|---|---|
| **Mobile sidebar** | Full-screen overlay with slide-in animation. Edge-swipe gesture. | Implemented |
| **Mobile workspace rail** | FAB dropdown → full-screen drawers for Files/Terminals/Agents/Tasks. | Implemented |
| **Mobile composer** | Keyboard-aware layout with safe-area insets. Mic button repositioned. | Implemented |
| **iOS server switcher** | Floating pill at top, shows current server, tap to switch. | Implemented (`ServerSwitcher` in Swift) |
| **Android server switcher** | Same floating pill pattern. | Implemented (`MainActivity.kt`) |
| **Chat/Terminal bar** | Bottom bar on mobile for switching between chat and terminal views. | Implemented (`ChatTerminalBar.swift`) |

### 9. Status & Feedback

| Item | Spec | Notes |
|---|---|---|
| **Loading states** | Shimmer text ("Thinking..."), spinner, skeleton screens. | Implemented (`Shimmer.tsx`) |
| **Error states** | Error banners, toast notifications, inline error messages. | Implemented |
| **Success states** | Toast notifications, saved indicators. | Implemented |
| **Connection status** | Runner online/offline indicator, host connection status, session liveness dot. | Implemented |
| **Empty states** | For conversations, files, docs, images, videos, terminals, agents, tasks. Each needs illustration + CTA. | Partially implemented (text-only) |

### 10. Iconography

| Item | Spec | Notes |
|---|---|---|
| **Surface icons** | Custom branded icons for Docs, Images, Videos (not generic Lucide). 24×24 SVG, stroke 1.5. | Currently using Lucide defaults |
| **Status icons** | Online, offline, idle, working, error, success, warning, info. 16×16 SVG. | Currently using Lucide defaults |
| **Harness icons** | Claude, Codex, Cursor, Pi, Antigravity, Qwen, Hermes, Goose, OpenCode, Kimi, Kiro. 20×20 SVG. | None — using text badges |
| **Agent type icons** | Polly (orchestrator), Debby (debate), Voicebox (voice), Scrapling (spider), Reach (search), Browser (globe), Memory (brain). 20×20 SVG. | None — using text badges |
| **File type icons** | Code, markdown, image, video, pdf, office, archive, config. 16×16 SVG. | Currently using Lucide defaults |

### 11. Motion & Animation

| Item | Spec | Notes |
|---|---|---|
| **Mic wave band** | 4-bar FFT visualizer animation curve. Idle baseline → active amplitude mapping. | Implemented in CSS — needs design spec |
| **Mascot animations** | Blink, bob (working state), eye-tracking toward cursor, sleep (idle). | Implemented in CSS — needs design spec |
| **Panel transitions** | Sidebar slide, rail tab switch, drawer push, modal fade. | Implemented — needs design spec for timing/easing |
| **Message streaming** | Text appears word-by-word with cursor. Shimmer for thinking state. | Implemented |
| **Card hover** | Surface cards, tool cards, conversation rows. Lift/shadow/border transitions. | Implemented |

### 12. Color Tokens (for Figma variables)

The design system uses these CSS custom properties. Figma variables should match:

**Light mode:**
| Token | Value | Usage |
|---|---|---|
| `--brand-primary` | `#E8651A` | Buttons, active states, landing accent |
| `--brand-accent` | `#FFB347` | Brand moments, not status |
| `--background` | `#FFFFFF` | Base canvas (auth pages) |
| `--sidebar` | `#FFFBF5` | Sidebar/rail canvas (warm white) |
| `--card` | `#FFFFFF` | Cards, panels, surfaces |
| `--foreground` | `#11171C` | Primary text |
| `--muted-foreground` | `#6F6F6F` | Secondary text |
| `--border` | `#E8ECF0` | Dividers, input borders |
| `--destructive` | `#C8324C` | Errors, delete |
| `--success` | `#2EA65C` | Success states |
| `--warning` | `#D4972A` | Warning states |
| `--info` | `#3B8FF5` | Info states |
| `--session-active` | `#2F7FD4` | Session liveness |

**Dark mode:**
| Token | Value | Usage |
|---|---|---|
| `--brand-primary` | `#F07A30` | Buttons, active states (lightened for dark) |
| `--background` | `#1A1410` | Warm dark canvas |
| `--card` | `rgba(40, 34, 58, 0.6)` | Glassmorphism cards (translucent) |
| `--card-solid` | `#201C30` | Opaque card (composer) |
| `--foreground` | `oklch(0.965 0.003 240)` | Primary text |
| `--border` | `oklch(0.28 0.005 240)` | Dividers |
| `--sidebar` | `rgba(26, 20, 16, 0.75)` | Translucent sidebar |

**Radius scale:**
| Token | Value |
|---|---|
| `--radius` | `0.5rem` (8px) |
| `--radius-sm` | `4.8px` |
| `--radius-md` | `6.4px` |
| `--radius-lg` | `8px` |
| `--radius-xl` | `11.2px` |
| `--radius-2xl` | `14.4px` |

---

## Priority Order

1. **MeowCat mascot** (full character) — needed for app icons, splash, loading states
2. **App icons** (all platforms) — needed for Electron/iOS/Android packaging
3. **Landing screen hero** — first impression, needs designed composition
4. **Surface card icons** (Docs/Images/Videos) — currently using generic Lucide
5. **Empty state illustrations** — currently text-only
6. **Harness/agent type icons** — currently using text badges
7. **Mobile layouts** — verify current responsive behavior matches design intent
8. **Motion specs** — document timing/easing for existing animations

---

## What We Do NOT Need

- A new component library (we use Radix + shadcn)
- A new CSS framework (we use Tailwind v4)
- A new icon set (we use Lucide, just need branded additions)
- A new typography system (we use system UI + Geist Mono)
- Dashboard/data-table designs (this is a chat workspace, not an analytics tool)

---

## Deliverable Format

- **Figma file** with pages for each section above
- **SVG exports** for all icons and illustrations
- **Figma variables** matching the color tokens above (light + dark modes)
- **Component specs** with spacing, sizing, and state variants
- **Motion specs** with timing curves and duration values
