import {
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "@/lib/routing";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MonitorIcon,
  MonitorCloudIcon,
  CircleHelpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GitBranchIcon,
  ArrowUpIcon,
  Loader2Icon,
  FileTextIcon,
  FilmIcon,
  FolderIcon,
  ImageIcon,
  PaperclipIcon,
  PlusIcon,
  SettingsIcon,
  ShuffleIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authenticatedFetch } from "@/lib/identity";
import { isImeCompositionKeyEvent } from "@/lib/ime";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useServerInfo } from "@/lib/CapabilitiesContext";
import { HarnessSetupDialog } from "@/shell/HarnessSetupDialog";
import {
  harnessUnavailableReasonOnHost,
  harnessUnconfiguredOnHost,
  harnessWarningBadgeText,
} from "@/lib/harnessSetup";

// Re-exported for tests that import the readiness helpers from this module.
export { harnessUnavailableReasonOnHost, harnessUnconfiguredOnHost, harnessWarningBadgeText };
import { sandboxOptionLabel } from "@/lib/capabilities";
import {
  rankedSlashCommandNames,
  SlashCommandMenu,
} from "@/components/SlashCommandMenu";
import { useChatStore } from "@/store/chatStore";
import { appendPromptHistoryEntry } from "@/hooks/usePromptHistory";
import { WorkspacePicker, isNavigablePath } from "./WorkspacePicker";
import {
  basenameOfPath,
  joinPathSegments,
} from "@/lib/hostPaths";
import {
  initialPrefillState,
  prefillDone,
  projectPrefillStep,
  type ProjectPrefillState,
} from "./projectPrefill";
import { getCliServerUrl } from "@/lib/host";
import { getAgentMeowHostConfig } from "@/lib/host";
import { readLastAgentId, writeLastAgentId } from "@/lib/agentPreferences";
import {
  readLastHostChoice,
  writeLastHostChoice,
  SANDBOX_HOST_CHOICE,
} from "@/lib/hostPreferences";
import { readLastHarness, writeLastHarness } from "@/lib/harnessPreferences";
import { readHideUnconfiguredHarnesses } from "@/lib/harnessVisibilityPreferences";
import { readDefaultBaseBranch } from "@/lib/baseBranchPreferences";
import { readHarnessOptions } from "@/lib/modePreferences";
import { AUTO_HARNESS_ID, useBrainHarnessLabels } from "@/lib/agentLabels";
import { CLAUDE_NATIVE_MODELS } from "@/lib/claudeNativeModels";
import { sortAgentsForDisplay } from "@/lib/agentGrouping";
import { cn } from "@/lib/utils";
import {
  isNativeCodingAgent,
  nativeAgentHasCapability,
  nativeCodingAgentForAvailableAgent,
  nativeWrapperLabelsForAgent,
} from "@/lib/nativeCodingAgents";
import { useHosts, type Host } from "@/hooks/useHosts";
import {
  controlHost,
  getHostIdentity,
  isElectronShell,
  onHostStatusChanged,
  type HostIdentity,
} from "@/lib/nativeBridge";
import {
  useAvailableAgents,
  type AvailableAgent,
} from "@/hooks/useAvailableAgents";
import { useAutoGrowTextarea } from "@/hooks/useAutoGrowTextarea";
import { useDictationInsert } from "@/hooks/useDictationInsert";
import { useRecentWorkspaces } from "@/hooks/useRecentWorkspaces";
import { useDirectorySessions } from "@/hooks/useDirectorySessions";
import { useRunnerHealthRegistration } from "@/hooks/RunnerHealthProvider";
import {
  createHostDirectory,
  useHostFilesystem,
} from "@/hooks/useHostFilesystem";
import { useHostWorktrees } from "@/hooks/useHostWorktrees";
import { useNativeServerSwitcherForMainSurface } from "@/hooks/useNativeServerSwitcher";
import type { WorkspaceFile } from "@/hooks/useWorkspaceChangedFiles";
import { useNewestProjectSession, PROJECT_LABEL_KEY } from "@/hooks/useConversations";
import { FileMentionMenu } from "@/components/FileMentionMenu";
import { useMentionBrowser } from "@/hooks/useMentionBrowser";
import {
  buildMentionPreamble,
  detectMentionAt,
  mentionItemPath,
  type MentionState,
  parseMentionToken,
  rankMentionEntries,
} from "@/lib/composerMentions";
import { SkillPills } from "@/components/SkillPills";
import { ComposerMicButton } from "@/components/ComposerMicButton";
import { VoicePawButton } from "@/components/VoicePawButton";
import { WorkspaceHero } from "@/shell/WorkspaceHero";
import { useWakeWordDetector } from "@/hooks/useWakeWordDetector";
import { useWakeWordReply } from "@/hooks/useWakeWordReply";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { type CostControlMode } from "@/components/CostRoutingControl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateAgentDialog } from "./CreateAgentDialog";
import { buildAgentBundle, type AgentBundleInput } from "@/lib/agentBundle";
import { createBundledSession, launchRunner } from "@/lib/sessionsApi";

// Session-config pickers + harness config modal moved to SessionConfigSheet
// (plan-040 Phase 0, Task 3). Re-exported so the existing import paths
// (ForkSessionDialog, ResumeWithDirectoryDialog, landing test files) stay
// stable — the re-export is a required Phase 0 seam, not dead code.
import {
  AgentHarnessPicker,
  composeSandboxWorkspace,
  ConnectHostInstructions,
  deriveHomeDir,
  describeCreateError,
  deriveRepoName,
  HarnessConfigModal,
  HarnessSetupNotice,
  HostOption,
  isValidSandboxRepoUrl,
  isValidWorkspace,
  LandingProjectPicker,
  matchSkillInvocation,
  normalizeWorkspacePath,
  sanitizeInitialPrompt,
  worktreePathTail,
} from "./SessionConfigSheet";
import {
  CLAUDE_NATIVE_DEFAULT_PERMISSION_MODE,
  CLAUDE_NATIVE_EFFORTS,
  CLAUDE_NATIVE_PERMISSION_MODES,
  CODEX_NATIVE_APPROVAL_MODES,
  CODEX_NATIVE_BYPASS_APPROVAL_OPTION,
  CODEX_NATIVE_BYPASS_SANDBOX_LABEL_KEY,
  CODEX_NATIVE_DEFAULT_APPROVAL_MODE,
  CURSOR_NATIVE_DEFAULT_EXEC_MODE,
  CURSOR_NATIVE_EXEC_MODES,
  NEW_SESSION_HIDDEN_AGENTS,
  SKILL_PILL_AGENTS,
  SINGLE_USER_PRIMARY_AGENT_NAME,
  _ROUTABLE_HARNESSES,
} from "./SessionConfigSheet";
export {
  AgentHarnessPicker,
  composeSandboxWorkspace,
  ConfigRow,
  deriveHomeDir,
  describeCreateError,
  deriveRepoName,
  DescribedSelect,
  HarnessConfigModal,
  HarnessSetupNotice,
  HostOption,
  isValidSandboxRepoUrl,
  isValidWorkspace,
  LandingProjectPicker,
  matchSkillInvocation,
  normalizeWorkspacePath,
  PickerSectionHeader,
  sanitizeInitialPrompt,
  sessionsSharingDirectory,
  worktreePathTail,
} from "./SessionConfigSheet";
export { ConnectHostInstructions } from "./SessionConfigSheet";


// In-memory draft for the new-session landing screen, so a half-composed
// message, attachments and picker selections survive the unmount that happens
// when the user navigates into an existing session and back. Module-scoped,
// not persisted to storage (a page refresh starts clean); cleared on create.
type LandingDraft = {
  message: string;
  files: File[];
  pickedAgentId: string | null;
  selectedHostId: string | null;
  sandboxSelected: boolean;
  sandboxRepoUrl: string;
  sandboxRepoBranch: string;
  workspace: string;
  branchName: string;
  prefilledBranch: string;
  permissionMode: string;
  approvalMode: string;
  bypassSandbox: boolean;
  cursorExecMode: string;
  pickedHarness: string | null;
  pickedModel: string;
  pickedEffort: string;
  costControlMode: CostControlMode;
};

let landingDraft: LandingDraft | null = null;

// Test-only: clears the preserved landing draft so each case starts from a
// clean module state (the draft is module-scoped and survives unmount by
// design, which would otherwise leak between tests).
export function resetLandingDraft(): void {
  landingDraft = null;
}

