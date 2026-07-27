# Surface Designs — agent-meow Product UI

**Created:** 2026-07-27
**Theme:** ColorFire ember (custom, locked to existing brand)
**Genre:** Modern-minimal (devtool product UI)

## Design DNA

Extracted from existing Figma landing design + codebase tokens:

- **Brand primary:** `#E8651A` (ember)
- **Brand primary hover:** `#D4571A`
- **Background light:** `#FFFBF5` (warm cream) + `cat-wallpaper-tile-light.png` (paw pattern)
- **Background dark:** `#1A1410` (warm dark) + `cat-wallpaper-tile-dark.png` (paw pattern)
- **Border:** `#E8E0D8`
- **Card:** `#FFFFFF`
- **Card foreground:** `#1A1410`
- **Muted foreground:** `#8A7F74`
- **Radius:** `0.5rem`
- **Font:** System sans + Geist Mono
- **Mascot:** `mascot-static.png` (橘宝 cat character)

## Surfaces

### 1. DocsPanel (Document Editor Surface)
- **List view:** Document rows with mascot icon, title, date, version, delete button
- **Editor view:** Tiptap toolbar (bold, italic, heading, lists, quote, code, link), content area, save status
- **Empty state:** Mascot illustration + "暂无文档" + CTA button
- **Background:** Paw pattern (light/dark)

### 2. ImagesPanel (Image Gallery Surface)
- **Gallery grid:** 2-col mobile / 3-col desktop
- **Image cards:** Thumbnail, filename, delete button, "已编辑" badge
- **Upload dropzone:** Drag-and-drop area with hover state
- **Empty state:** Mascot illustration + "暂无图片" + upload CTA
- **Background:** Paw pattern (light/dark)

### 3. VideosPanel (Video Gallery Surface)
- **Gallery grid:** Same layout as Images
- **Video thumbnails:** First-frame preview + duration badge + play overlay
- **Inline player:** Expanded view with controls + close button
- **Empty state:** Mascot illustration + "暂无视频" + upload CTA
- **Background:** Paw pattern (light/dark)

### 4. Chat Surface (In-Conversation UI)
- **Chat header:** 56px bar with sidebar toggle, title, agent picker, host badge, panel toggle
- **Message bubbles:** User vs agent styling with mascot avatars, code blocks, inline images, file chips
- **Tool cards:** Collapsible cards for tool calls (function name, args, output, status)
- **Composer:** Text area with mic button, attach button, send button, agent picker, model picker
- **Background:** Paw pattern (light/dark)

### 5. Settings Page
- **Appearance settings:** Theme (light/dark/auto), font size, compact mode, sidebar visibility
- **Keyboard shortcuts:** Customizable shortcuts with kbd display
- **Archived chats:** List with restore/delete actions
- **Account:** Profile card with edit/logout buttons
- **Background:** Paw pattern (light/dark)
- **Header:** Mascot icon + title

## Design Principles Applied

1. **ColorFire ember accent:** All interactive elements use `#E8651A` for hover/focus/active states
2. **Warm cream background:** Panels sit on `#FFFBF5` canvas
3. **Consistent radius:** `0.5rem` for all cards and buttons
4. **System font stack:** Native UI fonts for readability
5. **Minimal motion:** 150ms transitions, no bounce/overshoot
6. **Accessible contrast:** All text meets WCAG AA standards
7. **Responsive:** Mobile-first, works at 320px / 768px / 1024px / 1440px

## Files

- `DocsPanel.design.html` — Document editor surface
- `ImagesPanel.design.html` — Image gallery surface
- `VideosPanel.design.html` — Video gallery surface
- `ChatSurface.design.html` — In-conversation UI
- `SettingsPage.design.html` — Settings page

## Implementation Notes

These designs are HTML/CSS mockups that can be translated to React components using:
- Tailwind v4 (existing project)
- Radix UI primitives (existing project)
- shadcn/ui components (existing project)
- Lucide icons (existing project)

The existing components (DocsPanel.tsx, ImagesPanel.tsx, VideosPanel.tsx, ChatPage.tsx, SettingsPage.tsx) already implement most of this functionality. The designs above show the intended visual target for alignment.

## Next Steps

1. **Review designs** — Confirm these match the intended product direction
2. **Extract tokens** — Add any missing CSS custom properties to `index.css`
3. **Align components** — Update existing React components to match these designs
4. **Add empty states** — Implement the illustrated empty states
5. **Test accessibility** — Verify all surfaces meet WCAG AA standards

## Brand Reference

- **Figma landing:** https://www.figma.com/design/9YHWJe8FcdTSdcM8dUAQpK/MEOW-Agent--Copy-
- **Brand assets:** `docs/assets/branding/`
- **Current tokens:** `web/src/index.css`
