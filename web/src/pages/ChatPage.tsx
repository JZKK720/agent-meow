import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpIcon,
  CheckIcon,
  AlertTriangleIcon,
  CornerUpLeftIcon,
  CopyIcon,
  FileTextIcon,
  FolderIcon,
  GitForkIcon,
  ImageIcon,
  Loader2Icon,
  MessageSquareIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  TerminalIcon,
  Volume2Icon,
  WifiOffIcon,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { userColor, userColorTint, userInitials } from "@/lib/userBadge";
import { useNavigate, useParams } from "@/lib/routing";
import { hermesVoice } from "@/lib/hermesVoice";
import { readAutoSpeakReplies } from "@/lib/autoSpeakPreferences";
import {
  pauseReadAloud,
  resumeReadAloud,
  stopReadAloud,
} from "@/lib/readAloudAudio";

// Internal: set state to idle after speakText finishes (normal completion).
// stopReadAloud() already sets idle; this covers the all-chunks-played path.
// We can't import a private _setState, so we call stopReadAloud() which is
// idempotent when nothing is playing — it sets idle and clears the audio.

import { useTranslation } from "react-i18next";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { useStickToBottomContext } from "use-stick-to-bottom";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ElicitationCard } from "@/components/blocks/ApprovalCard";
import { BlockRenderer, FilePathAwareMessageResponse } from "@/components/blocks/BlockRenderer";
import { CompactionMarker, RoutingDecisionCard } from "@/components/blocks/StatusBlocks";
import { SystemMessageView } from "@/components/blocks/SystemMessage";
import { isSystemUserContent, parseSystemMessage } from "@/lib/systemMessage";
import { Button } from "@/components/ui/button";
import { MeowCatIcon } from "@/components/icons/MeowCatIcon";
import { AssistantAvatar } from "@/components/AssistantAvatar";
import { WelcomeHero } from "@/components/WelcomeHero";
import { cn } from "@/lib/utils";
import { TurnRail, type Turn } from "@/pages/TurnRail";
import { useSurfaceFrontmost } from "@/hooks/useNativeServerSwitcher";
import {
  isIOSShell,
  onNativeSidebarDrag,
  onNativeViewModeChanged,
  setNativeServerSwitcherHidden,
  setNativeViewMode,
} from "@/lib/nativeBridge";
import { type Agent, useSessionAgent, useAgents } from "@/hooks/useAgents";
import { useConversations } from "@/hooks/useConversations";
import { useFileProducedItems } from "@/hooks/useFileProducedItems";
import { usePermissions } from "@/hooks/usePermissions";
import type {
  CodexModelOption,
  SandboxStatus,
  SessionStatus,
} from "@/lib/types";
import { useIOSNativeKeyboardVisible } from "@/hooks/useIOSNativeKeyboardInset";
import type { MessageContentBlock } from "@/lib/blocks";
import {
  derivePermissionLevel,
  isOwnerLevel,
  isSessionSharedWithOthers,
} from "@/lib/permissionsApi";
import {
  type Bubble,
  type RenderItem,
  type BubbleCache,
  buildBubbles,
  bubblesEqual,
  createBubbleCache,
} from "@/lib/renderItems";
import { getCurrentAuthorId } from "@/lib/identity";
import { codexEffortLevelsForModel } from "@/lib/codexNativeModels";
import {
  type PendingUserMessage,
  type QueuedMessage,
  useChatStore,
} from "@/store/chatStore";
import {
  detectMentionAt,
  type MentionItem,
  mentionItemPath,
  mentionMarkerFor,
  type MentionState,
} from "@/lib/composerMentions";
// Re-exported so existing tests importing these from "./ChatPage" keep working
// after the pure helpers moved to the shared lib.
export { detectMentionAt, mentionMarkerFor };
export type { MentionItem, MentionState };
import { useSession } from "@/hooks/useSession";
import { useSessionRunnerOnline } from "@/hooks/RunnerHealthProvider";
import { useRefreshSessionStateOnRunnerOnline } from "@/hooks/useSessionOnlineRefresh";
import {
  type LivenessRow,
  type SessionLiveness,
  livenessRowFromSession,
  useSessionLiveness,
} from "@/hooks/useSessionLiveness";
import { useMarkConversationSeen } from "@/hooks/useUnseenConversations";
import { useUserMessageNav } from "@/hooks/useUserMessageNav";
import { useWorkingLabelTick } from "@/hooks/useWorkingLabelTick";
import { UserMessageNav } from "@/components/UserMessageNav";
import {
  type CostRoutingVerdict,
  isCostRoutingSession,
  parseCostRoutingVerdict,
} from "@/components/CostRoutingControl";
import { useServerInfo } from "@/lib/CapabilitiesContext";
import { MainTerminalView } from "@/shell/MainTerminalView";
import { UNTITLED_CONVERSATION_LABEL } from "@/shell/sidebarNav";
import { NewChatLandingScreen } from "@/shell/NewChatDialog";
import {
  CHAT_COLUMN_WIDTH,
  Composer,
  composerHarnessLabel,
  shouldAutoSpeakReply,
  speakText,
  splitSlashCommand,
  subAgentComposerLabel,
  useReadAloudState,
  useVoiceActive,
  type ComposerProps,
  type NativeModelPickerKind,
} from "@/shell/SessionComposer";
import { UnifiedWorkPage } from "@/pages/UnifiedWorkPage";
// Re-exports: existing "./ChatPage" importers (tests, Fork/Resume dialogs,
// AppShell) keep their import paths stable after the SessionComposer move.
export {
  CHAT_COLUMN_WIDTH,
  Composer,
  composerHarnessLabel,
  splitSlashCommand,
  subAgentComposerLabel,
  shouldAutoSpeakReply,
  speakText,
  useReadAloudState,
  useVoiceActive,
};
export type { ComposerProps, NativeModelPickerKind };
export { splitForTts, isVoiceActive, isModelImplicitlySelected, formatEffortLabel } from "@/shell/SessionComposer";
export { buildSlashCommandMap, buildSlashCommandWithArgsSet, formatStatusModelLabel, formatModelEffortStatusLabel } from "@/shell/SessionComposer";
import { ResumeWithDirectoryDialog } from "@/shell/ResumeWithDirectoryDialog";
import { ReconnectSessionDialog } from "@/shell/ReconnectSessionDialog";
import { useTerminalFirst } from "@/shell/TerminalFirstContext";
import { useForkDialog } from "@/shell/ForkDialogContext";
import { supportsEffortControl } from "@/lib/sessionCapabilities";
import { isCodexNativeSession } from "@/lib/codexPlanMode";
import { getCliServerUrl } from "@/lib/host";
import { SessionImage } from "@/components/SessionImage";
import { showToast } from "@/components/ui/toast";
import { copyText } from "@/lib/clipboard";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";

// Matches both wordings the native executors emit: "[Attached: <path>]"
// (claude/pi/cursor) and "[Attached file: <path>]" (codex). Capturing group
// is the path. Global so all markers in a message are found / stripped.
const ATTACHED_RE = /\[Attached(?: file)?:\s*([^\]]*)\]\s*/g;

function extractUserText(content: MessageContentBlock[]): string {
  return content
    .filter(
      (c): c is Extract<MessageContentBlock, { type: "input_text" }> => c.type === "input_text",
    )
    .map((c) => c.text)
    .join("")
    .replace(ATTACHED_RE, "")
    .trim();
}

/**
 * Pull the paths out of the "[Attached: …]" markers an "@"-mention adds to a
 * user message, so the bubble can show what was attached (the marker text
 * itself is stripped from the rendered text by {@link extractUserText}). A
 * trailing "/" marks a folder. Returns [] for ordinary messages.
 *
 * Explicitly *uploaded* files share this marker wording: the native executor
 * materializes the upload to disk and injects `[Attached: <abs-path>]` so the
 * vendor CLI can read it. Those uploads already ride in as an
 * `input_image`/`input_file` block (rendered as the image / a file chip), so
 * surfacing them again here would double-render — as the path of an internal
 * bridge temp dir, no less. "@"-mention paths are always workspace-relative
 * while upload markers are absolute, so skip absolute paths (see
 * {@link isAbsolutePath}).
 */
// An absolute filesystem path in any form a native executor might materialize
// an upload to: POSIX ("/…"), Windows drive ("C:\…" or "C:/…"), or UNC
// ("\\host\share"). Workspace "@"-mention paths are always relative, so this
// reliably tells a materialized upload apart from a tagged workspace file
// regardless of the host OS the runner happens to be on.
function isAbsolutePath(p: string): boolean {
  return /^(\/|[A-Za-z]:[\\/]|\\\\)/.test(p);
}

function extractAttachedPaths(content: MessageContentBlock[]): MentionItem[] {
  const text = content
    .filter(
      (c): c is Extract<MessageContentBlock, { type: "input_text" }> => c.type === "input_text",
    )
    .map((c) => c.text)
    .join("");
  const out: MentionItem[] = [];
  for (const m of text.matchAll(ATTACHED_RE)) {
    const raw = m[1].trim();
    if (!raw) continue;
    // Absolute path → a materialized upload, already shown via its file block.
    if (isAbsolutePath(raw)) continue;
    // Split a trailing ":start-end" line span back out so the chip can show
    // it without truncation (it's the whole point of a partial-file attach).
    const range = /^(.*):(\d+)-(\d+)$/.exec(raw);
    if (range) {
      out.push({
        path: range[1],
        isDir: false,
        lineRange: { start: Number(range[2]), end: Number(range[3]) },
      });
    } else {
      out.push({ path: raw.replace(/\/$/, ""), isDir: raw.endsWith("/") });
    }
  }
  return out;
}

const TABLE_SEPARATOR_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

function isMarkdownTableRow(line: string): boolean {
  return line.trim().includes("|");
}

export function containsMarkdownTable(items: RenderItem[]): boolean {
  return items.some((item) => {
    if (item.kind !== "text") return false;
    const lines = item.text.split("\n");
    return lines.some(
      (line, index) =>
        TABLE_SEPARATOR_RE.test(line) &&
        index > 0 &&
        index < lines.length - 1 &&
        isMarkdownTableRow(lines[index - 1] ?? "") &&
        isMarkdownTableRow(lines[index + 1] ?? ""),
    );
  });
}

/** Joins all `kind: "text"` items into a single markdown string for copying. */
export function collectBubbleMarkdown(items: RenderItem[]): string {
  return items
    .filter((item): item is Extract<RenderItem, { kind: "text" }> => item.kind === "text")
    .map((item) => item.text)
    .join("\n\n")
    .trim();
}

/**
 * Build optimistic user bubbles from the pending-send queue.
 *
 * Author priority per bubble: `p.author` (captured at send time for
 * fresh sends, or from the snapshot's `created_by` for replayed entries)
 * falls back to `selfAuthor` (the current viewer's identity).
 * This covers two cases:
 *   1. A fresh send: `selfAuthor` is the viewer; `p.author` is the same
 *      value stamped at `send()` time, so either works.
 *   2. A snapshot-replayed pending entry (reconnect): `p.author` carries
 *      the original sender's email from the server, so a collaborator
 *      reconnecting sees the correct attribution rather than their own
 *      email stamped on someone else's message.
 *
 * `selfAuthor` is null before identity resolves and in single-user
 * mode (no label shown).
 *
 * @param pending - the queued optimistic sends, in FIFO order.
 * @param selfAuthor - the viewer's attribution id, or null.
 */
export function buildPendingBubbles(
  pending: PendingUserMessage[],
  selfAuthor: string | null,
): Bubble[] {
  return pending.map((p) => {
    const author = p.author ?? selfAuthor;
    return {
      kind: "user",
      // No server item id yet; tempId keeps React keys stable until promotion.
      itemId: p.tempId,
      content: p.content,
      ...(author !== null ? { createdBy: author } : {}),
    };
  });
}

// A committed bubble that exists ONLY to render one or more
// REQUEST-phase policy elicitation cards. A REQUEST-phase ASK parks the
// user message server-side (it is not persisted / consumed until the
// human approves — POLICIES.md §7.2), so the message lingers as an
// optimistic pending bubble (and later a consumed committed bubble) while
// its elicitation card arrives as a standalone committed assistant
// bubble. Used by `mergePendingBubbles` and
// `reorderCommittedRequestElicitations` to keep the prompt above the card
// that asks about it, both before and after approval.
function isStandaloneElicitationBubble(bubble: Bubble): boolean {
  // A committed assistant bubble that is ENTIRELY an elicitation card with no
  // turn to anchor to, so it must sit BELOW the user message it gated:
  //   • REQUEST-phase policy ASKs (gate the prompt before any turn), and
  //   • terminal-driven harness gates such as cursor-native `pre_tool_use`,
  //     which never emit `response_created` (blockStream stamps these with
  //     their own `elicit_*` id, so they land as standalone bubbles).
  // A `tool_call` card inside an active SDK turn renders inline — it is grouped
  // WITH the turn, so it is never an all-elicitation standalone bubble — and is
  // intentionally excluded here.
  return (
    bubble.kind === "assistant" &&
    bubble.items.length > 0 &&
    bubble.items.every(
      (it) => it.kind === "elicitation" && (it.phase === "request" || it.phase === "pre_tool_use"),
    )
  );
}

// Pull a committed REQUEST-phase elicitation card below the user message
// it gated.
//
// Once a REQUEST-phase ASK is approved, the parked user message is
// consumed and appended to `blocks` — but AFTER the elicitation card,
// which arrived (and committed) while the message was still parked
// server-side. The committed order is therefore [card, message], so the
// approved card would sit ABOVE the prompt that triggered it. Swap each
// such card with the user bubble that immediately follows it so the
// prompt stays on top, matching the pre-approval pending layout
// (`mergePendingBubbles`). A card with no following user bubble (declined
// / still pending) is left untouched. Returns the input array unchanged
// (same reference) when no swap applies, so the memo stays stable.
export function reorderCommittedRequestElicitations(committed: Bubble[]): Bubble[] {
  let result: Bubble[] | null = null;
  for (let i = 0; i < committed.length - 1; i += 1) {
    if (isStandaloneElicitationBubble(committed[i]!) && committed[i + 1]!.kind === "user") {
      if (result === null) result = [...committed];
      const card = result[i]!;
      result[i] = result[i + 1]!;
      result[i + 1] = card;
    }
  }
  return result ?? committed;
}

// Place optimistic pending user bubbles into the committed timeline.
//
// Pending sends normally trail everything (the input should be visible
// immediately, and they migrate into `blocks` once their
// `session.input.consumed` event lands). The exception is a REQUEST-phase
// policy ASK: that message never gets a consumed event until approval, so
// it stays pending while its elicitation card renders as a committed
// bubble — appending the pending bubble after the card would show the
// approval prompt ABOVE the message that triggered it. When the timeline
// ends in a run of such request-elicitation bubbles, splice the pending
// bubbles in just before that run so the prompt stays on top.
export function mergePendingBubbles(committed: Bubble[], pending: Bubble[]): Bubble[] {
  if (pending.length === 0) return committed;
  let insertAt = committed.length;
  while (insertAt > 0 && isStandaloneElicitationBubble(committed[insertAt - 1]!)) {
    insertAt -= 1;
  }
  if (insertAt === committed.length) return [...committed, ...pending];
  return [...committed.slice(0, insertAt), ...pending, ...committed.slice(insertAt)];
}

type ElicitationItem = Extract<RenderItem, { kind: "elicitation" }>;

// A pending elicitation is unanswered — only these float to the bottom.
function isPendingElicitation(item: RenderItem): item is ElicitationItem {
  return item.kind === "elicitation" && item.status === "pending";
}

// Pending elicitation cards float to the bottom of the chat: lifted out of
// their inline position and re-rendered as the last items in the scroll flow,
// so stick-to-bottom keeps an outstanding question in view no matter how much
// text the agent streams after it (otherwise the card scrolls up off the top
// of the viewport). Collect them in document order — oldest first, so the
// newest sits last, closest to the composer. Once answered, a card drops out
// of this list (status flips to "responded") and stays inline at its natural
// spot (it is no longer removed by `stripPendingElicitations`).
export function collectPendingElicitations(bubbles: Bubble[]): ElicitationItem[] {
  const pending: ElicitationItem[] = [];
  for (const bubble of bubbles) {
    if (bubble.kind !== "assistant") continue;
    for (const item of bubble.items) {
      if (isPendingElicitation(item)) pending.push(item);
    }
  }
  return pending;
}

