---
description: "Watch Skill — video understanding and agent self-verification for agent-meow. Use when: user wants to analyze video, transcribe streams, verify agent work via screen recording, or search across video content with timestamp citations."
applyTo: "**"
---

# Watch Skill — Video Intelligence + Self-Verification

Watch Skill (https://github.com/oxbshw/watch-skill) is a local-first video intelligence layer for AI agents. It exposes 23 MCP tools via stdio for video understanding, persistent memory, and self-verification loops.

## Three Capabilities

### 1. Watch — Video Understanding

Turn videos, live streams, meetings, and screen recordings into searchable, timestamped evidence.

- Scene-aware frame extraction
- On-screen text (OCR)
- Local-first transcription (1,800+ sites, HLS/DASH streams, local media, meetings, browsers, desktops)
- No cloud API keys required

### 2. Remember — Persistent Video Memory

A searchable index with timestamp citations that persists across sessions.

- Hybrid retrieval (keyword + semantic)
- Cross-video synthesis
- Reusable lessons extracted from video content
- Timestamp citations for every answer

### 3. Verify — THE LOOP (Self-Verification)

A capture → critique → fix → proof loop for agent self-verification.

1. **Capture**: Record the agent's browser or desktop session
2. **Critique**: Evaluate against plain-language criteria
3. **Fix**: Guide the agent to fix issues
4. **Proof**: Verify the fix with a new recording

Works for: browser flows, interfaces, generated video, gameplay, monitored streams.

## MCP Server

Watch Skill is wired as an MCP stdio server in the CubeCloud bundle (`mcp.json.template`):

```json
"watch-skill": {
  "type": "stdio",
  "command": "uvx",
  "args": ["watch-skill@latest"],
  "env": { "PYTHONUTF8": "1" }
}
```

The 23 MCP tools cover:
- Video ingestion and indexing
- Scene detection and frame extraction
- Transcription (local, no API key)
- Timestamp-based search
- Cross-video synthesis
- Session recording and capture
- Verification loop execution

## Integration with agent-meow

### Video Surface Complement

agent-meow's Video surface (`video_generate`, `video_list`, `video_get`) handles video **generation** (fal.ai, Pixelle-Video, OpenMontage). Watch Skill handles video **understanding** — analyzing existing video content, transcribing, searching, and verifying.

Together they form a complete video lifecycle:
```
Generate (fal.ai/Pixelle) → Store (VideoStore) → Understand (Watch Skill) → Verify (THE LOOP)
```

### Agent Self-Verification

THE LOOP pattern enables agent-meow agents to verify their own work:
1. Agent performs a task (e.g., UI change, code fix)
2. Watch Skill captures the browser/desktop session
3. Watch Skill evaluates against criteria
4. Agent receives feedback and fixes issues
5. Watch Skill verifies the fix

This closes the feedback gap — agents can now self-verify visual/UI work without human review.

### Hermes Session Memory Bridge

Watch Skill's persistent index complements agent-meow-memory:
- **agent-meow-memory**: Text-based recall (Hermes state.db, MEMORY.md, USER.md)
- **Watch Skill**: Video-based recall (timestamped evidence, scene citations)

## Setup

Watch Skill auto-installs via `uvx` when the MCP server starts. For manual setup:

```bash
uvx watch-skill@latest
```

Or install from source:
```bash
git clone https://github.com/oxbshw/watch-skill.git
cd watch-skill
pip install -e .
```

## License

MIT — compatible with agent-meow.
