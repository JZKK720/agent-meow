// SnippetsPanel — the right-side rail tab for the agent-meow Code Snippets surface.
// Mirrors DocsPanel.tsx structure: a list of session code snippets with a
// new-snippet button. Each snippet shows title, language, and tags.

import { CodeIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useCreateSnippet,
  useDeleteSnippet,
  useSnippets,
} from "@/hooks/useSnippets";
import { useTranslation } from "react-i18next";

interface SnippetsPanelProps {
  /** Called when a snippet is selected for viewing/editing. */
  onSnippetSelect?: (snippetId: string) => void;
  /** Currently selected snippet id, or null. */
  selectedSnippetId?: string | null;
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

export function SnippetsPanel({
  onSnippetSelect,
  selectedSnippetId,
  onClose,
  frameless,
}: SnippetsPanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: snippets, isLoading, error } = useSnippets(conversationId);
  const createSnippet = useCreateSnippet(conversationId);
  const deleteSnippet = useDeleteSnippet(conversationId);
  const [searchQuery, setSearchQuery] = useState("");

  function handleNewSnippet() {
    createSnippet.mutate(
      { title: t("snippets.untitled", "Untitled"), language: "text", code: "" },
      {
        onSuccess: (snippet) => {
          onSnippetSelect?.(snippet.id);
        },
      },
    );
  }

  function handleDelete(snippetId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t("snippets.deleteConfirm", "Delete this snippet?"))) {
      deleteSnippet.mutate(snippetId);
    }
  }

  // Client-side filter for the search box (server-side search is also
  // available via the snippet_search tool, but the panel does a simple
  // client-side filter for instant feedback).
  const filtered = searchQuery
    ? snippets?.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : snippets;

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
          <CodeIcon className="size-4 text-muted-foreground" />
          <span>{t("snippets.title", "Snippets")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("snippets.newSnippet", "New snippet")}
            onClick={handleNewSnippet}
            disabled={createSnippet.isPending}
          >
            <PlusIcon className="size-4" />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("snippets.closePanel", "Close")}
              onClick={onClose}
            >
              <span className="text-lg leading-none">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {snippets && snippets.length > 0 && (
        <div className="shrink-0 border-b border-border px-3 py-1.5">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("snippets.searchPlaceholder", "Search snippets...")}
              className="h-7 pl-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("common.loading", "Loading...")}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {t("snippets.loadFailed", "Failed to load snippets")}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <CodeIcon className="size-8 opacity-40" />
            <p>
              {searchQuery
                ? t("snippets.noResults", "No matching snippets")
                : t("snippets.noSnippets", "No snippets yet")}
            </p>
            {!searchQuery && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNewSnippet}
                disabled={createSnippet.isPending}
              >
                <PlusIcon className="size-4" /> {t("snippets.newSnippet", "New snippet")}
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((snippet) => (
              <li
                key={snippet.id}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-2 hover:bg-muted/50",
                  selectedSnippetId === snippet.id && "bg-muted",
                )}
              >
                <button
                  type="button"
                  className="absolute inset-0 cursor-pointer"
                  aria-label={`Open ${snippet.title}`}
                  onClick={() => onSnippetSelect?.(snippet.id)}
                />
                <CodeIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">{snippet.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {snippet.language !== "text" && (
                      <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono">
                        {snippet.language}
                      </span>
                    )}
                    <span>{formatRelativeDate(snippet.updatedAt)}</span>
                  </div>
                  {snippet.tags && (
                    <div className="truncate text-xs text-muted-foreground">{snippet.tags}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="relative z-10 shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={t("snippets.delete", "Delete")}
                  onClick={(e) => handleDelete(snippet.id, e)}
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