// Drop the pending elicitation cards from the transcript bubbles so they
// don't render twice — once at the bottom, once inline. Only clones the
// assistant bubbles that actually carry a pending card; every other bubble
// keeps its reference so `BubbleView`'s memo holds. An assistant bubble left
// with no items renders nothing (`AssistantBubble` returns null), so a
// standalone elicitation bubble collapses cleanly while its gating user
// message stays put. Returns the input array unchanged when nothing is
// pending, so the memo stays stable.
export function stripPendingElicitations(bubbles: Bubble[]): Bubble[] {
  let result: Bubble[] | null = null;
  for (let i = 0; i < bubbles.length; i += 1) {
    const bubble = bubbles[i]!;
    if (bubble.kind !== "assistant" || !bubble.items.some(isPendingElicitation)) continue;
    if (result === null) result = [...bubbles];
    result[i] = { ...bubble, items: bubble.items.filter((it) => !isPendingElicitation(it)) };
  }
  return result ?? bubbles;
}

// Whether a user bubble should carry the author's avatar badge (and the
// author-tinted background): only in a shared session, only when a human
// author is attached (agent/tool/system output and pre-attribution
// history leave createdBy undefined), and NEVER on the viewer's own
// messages — you know what you sent; the badge marks OTHER contributors.
export function shouldShowAuthorBadge(
  author: string | undefined,
  viewerId: string | null,
  isSessionShared: boolean,
): boolean {
  return isSessionShared && author !== undefined && author !== viewerId;
}

/**
 * Whether a submitted message should be queued rather than POSTed now.
 *
 * Queue when busy, or when this conversation already has a queued message even
 * if it reads idle: the direct-send and queue-drain paths aren't ordered, so a
 * later direct send could overtake a still-queued earlier one when status
 * flickers idle mid-queue (cursor-native). A new chat always sends.
 *
 * ``waiting`` is NOT busy for queueing: it means the turn already ended and the
 * agent loop is only parked on background work (background shells / sub-agents)
 * — the server's turn gate is already free, so a new message starts a fresh
 * turn immediately instead of stalling behind that background work. (The
 * "Working…" spinner and sidebar dot still treat ``waiting`` as active — those
 * reflect background activity, which is a separate concern from send gating.)
 */
export function shouldQueueSend(
  conversationId: string | null,
  status: "idle" | "streaming",
  sessionStatus: SessionStatus,
  queuedMessages: QueuedMessage[],
): boolean {
  if (conversationId === null) return false;
  const isBusy = status === "streaming" || sessionStatus === "running";
  const hasQueued = queuedMessages.some((m) => m.conversationId === conversationId);
  return isBusy || hasQueued;
}

// Author labels render only in a shared session; ChatPage provides the
// value and UserBubble reads it, so the gate lives in one place.
const SessionSharedContext = createContext(false);

// Iterate code points (not UTF-16 units) so emoji aren't cut mid-surrogate;
// prefer the last word boundary within 10 chars of the limit so we don't
// chop a word in half; trimEnd before the ellipsis so we never emit "foo  …".
function truncateTitle(raw: string, max = 60): string {
  const points = Array.from(raw);
  if (points.length <= max) return raw;
  const slice = points.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max - 10 ? lastSpace : slice.length;
  return slice.slice(0, cut).join("").trimEnd() + "…";
}


/**
 * Single component that drives the chat surface. Streaming + history
 * state lives in `useChatStore` (a Zustand store at module scope), so
 * this component is reactive but not stateful — it observes the store
 * and triggers `switchTo` when the URL changes. The store owns the
 * items fetch (no useConversationItems here).
 */
