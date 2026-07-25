# Voicebox Engine Reliability Plan

> **Written against commit**: (current working tree)
> **Status**: DRAFT
> **Effort**: Medium (2-4 hours)
> **Prerequisites**: Docker, Voicebox repo at `C:\Users\1\github-pr\Voicebox`

## Problem

Voicebox declares 7 TTS engines but only 2-3 actually load reliably. The CPU Dockerfile uses `|| true` which silently tolerates install failures. There's no engine availability check at startup, no tiered fallback, and no health endpoint exposing which engines are ready.

**Evidence**:
- `Dockerfile.cpu` lines 35-39: `chatterbox-tts`, `hume-tada`, `Qwen3-TTS` all have `|| true`
- `backend/backends/__init__.py` line 211: `TTS_ENGINES` is a static hardcoded dict with no availability check
- `backend/routes/generations.py` line 59: `_resolve_generation_engine()` has no fallback chain
- `/health` endpoint returns `model_loaded: false` for all engines with no per-engine breakdown
- Voicebox container logs `sqlite3.OperationalError: readonly database` on first volume mount

## Scope

### In scope
- Remove `|| true` from CPU Dockerfile — make all engines hard install failures
- Add startup engine availability check that reports which engines loaded
- Add `/health/engines` endpoint showing per-engine status
- Add tiered fallback: try requested engine → try Kokoro → error
- Fix Docker volume permissions (readonly DB)
- Update agent-meow's `_execute_voice_tool` to accept `engine` param and pass it to Voicebox

### Out of scope
- Adding new engines beyond the 7 already declared
- GPU/ROCm support
- Engine performance tuning
- Voice cloning
- Edge-TTS (Microsoft cloud TTS — not in our build)

## Current State (for reference)

```
Voicebox Engine Registry (backend/backends/__init__.py, line 211):
  qwen             → Qwen TTS (1.7B, default)
  qwen_custom_voice → Qwen CustomVoice (preset voices)
  luxtts            → LuxTTS / Zipvoice (voice cloning)
  chatterbox        → Chatterbox TTS (multilingual)
  chatterbox_turbo  → Chatterbox Turbo (English-only)
  tada              → TADA (Hume AI, 1B/3B)
  kokoro            → Kokoro (82M, CPU-friendly)

Engine selection (routes/generations.py:59):
  data.engine → profile.default_engine → profile.preset_engine → "qwen"

Engine types (services/profiles.py):
  CLONING_ENGINES = {"qwen", "luxtts", "chatterbox", "chatterbox_turbo", "tada"}
  PRESET_ONLY       = {"kokoro", "qwen_custom_voice"}
```

## Steps

### Step 1: Fix CPU Dockerfile — Hard Install All Engines

**File**: `C:\Users\1\github-pr\Voicebox\Dockerfile.cpu`

Replace lines 35-39:
```dockerfile
RUN pip install --no-cache-dir --prefix=/install --no-deps chatterbox-tts || true
RUN pip install --no-cache-dir --prefix=/install --no-deps hume-tada || true
RUN pip install --no-cache-dir --prefix=/install \
    git+https://github.com/QwenLM/Qwen3-TTS.git || true
```

With:
```dockerfile
RUN pip install --no-cache-dir --prefix=/install --no-deps chatterbox-tts
RUN pip install --no-cache-dir --prefix=/install --no-deps hume-tada
RUN pip install --no-cache-dir --prefix=/install \
    git+https://github.com/QwenLM/Qwen3-TTS.git
```

**Verification**: `docker compose -f compose.cpu.yaml build` completes without errors.

### Step 2: Fix Volume Permissions

**File**: `C:\Users\1\github-pr\Voicebox\Dockerfile.cpu`

Add after the `mkdir -p /app/data/...` line:
```dockerfile
# Ensure data dir is writable (fixes sqlite readonly error on Windows Docker volumes)
RUN chmod -R 777 /app/data
```

**Verification**: After rebuild, `curl -X POST http://127.0.0.1:17493/speak -H "Content-Type: application/json" -d '{"text":"test","profile":"test-nova"}'` returns HTTP 200, not 500.

### Step 3: Add Engine Health Endpoint

**File**: `C:\Users\1\github-pr\Voicebox\backend\routes\health.py`

Add a new route:
```python
@router.get("/health/engines")
def engine_health(db: Session = Depends(get_db)):
    """Return per-engine health status: which engines are installed, loaded, and ready."""
    from backend.backends import TTS_ENGINES, _tts_backends

    engines = {}
    for key, name in TTS_ENGINES.items():
        backend = _tts_backends.get(key)
        engines[key] = {
            "name": name,
            "installed": backend is not None,
            "model_loaded": backend.is_model_loaded if backend else False,
            "has_presets": key in ("kokoro", "qwen_custom_voice"),
        }
    return {"engines": engines}
```

**Verification**: `curl http://127.0.0.1:17493/health/engines` returns per-engine JSON.

### Step 4: Startup Engine Probe — Load One Engine at Boot

**File**: `C:\Users\1\github-pr\Voicebox\backend\main.py`

Add after `database.init_db()`:
```python
# Probe engine availability at startup — try loading Kokoro (CPU-friendly)
# so the /health/engines endpoint shows actual status, not just declarations.
import logging
_log = logging.getLogger(__name__)

def _probe_engines():
    from backend.backends import get_tts_backend_for_engine, TTS_ENGINES
    for key in TTS_ENGINES:
        try:
            backend = get_tts_backend_for_engine(key)
            _log.info(f"Engine {key}: backend created ({backend.__class__.__name__})")
        except Exception as exc:
            _log.warning(f"Engine {key}: unavailable ({exc})")

# Run after startup (don't block — engines load lazily anyway)
import asyncio
asyncio.get_event_loop().call_later(1, _probe_engines)
```

