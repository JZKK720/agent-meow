# Rebrand Audit — agent-meow

This document tracks the ongoing rebrand from the upstream **Omnigent** name
to **agent-meow**. It is the review artifact for the rebrand PRs and the
entry point for the follow-up distribution rename program.

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Root narrative docs (README, CHANGELOG, CONTRIBUTING, SECURITY, RELEASING, PR template) | ✅ Done |
| 2 | Legal/NOTICE derivative attribution | ✅ Done |
| 3 | Public API metadata (FastAPI title, api_only_landing.html, openapi.json) | ✅ Done |
| 4 | Source code docstrings/comments (`omnigent/**/*.py` — 228 files, 2147 replacements) | ✅ Done |
| 5 | Deploy docs and templates (`deploy/**` — 18+ files) | ✅ Done |
| 6 | Web/mobile/Electron app naming (`web/**`, `editors/vscode/**`) | ✅ Done |
| 7 | CI workflows and `.github/` config | ✅ Done |
| 8 | `.claude/` skills and `dev/` lint docs | ✅ Done |
| 9 | `tests/` docstrings | ✅ Done |
| 10 | `designs/` and `docs/` design docs | ✅ Done |
| 11 | `examples/` agent configs | ✅ Done |
| 12 | `scripts/` installer and tooling | ✅ Done |
| 13 | Distribution rename (`meow` / `meow-client` / `meow-ui-sdk`) | ⏳ Deferred |
| 14 | CLI entry points (`meow`, `agent-meow` console scripts) | ⏳ Deferred |
| 15 | `OMNIGENT_*` env-var prefix migration | ⏳ Deferred |
| 16 | GHCR image names (`ghcr.io/omnigent-ai/omnigent-*`) | ⏳ Deferred |
| 17 | Python module/import path rename (`omnigent/` → `meow/`) | ⏳ Deferred |
| 18 | Repo URLs in CI conditionals (`github.repository == 'omnigent-ai/omnigent'`) | ⏳ Deferred |

## What was changed

### Phase 1–3: Root docs, legal, and public API metadata

- **README.md** — rewritten as agent-meow-first; embedded upstream agent-meow
  README removed; upstream links replaced with repo-local references or
  attribution-only mentions.
- **CHANGELOG.md** — product name changed to agent-meow; upstream release
  links retained as historical attribution.
- **CONTRIBUTING.md** — title and intro rewritten for agent-meow; fork
  lineage noted; clone URL annotated.
- **SECURITY.md** — reporting endpoint clarified for the fork; upstream
  vulnerability reporting noted.
- **RELEASING.md** — title and intro rewritten; distribution names kept as
  `omnigent*` with a deferred-rename note.
- **NOTICE** — updated to identify agent-meow as a derivative work of
  agent-meow (Databricks, Inc.), preserving upstream and third-party notices.
- **.github/pull_request_template.md** — changelog example annotated with
  current CLI name reality.
- **omnigent/server/app.py** — FastAPI title changed from
  `"agent-meow Server"` to `"agent-meow Server"`.
- **omnigent/server/static/api_only_landing.html** — page title, heading, and
  upstream repo link replaced with agent-meow naming and repo-local guidance.
- **openapi.json** — `info.title` and `info.description` updated; all
  capitalized "agent-meow" in schema descriptions replaced.

### Phase 4: Source code docstrings (228 files, 2147 replacements)

All capitalized "agent-meow" in docstrings and comments across `omnigent/**/*.py`
replaced with "agent-meow". Code identifiers (`OmnigentError`, `OmnigentClient`,
`omnigent` module paths, CLI commands, env vars, label keys) preserved.

### Phase 5: Deploy docs and templates (18+ files)

All `deploy/**` READMEs and config files updated. Product name "agent-meow" →
"agent-meow" in prose. GHCR image names, CLI commands, env vars, and Docker
service names preserved.

### Phase 6: Web/mobile/Electron/VS Code (29+ files)

`web/**` (Electron, iOS, Android, service worker, Vite config), `editors/vscode/**`
(extension source, tests, package.json, PUBLISHING.md) all updated. App store
metadata, plist files, Xcode project files, and Android manifest updated.

### Phase 7: CI workflows and .github/ config (16+ files)

Workflow comments, agent configs, area definitions, and UI preview app updated.
Functional CI conditionals (`github.repository == 'omnigent-ai/omnigent'`) and
bot names preserved.

### Phase 8: .claude/ skills and dev/ lint (10 files)

All `.claude/skills/**` SKILL.md files and helper scripts updated. `dev/lint/`
scripts updated.

### Phase 9: tests/ docstrings (5 files)

Test docstrings in `tests/conftest.py`, `tests/db/`, `tests/inner/`, `tests/repl/`
updated. Module paths and upstream issue refs preserved.

### Phase 10: designs/ and docs/ (20+ files)

All design docs and surface docs updated. Module paths, upstream issue/PR refs,
and code identifiers preserved.

### Phase 11: examples/ (6+ files)

Agent config YAML files updated. CLI commands and `executor.type: omnigent`
preserved.

### Phase 12: scripts/ (3 files)

Installer, OpenAPI dump script, and version sync script updated. Package names
and CLI commands preserved.

## Deferred surfaces (intentionally retained as `omnigent`)

### Distribution and package names

