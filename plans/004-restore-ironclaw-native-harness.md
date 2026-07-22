# Plan 004: Restore ironclaw-native harness implementation

> **Executor instructions**: Follow this plan step by step. This is a
> reconstruction plan — the implementation files were lost in the 547-commit
> merge and must be restored from git history or re-created.

> **Drift check**: `git diff --stat 1090799b..HEAD -- omnigent/harness_plugins.py`
> If harness_plugins.py changed, compare the registration entries before proceeding.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

`ironclaw-native` is registered as a coding agent in `harness_plugins.py`
(`IRONCLAW_NATIVE_CODING_AGENT` at line 202, in `native_agents` at line 631,
in `native_harnesses` at lines 599/608, `IRONCLAW_NATIVE_WRAPPER_VALUE` in
`_wrapper_labels.py`). But the 547-commit upstream merge dropped all
implementation files — there are zero `ironclaw_native*.py` files, no
`harness_modules` entry, no `_BUILTIN_CAPABILITIES` entry, no onboarding auth,
no tests. The registration is a dangling shell that will crash at runtime
when a user selects the ironclaw-native harness.

The design spec at `docs/superpowers/specs/2026-07-22-workspace-reintegration-design.md:156`
explicitly flags this as a preserve-through-merge item.

## Current state

**Registration (present, survived merge)**:
- `omnigent/harness_plugins.py:202-208` — `IRONCLAW_NATIVE_CODING_AGENT` defined
- `omnigent/harness_plugins.py:599,608` — `"ironclaw-native"` and `"native-ironclaw"` in `native_harnesses`
- `omnigent/harness_plugins.py:631` — in `native_agents` list
- `omnigent/_wrapper_labels.py` — `IRONCLAW_NATIVE_WRAPPER_VALUE = "ironclaw-native-ui"`

**Implementation (ALL MISSING)**:
- No `omnigent/ironclaw_native.py` (harness module)
- No `omnigent/ironclaw_native_bridge.py` (bridge)
- No `omnigent/ironclaw_native_forwarder.py` (forwarder)
- No `omnigent/ironclaw_native_permissions.py` (permissions)
- No `omnigent/inner/ironclaw_native_executor.py` (executor)
- No `omnigent/inner/ironclaw_native_harness.py` (harness inner)
- No `omnigent/onboarding/ironclaw_auth.py` (onboarding)
- No `omnigent/harness_plugins.py` `harness_modules` entry for `ironclaw-native`
- No `omnigent/harness_plugins.py` `_BUILTIN_CAPABILITIES` entry
- No `omnigent/server/app.py` import of `IRONCLAW_NATIVE_CODING_AGENT`
- Zero test files

**Pattern to follow**: The `hermes-native` harness is the closest analog
(local OSS LLM, native TUI wrapper). Its files:
- `omnigent/hermes_native.py` — harness module
- `omnigent/hermes_native_bridge.py` — bridge
- `omnigent/hermes_native_forwarder.py` — forwarder
- `omnigent/hermes_native_permissions.py` — permissions
- `omnigent/hermes_native_status.py` — status
- `omnigent/inner/hermes_native_executor.py` — executor
- `omnigent/inner/hermes_native_harness.py` — harness inner
- `omnigent/onboarding/hermes_auth.py` — onboarding auth

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Check pre-merge git history | `git log --oneline --all -- '**/ironclaw_native*'` | shows commits that had the files |
| Extract old files | `git show <commit>:omnigent/ironclaw_native.py` | file content |
| Run harness tests | `uv run pytest tests/ -v -k "ironclaw"` | tests pass |

## Steps

1. **Find the pre-merge ironclaw files in git history**

   Run: `git log --oneline --all -- '**/ironclaw_native*' '**/ironclaw_auth*'`

   This should show commits from before the merge that had the ironclaw
   implementation files. Find the last commit before `b8b465a8` (the merge
   commit) that had these files.

2. **Extract each file from git history**

   For each file that existed pre-merge, extract it:
   ```bash
   git show <pre-merge-commit>:omnigent/ironclaw_native.py > omnigent/ironclaw_native.py
   git show <pre-merge-commit>:omnigent/ironclaw_native_bridge.py > omnigent/ironclaw_native_bridge.py
   # ... etc for all 7 files
   ```

   If the pre-merge path was `agent_meow/ironclaw_native.py` (before the
   Phase 0 rename revert), adjust the path:
   ```bash
   git show <pre-merge-commit>:agent_meow/ironclaw_native.py > omnigent/ironclaw_native.py
   ```

3. **Add `ironclaw-native` to `harness_modules` dict**

   In `omnigent/harness_plugins.py`, find the `harness_modules` dict (line
   ~548-570). Add:
   ```python
   "ironclaw-native": "omnigent.inner.ironclaw_native_harness",
   ```

4. **Add `ironclaw-native` to `_BUILTIN_CAPABILITIES`**

   Find the `_BUILTIN_CAPABILITIES` dict. Add an entry for ironclaw-native
   mirroring the hermes-native entry.

5. **Add `IRONCLAW_NATIVE_CODING_AGENT` import to server/app.py**

   In `omnigent/server/app.py` (line ~30-41), add `IRONCLAW_NATIVE_CODING_AGENT`
   to the import block alongside the other native coding agents.

6. **Verify imports work**

   Run: `uv run python -c "from omnigent.harness_plugins import IRONCLAW_NATIVE_CODING_AGENT; print('OK')"`

   Expected: `OK`

7. **Run any restored tests**

   If test files were also extracted from git history, run them:
   `uv run pytest tests/ -v -k "ironclaw"`

8. **Commit with DCO**

   ```bash
   git add -A
   git commit -s -m "feat(harness): restore ironclaw-native harness implementation

   The 547-commit upstream merge dropped all ironclaw_native*.py files
   while the registration in harness_plugins.py survived (re-applied
   per the reintegration design spec). This restores the bridge,
   forwarder, executor, harness, onboarding, and capabilities entries
   from pre-merge git history."
   ```

## Out of scope

- Do NOT modify the `IRONCLAW_NATIVE_CODING_AGENT` registration — it already
  survived the merge.
- Do NOT update the hermes-native or other harness implementations.
- Do NOT add new features to ironclaw-native — just restore what was lost.

## STOP conditions

- If `git log --oneline --all -- '**/ironclaw_native*'` returns empty — the
  files may have been on a different branch that wasn't merged. STOP and
  report; the files must be re-created from scratch (much larger effort).
- If the extracted files use `agent_meow` imports instead of `omnigent` —
  update all imports to `omnigent` before proceeding (find-replace
  `from agent_meow` → `from omnigent`, `import agent_meow` → `import omnigent`).
- If the extracted files reference APIs that changed in the 547-commit merge
  (e.g. function signatures, class names) — STOP and report the mismatches.