export function ChatPage() {
  const { conversationId: urlConvId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const {
    data: agents,
    isLoading: agentsLoading,
    error: agentsError,
    refetch: refetchAgents,
  } = useAgents({ enabled: !urlConvId });
  const { data: conversationsData } = useConversations("", true);
  const conversations = useMemo(
    () => conversationsData?.pages.flatMap((p) => p.data),
    [conversationsData],
  );

  // Clear the "unseen messages" sidebar dot for the conversation the
  // user is currently viewing. Re-fires when conversations refresh
  // (every 4 s) so messages arriving while viewing are marked seen.
  useMarkConversationSeen(urlConvId, conversations?.find((c) => c.id === urlConvId)?.updated_at);

  // Sync the store's active conversation to the URL. Single source of
  // truth: URL is what's "current"; store mirrors it. The effect is
  // the minimal unified surface for all URL change paths — sidebar
  // clicks (which also navigate), browser Back/Forward (no handler),
  // initial mount with a deep-linked URL, and the eager URL update
  // from `send` (no-op due to switchTo's self-skip).
  //
  // switchTo is async (it fetches items on conv-id transitions); we
  // intentionally don't await it here. The store's `loadingConversation` flag
  // drives the loading UI below; `conversationLoadError` drives the error UI.
  useEffect(() => {
    void useChatStore.getState().switchTo(urlConvId ?? null);
  }, [urlConvId]);

  // Server-driven redirect: when the active conversation is superseded
  // (a `session.superseded` event — e.g. a Claude `/clear` rotated it
  // away), the store records the follow-to target in
  // `redirectToConversationId`. Perform the router navigation here (the
  // store can't), replacing history so Back doesn't return to the
  // cleared session, then clear the flag so it fires exactly once. Skip
  // when we're already on the target URL.
  const redirectToConversationId = useChatStore((s) => s.redirectToConversationId);
  useEffect(() => {
    if (!redirectToConversationId) return;
    if (redirectToConversationId !== urlConvId) {
      navigate(`/c/${redirectToConversationId}`, { replace: true });
    }
    useChatStore.setState({ redirectToConversationId: null });
  }, [redirectToConversationId, urlConvId, navigate]);


  // Subscribe to the bits of store state we render. Each is a
  // primitive selector so re-renders fire only when that specific
  // field changes — no `useShallow` needed.
  const blocks = useChatStore((s) => s.blocks);
  const pendingUserMessages = useChatStore((s) => s.pendingUserMessages);
  const activeResponse = useChatStore((s) => s.activeResponse);
  const interruptedResponseIds = useChatStore((s) => s.interruptedResponseIds);
  const status = useChatStore((s) => s.status);
  const sandboxStatus = useChatStore((s) => s.sandboxStatus);
  // True while the session's managed-sandbox launch is still running
  // (a failed launch is NOT "launching" — it gets normal unreachable
  // handling). Overrides the liveness-derived unreachable affordances
  // below, which misread the not-yet-host-bound session as stranded.
  const sandboxLaunching = sandboxStatus !== null && sandboxStatus.stage !== "failed";
  // Read runner liveness from the app-level batch poller (see
  // RunnerHealthProvider). `undefined` = not yet polled — the indicator
  // stays hidden until the first poll for this session resolves.
  const runnerOnline = useSessionRunnerOnline(urlConvId);
  useRefreshSessionStateOnRunnerOnline(urlConvId, runnerOnline);
  // OR'd into "Working…" so cross-client turns surface a shimmer.
  const sessionStatus = useChatStore((s) => s.sessionStatus);
  const backgroundTaskCount = useChatStore((s) => s.backgroundTaskCount);
  const loadingConversation = useChatStore((s) => s.loadingConversation);
  const conversationLoadError = useChatStore((s) => s.conversationLoadError);
  const boundAgentId = useChatStore((s) => s.boundAgentId);
  const boundAgentName = useChatStore((s) => s.boundAgentName);
  // Fallback for session-scoped agents (created by `omnigent run --server`):
  // the sessions-derived list only carries id+name, so fetch the full
  // agent object for the active session. Drives the picker's
  // name/description; the same react-query cache also feeds the header
  // info icon (AgentInfoButton) its tools & policies.
  const { data: boundAgentBySession } = useSessionAgent(urlConvId ?? null);
  const hasMoreHistory = useChatStore((s) => s.hasMoreHistory);
  const loadingMoreHistory = useChatStore((s) => s.loadingMoreHistory);

  // Build bubbles once per blocks/activeResponse change. Memo here so
  // unrelated store updates (status, loading flags) don't re-walk.
  // Pending user messages (POSTed but not yet acked by
  // `session.input.consumed`) render as trailing user bubbles so the
  // input is visible immediately. They migrate into `blocks` the moment
  // their consumed event arrives.
  // Per-surface reuse cache so a streaming append rebuilds only the
  // active bubble, reusing the finalized prefix by reference.
  const bubbleCacheRef = useRef<BubbleCache>(createBubbleCache());
  // Polls the runner workspace registry for files reported as created
  // during this session and emits one `file_produced` RenderItem per
  // created file. Appended to the last assistant bubble below so the
  // chips surface inline at the tail of the chat stream (the renderer
  // already dispatches `file_produced` to the file chip component).
  const fileProducedItems = useFileProducedItems(urlConvId ?? undefined);
  const bubbles = useMemo<Bubble[]>(() => {
    // A REQUEST-phase elicitation card commits before the user message it
    // gates: while pending, the message is an optimistic trailing bubble
    // (`mergePendingBubbles` lifts it above the card); once approved, the
    // consumed message lands in `blocks` AFTER the card
    // (`reorderCommittedRequestElicitations` swaps the card below it).
    // Both keep the prompt on top across the pending → approved flip.
    const committed = reorderCommittedRequestElicitations(
      buildBubbles(blocks, activeResponse, bubbleCacheRef.current, interruptedResponseIds),
    );
    // claude-native live previews are NOT trailing bubbles — they live in
    // `blocks` as provisional `live:*` text blocks at their streamed
    // position (see chatStore), so they render in-order with later tool /
    // elicitation cards. The optimistic pending user message trails too,
    // except when the timeline ends in a REQUEST-phase elicitation card.
    let base =
      pendingUserMessages.length === 0
        ? committed
        : mergePendingBubbles(
            committed,
            buildPendingBubbles(pendingUserMessages, getCurrentAuthorId()),
          );
    // Append produced-file chips to the last assistant bubble so they
    // render inline at the end of the stream. New array + new bubble
    // object keeps the build immutable; earlier bubbles stay referentially
    // stable so the render cache and TurnRail previews are unaffected.
    if (fileProducedItems.length > 0) {
      for (let i = base.length - 1; i >= 0; i -= 1) {
        const b = base[i];
        if (b.kind === "assistant") {
          base = base.slice();
          base[i] = { ...b, items: [...b.items, ...fileProducedItems] };
          break;
        }
      }
    }
    return base;
  }, [blocks, activeResponse, interruptedResponseIds, pendingUserMessages, fileProducedItems]);

  // ── Auto-speak replies (voiceback for the dictation path) ───────────────
  //
  // The composer mic used to run through the Hermes voice pipeline, which
  // spoke every reply. Server dictation (whisper/sherpa) replaced it with a
  // text-only transcript → composer → submit flow, so replies arrived as
  // silent bubbles. This effect restores voiceback: when a send's response
  // completes and the preference is on, read the reply through the same TTS
  // path the manual "Read aloud" button uses.
  //
  // `activeResponse` only flips to "completed" for a turn this client
  // streamed, so reloading a conversation never re-speaks history. The
  // spoken-ids set makes the edge fire-once even if the store re-commits
  // the same terminal state. Skipped while a voice session is connected —
  // the voice transport posts to the same session and already speaks its
  // own turns; speaking here would double the audio.
  const spokenResponseIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (activeResponse === null || activeResponse.state !== "completed") return;
    const responseId = activeResponse.responseId;
    if (!responseId || spokenResponseIdsRef.current.has(responseId)) return;
    const bubble = [...bubbles]
      .reverse()
      .find(
        (b): b is Extract<Bubble, { kind: "assistant" }> =>
          b.kind === "assistant" && b.responseId === responseId,
      );
    if (!bubble) return;
    const voiceSessionActive = hermesVoice.getState() === "connected";
    if (
      !shouldAutoSpeakReply({
        lifecycle: bubble.lifecycle,
        text: collectBubbleMarkdown(bubble.items),
        autoSpeakEnabled: readAutoSpeakReplies(),
        voiceSessionActive,
        alreadySpoken: false,
      })
    ) {
      return;
    }
    spokenResponseIdsRef.current.add(responseId);
    void speakText(collectBubbleMarkdown(bubble.items));
  }, [activeResponse, bubbles]);

  // Picker selection. ChatPage stays mounted across `/` to `/c/:id`,
  // so the pick survives sidebar clicks; resets on full page reload.
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const agentId = selectedAgentId ?? agents?.[0]?.id ?? null;

  // Sync the picker to the conversation's bound agent when switching.
  // `boundAgentId` is `null` on `/`, during the snapshot fetch, and
  // for legacy conversations without an agent binding — leave the
  // picker alone in those cases.
  //
  // On the landing page, if the bound agent isn't in the cached list
  // (e.g. a new agent registered by a fresh `omnigent run` after load),
  // refetch on demand — useAgents is only enabled there.
  useEffect(() => {
    if (boundAgentId === null) return;
    setSelectedAgentId(boundAgentId);
    if (agents && !agents.some((a) => a.id === boundAgentId)) {
      void refetchAgents();
    }
  }, [boundAgentId, agents, refetchAgents]);

  // Queue-then-flush (plan-040 Phase 1): the landing's first turn sits in
  // `startSessionRequest` (status "creating") while the session is created.
  // The moment the session binds (agentId resolved + conversationId bound,
  // same hydration gate the old auto-send used — sending before bindStream
  // connects would lose the turn's events on the no-replay live-tail), the
  // queued turn flushes through the store. A failed flush parks the queue
  // in "failed" with a retry affordance instead of silently dropping it.
  const startRequest = useChatStore((s) => s.startSessionRequest);
  useEffect(() => {
    if (!startRequest || startRequest.status !== "creating") return;
    if (!agentId || !urlConvId) return;
    const { send, sendSlashCommand, flushQueuedSession } = useChatStore.getState();
    void flushQueuedSession(agentId, send, sendSlashCommand).catch(() => {
      useChatStore.getState().failQueuedSession("Send failed — retry from the composer");
    });
  }, [startRequest, agentId, urlConvId]);

  // Open state owned here (not inside MainAgentSurface) so the dialog
  // survives a re-mount of the chat surface. Declared BEFORE the
  // loading/error early-returns below — hooks must run in the same
  // order every render.
  // Unbound coding-clone resume: the directory picker, plus the message
  // the user tried to send (replayed once the bind brings the runner
  // online). Declared before the early-return guards (Rules of Hooks).
  const [resumeDirDialogOpen, setResumeDirDialogOpen] = useState(false);
  // The message the user tried to send into an unbound coding clone,
  // PINNED to the session it was typed in. ChatPage stays mounted across
  // `/c/:a → /c/:b`, so without the `sessionId` pin a stashed prompt
  // would replay into whatever session is active when a runner next comes
  // online — leaking the message into a different conversation. Keyed by
  // session id, it only ever replays into the clone it was meant for.
  const [pendingResumePrompt, setPendingResumePrompt] = useState<{
    sessionId: string;
    text: string;
    files: File[];
  } | null>(null);

  // Replay the queued message once the picker's bind brings the runner
  // online — but ONLY while still viewing the session it was pinned to.
  // Waiting on runnerOnline (not firing immediately after the POST) avoids
  // racing the runner's async boot — same readiness gate the initial-prompt
  // effect uses. If the user switched away before the clone started, the
  // prompt stays pinned and waits; it never floats into another session.
  useEffect(() => {
    if (pendingResumePrompt === null || !agentId || !urlConvId) return;
    if (pendingResumePrompt.sessionId !== urlConvId) return;
    if (runnerOnline !== true) return;
    const { text, files } = pendingResumePrompt;
    setPendingResumePrompt(null);
    void useChatStore.getState().send(text, agentId, files);
  }, [pendingResumePrompt, runnerOnline, agentId, urlConvId]);

  // Opened when the user tries to interact with an unreachable session
  // (host offline, or not host-bound with the runner down).
  const [reconnectDialogOpen, setReconnectDialogOpen] = useState(false);

  // Pending elicitation = parked on user input — suppress shimmer. Must
  // sit before the early-return guards below (Rules of Hooks).
  const hasPendingElicitation = useMemo(
    () => blocks.some((b) => b.type === "elicitation" && b.status === "pending"),
    [blocks],
  );

  // Single-session snapshot (shared cache with chatStore.bindStream).
  // Must be declared BEFORE the early-return guards below — otherwise
  // the hook is skipped on renders that hit the loading/error branches,
  // tripping React's "rendered fewer hooks than expected".
  const { session: activeSession, isLoading: sessionLoading } = useSession(urlConvId ?? null);

  // Hoisted above the guards; the turn-start/turn-end ["session", id] invalidations refresh it (no new polling).
  const activeSessionLabels = activeSession?.labels;
  const costRoutingVerdict = useMemo(
    () => parseCostRoutingVerdict(activeSessionLabels),
    [activeSessionLabels],
  );
  // Orchestrator-only: polly's children inherit its agentName, so the gate
  // needs the session predicate (parent linkage), not a bare name check.
  const serverInfo = useServerInfo();
  const costRoutingEligible =
    serverInfo !== "loading" &&
    serverInfo.smart_routing_enabled &&
    isCostRoutingSession(activeSession);

  // Non-null only when the active session is a sub-agent (child): the
  // composer then peeks a "Chatting with sub-agent …" tray and the
  // scroll-pinned "Working…" tab is suppressed (the tray owns that slot).
  const subAgentLabel = subAgentComposerLabel(activeSession);

  // Hoisted above the early-return guards so the title-update effect can read them.
  const activeConv = urlConvId ? conversations?.find((c) => c.id === urlConvId) : null;

  // `isWorking` gates the parent's OWN turn (Stop/Interrupt) and must NOT
  // include child-session activity. `showsWorking` is display-only (tab title
  // + shimmer/pill) for the main chat and is suppressed mid-elicitation or
  // when the runner is known offline.
  const isWorking = !hasPendingElicitation && computeIsWorking(sessionStatus);
  const showsWorking = computeShowsWorking(sessionStatus, {
    hasPendingElicitation,
    runnerOnline,
    backgroundTaskCount,
  });

  // A fork of a coding session carries the source id in this label (set by
  // fork_conversation). It is provenance — it persists after the clone is
  // bound — so it identifies the source (for the picker's prefill) but is
  // NOT sufficient to decide whether to OPEN the picker. Prefer the
  // snapshot's labels, falling back to the sidebar row.
  const forkSourceId =
    activeSession?.labels?.["agent_meow.fork.source_id"] ??
    activeConv?.labels?.["agent_meow.fork.source_id"] ??
    null;
  // Only an *unbound* fork (no workspace yet) routes the offline guard to
  // the directory picker — which binds + launches. A bound fork that is
  // merely offline gets the CLI reconnect dialog like any other session;
  // opening the picker for it would 400 ("already has a runner bound").
  // Mirrors the server's needs_workspace flag (fork label + workspace NULL).
  const isUnboundFork = isUnboundCodingFork({
    forkSourceId,
    workspace: activeSession?.workspace ?? activeConv?.workspace ?? null,
  });

  // Author labels show only once a session is shared. A non-owner viewer
  // already implies a share; the owner needs the grant list (manage-only,
  // which the owner can read) to know they granted access to anyone else.
  // Hooks stay above the early-return guards (rules-of-hooks).
  const viewerId = getCurrentAuthorId();
  const sessionOwner = activeConv?.owner ?? null;
  const viewerOwnsSession = sessionOwner !== null && sessionOwner === viewerId;
  const { data: ownerGrants } = usePermissions(viewerOwnsSession ? (urlConvId ?? null) : null);
  const isSessionShared = isSessionSharedWithOthers(sessionOwner, viewerId, ownerGrants);

  // The open session's derived liveness — the single signal the chat
  // surface switches on to pick the right affordance (normal chat, a
  // non-blocking "wake the runner" hint, or the reconnect
  // dialog). See `useSessionLiveness`. `runnerOnline` above is still read
  // directly for terminal-view gating (the PTY is dead the moment the
  // runner tunnel drops, independent of host state).
  // `turnActive` (the chat-level status is "streaming" the instant a send
  // is dispatched) upgrades an asleep-but-host-up session to `starting`:
  // sending to a stopped runner relaunches it, and the user should see the
  // same "Connecting…" intermediate as a fresh launch rather than a gap.
  //
  // Fall back to the single-session snapshot when the sidebar row is absent
  // (a directly-opened `/c/:id`, a child/sub-agent, or an off-page session)
  // so `host_id` still reaches the hook — otherwise a host-bound, host-down
  // session misclassifies as `local_stranded` and shows the wrong reconnect
  // path. See `livenessRowFromSession`.
  //
  // Always source `host_resumable` from the session snapshot — the sidebar
  // `Conversation` row doesn't carry it. activeSession is loaded for the open
  // session, so a host-bound, host-down session whose host is a resumable
  // managed host classifies as `host_asleep` (composer open, send wakes it)
  // instead of dead-ending on `host_offline`.
  //
  // Also prefer the snapshot's `permissionLevel` over the sidebar row's when
  // it's resolved: the hook derives `host_offline`'s `isOwner` from this
  // level, and a deployment whose session list is owner-only (the caller's
  // effective level omitted, e.g. the Databricks-managed server) leaves the
  // row's `permission_level` null — which would read permissively as "owner"
  // and offer a non-owner the host-reconnect path. The single-session
  // snapshot always carries the authoritative level.
  const livenessRow: LivenessRow | null = activeConv
    ? {
        ...activeConv,
        permission_level: activeSession?.permissionLevel ?? activeConv.permission_level,
        host_resumable: activeSession?.hostResumable ?? false,
      }
    : livenessRowFromSession(activeSession);
  const liveness = useSessionLiveness(urlConvId ?? undefined, livenessRow, {
    turnActive: status === "streaming",
  });

  // Browser tab title: "● Title" while the main session is working so
  // background tabs signal parent activity without duplicating child-session
  // badges from the sidebar/Agents rail. An open-but-untitled session
  // (no synthesized title yet) reads as "New session" to match its
  // sidebar row; the landing page (no active session) stays "agent-meow".
  // Sub-agent (child) sessions are absent from the sidebar list, so
  // ``activeConv`` is null and the title would otherwise read "New session";
  // name the tab after the sub-agent instead, mirroring the header.
  const subAgentTabTitle =
    activeSession?.parentSessionId != null
      ? (boundAgentBySession?.name ?? boundAgentName ?? subAgentLabel ?? null)
      : null;
  useEffect(() => {
    const fallback = urlConvId ? UNTITLED_CONVERSATION_LABEL : "agent-meow";
    const base = truncateTitle(activeConv?.title ?? subAgentTabTitle ?? fallback);
    document.title = showsWorking ? `● ${base}` : base;
  }, [activeConv?.title, subAgentTabTitle, showsWorking, urlConvId]);

  const codexModelOptions = useChatStore((s) => s.codexModelOptions);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const llmModel = useChatStore((s) => s.llmModel);

  // Loading + error gates for `/c/:id` hydration.
  if (urlConvId) {
    if (loadingConversation) return <HydratingPlaceholder />;
    if (conversationLoadError) {
      return <ConversationLoadError conversationId={urlConvId} error={conversationLoadError} />;
    }
  }

  // The session is unreachable and a message can't wake it: the host is
  // offline (host-bound) or it isn't host-bound and the runner is down.
  // `runner_asleep` is deliberately NOT here — there the host relaunches
  // the runner on the next message, so the send must go through.
  // An in-flight managed-sandbox launch also looks unreachable to
  // liveness (no host bound yet) but is the opposite: the server parks
  // the next message on the launch rendezvous and forwards it once the
  // sandbox is up, so the send must go through. A FAILED launch keeps
  // normal unreachable handling.
  const isUnreachable =
    !sandboxLaunching && (liveness.kind === "host_offline" || liveness.kind === "local_stranded");

  function onSend(text: string, files?: File[]) {
    if (!agentId) return;
    // An unbound coding clone (fork-source label) needs a directory before
    // it can run: open the picker and stash this message to replay after
    // the bind. Pin the prompt to THIS session so it replays here, never
    // into a session the user may switch to first; carry any attachments
    // so the replay sends the same payload.
    if (urlConvId && runnerOnline === false && isUnboundFork) {
      setPendingResumePrompt({ sessionId: urlConvId, text, files: files ?? [] });
      setResumeDirDialogOpen(true);
      return;
    }
    // Unreachable → no executor to dispatch this turn to, and no host to
    // wake. Surface the reconnect dialog instead of POSTing into
    // a void.
    if (urlConvId && isUnreachable) {
      setReconnectDialogOpen(true);
      return;
    }
    // Queue instead of POSTing now (see shouldQueueSend). enqueueMessage flushes
    // FIFO immediately when genuinely idle, so nothing stalls.
    const chat = useChatStore.getState();
    if (
      shouldQueueSend(chat.conversationId, chat.status, chat.sessionStatus, chat.queuedMessages)
    ) {
      chat.enqueueMessage(text, files);
      return;
    }
    void useChatStore.getState().send(text, agentId, files, {
      onConversationCreated: (newId) => {
        // Eager URL update: the moment the server tells us this
        // conversation's id, promote `/` → `/c/:newId`. Replace (not
        // push) so the back button takes the user wherever they came
        // from rather than to a stale `/`.
        navigate(`/c/${newId}`, { replace: true });
      },
    });
  }

  function onSendSlashCommand(name: string, args: string) {
    if (!agentId) return;
    // Slash commands aren't replayed (an edge), but still route an unbound
    // coding clone to the directory picker so it isn't a dead end.
    if (urlConvId && runnerOnline === false && isUnboundFork) {
      setResumeDirDialogOpen(true);
      return;
    }
    if (urlConvId && isUnreachable) {
      setReconnectDialogOpen(true);
      return;
    }
    void useChatStore.getState().sendSlashCommand(name, args, agentId, {
      onConversationCreated: (newId) => {
        navigate(`/c/${newId}`, { replace: true });
      },
    });
  }

  function onStop() {
    useChatStore.getState().stop();
  }

  // Sub-agent (child) sessions aren't returned by the sidebar list, so
  // ``activeConv`` is null for them — the snapshot (fetched above as
  // ``activeSession``) is the only place we can learn the user's
  // effective permission level for a child.
  const permissionLevel = derivePermissionLevel(
    activeSession,
    sessionLoading,
    activeConv,
    urlConvId,
    conversationsData !== undefined,
  );
  const readOnlyReason = readOnlyReasonForSessionLabels(activeSession, activeConv);
  // Once present, the live session snapshot is authoritative.
  const capabilitySource = {
    labels: activeSession ? (activeSession.labels ?? {}) : (activeConv?.labels ?? {}),
  };
  const modelPickerKind = modelPickerKindForConv(capabilitySource);
  const effortLevels = effortLevelsForConv(
    capabilitySource,
    codexModelOptions,
    selectedModel ?? llmModel,
  );
  const showEffort = shouldShowEffortPicker(capabilitySource) && effortLevels.length > 0;

  // When inside a session, only show the bound agent — the session is
  // tied 1:1 to its runner and can't be reassigned. Show all agents on
  // `/` (no active session) so the picker still works for future CLI-
  // started sessions.
  // Prefer the full agent object (with mcp_servers) from the session
  // endpoint when viewing a conversation. Fall back to the sessions-
  // derived list for the `/` (no session) picker view.
  const visibleAgents = boundAgentId
    ? boundAgentBySession
      ? [boundAgentBySession]
      : boundAgentName
        ? [{ id: boundAgentId, name: boundAgentName } as Agent]
        : agents?.filter((a) => a.id === boundAgentId)
    : agents;

  const mainAgent = (
    <MainAgentSurface
      conversationId={urlConvId ?? null}
      bubbles={bubbles}
      status={status}
      isWorking={isWorking}
      showsWorking={showsWorking}
      runnerOnline={runnerOnline}
      liveness={liveness}
      agentsError={agentsError}
      disabled={!agentId || agentsError !== null}
      onSend={onSend}
      onSendSlashCommand={onSendSlashCommand}
      onStop={onStop}
      onShowReconnectHelp={() => {
        // Route the banner to the SAME dialog typing a message would: an
        // unbound coding clone opens the directory picker (bind + launch),
        // everything else gets the reconnect dialog.
        if (isUnboundFork) setResumeDirDialogOpen(true);
        else setReconnectDialogOpen(true);
      }}
      agents={visibleAgents}
      agentsLoading={agentsLoading}
      selectedAgentId={agentId}
      onSelectAgent={setSelectedAgentId}
      hasMoreHistory={hasMoreHistory}
      loadingMoreHistory={loadingMoreHistory}
      permissionLevel={permissionLevel}
      readOnlyReason={readOnlyReason}
      effortLevels={effortLevels}
      showEffort={showEffort}
      showModels={modelPickerKind !== null}
      modelPickerKind={modelPickerKind}
      codexModelOptions={codexModelOptions}
      showCodexPlanMode={shouldShowCodexPlanModeControl(capabilitySource)}
      showGoalControl={shouldShowGoalControl(capabilitySource)}
      costRoutingVerdict={costRoutingVerdict}
      costRoutingEligible={costRoutingEligible}
      subAgentLabel={subAgentLabel}
    />
  );

  // Unified workspace page (plan-040 Phase 1): the landing renders through
  // the page shell — the hero region collapses (store-driven, no URL read)
  // and the shell is the seam Task 3 uses to unify the composer across
  // landing and session. The landing keeps its own composer card in this
  // task; its submit path flips to queue-then-flush in Task 3.
  if (!urlConvId) {
    return (
      <UnifiedWorkPage
        hero={<NewChatLandingScreen />}
        stream={null}
        composer={null}
      />
    );
  }

  // Pick the reconnect dialog's state from liveness. The dialog only
  // opens for the two unreachable variants; `host_offline` carries
  // ownership (a non-owner can't reach the host machine). Any other
  // liveness defaults to `local_stranded` — harmless since the dialog
  // stays closed unless an unreachable interaction opened it.
  const reconnectState = liveness.kind === "host_offline" ? "host_offline" : "local_stranded";
  const reconnectIsOwner = liveness.kind === "host_offline" ? liveness.isOwner : true;

  return (
    <SessionSharedContext.Provider value={isSessionShared}>
      <SessionLayout mainAgent={mainAgent} />
      <ReconnectSessionDialog
        open={reconnectDialogOpen}
        onOpenChange={setReconnectDialogOpen}
        conversationId={urlConvId}
        serverUrl={getCliServerUrl()}
        wrapper={activeConv?.labels?.["agent_meow.wrapper"]}
        state={reconnectState}
        isOwner={reconnectIsOwner}
        // Source prefill for the Clone tab's fork form. Mirrors AppShell's
        // ForkSessionDialog wiring; the title additionally falls back to the
        // sidebar row, which ChatPage has at hand.
        sourceTitle={activeConv?.title ?? activeSession?.title}
        sourceWorkspace={activeSession?.workspace}
        sourceHostId={activeSession?.hostId}
        sourceGitBranch={activeSession?.gitBranch}
      />
      {isUnboundFork && forkSourceId && (
        <ResumeWithDirectoryDialog
          open={resumeDirDialogOpen}
          onOpenChange={setResumeDirDialogOpen}
          sessionId={urlConvId}
          sourceSessionId={forkSourceId}
          serverUrl={getCliServerUrl()}
          wrapper={activeConv?.labels?.["agent_meow.wrapper"]}
        />
      )}
    </SessionSharedContext.Provider>
  );
}

interface SessionLayoutProps {
  mainAgent: React.ReactNode;
}

/**
 * Inside a conversation: wraps the chat surface. The terminals panel
 * and right rail are managed by AppShell and rendered outside this
 * component as flex siblings.
 *
 * The embedded browser pane is NOT here — it lives as the "Browser"
 * tab inside the right Workspace rail (WorkspacePanel), so it never floats as a
 * mid-page column.
 */
function SessionLayout({ mainAgent }: SessionLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">{mainAgent}</div>
    </div>
  );
}

function SelectionPopup({
  containerRef,
  onReply,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  onReply: (text: string) => void;
}) {
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const selectedTextRef = useRef<string>("");

  const updatePopup = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPopupPos(null);
      selectedTextRef.current = "";
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      setPopupPos(null);
      selectedTextRef.current = "";
      return;
    }

    // Scope to the conversation container — ignore selections in the composer.
    const container = containerRef.current;
    if (!container) {
      setPopupPos(null);
      selectedTextRef.current = "";
      return;
    }
    const anchor = sel.anchorNode;
    if (!anchor || !container.contains(anchor)) {
      setPopupPos(null);
      selectedTextRef.current = "";
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    // Position the button just above the selection, horizontally centered.
    setPopupPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    selectedTextRef.current = text;
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener("mouseup", updatePopup);
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("mouseup", updatePopup);
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  if (!popupPos) return null;

  return (
    <div
      style={{
        position: "fixed",
        // Translate left by 50% to center the button over the midpoint of the
        // selection, and up by 100% + 6px to sit just above the selection rect.
        left: popupPos.x,
        top: popupPos.y,
        transform: "translate(-50%, calc(-100% - 6px))",
        zIndex: 50,
      }}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        // Override shared-variant translucent hover — this button floats over text.
        className="gap-1 shadow-md hover:bg-secondary hover:brightness-95 dark:hover:brightness-110"
        onMouseDown={(e) => {
          // Prevent the mousedown from clearing the selection before we read it.
          e.preventDefault();
        }}
        onClick={() => {
          const text = selectedTextRef.current;
          if (text) {
            onReply(text);
            window.getSelection()?.removeAllRanges();
            setPopupPos(null);
            selectedTextRef.current = "";
          }
        }}
      >
        <CornerUpLeftIcon className="size-3.5" />
        Reply ↵
      </Button>
    </div>
  );
}

