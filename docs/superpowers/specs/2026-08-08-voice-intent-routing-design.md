# Voice Intent Routing — Design Spec

> **Date**: 2026-08-08
> **Status**: Draft (awaiting user review)
> **Depends on**: Hermes-direct voice pipeline (commits d8854ae2..df3c38d0)

## Problem

The voice pipeline currently treats every utterance as conversational — STT → LLM → TTS → play. But users also want to use voice to **initiate tasks**: "create me a document", "code me a game", "search for youtube contents". These should create a real agent-meow session (like typing into the composer and clicking "Start session"), not just get a spoken reply.

## Solution

Add an intent classification step after STT. The classifier determines whether the utterance is a **chat** (conversational reply) or a **task** (initiate a job). Tasks auto-submit to create a real agent-meow session; chats follow the existing conversational TTS flow.

## Architecture

```
User speaks → STT → transcript
                    │
                    ├── Intent classifier (fast LLM call, ~1-2s)
                    │   Returns: { intent: "chat" | "task", confidence: 0.0-1.0 }
                    │
                    ├── If "chat" → existing flow
                    │   Hermes-gateway session → LLM (stream) → TTS (per phrase) → play
                    │
                    └── If "task" → auto-submit
                        TTS confirmation ("On it!") → handleCreate() → session runs
```

## Components

### 1. Intent Classifier — `web/src/lib/voiceIntent.ts`

A pure async function:

```typescript
export type VoiceIntent = "chat" | "task";

export interface IntentResult {
  intent: VoiceIntent;
  confidence: number; // 0.0 - 1.0
}

export async function classifyIntent(
  transcript: string,
  apiKey: string | null,
  model: string,
): Promise<IntentResult>;
```

**Implementation:**

- POST to `/v1/chat/completions` with `stream: false`
- System prompt: `"Classify the user's utterance. Respond with JSON: {"intent": "chat" or "task", "confidence": 0.0-1.0}. "task" means the user wants to create, code, search, write, build, or open something. "chat" means conversational reply, questions, greetings, or casual talk.`
- User message: the transcript
- Parse JSON response; fall back to keyword detection on parse failure
- Timeout: 3s. On timeout or network error, fall back to `"chat"` (safer)

**Keyword fallback** (used when classifier fails or confidence < 0.6):

- Action verbs in EN: create, code, search, write, make, build, find, open, start, generate, draw, design, implement, fix, debug, refactor, deploy
- Action verbs in ZH: 创建, 写, 搜索, 查找, 生成, 画, 设计, 实现, 修复, 部署, 打开, 开始, 帮我
- If any action verb is present → `"task"`, else → `"chat"`

### 2. Voice Router — `web/src/hooks/useRealtimeVoice.ts` (modified)

In the `transcript.final` handler for `role: "user"`:

```typescript
case "transcript.final":
  if (event.role === "user") {
    setUserTranscript(event.content);
    lastUserTranscriptRef.current = event.content;
    if (voiceSessionIdRef.current && event.content) {
      // Classify intent before routing.
      classifyIntent(event.content, this.apiKey, this.model)
        .then((result) => {
          if (result.intent === "task" && result.confidence >= 0.6) {
            // Emit voice.command event for auto-submit.
            this.emit({ type: "voice.command", content: event.content });
            // TTS confirmation.
            this.synthesize("On it!").then((audio) => { /* play */ });
          } else {
            // Existing chat flow: post to hermes-gateway session.
            postEvent(voiceSessionIdRef.current, { ... });
          }
        })
        .catch(() => {
          // Fall back to chat on classifier failure.
          postEvent(voiceSessionIdRef.current, { ... });
        });
    }
  }
```

**New event type** added to `RealtimeServerEvent`:

```typescript
| { type: "voice.command"; content: string; turnId?: string }
```

**New hook state:**

```typescript
/** The last voice command to auto-submit, or null. */
voiceCommand: string | null;
```

### 3. Auto-Submit — `web/src/shell/NewChatDialog.tsx` (modified)

Add an effect that listens for `voiceCommand` from the hook:

```typescript
useEffect(() => {
  if (realtimeVoice.voiceCommand && !creating) {
    // Set the composer text to the voice command.
    setMessage(realtimeVoice.voiceCommand);
    // Auto-submit after a brief delay so the UI updates.
    setTimeout(() => void handleCreate(), 100);
    // Clear the command so it doesn't re-fire.
    realtimeVoice.clearVoiceCommand();
  }
}, [realtimeVoice.voiceCommand, creating]);
```

**Guard conditions:**

- `!creating` — don't submit if a session is already being created
- `canSubmit` — host, agent, and workspace must be selected (checked inside `handleCreate`)
- If `handleCreate` fails, the transcript stays in the composer for manual submit

