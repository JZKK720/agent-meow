// FileTagFilter — tag-chip filter bar for the FilesPanel.
//
// Shows all unique tags with file counts. Clicking a chip toggles it
// as a filter. Selected chips are highlighted. Includes an "Analyze"
// button that sends a chat message to the agent, asking it to analyze
// workspace images using the image_analyze tool. The agent uses its
// vision capability to classify images, then calls image_analyze to
// persist tags. After the agent responds, the tags query refreshes.

import { useFileTags, useAnalyzeFiles } from "@/hooks/useFileTags";
import { cn } from "@/lib/utils";
import { SparklesIcon, XIcon } from "lucide-react";

interface FileTagFilterProps {
  conversationId: string;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export function FileTagFilter({
  conversationId,
  selectedTags,
  onTagToggle,
}: FileTagFilterProps) {
  const { data, isLoading } = useFileTags(conversationId);
  const { analyze, isPending } = useAnalyzeFiles();

  const tags = data?.tags ?? [];

  const handleAnalyze = () => {
    analyze(conversationId);
  };

  if (isLoading) {
    return (
      <div className="px-2 py-1.5 text-xs text-muted-foreground">
        Loading tags...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 border-b border-border px-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          Tags
        </span>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isPending}
          className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20 disabled:opacity-50"
          title="Ask the agent to classify workspace images with its vision model"
        >
          <SparklesIcon className="size-3" />
          {isPending ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {tags.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No tags yet. Click "Analyze" to ask the agent to classify images.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => {
            const selected = selectedTags.includes(t.tag);
            return (
              <button
                key={t.tag}
                type="button"
                data-selected={selected}
                onClick={() => onTagToggle(t.tag)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                <span>{t.tag}</span>
                <span className="opacity-60">{t.count}</span>
                {selected && <XIcon className="size-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