| File | Surface | Notes |
| --- | --- | --- |
| `pyproject.toml` | `name = "omnigent"` | SDK dependency compatibility |
| `pyproject.toml` | `omnigent-client==`, `omnigent-ui-sdk==` pins | Lockstep versioning |
| `pyproject.toml` | `[project.scripts]` `omnigent` / `omni` | CLI entry points |
| `sdks/python-client/pyproject.toml` | `name = "omnigent-client"` | SDK package |
| `sdks/ui/pyproject.toml` | `name = "omnigent-ui-sdk"` | SDK package |
| `uv.lock` | `omnigent`, `omnigent-client`, `omnigent-ui-sdk` entries | Lockfile |
| `scripts/update_versions.py` | Distribution name references | Version bump logic |
| `.github/workflows/release-omnigent.yml` | Workflow name and package refs | Release pipeline |

### Python module and import paths

| Surface | Notes |
| --- | --- |
| `omnigent/` package directory | Vendored runtime; rename would break all imports |
| `omnigent_client` / `omnigent_ui_sdk` import names | SDK import paths |
| `omnigent.spec._omnigent_compat` | Compatibility shim |

### Environment variables (`OMNIGENT_*`)

The `OMNIGENT_` prefix is used by ~140+ env vars across the codebase. A
sample of the most user-facing:

| Env var | Purpose |
| --- | --- |
| `OMNIGENT_CONFIG_HOME` | Config directory override |
| `OMNIGENT_DATA_DIR` | Data directory override |
| `OMNIGENT_AUTH_PROVIDER` | Auth mode (header / oidc / accounts) |
| `OMNIGENT_AUTH_ENABLED` | Multi-user toggle |
| `OMNIGENT_SKIP_WEB_UI` | Skip web UI build |
| `OMNIGENT_NO_UPDATE_CHECK` | Silence update nag |
| `OMNIGENT_INDEX_URL` | Package index override |
| `OMNIGENT_OIDC_*` | OIDC configuration |
| `OMNIGENT_ACCOUNTS_*` | Accounts auth configuration |
| `OMNIGENT_RUNNER_WORKSPACE` | Runner workspace path |

A migration would need a compatibility shim (read both `OMNIGENT_*` and the
new prefix) to avoid breaking existing deployments.

### GHCR images

| Image | Used by |
| --- | --- |
| `ghcr.io/omnigent-ai/omnigent-server` | All deploy templates |
| `ghcr.io/omnigent-ai/omnigent-host` | Sandbox host image |
| `ghcr.io/omnigent-ai/omnigent-server-openshell` | OpenShell variant |

### Repo URLs in code

| File | Surface |
| --- | --- |
| `omnigent/update_check.py` | Install/upgrade URL |
| `omnigent/onboarding/databricks_config.py` | `_SOURCE_REPO_URL` |
| `omnigent/repl/_repl.py` | Issue reporting URL |
| `omnigent/server/static/api_only_landing.html` | Already updated to repo-local |

### Deploy templates

All files under `deploy/` reference `ghcr.io/omnigent-ai/omnigent-*` images
and `github.com/omnigent-ai/omnigent` URLs. These should be updated when the
GHCR images and repo URL are finalized.

### CI workflows

`.github/workflows/*.yml` files check `github.repository == 'omnigent-ai/omnigent'`
and reference `omnigent-ai/omnigent-site` for docs staging. These need to be
updated when the repo is renamed or the fork moves to its own org.

### Web and mobile apps

| Surface | Notes |
| --- | --- |
| `web/electron/` | "agent-meow Desktop" naming, `omnigent.ai` links |
| `web/ios/` | "agent-meow iOS" naming, `omnigent.ai` links |
| `web/android/` | "agent-meow Android" naming, `ai.omnigent.android` package |
| `web/electron/setup/index.html` | Install URL pointing to upstream |
| `web/electron/src/omnigent_cli.js` | Install command pointing to upstream |

### Tests

Tests under `tests/` reference `omnigent-ai/omnigent` URLs, `ghcr.io/omnigent-ai/*`
images, and `omnigent` package names. These should be updated alongside the
corresponding code changes, not independently.

## Follow-up rename plan

1. **Distribution rename** — rename PyPI packages to `meow`, `meow-client`,
   `meow-ui-sdk`. Update `pyproject.toml` (root + SDKs), `uv.lock`,
   `scripts/update_versions.py`, and release workflows. Decide whether
   `omnigent` / `omni` remain as temporary compatibility aliases.

2. **CLI entry points** — add `meow` and `agent-meow` as first-class console
   scripts alongside (or replacing) `omnigent` / `omni`.

3. **Env-var migration** — introduce a new prefix (e.g. `MEOW_*`) with a
   compatibility shim that reads both `OMNIGENT_*` and `MEOW_*` during a
   deprecation window.

4. **GHCR images** — publish new images under the fork's GHCR namespace;
   update all deploy templates and sandbox defaults.

5. **Repo URLs** — update all hardcoded `github.com/omnigent-ai/omnigent`
   and `omnigent.ai` URLs to the fork's canonical URLs (pending
   cubecloud.io asset decisions).

6. **CI workflows** — update repository checks, docs staging, and release
   pipelines for the fork's repo location.

7. **Web/mobile apps** — rename Electron, iOS, and Android apps; update
   install URLs, deep links, and app store metadata.