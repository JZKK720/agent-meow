---
artifact_contract: "ce-handoff/v1"
created_at: "2026-09-03T00:00:00Z"
title: "Dev machine: rebuild full SPA + server for e2e testing"
summary: "Fresh-machine setup for agent-meow fork main 4ba8926af — backend env, SPA build, server start, and e2e test suites with Windows gotchas"
keywords: ["handoff", "spa", "e2e", "build", "agent-meow", "dev-machine"]
resume_focus: "Build the full SPA and server on a fresh machine and get e2e tests running"
repository: "JZKK720/agent-meow"
branch: "main"
head: "0d17b5fd3"
---

# Handoff: dev machine — rebuild full SPA + server for e2e testing

## Objective

Pick up the latest pushed work of the agent-meow fork (JZKK720/agent-meow) on a
new machine, rebuild the full SPA, start the server, and run e2e tests. This
document is the single source of orientation — no session history is needed.

## Verified repo state (as of 2026-09-03)

- `main` == `origin/main` == `0d17b5fd3` ("docs(handoff): dev machine —
  full SPA + server rebuild for e2e testing"). Verified via `git ls-remote` —
  everything is pushed, including the recent voice-pipeline bug-fix run
  (`333e67103` … `4ba8926af`: wake-word vocab contract, Edge TTS offline
  fallback, STT echo-tail garbage guard, 5 audited lifecycle fixes) and the
  notes/snippets + image-search features.
- Tags `v0.8.0` … `v0.9.2` are on origin.
- Nothing in the working tree is required for the build: all 302 untracked
  files are scratch logs, benchmark artifacts, or local Electron dist builds.
- Stale local branches (`reintegration/staging`, `rotation-schedule-20260801`)
  exist only on the old machine — ignore them; they carry no unique work.
- Known pre-existing test baseline on clean HEAD (NOT regressions):
  - `tests/runner/test_surface_dispatch.py::test_frozenset_sizes` — asserts 8,
    actual 10 tools.
  - `web/src/AppShell.test.tsx` — 9 failures on clean HEAD.

## Setup (fresh machine, Windows or WSL2/Linux)

Dev environment expectations (from AGENTS.md): Python 3.12+ via `uv`, Node LTS.

```powershell
git clone https://github.com/JZKK720/agent-meow.git
cd agent-meow

# Backend
uv sync --extra all --extra dev

# SPA — the vite build outputs DIRECTLY into agent_meow/server/static/web-ui
cd web
npm ci
npm run build        # runs `tsc -b && vite build`, ~5s, empties outDir itself
npm run type-check   # sanity: tsc -b clean
cd ..

# Server (serves the freshly built SPA from agent_meow/server/static/web-ui)
.venv\Scripts\python.exe -m agent_meow server start
# health check: GET http://localhost:6767/health → {"status":"ok"}
```

Key build facts (verified on origin/main):

- `web/vite.config.ts` sets `outDir: ../agent_meow/server/static/web-ui` with
  `emptyOutDir: true` — **no copy step**; the server picks up the bundle
  automatically. `AGENT_MEOW_WEB_UI_DIST` env var overrides the static dir if
  you want to serve a different bundle.
- `agent_meow/cli.py` refuses to start if `static/web-ui` is empty and prints
  the `cd web && npm install && npm run build` hint — that means the build
  step above was skipped.
- SPA build script is `tsc -b && vite build` — a type error fails the build.
  Lint is `oxlint .`, frontend tests are `npm test` (vitest).

## Running the e2e tests

```powershell
# Backend unit + e2e (e2e/live/integration skipped by default; opt in per suite)
.venv\Scripts\python.exe -m pytest
.venv\Scripts\python.exe -m pytest tests/e2e -v

# Frontend unit (vitest)
cd web && npm test

# Browser e2e + visual baselines (requires Docker on Windows)
cd web && npm run build   # visual suite skips build only with --ui-skip-build
uv run pytest tests/e2e_ui -m "not visual"
docker run mcr.microsoft.com/playwright/python:v1.60.0-noble -v "C:\path\to\repo:/work" ... uv run pytest tests/e2e_ui/visual -m visual --ui-skip-build
```

Visual baseline notes: Windows docker needs `-v "C:\path:/work"` syntax; use
`uv run pytest`, not the wrapper, if npm peer-dep resolution interferes.

## Windows gotchas that WILL bite (learned the hard way)

1. **`rg` is not available in PowerShell here** — use `Select-String` and
   `git grep` for repository scans.
2. **After a large fast-forward, the existing `.venv` can be missing newly
   locked runtime deps** (observed: `zstandard`, `tzdata`). Fastest repair:
   `uv pip install --python .\.venv\Scripts\python.exe <pkg>` — or re-run
   `uv sync --extra all --extra dev`.
3. **`uv run pytest` may trigger an editable build that runs the web npm
   install path.** If peer-dependency resolution fails and you only want
   Python validation, use `.\.venv\Scripts\python.exe -m pytest` directly.
4. **A stale user-site `mcp` package** at
   `%APPDATA%\Python\Python312\site-packages\mcp` shadows the venv's install
   and causes `ImportError: cannot import name 'ElicitRequestParams'`. Fix:
   delete the user-site `mcp` dir, then `uv sync --extra all --extra dev`.
5. **`uv run pytest` can resolve to a user-site `pytest.exe`** instead of the
   venv's — use `uv run python -m pytest` to force the venv module path.
6. **vitest "Cannot find current suite/config"** — delete
   `web/node_modules/.vite` and run with the repo's `npm test` wrapper
   (`--pool=vmThreads`).
7. **vitest `-t` name filter skips ALL tests under `--pool=vmThreads`** on
   this repo — run full suites and read per-test output lines instead.

## Voice/stack services (only if testing voice e2e)

- Server: `:6767` (`python -m agent_meow server start`), logs at
  `~/.agent-meow/logs/`.
- If you test STT/TTS round-trips, check `GET /v1/stack/status` first — it
  reports `whisper_stt` and `tts` health.
- Image generation needs a provider configured:
  `IMAGE_GEN_PROVIDER=dashscope DASHSCOPE_API_KEY=<key>` (or `fal`, `a1111`,
  `hosted`) — otherwise `image_generate` errors, which is expected without a
  provider.

## Policies to respect (binding)

- **Upstream isolation**: fork is fully diverged from omnigent-ai/omnigent.
  NO upstream PRs. `upstream` remote push URL is disabled by config
  (`DISABLED_NO_PUSH_TO_UPSTREAM`). See `docs/UPSTREAM_ADOPTION_POLICY.md`.
- **E2E test requirement**: any PR with a new user-facing feature must add an
  e2e test under `tests/e2e/` (or `tests/e2e_ui/` for UI behaviour).
- **Commits**: use `git commit -s` (DCO sign-off) and push frequently to
  `origin/main`.
- **PRs**: fill in `.github/pull_request_template.md` (case-sensitive);
  UI/frontend PRs need a Demo video/screenshot section.

## Reference documents in-repo

- `AGENTS.md` — full command quick-reference + architecture overview.
- `CLAUDE.md` — identical to AGENTS.md (pointer file).
- `CONTRIBUTING.md` — contributor workflow.
- `DESIGN.md` — design system tokens (binding for frontend work).
- `docs/UPSTREAM_ADOPTION_POLICY.md`, `docs/UPSTREAM_CHERRY_PICK_RUNBOOK.md`
  — upstream porting rules if relevant.

## State notes

- This handoff was generated on the source machine (Windows). The build was
  verified on that machine; the dev machine should expect a cold npm/uv
  install (~minutes) and then a working `:6767` server.
- No secrets are included or needed — providers are configured via env vars.