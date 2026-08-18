# Deep Research: Surface Toolchain Adoption — 2026-08-15

> Research pass for the three surfaces (Docs / Images / Videos) + headless
> tools/skills/MCPs. Sources: GitHub trending (daily+weekly), repo READMEs,
> Aliyun Model Studio docs, local CLI audit. Tracked in gbrain + graphify.

## 0. Local toolchain audit (verified on this machine)

| Tool                 | Status           | Path                                               |
| -------------------- | ---------------- | -------------------------------------------------- |
| `officecli` v1.0.141 | ✅ installed     | `C:\Users\1\.local\bin\officecli.exe`              |
| `markitdown`         | ✅ installed     | `C:\Users\1\.local\bin\markitdown.exe`             |
| `rembg`              | ✅ installed     | `C:\Users\1\.local\bin\rembg.exe`                  |
| `ffmpeg`             | ✅ installed     | `C:\Users\1\.local\bin\ffmpeg.exe`                 |
| `marp` CLI           | ✅ installed     | `%APPDATA%\npm\marp.ps1` (already used for plans/) |
| Node 24 + npm        | ✅ installed     | `C:\Program Files\nodejs\`                         |
| ComfyUI              | ❌ not installed | local-GPU path, deferred                           |
| markitdown in venv   | ❌               | not needed — runner uses `shutil.which`            |

**Conclusion: the Docs surface toolchain is ALREADY functional** —
`doc_convert` (markitdown) and `doc_create_office`/`doc_edit_office`/`doc_export`
(officecli) can run today; only the runner dispatch + e2e proof remain.

## 1. Docs surface — total document generation

### Already planned (confirmed still correct)

- **OfficeCLI** ([iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI), 28.3k★,
  Apache-2.0) — single self-contained binary, no Office needed. Key capabilities
  beyond basic create/edit:
  - **Built-in HTML rendering engine** — `view html` / `view screenshot` / `watch`
    (live preview at :26315). Gives the agent a render→look→fix loop headlessly.
  - **Template merge** — `officecli merge template.pptx out.pptx --data data.json`
    ({{key}} placeholders; design once, fill N times).
  - **Round-trip dump** — `dump` → replayable batch JSON → `batch` replay.
  - **Built-in MCP server** — `officecli mcp <agent>` (currently unregistered on
    this box — adoption step).
  - **SKILL.md one-liner** — `curl -fsSL https://officecli.ai/SKILL.md` teaches any
    agent the full command set.
- **markitdown** — `doc_convert` backend; also `markitdown-mcp` stdio server as the
  MCP alternative.

### New finds (PPT/HTML generation skills + CLIs)

| Repo                         | Stars  | What it gives us                                                                                    | Adoption                                                         |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **anthropics/skills**        | 169.4k | Official `docx`/`pdf`/`pptx`/`xlsx` skills that power Claude's document features (source-available) | Bundle as host skills under `~/.agents/skills/` or agent bundles |
| **lewislulu/html-ppt-skill** | —      | HTML PPT Studio: 15 deck templates × 36 themes × 31 page layouts, animation runtime, presenter mode | Skill adoption for HTML decks                                    |
| **op7418/guizang-ppt-skill** | —      | Magazine-style web PPT (bundled verbatim in open-design)                                            | Skill adoption                                                   |
| **Marp**                     | —      | Already installed + used (all plans/\*-marp.md)                                                     | Keep as markdown→deck CLI                                        |
| **slidev / reveal.js**       | —      | Alternatives for HTML presentations                                                                 | Optional, Marp suffices                                          |

### anydoc verdict

GitHub search shows **no significant "anydoc" project** — only 0-star clones and
small wrappers around **firecrawl/anydoc** (Firecrawl's Rust document→markdown
converter, e.g. `Mafsolin/anydoc-preview`, a Windows desktop companion). Our
`markitdown` integration already covers document→markdown locally with zero
cloud dependency. **Recommendation: skip anydoc; markitdown is the local-first
equivalent.** If Firecrawl OCR quality is ever needed, `markitdown[az-doc-intel]`
or the firecrawl parse API are the upgrade path.

## 2. Images surface — generation & editing

### Headline find: open-design

**[nexu-io/open-design](https://github.com/nexu-io/open-design)** (86.3k★,
Apache-2.0, v0.19.2, extremely active — 27 releases, 463 contributors).
The open-source Claude Design alternative:

- Generates **prototypes, dashboards, decks, images, video** from a brief +
  `DESIGN.md` design system (151 design systems ship with it).
- **Exports HTML / PDF / PPTX / MP4** — spans all three of our surfaces.
- **100+ functional skills + 277 plugins + design-template catalog**
  (`GET /api/skills`, `GET /api/design-templates`, `GET /api/plugins`).
