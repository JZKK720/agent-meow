# RESEARCH PLAN 040 — Unified Singleton Workspace (主页/聊天页一体化)

**Date**: 2026-08-31
**Status**: Research complete · decisions locked (v3) — design-skill review + client decisions 1–6 folded in; ready to draft plan.md/tasks.md
**Branch context**: researched on `feat/039-file-index-phase0` (read-only analysis; no code changed)

> **Client decisions (2026-08-31, v3 of this doc)**: (1) mic docks beside the composer
> permanently, Doubao-style; hero + mascot become generic GIFs/animations; (2) suggestions are
> purely skill-driven and fade out during prompting; (3) **HARD RULE: Edge-TTS is always
> primary, Qwen3-TTS is offline fallback only**; (4) `/design-home` gets deleted once Phase 2
> bricks land — no new Figma review page is needed (§6.4); (5) **paw-mic + wake-word chip
> merge into ONE button**; (6) **dictation + read-aloud merge into ONE speech chip** (spec:
> §6.5). Design-skill review (hallmark, taste, polish, UI-engineering, baseline) is in §5
> and binds every phase.

---

## 0. Executive Summary

The client wants **one unified workspace page**: front-page (landing) and chat-page become a
single mounted page; the landing hero (greeting, paw-mic voice board, docs/image/video bricks,
suggestion templates) is pure TSX/CSS that **collapses and disappears when a session begins**,
instead of navigating `/` → `/c/:id` (today's visible sub-page jump).

Research covered: (a) external design methodologies — Doubao desktop, Tencent WorkBuddy,
openai/codex TUI, deepseek-ai/deepseek-harness; (b) a deep-dive of our own frontend + voice
pipeline. **Verdict: fully feasible with the current architecture.** The route table already
keeps `ChatPage` mounted across `/` ↔ `/c/:id` (both render the same component; state lives in
the module-scope zustand `chatStore`). The jump the client sees is a **subtree swap**
(`<NewChatLandingScreen/>` unmount → `<SessionLayout/>` mount), not a remount — so unifying is
a render-tree refactor, not a router rewrite. The voice pipeline's worst defect (G2: VAD
re-listen on landing→chat transition) is *caused by* this split and gets fixed structurally by
the unification.

The plan below is phased so each phase ships green (tests + build) and can stop at a clean
boundary.

---

## 1. External Research Findings

### 1.1 Doubao (豆包) desktop — what to inherit

Sources: zhihu teardown p/701712367 (深度测评：豆包全新网页版、桌面版和插件), QQ阅读《豆包实用全攻略》§1.3, doubao.com/download/desktop, apps.microsoft.com listing, uinotes.com/app/204559027813609841 (485 screenshots).

| Doubao pattern | Detail | How we adopt it |
|---|---|---|
| **Capability strip above the input box** | Web/desktop home puts a row of core-function keys (AI写作、图像生成、AI搜索、文件总结、翻译、网页总结) **above the composer**, each with inline usage guidance + preset feature words | Our `图片生成/视频生成/文档生成` bricks move into a persistent strip docked above the unified composer — visible on landing, collapse to icons in-session |
| **First-screen 3 core cards + hot-word suggestions** | Empty state shows 3 big capability cards (AI搜索/文件总结/图片生成) plus recommended hot prompts | Matches our Figma `DesignHome` CARDS block (already reproduced); add a suggestion-template row (localized, from skills + curated prompts) |
| **Sidebar tripartite** | 会话区 / 智能体区 / 个人设置 — sessions and agents separated after the 2024 redesign ("以前智能体和会话混在一起，不利于查找") | Our `Sidebar` already groups sessions by project; add the agent/skills seat at sidebar foot (where `sidebar.settings` slot region is) |
| **`/` and `@` inline invocation** | Agents invocable by typing `/` or `@` in the input | We already have `SlashCommandMenu` + `FileMentionMenu` — keep, surface in unified composer |
| Voice input button beside composer + full voice mode | Mic button right of chat box for dictation; separate "打电话" (phone-call) button above composer for a sustained voice conversation | **Client decision: adopt the always-beside-composer placement.** The paw-mic (sustained voice session) becomes a permanent 44px control in the unified composer footer on BOTH landing and session states — the hero VoiceBoard card shrinks to a compact inline state and the big card is retired. **Doubao ships exactly two audio controls (dictation mic + phone-call voice) — the merged two-control footer cluster (§6.5) mirrors this validated model** |
| **Desktop-native integration** | Launcher hotkey summon, AI划词, 常驻桌面 (always-resident) | Already partially present (Electron shell, global hotkey work in memory); out of scope for 040 but noted |
| **2026 desktop "工作任务模式"** | Skills invocation, scheduled tasks, built-in Office suite, Seedream/Seedance gen, autonomous agent | Confirms skills (SlashCommandMenu/SkillPills) + content bricks as first-class home-surface citizens |

