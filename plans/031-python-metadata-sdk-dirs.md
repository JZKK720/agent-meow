# Plan 031: Python Distribution Metadata + SDK Module Directory Rename

**Written against commit**: `a49b4479f` (2026-08-26)
**Depends on**: Nothing (foundation plan)
**Blocks**: Plans 032, 033, 034
**Effort**: L (Large) — ~50 files, ~600 replacements
**Risk**: Medium — breaking change for anyone with `pip install omnigent` or `import omnigent_client`

---

## Goal

Rename the PyPI distribution names from `omnigent*` to `agent-meow*` and rename the SDK module directories from `omnigent_*` to `agent_meow_*`, updating all import sites. After this plan, `pip install agent-meow` works and `import agent_meow_client` resolves.

## Why this matters

The rebrand renamed the main Python module (`omnigent/` → `agent_meow/`) but left the PyPI distribution name as `omnigent` and the SDK module dirs as `omnigent_client/` / `omnigent_ui_sdk/` / `omnigent_slack/`. This causes the Electron build to produce a wheel named `omnigent-0.9.0` (not `agent-meow-0.9.0`), and 36 files in `agent_meow/` import from un-renamed SDK packages.

## Files in scope

### pyproject.toml files (4)
- `pyproject.toml` (root) — distribution name, description, scripts, dependency pins, uv.sources, setuptools packages, coverage source, ruff paths, mypy modules
- `sdks/python-client/pyproject.toml` — name, description, cross-pin, uv.sources
- `sdks/ui/pyproject.toml` — name, description, cross-pin, packages
- `integrations/slack/pyproject.toml` — name, description, packages

### SDK module directory renames (3)
- `sdks/python-client/omnigent_client/` → `sdks/python-client/agent_meow_client/`
- `sdks/ui/omnigent_ui_sdk/` → `sdks/ui/agent_meow_ui_sdk/`
- `integrations/slack/src/omnigent_slack/` → `integrations/slack/src/agent_meow_slack/`

### Import site updates (~36 files in agent_meow/, ~27 test files)
All files that `import omnigent_client`, `import omnigent_ui_sdk`, or `import omnigent_slack` must be updated to `import agent_meow_client`, etc.

### Other files
- `scripts/update_versions.py` — package name data
- `web/electron/build/embed_python.js` — egg-info path, SDK package name comments
- `setup.py` — already fixed in Option B (paths only; env vars deferred to Plan 032)
- `omnigent/__init__.py` — compat shim (keep for now, delete in Plan 034)

## Files explicitly OUT of scope
- `agent_meow/` internal symbols (`OmnigentError`, `OmnigentClient`, etc.) — Plan 032
- `OMNIGENT_*` environment variables — Plan 032
- Frontend (`web/src/`, `web/electron/src/`) — Plan 033/034
- Database schema — Plan 032
- `omnigent/__init__.py` compat shim deletion — Plan 034

## Steps

### Step 1: Rename SDK module directories

```bash
cd C:\Users\1\github-pr\agent-meow
git mv sdks/python-client/omnigent_client sdks/python-client/agent_meow_client
git mv sdks/ui/omnigent_ui_sdk sdks/ui/agent_meow_ui_sdk
git mv integrations/slack/src/omnigent_slack integrations/slack/src/agent_meow_slack
```

**Verify**: `ls sdks/python-client/agent_meow_client/__init__.py` exists.

### Step 2: Update pyproject.toml files

#### `pyproject.toml` (root)
- Line 6: `name = "omnigent"` → `name = "agent-meow"`
- Line 9: `description = "Omnigent: declarative agent authoring and runtime framework"` → `description = "agent-meow: agent workspace surface with Docs, Images, and Voice"`
- Line 29: `"omnigent-client==0.9.0"` → `"agent-meow-client==0.9.0"`
- Line 30: `"omnigent-ui-sdk==0.9.0"` → `"agent-meow-ui-sdk==0.9.0"`
- Line 240: `slack = ["omnigent-slack"]` → `slack = ["agent-meow-slack"]`
- Line 340: `omnigent = "agent_meow.cli:main"` → `agent-meow = "agent_meow.cli:main"` (keep `omni` alias)
- Lines 345-349: `omnigent-client` → `agent-meow-client`, `omnigent-ui-sdk` → `agent-meow-ui-sdk`, `omnigent-slack` → `agent-meow-slack` in `[tool.uv.sources]`
- Line 374: `include = ["agent_meow*", "omnigent*"]` → `include = ["agent_meow*"]`
- Line 445: `source = ["omnigent"]` → `source = ["agent_meow"]`
- Lines 558-582: All ruff per-file-ignores paths `omnigent/...` → `agent_meow/...`
- Line 607: mypy exclude `^omnigent/...` → `^agent_meow/...`
- Lines 778, 786, 795: mypy override modules `omnigent_ui_sdk.*` → `agent_meow_ui_sdk.*`, `omnigent_client.*` → `agent_meow_client.*`, `omnigent_slack.*` → `agent_meow_slack.*`
- Line 524: `known-first-party = ["omnigent"]` → `known-first-party = ["agent_meow"]`

