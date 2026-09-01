# Upstream cherry-pick runbook — how to adopt omnigent-ai updates safely

Companion to `docs/UPSTREAM_ADOPTION_POLICY.md` (the *what/why*). This is
the *how*, proven on 2026-09-01 with upstream #5985 (commit `274251ea4`).

## The pipeline (5 steps, ~15 min per commit)

### 1. Survey (weekly batch)

```powershell
git -C agent-meow fetch upstream
# Fresh candidates since your last port (keep a water-line tag):
git log --oneline <WATERLINE>..upstream/main -- web/src
```

Keep a git tag like `port/waterline-2026-09` at the last commit you
reviewed, so each survey only sees the delta. Filter with
`-- web/src` (front-end) / `-- agent_meow` (backend) to skip CI noise.

### 2. Dedupe — skip what we already have

For each candidate, check if the change is already present (fork code has
diverged, so match by content, not patch-id):

```powershell
git show <sha> --format="" -- <files>   # read what it changes
# then grep the fork for the key symbol/behavior:
Select-String -Path web/src/... -Pattern "<key symbol>"
```

If the fork already behaves correctly, close the candidate.

### 3. Score (the take/don't-take line)

| Take (port) | Don't take |
|---|---|
| bug fixes in shared logic (streaming, store, uploads, SSE) | anything touching branding surfaces (hero, mascot, patterns, i18n copy) |
| non-branded features (sidebar mechanics, keyboard, a11y) | rebrand/env-var scheme changes |
| e2e/test infra improvements | telemetry/identity defaults |
| perf fixes | managed-omnigent-only UI (`managed omnigent` in title = skip) |

Commit titles containing `managed omnigent` or `managed omni` are usually
upstream-only features — skip unless your fork runs the managed variant.

### 4. Dry-run — never trust a clean apply as "done"

```powershell
git show <sha> > $env:TEMP\cand.patch
git -C agent-meow apply --check $env:TEMP\cand.patch
```

- **CLEAN APPLY** → still read the diff completely (the fork's files may
  differ around the patch).
- **CONFLICTS** → port manually: read the upstream diff, find the fork's
  equivalent location, and re-implement there. This is the normal case —
  the fork's `chatStore` diverged heavily in phase 1 (queue-then-flush,
  `set()` vs upstream's `setActive(...)`).

### 5. Port with TDD (the #5985 pattern)

1. **Port the upstream test FIRST** (adapt to fork test infra — usually
   identical since we share the test scaffolding). Run it → must FAIL.
2. **Port the minimal source change** (helper + call site + import).
3. Run the suite → new test passes; total failures drop by exactly one
   (48 → 47 for the documented chatStore env baseline).
4. `tsc -b` clean + lint steady at 176.
5. Rebrand audit: grep the ported diff for `omnigent` (case-insensitive) —
   must be zero outside a "Ported from upstream <sha>" comment.
6. Commit with `-s`, message format:

   ```
   fix(web): <upstream title, rebranded context>

   Ported from upstream omnigent-ai/omnigent#<PR> per
   docs/UPSTREAM_ADOPTION_POLICY.md (cherry-pick + rebrand audit).
   ```
7. **No SPA rebuild needed** for web/src-only ports unless the change
   affects shipped bundles — rebuild + commit the bundle when it does.

## Provenance tracking

- Each port commit names its upstream PR in the body (grep-able:
  `Ported from upstream`).
- Optional: tag the last reviewed upstream commit
  (`git tag port/waterline-2026-09 upstream/main`) so the next survey is
  `git log <waterline>..upstream/main`.

## High-value candidates already surveyed (2026-09-01)

| Upstream | Title | Verdict |
|---|---|---|
| `ba7fb0b7c` (#5985) | same-named image attachments distinct optimistic ids | **PORTED** → `274251ea4` |
| `0f744d8d2` (#5899) | persist compaction progress timer across session switches | **PORTED** → `05e187165` (BlockContext.clientCreatedAtS + timer from stamp) |
| `f3b0632c1` (#6038) | terminal grabs focus only when explicitly opened | **PORTED** → `4c7f436af` (focusOnConnect ctor param; consumers keep default) |
| `da7555532` (#5929) | show newly-created sessions in the sidebar immediately | **PORTED** → `890dda714` (adapted: label-only projects; isSessionDeleting skip deferred until #4566 tombstones) |
| `1e26d36d4` (#5832) | open `file://` links in FileViewer | **BLOCKED** — depends on upstream #4644's whole markFileLinks pipeline (absent here); port as its own project |
| `67dc77724` (#6036) | keep just-created session in sidebar until indexed | **DEPENDS on #4566** tombstones (isSessionDeleting) — port after #4566 |
| `2fb180d82`, `d8f1554de`, `0f78e625f` | managed-omnigent specific | **skip** (not our variant) |

## Prerequisite chain discovered (port in this order when wanted)

```
#4566 (optimistic delete tombstones: markSessionsDeleting/isSessionDeleting)
  └─> #6036 (sidebar keeps just-created rows until indexed)
#4644 (markFileLinks: agent file links open in FileViewer)
  └─> #5832 (file:// URIs rewritten before sanitize → FileViewer)
```