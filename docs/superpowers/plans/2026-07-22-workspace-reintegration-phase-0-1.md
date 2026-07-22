# Workspace Reintegration — Phase 0+1: Path-Rename Revert + Full Merge

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert the `agent_meow/ → omnigent/` directory rename + pyproject name/CLI changes so the git tree matches upstream's `omnigent/` layout, then merge all 547 upstream commits in one operation with path-level conflicts eliminated.

**Architecture:** agent-meow commit `7efd8ac1` renamed `omnigent/ → agent_meow/`. Upstream never renamed. A raw `git merge upstream/main` would re-add the entire `omnigent/` directory as a new tree alongside our `agent_meow/`, producing a 2x codebase. Reverting the rename first aligns paths, making the merge a standard file-level conflict resolution. The `agent_meow/` rename + branding gets re-applied in Phase 4 (separate plan).

**Tech Stack:** Git, Python 3.12+ (`uv`), pytest, ruff, mypy

## Global Constraints

- **Dev OS:** macOS or Linux (WSL2). Windows is not directly supported — `pexpect`/`pyte` are excluded on Windows. Use WSL2 (Ubuntu) for any command that fails on Windows.
- **Python:** 3.12+ (`.python-version` = 3.12), managed via `uv`
- **Setup:** `uv sync --extra all --extra dev` then `source .venv/bin/activate` (or prefix with `uv run`)
- **Backend test:** `uv run pytest` (unit tests only; e2e/live/integration skipped by default)
- **Lint:** `uv run ruff check .`
- **Type check:** `uv run mypy agent_meow` (strict)
- **Pre-commit:** `uv run pre-commit run --all-files`
- **DCO:** `git commit -s` (sign-off required)
- **Upstream remote:** `https://github.com/JZKK720/omnigent.git` (already added as `upstream`, fetched `upstream/main` at `24831901`)
- **Merge-base:** `b9332cc655b2ad7dbe70d2ad5b9cd78214dd3e17`
- **Our HEAD:** `49ca5128`
- **Rename commit to revert:** `7efd8ac19e913757e8d4325736a72aec61c402ab`
- **Distribution rename commit:** `b61e015ad86880b6c5f5aa528afbdb1350e3b0b9`
- **Spec:** `docs/superpowers/specs/2026-07-22-workspace-reintegration-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `omnigent/` (directory) | Rename from `agent_meow/` | Python package — restored to upstream's layout |
| `omnigent/__init__.py` | Restore from upstream | Package init — the compat shim at `omnigent/__init__.py` gets replaced by upstream's version |
| `pyproject.toml` | Modify | `name` back to `omnigent`, `[project.scripts]` back to `omni` only |
| `sdks/python-client/pyproject.toml` | Modify | `name` back to `omnigent-client`, dep pin back to `omnigent` |
| `sdks/ui/pyproject.toml` | Modify | `name` back to `omnigent-ui-sdk`, dep pin back to `omnigent-client` |
| All `*.py` files | Find-replace | `from agent_meow` → `from omnigent`, `import agent_meow` → `import omnigent` |
| `uv.lock` | Regenerate | Package name entries updated |

**Out of scope (do NOT touch in this plan):**
- Branding assets (mascot PNGs, palette CSS, wordmark) — Phase 4
- README/CHANGELOG/NOTICE/deploy docs — Phase 4
- Docstrings/comments referencing "agent-meow" — Phase 4
- `web/` front-end adaptation — Phase 3
- Backend tool reconciliation — Phase 2
- i18n files — Phase 4

---

### Task 1: Create integration branch

**Files:**
- None (git operation only)

**Interfaces:**
- Produces: `reintegration/staging` branch from `main` at `49ca5128`

- [ ] **Step 1: Create the branch**

```bash
git checkout main
git pull origin main
git checkout -b reintegration/staging
```

- [ ] **Step 2: Verify branch**

Run: `git branch --show-current`
Expected: `reintegration/staging`

- [ ] **Step 3: Verify upstream is fetched**

Run: `git rev-parse --short upstream/main`
Expected: `24831901`

If this fails, run: `git fetch upstream main`

- [ ] **Step 4: Commit checkpoint**

```bash
git commit --allow-empty -s -m "chore: create reintegration/staging branch"
```

---

### Task 2: Revert the directory rename (omnigent/ → agent_meow/ → omnigent/)

**Files:**
- Rename: `agent_meow/` → `omnigent/`
- Delete: `omnigent/__init__.py` (the compat shim — upstream has its own)
- Modify: all `*.py` files — `from agent_meow` → `from omnigent`, `import agent_meow` → `import omnigent`

**Interfaces:**
- Produces: `omnigent/` directory matching upstream's layout (pre-merge)

**Escape hatch:** if `git revert 7efd8ac1` produces unresolvable conflicts (because later commits touched the renamed paths), STOP and use the manual fallback:
```bash
git mv agent_meow omnigent
# Then find-replace imports (Step 3 below)
```

- [ ] **Step 1: Attempt the revert**

```bash
git revert 7efd8ac1 --no-commit
```

If this produces conflicts in files that were heavily modified after the rename, abort and use the manual fallback:
```bash
git revert --abort
git mv agent_meow omnigent
```

- [ ] **Step 2: If manual fallback was used, remove the compat shim**

The old `omnigent/__init__.py` was a compat shim that redirected to `agent_meow`. After the rename, it needs to be the real package init. Check what's there:

```bash
head -5 omnigent/__init__.py
```

If it says "Compatibility shim: redirects import omnigent → import agent_meow", delete it — upstream's `omnigent/__init__.py` will come in during the merge:
```bash
git rm omnigent/__init__.py
```

If it's already the real init (not a shim), leave it.

- [ ] **Step 3: Find-replace all Python imports**

If the revert didn't automatically fix imports (likely if manual fallback was used):

```bash
# On macOS/Linux:
find . -name "*.py" -not -path "./.venv/*" -not -path "./node_modules/*" | xargs sed -i 's/from agent_meow/from omnigent/g; s/import agent_meow/import omnigent/g'

