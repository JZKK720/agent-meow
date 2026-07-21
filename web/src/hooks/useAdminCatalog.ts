// TanStack Query wrappers for the admin catalog routes
// (``/v1/admin/harnesses|skills|mcp-servers``). All three are admin-gated
// read-only views surfaced by the integrations admin board. See
// ``designs/INTEGRATIONS_ADMIN.md``.
//
// Mirrors the shape of ``useDefaultPolicies`` (one ``useQuery`` per route,
// ``authenticatedFetch`` from ``@/lib/identity`` per the oxlint no-bare-fetch
// rule). The backend groups/annotates server-side, so the frontend types are
// plain projections — no client-side aggregation.

import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/identity";

export interface HarnessAdminEntry {
  /** Harness id, e.g. ``"claude-sdk"`` / ``"codex"`` / ``"pi"``. */
  id: string;
  /** Display label, e.g. ``"Claude SDK"`` / ``"Codex"`` / ``"Pi"``. */
  label: string;
  /** Required CLI binary, e.g. ``"claude"``; ``null`` for SDK harnesses. */
  binary: string | null;
  install_status: "installed" | "missing";
  login_status: "logged_in" | "logged_out" | "n/a";
  /** Copy-pasteable install command, or ``null`` for SDK harnesses. */
  install_command: string | null;
  /** Optional auth hint, e.g. ``"run: claude auth login --claudeai"``. */
  auth_hint: string | null;
  /** Declared feature set (see ``HarnessCapabilities.as_dict``). */
  capabilities: Record<string, unknown>;
}

export interface SkillAdminEntry {
  /** Lowercase kebab-case skill name. */
  name: string;
  /** One-line summary from the SKILL.md frontmatter. */
  description: string;
  source: "bundle" | "host";
  /** Absolute path to the skill directory, or ``null`` when unknown. */
  source_path: string | null;
  /** Agent ids that bundle this skill (empty for host skills). */
  bundled_in_agents: string[];
  /** Whether a ``block_skills`` default policy lists this skill. */
  blocked: boolean;
  /** Name of the blocking default policy, or ``null`` when not blocked. */
  blocked_by_policy: string | null;
}

export interface McpCatalogAgentRef {
  /** Agent id, e.g. ``"ag_abc123"``. */
  id: string;
  /** Agent display name, e.g. ``"web-research-agent"``. */
  name: string;
  /** Owning session id for session-scoped agents, or ``null`` for built-ins. */
  session_id: string | null;
  /** ``false`` for template (built-in) agents; ``true`` for session-scoped. */
  session_scoped: boolean;
}

export interface McpCatalogEntry {
  /** MCP server name, unique within an agent's spec. */
  name: string;
  transport: "http" | "stdio";
  /** HTTP/SSE endpoint URL; ``null`` for ``stdio`` servers. */
  url: string | null;
  /** Spawned executable; ``null`` for ``http`` servers. */
  command: string | null;
  /** Arguments passed to ``command`` (empty for ``http`` servers). */
  args: string[];
  /** Optional human-readable summary, or ``null``. */
  description: string | null;
  /** Agents that declare this server (built-ins today; session-scoped is
   *  out of scope for the catalog route — see the backend docstring). */
  used_by_agents: McpCatalogAgentRef[];
  /** Count of session-scoped agents using this server (always 0 for the
   *  template-only walk the backend does today). */
  used_by_session_count: number;
}

interface CatalogListResponse<T> {
  object: "list";
  data: T[];
}

async function fetchCatalog<T>(path: string): Promise<T[]> {
  const res = await authenticatedFetch(path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const body = (await res.json()) as CatalogListResponse<T>;
  return body.data;
}

/** Fetch the built-in harness catalog with install + login status. */
export function useAdminHarnesses() {
  return useQuery({
    queryKey: ["admin-harnesses"],
    queryFn: () => fetchCatalog<HarnessAdminEntry>("/v1/admin/harnesses"),
    staleTime: 30_000,
  });
}

/** Fetch every discoverable skill across bundles + host dirs. */
export function useAdminSkills() {
  return useQuery({
    queryKey: ["admin-skills"],
    queryFn: () => fetchCatalog<SkillAdminEntry>("/v1/admin/skills"),
    staleTime: 30_000,
  });
}

/** Fetch every MCP server declared across template agents, grouped by name. */
export function useAdminMcpServers() {
  return useQuery({
    queryKey: ["admin-mcp-servers"],
    queryFn: () => fetchCatalog<McpCatalogEntry>("/v1/admin/mcp-servers"),
    staleTime: 30_000,
  });
}