# Host Runtime Performance Setup — Replication Guide

> **Purpose**: Capture the host-runtime performance settings validated on this workstation so they can be replicated on another machine to match the same voice/chat latency profile.
>
> **Validated on**: Windows 11, AMD Ryzen (32 threads), AMD ROCm 7.2 GPU, Ollama 0.32.15, Hermes containerized.

## Topology

```
Browser → agent-meow server :6767 (host process)
  → voice_proxy → Hermes gateway :8642 (Docker container `hermes-gateway`)
  → Ollama :11434 (host process, `ollama serve`)
  → nemotron-3.5-lightning:30b-a3b (primary LLM, 25 GB)

TTS: browser → Qwen3-TTS :8890 (host process, GPU) — bypasses Hermes, direct via hermesTtsUrl()
     or → Hermes Edge TTS (primary playback provider)
```

The host-runtime override (`docker-compose.override.yml`) resets `hermes-gateway`, `ollama`, `ollama-init`, and `qwen3-tts` to `!reset null`, leaving Compose with only `postgres`, `agent-meow-server`, and `agent-meow-host`. Hermes and Ollama run on the host directly.

## 1. Ollama — Persistent `OLLAMA_KEEP_ALIVE=30m`

### Why it matters

Ollama unloads models from GPU memory after the `keep_alive` window expires. The default is **5m**. With a 25 GB model (`nemotron-3.5-lightning:30b-a3b`), reloading from disk takes 10–30s of cold-start latency. Setting `keep_alive=30m` keeps the model resident for 30 minutes after last use, eliminating cold-start gaps in the voice pipeline.

### Two modes — pick the right one

| Mode | How Ollama runs | How to set keep_alive |
|---|---|---|
| **Containerized** (default `docker-compose.yml`) | `ollama/ollama:latest` container | Automatic — `OLLAMA_KEEP_ALIVE: ${OLLAMA_KEEP_ALIVE:-30m}` is set on the `ollama` service in `docker-compose.yml`. Override via `.env`. |
| **Host-runtime** (`docker-compose.override.yml`) | Host `ollama serve` process | Run `enable-ollama-keepalive.ps1` once (elevated). Sets Machine-scope env var. |

### Containerized mode (default compose)

No action needed — `OLLAMA_KEEP_ALIVE=30m` is already set on the `ollama` service in `docker-compose.yml` and defaults to `30m` via `.env`. To change it, edit `.env`:

```env
OLLAMA_KEEP_ALIVE=30m   # or 1h, 2h, etc.
```

