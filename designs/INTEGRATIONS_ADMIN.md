# Integrations Admin Board — Design

> **Status:** Draft. Pre-implementation. v1 scope only.
> **Scope:** Three new admin-only settings pages (Harnesses, Skills, MCP
> servers) under `/settings/...`. Read-only views + deep-links to existing
> mutation surfaces. Zero new DB tables, zero new mutation routes.

## Motivation

The Admin group under Settings today has `Members` and `Policies` — both
are real CRUD surfaces. There is **no visibility** for the three things an
admin most often needs to reason about:

1. **Which vendor harness CLIs are installed and logged in on this
   server?** An admin running a shared deploy cannot answer this without
   SSH-ing into the box and running `meow setup`.
2. **Which skills are discoverable by my agents?** Skills are files on
   disk resolved from bundle dirs + per-harness host dirs. There is no
   view that says "your agents can see these N skills."
3. **Which MCP servers are declared by which agents?** MCP servers live
   inside agent bundles. There is no cross-agent view; the only way to
   find "which agent declares Sentry" is to open every agent.

This design adds those three views without changing the storage model:
harnesses stay built-in, skills stay files, MCP servers stay
bundle-declared.

## Non-goals (explicitly out of scope for v1)

- **No server-wide MCP registry (M2).** A first-class `mcp_servers` table
  that agents reference by name is a multi-week storage redesign with no
  demonstrated demand. The bundle-as-unit model is deliberate; splitting
  MCP servers out would compete with it. M2 belongs in a separate design
  doc when a real deploy asks for it.
- **No skill upload form.** Skills are directories with supporting files,
  not single files. An upload form is a security surface (arbitrary
  instruction execution) and doesn't match how skills are authored.
- **No `skillOverrides`-style per-skill visibility toggle.** agent-meow
  already has a gating mechanism (`block_skills` default policy). Adding
  a second one duplicates control. If Claude-Code-style per-skill
  visibility states are wanted later, they should *replace*
  `block_skills`, not sit alongside it.
- **No remote CLI install button.** Installing a vendor CLI on the server
  box from a browser is a footgun. The `meow setup` wizard is the right
  surface and remains so; the page surfaces a copy-paste command.

## Storage model (why this shape)

All three surfaces reuse existing primitives; nothing new is invented:

| Surface | Existing source of truth | Existing mutation surface |
|---|---|---|
| Harnesses | `harness_catalog()`, `harness_cli_installed()`, `harness_cli_logged_in()` (all in `agent_meow/harness_plugins.py` / `agent_meow/onboarding/harness_install.py`) | `meow setup` wizard (`_run_configure_harnesses_interactive` in `agent_meow/cli.py`) |
| Skills | `SkillSpec` from `<bundle>/skills/` + host dirs (`discover_host_skills` / per-harness `_SKILL_SOURCES` providers in `agent_meow/spec/skill_sources.py`) | Drop a `SKILL.md` on disk; OR add the skill name to the `block_skills` default policy (`agent_meow/policies/builtins/safety.py`) |
| MCP servers | `MCPServerConfig` declared inside each agent bundle (`agent_meow/spec/types.py:845`); per-session CRUD already wired (`/sessions/{id}/agent/mcp-servers`) | Per-session `useCreateMcpServer` / `useUpdateMcpServer` / `useDeleteMcpServer` in `web/src/hooks/useAgents.ts` |

This is the same pattern Claude Code uses (verified against
`code.claude.com/docs/en/skills` and `code.claude.com/docs/en/mcp`):
**files are the source of truth; admin control is visibility + gating,
not CRUD.** agent-meow already follows that pattern — this design just
surfaces it.

## Backend — three new admin-only routes

A new module `agent_meow/server/routes/admin_catalog.py` exposes three
read-only routes, all admin-gated via the existing
`_require_admin(request, auth_provider, permission_store)` helper used
by `default_policies.py:70`. The router is mounted under `/v1/admin/`
in `create_app` alongside the existing routers.

### `GET /v1/admin/harnesses`

Wraps `harness_catalog()` + `harness_cli_installed()` +
`harness_cli_logged_in()` + each entry's `HarnessInstallSpec` from
`_HARNESS_INSTALL`.

