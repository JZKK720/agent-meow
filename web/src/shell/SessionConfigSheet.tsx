// SessionConfigSheet — the new-session configuration surface extracted
// verbatim from NewChatDialog (plan-040 Phase 0, Task 3): agent/harness
// picker, project picker, host option rows, sandbox fields, and the
// harness config modal plus their constants. NewChatDialog re-exports
// these symbols so ForkSessionDialog / ResumeWithDirectoryDialog / the
// landing test files keep their existing import paths working.

import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  MonitorIcon,
  MonitorCloudIcon,
  SearchIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useServerInfo } from "@/lib/CapabilitiesContext";
import {
  harnessUnavailableReasonOnHost,
  harnessUnconfiguredOnHost,
  harnessWarningBadgeText,
  isCodexHarness,
} from "@/lib/harnessSetup";
import { isImeCompositionKeyEvent } from "@/lib/ime";
import type { Conversation } from "@/hooks/useConversations";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";
import { useQueryClient } from "@tanstack/react-query";
import {
  isAbsolutePath,
  isWindowsDriveRoot,
  parentOfPath,
} from "@/lib/hostPaths";
import { readHideUnconfiguredHarnesses } from "@/lib/harnessVisibilityPreferences";
import { writeHarnessOption } from "@/lib/modePreferences";
import { CLAUDE_NATIVE_MODELS } from "@/lib/claudeNativeModels";
import { partitionAgentsByKind } from "@/lib/agentGrouping";
import { isSlashCommandText } from "@/components/SlashCommandMenu";
import { type CostControlMode } from "@/components/CostRoutingControl";
import {
  nativeAgentHasCapability,
  nativeCodingAgentForAvailableAgent,
} from "@/lib/nativeCodingAgents";
import { type Host } from "@/hooks/useHosts";
import {
  prefetchAvailableAgentDetails,
  type AvailableAgent,
} from "@/hooks/useAvailableAgents";
import { type HostFilesystemEntry } from "@/hooks/useHostFilesystem";
import { useProjects } from "@/hooks/useConversations";
import { AgentRowTooltip } from "@/components/AgentHoverCard";
import { CliCommandBlock } from "./CliCommandBlock";
import { type AgentBundleInput } from "@/lib/agentBundle";

// Hidden from the new-session picker only. `nessie` is superseded by polly.
// `kimi` / `kimi-code` are the headless SDK harness (kept for sub-agent / `run
// --harness kimi` use) — the picker offers only the native TUI (`kimi-native-ui`).
// `hermes-native-ui` requires the hermes CLI binary (not installed — the
// hermes-gateway agent talks to the Hermes API at localhost:8642 instead).
// `config` is the legacy ironclaw-gateway agent (superseded by hermes-gateway).
export const SINGLE_USER_PRIMARY_AGENT_NAME = "hermes-gateway";

export const NEW_SESSION_HIDDEN_AGENTS = new Set([
  "nessie",
  "kimi",
  "kimi-code",
  "hermes-native-ui",
  "config",
]);

// Short picker-row blurbs — the spec descriptions are long paragraphs that
// truncate badly in the dropdown; other dialogs keep the server values.
const AGENT_PICKER_DESCRIPTIONS: Record<string, string> = {
  polly: "Multi-agent coding",
  debby: "Multi-agent debate",
};

// Agents whose bundled skills render as always-visible pills under the
// landing composer. Deliberately an allowlist while the pattern proves
// out — other agents keep the "/" menu as the only skill surface.
export const SKILL_PILL_AGENTS = new Set(["polly", "debby"]);

// Claude Code's `claude --permission-mode` choices (v2.1). Claude-native
// sessions only. "default" is Claude's own default and sends no flag; any
// other value is passed through as `--permission-mode <value>` via the
// session's terminal_launch_args. Keep in sync with `claude --help`.
// Harnesses for which server-side smart routing is available.
export const _ROUTABLE_HARNESSES = new Set([
  "claude-sdk",
  "claude_sdk",
  "claude-native",
  "codex",
  "codex-native",
  "pi",
]);

export const CLAUDE_NATIVE_DEFAULT_PERMISSION_MODE = "default";
export const CLAUDE_NATIVE_PERMISSION_MODES: { value: string; label: string; description: string }[] = [
  { value: "default", label: "Default", description: "Prompts before edits and commands" },
  {
    value: "auto",
    label: "Auto",
    description: "Auto-runs; a classifier blocks risky actions",
  },
  {
    value: "acceptEdits",
    label: "Accept edits",
    description: "Auto-applies file edits; commands still prompt",
  },
  { value: "plan", label: "Plan", description: "Plans only; makes no edits" },
  { value: "dontAsk", label: "Don't ask", description: "Auto-denies anything not pre-approved" },
  {
    value: "bypassPermissions",
    label: "Bypass permissions",
    description: "Runs everything; no prompts or safety checks",
  },
];

// Claude-native reasoning-effort options for the new-session model/effort
// picker. There is deliberately no hardcoded model/effort default: a fresh
// session leaves both unselected and omits `model_override` / `reasoning_effort`
// from the create, so Claude Code falls back to its own configured model — the
// same "no override" semantics the in-session picker's `null` state and the
// `/model default` / `/effort default` commands use. Effort levels mirror
// CLAUDE_NATIVE_EFFORT_LEVELS in ChatPage's in-session picker (ANTHROPIC_EFFORTS
// server-side).
export const CLAUDE_NATIVE_EFFORTS: { value: string; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "xHigh" },
  { value: "max", label: "Max" },
];

// Cursor execution modes. "default" sends no flags; other values map to CLI
// args passed via terminal_launch_args. Keep in sync with `cursor-agent --help`.
export const CURSOR_NATIVE_DEFAULT_EXEC_MODE = "default";
export const CURSOR_NATIVE_EXEC_MODES: {
  value: string;
  label: string;
  description: string;
  args: string[];
}[] = [
  {
    value: "default",
    label: "Default",
    description: "Normal agent mode; prompts before running commands",
    args: [],
  },
  {
    value: "auto-review",
    label: "Auto-review",
    description: "Smart Auto: auto-runs safe tool calls and prompts for the rest",
    args: ["--auto-review"],
  },
  {
    value: "plan",
    label: "Plan",
    description: "Read-only planning; analyzes and proposes plans, no edits",
    args: ["--mode", "plan"],
  },
  {
    value: "ask",
    label: "Ask",
    description: "Q&A style; explains and answers questions (read-only)",
    args: ["--mode", "ask"],
  },
  {
    value: "yolo",
    label: "Yolo",
    description: "Runs everything without prompts or safety checks",
    args: ["--yolo"],
  },
];

// Codex approval presets matching the `/permissions` TUI popup.
// Each preset bundles a sandbox profile + approval policy, mirroring
// codex-rs/utils/approval-presets/src/lib.rs. "default" is the auto
// preset (workspace-write + on-request) and sends no flags so the
// runner uses Codex's built-in default.
// Keep in sync with `codex --help` and
// https://developers.openai.com/codex/agent-approvals-security
export const CODEX_NATIVE_DEFAULT_APPROVAL_MODE = "default";
export const CODEX_NATIVE_APPROVAL_MODES: {
  value: string;
  label: string;
  description: string;
  args: string[];
}[] = [
  {
    value: "default",
    label: "Default",
    description: "Read/edit/run in workspace; approval for external edits or network",
    args: [],
  },
  {
    value: "full-access",
    label: "Full access",
    description: "Edit any file and access the internet without approval",
    args: ["--sandbox", "danger-full-access", "--ask-for-approval", "never"],
  },
  {
    value: "read-only",
    label: "Read only",
    description: "Read files only; approval required for edits, commands, or network",
    args: ["--sandbox", "read-only", "--ask-for-approval", "on-request"],
  },
];

