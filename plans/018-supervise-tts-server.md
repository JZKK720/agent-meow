# Plan 018: Supervise tts-server.exe + fix crash-restart routing for whisper-server

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 16bf27b..HEAD -- agent_meow/server/service_supervisor.py`
> If this file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: Plan 017 (whisper-server integration — adds the
  `whisper_server` service handle that this plan fixes the restart routing for)
- **Category**: correctness/reliability
- **Planned at**: commit `16bf27b`, 2026-08-24

## Why this matters

The service supervisor has three bugs that cause silent failures:

1. **Crash-restart routing is wrong for whisper-server**: `_on_child_exit`
   maps `"lemonade"` → `_spawn_lemonade` and everything else → `_spawn_tts`.
   If whisper-server crashes, it calls `_spawn_tts` (wrong service).

2. **tts-server.exe spawn uses hardcoded args**: `_spawn_tts` launches
   `tts-server.exe --port 8891` but the actual binary needs `--model`,
   `--codec`, and `--alias` args. Without these, tts-server.exe starts
   but immediately exits (no model loaded), causing a crash-restart loop.

3. **tts_server is never configured**: The constructor accepts
   `tts_server_exe` as a parameter but never resolves it from env vars.
   The server lifespan calls `ServiceSupervisor()` with no args, so
   `tts_server_exe` is always `None` and tts_server is always
   "unconfigured". The tts-server.exe runs only because it was started
   manually outside the supervisor.

## Current state

File: `agent_meow/server/service_supervisor.py`

### Bug 1: `_on_child_exit` routing (line ~344)

```python
spawn_fn = self._spawn_lemonade if name == "lemonade" else self._spawn_tts
await spawn_fn()
```

This maps `whisper_server` → `_spawn_tts` (wrong). Need a dispatch dict.

### Bug 2: `_spawn_tts` hardcoded args (line ~253)

```python
tts_handle.process = subprocess.Popen(
    [self._tts_server_exe, "--port", "8891"],
    ...
)
```

Missing `--model`, `--codec`, `--alias`. The actual command is:
```
tts-server.exe --model <path> --codec <path> --alias qwen3-tts-customvoice --port 8891
```

### Bug 3: Constructor doesn't resolve tts_server_exe from env (line ~130)

```python
def __init__(self, *, lemonade_exe=_UNSET, tts_server_exe=None, ...):
    ...
    self._tts_server_exe = tts_server_exe
```

No env var resolution. The caller (`app.py` line ~1475) calls
`ServiceSupervisor()` with no args.

## Scope

**In scope** (files to modify):

- `agent_meow/server/service_supervisor.py` — fix all three bugs

**Out of scope** (do NOT touch):

- `agent_meow/server/voice_proxy.py` — no routing changes
- `agent_meow/server/app.py` — no lifespan changes (the supervisor
  constructor reads env vars itself, same as it does for lemonade)
- `web/` — no frontend changes

## Git workflow

- Branch: `fix/supervise-tts-server`
- Commit per step; message style: `fix(voice): <description>`
- Do NOT push unless instructed.

## Steps

### Step 1: Fix `_on_child_exit` crash-restart routing

Replace the ternary with a dispatch dict that maps each service name to
its spawn function:

```python
# In _on_child_exit, replace:
spawn_fn = self._spawn_lemonade if name == "lemonade" else self._spawn_tts
await spawn_fn()

# With:
_spawn_map = {
    "lemonade": self._spawn_lemonade,
    "whisper_server": self._spawn_whisper_server,
    "tts_server": self._spawn_tts,
    "tts_wrapper": self._spawn_tts,  # wrapper + server spawn together
}
spawn_fn = _spawn_map.get(name)
if spawn_fn:
    await spawn_fn()
else:
    _logger.warning("Unknown service %s crashed — no restart fn", name)
```

**Verify**: `uv run ruff check agent_meow/server/service_supervisor.py` passes.

### Step 2: Fix `_spawn_tts` to use env vars for model/codec/alias

Replace the hardcoded args with env-var-driven args:

```python
# In _spawn_tts, replace:
tts_handle.process = subprocess.Popen(
    [self._tts_server_exe, "--port", "8891"],
    ...
)

# With:
tts_model = os.environ.get("QWEN_TTS_MODEL", "")
tts_codec = os.environ.get("QWEN_TTS_CODEC", "")
tts_alias = os.environ.get("QWEN_TTS_ALIAS", "qwen3-tts-customvoice")
tts_port = str(tts_handle.port)  # use handle port, not hardcoded 8891

args = [self._tts_server_exe, "--port", tts_port]
if tts_model:
    args.extend(["--model", tts_model])
if tts_codec:
    args.extend(["--codec", tts_codec])
if tts_alias:
    args.extend(["--alias", tts_alias])

tts_handle.process = subprocess.Popen(args, ...)
```

Also fix the wrapper spawn to use `tts_handle.port` for consistency:

```python
# In the wrapper spawn section, replace "--port", "8890" with:
"--port", str(wrapper_handle.port),
```

**Verify**: `uv run ruff check agent_meow/server/service_supervisor.py` passes.

### Step 3: Resolve tts_server_exe from env vars in constructor

Add env var resolution for the TTS server executable and model, following
the same pattern as `_resolve_lemonade_exe`:

```python
# Add near the top of the file, after _LEMONADE_INSTALL_CANDIDATES:

