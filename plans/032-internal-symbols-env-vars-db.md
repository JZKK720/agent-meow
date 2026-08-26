# Plan 032: Python Internal Symbols + Environment Variables + DB Migration

**Written against commit**: `a49b4479f` (2026-08-26)
**Depends on**: Plan 031 (SDK dirs must be renamed first)
**Blocks**: Plans 033, 034
**Effort**: L (Large) — ~80 files, ~700 replacements
**Risk**: HIGH — breaking changes to env vars, DB schema, wire protocol

---

## Goal

Rename all `OMNIGENT_*` environment variables to `AGENT_MEOW_*`, rename internal Python symbols (`OmnigentError` → `AgentMeowError`, `OmnigentClient` → `AgentMeowClient`), add a DB migration for table/column renames, and update the wire-protocol sentinel.

## Why this matters

35+ environment variables prefixed `OMNIGENT_` are read across 77 files. Users setting `OMNIGENT_CONFIG_HOME` or `OMNIGENT_MODEL` will break. The DB table `omnigent_conversation_metadata` and column `omnigent_workspace_id` need Alembic migrations. The wire-protocol sentinel `omnigent://internal` is used for internal workspace origin detection.

## Files in scope

### Environment variables (77 files, 35+ distinct vars)
All `OMNIGENT_*` → `AGENT_MEOW_*` across `agent_meow/`, `tests/`, `integrations/slack/`, `web/electron/build/embed_python.js`, `setup.py`, `web/vite.config.ts`.

Key env vars and their defining files:
- `OMNIGENT_CONFIG_HOME` — `agent_meow/config.py:11`, `agent_meow/cli.py:308`
- `OMNIGENT_DATA_DIR` — `agent_meow/cli.py:326`
- `OMNIGENT_LOCAL_SINGLE_USER` — `agent_meow/server/auth.py:89`
- `OMNIGENT_MODEL` — `agent_meow/chat.py:137`
- `OMNIGENT_DATABASE_URI` — `agent_meow/cli.py:478`
- `OMNIGENT_RUNNER_WORKSPACE` — `agent_meow/runner/identity.py:20`
- `OMNIGENT_ENV_PREFIX = "OMNIGENT_"` — `agent_meow/env_credentials.py:9` → `AGENT_MEOW_`
- ... (see plans/030 for full list)

### Python class/symbol renames
- `OmnigentError` → `AgentMeowError` (defined in `agent_meow/errors.py`, re-exported widely)
- `OmnigentClient` → `AgentMeowClient` (in `sdks/python-client/agent_meow_client/_client.py`)
- `OmnigentClientPool` → `AgentMeowClientPool` (slack integration)
- `OmnigentAcpMcp` → `AgentMeowAcpMcp` (`agent_meow/inner/_acp_omnigent_mcp.py`)
- `OMNIGENT_INTERNAL_WS_ORIGIN = "omnigent://internal"` → `AGENT_MEOW_INTERNAL_WS_ORIGIN = "agent-meow://internal"` (`agent_meow/runner/identity.py:37`)

### spec/ file renames
- `agent_meow/spec/omnigent.py` → `agent_meow/spec/agent_meow_spec.py` (or keep name, just update contents)
- `agent_meow/spec/_omnigent_compat.py` → `agent_meow/spec/_agent_meow_compat.py`
- `agent_meow/spec/_omnigent_legacy_shim.py` → `agent_meow/spec/_agent_meow_legacy_shim.py`

### DB migration
- New Alembic migration: rename table `omnigent_conversation_metadata` → `agent_meow_conversation_metadata`
- Rename column default `omnigent_workspace_id` → `agent_meow_workspace_id` in `agent_meow/db/db_models.py:210`

### setup.py env vars
- `OMNIGENT_SKIP_WEB_UI` → `AGENT_MEOW_SKIP_WEB_UI`
- `OMNIGENT_BUILD_WEB_UI` → `AGENT_MEOW_BUILD_WEB_UI`

## Files explicitly OUT of scope
- Frontend env var references (`web/src/`) — Plan 033
- Electron env var references (`web/electron/src/`) — Plan 034
- `omnigent/__init__.py` compat shim deletion — Plan 034

## Steps

### Step 1: Rename environment variables

**Backward-compat strategy**: For each env var, read the new `AGENT_MEOW_*` name first, fall back to the old `OMNIGENT_*` name with a deprecation warning. This gives users time to migrate.

Example pattern for `agent_meow/config.py`:
```python
import os
import warnings

_CONFIG_HOME_ENV = "AGENT_MEOW_CONFIG_HOME"
_CONFIG_HOME_ENV_LEGACY = "OMNIGENT_CONFIG_HOME"

def _get_config_home() -> str:
    val = os.environ.get(_CONFIG_HOME_ENV)
    if val is not None:
        return val
    legacy = os.environ.get(_CONFIG_HOME_ENV_LEGACY)
    if legacy is not None:
        warnings.warn(
            f"{_CONFIG_HOME_ENV_LEGACY} is deprecated; use {_CONFIG_HOME_ENV}",
            DeprecationWarning,
            stacklevel=2,
        )
        return legacy
    return os.path.expanduser("~/.agent-meow")
```