// Conversation-label key for the DANGEROUS codex full-bypass opt-in. When
// set to "1" the runner launches Codex with
// `--dangerously-bypass-approvals-and-sandbox` (no approval prompts, no
// command sandbox) — see omnigent.stores.conversation_store
// CODEX_NATIVE_BYPASS_SANDBOX_LABEL_KEY. Stored as a label (cheap thread
// metadata) so it survives reload. Mutually exclusive in spirit with the
// approval-mode presets above: when bypass is on the runner strips any
// `--sandbox` / `--ask-for-approval` flags those presets would emit.
export const CODEX_NATIVE_BYPASS_SANDBOX_LABEL_KEY = "agent_meow.codex_native.bypass_sandbox";
// Bypass is the most-permissive Codex approval stance — presented as a 4th
// option in the Codex approval dropdown (Codex only; OpenCode shares the
// presets above but has no bypass). It rides as a conversation label, not
// terminal_launch_args, so its `args` are empty and it's handled specially.
const CODEX_NATIVE_BYPASS_APPROVAL_VALUE = "bypass";
export const CODEX_NATIVE_BYPASS_APPROVAL_OPTION = {
  value: CODEX_NATIVE_BYPASS_APPROVAL_VALUE,
  label: "Bypass approvals & sandbox",
  description: "Runs Codex with no approval prompts and no command sandbox",
  args: [] as string[],
};

export function HostOption({ host, subtitle }: { host: Host; subtitle?: string }) {
  const isOnline = host.status === "online";
  return (
    <span className="flex min-w-0 items-center gap-2">
      {host.name.toLowerCase().includes("cloud") ? (
        <MonitorCloudIcon className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <MonitorIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2">
          <span className="truncate text-xs">{host.name}</span>
          <span
            className={`inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${isOnline ? "text-green-600" : "text-muted-foreground"}`}
          >
            <span
              className={`inline-block size-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-muted-foreground"}`}
            />
            {host.status}
          </span>
        </span>
        {subtitle && (
          <span className="text-[10px] leading-tight text-muted-foreground">{subtitle}</span>
        )}
      </span>
    </span>
  );
}

export function ConnectHostInstructions({
  serverUrl,
  label,
}: {
  serverUrl: string;
  label?: string;
}) {
  const { t } = useTranslation();
  const info = useServerInfo();
  const databricksFeatures = info !== "loading" && info.databricks_features;
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-dashed border-border p-4">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      {databricksFeatures ? (
        <Tabs defaultValue="local">
          <TabsList className="w-full">
            <TabsTrigger value="local" className="text-xs">
              {t("newChat.localMachine")}
            </TabsTrigger>
            <TabsTrigger value="lakebox" className="text-xs">
              {t("newChat.lakebox")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            <CliCommandBlock
              command={`omni host --server ${serverUrl}`}
              testIdPrefix="connect-host"
            />
          </TabsContent>
          <TabsContent value="lakebox" className="flex flex-col gap-1.5">
            <CliCommandBlock
              command="omni sandbox create --provider lakebox"
              testIdPrefix="connect-lakebox-create"
            />
            <CliCommandBlock
              command={`omni sandbox connect --provider lakebox --sandbox-id <id> --server ${serverUrl}`}
              testIdPrefix="connect-lakebox-connect"
            />
          </TabsContent>
        </Tabs>
      ) : (
        <CliCommandBlock command={`omni host --server ${serverUrl}`} testIdPrefix="connect-host" />
      )}
    </div>
  );
}

/**
 * Return true when ``workspace`` is acceptable to send to the backend.
 *
 * Per designs/SESSION_WORKSPACE_SELECTION.md: only fully-absolute
 * paths (starting with ``/``) are accepted. Tilde-prefixed and
 * relative paths are rejected because the server never expands ``~``
 * — that's the host's job, and the workspace request body must be
 * an unambiguous absolute path. Empty / whitespace-only input is
 * also rejected so the submit button is disabled until the user
 * has typed something usable.
 *
 * @param workspace Value the user typed in the workspace input.
 * @returns true when ``workspace.trim()`` is an absolute path on
 *   either OS — POSIX (``/…``) or Windows (``C:\…`` / UNC) — and is
 *   not a bare drive root (``C:\``), which lists the whole drive.
 */
export function isValidWorkspace(workspace: string): boolean {
  const trimmed = workspace.trim();
  if (isWindowsDriveRoot(trimmed)) return false;
  return isAbsolutePath(trimmed);
}

/**
 * Normalize a host filesystem path for equality comparison.
 *
 * Trims whitespace and strips trailing slashes so ``"/repo/"`` and
 * ``"/repo"`` compare equal, preserving the root ``"/"``. Blank/whitespace
 * input returns ``null`` (no path), never the root. Lexical only — no ``..``
 * or symlink resolution — which suffices because the server stores canonical
 * absolute workspaces, so a freshly typed absolute path matches directly.
 *
 * @param path A host path, e.g. ``"/Users/me/repo/"``.
 * @returns The normalized path, e.g. ``"/Users/me/repo"``; ``null`` for blank.
 */
export function normalizeWorkspacePath(path: string): string | null {
  const trimmed = path.trim();
  if (trimmed === "") return null;
  const stripped = trimmed.replace(/[/\\]+$/, "");
  // All-separator input (e.g. "///") collapses to the root; a bare
  // Windows drive root ("C:\") keeps its drive letter + separator.
  if (stripped === "") return "/";
  if (/^[A-Za-z]:$/.test(stripped)) return `${stripped}\\`;
  return stripped;
}

/**
 * Shorten an absolute path to its last two segments with a leading
 * ellipsis, so worktree rows show the disambiguating tail (e.g.
 * ``"…/myrepo-worktrees/feature-x"``) instead of a shared prefix that
 * truncates to the same string for every entry.
 *
 * @param path Absolute path, e.g. ``"/Users/me/myrepo-worktrees/feature-x"``.
 * @returns The tail, prefixed with ``"…/"`` when segments were dropped;
 *   the original path when it already has two or fewer segments.
 */
export function worktreePathTail(path: string): string {
  const segments = path.replace(/\/+$/, "").split("/").filter(Boolean);
  if (segments.length <= 2) return path;
  return `…/${segments.slice(-2).join("/")}`;
}

/**
 * Existing sessions that would share an on-disk working directory with a new
 * session created in ``workspace`` on ``hostId``.
 *
 * Matches on host plus normalized workspace path: a session whose stored
 * ``workspace`` equals the picked directory works in that same directory.
 * Branch sessions live in isolated worktree dirs (a different ``workspace``),
 * so they only match when the user explicitly picked that worktree path.
 *
 * Only *connected* sessions count — ``isRunnerOnline(s.id)`` must hold. An
 * offline or unbound session has no live process that could write the
 * directory, so it isn't a conflict. The caller backs this predicate with
 * the shared runner-health poll — the same ``/health`` signal as the
 * sidebar's connectivity dots — so the hint agrees with what the sidebar
 * shows.
 * Deleted sessions (≈ openui's archived) are already filtered out
 * server-side. An errored (``failed``) session whose runner is still online
 * counts, mirroring openui: only *disconnected* agents are excluded, not
 * merely errored ones.
 *
 * Returns ``[]`` when ``hostId`` is unset or ``workspace`` is blank.
 *
 * @param sessions The caller's sessions from ``useDirectorySessions``.
 * @param hostId The selected host id, or ``null`` when none is picked.
 * @param workspace The picked absolute directory, e.g. ``"/Users/me/repo"``.
 * @param isRunnerOnline Predicate: is this session's runner online right now?
 *   Backed by the shared runner-health poll in the component.
 * @returns Matching connected sessions; callers use ``.length`` for the count.
 */
