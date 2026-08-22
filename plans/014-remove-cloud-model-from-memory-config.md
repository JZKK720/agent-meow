# Plan 014: Remove cloud model from Hermes memory config

**Audit date**: 2026-08-22 · **Commit**: `cfb8f94b` · **Category**: correctness · **Impact**: HIGH · **Effort**: S · **Risk**: LOW

## Problem

The Hermes gateway config at `/opt/data/config.yaml` (inside the `hermes-gateway` container) still references `minimax-m3:cloud` as a memory reference model in two places:

1. Under `memory.presets.default.reference_models` — used when memory is enabled (it is: `memory_enabled: true`)
2. Under `memory.reference_models` — the top-level memory reference models

`minimax-m3:cloud` is an Ollama cloud model that hit a **weekly usage limit (HTTP 429)** on 2026-08-22, causing `Streaming failed before delivery` errors and a fallback to `nemotron-3.5-lightning:30b-a3b`. The primary chat model was switched to the local `qwen3.6:35b-a3b-mtp-q4_K_M`, but the memory subsystem still calls the rate-limited cloud model.

**Evidence**: `docker logs hermes-gateway --since 30m --timestamps` shows:
```
ERROR agent.chat_completion_helpers: Streaming failed before delivery: Error code: 429
  model=minimax-m3:cloud
  "you (1250955694) have reached your weekly usage limit"
```

## Fix

Replace `minimax-m3:cloud` with a local model in both memory reference_models sections. Use `qwen3.5:9b-q8_0` (already available locally, already used for compression) — memory reference calls are lightweight summarization tasks that don't need a 35B model.

### Files in scope

- Hermes config: `/opt/data/config.yaml` inside the `hermes-gateway` container (edit via `docker exec` or the mounted config volume)

### Files out of scope

- All application source code
- The stack workspace (`agent-meow-stack/`)

### Steps

1. **Read the current config**:
   ```bash
   docker exec hermes-gateway cat /opt/data/config.yaml
   ```

2. **Replace both `minimax-m3:cloud` references in memory sections with `qwen3.5:9b-q8_0`**:
   - Under `memory.presets.default.reference_models[0].model`: change `minimax-m3:cloud` → `qwen3.5:9b-q8_0`
   - Under `memory.reference_models[0].model`: change `minimax-m3:cloud` → `qwen3.5:9b-q8_0`

3. **Restart Hermes to apply**:
   ```bash
   docker restart hermes-gateway
   ```

4. **Verify no 429 errors**:
   ```bash
   docker logs hermes-gateway --since 5m --timestamps 2>&1 | Select-String "429|RateLimit|minimax"
   # Expected: no output (no matches)
   ```

5. **Verify memory still works** — send a chat message that triggers memory:
   ```bash
   # Any chat completion should work without 429
   curl -X POST http://127.0.0.1:8642/v1/chat/completions \
     -H "Authorization: Bearer <HERMES_API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"model":"qwen3.6:35b-a3b-mtp-q4_K_M","messages":[{"role":"user","content":"hello"}],"stream":false}'
   # Expected: 200 OK, no 429 in logs
   ```

### Done criteria

- `docker exec hermes-gateway cat /opt/data/config.yaml | grep minimax` returns no matches in the memory section
- `docker logs hermes-gateway --since 5m` shows no `429` or `RateLimitError` entries
- A chat completion request succeeds with `200`

### Maintenance note

When adding new models to the Ollama instance, update the memory reference_models to use the best local model available. Avoid cloud models in memory — memory is called on every turn and will exhaust cloud quotas quickly. The `qwen3.5:9b-q8_0` model is sufficient for memory summarization.

### Escape hatch

If `qwen3.5:9b-q8_0` is not loaded in Ollama (check with `curl http://127.0.0.1:11434/api/tags`), use `qwen3.8:27b` instead — it's also local and available. Do NOT use `minimax-m3:cloud` or any `:cloud` suffix model.
