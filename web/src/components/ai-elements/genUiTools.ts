/**
 * Bridge between OpenUI Lang `Query()`/`Mutation()` calls and the
 * agent-meow server's own REST endpoints.
 *
 * The Renderer accepts a `toolProvider` ({ callTool(name, args) }) and
 * invokes it whenever generated UI references a tool. We map a small,
 * fixed allowlist of tool names to same-origin `/v1` GET endpoints —
 * the browser is already authenticated against this server, so no
 * extra auth handling is needed and no third-party host is ever
 * contacted.
 *
 * Tool names are the identifiers agents write inside `Query("name")` /
 * `Mutation("name")` in ```openui blocks. Keep this list in sync with
 * the `_GENUI_INSTRUCTIONS` prompt section in
 * `agent_meow/runtime/prompt.py`.
 */

/** Same-origin GET endpoints exposed to generated UI. */
const GENUI_TOOLS: Record<string, string> = {
  // Session list (cursor-paginated; args.limit maps to the query param).
  list_sessions: "/v1/sessions?limit={limit}",
  // Host inventory (online/offline runners).
  list_hosts: "/v1/hosts",
  // Aggregate stack health (hermes, ollama, tts, whisper...).
  stack_status: "/v1/stack/status",
  // Session project names (alphabetical).
  list_projects: "/v1/sessions/projects",
};

/** Default value for {limit} placeholders. */
const DEFAULT_LIMIT = 20;

function resolveUrl(template: string, args: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = args[key];
    return value === undefined || value === null ? String(DEFAULT_LIMIT) : encodeURIComponent(String(value));
  });
}

/**
 * Build the toolProvider for the OpenUI Renderer. Returns null when the
 * browser has no fetchable origin (SSR/tests) —the Renderer treats a
 * null provider as "no tools available" and renders Query() placeholders.
 */
export function createGenUiToolProvider(): {
  callTool: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
} | null {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return null;
  }

  return {
    async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
      const template = GENUI_TOOLS[toolName];
      if (!template) {
        throw new Error(
          `Unknown genui tool "${toolName}". Available: ${Object.keys(GENUI_TOOLS).join(", ")}`,
        );
      }
      const response = await fetch(resolveUrl(template, args), {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      if (!response.ok) {
        throw new Error(`genui tool "${toolName}" failed: HTTP ${response.status}`);
      }
      return response.json();
    },
  };
}

/**
 * Handle built-in actions from generated UI. OpenUrl goes through
 * window.open (the Electron popup policy routes it to the system
 * browser); ContinueConversation is surfaced to the caller so the chat
 * shell can append a user message.
 */
export function handleGenUiAction(
  event: { type: string; params: Record<string, unknown> },
  onContinue?: (message: string) => void,
): void {
  if (event.type === "open_url") {
    const url = event.params.url;
    if (typeof url === "string" && /^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return;
  }
  if (event.type === "continue_conversation" && onContinue) {
    const message = event.params.message ?? event.humanFriendlyMessage ?? "";
    if (typeof message === "string" && message) {
      onContinue(message);
    }
  }
}
