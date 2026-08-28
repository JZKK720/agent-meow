// SharedFolderSelector — a compact folder-path input + scan button for
// the Files panel header. Lets the user pick a local path as the
// dedicated file folder for agent-meow, then scan it for files.
//
// Reuses useRecentWorkspaces (localStorage recents) and the existing
// useScanWorkspace mutation hook. The path is persisted via
// sharedFolderPreferences (localStorage, never throws).
//
// Design: shadcn/ui + Tailwind v4, no custom modals or gradient buttons.
// Accessible: proper aria-label on the scan button, descriptive text
// on the path input.

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderOpenIcon, RefreshCwIcon } from "lucide-react";
import { useScanWorkspace } from "@/hooks/useScanWorkspace";
import { useHosts } from "@/hooks/useHosts";
import { useRecentWorkspaces } from "@/hooks/useRecentWorkspaces";
import { readSharedFolderPath, writeSharedFolderPath } from "@/lib/sharedFolderPreferences";
import { basenameOfPath } from "@/lib/hostPaths";
import { cn } from "@/lib/utils";

interface SharedFolderSelectorProps {
  /** Session/conversation id for the scan-workspace call. */
  conversationId: string;
}

/**
 * Compact folder-path selector + scan button for the Files panel header.
 *
 * Shows a text input pre-filled with the last-selected shared folder
 * (or the most-recent workspace), a dropdown of recent paths, and a
 * "Scan now" button that triggers useScanWorkspace.
 *
 * NOTE: The scan-workspace endpoint reads from conv.workspace server-side.
 * The path input persists the user's preference (localStorage) and records
 * it in recents, but does NOT update conv.workspace on the server (that
 * requires adding a workspace field to PATCH /v1/sessions/{id}, which is
 * a future backend change). The scan uses the session's existing workspace.
 * The path input serves as a quick-access record of recently used folders.
 */
export function SharedFolderSelector({ conversationId }: SharedFolderSelectorProps) {
  const { t } = useTranslation();
  const { data: hosts } = useHosts();
  const localHost = hosts?.find((h) => h.status === "online") ?? hosts?.[0] ?? null;
  const localHostId = localHost?.host_id ?? null;
  const { recent, addRecent } = useRecentWorkspaces(localHostId);
  const scan = useScanWorkspace();

  const [path, setPath] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  // Seed from localStorage on mount.
  useEffect(() => {
    const stored = readSharedFolderPath();
    if (stored) {
      setPath(stored);
    } else if (recent.length > 0) {
      setPath(recent[0]);
    }
  }, [recent]);

  const handleScan = useCallback(() => {
    const trimmed = path.trim();
    if (!trimmed || !conversationId) return;
    addRecent(trimmed);
    writeSharedFolderPath(trimmed);
    setResultMsg(null);
    scan.mutate(
      { conversationId },
      {
        onSuccess: (data) => {
          const parts: string[] = [];
          if (data.importedDocs > 0)
            parts.push(`${data.importedDocs} ${data.importedDocs > 1 ? "docs" : "doc"}`);
          if (data.importedImages > 0)
            parts.push(`${data.importedImages} ${data.importedImages > 1 ? "images" : "image"}`);
          if (data.importedVideos > 0)
            parts.push(`${data.importedVideos} ${data.importedVideos > 1 ? "videos" : "video"}`);
          if (data.skipped > 0) parts.push(`${data.skipped} skipped`);
          setResultMsg(
            parts.length > 0
              ? parts.join(" · ")
              : t("workspace.scanComplete", "No new files"),
          );
        },
        onError: (err) => {
          setResultMsg(t("workspace.scanFailed", `Error: ${err.message}`));
        },
      },
    );
  }, [path, conversationId, addRecent, scan, t]);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {/* Folder-path input with recent-paths dropdown */}
      <div className="relative flex min-w-0 flex-1 items-center">
        <FolderOpenIcon className="mr-1 size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onFocus={() => setShowRecent(true)}
          onBlur={() => setTimeout(() => setShowRecent(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleScan();
          }}
          aria-label={t("workspace.sharedFolderPath", "Workspace folder path")}
          placeholder={t("workspace.sharedFolderPlaceholder", "Pick a local folder…")}
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-0.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          data-testid="shared-folder-path-input"
        />
        {showRecent && recent.length > 0 && (
          <div
            className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-md"
            data-testid="shared-folder-recent-dropdown"
          >
            <div className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70">
              {t("workspace.recent", "Recent")}
            </div>
            {recent.slice(0, 6).map((r) => (
              <button
                key={r}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setPath(r);
                  setShowRecent(false);
                }}
                className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] hover:bg-muted"
              >
                <FolderOpenIcon className="size-3 shrink-0 opacity-60" />
                <span className="truncate">{basenameOfPath(r)}</span>
                <span className="ml-auto truncate text-[9px] opacity-50">{r}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Scan now button */}
      <button
        type="button"
        onClick={handleScan}
        disabled={scan.isPending || !path.trim() || !conversationId}
        aria-label={t("workspace.scanWorkspace", "Scan Workspace")}
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
        )}
        data-testid="shared-folder-scan-button"
      >
        <RefreshCwIcon className={cn("size-3.5", scan.isPending && "animate-spin")} />
        {scan.isPending
          ? t("workspace.scanning", "Scanning…")
          : t("workspace.scanWorkspace", "Scan")}
      </button>
      {resultMsg && (
        <span className="shrink-0 text-[10px] text-muted-foreground">{resultMsg}</span>
      )}
    </div>
  );
}