```python
{
  "object": "list",
  "data": [
    {
      "key": "claude-native",
      "display": "Claude",
      "binary": "claude",
      "install_status": "installed",        # "installed" | "missing"
      "login_status": "logged_in",          # "logged_in" | "logged_out" | "n/a"
      "install_command": "npm i -g @anthropic-ai/claude-code",
      "auth_hint": "run: claude auth login --claudeai",  # may be null
      "capabilities": {                       # HarnessCapabilities.as_dict()
        "integration_mode": "native-tui",
        "elicitation": "hook",
        "subagents": true,
        "streaming": true,
        ...
      }
    },
    ...
  ]
}
```

### `GET /v1/admin/skills`

Aggregates the resolver's two discovery paths:

1. **Bundle skills**: `agent_store.list()` → `agent_cache.load(...).spec.skills`
   for each built-in agent; group by `name`, recording `bundled_in_agents`.
2. **Host skills**: `discover_host_skills()` over the documented roots
   (`~/.claude/skills/`, `~/.codex/skills/`, `~/.cursor/skills/`,
   `~/.pi/skills/`, project `.claude/skills/`) via the per-harness
   `_SKILL_SOURCES` providers in `skill_sources.py`.

Then annotates each with whether any `block_skills` default policy lists
it in its `blocked` param:

```python
{
  "object": "list",
  "data": [
    {
      "name": "code-review",
      "description": "Review PRs for convention compliance.",
      "source": "bundle",                   # "bundle" | "host"
      "source_path": ".../skills/code-review",
      "bundled_in_agents": ["ag_abc"],     # empty for host skills
      "blocked": false,
      "blocked_by_policy": None             # policy name or null
    },
    ...
  ]
}
```

The `blocked` annotation reuses the existing default policy store
(`PolicyStore.list_defaults()` filtered to the `block_skills` handler).

### `GET /v1/admin/mcp-servers`

Walks every agent's spec.mcp_servers:

1. **Built-in agents** (`session_id IS NULL`): `agent_store.list()` →
   `agent_cache.load(...).spec.mcp_servers`.
2. **Session-scoped agents** (`session_id IS NOT NULL`): same, but each
   carries a session_id so the "Used by" link can deep-link into that
   session.

Groups by `(name, transport)`:

```python
{
  "object": "list",
  "data": [
    {
      "name": "scrapling",
      "transport": "stdio",                # "http" | "stdio"
      "url": None,                          # one of url/command is set
      "command": "scrapling mcp",
      "args": [],
      "description": "...",
      "used_by_agents": [
        {"id": "ag_abc", "name": "web-research-agent",
         "session_id": None, "session_scoped": false}
      ],
      "used_by_session_count": 0
    },
    ...
  ]
}
```

## Frontend — three new pages + nav wiring

Three new sibling pages under `web/src/pages/`, mirroring `PoliciesPage.tsx`'s
admin-gate + lazy-load + PageScroll pattern:

- `HarnessesPage.tsx` — flat list of harness rows (status glyph, name,
  binary, install/login status, capabilities summary, copy-able install
  command). Footer: copy `meow setup` command. No mutations.
- `SkillsPage.tsx` — flat list of skill rows (source icon 📦/📁, name,
  description, source path, `bundled_in` / `blocked by policy` badge with
  a deep-link to the Policies page). Footer: documents the three
  discovery paths. No mutations on the page; the only "block" action is
  the deep-link.
