# Plan 001: Fix roadmap db_models.py path reference

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `1a2047ec`, 2026-07-24

## Why this matters

The roadmap (`docs/ROADMAP_AND_CORE_FEATURES.md`) references `db_models.py` without the full path in two places. The actual file is at `agent_meow/db/db_models.py`. A reader following the roadmap to find the ORM models would look in the wrong directory. This is a 1-line fix but matters for 100% accuracy.

## Current state

- `docs/ROADMAP_AND_CORE_FEATURES.md` §7 Phase 3 line says: "ORM models `SqlDocument`/`SqlImage`/`SqlVideo` added to `db_models.py`"
- `docs/ROADMAP_AND_CORE_FEATURES.md` §2 table (Docs row) says: "`stores/document_store/`, `routes/documents.py`" — no `db_models.py` reference here, so only the §7 line needs fixing
- The actual file: `agent_meow/db/db_models.py` — confirmed at lines 1580, 1605, 1633

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Verify path | `Test-Path agent_meow\db\db_models.py` | True |
| Lint (N/A — doc-only change) | — | — |

## Scope

**In scope**:
- `docs/ROADMAP_AND_CORE_FEATURES.md` — fix the `db_models.py` path reference in §7

**Out of scope**:
- Any other path references in the roadmap (they're either correct or use relative paths that resolve correctly)
- Any code changes

## Steps

### Step 1: Fix the path reference

In `docs/ROADMAP_AND_CORE_FEATURES.md`, find the Phase 3 line in §7:

```
- **Phase 3 ✅** Backend routers mounted: ... ORM models `SqlDocument`/`SqlImage`/`SqlVideo` added to `db_models.py`; ...
```

Change `db_models.py` to `agent_meow/db/db_models.py`.

**Verify**: Open the file and confirm the line now reads `agent_meow/db/db_models.py`.

## STOP conditions

- If the line doesn't exist (someone already fixed it or reworded §7) — stop and report; the fix may be unnecessary.
- If there are additional `db_models.py` references without the full path — fix those too, but report each one.

## Test plan

No tests needed — this is a documentation path fix. The verification is visual: the path should be `agent_meow/db/db_models.py`.

## Maintenance note

When adding new ORM model references to the roadmap, always use the full path `agent_meow/db/db_models.py` to avoid this recurring.