export function sessionsSharingDirectory(
  sessions: Conversation[],
  hostId: string | null,
  workspace: string,
  isRunnerOnline: (sessionId: string) => boolean,
): Conversation[] {
  if (!hostId) return [];
  const target = normalizeWorkspacePath(workspace);
  if (target === null) return [];
  // TODO: headless agents (no `os_env`, no filesystem access) still get a
  // workspace via the web flow, so they count here — a false positive, since
  // they can't write. SessionListItem doesn't expose filesystem capability to
  // filter on; revisit (expose a flag + skip them) if headless agents with
  // working directories become common.
  return sessions.filter(
    (s) =>
      s.host_id === hostId &&
      s.workspace != null &&
      normalizeWorkspacePath(s.workspace) === target &&
      // Only a session whose runner is actually online has a live process
      // that could write here — same connectivity signal as the sidebar.
      isRunnerOnline(s.id),
  );
}

/**
 * Best-effort human-readable message for a failed POST /v1/sessions.
 *
 * Recognizes the AgentMeowError shape (``{error: {message}}``) and
 * FastAPI's ``{detail}``; falls back to the status code otherwise.
 *
 * @param res Non-OK response from the session-create call.
 * @returns A message to show the user; falls back to the status code
 *   when the body isn't a recognizable error shape.
 */
export async function describeCreateError(res: Response): Promise<string> {
  // 409 Conflict — the most common cause is no host connected. Surface an
  // actionable message instead of the raw server detail, so the user knows
  // what to do next rather than seeing a bare "Conflict".
  if (res.status === 409) {
    try {
      const body: unknown = await res.json();
      const b = body as Record<string, unknown>;
      const detail =
        typeof b.detail === "string"
          ? b.detail
          : typeof b.message === "string"
            ? b.message
          : typeof (b.error as Record<string, unknown>)?.message === "string"
            ? ((b.error as Record<string, unknown>).message as string)
            : "";
      if (detail) return detail;
    } catch {
      // Non-JSON body — fall through to the generic 409 message.
    }
    return "No host connected. Connect a host first, then try again.";
  }
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      // FastAPI HTTPException → {detail}; OpenResponses → {error:{message}}.
      const b = body as Record<string, unknown>;
      if (typeof b.detail === "string") return b.detail;
      if (
        Array.isArray(b.detail) &&
        b.detail.length > 0 &&
        typeof (b.detail[0] as Record<string, unknown>)?.msg === "string"
      ) {
        return (b.detail[0] as Record<string, unknown>).msg as string;
      }
      if (typeof b.message === "string") return b.message;
      const err = b.error;
      if (typeof err === "string") return err;
      if (
        err &&
        typeof err === "object" &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        return (err as Record<string, unknown>).message as string;
      }
    }
  } catch {
    // Non-JSON body — fall through to the generic message.
  }
  return `Couldn't create the session (HTTP ${res.status}).`;
}

/**
 * The pre-feature "run agent-meow setup" guidance (ReactNode), shown under the
 * composer when the UI-driven setup feature is OFF.
 *
 * The ``needs-auth`` / ``binary-missing`` copy is Codex-specific ("run codex
 * login" / "set AGENT_MEOW_CODEX_PATH"), so it's gated on {@link isCodexHarness}.
 * Other harnesses that report those structured reasons (claude-native /
 * opencode-native now do) fall through to the generic "run agent-meow setup"
 * message — matching the pre-feature behavior, where only Codex ever produced
 * these reasons and everything else showed the generic text.
 */
function harnessWarningMessage(
  agentName: string | undefined,
  hostName: string | undefined,
  reason: string | null,
  harness: string | null | undefined,
): ReactNode {
  if (reason === "cursor-cli-missing") {
    return (
      <>
        {agentName} needs cursor-agent on {hostName} — install it with{" "}
        <code>curl https://cursor.com/install -fsS | bash</code>, then run{" "}
        <code>cursor-agent login</code>.
      </>
    );
  }
  const isCodex = !!harness && isCodexHarness(harness);
  if (reason === "needs-auth" && isCodex) {
    return (
      <>
        {agentName} needs Codex authentication on {hostName} — run <code>codex login</code> on that
        machine.
      </>
    );
  }
  if (reason === "binary-missing" && isCodex) {
    return (
      <>
        {agentName} can&apos;t find the Codex binary on {hostName} — if codex is installed, restart
        the host with <code>omni host</code> so it picks up your PATH, or set{" "}
        <code>AGENT_MEOW_CODEX_PATH</code>. Otherwise run <code>meow setup</code>.
      </>
    );
  }
  return (
    <>
      {agentName} isn&apos;t configured on {hostName} — run <code>meow setup</code> on that machine.
    </>
  );
}

/**
 * Amber "harness not ready on this host" notice under the composer, for the
 * currently-selected agent (case A: surfaced without opening the picker).
 *
 * Gated on the setup feature: when OFF, renders the original "run agent-meow
 * setup" guidance so the flag-off UI is unchanged. When ON, offers a "Set up
 * <agent>" action that opens the shared {@link HarnessSetupDialog}.
 */
export function HarnessSetupNotice({
  agentName,
  hostName,
  harness,
  reason,
  featureEnabled,
  onSetup,
}: {
  agentName: string | undefined;
  hostName: string | undefined;
  harness: string | null | undefined;
  reason: string | null;
  featureEnabled: boolean;
  onSetup: () => void;
}) {
  const { t } = useTranslation();
  return (
    <p
      // pl-2 lines the icon up with the chips tray directly above (which has
      // pl-2), so the notice reads as part of the composer, not indented left.
      className="flex items-center gap-2 pl-2 text-xs text-amber-600 dark:text-amber-500"
      data-testid="new-chat-landing-harness-warning"
    >
      <TriangleAlertIcon className="size-3.5 shrink-0" />
      {featureEnabled ? (
        <>
          <span>
            {agentName} {t("newChat.notReadyOn")} {hostName}.
          </span>
          {/* Compact bordered chip — small enough to sit on the sentence's line
              (h-5, text-xs), so it reads as part of the notice. */}
          <button
            type="button"
            data-testid="new-chat-landing-harness-setup"
            className="inline-flex h-5 shrink-0 items-center rounded-md border border-amber-300 px-2 text-xs font-medium text-amber-700 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/20"
            onClick={onSetup}
          >
            {t("newChat.setUp")} {agentName}
          </button>
        </>
      ) : (
        <span>{harnessWarningMessage(agentName, hostName, reason, harness)}</span>
      )}
    </p>
  );
}

/**
 * Sanitize a user-typed initial prompt before it is sent.
 *
 * Strips C0/C1 control characters that could corrupt a terminal
 * agent's input when the runner injects the text via ``tmux
 * send-keys`` (Claude Code / Codex native), while preserving newlines
 * (``\n``) and tabs (``\t``) so multi-line prompts survive. Mirrors
 * openui's server-side terminal-input sanitization. Trailing/leading
 * whitespace is trimmed so a whitespace-only prompt collapses to "".
 *
 * @param prompt Raw textarea value the user typed, e.g.
 *   ``"read the README\nand summarize"``.
 * @returns The sanitized prompt; ``""`` when there's nothing to send.
 */
