import { useState } from "react";

import { Loader2Icon, PlayIcon, SquareXIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  runPythonInPyodide,
  type PyodideRunState,
} from "./pyodideRunner";

/**
 * Run button + output panel for Python file previews. Renders above the
 * source view; the output panel appears below the button once a run
 * starts. The Pyodide runtime is fetched only on first Run click.
 */
export function PythonRunPanel({ code }: { code: string }) {
  const [state, setState] = useState<PyodideRunState>({ status: "idle" });

  const run = () => {
    if (state.status === "loading" || state.status === "running") return;
    void runPythonInPyodide(code, setState);
  };

  const busy = state.status === "loading" || state.status === "running";

  return (
    <div className="flex flex-col gap-2 border-b border-border/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy}
          aria-label="Run Python in browser"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            busy
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/70",
          )}
        >
          {state.status === "loading" ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : state.status === "running" ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <PlayIcon className="size-3.5" />
          )}
          {state.status === "loading"
            ? "Loading Python…"
            : state.status === "running"
              ? "Running…"
              : "Run"}
        </button>
        {state.status === "done" && (
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            aria-label="Clear output"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          >
            <SquareXIcon className="size-3.5" />
            Clear
          </button>
        )}
        <span className="text-xs text-muted-foreground">
          Runs in your browser via Pyodide — no server, no native packages
        </span>
      </div>
      {state.status === "done" && (state.output || state.error) && (
        <div
          data-testid="pyodide-output"
          className="max-h-64 overflow-auto rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-xs leading-relaxed"
        >
          {state.output && <pre className="whitespace-pre-wrap">{state.output}</pre>}
          {state.error && (
            <pre className="mt-1 whitespace-pre-wrap text-destructive">{state.error}</pre>
          )}
        </div>
      )}
    </div>
  );
}
