# Rebrand Audit — agent-meow

This document tracks the ongoing rebrand from the upstream **agent-meow** name
to **agent-meow**. It is the review artifact for the rebrand PRs and the
entry point for the follow-up distribution rename program.

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Root narrative docs (README, CHANGELOG, CONTRIBUTING, SECURITY, RELEASING, PR template) | ✅ Done |
| 2 | Legal/NOTICE derivative attribution | ✅ Done |
| 3 | Public API metadata (FastAPI title, api_only_landing.html, openapi.json) | ✅ Done |
| 4 | Source code docstrings/comments (`agent_meow/**/*.py` — 228 files, 2147 replacements) | ✅ Done |
| 5 | Deploy docs and templates (`deploy/**` — 18+ files) | ✅ Done |
| 6 | Web/mobile/Electron app naming (`web/**`, `editors/vscode/**`) | ✅ Done |
| 7 | CI workflows and `.github/` config | ✅ Done |
| 8 | `.claude/` skills and `dev/` lint docs | ✅ Done |
| 9 | `tests/` docstrings | ✅ Done |
| 10 | `designs/` and `docs/` design docs | ✅ Done |
| 11 | `examples/` agent configs | ✅ Done |
| 12 | `scripts/` installer and tooling | ✅ Done |
| 13 | Distribution rename (`meow` / `meow-client` / `meow-ui-sdk`) | ⏳ Deferred |
| 14 | CLI entry points (`meow`, `agent-meow` console scripts) | ✅ Done |
| 15 | `OMNIGENT_*` env-var prefix migration | ⏳ Deferred |
| 16 | GHCR image names (`ghcr.io/JZKK720/agent-meow-*`) | ✅ Done |
| 17 | Python module/import path rename (`agent_meow/` → `meow/`) | ⏳ Deferred |
| 18 | Repo URLs in CI conditionals (`github.repository == 'JZKK720/agent-meow'`) | ✅ Done |
| 19 | Cubecloud legal-clarity rebrand (copyright, bundle IDs, URLs, domain) | ✅ Done |

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
  `agent-meow*` with a deferred-rename note.
- **NOTICE** — updated to identify agent-meow as a derivative work of
  agent-meow (Databricks, Inc.), preserving upstream and third-party notices.
- **.github/pull_request_template.md** — changelog example annotated with
  current CLI name reality.
- **agent_meow/server/app.py** — FastAPI title changed from
  `"meow server"` to `"agent-meow Server"`.
- **agent_meow/server/static/api_only_landing.html** — page title, heading, and
  upstream repo link replaced with agent-meow naming and repo-local guidance.
- **openapi.json** — `info.title` and `info.description` updated; all
  capitalized "agent-meow" in schema descriptions replaced with "agent-meow".

### Phase 4: Source code docstrings (228 files, 2147 replacements)

All capitalized "agent-meow" in docstrings and comments across `agent_meow/**/*.py`
replaced with "agent-meow". Code identifiers (`OmnigentError`, `OmnigentClient`,
`agent-meow` module paths, CLI commands, env vars, label keys) preserved.

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
Functional CI conditionals (`github.repository == 'JZKK720/agent-meow'`) and
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

Agent config YAML files updated. CLI commands and `executor.type: agent-meow`
preserved.

### Phase 12: scripts/ (3 files)

Installer, OpenAPI dump script, and version sync script updated. Package names
and CLI commands preserved.

## Deferred surfaces (intentionally retained as `agent-meow`)

### Distribution and package names

| File | Surface | Notes |
| --- | --- | --- |
| `pyproject.toml` | `name = "agent-meow"` | SDK dependency compatibility |
| `pyproject.toml` | `agent-meow-client==`, `agent-meow-ui-sdk==` pins | Lockstep versioning |
| `pyproject.toml` | `[project.scripts]` `agent-meow` / `omni` | CLI entry points |
| `sdks/python-client/pyproject.toml` | `name = "agent-meow-client"` | SDK package |
| `sdks/ui/pyproject.toml` | `name = "agent-meow-ui-sdk"` | SDK package |
| `uv.lock` | `agent-meow`, `agent-meow-client`, `agent-meow-ui-sdk` entries | Lockfile |
| `scripts/update_versions.py` | Distribution name references | Version bump logic |
| `.github/workflows/release-agent_meow.yml` | Workflow name and package refs | Release pipeline |

