# Agent Image Spec

An **agent image** is a directory that fully describes an agent — its identity,
instructions, LLM config, tools, skills, and optionally sub-agents. It is a
self-contained, portable artifact. The server stores it as a tarball; the spec
layer extracts and parses it into a typed `AgentSpec`.

This document defines the format. The `spec/` module (`types.py`, `parser.py`,
`validator.py`, `tar_utils.py`) is the authoritative implementation.

---

## Directory Layout

```
my-agent/
├── config.yaml          required — LLM config, interaction contract, tools
├── AGENTS.md            optional — agent identity and behavior instructions
├── skills/              optional — agent skills
│   └── <skill-name>/
│       └── SKILL.md
├── tools/               optional — packaged tools
│   ├── python/          local Python tools (auto-discovered)
│   │   └── *.py
│   ├── typescript/      local TypeScript tools (auto-discovered)
│   │   └── *.ts
│   └── mcp/             MCP server declarations
│       └── *.yaml
└── agents/              optional — sub-agent images (recursive)
    └── <agent-name>/
        ├── config.yaml
        └── ...
```

Any files or directories not listed above are ignored by the parser.

---

## config.yaml

The only required file. All top-level keys except `spec_version` are optional.

```yaml
spec_version: 1 # required; must be 1

name: my-agent # display name
description: Does X and Y. # optional free-form description
instructions: AGENTS.md # inline text or path to file (default: AGENTS.md)

llm:
  model:
    openai/gpt-5.4 # required if llm block present; LiteLLM format
    # examples: openai/gpt-5.4, openai/o4-mini,
    #   anthropic/claude-opus-4-6,
    #   google/gemini-2.5-pro
  max_completion_tokens: 4096 # optional; caps total output including reasoning tokens
  reasoning_effort: medium # optional; low | medium | high

interaction:
  conversational: true # maintain history across turns (default: true)
  modalities:
    input: [text, image, file] # default: [text]
    output: [text] # default: [text]

tools:
  agents: # sub-agents this agent is allowed to call
    - researcher # must match a directory name under agents/

params: # arbitrary key-value; readable by skills and tools
  max_results: 10 # not interpreted by the runtime
  prefer_recent: true
```

### `interaction` axes

| Field            | What it means                                              | Who acts on it     |
| ---------------- | ---------------------------------------------------------- | ------------------ |
| `conversational` | runtime maintains turn history; frontend shows chat thread | runtime + frontend |
| `modalities`     | input/output content types the agent supports              | frontend           |

All agents are interruptible and support streaming — both are always provided
by the runtime regardless of agent config.

### `interaction.modalities`

Declares which content types the agent accepts and produces. Omitting the block
entirely is equivalent to `input: [text], output: [text]`. Omitting one side
defaults that side to `[text]`.

**Supported input modalities:**

| Value   | Meaning                                                                         |
| ------- | ------------------------------------------------------------------------------- |
| `text`  | plain text (always the baseline)                                                |
| `image` | images (jpg, png, etc.) processed via vision                                    |
| `audio` | audio input                                                                     |
| `video` | video input                                                                     |
| `file`  | document/data files (PDF, docx, csv, code) processed via document understanding |

**Supported output modalities:**

| Value   | Meaning                             |
| ------- | ----------------------------------- |
| `text`  | text response (always the baseline) |
| `image` | generated images                    |
| `audio` | generated speech / audio            |

`file` is not a supported output modality in v1 (see Not Yet).

The frontend uses modalities to decide which UI affordances to show — file
upload button, image picker, audio recorder, etc. The runtime uses them to
validate that the underlying model actually supports the requested modalities.

### `tools.agents`

Declares which sub-agents this agent is allowed to call. Any name listed here
must have a corresponding directory under `agents/`. Listing an agent in
`tools.agents` is sufficient to call it — no additional builtin declaration is
needed.

### `tools.builtins`

Enables built-in tools provided by omnigent. Each entry is either a plain
string (tool name, no config needed) or a dict with `name` and tool-specific
config fields (API keys, engine IDs, etc.):