**Verification**: `docker logs voicebox` shows per-engine probe results at startup.

### Step 5: Add Tiered Engine Fallback

**File**: `C:\Users\1\github-pr\Voicebox\backend\routes\generations.py`

Replace `_resolve_generation_engine()` implementation with tiered fallback:
```python
# Engine fallback ladder (try in order until one works)
_ENGINE_FALLBACK_ORDER = ["kokoro", "qwen", "luxtts", "chatterbox_turbo", "chatterbox"]

def _resolve_generation_engine(data, profile) -> str:
    """Resolve engine with tiered fallback. Tries requested engine first,
    then falls back through _ENGINE_FALLBACK_ORDER until one is available."""
    requested = data.engine or getattr(profile, "default_engine", None) or getattr(profile, "preset_engine", None) or "qwen"

    from backend.backends import TTS_ENGINES, _tts_backends

    if requested in _tts_backends and _tts_backends[requested].is_model_loaded:
        return requested

    # Fallback: try each engine in order
    for engine in _ENGINE_FALLBACK_ORDER:
        if engine in _tts_backends and _tts_backends[engine].is_model_loaded:
            _log.warning(f"Engine {requested} not loaded; falling back to {engine}")
            return engine

    # Last resort: return the requested engine anyway (let it fail with a clear error)
    return requested
```

**Verification**: When Qwen model isn't downloaded yet, a `/speak` request without explicit `engine` param should fall back to Kokoro and succeed.

### Step 6: Update agent-meow Voice Dispatch to Accept Engine Param

**File**: `C:\Users\1\github-pr\agent-meow\agent_meow\runner\tool_dispatch.py`

The `_execute_voice_tool` already handles `engine` param in the Voicebox branch. Verify lines ~3700:
```python
if engine := args.get("engine"):
    payload["engine"] = engine
```

If missing, add it. Also update the tool schema:

**File**: `C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\tts.py`

Add `engine` parameter to the `text_to_speech` and `speak` tool schemas:
```python
"engine": {
    "type": "string",
    "enum": ["kokoro", "qwen", "luxtts", "chatterbox", "chatterbox_turbo", "tada"],
    "description": "TTS engine to use (default: qwen). "
                   "kokoro is fastest on CPU (82M params).",
}
```

**Verification**: 
```bash
uv run pytest tests/runner/test_surface_dispatch.py -v --timeout=60
```

### Step 7: Rebuild and Smoke Test

```bash
# 1. Rebuild Voicebox
docker compose -f C:\Users\1\github-pr\Voicebox\compose.cpu.yaml down
docker volume rm voicebox_voicebox-data-cpu
docker compose -f C:\Users\1\github-pr\Voicebox\compose.cpu.yaml up --build -d

# 2. Wait for startup
sleep 15

# 3. Check engine health
curl http://127.0.0.1:17493/health/engines

# 4. Create a Kokoro profile (should work immediately — no model download needed for 82M params)
curl -X POST http://127.0.0.1:17493/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"kokoro-nova","engine":"kokoro","voice_id":"af_nova","language":"en"}'

# 5. Test TTS with explicit engine
curl -X POST http://127.0.0.1:17493/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from Kokoro engine.","profile":"kokoro-nova","engine":"kokoro"}'

# 6. Poll until completed
curl http://127.0.0.1:17493/generate/<id>/status
```

## Test Plan

### Unit Tests (Voicebox — none exist currently, write new)
- `tests/test_engine_fallback.py`: Test that `_resolve_generation_engine` falls back correctly
- `tests/test_engine_health.py`: Test `/health/engines` endpoint

### Integration Test (agent-meow)
- Existing `tests/runner/test_surface_dispatch.py` — all 47 tests must pass
- New test: `test_text_to_speech_with_engine_param` — verify engine param is forwarded

### E2E Smoke Test
1. Start agent-meow server with `VOICEBOX_URL=http://127.0.0.1:17493`
2. Create an agent with `builtins: [text_to_speech]`
3. Agent calls `text_to_speech(text="Hello", engine="kokoro")` → returns audio URL
4. Agent calls `text_to_speech(text="Hello")` without engine → falls back to Kokoro → works

## Maintenance Note

Future changes that interact with this:
- Voicebox engine additions: update `_ENGINE_FALLBACK_ORDER` for new engines
- Voicebox model size changes: update engine descriptions in agent-meow tool schemas
- agent-meow voice dispatch: always pass `engine` param through to Voicebox
- Docker volume permissions: Windows Docker Desktop has known issues with bind mount permissions — `chmod 777` is a workaround, not ideal for production

## Escape Hatches

- If `chatterbox-tts` install fails WITHOUT `|| true`, check its PyPI availability and sub-dependency conflicts. If blocked, revert to `|| true` for just that engine and file an upstream issue.
- If Kokoro still fails after rebuild, check HuggingFace connectivity from inside the container: `docker exec voicebox curl -I https://huggingface.co/hexgrad/Kokoro-82M`
- If engine fallback causes unexpected behavior (wrong voice), revert `_ENGINE_FALLBACK_ORDER` to just `["kokoro"]` — one reliable fallback is better than a broken ladder.
