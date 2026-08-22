# Plan 016: Audit and remove all stale cloud model references from Hermes config

**Audit date**: 2026-08-22 · **Commit**: `cfb8f94b` · **Category**: tech debt · **Impact**: MED · **Effort**: S · **Risk**: LOW

## Problem

After switching the primary chat model to the local `qwen3.6:35b-a3b-mtp-q4_K_M`, the Hermes config still contains references to cloud models that will fail with 429 rate limit errors. Plan 014 covers the memory section; this plan covers a full audit of all remaining cloud model references.

**Evidence**: `docker exec hermes-gateway cat /opt/data/config.yaml` shows `minimax-m3:cloud` in:
- `memory.presets.default.reference_models[0].model`
- `memory.reference_models[0].model`

And `deepseek-v4-flash:0731-cloud` is available in Ollama but is also a cloud model that may hit limits.

## Fix

Audit all model references in the Hermes config and replace any `:cloud` suffix models with local equivalents.

### Files in scope

- Hermes config: `/opt/data/config.yaml` inside `hermes-gateway` container

### Steps

1. **Dump the full config and grep for cloud models**:
   ```bash
   docker exec hermes-gateway cat /opt/data/config.yaml | grep -n ":cloud\|minimax"
   ```

2. **For each match, replace with a local model**:
   - `minimax-m3:cloud` → `qwen3.5:9b-q8_0` (for memory/auxiliary tasks)
   - `deepseek-v4-flash:0731-cloud` → keep if it's only used as a pull model (not called at runtime); remove if it's referenced as a runtime model

3. **Verify no cloud models remain in runtime paths**:
   ```bash
   docker exec hermes-gateway cat /opt/data/config.yaml | grep ":cloud"
   # Expected: no matches (or only in comments)
   ```

4. **Restart Hermes and verify**:
   ```bash
   docker restart hermes-gateway
   docker logs hermes-gateway --since 5m --timestamps 2>&1 | grep "429\|RateLimit"
   # Expected: no matches
   ```

### Done criteria

- `docker exec hermes-gateway cat /opt/data/config.yaml | grep ":cloud"` returns no matches in active config (comments OK)
- `docker logs hermes-gateway --since 5m` shows no `429` errors after a test chat

### Maintenance note

When the Ollama cloud plan is upgraded or the weekly limit resets, cloud models can be re-added as fallbacks — but never as primary or memory reference models. Cloud models should only be fallback providers, not the default.

### Escape hatch

If a cloud model is intentionally used (e.g., `deepseek-v4-flash:0731-cloud` for a specific task), leave it but add a comment explaining why. The goal is to remove *accidental* cloud references that cause 429s, not to ban all cloud models.
