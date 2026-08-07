// Voice intent classifier — determines if a transcript is "chat" or "task".
//
// Used by the voice pipeline to route utterances:
//   "chat"  → conversational TTS reply (existing Hermes-gateway flow)
//   "task"  → auto-submit as a new agent-meow session (handleCreate)
//
// Primary: fast LLM call to Hermes /v1/chat/completions (stream:false).
// Fallback: keyword detection (action verbs in EN/ZH).

export type VoiceIntent = "chat" | "task";

export interface IntentResult {
  intent: VoiceIntent;
  confidence: number; // 0.0 - 1.0
}

// Action verbs that indicate a task command.
const TASK_VERBS_EN = [
  "create", "code", "search", "write", "make", "build", "find", "open",
  "start", "generate", "draw", "design", "implement", "fix", "debug",
  "refactor", "deploy", "run", "set up", "configure", "install",
];

const TASK_VERBS_ZH = [
  "创建", "写", "搜索", "查找", "生成", "画", "设计", "实现",
  "修复", "部署", "打开", "开始", "帮我", "给我", "做一个", "写一个",
];

/** Keyword-based fallback: returns "task" if any action verb is present. */
function keywordClassify(transcript: string): IntentResult {
  const lower = transcript.toLowerCase();
  for (const verb of TASK_VERBS_EN) {
    if (lower.includes(verb)) return { intent: "task", confidence: 0.5 };
  }
  for (const verb of TASK_VERBS_ZH) {
    if (transcript.includes(verb)) return { intent: "task", confidence: 0.5 };
  }
  return { intent: "chat", confidence: 0.5 };
}

/**
 * Classify a voice transcript as "chat" or "task".
 *
 * Primary: LLM call to Hermes /v1/chat/completions with a classification prompt.
 * Fallback: keyword detection if the LLM call fails, times out, or returns
 * low confidence.
 *
 * @param transcript The user's spoken words (from STT).
 * @param apiKey Hermes API key (bearer token), or null.
 * @param model Hermes model name for the classifier call.
 * @param timeoutMs Max wait time for the LLM call (default 3000ms).
 * @returns { intent, confidence } — always returns, never throws.
 */
export async function classifyIntent(
  transcript: string,
  apiKey: string | null,
  model: string,
  timeoutMs = 3000,
): Promise<IntentResult> {
  const trimmed = transcript.trim();
  if (!trimmed) return { intent: "chat", confidence: 1.0 };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const resp = await fetch("/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              'Classify the user utterance as "chat" or "task". ' +
              '"task" = user wants to create, code, search, write, build, or open something. ' +
              '"chat" = conversational reply, questions, greetings, or casual talk. ' +
              'Respond with JSON only: {"intent": "chat" or "task", "confidence": 0.0-1.0}',
          },
          { role: "user", content: trimmed },
        ],
        stream: false,
        temperature: 0,
        max_tokens: 50,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) return keywordClassify(trimmed);

    const result = await resp.json();
    const content = result.choices?.[0]?.message?.content || "";
    // Extract JSON from the response (may be wrapped in markdown).
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (!jsonMatch) return keywordClassify(trimmed);

    const parsed = JSON.parse(jsonMatch[0]);
    const intent = parsed.intent === "task" ? "task" : "chat";
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));

    // If confidence is low, fall back to keyword detection.
    if (confidence < 0.6) return keywordClassify(trimmed);

    return { intent, confidence };
  } catch {
    // Network error, timeout, or parse failure — fall back to keywords.
    return keywordClassify(trimmed);
  }
}
