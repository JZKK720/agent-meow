# Docs surface (agent-meow)

The Docs surface adds first-class document generation and rich-text editing
to the agent-meow workspace. It is implemented as middleware on top of the
existing Omnigent runtime — a new `document` session resource type, a new
`DocumentStore`, new REST routes, new builtin agent tools, and a new UI
rail tab.

## Architecture

```
agent-meow Docs surface
├── Backend
│   ├── omnigent/entities/document.py          — Document dataclass
│   ├── omnigent/db/db_models.py               — SqlDocument table
│   ├── omnigent/stores/document_store/        — DocumentStore (abstract + SQLAlchemy)
│   ├── omnigent/server/routes/documents.py    — REST routes (/v1/sessions/{id}/resources/documents)
│   └── omnigent/tools/builtins/docs.py        — doc_create / doc_get / doc_list / doc_update / doc_generate tools
├── Migration
│   └── omnigent/db/migrations/versions/o1a2b3c4d5e6_add_documents_and_images.py
├── Frontend
│   ├── web/src/lib/documentsApi.ts            — typed API client
│   ├── web/src/hooks/useDocuments.ts          — react-query hooks
│   ├── web/src/shell/DocsPanel.tsx            — right-rail list panel
│   └── web/src/shell/DocEditor.tsx            — Tiptap full-pane editor
└── Example agent
    └── examples/doc-writer/config.yaml
```

## REST API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/sessions/{id}/resources/documents` | Create a new document |
| `GET` | `/v1/sessions/{id}/resources/documents` | List documents (newest-first) |
| `GET` | `/v1/sessions/{id}/resources/documents/{doc_id}` | Fetch a single document |
| `PATCH` | `/v1/sessions/{id}/resources/documents/{doc_id}` | Update title and/or content |
| `DELETE` | `/v1/sessions/{id}/resources/documents/{doc_id}` | Delete a document |

## Builtin tools

| Tool | Description |
| --- | --- |
| `doc_create` | Create a new document with a title and markdown body |
| `doc_get` | Fetch a single document by id |
| `doc_list` | List all documents in a session |
| `doc_update` | Update a document's title and/or content |
| `doc_generate` | Generate a markdown document from a topic + outline (LLM-driven) |

Tools are runner-dispatched (schema-only `Tool` subclasses); the runner
proxies the server's REST endpoints via `omnigent/runner/tool_dispatch.py`
(`_execute_doc_tool`). `doc_generate` persists a structured placeholder
document (topic + outline + instructions) in v1; a future version can
route it back into the agent's own LLM loop for full generation.

## UI

The Docs tab appears in the right workspace rail alongside Files, Images,
Shells, Agents, and Tasks. Selecting a document opens the `DocEditor`
full-pane, which uses [Tiptap](https://tiptap.dev/) (ProseMirror kernel)
with StarterKit, Link, Image, and Markdown extensions. Content round-trips
as markdown; ⌘S / Ctrl+S saves via `PATCH`.

## Document schema

```sql
documents(
  id            TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  title         TEXT NOT NULL,
  format        TEXT NOT NULL DEFAULT 'markdown',
  content_md    TEXT NOT NULL DEFAULT '',
  content_json  TEXT,                    -- ProseMirror JSON, nullable
  created_at    INTEGER NOT NULL,
  updated_at    BIGINT NOT NULL,         -- epoch microseconds
  version       INTEGER NOT NULL DEFAULT 1,
  created_by    TEXT                     -- nullable, single-user mode
)
```