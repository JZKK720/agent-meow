---
description: "LLM Wiki knowledge graph skill for agent-meow. Use when: user wants to build a persistent knowledge graph from documents, research a topic deeply, or query curated project knowledge. NOT for simple web searches — use web_search for that."
applyTo: "**"
---

# LLM Wiki — Persistent Knowledge Graph for agent-meow

LLM Wiki (at `C:\Users\1\github-pr\llm_wiki`) is a desktop app that builds a persistent, Obsidian-compatible knowledge graph from your documents. Instead of re-running RAG per query, it incrementally compiles documents into a curated wiki with a knowledge graph, Louvain communities, and optional LanceDB vector search.

## Architecture

```
Documents → LLM Wiki (Rust + Tauri) → Knowledge Graph (Markdown + SQLite)
                                        ↓
                        MCP Server (Node.js) → agent-meow agent
                                        ↓
                        Agent queries wiki, traverses graph, triggers rescans
```

## Prerequisites

1. **LLM Wiki desktop app running**: `C:\Users\1\github-pr\llm_wiki\src-tauri\target\release\llm-wiki.exe`
2. **API enabled**: Settings → API + MCP → "Enable local HTTP API" + "Enable MCP access"
3. **Token configured**: Settings → API + MCP → set `LLM_WIKI_API_TOKEN`
4. **MCP server built**: `cd mcp-server && npm install && npm run build`

## Agent-Meow Configuration

Add to your agent spec YAML:

```yaml
tools:
  mcp_servers:
    - name: llm-wiki
      command: node
      args: ["C:/Users/1/github-pr/llm_wiki/mcp-server/dist/src/index.js"]
      env:
        LLM_WIKI_API_TOKEN: "your-token"
```

## Available Tools (via MCP)

| Tool | Description |
|------|-------------|
| `llm_wiki_status` | Check API status + current project |
| `llm_wiki_projects` | List known projects |
| `llm_wiki_project_files` | List files in current project |
| `llm_wiki_search` | Full-text search across project |
| `llm_wiki_read` | Read a file's content |
| `llm_wiki_write` | Create/update a file |
| `llm_wiki_graph_neighbors` | Get graph neighbors of a node |
| `llm_wiki_graph_search` | Search graph by label/type |
| `llm_wiki_graph_node` | Get a specific graph node |
| `llm_wiki_graph_edges` | Get edges for a node |
| `llm_wiki_rescan` | Trigger document rescan |
| `llm_wiki_chat` | Deep research chat (multi-step) |

## Usage Examples

### Research a Topic

```
1. llm_wiki_chat: "Research the integration patterns between agent harnesses and MCP servers"
2. LLM Wiki searches its knowledge graph, synthesizes, returns a structured answer
3. Follow up with llm_wiki_search for specific details
```

### Query the Graph

```
1. llm_wiki_graph_search: "MCP server" → find all nodes mentioning MCP
2. llm_wiki_graph_neighbors: node_id → see what's connected
3. llm_wiki_graph_node: node_id → read the node's content
```

### Build Knowledge

```
1. Point LLM Wiki at your docs directory (in the desktop app)
2. llm_wiki_rescan: re-index after adding new documents
3. The wiki grows incrementally — no need to re-ingest everything
```

## Comparison to Hindsight

| Feature | Hindsight | LLM Wiki |
|---------|-----------|----------|
| Storage | Per-conversation memory bank | Persistent knowledge graph |
| Scope | Single agent session | Cross-project, cross-session |
| Search | Text recall | Graph traversal + vector search |
| Format | Key-value | Obsidian-compatible Markdown |
| Backend | hindsight-client (Python) | Rust (Tauri) + Node.js MCP |
| Setup | pip install hindsight-client | Desktop app + MCP server |

## When to Use LLM Wiki vs Hindsight

- **LLM Wiki**: Long-term project knowledge, research synthesis, cross-session memory, curated documentation
- **Hindsight**: Session-specific memory, quick recall, lightweight key-value storage

## Security Notes

- The desktop API runs on `127.0.0.1:19828` (localhost only)
- Always set `LLM_WIKI_API_TOKEN` in production
- The MCP server is stdio-based (subprocess, not network)
- Source Watch rules control which directories are indexed
