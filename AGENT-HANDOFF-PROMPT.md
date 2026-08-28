# Agent Handoff Prompt — agent-meow v0.9.2 Rebuild + E2E Audit

## Objective

Pull the latest code from origin/main, sync the local repo, rebuild the SPA,
start all services, and run a full e2e audit to verify everything works.

## Repository

- **Fork**: JZKK720/agent-meow (origin)
- **NEVER merge from upstream** (omnigent-ai/omnigent) — reference only
- **Local path**: `c:\Users\1\github-pr\agent-meow`
- **Current HEAD**: `44dbd52e5` (revert: restore original VAD wake word button logic)

## Step 1: Pull and Sync

```powershell
cd c:\Users\1\github-pr\agent-meow
git fetch origin
git reset --hard origin/main
git status
```

Verify HEAD matches `44dbd52e5` or later.

## Step 2: Rebuild SPA

The SPA bundle in `agent_meow/server/static/web-ui/` may be stale. Rebuild:

```powershell
cd c:\Users\1\github-pr\agent-meow\web
cmd /c "npx vite build 2>&1"
```

Verify: "built in X.XXs" with 0 errors. Check the new bundle filename:
```powershell
Get-ChildItem "c:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets\index-*.js" | Select-Object Name
```

## Step 3: Start All Services

### 3a. whisper-server (:8001)
```powershell
$whisperExe = "C:\Users\1\github-pr\whisper.cpp\build\bin\Release\whisper-server.exe"
$whisperModel = "$env:APPDATA\agent-meow\voice\models\ggml-large-v3-turbo.bin"
Start-Process -FilePath $whisperExe `
  -ArgumentList "--model",$whisperModel,"--port","8001","--suppress-nst","--no-speech-thold","0.5","--beam-size","5","--no-flash-attn","--language","zh","--prompt","橘宝agent-meow语音工作目录会话" `
  -WorkingDirectory "C:\Users\1\github-pr\whisper.cpp" `
  -WindowStyle Hidden `
  -RedirectStandardOutput "c:\Users\1\github-pr\agent-meow\whisper-vulkan.log" `
  -RedirectStandardError "c:\Users\1\github-pr\agent-meow\whisper-vulkan-err.log"
```
Wait 15s for model load. Verify: `netstat -ano | findstr ":8001" | findstr LISTENING`

### 3b. tts-server (:8891) — may already be running
```powershell
$ttsExe = "C:\Users\1\github-pr\qwentts.cpp\build\Release\tts-server.exe"
$ttsModel = "C:\Users\1\github-pr\qwentts.cpp\models\qwen-talker-1.7b-customvoice-Q8_0.gguf"
$ttsCodec = "C:\Users\1\github-pr\qwentts.cpp\models\qwen-tokenizer-12hz-Q8_0.gguf"
Start-Process -FilePath $ttsExe `
  -ArgumentList "--model",$ttsModel,"--codec",$ttsCodec,"--port","8891","--lang","auto","--codec-chunk-dur","10.0","--max-batch","2" `
  -WorkingDirectory "C:\Users\1\github-pr\qwentts.cpp" `
  -WindowStyle Hidden `
  -RedirectStandardOutput "c:\Users\1\github-pr\agent-meow\tts-vulkan.log" `
  -RedirectStandardError "c:\Users\1\github-pr\agent-meow\tts-vulkan-err.log"
```
Verify: `netstat -ano | findstr ":8891" | findstr LISTENING`

### 3c. Hermes gateway (:8642) — Docker
```powershell
docker start hermes-gateway
```
Wait 15s. Verify: `netstat -ano | findstr ":8642" | findstr LISTENING`

### 3d. agent-meow server (:6767)
```powershell
$RepoRoot = "c:\Users\1\github-pr\agent-meow"
$VenvPython = "$RepoRoot\.venv\Scripts\python.exe"
$hermesKey = (Select-String -Path "$RepoRoot\web\.env" -Pattern "^VITE_HERMES_API_KEY=(.+)$" | Select-Object -First 1).Matches[0].Groups[1].Value
$env:AGENT_MEOW_LOCAL_SINGLE_USER='1'
$env:AGENT_MEOW_BUILTIN_AGENT_DIRS="$RepoRoot\examples\hermes-gateway\config.yaml"
$env:HERMES_VOICE_URL='http://127.0.0.1:8642'
$env:HERMES_BASE_URL='http://127.0.0.1:8642/v1'
$env:HERMES_API_KEY=$hermesKey
$env:QWENTTS_SERVER_URL='http://127.0.0.1:8891'
$env:WHISPER_STT_URL='http://127.0.0.1:8001'
$env:OLLAMA_KEEP_ALIVE='30m'
Start-Process -FilePath $VenvPython `
  -ArgumentList "-m","agent_meow","server","--host","127.0.0.1","--port","6767","--database-uri","sqlite:///$RepoRoot\agent_meow.db" `
  -WorkingDirectory $RepoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput "$RepoRoot\server-native.log" `
  -RedirectStandardError "$RepoRoot\server-native-err.log"
```
Wait 10s. Verify: `Invoke-RestMethod -Uri "http://127.0.0.1:6767/health" -TimeoutSec 5`

**Note**: If port :6767 is in TIME_WAIT state, wait 30-60s for release or kill
the old process: `Get-NetTCPConnection -LocalPort 6767 -ErrorAction SilentlyContinue | Select-Object OwningProcess`

## Step 4: E2E Audit Checklist

### 4a. Service Health
- [ ] `GET http://127.0.0.1:6767/health` → `{"status":"ok"}`
- [ ] `netstat -ano | findstr ":8001 :8891 :8642 :6767" | findstr LISTENING` → all 4 ports

