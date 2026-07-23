# Videos surface (agent-meow)

The Videos surface adds first-class video file management and inline playback
to the agent-meow workspace. It is implemented as middleware on top of the
existing agent-meow runtime — a new `video` session resource type, a new
`VideoStore` (metadata) backed by the existing `ArtifactStore` (binary),
new REST routes, new builtin agent tools, and a new UI rail tab.

## Architecture

```text
agent-meow Videos surface
├── Backend
│   ├── agent_meow/entities/video.py              — VideoAsset dataclass
│   ├── agent_meow/db/db_models.py                — SqlVideo table
│   ├── agent_meow/stores/video_store/            — VideoStore (abstract + SQLAlchemy)
│   ├── agent_meow/server/routes/videos.py        — REST routes (/v1/sessions/{id}/resources/videos)
│   └── agent_meow/tools/builtins/videos.py       — video_list / video_get / video_upload / video_delete tools
├── Migration
│   └── agent_meow/db/migrations/versions/p1a2b3c4d5e6_add_videos_table.py
├── Runner dispatch
│   └── agent_meow/runner/tool_dispatch.py        — _execute_video_tool handler
├── Frontend
│   ├── web/src/lib/videosApi.ts                  — typed API client
│   ├── web/src/hooks/useVideos.ts                — react-query hooks (useVideos / useUploadVideo / useDeleteVideo)
│   ├── web/src/shell/VideosPanel.tsx             — right-rail gallery panel
│   └── web/src/shell/railTabs.ts                 — "videos" added to RightRailTab union
└── Example agent
    └── examples/video-creator/config.yaml
```

## REST API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/sessions/{id}/resources/videos` | Upload a video (multipart) |
| `GET` | `/v1/sessions/{id}/resources/videos` | List videos (newest-first) |
| `GET` | `/v1/sessions/{id}/resources/videos/{video_id}` | Fetch video binary |
| `DELETE` | `/v1/sessions/{id}/resources/videos/{video_id}` | Delete a video (metadata + binary) |

## Builtin tools

| Tool | Description |
| --- | --- |
| `video_list` | List all videos in a session |
| `video_get` | Fetch a video's metadata by id |
| `video_upload` | Upload a video file from the local workspace |
| `video_delete` | Delete a video (metadata + binary) |

Tools are runner-dispatched (schema-only `Tool` subclasses); the runner
proxies the server's REST endpoints via `agent_meow/runner/tool_dispatch.py`
(`_execute_video_tool`).

## UI

The Videos tab appears in the right workspace rail alongside Files, Docs,
Images, Subagents, Shells, and Tasks. The panel (`VideosPanel.tsx`) renders
a gallery grid with:

- **Thumbnails** — `<video>` elements with `preload="metadata"` that paint
  the first frame as a poster. A small seek to 0.1s ensures a frame renders.
- **Duration badge** — bottom-right of each thumbnail (e.g. "1:23").
- **File metadata** — filename, file size, dimensions (e.g. "12.4 MB · 1920×1080").
- **Upload** — drag-and-drop dropzone + upload button. Accepts mp4, webm,
  mov, avi, mkv, m4v, ogg.
- **Inline player** — clicking a video expands an inline `<video>` player
  with controls above the gallery. Click X to close and return to the grid.
- **Delete** — hover any video to reveal a trash button; confirms before
  deleting.
- **States** — loading, empty (with upload CTA), and error states, matching
  the DocsPanel/ImagesPanel pattern.

Content round-trips as binary; the original file is never modified.

## Video schema

```sql
videos(
  id               TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL,
  filename         TEXT NOT NULL,
  mime             TEXT NOT NULL,
  artifact_key     TEXT NOT NULL,        -- ArtifactStore key for binary
  duration_seconds REAL,                 -- nullable
  width            INTEGER NOT NULL DEFAULT 0,
  height           INTEGER NOT NULL DEFAULT 0,
  bytes_size       INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL,
  updated_at       BIGINT NOT NULL,      -- epoch microseconds
  created_by       TEXT                  -- nullable, single-user mode
)
```

## Frontend files (shipped 2026-07-20)

| File | Purpose |
| --- | --- |
| `web/src/lib/videosApi.ts` | Typed API client: `listVideos`, `uploadVideo`, `deleteVideo`, `videoUrl`. Mirrors `imagesApi.ts`. |
| `web/src/hooks/useVideos.ts` | React Query hooks: `useVideos`, `useUploadVideo`, `useDeleteVideo`. Mirrors `useImages.ts`. |
| `web/src/shell/VideosPanel.tsx` | Right-rail panel: gallery grid, thumbnails, inline player, upload, delete, empty/loading/error states. |
| `web/src/shell/railTabs.ts` | `RightRailTab` union updated: `"videos"` added. |
| `web/src/shell/WorkspacePanel.tsx` | `VideosPanel` imported + rendered; Videos tab pill inserted after Images. |
| `web/src/shell/AppShell.tsx` | `railTabsAvailable` record: `videos: true` added. |
| `web/src/lib/locales/en.json` | `workspace.videos` + `videos.*` i18n strings. |
| `web/src/lib/locales/zh-CN.json` | Same, Chinese. |

## v1 limitations

- **No server-side thumbnail generation**: thumbnails are rendered browser-side
  via `<video>` first-frame paint. Add ffmpeg-based thumbnail extraction if
  server-side previews are needed later.
- **No video editing**: the panel supports browse/upload/play/delete only.
  A Fabric.js-style video editor is not planned (video editing is a different
  problem class).
- **No video generation**: `video_generate` is not yet a tool. Wire to a
  video generation provider (Runway, Pika, Sora) when ready.
