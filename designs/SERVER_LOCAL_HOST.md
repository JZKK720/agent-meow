# Server Self-Registers a Local Host on Startup (agent-meow 1.0)

**Status:** Approved design (pending implementation plan)
**Date:** 2026-07-29
**Scope:** agent-meow 1.0 — local, single-user, packaged app. Multi-user /
bootstrap-account model is a documented 2.0 migration (§7).
**Mode gate:** "local single-user mode" below means the server's existing
`agent_meow.server.auth.local_single_user_enabled()` returns `True` (the
`OMNIGENT_LOCAL_SINGLE_USER` marker, `server/auth.py:205`). Deployed multi-user
servers never set it, so the self-host path stays fail-closed there.
**Origin:** discovered while auditing the new-chat landing surface
(`.hallmark/audit.md`) — the "Connect a host to get started" CTA
(`web/src/shell/NewChatDialog.tsx:4289`, `data-testid="new-chat-landing-no-hosts-cta"`)
appears whenever a browser reaches a server that has no registered host. In the
packaged app there is no CLI to spawn that host, so the server must provide it.

---

## 1. Problem

A "host" in agent-meow is a **separate OS process**
(`agent_meow/host/_daemon_entry.py`, implementation in
`agent_meow/host/connect.py`) that connects out to the server over a WebSocket
tunnel, registers via a `host.hello` frame, and spawns runners on demand. Today
that process is spawned **only by the CLI**
(`agent_meow/cli.py::_ensure_host_daemon`, ~line 2610). The FastAPI server
(`agent_meow/server/app.py::_lifespan`) starts the harness/runner infrastructure
but **never** spawns a host.

Consequence: a browser that opens a server with no host daemon sees
`allHosts.length === 0` → the landing renders the "Connect a host" CTA and the
submit button is disabled. For the 1.0 packaged app — CLI/host built-in, ready
to use, no terminal — there is no CLI step, so the server must self-provide a
local host so the browser lands ready.

## 2. Goal & non-goals

**Goal.** When the packaged 1.0 server boots in local single-user mode, a
browser landing on it finds a ready, registered local host — no CTA, no CLI,
zero setup.

**In scope (1.0):**
- Server spawns + supervises + terminates the existing host daemon as a child
  process on startup/shutdown.
- A startup-issued, in-memory, loopback-only host-registration token as the
  credential (§4).
- Local single-user mode only.
- Lazy harness readiness (Hermes resolves as it does today; nothing is
  pre-marked).

**Out of scope (1.0):**
- Multi-user / bootstrap-account model (**2.0**, §7).
- Host auto-respawn after a mid-run crash (1.x/2.0 follow-up, §6).
- Pre-marking Hermes (or any harness) ready.
- Remote/multi-user server self-host.
- The existing CTA — it stays as the fallback when no host is available.

## 3. Architecture (Option A — server adopts the CLI's spawn-and-supervise role)

The server does on startup what the CLI already does: spawn the **existing**
host daemon as a supervised child, pointed at the server's own loopback URL.

Startup (in `server/app.py::_lifespan`, after harness/runner infra starts, only
when `local_single_user_enabled()` is `True`):

1. Mint a single-use, loopback-only host-registration token `T` (in-memory).
2. Spawn `sys.executable -m agent_meow.host._daemon_entry --local` as a child,
   passing `T` via the `OMNIGENT_LOCAL_HOST_TOKEN` env var and the loopback URL.
3. Track the child handle for teardown.

Shutdown (lifespan teardown): terminate the child with a grace period, matching
the CLI's existing host-daemon teardown semantics.

**Why Option A over the alternatives:**
- **B (in-process asyncio task):** couples host and server lifetimes — a host
  crash/hang can take the server down, and the host's reconnect/backoff and
  orphan-reaper logic would run inside the server's event loop. Rejected.
- **C (in-process virtual host, no tunnel):** re-implements the host's
  server-side contract (launch/status/exit frames) inside the server — a
  permanent parallel code path that must be kept in sync with the real host.
  Rejected.

Option A reuses all tested host code unchanged and keeps clean failure
isolation (a host crash cannot kill the server).

## 4. The scoped loopback credential (1.0 trust model)

