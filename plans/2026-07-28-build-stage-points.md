# Build Stage Points — 2026-07-28

> Generated from fresh graphify-out (commit 3aaf7053) + recent commit history.
> Methodology: karpathy-guidelines (simplicity, surgical changes, verifiable goals)
> + superpowers meta-skills (idea-to-design → writing-plans → executing-plans).

## Current State (from fresh graph)

### Graph metrics (2026-07-28 vs 2026-07-20)
| Metric | Old (7/20) | Fresh (7/28) | Delta |
|--------|-----------|-------------|-------|
| Files | 2,684 | 3,536 | +852 |
| Words | ~10M | ~12.9M | +2.9M |
| Nodes | 73,827 | 97,557 | +23,730 |
| Edges | 357,385 | 424,268 | +66,883 |
| Communities | 923 | 1,708 | +785 |
| Extraction % | 37% | 50% | +13pp |

### God nodes (fresh)
1. `OSEnvSpec` (3294) — environment/sandbox spec, `inner/datamodel.py:666`
2. `AgentSpec` (2991) — agent definition, `spec/types.py:1366`
3. `OmnigentError` (694) — error base class, `errors.py:87`
4. `create_runner_app()` (329) — runner factory, `runner/app.py:7875`

### What shipped since last graph (7/20 → 7/28)
- **Phase A rebrand**: ColorFire ember tokens, Otto→MeowCat swap (6b76f605)
- **Design alignment**: landing → Figma design match (b12c0be0, 1a2047ec)
- **Voice surface**: animated waveform + mic pulse, voice/text toggle (3eecccfa, 5e15c28d, 389bbf8e)
- **Video mascot**: static fallback + Figma assets (a9b01107)
- **Design audit fixes**: cat-paw mic, WebM transparent video, agent chip (bf5f88ab)
- **Surface panels**: Docs/Images/Videos/Chat/Settings designs (df31d091)
- **SettingsPage alignment**: ColorFire design (3aaf7053 — HEAD)
- **ErrorBoundary**: global + QueryClient onError (6601519c)
- **WelcomeHero**: added to ChatSurface (54dc8ab6)
- **DesignHome preview**: scaffolded (9b17a415)
- **E2E tests**: visual snapshots for Projects + Voice rail (cdb182b2)
- **Dispatch tests**: 12 tests for surface tools (baace586)
- **Wiring fixes**: 3 gaps from design-pour readiness audit (92226b0c)

### Rebrand status (from REBRAND_AUDIT.md)
- Phases 1-12, 14, 16, 18-19: ✅ Done
- Phase 13: Distribution rename (meow/meow-client/meow-ui-sdk) ⏳ Deferred
- Phase 15: OMNIGENT_* env-var prefix migration ⏳ Deferred
- Phase 17: Python module path (agent_meow/ → meow/) ⏳ Deferred

### Surface pages — wiring verified ✅
All surface pages are right-rail workspace tabs (NOT routed pages). The full
wiring chain is confirmed:

1. **NewChatDialog.tsx** (`web/src/shell/NewChatDialog.tsx:2978`) —
   `createSessionForSurface(surface: "docs"|"images"|"videos")` POSTs to
   `/v1/sessions`, then `navigate('/c/${id}?surface=${surface}')` (line 3008).
2. **AppShell.tsx** (`web/src/shell/AppShell.tsx:751`) — reads `?surface=` param,
   sets `rightRailTab` to that value, opens the rail, strips the param (lines 758-813).
3. **WorkspacePanel.tsx** (`web/src/shell/WorkspacePanel.tsx:529-546`) —
   `rightRailTab === "docs"` → `DocsPanel`, `"images"` → `ImagesPanel`,
   `"videos"` → `VideosPanel`.
4. **railTabs.ts** (`web/src/shell/railTabs.ts`) — `RightRailTab` type includes
   `docs|images|videos|projects|voice` (positions 2-6).

**No `/docs`, `/images`, `/videos` routes needed.** Surfaces are workspace tabs
reached via `?surface=<name>` query param. The old "parity trap" memory note
was incorrect and has been corrected.

### Registered routes (App.tsx)
`/`, `/c/:conversationId`, `/inbox`, `/settings`, `/settings/:section`,
`/design-home` (lazy, outside AppShell), `/login`, `/register` (conditional),
`/approve/:sessionId/:elicitationId`, `*` → NotFound.