**Doubao's transition model**: the empty state and chat state are the **same page**; capability
cards fade out as conversation content appears. This is precisely the client's ask.

### 1.2 Tencent WorkBuddy — what to inherit

Sources: copilot.tencent.com/work (official), diyiwuyan.github.io/workbuddy-orange-book (59-page community guide), jxxy.net workstation tutorial, zhihu p/2067758857284276477.

WorkBuddy is Tencent's "全场景 AI Agent 办公工作台". Five core capability pillars: **Skill（技能）,
专家中心, 记忆系统, Automation, 连接器** — plus 助理 and **多工作区 (multi-workspace)**.

| WorkBuddy pattern | How we adopt it |
|---|---|
| **Workspace-first entry** — every task starts by choosing/creating a 工作空间, then model, then task | Our workspace selection currently lives in the landing's advanced tray. Make the workspace identity a **persistent chip** in the unified composer footer (visible on landing, icon-only in session) — matches DesignHome's context-chip row (主机/工作目录/工作区/Harness) |
| **Task template library** (提示词模板库) as the home surface | Suggestion templates on landing = curated prompt templates + installed skills (SkillPills already render the skill half) |
| **7-step standard workflow, deliverable-oriented** (需求 → 交付, finished verifiable outputs) | Matches our runner/task model; bricks (图片/视频/文档) should map to **task intents** that pre-fill the composer with a template, not navigate anywhere |
| **One digital desktop, no app switching** ("数字桌面，把常用的东西都摆在一个屏幕里") | The core methodology quote for this overhaul |

### 1.3 openai/codex (Rust TUI) — what to inherit

Sources: codex-rs/tui/src/{startup_draft.rs, bottom_pane/mod.rs, chatwidget/input_flow.rs, keymap.rs, resume_picker.rs}.

| Codex pattern | Detail | How we adopt it |
|---|---|---|
| **StartupDraft** | The composer renders **before any session exists**; the draft (text, cursor, pending pastes) is captured as `ComposerDraftSnapshot` and carried into the real session | This is the exact mechanism the unified page needs: the landing composer *is* the chat composer; when the first turn creates a session, the draft snapshot transfers losslessly instead of via today's `landingDraft` module singleton |
| **Input queueing** | `queue_user_message` + `set_queue_submissions_until_session_configured`: input submitted while the session is still being configured is **queued and flushed the moment the session is ready** | Replaces our `pendingInitialPrompt` stash in chatStore (:855–:888) with a first-class queue visible in the UI ("Starting session… your message is queued") |
| **BottomPane owns the composer permanently** | The composer is *retained* even when overlays replace its view — input state never resets | Unified composer = one component instance across landing and session; only the hero above it changes |
| **Alt-screen overlays, not routes** | Session picker / onboarding are overlays over the same TUI, never a "page change" | Settings already renders into the chat outlet; keep overlays-over-one-page as the rule for every new surface |

### 1.4 deepseek-ai/deepseek-harness — what to inherit

Sources: packages/client/{ui-layout, ui-slots, ui-renderer, ui-conversation, ui-skill, ui-sidebar, ui-settings-plugins}, .agents/notes architecture notes.

| DSH pattern | Detail | How we adopt it |
|---|---|---|
| **Three-column AppFrame** | sidebar \| conversation \| details, resizable; **concession chain**: when space runs out the details column shrinks first, then auto-closes; closed sidebar keeps a 56px control rail | Mirrors our AppShell (sidebar + chat outlet + right Workspace rail). Adopt the concession chain for the right rail on narrow windows, and keep the rail geometry *transient* (not in URL) |
| **Slot system** | Typed `SlotMap` + `slots.register/inject`; features compose into declared slots; per-entry error boundaries | We don't need Cordis, but the *discipline* does: the unified hero should be a slot-ledger (each brick registers itself) rather than hardcoded JSX, so bricks can disappear/reappear without touching the page owner |
| **Feature = plugin, conversation = event replay** | ui-conversation assembles from session events; per-session active view dissolved into the session store | Confirms our chatStore-event-replay approach; the landing hero state (`isSessionActive` derived, not routed) follows the same rule |
| **Tabs that stay mounted** | Settings tabs mount on first visit then stay mounted (hidden) so drafts survive switches | The unified hero should *collapse* (height animate to 0, then unmount) rather than hard-swap, so the browser can restore it instantly on "new chat" |

---

## 2. Current-State Deep-Dive (our codebase)

### 2.1 Route / page architecture

- `web/src/App.tsx`: `/` and `/c/:conversationId` **both render `<ChatPage/>`** inside
  `<AppShell/>`. Comment (:66–:75) documents that ChatPage stays mounted across the transition
  and `chatStore.switchTo()` mirrors the URL — the hard part of unification is already done.
- `ChatPage.tsx:1244`: `if (!urlConvId) return <NewChatLandingScreen/>;` — **the entire landing
  is an early-return subtree swap**. This is the exact line the client experiences as "jumping
  to a different chatpage": full subtree unmount/mount, scroll reset, visual flash, voice
  widgets re-created.