- `McpServersPage.tsx` — grouped list of MCP servers (name, transport,
  url/command summary, `used by N agents` with one `[edit →]` per agent
  that deep-links into the existing per-session agent edit flow).
  Footer: documents the per-session add path. Refresh button (matches
  `PoliciesPage`'s pattern — no auto-rescan).

A new hooks file `web/src/hooks/useAdminCatalog.ts` wraps the three
routes with TanStack Query (`useAdminHarnesses`, `useAdminSkills`,
`useAdminMcpServers`), each with a manual `refetch` for the Refresh
button where applicable.

Nav wiring in `web/src/shell/settingsNav.tsx`: the Admin group gains
three new siblings — `harnesses`, `skills`, `mcpServers` — matching the
existing `members` / `policies` pattern. The `SettingsSectionId` union
gains the three new ids; `SettingsPage.tsx`'s short-circuit for
`members` / `policies` is extended to cover them.

i18n keys added to `web/src/lib/locales/en.json` and `zh-CN.json`:
`settings.harnesses`, `settings.skills`, `settings.mcpServers`, plus
the per-page headers/descriptions/footers.

## "Add/remove" mapping (what each page routes to)

| Surface | "Add" | "Remove" |
|---|---|---|
| Harness | Copy `meow setup` command, run on host | Run `meow setup` → remove the harness |
| Skill | Drop a `SKILL.md` in a documented path (page footer shows which) | Delete the file, OR click `blocked by policy → manage` (deep-link into Policies → `block_skills`) |
| MCP server | Open the agent's session → Agent tab → Add MCP server (existing `useCreateMcpServer`) | Same → Delete (existing `useDeleteMcpServer`) |

Every mutation lands on a surface that already exists and is already
tested. The new pages only add visibility + navigation.

## Admin gating

All three backend routes use the existing `_require_admin` helper. All
three frontend pages use the existing `resolveIdentity()` +
`getCurrentIsAdmin()` gate (same as `MembersPage` / `PoliciesPage`). In
single-user mode (`permission_store is None`), the routes are
authenticated-only (no admin check), matching `default_policies.py`'s
behavior — same as the existing admin surfaces.

## Testing

Each backend route gets a focused test under
`tests/server/routes/test_admin_catalog.py`, mirroring
`test_default_policies.py`'s app/client fixture pattern (build a
`create_app` with the needed stores, hit the route, assert the shape +
the admin gate's 403 on non-admin). The skill/MCP aggregation tests use
the existing `tests/_fixtures/agents/` bundles and the existing
`tests/resources/agents/` test agents (which already carry bundled
skills and MCP declarations).

Each frontend page gets a colocated Vitest test mirroring
`PoliciesPage.test.tsx` (mock `resolveIdentity` + `getCurrentIsAdmin` +
the `useAdminCatalog` hooks; assert the rows render and the deep-links
point at the right paths). Per the repo's E2E UI requirement, a
Playwright test under `tests/e2e_ui/` covers the happy path of
navigating to each page as an admin and seeing the rows render.

## Effort & sequencing

| Piece | Effort | Shippable alone? |
|---|---|---|
| `admin_catalog.py` backend (3 routes) + tests | 1.5 days | ✅ (routes work, no UI yet) |
| `useAdminCatalog.ts` hooks | 0.25 day | depends on backend |
| `HarnessesPage.tsx` + test | 0.5 day | depends on hooks |
| `SkillsPage.tsx` + test | 0.75 day | depends on hooks |
| `McpServersPage.tsx` + test | 0.75 day | depends on hooks |
| Nav wiring + i18n | 0.25 day | depends on pages |
| Playwright e2e_ui happy path | 0.5 day | depends on pages |
| **Total** | **~4.5 days** | |

Each page is independently shippable after the backend lands. The
recommended order: Harnesses (simplest, lowest risk) → Skills → MCP
servers (most aggregation logic).

## Open questions deferred to M2 / later

- **Server-wide MCP registration (M2)** — separate design doc when
  demand appears. Would require a bundle→reference migration.
- **Per-skill visibility states (Claude-Code `skillOverrides`)** —
  would replace `block_skills`, not sit alongside it. Defer until
  there's a reason to migrate.
- **MCP server template library** (read-only catalog of recommended
  servers with one-click "add to this agent" pre-filling the per-session
  form) — a possible v1.1 enhancement; ~1 day on top of M1. Not in v1.

## Self-review checklist

- [ ] Backend: 3 routes, all admin-gated, all read-only.
- [ ] Frontend: 3 pages, all admin-gated, all read-only on their own surface.
- [ ] No new DB tables.
- [ ] No new mutation routes.
- [ ] Every "add/remove" lands on an existing tested surface.
- [ ] i18n keys for all three nav items + page copy.
- [ ] Backend tests under `tests/server/routes/test_admin_catalog.py`.
- [ ] Frontend colocated tests for each page.
- [ ] Playwright e2e_ui happy path for each page.