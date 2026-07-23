# memory-agent

A general-purpose assistant example demonstrating **per-agent semantic memory via MCP**.

This is the reference for **Option A** from the agent-meow memory integration plan: declare the `@agentmemory/mcp` server inside one agent bundle's `config.yaml`, so every session created from that agent gets the full 53-tool memory surface with **zero core agent-meow code changes**.

## What it gives you

- **Persistent, cross-session memory.** Facts, decisions, and context saved in one session are recallable in the next.
- **Hybrid retrieval.** BM25 + vector + knowledge-graph fusion (RRF, k=60). 95.2% R@5 on LongMemEval-S.
- **Local-first.** SQLite + local `all-MiniLM-L6-v2` embeddings by default. No API key, no cloud, no Postgres.
- **Auto-capture.** agentmemory's hooks record tool usage automatically; explicit `memory_save` is only for high-signal facts the hooks miss.
- **Cross-harness.** Memories captured while running this agent are accessible from any other agent that also declares `@agentmemory/mcp` (or via the REST API on `:3111`).

## Two-process setup

agentmemory is a **long-running memory server** (port 3111) plus an **MCP shim** (stdio) that the agent spawns per-session. You run the server once; every session's shim proxies to it.

### 1. Start the memory server (one terminal, runs forever)

```bash
npx @agentmemory/agentmemory
```

- REST API on `http://localhost:3111/agentmemory/*`
- Real-time viewer on `http://localhost:3113`
- Storage under `~/.agentmemory/` (SQLite + iii-engine binary, auto-downloaded)
- Local embeddings: `all-MiniLM-L6-v2` via Xenova (no API key). Set `OPENAI_API_KEY` etc. if you want richer embeddings (optional).

Verify it's up:

```bash
curl http://localhost:3111/agentmemory/health
```

### 2. Run the agent (another terminal)

```bash
meow run examples/memory-agent/config.yaml
```

The runner reads `config.yaml`, sees the `agentmemory` entry under `tools:`, spawns `npx -y @agentmemory/mcp` as a stdio MCP subprocess, and that shim dials the server on `:3111`. The agent now has 53 memory tools (`memory_save`, `memory_recall`, `memory_smart_search`, `memory_sessions`, `memory_governance_delete`, `memory_slot_*`, `memory_reflect`, etc.).

## How the wiring works (no core code change)

agent-meow already ships:

- `agent_meow/tools/mcp.py` — MCP client manager (stdio + HTTP + SSE).
- `agent_meow/server/routes/session_mcp_servers.py` — per-session MCP registration routes.
- `agent_meow/spec/types.py::MCPServerConfig` — the typed config this `config.yaml` parses into.
- `AgentSpec.mcp_servers` — the field the spec loader populates from `tools:` entries with `type: mcp`.

This example just adds one `MCPServerConfig` entry. The runner's `RunnerMcpManager` connects to it at session start and exposes its tools to the model.

## Trying it

1. Start the server (step 1 above).
2. Run the agent (step 2 above).
3. In the session:
   - "Remember that I prefer tabs over spaces for TypeScript."
   - The agent calls `memory_save`.
   - Stop the session. Start a new one from the same agent.
   - "What's my TypeScript indentation preference?"
   - The agent calls `memory_smart_search` and recalls the saved fact.

## Tuning

All knobs live on the **server** side, not in `config.yaml`:

| Env var | Default | Purpose |
| --- | --- | --- |
| `AGENTMEMORY_URL` | `http://localhost:3111` | Where the shim dials. Override for non-default ports or remote servers. |
| `AGENTMEMORY_SECRET` | unset | Shared secret if the server was started with auth. |
| `AGENTMEMORY_AGENT_SCOPE` | `shared` | `isolated` to partition memories per agent id. |
| `BM25_WEIGHT` / `VECTOR_WEIGHT` | 0.4 / 0.6 | RRF fusion weights. |
| `TOKEN_BUDGET` | 2000 | Max tokens injected on SessionStart recall. |
| `AGENTMEMORY_AUTO_COMPRESS` | `false` | On = every PostToolUse hook calls your LLM to compress observations (higher token spend). |
| `GRAPH_EXTRACTION_ENABLED` | `false` | On = extract knowledge-graph entities at SessionEnd. |
| `SLOT_REFLECT_ENABLED` | `false` | On = editable pinned memory slots. |

See the [agentmemory docs](https://github.com/rohitg00/agentmemory) for the full list.

## Adding memory to your own agents

Copy the `tools.agentmemory` block from this `config.yaml` into your agent's `config.yaml`. That's it. Any agent that declares it gets the same 53-tool memory surface.

## Notes

- **Windows:** `npx` requires Node.js 20+. Install from <https://nodejs.org> or `winget install OpenJS.NodeJS.LTS`.
- **Sandboxed runners:** if the runner can't reach `localhost:3111` (e.g. in a cloud sandbox), set `AGENTMEMORY_FORCE_PROXY=1` in the shim's `env` block and point `AGENTMEMORY_URL` at a routable address.
- **MCP shim vs full server:** `@agentmemory/mcp` is a thin shim. It exposes the full 53-tool surface only when it can reach a running `agentmemory` server via `AGENTMEMORY_URL`. With no server reachable, it falls back to a 7-tool local set. Always start the server (step 1) before running the agent (step 2).
- **Not server-wide:** this is the per-agent pattern. Sessions from agents that don't declare `agentmemory` won't have memory. If you want memory on every session including native-harness `meow claude` / `meow codex` sessions (which have no agent bundle), that's Option B — an admin MCP injection point in the spec loader, a separate core change.
