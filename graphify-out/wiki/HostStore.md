# HostStore

> God node · 1591 connections · [C:\Users\1\github-pr\agent-meow\agent_meow\stores\host_store.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/host_store.py#L165)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as HostStore
    participant P1 as ManagedSandboxConfig
    participant P2 as Host
    participant P3 as ManagedLaunchTracker
    participant P4 as RepoWorkspace
    participant P5 as SqlConversation
    participant P6 as ManagedHostLaunch
    participant P7 as ManagedLaunch
    participant P8 as SessionLiveness
    participant P9 as SqlHost
    participant P10 as _PendingPolicyAskWrites
    participant P11 as Sessions namespace — create, snapshot, post events, interrupt, stream.  Target
    participant P12 as _RunnerForwardResult
    participant P13 as _MirroredToolCall
    participant P14 as _RelayHandle
    participant P15 as _HostLaunchAttempt
    participant P16 as _NativeTerminalEnsureOutcome
    participant P17 as _SessionEventDispatchResult
    participant P18 as Convert a validated Codex collaboration mode kind to the UI-facing flag.
    participant P19 as Publish the live collaboration-mode for a session.      :param session_id: Ses
    participant P20 as Whether a claude-native PermissionRequest may offer / honor the     \"Accept & a
    participant P21 as Whether a claude-native PermissionRequest may offer / honor the     persistent
    participant P22 as Derive the domain host that a WebFetch \"don't ask again\" rule should     scope
    participant P23 as Read the caller's read-state for one session, for embedding in the     per-user
    participant P24 as Set the caller's read-state for one session.      :param user_id: Authenticate
    participant P25 as Drop a session's read-state from every user's caches.      Called when a sessi
    participant P26 as Map an (optional) user id to the :mod:user_session_stream channel key.
    participant P27 as Push a session_added discovery event to a user's updates streams.      Cal
    participant P28 as Tool identity of a forwarder-mirrored function_call.      Cached by call
    participant P29 as Policy writes deferred until a relay-path tool-call ASK is approved.      The
    participant P30 as Return the lock serializing native ASK gates for one (session, policy).      C
    participant P31 as Active SSE relay task plus the runner it streams from.      :param runner_id:
    participant P32 as Resolve once Starlette reports the client closed the connection.      Long-pol
    participant P33 as Build a safe Content-Disposition: attachment header value.      The filena
    participant P34 as Convert a :class:StoredFile to a session file resource dict.      Matches th
    participant P35 as Publish an SSE event and persist it as a conversation item.      Emits the eve
    participant P36 as Build a structured AskUserQuestion payload for the elicitation     params extra
    participant P37 as Publish one harness-originated elicitation and wait for web verdict.      Mirr
    participant P38 as Canonicalize a tool input for terminal-resolved correlation.      The park sid
    participant P39 as Resolve the parked prompt a mirrored tool result belongs to,     ending its lon
    participant P40 as Clear one elicitation's approval card after the re-park grace, unless     a hoo
    participant P41 as Validate the hook client's optional re-attach elicitation id.      The hook mi
    participant P42 as Consume a resolution that arrived before the hook wait registered.      :param
    participant P43 as Prune stale or excess pre-resolved harness elicitation tombstones.      :param
    participant P44 as Resolve or pre-resolve one parked harness elicitation by id.      :param sessi
    participant P45 as Format an SSE event string for the wire.      :param event_type: SSE event nam
    participant P46 as Derive a user's permission level from a pre-fetched list of grants.      Mirro
    participant P47 as Find the session owner from a pre-fetched list of grants.      Mirrors :func:
    participant P48 as Map the relay-fed status cache value to a list-item status.      The cache sto
    participant P49 as Map a session's cached status plus direct child activity to list status.
    participant P50 as The two honest liveness signals for a single session.      Returned (keyed by
    participant P51 as Assemble one :class:SessionListItem from a conversation row and     pre-fetch
    participant P52 as Attach runner + host liveness to session-list items when a lookup is     wired.
    participant P53 as Return an elicitation event annotated with its resolution target.      Child-s
    participant P54 as Return ancestor session ids for a session, nearest parent first.      :param c
    participant P55 as Mirror a child elicitation request into each ancestor stream.      :param conv
    participant P56 as Mirror an elicitation-resolved event into each ancestor stream.      :param co
    participant P57 as Re-publish each ancestor's subtree-summed cost after a child usage update.
    participant P58 as Return descendant sub-agent conversations for a session.      :param conv_stor
    participant P59 as Return pending elicitation events visible from a session snapshot.      The cu
    participant P60 as Build a :class:SessionResponse from store-side entities.      status is
    participant P61 as Publish a session.input.consumed event for a just-persisted     conversatio
    participant P62 as Publish the standard compaction progress event to a session stream.      :para
    participant P63 as Publish the compaction-finished event to a session stream.      Emitted after
    participant P64 as Publish the compaction-failed event to a session stream.      Emitted when :fu
    participant P65 as Broadcast an assistant message appended outside the task runtime.      Termina
    participant P66 as Resolve the LLM model identifier from a conversation's agent spec.      Uses t
    participant P67 as Resolve the canonical harness for a conversation's bound agent.      Mirrors :
    participant P68 as Validate + canonicalize a session-create harness_override.      Mirrors th
    participant P69 as Convert a Unix epoch timestamp to its UTC calendar day.      :param epoch_seco
    participant P70 as Add a turn's LLM cost to the session owner's daily rollup.      A no-op when *
    participant P71 as Extract total_cost_usd for client display, or None when unpriced.
    participant P72 as Get-or-create the per-model usage sub-bucket inside usage[\"by_model\"].
    participant P73 as Add one turn's per-model token/cost deltas into a model bucket (ADD).      Mir
    participant P74 as Project the nested by_model usage map into typed :class:ModelUsage.
    participant P75 as Increment the session's cumulative token counters from a     response.complet
    participant P76 as Persist cumulative cost / token usage reported by a native harness.      Unlik
    participant P77 as Read and validate an optional cumulative usage field from event data.      :pa
    participant P78 as Persist and broadcast a token-usage update from a terminal-backed runtime.
    participant P79 as Persist and broadcast a model switch made inside the terminal.      Mirrors a
    participant P80 as Validate a terminal-observed reasoning-effort payload.      :param body: Exter
    participant P81 as Persist and broadcast a reasoning-effort switch made inside the terminal.
    participant P82 as Persist Codex's collaboration mode kind as an internal session label.      :pa
    participant P83 as Append a [System: ...] transcript note recording a model switch.      Reco
    participant P84 as Cache and broadcast a todo-list update from the claude-native forwarder.
    participant P85 as Broadcast a terminal-observed conversation item.      User messages use sess
    participant P86 as Broadcast a terminal-observed assistant text delta.      Terminal-backed integ
    participant P87 as Broadcast a terminal-observed reasoning (chain-of-thought) delta.      The rea
    participant P88 as Universal \"approval done\" signal — single publish drives both     sidebar (via
    participant P89 as Forward an approval verdict to the session's bound runner.      Runner-side el
    participant P90 as Resolve one outstanding elicitation from an approval payload.      Shared by t
    participant P91 as Ask the bound runner to pop a native-terminal modal for a parked ASK.      Fir
    participant P92 as Ask the bound runner to pop an INFORMATIONAL hard-block notice on the pane.
    participant P93 as Hold a server-side ASK gate until a human resolves it.      Publishes a resp
    participant P94 as Validate and unpack an external assistant-message event.      :param body: P
    participant P95 as Persist and broadcast assistant text produced outside agent-meow tasks.      T
    participant P96 as Validate and unpack an external conversation-item event.      :param body: P
    participant P97 as Look up an existing claude-native sub-agent child by its Claude-     side sub
    participant P98 as Look up an existing sub-agent child by its exact title.      Recovery path for
    participant P99 as Emit session.created on the parent's stream for a child session.      Clie
    participant P100 as Mint a child :class:Conversation row for a claude-native     sub-agent and em
    participant P101 as Look up an existing Codex-native sub-agent child by its Codex thread id.
    participant P102 as Return the UI-facing label for a Codex child session.      Uses the Codex-assi
    participant P103 as Return whether a child conversation tracks a Codex internal sub-agent.      :p
    participant P104 as Collapse a sub-agent's background-task waiting back to idle.      A cl
    participant P105 as Build the label dict for a Codex-native sub-agent child row.      :param threa
    participant P106 as Create a new Codex child Conversation row and publish session.created.
    participant P107 as Mint or update a child Conversation for a Codex AgentControl sub-agent.      I
    participant P108 as Persist and broadcast a conversation item produced outside AP.      This is th
    participant P109 as Return whether a conversation is backed by the native Kiro terminal.
    participant P110 as Persist a Kiro web input that never appeared in Kiro's JSONL transcript.
    participant P111 as Prepend a pending entry's file blocks onto a user-message item.      The claud
    participant P112 as Extract joined text from message content blocks.      :param content: Message
    participant P113 as Return the latest persisted assistant message text for a session.      Native
    participant P114 as Attach a native sub-agent's durable assistant text to an idle status edge.
    participant P115 as HTTP result from forwarding a session-control event to the runner.      :param
    participant P116 as Fail loudly when required external status forwarding does not land.      Termi
    participant P117 as Re-deliver a sub-agent terminal status through the parent's live runner.
    participant P118 as Fail when a live Codex Plan-mode switch was not applied by the runner.      Co
    participant P119 as Feed a mirrored tool item into the terminal-resolved fast path.      A funct
    participant P120 as Publish a typed :class:SessionStatusEvent to the live stream and     update t
    participant P121 as Truncate a label value to fit the conversation_labels.value column.      L
    participant P122 as Persist or clear the reload-visible failure detail for a session status.
    participant P123 as Project runner-owned failure labels into the typed API error shape.      Termi
    participant P124 as Clear a stale failed session status after runner recovery.      Native termina
    participant P125 as Publish a typed :class:SessionTerminalPendingEvent and update the     cache t
    participant P126 as Publish a typed :class:SessionSandboxStatusEvent and update the     cache the
    participant P127 as Publish a typed :class:SessionSkillsEvent to the live stream.      Fired the
    participant P128 as Publish a typed :class:SessionModelOptionsEvent to the live stream.      Fir
    participant P129 as Drop runner-derived session snapshot overlays for one session.      These fiel
    participant P130 as Publish a coarse filesystem-change invalidation to the live stream.      The e
    participant P131 as Publish a session.interrupted event to the live stream.      The event is
    participant P132 as Publish a session.superseded event to the live stream.      Emitted when a
    participant P133 as Get an HTTP client for the runner bound to a session.      Uses the RunnerRo
    participant P134 as Wait until a runner connects, then resolve the session's runner client.      T
    participant P135 as Validate a session's workspace against the agent's os_env boundary.      Wraps
    participant P136 as Outcome of a relaunch host.launch_runner round-trip.      :param runner_id
    participant P137 as Ask a host to spawn a runner for a session and capture the result.      Genera
    participant P138 as Cancel and await every in-flight background managed launch.      Lifespan-tear
    participant P139 as Provision a managed sandbox for a session in the background.      The host_t
    participant P140 as Run the provision phase of a background managed launch.      Dispatches to :fu
    participant P141 as Bind a provisioned managed host to its session and launch a runner.      The b
    participant P142 as Block until a managed launch settles, raising its failure.      The rendezvous
    participant P143 as Relaunch a dead managed sandbox for a session, if it has one.      Called from
    participant P144 as Register and spawn the background relaunch for a dead sandbox.      Recovers t
    participant P145 as Register and spawn the background WAKE for a dormant resumable host.      Unli
    participant P146 as Wake a dormant resumable managed host in the background, settling the     track
    participant P147 as Drive — and wait for — the runner's session-init handshake.      Posts POST
    participant P148 as Return the authoritative runner client for session resources.      Requires th
    participant P149 as Proxy GET /resources to the runner with strict validation.      :param run
    participant P150 as Best-effort reset of the session's runner-side state after a switch.      Run
    participant P151 as Resolve native terminal metadata for a session, by wrapper label OR harness.
    participant P152 as Return whether a session's turns are driven by a native terminal harness.
    participant P153 as Return native terminal runtime strings for a native-harness session.      Reso
    participant P154 as Return the runner terminal resource name for a native harness.      :param har
    participant P155 as Convert a failed runner terminal-ensure response into durable error data.
    participant P156 as Convert runner transport failure during native terminal ensure.      The messa
    participant P157 as Result of a native terminal readiness probe.      :param error: Error data whe
    participant P158 as Ask the runner to create or return the native terminal for a message.      The
    participant P159 as Extract a non-fatal policy-disabled notice from a 2xx ensure response.      Th
    participant P160 as Publish a live response.error event for a persisted error item.      :para
    participant P161 as Persist a consumed user message and terminal-start error.      Used when a nat
    participant P162 as Persist a consumed user message and a host-launch failure error.      Used whe
    participant P163 as Wake the parent runner when a native sub-agent fails to boot its terminal.
    participant P164 as Persist + publish a non-fatal \"policy not enforced\" banner.      The runner re
    participant P165 as Build the runner event that delivers a web message to a native TUI.      :para
    participant P166 as Forward one agent-meow web-chat message to the native terminal harness.      T
    participant P167 as Return a harness failure message from a runner SSE response.      Runner POS
    participant P168 as Best-effort POST a control event to the bound runner.      Used for control in
    participant P169 as Forward a stop_session request to the bound runner, surfacing     failures
    participant P170 as Terminate the host-launched runner backing a host-spawned session.      \"Stop
    participant P171 as Construct a :class:NewConversationItem from a POSTed event.      Validates t
    participant P172 as Validate and unpack a structured skill slash-command event.      The REPL post
    participant P173 as Build the user-message shape used for input policy evaluation.      Skill comm
    participant P174 as Resolve a skill's hidden <skill> meta text on the bound runner.      Skill
    participant P175 as Persist a skill slash command and forward hidden skill context.      Skill con
    participant P176 as Extract title candidate content blocks from a session item.      Only user m
    participant P177 as Set an untitled conversation's title from message content blocks.      No-op w
    participant P178 as Set an untitled session's title from a user message.      The app UI creates s
    participant P179 as Persist a user event without forwarding to a runner.      Used when the runner
    participant P180 as Extract plain text from a user message event for the routing judge.      Conca
    participant P181 as Persist and publish a routing_decision transcript chip.      Called by the
    participant P182 as Persist a user event and forward it to the runner.      The server persists th
    participant P183 as Outcome of forwarding one item-event to the runner.      :param item_id: Store
    participant P184 as Forward an item-event to the runner with harness-aware dispatch.      Callers
    participant P185 as Extract a persistable conversation item from a runner SSE event.      Returns
    participant P186 as Build a resource_event conversation item from a runner SSE event.      The
    participant P187 as Build a routing_decision conversation item from a runner SSE event.      T
    participant P188 as Build a durable error item from a runner error SSE event.      The web UI
    participant P189 as Persist a runner error item unless the same error already exists.      Native
    participant P190 as Persist a single conversation item from the relay.      :param conversation_st
    participant P191 as Persist buffered assistant text as a message item and clear the buffer.      S
    participant P192 as Subscribe to the runner's SSE stream and relay events locally.      Long-lived
    participant P193 as Start (or replace) the SSE relay for session_id.      No-op when a healthy
    participant P194 as Start the runner SSE relay and wait for its subscription ack.      The runner
    participant P195 as Run explicit compaction while holding the per-session compact lock.      :para
    participant P196 as Return the provider family of an agent's harness, or None.      Loads the
    participant P197 as Return whether two agents share a (known) provider family.      False when
    participant P198 as Return an agent's canonical harness id, or None when unloadable.      Used
    participant P199 as Return whether an agent runs a native CLI harness.      Loads the agent's spec
    participant P200 as Return whether *agent*'s native harness rebuilds a fork's transcript.      cla
    participant P201 as Return whether *agent*'s native harness carries FORK history via preamble.
    participant P202 as Return native coding-agent metadata for an agent's harness.      :param agent:
    participant P203 as Return the Web UI presentation labels for an agent's harness.      A native-CL
    participant P204 as Publish an elicitation request event on the session stream.      Approval stat
    participant P205 as Apply (or drop) policy writes stashed for a relay tool-call ASK.      Called w
    participant P206 as Build the actor dict for :class:EvaluationContext.      Returns {\"run_
    participant P207 as Build an :class:EvaluationContext from a proto-style event dict.      Maps t
    participant P208 as Evaluate a tool call against TOOL_CALL phase policy rules.      Pure evaluatio
    participant P209 as Extract concatenated text from a user message event body.      Mirrors the log
    participant P210 as Publish the [Denied by policy: ...] sentinel on the session stream.      T
    participant P211 as Publish a terminal response.completed for an INPUT-phase DENY.      The sh
    participant P212 as Persist the [Denied by policy: ...] sentinel as assistant history.      IN
    participant P213 as Evaluate a user message against REQUEST (input) phase policy rules.      Does
    participant P214 as Extract concatenated text from an assistant message event.      Mirrors :func:
    participant P215 as Return a copy of the message body with all text content     blocks replaced by
    participant P216 as Evaluate an assistant message against OUTPUT phase policies.      Pure evaluat
    participant P217 as Stash the runner router for the native-terminal approval popup.      Called on
    participant P218 as Deliver a parent-wake notice when a sub-agent blocks on an approval.      Post
    participant P219 as Install the parent-wake notifier on the elicitation publish path.      Wires :
    participant P220 as Yield SSE-formatted events from the conversation's live stream.      Events ar
    participant P221 as Validate per-session native-terminal pass-through args.      Enforces a flat l
    participant P222 as Validate a caller-supplied per-session cost-control switch.      :param value:
    participant P223 as Parse the JSON metadata part from bundled session creation.      :param metada
    participant P224 as Build a FastAPI-style missing multipart field error.      :param field: Missin
    participant P225 as Resolve the live host connection for a worktree operation.      :param host_id
    participant P226 as Create a git worktree on the host for a new session branch.      Validates the
    participant P227 as Best-effort removal of a session's git worktree.      Used for create-rollback
    participant P228 as Load the parent bundle and resolve a child sub-agent's trusted spec.      This
    participant P229 as Return the canonical harness identifier for a resolved spec.      :param spec:
    participant P230 as Return whether an executor.config flag is explicitly set false.      The s
    participant P231 as Derive native-terminal YOLO pass-through args from a trusted sub-spec.      po
    participant P232 as Resolve terminal-first wrapper labels from an already-loaded sub-spec.      :p
    participant P233 as Resolve the terminal-first wrapper labels for a native-harness sub-agent.
    participant P234 as Reject a session-create body that seeds policy-owned labels.      cost_contr
    participant P235 as Authorize a label write touching the policy-owned cost_control.* keys.
    participant P236 as Create a session bound to an already-registered agent.      This preserves the
    participant P237 as Validate, store, and persist a bundled session request.      Each upload creat
    participant P238 as Persist database rows for a bundle already written to artifacts.      :param c
    participant P239 as Delete an uploaded bundle after database creation fails.      Cleanup failures
    participant P240 as Authorize a bundled create's parent link and resolve runner affinity.      The
    participant P241 as Notify the inherited runner that a bundled child session exists.      Lets the
    participant P242 as Validate a runner id from PATCH /v1/sessions/{id}.      When user_id i
    participant P243 as Return a single-line text preview from newest-first message items.      Powers
    participant P244 as Build a :class:ChildSessionSummary from a child conversation.      Parses th
    participant P245 as Build child summaries with one batched message-preview lookup.      ChildSes
    participant P246 as Wrap a plain-text tool result in a JSON-RPC 2.0 MCP tools/call response.
    participant P247 as Server-side handler for sys_advise_models MCP tool calls.      Intercepts
    participant P248 as Wrap *result* in a JSON-RPC 2.0 success response.      :param rpc_id: The JSON
    participant P249 as Wrap an error in a JSON-RPC 2.0 error response.      :param rpc_id: The JSON-R
    participant P250 as Return an MCP InputRequiredResult asking the runner to collect     user app
    participant P251 as Handle a tools/list JSON-RPC request for the MCP proxy endpoint.      Dele
    participant P252 as Handle a tools/call JSON-RPC request for the MCP proxy endpoint.      Step
    participant P253 as Read an uploaded file into memory, aborting if it exceeds *limit_bytes*.
    participant P254 as Factory that builds the sessions router.      Stores are closed over rather th
    participant P255 as Fetch a session's merged skills from its bound runner.      Skills are runner-
    participant P256 as Background single-flight fetch of a session's runner-owned skills.      Popula
    participant P257 as Validate runner-returned raw Codex model/list data.      :param raw_models
    participant P258 as Resolve the Web UI model-picker options for a native session.      Two shapes:
    participant P259 as Background single-flight fetch of a session's native model catalog.      :para
    participant P260 as Read a full session snapshot from the store.      Centralizes the create/get r
    participant P261 as # NOTE: external conversation items are persisted with a random
    participant P262 as # NOTE: this does NOT defeat the Databricks Apps ingress'
    participant P263 as HostLaunchTarget
    participant P264 as Server-launched sandbox hosts for host_type=\"managed\" sessions.  The exter
    participant P265 as One session's in-flight (or failed) managed-host launch.      Created by :meth
    participant P266 as In-memory index of managed-host launches keyed by session id.      POST /v1/
    participant P267 as Initialize the empty session-id → launch index.
    participant P268 as Register a new in-flight launch for *session_id*.          Replaces any prior
    participant P269 as Look up the launch state for *session_id*.          :param session_id: Session
    participant P270 as Settle *session_id*'s launch as successful and forget it.          Waiters hol
    participant P271 as Settle *session_id*'s launch as failed, retaining the reason.          :param
    participant P272 as Everything the managed-host flow needs from a deployment.      Built by :func:
    participant P273 as Result of a successful managed host launch.      :param host_id: The registere
    participant P274 as Parsed repository-URL workspace for a managed session.      A managed create's
    participant P275 as Return whether *workspace* is a repository-URL workspace.      Used by the cre
    participant P276 as Validate a #<branch> fragment as a clonable branch name.      :param fragm
    participant P277 as Derive the clone directory name from a repository URL.      :param url: The fr
    participant P278 as Parse and validate a managed session's repository-URL workspace.      Grammar
    participant P279 as Build the launcher factory for the YAML provider: modal path.      :param
    participant P280 as Build a factory that rejects launch for a not-yet-supported provider.      Let
    participant P281 as Parse and validate the server config's sandbox: section.      Fails loud o
    participant P282 as Extract and validate the modal image from the raw sandbox dict.      The 
    participant P283 as Extract and validate the modal secret names from the sandbox dict.      
    participant P284 as Build the launcher factory for the YAML provider: daytona path.      :para
    participant P285 as Extract and validate the daytona image from the sandbox dict.      The d
    participant P286 as Extract and validate the daytona env names from the sandbox dict.      s
    participant P287 as Build the launcher factory for the YAML provider: boxlite path.      :para
    participant P288 as Return the validated sandbox.boxlite mapping (empty when absent).      :ra
    participant P289 as Fail loud on any key outside *allowed* — catches typos and misplaced keys     (
    participant P290 as Resolve the boxlite runtime MODE from the mutually-exclusive local /     
    participant P291 as Extract the optional shared sandbox.boxlite.image (default: official     ho
    participant P292 as Extract the optional shared sandbox.boxlite.env — SERVER-process     enviro
    participant P293 as Extract the optional sandbox.boxlite.local.home_dir (boxlite data dir).
    participant P294 as Extract the optional sandbox.boxlite.local.registry block — private-     re
    participant P295 as Build the launcher factory for the YAML provider: cwsandbox path.
    participant P296 as Extract and validate sandbox.cwsandbox.image (optional).
    participant P297 as Build the launcher factory for the YAML provider: e2b path.      :param te
    participant P298 as Extract and validate the e2b template from the sandbox dict.      sandbo
    participant P299 as Build the launcher factory for the YAML provider: islo path.      :param i
    participant P300 as Build the launcher factory for the YAML provider: openshell path.      :pa
    participant P301 as Extract a provider-specific optional config block.      :param raw: The raw 
    participant P302 as Extract and validate a provider image from the raw sandbox dict.      :par
    participant P303 as Extract and validate provider env passthrough names.      :param raw: The raw
    participant P304 as Extract and validate an optional provider string field.      :param raw: The r
    participant P305 as Extract and validate an optional positive integer provider field.      :param
    participant P306 as Extract and validate an optional boolean provider field.      :param raw: The
    participant P307 as Extract and validate an optional provider string→string mapping field.      :p
    participant P308 as Reject a sandbox.kubernetes.<field> that is not a DNS-1123 label.
    participant P309 as Reject a sandbox.kubernetes.<field> that is not a DNS-1123 subdomain.
    participant P310 as Return whether *key* is a valid Kubernetes label key (optional prefix).
    participant P311 as Validate the YAML sandbox.kubernetes identifiers at parse time.      :rais
    participant P312 as Extract and validate the optional sandbox.kubernetes.resources block.
    participant P313 as Build the launcher factory for the YAML provider: kubernetes path.      :p
    participant P314 as Provision a sandbox, start a host in it, and wait until it registers.      Seq
    participant P315 as Provision a NEW sandbox generation for an existing managed host.      The host
    participant P316 as Arm the credential, start the in-sandbox host, and await its     registration —
    participant P317 as Poll the hosts table until the sandbox host registers, or time out.      :para
    participant P318 as Resolve the launcher that can terminate a managed host's sandbox.      The dep
    participant P319 as Whether :func:resume_managed_host could wake this host in place.      True
    participant P320 as Wake a dormant managed host so a session bound to it can run again.      The s
    participant P321 as Terminate a managed host's sandbox and delete its host row.      Deleting the
    participant P322 as Terminate a managed host's sandbox without touching its row.      Best-effort
    participant P323 as ._reown_host_id()
    participant P324 as _row_to_host()
    participant P325 as Ownership-checked resolution for host runner launches.  Two routes spawn a run
    participant P326 as A host + session pair the caller is authorized to launch on.      :param host:
    participant P327 as Authorize that the caller owns a known host.      Every route that reaches a h
    participant P328 as Resolve and authorize a host runner launch.      Verifies the host exists, is
    participant P329 as Tests for the host store (persistent host registration).
    participant P330 as Host store backed by the per-test SQLite database.      :param db_uri: SQLite
    participant P331 as Force a host row's updated_at to an exact epoch value.      Lets a test st
    participant P332 as Verify that upsert_on_connect inserts a new row when the host_id     has never
    participant P333 as Verify that upsert_on_connect updates host_id, status, and     updated_at when
    participant P334 as Verify configured_harnesses is written on insert and read back     with exact v
    participant P335 as Verify a reconnect overwrites the stored map, and a reconnect     without the m
    participant P336 as Verify a corrupt configured_harnesses column value degrades to     None instead
    participant P337 as A host_id rotation must not orphan or break conversations bound to it.      Re
    participant P338 as With reown opted in, the same host_id may move to a new owner.      This is th
    participant P339 as Without reown opt-in, a different owner cannot claim a host_id.      The deplo
    participant P340 as Verify that set_offline transitions a host from online to offline.      If sta
    participant P341 as Verify that set_offline is a no-op for a nonexistent host_id.      The disconn
    participant P342 as Verify heartbeat refreshes last-seen but leaves status alone.      The ping lo
    participant P343 as Verify heartbeat is a no-op for a host that does not exist.      A heartbeat c
    participant P344 as Verify is_online is True for an online host seen just now.      This is the li
    participant P345 as Verify is_online is False for an online row past the TTL.      This is the cru
    participant P346 as Verify is_online is False for an explicitly-offline or absent host.      A cle
    participant P347 as online_host_ids returns exactly the fresh-online subset.      This is the
    participant P348 as online_host_ids([]) returns an empty set without a DB round-trip.      The
    participant P349 as Verify the freshness boundary at exactly the TTL counts as live.      A host s
    participant P350 as Verify that list_hosts returns only hosts for the specified owner.      If ali
    participant P351 as Verify that list_hosts returns an empty list for an owner with     no hosts.
    participant P352 as Verify that get_host returns None for a nonexistent host_id.      If it raises
    participant P353 as When a host reconnects with a new host_id (user regenerated     config.yaml) bu
    participant P354 as When the (owner, name) conflict path replaces a host_id, the     original creat
    participant P355 as The raw launch token resolves back to the full pre-registered host     — owner,
    participant P356 as Unknown tokens and expired tokens must NOT authenticate — the     expiry is wha
    participant P357 as Relaunch: registering the SAME host_id again (a fresh sandbox     generation af
    participant P358 as The tunnel's upsert_on_connect (which fires when the sandbox     host regis
    participant P359 as delete_host removes the host from the picker AND revokes its     launch tok
    participant P360 as revoke_launch_token is the relaunch-failure cleanup: the     credential sto
    participant P361 as Only the SHA-256 digest is persisted: a database leak must not     leak usable
    participant P362 as Fail-closed boundary: re-registering an existing host_id under a     DIFFERENT
    participant P363 as DaytonaSandboxLauncher
    participant P364 as BoxliteSandboxLauncher
    participant P365 as ModalSandboxLauncher
    participant P366 as E2BSandboxLauncher
    participant P367 as OpenShellSandboxLauncher
    participant P368 as KubernetesSandboxLauncher
    participant P369 as IsloSandboxLauncher
    participant P370 as CWSandboxLauncher
    participant P371 as Databricks Apps entry point for omnigent.  Starts omnigent with Lakebase (mana
    participant P372 as Pack *bundle_dir* into a deterministic gzipped tarball.      Identical directo
    participant P373 as parse_sandbox_config()
    participant P374 as _SPAStaticFiles
    participant P375 as _RangeAwareGZipMiddleware
    participant P376 as _FastAPICallNext
    participant P377 as _WebSocketMetricsMiddleware
    participant P378 as Return the server version exposed to clients.      Reads :data:~?agent_meow.v
    participant P379 as Pin Content-Type for web UI assets regardless of the OS MIME registry.      St
    participant P380 as Protocol for FastAPI's middleware continuation callable.
    participant P381 as Execute the next middleware or route handler.          :param request: Incomin
    participant P382 as ASGI middleware that tracks accepted WebSocket connections.      :param app: D
    participant P383 as Initialize the middleware.          :param app: Downstream ASGI app.
    participant P384 as Track an accepted WebSocket for the lifetime of its ASGI scope.          :para
    participant P385 as Return the low-cardinality route template for metrics attributes.      Prefer
    participant P386 as Return the HTTP status code to attach to request duration metrics.      :param
    participant P387 as Strip nondeterministic metadata from a tar member header.      The built-in bu
    participant P388 as Register or refresh a built-in template agent from its bundle.      Content-aw
    participant P389 as Register all built-in agents that should always be available.      Called on e
    participant P390 as Seed extra built-in agents named by :data:_EXTRA_BUILTIN_AGENTS_ENV.      No
    participant P391 as Build a gzipped tarball of the claude-native-ui agent spec.      :returns: Gzi
    participant P392 as Register or refresh the claude-native-ui agent.      Called during server life
    participant P393 as Build a gzipped tarball of the codex-native-ui agent spec.      :returns: Gzip
    participant P394 as Register or refresh the codex-native-ui agent.      Called during server lifes
    participant P395 as Build a gzipped tarball of the opencode-native-ui agent spec.      :returns: G
    participant P396 as Register or refresh the opencode-native-ui agent.      Called during server li
    participant P397 as Build a gzipped tarball of the pi-native-ui agent spec.      :returns: Gzipped
    participant P398 as Register or refresh the pi-native-ui agent.      Called during server lifespan
    participant P399 as Build a gzipped tarball of the cursor-native-ui agent spec.      :returns: Gzi
    participant P400 as Register or refresh the cursor-native-ui agent.      Called during server life
    participant P401 as Build a gzipped tarball of the kiro-native-ui agent spec.
    participant P402 as Register or refresh the kiro-native-ui agent.
    participant P403 as Register or refresh the antigravity-native-ui agent.      Called during server
    participant P404 as Build a gzipped tarball of the antigravity-native-ui agent spec.      :returns
    participant P405 as Build a gzipped tarball of the qwen-native-ui agent spec.      :returns: Gzipp
    participant P406 as Register or refresh the qwen-native-ui agent.      Called during server lifesp
    participant P407 as Build a gzipped tarball of the kimi-native-ui agent spec.      :returns: Gzipp
    participant P408 as Register or refresh the kimi-native-ui agent.      Called during server lifesp
    participant P409 as Build a gzipped tarball of the examples/debby agent bundle.      debby is
    participant P410 as Register the debby brainstorming agent if its bundle ships here.      Called d
    participant P411 as Build a gzipped tarball of the examples/polly agent bundle.      polly is
    participant P412 as Register the polly orchestrator agent if its bundle ships here.      polly is
    participant P413 as Build and return the FastAPI application with all routes mounted.      Stores
    participant P414 as StaticFiles with an SPA history fallback.      React Router's client-side
    participant P415 as Return whether an unmatched static path belongs to the API namespace.      The
    participant P416 as Gzip middleware that leaves ranged static-file responses unencoded.      HTTP
    participant P417 as Compress ordinary static responses and pass range requests through.          :
    participant P418 as Apply browser cache policy for the bundled web UI static mount.      The SPA s
    participant P419 as _injected_config()
    participant P420 as _EntrypointFakeLauncher
    participant P421 as Tests for :mod:~?agent_meow.server.managed_hosts.
    participant P422 as Build a config that injects *fake* through the launcher-factory seam     — the
    participant P423 as No sandbox: section → managed hosts simply not configured.
    participant P424 as The documented modal YAML shape parses into a config whose factory     construc
    participant P425 as provider: modal + server_url is a complete config: the image is     optiona
    participant P426 as lakebox configs parse (a deployment can stage config before     managed-launch
    participant P427 as The documented daytona YAML shape parses into a config whose     factory constr
    participant P428 as provider: daytona + server_url is a complete config: image and     env are
    participant P429 as The documented boxlite YAML shape (cloud: remote boxlite serve)     parses
    participant P430 as provider: boxlite + server_url is a complete config: the boxlite     block
    participant P431 as sandbox.boxlite.home_dir + registry reach the launcher: a custom data     d
    participant P432 as The documented islo YAML shape parses into a config whose factory     construct
    participant P433 as provider: islo + server_url is a complete config: optional     constructor
    participant P434 as The documented e2b YAML shape parses into a config whose factory     constructs
    participant P435 as provider: e2b + server_url is a complete config: template and     env are o
    participant P436 as A present-but-malformed e2b template fails loud at parse time.
    participant P437 as The documented openshell YAML shape parses into a config whose     factory cons
    participant P438 as provider: openshell + server_url is a complete config: optional     constru
    participant P439 as The documented kubernetes YAML shape parses into a config whose factory     con
    participant P440 as provider: kubernetes + server_url is a complete config: optional fields
    participant P441 as An operator typo in the kubernetes block fails parse loud, not at launch.
    participant P442 as Malformed config raises with the offending key named — this is     what stops s
    participant P443 as The documented <repo>[#<branch>] grammar parses into the     validated spec
    participant P444 as Malformed workspaces fail loud at parse time with the offense     named — this
    participant P445 as Build a real app wired with *sandbox_config* to probe GET /v1/info.      M
    participant P446 as GET /v1/info advertises managed sandboxes iff the wired config     can actu
    participant P447 as The embedding seam: a directly-constructed config (custom launcher     factory,
    participant P448 as Golden path: provision → pre-register the host row with its token     → start h
    participant P449 as The embedding seam end to end: a deployment-defined launcher (a     provider na
    participant P450 as A staged-but-unimplemented YAML provider (lakebox) fails with a 400     naming
    participant P451 as A provider failure before anything exists (preflight) maps to a     502 with th
    participant P452 as A failure AFTER provisioning must clean up: terminate the sandbox     (no orpha
    participant P453 as A raw (non-Click, non-HTTP) exception during host start — a     provider SDK er
    participant P454 as A host that never registers (e.g. bad image, can't reach the     server) times
    participant P455 as A repository-URL workspace is cloned inside the sandbox BEFORE the     host sta
    participant P456 as A failed clone (bad URL, missing branch, private repo) cleans up     exactly li
    participant P457 as An entrypoint-as-host fake (like the kubernetes launcher): provision     on
    participant P458 as Reserve a sandbox id (no box created); recorded + deterministic.
    participant P459 as The entrypoint model never execs in — the base default is overridden.
    participant P460 as Record the call, prove the token already resolves, and connect.
    participant P461 as Entrypoint-as-host seam: the uniform launch path reserves the sandbox id via
    participant P462 as A start_host failure tears the sandbox down (by the reserved id) and deletes
    participant P463 as A relaunch terminates the dead generation, provisions a fresh     sandbox, and
    participant P464 as A FAILED relaunch must not delete the durable host row — deleting     it would
    participant P465 as A provider mismatch (the sandbox: config changed since launch)     fails th
    participant P466 as Cleanup terminates the provider sandbox and deletes the host row —     one oper
    participant P467 as Best-effort contract: a provider termination failure neither     propagates nor
    participant P468 as A config change between launch and teardown (current launcher's     provider ≠
    participant P469 as sandbox.modal.secrets names reach the launcher constructor —     the path t
    participant P470 as A present-but-malformed secrets value stops startup with the key named.
    participant P471 as test_info_reports_enabled_for_injected_custom_launcher()
    participant P472 as server()
    participant P473 as _HarnessMenuRow
    participant P474 as _HostDaemonRecord
    participant P475 as _HostHttpResult
    participant P476 as _SessionPagesResult
    participant P477 as _HostGroup
    participant P478 as _FirstRunPlan
    participant P479 as _OmnigentCLI
    participant P480 as _HostSessionsTableWidths
    participant P481 as _DaemonSessionsResult
    participant P482 as _SessionsPageResult
    participant P483 as _SpawnedDaemonProcess
    participant P484 as _DaemonReuseDecision
    participant P485 as _CliRunnerProcess
    participant P486 as _LLMDeploy
    participant P487 as _BuiltinEntry
    participant P488 as _ToolsDeploy
    participant P489 as _ExecutorDeploy
    participant P490 as _DeployConfig
    participant P491 as _ResumeChoice
    participant P492 as _ConfigGroup
    participant P493 as CLI entry point for agent_meow.
    participant P494 as Load and return config from a YAML file.     Returns an empty dict if no path i
    participant P495 as Return Uvicorn logging config with request-duration access logs.      Uvicorn
    participant P496 as One-time relocation of a pre-rename state directory to ~/.agent-meow.
    participant P497 as Return the path to the user-level agent-meow config.      :returns: $OMNIGEN
    participant P498 as Format a filesystem path for display, collapsing the home prefix to ~.
    participant P499 as Format a config path for display, collapsing the home prefix to ~.      Th
    participant P500 as Load the global agent-meow config from ~/.agent_meow/config.yaml.      Ret
    participant P501 as Load the project-level config from .agent_meow/config.yaml in cwd.      Re
    participant P502 as Merge global and project-level config.      Precedence (highest last): global
    participant P503 as Return the canonical harness declared by a default-agent YAML, or None.
    participant P504 as The harness + optional default agent a bare run should launch.      Derive
    participant P505 as Return the filesystem path to a bundled example agent directory.      Located
    participant P506 as Pick the harness a bare first run should launch, by configured creds.
    participant P507 as Resolve the harness + default agent for a bare agent-meow run.      Adopts
    participant P508 as Decide the run target when no AGENT was passed on the command line.      -
    participant P509 as Parse a boolean value from YAML or agent-meow config KEY=VALUE.      :para
    participant P510 as Resolve the explicit auto_open_conversation config value, if set.      Tri
    participant P511 as Resolve whether CLI launches should open conversation URLs.      Defaults to 
    participant P512 as Merge *settings* into ~/.agent_meow/config.yaml and remove any     keys lis
    participant P513 as Copy a single bundled example YAML into the user config dir.      uv tool in
    participant P514 as Materialize every bundled internal-beta example and return the default's path.
    participant P515 as Merge *settings* into .agent_meow/config.yaml in cwd and remove     any key
    participant P516 as Default DB URI for agent-meow server — the machine-global     <data_dir>/
    participant P517 as Default artifact dir for agent-meow server — <data_dir>/artifacts.
    participant P518 as Create the parent directory of a SQLite DB file if it's missing.      SQLite c
    participant P519 as Interactively claim the first admin on a TTY when setup is pending.      The \"
    participant P520 as Create an artifact store based on the location URI scheme.      dbfs:/Volume
    participant P521 as Register an agent from a directory or standalone YAML file.      Materializes
    participant P522 as Render the version line shown by --version and version.      Always in
    participant P523 as Click callback that lazily renders the version line and exits.      We deliber
    participant P524 as Top-level group that prints the brand lockup above its help.      The Otto + w
    participant P525 as Decide whether the update notice should be suppressed for *argv*.      Skipped
    participant P526 as Console-script entry point for agent-meow.      Dispatches to the click CL
    participant P527 as Return True when *argv* looks like agent-meow <target> [opts]     where *ta
    participant P528 as Return whether *value* is a server URL.      :param value: CLI argument value,
    participant P529 as Decide whether *argv* targets the removed top-level ad-hoc chat.      True whe
    participant P530 as Local registry record for one background host daemon.      :param pid: Process
    participant P531 as Decoded agent-meow management HTTP response.      :param status_code: HTTP sta
    participant P532 as Column widths for one host status sessions table.      :param session_id: Widt
    participant P533 as Sessions fetched for one daemon target.      :param base_url: agent-meow serve
    participant P534 as Decoded sessions page.      :param sessions: Session rows returned by the page
    participant P535 as Accumulated sessions from a paginated query.      :param sessions: Session row
    participant P536 as Background host daemon process metadata.      :param pid: Spawned process id,
    participant P537 as Normalize a daemon target key.      :param server_url: Requested agent-meow se
    participant P538 as Probe whether a daemon's host is currently online on its server.      A daemon
    participant P539 as Return the directory containing per-target daemon registry records.      Tests
    participant P540 as Return the registry JSON path for *target*.      :param target: Normalized dae
    participant P541 as Parse a daemon record from decoded JSON.      :param raw: Decoded JSON object,
    participant P542 as Read a daemon registry record from disk.      :param path: JSON file path to r
    participant P543 as Persist a daemon registry record.      :param record: Record to write, e.g. a
    participant P544 as Delete a daemon registry record if it exists.      Removes the per-target JSON
    participant P545 as Build a daemon record from the legacy host.pid file.      :returns: Legacy
    participant P546 as List daemon registry records.      :param include_legacy: When True, inclu
    participant P547 as Find a daemon record by target.      :param target: Normalized daemon target,
    participant P548 as Record the concrete agent-meow server URL served by a daemon target.      :par
    participant P549 as Load the existing local host id without creating one.      :returns: Host id f
    participant P550 as Return whether a daemon's host tunnel is (or quickly becomes) online.      Pro
    participant P551 as Return whether a daemon record belongs to a different current host id.      A
    participant P552 as Tear down a daemon and, in local mode, the agent-meow server it owns.      The
    participant P553 as Outcome of evaluating whether an existing daemon can be reused.      :param re
    participant P554 as Decide whether an existing daemon for *target* can be reused.      Reuse requi
    participant P555 as Check whether the local daemon already serves a requested URL target.      :pa
    participant P556 as Spawn the background host daemon and attach its log file.      :param args: Pr
    participant P557 as Persist registry and legacy pidfile entries for a spawned daemon.      :param
    participant P558 as Build the registry record for the current foreground host process.      :param
    participant P559 as Find a live daemon that already serves a foreground record target.      :param
    participant P560 as Persist a foreground daemon record unless a live duplicate exists.      :param
    participant P561 as Restore the record replaced by a foreground host process.      If another proc
    participant P562 as Load or create the host id used by a foreground host process.      :returns: H
    participant P563 as Start or reuse a host daemon for one target.      :param server_url: agent-meo
    participant P564 as Build the environment for the background host daemon.      Remote daemons conn
    participant P565 as Read the host daemon PID file (two lines: PID and server URL).      :returns:
    participant P566 as Check whether the local-mode host daemon is still alive.      :returns: True
    participant P567 as Sign in (or fail with the login hint) for Databricks-fronted servers.      Pro
    participant P568 as Ensure the host daemon is running and return the agent-meow server URL.      T
    participant P569 as Tell the user the server was restarted in a new mode, then exit clean.      Th
    participant P570 as Poll until the daemon-started local agent-meow server is reachable.      In lo
    participant P571 as Runner subprocess metadata for the agent-meow server command.      :param
    participant P572 as Start the out-of-process runner used by CLI server flows.      The runner alwa
    participant P573 as Stop a runner subprocess started by :func:_start_cli_runner_process.      :p
    participant P574 as Fail before app startup when the requested TCP listener cannot bind.      Mirr
    participant P575 as Start the agent-meow server in the foreground, or manage the background server.
    participant P576 as Stop the background agent-meow server and the local host daemon that owns it.
    participant P577 as Ensure the managed background agent-meow server is running.      Reuses a heal
    participant P578 as Stop the background agent-meow server and the local host daemon.      Stops th
    participant P579 as Show whether the background agent-meow server is running.      Reports the rec
    participant P580 as Stop everything agent-meow is running on this machine.      The off switch: st
    participant P581 as Count sessions actively running a turn on the local server.      Gates on the
    participant P582 as Block until no local session is actively running a turn.      Used by omni u
    participant P583 as Drain (or force-stop) the local server + daemon before an upgrade.      Shared
    participant P584 as Update a git/VCS omni install by re-pulling its tracked ref.      A git in
    participant P585 as Upgrade the agent-meow CLI to the latest release on PyPI.      Detects how age
    participant P586 as Produce a tar.gz bundle from a directory or standalone     agent-meow YAML file
    participant P587 as Expand ${VAR} references in YAML files that contain     secrets, using the
    participant P588 as Pydantic model for the llm: block during deploy-time     env var expansion.
    participant P589 as Pydantic model for a single dict entry in     tools.builtins during deploy-
    participant P590 as Pydantic model for the tools: block during deploy-time     env var expansio
    participant P591 as Pydantic model for the executor: block during deploy-time     env var expan
    participant P592 as Pydantic model for the top-level config.yaml structure     during deploy-time e
    participant P593 as Expand ${VAR} references in-place in a parsed     config.yaml dict. Ret
    participant P594 as Expand ${VAR} references in dict entries of     tools.builtins, modifyi
    participant P595 as Fail a native (tmux/PTY) harness command with an actionable message.      The
    participant P596 as Launch Claude Code in an agent-meow terminal.      \b     Examples:       ag
    participant P597 as Launch Codex TUI in an agent-meow terminal.      \b     Examples:       agen
    participant P598 as Launch OpenCode TUI in an agent-meow terminal.      \b     Examples:       a
    participant P599 as Launch Pi TUI in an agent-meow terminal.      \b     Examples:       agent-m
    participant P600 as Return the canonical brain harness of a bundled agent, or None.      Reads
    participant P601 as Ensure the bundled agent's brain harness has a credential to launch with.
    participant P602 as Launch the Cursor TUI in an agent-meow terminal.      \b     Examples:
    participant P603 as Launch the Kiro TUI in an agent-meow terminal.      \b     Examples:       a
    participant P604 as Reject Kiro-owned resume flags in passthrough args.
    participant P605 as Build mapped Kiro CLI args for the runner-owned terminal launch.
    participant P606 as Launch the Goose TUI in an agent-meow terminal.      \b     Examples:
    participant P607 as Launch the Hermes TUI in an agent-meow terminal.      \b     Examples:
    participant P608 as Launch the Antigravity (agy) TUI in an agent-meow terminal.      \b     Examp
    participant P609 as Launch the qwen (Qwen Code) TUI in an agent-meow terminal.      \b     Exampl
    participant P610 as Forward a bundled-agent subcommand to run on its packaged path.      Imple
    participant P611 as Launch polly, the bundled multi-agent coding orchestrator.      Shorthand for
    participant P612 as Launch debby, the bundled two-headed brainstorming agent.      Shorthand for 
    participant P613 as Launch the Kimi Code TUI in an agent-meow terminal.      Boots Moonshot AI's i
    participant P614 as Resume an agent-meow conversation, auto-dispatching by runtime.      \b     W
    participant P615 as Fail fast when *harness* is not a supported agent-meow harness.      :param ha
    participant P616 as Return the lightweight generated-agent instructions for *harness*.      :param
    participant P617 as Create a temporary standalone agent-meow YAML for no-AGENT run.      The g
    participant P618 as Return the no-AGENT run guidance shown on missing input.
    participant P619 as Outcome of parsing the click --resume option value.      Named fields rath
    participant P620 as Translate the click --resume option value into the internal     resume_pi
    participant P621 as Build the flag-preserving prefix for the resume command from Click's     parsed
    participant P622 as Launch a *-native terminal harness via its TUI wrapper directly.      ru
    participant P623 as Reject run AGENT --harness <x>-native: native harnesses own their TUI.
    participant P624 as Route agent-meow run to the right impl.      The click path always drives
    participant P625 as Resolve the agent-meow server URL attach should join.      Resolution orde
    participant P626 as Fail loud unless *conversation_id* is reachable on *base_url*.      attach
    participant P627 as Attach the REPL to a LIVE session — never starts anything.      attach is
    participant P628 as Start a session with an agent-meow agent.      AGENT may be an agent YAML file
    participant P629 as host group that accepts a server URL as a positional argument.      agen
    participant P630 as Redirect a leading URL-like positional into --server.          agent-meo
    participant P631 as Rewrite a leading URL-like positional into an explicit --server.
    participant P632 as Return whether a token may be used as positional host server.          The
    participant P633 as Ask whether to also stop the detached local agent-meow server after exit.
    participant P634 as Register this machine as a host with a server.      \b     Examples:       a
    participant P635 as Read a group-level agent-meow host option for a subcommand.      :param ct
    participant P636 as Resolve a host-management server from CLI or config.      :param server: Expli
    participant P637 as Resolve the agent-meow server URL for a daemon record.      :param record: Dae
    participant P638 as Select daemon records for a host-management command.      :param server: Expli
    participant P639 as Send one management request to an agent-meow server.      :param base_url: age
    participant P640 as Extract a concise error string from an agent-meow response body.      :param b
    participant P641 as Build query parameters for one sessions page.      :param connected_only: When
    participant P642 as Decode one GET /v1/sessions response page.      :param result: HTTP result
    participant P643 as Fetch every available session page from a server.      :param base_url: agent-
    participant P644 as Fetch sessions owned by a daemon's host id.      :param record: Daemon record
    participant P645 as Resolve live runner connectivity for sessions.      :param base_url: agent-meo
    participant P646 as Add runner_online to session rows.      :param base_url: agent-meow server
    participant P647 as Build daemon metadata for status output.      :param record: Daemon registry r
    participant P648 as Add host status or host status error to a daemon payload.      :param payload:
    participant P649 as Add owned sessions and runner connectivity to a daemon payload.      :param pa
    participant P650 as Build a display payload for one daemon.      :param record: Daemon registry re
    participant P651 as Build the Rich console used by host management output.      :returns: A :class
    participant P652 as Build a host CLI table with the shared style.      :param title: Table title,
    participant P653 as Convert optional payload values into display text.      :param value: Payload
    participant P654 as Shorten long daemon, session, and runner identifiers for terminal display.
    participant P655 as Truncate long text from the right for compact terminal display.      :param te
    participant P656 as Escape dynamic values before embedding them in Rich markup.      :param text:
    participant P657 as Build a compact daemon target label.      :param payload: Payload from :func:
    participant P658 as Pick a Rich style for a daemon, host, or session status.      :param value: St
    participant P659 as Return a display state for the session's bound runner.      :param session: Se
    participant P660 as Compute compact sessions table widths for the available terminal space.      :
    participant P661 as Render one daemon's owned sessions as a compact table.      :param console: Ri
    participant P662 as Render host status as one block per daemon target.      :param payloads: Paylo
    participant P663 as Inspect host daemon, runner, and session status.      :param ctx: Click contex
    participant P664 as Stop one agent-meow session via the server lifecycle event API.      :param ba
    participant P665 as Stop sessions owned by a daemon before terminating it.      :param record: Dae
    participant P666 as Terminate one local daemon process.      :param record: Daemon record whose pr
    participant P667 as Stop host daemon sessions, then stop daemon processes.      :param ctx: Click
    participant P668 as Stop specific sessions without stopping a daemon.      :param ctx: Click conte
    participant P669 as Print the installed agent-meow version.
    participant P670 as Parse and validate KEY=VALUE pairs from the config command.      Raise
    participant P671 as Validate keys passed to --unset against _GLOBAL_CONFIG_KEYS.      Rais
    participant P672 as Print the effective CLI defaults (user + project-level).      The KEY=VALUE
    participant P673 as config group that nudges the pre-split flat form to the subcommands.
    participant P674 as Intercept the legacy flat form before normal group parsing.          :param ct
    participant P675 as Get, set, and view agent-meow defaults and credentials.      Defaults (auto_op
    participant P676 as List the effective defaults and configured credentials.      Prints the defaul
    participant P677 as Set one or more agent-meow defaults.      Without --global, pairs are writ
    participant P678 as Remove one or more agent-meow defaults.      :param is_global: When True,
    participant P679 as Return the node --version string (e.g. v20.12.2) or None.      Use
    participant P680 as Return a one-line problem if Node is missing or too old, else None.      T
    participant P681 as Run Databricks setup against a temp config containing only our three profiles.
    participant P682 as Configure coding harnesses to use Databricks Unity AI Gateway.      Shells out
    participant P683 as Warn about external (non-Python) tools the coding harnesses need.      Surface
    participant P684 as Return the name of a key provider on *family* using *api_key_ref*.      Tw
    participant P685 as Return *candidate*, suffixed numerically until it's a free provider name.
    participant P686 as Pick the entry name for an API key being added — update vs keep-both.      Rea
    participant P687 as A short, non-secret descriptor of where a key's secret comes from.      Used t
    participant P688 as Count the key providers serving *family*.      The ($VAR) disambiguati
    participant P689 as A credential label, qualified with its source when keys would collide.      Wr
    participant P690 as Run the interactive add a provider flow and persist the entry.      Prompt
    participant P691 as Persist ambient-detected providers into the config, returning new names.
    participant P692 as Backfill a databricks providers entry from an existing global auth: block.
    participant P693 as A short, brand-qualified label for an auto-configured credential.      Unlike
    participant P694 as Print the \"found existing credentials → auto-configured\" callout.      Re-runs
    participant P695 as Self-heal config, adopt ambient credentials, and announce what was added.
    participant P696 as One selectable row in a harness's provider-management menu (level 2).      :pa
    participant P697 as A friendly, jargon-free label for a configured credential.      A logged-in CL
    participant P698 as Build the level-2 rows: each credential serving *family*, then + Add.
    participant P699 as Offer to install an uninstalled harness CLI; return whether to proceed.      S
    participant P700 as Run the level-2 loop for one harness: pick a credential or add one.      Selec
    participant P701 as Offer to install the missing cursor extra; return a status line.      Show
    participant P702 as Run the level-2 loop for Cursor: manage its CURSOR_API_KEY.      Cursor ru
    participant P703 as Prompt for and store a Cursor CURSOR_API_KEY; return a status line.      O
    participant P704 as Offer to install the missing antigravity extra; return a status line.
    participant P705 as Run the level-2 loop for Antigravity: set / replace / remove its Gemini key.
    participant P706 as Prompt for and store a Gemini API key; return a status line.      Offers an ex
    participant P707 as Best-effort check whether Qwen Code can authenticate non-interactively.      Q
    participant P708 as Print Qwen's authentication options (it has no qwen login).
    participant P709 as Launch the interactive qwen TUI so the user can run /auth.      The 
    participant P710 as Run the level-2 loop for Qwen Code: install the CLI and guide auth setup.
    participant P711 as Print Goose's configuration options (agent-meow manages no Goose credential).
    participant P712 as Launch the interactive goose configure flow; return a status line.      
    participant P713 as Run the level-2 loop for Goose: ensure the CLI, then guide goose configure.
    participant P714 as Run the level-2 loop for Hermes: ensure the CLI is installed.      Hermes owns
    participant P715 as Run the level-2 loop for Kiro: ensure the CLI is installed and signed in.
    participant P716 as Print Kimi Code's authentication options.      Kimi authenticates against Moon
    participant P717 as Run the level-2 loop for Kimi Code: install the CLI and drive kimi login.
    participant P718 as Offer to install the missing copilot extra; return a status line.      Sho
    participant P719 as Run the level-2 loop for Copilot: manage its GitHub token.      Copilot runs v
    participant P720 as Prompt for and store a Copilot GitHub token; return a status line.      Offers
    participant P721 as Run the level-3 loop for one credential: make default / remove.      Opened by
    participant P722 as Sign out of the harness CLI and remove the subscription credential.      Unlik
    participant P723 as Remove a databricks provider and clean up ucode's harness wiring.      A kin
    participant P724 as Make *provider* the default for *family* and persist wholesale.      :param pr
    participant P725 as Drop *name* from the persisted dismissed_detections list, if present.
    participant P726 as Remove the *provider* credential and persist wholesale.      The stored secret
    participant P727 as Launch interactive opencode auth login; return a post-login status.      
    participant P728 as Show opencode auth list (stored credentials + detected env providers).
    participant P729 as Return the provider/model ids OpenCode can launch (opencode models).
    participant P730 as Pick OpenCode's default model and persist it as opencode_model.      The c
    participant P731 as Explain where OpenCode's model credentials come from.
    participant P732 as Run the level-2 drill-in for OpenCode: ensure the CLI, then manage providers.
    participant P733 as Run the interactive model/credential three-level picker.      Invoked by age
    participant P734 as Launch the agent-meow first-time setup flow.      By default this runs the sta
    participant P735 as Internal maintenance commands (advanced — not needed for normal use).      Hou
    participant P736 as Upgrade the schema of an agent-meow tracking database to the     latest support
    participant P737 as Remap user identities when switching the accounts provider to OIDC.      The a
    participant P738 as Whether a /api/2.0/agent-meow mount probe answered like agent_meow.      :
    participant P739 as Best-effort bearer for *workspace_host* from the OAuth cache.      Unlike :fun
    participant P740 as Prepend a scheme to a schemeless server URL, defaulting to https.      The int
    participant P741 as Expand a bare Databricks workspace URL to its agent-meow API base.      http
    participant P742 as Normalize a user-supplied --server value to the agent-meow API base.
    participant P743 as Return the workspace host when *server* sits behind Databricks auth.      Reco
    participant P744 as Extract the ?o=<workspace-id> workspace selector from *url*.      A Databr
    participant P745 as Append the ?o=<org> workspace selector to *workspace_host*.      databri
    participant P746 as Log in to a Databricks-fronted agent-meow server.      Covers both Databricks
    participant P747 as Run the browser login for a workspace and mint a bearer from it.      :param w
    participant P748 as Run databricks auth login --host <workspace> (browser flow).      :param w
    participant P749 as Probe GET /v1/me on *server* with a workspace bearer.      :param server:
    participant P750 as Mint a bearer for a workspace from the host-keyed OAuth cache.      :param wor
    participant P751 as Persist *server* as the user-level default after a successful login.      A ba
    participant P752 as Authenticate with a remote agent-meow server.      Probes the server's auth mo
    participant P753 as Run the accounts-mode login flow: prompt + POST /auth/login.      No browser,
    participant P754 as Split the parent agent-meow pane and run the chooser in the new pane.      Int
    participant P755 as Launch a fresh REPL conversation in the current new pane.      Internal subcom
    participant P756 as Return *argv* with all resume-related flags removed.      Handles three flag s
    participant P757 as Return *argv* with one-shot conversation flags     (-p/--prompt/--sys
    participant P758 as # NOTE: the host daemon + agent-meow server are ensured inside run_chat's
    participant P759 as Return a migration hint for a legacy first token, else None.          :par
    participant P760 as build_app()
    participant P761 as _FakeReq
    participant P762 as _StubAuthProvider
    participant P763 as _NoopRunnerWS
    participant P764 as _build_accounts_app()
    participant P765 as _build_app()
    participant P766 as test_launch_runner_validates_workspace_boundary()
    participant P767 as CreateDirectoryRequest
    participant P768 as LaunchRunnerRequest
    participant P769 as _ResolvedConfig
    participant P770 as Server-side WebSocket endpoint for host tunnels.  Hosts (machines running ag
    participant P771 as Build the router hosting the /hosts/{id}/tunnel WS endpoint.      Mounted
    participant P772 as Refuse a WebSocket upgrade before accept() with a real HTTP status.      U
    participant P773 as Send queued frames on the WebSocket owner loop.      :param ws: Accepted Starl
    participant P774 as Receive host frames and route results to pending futures.      :param ws: Acce
    participant P775 as Send pings every PING_INTERVAL_S; declare dead after misses.      Each tick th
    participant P776 as _BuiltApp
    participant P777 as _build_liveness_app()
    participant P778 as REST API routes for hosts (/v1/hosts).  Provides endpoints for listing con
    participant P779 as Send a host.list_dir frame and await the result.      Mirrors the structur
    participant P780 as Send a host.create_dir frame and await the result.      Mirrors :func:_pr
    participant P781 as Request body for POST /v1/hosts/{host_id}/directories.      :param path: A
    participant P782 as Request body for POST /v1/hosts/{host_id}/runners.      :param session_id:
    participant P783 as Read the bound agent's os_env.cwd for workspace-boundary checks.      :par
    participant P784 as Read the bound agent's canonical harness for the launch frame.      Mirrors :f
    participant P785 as Build the router for host REST endpoints.      Mounted with prefix=\"/v1\" s
    participant P786 as Integration tests for the host REST API endpoints.
    participant P787 as Build an ASGI WebSocket scope.      :param path: WebSocket path.     :returns
    participant P788 as Encode a HostHelloFrame for tests.      :param name: Human-readable host name.
    participant P789 as FastAPI app with host tunnel + REST routes and stores.      :param db_uri: SQL
    participant P790 as Connect a mock host via WebSocket tunnel.      :param app: FastAPI app with ho
    participant P791 as Verify list_hosts returns empty when no hosts are connected.      If a non-emp
    participant P792 as Verify a connected host appears in the list with status 'online'.      If stat
    participant P793 as Verify a server-managed sandbox host carries its provider in the list.      Cl
    participant P794 as Verify get_host returns the correct details for a connected host.
    participant P795 as Verify the readiness map a host reports in its hello is persisted     and surfa
    participant P796 as Verify a host that doesn't report readiness (older build) lists     with config
    participant P797 as Verify get_host returns 404 for an unknown host_id.
    participant P798 as Verify a host connected to replica B is reported as online     when GET /
    participant P799 as Verify a host that has disconnected is reported as offline.      After the
    participant P800 as Verify the full launch flow: host receives launch frame, responds     with 'lau
    participant P801 as Verify the dedicated launch endpoint maps a host refusal carrying     error_cod
    participant P802 as Verify launch returns 409 when the host is in the DB but not     connected.
    participant P803 as Verify launch returns 400 when the session already has a runner.      If it re
    participant P804 as Verify launch returns 404 when the host doesn't exist.
    participant P805 as Auth provider that returns a user ID from a request header.      Lets tests si
    participant P806 as Initialize with a header name.          :param header: HTTP header carrying th
    participant P807 as Extract user ID from the request header.          :param request: FastAPI Requ
    participant P808 as App with auth provider for multi-user ownership tests.      :param db_uri: SQL
    participant P809 as Verify that GET /v1/hosts only returns hosts owned by the     requesting user.
    participant P810 as Verify that GET /v1/hosts/{id} returns 403 when the requesting     user doesn't
    participant P811 as Verify that POST /v1/hosts/{id}/runners returns 403 when the     requesting use
    participant P812 as POST /v1/hosts/{id}/runners validates the requested workspace against     the a
    participant P813 as With an auth provider configured, a tunnel connection carrying no     identity
    participant P814 as With auth configured, a tunnel carrying a valid identity registers     the host
    participant P815 as Register an online host with a no-op WebSocket for ownership tests.
    participant P816 as The shared launch-authorization helper rejects every cross-user     path and on
    participant P817 as Bob owns the host (host-owner check passes) but targets Alice's     session → 4
    participant P818 as A peer connecting to another owner's host_id is refused, and that     refusal m
    participant P819 as A host.runner_exited frame from the daemon reaches the runner     status en
    participant P820 as A host.runner_exited frame fires the on_runner_exited     callback with
    participant P821 as _FakeWebSocket
    participant P822 as ManagedSessionEnv
    participant P823 as Integration tests for the inline host-launch path of POST /v1/sessions.  T
    participant P824 as Minimal runner WebSocket fake for registering a tunnel session.
    participant P825 as Accept outbound tunnel frames without sending them anywhere.
    participant P826 as Block forever; tests do not drive runner inbound frames.
    participant P827 as Build a runner hello frame for test tunnel registrations.      :returns: Hello
    participant P828 as FastAPI app wired WITH host_store so the inline host-launch     branch of 
    participant P829 as Build a minimal ASGI WebSocket scope for the host tunnel.      :param path: We
    participant P830 as Connect a mock host over the WebSocket tunnel and wait for it     to register i
    participant P831 as Wait until the app registry has a connect waiter for a runner.      :param app
    participant P832 as Answer the host round-trips for a single inline session launch.      The inlin
    participant P833 as Answer the host's host.stop_runner round-trip for one Stop.      Reads the
    participant P834 as Watch host outbound frames for a launch frame within a budget.      Reads the
    participant P835 as Watch host outbound frames and return the first launch frame seen.      The po
    participant P836 as Happy path: POST /v1/sessions with host_id + workspace     validate
    participant P837 as When the host reports the launch failed, the inline path still     returns 201
    participant P838 as A harness_not_configured refusal at CREATE is fully lenient.      The pick
    participant P839 as A message whose host relaunch is refused persists user msg + error.      The f
    participant P840 as host_id set with a missing or non-absolute workspace is     rejected at
    participant P841 as Inline-launch a host-bound session and return its id + runner_id.      Drives
    participant P842 as Drive stop_session and serve the host's stop_runner round-trip.      Insta
    participant P843 as stop_session on a host-launched session also stops the runner.      Killin
    participant P844 as After Stop, no marker is written and the host stays reachable.      Stop is no
    participant P845 as A message to a stopped host session relaunches the runner.      Stop is non-st
    participant P846 as A message to a host session whose runner is offline (but NOT     deliberately s
    participant P847 as The first message waits for the already-bound runner to register.      The Web
    participant P848 as GET /health?session_ids=... reads host liveness from the DB, not the local r
    participant P849 as header_mode_app()
    participant P850 as test_runner_exited_report_surfaces_in_runner_status()
    participant P851 as OSS Docker entrypoint for the agent-meow server.  Mirrors deploy/databricks/
    participant P852 as Configuration resolved before migrations and app construction.
    participant P853 as The FastAPI app plus resolved bind settings.      _resolve_config handles
    participant P854 as Run the Alembic upgrade against database_url.      The SQLAlchemy stores r
    participant P855 as Load config and resolve startup settings before migrations run.
    participant P856 as Pick the artifact store implementation from the resolved config.      An s3:
    participant P857 as Resolve config if needed, wire the stores, and build the app.      This functi
    participant P858 as Boot the server: build the app and hand it to uvicorn.      Wraps the whole bo
    participant P859 as Tests for the accounts auth provider.  Covers the four layers of the stack
    participant P860 as Strip an ambient OMNIGENT_OIDC_ISSUER for the accounts suite.      With au
    participant P861 as hash_password + verify_password accept the original plaintext.      If this br
    participant P862 as The hash uses argon2id (modern OWASP-recommended variant).      Argon2 is self
    participant P863 as verify_password raises InvalidPasswordError on mismatch.      Routes rely on t
    participant P864 as A corrupted stored hash collapses to InvalidPasswordError.      Same exception
    participant P865 as A hash just produced by hash_password does NOT need rehash.      The login rou
    participant P866 as Populate every required env var so from_env() doesn't fail loud.
    participant P867 as from_env() parses every required var into the dataclass.
    participant P868 as A missing COOKIE_SECRET raises with a remediation message.
    participant P869 as COOKIE_SECRET shorter than 32 bytes is rejected.      HS256 with a key shorter
    participant P870 as A non-hex COOKIE_SECRET raises with a clear message.
    participant P871 as An http:// base URL disables Secure cookies + __Host- prefix.      Browser
    participant P872 as BASE_URL must start with http(s):// — fail loud otherwise.
    participant P873 as INIT_ADMIN_PASSWORD=\"\" is treated as unset, not as a literal empty password.
    participant P874 as Build an AccountsConfig with the test secret + a configurable URL.
    participant P875 as Minimal HTTPConnection stand-in for cookie/header tests.      Used over MagicM
    participant P876 as The accounts source extracts a user_id from a valid session JWT.
    participant P877 as Reserved usernames in a cookie's sub claim are rejected.      Belt-and-suspend
    participant P878 as A cookie signed by a different key is rejected.      Cross-deployment cookie r
    participant P879 as CLI bearer tokens (no cookie) also authenticate against accounts.      The run
    participant P880 as In accounts mode, login_url is the SPA route, not the API route.      The fron
    participant P881 as A managed runner's minted owner token resolves back to the owner.      The san
    participant P882 as No token for an empty or reserved owner — never mint reserved-identity creds.
    participant P883 as Header/proxy auth can't be minted server-side, so it returns None.      Identi
    participant P884 as A short TTL genuinely expires: past its exp, get_user_id returns None.      Th
    participant P885 as Env-unset resolves to header — the shared resolver's baseline.      This is th
    participant P886 as OMNIGENT_AUTH_ENABLED=1 (no OIDC config) opts into accounts mode.
    participant P887 as OMNIGENT_AUTH_ENABLED=1 + an OIDC issuer selects oidc, not accounts.
    participant P888 as An OIDC issuer alone (auth switch off) does NOT enable oidc.      The issuer o
    participant P889 as The pre-rename OMNIGENT_ACCOUNTS_ENABLED alias still works.      Existing
    participant P890 as The current name wins when both names are set.      A deploy migrating to OM
    participant P891 as An explicit provider wins and is returned lower-cased, verbatim.      The reso
    participant P892 as Unset OMNIGENT_AUTH_PROVIDER (+ no enable switch) → header mode.      The ship
    participant P893 as Explicit OMNIGENT_AUTH_PROVIDER=header wins over the enable switch.      A
    participant P894 as Explicit accounts setting still works the same way.
    participant P895 as A bogus AUTH_PROVIDER value fails loud, doesn't fall through.
    participant P896 as An explicitly falsy OMNIGENT_AUTH_ENABLED → header mode.      Header is al
    participant P897 as A truthy OMNIGENT_AUTH_ENABLED (no OIDC) opts INTO accounts mode.      Thi
    participant P898 as Explicit AUTH_PROVIDER=accounts wins over AUTH_ENABLED=0.      The ena
    participant P899 as Build a fresh accounts store on a temp sqlite DB.      Goes through the real m
    participant P900 as Redirect $HOME so cli_auth.store_token writes to a temp file.      Without thi
    participant P901 as A supplied password creates the admin on first boot.      The flag/env path (
    participant P902 as No supplied password → NO admin, NO default credential, needs_setup.      The
    participant P903 as Re-running bootstrap is a no-op once the admin exists.      A re-bootstrap MUS
    participant P904 as A second boot with a new password is a no-op — the first wins.      The admin
    participant P905 as Remote (non-loopback) + no password → needs_setup, no token, no auto-open.
    participant P906 as Loopback + no password → needs_setup, browser auto-opens to the form.      Loc
    participant P907 as Supplied password on loopback → admin created, CLI token written, no auto-open.
    participant P908 as A returning boot (admin already exists) re-mints the CLI token for this spawn.
    participant P909 as OMNIGENT_ACCOUNTS_INIT_ADMIN_USERNAME wins over the OS user.      The override
    participant P910 as With no env override, the OS user (via getpass) is the admin name.      This i
    participant P911 as OS user matching a reserved sentinel (local / __public__)     falls bac
    participant P912 as Names that don't match the username regex fall back to \"admin\".      Covers OS
    participant P913 as Build a production-shaped accounts-mode app + TestClient.      Shared by the :
    participant P914 as Accounts-mode app with the admin pre-seeded (admin / admin-pw-12345).
    participant P915 as Accounts-mode app with NO admin yet — first-run setup pending.      No INIT_
    participant P916 as An app wired in header mode (accounts OFF) for negative-case tests.      Mirro
    participant P917 as Log in via /auth/login and confirm the session cookie was set.
    participant P918 as /v1/info reports accounts_enabled=true when the provider is active.      T
    participant P919 as /v1/info reports accounts_enabled=false in header mode.      The frontend
    participant P920 as Wrong password → 401 with a generic error message.      The message MUST NOT d
    participant P921 as Unknown user → same 401 + same generic message as wrong-password.
    participant P922 as Correct credentials → 200 + session cookie + user payload.
    participant P923 as No cookie → /auth/me returns 401.
    participant P924 as Cookie-authed call returns the user's identity + admin flag.
    participant P925 as /auth/logout returns 204 and emits a Set-Cookie that clears the session.
    participant P926 as /auth/invite refuses non-admin callers with 403.      Privilege separation: or
    participant P927 as The same invite cannot be redeemed twice.      Atomic single-use is enforced a
    participant P928 as Reserved usernames (\"local\", \"__public__\") cannot be claimed.      The auth pr
    participant P929 as Cross-user isolation: a regular member can't reach admin routes.      The Alic
    participant P930 as Magic-link redeem in a fresh browser signs the same user in.      Closes the C
    participant P931 as A second redeem of the same token redirects to /login?magic=expired.
    participant P932 as Magic-link minting requires an authenticated session.      Without this check,
    participant P933 as GET /auth/users returns every account for admin callers.
    participant P934 as The Members page hides \"local\" and \"__public__\".      Both rows exist
    participant P935 as Deleting the calling admin is refused with 400.      Prevents self-lockout: de
    participant P936 as The previously-locked bootstrap admin IS deletable when another admin exists.
    participant P937 as If only one admin exists, deleting them returns 400.      Closes the same reco
    participant P938 as Admin-issued reset returns the new plaintext password exactly once.      This
    participant P939 as Admin DELETE /auth/users/{id} succeeds and removes the user.      The refusal
    participant P940 as POST /auth/users/me/password rotates the password.      Correct old password →
    participant P941 as Wrong old_password → 401, password is NOT rotated.      Required because the r
    participant P942 as purge_expired_tokens deletes expired rows + returns the count.      Boundary c
    participant P943 as agent-meow login in accounts mode prompts → POSTs → stores token.      Mocks
    participant P944 as A 401 from /auth/login → ClickException with the generic message.      The ser
    participant P945 as A network error reaching /auth/login → ClickException, not traceback.      Cov
    participant P946 as On a fresh instance, /auth/setup claims the first admin + signs in.      The r
    participant P947 as First-run web admin-claim mints the loopback CLI token.      The local CUJ: 
    participant P948 as /auth/setup hard-locks the instant any account exists.      This is the gate t
    participant P949 as A second /auth/setup after the first claim is rejected with 409.
    participant P950 as _HostCapture
    participant P951 as test_health_reports_online_for_host_on_other_replica()
    participant P952 as _StubWebSocket
    participant P953 as Integration tests for git worktree creation on the dedicated per-session bind e
    participant P954 as FastAPI app wired WITH host_store so launch_runner can     resolve host
    participant P955 as Minimal WebSocket stand-in (the registry only enqueues).
    participant P956 as No-op send — frames flow through the outbound queue.          :param data: JSO
    participant P957 as Frames a fake host received during one launch_runner call.      :param cre
    participant P958 as Yield a factory that registers a fake host with a replying drain.      The dra
    participant P959 as Create an unbound session (agent only, no host/workspace).      :param client:
    participant P960 as POST the dedicated per-session bind+launch endpoint.      :param client: The t
    participant P961 as launch_runner with a git block creates a worktree off the     source re
    participant P962 as Without a git block the endpoint binds the source directory     directly an
    participant P963 as When the host fails the launch, the just-created worktree is     rolled back AN
    participant P964 as A second bind succeeds after the first launch failed.      End-to-end proof of
    participant P965 as Integration tests for session creation with host_id and reconnect reconciliation
    participant P966 as Build an ASGI WebSocket scope.      :param path: WebSocket path.     :returns
    participant P967 as Encode a HostHelloFrame for tests.      :param name: Host name.     :param ru
    participant P968 as App with host tunnel + REST routes for binding tests.      :param db_uri: SQLi
    participant P969 as Connect a mock host and wait for registration.      :param app: FastAPI app.
    participant P970 as Verify that POST /hosts/{id}/runners writes both runner_id and     host_id to t
    participant P971 as Verify that host_id appears in session responses after being set.      If host
    participant P972 as Verify that when a host reconnects with an empty runners list,     and there's
    participant P973 as Full app wired for managed-host sessions (no real sandbox).      Builds the pr
    participant P974 as Assembled managed-session test environment.      :param app: The full FastAPI
    participant P975 as Act as the host process inside the (fake) sandbox.      Connects to the app's
    participant P976 as Poll the session row until the background managed launch binds it.      The ma
    participant P977 as POST /v1/sessions with host_type=\"managed\" returns     immediately and
    participant P978 as POST /v1/sessions with host_type=\"managed\" and a     <repo>#<branch>
    participant P979 as A model_validator rejection (here: a path workspace on a managed     create) re
    participant P980 as host_type=\"managed\" on a server with no sandbox: config     must fail w
    participant P981 as The managed create is non-blocking, and a message racing the     provision rend
    participant P982 as A managed launch reports live progress: the snapshot carries the     seeded p
    participant P983 as A child session of a managed session runs IN the parent's sandbox.      Sub-ag
    participant P984 as A message to a session whose managed sandbox died provisions a new     sandbox
    participant P985 as Shutdown teardown does not hang on an in-flight managed provision.      The li
    participant P986 as Deleting a managed session mid-provision tears the sandbox down.      The dele
    participant P987 as _build_app_with_stub_stores()
    participant P988 as test_health_unbound_fork_of_coding_session_reads_offline()
    participant P989 as Integration tests for session permission endpoints.  Exercises the full middle
    participant P990 as App fixture with permission store enabled.      Mirrors the shared app fix
    participant P991 as HTTP client wired to the auth-enabled FastAPI app.      Same lifecycle pattern
    participant P992 as App fixture modeling the explicit single-user local runtime.      Same wiring
    participant P993 as HTTP client wired to the single-user-mode FastAPI app.      Same lifecycle pat
    participant P994 as Auth-enabled app that also wires a host store.      Same shape as :func:auth_
    participant P995 as HTTP client for the host-enabled auth app (mirrors auth_client).
    participant P996 as Register an online host owned by owner on the app.      Persists the host
    participant P997 as Create a session as a specific user.      Uses multipart bundled create so eac
    participant P998 as Grant a permission on a session.      :param client: The test HTTP client.
    participant P999 as Revoke a permission on a session.      :param client: The test HTTP client.
    participant P1000 as List sessions visible to a specific user.      :param client: The test HTTP cl
    participant P1001 as List permissions on a session.      :param client: The test HTTP client.
    participant P1002 as Full permission lifecycle: grant, downgrade, revoke, self-revoke     block, and
    participant P1003 as A user with no grants sees an empty session list.
    participant P1004 as A user with read-only access can GET a session but cannot POST events.
    participant P1005 as An editor can post ordinary events but cannot stop the session.      stop_se
    participant P1006 as A user with edit access can POST events but cannot manage permissions.
    participant P1007 as Archiving a session is gated owner-only: a read-only viewer and     an editor a
    participant P1008 as The cost-control switch rides the PATCH route's edit gate.      A read-only co
    participant P1009 as A __public__ read grant does NOT list the session, but direct GET works.
    participant P1010 as The GET-snapshot permission_level reflects the resolved level     for the c
    participant P1011 as GET /sessions/{id}/permissions returns all grants for the session.
    participant P1012 as On a single-user local runtime, headerless requests work as 'local'.      The
    participant P1013 as An admin user can access sessions they have no explicit grant for.      Sets t
    participant P1014 as Revoking a user who has no grant returns 204 (no error).
    participant P1015 as A grant on session A does not grant access to session B.
    participant P1016 as A user with only read access cannot grant permissions.
    participant P1017 as A user without manage access cannot revoke permissions.
    participant P1018 as Creating a session auto-grants the creator manage access.
    participant P1019 as Granting a higher level to an existing user upgrades the grant.
    participant P1020 as Requests without X-Forwarded-Email are rejected (401) in header mode.      Reg
    participant P1021 as Headerless requests default to 'local' on a single-user runtime.
    participant P1022 as The session owner cannot grant themselves ANY level — self-modification is fully
    participant P1023 as The session owner cannot revoke themselves — self-modification is fully blocked.
    participant P1024 as Multiple sessions with mixed grants produce correct per-user visibility.
    participant P1025 as Out-of-range grant levels (0, 4, -1) are rejected with 422 by Pydantic.      T
    participant P1026 as A valid grant level (2) succeeds with 200, confirming the validation boundary.
    participant P1027 as Session list respects pagination cursors when filtered by permission.      Bry
    participant P1028 as Owner (level 4) grants cannot be revoked or overwritten.      Bryan creates S1
    participant P1029 as Read-only cannot PATCH title; edit can. Runner_id requires owner.      Bryan c
    participant P1030 as A user with read access can GET session items; a user with no access gets 404.
    participant P1031 as A user with no grant gets 404 when requesting the SSE stream.      The permiss
    participant P1032 as A user with no access cannot fork; a user with read access can.      Bryan cre
    participant P1033 as GET /sessions/{id}/owner returns the session creator for any user with read acce
    participant P1034 as GET /sessions/{id}/owner returns 404 for users with no access.
    participant P1035 as GET /v1/sessions includes the owner field so the sidebar     can display it wit
    participant P1036 as The owner field is present even when the requesting user     is the session own
    participant P1037 as Create a session via multipart upload as a specific user.      Returns the ful
    participant P1038 as A caller cannot supply another user's session as     parent_session_id to i
    participant P1039 as Positive path: when Alice grants Bob read access to     her session, Bob can re
    participant P1040 as Multipart path: a caller cannot supply another user's     session as metadata
    participant P1041 as Positive path, multipart: with READ access to Alice's     session, Bob's bundle
    participant P1042 as A caller cannot execute another user's session-scoped     agent by raw agent_
    participant P1043 as Positive path: when Alice grants Bob read access to     the owning session, Bob
    participant P1044 as Session-scoped agents require the caller to have READ     access to the owning
    participant P1045 as Creating a session that targets another user's host is rejected     with 403 BE
    participant P1046 as A read-only collaborator can fork a shared session; the fork is     owned by th
    participant P1047 as Bob cannot create a git-worktree session on Alice's host.      Distinct from t
    participant P1048 as Bob cannot trigger worktree cleanup on Alice's session.      The delete endpoi
    participant P1049 as A user without READ on the parent cannot enumerate its child sub-agents.
    participant P1050 as A user granted READ on the parent may enumerate its children.      Confirms th
    participant P1051 as Terminate a buffered SSE stream request and return its response.      Repeated
    participant P1052 as Parse session.presence frames out of a raw SSE body.      :param body: The
    participant P1053 as Opening the stream registers the viewer, broadcasts the join to     co-subscrib
    participant P1054 as Dropping the stream (client disconnect) drives the generator's     finally
    participant P1055 as A single-user request with no identity falls back to the reserved     local
    participant P1056 as Viewers of a sub-agent page appear in the root page's presence     (and vice ve
    participant P1057 as _build_api_only_app()
    participant P1058 as test_resolve_host_launch_enforces_host_and_session_ownership()
    participant P1059 as managed_session_env()
    participant P1060 as test_managed_session_create_without_config_fails_clearly()
    participant P1061 as host_perm_app()
    participant P1062 as _SeedStores
    participant P1063 as _FixedAuthProvider
    participant P1064 as test_host_routes_mounted_with_host_store()
    participant P1065 as Return a cached Lakebase token for endpoint, minting if needed.          F
    participant P1066 as _LivenessApp
    participant P1067 as Integration tests for app-level routes.
    participant P1068 as End-to-end integration tests for accounts-mode authentication flows.  Exercise
    participant P1069 as Build a production-shaped accounts-mode FastAPI app.      Mirrors _build_acc
    participant P1070 as Accounts-mode app with admin pre-seeded.
    participant P1071 as Accounts-mode app with NO admin — first-run setup pending.
    participant P1072 as Async HTTP client wired to the pre-seeded accounts app.
    participant P1073 as Async HTTP client wired to the needs-setup accounts app.
    participant P1074 as Log in and return the session cookies as a dict.
    participant P1075 as Build a Cookie header dict from a cookies dict.
    participant P1076 as POST /auth/setup creates the first admin and returns a session.
    participant P1077 as POST /auth/setup returns 409 once an admin already exists.
    participant P1078 as POST /auth/login with valid creds returns 200 and sets a cookie.
    participant P1079 as POST /auth/login with wrong password returns 401.
    participant P1080 as POST /auth/login with unknown user returns 401.
    participant P1081 as GET /auth/me with a valid session cookie returns user info.
    participant P1082 as GET /auth/me without a session cookie returns 401.
    participant P1083 as Admin creates an invite, then a new user registers with it.
    participant P1084 as POST /auth/invite without admin rights returns 403.
    participant P1085 as POST /auth/users/me/password updates the password.
    participant P1086 as POST /auth/users/me/password with wrong old password returns 401.
    participant P1087 as GET /auth/users as admin returns the user list.
    participant P1088 as GET /auth/users as non-admin returns 403.
    participant P1089 as POST /auth/logout returns 204 and clears the session cookie.
    participant P1090 as POST /auth/magic mints a token; GET /auth/magic/redeem consumes it.
    participant P1091 as A second redeem of the same magic token redirects to login with error.
    participant P1092 as POST /auth/magic without a session returns 401.
    participant P1093 as host_aware_client()
    participant P1094 as app()
    participant P1095 as test_list_sessions_includes_workspace_and_host_id()
    participant P1096 as app()
    participant P1097 as _register_fake_host()
    participant P1098 as test_terminate_managed_host_terminates_and_deletes_row()
    participant P1099 as test_terminate_managed_host_deletes_row_even_when_terminate_fails()
    participant P1100 as test_terminate_managed_host_skips_mismatched_provider()
    participant P1101 as test_list_and_get_host_report_online_from_other_replica()
    participant P1102 as test_runner_exited_invokes_callback_with_runner_and_error()
    participant P1103 as _register_host()
    participant P1104 as test_managed_host_raw_token_never_stored()
    participant P1105 as Generate and post-process the agent-meow OpenAPI 3.2 document.  The agent-meow
    participant P1106 as Build a FastAPI app with stub stores sufficient for OpenAPI generation.      
    participant P1107 as Return the JSON-Schema dict for the ServerStreamEvent union.      Pydantic
    participant P1108 as Rewrite one SSE route's text/event-stream content for OAS 3.2.      FastAP
    participant P1109 as Assign the synthetic system tag to untagged utility routes.      FastAPI l
    participant P1110 as Move the session-resource subtree into its own session_resources tag.
    participant P1111 as Flatten a reST literal into a single-line Markdown code span.
    participant P1112 as Convert inline reST roles / literals in *text* to Markdown.
    participant P1113 as Join a field's (possibly multi-line) body into one Markdown string.
    participant P1114 as Split a reST docstring into Markdown prose and parsed fields.      Lines befor
    participant P1115 as Convert one reST description to Markdown.      Each :param name: whose
    participant P1116 as Rewrite an operation's (and its responses') reST docs as Markdown.      Matche
    participant P1117 as Rewrite a JSON-Schema node's reST description as Markdown.      A model's
    participant P1118 as Convert every operation's reST description to Markdown in place.
    participant P1119 as Convert every component schema's reST description to Markdown.
    participant P1120 as Final safety net: normalize inline reST in any remaining description.      Wal
    participant P1121 as Inject document-level metadata for docs / SDK tooling.      Adds info.descri
    participant P1122 as Build, generate, and post-process the OpenAPI 3.2 spec.      Encapsulates ever
    participant P1123 as CLI entry point.      With no arguments, regenerates openapi.json. With
    participant P1124 as GET /health returns HTTP 200 and {\"status\": \"ok\"}.
    participant P1125 as GET /api/version returns agent_meow.version.VERSION.      The endpoint sur
    participant P1126 as The server version is the shared agent_meow.version.VERSION constant.
    participant P1127 as Minimal real WebSocketLike for registering a runner tunnel.      The tunne
    participant P1128 as Unused — the liveness path never sends. Fails loud if reached.
    participant P1129 as Unused — the liveness path never receives. Fails loud if reached.
    participant P1130 as Register a live runner tunnel on the app's registry.      Mirrors what the run
    participant P1131 as A wired app plus the store that seeds its conversations.      :param app: The
    participant P1132 as Build a real app + conversation store wired for liveness tests.      :param db
    participant P1133 as GET /health?session_ids= reports the strict 4-state liveness     matrix, wi
    participant P1134 as GET /health?session_id= returns a single session object that     carrie
    participant P1135 as GET /health surfaces the bound host's version when that host has a     live
    participant P1136 as GET /v1/info includes server_version — the shared VERSION     const
    participant P1137 as GET /health with no session params still returns the bare     {\"status\":
    participant P1138 as An unbound fork of a coding session reads offline; a chat fork online.      Bo
    participant P1139 as The three stores the default-agent seeders take.      :param agent_store: Stor
    participant P1140 as Real stores wired for the default-agent seeders, backed by the     shared test
    participant P1141 as A writable copy of the packaged polly bundle, wired as the seed     source.
    participant P1142 as A fresh, migrated, independent set of seed stores under tmp_path.
    participant P1143 as A built-in's id is identical across two independent fresh stores — the     cont
    participant P1144 as A bad entry in OMNIGENT_BUILTIN_AGENT_DIRS is logged + skipped, not fatal.
    participant P1145 as Seeding registers qwen-native-ui as a built-in the picker can render.      The
    participant P1146 as A second seed call is a no-op — startup runs the seeder every boot.
    participant P1147 as Seeding registers polly as a built-in the picker can render.      The new-sess
    participant P1148 as Seeding registers antigravity-native-ui as a built-in the picker renders.
    participant P1149 as The startup seeder registers the antigravity built-in alongside the others.
    participant P1150 as A second seed call is a no-op — it must not register a duplicate.      Startup
    participant P1151 as A changed on-disk bundle refreshes the existing row in place.      This is the
    participant P1152 as A redeploy with unchanged content does NOT refresh the row.      A wheel reins
    participant P1153 as A matching-hash re-seed repairs a stale local agent cache.      AgentCache.l
    participant P1154 as Same content, different file-creation order → identical bundle bytes.      Con
    participant P1155 as A chmod-only difference must not change the bundle bytes.      Package vs inst
    participant P1156 as No bundle on disk → no card. Seeding is skipped, not errored.      On a deploy
    participant P1157 as Seeding registers debby as a built-in the picker can render.      The new-sess
    participant P1158 as No bundle on disk → no card. Seeding is skipped, not errored.      On a deploy
    participant P1159 as Build an app with the web UI bundle ABSENT (the API-only branch).      The dev
    participant P1160 as On a no-web-UI server, GET / always returns the HTML explainer with a     2
    participant P1161 as An unknown path still returns the exact default 404 {\"detail\": \"Not     Found
    participant P1162 as The / landing is an exact-path route, so real routes like /health     s
    participant P1163 as Integration tests for GET /v1/hosts/{id}/filesystem and GET /v1/hosts/{id
    participant P1164 as Build a minimal ASGI WebSocket scope.      :param path: WebSocket path, e.g. 
    participant P1165 as Encode a hello frame for tests.      :param name: Host name reported in the he
    participant P1166 as App with host tunnel + REST routes for filesystem-browse tests.      :param db
    participant P1167 as Connect a mock host and start an auto-replier for list_dir frames.      Tests
    participant P1168 as Verify the endpoint returns the runner-compatible response shape:     {\"objec
    participant P1169 as Verify that the empty-path endpoint forwards ~ to the host.      Per des
    participant P1170 as Verify that ~/projects in the URL reaches the host as     ~/projects (n
    participant P1171 as Verify a request for a host that doesn't exist returns 404.      The route mus
    participant P1172 as Verify a request for a host whose tunnel is closed returns 409.      The host
    participant P1173 as Verify that browsing a non-existent path on the host returns 404.      The hos
    participant P1174 as Verify status: \"failed\" from the host surfaces as 502.      Distinguishes
    participant P1175 as Verify NUL byte in path is rejected with 400 before reaching     the host.
    participant P1176 as Verify the owner check returns 403 when an authenticated caller     is not the
    participant P1177 as Verify the limit / after / before query params are     forwarded to
    participant P1178 as Verify limit above the configured max is rejected with 422.      Without a
    participant P1179 as E2E regression: a crashed host must read host_online: false.  Host livenes
    participant P1180 as An HTTP client over an app wired with a DB-backed host_store.      The def
    participant P1181 as Return the host_online value GET /health reports for a session.      :
    participant P1182 as Push a host's last-seen timestamp into the past, leaving status.      Models a
    participant P1183 as A session whose host crashed must report host_online: false.      Guards t
    participant P1184 as A host seen within the TTL still reads host_online: true (anti-flap).
    participant P1185 as test_launch_with_repo_clones_into_workspace()
    participant P1186 as test_launch_entrypoint_provider_arms_token_before_launch_host()
    participant P1187 as test_relaunch_rolls_sandbox_generation_under_same_host()
    participant P1188 as test_relaunch_failure_keeps_host_row_and_revokes_token()
    participant P1189 as multi_user_app()
    participant P1190 as management_app()
    participant P1191 as test_crashed_host_session_reads_host_offline()
    participant P1192 as test_recently_seen_host_reads_host_online()
    participant P1193 as _owned_app()
    participant P1194 as test_delete_host_removes_row_and_revokes_token()
    participant P1195 as With no web UI bundle, GET / serves a friendly HTML landing page     (statu
    participant P1196 as The SPA static mount advertises browser caching for cacheable assets.      Thi
    participant P1197 as With no host_store configured, the host tunnel + REST routers are not     mount
    participant P1198 as With a host_store configured, the host REST routes are mounted.
    participant P1199 as Header-mode auth: reject missing header, accept valid, reject reserved.      :
    participant P1200 as /v1/me reports is_admin for an admin-list identity not yet promoted.
    participant P1201 as PWA assets are served correctly from the SPA static mount.      sw.js must
    participant P1202 as _FakeWebSocket
    participant P1203 as _FakeWebSocket
    participant P1204 as test_launch_success_registers_host_and_returns_workspace()
    participant P1205 as test_launch_online_timeout_terminates_and_deletes_host()
    participant P1206 as test_launch_clone_failure_terminates_and_deletes_host()
    participant P1207 as test_relaunch_rejects_unconfigured_provider()
    participant P1208 as test_revoke_launch_token_keeps_row_but_stops_resolution()
    participant P1209 as Integration tests for POST /v1/hosts/{id}/directories.  Wires up a real ho
    participant P1210 as Build a minimal ASGI WebSocket scope.      :param path: WebSocket path, e.g. 
    participant P1211 as Encode a hello frame for tests.      :param name: Host name reported in the he
    participant P1212 as App with host tunnel + REST routes for create-directory tests.      :param db_
    participant P1213 as Connect a mock host and start an auto-replier for create_dir frames.      Test
    participant P1214 as A valid create request returns the created absolute path.      This is what th
    participant P1215 as An \"already exists\" host result maps to 409 with the message.      The picker
    participant P1216 as A relative path is rejected with 400 before reaching the host.      The host n
    participant P1217 as Creating under an unknown host returns 404 (don't leak existence).
    participant P1218 as Integration tests for host management edge cases.  Covers 8 gaps not exercised
    participant P1219 as FastAPI app with host + runner routes for management tests.      :param db_uri
    participant P1220 as GET /v1/runners returns an empty data list when no runners are connected.
    participant P1221 as GET /v1/runners/{id}/status returns online=false for a nonexistent runner.
    participant P1222 as GET /v1/runners/{id}/status omits the error field when no exit report exists.
    participant P1223 as GET /v1/hosts/{id} includes a 'runners' list in the response.      The Web UI
    participant P1224 as POST /v1/hosts/{id}/runners with missing session_id returns 422.      The requ
    participant P1225 as POST /v1/hosts/{id}/runners with missing workspace returns 422.      Both se
    participant P1226 as GET /v1/hosts reports a host as offline when last_seen_at is stale.      A hos
    participant P1227 as GET /v1/hosts/{id} returns status=offline for an offline host.      The detail
    participant P1228 as Integration tests for the host WebSocket tunnel route.
    participant P1229 as Build an ASGI WebSocket scope for a test path.      :param path: WebSocket pat
    participant P1230 as Connect an ASGI WebSocket communicator to the host tunnel.      :param app: Fa
    participant P1231 as Encode a HostHelloFrame for tests.      :param name: Human-readable host name.
    participant P1232 as Minimal FastAPI app with only the host tunnel route.      :param db_uri: SQLit
    participant P1233 as Send hello and wait for registration.      :param communicator: Connected ASGI
    participant P1234 as Poll until the host appears in the registry.      :param registry: Host regist
    participant P1235 as Poll until the host's DB status flips to \"offline\".      :param store: Hos
    participant P1236 as Poll until a host's updated_at reaches floor.      :param store: Host
    participant P1237 as Verify the ping loop refreshes the host's last-seen in the DB.      This is th
    participant P1238 as Verify that a host connecting and sending hello appears in the     HostRegistry
    participant P1239 as Verify that the host is removed from the registry on disconnect.      If the h
    participant P1240 as Verify that the host is upserted into the DB on connect.      If get_host retu
    participant P1241 as Verify that the host is marked offline in the DB on disconnect.      If status
    participant P1242 as Verify that a hello with wrong protocol version closes with 4002.      If the
    participant P1243 as Verify that a non-hello frame as the first message closes     with 4001.
    participant P1244 as Verify that a launch_runner_result frame resolves the pending     future on the
    participant P1245 as Auth provider that resolves every request to one fixed user.      :param user_
    participant P1246 as Return the fixed user id regardless of the request.
    participant P1247 as Build a host-tunnel app whose auth resolves to authed_user.      Wires a m
    participant P1248 as A host_id owned by another user is refused with HTTP 409 pre-accept.      Repr
    participant P1249 as Without the denial-response extension, the refusal falls back to a close.
    participant P1250 as The cross-owner guard does not block a legitimate same-owner reconnect.      A
    participant P1251 as Build a WebSocket scope carrying a managed-host launch token.      :param path
    participant P1252 as Pre-register a managed host credential for tunnel tests.      Mirrors what the
    participant P1253 as A valid launch token connects the host and flips its pre-registered     row onl
    participant P1254 as Unknown / wrong-host / expired tokens are refused with 4004 BEFORE     the WS h
    participant P1255 as _ForwardedEffort
    participant P1256 as Tests for SqlAlchemyConversationStore.
    participant P1257 as get_conversations returns one entry per resolvable id, omits     unknown id
    participant P1258 as Empty id list returns an empty map without a database round-trip.
    participant P1259 as list_latest_message_items_for_conversations returns newest message     rows
    participant P1260 as update_conversation(archived=...) persists the flag both ways     and a fre
    participant P1261 as archived=None (the default) must not touch the stored flag.      The PATCH
    participant P1262 as Toggling archived advances updated_at (like title/effort do).      The clo
    participant P1263 as A human-authored item round-trips its author identity.      Analogue of the co
    participant P1264 as Items appended without an actor (agent/tool/system) read back None.      Keeps
    participant P1265 as Tool output containing NUL (0x00) bytes must still persist.      Reproduces th
    participant P1266 as Persisted error items survive the real SQLAlchemy store path     and flatte
    participant P1267 as The (conversation_id, position) pair has a unique index.      Verify that manu
    participant P1268 as Two concurrent append() calls on the same conversation     must not collide
    participant P1269 as Models the exact user-reported race shape from 2026-04-30:     one path appends
    participant P1270 as Helper: append 5 messages and return the persisted items.
    participant P1271 as In desc order, 'after' means items with lower position.
    participant P1272 as FTS indexes function_call items by name and arguments.
    participant P1273 as list_conversations(search_query=...) matches conversations     whose title
    participant P1274 as A conversation with no title but matching item content is     returned by sea
    participant P1275 as list_conversations hides archived rows unless     include_archived=True
    participant P1276 as Deleting a conversation with items removes the conversation and all its items.
    participant P1277 as list_items(type=...) returns only items of the specified type,     while list_i
    participant P1278 as list_items(type=\"compaction\", order=\"desc\", limit=1) returns only     the most
    participant P1279 as Two sub-agent conversations created independently must have     fully isolated
    participant P1280 as A newly created conversation has updated_at == created_at.
    participant P1281 as Appending items to a conversation advances updated_at     to the current time.
    participant P1282 as Updating the title of a conversation advances updated_at.
    participant P1283 as Sorting by updated_at returns conversations in order of     last activity, not
    participant P1284 as Cursor-based pagination works correctly when sorting     by updated_at.
    participant P1285 as Setting parent_conversation_id + title round-trips through the row.
    participant P1286 as G36: partial unique index rejects (parent_id, title) duplicates.
    participant P1287 as The unique constraint is per-parent — (p1, \"auth\") and (p2, \"auth\") coex
    participant P1288 as Top-level conversations (NULL parent) are NOT subject to the unique constraint.
    participant P1289 as parent_conversation_id filter scopes results to one parent's sub-tree.
    participant P1290 as list_child_conversation_ids_by_parent groups direct sub-agent children.
    participant P1291 as Powers agent-meow mode --continue (resume the most-recent     conversation
    participant P1292 as The default (agent_id=None) returns every conversation,     including ones
    participant P1293 as A conversation bound to an agent appears exactly once in the     result when fi
    participant P1294 as With agent_id AND sort_by=\"updated_at\", the result     is ordered by th
    participant P1295 as Deleting a parent recursively removes children + grandchildren (FK CASCADE).
    participant P1296 as Fresh conversations have no runner pin until first dispatch claims one.
    participant P1297 as Internal sub-agent conversations can inherit runner bindings.
    participant P1298 as Only conversations pinned to the queried runner are returned.      The runner
    participant P1299 as Insert a hosts row so a conversation can reference host_id.      con
    participant P1300 as A freshly created conversation has host_id=None.      If not None, the ent
    participant P1301 as Verify that host_id passed to create_conversation is persisted     and survives
    participant P1302 as Verify git_branch passed to create_conversation persists and     round-trips th
    participant P1303 as Verify git_branch defaults to None for sessions with no worktree.      A non-N
    participant P1304 as Verify that set_host_id updates the column and persists.      The conversation
    participant P1305 as Verify that set_host_id raises ConversationNotFoundError for     a nonexistent
    participant P1306 as Verify set_host_id(host_id, workspace) writes both columns so     the row satis
    participant P1307 as clear_host_binding NULLs host_id/workspace/git_branch/runner_id together.
    participant P1308 as clear_host_binding raises for an unknown conversation id.
    participant P1309 as Verify create_session_with_agent stores workspace=<value> on the     conversati
    participant P1310 as Verify create_session_with_agent leaves workspace NULL when no     value is pas
    participant P1311 as Verify create_session_with_agent persists terminal_launch_args as     a JSON li
    participant P1312 as Verify create_session_with_agent leaves terminal_launch_args NULL     when no v
    participant P1313 as Verify create_session_with_agent with parent_conversation_id creates     a sub-
    participant P1314 as Verify the no-parent path still creates a top-level default row.      The pare
    participant P1315 as Verify a nonexistent parent_conversation_id raises     ConversationNotFoundErro
    participant P1316 as Verify create_conversation persists terminal_launch_args as a JSON     list tha
    participant P1317 as Verify create_conversation leaves terminal_launch_args NULL when no     value i
    participant P1318 as Verify update_conversation replaces terminal_launch_args wholesale     (last-wr
    participant P1319 as Verify an explicitly-empty arg list round-trips as [] and stays     distinc
    participant P1320 as Verify that calling set_host_id without a workspace argument     on a row whose
    participant P1321 as A freshly created conversation has workspace=None when no     workspace is
    participant P1322 as A CLI session can record its starting cwd without a host_id.      Pairs with t
    participant P1323 as Creating a conversation with host_id but no workspace raises     IntegrityError
    participant P1324 as A freshly created conversation has external_session_id=None.      Load-bea
    participant P1325 as First write transitions NULL → value and is visible on read-back.
    participant P1326 as Re-writing the same value is a no-op and does not raise.      The wrapper brid
    participant P1327 as Attempting to overwrite an existing value raises ValueError.      A divergent
    participant P1328 as Writing to a nonexistent conversation raises ConversationNotFoundError.      M
    participant P1329 as Fork creates a new conversation with deep-copied items.      Items in the fork
    participant P1330 as Forking carries per-item actor attribution into the fork.      Attribution his
    participant P1331 as When no title is given, fork derives one from the source title.
    participant P1332 as Forking a conversation with no items produces an empty fork.
    participant P1333 as Forking a non-existent conversation raises LookupError.
    participant P1334 as Labels on the source conversation are copied to the fork.
    participant P1335 as Instance-scoped labels are NOT copied to the fork.      The native bridge-id l
    participant P1336 as The source's native session id is stamped on the fork as a one-shot     resume
    participant P1337 as A source with no native session id stamps no fork directive.
    participant P1338 as Append three user/assistant turns under distinct response ids.      Builds the
    participant P1339 as up_to_response_id copies history through that response's last item.      F
    participant P1340 as A truncated fork omits the native resume directive but keeps carry-history.
    participant P1341 as resume_source_native_session=False omits the native resume directive.
    participant P1342 as Truncating at the LAST response is treated as a full fork.      The copy is eq
    participant P1343 as An up_to_response_id matching no item raises ValueError.      Silently cop
    participant P1344 as A fork that clones an agent creates a session-scoped row, not a built-in.
    participant P1345 as A failed clone-fork rolls the agent row back — no orphaned built-in.      Pre-
    participant P1346 as The store's instance-scoped denylist matches the harness label keys.      The
    participant P1347 as Fork inherits the source's reasoning_effort setting.
    participant P1348 as Fork inherits the source's terminal_launch_args setting.
    participant P1349 as copy_model_settings=False drops the source's model settings.      A model
    participant P1350 as An explicit model_override overrides the source's copied model.      The \"
    participant P1351 as carry_history_into_native=True stamps the carry-history directive.      Th
    participant P1352 as When agent_id is passed, the fork binds to the override     instead of the sour
    participant P1353 as In-place switch deletes the old agent, binds the new, and on a     cross-family
    participant P1354 as A same-family switch keeps model settings; an SDK target (empty     presentatio
    participant P1355 as get_session_connectivity returns runner/host per id.      This is the bulk
    participant P1356 as The fork-source label surfaces as needs_workspace=True.      A fork of a s
    participant P1357 as get_session_connectivity([]) returns {} without a query.      The sing
    participant P1358 as A (user, day) with no recorded spend reads as 0.0.
    participant P1359 as Repeated adds for the same (user, day) sum into one total.
    participant P1360 as Spend is partitioned by both user and UTC day; no cross-bleed.
    participant P1361 as delta <= 0 never creates or mutates a row.
    participant P1362 as The owner is the max-level grantee, regardless of grant order.
    participant P1363 as A session with no permission grants (single-user mode) has no owner.
    participant P1364 as A session with only a public grant (no real owner) returns None.
    participant P1365 as A (user, day) with no row reads as zeros for both fields.
    participant P1366 as Recording an approved checkpoint leaves accumulated cost intact.
    participant P1367 as Accumulating cost after an approval leaves the approval intact.
    participant P1368 as Approving with no prior row inserts a cost=0 row carrying the approval.
    participant P1369 as Cost increments stack (not overwrite) even after an approval is set.
    participant P1370 as set_session_state writes a JSON-serializable dict to the conversation.
    participant P1371 as set_session_state replaces the entire state dict.
    participant P1372 as set_session_state with empty dict clears state.
    participant P1373 as set_session_usage writes token usage to the conversation.
    participant P1374 as set_session_usage replaces the entire usage dict.
    participant P1375 as list_conversations_by_host_id returns conversations bound to the host.
    participant P1376 as list_conversations_by_host_id returns empty list when no match.
    participant P1377 as A minimal user message item for position-counter tests.
    participant P1378 as Read the raw conversations.next_position counter for assertions.
    participant P1379 as Raw item positions for a conversation, ascending — the source of     truth li
    participant P1380 as A freshly created conversation starts its position allocator at 0, so     the f
    participant P1381 as append() assigns contiguous positions from next_position and advances     the c
    participant P1382 as append() allocates from the maintained counter, not a MAX(position)     scan: a
    participant P1383 as A conversation written before the counter existed has     next_position = NULL.
    participant P1384 as A full fork seeds the clone's allocator from the number of copied items,     so
    participant P1385 as A truncated fork seeds the allocator from the count of the *copied*     items,
    participant P1386 as End-to-end: many sequential appends produce a contiguous, gap-free     position
    participant P1387 as list_projects returns each distinct project name once, ordered     alphabet
    participant P1388 as Non-project labels (e.g. guardrail keys) never surface as projects.
    participant P1389 as A project whose every member is archived drops out of the list (this is     wha
    participant P1390 as When accessible_by is set, only projects on sessions the user has a     per
    participant P1391 as delete_label drops the named key and leaves siblings intact — so     removi
    participant P1392 as Deleting a label that doesn't exist is a no-op, not an error.
    participant P1393 as project=\"X\" returns only sessions carrying that exact project label.
    participant P1394 as project=\"\" returns only sessions with NO project label (Unfiled).
    participant P1395 as project=None (the default) returns filed and unfiled alike.
    participant P1396 as test_launch_with_injected_custom_launcher()
    participant P1397 as test_launch_provision_failure_maps_to_502()
    participant P1398 as test_launch_host_start_failure_terminates_and_deletes_host()
    participant P1399 as test_launch_non_click_exception_terminates_and_deletes_host()
    participant P1400 as host_api_app()
    participant P1401 as mkdir_app()
    participant P1402 as fs_app()
    participant P1403 as binding_app()
    participant P1404 as test_managed_columns_survive_connect()
    participant P1405 as Integration tests for /v1/sessions endpoints.  Exercises every sessions-API su
    participant P1406 as Create a session and return the response JSON.      :param client: The test HT
    participant P1407 as Poll GET /v1/sessions/{id} until the session reaches     idle or fail
    participant P1408 as Title and labels flow through to the created session snapshot.
    participant P1409 as Omitting title returns null in the snapshot.
    participant P1410 as GET /v1/sessions returns sessions (conversations with     agent_id), not le
    participant P1411 as agent_id query param scopes to sessions bound to that agent.      The filt
    participant P1412 as Cursor pagination works with limit and after.
    participant P1413 as kind scopes the list: default (the default) hides     sub-agent childre
    participant P1414 as Each list item has title, status, labels, and timestamps.
    participant P1415 as GET /v1/sessions surfaces each session's workspace and     host_id.
    participant P1416 as The list endpoint reads _session_status_cache so the sidebar     spinner re
    participant P1417 as GET /v1/sessions reports a parent row as running while any     direct sub-a
    participant P1418 as A session with no entry in _session_terminal_pending_cache     snapshots 
    participant P1419 as The GET snapshot reads _session_terminal_pending_cache so a     client conn
    participant P1420 as Posting external_session_status (the claude-native forwarder's     only sig
    participant P1421 as Posting external_session_superseded republishes a     session.superseded
    participant P1422 as A superseded event without a target conversation id is rejected.
    participant P1423 as Superseding a session discards its unconsumed pending inputs.      The /clea
    participant P1424 as Posting external_subagent_start to a claude-native parent     creates a k
    participant P1425 as Two distinct sub-agents with the same agent_type +     description (but
    participant P1426 as Two POSTs carrying the same subagent_id resolve to the same     child row.
    participant P1427 as Redelivery adopts (and heals) an existing child row that carries the     collid
    participant P1428 as Idempotency must page through all children, not just the newest 100.     A pare
    participant P1429 as A POST missing any of the four required data keys returns     400 — payload
    participant P1430 as Structured skill slash commands persist two durable records.      The visible
    participant P1431 as Skill title seeding fills only the empty slot.      A session that already has
    participant P1432 as A non-JSON /skills/resolve body (e.g. an HTML error page injected     by a
    participant P1433 as External bridge meta messages are durable but hidden from live UI.      Codex-
    participant P1434 as Regression: a native web message's image survives in durable history.      The
    participant P1435 as Draining a pending entry publishes its id on session.input.consumed.      The
    participant P1436 as PATCH updates title and returns the updated snapshot.
    participant P1437 as PATCH upserts labels (merges, doesn't replace).
    participant P1438 as Archiving via PATCH drops the session from the default     GET /v1/sessions
    participant P1439 as PATCH sets reasoning_effort on the session.
    participant P1440 as JSON POST /v1/sessions persists terminal_launch_args, and the     value rou
    participant P1441 as Omitting terminal_launch_args on JSON create leaves the column     NULL — a non
    participant P1442 as JSON create rejects a terminal_launch_args list past the count cap.      Pins
    participant P1443 as PATCH persists terminal_launch_args and it surfaces in a later     GET snapshot
    participant P1444 as A second PATCH replaces terminal_launch_args wholesale rather than     appendin
    participant P1445 as PATCH rejects a terminal_launch_args list past the count cap with     a 400.
    participant P1446 as PATCH clear aliases clear an extended reasoning_effort value.
    participant P1447 as PATCH with an unsupported reasoning_effort value fails loud.      The rout
    participant P1448 as PATCH updates title, labels, and effort together.
    participant P1449 as PATCH returns 404 for a session that doesn't exist.
    participant P1450 as PATCH persists external_session_id and returns it in the snapshot.
    participant P1451 as Writing the same external_session_id twice is a no-op (200, no error).
    participant P1452 as Overwriting an already-set external_session_id fails 400.      The store raise
    participant P1453 as A freshly created session has external_session_id = null.      Wrapper bridges
    participant P1454 as List items expose external_session_id so the sidebar can badge runtime.
    participant P1455 as A claude-native session exposes the full identity bundle the Web     UI needs t
    participant P1456 as After an in-place agent switch the snapshot reports the spec's name.      The
    participant P1457 as pending_elicitations_count reflects outstanding approval     prompts so the
    participant P1458 as GET /v1/sessions/{id} carries session-scoped runner liveness.      Direct
    participant P1459 as GET /v1/sessions/{id}?include_items=false&include_liveness=false     return
    participant P1460 as GET /v1/sessions/{id} includes outstanding elicitation event     payloads i
    participant P1461 as Items endpoint returns the user message from session creation.
    participant P1462 as Items endpoint supports limit and after cursor.
    participant P1463 as Items endpoint returns 404 for a session that doesn't exist.
    participant P1464 as GET snapshot returns title, labels, reasoning_effort, instructions.
    participant P1465 as GET labels endpoint returns the session id and labels only.      :param client
    participant P1466 as External assistant output appends history without starting a task.      This i
    participant P1467 as External transcript items mirror terminal Claude into the session.      The na
    participant P1468 as A multi-MB native tool result is capped before persist + broadcast.      The n
    participant P1469 as Reconnect dedupe contract: the item ids the live stream emits     equal the ite
    participant P1470 as external_session_status posts a typed SessionStatusEvent.      The native
    participant P1471 as A failed edge with output surfaces a typed error on the stream (#1108).
    participant P1472 as external_session_status can bind a status edge to a response.      Codex-n
    participant P1473 as A failed session status is not downgraded by a trailing idle.      A c
    participant P1474 as _publish_status records the in-flight response id and clears it on end.
    participant P1475 as CLI resume rebind clears a stale failed status after runner init.      agent
    participant P1476 as Native idle status forwarding includes AP-persisted assistant text.      The n
    participant P1477 as Runner delivery failure for a non-Codex sub-agent is preserved by AP.      Nat
    participant P1478 as external_output_text_delta emits a live text delta only.      Codex-native
    participant P1479 as external_output_text_delta fails loud on non-string deltas.      Without t
    participant P1480 as external_output_reasoning_delta with started emits started + delta.
    participant P1481 as A continuation reasoning delta (started false/omitted) emits delta only.
    participant P1482 as external_output_reasoning_delta fails loud on a non-string delta.      Mir
    participant P1483 as external_session_interrupted emits a live interruption signal only.      C
    participant P1484 as A bare {\"type\": \"interrupt\"} (no data key) is valid input.      Contro
    participant P1485 as message_id / index / final pass through to the SSE event.      cla
    participant P1486 as Wrong-typed streaming identifiers fail loud and publish nothing.      A malfor
    participant P1487 as Unknown status values are rejected with a 400.      Without this guard a typo
    participant P1488 as external_session_usage posts a typed SessionUsageEvent and     persists the
    participant P1489 as A parent's session.usage broadcast carries its SUBTREE cost, not own.
    participant P1490 as A posted context_window overrides the spec's static value on snapshot.
    participant P1491 as A window-only post updates the window without zeroing tokens.      The forward
    participant P1492 as A payload missing both context_tokens and context_window 400s.      Defends ag
    participant P1493 as Read a conversation's persisted session_usage directly from the DB.      T
    participant P1494 as A claude-native cumulative_cost_usd is persisted to session_usage.
    participant P1495 as claude-native's display (S) and policy (max(S,C)) costs persist separately.
    participant P1496 as A post carrying only policy_cost_usd is accepted; display S unchanged.
    participant P1497 as Successive cumulative-cost posts SET (not accumulate) — native reports     runn
    participant P1498 as A cumulative-usage post may only RAISE the persisted costs, never lower them.
    participant P1499 as codex-native cumulative tokens are SET and priced into total_cost_usd.
    participant P1500 as codex-native cached input is split out and priced at the cache-read rate.
    participant P1501 as With no published cache rate (today's databricks-* catalog entries),     th
    participant P1502 as A relay turn is priced from usage.model even when the spec pins no     pric
    participant P1503 as A harness-reported cost_usd is used verbatim, overriding the catalog estimat
    participant P1504 as A harness cost_usd makes a turn priced even when the catalog can't price it.
    participant P1505 as No usage.model and an unpriceable spec model ⇒ no cost recorded.      Guar
    participant P1506 as Relay turns are attributed per model; per-model costs sum to the flat total.
    participant P1507 as An unpriced relay model still records its tokens but no per-model cost key.
    participant P1508 as Concurrent _accumulate_session_usage calls each persist their full delta.
    participant P1509 as A native cumulative usage POST attributes its buckets to the event's model.
    participant P1510 as A claude-native COST-ONLY broadcast attributes its cost to by_model.
    participant P1511 as Cost-only attribution falls back to the session's model_override.      cla
    participant P1512 as A policy_cost_usd-only mid-turn post records no per-model bucket.      Mid
    participant P1513 as A priced session's session.usage event carries total_cost_usd.      Th
    participant P1514 as A native session.usage event carries the per-bucket token breakdown.
    participant P1515 as An unpriced session omits total_cost_usd everywhere — event and store.
    participant P1516 as The session snapshot seeds the cost indicator with the priced total.      On r
    participant P1517 as An unpriced session's snapshot reports total_cost_usd as None.      A
    participant P1518 as A non-numeric cumulative_cost_usd is rejected with 400 (fail loud).      G
    participant P1519 as Over-budget cumulative usage is recorded but never stops the session.      The
    participant P1520 as Run a relay tool-call policy query (the non-native gate) and return the verdict.
    participant P1521 as Approving a relay tool-call ASK records the checkpoint so it stops re-asking.
    participant P1522 as A declined relay tool-call ASK leaves the checkpoint unrecorded.      POLICIES
    participant P1523 as Approving an MCP relay tools/call ASK records the checkpoint (no re-prompt).
    participant P1524 as external_model_change persists model_override and posts a     typed Ses
    participant P1525 as A repeat external_model_change for the already-persisted model     is a no-
    participant P1526 as A whitespace-only / missing data.model 400s.      Fail loud rather than pe
    participant P1527 as external_model_change must NOT re-inject /model into the runner.
    participant P1528 as external_reasoning_effort_change persists effort and posts SSE.      This
    participant P1529 as external_reasoning_effort_change with null clears stale effort.      Codex
    participant P1530 as Unsupported terminal-observed effort values fail loud.      This prevents a ma
    participant P1531 as Codex collaboration mode mirrors into the session labels.      The app-server
    participant P1532 as Unknown Codex collaboration mode kinds fail instead of becoming labels.
    participant P1533 as Extract [System: ...] model-change note texts from published events.
    participant P1534 as A web/REPL /model PATCH on a non-native session appends a durable     [Sy
    participant P1535 as Clearing the override (default) records a reset note, not a model name.
    participant P1536 as A native-wrapper session (agent_meow.wrapper set, here alongside     agen
    participant P1537 as A chat-first SDK session that merely exposes a REPL terminal view     (agent_
    participant P1538 as A silent PATCH (bind-time auto-apply) must NOT record a note — only     an
    participant P1539 as Negative or non-int context_tokens is rejected with a 400.      Defends we
    participant P1540 as external_session_todos publishes a session.todos SSE event.      The c
    participant P1541 as external_session_todos persists the list in the in-memory cache so     the
    participant P1542 as An empty todos list is valid and overwrites the previous cache entry.
    participant P1543 as Payloads missing data.todos are rejected with a 400.      Without this gua
    participant P1544 as A non-list data.todos value is rejected with a 400.      The handler asser
    participant P1545 as Mirrored items get a server-generated response id when none is sent.      The
    participant P1546 as First forwarded user message seeds the title on a claude-native session.
    participant P1547 as If the runner couldn't deliver the Escape (e.g. tmux pane gone),     agent-meow
    participant P1548 as POST /events stop_session forwards the event verbatim to     the bound
    participant P1549 as A runner that can't kill the session propagates to the client as     an error,
    participant P1550 as A stop with no runner bound anywhere still removes the turn fence.      When n
    participant P1551 as A failed interrupt forward removes the fence it just installed.      The fence
    participant P1552 as A delivered interrupt keeps the fence so trailing output stays dropped.      C
    participant P1553 as One forward of an effort change to the runner.      :param url: Fully-qualifie
    participant P1554 as PATCH collaboration_mode persists the Codex mode and forwards it live.
    participant P1555 as PATCH collaboration_mode must not persist UI state before live success.
    participant P1556 as collaboration_mode is rejected for sessions that are not Codex-native.
    participant P1557 as PATCH effort always forwards an effort_change event to     runner /events
    participant P1558 as silent: true persists effort but skips the /events forward.      Mirro
    participant P1559 as Runner 5xx on the effort_change forward does not break PATCH.      The forward
    participant P1560 as A malformed tools entry fails fast at the route boundary.
    participant P1561 as external_codex_subagent_start creates a child session with the     expected
    participant P1562 as Re-registering the same Codex child thread returns the existing child     and u
    participant P1563 as Codex re-registration adopts an existing child row that carries the     collidi
    participant P1564 as external_codex_subagent_start requires a non-empty thread_id.      The
    participant P1565 as external_session_status on a Codex internal child does not require     runn
    participant P1566 as A native message is persisted (not dropped) when no runner is reachable.
    participant P1567 as A NON-native message with no runner still fails loud (not persisted).      The
    participant P1568 as Integration tests for git worktree creation on POST /v1/sessions.  Drives
    participant P1569 as Minimal WebSocket stand-in (the registry only enqueues).
    participant P1570 as No-op send — frames flow through the outbound queue.          :param data: JSO
    participant P1571 as Yield a factory that registers a fake host with a replying drain.      The dra
    participant P1572 as POST a JSON session-create with a git block.      :param client: The test
    participant P1573 as The request's branch_name + base_branch reach host.create_worktree,     and the
    participant P1574 as Omitting base_branch sends None to the host (branch from HEAD).      Pairs
    participant P1575 as An invalid base branch fails the create with 400 INVALID_INPUT.      The host
    participant P1576 as test_launch_unsupported_yaml_provider_rejects_before_provisioning()
    participant P1577 as test_launch_entrypoint_provider_cleans_up_on_launch_failure()
    participant P1578 as test_register_managed_host_and_resolve_token_roundtrip()
    participant P1579 as test_resolve_launch_token_rejects_unknown_and_expired()
    participant P1580 as test_register_managed_host_relaunch_rotates_credential()
    participant P1581 as test_register_managed_host_refuses_cross_owner_recredential()
    participant P1582 as Integration tests for opt-in git worktree cleanup on session delete.  Drives 
    participant P1583 as Minimal WebSocket stand-in (the registry only enqueues).
    participant P1584 as No-op send — frames flow through the outbound queue.          :param data: JSO
    participant P1585 as Register a fake host and start a drain that captures remove frames.      :para
    participant P1586 as Create a session row that looks like a server-created worktree.      :param db
    participant P1587 as ?delete_branch=true on a worktree session sends a     host.remove_worktree
    participant P1588 as Deleting a worktree session WITHOUT the flag leaves the worktree     alone — no
    participant P1589 as host_app()
    participant P1590 as host_store()
    P0->>+ P1: uses
    P1-->>- P0: return
    P1->>+ P0: uses
    P0-->>- P1: return
    P1->>+ P2: uses
    P2-->>- P1: return
    P2->>+ P1: uses
    P1-->>- P2: return
    P2->>+ P3: uses
    P3-->>- P2: return
    P2->>+ P4: uses
    P4-->>- P2: return
    P2->>+ P5: uses
    P5-->>- P2: return
    P2->>+ P6: uses
    P6-->>- P2: return
    P2->>+ P7: uses
    P7-->>- P2: return
    P2->>+ P8: uses
    P8-->>- P2: return
    P2->>+ P9: uses
    P9-->>- P2: return
    P2->>+ P10: uses
    P10-->>- P2: return
    P2->>+ P11: uses
    P11-->>- P2: return
    P2->>+ P12: uses
    P12-->>- P2: return
    P2->>+ P13: uses
    P13-->>- P2: return
    P2->>+ P14: uses
    P14-->>- P2: return
    P2->>+ P15: uses
    P15-->>- P2: return
    P2->>+ P16: uses
    P16-->>- P2: return
    P2->>+ P17: uses
    P17-->>- P2: return
    P2->>+ P18: uses
    P18-->>- P2: return
    P2->>+ P19: uses
    P19-->>- P2: return
    P2->>+ P20: uses
    P20-->>- P2: return
    P2->>+ P21: uses
    P21-->>- P2: return
    P2->>+ P22: uses
    P22-->>- P2: return
    P2->>+ P23: uses
    P23-->>- P2: return
    P2->>+ P24: uses
    P24-->>- P2: return
    P2->>+ P25: uses
    P25-->>- P2: return
    P2->>+ P26: uses
    P26-->>- P2: return
    P2->>+ P27: uses
    P27-->>- P2: return
    P2->>+ P28: uses
    P28-->>- P2: return
    P2->>+ P29: uses
    P29-->>- P2: return
    P2->>+ P30: uses
    P30-->>- P2: return
    P2->>+ P31: uses
    P31-->>- P2: return
    P2->>+ P32: uses
    P32-->>- P2: return
    P2->>+ P33: uses
    P33-->>- P2: return
    P2->>+ P34: uses
    P34-->>- P2: return
    P2->>+ P35: uses
    P35-->>- P2: return
    P2->>+ P36: uses
    P36-->>- P2: return
    P2->>+ P37: uses
    P37-->>- P2: return
    P2->>+ P38: uses
    P38-->>- P2: return
    P2->>+ P39: uses
    P39-->>- P2: return
    P2->>+ P40: uses
    P40-->>- P2: return
    P2->>+ P41: uses
    P41-->>- P2: return
    P2->>+ P42: uses
    P42-->>- P2: return
    P2->>+ P43: uses
    P43-->>- P2: return
    P2->>+ P44: uses
    P44-->>- P2: return
    P2->>+ P45: uses
    P45-->>- P2: return
    P2->>+ P46: uses
    P46-->>- P2: return
    P2->>+ P47: uses
    P47-->>- P2: return
    P2->>+ P48: uses
    P48-->>- P2: return
    P2->>+ P49: uses
    P49-->>- P2: return
    P2->>+ P50: uses
    P50-->>- P2: return
    P2->>+ P51: uses
    P51-->>- P2: return
    P2->>+ P52: uses
    P52-->>- P2: return
    P2->>+ P53: uses
    P53-->>- P2: return
    P2->>+ P54: uses
    P54-->>- P2: return
    P2->>+ P55: uses
    P55-->>- P2: return
    P2->>+ P56: uses
    P56-->>- P2: return
    P2->>+ P57: uses
    P57-->>- P2: return
    P2->>+ P58: uses
    P58-->>- P2: return
    P2->>+ P59: uses
    P59-->>- P2: return
    P2->>+ P60: uses
    P60-->>- P2: return
    P2->>+ P61: uses
    P61-->>- P2: return
    P2->>+ P62: uses
    P62-->>- P2: return
    P2->>+ P63: uses
    P63-->>- P2: return
    P2->>+ P64: uses
    P64-->>- P2: return
    P2->>+ P65: uses
    P65-->>- P2: return
    P2->>+ P66: uses
    P66-->>- P2: return
    P2->>+ P67: uses
    P67-->>- P2: return
    P2->>+ P68: uses
    P68-->>- P2: return
    P2->>+ P69: uses
    P69-->>- P2: return
    P2->>+ P70: uses
    P70-->>- P2: return
    P2->>+ P71: uses
    P71-->>- P2: return
    P2->>+ P72: uses
    P72-->>- P2: return
    P2->>+ P73: uses
    P73-->>- P2: return
    P2->>+ P74: uses
    P74-->>- P2: return
    P2->>+ P75: uses
    P75-->>- P2: return
    P2->>+ P76: uses
    P76-->>- P2: return
    P2->>+ P77: uses
    P77-->>- P2: return
    P2->>+ P78: uses
    P78-->>- P2: return
    P2->>+ P79: uses
    P79-->>- P2: return
    P2->>+ P80: uses
    P80-->>- P2: return
    P2->>+ P81: uses
    P81-->>- P2: return
    P2->>+ P82: uses
    P82-->>- P2: return
    P2->>+ P83: uses
    P83-->>- P2: return
    P2->>+ P84: uses
    P84-->>- P2: return
    P2->>+ P85: uses
    P85-->>- P2: return
    P2->>+ P86: uses
    P86-->>- P2: return
    P2->>+ P87: uses
    P87-->>- P2: return
    P2->>+ P88: uses
    P88-->>- P2: return
    P2->>+ P89: uses
    P89-->>- P2: return
    P2->>+ P90: uses
    P90-->>- P2: return
    P2->>+ P91: uses
    P91-->>- P2: return
    P2->>+ P92: uses
    P92-->>- P2: return
    P2->>+ P93: uses
    P93-->>- P2: return
    P2->>+ P94: uses
    P94-->>- P2: return
    P2->>+ P95: uses
    P95-->>- P2: return
    P2->>+ P96: uses
    P96-->>- P2: return
    P2->>+ P97: uses
    P97-->>- P2: return
    P2->>+ P98: uses
    P98-->>- P2: return
    P2->>+ P99: uses
    P99-->>- P2: return
    P2->>+ P100: uses
    P100-->>- P2: return
    P2->>+ P101: uses
    P101-->>- P2: return
    P2->>+ P102: uses
    P102-->>- P2: return
    P2->>+ P103: uses
    P103-->>- P2: return
    P2->>+ P104: uses
    P104-->>- P2: return
    P2->>+ P105: uses
    P105-->>- P2: return
    P2->>+ P106: uses
    P106-->>- P2: return
    P2->>+ P107: uses
    P107-->>- P2: return
    P2->>+ P108: uses
    P108-->>- P2: return
    P2->>+ P109: uses
    P109-->>- P2: return
    P2->>+ P110: uses
    P110-->>- P2: return
    P2->>+ P111: uses
    P111-->>- P2: return
    P2->>+ P112: uses
    P112-->>- P2: return
    P2->>+ P113: uses
    P113-->>- P2: return
    P2->>+ P114: uses
    P114-->>- P2: return
    P2->>+ P115: uses
    P115-->>- P2: return
    P2->>+ P116: uses
    P116-->>- P2: return
    P2->>+ P117: uses
    P117-->>- P2: return
    P2->>+ P118: uses
    P118-->>- P2: return
    P2->>+ P119: uses
    P119-->>- P2: return
    P2->>+ P120: uses
    P120-->>- P2: return
    P2->>+ P121: uses
    P121-->>- P2: return
    P2->>+ P122: uses
    P122-->>- P2: return
    P2->>+ P123: uses
    P123-->>- P2: return
    P2->>+ P124: uses
    P124-->>- P2: return
    P2->>+ P125: uses
    P125-->>- P2: return
    P2->>+ P126: uses
    P126-->>- P2: return
    P2->>+ P127: uses
    P127-->>- P2: return
    P2->>+ P128: uses
    P128-->>- P2: return
    P2->>+ P129: uses
    P129-->>- P2: return
    P2->>+ P130: uses
    P130-->>- P2: return
    P2->>+ P131: uses
    P131-->>- P2: return
    P2->>+ P132: uses
    P132-->>- P2: return
    P2->>+ P133: uses
    P133-->>- P2: return
    P2->>+ P134: uses
    P134-->>- P2: return
    P2->>+ P135: uses
    P135-->>- P2: return
    P2->>+ P136: uses
    P136-->>- P2: return
    P2->>+ P137: uses
    P137-->>- P2: return
    P2->>+ P138: uses
    P138-->>- P2: return
    P2->>+ P139: uses
    P139-->>- P2: return
    P2->>+ P140: uses
    P140-->>- P2: return
    P2->>+ P141: uses
    P141-->>- P2: return
    P2->>+ P142: uses
    P142-->>- P2: return
    P2->>+ P143: uses
    P143-->>- P2: return
    P2->>+ P144: uses
    P144-->>- P2: return
    P2->>+ P145: uses
    P145-->>- P2: return
    P2->>+ P146: uses
    P146-->>- P2: return
    P2->>+ P147: uses
    P147-->>- P2: return
    P2->>+ P148: uses
    P148-->>- P2: return
    P2->>+ P149: uses
    P149-->>- P2: return
    P2->>+ P150: uses
    P150-->>- P2: return
    P2->>+ P151: uses
    P151-->>- P2: return
    P2->>+ P152: uses
    P152-->>- P2: return
    P2->>+ P153: uses
    P153-->>- P2: return
    P2->>+ P154: uses
    P154-->>- P2: return
    P2->>+ P155: uses
    P155-->>- P2: return
    P2->>+ P156: uses
    P156-->>- P2: return
    P2->>+ P157: uses
    P157-->>- P2: return
    P2->>+ P158: uses
    P158-->>- P2: return
    P2->>+ P159: uses
    P159-->>- P2: return
    P2->>+ P160: uses
    P160-->>- P2: return
    P2->>+ P161: uses
    P161-->>- P2: return
    P2->>+ P162: uses
    P162-->>- P2: return
    P2->>+ P163: uses
    P163-->>- P2: return
    P2->>+ P164: uses
    P164-->>- P2: return
    P2->>+ P165: uses
    P165-->>- P2: return
    P2->>+ P166: uses
    P166-->>- P2: return
    P2->>+ P167: uses
    P167-->>- P2: return
    P2->>+ P168: uses
    P168-->>- P2: return
    P2->>+ P169: uses
    P169-->>- P2: return
    P2->>+ P170: uses
    P170-->>- P2: return
    P2->>+ P171: uses
    P171-->>- P2: return
    P2->>+ P172: uses
    P172-->>- P2: return
    P2->>+ P173: uses
    P173-->>- P2: return
    P2->>+ P174: uses
    P174-->>- P2: return
    P2->>+ P175: uses
    P175-->>- P2: return
    P2->>+ P176: uses
    P176-->>- P2: return
    P2->>+ P177: uses
    P177-->>- P2: return
    P2->>+ P178: uses
    P178-->>- P2: return
    P2->>+ P179: uses
    P179-->>- P2: return
    P2->>+ P180: uses
    P180-->>- P2: return
    P2->>+ P181: uses
    P181-->>- P2: return
    P2->>+ P182: uses
    P182-->>- P2: return
    P2->>+ P183: uses
    P183-->>- P2: return
    P2->>+ P184: uses
    P184-->>- P2: return
    P2->>+ P185: uses
    P185-->>- P2: return
    P2->>+ P186: uses
    P186-->>- P2: return
    P2->>+ P187: uses
    P187-->>- P2: return
    P2->>+ P188: uses
    P188-->>- P2: return
    P2->>+ P189: uses
    P189-->>- P2: return
    P2->>+ P190: uses
    P190-->>- P2: return
    P2->>+ P191: uses
    P191-->>- P2: return
    P2->>+ P192: uses
    P192-->>- P2: return
    P2->>+ P193: uses
    P193-->>- P2: return
    P2->>+ P194: uses
    P194-->>- P2: return
    P2->>+ P195: uses
    P195-->>- P2: return
    P2->>+ P196: uses
    P196-->>- P2: return
    P2->>+ P197: uses
    P197-->>- P2: return
    P2->>+ P198: uses
    P198-->>- P2: return
    P2->>+ P199: uses
    P199-->>- P2: return
    P2->>+ P200: uses
    P200-->>- P2: return
    P2->>+ P201: uses
    P201-->>- P2: return
    P2->>+ P202: uses
    P202-->>- P2: return
    P2->>+ P203: uses
    P203-->>- P2: return
    P2->>+ P204: uses
    P204-->>- P2: return
    P2->>+ P205: uses
    P205-->>- P2: return
    P2->>+ P206: uses
    P206-->>- P2: return
    P2->>+ P207: uses
    P207-->>- P2: return
    P2->>+ P208: uses
    P208-->>- P2: return
    P2->>+ P209: uses
    P209-->>- P2: return
    P2->>+ P210: uses
    P210-->>- P2: return
    P2->>+ P211: uses
    P211-->>- P2: return
    P2->>+ P212: uses
    P212-->>- P2: return
    P2->>+ P213: uses
    P213-->>- P2: return
    P2->>+ P214: uses
    P214-->>- P2: return
    P2->>+ P215: uses
    P215-->>- P2: return
    P2->>+ P216: uses
    P216-->>- P2: return
    P2->>+ P217: uses
    P217-->>- P2: return
    P2->>+ P218: uses
    P218-->>- P2: return
    P2->>+ P219: uses
    P219-->>- P2: return
    P2->>+ P220: uses
    P220-->>- P2: return
    P2->>+ P221: uses
    P221-->>- P2: return
    P2->>+ P222: uses
    P222-->>- P2: return
    P2->>+ P223: uses
    P223-->>- P2: return
    P2->>+ P224: uses
    P224-->>- P2: return
    P2->>+ P225: uses
    P225-->>- P2: return
    P2->>+ P226: uses
    P226-->>- P2: return
    P2->>+ P227: uses
    P227-->>- P2: return
    P2->>+ P228: uses
    P228-->>- P2: return
    P2->>+ P229: uses
    P229-->>- P2: return
    P2->>+ P230: uses
    P230-->>- P2: return
    P2->>+ P231: uses
    P231-->>- P2: return
    P2->>+ P232: uses
    P232-->>- P2: return
    P2->>+ P233: uses
    P233-->>- P2: return
    P2->>+ P234: uses
    P234-->>- P2: return
    P2->>+ P235: uses
    P235-->>- P2: return
    P2->>+ P236: uses
    P236-->>- P2: return
    P2->>+ P237: uses
    P237-->>- P2: return
    P2->>+ P238: uses
    P238-->>- P2: return
    P2->>+ P239: uses
    P239-->>- P2: return
    P2->>+ P240: uses
    P240-->>- P2: return
    P2->>+ P241: uses
    P241-->>- P2: return
    P2->>+ P242: uses
    P242-->>- P2: return
    P2->>+ P243: uses
    P243-->>- P2: return
    P2->>+ P244: uses
    P244-->>- P2: return
    P2->>+ P245: uses
    P245-->>- P2: return
    P2->>+ P246: uses
    P246-->>- P2: return
    P2->>+ P247: uses
    P247-->>- P2: return
    P2->>+ P248: uses
    P248-->>- P2: return
    P2->>+ P249: uses
    P249-->>- P2: return
    P2->>+ P250: uses
    P250-->>- P2: return
    P2->>+ P251: uses
    P251-->>- P2: return
    P2->>+ P252: uses
    P252-->>- P2: return
    P2->>+ P253: uses
    P253-->>- P2: return
    P2->>+ P254: uses
    P254-->>- P2: return
    P2->>+ P255: uses
    P255-->>- P2: return
    P2->>+ P256: uses
    P256-->>- P2: return
    P2->>+ P257: uses
    P257-->>- P2: return
    P2->>+ P258: uses
    P258-->>- P2: return
    P2->>+ P259: uses
    P259-->>- P2: return
    P2->>+ P260: uses
    P260-->>- P2: return
    P2->>+ P261: uses
    P261-->>- P2: return
    P2->>+ P262: uses
    P262-->>- P2: return
    P2->>+ P263: uses
    P263-->>- P2: return
    P2->>+ P264: uses
    P264-->>- P2: return
    P2->>+ P265: uses
    P265-->>- P2: return
    P2->>+ P266: uses
    P266-->>- P2: return
    P2->>+ P267: uses
    P267-->>- P2: return
    P2->>+ P268: uses
    P268-->>- P2: return
    P2->>+ P269: uses
    P269-->>- P2: return
    P2->>+ P270: uses
    P270-->>- P2: return
    P2->>+ P271: uses
    P271-->>- P2: return
    P2->>+ P272: uses
    P272-->>- P2: return
    P2->>+ P273: uses
    P273-->>- P2: return
    P2->>+ P274: uses
    P274-->>- P2: return
    P2->>+ P275: uses
    P275-->>- P2: return
    P2->>+ P276: uses
    P276-->>- P2: return
    P2->>+ P277: uses
    P277-->>- P2: return
    P2->>+ P278: uses
    P278-->>- P2: return
    P2->>+ P279: uses
    P279-->>- P2: return
    P2->>+ P280: uses
    P280-->>- P2: return
    P2->>+ P281: uses
    P281-->>- P2: return
    P2->>+ P282: uses
    P282-->>- P2: return
    P2->>+ P283: uses
    P283-->>- P2: return
    P2->>+ P284: uses
    P284-->>- P2: return
    P2->>+ P285: uses
    P285-->>- P2: return
    P2->>+ P286: uses
    P286-->>- P2: return
    P2->>+ P287: uses
    P287-->>- P2: return
    P2->>+ P288: uses
    P288-->>- P2: return
    P2->>+ P289: uses
    P289-->>- P2: return
    P2->>+ P290: uses
    P290-->>- P2: return
    P2->>+ P291: uses
    P291-->>- P2: return
    P2->>+ P292: uses
    P292-->>- P2: return
    P2->>+ P293: uses
    P293-->>- P2: return
    P2->>+ P294: uses
    P294-->>- P2: return
    P2->>+ P295: uses
    P295-->>- P2: return
    P2->>+ P296: uses
    P296-->>- P2: return
    P2->>+ P297: uses
    P297-->>- P2: return
    P2->>+ P298: uses
    P298-->>- P2: return
    P2->>+ P299: uses
    P299-->>- P2: return
    P2->>+ P300: uses
    P300-->>- P2: return
    P2->>+ P301: uses
    P301-->>- P2: return
    P2->>+ P302: uses
    P302-->>- P2: return
    P2->>+ P303: uses
    P303-->>- P2: return
    P2->>+ P304: uses
    P304-->>- P2: return
    P2->>+ P305: uses
    P305-->>- P2: return
    P2->>+ P306: uses
    P306-->>- P2: return
    P2->>+ P307: uses
    P307-->>- P2: return
    P2->>+ P308: uses
    P308-->>- P2: return
    P2->>+ P309: uses
    P309-->>- P2: return
    P2->>+ P310: uses
    P310-->>- P2: return
    P2->>+ P311: uses
    P311-->>- P2: return
    P2->>+ P312: uses
    P312-->>- P2: return
    P2->>+ P313: uses
    P313-->>- P2: return
    P2->>+ P314: uses
    P314-->>- P2: return
    P2->>+ P315: uses
    P315-->>- P2: return
    P2->>+ P316: uses
    P316-->>- P2: return
    P2->>+ P317: uses
    P317-->>- P2: return
    P2->>+ P318: uses
    P318-->>- P2: return
    P2->>+ P319: uses
    P319-->>- P2: return
    P2->>+ P320: uses
    P320-->>- P2: return
    P2->>+ P321: uses
    P321-->>- P2: return
    P2->>+ P322: uses
    P322-->>- P2: return
    P2->>+ P323: calls
    P323-->>- P2: return
    P2->>+ P324: calls
    P324-->>- P2: return
    P2->>+ P325: uses
    P325-->>- P2: return
    P2->>+ P326: uses
    P326-->>- P2: return
    P2->>+ P327: uses
    P327-->>- P2: return
    P2->>+ P328: uses
    P328-->>- P2: return
    P2->>+ P329: uses
    P329-->>- P2: return
    P2->>+ P330: uses
    P330-->>- P2: return
    P2->>+ P331: uses
    P331-->>- P2: return
    P2->>+ P332: uses
    P332-->>- P2: return
    P2->>+ P333: uses
    P333-->>- P2: return
    P2->>+ P334: uses
    P334-->>- P2: return
    P2->>+ P335: uses
    P335-->>- P2: return
    P2->>+ P336: uses
    P336-->>- P2: return
    P2->>+ P337: uses
    P337-->>- P2: return
    P2->>+ P338: uses
    P338-->>- P2: return
    P2->>+ P339: uses
    P339-->>- P2: return
    P2->>+ P340: uses
    P340-->>- P2: return
    P2->>+ P341: uses
    P341-->>- P2: return
    P2->>+ P342: uses
    P342-->>- P2: return
    P2->>+ P343: uses
    P343-->>- P2: return
    P2->>+ P344: uses
    P344-->>- P2: return
    P2->>+ P345: uses
    P345-->>- P2: return
    P2->>+ P346: uses
    P346-->>- P2: return
    P2->>+ P347: uses
    P347-->>- P2: return
    P2->>+ P348: uses
    P348-->>- P2: return
    P2->>+ P349: uses
    P349-->>- P2: return
    P2->>+ P350: uses
    P350-->>- P2: return
    P2->>+ P351: uses
    P351-->>- P2: return
    P2->>+ P352: uses
    P352-->>- P2: return
    P2->>+ P353: uses
    P353-->>- P2: return
    P2->>+ P354: uses
    P354-->>- P2: return
    P2->>+ P355: uses
    P355-->>- P2: return
    P2->>+ P356: uses
    P356-->>- P2: return
    P2->>+ P357: uses
    P357-->>- P2: return
    P2->>+ P358: uses
    P358-->>- P2: return
    P2->>+ P359: uses
    P359-->>- P2: return
    P2->>+ P360: uses
    P360-->>- P2: return
    P2->>+ P361: uses
    P361-->>- P2: return
    P2->>+ P362: uses
    P362-->>- P2: return
    P1->>+ P8: uses
    P8-->>- P1: return
    P1->>+ P363: uses
    P363-->>- P1: return
    P1->>+ P364: uses
    P364-->>- P1: return
    P1->>+ P365: uses
    P365-->>- P1: return
    P1->>+ P366: uses
    P366-->>- P1: return
    P1->>+ P367: uses
    P367-->>- P1: return
    P1->>+ P368: uses
    P368-->>- P1: return
    P1->>+ P369: uses
    P369-->>- P1: return
    P1->>+ P10: uses
    P10-->>- P1: return
    P1->>+ P11: uses
    P11-->>- P1: return
    P1->>+ P370: uses
    P370-->>- P1: return
    P1->>+ P12: uses
    P12-->>- P1: return
    P1->>+ P13: uses
    P13-->>- P1: return
    P1->>+ P14: uses
    P14-->>- P1: return
    P1->>+ P15: uses
    P15-->>- P1: return
    P1->>+ P16: uses
    P16-->>- P1: return
    P1->>+ P17: uses
    P17-->>- P1: return
    P1->>+ P18: uses
    P18-->>- P1: return
    P1->>+ P19: uses
    P19-->>- P1: return
    P1->>+ P20: uses
    P20-->>- P1: return
    P1->>+ P21: uses
    P21-->>- P1: return
    P1->>+ P22: uses
    P22-->>- P1: return
    P1->>+ P23: uses
    P23-->>- P1: return
    P1->>+ P24: uses
    P24-->>- P1: return
    P1->>+ P25: uses
    P25-->>- P1: return
    P1->>+ P26: uses
    P26-->>- P1: return
    P1->>+ P27: uses
    P27-->>- P1: return
    P1->>+ P28: uses
    P28-->>- P1: return
    P1->>+ P29: uses
    P29-->>- P1: return
    P1->>+ P30: uses
    P30-->>- P1: return
    P1->>+ P31: uses
    P31-->>- P1: return
    P1->>+ P32: uses
    P32-->>- P1: return
    P1->>+ P33: uses
    P33-->>- P1: return
    P1->>+ P34: uses
    P34-->>- P1: return
    P1->>+ P35: uses
    P35-->>- P1: return
    P1->>+ P36: uses
    P36-->>- P1: return
    P1->>+ P37: uses
    P37-->>- P1: return
    P1->>+ P38: uses
    P38-->>- P1: return
    P1->>+ P39: uses
    P39-->>- P1: return
    P1->>+ P40: uses
    P40-->>- P1: return
    P1->>+ P41: uses
    P41-->>- P1: return
    P1->>+ P42: uses
    P42-->>- P1: return
    P1->>+ P43: uses
    P43-->>- P1: return
    P1->>+ P44: uses
    P44-->>- P1: return
    P1->>+ P45: uses
    P45-->>- P1: return
    P1->>+ P46: uses
    P46-->>- P1: return
    P1->>+ P47: uses
    P47-->>- P1: return
    P1->>+ P48: uses
    P48-->>- P1: return
    P1->>+ P49: uses
    P49-->>- P1: return
    P1->>+ P50: uses
    P50-->>- P1: return
    P1->>+ P51: uses
    P51-->>- P1: return
    P1->>+ P52: uses
    P52-->>- P1: return
    P1->>+ P53: uses
    P53-->>- P1: return
    P1->>+ P54: uses
    P54-->>- P1: return
    P1->>+ P55: uses
    P55-->>- P1: return
    P1->>+ P56: uses
    P56-->>- P1: return
    P1->>+ P57: uses
    P57-->>- P1: return
    P1->>+ P58: uses
    P58-->>- P1: return
    P1->>+ P59: uses
    P59-->>- P1: return
    P1->>+ P60: uses
    P60-->>- P1: return
    P1->>+ P61: uses
    P61-->>- P1: return
    P1->>+ P62: uses
    P62-->>- P1: return
    P1->>+ P63: uses
    P63-->>- P1: return
    P1->>+ P64: uses
    P64-->>- P1: return
    P1->>+ P65: uses
    P65-->>- P1: return
    P1->>+ P66: uses
    P66-->>- P1: return
    P1->>+ P67: uses
    P67-->>- P1: return
    P1->>+ P68: uses
    P68-->>- P1: return
    P1->>+ P69: uses
    P69-->>- P1: return
    P1->>+ P70: uses
    P70-->>- P1: return
    P1->>+ P71: uses
    P71-->>- P1: return
    P1->>+ P72: uses
    P72-->>- P1: return
    P1->>+ P73: uses
    P73-->>- P1: return
    P1->>+ P74: uses
    P74-->>- P1: return
    P1->>+ P75: uses
    P75-->>- P1: return
    P1->>+ P76: uses
    P76-->>- P1: return
    P1->>+ P77: uses
    P77-->>- P1: return
    P1->>+ P78: uses
    P78-->>- P1: return
    P1->>+ P79: uses
    P79-->>- P1: return
    P1->>+ P80: uses
    P80-->>- P1: return
    P1->>+ P81: uses
    P81-->>- P1: return
    P1->>+ P82: uses
    P82-->>- P1: return
    P1->>+ P83: uses
    P83-->>- P1: return
    P1->>+ P84: uses
    P84-->>- P1: return
    P1->>+ P85: uses
    P85-->>- P1: return
    P1->>+ P86: uses
    P86-->>- P1: return
    P1->>+ P87: uses
    P87-->>- P1: return
    P1->>+ P88: uses
    P88-->>- P1: return
    P1->>+ P89: uses
    P89-->>- P1: return
    P1->>+ P90: uses
    P90-->>- P1: return
    P1->>+ P91: uses
    P91-->>- P1: return
    P1->>+ P92: uses
    P92-->>- P1: return
    P1->>+ P93: uses
    P93-->>- P1: return
    P1->>+ P94: uses
    P94-->>- P1: return
    P1->>+ P95: uses
    P95-->>- P1: return
    P1->>+ P96: uses
    P96-->>- P1: return
    P1->>+ P97: uses
    P97-->>- P1: return
    P1->>+ P98: uses
    P98-->>- P1: return
    P1->>+ P99: uses
    P99-->>- P1: return
    P1->>+ P100: uses
    P100-->>- P1: return
    P1->>+ P101: uses
    P101-->>- P1: return
    P1->>+ P102: uses
    P102-->>- P1: return
    P1->>+ P103: uses
    P103-->>- P1: return
    P1->>+ P104: uses
    P104-->>- P1: return
    P1->>+ P105: uses
    P105-->>- P1: return
    P1->>+ P106: uses
    P106-->>- P1: return
    P1->>+ P107: uses
    P107-->>- P1: return
    P1->>+ P108: uses
    P108-->>- P1: return
    P1->>+ P109: uses
    P109-->>- P1: return
    P1->>+ P110: uses
    P110-->>- P1: return
    P1->>+ P111: uses
    P111-->>- P1: return
    P1->>+ P112: uses
    P112-->>- P1: return
    P1->>+ P113: uses
    P113-->>- P1: return
    P1->>+ P114: uses
    P114-->>- P1: return
    P1->>+ P115: uses
    P115-->>- P1: return
    P1->>+ P116: uses
    P116-->>- P1: return
    P1->>+ P117: uses
    P117-->>- P1: return
    P1->>+ P118: uses
    P118-->>- P1: return
    P1->>+ P119: uses
    P119-->>- P1: return
    P1->>+ P120: uses
    P120-->>- P1: return
    P1->>+ P121: uses
    P121-->>- P1: return
    P1->>+ P122: uses
    P122-->>- P1: return
    P1->>+ P123: uses
    P123-->>- P1: return
    P1->>+ P124: uses
    P124-->>- P1: return
    P1->>+ P125: uses
    P125-->>- P1: return
    P1->>+ P126: uses
    P126-->>- P1: return
    P1->>+ P127: uses
    P127-->>- P1: return
    P1->>+ P128: uses
    P128-->>- P1: return
    P1->>+ P129: uses
    P129-->>- P1: return
    P1->>+ P130: uses
    P130-->>- P1: return
    P1->>+ P131: uses
    P131-->>- P1: return
    P1->>+ P132: uses
    P132-->>- P1: return
    P1->>+ P133: uses
    P133-->>- P1: return
    P1->>+ P134: uses
    P134-->>- P1: return
    P1->>+ P135: uses
    P135-->>- P1: return
    P1->>+ P136: uses
    P136-->>- P1: return
    P1->>+ P137: uses
    P137-->>- P1: return
    P1->>+ P138: uses
    P138-->>- P1: return
    P1->>+ P139: uses
    P139-->>- P1: return
    P1->>+ P140: uses
    P140-->>- P1: return
    P1->>+ P141: uses
    P141-->>- P1: return
    P1->>+ P142: uses
    P142-->>- P1: return
    P1->>+ P143: uses
    P143-->>- P1: return
    P1->>+ P144: uses
    P144-->>- P1: return
    P1->>+ P145: uses
    P145-->>- P1: return
    P1->>+ P146: uses
    P146-->>- P1: return
    P1->>+ P147: uses
    P147-->>- P1: return
    P1->>+ P148: uses
    P148-->>- P1: return
    P1->>+ P149: uses
    P149-->>- P1: return
    P1->>+ P150: uses
    P150-->>- P1: return
    P1->>+ P151: uses
    P151-->>- P1: return
    P1->>+ P152: uses
    P152-->>- P1: return
    P1->>+ P153: uses
    P153-->>- P1: return
    P1->>+ P154: uses
    P154-->>- P1: return
    P1->>+ P155: uses
    P155-->>- P1: return
    P1->>+ P156: uses
    P156-->>- P1: return
    P1->>+ P157: uses
    P157-->>- P1: return
    P1->>+ P158: uses
    P158-->>- P1: return
    P1->>+ P159: uses
    P159-->>- P1: return
    P1->>+ P160: uses
    P160-->>- P1: return
    P1->>+ P161: uses
    P161-->>- P1: return
    P1->>+ P162: uses
    P162-->>- P1: return
    P1->>+ P163: uses
    P163-->>- P1: return
    P1->>+ P164: uses
    P164-->>- P1: return
    P1->>+ P165: uses
    P165-->>- P1: return
    P1->>+ P166: uses
    P166-->>- P1: return
    P1->>+ P167: uses
    P167-->>- P1: return
    P1->>+ P168: uses
    P168-->>- P1: return
    P1->>+ P169: uses
    P169-->>- P1: return
    P1->>+ P170: uses
    P170-->>- P1: return
    P1->>+ P171: uses
    P171-->>- P1: return
    P1->>+ P172: uses
    P172-->>- P1: return
    P1->>+ P173: uses
    P173-->>- P1: return
    P1->>+ P174: uses
    P174-->>- P1: return
    P1->>+ P175: uses
    P175-->>- P1: return
    P1->>+ P176: uses
    P176-->>- P1: return
    P1->>+ P177: uses
    P177-->>- P1: return
    P1->>+ P178: uses
    P178-->>- P1: return
    P1->>+ P179: uses
    P179-->>- P1: return
    P1->>+ P180: uses
    P180-->>- P1: return
    P1->>+ P181: uses
    P181-->>- P1: return
    P1->>+ P182: uses
    P182-->>- P1: return
    P1->>+ P183: uses
    P183-->>- P1: return
    P1->>+ P184: uses
    P184-->>- P1: return
    P1->>+ P185: uses
    P185-->>- P1: return
    P1->>+ P186: uses
    P186-->>- P1: return
    P1->>+ P187: uses
    P187-->>- P1: return
    P1->>+ P188: uses
    P188-->>- P1: return
    P1->>+ P189: uses
    P189-->>- P1: return
    P1->>+ P190: uses
    P190-->>- P1: return
    P1->>+ P191: uses
    P191-->>- P1: return
    P1->>+ P192: uses
    P192-->>- P1: return
    P1->>+ P193: uses
    P193-->>- P1: return
    P1->>+ P194: uses
    P194-->>- P1: return
    P1->>+ P195: uses
    P195-->>- P1: return
    P1->>+ P196: uses
    P196-->>- P1: return
    P1->>+ P197: uses
    P197-->>- P1: return
    P1->>+ P198: uses
    P198-->>- P1: return
    P1->>+ P199: uses
    P199-->>- P1: return
    P1->>+ P200: uses
    P200-->>- P1: return
    P1->>+ P201: uses
    P201-->>- P1: return
    P1->>+ P202: uses
    P202-->>- P1: return
    P1->>+ P203: uses
    P203-->>- P1: return
    P1->>+ P204: uses
    P204-->>- P1: return
    P1->>+ P205: uses
    P205-->>- P1: return
    P1->>+ P206: uses
    P206-->>- P1: return
    P1->>+ P207: uses
    P207-->>- P1: return
    P1->>+ P208: uses
    P208-->>- P1: return
    P1->>+ P209: uses
    P209-->>- P1: return
    P1->>+ P210: uses
    P210-->>- P1: return
    P1->>+ P211: uses
    P211-->>- P1: return
    P1->>+ P212: uses
    P212-->>- P1: return
    P1->>+ P213: uses
    P213-->>- P1: return
    P1->>+ P214: uses
    P214-->>- P1: return
    P1->>+ P215: uses
    P215-->>- P1: return
    P1->>+ P216: uses
    P216-->>- P1: return
    P1->>+ P217: uses
    P217-->>- P1: return
    P1->>+ P218: uses
    P218-->>- P1: return
    P1->>+ P219: uses
    P219-->>- P1: return
    P1->>+ P220: uses
    P220-->>- P1: return
    P1->>+ P221: uses
    P221-->>- P1: return
    P1->>+ P222: uses
    P222-->>- P1: return
    P1->>+ P223: uses
    P223-->>- P1: return
    P1->>+ P224: uses
    P224-->>- P1: return
    P1->>+ P225: uses
    P225-->>- P1: return
    P1->>+ P226: uses
    P226-->>- P1: return
    P1->>+ P227: uses
    P227-->>- P1: return
    P1->>+ P228: uses
    P228-->>- P1: return
    P1->>+ P229: uses
    P229-->>- P1: return
    P1->>+ P230: uses
    P230-->>- P1: return
    P1->>+ P231: uses
    P231-->>- P1: return
    P1->>+ P232: uses
    P232-->>- P1: return
    P1->>+ P233: uses
    P233-->>- P1: return
    P1->>+ P234: uses
    P234-->>- P1: return
    P1->>+ P235: uses
    P235-->>- P1: return
    P1->>+ P236: uses
    P236-->>- P1: return
    P1->>+ P237: uses
    P237-->>- P1: return
    P1->>+ P238: uses
    P238-->>- P1: return
    P1->>+ P239: uses
    P239-->>- P1: return
    P1->>+ P240: uses
    P240-->>- P1: return
    P1->>+ P241: uses
    P241-->>- P1: return
    P1->>+ P242: uses
    P242-->>- P1: return
    P1->>+ P243: uses
    P243-->>- P1: return
    P1->>+ P244: uses
    P244-->>- P1: return
    P1->>+ P245: uses
    P245-->>- P1: return
    P1->>+ P246: uses
    P246-->>- P1: return
    P1->>+ P247: uses
    P247-->>- P1: return
    P1->>+ P248: uses
    P248-->>- P1: return
    P1->>+ P249: uses
    P249-->>- P1: return
    P1->>+ P250: uses
    P250-->>- P1: return
    P1->>+ P251: uses
    P251-->>- P1: return
    P1->>+ P252: uses
    P252-->>- P1: return
    P1->>+ P253: uses
    P253-->>- P1: return
    P1->>+ P254: uses
    P254-->>- P1: return
    P1->>+ P255: uses
    P255-->>- P1: return
    P1->>+ P256: uses
    P256-->>- P1: return
    P1->>+ P257: uses
    P257-->>- P1: return
    P1->>+ P258: uses
    P258-->>- P1: return
    P1->>+ P259: uses
    P259-->>- P1: return
    P1->>+ P260: uses
    P260-->>- P1: return
    P1->>+ P261: uses
    P261-->>- P1: return
    P1->>+ P262: uses
    P262-->>- P1: return
    P1->>+ P371: uses
    P371-->>- P1: return
    P1->>+ P372: uses
    P372-->>- P1: return
    P1->>+ P373: calls
    P373-->>- P1: return
    P1->>+ P374: uses
    P374-->>- P1: return
    P1->>+ P375: uses
    P375-->>- P1: return
    P1->>+ P376: uses
    P376-->>- P1: return
    P1->>+ P377: uses
    P377-->>- P1: return
    P1->>+ P378: uses
    P378-->>- P1: return
    P1->>+ P379: uses
    P379-->>- P1: return
    P1->>+ P380: uses
    P380-->>- P1: return
    P1->>+ P381: uses
    P381-->>- P1: return
    P1->>+ P382: uses
    P382-->>- P1: return
    P1->>+ P383: uses
    P383-->>- P1: return
    P1->>+ P384: uses
    P384-->>- P1: return
    P1->>+ P385: uses
    P385-->>- P1: return
    P1->>+ P386: uses
    P386-->>- P1: return
    P1->>+ P387: uses
    P387-->>- P1: return
    P1->>+ P388: uses
    P388-->>- P1: return
    P1->>+ P389: uses
    P389-->>- P1: return
    P1->>+ P390: uses
    P390-->>- P1: return
    P1->>+ P391: uses
    P391-->>- P1: return
    P1->>+ P392: uses
    P392-->>- P1: return
    P1->>+ P393: uses
    P393-->>- P1: return
    P1->>+ P394: uses
    P394-->>- P1: return
    P1->>+ P395: uses
    P395-->>- P1: return
    P1->>+ P396: uses
    P396-->>- P1: return
    P1->>+ P397: uses
    P397-->>- P1: return
    P1->>+ P398: uses
    P398-->>- P1: return
    P1->>+ P399: uses
    P399-->>- P1: return
    P1->>+ P400: uses
    P400-->>- P1: return
    P1->>+ P401: uses
    P401-->>- P1: return
    P1->>+ P402: uses
    P402-->>- P1: return
    P1->>+ P403: uses
    P403-->>- P1: return
    P1->>+ P404: uses
    P404-->>- P1: return
    P1->>+ P405: uses
    P405-->>- P1: return
    P1->>+ P406: uses
    P406-->>- P1: return
    P1->>+ P407: uses
    P407-->>- P1: return
    P1->>+ P408: uses
    P408-->>- P1: return
    P1->>+ P409: uses
    P409-->>- P1: return
    P1->>+ P410: uses
    P410-->>- P1: return
    P1->>+ P411: uses
    P411-->>- P1: return
    P1->>+ P412: uses
    P412-->>- P1: return
    P1->>+ P413: uses
    P413-->>- P1: return
    P1->>+ P414: uses
    P414-->>- P1: return
    P1->>+ P415: uses
    P415-->>- P1: return
    P1->>+ P416: uses
    P416-->>- P1: return
    P1->>+ P417: uses
    P417-->>- P1: return
    P1->>+ P418: uses
    P418-->>- P1: return
    P1->>+ P419: calls
    P419-->>- P1: return
    P1->>+ P420: uses
    P420-->>- P1: return
    P1->>+ P421: uses
    P421-->>- P1: return
    P1->>+ P422: uses
    P422-->>- P1: return
    P1->>+ P423: uses
    P423-->>- P1: return
    P1->>+ P424: uses
    P424-->>- P1: return
    P1->>+ P425: uses
    P425-->>- P1: return
    P1->>+ P426: uses
    P426-->>- P1: return
    P1->>+ P427: uses
    P427-->>- P1: return
    P1->>+ P428: uses
    P428-->>- P1: return
    P1->>+ P429: uses
    P429-->>- P1: return
    P1->>+ P430: uses
    P430-->>- P1: return
    P1->>+ P431: uses
    P431-->>- P1: return
    P1->>+ P432: uses
    P432-->>- P1: return
    P1->>+ P433: uses
    P433-->>- P1: return
    P1->>+ P434: uses
    P434-->>- P1: return
    P1->>+ P435: uses
    P435-->>- P1: return
    P1->>+ P436: uses
    P436-->>- P1: return
    P1->>+ P437: uses
    P437-->>- P1: return
    P1->>+ P438: uses
    P438-->>- P1: return
    P1->>+ P439: uses
    P439-->>- P1: return
    P1->>+ P440: uses
    P440-->>- P1: return
    P1->>+ P441: uses
    P441-->>- P1: return
    P1->>+ P442: uses
    P442-->>- P1: return
    P1->>+ P443: uses
    P443-->>- P1: return
    P1->>+ P444: uses
    P444-->>- P1: return
    P1->>+ P445: uses
    P445-->>- P1: return
    P1->>+ P446: uses
    P446-->>- P1: return
    P1->>+ P447: uses
    P447-->>- P1: return
    P1->>+ P448: uses
    P448-->>- P1: return
    P1->>+ P449: uses
    P449-->>- P1: return
    P1->>+ P450: uses
    P450-->>- P1: return
    P1->>+ P451: uses
    P451-->>- P1: return
    P1->>+ P452: uses
    P452-->>- P1: return
    P1->>+ P453: uses
    P453-->>- P1: return
    P1->>+ P454: uses
    P454-->>- P1: return
    P1->>+ P455: uses
    P455-->>- P1: return
    P1->>+ P456: uses
    P456-->>- P1: return
    P1->>+ P457: uses
    P457-->>- P1: return
    P1->>+ P458: uses
    P458-->>- P1: return
    P1->>+ P459: uses
    P459-->>- P1: return
    P1->>+ P460: uses
    P460-->>- P1: return
    P1->>+ P461: uses
    P461-->>- P1: return
    P1->>+ P462: uses
    P462-->>- P1: return
    P1->>+ P463: uses
    P463-->>- P1: return
    P1->>+ P464: uses
    P464-->>- P1: return
    P1->>+ P465: uses
    P465-->>- P1: return
    P1->>+ P466: uses
    P466-->>- P1: return
    P1->>+ P467: uses
    P467-->>- P1: return
    P1->>+ P468: uses
    P468-->>- P1: return
    P1->>+ P469: uses
    P469-->>- P1: return
    P1->>+ P470: uses
    P470-->>- P1: return
    P1->>+ P471: calls
    P471-->>- P1: return
    P0->>+ P3: uses
    P3-->>- P0: return
    P0->>+ P4: uses
    P4-->>- P0: return
    P0->>+ P5: uses
    P5-->>- P0: return
    P0->>+ P6: uses
    P6-->>- P0: return
    P0->>+ P7: uses
    P7-->>- P0: return
    P0->>+ P8: uses
    P8-->>- P0: return
    P0->>+ P9: uses
    P9-->>- P0: return
    P0->>+ P10: uses
    P10-->>- P0: return
    P0->>+ P11: uses
    P11-->>- P0: return
    P0->>+ P12: uses
    P12-->>- P0: return
    P0->>+ P13: uses
    P13-->>- P0: return
    P0->>+ P14: uses
    P14-->>- P0: return
    P0->>+ P15: uses
    P15-->>- P0: return
    P0->>+ P16: uses
    P16-->>- P0: return
    P0->>+ P17: uses
    P17-->>- P0: return
    P0->>+ P18: uses
    P18-->>- P0: return
    P0->>+ P19: uses
    P19-->>- P0: return
    P0->>+ P20: uses
    P20-->>- P0: return
    P0->>+ P21: uses
    P21-->>- P0: return
    P0->>+ P22: uses
    P22-->>- P0: return
    P0->>+ P23: uses
    P23-->>- P0: return
    P0->>+ P24: uses
    P24-->>- P0: return
    P0->>+ P25: uses
    P25-->>- P0: return
    P0->>+ P26: uses
    P26-->>- P0: return
    P0->>+ P27: uses
    P27-->>- P0: return
    P0->>+ P28: uses
    P28-->>- P0: return
    P0->>+ P29: uses
    P29-->>- P0: return
    P0->>+ P30: uses
    P30-->>- P0: return
    P0->>+ P31: uses
    P31-->>- P0: return
    P0->>+ P32: uses
    P32-->>- P0: return
    P0->>+ P33: uses
    P33-->>- P0: return
    P0->>+ P34: uses
    P34-->>- P0: return
    P0->>+ P35: uses
    P35-->>- P0: return
    P0->>+ P36: uses
    P36-->>- P0: return
    P0->>+ P37: uses
    P37-->>- P0: return
    P0->>+ P38: uses
    P38-->>- P0: return
    P0->>+ P39: uses
    P39-->>- P0: return
    P0->>+ P40: uses
    P40-->>- P0: return
    P0->>+ P41: uses
    P41-->>- P0: return
    P0->>+ P42: uses
    P42-->>- P0: return
    P0->>+ P43: uses
    P43-->>- P0: return
    P0->>+ P44: uses
    P44-->>- P0: return
    P0->>+ P45: uses
    P45-->>- P0: return
    P0->>+ P46: uses
    P46-->>- P0: return
    P0->>+ P47: uses
    P47-->>- P0: return
    P0->>+ P48: uses
    P48-->>- P0: return
    P0->>+ P49: uses
    P49-->>- P0: return
    P0->>+ P50: uses
    P50-->>- P0: return
    P0->>+ P51: uses
    P51-->>- P0: return
    P0->>+ P52: uses
    P52-->>- P0: return
    P0->>+ P53: uses
    P53-->>- P0: return
    P0->>+ P54: uses
    P54-->>- P0: return
    P0->>+ P55: uses
    P55-->>- P0: return
    P0->>+ P56: uses
    P56-->>- P0: return
    P0->>+ P57: uses
    P57-->>- P0: return
    P0->>+ P58: uses
    P58-->>- P0: return
    P0->>+ P59: uses
    P59-->>- P0: return
    P0->>+ P60: uses
    P60-->>- P0: return
    P0->>+ P61: uses
    P61-->>- P0: return
    P0->>+ P62: uses
    P62-->>- P0: return
    P0->>+ P63: uses
    P63-->>- P0: return
    P0->>+ P64: uses
    P64-->>- P0: return
    P0->>+ P65: uses
    P65-->>- P0: return
    P0->>+ P66: uses
    P66-->>- P0: return
    P0->>+ P67: uses
    P67-->>- P0: return
    P0->>+ P68: uses
    P68-->>- P0: return
    P0->>+ P69: uses
    P69-->>- P0: return
    P0->>+ P70: uses
    P70-->>- P0: return
    P0->>+ P71: uses
    P71-->>- P0: return
    P0->>+ P72: uses
    P72-->>- P0: return
    P0->>+ P73: uses
    P73-->>- P0: return
    P0->>+ P74: uses
    P74-->>- P0: return
    P0->>+ P75: uses
    P75-->>- P0: return
    P0->>+ P76: uses
    P76-->>- P0: return
    P0->>+ P77: uses
    P77-->>- P0: return
    P0->>+ P78: uses
    P78-->>- P0: return
    P0->>+ P79: uses
    P79-->>- P0: return
    P0->>+ P80: uses
    P80-->>- P0: return
    P0->>+ P81: uses
    P81-->>- P0: return
    P0->>+ P82: uses
    P82-->>- P0: return
    P0->>+ P83: uses
    P83-->>- P0: return
    P0->>+ P84: uses
    P84-->>- P0: return
    P0->>+ P85: uses
    P85-->>- P0: return
    P0->>+ P86: uses
    P86-->>- P0: return
    P0->>+ P87: uses
    P87-->>- P0: return
    P0->>+ P88: uses
    P88-->>- P0: return
    P0->>+ P89: uses
    P89-->>- P0: return
    P0->>+ P90: uses
    P90-->>- P0: return
    P0->>+ P91: uses
    P91-->>- P0: return
    P0->>+ P92: uses
    P92-->>- P0: return
    P0->>+ P93: uses
    P93-->>- P0: return
    P0->>+ P94: uses
    P94-->>- P0: return
    P0->>+ P95: uses
    P95-->>- P0: return
    P0->>+ P96: uses
    P96-->>- P0: return
    P0->>+ P97: uses
    P97-->>- P0: return
    P0->>+ P98: uses
    P98-->>- P0: return
    P0->>+ P99: uses
    P99-->>- P0: return
    P0->>+ P100: uses
    P100-->>- P0: return
    P0->>+ P101: uses
    P101-->>- P0: return
    P0->>+ P102: uses
    P102-->>- P0: return
    P0->>+ P103: uses
    P103-->>- P0: return
    P0->>+ P104: uses
    P104-->>- P0: return
    P0->>+ P105: uses
    P105-->>- P0: return
    P0->>+ P106: uses
    P106-->>- P0: return
    P0->>+ P107: uses
    P107-->>- P0: return
    P0->>+ P108: uses
    P108-->>- P0: return
    P0->>+ P109: uses
    P109-->>- P0: return
    P0->>+ P110: uses
    P110-->>- P0: return
    P0->>+ P111: uses
    P111-->>- P0: return
    P0->>+ P112: uses
    P112-->>- P0: return
    P0->>+ P113: uses
    P113-->>- P0: return
    P0->>+ P114: uses
    P114-->>- P0: return
    P0->>+ P115: uses
    P115-->>- P0: return
    P0->>+ P116: uses
    P116-->>- P0: return
    P0->>+ P117: uses
    P117-->>- P0: return
    P0->>+ P118: uses
    P118-->>- P0: return
    P0->>+ P119: uses
    P119-->>- P0: return
    P0->>+ P120: uses
    P120-->>- P0: return
    P0->>+ P121: uses
    P121-->>- P0: return
    P0->>+ P122: uses
    P122-->>- P0: return
    P0->>+ P123: uses
    P123-->>- P0: return
    P0->>+ P124: uses
    P124-->>- P0: return
    P0->>+ P125: uses
    P125-->>- P0: return
    P0->>+ P126: uses
    P126-->>- P0: return
    P0->>+ P127: uses
    P127-->>- P0: return
    P0->>+ P128: uses
    P128-->>- P0: return
    P0->>+ P129: uses
    P129-->>- P0: return
    P0->>+ P130: uses
    P130-->>- P0: return
    P0->>+ P131: uses
    P131-->>- P0: return
    P0->>+ P132: uses
    P132-->>- P0: return
    P0->>+ P133: uses
    P133-->>- P0: return
    P0->>+ P134: uses
    P134-->>- P0: return
    P0->>+ P135: uses
    P135-->>- P0: return
    P0->>+ P136: uses
    P136-->>- P0: return
    P0->>+ P137: uses
    P137-->>- P0: return
    P0->>+ P138: uses
    P138-->>- P0: return
    P0->>+ P139: uses
    P139-->>- P0: return
    P0->>+ P140: uses
    P140-->>- P0: return
    P0->>+ P141: uses
    P141-->>- P0: return
    P0->>+ P142: uses
    P142-->>- P0: return
    P0->>+ P143: uses
    P143-->>- P0: return
    P0->>+ P144: uses
    P144-->>- P0: return
    P0->>+ P145: uses
    P145-->>- P0: return
    P0->>+ P146: uses
    P146-->>- P0: return
    P0->>+ P147: uses
    P147-->>- P0: return
    P0->>+ P148: uses
    P148-->>- P0: return
    P0->>+ P149: uses
    P149-->>- P0: return
    P0->>+ P150: uses
    P150-->>- P0: return
    P0->>+ P151: uses
    P151-->>- P0: return
    P0->>+ P152: uses
    P152-->>- P0: return
    P0->>+ P153: uses
    P153-->>- P0: return
    P0->>+ P154: uses
    P154-->>- P0: return
    P0->>+ P155: uses
    P155-->>- P0: return
    P0->>+ P156: uses
    P156-->>- P0: return
    P0->>+ P157: uses
    P157-->>- P0: return
    P0->>+ P158: uses
    P158-->>- P0: return
    P0->>+ P159: uses
    P159-->>- P0: return
    P0->>+ P160: uses
    P160-->>- P0: return
    P0->>+ P161: uses
    P161-->>- P0: return
    P0->>+ P162: uses
    P162-->>- P0: return
    P0->>+ P163: uses
    P163-->>- P0: return
    P0->>+ P164: uses
    P164-->>- P0: return
    P0->>+ P165: uses
    P165-->>- P0: return
    P0->>+ P166: uses
    P166-->>- P0: return
    P0->>+ P167: uses
    P167-->>- P0: return
    P0->>+ P168: uses
    P168-->>- P0: return
    P0->>+ P169: uses
    P169-->>- P0: return
    P0->>+ P170: uses
    P170-->>- P0: return
    P0->>+ P171: uses
    P171-->>- P0: return
    P0->>+ P172: uses
    P172-->>- P0: return
    P0->>+ P173: uses
    P173-->>- P0: return
    P0->>+ P174: uses
    P174-->>- P0: return
    P0->>+ P175: uses
    P175-->>- P0: return
    P0->>+ P176: uses
    P176-->>- P0: return
    P0->>+ P177: uses
    P177-->>- P0: return
    P0->>+ P178: uses
    P178-->>- P0: return
    P0->>+ P179: uses
    P179-->>- P0: return
    P0->>+ P180: uses
    P180-->>- P0: return
    P0->>+ P181: uses
    P181-->>- P0: return
    P0->>+ P182: uses
    P182-->>- P0: return
    P0->>+ P183: uses
    P183-->>- P0: return
    P0->>+ P184: uses
    P184-->>- P0: return
    P0->>+ P185: uses
    P185-->>- P0: return
    P0->>+ P186: uses
    P186-->>- P0: return
    P0->>+ P187: uses
    P187-->>- P0: return
    P0->>+ P188: uses
    P188-->>- P0: return
    P0->>+ P189: uses
    P189-->>- P0: return
    P0->>+ P190: uses
    P190-->>- P0: return
    P0->>+ P191: uses
    P191-->>- P0: return
    P0->>+ P192: uses
    P192-->>- P0: return
    P0->>+ P193: uses
    P193-->>- P0: return
    P0->>+ P194: uses
    P194-->>- P0: return
    P0->>+ P195: uses
    P195-->>- P0: return
    P0->>+ P196: uses
    P196-->>- P0: return
    P0->>+ P197: uses
    P197-->>- P0: return
    P0->>+ P198: uses
    P198-->>- P0: return
    P0->>+ P199: uses
    P199-->>- P0: return
    P0->>+ P200: uses
    P200-->>- P0: return
    P0->>+ P201: uses
    P201-->>- P0: return
    P0->>+ P202: uses
    P202-->>- P0: return
    P0->>+ P203: uses
    P203-->>- P0: return
    P0->>+ P204: uses
    P204-->>- P0: return
    P0->>+ P205: uses
    P205-->>- P0: return
    P0->>+ P206: uses
    P206-->>- P0: return
    P0->>+ P207: uses
    P207-->>- P0: return
    P0->>+ P208: uses
    P208-->>- P0: return
    P0->>+ P209: uses
    P209-->>- P0: return
    P0->>+ P210: uses
    P210-->>- P0: return
    P0->>+ P211: uses
    P211-->>- P0: return
    P0->>+ P212: uses
    P212-->>- P0: return
    P0->>+ P213: uses
    P213-->>- P0: return
    P0->>+ P214: uses
    P214-->>- P0: return
    P0->>+ P215: uses
    P215-->>- P0: return
    P0->>+ P216: uses
    P216-->>- P0: return
    P0->>+ P217: uses
    P217-->>- P0: return
    P0->>+ P218: uses
    P218-->>- P0: return
    P0->>+ P219: uses
    P219-->>- P0: return
    P0->>+ P220: uses
    P220-->>- P0: return
    P0->>+ P221: uses
    P221-->>- P0: return
    P0->>+ P222: uses
    P222-->>- P0: return
    P0->>+ P223: uses
    P223-->>- P0: return
    P0->>+ P224: uses
    P224-->>- P0: return
    P0->>+ P225: uses
    P225-->>- P0: return
    P0->>+ P226: uses
    P226-->>- P0: return
    P0->>+ P227: uses
    P227-->>- P0: return
    P0->>+ P228: uses
    P228-->>- P0: return
    P0->>+ P229: uses
    P229-->>- P0: return
    P0->>+ P230: uses
    P230-->>- P0: return
    P0->>+ P231: uses
    P231-->>- P0: return
    P0->>+ P232: uses
    P232-->>- P0: return
    P0->>+ P233: uses
    P233-->>- P0: return
    P0->>+ P234: uses
    P234-->>- P0: return
    P0->>+ P235: uses
    P235-->>- P0: return
    P0->>+ P236: uses
    P236-->>- P0: return
    P0->>+ P237: uses
    P237-->>- P0: return
    P0->>+ P238: uses
    P238-->>- P0: return
    P0->>+ P239: uses
    P239-->>- P0: return
    P0->>+ P240: uses
    P240-->>- P0: return
    P0->>+ P241: uses
    P241-->>- P0: return
    P0->>+ P242: uses
    P242-->>- P0: return
    P0->>+ P243: uses
    P243-->>- P0: return
    P0->>+ P244: uses
    P244-->>- P0: return
    P0->>+ P245: uses
    P245-->>- P0: return
    P0->>+ P246: uses
    P246-->>- P0: return
    P0->>+ P247: uses
    P247-->>- P0: return
    P0->>+ P248: uses
    P248-->>- P0: return
    P0->>+ P249: uses
    P249-->>- P0: return
    P0->>+ P250: uses
    P250-->>- P0: return
    P0->>+ P251: uses
    P251-->>- P0: return
    P0->>+ P252: uses
    P252-->>- P0: return
    P0->>+ P253: uses
    P253-->>- P0: return
    P0->>+ P254: uses
    P254-->>- P0: return
    P0->>+ P255: uses
    P255-->>- P0: return
    P0->>+ P256: uses
    P256-->>- P0: return
    P0->>+ P257: uses
    P257-->>- P0: return
    P0->>+ P258: uses
    P258-->>- P0: return
    P0->>+ P259: uses
    P259-->>- P0: return
    P0->>+ P260: uses
    P260-->>- P0: return
    P0->>+ P261: uses
    P261-->>- P0: return
    P0->>+ P262: uses
    P262-->>- P0: return
    P0->>+ P371: uses
    P371-->>- P0: return
    P0->>+ P372: uses
    P372-->>- P0: return
    P0->>+ P472: calls
    P472-->>- P0: return
    P0->>+ P263: uses
    P263-->>- P0: return
    P0->>+ P473: uses
    P473-->>- P0: return
    P0->>+ P474: uses
    P474-->>- P0: return
    P0->>+ P475: uses
    P475-->>- P0: return
    P0->>+ P476: uses
    P476-->>- P0: return
    P0->>+ P477: uses
    P477-->>- P0: return
    P0->>+ P374: uses
    P374-->>- P0: return
    P0->>+ P478: uses
    P478-->>- P0: return
    P0->>+ P479: uses
    P479-->>- P0: return
    P0->>+ P480: uses
    P480-->>- P0: return
    P0->>+ P481: uses
    P481-->>- P0: return
    P0->>+ P482: uses
    P482-->>- P0: return
    P0->>+ P483: uses
    P483-->>- P0: return
    P0->>+ P484: uses
    P484-->>- P0: return
    P0->>+ P485: uses
    P485-->>- P0: return
    P0->>+ P486: uses
    P486-->>- P0: return
    P0->>+ P487: uses
    P487-->>- P0: return
    P0->>+ P488: uses
    P488-->>- P0: return
    P0->>+ P489: uses
    P489-->>- P0: return
    P0->>+ P490: uses
    P490-->>- P0: return
    P0->>+ P491: uses
    P491-->>- P0: return
    P0->>+ P492: uses
    P492-->>- P0: return
    P0->>+ P375: uses
    P375-->>- P0: return
    P0->>+ P493: uses
    P493-->>- P0: return
    P0->>+ P494: uses
    P494-->>- P0: return
    P0->>+ P495: uses
    P495-->>- P0: return
    P0->>+ P496: uses
    P496-->>- P0: return
    P0->>+ P497: uses
    P497-->>- P0: return
    P0->>+ P498: uses
    P498-->>- P0: return
    P0->>+ P499: uses
    P499-->>- P0: return
    P0->>+ P500: uses
    P500-->>- P0: return
    P0->>+ P501: uses
    P501-->>- P0: return
    P0->>+ P502: uses
    P502-->>- P0: return
    P0->>+ P503: uses
    P503-->>- P0: return
    P0->>+ P504: uses
    P504-->>- P0: return
    P0->>+ P505: uses
    P505-->>- P0: return
    P0->>+ P506: uses
    P506-->>- P0: return
    P0->>+ P507: uses
    P507-->>- P0: return
    P0->>+ P508: uses
    P508-->>- P0: return
    P0->>+ P509: uses
    P509-->>- P0: return
    P0->>+ P510: uses
    P510-->>- P0: return
    P0->>+ P511: uses
    P511-->>- P0: return
    P0->>+ P512: uses
    P512-->>- P0: return
    P0->>+ P513: uses
    P513-->>- P0: return
    P0->>+ P514: uses
    P514-->>- P0: return
    P0->>+ P515: uses
    P515-->>- P0: return
    P0->>+ P516: uses
    P516-->>- P0: return
    P0->>+ P517: uses
    P517-->>- P0: return
    P0->>+ P518: uses
    P518-->>- P0: return
    P0->>+ P519: uses
    P519-->>- P0: return
    P0->>+ P520: uses
    P520-->>- P0: return
    P0->>+ P521: uses
    P521-->>- P0: return
    P0->>+ P522: uses
    P522-->>- P0: return
    P0->>+ P523: uses
    P523-->>- P0: return
    P0->>+ P524: uses
    P524-->>- P0: return
    P0->>+ P525: uses
    P525-->>- P0: return
    P0->>+ P526: uses
    P526-->>- P0: return
    P0->>+ P527: uses
    P527-->>- P0: return
    P0->>+ P528: uses
    P528-->>- P0: return
    P0->>+ P529: uses
    P529-->>- P0: return
    P0->>+ P530: uses
    P530-->>- P0: return
    P0->>+ P531: uses
    P531-->>- P0: return
    P0->>+ P532: uses
    P532-->>- P0: return
    P0->>+ P533: uses
    P533-->>- P0: return
    P0->>+ P534: uses
    P534-->>- P0: return
    P0->>+ P535: uses
    P535-->>- P0: return
    P0->>+ P536: uses
    P536-->>- P0: return
    P0->>+ P537: uses
    P537-->>- P0: return
    P0->>+ P538: uses
    P538-->>- P0: return
    P0->>+ P539: uses
    P539-->>- P0: return
    P0->>+ P540: uses
    P540-->>- P0: return
    P0->>+ P541: uses
    P541-->>- P0: return
    P0->>+ P542: uses
    P542-->>- P0: return
    P0->>+ P543: uses
    P543-->>- P0: return
    P0->>+ P544: uses
    P544-->>- P0: return
    P0->>+ P545: uses
    P545-->>- P0: return
    P0->>+ P546: uses
    P546-->>- P0: return
    P0->>+ P547: uses
    P547-->>- P0: return
    P0->>+ P548: uses
    P548-->>- P0: return
    P0->>+ P549: uses
    P549-->>- P0: return
    P0->>+ P550: uses
    P550-->>- P0: return
    P0->>+ P551: uses
    P551-->>- P0: return
    P0->>+ P552: uses
    P552-->>- P0: return
    P0->>+ P553: uses
    P553-->>- P0: return
    P0->>+ P554: uses
    P554-->>- P0: return
    P0->>+ P555: uses
    P555-->>- P0: return
    P0->>+ P556: uses
    P556-->>- P0: return
    P0->>+ P557: uses
    P557-->>- P0: return
    P0->>+ P558: uses
    P558-->>- P0: return
    P0->>+ P559: uses
    P559-->>- P0: return
    P0->>+ P560: uses
    P560-->>- P0: return
    P0->>+ P561: uses
    P561-->>- P0: return
    P0->>+ P562: uses
    P562-->>- P0: return
    P0->>+ P563: uses
    P563-->>- P0: return
    P0->>+ P564: uses
    P564-->>- P0: return
    P0->>+ P565: uses
    P565-->>- P0: return
    P0->>+ P566: uses
    P566-->>- P0: return
    P0->>+ P567: uses
    P567-->>- P0: return
    P0->>+ P568: uses
    P568-->>- P0: return
    P0->>+ P569: uses
    P569-->>- P0: return
    P0->>+ P570: uses
    P570-->>- P0: return
    P0->>+ P571: uses
    P571-->>- P0: return
    P0->>+ P572: uses
    P572-->>- P0: return
    P0->>+ P573: uses
    P573-->>- P0: return
    P0->>+ P574: uses
    P574-->>- P0: return
    P0->>+ P575: uses
    P575-->>- P0: return
    P0->>+ P576: uses
    P576-->>- P0: return
    P0->>+ P577: uses
    P577-->>- P0: return
    P0->>+ P578: uses
    P578-->>- P0: return
    P0->>+ P579: uses
    P579-->>- P0: return
    P0->>+ P580: uses
    P580-->>- P0: return
    P0->>+ P581: uses
    P581-->>- P0: return
    P0->>+ P582: uses
    P582-->>- P0: return
    P0->>+ P583: uses
    P583-->>- P0: return
    P0->>+ P584: uses
    P584-->>- P0: return
    P0->>+ P585: uses
    P585-->>- P0: return
    P0->>+ P586: uses
    P586-->>- P0: return
    P0->>+ P587: uses
    P587-->>- P0: return
    P0->>+ P588: uses
    P588-->>- P0: return
    P0->>+ P589: uses
    P589-->>- P0: return
    P0->>+ P590: uses
    P590-->>- P0: return
    P0->>+ P591: uses
    P591-->>- P0: return
    P0->>+ P592: uses
    P592-->>- P0: return
    P0->>+ P593: uses
    P593-->>- P0: return
    P0->>+ P594: uses
    P594-->>- P0: return
    P0->>+ P595: uses
    P595-->>- P0: return
    P0->>+ P596: uses
    P596-->>- P0: return
    P0->>+ P597: uses
    P597-->>- P0: return
    P0->>+ P598: uses
    P598-->>- P0: return
    P0->>+ P599: uses
    P599-->>- P0: return
    P0->>+ P600: uses
    P600-->>- P0: return
    P0->>+ P601: uses
    P601-->>- P0: return
    P0->>+ P602: uses
    P602-->>- P0: return
    P0->>+ P603: uses
    P603-->>- P0: return
    P0->>+ P604: uses
    P604-->>- P0: return
    P0->>+ P605: uses
    P605-->>- P0: return
    P0->>+ P606: uses
    P606-->>- P0: return
    P0->>+ P607: uses
    P607-->>- P0: return
    P0->>+ P608: uses
    P608-->>- P0: return
    P0->>+ P609: uses
    P609-->>- P0: return
    P0->>+ P610: uses
    P610-->>- P0: return
    P0->>+ P611: uses
    P611-->>- P0: return
    P0->>+ P612: uses
    P612-->>- P0: return
    P0->>+ P613: uses
    P613-->>- P0: return
    P0->>+ P614: uses
    P614-->>- P0: return
    P0->>+ P615: uses
    P615-->>- P0: return
    P0->>+ P616: uses
    P616-->>- P0: return
    P0->>+ P617: uses
    P617-->>- P0: return
    P0->>+ P618: uses
    P618-->>- P0: return
    P0->>+ P619: uses
    P619-->>- P0: return
    P0->>+ P620: uses
    P620-->>- P0: return
    P0->>+ P621: uses
    P621-->>- P0: return
    P0->>+ P622: uses
    P622-->>- P0: return
    P0->>+ P623: uses
    P623-->>- P0: return
    P0->>+ P624: uses
    P624-->>- P0: return
    P0->>+ P625: uses
    P625-->>- P0: return
    P0->>+ P626: uses
    P626-->>- P0: return
    P0->>+ P627: uses
    P627-->>- P0: return
    P0->>+ P628: uses
    P628-->>- P0: return
    P0->>+ P629: uses
    P629-->>- P0: return
    P0->>+ P630: uses
    P630-->>- P0: return
    P0->>+ P631: uses
    P631-->>- P0: return
    P0->>+ P632: uses
    P632-->>- P0: return
    P0->>+ P633: uses
    P633-->>- P0: return
    P0->>+ P634: uses
    P634-->>- P0: return
    P0->>+ P635: uses
    P635-->>- P0: return
    P0->>+ P636: uses
    P636-->>- P0: return
    P0->>+ P637: uses
    P637-->>- P0: return
    P0->>+ P638: uses
    P638-->>- P0: return
    P0->>+ P639: uses
    P639-->>- P0: return
    P0->>+ P640: uses
    P640-->>- P0: return
    P0->>+ P641: uses
    P641-->>- P0: return
    P0->>+ P642: uses
    P642-->>- P0: return
    P0->>+ P643: uses
    P643-->>- P0: return
    P0->>+ P644: uses
    P644-->>- P0: return
    P0->>+ P645: uses
    P645-->>- P0: return
    P0->>+ P646: uses
    P646-->>- P0: return
    P0->>+ P647: uses
    P647-->>- P0: return
    P0->>+ P648: uses
    P648-->>- P0: return
    P0->>+ P649: uses
    P649-->>- P0: return
    P0->>+ P650: uses
    P650-->>- P0: return
    P0->>+ P651: uses
    P651-->>- P0: return
    P0->>+ P652: uses
    P652-->>- P0: return
    P0->>+ P653: uses
    P653-->>- P0: return
    P0->>+ P654: uses
    P654-->>- P0: return
    P0->>+ P655: uses
    P655-->>- P0: return
    P0->>+ P656: uses
    P656-->>- P0: return
    P0->>+ P657: uses
    P657-->>- P0: return
    P0->>+ P658: uses
    P658-->>- P0: return
    P0->>+ P659: uses
    P659-->>- P0: return
    P0->>+ P660: uses
    P660-->>- P0: return
    P0->>+ P661: uses
    P661-->>- P0: return
    P0->>+ P662: uses
    P662-->>- P0: return
    P0->>+ P663: uses
    P663-->>- P0: return
    P0->>+ P664: uses
    P664-->>- P0: return
    P0->>+ P665: uses
    P665-->>- P0: return
    P0->>+ P666: uses
    P666-->>- P0: return
    P0->>+ P667: uses
    P667-->>- P0: return
    P0->>+ P668: uses
    P668-->>- P0: return
    P0->>+ P669: uses
    P669-->>- P0: return
    P0->>+ P670: uses
    P670-->>- P0: return
    P0->>+ P671: uses
    P671-->>- P0: return
    P0->>+ P672: uses
    P672-->>- P0: return
    P0->>+ P673: uses
    P673-->>- P0: return
    P0->>+ P674: uses
    P674-->>- P0: return
    P0->>+ P675: uses
    P675-->>- P0: return
    P0->>+ P676: uses
    P676-->>- P0: return
    P0->>+ P677: uses
    P677-->>- P0: return
    P0->>+ P678: uses
    P678-->>- P0: return
    P0->>+ P679: uses
    P679-->>- P0: return
    P0->>+ P680: uses
    P680-->>- P0: return
    P0->>+ P681: uses
    P681-->>- P0: return
    P0->>+ P682: uses
    P682-->>- P0: return
    P0->>+ P683: uses
    P683-->>- P0: return
    P0->>+ P684: uses
    P684-->>- P0: return
    P0->>+ P685: uses
    P685-->>- P0: return
    P0->>+ P686: uses
    P686-->>- P0: return
    P0->>+ P687: uses
    P687-->>- P0: return
    P0->>+ P688: uses
    P688-->>- P0: return
    P0->>+ P689: uses
    P689-->>- P0: return
    P0->>+ P690: uses
    P690-->>- P0: return
    P0->>+ P691: uses
    P691-->>- P0: return
    P0->>+ P692: uses
    P692-->>- P0: return
    P0->>+ P693: uses
    P693-->>- P0: return
    P0->>+ P694: uses
    P694-->>- P0: return
    P0->>+ P695: uses
    P695-->>- P0: return
    P0->>+ P696: uses
    P696-->>- P0: return
    P0->>+ P697: uses
    P697-->>- P0: return
    P0->>+ P698: uses
    P698-->>- P0: return
    P0->>+ P699: uses
    P699-->>- P0: return
    P0->>+ P700: uses
    P700-->>- P0: return
    P0->>+ P701: uses
    P701-->>- P0: return
    P0->>+ P702: uses
    P702-->>- P0: return
    P0->>+ P703: uses
    P703-->>- P0: return
    P0->>+ P704: uses
    P704-->>- P0: return
    P0->>+ P705: uses
    P705-->>- P0: return
    P0->>+ P706: uses
    P706-->>- P0: return
    P0->>+ P707: uses
    P707-->>- P0: return
    P0->>+ P708: uses
    P708-->>- P0: return
    P0->>+ P709: uses
    P709-->>- P0: return
    P0->>+ P710: uses
    P710-->>- P0: return
    P0->>+ P711: uses
    P711-->>- P0: return
    P0->>+ P712: uses
    P712-->>- P0: return
    P0->>+ P713: uses
    P713-->>- P0: return
    P0->>+ P714: uses
    P714-->>- P0: return
    P0->>+ P715: uses
    P715-->>- P0: return
    P0->>+ P716: uses
    P716-->>- P0: return
    P0->>+ P717: uses
    P717-->>- P0: return
    P0->>+ P718: uses
    P718-->>- P0: return
    P0->>+ P719: uses
    P719-->>- P0: return
    P0->>+ P720: uses
    P720-->>- P0: return
    P0->>+ P721: uses
    P721-->>- P0: return
    P0->>+ P722: uses
    P722-->>- P0: return
    P0->>+ P723: uses
    P723-->>- P0: return
    P0->>+ P724: uses
    P724-->>- P0: return
    P0->>+ P725: uses
    P725-->>- P0: return
    P0->>+ P726: uses
    P726-->>- P0: return
    P0->>+ P727: uses
    P727-->>- P0: return
    P0->>+ P728: uses
    P728-->>- P0: return
    P0->>+ P729: uses
    P729-->>- P0: return
    P0->>+ P730: uses
    P730-->>- P0: return
    P0->>+ P731: uses
    P731-->>- P0: return
    P0->>+ P732: uses
    P732-->>- P0: return
    P0->>+ P733: uses
    P733-->>- P0: return
    P0->>+ P734: uses
    P734-->>- P0: return
    P0->>+ P735: uses
    P735-->>- P0: return
    P0->>+ P736: uses
    P736-->>- P0: return
    P0->>+ P737: uses
    P737-->>- P0: return
    P0->>+ P738: uses
    P738-->>- P0: return
    P0->>+ P739: uses
    P739-->>- P0: return
    P0->>+ P740: uses
    P740-->>- P0: return
    P0->>+ P741: uses
    P741-->>- P0: return
    P0->>+ P742: uses
    P742-->>- P0: return
    P0->>+ P743: uses
    P743-->>- P0: return
    P0->>+ P744: uses
    P744-->>- P0: return
    P0->>+ P745: uses
    P745-->>- P0: return
    P0->>+ P746: uses
    P746-->>- P0: return
    P0->>+ P747: uses
    P747-->>- P0: return
    P0->>+ P748: uses
    P748-->>- P0: return
    P0->>+ P749: uses
    P749-->>- P0: return
    P0->>+ P750: uses
    P750-->>- P0: return
    P0->>+ P751: uses
    P751-->>- P0: return
    P0->>+ P752: uses
    P752-->>- P0: return
    P0->>+ P753: uses
    P753-->>- P0: return
    P0->>+ P754: uses
    P754-->>- P0: return
    P0->>+ P755: uses
    P755-->>- P0: return
    P0->>+ P756: uses
    P756-->>- P0: return
    P0->>+ P757: uses
    P757-->>- P0: return
    P0->>+ P758: uses
    P758-->>- P0: return
    P0->>+ P376: uses
    P376-->>- P0: return
    P0->>+ P377: uses
    P377-->>- P0: return
    P0->>+ P759: uses
    P759-->>- P0: return
    P0->>+ P760: calls
    P760-->>- P0: return
    P0->>+ P761: uses
    P761-->>- P0: return
    P0->>+ P378: uses
    P378-->>- P0: return
    P0->>+ P379: uses
    P379-->>- P0: return
    P0->>+ P380: uses
    P380-->>- P0: return
    P0->>+ P381: uses
    P381-->>- P0: return
    P0->>+ P382: uses
    P382-->>- P0: return
    P0->>+ P383: uses
    P383-->>- P0: return
    P0->>+ P384: uses
    P384-->>- P0: return
    P0->>+ P385: uses
    P385-->>- P0: return
    P0->>+ P386: uses
    P386-->>- P0: return
    P0->>+ P387: uses
    P387-->>- P0: return
    P0->>+ P388: uses
    P388-->>- P0: return
    P0->>+ P389: uses
    P389-->>- P0: return
    P0->>+ P390: uses
    P390-->>- P0: return
    P0->>+ P391: uses
    P391-->>- P0: return
    P0->>+ P392: uses
    P392-->>- P0: return
    P0->>+ P393: uses
    P393-->>- P0: return
    P0->>+ P394: uses
    P394-->>- P0: return
    P0->>+ P395: uses
    P395-->>- P0: return
    P0->>+ P396: uses
    P396-->>- P0: return
    P0->>+ P397: uses
    P397-->>- P0: return
    P0->>+ P398: uses
    P398-->>- P0: return
    P0->>+ P399: uses
    P399-->>- P0: return
    P0->>+ P400: uses
    P400-->>- P0: return
    P0->>+ P401: uses
    P401-->>- P0: return
    P0->>+ P402: uses
    P402-->>- P0: return
    P0->>+ P403: uses
    P403-->>- P0: return
    P0->>+ P404: uses
    P404-->>- P0: return
    P0->>+ P405: uses
    P405-->>- P0: return
    P0->>+ P406: uses
    P406-->>- P0: return
    P0->>+ P407: uses
    P407-->>- P0: return
    P0->>+ P408: uses
    P408-->>- P0: return
    P0->>+ P409: uses
    P409-->>- P0: return
    P0->>+ P410: uses
    P410-->>- P0: return
    P0->>+ P411: uses
    P411-->>- P0: return
    P0->>+ P412: uses
    P412-->>- P0: return
    P0->>+ P413: uses
    P413-->>- P0: return
    P0->>+ P414: uses
    P414-->>- P0: return
    P0->>+ P415: uses
    P415-->>- P0: return
    P0->>+ P416: uses
    P416-->>- P0: return
    P0->>+ P417: uses
    P417-->>- P0: return
    P0->>+ P418: uses
    P418-->>- P0: return
    P0->>+ P762: uses
    P762-->>- P0: return
    P0->>+ P763: uses
    P763-->>- P0: return
    P0->>+ P764: calls
    P764-->>- P0: return
    P0->>+ P765: calls
    P765-->>- P0: return
    P0->>+ P766: calls
    P766-->>- P0: return
    P0->>+ P767: uses
    P767-->>- P0: return
    P0->>+ P768: uses
    P768-->>- P0: return
    P0->>+ P769: uses
    P769-->>- P0: return
    P0->>+ P420: uses
    P420-->>- P0: return
    P0->>+ P770: uses
    P770-->>- P0: return
    P0->>+ P771: uses
    P771-->>- P0: return
    P0->>+ P772: uses
    P772-->>- P0: return
    P0->>+ P773: uses
    P773-->>- P0: return
    P0->>+ P774: uses
    P774-->>- P0: return
    P0->>+ P775: uses
    P775-->>- P0: return
    P0->>+ P776: uses
    P776-->>- P0: return
    P0->>+ P777: calls
    P777-->>- P0: return
    P0->>+ P778: uses
    P778-->>- P0: return
    P0->>+ P779: uses
    P779-->>- P0: return
    P0->>+ P780: uses
    P780-->>- P0: return
    P0->>+ P781: uses
    P781-->>- P0: return
    P0->>+ P782: uses
    P782-->>- P0: return
    P0->>+ P783: uses
    P783-->>- P0: return
    P0->>+ P784: uses
    P784-->>- P0: return
    P0->>+ P785: uses
    P785-->>- P0: return
    P0->>+ P786: uses
    P786-->>- P0: return
    P0->>+ P787: uses
    P787-->>- P0: return
    P0->>+ P788: uses
    P788-->>- P0: return
    P0->>+ P789: uses
    P789-->>- P0: return
    P0->>+ P790: uses
    P790-->>- P0: return
    P0->>+ P791: uses
    P791-->>- P0: return
    P0->>+ P792: uses
    P792-->>- P0: return
    P0->>+ P793: uses
    P793-->>- P0: return
    P0->>+ P794: uses
    P794-->>- P0: return
    P0->>+ P795: uses
    P795-->>- P0: return
    P0->>+ P796: uses
    P796-->>- P0: return
    P0->>+ P797: uses
    P797-->>- P0: return
    P0->>+ P798: uses
    P798-->>- P0: return
    P0->>+ P799: uses
    P799-->>- P0: return
    P0->>+ P800: uses
    P800-->>- P0: return
    P0->>+ P801: uses
    P801-->>- P0: return
    P0->>+ P802: uses
    P802-->>- P0: return
    P0->>+ P803: uses
    P803-->>- P0: return
    P0->>+ P804: uses
    P804-->>- P0: return
    P0->>+ P805: uses
    P805-->>- P0: return
    P0->>+ P806: uses
    P806-->>- P0: return
    P0->>+ P807: uses
    P807-->>- P0: return
    P0->>+ P808: uses
    P808-->>- P0: return
    P0->>+ P809: uses
    P809-->>- P0: return
    P0->>+ P810: uses
    P810-->>- P0: return
    P0->>+ P811: uses
    P811-->>- P0: return
    P0->>+ P812: uses
    P812-->>- P0: return
    P0->>+ P813: uses
    P813-->>- P0: return
    P0->>+ P814: uses
    P814-->>- P0: return
    P0->>+ P815: uses
    P815-->>- P0: return
    P0->>+ P816: uses
    P816-->>- P0: return
    P0->>+ P817: uses
    P817-->>- P0: return
    P0->>+ P818: uses
    P818-->>- P0: return
    P0->>+ P819: uses
    P819-->>- P0: return
    P0->>+ P820: uses
    P820-->>- P0: return
    P0->>+ P821: uses
    P821-->>- P0: return
    P0->>+ P822: uses
    P822-->>- P0: return
    P0->>+ P823: uses
    P823-->>- P0: return
    P0->>+ P824: uses
    P824-->>- P0: return
    P0->>+ P825: uses
    P825-->>- P0: return
    P0->>+ P826: uses
    P826-->>- P0: return
    P0->>+ P827: uses
    P827-->>- P0: return
    P0->>+ P828: uses
    P828-->>- P0: return
    P0->>+ P829: uses
    P829-->>- P0: return
    P0->>+ P830: uses
    P830-->>- P0: return
    P0->>+ P831: uses
    P831-->>- P0: return
    P0->>+ P832: uses
    P832-->>- P0: return
    P0->>+ P833: uses
    P833-->>- P0: return
    P0->>+ P834: uses
    P834-->>- P0: return
    P0->>+ P835: uses
    P835-->>- P0: return
    P0->>+ P836: uses
    P836-->>- P0: return
    P0->>+ P837: uses
    P837-->>- P0: return
    P0->>+ P838: uses
    P838-->>- P0: return
    P0->>+ P839: uses
    P839-->>- P0: return
    P0->>+ P840: uses
    P840-->>- P0: return
    P0->>+ P841: uses
    P841-->>- P0: return
    P0->>+ P842: uses
    P842-->>- P0: return
    P0->>+ P843: uses
    P843-->>- P0: return
    P0->>+ P844: uses
    P844-->>- P0: return
    P0->>+ P845: uses
    P845-->>- P0: return
    P0->>+ P846: uses
    P846-->>- P0: return
    P0->>+ P847: uses
    P847-->>- P0: return
    P0->>+ P848: uses
    P848-->>- P0: return
    P0->>+ P849: calls
    P849-->>- P0: return
    P0->>+ P850: calls
    P850-->>- P0: return
    P0->>+ P851: uses
    P851-->>- P0: return
    P0->>+ P852: uses
    P852-->>- P0: return
    P0->>+ P853: uses
    P853-->>- P0: return
    P0->>+ P854: uses
    P854-->>- P0: return
    P0->>+ P855: uses
    P855-->>- P0: return
    P0->>+ P856: uses
    P856-->>- P0: return
    P0->>+ P857: uses
    P857-->>- P0: return
    P0->>+ P858: uses
    P858-->>- P0: return
    P0->>+ P859: uses
    P859-->>- P0: return
    P0->>+ P860: uses
    P860-->>- P0: return
    P0->>+ P861: uses
    P861-->>- P0: return
    P0->>+ P862: uses
    P862-->>- P0: return
    P0->>+ P863: uses
    P863-->>- P0: return
    P0->>+ P864: uses
    P864-->>- P0: return
    P0->>+ P865: uses
    P865-->>- P0: return
    P0->>+ P866: uses
    P866-->>- P0: return
    P0->>+ P867: uses
    P867-->>- P0: return
    P0->>+ P868: uses
    P868-->>- P0: return
    P0->>+ P869: uses
    P869-->>- P0: return
    P0->>+ P870: uses
    P870-->>- P0: return
    P0->>+ P871: uses
    P871-->>- P0: return
    P0->>+ P872: uses
    P872-->>- P0: return
    P0->>+ P873: uses
    P873-->>- P0: return
    P0->>+ P874: uses
    P874-->>- P0: return
    P0->>+ P875: uses
    P875-->>- P0: return
    P0->>+ P876: uses
    P876-->>- P0: return
    P0->>+ P877: uses
    P877-->>- P0: return
    P0->>+ P878: uses
    P878-->>- P0: return
    P0->>+ P879: uses
    P879-->>- P0: return
    P0->>+ P880: uses
    P880-->>- P0: return
    P0->>+ P881: uses
    P881-->>- P0: return
    P0->>+ P882: uses
    P882-->>- P0: return
    P0->>+ P883: uses
    P883-->>- P0: return
    P0->>+ P884: uses
    P884-->>- P0: return
    P0->>+ P885: uses
    P885-->>- P0: return
    P0->>+ P886: uses
    P886-->>- P0: return
    P0->>+ P887: uses
    P887-->>- P0: return
    P0->>+ P888: uses
    P888-->>- P0: return
    P0->>+ P889: uses
    P889-->>- P0: return
    P0->>+ P890: uses
    P890-->>- P0: return
    P0->>+ P891: uses
    P891-->>- P0: return
    P0->>+ P892: uses
    P892-->>- P0: return
    P0->>+ P893: uses
    P893-->>- P0: return
    P0->>+ P894: uses
    P894-->>- P0: return
    P0->>+ P895: uses
    P895-->>- P0: return
    P0->>+ P896: uses
    P896-->>- P0: return
    P0->>+ P897: uses
    P897-->>- P0: return
    P0->>+ P898: uses
    P898-->>- P0: return
    P0->>+ P899: uses
    P899-->>- P0: return
    P0->>+ P900: uses
    P900-->>- P0: return
    P0->>+ P901: uses
    P901-->>- P0: return
    P0->>+ P902: uses
    P902-->>- P0: return
    P0->>+ P903: uses
    P903-->>- P0: return
    P0->>+ P904: uses
    P904-->>- P0: return
    P0->>+ P905: uses
    P905-->>- P0: return
    P0->>+ P906: uses
    P906-->>- P0: return
    P0->>+ P907: uses
    P907-->>- P0: return
    P0->>+ P908: uses
    P908-->>- P0: return
    P0->>+ P909: uses
    P909-->>- P0: return
    P0->>+ P910: uses
    P910-->>- P0: return
    P0->>+ P911: uses
    P911-->>- P0: return
    P0->>+ P912: uses
    P912-->>- P0: return
    P0->>+ P913: uses
    P913-->>- P0: return
    P0->>+ P914: uses
    P914-->>- P0: return
    P0->>+ P915: uses
    P915-->>- P0: return
    P0->>+ P916: uses
    P916-->>- P0: return
    P0->>+ P917: uses
    P917-->>- P0: return
    P0->>+ P918: uses
    P918-->>- P0: return
    P0->>+ P919: uses
    P919-->>- P0: return
    P0->>+ P920: uses
    P920-->>- P0: return
    P0->>+ P921: uses
    P921-->>- P0: return
    P0->>+ P922: uses
    P922-->>- P0: return
    P0->>+ P923: uses
    P923-->>- P0: return
    P0->>+ P924: uses
    P924-->>- P0: return
    P0->>+ P925: uses
    P925-->>- P0: return
    P0->>+ P926: uses
    P926-->>- P0: return
    P0->>+ P927: uses
    P927-->>- P0: return
    P0->>+ P928: uses
    P928-->>- P0: return
    P0->>+ P929: uses
    P929-->>- P0: return
    P0->>+ P930: uses
    P930-->>- P0: return
    P0->>+ P931: uses
    P931-->>- P0: return
    P0->>+ P932: uses
    P932-->>- P0: return
    P0->>+ P933: uses
    P933-->>- P0: return
    P0->>+ P934: uses
    P934-->>- P0: return
    P0->>+ P935: uses
    P935-->>- P0: return
    P0->>+ P936: uses
    P936-->>- P0: return
    P0->>+ P937: uses
    P937-->>- P0: return
    P0->>+ P938: uses
    P938-->>- P0: return
    P0->>+ P939: uses
    P939-->>- P0: return
    P0->>+ P940: uses
    P940-->>- P0: return
    P0->>+ P941: uses
    P941-->>- P0: return
    P0->>+ P942: uses
    P942-->>- P0: return
    P0->>+ P943: uses
    P943-->>- P0: return
    P0->>+ P944: uses
    P944-->>- P0: return
    P0->>+ P945: uses
    P945-->>- P0: return
    P0->>+ P946: uses
    P946-->>- P0: return
    P0->>+ P947: uses
    P947-->>- P0: return
    P0->>+ P948: uses
    P948-->>- P0: return
    P0->>+ P949: uses
    P949-->>- P0: return
    P0->>+ P950: uses
    P950-->>- P0: return
    P0->>+ P951: calls
    P951-->>- P0: return
    P0->>+ P952: uses
    P952-->>- P0: return
    P0->>+ P953: uses
    P953-->>- P0: return
    P0->>+ P954: uses
    P954-->>- P0: return
    P0->>+ P955: uses
    P955-->>- P0: return
    P0->>+ P956: uses
    P956-->>- P0: return
    P0->>+ P957: uses
    P957-->>- P0: return
    P0->>+ P958: uses
    P958-->>- P0: return
    P0->>+ P959: uses
    P959-->>- P0: return
    P0->>+ P960: uses
    P960-->>- P0: return
    P0->>+ P961: uses
    P961-->>- P0: return
    P0->>+ P962: uses
    P962-->>- P0: return
    P0->>+ P963: uses
    P963-->>- P0: return
    P0->>+ P964: uses
    P964-->>- P0: return
    P0->>+ P965: uses
    P965-->>- P0: return
    P0->>+ P966: uses
    P966-->>- P0: return
    P0->>+ P967: uses
    P967-->>- P0: return
    P0->>+ P968: uses
    P968-->>- P0: return
    P0->>+ P969: uses
    P969-->>- P0: return
    P0->>+ P970: uses
    P970-->>- P0: return
    P0->>+ P971: uses
    P971-->>- P0: return
    P0->>+ P972: uses
    P972-->>- P0: return
    P0->>+ P973: uses
    P973-->>- P0: return
    P0->>+ P974: uses
    P974-->>- P0: return
    P0->>+ P975: uses
    P975-->>- P0: return
    P0->>+ P976: uses
    P976-->>- P0: return
    P0->>+ P977: uses
    P977-->>- P0: return
    P0->>+ P978: uses
    P978-->>- P0: return
    P0->>+ P979: uses
    P979-->>- P0: return
    P0->>+ P980: uses
    P980-->>- P0: return
    P0->>+ P981: uses
    P981-->>- P0: return
    P0->>+ P982: uses
    P982-->>- P0: return
    P0->>+ P983: uses
    P983-->>- P0: return
    P0->>+ P984: uses
    P984-->>- P0: return
    P0->>+ P985: uses
    P985-->>- P0: return
    P0->>+ P986: uses
    P986-->>- P0: return
    P0->>+ P987: calls
    P987-->>- P0: return
    P0->>+ P988: calls
    P988-->>- P0: return
    P0->>+ P989: uses
    P989-->>- P0: return
    P0->>+ P990: uses
    P990-->>- P0: return
    P0->>+ P991: uses
    P991-->>- P0: return
    P0->>+ P992: uses
    P992-->>- P0: return
    P0->>+ P993: uses
    P993-->>- P0: return
    P0->>+ P994: uses
    P994-->>- P0: return
    P0->>+ P995: uses
    P995-->>- P0: return
    P0->>+ P996: uses
    P996-->>- P0: return
    P0->>+ P997: uses
    P997-->>- P0: return
    P0->>+ P998: uses
    P998-->>- P0: return
    P0->>+ P999: uses
    P999-->>- P0: return
    P0->>+ P1000: uses
    P1000-->>- P0: return
    P0->>+ P1001: uses
    P1001-->>- P0: return
    P0->>+ P1002: uses
    P1002-->>- P0: return
    P0->>+ P1003: uses
    P1003-->>- P0: return
    P0->>+ P1004: uses
    P1004-->>- P0: return
    P0->>+ P1005: uses
    P1005-->>- P0: return
    P0->>+ P1006: uses
    P1006-->>- P0: return
    P0->>+ P1007: uses
    P1007-->>- P0: return
    P0->>+ P1008: uses
    P1008-->>- P0: return
    P0->>+ P1009: uses
    P1009-->>- P0: return
    P0->>+ P1010: uses
    P1010-->>- P0: return
    P0->>+ P1011: uses
    P1011-->>- P0: return
    P0->>+ P1012: uses
    P1012-->>- P0: return
    P0->>+ P1013: uses
    P1013-->>- P0: return
    P0->>+ P1014: uses
    P1014-->>- P0: return
    P0->>+ P1015: uses
    P1015-->>- P0: return
    P0->>+ P1016: uses
    P1016-->>- P0: return
    P0->>+ P1017: uses
    P1017-->>- P0: return
    P0->>+ P1018: uses
    P1018-->>- P0: return
    P0->>+ P1019: uses
    P1019-->>- P0: return
    P0->>+ P1020: uses
    P1020-->>- P0: return
    P0->>+ P1021: uses
    P1021-->>- P0: return
    P0->>+ P1022: uses
    P1022-->>- P0: return
    P0->>+ P1023: uses
    P1023-->>- P0: return
    P0->>+ P1024: uses
    P1024-->>- P0: return
    P0->>+ P1025: uses
    P1025-->>- P0: return
    P0->>+ P1026: uses
    P1026-->>- P0: return
    P0->>+ P1027: uses
    P1027-->>- P0: return
    P0->>+ P1028: uses
    P1028-->>- P0: return
    P0->>+ P1029: uses
    P1029-->>- P0: return
    P0->>+ P1030: uses
    P1030-->>- P0: return
    P0->>+ P1031: uses
    P1031-->>- P0: return
    P0->>+ P1032: uses
    P1032-->>- P0: return
    P0->>+ P1033: uses
    P1033-->>- P0: return
    P0->>+ P1034: uses
    P1034-->>- P0: return
    P0->>+ P1035: uses
    P1035-->>- P0: return
    P0->>+ P1036: uses
    P1036-->>- P0: return
    P0->>+ P1037: uses
    P1037-->>- P0: return
    P0->>+ P1038: uses
    P1038-->>- P0: return
    P0->>+ P1039: uses
    P1039-->>- P0: return
    P0->>+ P1040: uses
    P1040-->>- P0: return
    P0->>+ P1041: uses
    P1041-->>- P0: return
    P0->>+ P1042: uses
    P1042-->>- P0: return
    P0->>+ P1043: uses
    P1043-->>- P0: return
    P0->>+ P1044: uses
    P1044-->>- P0: return
    P0->>+ P1045: uses
    P1045-->>- P0: return
    P0->>+ P1046: uses
    P1046-->>- P0: return
    P0->>+ P1047: uses
    P1047-->>- P0: return
    P0->>+ P1048: uses
    P1048-->>- P0: return
    P0->>+ P1049: uses
    P1049-->>- P0: return
    P0->>+ P1050: uses
    P1050-->>- P0: return
    P0->>+ P1051: uses
    P1051-->>- P0: return
    P0->>+ P1052: uses
    P1052-->>- P0: return
    P0->>+ P1053: uses
    P1053-->>- P0: return
    P0->>+ P1054: uses
    P1054-->>- P0: return
    P0->>+ P1055: uses
    P1055-->>- P0: return
    P0->>+ P1056: uses
    P1056-->>- P0: return
    P0->>+ P1057: calls
    P1057-->>- P0: return
    P0->>+ P1058: calls
    P1058-->>- P0: return
    P0->>+ P1059: calls
    P1059-->>- P0: return
    P0->>+ P1060: calls
    P1060-->>- P0: return
    P0->>+ P1061: calls
    P1061-->>- P0: return
    P0->>+ P1062: uses
    P1062-->>- P0: return
    P0->>+ P1063: uses
    P1063-->>- P0: return
    P0->>+ P1064: calls
    P1064-->>- P0: return
    P0->>+ P264: uses
    P264-->>- P0: return
    P0->>+ P265: uses
    P265-->>- P0: return
    P0->>+ P266: uses
    P266-->>- P0: return
    P0->>+ P267: uses
    P267-->>- P0: return
    P0->>+ P268: uses
    P268-->>- P0: return
    P0->>+ P269: uses
    P269-->>- P0: return
    P0->>+ P270: uses
    P270-->>- P0: return
    P0->>+ P271: uses
    P271-->>- P0: return
    P0->>+ P272: uses
    P272-->>- P0: return
    P0->>+ P273: uses
    P273-->>- P0: return
    P0->>+ P274: uses
    P274-->>- P0: return
    P0->>+ P275: uses
    P275-->>- P0: return
    P0->>+ P276: uses
    P276-->>- P0: return
    P0->>+ P277: uses
    P277-->>- P0: return
    P0->>+ P278: uses
    P278-->>- P0: return
    P0->>+ P279: uses
    P279-->>- P0: return
    P0->>+ P280: uses
    P280-->>- P0: return
    P0->>+ P281: uses
    P281-->>- P0: return
    P0->>+ P282: uses
    P282-->>- P0: return
    P0->>+ P283: uses
    P283-->>- P0: return
    P0->>+ P284: uses
    P284-->>- P0: return
    P0->>+ P285: uses
    P285-->>- P0: return
    P0->>+ P286: uses
    P286-->>- P0: return
    P0->>+ P287: uses
    P287-->>- P0: return
    P0->>+ P288: uses
    P288-->>- P0: return
    P0->>+ P289: uses
    P289-->>- P0: return
    P0->>+ P290: uses
    P290-->>- P0: return
    P0->>+ P291: uses
    P291-->>- P0: return
    P0->>+ P292: uses
    P292-->>- P0: return
    P0->>+ P293: uses
    P293-->>- P0: return
    P0->>+ P294: uses
    P294-->>- P0: return
    P0->>+ P295: uses
    P295-->>- P0: return
    P0->>+ P296: uses
    P296-->>- P0: return
    P0->>+ P297: uses
    P297-->>- P0: return
    P0->>+ P298: uses
    P298-->>- P0: return
    P0->>+ P299: uses
    P299-->>- P0: return
    P0->>+ P300: uses
    P300-->>- P0: return
    P0->>+ P301: uses
    P301-->>- P0: return
    P0->>+ P302: uses
    P302-->>- P0: return
    P0->>+ P303: uses
    P303-->>- P0: return
    P0->>+ P304: uses
    P304-->>- P0: return
    P0->>+ P305: uses
    P305-->>- P0: return
    P0->>+ P306: uses
    P306-->>- P0: return
    P0->>+ P307: uses
    P307-->>- P0: return
    P0->>+ P308: uses
    P308-->>- P0: return
    P0->>+ P309: uses
    P309-->>- P0: return
    P0->>+ P310: uses
    P310-->>- P0: return
    P0->>+ P311: uses
    P311-->>- P0: return
    P0->>+ P312: uses
    P312-->>- P0: return
    P0->>+ P313: uses
    P313-->>- P0: return
    P0->>+ P314: uses
    P314-->>- P0: return
    P0->>+ P315: uses
    P315-->>- P0: return
    P0->>+ P316: uses
    P316-->>- P0: return
    P0->>+ P317: uses
    P317-->>- P0: return
    P0->>+ P318: uses
    P318-->>- P0: return
    P0->>+ P319: uses
    P319-->>- P0: return
    P0->>+ P320: uses
    P320-->>- P0: return
    P0->>+ P321: uses
    P321-->>- P0: return
    P0->>+ P322: uses
    P322-->>- P0: return
    P0->>+ P1065: uses
    P1065-->>- P0: return
    P0->>+ P1066: uses
    P1066-->>- P0: return
    P0->>+ P1067: uses
    P1067-->>- P0: return
    P0->>+ P421: uses
    P421-->>- P0: return
    P0->>+ P422: uses
    P422-->>- P0: return
    P0->>+ P423: uses
    P423-->>- P0: return
    P0->>+ P424: uses
    P424-->>- P0: return
    P0->>+ P425: uses
    P425-->>- P0: return
    P0->>+ P426: uses
    P426-->>- P0: return
    P0->>+ P427: uses
    P427-->>- P0: return
    P0->>+ P428: uses
    P428-->>- P0: return
    P0->>+ P429: uses
    P429-->>- P0: return
    P0->>+ P430: uses
    P430-->>- P0: return
    P0->>+ P431: uses
    P431-->>- P0: return
    P0->>+ P432: uses
    P432-->>- P0: return
    P0->>+ P433: uses
    P433-->>- P0: return
    P0->>+ P434: uses
    P434-->>- P0: return
    P0->>+ P435: uses
    P435-->>- P0: return
    P0->>+ P436: uses
    P436-->>- P0: return
    P0->>+ P437: uses
    P437-->>- P0: return
    P0->>+ P438: uses
    P438-->>- P0: return
    P0->>+ P439: uses
    P439-->>- P0: return
    P0->>+ P440: uses
    P440-->>- P0: return
    P0->>+ P441: uses
    P441-->>- P0: return
    P0->>+ P442: uses
    P442-->>- P0: return
    P0->>+ P443: uses
    P443-->>- P0: return
    P0->>+ P444: uses
    P444-->>- P0: return
    P0->>+ P445: uses
    P445-->>- P0: return
    P0->>+ P446: uses
    P446-->>- P0: return
    P0->>+ P447: uses
    P447-->>- P0: return
    P0->>+ P448: uses
    P448-->>- P0: return
    P0->>+ P449: uses
    P449-->>- P0: return
    P0->>+ P450: uses
    P450-->>- P0: return
    P0->>+ P451: uses
    P451-->>- P0: return
    P0->>+ P452: uses
    P452-->>- P0: return
    P0->>+ P453: uses
    P453-->>- P0: return
    P0->>+ P454: uses
    P454-->>- P0: return
    P0->>+ P455: uses
    P455-->>- P0: return
    P0->>+ P456: uses
    P456-->>- P0: return
    P0->>+ P457: uses
    P457-->>- P0: return
    P0->>+ P458: uses
    P458-->>- P0: return
    P0->>+ P459: uses
    P459-->>- P0: return
    P0->>+ P460: uses
    P460-->>- P0: return
    P0->>+ P461: uses
    P461-->>- P0: return
    P0->>+ P462: uses
    P462-->>- P0: return
    P0->>+ P463: uses
    P463-->>- P0: return
    P0->>+ P464: uses
    P464-->>- P0: return
    P0->>+ P465: uses
    P465-->>- P0: return
    P0->>+ P466: uses
    P466-->>- P0: return
    P0->>+ P467: uses
    P467-->>- P0: return
    P0->>+ P468: uses
    P468-->>- P0: return
    P0->>+ P469: uses
    P469-->>- P0: return
    P0->>+ P470: uses
    P470-->>- P0: return
    P0->>+ P1068: uses
    P1068-->>- P0: return
    P0->>+ P1069: uses
    P1069-->>- P0: return
    P0->>+ P1070: uses
    P1070-->>- P0: return
    P0->>+ P1071: uses
    P1071-->>- P0: return
    P0->>+ P1072: uses
    P1072-->>- P0: return
    P0->>+ P1073: uses
    P1073-->>- P0: return
    P0->>+ P1074: uses
    P1074-->>- P0: return
    P0->>+ P1075: uses
    P1075-->>- P0: return
    P0->>+ P1076: uses
    P1076-->>- P0: return
    P0->>+ P1077: uses
    P1077-->>- P0: return
    P0->>+ P1078: uses
    P1078-->>- P0: return
    P0->>+ P1079: uses
    P1079-->>- P0: return
    P0->>+ P1080: uses
    P1080-->>- P0: return
    P0->>+ P1081: uses
    P1081-->>- P0: return
    P0->>+ P1082: uses
    P1082-->>- P0: return
    P0->>+ P1083: uses
    P1083-->>- P0: return
    P0->>+ P1084: uses
    P1084-->>- P0: return
    P0->>+ P1085: uses
    P1085-->>- P0: return
    P0->>+ P1086: uses
    P1086-->>- P0: return
    P0->>+ P1087: uses
    P1087-->>- P0: return
    P0->>+ P1088: uses
    P1088-->>- P0: return
    P0->>+ P1089: uses
    P1089-->>- P0: return
    P0->>+ P1090: uses
    P1090-->>- P0: return
    P0->>+ P1091: uses
    P1091-->>- P0: return
    P0->>+ P1092: uses
    P1092-->>- P0: return
    P0->>+ P1093: calls
    P1093-->>- P0: return
    P0->>+ P1094: calls
    P1094-->>- P0: return
    P0->>+ P1095: calls
    P1095-->>- P0: return
    P0->>+ P1096: calls
    P1096-->>- P0: return
    P0->>+ P1097: calls
    P1097-->>- P0: return
    P0->>+ P1098: calls
    P1098-->>- P0: return
    P0->>+ P1099: calls
    P1099-->>- P0: return
    P0->>+ P1100: calls
    P1100-->>- P0: return
    P0->>+ P1101: calls
    P1101-->>- P0: return
    P0->>+ P1102: calls
    P1102-->>- P0: return
    P0->>+ P1103: calls
    P1103-->>- P0: return
    P0->>+ P1104: calls
    P1104-->>- P0: return
    P0->>+ P1105: uses
    P1105-->>- P0: return
    P0->>+ P1106: uses
    P1106-->>- P0: return
    P0->>+ P1107: uses
    P1107-->>- P0: return
    P0->>+ P1108: uses
    P1108-->>- P0: return
    P0->>+ P1109: uses
    P1109-->>- P0: return
    P0->>+ P1110: uses
    P1110-->>- P0: return
    P0->>+ P1111: uses
    P1111-->>- P0: return
    P0->>+ P1112: uses
    P1112-->>- P0: return
    P0->>+ P1113: uses
    P1113-->>- P0: return
    P0->>+ P1114: uses
    P1114-->>- P0: return
    P0->>+ P1115: uses
    P1115-->>- P0: return
    P0->>+ P1116: uses
    P1116-->>- P0: return
    P0->>+ P1117: uses
    P1117-->>- P0: return
    P0->>+ P1118: uses
    P1118-->>- P0: return
    P0->>+ P1119: uses
    P1119-->>- P0: return
    P0->>+ P1120: uses
    P1120-->>- P0: return
    P0->>+ P1121: uses
    P1121-->>- P0: return
    P0->>+ P1122: uses
    P1122-->>- P0: return
    P0->>+ P1123: uses
    P1123-->>- P0: return
    P0->>+ P1124: uses
    P1124-->>- P0: return
    P0->>+ P1125: uses
    P1125-->>- P0: return
    P0->>+ P1126: uses
    P1126-->>- P0: return
    P0->>+ P1127: uses
    P1127-->>- P0: return
    P0->>+ P1128: uses
    P1128-->>- P0: return
    P0->>+ P1129: uses
    P1129-->>- P0: return
    P0->>+ P1130: uses
    P1130-->>- P0: return
    P0->>+ P1131: uses
    P1131-->>- P0: return
    P0->>+ P1132: uses
    P1132-->>- P0: return
    P0->>+ P1133: uses
    P1133-->>- P0: return
    P0->>+ P1134: uses
    P1134-->>- P0: return
    P0->>+ P1135: uses
    P1135-->>- P0: return
    P0->>+ P1136: uses
    P1136-->>- P0: return
    P0->>+ P1137: uses
    P1137-->>- P0: return
    P0->>+ P1138: uses
    P1138-->>- P0: return
    P0->>+ P1139: uses
    P1139-->>- P0: return
    P0->>+ P1140: uses
    P1140-->>- P0: return
    P0->>+ P1141: uses
    P1141-->>- P0: return
    P0->>+ P1142: uses
    P1142-->>- P0: return
    P0->>+ P1143: uses
    P1143-->>- P0: return
    P0->>+ P1144: uses
    P1144-->>- P0: return
    P0->>+ P1145: uses
    P1145-->>- P0: return
    P0->>+ P1146: uses
    P1146-->>- P0: return
    P0->>+ P1147: uses
    P1147-->>- P0: return
    P0->>+ P1148: uses
    P1148-->>- P0: return
    P0->>+ P1149: uses
    P1149-->>- P0: return
    P0->>+ P1150: uses
    P1150-->>- P0: return
    P0->>+ P1151: uses
    P1151-->>- P0: return
    P0->>+ P1152: uses
    P1152-->>- P0: return
    P0->>+ P1153: uses
    P1153-->>- P0: return
    P0->>+ P1154: uses
    P1154-->>- P0: return
    P0->>+ P1155: uses
    P1155-->>- P0: return
    P0->>+ P1156: uses
    P1156-->>- P0: return
    P0->>+ P1157: uses
    P1157-->>- P0: return
    P0->>+ P1158: uses
    P1158-->>- P0: return
    P0->>+ P1159: uses
    P1159-->>- P0: return
    P0->>+ P1160: uses
    P1160-->>- P0: return
    P0->>+ P1161: uses
    P1161-->>- P0: return
    P0->>+ P1162: uses
    P1162-->>- P0: return
    P0->>+ P1163: uses
    P1163-->>- P0: return
    P0->>+ P1164: uses
    P1164-->>- P0: return
    P0->>+ P1165: uses
    P1165-->>- P0: return
    P0->>+ P1166: uses
    P1166-->>- P0: return
    P0->>+ P1167: uses
    P1167-->>- P0: return
    P0->>+ P1168: uses
    P1168-->>- P0: return
    P0->>+ P1169: uses
    P1169-->>- P0: return
    P0->>+ P1170: uses
    P1170-->>- P0: return
    P0->>+ P1171: uses
    P1171-->>- P0: return
    P0->>+ P1172: uses
    P1172-->>- P0: return
    P0->>+ P1173: uses
    P1173-->>- P0: return
    P0->>+ P1174: uses
    P1174-->>- P0: return
    P0->>+ P1175: uses
    P1175-->>- P0: return
    P0->>+ P1176: uses
    P1176-->>- P0: return
    P0->>+ P1177: uses
    P1177-->>- P0: return
    P0->>+ P1178: uses
    P1178-->>- P0: return
    P0->>+ P1179: uses
    P1179-->>- P0: return
    P0->>+ P1180: uses
    P1180-->>- P0: return
    P0->>+ P1181: uses
    P1181-->>- P0: return
    P0->>+ P1182: uses
    P1182-->>- P0: return
    P0->>+ P1183: uses
    P1183-->>- P0: return
    P0->>+ P1184: uses
    P1184-->>- P0: return
    P0->>+ P1185: calls
    P1185-->>- P0: return
    P0->>+ P1186: calls
    P1186-->>- P0: return
    P0->>+ P1187: calls
    P1187-->>- P0: return
    P0->>+ P1188: calls
    P1188-->>- P0: return
    P0->>+ P1189: calls
    P1189-->>- P0: return
    P0->>+ P1190: calls
    P1190-->>- P0: return
    P0->>+ P1191: calls
    P1191-->>- P0: return
    P0->>+ P1192: calls
    P1192-->>- P0: return
    P0->>+ P1193: calls
    P1193-->>- P0: return
    P0->>+ P1194: calls
    P1194-->>- P0: return
    P0->>+ P1195: uses
    P1195-->>- P0: return
    P0->>+ P1196: uses
    P1196-->>- P0: return
    P0->>+ P1197: uses
    P1197-->>- P0: return
    P0->>+ P1198: uses
    P1198-->>- P0: return
    P0->>+ P1199: uses
    P1199-->>- P0: return
    P0->>+ P1200: uses
    P1200-->>- P0: return
    P0->>+ P1201: uses
    P1201-->>- P0: return
    P0->>+ P1202: uses
    P1202-->>- P0: return
    P0->>+ P1203: uses
    P1203-->>- P0: return
    P0->>+ P1204: calls
    P1204-->>- P0: return
    P0->>+ P1205: calls
    P1205-->>- P0: return
    P0->>+ P1206: calls
    P1206-->>- P0: return
    P0->>+ P1207: calls
    P1207-->>- P0: return
    P0->>+ P1208: calls
    P1208-->>- P0: return
    P0->>+ P1209: uses
    P1209-->>- P0: return
    P0->>+ P1210: uses
    P1210-->>- P0: return
    P0->>+ P1211: uses
    P1211-->>- P0: return
    P0->>+ P1212: uses
    P1212-->>- P0: return
    P0->>+ P1213: uses
    P1213-->>- P0: return
    P0->>+ P1214: uses
    P1214-->>- P0: return
    P0->>+ P1215: uses
    P1215-->>- P0: return
    P0->>+ P1216: uses
    P1216-->>- P0: return
    P0->>+ P1217: uses
    P1217-->>- P0: return
    P0->>+ P1218: uses
    P1218-->>- P0: return
    P0->>+ P1219: uses
    P1219-->>- P0: return
    P0->>+ P1220: uses
    P1220-->>- P0: return
    P0->>+ P1221: uses
    P1221-->>- P0: return
    P0->>+ P1222: uses
    P1222-->>- P0: return
    P0->>+ P1223: uses
    P1223-->>- P0: return
    P0->>+ P1224: uses
    P1224-->>- P0: return
    P0->>+ P1225: uses
    P1225-->>- P0: return
    P0->>+ P1226: uses
    P1226-->>- P0: return
    P0->>+ P1227: uses
    P1227-->>- P0: return
    P0->>+ P1228: uses
    P1228-->>- P0: return
    P0->>+ P1229: uses
    P1229-->>- P0: return
    P0->>+ P1230: uses
    P1230-->>- P0: return
    P0->>+ P1231: uses
    P1231-->>- P0: return
    P0->>+ P1232: uses
    P1232-->>- P0: return
    P0->>+ P1233: uses
    P1233-->>- P0: return
    P0->>+ P1234: uses
    P1234-->>- P0: return
    P0->>+ P1235: uses
    P1235-->>- P0: return
    P0->>+ P1236: uses
    P1236-->>- P0: return
    P0->>+ P1237: uses
    P1237-->>- P0: return
    P0->>+ P1238: uses
    P1238-->>- P0: return
    P0->>+ P1239: uses
    P1239-->>- P0: return
    P0->>+ P1240: uses
    P1240-->>- P0: return
    P0->>+ P1241: uses
    P1241-->>- P0: return
    P0->>+ P1242: uses
    P1242-->>- P0: return
    P0->>+ P1243: uses
    P1243-->>- P0: return
    P0->>+ P1244: uses
    P1244-->>- P0: return
    P0->>+ P1245: uses
    P1245-->>- P0: return
    P0->>+ P1246: uses
    P1246-->>- P0: return
    P0->>+ P1247: uses
    P1247-->>- P0: return
    P0->>+ P1248: uses
    P1248-->>- P0: return
    P0->>+ P1249: uses
    P1249-->>- P0: return
    P0->>+ P1250: uses
    P1250-->>- P0: return
    P0->>+ P1251: uses
    P1251-->>- P0: return
    P0->>+ P1252: uses
    P1252-->>- P0: return
    P0->>+ P1253: uses
    P1253-->>- P0: return
    P0->>+ P1254: uses
    P1254-->>- P0: return
    P0->>+ P1255: uses
    P1255-->>- P0: return
    P0->>+ P1256: uses
    P1256-->>- P0: return
    P0->>+ P1257: uses
    P1257-->>- P0: return
    P0->>+ P1258: uses
    P1258-->>- P0: return
    P0->>+ P1259: uses
    P1259-->>- P0: return
    P0->>+ P1260: uses
    P1260-->>- P0: return
    P0->>+ P1261: uses
    P1261-->>- P0: return
    P0->>+ P1262: uses
    P1262-->>- P0: return
    P0->>+ P1263: uses
    P1263-->>- P0: return
    P0->>+ P1264: uses
    P1264-->>- P0: return
    P0->>+ P1265: uses
    P1265-->>- P0: return
    P0->>+ P1266: uses
    P1266-->>- P0: return
    P0->>+ P1267: uses
    P1267-->>- P0: return
    P0->>+ P1268: uses
    P1268-->>- P0: return
    P0->>+ P1269: uses
    P1269-->>- P0: return
    P0->>+ P1270: uses
    P1270-->>- P0: return
    P0->>+ P1271: uses
    P1271-->>- P0: return
    P0->>+ P1272: uses
    P1272-->>- P0: return
    P0->>+ P1273: uses
    P1273-->>- P0: return
    P0->>+ P1274: uses
    P1274-->>- P0: return
    P0->>+ P1275: uses
    P1275-->>- P0: return
    P0->>+ P1276: uses
    P1276-->>- P0: return
    P0->>+ P1277: uses
    P1277-->>- P0: return
    P0->>+ P1278: uses
    P1278-->>- P0: return
    P0->>+ P1279: uses
    P1279-->>- P0: return
    P0->>+ P1280: uses
    P1280-->>- P0: return
    P0->>+ P1281: uses
    P1281-->>- P0: return
    P0->>+ P1282: uses
    P1282-->>- P0: return
    P0->>+ P1283: uses
    P1283-->>- P0: return
    P0->>+ P1284: uses
    P1284-->>- P0: return
    P0->>+ P1285: uses
    P1285-->>- P0: return
    P0->>+ P1286: uses
    P1286-->>- P0: return
    P0->>+ P1287: uses
    P1287-->>- P0: return
    P0->>+ P1288: uses
    P1288-->>- P0: return
    P0->>+ P1289: uses
    P1289-->>- P0: return
    P0->>+ P1290: uses
    P1290-->>- P0: return
    P0->>+ P1291: uses
    P1291-->>- P0: return
    P0->>+ P1292: uses
    P1292-->>- P0: return
    P0->>+ P1293: uses
    P1293-->>- P0: return
    P0->>+ P1294: uses
    P1294-->>- P0: return
    P0->>+ P1295: uses
    P1295-->>- P0: return
    P0->>+ P1296: uses
    P1296-->>- P0: return
    P0->>+ P1297: uses
    P1297-->>- P0: return
    P0->>+ P1298: uses
    P1298-->>- P0: return
    P0->>+ P1299: uses
    P1299-->>- P0: return
    P0->>+ P1300: uses
    P1300-->>- P0: return
    P0->>+ P1301: uses
    P1301-->>- P0: return
    P0->>+ P1302: uses
    P1302-->>- P0: return
    P0->>+ P1303: uses
    P1303-->>- P0: return
    P0->>+ P1304: uses
    P1304-->>- P0: return
    P0->>+ P1305: uses
    P1305-->>- P0: return
    P0->>+ P1306: uses
    P1306-->>- P0: return
    P0->>+ P1307: uses
    P1307-->>- P0: return
    P0->>+ P1308: uses
    P1308-->>- P0: return
    P0->>+ P1309: uses
    P1309-->>- P0: return
    P0->>+ P1310: uses
    P1310-->>- P0: return
    P0->>+ P1311: uses
    P1311-->>- P0: return
    P0->>+ P1312: uses
    P1312-->>- P0: return
    P0->>+ P1313: uses
    P1313-->>- P0: return
    P0->>+ P1314: uses
    P1314-->>- P0: return
    P0->>+ P1315: uses
    P1315-->>- P0: return
    P0->>+ P1316: uses
    P1316-->>- P0: return
    P0->>+ P1317: uses
    P1317-->>- P0: return
    P0->>+ P1318: uses
    P1318-->>- P0: return
    P0->>+ P1319: uses
    P1319-->>- P0: return
    P0->>+ P1320: uses
    P1320-->>- P0: return
    P0->>+ P1321: uses
    P1321-->>- P0: return
    P0->>+ P1322: uses
    P1322-->>- P0: return
    P0->>+ P1323: uses
    P1323-->>- P0: return
    P0->>+ P1324: uses
    P1324-->>- P0: return
    P0->>+ P1325: uses
    P1325-->>- P0: return
    P0->>+ P1326: uses
    P1326-->>- P0: return
    P0->>+ P1327: uses
    P1327-->>- P0: return
    P0->>+ P1328: uses
    P1328-->>- P0: return
    P0->>+ P1329: uses
    P1329-->>- P0: return
    P0->>+ P1330: uses
    P1330-->>- P0: return
    P0->>+ P1331: uses
    P1331-->>- P0: return
    P0->>+ P1332: uses
    P1332-->>- P0: return
    P0->>+ P1333: uses
    P1333-->>- P0: return
    P0->>+ P1334: uses
    P1334-->>- P0: return
    P0->>+ P1335: uses
    P1335-->>- P0: return
    P0->>+ P1336: uses
    P1336-->>- P0: return
    P0->>+ P1337: uses
    P1337-->>- P0: return
    P0->>+ P1338: uses
    P1338-->>- P0: return
    P0->>+ P1339: uses
    P1339-->>- P0: return
    P0->>+ P1340: uses
    P1340-->>- P0: return
    P0->>+ P1341: uses
    P1341-->>- P0: return
    P0->>+ P1342: uses
    P1342-->>- P0: return
    P0->>+ P1343: uses
    P1343-->>- P0: return
    P0->>+ P1344: uses
    P1344-->>- P0: return
    P0->>+ P1345: uses
    P1345-->>- P0: return
    P0->>+ P1346: uses
    P1346-->>- P0: return
    P0->>+ P1347: uses
    P1347-->>- P0: return
    P0->>+ P1348: uses
    P1348-->>- P0: return
    P0->>+ P1349: uses
    P1349-->>- P0: return
    P0->>+ P1350: uses
    P1350-->>- P0: return
    P0->>+ P1351: uses
    P1351-->>- P0: return
    P0->>+ P1352: uses
    P1352-->>- P0: return
    P0->>+ P1353: uses
    P1353-->>- P0: return
    P0->>+ P1354: uses
    P1354-->>- P0: return
    P0->>+ P1355: uses
    P1355-->>- P0: return
    P0->>+ P1356: uses
    P1356-->>- P0: return
    P0->>+ P1357: uses
    P1357-->>- P0: return
    P0->>+ P1358: uses
    P1358-->>- P0: return
    P0->>+ P1359: uses
    P1359-->>- P0: return
    P0->>+ P1360: uses
    P1360-->>- P0: return
    P0->>+ P1361: uses
    P1361-->>- P0: return
    P0->>+ P1362: uses
    P1362-->>- P0: return
    P0->>+ P1363: uses
    P1363-->>- P0: return
    P0->>+ P1364: uses
    P1364-->>- P0: return
    P0->>+ P1365: uses
    P1365-->>- P0: return
    P0->>+ P1366: uses
    P1366-->>- P0: return
    P0->>+ P1367: uses
    P1367-->>- P0: return
    P0->>+ P1368: uses
    P1368-->>- P0: return
    P0->>+ P1369: uses
    P1369-->>- P0: return
    P0->>+ P1370: uses
    P1370-->>- P0: return
    P0->>+ P1371: uses
    P1371-->>- P0: return
    P0->>+ P1372: uses
    P1372-->>- P0: return
    P0->>+ P1373: uses
    P1373-->>- P0: return
    P0->>+ P1374: uses
    P1374-->>- P0: return
    P0->>+ P1375: uses
    P1375-->>- P0: return
    P0->>+ P1376: uses
    P1376-->>- P0: return
    P0->>+ P1377: uses
    P1377-->>- P0: return
    P0->>+ P1378: uses
    P1378-->>- P0: return
    P0->>+ P1379: uses
    P1379-->>- P0: return
    P0->>+ P1380: uses
    P1380-->>- P0: return
    P0->>+ P1381: uses
    P1381-->>- P0: return
    P0->>+ P1382: uses
    P1382-->>- P0: return
    P0->>+ P1383: uses
    P1383-->>- P0: return
    P0->>+ P1384: uses
    P1384-->>- P0: return
    P0->>+ P1385: uses
    P1385-->>- P0: return
    P0->>+ P1386: uses
    P1386-->>- P0: return
    P0->>+ P1387: uses
    P1387-->>- P0: return
    P0->>+ P1388: uses
    P1388-->>- P0: return
    P0->>+ P1389: uses
    P1389-->>- P0: return
    P0->>+ P1390: uses
    P1390-->>- P0: return
    P0->>+ P1391: uses
    P1391-->>- P0: return
    P0->>+ P1392: uses
    P1392-->>- P0: return
    P0->>+ P1393: uses
    P1393-->>- P0: return
    P0->>+ P1394: uses
    P1394-->>- P0: return
    P0->>+ P1395: uses
    P1395-->>- P0: return
    P0->>+ P1396: calls
    P1396-->>- P0: return
    P0->>+ P1397: calls
    P1397-->>- P0: return
    P0->>+ P1398: calls
    P1398-->>- P0: return
    P0->>+ P1399: calls
    P1399-->>- P0: return
    P0->>+ P1400: calls
    P1400-->>- P0: return
    P0->>+ P1401: calls
    P1401-->>- P0: return
    P0->>+ P1402: calls
    P1402-->>- P0: return
    P0->>+ P1403: calls
    P1403-->>- P0: return
    P0->>+ P1404: calls
    P1404-->>- P0: return
    P0->>+ P1405: uses
    P1405-->>- P0: return
    P0->>+ P1406: uses
    P1406-->>- P0: return
    P0->>+ P1407: uses
    P1407-->>- P0: return
    P0->>+ P1408: uses
    P1408-->>- P0: return
    P0->>+ P1409: uses
    P1409-->>- P0: return
    P0->>+ P1410: uses
    P1410-->>- P0: return
    P0->>+ P1411: uses
    P1411-->>- P0: return
    P0->>+ P1412: uses
    P1412-->>- P0: return
    P0->>+ P1413: uses
    P1413-->>- P0: return
    P0->>+ P1414: uses
    P1414-->>- P0: return
    P0->>+ P1415: uses
    P1415-->>- P0: return
    P0->>+ P1416: uses
    P1416-->>- P0: return
    P0->>+ P1417: uses
    P1417-->>- P0: return
    P0->>+ P1418: uses
    P1418-->>- P0: return
    P0->>+ P1419: uses
    P1419-->>- P0: return
    P0->>+ P1420: uses
    P1420-->>- P0: return
    P0->>+ P1421: uses
    P1421-->>- P0: return
    P0->>+ P1422: uses
    P1422-->>- P0: return
    P0->>+ P1423: uses
    P1423-->>- P0: return
    P0->>+ P1424: uses
    P1424-->>- P0: return
    P0->>+ P1425: uses
    P1425-->>- P0: return
    P0->>+ P1426: uses
    P1426-->>- P0: return
    P0->>+ P1427: uses
    P1427-->>- P0: return
    P0->>+ P1428: uses
    P1428-->>- P0: return
    P0->>+ P1429: uses
    P1429-->>- P0: return
    P0->>+ P1430: uses
    P1430-->>- P0: return
    P0->>+ P1431: uses
    P1431-->>- P0: return
    P0->>+ P1432: uses
    P1432-->>- P0: return
    P0->>+ P1433: uses
    P1433-->>- P0: return
    P0->>+ P1434: uses
    P1434-->>- P0: return
    P0->>+ P1435: uses
    P1435-->>- P0: return
    P0->>+ P1436: uses
    P1436-->>- P0: return
    P0->>+ P1437: uses
    P1437-->>- P0: return
    P0->>+ P1438: uses
    P1438-->>- P0: return
    P0->>+ P1439: uses
    P1439-->>- P0: return
    P0->>+ P1440: uses
    P1440-->>- P0: return
    P0->>+ P1441: uses
    P1441-->>- P0: return
    P0->>+ P1442: uses
    P1442-->>- P0: return
    P0->>+ P1443: uses
    P1443-->>- P0: return
    P0->>+ P1444: uses
    P1444-->>- P0: return
    P0->>+ P1445: uses
    P1445-->>- P0: return
    P0->>+ P1446: uses
    P1446-->>- P0: return
    P0->>+ P1447: uses
    P1447-->>- P0: return
    P0->>+ P1448: uses
    P1448-->>- P0: return
    P0->>+ P1449: uses
    P1449-->>- P0: return
    P0->>+ P1450: uses
    P1450-->>- P0: return
    P0->>+ P1451: uses
    P1451-->>- P0: return
    P0->>+ P1452: uses
    P1452-->>- P0: return
    P0->>+ P1453: uses
    P1453-->>- P0: return
    P0->>+ P1454: uses
    P1454-->>- P0: return
    P0->>+ P1455: uses
    P1455-->>- P0: return
    P0->>+ P1456: uses
    P1456-->>- P0: return
    P0->>+ P1457: uses
    P1457-->>- P0: return
    P0->>+ P1458: uses
    P1458-->>- P0: return
    P0->>+ P1459: uses
    P1459-->>- P0: return
    P0->>+ P1460: uses
    P1460-->>- P0: return
    P0->>+ P1461: uses
    P1461-->>- P0: return
    P0->>+ P1462: uses
    P1462-->>- P0: return
    P0->>+ P1463: uses
    P1463-->>- P0: return
    P0->>+ P1464: uses
    P1464-->>- P0: return
    P0->>+ P1465: uses
    P1465-->>- P0: return
    P0->>+ P1466: uses
    P1466-->>- P0: return
    P0->>+ P1467: uses
    P1467-->>- P0: return
    P0->>+ P1468: uses
    P1468-->>- P0: return
    P0->>+ P1469: uses
    P1469-->>- P0: return
    P0->>+ P1470: uses
    P1470-->>- P0: return
    P0->>+ P1471: uses
    P1471-->>- P0: return
    P0->>+ P1472: uses
    P1472-->>- P0: return
    P0->>+ P1473: uses
    P1473-->>- P0: return
    P0->>+ P1474: uses
    P1474-->>- P0: return
    P0->>+ P1475: uses
    P1475-->>- P0: return
    P0->>+ P1476: uses
    P1476-->>- P0: return
    P0->>+ P1477: uses
    P1477-->>- P0: return
    P0->>+ P1478: uses
    P1478-->>- P0: return
    P0->>+ P1479: uses
    P1479-->>- P0: return
    P0->>+ P1480: uses
    P1480-->>- P0: return
    P0->>+ P1481: uses
    P1481-->>- P0: return
    P0->>+ P1482: uses
    P1482-->>- P0: return
    P0->>+ P1483: uses
    P1483-->>- P0: return
    P0->>+ P1484: uses
    P1484-->>- P0: return
    P0->>+ P1485: uses
    P1485-->>- P0: return
    P0->>+ P1486: uses
    P1486-->>- P0: return
    P0->>+ P1487: uses
    P1487-->>- P0: return
    P0->>+ P1488: uses
    P1488-->>- P0: return
    P0->>+ P1489: uses
    P1489-->>- P0: return
    P0->>+ P1490: uses
    P1490-->>- P0: return
    P0->>+ P1491: uses
    P1491-->>- P0: return
    P0->>+ P1492: uses
    P1492-->>- P0: return
    P0->>+ P1493: uses
    P1493-->>- P0: return
    P0->>+ P1494: uses
    P1494-->>- P0: return
    P0->>+ P1495: uses
    P1495-->>- P0: return
    P0->>+ P1496: uses
    P1496-->>- P0: return
    P0->>+ P1497: uses
    P1497-->>- P0: return
    P0->>+ P1498: uses
    P1498-->>- P0: return
    P0->>+ P1499: uses
    P1499-->>- P0: return
    P0->>+ P1500: uses
    P1500-->>- P0: return
    P0->>+ P1501: uses
    P1501-->>- P0: return
    P0->>+ P1502: uses
    P1502-->>- P0: return
    P0->>+ P1503: uses
    P1503-->>- P0: return
    P0->>+ P1504: uses
    P1504-->>- P0: return
    P0->>+ P1505: uses
    P1505-->>- P0: return
    P0->>+ P1506: uses
    P1506-->>- P0: return
    P0->>+ P1507: uses
    P1507-->>- P0: return
    P0->>+ P1508: uses
    P1508-->>- P0: return
    P0->>+ P1509: uses
    P1509-->>- P0: return
    P0->>+ P1510: uses
    P1510-->>- P0: return
    P0->>+ P1511: uses
    P1511-->>- P0: return
    P0->>+ P1512: uses
    P1512-->>- P0: return
    P0->>+ P1513: uses
    P1513-->>- P0: return
    P0->>+ P1514: uses
    P1514-->>- P0: return
    P0->>+ P1515: uses
    P1515-->>- P0: return
    P0->>+ P1516: uses
    P1516-->>- P0: return
    P0->>+ P1517: uses
    P1517-->>- P0: return
    P0->>+ P1518: uses
    P1518-->>- P0: return
    P0->>+ P1519: uses
    P1519-->>- P0: return
    P0->>+ P1520: uses
    P1520-->>- P0: return
    P0->>+ P1521: uses
    P1521-->>- P0: return
    P0->>+ P1522: uses
    P1522-->>- P0: return
    P0->>+ P1523: uses
    P1523-->>- P0: return
    P0->>+ P1524: uses
    P1524-->>- P0: return
    P0->>+ P1525: uses
    P1525-->>- P0: return
    P0->>+ P1526: uses
    P1526-->>- P0: return
    P0->>+ P1527: uses
    P1527-->>- P0: return
    P0->>+ P1528: uses
    P1528-->>- P0: return
    P0->>+ P1529: uses
    P1529-->>- P0: return
    P0->>+ P1530: uses
    P1530-->>- P0: return
    P0->>+ P1531: uses
    P1531-->>- P0: return
    P0->>+ P1532: uses
    P1532-->>- P0: return
    P0->>+ P1533: uses
    P1533-->>- P0: return
    P0->>+ P1534: uses
    P1534-->>- P0: return
    P0->>+ P1535: uses
    P1535-->>- P0: return
    P0->>+ P1536: uses
    P1536-->>- P0: return
    P0->>+ P1537: uses
    P1537-->>- P0: return
    P0->>+ P1538: uses
    P1538-->>- P0: return
    P0->>+ P1539: uses
    P1539-->>- P0: return
    P0->>+ P1540: uses
    P1540-->>- P0: return
    P0->>+ P1541: uses
    P1541-->>- P0: return
    P0->>+ P1542: uses
    P1542-->>- P0: return
    P0->>+ P1543: uses
    P1543-->>- P0: return
    P0->>+ P1544: uses
    P1544-->>- P0: return
    P0->>+ P1545: uses
    P1545-->>- P0: return
    P0->>+ P1546: uses
    P1546-->>- P0: return
    P0->>+ P1547: uses
    P1547-->>- P0: return
    P0->>+ P1548: uses
    P1548-->>- P0: return
    P0->>+ P1549: uses
    P1549-->>- P0: return
    P0->>+ P1550: uses
    P1550-->>- P0: return
    P0->>+ P1551: uses
    P1551-->>- P0: return
    P0->>+ P1552: uses
    P1552-->>- P0: return
    P0->>+ P1553: uses
    P1553-->>- P0: return
    P0->>+ P1554: uses
    P1554-->>- P0: return
    P0->>+ P1555: uses
    P1555-->>- P0: return
    P0->>+ P1556: uses
    P1556-->>- P0: return
    P0->>+ P1557: uses
    P1557-->>- P0: return
    P0->>+ P1558: uses
    P1558-->>- P0: return
    P0->>+ P1559: uses
    P1559-->>- P0: return
    P0->>+ P1560: uses
    P1560-->>- P0: return
    P0->>+ P1561: uses
    P1561-->>- P0: return
    P0->>+ P1562: uses
    P1562-->>- P0: return
    P0->>+ P1563: uses
    P1563-->>- P0: return
    P0->>+ P1564: uses
    P1564-->>- P0: return
    P0->>+ P1565: uses
    P1565-->>- P0: return
    P0->>+ P1566: uses
    P1566-->>- P0: return
    P0->>+ P1567: uses
    P1567-->>- P0: return
    P0->>+ P1568: uses
    P1568-->>- P0: return
    P0->>+ P1569: uses
    P1569-->>- P0: return
    P0->>+ P1570: uses
    P1570-->>- P0: return
    P0->>+ P1571: uses
    P1571-->>- P0: return
    P0->>+ P1572: uses
    P1572-->>- P0: return
    P0->>+ P1573: uses
    P1573-->>- P0: return
    P0->>+ P1574: uses
    P1574-->>- P0: return
    P0->>+ P1575: uses
    P1575-->>- P0: return
    P0->>+ P1576: calls
    P1576-->>- P0: return
    P0->>+ P1577: calls
    P1577-->>- P0: return
    P0->>+ P1578: calls
    P1578-->>- P0: return
    P0->>+ P1579: calls
    P1579-->>- P0: return
    P0->>+ P1580: calls
    P1580-->>- P0: return
    P0->>+ P1581: calls
    P1581-->>- P0: return
    P0->>+ P325: uses
    P325-->>- P0: return
    P0->>+ P326: uses
    P326-->>- P0: return
    P0->>+ P327: uses
    P327-->>- P0: return
    P0->>+ P328: uses
    P328-->>- P0: return
    P0->>+ P1582: uses
    P1582-->>- P0: return
    P0->>+ P1583: uses
    P1583-->>- P0: return
    P0->>+ P1584: uses
    P1584-->>- P0: return
    P0->>+ P1585: uses
    P1585-->>- P0: return
    P0->>+ P1586: uses
    P1586-->>- P0: return
    P0->>+ P1587: uses
    P1587-->>- P0: return
    P0->>+ P1588: uses
    P1588-->>- P0: return
    P0->>+ P329: uses
    P329-->>- P0: return
    P0->>+ P330: uses
    P330-->>- P0: return
    P0->>+ P331: uses
    P331-->>- P0: return
    P0->>+ P332: uses
    P332-->>- P0: return
    P0->>+ P333: uses
    P333-->>- P0: return
    P0->>+ P334: uses
    P334-->>- P0: return
    P0->>+ P335: uses
    P335-->>- P0: return
    P0->>+ P336: uses
    P336-->>- P0: return
    P0->>+ P337: uses
    P337-->>- P0: return
    P0->>+ P338: uses
    P338-->>- P0: return
    P0->>+ P339: uses
    P339-->>- P0: return
    P0->>+ P340: uses
    P340-->>- P0: return
    P0->>+ P341: uses
    P341-->>- P0: return
    P0->>+ P342: uses
    P342-->>- P0: return
    P0->>+ P343: uses
    P343-->>- P0: return
    P0->>+ P344: uses
    P344-->>- P0: return
    P0->>+ P345: uses
    P345-->>- P0: return
    P0->>+ P346: uses
    P346-->>- P0: return
    P0->>+ P347: uses
    P347-->>- P0: return
    P0->>+ P348: uses
    P348-->>- P0: return
    P0->>+ P349: uses
    P349-->>- P0: return
    P0->>+ P350: uses
    P350-->>- P0: return
    P0->>+ P351: uses
    P351-->>- P0: return
    P0->>+ P352: uses
    P352-->>- P0: return
    P0->>+ P353: uses
    P353-->>- P0: return
    P0->>+ P354: uses
    P354-->>- P0: return
    P0->>+ P355: uses
    P355-->>- P0: return
    P0->>+ P356: uses
    P356-->>- P0: return
    P0->>+ P357: uses
    P357-->>- P0: return
    P0->>+ P358: uses
    P358-->>- P0: return
    P0->>+ P359: uses
    P359-->>- P0: return
    P0->>+ P360: uses
    P360-->>- P0: return
    P0->>+ P361: uses
    P361-->>- P0: return
    P0->>+ P362: uses
    P362-->>- P0: return
    P0->>+ P1589: calls
    P1589-->>- P0: return
    P0->>+ P1590: calls
    P1590-->>- P0: return
```

## Connections by Relation

### calls
- [[server()]] `INFERRED`
- [[build_app()]] `INFERRED`
- [[_build_accounts_app()]] `INFERRED`
- [[_build_app()]] `INFERRED`
- [[test_launch_runner_validates_workspace_boundary()]] `INFERRED`
- [[_build_liveness_app()]] `INFERRED`
- [[header_mode_app()]] `INFERRED`
- [[test_runner_exited_report_surfaces_in_runner_status()]] `INFERRED`
- [[test_health_reports_online_for_host_on_other_replica()]] `INFERRED`
- [[_build_app_with_stub_stores()]] `INFERRED`
- [[test_health_unbound_fork_of_coding_session_reads_offline()]] `INFERRED`
- [[_build_api_only_app()]] `INFERRED`
- [[test_resolve_host_launch_enforces_host_and_session_ownership()]] `INFERRED`
- [[managed_session_env()]] `INFERRED`
- [[test_managed_session_create_without_config_fails_clearly()]] `INFERRED`
- [[host_perm_app()]] `INFERRED`
- [[test_host_routes_mounted_with_host_store()]] `INFERRED`
- [[host_aware_client()]] `INFERRED`
- [[app()]] `INFERRED`
- [[test_list_sessions_includes_workspace_and_host_id()]] `INFERRED`

### contains
- [[host_store.py]] `EXTRACTED`

### method
- [[.upsert_on_connect()]] `EXTRACTED`
- [[.register_managed_host()]] `EXTRACTED`
- [[.list_hosts()]] `EXTRACTED`
- [[.resolve_launch_token()]] `EXTRACTED`
- [[.set_offline()]] `EXTRACTED`
- [[.online_host_ids()]] `EXTRACTED`
- [[._reown_host_id()]] `EXTRACTED`
- [[.heartbeat()]] `EXTRACTED`
- [[.is_online()]] `EXTRACTED`
- [[.get_host()]] `EXTRACTED`
- [[.revoke_launch_token()]] `EXTRACTED`
- [[.delete_host()]] `EXTRACTED`
- [[.__init__()]] `EXTRACTED`

### rationale_for
- [[Persistent store for host registrations backed by SQLAlchemy.      :param stor]] `EXTRACTED`

### uses
- [[ManagedSandboxConfig]] `INFERRED`
- [[ManagedLaunchTracker]] `INFERRED`
- [[RepoWorkspace]] `INFERRED`
- [[SqlConversation]] `INFERRED`
- [[ManagedHostLaunch]] `INFERRED`
- [[ManagedLaunch]] `INFERRED`
- [[SessionLiveness]] `INFERRED`
- [[SqlHost]] `INFERRED`
- [[_PendingPolicyAskWrites]] `INFERRED`
- [[Sessions namespace — create, snapshot, post events, interrupt, stream.  Target]] `INFERRED`
- [[_RunnerForwardResult]] `INFERRED`
- [[_MirroredToolCall]] `INFERRED`
- [[_RelayHandle]] `INFERRED`
- [[_HostLaunchAttempt]] `INFERRED`
- [[_NativeTerminalEnsureOutcome]] `INFERRED`
- [[_SessionEventDispatchResult]] `INFERRED`
- [[Convert a validated Codex collaboration mode kind to the UI-facing flag.]] `INFERRED`
- [[Publish the live collaboration-mode for a session.      :param session_id: Ses]] `INFERRED`
- [[Whether a claude-native PermissionRequest may offer / honor the     "Accept & a]] `INFERRED`
- [[Whether a claude-native PermissionRequest may offer / honor the     persistent]] `INFERRED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*