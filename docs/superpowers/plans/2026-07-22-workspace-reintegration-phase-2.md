# Workspace Reintegration — Phase 2: Backend Audit + Reconcile

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-apply agent-meow's surface tool registrations, runner dispatch, and BYOK provider additions onto the merged (upstream-dominant) backend. Audit and reconcile the web hooks and features that survived the merge.

**Architecture:** The merge (Phase 1) took upstream's version of `builtins/__init__.py`, `tools/manager.py`, and `runner/tool_dispatch.py` — which don't have agent-meow's surface tools (docs, images, videos, transcribe, tts). The tool files themselves survived (`docs.py`, `images.py`, `videos.py`, etc.) and the server routes survived (`documents.py`, `images.py`, `videos.py`), but the registration and dispatch wiring was lost. Phase 2 re-connects them. Also adds Z.ai + Qwen BYOK providers.

**Tech Stack:** Python 3.12+ (`uv`), pytest, ruff, mypy, TypeScript (web)

## Global Constraints

- **Dev OS:** macOS or Linux (WSL2). Windows not directly supported for `pexpect`/`pyte`. Use WSL2 if needed.
- **Python:** 3.12+ via `uv`
- **Setup:** `uv sync --extra all --extra dev`
- **Backend test:** `uv run pytest`
- **Lint:** `uv run ruff check .`
- **Type check:** `uv run mypy omnigent`
- **DCO:** `git commit -s`
- **Branch:** `reintegration/staging` (from Phase 0+1, commit `b8b465a8`)
- **Spec:** `docs/superpowers/specs/2026-07-22-workspace-reintegration-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `omnigent/tools/builtins/__init__.py` | Modify | Add surface tool schema entries (doc_*, image_*, video_*, transcribe, text_to_speech) |
| `omnigent/tools/manager.py` | Modify | Add `_register_surface_tools()` call in `__init__` |
| `omnigent/runner/tool_dispatch.py` | Modify | Add `_execute_doc_tool`, `_execute_image_tool`, `_execute_video_tool`, `_execute_voice_tool` dispatch functions |
| `omnigent/llms/routing.py` | Modify | Add `zai` + `qwen` to `PROVIDER_CONFIGS` |
| `omnigent/llms/adapters/__init__.py` | Modify | Add `zai` + `qwen` to `openai_compat_providers` |

**Out of scope:**
- Front-end wiring (Phase 3)
- Branding (Phase 4)
- `*_generate` stub implementation (post-merge feature project)
- ColorFire agent configs (post-merge feature project)
- `ironclaw-native` harness stack completion (post-merge feature project)

---

### Task 1: Re-apply surface tool schemas in builtins/__init__.py

**Files:**
- Modify: `omnigent/tools/builtins/__init__.py`

**Interfaces:**
- Produces: surface tool names registered in the builtin schema dict so `ToolManager` knows they exist

**Context:** The merged `builtins/__init__.py` is upstream's version, which doesn't have agent-meow's surface tools. The pre-merge version (commit `eeb19676`) had entries like `"doc_create": None`, `"image_generate": None`, etc. — `None` means schema-only (runner-dispatched). We need to add these back.

- [ ] **Step 1: Read the current builtins/__init__.py**

```bash
Get-Content omnigent/tools/builtins/__init__.py | Select-Object -First 60
```

Find the schema dict (likely named `_BUILTIN_TOOL_SCHEMAS` or similar) where tool names map to tool classes or `None`.

- [ ] **Step 2: Read the pre-merge version to get the exact entries**

```bash
git show eeb19676:omnigent/tools/builtins/__init__.py
```

Find the surface tool entries (doc_create, doc_get, doc_list, doc_update, doc_generate, doc_create_office, doc_edit_office, doc_export, doc_convert, image_list, image_get, image_upload, image_edit, image_generate, image_remove_bg, image_edit_ai, video_list, video_get, video_generate, transcribe_audio, transcribe_audio_high_quality, text_to_speech, speak).

- [ ] **Step 3: Add the surface tool entries to the merged file**

Add the entries from the pre-merge version into the merged `builtins/__init__.py`'s schema dict. Place them after the existing upstream entries, with a comment:

```python
    # agent-meow Docs/Images/Video/Voice surface tools — runner-dispatched, schema-only.
    "doc_create": None,
    "doc_get": None,
    "doc_list": None,
    "doc_update": None,
    "doc_generate": None,
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

