"use client";

// SessionComposer — the in-session message composer (plan-040 Phase 0,
// Task 4). Extracted verbatim from ChatPage.tsx: textarea, attachments,
// slash-command suggestions menu, "@"-file-mention browser, reply quotes,
// voice dictation chip, and the status shelf / sub-agent tray that frame
// the card. Pure move: identical rendered DOM, identical behavior. The
// single deliberate change is the mic control: the bare ComposerMicButton
// is replaced by ComposerSpeechChip (plan-040 Task 2), which defaults to
// identical mic behavior when no read-aloud state is passed.
//
// ChatPage re-exports Composer / ComposerProps and the shared helpers so
// existing "./ChatPage" import paths keep working.

import {
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpIcon,
  BotIcon,
  ChevronDownIcon,
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  ImageIcon,
  Loader2Icon,
  PaperclipIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { QueuedMessagesStrip } from "@/pages/QueuedMessagesStrip";
import { VoicePawButton } from "@/components/VoicePawButton";
import { validateAttachments } from "@/lib/attachments";
import { isImeCompositionKeyEvent } from "@/lib/ime";
import { splitSentences } from "@/lib/hermesVoice";
import {
  beginReadAloud,
  pauseReadAloud,
  resumeReadAloud,
  setReadAloudAudio,
  setReadAloudError,
  setReadAloudState,
  stopReadAloud,
  subscribeReadAloudState,
  subscribeVoiceActive,
  isVoiceActive,
  type ReadAloudState,
} from "@/lib/readAloudAudio";
import { type Agent } from "@/hooks/useAgents";
import { agentDisplayLabel } from "@/components/AgentInfo";
import { BRAIN_HARNESS_LABELS, useBrainHarnessLabels } from "@/lib/agentLabels";
import type { CodexModelOption, ModelUsage, Session } from "@/lib/types";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useAutoGrowTextarea } from "@/hooks/useAutoGrowTextarea";
import { useDictationInsert } from "@/hooks/useDictationInsert";
import type { Bubble } from "@/lib/renderItems";
import { CLAUDE_NATIVE_MODELS } from "@/lib/claudeNativeModels";
import { findCodexModelOption } from "@/lib/codexNativeModels";
import { composerAttachmentKey, useChatStore } from "@/store/chatStore";
import { nativeCodingAgentForHarness } from "@/lib/nativeCodingAgents";
import {
  buildMentionPreamble,
  detectMentionAt,
  type MentionItem,
  mentionItemPath,
  type MentionState,
  parseMentionToken,
  rankMentionEntries,
} from "@/lib/composerMentions";
import { useMentionBrowser } from "@/hooks/useMentionBrowser";
import { HostBadge } from "@/components/HostBadge";
import {
  BUILTIN_SLASH_COMMANDS,
  isSlashCommandText,
  rankedSlashCommandNames,
  SlashCommandMenu,
} from "@/components/SlashCommandMenu";
import { FileMentionMenu } from "@/components/FileMentionMenu";
import {
  useWorkspaceAllFiles,
  useWorkspaceDirectory,
  type WorkspaceFile,
} from "@/hooks/useWorkspaceChangedFiles";
import { ComposerSpeechChip } from "@/components/ComposerSpeechChip";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { useWakeWordReply } from "@/hooks/useWakeWordReply";
import { searchSessionFiles } from "@/lib/fileIndexApi";
import { useRevealStore } from "@/store/revealStore";
import { IntelligentModelControl, type CostRoutingVerdict } from "@/components/CostRoutingControl";
import { GoalControl, GoalStatusPill, useGoalState, type Goal } from "@/components/goal";

// All chat-column elements must share this width to stay aligned.
export const CHAT_COLUMN_WIDTH = "max-w-3xl min-[1921px]:max-w-4xl min-[2561px]:max-w-5xl";

// Leading whitespace + the command token, so the composer overlay can tint
// just the `/skill` and leave any args in the default color.
const SLASH_COMMAND_SPLIT_RE = /^(\s*)(\/[A-Za-z0-9][\w:-]*)/;

/**
 * Split a slash-command draft into the command token and the rest, for the
 * composer highlight overlay. Returns null when the text isn't a command
 * (callers gate on `isSlashCommandText`, so a returned token is the full
 * command — never a `/etc/hosts`-style path prefix).
 */
export function splitSlashCommand(
  value: string,
): { before: string; token: string; after: string } | null {
  const m = SLASH_COMMAND_SPLIT_RE.exec(value);
  if (!m) return null;
  const [, before, token] = m;
  return { before, token, after: value.slice(before.length + token.length) };
}

// Per-session draft storage — module-level so it survives the Composer
// unmount/remount that happens during the loading gate between session
// switches (ChatPage returns <HydratingPlaceholder /> while
// loadingConversation is true, which unmounts the entire chat surface).
// Text drafts are also persisted to sessionStorage so they survive page
// refreshes; File objects can't be serialized, so only text round-trips.
const SESSION_DRAFTS_KEY = "agent-meow:sessionDrafts";

function loadDraftsFromStorage(): Map<string, { text: string; files: File[] }> {
  try {
    const raw = window.sessionStorage.getItem(SESSION_DRAFTS_KEY);
    if (!raw) return new Map();
    const entries = JSON.parse(raw) as Record<string, string>;
    const map = new Map<string, { text: string; files: File[] }>();
    for (const [id, text] of Object.entries(entries)) {
      if (text) map.set(id, { text, files: [] });
    }
    return map;
  } catch {
    return new Map();
  }
}

function saveDraftsToStorage(drafts: Map<string, { text: string; files: File[] }>): void {
  try {
    const obj: Record<string, string> = {};
    for (const [id, draft] of drafts) {
      if (draft.text) obj[id] = draft.text;
    }
    if (Object.keys(obj).length === 0) {
      window.sessionStorage.removeItem(SESSION_DRAFTS_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_DRAFTS_KEY, JSON.stringify(obj));
    }
  } catch {
    // Storage full or unavailable — drafts still work in-memory.
  }
}

const sessionDrafts = loadDraftsFromStorage();

/**
 * Send text to the Hermes gateway TTS endpoint and play the returned audio.
 * Stops any prior Read-aloud playback before starting the new one.
 *
 * Read aloud is a review feature for past messages — it does NOT interrupt
 * active voice-conversation TTS streaming. Voice TTS is the primary audio
 * and takes priority: when voice TTS starts it stops any active Read-aloud
 * playback (handled in useRealtimeVoice playback.started → stopReadAloud).
 *
 * Best-effort: if Hermes is offline or the request fails, the error is
 * silently swallowed (the button is a convenience, not a critical path).
 */
export async function speakText(text: string): Promise<void> {
  if (!text.trim()) return;
  // Block read-aloud while voice-conversation TTS is active — the two
  // audio systems would overlap. setVoiceActive(true) already calls
  // stopReadAloud(), but this guard prevents starting a new session.
  if (isVoiceActive()) return;
  // Stop any in-flight Read-aloud playback (not voice TTS).
  const abortSignal = beginReadAloud();
  // Set loading state so the button shows a spinner while fetching.
  setReadAloudState("loading");
  const { isCJK, sanitizeForTts } = await import("@/lib/hermesVoice");
  const chinese = isCJK(text);
  const ttsText = sanitizeForTts(text);

  // Split into sentence-sized chunks. maxLen=80 matches the
  // voice-conversation path (splitSentences maxLen=80) — fewer
  // fetch round-trips and gap points than the previous 40.
  const chunks = splitForTts(ttsText, chinese, 80);

  // Prefetch pipeline: fetch chunk N+1 while chunk N is playing.
  // The previous sequential approach (fetch → play → fetch → play)
  // created ~0.4s gaps between every sentence — the fetch time of the
  // next chunk. With prefetching, the next audio is ready before the
  // current one finishes playing, eliminating gaps entirely.
  let nextBlobPromise: Promise<Blob | null> | null = null;
  let failCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    if (abortSignal.aborted) return;
    const chunk = chunks[i];
    if (!chunk.trim()) continue;

    // Use the prefetched blob if available, otherwise fetch this chunk
    const blobPromise = nextBlobPromise ?? fetchChunk(chunk, abortSignal);
    nextBlobPromise = null;

    // Prefetch the NEXT chunk while this one plays
    if (i + 1 < chunks.length && chunks[i + 1].trim()) {
      nextBlobPromise = fetchChunk(chunks[i + 1], abortSignal);
    }

    try {
      const blob = await blobPromise;
      if (abortSignal.aborted) return;
      if (blob) {
        await playReadAloud(blob);
      } else {
        failCount++;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      failCount++;
    }
  }
  // If every chunk failed, show an error state so the user knows the
  // TTS server is down (not just silently doing nothing).
  if (failCount === chunks.filter((c) => c.trim()).length && failCount > 0) {
    setReadAloudError();
    return;
  }
  // All chunks played (or some skipped) — reset state to idle.
  stopReadAloud();
}

/** Fetch a single TTS chunk and return it as a Blob.
 *
 *  Uses the Edge TTS endpoint (/v1/audio/speech/edge) as primary — the
 *  same route hermesVoice.synthesize() uses. The server's voice_proxy
 *  applies _force_edge_voice to set voice=zh-CN-XiaoxiaoNeural, and
 *  falls back to Qwen3-TTS (Serena) when Edge is unreachable (when
 *  QWENTTS_SERVER_URL is configured). This matches the voice pipeline's
 *  TTS routing: Edge primary, Qwen3 fallback. */
async function fetchChunk(chunk: string, abortSignal: AbortSignal): Promise<Blob | null> {
  try {
    // eslint-disable-next-line no-restricted-globals -- TTS is a separate service.
    const res = await fetch("/v1/audio/speech/edge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: chunk,
        voice: "zh-CN-XiaoxiaoNeural",
      }),
      signal: abortSignal,
    });
    if (!res.ok) return null;
    return await res.blob();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return null;
    return null;
  }
}

/**
 * Split text into TTS-sized chunks at sentence boundaries.
 *
 * Thin wrapper around `splitSentences` from hermesVoice — the splitting
 * logic (terminators, maxLen safety net) lives in one place. This
 * function flattens `{sentences, remainder}` into a single array and
 * trims/filters empty chunks for the batch read-aloud path (all text is
 * already complete, so the remainder is included as the final chunk).
 *
 * Qwen3-TTS truncates long input (measured: a 360-char Chinese text
 * returned LESS audio than a 30-char one), so each chunk must stay
 * short. Chunks longer than the cap (no sentence boundary) are
 * hard-split at the cap by `splitSentences`'s maxLen safety net.
 */
export function splitForTts(text: string, _chinese: boolean, maxLen = 80): string[] {
  const { sentences, remainder } = splitSentences(text, maxLen);
  const chunks = [...sentences];
  if (remainder.trim()) chunks.push(remainder);
  const result = chunks.map((c) => c.trim()).filter(Boolean);
  // If nothing survived splitting (e.g. all whitespace), return the
  // original text so the caller gets a non-empty array (speakText
  // checks text.trim() before calling, but this is a safety net).
  return result.length > 0 ? result : [text];
}

/**
 * Decide whether a finished assistant reply should be spoken aloud
 * automatically. Pure (no store/browser reads) so the rules are unit-
 * testable; the ChatPage effect feeds it the live values.
 *
 * The composer mic used to route through the Hermes voice pipeline, which
 * synthesized every reply. Server dictation (whisper/sherpa) replaced that
 * path with a text-only transcript → composer → submit flow, so replies
 * started arriving as silent chat bubbles. This is the voiceback for that
 * path: read a completed reply through the same TTS endpoint the manual
 * "Read aloud" button uses.
 *
 * Suppressed while a voice session is connected — the voice transport posts
 * its turns to the SAME session, so its replies also land as bubbles, and
 * speaking them here would double the audio (the pipeline already speaks
 * them per-sentence).
 */
export function shouldAutoSpeakReply(params: {
  lifecycle: Extract<Bubble, { kind: "assistant" }>["lifecycle"];
  text: string;
  autoSpeakEnabled: boolean;
  voiceSessionActive: boolean;
  alreadySpoken: boolean;
}): boolean {
  if (!params.autoSpeakEnabled) return false;
  if (params.voiceSessionActive) return false;
  if (params.alreadySpoken) return false;
  if (params.lifecycle !== "completed") return false;
  if (!params.text.trim()) return false;
  return true;
}

/** Track read-aloud playback state reactively for the stop button. */
export function useReadAloudState(): ReadAloudState {
  const [state, setState] = useState<ReadAloudState>("idle");
  useEffect(() => subscribeReadAloudState(setState), []);
  return state;
}

