---
description: "Loop Engineering patterns for agent-meow — recurring agent loops with STATE.md/LOOP.md conventions. Use when: user wants to set up recurring automated agent tasks, track loop state, or adopt loop engineering methodology."
applyTo: "**"
---

# Loop Engineering — Recurring Agent Loops for agent-meow

Loop Engineering (from `C:\Users\1\github-pr\loop-engineering`) is a methodology for running recurring, unattended agent tasks with governance. It packages 7 production patterns with STATE.md/LOOP.md conventions.

## Core Conventions

### STATE.md — Current Loop State

Tracks what's active, what needs attention, and what's noise. Updated by the loop itself, reviewed by humans.

```markdown
# Loop State — <project>

Last run: 2026-07-24T08:00:00Z (automated daily-triage workflow)

## High Priority (loop is acting or waiting on human)
- <item>

## Watch List
- <item>

## Recent Noise (ignored this run)
—

---
Run log: Updated by <workflow>. See LOOP.md for cadence and gates.
```

### LOOP.md — Loop Registry

Documents all active loops, their cadence, skills, state files, and phase.

```markdown
# LOOP.md — <project> Loop Registry

## Active Loops

### <Loop Name> (L1 — automated + report)
- Cadence: <frequency>
- Skill: <skill-path>
- State: STATE.md
- Phase: <phase>
- Handoff: <what triggers human review>

### <Loop Name> (L2 — assisted, manual trigger)
- Cadence: <frequency>
- Starter: <starter-path>
- State: STATE.md
- Phase: <phase>
```

## The 7 Patterns

| Pattern | Level | What It Does | Best For |
|---------|-------|-------------|----------|
| daily-triage | L1 | Automated daily repo scan → report | Health monitoring |
| pr-babysitter | L2 | Review PRs, suggest fixes, verify | Code review |
| dependency-sweeper | L2 | Update deps, patch CVEs | Maintenance |
| ci-sweeper | L1 | Watch CI, fix failures | CI health |
| post-merge-cleanup | L1 | Post-merge cleanup tasks | Repo hygiene |
| changelog-drafter | L1 | Draft release notes | Release prep |
| issue-triage | L2 | Triage new issues, label, assign | Issue management |

## Governance

- **L1 (automated)**: Runs unattended, produces reports. Human reviews weekly.
- **L2 (assisted)**: Suggests fixes, requires human approval before action.
- **L3 (autonomous)**: Acts autonomously within guardrails (budget caps, denylist).

## Guardrails

- **Worktrees**: Any code-change experiment runs in an isolated git worktree.
- **Verifier**: Every change must pass a verification step (tests, lint, typecheck).
- **Budget caps**: Token spending tracked per loop.
- **Kill switch**: `loop-pause-all` label or STATE.md flag stops all loops.
- **Denylist**: Blocked paths and packages that loops must not touch.

## Token Budget

Track spending per loop:

```markdown
## Budget (rolling 30d)
- daily-triage: ~2k tokens/run → ~60k/month
- pr-babysitter: ~5k tokens/run → ~150k/month (during active hours)
- Total: ~210k tokens/month
```

## Multi-Loop Coordination

When running multiple loops, priority order:
1. CI Sweeper (fix broken builds)
2. PR Babysitter (review PRs)
3. Dependency Sweeper (update deps)
4. Post-Merge Cleanup (off-peak)
5. Changelog Drafter (release prep)
6. Daily Triage (report only)

## Integration with agent-meow

- Use `sys_scheduled_task_*` tools to schedule loops
- STATE.md lives in the project root, updated by loops
- LOOP.md lives in the project root, documents active loops
- Human reviews STATE.md weekly; loops act within their phase
- Kill switch: set `loop-pause-all: true` in STATE.md

## MCP Server

The loop-engineering MCP server (`@cobusgreyling/loop-mcp-server`) is wired in the CubeCloud bundle (`mcp.json.template`):

```json
"loop-mcp-server": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@cobusgreyling/loop-mcp-server@latest"]
}
```

This exposes loop management tools (init, audit, cost tracking, state sync) to any MCP-compatible agent. The npm packages (`loop`, `loop-init`, `loop-audit`, `loop-cost`, `loop-sync`, `loop-context`, `loop-worktree`) are Node.js CLIs — use them via `npx` for one-off operations, or through the MCP server for agent-driven loop management.

## Example: agent-meow Loop

```yaml
# config.yaml — agent-meow scheduled task
scheduled_tasks:
  - name: daily-triage
    schedule: "0 9 * * 1-5"  # 9am weekdays
    agent: agent-meow
    prompt: |
      Run the daily-triage loop pattern:
      1. Scan the repo for issues, PRs, CI failures
      2. Update STATE.md with findings
      3. Report to the user
      Do NOT auto-fix anything — report only.
```