### Surface component files (all verified to exist)
| Component | Path |
|-----------|------|
| DocsPanel | `web/src/shell/DocsPanel.tsx` |
| ImagesPanel | `web/src/shell/ImagesPanel.tsx` |
| VideosPanel | `web/src/shell/VideosPanel.tsx` |
| ProjectsPanel | `web/src/shell/ProjectsPanel.tsx` |
| VoicePanel | `web/src/shell/VoicePanel.tsx` |
| SettingsPage | `web/src/pages/SettingsPage.tsx` |
| ChatPage | `web/src/pages/ChatPage.tsx` |
| WelcomeHero | `web/src/components/WelcomeHero.tsx` |
| NewChatDialog | `web/src/shell/NewChatDialog.tsx` |
| DesignHome | `web/src/pages/DesignHome.tsx` |

---

## Stage Points (Next Steps)

### Stage 1: Rebrand completion — finish deferred phases
**Goal**: Complete the remaining rebrand phases (13, 15, 17).
**Verify**: `grep -rn "Otto\|OMNIGENT_" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.toml" --include="*.yaml"` returns only intended references.
**Order**: Phase 15 first (env vars, lowest risk), then Phase 13 (distribution), then Phase 17 (module rename, highest risk).

Tasks (in order):
1. **Phase 15** — Migrate `OMNIGENT_*` env-var prefix → new prefix. Grep all files for `OMNIGENT_`, replace with new prefix (coordinate the target name first — likely `MEOW_*` or `AGENT_MEOW_*`). Update `.env` examples, docker-compose, railway.toml, render.yaml.
   → verify: `grep -rn "OMNIGENT_" --include="*.py" --include="*.ts" --include="*.yaml"` returns nothing unexpected.
2. **Phase 13** — Distribution rename: `meow`/`meow-client`/`meow-ui-sdk` package names. Update `pyproject.toml`, `setup.py`, npm package.json files. Coordinate with release tagging.
   → verify: `grep -rn "agent-meow-client\|agent-meow-ui-sdk" pyproject.toml setup.py web/package.json` returns nothing.
3. **Phase 17** — Python module path `agent_meow/` → `meow/`. HIGH RISK: requires migration script, all imports change, `sys.path` entries, entry points. Do this last and in a dedicated worktree.
   → verify: `uv run pytest` passes after migration; `uv run mypy agent_meow` (or `meow`) passes.
4. Update REBRAND_AUDIT.md after each phase to mark it ✅ Done.

### Stage 2: Design system consolidation
**Goal**: Extract ColorFire ember tokens into a reusable design system. Eliminate hardcoded color values.
**Verify**: `grep -rn "#E8651A\|#FFB347\|#FFFBF5\|#1A1410" web/src/ --include="*.tsx" --include="*.css"` returns nothing (all moved to tokens).

Tasks (in order):
1. **Audit** — grep all `.tsx` and `.css` files for hardcoded ember hex values (`#E8651A`, `#FFB347`, `#FFFBF5`, `#1A1410`). List every occurrence with file:line.
2. **Consolidate** — move all hardcoded values into `web/src/design/tokens.css` (or the existing token file). Replace inline hex with `var(--ember)`, `var(--accent)`, etc.
3. **Brand separation** — verify MeowCat (product IP) vs ColorFire (PC brand) naming is correct in all comments/docs. MeowCat = agent-meow product, ColorFire = the PC brand. Check `docs/assets/branding/` README.
4. **Snapshot test** — add a Vitest snapshot test that imports the token file and asserts all expected tokens exist with correct values.
   → verify: `cd web && npm test -- --reporter=verbose` shows the snapshot test passing.

### Stage 3: Graph-based architecture audit
**Goal**: Use the fresh graph (97K nodes) to identify structural issues before they become tech debt.
**Verify**: `graphify explain "OSEnvSpec"` shows degree ≤ 3500; `graphify diagnose multigraph --json` reports no critical collapse risks.

