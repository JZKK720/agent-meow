# Plan 034: Electron Shell + Deep-Link Scheme + Compat Shim Removal + Final Cleanup

**Written against commit**: `a49b4479f` (2026-08-26)
**Depends on**: Plans 031, 032, 033 (all must be complete)
**Blocks**: Nothing (final plan)
**Effort**: M (Medium) — ~20 files, ~200 replacements
**Risk**: Low — mostly cleanup and removing backward-compat shims

---

## Goal

Complete the rebrand by renaming the remaining Electron shell references (`omnigent_cli.js`, `omnigent://` scheme comments, `__OMNIGENT_PATH_START__` sentinel), removing the `omnigent/__init__.py` compat shim, removing all backward-compat aliases/fallbacks added in Plans 031-033, and doing a final sweep to ensure zero "omnigent" references remain in source code.

## Why this matters

This is the final cleanup plan. Plans 031-033 do the heavy lifting but add backward-compat shims to avoid breaking existing users. This plan removes those shims once all consumers have migrated, completing the rebrand.

## Files in scope

### Electron shell
- `web/electron/src/omnigent_cli.js` → `web/electron/src/agent_meow_cli.js` (rename file + update all requires)
- `web/electron/src/main.js`: `require("./omnigent_cli")` → `require("./agent_meow_cli")`, `omnigentCli` variable → `agentMeowCli`
- `web/electron/src/main.js`: `__OMNIGENT_PATH_START__` sentinel → `__AGENT_MEOW_PATH_START__`
- `web/electron/src/deepLink.js`: `parseOmnigentDeepLink` → `parseAgentMeowDeepLink` (function name + export)
- `web/electron/src/loginShellPath.js`: `__OMNIGENT_PATH_START__` → `__AGENT_MEOW_PATH_START__`
- `web/electron/README.md`: all "Omnigent" references → "agent-meow"
- `web/electron/overlay/update-overlay.html`: `<title>Omnigent Update</title>` → `<title>agent-meow Update</title>` (if not done in Plan 033)

### Compat shim removal
- Delete `omnigent/__init__.py` (the `import omnigent` → `import agent_meow` redirect)
- Delete `omnigent/_build_info.py` (generated artifact in stale dir)
- Delete the `omnigent/` directory entirely
- Remove `omnigent*` from `pyproject.toml` `[tool.setuptools.packages.find] include` (already done in Plan 031)

### Backward-compat removal (from Plans 031-033)
- Remove `OmnigentError = AgentMeowError` alias from `agent_meow/errors.py`
- Remove `OmnigentClient = AgentMeowClient` alias from SDK
- Remove all `OMNIGENT_*` env var legacy fallbacks (the `os.environ.get("OMNIGENT_...")` fallback paths added in Plan 032)
- Remove `X-Omnigent-Client` header fallback from server
- Remove `mcp__omnigent__` tool prefix fallback from server
- Remove `omnigent.fork.source_id` / `omnigent.closed` label key fallbacks from server
- Remove `omnigent://` deep-link scheme alias from `deepLink.js` (keep only `agent-meow://`)
- Remove `omnigent://` argv prefix check from `main.js` (keep only `agent-meow://`)
- Remove `omnigent.egg-info` cleanup from `embed_python.js` (only clean `agent_meow.egg-info`)

### Final sweep
- `grep -ri "omnigent" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.css" --include="*.html" --include="*.md" --include="*.yml" --include="*.yaml" .` → should return 0 results (excluding `plans/030*`, `plans/031*`, `plans/032*`, `plans/033*`, `plans/034*` which document the rebrand, and `.venv/` / `node_modules/` / `embedded-python/` / `build/` / `dist/`)

### Stale egg-info cleanup
- Delete `omnigent.egg-info/` if it still exists
- Ensure `agent_meow.egg-info/` is the only egg-info (or use `agent-meow.egg-info/` if pip generates it with the new dist name)

## Files explicitly OUT of scope
- `plans/030-034*.md` — these analysis/plan documents keep "omnigent" in their content (they document the rebrand)
- `.venv/`, `node_modules/`, `web/electron/embedded-python/`, `build/`, `dist/` — generated/vendored dirs