Apply this pattern to ALL 35+ env vars. The `OMNIGENT_ENV_PREFIX` constant in `env_credentials.py` becomes `AGENT_MEOW_ENV_PREFIX = "AGENT_MEOW_"` with legacy fallback.

### Step 2: Rename Python classes

- `OmnigentError` → `AgentMeowError` in `agent_meow/errors.py` + all re-exports + all `except OmnigentError` sites
- `OmnigentClient` → `AgentMeowClient` in SDK + all import sites
- `OmnigentClientPool` → `AgentMeowClientPool` in slack integration
- `OmnigentAcpMcp` → `AgentMeowAcpMcp` in `agent_meow/inner/_acp_omnigent_mcp.py`
- Keep backward-compat aliases: `OmnigentError = AgentMeowError` at the end of `errors.py` (remove in Plan 034)

### Step 3: Rename spec/ files

```bash
git mv agent_meow/spec/omnigent.py agent_meow/spec/agent_meow_spec.py
git mv agent_meow/spec/_omnigent_compat.py agent_meow/spec/_agent_meow_compat.py
git mv agent_meow/spec/_omnigent_legacy_shim.py agent_meow/spec/_agent_meow_legacy_shim.py
```

Update all imports referencing these modules.

### Step 4: Update wire-protocol sentinel

`agent_meow/runner/identity.py:37`:
```python
# Before:
OMNIGENT_INTERNAL_WS_ORIGIN = "omnigent://internal"
# After:
AGENT_MEOW_INTERNAL_WS_ORIGIN = "agent-meow://internal"
# Backward compat: accept old sentinel when reading
_OMNIGENT_INTERNAL_WS_ORIGIN_LEGACY = "omnigent://internal"
```

Update all sites that compare against this sentinel to accept both values.

### Step 5: DB migration

Create new Alembic migration file:
```
agent_meow/db/migrations/versions/XXXX_rename_omnigent_to_agent_meow.py
```

```python
"""Rename omnigent_conversation_metadata to agent_meow_conversation_metadata.

Revision ID: <generate>
Revises: <previous revision>
"""
from alembic import op

revision = "<generate>"
down_revision = "<previous>"

def upgrade():
    op.rename_table("omnigent_conversation_metadata", "agent_meow_conversation_metadata")

def downgrade():
    op.rename_table("agent_meow_conversation_metadata", "omnigent_conversation_metadata")
```

Update `agent_meow/db/db_models.py:210` column default from `"omnigent_workspace_id"` to `"agent_meow_workspace_id"`.

### Step 6: Update setup.py env vars

`setup.py`: `OMNIGENT_SKIP_WEB_UI` → `AGENT_MEOW_SKIP_WEB_UI`, `OMNIGENT_BUILD_WEB_UI` → `AGENT_MEOW_BUILD_WEB_UI` (with legacy fallback).

### Step 7: Update vite.config.ts env vars

`web/vite.config.ts`: `OMNIGENT_URL` → `AGENT_MEOW_URL`, `OMNIGENT_AUTH_TOKEN` → `AGENT_MEOW_AUTH_TOKEN` (with legacy fallback).

## Verification gates

1. `AGENT_MEOW_CONFIG_HOME=/tmp/test python -c "from agent_meow.config import get_config_home; print(get_config_home())"` → prints `/tmp/test`
2. `OMNIGENT_CONFIG_HOME=/tmp/legacy python -c "from agent_meow.config import get_config_home; print(get_config_home())"` → prints `/tmp/legacy` + deprecation warning
3. `python -c "from agent_meow.errors import AgentMeowError; print('ok')"` → prints `ok`
4. `python -c "from agent_meow.errors import OmnigentError; print('ok')"` → prints `ok` (backward compat alias)
5. `uv run pytest tests/ -x -q` → all pass
6. `uv run mypy agent_meow/` → no new errors
7. `uv run alembic upgrade head` → migration applies cleanly

## Escape hatches

- If the DB migration fails on existing user databases, add a `try/except` that logs and continues (the old table name still works for reads).
- If too many class rename sites cause import errors, add backward-compat aliases (`OmnigentError = AgentMeowError`) at the module level and remove them in Plan 034.
- If `OMNIGENT_INTERNAL_WS_ORIGIN` sentinel change breaks e2e tests, keep accepting the old value `"omnigent://internal"` as an alias.

## Maintenance note

The backward-compat env var fallbacks should be removed in Plan 034 (or a later cleanup). The DB migration is irreversible without a downgrade — test on a copy first. The class name aliases (`OmnigentError = AgentMeowError`) should be removed once all external consumers have migrated.