Tasks (in order):
1. **Label communities** — run `graphify label` to get LLM-named communities (needs API key — coordinate with user). This makes the 1,706 communities navigable.
2. **God node analysis** — check `OSEnvSpec` (3294 edges). If it's a god object, identify which responsibilities could be split (e.g., env parsing vs sandbox config vs runtime spec).
3. **God function analysis** — `create_runner_app()` at `runner/app.py:7875` — 7875 lines is a god function. Check if it can be decomposed into smaller factory functions. Use `graphify explain "create_runner_app"` to see its 329 connections.
4. **Multigraph diagnosis** — run `graphify diagnose multigraph --graph graphify-out/graph.json --json` to find same-endpoint edge collapse risks.
5. **Community cross-reference** — map graph communities to actual module structure. Identify communities that span unrelated modules (coupling signal).
   → verify: `graphify diagnose multigraph --json | Select-String "critical"` returns nothing.

### Stage 4: Test coverage gaps
**Goal**: Close test coverage gaps for high-degree nodes and critical user journeys.
**Verify**: `uv run pytest` passes; `cd web && npm test` passes; no new test failures.

Tasks (in order):
1. **Graph → test mapping** — identify high-degree nodes (top 20 from GRAPH_REPORT.md) and check if each has a covering test. Use `grep -rn "<node_name>" tests/ web/src/**/*.test.*` for each.
2. **Backend unit tests** — add unit tests for untested god nodes: `OSEnvSpec` validation, `AgentSpec` validation, `OmnigentError` subclasses. Target: `tests/inner/`, `tests/spec/`, `tests/` matching source dirs.
3. **Voice surface E2E** — add E2E test for the voice surface flow: mic button → waveform animation → submit. Target: `tests/e2e_ui/` (Playwright).
4. **Design snapshot regression** — verify E2E visual snapshot tests (Projects + Voice rail, commit `cdb182b2`) still pass after all design changes. Run `cd web && npm test` to confirm.
   → verify: `uv run pytest -q && cd web && npm test` both exit 0.

### Stage 5: Production readiness audit
**Goal**: Verify the app is production-ready after all stages.
**Verify**: All checks pass; no blocking issues.

Tasks (in order):
1. **Smoke test** — run `python scripts/backend-smoke.sh` (or equivalent) to verify server boot + API health.
2. **Frontend build** — `cd web && npm run build` succeeds; `agent_meow/server/static/web-ui/` is fresh (per build-path-gotcha.md).
3. **Lint** — `uv run ruff check .` and `cd web && npm run lint` both pass.
4. **Type check** — `uv run mypy agent_meow` and `cd web && npm run type-check` both pass.
5. **Pre-commit** — `uv run pre-commit run --all-files` passes.
   → verify: all five commands exit 0.

---

## Verifiable Success Criteria

| Stage | Success check | Command |
|-------|---------------|--------|
| 1 | No unintended `Otto`/`OMNIGENT_` references | `grep -rn "Otto\|OMNIGENT_" --include="*.py" --include="*.ts"` |
| 2 | No hardcoded ember colors in .tsx/.css | `grep -rn "#E8651A" web/src/ --include="*.tsx" --include="*.css"` |
| 3 | No god node > 3500 edges, no critical collapse | `graphify explain "OSEnvSpec"` + `graphify diagnose multigraph --json` |
| 4 | All tests pass | `uv run pytest -q && cd web && npm test` |
| 5 | All quality gates pass | `uv run ruff check . && cd web && npm run lint && npm run type-check` |

---

## Methodology Notes

- **Karpathy guidelines**: Each stage has verifiable success criteria. No speculative
  features. Surgical changes only — every line traces to a stage goal.
- **Superpowers meta-skills**: Use `idea-to-design` before Stage 2 (design system is
  creative work). Use `writing-plans` to expand each stage into a task list. Use
  `executing-plans` to execute with review checkpoints.
- **Graphify**: Run `graphify update . --force` after each stage to keep the graph fresh.
  The graph is the source of truth for architecture decisions.
  Command: `cd C:\Users\1\github-pr\agent-meow; graphify update . --force`
- **gbrain**: Once re-enabled, use `mcp_gbrain_query` to ask structural questions
  about the codebase. Source `agent-meow` is already registered (federated).
- **Frontend-dev skill**: Load for all `web/src/` changes (Stage 2, 4). Covers React
  component patterns, state management, Tiptap/Fabric.js/xterm.js integrations.
- **Build path gotcha**: After frontend changes, `cd web && npm run build` writes to
  `agent_meow/server/static/web-ui/` (not `omnigent/server/static/web-ui/`). Kill
  existing `omni.exe` before restarting the server. Hard-refresh browser.