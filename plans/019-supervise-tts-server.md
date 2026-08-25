# Plan 019: Supervise tts-server.exe in ServiceSupervisor

**Commit:** c642e4ba7 (HEAD of main, 2026-08-24)
**Author:** Advisor audit
**Status:** Ready for execution
**Depends on:** None (standalone)

## Problem

The `ServiceSupervisor` already has a `tts_server` handle and `_spawn_tts()` method, but:

1. **`ServiceSupervisor()` is instantiated with no arguments** (`app.py:1475`), so `tts_server_exe=None` → the `_is_configured()` check returns `False` → tts-server is never spawned or supervised.
2. **`_spawn_tts()` starts tts-server.exe with only `--port 8891`** — missing `--model`, `--codec`, `--lang`, and `--codec-chunk-dur` arguments. Without these, tts-server.exe prints usage and exits.
3. **The `--codec-chunk-dur` parameter is missing** — without it, the default is 24.0s, causing the TTS to generate up to 24s of hallucinated audio for short Chinese text (verified: 18.8s for 6 chars).
4. **The qwentts wrapper is coupled to tts-server spawn** — if tts-server fails, the wrapper isn't started, and if the wrapper crashes, it's not independently restarted.

## Root Causes (verified)

### `app.py:1475` — no args to ServiceSupervisor
```python
_service_supervisor = ServiceSupervisor()
```
The constructor accepts `tts_server_exe`, `lemonade_python`, `tts_wrapper_python` but none are passed. The tts-server.exe path and model/codec paths need to come from env vars.

### `service_supervisor.py:147` — incomplete tts-server args
```python
tts_handle.process = subprocess.Popen(
    [self._tts_server_exe, "--port", "8891"],
    ...
)
```
Missing: `--model`, `--codec`, `--lang`, `--codec-chunk-dur`.

### `tts-server.exe --help` confirms required args
```
Required:
  --model <gguf>          Talker LM GGUF (qwen-talker-*.gguf)
  --codec <gguf>          Codec GGUF (qwen-tokenizer-*.gguf)
Optional:
  --lang <name>           Language label (default: auto)
  --codec-chunk-dur <f>   Codec decode chunk duration in seconds (default: 24.0)
```

## Plan

### Step 1: Add env-var-based config for tts-server paths

**File:** `agent_meow/server/service_supervisor.py`

Add env var reads in `__init__` for model/codec paths and chunk duration:

```python
class ServiceSupervisor:
    def __init__(
        self,
        *,
        lemonade_python: str | None = None,
        tts_server_exe: str | None = None,
        tts_server_model: str | None = None,
        tts_server_codec: str | None = None,
        tts_wrapper_python: str | None = None,
    ) -> None:
        self._lemonade_python = lemonade_python or sys.executable
        self._tts_server_exe = tts_server_exe or os.environ.get("QWENTTS_SERVER_EXE", "").strip() or None
        self._tts_server_model = tts_server_model or os.environ.get("QWENTTS_MODEL", "").strip() or None
        self._tts_server_codec = tts_server_codec or os.environ.get("QWENTTS_CODEC", "").strip() or None
        self._tts_server_lang = os.environ.get("QWENTTS_LANG", "auto").strip() or "auto"
        self._tts_chunk_dur = float(os.environ.get("QWENTTS_CODEC_CHUNK_DUR", "10.0"))
        self._tts_wrapper_python = tts_wrapper_python or sys.executable
        ...
```

**Env vars introduced:**
| Var | Default | Purpose |
|---|---|---|
| `QWENTTS_SERVER_EXE` | (none) | Path to `tts-server.exe` |
| `QWENTTS_MODEL` | (none) | Path to `qwen-talker-1.7b-customvoice-Q8_0.gguf` |
| `QWENTTS_CODEC` | (none) | Path to `qwen-tokenizer-12hz-Q8_0.gguf` |
| `QWENTTS_LANG` | `auto` | Language label for tts-server |
| `QWENTTS_CODEC_CHUNK_DUR` | `10.0` | Max audio duration per request (seconds) |

### Step 2: Fix `_is_configured()` for tts_server

**File:** `agent_meow/server/service_supervisor.py`

Update the configuration check to verify all three paths exist:

```python
def _is_configured(self) -> dict[str, bool]:
    return {
        "lemonade": bool(os.environ.get("LEMONADE_STT_URL", "").strip()),
        "tts_server": (
            self._tts_server_exe is not None
            and os.path.exists(self._tts_server_exe)
            and self._tts_server_model is not None
            and os.path.exists(self._tts_server_model)
            and self._tts_server_codec is not None
            and os.path.exists(self._tts_server_codec)
        ),
        "tts_wrapper": bool(os.environ.get("QWEN_TTS_URL", "").strip()),
    }
```

### Step 3: Fix `_spawn_tts()` to pass all required args

**File:** `agent_meow/server/service_supervisor.py`

Replace the tts-server.exe spawn with the full argument list:

```python
async def _spawn_tts(self) -> None:
    """Start tts-server.exe and the qwentts wrapper."""
    if not self._tts_server_exe or not self._tts_server_model or not self._tts_server_codec:
        return
    tts_handle = self._services["tts_server"]
    wrapper_handle = self._services["tts_wrapper"]

    # Start tts-server.exe (native C++ Vulkan binary)
    tts_handle.state = "starting"
    try:
        tts_handle.process = subprocess.Popen(
            [
                self._tts_server_exe,
                "--model", self._tts_server_model,
                "--codec", self._tts_server_codec,
                "--port", "8891",
                "--lang", self._tts_server_lang,
                "--codec-chunk-dur", str(self._tts_chunk_dur),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            creationflags=_NO_WINDOW,
        )
        tts_handle.start_time = time.monotonic()
        tts_handle.state = "running"
        _logger.info(
            "tts-server.exe started (pid=%s, port=8891, chunk_dur=%.1fs)",
            tts_handle.process.pid, self._tts_chunk_dur,
        )
    except Exception as exc:
        tts_handle.state = "degraded"
        tts_handle.last_error = str(exc)
        _logger.error("Failed to start tts-server: %s", exc)
        return

    # Start the qwentts wrapper (Python FastAPI) — same as before
    ...
```

