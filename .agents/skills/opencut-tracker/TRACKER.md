# OpenCut MCP Server Tracker

> **Status**: WATCHING — OpenCut is mid-rewrite. The MCP server and Editor API are planned but not yet shipped.
> 
> **Repo**: https://github.com/OpenCut-app/OpenCut
> **Last checked**: 2026-07-24

## What OpenCut Is

OpenCut is the open-source CapCut alternative — a real timeline video editor. The rewrite (currently in progress) adds:

- **Editor API**: Programmatic timeline editing
- **MCP Server**: AI agent control (explicitly planned)
- **Headless mode**: Automation/batch rendering
- **Plugin-first architecture**: Custom tools via plugins
- **In-editor scripting**: JavaScript-based scripting inside the editor

## When to Integrate

Integrate OpenCut as an MCP server in agent-meow **when the MCP server ships**. Track progress:

1. **MCP server milestone**: Check OpenCut releases for "MCP" or "server" in release notes
2. **Editor API milestone**: Check for a stable `/api` endpoint
3. **Headless mode milestone**: Check for `--headless` CLI flag

## Integration Pattern (Future)

```yaml
tools:
  mcp_servers:
    - name: opencut
      command: opencut
      args: ["--mcp", "--headless"]
```

## Coexistence with OpenMontage + Pixelle-Video

| Tool | Role | When to Use |
|------|------|-------------|
| OpenMontage | Full production pipeline (script→render) | Complex, multi-stage video production |
| Pixelle-Video | Black-box short-video generator | Quick short-form content |
| OpenCut | Interactive timeline editing | Fine-grained editing, manual touch-up |

**Pattern**: OpenMontage for generation → OpenCut for editing → agent-meow agent reviews.

## Current Alternatives

Until OpenCut ships its MCP server, use:
- **OpenMontage** for full production pipelines
- **Pixelle-Video** for quick short-video generation
- **Fabric.js** (existing) for image editing