#### `sdks/python-client/pyproject.toml`
- Line 6: `name = "omnigent-client"` → `name = "agent-meow-client"`
- Line 8: description update
- Line 19: `"omnigent==0.9.0"` → `"agent-meow==0.9.0"`
- Line 25: `omnigent = { path = "../..", editable = true }` → `agent-meow = { path = "../..", editable = true }`

#### `sdks/ui/pyproject.toml`
- Line 6: `name = "omnigent-ui-sdk"` → `name = "agent-meow-ui-sdk"`
- Line 8: description update
- Line 16: `"omnigent-client==0.9.0"` → `"agent-meow-client==0.9.0"`
- Line 22-24: Update comment (remove stale "rebrand renamed" text)
- Line 27: `packages = ["omnigent_ui_sdk"]` → `packages = ["agent_meow_ui_sdk"]`

#### `integrations/slack/pyproject.toml`
- Line 6: `name = "omnigent-slack"` → `name = "agent-meow-slack"`
- Line 8: description update
- Line 23: `packages = ["src/omnigent_slack"]` → `packages = ["src/agent_meow_slack"]`

### Step 3: Update all import sites

Search and replace across `agent_meow/`, `tests/`, `integrations/slack/tests/`, `dev/`:

```
omnigent_client  → agent_meow_client
omnigent_ui_sdk  → agent_meow_ui_sdk
omnigent_slack   → agent_meow_slack
```

**IMPORTANT**: Only replace import/module references, NOT class names like `OmnigentClient`, `OmnigentError` (those are Plan 032). Use regex to match `import omnigent_client` and `from omnigent_client` patterns.

**Verify**: `grep -r "import omnigent_client\|from omnigent_client" agent_meow/ tests/` returns 0 results.

### Step 4: Update `scripts/update_versions.py`

Lines 90-102: Change package names from `"omnigent"`, `"omnigent-client"`, `"omnigent-ui-sdk"` to `"agent-meow"`, `"agent-meow-client"`, `"agent-meow-ui-sdk"`.

### Step 5: Update `web/electron/build/embed_python.js`

- Line 120: `path.join(repoRoot, "omnigent.egg-info")` → `path.join(repoRoot, "agent_meow.egg-info")` (already partially fixed in Option B — update the remaining reference)
- Lines 132-137: Update comments referencing `omnigent-client` / `omnigent-ui-sdk` → `agent-meow-client` / `agent-meow-ui-sdk`

### Step 6: Update SDK internal docstrings/logging

In `sdks/python-client/agent_meow_client/` (renamed dir):
- `__init__.py`: docstring `omnigent client SDK` → `agent-meow client SDK`
- `_client.py`: `class OmnigentClient` → keep class name (Plan 032), but update `logging.getLogger("omnigent_client...")` → `logging.getLogger("agent_meow_client...")`
- `_errors.py`: `class OmnigentError` → keep (Plan 032), update docstring
- `_server.py`: `mkdtemp(prefix="omnigent-client-")` → `mkdtemp(prefix="agent-meow-client-")`
- All `logging.getLogger("omnigent_client.*")` → `logging.getLogger("agent_meow_client.*")`

### Step 7: Reinstall and verify

```bash
# Reinstall the package with new name
uv pip install -e . --no-build-isolation
# Verify the distribution name
pip show agent-meow | head -5
# Verify imports work
python -c "import agent_meow_client; print(agent_meow_client.__name__)"
python -c "import agent_meow_ui_sdk; print(agent_meow_ui_sdk.__name__)"
# Verify old imports still work via compat shim
python -c "import omnigent; print(omnigent.__name__)"
```

## Verification gates

1. `python -c "import agent_meow; print('ok')"` → prints `ok`
2. `python -c "import agent_meow_client; print('ok')"` → prints `ok`
3. `python -c "import agent_meow_ui_sdk; print('ok')"` → prints `ok`
4. `pip show agent-meow` → shows `Name: agent-meow`, `Version: 0.9.1`
5. `grep -r "import omnigent_client\|from omnigent_client" agent_meow/ tests/` → 0 results
6. `uv run pytest tests/spec/ -x -q` → all pass
7. `uv run mypy agent_meow/spec/` → no new errors

## Escape hatches

- If `import agent_meow_client` fails after the directory rename, check for `__init__.py` files that re-export with hardcoded `omnigent_client` paths.
- If pip install fails with a circular dependency error, install SDKs with `--no-deps` first (same pattern as `embed_python.js`).
- If tests fail on `OmnigentClient` class references, that's expected — class names are renamed in Plan 032. Do NOT rename classes in this plan.

## Maintenance note

Future version bumps via `scripts/update_versions.py` will now use `agent-meow*` names. The `omnigent/__init__.py` compat shim stays until Plan 034 deletes it. Anyone with `pip install omnigent` will need to switch to `pip install agent-meow`.