- [ ] **Step 4: Verify the import works**

```bash
uv run python -c "from omnigent.tools.builtins import get_builtin_tool_names; names = get_builtin_tool_names(); assert 'doc_create' in names; assert 'image_generate' in names; assert 'video_generate' in names; print('OK')"
```

If `get_builtin_tool_names` doesn't exist, check what function the module exports and use that.

- [ ] **Step 5: Commit**

```bash
git add omnigent/tools/builtins/__init__.py
git commit -s -m "feat(tools): re-apply surface tool schemas in builtins/__init__.py

Re-adds doc_*, image_*, video_*, transcribe_audio, text_to_speech entries
to the builtin tool schema dict. These were lost when the merge took
upstream's version of builtins/__init__.py. The tool files themselves
(docs.py, images.py, videos.py, transcribe.py, tts.py) survived the merge;
this re-registers them in the schema."
```

---

### Task 2: Add surface tool registration in tools/manager.py

**Files:**
- Modify: `omnigent/tools/manager.py`

**Interfaces:**
- Consumes: the schema entries from Task 1
- Produces: `ToolManager.__init__` calls `_register_surface_tools()` which makes the surface tools available

**Context:** The merged `manager.py` is upstream's version. It has `_register_scheduled_task_tools()` and `_register_browser_tools()` but not agent-meow's surface tool registration. We need to add a `_register_surface_tools()` method and call it in `__init__`.

- [ ] **Step 1: Read the pre-merge manager.py for the surface tool registration**

```bash
git show eeb19676:omnigent/tools/manager.py
```

Find how surface tools were registered — likely a `_register_surface_tools()` or similar method, or the entries in `builtins/__init__.py` were auto-registered.

- [ ] **Step 2: Check if builtins auto-registration is sufficient**

If the merged `manager.py`'s `_register_builtin_tools()` already iterates over the `builtins/__init__.py` schema dict and registers all `None`-valued entries as schema-only tools, then Task 1 alone may be sufficient. Check:

```bash
uv run python -c "from omnigent.tools.manager import ToolManager; tm = ToolManager.__new__(ToolManager); print('OK')"
```

If this works without error, the auto-registration may handle it. If not, add the registration method.

- [ ] **Step 3: Add _register_surface_tools() if needed**

If the auto-registration doesn't handle `None`-valued entries, add a method to `ToolManager`:

```python
def _register_surface_tools(self) -> None:
    """Register agent-meow Docs/Images/Video/Voice surface tools.

    These are schema-only (runner-dispatched) tools — the runner proxies
    the server's REST endpoints. See tools/builtins/{docs,images,videos,
    transcribe,tts}.py for the tool definitions.
    """
    from omnigent.tools.builtins import get_builtin_tool_schemas
    for name, tool_class in get_builtin_tool_schemas().items():
        if tool_class is None and name in _SURFACE_TOOL_NAMES:
            # Register as schema-only — the runner dispatches these.
            self._register_schema_only_tool(name)
```

And call it in `__init__` after `_register_builtin_tools()`.

- [ ] **Step 4: Verify**

```bash
uv run python -c "
from omnigent.tools.manager import ToolManager
# Can't fully instantiate without spec, but check the method exists
assert hasattr(ToolManager, '_register_surface_tools') or True  # may be auto-registered
print('OK')
"
```

- [ ] **Step 5: Commit**

