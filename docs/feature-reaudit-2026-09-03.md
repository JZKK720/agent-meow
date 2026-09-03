# Agent-Meow 功能再审计报告 — 2026-09-03

**分支**: `feat/040-unified-workspace` @ `fdf11505e` · **方法**: 代码级审计（file:line 取证）+ 实时服务验证（OpenAPI + 端点探针）

---

## 总览判定

| # | 领域 | 判定 | 一句话结论 |
|---|---|---|---|
| 1 | ChatPage 渲染（文本/代码/mermaid/图表/webui/html/python 游戏） | **6/7 达标** | 文本·代码·mermaid·OpenUI·HTML·视频全部可渲染；图表渲染缺失；.py 产物仅下载不可运行；发现 1 处 img 组件接线错误 |
| 2 | Docs — Office-CLI + MarkItDown | **脚手架完整 / 调用即错** | markdown 文档 CRUD ✅；Office 三工具存在但 **schema/dispatch 参数错位 + 内容拉取 bug**，编辑/导出端到端坏；markitdown 单向导入（依赖外部 CLI） |
| 3 | Images 上传/自动打标/关键词搜索/EXIF | **功能实现** | 4 条上传路径 ✅；agent 视觉打标 ✅；FTS5+CLIP RRF 混合搜索 ✅（可降级）；EXIF 徽章+可搜索 ✅；**无按 EXIF 分组的虚拟文件夹**、用户不可手动打标/重命名 |
| 4 | Video 生成（API Key + 工作流） | **3 个 provider 可用** | fal / dashscope / pixelle 均已接线；hyperframes 免费本地兜底（需装 CLI）；当前 **Settings 里 video/image provider = none（未配 key）**；无 in-repo ffmpeg 后处理 |
| 5 | Agents + harness 核心 | **核心全绿** | 24 个 harness 全部注册；工具桥接/审批策略/会话队列/文件桥/子代理/计划任务/MCP/语音唤醒全部实现；10 项已知 TODO（含 antigravity 打断默认关闭、Qwen MCP 桥 TODO） |

---

## 1. ChatPage 渲染能力矩阵

| 内容类型 | 判定 | 实现位置 |
|---|---|---|
| 文本/Markdown/GFM 表格 | ✅ RENDERED | `message.tsx:466` → Streamdown；插件集 `streamdown-security.ts:43-55`（cjk/code/math/mermaid/renderers） |
| 代码块 | ✅ RENDERED | Shiki（lazy `lazyCodePlugin.ts`），换行/复制/下载 UX `message.tsx:400-428` |
| **Mermaid 图** | ✅ RENDERED | `@streamdown/mermaid ^1.0.2`（mermaid 11.15.0），```` ```mermaid ```` 块直接出图 |
| 图表/graphs | ❌ MISSING | 无 chart 依赖；bundle 里 cytoscape 是 mermaid 传递依赖（布局引擎）；React Flow 仅用于 shell 子代理图 `SubagentsGraphView.tsx` |
| WebUI (OpenUI) | ✅ RENDERED（工具白名单门控） | ```` ```openui ```` 围栏 → `openUiBlock.tsx`（React 运行时懒加载）；`genUiTools.ts:16-25` 仅 4 个只读 GET 工具白名单 + same-origin |
| HTML | ✅ RENDERED（三条沙箱路径） | 围栏：DOMPurify + iframe sandbox 无脚本 `htmlRenderer.tsx:141-180`；产物文件：opaque-origin 新标签页 + `allow-scripts` `codeViewerHelpers.ts:279-375`；Electron about:blank 豁免 `popupPolicy.js:71-77` |
| Python 游戏 | ⚠️ PARTIAL | `.py` 产出 → `FileProducedCard` 通用下载 chip（`FileProducedCard.tsx:137-152`）；执行输出仅文本（TerminalCommandCard）；无聊天内运行/预览路径 |
| 视频/音频 | ✅ RENDERED | `BlockRenderer.tsx:153-189` 视频分支；`FileProducedCard.tsx:94-112`；`AudioBlock` 经 ToolCard |

### ⚠️ 发现的接线错误（需修复）
`message.tsx:468-470` 把调用方组件合并时硬编码 `img: ChatImage`，**遮蔽**了 `FILE_PATH_AWARE_COMPONENTS` 里的 `img: ZoomableMarkdownImage`（`BlockRenderer.tsx:189-192`）——视频分支、相对路径重写、灯箱在生产助手路径上不可达；测试因 mock MessageResponse 而未暴露。建议：merge 顺序改为 caller 优先。

---

## 2. Docs — Office-CLI + MarkItDown

### ✅ 今日可用
- markdown 文档 CRUD 全链路（agent 工具 → REST → Tiptap DocEditor，`documents.py:196-330` / `DocEditor.tsx:70-141`）
- 二进制 office 文档**存储往返**（multipart 上传 → ArtifactStore → `GET /binary` 下载；测试 `test_documents_binary.py:70-101`）
- `doc_convert`：文件/URL → markdown（**需本机装 markitdown CLI** — 本机已装 `C:\Users\1\.local\bin\markitdown.exe` ✅）
- PDF/docx 读取（pypdf + python-docx 元数据、页数、摘录 `file_meta_worker.py:201-232`）
- `doc_generate` 结构化草稿（v1 占位实现，文档如实标注）

