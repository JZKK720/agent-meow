# Plan 003: Phase 4 — Register surface + voice tools in runner dispatch

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise.
>
> **Drift check (run first)**: `git diff --stat 1a2047ec..HEAD -- agent_meow/runner/tool_dispatch.py agent_meow/tools/builtins/__init__.py`
> If either file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/002-sync-videos-surface-doc.md (for accurate spec)
- **Category**: direction
- **Planned at**: commit `1a2047ec`, 2026-07-24

## Why this matters

This is the **last functional gap** in the workspace surfaces parity recovery. The schema-only tool classes for Docs, Images, Videos, and Voice exist in `agent_meow/tools/builtins/{docs,images,videos,transcribe,tts}.py`, but they are not registered in `_BUILTIN_REGISTRY` and have no runner dispatch. Without this, agents cannot call `doc_create`, `image_generate`, `video_generate`, `transcribe_audio`, `text_to_speech`, etc. — the tools are invisible to the agent. The UI and backend routers are wired (Phases 1-3 ✅); this plan completes the loop by making the tools callable.

## Current state

### Schema classes that exist (no dispatch)

| File | Classes | Tool names |
|---|---|---|
| `agent_meow/tools/builtins/docs.py` | `DocCreateTool`, `DocGetTool`, `DocListTool`, `DocUpdateTool`, `DocCreateOfficeTool`, `DocEditOfficeTool`, `DocExportTool`, `DocConvertTool` | `doc_create`, `doc_get`, `doc_list`, `doc_update`, `doc_create_office`, `doc_edit_office`, `doc_export`, `doc_convert` |
| `agent_meow/tools/builtins/images.py` | `ImageListTool`, `ImageGetTool`, `ImageUploadTool`, `ImageEditTool`, `ImageGenerateTool`, `ImageRemoveBgTool`, `ImageEditAiTool` | `image_list`, `image_get`, `image_upload`, `image_edit`, `image_generate`, `image_remove_bg`, `image_edit_ai` |
| `agent_meow/tools/builtins/videos.py` | `VideoGenerateTool`, `VideoListTool`, `VideoGetTool` | `video_generate`, `video_list`, `video_get` |
| `agent_meow/tools/builtins/transcribe.py` | `TranscribeAudioTool`, `TranscribeAudioHighQualityTool` | `transcribe_audio`, `transcribe_audio_high_quality` |
| `agent_meow/tools/builtins/tts.py` | `TextToSpeechTool`, `SpeakTool` | `text_to_speech`, `speak` |

### Where they need to be registered

1. **`agent_meow/tools/builtins/__init__.py`** — `_BUILTIN_REGISTRY` dict (line 246). Currently has `web_search`, `upload_file`, `list_files`, `download_file`, `search_conversations`, `export_agent`, `web_fetch`, `list_comments`, `update_comment`, `sys_list_models`, `sys_advise_models`, `browser_*`. Surface tools are absent.

2. **`agent_meow/runner/tool_dispatch.py`** — needs:
   - New frozensets: `_DOC_TOOLS`, `_IMAGE_TOOLS`, `_VIDEO_TOOLS`, `_VOICE_TOOLS`
   - New dispatch functions: `_execute_doc_tool`, `_execute_image_tool`, `_execute_video_tool`, `_execute_voice_tool`
   - Add the frozensets to `_ALL_LOCAL_TOOLS` (line 524) and `_NATIVE_RELAY_BUILTIN_TOOLS` (line 382)
   - Add dispatch branches in the main `dispatch_tool` function (around line 4601-4816)

### Existing dispatch pattern (exemplar)

The `_COMMENT_TOOLS` pattern is the closest exemplar — it's a frozenset of tool names, a `_execute_comment_tool` function that proxies to the server via `server_client`, and registration in `_ALL_LOCAL_TOOLS` + `_NATIVE_RELAY_BUILTIN_TOOLS`:

```python
# tool_dispatch.py:305
_COMMENT_TOOLS = frozenset(
    {
        "list_comments",
        "update_comment",
        # ... more names
    }
)

# tool_dispatch.py:2877
async def _execute_comment_tool(
    tool_name: str,
    arguments: dict[str, Any],
    *,
    server_client: httpx.AsyncClient | None,
    session_id: str,
    user_id: str | None,
) -> str:
    # proxies to server REST via server_client
    ...

# tool_dispatch.py:4768
output = await _execute_comment_tool(
    tool_name, args,
    server_client=server_client,
    session_id=session_id,
    user_id=user_id,
)
```

### External CLI tools (for shell-out dispatch)

