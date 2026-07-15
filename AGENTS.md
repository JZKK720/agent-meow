# Agent guidance

Guidance for AI agents (Claude Code, Copilot, Cursor, etc.) working in this
repository. See `CONTRIBUTING.md` for the full contributor workflow.

## Quick reference — build & test commands

```bash
# ── Setup ──
uv python install
uv venv --python "$(cat .python-version)"     # .python-version = 3.12
uv sync --extra all --extra dev
source .venv/bin/activate                       # or prefix with `uv run`

# ── Backend ──
uv run pytest                                   # unit tests (e2e/live skipped by default)
uv run pytest tests/server/                      # targeted suite
uv run ruff check .                              # lint
uv run ruff format --check .                     # format check
uv run mypy agent_meow                           # type check (strict mode)
uv run pre-commit run --all-files                # all pre-commit hooks

# ── Frontend (web/) ──
cd web && npm install && npm run dev              # dev server
npm test                                          # vitest run
npm run build                                     # tsc -b && vite build
npm run lint                                      # oxlint
npm run format                                    # prettier --write .
npm run type-check                                # tsc -b

# ── Run locally (3 terminals) ──
meow server                                      # Terminal 1: server on :6767
meow host --server http://localhost:6767         # Terminal 2: register host
cd web && npm run dev                             # Terminal 3: frontend
```

**Dev OS**: macOS or Linux (WSL2). **Windows is not directly supported** —
`pexpect`/`pyte` are excluded on Windows; use WSL2 (Ubuntu).

## Tech stack

| Layer | Stack |
|---|---|
| **Backend** | Python 3.12+, FastAPI/Starlette + Uvicorn, SQLAlchemy 2.x, Alembic, Pydantic 2.x, OpenTelemetry |
| **Frontend** | React 18, Vite, TypeScript, Ant Design 6, Radix UI, TanStack Query, Tiptap (docs), Fabric.js (images), xterm.js (terminals), i18next, Playwright (e2e) |
| **CLI** | Click-based, 4 aliases: `meow`, `agent-meow`, `omnigent`, `omni` |
| **Package mgr** | `uv` (Python), `npm`/`pnpm` (web) |
| **Linter** | `ruff` (Python), `oxlint` + `prettier` (web) |
| **Type checker** | `mypy` (strict), `pyrefly` (config in `pyrefly.toml`) |
| **Test** | `pytest` + `pytest-asyncio` (auto), `vitest` (colocated), `pytest-playwright` (e2e_ui) |

## Architecture — 3-layer runtime

1. **Server** (`agent_meow/server/`) — FastAPI HTTP/WebSocket server, routes, auth, host registry, MCP pool
2. **Runner** (`agent_meow/runner/`) — session execution, policy enforcement, tool dispatch, MCP management, cost advising, transports
3. **Runtime** (`agent_meow/runtime/`) — per-session state: harnesses, credentials, compaction, prompt, telemetry, session streams

### Harness integration pattern

Each AI agent (Claude, Codex, Cursor, Copilot, Pi, Antigravity, etc.) has two tracks:

- **SDK harness**: `{name}_executor.py` + `{name}_harness.py` under `agent_meow/inner/`
- **Native harness** (TUI-based): `{name}_native.py` + `{name}_native_bridge.py` + `{name}_native_forwarder.py` at `agent_meow/` top-level, plus `inner/{name}_native_executor.py` + `inner/{name}_native_harness.py`

See the `.claude/skills/harness-integration-guide/SKILL.md` for the full feature matrix and implementation checklist.

### Key directories

| Directory | Purpose |
|---|---|
| `agent_meow/inner/` | Vendored runtime — harness executors, sandbox, terminal, policies, tracing, tools |
| `agent_meow/tools/` | Tool system: base, builtins, client-specified, local, MCP, manager |
| `agent_meow/db/` | Database layer with Alembic migrations |
| `agent_meow/policies/` | Policy engine (CEL-based) |
| `agent_meow/llms/` | LLM model catalog, model pools, overrides |
| `agent_meow/repl/` | REPL (terminal UI) |
| `agent_meow/onboarding/` | First-run setup/auth flows |
| `web/` | React frontend (Vite + TypeScript + Ant Design + Tiptap + Fabric.js) |
| `tests/` | Python test suite (unit, integration, e2e, e2e_ui, e2e_live) |
| `deploy/` | Deployment configs per provider |
| `docs/` | Surface specs, design docs, policy docs |
| `examples/` | Example agents (debby, polly, doc-writer, etc.) |
| `sdks/` | Sibling SDK packages (`python-client`, `ui`) |

### Documentation

- `docs/` — surface specs (DOCS_SURFACE.md, IMAGES_SURFACE.md, VOICE_SURFACE.md), POLICIES.md, AGENT_YAML_SPEC.md, REBRAND_AUDIT.md
- `designs/` — architecture proposals, CUJ analysis, harness plugin interface
- `CONTRIBUTING.md` — full contributor guide
- `.claude/skills/` — harness-specific E2E dev & testing skills (loaded automatically)

## Committing

Run the `pre-commit` hook before committing (`pre-commit run --all-files`, or
let it run on staged files via `git commit`). Fix any issues it reports so the
commit lands clean — CI runs the same checks.

**DCO**: sign off commits with `git commit -s`.

**Push frequently**: push commits to `origin/main` after completing work. Do
not leave commits unpushed locally — work that isn't pushed cannot be recovered
if the machine is lost.

## Pull requests

When you open a pull request, fill in the repo's PR template at
`.github/pull_request_template.md` (case-sensitive on Linux — note the lowercase
filename). Keep every section and checkbox row so reviewers can skim them.

- **Summary** — what changed and why.
- **Test Plan** — how you verified it.
- **Demo** — a **video or images** showing the change. Expected on contributor
  PRs for UI / frontend changes (check the "UI / frontend change" box under
  *Type of change*) so reviewers can see the new behaviour without checking out
  the branch. Use `N/A` for non-visual changes.
- **Type of change** / **Test coverage** — check all that apply (at least one
  each).
- **Coverage notes** — required if you checked "Manual verification completed"
  or "Not applicable".

Generate the description from the actual diff and this session's context — lead
with the motivation, then the change. Don't pass a `--body` that skips these
sections.

## Code comments

Keep comments short and focused on the code, not on the change history.

- **Keep them brief** — prefer one or two lines. Avoid comments longer than
  three lines; if you need more, the code likely needs refactoring or a doc
  string, not a wall of inline commentary.
- **Describe the scenario, not the PR** — explain *what* the code handles or
  *why* it exists, in terms a future reader needs. Don't reference PR numbers,
  issue numbers, or ticket IDs (e.g. `#1646`, `fixes JIRA-123`); the scenario
  should be clear without chasing external links.

## Code style

- **Python**: ruff (line-length 99, target py310), mypy strict, isort with
  `known-first-party = ["omnigent"]`
- **Frontend**: oxlint (not ESLint), prettier (printWidth 100, double quotes,
  semicolons, trailing comma all). Path alias: `@/*` → `web/src/*`
- **Vendored code** (excluded from lint/typing): `agent_meow/inner/databricks_mcps/google/`,
  `omnigent/server/static/web-ui/` (built UI bundle)

## Rebrand note

This project was formerly "Omnigent" and has been rebranded to "agent-meow".
The Python package is `agent_meow`, with a thin `omnigent` compat shim.
See `docs/REBRAND_AUDIT.md` for the full rename roadmap.