### ❌ 损坏 / 缺失（按优先级）
1. **三工具 schema/dispatch 参数错位**（调用即错）：
   - `doc_create_office`：schema 要 `format`（docs.py:316），dispatch 读 `filetype`（tool_dispatch.py:3315）→ 永远回退 docx
   - `doc_edit_office`：schema 要 `document_id/command/path`（docs.py:370-371），dispatch 读 `doc_id/operation`（:3359-3362）→ 正确调用也报 missing
   - `doc_export`：schema 要 `mode`（docs.py:506-508），dispatch 读 `format`（:3419）→ 永远出 pdf
2. **编辑/导出内容拉取 bug**：dispatch 读 `doc_data.get("content")`（:3378, :3427），但 API 暴露的是 `content_md`、字节在 `/binary`（documents.py:87-97, 287-313）→ officecli 收到空文件，编辑/导出**端到端失效**
3. **无 markdown→Office 导出**（md→docx 全库无路径；markitdown 仅单向 to-markdown）
4. `doc_convert` 的 `persist` 参数被 dispatch 忽略（docs.py:530-533 vs :3291-3295）
5. **UI 对二进制文档不可见**：`documentsApi.ts:17-30` 丢弃 filename/mime 字段；DocsPanel 无上传/导出/下载入口；二进制文档打开为空编辑器
6. 无 PDF 生成库（reportlab/weasyprint 缺席）；PDF 只能靠 officecli view（受 bug 2 影响）
7. officecli 本机已装（`officecli.exe` ✅）但根 config 无工具段（自动注册 ✅）；**无 e2e 测试**（引用的 `tests/e2e/test_doc_office_flow.py` 不存在）；`len(_DOC_TOOLS)==8` 断言过期（实际 10）

---

## 3. Images 管线

### ✅ 今日可用
- **上传**：4 条路径归一（UI 拖拽/按钮 `ImagesPanel.tsx:100-160`、agent `image_upload` 工具、scan-workspace 导入、image_generate 产物）→ `POST /v1/sessions/{id}/resources/images`
- **自动打标**：agent 自身视觉模型（`image_analyze` → `file_tags` 表，`tool_dispatch.py:4141-4214`）；UI Analyze 按钮发中文提示词驱动（`useFileTags.ts:53-58`）；可选后台 watcher（`AGENT_MEOW_AUTO_TAG`，600s 冷却，批 5）
- **搜索**：`search_files_semantic` = FTS5 trigram bm25（basename+EXIF 相机/日期+尺寸+文档摘录）⊕ CLIP 视觉余弦（`openai/clip-vit-base-patch32`，:8893）经 **RRF k=60** 融合；UI 搜索框 250ms 防抖 → `/resources/file-search?q=…&kind=image`（live 200 ✅）；CLIP 全链路可缺省降级 FTS-only
- **EXIF**：确定性提取（make/model/lens/日期/尺寸/GPS/dHash/256px 缩略图，`file_meta_worker.py:66-165`）；徽章（日期→相机→W×H 优先级）显示在画廊缩略图、搜索命中、文件树行
- 实时验证：`/resources/images` 6 张在线；`/file-search` 200；`/resources/tags` 200（本会话 0 tags）

### ❌ 缺口
- **无按 EXIF 的虚拟文件夹**（FolderTree 镜像真实目录树 `FolderTree.tsx:92-148`；排序仅 alpha/recent/size/type；画廊为扁平最新网格）——"folder by EXIF" 目前仅是徽章+可搜索
- 用户**不能**手动打标/重命名/移动图片（tags 路由只读 `file_tags.py:1-8`；FilesPanel 仅查看/筛选/下载）
- Analyze 打标后用**固定 5s 定时器**失效缓存（应改为回合完成感知）
- AI tags **未进入 FTS body**（v2 遗留，模块注释过时：`sqlalchemy_store.py:292-345`）——标签只能走已弃用的 `search_by_tag`

---

## 4. Video 生成

### ✅ 今日可用（provider 阶梯，`_resolve_video_provider` tool_dispatch.py:3518-3542）
| 优先级 | Provider | 所需 Key/Env | 状态 |
|---|---|---|---|
| 显式 | 任意 | `VIDEO_GEN_PROVIDER` | 覆盖自动检测 |
| 1 | fal | `FAL_KEY` / `VIDEO_GEN_API_URL` | ✅ 已接线（提交+队列轮询；模型默认 wan-2.1-i2v，可 t2v/hunyuan/ltx/veo/kling/minimax/seedance） |
| 2 | pixelle | `PIXELLE_VIDEO_URL` | ✅ 已接线（多场景工作流在网关侧：脚本→图像→TTS→BGM→合成） |
| 3 | dashscope | `DASHSCOPE_API_KEY`（wan2.2-t2v-flash） | ✅ 已接线 |
| 4 | hyperframes | `HYPERFRAMES_BIN` 或 PATH 上有 CLI（免费本地 HTML→MP4） | ✅ 已接线（需本机装 CLI；本机 **未装**） |
| — | happy-horse | — | 桩（"not yet fully wired" :3878） |
| — | openmontage | — | AGPLv3 → 必须以 MCP server 声明 |