| Tool | CLI binary | Env var override | Install |
|---|---|---|---|
| `doc_create_office`/`doc_edit_office`/`doc_export` | `officecli` | `OFFICECLI_BIN` | https://github.com/iOfficeAI/OfficeCLI |
| `doc_convert` | `markitdown` | `MARKITDOWN_BIN` | `pip install markitdown[all]` |
| `image_remove_bg` | `rembg` | `REMBG_BIN` | `pip install rembg[cpu,cli]` |
| `transcribe_audio` | `handy` | `HANDY_CLI_PATH` | https://handy.computer |
| `transcribe_audio_high_quality` | (HTTP) | `VIBEVOICE_ASR_URL` | vLLM gateway |
| `text_to_speech`/`speak` | (HTTP) | `VIBEVOICE_TTS_URL` or `VOICEBOX_URL` | vLLM gateway or Voicebox |
| `image_generate` | (HTTP/MCP) | `IMAGE_GEN_PROVIDER` + provider-specific | A1111/ComfyUI/hosted |
| `video_generate` | (HTTP) | `VIDEO_GEN_PROVIDER` + provider-specific | fal.ai/Pixelle-Video/Happy Horse |

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Type check | `cd web && npm run type-check` | exit 0 (only pre-existing errors) |
| Python lint | `ruff check agent_meow/runner/tool_dispatch.py agent_meow/tools/builtins/__init__.py` | exit 0 |
| Python import | `python -c "from agent_meow.runner.tool_dispatch import _ALL_LOCAL_TOOLS; print('doc_create' in _ALL_LOCAL_TOOLS)"` | True |
| Runner dispatch test | `python -m pytest tests/runner/test_runner_dispatch.py -x -q --timeout=60` | all pass |
| Surface router test | `python -m pytest tests/server/test_surface_routers.py -x -q --timeout=60` | all pass |

## Scope

**In scope**:
- `agent_meow/tools/builtins/__init__.py` — register surface+voice tool names in `_BUILTIN_REGISTRY`
- `agent_meow/runner/tool_dispatch.py` — add frozensets, dispatch functions, and dispatch branches
- `tests/runner/test_runner_dispatch.py` — add tests for the new dispatch paths

**Out of scope**:
- The schema classes themselves (`tools/builtins/{docs,images,videos,transcribe,tts}.py`) — they already exist and are correct
- The backend REST routers — already mounted (Phase 3 ✅)
- The web UI — already wired (Phases 1-2 ✅)
- The external CLI binaries (officecli, markitdown, rembg, handy) — these are user-installed

## Steps

### Step 1: Register tool names in `_BUILTIN_REGISTRY`

In `agent_meow/tools/builtins/__init__.py`, after the `browser_*` entries in `_BUILTIN_REGISTRY` (around line 289), add:

```python
    # Docs/Images/Videos/Voice surface tools — schema-only (runner-dispatched).
    # The runner intercepts these by name and proxies to server REST or shells
    # out to external CLIs. Reserved here so user specs can't shadow them.
    "doc_create": None,
    "doc_get": None,
    "doc_list": None,
    "doc_update": None,
    "doc_create_office": None,
    "doc_edit_office": None,
    "doc_export": None,
    "doc_convert": None,
    "image_list": None,
    "image_get": None,
    "image_upload": None,
    "image_edit": None,
    "image_generate": None,
    "image_remove_bg": None,
    "image_edit_ai": None,
    "video_list": None,
    "video_get": None,
    "video_generate": None,
    "transcribe_audio": None,
    "transcribe_audio_high_quality": None,
    "text_to_speech": None,
    "speak": None,
```

**Verify**: `python -c "from agent_meow.tools.builtins import BUILTIN_NAMES; print('doc_create' in BUILTIN_NAMES, 'video_generate' in BUILTIN_NAMES, 'speak' in BUILTIN_NAMES)"` → `True True True`

### Step 2: Add frozensets to `tool_dispatch.py`

In `agent_meow/runner/tool_dispatch.py`, after `_BROWSER_TOOLS` (around line 343), add:

```python
# Docs surface — runner proxies server REST endpoints for CRUD, shells out
# to officecli/markitdown for Office operations.
_DOC_TOOLS = frozenset(
    {
        "doc_create",
        "doc_get",
        "doc_list",
        "doc_update",
        "doc_create_office",
        "doc_edit_office",
        "doc_export",
        "doc_convert",
    }
)

# Images surface — runner proxies server REST for CRUD, shells out to rembg
# for background removal, calls A1111/ComfyUI/hosted API for generation/AI edit.
_IMAGE_TOOLS = frozenset(
    {
        "image_list",
        "image_get",
        "image_upload",
        "image_edit",
        "image_generate",
        "image_remove_bg",
        "image_edit_ai",
    }
)

# Videos surface — runner proxies server REST for list/get, calls a
# video-generation gateway (fal.ai/Pixelle-Video/Happy Horse) for generate.
_VIDEO_TOOLS = frozenset(
    {
        "video_list",
        "video_get",
        "video_generate",
    }
)

# Voice surface — runner shells out to Handy CLI for STT, calls VibeVoice
# vLLM endpoints for high-quality STT and TTS.
_VOICE_TOOLS = frozenset(
    {
        "transcribe_audio",
        "transcribe_audio_high_quality",
        "text_to_speech",
        "speak",
    }
)
```

Then add them to `_ALL_LOCAL_TOOLS` (line 524) and `_NATIVE_RELAY_BUILTIN_TOOLS` (line 382):

```python
_ALL_LOCAL_TOOLS = (
    _OS_ENV_TOOLS
    | _REST_TOOLS
    # ... existing ...
    | _BROWSER_TOOLS
    | _DOC_TOOLS
    | _IMAGE_TOOLS
    | _VIDEO_TOOLS
    | _VOICE_TOOLS
)
```