### Python module and import paths

| Surface | Notes |
| --- | --- |
| `agent_meow/` package directory | Vendored runtime; rename would break all imports |
| `omnigent_client` / `omnigent_ui_sdk` import names | SDK import paths |
| `agent_meow.spec._omnigent_compat` | Compatibility shim |

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
| `ghcr.io/JZKK720/agent-meow-server` | All deploy templates |
| `ghcr.io/JZKK720/agent-meow-host` | Sandbox host image |
| `ghcr.io/JZKK720/agent-meow-server-openshell` | OpenShell variant |

### Repo URLs in code

| File | Surface |
| --- | --- |
| `agent_meow/update_check.py` | Install/upgrade URL |
| `agent_meow/onboarding/databricks_config.py` | `_SOURCE_REPO_URL` |
| `agent_meow/repl/_repl.py` | Issue reporting URL |
| `agent_meow/server/static/api_only_landing.html` | Already updated to repo-local |

### Deploy templates

All files under `deploy/` reference `ghcr.io/JZKK720/agent-meow-*` images
and `github.com/JZKK720/agent-meow` URLs. These should be updated when the
GHCR images and repo URL are finalized.

### CI workflows

`.github/workflows/*.yml` files check `github.repository == 'JZKK720/agent-meow'`
and reference `JZKK720/agent-meow-site` for docs staging. These need to be
updated when the repo is renamed or the fork moves to its own org.

### Web and mobile apps

| Surface | Notes |
| --- | --- |
| `web/electron/` | "agent-meow Desktop" naming, `cubecloud.io` links |
| `web/ios/` | "agent-meow iOS" naming, `cubecloud.io` links |
| `web/android/` | "agent-meow Android" naming, `ai.agent_meow.android` package |
| `web/electron/setup/index.html` | Install URL pointing to upstream |
| `web/electron/src/omnigent_cli.js` | Install command pointing to upstream |

### Tests

Tests under `tests/` reference `JZKK720/agent-meow` URLs, `ghcr.io/JZKK720/*`
images, and `agent-meow` package names. These should be updated alongside the
corresponding code changes, not independently.

## Follow-up rename plan

1. **Distribution rename** — rename PyPI packages to `meow`, `meow-client`,
   `meow-ui-sdk`. Update `pyproject.toml` (root + SDKs), `uv.lock`,
   `scripts/update_versions.py`, and release workflows. Decide whether
   `agent-meow` / `omni` remain as temporary compatibility aliases.

2. ~~**CLI entry points** — add `meow` and `agent-meow` as first-class console
   scripts alongside (or replacing) `agent-meow` / `omni`.~~ ✅ Done (Phase 19)

3. **Env-var migration** — introduce a new prefix (e.g. `MEOW_*`) with a
   compatibility shim that reads both `OMNIGENT_*` and `MEOW_*` during a
   deprecation window.

4. ~~**GHCR images** — publish new images under the fork's GHCR namespace;
   update all deploy templates and sandbox defaults.~~ ✅ Done (Phase 19:
   `ghcr.io/JZKK720/agent-meow-*`)

5. ~~**Repo URLs** — update all hardcoded `github.com/JZKK720/agent-meow`
   and `cubecloud.io` URLs to the fork's canonical URLs (pending
   cubecloud.io asset decisions).~~ ✅ Done (Phase 19: `github.com/JZKK720/agent-meow`
   + `cubecloud.io`)

6. ~~**CI workflows** — update repository checks, docs staging, and release
   pipelines for the fork's repo location.~~ ✅ Done (Phase 19)

7. ~~**Web/mobile apps** — rename Electron, iOS, and Android apps; update
   install URLs, deep links, and app store metadata.~~ ✅ Done (Phase 19)

