# agent-meow

### The agent workspace surface for ColorFire and Meow series AIPC and Laptops.

agent-meow is the agent workspace runtime by 智方云 (Cubecloud), with first-class
Docs, Images, and Voice surfaces. It is derived from Omnigent (Apache-2.0), the
open-source meta-harness for AI agents, extended with three new middleware
surfaces for content work:

- **Docs** — document generation + rich-text editing (Tiptap / ProseMirror kernel)
- **Images** — image file manager + image editing (Fabric.js canvas kernel)
- **Voice** — speech-to-text input (Handy CLI) and text-to-speech output (VibeVoice)

Both Docs and Images are middleware on top of the existing 3-layer runtime
(Server / Runner / Web UI): new session resource types, new builtin agent
tools, and new UI rails. Agents call `doc_generate` / `image_edit` like any
tool; results render in dedicated panels alongside chat, files, terminals,
and sub-agents inherited from Omnigent.

## Quick start

```bash
uv sync --extra dev
uv pip install -e .
meow                          # or: agent-meow / omnigent / omni
open http://localhost:6767
```

```bash
cd web && pnpm i && pnpm dev   # web UI dev
```

> [!NOTE]
> The CLI installs four aliases — `meow`, `agent-meow`, `omnigent`, and `omni` —
> all resolving to the same entry point. `omnigent` / `omni` are retained for
> compatibility; `meow` / `agent-meow` are the Cubecloud brand commands for
> ColorFire and Meow series products. See [docs/REBRAND_AUDIT.md](docs/REBRAND_AUDIT.md)
> for the full rename roadmap.

## What's new vs. upstream Omnigent

| Surface | Backend | UI |
| --- | --- | --- |
| **Docs** | `document` resource type, `document_store`, `/v1/sessions/{id}/resources/documents` routes, `doc_*` builtin tools | `DocsPanel`, `DocEditor` (Tiptap), `/c/:id/docs` route |
| **Images** | `image` resource type, `image_store`, `/v1/sessions/{id}/resources/images` routes, `image_*` builtin tools | `ImagesPanel`, `ImageEditor` (Fabric.js), `/c/:id/images` route |
| **Voice** | `transcribe_audio` (Handy CLI), `text_to_speech` / `speak` (VibeVoice TTS), `transcribe_audio_high_quality` (VibeVoice-ASR) | Mic button (browser STT), Handy global hotkey (offline STT), audio playback (planned) |

## Voice integrations

### Speech-to-text input (Handy)