# On Windows (PowerShell, if not using WSL):
Get-ChildItem -Recurse -Filter "*.py" | Where-Object { $_.FullName -notmatch "\.venv|node_modules" } | ForEach-Object { (Get-Content $_.FullName) -replace 'from agent_meow', 'from omnigent' -replace 'import agent_meow', 'import omnigent' | Set-Content $_.FullName }
```

- [ ] **Step 4: Verify the rename**

Run: `ls omnigent/__init__.py`
Expected: file exists

Run: `ls agent_meow/ 2>&1`
Expected: "No such file or directory" (the old directory is gone)

- [ ] **Step 5: Verify imports resolve**

```bash
uv sync --extra all --extra dev
uv run python -c "import omnigent; print('OK')"
```

Expected: `OK`

If this fails with `ModuleNotFoundError: No module named 'omnigent'`, check that `pyproject.toml` package discovery includes `omnigent/` — it may still reference `agent_meow`. Fix:
```bash
# Check the [tool.setuptools.packages.find] section
grep -n "agent_meow" pyproject.toml
# Replace any remaining agent_meow references with omnigent
```

- [ ] **Step 6: Run collect-only to check imports**

```bash
uv run pytest tests/ -x --co 2>&1 | tail -5
```

Expected: collection completes without `ImportError` for `agent_meow`. There may be other errors (test files referencing old paths) — those are expected and will be fixed in later tasks.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -s -m "revert: agent_meow/ → omnigent/ module path rename

Reverts 7efd8ac1 to align the git tree with upstream's omnigent/ layout
before the merge. The agent_meow/ rename will be re-applied in Phase 4
(branding re-application)."
```

---

### Task 3: Revert pyproject name + CLI entry points

**Files:**
- Modify: `pyproject.toml:6` — `name = "agent-meow"` → `name = "omnigent"`
- Modify: `pyproject.toml:245-256` — `[project.scripts]` section
- Modify: `sdks/python-client/pyproject.toml:6` — `name = "agent-meow-client"` → `name = "omnigent-client"`
- Modify: `sdks/ui/pyproject.toml:6` — `name = "agent-meow-ui-sdk"` → `name = "omnigent-ui-sdk"`
- Regenerate: `uv.lock`

**Interfaces:**
- Produces: `pyproject.toml` with `name = "omnigent"`, scripts = `omnigent` + `omni` only

**Out of scope:** Do NOT revert README/CHANGELOG/NOTICE/deploy docs — those are branding prose, Phase 4.

- [ ] **Step 1: Revert pyproject.toml name**

In `pyproject.toml`, change line 6:
```toml
name = "omnigent"
```

- [ ] **Step 2: Revert [project.scripts]**

In `pyproject.toml`, replace the `[project.scripts]` section (lines 245-256) with:
```toml
[project.scripts]
omnigent = "omnigent.cli:main"
omni = "omnigent.cli:main"
```

Note: the entry point now references `omnigent.cli:main` (not `agent_meow.cli:main`) because of the directory rename in Task 2.

- [ ] **Step 3: Revert SDK package names**

