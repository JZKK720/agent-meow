# Plan 009: ACP shim — wire QAA backend agent to Hermes runtime (Path B)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ff786767..HEAD -- agent_meow/inner/hermes_executor.py agent_meow/inner/hermes_harness.py examples/hermes-gateway/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/006-install-qaa-gateway-dashscope.md (QAA Gateway running)
- **Category**: direction
- **Planned at**: commit `ff786767`, 2026-08-04

## Why this matters

QAA's nonblocking architecture has two layers: a realtime frontend (instant
speech) and a backend Agent (tool-using work via `spawn_thinking`). The
backend speaks ACP (Agent Client Protocol). agent-meow's Hermes runtime
(`openai-agents` harness → Hermes gateway at `:8642`) is an OpenAI-compatible
API, not ACP. A thin ACP shim lets QAA delegate tool-using voice work to
Hermes — the user keeps talking while Hermes runs code, files, MCP tools,
and the result is spoken back when ready. This is the "full power" path
that makes voice a first-class agent interaction surface.

## Current state

- QAA's backend uses `AcpBackendAdapter` (`server/src/agent/acp-backend-adapter.mjs`)
  which speaks ACP over a WebSocket or HTTP connection.
- QAA supports `AGENT_PROTOCOL=openclaw` (or `opencode`, `qoder`, `kimi`,
  `codex`, `claude`, `acp`) — the backend driver. The `hermes` option is
  listed in QAA's desktop settings (`desktop/src/settings.js:127`:
  `if (value === 'hermes') return 'Hermes'`).
- agent-meow's `openai-agents` harness wraps Hermes at `:8642`:
  ```yaml
  # examples/hermes-gateway/config.yaml
  executor:
    type: agent-meow
    config:
      harness: openai-agents
  model: hermes-agent
  auth:
    type: api_key
    api_key: ${HERMES_GATEWAY_KEY}
    base_url: http://127.0.0.1:8642/v1
  ```
- agent-meow's runner app (`agent_meow/runner/app.py`) exposes a FastAPI
  server that can run agents. The `hermes_executor.py` wraps the
  OpenAI-compatible API calls.

### What ACP is

ACP (Agent Client Protocol) is a JSON-over-WebSocket protocol where:
- The client (QAA) sends `spawn_thinking` with an objective + context
- The backend (agent-meow) runs the agent (Hermes) and streams progress
- The backend returns a final `presentation` with `speech` (semantic material)
  and optional `inline` (markdown/code)

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Python tests | `uv run pytest tests/ -q` | all pass |
| Type check | `uv run mypy agent_meow` | no errors |
| Hermes health | `curl http://127.0.0.1:8642/v1/models` | JSON with model list |
| QAA health | `curl http://127.0.0.1:3101/api/health` | `ok: true`, `backend.ok: true` |

## Scope

**In scope** (files you should create/modify):
- `agent_meow/server/acp_shim.py` (create) — ACP endpoint exposing Hermes as a backend agent
- `agent_meow/server/routes/__init__.py` (modify) — register the ACP route
- `tests/server/test_acp_shim.py` (create) — tests for the ACP shim
- `scripts/start-qaa-gateway.ps1` (modify) — set `AGENT_PROTOCOL=acp` + point at the shim

**Out of scope** (do NOT touch):
- `agent_meow/inner/hermes_executor.py` — the Hermes wrapper, used as-is
- `agent_meow/inner/hermes_harness.py` — the harness adapter, used as-is
- `examples/hermes-gateway/config.yaml` — the existing agent config, used as-is
- QAA's source code — we're connecting TO QAA, not modifying it

## Git workflow

- Branch: `feat/acp-shim-hermes-backend`
- Commit per step; message style: `feat(acp): <description>`
- Do NOT push unless instructed.

## Steps

### Step 1: Study QAA's ACP adapter protocol

Read QAA's `server/src/agent/acp-backend-adapter.mjs` to understand:
- The WebSocket message format (what QAA sends, what it expects back)
- The `spawn_thinking` request shape
- The `presentation` response shape
- The progress streaming events

Also read `server/src/agent/backends/` for existing backend drivers
(opencode, openclaw) as implementation patterns.

**Verify**: You can document the ACP message flow (request → progress →
final presentation) in a comment at the top of `acp_shim.py`.

### Step 2: Implement the ACP shim

Create `agent_meow/server/acp_shim.py` — a FastAPI WebSocket endpoint that:
1. Accepts ACP `spawn_thinking` requests from QAA
2. Translates the objective into a Hermes API call (via the existing
   `openai-agents` harness or direct `httpx` to `:8642/v1/chat/completions`)
