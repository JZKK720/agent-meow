# agent-meow — Final Architecture, Delivery Surfaces, and Development Plan

**Date:** 2026-07-24 · **Status:** definitive · **Scope:** end-to-end architecture, all delivery surfaces, what's done, what's waiting on you

---

## 1. The One Diagram That Explains Everything

```mermaid
flowchart TB
    subgraph USER["User"]
        U1["Desktop user"]
        U2["Mobile user"]
        U3["Browser user"]
    end

    subgraph SHELLS["Delivery Shells (all share ONE React codebase)"]
        direction LR
        WEB["Web SPA\n(browser tab)"]
        ELC["Electron Desktop\n(web/electron/)"]
        IOS["iOS Shell\n(web/ios/)"]
        AND["Android Shell\n(web/android/)"]
        VSC["VS Code Extension\n(editors/vscode/)"]
    end

    subgraph SERVER["agent-meow Server (FastAPI, Python 3.12)"]
        API["/v1 REST + WebSocket"]
        SPA["Static web-ui mount\n(serves the SPA bundle)"]
        AUTH["Auth: header / OIDC / accounts"]
        POLICY["Policy engine (CEL)"]
        ROUTES["Resource routers:\ndocuments, images, videos,\nfiles, terminals, comments,\nscheduled tasks, projects"]
    end

    subgraph RUNNER["Runner (per-session subprocess)"]
        DISP["tool_dispatch.py\n(22 surface tools + voice)"]
        HARN["Harness adapters:\nclaude, codex, cursor, pi,\nantigravity, qwen, hermes..."]
        MCP["MCP client pool"]
    end

    subgraph EXTERNAL["External tools (user-installed)"]
        HANDY["Handy CLI\n(STT, offline)"]
        VB["Voicebox\n(7 TTS engines)"]
        OFFICE["officecli\n(Office files)"]
        MD["markitdown\n(format conversion)"]
        REMBG["rembg\n(bg removal)"]
        FAL["fal.ai / Pixelle\n(video generation)"]
        A1111["A1111 / ComfyUI\n(image generation)"]
    end

    subgraph SURFACES["3 Workspace Surfaces (rail tabs)"]
        DOCS["Docs\n(DocsPanel + DocEditor)"]
        IMAGES["Images\n(ImagesPanel + ImageEditor)"]
        VIDEOS["Videos\n(VideosPanel)"]
    end

    subgraph COMPOSER["Chat Composer (voice integrated here)"]
        MIC["Mic button + FFT wave band\n(ComposerMicButton)"]
        AUDIO["AudioBlock\n(inline TTS playback)"]
    end

    U1 --> ELC
    U2 --> IOS
    U2 --> AND
    U3 --> WEB
    U1 --> VSC

    ELC -->|"loads server SPA"| SERVER
    IOS -->|"loads server SPA"| SERVER
    AND -->|"loads server SPA"| SERVER
    WEB -->|"served directly"| SPA
    VSC -->|"API only"| API

    SERVER --> RUNNER
    RUNNER --> HARN
    RUNNER --> MCP
    RUNNER --> EXTERNAL
    POLICY --> DISP

    SPA --> SURFACES
    SPA --> COMPOSER
    ROUTES --> SURFACES
```

**Key insight:** All 4 UI shells (Web, Electron, iOS, Android) share the **same React SPA bundle**. The native shells are thin wrappers — they load the server-served SPA in a webview and add a native bridge for OS features (notifications, badge, sidebar drag, safe-area). **Change the web app once → all 4 platforms update on next launch.**

---

## 2. How Each Delivery Surface Works (End-to-End)

### 2.1 Web SPA (the canonical surface)

| Aspect | Detail |
|---|---|
| **Tech** | React 18 + Vite + Tailwind + Radix UI + TanStack Query |
| **Build** | `cd web && npm run build` → `agent_meow/server/static/web-ui/` |
| **Served by** | FastAPI `_SPAStaticFiles` with HTML5-history fallback (any unmatched path → `index.html`) |
| **PWA** | `manifest.webmanifest` + `sw.js` service worker (offline shell caching) |
| **i18n** | EN + ZH-CN, `react-i18next`, auto-detect from browser |
| **State** | Zustand (chat store) + TanStack Query (server data) + per-session localStorage (workspace state) |
| **Editor libs** | Tiptap (docs), Fabric.js (images), xterm.js (terminals), Mermaid (diagrams) |