interface MainAgentSurfaceProps {
  /**
   * Active conversation id, or null when on the landing page. Forwarded
   * to MainTerminalView so the inline terminal can target the right
   * session in terminal-first mode.
   */
  conversationId: string | null;
  bubbles: Bubble[];
  status: "idle" | "streaming";
  /** Local stream OR cross-client `session.status: running`. Gates the
   *  composer's Stop/Interrupt button — the parent's OWN turn only. */
  isWorking: boolean;
  /** Display-only main-chat indicator after elicitation/offline gates.
   *  Never includes child-session activity and never gates Stop/Interrupt. */
  showsWorking: boolean;
  /**
   * Strict runner-tunnel liveness, used only to gate the inline terminal
   * view (the PTY dies the moment the runner tunnel drops). The reconnect
   * affordances key off `liveness` instead.
   */
  runnerOnline: boolean | undefined;
  /** Derived open-session liveness — drives the reconnect hint/banner. */
  liveness: SessionLiveness;
  agentsError: unknown;
  disabled: boolean;
  onSend: (text: string, files?: File[]) => void;
  /**
   * Invoke a skill via the `slash_command` event path. Gated off inside
   * `MainAgentSurface` for terminal-first (native) sessions, where `/skill`
   * is sent as plaintext for the vendor TUI to handle. See
   * `ComposerProps.onSendSlashCommand`.
   */
  onSendSlashCommand?: (name: string, args: string) => void;
  onStop: () => void;
  onShowReconnectHelp: () => void;
  agents: Agent[] | undefined;
  agentsLoading: boolean;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  /** Whether older messages exist that haven't been loaded yet. */
  hasMoreHistory: boolean;
  /** Whether a load-more fetch is currently in flight. */
  loadingMoreHistory: boolean;
  permissionLevel: number | null;
  /** Forces composer read-only with the given placeholder when non-null. See ``ComposerProps.readOnlyReason``. */
  readOnlyReason: string | null;
  effortLevels: readonly string[];
  /** Show effort controls. */
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
  /** Latest advisor verdict for the cost-routing pill; null when none. */
  costRoutingVerdict: CostRoutingVerdict | null;
  /** Session passes `isCostRoutingSession` (polly orchestrator, not a child). */
  costRoutingEligible: boolean;
  /**
   * Sub-agent instance label when the active session is a child, e.g.
   * ``"check-account-eligibility"``; ``null`` for top-level sessions.
   * Drives the composer's "Chatting with sub-agent …" tray and suppresses
   * the scroll-pinned "Working…" tab (the tray takes that slot). See
   * ``subAgentComposerLabel``.
   */
  subAgentLabel: string | null;
}

/**
 * Whether terminal-first sessions should replace chat with the inline
 * terminal surface. Runner health is intentionally ignored: an offline
 * stopped/resumable session still needs the empty terminal page so the
 * user can resume from there.
 */
export function shouldShowTerminalSurface(
  conversationId: string | null,
  terminalFirst:
    | {
        isTerminalFirst: boolean;
        view: "chat" | "terminal";
      }
    | null
    | undefined,
  _runnerOnline: boolean | undefined,
): boolean {
  return (
    !!conversationId && terminalFirst?.isTerminalFirst === true && terminalFirst.view === "terminal"
  );
}

/**
 * The conversation scroll surface + composer — the content of the
 * "Main Agent" tab (and also the standalone view on `/`).
 *
 * In terminal-first sessions, when the connection pill is set to
 * Terminal, the conversation + composer are replaced by an inline
 * `MainTerminalView`. The pill itself stays visible (rendered via
 * `ConnectionIndicator`) so the user can flip back to Chat.
 */
function MainAgentSurface({
  conversationId,
  bubbles,
  status,
  isWorking,
  showsWorking,
  runnerOnline,
  liveness,
  agentsError,
  disabled,
  onSend,
  onSendSlashCommand,
  onStop,
  onShowReconnectHelp,
  agents,
  agentsLoading,
  selectedAgentId,
  onSelectAgent,
  hasMoreHistory,
  loadingMoreHistory,
  permissionLevel,
  readOnlyReason,
  effortLevels,
  showEffort,
  showModels,
  modelPickerKind,
  codexModelOptions,
  showCodexPlanMode,
  showGoalControl = false,
  costRoutingVerdict,
  costRoutingEligible,
  subAgentLabel,
}: MainAgentSurfaceProps) {
  const { t } = useTranslation();
  const terminalFirst = useTerminalFirst();
  // The turn rail is a hover minimap with no mobile affordance (CSS-hidden
  // under `md`). Gate its MOUNT — not just its visibility — on the viewport so
  // mobile never runs its eager history backfill (up to 2000 items/open) for a
  // rail the user can't see.
  const isMobileViewport = useIsMobileViewport();
  // Mirrors ChatPage's `sandboxLaunching`: while the managed-sandbox
  // launch runs, the composer must stay sendable — the server parks
  // the message on the launch rendezvous — even though liveness reads
  // the not-yet-host-bound session as stranded.
  const sandboxStatus = useChatStore((s) => s.sandboxStatus);
  const sandboxLaunching = sandboxStatus !== null && sandboxStatus.stage !== "failed";
  // True while the harness reports MCP-server startup state (codex-native).
  // Forces the message-flow branch below even with zero bubbles, so a user
  // staring at a fresh session during a slow MCP boot sees the startup band
  // instead of a bare "What should we work on?" empty state.
  const mcpStartupActive = useChatStore((s) => s.mcpStartup !== null);
  // Render the inline terminal whenever the user has opted in via the
  // connection pill. The terminal surface owns its no-terminal state,
  // including stopped/resumable sessions, and the connection indicator
  // remains below it for offline sessions.
  const showTerminal = shouldShowTerminalSurface(conversationId, terminalFirst, runnerOnline);

  // All hook calls below must run on every render regardless of
  // `showTerminal` — Rules of Hooks. The early return for the terminal
  // branch lives below, after every hook has run.

  // Single nav instance shared by hotkey + buttons (see useUserMessageNav).
  // System-message bubbles (`[System: ...]` notifications rendered via
  // SystemMessageView) are excluded — the hotkey is for navigating real
  // user turns, not runtime markers.
  const userMessageIds = useMemo(
    () =>
      bubbles
        .filter(
          (b): b is Extract<Bubble, { kind: "user" }> => b.kind === "user" && !isSystemBubble(b),
        )
        .map((b) => b.itemId),
    [bubbles],
  );
  const nav = useUserMessageNav(userMessageIds);

  // One rail tick per real user turn, paired with a preview of the reply that
  // followed. Walk bubbles in order: each non-system user bubble opens a turn,
  // and the first assistant text after it (before the next user bubble) is the
  // preview. Same first-page window as the transcript, so a fresh load shows
  // ≤20 ticks and older ones page in on scroll-up.
  const turns = useMemo<Turn[]>(() => {
    const out: Turn[] = [];
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      if (b.kind !== "user" || isSystemBubble(b)) continue;
      let preview = "";
      for (let j = i + 1; j < bubbles.length; j++) {
        const next = bubbles[j];
        // Stop at the next REAL user turn only. A system-marker user bubble
        // isn't a tick of its own, so breaking on it would strand this turn
        // with a blank preview even though its reply follows the marker.
        if (next.kind === "user" && !isSystemBubble(next)) break;
        if (next.kind === "assistant") {
          const textItem = next.items.find((it) => it.kind === "text" && it.text.trim());
          if (textItem && textItem.kind === "text") {
            preview = textItem.text.trim();
            break;
          }
        }
      }
      out.push({
        itemId: b.itemId,
        userText: extractUserText(b.content),
        responsePreview: preview.slice(0, 240),
      });
    }
    return out;
  }, [bubbles]);

  // Pending elicitation cards float to the bottom of the chat: rendered as the
  // last items in the scroll flow and removed from their inline position so
  // they don't render twice. Stick-to-bottom then keeps an outstanding
  // question in view instead of letting trailing text scroll it off the top.
  // Answered cards stay inline at their natural spot. `streamBubbles` keeps
  // `bubbles`' reference when nothing is pending, so the common case allocates
  // nothing.
  const pendingElicitations = useMemo(() => collectPendingElicitations(bubbles), [bubbles]);
  const streamBubbles = useMemo(
    () => (pendingElicitations.length === 0 ? bubbles : stripPendingElicitations(bubbles)),
    [bubbles, pendingElicitations.length],
  );

  // Cmd+Alt+↑/↓ (Ctrl+Alt on win/linux) — guarded so the composer's
  // own unmodified ArrowUp/Down history-recall still works.
  useEffect(() => {
    // globalThis prefix because React's KeyboardEvent is imported above.
    const handler = (e: globalThis.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.altKey) return;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest('textarea, input, [contenteditable="true"]')
      ) {
        return;
      }
      e.preventDefault();
      if (e.key === "ArrowUp") nav.goPrev();
      else nav.goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nav]);

  // Active reply quotes — each "Reply ↵" click appends; consumed by Composer.
  const [replyQuotes, setReplyQuotes] = useState<string[]>([]);

  // Ref forwarded to SelectionPopup to scope selection detection to the
  // conversation area, preventing selections in the composer from triggering
  // the popup. Mirrored into state (`containerEl`) so JumpToTopButton — which
  // renders inside this wrapper, outside the mask-faded scroll viewport — can
  // attach its hover listeners to the wrapper (the common ancestor of both the
  // scroll area and the pill, so moving the cursor onto the pill keeps it live).
  const conversationRef = useRef<HTMLElement | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const setConversationEl = useCallback((el: HTMLDivElement | null) => {
    conversationRef.current = el;
    setContainerEl(el);
  }, []);
  const [terminalSurfaceEl, setTerminalSurfaceEl] = useState<HTMLElement | null>(null);
  // True only while the chat/terminal surface is the frontmost thing on screen.
  // Drives both native overlays so neither floats over an opened drawer.
  const surfaceFrontmost = useSurfaceFrontmost(
    showTerminal ? terminalSurfaceEl : containerEl,
    !!conversationId,
  );
  useEffect(() => {
    if (!isIOSShell()) return;
    setNativeServerSwitcherHidden(!surfaceFrontmost);
  }, [surfaceFrontmost]);
  useEffect(() => {
    if (!isIOSShell()) return;
    return () => setNativeServerSwitcherHidden(true);
  }, []);
  // The conversation's scroll container + the StickToBottom controls needed to
  // override its bottom-lock, lifted out of the context by
  // ConversationScrollRefBridge so the pinned-but-unmasked JumpToTopButton can
  // read and drive the scroll.
  const [scroller, setScroller] = useState<ConversationScroller | null>(null);
  // While the iOS edge-swipe is driving the sidebar drawer, make the transcript
  // ignore the finger so it doesn't scroll along with the drag. On iOS the page
  // is viewport-locked, so the transcript scrolls as an inner overflow:auto
  // element (`scroller.el`) that the native shell can't reach via
  // webView.scrollView — it has to be frozen here in the DOM. The native drag
  // stream marks when a drag is live; for its duration the scroller stops
  // responding to touch (pointer-events:none), its overflow is locked, and its
  // scroll offset is pinned so neither a finger-drag nor leftover momentum can
  // move it. Everything is restored when the drag settles (open/close).
  useEffect(() => {
    const el = scroller?.el;
    if (!el) return;
    let frozenTop: number | null = null;
    const pin = () => {
      if (frozenTop != null) el.scrollTop = frozenTop;
    };
    const freeze = () => {
      if (frozenTop != null) return;
      frozenTop = el.scrollTop;
      el.style.pointerEvents = "none";
      el.style.overflowY = "hidden";
      el.addEventListener("scroll", pin);
    };
    const thaw = () => {
      if (frozenTop == null) return;
      el.removeEventListener("scroll", pin);
      el.style.pointerEvents = "";
      el.style.overflowY = "auto";
      frozenTop = null;
    };
    const unsubscribe = onNativeSidebarDrag((phase) => {
      if (phase === "begin" || phase === "move") freeze();
      else thaw();
    });
    return () => {
      unsubscribe();
      thaw();
    };
  }, [scroller]);
  const [sendScrollNonce, setSendScrollNonce] = useState(0);
  const handleSend = useCallback(
    (text: string, files?: File[]) => {
      setSendScrollNonce((n) => n + 1);
      onSend(text, files);
    },
    [onSend],
  );
  // Wrap the slash-command sender the same way (scroll to bottom on send).
  // Gated off for native-wrapper sessions (claude-native / codex-native):
  // there the composer's `/skill` must reach the vendor TUI as plaintext
  // (the server has no slash_command path for native sessions). Undefined
  // → the composer falls through to the plaintext send for these. Keyed
  // on the wrapper label, NOT `isTerminalFirst` — a terminal-first SDK
  // session (embedded agent-meow REPL terminal) runs an in-process harness
  // with the full server-side slash_command path.
  const isTerminalFirst = terminalFirst?.isTerminalFirst === true;
  const isNativeWrapper = terminalFirst?.isNativeWrapper === true;
  const handleSendSlashCommand = useMemo(
    () =>
      onSendSlashCommand && !isNativeWrapper
        ? (name: string, args: string) => {
            setSendScrollNonce((n) => n + 1);
            onSendSlashCommand(name, args);
          }
        : undefined,
    [onSendSlashCommand, isNativeWrapper],
  );

  // "Working…" stays lit for the whole busy turn — through streaming text,
  // tool runs, and reasoning gaps — including after a reload that hydrates
  // `running` before any bubbles exist locally. Only a trailing compaction
  // spinner suppresses it (that bubble owns the slot with its own animation).
  const showWorkingIndicator = shouldShowWorkingIndicator(showsWorking, bubbles);

  if (showTerminal && conversationId) {
    return (
      <>
        <MainTerminalView
          conversationId={conversationId}
          initialTerminalKey={terminalFirst?.terminalViewKey}
          onSurfaceElement={setTerminalSurfaceEl}
          // Non-owners attach read-only: a shared PTY can't attribute
          // input per-user, so only the owner may type. They drive the
          // agent via the composer instead. Server enforces this too.
          readOnly={!isOwnerLevel(permissionLevel)}
        />
        <ConnectionIndicator
          liveness={liveness}
          onShowReconnectHelp={onShowReconnectHelp}
          surfaceFrontmost={surfaceFrontmost}
        />
      </>
    );
  }

  return (
    <>
      {/* Wrapper div gives us a ref to scope the SelectionPopup to the
          conversation area without requiring Conversation to forward refs. */}
      <div ref={setConversationEl} className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* chat-scroll-fade masks the viewport's top edge so scrolling
            content dissolves into the canvas before reaching the
            ChatHeader overlay's controls (geometry in index.css). */}
        <Conversation className="chat-scroll-fade flex-1">
          {/* gap-4 overrides ConversationContent's default gap-8 so consecutive agent turns read as one thread.
              md:pl-12 opens a gap between the left-edge TurnRail (24px wide) and
              the message column so the ticks don't butt against the text; the
              rail is hidden on mobile, so the extra left padding is md-only. */}
          <ConversationContent
            className={cn(
              "chat-conversation-content mx-auto w-full gap-4 pt-20 pb-6 md:pl-12",
              CHAT_COLUMN_WIDTH,
            )}
          >
            {/* Scroll helpers — must live inside StickToBottom to access context. */}
            <ScrollToBottomOnSend nonce={sendScrollNonce} />
            <PreserveScrollDistanceOnResize />
            <ConversationScrollRefBridge onScroller={setScroller} />
            <HistoryAutoLoader
              hasMoreHistory={hasMoreHistory}
              loadingMoreHistory={loadingMoreHistory}
            />
            {bubbles.length === 0 && !showWorkingIndicator && !mcpStartupActive ? (
              // Cold launch: a centered spinner instead of the "ready to
              // type" empty state (the create-then-send path uses the
              // "row" variant). Two launch shapes land here: a
              // terminal-first spin-up (gate on isTerminalFirst too —
              // terminalStartingUp is set for non-terminal-first sessions
              // as well) and a managed-sandbox launch, whose stage text
              // renders in the same spot for ANY session type.
              (terminalFirst?.isTerminalFirst && terminalFirst.terminalStartingUp) ||
              sandboxLaunching ? (
                <RunnerStartingIndicator variant="hero" />
              ) : (
                <ConversationEmptyState>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-medium tracking-[-0.02em]">
                      {t("chat.emptyTitle", "What should we work on?")}
                    </h3>
                    <p className="text-muted-foreground text-base">
                      {agentsError
                        ? `Failed to load agents: ${agentsError instanceof Error ? agentsError.message : String(agentsError)}`
                        : t("chat.emptyBody", "Send a message to get started.")}
                    </p>
                  </div>
                </ConversationEmptyState>
              )
            ) : (
              <>
                {streamBubbles.length > 0 && streamBubbles[0]?.kind === "assistant" && (
                  <WelcomeHero />
                )}
                {streamBubbles.map((bubble) => (
                  <BubbleView key={bubbleKey(bubble)} bubble={bubble} />
                ))}
                {/* Pending elicitation cards, floated to the bottom of the
                    chat so an outstanding question stays in view (stick-to-
                    bottom) no matter how much text the agent streamed after
                    it. Wrapped in an assistant Message so each matches an
                    inline card's look; removed from their inline slot by
                    `stripPendingElicitations`. Newest renders last, nearest
                    the composer. Rendered ABOVE the Working… indicator so the
                    card sits closest to the prompt and the shimmer stays the
                    last thing in the flow. */}
                {pendingElicitations.map((item) => (
                  <Message
                    key={item.elicitationId}
                    from="assistant"
                    className="max-w-full"
                    data-testid="bottom-elicitation"
                  >
                    <MessageContent className="w-full">
                      <ElicitationCard item={item} />
                    </MessageContent>
                  </Message>
                ))}
                {/* Working… shimmer, lit for the whole busy turn so the user
                    always sees the session is still going. Suppressed when the
                    last bubble is a compaction spinner — that bubble already
                    owns the "in-progress" slot. aria-hidden: the pinned pill
                    owns the single aria-live region (see WorkingStatusPin). */}
                {showWorkingIndicator && <WorkingIndicator />}
                {/* Terminal-first spin-up cue beneath the just-sent first
                    message: the prompt bubble renders immediately (no
                    runner-online send gate), but `showWorkingIndicator` stays
                    suppressed while the runner is offline, so without this the
                    user's message sits with no sign anything is happening.
                    Self-gates to null off the spin-up window; rendered only
                    when not already showing Working… so the two never stack. */}
                {!showWorkingIndicator && <RunnerStartingIndicator variant="row" />}
                {/* MCP-server startup band (codex-native): renders while the
                    harness boots its MCP servers and, after startup settles,
                    when servers failed or were cancelled. Independent of the
                    Working… shimmer — it is strictly more specific about why
                    the turn hasn't produced output yet. */}
                <McpStartupIndicator />
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
          {/* Outside ConversationContent so it's pinned to the viewport, not the scroll. See WorkingStatusPin.
              Suppressed in a sub-agent session: the composer's "Chatting with sub-agent …" tray owns this slot. */}
          <WorkingStatusPin show={showWorkingIndicator} suppress={subAgentLabel != null} />
          <UserMessageNavConnected
            goPrev={nav.goPrev}
            goNext={nav.goNext}
            canPrev={nav.canPrev}
            canNext={nav.canNext}
            hidden={userMessageIds.length === 0}
          />
        </Conversation>
        {/* Hover the top edge to reveal a pill that loads all older history and
            scrolls to the first message. Rendered here (a wrapper sibling of
            Conversation) rather than inside it so it escapes the chat-scroll-fade
            mask and can sit right at the fade border. */}
        <JumpToTopButton
          containerEl={containerEl}
          scroller={scroller}
          hasMoreHistory={hasMoreHistory}
        />
        {/* Left-edge minimap: one tick per turn, scrolls independently, pages
            in older history on scroll-up. Sibling of Conversation for the same
            reason as JumpToTopButton — it escapes the chat-scroll-fade mask.
            Desktop-only: not mounted on mobile so its eager backfill never
            runs where the rail is hidden. */}
        {!isMobileViewport && (
          <TurnRail
            turns={turns}
            scroller={scroller}
            hasMoreHistory={hasMoreHistory}
            loadingMoreHistory={loadingMoreHistory}
          />
        )}
      </div>
      {/* Floating reply button — scoped to the conversation container. */}
      <SelectionPopup
        containerRef={conversationRef}
        onReply={(text) => setReplyQuotes((prev) => [...prev, text])}
      />

      <Composer
        disabled={disabled}
        status={status}
        isWorking={isWorking}
        onSend={handleSend}
        onSendSlashCommand={handleSendSlashCommand}
        onStop={onStop}
        agents={agents}
        agentsLoading={agentsLoading}
        selectedAgentId={selectedAgentId}
        onSelectAgent={onSelectAgent}
        permissionLevel={permissionLevel}
        readOnlyReason={readOnlyReason}
        replyQuotes={replyQuotes}
        onRemoveQuote={(i) => setReplyQuotes((prev) => prev.filter((_, idx) => idx !== i))}
        onClearAllQuotes={() => setReplyQuotes([])}
        effortLevels={effortLevels}
        showEffort={showEffort}
        showModels={showModels}
        modelPickerKind={modelPickerKind}
        codexModelOptions={codexModelOptions}
        showCodexPlanMode={showCodexPlanMode}
        showGoalControl={showGoalControl}
        isTerminalFirst={isTerminalFirst}
        isNativeWrapper={isNativeWrapper}
        reconnectHint={liveness.kind === "runner_asleep" || liveness.kind === "host_asleep"}
        sandboxAsleepHint={liveness.kind === "host_asleep"}
        unreachable={
          !sandboxLaunching &&
          (liveness.kind === "host_offline" || liveness.kind === "local_stranded")
        }
        hostOffline={!sandboxLaunching && liveness.kind === "host_offline"}
        onShowReconnectHelp={onShowReconnectHelp}
        costRoutingVerdict={costRoutingVerdict}
        costRoutingEligible={costRoutingEligible}
        subAgentLabel={subAgentLabel}
      />

      {/* Chat/Terminal toggle for terminal-first sessions, reconnect-or-
          fork banner when unreachable, nothing otherwise. Sits below the
          composer so its position is consistent with the terminal view. */}
      <ConnectionIndicator
        liveness={liveness}
        onShowReconnectHelp={onShowReconnectHelp}
        surfaceFrontmost={surfaceFrontmost}
      />
    </>
  );
}

function HydratingPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground text-sm">
      <Loader2Icon className="size-4 animate-spin" />
      Loading conversation…
    </div>
  );
}