**Verify**: `python -c "from agent_meow.runner.tool_dispatch import _ALL_LOCAL_TOOLS; print('doc_create' in _ALL_LOCAL_TOOLS, 'video_generate' in _ALL_LOCAL_TOOLS, 'speak' in _ALL_LOCAL_TOOLS)"` → `True True True`

### Step 3: Implement `_execute_doc_tool` dispatch function

Add a new function in `tool_dispatch.py` (after `_execute_comment_tool`, around line 2950). This function proxies doc CRUD to server REST and shells out for Office operations:

```python
async def _execute_doc_tool(
    tool_name: str,
    arguments: dict[str, Any],
    *,
    server_client: httpx.AsyncClient | None,
    session_id: str,
    user_id: str | None,
) -> str:
    """Execute a Docs surface tool.

    CRUD tools (doc_create/get/list/update) proxy to server REST.
    Office tools (doc_create_office/edit_office/export) shell out to officecli.
    Conversion (doc_convert) shells out to markitdown.
    """
    # Implementation follows the _execute_comment_tool pattern:
    # - For CRUD: build the REST path from session_id + tool_name, call server_client
    # - For Office: resolve officecli via shutil.which or OFFICECLI_BIN, subprocess
    # - For convert: resolve markitdown via shutil.which or MARKITDOWN_BIN, subprocess
    ...
```

**STOP condition**: If the server REST endpoints don't match the tool argument shapes (e.g., `doc_create` expects `session_id` in args but the REST path already has it), stop and report — the argument mapping needs design.

### Step 4: Implement `_execute_image_tool`, `_execute_video_tool`, `_execute_voice_tool`

Follow the same pattern. Each function:
- Proxies CRUD to server REST (like `_execute_comment_tool`)
- Shells out to external CLIs for operations that need them (rembg, handy, officecli, markitdown)
- Calls HTTP gateways for generation (A1111, fal.ai, VibeVoice)

**Verify**: `python -c "from agent_meow.runner.tool_dispatch import _execute_doc_tool, _execute_image_tool, _execute_video_tool, _execute_voice_tool; print('all imported')"` → `all imported`

### Step 5: Add dispatch branches in the main dispatcher

In the main `dispatch_tool` function (around line 4601-4816), add branches for each new tool family, following the existing pattern:

```python
        if tool_name in _DOC_TOOLS:
            output = await _execute_doc_tool(
                tool_name, args,
                server_client=server_client,
                session_id=session_id,
                user_id=user_id,
            )
        elif tool_name in _IMAGE_TOOLS:
            output = await _execute_image_tool(...)
        elif tool_name in _VIDEO_TOOLS:
            output = await _execute_video_tool(...)
        elif tool_name in _VOICE_TOOLS:
            output = await _execute_voice_tool(...)
```

**Verify**: `python -m pytest tests/runner/test_runner_dispatch.py -x -q --timeout=60` → all pass

### Step 6: Write tests

In `tests/runner/test_runner_dispatch.py`, add tests that:
1. Verify each tool name is in `_ALL_LOCAL_TOOLS`
2. Verify each tool name is in `_BUILTIN_REGISTRY` (reserved)
3. For CRUD tools: mock `server_client` and verify the REST call is made
4. For shell-out tools: mock `shutil.which` / `asyncio.create_subprocess_exec` and verify the command

Follow the existing `_COMMENT_TOOLS` test pattern in the same file.

**Verify**: `python -m pytest tests/runner/test_runner_dispatch.py -x -q --timeout=60` → all pass

## STOP conditions

- If the server REST endpoints don't match the tool argument shapes — stop and report; the argument mapping needs design before implementation.
- If `officecli`/`markitdown`/`rembg`/`handy` are not installed in the test environment — that's expected; mock them in tests, don't skip the tests.
- If the `_execute_comment_tool` pattern has changed significantly since this plan was written — re-read it and adapt the new functions to match.
- If any existing test breaks after registration — the new tool names might shadow an existing name; check for collisions.

## Test plan

1. **Unit tests** in `tests/runner/test_runner_dispatch.py`:
   - Each tool name is in `_ALL_LOCAL_TOOLS` and `_BUILTIN_REGISTRY`
   - CRUD tools proxy to the correct REST endpoint
   - Shell-out tools invoke the correct CLI with correct args
   - HTTP gateway tools call the correct URL
2. **Integration test**: create a session, call `doc_create` via the runner, verify the document appears in `GET /v1/sessions/{id}/resources/documents`
3. **Error handling**: each tool returns a clear error when its backend is unavailable (no officecli, no VIBEVOICE_TTS_URL, etc.)

## Maintenance note

- When adding new surface tools (e.g., `doc_generate` LLM routing, `image_generate` ComfyUI path), add them to the appropriate frozenset and dispatch function.
- When the external CLI binaries change their interfaces, update the shell-out commands in the dispatch functions.
- The `spec/AGENTSPEC.md` env var table is the source of truth for provider configuration — keep it in sync with the dispatch functions.