/** Track whether voice-conversation TTS is active (blocks read-aloud). */
export function useVoiceActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => subscribeVoiceActive(setActive), []);
  return active;
}

/** Play an audio blob via HTMLAudioElement and register it for stopReadAloud(). */
async function playReadAloud(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  const releaseAudio = setReadAloudAudio(audio);
  // Set playing state so the button shows PauseIcon.
  setReadAloudState("playing");
  // Wait for playback to complete (or error) before resolving.
  // The previous version awaited audio.play() which resolves on
  // playback START — the for loop moved to the next chunk immediately,
  // and setReadAloudAudio() paused the current chunk mid-word (garbling).
  await new Promise<void>((resolve) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      releaseAudio();
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      releaseAudio();
      resolve(); // Resolve, not reject — skip this chunk, continue
    };
    audio.play().catch(() => {
      URL.revokeObjectURL(url);
      releaseAudio();
      resolve(); // play() rejected (e.g. autoplay policy) — skip
    });
  });
}

// Re-exported so ChatPage's AssistantBubble (which calls speakText,
// pause/resumeReadAloud and gates on voice activity) keeps a single source.
// All read-aloud state helpers live here after the move.
export { isVoiceActive, formatEffortLabel, formatStatusEffortLabel };

interface ComposerProps {
  status: "idle" | "streaming";
  /** Local stream OR cross-client `session.status: running`. */
  isWorking: boolean;
  disabled: boolean;
  onSend: (text: string, files?: File[]) => void;
  /**
   * Send a recognised skill as a `slash_command` event (the REPL's wire
   * shape) instead of plaintext. When present and the typed command names
   * a known session skill, `submit()` routes through this; otherwise the
   * command falls through to `onSend` as plaintext. Undefined for
   * native-terminal sessions, which always send `/skill` as plaintext so
   * the vendor TUI loads the skill itself.
   */
  onSendSlashCommand?: (name: string, args: string) => void;
  onStop: () => void;
  agents: Agent[] | undefined;
  agentsLoading: boolean;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  permissionLevel: number | null;
  /**
   * When non-null, the composer is forced read-only and the string is
   * shown as the textarea placeholder. Distinct from
   * ``permissionLevel === 1`` (which means "user has read-only
   * grant") — this captures the "this session structurally can't be
   * interacted with" case: e.g. a claude-native sub-agent whose
   * transcript is mirrored from disk and has no input surface. ``null``
   * leaves the existing ``permissionLevel`` gate alone.
   */
  readOnlyReason: string | null;
  /** Quoted texts to prepend to the next message (one per "Reply ↵" click). */
  replyQuotes: string[];
  /** Removes the quote at the given index without submitting. */
  onRemoveQuote: (index: number) => void;
  /** Clears all quotes (called after submit). */
  onClearAllQuotes: () => void;
  /** Reasoning-effort options to render in `/effort` and the picker dropdown. */
  effortLevels: readonly string[];
  /** Show `/effort` and the Effort picker section. */
  showEffort: boolean;
  /** Whether the picker dropdown should include a Models section. */
  showModels: boolean;
  /** Native model picker family, when present. */
  modelPickerKind: NativeModelPickerKind | null;
  /** Codex app-server model options for codex-native sessions. */
  codexModelOptions: readonly CodexModelOption[];
  /** Show the Codex Plan-mode toggle. */
  showCodexPlanMode: boolean;
  /** Show the session Goal control. */
  showGoalControl?: boolean;
  /**
   * Terminal-first session (Chat/Terminal pill present). Presentation
   * only: tightens the composer's bottom padding to `pb-1.5` so it sits
   * closer to the pill beneath it; non-terminal-first chats use the
   * roomier `pb-3`.
   */
  isTerminalFirst?: boolean;
  /**
   * Native-CLI wrapper session (claude-native / codex-native). Drops the
   * `/model` slash command unless the session also has a model picker
   * (`showModels`); terminal-first SDK sessions (embedded agent-meow REPL
   * terminal) keep it.
   */
  isNativeWrapper?: boolean;
  /**
   * The session's runner is asleep but its host is online (`runner_asleep`):
   * the composer stays enabled and the placeholder nudges the user to send a
   * message, which relaunches the runner on the live host. Ignored while a
   * turn is streaming (the follow-up placeholder wins).
   */
  reconnectHint?: boolean;
  /**
   * The session is host-bound to a dormant resumable managed host that is
   * offline (`host_asleep`): the composer stays enabled, and the placeholder
   * tells the user their next message will resume the sandbox host (which can
   * take a few minutes) so the wake latency is expected, not surprising.
   * Ignored once a turn is streaming.
   */
  sandboxAsleepHint?: boolean;
  /**
   * The session is unreachable (`host_offline` / `local_stranded`): a message
   * can't wake it. The composer is blocked (disabled) and the reconnect
   * banner below is the only affordance.
   */
  unreachable?: boolean;
  /**
   * The session is host-bound to an offline, non-resumable host
   * (`host_offline`): the composer's host badge turns into a clickable
   * "Host is offline — click to reconnect" affordance (see HostBadge's
   * `onReconnect`), replacing the separate banner below the composer.
   */
  hostOffline?: boolean;
  /** Open the reconnect help dialog — wired to the host badge when `hostOffline`. */
  onShowReconnectHelp?: () => void;
  /** Latest parsed advisor verdict for the cost-routing pill; `null`/omitted when none. */
  costRoutingVerdict?: CostRoutingVerdict | null;
  /** Session passes `isCostRoutingSession` (polly orchestrator, not a child); see that predicate. */
  costRoutingEligible?: boolean;
  /**
   * Sub-agent instance label when the active session is a child, e.g.
   * ``"check-account-eligibility"``; ``null``/omitted for top-level
   * sessions. When set, the composer peeks a "Chatting with sub-agent …"
   * tray above the card. See ``subAgentComposerLabel``.
   */
  subAgentLabel?: string | null;
  /**
   * When true, the composer footer renders the docked voice paw
   * (compact VoicePawButton dock variant) between the agent picker and
   * Send. Voice state comes from the composer's own ``useRealtimeVoice``
   * hook; the paw's click connects/disconnects and the transcript flows
   * through the existing dictation pipeline (userTranscript effect).
   */
  showVoicePaw?: boolean;
}

/**
 * Build the full slash-command map for the composer: built-ins
 * first (so they top the menu), then one entry per session skill
 * keyed by ``/${skill.name}``. Insertion order matters — the
 * menu iterates ``Object.entries`` and the user sees built-ins
 * before skills.
 *
 * :param skills: ``Session.skills`` from the snapshot, defaulting
 *     to ``[]`` when the wire field is absent (older servers).
 * :param showEffort: Whether this session supports Web UI effort controls.
 * :param showModel: Whether to include ``/model`` (in-process sessions
 *     and claude-native, which both honor ``conv.model_override``; see
 *     the call site).
 * :returns: Merged ``Record<command, description>``.
 */
export function buildSlashCommandMap(
  skills: ReadonlyArray<{ name: string; description: string }>,
  showEffort: boolean,
  showModel: boolean,
  showCompact: boolean = true,
): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [name, description] of Object.entries(BUILTIN_SLASH_COMMANDS)) {
    if (name === "/effort" && !showEffort) continue;
    if (name === "/model" && !showModel) continue;
    if (name === "/compact" && !showCompact) continue;
    m[name] = description;
  }
  for (const skill of skills) {
    m[`/${skill.name}`] = skill.description;
  }
  return m;
}

/**
 * Set of slash commands that should fill the textarea with
 * ``"/cmd "`` on menu selection rather than executing immediately.
 * Includes the arg-taking built-ins (each gated on its own capability
 * flag) plus every session skill — skills never auto-execute on
 * selection; the user sends them, and :func:`Composer.submit` routes a
 * known skill to a ``slash_command`` event (in-process) or plaintext
 * (native sessions).
 *
 * :param skills: ``Session.skills`` from the snapshot.
 * :param showEffort: Whether ``/effort`` should be selectable.
 * :param showModel: Whether ``/model`` should be selectable (same gate
 *     as :func:`buildSlashCommandMap`'s ``showModel``).
 * :returns: A ``Set`` of slash-prefixed names.
 */
export function buildSlashCommandWithArgsSet(
  skills: ReadonlyArray<{ name: string; description: string }>,
  showEffort: boolean,
  showModel: boolean,
): Set<string> {
  const s = new Set<string>();
  if (showEffort) s.add("/effort");
  if (showModel) s.add("/model");
  for (const skill of skills) s.add(`/${skill.name}`);
  return s;
}

/** Circumference of the progress ring (r=5.5). */
const RING_CIRCUMFERENCE = 2 * Math.PI * 5.5;

/** Circular progress ring showing how much context window is used, with the used percentage beside it. */
function ContextRing({ contextWindow, tokensUsed }: { contextWindow: number; tokensUsed: number }) {
  const pct = Math.min(tokensUsed / contextWindow, 1);
  // Arc, %, label, and tooltip all encode context USED: a fresh session
  // shows an empty ring at 0% and the ring fills as context is consumed.
  const usedArc = pct * RING_CIRCUMFERENCE;
  const usedPct = Math.round(pct * 100);

  const color =
    pct > 0.8 ? "text-destructive" : pct > 0.6 ? "text-warning" : "text-muted-foreground";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("flex items-center gap-1.5", color)}
          aria-label={`${usedPct}% of context used`}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
            {/* Track */}
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            {/* Used arc — skipped at 0, where round linecaps would still paint a dot. */}
            {usedArc > 0 && (
              <circle
                cx="8"
                cy="8"
                r="5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${usedArc} ${RING_CIRCUMFERENCE}`}
                transform="rotate(-90 8 8)"
              />
            )}
          </svg>
          <span className="text-xs tabular-nums" aria-hidden="true">
            {usedPct}%
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-44 text-center text-xs">
        <p className="tabular-nums">{usedPct}% of context used.</p>
      </TooltipContent>
    </Tooltip>
  );
}

/** Format a token count for compact display (e.g. 12500 → "12.5K"). */
function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Format a USD cost for compact display (e.g. 0.0321 → "$0.03"). */
function formatCost(usd: number): string {
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  if (usd >= 0.01) return `$${usd.toFixed(2)}`;
  if (usd > 0) return `$${usd.toFixed(4)}`;
  return "$0";
}