- **MCP server**: `od mcp install <agent>` — **explicitly supports Hermes**
  (`od mcp install hermes`), plus claude/codex/cursor/copilot/kimi/pi/antigravity
  and BYOK OpenAI-compatible endpoints (works with our Hermes gateway :8642).
- Local-first desktop app (Windows x64 build exists) or Docker
  (`docker compose up -d`, port 7456) or source (Node 24 + pnpm).
- Integrates **HyperFrames** first-class for video.

**Adoption path for agent-meow:** install OD's MCP server into our agent specs'
`tools.mcp_servers:` (stdio), which immediately populates the currently-empty
MCP catalog and gives the images+docs+decks surfaces a real generation engine
without writing provider code.

### "hypergem" → HyperFrames

The name resolves to **[heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)**
(41.0k★, Apache-2.0, v0.7.109): "Write HTML. Render video. Built for agents."

- HTML+CSS+GSAP compositions → **deterministic MP4** via headless Chrome + FFmpeg.
- 20 agent skills (`/hyperframes` router + creation workflows: product-launch,
  faceless-explainer, pr-to-video, motion-graphics, slideshow, music-to-video…).
- Runs fully local (Node 22+ + FFmpeg — both present on this machine).
- **Zero paid API** — this is our free, offline "video generation" path.

### Online generation (China-accessible)

- **DashScope 万相** (researched from official docs):
  - Images: `POST /api/v1/services/aigc/text2image/image-synthesis`
    (`X-DashScope-Async: enable`) → poll `GET /api/v1/tasks/{task_id}` →
    `output.results[0].url` (24h TTL). Models: `wanx2.1-t2i-turbo` (fast),
    `wan2.2-t2i-flash/plus`, `wan2.5-t2i-preview`, `wan2.6-t2i` (new protocol).
  - Key already owned: `~/.config/qwaudio/config.env` (`DASHSCOPE_API_KEY`).
- Local GPU (later): ComfyUI + Vulkan on the Strix Halo 96GB iGPU +
  `Comfy-Org/comfy-mcp`.

### Editing

- `rembg` installed (image_remove_bg works once dispatched).
- Fabric.js canvas editor already in the web UI (image_edit stores JSON).
- OpenCut (83k★, open-source CapCut) — future candidate for a real video editor.

## 3. Videos surface — generation ladder (confirmed + extended)

| Provider          | Status in code          | Verdict                                                           |
| ----------------- | ----------------------- | ----------------------------------------------------------------- |
| `fal`             | ✅ wired (submit+poll)  | Best breadth, pay-per-gen, needs FAL_KEY                          |
| `pixelle`         | ✅ wired                | Free, self-hosted ComfyUI orchestration                           |
| `happy-horse`     | ⚠️ stub (falls through) | Wire or drop                                                      |
| `openmontage`     | MCP-only (AGPLv3)       | Keep external                                                     |
| **`dashscope`**   | ❌ missing              | **ADD** — China-native, key owned (wan2.7-t2v / wan2.2-t2v-flash) |
| **`hyperframes`** | ❌ missing              | **ADD** — free local HTML→MP4, agent-native                       |

DashScope video API (official docs): `POST /api/v1/services/aigc/video-generation/video-synthesis`
→ task_id → poll → `output.video_url`. wan2.7 uses `resolution` (720P/1080P) +
`ratio` (16:9/9:16/1:1) instead of `size`. 1-5 min per generation.
Reference implementation: `aliyun/alibabacloud-aiops-skills` →
`skills/aiml/sfm/alibabacloud-bailian-video-creator/`.

## 4. Other trending finds (parked)

- `google/skills` (18k★) — agent skills for Google products.
- `3b1b/manim` (91k★) — math animation videos (niche video-gen option).
- `unslothai/unsloth` (71k★) — local LLM/diffusion training UI.
- `cathrynlavery/diagram-design` (17k★) — 29 editorial diagram types as HTML+SVG
  (great for docs/diagrams).
- `OpenCut-app/OpenCut` (83k★) — open-source CapCut (future video editing).

## 5. Recommended adoption order

1. **Docs (fastest win — everything installed):** e2e-verify `doc_convert` +
   `doc_create_office`/`doc_export` via runner dispatch; register `officecli mcp`.
2. **DashScope provider** for `image_generate` + `video_generate` (plan 012) —
   online generation with the key we already own.
3. **open-design MCP server** into a built-in agent's `tools.mcp_servers:` —
   populates the MCP catalog + gives design-grade image/deck generation.
4. **HyperFrames** as the free local `video_generate` provider (HTML→MP4).
5. **anthropics document skills** bundled as host skills.
6. ComfyUI + Vulkan local diffusion (needs install, bigger effort).

