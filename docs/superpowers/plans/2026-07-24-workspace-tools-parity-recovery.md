# Workspace Tools Parity Recovery Plan

> For agentic workers: REQUIRED SUB-SKILL: superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Use checkbox tracking and do not skip verification gates.

## Goal

Restore build/runtime integrity and user-facing functional parity for Documents, Images, and Videos surfaces while containing current static-asset divergence risk and rebrand drift.

## Executive Findings (Severity-Ordered)

1. Critical: Tool cards route to non-existent SPA routes, causing deterministic 404/NotFound behavior.
- Evidence: [web/src/shell/NewChatDialog.tsx](web/src/shell/NewChatDialog.tsx#L4174) hard-navigates to `/${tool.id}` for `docs/images/videos` cards.
- Evidence: [web/src/App.tsx](web/src/App.tsx#L121), [web/src/App.tsx](web/src/App.tsx#L127), [web/src/App.tsx](web/src/App.tsx#L144) register inbox/settings and wildcard NotFound, but no `/docs`, `/images`, `/videos` routes.

2. Critical: Massive static web-ui asset deletion/divergence in working tree creates high break/regression risk for shipped UI bundle.
- Observed: 493 changed/deleted files under `agent_meow/server/static/web-ui/assets` in current working tree.
- Risk: runtime broken references, stale hashed chunk links, and non-reproducible build output under deadline.

3. High: Documents/Images/Videos panels exist but are not wired into active workspace rail flow.
- Evidence: panel components are implemented: [web/src/shell/DocsPanel.tsx](web/src/shell/DocsPanel.tsx#L42), [web/src/shell/ImagesPanel.tsx](web/src/shell/ImagesPanel.tsx#L30), [web/src/shell/VideosPanel.tsx](web/src/shell/VideosPanel.tsx#L48).
- Evidence: active tab union has only `files/subagents/terminals/todos/browser`: [web/src/shell/railTabs.ts](web/src/shell/railTabs.ts#L8).
- Evidence: workspace tab triggers include only those five tabs: [web/src/shell/WorkspacePanel.tsx](web/src/shell/WorkspacePanel.tsx#L320), [web/src/shell/WorkspacePanel.tsx](web/src/shell/WorkspacePanel.tsx#L333), [web/src/shell/WorkspacePanel.tsx](web/src/shell/WorkspacePanel.tsx#L352), [web/src/shell/WorkspacePanel.tsx](web/src/shell/WorkspacePanel.tsx#L368), [web/src/shell/WorkspacePanel.tsx](web/src/shell/WorkspacePanel.tsx#L380).

4. High: Backend resource routers for docs/images/videos exist but are not mounted in app composition.
- Evidence: route implementations exist:
  - [agent_meow/server/routes/documents.py](agent_meow/server/routes/documents.py#L116), [agent_meow/server/routes/documents.py](agent_meow/server/routes/documents.py#L137)
  - [agent_meow/server/routes/images.py](agent_meow/server/routes/images.py#L97), [agent_meow/server/routes/images.py](agent_meow/server/routes/images.py#L130)
  - [agent_meow/server/routes/videos.py](agent_meow/server/routes/videos.py#L86), [agent_meow/server/routes/videos.py](agent_meow/server/routes/videos.py#L119)
- Evidence: app mounts many routers but no `create_documents_router/create_images_router/create_videos_router` symbols are present in [agent_meow/server/app.py](agent_meow/server/app.py).

5. High: Built-in tool contracts for docs/images/videos exist but current runner dispatch map does not include them.
- Evidence: tool names are declared in builtins:
  - docs: [agent_meow/tools/builtins/docs.py](agent_meow/tools/builtins/docs.py#L36), [agent_meow/tools/builtins/docs.py](agent_meow/tools/builtins/docs.py#L131)
  - images: [agent_meow/tools/builtins/images.py](agent_meow/tools/builtins/images.py#L32), [agent_meow/tools/builtins/images.py](agent_meow/tools/builtins/images.py#L117)
  - videos: [agent_meow/tools/builtins/videos.py](agent_meow/tools/builtins/videos.py#L114), [agent_meow/tools/builtins/videos.py](agent_meow/tools/builtins/videos.py#L154)
- Evidence: local tool dispatch groups are defined in [agent_meow/runner/tool_dispatch.py](agent_meow/runner/tool_dispatch.py#L168) and [agent_meow/runner/tool_dispatch.py](agent_meow/runner/tool_dispatch.py#L524) but contain no `doc_*`, `image_*`, or `video_*` groups.

6. Medium: Surface docs are out of sync with current code and create false confidence.
- Evidence: videos surface doc claims `videos` was added to rail tabs and workspace panel: [docs/VIDEOS_SURFACE.md](docs/VIDEOS_SURFACE.md#L27), [docs/VIDEOS_SURFACE.md](docs/VIDEOS_SURFACE.md#L56), [docs/VIDEOS_SURFACE.md](docs/VIDEOS_SURFACE.md#L101).
- Contradiction: actual tab union in [web/src/shell/railTabs.ts](web/src/shell/railTabs.ts#L8).

7. Medium: Rebrand debt remains substantial and overlaps technical-risk areas.
- Evidence: ongoing deferred renames and `OMNIGENT_*` migration explicitly tracked in [docs/REBRAND_AUDIT.md](docs/REBRAND_AUDIT.md).
- Evidence: 965 current textual `omnigent/Omnigent` matches across 36 files (mix of intentional compatibility and unresolved naming debt).

## Scope Boundaries

In scope:
- Route and panel wiring for docs/images/videos surfaces.
- Backend route mounting and endpoint smoke tests.
- Runner tool-dispatch parity for doc/image/video builtins.
- Static web-ui divergence containment and reproducible build restore.
- Docs parity updates and rebrand risk register alignment.

Out of scope (this milestone):
- Full `OMNIGENT_*` env var migration.
- Python package/module rename (`agent_meow` import-path migration).
- Databricks model-routing policy redesign.

## System Flow (Current vs Target)

```mermaid
flowchart LR
    A[NewChatDialog Tool Cards] -->|current| B[/docs /images /videos routes]
    B --> C[App Router]
    C -->|no matching route| D[NotFound]

    A -->|target| E[Session-aware Workspace Action]
    E --> F[Open/ensure conversation]
    F --> G[Set right rail tab + panel state]
    G --> H[DocsPanel / ImagesPanel / VideosPanel]

    subgraph Backend
      I[FastAPI app composition]
      J[documents/images/videos routers]
      K[ArtifactStore + DocumentStore + ImageStore + VideoStore]
      L[Runner tool_dispatch]
      M[builtins doc_* image_* video_*]
    end

    J --> K
    I -->|target mount| J
    M -->|target dispatch path| L
    L --> J
    H -->|REST| J
```

## Delivery Strategy (Human-in-Loop Gates)

### Phase 0: Safety Containment (No feature changes)
- [ ] Capture and isolate static asset divergence before touching feature wiring.
- [ ] Decide containment mode:
  - Mode A: temporary branch/worktree dedicated to parity fix.
  - Mode B: keep branch, but freeze static assets and disallow unrelated regenerations.
- [ ] Human gate: approve containment mode and branch strategy.
- [ ] Verification: `git status --short` shows only intended files after containment.

### Phase 1: Fix User-Facing 404 Path
- [ ] Replace NewChatDialog card `navigate('/${tool.id}')` behavior with session-aware panel activation flow.
- [ ] If no conversation: create/select conversation first, then open rail/panel target.
- [ ] Add regression unit tests for card actions (no route navigation to unknown paths).
- [ ] Human gate: UX acceptance on desktop + mobile.
- [ ] Verification:
  - `cd web && npm test -- NewChatDialog`
  - manual: clicking Videos card opens workspace surface, not NotFound.

### Phase 2: Wire Rail Surfaces End-to-End
- [ ] Decide integration model:
  - Option 1: add `docs/images/videos` as first-class `RightRailTab` values.
  - Option 2: keep existing tab model and mount these as secondary workspace sub-surfaces.
- [ ] Implement wiring in `AppShell` + `WorkspacePanel` + related state persistence.
- [ ] Ensure i18n strings (en/zh) are used uniformly (avoid hardcoded mixed-locale card labels).
- [ ] Human gate: choose Option 1 vs Option 2 before coding.
- [ ] Verification:
  - rail switch persists across refresh/session restore.
  - open/close behavior consistent with existing files/terminals tabs.

### Phase 3: Backend Route Mounting
- [ ] Import and mount `create_documents_router`, `create_images_router`, `create_videos_router` in app composition.
- [ ] Validate auth/permission and conversation existence checks are preserved.
- [ ] Add focused API tests under `tests/server/` for each route group.
- [ ] Human gate: API contract review for backward compatibility.
- [ ] Verification:
  - `uv run pytest tests/server -k "documents or images or videos"`
  - manual `GET /v1/sessions/{id}/resources/{type}` returns expected shape.

### Phase 4: Runner Builtin Tool Parity
- [ ] Implement or restore dispatch support for `doc_*`, `image_*`, `video_*` tool names in runner dispatch map.
- [ ] Ensure behavior matches tool docs or explicitly deprecate stale tools.
- [ ] Add/extend `tests/runner/test_runner_dispatch.py` coverage.
- [ ] Human gate: approve final contract decision:
  - Support now, or
  - Defer and mark tool names as unavailable with explicit user-facing errors.
- [ ] Verification:
  - runner local dispatch invokes expected REST calls and handles errors.

### Phase 5: Docs and Rebrand Consistency
- [ ] Update `docs/DOCS_SURFACE.md`, `docs/IMAGES_SURFACE.md`, `docs/VIDEOS_SURFACE.md` to reflect actual wiring.
- [ ] Add a compact "current status" matrix for each surface: UI wiring, API mounted, tool dispatch wired, tests present.
- [ ] Reconcile with `docs/REBRAND_AUDIT.md` deferred list to avoid naming regressions while fixing functionality.
- [ ] Human gate: documentation sign-off.

### Phase 6: Full Verification and Release Readiness
- [ ] Backend checks:
  - `uv run pytest`
  - `uv run ruff check .`
  - `uv run mypy agent_meow`
- [ ] Frontend checks:
  - `cd web && npm run type-check`
  - `cd web && npm run lint`
  - `cd web && npm test`
- [ ] E2E happy paths (required for user-facing feature behavior changes):
  - open docs/images/videos from workspace entry cards
  - create/upload/list/delete in each surface
- [ ] Human gate: go/no-go review with risk checklist below.

## Risk Register

1. Static bundle hash drift
- Impact: high
- Mitigation: isolate static assets and only regenerate once at end with clean lockfile.

2. Route-state coupling regressions in AppShell
- Impact: high
- Mitigation: add focused unit tests around panel/tab/url sync effects.

3. Auth/permission mismatch on newly mounted routers
- Impact: high
- Mitigation: explicit permission tests for read/edit levels in multi-user mode.

4. Tool contract ambiguity (`doc_generate`, `image_generate`, video generation)
- Impact: medium
- Mitigation: freeze v1 scope and return clear unimplemented contract where needed.

5. Rebrand noise obscuring functional diffs
- Impact: medium
- Mitigation: separate functional parity PR from broad text-only rebrand edits.

## Immediate Next Actions (24-hour sequence)

1. Decide containment mode for 493-asset divergence and create isolated work branch.
2. Fix NewChatDialog card action wiring first (highest user-visible failure).
3. Add/restore rail integration and tests.
4. Mount backend resource routers and verify endpoint health.
5. Resolve runner dispatch parity for doc/image/video tools.
6. Update surface docs to match shipped reality.

## Definition of Done

- Clicking docs/images/videos cards never lands on NotFound.
- Each surface is reachable from workspace UI and operates CRUD/playback as designed.
- Backend routers for docs/images/videos are mounted and tested.
- Runner tool dispatch either fully supports or explicitly deprecates doc/image/video tool family (no silent drift).
- Surface docs match code reality.
- Build/test/lint/type checks pass with no new regressions.
