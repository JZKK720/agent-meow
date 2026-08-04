# Architectural Compass - agent-meow (2026-07-28)

> [!NOTE]
> This is a token-optimized summary. For deep logic, see GRAPH_REPORT.md.
> Fresh graph: 97,557 nodes · 424,268 edges · 1,708 communities (from commit 3aaf7053).

## Core Abstractions (God Nodes)
1. `OSEnvSpec` (3294 edges) — `agent_meow/inner/datamodel.py:666`
2. `AgentSpec` (2991 edges) — `agent_meow/spec/types.py:1366`
3. `OmnigentError` (694 edges) — `agent_meow/errors.py:87`
4. `create_runner_app()` (329 edges) — `agent_meow/runner/app.py:7875`
5. `TurnComplete` — completion signal for agent turns
6. `FunctionPolicySpec` — policy enforcement spec
7. `SkillSpec` — skill definition type
8. `SqlUser` — DB user model
9. `DetectedProvider` — LLM provider detection
10. `RunnerStartupProgress` — runner lifecycle state

## System Layers
- **L0: Global/Entry**: `cli.py`, `app.py`, `ChatPage.tsx`, `AppShell.tsx`, `Sidebar.tsx`
- **L1: Strategic/Core**: `OSEnvSpec`, `AgentSpec`, `FunctionPolicySpec`, `SkillSpec`, `OmnigentError`, `TurnComplete`
- **L2: Implementation**: `create_runner_app()`, `tool_dispatch`, `sessions.py`, `harness_plugins.py`, `SandboxLauncher`, `EgressProxy`, `SessionResourceRegistry`
- **L3: Utility**: `FileViewer.tsx`, `TerminalView.tsx`, `ApprovalCard.tsx`, `ExecutionLogsPanel.tsx`, `NewChatDialog.tsx`, `renderItems.test.ts`, `chatStore.test.ts`

## Key Communities (by hub)
- **LLMConfig** — OmnigentError, provider detection, LLM routing
- **OSEnvSpec** — environment/sandbox specs, the most connected node
- **AgentSpec** — agent definition types and validation
- **.append** — runner app construction (create_runner_app hub)
- **FileViewer.tsx** — file viewing UI community
- **NewChatDialog.tsx** — chat entry surface
- **harness_plugins.py** — harness plugin system
- **open_right_rail** — right-rail UI orchestration

## Extraction Quality
- 50% EXTRACTED (up from 37%) · 50% INFERRED · 0% AMBIGUOUS
- 3,536 files (up from 2,684) · ~12.9M words (up from ~10M)
- 97,557 nodes (up from 73,827) · 424,268 edges (up from 357,385)