Whether the local host needs a credential at all depends on the spawned
server's auth mode (`resolve_auth_source()`, `host/local_server.py:628`):

- **No-auth single-user mode** (header/oidc source, no `auth_provider`): the
  host tunnel already accepts the connection as `RESERVED_USER_LOCAL`
  (`server/routes/host_tunnel.py:186-190`). **No token needed** — the existing
  behavior is sufficient; the server just spawns the host.
- **Accounts mode** (the OSS default): an `auth_provider` is active, so the
  host must present a credential. Here the server **reuses the existing
  managed-host launch-token machinery** rather than inventing a parallel
  validator.

Reusing the managed-host machinery (accounts mode):

- At startup, **before** spawning the child, the server calls the existing
  `HostStore.register_managed_host(host_id, name, user_id=RESERVED_USER_LOCAL,
  token=T, provider="local", sandbox_id="local", token_expires_at=<startup+TTL>)`
  (`stores/host_store.py:643`). This pre-registers the local host row offline
  with a hashed credential.
- `T = secrets.token_urlsafe(32)`, generated at startup, held only in memory
  and passed to the child via the **existing** `OMNIGENT_HOST_TOKEN` env var
  (`host/identity.py:HOST_TOKEN_ENV_VAR`).
- The host (`host/connect.py::_build_connect_headers`, 2025) **already** sends
  `OMNIGENT_HOST_TOKEN` on the `MANAGED_HOST_TOKEN_HEADER`
  (`X-agent-meow-Host-Token`) and skips user auth when it is set — **no
  connect.py change is required**.
- The tunnel route **already** resolves the header via
  `HostStore.resolve_launch_token` (constant-time hash compare, fail-closed on
  wrong host_id / expiry) and assigns `tunnel_owner = managed.user_id`
  (`server/routes/host_tunnel.py:158-169`). **No tunnel-route change required.**
- The host's durable `host_id` comes from `config.yaml`
  (`load_or_create_host_identity`, `host/identity.py:73`). The server passes it
  explicitly via the existing `HOST_ID_ENV_VAR` + `HOST_NAME_ENV_VAR` pair so
  the row it pre-registers matches the identity the child presents.
- `T` is **startup-scoped**: minted fresh each boot, expires with the server
  process. Loopback-only by construction (the spawned server binds loopback).

This adds **no new token-validation code** and no attack surface beyond
loopback; it is the sandbox-host credential flow re-pointed at the server's own
machine.

## 5. Components & boundaries

- **`agent_meow/server/local_host.py`** (new, small) — the single owner of the
  child lifecycle. Exposes `start_local_host(...) -> LocalHostHandle` and
  `stop_local_host(handle)`. In accounts mode it also pre-registers the host
  row via `HostStore.register_managed_host` (§4), then builds the child env
  (`OMNIGENT_HOST_TOKEN`, `HOST_ID_ENV_VAR`/`HOST_NAME_ENV_VAR`, loopback URL),
  spawns the daemon entry, tracks the PID, and terminates on shutdown. Nothing
  else in the server knows *how* the child is launched.
- **`agent_meow/server/app.py::_lifespan`** — calls `start_local_host` on
  startup (gated on `local_single_user_enabled()`) and `stop_local_host` in
  teardown. No host-launch logic lives here.
- **`agent_meow/host/connect.py`** — **unchanged.** The managed-host token path
  (`OMNIGENT_HOST_TOKEN` → `MANAGED_HOST_TOKEN_HEADER`) already exists and is
  used verbatim.
- **`agent_meow/server/routes/host_tunnel.py`** — **unchanged.** The
  `resolve_launch_token` auth path already validates the credential.
- **`agent_meow/host/_daemon_entry.py`** — unchanged (already supports `--local`).

## 6. Error handling