## 6. Wide comparison sweep (agent-reach + GitHub trending, pass 2)

### Docs / PPTX / HTML generation — full comparison

| Tool                           | Stars  | License                                   | What it is                                                                                                                                                                    | Fit for agent-meow                                                                                                            |
| ------------------------------ | ------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **OfficeCLI** (iOfficeAI)      | 28.3k  | Apache-2.0                                | Single-binary Office suite for agents (.docx/.xlsx/.pptx), HTML render engine, template merge, MCP server                                                                     | ✅ ALREADY INSTALLED + wired in dispatch. Primary Office backend.                                                             |
| **markitdown** (microsoft)     | —      | MIT                                       | any-doc → markdown conversion                                                                                                                                                 | ✅ ALREADY INSTALLED + wired (`doc_convert`).                                                                                 |
| **anthropics/skills**          | 169.4k | Apache-2.0 (+source-available doc skills) | Official `docx`/`pdf`/`pptx`/`xlsx` skills powering Claude's document features                                                                                                | 🎯 Bundle as host skills — free, production-proven PPTX/doc generation knowledge.                                             |
| **nexu-io/html-anything**      | 8.3k   | Apache-2.0                                | Agentic HTML editor: 75 skills × 9 surfaces (magazine/deck/poster/XHS/tweet/prototype/data-report/Hyperframes), zero-API-key (reuses local agent CLIs), WeChat/X/Zhihu export | 🎯 Strong docs-surface partner — its deck + office skills overlap our Docs surface; could run as sibling app or skill source. |
| **nexu-io/open-design**        | 86.3k  | Apache-2.0                                | Open-source Claude Design alternative; prototypes/decks/images/video, HTML/PDF/PPTX/MP4 export, 151 design systems, MCP server (`od mcp install hermes`)                      | 🎯 Primary design-generation integration (see §5.3).                                                                          |
| **slidev** (slidevjs)          | 48.1k  | MIT                                       | Markdown→slides for developers (Vite+Vue), exports PDF/PNG/**PPTX**, ships Claude Code skills + MCP                                                                           | 🎯 PPTX generation alternative to officecli for dev-flavored decks; has native skills.                                        |
| **Marp**                       | —      | MIT                                       | Markdown→HTML/PDF/PPTX deck CLI                                                                                                                                               | ✅ ALREADY INSTALLED + used for all plans/\*-marp.md.                                                                         |
| **guizang-ppt-skill** (op7418) | —      | MIT                                       | Magazine-style web PPT skill                                                                                                                                                  | Bundled verbatim in html-anything/open-design; adopt via them.                                                                |
| **html-ppt-skill** (lewislulu) | —      | MIT                                       | 15 deck templates × 36 themes × 31 layouts                                                                                                                                    | Same — adopt via open-design/html-anything.                                                                                   |
| **kami** (tw93)                | —      | —                                         | Warm-parchment editorial doc style                                                                                                                                            | Via html-anything `doc-kami-parchment`.                                                                                       |
| **pandoc-mcp** (vivekVells)    | —      | —                                         | MCP for pandoc format conversion (MD/HTML/PDF/DOCX)                                                                                                                           | Candidate MCP for `doc_convert` alternative.                                                                                  |

### Image generation/editing — full comparison

| Tool                                 | Stars  | License    | What it is                                                                                                                                       | Fit                                                                                |
| ------------------------------------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Qwen-Image** (QwenLM)              | 8.2k   | Apache-2.0 | 20B MMDiT image model, SOTA Chinese text rendering, Qwen-Image-Edit-2511 (multi-image edit), Qwen-Image-2.0 (infographic/PPT/poster generation!) | 🎯 Local diffusion candidate for Strix Halo (96GB VRAM); also served by DashScope. |
| **DashScope 万相** (wanx/wan2.x-t2i) | cloud  | —          | Async task API, key already owned                                                                                                                | 🎯 Primary online image provider (plan 012).                                       |
| **ComfyUI**                          | 127.6k | GPL-3.0    | Node-based diffusion GUI/API; Qwen-Image day-0 support; Comfy-Org/comfy-mcp                                                                      | Local power path (Vulkan on iGPU); MCP already specced.                            |
| **open-design image gen**            | 86.3k  | Apache-2.0 | gpt-image-2/ImageRouter/custom API image surface, 93 prompt templates                                                                            | Via open-design integration.                                                       |
| **rembg**                            | —      | Apache-2.0 | Background removal CLI                                                                                                                           | ✅ ALREADY INSTALLED + wired (`image_remove_bg`).                                  |
| **Photopea MCP** (attalla1)          | —      | —          | 34 image-editing tools via Photopea                                                                                                              | Candidate MCP for `image_edit_ai`.                                                 |
| **MeiGen-AI-Design-MCP**             | —      | —          | 1,500+ prompt library, multi-provider routing (local ComfyUI/cloud/OpenAI-compat)                                                                | Candidate image MCP.                                                               |
| **unsloth**                          | 71.5k  | —          | Local UI to run/train diffusion models (FLUX etc.)                                                                                               | Parked — training-focused.                                                         |

### Video generation — full comparison (ladder confirmed + extended)

| Provider                     | Stars/Status     | License     | What it is                                                                                                                                                                                  | Fit                                                                                                       |
| ---------------------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **fal.ai**                   | ✅ wired in code | pay-per-gen | Wan2.1/HunyuanVideo/LTX/Veo/Kling/Seedance                                                                                                                                                  | Existing default provider (needs FAL_KEY).                                                                |
| **DashScope wan2.7-t2v**     | cloud, key owned | —           | Async video synthesis API (720P/1080P, 16:9/9:16/1:1)                                                                                                                                       | 🎯 ADD as provider (plan 012) — China-native online fallback.                                             |
| **HyperFrames** (heygen-com) | 41.0k            | Apache-2.0  | HTML+CSS+GSAP → deterministic MP4 (headless Chrome+FFmpeg), 20 agent skills, Node 22+FFmpeg (both installed!)                                                                               | 🎯 ADD as FREE local provider — agent-native, zero API cost.                                              |
| **MoneyPrinterTurbo**        | 103.6k           | MIT         | One-stop short-video generator: topic→script→stock footage→subtitles→BGM→HD video; WebUI/API/CLI/**SKILL.md for agents**; Edge TTS free; Kimi/Qwen/Gemini LLMs; Pexels/Pixabay free footage | 🎯 Strong "finished video" orchestrator (complements raw t2v); has official agent skill; runs on Windows. |
| **Pixelle-Video** (AIDC-AI)  | ✅ wired in code | Apache-2.0  | Topic→finished-video orchestration over ComfyUI                                                                                                                                             | Existing provider.                                                                                        |
| **Wan2.1** (Wan-Video)       | 16.8k            | Apache-2.0  | Open video foundation models (T2V/I2V/VACE/FLF2V), 1.3B runs on 8.19GB VRAM                                                                                                                 | Local diffusion candidate (with LightX2V/TeaCache acceleration).                                          |
| **HunyuanVideo** (Tencent)   | 12.4k            | custom      | 13B open video model, needs 45-60GB VRAM                                                                                                                                                    | Parked — heavy; HunyuanVideo-1.5 newer.                                                                   |
| **happy-horse**              | ⚠️ stub in code  | credits     | 15B unified audio-video transformer                                                                                                                                                         | Wire or drop (currently falls through to error).                                                          |
| **openmontage**              | MCP-only         | AGPLv3      | Multi-pipeline video                                                                                                                                                                        | Keep external per license.                                                                                |
| **OpenCut**                  | 83.2k            | —           | Open-source CapCut                                                                                                                                                                          | Future video EDITING surface.                                                                             |
| **manim** (3b1b)             | 91.1k            | —           | Math/explainer animation engine                                                                                                                                                             | Niche explainer-video option.                                                                             |

### Headless tools / skills / MCPs for agent-meow (cross-surface)

| Find                                                                 | What it gives us                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **officecli mcp**                                                    | Built-in MCP server — register in `tools.mcp_servers:` (fills empty MCP catalog immediately).    |
| **markitdown-mcp**                                                   | stdio MCP alternative for doc_convert.                                                           |
| **od mcp install hermes**                                            | open-design MCP explicitly supports our Hermes harness.                                          |
| **comfy-mcp** (Comfy-Org)                                            | Local ComfyUI control MCP (image+video).                                                         |
| **HyperFrames skills** (`npx skills add heygen-com/hyperframes`)     | 20 video-production skills, SKILL.md convention = directly loadable by our host skill discovery. |
| **MoneyPrinterTurbo SKILL.md**                                       | Official agent skill for one-command video generation.                                           |
| **anthropics document-skills plugin**                                | `/plugin install document-skills@anthropic-agent-skills` pattern; docx/pdf/pptx/xlsx skills.     |
| **slidev skills + MCP**                                              | Native Claude Code plugin + MCP for deck generation.                                             |
| **pandoc-mcp**, **photopea-mcp**, **MeiGen-MCP**, **fal-mcp-server** | Candidate MCP servers for docs/images/video tools.                                               |
| **diagram-design** (cathrynlavery, 17k★)                             | 29 editorial diagram types as self-contained HTML+SVG — docs-surface diagrams.                   |