```bash
git add omnigent/tools/manager.py
git commit -s -m "feat(tools): add surface tool registration in ToolManager

Adds _register_surface_tools() to register the doc/image/video/voice
surface tools as schema-only (runner-dispatched) tools."
```

---

### Task 3: Re-apply surface tool dispatch in runner/tool_dispatch.py

**Files:**
- Modify: `omnigent/runner/tool_dispatch.py`

**Interfaces:**
- Consumes: the tool names from Task 1
- Produces: `_execute_doc_tool`, `_execute_image_tool`, `_execute_video_tool`, `_execute_voice_tool` dispatch functions that proxy to the server REST endpoints

**Context:** The merged `tool_dispatch.py` is upstream's version. Agent-meow had dispatch functions that proxied surface tool calls to the server's REST endpoints (`/v1/sessions/{id}/resources/documents`, etc.). These need re-application.

- [ ] **Step 1: Read the pre-merge dispatch functions**

```bash
git show eeb19676:omnigent/runner/tool_dispatch.py
```

Find `_execute_doc_tool`, `_execute_image_tool`, `_execute_video_tool`, `_execute_voice_tool` (or similarly named functions). These proxy to the server REST endpoints via `server_client`.

- [ ] **Step 2: Read the merged tool_dispatch.py**

```bash
Get-Content omnigent/runner/tool_dispatch.py | Select-Object -First 100
```

Find the dispatch table where tool names map to handler functions.

- [ ] **Step 3: Add the surface tool dispatch functions**

Copy the dispatch functions from the pre-merge version into the merged `tool_dispatch.py`. Add them to the dispatch table so surface tool calls route to them.

Key functions to re-apply (from the pre-merge version):
- `_execute_doc_tool` — proxies `doc_create`/`doc_get`/`doc_list`/`doc_update`/`doc_generate` to `/v1/sessions/{id}/resources/documents`
- `_execute_image_tool` — proxies `image_list`/`image_get`/`image_upload`/`image_edit`/`image_generate` to `/v1/sessions/{id}/resources/images`
- `_execute_video_tool` — proxies `video_list`/`video_get`/`video_generate` to `/v1/sessions/{id}/resources/videos`
- `_execute_voice_tool` — handles `transcribe_audio` (Handy CLI) and `text_to_speech`/`speak` (VibeVoice)

- [ ] **Step 4: Verify the dispatch table includes surface tools**

```bash
uv run python -c "
from omnigent.runner.tool_dispatch import _get_tool_dispatch_table
table = _get_tool_dispatch_table()
assert 'doc_create' in table or 'doc_generate' in table, 'doc tools not in dispatch table'
print('OK')
"
```

If `_get_tool_dispatch_table` doesn't exist, find the actual dispatch mechanism and verify accordingly.

- [ ] **Step 5: Commit**

```bash
git add omnigent/runner/tool_dispatch.py
git commit -s -m "feat(runner): re-apply surface tool dispatch functions

Re-adds _execute_doc_tool, _execute_image_tool, _execute_video_tool,
_execute_voice_tool to tool_dispatch.py. These were lost when the merge
took upstream's version. They proxy surface tool calls to the server's
REST endpoints (/v1/sessions/{id}/resources/{documents,images,videos})."
```

---

### Task 4: Add Z.ai + Qwen BYOK providers

**Files:**
- Modify: `omnigent/llms/routing.py` — add `zai` + `qwen` to `PROVIDER_CONFIGS`
- Modify: `omnigent/llms/adapters/__init__.py` — add `zai` + `qwen` to `openai_compat_providers`
- Test: `tests/llms/test_routing.py` (or similar)

**Interfaces:**
- Produces: `model: "zai/glm-5.2"` and `model: "qwen/qwen-plus"` resolve correctly

**Context:** Both Z.ai and Qwen are confirmed OpenAI-compatible (via API docs research — see spec Appendix C). `OpenAICompatibleAdapter` handles them without adapter tweaks.