/** Verbose token usage meter — shows token count + cost with per-model tooltip. */
function TokenUsageMeter({
  tokensUsed,
  sessionCostUsd,
  sessionUsageByModel,
}: {
  tokensUsed: number | null;
  sessionCostUsd: number | null;
  sessionUsageByModel: Record<string, ModelUsage> | null;
}) {
  if (tokensUsed == null || tokensUsed === 0) return null;

  // Build the compact label: "12.5K tokens · $0.03"
  const parts: string[] = [`${formatTokenCount(tokensUsed)} tokens`];
  if (sessionCostUsd != null && sessionCostUsd > 0) {
    parts.push(formatCost(sessionCostUsd));
  }
  const label = parts.join(" · ");

  // Build per-model breakdown for the tooltip
  const modelLines: string[] = [];
  if (sessionUsageByModel) {
    for (const [model, usage] of Object.entries(sessionUsageByModel)) {
      const total = usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
      if (total === 0) continue;
      const inT = usage.inputTokens != null ? formatTokenCount(usage.inputTokens) : "?";
      const outT = usage.outputTokens != null ? formatTokenCount(usage.outputTokens) : "?";
      const cost =
        usage.totalCostUsd != null && usage.totalCostUsd > 0
          ? ` · ${formatCost(usage.totalCostUsd)}`
          : "";
      modelLines.push(`${model}: ${inT} in + ${outT} out${cost}`);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-xs tabular-nums text-muted-foreground" aria-label={label}>
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-72 text-xs">
        {modelLines.length > 0 ? (
          <div className="space-y-0.5">
            <p className="font-medium">Per-model usage</p>
            {modelLines.map((line) => (
              <p key={line} className="tabular-nums text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="tabular-nums">{label}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Model label for the composer status tray.
 *
 * @param model - Model override or bound agent model id.
 * @param codexModelOptions - Codex-returned model metadata, when available.
 * @returns Codex's display label for known Codex models, a local Claude alias
 *   label for Claude native tiers, the raw model id otherwise, or ``null``
 *   when no model is known.
 */
export function formatStatusModelLabel(
  model: string | null,
  codexModelOptions: readonly CodexModelOption[] = [],
): string | null {
  const raw = model?.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const codexOption = findCodexModelOption(codexModelOptions, raw);
  if (codexOption) return codexOption.displayName ?? codexOption.id;
  const known = CLAUDE_NATIVE_MODELS.find((m) => m.id === lower);
  if (known) return known.label;
  return raw;
}

/** Title-case an effort level for the trigger pill (``"high"`` → ``"High"``). */
function formatEffortLabel(effort: string): string {
  return effort.charAt(0).toUpperCase() + effort.slice(1);
}

function formatStatusEffortLabel(effort: string | null, raw = false): string | null {
  if (!effort) return null;
  if (raw) return effort;
  return effort.toLowerCase() === "xhigh" ? "xHigh" : formatEffortLabel(effort);
}

/**
 * Compose the current model and effort for the composer status tray.
 *
 * @param model - Model override or bound model id.
 * @param effort - Current reasoning effort override, if any.
 * @returns Compact label such as ``"gpt-5.5 xhigh"``.
 */
export function formatModelEffortStatusLabel(
  model: string | null,
  effort: string | null,
  codexModelOptions: readonly CodexModelOption[] = [],
): string | null {
  const codexOption = model ? findCodexModelOption(codexModelOptions, model.trim()) : null;
  const modelLabel = formatStatusModelLabel(model, codexModelOptions);
  const effortLabel = formatStatusEffortLabel(effort, codexOption !== null);
  const parts = [modelLabel, effortLabel].filter((p): p is string => p != null && p.length > 0);
  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Identity label for the composer status tray: which harness/agent is
 * running this session. Native vendor wrappers read as the bare vendor
 * name ("Claude" / "Codex"); SDK/bundle agents read as the agent name
 * with the brain harness in parens ("Polly (Pi)"). This moved OUT of the
 * picker trigger (which now shows model/effort) — the trigger is the
 * model/effort control, so the harness identity belongs in the read-only
 * shelf below.
 *
 * @param modelPickerKind - Native picker family, when the session is a
 *   claude-/codex-/cursor-native wrapper.
 * @param agentName - Bound agent name (lowercase slug), if any.
 * @param sessionHarness - Effective brain harness id (override-aware).
 * @returns Display label, or ``null`` when nothing is known.
 */
export function composerHarnessLabel(
  modelPickerKind: NativeModelPickerKind | null,
  agentName: string | null | undefined,
  sessionHarness: string | null,
  harnessLabels: Record<string, string> = BRAIN_HARNESS_LABELS,
): string | null {
  if (modelPickerKind === "claude") return "Claude";
  if (modelPickerKind === "codex") return "Codex";
  if (modelPickerKind === "cursor") return "Cursor";
  if (modelPickerKind === "kiro") return "Kiro";
  if (modelPickerKind === "opencode") return "OpenCode";
  const display = agentName ? agentDisplayLabel(agentName) : null;
  const harness = sessionHarness ? (harnessLabels[sessionHarness] ?? null) : null;
  if (display && harness) return `${display} (${harness})`;
  return display ?? harness;
}

/**
 * Status-line tray tucked behind the composer card: the worktree branch
 * on the left (truncated to an ellipsis so the tray never wraps), the
 * model/effort + context ring on the right. Shares the card's background so the two
 * read as one rounded shape: the card keeps its full rounded-2xl and
 * paints on top (it's position:relative), while this in-flow sibling is
 * pulled up behind it so a rounded shelf peeks out below the card's
 * bottom edge — the card's own bottom border is the divider. Owns the
 * visibility guards so an empty tray never renders — no dead shelf when
 * the session has nothing to report. Session cost lives in the header
 * agent-info popover (the "i" button), not here.
 */
function ComposerStatusLine({
  harnessLabel,
  goal,
  isSubAgentSession,
  onHostReconnect,
}: {
  harnessLabel: string | null;
  goal: Goal | null;
  isSubAgentSession: boolean;
  /**
   * When set (`host_offline` liveness), the host badge becomes a clickable
   * "Host is offline — click to reconnect" affordance. Also forces the tray
   * to render even when it would otherwise be empty, so the prompt is always
   * visible for an unreachable host.
   */
  onHostReconnect?: () => void;
}) {
  const conversationId = useChatStore((s) => s.conversationId);
  const contextWindow = useChatStore((s) => s.contextWindow);
  const tokensUsed = useChatStore((s) => s.tokensUsed);
  const sessionCostUsd = useChatStore((s) => s.sessionCostUsd);
  const sessionUsageByModel = useChatStore((s) => s.sessionUsageByModel);
  const codexPlanMode = useChatStore((s) => s.codexPlanMode);
  // Seeded from the session snapshot on bind (chatStore.sessionBindingPatch),
  // alongside contextWindow — so the branch reads from the same store as
  // the other status-line values rather than a separate fetch.
  const gitBranch = useChatStore((s) => s.gitBranch);

  const showBranch = !!conversationId && !!gitBranch;
  // Host indicator (green/red dot + host name), left of the worktree branch.
  // Hidden on sub-agent sessions — the header's child-session slot owns the
  // back affordance there, mirroring where this badge used to live. HostBadge
  // self-hides when the session isn't host-bound, so this is a visibility gate,
  // not a host-presence claim.
  const showHost = !!conversationId && !isSubAgentSession;
  // The harness/agent identity (e.g. "Claude", "Polly (Pi)") lives here now;
  // the picker trigger above owns the model/effort label since it's the
  // control that changes them.
  const showHarness = !!conversationId && harnessLabel !== null;
  const showPlanMode = !!conversationId && codexPlanMode;
  const showGoal = !!conversationId && goal != null;
  // contextWindow > 0: the SSE path validates it but the snapshot path doesn't, and 0/0 → "NaN%".
  const showRing =
    !!conversationId && contextWindow != null && contextWindow > 0 && tokensUsed != null;
  // The offline-host reconnect affordance lives in the host badge, so the tray
  // must render even when every other slot is empty (an unreachable session
  // often has no branch/ring/harness yet). Gated by `showHost`: only host-bound
  // sessions can be `host_offline`, and sub-agents (which hide the badge) are
  // never host-bound — a stranded child is `local_stranded`, which keeps its
  // banner elsewhere.
  const showReconnect = showHost && !!onHostReconnect;
  if (!showBranch && !showPlanMode && !showGoal && !showRing && !showHarness && !showReconnect)
    return null;

  return (
    <div
      data-testid="composer-status-line"
      className={cn(
        // -mt-4 slides the tray's square top corners up behind the card
        // (the 16px overlap exceeds the card's ~14px corner radius, so
        // they hide behind its straight sides); pt-5.5 (= --spacing *
        // 5.5) re-reserves the hidden region so the content sits below
        // the card's edge. bg-tray/40 (not bg-card) keeps it out of the
        // dark-mode glass rule — bg-card here would re-decorate the tray
        // with its own border/shadow, duplicating the composer's chrome —
        // and matches the home composer's footer tray surface.
        "mx-auto -mt-4 flex w-full items-center gap-3 rounded-b-2xl bg-tray/40 px-4 pb-1.5 pt-5.5",
        CHAT_COLUMN_WIDTH,
      )}
    >
      {/* Left: host badge then worktree branch. Always holds the flex-1 slot
          so the right cluster stays pinned right even when both are absent;
          each item truncates to an ellipsis so the tray never wraps. */}
      <div className="flex min-w-0 flex-1 items-center gap-3 text-xs text-muted-foreground">
        {showHost && conversationId && (
          <HostBadge sessionId={conversationId} onReconnect={onHostReconnect} />
        )}
        {showBranch && (
          <span className="flex min-w-0 items-center gap-1.5">
            <GitBranchIcon className="size-3.5 shrink-0" />
            <span data-testid="composer-git-branch" className="min-w-0 truncate" title={gitBranch}>
              {gitBranch}
            </span>
          </span>
        )}
      </div>
      {/* Right: model/effort and context ring, never shrinks. */}
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        {showPlanMode && (
          <span
            data-testid="composer-plan-mode"
            className="inline-flex items-center gap-1 text-xs font-medium text-foreground"
          >
            <FileTextIcon className="size-3.5 shrink-0" />
            <span>Plan mode</span>
          </span>
        )}
        {showGoal && goal && <GoalStatusPill goal={goal} />}
        {showHarness && harnessLabel && (
          <span
            data-testid="composer-harness"
            className="max-w-36 truncate text-xs text-muted-foreground sm:max-w-52"
            title={harnessLabel}
          >
            {harnessLabel}
          </span>
        )}
        {showRing && <ContextRing contextWindow={contextWindow} tokensUsed={tokensUsed} />}
        {showRing && (
          <TokenUsageMeter
            tokensUsed={tokensUsed}
            sessionCostUsd={sessionCostUsd}
            sessionUsageByModel={sessionUsageByModel}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Resolve the sub-agent instance label for the composer's "Chatting with
 * sub-agent …" tray, mirroring the Agents rail's child-row label
 * (``childPrimaryLabel`` in ``SubagentsPanel``).
 *
 * The spawn tool seeds a sub-agent's title as ``"{tool}:{name}"`` (e.g.
 * ``"claude_code:check-account-eligibility"``), so the human instance name
 * is the suffix after the first ``":"``. User-added rows carry a reserved
 * ``"ui:<agent>:<name>"`` sentinel; the ``"ui:"`` marker is stripped first
 * so the suffix is still the human name. Falls back to the bare title,
 * then the sub-agent type, then the bound agent name.
 *
 * @param session - The active session snapshot, or ``null`` while it loads
 *   / on the new-chat landing.
 * @returns The tray label, e.g. ``"check-account-eligibility"``; ``null``
 *   for a top-level session (no ``parentSessionId``) or when no snapshot is
 *   loaded — both hide the tray.
 */
export function subAgentComposerLabel(
  session: Pick<Session, "parentSessionId" | "title" | "subAgentName" | "agentName"> | null,
): string | null {
  if (!session || session.parentSessionId == null) return null;
  // Strip the user-added "ui:" sentinel so its "agent:name" suffix reads
  // like an LLM-spawned title.
  let title = session.title ?? null;
  if (title?.startsWith("ui:")) title = title.slice(3);
  if (title?.includes(":")) {
    const suffix = title.split(":").slice(1).join(":");
    if (suffix) return suffix;
  }
  // Last-resort display string: a sub-agent session always has a seeded
  // title in practice, so the final "sub-agent" only guards a degenerate
  // all-null snapshot (the tray still needs something to render).
  return title ?? session.subAgentName ?? session.agentName ?? "sub-agent";
}

/**
 * Peeking tray tucked behind the composer's top edge while the active
 * session is a sub-agent (child) — names the sub-agent the message is going
 * to, so the composer reads as "messaging the sub-agent", not the
 * orchestrator. Mirrors ``ComposerStatusLine`` (the worktree/context shelf
 * below the card) but rises above it: ``-mb-4`` slides the tray's square
 * bottom corners down behind the card (the 16px overlap exceeds the card's
 * ~14px corner radius, hiding them behind its straight sides) and ``pb-5.5``
 * re-reserves the hidden region so the label sits above the card's top edge.
 * The card is ``position:relative`` and paints on top, so its own top border
 * is the divider. Brand pink (``brand-accent``) marks this as a sub-agent
 * context cue, not a status.
 *
 * @param label - The sub-agent instance name, e.g.
 *   ``"check-account-eligibility"`` (from ``subAgentComposerLabel``).
 */
function SubagentComposerTray({ label }: { label: string }) {
  return (
    <div
      data-testid="composer-subagent-tray"
      className={cn(
        "mx-auto -mb-4 flex w-full items-center gap-1.5 rounded-t-2xl bg-brand-accent/10 px-4 pt-1.5 pb-5.5 text-xs text-brand-accent",
        CHAT_COLUMN_WIDTH,
      )}
    >
      <BotIcon className="size-3.5 shrink-0" aria-hidden="true" />
      {/* truncate so a long sub-agent name never wraps the tray to two rows */}
      <span className="min-w-0 truncate">
        Chatting with sub-agent <strong className="font-semibold">{label}</strong>
      </span>
    </div>
  );
}

export type { ComposerProps };

/** Native model picker family, when the session is a native wrapper. */
export type NativeModelPickerKind = "claude" | "codex" | "cursor" | "kiro" | "opencode" | "pi";

/**
 * The message-input composer: textarea, attachments, slash-command
 * suggestions menu, and the send/stop controls. Exported for direct
 * unit testing of the slash-command keyboard behavior.
 *
 * `SessionComposer` is the plan-040 seam name; `Composer` is the
 * original ChatPage export name (kept for its existing importers).
 */
export const SessionComposer = Composer;

export function Composer({
  status,
  isWorking,
  disabled,
  onSend,
  onSendSlashCommand,
  onStop,
  agents,
  agentsLoading,
  selectedAgentId,
  onSelectAgent,
  permissionLevel,
  readOnlyReason,
  replyQuotes,
  onRemoveQuote,
  onClearAllQuotes,
  effortLevels,
  showEffort,
  showModels,
  modelPickerKind,
  codexModelOptions,
  showCodexPlanMode,
  showGoalControl = false,
  isTerminalFirst = false,
  isNativeWrapper = false,
  reconnectHint = false,
  sandboxAsleepHint = false,
  unreachable = false,
  hostOffline = false,
  onShowReconnectHelp,
  costRoutingVerdict = null,
  costRoutingEligible = false,
  subAgentLabel = null,
  showVoicePaw = false,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const dictation = useDictationInsert(setValue);
  const { playReply } = useWakeWordReply();
  const handleWakeWordRef = useRef<() => void>(() => {});
  handleWakeWordRef.current = () => {
    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      hermesVoice.pauseVad();
    });
    void playReply().then(() => {
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        if (hermesVoice.getState() !== "connected") {
          hermesVoice.resumeVad();
          return;
        }
        hermesVoice.stopWakeWordModeForTurn();
        hermesVoice.resumeVad();
      });
    });
  };
  // Hermes voice session — same hook as the landing page paw-mic.
  // userTranscript feeds the composer as the user speaks.
  const realtimeVoice = useRealtimeVoice({
    onWakeWord: () => handleWakeWordRef.current(),
  });
  // Read-aloud playback state — used to disable the dictation mic while
  // auto-speak TTS is playing (the chat stream completes before audio drains).
  const readAloudState = useReadAloudState();
  useEffect(() => {
    if (realtimeVoice.userTranscript) dictation.replaceInterim(realtimeVoice.userTranscript);
    else if (realtimeVoice.state !== "connected") dictation.replaceInterim("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeVoice.userTranscript, realtimeVoice.state]);

  // Voice command auto-submit: when the intent classifier detects a "task"
  // command during a voice session, set the composer text and auto-submit.
  // This mirrors NewChatDialog's voiceCommand handling — without it, the
  // dictated text sits in the composer and the user must manually press Send,
  // breaking the hands-free flow. The session already exists (we're in
  // ChatPage), so submit() sends the message to the current conversation.
  // submitRef is assigned inside submit() itself (below) to avoid
  // block-scoped use-before-declaration.
  const submitRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (realtimeVoice.voiceCommand) {
      const cmd = realtimeVoice.voiceCommand;
      setValue(cmd);
      realtimeVoice.clearVoiceCommand();
      // Auto-submit after a brief delay so the value state settles.
      const timer = setTimeout(() => {
        submitRef.current();
      }, 150);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeVoice.voiceCommand]);

  // Voice file-search (plan 039 P1): a "search local -"/"搜本地" intent hits
  // the session's FTS5 index directly (no LLM turn) and reveals the hits in
  // the right rail via the revealStore — AppShell's effect drains it with
  // setRightRailTab + openFileViewer. Mirrors the voiceCommand auto-submit
  // above; the search endpoint does the ranking.
  const voiceFileSearchConvId = useChatStore((s) => s.conversationId);
  useEffect(() => {
    const q = realtimeVoice.voiceFileSearch;
    if (!q || !voiceFileSearchConvId) return;
    realtimeVoice.clearVoiceFileSearch();
    let cancelled = false;
    const convId = voiceFileSearchConvId;
    void searchSessionFiles(convId, q)
      .then((hits) => {
        if (cancelled || hits.length === 0) return;
        const tab = hits.every((h) => h.kind === "image") ? "images" : "files";
        useRevealStore.getState().reveal(convId, {
          paths: hits.map((h) => h.path),
          tab,
          query: q,
        });
        // Re-trigger the drain: AppShell's effect keys on conversationId,
        // which doesn't change here — nudge it with a custom event.
        window.dispatchEvent(new CustomEvent("files-reveal-queued"));
      })
      .catch(() => {
        // A failed search (no index / server without the route) falls back
        // to a normal spoken chat turn by leaving the composer untouched.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeVoice.voiceFileSearch, voiceFileSearchConvId]);
  const handleHermesVoice = () => {
    // Toggle the Hermes voice pipeline. The transcript flows back via the
    // realtimeVoice hook -> dictation above.
    //
    // Bind the CURRENT conversation before connecting: with no agent-meow
    // session on the transport, chatStream() talks to Hermes directly, so
    // the turn never enters this session.
    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      if (hermesVoice.getState() === "connected") {
        const bound = hermesVoice.getAgentMeowSession();
        if (bound === conversationId) {
          hermesVoice.send({ type: "interrupt" });
          hermesVoice.disconnect();
          hermesVoice.setAgentMeowSession(null);
        } else {
          hermesVoice.setAgentMeowSession(conversationId);
        }
      } else {
        hermesVoice.setAgentMeowSession(conversationId);
        void hermesVoice.connect({ turnDetection: "server_vad" }).then(() => {
          hermesVoice.startWakeWordMode();
        });
      }
    });
  };
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [planModeBusy, setPlanModeBusy] = useState(false);
  // Index of the highlighted item in the slash-command suggestions menu.
  // -1 means no item highlighted (menu closed or no matches). When the menu
  // opens with matches the reset logic below pre-selects the first item (0)
  // so Tab/Enter complete it immediately.
  const [menuIndex, setMenuIndex] = useState(-1);
  // Active "@"-file-mention being typed, plus its highlighted row and the
  // workspace paths the user has already tagged. ``@``-mention is wired for
  // the native coding-agent sessions (see ``mentionEnabled``): those harnesses
  // run in the workspace and read a file from an "[Attached: …]" marker, so a
  // tagged path is delivered by prepending that marker at send time — no
  // upload, the agent reads the on-disk file directly.
  // Active "@"-mention token (owned here; the shared useMentionBrowser hook
  // owns the selection index, tagged chips, and attach/drill/keyboard glue).
  const [mention, setMention] = useState<MentionState | null>(null);
  // Attachments pushed in from outside the composer (e.g. the file viewer's
  // "Attach to agent" button). Drained into ``mentionedItems`` below, then
  // cleared from the store so they aren't re-applied.
  const pendingComposerAttachments = useChatStore((s) => s.pendingComposerAttachments);
  // Nonce bumped when bare "/model" is submitted; opens the AgentPicker
  // dropdown instead of sending (see submit()).
  const [pickerOpenNonce, setPickerOpenNonce] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);
  // Highlight overlay mirroring the textarea; scroll-synced so the tinted
  // `/skill` token stays aligned once the draft grows past the visible rows.
  const backdropRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming";

  // Read-only when either the user lacks a write grant OR the session
  // is structurally non-interactive (``readOnlyReason``). The
  // structural reason takes priority for the placeholder text since it
  // explains *why* this specific row can't receive input.
  const isReadOnly = permissionLevel === 1 || readOnlyReason !== null;
  // A pending elicitation addressed to this session parks the turn
  // server-side (the runner blocks on the verdict Future), so a message
  // sent now would sit queued and unread until the card is answered —
  // and for native wrappers the injected text could land in the vendor
  // TUI's permission prompt. Lock the composer until the verdict is in.
  // Mirrored sub-agent prompts (targetSessionId set to a child session)
  // don't gate this session's inbox, so they don't lock it.
  const hasPendingElicitation = useChatStore((s) =>
    s.blocks.some(
      (b) =>
        b.type === "elicitation" &&
        b.status === "pending" &&
        (b.targetSessionId == null || b.targetSessionId === s.conversationId),
    ),
  );

  // Per-session cost-control switch, hydrated from the snapshot on bind.
  const costControlModeOverride = useChatStore((s) => s.costControlModeOverride);
  const codexPlanMode = useChatStore((s) => s.codexPlanMode);
  // Harness/agent identity shown in the status tray below the card. The
  // picker trigger owns model/effort now, so the identity moves here.
  const sessionHarness = useChatStore((s) => s.sessionHarness);
  const subAgentName = useChatStore((s) => s.subAgentName);
  const brainHarnessLabels = useBrainHarnessLabels();
  const harnessLabel = composerHarnessLabel(
    modelPickerKind,
    // For a sub-agent (head) session, identify the head family being viewed
    // (e.g. the GPT head → "Gpt") rather than the bundle orchestrator
    // ("Debby") — the bundle is already named in the breadcrumb / Agents rail.
    subAgentName ??
      agents?.find((a) => a.id === selectedAgentId)?.name ??
      agents?.[0]?.name ??
      null,
    sessionHarness,
    brainHarnessLabels,
  );

  // Preserve unsent text + file attachments per session so switching
  // tabs and coming back restores the draft. The drafts map lives at
  // module scope (not useRef) because Composer unmounts during the
  // loading gate between session switches.
  const conversationId = useChatStore((s) => s.conversationId);
  const queuedMessages = useChatStore((s) => s.queuedMessages);
  const sessionStatus = useChatStore((s) => s.sessionStatus);
  const flushBoundAgentId = useChatStore((s) => s.boundAgentId);
  const maybeFlushQueuedHead = useChatStore((s) => s.maybeFlushQueuedHead);
  const dequeueMessage = useChatStore((s) => s.dequeueMessage);
  const steerMessage = useChatStore((s) => s.steerMessage);
  const reorderQueuedMessage = useChatStore((s) => s.reorderQueuedMessage);
  // Drain the queue whenever idle with a waiting head — level-triggered so a
  // message queued right after the turn ended (or after an SSE reconnect that
  // carries no fresh idle transition) still sends instead of stranding. Hold
  // while unreachable: flushing would POST into a void (no executor / no host
  // to wake), bypassing onSend's reconnect dialog. The next reachable render
  // re-fires this effect and drains. `boundAgentId` is a dep because the flush
  // needs it: on navigate-back the binding lands after the status settles, and
  // without this dep the effect wouldn't re-fire to drain a queue for the
  // returned-to conversation.
  useEffect(() => {
    if (unreachable) return;
    maybeFlushQueuedHead();
  }, [
    status,
    sessionStatus,
    queuedMessages,
    conversationId,
    flushBoundAgentId,
    unreachable,
    maybeFlushQueuedHead,
  ]);
  const { goal, setGoal: setGoalState } = useGoalState(conversationId, showGoalControl);
  // "@"-file-mention is scoped to the native coding-agent harnesses: their
  // vendor CLIs run in the workspace and read an on-disk file from an
  // attachment marker the executor already emits. In-process SDK sessions
  // get no mention menu, so the workspace listing is never fetched for them
  // (``enabled`` gate below). Codex's marker says "Attached file:" while the
  // others say "Attached:" — see ``mentionMarkerFor``. ``sessionHarness`` is
  // already read above for the status-tray harness label.
  // Derive from the canonical native-agent registry (which folds reversed
  // spellings like ``native-pi``) rather than a literal harness-string compare,
  // so the composer's "@" entry point can't split-brain from the file viewer's
  // "Attach to agent" gate (``canAttachToAgent``), which already uses it.
  const mentionEnabled = nativeCodingAgentForHarness(sessionHarness) !== undefined;
  const workspaceFilesQuery = useWorkspaceAllFiles(conversationId ?? undefined, {
    enabled: mentionEnabled,
  });
  const valueRef = useRef(value);
  valueRef.current = value;
  const filesRef = useRef(files);
  filesRef.current = files;
  // Guards against React StrictMode double-invoke in development:
  // setup → cleanup → setup runs cleanup before the user has touched
  // the input, which would delete the draft. Only save when the user
  // has actually changed the value since the last restore.
  const dirtyRef = useRef(false);
  // Composer text captured when voice dictation starts, so Esc can revert to it.
  const voiceSnapshotRef = useRef("");
  // On mobile, programmatic focus immediately summons the software keyboard.
  // Keep desktop's fast-type affordance, but let mobile users explicitly tap
  // the composer when switching back from Terminal or changing sessions.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const restored = conversationId ? sessionDrafts.get(conversationId) : undefined;
    setValue(restored?.text ?? "");
    setFiles(restored?.files ?? []);
    dirtyRef.current = false;
    if (!isMobileRef.current) textareaRef.current?.focus();

    return () => {
      if (!conversationId || !dirtyRef.current) return;
      const text = valueRef.current;
      const draftFiles = filesRef.current;
      if (text || draftFiles.length > 0) {
        sessionDrafts.set(conversationId, { text, files: draftFiles });
      } else {
        sessionDrafts.delete(conversationId);
      }
      saveDraftsToStorage(sessionDrafts);
    };
  }, [conversationId]);

  // Adding a reply quote (via the floating "Reply" button) should drop the
  // caret straight into the composer so the user can type immediately. Only
  // focus when the count grows — removing a quote shouldn't steal focus.
  const prevQuoteCountRef = useRef(replyQuotes.length);
  useEffect(() => {
    if (!isMobileRef.current && replyQuotes.length > prevQuoteCountRef.current) {
      textareaRef.current?.focus();
    }
    prevQuoteCountRef.current = replyQuotes.length;
  }, [replyQuotes.length]);

  // Session skills (bundled + host-discovered) come from the snapshot
  // on bind and populate the suggestions menu as ``/skill-name``
  // entries alongside the built-ins.
  const skills = useChatStore((s) => s.skills);
  // ``/model`` writes ``conv.model_override`` (the same column the REPL's
  // ``/model`` and native pickers write). In-process harnesses re-resolve
  // it each turn; native wrappers expose it only when they have a picker
  // path that the runner can propagate without blocking the vendor TUI.
  const showModel = !isNativeWrapper || showModels;
  // /compact is only functional for native wrappers (claude-native,
  // codex-native) which inject the slash command into the terminal.
  // SDK harnesses (openai-agents-sdk, claude-sdk) don't support it yet.
  const showCompact = isNativeWrapper;
  const slashCommands = useMemo(
    () => buildSlashCommandMap(skills, showEffort, showModel, showCompact),
    [skills, showEffort, showModel, showCompact],
  );
  // Skills always need an optional argument fill-in so the user can
  // type extra context after the name; built-in commands keep their
  // existing fill/execute split.
  const slashCommandsWithArgs = useMemo(
    () => buildSlashCommandWithArgsSet(skills, showEffort, showModel),
    [skills, showEffort, showModel],
  );

  // Suggestions menu is open while the user is still typing the command
  // name — i.e. the value starts with "/" with no spaces yet (once a
  // space appears the command name is done and args follow) and no second
  // "/" (guards against file-path-like strings).
  const trimmedValue = value.trimStart();
  const menuOpen =
    trimmedValue.startsWith("/") &&
    !trimmedValue.slice(1).includes("/") &&
    !trimmedValue.includes(" ") &&
    files.length === 0;
  // Query = what the user typed after the leading "/".
  const menuQuery = menuOpen ? trimmedValue.slice(1) : "";
  // Tint the `/skill` token blue while the draft reads as a slash command, so
  // the command shape is signalled as the user types it.
  const composerIsCommand = files.length === 0 && isSlashCommandText(value);
  const toggleCodexPlanMode = async () => {
    if (planModeBusy) return;
    setCommandError(null);
    setPlanModeBusy(true);
    try {
      await useChatStore.getState().setCodexPlanMode(!codexPlanMode);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setCommandError(`Could not ${codexPlanMode ? "exit" : "enter"} Plan mode: ${message}`);
    } finally {
      setPlanModeBusy(false);
    }
  };
  // Filtered matches — kept in sync with what SlashCommandMenu renders so
  // keyboard nav indexes into the same list.
  const menuMatches = menuOpen ? rankedSlashCommandNames(slashCommands, menuQuery) : [];

  // Pre-select the first match whenever the filtered list changes — both
  // when the menu first opens (matches go [] → non-empty) and as the query
  // narrows it. Highlighting the top item is what lets Tab/Enter complete it
  // without the user arrowing down first; the keydown completion branch is
  // gated on ``menuIndex >= 0``. Arrow navigation only mutates ``menuIndex``
  // (not ``menuMatches``), so it never trips this reset.
  const prevMenuMatchesRef = useRef<string[]>([]);
  if (
    menuMatches.length !== prevMenuMatchesRef.current.length ||
    menuMatches.some((m, i) => m !== prevMenuMatchesRef.current[i])
  ) {
    prevMenuMatchesRef.current = menuMatches;
    setMenuIndex(menuMatches.length > 0 ? 0 : -1);
  }

  // "@"-mention is a drill-down file/folder browser. The token after "@"
  // doubles as a path: text up to the last "/" is the directory being
  // browsed; text after it filters that directory's entries. Opening a
  // folder rewrites the token to "<dir>/" so the menu re-lists it — that
  // is how nested files are reached (recursion via navigation, mirroring
  // the terminal's git-tracked walk). At any level the user can attach a
  // single file or the whole folder.
  const { dir: mentionDir, filter: mentionFilter } = parseMentionToken(mention?.query ?? "");
  // Root listing reuses the gate's useWorkspaceAllFiles; a sub-directory
  // uses the lazy per-dir hook (disabled — null path — at the root). Both
  // return files AND directories with a ``type`` discriminator.
  const mentionDirQuery = useWorkspaceDirectory(
    conversationId ?? undefined,
    mentionEnabled && mention && mentionDir ? mentionDir : null,
  );
  const mentionSourceEntries: WorkspaceFile[] = mentionDir
    ? (mentionDirQuery.data ?? [])
    : (workspaceFilesQuery.data?.data ?? []);
  // Folders first, filtered by the typed segment, capped (see rankMentionEntries).
  const mentionEntries: WorkspaceFile[] =
    mentionEnabled && mention ? rankMentionEntries(mentionSourceEntries, mentionFilter) : [];
  // True while a mention token is active but its listing hasn't resolved yet:
  // the cold-boot root fetch, or a sub-directory's first load after drilling
  // in. During this window ``mentionEntries`` is transiently empty (so the
  // menu is closed), and a stray Enter must NOT fall through to ``submit`` and
  // send the half-typed "@dir/" token as a chat message. A *settled*
  // zero-match (e.g. "@notafile") is deliberately excluded — sending that
  // literally is the user's intent.
  const mentionListingPending =
    mentionEnabled &&
    mention != null &&
    (mentionDir ? mentionDirQuery.isLoading : workspaceFilesQuery.isLoading);

  // Shared selection/chip/keyboard glue (see useMentionBrowser). The token
  // state and the data source above stay here; everything stateful is shared
  // so this composer and the launcher can't drift. ``setText`` also flags the
  // draft dirty so attach/drill participate in draft persistence.
  const {
    mentionIndex,
    mentionOpen,
    mentionedItems,
    setMentionedItems,
    attachMention,
    openMentionDir,
    removeMentionedItem,
    handleKeyDown: handleMentionKeyDown,
    dismiss: dismissMention,
  } = useMentionBrowser({
    mention,
    setMention,
    mentionEntries,
    text: value,
    setText: (next) => {
      setValue(next);
      dirtyRef.current = true;
    },
    textareaRef,
    isMobile,
  });

  // Depends on mentionedItems (from the hook above), so it's computed here.
  const hasDraft = value.trim().length > 0 || files.length > 0 || mentionedItems.length > 0;
  const showInterruptButton = isWorking && !hasDraft;

  // Drain externally-queued attachments (file viewer "Attach to agent") into
  // the local mention chips, deduping against what's already tagged, then
  // clear the store queue so they aren't re-applied. Placed after
  // ``useMentionBrowser`` since it owns ``setMentionedItems``.
  useEffect(() => {
    if (pendingComposerAttachments.length === 0) return;
    setMentionedItems((prev) => {
      // Dedup against already-tagged chips AND within this batch (accumulate
      // into ``seen`` as we go) so a duplicated queue can't double-apply.
      const seen = new Set(prev.map(composerAttachmentKey));
      const fresh: MentionItem[] = [];
      for (const a of pendingComposerAttachments) {
        const k = composerAttachmentKey(a);
        if (seen.has(k)) continue;
        seen.add(k);
        fresh.push(a);
      }
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
    useChatStore.getState().clearPendingComposerAttachments();
    textareaRef.current?.focus();
    // Defense-in-depth against the cross-session leak: if the composer unmounts
    // while an entry is still queued (route change, panel close, the
    // loading-conversation gate during a session switch), clear the queue so
    // the next-mounted composer doesn't drain a stale chip. ``switchTo`` also
    // resets the queue, but this closes the non-switch unmount paths too.
    return () => useChatStore.getState().clearPendingComposerAttachments();
    // setMentionedItems is a stable useState setter (from useMentionBrowser).
  }, [pendingComposerAttachments, setMentionedItems]);

  /**
   * Execute a slash command by name + optional argument string.
   * Clears the input and error state on success (or sets an error on
   * bad usage). Returns ``true`` when the command was recognised.
   */
  const executeSlashCommand = (cmd: string, arg: string): boolean => {
    switch (cmd) {
      case "/compact":
        if (!showCompact) {
          setCommandError("/compact is not supported for this agent type");
          return true;
        }
        dirtyRef.current = true;
        setValue("");
        setCommandError(null);
        void useChatStore
          .getState()
          .compact()
          .catch((err: unknown) => {
            setCommandError(err instanceof Error ? err.message : "Compact failed");
          });
        return true;
      case "/effort": {
        if (!showEffort) return false;
        const valid = [...effortLevels, "default"];
        if (!arg || !valid.includes(arg.toLowerCase())) {
          setCommandError(`Usage: /effort ${valid.join(" | ")}`);
          return true;
        }
        const level = arg.toLowerCase() === "default" ? null : arg.toLowerCase();
        dirtyRef.current = true;
        setValue("");
        setCommandError(null);
        void useChatStore
          .getState()
          .setEffort(level)
          .catch((err: unknown) => {
            setCommandError(err instanceof Error ? err.message : "Failed to set effort");
          });
        return true;
      }
      case "/model": {
        // The command guard checks only the "/model" token, so both bare
        // gateway ids ("databricks-gpt-5-4") and provider-prefixed ids
        // ("anthropic/claude-opus-4-8") reach here as the argument.
        if (!showModel) return false;
        const target = arg.trim();
        if (!target) {
          const { sessionModelOverride, llmModel } = useChatStore.getState();
          const current = sessionModelOverride
            ? `${sessionModelOverride} (override)`
            : (llmModel ?? "agent default");
          setCommandError(`Model: ${current}\nUsage: /model <name> · /model default to reset`);
          return true;
        }
        // ``default | off | reset`` clear the override (REPL clear aliases);
        // ``setModel(null)`` sends the server's "default" clear sentinel.
        const clear = ["default", "off", "reset"].includes(target.toLowerCase());
        dirtyRef.current = true;
        setValue("");
        setCommandError(null);
        // Confirmation is a durable `[System: model changed to X]` note the
        // server appends to the transcript (see _persist_model_change_note) —
        // not a transient composer hint. Surface only failures inline here.
        void useChatStore
          .getState()
          .setModel(clear ? null : target)
          .catch((err: unknown) => {
            setCommandError(err instanceof Error ? err.message : "Failed to set model");
          });
        return true;
      }
      case "/context": {
        const state = useChatStore.getState();
        const {
          contextWindow,
          llmModel,
          sessionModelOverride,
          tokensUsed,
          sessionCostUsd,
          sessionUsageByModel,
          blocks,
        } = state;
        const lines: string[] = [];
        if (sessionModelOverride) lines.push(`Model: ${sessionModelOverride} (override)`);
        else if (llmModel) lines.push(`Model: ${llmModel}`);
        // contextWindow > 0 keeps a zero window out of the division (0/0 → "NaN%").
        if (tokensUsed != null && contextWindow != null && contextWindow > 0) {
          const pct = Math.min(tokensUsed / contextWindow, 1);
          const filled = Math.round(pct * 20);
          const bar = "█".repeat(filled) + "░".repeat(20 - filled);
          const pctStr = (pct * 100).toFixed(1);
          lines.push(
            `${tokensUsed.toLocaleString()} / ${contextWindow.toLocaleString()} tokens (${pctStr}%)`,
          );
          lines.push(bar);
        } else if (tokensUsed != null) {
          lines.push(`${tokensUsed.toLocaleString()} tokens`);
          lines.push("(Context window size unknown)");
        } else {
          lines.push("No usage data yet — send a message first.");
        }
        if (sessionCostUsd != null && sessionCostUsd > 0) {
          lines.push(`Session cost: $${sessionCostUsd.toFixed(4)}`);
        }
        if (sessionUsageByModel) {
          for (const [model, usage] of Object.entries(sessionUsageByModel)) {
            const total = usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
            if (total === 0) continue;
            const inT = usage.inputTokens?.toLocaleString() ?? "?";
            const outT = usage.outputTokens?.toLocaleString() ?? "?";
            const cost =
              usage.totalCostUsd != null && usage.totalCostUsd > 0
                ? ` · $${usage.totalCostUsd.toFixed(4)}`
                : "";
            lines.push(`  ${model}: ${inT} in + ${outT} out${cost}`);
          }
        }
        lines.push(`Items in context: ${blocks.length}`);
        setCommandError(lines.join("\n"));
        return true;
      }
      case "/help": {
        const lines = Object.entries(slashCommands).map(([name, desc]) => `${name} — ${desc}`);
        setCommandError(lines.join("\n"));
        return true;
      }
      default:
        setCommandError(
          `Unknown command: ${cmd}. Available: ${Object.keys(slashCommands).join(", ")}`,
        );
        return false;
    }
  };

  /**
   * Called when the user selects a suggestion from the menu (keyboard or
   * click). Commands that need an argument (``SLASH_COMMANDS_WITH_ARGS``)
   * fill in the text with a trailing space so the user can type the arg.
   * All other commands execute immediately.
   */
  const applyMenuSelection = (cmd: string) => {
    setMenuIndex(-1);
    if (slashCommandsWithArgs.has(cmd)) {
      // Fill in "cmd " and let the user type the argument.
      setValue(cmd + " ");
      dirtyRef.current = true;
      textareaRef.current?.focus();
    } else {
      // Execute immediately — no argument needed.
      setValue("");
      setCommandError(null);
      executeSlashCommand(cmd, "");
    }
  };

  // Auto-grow the textarea from 1 row up to 10 rows, then let it scroll.
  useAutoGrowTextarea(textareaRef, value);

  // Scope recall to the active conversation so ArrowUp surfaces only this
  // chat's prompts, not the last thing typed in any other chat.
  const { appendEntry, recallPrevious, recallNext, resetCursor } = usePromptHistory(conversationId);
  // Set just before recall sets `value`; cleared when the resulting onChange
  // fires. Lets onChange distinguish "user typed" (reset cursor) from
  // "recall replaced the value" (keep cursor).
  const recallingRef = useRef(false);

  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = (incoming: File[]) => {
    // Reject unsupported types (only images, PDF, and text/code) and
    // oversized files up front — before the upload — with a friendly
    // message. The server enforces the same limits authoritatively.
    const { accepted, errors } = validateAttachments(incoming);
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
      dirtyRef.current = true;
      // Return focus to the composer so the user can keep typing right
      // after attaching (the file picker / paperclip button steals it).
      if (!isMobileRef.current) textareaRef.current?.focus();
    }
    setAttachmentError(errors.length > 0 ? errors.join("\n") : null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) addFiles(dropped);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only clear the active state when the pointer leaves the container
    // itself, not when it moves between child elements inside it.
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragActive(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachmentError(null);
    dirtyRef.current = true;
  };

  const submit = () => {
    // Keep the ref in sync so the voiceCommand auto-submit effect can call
    // the latest submit without referencing it before its declaration.
    submitRef.current = submit;
    const trimmed = value.trim();
    // Allow send if there's text, attached files, OR "@"-tagged paths.
    if (
      (!trimmed && files.length === 0 && mentionedItems.length === 0) ||
      disabled ||
      hasPendingElicitation
    )
      return;

    // Slash command path: the first token must read as "/name" (the shared
    // isSlashCommandText guard — file paths like "/Users/foo/bar.txt" don't
    // match, while args after the name may carry paths or URLs, e.g.
    // "/review-pr https://github.com/...").
    // Commands don't mix with file attachments — require no files. Built-ins
    // run locally; a known skill routes through ``onSendSlashCommand`` (a
    // ``slash_command`` event) when that's wired — i.e. in-process sessions.
    // Anything else (unknown command, or a skill on a native-terminal
    // session where ``onSendSlashCommand`` is undefined) falls through to the
    // plaintext send path below.
    if (isSlashCommandText(trimmed) && files.length === 0 && mentionedItems.length === 0) {
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts[1] ?? "";
      // Bare "/model" when the picker has a switchable Models section
      // (claude-native): sent as plaintext it would open Claude's interactive
      // selector inside the vendor TUI, which the web UI can't render — the
      // session just blocks. Open the composer's model picker instead and let
      // the user choose there. "/model <name>" takes the builtin route below to
      // setModel — the same write the picker makes.
      //
      // opencode-native now surfaces server-backed model options too, so bare
      // "/model" opens the picker when options are loaded. When the options are
      // still empty (e.g. the runner catalog hasn't arrived yet), fall through
      // to the builtin "/model" handler, which surfaces the current model as a
      // read-only hint instead of popping an empty dropdown. ("/model <name>"
      // still routes to setModel there — opencode reads model_override on the
      // next web-injected turn.)
      const canOpenModelPicker = modelPickerKind !== "opencode" || codexModelOptions.length > 0;
      if (cmd === "/model" && !arg && showModels && canOpenModelPicker) {
        dirtyRef.current = true;
        setValue("");
        setCommandError(null);
        setPickerOpenNonce((n) => n + 1);
        return;
      }
      if (cmd in BUILTIN_SLASH_COMMANDS && cmd in slashCommands) {
        executeSlashCommand(cmd, arg);
        return;
      }
      // Known skill on an in-process session: send a `slash_command` event
      // (the REPL's wire shape) so the server resolves the skill and
      // injects its instructions, instead of the agent seeing the literal
      // "/name" text. `parts[0]` keeps the original case for the server's
      // exact-name lookup. `onSendSlashCommand` is undefined for
      // native-terminal sessions, so those fall through to the plaintext
      // path below and the vendor TUI loads the skill itself. Reply quotes
      // don't apply to a slash command (no content field) — clear them.
      if (onSendSlashCommand && parts[0] in slashCommands) {
        const skillArgs = trimmed.slice(parts[0].length).trim();
        appendEntry(trimmed);
        onSendSlashCommand(parts[0].slice(1), skillArgs);
        dirtyRef.current = true;
        setValue("");
        setCommandError(null);
        onClearAllQuotes();
        return;
      }
    }

    setCommandError(null);
    // Prepend all active reply quotes as Markdown blockquotes.
    const quotePreamble =
      replyQuotes.length > 0
        ? replyQuotes
            .map((q) =>
              q
                .split("\n")
                .map((line) => `> ${line}`)
                .join("\n"),
            )
            .join("\n\n") + "\n\n"
        : "";
    // Prepend each "@"-tagged path as an attachment marker on its own line —
    // the same format the native executors emit for attachments and that
    // title-seeding strips (_ATTACHMENT_MARKER_RE). Wording is harness-aware
    // (codex says "Attached file:"). Folders carry a trailing "/" so the
    // agent knows to open the directory. The native vendor reads the on-disk
    // workspace file/folder from this marker; no upload happens.
    const messageText =
      buildMentionPreamble(mentionedItems, sessionHarness) + quotePreamble + trimmed;
    // Sending while a prior response is streaming is fine — the
    // server queues the message and delivers it to the running task
    // (or starts a fresh one once the current drains). Escape still
    // interrupts.
    if (trimmed) appendEntry(trimmed);
    onSend(messageText, files.length > 0 ? files : undefined);
    dirtyRef.current = true;
    setValue("");
    setFiles([]);
    setAttachmentError(null);
    setMentionedItems([]);
    setMention(null);
    onClearAllQuotes();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (showInterruptButton) {
      onStop();
      return;
    }
    submit();
  };

  const applyRecall = (ta: HTMLTextAreaElement, recalled: string) => {
    recallingRef.current = true;
    setValue(recalled);
    dirtyRef.current = true;
    // Move the caret to the end after React applies the new value. Without
    // this, the browser leaves the caret at its previous index, which can
    // land mid-word and feels broken.
    queueMicrotask(() => {
      ta.setSelectionRange(recalled.length, recalled.length);
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isImeCompositionKeyEvent(e, isComposingRef.current)) {
      return;
    }

    // "@"-mention menu navigation (shared useMentionBrowser) — mutually
    // exclusive with the slash menu below (a mention token can't also read as a
    // "/"-command). Takes priority over history recall and submission.
    if (handleMentionKeyDown(e)) return;

    // When the suggestions menu is open, ArrowUp/Down navigate it and
    // Enter/Tab complete the highlighted item. These take priority over
    // history recall and normal submission.
    if (menuOpen && menuMatches.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenuIndex((i) => (i + 1) % menuMatches.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIndex((i) => (i <= 0 ? menuMatches.length - 1 : i - 1));
        return;
      }
      if ((e.key === "Tab" || (e.key === "Enter" && !e.shiftKey && !isMobile)) && menuIndex >= 0) {
        e.preventDefault();
        applyMenuSelection(menuMatches[menuIndex]!);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        // Dismiss the menu by clearing the input so the user can start fresh.
        setValue("");
        setMenuIndex(-1);
        return;
      }
    }

    // Enter sends; Shift+Enter inserts a newline. On mobile, Enter inserts a
    // newline (no Shift available on-screen) and Send must be tapped instead.
    if (e.key === "Enter" && !e.shiftKey && !isMobile && !e.nativeEvent.isComposing) {
      e.preventDefault();
      // The mention menu is briefly closed while its listing loads (see
      // ``mentionListingPending``); swallow Enter so the in-progress "@dir/"
      // token isn't sent as a chat message. The menu reopens when entries land.
      if (mentionListingPending) return;
      submit();
      return;
    }
    // Esc cancels an in-flight turn. When idle it's a no-op — clearing on
    // Esc destroys typed prompts with no undo (common muscle memory after
    // dismissing autocomplete suggestions).
    if (e.key === "Escape" && isStreaming) {
      e.preventDefault();
      onStop();
      return;
    }
    // ArrowUp/Down recall — only when the caret is already at the very
    // start (ArrowUp) or end (ArrowDown) of the text.  Checking for the
    // absence of "\n" before/after the cursor is not sufficient: long
    // single-line text that wraps visually contains no newlines, so that
    // check always fires and history recall intercepts cursor movement
    // within the wrapped line.  Gating on position 0 / length ensures the
    // browser gets to move the caret through wrapped lines first; only the
    // final ArrowUp-at-start / ArrowDown-at-end triggers recall.
    // Recall is for UNmodified arrows only. Cmd/Ctrl+↑/↓ (switch session) and
    // Cmd/Alt+↑/↓ (jump between messages) are global window hotkeys meant to
    // fire even mid-compose; without this guard the recall below intercepts
    // them (replacing the draft) and the hotkeys appear broken in the composer.
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const ta = e.currentTarget;
      if (e.key === "ArrowUp" && ta.selectionStart === 0) {
        const recalled = recallPrevious(value);
        if (recalled !== null) {
          e.preventDefault();
          applyRecall(ta, recalled);
        }
      } else if (e.key === "ArrowDown" && ta.selectionEnd === ta.value.length) {
        const recalled = recallNext();
        if (recalled !== null) {
          e.preventDefault();
          applyRecall(ta, recalled);
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const pastedFiles: File[] = [];
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      addFiles(pastedFiles);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "chat-composer-form px-4 md:px-6",
        isTerminalFirst ? "terminal-first-composer-form pb-1.5" : "pb-3",
      )}
    >
      {/* Hidden file input for the attach button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,text/*,application/json"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            addFiles(Array.from(e.target.files));
            // Reset so the same file can be re-selected.
            e.target.value = "";
          }
        }}
      />
      {/* Queued messages — peeks above the card like the sub-agent tray.
          Lists follow-ups held while the agent is busy; drains FIFO on idle.
          Scope to this conversation so a queue held elsewhere never leaks in. */}
      <QueuedMessagesStrip
        messages={queuedMessages.filter((m) => m.conversationId === conversationId)}
        onDelete={dequeueMessage}
        onEdit={(queueId) => {
          // Pull the queued message back into the composer for editing:
          // replace the composer's text + attachments with the queued
          // message's, remove it from the queue, and focus the textarea.
          // Re-sending re-queues it (busy) or sends it (idle).
          const target = queuedMessages.find((m) => m.queueId === queueId);
          if (!target) return;
          setValue(target.text);
          setFiles(target.files ?? []);
          dequeueMessage(queueId);
          textareaRef.current?.focus();
        }}
        onSteer={(queueId) => steerMessage(queueId)}
        onReorder={reorderQueuedMessage}
        widthClassName={CHAT_COLUMN_WIDTH}
      />
      {/* Sub-agent context tray — peeks above the card; reserves its own
          layout slot so the card sits below it (see SubagentComposerTray).
          Truthy (not just non-null) so an empty label never peeks a
          nameless tray. */}
      {subAgentLabel ? <SubagentComposerTray label={subAgentLabel} /> : null}
      {/* Single rounded container — textarea on top, action row beneath.
          No top border on the surrounding form; the box itself is the
          visual container. The static neutral border carries through
          focus — no focus-within ring — so the box stays clean while
          typing. Drag-over still lifts an inset ring (below).
          dark:bg-card-solid: the trays tuck their square corners behind
          this card (-mb-4 / -mt-4), and the dark glass --card is 60%
          alpha — the tucked strips ghost through a translucent card. The
          glass rule still keys off the bg-card class, so the dark border/
          shadow chrome is unchanged; only the fill goes opaque. */}
      <div
        className={cn(
          "relative mx-auto flex w-full flex-col rounded-2xl border border-border bg-card dark:bg-card-solid shadow-sm transition",
          CHAT_COLUMN_WIDTH,
          isDragActive && "ring-2 ring-ring ring-inset",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/80">
            <span className="text-sm font-medium text-ring">Drop files here</span>
          </div>
        )}
        {/* Slash-command suggestions — floats above the composer box */}
        {menuOpen && (
          <SlashCommandMenu
            query={menuQuery}
            activeIndex={menuIndex}
            onSelect={applyMenuSelection}
            commands={slashCommands}
          />
        )}
        {/* "@"-file-mention browser — native coding-agent sessions only.
            Also shown (as a loading row) while the listing is still fetching,
            so "@" isn't silently dead during runner cold-boot or a drill-in. */}
        {(mentionOpen || mentionListingPending) && (
          <FileMentionMenu
            currentDir={mentionDir}
            activeIndex={mentionIndex}
            entries={mentionEntries}
            loading={mentionListingPending}
            onOpenDir={openMentionDir}
            onAttach={attachMention}
          />
        )}
        {/* Quote chips — one per quoted selection, shown above the textarea */}
        {replyQuotes.length > 0 && (
          <div className="flex flex-col gap-1.5 px-4 pt-3 pb-0">
            {replyQuotes.map((quote, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1 bg-muted/40 rounded-md border-l-2 border-l-primary/60 px-2 py-1.5 text-xs text-muted-foreground">
                  <span className="block truncate">
                    {quote.length > 120 ? `${quote.slice(0, 120)}…` : quote}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveQuote(i)}
                  className="mt-0.5 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Remove quote"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Highlight overlay: a textarea can only paint its text one color, so
            to tint just the `/skill` token we hide the textarea's own glyphs
            (text-transparent, caret kept visible) and render an aligned mirror
            behind it. Same box/typography so wrapping matches the textarea
            exactly. Only mounted while the draft is a command. */}
        <div className="relative">
          {composerIsCommand && (
            <div
              ref={backdropRef}
              aria-hidden
              data-testid="composer-highlight-overlay"
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 pt-3 pb-2 text-sm text-foreground"
            >
              {(() => {
                const split = splitSlashCommand(value);
                if (!split) return value;
                return (
                  <>
                    {split.before}
                    <span className="text-brand-accent">{split.token}</span>
                    {split.after}
                  </>
                );
              })()}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              dirtyRef.current = true;
              if (commandError !== null) setCommandError(null);
              // Recompute the active "@"-mention from the caret on every
              // keystroke (native coding-agent sessions — ``mentionEnabled``).
              setMention(
                mentionEnabled
                  ? detectMentionAt(
                      e.target.value,
                      e.target.selectionStart ?? e.target.value.length,
                    )
                  : null,
              );
              // Treat user-driven changes as exiting recall mode. Recall-
              // driven setValue toggles `recallingRef` first so we skip the
              // reset for that one tick.
              if (recallingRef.current) recallingRef.current = false;
              else resetCursor();
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Dismiss the "@"-mention menu when focus leaves the textarea
              // (clicking a chip's ✕, the Send button, or another field).
              // Menu rows ``preventDefault`` on mousedown so selecting an entry
              // keeps focus and does NOT blur — this only fires for genuine
              // focus-out, where the lingering menu would otherwise float.
              dismissMention();
            }}
            onPaste={handlePaste}
            onScroll={(e) => {
              // Keep the overlay's scroll position locked to the textarea's.
              if (backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop;
            }}
            aria-label="Message the agent"
            placeholder={
              readOnlyReason !== null
                ? readOnlyReason
                : isReadOnly
                  ? "You have read-only access to this session"
                  : unreachable
                    ? "Session offline — reconnect below to continue"
                    : hasPendingElicitation
                      ? "Respond to the pending request above to continue"
                      : disabled
                        ? "Waiting for agents…"
                        : isStreaming
                          ? "Send a follow-up (queued) — Esc to stop"
                          : sandboxAsleepHint
                            ? "Current session's host is offline. Next message will resume the sandbox host which can take minutes"
                            : reconnectHint
                              ? "Send a message to reconnect this session"
                              : "Ask the agent anything…"
            }
            rows={1}
            disabled={disabled || isReadOnly || unreachable || hasPendingElicitation}
            data-slash-command={composerIsCommand ? "true" : undefined}
            className={cn(
              "relative w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60",
              // Hand glyph painting to the overlay while a command is drafted;
              // the caret stays visible via caret-foreground.
              composerIsCommand && "text-transparent caret-foreground",
            )}
          />
        </div>
        {/* File chips — shown below textarea when files are attached */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {files.map((file, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="size-3 shrink-0" />
                ) : (
                  <FileTextIcon className="size-3 shrink-0" />
                )}
                <span className="max-w-[140px] truncate">{file.name || "image.png"}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-0.5 rounded-full hover:text-foreground"
                  aria-label={`Remove ${file.name || "image.png"}`}
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Rejected-attachment feedback: unsupported type or too large */}
        {attachmentError !== null && (
          <div className="px-4 pb-2 text-xs text-destructive whitespace-pre-wrap">
            {attachmentError}
          </div>
        )}
        {/* "@"-mention chips — one per tagged workspace file/folder. Each is
            delivered as a "[Attached: <path>]" marker at send time. */}
        {mentionedItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {mentionedItems.map((item, i) => (
              <span
                key={mentionItemPath(item)}
                className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {item.isDir ? (
                  <FolderIcon className="size-3 shrink-0" />
                ) : (
                  <FileTextIcon className="size-3 shrink-0" />
                )}
                <span className="max-w-[200px] truncate" title={mentionItemPath(item)}>
                  @{item.path}
                  {item.isDir ? "/" : ""}
                </span>
                {item.lineRange && (
                  <span className="shrink-0">
                    :{item.lineRange.start}-{item.lineRange.end}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMentionedItem(i)}
                  className="ml-0.5 rounded-full hover:text-foreground"
                  aria-label={`Remove ${item.path}`}
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Inline slash-command feedback: errors and /help output */}
        {commandError !== null && (
          <div className="px-4 pb-2 text-xs text-muted-foreground whitespace-pre-wrap">
            {commandError}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          {/* Attach + mic — left side of the action row */}
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-9 md:size-8"
              disabled={disabled || isReadOnly || hasPendingElicitation}
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              <PaperclipIcon className="size-4" />
              <span className="sr-only">Attach files</span>
            </Button>
            <ComposerSpeechChip
              enableHotkey
              readAloudState={readAloudState}
              onStopReadAloud={() => {
                stopReadAloud();
              }}
              onPauseResumeReadAloud={() => {
                if (readAloudState === "paused") {
                  resumeReadAloud();
                } else {
                  pauseReadAloud();
                }
              }}
              disabled={
                disabled ||
                isReadOnly ||
                hasPendingElicitation ||
                (isStreaming && realtimeVoice.state !== "connected") ||
                readAloudState === "playing" ||
                readAloudState === "loading"
              }
              onVoiceStart={() => {
                voiceSnapshotRef.current = value;
              }}
              onVoiceDiscard={() => {
                setValue(voiceSnapshotRef.current);
              }}
              onTranscript={(text) => {
                dictation.appendFinal(text);
                dirtyRef.current = true;
                // Dictation is a user-driven edit — exit prompt-recall mode
                // so ArrowUp/ArrowDown don't clobber the dictated text.
                resetCursor();
                if (commandError !== null) setCommandError(null);
              }}
              onInterim={(text) => {
                dictation.replaceInterim(text);
                dirtyRef.current = true;
                resetCursor();
              }}
              onHermesVoice={handleHermesVoice}
            />
          </div>
          {/* Cost toggle + agent picker + Send — right side */}
          <div className="flex min-w-0 items-center gap-0.5">
            {costRoutingEligible && (
              <IntelligentModelControl
                value={costControlModeOverride}
                onChange={(mode) =>
                  void useChatStore
                    .getState()
                    .setCostControlMode(mode)
                    .catch(() => {})
                }
                disabled={isReadOnly}
                verdict={costRoutingVerdict}
              />
            )}
            {showCodexPlanMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant={codexPlanMode ? "secondary" : "ghost"}
                    className={cn(
                      "h-9 gap-1.5 px-2 text-xs md:h-8",
                      codexPlanMode && "border border-ring/30 text-foreground",
                    )}
                    disabled={isReadOnly || planModeBusy}
                    aria-pressed={codexPlanMode}
                    aria-label={codexPlanMode ? "Exit Plan mode" : "Enter Plan mode"}
                    data-testid="codex-plan-mode-toggle"
                    data-active={codexPlanMode ? "true" : undefined}
                    onClick={() => void toggleCodexPlanMode()}
                  >
                    {planModeBusy ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <FileTextIcon className="size-3.5" />
                    )}
                    <span>Plan</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {codexPlanMode ? "Exit Plan mode" : "Enter Plan mode"}
                </TooltipContent>
              </Tooltip>
            )}
            {showGoalControl && (
              <GoalControl
                conversationId={conversationId}
                readOnly={isReadOnly}
                goal={goal}
                onGoalChange={setGoalState}
                backendLabel="Codex"
              />
            )}
            <AgentPicker
              agents={agents}
              isLoading={agentsLoading}
              selectedId={selectedAgentId}
              onSelect={onSelectAgent}
              effortLevels={effortLevels}
              showEffort={showEffort}
              modelPickerKind={modelPickerKind}
              codexModelOptions={codexModelOptions}
              disabled={isReadOnly}
              openNonce={pickerOpenNonce}
            />
            {showVoicePaw ? (
              <VoicePawButton
                variant="dock"
                realtimeVoice={realtimeVoice}
                voiceListening={realtimeVoice.state === "connected"}
                creating={(isStreaming || isWorking) && realtimeVoice.state !== "connected"}
                dictationActive={realtimeVoice.state === "connected"}
                wakeWordActive={false}
                wakeWordEnabled={false}
                onVoiceStart={() => {}}
                onTranscriptAppend={(text) => {
                  dictation.appendFinal(text);
                  dirtyRef.current = true;
                  resetCursor();
                }}
                onHermesVoice={handleHermesVoice}
                onToggleWakeWord={() => {}}
              />
            ) : null}
            <Button
              type="submit"
              size="icon"
              variant={showInterruptButton ? "destructive" : "default"}
              // Send button fades more decisively when there's no draft —
              // overrides the base 50% disabled-opacity so the affordance
              // reads as "waiting for input", not "almost active".
              className={cn(
                "size-9 shrink-0 rounded-full md:size-8",
                !showInterruptButton && "hover:bg-primary/90 disabled:opacity-30",
              )}
              // Interrupt stays live during a pending elicitation —
              // cancelling the turn is the other legitimate way out.
              disabled={
                showInterruptButton
                  ? isReadOnly
                  : !hasDraft || disabled || isReadOnly || hasPendingElicitation
              }
              title={showInterruptButton ? "Interrupt" : "Send"}
              aria-label={showInterruptButton ? "Interrupt" : "Send"}
            >
              {showInterruptButton ? (
                <SquareIcon className="size-4 fill-current" />
              ) : (
                <ArrowUpIcon className="size-4" />
              )}
              <span className="sr-only">{showInterruptButton ? "Interrupt" : "Send"}</span>
            </Button>
          </div>
        </div>
      </div>
      <ComposerStatusLine
        harnessLabel={harnessLabel}
        goal={goal}
        isSubAgentSession={subAgentLabel != null}
        onHostReconnect={hostOffline ? onShowReconnectHelp : undefined}
      />
    </form>
  );
}

export function isModelImplicitlySelected(modelId: string, llmModel: string | null): boolean {
  if (!llmModel) return false;
  const isSonnet5 = llmModel.includes("sonnet-5") || llmModel.includes("sonnet_5");
  if (modelId === "sonnet_5") return isSonnet5;
  if (modelId === "sonnet" && isSonnet5) return false;
  return llmModel === modelId || llmModel.endsWith(`/${modelId}`) || llmModel.includes(modelId);
}

interface AgentPickerProps {
  agents: Agent[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  effortLevels: readonly string[];
  /** Show the Effort section and selected effort. */
  showEffort: boolean;
  /** Native model picker family, when present. */
  modelPickerKind: NativeModelPickerKind | null;
  /** Codex app-server model options for codex-native sessions. */
  codexModelOptions: readonly CodexModelOption[];
  /**
   * Disables the picker trigger. The picker is purely a write
   * surface (selecting an agent / model / effort changes how the
   * next turn runs), so read-only sessions disable it alongside the
   * other composer buttons.
   */
  disabled?: boolean;
  /**
   * External "open the dropdown" signal; nonce-keyed so repeat
   * requests re-open (same pattern as the composer prefill). Used by
   * bare ``/model`` submits. ``0`` / omitted means never requested.
   */
  openNonce?: number;
}

function AgentPicker({
  agents,
  isLoading,
  selectedId,
  onSelect,
  effortLevels,
  showEffort,
  modelPickerKind,
  codexModelOptions,
  disabled = false,
  openNonce = 0,
}: AgentPickerProps) {
  // Controlled so bare "/model" in the composer can open the dropdown.
  const [open, setOpen] = useState(false);
  const appliedOpenNonce = useRef(0);
  useEffect(() => {
    if (!openNonce || openNonce === appliedOpenNonce.current) return;
    appliedOpenNonce.current = openNonce;
    setOpen(true);
  }, [openNonce]);

  const hasAgents = !!agents && agents.length > 0;
  const selectedEffort = useChatStore((s) => s.selectedEffort);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const sessionModelOverride = useChatStore((s) => s.sessionModelOverride);
  const llmModel = useChatStore((s) => s.llmModel);

  // Codex, cursor, kiro, pi, and opencode all populate the picker from the
  // server-provided ``codexModelOptions`` channel (the snapshot's
  // ``model_options`` field); claude uses the static local catalog.
  const usesServerModelOptions =
    modelPickerKind === "codex" ||
    modelPickerKind === "cursor" ||
    modelPickerKind === "kiro" ||
    modelPickerKind === "pi" ||
    modelPickerKind === "opencode";
  const modelOptions: ReadonlyArray<{ id: string; label?: string; displayName?: string }> =
    modelPickerKind === "claude"
      ? CLAUDE_NATIVE_MODELS
      : usesServerModelOptions
        ? codexModelOptions
        : [];
  const isNativeModelPicker = modelPickerKind !== null;
  // Only offer the agent list when there's an actual choice. Inside a
  // session the picker is scoped to the single bound agent (the runner is
  // tied 1:1 to it and can't be reassigned), so a one-row "Agents" section
  // is pure noise — drop it and let the dropdown be just the effort/model
  // controls.
  const showAgents = !isNativeModelPicker && (agents?.length ?? 0) > 1;
  const rawAgentName = agents?.find((a) => a.id === selectedId)?.name ?? agents?.[0]?.name;
  const agentDisplayName = rawAgentName ? agentDisplayLabel(rawAgentName) : rawAgentName;

  // The trigger now names what this control changes: model + effort. The
  // harness/agent identity moved to the status tray below the card.
  // qwen/goose/cursor/pi/opencode native wrappers pick their model inside
  // the vendor TUI, so the bound `llmModel` is an unused default — don't
  // surface it as if it were live; claude-/codex-native and SDK agents
  // resolve to a real model.
  const nativeVendorOwnsModel = useChatStore((s) => s.nativeVendorOwnsModel);
  // cursor-native is a vendor-owns-model wrapper, but unlike qwen/goose/pi/
  // opencode it mirrors its live TUI model into the session override
  // (`sessionModelOverride` / `model_override`), kept current both by the
  // forwarder's terminal→web mirror and by web-side picks. Surface *that* as
  // the live model — never the cross-session sticky `selectedModel` (a pick
  // carried over from some other session) nor the meaningless `llmModel`
  // default. The other vendor-owns wrappers have no Omnigent-visible model and
  // stay null.
  // kiro persists the pick as ``model_override`` (applied via ``--model`` at
  // launch) and, mid-session, the runner types ``/model <id>`` into the live TUI.
  // There is no terminal→web mirror, so the picker reflects the web-side
  // ``sessionModelOverride`` (which stays correct since a web pick sets it), like
  // cursor/opencode surface theirs.
  // pi mirrors both ways into ``model_override`` (a web pick persists it before
  // the live ``setModel``; a TUI ``/model`` pick posts external_model_change),
  // so like cursor/kiro/opencode the live model is the session override, never
  // the cross-session sticky ``selectedModel``.
  const pickerSelectedModel =
    modelPickerKind === "cursor" ||
    modelPickerKind === "kiro" ||
    modelPickerKind === "opencode" ||
    modelPickerKind === "pi"
      ? sessionModelOverride
      : (sessionModelOverride ?? selectedModel);
  // SDK/bundle agents (no native picker) never have the cross-session sticky
  // applied to them, so their live model is the session's own — the applied
  // override or the bound default — never `selectedModel` (a pick carried over
  // from an unrelated session, e.g. a gpt-5.5 left from a Codex session showing
  // on a Claude-SDK agent like Polly). claude-/codex-native keep `selectedModel`:
  // there the sticky IS the applied model.
  const nonNativeModel =
    modelPickerKind === null
      ? (sessionModelOverride ?? llmModel)
      : (sessionModelOverride ?? selectedModel ?? llmModel);
  const effectiveModel = nativeVendorOwnsModel
    ? modelPickerKind === "cursor" || modelPickerKind === "kiro"
      ? // cursor mirrors its live TUI model into ``model_override``; kiro sets it
        // on a web pick (which also drives a live ``/model`` switch). Either way
        // the Omnigent-visible model is ``model_override``.
        sessionModelOverride
      : modelPickerKind === "opencode" || modelPickerKind === "pi"
        ? // opencode/pi mirror their live TUI model into ``model_override``
          // (set on a web pick, updated by the extension's model_select
          // handler on a TUI switch); show that, falling back to the
          // launch-resolved model before any switch.
          (sessionModelOverride ?? llmModel)
        : null
    : nonNativeModel;
  const modelLabel = formatStatusModelLabel(effectiveModel, codexModelOptions);
  const effortTriggerLabel =
    showEffort && selectedEffort
      ? formatStatusEffortLabel(selectedEffort, modelPickerKind === "codex")
      : null;
  const hasPickerActions = showAgents || modelOptions.length > 0 || showEffort;

  // Before kiro/pi resolve a live model, there is no model to show: kiro until
  // its first session ``.json`` write, pi until its snapshot fills llmModel (or
  // the workspace model-list fetch failed, leaving only the launch model). Fall
  // back to the catalog default (e.g. "Auto") / first option so the trigger
  // reads as a model rather than the harness name ("Kiro" / "Pi").
  const launchFallbackOption =
    modelPickerKind === "kiro" || modelPickerKind === "pi"
      ? (codexModelOptions.find((m) => m.isDefault) ?? codexModelOptions[0])
      : undefined;
  const launchFallbackLabel = launchFallbackOption?.displayName ?? launchFallbackOption?.id;

  // Model in foreground (black), effort in muted (grey). Static fallbacks
  // first; the final `else` returns null so a session with nothing to show
  // and nothing to switch doesn't render an empty disabled pill — its
  // identity is carried by the status tray below.
  let triggerContent: React.ReactNode;
  if (isLoading) {
    triggerContent = "Loading…";
  } else if (!hasAgents) {
    triggerContent = "No agents";
  } else if (modelLabel) {
    triggerContent = (
      <>
        <span className="text-foreground">{modelLabel}</span>
        {effortTriggerLabel && <span className="text-muted-foreground"> {effortTriggerLabel}</span>}
      </>
    );
  } else if (effortTriggerLabel) {
    // Vendor owns the model but effort is still switchable from the web UI.
    triggerContent = <span className="text-muted-foreground">{effortTriggerLabel}</span>;
  } else if (showAgents) {
    // No model/effort to surface, but the user can still switch agents —
    // label the trigger with the current agent so the switcher reads clearly.
    triggerContent = agentDisplayName;
  } else if (hasPickerActions) {
    // The live model/effort isn't resolved yet (e.g. a claude-/codex-native
    // session before the snapshot fills llmModel/selectedEffort: the generated
    // spec may carry no executor model and no sticky/override is set), but the
    // dropdown still has model rows to switch. Keep the trigger rendered — and
    // the model dropdown + bare-`/model` open path reachable — with a stable
    // identity fallback rather than hiding the picker entirely. For kiro/pi,
    // prefer the catalog default (e.g. "Auto") over the agent name so the
    // launch-window label reads as a model.
    triggerContent = launchFallbackLabel ?? agentDisplayName ?? "Model";
  } else {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasAgents || disabled || !hasPickerActions}
          data-testid="agent-picker-trigger"
          className="h-7 min-w-0 shrink gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        >
          <span className="min-w-0 truncate text-xs tabular-nums">{triggerContent}</span>
          {hasPickerActions && <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64 p-1">
        {showAgents && (
          <>
            <PickerSectionHeader>Agents</PickerSectionHeader>
            {agents?.map((a) => (
              <DropdownMenuItem
                key={a.id}
                data-testid="agent-picker-item"
                data-agent-id={a.id}
                data-agent-name={a.name}
                data-active={a.id === selectedId ? "true" : undefined}
                onSelect={() => onSelect(a.id)}
                className={cn(
                  "items-start gap-2 rounded-sm px-2 py-1.5 text-xs",
                  "data-[active=true]:bg-accent/60 data-[active=true]:text-foreground",
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate">{agentDisplayLabel(a.name)}</span>
                  {a.description && (
                    <span className="truncate text-xs text-muted-foreground">{a.description}</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
        {modelOptions.length > 0 && (
          <>
            {!isNativeModelPicker && <DropdownMenuSeparator className="my-1" />}
            <PickerSectionHeader>Models</PickerSectionHeader>
            {modelOptions.map((m) => {
              const isExplicit = pickerSelectedModel === m.id;
              const isImplicit =
                pickerSelectedModel === null &&
                (usesServerModelOptions
                  ? findCodexModelOption(codexModelOptions, llmModel)?.id === m.id
                  : isModelImplicitlySelected(m.id, llmModel));
              const isActive = isExplicit || isImplicit;
              return (
                <DropdownMenuItem
                  key={m.id}
                  data-testid="model-picker-item"
                  data-model-id={m.id}
                  data-active={isActive ? "true" : undefined}
                  onSelect={() =>
                    void useChatStore
                      .getState()
                      .setModel(m.id)
                      .catch(() => {})
                  }
                  className={cn(
                    "items-center gap-2 rounded-sm px-2 py-1.5 text-xs",
                    "data-[active=true]:bg-accent/60 data-[active=true]:text-foreground",
                  )}
                >
                  <span className="flex-1 truncate">
                    {usesServerModelOptions ? (m.displayName ?? m.id) : m.label}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
        {/* Skip the leading rule when Effort is the only section, so the
            dropdown doesn't open with a stray divider at the top. */}
        {showEffort && (
          <>
            {(showAgents || modelOptions.length > 0) && <DropdownMenuSeparator className="my-1" />}
            <PickerSectionHeader>Effort</PickerSectionHeader>
            {effortLevels.map((level) => (
              <DropdownMenuItem
                key={level}
                data-testid="effort-picker-item"
                data-effort-level={level}
                data-active={selectedEffort === level ? "true" : undefined}
                onSelect={() =>
                  void useChatStore
                    .getState()
                    .setEffort(level)
                    .catch(() => {})
                }
                className={cn(
                  "items-center gap-2 rounded-sm px-2 py-1.5 text-xs",
                  modelPickerKind !== "codex" && "capitalize",
                  "data-[active=true]:bg-accent/60 data-[active=true]:text-foreground",
                )}
              >
                <span className="flex-1 truncate">{level}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Category label inside the picker dropdown. Plain ``div``, not
 * ``DropdownMenuLabel``, so Radix doesn't claim focus for it.
 */
function PickerSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
      {children}
    </div>
  );
}