### 2.2 Electron Desktop (`web/electron/`)

| Aspect | Detail |
|---|---|
| **Bundle ID** | `io.cubecloud.agentmeow.desktop` |
| **Architecture** | Thin wrapper: loads server-served SPA in a `BrowserWindow`; adds native bridge via `preload.js` |
| **Native bridge** | `window.omnigentDesktop` (contextBridge, contextIsolation): `setBadgeCount`, `notify`, `onNotificationClick`, browser pane (`WebContentsView`), design mode, sidebar drag |
| **Server management** | `server_manager.js` — can spawn/stop local `agent-meow server` + `agent-meow host` processes; owns lifecycle |
| **Auto-update** | `electron-updater` + custom `desktop_updater.js` + update overlay UI |
| **Browser pane** | `WebContentsView` embedded browser (for `browser_*` tools); design-mode element picker |
| **Deep links** | `agent-meow://` URL scheme → `deepLink.js` |
| **Setup page** | Bundled `setup/index.html` — "connect to server" form (persisted URL) |

### 2.3 iOS Shell (`web/ios/`)

| Aspect | Detail |
|---|---|
| **Bundle ID** | `io.cubecloud.agentmeow.ios` |
| **Architecture** | SwiftUI shell wrapping `WKWebView`; loads server-served SPA |
| **Native bridge** | `window.omnigentNative` (WKScriptMessage handler `omnigentNative`): sidebar drag, view mode, safe-area insets, keyboard inset |
| **Key Swift files** | `OmnigentWebView.swift` (WKWebView + bridge), `WebShellView.swift` (SwiftUI layout), `ChatTerminalBar.swift` (bottom bar), `ConnectView.swift` (server URL picker), `NativeNotificationManager.swift` |
| **Sidebar gesture** | Left-edge pan recognizer → drives web sidebar as interactive drawer (native back/forward gesture disabled to avoid conflict) |
| **Keyboard** | `AccessoryFreeWebView` — accessory bar-free keyboard; safe-area + soft-keyboard inset bridged to web |
| **Deep links** | Universal links via `DeepLink.swift` |
| **OIDC login** | `SafariView.swift` (ASWebAuthenticationSession) |
| **Prerequisite** | Cubecloud Apple Developer team ID (placeholder `<CUBECLOUD_TEAM_ID>` in signing) |

### 2.4 Android Shell (`web/android/`)

| Aspect | Detail |
|---|---|
| **Package** | `io.cubecloud.agentmeow` (Kotlin sources under `io/cubecloud/agentmeow/`) |
| **Architecture** | Single `WebView` host in `MainActivity`; loads server-served SPA |
| **Native bridge** | `NativeBridgeScript.kt` injects `window.omnigentNative`: notifications, badge (as tray notification — Android has no icon badge), view mode |
| **Key Kotlin files** | `MainActivity.kt` (WebView host), `ConnectActivity.kt` (server URL), `NativeNotificationManager.kt`, `OidcLoginManager.kt`, `OmnigentBridgeListener.kt` |
| **OIDC login** | `OidcLoginManager.kt` (custom tabs) |
| **Insets** | `WindowInsetsCompat` → safe-area + keyboard bridged to web |
| **No sidebar gesture** | Intentionally absent (README notes this) |

### 2.5 VS Code Extension (`editors/vscode/`)

| Aspect | Detail |
|---|---|
| **Architecture** | API-only — talks to server REST, no embedded webview |
| **Published as** | `.vsix` via secure-repo pipeline |
| **Release** | `editors/vscode/PUBLISHING.md` |

---

## 3. The Native Bridge Contract (all shells)

All 4 shells expose the same feature-detected API. The web app's `nativeBridge.ts` detects which shell it's running in and degrades gracefully in a plain browser:

```mermaid
flowchart LR
    subgraph Detection
        DESKTOP["window.omnigentDesktop\n(kind: 'electron')"]
        NATIVE["window.omnigentNative\n(kind: 'ios'|'android')"]
        BROWSER["(neither present)\n→ browser fallback"]
    end

    subgraph Capabilities
        BADGE["setBadgeCount"]
        NOTIFY["notify (OS notification)"]
        SIDEBAR["onSidebarDrag (iOS only)"]
        VIEWMODE["setNativeViewMode"]
        BROWSER_PANE["browser_* tools (Electron only)"]
        DESIGN["designMode (Electron only)"]
    end

    DESKTOP --> BADGE
    DESKTOP --> NOTIFY
    DESKTOP --> BROWSER_PANE
    DESKTOP --> DESIGN
    NATIVE --> BADGE
    NATIVE --> NOTIFY
    NATIVE --> SIDEBAR
    NATIVE --> VIEWMODE
    BROWSER -->|"no-op / false"| BADGE
    BROWSER -->|"Web Notifications API"| NOTIFY
```

---

## 4. What's Done vs What's Waiting

### ✅ Done (Phases 0-4 + docs)

| Area | What landed |
|---|---|
| **Phase 0** | Static bundle verified intact (build `0d204dbe`) |
| **Phase 1** | Tool cards create session + `?surface=` deep-link (3 tests) |
| **Phase 2** | Rail tabs `docs/images/videos` + panels + editors wired |
| **Phase 3** | Backend routers mounted + ORM models + stores (5 tests) |
| **Phase 4** | 22 tool names registered + 4 dispatch functions + CRUD wired + `transcribe_audio` fully wired (47 tests) |
| **Docs** | Roadmap accurate; VIDEOS_SURFACE.md synced; stale plan marked |

### ⏳ Scaffold (detects backend, returns clear error — not yet calling)

| Tool | Backend | What's needed |
|---|---|---|
| `doc_convert` | markitdown CLI | Invoke subprocess, parse stdout |
| `doc_create_office`/`edit_office`/`export` | officecli CLI | Build officecli command from args, invoke subprocess |
| `image_generate`/`edit_ai` | A1111/ComfyUI/hosted API | HTTP POST to provider, download result, upload as resource |
| `image_remove_bg` | rembg CLI | Invoke subprocess on image binary |
| `video_generate` | fal.ai/Pixelle/Happy Horse | HTTP POST + async poll loop, download mp4, upload |
| `text_to_speech`/`speak` | VibeVoice/Voicebox | HTTP POST, return audio URL |

### 🔴 Waiting on YOU (human-in-loop gates)

These are decisions or assets only you can provide:

| # | What | Why it's blocked on you |
|---|---|---|
| 1 | **Commit the static bundle** (493 deleted + 109 new files) | It's build output — needs your decision on whether to commit as one atomic artifact or regenerate clean |
| 2 | **Figma frontend design** | The web UI has a design system (CSS custom properties, Tailwind config, Radix variants) but no Figma source. If you have Figma designs, they should drive the hero sections, icon set, and landing screen layout. The current `NewChatLandingScreen` has a central mic + wave band + 3 surface cards — is this the final design? |
| 3 | **Hero/icons assets** | `mascot-hero.png` exists but may need updating for the Cubecloud/ColorFire rebrand. App icons for Electron/iOS/Android need Cubecloud branding (currently placeholder `<CUBECLOUD_TEAM_ID>` for Apple signing) |
| 4 | **Apple Developer Team ID** | iOS signing requires a real Cubecloud team ID (placeholder in `Info.plist` / Xcode project) |
| 5 | **`cubecloud.io` domain** | Electron/iOS install URLs, privacy pages, and deep-link domains reference `cubecloud.io` — needs to be live |
| 6 | **GHCR images** | `ghcr.io/JZKK720/agent-meow-*` need to be published before deploy templates pull successfully |
| 7 | **Functional keys / keyboard shortcuts** | Current shortcuts: ⌘K (command palette), ⌘⌥V (voice dictation), ⌘⌥[/] (sidebar toggle), ⌘Enter (approve). Do you want additional shortcuts for surface switching (e.g. ⌘1/2/3 for docs/images/videos)? |
| 8 | **End-to-end smoke test** | We've never run the full stack (server + web UI + click card → create session → open rail tab → upload resource → see it in the panel). This needs a running server on your machine — I can start it if you want |