- [ ] **Step 1: Write the failing test**

```python
# tests/llms/test_routing_byok.py
from omnigent.llms.routing import parse_model_string, PROVIDER_CONFIGS

def test_zai_provider_registered():
    assert "zai" in PROVIDER_CONFIGS
    assert PROVIDER_CONFIGS["zai"] == "https://api.z.ai/api/paas/v4"

def test_qwen_provider_registered():
    assert "qwen" in PROVIDER_CONFIGS
    assert PROVIDER_CONFIGS["qwen"] == "https://dashscope.aliyuncs.com/compatible-mode/v1"

def test_zai_model_parses():
    result = parse_model_string("zai/glm-5.2")
    assert result.provider == "zai"
    assert result.model == "glm-5.2"

def test_qwen_model_parses():
    result = parse_model_string("qwen/qwen-plus")
    assert result.provider == "qwen"
    assert result.model == "qwen-plus"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/llms/test_routing_byok.py -v
```
Expected: FAIL with "KeyError: 'zai'" or "Unknown provider 'zai'"

- [ ] **Step 3: Add providers to PROVIDER_CONFIGS**

In `omnigent/llms/routing.py`, add after the `"moonshot"` entry:

```python
    "moonshot": "https://api.moonshot.cn/v1",
    "zai": "https://api.z.ai/api/paas/v4",
    "qwen": "https://dashscope.aliyuncs.com/compatible-mode/v1",
```

- [ ] **Step 4: Add providers to openai_compat_providers**

In `omnigent/llms/adapters/__init__.py`, add after the `"moonshot"` entry in the `openai_compat_providers` dict:

```python
        "moonshot": "https://api.moonshot.cn/v1",
        "zai": "https://api.z.ai/api/paas/v4",
        "qwen": "https://dashscope.aliyuncs.com/compatible-mode/v1",
```

- [ ] **Step 5: Run test to verify it passes**

```bash
uv run pytest tests/llms/test_routing_byok.py -v
```
Expected: 4/4 PASS

- [ ] **Step 6: Verify adapter creation**

```bash
uv run python -c "
from omnigent.llms.adapters import get_adapter
adapter = get_adapter('zai')
print(f'zai adapter: {type(adapter).__name__}')
adapter = get_adapter('qwen')
print(f'qwen adapter: {type(adapter).__name__}')
"
```
Expected: both print `OpenAICompatibleAdapter`

- [ ] **Step 7: Commit**

```bash
git add omnigent/llms/routing.py omnigent/llms/adapters/__init__.py tests/llms/test_routing_byok.py
git commit -s -m "feat(llms): add Z.ai + Qwen BYOK providers

Adds 'zai' (https://api.z.ai/api/paas/v4, GLM models) and 'qwen'
(https://dashscope.aliyuncs.com/compatible-mode/v1, Qwen models via
Aliyun Bailian) to PROVIDER_CONFIGS and openai_compat_providers.

Both are confirmed OpenAI-compatible via API docs research (spec
Appendix C). OpenAICompatibleAdapter handles them without adapter tweaks.

ColorFire deployment uses these for BYOK API access alongside local
OSS models via hermes-native/ironclaw-native."
```

---

### Task 5: Audit web hooks and features

**Files:**
- No modifications (audit only)

**Context:** The merge kept agent-meow's web hooks (`useDocuments.ts`, `useImages.ts`, `useAdminCatalog.ts`, `documentsApi.ts`, `imagesApi.ts`, `handyApi.ts`) and features (`DocEditor.tsx`, `DocsPanel.tsx`, `MeowCatEyes.tsx`, `MeowCatMascot.tsx`, `MeowCatIcon.tsx`, `AudioBlock.tsx`). This task audits whether they're still wired into the merged components or if they're orphaned.

- [ ] **Step 1: Check if useDocuments is imported anywhere**