export function sanitizeInitialPrompt(prompt: string): string {
  // Intentional control-char class: strips C0 (\x00-\x1f) and C1
  // (\x7f-\x9f) ranges EXCEPT \t (\x09) and \n (\x0a), which multi-line
  // prompts need. The control chars in the class are the point of the
  // rule, so suppress no-control-regex here (oxlint honors this).
  // eslint-disable-next-line no-control-regex
  return prompt.replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "").trim();
}

/**
 * Return true when ``url`` is acceptable as a sandbox repository URL.
 *
 * Mirrors the server's accepted forms (``parse_repo_workspace``):
 * ``https://<host>/<path>`` or scp-style ``git@<host>:<path>``. The
 * server is the authority — this only gates the submit button so an
 * obviously unusable value gets inline feedback instead of a 422.
 *
 * @param url Value the user typed in the repository input.
 * @returns true when ``url.trim()`` matches one of the two forms.
 */
export function isValidSandboxRepoUrl(url: string): boolean {
  const t = url.trim();
  return /^https:\/\/[^\s#/]+\/[^\s#]+$/.test(t) || /^git@[^\s#:]+:[^\s#]+$/.test(t);
}

/**
 * Compose the managed session's ``workspace`` string from the split
 * repository inputs.
 *
 * The API takes one Docker-build-context-style string —
 * ``<url>[#<branch>]`` — and the UI presents split fields, so this is
 * the reassembly step.
 *
 * @param url Repository URL input, e.g. ``"https://github.com/org/repo"``.
 * @param branch Branch input, e.g. ``"main"``; blank means the repo's
 *   default branch.
 * @returns The composed workspace string, or ``undefined`` when no
 *   repository was given (empty sandbox workspace).
 */
export function composeSandboxWorkspace(url: string, branch: string): string | undefined {
  const u = url.trim();
  if (u === "") return undefined;
  const b = branch.trim();
  return b === "" ? u : `${u}#${b}`;
}

/**
 * Derive a repository's display name from its URL.
 *
 * Last path segment with a trailing ``.git`` stripped — the same rule
 * the server uses for the clone directory, so the chip label matches
 * the workspace directory the session will get.
 *
 * @param url Repository URL, e.g. ``"https://github.com/org/repo.git"``.
 * @returns The name, e.g. ``"repo"``; ``null`` when underivable.
 */
export function deriveRepoName(url: string): string | null {
  const t = url.trim().replace(/\/+$/, "");
  if (t === "") return null;
  const last = t.split(/[/:]/).pop() ?? "";
  const name = last.endsWith(".git") ? last.slice(0, -4) : last;
  return name === "" ? null : name;
}

/**
 * Match a first message against an agent's bundled skills.
 *
 * Uses the in-session composer's shared command-shape guard
 * (:func:`isSlashCommandText`): the first token must read as ``/name``
 * (file paths like ``/etc/hosts`` never match), while the args after it
 * may carry anything — including paths and URLs, e.g.
 * ``"/review-pr https://github.com/..."``. The command name must
 * exactly match a bundled skill. Anything else — including
 * host-discovered skills the server can't know before a runner boots —
 * is sent as plain text, the same fall-through the in-session composer
 * uses for unknown commands.
 *
 * @param text The sanitized first message, e.g. ``"/review-pr 123"``.
 * @param skills The chosen agent's bundled skills from GET /v1/agents.
 * @returns The skill name and argument string, or ``null`` when the
 *   text is not an invocation of a bundled skill.
 */
export function matchSkillInvocation(
  text: string,
  skills: ReadonlyArray<{ name: string }>,
): { name: string; args: string } | null {
  const trimmed = text.trim();
  if (!isSlashCommandText(trimmed)) return null;
  const command = trimmed.split(/\s+/)[0]!;
  const name = command.slice(1);
  if (!skills.some((s) => s.name === name)) return null;
  return { name, args: trimmed.slice(command.length).trim() };
}

/**
 * Derive a host's home directory from a listing of its home contents.
 *
 * The filesystem endpoint returns home's entries with absolute paths (e.g.
 * ``"/Users/you/projects"``), so home is the parent of any entry. Returns
 * ``null`` for an empty listing — a literally empty home dir is the one case
 * this can't resolve, and the caller falls back to a blank field (the picker
 * still opens straight onto home).
 *
 * @param entries Entries from listing the host's home directory.
 * @returns The home directory path, or ``null`` when it can't be derived.
 */
export function deriveHomeDir(entries: HostFilesystemEntry[]): string | null {
  const first = entries[0];
  if (!first) return null;
  // parentOfPath handles both POSIX ("/Users/me/x") and Windows
  // ("C:\Users\me\x") entry paths; null only at a filesystem root.
  return parentOfPath(first.path);
}

/**
 * The composer's "Project" chip — files the to-be-created session under a
 * named project (an implicit collection stored as a ``conversation_labels``
 * row with the reserved key ``omni_project``). Mirrors the sidebar kebab's
 * project picker: a search box, the existing projects, a "No project" reset,
 * and an inline "New project…" input. Selection is local state on the landing
 * composer; the label is applied right after the session is created.
 */
export function LandingProjectPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (project: string) => void;
}) {
  const { data: projects = [] } = useProjects();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const newRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingNew) newRef.current?.focus();
  }, [creatingNew]);

  const filtered = search
    ? projects.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : projects;

  function pick(project: string) {
    onChange(project);
    setOpen(false);
    setSearch("");
    setCreatingNew(false);
    setNewName("");
  }

  function commitNew() {
    const name = newName.trim();
    if (name) pick(name);
  }

  const itemClass =
    "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-6 items-center gap-1 rounded-full px-2.5 text-13 font-normal text-muted-foreground transition-colors hover:text-foreground"
          data-testid="new-chat-landing-project-chip"
        >
          <TagIcon className="size-4 shrink-0" />
          {/* Label collapses to icon-only on narrow viewports (mobile),
              matching the host/workspace/worktree chips. */}
          <span className={`hidden max-w-32 truncate sm:block ${value ? "text-foreground" : ""}`}>
            {value || "No project"}
          </span>
          <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-1"
        // Don't snap focus back to the chip when the popover closes after a
        // pick — that programmatic refocus paints the browser's focus outline
        // on the chip. Keyboard users still get the ring when they tab to it.
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Combobox-style search: a leading magnifier inside a borderless
            input, with a divider beneath separating it from the results. */}
        <div className="flex items-center gap-2 border-b px-2 py-1.5">
          <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          <button type="button" className={itemClass} onClick={() => pick("")}>
            <span className="flex-1 truncate">No project</span>
            {value === "" && <CheckIcon className="size-3.5 shrink-0 text-primary" />}
          </button>
          {filtered.map((name) => (
            <button key={name} type="button" className={itemClass} onClick={() => pick(name)}>
              <span className="flex-1 truncate">{name}</span>
              {value === name && <CheckIcon className="size-3.5 shrink-0 text-primary" />}
            </button>
          ))}
          {filtered.length === 0 && !creatingNew && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">No projects yet.</p>
          )}
        </div>
        <div className="border-t pt-1">
          {creatingNew ? (
            <div className="flex items-center gap-1 px-2 py-1">
              <input
                ref={newRef}
                className="flex-1 bg-transparent text-xs outline-none"
                placeholder="Project name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  // Don't commit while an IME composition Enter is being
                  // confirmed (e.g. Japanese conversion). Mirrors #132/#243.
                  if (isImeCompositionKeyEvent(e)) return;
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitNew();
                  }
                  if (e.key === "Escape") {
                    setCreatingNew(false);
                    setNewName("");
                  }
                }}
              />
            </div>
          ) : (
            <button type="button" className={itemClass} onClick={() => setCreatingNew(true)}>
              <PlusIcon className="size-3.5 shrink-0" />
              New project…
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The home-page ("/") landing composer.
 *
 * Owns session creation end-to-end: the textarea is the first message and the
 * configuration chips (host, working directory, git worktree) plus the agent
 * picker supply every required parameter. Hitting send POSTs /v1/sessions and
 * navigates to the new session — there is no modal.
 */
/** Group / section header inside the picker dropdown (plain div, so Radix
 * doesn't claim roving focus for it — mirrors the in-session picker). */
export function PickerSectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 pt-1.5 pb-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * Unified two-level agent/harness picker for the landing composer.
 *
 * **Level 1** groups every available agent under "Agents" (SDK / bundle
 * agents like Polly & Debby, plus custom user agents) and "Harnesses" (the
 * native terminal CLIs — Claude Code, Codex, Cursor, …). **Level 2** is a
 * per-entry submenu of that entry's run-config knobs: model / effort /
 * permission mode for Claude Code, approval mode (+ bypass) for Codex,
 * approval mode for OpenCode, execution mode for Cursor, and the brain-harness
 * override for bundle agents. Entries with no knobs are plain selectable rows.
 *
 * Holds no state of its own — the selected agent and every knob live in
 * {@link NewChatLandingScreen} and are threaded in. Replaces the old
 * left-side run-mode pills, the right-side model / harness controls, and the
 * footer-tray agent dropdown.
 *
 * Selecting a knob inside a not-yet-selected entry's submenu first selects
 * that entry (so the single shared knob state stays coherent), then applies
 * the value. For the mode knobs we persist the pick for the *entry's* harness
 * BEFORE selecting, so the harness-switch reseed effect in the screen reads it
 * back as the same value and doesn't clobber the choice.
 */
export function AgentHarnessPicker({
  agentEntries,
  harnessEntries,
  effectiveAgentId,
  agentLabel,
  hasAgents,
  host,
  onSelectAgent,
  pendingAgent,
  pendingAgentId,
  onSelectPending,
  onCreateCustomAgent,
  sandboxSelected,
}: {
  agentEntries: AvailableAgent[];
  harnessEntries: AvailableAgent[];
  effectiveAgentId: string | null;
  agentLabel: string;
  hasAgents: boolean;
  host: Host | undefined | null;
  onSelectAgent: (agent: AvailableAgent) => void;
  pendingAgent: AgentBundleInput | null;
  pendingAgentId: string;
  onSelectPending: () => void;
  onCreateCustomAgent: () => void;
  sandboxSelected: boolean;
}) {
  // Controlled so picking a row can close the menu.
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const info = useServerInfo();
  // Feature ON → single "needs setup" badge; OFF → per-reason original text.
  const collapsedBadge = info !== "loading" && info.harness_install_enabled;
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Touch devices can't hover, so the desktop submenu flyouts ("More",
  // "Custom agents") are unreachable there. On mobile we swap the dropdown's
  // contents in place: tapping the row drills into that group's page (with a
  // Back row), instead of opening a hover flyout. `mobilePage` is the open
  // group (null = the main list); inert on desktop.
  const isMobile = useIsMobileViewport();
  const [mobilePage, setMobilePage] = useState<"more" | "custom" | null>(null);
  // Reset to the main list whenever the menu closes so it never reopens on a
  // stale drill-in page.
  useEffect(() => {
    if (!open) setMobilePage(null);
  }, [open]);

  // The agent name + optional short blurb, with the full spec description on
  // hover. Run-config knobs now live in the gear-icon config modal, not here —
  // this picker only selects the agent / harness.
  const renderRowInner = (agent: AvailableAgent, withTooltip: boolean) => {
    const blurb = AGENT_PICKER_DESCRIPTIONS[agent.name];
    const inner = (
      <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span className="truncate">{agent.display_name}</span>
        {blurb && <span className="truncate text-[11px] text-muted-foreground/70">{blurb}</span>}
      </div>
    );
    return withTooltip ? <AgentRowTooltip agent={agent}>{inner}</AgentRowTooltip> : inner;
  };

  const renderBadge = (agent: AvailableAgent) =>
    harnessUnconfiguredOnHost(agent.harness, host) ? (
      <Badge
        variant="outline"
        className="ml-auto self-center border-amber-300 bg-amber-50 text-[11px] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
        data-testid={`new-chat-landing-agent-warning-${agent.id}`}
      >
        {harnessWarningBadgeText(
          harnessUnavailableReasonOnHost(agent.harness, host),
          collapsedBadge,
        )}
      </Badge>
    ) : null;

  // Each entry is a plain selectable row — selecting commits the pick and
  // closes the menu. Run-config knobs moved to the gear-icon config modal.
  const renderEntry = (agent: AvailableAgent): ReactNode => {
    const active = agent.id === effectiveAgentId;
    return (
      <DropdownMenuItem
        key={agent.id}
        data-testid={`new-chat-landing-agent-${agent.id}`}
        data-active={active ? "true" : undefined}
        onSelect={() => onSelectAgent(agent)}
        className="items-start gap-2 rounded-sm px-2 py-1.5 text-13 data-[active=true]:bg-accent/60 data-[active=true]:text-foreground"
      >
        {renderRowInner(agent, true)}
        {renderBadge(agent)}
      </DropdownMenuItem>
    );
  };

  // Opt-in "hide unconfigured harnesses" filter (Settings › Appearance). When
  // on, drop harness rows that can't launch on the selected host. Fails open:
  // harnessUnconfiguredOnHost returns false with no host / no readiness map, so
  // nothing is hidden in those cases, and unrecognized harnesses stay visible.
  const hideUnconfigured = useMemo(() => readHideUnconfiguredHarnesses(), []);
  // Split harnesses so the ready-to-use ones lead and the "needs setup" ones
  // fold into a "More" submenu (kept discoverable, out of the primary list).
  // The currently-selected harness always stays inline even when unconfigured,
  // so the active pick is never buried. With the hide-unconfigured preference
  // on, unconfigured harnesses are dropped entirely (no "More").
  const { readyHarnessEntries, moreHarnessEntries } = useMemo(() => {
    const ready: AvailableAgent[] = [];
    const more: AvailableAgent[] = [];
    for (const a of harnessEntries) {
      const unconfigured = harnessUnconfiguredOnHost(a.harness, host);
      if (!unconfigured || a.id === effectiveAgentId) ready.push(a);
      else if (!hideUnconfigured) more.push(a);
    }
    return { readyHarnessEntries: ready, moreHarnessEntries: more };
  }, [harnessEntries, host, hideUnconfigured, effectiveAgentId]);

  // Split the agents group: built-in bundle agents (Polly / Debby) stay inline
  // in the main list; user-registered custom agents fold into a "Custom agents"
  // submenu so a long roster doesn't crowd out the recommended picks.
  const { builtins: bundleEntries, customs: customEntries } = useMemo(
    () => partitionAgentsByKind(agentEntries),
    [agentEntries],
  );

  // Existing custom / pending agents fold into a "Custom agents" submenu so a
  // long roster doesn't crowd the recommended picks. When there are none, the
  // submenu would hold only the create action — which is a poor place to
  // discover it — so we surface "Create custom agent" as a top-level row
  // instead (see below). The submenu therefore renders only when there is at
  // least one custom / pending agent to group.
  const hasCustomAgents = customEntries.length > 0 || pendingAgent != null;
  // "Create custom agent" is reachable on any non-sandbox target (a managed
  // sandbox has no create path for an uploaded bundle).
  const canCreateAgent = !sandboxSelected;
  const createAgentItem = canCreateAgent ? (
    <DropdownMenuItem
      data-testid="new-chat-landing-create-agent"
      onSelect={onCreateCustomAgent}
      className="gap-2 rounded-sm px-2 py-1.5 text-13 text-muted-foreground"
    >
      <PlusIcon className="size-3.5" />
      Create custom agent
    </DropdownMenuItem>
  ) : null;
  const hasCustomGroup = hasCustomAgents;
  // Shared body for the custom-agents submenu (desktop flyout + mobile page):
  // the custom agents, the pending upload, and the create action.
  const customAgentsBody = (
    <>
      {customEntries.map(renderEntry)}
      {pendingAgent && (
        <DropdownMenuItem
          key={pendingAgentId}
          data-testid="new-chat-landing-agent-pending"
          data-active={effectiveAgentId === pendingAgentId ? "true" : undefined}
          onSelect={onSelectPending}
          className="items-start gap-2 rounded-sm px-2 py-1.5 text-13 data-[active=true]:bg-accent/60 data-[active=true]:text-foreground"
        >
          <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
            <span className="truncate">{pendingAgent.name}</span>
            <span className="truncate text-[11px] text-muted-foreground/70">Custom</span>
          </div>
        </DropdownMenuItem>
      )}
      {canCreateAgent && (
        <>
          <DropdownMenuSeparator />
          {createAgentItem}
        </>
      )}
    </>
  );
  // Which mobile drill-in page is showing (gated so a group that vanished — e.g.
  // list refresh — can't strand the menu on an empty page).
  const showMore = isMobile && mobilePage === "more" && moreHarnessEntries.length > 0;
  const showCustom = isMobile && mobilePage === "custom" && hasCustomGroup;
  // If the open page's group disappears (or the viewport grows to desktop),
  // fall back to the main list so a reopened menu never lands on an empty page.
  useEffect(() => {
    if (mobilePage === "more" && !showMore) setMobilePage(null);
    if (mobilePage === "custom" && !showCustom) setMobilePage(null);
  }, [mobilePage, showMore, showCustom]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          // Prefetch harness/description/skills for all session-discovered
          // agents so the list is stable before the user reads it.
          for (const agent of [...harnessEntries, ...agentEntries]) {
            void prefetchAvailableAgentDetails(agent, queryClient);
          }
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasAgents}
          data-testid="new-chat-landing-agent-select"
          // Drop the Button's focus-visible ring/border that otherwise shows
          // when focus returns to the trigger after a pick.
          className="h-8 gap-1.5 pr-1 pl-2.5 font-normal text-muted-foreground hover:text-foreground focus-visible:border-transparent focus-visible:ring-0"
        >
          <span className="max-w-[12rem] truncate text-xs text-foreground">
            {hasAgents ? agentLabel : "No agents"}
          </span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        // Keep the menu inside the viewport on short mobile screens: pad the
        // collision box so the available-height cap leaves room below the
        // status bar, and let it flip/scroll rather than run off the top.
        collisionPadding={12}
        avoidCollisions
        className="max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-64 max-w-[calc(100vw-2rem)] overflow-y-auto p-1"
      >
        {showMore ? (
          // Mobile drill-in page for the "needs setup" harnesses.
          <div className="animate-in fade-in-0 slide-in-from-right-2 duration-150">
            <DropdownMenuItem
              data-testid="new-chat-landing-page-back"
              onSelect={(e) => {
                e.preventDefault();
                setMobilePage(null);
              }}
              className="items-center gap-1.5 rounded-sm px-2 py-1.5 text-13 font-medium"
            >
              <ChevronLeftIcon className="size-4 shrink-0 opacity-70" />
              <span className="truncate">More</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {moreHarnessEntries.map(renderEntry)}
          </div>
        ) : showCustom ? (
          // Mobile drill-in page for custom agents.
          <div className="animate-in fade-in-0 slide-in-from-right-2 duration-150">
            <DropdownMenuItem
              data-testid="new-chat-landing-page-back"
              onSelect={(e) => {
                e.preventDefault();
                setMobilePage(null);
              }}
              className="items-center gap-1.5 rounded-sm px-2 py-1.5 text-13 font-medium"
            >
              <ChevronLeftIcon className="size-4 shrink-0 opacity-70" />
              <span className="truncate">Custom agents</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {customAgentsBody}
          </div>
        ) : (
          <>
            {/* Harnesses group first — the native terminal CLIs (Claude Code is
            the default), so the most-used picks lead. Ready-to-use harnesses
            list inline; "needs setup" ones fold into a "More" group. */}
            {(readyHarnessEntries.length > 0 || moreHarnessEntries.length > 0) && (
              <>
                <PickerSectionHeader>Harnesses</PickerSectionHeader>
                {readyHarnessEntries.map(renderEntry)}
                {moreHarnessEntries.length > 0 &&
                  (isMobile ? (
                    // Touch: drill into a "More" page in place (with Back).
                    <DropdownMenuItem
                      data-testid="new-chat-landing-harness-more"
                      onSelect={(e) => {
                        e.preventDefault();
                        setMobilePage("more");
                      }}
                      className="items-center gap-2 rounded-sm px-2 py-1.5 text-13"
                    >
                      <span className="flex-1">More</span>
                      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/70" />
                    </DropdownMenuItem>
                  ) : (
                    // Desktop: hover flyout submenu.
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger
                        data-testid="new-chat-landing-harness-more"
                        className="items-center gap-2 rounded-sm px-2 py-1.5 text-13"
                      >
                        <span className="flex-1">More</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-56 max-w-[calc(100vw-2rem)] overflow-y-auto p-1">
                        {moreHarnessEntries.map(renderEntry)}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                <DropdownMenuSeparator />
              </>
            )}
            {/* Agents group — built-in bundle agents (Polly / Debby) inline. */}
            <PickerSectionHeader>Agents</PickerSectionHeader>
            {bundleEntries.map(renderEntry)}
            {/* Existing custom agents fold into a "Custom agents" submenu (with
            the pending upload and the create action). With no custom agents the
            submenu would hold only "Create custom agent", so we surface that as
            a top-level row instead — otherwise creation is invisible on a fresh
            server. A managed sandbox has no create path, so neither appears. */}
            {hasCustomGroup &&
              (isMobile ? (
                // Touch: drill into a "Custom agents" page in place (with Back).
                <DropdownMenuItem
                  data-testid="new-chat-landing-custom-agents"
                  onSelect={(e) => {
                    e.preventDefault();
                    setMobilePage("custom");
                  }}
                  className="items-center gap-2 rounded-sm px-2 py-1.5 text-13"
                >
                  <span className="flex-1">Custom agents</span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/70" />
                </DropdownMenuItem>
              ) : (
                // Desktop: hover flyout submenu.
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    data-testid="new-chat-landing-custom-agents"
                    className="items-center gap-2 rounded-sm px-2 py-1.5 text-13"
                  >
                    <span className="flex-1">Custom agents</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-56 max-w-[calc(100vw-2rem)] overflow-y-auto p-1">
                    {customAgentsBody}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            {/* No custom agents to group: surface the create action directly so
            it stays discoverable instead of hiding behind an empty submenu. */}
            {!hasCustomGroup && createAgentItem}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Sentinel Select values for the Model row. Radix requires a non-empty value,
// so the two "no explicit model" choices ride on reserved tokens rather than
// "": DEFAULT = Claude Code's own configured model (no override), SMART = the
// intelligent router picks per turn.
const MODEL_SELECT_DEFAULT = "__default__";
const MODEL_SELECT_SMART = "__smart__";
// Sentinel for the "no explicit effort" (—) choice, same reasoning.
const EFFORT_SELECT_NONE = "__none__";

/**
 * A labeled configuration row: bold label + muted sub-description on the left,
 * the control on the right. Mirrors the "Configure …" modal layout.
 */
export function ConfigRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    // Stacked on mobile (label above a full-width control) so the label never
    // gets squeezed into a narrow column and wraps hard; side-by-side from sm+
    // with the control pinned to a fixed width.
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 sm:pt-1">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="w-full sm:w-52 sm:shrink-0">{children}</div>
    </div>
  );
}

/**
 * A config-modal Select whose options carry descriptions. The description of
 * the hovered / focused option (falling back to the selected one) shows in a
 * footer line pinned at the bottom of the OPEN dropdown. The popup is pinned to
 * the trigger width and the footer wraps, so the dropdown never changes width
 * as you hover across options.
 *
 * @param value Selected option value.
 * @param onValueChange Selection callback.
 * @param options Value/label/description triples.
 * @param testId Trigger test id.
 * @param ariaLabel Accessible name for the trigger (the visible ConfigRow
 *   label is visual-only, so pass it here to name the control for AT).
 */
export function DescribedSelect({
  value,
  onValueChange,
  options,
  testId,
  ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string; description: string }[];
  testId: string;
  ariaLabel: string;
}) {
  const [previewed, setPreviewed] = useState<string | null>(null);
  const detail = options.find((o) => o.value === (previewed ?? value))?.description;
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      // Reset the preview when the list closes so the next open starts on the
      // selected option's blurb.
      onOpenChange={(next) => {
        if (!next) setPreviewed(null);
      }}
    >
      <SelectTrigger className="w-full" data-testid={testId} aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      {/* Pin the popup to the trigger width so a long blurb wraps in the footer
      instead of widening the list as you hover across options. */}
      <SelectContent
        position="popper"
        align="start"
        className="w-(--radix-select-trigger-width) [&_[data-slot=select-item]]:pl-2.5"
      >
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            onPointerEnter={() => setPreviewed(o.value)}
            onFocus={() => setPreviewed(o.value)}
          >
            {o.label}
          </SelectItem>
        ))}
        {/* Footer blurb pinned inside the dropdown, tracking the hovered row.
        min-h reserves a line so the popup height doesn't jump as it changes. */}
        <SelectSeparator />
        <p
          data-testid={`${testId}-detail`}
          className="min-h-8 px-2.5 pt-0.5 pb-1 text-xs leading-snug text-muted-foreground"
        >
          {detail}
        </p>
      </SelectContent>
    </Select>
  );
}

/**
 * Harness-configuration modal opened from the composer's gear icon. Shows the
 * selected agent's run-config knobs — Claude: model / effort / permissions;
 * Codex/OpenCode: approval mode (+ Codex's dangerous full-bypass opt-in);
 * Cursor: exec mode; bundle agents: brain-harness override.
 *
 * The modal edits a LOCAL draft seeded from the live state each time it opens,
 * and only commits to the parent state + per-harness persistence on Save;
 * Cancel / dismiss discards. This is the deliberate Save/Cancel UX (the old
 * in-dropdown submenu committed on every change).
 */
export function HarnessConfigModal({
  open,
  onOpenChange,
  agent,
  brainHarnessLabels,
  host,
  hideUnconfigured,
  smartRoutingEligible,
  permissionMode,
  approvalMode,
  cursorExecMode,
  bypassSandbox,
  pickedModel,
  pickedEffort,
  pickedHarness,
  costControlMode,
  setPermissionMode,
  setApprovalMode,
  setCursorExecMode,
  setBypassSandbox,
  setPickedModel,
  setPickedEffort,
  setPickedHarness,
  setCostControlMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AvailableAgent;
  brainHarnessLabels: Record<string, string>;
  host: Host | undefined | null;
  hideUnconfigured: boolean;
  smartRoutingEligible: boolean;
  permissionMode: string;
  approvalMode: string;
  cursorExecMode: string;
  bypassSandbox: boolean;
  pickedModel: string;
  pickedEffort: string;
  pickedHarness: string | null;
  costControlMode: CostControlMode;
  setPermissionMode: (mode: string) => void;
  setApprovalMode: (mode: string) => void;
  setCursorExecMode: (mode: string) => void;
  setBypassSandbox: (enabled: boolean) => void;
  setPickedModel: (model: string) => void;
  setPickedEffort: (effort: string) => void;
  setPickedHarness: (harness: string | null, agentId?: string) => void;
  setCostControlMode: (mode: CostControlMode) => void;
}) {
  const info = useServerInfo();
  // Feature ON → single "needs setup" badge; OFF → per-reason original text.
  const collapsedBadge = info !== "loading" && info.harness_install_enabled;
  const entryHarness = nativeCodingAgentForAvailableAgent(agent)?.harness ?? null;
  const hasPermission = nativeAgentHasCapability(agent, "permissionMode");
  const hasApproval = nativeAgentHasCapability(agent, "approvalMode");
  const hasCursor = nativeAgentHasCapability(agent, "cursorMode");
  const isCodex = entryHarness === "codex-native";
  const brainDefault =
    agent.harness != null && agent.harness in brainHarnessLabels ? agent.harness : null;

  // Local draft — seeded from the live state each time the modal opens so
  // Cancel can discard and re-opening always reflects the committed state.
  const [draftModel, setDraftModel] = useState(pickedModel);
  const [draftEffort, setDraftEffort] = useState(pickedEffort);
  const [draftPermission, setDraftPermission] = useState(permissionMode);
  const [draftApproval, setDraftApproval] = useState(approvalMode);
  const [draftCursor, setDraftCursor] = useState(cursorExecMode);
  const [draftBypass, setDraftBypass] = useState(bypassSandbox);
  const [draftHarness, setDraftHarness] = useState<string | null>(pickedHarness);
  const [draftRouting, setDraftRouting] = useState<CostControlMode>(costControlMode);

  useEffect(() => {
    if (!open) return;
    setDraftModel(pickedModel);
    setDraftEffort(pickedEffort);
    setDraftPermission(permissionMode);
    setDraftApproval(approvalMode);
    setDraftCursor(cursorExecMode);
    setDraftBypass(bypassSandbox);
    setDraftHarness(pickedHarness);
    setDraftRouting(costControlMode);
    // Seed once per open from the current live values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Only treat routing as "on" when it's actually offered for this agent —
  // otherwise a stale costControlMode="on" (e.g. server later disabled the
  // flag) would select the __smart__ sentinel with no matching Select item.
  const smartRoutingOn = smartRoutingEligible && draftRouting === "on";
  const modelValue = smartRoutingOn ? MODEL_SELECT_SMART : draftModel || MODEL_SELECT_DEFAULT;
  const onModelChange = (value: string) => {
    if (value === MODEL_SELECT_SMART) {
      setDraftRouting("on");
      setDraftModel("");
      // The router picks the model (and its effort) per turn, so an explicit
      // effort is meaningless — reset it so it doesn't ride along frozen.
      setDraftEffort("");
    } else if (value === MODEL_SELECT_DEFAULT) {
      setDraftModel("");
      // "Default" = no override; defer routing to the spec default (null,
      // omitted from create) — never emit an explicit "on"/"off".
      setDraftRouting(null);
    } else {
      setDraftModel(value);
      // Picking an explicit model turns routing off (mutually exclusive).
      setDraftRouting(null);
    }
  };

  const save = () => {
    if (hasPermission) {
      // Order matters: commit model first (its setter clears routing when a
      // model is set), then routing (its setter clears the model when "on") —
      // the two setters enforce the mutual exclusion between them.
      setPickedModel(draftModel);
      setPickedEffort(draftEffort);
      setPermissionMode(draftPermission);
      if (entryHarness)
        writeHarnessOption(entryHarness, {
          model: draftModel,
          effort: draftEffort,
          mode: draftPermission,
        });
    } else if (hasApproval) {
      setApprovalMode(draftApproval);
      setBypassSandbox(draftBypass);
      if (entryHarness) writeHarnessOption(entryHarness, { mode: draftApproval });
    } else if (hasCursor) {
      setCursorExecMode(draftCursor);
      if (entryHarness) writeHarnessOption(entryHarness, { mode: draftCursor });
    } else if (brainDefault) {
      // Picking the spec default clears the override so the session tracks it.
      setPickedHarness(draftHarness === brainDefault ? null : draftHarness, agent.id);
    }
    // Smart Routing is offered on Claude (Model dropdown) and other routable
    // agents (standalone toggle), so commit it for every eligible agent — not
    // just the Claude branch above.
    if (smartRoutingEligible) setCostControlMode(draftRouting);
    onOpenChange(false);
  };

  const brainEntries = brainDefault
    ? Object.entries(brainHarnessLabels).filter(
        ([id]) =>
          id === (draftHarness ?? brainDefault) ||
          !hideUnconfigured ||
          !harnessUnconfiguredOnHost(id, host),
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="new-chat-landing-config-modal">
        <DialogHeader>
          <DialogTitle>Configure {agent.display_name}</DialogTitle>
          <DialogDescription className="sr-only">
            Configure how {agent.display_name} runs for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
          {/* Smart Routing as a standalone toggle, first, for routable agents
          that have no Model dropdown to fold it into (Codex, bundle agents, …).
          Claude offers it as a Model option instead, so it's excluded here. */}
          {smartRoutingEligible && !hasPermission && (
            <ConfigRow label="Smart Routing" description="Auto-pick the model per turn by task">
              <div className="flex h-8 items-center justify-end">
                <Switch
                  size="sm"
                  checked={smartRoutingOn}
                  data-testid="new-chat-landing-config-smart-routing"
                  aria-label="Smart Routing"
                  onCheckedChange={(next) => setDraftRouting(next ? "on" : "off")}
                />
              </div>
            </ConfigRow>
          )}
          {hasPermission && (
            <>
              <ConfigRow label="Model" description="Underlying LLM">
                <Select value={modelValue} onValueChange={onModelChange}>
                  <SelectTrigger
                    className="w-full"
                    data-testid="new-chat-landing-config-model"
                    aria-label="Model"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="[&_[data-slot=select-item]]:pl-2.5"
                  >
                    {smartRoutingEligible && (
                      <SelectItem value={MODEL_SELECT_SMART}>Smart Routing</SelectItem>
                    )}
                    <SelectItem value={MODEL_SELECT_DEFAULT}>Default</SelectItem>
                    {CLAUDE_NATIVE_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ConfigRow>

              <ConfigRow label="Effort" description="Reasoning depth vs. speed">
                <Select
                  value={draftEffort || EFFORT_SELECT_NONE}
                  onValueChange={(v) => setDraftEffort(v === EFFORT_SELECT_NONE ? "" : v)}
                  // Smart Routing picks the model + effort per turn, so an
                  // explicit effort can't apply — freeze it to Default.
                  disabled={smartRoutingOn}
                >
                  <SelectTrigger
                    className="w-full"
                    data-testid="new-chat-landing-config-effort"
                    aria-label="Reasoning effort"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="[&_[data-slot=select-item]]:pl-2.5"
                  >
                    <SelectItem value={EFFORT_SELECT_NONE}>Default</SelectItem>
                    {CLAUDE_NATIVE_EFFORTS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ConfigRow>

              <ConfigRow label="Permissions" description="What the agent can do without asking">
                <DescribedSelect
                  value={draftPermission}
                  onValueChange={setDraftPermission}
                  options={CLAUDE_NATIVE_PERMISSION_MODES}
                  testId="new-chat-landing-config-permission"
                  ariaLabel="Permissions"
                />
              </ConfigRow>
            </>
          )}

          {hasApproval && (
            <>
              <ConfigRow label="Approval" description="What the agent can do without asking">
                <DescribedSelect
                  // Codex adds the DANGEROUS full-bypass as a 4th option; when
                  // armed the select shows it (draftBypass wins over the preset).
                  value={
                    isCodex && draftBypass ? CODEX_NATIVE_BYPASS_APPROVAL_VALUE : draftApproval
                  }
                  onValueChange={(v) => {
                    if (v === CODEX_NATIVE_BYPASS_APPROVAL_VALUE) {
                      setDraftBypass(true);
                    } else {
                      setDraftBypass(false);
                      setDraftApproval(v);
                    }
                  }}
                  options={
                    isCodex
                      ? [...CODEX_NATIVE_APPROVAL_MODES, CODEX_NATIVE_BYPASS_APPROVAL_OPTION]
                      : CODEX_NATIVE_APPROVAL_MODES
                  }
                  testId="new-chat-landing-config-approval"
                  ariaLabel="Approval"
                />
              </ConfigRow>
              {/* Persistent danger banner while full-bypass is selected. */}
              {isCodex && draftBypass && (
                <div
                  role="alert"
                  data-testid="new-chat-landing-bypass-sandbox-banner"
                  className="flex items-start gap-1.5 rounded-md border border-destructive bg-destructive/10 px-2 py-1.5 text-xs font-medium leading-relaxed text-destructive"
                >
                  <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Danger: this session runs Codex with approvals and the sandbox disabled. It can
                    edit any file and run any command without asking.
                  </span>
                </div>
              )}
            </>
          )}

          {hasCursor && (
            <ConfigRow label="Mode" description="How Cursor runs commands">
              <DescribedSelect
                value={draftCursor}
                onValueChange={setDraftCursor}
                options={CURSOR_NATIVE_EXEC_MODES}
                testId="new-chat-landing-config-cursor-mode"
                ariaLabel="Mode"
              />
            </ConfigRow>
          )}

          {!hasPermission && !hasApproval && !hasCursor && brainDefault && (
            <ConfigRow label="Agent Harness" description="Underlying coding harness">
              <Select value={draftHarness ?? brainDefault} onValueChange={setDraftHarness}>
                <SelectTrigger
                  className="w-full"
                  data-testid="new-chat-landing-config-harness"
                  aria-label="Agent Harness"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="[&_[data-slot=select-item]]:pl-2.5"
                >
                  {brainEntries.map(([id, label]) => (
                    <SelectItem key={id} value={id} data-testid={`new-chat-landing-harness-${id}`}>
                      <span className="flex items-center gap-2">
                        {label}
                        {harnessUnconfiguredOnHost(id, host) && (
                          <Badge
                            variant="outline"
                            className="border-amber-300 bg-amber-50 text-[11px] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                            data-testid={`new-chat-landing-harness-warning-${id}`}
                          >
                            {harnessWarningBadgeText(
                              harnessUnavailableReasonOnHost(id, host),
                              collapsedBadge,
                            )}
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigRow>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="new-chat-landing-config-cancel"
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} data-testid="new-chat-landing-config-save">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
