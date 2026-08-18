# Plan 012: Make the three surfaces ACTUALLY work — DashScope providers + dispatch refactor

> **Goal**: images/videos/docs surfaces generate real content end-to-end on this
> machine (China network, DashScope key available), with passing tests.

## Status

- **Priority**: P0
- **Planned at**: commit `3bcc52bf`, 2026-08-15
- **Depends on**: Plan 003 (runner dispatch — partially executed)

## Current state (verified 2026-08-15)

| Surface | CRUD                                  | Generation                                                                        | Tests                                                                                                       |
| ------- | ------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Docs    | ✅ works (verified live: create+list) | `doc_convert` needs markitdown CLI (not installed)                                | n/a                                                                                                         |
| Images  | ✅ routes 200                         | `fal` wired; `hosted`/`a1111` stubs; **dashscope missing**                        | ❌ `test_tool_dispatch_media.py` fails collection — imports `_execute_image_generate` etc. that don't exist |
| Videos  | ✅ routes 200                         | `fal`+`pixelle` wired; `happy-horse` falls through to stub; **dashscope missing** | ❌ same broken test file                                                                                    |

Also: dead duplicated code block in `_execute_image_tool` after a `return` (unreachable).

## Research findings (2026-08-15)

- **DashScope (阿里云百炼)** is the right provider: China-accessible, key already owned
  (`~/.config/qwaudio/config.env`, used by the voice stack), free tier for new users.
  - Images: `POST /api/v1/services/aigc/text2image/image-synthesis` with
    `X-DashScope-Async: enable` → `task_id` → poll `GET /api/v1/tasks/{task_id}` →
    `output.results[0].url` (24h TTL — download immediately). Models: `wanx2.1-t2i-turbo`
    (fast), `wan2.2-t2i-flash`, `wan2.5-t2i-preview`, `wan2.6-t2i`.
  - Videos: `POST /api/v1/services/aigc/video-generation/video-synthesis` → same
    task/poll pattern → `output.video_url`. Models: `wan2.2-t2v-flash` (fast/cheap),
    `wan2.7-t2v` (SOTA). 1-5 min per generation.
  - Official reference skill: `aliyun/alibabacloud-aiops-skills` →
    `skills/aiml/sfm/alibabacloud-bailian-video-creator/` (same endpoints confirmed).
- **Docs**: `microsoft/markitdown` (`pip install markitdown`) provides the `markitdown`
  CLI that `doc_convert` already shells out to. `markitdown-mcp` exists as the MCP
  alternative (agent-spec `tools.mcp_servers:`) — follow-up.
- **Local GPU option later**: ComfyUI + Vulkan on the Strix Halo 96GB iGPU
  (`Comfy-Org/comfy-mcp` for agent integration) — not needed for first working stage.

## Implementation

### Step 1: Refactor image/video dispatch into testable helpers

Extract from `_execute_image_tool` / `_execute_video_tool` (matching the contract the
broken test file already expects):

- `_resolve_image_provider() -> str | None` — explicit `IMAGE_GEN_PROVIDER`, else
  auto-detect: `IMAGE_GEN_API_URL`→hosted, `A1111_API_URL`→a1111, `DASHSCOPE_API_KEY`→dashscope
- `_execute_image_generate(args, *, base, server_client) -> str`
- `_execute_image_remove_bg(args, *, base, server_client) -> str`
- `_resolve_video_provider() -> str | None` — explicit `VIDEO_GEN_PROVIDER`, else
  auto-detect: `HAPPY_HORSE_API_URL`, `FAL_KEY`/`VIDEO_GEN_API_URL`→fal,
  `PIXELLE_VIDEO_URL`, `DASHSCOPE_API_KEY`→dashscope
- `_execute_video_generate(args, *, base, server_client) -> str`

Delete the unreachable duplicated block in `_execute_image_tool`.

### Step 2: Add `dashscope` provider (images + videos)

Env vars: `DASHSCOPE_API_KEY` (or `OMNIGENT_DASHSCOPE_API_KEY`), optional
`DASHSCOPE_BASE_URL` (default `https://dashscope.aliyuncs.com`),
`IMAGE_GEN_MODEL` (default `wanx2.1-t2i-turbo`), `VIDEO_GEN_MODEL`
(default `wan2.2-t2v-flash`). Async submit → poll (5s interval, ≤5 min images /
≤10 min videos) → download artifact → upload as session resource.

### Step 3: Docs — install markitdown CLI in the venv

`.venv\Scripts\python.exe -m pip install markitdown` → `doc_convert` works.

### Step 4: Tests

- Fix `tests/runner/test_tool_dispatch_media.py` fixtures to also clear
  `DASHSCOPE_API_KEY` (ambient key must not leak into provider-resolution tests).
- Add dashscope tests: provider resolution (explicit + auto), missing-key error,
  submit+poll+upload flow with mocked httpx.
- All media tests green: `pytest tests/runner/test_tool_dispatch_media.py`.

### Step 5: Live e2e verification (final working stage)

With the real DashScope key and the running server (:6767):

1. `image_generate` → real image appears in session images list
2. `video_generate` → real video appears in session videos list
3. `doc_convert` on a real file → markdown returned
4. Docs CRUD re-verified

### Step 6: Docs + tracking

- Update `agent_meow/spec/AGENTSPEC.md` provider tables (dashscope rows).
- Update `docs/ROADMAP_AND_CORE_FEATURES.md`.
- Commit (DCO), push, update gbrain stage page + graphify.

## STOP conditions

- DashScope key rejected (401/InvalidApiKey) → stop, report — do not burn paid quota.
- Content moderation rejection (DataInspectionFailed) on test prompts → use a
  neutral prompt once; if still blocked, report.