```yaml
tools:
  builtins:
    - web_search # string — auto-detects backend
    - name: web_search # dict — explicit Google config
      api_key: ${GOOGLE_SEARCH_API_KEY}
      engine_id: ${GOOGLE_SEARCH_ENGINE_ID}
    - name: web_search # dict — explicit Perplexity
      search_provider: perplexity
      api_key: ${PERPLEXITY_API_KEY}
    - name: web_search # dict — explicit Nimble
      search_provider: nimble
      api_key: ${NIMBLE_API_KEY}
      # optional: max_results (1-100, default 5); search_depth (lite | deep)
```

Keys can be hardcoded or use `${ENV_VAR}` references (resolved at deploy time
by the client, not at runtime by the server — the spec is self-contained).

**`web_search` backend selection:**

- **OpenAI models:** `web_search` works automatically with no config —
  it uses OpenAI's native `web_search_preview` (server-side). Just add
  `- web_search` to builtins.
- **Other models:** `search_provider` must be set to `"google"`,
  `"perplexity"`, or `"nimble"` with credentials. All config comes from the
  spec (no environment variable fallbacks).
- **Nimble** (`search_provider: nimble`): returns a ranked list of titles,
  URLs, and snippets from Nimble's AI search API. Requires `api_key`; optional
  `max_results` (1-100, default 5) and `search_depth` (`lite` default, or
  `deep`). Works with any non-OpenAI model.

**`web_fetch` — zero-config web research:** Spawns an internal sub-agent with
`terminal_run` to search the web and fetch pages using plain HTTP. No API keys
needed — works with any model provider. The sub-agent inherits the parent's
LLM model and credentials. Only works with the default `llm` executor.

```yaml
tools:
  builtins:
    - web_fetch # no config needed
```

---

## Instructions

Free-form text injected into the system prompt. Defines personality,
constraints, and behavioral guidelines.

The `instructions` key in `config.yaml` controls where instructions come from:

| `instructions` value             | Behavior                                              |
| -------------------------------- | ----------------------------------------------------- |
| _(omitted)_                      | Read `AGENTS.md` from the agent root if present       |
| `path/to/file.md`                | Read the file at that path relative to the agent root |
| `"You are a helpful assistant."` | Use the string as inline instructions                 |

Resolution: if the value matches an existing file relative to the agent root,
the file contents are used. Otherwise the value is treated as inline text.

```markdown
You are a research assistant. Always cite sources. Ask one clarifying
question before diving in. When unsure, say so.
```

Not machine-parsed — the entire contents (file or inline) are passed to the
model as instructions. Optional; if absent, the model receives no agent-level
system prompt (per-request `instructions` from the API still apply).

This is the portable, user-authored portion of the system prompt. At runtime,
Omnigent may append small framework-owned lifecycle or metadata instructions
after the agent-level and per-request instructions. Those additions are not
part of `AgentSpec` and must not be encoded into an agent image.

---

## Skills — `skills/<name>/SKILL.md`

A skill is a named chunk of instructions the agent can load on demand. Each
skill lives in its own subdirectory under `skills/`.

```markdown
---
name: deep-search
description: Search the web and arxiv for sources on a topic.
---

When asked to research a topic:

1. Use search.web for general context.
2. Use arxiv.search for academic papers.
3. Collect at least 3 sources before synthesizing.
```

**Frontmatter fields:**

| Field         | Required | Constraints                                                                 |
| ------------- | -------- | --------------------------------------------------------------------------- |
| `name`        | yes      | max 64 chars; lowercase letters, digits, hyphens; must match directory name |
| `description` | yes      | max 1024 chars; one-line description of when to use this skill              |

Everything after the frontmatter is markdown content passed to the model.

---

## MCP Tools — `tools/mcp/<name>.yaml`

Declares an MCP server the agent can use.

Only the HTTP (SSE) transport is supported.

