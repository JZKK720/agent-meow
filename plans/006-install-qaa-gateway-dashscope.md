# Plan 006: Install QAA Gateway + configure DashScope cloud realtime (online mode)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat ff786767..HEAD -- scripts/ web/src/shell/VoicePanel.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `ff786767`, 2026-08-04

## Why this matters

The #1 user pain is the 90s S2S warmup. DashScope's
`qwen-audio-3.0-realtime-flash` is an always-on cloud S2S model (STT+LLM+TTS
in one WebSocket) with ~0s cold start. Installing QAA + configuring DashScope
gives instant voice with zero local model loading. This is the online half of
the hybrid voice architecture — the offline half (Plan 008) keeps the local
S2S server as a free fallback.

## Current state

- agent-meow's voice stack currently uses a local `speech-to-speech` exe on
  `:8765` with faster-whisper (CPU, 90s warmup) + Hermes + Kokoro TTS.
- The browser connects via `agent_meow/server/routes/s2s_proxy.py` (a
  FastAPI WebSocket proxy) to `web/src/lib/realtimeVoice.ts` (hand-rolled
  transport). Both will eventually be retired (Plan 007) but stay untouched
  here — QAA runs alongside, not as a replacement yet.
- QAA (v1.3.0) is a Node.js realtime voice Gateway. Its `dashscopeProvider`
  uses `openAiCompatibleProtocol` to connect to
  `wss://dashscope.aliyuncs.com/api-ws/v1/realtime`. Verified from QAA
  source: `shared/realtime-provider-catalog.mjs` line 5:
  `DEFAULT_DASHSCOPE_REALTIME_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/realtime'`
- DashScope free quota: 1M tokens (~11h audio), 90-day trial from
  activation. After trial: ~¥0.20/min (~$0.03/min). Enable "免费额度用完即停"
  in the console to avoid surprise bills.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Check Node version | `node --version` | ≥ 22.22.2 |
| Install QAA | `npm install -g qwen-audio-agent` | exits 0, `qwenaudio` on PATH |
| Start QAA Gateway | `qwenaudio` | Gateway at `http://127.0.0.1:3101` |
| Health check | `curl http://127.0.0.1:3101/api/health` | JSON with `ok: true`, `realtimeProvider: "dashscope"` |

## Scope

**In scope** (the only files you should create/modify):
- `~/.config/qwen-audio-agent/config.env` (or `%LOCALAPPDATA%\qwen-audio-agent\config.env` on Windows) — QAA config
- `scripts/start-qaa-gateway.ps1` (create) — boot script for the QAA Gateway

**Out of scope** (do NOT touch):
- `agent_meow/server/routes/s2s_proxy.py` — stays until Plan 007
- `web/src/lib/realtimeVoice.ts` — stays until Plan 007
- `web/src/shell/VoicePanel.tsx` — stays until Plan 007
- Any agent-meow Python or TypeScript source

## Steps

### Step 1: Get a DashScope API key

1. Go to `https://bailian.console.aliyun.com/` (Alibaba Cloud Bailian / DashScope).
2. Sign in with an Alibaba Cloud account (register if needed — free).
3. Navigate to API Key management and create a new API key (starts with `sk-`).
4. Note the key. **Do NOT commit it to any repo file.** It goes only in the
   QAA config.env (which is user-local, not in the repo).
5. In the console, enable "免费额度用完即停" (stop when free quota exhausted)
   to prevent surprise billing after the 90-day trial.

**Verify**: You have a `sk-` prefixed API key string. The console shows
"100万 Token" remaining for `qwen-audio-3.0-realtime-flash`.

### Step 2: Install QAA

```powershell
node --version  # must be ≥ 22.22.2
npm install -g qwen-audio-agent
qwenaudio --help  # verify it's on PATH
```

**Verify**: `qwenaudio --help` prints the command list.

### Step 3: Configure QAA for DashScope

Run `qwenaudio config` — it creates a `config.env` file and prints its path.
Edit the file:

```dotenv
DASHSCOPE_API_KEY=<your-sk-key>
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-flash
AGENT_PROTOCOL=none
```

Also configure the offline provider (for Plan 008, but set it now so both
are advertised):

```dotenv
SPEECH_TO_SPEECH_REALTIME_URL=ws://127.0.0.1:8765/v1/realtime
```

**Verify**: `qwenaudio config` shows both providers. The health endpoint
reports `realtimeProviders` containing both `dashscope` and `speech-to-speech`.

### Step 4: Start the Gateway and verify

```powershell
qwenaudio
```

In another terminal:
```powershell
curl http://127.0.0.1:3101/api/health
```

**Verify**: The health JSON shows:
- `ok: true`
- `realtimeProvider: "dashscope"`
- `realtimeProviders` array contains `dashscope` and `speech-to-speech`
- `voiceConfigured: true`

### Step 5: Smoke-test voice via QAA's built-in web UI

1. Open `http://127.0.0.1:3101` in a browser.
2. Allow microphone access.
3. Click the voice button and say something in Chinese or English.
4. Verify you get a spoken response within ~2s (no 90s warmup).

**Verify**: Voice round-trips in <3s. Both Chinese and English work.

### Step 6: Create a boot script

Create `scripts/start-qaa-gateway.ps1`:

```powershell
# Start the QAA Gateway for agent-meow voice.
# Usage: .\scripts\start-qaa-gateway.ps1
$ErrorActionPreference = "Stop"
Start-Process qwenaudio -WindowStyle Hidden
Write-Host "QAA Gateway started at http://127.0.0.1:3101" -ForegroundColor Cyan
```

**Verify**: Running the script starts a background `qwenaudio` process.
`curl http://127.0.0.1:3101/api/health` returns `ok: true`.

## Done criteria

- [ ] `qwenaudio --help` works (QAA installed)
- [ ] `curl http://127.0.0.1:3101/api/health` returns `ok: true` with
      `realtimeProvider: "dashscope"`
- [ ] Voice round-trips in <3s via QAA's web UI (zh + en)
- [ ] `scripts/start-qaa-gateway.ps1` exists and starts the Gateway
- [ ] No agent-meow source files modified (`git status` shows clean tree
      except the new script)
- [ ] DashScope console has "免费额度用完即停" enabled
- [ ] `plans/README.md` status row updated

## STOP conditions

- `node --version` is < 22.22.2 — install Node 22+ first, then proceed.
- DashScope API key creation fails (region restriction, account issue) —
  report back; the user may need to use a different Alibaba Cloud region.
- QAA's health endpoint reports `realtimeProvider` as something other than
  `dashscope` — the config.env wasn't read; check the file path QAA reported.
- Voice doesn't round-trip within 10s — check the DashScope API key is valid
  and the network can reach `dashscope.aliyuncs.com`.