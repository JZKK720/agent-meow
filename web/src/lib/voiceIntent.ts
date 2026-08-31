// Voice intent classifier — determines if a transcript is "chat" or "task".
//
// Used by the voice pipeline to route utterances:
//   "chat"        → conversational TTS reply (existing Hermes-gateway flow)
//   "task"        → auto-submit as a new agent-meow session (handleCreate)
//   "file_search" → direct call to the file-search endpoint (plan 039 P1);
//                   renders a FileResultCard in the chat, no LLM turn.
//
// Primary: fast LLM call to Hermes /v1/chat/completions (stream:false).
// Fallback: keyword detection (action verbs in EN/ZH).

export type VoiceIntent = "chat" | "task" | "file_search";

export interface IntentResult {
  intent: VoiceIntent;
  confidence: number; // 0.0 - 1.0
  /** For file_search, the extracted query string (minus the prefix). */
  fileQuery?: string;
}

// Action verbs that indicate a task command. Bare conversational verbs
// ("write" in "did you write that down?", "make" in "make sure") over-
// matched and routed chat to task mode — the user only ever heard the
// short task confirmation instead of a spoken reply. Keep only verbs
// that are unambiguous commands, or require an object pattern.
const TASK_VERBS_EN = [
  "create", "search for", "find the", "generate", "draw a", "draw an",
  "design a", "design an", "implement", "refactor", "deploy", "debug",
  "set up", "configure", "install", "build a", "build an", "fix the",
  "write a", "write an", "write me", "make a", "make an", "make me",
  "open the", "open a", "run the", "code a", "code an",
];

const TASK_VERBS_ZH = [
  // Unambiguous creation/action verbs — safe to match as substrings.
  "创建", "搜索", "查找", "生成", "部署", "修复", "实现",
  // Verbs that are ALSO common conversational words — require an object
  // pattern (verb + 一个/份/个) so "写一个脚本" is a task but "写好了吗"
  // is chat. Matched as full phrases below, not bare substrings.
  "写一个", "写份", "画一个", "画张", "做个", "做一个", "设计一个",
  "打开", "安装", "配置",
];

// Conversational fillers that must NEVER trigger task mode on their own.
// "帮我看看天气" is chat; only "帮我创建/帮我写一个…" (filler + action
// verb) is a task — handled by requiring an action verb elsewhere in the
// phrase, which the loop below already does.

/** Keyword-based fallback: returns "task" if any action verb is present.
 *  Also checks for explicit file_search prefixes (plan 039 P1). */
function keywordClassify(transcript: string): IntentResult {
  const lower = transcript.toLowerCase();

  // ── file_search prefixes (plan 039 P1) ──────────────────────────
  // Explicit prefixes that unambiguously mean "search local files".
  // The over-match guard: "查询本地天气" must stay chat. We require
  // either an explicit prefix ("search local -", "/find ", "搜本地")
  // or "本地" + a file noun ("文件"/"照片"/"图片"). Bare "查询本地"
  // without a file noun is NOT a file_search — it could be weather,
  // news, etc.
  // EN: "search local - <query>" or "search local <query>"
  const searchLocalMatch = lower.match(/^search\s+local\s+[-:]?\s*(.+)/i);
  if (searchLocalMatch && searchLocalMatch[1].trim()) {
    return { intent: "file_search", confidence: 0.85, fileQuery: searchLocalMatch[1].trim() };
  }
  // Slash command: "/find <query>"
  const findMatch = transcript.match(/^\/find\s+(.+)/i);
  if (findMatch && findMatch[1].trim()) {
    return { intent: "file_search", confidence: 0.9, fileQuery: findMatch[1].trim() };
  }
  // ZH: "搜本地<query>" — "搜" (search) + "本地" (local) is unambiguous.
  const souLocalMatch = transcript.match(/^搜本地\s*(.+)/);
  if (souLocalMatch && souLocalMatch[1].trim()) {
    return { intent: "file_search", confidence: 0.85, fileQuery: souLocalMatch[1].trim() };
  }
  // ZH: "查询本地<file-noun>" / "查找本地<file-noun>" — requires a file
  // noun after 本地 so "查询本地天气" stays chat.
  const fileNouns = ["文件", "照片", "图片", "文档", "资料", "截图"];
  const chaLocalMatch = transcript.match(/^(?:查询|查找|找一下|找)\s*本地(.+)/);
  if (chaLocalMatch) {
    const rest = chaLocalMatch[1];
    if (fileNouns.some((n) => rest.startsWith(n))) {
      const q = rest.replace(new RegExp(`^(${fileNouns.join("|")})`), "").trim();
      return { intent: "file_search", confidence: 0.8, fileQuery: q || rest };
    }
  }

  // ── task verbs ────────────────────────────────────────────────────
  for (const verb of TASK_VERBS_EN) {
    if (lower.includes(verb)) return { intent: "task", confidence: 0.5 };
  }
  for (const verb of TASK_VERBS_ZH) {
    if (transcript.includes(verb)) return { intent: "task", confidence: 0.5 };
  }
  // Conversational filler + explicit action verb = task ("帮我创建一个…").
  // The filler alone ("帮我看看天气") stays chat — the action verbs above
  // didn't match, so we fall through.
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
  // processTurn without needing a second opinion. file_search keeps
  // its high confidence (0.8+) since the prefixes are unambiguous.
  if (result.intent === "task") return { intent: "task", confidence: 0.65 };
  if (result.intent === "file_search") {
    return { intent: "file_search", confidence: result.confidence, fileQuery: result.fileQuery };
  }
  return result;
}