```yaml
name: my-service
description: Internal service tools.
url: http://localhost:9000/mcp
headers: # optional headers
  Authorization: Bearer ${API_KEY}
```

**Required fields:** `name`, `transport`, `url`

**Optional fields:**

| Field         | Type          | Default       | Notes                                                      |
| ------------- | ------------- | ------------- | ---------------------------------------------------------- |
| `description` | string        | _(none)_      | Human-readable summary                                     |
| `headers`     | map           | `{}`          | HTTP headers; supports `${ENV_VAR}` expansion              |
| `timeout`     | int (seconds) | _(see below)_ | Per-tool timeout override; `None` inherits `tools.timeout` |
| `retry`       | object        | _(see below)_ | Per-tool retry override; `None` inherits `tools.retry`     |

**Timeout defaults:** When `timeout` is omitted (or `None`), the MCP SDK
defaults apply: **5 seconds** for the initial HTTP connection handshake and
**300 seconds (5 minutes)** for each SSE event read. Setting an explicit
`timeout` overrides both values to the same number of seconds.

**Security note — `${VAR}` is NOT expanded for uploaded bundles:**
`${VAR}` references in `headers`, `env`, and connection blocks are
resolved against the spec author's _own_ environment at the client /
registration boundary (`omnigent.cli._resolve_bundle_env_vars`), never
at runtime by the server or runner for a tenant-uploaded
(session-scoped) bundle. Expanding an uploaded spec's `${VAR}` against
the server process env would let any tenant exfiltrate server-side
secrets by referencing them in a header pointed at an attacker URL
(W7-3). Only operator-authored template agents
(`--agent`, built-ins; `Agent.session_id is None`) expand server-side.

**Security note — SSRF risk:** The omnigent server makes outbound HTTP
requests to the configured `url`. There is currently no application-level
URL validation (e.g. blocking private IPs or cloud metadata endpoints).
In multi-tenant or untrusted-bundle environments, use network-level
controls (egress proxy, network policies) to restrict which destinations
the server process can reach.

---

## Local Tools — `tools/python/*.py` / `tools/typescript/*.ts`

Python and TypeScript files under `tools/python/` and `tools/typescript/` are
auto-discovered. The tool name is derived from the filename
(`arxiv_search.py` → `arxiv.search`).

The runtime loads these files and exposes their public functions as tools.
Schema is inferred from type hints and docstrings. Refer to the runtime
documentation for the exact loading convention.

---

## Sub-agents — `agents/<name>/`

Each subdirectory under `agents/` is itself a full agent image (recursive).
The parent declares which sub-agents it is allowed to call via `tools.agents`.

```
parent/
├── config.yaml          tools.agents: [researcher, critic]
└── agents/
    ├── researcher/
    │   ├── config.yaml
    │   └── skills/
    └── critic/
        ├── config.yaml
        └── skills/
```

**Resolution rules:**

1. The called name must appear in `tools.agents` — names not listed are
   rejected at call time.
2. The runtime resolves `agents/<name>/` relative to the calling agent's root.
   There is no global registry and no parent-walking.
3. Sub-agents are isolated by default — they see only tools declared in their
   own `config.yaml`. Tool inheritance is not supported in v1.
4. Each sub-agent call produces its own trace span under the parent span.

---

## Validation Rules

The validator (`validator.py`) enforces:

- `spec_version` must be `1`
- `llm.model` must be present if the `llm` block is present
- Skill `name` in frontmatter must match the directory name
- Skill `name`: max 64 chars, pattern `[a-z0-9-]+`
- Skill `description`: max 1024 chars
- MCP configs must have `transport: http` and a non-empty `url` (presence checked, not format)
- No duplicate skill names across `skills/`
- No duplicate tool names across `tools/mcp/`, `tools/python/`, and
  `tools/typescript/`
- Sub-agent names in `tools.agents` must have a corresponding directory under
  `agents/`

---

## Key Design Decisions

