import { Component, lazy, Suspense, type ReactNode } from "react";

import { createGenUiToolProvider, handleGenUiAction } from "./genUiTools";

// Lazy-load the OpenUI Lang runtime (~parser + renderer) so it's only
// fetched when a message actually contains an ```openui fenced block.
// Regular prose-only chats never pay for it.
const OpenUIRenderer = lazy(async () => {
  const [{ Renderer }, { openuiLibrary }] = await Promise.all([
    import("@openuidev/react-lang"),
    import("@openuidev/react-ui"),
  ]);
  const rawProvider = createGenUiToolProvider();
  // Adapt our simple { callTool(name, args) } to the Renderer's McpClientLike
  // shape: callTool(params: { name, arguments? }, options?) => { content: [...] }.
  const toolProvider = rawProvider === null ? null : {
    callTool: async (
      params: { name: string; arguments?: Record<string, unknown> },
      _options?: unknown,
    ) => {
      const result = await rawProvider.callTool(params.name, params.arguments ?? {});
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    },
  };
  const Component = ({ code }: { code: string }) => (
    <Renderer
      library={openuiLibrary}
      response={code}
      isStreaming={false}
      {...(toolProvider !== null ? { toolProvider } : {})}
      onAction={(event) => handleGenUiAction(event)}
    />
  );
  return { default: Component };
});

/**
 * Render an ```openui fenced block as live UI via the OpenUI Lang
 * runtime. Falls back to a plain code block if parsing fails entirely —
 * the DSL is designed to render partial output, but a hard failure
 * should never lose the source.
 */
export function OpenUIBlock({ code }: { code: string }) {
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border/60">
      <Suspense
        fallback={
          <div className="flex min-h-24 items-center justify-center bg-muted/40 text-sm text-muted-foreground">
            Loading interactive UI…
          </div>
        }
      >
        <OpenUIErrorBoundary code={code} />
      </Suspense>
    </div>
  );
}

/** Catch renderer crashes and show the raw DSL instead of blank space. */
class OpenUIErrorBoundary extends Component<
  { code: string; children?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <pre className="overflow-auto bg-muted/40 p-4 text-xs leading-relaxed">
          <code>{this.props.code}</code>
        </pre>
      );
    }
    return <OpenUIRenderer code={this.props.code} />;
  }
}