3. Streams progress events back to QAA as the Hermes response streams
4. Returns a final `presentation` with `speech` (the Hermes response text)
   and `inline` (any markdown/code blocks)

The shim is thin — it translates ACP ↔ OpenAI chat completions. It does
NOT run the full agent-meow runner; it's a lightweight proxy that calls
Hermes and formats the response for QAA.

```python
# Pseudocode for the shim:
@app.websocket("/acp/realtime")
async def acp_endpoint(ws: WebSocket):
    await ws.accept()
    msg = await ws.receive_json()  # spawn_thinking
    # Call Hermes:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://127.0.0.1:8642/v1/chat/completions",
            json={"model": "hermes-agent", "messages": [...]},
            headers={"Authorization": f"Bearer {HERMES_KEY}"},
        )
    # Format as ACP presentation:
    result = response.json()
    await ws.send_json({
        "type": "work.completed",
        "presentation": {
            "speech": result["choices"][0]["message"]["content"],
            "inline": None,
        }
    })
```

**Verify**: `uv run mypy agent_meow/server/acp_shim.py` — no type errors.

### Step 3: Register the ACP route

In `agent_meow/server/routes/__init__.py` (or wherever routes are mounted),
add the ACP shim endpoint. The QAA Gateway will connect to
`ws://127.0.0.1:<agent-meow-port>/acp/realtime`.

**Verify**: `uv run pytest tests/ -q` — no import errors. The agent-meow
server starts without errors.

### Step 4: Write tests

Create `tests/server/test_acp_shim.py`:
- Test that the ACP endpoint accepts a WebSocket connection
- Test that a `spawn_thinking` request produces a `work.completed` response
- Test that Hermes API errors are handled gracefully (return an error
  presentation, don't crash)
- Mock the Hermes API call (don't require a running Hermes in tests)

Pattern: model after `tests/server/routes/test_s2s_proxy.py` (if it still
exists) or other server route tests.

**Verify**: `uv run pytest tests/server/test_acp_shim.py -v` — all pass.

### Step 5: Configure QAA to use the ACP shim

Update the QAA `config.env`:
```dotenv
AGENT_PROTOCOL=acp
QWEN_AUDIO_AGENT_BACKEND_URL=ws://127.0.0.1:<agent-meow-port>/acp/realtime
```

Or if QAA has a `hermes` backend driver (seen in `settings.js:127`), try:
```dotenv
AGENT_PROTOCOL=hermes
```

**Verify**: `curl http://127.0.0.1:3101/api/health` shows
`backend.ok: true` and `backend.label: "Hermes"` (or similar).

### Step 6: End-to-end Path B smoke test

1. Start Hermes Docker.
2. Start agent-meow server (with the ACP shim).
3. Start QAA Gateway (`AGENT_PROTOCOL=acp`).
4. Open QAA web UI or agent-meow web UI.
5. Say: "Create a Python file that prints hello world"
6. Verify: QAA answers instantly (realtime frontend), then after a few
   seconds, Hermes completes the tool work and QAA speaks the result
   ("Done. I created hello.py...").

**Verify**: Nonblocking flow works — the user can keep talking while
Hermes works. The result is spoken back when ready.

## Test plan

- `tests/server/test_acp_shim.py`:
  - WebSocket connection test
  - spawn_thinking → work.completed happy path
  - Hermes API error handling
  - Timeout handling (Hermes takes >60s)
- Pattern: existing server route tests
- Verification: `uv run pytest tests/server/test_acp_shim.py -v`

## Done criteria

- [ ] `agent_meow/server/acp_shim.py` exists and implements the ACP endpoint
- [ ] `uv run mypy agent_meow` exits 0
- [ ] `uv run pytest tests/ -q` exits 0; new ACP shim tests pass
- [ ] `curl http://127.0.0.1:3101/api/health` shows `backend.ok: true`
- [ ] E2e smoke test: nonblocking voice + tool work via Hermes
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- QAA's ACP protocol doesn't match the documented message flow — re-read
  `acp-backend-adapter.mjs` and adjust the shim. Report the discrepancy.
- QAA's `hermes` backend driver (if it exists) works differently than
  expected — use it instead of the custom shim if it's simpler. Report
  which path was taken.
- Hermes API at `:8642` is not reachable — the user must start Hermes
  Docker first. Don't try to start it yourself.
- The `spawn_thinking` → Hermes translation loses context (Hermes doesn't
  get the conversation history) — report the context-passing gap; it may
  require passing recent voice transcripts in the Hermes system prompt.