### Step 4: Decouple wrapper spawn from tts-server

**File:** `agent_meow/server/service_supervisor.py`

Currently `_spawn_tts()` starts both tts-server and the wrapper. If tts-server fails, the wrapper is never started. Split into two independent spawn methods:

```python
async def _spawn_tts_server(self) -> None:
    """Start tts-server.exe only."""
    ...

async def _spawn_tts_wrapper(self) -> None:
    """Start qwentts_wrapper.py only."""
    ...
```

Update `_spawn_tts()` to call both, and update `_on_child_exit()` to restart the correct one:

```python
async def _on_child_exit(self, name: str, exit_code: int) -> None:
    ...
    spawn_fns = {
        "lemonade": self._spawn_lemonade,
        "tts_server": self._spawn_tts_server,
        "tts_wrapper": self._spawn_tts_wrapper,
    }
    spawn_fn = spawn_fns.get(name)
    if spawn_fn:
        await spawn_fn()
```

### Step 5: Add child exit monitoring

**File:** `agent_meow/server/service_supervisor.py`

The current code has `_on_child_exit()` but never registers it as a callback. Add exit monitoring in `_spawn_*` methods:

```python
def _monitor_exit(self, name: str, process: subprocess.Popen[bytes]) -> None:
    """Register an async callback for when the child process exits."""
    async def _watch():
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, process.wait)
        exit_code = process.returncode or 0
        await self._on_child_exit(name, exit_code)
    asyncio.ensure_future(_watch())
```

Call `self._monitor_exit("tts_server", tts_handle.process)` after each successful spawn.

### Step 6: No changes needed to `app.py`

The `ServiceSupervisor()` call at `app.py:1475` needs **no changes** — the constructor now reads from env vars automatically. The env vars (`QWENTTS_SERVER_EXE`, `QWENTTS_MODEL`, `QWENTTS_CODEC`) must be set in the runtime environment.

### Step 7: Update startup scripts to set env vars

**Files:**
- `scripts/start-agent-meow-native.ps1`
- `scripts/start-native-stack.ps1`
- `scripts/start-all.ps1`

Add before launching agent-meow server:
```powershell
$env:QWENTTS_SERVER_EXE = "C:\Users\1\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWENTTS_MODEL = "C:\Users\1\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWENTTS_CODEC = "C:\Users\1\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:QWENTTS_LANG = "auto"
$env:QWENTTS_CODEC_CHUNK_DUR = "10.0"
```

## Files in scope

- `agent_meow/server/service_supervisor.py` — main changes
- `scripts/start-agent-meow-native.ps1` — add env vars
- `scripts/start-native-stack.ps1` — add env vars
- `scripts/start-all.ps1` — add env vars

## Files NOT in scope

- `agent_meow/server/app.py` — no changes needed (constructor reads env vars)
- `agent_meow/server/voice_proxy.py` — not touched (routing is separate)
- `scripts/qwentts_wrapper.py` — not touched (wrapper code is separate)
- `docs/voice-architecture.md` — update separately

## Verification

1. **Unit test:** Set env vars, create `ServiceSupervisor()`, verify `_is_configured()["tts_server"]` returns `True`
2. **Integration test:** Set env vars, call `start()`, verify:
   - `status()` shows `tts_server` as `running` with a PID
   - `status()` shows `tts_wrapper` as `running` with a PID
   - `curl http://127.0.0.1:8890/health` returns `{"status":"ok"}`
   - `curl http://127.0.0.1:8891/v1/models` returns the model
3. **Crash recovery test:** Kill tts-server.exe, verify:
   - `status()` shows `restarting` within 5s
   - Service comes back to `running` after backoff
4. **Audio length test:** Generate TTS for "你好" (2 chars), verify audio is < 10s (not 18.8s)
5. **Run existing tests:** `uv run pytest tests/server/test_service_supervisor.py -v`

## Test plan

Write a new test `tests/server/test_service_supervisor_tts.py`:
- Test that `_is_configured()` returns `True` when all three env vars are set and paths exist
- Test that `_is_configured()` returns `False` when any path is missing
- Test that `_spawn_tts_server()` passes `--model`, `--codec`, `--codec-chunk-dur` args
- Mock `subprocess.Popen` to verify the argument list

Follow the pattern of the existing `tests/server/test_service_supervisor.py`.

## Maintenance notes

- The `QWENTTS_CODEC_CHUNK_DUR` default of `10.0` is a compromise: short enough to prevent hallucinated audio, long enough for typical utterances. For very long TTS output (e.g., reading a paragraph), the wrapper already chunks text in `hermesVoice.ts` (splitForTts, ≤60 chars per chunk), so each chunk should be well under 10s.
- The `QWENTTS_LANG` default of `auto` lets the model auto-detect language. For Chinese-first locale, set to `zh`.
- When the desktop `.exe` packaging is built, the installer will set these env vars in `%LOCALAPPDATA%\agent-meow\runtime.env`.
- Future: if the EOS issue in Q8_0 is fixed upstream, `QWENTTS_CODEC_CHUNK_DUR` can be increased back to 24.0.