## Phase 19: Cubecloud legal-clarity rebrand

The initial rebrand (Phases 1–12) replaced user-facing strings from "agent-meow"
to "agent-meow" while retaining the `agent_meow/` Python module path and upstream
attribution. The **Cubecloud legal-clarity rebrand** (Phase 19) redefines the
legal identity and product positioning for **智方云 (Cubecloud)** as the copyright
holder, positioning agent-meow as the software surface for **ColorFire** and
**Meow series AIPC and Laptops**.

### What changed

**Legal identity:**
- `NOTICE` — copyright holder changed from "agent-meow contributors" to
  "智方云 (Cubecloud)"; derivative-work attribution simplified to minimal
  Apache-2.0 §4(c) compliant note (no Databricks, Inc. name in the primary
  block; third-party dependency notices retained as-is)
- `pyproject.toml` — `authors` updated to `智方云 (Cubecloud)`; `description`
  updated with ColorFire/Meow product context
- `README.md` — Attribution section rewritten for Cubecloud positioning

**Product positioning:**
- `README.md` — intro repositioned as "agent workspace surface for ColorFire
  and Meow series AIPC and Laptops"
- `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `RELEASING.md` — fork
  attribution replaced with Cubecloud product context

**Repo URLs and domain:**
- All `github.com/JZKK720/agent-meow` → `github.com/JZKK720/agent-meow`
- All `cubecloud.io` → `cubecloud.io`
- Source code URLs: `agent_meow/update_check.py`, `agent_meow/onboarding/databricks_config.py`,
  `agent_meow/repl/_repl.py`
- Deploy templates, SDK READMEs, VS Code extension, Electron/iOS install URLs
- CI workflow repository conditionals and bot email
- Test fixtures updated to match new repo URL

**App bundle IDs:**
- Electron: `ai.agent_meow.desktop` → `io.cubecloud.agentmeow.desktop`
- iOS: `ai.agent_meow.ios` → `io.cubecloud.agentmeow.ios` (+ `.tests` / `.uitests`)
- Android: `ai.agent_meow.android` → `io.cubecloud.agentmeow.android`
  (Kotlin files moved from `ai/agent_meow/android/` to `io/cubecloud/agentmeow/`)
- CSS custom properties: `--agent-meow-android-safe-area-*` → `--agentmeow-android-safe-area-*`
- Apple team ID placeholder `<CUBECLOUD_TEAM_ID>` used throughout (Cubecloud
  needs its own Apple Developer enrollment)

**CLI entry points:**
- `meow` and `agent-meow` added as console script aliases alongside `agent-meow`
  and `omni`

**GHCR images:**
- `ghcr.io/JZKK720/agent-meow-*` → `ghcr.io/JZKK720/agent-meow-*` in all
  CI workflows and deploy references

### Out-of-codebase prerequisites

- **Apple Developer enrollment** — Cubecloud needs its own Apple Developer
  team ID to replace `<CUBECLOUD_TEAM_ID>` in signing configs. The Databricks
  team ID (`8RMX4WU6F8`) is no longer referenced.
- **GHCR namespace** — `ghcr.io/JZKK720/agent-meow-*` images need to be
  published before deploy templates will pull successfully.
- **Domain** — `cubecloud.io` needs to host the quickstart/install and
  docs/privacy pages referenced by Electron and iOS apps.

### Still deferred

| Surface | Reason |
| --- | --- |
| PyPI distribution name (`agent-meow` → `meow`) | Breaks SDK dependency pins; needs co-release |
| `OMNIGENT_*` env-var prefix → `MEOW_*` | 140+ vars; needs compatibility shim |
| Python module path (`agent_meow/` → `meow/`) | ~228 files; breaks all imports |
| `cubecloud.io/role` Kubernetes label | Functional runtime identifier (cross-pod contract) |
| Historical issue/PR links in `designs/` | Factual references to upstream history |
| Databricks integration code | Functional platform integration, not branding |