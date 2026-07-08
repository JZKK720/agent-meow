# Images surface (agent-meow)

The Images surface adds first-class image file management and image editing
to the agent-meow workspace. It is implemented as middleware on top of the
existing agent-meow runtime — a new `image` session resource type, a new
`ImageStore` (metadata) backed by the existing `ArtifactStore` (binary),
new REST routes, new builtin agent tools, and a new UI rail tab.

## Architecture

```
agent-meow Images surface
├── Backend
│   ├── omnigent/entities/image.py             — ImageAsset dataclass
│   ├── omnigent/db/db_models.py               — SqlImage table
│   ├── omnigent/stores/image_store/           — ImageStore (abstract + SQLAlchemy)
│   ├── omnigent/server/routes/images.py       — REST routes (/v1/sessions/{id}/resources/images)
│   └── omnigent/tools/builtins/images.py      — image_list / image_get / image_upload / image_edit / image_generate tools
├── Migration
│   └── omnigent/db/migrations/versions/o1a2b3c4d5e6_add_documents_and_images.py
├── Frontend
│   ├── web/src/lib/imagesApi.ts               — typed API client
│   ├── web/src/hooks/useImages.ts             — react-query hooks
│   ├── web/src/shell/ImagesPanel.tsx          — right-rail gallery panel
│   └── web/src/shell/ImageEditor.tsx          — Fabric.js full-pane editor
└── Example agent
    └── examples/image-editor/config.yaml
```

## REST API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/sessions/{id}/resources/images` | Upload an image (multipart) |
| `GET` | `/v1/sessions/{id}/resources/images` | List images (newest-first) |
| `GET` | `/v1/sessions/{id}/resources/images/{image_id}` | Fetch image binary |
| `PATCH` | `/v1/sessions/{id}/resources/images/{image_id}/edit` | Apply Fabric.js edit JSON |
| `DELETE` | `/v1/sessions/{id}/resources/images/{image_id}` | Delete an image (metadata + binary) |

## Builtin tools

| Tool | Description |
| --- | --- |
| `image_list` | List all images in a session |
| `image_get` | Fetch an image's metadata by id |
| `image_upload` | Upload an image file from the local workspace |
| `image_edit` | Apply Fabric.js edit JSON to an image (store-and-forward) |
| `image_generate` | Generate an image from a text prompt (stub in v1) |

Tools are runner-dispatched (schema-only `Tool` subclasses); the runner
proxies the server's REST endpoints via `omnigent/runner/tool_dispatch.py`
(`_execute_image_tool`). `image_upload` reads a local file from the
agent's workspace and POSTs it as multipart. `image_generate` is a v1
stub — it returns a not-yet-wired message; configure a diffusion
provider (Stability, OpenAI images, ComfyUI MCP) to enable it.

## UI

The Images tab appears in the right workspace rail alongside Files, Docs,
Shells, Agents, and Tasks. The panel renders a gallery grid with
thumbnails and an upload dropzone (`react-dropzone`). Selecting an image
opens the `ImageEditor` full-pane, which uses
[Fabric.js](https://fabricjs.com/) (typed canvas) with rotate, download,
and save-JSON operations. Edits are stored as Fabric.js canvas JSON
(store-and-forward); the original binary is never modified. The browser
renders the edit JSON on top of the original when the image is reopened.

## Image schema

```sql
images(
  id            TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  filename      TEXT NOT NULL,
  mime          TEXT NOT NULL,
  artifact_key  TEXT NOT NULL,        -- ArtifactStore key for binary
  width         INTEGER NOT NULL DEFAULT 0,
  height        INTEGER NOT NULL DEFAULT 0,
  bytes_size    INTEGER NOT NULL DEFAULT 0,
  edit_json     TEXT,                  -- Fabric.js canvas JSON, nullable
  created_at    INTEGER NOT NULL,
  updated_at    BIGINT NOT NULL,       -- epoch microseconds
  created_by    TEXT                   -- nullable, single-user mode
)
```

## v1 limitations

- **Server-side rendering**: deferred. Edit JSON is rendered browser-side
  only. Add the `fabric` Python port only if thumbnail/preview generation
  is needed later.
- **Image generation**: `image_generate` is a stub in v1. Wire to a
  diffusion provider (Stability, OpenAI images, ComfyUI MCP) when ready.