- **Child fails to spawn** (missing interpreter, etc.) → log a warning and
  continue; the landing simply shows the existing CTA (today's behavior).
  Self-host is **best-effort and never blocks server startup**. (Any
  pre-registered offline host row is harmless — it reads as offline.)
- **Child dies mid-run** → server does **not** auto-respawn in 1.0. The host
  drops offline and the UI reflects that. Auto-respawn policy is a documented
  follow-up.
- **Token mismatch / expiry** → tunnel route rejects via the existing
  `resolve_launch_token` fail-closed semantics (close 4004).
- **Port / health** — reuses the existing loopback health-wait already used for
  the local server; no new readiness machinery.

## 7. Migration to the bootstrap-account model (2.0, reserved)

1.0 uses loopback self-trust because it is the only model that gives true
zero-setup for a single-user local app. For 2.0 multi-user, the intended model
is the **bootstrap account**: first boot creates an admin and the built-in host
registers under that account. This is more consistent with multi-user but adds
a setup step before the host is ready, so it is explicitly **not** the 1.0
default. The 1.0 token path is designed to be replaceable by account-bound
registration without changing the spawn/supervise lifecycle (§3, §5).

## 8. Testing

- **Unit (`local_host`):** `start/stop` spawns and terminates the child; child
  env carries `OMNIGENT_HOST_TOKEN` + `HOST_ID_ENV_VAR`/`HOST_NAME_ENV_VAR` +
  the loopback URL; in accounts mode it calls `register_managed_host` with the
  local host_id and a hashed token; spawn-failure logs and returns without
  raising.
- **Unit (`local_host`, auth-mode branch):** in no-auth mode no token/row is
  created (host rides `RESERVED_USER_LOCAL`); in accounts mode the row is
  pre-registered offline and flipped online on connect.
- **Integration (reuses existing tunnel path):** with an accounts-mode app,
  the spawned local host connects with `OMNIGENT_HOST_TOKEN` and is accepted
  via `resolve_launch_token`; a wrong/absent token is rejected (close 4004).
  (This exercises `host_tunnel.py` unchanged.)
- **Integration:** boot the app in local single-user mode → a host row
  registers (status online) → the landing no longer renders
  `new-chat-landing-no-hosts-cta`.
- **E2E (repo convention):** fresh-install happy path — server boot → browser →
  host present → create a session with the default (Hermes) harness.

## 9. Verification of this design against source (2026-07-29)

- `agent_meow/server/app.py::_lifespan` starts harness/runner infra; no host
  spawn. Confirmed.
- `agent_meow/cli.py::_ensure_host_daemon` (~2610) is the only host-daemon
  spawn path today. Confirmed.
- `agent_meow/host/connect.py` — `HostProcess.__init__` (675), `_tunnel_url`
  (919), `_build_connect_headers` (2025) sends `OMNIGENT_HOST_TOKEN` on
  `MANAGED_HOST_TOKEN_HEADER` when set, `run` reconnect loop (1863);
  registration via `host.hello` over the WS tunnel. Confirmed — **reused
  unchanged**.
- `agent_meow/server/routes/host_tunnel.py` — managed-token auth via
  `HostStore.resolve_launch_token` (158-169); no-auth single-user falls to
  `RESERVED_USER_LOCAL` (186-190). Confirmed — **reused unchanged**.
- `agent_meow/stores/host_store.py` — `register_managed_host` (643),
  `resolve_launch_token` (731, constant-time compare, fail-closed on wrong
  host_id/expiry). Confirmed — **reused**.
- `agent_meow/host/identity.py` — `load_or_create_host_identity` (73) reads
  `HOST_ID_ENV_VAR`/`HOST_NAME_ENV_VAR` or durable `config.yaml` host_id.
  Confirmed.
- `agent_meow/host/_daemon_entry.py` supports `--local`. Confirmed.
- `agent_meow/server/auth.py:205` — `local_single_user_enabled()` reads
  `OMNIGENT_LOCAL_SINGLE_USER`; the existing single-user gate this design reuses
  (deployed multi-user servers stay fail-closed). Confirmed.
- `agent_meow/host/local_server.py:628-643` — the spawned local server sets
  `OMNIGENT_LOCAL_SINGLE_USER=1` and runs accounts mode when
  `resolve_auth_source() == "accounts"`. Confirmed (drives the §4 auth-mode
  branch).
- `web/src/shell/NewChatDialog.tsx:4289` — CTA gated on
  `!sandboxSelected && allHosts.length === 0 && !hostsLoading`; `desktopHost`
  only populated under `isElectronShell()` (never in a plain browser).
  Confirmed.