# Standard qwentts.cpp build output location.
_TTS_SERVER_CANDIDATES: tuple[str, ...] = (
    os.path.join(os.path.expanduser("~"), "github-pr", "qwentts.cpp",
                 "build", "Release", "tts-server.exe"),
)


def _resolve_tts_server_exe() -> str | None:
    """Resolve the tts-server.exe path."""
    env = os.environ.get("QWEN_TTS_SERVER_EXE", "").strip()
    if env and os.path.exists(env):
        return env
    for candidate in _TTS_SERVER_CANDIDATES:
        if os.path.exists(candidate):
            return candidate
    return None


# In __init__, replace:
self._tts_server_exe = tts_server_exe

# With:
if tts_server_exe is None:
    self._tts_server_exe = _resolve_tts_server_exe()
else:
    self._tts_server_exe = tts_server_exe
```

**Verify**: `uv run ruff check agent_meow/server/service_supervisor.py` passes.

### Step 4: Verify the full supervisor works

Start the server with all env vars set and verify tts-server.exe is
supervised:

```powershell
$env:VULKAN_SDK = "C:\VulkanSDK\1.4.357.0"
$env:Path = "$env:VULKAN_SDK\Bin;$env:Path"
$env:WHISPER_STT_URL = "http://127.0.0.1:8001"
$env:WHISPER_SERVER_EXE = "C:\Users\cubecloud-io\whisper.cpp\build\bin\Release\whisper-server.exe"
$env:WHISPER_SERVER_MODEL = "C:\Users\cubecloud-io\whisper.cpp\ggml-medium.bin"
$env:WHISPER_VAD_MODEL = "C:\Users\cubecloud-io\.cache\lemonade\models\ggml-silero-v6.2.0.bin"
$env:HERMES_VOICE_URL = "http://127.0.0.1:8642"
$env:QWEN_TTS_URL = "http://127.0.0.1:8890"
$env:QWEN_TTS_SERVER_EXE = "C:\Users\cubecloud-io\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$env:QWEN_TTS_MODEL = "C:\Users\cubecloud-io\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$env:QWEN_TTS_CODEC = "C:\Users\cubecloud-io\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
$env:QWEN_TTS_ALIAS = "qwen3-tts-customvoice"
$env:HERMES_API_KEY = "<from docker inspect>"
$env:HERMES_BASE_URL = "http://127.0.0.1:8642/v1"
.venv\Scripts\omnigent.exe server stop
.venv\Scripts\omnigent.exe server start
```

**Verify**:
1. Server log shows `tts-server.exe started (pid=..., port=8891)`
2. Server log shows `qwentts wrapper started (pid=..., port=8890)`
3. `Invoke-WebRequest -Uri "http://127.0.0.1:8891/health" -UseBasicParsing` returns 200
4. TTS test: `httpx.post('http://127.0.0.1:6767/v1/audio/speech', json={'text': '你好', 'speaker': 'Serena', 'language': 'Auto'})` returns 200 with audio

### Step 5: Test crash-restart

Kill the tts-server.exe process and verify the supervisor restarts it:

```powershell
# Find and kill tts-server.exe
Get-Process -Name "tts-server" | Stop-Process -Force

# Wait 10-15s (backoff delay)
Start-Sleep -Seconds 15

# Verify it restarted
Get-Process -Name "tts-server" | Select-Object Id, StartTime
Invoke-WebRequest -Uri "http://127.0.0.1:8891/health" -UseBasicParsing
```

**Verify**: tts-server.exe is running again with a new PID, health returns 200.

## STOP conditions

- If `tts-server.exe` crashes repeatedly (>3 times) — the model path may
  be wrong. STOP and verify `QWEN_TTS_MODEL` and `QWEN_TTS_CODEC` env
  vars point to existing files.
- If the supervisor log shows `tts-server.exe started` but port 8891 is
  not listening — the tts-server.exe may be failing to bind. Check for
  a stale process on port 8891.
- If `uv run ruff check` fails — fix the lint error before proceeding.

## Test plan

1. **Unit test**: Add a test that verifies `_resolve_tts_server_exe()`
   returns the env var path when set, the candidate path when env is
   unset but the file exists, and None when neither.
2. **Integration test**: Start the supervisor with all env vars, verify
   tts-server.exe is running and supervised. Kill it, verify restart.
3. **Crash-restart routing test**: Verify that killing whisper-server
   triggers `_spawn_whisper_server` (not `_spawn_tts`).

## Maintenance note

- The `QWEN_TTS_SERVER_EXE`, `QWEN_TTS_MODEL`, `QWEN_TTS_CODEC`, and
  `QWEN_TTS_ALIAS` env vars are new — document them in the voice pipeline
  architecture doc.
- The `_TTS_SERVER_CANDIDATES` path (`~/github-pr/qwentts.cpp/build/Release/`)
  is machine-specific. On other machines, the env var
  `QWEN_TTS_SERVER_EXE` must be set.
- The tts_wrapper spawn uses `self._tts_wrapper_python` (defaults to
  `sys.executable`) — this is correct for the uv venv.
- Future: consider adding a health-check loop (poll each service's
  `/health` endpoint every 60s) as a second-line crash detector, since
  a process can be alive but hung.