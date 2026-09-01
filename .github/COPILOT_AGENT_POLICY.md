# Copilot coding agent policy (JZKK720/agent-meow)

The GitHub Copilot coding agent ("Cloud" sessions, actor `copilot-swe-agent[bot]`)
is **disabled** for this repository. Do not assign issues or PRs to Copilot, and
do not use "Assign to Copilot" from the UI.

## Why

1. **Rebrand boundary.** This fork is fully rebranded to agent-meow. Upstream
   (omnigent-ai/omnigent) and cloud agents have no authority to write to it; all
   work lands on fork `main` by local commits (`origin` only, never `upstream`).
2. **Hangs.** Copilot cloud sessions inferencing through the Hermes gateway
   stalled for long periods and produced little of value.
3. **Remote codebase mutation.** Cloud sessions run on GitHub runners
   (`/home/runner/work/agent-meow/`), commit with the `copilot-swe-agent[bot]`
   identity, and can open PRs against this codebase. Example: session
   "Resolved in c3f25aff" authored merge commit `c3f25affd` inside PR #4. All
   development happens locally; there is no need for a remote agent to touch the
   tree.

## What stays enabled

Everything else is unaffected:

- `agent-meow-ci[bot]` (lockfile regen, PR reviews) — org App, id 4082516.
- The `.github/agents/` headless configs and the
  `.github/actions/run-omnigent-agent` composite action. These are
  release-cut-only, tools-less, and fire from `github.workflow_run` on
  "GitHub Release" completion — not from issue/PR assignment, so they cannot be
  triggered by a Copilot session.
- The `copilot` **harness** in `agent_meow/inner/copilot_executor.py` (the
  agent-meow product feature). This policy is about GitHub's cloud coding agent,
  not about the product's harness integrations.

## If it comes back

A Copilot cloud session leaves a distinctive signature:
`A:copilot-swe-agent[bot] <198982749+Copilot@users.noreply.github.com>` in
`git log --format="%an %ae"`. If that actor appears again, close its PRs without
merging and re-check this policy doc.