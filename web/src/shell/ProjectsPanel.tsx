// ProjectsPanel — the right-side rail tab for the agent-meow Projects surface.
// Mirrors DocsPanel.tsx structure: a list of session projects with a
// new-project button. Each project shows name, description, and status.

import { FolderKanbanIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from "@/hooks/useProjects";
import { useTranslation } from "react-i18next";

interface ProjectsPanelProps {
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

/** Format an epoch-second timestamp as a short relative date. */
function formatRelativeDate(epochSeconds: number): string {
  if (!epochSeconds) return "";
  const d = new Date(epochSeconds * 1000);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  archived: "bg-amber-500",
  completed: "bg-blue-500",
};

export function ProjectsPanel({
  onClose,
  frameless,
}: ProjectsPanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: projects, isLoading, error } = useProjects(conversationId);
  const createProject = useCreateProject(conversationId);
  const deleteProject = useDeleteProject(conversationId);

  function handleNewProject() {
    createProject.mutate({ name: t("projects.untitled") });
  }

  function handleDelete(projectId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t("projects.deleteConfirm"))) {
      deleteProject.mutate(projectId);
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        frameless ? "" : "rounded-lg border border-border bg-card",
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <FolderKanbanIcon className="size-4 text-muted-foreground" />
          <span>{t("projects.title")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("projects.newProject")}
            onClick={handleNewProject}
            disabled={createProject.isPending}
          >
            <PlusIcon className="size-4" />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("projects.closePanel")}
              onClick={onClose}
            >
              <span className="text-lg leading-none">&times;</span>
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {t("projects.loadFailed")}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <FolderKanbanIcon className="size-8 opacity-40" />
            <p>{t("projects.noProjects")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNewProject}
              disabled={createProject.isPending}
            >
              <PlusIcon className="size-4" /> {t("projects.newProject")}
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {projects.map((proj) => (
              <li
                key={proj.id}
                className="group relative flex items-start gap-3 px-3 py-3 hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    STATUS_COLORS[proj.status] ?? "bg-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {proj.name}
                  </div>
                  {proj.description && (
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {proj.description}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{proj.status}</span>
                    <span>&middot;</span>
                    <span>{formatRelativeDate(proj.updatedAt)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={t("common.delete")}
                  className="relative z-10 shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={(e) => handleDelete(proj.id, e)}
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}