export function NewChatLandingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const serverUrl = getCliServerUrl();
  const { data: agents } = useAvailableAgents();
  const { data: hosts, isLoading: hostsLoading } = useHosts();

  const agentList = useMemo(
    () =>
      sortAgentsForDisplay((agents ?? []).filter((a) => !NEW_SESSION_HIDDEN_AGENTS.has(a.name))),
    [agents],
  );

  // Split the picker into "Harnesses" (the native terminal CLIs) and
  // "Agents" (SDK / bundle agents like Polly & Debby plus any custom
  // user-registered agents). This is the isNativeCodingAgent split, NOT the
  // builtins/customs split: Polly & Debby are built-ins but belong under
  // "Agents", not "Harnesses".
  const harnessEntries = useMemo(
    () => agentList.filter((a) => isNativeCodingAgent(a)),
    [agentList],
  );
  const agentEntries = useMemo(() => agentList.filter((a) => !isNativeCodingAgent(a)), [agentList]);
  const preferredSingleUserAgentId = useMemo(
    () =>
      agentList.find((agent) => agent.name === SINGLE_USER_PRIMARY_AGENT_NAME)?.id ??
      agentList[0]?.id ??
      null,
    [agentList],
  );

  // "Create custom agent" dialog state and pending bundle. When the user
  // creates a custom agent via the dialog, the bundle input is stored
  // here and the picker switches to a virtual "pending" agent entry. On
  // form submit, handleCreate detects the pending bundle, builds the
  // tar.gz, and uses multipart POST instead of the normal JSON path.
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<AgentBundleInput | null>(null);
  // Sentinel id for the pending custom agent in the picker dropdown.
  const PENDING_AGENT_ID = "__pending_custom_agent__";

  // Surface element backing the iOS native server switcher overlay, which
  // the in-session view shows too — the picker stays reachable while starting
  // a new session. The hook hides it whenever the sidebar covers the surface.
  const [landingSurface, setLandingSurface] = useState<HTMLElement | null>(null);
  useNativeServerSwitcherForMainSurface(landingSurface, true);

  const [message, setMessage] = useState<string>(() => landingDraft?.message ?? "");
  const dictation = useDictationInsert(setMessage);
  // Composer text captured when voice dictation starts, so Esc can revert to it.
  const voiceSnapshotRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);
  // maxRows 9 = 180px of 20px lines, matching the composer's 200px
  // border-box max (180px content + 16px top / 4px bottom padding).
  useAutoGrowTextarea(textareaRef, message, 9);

  // Attachments for the first message — same affordances as the in-session
  // composer (paperclip + paste); carried to ChatPage via the pending
  // initial prompt and sent with the auto-dispatched first turn.
  const [files, setFiles] = useState<File[]>(() => landingDraft?.files ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFiles = (incoming: File[]) => setFiles((prev) => [...prev, ...incoming]);
  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  // Drag-and-drop onto the composer — same behavior as the in-session
  // composer (drop files anywhere on the box; an inset ring + overlay
  // signal the drop target).
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) addFiles(dropped);
  };

  const handleDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Only clear the active state when the pointer leaves the container
    // itself, not when it moves between child elements inside it.
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragActive(false);
  };

  // Gates the sandbox host option: only servers whose sandbox
  // config can actually serve a managed launch advertise it. "loading"
  // fails closed (option hidden) until the boot probe resolves.
  const info = useServerInfo();
  const isSingleUser = info !== "loading" && info.single_user;
  // Dedicated single-user working directory (~/agent-meow-workspace); the
  // landing screen provisions + seeds it. null outside single-user mode.
  const defaultWorkspace = info !== "loading" ? (info.default_workspace ?? null) : null;
  const managedSandboxesEnabled = info !== "loading" && info.managed_sandboxes_enabled;
  const smartRoutingEnabled = info !== "loading" && info.smart_routing_enabled;
  // Gates the whole UI-driven setup experience (Set up affordance + dialog +
  // collapsed badge). OFF → the composer/picker fall back to the original
  // "run agent-meow setup" guidance, so a disabled flag is a no-op on the UI.
  const harnessInstallEnabled = info !== "loading" && info.harness_install_enabled;
  const brainHarnessLabels = useBrainHarnessLabels(smartRoutingEnabled);
  // Provider-named label for the sandbox option (e.g. "Modal Sandbox"),
  // falling back to the generic "New Sandbox" when the server names no
  // provider.
  const sandboxLabel = sandboxOptionLabel(info !== "loading" ? info.sandbox_provider : null);
  // Embed-only docs seam: when the host passes additional docs and managed
  // sandboxes are unavailable, keep the sandbox row visible but disabled and
  // attach a help tooltip with a clickable link.
  const docsLinks = getAgentMeowHostConfig().docsLinks;
  const newSandboxTooltipContent = docsLinks?.newSandbox;
  // Embed-only docs seam for Databricks git auth setup. Standalone leaves this
  // undefined, so no tooltip is rendered.
  const databricksGitCredentialsTooltipContent = docsLinks?.databricksGitCredentials;
  const showDisabledSandboxWithDocs = !managedSandboxesEnabled && !!newSandboxTooltipContent;

  // Project driving this visit, when the sidebar's per-project "new session"
  // pencil landed here with a `?project=` query param. Empty otherwise.
  const projectParam = searchParams.get("project") ?? "";
  // Seeded from the persisted last pick so a returning user starts on the
  // agent they used last; validated against the live list in
  // effectiveAgentId below (a stale id falls back to the default). A
  // project-driven visit defers to the project-prefill effect instead
  // (which falls back to the same last pick).
  const [pickedAgentId, setPickedAgentId] = useState<string | null>(
    () => landingDraft?.pickedAgentId ?? (projectParam !== "" ? null : readLastAgentId()),
  );
  const [selectedHostId, setSelectedHostId] = useState<string | null>(
    () => landingDraft?.selectedHostId ?? null,
  );
  // Sessions on the selected host — fetched only when a host is selected,
  // to avoid registering hundreds of sessions into the health poll at idle.
  const { data: directorySessions } = useDirectorySessions(selectedHostId !== null);
  // True when the user picked the sandbox option instead of a connected
  // host — the server provisions a sandbox host at create time
  // (host_type: "managed"), so no host_id or workspace is sent.
  const [sandboxSelected, setSandboxSelected] = useState(
    () => landingDraft?.sandboxSelected ?? false,
  );
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  // Desktop-shell host status for THIS machine (null outside Electron), so the
  // picker can tag the current machine and offer to auto-connect it.
  const [desktopHost, setDesktopHost] = useState<HostIdentity | null>(null);
  const [connectingThisMachine, setConnectingThisMachine] = useState(false);
  // Defer the connect until the dropdown has actually closed (set on select,
  // consumed in the menu's onOpenChange) — connecting while the menu is open
  // looks janky. A ref so the close handler sees it synchronously.
  const pendingConnectRef = useRef(false);
  // Sandbox repository inputs — composed into the managed create's
  // `workspace` string (`<url>[#<branch>]`); both blank = empty
  // server-created workspace.
  const [sandboxRepoUrl, setSandboxRepoUrl] = useState<string>(
    () => landingDraft?.sandboxRepoUrl ?? "",
  );
  const [sandboxRepoBranch, setSandboxRepoBranch] = useState<string>(
    () => landingDraft?.sandboxRepoBranch ?? "",
  );
  const [workspace, setWorkspace] = useState<string>(() => landingDraft?.workspace ?? "");
  const [branchName, setBranchName] = useState<string>(() => landingDraft?.branchName ?? "");
  // The base branch auto-fills from the configured default (Settings › Git)
  // when the user names a worktree branch, and is left alone once the user
  // touches it — clearing the branch name re-arms the auto-fill (see the effect
  // below). `baseBranchEdited` tracks that hand-off; any edit (including
  // clearing the field) sets it so a later re-seed won't clobber the choice.
  const [baseBranch, _setBaseBranch] = useState<string>("");
  const [baseBranchEdited, setBaseBranchEdited] = useState<boolean>(false);
  const setBaseBranch = useCallback((next: string) => {
    _setBaseBranch(next);
    setBaseBranchEdited(true);
  }, []);
  // Branch prefilled from the existing worktree the current workspace points
  // at. When `branchName` still equals this, the session starts directly in
  // that worktree (no git opts). Editing the field away from it means the user
  // wants a *new* worktree off that name.
  const [prefilledBranch, setPrefilledBranch] = useState<string>(
    () => landingDraft?.prefilledBranch ?? "",
  );
  // Project to file the new session under (an implicit collection stored as a
  // conversation_labels row). Empty = unfiled. Applied right after create.
  // Pre-filled from the `?project=` param so the sidebar's per-project
  // "new session" pencil lands here with the project already selected.
  const [selectedProject, setSelectedProject] = useState<string>(() => projectParam);
  // The landing screen stays mounted while the `?project=` param changes (e.g.
  // clicking a different project's pencil), so the lazy initializer above won't
  // re-run — sync the selection to the param whenever it changes.
  useEffect(() => {
    setSelectedProject(projectParam);
  }, [projectParam]);
  // Permission mode for Claude Code (claude --permission-mode). Only
  // meaningful for the claude-native wrapper; ignored otherwise. Lives in
  // the footer tray's Advanced settings menu.
  const [permissionMode, setPermissionMode] = useState<string>(
    () => landingDraft?.permissionMode ?? CLAUDE_NATIVE_DEFAULT_PERMISSION_MODE,
  );
  // Approval mode for Codex (codex --approval-mode). Only meaningful for
  // the codex-native wrapper; ignored otherwise. Lives in the footer
  // tray's Advanced settings menu.
  const [approvalMode, setApprovalMode] = useState<string>(
    () => landingDraft?.approvalMode ?? CODEX_NATIVE_DEFAULT_APPROVAL_MODE,
  );
  // DANGEROUS codex full-bypass opt-in (Codex only). OFF by default and only
  // flippable on after the user types the confirmation phrase, so it can
  // never be enabled by an accidental click. Persisted as a conversation
  // label so it survives reload. When on, a persistent red banner warns and
  // the runner ignores the approval-mode preset's flags.
  const [bypassSandbox, setBypassSandbox] = useState<boolean>(
    () => landingDraft?.bypassSandbox ?? false,
  );
  // Execution mode for Cursor (cursor-agent --mode / --yolo). Only meaningful
  // for the cursor-native wrapper; ignored otherwise.
  const [cursorExecMode, setCursorExecMode] = useState<string>(
    () => landingDraft?.cursorExecMode ?? CURSOR_NATIVE_DEFAULT_EXEC_MODE,
  );
  // Per-session brain-harness override for bundle agents (polly / debby).
  // null = the agent spec's declared harness (no override sent). On agent
  // switch, seeded from the user's last stored pick for that agent.
  const [pickedHarness, setPickedHarness] = useState<string | null>(
    () =>
      landingDraft?.pickedHarness ??
      readLastHarness(landingDraft?.pickedAgentId ?? readLastAgentId()),
  );
  // Per-session model + reasoning effort for the claude-native model picker.
  // "" = unselected: nothing is checked and `model_override` / `reasoning_effort`
  // are omitted from the create, so Claude Code uses its own configured model.
  // An explicit pick rides along and is remembered (seeded back on a later visit
  // via the harness-seed effect below).
  const [pickedModel, _setPickedModel] = useState<string>(() => landingDraft?.pickedModel ?? "");
  const [pickedEffort, setPickedEffort] = useState<string>(() => landingDraft?.pickedEffort ?? "");
  // Per-session cost-control switch ("Cost Optimized" pill). Unset
  // (null) defers to the agent spec's default and is omitted from
  // the create body.
  const [costControlMode, _setCostControlMode] = useState<CostControlMode>(
    () => landingDraft?.costControlMode ?? null,
  );
  // Model selection and smart routing are mutually exclusive: enabling
  // routing clears the explicit model pick, and picking a model turns
  // routing off.
  const setPickedModel = useCallback((model: string) => {
    _setPickedModel(model);
    if (model) _setCostControlMode(null);
  }, []);
  const setCostControlMode = useCallback((mode: CostControlMode) => {
    _setCostControlMode(mode);
    if (mode === "on") _setPickedModel("");
  }, []);
  // Controls the working-directory popover so picking a directory closes it.
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  // Controlled so selecting an existing worktree can close the popover.
  const [worktreePopoverOpen, setWorktreePopoverOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Wake-gate consumer — the SINGLE wake.word sequencer for the landing
  // surface. Both the hook (onWakeWord option) and the detector
  // (onWakeWord below) route here, so the ack + gate-open run exactly once:
  //   1. Pause the VAD (echo-back guard: the mic would pick up "橘宝在呢"
  //      from the speakers and feed it back as user speech).
  //   2. Play the browser-TTS ack and WAIT for it to finish.
  //   3. If the VAD is connected (wake-word mode), open the gate for one
  //      turn (stopWakeWordModeForTurn sets wakeWordAutoResume so the
  //      transport's finally block re-arms the gate) and resume the VAD.
  // Declared before realtimeVoice so the hook can reference it via the
  // stable ref; the closure reads live state through refs only.
  const handleWakeWordRef = useRef<() => void>(() => {});
  handleWakeWordRef.current = () => {
    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      hermesVoice.pauseVad();
    });
    void playReply().then(() => {
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        if (hermesVoice.getState() !== "connected") {
          // VAD not connected — nothing to open (the VAD-only detector
          // means wake.word can't fire in this state, but stay safe).
          hermesVoice.resumeVad();
          return;
        }
        // VAD already connected (wake-word mode) — open the gate for one
        // turn, then resume the VAD so the command utterance is captured.
        hermesVoice.stopWakeWordModeForTurn();
        hermesVoice.resumeVad();
      });
    });
  };

  // Hermes-direct voice session — replaces the old QAA/S2S WebSocket flow
  // with HTTP calls to the Hermes gateway (/v1/audio/transcriptions +
  // /v1/chat/completions + /v1/audio/speech). The paw-mic button toggles
  // this session; userTranscript feeds the composer. onWakeWord defers the
  // wake-gate open to THIS surface's handler (above) so the spoken ack and
  // the gate-open run in one sequence — the hook's inline open would race
  // the ack's echo-back guard (2026-09-02 mic-race fix).
  const realtimeVoice = useRealtimeVoice({ enabled: !creating, onWakeWord: () => handleWakeWordRef.current() });
  // Wake word detection: listens for "橘宝" in the background.
  // When detected, plays TTS auto-reply "橘宝在呢" via browser SpeechSynthesis.
  const { playReply } = useWakeWordReply({ enabled: !creating });
  // Dictation active state — tracked via ComposerMicButton's onListeningChange
  // so the wake word detector can be paused while dictation owns the mic.
  const [dictationActive, setDictationActive] = useState(false);
  // Wake word never self-activates on the landing surface since the hero
  // voice card moved into the unified composer footer (plan 040 P1): the
  // detector stays owned here for the ComposerMicButton fallback path but
  // only runs when a session explicitly re-arms it.
  const wakeWordEnabled =
    !creating && !dictationActive &&
    (realtimeVoice.state !== "connected" || realtimeVoice.isWakeWordOnly);
  // Mic-ownership rule (2026-09-02): the detector is VAD-only — it arms
  // wake-word mode on the ALREADY-CONNECTED VAD and never opens its own
  // mic consumer (no Web Speech, no server dictation). When the VAD is
  // disconnected there is nothing to arm, so `isListening` stays false and
  // the ComposerMicButton's disabled gate never fires. The fallback
  // consumers the detector used to start were the root cause of the
  // "constantly pulling the MIC" bug: the browser's mic-in-use indicator
  // turned on with no visible listening UI.
  const { isListening: wakeWordListening } = useWakeWordDetector({
    enabled: wakeWordEnabled,
    // Route through the SAME sequencer the hook uses — one wake.word
    // consumer, one ack-then-open sequence. mirrorOnly makes the hook's
    // handleEvent the SOLE subscriber: the detector re-subscribing on top
    // made the ack fire twice and undercut the echo-back guard
    // (multi-agent audit findings 1+5, 2026-09-02).
    mirrorOnly: true,
    onWakeWord: () => handleWakeWordRef.current(),
  });
  // When the VAD connects, reset dictationActive — the ComposerMicButton's
  // Hermes state subscription may have set it to true during the connecting
  // phase. The auto-stop effect in ComposerMicButton should handle this,
  // but the Hermes subscription can re-set isListening after auto-stop,
  // leaving dictationActive stuck at true. This reset ensures the paw
  // button's Stop is always clickable when the VAD is connected.
  useEffect(() => {
    if (realtimeVoice.state === "connected") {
      setDictationActive(false);
    }
  }, [realtimeVoice.state, realtimeVoice.isWakeWordOnly]);
  // Feed the realtime user transcript into the composer as it forms.
  // NOTE: `dictation` is intentionally omitted from the dependency array —
  // useDictationInsert returns a new object literal every render, so including
  // it would re-fire this effect on every render and re-insert the transcript
  // after the user presses Backspace to delete it (the "can't delete text" bug).
  // The replaceInterim function is stable (useCallback with [setDraft]).
  useEffect(() => {
    if (realtimeVoice.userTranscript) dictation.replaceInterim(realtimeVoice.userTranscript);
    else if (realtimeVoice.state !== "connected") dictation.replaceInterim("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeVoice.userTranscript, realtimeVoice.state]);
  // Voice task commands auto-create the session on the landing (P3, 2026-09-02):
  // the intent classifier emits voice.command for task-shaped speech ("run X",
  // "open Y") — the in-session composer auto-submits it (SessionComposer), but
  // the landing had NO consumer, so dictated tasks just sat in the textarea.
  // Here the command IS the first prompt: fill the draft and create. Cleared
  // immediately so a second event (or a re-render) can't double-submit.
  const voiceCommandRef = useRef(realtimeVoice.voiceCommand);
  useEffect(() => {
    const cmd = realtimeVoice.voiceCommand;
    if (!cmd || voiceCommandRef.current === cmd) return;
    voiceCommandRef.current = cmd;
    realtimeVoice.clearVoiceCommand();
    setMessage((cur) => (cur.trim() ? cur : cmd));
    textareaRef.current?.focus();
  }, [realtimeVoice, dictation]);
  // Note: do NOT clear the composer on "connecting" — this wipes the
  // text box before the user can speak or type. The replaceInterim("")
  // on disconnect already clears stale text when the session ends.
  // "Connect a host" instructions modal, opened from the host dropdown.
  const [connectOpen, setConnectOpen] = useState(false);
  // Harness "Set up" dialog target, opened from the composer notice or a picker
  // row; null when closed. One dialog serves every entry point.
  const [setupTarget, setSetupTarget] = useState<{
    agentName: string | undefined;
    harness: string | null;
    host: Host | undefined | null;
  } | null>(null);
  // Harness-config modal, opened from the composer's gear icon.
  const [configOpen, setConfigOpen] = useState(false);

  // Mirror the current draft fields into a ref every render so the unmount
  // cleanup below can snapshot the latest values without re-subscribing.
  // `submittedRef` is flipped just before we navigate to a freshly-created
  // session so the snapshot is dropped instead of resurrected.
  const submittedRef = useRef(false);
  const draftRef = useRef<LandingDraft>(null as unknown as LandingDraft);
  draftRef.current = {
    message,
    files,
    pickedAgentId,
    selectedHostId,
    sandboxSelected,
    sandboxRepoUrl,
    sandboxRepoBranch,
    workspace,
    branchName,
    prefilledBranch,
    permissionMode,
    approvalMode,
    bypassSandbox,
    cursorExecMode,
    pickedHarness,
    pickedModel,
    pickedEffort,
    costControlMode,
  };
  useEffect(() => {
    return () => {
      landingDraft = submittedRef.current ? null : draftRef.current;
    };
  }, []);

  const { recent, addRecent } = useRecentWorkspaces(selectedHostId);

  const allHosts = hosts ?? [];
  const onlineHosts = allHosts.filter((h) => h.status === "online");
  const offlineHosts = allHosts.filter((h) => h.status === "offline");

  // Identify the current desktop machine and whether we can connect it. When
  // it's already in the host list (online or offline) we connect via that row;
  // only when it's absent do we show a standalone "Run on this machine" item —
  // so the machine never appears twice.
  const thisMachineHostId = desktopHost?.hostId ?? null;
  const thisMachineInList =
    thisMachineHostId != null && allHosts.some((h) => h.host_id === thisMachineHostId);
  const canConnectThisMachine = Boolean(desktopHost?.cliInstalled);
  const showConnectThisMachine = canConnectThisMachine && !thisMachineInList;

  // Track this machine's host status from the desktop shell (no-op in a browser).
  useEffect(() => {
    if (!isElectronShell()) return;
    let cancelled = false;
    const refresh = () => {
      void getHostIdentity().then((s) => {
        if (!cancelled) setDesktopHost(s);
      });
    };
    refresh();
    const unsubscribe = onHostStatusChanged(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Project prefill: a project-driven visit reuses the project's newest
  // session — its host, source repo, and agent — so the composer is ready
  // to send without re-picking anything.
  const { data: projectNewest, isError: projectNewestFailed } = useNewestProjectSession(
    projectParam !== "" ? projectParam : null,
  );
  // That session may have run in a linked worktree (git_branch set), where
  // its workspace is the worktree dir, not the repo. Listing that path's
  // worktrees returns the whole set, including the `is_main` source repo.
  const needsSourceRepoResolve =
    projectNewest != null &&
    projectNewest.git_branch != null &&
    projectNewest.workspace != null &&
    projectNewest.host_id != null;
  const {
    data: sourceWorktreesData,
    isError: projectSourceWorktreesFailed,
    isPlaceholderData: sourceWorktreesArePlaceholder,
  } = useHostWorktrees(
    needsSourceRepoResolve ? (projectNewest.host_id ?? null) : null,
    needsSourceRepoResolve ? (projectNewest.workspace ?? null) : null,
  );
  // The hook serves the previous query's data as a placeholder while a new
  // fetch is in flight — that would be another repo's worktrees here.
  const projectSourceWorktrees = sourceWorktreesArePlaceholder ? undefined : sourceWorktreesData;
  // State machine driving the project prefill: a location track (host →
  // workspace → branch → settled) plus an independent agent seed. The
  // generic host/workspace defaults below hold off until the location
  // track settles so they can't win the race against the project's values.
  const [prefill, setPrefill] = useState<ProjectPrefillState>(() =>
    initialPrefillState(projectParam),
  );
  // The generic defaults gate on the location track only — the agent seed
  // waits on its own fetch and must not hold up the host/workspace fill.
  const prefillSettled = prefill.phase === "settled";
  // Host whose workspace was already seeded once, so a host re-pick doesn't
  // clobber the field (used by the per-host seeding effect below).
  const seededHostRef = useRef<string | null>(null);
  const singleUserHostSeededRef = useRef(false);
  const singleUserAgentSeededRef = useRef(false);

  // The landing screen stays mounted while `?project=` changes (clicking
  // another project's pencil), so re-create a fresh visit by hand: clear
  // every seedable slot and restart the machine. Values the user set are
  // reset too — a pencil click means "set me up for this project".
  useEffect(() => {
    if (prefill.project === projectParam) return;
    setSandboxSelected(false);
    setSelectedHostId(null);
    setPickedAgentId(projectParam !== "" ? null : readLastAgentId());
    setWorkspace("");
    setBranchName("");
    seededHostRef.current = null;
    singleUserHostSeededRef.current = false;
    singleUserAgentSeededRef.current = false;
    setShowAdvancedSettings(false);
    setPrefill(initialPrefillState(projectParam));
  }, [projectParam, prefill.project]);

  // Auto-select an option so a session can be started without an explicit
  // pick. Prefer the user's last explicit choice (persisted across visits);
  // otherwise fall back to the FIRST AVAILABLE option in menu order — the
  // sandbox when the server supports it (it's pinned first in the picker),
  // else the first online host. Only fills an empty slot; an explicit choice
  // already in state (or restored from the in-memory draft) is never
  // overridden. Holds off while a project prefill is deciding.
  useEffect(() => {
    if (!prefillSettled) return;
    if (isSingleUser) return;
    if (sandboxSelected) return;
    if (selectedHostId !== null) return;

    // Read the persisted pick once, as a mount-time seed — deliberately NOT a
    // dependency: it only matters until the slot is filled, and re-running on
    // its value would fight an explicit in-session selection.
    const lastChoice = readLastHostChoice();
    if (lastChoice === SANDBOX_HOST_CHOICE) {
      // Wait for the server-info probe before acting on a sandbox pick: until
      // it resolves we don't know whether the sandbox is offered, and falling
      // through to a connected host would strand the returning sandbox user
      // (this effect wouldn't re-run to correct it once a host is set).
      if (info === "loading") return;
      if (managedSandboxesEnabled) {
        setSandboxSelected(true);
        return;
      }
      // Sandbox no longer offered (e.g. an OSS server) — fall through.
    } else if (lastChoice) {
      // A persisted host pick can only be honored once the host list has
      // loaded and shows it online. Wait for the load rather than defaulting
      // past it — defaulting to the sandbox here would set sandboxSelected and
      // this effect would then never re-run to restore the host.
      if (hostsLoading) return;
      const stored = (hosts ?? []).find((h) => h.host_id === lastChoice && h.status === "online");
      if (stored) {
        setSelectedHostId(stored.host_id);
        return;
      }
      // Stored host is gone or offline — fall through to the default.
    }

    if (managedSandboxesEnabled) {
      setSandboxSelected(true);
      return;
    }
    const firstOnline = (hosts ?? []).find((h) => h.status === "online");
    if (firstOnline) setSelectedHostId(firstOnline.host_id);
  }, [
    hosts,
    hostsLoading,
    selectedHostId,
    sandboxSelected,
    managedSandboxesEnabled,
    info,
    prefillSettled,
    isSingleUser,
  ]);

  const preferredSingleUserHostId = useMemo(() => {
    if (
      thisMachineHostId != null &&
      onlineHosts.some((host) => host.host_id === thisMachineHostId)
    ) {
      return thisMachineHostId;
    }
    return onlineHosts[0]?.host_id ?? null;
  }, [onlineHosts, thisMachineHostId]);

  useEffect(() => {
    if (!isSingleUser) {
      singleUserHostSeededRef.current = false;
      return;
    }
    if (!prefillSettled || singleUserHostSeededRef.current) return;
    if (preferredSingleUserHostId == null) return;

    if (sandboxSelected) setSandboxSelected(false);
    if (selectedHostId !== preferredSingleUserHostId) {
      if (projectParam === "") {
        seededHostRef.current = null;
        setWorkspace("");
      }
      setSelectedHostId(preferredSingleUserHostId);
    }
    singleUserHostSeededRef.current = true;
  }, [
    isSingleUser,
    prefillSettled,
    preferredSingleUserHostId,
    projectParam,
    sandboxSelected,
    selectedHostId,
  ]);

  useEffect(() => {
    if (!isSingleUser) {
      singleUserAgentSeededRef.current = false;
      return;
    }
    if (singleUserAgentSeededRef.current) return;
    if (preferredSingleUserAgentId == null) return;

    if (pickedAgentId !== preferredSingleUserAgentId) {
      setPickedAgentId(preferredSingleUserAgentId);
      setPickedHarness(null);
    }
    singleUserAgentSeededRef.current = true;
  }, [isSingleUser, pickedAgentId, preferredSingleUserAgentId]);

  // Fall back to the host's home directory when it has no recorded recents, so
  // the working-directory field is pre-filled and the user can send in one
  // click. Derived from the same home listing the picker uses (entries carry
  // absolute paths); only fetched when there's no recent to fall back to.
  // Single-user mode always fetches it: the dedicated-workspace fallback
  // joins the workspace folder onto the native home path.
  const needsHomeFallback = selectedHostId !== null && (isSingleUser || recent.length === 0);
  const { data: homeListing, isPlaceholderData: homeListingIsPlaceholder } = useHostFilesystem(
    selectedHostId,
    needsHomeFallback ? "" : null,
  );
  // The hook serves the PREVIOUS query's data as a placeholder while a new
  // fetch is in flight (an anti-flicker nicety for the picker), so right
  // after a host switch the listing briefly belongs to the old host.
  // Deriving home from it would seed the old host's path and lock the
  // once-per-host guard below — treat placeholder data as not-yet-loaded.
  const derivedHome = useMemo(
    () => (homeListingIsPlaceholder ? null : deriveHomeDir(homeListing?.entries ?? [])),
    [homeListing, homeListingIsPlaceholder],
  );

  // Seed the working directory once per host, into an empty field only, so an
  // explicit pick isn't clobbered. Prefer the most-recent path; else the
  // derived home (which can arrive a render later, hence the dep). Holds
  // off while a project prefill is deciding on a workspace of its own.
  // Single-user mode skips this: the dedicated-workspace effect below owns
  // seeding there (a stable project folder, not a stale recent or home).
  useEffect(() => {
    if (!prefillSettled) return;
    if (isSingleUser) return;
    if (selectedHostId === null) return;
    if (seededHostRef.current === selectedHostId) return;
    const candidate = recent[0] ?? derivedHome;
    if (!candidate) return;
    seededHostRef.current = selectedHostId;
    setWorkspace((cur) => (cur === "" ? candidate : cur));
  }, [selectedHostId, recent, derivedHome, prefillSettled, isSingleUser]);

  // Dedicated single-user workspace: the server publishes
  // ``~/agent-meow-workspace`` (``default_workspace``). Provision it on the
  // local host — the create-dir RPC is idempotent in effect (an existing
  // folder 409s and we fall back to the home-derived absolute path) — then
  // seed the workspace field from the real native path, so a desktop-installed
  // app always starts in a real project folder instead of the home dir or a
  // Windows drive root.
  const singleUserWorkspaceName = defaultWorkspace ? basenameOfPath(defaultWorkspace) : null;
  useEffect(() => {
    if (!isSingleUser || !prefillSettled) return;
    if (defaultWorkspace == null || singleUserWorkspaceName == null) return;
    if (preferredSingleUserHostId == null) return;
    if (workspace !== "") return; // an explicit pick wins
    let cancelled = false;
    void (async () => {
      try {
        const created = await createHostDirectory(preferredSingleUserHostId, defaultWorkspace);
        if (!cancelled) setWorkspace((cur) => (cur === "" ? created : cur));
      } catch {
        // Folder already exists (or transient error): join it onto the
        // derived home for an absolute native path. Without a home yet,
        // leave the field empty and retry when the home listing lands.
        if (derivedHome == null) return;
        const fallback = joinPathSegments(derivedHome, singleUserWorkspaceName);
        if (!cancelled) setWorkspace((cur) => (cur === "" ? fallback : cur));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isSingleUser,
    prefillSettled,
    defaultWorkspace,
    singleUserWorkspaceName,
    preferredSingleUserHostId,
    derivedHome,
    workspace,
  ]);

  // A pick only wins while it exists in the list — a persisted id whose
  // agent has since been unregistered (or hidden) falls back to the default.
  // The pending custom agent sentinel also wins when set.
  // A pending (just-created, not-yet-submitted) custom agent can't run on a
  // managed sandbox — the sandbox create path doesn't provision a runner for a
  // bundled agent. So a pending pick made before switching to a sandbox is
  // dropped there, falling back to a real agent; off the sandbox it's kept.
  const pendingAgentAllowedOnTarget = !sandboxSelected;
  const effectiveAgentId =
    pickedAgentId === PENDING_AGENT_ID && pendingAgentAllowedOnTarget
      ? PENDING_AGENT_ID
      : ((agentList.some((a) => a.id === pickedAgentId) ? pickedAgentId : agentList[0]?.id) ??
        null);
  const selectedAgent = useMemo(
    () =>
      effectiveAgentId === PENDING_AGENT_ID && pendingAgent
        ? ({
            id: PENDING_AGENT_ID,
            name: pendingAgent.name,
            display_name: pendingAgent.name,
            description: pendingAgent.description ?? null,
            harness: pendingAgent.harness ?? null,
            skills: [],
          } satisfies AvailableAgent)
        : agentList.find((a) => a.id === effectiveAgentId),
    [agentList, effectiveAgentId, pendingAgent],
  );
  const supportsPermissionMode = nativeAgentHasCapability(selectedAgent, "permissionMode");
  const supportsApprovalMode = nativeAgentHasCapability(selectedAgent, "approvalMode");
  const supportsCursorMode = nativeAgentHasCapability(selectedAgent, "cursorMode");
  const hideUnconfiguredHarnesses = useMemo(() => readHideUnconfiguredHarnesses(), []);
  // Smart routing is offered in the config modal — as a Model choice for Claude,
  // a standalone toggle otherwise — when the server enables it and the selected
  // harness is routable. Use the EFFECTIVE harness (a bundle agent's brain-
  // harness override wins over its spec harness), so overriding Polly/Debby to a
  // non-routable harness (e.g. Cursor) correctly drops routing eligibility.
  const effectiveHarness = pickedHarness ?? selectedAgent?.harness ?? "";
  const smartRoutingEligible = smartRoutingEnabled && _ROUTABLE_HARNESSES.has(effectiveHarness);
  // Whether the gear config modal has anything to show for the selected agent
  // (drives the gear icon's visibility). Bundle agents with an overridable
  // brain harness qualify, as does any routing-eligible agent — Smart Routing
  // lives only in the modal now, so an agent with just that (e.g. Pi) still
  // needs the gear.
  const selectedAgentHasKnobs =
    supportsPermissionMode ||
    supportsApprovalMode ||
    supportsCursorMode ||
    smartRoutingEligible ||
    (selectedAgent?.harness != null && selectedAgent.harness in brainHarnessLabels);
  // Label/value pairs summarizing the selected agent's current run-config, for
  // the gear icon's hover tooltip. Mirrors the modal's per-capability rows so a
  // user can read the active settings without opening it. "Default" = an unset
  // model/effort (Claude Code uses its own configured default).
  // Gate on eligibility so a stale "on" (server flag off, or a non-routable
  // agent) never shows misleading Smart Routing rows in the tooltip.
  const routingOn = smartRoutingEligible && costControlMode === "on";
  const configSummary = useMemo((): { label: string; value: string }[] => {
    if (supportsPermissionMode) {
      const modelValue = routingOn
        ? "Smart Routing"
        : (CLAUDE_NATIVE_MODELS.find((m) => m.id === pickedModel)?.label ?? "Default");
      // Smart Routing freezes effort to the default (the router picks per turn),
      // so mirror the modal: show "Default" whenever routing is on or effort is
      // unset, else the picked level.
      const effortValue =
        routingOn || !pickedEffort
          ? "Default"
          : (CLAUDE_NATIVE_EFFORTS.find((e) => e.value === pickedEffort)?.label ?? "Default");
      const permissionValue =
        CLAUDE_NATIVE_PERMISSION_MODES.find((m) => m.value === permissionMode)?.label ??
        permissionMode;
      return [
        { label: "Model", value: modelValue },
        { label: "Effort", value: effortValue },
        { label: "Permissions", value: permissionValue },
      ];
    }
    // Non-Claude routable agents surface Smart Routing as a standalone toggle,
    // so reflect it here when on (Claude folds it into Model above).
    const routingRow: { label: string; value: string }[] =
      smartRoutingEligible && routingOn ? [{ label: "Smart Routing", value: "On" }] : [];
    if (supportsApprovalMode) {
      const isCodex = nativeCodingAgentForAvailableAgent(selectedAgent)?.harness === "codex-native";
      // Bypass is the most-permissive Approval choice, not a separate knob — so
      // mirror the modal's single Approval control: when armed, the Approval row
      // reads "Bypass approvals & sandbox" rather than the underlying preset
      // (which would misleadingly imply approvals are still at e.g. "Default").
      const approvalValue =
        isCodex && bypassSandbox
          ? CODEX_NATIVE_BYPASS_APPROVAL_OPTION.label
          : (CODEX_NATIVE_APPROVAL_MODES.find((m) => m.value === approvalMode)?.label ??
            approvalMode);
      return [{ label: "Approval", value: approvalValue }, ...routingRow];
    }
    if (supportsCursorMode) {
      const modeValue =
        CURSOR_NATIVE_EXEC_MODES.find((m) => m.value === cursorExecMode)?.label ?? cursorExecMode;
      return [{ label: "Mode", value: modeValue }, ...routingRow];
    }
    if (selectedAgent?.harness != null && selectedAgent.harness in brainHarnessLabels) {
      const active = pickedHarness ?? selectedAgent.harness;
      return [
        { label: "Agent Harness", value: brainHarnessLabels[active] ?? active },
        ...routingRow,
      ];
    }
    return routingRow;
  }, [
    supportsPermissionMode,
    supportsApprovalMode,
    supportsCursorMode,
    smartRoutingEligible,
    selectedAgent,
    brainHarnessLabels,
    routingOn,
    pickedModel,
    pickedEffort,
    permissionMode,
    approvalMode,
    bypassSandbox,
    cursorExecMode,
    pickedHarness,
  ]);
  // Reset per-agent-instance run-config that must not carry across an agent
  // change. The DANGEROUS Codex bypass re-opts-in per context (matching the
  // store's fork / agent-switch behavior; CODEX_NATIVE_BYPASS_SANDBOX_LABEL_KEY
  // is instance-scoped). Smart routing likewise clears: switching to an agent
  // whose modal has no routing control (or isn't routable) would otherwise
  // leave it stuck "on" with no UI to turn it off.
  //
  // Only reset on an ACTUAL agent change — not the initial resolution (null →
  // first id, or a persisted/draft pick resolving on mount), which would wipe a
  // costControlMode/bypass restored from the landing draft.
  const prevAgentIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const prev = prevAgentIdRef.current;
    prevAgentIdRef.current = effectiveAgentId;
    if (prev === undefined || prev === effectiveAgentId) return;
    setBypassSandbox(false);
    setCostControlMode(null);
  }, [effectiveAgentId, setCostControlMode]);
  // The selected native harness, used to persist/seed its option knobs (mode /
  // model / effort), which are harness-specific. null for non-native agents,
  // which have no knobs to remember.
  const selectedNativeHarness = nativeCodingAgentForAvailableAgent(selectedAgent)?.harness ?? null;
  // Seed the harness's knobs from the user's last picks when the selected
  // harness changes (including the first mount), so a returning user starts a
  // new session on the options they used last for that harness instead of the
  // default. Keyed on the harness so an in-session edit isn't clobbered on
  // re-render — only a harness switch reseeds.
  useEffect(() => {
    if (!selectedNativeHarness) return;
    const stored = readHarnessOptions(selectedNativeHarness);
    // Resolve the mode to the stored value when it's still valid for this
    // harness, else the harness default. The else branch must RESET (not
    // early-return) because codex-native and opencode-native share the single
    // approvalMode state: returning early would leave the previously-selected
    // harness's mode in place — e.g. codex's "full-access" carried onto
    // OpenCode — and flow into the launch args unchanged. A stale value not in
    // the current list resolves to the default for the same reason.
    const resolve = (modes: readonly { value: string }[], dflt: string) =>
      stored.mode != null && modes.some((m) => m.value === stored.mode) ? stored.mode : dflt;
    if (supportsPermissionMode) {
      setPermissionMode(
        resolve(CLAUDE_NATIVE_PERMISSION_MODES, CLAUDE_NATIVE_DEFAULT_PERMISSION_MODE),
      );
      // The model + effort picker remembers its own last pick (same per-harness
      // snapshot the mode knob uses), validated against the current vocab. With
      // nothing stored (or a retired id) it resolves to "" — unselected, so the
      // create omits the override and Claude Code uses its own configured model.
      setPickedModel(
        stored.model != null && CLAUDE_NATIVE_MODELS.some((m) => m.id === stored.model)
          ? stored.model
          : "",
      );
      setPickedEffort(
        stored.effort != null && CLAUDE_NATIVE_EFFORTS.some((e) => e.value === stored.effort)
          ? stored.effort
          : "",
      );
    } else if (supportsApprovalMode) {
      setApprovalMode(resolve(CODEX_NATIVE_APPROVAL_MODES, CODEX_NATIVE_DEFAULT_APPROVAL_MODE));
    } else if (supportsCursorMode) {
      setCursorExecMode(resolve(CURSOR_NATIVE_EXEC_MODES, CURSOR_NATIVE_DEFAULT_EXEC_MODE));
    }
    // Reseed only on harness change; capability flags are derived from the
    // same harness so they don't need to be deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNativeHarness]);
  // Native-terminal agents interpret slash commands inside their own CLI
  // (the runner injects the text verbatim), so the landing composer must
  // not intercept them — no skills menu, no slash_command routing.
  const isNativeTerminalAgent = isNativeCodingAgent(selectedAgent);
  const selectedHost = allHosts.find((h) => h.host_id === selectedHostId);
  // Warn-only readiness signal for the agent picker: only meaningful when
  // a connected host is selected (a sandbox provisions its own tooling).
  // Selection stays allowed — the host re-checks at launch and the create
  // call surfaces a specific error if the harness really can't run.
  const harnessWarningHost = !sandboxSelected ? selectedHost : undefined;
  const selectedAgentUnconfigured = harnessUnconfiguredOnHost(
    selectedAgent?.harness,
    harnessWarningHost,
  );
  const workspaceTrimmed = workspace.trim();
  const workspaceValid = isValidWorkspace(workspace);
  const isCloudHost =
    sandboxSelected || (selectedHost?.name?.toLowerCase().includes("cloud") ?? false);

  // Sessions on the selected host that have a workspace — the narrow set
  // the health poll needs to check for live directory conflicts. Much
  // smaller than all 200 directorySessions (only host-matched + workspace
  // rows), so registering them into the /health poll is cheap.
  const conflictCandidates = useMemo(
    () =>
      (directorySessions ?? []).filter((s) => s.host_id === selectedHostId && s.workspace != null),
    [directorySessions, selectedHostId],
  );
  const runnerHealth = useRunnerHealthRegistration(conflictCandidates);
  // Count of live agents per normalized directory on this host. The file
  // browser uses this to warn when you navigate into an occupied directory.
  const occupancyByDir = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of conflictCandidates) {
      if (s.workspace == null || runnerHealth.get(s.id) !== true) continue;
      const dir = normalizeWorkspacePath(s.workspace);
      if (dir === null) continue;
      counts.set(dir, (counts.get(dir) ?? 0) + 1);
    }
    return counts;
  }, [conflictCandidates, runnerHealth]);

  // Existing git worktrees of the picked directory's repo, for the
  // worktree picker. Skipped for sandbox sessions (server-managed) and
  // when no directory is picked. A non-git path resolves to [].
  const worktreesEnabled = !sandboxSelected && selectedHostId !== null && workspaceTrimmed !== "";
  const {
    data: hostWorktrees,
    isPlaceholderData: hostWorktreesArePlaceholder,
    isError: hostWorktreesFailed,
  } = useHostWorktrees(
    worktreesEnabled ? selectedHostId : null,
    worktreesEnabled ? workspaceTrimmed : null,
  );
  // Linked worktrees (exclude the main work tree — "starting in the main
  // repo" is just picking that directory, not selecting a worktree).
  const linkedWorktrees = useMemo(
    () => (hostWorktrees ?? []).filter((w) => !w.is_main),
    [hostWorktrees],
  );
  // The worktree the picked directory currently points at, if any. Set when
  // the user navigated the picker straight into a worktree folder, or clicked
  // one in the list below.
  const activeWorktree = useMemo(() => {
    const target = normalizeWorkspacePath(workspaceTrimmed);
    if (target === null) return null;
    return linkedWorktrees.find((w) => normalizeWorkspacePath(w.path) === target) ?? null;
  }, [linkedWorktrees, workspaceTrimmed]);
  // When the workspace lands on an existing worktree, prefill the branch
  // field with its branch and remember it as the prefill. Leaving the
  // worktree clears the prefill (but not a name the user typed themselves).
  useEffect(() => {
    const branch = activeWorktree?.branch ?? "";
    if (branch !== "") {
      setPrefilledBranch(branch);
      setBranchName(branch);
    } else {
      setPrefilledBranch((prev) => {
        // Only clear the field if it still holds the previous prefill —
        // don't wipe a branch name the user typed for a new worktree.
        setBranchName((cur) => (cur === prev ? "" : cur));
        return "";
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorktree?.path]);
  // True when the session should start directly in the existing worktree:
  // the workspace is a worktree and the branch field still holds its
  // prefilled branch (the user hasn't edited it to request a new worktree).
  const startInExistingWorktree =
    activeWorktree !== null && prefilledBranch !== "" && branchName.trim() === prefilledBranch;
  // A new, isolated worktree is created only when a branch is named and the
  // workspace isn't already sitting on that existing worktree.
  const shouldCreateWorktree = branchName.trim() !== "" && !startInExistingWorktree;
  // Auto-fill the base branch from the configured default (Settings › Git) when
  // a new-worktree branch is named, but only until the user touches the base
  // field — then their choice (including a cleared field) stands. Clearing the
  // branch name (so the base field goes away) re-arms the auto-fill, so naming
  // a branch again starts fresh from the current default.
  useEffect(() => {
    if (!shouldCreateWorktree) {
      // No base field shown: reset so the next named branch re-seeds cleanly.
      setBaseBranchEdited(false);
      _setBaseBranch("");
      return;
    }
    if (!baseBranchEdited) {
      _setBaseBranch(readDefaultBaseBranch() ?? "");
    }
  }, [shouldCreateWorktree, baseBranchEdited]);
  // The branch input doubles as a combobox: focusing it reveals existing
  // worktrees, and what the user types filters them (match on branch or path
  // substring, case-insensitive). Typing a name that matches none = a new
  // worktree; picking a match = start in that existing worktree.
  const [branchInputFocused, setBranchInputFocused] = useState(false);
  const filteredWorktrees = useMemo(() => {
    const q = branchName.trim().toLowerCase();
    if (q === "") return linkedWorktrees;
    return linkedWorktrees.filter(
      (w) => (w.branch ?? "").toLowerCase().includes(q) || w.path.toLowerCase().includes(q),
    );
  }, [linkedWorktrees, branchName]);
  // Fill the branch field with a unique auto-generated name so the user can
  // spin up a throwaway worktree without inventing one. crypto.randomUUID is
  // available in every browser the app targets; the short prefix keeps the
  // dir/branch readable (worktree-1a2b3c4d).
  const generateBranchName = useCallback(() => {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    setBranchName(`worktree-${suffix}`);
  }, []);
  // Project prefill: advance the machine one step per render as its data
  // arrives. It steps rather than loops in one pass because the "branch"
  // phase needs `hostWorktrees` for the workspace the "workspace" phase
  // just wrote, and that listing only reflects the seeded repo one render
  // after the write applies.
  useEffect(() => {
    if (prefill.project !== projectParam || prefillDone(prefill)) return;
    const step = projectPrefillStep(prefill, {
      newest: projectNewest,
      newestFailed: projectNewestFailed,
      hosts,
      // The pickable list, not the raw one — a hidden agent's id would seed
      // a pick that effectiveAgentId rejects. Raw undefined = still loading.
      agents: agents === undefined ? undefined : agentList,
      sandboxSelected,
      selectedHostId,
      lastAgentId: readLastAgentId(),
      sourceWorktrees: projectSourceWorktrees,
      sourceWorktreesFailed: projectSourceWorktreesFailed,
      workspaceTrimmed,
      branchName,
      prefilledBranch,
      hostWorktrees: hostWorktreesArePlaceholder ? undefined : hostWorktrees,
      hostWorktreesFailed,
    });
    if (step === null) return;
    const { writes } = step;
    if (writes.hostId !== undefined) setSelectedHostId((cur) => cur ?? writes.hostId!);
    if (writes.agentId !== undefined) {
      setPickedAgentId((cur) => cur ?? writes.agentId!);
      if (pickedAgentId === null) setPickedHarness(readLastHarness(writes.agentId));
    }
    if (writes.workspace !== undefined) {
      setWorkspace((cur) => (cur === "" ? writes.workspace! : cur));
    }
    if (writes.branch !== undefined && prefilledBranch === "") {
      // Functional fill-empty-only, like the other slots: a branch typed
      // between the qualifying render and this effect must not be clobbered.
      setBranchName((cur) => (cur === "" ? writes.branch! : cur));
    }
    setPrefill(step.state);
  }, [
    prefill,
    projectParam,
    projectNewest,
    projectNewestFailed,
    hosts,
    agents,
    agentList,
    sandboxSelected,
    selectedHostId,
    projectSourceWorktrees,
    projectSourceWorktreesFailed,
    workspaceTrimmed,
    branchName,
    prefilledBranch,
    hostWorktrees,
    hostWorktreesArePlaceholder,
    hostWorktreesFailed,
    pickedAgentId,
  ]);

  // Sandbox repo inputs are valid when blank (empty workspace), or when
  // the URL passes the shape check; a branch without a URL is dangling.
  const sandboxRepoValid =
    sandboxRepoUrl.trim() === ""
      ? sandboxRepoBranch.trim() === ""
      : isValidSandboxRepoUrl(sandboxRepoUrl);

  // Sandbox creates need no host or path workspace — the server
  // provisions both; only the message, agent, and (optional) repo
  // inputs gate the submit.
  // Slash-command suggestions for the chosen agent's bundled skills.
  // Mirrors the in-session composer's menu mechanics (open while the
  // command name is still being typed: leading "/", no second "/", no
  // space yet), but lists skills only — built-ins like /model need a
  // live session. Hidden for native-terminal agents (their CLI owns
  // slash commands) and for agents without bundled skills.
  const [slashMenuIndex, setSlashMenuIndex] = useState(-1);
  const skillCommands = useMemo(() => {
    if (isNativeTerminalAgent) return {};
    const m: Record<string, string> = {};
    for (const s of selectedAgent?.skills ?? []) m[`/${s.name}`] = s.description;
    return m;
  }, [selectedAgent, isNativeTerminalAgent]);
  const trimmedMessage = message.trimStart();
  const slashMenuOpen =
    trimmedMessage.startsWith("/") &&
    !trimmedMessage.slice(1).includes("/") &&
    !trimmedMessage.includes(" ");
  const slashMenuQuery = slashMenuOpen ? trimmedMessage.slice(1) : "";
  // Kept in sync with what SlashCommandMenu renders so keyboard nav
  // indexes into the same list.
  const slashMenuMatches = slashMenuOpen
    ? rankedSlashCommandNames(skillCommands, slashMenuQuery)
    : [];
  // Pre-select the first match whenever the filtered list changes, so
  // Tab/Enter complete the top item without arrowing down first (same
  // reset pattern as the in-session composer).
  const prevSlashMatchesRef = useRef<string[]>([]);
  if (
    slashMenuMatches.length !== prevSlashMatchesRef.current.length ||
    slashMenuMatches.some((m, i) => m !== prevSlashMatchesRef.current[i])
  ) {
    prevSlashMatchesRef.current = slashMenuMatches;
    setSlashMenuIndex(slashMenuMatches.length > 0 ? 0 : -1);
  }

  // Selecting a skill fills "/name " and leaves the caret ready for the
  // argument — skills never auto-execute from the menu.
  function applySlashSelection(cmd: string) {
    setSlashMenuIndex(-1);
    setMessage(cmd + " ");
    textareaRef.current?.focus();
  }

  // Always-visible skill pills for the allowlisted orchestrators, fed by
  // the same bundled-skills list as the "/" menu.
  const pillSkills =
    selectedAgent && SKILL_PILL_AGENTS.has(selectedAgent.name) ? selectedAgent.skills : [];

  // Pills only render over an empty draft, so there's never args to preserve.
  function applySkillPill(name: string) {
    setMessage(`/${name} `);
    textareaRef.current?.focus();
  }

  // Starter prompts — the sample-prompt layer from the workspace design
  // (mascot + greeting + hint chips under the empty composer). Rendered
  // for EVERY agent over an empty draft; clicking fills the composer so
  // the user can edit before sending. The skill pills (above) layer on
  // top for agents that bundle skills. Hidden once the user types — the
  // same gating as the pills overlay.
  const STARTER_PROMPTS: ReadonlyArray<{ label: string; prompt: string }> = [
    {
      prompt: t("newChat.starterPromptExplore"),
      label: t("newChat.starterPromptExploreLabel"),
    },
    {
      prompt: t("newChat.starterPromptBuild"),
      label: t("newChat.starterPromptBuildLabel"),
    },
    {
      prompt: t("newChat.starterPromptExplain"),
      label: t("newChat.starterPromptExplainLabel"),
    },
  ];

  // ── "@"-file-mention browser (parity with the in-session composer) ────────
  // Only for native terminal agents on a real local host with an absolute
  // workspace. No session/runner exists yet, so the listing comes from the
  // host filesystem endpoint (absolute paths) rather than the session-scoped
  // workspace API; each tagged path is delivered as an "[Attached: …]" marker
  // prepended to the first message, which the runner reads from that workspace.
  const [mention, setMention] = useState<MentionState | null>(null);
  const mentionEnabled =
    isNativeTerminalAgent && !sandboxSelected && !!selectedHostId && workspaceValid;
  const { dir: mentionDir, filter: mentionFilter } = parseMentionToken(mention?.query ?? "");
  const workspaceRoot = workspaceTrimmed.replace(/\/+$/, "");
  // Absolute dir to list = workspace root + the drilled sub-path.
  const mentionAbsDir =
    mentionEnabled && mention
      ? mentionDir
        ? `${workspaceRoot}/${mentionDir}`
        : workspaceRoot
      : null;
  const mentionFsQuery = useHostFilesystem(
    mentionEnabled && mention ? selectedHostId : null,
    mentionAbsDir,
  );
  // Map host entries (absolute paths) to workspace-relative WorkspaceFile rows,
  // then rank (folders-first, filtered, capped) via the shared helper.
  const mentionEntries: WorkspaceFile[] = useMemo(() => {
    if (!mentionEnabled || !mention) return [];
    // ``useHostFilesystem`` keeps the previous directory's rows as placeholder
    // data (no flicker on navigate). When the user drills into a folder a new
    // fetch starts but ``data`` still holds the *parent's* entries — ``isLoading``
    // is false, only ``isPlaceholderData`` is true. Returning those stale rows
    // here would show the parent's files while purporting to be inside the
    // child, so a click/Enter could attach the wrong entry. Suppress them until
    // the current directory's own listing arrives.
    if (mentionFsQuery.isPlaceholderData) return [];
    const rows = (mentionFsQuery.data?.entries ?? [])
      .filter((e) => e.type === "directory" || e.type === "file")
      .map(
        (e): WorkspaceFile => ({
          path: e.path.startsWith(workspaceRoot)
            ? e.path.slice(workspaceRoot.length).replace(/^\/+/, "")
            : e.name,
          name: e.name,
          type: e.type === "directory" ? "directory" : "file",
          bytes: e.bytes,
          modified_at: e.modified_at,
        }),
      );
    return rankMentionEntries(rows, mentionFilter);
  }, [
    mentionEnabled,
    mention,
    mentionFsQuery.data,
    mentionFsQuery.isPlaceholderData,
    mentionFilter,
    workspaceRoot,
  ]);
  const mentionOpen = mentionEntries.length > 0;
  // Closed-but-loading window: don't let Enter send the half-typed "@dir/".
  // ``isPlaceholderData`` covers the drill-down window where react-query is
  // still serving the previous directory's rows (``isLoading`` stays false).
  const mentionListingPending =
    mentionEnabled &&
    mention != null &&
    (mentionFsQuery.isLoading || mentionFsQuery.isPlaceholderData);

  // Shared selection/chip/keyboard glue — see useMentionBrowser. Only the
  // host-filesystem source + token state above are launcher-specific.
  const {
    mentionIndex,
    mentionedItems,
    attachMention,
    openMentionDir,
    removeMentionedItem,
    handleKeyDown: handleMentionKeyDown,
    dismiss: dismissMention,
  } = useMentionBrowser({
    mention,
    setMention,
    mentionEntries,
    text: message,
    setText: setMessage,
    textareaRef,
  });

  const canSubmit =
    message.trim().length > 0 &&
    selectedAgent != null &&
    (sandboxSelected ? sandboxRepoValid : !!selectedHostId && workspaceValid) &&
    !creating;

  // Why submit is disabled, surfaced as the button's tooltip. Checked in the
  // order a user fills the form — location first, then message — so the
  // tooltip always names the next missing input. Null when nothing is
  // actionable (submitting, or mid-create).
  const submitDisabledReason = canSubmit
    ? null
    : sandboxSelected && !sandboxRepoValid
      ? t("newChat.enterValidRepoUrl")
      : !sandboxSelected && (!selectedHostId || !workspaceValid)
        ? isSingleUser
          ? t("newChat.preparingLocalWorkspace")
          : t("newChat.chooseHostAndDirectory")
        : message.trim().length === 0
          ? t("newChat.enterMessageToStart")
          : null;

  // Chip display labels. basenameOfPath handles both POSIX and Windows
  // separators so a "C:\Users\me\agent-meow-workspace" chip reads the
  // folder name, not the whole path.
  const workspaceLabel = workspaceTrimmed
    ? basenameOfPath(workspaceTrimmed)
    : t("newChat.workingDirectory");
  const hostLabel = connectingThisMachine
    ? t("newChat.connecting")
    : sandboxSelected
      ? sandboxLabel
      : (selectedHost?.name ??
        (onlineHosts.length === 0 ? t("newChat.noHosts") : t("newChat.selectHost")));
  // The chip shows just the branch (the "(existing)" distinction lives in the
  // popover's warning; appending it here only gets clipped by the chip's cap).
  const worktreeLabel = branchName.trim() || t("newChat.noWorktree");
  // Sandbox repository chip label: repo name (server's clone-dir rule)
  // plus the pinned branch, e.g. "repo#main"; placeholder when unset.
  const sandboxRepoName = deriveRepoName(sandboxRepoUrl);
  const sandboxRepoLabel = sandboxRepoName
    ? sandboxRepoBranch.trim()
      ? `${sandboxRepoName}#${sandboxRepoBranch.trim()}`
      : sandboxRepoName
    : "Repository";
  // The trigger label is just the agent name; the run-config knobs live in
  // the picker's per-entry submenu, so duplicating their values here would be
  // redundant.
  const agentLabel = selectedAgent ? selectedAgent.display_name : "Select agent";
  const showSelectorTray = !isSingleUser || showAdvancedSettings;

  // Wrap the harness setter so every explicit pick is persisted to
  // localStorage. The caller can pass an explicit `agentId` for the
  // switch-via-submenu path where `effectiveAgentId` still reflects the
  // previously selected agent (the state update from `onSelectAgent` hasn't
  // applied yet).
  const handleSetPickedHarness = useCallback(
    (harness: string | null, agentId?: string) => {
      setPickedHarness(harness);
      writeLastHarness(agentId ?? effectiveAgentId, harness);
      // Light up the routing icon when "Auto" is picked; turn it off otherwise.
      _setCostControlMode(harness === AUTO_HARNESS_ID ? "on" : null);
    },
    [effectiveAgentId],
  );

  // Select an agent/harness from the picker. Switching agents seeds the
  // harness override from the user's last pick for that agent (so a
  // returning user lands on the harness they used last); explicit picks
  // persist via localStorage.
  const handleSelectAgent = (agent: AvailableAgent) => {
    if (agent.id !== effectiveAgentId) setPickedHarness(readLastHarness(agent.id));
    setPickedAgentId(agent.id);
    writeLastAgentId(agent.id);
  };
  const handleSelectPending = () => {
    setPickedAgentId(PENDING_AGENT_ID);
    setPickedHarness(null);
  };

  function selectHost(hostId: string) {
    // Persist the explicit pick even when it matches the current selection, so
    // clicking the auto-selected host still records it as the sticky default
    // for the next visit.
    writeLastHostChoice(hostId);
    // Re-selecting the current host is a no-op. Clearing the workspace here
    // would empty the field for good: the seeding effect's deps (host id,
    // recents, derived home) are all unchanged on a same-host pick, so it
    // never re-runs to fill the field back in — and a host the user already
    // has selected (e.g. the auto-picked first online host) is exactly the
    // one they're most likely to click in the menu.
    if (hostId === selectedHostId) return;
    setSandboxSelected(false);
    setSelectedHostId(hostId);
    // Workspace is host-specific — clear it and let the seeding effect run for
    // the new host.
    setWorkspace("");
    seededHostRef.current = null;
  }

  function selectSandbox() {
    // Persist the explicit sandbox pick (as the reserved sentinel) even when
    // it's already selected, mirroring selectHost — so the sandbox becomes the
    // sticky default for the next visit.
    writeLastHostChoice(SANDBOX_HOST_CHOICE);
    if (sandboxSelected) return;
    // Mirror selectHost: a managed session's host and workspace are both
    // server-chosen, so clear any prior host pick and its workspace.
    setSandboxSelected(true);
    setSelectedHostId(null);
    setWorkspace("");
    seededHostRef.current = null;
  }

  // Connect THIS desktop machine as a host for the current server, then select
  // it — so the user doesn't have to run `omni host` in a terminal first. The
  // bridge's controlHost resolves once the host is connected; we then read its
  // id, refresh the host list, and pick it.
  async function connectThisMachine() {
    if (connectingThisMachine) return;
    setConnectingThisMachine(true);
    try {
      const res = await controlHost("start");
      if (!res.ok) return;
      const identity = await getHostIdentity();
      setDesktopHost(identity);
      await queryClient.invalidateQueries({ queryKey: ["hosts"] });
      if (identity?.hostId) selectHost(identity.hostId);
    } finally {
      setConnectingThisMachine(false);
    }
  }

  // Create a session for a workspace surface card (Docs / Images / Videos).
  // Mirrors handleCreate's session-creation POST but skips the message
  // requirement — the surface panel is the destination, not a chat turn.
  // Navigates to /c/<id>?surface=<name> so AppShell opens the matching rail
  // tab. Reuses the same host/workspace/agent selection the user already
  // made on the landing screen; if that selection is incomplete the card
  // is a no-op (guarded by canCreateSurfaceSession below).
  async function createSessionForSurface(surface: "docs" | "images" | "videos"): Promise<void> {
    if (!canCreateSurfaceSession) return;
    setCreating(true);
    setCreateError(null);
    try {
      const workspaceTrimmed = workspace.trim();
      const res = await authenticatedFetch("/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: effectiveAgentId,
          ...(sandboxSelected
            ? {
                host_type: "managed",
                workspace: composeSandboxWorkspace(sandboxRepoUrl, sandboxRepoBranch),
              }
            : {
                host_id: selectedHostId,
                workspace: workspaceTrimmed,
              }),
        }),
      });
      if (!res.ok) {
        setCreateError(await describeCreateError(res));
        return;
      }
      const data = (await res.json()) as { id: string };
      if (!sandboxSelected) addRecent(workspaceTrimmed);
      void queryClient.refetchQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["directory-sessions"] });
      navigate(`/c/${data.id}?surface=${surface}`);
    } catch {
      setCreateError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setCreating(false);
    }
  }

  // A surface card can create a session when an agent + host/workspace (or a
  // valid sandbox) are selected — the same preconditions as a normal send,
  // minus the message requirement (the surface panel is the entry point).
  const canCreateSurfaceSession =
    selectedAgent != null &&
    (sandboxSelected ? sandboxRepoValid : !!selectedHostId && workspaceValid) &&
    !creating;

  async function handleCreate() {
    // Mirror the Send button's disabled condition (canSubmit) so the Enter-key
    // and form-submit paths that call this directly can't create a session with
    // a blank message, host, agent, or workspace.
    if (!canSubmit) return;
    setCreating(true);
    setCreateError(null);
    try {
      const trimmedBranch = branchName.trim();
      // `shouldCreateWorktree` (component scope): true only when a branch is
      // named and the workspace isn't already an existing worktree. Starting
      // in an existing worktree sends no git opts — the workspace is bound
      // straight to that dir, which also sidesteps the "branch already
      // exists" guard.
      const agent = agentList.find((a) => a.id === effectiveAgentId);
      const nativeLabels = nativeWrapperLabelsForAgent(agent);
      const agentSupportsPermissionMode = nativeAgentHasCapability(agent, "permissionMode");
      const agentSupportsApprovalMode = nativeAgentHasCapability(agent, "approvalMode");
      const agentSupportsCursorMode = nativeAgentHasCapability(agent, "cursorMode");

      let data: { id: string };

      if (effectiveAgentId === PENDING_AGENT_ID && pendingAgent) {
        // Custom agent path: build bundle client-side and use multipart POST.
        // The multipart create only stores the agent + session rows — it does
        // NOT launch a runner on the host. We must follow up with launchRunner
        // (POST /v1/hosts/{id}/runners) to bind the session to a runner, the
        // same way the fork-resume path does.
        const bundle = await buildAgentBundle(pendingAgent);
        const metadata: Record<string, unknown> = {};
        if (workspaceTrimmed) metadata.workspace = workspaceTrimmed;
        data = await createBundledSession(
          bundle,
          metadata as Parameters<typeof createBundledSession>[1],
        );
        // Launch the runner on the selected host. The multipart create
        // only stores DB rows — launchRunner binds + starts the runner.
        if (!sandboxSelected && selectedHostId && workspaceTrimmed) {
          // Create a new worktree, bind an existing one (records the branch
          // for the sidebar + delete flow without creating anything), or
          // neither — mirrored on the `git` block.
          const gitOpts = shouldCreateWorktree
            ? { branchName: trimmedBranch, baseBranch: baseBranch.trim() || undefined }
            : startInExistingWorktree
              ? { branchName: trimmedBranch, existingWorktree: true }
              : undefined;
          await launchRunner(selectedHostId, data.id, workspaceTrimmed, gitOpts);
        }
        // Clear pending agent after successful creation.
        setPendingAgent(null);
      } else {
        // Normal path: bind to an existing registered agent.
        const res = await authenticatedFetch("/v1/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_id: effectiveAgentId,
            ...(sandboxSelected
              ? {
                  host_type: "managed",
                  workspace: composeSandboxWorkspace(sandboxRepoUrl, sandboxRepoBranch),
                }
              : {
                  host_id: selectedHostId,
                  workspace: workspaceTrimmed,
                  // Create a new worktree, or bind an existing one
                  // (`existing_worktree` records the branch for the sidebar +
                  // delete flow without creating anything), or neither.
                  git: shouldCreateWorktree
                    ? { branch_name: trimmedBranch, base_branch: baseBranch.trim() || undefined }
                    : startInExistingWorktree
                      ? { branch_name: trimmedBranch, existing_worktree: true }
                      : undefined,
                }),
            // Native terminal agents open terminal-first: `agent_meow.ui:
            // terminal` tells the UI to render the terminal wrapper, and
            // `agent_meow.wrapper` selects which CLI bridge the runner launches.
            // The values are the registered wrapper ids the runner keys off —
            // they must match the wrapper registry, not the agent display name.
            // The DANGEROUS codex full-bypass opt-in rides along as an extra
            // label (only when the toggle is armed for a codex-native agent)
            // so the runner launches with --dangerously-bypass-approvals-and-
            // sandbox and the choice survives reload.
            labels:
              agentSupportsApprovalMode && bypassSandbox
                ? { ...(nativeLabels ?? {}), [CODEX_NATIVE_BYPASS_SANDBOX_LABEL_KEY]: "1" }
                : nativeLabels,
            // Permission / approval / cursor mode → CLI flag pair, persisted as
            // terminal_launch_args. Omitted for the default and non-native agents.
            terminal_launch_args:
              agentSupportsPermissionMode &&
              permissionMode !== CLAUDE_NATIVE_DEFAULT_PERMISSION_MODE
                ? ["--permission-mode", permissionMode]
                : agentSupportsApprovalMode && approvalMode !== CODEX_NATIVE_DEFAULT_APPROVAL_MODE
                  ? (CODEX_NATIVE_APPROVAL_MODES.find((m) => m.value === approvalMode)?.args ?? [])
                  : agentSupportsCursorMode && cursorExecMode !== CURSOR_NATIVE_DEFAULT_EXEC_MODE
                    ? (CURSOR_NATIVE_EXEC_MODES.find((m) => m.value === cursorExecMode)?.args ?? [])
                    : undefined,
            // Model + reasoning effort, persisted on the session row before
            // the runner launches. Only claude-native surfaces the picker, so
            // only its agents carry the choice; the runner reads them as
            // `--model` / `--effort` at terminal launch. An unselected ("")
            // knob is omitted so Claude Code keeps its own configured model.
            model_override: agentSupportsPermissionMode && pickedModel ? pickedModel : undefined,
            reasoning_effort:
              agentSupportsPermissionMode && pickedEffort ? pickedEffort : undefined,
            // Smart routing toggle — server-side. Only send it when routing is
            // actually eligible for the effective harness, so a stale "on" (from
            // a since-overridden harness, or the server flag flipping off) can't
            // ride along invisibly with no control to clear it.
            cost_control_mode_override: smartRoutingEligible
              ? (costControlMode ?? undefined)
              : undefined,
            harness_override: pickedHarness ?? undefined,
          }),
        });
        if (!res.ok) {
          setCreateError(await describeCreateError(res));
          return;
        }
        data = (await res.json()) as { id: string };
      }
      // File the new session under the chosen project (an implicit collection
      // stored as a conversation_labels row). Awaited so the conversations
      // refetch below already sees the label; non-fatal if it fails — the
      // session is created either way, just unfiled.
      if (selectedProject) {
        try {
          await authenticatedFetch(`/v1/sessions/${data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ labels: { [PROJECT_LABEL_KEY]: selectedProject } }),
          });
          void queryClient.invalidateQueries({ queryKey: ["projects"] });
          // Refetch the target project folder's own paginated list so the new
          // session shows up immediately (the folder fetches via
          // useProjectSessions, separate from the global conversations list).
          void queryClient.invalidateQueries({ queryKey: ["project-sessions"] });
          // The just-created session is now the project's newest; without this
          // a pencil click within staleTime prefills from the previous one.
          void queryClient.invalidateQueries({ queryKey: ["project-newest-session"] });
        } catch {
          // Leave the session unfiled; the user can file it from the sidebar.
        }
      }
      // Sandbox creates have no user-picked workspace to remember.
      if (!sandboxSelected) addRecent(workspaceTrimmed);
      // Fire-and-forget: don't block navigation on the sidebar list refresh.
      // The background refetch (or the WS session_added push) backfills the
      // new session's row within ~1s of landing in the chat; the chat itself
      // loads from the session id and never reads the sidebar cache.
      void queryClient.refetchQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["directory-sessions"] });
      // Prepend each "@"-tagged path as an attachment marker on its own line —
      // the same wording the native executors emit and that title-seeding
      // strips. The runner, rooted at this workspace, reads the on-disk file
      // from the marker; no upload happens. Folders carry a trailing "/".
      const initialPrompt =
        buildMentionPreamble(mentionedItems, selectedAgent?.harness ?? null) +
        sanitizeInitialPrompt(message);
      // Queue-then-flush (plan-040 Phase 1, Codex pattern): the unified
      // composer is already showing this turn on the landing — the queued
      // request flushes the moment the session binds, with no navigation
      // jump and no subtree swap. The skill is matched HERE (store stays
      // UI-free); native terminal agents keep plain text — their CLI owns
      // slash commands.
      useChatStore.getState().beginQueuedSession(
        initialPrompt,
        files,
        isNativeTerminalAgent
          ? null
          : matchSkillInvocation(initialPrompt, agent?.skills ?? []),
      );
      // Scope the recall entry to the new session id so ArrowUp surfaces it in
      // the freshly-bound chat. Sanitized text so recall reproduces exactly
      // what was sent.
      appendPromptHistoryEntry(initialPrompt, data.id);
      // The session was created — drop the preserved draft so the next visit
      // to the landing screen starts clean (and the unmount cleanup below
      // doesn't resurrect what we just sent).
      submittedRef.current = true;
      landingDraft = null;
      // Deep-link parity only: both routes render the same component, so a
      // replace write updates the URL without remounting anything.
      navigate(`/c/${data.id}`, { replace: true });
    } catch {
      setCreateError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setCreating(false);
    }
  }

  // The working-directory chip — a single Popover trigger button that opens
  // the file browser. The directory-conflict warning lives inside the browser
  // (a banner on the occupied folder), not on the chip.
  const workspaceChip = (
    <button
      type="button"
      className="flex h-6 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-13 font-normal text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
      data-testid="new-chat-landing-workspace-chip"
    >
      <FolderIcon className="size-4 shrink-0" />
      {/* Label collapses to icon-only on narrow viewports (mobile). Capped
          tight so a long working-directory path truncates instead of pushing
          the chip row onto a second line. */}
      <span
        className={`hidden max-w-40 truncate sm:block ${workspaceTrimmed !== "" ? "text-foreground" : ""}`}
      >
        {workspaceLabel}
      </span>
      <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
    </button>
  );

  return (
    // True vertical centering (the ChatGPT/Claude/Copilot layout): the
    // landing must NEVER exceed the viewport — if the block (hero +
    // checklist + composer + cards) is taller than the window, flex
    // `items-center` centers the oversized block and its top half scrolls
    // out of view, which read as "stuck to the top". min-h-0 + max-h-full
    // + overflow-y-auto lets the block CENTER within the viewport and
    // scroll internally only when it genuinely cannot fit (tiny windows).
    <div
      ref={setLandingSurface}
      className="flex h-full min-h-0 flex-1 items-center justify-center overflow-y-auto"
      data-testid="new-chat-landing"
    >
      {/* Padding lives inside the 840px cap, so the composer renders at
          840 − 80 = 760px max on desktop. px-4 on phones (16px gutters)
          keeps the composer from feeling cramped against the viewport
          edges; widens to the full px-10 at the md breakpoint and up. */}
      <WorkspaceHero>
        <div className="relative flex w-full flex-col gap-3">
          {/* Starter prompt chips — ABOVE the chatbox (Q1, 2026-09-02): the
              surface cards own the space below the composer, so the
              sample-prompts layer sits between the greeting and the
              composer like the reference chat layouts. Only over an empty
              draft (they ARE the empty-state affordance); clicking fills
              the composer with an editable prompt. */}
          {message.length === 0 && (
            <div
              className="flex flex-wrap items-center justify-center gap-2"
              data-testid="new-chat-landing-starter-prompts"
            >
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => {
                    setMessage(starter.prompt);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreate();
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            // Two visual states only (no hover): resting --border, and
            // --foreground while the textarea itself has focus (has-[]
            // scopes it so focusing footer buttons doesn't trigger it).
            // dark:bg-card-solid: the footer tray below tucks its top
            // edge behind this card (-mt-9), and the dark glass --card
            // is 60% alpha — the tucked strip ghosts through a
            // translucent card. Mirrors the chat composer card. Drag-over
            // lifts an inset ring (overlay below).
            className={cn(
              "relative z-10 flex w-full flex-col rounded-2xl border border-border bg-card dark:bg-card-solid shadow-[0_12px_20px_-20px_rgba(0,0,0,0.14),0_20px_28px_-28px_rgba(0,0,0,0.1)] transition-[border-color,box-shadow] duration-150 has-[textarea:focus]:border-foreground",
              isDragActive && "ring-2 ring-ring ring-inset",
            )}
            data-testid="new-chat-landing-composer"
          >
            {isDragActive && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/80">
                <span className="text-sm font-medium text-ring">Drop files here</span>
              </div>
            )}
            {/* Skill suggestions — floats above the composer box. */}
            {slashMenuOpen && (
              <SlashCommandMenu
                query={slashMenuQuery}
                activeIndex={slashMenuIndex}
                onSelect={applySlashSelection}
                commands={skillCommands}
              />
            )}
            {/* "@"-file-mention browser — native terminal agents with a workspace */}
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
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // Recompute the active "@"-mention from the caret each keystroke
                // (native terminal agents with a workspace — ``mentionEnabled``).
                setMention(
                  mentionEnabled
                    ? detectMentionAt(
                        e.target.value,
                        e.target.selectionStart ?? e.target.value.length,
                      )
                    : null,
                );
              }}
              onBlur={() => {
                // Dismiss the mention menu when focus leaves the textarea; menu
                // rows preventDefault on mousedown so selecting one doesn't blur.
                dismissMention();
              }}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              onKeyDown={(e) => {
                if (isImeCompositionKeyEvent(e, isComposingRef.current)) {
                  return;
                }

                // "@"-mention menu navigation (shared useMentionBrowser) —
                // mutually exclusive with the slash menu (a token can't be both)
                // and takes priority over submission.
                if (handleMentionKeyDown(e)) return;

                // While the skills menu is open, ArrowUp/Down navigate it and
                // Enter/Tab complete the highlighted item — these take
                // priority over submission (same UX as the in-session
                // composer).
                if (slashMenuOpen && slashMenuMatches.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSlashMenuIndex((i) => (i + 1) % slashMenuMatches.length);
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSlashMenuIndex((i) => (i <= 0 ? slashMenuMatches.length - 1 : i - 1));
                    return;
                  }
                  if (
                    (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) &&
                    slashMenuIndex >= 0
                  ) {
                    e.preventDefault();
                    applySlashSelection(slashMenuMatches[slashMenuIndex]!);
                    return;
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    // Dismiss the menu by clearing the draft so the user can
                    // start fresh.
                    setMessage("");
                    setSlashMenuIndex(-1);
                    return;
                  }
                }
                // Enter sends; Shift+Enter inserts a newline.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // The mention menu is briefly closed while its listing loads;
                  // swallow Enter so the in-progress "@dir/" token isn't sent.
                  if (mentionListingPending) return;
                  void handleCreate();
                }
              }}
              onPaste={(e) => {
                // Pasted images/files attach instead of inserting as text,
                // mirroring the in-session composer.
                const pasted = Array.from(e.clipboardData.items)
                  .filter((item) => item.kind === "file")
                  .map((item) => item.getAsFile())
                  .filter((f): f is File => f !== null);
                if (pasted.length > 0) {
                  e.preventDefault();
                  addFiles(pasted);
                }
              }}
              // Suppress the native placeholder when the overlay supplies its
              // own prompt text; aria-label preserves the accessible name.
              placeholder={pillSkills.length > 0 ? "" : "Describe a task to start a new session…"}
              aria-label="Describe a task to start a new session"
              rows={1}
              autoFocus
              data-testid="new-chat-landing-input"
              // Compose-pill text spec: SF Pro Text system stack at
              // 14px/20px. (Note: sub-16px inputs make mobile Safari
              // auto-zoom on focus — accepted tradeoff per the design.)
              // Heights are border-box (16px top + 4px bottom padding lives
              // inside them): min 60px = one 20px line + a spare line of
              // breathing room; max 200px = the spec's 180px of content.
              // useAutoGrowTextarea drives the height between the two.
              className="max-h-[200px] min-h-[60px] w-full resize-none overflow-y-auto bg-transparent px-4 pt-4 pb-1 font-['SF_Pro_Text',-apple-system,BlinkMacSystemFont,system-ui,sans-serif] text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground md:select-text"
            />
            {/* Gated on an empty draft so it reads as the placeholder.
                pointer-events-none lets clicks fall through to focus the
                textarea; the pills themselves opt back in. */}
            {pillSkills.length > 0 && message.length === 0 && (
              <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
                <span className="font-['SF_Pro_Text',-apple-system,BlinkMacSystemFont,system-ui,sans-serif] text-sm leading-5 text-muted-foreground">
                  Describe a task, or try a skill
                </span>
                <SkillPills skills={pillSkills} onPick={applySkillPill} />
              </div>
            )}
            {/* Hidden file input for the attach button. */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,text/*,application/json"
              className="hidden"
              data-testid="new-chat-landing-file-input"
              onChange={(e) => {
                if (e.target.files) {
                  addFiles(Array.from(e.target.files));
                  // Reset so the same file can be re-selected.
                  e.target.value = "";
                }
              }}
            />
            {/* "@"-mention chips — one per tagged workspace file/folder. Each is
                delivered as an "[Attached: <path>]" marker prepended to the
                first message at create time. */}
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
            {/* File chips — shown below the textarea when files are attached. */}
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
            {/* No own bg — the pill paints the surface. An explicit bg-card
                here would also catch the .dark .bg-card glass rule (border +
                shadow) and visually split the pill in half. */}
            <div className="flex items-center justify-between pt-1 pr-4 pb-3 pl-2">
              {/* Attach + dictate — left side, mirroring the in-session composer. */}
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-9 md:size-8"
                  disabled={creating}
                  onClick={() => fileInputRef.current?.click()}
                  title={t("newChat.attachFiles")}
                  data-testid="new-chat-landing-attach"
                >
                  <PaperclipIcon className="size-4" />
                  <span className="sr-only">{t("newChat.attachFiles")}</span>
                </Button>
                <ComposerMicButton
                  enableHotkey
                  disabled={
                    creating ||
                    realtimeVoice.state === "connected" ||
                    realtimeVoice.isResponding ||
                    realtimeVoice.isSpeaking ||
                    (wakeWordEnabled && wakeWordListening)
                  }
                  onListeningChange={setDictationActive}
                  onVoiceStart={() => {
                    voiceSnapshotRef.current = message;
                  }}
                  onVoiceDiscard={() => setMessage(voiceSnapshotRef.current)}
                  onTranscript={dictation.appendFinal}
                  onInterim={dictation.replaceInterim}
                  onHermesVoice={() => {
                    // Fallback: toggle the Hermes voice pipeline (paw-mic).
                    if (realtimeVoice.state === "connected") {
                      const finalTranscript = realtimeVoice.userTranscript;
                      realtimeVoice.disconnect();
                      if (finalTranscript) dictation.appendFinal(finalTranscript);
                    } else {
                      voiceSnapshotRef.current = message;
                      realtimeVoice.connect().then(() => {
                        // Gate behind the wake word — prevents noise/side-talk
                        // from entering the STT pipeline.
                        import("@/lib/hermesVoice").then(({ hermesVoice }) => {
                          hermesVoice.startWakeWordMode();
                        });
                      }).catch(() => {});
                    }
                  }}
                />
              </div>
              {/* Agent picker + send button — hidden in text mode to match
                    the workspace design's clean input card. Session creation
                    happens on Enter (form submit) or via the chip tray below. */}

              <div className="flex items-center gap-0.5">
                {/* Paw-mic chip — LEFT of the send button (the "prompt enter
                    chip"), per the layout ask. Click = toggle the VAD-backed
                    realtime voice session; 500ms long-press = arm the wake
                    gate. Hover shows a usage tooltip; active glows ember. */}
                <VoicePawButton
                  variant="dock"
                  realtimeVoice={realtimeVoice}
                  voiceListening={realtimeVoice.state === "connected"}
                  creating={creating}
                  dictationActive={dictationActive}
                  wakeWordActive={wakeWordListening}
                  wakeWordEnabled={wakeWordEnabled}
                  onVoiceStart={() => {
                    voiceSnapshotRef.current = message;
                  }}
                  onTranscriptAppend={(text) => dictation.appendFinal(text)}
                  onToggleWakeWord={() => {}}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!canSubmit}
                          aria-label={
                            creating ? t("newChat.startingSession") : t("newChat.startSession")
                          }
                          aria-busy={creating}
                          data-testid="new-chat-landing-submit"
                          className="size-8 rounded-full bg-foreground text-card transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                          {creating ? (
                            <Loader2Icon className="size-4 animate-spin" />
                          ) : (
                            <ArrowUpIcon className="size-4" />
                          )}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {submitDisabledReason != null && (
                      <TooltipContent>{submitDisabledReason}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </form>
          {isSingleUser && (
            <div className="mt-2 flex w-full justify-end">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings((open) => !open)}
                data-testid="new-chat-landing-advanced-toggle"
                className="flex h-7 items-center gap-1 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <SettingsIcon className="size-3.5 shrink-0" />
                <span>
                  {showAdvancedSettings
                    ? t("newChat.hideAdvancedSettings")
                    : t("newChat.advancedSettings")}
                </span>
                <ChevronRightIcon
                  className={cn(
                    "size-3.5 shrink-0 opacity-60 transition-transform",
                    showAdvancedSettings && "rotate-90",
                  )}
                />
              </button>
            </div>
          )}
          {showSelectorTray && (
            /* Composer footer tray — host / working directory / worktree
                selectors. Renders below the pill at z-0 while the pill sits
                at z-10: -mt-9 cancels the wrapper's gap-3 (12px) and tucks
                the tray's top 24px underneath the pill's rounded bottom
                edge. Height is padding-driven (pt-8 + h-6 chips + pb-2 =
                the same 64px as before when the chips fit one row) so the
                chip row can wrap on narrow screens — with a fixed h-16 the
                chips overflowed the viewport on phones, widening the whole
                page (#sidebar-wider-than-screen on the landing page). */
            <div
              className={cn(
                "relative z-0 flex w-full items-center rounded-b-2xl bg-tray/40 pt-8 pr-3 pb-2 pl-2",
                isSingleUser ? "mt-2" : "-mt-9",
              )}
              data-testid="new-chat-landing-selector-tray"
            >
              <div className="flex flex-wrap items-center gap-1">
                {/* Host chip */}
                <DropdownMenu
                  onOpenChange={(open) => {
                    // Run a requested "connect this machine" only once the menu
                    // has closed.
                    if (!open && pendingConnectRef.current) {
                      pendingConnectRef.current = false;
                      void connectThisMachine();
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-6 items-center gap-1 rounded-full px-2.5 text-13 font-normal text-muted-foreground transition-colors hover:text-foreground"
                      data-testid="new-chat-landing-host-chip"
                    >
                      {isCloudHost ? (
                        <MonitorCloudIcon className="size-4 shrink-0" />
                      ) : (
                        <MonitorIcon className="size-4 shrink-0" />
                      )}
                      <span
                        className={`hidden max-w-32 truncate sm:block ${sandboxSelected || selectedHost != null || connectingThisMachine ? "text-foreground" : ""}`}
                      >
                        {hostLabel}
                      </span>
                      <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-52">
                    {/* Server-provisioned sandbox — only advertised when
                    /v1/info reports managed_sandboxes_enabled. Pinned
                    first, above the connected-host list. */}
                    {(managedSandboxesEnabled || showDisabledSandboxWithDocs) && (
                      <>
                        {managedSandboxesEnabled ? (
                          <DropdownMenuItem
                            onSelect={selectSandbox}
                            data-testid="new-chat-landing-sandbox-option"
                            data-active={sandboxSelected ? "true" : undefined}
                            className="text-xs data-[active=true]:bg-accent/60"
                          >
                            <span className="flex items-center gap-2">
                              <MonitorCloudIcon className="size-4 text-muted-foreground" />
                              <span className="text-xs">{sandboxLabel}</span>
                            </span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            aria-disabled="true"
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground opacity-60"
                            data-testid="new-chat-landing-sandbox-option-disabled"
                          >
                            <span className="flex items-center gap-2">
                              <MonitorCloudIcon className="size-4 text-muted-foreground" />
                              <span className="text-xs">New Sandbox</span>
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground/80 hover:text-foreground"
                                  aria-label="Why New Sandbox is unavailable"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") e.stopPropagation();
                                  }}
                                >
                                  <CircleHelpIcon className="size-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-64">
                                {newSandboxTooltipContent}
                              </TooltipContent>
                            </Tooltip>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {allHosts.length === 0 && !showConnectThisMachine && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        {t("newChat.noHosts")}
                      </div>
                    )}
                    {onlineHosts.map((host) => (
                      <DropdownMenuItem
                        key={host.host_id}
                        onSelect={() => selectHost(host.host_id)}
                        data-testid={`new-chat-landing-host-${host.host_id}`}
                        data-active={host.host_id === selectedHostId ? "true" : undefined}
                        className="text-xs data-[active=true]:bg-accent/60"
                      >
                        <HostOption
                          host={host}
                          subtitle={host.host_id === thisMachineHostId ? "this machine" : undefined}
                        />
                      </DropdownMenuItem>
                    ))}
                    {offlineHosts.map((host) => {
                      // This machine, offline: make the row itself the connect
                      // affordance instead of a disabled entry + a duplicate "Run
                      // on this machine" item. Connect after the menu closes.
                      if (host.host_id === thisMachineHostId && canConnectThisMachine) {
                        return (
                          <DropdownMenuItem
                            key={host.host_id}
                            onSelect={() => {
                              pendingConnectRef.current = true;
                            }}
                            disabled={connectingThisMachine}
                            data-testid="new-chat-landing-run-on-this-machine"
                            className="text-xs"
                          >
                            <HostOption
                              host={host}
                              subtitle={
                                connectingThisMachine
                                  ? "connecting…"
                                  : "this machine · select to connect"
                              }
                            />
                          </DropdownMenuItem>
                        );
                      }
                      return (
                        <DropdownMenuItem key={host.host_id} disabled className="text-xs">
                          <HostOption
                            host={host}
                            subtitle={
                              host.host_id === thisMachineHostId ? "this machine" : undefined
                            }
                          />
                        </DropdownMenuItem>
                      );
                    })}
                    {/* Desktop shell, machine not in the list yet: offer to connect
                    it in one click. */}
                    {showConnectThisMachine && (
                      <DropdownMenuItem
                        onSelect={() => {
                          pendingConnectRef.current = true;
                        }}
                        disabled={connectingThisMachine}
                        data-testid="new-chat-landing-run-on-this-machine"
                        className="gap-2 text-xs"
                      >
                        <MonitorIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs">
                          {connectingThisMachine
                            ? "Connecting this machine…"
                            : "Run on this machine"}
                        </span>
                      </DropdownMenuItem>
                    )}
                    {(allHosts.length > 0 || showConnectThisMachine) && <DropdownMenuSeparator />}
                    {/* Persistent escape hatch: open the connect-a-host
                    instructions. Present even with zero hosts so a fresh user
                    is never stuck. */}
                    <DropdownMenuItem
                      onSelect={() => setConnectOpen(true)}
                      data-testid="new-chat-landing-connect-host"
                      className="gap-2 text-xs text-muted-foreground"
                    >
                      <PlusIcon className="size-3.5" />
                      Connect new host
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sandbox repository chip — the sandbox counterpart of the
                working-directory chip. There is no filesystem to browse
                before the sandbox exists, so the workspace is specified as
                a git repository URL (+ optional branch) the server clones
                at create time. Blank = empty server-created workspace. */}
                {sandboxSelected && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-6 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-13 font-normal text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
                        data-testid="new-chat-landing-repo-chip"
                      >
                        <GitBranchIcon className="size-4 shrink-0" />
                        <span
                          className={`hidden max-w-40 truncate sm:block ${sandboxRepoName ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {sandboxRepoLabel}
                        </span>
                        <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-96 p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          <label
                            htmlFor="landing-repo-url"
                            className="text-xs font-medium text-foreground"
                          >
                            Repository (optional)
                          </label>
                          {databricksGitCredentialsTooltipContent && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                                  aria-label="How to set up Databricks git credentials"
                                >
                                  <CircleHelpIcon className="size-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-64">
                                {databricksGitCredentialsTooltipContent}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <input
                          id="landing-repo-url"
                          type="text"
                          value={sandboxRepoUrl}
                          onChange={(e) => setSandboxRepoUrl(e.target.value)}
                          placeholder="https://github.com/org/repo"
                          className="rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition-colors focus-visible:border-ring"
                          data-testid="new-chat-landing-repo-input"
                        />
                        <input
                          type="text"
                          value={sandboxRepoBranch}
                          onChange={(e) => setSandboxRepoBranch(e.target.value)}
                          placeholder="Branch (defaults to the repo's default)"
                          aria-label="Repository branch"
                          className="rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition-colors focus-visible:border-ring"
                          data-testid="new-chat-landing-repo-branch-input"
                        />
                        <p className="text-xs text-muted-foreground">
                          Cloned into the sandbox as the session's working directory. Leave blank to
                          start in an empty workspace.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Working directory chip — opens the file browser directly (no
                separate "browse" toggle). onNavigate updates the workspace
                live as the user browses (no "Select" button); the popover
                closes on click-out. The directory-conflict warning shows as a
                banner inside the browser on the occupied folder. Hidden for
                sandbox sessions — the repository chip above replaces it (the
                server creates the directory inside the sandbox). */}
                {!sandboxSelected && (
                  <Popover open={workspacePopoverOpen} onOpenChange={setWorkspacePopoverOpen}>
                    <PopoverTrigger asChild>{workspaceChip}</PopoverTrigger>
                    {/* Cap to the viewport so the 420px browser can't overflow a
                  narrow screen; desktop still gets the full width. */}
                    <PopoverContent align="start" className="w-[min(420px,calc(100vw-2rem))] p-0">
                      {selectedHostId ? (
                        <WorkspacePicker
                          hostId={selectedHostId}
                          initialPath={
                            isNavigablePath(workspaceTrimmed) ? workspaceTrimmed : undefined
                          }
                          onNavigate={setWorkspace}
                          // Warn when browsing into a directory other live agents
                          // occupy. Suppressed only when a NEW isolated worktree
                          // will be created (no shared-dir conflict then). When
                          // starting directly in an existing worktree the branch
                          // is prefilled but the dir IS shared, so keep warning.
                          occupancyForPath={
                            !shouldCreateWorktree
                              ? (abs) => occupancyByDir.get(normalizeWorkspacePath(abs) ?? "") ?? 0
                              : undefined
                          }
                        />
                      ) : (
                        <p className="p-3 text-xs text-muted-foreground">Select a host first.</p>
                      )}
                    </PopoverContent>
                  </Popover>
                )}

                {/* Git worktree chip — hidden for sandbox sessions (worktree
                creation requires a caller-supplied host_id). */}
                {!sandboxSelected && (
                  <Popover open={worktreePopoverOpen} onOpenChange={setWorktreePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-6 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-13 font-normal text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
                        data-testid="new-chat-landing-branch-chip"
                      >
                        <GitBranchIcon className="size-4 shrink-0" />
                        <span
                          className={`hidden max-w-32 truncate sm:block ${branchName.trim() ? "text-foreground" : ""}`}
                        >
                          {worktreeLabel}
                        </span>
                        <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      collisionPadding={16}
                      // No overflow clip here — the worktree dropdown floats as an
                      // absolute overlay (below) and must be able to escape the
                      // popover's padding box.
                      className="w-[min(20rem,calc(100vw-2rem))] p-3"
                    >
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="landing-branch-name"
                          className="text-xs font-medium text-foreground"
                        >
                          Git worktree branch (optional)
                        </label>
                        {/* Help text sits above the field. The warning for a picked
                        existing worktree stays below the input (contextual to the
                        selection). */}
                        <p className="text-xs text-muted-foreground">
                          New branch name, or pick an existing worktree. Leave blank to start
                          directly in the working directory.
                        </p>
                        {/* The branch field is a combobox: focusing it reveals the
                        repo's existing worktrees, and typing filters them.
                        Picking one starts in that worktree; a name matching none
                        creates a new worktree. */}
                        <div className="relative flex flex-col">
                          <input
                            id="landing-branch-name"
                            type="text"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            onFocus={() => setBranchInputFocused(true)}
                            // Delay so a click on a dropdown option registers
                            // before the list unmounts on blur.
                            onBlur={() => setTimeout(() => setBranchInputFocused(false), 120)}
                            placeholder="feature/my-branch"
                            role="combobox"
                            aria-expanded={branchInputFocused && filteredWorktrees.length > 0}
                            aria-autocomplete="list"
                            // Suppress the browser's native autofill dropdown so it
                            // doesn't overlay our worktree combobox. `off` alone is
                            // ignored by some browsers, so also disable spellcheck /
                            // autocorrect and give it an unrecognized name.
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            name="agent-meow-worktree-branch"
                            // pr-9 leaves room for the generate button overlaid at
                            // the right edge.
                            className="rounded-md border border-input bg-background py-2 pr-9 pl-3 text-xs outline-none transition-colors focus-visible:border-ring"
                            data-testid="new-chat-landing-branch-input"
                          />
                          {/* Fill a unique branch name for a throwaway worktree.
                          onMouseDown so it fires before the input's blur closes
                          the combobox and preventDefault keeps focus on the
                          input. */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              generateBranchName();
                            }}
                            title="Generate a unique branch name"
                            aria-label="Generate a unique branch name"
                            className="absolute top-0 right-0 flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            data-testid="new-chat-landing-branch-generate"
                          >
                            <ShuffleIcon className="size-4" />
                          </button>
                          {branchInputFocused && filteredWorktrees.length > 0 && (
                            <div
                              // Floats over the popover as a combobox popup, so it
                              // doesn't stretch the box. Bounded height + internal
                              // scroll keep it from running off the viewport.
                              className="absolute top-full right-0 left-0 z-20 mt-1 flex max-h-40 flex-col overflow-y-auto rounded-md border border-input bg-popover p-1 shadow-md"
                              data-testid="new-chat-landing-worktree-dropdown"
                            >
                              <span className="px-2 pt-1 pb-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Existing worktrees
                              </span>
                              <ul className="flex flex-col gap-0.5">
                                {filteredWorktrees.map((w) => {
                                  const selected =
                                    normalizeWorkspacePath(w.path) ===
                                    normalizeWorkspacePath(workspaceTrimmed);
                                  return (
                                    <li key={w.path}>
                                      <button
                                        type="button"
                                        // onMouseDown (not onClick): fires before the
                                        // input's blur, so the selection lands even
                                        // though blur is about to hide the list.
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setWorkspace(w.path);
                                          setBranchInputFocused(false);
                                          setWorktreePopoverOpen(false);
                                        }}
                                        className={`flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-accent ${
                                          selected ? "bg-accent" : ""
                                        }`}
                                        data-testid="new-chat-landing-worktree-option"
                                      >
                                        <span className="font-medium text-foreground">
                                          {w.branch ?? "(detached)"}
                                        </span>
                                        {/* Tail-truncated so the disambiguating
                                      folder shows, not a shared prefix; full
                                      path on hover. */}
                                        <span
                                          className="w-full truncate text-muted-foreground"
                                          title={w.path}
                                        >
                                          {worktreePathTail(w.path)}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                        {/* Base branch only matters when creating a NEW worktree
                        — hidden once the workspace points at an existing one
                        (no worktree is created, so there's nothing to base). */}
                        {branchName.trim() !== "" && !startInExistingWorktree && (
                          <input
                            type="text"
                            value={baseBranch}
                            onChange={(e) => setBaseBranch(e.target.value)}
                            placeholder="Base branch (defaults to current)"
                            aria-label="Base branch"
                            className="rounded-md border border-input bg-background px-3 py-2 text-xs outline-none transition-colors focus-visible:border-ring"
                            data-testid="new-chat-landing-base-branch-input"
                          />
                        )}
                        {startInExistingWorktree && (
                          <p
                            className="text-xs text-amber-600 dark:text-amber-500"
                            data-testid="new-chat-landing-existing-worktree-warning"
                          >
                            Starts in existing worktree, edit the name to create a new one.
                          </p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Project chip — files the session under a named project on
                create. Sits after the worktree chip. Only shown when a project
                is already selected (e.g. quick-starting from an existing
                project's "new session" pencil, which passes `?project=`);
                otherwise the new-session flow stays unfiled. */}
                {selectedProject && (
                  <LandingProjectPicker value={selectedProject} onChange={setSelectedProject} />
                )}

                {/* Agent chip — selects the agent/harness for the session.
                  Sits after the project chip (or worktree chip when no project).
                  Matches the design's bottom-tray chip layout. */}
                <AgentHarnessPicker
                  agentEntries={agentEntries}
                  harnessEntries={harnessEntries}
                  effectiveAgentId={effectiveAgentId}
                  agentLabel={agentLabel}
                  hasAgents={agentList.length > 0}
                  host={harnessWarningHost}
                  onSelectAgent={handleSelectAgent}
                  pendingAgent={pendingAgentAllowedOnTarget ? pendingAgent : null}
                  pendingAgentId={PENDING_AGENT_ID}
                  onSelectPending={handleSelectPending}
                  onCreateCustomAgent={() => setCreateAgentOpen(true)}
                  sandboxSelected={sandboxSelected}
                />
              </div>

              {/* Gear config button — opens the harness config modal. Only
                shown when the selected agent has knobs to configure. */}
              {selectedAgentHasKnobs && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setConfigOpen(true)}
                      className="flex h-6 items-center justify-center rounded-full border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
                      data-testid="new-chat-landing-config-gear"
                      aria-label={t("newChat.configureAgent")}
                    >
                      <SettingsIcon className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-w-64"
                    data-testid="new-chat-landing-config-gear-tooltip"
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      {configSummary.map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-2">
                          <span className="text-muted-foreground">{label}: </span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* The agent / harness picker is now a chip in the bottom tray,
                matching the design's chip-based layout. The composer's right
                action cluster holds only the send button. */}

              {/* The agent / harness picker is now a chip in the bottom tray,
                matching the design's chip-based layout. The composer's right
                action cluster holds only the send button. */}
            </div>
          )}

          {/* Warn (don't block) when the selected agent's harness isn't
              configured on the selected host — the host re-checks at
              launch, so submitting surfaces a specific error if it
              really can't run. Normal-flow directly under the composer
              (like the createError line below) so it reads as part of it. */}
          {selectedAgentUnconfigured && (
            <HarnessSetupNotice
              agentName={selectedAgent?.display_name}
              hostName={harnessWarningHost?.name}
              harness={selectedAgent?.harness ?? null}
              reason={harnessUnavailableReasonOnHost(selectedAgent?.harness, harnessWarningHost)}
              featureEnabled={harnessInstallEnabled}
              onSetup={() =>
                setSetupTarget({
                  agentName: selectedAgent?.display_name,
                  harness: selectedAgent?.harness ?? null,
                  host: harnessWarningHost,
                })
              }
            />
          )}

          {/* Persistent danger banner — stays under the composer while full
              bypass is armed (the in-menu banner vanishes when the Advanced
              tray closes), so the dangerous stance is always visible before
              the session is created. Gated on the codex-native capability so
              a stale toggle from a since-switched agent can't show it. */}
          {supportsApprovalMode && bypassSandbox && (
            <p
              role="alert"
              className="flex items-center gap-1.5 rounded-md border border-destructive bg-destructive/10 px-2 py-1.5 text-xs font-medium text-destructive"
              data-testid="new-chat-landing-bypass-sandbox-active-banner"
            >
              <TriangleAlertIcon className="size-3.5 shrink-0" />
              <span>
                Codex will run with approvals and the sandbox disabled — it can edit any file and
                run any command without asking.
              </span>
            </p>
          )}

          {/* Empty-state CTA — when no hosts are connected and no sandbox
                is selected, surface a visible "Connect a host" call-to-action
                so the user isn't stuck with a disabled submit button and no
                guidance. The host chip's "No hosts" text is hidden on small
                screens, so this card is the primary discovery path. */}
          {showSelectorTray && !sandboxSelected && allHosts.length === 0 && !hostsLoading && (
            <div
              className="flex flex-col gap-2 rounded-lg border border-dashed border-brand-primary/30 bg-brand-primary/5 px-3 py-2.5"
              data-testid="new-chat-landing-no-hosts-cta"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <MonitorIcon className="size-3.5 shrink-0 text-brand-primary" />
                <span>{t("newChat.noHostsCtaTitle")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("newChat.noHostsCtaBody")}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 border-brand-primary/30 text-xs text-brand-primary hover:bg-brand-primary/10"
                  onClick={() => setConnectOpen(true)}
                  data-testid="new-chat-landing-no-hosts-connect"
                >
                  <PlusIcon className="size-3.5" />
                  {t("newChat.connectHost")}
                </Button>
              </div>
            </div>
          )}

          {createError && (
            <p className="text-xs text-destructive" data-testid="new-chat-landing-error">
              {createError}
            </p>
          )}
        </div>

        {/* Workspace tool cards — the three content surfaces (Docs / Images /
            Videos). Clicking creates a session (reusing the host/workspace/
            agent selection on the landing screen) and deep-links into the
            session's right-rail panel via ?surface=<name>, which AppShell
            consumes to open the matching tab. Disabled until a host/workspace
            (or valid sandbox) + agent are selected. */}
        <div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              id: "images" as const,
              name: t("workspace.images"),
              description: t("newChat.imagesDesc"),
              icon: ImageIcon,
              accent: "var(--surface-images)",
              wash: "var(--surface-images-wash)",
            },
            {
              id: "videos" as const,
              name: t("workspace.videos"),
              description: t("newChat.videosDesc"),
              icon: FilmIcon,
              accent: "var(--surface-videos)",
              wash: "var(--surface-videos-wash)",
            },
            {
              id: "docs" as const,
              name: t("workspace.docs"),
              description: t("newChat.docsDesc"),
              icon: FileTextIcon,
              accent: "var(--surface-docs)",
              wash: "var(--surface-docs-wash)",
            },
          ].map((tool) => (
            <button
              key={tool.id}
              type="button"
              data-testid={`new-chat-landing-surface-card-${tool.id}`}
              disabled={!canCreateSurfaceSession || creating}
              // Compact horizontal row (centering fix, 2026-09-02): the tall
              // 146px cards weighted the block's bottom and pushed the
              // composer above the visual center. Icon-left + one-line
              // description keeps the affordance at ~64px so greeting +
              // composer own the middle, reference-layout style.
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card-solid"
              style={{
                backgroundImage: `linear-gradient(160deg, ${tool.wash}, transparent 70%)`,
              }}
              onClick={() => void createSessionForSurface(tool.id)}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in srgb, ${tool.accent} 15%, transparent)` }}
              >
                <tool.icon className="size-5" style={{ color: tool.accent }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{tool.name}</div>
                <div className="truncate text-xs text-muted-foreground">{tool.description}</div>
              </div>
            </button>
          ))}
        </div>
      </WorkspaceHero>

      {/* Connect-host instructions, reachable from the host dropdown even when
          no hosts are online — the zero-host escape hatch. */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="connect-host-dialog">
          <DialogHeader>
            <DialogTitle>{t("newChat.connectHostTitle")}</DialogTitle>
          </DialogHeader>
          <ConnectHostInstructions serverUrl={serverUrl} label={t("newChat.connectHostLabel")} />
        </DialogContent>
      </Dialog>

      {/* Harness "Set up" dialog — the single home for install/login (and later
          API key / gateway) setup, opened from the composer notice or a picker
          row's "Set up →". */}
      <HarnessSetupDialog
        open={setupTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSetupTarget(null);
        }}
        agentName={setupTarget?.agentName}
        harness={setupTarget?.harness ?? null}
        host={setupTarget?.host}
      />

      {/* Create custom agent dialog — opened from the agent picker dropdown. */}
      <CreateAgentDialog
        open={createAgentOpen}
        onOpenChange={setCreateAgentOpen}
        onCreate={(input) => {
          setPendingAgent(input);
          setPickedAgentId(PENDING_AGENT_ID);
          setPickedHarness(null);
        }}
      />

      {/* Harness config modal — opened from the composer's gear icon.
          Shows the selected agent's run-config knobs (model / effort /
          permission mode / approval mode / exec mode / brain-harness). */}
      {selectedAgent && selectedAgentHasKnobs && (
        <HarnessConfigModal
          open={configOpen}
          onOpenChange={setConfigOpen}
          agent={selectedAgent}
          brainHarnessLabels={brainHarnessLabels}
          host={harnessWarningHost}
          hideUnconfigured={hideUnconfiguredHarnesses}
          smartRoutingEligible={smartRoutingEligible}
          permissionMode={permissionMode}
          approvalMode={approvalMode}
          cursorExecMode={cursorExecMode}
          bypassSandbox={bypassSandbox}
          pickedModel={pickedModel}
          pickedEffort={pickedEffort}
          pickedHarness={pickedHarness}
          costControlMode={costControlMode}
          setPermissionMode={setPermissionMode}
          setApprovalMode={setApprovalMode}
          setCursorExecMode={setCursorExecMode}
          setBypassSandbox={setBypassSandbox}
          setPickedModel={setPickedModel}
          setPickedEffort={setPickedEffort}
          setPickedHarness={handleSetPickedHarness}
          setCostControlMode={setCostControlMode}
        />
      )}
    </div>
  );
}
