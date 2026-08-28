// Workspace folder selector — a compact surface in the left Sidebar
// where the user can pick a local path as the dedicated file folder
// agent-meow uses for new chats.
//
// Reuses the existing WorkspacePathField combobox (recent paths +
// live filesystem matches) and the useRecentWorkspaces localStorage
// store. In single-user mode it surfaces the server's default_workspace
// (~/agent-meow-workspace) and lets the user override it; in multi-user
// mode it shows the most-recent workspace or a "Pick a folder" prompt.

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderIcon, FolderOpenIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useServerInfo } from "@/lib/CapabilitiesContext";
import { isSingleUserMode } from "@/lib/capabilities";
import { useHosts } from "@/hooks/useHosts";
import { useRecentWorkspaces } from "@/hooks/useRecentWorkspaces";
import { WorkspacePathField } from "./WorkspacePathField";
import { basenameOfPath } from "@/lib/hostPaths";

interface WorkspaceFolderSelectorProps {
  /**
   * Called when the user selects a workspace path. The Sidebar (or
   * parent) navigates to "/" with the workspace pre-filled so the
   * next NewChatDialog seeds from it.
   */
  onSelectWorkspace: (path: string) => void;
}

/**
 * Compact workspace-folder selector for the left Sidebar.
 *
 * Shows the current dedicated workspace folder (or the server default
 * in single-user mode) with a collapsible combobox to pick a different
 * local path. Recent paths are offered as quick-select rows.
 */
export function WorkspaceFolderSelector({ onSelectWorkspace }: WorkspaceFolderSelectorProps) {
  const { t } = useTranslation();
  const info = useServerInfo();
  const isSingleUser = isSingleUserMode(info);
  const defaultWorkspace = info !== "loading" ? (info.default_workspace ?? null) : null;

  const { data: hosts } = useHosts();
  // The local host is the first online host (the one running the agent-meow server).
  const localHost = useMemo(
    () => hosts?.find((h) => h.status === "online") ?? hosts?.[0] ?? null,
    [hosts],
  );
  const localHostId = localHost?.host_id ?? null;

  const { recent, addRecent } = useRecentWorkspaces(localHostId);

  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");

  // The effective workspace: the most-recent path, or the single-user default.
  const effectiveWorkspace = recent[0] ?? (isSingleUser ? defaultWorkspace : null);

  const handleSelect = useCallback(
    (path: string) => {
      const trimmed = path.trim();
      if (!trimmed) return;
      addRecent(trimmed);
      onSelectWorkspace(trimmed);
      setExpanded(false);
      setValue("");
    },
    [addRecent, onSelectWorkspace],
  );

  const displayName = effectiveWorkspace
    ? basenameOfPath(effectiveWorkspace)
    : t("sidebar.workspaceFolderSelector.notSet", "Not set");

  return (
    <div className="mt-2 px-1">
      {/* Collapsed: a single row showing the current folder. */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="group flex w-full items-center gap-1.5 rounded-md border border-border/50 px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:border-border"
        aria-expanded={expanded}
        aria-label={t("sidebar.workspaceFolderSelector.ariaLabel", "Select workspace folder")}
        data-testid="workspace-folder-selector"
      >
        {expanded ? (
          <ChevronDownIcon className="size-3.5 shrink-0" />
        ) : (
          <ChevronRightIcon className="size-3.5 shrink-0" />
        )}
        {effectiveWorkspace ? (
          <FolderOpenIcon className="size-3.5 shrink-0 text-primary" />
        ) : (
          <FolderIcon className="size-3.5 shrink-0" />
        )}
        <span className="flex-1 truncate text-left">{displayName}</span>
      </button>

      {/* Expanded: the combobox + recent quick-select. */}
      {expanded && (
        <div className="mt-1 space-y-1.5 px-1 pb-1">
          <WorkspacePathField
            hostId={localHostId}
            value={value}
            onChange={setValue}
            onBrowse={() => {
              // The full tree browser lives in NewChatDialog; here we
              // keep the compact combobox only. A future iteration can
              // open a mini WorkspacePicker popover if the user needs
              // to navigate the full tree.
            }}
            onCommit={handleSelect}
            recent={recent}
          />

          {/* Quick-select recent paths. */}
          {recent.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-2 pt-1 text-xs font-medium text-muted-foreground/70">
                {t("sidebar.workspaceFolderSelector.recent", "Recent")}
              </div>
              {recent.slice(0, 5).map((path) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => handleSelect(path)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                >
                  <FolderIcon className="size-3 shrink-0 opacity-60" />
                  <span className="truncate text-left">{basenameOfPath(path)}</span>
                  <span className="ml-auto truncate text-[10px] opacity-50">
                    {path}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Single-user default hint. */}
          {isSingleUser && defaultWorkspace && (
            <div className="px-2 pt-1 text-xs text-muted-foreground/60">
              {t(
                "sidebar.workspaceFolderSelector.defaultHint",
                "Default: {{path}}",
                { path: defaultWorkspace },
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