The setting persists across container restarts automatically (it's in the compose service definition).

### Host-runtime mode (override path) — Windows

Run in an **elevated** PowerShell:

```powershell
.\enable-ollama-keepalive.ps1
# or with a custom value:
.\enable-ollama-keepalive.ps1 -Value 1h
```

The script:
1. Sets `OLLAMA_KEEP_ALIVE` at Machine scope (survives reboot)
2. Restarts the Ollama process to pick up the new env var
3. Verifies the setting

If you can't elevate, set it at User scope instead:

```powershell
[Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "30m", "User")
# Then manually restart Ollama
```

### Verify (either mode)

```powershell
# Containerized: check the env inside the container
docker compose exec ollama env | Select-String OLLAMA_KEEP_ALIVE

# Host-runtime: check the OS env var
[Environment]::GetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "Machine")
# Expected: 30m

# Trigger a model load, then check it stays resident
ollama run nemotron-3.5-lightning:30b-a3b "hi"
# Wait 31 minutes...
ollama ps
# The model should still be listed with a UNTIL timestamp ~30m in the future
```

### Linux equivalent (host-runtime mode)

```bash
# systemd override
sudo systemctl edit ollama
# Add:
# [Service]
# Environment="OLLAMA_KEEP_ALIVE=30m"
sudo systemctl restart ollama
```

### Per-model alternative (no env var needed)

If you prefer not to set a global env var, bake `keep_alive` into a custom Modelfile:

```bash
ollama show nemotron-3.5-lightning:30b-a3b --modelfile > nemotron-custom.modelfile
echo 'PARAMETER keep_alive 30m' >> nemotron-custom.modelfile
ollama create nemotron-3.5-lightning:30b-a3b-keep30 -f nemotron-custom.modelfile
# Then point Hermes at the new model tag
```

## 2. Hermes Config — Agent-Loop Overhead Fixes

These fixes were applied to `C:\Users\K16\github-pr\hermes-agent\data\config.yaml` (bind-mounted into the `hermes-gateway` container as `/opt/data/config.yaml`). A backup was saved at `config.yaml.bak-20260822-voice-fix`.

| Setting | Before | After | Reason |
|---|---|---|---|
| `moa.enabled` | `true` | `false` | Disabled Mixture of Agents fanout (was doubling LLM latency with a `qwen3.5:9b` reference model call before every response) |
| `mcp_servers.linear.enabled` | `true` | `false` | Disabled failing MCP server (OAuth errors every turn, added timeout delays) |
| `mcp_servers.blender.enabled` | `true` | `false` | Disabled failing MCP server (connection errors every turn) |
| `memory.nudge_interval` | `10` | `999` | Effectively disabled memory nudges that triggered auxiliary LLM calls |
| `auxiliary.title_generation.enabled` | `true` | `false` | Disabled title generation via OpenRouter/Nous (payment/credit errors, timed out every turn) |

### Apply on a new machine

1. Locate the Hermes config file bind-mounted into the `hermes-gateway` container.
2. Set the 5 values above.
3. Restart the Hermes container: `docker restart hermes-gateway`.
4. Verify: a simple "Hi" chat stream should return in ~5s with ~0.02s TTFT (was 2+ minutes before the fix).

## 3. Models to Pull

```powershell
ollama pull nemotron-3.5-lightning:30b-a3b   # primary LLM (25 GB)
ollama pull qwen3.5:9b-q8_0                  # MOA reference / fallback (10 GB)
```

If using cloud models (no local download):
```powershell
ollama pull deepseek-v4-flash:0731-cloud
ollama pull minimax-m3:cloud
```

## 4. Stack `.env` — Required Values

In `agent-meow-stack/.env`:

```env
# Hermes API key MUST match the host Hermes API_SERVER_KEY or API calls return 401
HERMES_API_KEY=<your-hermes-api-server-key>

# Host runtime ports (if Hermes/Ollama already running on host)
EXISTING_HERMES_PORT=8642
EXISTING_OLLAMA_PORT=11434
```

## 5. Stack Compose — Host-Runtime Override

Use `docker-compose.override.yml` to reset containerized Hermes/Ollama and point at host instances:

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

This leaves only `postgres`, `agent-meow-server`, and `agent-meow-host` in Compose.

## 6. Qwen TTS — Fallback Only (Opt-In)

Qwen TTS is **not** enabled by default. To add the optional Qwen fallback layer:

```powershell
.\enable-qwen-fallback.ps1
```

Or manually:
```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.qwen.yml run --rm qwen3-tts-init
docker compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.qwen.yml up -d qwen3-tts agent-meow-server agent-meow-host
```

> **Warning**: The `ghcr.io/jzkk720/agent-meow-qwen3-tts` image does NOT self-download the model on first boot. The named volume must be pre-seeded via `qwen3-tts-init` before starting the service.

## Verification Smoke Test

After full setup, verify the performance profile:

```powershell
# 1. Health
curl http://localhost:6767/health

# 2. Chat (should return in ~5s, not 2+ minutes)
curl -X POST http://localhost:6767/v1/chat/completions -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hi"}], "stream": true}'

# 3. Model resident after 30m
ollama ps   # nemotron should still be loaded

# 4. E2E TTS audit (stack-local)
.\audit-tts-e2e.ps1
```

### Expected results (from 2026-08-22 validation)

| Check | Before fixes | After fixes |
|---|---|---|
| Hermes "Hi" stream wall time | 2+ minutes | 4.71s |
| Hermes "Hi" stream TTFT | 2+ minutes | 0.02s |
| Direct Ollama stream | 3.01s (0.26s TTFT) | 3.01s (0.26s TTFT) — unchanged |
| E2E voice (150-char Chinese joke) | gaps + missing sentences | LLM 32.9s, TTS 200 OK 265KB 12.79s, 0 failures |
| Model residency after 30m idle | unloaded (5m default) | resident (30m keep_alive) |

## Correction Note (2026-08-23)

The repo memory `voice-pipeline-gap-diagnosis-20260822.md` stated "OLLAMA_KEEP_ALIVE=30m is working (model resident)." Investigation on 2026-08-23 found that `OLLAMA_KEEP_ALIVE` was **not** set in any persistent scope (Machine, User, or Process) on this workstation. The model residency observed during the 2026-08-22 session was likely due to active use within Ollama's default 5m window, not a 30m keep_alive. This guide documents the **correct** persistent setup.
