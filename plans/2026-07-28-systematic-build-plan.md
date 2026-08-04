# Systematic Build Plan — Omnigent Surface Integration & Hermes Wiring

**Date:** 2026-07-28  
**Status:** Active  
**Scope:** Verify omnigent architecture works with new surfaces, tools, and utilities. Wire Hermes for end-to-end testing.

---

## Current State Assessment

### ✅ Completed (Committed & Pushed)

| Component | Status | Tests | Notes |
|-----------|--------|-------|-------|
| Landing (NewChatDialog) | ✅ Figma-aligned | 162/162 | Voice card, ember cards, locale-aware |
| ChatSurface WelcomeHero | ✅ Implemented | 19+77 pass | 72px mascot, gradient bubble, animation |
| Design tokens | ✅ Wired | N/A | welcome-bob, gradient bubble, ember tokens |
| SettingsPage | ✅ Design-aligned | 56 pass | Mascot headers added |
| DocsPanel | ✅ Design-aligned | 11 pass (WorkspacePanel) | Mascot header, WelcomeMascot empty state |
| ImagesPanel | ✅ Design-aligned | 11 pass (WorkspacePanel) | Mascot header, WelcomeMascot empty state |
| VideosPanel | ✅ Design-aligned | 11 pass (WorkspacePanel) | Mascot header, WelcomeMascot empty state |
| Design HTML mockups | ✅ Committed | N/A | 5 surfaces with ColorFire DNA |

### ⚠️ Pending / Gaps

| Component | Status | Blocker | Priority |
|-----------|--------|---------|----------|
| Hermes CLI | ❌ Not installed | User must install via Nous Research script | P0 |
| Hermes e2e tests | ❌ Cannot run | Requires Hermes CLI binary | P0 |
| Panel unit tests | ⚠️ Limited coverage | No dedicated Docs/Images/VideosPanel.test.tsx | P1 |
| welcome-mascot.png | ⚠️ Placeholder | User must drop waving 橘宝 PNG | P1 |
| Motion mascot | ⏸️ On hold | User requested hold | P2 |

---

## Omnigent Architecture Verification Matrix

### Core Harness Integration

| Harness | Type | Module | Test Coverage | Status |
|---------|------|--------|---------------|--------|
| `claude` | SDK | `claude_sdk_harness.py` | Unit + e2e | ✅ |
| `claude-native` | TUI | `claude_native_harness.py` | Unit + e2e | ✅ |
| `codex` | SDK | `codex_harness.py` | Unit + e2e | ✅ |
| `codex-native` | TUI | `codex_native_harness.py` | Unit + e2e | ✅ |
| `pi` | SDK | `pi_harness.py` | Unit + e2e | ✅ |
| `pi-native` | TUI | `pi_native_harness.py` | Unit + e2e | ✅ |
| `cursor` | SDK | `cursor_harness.py` | Unit + e2e | ✅ |
| `cursor-native` | TUI | `cursor_native_harness.py` | Unit + e2e | ✅ |
| `goose` | ACP | `goose_harness.py` | Unit + e2e | ✅ |
| `goose-native` | TUI | `goose_native_harness.py` | Unit + e2e | ✅ |
| `kimi` | SDK | `kimi_harness.py` | Unit + e2e | ✅ |
| `kimi-native` | TUI | `kimi_native_harness.py` | Unit + e2e | ✅ |
| `qwen` | ACP | `qwen_harness.py` | Unit + e2e | ✅ |
| `qwen-native` | TUI | `qwen_native_harness.py` | Unit + e2e | ✅ |
| `hermes` | SDK | `hermes_harness.py` | Unit only | ⚠️ **CLI required** |
| `hermes-native` | TUI | `hermes_native_harness.py` | Unit only | ⚠️ **CLI required** |

### Surface → Backend Wiring

| Surface | Backend API | Hook/Store | Test Coverage | Status |
|---------|-------------|------------|---------------|--------|
| DocsPanel | `useDocuments` | TanStack Query | WorkspacePanel.test.tsx | ✅ |
| ImagesPanel | `useImages` | TanStack Query | WorkspacePanel.test.tsx | ✅ |
| VideosPanel | `useVideos` | TanStack Query | WorkspacePanel.test.tsx | ✅ |
| SettingsPage | `useConversations` + preferences | React state | SettingsPage.test.tsx (56) | ✅ |
| ChatSurface | `useChatStore` | Zustand | ChatPage tests (96) | ✅ |

---

## Hermes Wiring Requirements

### What Hermes Is

Hermes is Nous Research's agent CLI — a **native TUI** (like Claude Code, Cursor) that Omnigent wraps in two modes:

1. **`hermes` (headless SDK)** — `hermes chat -q` subprocess per turn, SQLite session store
2. **`hermes-native` (TUI)** — `hermes` interactive TUI in tmux pane, web UI injects messages via bridge

### What Needs to Happen for Hermes Testing

