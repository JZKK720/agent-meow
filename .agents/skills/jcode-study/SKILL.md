---
description: "jcode harness study notes for agent-meow — architectural patterns and competitive analysis. Reference only — do not integrate as a tool."
applyTo: "**"
---

# jcode — Competitive Harness Study for agent-meow

jcode (at `C:\Users\1\github-pr\jcode`) is a competing agent harness. This document is a study of its architecture, patterns, and what agent-meow can learn from it. **Do not integrate jcode as a tool** — it's a peer, not a dependency.

## What jcode Does Well

### 1. Memory Management
- **Dynamic memory**: Per-session memory banks that grow/shrink with the conversation
- **Smart compaction**: Automatically compacts long conversations to fit context windows
- **Cross-session memory**: Persistent memory across sessions (like LLM Wiki's approach)

### 2. Performance
- **27.8 MB RAM** for 1 active session (vs typical 100-200MB)
- **Fast boot**: < 500ms startup time
- **Local embeddings**: Optional local embedding models for search

### 3. Swarm Mode
- **Multi-agent collaboration**: Multiple agents work on the same task with a coordinator
- **Task decomposition**: Large tasks split into sub-tasks assigned to different agents
- **Result synthesis**: Coordinator merges results from all agents

### 4. Self-Development
- **Self-modifying**: Agents can modify their own configuration and tools
- **Plugin system**: Custom tools loaded at runtime
- **Skill marketplace**: Community-contributed skills

### 5. Browser Automation
- **Built-in**: Browser automation as a first-class feature
- **Session persistence**: Browser sessions persist across agent turns
- **Screenshot analysis**: Vision models analyze screenshots

## What agent-meow Does Better

| Feature | agent-meow | jcode |
|---------|-----------|-------|
| Harness count | 22 (12 SDK + 10 native) | 1 (itself) |
| MCP support | Full (stdio/SSE/HTTP) | Partial |
| Surfaces | Docs, Images, Videos, Voice | Chat only |
| Desktop app | Yes (Electron/Tauri) | No (CLI only) |
| Multi-user | Yes (server) | No (local only) |
| Scheduled tasks | Yes | Limited |
| Policy engine | Yes (ASK/DENY) | No |

## Key Takeaways for agent-meow

1. **Memory**: Adopt jcode's dynamic memory management — per-session banks that auto-compact
2. **Performance**: Profile and optimize RAM usage; target < 50MB per session
3. **Swarm**: Consider multi-agent orchestration for complex tasks (like OpenMontage)
4. **Self-dev**: Allow agents to create custom tools/skills at runtime
5. **Browser**: Keep browser_* tools, but add self-healing (browser-harness pattern)

## When to Reference jcode

- **Performance optimization**: Study jcode's memory management for agent-meow's session model
- **Multi-agent patterns**: Study jcode's swarm mode for OpenMontage-style multi-agent video production
- **Plugin architecture**: Study jcode's plugin system for agent-meow's tool registry

## Not Applicable to agent-meow

- jcode's CLI-only interface — agent-meow has a full desktop app and server
- jcode's single-harness model — agent-meow wraps 22 harnesses
- jcode's local-only deployment — agent-meow supports multi-user server mode