/**
 * Error state for `/c/:id` when the items endpoint fails. Shown
 * verbatim instead of falling through to the chat surface so the user
 * sees the problem (instead of a blank chat that silently posts to a
 * non-existent conversation on next send). Most common cause: invalid
 * conversation id in the URL — surfaces quickly because the store's
 * items fetch disables retries.
 */
function ConversationLoadError({
  conversationId,
  error,
}: {
  conversationId: string;
  error: Error;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <h1 className="font-medium text-foreground text-lg">Conversation not found</h1>
        <p className="text-muted-foreground text-sm">
          Couldn't load{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{conversationId}</code>
          : {error.message}
        </p>
        {/* Route to the home composer ("/"), which owns session creation. */}
        <Button type="button" variant="outline" onClick={() => navigate("/")}>
          Start a new chat
        </Button>
      </div>
    </div>
  );
}

/**
 * Adds scroll-state CSS classes to UserMessageNav. The responsive behavior
 * itself stays in Tailwind classes: hidden below `md` only while pinned to
 * the bottom, visible again as soon as the user scrolls up.
 */
function UserMessageNavConnected(props: React.ComponentProps<typeof UserMessageNav>) {
  const { isAtBottom } = useStickToBottomContext();
  return (
    <UserMessageNav
      {...props}
      // Mobile-only: the TurnRail (a hover minimap) replaces these buttons on
      // desktop, but mobile has no hover, so the ↑↓ nav stays there. Hidden at
      // the bottom on mobile too — nothing above to page up to matters less
      // than keeping the composer area clear. Keyboard ⌘⌥↑↓ still works on all
      // sizes regardless of the buttons.
      className={cn(props.className, "md:hidden", isAtBottom && "max-md:hidden")}
    />
  );
}

/**
 * Scroll-pinned "Working…" pill — sole aria-live region (inline shimmer is
 * aria-hidden).
 *
 * @param show - True while the main session is working; gates both the
 *   aria-live announcement and the painted tab.
 * @param suppress - Hides the painted tab without silencing the aria-live
 *   region (still gated on ``show``). Set in a sub-agent session, where the
 *   composer's "Chatting with sub-agent …" tray rises in this same slot and
 *   the "Working…" tab would otherwise stack on top of it.
 */
