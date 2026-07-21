/**
 * Admin MCP servers catalog (``/settings/mcp-servers``). Rendered as a Settings
 * sub-category, sibling to Members / Policies / Harnesses / Skills.
 *
 * Read-only cross-agent view of every MCP server declared by every template
 * (built-in) agent, grouped by ``(name, transport)``. Each card shows the
 * transport summary (``url`` for http, ``command`` for stdio) and the list of
 * agents that declare it, each as a link into the per-session agent edit
 * flow that already has ``useCreateMcpServer`` / ``useDeleteMcpServer`` wired.
 *
 * Server-wide MCP registration (M2) is deliberately out of scope — the
 * bundle-as-unit storage model is the right place for per-agent MCP, and the
 * catalog routes edits to the per-session surface that already exists. See
 * ``designs/INTEGRATIONS_ADMIN.md``.
 *
 * Self-gates to admins via ``resolveIdentity`` / ``getCurrentIsAdmin`` (same
 * pattern as the other admin pages; works under OIDC too). The server route
 * also admin-gates, so the client gate is UX only.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlugIcon, RefreshCwIcon } from "lucide-react";
import { PageScroll } from "@/components/PageScroll";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/routing";
import {
  useAdminMcpServers,
  type McpCatalogEntry,
  type McpCatalogAgentRef,
} from "@/hooks/useAdminCatalog";
import { getCurrentIsAdmin, resolveIdentity } from "@/lib/identity";

export function McpServersPage() {
  const { t } = useTranslation();
  const [meIsAdmin, setMeIsAdmin] = useState<boolean | null>(null);
  const { data: servers = [], refetch } = useAdminMcpServers();

  // Admin probe via the mode-agnostic ``/v1/me`` identity (works under OIDC
  // too). resolveIdentity handles the login redirect when unauthenticated.
  useEffect(() => {
    void (async () => {
      const userId = await resolveIdentity();
      if (userId === null) return;
      setMeIsAdmin(getCurrentIsAdmin());
    })();
  }, []);

  if (meIsAdmin === null) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (meIsAdmin === false) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="mb-2 text-2xl font-semibold">{t("mcpServers.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("mcpServers.noPermission")}</p>
      </div>
    );
  }

  return (
    <PageScroll contentClassName="px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("mcpServers.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("mcpServers.description")}</p>
      </div>

      {servers.length > 0 && (
        <div className="flex flex-col gap-3">
          {servers.map((s) => (
            <McpServerCard key={`${s.transport}:${s.name}`} server={s} t={t} />
          ))}
        </div>
      )}

      {servers.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("mcpServers.noneConfigured")}</p>
      )}

      <div className="mt-3 flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => void refetch()}>
          <RefreshCwIcon /> {t("mcpServers.refresh")}
        </Button>
      </div>

      <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium">{t("mcpServers.addFooter")}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {t("mcpServers.addFooterStep")}
        </p>
      </div>
    </PageScroll>
  );
}

function McpServerCard({
  server,
  t,
}: {
  server: McpCatalogEntry;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const summary =
    server.transport === "http" ? (server.url ?? "") : (server.command ?? "");
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PlugIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium">{server.name}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {server.transport}
            </span>
          </div>
          {summary && (
            <code className="mt-1 block truncate text-[11px] text-muted-foreground">
              {summary}
            </code>
          )}
          {server.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{server.description}</p>
          )}
        </div>
      </div>
      {server.used_by_agents.length > 0 && (
        <div className="mt-3 border-t border-border/60 pt-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {t("mcpServers.usedBy", { count: server.used_by_agents.length })}
          </p>
          <div className="mt-1 flex flex-col gap-0.5">
            {server.used_by_agents.map((agent) => (
              <AgentRef key={agent.id} agent={agent} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentRef({
  agent,
  t,
}: {
  agent: McpCatalogAgentRef;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  // Session-scoped agents deep-link into the per-session agent edit flow that
  // already has useCreateMcpServer / useDeleteMcpServer wired. Built-in
  // (template) agents have no session yet — link to the new-session picker.
  const target = agent.session_id ? `/?agent=${agent.id}` : `/?agent=${agent.id}`;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">•</span>
      <Link
        to={target}
        className="text-foreground/80 hover:text-foreground underline-offset-2 hover:underline"
      >
        {agent.name}
      </Link>
      <span className="text-[10px] text-muted-foreground/60">
        {agent.session_scoped ? t("mcpServers.sessionScoped") : t("mcpServers.builtIn")}
      </span>
    </div>
  );
}