[Handy](https://handy.computer) is a free, open-source, offline STT desktop
app. Install it, set a global hotkey, and speak into agent-meow's composer —
no cloud, fully private.

```bash
brew install --cask handy          # macOS
winget install cjpais.Handy        # Windows
```

Press the hotkey → speak → text appears in the composer. See
[docs/VOICE_SURFACE.md](docs/VOICE_SURFACE.md) for details.

### Text-to-speech output (VibeVoice)

Serve [VibeVoice](https://github.com/microsoft/VibeVoice) via vLLM, then
agents can call `text_to_speech` / `speak` to synthesize speech:

```bash
vllm serve microsoft/VibeVoice-Realtime-0.5B --port 8000
export VIBEVOICE_TTS_URL=http://127.0.0.1:8000/v1
meow
```

---

## Why agent-meow?

agent-meow inherits Omnigent's meta-harness runtime and adds content surfaces
on top. The inherited runtime lets you:

- **📱 Work with agents from any device, including your phone.** Sessions
  follow you: start in your terminal, continue in the browser, pick it up on
  your phone. Messages, sub-agents, terminals, and files stay in sync.

- **🤖 Supervise multiple agents.** Mix Claude Code, Codex, Cursor, OpenCode,
  Hermes, Pi, and custom agents (defined in YAML) together in the same
  session. Ask one agent to review another's work, or split a task across
  agents that are each good at different things.

- **🔌 Use any model.** A first-party API key, a Claude/ChatGPT subscription,
  or any compatible gateway. All first-class.

- **🤝 Collaborate.** Share a session so teammates can chat with your agent
  and watch it work live, co-drive it on your machine, or fork the
  conversation to continue on their own.

- **☁️ Run agents in cloud sandboxes.** No laptop required: run sessions in
  disposable Modal, Daytona, Islo, E2B, CoreWeave, Kubernetes, OpenShell,
  Boxlite, or Databricks sandboxes, launched from the CLI or provisioned by
  the server per session (*managed hosts*).

- **🛡️ Govern your agents.** Create
  [policies](#6-govern-your-agents-with-policies) to pause for your approval
  before risky actions, cap spend, or limit which tools an agent reaches.
  They apply to the whole server, one agent, or a single chat.

---

## Quick start (detailed)

### 1. Install

agent-meow needs **Python 3.12+** and **Node.js 22 LTS** (for the web UI and
npm-installed harness CLIs).

From a source checkout:

```bash
uv sync --extra dev
uv pip install -e .
```

<details>
<summary>Toolchain and prerequisites</summary>

- **`uv`** (required). https://docs.astral.sh/uv/getting-started/installation/
- **`git`** (required).
- **Node.js 22 LTS or newer** with **`npm`**, for the npm-installed coding
  harnesses (Claude, Codex, OpenCode, Pi). `meow run` installs the
  harness CLI you pick.
  https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- **`tmux`**, required by the native `meow <harness>` terminal wrappers
  (`claude`, `codex`, `cursor`, `hermes`, `kiro`, `pi`)
  (`brew install tmux` / `apt install tmux`).
- **`bubblewrap`** (`bwrap`), **Linux only**. The native terminal wrappers
  wrap each agent terminal in a `bwrap` OS-sandbox; on Linux that isolation
  is mandatory (`apt install bubblewrap`). macOS uses the built-in
  `seatbelt` sandbox and needs nothing extra.

</details>

<details>
<summary>Windows (native)</summary>

agent-meow runs natively on Windows in a degraded mode. Install with `uv`
directly:

```powershell
uv sync --extra dev
uv pip install -e .
```

What works on Windows: `meow server`, the web UI, and the SDK-based
harnesses (`meow run <agent.yaml>` with the claude-sdk / cursor / codex
harnesses). Agents run under a Windows **Job Object** for process-tree
containment.

What is **not** available on Windows (use Linux/macOS, or WSL, for these):

- the native `meow claude` / `meow codex` / `meow cursor`
  tmux/PTY terminal wrappers (run an SDK harness or the web UI instead);
- `bwrap`/`seatbelt` filesystem & network sandboxing and the L7 egress proxy
  — the Job Object backend contains the process tree and enforces resource
  limits but does **not** isolate the filesystem or network.

</details>

<details>
<summary>Updating to a new release</summary>

When a newer release is on PyPI, agent-meow shows a one-line notice (once per
release) pointing here. To update:

```bash
meow upgrade            # detects how you installed, drains & stops the local
                        # server, then runs the matching upgrade command
meow upgrade --check    # just report whether a newer release is available
```

`meow upgrade` waits for in-flight agent sessions to finish before stopping the
local server (pass `--force` to stop them immediately); the next `meow` command
brings the server back up on the new version. Source checkouts update with
`git pull` instead. Silence the notice with `OMNIGENT_NO_UPDATE_CHECK=1`.

> [!NOTE]
> The `OMNIGENT_*` env-var prefix is inherited from Omnigent and retained
> for compatibility. It will be renamed in a follow-up release; see
> [docs/REBRAND_AUDIT.md](docs/REBRAND_AUDIT.md).

</details>

### 2. Start your first agent

`meow` picks a model with you and starts a session in your terminal. It
also launches a local web UI at `http://localhost:6767` that shows the same
session in the browser, or on a phone on your network (step 4).

> [!NOTE]
> The install puts four names for the same CLI on your PATH: `meow`,
> `agent-meow`, `omnigent`, and `omni`. They're interchangeable — `meow` /
> `agent-meow` are the Cubecloud brand commands; `omnigent` / `omni` are
> retained for compatibility.

> [!TIP]
> On first run, agent-meow picks up model credentials already in your
> environment (an `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`, or a `claude` /
> `codex` CLI you're logged into) and offers one as the default.

```bash
meow
```

Or launch a specific agent runtime:

```bash
meow claude                      # Claude Code, in a session your team can join
meow codex                       # Codex
meow cursor                      # Cursor
meow opencode                    # OpenCode
meow hermes                      # Hermes Agent (Nous Research)
meow pi                          # Pi
```

#### 🐙 Polly and 🟠🔵 Debby

Two example agents ship with the repo, and they make good first sessions:

```bash
meow run examples/polly/
meow run examples/debby/

# ...or on a different harness (sub-agents keep their own):
meow run examples/polly/ --harness <harness>
meow run examples/debby/ --harness <harness>
```

**🐙 Polly** is a multi-agent coding orchestrator who writes no code herself.
She's the tech lead: she plans, delegates the work to coding sub-agents
(Claude Code, Codex, or Pi) in parallel git worktrees, then routes each diff
to a reviewer from a different vendor than the one that wrote it. You merge.

**🟠🔵 Debby** is a brainstorming partner with two heads, one Claude and one GPT.
Every question you ask goes to both heads, and she lays the two answers out
side by side. Type `/debate` and the heads critique each other for a few
rounds before converging. (She needs both a Claude and an OpenAI credential;
see step 3.)

**Prefer the browser?** Start a server and register your machine as a host:

```bash
meow server start   # start the local server and web UI in the background
meow host           # (separate terminal) register this machine as a host
```

In the web UI, hit **New Chat**, pick your machine, and go. Check status with
`meow server status`; stop everything with `meow stop`.

### 3. Choose & switch models

```bash
meow setup
```

Add a credential, set a default, or remove one, grouped by agent. agent-meow
works with four kinds of credentials:

| | Kind | What it is |
|---|---|---|
| 🔑 | **API key** | A first-party vendor key for Anthropic, OpenAI, and similar providers |
| 🎟️ | **Subscription** | A Claude Pro/Max or ChatGPT plan, via the official `claude` / `codex` CLIs |
| 🌐 | **Gateway** | Any OpenAI- or Anthropic-compatible `base_url` and key (OpenRouter, LiteLLM, Ollama, vLLM, Azure) |
| 🧱 | **Databricks** | A Databricks workspace profile (requires the `databricks` extra) |

Defaults are per agent, so a Claude default and a Codex default coexist. You
can also switch models in the middle of a session with the `/model` command.

<details>
<summary>Gateway base URLs (OpenRouter, Ollama)</summary>

When you add a **Gateway** credential, `meow setup` asks for a base URL
and a key. The base URL depends on which agent you point it at:

| Provider | For | Base URL | Key |
|---|---|---|---|
| **OpenRouter** | Claude Code | `https://openrouter.ai/api` | your OpenRouter key (`sk-or-…`) |
| **OpenRouter** | Codex / OpenAI agents | `https://openrouter.ai/api/v1` | your OpenRouter key (`sk-or-…`) |
| **Ollama** (local) | Codex / OpenAI agents | `http://localhost:11434/v1` | any value (Ollama ignores it) |

For Claude Code, point at OpenRouter's Anthropic-compatible endpoint
(`…/api`, **not** `…/api/v1`). For Codex and the OpenAI-agents harness, use
the OpenAI-compatible `…/api/v1`.

</details>

### 4. Deploy a server (and use it from your phone📱)

Run agent-meow on a server with a stable URL
([`deploy/README.md`](deploy/README.md) is the full guide) and your sessions
become reachable from anywhere, including your phone. The web UI is built for
mobile, so you get the same chat, sub-agents, terminals, and files, in sync
with your laptop.

One `docker compose up` runs the server on any host you have (a VPS, a home
server); **Render** and **Railway** deploy with one click; **Fly.io**, **Hugging
Face Spaces**, **Modal**, **Cloudflare** (serverless, scale-to-zero), and
**Databricks Apps** (backed by Lakebase Postgres and Unity Catalog Volumes) are
covered too — and a **Cloudflare quick tunnel** (public) or **Tailscale**
(private) reaches a server running on your own laptop without a deploy. The
server can also provision a cloud sandbox per session (*managed hosts*), so no
laptop has to stay online. The full menu of targets, the database options, and
the sandbox setup live in [`deploy/README.md`](deploy/README.md).

Once the server is up, sign in and register your laptop as a host:

```bash
meow login https://your-host    # sign in once; run / attach / host reuse the token
meow host  https://your-host    # new sessions can now run on this machine
```

> [!TIP]
> On your own network you don't need a deploy. Open your machine's LAN
> address on your phone (e.g. `http://192.168.x.x:6767`).

### 5. Collaborate with your team

agent-meow supports **multi-user accounts**, controlled by one environment
variable:

```bash
OMNIGENT_AUTH_ENABLED=1 meow server start
```

> [!NOTE]
> The `OMNIGENT_*` env-var prefix is inherited from Omnigent and retained
> for compatibility. See [docs/REBRAND_AUDIT.md](docs/REBRAND_AUDIT.md) for
> the rename roadmap.

#### Invite your teammates

Open the web UI (`http://localhost:6767` locally, or your host's URL) and
sign in as `admin`; first run prints the password and saves it locally. Then
open **Admin → Members → Invite** to create a single-use invite link, no
email server needed. Send it over; your teammate opens it, sets a password,
and they're in. Signup is invite-only.

> [!NOTE]
> Teammates need to be able to reach the server. A local server is only
> reachable on your network; for anyone off it, deploy an always-on host
> (see [step 4](#4-deploy-a-server-and-use-it-from-your-phone)).

#### Code together

- **Share a live session.** Hit **Share** in the web UI and send the link;
  teammates watch your agent work and chat with it in real time.
- **Co-drive.** A teammate co-attaches to your running session; their
  messages execute on **your** machine. Great for pairing or handing the
  keyboard to a domain expert mid-investigation.

  ```bash
  meow attach <session_id>
  ```

- **Fork.** Clone a conversation onto your own machine and continue
  independently from the fork point.

  ```bash
  meow run --fork <session_id>
  ```

> [!TIP]
> Want your team to sign in with the logins they already have (**Google,
> GitHub, Okta, Microsoft**)? Set `OMNIGENT_OIDC_ISSUER` plus a client ID
> and secret on your deployed server and restart. The full walkthrough,
> domain allowlists, and the proxy-only `header` auth mode are covered in
> [`deploy/README.md#auth`](deploy/README.md#auth).

### 6. Govern your agents with policies

**Policies** decide what an agent may do: run shell commands, edit files,
spend tokens. They check every action and either allow it, block it, or pause
to ask you first.

- **In the web UI**: open a session's info panel to browse the available
  policies and toggle them on or off.
- **In chat**: ask. *"Add a policy that asks me before running shell
  commands."* The agent sets it up for you.

Want defaults that apply to everyone, or to a specific agent? Define them in
your server config or an agent's YAML:

```yaml
policies:
  approve_shell:
    type: function
    handler: omnigent.policies.builtins.safety.ask_on_os_tools   # ask before shell / file writes
  cap_calls:
    type: function
    handler: omnigent.policies.builtins.safety.max_tool_calls_per_session
    factory_params:
      limit: 50                    # cap how many tools one session can call
  budget:
    type: function
    handler: omnigent.policies.builtins.cost.cost_budget
    factory_params:
      max_cost_usd: 5.00           # hard spend cap...
      ask_thresholds_usd: [3.00]   # ...with a soft warning on the way
```

Policies stack across three levels, **server-wide** (admin), **per-agent**
(developer), and **per-session** (you), with the stricter session rules
checked first. Spend caps and access limits ship as builtins.

See the [policy guide](docs/POLICIES.md) for the full catalog and trust model.

---

## Write your own agent

An agent is a short YAML file: your prompt, your tools — local Python
functions, MCP servers, and sub-agents a supervisor can delegate to. You don't
have to write it by hand: agents can build agents, so describe the agent you
want in any agent-meow chat and it authors the file for you.

```yaml
name: my_agent
prompt: You are a helpful data analyst.

executor:
  harness: claude-sdk          # or: claude-native, codex, codex-native, cursor,
                               # cursor-native, hermes, hermes-native, opencode,
                               # pi, pi-native, openai-agents

tools:
  # A local Python function (schema auto-generated from the signature)
  word_count:
    type: function
    callable: mypackage.mymodule.word_count

  # Tools from an MCP server (a local command, or a remote URL)
  docs:
    type: mcp
    url: https://example.com/mcp

  # A sub-agent the supervisor can delegate to
  researcher:
    type: agent
    prompt: Search for relevant information and summarize it.
    tools:
      word_count: inherit
```

Run it with:

```bash
meow run path/to/my_agent.yaml
```

The same file can declare sub-agents and reviewers. For a fuller example, see
Polly at [`examples/polly/`](examples/polly/), and the
[Agent YAML spec](docs/AGENT_YAML_SPEC.md) for the full schema.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to
set up your environment, run the checks, and open a pull request.

---

## Attribution

agent-meow is the agent workspace surface for ColorFire and Meow series AIPC and
Laptops by 智方云 (Cubecloud). This software is derived from Omnigent, licensed
under Apache-2.0. See `LICENSE` and `NOTICE`. The Python package directory
`omnigent/` is retained as a vendored runtime; user-facing strings and the
CLI entry point have been rebranded. See [docs/REBRAND_AUDIT.md](docs/REBRAND_AUDIT.md)
for the full rename roadmap and the list of surfaces still carrying the
upstream name.

## License

Apache-2.0.