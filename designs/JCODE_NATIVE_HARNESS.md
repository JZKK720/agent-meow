# Design: add jcode as a native harness (`meow jcode`)

Status: **Draft — awaiting approval before implementation.**
Author: design note for the agent-meow repo, grounded in source.
Date: 2026-07-20

## 1. Summary

Add `jcode` (the user's Rust coding-agent CLI, <https://github.com/JZKK720/jcode>) as a new **native terminal harness** alongside the 11 existing ones (claude, codex, cursor, opencode, pi, goose, hermes, kimi, kiro, qwen, antigravity, ironclaw). This makes `meow jcode` launch jcode's TUI in an agent-meow terminal, with the session appearing in the web UI sidebar, transcript mirrored, forkable, team-collaborable, runnable in cloud sandboxes, and policy-governed — the same surface every other native harness gets.

This is a **medium-effort core code change**, NOT the zero-code MCP/skill pattern used by the 5 shipped integration examples (`memory-agent`, `scrapling-agent`, `voicebox-agent`, `reach-agent`, `browser-agent`). Those ride on existing MCP manager / skill auto-discovery seams. A native harness needs new files in the harness registry because jcode is a long-running TUI process agent-meow must launch, mirror, and forward — not a tool the agent calls.

## 2. Why a native harness (not MCP, not skill)

jcode is a **Rust TUI coding agent** that runs as a long-lived interactive process (like `claude`, `codex`, `opencode`). agent-meow's native-harness pattern exists exactly for this: it launches the vendor CLI in a tmux pane, mirrors its transcript back to the web UI via a forwarder, and binds the session so resume/fork/share/policy all work. There is no MCP server in jcode to register, and a skill can't drive a long-lived TUI — the shell-heredoc pattern from `browser-agent` doesn't fit a stateful interactive coding loop.

## 3. The 11 existing native harnesses (verified in source)

From `agent_meow/harness_plugins.py:95-209`, each native harness is one `NativeCodingAgent(...)` dataclass entry:

```python
OPENCODE_NATIVE_CODING_AGENT = NativeCodingAgent(
    key="opencode",
    display_name="OpenCode",
    agent_name="opencode-native-ui",
    harness="opencode-native",
    wrapper_label=OPENCODE_NATIVE_WRAPPER_VALUE,
    terminal_name="opencode",
    subagent_wrapper_label="opencode-native-ui-subagent",
)
```

Fields: `key`, `display_name`, `agent_name`, `harness`, `wrapper_label`, `terminal_name`, optional `subagent_wrapper_label`. Each has a corresponding `*_WRAPPER_VALUE` constant in `agent_meow/_wrapper_labels.py`.

## 4. Files a new native harness needs (grounded in the opencode reference)

Modeled on opencode (the closest analog — both are open-source coding-agent CLIs):

| File | Purpose | Reference |
| --- | --- | --- |
| `agent_meow/_wrapper_labels.py` | Add `JCODE_NATIVE_WRAPPER_VALUE = "jcode-native-ui"` constant | `OPENCODE_NATIVE_WRAPPER_VALUE` |
| `agent_meow/harness_plugins.py` | Add `JCODE_NATIVE_CODING_AGENT = NativeCodingAgent(key="jcode", display_name="jcode", agent_name="jcode-native-ui", harness="jcode-native", wrapper_label=JCODE_NATIVE_WRAPPER_VALUE, terminal_name="jcode", subagent_wrapper_label="jcode-native-ui-subagent")` + register in the capabilities table | `OPENCODE_NATIVE_CODING_AGENT` + `_C`/`_IM`/`_EL`/`_RS`/`_EF` table |
| `agent_meow/jcode_native.py` | `run_jcode_native()` (CLI entry, mirrors `run_opencode_native`) + `_materialize_jcode_agent_spec()` (binds the `jcode-native` harness, declares spawn/terminal surface so web UI renders terminal-first) | `agent_meow/opencode_native.py` |
| `agent_meow/jcode_native_bridge.py` | Bridge: launches jcode in tmux, mirrors transcript | `agent_meow/opencode_native_bridge.py` |
| `agent_meow/jcode_native_forwarder.py` | SSE forwarder from jcode's output to the server | `agent_meow/opencode_native_forwarder.py` |
| `agent_meow/jcode_native_state.py` (if needed) | Launch-state persistence (opencode has this) | `agent_meow/opencode_native_state.py` |
| `agent_meow/cli.py` | Add `@cli.command("jcode")` with `--server`, `--resume`, `--session`, `--model`, `jcode_args` — the `meow jcode` entry point | `opencode` command at `cli.py:4427` |
| `agent_meow/harness_install_spec.py` (if jcode needs an install hint) | Install metadata for the harness picker | `HarnessInstallSpec` |
| Tests: `tests/test_harness_capabilities.py`, `tests/test_wrapper_labels.py`, `tests/e2e/...` | Keep the capabilities table + wrapper-label cross-checks green | existing |

## 5. What jcode brings that's unique (from repo research)

Verified in jcode's source (`github.com/JZKK720/jcode`):

- **agent grep** — context-aware grep that adds file-structure info (function list, displacements) to results so the agent infers more without reading the file. Adaptive truncation based on what the agent has already seen — saves context.
- **Multi-session** — jcode is built for multi-session workflows.
- **MCP client + server** — jcode can both consume MCP servers and expose one.
- **Skills** — jcode has its own skill system.
- **Provider abstraction** — Anthropic, OpenAI, Gemini, Copilot, Azure, OpenRouter, OpenCode Zen, 36+ OpenAI-compatible profiles.
- **Session import** — from codex, opencode, cursor, claude, pi transcripts.
- **Firefox Agent Bridge** — browser automation via Firefox.
- **Swarm coordination** — multi-agent orchestration.

These are jcode's value-add over a bare LLM call; agent-meow surfaces them by wrapping jcode as a native harness, the same way it wraps claude/codex/cursor.

## 6. Open questions for the user (need answers before implementation)

1. **CLI command name.** Is `jcode` on PATH after install, or is it `jcode` from a release tarball the user installs manually? (affects the `terminal_name` / launch command in `jcode_native_bridge.py`)
2. **Subagents.** Does jcode expose a subagent surface (like claude's `claude-code-native-ui-subagent`)? If yes, set `subagent_wrapper_label`; if no, leave it `None` (like goose/kiro/kiro/hermes/antigravity which have no subagent label).
3. **Model override.** jcode has its own `/model` command and 36+ provider profiles. Should `meow jcode --model X` pin a model on the wrapper spec (like opencode does), or let jcode's own provider selection handle it (pass-through)?
4. **Capabilities table.** What are jcode's `IntegrationMode`, `Elicitation`, `Resume`, `EffortFamily` values? These need verification against jcode's actual behavior (does it support elicitation? mid-session model change? resume?).
5. **Install hint.** jcode installs via `curl -fsSL https://jcode.sh/install | bash` (macOS/Linux) or `irm https://jcode.sh/install.ps1 | iex` (Windows). Should the harness picker show this hint when `jcode` is not on PATH?
6. **Windows support.** jcode supports Windows. agent-meow's native terminal wrappers do NOT (they need tmux + bwrap/seatbelt — see README). Should `meow jcode` be the first native harness to work on Windows, or is macOS/Linux-only acceptable (matching the other 11)?

## 7. Alternatives considered

| Alternative | Why not |
| --- | --- |
| **MCP server registration** (zero-code, like memory/scrapling/voicebox) | jcode is a long-running TUI, not an MCP server. MCP doesn't fit a stateful interactive coding loop. |
| **Skill-only** (zero-code, like browser-agent) | A skill can instruct the agent to shell out, but can't drive a long-lived TUI with transcript mirroring, resume, fork, share, policy. The shell-heredoc pattern is for one-shot CLI calls, not stateful sessions. |
| **Standalone jcode + point its MCP client at agent-meow's MCP server** (zero core code) | Works, but jcode sessions live in jcode's TUI, not agent-meow's web UI. Loses sidebar, fork, share, cloud-sandbox, policy. This is the "Path B" from the earlier discussion — still available as a fallback if you don't want the core change. |
| **Wait / don't integrate** | Loses jcode's unique features (agent grep, swarm) in the agent-meow surface. |

## 8. Effort estimate

- **Files to add:** ~5 new (jcode_native.py, jcode_native_bridge.py, jcode_native_forwarder.py, maybe jcode_native_state.py, maybe jcode install spec) + edits to 2 existing (_wrapper_labels.py, harness_plugins.py) + CLI command in cli.py + capabilities table.
- **Tests:** update `tests/test_harness_capabilities.py` and `tests/test_wrapper_labels.py` (the cross-check guards), add a jcode-native spec-load test.
- **Risk:** touches the native-harness registry, which is the system-of-record for which TUI harnesses agent-meow supports. Must not break existing harnesses. The capabilities-table cross-check test (`tests/test_harness_capabilities.py`) is the guard.
- **Estimated size:** medium — comparable to adding the antigravity or kiro native harness.

## 9. What I need from you before implementing

Answers to the 6 open questions in §6 — especially #1 (CLI name), #2 (subagents), #4 (capabilities), and #6 (Windows). Once those are pinned, the implementation is mechanical: copy the opencode native harness pattern, rename to jcode, fill in the capabilities, and update the cross-check tests.

If you'd rather not do the core change, **Path B (standalone jcode + MCP client)** remains available as the zero-code fallback — jcode runs on its own, points its MCP client at agent-meow's MCP server, and uses agent-meow's `sys_*` tools via MCP. Sessions live in jcode's TUI, not agent-meow's web UI, but no agent-meow code changes.