### 4b. SPA Loads
- [ ] Open `http://127.0.0.1:6767/` in browser
- [ ] Landing page shows "What should we do?" heading
- [ ] No console errors (except 409 Conflict from stale sessions — benign)
- [ ] Verify SPA bundle: check `<script src>` in page source matches latest build

### 4c. Landing Page Features
- [ ] "Start voice input" (paw) button visible
- [ ] "Say 橘宝 to wake" chip visible
- [ ] "Attach files" button visible
- [ ] "Voice dictation" button visible
- [ ] "Advanced settings" expandable
- [ ] Surface cards (Images/Videos/Docs) visible
- [ ] Workspace folder selector in sidebar (shows "agent-meow-workspace")

### 4d. Keyboard Shortcuts Dialog
- [ ] Press Ctrl+/ → dialog opens
- [ ] All sections render: General, In chats, Navigation, View, Slash commands
- [ ] Close button works

### 4e. Chat Page
- [ ] Create a new session (type a message, press Enter)
- [ ] Chat page loads with composer
- [ ] Assistant response renders
- [ ] "Read aloud" button visible on assistant message (opacity 60%)
- [ ] Click "Read aloud" → icon changes to PauseIcon, Stop button appears
- [ ] Click Stop → playback stops, icon reverts to Volume2Icon
- [ ] "Copy" button works
- [ ] "Fork from here" button visible

### 4f. Workspace Panel (requires viewport ≥ 768px)
- [ ] Right workspace panel visible
- [ ] "Files" tab visible and clickable
- [ ] Click Files tab → SharedFolderSelector visible (path input + Scan button)
- [ ] "Working folder" header visible
- [ ] File scope radio (Changed | All) visible
- [ ] Search box visible

### 4g. Settings Page
- [ ] Navigate to /settings
- [ ] Appearance section: Mode (System/Light/Dark), Terminal theme, Color theme
- [ ] Font size control works
- [ ] All sections visible: General, Admin, Archived sessions

### 4h. Voice Pipeline Benchmark
Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\bench-voice-pipeline.ps1`
- [ ] All 4 services show UP
- [ ] TTS direct (:8891) < 1000ms
- [ ] TTS via Hermes (:8642) < 5000ms (Edge TTS, cloud)
- [ ] LLM via Hermes (:8642) < 10000ms
- [ ] STT (:8001) produces Chinese text (may show as ??? in terminal — encoding issue)
- [ ] Health (:6767) < 10ms

### 4i. VAD Wake Word (DO NOT MODIFY — working as designed)
- [ ] Click "Say 橘宝 to wake" chip → toggles wake word mode
- [ ] VAD connects in wake-word-only mode (check console logs)
- [ ] Do NOT change wakeWordEnabled condition or voiceListening effect
- [ ] The original logic is correct and was never in the plan to change

## Important Notes

1. **TTS Architecture**: Edge TTS (Xiaoxiao) is PRIMARY, Qwen3-TTS (Serena) is
   FALLBACK. Do NOT swap these — user verified Edge for quality/accuracy.

2. **Wake Word Logic**: The `wakeWordEnabled` condition and `voiceListening` effect
   in NewChatDialog.tsx are working correctly. Do NOT modify them.

3. **Hermes Config**: `tts.provider: edge` in
   `C:\Users\1\github-pr\hermes-agent\data\config.yaml`. Do NOT change to
   `qwen-offline`.

4. **Browser Cache**: After SPA rebuild, the browser may load old cached assets.
   Use cache-busting URL: `http://127.0.0.1:6767/?v=N` (increment N).

5. **PowerShell 5.1**: The `start-native-stack.ps1` script uses `??` operator
   which requires PS7+. Start services manually (as shown above) or use
   `powershell -NoProfile -ExecutionPolicy Bypass -File ...`.

6. **DB Schema**: If agent_meow.db has schema mismatch (revision newer than
   code), back it up and create fresh: `Move-Item agent_meow.db agent_meow.db.bak`

## Files Modified This Session (for reference)

| File | Changes | Status |
|------|---------|--------|
| `web/src/lib/hermesVoice.ts` | isMojibake(), MAX_TTS_AUDIO_BYTES, ？ prosody, redemptionMs 1000 | ✅ Kept |
| `web/src/pages/ChatPage.tsx` | Read-aloud state transitions, Stop button, opacity 60% | ✅ Kept |
| `web/src/shell/NewChatDialog.tsx` | (wake word changes reverted) | ✅ Original restored |
| `web/src/shell/WorkspaceFolderSelector.tsx` | Border for discoverability | ✅ Kept |
| `web/src/shell/FilesPanel.tsx` | Tailwind v4 shorthand cleanup | ✅ Kept |
| `web/src/hooks/useWorkspaceChangedFiles.ts` | available: true when API returns 200 | ✅ Kept |
| `agent_meow/server/voice_proxy.py` | (TTS priority swap reverted) | ✅ Original restored |
| `scripts/start-native-stack.ps1` | --language zh, --prompt, OLLAMA_KEEP_ALIVE | ✅ Kept |
| `scripts/watchdog-native-stack.ps1` | --language zh, --prompt | ✅ Kept |
| `scripts/bench-voice-pipeline.ps1` | New benchmark script | ✅ Kept |
