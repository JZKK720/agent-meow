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
 * Keyword detection only — instant, no network call. The previous LLM-based
 * classifier added 3-5s of pure latency to every voice turn while providing
 * only marginal nuance on ambiguous utterances; measured per-stage timing
 * showed it was a top contributor to perceived voice-reply delay. Keyword
 * detection handles the real-world command vocabulary correctly, and any
 * miss routes to "chat" (a spoken reply) rather than failing silently.
 *
 * @param transcript The user's spoken words (from STT).
 * @param _apiKey Unused (kept for call-site compatibility).
 * @param _model Unused (kept for call-site compatibility).
 * @param _timeoutMs Unused (kept for call-site compatibility).
 * @returns { intent, confidence } — always returns, never throws.
 */
export async function classifyIntent(
  transcript: string,
  _apiKey: string | null,
  _model: string,
  _timeoutMs = 3000,
): Promise<IntentResult> {
  const trimmed = transcript.trim();
  if (!trimmed) return { intent: "chat", confidence: 1.0 };

  const result = keywordClassify(trimmed);
  // Bump task confidence to 0.65 so commands pass the 0.6 gate in
  // processTurn without needing a second opinion.
  if (result.intent === "task") return { intent: "task", confidence: 0.65 };
  return result;
}