- `NewChatLandingScreen` lives in `web/src/shell/NewChatDialog.tsx:1875` — a ~4,100-line module
  containing the landing screen, agent/host/sandbox pickers, and ~30 exported helpers that
  `ForkSessionDialog` / `ResumeWithDirectoryDialog` / ChatPage also import. **God-module**;
  unification must extract, not duplicate.
- First-message handoff today: `chatStore.ts:855–:888` — `landingDraft` module singleton +
  `pendingInitialPrompt` map keyed by conversation id; ChatPage auto-sends (:857). Fragile:
  keyed stashes, re-fire guards, `submittedRef` cleanup.
- Session creation UX: type → Enter → `handleCreate()` POSTs the session → `navigate(/c/${id})`
  (NewChatDialog:3299/:3496). Voice adds a second auto-navigate (:2266) as soon as the assistant
  transcript starts — during which **the VAD is torn down and re-created** (see 2.3 G2).
- Other route jumps in normal flow: `/settings` (in-outlet, OK), `/inbox`, `/approve/...` (rare).

### 2.2 Landing hero inventory (what must become TSX/CSS bricks)

From `NewChatDialog.tsx` (:3540–:4100) and `DesignHome.tsx`:

| Element | Today | Target (post-decision) |
|---|---|---|
| Greeting + mascot (`MeowCatMascot`, "喊一声，橘宝橘宝！" in Figma) | inline SVG component in landing | `<HeroGreeting/>` brick — **client decision: mascot/greeting art becomes a generic GIF/Lottie-style animation asset**, not a bespoke SVG illustration and not the baked Figma PNGs |
| Paw-mic voice card (wave bands, glow, phase label Start/Stop/处理中/播报中, `VoiceWaveBand`) | inline hero card, ~150 lines | **Client decisions #1 + #5 (Doubao pattern): merges with the wake-word chip into ONE `VoicePawButton` in the unified composer footer permanently** — present on landing AND in-session, beside the send/attach buttons; wave bands + phase chip render as a compact inline strip beside it while a voice session is active; the hero voice *card* is retired (§6.5) |
| Wake-word chip | inline in hero card | **deleted** — folds into the paw button as a mode (long-press arms `wake`; decision #5) |
| Capability cards 图片生成/视频生成/文档生成 | **only in `DesignHome`** (Figma mock, `/design-home` route, baked PNGs) | `<CapabilityBricks/>` — rebuild in TSX/CSS (no baked PNGs), wire to task-intent templates |
| Suggestion templates | `SkillPills` only (skill suggestions) | **Client decision: purely skill-driven** — extend `SkillPills`, no curated static lists; fade to zero as the user types and fade out entirely in-session |
| Context chips (主机/工作目录/工作区/Harness) | advanced tray (`showSelectorTray`) | persistent composer-footer chips (WorkBuddy pattern) |
| FirstBootChecklist | inline | brick |
| Agent/host/sandbox/worktree pickers | inline, ~1,500 lines | extracted `<SessionConfigSheet/>` (modal/popover — reused by Fork dialogs) |

### 2.3 Voice pipeline — bottlenecks & state-machine gaps

Latency profile (audits, memories `voice-pipeline-perf-audit-2026-08-29` +
`voice-pipeline-complete-root-cause-2026-08-29`):

| Stage | Warm | Target | Verdict |
|---|---|---|---|
| STT (whisper.cpp) | 0.5–2s real speech (3–10s on synthetic/hallucination) | <0.5s | **bottleneck #1** |
| LLM (Ollama 30B via Hermes) | 1.4–2s | — | OK |
| TTS Edge (cloud) | 2–4s, intermittent `NoAudioReceived` | <0.5s | **bottleneck #2** — unreliable |
| TTS Qwen3 (local Vulkan) | 0.7–1.2s | <2s | OK, reliable |
| Full pipeline | 7.9–11s | <3s | driven by Edge + STT |

State-machine gaps (memory `voice-state-machine-gap-analysis-2026-08-31`, verified still true):
- **G2 (worst, fixed only structurally by this plan): landing→chat transition re-listens** —
  `NewChatDialog` auto-navigates on assistantTranscript; the landing subtree unmounts, the VAD
  is destroyed, ChatPage's Composer re-connects → mic re-acquired mid-turn. Session *id*
  survives (hermesVoice singleton), mic/VAD do not.
- G1: no single listening mutex — paw-mic + dictation mic + wake-word can hold 2 concurrent
  `getUserMedia` streams; gating is scattered boolean expressions
  (NewChatDialog:2193–2210, ChatPage Composer).
- G3: no unified ASR-OFF signal during Processing/Speaking (VAD capture continues; only
  `onSpeechEnd` is gated — hermesVoice.ts:792).
- G4: no explicit `speaking` enum value; state is implicit across `isProcessing` +
  `ttsPlaying` + `isAudioPlaying` + `readAloudState`.
- G5: `interrupt()` does not transition back to Listening (VAD stays paused).
- UI duplication: paw-mic card + status + wake-word in NewChatDialog **and** mic/Hermes
  fallback in ChatPage's Composer (:4309–:4340, with its own copy of the transcript effect and
  voiceCommand auto-submit — comments literally say "This mirrors NewChatDialog's … without
  it, …"). Dictation-active sync needs two reset hacks (:2198–:2205).

### 2.4 Syntax/typing debt relevant to this overhaul

- `NewChatDialog.tsx` ~4,100 lines / `ChatPage.tsx` ~5,700+ lines — both need decomposition
  before adding more surface (extracting the hero + composer is *part of the fix*).
- Test suites coupling: `NewChatDialog.test.tsx`, `NewChatDialog.flow.test.tsx`,
  `NewChatDialog.projectPrefill.test.tsx`, `ChatPage.composer.test.tsx`,
  `Sidebar.*.test.tsx` (mount `/` and `/c/:id` routes), `useRealtimeVoice.test.ts` — all must
  stay green or be updated in-phase (never left red).
- PowerShell BOM trap (memory): use `[System.IO.File]::WriteAllText` with UTF8 no-BOM for any
  batch .ts/.tsx string edits. Terminal degrades after ~15 commands — use .bat files for
  builds (`build-039.bat` pattern).
- Repo policy: every behavior change ships with a colocated vitest test; UI flows also need
  `tests/e2e_ui/` Playwright coverage (CI-enforced `E2E UI Required`).

---

## 3. Target Architecture — Unified Singleton Workspace

### 3.1 Shape

```
AppShell
├─ Sidebar (unchanged: projects/sessions; + agent/skill seat at foot per Doubao)
└─ UnifiedWorkPage  ← single mounted page; route / and /c/:id differ ONLY in chatStore state
   ├─ <WorkspaceHero/>        mounts when !activeSession  (bricks: greeting,
   │                          CapabilityBricks, SkillPills, FirstBootChecklist — voice
   │                          controls live in the composer, not the hero)
   │    · collapse: 200ms compositor-only animation (scale/translate + opacity — never
   │      `height`, per §5.1 baseline-ui) → unmount (DSH stay-mounted spirit: keep a
   │      "new chat" affordance so it can restore instantly)
   ├─ <TranscriptStream/>      mounts when activeSession (existing TurnRail/bubbles)
   ├─ <UnifiedComposer/>       ALWAYS mounted (Codex BottomPane discipline):
   │    · footer chips: workspace/host/agent/model (landing: full tray; session: icons)
   │    · SlashCommandMenu + FileMentionMenu (unchanged)
   │    · voice cluster = TWO merged controls (§6.5): VoicePawButton (sustained voice
   │      session + wake-word, one button) + ComposerSpeechChip (dictation + read-aloud
   │      state); single source: one useRealtimeVoice instance + the shared audio engine
   │    · session-create flow = queue-then-flush (Codex): submit → optimistic user bubble
   │      → POST /sessions → bind → flush queued turn; no navigate(), no subtree swap
   └─ right Workspace rail (unchanged; DSH concession chain added in a later phase)
```

### 3.2 Key design decisions

1. **No route change on session start.** `handleCreate()` keeps `navigate(/c/:id})` ONLY as a
   `replace` history write for deep-link/shareability — but since both routes render the same
   component, React will not remount anything; the hero collapse is a store-driven animation.
   (Verify: `chatStore.switchTo()` already mirrors URL→store; add store→URL replace write.)
2. **Hero = slot ledger, not hardcoded JSX** (DSH pattern): a tiny `heroSlots` registry where
   each brick registers `{id, order, render}`; the page renders sorted entries. Bricks are
   pure TSX/CSS (no baked PNGs — rebuild DesignHome's look with SVG/Tailwind; the Figma assets
   stay for reference only).
3. **Composer is never unmounted** — the single instance spans landing→session, which
   *structurally deletes* voice-gap G2 (no VAD teardown at transition) and deletes the
   `pendingInitialPrompt` stash + both "mirrors NewChatDialog" effect copies.
4. **Voice state machine (fixes G1/G3/G4/G5):** one `VoicePhase` enum
   (`idle|wake|listening|processing|speaking`) owned by hermesVoice with a single mic mutex; VAD
   capture is paused (not just gated) during `processing|speaking`; `interrupt()` transitions
   to `listening`. **Both merged voice controls render from this one enum** (§6.5): the
   `VoicePawButton` (session + wake-word in one button) lives in the composer footer
   permanently — it never unmounts with the hero.
5. **TTS engine — HARD RULE (client decision, supersedes the earlier Qwen3-primary proposal):**
   Edge-TTS is **always primary**; Qwen3-TTS is an **offline fallback only**. The Phase-3
   latency work therefore targets the Edge path (keep-alive/warm auth, sentence-level
   pipelining so synthesis of sentence N+1 overlaps playback of N, retry-before-fallback as
   already shipped) rather than switching engines. This matches the existing config seam
   (`tts-voice-config-edge-primary-2026-08-29` memory).
6. **Capability bricks → task intents:** each brick pre-fills the composer with a localized
   template (e.g. 文档生成 → "帮我生成一份关于…的文档") and focuses it — WorkBuddy's
   template-library methodology; no navigation, no new routes.

### 3.3 What explicitly does NOT change

Sidebar, right rail (Files/Images/Videos/Terminals/Voice/Subagents/Workspace panels),
`/settings` in-outlet behavior, Fork/Resume dialogs (they import extracted helpers — path
changes only), Electron shell, backend routes.

---

## 4. Phased Implementation Plan (each phase ships green)

### Phase 0 — Extract & stabilize (refactor-only, zero behavior change)
- Extract from `NewChatDialog.tsx`: `VoiceBoard` (paw card + waves + wake chip + status),
  `SessionConfigSheet` (agent/host/sandbox/worktree pickers), `heroBricks` constants.
- Extract from `ChatPage.tsx`: `UnifiedComposer` (already ~:4211 ComposerProps block).
- Keep both pages rendering the extracted components — **no visual change**.
- Update imports in ForkSessionDialog / ResumeWithDirectoryDialog / SlashCommandMenu tests.
- Tests: move/keep NewChatDialog.*.test.tsx green against extracted modules; tsc -b clean; SPA build via .bat.

### Phase 1 — UnifiedWorkPage skeleton (the unification itself)
- New `web/src/pages/UnifiedWorkPage.tsx` (or evolve ChatPage in place): hero + stream +
  always-mounted composer per §3.1. Route table unchanged (`/` and `/c/:id` → same component).
- Implement hero collapse animation; `isSessionActive` derived from chatStore, not URL.
- Codex queue: replace `pendingInitialPrompt` stash with in-composer queue + optimistic bubble;
  session create no longer unmounts anything.
- Voice: single `useRealtimeVoice` consumer (the composer); delete the auto-navigate effect
  (NewChatDialog:2257–:2275) and ChatPage's mirrored transcript/command effects. The footer
  voice cluster lands in the merged two-control shape (§6.5): `VoicePawButton` +
  `ComposerSpeechChip`.
- Tests: new `UnifiedWorkPage.test.tsx` covering landing→session in-place transition,
  draft preservation across create, queued-turn flush; update Sidebar route-mount tests;
  e2e_ui: "start session from landing without page jump".

### Phase 2 — Hero bricks & Doubao/WorkBuddy surfaces
- `<CapabilityBricks/>` in TSX/CSS reproducing DesignHome cards (image/video/doc), wired to
  composer templates; **suggestion row stays purely skill-driven** (extend `SkillPills`:
  fade-to-zero opacity as the draft grows, fully hidden in-session) — no curated static
  template lists, per client decision.
- `<HeroGreeting/>` with a **generic GIF/Lottie-style animated mascot asset** (replaces both
  the bespoke SVG and the baked Figma PNGs).
- **Merged voice controls dock into the composer footer permanently** (landing AND session,
  decisions #1 + #5 + #6, spec §6.5): `VoicePawButton` (sustained session + wake-word in one
  button) with the compact wave strip beside it while live, and `ComposerSpeechChip`
  (dictation + read-aloud state). The old hero voice card AND the standalone wake-word chip
  are retired after parity checks; the per-message read-aloud hover entry stays.
- Workspace/host/agent chips persistent in composer footer (context-chip row from Figma).
- Sidebar: agent/skill seat at foot (Doubao tripartite).
- **Delete `/design-home` + `DesignHome.tsx` + `figma-assets/`** in this phase's final commit
  (client-approved; see §8.4 — the unified page is the live review surface).
- Tests: brick render/interaction unit tests; i18n keys; e2e_ui brick→template→send flow.

### Phase 3 — Voice state machine & latency (G1/G3/G4/G5 + Edge-primary hard rule)
- `VoicePhase` enum (`idle|wake|listening|processing|speaking`) + mic mutex in hermesVoice;
  ASR-off during processing/speaking; interrupt→listening; both merged controls render from
  the single enum (§6.5) — `VoicePawButton` owns wake/session phases, `ComposerSpeechChip`
  owns dictation/read-aloud state via the shared `readAloudAudio` engine.
- **TTS: hard rule enforced** — Edge-TTS primary, Qwen3-TTS offline fallback only. Latency
  work targets the Edge path: connection warm-up/keep-alive, sentence pipelining (synthesize
  N+1 while N plays), retry-before-fallback (already shipped) — never an engine switch.
- STT: keep whisper.cpp; profile real-speech STT budget; only optimize if >0.5s real-speech
  (synthetic-tone numbers are hallucination-skewed per memory).
- Tests: extend `useRealtimeVoice.test.ts` for phase transitions/mutex/interrupt; add
  hermesVoice unit tests for phase machine; voice e2e smoke per repo voice-test plan.

### Phase 4 — Right-rail concession chain + polish (optional boundary)
- DSH-style resize concession for the Workspace rail on narrow widths; 56px rail fallback.
- Hero restore on "new chat" with stay-mounted fast path; keyboard shortcuts (Ctrl+K new chat
  — Doubao pattern).
- Full audit: ruff, mypy, vitest, tsc, SPA build, Playwright e2e_ui, PR demo video/images.

### Sequencing & risk
- Phases 0→1 are the client's core ask (no-jump unified page + voice G2 fix). 2→3 complete
  the vision (bricks + state machine). 4 is polish.
- Biggest risks: (a) NewChatDialog extraction breaking Fork/Resume dialogs — mitigated by
  Phase 0 being import-path-only; (b) voice regressions — mitigated by phase-gated tests and
  the fact that unification *removes* the transition code where G2 lived; (c) landing SEO/deep
  links — preserved via replace-URL write (§3.2.1).
- ~~Open questions~~ → **resolved in §6 (client decisions locked 2026-08-31).**

## 5. Design-Skill Review (binding for every phase)

The client asked to implement under the design-engineering skills. Reviewed: **hallmark**,
**design-taste-frontend (taste-skill)**, **make-interfaces-feel-better**, **frontend-ui-engineering**,
and **baseline-ui**. This is an *in-product redesign* inside an existing design system, so the
rules that bind are the in-place/redesign disciplines, not the greenfield-page apparatus.

### 5.1 Which skill owns what

| Skill | Governs in this plan |
|---|---|
| **hallmark** (`redesign` verb discipline) | Implementation-safety rail: in-place edits + additive components only; **deletions need explicit client confirmation** (given only for `/design-home`, §8.4); before each phase, state the exact files to create/modify/delete. Pre-emit self-critique stamp on every phase boundary (P/H/E/S/R/V, any <3 → revise). Pre-flight scan: preserve agent-meow's existing tokens (`--border`, `--foreground`, `brand-primary` ember palette, `bg-card` glass rules), fonts, motion stance (CSS transitions, no framer-motion dep). |
| **design-taste-frontend** | Brief-read discipline + the hard anti-default rules: serif is NOT the default voice (Inter/SF Pro stays); the premium-consumer beige+brass palette ban (we're ember/cream — already compliant); hero stack discipline (greeting is ≤4 text elements — mascot + one-line greeting only); **eyebrow restraint** (no uppercase tracking labels above every brick — max 1 per 3 sections); eyebrow/tagline stacking ban in the hero; shape-consistency lock (one corner-radius scale — our `rounded-2xl` composer/brick system, concentric radius per polish skill); **motion must be motivated** (each animation names its purpose: hero collapse = state-transition feedback, suggestion fade = hierarchy; no ambient looping except voice wave which communicates live state). Copy self-audit on every visible string, both locales (zh/en). |
| **make-interfaces-feel-better** | The polish checklist applied at every phase boundary: concentric radii (brick radius vs composer radius + padding); optical centering of the paw icon (SVG paw is asymmetric — nudge, per the existing `-translate-y-1`); `text-wrap: balance` on greeting headline, `pretty` on descriptions; `tabular-nums` on any counters (queue badge, latency chips); **transition-property whitelists, never `transition: all`** (the landing already uses `transition-[border-color,box-shadow]` — keep that discipline); exit transitions shorter than enter (hero collapse 200ms out vs 250ms in); tactile `active:scale` on paw/send; 44px hit areas for mic/paw/send (footer is dense — expand with pseudo-elements, no overlap); reduced-motion respected (existing `prefers-reduced-motion` seams). |
| **frontend-ui-engineering** | Component architecture: colocated `*.test.tsx`; composition over config; container/presentation split for bricks; **separate data fetching from presentation** (bricks read hooks, render pure); state ladder (hero visibility = derived store state, NOT new global state; queue = chatStore; voice phase = hermesVoice singleton); no prop drilling >3 levels; WCAG AA — the mic/paw are icon-only → `aria-label` + `aria-pressed` (already present — keep); focus management on hero collapse (focus must move to composer, not get lost when the greeting unmounts); **skeleton loaders, never spinners, for content surfaces** (queue flush shows an optimistic bubble, not a spinner); responsive verified 320/768/1024/1440; components ≤200 lines (Phase 0 exists to enforce this). Red flags to avoid: inline pixel values (use the spacing scale), color-only state indicators (voice phases pair icon+text label — already the pattern), generic AI look (no purple gradients — ember stays the single accent). |
| **baseline-ui** | The hard MUST/NEVER list for the diffs: accessible primitives only (Radix/shadcn — already the stack); `h-dvh` not `h-screen` (hero region must switch — Electron window sizing); `never transition: all`; animate only compositor props (`transform`, `opacity` — **the hero collapse must animate `transform: scaleY/translate` + opacity, NOT `height`**, which is a layout property; use measured-collapse via grid-template-rows or scale+fade, 200ms cap); interaction feedback ≤200ms; looping animations pause off-screen (voice wave only mounts while a session is live); `text-balance`/`text-pretty`; fixed z-scale (no arbitrary `z-[37]`); one accent per view (ember); empty states get one clear action (no-session state's action = "start talking or typing" — satisfied by composer permanence); existing tokens before new ones. |

### 5.2 The five design directives distilled for this codebase

1. **Preserve the design system, change the structure.** We inherit agent-meow's ember palette,
   glass cards, radius scale, and i18n. Nothing in this plan introduces a new palette, font, or
   corner-radius scale. Doubao/WorkBuddy contribute *layout methodology* (capability strip,
   persistent mic, workspace chips), not visual language.
2. **The composer is the product; the hero is a state, not a page.** Every skill converges here:
   the always-mounted composer is the single interactive anchor (Codex BottomPane), and the
   hero renders as a collapsible region around it (DSH stay-mounted, 200ms compositor-only
   animation).
3. **Motion budget: 3 motivated animations.** (a) hero collapse on session start (state
   transition), (b) suggestion pills fade on typing (hierarchy), (c) voice wave while live
   (live-state feedback). Everything else is static. No ambient loops, no scroll hijacks — this
   is a workbench, not a landing page (taste-skill: workbench density, not marketing motion).
4. **Accessibility is part of the architecture, not a pass.** Voice phases carry text labels;
   icon-only controls carry `aria-label`/`aria-pressed`; focus moves into the composer when the
   hero collapses; the whole flow is operable by keyboard (Tab order: chips → textarea → mic →
   paw → send), verified in e2e_ui.
5. **Every phase ends with the checks, not starts with them.** tsc -b + oxlint + vitest +
   320/768/1024/1440 screenshot pass + copy self-audit (zh+en) + hallmark self-critique stamp
   in the phase's commit message.

## 6. Locked client decisions (supersedes the old §4 open questions)

| # | Question (old §4) | Decision | Plan impact |
|---|---|---|---|
| 1 | Paw-mic in-session placement | **Doubao pattern: mic beside the composer always** — paw-mic + wake-word chip dock into the composer footer permanently (landing and session). Hero + mascot become **generic GIFs/animations** (no bespoke SVG art, no baked Figma PNGs). | §3.1 composer footer voice cluster; Phase 1 moves the control, Phase 2 swaps hero art to animated assets; VoiceBoard hero card retired — refined by decision #5: the chip merges INTO the paw button |
| 2 | Suggestion templates source | **Purely skill-driven** (extend `SkillPills`), no curated static lists; pills **fade as the user types and fade out entirely once in a session**. | Phase 2: SkillPills fade behavior + in-session hide; no templates/i18n catalog work |
| 3 | TTS engine policy | **HARD RULE: Edge-TTS is always primary; Qwen3-TTS is offline fallback only.** | Phase 3 targets Edge-path latency (warm-up/keep-alive, sentence pipelining, retry-before-fallback) — engine switch is permanently off the table; the existing `tts-fallback-edge-to-qwen-2026-08-26` + retry seams are the base |
| 4 | `/design-home` fate | **Delete once Phase 2 bricks land.** The unified page becomes the live review surface — **no replacement Figma review page is needed** (rationale below). | Phase 2 final commit removes `DesignHome.tsx`, `design-home-entry.tsx`, the `/design-home` route, and `figma-assets/` |
| 5 | Paw-mic + wake-word chip as two controls | **Merge into ONE paw button.** Same underlying resource (the hermesVoice VAD session), so one button renders one state machine: `VoicePhase: idle\|wake\|listening\|processing\|speaking`. Click toggles the session; long-press (desktop: also right-click) arms wake-word. Full spec §6.5. | Standalone wake-word chip deleted; footer voice cluster = 2 controls total; `VoicePhase` gains a `wake` state (Phase 3); G1 mic-mutex simplifies to one VAD entry point |
| 6 | Dictation + read-aloud as separate controls | **Merge into ONE speech chip** sharing the already-unified audio engine (`readAloudAudio.ts`): idle→click dictates; audio playing→click stops/pauses. Read-aloud *starts* stay per-message hover actions (they carry the target). Full spec §6.5. | `ComposerMicButton` + read-aloud indicator unify as `ComposerSpeechChip`; per-message read entry retained (older messages stay readable); separate per-message stop button dropped (chip owns stop) |

### 6.4 Why no new Figma review page is needed (decision #4 rationale)

The old `/design-home` existed because the Figma design had **no implementation** — a mock
needed a standalone canvas to be reviewed against. After Phase 2 that asymmetry disappears:
the unified page **is** the design, live and interactive. A separate review page would then
just be a second copy of the same components — double the maintenance and instant drift
(two sources of truth for one layout). The correct review workflow going forward: review on
the running app (dev server or built SPA) and iterate on the real components — the hallmark
`redesign` discipline of in-place iteration on the actual implementation. If a Figma mock
exists first for a *future* feature, the pattern is: build it as a real component behind a
feature flag and review in-app, not as a parallel mock route.

### 6.5 Voice-control merge spec (decisions #5 + #6)

Two audio controls total in the composer footer — mirroring Doubao's validated two-control
model (dictation mic + phone-call voice button).

**1. `VoicePawButton` — one button for the sustained voice session + wake-word.** Both
affordances drive the SAME resource (the hermesVoice VAD session), so one button renders one
state machine — `VoicePhase: idle | wake | listening | processing | speaking`.

| Gesture | Action |
|---|---|
| Click (idle) | Start voice session → `listening` |
| Click (session active) | Stop session → `idle`; mid-turn → interrupt → `listening` (G5) |
| Long-press (idle) — desktop also right-click | Arm/disarm wake-word → `wake` |
| Say "橘宝" (wake armed) | Escalates to full session (existing flow) |

Visual states: paw outline (`idle`) · paw + listening dot (`wake`) · paw filled, ember glow,
phase label 处理中/播报中 (session — as today). Wake-armed persists via Settings (auto-arm on
launch). This also simplifies the G1 mic-mutex: one entry point owns the VAD. Accessibility:
long-press gets a keyboard equivalent (context-menu key) with `aria-label` + `aria-pressed`
reflecting the phase.

**2. `ComposerSpeechChip` — one chip for dictation + read-aloud state.** Both already run
through ONE shared audio engine (`readAloudAudio.ts` singleton, one-way priority: voice TTS >
read-aloud) — the controls now mirror that unity:

| Chip state (glyph) | Click |
|---|---|
| Mic (idle) | Start dictation (Web Speech → server fallback → paw hint) |
| Mic, animated (dictating) | Stop dictation (Esc still discards) |
| Speaker, animated (read-aloud playing) | Stop playback |
| Speaker (paused) | Resume |

Read-aloud *starts* stay per-message hover actions — they carry the target ("read THIS
message"), which a footer-only button cannot know. The chip is the single always-visible
state light + stop; the separate per-message stop MessageAction is dropped. The ⌘⌥V
dictation hotkey binds to the chip; the push-to-talk hotkey binds to the paw.

**Mutex order (unchanged, now enforced by two controls):** voice session active → chip
is disabled/dimmed; dictating → wake detector paused (existing `onListeningChange` wiring);
read-aloud cannot start while voice TTS is active (existing `isVoiceActive` guard).

---

## 7. Test / verification checklist (per repo policy)

- Colocated vitest for every new/changed component & hook (web/src/**)
- `tsc -b` clean; `npm run lint` (oxlint); SPA build via .bat (terminal degradation)
- Backend untouched except voice config seams → `uv run pytest` area suites if any
  `agent_meow/` change lands (Phase 3 engine policy)
- Playwright `tests/e2e_ui/` for the two CUJs: in-place session start; brick→template→send
- PR description with Demo video (UI change) + checked coverage boxes per AGENTS.md

---

## 8. Source index (external)

- Doubao teardown (web+desktop+plugin): zhuanlan.zhihu.com/p/701712367
- Doubao desktop download/positioning: doubao.com/download/desktop; apps.microsoft.com/detail/xp99jw18tlbk06
- Doubao UI screenshots library: uinotes.com/app/204559027813609841
- Doubao mobile interface walkthrough (structure reference): m.appbook.qq.com/read/1055153668/9
- WorkBuddy official: copilot.tencent.com/work; workbuddy.ai
- WorkBuddy orange book (59pp guide, skills/automation/workspace): diyiwuyan.github.io/workbuddy-orange-book
- WorkBuddy desktop workstation tutorial: jxxy.net/ai/articles/majiabin-workbuddy-desktop-workstation
- WorkBuddy AI workbench guide: zhuanlan.zhihu.com/p/2067758857284276477
- openai/codex — startup_draft.rs, bottom_pane/mod.rs, chatwidget/input_flow.rs (github.com/openai/codex)
- deepseek-ai/deepseek-harness — packages/client/{ui-layout,ui-slots,ui-renderer,ui-skill,ui-sidebar} + .agents/notes architecture docs (github.com/deepseek-ai/deepseek-harness)

---

## 9. Next step

With all four decisions locked (§6) and the design-skill review (§5) binding the phases, the
next artifact is the spec-kit implementation plan: `specs/unified-workspace/plan.md` →
`tasks.md` (via `/speckit.plan` → `/speckit.tasks`), executing Phases 0–4 in order, each phase
shipping green with its §7 checklist and §5 design gates satisfied.