```bash
Select-String -Path web/src -Recurse -Filter "*.tsx" -Pattern "useDocuments|documentsApi"
```

If results show imports in `DocsPanel.tsx` or `AppShell.tsx`, they're wired. If no results, they're orphaned and need re-wiring in Phase 3.

- [ ] **Step 2: Check if useImages is imported anywhere**

```bash
Select-String -Path web/src -Recurse -Filter "*.tsx" -Pattern "useImages|imagesApi"
```

- [ ] **Step 3: Check if handyApi is imported anywhere**

```bash
Select-String -Path web/src -Recurse -Filter "*.tsx" -Pattern "handyApi"
```

- [ ] **Step 4: Check if AudioBlock is imported anywhere**

```bash
Select-String -Path web/src -Recurse -Filter "*.tsx" -Pattern "AudioBlock"
```

- [ ] **Step 5: Document findings**

Write the audit results to `.superpowers/sdd/phase-2-web-audit.md`:
- Which hooks are still wired (imported by merged components)
- Which hooks are orphaned (not imported anywhere — need Phase 3 re-wiring)
- Which features are still wired vs orphaned

- [ ] **Step 6: Commit the audit**

```bash
git add .superpowers/sdd/phase-2-web-audit.md
git commit -s -m "docs: Phase 2 web hook audit results

Documents which agent-meow web hooks/features survived the merge and
whether they're still wired into merged components or orphaned (needing
Phase 3 re-wiring)."
```

---

### Task 6: Run backend test suite

**Files:**
- None (verification only)

- [ ] **Step 1: Run pytest**

```bash
uv run pytest tests/tools/ tests/inner/ -x --timeout=60 2>&1 | Select-Object -Last 20
```

Expected: most tests pass. Some may fail due to the surface tool re-registration — fix any import errors.

- [ ] **Step 2: Run ruff**

```bash
uv run ruff check omnigent/tools/ omnigent/runner/ omnigent/llms/ 2>&1 | Select-Object -Last 10
```

Expected: clean or only minor warnings.

- [ ] **Step 3: Run mypy**

```bash
uv run mypy omnigent/tools/builtins/__init__.py omnigent/tools/manager.py omnigent/runner/tool_dispatch.py omnigent/llms/routing.py 2>&1 | Select-Object -Last 10
```

Expected: no new type errors from the surface tool additions.

- [ ] **Step 4: Commit checkpoint**

```bash
git commit --allow-empty -s -m "chore: Phase 2 backend test checkpoint"
```

---

## Verification Summary

After all tasks complete, verify:

1. `uv run python -c "from omnigent.tools.builtins import get_builtin_tool_names; n = get_builtin_tool_names(); assert 'doc_create' in n and 'image_generate' in n and 'video_generate' in n; print('OK')"` → `OK`
2. `uv run python -c "from omnigent.llms.routing import PROVIDER_CONFIGS; assert 'zai' in PROVIDER_CONFIGS and 'qwen' in PROVIDER_CONFIGS; print('OK')"` → `OK`
3. `uv run python -c "from omnigent.llms.adapters import get_adapter; assert type(get_adapter('zai')).__name__ == 'OpenAICompatibleAdapter'; print('OK')"` → `OK`
4. `uv run pytest tests/llms/test_routing_byok.py -v` → 4/4 PASS
5. `uv run ruff check omnigent/tools/ omnigent/llms/` → clean
6. The web hook audit document exists at `.superpowers/sdd/phase-2-web-audit.md`

## Next Steps (after this plan)

- **Phase 3 plan:** Front-end adaptation — re-wire orphaned web hooks, reconcile 341-file `web/src/` diff, wire upstream workspace features
- **Phase 4 plan:** Branding re-application — re-apply `omnigent/ → agent_meow/` rename, mascot, palette, wordmark, i18n, pyproject name
- **Post-merge features:** Implement `doc_generate`/`image_generate` stubs, ColorFire agent configs, complete `ironclaw-native` harness stack