| Step | Action | Owner | Verification |
|------|--------|-------|--------------|
| 1 | Install Hermes CLI | User | `hermes --version` returns |
| 2 | Configure Hermes auth (`hermes model`) | User | `~/.hermes/config.yaml` exists |
| 3 | Run unit tests | Agent | `pytest tests/inner/test_hermes_executor.py` |
| 4 | Run native bridge tests | Agent | `pytest tests/test_hermes_native_bridge.py` |
| 5 | Run e2e hermes test | Agent | `pytest tests/e2e/test_hermes_native_render_parity.py` |
| 6 | Verify web UI ↔ Hermes TUI sync | Agent | Manual: send message from web UI, see in tmux pane |

### Hermes Installation Command

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

**Note:** This is a Unix script. On Windows, Hermes may need WSL2 or manual installation.

---

## Systematic Next Steps

### Phase 1: Verification Baseline (Now)

**Goal:** Prove omnigent architecture works with all current surfaces.

| # | Task | Verification | Status |
|---|------|--------------|--------|
| 1.1 | Run full backend test suite | `uv run pytest` (unit only) | ⬜ |
| 1.2 | Run full frontend test suite | `cd web && npm test` | ⬜ |
| 1.3 | Run type check | `uv run mypy agent_meow` + `cd web && npm run type-check` | ⬜ |
| 1.4 | Run lint | `uv run ruff check .` + `cd web && npm run lint` | ⬜ |

### Phase 2: Panel Test Coverage (Next)

**Goal:** Dedicated unit tests for DocsPanel, ImagesPanel, VideosPanel.

| # | Task | File | Pattern |
|---|------|------|---------|
| 2.1 | Create `DocsPanel.test.tsx` | `web/src/shell/DocsPanel.test.tsx` | Follow `FilesPanel.test.tsx` |
| 2.2 | Create `ImagesPanel.test.tsx` | `web/src/shell/ImagesPanel.test.tsx` | Follow `FilesPanel.test.tsx` |
| 2.3 | Create `VideosPanel.test.tsx` | `web/src/shell/VideosPanel.test.tsx` | Follow `FilesPanel.test.tsx` |

**Success criteria:** Each panel has tests for: render, empty state, loading state, error state, item selection, delete confirmation.

### Phase 3: Hermes Wiring (Blocked on User)

**Goal:** Hermes CLI installed and e2e tests running.

| # | Task | Blocker | Verification |
|---|------|---------|--------------|
| 3.1 | User installs Hermes CLI | User action | `hermes --version` |
| 3.2 | User configures Hermes auth | User action | `hermes model` completes |
| 3.3 | Run Hermes unit tests | None | `pytest tests/inner/test_hermes*.py -v` |
| 3.4 | Run Hermes e2e test | None | `pytest tests/e2e_ui/messages/test_native_hermes_render_parity.py` |

### Phase 4: Final Polish (After Hermes)

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 4.1 | Drop waving 橘宝 PNG | User | `web/public/welcome-mascot.png` |
| 4.2 | Motion mascot decision | User | On hold per user |
| 4.3 | Clean up `dev/frames/` | Agent | Delete or .gitignore |
| 4.4 | Clean up mascot .webm files | Agent | Keep or remove |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hermes CLI not available on Windows | High | Use WSL2 or defer Hermes testing |
| Panel tests reveal integration bugs | Medium | Fix as found, follow existing patterns |
| welcome-mascot.png never delivered | Low | Placeholder works, design is complete |
| dev/frames/ bloats repo | Low | Add to .gitignore or delete |

---

## Success Criteria

**Phase 1 complete when:**
- [ ] `uv run pytest` passes (backend unit tests)
- [ ] `cd web && npm test` passes (frontend tests)
- [ ] `uv run mypy agent_meow` clean
- [ ] `cd web && npm run type-check` clean
- [ ] `uv run ruff check .` clean
- [ ] `cd web && npm run lint` clean

**Phase 2 complete when:**
- [ ] `DocsPanel.test.tsx` exists and passes
- [ ] `ImagesPanel.test.tsx` exists and passes
- [ ] `VideosPanel.test.tsx` exists and passes

**Phase 3 complete when:**
- [ ] `hermes --version` returns successfully
- [ ] `pytest tests/inner/test_hermes_executor.py` passes
- [ ] `pytest tests/inner/test_hermes_native_executor.py` passes
- [ ] `pytest tests/e2e_ui/messages/test_native_hermes_render_parity.py` passes

---

## Immediate Action Required

**From you (the user):**

1. **Install Hermes CLI** (if you want Hermes testing now):
   ```bash
   curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
   ```
   Note: This is a Unix script. On Windows, use WSL2 or Git Bash.

2. **Or confirm:** Skip Hermes for now, proceed with Phase 1 (verification baseline) and Phase 2 (panel tests).

**From me (the agent):**
- Ready to execute Phase 1 (full test suite) immediately
- Ready to write Phase 2 (panel unit tests) immediately
- Blocked on Phase 3 until Hermes CLI is available

---

*Generated by karpathy-guidelines + knowledge-ops skills. Surgical changes, verifiable success criteria, no speculation.*