---

## 5. Development Plan (next 2 weeks)

### Week 1: Validate + Wire shell-outs

| Day | Task | Owner |
|---|---|---|
| 1 | **Smoke test**: start server, click Videos card, upload a video, verify it appears. Repeat for Docs + Images. | You (or I can drive it) |
| 2 | Wire `doc_convert` (markitdown) — simplest shell-out, proves the pattern | Agent |
| 3 | Wire `text_to_speech` (VibeVoice/Voicebox HTTP) — high value, medium effort | Agent |
| 4 | Wire `image_remove_bg` (rembg subprocess) — simple, proves image shell-out | Agent |
| 5 | Wire `video_generate` (fal.ai async poll) — highest value, most complex | Agent |

### Week 2: Polish + ship

| Day | Task | Owner |
|---|---|---|
| 6 | Wire `image_generate` + `image_edit_ai` (A1111/ComfyUI HTTP) | Agent |
| 7 | Wire `doc_create_office`/`edit_office`/`export` (officecli subprocess) | Agent |
| 8 | Fix 2 pre-existing type errors (`MeowCatEyes`, `ComposerMicButton className`) | Agent |
| 9 | Sync `DOCS_SURFACE.md` + `IMAGES_SURFACE.md` (same as VIDEOS fix) | Agent |
| 10 | Full test suite: `pytest`, `ruff`, `mypy`, `npm run type-check`, `npm test` | Agent |
| 11 | Commit static bundle + all code changes (DCO sign-off) | You |
| 12 | Tag release | You |

---

## 6. The 3 Workspace Surfaces — Functional End-to-End

```mermaid
flowchart LR
    subgraph Card["Landing Screen"]
        C1["📄 Docs card"]
        C2["🖼️ Images card"]
        C3["🎬 Videos card"]
    end

    subgraph Flow["Session Flow"]
        CREATE["createSessionForSurface()"]
        NAV["navigate /c/<id>?surface=<name>"]
        SHELL["AppShell reads ?surface="]
        TAB["setRightRailTab('docs'|'images'|'videos')"]
        PANEL["Panel renders in rail"]
    end

    subgraph Backend["Backend"]
        REST["REST /v1/sessions/<id>/resources/<type>"]
        STORE["SQL store\n(DocumentStore/ImageStore/VideoStore)"]
        ARTIFACT["ArtifactStore\n(binary blobs)"]
    end

    subgraph Agent["Agent Tools (runner dispatch)"]
        TOOLS["doc_list / image_list / video_list\n→ proxy to REST"]
        GEN["doc_generate / image_generate / video_generate\n→ external provider"]
    end

    C1 --> CREATE
    C2 --> CREATE
    C3 --> CREATE
    CREATE --> NAV
    NAV --> SHELL
    SHELL --> TAB
    TAB --> PANEL
    PANEL -->|"fetch list"| REST
    REST --> STORE
    REST --> ARTIFACT
    TOOLS --> REST
    GEN -->|"scaffold: resolves provider,\nreturns clear error"| EXTERNAL["external CLI/API"]
```

**Voice is NOT here** — it's in the chat composer (mic button + wave band for STT, AudioBlock for TTS). See §3.8 of the roadmap.

---

## 7. What I Need From You Right Now

1. **Can I start the server and run the smoke test?** (I'll start `meow server`, open the browser, click the cards, upload a file — proves the full stack works)
2. **Do you have Figma designs?** If yes, share them and I'll align the hero/icons/landing layout. If no, the current design (central mic + wave band + 3 cards) is what ships.
3. **Should I wire the shell-out tools next?** (doc_convert, text_to_speech, image_remove_bg, video_generate — in that priority order)
4. **Any additional keyboard shortcuts?** (e.g. ⌘1/2/3 for surface switching)