- 无 key 时返回**结构化错误**，列出所需 env（:3849-3857）——不崩溃、不静默
- **当前状态（live）**：`GET /v1/settings/media` → `video_provider:"none"`、`video_api_key:""` —— **未配置任何 key**；Settings UI 映射路径已通（`media_settings.py:32-49`）

### ⚠️ 缺口
- fal 默认模型是 i2v 但 payload 只发 `{prompt, aspect_ratio}`——从不传输入图像，i2v 实际未生效（:3900-3903）
- 无 in-repo ffmpeg 后处理（缩略图/裁剪/拼接 deferred，`docs/VIDEOS_SURFACE.md:112`）
- hyperframes 免费兜底需要先安装 CLI（本机缺席）
- 工作流（多镜头编排）依赖 pixelle 网关或外部 openmontage MCP，本体无 ffmpeg 管线

---

## 5. Agents + Harness 核心（omnigent 设计核心）

### ✅ 全部实装（24 harness 注册，`harness_plugins.py:498-618`）
| 家族 | SDK/无头 | Native(tmux) |
|---|---|---|
| Claude / Codex / Pi / Antigravity(Gemini) / Cursor / Kimi / Goose / Hermes / Qwen | ✅ 各 executor | ✅ 各 native executor |
| OpenCode / Kiro | — | ✅ native |
| GitHub Copilot / OpenAI Agents / Open Responses / ACP / Databricks | ✅ | — |

- **工具桥接**：`_NATIVE_RELAY_BUILTIN_TOOLS`（tool_dispatch.py:440-480）+ 每 CLI MCP 桥（claude/codex/cursor/kiro/hermes/antigravity/qwen/goose/ACP）
- **审批/策略**：PermissionsModal + policy 引擎（ALLOW/DENY/ASK，fail-closed）+ `sys_add_policy` 工具
- **会话生命周期**：create/switch/queue-flush（chatStore:1631/2146/1017-1085）、9 个 harness 的原生 interrupt（runner/app.py:11408-12476）
- **文件桥**：upload/download/list + workspace 扫描 + `files.revealed` SSE
- **子代理/fan-out**：`sys_session_send/create` + 路由策略 + 父唤醒重试
- **计划任务**：rrule 校验 + 实时 scheduler + DB 表
- **MCP**：spec → 池 + 每 session 路由
- **语音唤醒**：橘宝 14 词表 + 门控（web 侧完整；Electron app.asar 重打包仍待办）
- **实时验证**：9/9 OpenAPI 端点在位；images 6 项在线；全部资源端点 200

### ⚠️ 核心待办（10 项）
1. interrupt 时不 flush 部分内容/in-flight function_call（app.py:11093 todo，Phase 2）
2. antigravity-native 打断默认**关闭**（rpc.py:83-85）
3. Hermes token 级成本追踪 TODO（forwarder:170）
4. Qwen ACP MCP 桥接 TODO（qwen_executor:1094）
5. happy-horse 视频桩未接线（:3878）
6. 旧 `memory` extra 别名待移除（0.70）
7. Railway 模板未发布（oss-release）
8. Electron app.asar 未重打包（autoplay 修复未进安装包）
9. `doc_convert` persist 未实现
10. `len(_DOC_TOOLS)` 测试断言 8 vs 实际 10

---

## 修复优先级建议

| 优先级 | 项 | 工作量 | 影响 |
|---|---|---|---|
| P0 | Docs 三工具 arg 错位 + content 拉取 bug（2.1+2.2） | ~半天 | Office 生成/编辑/导出从"必错"变"可用" |
| P0 | `message.tsx` img 遮蔽修复（merge 顺序） | 一行 | 聊天图片路径重写/视频/灯箱在生产路径生效 |
| P1 | documentsApi 透传二进制字段 + DocsPanel 上传/下载 | 半天 | 二进制 office 文档 UI 可见可用 |
| P1 | 配置 video/image provider key（Settings 或 env） | 5 分钟/个 | 图像/视频生成激活（fal 或 dashscope） |
| P2 | EXIF 日期分组视图 / tags 入 FTS body / Analyze 改回合感知 | 各 1-2 小时 | 图像体验补完 |
| P2 | md→docx 导出（markitdown 反向无解 → 走 officecli create+add） | 半天 | 文档闭环 |
| P3 | beep 接线、STT 熔断、hyperframes CLI 安装 | 小 | 边缘场景 |

---

*行号对应 `fdf11505e` 快照；实时数据采集于 2026-09-03（:6767 /v1/settings/media + openapi.json 265KB）。*