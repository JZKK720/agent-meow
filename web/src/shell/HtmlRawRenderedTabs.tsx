import { useState } from "react";

import { cn } from "@/lib/utils";
import { CodeIcon, EyeIcon } from "lucide-react";

/**
 * Raw/Rendered tabbed split for HTML artifacts, ported from OpenUI's
 * html-artifact pattern. "Rendered" shows the live sandboxed preview
 * (the existing HtmlCommentViewer); "Raw" shows the HTML source in a
 * read-only pre block. State is local to the viewer — switching files
 * or closing the panel resets to Rendered, which is the common case.
 */
export function HtmlRawRenderedTabs({
  rendered,
  raw,
  truncated,
}: {
  /** The live preview element (HtmlCommentViewer). */
  rendered: React.ReactNode;
  /** The raw HTML source text. */
  raw: string;
  truncated: boolean;
}) {
  const [tab, setTab] = useState<"rendered" | "raw">("rendered");

  return (
    <div className="flex h-full flex-col">
      <div
        role="tablist"
        aria-label="HTML artifact view"
        className="flex items-center gap-1 border-b border-border/60 px-2 py-1"
      >
        <TabButton
          active={tab === "rendered"}
          onClick={() => setTab("rendered")}
          icon={<EyeIcon className="size-3.5" />}
          label="Rendered"
        />
        <TabButton
          active={tab === "raw"}
          onClick={() => setTab("raw")}
          icon={<CodeIcon className="size-3.5" />}
          label="Raw"
        />
        {truncated && tab === "raw" && (
          <span className="ml-2 text-xs text-muted-foreground">
            Showing first part of a large file
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "rendered" ? (
          rendered
        ) : (
          <pre
            data-testid="html-raw-source"
            className="h-full overflow-auto bg-muted/30 p-4 text-xs leading-relaxed"
          >
            <code>{raw}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