### 4. TTS Confirmation — for task mode

When intent is `"task"`, play a short TTS confirmation before auto-submitting:

- Text: `"On it!"` (EN) or `"好的！"` (ZH) — detected via the same CJK regex as `detectVoice`
- Uses existing `synthesize()` + `playAudio()` pipeline
- Plays immediately (~1-2s TTS) so the user gets audio feedback

## Data Flow

### Chat flow (existing, unchanged)

```
1. STT → "你好"
2. Classifier → { intent: "chat", confidence: 0.95 }
3. Post to hermes-gateway session
4. LLM streams → TTS per phrase → play
```

### Task flow (new)

```
1. STT → "create me a document about cats"
2. Classifier → { intent: "task", confidence: 0.92 }
3. TTS confirmation → "On it!" (plays, ~1-2s)
4. voice.command event → NewChatDialog
5. setMessage("create me a document about cats")
6. handleCreate() → POST /v1/sessions → navigate to /c/<session-id>
7. Session runs as normal agent-meow task (agent creates the document)
```

## Error Handling

| Scenario                        | Behavior                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| Classifier timeout (>3s)        | Fall back to `"chat"`                                                   |
| Classifier returns invalid JSON | Fall back to keyword detection                                          |
| Classifier confidence < 0.6     | Fall back to keyword detection                                          |
| No host/agent selected          | Fall back to `"chat"` (can't create session)                            |
| `handleCreate` fails            | TTS: "Sorry, I couldn't start that task". Transcript stays in composer. |
| Empty transcript                | Skip classification, no routing                                         |

## Testing

### Unit tests — `web/src/lib/voiceIntent.test.ts`

- `"你好"` → chat
- `"create a document"` → task
- `"search youtube for cats"` → task
- `"what's the weather"` → chat
- `"帮我写一个游戏"` → task (ZH action verb)
- `"你好，你是谁"` → chat
- Empty string → chat (default)
- Classifier failure → keyword fallback
- Classifier timeout → chat fallback

### Integration test — `web/src/hooks/useRealtimeVoice.test.ts`

- Mock STT → classifier returns "task" → voice.command event emitted
- Mock STT → classifier returns "chat" → postEvent called (existing flow)

### E2E (manual)

- Say "create me a document" → session auto-created, navigates to chat view
- Say "你好" → TTS reply, no session created

## Key Design Decisions

1. **Classifier uses `stream: false`** — we need the full result before routing. Streaming doesn't help for a single-token JSON classification.

2. **Confidence threshold is 0.6** — below this, fall back to keyword detection. Prevents auto-submitting sessions on low-confidence guesses.

3. **TTS confirmation is short** — "On it!" / "好的！" gives instant audio feedback without a long TTS delay. The actual task execution happens in the session, not via TTS.

4. **Task mode creates a real agent-meow session** — not a special "voice session". The task runs exactly like a text-submitted task, appears in the sidebar, and is reviewable later.

5. **The classifier uses the same Hermes gateway** — no new service. It's just another `/v1/chat/completions` call with a classification prompt.

6. **Fallback to `"chat"` on any failure** — safer to converse than to auto-create a session. The user can always manually submit if the classifier misroutes.

## Scope

### In scope

- `web/src/lib/voiceIntent.ts` — new file (classifier + keyword fallback)
- `web/src/lib/voiceIntent.test.ts` — new file (unit tests)
- `web/src/lib/hermesVoice.ts` — add `voice.command` event type
- `web/src/hooks/useRealtimeVoice.ts` — add classification + `voiceCommand` state
- `web/src/shell/NewChatDialog.tsx` — add auto-submit effect

### Out of scope

- Changing the LLM model (staying on qwen3.6:35b per user request)
- Streaming TTS (Tier 2, future work)
- AudioWorklet migration (Tier 5, future work)
- Voice training / custom wake words
- Multi-turn voice commands (e.g., "create a document" → "what about?" → "cats")

## Validation

- **Product**: Say "create me a document about cats" → session auto-created, navigates to chat view, agent starts working. Say "你好" → TTS reply, no session created.
- **Interface**: Landing page voice button → speak command → auto-navigate to chat view. Voice panel shows "Command detected: create me a document..." briefly.
- **System**: `cd web && npx vitest run src/lib/voiceIntent.test.ts` → all tests pass. `cd web && npx vitest run src/hooks/useRealtimeVoice.test.ts` → existing tests still pass.

## Stop conditions

- Stop if the classifier adds more than 3s latency — reduce timeout or switch to keyword-only routing.
- Stop if auto-submit creates sessions with wrong agent/host — add pre-flight validation in `handleCreate`.
- Stop if TTS confirmation interferes with the session's own audio — mute the confirmation if a session is already running.