function WorkingStatusPin({ show, suppress = false }: { show: boolean; suppress?: boolean }) {
  const { isAtBottom } = useStickToBottomContext();
  const bgCount = useChatStore((s) => s.backgroundTaskCount);
  const tick = useWorkingLabelTick();
  const visible = show && !isAtBottom && !suppress;
  return (
    <div
      // Always mounted (the aria-live region announces on show); bottom-0 sits
      // it flush on the composer so the tab reads as rising from behind it.
      role="status"
      aria-live="polite"
      data-testid="working-indicator-pin"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* The single announced string. Held stable at "Working…" so the rotating
          tab text below never re-announces every few seconds. Present whenever
          the agent is working, so it announces whether the tab is painted
          (scrolled up) or collapsed (at the bottom, where the inline shimmer
          owns the visuals). */}
      {show && <span className="sr-only">Working…</span>}
      {/* Mirror the conversation content column (mx-auto + px-6 + width) so the
          tab's left edge lines up with the inline shimmer's. */}
      <div className={cn("mx-auto w-full px-6", CHAT_COLUMN_WIDTH)}>
        {show && (
          // Tab shape (rounded top, no bottom border, composer-matching bg) so
          // its flat bottom edge merges into the chat box. aria-hidden: the
          // sr-only span above owns the announcement, so the rotating label
          // here stays silent to screen readers. Collapses to sr-only when at
          // the bottom (`!visible`) — the inline shimmer paints there instead.
          <div
            aria-hidden="true"
            className={cn(
              "flex w-fit items-center gap-1.5 rounded-t-lg border border-b-0 border-border bg-card px-3 pt-1 pb-1.5",
              !visible && "sr-only",
            )}
          >
            <MeowCatIcon className="meowcat-working h-4 w-auto shrink-0" />
            <Shimmer className="text-xs font-mono" duration={1.5}>
              {workingIndicatorLabel(bgCount, tick)}
            </Shimmer>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Forces the conversation back to the bottom when this client submits a
 * new message. StickToBottom intentionally respects a user who has scrolled
 * up while streaming, but an explicit send should bring the fresh user bubble
 * and ensuing response back into view.
 */
function ScrollToBottomOnSend({ nonce }: { nonce: number }) {
  const { scrollToBottom } = useStickToBottomContext();

  useLayoutEffect(() => {
    if (nonce === 0) return;
    scrollToBottom("instant");
    requestAnimationFrame(() => scrollToBottom("instant"));
  }, [nonce, scrollToBottom]);

  return null;
}

/**
 * Preserves the transcript's distance-from-bottom whenever its scroll container
 * resizes on the iOS shell — so the content you're looking at stays put while
 * the soft keyboard opens/closes (and while the composer grows on focus).
 *
 * Two things resize the container, and neither is handled by `use-stick-to-
 * bottom` (which only re-anchors on *content* resize): the keyboard, via
 * `useIOSViewportLock` shrinking the app-shell; and the composer growing taller
 * when focused (its send row / status line), which steals flex height from the
 * transcript a couple of lines at a time — *without* firing a visualViewport
 * resize. Watching only visualViewport missed the composer growth, which is why
 * the transcript crept up ~2 lines on focus.
 *
 * So we watch the scroll container itself with a `ResizeObserver` and, on any
 * size change, hold the scroll position relative to the bottom constant:
 * `scrollTop = scrollHeight - clientHeight - distance`. `distance` is tracked
 * from genuine user scrolls only — scrolls that coincide with a dimension change
 * (the resize's own clamp, or our restore) are ignored so they can't corrupt it.
 * At the bottom (distance 0) you stay at the bottom; scrolled up reading
 * history, you keep seeing the same messages. New messages still go through the
 * library (content resize doesn't change the container's box). Stateless across
 * any number of keyboard cycles.
 */
function PreserveScrollDistanceOnResize() {
  const ctx = useStickToBottomContext() as ReturnType<typeof useStickToBottomContext> & {
    scrollRef?: React.RefObject<HTMLElement>;
  };
  const scrollRef = ctx.scrollRef;

  useEffect(() => {
    if (!isIOSShell()) return;
    const el = scrollRef?.current;
    if (!el) return;

    const measure = () => el.scrollHeight - el.clientHeight - el.scrollTop;
    let distance = Math.max(0, measure());
    let prevSH = el.scrollHeight;
    let prevCH = el.clientHeight;

    const onScroll = () => {
      const sh = el.scrollHeight;
      const ch = el.clientHeight;
      // A scroll that lands on the same frame as a size change is resize-induced
      // (the browser's clamp, or our own restore below) — not the user. Skip it
      // so it can't overwrite the distance we're trying to preserve.
      if (sh !== prevSH || ch !== prevCH) {
        prevSH = sh;
        prevCH = ch;
        return;
      }
      distance = Math.max(0, measure());
    };

    const observer = new ResizeObserver(() => {
      el.scrollTop = el.scrollHeight - el.clientHeight - distance;
      prevSH = el.scrollHeight;
      prevCH = el.clientHeight;
    });

    el.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [scrollRef]);

  return null;
}

/**
 * Headless older-history loader. Pages older session items in two ways
 * with no visible control:
 *
 * 1. Near-top scroll trigger — fetches as the user scrolls toward the top.
 * 2. Viewport-fill guard — when the loaded window is too short to produce a
 *    scrollbar (so the scroll trigger can never fire), keeps paging until
 *    the content overflows or history runs out, keeping older messages
 *    reachable without a button.
 *
 * Must be rendered inside a `StickToBottom` tree to access `scrollRef`.
 *
 * @param hasMoreHistory - Whether older messages exist before the loaded window.
 * @param loadingMoreHistory - Whether an older-history page is currently loading.
 */
export function HistoryAutoLoader({
  hasMoreHistory,
  loadingMoreHistory,
}: {
  hasMoreHistory: boolean;
  loadingMoreHistory: boolean;
}) {
  // useStickToBottomContext exposes scrollRef (the actual scroll container
  // element) in the runtime context even though the public TS types only
  // declare isAtBottom and scrollToBottom. Cast to access it.
  const ctx = useStickToBottomContext() as ReturnType<typeof useStickToBottomContext> & {
    scrollRef: React.RefObject<HTMLElement>;
  };

  // Preserve scroll position when items are prepended after a scroll-up
  // fetch. Snapshot scrollHeight before the call; restore the offset in a
  // layout effect so the visible content doesn't jump.
  const prevScrollHeightRef = useRef<number | null>(null);
  const loadOlderPreservingOffset = useCallback(() => {
    if (!hasMoreHistory || loadingMoreHistory) return;
    const el = ctx.scrollRef?.current;
    if (el) prevScrollHeightRef.current = el.scrollHeight;
    void useChatStore.getState().loadMoreHistory();
  }, [ctx.scrollRef, hasMoreHistory, loadingMoreHistory]);

  useLayoutEffect(() => {
    const el = ctx.scrollRef?.current;
    // Wait until loadingMoreHistory is false — the prepend render that grows
    // scrollHeight is the one to correct. Consuming the snapshot earlier
    // would null the ref before the prepend lands, causing a scroll jump.
    if (!el || prevScrollHeightRef.current === null || loadingMoreHistory) return;
    const delta = el.scrollHeight - prevScrollHeightRef.current;
    if (delta > 0) el.scrollTop += delta;
    prevScrollHeightRef.current = null;
  });

  useEffect(() => {
    const el = ctx.scrollRef?.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop < 300 && hasMoreHistory && !loadingMoreHistory) {
        loadOlderPreservingOffset();
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [ctx.scrollRef, hasMoreHistory, loadingMoreHistory, loadOlderPreservingOffset]);

  // Viewport-fill guard. When the loaded window is too short to overflow, page
  // again so older history stays reachable without a scrollbar to scroll up.
  // No offset snapshot here: with a short window the user sits at the bottom
  // and use-stick-to-bottom keeps them pinned as older items prepend.
  const maybeFillViewport = useCallback(() => {
    const el = ctx.scrollRef?.current;
    if (!el || !hasMoreHistory || loadingMoreHistory) return;
    if (el.scrollHeight <= el.clientHeight) {
      void useChatStore.getState().loadMoreHistory();
    }
  }, [ctx.scrollRef, hasMoreHistory, loadingMoreHistory]);

  // Re-check on mount and whenever a fetch settles (loadingMoreHistory flips
  // back to false): if content still doesn't overflow, the callback pages again.
  useEffect(() => {
    maybeFillViewport();
  }, [maybeFillViewport]);

  // Re-check when the viewport grows (window resize, side panel close): a
  // previously-scrollable window can stop overflowing, removing the scrollbar
  // and stranding older history with nothing left to trigger a fetch.
  useEffect(() => {
    const el = ctx.scrollRef?.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => maybeFillViewport());
    observer.observe(el);
    return () => observer.disconnect();
  }, [ctx.scrollRef, maybeFillViewport]);

  // No visible control — history loads purely on scroll-up / viewport fill.
  return null;
}

/**
 * The conversation's scroll container plus the minimal StickToBottom controls
 * the JumpToTopButton needs to override the library's bottom-lock. `state` is a
 * stable, mutable object: clearing `isAtBottom`/`escapedFromLock` makes the
 * resize-driven `scrollToBottom({preserveScrollPosition})` — fired on every
 * history prepend — bail instead of yanking the view back to the bottom.
 */
type ConversationScroller = {
  el: HTMLElement;
  state: { isAtBottom: boolean; escapedFromLock: boolean };
  stopScroll: () => void;
};

/**
 * Lifts the StickToBottom scroll container (and lock controls) out of the
 * context so a sibling rendered *outside* `<Conversation>` (and thus outside
 * its `chat-scroll-fade` mask) can still read and drive it. `scrollRef`,
 * `state`, and `stopScroll` are stable identities (see HistoryAutoLoader for
 * the runtime-vs-types cast). Renders nothing.
 */
function ConversationScrollRefBridge({
  onScroller,
}: {
  onScroller: (s: ConversationScroller | null) => void;
}) {
  const ctx = useStickToBottomContext() as ReturnType<typeof useStickToBottomContext> & {
    scrollRef: React.RefObject<HTMLElement>;
    state: ConversationScroller["state"];
    stopScroll: () => void;
  };
  useEffect(() => {
    // Runs after commit, when StickToBottom has populated scrollRef.current.
    const el = ctx.scrollRef?.current ?? null;
    onScroller(el ? { el, state: ctx.state, stopScroll: ctx.stopScroll } : null);
    return () => onScroller(null);
  }, [ctx.scrollRef, ctx.state, ctx.stopScroll, onScroller]);
  return null;
}

/**
 * Hover-revealed "Jump to top" pill, mirroring {@link ConversationScrollButton}
 * but for the other end. Hovering near the top edge of the conversation
 * surfaces a pill at the fade border; clicking it pages in every older history
 * block (the conversation is lazily paginated — see {@link HistoryAutoLoader})
 * and then scrolls to the very first message.
 *
 * Rendered as a sibling of `<Conversation>`, not a child: the scroll viewport's
 * top ~80px is mask-faded (`chat-scroll-fade`), so a pill inside it would fade
 * out too. Sitting in the wrapper keeps it at full opacity right at the fade
 * line, and `z-40` lifts it over the `z-30` ChatHeader so it stays clickable.
 *
 * Hover is detected in JS off the **wrapper** (`containerEl`), the common
 * ancestor of both the scroll area and this pill — listening on the scroll
 * element instead would fire `mouseleave` the instant the cursor crossed onto
 * the pill (a non-descendant), killing the click. `scroller` carries the inner
 * scroll container plus the StickToBottom lock controls.
 *
 * @param containerEl - The conversation wrapper; hover/anchor reference.
 * @param scroller - Scroll container + lock controls (ConversationScrollRefBridge).
 * @param hasMoreHistory - Whether older messages exist before the loaded window.
 */
export function JumpToTopButton({
  containerEl,
  scroller,
  hasMoreHistory,
}: {
  containerEl: HTMLElement | null;
  scroller: ConversationScroller | null;
  hasMoreHistory: boolean;
}) {
  const [atTop, setAtTop] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [jumping, setJumping] = useState(false);
  // Reveal the pill while the user is scrolling up, then fade it back out once
  // they pause — so it's reachable without having to find the top hover band.
  const [scrolledUp, setScrolledUp] = useState(false);

  // How long the pill lingers after the last upward scroll before fading out.
  const SCROLL_REVEAL_MS = 2000;

  // Pixels below the conversation's top edge that count as "hovering the top".
  // Comfortably clears the pill (anchored at the fade border, ~50px) so moving
  // onto it to click never drops the hover state.
  const HOVER_BAND_PX = 140;

  // Hover detection on the wrapper so the pill (a wrapper child) stays in-band.
  useEffect(() => {
    if (!containerEl) return;
    const onMove = (e: MouseEvent) => {
      const next = e.clientY - containerEl.getBoundingClientRect().top < HOVER_BAND_PX;
      // Only commit on a transition — mousemove fires continuously, and React
      // bails on a no-op setState anyway, but skipping it avoids the work.
      setHovering((prev) => (prev === next ? prev : next));
    };
    const onLeave = () => setHovering(false);
    containerEl.addEventListener("mousemove", onMove, { passive: true });
    containerEl.addEventListener("mouseleave", onLeave);
    return () => {
      containerEl.removeEventListener("mousemove", onMove);
      containerEl.removeEventListener("mouseleave", onLeave);
    };
  }, [containerEl]);

  // Track whether the loaded window is scrolled to its very top, and reveal the
  // pill whenever the user scrolls up (auto-hiding after they pause).
  const scrollEl = scroller?.el ?? null;
  useEffect(() => {
    if (!scrollEl) return;
    let lastTop = scrollEl.scrollTop;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const top = scrollEl.scrollTop;
      const next = top <= 1;
      setAtTop((prev) => (prev === next ? prev : next));
      // Upward scroll (and not already pinned to the top): show the pill and
      // (re)arm the idle timer that fades it out once scrolling settles.
      if (top < lastTop - 1 && top > 1) {
        setScrolledUp(true);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setScrolledUp(false), SCROLL_REVEAL_MS);
      }
      lastTop = top;
    };
    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(hideTimer);
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [scrollEl]);

  // Somewhere to go: older pages exist, or we're scrolled down within the
  // loaded window. At the very first message there's nothing to jump to.
  const canJump = hasMoreHistory || !atTop;
  const visible = jumping || ((hovering || scrolledUp) && canJump);

  const jumpToTop = useCallback(async () => {
    if (!scroller) return;
    const { el, state, stopScroll } = scroller;
    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    setJumping(true);
    try {
      // Release StickToBottom's bottom-lock. Without this, every history prepend
      // resizes the content and the library's ResizeObserver yanks the view back
      // to the bottom (scrollToBottom with preserveScrollPosition, which sticks
      // whenever state.isAtBottom is true) — so our scrollTop=0 lost the fight
      // and only a *second* click (everything already loaded, no resizes) won.
      // Clearing the lock here makes those prepend-driven scrolls bail.
      stopScroll();
      state.isAtBottom = false;
      state.escapedFromLock = true;

      // Page in every older block before scrolling. loadMoreHistory serializes
      // via its own loadingMoreHistory guard (so a concurrent HistoryAutoLoader
      // fetch is harmless), and flips hasMoreHistory to false at the start of
      // history or on error. The rAF wait yields a frame for the prepend to
      // commit and for the in-flight flag to settle between pages. The
      // iteration cap is a backstop against a server that never reports done.
      for (let i = 0; i < 1000 && useChatStore.getState().hasMoreHistory; i++) {
        await useChatStore.getState().loadMoreHistory();
        // Keep the lock released — a prepend that briefly lands us near the
        // bottom can otherwise re-arm it via the library's scroll handler.
        state.isAtBottom = false;
        state.escapedFromLock = true;
        await nextFrame();
      }
      // Pin to the very top, re-asserting across frames until it holds. The last
      // prepends keep growing scrollHeight after the store settles, and
      // HistoryAutoLoader's offset-preservation can bump scrollTop right after
      // we zero it. Force 0 each frame until it stays 0 for two consecutive
      // frames (or we hit the frame cap).
      for (let i = 0, stable = 0; i < 60 && stable < 2; i++) {
        if (el.scrollTop === 0) stable += 1;
        else {
          el.scrollTop = 0;
          stable = 0;
        }
        await nextFrame();
      }
    } finally {
      setJumping(false);
    }
  }, [scroller]);

  return (
    <div
      // top 50px centers the pill on the chat-scroll-fade border (the mask ramps
      // 48px→80px), just below the h-14 ChatHeader. z-40 > header z-30. On the
      // iOS shell the header and fade border shift down by the safe-area inset
      // (see .chat-scroll-fade in index.css), so add --agent-meow-inset-top here
      // too to keep the pill centered on the border. The var is 0px off-shell.
      style={{ top: "calc(50px + var(--agent-meow-inset-top))" }}
      className={cn(
        "pointer-events-none absolute inset-x-0 z-40 flex justify-center transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={jumping}
        onClick={() => void jumpToTop()}
        aria-label="Jump to the first message"
        // When hidden (opacity-0 / pointer-events-none) keep the button out of
        // the tab order and the accessibility tree so it can't take focus or be
        // announced while invisible.
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        className={cn(
          "h-7 gap-1.5 rounded-full px-3 text-xs shadow-sm",
          // Force an OPAQUE background in both themes and on hover. The outline
          // variant's hover (bg-muted) is a translucent black wash (--muted is
          // #0000000f), so over the faded chat text behind the pill it bleeds
          // through and reads as transparent. bg-background is opaque (#fff /
          // #0d1218); hover feedback comes from a brightness filter, which keeps
          // the fill fully opaque.
          "bg-background hover:bg-background hover:brightness-95",
          "dark:bg-background dark:hover:bg-background dark:hover:brightness-125",
          visible ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {jumping ? (
          <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <ArrowUpIcon className="size-3.5" aria-hidden />
        )}
        {jumping ? "Loading history…" : "Jump to top"}
      </Button>
    </div>
  );
}

/** Stable React key per bubble. */
function bubbleKey(bubble: Bubble): string {
  // Prefer stableKey (the optimistic temp id) for promoted user bubbles
  // so the key holds steady across the optimistic→committed swap on
  // `session.input.consumed` — a changing key remounts the node (flink).
  if (bubble.kind === "user") return `user:${bubble.stableKey ?? bubble.itemId}`;
  if (bubble.kind === "compaction_loading") return `compaction_loading:${bubble.itemId}`;
  if (bubble.kind === "compaction") return `compaction:${bubble.itemId}`;
  if (bubble.kind === "routing_decision") return `routing_decision:${bubble.itemId}`;
  return `assistant:${bubble.stableId}`;
}

/**
 * Playful labels the idle-but-busy indicator rotates through (one per
 * `ROTATE_MS`). Index 0 MUST stay "Working…": it's the label a fresh tick
 * (and every unit test) lands on. Keep each entry a single short word +
 * ellipsis — `Shimmer` scales its sweep width to the text length, so uniform
 * lengths keep the animation steady across rotations.
 */
export const WORKING_MESSAGES = [
  "Working…",
  "Cooking…",
  "Crunching…",
  "Tinkering…",
  "Pondering…",
  "Brewing…",
] as const;

/**
 * The label shown next to the working spinner. When background shells outlive
 * the turn (`bgCount > 0`) it names how many are still running (the tick is
 * ignored — that count is information, not decoration). Otherwise it rotates
 * through `WORKING_MESSAGES` by wall-clock `tick`.
 */
export function workingIndicatorLabel(bgCount: number, tick = 0): string {
  if (bgCount > 0) {
    return bgCount === 1
      ? "1 background task still running"
      : `${bgCount} background tasks still running`;
  }
  return WORKING_MESSAGES[tick % WORKING_MESSAGES.length]!;
}

function WorkingIndicator() {
  const bgCount = useChatStore((s) => s.backgroundTaskCount);
  const tick = useWorkingLabelTick();
  const label = workingIndicatorLabel(bgCount, tick);
  return (
    <Message from="assistant" data-testid="working-indicator" aria-hidden="true">
      <MessageContent>
        <div className="flex items-center gap-1.5 py-0.5">
          <MeowCatIcon className="meowcat-working h-4 w-auto shrink-0" />
          <Shimmer className="text-xs font-mono" duration={1.5}>
            {label}
          </Shimmer>
        </div>
      </MessageContent>
    </Message>
  );
}

/**
 * Decide whether to render the main chat's "Working…" indicator.
 *
 * Lit for the whole busy turn — through streaming text, tool runs, and
 * reasoning gaps — so the user always sees the session is still going. A
 * reload can hydrate a custom-agent session as ``running`` before any bubble
 * exists locally; the indicator stays visible in that empty-but-busy state
 * too.
 *
 * @param showsWorking - True when the session snapshot or local response
 *   state says the main session is still working.
 * @param bubbles - Rendered chat bubbles currently hydrated in the main
 *   session, e.g. assistant, user, or compaction-loading bubbles.
 * @returns True when the standalone working indicator should render; false
 *   when the session is idle, or a compaction-loading bubble is last and
 *   already represents the busy state with its own animation.
 */
export function shouldShowWorkingIndicator(showsWorking: boolean, bubbles: Bubble[]): boolean {
  if (!showsWorking) return false;
  return bubbles[bubbles.length - 1]?.kind !== "compaction_loading";
}

/**
 * Band copy for each in-flight managed-sandbox launch stage, in
 * pipeline order: provisioning → cloning (repo workspaces only) →
 * starting → connecting. `starting` is the in-sandbox host booting
 * and dialing back to the server (so it reads "Connecting host");
 * `connecting` is the agent runner being launched on that host
 * (so it reads "Starting agent"). Terminal stages are absent on
 * purpose — `ready` clears the band and `failed` renders its own
 * error band.
 */
const SANDBOX_STAGE_LABELS: Record<string, string | undefined> = {
  provisioning: "Provisioning sandbox",
  cloning: "Cloning repository",
  starting: "Connecting host",
  connecting: "Starting agent",
};

/**
 * Failure band for a managed-sandbox session whose background launch
 * died. Renders the recorded reason so a dead launch explains itself
 * instead of presenting a silent dead chat. In-flight launch progress
 * does NOT render here — it shares the in-thread
 * :func:`RunnerStartingIndicator` spot so all launch states live on
 * one consistent line.
 */
export function SandboxFailedIndicator({ status }: { status: SandboxStatus }) {
  return (
    <div
      data-testid="sandbox-failed-indicator"
      role="status"
      className={cn(
        "mx-auto mb-4 flex w-full items-center justify-center gap-2 px-6 py-1.5 text-destructive text-xs",
        CHAT_COLUMN_WIDTH,
      )}
    >
      <AlertTriangleIcon className="size-3.5 shrink-0" aria-hidden />
      <span>Sandbox launch failed{status.error ? `: ${status.error}` : ""}</span>
    </div>
  );
}

export function ConnectionIndicator({
  liveness,
  onShowReconnectHelp,
  surfaceFrontmost = true,
}: {
  liveness: SessionLiveness;
  onShowReconnectHelp: () => void;
  // Whether the chat/terminal surface is frontmost (not under a drawer). Gates
  // the native iOS bar so it doesn't float over an opened sidebar/panel.
  surfaceFrontmost?: boolean;
}) {
  const terminalFirst = useTerminalFirst();
  const keyboardVisible = useIOSNativeKeyboardVisible(
    terminalFirst?.isTerminalFirst === true,
    terminalFirst?.view === "chat",
  );
  const sandboxStatus = useChatStore((s) => s.sandboxStatus);
  // Genuinely-unreachable states get the reconnect banner, for
  // both terminal-first and regular sessions. `runner_asleep` (host up,
  // runner relaunches on the next message), `host_asleep` (resumable managed
  // host the server wakes on the next message), and `unknown` (pre-poll) are
  // NOT unreachable — they're handled below.
  const unreachable = liveness.kind === "host_offline" || liveness.kind === "local_stranded";

  // In the iOS shell the Chat/Terminal toggle is the native Liquid Glass bar,
  // not the in-page pill. Drive it from here (always mounted) with the SAME
  // visibility the pill would have, expressed as a stable boolean so switching
  // views never flickers the bar. Hook is called unconditionally (before any
  // early return) to satisfy the rules of hooks.
  const nativeBarVisible =
    isIOSShell() &&
    terminalFirst?.isTerminalFirst === true &&
    !terminalFirst.isShellView &&
    sandboxStatus?.stage !== "failed" &&
    !unreachable &&
    !keyboardVisible &&
    surfaceFrontmost;
  useNativeChatTerminalBar(terminalFirst, nativeBarVisible);

  if (sandboxStatus !== null) {
    // A failed launch owns this band with its reason. An IN-FLIGHT
    // launch renders in the chat thread (RunnerStartingIndicator)
    // instead — but still suppresses the liveness bands below, which
    // would misread the not-yet-bound session as stranded.
    if (sandboxStatus.stage === "failed") {
      return <SandboxFailedIndicator status={sandboxStatus} />;
    }
    return null;
  }
  if (unreachable) {
    // A `host_offline` session moves the reconnect affordance up into the
    // composer's host badge (ComposerStatusLine), where the host is already
    // named — so render nothing here whenever that composer is on screen
    // (sub-agent sessions included; their badge carries it just like a normal
    // session's). The composer is hidden only in the terminal-first *terminal*
    // view (the PTY owns the surface); there the banner still carries the
    // affordance. `local_stranded` keeps the banner everywhere (no host, hence
    // no badge).
    const composerOnScreen = !(terminalFirst?.isTerminalFirst && terminalFirst.view === "terminal");
    if (liveness.kind === "host_offline" && composerOnScreen) {
      return null;
    }
    return (
      <button
        type="button"
        data-testid="disconnected-indicator"
        onClick={onShowReconnectHelp}
        className={cn(
          "mx-auto mb-4 flex w-full items-center justify-center gap-2 px-6 py-1.5 text-xs text-destructive underline-offset-2 hover:underline",
          CHAT_COLUMN_WIDTH,
        )}
      >
        <WifiOffIcon className="size-3.5 shrink-0" />
        <span>
          {liveness.kind === "host_offline"
            ? "Host is offline — click to reconnect"
            : "Agent disconnected — click to reconnect"}
        </span>
      </button>
    );
  }

  // Terminal-first sessions own the Chat/Terminal toggle for EVERY
  // reachable state — `online`, `unknown` (pre-poll), `starting`
  // (spinning up / relaunching), AND `runner_asleep` (stopped, host
  // alive). Only the unreachable states above replace it with the banner.
  // Keeping the pill visible through `runner_asleep` is why stopping a
  // runner no longer makes the toggle vanish: the pill stays, and the
  // next send (or a fresh launch) drives its own terminal-pending spinner
  // as the runner comes back. The strict `runner_online` still gates the
  // inline PTY *view* (it needs a live tunnel) — but not the toggle.
  if (terminalFirst?.isTerminalFirst) {
    // In the iOS shell the toggle is the native bar (driven above). Render only
    // a spacer reserving its fixed footprint so the composer clears it — and
    // nothing when the bar is hidden.
    if (isIOSShell()) {
      // Chat reserves a touch less than terminal: the composer's own bottom
      // content (the status line) already cushions the gap to the bar.
      return nativeBarVisible ? (
        <div
          aria-hidden
          className={cn(
            "agent-meow-native-bottom-spacer",
            terminalFirst.view === "chat" && "agent-meow-native-bottom-spacer--chat",
          )}
        />
      ) : null;
    }
    // A rail-opened shell owns the main view chrome-free — no pill: a
    // "Chat" option under someone else's shell misreads as the shell
    // being the agent. The shell view carries its own close affordance
    // (MainTerminalView's X) back to chat.
    if (terminalFirst.isShellView) return null;
    if (keyboardVisible) return null;
    return <ConnectedTerminalFirstPill ctx={terminalFirst} />;
  }

  // A regular (non-terminal-first) session whose runner is still spinning
  // up shows a passive "Connecting…" row — no action, no banner, just a
  // heartbeat so the empty chat doesn't read as broken.
  if (liveness.kind === "starting") {
    return (
      <div
        data-testid="connecting-indicator"
        className={cn(
          "mx-auto mb-4 flex w-full items-center justify-center gap-2 px-6 py-1.5 text-muted-foreground text-xs",
          CHAT_COLUMN_WIDTH,
        )}
      >
        <Loader2Icon className="size-3.5 shrink-0 animate-spin" aria-hidden />
        <span>Connecting…</span>
      </div>
    );
  }

  // `online`/`unknown` for a non-terminal-first session and
  // `runner_asleep`/`host_asleep` for any session: status lives in the
  // sidebar / the composer stays open, so render nothing here.
  return null;
}

/**
 * Main-pane launch indicator — the single in-thread line for every
 * "session is coming up" state. Two launch shapes feed it, in
 * priority order:
 *
 * 1. A managed-sandbox launch (`sandboxStatus` in flight): shows the
 *    current pipeline stage ("Provisioning sandbox…", "Cloning
 *    repository…", …) for ANY session type.
 * 2. A terminal-first runner spin-up (`terminalStartingUp`): shows the
 *    generic "Starting up…" terminal copy. The sandbox stages win
 *    while both are active — they're strictly more specific.
 *
 * Self-gates to null when neither applies. `hero` is the centered
 * empty-state placeholder (no bubbles yet); `row` is the in-thread
 * spinner beneath the user's first message (the create-then-send path
 * renders that bubble immediately, so the empty state never shows
 * there).
 */
export function RunnerStartingIndicator({ variant }: { variant: "hero" | "row" }) {
  const terminalFirst = useTerminalFirst();
  const sandboxStatus = useChatStore((s) => s.sandboxStatus);
  // `ready` never reaches the store (cleared) and `failed` renders the
  // destructive band in ConnectionIndicator — only in-flight stages
  // with known copy show here.
  const sandboxLabel =
    sandboxStatus !== null && sandboxStatus.stage !== "failed"
      ? SANDBOX_STAGE_LABELS[sandboxStatus.stage]
      : undefined;
  // `terminalStartingUp` is computed for ALL sessions in AppShell (it does not
  // check isTerminalFirst), so gate on isTerminalFirst too: regular agents
  // (e.g. polly) get the generic ConnectionIndicator "Connecting…" band and
  // must not also render this.
  const terminalSpinUp = Boolean(
    terminalFirst?.isTerminalFirst && terminalFirst.terminalStartingUp,
  );
  if (sandboxLabel === undefined && !terminalSpinUp) {
    return null;
  }
  const line = sandboxLabel !== undefined ? `${sandboxLabel}…` : "Starting up…";
  // role=status + aria-live so assistive tech announces the transient wait;
  // the spinner glyph itself is decorative (aria-hidden).
  if (variant === "hero") {
    return (
      <ConversationEmptyState
        data-testid="runner-starting-indicator"
        role="status"
        aria-live="polite"
        icon={<Loader2Icon className="size-7 animate-spin" aria-hidden />}
        title={sandboxLabel !== undefined ? `${sandboxLabel}…` : "Starting up…"}
        description={
          sandboxLabel !== undefined
            ? "Setting up your sandbox — this can take a minute."
            : "This can take a few seconds."
        }
      />
    );
  }
  return (
    <Message
      from="assistant"
      data-testid="runner-starting-indicator"
      role="status"
      aria-live="polite"
    >
      <MessageContent>
        <span className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
          {line}
        </span>
      </MessageContent>
    </Message>
  );
}

// How many still-starting server names the startup band spells out
// before collapsing the rest into "…" — mirrors the Codex TUI's own
// startup header, and keeps a 20-server config to one line.
const MCP_STARTING_NAMES_SHOWN = 3;
// Cap for the settled warning's failed/cancelled name lists. Longer
// than the starting cap because these name servers the user may need
// to fix; beyond this the count carries the signal.
const MCP_SETTLED_NAMES_SHOWN = 8;

/**
 * The startup band's in-flight line, mirroring the Codex TUI's header.
 *
 * @param starting Still-starting server names, sorted.
 * @param total Total servers in the round.
 * @returns e.g. `"Starting MCP servers (1/20): glean, jira, safe, …"`.
 */
export function mcpStartingLine(starting: string[], total: number): string {
  if (total === 1 && starting.length === 1) {
    return `Starting MCP server: ${starting[0]}…`;
  }
  const shown = starting.slice(0, MCP_STARTING_NAMES_SHOWN);
  if (starting.length > MCP_STARTING_NAMES_SHOWN) shown.push("…");
  return `Starting MCP servers (${total - starting.length}/${total}): ${shown.join(", ")}`;
}

/**
 * A settled warning's name list, capped so the band stays scannable.
 *
 * @param names Failed or cancelled server names, sorted.
 * @returns e.g. `"a, b, c, d, e, f, g, h, +12 more"`.
 */
export function mcpSettledNames(names: string[]): string {
  if (names.length <= MCP_SETTLED_NAMES_SHOWN) return names.join(", ");
  const shown = names.slice(0, MCP_SETTLED_NAMES_SHOWN);
  return `${shown.join(", ")}, +${names.length - MCP_SETTLED_NAMES_SHOWN} more`;
}

/**
 * Per-MCP-server startup band for native harness sessions (codex-native).
 * Codex defers a mid-startup turn's execution until its MCP servers
 * settle, and the session previously showed nothing during that window.
 * Renders a spinner naming the still-starting servers; once startup
 * settles with failures/cancellations, a one-line notice says which
 * servers never came up. Self-gates to null when the store carries no
 * startup state (an all-ready map is cleared by the store handler).
 */
export function McpStartupIndicator() {
  const mcpStartup = useChatStore((s) => s.mcpStartup);
  if (mcpStartup === null) return null;
  const names = Object.keys(mcpStartup).sort();
  const starting = names.filter((name) => mcpStartup[name].status === "starting");
  if (starting.length > 0) {
    return (
      <Message
        from="assistant"
        data-testid="mcp-startup-indicator"
        role="status"
        aria-live="polite"
      >
        <MessageContent>
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
            {mcpStartingLine(starting, names.length)}
          </span>
        </MessageContent>
      </Message>
    );
  }
  const failed = names.filter((name) => mcpStartup[name].status === "failed");
  const cancelled = names.filter((name) => mcpStartup[name].status === "cancelled");
  if (failed.length === 0 && cancelled.length === 0) return null;
  const parts: string[] = [];
  if (failed.length > 0) parts.push(`failed: ${mcpSettledNames(failed)}`);
  if (cancelled.length > 0) parts.push(`cancelled: ${mcpSettledNames(cancelled)}`);
  return (
    <Message from="assistant" data-testid="mcp-startup-indicator" role="status">
      <MessageContent>
        <span className="flex items-center gap-2 text-muted-foreground text-sm">
          <AlertTriangleIcon className="size-4 shrink-0" aria-hidden />
          {`MCP startup incomplete (${parts.join("; ")})`}
        </span>
      </MessageContent>
    </Message>
  );
}

/**
 * Mirrors the Chat/Terminal state onto the iOS shell's native Liquid Glass
 * switcher and routes its taps back into `setView`. Driven by a stable
 * `visible` boolean (not this hook's mount/unmount), so toggling Chat/Terminal
 * updates the bar in place instead of flickering it hidden→shown. A no-op
 * outside the iOS shell; the caller renders its own in-page pill there.
 */
function useNativeChatTerminalBar(
  ctx: ReturnType<typeof useTerminalFirst> | null,
  visible: boolean,
): void {
  const native = isIOSShell();
  const view = ctx?.view ?? "chat";
  const terminalsAvailable = ctx?.terminalsAvailable ?? false;
  const terminalStartingUp = ctx?.terminalStartingUp ?? false;

  // Keep `setView` reachable from the subscribe-once effect without
  // resubscribing whenever the callback identity changes.
  const setViewRef = useRef(ctx?.setView);
  setViewRef.current = ctx?.setView;

  // Push current state + visibility down whenever any of it changes.
  useEffect(() => {
    if (!native) return;
    setNativeViewMode({
      mode: view,
      terminalEnabled: terminalsAvailable,
      terminalStartingUp,
      visible,
    });
  }, [native, view, terminalsAvailable, terminalStartingUp, visible]);

  // Belt-and-suspenders: hide the bar if the host component ever unmounts.
  useEffect(() => {
    if (!native) return;
    return () => {
      setNativeViewMode({
        mode: "chat",
        terminalEnabled: false,
        terminalStartingUp: false,
        visible: false,
      });
    };
  }, [native]);

  // Route native taps back into the web layer.
  useEffect(() => {
    if (!native) return;
    return onNativeViewModeChanged((mode) => setViewRef.current?.(mode));
  }, [native]);
}

/**
 * Chat/Terminal segmented control for terminal-first sessions. Status
 * lives in the sidebar — this band is purely a view toggle.
 *
 * Only rendered outside the iOS shell; inside it the switcher is drawn natively
 * (Liquid Glass) over the web view — see {@link useNativeChatTerminalBar}.
 */
function ConnectedTerminalFirstPill({
  ctx,
}: {
  ctx: NonNullable<ReturnType<typeof useTerminalFirst>>;
}) {
  // `terminalStartingUp` is the single loading signal — AppShell folds the
  // launch (liveness `starting`) and PTY-creation (`terminalPending`)
  // sources into it. The button is disabled whenever no terminal is
  // reachable: greyed-and-spinning reads as "loading", greyed-and-static as
  // "no terminal / stopped".
  const { view, setView, terminalsAvailable, terminalStartingUp } = ctx;

  return (
    <div
      className={cn(
        "terminal-first-switcher-container mx-auto flex w-full items-center justify-center px-6 pb-1.5",
        CHAT_COLUMN_WIDTH,
      )}
    >
      <div
        role="group"
        aria-label="View mode"
        className="terminal-first-switcher flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 text-xs shadow-sm"
      >
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-pressed={view === "chat"}
            aria-label="Chat"
            onClick={() => setView("chat")}
            className={cn(
              "terminal-first-switcher-option flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
              view === "chat"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <MessageSquareIcon className="size-3.5 shrink-0" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            aria-pressed={view === "terminal"}
            aria-label="Terminal"
            disabled={!terminalsAvailable}
            title={terminalStartingUp ? "Terminal is starting up…" : undefined}
            onClick={() => setView("terminal")}
            className={cn(
              "terminal-first-switcher-option flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              view === "terminal"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {terminalStartingUp ? (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin" aria-hidden />
            ) : (
              <TerminalIcon className="size-3.5 shrink-0" />
            )}
            <span>Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Whether a user-role bubble is a runtime-injected `[System: ...]`
 * notification (rendered via SystemMessageView, not as a normal user
 * bubble). Matches the gate in `UserBubble`: pure text, no attachments,
 * recognizable system header.
 */
function isSystemBubble(bubble: Bubble): boolean {
  if (bubble.kind !== "user") return false;
  return isSystemUserContent(bubble.content);
}

function CompactionLoadingIndicator() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.round((performance.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Message from="assistant" data-testid="compacting-indicator">
      <MessageContent>
        <div className="flex items-center gap-2 text-xs font-mono">
          <Shimmer as="span" duration={1.5}>
            Compacting conversation…
          </Shimmer>
          {elapsed > 0 && <span className="text-muted-foreground">({elapsed}s)</span>}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full w-1/3 rounded-full bg-muted-foreground/40"
            style={{ animation: "compaction-slide 1.5s ease-in-out infinite alternate" }}
          />
        </div>
      </MessageContent>
    </Message>
  );
}

// Memoized so a streaming delta (which rebuilds the whole bubble array) only
// re-renders the bubble that actually changed, not every prior message's
// markdown/syntax-highlighting subtree. See `bubblesEqual`. Exported for
// the user-bubble markdown render tests.
export const BubbleView = memo(
  function BubbleView({ bubble }: { bubble: Bubble }) {
    if (bubble.kind === "user") return <UserBubble bubble={bubble} />;
    if (bubble.kind === "compaction_loading") {
      return <CompactionLoadingIndicator />;
    }
    if (bubble.kind === "compaction") return <CompactionMarker />;
    if (bubble.kind === "routing_decision") {
      return (
        <RoutingDecisionCard
          model={bubble.model}
          applied={bubble.applied}
          rationale={bubble.rationale}
          agent={bubble.agent}
        />
      );
    }
    return <AssistantBubble bubble={bubble} />;
  },
  (prev, next) => bubblesEqual(prev.bubble, next.bubble),
);

/**
 * Copy-to-clipboard handler for a message bubble's "Copy" action.
 *
 * Uses the shared {@link copyText} helper (async Clipboard API with an
 * `execCommand` fallback) rather than `navigator.clipboard.writeText`
 * directly — the latter is undefined in the iOS webview and on non-secure
 * origins, where a bare guard made the button silently no-op. Drives the
 * inline check-icon confirmation for 2s, and on mobile (where the desktop
 * hover affordance and tooltip aren't visible) also fires a toast so the
 * copy is confirmed.
 *
 * @param getText - Produces the text to copy at click time.
 * @returns `{ isCopied, handleCopy }` for the action button.
 */
function useCopyMessage(getText: () => string): {
  isCopied: boolean;
  handleCopy: () => void;
} {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const isMobile = useIsMobileViewport();

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const handleCopy = useCallback(() => {
    if (isCopied) return;
    const text = getText();
    if (!text) return;
    copyText(text).then(
      () => {
        setIsCopied(true);
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), 2000);
        if (isMobile) {
          showToast(<span className="text-sm">Copied to clipboard</span>, { duration: 1500 });
        }
      },
      (error) => {
        console.warn("Failed to copy message", error);
      },
    );
  }, [getText, isCopied, isMobile]);

  return { isCopied, handleCopy };
}

function UserBubble({ bubble }: { bubble: Extract<Bubble, { kind: "user" }> }) {
  const sessionId = useChatStore((s) => s.conversationId);
  // Author labels only matter once the session is shared with someone else.
  const isSessionShared = useContext(SessionSharedContext);
  // Plain-text path is the common case.
  // - input_image: render inline <img> when the file is uploaded (file_id
  //   doesn't start with "pending:"); show a chip while the upload is
  //   in-flight.
  // - input_file: always render as a chip (non-image files can't be
  //   previewed inline).
  const text = extractUserText(bubble.content);
  const images = bubble.content.filter(
    (c): c is Extract<MessageContentBlock, { type: "input_image" }> => c.type === "input_image",
  );
  const fileChips = bubble.content.filter(
    (c): c is Extract<MessageContentBlock, { type: "input_file" }> => c.type === "input_file",
  );
  // "@"-mentioned workspace files/folders ride in as "[Attached: …]" text
  // markers (no input_file block), so surface them as chips — otherwise the
  // marker is stripped and the user can't see what they attached.
  const mentionedChips = extractAttachedPaths(bubble.content);
  // Runtime-injected `[System: ...]` notifications (task completion,
  // timer firings, terminal idle) ride in on role=user. When the content
  // is a pure system marker — no attached images or files — swap the
  // normal bubble for a muted centered indicator.
  if (images.length === 0 && fileChips.length === 0 && mentionedChips.length === 0) {
    const parsed = parseSystemMessage(text);
    if (parsed) return <SystemMessageView message={parsed} />;
  }
  // Badge OTHER contributors' messages only (never your own) — an avatar
  // circle + author-tinted bubble, not an email label.
  const author = bubble.createdBy;
  const showAuthorBadge = shouldShowAuthorBadge(author, getCurrentAuthorId(), isSessionShared);
  // Equality selector so Zustand only re-renders the matching bubble.
  const flashing = useChatStore((s) => s.flashItemId === bubble.itemId);
  const { isCopied, handleCopy } = useCopyMessage(() => text);

  return (
    <Message
      from="user"
      data-testid="message-bubble"
      data-role="user"
      data-user-message-id={bubble.itemId}
      className="max-w-3xl"
    >
      {/* w-fit + ml-auto shrink-wrap the row so the author avatar sits
          immediately left of the right-aligned bubble (the bubble's own
          ml-auto has no free space to absorb inside a fit-width row). */}
      <div className="ml-auto flex w-fit max-w-full items-center gap-1.5">
        {showAuthorBadge && author && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                size="sm"
                data-testid="message-author"
                aria-label={author}
                className="shrink-0"
              >
                <AvatarFallback
                  className="font-medium text-white"
                  style={{ backgroundColor: userColor(author) }}
                >
                  {userInitials(author)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{author}</TooltipContent>
          </Tooltip>
        )}
        <MessageContent
          className={cn(flashing && "animate-user-msg-flash")}
          // Another contributor's bubble takes their avatar color at low
          // alpha instead of the default bg-muted, so authorship reads at
          // a glance without any email text.
          style={showAuthorBadge && author ? { backgroundColor: userColorTint(author) } : undefined}
        >
          {/* Inline image previews */}
          {images.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-2">
              {images.map((img, i) =>
                img.file_id.startsWith("pending:") ? (
                  // Upload in-flight — show a chip placeholder
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    <ImageIcon className="size-3 shrink-0" />
                    <span className="max-w-[180px] truncate">
                      {img.filename ?? img.file_id.replace("pending:", "")}
                    </span>
                  </span>
                ) : (
                  // Uploaded — render the actual image
                  <SessionImage
                    key={i}
                    path={
                      sessionId
                        ? `/v1/sessions/${encodeURIComponent(sessionId)}/resources/files/${encodeURIComponent(img.file_id)}/content`
                        : undefined
                    }
                    alt={img.filename ?? img.file_id}
                    className="max-h-64 max-w-full rounded-md object-contain"
                  />
                ),
              )}
            </div>
          )}
          {/* Non-image file chips */}
          {fileChips.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {fileChips.map((att, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  <FileTextIcon className="size-3 shrink-0" />
                  <span className="max-w-[180px] truncate">{att.filename ?? att.file_id}</span>
                </span>
              ))}
            </div>
          )}
          {/* "@"-mentioned workspace files/folders (delivered as text markers) */}
          {mentionedChips.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {mentionedChips.map((item) => (
                <span
                  key={mentionItemPath(item)}
                  className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {item.isDir ? (
                    <FolderIcon className="size-3 shrink-0" />
                  ) : (
                    <FileTextIcon className="size-3 shrink-0" />
                  )}
                  <span className="max-w-[180px] truncate" title={mentionItemPath(item)}>
                    @{item.path}
                    {item.isDir ? "/" : ""}
                  </span>
                  {item.lineRange && (
                    <span className="shrink-0">
                      :{item.lineRange.start}-{item.lineRange.end}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
          {/* Render user text as markdown, matching the assistant bubble
            (headings, lists, code fences, file-path links). `breaks` keeps
            single newlines as line breaks — users type multi-line messages
            without blank-line paragraph separators and expect their line
            breaks preserved. Empty text — e.g. an attachments-only message —
            renders nothing rather than an empty markdown block. */}
          {text && <FilePathAwareMessageResponse breaks>{text}</FilePathAwareMessageResponse>}
        </MessageContent>
      </div>
      {text && (
        <MessageActions className="mt-1 ml-auto opacity-40 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <MessageAction tooltip="Copy" onClick={handleCopy}>
            {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          </MessageAction>
        </MessageActions>
      )}
    </Message>
  );
}

function AssistantBubble({ bubble }: { bubble: Extract<Bubble, { kind: "assistant" }> }) {
  // The walker only emits an assistant bubble when at least one
  // assistant-side block exists, so `items` is non-empty here in the
  // common case. The "Working…" shimmer for the empty-items / streaming
  // gap is rendered at the page level, not inside this component.
  const { t } = useTranslation();
  const sessionStatus = useChatStore((s) => s.sessionStatus);
  // Getter computes the markdown lazily at click time — the hook must run
  // before the early return below (rules of hooks), but `markdownText` is
  // derived after it.
  const { isCopied, handleCopy } = useCopyMessage(() => collectBubbleMarkdown(bubble.items));
  // null outside AppShell's provider (isolated tests) → hide the action.
  const forkDialog = useForkDialog();
  // Track read-aloud state for the stop button + loading spinner.
  const readAloudState = useReadAloudState();
  // Voice-conversation TTS active — blocks read-aloud to prevent overlap.
  const voiceActive = useVoiceActive();

  if (bubble.items.length === 0) return null;

  const markdownText = collectBubbleMarkdown(bubble.items);

  // Elicitation cards (e.g. AskUserQuestion form) want full chat-column
  // width to match the composer, not the default w-fit shrink-to-content.
  const hasElicitation = bubble.items.some((it) => it.kind === "elicitation");
  const isWide = hasElicitation || containsMarkdownTable(bubble.items);

  return (
    <>
      <div className="flex w-full items-start gap-2">
        <AssistantAvatar className="mt-0.5" />
        <Message
          from="assistant"
          data-testid="message-bubble"
          data-role="assistant"
          className={cn("min-w-0 flex-1", isWide ? "max-w-full" : "max-w-3xl")}
        >
          <MessageContent className={isWide ? "w-full" : undefined}>
            <BlockRenderer items={bubble.items} sessionStatus={sessionStatus} />
          </MessageContent>
          {bubble.lifecycle === "cancelled" && (
            <p
              className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"
              data-testid="assistant-interrupted-indicator"
            >
              <XIcon className="size-3" aria-hidden="true" />
              <span>Interrupted</span>
            </p>
          )}
          {markdownText && (
            <MessageActions className="mt-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <MessageAction tooltip="Copy" onClick={handleCopy}>
                {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              </MessageAction>
              <MessageAction
                tooltip={
                  voiceActive
                    ? t("chat.readAloudVoiceActive")
                    : readAloudState === "error"
                      ? t("chat.readAloudError")
                      : readAloudState === "idle"
                        ? t("chat.readAloud")
                        : readAloudState === "paused"
                          ? t("chat.readAloudResume")
                          : t("chat.readAloudPause")
                }
                disabled={voiceActive}
                onClick={() => {
                  if (voiceActive) return;
                  if (readAloudState === "idle" || readAloudState === "error") {
                    void speakText(markdownText);
                  } else if (readAloudState === "paused") {
                    resumeReadAloud();
                  } else if (readAloudState === "playing") {
                    pauseReadAloud();
                  } else {
                    stopReadAloud();
                  }
                }}
                data-testid="read-aloud-button"
              >
                {readAloudState === "loading" ? (
                  <Loader2Icon size={14} className="animate-spin" />
                ) : readAloudState === "playing" ? (
                  <PauseIcon size={14} />
                ) : readAloudState === "paused" ? (
                  <PlayIcon size={14} />
                ) : readAloudState === "error" ? (
                  <WifiOffIcon size={14} />
                ) : (
                  <Volume2Icon size={14} />
                )}
              </MessageAction>
              {/* Stop button — only visible when audio is playing or paused.
                  Separate from the toggle button so the user has explicit
                  Start (Volume2Icon) / Pause (PauseIcon) / Stop (SquareIcon)
                  controls. Stop fully cancels playback and resets to idle. */}
              {(readAloudState === "playing" ||
                readAloudState === "paused" ||
                readAloudState === "loading") && (
                <MessageAction
                  tooltip={t("chat.readAloudStop")}
                  onClick={() => stopReadAloud()}
                  data-testid="read-aloud-stop-button"
                >
                  <SquareIcon size={14} className="fill-current" />
                </MessageAction>
              )}
              {/* Fork from this response: clone the session with history
                  truncated after this turn. Hidden while the response is
                  still streaming (its items aren't committed yet) and when
                  the session can't be forked (sub-agent / isolated mount). */}
              {forkDialog?.canFork && bubble.lifecycle !== "streaming" && (
                <MessageAction
                  tooltip="Fork from here"
                  data-testid="fork-from-response"
                  onClick={() => forkDialog.openForkDialog({ upToResponseId: bubble.responseId })}
                >
                  <GitForkIcon size={14} />
                </MessageAction>
              )}
            </MessageActions>
          )}
        </Message>
      </div>

      {bubble.lifecycle === "failed" && (
        <p className="text-destructive text-xs">Error: {bubble.error}</p>
      )}
    </>
  );
}


// The "Working…" shimmer tracks the server-side session status 1:1 with the
// status badge — no optimistic bridges. There is a brief gap after a send
// before the server confirms `running` (exactly like the badge); that's the
// intended behavior — the indicator reflects what the agent is actually doing.
export function computeIsWorking(sessionStatus: SessionStatus): boolean {
  return sessionStatus === "running" || sessionStatus === "waiting";
}

/**
 * Whether the main chat's display-only "Working…" indicator should light up.
 *
 * @param sessionStatus - The main session status, e.g. ``"running"``.
 * @param options - Display gates for the main chat indicator.
 * @param options.hasPendingElicitation - ``true`` when an elicitation prompt
 *   owns the in-progress slot and should suppress the shimmer/pinned pill.
 * @param options.runnerOnline - Runner liveness: ``true`` online, ``false``
 *   known offline, ``undefined`` before the health poll resolves. A known-offline
 *   runner suppresses the indicator ONLY when the session is otherwise idle: a
 *   session actively reporting ``running``/``waiting`` cannot have an offline
 *   runner, so its live status wins over the ``/health`` poll — which polls at a
 *   10s cadence and reads stale-offline during the runner's connect window on a
 *   fresh session's first turn (it would otherwise hide "Working…" for seconds).
 * @param options.backgroundTaskCount - Background shells still running after
 *   the turn ended. A claude-native turn settles to ``idle`` (the PTY-activity
 *   watcher's edge) even while shells run, so the bare status alone would hide
 *   the indicator; a positive count keeps it lit so "N background tasks still running"
 *   stays visible.
 * @returns ``true`` when the main session's own status should render Working.
 */
export function computeShowsWorking(
  sessionStatus: SessionStatus,
  options: {
    hasPendingElicitation: boolean;
    runnerOnline: boolean | undefined;
    backgroundTaskCount?: number;
  },
): boolean {
  if (options.hasPendingElicitation) return false;
  const isWorking = computeIsWorking(sessionStatus);
  // A running/waiting session is proof the runner is up, so a stale
  // poll-derived ``runnerOnline === false`` must not suppress it. Only gate on
  // known-offline for the not-actively-working case (e.g. a background-shell
  // tally on an idle session).
  if (options.runnerOnline === false && !isWorking) return false;
  return isWorking || (options.backgroundTaskCount ?? 0) > 0;
}

export function isUnboundCodingFork(params: {
  forkSourceId: string | null;
  workspace: string | null | undefined;
}): boolean {
  return params.forkSourceId !== null && !params.workspace;
}

const EFFORT_LEVELS = ["low", "medium", "high"] as const;

/** Anthropic-side efforts for claude-native sessions (matches ANTHROPIC_EFFORTS in reasoning_effort.py). */
const CLAUDE_NATIVE_EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"] as const;


type LabelSource = { labels?: Record<string, string | null> | null } | null | undefined;

/**
 * Resolve a structural read-only reason from session labels.
 *
 * The live session snapshot is checked first because child sessions do
 * not appear in the sidebar list and because labels can change after
 * initial navigation (for example ``sys_session_close`` marks a child
 * ``agent_meow.closed=true``). The sidebar row is only a fallback.
 *
 * @param activeSession - Live session snapshot, if loaded.
 * @param activeConv - Sidebar/session-list row fallback.
 * @returns Placeholder text for the composer when the session is
 *   structurally read-only, or ``null`` when normal permissions apply.
 */
export function readOnlyReasonForSessionLabels(
  activeSession: LabelSource,
  activeConv: LabelSource,
): string | null {
  const closed =
    activeSession?.labels?.["agent_meow.closed"] ?? activeConv?.labels?.["agent_meow.closed"];
  if (closed === "true") return "This sub-agent session is closed";
  const wrapper =
    activeSession?.labels?.["agent_meow.wrapper"] ?? activeConv?.labels?.["agent_meow.wrapper"];
  if (wrapper === "claude-code-native-ui-subagent") {
    return "Claude Code sub-agents are read-only";
  }
  return null;
}

export function effortLevelsForConv(
  conv: { labels?: Record<string, string | null> | null } | null | undefined,
  codexModelOptions: readonly CodexModelOption[] = [],
  currentModel: string | null = null,
): readonly string[] {
  switch (conv?.labels?.["agent_meow.wrapper"]) {
    case "claude-code-native-ui":
      return CLAUDE_NATIVE_EFFORT_LEVELS;
    case "codex-native-ui":
      return codexEffortLevelsForModel(codexModelOptions, currentModel);
    default:
      return EFFORT_LEVELS;
  }
}

/**
 * Which native model picker should be visible for *conv*?
 *
 * Gated on the wrapper label, not `agent_meow.ui === "terminal"`:
 * other terminal-first wrappers may not be Claude/Codex-native (see
 * `TerminalFirstContext.tsx`).
 */
export function modelPickerKindForConv(
  conv: { labels?: Record<string, string | null> | null } | null | undefined,
): NativeModelPickerKind | null {
  switch (conv?.labels?.["agent_meow.wrapper"]) {
    case "claude-code-native-ui":
      return "claude";
    case "codex-native-ui":
      return "codex";
    case "cursor-native-ui":
      return "cursor";
    case "kiro-native-ui":
      // Launch-only model selection: kiro applies ``--model`` at launch. Unlike
      // cursor/opencode there is no terminal->web model mirror, so the picker
      // reflects the pre-launch ``model_override`` selection.
      return "kiro";
    case "opencode-native-ui":
      // Like cursor: a vendor-owns-model wrapper that mirrors its live TUI
      // model into the session ``model_override`` (the forwarder's terminal→web
      // mirror), so the picker surfaces that as the live model.
      return "opencode";
    case "pi-native-ui":
      // Like cursor: the runner types a model switch into the live Pi process
      // (via the bridge inbox → Pi's ``setModel``) and Pi mirrors its own
      // ``/model`` picks back to ``model_override`` via the extension's
      // model_select handler, so the picker surfaces that as the live model.
      return "pi";
    default:
      return null;
  }
}

export function shouldShowModelPicker(
  conv: { labels?: Record<string, string | null> | null } | null | undefined,
): boolean {
  return modelPickerKindForConv(conv) !== null;
}

/**
 * True when effort controls should be visible.
 *
 * :param conv: Session or sidebar row carrying labels. ``null`` or missing
 *     labels fail closed.
 * :returns: True only when the session supports Web UI effort controls.
 */
export function shouldShowEffortPicker(
  conv: { labels?: Record<string, string | null> | null } | null | undefined,
): boolean {
  return supportsEffortControl(conv);
}

export function shouldShowCodexPlanModeControl(
  conv: { labels?: Record<string, string | null> | null } | null | undefined,
): boolean {
  return isCodexNativeSession(conv);
}

/**
 * True when the session Goal control should be visible.
 *
 * @param conv - Session or sidebar row carrying labels. ``null`` or missing
 *   labels fail closed.
 * @returns True only for Codex-native wrapper sessions until the server
 *   advertises a generic goal capability.
 */
export function shouldShowGoalControl(
  conv: { labels?: Record<string, string | null> | null } | null | undefined,
): boolean {
  return isCodexNativeSession(conv);
}