- **Pure filesystem layer.** The `spec/` module takes a `Path` and returns an
  `AgentSpec`. No network, no database, no storage awareness. The server
  (bundle upload/extraction) is separate from parsing.

- **Listing an agent is enough to call it.** No explicit `agent.call` builtin
  needed. If a name appears in `tools.agents`, the runtime exposes it as a
  callable tool automatically.

- **Allowlists only.** Agents not listed in `tools.agents` are rejected at
  call time. No denylists, no wildcards in v1.

- **Sub-agents are isolated.** Each sub-agent sees only its own tools. No
  tool inheritance from parent in v1.

- **Plain dataclasses.** `AgentSpec` and related types are dataclasses, not
  ORM models. No database awareness in this layer.

---

## Environment Variables — Media Surfaces

The Docs, Images, and Video surfaces are auto-registered (no `tools.builtins:`
entry needed); the runner intercepts their tool calls by name. Backends are
resolved from environment variables at call time.

### Docs surface — Office document tools (officecli / markitdown)

| Variable         | Purpose                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `OFFICECLI_BIN`  | Path to the `officecli` binary (overrides `shutil.which`). Install from https://github.com/iOfficeAI/OfficeCLI |
| `MARKITDOWN_BIN` | Path to the `markitdown` binary (overrides `shutil.which`). Install via `pip install markitdown[all]`          |

Tools: `doc_create_office`, `doc_edit_office`, `doc_export` (officecli);
`doc_convert` (markitdown).

**MCP alternative:** instead of shelling out, declare the `officecli mcp`
or `markitdown-mcp` stdio MCP servers under `tools.mcp_servers:` for
agent-driven use without the runner shelling out.

### Images surface — generation & editing

| Variable               | Purpose                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IMAGE_GEN_PROVIDER`   | Explicit provider: `fal`, `dashscope`, `hosted`, `a1111`, or `comfyui`. If unset, auto-detected from the credential env vars below (fal > dashscope > hosted > a1111).             |
| `FAL_KEY`              | fal.ai API key. Enables `fal` (hosted FLUX models).                                                                                                                                |
| `DASHSCOPE_API_KEY`    | DashScope (阿里云百炼) API key. Enables `dashscope` — async 万相 text-to-image (`wanx2.1-t2i-turbo` default). China-accessible. `OMNIGENT_DASHSCOPE_API_KEY` alias also accepted.  |
| `DASHSCOPE_BASE_URL`   | DashScope API base URL. Defaults to `https://dashscope.aliyuncs.com`.                                                                                                              |
| `IMAGE_GEN_MODEL`      | Model id for the active provider. DashScope default `wanx2.1-t2i-turbo` (options: `wan2.2-t2i-flash`, `wan2.2-t2i-plus`, `wan2.5-t2i-preview`); fal default `fal-ai/flux/schnell`. |
| `IMAGE_GEN_API_URL`    | Hosted generation API base URL (e.g. `https://api.openai.com/v1`). Enables `hosted`.                                                                                               |
| `IMAGE_GEN_API_KEY`    | Bearer token for the hosted API.                                                                                                                                                   |
| `IMAGE_GEN_API_VENDOR` | Hosted API vendor: `openai` (default), `stability`, or `grok`. Shapes the request/response format.                                                                                 |
| `A1111_API_URL`        | A1111 (stable-diffusion-webui) base URL (e.g. `http://localhost:7860`). Enables `a1111`.                                                                                           |
| `REMBG_BIN`            | Path to the `rembg` binary (overrides `shutil.which`). Install via `pip install rembg[cpu,cli]`                                                                                    |
| `COMFYUI_MCP_SERVER`   | Hint that a ComfyUI MCP server is configured. ComfyUI is declared in `tools.mcp_servers:` and called as a namespaced MCP tool.                                                     |

Tools: `image_generate`, `image_remove_bg` (rembg), `image_edit_ai`
(inpaint/outpaint/upscale via fal; the dashscope provider is generate-only).

### Video surface — generation