## Steps

### Step 1: Rename Electron shell files

```bash
git mv web/electron/src/omnigent_cli.js web/electron/src/agent_meow_cli.js
```

Update all `require("./omnigent_cli")` → `require("./agent_meow_cli")` in `main.js` and tests.

### Step 2: Update remaining Electron references

- `main.js`: `omnigentCli` → `agentMeowCli`, `__OMNIGENT_PATH_START__` → `__AGENT_MEOW_PATH_START__`
- `deepLink.js`: `parseOmnigentDeepLink` → `parseAgentMeowDeepLink`
- `loginShellPath.js`: `__OMNIGENT_PATH_START__` → `__AGENT_MEOW_PATH_START__`
- `README.md`: all "Omnigent" → "agent-meow"
- `overlay/update-overlay.html`: title update

### Step 3: Delete compat shim

```bash
git rm -r omnigent/
```

This removes `omnigent/__init__.py` and `omnigent/_build_info.py`.

### Step 4: Remove backward-compat aliases

Remove all `OmnigentError = AgentMeowError`, `OmnigentClient = AgentMeowClient`, and similar aliases added in Plans 031-032.

Remove all `OMNIGENT_*` env var legacy fallback code paths.

Remove all server-side fallbacks for old header/label/policy names.

### Step 5: Remove legacy deep-link alias

In `deepLink.js`: remove `|| url.protocol !== "omnigent:"` from the protocol check (keep only `agent-meow:`).

In `main.js`: remove `|| arg.startsWith("omnigent://")` from argv checks (keep only `agent-meow://`).

### Step 6: Final sweep

```bash
# Should return 0 results (excluding plan docs and generated dirs)
grep -ri "omnigent" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.css" --include="*.html" --include="*.md" --include="*.yml" --include="*.yaml" . | grep -v "plans/03" | grep -v ".venv/" | grep -v "node_modules/" | grep -v "embedded-python/" | grep -v "build/" | grep -v "dist/"
```

### Step 7: Rebuild and verify

```bash
# Reinstall Python package
uv pip install -e . --no-build-isolation
# Rebuild SPA
cd web && npm run build
# Rebuild Electron (if needed)
cd electron && npm run build:win
# Run all tests
cd ../.. && uv run pytest tests/ -x -q
cd web && npm test
cd electron && node --test test/*.test.js
```

## Verification gates

1. `grep -ri "omnigent" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.css" --include="*.html" . | grep -v "plans/03" | grep -v ".venv/" | grep -v "node_modules/" | grep -v "embedded-python/" | grep -v "build/" | grep -v "dist/"` → 0 results
2. `python -c "import agent_meow; print('ok')"` → prints `ok`
3. `python -c "import omnigent"` → fails with `ModuleNotFoundError` (shim removed)
4. `pip show agent-meow` → shows correct name + version
5. `pip show omnigent` → fails (package not found)
6. `cd web && npm run type-check` → no errors
7. `cd web && npm test` → all pass
8. `cd web/electron && node --test test/*.test.js` → all pass
9. `uv run pytest tests/ -x -q` → all pass
10. `uv run mypy agent_meow/` → no new errors
11. Manual: Electron app launches, window title says "agent-meow", deep links with `agent-meow://` work

## Escape hatches

- If removing the `omnigent/__init__.py` shim breaks third-party packages that do `import omnigent`, keep the shim but add a `DeprecationWarning` instead of removing it entirely. Re-evaluate in the next release.
- If the final grep still finds "omnigent" in unexpected places, check if they're in generated files (`.egg-info`, `build/`) that will be regenerated.
- If the Electron app fails to launch after `omnigent_cli.js` rename, check for hardcoded `require("./omnigent_cli")` paths that were missed.

## Maintenance note

After this plan, the codebase has a single identity: "agent-meow". No backward-compat shims remain. Any user still on old env vars (`OMNIGENT_*`) or old deep links (`omnigent://`) will need to migrate. Document this in the release notes as a breaking change. The `omnigent/` directory is gone — if anyone needs the old import path, they must use `agent_meow` directly.