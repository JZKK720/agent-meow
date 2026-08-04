# Revised Assessment — Hermes via Docker Desktop

**Date:** 2026-07-28  
**Status:** Corrected  
**Previous claim:** "Hermes CLI is NOT installed" — **WRONG**

---

## Correction

Hermes **IS** installed and running via Docker Desktop:

| Container | Ports | Status |
|-----------|-------|--------|
| `hermes-gateway` | 8642, 8644, 8789 | Up 15 hours (healthy) |
| `hermes-web` | 9119 | Up 15 hours (healthy) |
| `hermes-postgres` | 5433 | Up 15 hours (healthy) |

**The confusion:** I was looking for the `hermes` CLI binary on PATH. The Docker deployment runs Hermes as a **service** (OpenAI-compatible API server on port 8642), not as a CLI tool.

---

## How Omnigent Connects to Hermes (Docker Mode)

Omnigent has **two** Hermes integration paths:

### Path 1: `hermes-gateway` Agent (OpenAI-compatible API)

This is the **Docker deployment path**:

```yaml
# examples/hermes-gateway/config.yaml
spec_version: 1
name: hermes-gateway
executor:
  type: agent-meow
  config:
    harness: openai-agents  # ← Uses the openai-agents harness, NOT hermes harness
  model: hermes-agent
  auth:
    type: api_key
    api_key: ${HERMES_GATEWAY_KEY}
    base_url: http://127.0.0.1:8642/v1  # ← Docker Hermes gateway
```

**How it works:**
1. `openai-agents` harness (pure-Python SDK, no CLI needed)
2. Points to `http://127.0.0.1:8642/v1` (Docker Hermes gateway)
3. Uses `HERMES_GATEWAY_KEY` env var for auth
4. Registered as extra built-in agent via `OMNIGENT_BUILTIN_AGENT_DIRS`

**Verification:**
- The `openai-agents` harness accepts `HARNESS_OPENAI_AGENTS_GATEWAY_BASE_URL` for custom base URLs
- The `api_key` path in `OpenAIAgentsSDKExecutor` uses `base_url_override` when set
- This is the **correct** way to connect to Docker Hermes

### Path 2: `hermes` / `hermes-native` Harnesses (CLI Mode)

These expect the `hermes` CLI binary:
- `hermes` — headless subprocess (`hermes chat -q`)
- `hermes-native` — TUI in tmux pane

**These are NOT the right path for Docker Hermes.**

---

## Test Status (Revised)

| Test Suite | Tests | Status | Notes |
|------------|-------|--------|-------|
| `test_hermes_native_executor.py` | 9 | ✅ Pass | TUI injection (no Docker needed) |
| `test_hermes_harness.py` | 8 | ⚠️ 7/8 | 1 Windows path issue |
| `test_hermes_executor.py` | 37 | ⚠️ 28/37 | Fails due to `_host.py` Unicode bug |
| `test_hermes_native_bridge.py` | 33 | ⚠️ 28/33 | Same `_host.py` bug |
| `test_openai_agents_sdk_harness.py` | ? | ❓ | Need to check |
| `test_openai_agents_sdk_executor.py` | ? | ❓ | Need to check |

**Key insight:** The `hermes-gateway` agent uses `openai-agents` harness, NOT the `hermes` harness. The `hermes` harness tests are testing the CLI path, which is a different integration.

---

## What Actually Needs Testing for Docker Hermes

| # | Test | Purpose | Command |
|---|------|---------|---------|
| 1 | `test_openai_agents_sdk_harness.py` | Verify openai-agents harness works | `pytest tests/inner/test_openai_agents_sdk_harness.py -v` |
| 2 | `test_openai_agents_sdk_executor.py` | Verify executor works | `pytest tests/inner/test_openai_agents_sdk_executor.py -v` |
| 3 | Hermes gateway connectivity | Verify Docker Hermes responds | `curl http://localhost:8642/v1/models` |
| 4 | End-to-end hermes-gateway agent | Verify agent can be created and used | Manual or e2e |

---

## Immediate Actions

### 1. Fix `_host.py` Unicode Bug (Blocks Multiple Test Suites)

**File:** `sdks/ui/omnigent_ui_sdk/terminal/_host.py` line 75

**Current (corrupted):**
```python
_RING_CHARS = ("�?, "�?, "�?, "�?, "�?, "�?, "�?, "�?, "�?)
```

**Fix:** Replace with valid Unicode ring characters or ASCII fallback.

### 2. Verify Hermes Gateway Connectivity

```bash
# Check if Docker Hermes responds
curl http://localhost:8642/v1/models
# or
curl http://localhost:8642/health
```

### 3. Run openai-agents Tests

```bash
pytest tests/inner/test_openai_agents_sdk_harness.py -v
pytest tests/inner/test_openai_agents_sdk_executor.py -v
```

### 4. Test hermes-gateway Agent End-to-End

Set `OMNIGENT_BUILTIN_AGENT_DIRS` to include `examples/hermes-gateway/config.yaml`, then verify the agent appears in the web UI and can handle turns.

---

## Revised Build Plan

### Phase 1: Fix `_host.py` (Immediate)
- **Effort:** S (2 min)
- **Impact:** Unblocks 10+ failing tests across multiple suites
- **Risk:** None (obvious syntax error)

### Phase 2: Verify Docker Hermes Connectivity (Immediate)
- **Effort:** S (1 min)
- **Impact:** Confirms Hermes service is reachable
- **Risk:** None

### Phase 3: Run openai-agents Tests (Immediate)
- **Effort:** S (1 min)
- **Impact:** Verifies the harness that actually connects to Docker Hermes
- **Risk:** None

### Phase 4: Test hermes-gateway Agent (Next)
- **Effort:** M (needs agent setup)
- **Impact:** End-to-end verification of Docker Hermes integration
- **Risk:** Low (follows existing extra-builtin-agents pattern)

---

## Questions for You

1. **Is `HERMES_GATEWAY_KEY` set?** The `hermes-gateway` agent needs this env var for auth.
2. **Do you want me to test the `hermes-gateway` agent end-to-end?** I can set `OMNIGENT_BUILTIN_AGENT_DIRS` and verify it works.
3. **Should I fix `_host.py` now?** It's blocking multiple test suites.

---

*Revised assessment by improve skill. All findings verified against codebase.*