In `sdks/python-client/pyproject.toml`, change line 6:
```toml
name = "omnigent-client"
```

And change the dependency pin (line 25):
```toml
omnigent = { path = "../..", editable = true }
```

In `sdks/ui/pyproject.toml`, change line 6:
```toml
name = "omnigent-ui-sdk"
```

And update its `omnigent-client` dependency pin if it references `agent-meow-client`.

- [ ] **Step 4: Revert [tool.uv.sources]**

In `pyproject.toml`, the `[tool.uv.sources]` section (line 260) should already reference `omnigent-client` and `omnigent-ui-sdk` — verify:
```bash
grep -n "omnigent-client\|omnigent-ui-sdk" pyproject.toml
```

If it still says `agent-meow-client` or `agent-meow-ui-sdk`, fix it.

- [ ] **Step 5: Regenerate uv.lock**

```bash
uv lock
```

- [ ] **Step 6: Reinstall**

```bash
uv sync --extra all --extra dev
```

- [ ] **Step 7: Verify CLI entry point**

```bash
uv run omni --help 2>&1 | head -3
```

Expected: CLI help output (not "command not found")

- [ ] **Step 8: Commit**

```bash
git add pyproject.toml sdks/python-client/pyproject.toml sdks/ui/pyproject.toml uv.lock
git commit -s -m "revert: pyproject name + CLI entry points to omnigent

Reverts the distribution rename from b61e015a. name = 'omnigent',
scripts = omnigent + omni. The agent-meow brand aliases (meow, agent-meow)
will be re-applied in Phase 4."
```

---

### Task 4: Smoke test the reverted tree

**Files:**
- None (verification only)

**Interfaces:**
- Produces: confirmation that the reverted tree imports cleanly

- [ ] **Step 1: Collect-only pytest**

```bash
uv run pytest tests/ --co -q 2>&1 | tail -10
```

Expected: collection completes. There will be collection errors for tests that reference `agent_meow` paths — note them but don't fix yet (the merge in Task 5 will bring upstream's test versions).

- [ ] **Step 2: Ruff check**

```bash
uv run ruff check omnigent/ 2>&1 | tail -5
```

Expected: may have lint errors (unused imports, etc. from the revert) — note them but don't fix yet.

- [ ] **Step 3: Verify no agent_meow/ directory remains**

```bash
test -d agent_meow && echo "FAIL: agent_meow/ still exists" || echo "OK: agent_meow/ gone"
```

Expected: `OK: agent_meow/ gone`

- [ ] **Step 4: Verify omnigent/ exists**

```bash
test -d omnigent && echo "OK: omnigent/ exists" || echo "FAIL: omnigent/ missing"
```

Expected: `OK: omnigent/ exists`

- [ ] **Step 5: Commit checkpoint**

```bash
git commit --allow-empty -s -m "chore: smoke test passed for pre-merge revert"
```

---

### Task 5: Merge upstream/main

**Files:**
- All files — this is the merge commit

**Interfaces:**
- Produces: merge commit with all 547 upstream commits integrated

**Conflict resolution rules:**