The video surface resolves a provider from environment variables in a
**quality ladder** (highest quality / zero-infra first). Set
`VIDEO_GEN_PROVIDER` to pick one explicitly, or leave it unset and the
runner auto-detects from which env vars are set.

| Variable                 | Purpose                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VIDEO_GEN_PROVIDER`     | Explicit provider: `fal`, `happy-horse`, `pixelle`, `dashscope`, `hyperframes`, or `openmontage`. If unset, auto-detected below.                                                                                                                                                                                                      |
| `FAL_KEY`                | fal.ai API key. Enables `fal` (hosted SOTA models). Get one at https://fal.ai/dashboard/keys                                                                                                                                                                                                                                          |
| `VIDEO_GEN_API_URL`      | Alternative: a fal.ai-compatible hosted API base URL. Enables `fal`.                                                                                                                                                                                                                                                                  |
| `VIDEO_GEN_MODEL`        | Model id for the active provider. fal default `fal-ai/wan-2.1-i2v` (options: `fal-ai/wan-2.1-t2v`, `fal-ai/hunyuan-video`, `fal-ai/ltx-video-13b-dev`, `fal-ai/veo`, `fal-ai/kling-video`, `fal-ai/minimax-video`, `fal-ai/seedance`); DashScope default `wan2.2-t2v-flash` (`wan2.7-t2v` switches to `resolution` + `ratio` params). |
| `HAPPY_HORSE_API_URL`    | Happy Horse 1.0 API base URL. Enables `happy-horse`. See https://happy-horse.art/                                                                                                                                                                                                                                                     |
| `HAPPY_HORSE_API_KEY`    | Happy Horse 1.0 API key (bearer token).                                                                                                                                                                                                                                                                                               |
| `HAPPY_HORSE_RESOLUTION` | Happy Horse output resolution. Defaults to `1080p`.                                                                                                                                                                                                                                                                                   |
| `PIXELLE_VIDEO_URL`      | Pixelle-Video FastAPI gateway base URL. Enables `pixelle`. Deploy from https://github.com/AIDC-AI/Pixelle-Video                                                                                                                                                                                                                       |
| `DASHSCOPE_API_KEY`      | DashScope (阿里云百炼) API key. Enables `dashscope` — async 万相 video synthesis. China-accessible. `OMNIGENT_DASHSCOPE_API_KEY` alias also accepted.                                                                                                                                                                                 |
| `DASHSCOPE_BASE_URL`     | DashScope API base URL. Defaults to `https://dashscope.aliyuncs.com`.                                                                                                                                                                                                                                                                 |
| `HYPERFRAMES_BIN`        | Path to the HyperFrames CLI (overrides `shutil.which`). Enables `hyperframes` — free local HTML→MP4 rendering. Install via `npm i -g hyperframes`. Requires Node 22+ and FFmpeg.                                                                                                                                                      |

Tools: `video_generate` (async + poll, returns `provider` in the result),
`video_list`, `video_get`. With `hyperframes`, pass an `html` argument — a
HyperFrames composition (HTML + `data-*` timing attributes) that the CLI
renders deterministically to MP4.

**Provider comparison:**

| Provider      | Quality                                                                                        | Cost                     | Infra                        | Notes                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `fal`         | SOTA (Wan2.1/HunyuanVideo/LTX + Veo/Kling)                                                     | Pay-per-gen              | None                         | Best breadth; single API unlocks all top open models + proprietary. Recommended default.   |
| `happy-horse` | 15B unified Transformer, native audio-video, 7-language lip-sync, #1 Artificial Analysis Arena | Credits/subscription     | None                         | Joint audio-video synthesis in one pass; ~38s 1080p on H100.                               |
| `pixelle`     | Good (ComfyUI backend)                                                                         | Free                     | Local/hosted server          | Topic→finished-video orchestration (script + images + TTS + BGM).                          |
| `dashscope`   | Good (万相 wan2.2/wan2.7)                                                                      | Pay-per-gen (free trial) | None                         | China-native async API; same key serves `image_generate`.                                  |
| `hyperframes` | Deterministic motion graphics (HTML→MP4)                                                       | Free                     | Local CLI (Node 22 + FFmpeg) | Agent writes the composition; zero API cost. See https://github.com/heygen-com/hyperframes |
| `openmontage` | Advanced multi-pipeline                                                                        | Free                     | External MCP server          | AGPLv3 — keep external; declare in `tools.mcp_servers:`.                                   |