| Conflict type | Resolution |
|---|---|
| Upstream-only new files | Take upstream (no conflict expected) |
| Agent-meow-only files under `omnigent/` | Keep ours (branding/custom files upstream doesn't have) |
| Both-modified core files | **Take upstream as base** — re-apply agent-meow additions in Phase 2/3 |
| i18n files | Take upstream's structure — re-apply agent-meow keys in Phase 4 |
| Branding files (index.css, mascot) | Keep ours — re-apply in Phase 4 |

**Escape hatch:** if a both-modified file has >500 lines of conflict markers after resolution, STOP and report the file. It needs a dedicated Phase 2/3 sub-plan.

- [ ] **Step 1: Start the merge (no commit)**

```bash
git merge upstream/main --no-commit --no-ff
```

This will produce conflicts. Don't panic — that's expected for 547 commits of divergence.

- [ ] **Step 2: Check conflict status**

```bash
git diff --name-only --diff-filter=U | head -30
```

Note the conflicted files. Categorize them per the resolution rules above.

- [ ] **Step 3: Resolve upstream-only new files**

These should auto-merge (no conflict). Verify:
```bash
git diff --name-only --diff-filter=A | head -20
```

These are new files from upstream — they're already staged correctly.

- [ ] **Step 4: Resolve agent-meow-only files**

Files that exist only in our tree (not in upstream) should also auto-merge. These include:
- `omnigent/tools/builtins/docs.py`, `images.py`, `videos.py`, `transcribe.py`, `tts.py`
- `examples/doc-writer/`, `image-editor/`, `video-creator/`, `voice-agent/`, etc.
- `web/src/components/icons/MeowCatMascot.tsx`, `MeowCatIcon.tsx`, `MeowCatEyes.tsx`
- `web/src/hooks/useDocuments.ts`, `useImages.ts`, `useAdminCatalog.ts`
- `web/src/lib/documentsApi.ts`, `imagesApi.ts`, `handyApi.ts`

Verify they're staged:
```bash
git diff --name-only --diff-filter=A -- omnigent/tools/builtins/ | head -10
```

- [ ] **Step 5: Resolve both-modified core files**

For each conflicted file in the both-modified category, take upstream's version:

```bash
# For each conflicted file that's a core file (not branding):
git checkout --theirs <file>
git add <file>
```

Key both-modified files to resolve this way:
- `omnigent/cli.py`
- `omnigent/server/routes/sessions.py`
- `omnigent/runner/app.py`
- `omnigent/tools/manager.py`
- `omnigent/harness_plugins.py` ← **but see Step 6 for Ironclaw**
- `web/src/shell/NewChatDialog.tsx`
- `web/src/shell/Sidebar.tsx`
- `web/src/shell/AppShell.tsx`
- `web/src/store/chatStore.ts`
- `web/src/pages/ChatPage.tsx`

**Do NOT take upstream for these branding files — keep ours:**
- `web/src/index.css` (brand tokens)
- `web/src/components/icons/MeowCat*.tsx`
- `web/src/lib/locales/en.json`, `zh-CN.json` (i18n — take upstream's structure but keep ours for now)
- `web/src/lib/i18n.ts`

For branding files:
```bash
git checkout --ours <file>
git add <file>
```

- [ ] **Step 6: CRITICAL — Preserve Ironclaw-native registration in harness_plugins.py**

`harness_plugins.py` is a both-modified file. Upstream has NO ironclaw entries. If you took upstream's version in Step 5, the `IRONCLAW_NATIVE_CODING_AGENT` registration is gone.

After resolving `harness_plugins.py` to upstream's version, re-apply the Ironclaw registration:

```bash
# Check if Ironclaw is still registered
grep -c "IRONCLAW" omnigent/harness_plugins.py
```

If the count is 0, the Ironclaw registration was lost. Re-apply it by adding these lines back (referencing the pre-merge version):

1. In the imports from `omnigent._wrapper_labels`, add:
```python
    IRONCLAW_NATIVE_WRAPPER_VALUE,
```

2. After the `HERMES_NATIVE_CODING_AGENT` definition, add:
```python
IRONCLAW_NATIVE_CODING_AGENT = NativeCodingAgent(
    key="ironclaw",
    display_name="IronClaw",
    agent_name="ironclaw-native-ui",
    harness="ironclaw-native",
    wrapper_label=IRONCLAW_NATIVE_WRAPPER_VALUE,
    terminal_name="ironclaw",
)
```

3. In the `native_harnesses` frozenset, add `"ironclaw-native"` and `"native-ironclaw"`.

4. In the `_BUILTIN_CAPABILITIES` dict, add (if it existed before):
```python
    "ironclaw-native": _C(
        _IM.NATIVE_TUI,
        _EL.APPROVAL_MIRROR,
        _RS.WARM_REATTACH,
        _EF.NONE,
        _MF.MULTI,
        _AU.OWN_AUTH,
        subagents=False,
        interrupt=True,
        streaming=True,
    ),
```

5. In the `harness_modules` dict, add `"ironclaw-native": "omnigent.inner.ironclaw_native_harness"` (if the harness module exists — it may not yet, see spec open question #6).

6. In the aliases dict, add `"native-ironclaw": "ironclaw-native"`.

7. In the `native_agents` tuple, add `IRONCLAW_NATIVE_CODING_AGENT`.

```bash
git add omnigent/harness_plugins.py
```

- [ ] **Step 7: Also preserve IRONCLAW_NATIVE_WRAPPER_VALUE in _wrapper_labels.py**

```bash
grep -c "IRONCLAW" omnigent/_wrapper_labels.py
```

If 0, re-add:
```python
# Value the ``omnigent ironclaw`` wrapper writes into
IRONCLAW_NATIVE_WRAPPER_VALUE = "ironclaw-native-ui"
```

```bash
git add omnigent/_wrapper_labels.py
```

- [ ] **Step 8: Verify no conflict markers remain**

```bash
grep -rn "^<<<<<<< " omnigent/ web/src/ 2>/dev/null | head -10
grep -rn "^>>>>>>> " omnigent/ web/src/ 2>/dev/null | head -10
```

Expected: no output (all conflicts resolved)

- [ ] **Step 9: Commit the merge**

```bash
git add -A
git commit -s -m "merge: upstream omnigent/main (547 commits) into reintegration/staging

Integrates all 547 upstream commits. Conflict resolution:
- Both-modified core files: took upstream as base (agent-meow additions
  re-applied in Phase 2/3)
- Branding files (index.css, MeowCat icons, i18n): kept ours (Phase 4)
- Ironclaw-native registration: re-applied to harness_plugins.py +
  _wrapper_labels.py (agent-meow-only, upstream has no ironclaw)

Pre-merge revert: 7efd8ac1 (agent_meow/ → omnigent/ rename) + b61e015a
(pyproject name/scripts) reverted to align paths."
```

---

### Task 6: Post-merge smoke test

**Files:**
- None (verification only)

**Interfaces:**
- Produces: confirmation that the merged tree imports cleanly

- [ ] **Step 1: Verify merge commit**

```bash
git log --oneline -3
```

Expected: the merge commit is at HEAD, with `49ca5128` (our pre-merge HEAD) and `24831901` (upstream/main) as parents.

- [ ] **Step 2: Verify omnigent imports**

```bash
uv sync --extra all --extra dev
uv run python -c "import omnigent.server; import omnigent.runner; print('OK')"
```

Expected: `OK`

If this fails, note the error — it's likely an import path issue from the merge. Don't fix here; flag for Phase 2.

- [ ] **Step 3: Verify Ironclaw registration survived**

```bash
uv run python -c "from omnigent.harness_plugins import IRONCLAW_NATIVE_CODING_AGENT; print('OK')"
```

Expected: `OK`

- [ ] **Step 4: Web type-check (expect errors)**

```bash
cd web && npm install && npm run type-check 2>&1 | tail -20
```

Expected: type errors (Phase 3 fixes these). Confirm they're type errors only, not missing-module errors for upstream files. Missing-module errors for upstream files mean the merge didn't bring them in — investigate.

- [ ] **Step 5: Commit checkpoint**

```bash
git commit --allow-empty -s -m "chore: post-merge smoke test checkpoint

Backend imports OK. Web type-check has expected errors (Phase 3).
Ironclaw registration preserved."
```

---

### Task 7: Push the integration branch

**Files:**
- None (git operation)

**Interfaces:**
- Produces: `reintegration/staging` pushed to `origin` for backup

- [ ] **Step 1: Push**

```bash
git push -u origin reintegration/staging
```

- [ ] **Step 2: Verify**

```bash
git log --oneline origin/reintegration/staging -3
```

Expected: same 3 commits as local `reintegration/staging`

---

## Verification Summary

After all tasks complete, verify:

1. `git log --oneline -1` shows the merge commit
2. `test -d omnigent && echo OK` → `OK`
3. `test -d agent_meow && echo FAIL || echo OK` → `OK`
4. `uv run python -c "import omnigent; print('OK')"` → `OK`
5. `uv run python -c "from omnigent.harness_plugins import IRONCLAW_NATIVE_CODING_AGENT; print('OK')"` → `OK`
6. `grep -c "IRONCLAW" omnigent/harness_plugins.py` → non-zero
7. `grep -c "IRONCLAW" omnigent/_wrapper_labels.py` → non-zero
8. `git log --oneline upstream/main..HEAD | wc -l` → small number (our revert + merge commits, not 547)
9. Branch pushed to `origin/reintegration/staging`

## Next Steps (after this plan)

- **Phase 2 plan:** Backend audit + reconcile — preserve agent-meow surface tools (`docs.py`, `images.py`, `videos.py`, `transcribe.py`, `tts.py`), reconcile `handyApi.ts`, `AudioBlock.tsx`, `DocEditor.tsx`/`DocsPanel.tsx`, `codex/codexGoalUtils.ts` against upstream equivalents. Add Z.ai + Qwen to `PROVIDER_CONFIGS` + `openai_compat_providers`.
- **Phase 3 plan:** Front-end adaptation — reconcile 341-file `web/src/` diff, wire upstream workspace features, restore KEEP hooks.
- **Phase 4 plan:** Branding re-application — re-apply `omnigent/ → agent_meow/` rename, mascot swap, palette, wordmark, i18n, pyproject `name = "agent-meow"`, CLI aliases.
- **Post-merge feature plan:** Implement `doc_generate`/`image_generate` stubs, create ColorFire agent configs, complete `ironclaw-native` harness stack.