**Note:** OpenMontage is AGPLv3 — keep it an external, user-deployed MCP
server; never bundle it into agent-meow.

### One-ComfyUI-server quickstart

Pixelle-Video uses ComfyUI as its image/video backend. A user with one
ComfyUI server can serve both `image_generate` (via a ComfyUI MCP server in
`tools.mcp_servers:`) and `video_generate` (via Pixelle-Video pointing at
the same ComfyUI instance). Configure once, use for both surfaces.

## Not Yet

- **`interaction.schema`** — structured I/O contract for the agent. When
  present, the runtime validates inputs and outputs against declared field
  types. Deferred; all agents default to unstructured chat I/O for now.

  Planned shape:

  ```yaml
  interaction:
    schema:
      types: # reusable custom type definitions
        my_type:
          field_a: string
          field_b: int?
      inputs: # input validation schema (field: type)
        message: string
      outputs: # output validation schema (field: type)
        reply: markdown
        sources: list[my_type]
  ```

  Builtin field types: `string`, `int`, `float`, `bool`, `markdown`, `url`,
  `datetime`, `code`, `json` (escape hatch), `list[T]`, `T?` (optional).
  Custom types defined under `schema.types` are reusable anywhere a builtin
  type is valid. The rationale for nesting under `interaction`: frontend and
  runtime need to read both execution semantics and I/O shape from one block.

- **Type inheritance** — `base: citation` to extend a builtin type within
  `schema.types`. All types are flat in v1.

- **`agent.map` / `agent.spawn`** — batch and parallel fan-out over sub-agents.
  Deferred to v2.

- **Builtin tools: `search.web`, `code.execute`, `memory.*`** — standardized
  runtime-provided tools. Interfaces and availability will be defined soon.

- **Memory policy declarations** — a `memory:` block for consent hints and
  scope declarations. Memory is purely a tool concern in v1.

- **`when:` routing hints on sub-agents** — declarative hints in `tools.agents`
  entries describing when to call each sub-agent. Skill content handles routing
  in v1.

- **Tool inheritance for sub-agents** — `inherit_tools: true` to pass a
  restricted tool allowlist down to a sub-agent. Isolation is the only model
  in v1.

- **Skill versioning** — version numbers on skills or the overall image beyond
  `spec_version: 1`.

- **`interruptible` flag** — all agents are interruptible in v1. A per-agent
  flag with partial-result semantics and resume-from-checkpoint may be added
  later.

- **`streaming` flag** — all agents support streaming in v1. A per-agent flag
  may be added later if non-streaming agents become a meaningful use case.

- **`conversational: false`** — stateless single-turn mode where the runtime
  does not maintain history across turns. All agents are conversational in v1;
  the field is defined in the spec but only `true` is supported for now.

- **`file` output modality** — agents generating downloadable files as output.
  Output modalities are limited to `text`, `image`, and `audio` in v1.

- **Flexible skill content sources** — similar to how `instructions` can be
  inline text or a file reference, skills could support an `instructions` key
  pointing to an arbitrary file instead of requiring `skills/<name>/SKILL.md`.
  Whether inlining skill text directly in `config.yaml` should also be
  supported is an open question — it trades discoverability and
  separation-of-concerns for convenience in simple single-skill agents. In v1,
  skills must live in `skills/<name>/SKILL.md`.

- **Tool environment declarations** — specifying dependencies for local tools,
  e.g. a `requirements.txt` for Python tools or `package.json` for TypeScript.
  The runtime currently assumes dependencies are pre-installed in the execution
  environment.
