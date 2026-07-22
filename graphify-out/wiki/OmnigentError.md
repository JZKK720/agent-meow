# OmnigentError

> God node · 3425 connections · [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_errors.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_errors.py#L10)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as OmnigentError
    participant P1 as ToolManager
    participant P2 as ErrorCode
    participant P3 as ProviderEntry
    participant P4 as ResolvedSpec
    participant P5 as RunnerRouter
    participant P6 as Shared test helpers across tests/inner/, tests/e2e/, etc.
    participant P7 as TurnContext
    participant P8 as HarnessApp
    participant P9 as SessionLiveness
    participant P10 as PolicyVerdictPayload
    participant P11 as ApprovalEvent
    participant P12 as _PendingPolicyAskWrites
    participant P13 as Sessions namespace — create, snapshot, post events, interrupt, stream.  Target
    participant P14 as _RunnerForwardResult
    participant P15 as _MirroredToolCall
    participant P16 as _RelayHandle
    participant P17 as _HostLaunchAttempt
    participant P18 as _NativeTerminalEnsureOutcome
    participant P19 as _SessionEventDispatchResult
    participant P20 as Convert a validated Codex collaboration mode kind to the UI-facing flag.
    participant P21 as Publish the live collaboration-mode for a session.      :param session_id: Ses
    participant P22 as Whether a claude-native PermissionRequest may offer / honor the     \"Accept & a
    participant P23 as Whether a claude-native PermissionRequest may offer / honor the     persistent
    participant P24 as Derive the domain host that a WebFetch \"don't ask again\" rule should     scope
    participant P25 as Read the caller's read-state for one session, for embedding in the     per-user
    participant P26 as Set the caller's read-state for one session.      :param user_id: Authenticate
    participant P27 as Drop a session's read-state from every user's caches.      Called when a sessi
    participant P28 as Map an (optional) user id to the :mod:user_session_stream channel key.
    participant P29 as Push a session_added discovery event to a user's updates streams.      Cal
    participant P30 as Tool identity of a forwarder-mirrored function_call.      Cached by call
    participant P31 as Policy writes deferred until a relay-path tool-call ASK is approved.      The
    participant P32 as Return the lock serializing native ASK gates for one (session, policy).      C
    participant P33 as Active SSE relay task plus the runner it streams from.      :param runner_id:
    participant P34 as Resolve once Starlette reports the client closed the connection.      Long-pol
    participant P35 as Build a safe Content-Disposition: attachment header value.      The filena
    participant P36 as Convert a :class:StoredFile to a session file resource dict.      Matches th
    participant P37 as Publish an SSE event and persist it as a conversation item.      Emits the eve
    participant P38 as Build a structured AskUserQuestion payload for the elicitation     params extra
    participant P39 as Publish one harness-originated elicitation and wait for web verdict.      Mirr
    participant P40 as Canonicalize a tool input for terminal-resolved correlation.      The park sid
    participant P41 as Resolve the parked prompt a mirrored tool result belongs to,     ending its lon
    participant P42 as Clear one elicitation's approval card after the re-park grace, unless     a hoo
    participant P43 as Validate the hook client's optional re-attach elicitation id.      The hook mi
    participant P44 as Consume a resolution that arrived before the hook wait registered.      :param
    participant P45 as Prune stale or excess pre-resolved harness elicitation tombstones.      :param
    participant P46 as Resolve or pre-resolve one parked harness elicitation by id.      :param sessi
    participant P47 as Format an SSE event string for the wire.      :param event_type: SSE event nam
    participant P48 as Derive a user's permission level from a pre-fetched list of grants.      Mirro
    participant P49 as Find the session owner from a pre-fetched list of grants.      Mirrors :func:
    participant P50 as Map the relay-fed status cache value to a list-item status.      The cache sto
    participant P51 as Map a session's cached status plus direct child activity to list status.
    participant P52 as The two honest liveness signals for a single session.      Returned (keyed by
    participant P53 as Assemble one :class:SessionListItem from a conversation row and     pre-fetch
    participant P54 as Attach runner + host liveness to session-list items when a lookup is     wired.
    participant P55 as Return an elicitation event annotated with its resolution target.      Child-s
    participant P56 as Return ancestor session ids for a session, nearest parent first.      :param c
    participant P57 as Mirror a child elicitation request into each ancestor stream.      :param conv
    participant P58 as Mirror an elicitation-resolved event into each ancestor stream.      :param co
    participant P59 as Re-publish each ancestor's subtree-summed cost after a child usage update.
    participant P60 as Return descendant sub-agent conversations for a session.      :param conv_stor
    participant P61 as Return pending elicitation events visible from a session snapshot.      The cu
    participant P62 as Build a :class:SessionResponse from store-side entities.      status is
    participant P63 as Publish a session.input.consumed event for a just-persisted     conversatio
    participant P64 as Publish the standard compaction progress event to a session stream.      :para
    participant P65 as Publish the compaction-finished event to a session stream.      Emitted after
    participant P66 as Publish the compaction-failed event to a session stream.      Emitted when :fu
    participant P67 as Broadcast an assistant message appended outside the task runtime.      Termina
    participant P68 as Resolve the LLM model identifier from a conversation's agent spec.      Uses t
    participant P69 as Resolve the canonical harness for a conversation's bound agent.      Mirrors :
    participant P70 as Validate + canonicalize a session-create harness_override.      Mirrors th
    participant P71 as Convert a Unix epoch timestamp to its UTC calendar day.      :param epoch_seco
    participant P72 as Add a turn's LLM cost to the session owner's daily rollup.      A no-op when *
    participant P73 as Extract total_cost_usd for client display, or None when unpriced.
    participant P74 as Get-or-create the per-model usage sub-bucket inside usage[\"by_model\"].
    participant P75 as Add one turn's per-model token/cost deltas into a model bucket (ADD).      Mir
    participant P76 as Project the nested by_model usage map into typed :class:ModelUsage.
    participant P77 as Increment the session's cumulative token counters from a     response.complet
    participant P78 as Persist cumulative cost / token usage reported by a native harness.      Unlik
    participant P79 as Read and validate an optional cumulative usage field from event data.      :pa
    participant P80 as Persist and broadcast a token-usage update from a terminal-backed runtime.
    participant P81 as Persist and broadcast a model switch made inside the terminal.      Mirrors a
    participant P82 as Validate a terminal-observed reasoning-effort payload.      :param body: Exter
    participant P83 as Persist and broadcast a reasoning-effort switch made inside the terminal.
    participant P84 as Persist Codex's collaboration mode kind as an internal session label.      :pa
    participant P85 as Append a [System: ...] transcript note recording a model switch.      Reco
    participant P86 as Cache and broadcast a todo-list update from the claude-native forwarder.
    participant P87 as Broadcast a terminal-observed conversation item.      User messages use sess
    participant P88 as Broadcast a terminal-observed assistant text delta.      Terminal-backed integ
    participant P89 as Broadcast a terminal-observed reasoning (chain-of-thought) delta.      The rea
    participant P90 as Universal \"approval done\" signal — single publish drives both     sidebar (via
    participant P91 as Forward an approval verdict to the session's bound runner.      Runner-side el
    participant P92 as Resolve one outstanding elicitation from an approval payload.      Shared by t
    participant P93 as Ask the bound runner to pop a native-terminal modal for a parked ASK.      Fir
    participant P94 as Ask the bound runner to pop an INFORMATIONAL hard-block notice on the pane.
    participant P95 as Hold a server-side ASK gate until a human resolves it.      Publishes a resp
    participant P96 as Validate and unpack an external assistant-message event.      :param body: P
    participant P97 as Persist and broadcast assistant text produced outside agent-meow tasks.      T
    participant P98 as Validate and unpack an external conversation-item event.      :param body: P
    participant P99 as Look up an existing claude-native sub-agent child by its Claude-     side sub
    participant P100 as Look up an existing sub-agent child by its exact title.      Recovery path for
    participant P101 as Emit session.created on the parent's stream for a child session.      Clie
    participant P102 as Mint a child :class:Conversation row for a claude-native     sub-agent and em
    participant P103 as Look up an existing Codex-native sub-agent child by its Codex thread id.
    participant P104 as Return the UI-facing label for a Codex child session.      Uses the Codex-assi
    participant P105 as Return whether a child conversation tracks a Codex internal sub-agent.      :p
    participant P106 as Collapse a sub-agent's background-task waiting back to idle.      A cl
    participant P107 as Build the label dict for a Codex-native sub-agent child row.      :param threa
    participant P108 as Create a new Codex child Conversation row and publish session.created.
    participant P109 as Mint or update a child Conversation for a Codex AgentControl sub-agent.      I
    participant P110 as Persist and broadcast a conversation item produced outside AP.      This is th
    participant P111 as Return whether a conversation is backed by the native Kiro terminal.
    participant P112 as Persist a Kiro web input that never appeared in Kiro's JSONL transcript.
    participant P113 as Prepend a pending entry's file blocks onto a user-message item.      The claud
    participant P114 as Extract joined text from message content blocks.      :param content: Message
    participant P115 as Return the latest persisted assistant message text for a session.      Native
    participant P116 as Attach a native sub-agent's durable assistant text to an idle status edge.
    participant P117 as HTTP result from forwarding a session-control event to the runner.      :param
    participant P118 as Fail loudly when required external status forwarding does not land.      Termi
    participant P119 as Re-deliver a sub-agent terminal status through the parent's live runner.
    participant P120 as Fail when a live Codex Plan-mode switch was not applied by the runner.      Co
    participant P121 as Feed a mirrored tool item into the terminal-resolved fast path.      A funct
    participant P122 as Publish a typed :class:SessionStatusEvent to the live stream and     update t
    participant P123 as Truncate a label value to fit the conversation_labels.value column.      L
    participant P124 as Persist or clear the reload-visible failure detail for a session status.
    participant P125 as Project runner-owned failure labels into the typed API error shape.      Termi
    participant P126 as Clear a stale failed session status after runner recovery.      Native termina
    participant P127 as Publish a typed :class:SessionTerminalPendingEvent and update the     cache t
    participant P128 as Publish a typed :class:SessionSandboxStatusEvent and update the     cache the
    participant P129 as Publish a typed :class:SessionSkillsEvent to the live stream.      Fired the
    participant P130 as Publish a typed :class:SessionModelOptionsEvent to the live stream.      Fir
    participant P131 as Drop runner-derived session snapshot overlays for one session.      These fiel
    participant P132 as Publish a coarse filesystem-change invalidation to the live stream.      The e
    participant P133 as Publish a session.interrupted event to the live stream.      The event is
    participant P134 as Publish a session.superseded event to the live stream.      Emitted when a
    participant P135 as Get an HTTP client for the runner bound to a session.      Uses the RunnerRo
    participant P136 as Wait until a runner connects, then resolve the session's runner client.      T
    participant P137 as Validate a session's workspace against the agent's os_env boundary.      Wraps
    participant P138 as Outcome of a relaunch host.launch_runner round-trip.      :param runner_id
    participant P139 as Ask a host to spawn a runner for a session and capture the result.      Genera
    participant P140 as Cancel and await every in-flight background managed launch.      Lifespan-tear
    participant P141 as Provision a managed sandbox for a session in the background.      The host_t
    participant P142 as Run the provision phase of a background managed launch.      Dispatches to :fu
    participant P143 as Bind a provisioned managed host to its session and launch a runner.      The b
    participant P144 as Block until a managed launch settles, raising its failure.      The rendezvous
    participant P145 as Relaunch a dead managed sandbox for a session, if it has one.      Called from
    participant P146 as Register and spawn the background relaunch for a dead sandbox.      Recovers t
    participant P147 as Register and spawn the background WAKE for a dormant resumable host.      Unli
    participant P148 as Wake a dormant resumable managed host in the background, settling the     track
    participant P149 as Drive — and wait for — the runner's session-init handshake.      Posts POST
    participant P150 as Return the authoritative runner client for session resources.      Requires th
    participant P151 as Proxy GET /resources to the runner with strict validation.      :param run
    participant P152 as Best-effort reset of the session's runner-side state after a switch.      Run
    participant P153 as Resolve native terminal metadata for a session, by wrapper label OR harness.
    participant P154 as Return whether a session's turns are driven by a native terminal harness.
    participant P155 as Return native terminal runtime strings for a native-harness session.      Reso
    participant P156 as Return the runner terminal resource name for a native harness.      :param har
    participant P157 as Convert a failed runner terminal-ensure response into durable error data.
    participant P158 as Convert runner transport failure during native terminal ensure.      The messa
    participant P159 as Result of a native terminal readiness probe.      :param error: Error data whe
    participant P160 as Ask the runner to create or return the native terminal for a message.      The
    participant P161 as Extract a non-fatal policy-disabled notice from a 2xx ensure response.      Th
    participant P162 as Publish a live response.error event for a persisted error item.      :para
    participant P163 as Persist a consumed user message and terminal-start error.      Used when a nat
    participant P164 as Persist a consumed user message and a host-launch failure error.      Used whe
    participant P165 as Wake the parent runner when a native sub-agent fails to boot its terminal.
    participant P166 as Persist + publish a non-fatal \"policy not enforced\" banner.      The runner re
    participant P167 as Build the runner event that delivers a web message to a native TUI.      :para
    participant P168 as Forward one agent-meow web-chat message to the native terminal harness.      T
    participant P169 as Return a harness failure message from a runner SSE response.      Runner POS
    participant P170 as Best-effort POST a control event to the bound runner.      Used for control in
    participant P171 as Forward a stop_session request to the bound runner, surfacing     failures
    participant P172 as Terminate the host-launched runner backing a host-spawned session.      \"Stop
    participant P173 as Construct a :class:NewConversationItem from a POSTed event.      Validates t
    participant P174 as Validate and unpack a structured skill slash-command event.      The REPL post
    participant P175 as Build the user-message shape used for input policy evaluation.      Skill comm
    participant P176 as Resolve a skill's hidden <skill> meta text on the bound runner.      Skill
    participant P177 as Persist a skill slash command and forward hidden skill context.      Skill con
    participant P178 as Extract title candidate content blocks from a session item.      Only user m
    participant P179 as Set an untitled conversation's title from message content blocks.      No-op w
    participant P180 as Set an untitled session's title from a user message.      The app UI creates s
    participant P181 as Persist a user event without forwarding to a runner.      Used when the runner
    participant P182 as Extract plain text from a user message event for the routing judge.      Conca
    participant P183 as Persist and publish a routing_decision transcript chip.      Called by the
    participant P184 as Persist a user event and forward it to the runner.      The server persists th
    participant P185 as Outcome of forwarding one item-event to the runner.      :param item_id: Store
    participant P186 as Forward an item-event to the runner with harness-aware dispatch.      Callers
    participant P187 as Extract a persistable conversation item from a runner SSE event.      Returns
    participant P188 as Build a resource_event conversation item from a runner SSE event.      The
    participant P189 as Build a routing_decision conversation item from a runner SSE event.      T
    participant P190 as Build a durable error item from a runner error SSE event.      The web UI
    participant P191 as Persist a runner error item unless the same error already exists.      Native
    participant P192 as Persist a single conversation item from the relay.      :param conversation_st
    participant P193 as Persist buffered assistant text as a message item and clear the buffer.      S
    participant P194 as Subscribe to the runner's SSE stream and relay events locally.      Long-lived
    participant P195 as Start (or replace) the SSE relay for session_id.      No-op when a healthy
    participant P196 as Start the runner SSE relay and wait for its subscription ack.      The runner
    participant P197 as Run explicit compaction while holding the per-session compact lock.      :para
    participant P198 as Return the provider family of an agent's harness, or None.      Loads the
    participant P199 as Return whether two agents share a (known) provider family.      False when
    participant P200 as Return an agent's canonical harness id, or None when unloadable.      Used
    participant P201 as Return whether an agent runs a native CLI harness.      Loads the agent's spec
    participant P202 as Return whether *agent*'s native harness rebuilds a fork's transcript.      cla
    participant P203 as Return whether *agent*'s native harness carries FORK history via preamble.
    participant P204 as Return native coding-agent metadata for an agent's harness.      :param agent:
    participant P205 as Return the Web UI presentation labels for an agent's harness.      A native-CL
    participant P206 as Publish an elicitation request event on the session stream.      Approval stat
    participant P207 as Apply (or drop) policy writes stashed for a relay tool-call ASK.      Called w
    participant P208 as Build the actor dict for :class:EvaluationContext.      Returns {\"run_
    participant P209 as Build an :class:EvaluationContext from a proto-style event dict.      Maps t
    participant P210 as Evaluate a tool call against TOOL_CALL phase policy rules.      Pure evaluatio
    participant P211 as Extract concatenated text from a user message event body.      Mirrors the log
    participant P212 as Publish the [Denied by policy: ...] sentinel on the session stream.      T
    participant P213 as Publish a terminal response.completed for an INPUT-phase DENY.      The sh
    participant P214 as Persist the [Denied by policy: ...] sentinel as assistant history.      IN
    participant P215 as Evaluate a user message against REQUEST (input) phase policy rules.      Does
    participant P216 as Extract concatenated text from an assistant message event.      Mirrors :func:
    participant P217 as Return a copy of the message body with all text content     blocks replaced by
    participant P218 as Evaluate an assistant message against OUTPUT phase policies.      Pure evaluat
    participant P219 as Stash the runner router for the native-terminal approval popup.      Called on
    participant P220 as Deliver a parent-wake notice when a sub-agent blocks on an approval.      Post
    participant P221 as Install the parent-wake notifier on the elicitation publish path.      Wires :
    participant P222 as Yield SSE-formatted events from the conversation's live stream.      Events ar
    participant P223 as Validate per-session native-terminal pass-through args.      Enforces a flat l
    participant P224 as Validate a caller-supplied per-session cost-control switch.      :param value:
    participant P225 as Parse the JSON metadata part from bundled session creation.      :param metada
    participant P226 as Build a FastAPI-style missing multipart field error.      :param field: Missin
    participant P227 as Resolve the live host connection for a worktree operation.      :param host_id
    participant P228 as Create a git worktree on the host for a new session branch.      Validates the
    participant P229 as Best-effort removal of a session's git worktree.      Used for create-rollback
    participant P230 as Load the parent bundle and resolve a child sub-agent's trusted spec.      This
    participant P231 as Return the canonical harness identifier for a resolved spec.      :param spec:
    participant P232 as Return whether an executor.config flag is explicitly set false.      The s
    participant P233 as Derive native-terminal YOLO pass-through args from a trusted sub-spec.      po
    participant P234 as Resolve terminal-first wrapper labels from an already-loaded sub-spec.      :p
    participant P235 as Resolve the terminal-first wrapper labels for a native-harness sub-agent.
    participant P236 as Reject a session-create body that seeds policy-owned labels.      cost_contr
    participant P237 as Authorize a label write touching the policy-owned cost_control.* keys.
    participant P238 as Create a session bound to an already-registered agent.      This preserves the
    participant P239 as Validate, store, and persist a bundled session request.      Each upload creat
    participant P240 as Persist database rows for a bundle already written to artifacts.      :param c
    participant P241 as Delete an uploaded bundle after database creation fails.      Cleanup failures
    participant P242 as Authorize a bundled create's parent link and resolve runner affinity.      The
    participant P243 as Notify the inherited runner that a bundled child session exists.      Lets the
    participant P244 as Validate a runner id from PATCH /v1/sessions/{id}.      When user_id i
    participant P245 as Return a single-line text preview from newest-first message items.      Powers
    participant P246 as Build a :class:ChildSessionSummary from a child conversation.      Parses th
    participant P247 as Build child summaries with one batched message-preview lookup.      ChildSes
    participant P248 as Wrap a plain-text tool result in a JSON-RPC 2.0 MCP tools/call response.
    participant P249 as Server-side handler for sys_advise_models MCP tool calls.      Intercepts
    participant P250 as Wrap *result* in a JSON-RPC 2.0 success response.      :param rpc_id: The JSON
    participant P251 as Wrap an error in a JSON-RPC 2.0 error response.      :param rpc_id: The JSON-R
    participant P252 as Return an MCP InputRequiredResult asking the runner to collect     user app
    participant P253 as Handle a tools/list JSON-RPC request for the MCP proxy endpoint.      Dele
    participant P254 as Handle a tools/call JSON-RPC request for the MCP proxy endpoint.      Step
    participant P255 as Read an uploaded file into memory, aborting if it exceeds *limit_bytes*.
    participant P256 as Factory that builds the sessions router.      Stores are closed over rather th
    participant P257 as Fetch a session's merged skills from its bound runner.      Skills are runner-
    participant P258 as Background single-flight fetch of a session's runner-owned skills.      Popula
    participant P259 as Validate runner-returned raw Codex model/list data.      :param raw_models
    participant P260 as Resolve the Web UI model-picker options for a native session.      Two shapes:
    participant P261 as Background single-flight fetch of a session's native model catalog.      :para
    participant P262 as Read a full session snapshot from the store.      Centralizes the create/get r
    participant P263 as # NOTE: external conversation items are persisted with a random
    participant P264 as # NOTE: this does NOT defeat the Databricks Apps ingress'
    participant P265 as RoutedRunner
    participant P266 as Databricks Apps entry point for omnigent.  Starts omnigent with Lakebase (mana
    participant P267 as _FakeRunnerClient
    participant P268 as Pack *bundle_dir* into a deterministic gzipped tarball.      Identical directo
    participant P269 as TurnDispatch
    participant P270 as FamilyConfig
    participant P271 as Lazy factory for ListFilesTool.      :param config: Tool config (unused).
    participant P272 as OpenAICompatibleAdapter
    participant P273 as _PiNativeLaunchConfig
    participant P274 as _ContextWindowOverflow
    participant P275 as _SubagentDeliveryAck
    participant P276 as _BodyRequest
    participant P277 as _CodexNativeModelOptionsNotReady
    participant P278 as _CodexNativeLaunchConfig
    participant P279 as _KiroNativeLaunchConfig
    participant P280 as _OpenCodeNativeLaunchConfig
    participant P281 as _SubagentWorkEntry
    participant P282 as _ChildParentMeta
    participant P283 as _SessionSnapshot
    participant P284 as _ConversationStore
    participant P285 as Whether *server_version* can serialize session.status: \"waiting\".      :pa
    participant P286 as Resolve the server's version via a one-time GET /api/version probe.      M
    participant P287 as Log *exc* in full and return a generic detail string safe for clients.      Ra
    participant P288 as Return the runner-process LLM client, creating it on first use.      The clien
    participant P289 as Advertise a launched terminal's tmux target to a bridge directory.      Called
    participant P290 as Raised when Codex model options are requested before bridge startup.
    participant P291 as Register a session's transcript-forwarder task in the keyed registry.      Kee
    participant P292 as Explain why a terminal resource lookup returned None.      Used only for r
    participant P293 as Log a throttled terminal lookup miss diagnostic.      Claude/Codex wrapper cli
    participant P294 as Persisted launch config needed for runner-owned Codex terminal setup.      :pa
    participant P295 as Persisted launch config read from a session snapshot for native terminals.
    participant P296 as Persisted launch config needed for runner-owned Kiro terminal setup.
    participant P297 as Return a required runner environment variable.      :param name: Environment v
    participant P298 as Resolve the cwd for a runner-owned Codex terminal.      Mirrors :func:_auto_c
    participant P299 as Resolve the cwd for a runner-owned Pi terminal.      :param session_workspace:
    participant P300 as Resolve the cwd for a runner-owned Kiro terminal.
    participant P301 as Fetch and validate persisted Kiro launch config for a session.
    participant P302 as Fetch and validate a session's persisted native-terminal launch config.      S
    participant P303 as Fetch and validate persisted Codex launch config for a session.      :param se
    participant P304 as Persisted launch config for runner-owned OpenCode terminals.      :param works
    participant P305 as Fetch and validate persisted OpenCode launch config for a session.      :param
    participant P306 as Auto-create an OpenCode terminal for an opencode-native session.      Mirrors
    participant P307 as Run the OpenCode SSE forwarder, closing the server when it ends.      Mirrors
    participant P308 as Build the policy evaluator the OpenCode permission forwarder consults.      Mi
    participant P309 as Resolve the OpenCode default model from a resolved agent spec.      :param age
    participant P310 as Resolve the (provider_id, model_id) for an opencode /summarize.      o
    participant P311 as Resolve the Databricks profile from a resolved agent spec, if any.      :param
    participant P312 as Return the resolved agent spec's MCP server declarations (or empty).      :par
    participant P313 as Render committed agent-meow message items into a plain-text transcript.      U
    participant P314 as Seed a fresh opencode session with prior context (text-prefix replay).      op
    participant P315 as Return whether user Pi args already specify session behavior.      :param args
    participant P316 as Return whether user Pi args already pin a provider/model/key.      When the us
    participant P317 as Build Pi CLI args for a runner-owned native TUI session.      :param terminal_
    participant P318 as Ensure Pi has a local session JSONL and return the id to launch with.      Thr
    participant P319 as Auto-create a Pi terminal for a pi-native session.      :param session_id: Ses
    participant P320 as Auto-create the Cursor TUI terminal for a cursor-native session.      Launches
    participant P321 as Auto-create the Goose TUI terminal for a goose-native session.      Launches 
    participant P322 as Auto-create the Hermes TUI terminal for a hermes-native session.      Launches
    participant P323 as Auto-create the Kiro TUI terminal for a kiro-native session.
    participant P324 as Record the qwen session id on the agent-meow session as external_session_id.
    participant P325 as Synthesize a qwen chat recording for a forked clone from its agent-meow items.
    participant P326 as Auto-create the qwen TUI terminal for a qwen-native session.      Launches the
    participant P327 as Auto-create the Kimi TUI terminal for a kimi-native session.      Launches k
    participant P328 as Auto-create a Codex terminal for a codex-native session.      Called when the
    participant P329 as Adopt the fresh Codex TUI's thread, then mirror it into the agent-meow session.
    participant P330 as Forward a runner-owned Codex terminal that resumes an existing thread.      :p
    participant P331 as Run the agy RPC streaming reader + interaction bridge for one session.      Th
    participant P332 as Auto-create the native Antigravity (agy) terminal for a session.      Called w
    participant P333 as Mint a placeholder agy conversation id for a fresh runner launch.      agy min
    participant P334 as Sleep between agy cold-start port-discovery polls.      Indirection point so t
    participant P335 as Cold-start agy's conversation over connect-RPC and own its id (best-effort).
    participant P336 as Return a launched terminal's tmux socket + target when locally reachable.
    participant P337 as Fetch a session snapshot for Codex host-spawn detection.      :param server_cl
    participant P338 as Read the session's per-session Cost Optimized toggle, defensively.      Fetche
    participant P339 as Whether the runner must auto-create the Codex terminal for a session.      The
    participant P340 as Read the Codex model default from a resolved agent spec.      :param agent_spe
    participant P341 as Read the cursor-agent model id to launch the native TUI with, from a spec.
    participant P342 as Read the Pi model id to launch the native TUI with, from a spec.      Reads th
    participant P343 as Return [\"--resume\", chat_id] for a cursor-native cold resume, or [].
    participant P344 as Join the text of a session message item's content blocks.      :param content:
    participant P345 as Render copied fork items as a readable conversation transcript.      cursor's
    participant P346 as Read the agent's os_env from a resolved agent spec.      The auto-created
    participant P347 as Return whether an existing codex/main terminal is the native TUI.      A g
    participant P348 as Return whether an existing antigravity/main terminal is the agy TUI.
    participant P349 as Assemble the base claude CLI args for a native-terminal launch.      These
    participant P350 as Publish a terminal spin-up status event onto the session stream.      Emitted
    participant P351 as Build the structured error payload for a native terminal start failure.      :
    participant P352 as Publish live failure events for a native terminal start failure.      The runn
    participant P353 as Return a structured JSON error for native terminal ensure failures.      :para
    participant P354 as Build the codex terminal-ensure 200 response with a one-shot notice.      When
    participant P355 as Link the build-agent-meow skill into a bundle's skills/ dir.      Call
    participant P356 as Auto-create a Claude Code terminal for a claude-native session.      Called wh
    participant P357 as Auto-create an agent-meow REPL terminal for a runner-hosted SDK session.
    participant P358 as Remove any native-harness bridge dirs left behind by a session.      Each nati
    participant P359 as Resolve the bridge id label for a Claude-native session.      :param server_cl
    participant P360 as Return whether a claude-native session is pending a post-switch rebuild.
    participant P361 as Return whether a live Claude terminal will be transferred into a session.
    participant P362 as Return whether a live agy terminal will be transferred into a session.      Th
    participant P363 as Fetch session labels for harness spawn-env construction.      :param server_cl
    participant P364 as Re-encode an SSE event as a single data: frame.
    participant P365 as Proxy a policy evaluation request from the harness to the agent-meow server.
    participant P366 as Safely relay a non-streaming harness response through FastAPI.      Starlette'
    participant P367 as Return a short response-body preview for diagnostics.      Some runner tests u
    participant P368 as Return the bundle workdir for a possibly wrapped spec entry.
    participant P369 as Return whether *tool_name* is a spec-declared native python tool.
    participant P370 as One GET /v1/sessions/{id} projected for all runner readers.      The singl
    participant P371 as Return whether *path* is a filesystem path rather than a dotted import.      F
    participant P372 as Runner-side dispatch context for a single turn.      Carries metadata the runn
    participant P373 as Merge the advisor note into the turn's user message, copy-on-write.      The n
    participant P374 as Apply a cost-advisor turn result to the harness request body in place.      Op
    participant P375 as Adapt a CreateResponseRequest-shaped body into a     :class:MessageEvent
    participant P376 as Raised by the proxy_stream when the harness reports a context-window overflow.
    participant P377 as Check if a response.failed SSE event indicates a context-window overflow.
    participant P378 as Encode one response.failed SSE frame.      Keep a top-level error mirr
    participant P379 as Resolve server-uploaded file_id blocks inside the runner.      Remote agen
    participant P380 as Append *mcp_schemas* to event_body[\"tools\"] in place.      Preserves any e
    participant P381 as Extract a tool's function name from its OpenAI-format schema.      :param sche
    participant P382 as Append request-supplied client-side tools to the spec tool schemas.      The r
    participant P383 as Decide whether the runner dispatches *tool_name* locally vs. relays it.      C
    participant P384 as Runner-local state for one asynchronous sys_session_send dispatch.      :p
    participant P385 as Result of attempting to deliver a terminal sub-agent payload.      :param entr
    participant P386 as Register one running sub-agent dispatch.      Re-registering the same child re
    participant P387 as Return registered sub-agent work by child session id.      :param child_sessio
    participant P388 as Promote a sub-agent dispatch from launch bookkeeping to real execution.      
    participant P389 as Remove sub-agent work tracking for a child session.      Used when the child-m
    participant P390 as Remove sub-agent work associated with a deleted session.      A deleted sessio
    participant P391 as List sub-agent work registered by a parent session.      :param parent_session
    participant P392 as Mark a sub-agent dispatch terminal and notify the parent inbox.      :param ch
    participant P393 as Push a terminal sub-agent payload into the parent session inbox.      :param e
    participant P394 as Sleep between sub-agent wake-POST retries.      Indirection point so tests can
    participant P395 as Return whether a failed wake POST should be retried.      Transport-level fail
    participant P396 as POST a sub-agent wake notice with a bounded retry on transient failure.      h
    participant P397 as Build a 503 response when a known sub-agent result was not delivered.      Top
    participant P398 as Build the framework notice that wakes a parent after a child finishes.      :p
    participant P399 as Fan-out metadata for one child sub-agent session.      Lets the runner mirror
    participant P400 as Record a child→parent mapping for SSE status/preview fan-out.      :param chil
    participant P401 as Drop a child→parent mapping when the child session ends.      :param child_ses
    participant P402 as Map a session.status value to a child summary current_task_status.
    participant P403 as Coerce a turn-failure error dict into a {code, message} shape.      Th
    participant P404 as Truncate a child message preview to the cap with an ellipsis.      Matches the
    participant P405 as Register an active timer task for a session.      :param session_id: Session t
    participant P406 as Remove a timer from the registry on completion or cancel.      :param session_
    participant P407 as Cancel a timer by ID.      :param session_id: Session the timer belongs to.
    participant P408 as Return the durable agent_id for a session.      :param session_id: Session/con
    participant P409 as Minimal stand-in for a Starlette Request exposing only json().      Le
    participant P410 as Build a fresh runner FastAPI app.      :param process_manager: Pre-started Har
    participant P411 as Lightweight uvicorn --factory entry point for transport subprocesses.
    participant P412 as Resolve harness type + spawn-env from the agent spec.      :param agent_id: Ag
    participant P413 as Build spawn-env from spec — mirrors workflow.py's helpers.      :param spec: T
    participant P414 as Evaluate __agent_start through the spec's policy gate.      Constructs a :
    participant P415 as Apply sandbox override from a policy verdict's data field.      The enfo
    participant P416 as _FakeRunnerRouter
    participant P417 as GeminiAdapter
    participant P418 as OpenAIAdapter
    participant P419 as RoutedModel
    participant P420 as _FakeProcessManager
    participant P421 as _CredentialSourceModel
    participant P422 as _CredentialProxyItemModel
    participant P423 as _ConfigYamlLoader
    participant P424 as Copy a spec source into *dest* as a uniform bundle directory.      Agent-plane
    participant P425 as Parse an agent image directory into an AgentSpec.
    participant P426 as SafeLoader variant that does NOT treat on/off/     yes/no as bo
    participant P427 as Parse an agent image directory into an :class:AgentSpec.      :param root: P
    participant P428 as Parse the llm: block from config.yaml into an     :class:LLMConfig.
    participant P429 as Parse the interaction: block from config.yaml into an     :class:Interacti
    participant P430 as Parse the tools: block from config.yaml into a     :class:ToolsConfig.
    participant P431 as Parse the tools.sandbox block from config.yaml.      Accepted settings: 
    participant P432 as Parse the tools.builtins list into     :class:BuiltinToolConfig objects.
    participant P433 as Parse a retry: block into a :class:RetryPolicy.      Returns defaults wh
    participant P434 as Parse the executor: block into an :class:ExecutorSpec.      Returns defa
    participant P435 as Parse the executor.auth: block into a typed auth dataclass.      Returns 
    participant P436 as Parse the top-level os_env: block into an :class:OSEnvSpec.      Native
    participant P437 as Parse the top-level terminals: block into a map of     :class:TerminalEnvS
    participant P438 as Parse the os_env.sandbox: block into an     :class:OSEnvSandboxSpec.
    participant P439 as Parse and validate the cwd_allow_hidden: field of     os_env.sandbox.
    participant P440 as Parse os_env.sandbox.cwd_hidden_scan_max_entries.      Falls back to the d
    participant P441 as Parse os_env.sandbox.cwd_hidden_scan_overflow.      Falls back to the data
    participant P442 as Parse and validate the env_passthrough: field of     os_env.sandbox.
    participant P443 as Parse and validate the egress_rules: field of     os_env.sandbox.
    participant P444 as Pydantic boundary model for a credential_proxy[*].source mapping.      The
    participant P445 as Convert this validated model into a :class:CredentialSourceSpec.          :r
    participant P446 as Pydantic boundary model for one raw credential_proxy entry.      Validates
    participant P447 as Render a pydantic ValidationError as one compact line.      The credential
    participant P448 as Parse and validate the credential_proxy: field of os_env.sandbox.
    participant P449 as Explain why a credential_proxy cannot work under darwin_seatbelt.
    participant P450 as Normalize an https_bearer entry into per-host Bearer bindings.      The de
    participant P451 as Normalize an https_basic entry into per-host Basic bindings.      Like h
    participant P452 as Normalize a git_https entry into per-host Basic bindings.      Git over HT
    participant P453 as Normalize a gh_basic entry into git + API credential bindings.      The gi
    participant P454 as Resolve a validated entry's target / targets into bound hosts.      Ca
    participant P455 as Parse one host or host/path target into a validated host.      :param
    participant P456 as Parse the compaction: block from config.yaml into a     :class:CompactionC
    participant P457 as Read a bundle-relative file named by *value*, only if it stays in *root*.
    participant P458 as Resolve the instructions for an agent image.      - If instructions is set
    participant P459 as Parse the top-level YAML agent_session_sharing: field into a     :class:Sh
    participant P460 as Parse the top-level YAML skills: field into a host-skill     filter string
    participant P461 as Discover host-scope skills from .claude/skills/ and     .agents/skills/
    participant P462 as Discover and parse all skills under the skills/ directory.      Each subdi
    participant P463 as Return whether a YAML frontmatter flag reads as boolean false.      Accept
    participant P464 as Parse a single SKILL.md file into a :class:SkillSpec.      The file must
    participant P465 as Expand ${VAR} and $VAR references in dict values     against the curren
    participant P466 as Raise if *value* contains unresolved environment variable     references.
    participant P467 as Extract inline type: mcp entries from the top-level     tools: block of
    participant P468 as Discover and parse all MCP server configs under     tools/mcp/.      Each
    participant P469 as Parse an HTTP (SSE) MCP server YAML into an :class:MCPServerConfig.      HTT
    participant P470 as Parse a stdio MCP server YAML into an :class:MCPServerConfig.      Stdio tra
    participant P471 as Fail loud if an MCP YAML mixes fields from the wrong transport.      E.g. tr
    participant P472 as Discover local tool files under tools/python/ and     tools/typescript/
    participant P473 as Recursively discover and parse sub-agents under agents/.      Each subdire
    participant P474 as Parse the guardrails: block into a :class:GuardrailsSpec.      Returns 
    participant P475 as Validate and coerce the spec-wide ask_timeout value.      Accepts an integ
    participant P476 as Parse the guardrails.labels: block into a dict of     :class:LabelDef by
    participant P477 as Parse one label definition entry.      :param key: The label key, used in erro
    participant P478 as Coerce an initial: value to str | None.
    participant P479 as Coerce a values: list to list[str] or None.      :param key: Label
    participant P480 as Enforce cross-field constraints on a :class:LabelDef.      Per POLICIES.md §
    participant P481 as Parse the guardrails.policies: block.      YAML uses a mapping keyed by po
    participant P482 as Parse one policy's YAML block into the appropriate     :class:PolicySpec subc
    participant P483 as Parse the fields every policy type shares.      Factored out of _parse_polic
    participant P484 as Parse a type: function policy block.      :param name: Enclosing policy na
    participant P485 as Parse a policy's on: list into :class:PhaseSelector     entries.      Y
    participant P486 as Parse one entry of a policy's on: list.      Handles both forms: bare \"<
    participant P487 as Resolve a phase-string into a :class:Phase enum.      :param phase_str: The
    participant P488 as Parse a policy's condition: label-gate.      Values are coerced to strings
    participant P489 as Parse a policy's set_labels: whitelist (list form —     used on PromptPolic
    participant P490 as Parse a function: YAML value into a :class:FunctionRef.      Two accepte
    participant P491 as Parse a per-policy ask_timeout: override.      None / absent = fall ba
    participant P492 as Parse the policies: mapping from the server --config     YAML into a li
    participant P493 as Parse the llm: block from the server --config YAML.      Delegates to
    participant P494 as PolicyVerdictEvent
    participant P495 as Require exactly one source key and validate its value.          :returns: se
    participant P496 as Reject an env that is not a POSIX environment variable name.          :par
    participant P497 as Reject an empty username.          :param value: The raw username valu
    participant P498 as Enforce target / targets cardinality and per-type options.          
    participant P499 as _FakeStreamingRunnerClient
    participant P500 as VertexAdapter
    participant P501 as _SPAStaticFiles
    participant P502 as Load an agent spec from a directory, tarball path, or raw     bytes.      If
    participant P503 as Drop sub-agents that fail validation so the parent can still load.      Walks
    participant P504 as Reject function policies whose handler is not registered.      Scans a parsed
    participant P505 as _FakeHarnessClient
    participant P506 as _ContentCapturingProcessManager
    participant P507 as _RangeAwareGZipMiddleware
    participant P508 as _UCFunctionSchemaTool
    participant P509 as _FastAPICallNext
    participant P510 as _WebSocketMetricsMiddleware
    participant P511 as _FakeHarnessStream
    participant P512 as Bidirectional translator between agent-meow AgentSpec and agent-meow Agent
    participant P513 as Translate an agent-meow AgentSpec into an agent-meow     AgentDef suita
    participant P514 as Fail loud when the spec uses an unsupported concept.      Each branch names th
    participant P515 as Detect whether a tool dotted path names a cancellable-function     runner.
    participant P516 as Build the AgentDef.tools dict from agent-meow' tool model.      Function-t
    participant P517 as Build an inner :class:MCPTool from a native     :class:MCPServerConfig — th
    participant P518 as Rebuild an agent-meow :class:AgentTool from a nested     agent-meow :class:A
    participant P519 as Resolve a dotted import path to whatever object it names.      Unlike :func:_
    participant P520 as Resolve a dotted import path to a callable.      Thin wrapper around :func:_r
    participant P521 as Translate the guardrails-related top-level fields of an     agent-meow YAML int
    participant P522 as Merge agent-meow' separate labels: (initial values) and     label_schema:
    participant P523 as Translate the agent-meow policies: mapping entry-by-entry     into the agen
    participant P524 as Dispatch a single policy entry to its type-specific     translator.      :par
    participant P525 as Translate an agent-meow type: function policy to the     agent-meow shape.
    participant P526 as Resolve a Databricks profile name to a     {base_url, api_key} dict by read
    participant P527 as Translate an agent-meow type: prompt policy to the     agent-meow shape.
    participant P528 as Translate an agent-meow :class:AgentDef into an agent-meow     :class:AgentS
    participant P529 as Pull the top-level YAML skills: field out of a raw     omnigent-format YAML
    participant P530 as Materialize a self-clone sub-spec by re-translating the parent.      Deep-copi
    participant P531 as Translate an agent-meow inline :class:AgentTool (sub-agent     exposed as a t
    participant P532 as Resolve the os_env field on an inline :class:AgentTool     declaration ag
    participant P533 as Raise :class:OmnigentError for every agent-meow concept     agent-meow' :clas
    participant P534 as Raise :class:OmnigentError when *tool* uses an agent-meow     tool concept ag
    participant P535 as Translate agent-meow AgentDef.name to :attr:AgentSpec.name.      Agent
    participant P536 as Translate agent-meow AgentDef.prompt to     :attr:AgentSpec.instructions.
    participant P537 as Translate agent-meow executor.model into an agent-meow     :class:LLMConfi
    participant P538 as Build the agent-meow :class:ExecutorSpec for an agent-meow     agent.
    participant P539 as Translate one agent-meow :class:MCPTool into a native     :class:MCPServerCo
    participant P540 as Translate one agent-meow function tool into a     :class:LocalToolInfo.
    participant P541 as Recover the dotted import path for a function-type tool's     callable.
    participant P542 as _RecordingProcessManager
    participant P543 as _StubTerminalRegistry
    participant P544 as _GatedTwoTurnHarnessStream
    participant P545 as DatabricksAdapter
    participant P546 as UcodeWiringRemoval
    participant P547 as _StubTerminalInstance
    participant P548 as _GatedTwoTurnHarnessClient
    participant P549 as Return the server version exposed to clients.      Reads :data:~?agent_meow.v
    participant P550 as Pin Content-Type for web UI assets regardless of the OS MIME registry.      St
    participant P551 as Protocol for FastAPI's middleware continuation callable.
    participant P552 as Execute the next middleware or route handler.          :param request: Incomin
    participant P553 as ASGI middleware that tracks accepted WebSocket connections.      :param app: D
    participant P554 as Initialize the middleware.          :param app: Downstream ASGI app.
    participant P555 as Track an accepted WebSocket for the lifetime of its ASGI scope.          :para
    participant P556 as Return the low-cardinality route template for metrics attributes.      Prefer
    participant P557 as Return the HTTP status code to attach to request duration metrics.      :param
    participant P558 as Strip nondeterministic metadata from a tar member header.      The built-in bu
    participant P559 as Register or refresh a built-in template agent from its bundle.      Content-aw
    participant P560 as Register all built-in agents that should always be available.      Called on e
    participant P561 as Seed extra built-in agents named by :data:_EXTRA_BUILTIN_AGENTS_ENV.      No
    participant P562 as Build a gzipped tarball of the claude-native-ui agent spec.      :returns: Gzi
    participant P563 as Register or refresh the claude-native-ui agent.      Called during server life
    participant P564 as Build a gzipped tarball of the codex-native-ui agent spec.      :returns: Gzip
    participant P565 as Register or refresh the codex-native-ui agent.      Called during server lifes
    participant P566 as Build a gzipped tarball of the opencode-native-ui agent spec.      :returns: G
    participant P567 as Register or refresh the opencode-native-ui agent.      Called during server li
    participant P568 as Build a gzipped tarball of the pi-native-ui agent spec.      :returns: Gzipped
    participant P569 as Register or refresh the pi-native-ui agent.      Called during server lifespan
    participant P570 as Build a gzipped tarball of the cursor-native-ui agent spec.      :returns: Gzi
    participant P571 as Register or refresh the cursor-native-ui agent.      Called during server life
    participant P572 as Build a gzipped tarball of the kiro-native-ui agent spec.
    participant P573 as Register or refresh the kiro-native-ui agent.
    participant P574 as Register or refresh the antigravity-native-ui agent.      Called during server
    participant P575 as Build a gzipped tarball of the antigravity-native-ui agent spec.      :returns
    participant P576 as Build a gzipped tarball of the qwen-native-ui agent spec.      :returns: Gzipp
    participant P577 as Register or refresh the qwen-native-ui agent.      Called during server lifesp
    participant P578 as Build a gzipped tarball of the kimi-native-ui agent spec.      :returns: Gzipp
    participant P579 as Register or refresh the kimi-native-ui agent.      Called during server lifesp
    participant P580 as Build a gzipped tarball of the examples/debby agent bundle.      debby is
    participant P581 as Register the debby brainstorming agent if its bundle ships here.      Called d
    participant P582 as Build a gzipped tarball of the examples/polly agent bundle.      polly is
    participant P583 as Register the polly orchestrator agent if its bundle ships here.      polly is
    participant P584 as Build and return the FastAPI application with all routes mounted.      Stores
    participant P585 as StaticFiles with an SPA history fallback.      React Router's client-side
    participant P586 as Return whether an unmatched static path belongs to the API namespace.      The
    participant P587 as Gzip middleware that leaves ranged static-file responses unencoded.      HTTP
    participant P588 as Compress ordinary static responses and pass range requests through.          :
    participant P589 as Apply browser cache policy for the bundled web UI static mount.      The SPA s
    participant P590 as _ContentCapturingHarnessClient
    participant P591 as MessageEvent
    participant P592 as InterruptEvent
    participant P593 as ToolResultEvent
    participant P594 as _ModelSendResult
    participant P595 as _AsyncToolHandle
    participant P596 as Registry-based tool manager for agent execution.  Registers builtin, client-sp
    participant P597 as Schema-only tool entry for UC function tools.      UC function tools are dispa
    participant P598 as Return the tool name.          :returns: The tool name, e.g. \"classify_text\"
    participant P599 as Return the tool description from the schema.          :returns: The descriptio
    participant P600 as Return the OpenAI-format tool schema.          :returns: A dict with \"type\":
    participant P601 as Registry-based tool manager for a single workflow execution.      Registers at
    participant P602 as Initialize the tool manager and register built-in,         client-specified, an
    participant P603 as Auto-register sys_add_policy and sys_policy_registry.          Always
    participant P604 as Register the async-dispatch builtins when the agent spec         has async
    participant P605 as Register the timer builtins when the agent spec opts in.          Gated on :at
    participant P606 as Register built-in skill tools.          Always registers load_skill — it d
    participant P607 as Register built-in tools declared in tools.builtins.          Most tools ar
    participant P608 as Instantiate a built-in tool by name.          :param name: The builtin name fr
    participant P609 as Build a :class:WebSearchTool for the parent's LLM.          Uses parse_mod
    participant P610 as Build a WebFetchTool with the parent's spec.          :returns: A WebFetchTool
    participant P611 as Register the sub-agent tool surface.          The read-only discovery tools —
    participant P612 as Register the read-only sys_agent_* discovery tools.          sys_agent_g
    participant P613 as Auto-register sys_cancel_task.          sys_cancel_task is registered
    participant P614 as Auto-register list_comments and update_comment.          Both tools ar
    participant P615 as Register sys_os_* tools when the spec declares os_env.          When a
    participant P616 as Register sys_terminal_* tools when the spec declares terminals.
    participant P617 as Load and register local Python tools from the agent image.          Each @to
    participant P618 as Register client-specified tools.          Raises :class:OmnigentError if a t
    participant P619 as No-op marker; all tools registered at init. MCP lives on runner.
    participant P620 as Idempotent teardown: close OS environment and shut down tools.          Closes
    participant P621 as Return the names of all registered tools.          :returns: Tool names, e.g.
    participant P622 as Return OpenAI-format tool schemas for all registered         tools.
    participant P623 as Look up a registered tool by name.          :param name: The tool function nam
    participant P624 as Dispatch a tool call to the registered handler.          :param name: The tool
    participant P625 as Return the raw OpenAI-format schemas for all registered         client-side too
    participant P626 as Return True if the named tool should be dispatched as         action_requ
    participant P627 as Tests for server session resource endpoints (Phase 1a + 1b + 1c).
    participant P628 as The parent-wake forward must fail loud if the runner is unreachable.      The
    participant P629 as ensure_native_terminal requests bypass the declared-name gate.      The 
    participant P630 as Minimal artifact store backed by a dict for tests.
    participant P631 as :class:HarnessApp scaffold — base class every per-harness wrap inherits.  T
    participant P632 as Result of a policy evaluation round-trip.      Returned by :meth:TurnContext.
    participant P633 as Downward message event — start a new turn or steer an in-flight one.
    participant P634 as Synthesize a :class:CreateResponseRequest from this event.          Maps c
    participant P635 as Downward interrupt event — cancel the in-flight turn.      The harness has
    participant P636 as Downward tool_result event — deliver a server-dispatched     tool's output
    participant P637 as Downward approval event — reply to an outstanding     elicitation.      R
    participant P638 as Adapt this event onto the legacy :class:ElicitationResult.          :returns
    participant P639 as Downward policy_verdict event — deliver a policy evaluation     result back
    participant P640 as Per-turn interaction surface the scaffold hands to run_turn.      The subc
    participant P641 as Push an SSE event upstream.          Non-blocking. The event lands on the per-
    participant P642 as Emit a server-dispatched tool call and park until the result.          Surface
    participant P643 as Emit an elicitation request and park until the reply.          Wire shape adop
    participant P644 as Wait for an in-band steering / async-completion injection.          Blocks unt
    participant P645 as Internal: resolve a pending tool-call Future from a         tool_result eve
    participant P646 as Internal: resolve a pending elicitation Future.          :param elicitation_id
    participant P647 as Emit a policy evaluation request and park until the verdict.          Surfaces
    participant P648 as Internal: resolve a pending policy-evaluation Future.          :param evaluati
    participant P649 as Internal: push an injection request onto the queue.          :param request: T
    participant P650 as Internal: cancel every pending tool / elicitation Future.          Called by t
    participant P651 as Base class for harness wraps. Subclasses implement     :meth:run_turn.
    participant P652 as Subclass hook invoked during lifespan teardown.          Called from _lifesp
    participant P653 as Per-harness turn execution.          Subclasses MUST override. The scaffold ha
    participant P654 as Translate a run_turn exception into an :class:ErrorDetail.          Defa
    participant P655 as Build the FastAPI app exposing the harness API subset.          Mounts:
    participant P656 as Authenticate a /v1 request with the per-spawn bearer token (S1).
    participant P657 as Signal handler: kick off graceful shutdown.          Marks the scaffold as shu
    participant P658 as Wait briefly for in-flight turns to finalize on shutdown.          Bounded by
    participant P659 as Build the /v1 router with the route handlers.          The router is bound
    participant P660 as Validate that a session-keyed URL targets this scaffold's         conversation.
    participant P661 as Handle POST /v1/sessions/{conversation_id}/events.          Single discrim
    participant P662 as Apply an :class:InterruptEvent to the in-flight turn.          The harness h
    participant P663 as Apply a :class:ToolResultEvent to whichever in-flight         turn has a matc
    participant P664 as Apply a :class:PolicyVerdictEvent to whichever in-flight         turn has a m
    participant P665 as Start a new turn or inject into the in-flight one.          Invoked by :meth:
    participant P666 as Drive run_turn and yield SSE-formatted events.          Three phases:
    participant P667 as Build the response.created + response.in_progress events         emitted at the
    participant P668 as Cancel the heartbeat + (defensively) the run task, then         unregister the
    participant P669 as Wrap run_turn so its termination always pushes the         sentinel onto th
    participant P670 as Emit response.heartbeat on the queue every         :data:_HEARTBEAT_INTERV
    participant P671 as Construct the terminal SSE event after run_turn returns.          :param c
    participant P672 as Resolve a parked elicitation Future from an         :class:ApprovalEvent.
    participant P673 as Serialize a typed event to an SSE wire frame.      Wire shape: event: <name>
    participant P674 as Return the current UTC wall-clock as an ISO 8601 string.      Used for Heart
    participant P675 as Liveness probe — matches AP's /health shape.      :returns: {\"status\": \"
    participant P676 as Convert :class:OmnigentError into a JSON response with the     correct HTTP s
    participant P677 as AddCommentRequest
    participant P678 as CreateDirectoryRequest
    participant P679 as LaunchRunnerRequest
    participant P680 as End-to-end runner-dispatch tests: server → runner → spawned harness.  The load
    participant P681 as Neutralize the sub-agent dispatch CLI preflight for hermetic tests.      The n
    participant P682 as Create a test client against a runner ASGI app.      :param app: Runner app un
    participant P683 as Async context manager that yields scripted harness SSE chunks.      :param chu
    participant P684 as Store scripted stream state.          :param chunks: SSE chunks returned by 
    participant P685 as Enter the fake stream context.          :returns: This fake stream.
    participant P686 as Exit the fake stream without suppressing exceptions.          :param exc_type:
    participant P687 as Yield scripted text chunks.          :returns: Async iterator of SSE chunks.
    participant P688 as Await the fire-and-forget background turn task for *conv* before draining.
    participant P689 as Collect session.status values a runner published for a session.      Reads
    participant P690 as Return the first session.status: failed event a runner published.      Mir
    participant P691 as Harness client stub exposing stream for runner proxy tests.      :param ch
    participant P692 as Store scripted stream chunks.          :param chunks: SSE chunks returned by t
    participant P693 as Return a fake streaming response.          :param method: HTTP method, e.g. 
    participant P694 as Process manager stub for runner dispatch tests.      :param harness_client: Op
    participant P695 as Store the optional harness client.          :param harness_client: Optional ha
    participant P696 as Return the configured fake harness client.          :param conversation_id: ag
    participant P697 as Reaper in-flight marker — no-op for this stub (issue #1414).
    participant P698 as Reaper in-flight clear — no-op for this stub (issue #1414).
    participant P699 as A real, started HarnessProcessManager with the test harness registered.      U
    participant P700 as 204/304 harness side-channel responses must not serialize JSON null.      Retu
    participant P701 as Scaffold-mode preserved when no manager is wired up.
    participant P702 as Without agent_id or server_base_url, runner falls back to the     test-default
    participant P703 as Process manager stub that records the harness name get_client saw.      Unlike
    participant P704 as Store the capture sink and the reached-dispatch event.          :param capture
    participant P705 as Record the harness name and return an empty fake harness client.          :par
    participant P706 as Reaper in-flight marker — no-op for this stub (issue #1414).
    participant P707 as Reaper in-flight clear — no-op for this stub (issue #1414).
    participant P708 as A turn-triggering message that races ahead of session assignment     arrives wi
    participant P709 as Process manager stub that captures the body sent to the harness.      Returns
    participant P710 as Store the capture sink and the reached-dispatch event.          :param capture
    participant P711 as Return a harness client that records the body it is sent.          :param conv
    participant P712 as Reaper in-flight marker — no-op for this stub (issue #1414).
    participant P713 as Reaper in-flight clear — no-op for this stub (issue #1414).
    participant P714 as Harness client stub that records the JSON body of each stream.      :param cap
    participant P715 as Store the capture sink and reached event.          :param captured: Dict the r
    participant P716 as Record the body and return an empty SSE stream.          :param method: HTTP m
    participant P717 as A message to a cold session reloads prior history, not just itself.      Regre
    participant P718 as A cold-cache message NOT yet in the store is appended, not dropped.      Not e
    participant P719 as A real trailing user message is kept when no persisted_item_id is sent.
    participant P720 as Cold-cache reload of a media turn uses the resolved block, not the store copy.
    participant P721 as Spec resolver failures are surfaced as structured 503 errors.      :param capl
    participant P722 as Streaming spec resolver failures emit response.failed SSE.      :returns:
    participant P723 as A per-session /model override overrides HARNESS_<H>_MODEL.      Regres
    participant P724 as A per-session harness_override replaces the spec's brain harness.      The
    participant P725 as A spawn-env build failure must end the turn, never hang on \"running\".      Reg
    participant P726 as A SETUP-phase failure forwards its error message on the failed event.
    participant P727 as Collect full session.status events a runner published for a session.
    participant P728 as A harness stream that ends after response.failed publishes failed.
    participant P729 as Runner-local OS tools map cwd: . to the CLI workspace.      Remote run -
    participant P730 as Cloning an OSEnvSpec must preserve every sandbox field.      Regression guard
    participant P731 as Agent specs without os_env get a runner-owned workspace cwd.      :param m
    participant P732 as Agent specs without os_env use the CLI workspace when available.      :par
    participant P733 as runner_workspace wins over an absolute os_env.cwd in the spec.      Per de
    participant P734 as Without runner_workspace, an absolute os_env.cwd in the     spec is used as
    participant P735 as Runner terminal tools receive the CLI workspace in ToolContext.      :para
    participant P736 as Minimal stand-in for a launched TerminalInstance.      terminal_resource
    participant P737 as Record the activity callback instead of polling real tmux.
    participant P738 as Registry stub whose get returns a fixed instance.      The launch/close to
    participant P739 as Record the lookup and return the configured instance.
    participant P740 as Build a publish_event stub that records published events.      :param capt
    participant P741 as A fresh sys_terminal_launch publishes session.resource.created.      V
    participant P742 as An already_running launch publishes nothing.      Re-launching an existing
    participant P743 as A successful sys_terminal_close publishes session.resource.deleted.
    participant P744 as Malformed terminal idle items must not abort the inbox drain.      :returns: N
    participant P745 as The flagship architectural test.      Server-side httpx → runner FastAPI's
    participant P746 as Decode SSE bytes into [(event_type, payload), ...].
    participant P747 as _maybe_signal_changed_files emits at most one     session.changed_files.i
    participant P748 as sys_session_list and sys_session_get_history dispatch locally in the run
    participant P749 as Re-sending to the same (agent, title) continues the existing child.      T
    participant P750 as Build a parent-spec stub declaring one worker sub-agent.      Mirrors the
    participant P751 as A per-dispatch model reaches the child create as model_override.
    participant P752 as A fresh dispatch whose harness CLI is absent fails loud, creates nothing.
    participant P753 as Passing model on a continuation send fails loud, sends nothing.      A nat
    participant P754 as model plus session_id fails loud before any server call.      By-id mo
    participant P755 as A model for a harness without override plumbing fails loud.      Unknown h
    participant P756 as A cross-family model fails loud at dispatch, before any create.      The s
    participant P757 as Malformed model values fail loud before any server traffic.      The overr
    participant P758 as Build a real parent :class:AgentSpec with one worker sub-agent.      Unl
    participant P759 as Point provider resolution at an isolated config, no ambient creds.      :param
    participant P760 as Outcome of one fresh-create sys_session_send model dispatch.      :param o
    participant P761 as Drive one fresh-create sys_session_send carrying args.model.      :par
    participant P762 as A gateway-routed child persists the gateway-local spelling.      With a Databr
    participant P763 as A vendor-direct child persists the bare canonical spelling.      With an Anthr
    participant P764 as An undeterminable child provider leaves the requested id untouched.      The s
    participant P765 as The family guard fires on the RAW requested id, before any localize.      A GP
    participant P766 as execute_tool routes sys_list_models to the catalog enumerator.      Wi
    participant P767 as sys_list_models with no resolvable spec fails loud, not empty.      A sile
    participant P768 as By-id sys_session_send refuses closed direct children.      The close tool
    participant P769 as A completed async sub-agent turn arrives through sys_read_inbox.      This
    participant P770 as Draining an old child result must not delete a newer turn's work entry.      N
    participant P771 as Script one scaffold turn's SSE frames carrying text as output.      The ru
    participant P772 as Per-turn-scripted harness stream that blocks turn 1 mid-flight.      Turn 1 yi
    participant P773 as Store scripted turns and the turn-1 synchronization events.          :param tu
    participant P774 as Enter the stream context.          :returns: This stream.
    participant P775 as Exit without suppressing exceptions.          :param exc_type: Exception type
    participant P776 as Yield scripted frames, blocking turn 1 before it completes.          :returns:
    participant P777 as Harness client whose stream returns the gated two-turn stream.      Also i
    participant P778 as Store the scripts and synchronization events.          :param turns: Per-turn
    participant P779 as Return the next gated turn stream.          :param method: HTTP method (ignore
    participant P780 as Accept the runner's mid-turn injection forward (best-effort).          :param
    participant P781 as A scaffold child running two turns delivers ONLY the final turn's text.      R
    participant P782 as sys_read_inbox evaluates delayed sub-agent output as TOOL_RESULT.      s
    participant P783 as Transient policy-evaluation failures must not destroy child output.      The f
    participant P784 as list_tasks is no longer a framework builtin.      User/local tools may sti
    participant P785 as sys_cancel_task hard-stops a running claude-native child cleanly.      The
    participant P786 as Unconfirmed codex-native cancel must not promise terminal inbox status.      C
    participant P787 as A non-native (in-process) sub-agent cancel must post interrupt.      In-pr
    participant P788 as _session_status_to_task_status maps a session.status value to the     child
    participant P789 as _truncate_child_preview returns short text unchanged and truncates     text
    participant P790 as register_child_session stores the parent fan-out metadata and     unregis
    participant P791 as Build an AsyncClient whose requests are answered by handler.      :param h
    participant P792 as sys_session_list maps child_sessions rows to     {agent, title, conve
    participant P793 as When the caller is itself a child (a user-added agent), sys_session_list     al
    participant P794 as sys_session_get_history reads GET /items (newest-first), reverses to
    participant P795 as sys_session_get_history appends the target's parked elicitations (read
    participant P796 as A 404/403 from GET /items maps to the in-process tool's typed errors.
    participant P797 as sys_session_close PATCHes a closed label and internal tombstone.      The
    participant P798 as sys_session_close refuses a target in a different spawn tree and     issues
    participant P799 as sys_session_close refuses a top-level session (no parent) even     when it
    participant P800 as sys_agent_get / sys_agent_download dispatch locally in the     runner.
    participant P801 as Both agent tools map a 404 to agent_not_found — the orchestrator     gets a
    participant P802 as The native relay advertises exactly ToolManager's builtin schemas     inter
    participant P803 as The native relay advertises sys_terminal_* iff the spec declares     term
    participant P804 as sys_session_create dispatches locally in the runner. If it     regresses ou
    participant P805 as The global sessions view fetches GET /v1/sessions (forwarding the     age
    participant P806 as sys_agent_download rejects a dest_filename containing a path     separa
    participant P807 as sys_agent_download refuses to follow a symlink that redirects the     bundl
    participant P808 as sys_agent_download writes the fetched .tar.gz bytes into the     agent'
    participant P809 as sys_agent_get projects GET /v1/sessions/{id}/agent into the     orchest
    participant P810 as A failing source degrades to an empty section rather than failing the     whole
    participant P811 as sys_agent_list merges built-ins (GET /v1/agents), session-bound     agents
    participant P812 as A 404 from the create maps to agent_not_found so the LLM gets a     typed r
    participant P813 as sys_session_create POSTs a JSON create with     parent_session_id force
    participant P814 as sys_session_create rejects both-or-neither of agent_id /     config_p
    participant P815 as Decode a captured multipart POST /v1/sessions request body.      Uses the
    participant P816 as Bundle mode bundles a local agent config, POSTs the multipart     create with 
    participant P817 as A config_path resolving outside the working directory is     refused before
    participant P818 as A missing config_path returns the typed config_not_found     error so t
    participant P819 as Omitting session_id describes the caller's own session — the     runner tar
    participant P820 as A 404 maps to session_not_found; 401/403 map to     access_denied — so
    participant P821 as Omitting session_id shares the caller's own session: the runner     PUTs to
    participant P822 as A 404 maps to session_not_found; 401/403 map to access_denied     — a t
    participant P823 as An unknown level is rejected client-side before any PUT — so a     typo can
    participant P824 as A 4xx the typed branches don't claim (here the server's 400 for a     __publi
    participant P825 as With no spec (None) or agent_session_sharing: none, the     runner refu
    participant P826 as Under agent_session_sharing: non-public a grant to a named user     is allo
    participant P827 as Under agent_session_sharing: public a __public__ read grant     passes
    participant P828 as sys_session_get_info projects GET /v1/sessions/{id} metadata     and fo
    participant P829 as A native-UI session describes itself with its clean public name.      Regressi
    participant P830 as sys_session_send in by-session-id mode verifies the target is a     direct
    participant P831 as By-session-id send refuses a target that is NOT a direct child of the     calle
    participant P832 as An empty sub-agent completion renders \"produced no output\", not \"returned:\".
    participant P833 as A non-empty sub-agent completion still renders its returned text.      Guards
    participant P834 as Supplying both session_id and agent/title fails loud.      The by-
    participant P835 as A reconnect re-POST of /v1/sessions must not wipe the session inbox.
    participant P836 as A nested approval envelope is flattened to the scaffold's ApprovalEvent.
    participant P837 as A decline verdict with no form content flattens without a content key.
    participant P838 as _LoadedHistory
    participant P839 as FastAPI lifespan: cancel, close, and drain on exit.          Uvicorn owns proc
    participant P840 as OpenAI and OpenAI-compatible provider adapter.  Handles OpenAI, Groq, DeepSeek
    participant P841 as Adapter for providers using the OpenAI Chat Completions format.      API keys
    participant P842 as Build HTTP headers for the request.          :param api_key_override: API key
    participant P843 as Build the Chat Completions request payload.          :param messages: Chat Com
    participant P844 as Send a Chat Completions request to the provider.          :param messages: Cha
    participant P845 as Send a non-streaming HTTP POST and return the JSON response.          :param u
    participant P846 as Send a streaming HTTP POST and yield parsed SSE data chunks.          :param u
    participant P847 as Parse a single SSE line into a data dict.      Ignores non-data lines (event:,
    participant P848 as Resolve the effective base URL from override or default.      :param override:
    participant P849 as Convert Chat Completions tool schemas to Responses API format.      Chat Compl
    participant P850 as Convert Responses API output items to llms.types output objects.      me
    participant P851 as Convert a Responses API response dict to a :class:Response.      :param data
    participant P852 as Convert a single Responses API SSE event to a     :class:ResponseStreamEvent,
    participant P853 as OpenAI-specific adapter that calls /v1/responses natively.      Extends :c
    participant P854 as Call the OpenAI Responses API (/v1/responses) directly.          Used inst
    participant P855 as Stream the Responses API and yield typed         :class:ResponseStreamEvent i
    participant P856 as UcodeHarnessConfig
    participant P857 as REST API routes for hosts (/v1/hosts).  Provides endpoints for listing con
    participant P858 as Send a host.list_dir frame and await the result.      Mirrors the structur
    participant P859 as Send a host.create_dir frame and await the result.      Mirrors :func:_pr
    participant P860 as Request body for POST /v1/hosts/{host_id}/directories.      :param path: A
    participant P861 as Request body for POST /v1/hosts/{host_id}/runners.      :param session_id:
    participant P862 as Read the bound agent's os_env.cwd for workspace-boundary checks.      :par
    participant P863 as Read the bound agent's canonical harness for the launch frame.      Mirrors :f
    participant P864 as Build the router for host REST endpoints.      Mounted with prefix=\"/v1\" s
    participant P865 as _ScriptedStreamingRunnerClient
    participant P866 as Agent execution workflow — the core agent loop.  Load agent → build prompt → c
    participant P867 as Env-var mapping for one harness's ucode agent state.      :param agent_name: u
    participant P868 as Return the shared LLM client, creating it on first use.
    participant P869 as Return the httpx client for the runner handling *conversation_id*.      Used b
    participant P870 as Inject per-harness model, URL, and auth values from ucode state.      The harn
    participant P871 as Copy one ucode agent entry into harness env vars.      :param env: Mutable spa
    participant P872 as Translate a workflow harness type to the provider-config harness name.      Th
    participant P873 as Return a bearer-token shell command for *family*, failing loud if absent.
    participant P874 as Return the scheme://host[:port] origin of *base_url*.      The gateway executo
    participant P875 as Inject per-harness model, URL, and auth from a generic provider.      The open
    participant P876 as Return the bundled catalog's default model for a provider family.      Used as
    participant P877 as Apply a provider family to a gateway-style harness (claude-sdk / codex).
    participant P878 as Apply a provider family to the openai-agents-sdk harness.      Unlike the gate
    participant P879 as Return a provider family, or None if absent *or* its key env var is unset.
    participant P880 as Apply a provider to the pi harness, which consumes both families.      pi read
    participant P881 as Apply a cli-config Databricks AI Gateway to the pi (gateway-harness) path.
    participant P882 as Build an in-memory databricks-kind provider for a legacy credential.
    participant P883 as Synthesize a databricks provider for a legacy credential, when applicable.
    participant P884 as Resolve the provider that should route *harness_type*, if any.      The single
    participant P885 as Return the model identifier from the spec's executor block.      :param spec:
    participant P886 as Populate the skills-related HARNESS_CLAUDE_SDK_* env vars.      Threads 
    participant P887 as Build the env-var dict the claude-sdk harness wrap reads.      Maps spec.execu
    participant P888 as Build the env-var dict the codex harness wrap reads.      Maps spec.executor f
    participant P889 as Build the env-var dict the pi harness wrap reads.      Maps spec.executor fiel
    participant P890 as Build the env-var dict the qwen harness wrap reads.      Maps spec.executor fi
    participant P891 as Build the env-var dict the headless goose harness wrap reads.      Maps spec.e
    participant P892 as Load the auth: block from ~/.agent_meow/config.yaml.      Reads the us
    participant P893 as Build the env-var dict the openai-agents harness wrap reads.      Maps spec.ex
    participant P894 as Build the HARNESS_CURSOR_* env-var dict the cursor harness wrap reads.
    participant P895 as Build the env-var dict the kimi harness wrap reads.      Maps spec.executor
    participant P896 as Map spec.executor fields → the HARNESS_ANTIGRAVITY_* env vars the     a
    participant P897 as Build the HARNESS_COPILOT_* env-var dict the copilot harness wrap reads.
    participant P898 as Encode an :class:OSEnvSpec for the wrap's env-var input.      JSON-encodes :
    participant P899 as Encode a :class:RetryPolicy for the wrap's env-var input.      Phase 1f of 
    participant P900 as Read the retry policy off a spec.      Used by the per-harness _build_*_spaw
    participant P901 as Substitute the per-request LLM model into the agent's LLM config.      The ove
    participant P902 as Build system instructions and Responses API input items.      Resolves content
    participant P903 as Fetch all conversation items starting after the given     cursor, paginating th
    participant P904 as Strip mcp__<server>__ prefix from *name*; preserve bare __.
    participant P905 as Handle returned to the LLM when an async tool is dispatched.      Replaces the
    participant P906 as Serialize the handle as JSON for the tool-call return path.          The runne
    participant P907 as Build the LLM-facing instruction text on a fresh async handle.      Every word
    participant P908 as Return the most recently appended compaction item for a     conversation, or 
    participant P909 as Result of :func:_load_initial_history.      Bundles the conversation items w
    participant P910 as Load the conversation history for the start of an execution.      When a compa
    participant P911 as Force a compaction pass for an existing conversation.      This is the runtime
    participant P912 as Route bare Databricks model ids through the Databricks LLM adapter.      Norma
    participant P913 as Persist a compaction item for the current execution, unless one     already exi
    participant P914 as Resolve a sub-agent spec by name within the parent spec tree.      Recursively
    participant P915 as Find the first node owning the web_fetch builtin, root-first.      Pre-ord
    participant P916 as Recursively search spec.sub_agents for a sub-agent named name.      Th
    participant P917 as _ConversationStore
    participant P918 as _InMemoryArtifactStore
    participant P919 as _FakeStreamCtx
    participant P920 as _ScriptedStreamCtx
    participant P921 as _FakeWebSocket
    participant P922 as _StreamAndCaptureRunnerClient
    participant P923 as _SubagentTerminalStore
    participant P924 as build_policy_engine — construct a :class:PolicyEngine for a workflow.
    participant P925 as Return whether any policy in *specs* is the per-user daily cost-budget.      D
    participant P926 as Return whether any policy in *specs* is the per-subagent cost-budget.      Dri
    participant P927 as Normalize a usage dict for injection into the policy engine.      Removes disp
    participant P928 as SUBTREE-scoped usage seed for the per-subagent cost budget.      Unlike :func:
    participant P929 as Resolve a session's owner, caching the immutable result.      :param conversat
    participant P930 as Read the session owner's per-UTC-day cost rollup as the engine seed.      Reso
    participant P931 as Construct the :class:PolicyEngine for one workflow.      When spec.guardra
    participant P932 as Resolve the server-level LLM connection dict.      Returns server_llm.connec
    participant P933 as Construct a :class:PolicyLLMClient from server-level LLM config.      Return
    participant P934 as Resolve a Databricks CLI profile to a connection dict.      Uses     :func:~
    participant P935 as Dispatch a :class:PolicySpec to the matching runtime     :class:Policy subc
    participant P936 as Build an engine for an agent with no guardrails declared.      Kept as a named
    participant P937 as Seed declared initial values and return the current snapshot.      Race-safe a
    participant P938 as Load the current persisted label state.      Empty dict when the conversation
    participant P939 as Load the current persisted session state.      Empty dict when the conversatio
    participant P940 as Resolve the model the session is currently using.      Prefers the conversatio
    participant P941 as Deep-merge one conversation's by_model sub-dict into the subtree aggregate.
    participant P942 as Load cumulative session usage for a conversation **plus all of its     sub-agen
    participant P943 as SESSION-WIDE usage seed for the :class:PolicyEngine; cost = ENFORCEMENT total.
    participant P944 as Page through every conversation in one spawn tree.      Returns all conversati
    participant P945 as Collect a conversation id plus all its transitive sub-agent     descendants wit
    participant P946 as Load enabled session policies from the store and convert     them to :class:Fu
    participant P947 as Convert a stored :class:Policy entity to a     :class:FunctionPolicySpec.
    participant P948 as AnthropicAdapter
    participant P949 as Initialize the video store.          :param storage_location: Backend-specific
    participant P950 as Fetch {provider}.json from the MLflow GitHub Release catalog.      Skipped
    participant P951 as _McpLocation
    participant P952 as Conversation-aware runner routing for the agent-meow server.  The tunnel regis
    participant P953 as Instantiate the correct adapter for the provider.      Imports are lazy to avo
    participant P954 as Server-side WebSocket endpoint for runner tunnels (Phase 4/10).  Runners behin
    participant P955 as Return whether the WebSocket peer is a loopback client.      Local agent-meo
    participant P956 as Resolve the owner identity for a runner tunnel handshake.      Reads the authe
    participant P957 as Return the runner id authorized by WebSocket tunnel headers.      Servers with
    participant P958 as Build the router hosting the /runners/{id}/tunnel WS endpoint.      The ro
    participant P959 as Send queued frames on the WebSocket owner loop.      :param ws: Accepted Starl
    participant P960 as Receive one tunnel text message.      :param ws: Accepted Starlette WebSocket.
    participant P961 as Receive runner frames and route response frames.      Malformed frames (bad JS
    participant P962 as Send pings every PING_INTERVAL_S; declare dead after misses.      :param ws: A
    participant P963 as Build a public Codex goal route error response.
    participant P964 as Return a structured runner {error, detail} body if present.
    participant P965 as Return the JSON payload from a required Codex goal runner forward.      Codex
    participant P966 as POST a Codex goal control event to a known runner client.      Used after an a
    participant P967 as Wait briefly for a currently-bound runner before relaunching.      A freshly s
    participant P968 as Ask the session's existing host binding to spawn a runner.      This does not
    participant P969 as Run the session-init handshake before retrying a goal RPC.      The Codex goal
    participant P970 as Relaunch an existing host-bound Codex session for goal controls.      Goal sta
    participant P971 as Forward a Codex goal event, waking a host-bound runner if needed.      The fir
    participant P972 as Resolve and validate the Codex-native session targeted by a goal route.      :
    participant P973 as Register Codex-native session subresources on the shared router.
    participant P974 as _RoutedRunner
    participant P975 as Routes for session-scoped MCP server management.
    participant P976 as Where an MCP server declaration lives inside a bundle.
    participant P977 as Build routes under /sessions/{session_id}/agent/mcp-servers.
    participant P978 as Ask the bound runner to forget cached spec/tool data for this session.
    participant P979 as Tell connected clients to refetch the session agent object.
    participant P980 as Return the safe API summary for an MCP server config.
    participant P981 as Find a saved server in a parsed spec and return its summary.
    participant P982 as Create an MCP declaration in the bundle.
    participant P983 as Replace an existing MCP declaration.
    participant P984 as Remove an MCP declaration.
    participant P985 as Find a server declaration by parsed MCP server name.
    participant P986 as Return the single-file agent YAML path when the bundle has one.
    participant P987 as Write or move an inline tools.<name>.type: mcp block.
    participant P988 as Serialize a request body as tools/mcp/<name>.yaml.
    participant P989 as Serialize a request body as an inline tools MCP block.
    participant P990 as Copy a non-empty description into a YAML mapping.
    participant P991 as Preserve hidden or advanced config keys from the existing YAML.
    participant P992 as Read a YAML mapping from disk.
    participant P993 as Make tar members deterministic before content-addressing.
    participant P994 as Pack a bundle directory into deterministic .tar.gz bytes.
    participant P995 as Tests for session policy loading in :func:build_policy_engine.  Verifies tha
    participant P996 as A stored type=\"python\" policy converts to a FunctionPolicySpec.      The F
    participant P997 as A stored Python policy with no factory_params gets arguments=None.
    participant P998 as A stored type=\"url\" policy is rejected loudly, not skipped.      URL polic
    participant P999 as When policy_store is None, returns an empty list.
    participant P1000 as Disabled policies are excluded from the loaded specs.      :param db_uri: Per-
    participant P1001 as An enabled url-type session policy raises at load time (fail closed).      :pa
    participant P1002 as Build a minimal AgentSpec with no guardrails.      :returns: An :class:AgentS
    participant P1003 as Session policies from the store appear in the engine's policy list.      Creat
    participant P1004 as Without a policy store, the engine has no policies (noop).      :param db_uri:
    participant P1005 as Policy evaluation order is session → agent → admin.      Creates one policy at
    participant P1006 as Session policies on the root conversation propagate to sub-agents.      Create
    participant P1007 as When root and child both have a policy with the same name, child wins.      Th
    participant P1008 as A root conversation (no parent) loads its own policies once.      Ensures the
    participant P1009 as Tests for conversation-aware runner routing.
    participant P1010 as Minimal in-memory conversation store for tests.      :param conversations: Map
    participant P1011 as Initialize the canned conversations used by route tests.          :returns: No
    participant P1012 as Return the conversation or None.
    participant P1013 as Minimal list for policy-builder subtree walk.          :param limit: Max items
    participant P1014 as Update the stored conversation title.          :param conversation_id: Convers
    participant P1015 as Merge label updates into an in-memory conversation.
    participant P1016 as Record appended items and return them with fake ids.          :param conversat
    participant P1017 as Return appended items with the store interface shape.          :param conversa
    participant P1018 as Fake httpx.AsyncClient that records calls and returns canned responses.      S
    participant P1019 as Initialize a fake runner HTTP client.          :param payload: Default JSON pa
    participant P1020 as Build a canned response for the given method + url.          :param method: HT
    participant P1021 as Record and return a GET response.          :param url: Request URL path.
    participant P1022 as Record and return a POST response.          :param url: Request URL path.
    participant P1023 as Record and return a PUT response.
    participant P1024 as Record and return a PATCH response.
    participant P1025 as Record and return a DELETE response.
    participant P1026 as Labels endpoint must not build the full session snapshot.      The test app's
    participant P1027 as Resource listing delegates runner selection to the runner router.
    participant P1028 as Claude-native web-chat input is runner injection, not agent-meow persistence.
    participant P1029 as Only user messages are injectable into a claude-native terminal;     an assista
    participant P1030 as Runner SSE response.failed means terminal injection failed.      This fail
    participant P1031 as A WS-tunnel drop between terminal ensure and message forward is a 502.      WS
    participant P1032 as A native sub-agent's failed terminal boot must wake its parent.      The paren
    participant P1033 as Runner response for GET /resources/environments.
    participant P1034 as Runner response for GET /resources/{id}.
    participant P1035 as GET /resources/environments validates session then proxies.
    participant P1036 as GET /resources/terminals forwards order/limit to the runner.      The web term
    participant P1037 as GET /resources/environments 404s for nonexistent session.
    participant P1038 as GET /resources/{id} validates session then proxies.
    participant P1039 as GET /resources/{id} surfaces runner 404.
    participant P1040 as Resolve the session's agent spec to one declaring a bash terminal.      Th
    participant P1041 as POST /resources/terminals validates session then proxies.
    participant P1042 as User creates are rejected when the agent declares no terminals.      The stub
    participant P1043 as User creates must request a terminal name declared by the spec.      The agent
    participant P1044 as Client-controlled markers can't skip the gate for arbitrary launches.      The
    participant P1045 as A runner >=400 on terminal launch yields a clean error, not a 500 crash.
    participant P1046 as DELETE /resources/terminals/{id} validates session then proxies.
    participant P1047 as POST terminal transfer validates source and target then proxies.
    participant P1048 as DELETE /resources/terminals/{id} surfaces runner 404.
    participant P1049 as Shared conversation store for file tests.
    participant P1050 as Real SqlAlchemy file store for file endpoint tests.
    participant P1051 as In-memory artifact store for file endpoint tests.
    participant P1052 as FastAPI app with real file + artifact stores for file tests.
    participant P1053 as httpx client pointed at the file-capable test app.
    participant P1054 as POST + GET /resources/files round-trips through server.
    participant P1055 as GET /resources/files/{id} 404s for wrong session.
    participant P1056 as GET /resources/files/{id}/content returns raw bytes.
    participant P1057 as An uploaded .html must be served as a download, not rendered inline.      Repr
    participant P1058 as DELETE /resources/files/{id} removes the file.
    participant P1059 as files' is a typed collection route, not a resource id.
    participant P1060 as Uploaded files appear in GET /resources with type 'file'.
    participant P1061 as delete_all_for_session removes all session files.
    participant P1062 as Session resource events are part of the ServerStreamEvent union.
    participant P1063 as Canned runner response for filesystem directory listing.
    participant P1064 as Canned runner response for filesystem write.
    participant P1065 as Canned runner response for filesystem edit.
    participant P1066 as Canned runner response for filesystem delete.
    participant P1067 as GET /environments/{id}/filesystem proxies to runner with default pagination para
    participant P1068 as GET /environments/{id}/filesystem forwards limit and order to runner.
    participant P1069 as GET /environments/{id}/filesystem forwards after cursor to runner.
    participant P1070 as GET /environments/{id}/filesystem forwards before cursor to runner.
    participant P1071 as GET /environments/{id}/filesystem does not forward after/before when absent.
    participant P1072 as GET /environments/{id}/filesystem/{path} forwards pagination params     for dir
    participant P1073 as GET /environments/{id}/filesystem/{path} omits after/before when not provided.
    participant P1074 as GET /environments/{id}/filesystem/{path} proxies to runner.
    participant P1075 as PUT /environments/{id}/filesystem/{path} proxies to runner.
    participant P1076 as Successful filesystem writes publish a session filesystem invalidation.
    participant P1077 as PATCH /environments/{id}/filesystem/{path} proxies to runner.
    participant P1078 as DELETE /environments/{id}/filesystem/{path} proxies to runner.
    participant P1079 as Filesystem proxy rejects unknown sessions.
    participant P1080 as POST /environments/{id}/shell validates session then proxies.
    participant P1081 as Session file cleanup removes metadata and artifact bytes.
    participant P1082 as Uploading a file persists a resource_event conversation item.
    participant P1083 as Deleting a file persists a resource_event conversation item.
    participant P1084 as Async-context-manager body for _FakeStreamingRunnerClient.stream.      Yie
    participant P1085 as Enter the context, returning self as the response object.
    participant P1086 as Exit the context without suppressing exceptions.
    participant P1087 as Yield each configured SSE frame string in order.
    participant P1088 as Runner-client stub whose stream yields fixed SSE frames.      Real stub cl
    participant P1089 as Record the URL and return the canned streaming context.
    participant P1090 as Encode one SSE data: frame from a JSON payload.      :param payload: The e
    participant P1091 as Stream context that runs side-effect hooks between SSE frames.      Each step
    participant P1092 as Enter the context, returning self as the response object.
    participant P1093 as Exit the context without suppressing exceptions.
    participant P1094 as Yield frame steps in order, running callable steps in between.
    participant P1095 as Runner-client stub whose stream interleaves frames and hooks.      Real st
    participant P1096 as Return the scripted streaming context.
    participant P1097 as The relay persists a resource_event for a runner-emitted create.      An a
    participant P1098 as The relay persists a resource_event for a runner-emitted delete.      The
    participant P1099 as Runner session.status: failed error details survive reload.
    participant P1100 as A >256-char error message is truncated before the label write.      Long messa
    participant P1101 as The relay persists a turn-start routing_decision item BEFORE the     turn's
    participant P1102 as The relay re-publishes the routing decision live with the store id.      The r
    participant P1103 as A malformed routing item (empty model) is dropped, not persisted.      The run
    participant P1104 as The relay does not persist a startup response.error orphan.      A runner
    participant P1105 as The relay durably stores an in-turn runner error banner once.      Once a re
    participant P1106 as Duplicate runner errors are deduped only in durable history.      Reconnect ca
    participant P1107 as Definitive native terminal failure consumes the user message quickly.      The
    participant P1108 as Kiro web-chat input is mirrored by Kiro's session forwarder.
    participant P1109 as A failed Kiro tmux injection must not leave a ghost pending input.
    participant P1110 as A failed Kiro prompt must not make the next prompt clear the wrong pending input
    participant P1111 as Opaque framework 500 bodies become explicit ensure errors.      If the runner/
    participant P1112 as Runner transport failure is a definitive AP-side ensure error.      If agent-m
    participant P1113 as A WS-tunnel drop during terminal ensure fails the turn durably.      WSTunnelT
    participant P1114 as A fresh user retry gets its own durable terminal error.      Reconnect spam sh
    participant P1115 as A retry after intervening activity gets its own error.      If a native termin
    participant P1116 as A session.resource.created missing its resource persists nothing.
    participant P1117 as Empty-string resource id/type frames persist nothing.      A frame whose id or
    participant P1118 as A function_call_output persists with its call's response_id.      When
    participant P1119 as The relay feeds the in-flight index, then discards it on exit.      Drives the
    participant P1120 as A Stop fences the turn: its trailing deltas aren't persisted or forwarded.
    participant P1121 as A failed turn persists its streamed narration, ordered before the error.
    participant P1122 as A response.completed consumed while fenced still persists the answer.
    participant P1123 as An interrupted turn keeps its pre-Stop narration; the trailing tail drops.
    participant P1124 as response.elicitation_resolved passes the fence and clears the index.
    participant P1125 as With no terminal event, the fence holds until the next turn's running.      Th
    participant P1126 as Scaffold narration persists interleaved with the tool calls it preceded.
    participant P1127 as After a text→tool flush, a mid-turn reconnect must NOT replay the     just-comm
    participant P1128 as _FakeStreamingRunnerClient that also captures forwarded POSTs.      The re
    participant P1129 as Initialize the stream frames, post capture, and failure count.
    participant P1130 as Capture a forwarded event; 503 for the first post_failures, else 204.
    participant P1131 as Conversation store stub for claude-native sub-agent delivery tests.      Retur
    participant P1132 as Store the canned conversation and assistant text.
    participant P1133 as Return the configured conversation when the id matches.
    participant P1134 as Return a one-item assistant page (or empty) as a real PagedList.
    participant P1135 as Build a sub-agent conversation row for terminal-delivery relay tests.      :pa
    participant P1136 as The PTY-activity session.status edge never triggers sub-agent delivery.
    participant P1137 as Routes for per-session policy CRUD.  Session policies are managed via POST/
    participant P1138 as Generate a unique policy identifier.      :returns: A string of the form \"po
    participant P1139 as Convert a :class:Policy entity to a session policy response dict.      :para
    participant P1140 as Convert a :class:PolicySpec to a policy list response dict.      Used to sur
    participant P1141 as Build the session policies router.      All routes are scoped to     /sessi
    participant P1142 as CodexElicitationRequest
    participant P1143 as Tests for _build_antigravity_spawn_env in agent_meow/runtime/workflow.py
    participant P1144 as Isolate config + secrets to a tmp dir and clear ambient Gemini env.      Empty
    participant P1145 as Write an antigravity: block referencing *ref* into the isolated config.
    participant P1146 as Build a minimal antigravity :class:AgentSpec for spawn-env tests.
    participant P1147 as executor.model is encoded into HARNESS_ANTIGRAVITY_MODEL.
    participant P1148 as A spec with no model omits HARNESS_ANTIGRAVITY_MODEL entirely.
    participant P1149 as ApiKeyAuth sets the API key; any base_url is dropped (no gateway).
    participant P1150 as The legacy global auth: key is NEVER adopted by antigravity.      The glob
    participant P1151 as executor.config vertex/project/location thread to the Vertex env vars.
    participant P1152 as DatabricksAuth is unsupported: no env var emitted, and a warning logged.
    participant P1153 as An executor.config['profile'] does not produce any Databricks var.
    participant P1154 as A databricks- model no longer auto-selects a Databricks profile.
    participant P1155 as A plain Gemini model with no auth yields only the model var.      The wrap the
    participant P1156 as Routing the antigravity harness through a generic provider raises loudly.
    participant P1157 as A Gemini key registered via agent-meow setup (the antigravity:     bloc
    participant P1158 as An explicit api-key auth on the spec takes precedence over the stored key.
    participant P1159 as The dedicated antigravity: block is used; the global auth: is ignored.
    participant P1160 as An explicit DatabricksAuth never adopts the stored Gemini key.      The st
    participant P1161 as With no spec/stored/global key, an ambient GEMINI_API_KEY is adopted.      Mir
    participant P1162 as An ambient GEMINI_API_KEY is used while a global OpenAI auth: is ignored
    participant P1163 as A dangling stored reference resolves softly to no env var.      The antigrav
    participant P1164 as _ParsedSSEEvent
    participant P1165 as Return the runner-routed harness for an agent spec, if any.      Mirrors the h
    participant P1166 as Runner selected for a conversation dispatch.      :param runner_id: Runner UUI
    participant P1167 as Select runners from the live tunnel registry.      :param registry: In-memory
    participant P1168 as Return the runner client for a harness-backed conversation turn.          Disp
    participant P1169 as Return a runner client for session resource access.          Resource APIs use
    participant P1170 as Return the pinned runner client for an already-started conversation.
    participant P1171 as Return whether *runner_id* is currently connected.          :param runner_id:
    participant P1172 as Return the authenticated owner of *runner_id*, or None.          Delegates
    participant P1173 as Close cached runner clients.          :returns: None.
    participant P1174 as Return a routed runner after validating hard affinity.          :param runner_
    participant P1175 as Return a cached tunnel-backed client for *runner_id*.          :param runner_i
    participant P1176 as Return whether a runner advertised support for *harness*.      :param session:
    participant P1177 as UpdateCommentRequest
    participant P1178 as SendCommentsRequest
    participant P1179 as Routes for server-wide default policy CRUD.  Default policies are managed via
    participant P1180 as Generate a unique default policy identifier.      :returns: A string of the fo
    participant P1181 as Convert a :class:Policy entity to a default policy response dict.      :para
    participant P1182 as Extract user identity and verify admin status.      In single-user mode (no au
    participant P1183 as Build the default policies router.      All routes are scoped to /policies[/
    participant P1184 as CreateDocumentRequest
    participant P1185 as UpdateDocumentRequest
    participant P1186 as UpdateImageEditRequest
    participant P1187 as Image tools (image_*) for the agent-meow Images surface.  These tools are
    participant P1188 as Video tools (video_*) for the agent-meow Video surface.  These tools are *
    participant P1189 as SessionAccess
    participant P1190 as _CodexElicitationAdapter
    participant P1191 as Minimal WebSocket used only to register runner sessions.
    participant P1192 as Accept a send call from the registry.          :param data: Encoded tunnel fra
    participant P1193 as Return no frames.          :returns: Empty frame string.
    participant P1194 as Small in-memory conversation store for runner routing tests.
    participant P1195 as Create the store.          :param conversations: Conversations keyed by id.
    participant P1196 as Return a conversation by id.          :param conversation_id: Conversation id,
    participant P1197 as Create a real conversation entity.      :param conversation_id: Conversation i
    participant P1198 as Build a runner hello frame.      :param harnesses: Harness kinds advertised by
    participant P1199 as Assert a structured agent-meow error code.      :param excinfo: Captured pytes
    participant P1200 as Build a minimal real agent spec for routing tests.      Syncs llm.model in
    participant P1201 as Explicit harness-backed specs dispatch through the runner.
    participant P1202 as Specs with a harness not in the runner module table return None.
    participant P1203 as Dispatch fails when a conversation has not been PATCH-bound.
    participant P1204 as A pinned offline runner fails instead of silently rerouting.
    participant P1205 as A pinned conversation keeps hard affinity with multiple runners online.
    participant P1206 as A harness capability mismatch fails before dispatching.
    participant P1207 as Resource access fails instead of lazily pinning an unbound session.
    participant P1208 as Non-dispatch routes can distinguish unpinned conversations.
    participant P1209 as ResolvedCredential
    participant P1210 as Codex app-server elicitation protocol adapters for session routes.
    participant P1211 as Bidirectional adapter for one Codex app-server request method.      :param bui
    participant P1212 as Validated Codex request expressed in agent-meow elicitation terms.      :param
    participant P1213 as Convert a web verdict into this request's Codex response body.          :param
    participant P1214 as Validate a Codex request envelope and build its agent-meow adapter object.
    participant P1215 as Build a structured prompt payload from Codex requestUserInput.      The we
    participant P1216 as Normalize one web-submitted answer to Codex's answers list.      :param va
    participant P1217 as Convert a web approval result into Codex requestUserInput output.      :pa
    participant P1218 as Convert a web approval result into Codex MCP elicitation output.      :param r
    participant P1219 as Validate a Codex ExecPolicyAmendment value.      Codex's v2 app-server sch
    participant P1220 as Extract an execpolicy amendment from one Codex decision option.      :param de
    participant P1221 as Return the execpolicy amendment Codex offered for this request.      Codex doc
    participant P1222 as Extract a user-selected execpolicy amendment from agent-meow content.      :pa
    participant P1223 as Convert a web approval result into Codex command-approval output.      Codex h
    participant P1224 as Convert a web verdict into Codex file-change approval output.      :param resu
    participant P1225 as Convert a web verdict into legacy Codex patch approval output.      :param res
    participant P1226 as Convert a web verdict into Codex permission-profile output.      Codex's permi
    participant P1227 as Build agent-meow params for Codex mcpServer/elicitation/request.      :par
    participant P1228 as Build agent-meow params for Codex item/tool/requestUserInput.      :param
    participant P1229 as Build agent-meow params for Codex command approval requests.      :param reque
    participant P1230 as Build agent-meow params for Codex file-change approval requests.      :param r
    participant P1231 as Build agent-meow params for Codex permission-profile approval requests.      :
    participant P1232 as Build agent-meow params for legacy Codex patch approval requests.      :param
    participant P1233 as Extract a displayable command string from Codex approval params.      :param p
    participant P1234 as Return a bounded JSON preview for an elicitation payload.      :param value: J
    participant P1235 as agent-meow compatibility surface — bundled for surgical removal.  🚨 **TECH DEB
    participant P1236 as Validate fields for executor.type: agent-meow.      The agent-meow executo
    participant P1237 as Return True if *path* is an agent-meow single-file YAML spec.      Detecti
    participant P1238 as Explain why *path* failed :func:is_omnigent_yaml.      Used by agent_meow.
    participant P1239 as Load an agent-meow YAML and translate it to an     :class:AgentSpec.      P
    participant P1240 as Tests for :class:~?agent_meow.runtime.harnesses._scaffold.HarnessApp.  End-t
    participant P1241 as Single parsed SSE event captured from a streaming response.      :param event:
    participant P1242 as Yield parsed SSE events from an open streaming response.      Splits on the bl
    participant P1243 as Build a SEPARATE httpx client bound to the same Unix socket.      Tests that n
    participant P1244 as Terminal synthesis must wait for the run task to fully settle.      The stream
    participant P1245 as A cancellation racing terminal synthesis should become response.cancelled.
    participant P1246 as Cancelling terminal synthesis itself must not become response.completed.
    participant P1247 as Register the scaffold fixture harness module for the test.
    participant P1248 as Per-test parent directory under /tmp with a short path.
    participant P1249 as A started manager rooted in a short tmp dir.
    participant P1250 as Spawn the echo fixture harness for this test.
    participant P1251 as Spawn the tool-dispatch fixture harness for this test.
    participant P1252 as Spawn the usage fixture harness for this test.
    participant P1253 as Spawn the elicitation fixture harness for this test.
    participant P1254 as Spawn the cancellable fixture harness for this test.
    participant P1255 as Spawn the injection fixture harness for this test.
    participant P1256 as Spawn the native-tool fixture harness for this test.
    participant P1257 as Spawn the fast-heartbeat fixture harness for this test.
    participant P1258 as Spawn the unclassified-exception fixture harness for this test.
    participant P1259 as Spawn the shutdown-tracking fixture harness for this test.
    participant P1260 as Spawn the wedged harness; 2s watchdog (scaffold reads the env at import).
    participant P1261 as Spawn the busy-progress harness; 2s idle watchdog (read at import).
    participant P1262 as Spawn the wedged-with-fast-heartbeats harness; 2s idle watchdog.
    participant P1263 as Busy harness, 2s absolute ceiling below its ~3s runtime; idle high so only the c
    participant P1264 as A subclass can emit function_call + function_call_output directly.      Verifi
    participant P1265 as The streaming wrapper stamps server_time and     last_event_seq on ever
    participant P1266 as When run_turn raises an unclassified exception, the SSE     stream MUST end
    participant P1267 as A wedged run_turn must terminate with response.failed once     the watc
    participant P1268 as A turn that keeps emitting progress must complete even when its     total durat
    participant P1269 as Heartbeats must NOT reset the idle watchdog.      response.heartbeat is ke
    participant P1270 as The absolute ceiling fails a turn that keeps emitting but never ends.      The
    participant P1271 as GET /health returns {\"status\": \"ok\"} at root, NOT /v1.      Per the design's A
    participant P1272 as Terminal usage preserves context_tokens from the inner executor.      Bill
    participant P1273 as Terminal usage preserves the cache-read / cache-creation counts.      The harn
    participant P1274 as A message event starts a turn and streams the standard envelope.      Veri
    participant P1275 as POST /v1/sessions/<wrong>/events returns 404, not 200.      The harness sc
    participant P1276 as A tool_result event resolves the in-flight turn's parked Future.      Star
    participant P1277 as A multi-MB tool_result is streamed truncated, but run_turn gets it full.
    participant P1278 as A tool_result posted to a wrong conversation_id 404s.      Verifies the co
    participant P1279 as An interrupt event cancels the in-flight turn.      Verifies that an inter
    participant P1280 as An interrupt event with a wrong conversation_id 404s.      The interrupt p
    participant P1281 as Correct conversation_id + no in-flight turn returns 404.      The harness has
    participant P1282 as An approval event resolves the parked elicitation Future.      Verifies th
    participant P1283 as An approval event with a wrong conversation_id 404s.      The conversation
    participant P1284 as A second sessions-native message injects into the active turn.      Verifies t
    participant P1285 as After an interrupt, a follow-up (no previous_response_id) starts a FRESH turn.
    participant P1286 as A follow-up that steers via the interrupted turn's id also starts fresh.
    participant P1287 as A message with previous_response_id injects in-band.      Verifies the
    participant P1288 as An unknown type field on the events body returns 422.      Verifies the di
    participant P1289 as The scaffold's on_shutdown hook fires during lifespan     teardown, even wh
    participant P1290 as Idle-watchdog failure names a recent forwarder connectivity error.      Regres
    participant P1291 as Tests for the combined permission helper in _auth_helpers.  Focused on :fu
    participant P1292 as A fresh permission store on the per-test SQLite DB.      :param db_uri: Per-te
    participant P1293 as A fresh conversation store on the per-test SQLite DB.      :param db_uri: Per-
    participant P1294 as An owner is allowed and the fetched conversation is returned for reuse.      T
    participant P1295 as Bob, with no grant on Alice's session, gets 404 — not a 403 oracle.      Retur
    participant P1296 as A read-only user asking for edit gets 403 (has access, not enough).
    participant P1297 as Admin is allowed at OWNER level and does not fetch the conversation.      Mirr
    participant P1298 as Access via a higher public grant; displayed level is the user's own.      The
    participant P1299 as A sub-agent session inherits access from its parent's grant.      The user has
    participant P1300 as With no permission store, the helper is a no-op (level None, no fetch).
    participant P1301 as An anonymous caller against an enabled store is rejected with 401.
    participant P1302 as A non-admin asking for a conversation that does not exist gets 404.
    participant P1303 as Anthropic Messages API adapter.  Translates Chat Completions format to/from An
    participant P1304 as Adapter for the Anthropic Messages API.      API key must be provided via co
    participant P1305 as Send a request to the Anthropic Messages API.          :param messages: Chat C
    participant P1306 as Convert Chat Completions messages to Anthropic Messages API payload.      :par
    participant P1307 as Convert a Chat Completions assistant message to Anthropic format.      :param
    participant P1308 as Convert a Chat Completions tool message to Anthropic format.      :param m: To
    participant P1309 as Convert a Chat Completions user message to Anthropic format.      When content
    participant P1310 as Translate a single Chat Completions content part to Anthropic format.      - 
    participant P1311 as Convert OpenAI-format tool schemas to Anthropic format.      :param tools: Ope
    participant P1312 as Convert OpenAI tool_choice to Anthropic format.      :param tool_choice: \"no
    participant P1313 as Map a reasoning effort string to a thinking budget.      :param effort: \"low
    participant P1314 as Convert an Anthropic Messages API response to Chat Completions format.      :p
    participant P1315 as Parse Anthropic SSE stream into Chat Completions chunk dicts.      :param line
    participant P1316 as Build a Chat Completions streaming chunk dict.      :param metadata: Response
    participant P1317 as Build Anthropic API headers.      :param api_key_override: API key from conn
    participant P1318 as Send a non-streaming request to Anthropic and return a Chat     Completions for
    participant P1319 as Send a streaming request to Anthropic and yield Chat     Completions chunk dict
    participant P1320 as Databricks Model Serving adapter.  Extends the OpenAI-compatible adapter with
    participant P1321 as Adapter for Databricks Model Serving.      Credentials are resolved in the fol
    participant P1322 as Build the Chat Completions payload without stream_options.          Databr
    participant P1323 as Send a Chat Completions request to Databricks Model Serving.          :param m
    participant P1324 as Google Gemini adapter.  Translates Chat Completions format to/from Gemini's ge
    participant P1325 as Adapter for the Google Gemini API.      API key must be provided via connect
    participant P1326 as Return the API base URL. Overridden by VertexAdapter.          :returns: The G
    participant P1327 as Build HTTP headers. Overridden by VertexAdapter for OAuth.          Async so V
    participant P1328 as Send a request to the Gemini API.          :param messages: Chat Completions f
    participant P1329 as Send a non-streaming Gemini request.          :param url: The full endpoint UR
    participant P1330 as Send a streaming Gemini request.          :param url: The streaming endpoint U
    participant P1331 as Convert Chat Completions messages to Gemini generateContent payload.      :par
    participant P1332 as Convert assistant tool calls to Gemini functionCall parts.      :param m: Assi
    participant P1333 as Convert Chat Completions content to Gemini parts array.      Handles strin
    participant P1334 as Translate a single Chat Completions content part to Gemini format.      - te
    participant P1335 as Convert OpenAI tool schemas to Gemini functionDeclarations.      :param tools:
    participant P1336 as Convert a Gemini generateContent response to Chat Completions format.      :pa
    participant P1337 as Convert a single Gemini streaming chunk to Chat Completions chunks.      :para
    participant P1338 as Normalize Gemini finish reason to OpenAI format.      :param reason: Gemini fi
    participant P1339 as Extract usage from Gemini usageMetadata.      :param meta: Gemini usageMetadat
    participant P1340 as Return an empty Chat Completions response.      :param model: Model name.
    participant P1341 as Google Vertex AI adapter.  Uses the same Gemini payload format but with GCP au
    participant P1342 as Adapter for Google Vertex AI.      Inherits Gemini translation logic but uses
    participant P1343 as Get GCP credentials, refreshing if needed.          :returns: A google.auth.
    participant P1344 as Build Vertex AI headers with OAuth bearer token.          Offloads _get_cred
    participant P1345 as Not used — Vertex AI requires connection_params.          :returns: Never
    participant P1346 as Send a request to Vertex AI.          :param messages: Chat Completions format
    participant P1347 as Convert Vertex-specific \"project\"/\"location\" keys into     a \"base_ur
    participant P1348 as Build the Vertex AI endpoint URL from project and location.      :param projec
    participant P1349 as Routes for per-session review comments.  Comments can be sent to the agent as
    participant P1350 as Format a list of comments into a human-readable message for the agent.      Gr
    participant P1351 as Request body for POST /sessions/{id}/comments.      :param path: File path
    participant P1352 as Request body for PATCH /sessions/{id}/comments/{comment_id}.      :param s
    participant P1353 as Request body for POST .../comments/send.      :param comment_ids: IDs of c
    participant P1354 as Build the comments router.      All routes are scoped to /sessions/{session_
    participant P1355 as Routes for per-session documents (agent-meow Docs surface).  Documents are ric
    participant P1356 as Project a :class:Document to the API response shape.      :param doc: The do
    participant P1357 as Request body for POST /sessions/{id}/resources/documents.      :param titl
    participant P1358 as Request body for PATCH /sessions/{id}/resources/documents/{doc_id}.      A
    participant P1359 as Build the documents router.      All routes are scoped to /sessions/{session
    participant P1360 as Project an :class:ImageAsset to the API response shape (no binary).
    participant P1361 as Request body for PATCH .../images/{image_id}/edit.      :param edit_json:
    participant P1362 as Build the images router.      All routes are scoped to /sessions/{session_id
    participant P1363 as Project a :class:VideoAsset to the API response shape (no binary).
    participant P1364 as Build the videos router.      All routes are scoped to /sessions/{session_id
    participant P1365 as Shared auth helpers for route handlers.  Provides user identity extraction and
    participant P1366 as Extract user identity from the request.      :param request: The incoming Fast
    participant P1367 as Map an authenticated identity to its per-message attribution actor.      Drops
    participant P1368 as Extract user identity, raising 401 if missing in multi-user mode.      :param
    participant P1369 as Synchronous core of :func:require_access.      Lives in its own function so
    participant P1370 as Check permission, raising 403 or 404 on failure.      Async wrapper over :func
    participant P1371 as Synchronous core of get_permission_level.      Delegates to PermissionSt
    participant P1372 as Return the user's numeric permission level, or None.      Async wrapper ov
    participant P1373 as Result of authorizing a caller against a session in one pass.      Returned by
    participant P1374 as Synchronous core of :func:require_access_and_level.      Folds :func:_requi
    participant P1375 as Authorize a caller and resolve their display level in one threaded pass.
    participant P1376 as Return the user_id of the session owner, or None.      :param conversation
    participant P1377 as Unit tests for SDK HTTP error decoding helpers.
    participant P1378 as Non-JSON error bodies are preserved as text for status handling.
    participant P1379 as A parsed model string split into provider and model name.      :param provider
    participant P1380 as Parse a \"provider/model-name\" string into its components.      If no \"/\"
    participant P1381 as Return the harness name implied by a model string, or \"\"     when no prefix
    participant P1382 as Read/write the kind-typed model-provider config in ~/.agent_meow/config.yaml
    participant P1383 as Return the provider family a harness consumes, or None.      Maps a harnes
    participant P1384 as One provider family (anthropic or openai) for a harness surface.
    participant P1385 as A named, kind-typed provider from the providers: config block.      The :a
    participant P1386 as Return the parsed family for *name* with $VAR refs expanded.          Expa
    participant P1387 as Return a family's default model id **without** resolving credentials.
    participant P1388 as A human-readable description of the active credential for a harness.      Buil
    participant P1389 as Resolve a secret *ref* into its plaintext value, failing loud.      Accepts th
    participant P1390 as Return the path to the global agent-meow config file.      Respects $OMNIGEN
    participant P1391 as Load and parse the global config file.      :returns: The parsed YAML mapping,
    participant P1392 as Expand $VAR references in *value* and fail loud if unresolved.      :param
    participant P1393 as Return a copy of *family* with base_url + the secret resolved.      Called
    participant P1394 as Parse one family entry under a provider into a :class:FamilyConfig.      Per
    participant P1395 as Resolve a raw default: value into the scopes it applies to.      Accepts e
    participant P1396 as Render *default_families* back to the most compact config form.      Inverse o
    participant P1397 as Parse one entry under providers: into a :class:ProviderEntry.      Dispa
    participant P1398 as Load the global ~/.agent_meow/config.yaml mapping.      Public entry point
    participant P1399 as Parse the providers: block of *config* into named entries.      :param con
    participant P1400 as Return the single model family a harness consumes, or None.      Public ac
    participant P1401 as Return whether a cli-config *entry* can drive the pi harness.      Mos
    participant P1402 as Return the model families *entry* can serve.      Defaults are scoped **per fa
    participant P1403 as Return the default: true provider serving *family*, if any.      Defaults
    participant P1404 as Return the first configured provider that can serve *family*, or None.
    participant P1405 as Return the default provider for *harness* (resolving its family).      Maps th
    participant P1406 as Return the *effective* default provider for a harness surface.      The displa
    participant P1407 as Return the default model *entry* yields for a harness surface.      For a mode
    participant P1408 as Pick the family name *provider* exposes for *harness*.      Uses the canonical
    participant P1409 as Return a non-secret descriptor of a family's credential source.      :param fa
    participant P1410 as Describe the active credential for *harness*, for the readout.      Resolves t
    participant P1411 as Return a copy of providers: with *name* the default for *family*.      Mar
    participant P1412 as Build a {\"providers\": {name: entry}} dict to merge into config.      Packa
    participant P1413 as Surgical removal of harness wiring written by ucode configure.  Adding a 
    participant P1414 as Return the shared Codex CLI config path, ~/.codex/config.toml.      :retur
    participant P1415 as Return the ucode-owned sidecar config files for Claude and Codex.      These f
    participant P1416 as Return Claude Code's user-scope config path, ~/.claude.json.      :returns
    participant P1417 as Outcome of :func:remove_ucode_wiring.      :param codex_config_stripped: Whe
    participant P1418 as Remove ucode-managed keys from the user's shared Codex config.      Pops exact
    participant P1419 as Delete ucode's sidecar config files for Claude and Codex.      Sidecars are uc
    participant P1420 as Run claude mcp remove web_search -s user.      Removal goes through the cl
    participant P1421 as Unregister ucode's web_search MCP server from Claude Code.      Detect-the
    participant P1422 as Remove all harness wiring ucode configure wrote, on this machine.      Run
    participant P1423 as Shared helpers for uploaded agent bundles.
    participant P1424 as Whether a local-tool path is a dotted Python *import* path.      A server-
    participant P1425 as Reject server-side Python callable: tools in an untrusted upload.      Rec
    participant P1426 as Whether an agent-spec os_env.cwd would escape the session workspace.
    participant P1427 as Validate an agent bundle and return the parsed spec.      Extracts the tarball
    participant P1428 as Compute a content-addressed artifact key for a bundle.      :param agent_id: T
    participant P1429 as Reject semantically invalid range field combinations.          :returns: The v
    participant P1430 as Harness protocol violations are server-side bugs in the harness wrap.      The
    participant P1431 as End-to-end: OmnigentError(code=HARNESS_PROTOCOL_VIOLATION).http_status == 500.
    participant P1432 as Every public ErrorCode value MUST appear in the mapping.      A code without a
    participant P1433 as Tests for agent_meow.onboarding.provider_config.
    participant P1434 as harness_family resolves both native-harness spellings to a family.      Pr
    participant P1435 as provider_family_for_harness resolves SDK executor-type spellings.      The
    participant P1436 as env:ANTHROPIC_API_KEY falls back to OMNIGENT_ANTHROPIC_API_KEY.
    participant P1437 as For the unmapped pi harness, a subscription default is skipped.      A sub
    participant P1438 as Subscription-only configs resolve no default for pi.      With nothing but
    participant P1439 as Write a ~/.codex/config.toml under *home* (resolver reads $HOME).
    participant P1440 as For the unmapped pi harness, a cli-config Databricks gateway IS selected.
    participant P1441 as A NON-Databricks (or unresolvable) cli-config default is still skipped for pi.
    participant P1442 as Build a raw kind: key provider entry for one family.      :param family: T
    participant P1443 as An explicit \"pi\" in default: parses and wins pi resolution.      The a
    participant P1444 as default: true expands to the served model families only — never pi.      T
    participant P1445 as A gemini key serves ONLY the Gemini surface — never pi.      pi consumes the a
    participant P1446 as A gemini key's served-surface set excludes pi (no auto/explicit pi default).
    participant P1447 as A hand-edited default: [\"gemini\",\"pi\"] / \"pi\" on a gemini key     fails
    participant P1448 as Databricks routes anthropic/openai + pi, NOT the Gemini surface.      The anti
    participant P1449 as A gateway/local declaring a gemini: block does NOT claim the Gemini surface.
    participant P1450 as A gateway/local whose ONLY family is gemini fails loud at parse.      Such an
    participant P1451 as A gemini: family with auth_command (no static key) fails loud at parse.
    participant P1452 as auth_command remains valid for anthropic/openai families — no over-restricti
    participant P1453 as A key provider with a gemini: block DOES report the Gemini surface.
    participant P1454 as Naming \"pi\" in a subscription's default scope fails loud.      Both at par
    participant P1455 as Setting the pi scope persists in a re-parseable form and moves cleanly.      T
    participant P1456 as provider_families reports the pi scope only for pi-capable providers.
    participant P1457 as surface_default_model mirrors pi's anthropic-preferred auth pick.      A t
    participant P1458 as A cli-config entry parses with its pin fields and openai family.      Failure
    participant P1459 as Malformed cli-config entries fail loud with a pointed message.      Failure me
    participant P1460 as The /model readout describes a cli-config default truthfully.      Failure mea
    participant P1461 as kind: bedrock is native-agent-meow claude only; in-process harnesses fail lo
    participant P1462 as A bedrock Claude default is not handed to pi (native-claude only).      pi can
    participant P1463 as A bedrock-only Claude default leaves pi with no provider (own login).      Wit
    participant P1464 as Integration tests for BE-2 additions on the session URL surface.  This PR adds
    participant P1465 as Create a session via POST /v1/sessions and return its id.      GET /v1/s
    participant P1466 as search_query performs a case-insensitive substring match on title.      Tw
    participant P1467 as An empty search_query= returns the unfiltered list.      The UI sends ?s
    participant P1468 as A session with a NULL title is excluded from search results.      The LIKE fil
    participant P1469 as DELETE /v1/sessions/{id} removes the conversation row.      Routes via the
    participant P1470 as DELETE /v1/sessions/{missing} returns 404.
    participant P1471 as An offline bound runner must not block DELETE /v1/sessions/{id}.      Repr
    participant P1472 as Return the family's default model id, or None.          :returns: The mo
    participant P1473 as Whether this provider is the default for any family it serves.          Backwa
    participant P1474 as Return whether the cleanup changed anything at all.          :returns: True
    participant P1475 as ToolContext
    participant P1476 as Tool
    participant P1477 as OSEnvironment
    participant P1478 as SharePolicy
    participant P1479 as ToolRuntime
    participant P1480 as SysTerminalLaunchTool
    participant P1481 as SysTerminalCloseTool
    participant P1482 as WebSearchTool
    participant P1483 as SysTerminalSendTool
    participant P1484 as SysTerminalReadTool
    participant P1485 as SysTerminalListTool
    participant P1486 as UploadFileTool
    participant P1487 as SysCancelTaskTool
    participant P1488 as SysAddPolicyTool
    participant P1489 as SysPolicyRegistryTool
    participant P1490 as WebFetchTool
    participant P1491 as _SubagentInboxEvaluation
    participant P1492 as _CancelAsyncToolResult
    participant P1493 as _SubagentLabel
    participant P1494 as _ParsedTitle
    participant P1495 as _PeekMeta
    participant P1496 as Runner-local tool dispatch for intercepted action_required events.  Per design
    participant P1497 as Internal result for local async-task cancellation.      :param output: Tool ou
    participant P1498 as Result of delayed sub-agent output policy evaluation.      :param payload: Pay
    participant P1499 as Build the flat agent-meow tool surface for native harness bridges.      Return
    participant P1500 as Check if an SSE event is an action_required tool call.
    participant P1501 as Extract the tool name from an action_required event.
    participant P1502 as Extract the call_id from an action_required event.
    participant P1503 as Extract the arguments JSON string from an action_required event.
    participant P1504 as Return True if this tool should be dispatched by the runner locally.      Used
    participant P1505 as Look up a custom callable tool in the agent spec and resolve it.      Returns
    participant P1506 as Execute a custom callable tool defined in the agent spec YAML.      Resolves t
    participant P1507 as Check whether *tool_name* is a UC function tool in the spec.      :param tool_
    participant P1508 as Extract the Databricks profile from the agent spec's executor     auth configur
    participant P1509 as Execute a Unity Catalog function tool and return the output     string.
    participant P1510 as Human-facing identity fields for a child session.      :param agent: Sub-agent
    participant P1511 as Extract child identity fields from a child-session summary.      :param child:
    participant P1512 as Extract the native terminal wrapper label from a session payload.      :param
    participant P1513 as Publish the honest pre-start child state to the parent stream.      The child
    participant P1514 as Fetch child-session summaries for a parent session.      :param server_client:
    participant P1515 as Find an existing child session by (agent, title).      sys_session_send
    participant P1516 as Extract the user message from sys_session_send arguments.      The public
    participant P1517 as Extract and validate the per-dispatch model from sys_session_send args.
    participant P1518 as Look up a named sub-agent's spec in the parent's sub_agents list.      :pa
    participant P1519 as Resolve the declared harness for a named sub-agent.      Mirrors the harness d
    participant P1520 as Extract a per-dispatch harness override from sys_session_send args.      T
    participant P1521 as Extract and validate the per-dispatch cost budget from sys_session_send args
    participant P1522 as Resolve the canonical harness allowlist a sub-agent opts into.      Reads ex
    participant P1523 as Localize a per-dispatch model id for the child's resolved provider.      Runs
    participant P1524 as Dispatch sys_list_models: per-worker model availability.      Runs the enu
    participant P1525 as Dispatch a sub-agent tool call (sys_session_send).      Creates or reuses
    participant P1526 as Post a message to an existing direct-child session, return a handle.      The
    participant P1527 as Build the JSON POST /v1/sessions body for sys_session_create.      p
    participant P1528 as Register fan-out, emit session.created, and build the handle.      Records
    participant P1529 as Create a child session (sys_session_create).      Two modes, split on the
    participant P1530 as Build gzipped agent-bundle bytes from a local source path.      Handles the sa
    participant P1531 as Queue a bundle-created child's first user message.      Posted as a separate e
    participant P1532 as Resolve, bundle, and upload a local agent config as a child session.      Read
    participant P1533 as Bundle-mode sys_session_create: upload a new agent and launch it.      Del
    participant P1534 as Dispatch a web_fetch tool call.      Translates the user-facing query
    participant P1535 as Return the web_search builtin's config dict from the parent spec.      Mir
    participant P1536 as Dispatch a web_search tool call to the spec's configured backend.      Bui
    participant P1537 as Check whether a sub-agent name exists in the parent spec.      Searches both 
    participant P1538 as Schedule a timer that fires after a delay.      :param args: Parsed arguments.
    participant P1539 as Background loop: sleep then fire timer notifications.      :param timer_id: Un
    participant P1540 as Cancel a previously scheduled timer by timer_id.      :param args: Parsed
    participant P1541 as Runner-local handler for list_comments and update_comment.      The ru
    participant P1542 as Runner-local handler for sys_add_policy and sys_policy_registry.
    participant P1543 as Proxy GET /v1/policy-registry and return the list.      :param server_clie
    participant P1544 as Proxy POST /v1/sessions/{id}/policies to create a policy.      Forwards 
    participant P1545 as A child-session title split into its agent + instance components.      :param
    participant P1546 as Split a child-session title into agent + instance label.      Mirrors the serv
    participant P1547 as Truncate text to _ACTIVITY_MAX_CHARS to bound peek prompt size.      :para
    participant P1548 as Join the text blocks of an API message content array.      :param content:
    participant P1549 as Project a REST API conversation item into the compact peek shape.      Mirrors
    participant P1550 as Runner-local handler for sys_session_get_history / sys_session_list /
    participant P1551 as Resolve a runner's live connectivity via GET /v1/runners/{id}/status.
    participant P1552 as Return a session's metadata snapshot via GET /v1/sessions/{id}.      Resol
    participant P1553 as Extract the human-readable message from an agent-meow error response.      The
    participant P1554 as Grant a user access to a session via PUT /v1/sessions/{id}/permissions.
    participant P1555 as Runner-local handler for the doc_* tools (agent-meow Docs surface).      T
    participant P1556 as Resolve the officecli binary path, or None if not installed.
    participant P1557 as Handle doc_create_office / doc_edit_office / doc_export via officecli shell-out.
    participant P1558 as Handle doc_convert via markitdown CLI shell-out.
    participant P1559 as Runner-local handler for the image_* tools (agent-meow Images surface).
    participant P1560 as Resolve the image-generation provider from env vars.      Returns one of: 'com
    participant P1561 as Generate an image from a text prompt via the configured provider.
    participant P1562 as Remove the background from a session image using rembg CLI.
    participant P1563 as AI-edit a session image (inpaint/outpaint/upscale) via A1111 or ComfyUI.
    participant P1564 as Runner-local handler for the video_* tools (agent-meow Video surface).
    participant P1565 as Resolve the video-generation provider from env vars.      Returns one of: 'fal
    participant P1566 as Generate a video via the configured provider (quality ladder).      Providers
    participant P1567 as Upload generated video bytes to the session and return the result JSON.
    participant P1568 as Generate via fal.ai hosted API (Wan2.1/HunyuanVideo/LTX/Veo/Kling/...).
    participant P1569 as Generate via Happy Horse 1.0 — 15B unified Transformer, native audio-video.
    participant P1570 as Generate via the Pixelle-Video FastAPI gateway (free/local orchestration).
    participant P1571 as Runner-local handler for the transcribe_audio, text_to_speech,     sp
    participant P1572 as Runner-local handler for sys_agent_get / sys_agent_download.      The
    participant P1573 as Return a session's bound-agent metadata via GET .../agent.      Projects t
    participant P1574 as Resolve the local filename for a downloaded agent bundle.      Uses the caller
    participant P1575 as Download a session's agent bundle and write it to the agent's disk.      Fetch
    participant P1576 as Fetch one page of a paginated list endpoint, returning its data.      Best
    participant P1577 as Scan a directory for locally-authored agent config YAMLs.      Reads each *.
    participant P1578 as List launchable agents across built-ins, session-bound, and local.      Fans o
    participant P1579 as Project the three raw sys_agent_list sources into the tool result.      Bu
    participant P1580 as Return the two-view session list: sub_agents + global sessions.      
    participant P1581 as Collect the caller's named-sub-agent view via GET .../child_sessions.
    participant P1582 as Resolve live connectivity for the unique runners bound across rows.      Check
    participant P1583 as Fetch the global session list via GET /v1/sessions, with connectivity.
    participant P1584 as Map child_sessions rows to sys_session_list entries.      Skips closed
    participant P1585 as Return a session's parent_session_id (None if top-level/unknown).      Use
    participant P1586 as Read a target session's recent items via GET .../items.      Mirrors :clas
    participant P1587 as Fetch + status-classify the close target's session snapshot.      :param targe
    participant P1588 as Enforce the close tool's spawn-tree gate over REST.      Mirrors the in-proces
    participant P1589 as Close a target sub-agent via GET snapshot + PATCH metadata.      Mirro
    participant P1590 as Session metadata peek reads off the target's GET /v1/sessions/{id}.      :
    participant P1591 as Fetch a session's title + pending elicitations for peek output.      One snaps
    participant P1592 as Execute a tool and return the output string.      Pure execution — does NOT po
    participant P1593 as Publish a throttled session.changed_files.invalidated event.      Tells th
    participant P1594 as Execute a tool locally and PATCH the result to the harness.      :param runner
    participant P1595 as Return a defensive copy of an OSEnvSpec-like object.      Uses :func:dataclas
    participant P1596 as Return the cwd for a default runner-owned primary OSEnv.
    participant P1597 as Build the OSEnvSpec used by runner-local sys_os_* dispatch.      Precedence (p
    participant P1598 as Seed the diff snapshot with *path*'s current content before a write or edit.
    participant P1599 as Execute sys_os_* through a runner-local OSEnvironment.      :param tool_name:
    participant P1600 as Execute a REST-backed tool by calling server APIs.      Uses the /v1/session
    participant P1601 as Execute a file tool by calling session-scoped server file APIs.      :param to
    participant P1602 as Execute a terminal tool using the runner's TerminalRegistry.      :param runne
    participant P1603 as Emit a session.resource.{created,deleted} event for a terminal tool.
    participant P1604 as Build and publish session.resource.created for a fresh launch.      Looks
    participant P1605 as Build and publish session.resource.deleted for a closed terminal.      The
    participant P1606 as Runner-local dispatch for async inbox tools.      Backed by per-session asyn
    participant P1607 as Render a terminal-idle inbox item for sys_read_inbox.      :param payload:
    participant P1608 as Convert an inbox payload output to bounded text.      :param output: Raw paylo
    participant P1609 as Render a completed/failed/cancelled async-task inbox payload.      :param payl
    participant P1610 as Extract the child session id from a sub-agent inbox payload.      :param paylo
    participant P1611 as Return a fail-closed copy of a sub-agent inbox payload.      :param payload: O
    participant P1612 as Build the agent-meow policy-evaluation request for delayed child output.
    participant P1613 as POST delayed sub-agent output to agent-meow policy evaluation.      :param ser
    participant P1614 as Apply an agent-meow policy verdict to a sub-agent inbox payload.      :param p
    participant P1615 as Apply parent TOOL_RESULT policy to a delayed sub-agent payload.      :param pa
    participant P1616 as Remove terminal sub-agent work after its inbox item is drained.      :param pa
    participant P1617 as Non-blocking drain of the per-session inbox queue.      Returns formatted comp
    participant P1618 as Spawn a tool as a background asyncio.Task.      Returns a handle immediately.
    participant P1619 as Cancel an in-flight local async tool by handle id.      Signals the cancel_eve
    participant P1620 as Cancel an in-flight async tool by handle_id.      :param args: Must contain 
    participant P1621 as Runner-local handler for sys_cancel_task.      The generic cancel path fir
    participant P1622 as Cancel a running sub-agent worker, routing by the child's harness.      Only 
    participant P1623 as Auto-inject built-in platform skills for every agent-meow agent.      The bu
    participant P1624 as Runner-local handler for load_skill and read_skill_file.      Instanti
    participant P1625 as # NOTE: the server create route (_validated_harness_override in
    participant P1626 as build_native_relay_tool_schemas()
    participant P1627 as test_web_search_does_not_emit_web_search_preview_for_databricks_model()
    participant P1628 as test_client_tool_shadows_skill_tool()
    participant P1629 as test_session_send_schema_drops_named_mode_without_sub_agents()
    participant P1630 as test_local_tools_registered_and_callable()
    participant P1631 as _execute_local_python_tool()
    participant P1632 as test_native_relay_advertises_terminal_tools_per_spec_gate()
    participant P1633 as test_client_schemas_isolate_a_failing_tool()
    participant P1634 as test_session_get_info_schema_has_optional_session_id()
    participant P1635 as test_shutdown_closes_os_env()
    participant P1636 as test_shutdown_skips_pre_resolved_os_env()
    participant P1637 as test_client_tools_registered_in_schemas()
    participant P1638 as test_is_client_side_tool_returns_true_for_registered_client_tools()
    participant P1639 as test_spec_client_local_tool_schema_still_visible_to_llm()
    participant P1640 as test_spec_client_and_request_client_coexist()
    participant P1641 as test_async_enabled_true_registers()
    participant P1642 as test_timers_true_registers_both_tools_and_schemas()
    participant P1643 as Unit tests for sys_call_async (and the future async-inbox builtins added in
    participant P1644 as Single :class:SysCallAsyncTool instance — stateless, reusable.
    participant P1645 as The schema requires tool and args and rejects unknown     properties.
    participant P1646 as is_async returns True regardless of arguments — the whole     point of
    participant P1647 as dispatch_async fails loud after the DBOS removal.      The previous implem
    participant P1648 as Single :class:SysReadInboxTool instance — stateless, reusable.
    participant P1649 as The schema declares zero properties and rejects extras.      A regression that
    participant P1650 as is_async returns True regardless of arguments.      The drain reads fr
    participant P1651 as sys_read_inbox.dispatch_async fails loud after the DBOS removal.      The
    participant P1652 as Single :class:SysCancelAsyncTool instance — stateless, reusable.
    participant P1653 as SysCancelAsyncTool IS-A SysCancelTaskTool.      The subclass relations
    participant P1654 as Schema declares a single required handle_id string and     rejects extras.
    participant P1655 as With async_enabled=False the manager does NOT register     any of the async
    participant P1656 as With async_enabled=True (the default) the manager     registers all three a
    participant P1657 as sys_cancel_task (the generic, task_id-keyed cancel) is     always registere
    participant P1658 as Top-level async: true in config.yaml lands on     :attr:AgentSpec.async_en
    participant P1659 as Specs that don't mention async: default to     async_enabled=True.
    participant P1660 as Top-level async: false lands on     :attr:AgentSpec.async_enabled as Fa
    participant P1661 as test_native_relay_builtin_set_matches_toolmanager_gating()
    participant P1662 as test_declared_agents_grant_send_close_but_not_create()
    participant P1663 as test_both_grants_compose()
    participant P1664 as test_agent_read_tools_registered_for_every_agent()
    participant P1665 as test_shutdown_idempotent()
    participant P1666 as test_shutdown_calls_tool_shutdown()
    participant P1667 as test_spec_client_local_tool_in_get_client_tool_schemas()
    participant P1668 as test_local_tools_skipped_without_workdir()
    participant P1669 as test_async_enabled_false_does_not_register()
    participant P1670 as test_sys_cancel_task_always_registered_independently_of_async()
    participant P1671 as test_timers_false_does_not_register()
    participant P1672 as test_timers_independent_of_async_enabled()
    participant P1673 as Resolve public re-exports lazily on attribute access.      Importing one symbo
    participant P1674 as # NOTE: The tool decorator and ToolMetadata now live in the
    participant P1675 as Unit tests for sys_timer_set and sys_timer_cancel (step 10 of the harne
    participant P1676 as sys_timer_set requires seconds and rejects unknown     properties. re
    participant P1677 as sys_timer_cancel requires timer_id and rejects unknown     properties.
    participant P1678 as Both timer tools return is_async() == False.      The CALL is synchronous
    participant P1679 as Each malformed argument shape produces a structured {\"error\":     ...} resp
    participant P1680 as Malformed JSON produces a structured {\"error\": \"invalid     arguments: ...\"}
    participant P1681 as Valid args + ctx.conversation_id is None returns a structured     error (no
    participant P1682 as Missing timer_id returns {\"error\": \"timer_id is required\"}.      The t
    participant P1683 as Empty-string timer_id is rejected with the same error as a     missing key.
    participant P1684 as Malformed JSON produces a parse-error response on the cancel tool too.
    participant P1685 as With timers=False (the default) the manager does NOT     register either ti
    participant P1686 as With timers=True the manager registers both tools and     surfaces them in
    participant P1687 as The timers and async_enabled flags are independent — a     spec with 
    participant P1688 as test_registry_dispatches_to_load_skill()
    participant P1689 as test_registry_dispatches_to_read_skill_file()
    participant P1690 as test_registry_unknown_tool_returns_error()
    participant P1691 as test_schemas_include_load_skill_when_skills_exist()
    participant P1692 as test_schemas_include_read_skill_file_with_resources()
    participant P1693 as test_schemas_exclude_read_skill_file_without_resources()
    participant P1694 as test_schemas_empty_when_no_skills()
    participant P1695 as test_schemas_isolate_a_failing_tool()
    participant P1696 as test_session_reads_registered_but_writes_gated_without_opt_in()
    participant P1697 as test_spawn_flag_registers_write_tools_without_sub_agents()
    participant P1698 as test_share_non_public_registers_share_tool_without_public()
    participant P1699 as test_share_public_registers_share_tool_advertising_public()
    participant P1700 as test_shutdown_safe_without_start()
    participant P1701 as test_client_tools_none_equivalent_to_empty()
    participant P1702 as test_is_client_side_tool_true_for_spec_declared_client_local_tool()
    participant P1703 as test_is_client_side_tool_false_for_default_server_local_tool()
    participant P1704 as test_is_client_side_tool_false_for_unregistered_name()
    participant P1705 as test_client_tool_invalid_name_raises()
    participant P1706 as CodexAppServerClient
    participant P1707 as ExecutorAdapter
    participant P1708 as RetryableLLMError
    participant P1709 as SkillSourceContext
    participant P1710 as ChatOverrides
    participant P1711 as SessionsChat
    participant P1712 as CodexNativeAppServer
    participant P1713 as LLMErrorDetail
    participant P1714 as PermanentLLMError
    participant P1715 as SessionToolCallInfo
    participant P1716 as _SessionsChatReplAdapter
    participant P1717 as _FieldInputState
    participant P1718 as _FakeNamespace
    participant P1719 as _ApprovalState
    participant P1720 as _TurnProseTracker
    participant P1721 as load_providers()
    participant P1722 as _StartupHeader
    participant P1723 as TimedFormatter
    participant P1724 as _SlashCommandCompleter
    participant P1725 as _BangInputLexer
    participant P1726 as _TerminalInfo
    participant P1727 as _SessionSnapshot
    participant P1728 as _OutputItemRenderPlan
    participant P1729 as _ContextItems
    participant P1730 as _ApprovalVerdict
    participant P1731 as Rich-based REPL for agent-meow — built on the UI SDK framework.  The public AP
    participant P1732 as Return True when *exc* is a transient SSE transport interruption.      The
    participant P1733 as Minimal snapshot shape returned by client.sessions.      :param agent_id:
    participant P1734 as Return the persisted startup theme, or run the interactive picker.      On fir
    participant P1735 as Resolved data for the Claude-Code-style startup header box.      Built by :fun
    participant P1736 as Return the current working directory in ~-relative form.      :returns: Th
    participant P1737 as Return a compact one-line summary of an agent's description.      Collapses wh
    participant P1738 as Kind glyph for the startup header's credential labels.      The header drops t
    participant P1739 as Resolve the data for the startup header box + creds line.      Reads the merge
    participant P1740 as Build the ANSI-styled startup banner shown when the REPL boots.      Renders t
    participant P1741 as Best-effort server version for the header row, with a legacy fallback.      Tr
    participant P1742 as True if *url* points at a host other than loopback.      A local agent-meow
    participant P1743 as Convert an agent's wire name (from the YAML's name:     field) to the space
    participant P1744 as Shows final elapsed time after response completes.
    participant P1745 as How the user answered a policy approval prompt.      Three-way rather than boo
    participant P1746 as Classify a line of user input as one of the three verdicts.      Case-insensit
    participant P1747 as Per-REPL holder for pending approvals and the session     auto-approve cache.
    participant P1748 as Start with no pending approval and an empty cache.
    participant P1749 as Look up an earlier \"always\" decision.          Called by the approval hook BEF
    participant P1750 as Cache an \"approve always\" decision for the rest of the         session.
    participant P1751 as Start a new approval — create the future the hook awaits.          Records the
    participant P1752 as Resolve a pending approval with a three-way verdict.          On :attr:_Appro
    participant P1753 as Cancel any pending approval — refuse fail-closed.          Called on REPL tear
    participant P1754 as Collect free-form field values one at a time via the main input loop.      Sam
    participant P1755 as Delegate to the shared schema auto-fill utility.      See :func:~?agent_meow.
    participant P1756 as Build the on_elicitation_request hook for the REPL.      When the server e
    participant P1757 as Pick the session a parked elicitation's verdict must be POSTed to.      A sub-
    participant P1758 as Translate a server-shape ServerStreamEvent into an SDK-shape event.      :
    participant P1759 as Sessions-API adapter for the REPL.      Drives all server I/O through /v1/se
    participant P1760 as Wire the adapter; do NOT issue any HTTP calls.          :param client: The :cl
    participant P1761 as Refresh the local runner id from the recovery callback.          The callback
    participant P1762 as Keep a resumed session bound to a live local runner.          The CLI recovery
    participant P1763 as Set or clear the session-local LLM model override.          Before the session
    participant P1764 as Set or clear session reasoning effort.          Before the session exists, cac
    participant P1765 as Request explicit context compaction for the current session.          :raises
    participant P1766 as Copy mutable session fields from a sessions API snapshot.          :param sess
    participant P1767 as Lazily create the session and start the persistent stream.          Serialized
    participant P1768 as Invoke the session-start callback once after a session id is known.          :
    participant P1769 as Patch this session to the current registered runner.          The sessions API
    participant P1770 as Mark the runner recovery path healthy after a successful bind.          :retur
    participant P1771 as Render a runner recovery failure once per failure transition.          Backgro
    participant P1772 as Build the user-facing message for a recovery failure.          Server-declared
    participant P1773 as Return whether a recovery failure requires user action.          :param exc: F
    participant P1774 as Re-point the adapter at a different existing session.          Unbinds the run
    participant P1775 as Re-point the displayed session WITHOUT moving runner bindings.          Unlike
    participant P1776 as Stop the background stream pump and local tool tasks.          :returns: None.
    participant P1777 as Subscribe to /v1/sessions/{id}/stream indefinitely.          Subscribes to
    participant P1778 as Post a user message. Rendering is push-based via _on_event.          The p
    participant P1779 as Post a structured skill slash-command event.          The agent-meow server pe
    participant P1780 as Interrupt the running turn (if any).          Posts an {\"type\": \"interrupt\"}
    participant P1781 as Spawn a background task to execute a client-side tool.          Looks up the t
    participant P1782 as Route an elicitation through the hook and POST the verdict.          :param se
    participant P1783 as Prompt the user for each schema property via the main input loop.          Ret
    participant P1784 as Unbind the runner from session_id; soft-fail on old servers.          Forw
    participant P1785 as Legacy hook — no-op in sessions mode.          _attach_to_conversation cal
    participant P1786 as Tear down the current session so the next send() POSTs a fresh one.
    participant P1787 as Legacy hook — no-op in sessions mode.          Used by the REPL to seed prev
    participant P1788 as Switch the adapter to a different session in-place.          Cancels the exist
    participant P1789 as How the streaming renderer should handle one OutputItemDone item.      A s
    participant P1790 as Decide how to handle one streamed OutputItemDone item.      :param item_ty
    participant P1791 as Streamed assistant prose bookkeeping for duplicate-item detection.      The re
    participant P1792 as Accumulate one streamed text delta into the current segment.          :param d
    participant P1793 as Move the current segment into the committed list.          Called when in-flig
    participant P1794 as Drop all bookkeeping at a turn boundary.          A new turn's prose must not
    participant P1795 as Match an assistant message item against committed prose.          Joins th
    participant P1796 as Render the error line for a terminal session.status: failed event.      A
    participant P1797 as The entire REPL — using the framework.      :param client: Connected OmnigentC
    participant P1798 as Resolve the active conversation id from the session and write     its JSON dump
    participant P1799 as Clear visible content by scrolling it off screen.
    participant P1800 as Decorator to register a slash command.
    participant P1801 as Set reasoning effort on either legacy or sessions-backed chat.      The legacy
    participant P1802 as Show or set the session-level reasoning effort override.
    participant P1803 as Infer the harness whose active credential /model should describe.      The
    participant P1804 as Resolve the harness the /model readout should describe.      Prefers the s
    participant P1805 as Build the /model (no-arg) active-credential readout lines.      Renders on
    participant P1806 as Resolve *token* to a configured provider name, or None.      Matches case-
    participant P1807 as Resolve a configured provider's default model for /model <provider>.
    participant P1808 as Return a warning when *model* is not in the catalog, else None.      Valid
    participant P1809 as Show or set the session-level LLM model override.      No-arg shows the active
    participant P1810 as Tear down the current session; legacy mode falls back to sync reset().
    participant P1811 as Start a new conversation in place; the prior transcript stays on screen.
    participant P1812 as Clear the visible scrollback and start a new conversation.      The prior conv
    participant P1813 as Attach the current REPL session to an existing conversation     and re-render i
    participant P1814 as Fork the current session into a new session with copied items.      Creates a
    participant P1815 as Result of the conversation-item fetch for /context.      :param items: Con
    participant P1816 as Fetch conversation items for the current REPL session.      Mirrors the fetch
    participant P1817 as Return the effective prompt history represented by conversation items.      Ra
    participant P1818 as Re-sync client-side session metadata from a fresh server snapshot.      Fired
    participant P1819 as Update the toolbar context ring from a local token-count estimate.      Fallba
    participant P1820 as Build and emit the context-usage Rich tree to the terminal host.      When c
    participant P1821 as Request proactive context compaction for the current conversation.
    participant P1822 as Display context window usage for the current conversation.      Delegates item
    participant P1823 as Build a pre-filled GitHub new-issue URL for bug reports.
    participant P1824 as Create a zip bundle containing logs for the active REPL session.
    participant P1825 as Open a GitHub issue pre-filled with the current session context.
    participant P1826 as Fetch every item in *conv_id*, paginating past the     server's per-request 100
    participant P1827 as Decide whether the background loop should (re-)fetch the sub-agent tree.
    participant P1828 as Apply a child-session SSE event to the host's sub-agent registry.      Handles
    participant P1829 as Recursively fetch the sub-agent tree under *root_id* and push it into     the h
    participant P1830 as Enumerate the debug overview's sidebar targets.      Always yields a main
    participant P1831 as Walk every named conversation's items and aggregate live terminals.      Fetch
    participant P1832 as Inferred-live terminal reconstructed from conversation items.      Walking s
    participant P1833 as Encode a :class:_TerminalInfo as an :class:OverlayTarget     key the conten
    participant P1834 as Reverse :func:_terminal_target_key.      :param key: A target key, possibly
    participant P1835 as Decode a sys_terminal_launch / sys_terminal_close     function-call-out
    participant P1836 as Walk function-call/output pairs to infer the live terminal set.      Replays t
    participant P1837 as Spawn a fresh tmux window that attaches to *target*'s tmux session.      Bound
    participant P1838 as Build the shell command that attaches to *info*'s tmux session.      Matches t
    participant P1839 as Render the content panel for a terminal sidebar target.      Re-fetches the ow
    participant P1840 as Probe whether tmux has-session succeeds against *socket*.      Used by :fu
    participant P1841 as Capture the current visible tmux pane text for a terminal overview.      The C
    participant P1842 as Extract a sys_session_send handle dict from a function_call_output.      Nativ
    participant P1843 as Assemble the Ctrl+O debug overview for the REPL.      The overview intentional
    participant P1844 as Render one conversation item as an omnigent-style event.      Produces a heade
    participant P1845 as Render a message item as an agent-meow event.      Splits on role so the h
    participant P1846 as Extract tool name/arguments from a function_call item.      Sessions-API l
    participant P1847 as Index function_call items' tool metadata by call_id.      function_c
    participant P1848 as Index function_call items' tool names by call_id.      function_call
    participant P1849 as Normalize a function_call.arguments field to a dict.      The agent-meow A
    participant P1850 as Concatenate input_text / output_text content blocks     in a message it
    participant P1851 as Pull the textual output payload out of a     function_call_output item, acc
    participant P1852 as Render a type=\"message\" item.      User messages emit via :meth:RichBlock
    participant P1853 as Render a type=\"function_call\" item as the live     ⏵ <name>(<args>) lin
    participant P1854 as Render a type=\"function_call_output\" item as the live     result panel.
    participant P1855 as Render a type=\"reasoning\" item as the live thinking     panel.      sum
    participant P1856 as Consume a matching locally echoed skill slash command.      The command handle
    participant P1857 as Render a type=\"slash_command\" item as a compact command echo.      Skill s
    participant P1858 as Render a single conversation history item using the same     visual primitives
    participant P1859 as Auto-register each discovered skill as a REPL slash command.      For every :c
    participant P1860 as Remove previously registered skill commands from the global registry.
    participant P1861 as Suggest registered slash commands as the user types.      Trigger conditions a
    participant P1862 as Yield :class:Completion entries matching the current input.          :param
    participant P1863 as Color the composer green while the current line is a \"!\" shell command.      A
    participant P1864 as Argv to run cmd via the platform shell.      POSIX: $SHELL -c <cmd> (f
    participant P1865 as If cmd is a standalone cd (no shell operators), return the     resolved
    participant P1866 as Clip text to limit chars, keeping head + tail with a marker.
    participant P1867 as Build the model-facing block for a \"!\" command: ANSI stripped, capped,     with
    participant P1868 as Run cmd in the user's shell, render its output, and return a     model-faci
    participant P1869 as Dispatch a slash command from the registry.      :param line: Raw user input l
    participant P1870 as # NOTE: keep this list short enough that the bottom toolbar
    participant P1871 as :returns: True iff an approval is awaiting a verdict.
    participant P1872 as :returns: True if collection was cancelled mid-prompt.
    participant P1873 as The durable session id once :meth:send has run at least once.          Expos
    participant P1874 as Return the agent's human-readable name.          :returns: The agent name, e.g
    participant P1875 as Most recent response.created id observed on the SSE stream.          Updat
    participant P1876 as Whether a turn is currently being streamed.          :returns: True while
    participant P1877 as Per-session reasoning-effort hint.          Reads the locally cached value; th
    participant P1878 as Current per-session LLM model override, or None for the         agent spec
    participant P1879 as LLM model identifier from the bound agent's spec.          Populated from the
    participant P1880 as The bound agent's canonical harness, e.g. \"openai-agents\".          Popula
    participant P1881 as Context window size in tokens for the bound agent's LLM.          Populated fr
    participant P1882 as ContextWindowExceededError
    participant P1883 as _StreamScript
    participant P1884 as _get_session_snapshot()
    participant P1885 as _AgentToolsGetter
    participant P1886 as _StreamHookState
    participant P1887 as _FilesUploader
    participant P1888 as _FilesGetter
    participant P1889 as _HarnessMenuRow
    participant P1890 as _FakeAgentToolsGetter
    participant P1891 as _parse_guardrails()
    participant P1892 as Sessions-API-native chat helper.  A higher-level wrapper over :class:omnigent
    participant P1893 as Context passed to a client-side tool callable.      Distinct from the legacy
    participant P1894 as Protocol for the agent-tools fetcher injected into :class:SessionsChat.
    participant P1895 as Fetch the tool list for an agent.          :param agent_id: Durable agent iden
    participant P1896 as Per-subscription hook bookkeeping.      Sessions streams are long-lived and ev
    participant P1897 as Sessions-API-native chat helper bound to a single durable session.      Usage
    participant P1898 as Wire the chat helper around an already-created session.          Prefer :meth:
    participant P1899 as Fetch a fresh snapshot from the server and update internal state.          Cal
    participant P1900 as Whether any sub-agent anywhere in this session's subtree is working.
    participant P1901 as Post a user message to the session and yield typed events for the turn.
    participant P1902 as Check tool_callables against the agent's spec-declared tools.          Ide
    participant P1903 as If the event carries a client-side tool call, run it and post the result.
    participant P1904 as Interrupt the running turn (if any).          Convenience wrapper over :meth:
    participant P1905 as Low-level: post an arbitrary event into the session.          Most callers wan
    participant P1906 as Subscribe to the live SSE stream for this session.          Like :meth:send,
    participant P1907 as Translate sessions SSE events into public StreamHooks callbacks.
    participant P1908 as Fire on_response_start once for a response id.          Some older session
    participant P1909 as Fire on_reasoning_end if a reasoning block is currently open.
    participant P1910 as Fire hooks derived from a completed output item.
    participant P1911 as Route a sessions elicitation through on_elicitation_request.          No r
    participant P1912 as Send a turn and collect (or stream) the assistant's text output.          Non-
    participant P1913 as Collect the next auto-triggered turn without posting a message.          Used
    participant P1914 as Drain :meth:send and assemble a :class:QueryResult.          Concatenates
    participant P1915 as Build a :class:QueryStream whose chunk iterator is backed by :meth:send.
    participant P1916 as Async generator that yields text deltas and side-effects file fetches.
    participant P1917 as Resolve a :class:File from an :class:OutputFileDoneEvent.          :param
    participant P1918 as Normalize input + files into a content-block list.          Accepts ei
    participant P1919 as Protocol for the file-upload callable injected into :class:SessionsChat.
    participant P1920 as Upload a local file and return its server-side :class:File.          :param
    participant P1921 as Protocol for the file-fetch callable injected into :class:SessionsChat.
    participant P1922 as Fetch a file's metadata by id.          :param file_id: Server-issued file ide
    participant P1923 as Convert a server schema ResponseObject into the SDK dataclass.      Sessio
    participant P1924 as Call a hook (sync or async) and return its result.
    participant P1925 as Invoke an elicitation hook, declining fail-closed on absence/error.
    participant P1926 as Best-effort argument parsing for hook context.      Hook callbacks are observe
    participant P1927 as Parse an action_required function_call item into a typed info object.
    participant P1928 as Invoke a tool callable (sync or async) and validate its return.      Uses :fun
    participant P1929 as Extract assistant text from a streamed output_item.done item.      Some ha
    participant P1930 as Extract assistant text from a terminal response snapshot.      Used as a fallb
    participant P1931 as Extract text from an assistant message content list.      :param raw_conte
    participant P1932 as Return the set of names for tools whose spec runtime is client.      Reads
    participant P1933 as Build the ValueError message for a tool_callables mismatch.      Names bot
    participant P1934 as Close an async generator iterator returned by :meth:SessionsNamespace.stream.
    participant P1935 as _HostDaemonRecord
    participant P1936 as Create a new server-side session and return a chat helper bound to it.
    participant P1937 as The durable session identifier this helper is bound to.          :returns: The
    participant P1938 as The bound agent's durable identifier.          :returns: The agent id, e.g. 
    participant P1939 as Last-known session status from the most recent snapshot.          Note: this i
    participant P1940 as require_json_object()
    participant P1941 as _HostHttpResult
    participant P1942 as _SessionPagesResult
    participant P1943 as agent_spec_to_agent_def()
    participant P1944 as _GatedReadyNamespace
    participant P1945 as _FakeGetter
    participant P1946 as _HostGroup
    participant P1947 as Shared adapter that wraps any inner :class:Executor instance as a :class:Har
    participant P1948 as Strip the Claude SDK MCP tool prefix from a tool name.      The Claude SDK nam
    participant P1949 as :class:HarnessApp subclass that drives any inner     :class:Executor instan
    participant P1950 as Drive the inner executor and translate its events.          Lazily constructs
    participant P1951 as Cancel the turn AND drop the inner executor session.          The base handler
    participant P1952 as Loop forwarding ctx.next_injection to the inner SDK.          Polls :meth:
    participant P1953 as Cached bridge the inner SDK keeps over the lifetime of         the executor ins
    participant P1954 as Cached bridge the inner SDK keeps over the executor's lifetime.          Calle
    participant P1955 as Cached bridge the inner executor keeps over its lifetime.          Called by t
    participant P1956 as Construct the inner executor on first use; return cached         instance there
    participant P1957 as Translate one inner :class:ExecutorEvent into agent-meow SSE         events e
    participant P1958 as Map an inner-executor exception onto a contract-recognized         error code.
    participant P1959 as Release the inner executor's resources on subprocess         shutdown.
    participant P1960 as Map an OpenAI SDK exception onto the agent-meow semantic code allowlist.
    participant P1961 as Map a :mod:claude_agent_sdk exception onto the agent-meow semantic     code a
    participant P1962 as Map an :mod:httpx exception onto the agent-meow semantic code allowlist.
    participant P1963 as Map an :mod:anthropic SDK exception onto the agent-meow semantic     code all
    participant P1964 as Map any inner-SDK exception onto the agent-meow semantic code allowlist.
    participant P1965 as Flatten OpenAI Chat-Completions tool schemas to inner shape.      agent-meow e
    participant P1966 as Round-trip one tool call through ctx.dispatch_tool.      JSON-encodes *arg
    participant P1967 as Extract the last user message text from a request input.      Handles both con
    participant P1968 as Pull plain-text content from a steering injection's input.      Used by :meth:
    participant P1969 as Convert :class:CreateResponseRequest.input into inner     :class:Message li
    participant P1970 as Pull role-keyed message items out of an agent-meow input list.      Looks
    participant P1971 as Normalize Responses API message content for inner executors.      When the
    participant P1972 as JSON-encode a tool-call arguments dict.      :param args: The arguments dict f
    participant P1973 as Stringify a :class:ToolCallComplete for the     function_call_output's outp
    participant P1974 as Coerce a tool's result payload into a string.      See :func:_serialize_tool_
    participant P1975 as Extract a call_id from an executor's per-call metadata dict.      Different in
    participant P1976 as _FakeUploader
    participant P1977 as get_default_provider()
    participant P1978 as _FirstRunPlan
    participant P1979 as _OmnigentCLI
    participant P1980 as _HostSessionsTableWidths
    participant P1981 as _DaemonSessionsResult
    participant P1982 as _SessionsPageResult
    participant P1983 as _SpawnedDaemonProcess
    participant P1984 as _DaemonReuseDecision
    participant P1985 as _CliRunnerProcess
    participant P1986 as _LLMDeploy
    participant P1987 as _BuiltinEntry
    participant P1988 as _ToolsDeploy
    participant P1989 as _ExecutorDeploy
    participant P1990 as _DeployConfig
    participant P1991 as _ResumeChoice
    participant P1992 as _ConfigGroup
    participant P1993 as _ResolveElicitationCall
    participant P1994 as _AgentToolsCall
    participant P1995 as _resolve_provider_for_build()
    participant P1996 as parse()
    participant P1997 as _PostEventCall
    participant P1998 as _UploaderCall
    participant P1999 as _GetterCall
    participant P2000 as _ConversationStore
    participant P2001 as CLI entry point for agent_meow.
    participant P2002 as Load and return config from a YAML file.     Returns an empty dict if no path i
    participant P2003 as Return Uvicorn logging config with request-duration access logs.      Uvicorn
    participant P2004 as One-time relocation of a pre-rename state directory to ~/.agent-meow.
    participant P2005 as Return the path to the user-level agent-meow config.      :returns: $OMNIGEN
    participant P2006 as Format a filesystem path for display, collapsing the home prefix to ~.
    participant P2007 as Format a config path for display, collapsing the home prefix to ~.      Th
    participant P2008 as Load the global agent-meow config from ~/.agent_meow/config.yaml.      Ret
    participant P2009 as Load the project-level config from .agent_meow/config.yaml in cwd.      Re
    participant P2010 as Merge global and project-level config.      Precedence (highest last): global
    participant P2011 as Return the canonical harness declared by a default-agent YAML, or None.
    participant P2012 as The harness + optional default agent a bare run should launch.      Derive
    participant P2013 as Return the filesystem path to a bundled example agent directory.      Located
    participant P2014 as Pick the harness a bare first run should launch, by configured creds.
    participant P2015 as Resolve the harness + default agent for a bare agent-meow run.      Adopts
    participant P2016 as Decide the run target when no AGENT was passed on the command line.      -
    participant P2017 as Parse a boolean value from YAML or agent-meow config KEY=VALUE.      :para
    participant P2018 as Resolve the explicit auto_open_conversation config value, if set.      Tri
    participant P2019 as Resolve whether CLI launches should open conversation URLs.      Defaults to 
    participant P2020 as Merge *settings* into ~/.agent_meow/config.yaml and remove any     keys lis
    participant P2021 as Copy a single bundled example YAML into the user config dir.      uv tool in
    participant P2022 as Materialize every bundled internal-beta example and return the default's path.
    participant P2023 as Merge *settings* into .agent_meow/config.yaml in cwd and remove     any key
    participant P2024 as Default DB URI for agent-meow server — the machine-global     <data_dir>/
    participant P2025 as Default artifact dir for agent-meow server — <data_dir>/artifacts.
    participant P2026 as Create the parent directory of a SQLite DB file if it's missing.      SQLite c
    participant P2027 as Interactively claim the first admin on a TTY when setup is pending.      The \"
    participant P2028 as Create an artifact store based on the location URI scheme.      dbfs:/Volume
    participant P2029 as Register an agent from a directory or standalone YAML file.      Materializes
    participant P2030 as Render the version line shown by --version and version.      Always in
    participant P2031 as Click callback that lazily renders the version line and exits.      We deliber
    participant P2032 as Top-level group that prints the brand lockup above its help.      The Otto + w
    participant P2033 as Decide whether the update notice should be suppressed for *argv*.      Skipped
    participant P2034 as Console-script entry point for agent-meow.      Dispatches to the click CL
    participant P2035 as Return True when *argv* looks like agent-meow <target> [opts]     where *ta
    participant P2036 as Return whether *value* is a server URL.      :param value: CLI argument value,
    participant P2037 as Decide whether *argv* targets the removed top-level ad-hoc chat.      True whe
    participant P2038 as Local registry record for one background host daemon.      :param pid: Process
    participant P2039 as Decoded agent-meow management HTTP response.      :param status_code: HTTP sta
    participant P2040 as Column widths for one host status sessions table.      :param session_id: Widt
    participant P2041 as Sessions fetched for one daemon target.      :param base_url: agent-meow serve
    participant P2042 as Decoded sessions page.      :param sessions: Session rows returned by the page
    participant P2043 as Accumulated sessions from a paginated query.      :param sessions: Session row
    participant P2044 as Background host daemon process metadata.      :param pid: Spawned process id,
    participant P2045 as Normalize a daemon target key.      :param server_url: Requested agent-meow se
    participant P2046 as Probe whether a daemon's host is currently online on its server.      A daemon
    participant P2047 as Return the directory containing per-target daemon registry records.      Tests
    participant P2048 as Return the registry JSON path for *target*.      :param target: Normalized dae
    participant P2049 as Parse a daemon record from decoded JSON.      :param raw: Decoded JSON object,
    participant P2050 as Read a daemon registry record from disk.      :param path: JSON file path to r
    participant P2051 as Persist a daemon registry record.      :param record: Record to write, e.g. a
    participant P2052 as Delete a daemon registry record if it exists.      Removes the per-target JSON
    participant P2053 as Build a daemon record from the legacy host.pid file.      :returns: Legacy
    participant P2054 as List daemon registry records.      :param include_legacy: When True, inclu
    participant P2055 as Find a daemon record by target.      :param target: Normalized daemon target,
    participant P2056 as Record the concrete agent-meow server URL served by a daemon target.      :par
    participant P2057 as Load the existing local host id without creating one.      :returns: Host id f
    participant P2058 as Return whether a daemon's host tunnel is (or quickly becomes) online.      Pro
    participant P2059 as Return whether a daemon record belongs to a different current host id.      A
    participant P2060 as Tear down a daemon and, in local mode, the agent-meow server it owns.      The
    participant P2061 as Outcome of evaluating whether an existing daemon can be reused.      :param re
    participant P2062 as Decide whether an existing daemon for *target* can be reused.      Reuse requi
    participant P2063 as Check whether the local daemon already serves a requested URL target.      :pa
    participant P2064 as Spawn the background host daemon and attach its log file.      :param args: Pr
    participant P2065 as Persist registry and legacy pidfile entries for a spawned daemon.      :param
    participant P2066 as Build the registry record for the current foreground host process.      :param
    participant P2067 as Find a live daemon that already serves a foreground record target.      :param
    participant P2068 as Persist a foreground daemon record unless a live duplicate exists.      :param
    participant P2069 as Restore the record replaced by a foreground host process.      If another proc
    participant P2070 as Load or create the host id used by a foreground host process.      :returns: H
    participant P2071 as Start or reuse a host daemon for one target.      :param server_url: agent-meo
    participant P2072 as Build the environment for the background host daemon.      Remote daemons conn
    participant P2073 as Read the host daemon PID file (two lines: PID and server URL).      :returns:
    participant P2074 as Check whether the local-mode host daemon is still alive.      :returns: True
    participant P2075 as Sign in (or fail with the login hint) for Databricks-fronted servers.      Pro
    participant P2076 as Ensure the host daemon is running and return the agent-meow server URL.      T
    participant P2077 as Tell the user the server was restarted in a new mode, then exit clean.      Th
    participant P2078 as Poll until the daemon-started local agent-meow server is reachable.      In lo
    participant P2079 as Runner subprocess metadata for the agent-meow server command.      :param
    participant P2080 as Start the out-of-process runner used by CLI server flows.      The runner alwa
    participant P2081 as Stop a runner subprocess started by :func:_start_cli_runner_process.      :p
    participant P2082 as Fail before app startup when the requested TCP listener cannot bind.      Mirr
    participant P2083 as Start the agent-meow server in the foreground, or manage the background server.
    participant P2084 as Stop the background agent-meow server and the local host daemon that owns it.
    participant P2085 as Ensure the managed background agent-meow server is running.      Reuses a heal
    participant P2086 as Stop the background agent-meow server and the local host daemon.      Stops th
    participant P2087 as Show whether the background agent-meow server is running.      Reports the rec
    participant P2088 as Stop everything agent-meow is running on this machine.      The off switch: st
    participant P2089 as Count sessions actively running a turn on the local server.      Gates on the
    participant P2090 as Block until no local session is actively running a turn.      Used by omni u
    participant P2091 as Drain (or force-stop) the local server + daemon before an upgrade.      Shared
    participant P2092 as Update a git/VCS omni install by re-pulling its tracked ref.      A git in
    participant P2093 as Upgrade the agent-meow CLI to the latest release on PyPI.      Detects how age
    participant P2094 as Produce a tar.gz bundle from a directory or standalone     agent-meow YAML file
    participant P2095 as Expand ${VAR} references in YAML files that contain     secrets, using the
    participant P2096 as Pydantic model for the llm: block during deploy-time     env var expansion.
    participant P2097 as Pydantic model for a single dict entry in     tools.builtins during deploy-
    participant P2098 as Pydantic model for the tools: block during deploy-time     env var expansio
    participant P2099 as Pydantic model for the executor: block during deploy-time     env var expan
    participant P2100 as Pydantic model for the top-level config.yaml structure     during deploy-time e
    participant P2101 as Expand ${VAR} references in-place in a parsed     config.yaml dict. Ret
    participant P2102 as Expand ${VAR} references in dict entries of     tools.builtins, modifyi
    participant P2103 as Fail a native (tmux/PTY) harness command with an actionable message.      The
    participant P2104 as Launch Claude Code in an agent-meow terminal.      \b     Examples:       ag
    participant P2105 as Launch Codex TUI in an agent-meow terminal.      \b     Examples:       agen
    participant P2106 as Launch OpenCode TUI in an agent-meow terminal.      \b     Examples:       a
    participant P2107 as Launch Pi TUI in an agent-meow terminal.      \b     Examples:       agent-m
    participant P2108 as Return the canonical brain harness of a bundled agent, or None.      Reads
    participant P2109 as Ensure the bundled agent's brain harness has a credential to launch with.
    participant P2110 as Launch the Cursor TUI in an agent-meow terminal.      \b     Examples:
    participant P2111 as Launch the Kiro TUI in an agent-meow terminal.      \b     Examples:       a
    participant P2112 as Reject Kiro-owned resume flags in passthrough args.
    participant P2113 as Build mapped Kiro CLI args for the runner-owned terminal launch.
    participant P2114 as Launch the Goose TUI in an agent-meow terminal.      \b     Examples:
    participant P2115 as Launch the Hermes TUI in an agent-meow terminal.      \b     Examples:
    participant P2116 as Launch the Antigravity (agy) TUI in an agent-meow terminal.      \b     Examp
    participant P2117 as Launch the qwen (Qwen Code) TUI in an agent-meow terminal.      \b     Exampl
    participant P2118 as Forward a bundled-agent subcommand to run on its packaged path.      Imple
    participant P2119 as Launch polly, the bundled multi-agent coding orchestrator.      Shorthand for
    participant P2120 as Launch debby, the bundled two-headed brainstorming agent.      Shorthand for 
    participant P2121 as Launch the Kimi Code TUI in an agent-meow terminal.      Boots Moonshot AI's i
    participant P2122 as Resume an agent-meow conversation, auto-dispatching by runtime.      \b     W
    participant P2123 as Fail fast when *harness* is not a supported agent-meow harness.      :param ha
    participant P2124 as Return the lightweight generated-agent instructions for *harness*.      :param
    participant P2125 as Create a temporary standalone agent-meow YAML for no-AGENT run.      The g
    participant P2126 as Return the no-AGENT run guidance shown on missing input.
    participant P2127 as Outcome of parsing the click --resume option value.      Named fields rath
    participant P2128 as Translate the click --resume option value into the internal     resume_pi
    participant P2129 as Build the flag-preserving prefix for the resume command from Click's     parsed
    participant P2130 as Launch a *-native terminal harness via its TUI wrapper directly.      ru
    participant P2131 as Reject run AGENT --harness <x>-native: native harnesses own their TUI.
    participant P2132 as Route agent-meow run to the right impl.      The click path always drives
    participant P2133 as Resolve the agent-meow server URL attach should join.      Resolution orde
    participant P2134 as Fail loud unless *conversation_id* is reachable on *base_url*.      attach
    participant P2135 as Attach the REPL to a LIVE session — never starts anything.      attach is
    participant P2136 as Start a session with an agent-meow agent.      AGENT may be an agent YAML file
    participant P2137 as host group that accepts a server URL as a positional argument.      agen
    participant P2138 as Redirect a leading URL-like positional into --server.          agent-meo
    participant P2139 as Rewrite a leading URL-like positional into an explicit --server.
    participant P2140 as Return whether a token may be used as positional host server.          The
    participant P2141 as Ask whether to also stop the detached local agent-meow server after exit.
    participant P2142 as Register this machine as a host with a server.      \b     Examples:       a
    participant P2143 as Read a group-level agent-meow host option for a subcommand.      :param ct
    participant P2144 as Resolve a host-management server from CLI or config.      :param server: Expli
    participant P2145 as Resolve the agent-meow server URL for a daemon record.      :param record: Dae
    participant P2146 as Select daemon records for a host-management command.      :param server: Expli
    participant P2147 as Send one management request to an agent-meow server.      :param base_url: age
    participant P2148 as Extract a concise error string from an agent-meow response body.      :param b
    participant P2149 as Build query parameters for one sessions page.      :param connected_only: When
    participant P2150 as Decode one GET /v1/sessions response page.      :param result: HTTP result
    participant P2151 as Fetch every available session page from a server.      :param base_url: agent-
    participant P2152 as Fetch sessions owned by a daemon's host id.      :param record: Daemon record
    participant P2153 as Resolve live runner connectivity for sessions.      :param base_url: agent-meo
    participant P2154 as Add runner_online to session rows.      :param base_url: agent-meow server
    participant P2155 as Build daemon metadata for status output.      :param record: Daemon registry r
    participant P2156 as Add host status or host status error to a daemon payload.      :param payload:
    participant P2157 as Add owned sessions and runner connectivity to a daemon payload.      :param pa
    participant P2158 as Build a display payload for one daemon.      :param record: Daemon registry re
    participant P2159 as Build the Rich console used by host management output.      :returns: A :class
    participant P2160 as Build a host CLI table with the shared style.      :param title: Table title,
    participant P2161 as Convert optional payload values into display text.      :param value: Payload
    participant P2162 as Shorten long daemon, session, and runner identifiers for terminal display.
    participant P2163 as Truncate long text from the right for compact terminal display.      :param te
    participant P2164 as Escape dynamic values before embedding them in Rich markup.      :param text:
    participant P2165 as Build a compact daemon target label.      :param payload: Payload from :func:
    participant P2166 as Pick a Rich style for a daemon, host, or session status.      :param value: St
    participant P2167 as Return a display state for the session's bound runner.      :param session: Se
    participant P2168 as Compute compact sessions table widths for the available terminal space.      :
    participant P2169 as Render one daemon's owned sessions as a compact table.      :param console: Ri
    participant P2170 as Render host status as one block per daemon target.      :param payloads: Paylo
    participant P2171 as Inspect host daemon, runner, and session status.      :param ctx: Click contex
    participant P2172 as Stop one agent-meow session via the server lifecycle event API.      :param ba
    participant P2173 as Stop sessions owned by a daemon before terminating it.      :param record: Dae
    participant P2174 as Terminate one local daemon process.      :param record: Daemon record whose pr
    participant P2175 as Stop host daemon sessions, then stop daemon processes.      :param ctx: Click
    participant P2176 as Stop specific sessions without stopping a daemon.      :param ctx: Click conte
    participant P2177 as Print the installed agent-meow version.
    participant P2178 as Parse and validate KEY=VALUE pairs from the config command.      Raise
    participant P2179 as Validate keys passed to --unset against _GLOBAL_CONFIG_KEYS.      Rais
    participant P2180 as Print the effective CLI defaults (user + project-level).      The KEY=VALUE
    participant P2181 as config group that nudges the pre-split flat form to the subcommands.
    participant P2182 as Intercept the legacy flat form before normal group parsing.          :param ct
    participant P2183 as Get, set, and view agent-meow defaults and credentials.      Defaults (auto_op
    participant P2184 as List the effective defaults and configured credentials.      Prints the defaul
    participant P2185 as Set one or more agent-meow defaults.      Without --global, pairs are writ
    participant P2186 as Remove one or more agent-meow defaults.      :param is_global: When True,
    participant P2187 as Return the node --version string (e.g. v20.12.2) or None.      Use
    participant P2188 as Return a one-line problem if Node is missing or too old, else None.      T
    participant P2189 as Run Databricks setup against a temp config containing only our three profiles.
    participant P2190 as Configure coding harnesses to use Databricks Unity AI Gateway.      Shells out
    participant P2191 as Warn about external (non-Python) tools the coding harnesses need.      Surface
    participant P2192 as Return the name of a key provider on *family* using *api_key_ref*.      Tw
    participant P2193 as Return *candidate*, suffixed numerically until it's a free provider name.
    participant P2194 as Pick the entry name for an API key being added — update vs keep-both.      Rea
    participant P2195 as A short, non-secret descriptor of where a key's secret comes from.      Used t
    participant P2196 as Count the key providers serving *family*.      The ($VAR) disambiguati
    participant P2197 as A credential label, qualified with its source when keys would collide.      Wr
    participant P2198 as Run the interactive add a provider flow and persist the entry.      Prompt
    participant P2199 as Persist ambient-detected providers into the config, returning new names.
    participant P2200 as Backfill a databricks providers entry from an existing global auth: block.
    participant P2201 as A short, brand-qualified label for an auto-configured credential.      Unlike
    participant P2202 as Print the \"found existing credentials → auto-configured\" callout.      Re-runs
    participant P2203 as Self-heal config, adopt ambient credentials, and announce what was added.
    participant P2204 as One selectable row in a harness's provider-management menu (level 2).      :pa
    participant P2205 as A friendly, jargon-free label for a configured credential.      A logged-in CL
    participant P2206 as Build the level-2 rows: each credential serving *family*, then + Add.
    participant P2207 as Offer to install an uninstalled harness CLI; return whether to proceed.      S
    participant P2208 as Run the level-2 loop for one harness: pick a credential or add one.      Selec
    participant P2209 as Offer to install the missing cursor extra; return a status line.      Show
    participant P2210 as Run the level-2 loop for Cursor: manage its CURSOR_API_KEY.      Cursor ru
    participant P2211 as Prompt for and store a Cursor CURSOR_API_KEY; return a status line.      O
    participant P2212 as Offer to install the missing antigravity extra; return a status line.
    participant P2213 as Run the level-2 loop for Antigravity: set / replace / remove its Gemini key.
    participant P2214 as Prompt for and store a Gemini API key; return a status line.      Offers an ex
    participant P2215 as Best-effort check whether Qwen Code can authenticate non-interactively.      Q
    participant P2216 as Print Qwen's authentication options (it has no qwen login).
    participant P2217 as Launch the interactive qwen TUI so the user can run /auth.      The 
    participant P2218 as Run the level-2 loop for Qwen Code: install the CLI and guide auth setup.
    participant P2219 as Print Goose's configuration options (agent-meow manages no Goose credential).
    participant P2220 as Launch the interactive goose configure flow; return a status line.      
    participant P2221 as Run the level-2 loop for Goose: ensure the CLI, then guide goose configure.
    participant P2222 as Run the level-2 loop for Hermes: ensure the CLI is installed.      Hermes owns
    participant P2223 as Run the level-2 loop for Kiro: ensure the CLI is installed and signed in.
    participant P2224 as Print Kimi Code's authentication options.      Kimi authenticates against Moon
    participant P2225 as Run the level-2 loop for Kimi Code: install the CLI and drive kimi login.
    participant P2226 as Offer to install the missing copilot extra; return a status line.      Sho
    participant P2227 as Run the level-2 loop for Copilot: manage its GitHub token.      Copilot runs v
    participant P2228 as Prompt for and store a Copilot GitHub token; return a status line.      Offers
    participant P2229 as Run the level-3 loop for one credential: make default / remove.      Opened by
    participant P2230 as Sign out of the harness CLI and remove the subscription credential.      Unlik
    participant P2231 as Remove a databricks provider and clean up ucode's harness wiring.      A kin
    participant P2232 as Make *provider* the default for *family* and persist wholesale.      :param pr
    participant P2233 as Drop *name* from the persisted dismissed_detections list, if present.
    participant P2234 as Remove the *provider* credential and persist wholesale.      The stored secret
    participant P2235 as Launch interactive opencode auth login; return a post-login status.      
    participant P2236 as Show opencode auth list (stored credentials + detected env providers).
    participant P2237 as Return the provider/model ids OpenCode can launch (opencode models).
    participant P2238 as Pick OpenCode's default model and persist it as opencode_model.      The c
    participant P2239 as Explain where OpenCode's model credentials come from.
    participant P2240 as Run the level-2 drill-in for OpenCode: ensure the CLI, then manage providers.
    participant P2241 as Run the interactive model/credential three-level picker.      Invoked by age
    participant P2242 as Launch the agent-meow first-time setup flow.      By default this runs the sta
    participant P2243 as Internal maintenance commands (advanced — not needed for normal use).      Hou
    participant P2244 as Upgrade the schema of an agent-meow tracking database to the     latest support
    participant P2245 as Remap user identities when switching the accounts provider to OIDC.      The a
    participant P2246 as Whether a /api/2.0/agent-meow mount probe answered like agent_meow.      :
    participant P2247 as Best-effort bearer for *workspace_host* from the OAuth cache.      Unlike :fun
    participant P2248 as Prepend a scheme to a schemeless server URL, defaulting to https.      The int
    participant P2249 as Expand a bare Databricks workspace URL to its agent-meow API base.      http
    participant P2250 as Normalize a user-supplied --server value to the agent-meow API base.
    participant P2251 as Return the workspace host when *server* sits behind Databricks auth.      Reco
    participant P2252 as Extract the ?o=<workspace-id> workspace selector from *url*.      A Databr
    participant P2253 as Append the ?o=<org> workspace selector to *workspace_host*.      databri
    participant P2254 as Log in to a Databricks-fronted agent-meow server.      Covers both Databricks
    participant P2255 as Run the browser login for a workspace and mint a bearer from it.      :param w
    participant P2256 as Run databricks auth login --host <workspace> (browser flow).      :param w
    participant P2257 as Probe GET /v1/me on *server* with a workspace bearer.      :param server:
    participant P2258 as Mint a bearer for a workspace from the host-keyed OAuth cache.      :param wor
    participant P2259 as Persist *server* as the user-level default after a successful login.      A ba
    participant P2260 as Authenticate with a remote agent-meow server.      Probes the server's auth mo
    participant P2261 as Run the accounts-mode login flow: prompt + POST /auth/login.      No browser,
    participant P2262 as Split the parent agent-meow pane and run the chooser in the new pane.      Int
    participant P2263 as Launch a fresh REPL conversation in the current new pane.      Internal subcom
    participant P2264 as Return *argv* with all resume-related flags removed.      Handles three flag s
    participant P2265 as Return *argv* with one-shot conversation flags     (-p/--prompt/--sys
    participant P2266 as # NOTE: the host daemon + agent-meow server are ensured inside run_chat's
    participant P2267 as _create_session_from_existing_agent()
    participant P2268 as Return a migration hint for a legacy first token, else None.          :par
    participant P2269 as Unit tests for :class:omnigent_client._sessions_chat.SessionsChat.  These ex
    participant P2270 as Single recorded post_event call.      :param session_id: The session id pa
    participant P2271 as Single recorded resolve_elicitation call.      :param session_id: Session
    participant P2272 as Scripted reply for one stream() invocation.      :param events: Events to
    participant P2273 as Drop-in replacement for :class:SessionsNamespace.      Subclasses :class:Se
    participant P2274 as Fake namespace whose stream has an explicit ready gate.      The real Sessions
    participant P2275 as Create the gated-ready namespace fake.          :param session_obj: Session re
    participant P2276 as Publish visible events only when the stream is already open.          :param s
    participant P2277 as Mark the stream open only when the returned iterator is advanced.          :pa
    participant P2278 as Yield each pre-built event in order.      :param events: Events to replay.
    participant P2279 as Single recorded file-upload invocation.      :param path: Local path passed to
    participant P2280 as Real stub class for the files_uploader callable.      Returns a synthesize
    participant P2281 as Record the call and synthesize a deterministic :class:File.          :param
    participant P2282 as Single recorded file-fetch invocation.      :param file_id: File id passed to
    participant P2283 as Real stub class for the files_getter callable.      Returns a synthesized
    participant P2284 as Build a :class:Session snapshot for use as the fake namespace's     canned re
    participant P2285 as Build a real :class:CompletedEvent for terminating a turn.      :param respo
    participant P2286 as Build a real :class:CreatedEvent for lifecycle hook tests.      :param respo
    participant P2287 as SessionsChat must expose the same lifecycle hooks as legacy Session.      Regr
    participant P2288 as Elicitation hooks must resolve the sessions-native approval request.      With
    participant P2289 as A terminal session.status: failed raises with its error message.      Regr
    participant P2290 as A failed status with no error detail still raises (generic msg).      The
    participant P2291 as query() must wait for stream readiness before posting.      The Sessions S
    participant P2292 as Some harnesses produce no response.output_text.delta events     but do incl
    participant P2293 as Terminal response.completed snapshots are the last fallback     for provide
    participant P2294 as If deltas are present, query() must not append final snapshot     text agai
    participant P2295 as Streaming query(stream=True) must use the same provider-text     fallback a
    participant P2296 as Single recorded agent_tools_getter invocation.      :param agent_id: The a
    participant P2297 as Real stub class for the agent_tools_getter callable.      Returns a fixed
    participant P2298 as Record the call and return the canned tool list.          :param agent_id: Age
    participant P2299 as Build a real :class:OutputItemDoneEvent carrying an     action_required funct
    participant P2300 as Agent declares no client-side tools and caller passes no     callables: validat
    participant P2301 as Agent declares a client-runtime tool but no callable is     supplied: stream-st
    participant P2302 as Caller supplies a callable for a tool the spec doesn't     declare as runtime:
    participant P2303 as Agent declares one client tool, caller supplies a callable     for it: validati
    participant P2304 as The agent-spec fetch only fires once per chat helper, even     across multiple
    participant P2305 as When the server emits an action_required function_call item,     the SDK invoke
    participant P2306 as The dispatch path accepts plain (non-async) callables — async     is the common
    participant P2307 as Server-executed function_call items arrive with     status == \"completed\" (
    participant P2308 as Caller supplies tool_callables but no     agent_tools_getter. We can't
    participant P2309 as Direct chat.stream() (no user-message post) must run the     same tool_call
    participant P2310 as chat.stream() dispatches action_required function_call     items to the reg
    participant P2311 as chat.tree_busy() rolls up via the namespace for THIS session.      This is
    participant P2312 as validate_agent_bundle()
    participant P2313 as _parse_os_env_sandbox()
    participant P2314 as load_omnigent_yaml()
    participant P2315 as _ConversationStore
    participant P2316 as ._post_session_event()
    participant P2317 as _StubAuthProvider
    participant P2318 as _AgentStore
    participant P2319 as _AgentDefYamlPair
    participant P2320 as _DatabricksTokenAuth
    participant P2321 as _CredentialHeaderAuthProvider
    participant P2322 as _StubCancellableRunner
    participant P2323 as configure_agent_harness_with_provider()
    participant P2324 as compact_conversation_now()
    participant P2325 as _TunneledWSConn
    participant P2326 as Unit tests for the agent-meow YAML spec adapter.  Covers:  - Forward-directi
    participant P2327 as Minimal agent-meow YAML: name + prompt only.      Matches examples/h
    participant P2328 as agent-meow YAML with an executor: block declaring     model, harness, and p
    participant P2329 as agent-meow YAML with one function-type tool whose     callable: points at a
    participant P2330 as agent-meow YAML declaring a policies: block. The adapter     lifts this int
    participant P2331 as agent-meow YAML declaring a top-level os_env: block. The     adapter carrie
    participant P2332 as agent-meow YAML with a stdio MCP-type tool.      Translated to an MCPServerC
    participant P2333 as agent-meow YAML with an HTTP MCP-type tool (url + headers).      Translate
    participant P2334 as agent-meow YAML with the databricks_server MCP shape —     agent-meow has n
    participant P2335 as agent-meow YAML declaring a legacy cancellable_function     tool. Used to v
    participant P2336 as An agent-meow spec directory (spec_version: 1 in     config.yaml). Rout
    participant P2337 as A minimal YAML (name + prompt only) translates to an     AgentSpec with name, i
    participant P2338 as agent-meow YAML may use harness: claude as a spec-level alias.
    participant P2339 as An executor: block with model + harness + profile     populates :attr:LLMC
    participant P2340 as A YAML with a model that has no known harness prefix raises an     error — ever
    participant P2341 as A function-type tool with callable:     tests.resources.examples._shared.tool
    participant P2342 as catalog_path Unity Catalog tools translate into     LocalToolInfo with
    participant P2343 as When the YAML's function tool declares no input_schema:,     the agent-meow
    participant P2344 as When the agent-meow package is not importable (e.g. agent-     plane pip-in
    participant P2345 as agent-meow YAMLs with a policies: block produce an     AgentSpec whose gu
    participant P2346 as A top-level os_env: block on an agent-meow YAML     translates into an :cla
    participant P2347 as agent-meow YAMLs declaring a subprocess MCP tool translate to     a native MC
    participant P2348 as agent-meow YAMLs with an HTTP MCP (url + headers)     translate to an MCP
    participant P2349 as Forward + reverse round-trip: YAML → AgentSpec (with     MCPServerConfig) → Age
    participant P2350 as agent-meow MCP tools using the databricks_server=<name>     shape fail loud
    participant P2351 as agent-meow YAMLs declaring type: cancellable_function     are rejected by t
    participant P2352 as A .yaml file with name + prompt and no     spec_version routes
    participant P2353 as An agent-meow spec directory (spec_version declared)     routes through the
    participant P2354 as A .yaml file that happens to contain name +     prompt but also dec
    participant P2355 as Forward: a :class:CancellableFunctionTool is rejected with     a clear migrat
    participant P2356 as Forward then reverse: a plain :class:FunctionTool with an     explicit inpu
    participant P2357 as Module-level runner class kept for the rejection test.      Used solely to con
    participant P2358 as Stub — never actually called by the tests above.
    participant P2359 as AgentDef → AgentSpec → AgentDef preserves the     :class:OSEnvSpec
    participant P2360 as An inline :class:AgentTool that declares     os_env: \"inherit\" picks up t
    participant P2361 as An inline AgentTool that declares its own concrete     :class:OSEnvSpec is pr
    participant P2362 as os_env: inherit with no parent os_env resolves to     None — matches le
    participant P2363 as When an agent-meow YAML declares both prompt: and     instructions: <path
    participant P2364 as When instructions: is absent (None), the translator falls     back to pro
    participant P2365 as End-to-end through load_omnigent_yaml (the integration     path the agent-m
    participant P2366 as A top-level AgentDef.terminals dict is preserved under     AgentSpec.term
    participant P2367 as A parent without a terminals block produces     AgentSpec.terminals=None
    participant P2368 as Inline :class:AgentTool sub-specs inherit the parent's     terminals decl
    participant P2369 as When an agent-meow YAML declares a model but no harness,     the adapter fills
    participant P2370 as When the YAML explicitly declares a harness, auto-pick must     NOT override it
    participant P2371 as A model string that doesn't match any harness prefix raises     at translation
    participant P2372 as An inline :class:AgentTool that omits the executor:     block entirely in
    participant P2373 as When the inline AgentTool declares its own harness, parent     inheritance must
    participant P2374 as When neither the child NOR the parent declares a harness,     the adapter's mod
    participant P2375 as Two-value bundle for policy-translator tests — an     :class:AgentDef and the
    participant P2376 as Build an :class:AgentDef + raw-YAML dict pair for the     policy translator t
    participant P2377 as A type: function policy translates to a     :class:FunctionPolicySpec who
    participant P2378 as callable: + factory_params: together still route     through the shim,
    participant P2379 as callable: is a legacy alias for handler: in function policies.      Ol
    participant P2380 as callable: + factory_params: together behave identically     to handle
    participant P2381 as When no profile is declared, the translator leaves     :attr:LLMConfig.connect
    participant P2382 as Top-level labels: (initial values) and label_schema:     (values) merge
    participant P2383 as The agent-meow top-level ask_timeout: lands on     :attr:GuardrailsSpec.as
    participant P2384 as An agent-meow YAML without any policies/labels/ask_timeout     produces a spec
    participant P2385 as An agent-meow YAML declaring executor.extra: {max_turns: 3}     produces an
    participant P2386 as When the agent-meow YAML omits executor.extra, the     synthesized llm.ex
    participant P2387 as use_responses: false in an agent-meow YAML executor block lands on     sp
    participant P2388 as use_responses: true similarly propagates as True.      Complement of 
    participant P2389 as When the agent-meow YAML omits use_responses, the key is absent     from 
    participant P2390 as A policy with an unrecognized type: value fails with an     error that name
    participant P2391 as The tools.<name>: self string shorthand parses to a     :class:SelfAgentTo
    participant P2392 as The tools.<name>: {type: agent, spec: self} dict form     parses to a :clas
    participant P2393 as spec: self cannot be combined with override fields     (prompt, tools
    participant P2394 as Translating an agent-meow YAML with tools.subtask: self     produces a sub-
    participant P2395 as The cloned sub-spec does NOT carry its own self-clone tool —     parser-time re
    participant P2396 as executor.auth: declared in an omnigent-compat YAML is preserved     on the
    participant P2397 as executor.auth: {type: api_key, …} in an omnigent-compat YAML is     preserv
    participant P2398 as set_default_provider()
    participant P2399 as .send()
    participant P2400 as _AttachSessionInfo
    participant P2401 as Integration tests for the host REST API endpoints.
    participant P2402 as Build an ASGI WebSocket scope.      :param path: WebSocket path.     :returns
    participant P2403 as Encode a HostHelloFrame for tests.      :param name: Human-readable host name.
    participant P2404 as FastAPI app with host tunnel + REST routes and stores.      :param db_uri: SQL
    participant P2405 as Connect a mock host via WebSocket tunnel.      :param app: FastAPI app with ho
    participant P2406 as Verify list_hosts returns empty when no hosts are connected.      If a non-emp
    participant P2407 as Verify a connected host appears in the list with status 'online'.      If stat
    participant P2408 as Verify a server-managed sandbox host carries its provider in the list.      Cl
    participant P2409 as Verify get_host returns the correct details for a connected host.
    participant P2410 as Verify the readiness map a host reports in its hello is persisted     and surfa
    participant P2411 as Verify a host that doesn't report readiness (older build) lists     with config
    participant P2412 as Verify get_host returns 404 for an unknown host_id.
    participant P2413 as Verify a host connected to replica B is reported as online     when GET /
    participant P2414 as Verify a host that has disconnected is reported as offline.      After the
    participant P2415 as Verify the full launch flow: host receives launch frame, responds     with 'lau
    participant P2416 as Verify the dedicated launch endpoint maps a host refusal carrying     error_cod
    participant P2417 as Verify launch returns 409 when the host is in the DB but not     connected.
    participant P2418 as Verify launch returns 400 when the session already has a runner.      If it re
    participant P2419 as Verify launch returns 404 when the host doesn't exist.
    participant P2420 as Auth provider that returns a user ID from a request header.      Lets tests si
    participant P2421 as Initialize with a header name.          :param header: HTTP header carrying th
    participant P2422 as Extract user ID from the request header.          :param request: FastAPI Requ
    participant P2423 as App with auth provider for multi-user ownership tests.      :param db_uri: SQL
    participant P2424 as Verify that GET /v1/hosts only returns hosts owned by the     requesting user.
    participant P2425 as Verify that GET /v1/hosts/{id} returns 403 when the requesting     user doesn't
    participant P2426 as Verify that POST /v1/hosts/{id}/runners returns 403 when the     requesting use
    participant P2427 as POST /v1/hosts/{id}/runners validates the requested workspace against     the a
    participant P2428 as With an auth provider configured, a tunnel connection carrying no     identity
    participant P2429 as With auth configured, a tunnel carrying a valid identity registers     the host
    participant P2430 as Register an online host with a no-op WebSocket for ownership tests.
    participant P2431 as The shared launch-authorization helper rejects every cross-user     path and on
    participant P2432 as Bob owns the host (host-owner check passes) but targets Alice's     session → 4
    participant P2433 as A peer connecting to another owner's host_id is refused, and that     refusal m
    participant P2434 as A host.runner_exited frame from the daemon reaches the runner     status en
    participant P2435 as A host.runner_exited frame fires the on_runner_exited     callback with
    participant P2436 as strip_ucode_codex_config()
    participant P2437 as _parse_credential_proxy()
    participant P2438 as load()
    participant P2439 as _SessionToolAdapter
    participant P2440 as _MintingAuthProvider
    participant P2441 as _evaluate_tool_call_policy()
    participant P2442 as LocalServer
    participant P2443 as _DaemonChatSession
    participant P2444 as _CodexGoalRunnerClient
    participant P2445 as Tests for llms.adapters.openai — payload building and SSE parsing.
    participant P2446 as API key from connection_params is set in the Authorization header.
    participant P2447 as _stream_request calls aread() before raise_for_status() on     4xx/
    participant P2448 as _stream_responses must decode the byte stream incrementally so a     multi-
    participant P2449 as output_item.added for non-reasoning types returns None.
    participant P2450 as output_item.done for non-native types returns None.
    participant P2451 as _StubAgentCache
    participant P2452 as _resolve_vertex_params()
    participant P2453 as parse_codex_elicitation_request()
    participant P2454 as _parse_egress_rules()
    participant P2455 as ResolvedModelProvider
    participant P2456 as Tests for agent_meow.tools.manager (ToolManager).
    participant P2457 as Return tool schemas minus the always-registered lifecycle     tool (sys_cance
    participant P2458 as A skill with a references/ directory containing a     file, for testing r
    participant P2459 as A skill with no skill_dir (in-memory only).      :returns: A SkillSpec
    participant P2460 as Clear the MCP discovery cache before each test.
    participant P2461 as Create a minimal AgentSpec with the given skills,     MCP servers, and loca
    participant P2462 as ToolManager.call_tool dispatches to LoadSkillTool via     the registry.
    participant P2463 as ToolManager.call_tool dispatches to ReadSkillFileTool     via the registry.
    participant P2464 as ToolManager.call_tool returns error for unregistered tools.
    participant P2465 as get_tool_schemas includes load_skill when the agent has     skills, and the sch
    participant P2466 as get_tool_schemas includes read_skill_file when a skill     has bundled resource
    participant P2467 as get_tool_schemas does NOT include read_skill_file when     no skill has bundled
    participant P2468 as get_tool_schemas returns empty when agent has no skills,     excluding the alwa
    participant P2469 as A tool whose get_schema raises is skipped, not allowed to drop     the enti
    participant P2470 as A client-side tool whose get_schema raises is skipped, not     allowed to d
    participant P2471 as Read-only session discovery (sys_session_get_history /     sys_session_li
    participant P2472 as Top-level spawn: true registers the spawn writes without any     declared s
    participant P2473 as With the spawn: true opt-in but no declared sub-agents,     sys_session_s
    participant P2474 as Declaring tools.agents permits spawning ONLY the specified     sub-agent li
    participant P2475 as agent_session_sharing: non-public alone (no spawn / declared     agents) re
    participant P2476 as agent_session_sharing: public registers sys_session_share     and the a
    participant P2477 as A spec with BOTH tools.agents and spawn: true (the     nessie/polly sha
    participant P2478 as sys_session_get_info advertises a single optional session_id     parame
    participant P2479 as sys_agent_get and sys_agent_download are registered for     **every** a
    participant P2480 as shutdown() is safe to call without start().
    participant P2481 as Calling shutdown() twice does not raise.
    participant P2482 as shutdown() closes _os_env when it was self-created.
    participant P2483 as shutdown() does NOT close a pre-resolved (shared) OS env.
    participant P2484 as shutdown() calls shutdown() on every registered tool.
    participant P2485 as Build a minimal :class:ClientSideToolSpec for use in manager tests.      :pa
    participant P2486 as Client-specified tools appear in get_tool_schemas() alongside     built-in tool
    participant P2487 as is_client_side_tool returns True for registered ClientSideTool     entries and
    participant P2488 as A client tool with the same name as a skill tool overwrites the     skill tool
    participant P2489 as Passing client_tool_specs=None and client_tool_specs=[] produce     the same re
    participant P2490 as Build an :class:AgentSpec with a single local-tool entry.      Mirrors the p
    participant P2491 as A local tool declared with runtime: client in the spec is     reported as c
    participant P2492 as A local tool without runtime: client (default     :attr:ToolRuntime.SERVER
    participant P2493 as The schema for a spec-declared client tool is still emitted by     :meth:ToolM
    participant P2494 as :meth:ToolManager.get_client_tool_schemas includes spec-declared     client t
    participant P2495 as Spec-declared and request-supplied client tools both register     and both are
    participant P2496 as :meth:ToolManager.is_client_side_tool returns False for an     unknown name e
    participant P2497 as Client-specified tools with invalid names raise     OmnigentError at regist
    participant P2498 as Write a minimal local Python tool file to     workdir/tools/python/<filename>
    participant P2499 as ToolManager registers local Python tools from the workdir     and dispatches ca
    participant P2500 as ToolManager with workdir=None skips local tool registration     without error,
    participant P2501 as When the agent's model is a databricks-* model, the web_search     buil
    participant P2502 as _create_adapter()
    participant P2503 as _build_kimi_spawn_env()
    participant P2504 as _execpolicy_amendment()
    participant P2505 as _parse_llm()
    participant P2506 as _parse_executor_auth()
    participant P2507 as _parse_skill()
    participant P2508 as _parse_stdio_mcp_server()
    participant P2509 as _parse_condition()
    participant P2510 as Implementation of the agent-meow chat command.  The CLI always ends by con
    participant P2511 as Return the model used when neither YAML nor CLI flag picks one.      Reads O
    participant P2512 as CLI overrides from agent-meow run flags.      Applied by materializing a r
    participant P2513 as Handle to a locally-launched agent-meow server and its sibling runner.      Re
    participant P2514 as Adapt a legacy :class:ToolHandler to a sessions-API tool callable.      :par
    participant P2515 as Execute the legacy tool handler for a sessions-API tool call.          :param
    participant P2516 as Main entry point for agent-meow run (and the attach client).      :par
    participant P2517 as Run one prompt headlessly and print only the assistant text.      This is the
    participant P2518 as Attach the REPL to a LIVE conversation, dispatching to its existing runner.
    participant P2519 as Check if the target looks like a URL.      :param target: The target string.
    participant P2520 as Build headers for remote AP-server requests.      Resolution order:       1.
    participant P2521 as Mint a workspace token from a stored Databricks Apps record.      agent-meow
    participant P2522 as httpx Auth that authenticates via the Databricks SDK, refreshing     OAuth toke
    participant P2523 as :param server_url: Remote server URL for looking up stored             OIDC tok
    participant P2524 as Return a bearer token from the reused SDK auth, or None.          Resolves
    participant P2525 as Inject an Authorization header before each request.          Static env-va
    participant P2526 as Build non-auth HTTP headers for an agent-meow server client.      Auth is hand
    participant P2527 as Build an httpx Auth for a remote agent-meow server client.      Returns a :cla
    participant P2528 as Connect to a server URL and run a one-shot query or REPL.      Lists available
    participant P2529 as Return whether *conversation_id* is a claude-native wrapper session.      :par
    participant P2530 as Redirect a terminal-native resume before agent-meow attach liveness runs.
    participant P2531 as Finish any agent-meow startup progress and print the native redirect notice.
    participant P2532 as Hand a claude-native conversation back to agent-meow claude.      :param b
    participant P2533 as Hand a codex-native conversation back to agent-meow codex.      :param bas
    participant P2534 as Hand a pi-native conversation back to agent-meow pi.      :param base_url:
    participant P2535 as Hand a kiro-native conversation back to agent-meow kiro.
    participant P2536 as Hand a cursor-native conversation back to agent-meow cursor.      The curs
    participant P2537 as Hand a kimi-native conversation back to agent-meow kimi.      The kimi-nat
    participant P2538 as Return a conversation's wrapper label, if it can be read.      Single-shot G
    participant P2539 as Facts attach reads from one GET /v1/sessions/{id} snapshot.      :para
    participant P2540 as Read the facts attach needs from one GET /v1/sessions/{id}.      att
    participant P2541 as Discover agent names from existing sessions and let the user pick.      If onl
    participant P2542 as A chat session bound to a daemon-spawned runner.      :param session_id: The c
    participant P2543 as Block until a fresh accounts-mode local server has its first admin.      When
    participant P2544 as Create/resolve a chat session and launch a daemon-owned runner for it.      Re
    participant P2545 as Run a local agent against a daemon-backed server with a daemon-owned runner.
    participant P2546 as Wait until the remote server sees the local runner tunnel.      :param base_ur
    participant P2547 as Poll the server's runner-status endpoint until online=true.      Extracted
    participant P2548 as Build a gzipped agent bundle for POST /v1/sessions.      Keeps the import
    participant P2549 as Start a local server with the agent and open the REPL.      The spec is parsed
    participant P2550 as Start a local server, run one prompt, print response, and stop.      :param ag
    participant P2551 as POST one prompt through the SDK and print the final assistant text.      Uses
    participant P2552 as Create, bind, and query a sessions-API session for headless -p.      :para
    participant P2553 as Convert a legacy tool handler into sessions-API callables.      :param tool_ha
    participant P2554 as Extract assistant text from an agent-meow response output list.
    participant P2555 as Read the latest turn's persisted assistant text from a session.      The headl
    participant P2556 as Read the latest turn's persisted terminal error message, if any.      Companio
    participant P2557 as Decide which conversation the REPL should resume from.      Doing this here (v
    participant P2558 as Fail fast when an explicit --resume <id> names a conversation     that does
    participant P2559 as Drive the --resume picker against a server.      Looks up this agent's id
    participant P2560 as Find the most-recent conversation for *agent_name* on a     server.      Used
    participant P2561 as Async core of :func:_resolve_latest_conversation_id.      Factored out so te
    participant P2562 as Copy *source* into a temp dir and apply CLI overrides to its YAML.      Also m
    participant P2563 as Remove the temp directory created for a materialized override bundle.      Ove
    participant P2564 as Load the YAML that override materialization would rewrite.      Single-file sp
    participant P2565 as Load the YAML at *source* if it's a single-file spec; else None.      Director
    participant P2566 as True when the YAML's executor: block has harness or model.      Either sig
    participant P2567 as Return whether materialization would inject OpenAI env credentials.      Daemo
    participant P2568 as Resolve the harness relevant to OpenAI env-auth injection.      This mirrors t
    participant P2569 as Resolve the model relevant to OpenAI env-auth injection.      :param raw: Pars
    participant P2570 as Return whether executor.auth should be populated from env.      :param exe
    participant P2571 as Add explicit OpenAI-compatible auth to raw when env fallback is unsafe.
    participant P2572 as Mutate *raw* to reflect CLI overrides + the default-model fallback.      Mirro
    participant P2573 as Write the --harness override where the spec's format reads it.      Single
    participant P2574 as Parse and validate the agent spec in this process.      Mirrors the work the s
    participant P2575 as Resolve the display name for the REPL banner.      Accepts both agent-image di
    participant P2576 as Merge bundled skills with host-scope skills for the REPL.      Discovers .cl
    participant P2577 as Derive a reasonable display label from a path when the spec     didn't supply o
    participant P2578 as Normalize a local agent path before materialization and bundling.      Directo
    participant P2579 as Find a free TCP port.      :returns: An available port number.
    participant P2580 as Resolve the shared agent-meow process log directory.      Server and captured
    participant P2581 as Resolve the persistent agent-meow data directory.      Honors OMNIGENT_DATA_
    participant P2582 as Launch a local agent-meow server.      Server stdout/stderr are routed to se
    participant P2583 as Poll until the server responds.      :param port: The server port.     :param
    participant P2584 as Raise a descriptive error for a failed server startup.      Includes the tail
    participant P2585 as Gracefully stop the server subprocess.      :param proc: The server subprocess
    participant P2586 as Stop both the server and its sibling runner subprocess.      :param server: Th
    participant P2587 as Best-effort: the harness surfaces a local agent's harnesses consume.      Walk
    participant P2588 as Open the REPL connected to the server.      :param base_url: Server base URL.
    participant P2589 as Send a single prompt to a remote server and print the final text.      :param
    participant P2590 as Load a client-side tool set by name and wrap it as a ToolHandler.      Prefers
    participant P2591 as NativeCodexLaunch
    participant P2592 as ModelListing
    participant P2593 as _StubPermissionStore
    participant P2594 as parse_model_string()
    participant P2595 as _parse_responses_response()
    participant P2596 as _build_session_response()
    participant P2597 as _ensure_runner_relay_ready()
    participant P2598 as _run_compact_locked()
    participant P2599 as _parse_terminals()
    participant P2600 as _parse_single_label_def()
    participant P2601 as True when at least one override flag was supplied.
    participant P2602 as _RecordingAgentStore
    participant P2603 as _FakeUpload
    participant P2604 as resolve_secret()
    participant P2605 as _parse_family()
    participant P2606 as _parse_provider()
    participant P2607 as _build_native_terminal_message_event()
    participant P2608 as _require_access_and_level_sync()
    participant P2609 as _parse_builtin_tools()
    participant P2610 as _parse_os_env()
    participant P2611 as _parse_inline_mcp_servers()
    participant P2612 as _discover_mcp_servers()
    participant P2613 as _parse_http_mcp_server()
    participant P2614 as _parse_policies()
    participant P2615 as ModelEntry
    participant P2616 as _RecordingArtifactStore
    participant P2617 as Tests for the generic-provider routing branch of the per-harness spawn-env buil
    participant P2618 as Clear ambient vendor keys so they cannot leak into the spawn env.      The cod
    participant P2619 as Point $OMNIGENT_CONFIG_HOME at an isolated temp dir.      Both the readout
    participant P2620 as Write *config* as config.yaml under *config_home*.      :param config_home
    participant P2621 as Build a minimal :class:AgentSpec for a given harness.      :param harness: H
    participant P2622 as Build a single provider-family config block (inline static key).      :param b
    participant P2623 as Return a config with a single default: true anthropic key provider.
    participant P2624 as Return a config with a single default: true openai key provider.
    participant P2625 as A default: true anthropic provider routes the claude-sdk harness.      Ass
    participant P2626 as A fresh machine with only an ambient key routes via the detected provider.
    participant P2627 as An explicit global auth: block wins over an ambient-detected key.      Reg
    participant P2628 as A default: true openai provider routes the codex harness.      Asserts the
    participant P2629 as A configured-but-not-default openai credential routes the codex head at spawn.
    participant P2630 as A configured-but-not-default anthropic credential routes the BRAIN head at spawn
    participant P2631 as A legacy Databricks credential is folded into a synthesized provider only     f
    participant P2632 as A default: true openai provider routes the openai-agents-sdk harness.
    participant P2633 as A default: true anthropic provider routes the pi harness.      pi consumes
    participant P2634 as executor.auth: {type: provider, name: X} selects X over the default.
    participant P2635 as A ProviderAuth naming an undeclared provider raises a clear error.      Failur
    participant P2636 as An anthropic default and an openai default coexist and route per-family.
    participant P2637 as A spec-level model wins over the provider family's models.default.      Fa
    participant P2638 as Build a provider-family block with NO models.default.      Mirrors the rep
    participant P2639 as An anthropic key provider with no models.default resolves a     catalog
    participant P2640 as An openai key provider with no models.default resolves the     catalog
    participant P2641 as An openai key provider with no models.default resolves the     catalog
    participant P2642 as A default: true openai provider routes the qwen harness.      Qwen consume
    participant P2643 as The headless goose builder forwards a spec model as HARNESS_GOOSE_MODEL
    participant P2644 as A databricks-* model isn't a valid Goose model id, so it's dropped     (pro
    participant P2645 as With no spec model, goose falls back entirely to its ambient config.
    participant P2646 as An openai key provider with no models.default resolves the     catalog
    participant P2647 as An anthropic key provider with no models.default resolves the     catal
    participant P2648 as A provider's models.default still wins over the catalog default.      The
    participant P2649 as A spec-level model still wins when the provider has no models.default.
    participant P2650 as A databricks-kind default routes via the profile/ucode path.      A databr
    participant P2651 as With NO provider configured, the existing api_key path is untouched.      A sp
    participant P2652 as With NO provider configured, the legacy profile path is untouched.      A code
    participant P2653 as A legacy profile on the spec suppresses the global-default provider.
    participant P2654 as A spec executor.auth: {type: databricks} on codex routes via the     synthe
    participant P2655 as A config whose codex default is a config.toml-pinned provider.      :returns:
    participant P2656 as A default: true cli-config provider pins codex's model_provider.      The
    participant P2657 as A codex subscription default pins the built-in openai provider.      T
    participant P2658 as A cli-config default cannot drive the openai-agents-sdk harness.      The pinn
    participant P2659 as A cli-config Databricks gateway default routes the pi (gateway) harness.
    participant P2660 as Point $HOME at the config home and write a custom codex config there.
    participant P2661 as With no provider resolved and the config provider dismissed, pin openai.
    participant P2662 as The same config WITHOUT a dismissal routes via the detected provider.      Cou
    participant P2663 as The kimi builder only emits HARNESS_KIMI_MODEL (when set) and     HARNESS
    participant P2664 as cwd (the session workspace) lands in HARNESS_KIMI_CWD so kimi's     sub
    participant P2665 as With no provider configured and no spec auth, kimi uses its own     kimi logi
    participant P2666 as An openai default provider does NOT inject creds into the kimi env.      Count
    participant P2667 as A kimi spec that declares any executor.auth fails loud.      Upstream kimi
    participant P2668 as spec.os_env is serialized into HARNESS_KIMI_OS_ENV so the wrap     can
    participant P2669 as RoutedTunnelClient
    participant P2670 as TunnelRouteApp
    participant P2671 as TestParseCodexElicitationRequest
    participant P2672 as _AgentStore
    participant P2673 as _apply_provider_to_pi()
    participant P2674 as ._start_or_inject_turn()
    participant P2675 as _persist_external_session_usage()
    participant P2676 as _parse_external_conversation_item()
    participant P2677 as _translate_tools_to_omnigent()
    participant P2678 as _translate_function_tool_from_def()
    participant P2679 as _parse_function_policy()
    participant P2680 as raise_for_status()
    participant P2681 as Tunnel-backed ws_factory for browser terminal attach.  The server's :mod:
    participant P2682 as Build a ws_factory callable that opens tunneled WS channels.      Install
    participant P2683 as WS-client-shaped wrapper around one tunnel WS channel.      Implements the min
    participant P2684 as Forward a browser-side frame to the runner over the tunnel.          :param da
    participant P2685 as Pop the next runner-side payload off the channel queue.          :returns: b
    participant P2686 as Build a :class:ConnectionClosed with .rcvd = Close(code, reason).      T
    participant P2687 as _RecordingAgentCache
    participant P2688 as Tests for _build_openai_agents_sdk_spawn_env in agent_meow/runtime/workfl
    participant P2689 as Point OMNIGENT_CONFIG_HOME at an empty temp dir for every test in     this file
    participant P2690 as Build a minimal openai-agents :class:AgentSpec for the     spawn-env tests.
    participant P2691 as executor.config[\"model\"] is encoded into HARNESS_OPENAI_AGENTS_MODEL.
    participant P2692 as An explicit executor.profile sets HARNESS_OPENAI_AGENTS_DATABRICKS_PROFILE
    participant P2693 as A databricks- model with no explicit profile auto-sets     HARNESS_OPENAI
    participant P2694 as databricks/ provider-prefix form (LiteLLM convention) also triggers     aut
    participant P2695 as Ambient DATABRICKS_CONFIG_PROFILE does NOT steer the auto-Databricks     ro
    participant P2696 as An explicit profile takes precedence over the auto-DEFAULT for databricks- m
    participant P2697 as Non-databricks- models without a profile omit the profile env var.
    participant P2698 as use_responses: false encodes as the string \"false\".
    participant P2699 as use_responses: true encodes as the string \"true\".
    participant P2700 as When use_responses is unset, the env var is omitted (harness default applies
    participant P2701 as A spec with no model produces no HARNESS_OPENAI_AGENTS_MODEL env var.
    participant P2702 as Profile-backed runs read OpenAI-compatible model and base URL from ucode.
    participant P2703 as executor.auth: {type: databricks, profile: oss} sets     HARNESS_OPENAI_A
    participant P2704 as executor.auth: {type: api_key, api_key: sk-test} sets     HARNESS_OPENAI_
    participant P2705 as When the spec declares executor.auth, the global config auth     block is i
    participant P2706 as When the spec has no executor.auth, the global config auth:     block p
    participant P2707 as _load_global_auth() returns a :class:DatabricksAuth when the     config f
    participant P2708 as _load_global_auth() returns an :class:ApiKeyAuth when the     config file
    participant P2709 as When the spec declares a profile via the legacy executor.config[\"profile\"]
    participant P2710 as _load_global_auth() returns None when no config file exists.
    participant P2711 as _load_global_auth() parses base_url from the global config     and expa
    participant P2712 as _load_global_auth() raises when api_key contains an unresolved     $V
    participant P2713 as executor.auth: {type: api_key, base_url: …} writes     HARNESS_OPENAI_AGE
    participant P2714 as When executor.auth.base_url is absent, the base-URL env var is     not writ
    participant P2715 as TestStringListAnswer
    participant P2716 as .client_for_conversation()
    participant P2717 as .client_for_existing_conversation()
    participant P2718 as ._handle_interrupt_event()
    participant P2719 as _stored_policy_to_spec()
    participant P2720 as _native_terminal_runtime()
    participant P2721 as _resolve_skill_meta_text_via_runner()
    participant P2722 as _persist_stored_session_bundle()
    participant P2723 as _translate_skills_filter_from_yaml()
    participant P2724 as _translate_executor_from_def()
    participant P2725 as check_unresolved_env_vars()
    participant P2726 as _parse_label_defs()
    participant P2727 as _parse_policy_spec()
    participant P2728 as _parse_on_entry()
    participant P2729 as Unit tests for :class:omnigent_client._sessions.SessionsNamespace.  Mocks at
    participant P2730 as Build a :class:SessionsNamespace wired to a mock HTTP transport.      :param
    participant P2731 as Render a sequence of (event_type, payload) into SSE wire bytes.      Mirrors t
    participant P2732 as Build a minimal :class:SessionResponse JSON dict.      :param session_id: Se
    participant P2733 as resolve_elicitation POSTs the bare MCP ElicitationResult     body to th
    participant P2734 as Build a minimal :class:ResponseObject JSON dict for use in the     typed term
    participant P2735 as Drive the SDK through the 4-step lifecycle a real client follows.      1. Crea
    participant P2736 as fork() POSTs to /v1/sessions/{id}/fork and returns the raw dict.
    participant P2737 as fork() sends an empty body when no title is provided.      The server shou
    participant P2738 as fork() raises OmnigentError when the source session is missing.      F
    participant P2739 as Serve GET …/{id}/child_sessions from an in-memory parent→children map.
    participant P2740 as The tree helper walks every level and stamps each row with its parent.      Fa
    participant P2741 as max_depth caps descent — depth 1 returns direct children only.
    participant P2742 as A child pointing back at an ancestor is visited once, not forever.
    participant P2743 as A busy grandchild makes the whole subtree read busy.      This is the rollup #
    participant P2744 as All descendants settled → subtree not busy (safe to inject 'your turn').
    participant P2745 as A descendant parked on an elicitation keeps the subtree busy (web parity).
    participant P2746 as Integration tests for the runner WebSocket tunnel route.
    participant P2747 as Client and registry wired through the production tunnel route.      :param cli
    participant P2748 as Minimal app and registry for tunnel route tests.      :param app: FastAPI app
    participant P2749 as Build an ASGI WebSocket scope for a test path.      :param path: WebSocket pat
    participant P2750 as Connect an ASGI WebSocket communicator to the tunnel route.      :param app: F
    participant P2751 as Create a minimal app containing only the runner tunnel route.      :param allo
    participant P2752 as Real auth provider stub modeling the OIDC / accounts contract.      Returns th
    participant P2753 as Return the identity from the credential header, or None.          :param r
    participant P2754 as Send the runner hello frame.      :param communicator: Connected ASGI WebSocke
    participant P2755 as Wait for runner registration.      :param registry: Registry shared with the t
    participant P2756 as Forward request frames into the runner ASGI app.      :param communicator: Con
    participant P2757 as Send a response frame back into the tunnel route.      :param communicator: Co
    participant P2758 as Yield a client dispatching through the real WS route.      :param app: Product
    participant P2759 as GET /health must round-trip through the real FastAPI WS route.      :param rou
    participant P2760 as Runner status flips online after tunnel registration.      :param app: Product
    participant P2761 as Runner list exposes live runners and advertised harnesses.      :param app: Pr
    participant P2762 as Token-bound tunnels cannot claim arbitrary runner ids.      :param app: Produc
    participant P2763 as IPv4-mapped IPv6 loopback clients are local runner tunnels.      :param app: P
    participant P2764 as Remote runner tunnels must present a binding token.      Both bare IPv4 and IP
    participant P2765 as Remote clients must present a token when the server has an allow-list.      Us
    participant P2766 as A stale runner token from a remote client is rejected.      Uses a non-loopbac
    participant P2767 as A stable local runner id with the current server token can register.      Uses
    participant P2768 as Loopback clients skip the token allow-list entirely.      This is the run --
    participant P2769 as Token-bound tunnels can register their derived runner id.      :param app: Pro
    participant P2770 as Concurrent remote runner ids register independently.      :param app: Producti
    participant P2771 as One bad frame must not deregister the runner or abort routing.      :param app
    participant P2772 as The tunnel route is accepted at one /v1 prefix, not two.      :param app:
    participant P2773 as An unauthenticated non-loopback peer cannot register.      With auth enabled a
    participant P2774 as An authenticated remote runner registers under its owner.      The fix must no
    participant P2775 as A managed-sandbox runner registers under its launch owner.      Server-managed
    participant P2776 as Wiring the managed resolver must not weaken the fail-closed gate.      A non-l
    participant P2777 as Auth-enabled server still accepts the local loopback runner.      agent-meow
    participant P2778 as OIDC/accounts-style provider that also mints runner owner tokens.      Models
    participant P2779 as Return a deterministic sentinel bearer for *user_id*.
    participant P2780 as Tunnel-route app with the OmnigentError -> HTTP handler installed.      Th
    participant P2781 as POST the mint endpoint with an optional binding-token header.      :param app:
    participant P2782 as A valid binding token mints an owner bearer scoped to the launch owner.      T
    participant P2783 as A token with no managed-launch record is refused (fail closed).      An attack
    participant P2784 as A token that doesn't hash to the path runner_id is refused.      The SHA-256 b
    participant P2785 as A request without the binding-token header is refused.      :returns: None.
    participant P2786 as When the provider can't mint (header/proxy mode), the endpoint 400s.      The
    participant P2787 as TestExecpolicyAmendment
    participant P2788 as _StubConversationStore
    participant P2789 as Tests for agent_meow.spec.parser.
    participant P2790 as Create a minimal valid agent image directory.
    participant P2791 as All non-model keys in the llm block are collected into extra.
    participant P2792 as LLM block with only model has empty extra and no connection.
    participant P2793 as The connection sub-block is parsed into LLMConfig.connection.
    participant P2794 as ${VAR} references in connection values are expanded.
    participant P2795 as Unresolved ${VAR} in LLM connection raises ValueError.      :param tmp_pat
    participant P2796 as A per-server tools: whitelist on an inline MCP tool propagates to     MCP
    participant P2797 as Omitting tools: leaves the allow-list as None (expose all).
    participant P2798 as A non-list tools: value is a clear error, not a silent type bug.
    participant P2799 as expand_env=False keeps ${VAR} references as literal strings.      Used
    participant P2800 as Multiline inline instructions are not treated as file paths.
    participant P2801 as No instructions key in config -> falls back to AGENTS.md.
    participant P2802 as instructions key with inline text (not a file path).
    participant P2803 as instructions key pointing to an existing file.
    participant P2804 as An instructions value escaping the bundle is treated as literal text.
    participant P2805 as Explicit instructions key takes precedence over AGENTS.md.
    participant P2806 as instructions pointing to a file takes precedence over AGENTS.md.
    participant P2807 as prompt: is an alias for instructions: (inline text).
    participant P2808 as A multiline prompt: block (the nessie config shape) loads.
    participant P2809 as prompt: honors the same file-path resolution as instructions.
    participant P2810 as prompt: is consulted before the AGENTS.md auto-detect scan.
    participant P2811 as When both keys are set, instructions: takes precedence.
    participant P2812 as AGENTS.md is chosen over CLAUDE.md and .cursorrules.
    participant P2813 as CLAUDE.md is chosen when AGENTS.md is absent.
    participant P2814 as .cursorrules is chosen when AGENTS.md and CLAUDE.md are absent.
    participant P2815 as No context files present → instructions is None.
    participant P2816 as user-invocable: false frontmatter parses to user_invocable=False.
    participant P2817 as Both the YAML bool false and the quoted string \"false\" parse falsey.
    participant P2818 as A non-UTF-8 SKILL.md must funnel through OmnigentError (not escape as a     bar
    participant P2819 as Agent-bundle skills are shipped with the spec and stay strict —     a YAML pars
    participant P2820 as Host skill directories are user-managed (~/.claude/skills/,     .claude/s
    participant P2821 as File IO errors (broken symlink, permission denied) on a host     SKILL.md m
    participant P2822 as The top-level skills: field is optional. When omitted, the     spec default
    participant P2823 as skills: all round-trips as the string \"all\".
    participant P2824 as skills: none round-trips as the string \"none\".
    participant P2825 as skills: [] is an explicit \"no skills\" declaration —     normalizes to \"no
    participant P2826 as A list of names round-trips as a list of names.
    participant P2827 as Strings other than \"all\" / \"none\" are rejected at     parse time — no s
    participant P2828 as Lists with non-string entries (numbers, dicts, nested lists)     fail loud rath
    participant P2829 as Mappings (and other unsupported shapes — booleans, integers)     are rejected.
    participant P2830 as spec.skills (bundled SkillSpec list) and spec.skills_filter     (host f
    participant P2831 as Host skills with missing YAML frontmatter are skipped with a     warning instea
    participant P2832 as All broken skills are reported in one pass — no whack-a-mole.      :param tmp_
    participant P2833 as Bundled skills (inside the agent directory, parsed by     :func:parse) must s
    participant P2834 as Parse an HTTP MCP server config with env var expansion.      :param agent_dir:
    participant P2835 as Unresolved ${VAR} in MCP env raises OmnigentError     at parse time ins
    participant P2836 as Unresolved ${VAR} in MCP headers raises ValueError at     parse time.
    participant P2837 as Unresolved $VAR (without braces) also raises ValueError.      :param agent
    participant P2838 as A tools: block entry with type: mcp and command parses     as a std
    participant P2839 as A tools: block entry with type: mcp and url parses     as an http M
    participant P2840 as The standard tools: block keys (agents, builtins,     timeout,
    participant P2841 as Legacy tools.sandbox.docker_image remains a valid image alias.
    participant P2842 as Preferred container_image wins when both image keys exist.
    participant P2843 as Tools-block entries whose type is not \"mcp\" are silently     ignored by
    participant P2844 as An inline type: mcp entry with no command or url     (only databr
    participant P2845 as Inline type: mcp entries expand ${VAR} in headers     (http transpo
    participant P2846 as Non-dict headers on an inline MCP entry raises     OmnigentError instea
    participant P2847 as Non-dict env on an inline stdio MCP entry raises     OmnigentError inst
    participant P2848 as Inline tools: block MCP entries and tools/mcp/*.yaml bundle     files a
    participant P2849 as Omitting interaction block entirely gives defaults.
    participant P2850 as Omitting one side of modalities defaults that side to [text].
    participant P2851 as A native YAML without an os_env: block leaves     spec.os_env as None
    participant P2852 as A native YAML os_env: mapping parses into a real     :class:OSEnvSpec wit
    participant P2853 as The nested sandbox: block parses into a real     :class:OSEnvSandboxSpec
    participant P2854 as A scalar/list under os_env: raises OmnigentError —     fail loud rather tha
    participant P2855 as A scalar/list under os_env.sandbox: raises     OmnigentError — same fail-lo
    participant P2856 as cwd_allow_hidden parses through to     :class:OSEnvSandboxSpec.cwd_allow_h
    participant P2857 as An explicit empty list must NOT collapse to None. The     distinction matte
    participant P2858 as Invalid cwd_allow_hidden values raise     :class:OmnigentError at parse t
    participant P2859 as When the spec omits cwd_hidden_scan_max_entries and     cwd_hidden_scan_o
    participant P2860 as Explicit cwd_hidden_scan_max_entries + ..._overflow values     pass thr
    participant P2861 as Non-integer or non-positive caps fail at parse time. The bool     rejection is
    participant P2862 as Only \"error\", \"warn\", \"unlimited\" are accepted.     Anything else f
    participant P2863 as Parser ignores files/directories not in the spec.
    participant P2864 as Skills are discovered in sorted directory order.
    participant P2865 as ${VAR} references in MCP env and headers are expanded     against the proce
    participant P2866 as ${VAR} references in HTTP headers are expanded at parse     time.
    participant P2867 as If any env value contains an unresolved ${VAR}, parsing     raises ValueErr
    participant P2868 as Parser rejects an MCP config with transport: http but no     url field.
    participant P2869 as LLM block with explicit request_timeout and retry overrides.
    participant P2870 as LLM block with only model inherits default timeout and retry.
    participant P2871 as llm.profile must survive the llm/executor consolidation rebuild.      When
    participant P2872 as Tools block with explicit timeout and retry overrides.
    participant P2873 as Plain string entries in tools.builtins produce BuiltinToolConfig     with empty
    participant P2874 as Dict entries in tools.builtins carry tool-specific config.
    participant P2875 as tools.builtins supports a mix of strings and dicts.
    participant P2876 as Dict entry without 'name' raises OmnigentError.
    participant P2877 as Executor block with explicit timeout and max_iterations.
    participant P2878 as No executor block yields ExecutorSpec defaults.
    participant P2879 as Executor block with a config sub-block parses string values.      The co
    participant P2880 as Absent executor.config block yields an empty dict, not None.
    participant P2881 as MCP server YAML with per-server timeout and retry overrides.
    participant P2882 as Parse a stdio MCP server with only the required command.      What breaks
    participant P2883 as Parse a stdio MCP with every field populated, including     ${VAR} expansio
    participant P2884 as A YAML that still declares sandbox: <bool> on a stdio MCP     is rejected w
    participant P2885 as Stdio MCP without command fails loud at parse time.      What breaks if th
    participant P2886 as Stdio MCP with a stray url: (copy-pasted from an HTTP     example) fails lo
    participant P2887 as HTTP MCP with a stray command: fails loud at parse time.      Mirror of th
    participant P2888 as transport: grpc or any other value fails loud with a     clear \"must be 'ht
    participant P2889 as Without a top-level timers: key the parsed AgentSpec.timers     is Fa
    participant P2890 as timers: true in config.yaml round-trips to     AgentSpec.timers == True
    participant P2891 as Without a top-level spawn: key the parsed AgentSpec.spawn     is Fals
    participant P2892 as spawn: true in config.yaml round-trips to     AgentSpec.spawn == True.
    participant P2893 as Without a top-level agent_session_sharing: key the parsed     AgentSpec.a
    participant P2894 as Each recognized agent_session_sharing: string round-trips to its     :class
    participant P2895 as An unrecognized agent_session_sharing: value (here a plausible     typo) ra
    participant P2896 as Omitting env_passthrough parses to None, which the helper     spawn pat
    participant P2897 as A list of valid POSIX env-var names round-trips verbatim.      This is the sup
    participant P2898 as An explicit empty list parses to [], distinct from None.      The help
    participant P2899 as Invalid env_passthrough values raise :class:OmnigentError     at parse ti
    participant P2900 as Omitting start_in_scratch parses to False so existing     specs keep th
    participant P2901 as Setting start_in_scratch: true together with an active     sandbox parses s
    participant P2902 as start_in_scratch and fork both manage the agent's writable     workspac
    participant P2903 as start_in_scratch requires an active sandbox because the     scratch tmpdir
    participant P2904 as Top-level executor.profile lifts into the concrete     ExecutorSpec.profi
    participant P2905 as executor.profile lifts into ExecutorSpec.profile for all executor types.
    participant P2906 as Both legacy agent-meow and default minimal YAMLs continue to parse cleanly.
    participant P2907 as executor.auth: {type: databricks, profile: oss} parses into     :class:Dat
    participant P2908 as executor.auth: {type: api_key, api_key: $MY_KEY} expands the     env-var re
    participant P2909 as executor.auth: {type: provider, name: litellm} parses into     :class:Prov
    participant P2910 as type: provider without a name fails loud, not silently empty.
    participant P2911 as No auth: key yields spec.executor.auth is None.
    participant P2912 as An unknown auth.type value raises :class:OmnigentError.
    participant P2913 as type: api_key without an api_key field raises     :class:OmnigentError
    participant P2914 as type: databricks without a profile field raises     :class:OmnigentErr
    participant P2915 as executor.auth: {type: api_key, api_key: …, base_url: …} parses     both fie
    participant P2916 as base_url defaults to None when not declared.
    participant P2917 as Build a minimal agent config carrying a credential_proxy block.      :para
    participant P2918 as All four credential_proxy types normalize to host bindings.      What brea
    participant P2919 as Two entries binding the same host fail loudly at parse time.      The egress p
    participant P2920 as git_https defaults the Basic username to x-access-token.      A wrong
    participant P2921 as https_* without env parses as a swap-on-access binding.      The env
    participant P2922 as Malformed credential_proxy entries fail loudly at parse time.      Each ca
    participant P2923 as credential_proxy without egress_rules is rejected.      The MITM proxy
    participant P2924 as credential_proxy requires a network-isolating backend.      On linux_lan
    participant P2925 as gh_basic is rejected on macOS (darwin_seatbelt).      gh_basic wir
    participant P2926 as The generic primitives are NOT rejected on macOS.      The macOS guard must fi
    participant P2927 as _resolve_base_url()
    participant P2928 as ._routed_pinned_runner()
    participant P2929 as _signal_harness_elicitation_resolved_by_id()
    participant P2930 as _publish_external_output_reasoning_delta()
    participant P2931 as _codex_tool_request_user_input_params()
    participant P2932 as _parse_env_passthrough()
    participant P2933 as _parse_skills_filter()
    participant P2934 as _parse_function_ref()
    participant P2935 as test_interactive_send_runner_unavailable_surfaces_not_hangs()
    participant P2936 as TestCodexCommandPreview
    participant P2937 as Cross-user tests for the advisor-owned cost_control.* label namespace.  Th
    participant P2938 as Real file-backed stores backing the routes under test.      :param db_uri: Per
    participant P2939 as Mirror create_app()'s OmnigentError → HTTP translation.      :param app: T
    participant P2940 as Build a multi-user app (header auth + real permission store).      :param stor
    participant P2941 as Build a single-user app (no auth provider, no permission store).      :param s
    participant P2942 as Create a session-shaped conversation with optional grants/runner.      :param
    participant P2943 as Bob (edit access, no runner token) cannot overwrite the plan     label — the ex
    participant P2944 as Even the session OWNER cannot write the namespace from an     ordinary client:
    participant P2945 as The gate runs BEFORE any store mutation: a mixed PATCH (title +     reserved la
    participant P2946 as A token bound to a DIFFERENT runner than the session's must not     authorize t
    participant P2947 as The gate is namespace-scoped: an editor's write of ordinary     labels still su
    participant P2948 as The advisor's own persist path: a PATCH carrying the binding     token whose to
    participant P2949 as Managed runner pools register under STABLE runner ids, so their     proof is al
    participant P2950 as No permission store = single-user mode: the advisor's persist     must work wit
    participant P2951 as POST /v1/sessions with a cost_control.* label seed fails     400: no ru
    participant P2952 as The multipart bundled-create shape is gated too: its metadata     carries the s
    participant P2953 as Counterpart of the rejection above: ordinary label seeds still     work, provin
    participant P2954 as Route regression tests for INPUT policy DENY persistence.
    participant P2955 as Build a sessions route client with one agent-bound session.
    participant P2956 as Synchronous INPUT DENY both streams and persists the deny sentinel.
    participant P2957 as _RecordingRunnerClient
    participant P2958 as _parse_default_families()
    participant P2959 as .client_for_session_resources()
    participant P2960 as _provider_auth_command()
    participant P2961 as _apply_provider_family()
    participant P2962 as _apply_provider_to_openai_agents()
    participant P2963 as ._resolve_elicitation()
    participant P2964 as _persist_external_model_change()
    participant P2965 as _handle_external_session_todos()
    participant P2966 as _publish_external_output_text_delta()
    participant P2967 as _parse_external_assistant_message()
    participant P2968 as _persist_external_codex_subagent_start()
    participant P2969 as _validate_session_workspace()
    participant P2970 as _stop_session_via_runner()
    participant P2971 as _parse_skill_slash_command()
    participant P2972 as _create_session_worktree()
    participant P2973 as _read_yaml_mapping()
    participant P2974 as _decision_execpolicy_amendment()
    participant P2975 as _codex_mcp_elicitation_params()
    participant P2976 as _start_codex_goal_runner_on_bound_host()
    participant P2977 as _translate_policy_entry_yaml()
    participant P2978 as _parse_cwd_allow_hidden()
    participant P2979 as _parse_credential_proxy_host()
    participant P2980 as _coerce_label_values()
    participant P2981 as _parse_on()
    participant P2982 as _parse_writable_labels()
    participant P2983 as ._register_client_tools()
    participant P2984 as _RunnerWSClosed
    participant P2985 as _CodexGoalConversationStore
    participant P2986 as _CodexGoalRunnerRouter
    participant P2987 as _AgentCacheStub
    participant P2988 as _HarnessAgentCacheStub
    participant P2989 as _RunnerClientStub
    participant P2990 as Attachment upload type/size enforcement on POST /v1/sessions/{id}/resources/file
    participant P2991 as A sessions route client with file + artifact stores and one session.
    participant P2992 as A small text file uploads and returns a resource.
    participant P2993 as A pptx (binary office doc) is rejected with 415, not stored.
    participant P2994 as An image over the per-type limit is rejected with 413.
    participant P2995 as A .csv the browser tags application/vnd.ms-excel is accepted via the     extens
    participant P2996 as A text file just under the text cap is accepted.
    participant P2997 as Minimal UploadFile stand-in exposing the chunked read interface.
    participant P2998 as A payload exactly at the limit is accepted (the > boundary).
    participant P2999 as One byte over the limit raises HTTP 413.
    participant P3000 as _StubAgentStore
    participant P3001 as _FakeRunnerRouter
    participant P3002 as Unit tests for agent_meow.spec.agent_meow.agent_spec_to_agent_def.  Phase
    participant P3003 as Stub tool used only as a dotted-path target in the translator tests.      :par
    participant P3004 as Minimal AgentSpec targeting the agent-meow executor.      :returns: A spec
    participant P3005 as The translator copies name and instructions into     AgentDef.name
    participant P3006 as llm.model, executor.config.harness, and     executor.config.profile
    participant P3007 as executor.config may omit profile; the translator     surfaces None
    participant P3008 as A LocalToolInfo with a dotted import path is resolved via     :func:import
    participant P3009 as A spec with guardrails.policies translates successfully     to an :class:A
    participant P3010 as A spec that requests a sandbox (tools.sandbox.container_image)     is rejec
    participant P3011 as A spec that declares an MCP server translates into an     agent-meow MCP tool.
    participant P3012 as A LocalToolInfo whose path looks like a filesystem path     (contains /
    participant P3013 as A dotted path whose module cannot be imported yields a     clear error naming t
    participant P3014 as A dotted path that resolves to a non-callable attribute is     rejected with a
    participant P3015 as A spec with executor.type='agent-meow' but no llm     block is rejected
    participant P3016 as Native agent-meow v1 specs use executor.type=\"agent-meow\" with no harness in
    participant P3017 as When a parent spec's sub-agent uses a native agent-meow v1 executor (no     har
    participant P3018 as A LocalToolInfo with runtime=ToolRuntime.CLIENT and     path=None t
    participant P3019 as A LocalToolInfo declared with runtime=ToolRuntime.SERVER     but path
    participant P3020 as _reject_unsupported_concepts walks every local_tools     entry and woul
    participant P3021 as A client-runtime LocalToolInfo survives a forward+reverse     pass: agent
    participant P3022 as _apply_cli_config_databricks_to_pi()
    participant P3023 as _reject_uploaded_callable_tools()
    participant P3024 as _validated_harness_override()
    participant P3025 as _coerce_cumulative_field()
    participant P3026 as _validate_external_reasoning_effort()
    participant P3027 as _persist_external_codex_collaboration_mode_change()
    participant P3028 as _persist_external_subagent_start()
    participant P3029 as _native_terminal_name_for_harness()
    participant P3030 as _reject_reserved_cost_control_label_seed()
    participant P3031 as _require_access_sync()
    participant P3032 as _mcp_server_to_mcp_tool()
    participant P3033 as _resolve_dotted_callable()
    participant P3034 as _translate_mcp_tool_from_def()
    participant P3035 as _parse_cwd_hidden_scan_max_entries()
    participant P3036 as _parse_cwd_hidden_scan_overflow()
    participant P3037 as _parse_share_policy()
    participant P3038 as _reject_unregistered_spec_policy_handlers()
    participant P3039 as Codex app-server process and JSON-RPC client for native TUI sessions.
    participant P3040 as Return whether the explicit --model launch flag is opted in.      The flag
    participant P3041 as Detect whether the codex CLI accepts a global --model flag.      Runs co
    participant P3042 as Render a parsed codex version tuple for log / error messages.      :param vers
    participant P3043 as Return the TOML table name declared by *line*, if any.      This intentionally
    participant P3044 as Remove one TOML table and its subtables from a config document.      Used for
    participant P3045 as Build the generated Codex MCP server TOML section.      :param bridge_dir: Bri
    participant P3046 as Write *model* as the top-level model key in the session config.toml.
    participant P3047 as Upsert agent-meow MCP server config into config.toml.      Writes a [mcp
    participant P3048 as JSON-RPC client for a Codex app-server.      Connects via Unix socket (socke
    participant P3049 as Connect to the app-server and run the initialize handshake.          :returns:
    participant P3050 as Close the app-server client connection.          :returns: None.
    participant P3051 as Send one JSON-RPC request and wait for its response.          :param method: A
    participant P3052 as Send one JSON-RPC notification.          :param method: App-server notificatio
    participant P3053 as Send one JSON-RPC result for an app-server request.          Codex app-server
    participant P3054 as Yield app-server notifications until the connection closes.          :returns:
    participant P3055 as Read messages from the websocket and route responses/events.          :returns
    participant P3056 as Running native Codex app-server subprocess.      :param codex_path: Executable
    participant P3057 as Start the Codex app-server and wait for the socket.          :returns: None.
    participant P3058 as Mark the registered agent-meow policy hook as trusted.          A freshly-writ
    participant P3059 as Return a hint drawn from codex stderr when policy-hook trust fails.          C
    participant P3060 as Record that tool-call policy enforcement is inactive (fail-open).          Sin
    participant P3061 as Log that tool-call policy enforcement is inactive for this session.          C
    participant P3062 as Stop the app-server subprocess.          :returns: None.
    participant P3063 as Wait until the app-server socket accepts an initialized         client.
    participant P3064 as Capture recent app-server stderr for diagnostics.          :returns: None.
    participant P3065 as Build the shell command codex runs for the policy hook.      :param bridge_dir
    participant P3066 as Build the hooks.json payload registering the policy hook.      Registers o
    participant P3067 as Write hooks.json into the private CODEX_HOME (atomically).      :param cod
    participant P3068 as Extract *our* policy hooks for *cwd* from a hooks/list response.      Filt
    participant P3069 as Summarize a hooks/list response for a discovery-failure error.      Turns
    participant P3070 as Render untrusted hook metadata for a trust-failure error.      Surfaces codex'
    participant P3071 as Trust the agent-meow policy hook so codex actually runs it.      Runs the same
    participant P3072 as Build a configured native Codex app-server process wrapper.      :param socket
    participant P3073 as How a native Codex terminal should be launched, across all offerings.      Res
    participant P3074 as Return the provider id a launch routes through, for rollout synthesis.      Sy
    participant P3075 as Build a native-Codex launch that routes through a single provider entry.
    participant P3076 as Find a provider other than *exclude* that can route a native Codex launch.
    participant P3077 as Resolve a native-Codex launch when the Codex default is a subscription.
    participant P3078 as Resolve the native Codex launch config across all offerings.      Mirrors the
    participant P3079 as Build an app-server client for a persisted transport string.      The native C
    participant P3080 as Load an existing Codex thread into a freshly started app-server.      A rollou
    participant P3081 as Build terminal env overrides for the native Codex TUI.      :param app_server:
    participant P3082 as Drop granular approval/sandbox flags (and values) when bypass is on.      Remo
    participant P3083 as Build Codex CLI args for an app-server-backed TUI session.      The TUI attach
    participant P3084 as Send SIGTERM to a subprocess process group when possible.      :param process:
    participant P3085 as Return the child process group id used for crash-safe reaping.      :param pro
    participant P3086 as Send SIGKILL to a subprocess process group when possible.      :param process:
    participant P3087 as Deterministic model enumeration for sub-agent model awareness.  Backs the sy
    participant P3088 as One model a worker can run.      :param id: Provider-local model id, e.g.
    participant P3089 as A worker's enumerated model list plus its provenance.      :param source: Wher
    participant P3090 as The model provider a worker's spawn/launch path would route through.      :par
    participant P3091 as Non-secret identity of the provider's credential for cache keying.      Two pr
    participant P3092 as Cache identity for one provider's unfiltered listing.      Carries the full pr
    participant P3093 as Drop every cached provider listing.      Listings are cached per provider iden
    participant P3094 as Tag a model id with its vendor family.      Mirrors the token rule in     :fu
    participant P3095 as Resolve the declared harness for a (sub-)agent spec.      Mirrors the runner's
    participant P3096 as Resolve the model provider a worker's launch path would use.      Total by con
    participant P3097 as Resolve the provider, propagating failures to the catch-all wrapper.      Step
    participant P3098 as Mirror the per-harness legacy fallthrough of _build_*_spawn_env.      The
    participant P3099 as Map a databricks-* spec model to the runner-env-profile gateway.      Mirr
    participant P3100 as Mirror _build_claude_sdk_spawn_env's legacy auth branch.      Spec auth:
    participant P3101 as Mirror _build_openai_agents_sdk_spawn_env's legacy auth branch.      Spec
    participant P3102 as Mirror the codex / pi builders' legacy branch (profile + prefix only).      
    participant P3103 as Map a resolved :class:ProviderEntry to a provider descriptor.      :param en
    participant P3104 as Enumerate the models one worker can run, family-filtered.      Resolves the wo
    participant P3105 as Build the full sys_list_models payload for an agent spec.      One row per
    participant P3106 as Build one worker's catalog row, never raising.      :param spec: The worker's
    participant P3107 as Serialize a :class:ModelListing into the tool's JSON row shape.      :param
    participant P3108 as Map an enumeration failure to a secret-free note category.      Raw exception
    participant P3109 as Enumerate (or replay from cache) one provider's unfiltered listing.      Live
    participant P3110 as Build the curated static listing for a subscription CLI login.      :param pro
    participant P3111 as Decide whether a serving endpoint is a chat-capable LLM.      :param name: End
    participant P3112 as List LLM serving endpoints on the provider's Databricks workspace.      :param
    participant P3113 as Derive the model-listing URL from a provider base URL.      :param base_url: E
    participant P3114 as Resolve the provider's credential to a bearer-token string.      :param provid
    participant P3115 as List models from an OpenAI-compatible /v1/models endpoint.      :param pro
    participant P3116 as List models from the Anthropic models API (real keys only).      :param provid
    participant P3117 as _CodexGoalAgentStore
    participant P3118 as _CodexGoalRoutedRunner
    participant P3119 as TestJsonPreview
    participant P3120 as _StubLoadedSpec
    participant P3121 as _StubLoadedAgent
    participant P3122 as _ConversationStore
    participant P3123 as _AgentStore
    participant P3124 as _LoadedAgentStub
    participant P3125 as _RoutedRunner
    participant P3126 as _client_supplied_hook_elicitation_id()
    participant P3127 as _await_settled_managed_launch()
    participant P3128 as _parse_session_create_metadata()
    participant P3129 as _require_host_conn_for_worktree()
    participant P3130 as _require_cost_control_label_authority()
    participant P3131 as _registered_runner_id()
    participant P3132 as _codex_command_approval_response()
    participant P3133 as _initialize_codex_goal_runner()
    participant P3134 as _reject_unsupported_concepts()
    participant P3135 as _resolve_dotted_attr()
    participant P3136 as _fail_on_unsupported_tool()
    participant P3137 as _recover_callable_path()
    participant P3138 as _reject_wrong_transport_keys()
    participant P3139 as _parse_guardrails_ask_timeout()
    participant P3140 as _resolve_phase()
    participant P3141 as _parse_policy_ask_timeout()
    participant P3142 as Typed exceptions for the omnigent client.
    participant P3143 as Tests for llms.adapters.databricks — payload building and validation.
    participant P3144 as Databricks model serving rejects stream_options with 400.      The base 
    participant P3145 as Non-streaming payloads never had stream_options; confirm still clean.
    participant P3146 as When connection_params has no base_url and auto-resolution from     ~
    participant P3147 as When connection_params is absent, the adapter calls     :func:~?agent_meow
    participant P3148 as Tests for llms.adapters.gemini — translation logic.
    participant P3149 as User message with image_url data URI translates to Gemini     inlineData part.
    participant P3150 as External URL falls back to text placeholder since Gemini     does not support U
    participant P3151 as input_file with file_data translates to Gemini inlineData.
    participant P3152 as String user content becomes a single text part —     backward compatibility wit
    participant P3153 as A single Gemini stream chunk with two parallel function calls.
    participant P3154 as Parallel functionCall parts in one chunk must each receive a     distinct 
    participant P3155 as Two parallel Gemini function calls in a streamed response are assembled     int
    participant P3156 as A streaming chunk with text produces a Chat Completions text delta.
    participant P3157 as A streaming chunk with functionCall produces a tool_calls delta.
    participant P3158 as A streaming chunk with finishReason emits a separate finish chunk.
    participant P3159 as A streaming chunk with no candidates but usageMetadata yields usage.
    participant P3160 as A streaming chunk with empty candidates and no usage yields nothing.
    participant P3161 as _empty_chat_response returns a well-formed empty response.
    participant P3162 as None content (e.g. assistant with tool_calls only) yields empty parts.
    participant P3163 as API key is set in x-goog-api-key header.
    participant P3164 as Missing API key raises OmnigentError.
    participant P3165 as Tool declarations without description omit the field.
    participant P3166 as Non-function tool types are filtered out.
    participant P3167 as Unrecognized content part types pass through as-is.
    participant P3168 as input_file without a data: URI prefix raises ValueError.
    participant P3169 as Build an llm_request event with an llm_client attached.      :param cl
    participant P3170 as Tests for agent_meow.runtime.agent_cache.
    participant P3171 as Build a tar.gz in memory from a dict of {path: content}.     Returns the raw by
    participant P3172 as Store a tarball bundle in the artifact store under the given     bundle_locatio
    participant P3173 as On a full cache miss, load() downloads from artifact store,     extracts to dis
    participant P3174 as Second call to load() returns from in-memory cache without     re-parsing from
    participant P3175 as When the disk directory exists but memory cache is empty (e.g.     after server
    participant P3176 as load() raises KeyError when the bundle doesn't exist.
    participant P3177 as load() raises OmnigentError when the extracted spec     is invalid.
    participant P3178 as evict() removes from memory and disk.
    participant P3179 as evict() on a non-existent agent is a silent no-op.
    participant P3180 as Return the Authorization header of the sole MCP server.      :param loaded
    participant P3181 as The default load() (expand_env=False) leaves ${VAR} literal     even wh
    participant P3182 as load(expand_env=True) (the operator/template path) DOES expand     ${VAR}
    participant P3183 as replace() is fail-safe too: the warm-swap re-parse leaves     ${VAR} li
    participant P3184 as replace() extracts new bundle, swaps the in-memory spec,     and replaces the d
    participant P3185 as Tests for uploaded agent bundle validation (agent_meow/server/bundles.py).
    participant P3186 as Build a .tar.gz in memory from {archive_path: content}.      :param fi
    participant P3187 as Pack *yaml_text* into a .tar.gz bundle holding one agent.yaml.      Pr
    participant P3188 as validate_agent_bundle parses an uploaded bundle WITHOUT     expanding ${V
    participant P3189 as A bundle with no policies validates and returns the parsed spec.
    participant P3190 as enforce_handler_allowlist=False accepts a custom handler.      This is the
    participant P3191 as A bundle whose policy handler is registered validates.      ask_on_os_tools
    participant P3192 as An uploaded bundle naming an RCE gadget is rejected pre-execution.      The ha
    participant P3193 as The legacy callable: policy key is gated identically to handler:.
    participant P3194 as A malicious handler in a sub-agent's config.yaml is rejected.      The confi
    participant P3195 as A registered handler in a sub-agent's config.yaml validates.      Confirms the
    participant P3196 as Pack a minimal valid bundle whose os_env.cwd is *cwd*.
    participant P3197 as An uploaded bundle may not pin an absolute or ..-escaping cwd.      On a r
    participant P3198 as A relative, non-escaping os_env.cwd is accepted on the upload path.
    participant P3199 as The trusted single-user/local path keeps the documented absolute-cwd     behavi
    participant P3200 as An uploaded bundle may not declare a server-side Python callable: tool.
    participant P3201 as enforce_handler_allowlist=False accepts a server callable: tool.
    participant P3202 as A bundled tools/python/*.py tool file is not a callable: and is allowed.
    participant P3203 as The callable-tool guard catches a malicious callable hidden in a sub-agent.
    participant P3204 as _build_headers()
    participant P3205 as .chat_completions()
    participant P3206 as ._get_headers()
    participant P3207 as ._get_base_url()
    participant P3208 as _source_descriptor()
    participant P3209 as ._check_conversation_id()
    participant P3210 as _require_admin()
    participant P3211 as _require_external_status_forward()
    participant P3212 as _validated_cost_control_mode_override()
    participant P3213 as _summary_from_spec()
    participant P3214 as require_user()
    participant P3215 as _require_codex_native_goal_session()
    participant P3216 as _validate_label_def_cross_fields()
    participant P3217 as Return a successful endpoint body as a JSON object.      Used after :func:rai
    participant P3218 as WebSocket endpoint exposing an agent's live terminals to the browser.  This mo
    participant P3219 as Build the router exposing the terminal-attach WebSocket route.      Wired into
    participant P3220 as Authorize a terminal-attach WebSocket before accepting it.      Interactive at
    participant P3221 as Carries a runner-side close so the browser side mirrors it.
    participant P3222 as Forward frames between *browser_ws* (FastAPI) and *runner_ws*     (websockets c
    participant P3223 as Harness-aware host/plugin skill discovery for the web composer's slash-command
    participant P3224 as Map any harness spelling to its vendor family, or None.      Collapses var
    participant P3225 as Inputs a per-harness skill provider needs.      :param roots: Host-discovery r
    participant P3226 as Return *specs* with later same-name entries dropped (first wins).
    participant P3227 as Today's behavior: discover_host_skills over each root.
    participant P3228 as Return the extra (non-bundled) skills the session's harness exposes.      Disp
    participant P3229 as Best-effort JSON read; None on missing/unreadable/non-dict.
    participant P3230 as Settings files carrying enabledPlugins, weakest→strongest.      Claude Cod
    participant P3231 as Plugin keys force-enabled by Claude Code's managed (policy) tier.      ~/.cl
    participant P3232 as Resolve which plugins are enabled, honoring scope + local precedence     and th
    participant P3233 as Map <plugin>@<marketplace> → installPath for enabled+installed plugins.
    participant P3234 as Enabled Claude Code plugin skills, namespaced <plugin>:<skill>.      Plugi
    participant P3235 as Generic host walk (~/.claude/skills etc.) plus enabled plugins.
    participant P3236 as Codex skills: <bundle>/skills + ~/.codex/skills under the filter.
    participant P3237 as Cursor skills under ~/.cursor/skills (the ambient real home a     cursor-na
    participant P3238 as Pi exposes no *extra* discoverable skills to the menu.      Pi has its **own**
    participant P3239 as Tests for agent_meow.cli — bundle env var resolution.
    participant P3240 as Restore process-global logging mutations after each CLI test.      Several CLI
    participant P3241 as python -m agent-meow must dispatch through the same click CLI     as the in
    participant P3242 as Top-level prompt-shaped invocations no longer reach inner.cli.      :param
    participant P3243 as Build a run_claude_native stub that records its kwargs.      Shared by the
    participant P3244 as Build a run_codex_native stub that records its kwargs.      Shared by ag
    participant P3245 as Build a run_kiro_native stub that records its kwargs.
    participant P3246 as agent-meow claude --resume <conv_id> binds the agent-meow     session; unkn
    participant P3247 as agent-meow claude -r <conv_id> is the agent-meow resume shortcut.      Wit
    participant P3248 as agent-meow claude --resume (no value) requests the picker.      Bare --r
    participant P3249 as --session <id> is the legacy spelling kept around for one     release. It m
    participant P3250 as Passing --session and --resume together fails fast.      Both spelling
    participant P3251 as --profile-startup starts timing before backend setup.      This covers the
    participant P3252 as --use-native-config sets use_claude_config=True in run_claude_native
    participant P3253 as agent-meow codex --resume <conv_id> binds the agent-meow     session and pr
    participant P3254 as agent-meow codex --resume requests the codex-native picker.
    participant P3255 as agent-meow codex --session <id> routes into session_id.
    participant P3256 as Passing --session and --resume together fails fast.
    participant P3257 as agent-meow kiro is a true top-level Click command.
    participant P3258 as agent-meow kiro routes mapped options to the native Kiro runner.
    participant P3259 as agent-meow kiro --resume requests the Kiro-native picker.
    participant P3260 as Invalid Kiro resume inputs fail before backend side effects.
    participant P3261 as Kiro-owned resume flags are reserved for internal cold-resume mapping.
    participant P3262 as Invoke a bundled-agent shorthand with run's dispatcher mocked.      Stubs
    participant P3263 as agent-meow polly dispatches run on the packaged polly agent.      The
    participant P3264 as agent-meow debby dispatches run on the packaged debby agent.
    participant P3265 as A stray positional after the shorthand is a usage error, not a launch.      
    participant P3266 as Bare agent-meow (Claude creds) and agent-meow polly launch the SAME agen
    participant P3267 as Write an isolated ~/.agent_meow/config.yaml with *providers*.      :param
    participant P3268 as Polly/Debby launch with the first available credential (#334).      With a Cla
    participant P3269 as An existing explicit default is not re-written on bundled launch (#334).
    participant P3270 as No available credential → no config write; the launch still dispatches (#334).
    participant P3271 as A corrupt on-disk config degrades to launch, never crashes (#334).      The fa
    participant P3272 as An ambiguous config (two defaults for one family) degrades, never crashes.
    participant P3273 as Authenticated remote runners advertise the tunnel-token-bound id.      :param
    participant P3274 as Local server runners keep stable identity and use token auth.      :param monk
    participant P3275 as Runner startup failure points users at the captured log file.      :param monk
    participant P3276 as agent-meow server is a pure state server — no embedded runner.      The se
    participant P3277 as A server with explicit --database-uri binds its own port, never reuses.
    participant P3278 as An explicit --port starts a dedicated local server.      A healthy canonic
    participant P3279 as An explicit --port must fail instead of choosing a replacement.      The t
    participant P3280 as A refused client connection does not make an explicit port unavailable.      A
    participant P3281 as Write a config.yaml to the agent directory.      :param agent_dir: The agent i
    participant P3282 as Write an MCP server YAML file under tools/mcp/.      :param agent_dir: The age
    participant P3283 as _expand_config_env_vars resolves ${VAR} in     llm.connection value
    participant P3284 as _expand_config_env_vars resolves ${VAR} in     tools.builtins dict-
    participant P3285 as _expand_config_env_vars resolves ${VAR} in     executor.connection
    participant P3286 as _expand_config_env_vars resolves ${VAR} in     executor.auth.api_key
    participant P3287 as executor.auth with a non-api_key type is not expanded.      A type:
    participant P3288 as _expand_config_env_vars returns False when the     config has no fields
    participant P3289 as _expand_config_env_vars raises OmnigentError     when a ${VAR} refe
    participant P3290 as _resolve_bundle_env_vars returns resolved     config.yaml content with
    participant P3291 as _resolve_bundle_env_vars returns resolved MCP config     YAML with expanded
    participant P3292 as _resolve_bundle_env_vars resolves ${VAR} in a stdio MCP     server's 
    participant P3293 as _resolve_bundle_env_vars returns an empty dict when     the config has no e
    participant P3294 as _resolve_bundle_env_vars raises OmnigentError     when a config.yaml en
    participant P3295 as Extract and parse a YAML file from a tar.gz bundle.      :param bundle_bytes:
    participant P3296 as _bundle produces a tarball where config.yaml has     ${VAR} referen
    participant P3297 as _bundle produces a tarball where MCP server YAML files     have ${VAR}
    participant P3298 as _bundle produces a valid tarball even when no env vars     need expansion —
    participant P3299 as _bundle wraps a standalone agent-meow YAML file in a tarball.      agent
    participant P3300 as _bundle returns the raw bytes of an existing .tar.gz     file without m
    participant P3301 as _bundle raises OmnigentError when the agent     directory contains an u
    participant P3302 as In-memory agent store stub capturing the exact shape     :func:_preregister_ag
    participant P3303 as :returns: Always None — fresh store, no collisions.
    participant P3304 as Stubbed — replace-path not exercised by these tests.
    participant P3305 as Record the create-call for assertions.
    participant P3306 as In-memory artifact store stub.
    participant P3307 as Record the put-call for assertions.
    participant P3308 as Stubbed — replace-path not exercised.
    participant P3309 as In-memory AgentCache stub. Captures the disk-cache swap path     so tests can a
    participant P3310 as Record the replace-call for assertions.          :param agent_id: Agent id bei
    participant P3311 as A directory source (config.yaml + assets) registers as the     canonical ag
    participant P3312 as A standalone agent-meow YAML file registers identically — the     spec's name
    participant P3313 as The bytes written to the artifact store must be a valid tarball     that, when
    participant P3314 as No-AGENT run materialization writes a standalone agent-meow YAML file.
    participant P3315 as run --harness kimi bakes a caller-process os_env so the SDK kimi     op
    participant P3316 as Bare run (no AGENT, no --harness) with nothing configured drops into     
    participant P3317 as run --harness -p dispatches headlessly with the generated YAML.      Under
    participant P3318 as Write a minimal default-agent YAML declaring *harness*; return its path.
    participant P3319 as With no default_agent, the target is None (no-AGENT launcher / error path).
    participant P3320 as No --harness → the configured default_agent is used (unchanged behavior).
    participant P3321 as --harness matching the default agent's harness → use the configured agent.
    participant P3322 as A --harness that differs from the default agent's harness warns and returns
    participant P3323 as Unsupported no-AGENT harness values fail before run_chat dispatch.
    participant P3324 as Unsupported harness values are validated for existing AGENT mode too.
    participant P3325 as --harness openai-agents-sdk passes validation and dispatches.      This is
    participant P3326 as Removed runner-flow escape hatches are no longer accepted by click.
    participant P3327 as attach fails loud when there is no server to join — it never spawns one.
    participant P3328 as Existing run AGENT --harness behavior still passes through.
    participant P3329 as Bare --resume forwards as resume_picker=True.
    participant P3330 as --resume <id> forwards as resume_conversation_id (not picker).
    participant P3331 as attach <id> --server joins the live conversation via run_attach     (th
    participant P3332 as attach fails loud when the session is not live, and never calls run_attach.
    participant P3333 as Headless -p can resume by routing through the session-backed chat path.
    participant P3334 as run AGENT -p runs one-shot against the daemon-backed server.      Without
    participant P3335 as Server addresses must be passed with --server, not as AGENT.
    participant P3336 as run --server URL connects directly to that server.
    participant P3337 as run --server URL --resume <id> (no AGENT) resumes via run_attach.
    participant P3338 as Terminal-native run --server --resume redirects before attach checks.
    participant P3339 as A one-shot -p with --server --resume must NOT reroute to attach.
    participant P3340 as Local-agent-only flags with --server --resume fail loud, not no-op.      
    participant P3341 as OMNIGENT_CONFIG_HOME redirects the user config path.      :param monkeypat
    participant P3342 as _load_global_config returns {} when the config file does not exist.
    participant P3343 as _save_global_config persists values that _load_global_config     reads
    participant P3344 as A second _save_global_config call merges new keys without     overwriting e
    participant P3345 as _save_global_config with unset_keys removes specified keys.      :para
    participant P3346 as _is_run_shorthand returns True only for file-path targets.      :param arg
    participant P3347 as agent-meow config list prints a no-defaults message when neither     global
    participant P3348 as The removed flat config forms error with a hint at the new subcommand.
    participant P3349 as agent-meow config set --global key=value persists the value so that     _
    participant P3350 as auto_open_conversation=true persists as a real YAML boolean.      :param m
    participant P3351 as OMNIGENT_CONFIG_HOME redirects both the write and the reported path.
    participant P3352 as auto_open_conversation accepts only explicit boolean values.      :param m
    participant P3353 as agent-meow config list prints all defaults that were previously     written
    participant P3354 as config list shows a shared config file once when cwd is its home.      Whe
    participant P3355 as agent-meow config unset --global server removes the key from     the config
    participant P3356 as agent-meow config set --global unknown=value rejects keys that are     not
    participant P3357 as agent-meow config set profile=... fails with the unknown-key error.      P
    participant P3358 as agent-meow config set key=value without --global writes to     .agent
    participant P3359 as agent-meow run (no AGENT arg) uses the default_agent key from     globa
    participant P3360 as An explicit CLI arg on agent-meow run takes precedence over the     corresp
    participant P3361 as agent-meow run forwards the persisted browser-open setting.      :param mo
    participant P3362 as Wire agent-meow run to capture dispatch kwargs without launching.      Poi
    participant P3363 as Interactive agent-meow run opens the browser by default.      With no au
    participant P3364 as Headless agent-meow run -p stays quiet by default.      A one-shot -p
    participant P3365 as An explicit auto_open_conversation: false suppresses the open.      Users
    participant P3366 as Headless run -p still opens when the user explicitly opted in.      The he
    participant P3367 as _resolve_auto_open_conversation_setting distinguishes unset from set.
    participant P3368 as agent-meow attach reads browser-open from config and forwards it to run_atta
    participant P3369 as agent-meow claude forwards the persisted browser-open setting.      :param
    participant P3370 as agent-meow codex forwards the persisted browser-open setting.      :param
    participant P3371 as Bare agent-meow with only harness in global config dispatches     to 
    participant P3372 as agent-meow --harness ... is shorthand for agent-meow run --harness ....
    participant P3373 as Bare agent-meow in a non-interactive shell (no TTY) shows help.      On a
    participant P3374 as Bare agent-meow on an interactive terminal behaves like agent-meow run.
    participant P3375 as Top-level server URLs must use run --server explicitly.
    participant P3376 as An unknown subcommand falls through to click's standard error.      A typo'd c
    participant P3377 as agent-meow setup is the visible standard setup flow command.
    participant P3378 as --no-internal-beta runs the model/credential picker, not the Databricks boot
    participant P3379 as A short first-run terminal should show the setup picker, not scroll past it.
    participant P3380 as Roomy terminals keep the full first-run lockup.
    participant P3381 as Build a fake subprocess.run for the Node preflight helpers.      Dispatche
    participant P3382 as A machine without node on PATH reports the missing-binary problem.      Th
    participant P3383 as A Node new enough for the probe (exit 0) reports no problem.
    participant P3384 as A Node failing the capability probe surfaces the detected version and     the e
    participant P3385 as A flaky/timed-out probe yields no problem — setup must not block on a     trans
    participant P3386 as _node_version strips the trailing newline and is non-fatal.
    participant P3387 as With a recent Node and tmux on PATH, the preflight prints nothing.
    participant P3388 as When both Node (too old) and tmux (missing) are problems, a single     warning
    participant P3389 as Every command registered on the cli group is in _CLICK_SUBCOMMANDS.
    participant P3390 as Return a default_provider_for_harness stub truthy only for *configured*.
    participant P3391 as Claude configured → claude-sdk + the bundled polly agent.      Claude wins the
    participant P3392 as No Claude → Codex (then Pi) with NO default example agent (bare REPL).
    participant P3393 as Nothing configured → None (caller drops into configure).
    participant P3394 as The derived first-run pick is returned but NOT persisted as a default.      Pe
    participant P3395 as Adding Claude promotes a Codex-only user to polly on the next bare run.      B
    participant P3396 as No creds → drop into configure harnesses; still none after → None.      The
    participant P3397 as The callout names each adopted credential inline with a brand-qualified label.
    participant P3398 as Nothing adopted → no callout at all (no stray header on a quiet run).      The
    participant P3399 as The shared adopt step self-heals, adopts, and announces the adopted creds.
    participant P3400 as A file-backed SQLite URI gets its parent directory created.      Reproduces th
    participant P3401 as Calling twice (dir already present) is a no-op, not an error.      exist_ok=
    participant P3402 as In-memory SQLite and non-SQLite URIs create nothing and don't raise.      :m
    participant P3403 as Build _dispatch_native_terminal_harness kwargs with safe defaults.      Ke
    participant P3404 as run --harness cursor-native dispatches to the cursor TUI wrapper.      Reg
    participant P3405 as A non-native harness returns False and never touches the backend.      The SDK
    participant P3406 as REPL-only flags have no analog in the TUI wrapper — fail loud, don't drop.
    participant P3407 as --continue resolves the harness's latest conversation, not an error.
    participant P3408 as --continue with nothing to continue errors, not a silent fresh start.
    participant P3409 as An explicit --resume <id> wins over --continue (no latest lookup).
    participant P3410 as run AGENT --harness cursor-native is rejected (the TUI is the agent).
    participant P3411 as Env-var auth is detected; a fresh install with no auth is NOT.      Guards the
    participant P3412 as An auth type selected via /auth (persisted to settings.json) is detected.
    participant P3413 as When the qwen CLI is missing and the user declines, the drill-in returns.
    participant P3414 as With the CLI installed, choosing \"← Back\" exits without launching qwen.      T
    participant P3415 as When the goose CLI is missing, the drill-in shows the install hint and     retu
    participant P3416 as With the CLI installed, choosing \"← Back\" exits without launching configure.
    participant P3417 as Choosing \"Run goose configure\" launches the configure flow, then exits.
    participant P3418 as A missing kimi CLI shows the curl install_hint and returns.      Kimi is curl-
    participant P3419 as With the CLI installed, choosing \"← Back\" exits without signing in.
    participant P3420 as Selecting \"Sign in\" drives harness_login(KIMI_KEY) then loops; Back exits.
    participant P3421 as Keep the browser goal API path from failing as a JSON parse error.      The co
    participant P3422 as Tests for llms.adapters.vertex — connection_params resolution.
    participant P3423 as None input raises OmnigentError — Vertex requires     connection_params
    participant P3424 as Empty dict raises OmnigentError — Vertex requires     connection_params wit
    participant P3425 as If connection_params already has \"base_url\", pass through unchanged.
    participant P3426 as \"project\" and \"location\" are converted to a Vertex \"base_url\".
    participant P3427 as OmnigentError when \"location\" is provided but \"project\" is not.     No
    participant P3428 as OmnigentError when \"project\" is provided but \"location\" is not.     No
    participant P3429 as Params without \"project\", \"location\", or \"base_url\"     raise Omnig
    participant P3430 as The Vertex URL follows the expected GCP pattern.
    participant P3431 as VertexAdapter._get_base_url always raises — Vertex requires connection_params.
    participant P3432 as URL changes with region.
    participant P3433 as Extra keys in connection_params are preserved after resolution.
    participant P3434 as Tests for :mod:~?agent_meow.onboarding.ucode_cleanup.  The fixture configs m
    participant P3435 as The strip removes exactly ucode's keys and nothing the user owns.      This is
    participant P3436 as A profile pointing at the user's own profile is never touched.      The se
    participant P3437 as A config ucode never touched is not rewritten at all.      Byte-identity (not
    participant P3438 as A missing config is a no-op — and is not created as a side effect.
    participant P3439 as A config that was *only* ucode's strips down to nothing.      Leftover empty 
    participant P3440 as An unparseable config fails loud instead of being rewritten.      Rewriting a
    participant P3441 as Existing sidecars are deleted and reported; missing ones are skipped.
    participant P3442 as Build ucode's web_search MCP entry as ucode registers it (env marker).      :r
    participant P3443 as Build a ucode web_search entry recognizable only by its binary name.      :ret
    participant P3444 as Build a web_search entry the user registered themselves.      :returns: An
    participant P3445 as A ucode-owned web_search entry is detected and removal delegated.      Bot
    participant P3446 as The claude CLI is never invoked unless a ucode-owned entry is found.      Remo
    participant P3447 as No ~/.claude.json means nothing to do (fresh machine / no Claude).
    participant P3448 as The orchestrator cleans a realistically-wired HOME end to end.      Sets up a
    participant P3449 as On a machine ucode never touched, the cleanup is a pure no-op.
    participant P3450 as Tests for POST /v1/sessions/{source_id}/fork.  Exercises the fork endpoint
    participant P3451 as Permission gating for the environment /shell proxy endpoint.  A shared ses
    participant P3452 as In-memory conversation store exposing get_conversation.
    participant P3453 as In-memory permission store with the methods access checks use.
    participant P3454 as Runner client that records POSTs and returns a canned shell result.      A POS
    participant P3455 as A read-only collaborator cannot run shell, and the runner is never hit.
    participant P3456 as Unauthenticated shell exec is rejected.      Without X-Forwarded-Email, st
    participant P3457 as An edit collaborator is allowed through and the command is proxied.
    participant P3458 as Tests for _parse_guardrails and helpers — spec-load behavior for the policy
    participant P3459 as Parse YAML text using the spec's custom loader.      Needed so on:, off:
    participant P3460 as Absent guardrails: block → None (no-op engine).
    participant P3461 as Empty guardrails block parses to a GuardrailsSpec     with default ask_timeout
    participant P3462 as guardrails: [...] or other non-dict → clear error.
    participant P3463 as Author-supplied ask_timeout: overrides the default.
    participant P3464 as ask_timeout: 0 → fail-loud at spec load (POLICIES.md §13).      A zero timeo
    participant P3465 as Negative ask_timeout → same §13 rejection.
    participant P3466 as Non-integer ask_timeout → loud error (no silent coercion).
    participant P3467 as integrity: \"1\" → LabelDef(initial=\"1\", values=None).
    participant P3468 as Full-schema dict: initial + values both land.
    participant P3469 as {values: [...]} without initial —     label is unset until a policy writes it
    participant P3470 as integrity: {} → typo guard (POLICIES.md §13).      An empty dict declaring n
    participant P3471 as initial: \"5\" with values: [\"1\", \"2\"] → fail at load.
    participant P3472 as values: 1 → clear error (must be a list).
    participant P3473 as Bare-string function: path → FunctionRef with no arguments.
    participant P3474 as handler: is accepted as an alias for function:.      The proto/service-pol
    participant P3475 as function: {path, arguments} → factory form.
    participant P3476 as Function policy without function: field → loud error.
    participant P3477 as function: {arguments: {...}} (no path) → loud error.
    participant P3478 as function.arguments: [1, 2] → loud error.
    participant P3479 as Policies land in the list in their YAML declaration     order — the engine iter
    participant P3480 as type: weird → clear error listing the accepted value.
    participant P3481 as Every policy must declare type: — the dispatcher     uses it to pick the conc
    participant P3482 as A policy may override the spec-wide ask_timeout: via     its own field — vali
    participant P3483 as Per-policy ask_timeout: 0 → same §13 rejection as     spec-level: the zero-is
    participant P3484 as Write a full config.yaml that exercises the     guardrails block alongside othe
    participant P3485 as Top-level parse() populates AgentSpec.guardrails.
    participant P3486 as AgentSpec.guardrails is None when the block is absent —     runtime builds a no
    participant P3487 as The custom _ConfigYamlLoader must NOT convert     on: into a boolean ke
    participant P3488 as The narrowing must not break true / false —     other parts of the spec
    participant P3489 as Omitted condition → None (always-match).
    participant P3490 as condition: {} is treated identically to an omitted     condition: field
    participant P3491 as Unquoted YAML ints / bools coerce to strings — labels     are always string-val
    participant P3492 as List-of-values condition → every element coerced.
    participant P3493 as condition: [foo, bar] → loud rejection. Only a dict     makes sense for a lab
    participant P3494 as _require_collaboration_mode_forward()
    participant P3495 as test_omnigent_error_with_harness_violation_code_returns_500()
    participant P3496 as Return True when *exc* signals a context-window overflow.      Walks exc
    participant P3497 as Structured detail about an LLM call failure.      :param provider: Provider na
    participant P3498 as An LLM call failure that may be retried.      Raised by the retry loop when th
    participant P3499 as An LLM call failure that should NOT be retried.      Raised when the adapter t
    participant P3500 as Antigravity Gemini API-key credential storage for agent-meow setup.  Antig
    participant P3501 as Return whether the google-antigravity SDK (the optional extra) is importable
    participant P3502 as Return the argv that installs the antigravity extra into this env.      De
    participant P3503 as Install the antigravity extra; return whether the SDK is now present.
    participant P3504 as Return whether *value* looks like a Gemini / Google API key.      :param value
    participant P3505 as Return the configured Gemini API-key secret reference, if any.      Reads the
    participant P3506 as Resolve the configured Gemini API key to plaintext, softly.      Never raises:
    participant P3507 as Return whether a usable Gemini API key is configured.      True only when
    participant P3508 as Build the {\"antigravity\": {\"api_key_ref\": ref}} settings dict.      :param
    participant P3509 as GitHub Copilot token storage for agent-meow setup and the runtime.  Copilo
    participant P3510 as Return whether *value* has the shape of a Copilot-capable GitHub token.      :
    participant P3511 as Return whether the Copilot SDK (the optional extra) is importable.      The ex
    participant P3512 as Return the argv that installs the copilot extra into this env.      Delega
    participant P3513 as Install the copilot extra; return whether the SDK is now present.      She
    participant P3514 as Return the configured Copilot GitHub-token secret reference, if any.      Read
    participant P3515 as Resolve the configured Copilot GitHub token to its plaintext value, softly.
    participant P3516 as Return whether a usable Copilot GitHub token is configured.      True only
    participant P3517 as Build the {\"copilot\": {...}} settings dict that records *ref*.      Handed
    participant P3518 as Cursor API-key credential storage for agent-meow setup and the runtime.  C
    participant P3519 as Return whether the cursor-sdk SDK (the optional extra) is importable.
    participant P3520 as Return the argv that installs the cursor extra into this env.      Delegat
    participant P3521 as Install the cursor extra; return whether the SDK is now present.      Shel
    participant P3522 as Return whether *value* has the shape of a Cursor API key.      :param value: A
    participant P3523 as Return the configured Cursor API-key secret reference, if any.      Reads the
    participant P3524 as Resolve the configured Cursor API key to its plaintext value, softly.      Loo
    participant P3525 as Return whether a usable Cursor API key is configured.      True only when
    participant P3526 as Build the {\"cursor\": {...}} settings dict that records *ref*.      Handed
    participant P3527 as Validate an agent directory's config.yaml.  Parses and validates the agent spe
    participant P3528 as Validate an agent directory's config.yaml.      Returns \"Valid: <agent-name>
    participant P3529 as Structured server error envelopes stay structured.
    participant P3530 as Successful HTML fallback pages raise OmnigentError with context.
    participant P3531 as Success endpoints expecting objects reject other JSON types.
    participant P3532 as Empty non-JSON bodies report the missing response details explicitly.
    participant P3533 as Tests for egress_rules parser validation in agent_meow.spec.parser.
    participant P3534 as None input returns None (no egress filtering).
    participant P3535 as Empty list returns None (treated as no filtering).
    participant P3536 as Valid rules are returned as-is after validation.
    participant P3537 as Non-list input raises OmnigentError.
    participant P3538 as Non-string entry raises OmnigentError.
    participant P3539 as Invalid rule syntax raises OmnigentError.
    participant P3540 as Egress rules require a backend that can hard-enforce network     isolation at s
    participant P3541 as egress_rules is accepted for both linux_bwrap (Linux)     AND darwin_
    participant P3542 as No egress_rules is valid with any backend type.
    participant P3543 as S2: when egress_allow_private_destinations is omitted from     the YAML, th
    participant P3544 as S2: an explicit egress_allow_private_destinations: true in     the YAML opt
    participant P3545 as S2: a non-boolean value for egress_allow_private_destinations     is reject
    participant P3546 as Tests for llms.adapters.anthropic — translation logic.
    participant P3547 as User message with image_url data URI translates to Anthropic     base64 image s
    participant P3548 as External image URL translates to Anthropic URL source type.
    participant P3549 as input_file with file_data translates to Anthropic document type.
    participant P3550 as input_file with a text/markdown MIME uses Anthropic's \"text\" source     type (d
    participant P3551 as input_file with text/plain MIME also uses the \"text\" source type.      Same ru
    participant P3552 as String user content passes through unchanged — no translation     needed for te
    participant P3553 as API key is set in the x-api-key header.
    participant P3554 as Missing API key raises OmnigentError.
    participant P3555 as Empty string API key raises OmnigentError.
    participant P3556 as When max_tokens is less than the effort's budget, clamp to max_tokens.
    participant P3557 as reasoning_effort in extra adds thinking config to the payload.
    participant P3558 as A single stop string is wrapped in a list.
    participant P3559 as A list of stop sequences passes through unchanged.
    participant P3560 as Text deltas in the SSE stream produce Chat Completions chunks.
    participant P3561 as Tool use blocks in the SSE stream produce tool_calls in chunks.
    participant P3562 as Non-data lines are silently skipped.
    participant P3563 as Unknown tool_choice values fall back to auto.
    participant P3564 as Non-function tool types are filtered out.
    participant P3565 as Unrecognized content part types pass through as-is.
    participant P3566 as max_completion_tokens is an alias for max_tokens.
    participant P3567 as Tests for the built-in agent bundle builders in agent_meow/server/app.py.
    participant P3568 as Return True when builder's shipped-example source is not packaged here.
    participant P3569 as Return the regular-file member names inside a gzipped tarball.
    participant P3570 as Each builder returns a gzip tarball that contains the agent's spec file.
    participant P3571 as Two builds yield byte-identical tarballs (the builders are content-addressable).
    participant P3572 as The shipped definition loads and every declared sub-agent survives.      A bas
    participant P3573 as A newer-server sub-agent the old client can't validate is dropped, not fatal.
    participant P3574 as Tests for the Codex elicitation protocol adapters.  These are pure-function te
    participant P3575 as Tests for the top-level request parser.
    participant P3576 as Tests for answer normalization.
    participant P3577 as Tests for command preview extraction.
    participant P3578 as Tests for the bounded preview function.
    participant P3579 as Tests for execpolicy amendment validation.
    participant P3580 as Agent store stub that supports get and create for fork tests.      Pre-populat
    participant P3581 as Initialize the stub.          :param agents: Map from agent ID to Agent entity
    participant P3582 as Return the agent or None.          :param agent_id: Agent ID to look up.
    participant P3583 as Record the create call and store the new agent.          :param agent_id: New
    participant P3584 as In-memory conversation store stub for route-level tests.      Provides the sub
    participant P3585 as Initialize the stub.          :param conversations: Map from conversation ID t
    participant P3586 as Return the conversation or None.          :param conversation_id: Conversation
    participant P3587 as Record the fork call and return a fixed new conversation.          :param sour
    participant P3588 as Return items for the given conversation.          :param conversation_id: Conv
    participant P3589 as Build a minimal Conversation entity for testing.      :param conv_id: Conversa
    participant P3590 as Build a minimal ConversationItem for testing.      :param item_id: Item id.
    participant P3591 as Build a FastAPI app with the sessions router and error handler.      Mirrors t
    participant P3592 as POST /sessions/{id}/fork returns 201, clones the agent, and     binds the fork
    participant P3593 as up_to_response_id reaches the store and the response is truncated.      Th
    participant P3594 as An up_to_response_id matching no response returns 400.      The store rais
    participant P3595 as POST /sessions/{id}/fork returns 404 when source doesn't exist.      If the ro
    participant P3596 as POST /sessions/{id}/fork returns 400 when source is a sub-agent session.
    participant P3597 as POST /sessions/{id}/fork returns 400 when source has no agent_id.      A conve
    participant P3598 as Minimal stand-in for LoadedAgent.spec exposing harness_kind.      The rout
    participant P3599 as :param harness_kind: Harness id, e.g. \"claude_sdk\".
    participant P3600 as Stand-in for AgentCache.load(...) result; carries .spec.
    participant P3601 as :param harness_kind: Harness id to expose on the spec.
    participant P3602 as Agent cache stub mapping agent_id → harness_kind.      :param harness_by_id: M
    participant P3603 as :param harness_by_id: agent_id → harness_kind map.
    participant P3604 as Return a loaded-agent stub for *agent_id*.          :param agent_id: Agent id
    participant P3605 as Build an agent store with a source agent and switchable targets.      :returns
    participant P3606 as Switching agent clones the TARGET's bundle, not the source's.      With agen
    participant P3607 as Switching to a session-scoped agent is rejected with 404.      A session-scope
    participant P3608 as Switching to a non-existent agent id is rejected with 404.
    participant P3609 as The switch gates model copy + native carry + UI mode on the target.      A mod
    participant P3610 as A same-agent fork of a native source still marks native carry.      Without an
    participant P3611 as A same-agent fork marks native carry for both cursor and pi.      cursor carri
    participant P3612 as The carry gate honors reversed native spellings like the canonical ones.
    participant P3613 as The fork clone reuses the source agent's name as-is — no suffix added.
    participant P3614 as A fork with an explicit model_override plumbs it into the store call.      The
    participant P3615 as A shell-/flag-shaped model_override is rejected before any fork.
    participant P3616 as A Claude model on a codex-native fork fails the family guard (400).      codex
    participant P3617 as An override fork fails CLOSED when the fork harness can't be resolved.      If
    participant P3618 as A normal fork (no override) is unaffected by an unresolvable harness.      The
    participant P3619 as Tests for the per-user read-state feature:    * PUT /v1/sessions/{session_id
    participant P3620 as Conversation store stub — unused by the PUT when auth is off.
    participant P3621 as Return None (no conversation lookups happen without auth).
    participant P3622 as Agent store stub — present only to satisfy the router factory.
    participant P3623 as Build a FastAPI app exposing the sessions router with no auth.
    participant P3624 as A minimal session-shaped conversation for the list-item builder.
    participant P3625 as Call the list-item builder the way GET /v1/sessions does.
    participant P3626 as Clear the module-level read-state caches around each test.
    participant P3627 as Marking unread persists the baseline + override and returns 204.
    participant P3628 as Marking seen (unread=false) drops the override and moves last_seen up.
    participant P3629 as _build_session_list_item reflects the caller's read-state.
    participant P3630 as A session the user never touched has no baseline and reads as seen.
    participant P3631 as One user's read-state doesn't leak into another user's list items.
    participant P3632 as Pruning a session drops its read-state from every user's caches.
    participant P3633 as Tests for POST /v1/sessions/{id}/switch-agent.  Exercises the in-place age
    participant P3634 as Agent store stub: get + list for the switch route.      :param agents: Pre-pop
    participant P3635 as :returns: The agent if present, else None.
    participant P3636 as Return the built-in (session_id is None) agents.          :param limit: Max ag
    participant P3637 as Conversation store stub for the switch route.      :param conversations: Map o
    participant P3638 as :returns: The conversation if present, else None.
    participant P3639 as Record the call and return the updated conversation.          :param conversat
    participant P3640 as :returns: A PagedList of the conversation's items.
    participant P3641 as Stub for get_agent_cache() — controls the bundle precheck.      :param rai
    participant P3642 as Pretend to load a bundle.          :param agent_id: Agent id (unused).
    participant P3643 as Loaded-agent stub exposing spec.executor.harness_kind.
    participant P3644 as Agent cache stub mapping agent id to harness kind.
    participant P3645 as Build a Conversation entity.      :param conv_id: Conversation id.     :param
    participant P3646 as Build an Agent entity.      :param agent_id: Agent id.     :param name: Agent
    participant P3647 as Build a FastAPI app mounting the sessions router + error handler.      :param
    participant P3648 as Stub the bundle-loading helpers so the route runs without a real     bundle, wi
    participant P3649 as A same-family native target keeps model settings, marks the native     rebuild,
    participant P3650 as A cross-family switch resets model settings but still carries history     into
    participant P3651 as Switching into cursor/pi native keeps terminal UI; carry gates per harness.
    participant P3652 as Switching to the built-in the session already runs (same bundle) is a     no-op
    participant P3653 as A successful switch publishes session.agent_changed on the session     stre
    participant P3654 as A rejected switch (no-op same-bundle target, 400) publishes nothing —     clien
    participant P3655 as A successful switch schedules a runner-side resource reset so the new     agent
    participant P3656 as Async runner-HTTP-client stub recording reset-state POSTs.      :param fail: W
    participant P3657 as Record the POST and return a real response of the stubbed status.          :pa
    participant P3658 as After the post-switch runner reset succeeds, the route's background     task pu
    participant P3659 as When the post-switch reset doesn't complete, NO     session.changed_files.inv
    participant P3660 as 404 when the session does not exist (before any mutation).
    participant P3661 as 400 when the session is a sub-agent (only top-level can switch).
    participant P3662 as 404 when the target is a session-scoped agent (not a built-in).
    participant P3663 as 409 when a turn is running — switching mid-turn is rejected.
    participant P3664 as 400 when the target bundle can't load — fails before deleting the old     agent
    participant P3665 as Tests for agent_meow.spec.load().
    participant P3666 as Create a minimal valid agent image directory.
    participant P3667 as Build a tar.gz at tmp_path/bundle.tar.gz.
    participant P3668 as A .yaml file that's missing the prompt key fails the     omnigent-YAML
    participant P3669 as A .yaml file with spec_version set looks like an     agent-meow spec bu
    participant P3670 as A .yaml file that PyYAML can't parse (e.g. an unquoted     colon in a value
    participant P3671 as A directory source is copied recursively into *dest*. This is     the path take
    participant P3672 as A single-file YAML source is placed at the root of *dest*     with its original
    participant P3673 as The file-source branch creates *dest* when it doesn't exist     (mkdir(parent
    participant P3674 as Non-existent *source* raises :class:FileNotFoundError with a     message poin
    participant P3675 as End-to-end sanity: materializing a directory and then calling     :func:load
    participant P3676 as Same end-to-end sanity for the YAML-file branch: materializing     a standalone
    participant P3677 as use_responses: false in an agent-meow YAML must land as Python False
    participant P3678 as agent-meow-compatible YAML carries generation kwargs under     executor.extra
    participant P3679 as An unrecognized harness is most often a client-older-than-server skew:     the
    participant P3680 as The version-skew hint is gated on a harness *enum mismatch*, not on any     e
    participant P3681 as Write a config.yaml parent bundle with agents/<name>/ children.      :
    participant P3682 as An unknown-harness sub-agent is dropped; the parent still loads.      This is
    participant P3683 as Default (strict) load still fails the whole spec — unchanged behavior.
    participant P3684 as Pruning never masks a genuine *root*-level error.
    participant P3685 as With only valid sub-agents, pruning is a no-op (nothing dropped).
    participant P3686 as Dropping a sub-agent is loud — a WARNING names it (never silent).
    participant P3687 as Depth-first: a bad *grandchild* is pruned without taking out its parent.
    participant P3688 as Round-trip invariant tests for the agent-meow ↔ AgentSpec adapter.  Asserts
    participant P3689 as Minimal agent-meow YAML — name + prompt only. Round-trip     checks that the ad
    participant P3690 as agent-meow YAML with an executor: block declaring     model + harness + pro
    participant P3691 as agent-meow YAML with one function-type tool pointing at a     real importable c
    participant P3692 as Load the YAML via agent-meow' loader, translate to an     :class:AgentSpec, t
    participant P3693 as A bare name + prompt YAML (no executor block) does     NOT round-trip —
    participant P3694 as Executor-block YAML (model + harness + profile) round-trips     unchanged.
    participant P3695 as # NOTE: imported from the same module as the reverse
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
    P2->>+ P323: uses
    P323-->>- P2: return
    P2->>+ P324: uses
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
    P2->>+ P363: uses
    P363-->>- P2: return
    P2->>+ P364: uses
    P364-->>- P2: return
    P2->>+ P365: uses
    P365-->>- P2: return
    P2->>+ P366: uses
    P366-->>- P2: return
    P2->>+ P367: uses
    P367-->>- P2: return
    P2->>+ P368: uses
    P368-->>- P2: return
    P2->>+ P369: uses
    P369-->>- P2: return
    P2->>+ P370: uses
    P370-->>- P2: return
    P2->>+ P371: uses
    P371-->>- P2: return
    P2->>+ P372: uses
    P372-->>- P2: return
    P2->>+ P373: uses
    P373-->>- P2: return
    P2->>+ P374: uses
    P374-->>- P2: return
    P2->>+ P375: uses
    P375-->>- P2: return
    P2->>+ P376: uses
    P376-->>- P2: return
    P2->>+ P377: uses
    P377-->>- P2: return
    P2->>+ P378: uses
    P378-->>- P2: return
    P2->>+ P379: uses
    P379-->>- P2: return
    P2->>+ P380: uses
    P380-->>- P2: return
    P2->>+ P381: uses
    P381-->>- P2: return
    P2->>+ P382: uses
    P382-->>- P2: return
    P2->>+ P383: uses
    P383-->>- P2: return
    P2->>+ P384: uses
    P384-->>- P2: return
    P2->>+ P385: uses
    P385-->>- P2: return
    P2->>+ P386: uses
    P386-->>- P2: return
    P2->>+ P387: uses
    P387-->>- P2: return
    P2->>+ P388: uses
    P388-->>- P2: return
    P2->>+ P389: uses
    P389-->>- P2: return
    P2->>+ P390: uses
    P390-->>- P2: return
    P2->>+ P391: uses
    P391-->>- P2: return
    P2->>+ P392: uses
    P392-->>- P2: return
    P2->>+ P393: uses
    P393-->>- P2: return
    P2->>+ P394: uses
    P394-->>- P2: return
    P2->>+ P395: uses
    P395-->>- P2: return
    P2->>+ P396: uses
    P396-->>- P2: return
    P2->>+ P397: uses
    P397-->>- P2: return
    P2->>+ P398: uses
    P398-->>- P2: return
    P2->>+ P399: uses
    P399-->>- P2: return
    P2->>+ P400: uses
    P400-->>- P2: return
    P2->>+ P401: uses
    P401-->>- P2: return
    P2->>+ P402: uses
    P402-->>- P2: return
    P2->>+ P403: uses
    P403-->>- P2: return
    P2->>+ P404: uses
    P404-->>- P2: return
    P2->>+ P405: uses
    P405-->>- P2: return
    P2->>+ P406: uses
    P406-->>- P2: return
    P2->>+ P407: uses
    P407-->>- P2: return
    P2->>+ P408: uses
    P408-->>- P2: return
    P2->>+ P409: uses
    P409-->>- P2: return
    P2->>+ P410: uses
    P410-->>- P2: return
    P2->>+ P411: uses
    P411-->>- P2: return
    P2->>+ P412: uses
    P412-->>- P2: return
    P2->>+ P413: uses
    P413-->>- P2: return
    P2->>+ P414: uses
    P414-->>- P2: return
    P2->>+ P415: uses
    P415-->>- P2: return
    P2->>+ P416: uses
    P416-->>- P2: return
    P2->>+ P417: uses
    P417-->>- P2: return
    P2->>+ P418: uses
    P418-->>- P2: return
    P2->>+ P419: uses
    P419-->>- P2: return
    P2->>+ P420: uses
    P420-->>- P2: return
    P2->>+ P421: uses
    P421-->>- P2: return
    P2->>+ P422: uses
    P422-->>- P2: return
    P2->>+ P423: uses
    P423-->>- P2: return
    P2->>+ P424: uses
    P424-->>- P2: return
    P2->>+ P425: uses
    P425-->>- P2: return
    P2->>+ P426: uses
    P426-->>- P2: return
    P2->>+ P427: uses
    P427-->>- P2: return
    P2->>+ P428: uses
    P428-->>- P2: return
    P2->>+ P429: uses
    P429-->>- P2: return
    P2->>+ P430: uses
    P430-->>- P2: return
    P2->>+ P431: uses
    P431-->>- P2: return
    P2->>+ P432: uses
    P432-->>- P2: return
    P2->>+ P433: uses
    P433-->>- P2: return
    P2->>+ P434: uses
    P434-->>- P2: return
    P2->>+ P435: uses
    P435-->>- P2: return
    P2->>+ P436: uses
    P436-->>- P2: return
    P2->>+ P437: uses
    P437-->>- P2: return
    P2->>+ P438: uses
    P438-->>- P2: return
    P2->>+ P439: uses
    P439-->>- P2: return
    P2->>+ P440: uses
    P440-->>- P2: return
    P2->>+ P441: uses
    P441-->>- P2: return
    P2->>+ P442: uses
    P442-->>- P2: return
    P2->>+ P443: uses
    P443-->>- P2: return
    P2->>+ P444: uses
    P444-->>- P2: return
    P2->>+ P445: uses
    P445-->>- P2: return
    P2->>+ P446: uses
    P446-->>- P2: return
    P2->>+ P447: uses
    P447-->>- P2: return
    P2->>+ P448: uses
    P448-->>- P2: return
    P2->>+ P449: uses
    P449-->>- P2: return
    P2->>+ P450: uses
    P450-->>- P2: return
    P2->>+ P451: uses
    P451-->>- P2: return
    P2->>+ P452: uses
    P452-->>- P2: return
    P2->>+ P453: uses
    P453-->>- P2: return
    P2->>+ P454: uses
    P454-->>- P2: return
    P2->>+ P455: uses
    P455-->>- P2: return
    P2->>+ P456: uses
    P456-->>- P2: return
    P2->>+ P457: uses
    P457-->>- P2: return
    P2->>+ P458: uses
    P458-->>- P2: return
    P2->>+ P459: uses
    P459-->>- P2: return
    P2->>+ P460: uses
    P460-->>- P2: return
    P2->>+ P461: uses
    P461-->>- P2: return
    P2->>+ P462: uses
    P462-->>- P2: return
    P2->>+ P463: uses
    P463-->>- P2: return
    P2->>+ P464: uses
    P464-->>- P2: return
    P2->>+ P465: uses
    P465-->>- P2: return
    P2->>+ P466: uses
    P466-->>- P2: return
    P2->>+ P467: uses
    P467-->>- P2: return
    P2->>+ P468: uses
    P468-->>- P2: return
    P2->>+ P469: uses
    P469-->>- P2: return
    P2->>+ P470: uses
    P470-->>- P2: return
    P2->>+ P471: uses
    P471-->>- P2: return
    P2->>+ P472: uses
    P472-->>- P2: return
    P2->>+ P473: uses
    P473-->>- P2: return
    P2->>+ P474: uses
    P474-->>- P2: return
    P2->>+ P475: uses
    P475-->>- P2: return
    P2->>+ P476: uses
    P476-->>- P2: return
    P2->>+ P477: uses
    P477-->>- P2: return
    P2->>+ P478: uses
    P478-->>- P2: return
    P2->>+ P479: uses
    P479-->>- P2: return
    P2->>+ P480: uses
    P480-->>- P2: return
    P2->>+ P481: uses
    P481-->>- P2: return
    P2->>+ P482: uses
    P482-->>- P2: return
    P2->>+ P483: uses
    P483-->>- P2: return
    P2->>+ P484: uses
    P484-->>- P2: return
    P2->>+ P485: uses
    P485-->>- P2: return
    P2->>+ P486: uses
    P486-->>- P2: return
    P2->>+ P487: uses
    P487-->>- P2: return
    P2->>+ P488: uses
    P488-->>- P2: return
    P2->>+ P489: uses
    P489-->>- P2: return
    P2->>+ P490: uses
    P490-->>- P2: return
    P2->>+ P491: uses
    P491-->>- P2: return
    P2->>+ P492: uses
    P492-->>- P2: return
    P2->>+ P493: uses
    P493-->>- P2: return
    P2->>+ P494: uses
    P494-->>- P2: return
    P2->>+ P495: uses
    P495-->>- P2: return
    P2->>+ P496: uses
    P496-->>- P2: return
    P2->>+ P497: uses
    P497-->>- P2: return
    P2->>+ P498: uses
    P498-->>- P2: return
    P2->>+ P499: uses
    P499-->>- P2: return
    P2->>+ P500: uses
    P500-->>- P2: return
    P2->>+ P501: uses
    P501-->>- P2: return
    P2->>+ P502: uses
    P502-->>- P2: return
    P2->>+ P503: uses
    P503-->>- P2: return
    P2->>+ P504: uses
    P504-->>- P2: return
    P2->>+ P505: uses
    P505-->>- P2: return
    P2->>+ P506: uses
    P506-->>- P2: return
    P2->>+ P507: uses
    P507-->>- P2: return
    P2->>+ P508: uses
    P508-->>- P2: return
    P2->>+ P509: uses
    P509-->>- P2: return
    P2->>+ P510: uses
    P510-->>- P2: return
    P2->>+ P511: uses
    P511-->>- P2: return
    P2->>+ P512: uses
    P512-->>- P2: return
    P2->>+ P513: uses
    P513-->>- P2: return
    P2->>+ P514: uses
    P514-->>- P2: return
    P2->>+ P515: uses
    P515-->>- P2: return
    P2->>+ P516: uses
    P516-->>- P2: return
    P2->>+ P517: uses
    P517-->>- P2: return
    P2->>+ P518: uses
    P518-->>- P2: return
    P2->>+ P519: uses
    P519-->>- P2: return
    P2->>+ P520: uses
    P520-->>- P2: return
    P2->>+ P521: uses
    P521-->>- P2: return
    P2->>+ P522: uses
    P522-->>- P2: return
    P2->>+ P523: uses
    P523-->>- P2: return
    P2->>+ P524: uses
    P524-->>- P2: return
    P2->>+ P525: uses
    P525-->>- P2: return
    P2->>+ P526: uses
    P526-->>- P2: return
    P2->>+ P527: uses
    P527-->>- P2: return
    P2->>+ P528: uses
    P528-->>- P2: return
    P2->>+ P529: uses
    P529-->>- P2: return
    P2->>+ P530: uses
    P530-->>- P2: return
    P2->>+ P531: uses
    P531-->>- P2: return
    P2->>+ P532: uses
    P532-->>- P2: return
    P2->>+ P533: uses
    P533-->>- P2: return
    P2->>+ P534: uses
    P534-->>- P2: return
    P2->>+ P535: uses
    P535-->>- P2: return
    P2->>+ P536: uses
    P536-->>- P2: return
    P2->>+ P537: uses
    P537-->>- P2: return
    P2->>+ P538: uses
    P538-->>- P2: return
    P2->>+ P539: uses
    P539-->>- P2: return
    P2->>+ P540: uses
    P540-->>- P2: return
    P2->>+ P541: uses
    P541-->>- P2: return
    P2->>+ P542: uses
    P542-->>- P2: return
    P2->>+ P543: uses
    P543-->>- P2: return
    P2->>+ P544: uses
    P544-->>- P2: return
    P2->>+ P545: uses
    P545-->>- P2: return
    P2->>+ P546: uses
    P546-->>- P2: return
    P2->>+ P547: uses
    P547-->>- P2: return
    P2->>+ P548: uses
    P548-->>- P2: return
    P2->>+ P549: uses
    P549-->>- P2: return
    P2->>+ P550: uses
    P550-->>- P2: return
    P2->>+ P551: uses
    P551-->>- P2: return
    P2->>+ P552: uses
    P552-->>- P2: return
    P2->>+ P553: uses
    P553-->>- P2: return
    P2->>+ P554: uses
    P554-->>- P2: return
    P2->>+ P555: uses
    P555-->>- P2: return
    P2->>+ P556: uses
    P556-->>- P2: return
    P2->>+ P557: uses
    P557-->>- P2: return
    P2->>+ P558: uses
    P558-->>- P2: return
    P2->>+ P559: uses
    P559-->>- P2: return
    P2->>+ P560: uses
    P560-->>- P2: return
    P2->>+ P561: uses
    P561-->>- P2: return
    P2->>+ P562: uses
    P562-->>- P2: return
    P2->>+ P563: uses
    P563-->>- P2: return
    P2->>+ P564: uses
    P564-->>- P2: return
    P2->>+ P565: uses
    P565-->>- P2: return
    P2->>+ P566: uses
    P566-->>- P2: return
    P2->>+ P567: uses
    P567-->>- P2: return
    P2->>+ P568: uses
    P568-->>- P2: return
    P2->>+ P569: uses
    P569-->>- P2: return
    P2->>+ P570: uses
    P570-->>- P2: return
    P2->>+ P571: uses
    P571-->>- P2: return
    P2->>+ P572: uses
    P572-->>- P2: return
    P2->>+ P573: uses
    P573-->>- P2: return
    P2->>+ P574: uses
    P574-->>- P2: return
    P2->>+ P575: uses
    P575-->>- P2: return
    P2->>+ P576: uses
    P576-->>- P2: return
    P2->>+ P577: uses
    P577-->>- P2: return
    P2->>+ P578: uses
    P578-->>- P2: return
    P2->>+ P579: uses
    P579-->>- P2: return
    P2->>+ P580: uses
    P580-->>- P2: return
    P2->>+ P581: uses
    P581-->>- P2: return
    P2->>+ P582: uses
    P582-->>- P2: return
    P2->>+ P583: uses
    P583-->>- P2: return
    P2->>+ P584: uses
    P584-->>- P2: return
    P2->>+ P585: uses
    P585-->>- P2: return
    P2->>+ P586: uses
    P586-->>- P2: return
    P2->>+ P587: uses
    P587-->>- P2: return
    P2->>+ P588: uses
    P588-->>- P2: return
    P2->>+ P589: uses
    P589-->>- P2: return
    P2->>+ P590: uses
    P590-->>- P2: return
    P2->>+ P591: uses
    P591-->>- P2: return
    P2->>+ P592: uses
    P592-->>- P2: return
    P2->>+ P593: uses
    P593-->>- P2: return
    P2->>+ P594: uses
    P594-->>- P2: return
    P2->>+ P595: uses
    P595-->>- P2: return
    P2->>+ P596: uses
    P596-->>- P2: return
    P2->>+ P597: uses
    P597-->>- P2: return
    P2->>+ P598: uses
    P598-->>- P2: return
    P2->>+ P599: uses
    P599-->>- P2: return
    P2->>+ P600: uses
    P600-->>- P2: return
    P2->>+ P601: uses
    P601-->>- P2: return
    P2->>+ P602: uses
    P602-->>- P2: return
    P2->>+ P603: uses
    P603-->>- P2: return
    P2->>+ P604: uses
    P604-->>- P2: return
    P2->>+ P605: uses
    P605-->>- P2: return
    P2->>+ P606: uses
    P606-->>- P2: return
    P2->>+ P607: uses
    P607-->>- P2: return
    P2->>+ P608: uses
    P608-->>- P2: return
    P2->>+ P609: uses
    P609-->>- P2: return
    P2->>+ P610: uses
    P610-->>- P2: return
    P2->>+ P611: uses
    P611-->>- P2: return
    P2->>+ P612: uses
    P612-->>- P2: return
    P2->>+ P613: uses
    P613-->>- P2: return
    P2->>+ P614: uses
    P614-->>- P2: return
    P2->>+ P615: uses
    P615-->>- P2: return
    P2->>+ P616: uses
    P616-->>- P2: return
    P2->>+ P617: uses
    P617-->>- P2: return
    P2->>+ P618: uses
    P618-->>- P2: return
    P2->>+ P619: uses
    P619-->>- P2: return
    P2->>+ P620: uses
    P620-->>- P2: return
    P2->>+ P621: uses
    P621-->>- P2: return
    P2->>+ P622: uses
    P622-->>- P2: return
    P2->>+ P623: uses
    P623-->>- P2: return
    P2->>+ P624: uses
    P624-->>- P2: return
    P2->>+ P625: uses
    P625-->>- P2: return
    P2->>+ P626: uses
    P626-->>- P2: return
    P2->>+ P627: uses
    P627-->>- P2: return
    P2->>+ P628: uses
    P628-->>- P2: return
    P2->>+ P629: uses
    P629-->>- P2: return
    P2->>+ P630: uses
    P630-->>- P2: return
    P2->>+ P631: uses
    P631-->>- P2: return
    P2->>+ P632: uses
    P632-->>- P2: return
    P2->>+ P633: uses
    P633-->>- P2: return
    P2->>+ P634: uses
    P634-->>- P2: return
    P2->>+ P635: uses
    P635-->>- P2: return
    P2->>+ P636: uses
    P636-->>- P2: return
    P2->>+ P637: uses
    P637-->>- P2: return
    P2->>+ P638: uses
    P638-->>- P2: return
    P2->>+ P639: uses
    P639-->>- P2: return
    P2->>+ P640: uses
    P640-->>- P2: return
    P2->>+ P641: uses
    P641-->>- P2: return
    P2->>+ P642: uses
    P642-->>- P2: return
    P2->>+ P643: uses
    P643-->>- P2: return
    P2->>+ P644: uses
    P644-->>- P2: return
    P2->>+ P645: uses
    P645-->>- P2: return
    P2->>+ P646: uses
    P646-->>- P2: return
    P2->>+ P647: uses
    P647-->>- P2: return
    P2->>+ P648: uses
    P648-->>- P2: return
    P2->>+ P649: uses
    P649-->>- P2: return
    P2->>+ P650: uses
    P650-->>- P2: return
    P2->>+ P651: uses
    P651-->>- P2: return
    P2->>+ P652: uses
    P652-->>- P2: return
    P2->>+ P653: uses
    P653-->>- P2: return
    P2->>+ P654: uses
    P654-->>- P2: return
    P2->>+ P655: uses
    P655-->>- P2: return
    P2->>+ P656: uses
    P656-->>- P2: return
    P2->>+ P657: uses
    P657-->>- P2: return
    P2->>+ P658: uses
    P658-->>- P2: return
    P2->>+ P659: uses
    P659-->>- P2: return
    P2->>+ P660: uses
    P660-->>- P2: return
    P2->>+ P661: uses
    P661-->>- P2: return
    P2->>+ P662: uses
    P662-->>- P2: return
    P2->>+ P663: uses
    P663-->>- P2: return
    P2->>+ P664: uses
    P664-->>- P2: return
    P2->>+ P665: uses
    P665-->>- P2: return
    P2->>+ P666: uses
    P666-->>- P2: return
    P2->>+ P667: uses
    P667-->>- P2: return
    P2->>+ P668: uses
    P668-->>- P2: return
    P2->>+ P669: uses
    P669-->>- P2: return
    P2->>+ P670: uses
    P670-->>- P2: return
    P2->>+ P671: uses
    P671-->>- P2: return
    P2->>+ P672: uses
    P672-->>- P2: return
    P2->>+ P673: uses
    P673-->>- P2: return
    P2->>+ P674: uses
    P674-->>- P2: return
    P2->>+ P675: uses
    P675-->>- P2: return
    P2->>+ P676: uses
    P676-->>- P2: return
    P2->>+ P677: uses
    P677-->>- P2: return
    P2->>+ P678: uses
    P678-->>- P2: return
    P2->>+ P679: uses
    P679-->>- P2: return
    P2->>+ P680: uses
    P680-->>- P2: return
    P2->>+ P681: uses
    P681-->>- P2: return
    P2->>+ P682: uses
    P682-->>- P2: return
    P2->>+ P683: uses
    P683-->>- P2: return
    P2->>+ P684: uses
    P684-->>- P2: return
    P2->>+ P685: uses
    P685-->>- P2: return
    P2->>+ P686: uses
    P686-->>- P2: return
    P2->>+ P687: uses
    P687-->>- P2: return
    P2->>+ P688: uses
    P688-->>- P2: return
    P2->>+ P689: uses
    P689-->>- P2: return
    P2->>+ P690: uses
    P690-->>- P2: return
    P2->>+ P691: uses
    P691-->>- P2: return
    P2->>+ P692: uses
    P692-->>- P2: return
    P2->>+ P693: uses
    P693-->>- P2: return
    P2->>+ P694: uses
    P694-->>- P2: return
    P2->>+ P695: uses
    P695-->>- P2: return
    P2->>+ P696: uses
    P696-->>- P2: return
    P2->>+ P697: uses
    P697-->>- P2: return
    P2->>+ P698: uses
    P698-->>- P2: return
    P2->>+ P699: uses
    P699-->>- P2: return
    P2->>+ P700: uses
    P700-->>- P2: return
    P2->>+ P701: uses
    P701-->>- P2: return
    P2->>+ P702: uses
    P702-->>- P2: return
    P2->>+ P703: uses
    P703-->>- P2: return
    P2->>+ P704: uses
    P704-->>- P2: return
    P2->>+ P705: uses
    P705-->>- P2: return
    P2->>+ P706: uses
    P706-->>- P2: return
    P2->>+ P707: uses
    P707-->>- P2: return
    P2->>+ P708: uses
    P708-->>- P2: return
    P2->>+ P709: uses
    P709-->>- P2: return
    P2->>+ P710: uses
    P710-->>- P2: return
    P2->>+ P711: uses
    P711-->>- P2: return
    P2->>+ P712: uses
    P712-->>- P2: return
    P2->>+ P713: uses
    P713-->>- P2: return
    P2->>+ P714: uses
    P714-->>- P2: return
    P2->>+ P715: uses
    P715-->>- P2: return
    P2->>+ P716: uses
    P716-->>- P2: return
    P2->>+ P717: uses
    P717-->>- P2: return
    P2->>+ P718: uses
    P718-->>- P2: return
    P2->>+ P719: uses
    P719-->>- P2: return
    P2->>+ P720: uses
    P720-->>- P2: return
    P2->>+ P721: uses
    P721-->>- P2: return
    P2->>+ P722: uses
    P722-->>- P2: return
    P2->>+ P723: uses
    P723-->>- P2: return
    P2->>+ P724: uses
    P724-->>- P2: return
    P2->>+ P725: uses
    P725-->>- P2: return
    P2->>+ P726: uses
    P726-->>- P2: return
    P2->>+ P727: uses
    P727-->>- P2: return
    P2->>+ P728: uses
    P728-->>- P2: return
    P2->>+ P729: uses
    P729-->>- P2: return
    P2->>+ P730: uses
    P730-->>- P2: return
    P2->>+ P731: uses
    P731-->>- P2: return
    P2->>+ P732: uses
    P732-->>- P2: return
    P2->>+ P733: uses
    P733-->>- P2: return
    P2->>+ P734: uses
    P734-->>- P2: return
    P2->>+ P735: uses
    P735-->>- P2: return
    P2->>+ P736: uses
    P736-->>- P2: return
    P2->>+ P737: uses
    P737-->>- P2: return
    P2->>+ P738: uses
    P738-->>- P2: return
    P2->>+ P739: uses
    P739-->>- P2: return
    P2->>+ P740: uses
    P740-->>- P2: return
    P2->>+ P741: uses
    P741-->>- P2: return
    P2->>+ P742: uses
    P742-->>- P2: return
    P2->>+ P743: uses
    P743-->>- P2: return
    P2->>+ P744: uses
    P744-->>- P2: return
    P2->>+ P745: uses
    P745-->>- P2: return
    P2->>+ P746: uses
    P746-->>- P2: return
    P2->>+ P747: uses
    P747-->>- P2: return
    P2->>+ P748: uses
    P748-->>- P2: return
    P2->>+ P749: uses
    P749-->>- P2: return
    P2->>+ P750: uses
    P750-->>- P2: return
    P2->>+ P751: uses
    P751-->>- P2: return
    P2->>+ P752: uses
    P752-->>- P2: return
    P2->>+ P753: uses
    P753-->>- P2: return
    P2->>+ P754: uses
    P754-->>- P2: return
    P2->>+ P755: uses
    P755-->>- P2: return
    P2->>+ P756: uses
    P756-->>- P2: return
    P2->>+ P757: uses
    P757-->>- P2: return
    P2->>+ P758: uses
    P758-->>- P2: return
    P2->>+ P759: uses
    P759-->>- P2: return
    P2->>+ P760: uses
    P760-->>- P2: return
    P2->>+ P761: uses
    P761-->>- P2: return
    P2->>+ P762: uses
    P762-->>- P2: return
    P2->>+ P763: uses
    P763-->>- P2: return
    P2->>+ P764: uses
    P764-->>- P2: return
    P2->>+ P765: uses
    P765-->>- P2: return
    P2->>+ P766: uses
    P766-->>- P2: return
    P2->>+ P767: uses
    P767-->>- P2: return
    P2->>+ P768: uses
    P768-->>- P2: return
    P2->>+ P769: uses
    P769-->>- P2: return
    P2->>+ P770: uses
    P770-->>- P2: return
    P2->>+ P771: uses
    P771-->>- P2: return
    P2->>+ P772: uses
    P772-->>- P2: return
    P2->>+ P773: uses
    P773-->>- P2: return
    P2->>+ P774: uses
    P774-->>- P2: return
    P2->>+ P775: uses
    P775-->>- P2: return
    P2->>+ P776: uses
    P776-->>- P2: return
    P2->>+ P777: uses
    P777-->>- P2: return
    P2->>+ P778: uses
    P778-->>- P2: return
    P2->>+ P779: uses
    P779-->>- P2: return
    P2->>+ P780: uses
    P780-->>- P2: return
    P2->>+ P781: uses
    P781-->>- P2: return
    P2->>+ P782: uses
    P782-->>- P2: return
    P2->>+ P783: uses
    P783-->>- P2: return
    P2->>+ P784: uses
    P784-->>- P2: return
    P2->>+ P785: uses
    P785-->>- P2: return
    P2->>+ P786: uses
    P786-->>- P2: return
    P2->>+ P787: uses
    P787-->>- P2: return
    P2->>+ P788: uses
    P788-->>- P2: return
    P2->>+ P789: uses
    P789-->>- P2: return
    P2->>+ P790: uses
    P790-->>- P2: return
    P2->>+ P791: uses
    P791-->>- P2: return
    P2->>+ P792: uses
    P792-->>- P2: return
    P2->>+ P793: uses
    P793-->>- P2: return
    P2->>+ P794: uses
    P794-->>- P2: return
    P2->>+ P795: uses
    P795-->>- P2: return
    P2->>+ P796: uses
    P796-->>- P2: return
    P2->>+ P797: uses
    P797-->>- P2: return
    P2->>+ P798: uses
    P798-->>- P2: return
    P2->>+ P799: uses
    P799-->>- P2: return
    P2->>+ P800: uses
    P800-->>- P2: return
    P2->>+ P801: uses
    P801-->>- P2: return
    P2->>+ P802: uses
    P802-->>- P2: return
    P2->>+ P803: uses
    P803-->>- P2: return
    P2->>+ P804: uses
    P804-->>- P2: return
    P2->>+ P805: uses
    P805-->>- P2: return
    P2->>+ P806: uses
    P806-->>- P2: return
    P2->>+ P807: uses
    P807-->>- P2: return
    P2->>+ P808: uses
    P808-->>- P2: return
    P2->>+ P809: uses
    P809-->>- P2: return
    P2->>+ P810: uses
    P810-->>- P2: return
    P2->>+ P811: uses
    P811-->>- P2: return
    P2->>+ P812: uses
    P812-->>- P2: return
    P2->>+ P813: uses
    P813-->>- P2: return
    P2->>+ P814: uses
    P814-->>- P2: return
    P2->>+ P815: uses
    P815-->>- P2: return
    P2->>+ P816: uses
    P816-->>- P2: return
    P2->>+ P817: uses
    P817-->>- P2: return
    P2->>+ P818: uses
    P818-->>- P2: return
    P2->>+ P819: uses
    P819-->>- P2: return
    P2->>+ P820: uses
    P820-->>- P2: return
    P2->>+ P821: uses
    P821-->>- P2: return
    P2->>+ P822: uses
    P822-->>- P2: return
    P2->>+ P823: uses
    P823-->>- P2: return
    P2->>+ P824: uses
    P824-->>- P2: return
    P2->>+ P825: uses
    P825-->>- P2: return
    P2->>+ P826: uses
    P826-->>- P2: return
    P2->>+ P827: uses
    P827-->>- P2: return
    P2->>+ P828: uses
    P828-->>- P2: return
    P2->>+ P829: uses
    P829-->>- P2: return
    P2->>+ P830: uses
    P830-->>- P2: return
    P2->>+ P831: uses
    P831-->>- P2: return
    P2->>+ P832: uses
    P832-->>- P2: return
    P2->>+ P833: uses
    P833-->>- P2: return
    P2->>+ P834: uses
    P834-->>- P2: return
    P2->>+ P835: uses
    P835-->>- P2: return
    P2->>+ P836: uses
    P836-->>- P2: return
    P2->>+ P837: uses
    P837-->>- P2: return
    P2->>+ P838: uses
    P838-->>- P2: return
    P2->>+ P839: uses
    P839-->>- P2: return
    P2->>+ P840: uses
    P840-->>- P2: return
    P2->>+ P841: uses
    P841-->>- P2: return
    P2->>+ P842: uses
    P842-->>- P2: return
    P2->>+ P843: uses
    P843-->>- P2: return
    P2->>+ P844: uses
    P844-->>- P2: return
    P2->>+ P845: uses
    P845-->>- P2: return
    P2->>+ P846: uses
    P846-->>- P2: return
    P2->>+ P847: uses
    P847-->>- P2: return
    P2->>+ P848: uses
    P848-->>- P2: return
    P2->>+ P849: uses
    P849-->>- P2: return
    P2->>+ P850: uses
    P850-->>- P2: return
    P2->>+ P851: uses
    P851-->>- P2: return
    P2->>+ P852: uses
    P852-->>- P2: return
    P2->>+ P853: uses
    P853-->>- P2: return
    P2->>+ P854: uses
    P854-->>- P2: return
    P2->>+ P855: uses
    P855-->>- P2: return
    P2->>+ P856: uses
    P856-->>- P2: return
    P2->>+ P857: uses
    P857-->>- P2: return
    P2->>+ P858: uses
    P858-->>- P2: return
    P2->>+ P859: uses
    P859-->>- P2: return
    P2->>+ P860: uses
    P860-->>- P2: return
    P2->>+ P861: uses
    P861-->>- P2: return
    P2->>+ P862: uses
    P862-->>- P2: return
    P2->>+ P863: uses
    P863-->>- P2: return
    P2->>+ P864: uses
    P864-->>- P2: return
    P2->>+ P865: uses
    P865-->>- P2: return
    P2->>+ P866: uses
    P866-->>- P2: return
    P2->>+ P867: uses
    P867-->>- P2: return
    P2->>+ P868: uses
    P868-->>- P2: return
    P2->>+ P869: uses
    P869-->>- P2: return
    P2->>+ P870: uses
    P870-->>- P2: return
    P2->>+ P871: uses
    P871-->>- P2: return
    P2->>+ P872: uses
    P872-->>- P2: return
    P2->>+ P873: uses
    P873-->>- P2: return
    P2->>+ P874: uses
    P874-->>- P2: return
    P2->>+ P875: uses
    P875-->>- P2: return
    P2->>+ P876: uses
    P876-->>- P2: return
    P2->>+ P877: uses
    P877-->>- P2: return
    P2->>+ P878: uses
    P878-->>- P2: return
    P2->>+ P879: uses
    P879-->>- P2: return
    P2->>+ P880: uses
    P880-->>- P2: return
    P2->>+ P881: uses
    P881-->>- P2: return
    P2->>+ P882: uses
    P882-->>- P2: return
    P2->>+ P883: uses
    P883-->>- P2: return
    P2->>+ P884: uses
    P884-->>- P2: return
    P2->>+ P885: uses
    P885-->>- P2: return
    P2->>+ P886: uses
    P886-->>- P2: return
    P2->>+ P887: uses
    P887-->>- P2: return
    P2->>+ P888: uses
    P888-->>- P2: return
    P2->>+ P889: uses
    P889-->>- P2: return
    P2->>+ P890: uses
    P890-->>- P2: return
    P2->>+ P891: uses
    P891-->>- P2: return
    P2->>+ P892: uses
    P892-->>- P2: return
    P2->>+ P893: uses
    P893-->>- P2: return
    P2->>+ P894: uses
    P894-->>- P2: return
    P2->>+ P895: uses
    P895-->>- P2: return
    P2->>+ P896: uses
    P896-->>- P2: return
    P2->>+ P897: uses
    P897-->>- P2: return
    P2->>+ P898: uses
    P898-->>- P2: return
    P2->>+ P899: uses
    P899-->>- P2: return
    P2->>+ P900: uses
    P900-->>- P2: return
    P2->>+ P901: uses
    P901-->>- P2: return
    P2->>+ P902: uses
    P902-->>- P2: return
    P2->>+ P903: uses
    P903-->>- P2: return
    P2->>+ P904: uses
    P904-->>- P2: return
    P2->>+ P905: uses
    P905-->>- P2: return
    P2->>+ P906: uses
    P906-->>- P2: return
    P2->>+ P907: uses
    P907-->>- P2: return
    P2->>+ P908: uses
    P908-->>- P2: return
    P2->>+ P909: uses
    P909-->>- P2: return
    P2->>+ P910: uses
    P910-->>- P2: return
    P2->>+ P911: uses
    P911-->>- P2: return
    P2->>+ P912: uses
    P912-->>- P2: return
    P2->>+ P913: uses
    P913-->>- P2: return
    P2->>+ P914: uses
    P914-->>- P2: return
    P2->>+ P915: uses
    P915-->>- P2: return
    P2->>+ P916: uses
    P916-->>- P2: return
    P2->>+ P917: uses
    P917-->>- P2: return
    P2->>+ P918: uses
    P918-->>- P2: return
    P2->>+ P919: uses
    P919-->>- P2: return
    P2->>+ P920: uses
    P920-->>- P2: return
    P2->>+ P921: uses
    P921-->>- P2: return
    P2->>+ P922: uses
    P922-->>- P2: return
    P2->>+ P923: uses
    P923-->>- P2: return
    P2->>+ P924: uses
    P924-->>- P2: return
    P2->>+ P925: uses
    P925-->>- P2: return
    P2->>+ P926: uses
    P926-->>- P2: return
    P2->>+ P927: uses
    P927-->>- P2: return
    P2->>+ P928: uses
    P928-->>- P2: return
    P2->>+ P929: uses
    P929-->>- P2: return
    P2->>+ P930: uses
    P930-->>- P2: return
    P2->>+ P931: uses
    P931-->>- P2: return
    P2->>+ P932: uses
    P932-->>- P2: return
    P2->>+ P933: uses
    P933-->>- P2: return
    P2->>+ P934: uses
    P934-->>- P2: return
    P2->>+ P935: uses
    P935-->>- P2: return
    P2->>+ P936: uses
    P936-->>- P2: return
    P2->>+ P937: uses
    P937-->>- P2: return
    P2->>+ P938: uses
    P938-->>- P2: return
    P2->>+ P939: uses
    P939-->>- P2: return
    P2->>+ P940: uses
    P940-->>- P2: return
    P2->>+ P941: uses
    P941-->>- P2: return
    P2->>+ P942: uses
    P942-->>- P2: return
    P2->>+ P943: uses
    P943-->>- P2: return
    P2->>+ P944: uses
    P944-->>- P2: return
    P2->>+ P945: uses
    P945-->>- P2: return
    P2->>+ P946: uses
    P946-->>- P2: return
    P2->>+ P947: uses
    P947-->>- P2: return
    P2->>+ P948: uses
    P948-->>- P2: return
    P2->>+ P949: uses
    P949-->>- P2: return
    P2->>+ P950: uses
    P950-->>- P2: return
    P2->>+ P951: uses
    P951-->>- P2: return
    P2->>+ P952: uses
    P952-->>- P2: return
    P2->>+ P953: uses
    P953-->>- P2: return
    P2->>+ P954: uses
    P954-->>- P2: return
    P2->>+ P955: uses
    P955-->>- P2: return
    P2->>+ P956: uses
    P956-->>- P2: return
    P2->>+ P957: uses
    P957-->>- P2: return
    P2->>+ P958: uses
    P958-->>- P2: return
    P2->>+ P959: uses
    P959-->>- P2: return
    P2->>+ P960: uses
    P960-->>- P2: return
    P2->>+ P961: uses
    P961-->>- P2: return
    P2->>+ P962: uses
    P962-->>- P2: return
    P2->>+ P963: uses
    P963-->>- P2: return
    P2->>+ P964: uses
    P964-->>- P2: return
    P2->>+ P965: uses
    P965-->>- P2: return
    P2->>+ P966: uses
    P966-->>- P2: return
    P2->>+ P967: uses
    P967-->>- P2: return
    P2->>+ P968: uses
    P968-->>- P2: return
    P2->>+ P969: uses
    P969-->>- P2: return
    P2->>+ P970: uses
    P970-->>- P2: return
    P2->>+ P971: uses
    P971-->>- P2: return
    P2->>+ P972: uses
    P972-->>- P2: return
    P2->>+ P973: uses
    P973-->>- P2: return
    P2->>+ P974: uses
    P974-->>- P2: return
    P2->>+ P975: uses
    P975-->>- P2: return
    P2->>+ P976: uses
    P976-->>- P2: return
    P2->>+ P977: uses
    P977-->>- P2: return
    P2->>+ P978: uses
    P978-->>- P2: return
    P2->>+ P979: uses
    P979-->>- P2: return
    P2->>+ P980: uses
    P980-->>- P2: return
    P2->>+ P981: uses
    P981-->>- P2: return
    P2->>+ P982: uses
    P982-->>- P2: return
    P2->>+ P983: uses
    P983-->>- P2: return
    P2->>+ P984: uses
    P984-->>- P2: return
    P2->>+ P985: uses
    P985-->>- P2: return
    P2->>+ P986: uses
    P986-->>- P2: return
    P2->>+ P987: uses
    P987-->>- P2: return
    P2->>+ P988: uses
    P988-->>- P2: return
    P2->>+ P989: uses
    P989-->>- P2: return
    P2->>+ P990: uses
    P990-->>- P2: return
    P2->>+ P991: uses
    P991-->>- P2: return
    P2->>+ P992: uses
    P992-->>- P2: return
    P2->>+ P993: uses
    P993-->>- P2: return
    P2->>+ P994: uses
    P994-->>- P2: return
    P2->>+ P995: uses
    P995-->>- P2: return
    P2->>+ P996: uses
    P996-->>- P2: return
    P2->>+ P997: uses
    P997-->>- P2: return
    P2->>+ P998: uses
    P998-->>- P2: return
    P2->>+ P999: uses
    P999-->>- P2: return
    P2->>+ P1000: uses
    P1000-->>- P2: return
    P2->>+ P1001: uses
    P1001-->>- P2: return
    P2->>+ P1002: uses
    P1002-->>- P2: return
    P2->>+ P1003: uses
    P1003-->>- P2: return
    P2->>+ P1004: uses
    P1004-->>- P2: return
    P2->>+ P1005: uses
    P1005-->>- P2: return
    P2->>+ P1006: uses
    P1006-->>- P2: return
    P2->>+ P1007: uses
    P1007-->>- P2: return
    P2->>+ P1008: uses
    P1008-->>- P2: return
    P2->>+ P1009: uses
    P1009-->>- P2: return
    P2->>+ P1010: uses
    P1010-->>- P2: return
    P2->>+ P1011: uses
    P1011-->>- P2: return
    P2->>+ P1012: uses
    P1012-->>- P2: return
    P2->>+ P1013: uses
    P1013-->>- P2: return
    P2->>+ P1014: uses
    P1014-->>- P2: return
    P2->>+ P1015: uses
    P1015-->>- P2: return
    P2->>+ P1016: uses
    P1016-->>- P2: return
    P2->>+ P1017: uses
    P1017-->>- P2: return
    P2->>+ P1018: uses
    P1018-->>- P2: return
    P2->>+ P1019: uses
    P1019-->>- P2: return
    P2->>+ P1020: uses
    P1020-->>- P2: return
    P2->>+ P1021: uses
    P1021-->>- P2: return
    P2->>+ P1022: uses
    P1022-->>- P2: return
    P2->>+ P1023: uses
    P1023-->>- P2: return
    P2->>+ P1024: uses
    P1024-->>- P2: return
    P2->>+ P1025: uses
    P1025-->>- P2: return
    P2->>+ P1026: uses
    P1026-->>- P2: return
    P2->>+ P1027: uses
    P1027-->>- P2: return
    P2->>+ P1028: uses
    P1028-->>- P2: return
    P2->>+ P1029: uses
    P1029-->>- P2: return
    P2->>+ P1030: uses
    P1030-->>- P2: return
    P2->>+ P1031: uses
    P1031-->>- P2: return
    P2->>+ P1032: uses
    P1032-->>- P2: return
    P2->>+ P1033: uses
    P1033-->>- P2: return
    P2->>+ P1034: uses
    P1034-->>- P2: return
    P2->>+ P1035: uses
    P1035-->>- P2: return
    P2->>+ P1036: uses
    P1036-->>- P2: return
    P2->>+ P1037: uses
    P1037-->>- P2: return
    P2->>+ P1038: uses
    P1038-->>- P2: return
    P2->>+ P1039: uses
    P1039-->>- P2: return
    P2->>+ P1040: uses
    P1040-->>- P2: return
    P2->>+ P1041: uses
    P1041-->>- P2: return
    P2->>+ P1042: uses
    P1042-->>- P2: return
    P2->>+ P1043: uses
    P1043-->>- P2: return
    P2->>+ P1044: uses
    P1044-->>- P2: return
    P2->>+ P1045: uses
    P1045-->>- P2: return
    P2->>+ P1046: uses
    P1046-->>- P2: return
    P2->>+ P1047: uses
    P1047-->>- P2: return
    P2->>+ P1048: uses
    P1048-->>- P2: return
    P2->>+ P1049: uses
    P1049-->>- P2: return
    P2->>+ P1050: uses
    P1050-->>- P2: return
    P2->>+ P1051: uses
    P1051-->>- P2: return
    P2->>+ P1052: uses
    P1052-->>- P2: return
    P2->>+ P1053: uses
    P1053-->>- P2: return
    P2->>+ P1054: uses
    P1054-->>- P2: return
    P2->>+ P1055: uses
    P1055-->>- P2: return
    P2->>+ P1056: uses
    P1056-->>- P2: return
    P2->>+ P1057: uses
    P1057-->>- P2: return
    P2->>+ P1058: uses
    P1058-->>- P2: return
    P2->>+ P1059: uses
    P1059-->>- P2: return
    P2->>+ P1060: uses
    P1060-->>- P2: return
    P2->>+ P1061: uses
    P1061-->>- P2: return
    P2->>+ P1062: uses
    P1062-->>- P2: return
    P2->>+ P1063: uses
    P1063-->>- P2: return
    P2->>+ P1064: uses
    P1064-->>- P2: return
    P2->>+ P1065: uses
    P1065-->>- P2: return
    P2->>+ P1066: uses
    P1066-->>- P2: return
    P2->>+ P1067: uses
    P1067-->>- P2: return
    P2->>+ P1068: uses
    P1068-->>- P2: return
    P2->>+ P1069: uses
    P1069-->>- P2: return
    P2->>+ P1070: uses
    P1070-->>- P2: return
    P2->>+ P1071: uses
    P1071-->>- P2: return
    P2->>+ P1072: uses
    P1072-->>- P2: return
    P2->>+ P1073: uses
    P1073-->>- P2: return
    P2->>+ P1074: uses
    P1074-->>- P2: return
    P2->>+ P1075: uses
    P1075-->>- P2: return
    P2->>+ P1076: uses
    P1076-->>- P2: return
    P2->>+ P1077: uses
    P1077-->>- P2: return
    P2->>+ P1078: uses
    P1078-->>- P2: return
    P2->>+ P1079: uses
    P1079-->>- P2: return
    P2->>+ P1080: uses
    P1080-->>- P2: return
    P2->>+ P1081: uses
    P1081-->>- P2: return
    P2->>+ P1082: uses
    P1082-->>- P2: return
    P2->>+ P1083: uses
    P1083-->>- P2: return
    P2->>+ P1084: uses
    P1084-->>- P2: return
    P2->>+ P1085: uses
    P1085-->>- P2: return
    P2->>+ P1086: uses
    P1086-->>- P2: return
    P2->>+ P1087: uses
    P1087-->>- P2: return
    P2->>+ P1088: uses
    P1088-->>- P2: return
    P2->>+ P1089: uses
    P1089-->>- P2: return
    P2->>+ P1090: uses
    P1090-->>- P2: return
    P2->>+ P1091: uses
    P1091-->>- P2: return
    P2->>+ P1092: uses
    P1092-->>- P2: return
    P2->>+ P1093: uses
    P1093-->>- P2: return
    P2->>+ P1094: uses
    P1094-->>- P2: return
    P2->>+ P1095: uses
    P1095-->>- P2: return
    P2->>+ P1096: uses
    P1096-->>- P2: return
    P2->>+ P1097: uses
    P1097-->>- P2: return
    P2->>+ P1098: uses
    P1098-->>- P2: return
    P2->>+ P1099: uses
    P1099-->>- P2: return
    P2->>+ P1100: uses
    P1100-->>- P2: return
    P2->>+ P1101: uses
    P1101-->>- P2: return
    P2->>+ P1102: uses
    P1102-->>- P2: return
    P2->>+ P1103: uses
    P1103-->>- P2: return
    P2->>+ P1104: uses
    P1104-->>- P2: return
    P2->>+ P1105: uses
    P1105-->>- P2: return
    P2->>+ P1106: uses
    P1106-->>- P2: return
    P2->>+ P1107: uses
    P1107-->>- P2: return
    P2->>+ P1108: uses
    P1108-->>- P2: return
    P2->>+ P1109: uses
    P1109-->>- P2: return
    P2->>+ P1110: uses
    P1110-->>- P2: return
    P2->>+ P1111: uses
    P1111-->>- P2: return
    P2->>+ P1112: uses
    P1112-->>- P2: return
    P2->>+ P1113: uses
    P1113-->>- P2: return
    P2->>+ P1114: uses
    P1114-->>- P2: return
    P2->>+ P1115: uses
    P1115-->>- P2: return
    P2->>+ P1116: uses
    P1116-->>- P2: return
    P2->>+ P1117: uses
    P1117-->>- P2: return
    P2->>+ P1118: uses
    P1118-->>- P2: return
    P2->>+ P1119: uses
    P1119-->>- P2: return
    P2->>+ P1120: uses
    P1120-->>- P2: return
    P2->>+ P1121: uses
    P1121-->>- P2: return
    P2->>+ P1122: uses
    P1122-->>- P2: return
    P2->>+ P1123: uses
    P1123-->>- P2: return
    P2->>+ P1124: uses
    P1124-->>- P2: return
    P2->>+ P1125: uses
    P1125-->>- P2: return
    P2->>+ P1126: uses
    P1126-->>- P2: return
    P2->>+ P1127: uses
    P1127-->>- P2: return
    P2->>+ P1128: uses
    P1128-->>- P2: return
    P2->>+ P1129: uses
    P1129-->>- P2: return
    P2->>+ P1130: uses
    P1130-->>- P2: return
    P2->>+ P1131: uses
    P1131-->>- P2: return
    P2->>+ P1132: uses
    P1132-->>- P2: return
    P2->>+ P1133: uses
    P1133-->>- P2: return
    P2->>+ P1134: uses
    P1134-->>- P2: return
    P2->>+ P1135: uses
    P1135-->>- P2: return
    P2->>+ P1136: uses
    P1136-->>- P2: return
    P2->>+ P1137: uses
    P1137-->>- P2: return
    P2->>+ P1138: uses
    P1138-->>- P2: return
    P2->>+ P1139: uses
    P1139-->>- P2: return
    P2->>+ P1140: uses
    P1140-->>- P2: return
    P2->>+ P1141: uses
    P1141-->>- P2: return
    P2->>+ P1142: uses
    P1142-->>- P2: return
    P2->>+ P1143: uses
    P1143-->>- P2: return
    P2->>+ P1144: uses
    P1144-->>- P2: return
    P2->>+ P1145: uses
    P1145-->>- P2: return
    P2->>+ P1146: uses
    P1146-->>- P2: return
    P2->>+ P1147: uses
    P1147-->>- P2: return
    P2->>+ P1148: uses
    P1148-->>- P2: return
    P2->>+ P1149: uses
    P1149-->>- P2: return
    P2->>+ P1150: uses
    P1150-->>- P2: return
    P2->>+ P1151: uses
    P1151-->>- P2: return
    P2->>+ P1152: uses
    P1152-->>- P2: return
    P2->>+ P1153: uses
    P1153-->>- P2: return
    P2->>+ P1154: uses
    P1154-->>- P2: return
    P2->>+ P1155: uses
    P1155-->>- P2: return
    P2->>+ P1156: uses
    P1156-->>- P2: return
    P2->>+ P1157: uses
    P1157-->>- P2: return
    P2->>+ P1158: uses
    P1158-->>- P2: return
    P2->>+ P1159: uses
    P1159-->>- P2: return
    P2->>+ P1160: uses
    P1160-->>- P2: return
    P2->>+ P1161: uses
    P1161-->>- P2: return
    P2->>+ P1162: uses
    P1162-->>- P2: return
    P2->>+ P1163: uses
    P1163-->>- P2: return
    P2->>+ P1164: uses
    P1164-->>- P2: return
    P2->>+ P1165: uses
    P1165-->>- P2: return
    P2->>+ P1166: uses
    P1166-->>- P2: return
    P2->>+ P1167: uses
    P1167-->>- P2: return
    P2->>+ P1168: uses
    P1168-->>- P2: return
    P2->>+ P1169: uses
    P1169-->>- P2: return
    P2->>+ P1170: uses
    P1170-->>- P2: return
    P2->>+ P1171: uses
    P1171-->>- P2: return
    P2->>+ P1172: uses
    P1172-->>- P2: return
    P2->>+ P1173: uses
    P1173-->>- P2: return
    P2->>+ P1174: uses
    P1174-->>- P2: return
    P2->>+ P1175: uses
    P1175-->>- P2: return
    P2->>+ P1176: uses
    P1176-->>- P2: return
    P2->>+ P1177: uses
    P1177-->>- P2: return
    P2->>+ P1178: uses
    P1178-->>- P2: return
    P2->>+ P1179: uses
    P1179-->>- P2: return
    P2->>+ P1180: uses
    P1180-->>- P2: return
    P2->>+ P1181: uses
    P1181-->>- P2: return
    P2->>+ P1182: uses
    P1182-->>- P2: return
    P2->>+ P1183: uses
    P1183-->>- P2: return
    P2->>+ P1184: uses
    P1184-->>- P2: return
    P2->>+ P1185: uses
    P1185-->>- P2: return
    P2->>+ P1186: uses
    P1186-->>- P2: return
    P2->>+ P1187: uses
    P1187-->>- P2: return
    P2->>+ P1188: uses
    P1188-->>- P2: return
    P2->>+ P1189: uses
    P1189-->>- P2: return
    P2->>+ P1190: uses
    P1190-->>- P2: return
    P2->>+ P1191: uses
    P1191-->>- P2: return
    P2->>+ P1192: uses
    P1192-->>- P2: return
    P2->>+ P1193: uses
    P1193-->>- P2: return
    P2->>+ P1194: uses
    P1194-->>- P2: return
    P2->>+ P1195: uses
    P1195-->>- P2: return
    P2->>+ P1196: uses
    P1196-->>- P2: return
    P2->>+ P1197: uses
    P1197-->>- P2: return
    P2->>+ P1198: uses
    P1198-->>- P2: return
    P2->>+ P1199: uses
    P1199-->>- P2: return
    P2->>+ P1200: uses
    P1200-->>- P2: return
    P2->>+ P1201: uses
    P1201-->>- P2: return
    P2->>+ P1202: uses
    P1202-->>- P2: return
    P2->>+ P1203: uses
    P1203-->>- P2: return
    P2->>+ P1204: uses
    P1204-->>- P2: return
    P2->>+ P1205: uses
    P1205-->>- P2: return
    P2->>+ P1206: uses
    P1206-->>- P2: return
    P2->>+ P1207: uses
    P1207-->>- P2: return
    P2->>+ P1208: uses
    P1208-->>- P2: return
    P2->>+ P1209: uses
    P1209-->>- P2: return
    P2->>+ P1210: uses
    P1210-->>- P2: return
    P2->>+ P1211: uses
    P1211-->>- P2: return
    P2->>+ P1212: uses
    P1212-->>- P2: return
    P2->>+ P1213: uses
    P1213-->>- P2: return
    P2->>+ P1214: uses
    P1214-->>- P2: return
    P2->>+ P1215: uses
    P1215-->>- P2: return
    P2->>+ P1216: uses
    P1216-->>- P2: return
    P2->>+ P1217: uses
    P1217-->>- P2: return
    P2->>+ P1218: uses
    P1218-->>- P2: return
    P2->>+ P1219: uses
    P1219-->>- P2: return
    P2->>+ P1220: uses
    P1220-->>- P2: return
    P2->>+ P1221: uses
    P1221-->>- P2: return
    P2->>+ P1222: uses
    P1222-->>- P2: return
    P2->>+ P1223: uses
    P1223-->>- P2: return
    P2->>+ P1224: uses
    P1224-->>- P2: return
    P2->>+ P1225: uses
    P1225-->>- P2: return
    P2->>+ P1226: uses
    P1226-->>- P2: return
    P2->>+ P1227: uses
    P1227-->>- P2: return
    P2->>+ P1228: uses
    P1228-->>- P2: return
    P2->>+ P1229: uses
    P1229-->>- P2: return
    P2->>+ P1230: uses
    P1230-->>- P2: return
    P2->>+ P1231: uses
    P1231-->>- P2: return
    P2->>+ P1232: uses
    P1232-->>- P2: return
    P2->>+ P1233: uses
    P1233-->>- P2: return
    P2->>+ P1234: uses
    P1234-->>- P2: return
    P2->>+ P1235: uses
    P1235-->>- P2: return
    P2->>+ P1236: uses
    P1236-->>- P2: return
    P2->>+ P1237: uses
    P1237-->>- P2: return
    P2->>+ P1238: uses
    P1238-->>- P2: return
    P2->>+ P1239: uses
    P1239-->>- P2: return
    P2->>+ P1240: uses
    P1240-->>- P2: return
    P2->>+ P1241: uses
    P1241-->>- P2: return
    P2->>+ P1242: uses
    P1242-->>- P2: return
    P2->>+ P1243: uses
    P1243-->>- P2: return
    P2->>+ P1244: uses
    P1244-->>- P2: return
    P2->>+ P1245: uses
    P1245-->>- P2: return
    P2->>+ P1246: uses
    P1246-->>- P2: return
    P2->>+ P1247: uses
    P1247-->>- P2: return
    P2->>+ P1248: uses
    P1248-->>- P2: return
    P2->>+ P1249: uses
    P1249-->>- P2: return
    P2->>+ P1250: uses
    P1250-->>- P2: return
    P2->>+ P1251: uses
    P1251-->>- P2: return
    P2->>+ P1252: uses
    P1252-->>- P2: return
    P2->>+ P1253: uses
    P1253-->>- P2: return
    P2->>+ P1254: uses
    P1254-->>- P2: return
    P2->>+ P1255: uses
    P1255-->>- P2: return
    P2->>+ P1256: uses
    P1256-->>- P2: return
    P2->>+ P1257: uses
    P1257-->>- P2: return
    P2->>+ P1258: uses
    P1258-->>- P2: return
    P2->>+ P1259: uses
    P1259-->>- P2: return
    P2->>+ P1260: uses
    P1260-->>- P2: return
    P2->>+ P1261: uses
    P1261-->>- P2: return
    P2->>+ P1262: uses
    P1262-->>- P2: return
    P2->>+ P1263: uses
    P1263-->>- P2: return
    P2->>+ P1264: uses
    P1264-->>- P2: return
    P2->>+ P1265: uses
    P1265-->>- P2: return
    P2->>+ P1266: uses
    P1266-->>- P2: return
    P2->>+ P1267: uses
    P1267-->>- P2: return
    P2->>+ P1268: uses
    P1268-->>- P2: return
    P2->>+ P1269: uses
    P1269-->>- P2: return
    P2->>+ P1270: uses
    P1270-->>- P2: return
    P2->>+ P1271: uses
    P1271-->>- P2: return
    P2->>+ P1272: uses
    P1272-->>- P2: return
    P2->>+ P1273: uses
    P1273-->>- P2: return
    P2->>+ P1274: uses
    P1274-->>- P2: return
    P2->>+ P1275: uses
    P1275-->>- P2: return
    P2->>+ P1276: uses
    P1276-->>- P2: return
    P2->>+ P1277: uses
    P1277-->>- P2: return
    P2->>+ P1278: uses
    P1278-->>- P2: return
    P2->>+ P1279: uses
    P1279-->>- P2: return
    P2->>+ P1280: uses
    P1280-->>- P2: return
    P2->>+ P1281: uses
    P1281-->>- P2: return
    P2->>+ P1282: uses
    P1282-->>- P2: return
    P2->>+ P1283: uses
    P1283-->>- P2: return
    P2->>+ P1284: uses
    P1284-->>- P2: return
    P2->>+ P1285: uses
    P1285-->>- P2: return
    P2->>+ P1286: uses
    P1286-->>- P2: return
    P2->>+ P1287: uses
    P1287-->>- P2: return
    P2->>+ P1288: uses
    P1288-->>- P2: return
    P2->>+ P1289: uses
    P1289-->>- P2: return
    P2->>+ P1290: uses
    P1290-->>- P2: return
    P2->>+ P1291: uses
    P1291-->>- P2: return
    P2->>+ P1292: uses
    P1292-->>- P2: return
    P2->>+ P1293: uses
    P1293-->>- P2: return
    P2->>+ P1294: uses
    P1294-->>- P2: return
    P2->>+ P1295: uses
    P1295-->>- P2: return
    P2->>+ P1296: uses
    P1296-->>- P2: return
    P2->>+ P1297: uses
    P1297-->>- P2: return
    P2->>+ P1298: uses
    P1298-->>- P2: return
    P2->>+ P1299: uses
    P1299-->>- P2: return
    P2->>+ P1300: uses
    P1300-->>- P2: return
    P2->>+ P1301: uses
    P1301-->>- P2: return
    P2->>+ P1302: uses
    P1302-->>- P2: return
    P2->>+ P1303: uses
    P1303-->>- P2: return
    P2->>+ P1304: uses
    P1304-->>- P2: return
    P2->>+ P1305: uses
    P1305-->>- P2: return
    P2->>+ P1306: uses
    P1306-->>- P2: return
    P2->>+ P1307: uses
    P1307-->>- P2: return
    P2->>+ P1308: uses
    P1308-->>- P2: return
    P2->>+ P1309: uses
    P1309-->>- P2: return
    P2->>+ P1310: uses
    P1310-->>- P2: return
    P2->>+ P1311: uses
    P1311-->>- P2: return
    P2->>+ P1312: uses
    P1312-->>- P2: return
    P2->>+ P1313: uses
    P1313-->>- P2: return
    P2->>+ P1314: uses
    P1314-->>- P2: return
    P2->>+ P1315: uses
    P1315-->>- P2: return
    P2->>+ P1316: uses
    P1316-->>- P2: return
    P2->>+ P1317: uses
    P1317-->>- P2: return
    P2->>+ P1318: uses
    P1318-->>- P2: return
    P2->>+ P1319: uses
    P1319-->>- P2: return
    P2->>+ P1320: uses
    P1320-->>- P2: return
    P2->>+ P1321: uses
    P1321-->>- P2: return
    P2->>+ P1322: uses
    P1322-->>- P2: return
    P2->>+ P1323: uses
    P1323-->>- P2: return
    P2->>+ P1324: uses
    P1324-->>- P2: return
    P2->>+ P1325: uses
    P1325-->>- P2: return
    P2->>+ P1326: uses
    P1326-->>- P2: return
    P2->>+ P1327: uses
    P1327-->>- P2: return
    P2->>+ P1328: uses
    P1328-->>- P2: return
    P2->>+ P1329: uses
    P1329-->>- P2: return
    P2->>+ P1330: uses
    P1330-->>- P2: return
    P2->>+ P1331: uses
    P1331-->>- P2: return
    P2->>+ P1332: uses
    P1332-->>- P2: return
    P2->>+ P1333: uses
    P1333-->>- P2: return
    P2->>+ P1334: uses
    P1334-->>- P2: return
    P2->>+ P1335: uses
    P1335-->>- P2: return
    P2->>+ P1336: uses
    P1336-->>- P2: return
    P2->>+ P1337: uses
    P1337-->>- P2: return
    P2->>+ P1338: uses
    P1338-->>- P2: return
    P2->>+ P1339: uses
    P1339-->>- P2: return
    P2->>+ P1340: uses
    P1340-->>- P2: return
    P2->>+ P1341: uses
    P1341-->>- P2: return
    P2->>+ P1342: uses
    P1342-->>- P2: return
    P2->>+ P1343: uses
    P1343-->>- P2: return
    P2->>+ P1344: uses
    P1344-->>- P2: return
    P2->>+ P1345: uses
    P1345-->>- P2: return
    P2->>+ P1346: uses
    P1346-->>- P2: return
    P2->>+ P1347: uses
    P1347-->>- P2: return
    P2->>+ P1348: uses
    P1348-->>- P2: return
    P2->>+ P1349: uses
    P1349-->>- P2: return
    P2->>+ P1350: uses
    P1350-->>- P2: return
    P2->>+ P1351: uses
    P1351-->>- P2: return
    P2->>+ P1352: uses
    P1352-->>- P2: return
    P2->>+ P1353: uses
    P1353-->>- P2: return
    P2->>+ P1354: uses
    P1354-->>- P2: return
    P2->>+ P1355: uses
    P1355-->>- P2: return
    P2->>+ P1356: uses
    P1356-->>- P2: return
    P2->>+ P1357: uses
    P1357-->>- P2: return
    P2->>+ P1358: uses
    P1358-->>- P2: return
    P2->>+ P1359: uses
    P1359-->>- P2: return
    P2->>+ P1360: uses
    P1360-->>- P2: return
    P2->>+ P1361: uses
    P1361-->>- P2: return
    P2->>+ P1362: uses
    P1362-->>- P2: return
    P2->>+ P1363: uses
    P1363-->>- P2: return
    P2->>+ P1364: uses
    P1364-->>- P2: return
    P2->>+ P1365: uses
    P1365-->>- P2: return
    P2->>+ P1366: uses
    P1366-->>- P2: return
    P2->>+ P1367: uses
    P1367-->>- P2: return
    P2->>+ P1368: uses
    P1368-->>- P2: return
    P2->>+ P1369: uses
    P1369-->>- P2: return
    P2->>+ P1370: uses
    P1370-->>- P2: return
    P2->>+ P1371: uses
    P1371-->>- P2: return
    P2->>+ P1372: uses
    P1372-->>- P2: return
    P2->>+ P1373: uses
    P1373-->>- P2: return
    P2->>+ P1374: uses
    P1374-->>- P2: return
    P2->>+ P1375: uses
    P1375-->>- P2: return
    P2->>+ P1376: uses
    P1376-->>- P2: return
    P2->>+ P1377: uses
    P1377-->>- P2: return
    P2->>+ P1378: uses
    P1378-->>- P2: return
    P2->>+ P1379: uses
    P1379-->>- P2: return
    P2->>+ P1380: uses
    P1380-->>- P2: return
    P2->>+ P1381: uses
    P1381-->>- P2: return
    P2->>+ P1382: uses
    P1382-->>- P2: return
    P2->>+ P1383: uses
    P1383-->>- P2: return
    P2->>+ P1384: uses
    P1384-->>- P2: return
    P2->>+ P1385: uses
    P1385-->>- P2: return
    P2->>+ P1386: uses
    P1386-->>- P2: return
    P2->>+ P1387: uses
    P1387-->>- P2: return
    P2->>+ P1388: uses
    P1388-->>- P2: return
    P2->>+ P1389: uses
    P1389-->>- P2: return
    P2->>+ P1390: uses
    P1390-->>- P2: return
    P2->>+ P1391: uses
    P1391-->>- P2: return
    P2->>+ P1392: uses
    P1392-->>- P2: return
    P2->>+ P1393: uses
    P1393-->>- P2: return
    P2->>+ P1394: uses
    P1394-->>- P2: return
    P2->>+ P1395: uses
    P1395-->>- P2: return
    P2->>+ P1396: uses
    P1396-->>- P2: return
    P2->>+ P1397: uses
    P1397-->>- P2: return
    P2->>+ P1398: uses
    P1398-->>- P2: return
    P2->>+ P1399: uses
    P1399-->>- P2: return
    P2->>+ P1400: uses
    P1400-->>- P2: return
    P2->>+ P1401: uses
    P1401-->>- P2: return
    P2->>+ P1402: uses
    P1402-->>- P2: return
    P2->>+ P1403: uses
    P1403-->>- P2: return
    P2->>+ P1404: uses
    P1404-->>- P2: return
    P2->>+ P1405: uses
    P1405-->>- P2: return
    P2->>+ P1406: uses
    P1406-->>- P2: return
    P2->>+ P1407: uses
    P1407-->>- P2: return
    P2->>+ P1408: uses
    P1408-->>- P2: return
    P2->>+ P1409: uses
    P1409-->>- P2: return
    P2->>+ P1410: uses
    P1410-->>- P2: return
    P2->>+ P1411: uses
    P1411-->>- P2: return
    P2->>+ P1412: uses
    P1412-->>- P2: return
    P2->>+ P1413: uses
    P1413-->>- P2: return
    P2->>+ P1414: uses
    P1414-->>- P2: return
    P2->>+ P1415: uses
    P1415-->>- P2: return
    P2->>+ P1416: uses
    P1416-->>- P2: return
    P2->>+ P1417: uses
    P1417-->>- P2: return
    P2->>+ P1418: uses
    P1418-->>- P2: return
    P2->>+ P1419: uses
    P1419-->>- P2: return
    P2->>+ P1420: uses
    P1420-->>- P2: return
    P2->>+ P1421: uses
    P1421-->>- P2: return
    P2->>+ P1422: uses
    P1422-->>- P2: return
    P2->>+ P1423: uses
    P1423-->>- P2: return
    P2->>+ P1424: uses
    P1424-->>- P2: return
    P2->>+ P1425: uses
    P1425-->>- P2: return
    P2->>+ P1426: uses
    P1426-->>- P2: return
    P2->>+ P1427: uses
    P1427-->>- P2: return
    P2->>+ P1428: uses
    P1428-->>- P2: return
    P2->>+ P1429: uses
    P1429-->>- P2: return
    P2->>+ P1430: uses
    P1430-->>- P2: return
    P2->>+ P1431: uses
    P1431-->>- P2: return
    P2->>+ P1432: uses
    P1432-->>- P2: return
    P2->>+ P1433: uses
    P1433-->>- P2: return
    P2->>+ P1434: uses
    P1434-->>- P2: return
    P2->>+ P1435: uses
    P1435-->>- P2: return
    P2->>+ P1436: uses
    P1436-->>- P2: return
    P2->>+ P1437: uses
    P1437-->>- P2: return
    P2->>+ P1438: uses
    P1438-->>- P2: return
    P2->>+ P1439: uses
    P1439-->>- P2: return
    P2->>+ P1440: uses
    P1440-->>- P2: return
    P2->>+ P1441: uses
    P1441-->>- P2: return
    P2->>+ P1442: uses
    P1442-->>- P2: return
    P2->>+ P1443: uses
    P1443-->>- P2: return
    P2->>+ P1444: uses
    P1444-->>- P2: return
    P2->>+ P1445: uses
    P1445-->>- P2: return
    P2->>+ P1446: uses
    P1446-->>- P2: return
    P2->>+ P1447: uses
    P1447-->>- P2: return
    P2->>+ P1448: uses
    P1448-->>- P2: return
    P2->>+ P1449: uses
    P1449-->>- P2: return
    P2->>+ P1450: uses
    P1450-->>- P2: return
    P2->>+ P1451: uses
    P1451-->>- P2: return
    P2->>+ P1452: uses
    P1452-->>- P2: return
    P2->>+ P1453: uses
    P1453-->>- P2: return
    P2->>+ P1454: uses
    P1454-->>- P2: return
    P2->>+ P1455: uses
    P1455-->>- P2: return
    P2->>+ P1456: uses
    P1456-->>- P2: return
    P2->>+ P1457: uses
    P1457-->>- P2: return
    P2->>+ P1458: uses
    P1458-->>- P2: return
    P2->>+ P1459: uses
    P1459-->>- P2: return
    P2->>+ P1460: uses
    P1460-->>- P2: return
    P2->>+ P1461: uses
    P1461-->>- P2: return
    P2->>+ P1462: uses
    P1462-->>- P2: return
    P2->>+ P1463: uses
    P1463-->>- P2: return
    P2->>+ P1464: uses
    P1464-->>- P2: return
    P2->>+ P1465: uses
    P1465-->>- P2: return
    P2->>+ P1466: uses
    P1466-->>- P2: return
    P2->>+ P1467: uses
    P1467-->>- P2: return
    P2->>+ P1468: uses
    P1468-->>- P2: return
    P2->>+ P1469: uses
    P1469-->>- P2: return
    P2->>+ P1470: uses
    P1470-->>- P2: return
    P2->>+ P1471: uses
    P1471-->>- P2: return
    P2->>+ P1472: uses
    P1472-->>- P2: return
    P2->>+ P1473: uses
    P1473-->>- P2: return
    P2->>+ P1474: uses
    P1474-->>- P2: return
    P1->>+ P1475: uses
    P1475-->>- P1: return
    P1->>+ P1476: uses
    P1476-->>- P1: return
    P1->>+ P1477: uses
    P1477-->>- P1: return
    P1->>+ P1478: uses
    P1478-->>- P1: return
    P1->>+ P4: uses
    P4-->>- P1: return
    P1->>+ P1479: uses
    P1479-->>- P1: return
    P1->>+ P1480: uses
    P1480-->>- P1: return
    P1->>+ P1481: uses
    P1481-->>- P1: return
    P1->>+ P6: uses
    P6-->>- P1: return
    P1->>+ P1482: uses
    P1482-->>- P1: return
    P1->>+ P1483: uses
    P1483-->>- P1: return
    P1->>+ P1484: uses
    P1484-->>- P1: return
    P1->>+ P1485: uses
    P1485-->>- P1: return
    P1->>+ P1486: uses
    P1486-->>- P1: return
    P1->>+ P1487: uses
    P1487-->>- P1: return
    P1->>+ P1488: uses
    P1488-->>- P1: return
    P1->>+ P1489: uses
    P1489-->>- P1: return
    P1->>+ P266: uses
    P266-->>- P1: return
    P1->>+ P1490: uses
    P1490-->>- P1: return
    P1->>+ P268: uses
    P268-->>- P1: return
    P1->>+ P269: uses
    P269-->>- P1: return
    P1->>+ P1491: uses
    P1491-->>- P1: return
    P1->>+ P1492: uses
    P1492-->>- P1: return
    P1->>+ P1493: uses
    P1493-->>- P1: return
    P1->>+ P1494: uses
    P1494-->>- P1: return
    P1->>+ P1495: uses
    P1495-->>- P1: return
    P1->>+ P1496: uses
    P1496-->>- P1: return
    P1->>+ P1497: uses
    P1497-->>- P1: return
    P1->>+ P1498: uses
    P1498-->>- P1: return
    P1->>+ P1499: uses
    P1499-->>- P1: return
    P1->>+ P1500: uses
    P1500-->>- P1: return
    P1->>+ P1501: uses
    P1501-->>- P1: return
    P1->>+ P1502: uses
    P1502-->>- P1: return
    P1->>+ P1503: uses
    P1503-->>- P1: return
    P1->>+ P1504: uses
    P1504-->>- P1: return
    P1->>+ P1505: uses
    P1505-->>- P1: return
    P1->>+ P1506: uses
    P1506-->>- P1: return
    P1->>+ P1507: uses
    P1507-->>- P1: return
    P1->>+ P1508: uses
    P1508-->>- P1: return
    P1->>+ P1509: uses
    P1509-->>- P1: return
    P1->>+ P1510: uses
    P1510-->>- P1: return
    P1->>+ P1511: uses
    P1511-->>- P1: return
    P1->>+ P1512: uses
    P1512-->>- P1: return
    P1->>+ P1513: uses
    P1513-->>- P1: return
    P1->>+ P1514: uses
    P1514-->>- P1: return
    P1->>+ P1515: uses
    P1515-->>- P1: return
    P1->>+ P1516: uses
    P1516-->>- P1: return
    P1->>+ P1517: uses
    P1517-->>- P1: return
    P1->>+ P1518: uses
    P1518-->>- P1: return
    P1->>+ P1519: uses
    P1519-->>- P1: return
    P1->>+ P1520: uses
    P1520-->>- P1: return
    P1->>+ P1521: uses
    P1521-->>- P1: return
    P1->>+ P1522: uses
    P1522-->>- P1: return
    P1->>+ P1523: uses
    P1523-->>- P1: return
    P1->>+ P1524: uses
    P1524-->>- P1: return
    P1->>+ P1525: uses
    P1525-->>- P1: return
    P1->>+ P1526: uses
    P1526-->>- P1: return
    P1->>+ P1527: uses
    P1527-->>- P1: return
    P1->>+ P1528: uses
    P1528-->>- P1: return
    P1->>+ P1529: uses
    P1529-->>- P1: return
    P1->>+ P1530: uses
    P1530-->>- P1: return
    P1->>+ P1531: uses
    P1531-->>- P1: return
    P1->>+ P1532: uses
    P1532-->>- P1: return
    P1->>+ P1533: uses
    P1533-->>- P1: return
    P1->>+ P1534: uses
    P1534-->>- P1: return
    P1->>+ P1535: uses
    P1535-->>- P1: return
    P1->>+ P1536: uses
    P1536-->>- P1: return
    P1->>+ P1537: uses
    P1537-->>- P1: return
    P1->>+ P1538: uses
    P1538-->>- P1: return
    P1->>+ P1539: uses
    P1539-->>- P1: return
    P1->>+ P1540: uses
    P1540-->>- P1: return
    P1->>+ P1541: uses
    P1541-->>- P1: return
    P1->>+ P1542: uses
    P1542-->>- P1: return
    P1->>+ P1543: uses
    P1543-->>- P1: return
    P1->>+ P1544: uses
    P1544-->>- P1: return
    P1->>+ P1545: uses
    P1545-->>- P1: return
    P1->>+ P1546: uses
    P1546-->>- P1: return
    P1->>+ P1547: uses
    P1547-->>- P1: return
    P1->>+ P1548: uses
    P1548-->>- P1: return
    P1->>+ P1549: uses
    P1549-->>- P1: return
    P1->>+ P1550: uses
    P1550-->>- P1: return
    P1->>+ P1551: uses
    P1551-->>- P1: return
    P1->>+ P1552: uses
    P1552-->>- P1: return
    P1->>+ P1553: uses
    P1553-->>- P1: return
    P1->>+ P1554: uses
    P1554-->>- P1: return
    P1->>+ P1555: uses
    P1555-->>- P1: return
    P1->>+ P1556: uses
    P1556-->>- P1: return
    P1->>+ P1557: uses
    P1557-->>- P1: return
    P1->>+ P1558: uses
    P1558-->>- P1: return
    P1->>+ P1559: uses
    P1559-->>- P1: return
    P1->>+ P1560: uses
    P1560-->>- P1: return
    P1->>+ P1561: uses
    P1561-->>- P1: return
    P1->>+ P1562: uses
    P1562-->>- P1: return
    P1->>+ P1563: uses
    P1563-->>- P1: return
    P1->>+ P1564: uses
    P1564-->>- P1: return
    P1->>+ P1565: uses
    P1565-->>- P1: return
    P1->>+ P1566: uses
    P1566-->>- P1: return
    P1->>+ P1567: uses
    P1567-->>- P1: return
    P1->>+ P1568: uses
    P1568-->>- P1: return
    P1->>+ P1569: uses
    P1569-->>- P1: return
    P1->>+ P1570: uses
    P1570-->>- P1: return
    P1->>+ P1571: uses
    P1571-->>- P1: return
    P1->>+ P1572: uses
    P1572-->>- P1: return
    P1->>+ P1573: uses
    P1573-->>- P1: return
    P1->>+ P1574: uses
    P1574-->>- P1: return
    P1->>+ P1575: uses
    P1575-->>- P1: return
    P1->>+ P1576: uses
    P1576-->>- P1: return
    P1->>+ P1577: uses
    P1577-->>- P1: return
    P1->>+ P1578: uses
    P1578-->>- P1: return
    P1->>+ P1579: uses
    P1579-->>- P1: return
    P1->>+ P1580: uses
    P1580-->>- P1: return
    P1->>+ P1581: uses
    P1581-->>- P1: return
    P1->>+ P1582: uses
    P1582-->>- P1: return
    P1->>+ P1583: uses
    P1583-->>- P1: return
    P1->>+ P1584: uses
    P1584-->>- P1: return
    P1->>+ P1585: uses
    P1585-->>- P1: return
    P1->>+ P1586: uses
    P1586-->>- P1: return
    P1->>+ P1587: uses
    P1587-->>- P1: return
    P1->>+ P1588: uses
    P1588-->>- P1: return
    P1->>+ P1589: uses
    P1589-->>- P1: return
    P1->>+ P1590: uses
    P1590-->>- P1: return
    P1->>+ P1591: uses
    P1591-->>- P1: return
    P1->>+ P1592: uses
    P1592-->>- P1: return
    P1->>+ P1593: uses
    P1593-->>- P1: return
    P1->>+ P1594: uses
    P1594-->>- P1: return
    P1->>+ P1595: uses
    P1595-->>- P1: return
    P1->>+ P1596: uses
    P1596-->>- P1: return
    P1->>+ P1597: uses
    P1597-->>- P1: return
    P1->>+ P1598: uses
    P1598-->>- P1: return
    P1->>+ P1599: uses
    P1599-->>- P1: return
    P1->>+ P1600: uses
    P1600-->>- P1: return
    P1->>+ P1601: uses
    P1601-->>- P1: return
    P1->>+ P1602: uses
    P1602-->>- P1: return
    P1->>+ P1603: uses
    P1603-->>- P1: return
    P1->>+ P1604: uses
    P1604-->>- P1: return
    P1->>+ P1605: uses
    P1605-->>- P1: return
    P1->>+ P1606: uses
    P1606-->>- P1: return
    P1->>+ P1607: uses
    P1607-->>- P1: return
    P1->>+ P1608: uses
    P1608-->>- P1: return
    P1->>+ P1609: uses
    P1609-->>- P1: return
    P1->>+ P1610: uses
    P1610-->>- P1: return
    P1->>+ P1611: uses
    P1611-->>- P1: return
    P1->>+ P1612: uses
    P1612-->>- P1: return
    P1->>+ P1613: uses
    P1613-->>- P1: return
    P1->>+ P1614: uses
    P1614-->>- P1: return
    P1->>+ P1615: uses
    P1615-->>- P1: return
    P1->>+ P1616: uses
    P1616-->>- P1: return
    P1->>+ P1617: uses
    P1617-->>- P1: return
    P1->>+ P1618: uses
    P1618-->>- P1: return
    P1->>+ P1619: uses
    P1619-->>- P1: return
    P1->>+ P1620: uses
    P1620-->>- P1: return
    P1->>+ P1621: uses
    P1621-->>- P1: return
    P1->>+ P1622: uses
    P1622-->>- P1: return
    P1->>+ P1623: uses
    P1623-->>- P1: return
    P1->>+ P1624: uses
    P1624-->>- P1: return
    P1->>+ P1625: uses
    P1625-->>- P1: return
    P1->>+ P273: uses
    P273-->>- P1: return
    P1->>+ P274: uses
    P274-->>- P1: return
    P1->>+ P275: uses
    P275-->>- P1: return
    P1->>+ P276: uses
    P276-->>- P1: return
    P1->>+ P277: uses
    P277-->>- P1: return
    P1->>+ P278: uses
    P278-->>- P1: return
    P1->>+ P279: uses
    P279-->>- P1: return
    P1->>+ P280: uses
    P280-->>- P1: return
    P1->>+ P281: uses
    P281-->>- P1: return
    P1->>+ P282: uses
    P282-->>- P1: return
    P1->>+ P283: uses
    P283-->>- P1: return
    P1->>+ P285: uses
    P285-->>- P1: return
    P1->>+ P286: uses
    P286-->>- P1: return
    P1->>+ P287: uses
    P287-->>- P1: return
    P1->>+ P288: uses
    P288-->>- P1: return
    P1->>+ P289: uses
    P289-->>- P1: return
    P1->>+ P290: uses
    P290-->>- P1: return
    P1->>+ P291: uses
    P291-->>- P1: return
    P1->>+ P292: uses
    P292-->>- P1: return
    P1->>+ P293: uses
    P293-->>- P1: return
    P1->>+ P294: uses
    P294-->>- P1: return
    P1->>+ P295: uses
    P295-->>- P1: return
    P1->>+ P296: uses
    P296-->>- P1: return
    P1->>+ P297: uses
    P297-->>- P1: return
    P1->>+ P298: uses
    P298-->>- P1: return
    P1->>+ P299: uses
    P299-->>- P1: return
    P1->>+ P300: uses
    P300-->>- P1: return
    P1->>+ P301: uses
    P301-->>- P1: return
    P1->>+ P302: uses
    P302-->>- P1: return
    P1->>+ P303: uses
    P303-->>- P1: return
    P1->>+ P304: uses
    P304-->>- P1: return
    P1->>+ P305: uses
    P305-->>- P1: return
    P1->>+ P306: uses
    P306-->>- P1: return
    P1->>+ P307: uses
    P307-->>- P1: return
    P1->>+ P308: uses
    P308-->>- P1: return
    P1->>+ P309: uses
    P309-->>- P1: return
    P1->>+ P310: uses
    P310-->>- P1: return
    P1->>+ P311: uses
    P311-->>- P1: return
    P1->>+ P312: uses
    P312-->>- P1: return
    P1->>+ P313: uses
    P313-->>- P1: return
    P1->>+ P314: uses
    P314-->>- P1: return
    P1->>+ P315: uses
    P315-->>- P1: return
    P1->>+ P316: uses
    P316-->>- P1: return
    P1->>+ P317: uses
    P317-->>- P1: return
    P1->>+ P318: uses
    P318-->>- P1: return
    P1->>+ P319: uses
    P319-->>- P1: return
    P1->>+ P320: uses
    P320-->>- P1: return
    P1->>+ P321: uses
    P321-->>- P1: return
    P1->>+ P322: uses
    P322-->>- P1: return
    P1->>+ P323: uses
    P323-->>- P1: return
    P1->>+ P324: uses
    P324-->>- P1: return
    P1->>+ P325: uses
    P325-->>- P1: return
    P1->>+ P326: uses
    P326-->>- P1: return
    P1->>+ P327: uses
    P327-->>- P1: return
    P1->>+ P328: uses
    P328-->>- P1: return
    P1->>+ P329: uses
    P329-->>- P1: return
    P1->>+ P330: uses
    P330-->>- P1: return
    P1->>+ P331: uses
    P331-->>- P1: return
    P1->>+ P332: uses
    P332-->>- P1: return
    P1->>+ P333: uses
    P333-->>- P1: return
    P1->>+ P334: uses
    P334-->>- P1: return
    P1->>+ P335: uses
    P335-->>- P1: return
    P1->>+ P336: uses
    P336-->>- P1: return
    P1->>+ P337: uses
    P337-->>- P1: return
    P1->>+ P338: uses
    P338-->>- P1: return
    P1->>+ P339: uses
    P339-->>- P1: return
    P1->>+ P340: uses
    P340-->>- P1: return
    P1->>+ P341: uses
    P341-->>- P1: return
    P1->>+ P342: uses
    P342-->>- P1: return
    P1->>+ P343: uses
    P343-->>- P1: return
    P1->>+ P344: uses
    P344-->>- P1: return
    P1->>+ P345: uses
    P345-->>- P1: return
    P1->>+ P346: uses
    P346-->>- P1: return
    P1->>+ P347: uses
    P347-->>- P1: return
    P1->>+ P348: uses
    P348-->>- P1: return
    P1->>+ P349: uses
    P349-->>- P1: return
    P1->>+ P350: uses
    P350-->>- P1: return
    P1->>+ P351: uses
    P351-->>- P1: return
    P1->>+ P352: uses
    P352-->>- P1: return
    P1->>+ P353: uses
    P353-->>- P1: return
    P1->>+ P354: uses
    P354-->>- P1: return
    P1->>+ P355: uses
    P355-->>- P1: return
    P1->>+ P356: uses
    P356-->>- P1: return
    P1->>+ P357: uses
    P357-->>- P1: return
    P1->>+ P358: uses
    P358-->>- P1: return
    P1->>+ P359: uses
    P359-->>- P1: return
    P1->>+ P360: uses
    P360-->>- P1: return
    P1->>+ P361: uses
    P361-->>- P1: return
    P1->>+ P362: uses
    P362-->>- P1: return
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
    P1->>+ P370: uses
    P370-->>- P1: return
    P1->>+ P371: uses
    P371-->>- P1: return
    P1->>+ P372: uses
    P372-->>- P1: return
    P1->>+ P373: uses
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
    P1->>+ P420: uses
    P420-->>- P1: return
    P1->>+ P505: uses
    P505-->>- P1: return
    P1->>+ P506: uses
    P506-->>- P1: return
    P1->>+ P511: uses
    P511-->>- P1: return
    P1->>+ P542: uses
    P542-->>- P1: return
    P1->>+ P543: uses
    P543-->>- P1: return
    P1->>+ P544: uses
    P544-->>- P1: return
    P1->>+ P547: uses
    P547-->>- P1: return
    P1->>+ P548: uses
    P548-->>- P1: return
    P1->>+ P590: uses
    P590-->>- P1: return
    P1->>+ P594: uses
    P594-->>- P1: return
    P1->>+ P680: uses
    P680-->>- P1: return
    P1->>+ P681: uses
    P681-->>- P1: return
    P1->>+ P682: uses
    P682-->>- P1: return
    P1->>+ P683: uses
    P683-->>- P1: return
    P1->>+ P684: uses
    P684-->>- P1: return
    P1->>+ P685: uses
    P685-->>- P1: return
    P1->>+ P686: uses
    P686-->>- P1: return
    P1->>+ P687: uses
    P687-->>- P1: return
    P1->>+ P688: uses
    P688-->>- P1: return
    P1->>+ P689: uses
    P689-->>- P1: return
    P1->>+ P690: uses
    P690-->>- P1: return
    P1->>+ P691: uses
    P691-->>- P1: return
    P1->>+ P692: uses
    P692-->>- P1: return
    P1->>+ P693: uses
    P693-->>- P1: return
    P1->>+ P694: uses
    P694-->>- P1: return
    P1->>+ P695: uses
    P695-->>- P1: return
    P1->>+ P696: uses
    P696-->>- P1: return
    P1->>+ P697: uses
    P697-->>- P1: return
    P1->>+ P698: uses
    P698-->>- P1: return
    P1->>+ P699: uses
    P699-->>- P1: return
    P1->>+ P700: uses
    P700-->>- P1: return
    P1->>+ P701: uses
    P701-->>- P1: return
    P1->>+ P702: uses
    P702-->>- P1: return
    P1->>+ P703: uses
    P703-->>- P1: return
    P1->>+ P704: uses
    P704-->>- P1: return
    P1->>+ P705: uses
    P705-->>- P1: return
    P1->>+ P706: uses
    P706-->>- P1: return
    P1->>+ P707: uses
    P707-->>- P1: return
    P1->>+ P708: uses
    P708-->>- P1: return
    P1->>+ P709: uses
    P709-->>- P1: return
    P1->>+ P710: uses
    P710-->>- P1: return
    P1->>+ P711: uses
    P711-->>- P1: return
    P1->>+ P712: uses
    P712-->>- P1: return
    P1->>+ P713: uses
    P713-->>- P1: return
    P1->>+ P714: uses
    P714-->>- P1: return
    P1->>+ P715: uses
    P715-->>- P1: return
    P1->>+ P716: uses
    P716-->>- P1: return
    P1->>+ P717: uses
    P717-->>- P1: return
    P1->>+ P718: uses
    P718-->>- P1: return
    P1->>+ P719: uses
    P719-->>- P1: return
    P1->>+ P720: uses
    P720-->>- P1: return
    P1->>+ P721: uses
    P721-->>- P1: return
    P1->>+ P722: uses
    P722-->>- P1: return
    P1->>+ P723: uses
    P723-->>- P1: return
    P1->>+ P724: uses
    P724-->>- P1: return
    P1->>+ P725: uses
    P725-->>- P1: return
    P1->>+ P726: uses
    P726-->>- P1: return
    P1->>+ P727: uses
    P727-->>- P1: return
    P1->>+ P728: uses
    P728-->>- P1: return
    P1->>+ P729: uses
    P729-->>- P1: return
    P1->>+ P730: uses
    P730-->>- P1: return
    P1->>+ P731: uses
    P731-->>- P1: return
    P1->>+ P732: uses
    P732-->>- P1: return
    P1->>+ P733: uses
    P733-->>- P1: return
    P1->>+ P734: uses
    P734-->>- P1: return
    P1->>+ P735: uses
    P735-->>- P1: return
    P1->>+ P736: uses
    P736-->>- P1: return
    P1->>+ P737: uses
    P737-->>- P1: return
    P1->>+ P738: uses
    P738-->>- P1: return
    P1->>+ P739: uses
    P739-->>- P1: return
    P1->>+ P740: uses
    P740-->>- P1: return
    P1->>+ P741: uses
    P741-->>- P1: return
    P1->>+ P742: uses
    P742-->>- P1: return
    P1->>+ P743: uses
    P743-->>- P1: return
    P1->>+ P744: uses
    P744-->>- P1: return
    P1->>+ P745: uses
    P745-->>- P1: return
    P1->>+ P746: uses
    P746-->>- P1: return
    P1->>+ P747: uses
    P747-->>- P1: return
    P1->>+ P748: uses
    P748-->>- P1: return
    P1->>+ P749: uses
    P749-->>- P1: return
    P1->>+ P750: uses
    P750-->>- P1: return
    P1->>+ P751: uses
    P751-->>- P1: return
    P1->>+ P752: uses
    P752-->>- P1: return
    P1->>+ P753: uses
    P753-->>- P1: return
    P1->>+ P754: uses
    P754-->>- P1: return
    P1->>+ P755: uses
    P755-->>- P1: return
    P1->>+ P756: uses
    P756-->>- P1: return
    P1->>+ P757: uses
    P757-->>- P1: return
    P1->>+ P758: uses
    P758-->>- P1: return
    P1->>+ P759: uses
    P759-->>- P1: return
    P1->>+ P760: uses
    P760-->>- P1: return
    P1->>+ P761: uses
    P761-->>- P1: return
    P1->>+ P762: uses
    P762-->>- P1: return
    P1->>+ P763: uses
    P763-->>- P1: return
    P1->>+ P764: uses
    P764-->>- P1: return
    P1->>+ P765: uses
    P765-->>- P1: return
    P1->>+ P766: uses
    P766-->>- P1: return
    P1->>+ P767: uses
    P767-->>- P1: return
    P1->>+ P768: uses
    P768-->>- P1: return
    P1->>+ P769: uses
    P769-->>- P1: return
    P1->>+ P770: uses
    P770-->>- P1: return
    P1->>+ P771: uses
    P771-->>- P1: return
    P1->>+ P772: uses
    P772-->>- P1: return
    P1->>+ P773: uses
    P773-->>- P1: return
    P1->>+ P774: uses
    P774-->>- P1: return
    P1->>+ P775: uses
    P775-->>- P1: return
    P1->>+ P776: uses
    P776-->>- P1: return
    P1->>+ P777: uses
    P777-->>- P1: return
    P1->>+ P778: uses
    P778-->>- P1: return
    P1->>+ P779: uses
    P779-->>- P1: return
    P1->>+ P780: uses
    P780-->>- P1: return
    P1->>+ P781: uses
    P781-->>- P1: return
    P1->>+ P782: uses
    P782-->>- P1: return
    P1->>+ P783: uses
    P783-->>- P1: return
    P1->>+ P784: uses
    P784-->>- P1: return
    P1->>+ P785: uses
    P785-->>- P1: return
    P1->>+ P786: uses
    P786-->>- P1: return
    P1->>+ P787: uses
    P787-->>- P1: return
    P1->>+ P788: uses
    P788-->>- P1: return
    P1->>+ P789: uses
    P789-->>- P1: return
    P1->>+ P790: uses
    P790-->>- P1: return
    P1->>+ P791: uses
    P791-->>- P1: return
    P1->>+ P792: uses
    P792-->>- P1: return
    P1->>+ P793: uses
    P793-->>- P1: return
    P1->>+ P794: uses
    P794-->>- P1: return
    P1->>+ P795: uses
    P795-->>- P1: return
    P1->>+ P796: uses
    P796-->>- P1: return
    P1->>+ P797: uses
    P797-->>- P1: return
    P1->>+ P798: uses
    P798-->>- P1: return
    P1->>+ P799: uses
    P799-->>- P1: return
    P1->>+ P800: uses
    P800-->>- P1: return
    P1->>+ P801: uses
    P801-->>- P1: return
    P1->>+ P802: uses
    P802-->>- P1: return
    P1->>+ P803: uses
    P803-->>- P1: return
    P1->>+ P804: uses
    P804-->>- P1: return
    P1->>+ P805: uses
    P805-->>- P1: return
    P1->>+ P806: uses
    P806-->>- P1: return
    P1->>+ P807: uses
    P807-->>- P1: return
    P1->>+ P808: uses
    P808-->>- P1: return
    P1->>+ P809: uses
    P809-->>- P1: return
    P1->>+ P810: uses
    P810-->>- P1: return
    P1->>+ P811: uses
    P811-->>- P1: return
    P1->>+ P812: uses
    P812-->>- P1: return
    P1->>+ P813: uses
    P813-->>- P1: return
    P1->>+ P814: uses
    P814-->>- P1: return
    P1->>+ P815: uses
    P815-->>- P1: return
    P1->>+ P816: uses
    P816-->>- P1: return
    P1->>+ P817: uses
    P817-->>- P1: return
    P1->>+ P818: uses
    P818-->>- P1: return
    P1->>+ P819: uses
    P819-->>- P1: return
    P1->>+ P820: uses
    P820-->>- P1: return
    P1->>+ P821: uses
    P821-->>- P1: return
    P1->>+ P822: uses
    P822-->>- P1: return
    P1->>+ P823: uses
    P823-->>- P1: return
    P1->>+ P824: uses
    P824-->>- P1: return
    P1->>+ P825: uses
    P825-->>- P1: return
    P1->>+ P826: uses
    P826-->>- P1: return
    P1->>+ P827: uses
    P827-->>- P1: return
    P1->>+ P828: uses
    P828-->>- P1: return
    P1->>+ P829: uses
    P829-->>- P1: return
    P1->>+ P830: uses
    P830-->>- P1: return
    P1->>+ P831: uses
    P831-->>- P1: return
    P1->>+ P832: uses
    P832-->>- P1: return
    P1->>+ P833: uses
    P833-->>- P1: return
    P1->>+ P834: uses
    P834-->>- P1: return
    P1->>+ P835: uses
    P835-->>- P1: return
    P1->>+ P836: uses
    P836-->>- P1: return
    P1->>+ P837: uses
    P837-->>- P1: return
    P1->>+ P1626: calls
    P1626-->>- P1: return
    P1->>+ P1627: calls
    P1627-->>- P1: return
    P1->>+ P1628: calls
    P1628-->>- P1: return
    P1->>+ P1629: calls
    P1629-->>- P1: return
    P1->>+ P1630: calls
    P1630-->>- P1: return
    P1->>+ P1631: calls
    P1631-->>- P1: return
    P1->>+ P1632: calls
    P1632-->>- P1: return
    P1->>+ P1633: calls
    P1633-->>- P1: return
    P1->>+ P1634: calls
    P1634-->>- P1: return
    P1->>+ P1635: calls
    P1635-->>- P1: return
    P1->>+ P1636: calls
    P1636-->>- P1: return
    P1->>+ P1637: calls
    P1637-->>- P1: return
    P1->>+ P1638: calls
    P1638-->>- P1: return
    P1->>+ P1639: calls
    P1639-->>- P1: return
    P1->>+ P1640: calls
    P1640-->>- P1: return
    P1->>+ P1641: calls
    P1641-->>- P1: return
    P1->>+ P1642: calls
    P1642-->>- P1: return
    P1->>+ P1643: uses
    P1643-->>- P1: return
    P1->>+ P1644: uses
    P1644-->>- P1: return
    P1->>+ P1645: uses
    P1645-->>- P1: return
    P1->>+ P1646: uses
    P1646-->>- P1: return
    P1->>+ P1647: uses
    P1647-->>- P1: return
    P1->>+ P1648: uses
    P1648-->>- P1: return
    P1->>+ P1649: uses
    P1649-->>- P1: return
    P1->>+ P1650: uses
    P1650-->>- P1: return
    P1->>+ P1651: uses
    P1651-->>- P1: return
    P1->>+ P1652: uses
    P1652-->>- P1: return
    P1->>+ P1653: uses
    P1653-->>- P1: return
    P1->>+ P1654: uses
    P1654-->>- P1: return
    P1->>+ P1655: uses
    P1655-->>- P1: return
    P1->>+ P1656: uses
    P1656-->>- P1: return
    P1->>+ P1657: uses
    P1657-->>- P1: return
    P1->>+ P1658: uses
    P1658-->>- P1: return
    P1->>+ P1659: uses
    P1659-->>- P1: return
    P1->>+ P1660: uses
    P1660-->>- P1: return
    P1->>+ P1661: calls
    P1661-->>- P1: return
    P1->>+ P1662: calls
    P1662-->>- P1: return
    P1->>+ P1663: calls
    P1663-->>- P1: return
    P1->>+ P1664: calls
    P1664-->>- P1: return
    P1->>+ P1665: calls
    P1665-->>- P1: return
    P1->>+ P1666: calls
    P1666-->>- P1: return
    P1->>+ P1667: calls
    P1667-->>- P1: return
    P1->>+ P1668: calls
    P1668-->>- P1: return
    P1->>+ P1669: calls
    P1669-->>- P1: return
    P1->>+ P1670: calls
    P1670-->>- P1: return
    P1->>+ P1671: calls
    P1671-->>- P1: return
    P1->>+ P1672: calls
    P1672-->>- P1: return
    P1->>+ P1673: uses
    P1673-->>- P1: return
    P1->>+ P1674: uses
    P1674-->>- P1: return
    P1->>+ P1675: uses
    P1675-->>- P1: return
    P1->>+ P1676: uses
    P1676-->>- P1: return
    P1->>+ P1677: uses
    P1677-->>- P1: return
    P1->>+ P1678: uses
    P1678-->>- P1: return
    P1->>+ P1679: uses
    P1679-->>- P1: return
    P1->>+ P1680: uses
    P1680-->>- P1: return
    P1->>+ P1681: uses
    P1681-->>- P1: return
    P1->>+ P1682: uses
    P1682-->>- P1: return
    P1->>+ P1683: uses
    P1683-->>- P1: return
    P1->>+ P1684: uses
    P1684-->>- P1: return
    P1->>+ P1685: uses
    P1685-->>- P1: return
    P1->>+ P1686: uses
    P1686-->>- P1: return
    P1->>+ P1687: uses
    P1687-->>- P1: return
    P1->>+ P1688: calls
    P1688-->>- P1: return
    P1->>+ P1689: calls
    P1689-->>- P1: return
    P1->>+ P1690: calls
    P1690-->>- P1: return
    P1->>+ P1691: calls
    P1691-->>- P1: return
    P1->>+ P1692: calls
    P1692-->>- P1: return
    P1->>+ P1693: calls
    P1693-->>- P1: return
    P1->>+ P1694: calls
    P1694-->>- P1: return
    P1->>+ P1695: calls
    P1695-->>- P1: return
    P1->>+ P1696: calls
    P1696-->>- P1: return
    P1->>+ P1697: calls
    P1697-->>- P1: return
    P1->>+ P1698: calls
    P1698-->>- P1: return
    P1->>+ P1699: calls
    P1699-->>- P1: return
    P1->>+ P1700: calls
    P1700-->>- P1: return
    P1->>+ P1701: calls
    P1701-->>- P1: return
    P1->>+ P1702: calls
    P1702-->>- P1: return
    P1->>+ P1703: calls
    P1703-->>- P1: return
    P1->>+ P1704: calls
    P1704-->>- P1: return
    P1->>+ P1705: calls
    P1705-->>- P1: return
    P0->>+ P3: uses
    P3-->>- P0: return
    P0->>+ P4: uses
    P4-->>- P0: return
    P0->>+ P1706: uses
    P1706-->>- P0: return
    P0->>+ P5: uses
    P5-->>- P0: return
    P0->>+ P6: uses
    P6-->>- P0: return
    P0->>+ P1707: uses
    P1707-->>- P0: return
    P0->>+ P7: uses
    P7-->>- P0: return
    P0->>+ P8: uses
    P8-->>- P0: return
    P0->>+ P9: uses
    P9-->>- P0: return
    P0->>+ P10: uses
    P10-->>- P0: return
    P0->>+ P1708: uses
    P1708-->>- P0: return
    P0->>+ P11: uses
    P11-->>- P0: return
    P0->>+ P1709: uses
    P1709-->>- P0: return
    P0->>+ P1710: uses
    P1710-->>- P0: return
    P0->>+ P1711: uses
    P1711-->>- P0: return
    P0->>+ P1712: uses
    P1712-->>- P0: return
    P0->>+ P1713: uses
    P1713-->>- P0: return
    P0->>+ P1714: uses
    P1714-->>- P0: return
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
    P0->>+ P263: uses
    P263-->>- P0: return
    P0->>+ P264: uses
    P264-->>- P0: return
    P0->>+ P1715: uses
    P1715-->>- P0: return
    P0->>+ P1716: uses
    P1716-->>- P0: return
    P0->>+ P265: uses
    P265-->>- P0: return
    P0->>+ P266: uses
    P266-->>- P0: return
    P0->>+ P267: uses
    P267-->>- P0: return
    P0->>+ P1717: uses
    P1717-->>- P0: return
    P0->>+ P268: uses
    P268-->>- P0: return
    P0->>+ P1718: uses
    P1718-->>- P0: return
    P0->>+ P269: uses
    P269-->>- P0: return
    P0->>+ P1719: uses
    P1719-->>- P0: return
    P0->>+ P1720: uses
    P1720-->>- P0: return
    P0->>+ P1721: calls
    P1721-->>- P0: return
    P0->>+ P1722: uses
    P1722-->>- P0: return
    P0->>+ P270: uses
    P270-->>- P0: return
    P0->>+ P1723: uses
    P1723-->>- P0: return
    P0->>+ P1724: uses
    P1724-->>- P0: return
    P0->>+ P1725: uses
    P1725-->>- P0: return
    P0->>+ P271: uses
    P271-->>- P0: return
    P0->>+ P1726: uses
    P1726-->>- P0: return
    P0->>+ P272: uses
    P272-->>- P0: return
    P0->>+ P1727: uses
    P1727-->>- P0: return
    P0->>+ P1728: uses
    P1728-->>- P0: return
    P0->>+ P1729: uses
    P1729-->>- P0: return
    P0->>+ P1730: uses
    P1730-->>- P0: return
    P0->>+ P1731: uses
    P1731-->>- P0: return
    P0->>+ P1732: uses
    P1732-->>- P0: return
    P0->>+ P1733: uses
    P1733-->>- P0: return
    P0->>+ P1734: uses
    P1734-->>- P0: return
    P0->>+ P1735: uses
    P1735-->>- P0: return
    P0->>+ P1736: uses
    P1736-->>- P0: return
    P0->>+ P1737: uses
    P1737-->>- P0: return
    P0->>+ P1738: uses
    P1738-->>- P0: return
    P0->>+ P1739: uses
    P1739-->>- P0: return
    P0->>+ P1740: uses
    P1740-->>- P0: return
    P0->>+ P1741: uses
    P1741-->>- P0: return
    P0->>+ P1742: uses
    P1742-->>- P0: return
    P0->>+ P1743: uses
    P1743-->>- P0: return
    P0->>+ P1744: uses
    P1744-->>- P0: return
    P0->>+ P1745: uses
    P1745-->>- P0: return
    P0->>+ P1746: uses
    P1746-->>- P0: return
    P0->>+ P1747: uses
    P1747-->>- P0: return
    P0->>+ P1748: uses
    P1748-->>- P0: return
    P0->>+ P1749: uses
    P1749-->>- P0: return
    P0->>+ P1750: uses
    P1750-->>- P0: return
    P0->>+ P1751: uses
    P1751-->>- P0: return
    P0->>+ P1752: uses
    P1752-->>- P0: return
    P0->>+ P1753: uses
    P1753-->>- P0: return
    P0->>+ P1754: uses
    P1754-->>- P0: return
    P0->>+ P1755: uses
    P1755-->>- P0: return
    P0->>+ P1756: uses
    P1756-->>- P0: return
    P0->>+ P1757: uses
    P1757-->>- P0: return
    P0->>+ P1758: uses
    P1758-->>- P0: return
    P0->>+ P1759: uses
    P1759-->>- P0: return
    P0->>+ P1760: uses
    P1760-->>- P0: return
    P0->>+ P1761: uses
    P1761-->>- P0: return
    P0->>+ P1762: uses
    P1762-->>- P0: return
    P0->>+ P1763: uses
    P1763-->>- P0: return
    P0->>+ P1764: uses
    P1764-->>- P0: return
    P0->>+ P1765: uses
    P1765-->>- P0: return
    P0->>+ P1766: uses
    P1766-->>- P0: return
    P0->>+ P1767: uses
    P1767-->>- P0: return
    P0->>+ P1768: uses
    P1768-->>- P0: return
    P0->>+ P1769: uses
    P1769-->>- P0: return
    P0->>+ P1770: uses
    P1770-->>- P0: return
    P0->>+ P1771: uses
    P1771-->>- P0: return
    P0->>+ P1772: uses
    P1772-->>- P0: return
    P0->>+ P1773: uses
    P1773-->>- P0: return
    P0->>+ P1774: uses
    P1774-->>- P0: return
    P0->>+ P1775: uses
    P1775-->>- P0: return
    P0->>+ P1776: uses
    P1776-->>- P0: return
    P0->>+ P1777: uses
    P1777-->>- P0: return
    P0->>+ P1778: uses
    P1778-->>- P0: return
    P0->>+ P1779: uses
    P1779-->>- P0: return
    P0->>+ P1780: uses
    P1780-->>- P0: return
    P0->>+ P1781: uses
    P1781-->>- P0: return
    P0->>+ P1782: uses
    P1782-->>- P0: return
    P0->>+ P1783: uses
    P1783-->>- P0: return
    P0->>+ P1784: uses
    P1784-->>- P0: return
    P0->>+ P1785: uses
    P1785-->>- P0: return
    P0->>+ P1786: uses
    P1786-->>- P0: return
    P0->>+ P1787: uses
    P1787-->>- P0: return
    P0->>+ P1788: uses
    P1788-->>- P0: return
    P0->>+ P1789: uses
    P1789-->>- P0: return
    P0->>+ P1790: uses
    P1790-->>- P0: return
    P0->>+ P1791: uses
    P1791-->>- P0: return
    P0->>+ P1792: uses
    P1792-->>- P0: return
    P0->>+ P1793: uses
    P1793-->>- P0: return
    P0->>+ P1794: uses
    P1794-->>- P0: return
    P0->>+ P1795: uses
    P1795-->>- P0: return
    P0->>+ P1796: uses
    P1796-->>- P0: return
    P0->>+ P1797: uses
    P1797-->>- P0: return
    P0->>+ P1798: uses
    P1798-->>- P0: return
    P0->>+ P1799: uses
    P1799-->>- P0: return
    P0->>+ P1800: uses
    P1800-->>- P0: return
    P0->>+ P1801: uses
    P1801-->>- P0: return
    P0->>+ P1802: uses
    P1802-->>- P0: return
    P0->>+ P1803: uses
    P1803-->>- P0: return
    P0->>+ P1804: uses
    P1804-->>- P0: return
    P0->>+ P1805: uses
    P1805-->>- P0: return
    P0->>+ P1806: uses
    P1806-->>- P0: return
    P0->>+ P1807: uses
    P1807-->>- P0: return
    P0->>+ P1808: uses
    P1808-->>- P0: return
    P0->>+ P1809: uses
    P1809-->>- P0: return
    P0->>+ P1810: uses
    P1810-->>- P0: return
    P0->>+ P1811: uses
    P1811-->>- P0: return
    P0->>+ P1812: uses
    P1812-->>- P0: return
    P0->>+ P1813: uses
    P1813-->>- P0: return
    P0->>+ P1814: uses
    P1814-->>- P0: return
    P0->>+ P1815: uses
    P1815-->>- P0: return
    P0->>+ P1816: uses
    P1816-->>- P0: return
    P0->>+ P1817: uses
    P1817-->>- P0: return
    P0->>+ P1818: uses
    P1818-->>- P0: return
    P0->>+ P1819: uses
    P1819-->>- P0: return
    P0->>+ P1820: uses
    P1820-->>- P0: return
    P0->>+ P1821: uses
    P1821-->>- P0: return
    P0->>+ P1822: uses
    P1822-->>- P0: return
    P0->>+ P1823: uses
    P1823-->>- P0: return
    P0->>+ P1824: uses
    P1824-->>- P0: return
    P0->>+ P1825: uses
    P1825-->>- P0: return
    P0->>+ P1826: uses
    P1826-->>- P0: return
    P0->>+ P1827: uses
    P1827-->>- P0: return
    P0->>+ P1828: uses
    P1828-->>- P0: return
    P0->>+ P1829: uses
    P1829-->>- P0: return
    P0->>+ P1830: uses
    P1830-->>- P0: return
    P0->>+ P1831: uses
    P1831-->>- P0: return
    P0->>+ P1832: uses
    P1832-->>- P0: return
    P0->>+ P1833: uses
    P1833-->>- P0: return
    P0->>+ P1834: uses
    P1834-->>- P0: return
    P0->>+ P1835: uses
    P1835-->>- P0: return
    P0->>+ P1836: uses
    P1836-->>- P0: return
    P0->>+ P1837: uses
    P1837-->>- P0: return
    P0->>+ P1838: uses
    P1838-->>- P0: return
    P0->>+ P1839: uses
    P1839-->>- P0: return
    P0->>+ P1840: uses
    P1840-->>- P0: return
    P0->>+ P1841: uses
    P1841-->>- P0: return
    P0->>+ P1842: uses
    P1842-->>- P0: return
    P0->>+ P1843: uses
    P1843-->>- P0: return
    P0->>+ P1844: uses
    P1844-->>- P0: return
    P0->>+ P1845: uses
    P1845-->>- P0: return
    P0->>+ P1846: uses
    P1846-->>- P0: return
    P0->>+ P1847: uses
    P1847-->>- P0: return
    P0->>+ P1848: uses
    P1848-->>- P0: return
    P0->>+ P1849: uses
    P1849-->>- P0: return
    P0->>+ P1850: uses
    P1850-->>- P0: return
    P0->>+ P1851: uses
    P1851-->>- P0: return
    P0->>+ P1852: uses
    P1852-->>- P0: return
    P0->>+ P1853: uses
    P1853-->>- P0: return
    P0->>+ P1854: uses
    P1854-->>- P0: return
    P0->>+ P1855: uses
    P1855-->>- P0: return
    P0->>+ P1856: uses
    P1856-->>- P0: return
    P0->>+ P1857: uses
    P1857-->>- P0: return
    P0->>+ P1858: uses
    P1858-->>- P0: return
    P0->>+ P1859: uses
    P1859-->>- P0: return
    P0->>+ P1860: uses
    P1860-->>- P0: return
    P0->>+ P1861: uses
    P1861-->>- P0: return
    P0->>+ P1862: uses
    P1862-->>- P0: return
    P0->>+ P1863: uses
    P1863-->>- P0: return
    P0->>+ P1864: uses
    P1864-->>- P0: return
    P0->>+ P1865: uses
    P1865-->>- P0: return
    P0->>+ P1866: uses
    P1866-->>- P0: return
    P0->>+ P1867: uses
    P1867-->>- P0: return
    P0->>+ P1868: uses
    P1868-->>- P0: return
    P0->>+ P1869: uses
    P1869-->>- P0: return
    P0->>+ P1870: uses
    P1870-->>- P0: return
    P0->>+ P273: uses
    P273-->>- P0: return
    P0->>+ P274: uses
    P274-->>- P0: return
    P0->>+ P275: uses
    P275-->>- P0: return
    P0->>+ P276: uses
    P276-->>- P0: return
    P0->>+ P1871: uses
    P1871-->>- P0: return
    P0->>+ P1872: uses
    P1872-->>- P0: return
    P0->>+ P1873: uses
    P1873-->>- P0: return
    P0->>+ P1874: uses
    P1874-->>- P0: return
    P0->>+ P1875: uses
    P1875-->>- P0: return
    P0->>+ P1876: uses
    P1876-->>- P0: return
    P0->>+ P1877: uses
    P1877-->>- P0: return
    P0->>+ P1878: uses
    P1878-->>- P0: return
    P0->>+ P1879: uses
    P1879-->>- P0: return
    P0->>+ P1880: uses
    P1880-->>- P0: return
    P0->>+ P1881: uses
    P1881-->>- P0: return
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
    P0->>+ P323: uses
    P323-->>- P0: return
    P0->>+ P324: uses
    P324-->>- P0: return
    P0->>+ P325: uses
    P325-->>- P0: return
    P0->>+ P326: uses
    P326-->>- P0: return
    P0->>+ P327: uses
    P327-->>- P0: return
    P0->>+ P328: uses
    P328-->>- P0: return
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
    P0->>+ P363: uses
    P363-->>- P0: return
    P0->>+ P364: uses
    P364-->>- P0: return
    P0->>+ P365: uses
    P365-->>- P0: return
    P0->>+ P366: uses
    P366-->>- P0: return
    P0->>+ P367: uses
    P367-->>- P0: return
    P0->>+ P368: uses
    P368-->>- P0: return
    P0->>+ P369: uses
    P369-->>- P0: return
    P0->>+ P370: uses
    P370-->>- P0: return
    P0->>+ P371: uses
    P371-->>- P0: return
    P0->>+ P372: uses
    P372-->>- P0: return
    P0->>+ P373: uses
    P373-->>- P0: return
    P0->>+ P374: uses
    P374-->>- P0: return
    P0->>+ P375: uses
    P375-->>- P0: return
    P0->>+ P376: uses
    P376-->>- P0: return
    P0->>+ P377: uses
    P377-->>- P0: return
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
    P0->>+ P1882: uses
    P1882-->>- P0: return
    P0->>+ P416: uses
    P416-->>- P0: return
    P0->>+ P1883: uses
    P1883-->>- P0: return
    P0->>+ P417: uses
    P417-->>- P0: return
    P0->>+ P1884: calls
    P1884-->>- P0: return
    P0->>+ P418: uses
    P418-->>- P0: return
    P0->>+ P419: uses
    P419-->>- P0: return
    P0->>+ P1885: uses
    P1885-->>- P0: return
    P0->>+ P1886: uses
    P1886-->>- P0: return
    P0->>+ P1887: uses
    P1887-->>- P0: return
    P0->>+ P1888: uses
    P1888-->>- P0: return
    P0->>+ P420: uses
    P420-->>- P0: return
    P0->>+ P1889: uses
    P1889-->>- P0: return
    P0->>+ P1890: uses
    P1890-->>- P0: return
    P0->>+ P421: uses
    P421-->>- P0: return
    P0->>+ P1891: calls
    P1891-->>- P0: return
    P0->>+ P422: uses
    P422-->>- P0: return
    P0->>+ P1892: uses
    P1892-->>- P0: return
    P0->>+ P1893: uses
    P1893-->>- P0: return
    P0->>+ P1894: uses
    P1894-->>- P0: return
    P0->>+ P1895: uses
    P1895-->>- P0: return
    P0->>+ P1896: uses
    P1896-->>- P0: return
    P0->>+ P1897: uses
    P1897-->>- P0: return
    P0->>+ P1898: uses
    P1898-->>- P0: return
    P0->>+ P1899: uses
    P1899-->>- P0: return
    P0->>+ P1900: uses
    P1900-->>- P0: return
    P0->>+ P1901: uses
    P1901-->>- P0: return
    P0->>+ P1902: uses
    P1902-->>- P0: return
    P0->>+ P1903: uses
    P1903-->>- P0: return
    P0->>+ P1904: uses
    P1904-->>- P0: return
    P0->>+ P1905: uses
    P1905-->>- P0: return
    P0->>+ P1906: uses
    P1906-->>- P0: return
    P0->>+ P1907: uses
    P1907-->>- P0: return
    P0->>+ P1908: uses
    P1908-->>- P0: return
    P0->>+ P1909: uses
    P1909-->>- P0: return
    P0->>+ P1910: uses
    P1910-->>- P0: return
    P0->>+ P1911: uses
    P1911-->>- P0: return
    P0->>+ P1912: uses
    P1912-->>- P0: return
    P0->>+ P1913: uses
    P1913-->>- P0: return
    P0->>+ P1914: uses
    P1914-->>- P0: return
    P0->>+ P1915: uses
    P1915-->>- P0: return
    P0->>+ P1916: uses
    P1916-->>- P0: return
    P0->>+ P1917: uses
    P1917-->>- P0: return
    P0->>+ P1918: uses
    P1918-->>- P0: return
    P0->>+ P1919: uses
    P1919-->>- P0: return
    P0->>+ P1920: uses
    P1920-->>- P0: return
    P0->>+ P1921: uses
    P1921-->>- P0: return
    P0->>+ P1922: uses
    P1922-->>- P0: return
    P0->>+ P1923: uses
    P1923-->>- P0: return
    P0->>+ P1924: uses
    P1924-->>- P0: return
    P0->>+ P1925: uses
    P1925-->>- P0: return
    P0->>+ P1926: uses
    P1926-->>- P0: return
    P0->>+ P1927: uses
    P1927-->>- P0: return
    P0->>+ P1928: uses
    P1928-->>- P0: return
    P0->>+ P1929: uses
    P1929-->>- P0: return
    P0->>+ P1930: uses
    P1930-->>- P0: return
    P0->>+ P1931: uses
    P1931-->>- P0: return
    P0->>+ P1932: uses
    P1932-->>- P0: return
    P0->>+ P1933: uses
    P1933-->>- P0: return
    P0->>+ P1934: uses
    P1934-->>- P0: return
    P0->>+ P1935: uses
    P1935-->>- P0: return
    P0->>+ P423: uses
    P423-->>- P0: return
    P0->>+ P424: uses
    P424-->>- P0: return
    P0->>+ P1936: uses
    P1936-->>- P0: return
    P0->>+ P1937: uses
    P1937-->>- P0: return
    P0->>+ P1938: uses
    P1938-->>- P0: return
    P0->>+ P1939: uses
    P1939-->>- P0: return
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
    P0->>+ P471: uses
    P471-->>- P0: return
    P0->>+ P472: uses
    P472-->>- P0: return
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
    P0->>+ P493: uses
    P493-->>- P0: return
    P0->>+ P1940: calls
    P1940-->>- P0: return
    P0->>+ P1941: uses
    P1941-->>- P0: return
    P0->>+ P1942: uses
    P1942-->>- P0: return
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
    P0->>+ P1943: calls
    P1943-->>- P0: return
    P0->>+ P1944: uses
    P1944-->>- P0: return
    P0->>+ P1945: uses
    P1945-->>- P0: return
    P0->>+ P1946: uses
    P1946-->>- P0: return
    P0->>+ P500: uses
    P500-->>- P0: return
    P0->>+ P1947: uses
    P1947-->>- P0: return
    P0->>+ P1948: uses
    P1948-->>- P0: return
    P0->>+ P1949: uses
    P1949-->>- P0: return
    P0->>+ P1950: uses
    P1950-->>- P0: return
    P0->>+ P1951: uses
    P1951-->>- P0: return
    P0->>+ P1952: uses
    P1952-->>- P0: return
    P0->>+ P1953: uses
    P1953-->>- P0: return
    P0->>+ P1954: uses
    P1954-->>- P0: return
    P0->>+ P1955: uses
    P1955-->>- P0: return
    P0->>+ P1956: uses
    P1956-->>- P0: return
    P0->>+ P1957: uses
    P1957-->>- P0: return
    P0->>+ P1958: uses
    P1958-->>- P0: return
    P0->>+ P1959: uses
    P1959-->>- P0: return
    P0->>+ P1960: uses
    P1960-->>- P0: return
    P0->>+ P1961: uses
    P1961-->>- P0: return
    P0->>+ P1962: uses
    P1962-->>- P0: return
    P0->>+ P1963: uses
    P1963-->>- P0: return
    P0->>+ P1964: uses
    P1964-->>- P0: return
    P0->>+ P1965: uses
    P1965-->>- P0: return
    P0->>+ P1966: uses
    P1966-->>- P0: return
    P0->>+ P1967: uses
    P1967-->>- P0: return
    P0->>+ P1968: uses
    P1968-->>- P0: return
    P0->>+ P1969: uses
    P1969-->>- P0: return
    P0->>+ P1970: uses
    P1970-->>- P0: return
    P0->>+ P1971: uses
    P1971-->>- P0: return
    P0->>+ P1972: uses
    P1972-->>- P0: return
    P0->>+ P1973: uses
    P1973-->>- P0: return
    P0->>+ P1974: uses
    P1974-->>- P0: return
    P0->>+ P1975: uses
    P1975-->>- P0: return
    P0->>+ P1976: uses
    P1976-->>- P0: return
    P0->>+ P501: uses
    P501-->>- P0: return
    P0->>+ P502: uses
    P502-->>- P0: return
    P0->>+ P503: uses
    P503-->>- P0: return
    P0->>+ P504: uses
    P504-->>- P0: return
    P0->>+ P1977: calls
    P1977-->>- P0: return
    P0->>+ P1978: uses
    P1978-->>- P0: return
    P0->>+ P1979: uses
    P1979-->>- P0: return
    P0->>+ P1980: uses
    P1980-->>- P0: return
    P0->>+ P1981: uses
    P1981-->>- P0: return
    P0->>+ P1982: uses
    P1982-->>- P0: return
    P0->>+ P1983: uses
    P1983-->>- P0: return
    P0->>+ P1984: uses
    P1984-->>- P0: return
    P0->>+ P1985: uses
    P1985-->>- P0: return
    P0->>+ P1986: uses
    P1986-->>- P0: return
    P0->>+ P1987: uses
    P1987-->>- P0: return
    P0->>+ P1988: uses
    P1988-->>- P0: return
    P0->>+ P1989: uses
    P1989-->>- P0: return
    P0->>+ P1990: uses
    P1990-->>- P0: return
    P0->>+ P1991: uses
    P1991-->>- P0: return
    P0->>+ P1992: uses
    P1992-->>- P0: return
    P0->>+ P1993: uses
    P1993-->>- P0: return
    P0->>+ P1994: uses
    P1994-->>- P0: return
    P0->>+ P505: uses
    P505-->>- P0: return
    P0->>+ P506: uses
    P506-->>- P0: return
    P0->>+ P1995: calls
    P1995-->>- P0: return
    P0->>+ P1996: calls
    P1996-->>- P0: return
    P0->>+ P507: uses
    P507-->>- P0: return
    P0->>+ P508: uses
    P508-->>- P0: return
    P0->>+ P1997: uses
    P1997-->>- P0: return
    P0->>+ P1998: uses
    P1998-->>- P0: return
    P0->>+ P1999: uses
    P1999-->>- P0: return
    P0->>+ P2000: uses
    P2000-->>- P0: return
    P0->>+ P2001: uses
    P2001-->>- P0: return
    P0->>+ P2002: uses
    P2002-->>- P0: return
    P0->>+ P2003: uses
    P2003-->>- P0: return
    P0->>+ P2004: uses
    P2004-->>- P0: return
    P0->>+ P2005: uses
    P2005-->>- P0: return
    P0->>+ P2006: uses
    P2006-->>- P0: return
    P0->>+ P2007: uses
    P2007-->>- P0: return
    P0->>+ P2008: uses
    P2008-->>- P0: return
    P0->>+ P2009: uses
    P2009-->>- P0: return
    P0->>+ P2010: uses
    P2010-->>- P0: return
    P0->>+ P2011: uses
    P2011-->>- P0: return
    P0->>+ P2012: uses
    P2012-->>- P0: return
    P0->>+ P2013: uses
    P2013-->>- P0: return
    P0->>+ P2014: uses
    P2014-->>- P0: return
    P0->>+ P2015: uses
    P2015-->>- P0: return
    P0->>+ P2016: uses
    P2016-->>- P0: return
    P0->>+ P2017: uses
    P2017-->>- P0: return
    P0->>+ P2018: uses
    P2018-->>- P0: return
    P0->>+ P2019: uses
    P2019-->>- P0: return
    P0->>+ P2020: uses
    P2020-->>- P0: return
    P0->>+ P2021: uses
    P2021-->>- P0: return
    P0->>+ P2022: uses
    P2022-->>- P0: return
    P0->>+ P2023: uses
    P2023-->>- P0: return
    P0->>+ P2024: uses
    P2024-->>- P0: return
    P0->>+ P2025: uses
    P2025-->>- P0: return
    P0->>+ P2026: uses
    P2026-->>- P0: return
    P0->>+ P2027: uses
    P2027-->>- P0: return
    P0->>+ P2028: uses
    P2028-->>- P0: return
    P0->>+ P2029: uses
    P2029-->>- P0: return
    P0->>+ P2030: uses
    P2030-->>- P0: return
    P0->>+ P2031: uses
    P2031-->>- P0: return
    P0->>+ P2032: uses
    P2032-->>- P0: return
    P0->>+ P2033: uses
    P2033-->>- P0: return
    P0->>+ P2034: uses
    P2034-->>- P0: return
    P0->>+ P2035: uses
    P2035-->>- P0: return
    P0->>+ P2036: uses
    P2036-->>- P0: return
    P0->>+ P2037: uses
    P2037-->>- P0: return
    P0->>+ P2038: uses
    P2038-->>- P0: return
    P0->>+ P2039: uses
    P2039-->>- P0: return
    P0->>+ P2040: uses
    P2040-->>- P0: return
    P0->>+ P2041: uses
    P2041-->>- P0: return
    P0->>+ P2042: uses
    P2042-->>- P0: return
    P0->>+ P2043: uses
    P2043-->>- P0: return
    P0->>+ P2044: uses
    P2044-->>- P0: return
    P0->>+ P2045: uses
    P2045-->>- P0: return
    P0->>+ P2046: uses
    P2046-->>- P0: return
    P0->>+ P2047: uses
    P2047-->>- P0: return
    P0->>+ P2048: uses
    P2048-->>- P0: return
    P0->>+ P2049: uses
    P2049-->>- P0: return
    P0->>+ P2050: uses
    P2050-->>- P0: return
    P0->>+ P2051: uses
    P2051-->>- P0: return
    P0->>+ P2052: uses
    P2052-->>- P0: return
    P0->>+ P2053: uses
    P2053-->>- P0: return
    P0->>+ P2054: uses
    P2054-->>- P0: return
    P0->>+ P2055: uses
    P2055-->>- P0: return
    P0->>+ P2056: uses
    P2056-->>- P0: return
    P0->>+ P2057: uses
    P2057-->>- P0: return
    P0->>+ P2058: uses
    P2058-->>- P0: return
    P0->>+ P2059: uses
    P2059-->>- P0: return
    P0->>+ P2060: uses
    P2060-->>- P0: return
    P0->>+ P2061: uses
    P2061-->>- P0: return
    P0->>+ P2062: uses
    P2062-->>- P0: return
    P0->>+ P2063: uses
    P2063-->>- P0: return
    P0->>+ P2064: uses
    P2064-->>- P0: return
    P0->>+ P2065: uses
    P2065-->>- P0: return
    P0->>+ P2066: uses
    P2066-->>- P0: return
    P0->>+ P2067: uses
    P2067-->>- P0: return
    P0->>+ P2068: uses
    P2068-->>- P0: return
    P0->>+ P2069: uses
    P2069-->>- P0: return
    P0->>+ P2070: uses
    P2070-->>- P0: return
    P0->>+ P2071: uses
    P2071-->>- P0: return
    P0->>+ P2072: uses
    P2072-->>- P0: return
    P0->>+ P2073: uses
    P2073-->>- P0: return
    P0->>+ P2074: uses
    P2074-->>- P0: return
    P0->>+ P2075: uses
    P2075-->>- P0: return
    P0->>+ P2076: uses
    P2076-->>- P0: return
    P0->>+ P2077: uses
    P2077-->>- P0: return
    P0->>+ P2078: uses
    P2078-->>- P0: return
    P0->>+ P2079: uses
    P2079-->>- P0: return
    P0->>+ P2080: uses
    P2080-->>- P0: return
    P0->>+ P2081: uses
    P2081-->>- P0: return
    P0->>+ P2082: uses
    P2082-->>- P0: return
    P0->>+ P2083: uses
    P2083-->>- P0: return
    P0->>+ P2084: uses
    P2084-->>- P0: return
    P0->>+ P2085: uses
    P2085-->>- P0: return
    P0->>+ P2086: uses
    P2086-->>- P0: return
    P0->>+ P2087: uses
    P2087-->>- P0: return
    P0->>+ P2088: uses
    P2088-->>- P0: return
    P0->>+ P2089: uses
    P2089-->>- P0: return
    P0->>+ P2090: uses
    P2090-->>- P0: return
    P0->>+ P2091: uses
    P2091-->>- P0: return
    P0->>+ P2092: uses
    P2092-->>- P0: return
    P0->>+ P2093: uses
    P2093-->>- P0: return
    P0->>+ P2094: uses
    P2094-->>- P0: return
    P0->>+ P2095: uses
    P2095-->>- P0: return
    P0->>+ P2096: uses
    P2096-->>- P0: return
    P0->>+ P2097: uses
    P2097-->>- P0: return
    P0->>+ P2098: uses
    P2098-->>- P0: return
    P0->>+ P2099: uses
    P2099-->>- P0: return
    P0->>+ P2100: uses
    P2100-->>- P0: return
    P0->>+ P2101: uses
    P2101-->>- P0: return
    P0->>+ P2102: uses
    P2102-->>- P0: return
    P0->>+ P2103: uses
    P2103-->>- P0: return
    P0->>+ P2104: uses
    P2104-->>- P0: return
    P0->>+ P2105: uses
    P2105-->>- P0: return
    P0->>+ P2106: uses
    P2106-->>- P0: return
    P0->>+ P2107: uses
    P2107-->>- P0: return
    P0->>+ P2108: uses
    P2108-->>- P0: return
    P0->>+ P2109: uses
    P2109-->>- P0: return
    P0->>+ P2110: uses
    P2110-->>- P0: return
    P0->>+ P2111: uses
    P2111-->>- P0: return
    P0->>+ P2112: uses
    P2112-->>- P0: return
    P0->>+ P2113: uses
    P2113-->>- P0: return
    P0->>+ P2114: uses
    P2114-->>- P0: return
    P0->>+ P2115: uses
    P2115-->>- P0: return
    P0->>+ P2116: uses
    P2116-->>- P0: return
    P0->>+ P2117: uses
    P2117-->>- P0: return
    P0->>+ P2118: uses
    P2118-->>- P0: return
    P0->>+ P2119: uses
    P2119-->>- P0: return
    P0->>+ P2120: uses
    P2120-->>- P0: return
    P0->>+ P2121: uses
    P2121-->>- P0: return
    P0->>+ P2122: uses
    P2122-->>- P0: return
    P0->>+ P2123: uses
    P2123-->>- P0: return
    P0->>+ P2124: uses
    P2124-->>- P0: return
    P0->>+ P2125: uses
    P2125-->>- P0: return
    P0->>+ P2126: uses
    P2126-->>- P0: return
    P0->>+ P2127: uses
    P2127-->>- P0: return
    P0->>+ P2128: uses
    P2128-->>- P0: return
    P0->>+ P2129: uses
    P2129-->>- P0: return
    P0->>+ P2130: uses
    P2130-->>- P0: return
    P0->>+ P2131: uses
    P2131-->>- P0: return
    P0->>+ P2132: uses
    P2132-->>- P0: return
    P0->>+ P2133: uses
    P2133-->>- P0: return
    P0->>+ P2134: uses
    P2134-->>- P0: return
    P0->>+ P2135: uses
    P2135-->>- P0: return
    P0->>+ P2136: uses
    P2136-->>- P0: return
    P0->>+ P2137: uses
    P2137-->>- P0: return
    P0->>+ P2138: uses
    P2138-->>- P0: return
    P0->>+ P2139: uses
    P2139-->>- P0: return
    P0->>+ P2140: uses
    P2140-->>- P0: return
    P0->>+ P2141: uses
    P2141-->>- P0: return
    P0->>+ P2142: uses
    P2142-->>- P0: return
    P0->>+ P2143: uses
    P2143-->>- P0: return
    P0->>+ P2144: uses
    P2144-->>- P0: return
    P0->>+ P2145: uses
    P2145-->>- P0: return
    P0->>+ P2146: uses
    P2146-->>- P0: return
    P0->>+ P2147: uses
    P2147-->>- P0: return
    P0->>+ P2148: uses
    P2148-->>- P0: return
    P0->>+ P2149: uses
    P2149-->>- P0: return
    P0->>+ P2150: uses
    P2150-->>- P0: return
    P0->>+ P2151: uses
    P2151-->>- P0: return
    P0->>+ P2152: uses
    P2152-->>- P0: return
    P0->>+ P2153: uses
    P2153-->>- P0: return
    P0->>+ P2154: uses
    P2154-->>- P0: return
    P0->>+ P2155: uses
    P2155-->>- P0: return
    P0->>+ P2156: uses
    P2156-->>- P0: return
    P0->>+ P2157: uses
    P2157-->>- P0: return
    P0->>+ P2158: uses
    P2158-->>- P0: return
    P0->>+ P2159: uses
    P2159-->>- P0: return
    P0->>+ P2160: uses
    P2160-->>- P0: return
    P0->>+ P2161: uses
    P2161-->>- P0: return
    P0->>+ P2162: uses
    P2162-->>- P0: return
    P0->>+ P2163: uses
    P2163-->>- P0: return
    P0->>+ P2164: uses
    P2164-->>- P0: return
    P0->>+ P2165: uses
    P2165-->>- P0: return
    P0->>+ P2166: uses
    P2166-->>- P0: return
    P0->>+ P2167: uses
    P2167-->>- P0: return
    P0->>+ P2168: uses
    P2168-->>- P0: return
    P0->>+ P2169: uses
    P2169-->>- P0: return
    P0->>+ P2170: uses
    P2170-->>- P0: return
    P0->>+ P2171: uses
    P2171-->>- P0: return
    P0->>+ P2172: uses
    P2172-->>- P0: return
    P0->>+ P2173: uses
    P2173-->>- P0: return
    P0->>+ P2174: uses
    P2174-->>- P0: return
    P0->>+ P2175: uses
    P2175-->>- P0: return
    P0->>+ P2176: uses
    P2176-->>- P0: return
    P0->>+ P2177: uses
    P2177-->>- P0: return
    P0->>+ P2178: uses
    P2178-->>- P0: return
    P0->>+ P2179: uses
    P2179-->>- P0: return
    P0->>+ P2180: uses
    P2180-->>- P0: return
    P0->>+ P2181: uses
    P2181-->>- P0: return
    P0->>+ P2182: uses
    P2182-->>- P0: return
    P0->>+ P2183: uses
    P2183-->>- P0: return
    P0->>+ P2184: uses
    P2184-->>- P0: return
    P0->>+ P2185: uses
    P2185-->>- P0: return
    P0->>+ P2186: uses
    P2186-->>- P0: return
    P0->>+ P2187: uses
    P2187-->>- P0: return
    P0->>+ P2188: uses
    P2188-->>- P0: return
    P0->>+ P2189: uses
    P2189-->>- P0: return
    P0->>+ P2190: uses
    P2190-->>- P0: return
    P0->>+ P2191: uses
    P2191-->>- P0: return
    P0->>+ P2192: uses
    P2192-->>- P0: return
    P0->>+ P2193: uses
    P2193-->>- P0: return
    P0->>+ P2194: uses
    P2194-->>- P0: return
    P0->>+ P2195: uses
    P2195-->>- P0: return
    P0->>+ P2196: uses
    P2196-->>- P0: return
    P0->>+ P2197: uses
    P2197-->>- P0: return
    P0->>+ P2198: uses
    P2198-->>- P0: return
    P0->>+ P2199: uses
    P2199-->>- P0: return
    P0->>+ P2200: uses
    P2200-->>- P0: return
    P0->>+ P2201: uses
    P2201-->>- P0: return
    P0->>+ P2202: uses
    P2202-->>- P0: return
    P0->>+ P2203: uses
    P2203-->>- P0: return
    P0->>+ P2204: uses
    P2204-->>- P0: return
    P0->>+ P2205: uses
    P2205-->>- P0: return
    P0->>+ P2206: uses
    P2206-->>- P0: return
    P0->>+ P2207: uses
    P2207-->>- P0: return
    P0->>+ P2208: uses
    P2208-->>- P0: return
    P0->>+ P2209: uses
    P2209-->>- P0: return
    P0->>+ P2210: uses
    P2210-->>- P0: return
    P0->>+ P2211: uses
    P2211-->>- P0: return
    P0->>+ P2212: uses
    P2212-->>- P0: return
    P0->>+ P2213: uses
    P2213-->>- P0: return
    P0->>+ P2214: uses
    P2214-->>- P0: return
    P0->>+ P2215: uses
    P2215-->>- P0: return
    P0->>+ P2216: uses
    P2216-->>- P0: return
    P0->>+ P2217: uses
    P2217-->>- P0: return
    P0->>+ P2218: uses
    P2218-->>- P0: return
    P0->>+ P2219: uses
    P2219-->>- P0: return
    P0->>+ P2220: uses
    P2220-->>- P0: return
    P0->>+ P2221: uses
    P2221-->>- P0: return
    P0->>+ P2222: uses
    P2222-->>- P0: return
    P0->>+ P2223: uses
    P2223-->>- P0: return
    P0->>+ P2224: uses
    P2224-->>- P0: return
    P0->>+ P2225: uses
    P2225-->>- P0: return
    P0->>+ P2226: uses
    P2226-->>- P0: return
    P0->>+ P2227: uses
    P2227-->>- P0: return
    P0->>+ P2228: uses
    P2228-->>- P0: return
    P0->>+ P2229: uses
    P2229-->>- P0: return
    P0->>+ P2230: uses
    P2230-->>- P0: return
    P0->>+ P2231: uses
    P2231-->>- P0: return
    P0->>+ P2232: uses
    P2232-->>- P0: return
    P0->>+ P2233: uses
    P2233-->>- P0: return
    P0->>+ P2234: uses
    P2234-->>- P0: return
    P0->>+ P2235: uses
    P2235-->>- P0: return
    P0->>+ P2236: uses
    P2236-->>- P0: return
    P0->>+ P2237: uses
    P2237-->>- P0: return
    P0->>+ P2238: uses
    P2238-->>- P0: return
    P0->>+ P2239: uses
    P2239-->>- P0: return
    P0->>+ P2240: uses
    P2240-->>- P0: return
    P0->>+ P2241: uses
    P2241-->>- P0: return
    P0->>+ P2242: uses
    P2242-->>- P0: return
    P0->>+ P2243: uses
    P2243-->>- P0: return
    P0->>+ P2244: uses
    P2244-->>- P0: return
    P0->>+ P2245: uses
    P2245-->>- P0: return
    P0->>+ P2246: uses
    P2246-->>- P0: return
    P0->>+ P2247: uses
    P2247-->>- P0: return
    P0->>+ P2248: uses
    P2248-->>- P0: return
    P0->>+ P2249: uses
    P2249-->>- P0: return
    P0->>+ P2250: uses
    P2250-->>- P0: return
    P0->>+ P2251: uses
    P2251-->>- P0: return
    P0->>+ P2252: uses
    P2252-->>- P0: return
    P0->>+ P2253: uses
    P2253-->>- P0: return
    P0->>+ P2254: uses
    P2254-->>- P0: return
    P0->>+ P2255: uses
    P2255-->>- P0: return
    P0->>+ P2256: uses
    P2256-->>- P0: return
    P0->>+ P2257: uses
    P2257-->>- P0: return
    P0->>+ P2258: uses
    P2258-->>- P0: return
    P0->>+ P2259: uses
    P2259-->>- P0: return
    P0->>+ P2260: uses
    P2260-->>- P0: return
    P0->>+ P2261: uses
    P2261-->>- P0: return
    P0->>+ P2262: uses
    P2262-->>- P0: return
    P0->>+ P2263: uses
    P2263-->>- P0: return
    P0->>+ P2264: uses
    P2264-->>- P0: return
    P0->>+ P2265: uses
    P2265-->>- P0: return
    P0->>+ P2266: uses
    P2266-->>- P0: return
    P0->>+ P509: uses
    P509-->>- P0: return
    P0->>+ P510: uses
    P510-->>- P0: return
    P0->>+ P511: uses
    P511-->>- P0: return
    P0->>+ P2267: calls
    P2267-->>- P0: return
    P0->>+ P2268: uses
    P2268-->>- P0: return
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
    P0->>+ P2269: uses
    P2269-->>- P0: return
    P0->>+ P2270: uses
    P2270-->>- P0: return
    P0->>+ P2271: uses
    P2271-->>- P0: return
    P0->>+ P2272: uses
    P2272-->>- P0: return
    P0->>+ P2273: uses
    P2273-->>- P0: return
    P0->>+ P2274: uses
    P2274-->>- P0: return
    P0->>+ P2275: uses
    P2275-->>- P0: return
    P0->>+ P2276: uses
    P2276-->>- P0: return
    P0->>+ P2277: uses
    P2277-->>- P0: return
    P0->>+ P2278: uses
    P2278-->>- P0: return
    P0->>+ P2279: uses
    P2279-->>- P0: return
    P0->>+ P2280: uses
    P2280-->>- P0: return
    P0->>+ P2281: uses
    P2281-->>- P0: return
    P0->>+ P2282: uses
    P2282-->>- P0: return
    P0->>+ P2283: uses
    P2283-->>- P0: return
    P0->>+ P2284: uses
    P2284-->>- P0: return
    P0->>+ P2285: uses
    P2285-->>- P0: return
    P0->>+ P2286: uses
    P2286-->>- P0: return
    P0->>+ P2287: uses
    P2287-->>- P0: return
    P0->>+ P2288: uses
    P2288-->>- P0: return
    P0->>+ P2289: uses
    P2289-->>- P0: return
    P0->>+ P2290: uses
    P2290-->>- P0: return
    P0->>+ P2291: uses
    P2291-->>- P0: return
    P0->>+ P2292: uses
    P2292-->>- P0: return
    P0->>+ P2293: uses
    P2293-->>- P0: return
    P0->>+ P2294: uses
    P2294-->>- P0: return
    P0->>+ P2295: uses
    P2295-->>- P0: return
    P0->>+ P2296: uses
    P2296-->>- P0: return
    P0->>+ P2297: uses
    P2297-->>- P0: return
    P0->>+ P2298: uses
    P2298-->>- P0: return
    P0->>+ P2299: uses
    P2299-->>- P0: return
    P0->>+ P2300: uses
    P2300-->>- P0: return
    P0->>+ P2301: uses
    P2301-->>- P0: return
    P0->>+ P2302: uses
    P2302-->>- P0: return
    P0->>+ P2303: uses
    P2303-->>- P0: return
    P0->>+ P2304: uses
    P2304-->>- P0: return
    P0->>+ P2305: uses
    P2305-->>- P0: return
    P0->>+ P2306: uses
    P2306-->>- P0: return
    P0->>+ P2307: uses
    P2307-->>- P0: return
    P0->>+ P2308: uses
    P2308-->>- P0: return
    P0->>+ P2309: uses
    P2309-->>- P0: return
    P0->>+ P2310: uses
    P2310-->>- P0: return
    P0->>+ P2311: uses
    P2311-->>- P0: return
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
    P0->>+ P2312: calls
    P2312-->>- P0: return
    P0->>+ P2313: calls
    P2313-->>- P0: return
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
    P0->>+ P2314: calls
    P2314-->>- P0: return
    P0->>+ P591: uses
    P591-->>- P0: return
    P0->>+ P2315: uses
    P2315-->>- P0: return
    P0->>+ P2316: calls
    P2316-->>- P0: return
    P0->>+ P592: uses
    P592-->>- P0: return
    P0->>+ P593: uses
    P593-->>- P0: return
    P0->>+ P594: uses
    P594-->>- P0: return
    P0->>+ P2317: uses
    P2317-->>- P0: return
    P0->>+ P2318: uses
    P2318-->>- P0: return
    P0->>+ P2319: uses
    P2319-->>- P0: return
    P0->>+ P2320: uses
    P2320-->>- P0: return
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
    P0->>+ P2321: uses
    P2321-->>- P0: return
    P0->>+ P627: uses
    P627-->>- P0: return
    P0->>+ P628: uses
    P628-->>- P0: return
    P0->>+ P629: uses
    P629-->>- P0: return
    P0->>+ P630: uses
    P630-->>- P0: return
    P0->>+ P2322: uses
    P2322-->>- P0: return
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
    P0->>+ P759: uses
    P759-->>- P0: return
    P0->>+ P760: uses
    P760-->>- P0: return
    P0->>+ P761: uses
    P761-->>- P0: return
    P0->>+ P762: uses
    P762-->>- P0: return
    P0->>+ P763: uses
    P763-->>- P0: return
    P0->>+ P764: uses
    P764-->>- P0: return
    P0->>+ P765: uses
    P765-->>- P0: return
    P0->>+ P766: uses
    P766-->>- P0: return
    P0->>+ P767: uses
    P767-->>- P0: return
    P0->>+ P768: uses
    P768-->>- P0: return
    P0->>+ P769: uses
    P769-->>- P0: return
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
    P0->>+ P777: uses
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
    P0->>+ P2323: calls
    P2323-->>- P0: return
    P0->>+ P2324: calls
    P2324-->>- P0: return
    P0->>+ P838: uses
    P838-->>- P0: return
    P0->>+ P839: uses
    P839-->>- P0: return
    P0->>+ P2325: uses
    P2325-->>- P0: return
    P0->>+ P2326: uses
    P2326-->>- P0: return
    P0->>+ P2327: uses
    P2327-->>- P0: return
    P0->>+ P2328: uses
    P2328-->>- P0: return
    P0->>+ P2329: uses
    P2329-->>- P0: return
    P0->>+ P2330: uses
    P2330-->>- P0: return
    P0->>+ P2331: uses
    P2331-->>- P0: return
    P0->>+ P2332: uses
    P2332-->>- P0: return
    P0->>+ P2333: uses
    P2333-->>- P0: return
    P0->>+ P2334: uses
    P2334-->>- P0: return
    P0->>+ P2335: uses
    P2335-->>- P0: return
    P0->>+ P2336: uses
    P2336-->>- P0: return
    P0->>+ P2337: uses
    P2337-->>- P0: return
    P0->>+ P2338: uses
    P2338-->>- P0: return
    P0->>+ P2339: uses
    P2339-->>- P0: return
    P0->>+ P2340: uses
    P2340-->>- P0: return
    P0->>+ P2341: uses
    P2341-->>- P0: return
    P0->>+ P2342: uses
    P2342-->>- P0: return
    P0->>+ P2343: uses
    P2343-->>- P0: return
    P0->>+ P2344: uses
    P2344-->>- P0: return
    P0->>+ P2345: uses
    P2345-->>- P0: return
    P0->>+ P2346: uses
    P2346-->>- P0: return
    P0->>+ P2347: uses
    P2347-->>- P0: return
    P0->>+ P2348: uses
    P2348-->>- P0: return
    P0->>+ P2349: uses
    P2349-->>- P0: return
    P0->>+ P2350: uses
    P2350-->>- P0: return
    P0->>+ P2351: uses
    P2351-->>- P0: return
    P0->>+ P2352: uses
    P2352-->>- P0: return
    P0->>+ P2353: uses
    P2353-->>- P0: return
    P0->>+ P2354: uses
    P2354-->>- P0: return
    P0->>+ P2355: uses
    P2355-->>- P0: return
    P0->>+ P2356: uses
    P2356-->>- P0: return
    P0->>+ P2357: uses
    P2357-->>- P0: return
    P0->>+ P2358: uses
    P2358-->>- P0: return
    P0->>+ P2359: uses
    P2359-->>- P0: return
    P0->>+ P2360: uses
    P2360-->>- P0: return
    P0->>+ P2361: uses
    P2361-->>- P0: return
    P0->>+ P2362: uses
    P2362-->>- P0: return
    P0->>+ P2363: uses
    P2363-->>- P0: return
    P0->>+ P2364: uses
    P2364-->>- P0: return
    P0->>+ P2365: uses
    P2365-->>- P0: return
    P0->>+ P2366: uses
    P2366-->>- P0: return
    P0->>+ P2367: uses
    P2367-->>- P0: return
    P0->>+ P2368: uses
    P2368-->>- P0: return
    P0->>+ P2369: uses
    P2369-->>- P0: return
    P0->>+ P2370: uses
    P2370-->>- P0: return
    P0->>+ P2371: uses
    P2371-->>- P0: return
    P0->>+ P2372: uses
    P2372-->>- P0: return
    P0->>+ P2373: uses
    P2373-->>- P0: return
    P0->>+ P2374: uses
    P2374-->>- P0: return
    P0->>+ P2375: uses
    P2375-->>- P0: return
    P0->>+ P2376: uses
    P2376-->>- P0: return
    P0->>+ P2377: uses
    P2377-->>- P0: return
    P0->>+ P2378: uses
    P2378-->>- P0: return
    P0->>+ P2379: uses
    P2379-->>- P0: return
    P0->>+ P2380: uses
    P2380-->>- P0: return
    P0->>+ P2381: uses
    P2381-->>- P0: return
    P0->>+ P2382: uses
    P2382-->>- P0: return
    P0->>+ P2383: uses
    P2383-->>- P0: return
    P0->>+ P2384: uses
    P2384-->>- P0: return
    P0->>+ P2385: uses
    P2385-->>- P0: return
    P0->>+ P2386: uses
    P2386-->>- P0: return
    P0->>+ P2387: uses
    P2387-->>- P0: return
    P0->>+ P2388: uses
    P2388-->>- P0: return
    P0->>+ P2389: uses
    P2389-->>- P0: return
    P0->>+ P2390: uses
    P2390-->>- P0: return
    P0->>+ P2391: uses
    P2391-->>- P0: return
    P0->>+ P2392: uses
    P2392-->>- P0: return
    P0->>+ P2393: uses
    P2393-->>- P0: return
    P0->>+ P2394: uses
    P2394-->>- P0: return
    P0->>+ P2395: uses
    P2395-->>- P0: return
    P0->>+ P2396: uses
    P2396-->>- P0: return
    P0->>+ P2397: uses
    P2397-->>- P0: return
    P0->>+ P2398: calls
    P2398-->>- P0: return
    P0->>+ P2399: calls
    P2399-->>- P0: return
    P0->>+ P2400: uses
    P2400-->>- P0: return
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
    P0->>+ P849: uses
    P849-->>- P0: return
    P0->>+ P850: uses
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
    P0->>+ P2401: uses
    P2401-->>- P0: return
    P0->>+ P2402: uses
    P2402-->>- P0: return
    P0->>+ P2403: uses
    P2403-->>- P0: return
    P0->>+ P2404: uses
    P2404-->>- P0: return
    P0->>+ P2405: uses
    P2405-->>- P0: return
    P0->>+ P2406: uses
    P2406-->>- P0: return
    P0->>+ P2407: uses
    P2407-->>- P0: return
    P0->>+ P2408: uses
    P2408-->>- P0: return
    P0->>+ P2409: uses
    P2409-->>- P0: return
    P0->>+ P2410: uses
    P2410-->>- P0: return
    P0->>+ P2411: uses
    P2411-->>- P0: return
    P0->>+ P2412: uses
    P2412-->>- P0: return
    P0->>+ P2413: uses
    P2413-->>- P0: return
    P0->>+ P2414: uses
    P2414-->>- P0: return
    P0->>+ P2415: uses
    P2415-->>- P0: return
    P0->>+ P2416: uses
    P2416-->>- P0: return
    P0->>+ P2417: uses
    P2417-->>- P0: return
    P0->>+ P2418: uses
    P2418-->>- P0: return
    P0->>+ P2419: uses
    P2419-->>- P0: return
    P0->>+ P2420: uses
    P2420-->>- P0: return
    P0->>+ P2421: uses
    P2421-->>- P0: return
    P0->>+ P2422: uses
    P2422-->>- P0: return
    P0->>+ P2423: uses
    P2423-->>- P0: return
    P0->>+ P2424: uses
    P2424-->>- P0: return
    P0->>+ P2425: uses
    P2425-->>- P0: return
    P0->>+ P2426: uses
    P2426-->>- P0: return
    P0->>+ P2427: uses
    P2427-->>- P0: return
    P0->>+ P2428: uses
    P2428-->>- P0: return
    P0->>+ P2429: uses
    P2429-->>- P0: return
    P0->>+ P2430: uses
    P2430-->>- P0: return
    P0->>+ P2431: uses
    P2431-->>- P0: return
    P0->>+ P2432: uses
    P2432-->>- P0: return
    P0->>+ P2433: uses
    P2433-->>- P0: return
    P0->>+ P2434: uses
    P2434-->>- P0: return
    P0->>+ P2435: uses
    P2435-->>- P0: return
    P0->>+ P865: uses
    P865-->>- P0: return
    P0->>+ P2436: calls
    P2436-->>- P0: return
    P0->>+ P2437: calls
    P2437-->>- P0: return
    P0->>+ P2438: calls
    P2438-->>- P0: return
    P0->>+ P2439: uses
    P2439-->>- P0: return
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
    P0->>+ P2440: uses
    P2440-->>- P0: return
    P0->>+ P918: uses
    P918-->>- P0: return
    P0->>+ P919: uses
    P919-->>- P0: return
    P0->>+ P920: uses
    P920-->>- P0: return
    P0->>+ P2441: calls
    P2441-->>- P0: return
    P0->>+ P2442: uses
    P2442-->>- P0: return
    P0->>+ P2443: uses
    P2443-->>- P0: return
    P0->>+ P2444: uses
    P2444-->>- P0: return
    P0->>+ P2445: uses
    P2445-->>- P0: return
    P0->>+ P2446: uses
    P2446-->>- P0: return
    P0->>+ P2447: uses
    P2447-->>- P0: return
    P0->>+ P2448: uses
    P2448-->>- P0: return
    P0->>+ P2449: uses
    P2449-->>- P0: return
    P0->>+ P2450: uses
    P2450-->>- P0: return
    P0->>+ P921: uses
    P921-->>- P0: return
    P0->>+ P2451: uses
    P2451-->>- P0: return
    P0->>+ P922: uses
    P922-->>- P0: return
    P0->>+ P923: uses
    P923-->>- P0: return
    P0->>+ P2452: calls
    P2452-->>- P0: return
    P0->>+ P2453: calls
    P2453-->>- P0: return
    P0->>+ P2454: calls
    P2454-->>- P0: return
    P0->>+ P2455: uses
    P2455-->>- P0: return
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
    P0->>+ P2456: uses
    P2456-->>- P0: return
    P0->>+ P2457: uses
    P2457-->>- P0: return
    P0->>+ P2458: uses
    P2458-->>- P0: return
    P0->>+ P2459: uses
    P2459-->>- P0: return
    P0->>+ P2460: uses
    P2460-->>- P0: return
    P0->>+ P2461: uses
    P2461-->>- P0: return
    P0->>+ P2462: uses
    P2462-->>- P0: return
    P0->>+ P2463: uses
    P2463-->>- P0: return
    P0->>+ P2464: uses
    P2464-->>- P0: return
    P0->>+ P2465: uses
    P2465-->>- P0: return
    P0->>+ P2466: uses
    P2466-->>- P0: return
    P0->>+ P2467: uses
    P2467-->>- P0: return
    P0->>+ P2468: uses
    P2468-->>- P0: return
    P0->>+ P2469: uses
    P2469-->>- P0: return
    P0->>+ P2470: uses
    P2470-->>- P0: return
    P0->>+ P2471: uses
    P2471-->>- P0: return
    P0->>+ P2472: uses
    P2472-->>- P0: return
    P0->>+ P2473: uses
    P2473-->>- P0: return
    P0->>+ P2474: uses
    P2474-->>- P0: return
    P0->>+ P2475: uses
    P2475-->>- P0: return
    P0->>+ P2476: uses
    P2476-->>- P0: return
    P0->>+ P2477: uses
    P2477-->>- P0: return
    P0->>+ P2478: uses
    P2478-->>- P0: return
    P0->>+ P2479: uses
    P2479-->>- P0: return
    P0->>+ P2480: uses
    P2480-->>- P0: return
    P0->>+ P2481: uses
    P2481-->>- P0: return
    P0->>+ P2482: uses
    P2482-->>- P0: return
    P0->>+ P2483: uses
    P2483-->>- P0: return
    P0->>+ P2484: uses
    P2484-->>- P0: return
    P0->>+ P2485: uses
    P2485-->>- P0: return
    P0->>+ P2486: uses
    P2486-->>- P0: return
    P0->>+ P2487: uses
    P2487-->>- P0: return
    P0->>+ P2488: uses
    P2488-->>- P0: return
    P0->>+ P2489: uses
    P2489-->>- P0: return
    P0->>+ P2490: uses
    P2490-->>- P0: return
    P0->>+ P2491: uses
    P2491-->>- P0: return
    P0->>+ P2492: uses
    P2492-->>- P0: return
    P0->>+ P2493: uses
    P2493-->>- P0: return
    P0->>+ P2494: uses
    P2494-->>- P0: return
    P0->>+ P2495: uses
    P2495-->>- P0: return
    P0->>+ P2496: uses
    P2496-->>- P0: return
    P0->>+ P2497: uses
    P2497-->>- P0: return
    P0->>+ P2498: uses
    P2498-->>- P0: return
    P0->>+ P2499: uses
    P2499-->>- P0: return
    P0->>+ P2500: uses
    P2500-->>- P0: return
    P0->>+ P2501: uses
    P2501-->>- P0: return
    P0->>+ P2502: calls
    P2502-->>- P0: return
    P0->>+ P2503: calls
    P2503-->>- P0: return
    P0->>+ P2504: calls
    P2504-->>- P0: return
    P0->>+ P2505: calls
    P2505-->>- P0: return
    P0->>+ P2506: calls
    P2506-->>- P0: return
    P0->>+ P2507: calls
    P2507-->>- P0: return
    P0->>+ P2508: calls
    P2508-->>- P0: return
    P0->>+ P2509: calls
    P2509-->>- P0: return
    P0->>+ P2510: uses
    P2510-->>- P0: return
    P0->>+ P2511: uses
    P2511-->>- P0: return
    P0->>+ P2512: uses
    P2512-->>- P0: return
    P0->>+ P2513: uses
    P2513-->>- P0: return
    P0->>+ P2514: uses
    P2514-->>- P0: return
    P0->>+ P2515: uses
    P2515-->>- P0: return
    P0->>+ P2516: uses
    P2516-->>- P0: return
    P0->>+ P2517: uses
    P2517-->>- P0: return
    P0->>+ P2518: uses
    P2518-->>- P0: return
    P0->>+ P2519: uses
    P2519-->>- P0: return
    P0->>+ P2520: uses
    P2520-->>- P0: return
    P0->>+ P2521: uses
    P2521-->>- P0: return
    P0->>+ P2522: uses
    P2522-->>- P0: return
    P0->>+ P2523: uses
    P2523-->>- P0: return
    P0->>+ P2524: uses
    P2524-->>- P0: return
    P0->>+ P2525: uses
    P2525-->>- P0: return
    P0->>+ P2526: uses
    P2526-->>- P0: return
    P0->>+ P2527: uses
    P2527-->>- P0: return
    P0->>+ P2528: uses
    P2528-->>- P0: return
    P0->>+ P2529: uses
    P2529-->>- P0: return
    P0->>+ P2530: uses
    P2530-->>- P0: return
    P0->>+ P2531: uses
    P2531-->>- P0: return
    P0->>+ P2532: uses
    P2532-->>- P0: return
    P0->>+ P2533: uses
    P2533-->>- P0: return
    P0->>+ P2534: uses
    P2534-->>- P0: return
    P0->>+ P2535: uses
    P2535-->>- P0: return
    P0->>+ P2536: uses
    P2536-->>- P0: return
    P0->>+ P2537: uses
    P2537-->>- P0: return
    P0->>+ P2538: uses
    P2538-->>- P0: return
    P0->>+ P2539: uses
    P2539-->>- P0: return
    P0->>+ P2540: uses
    P2540-->>- P0: return
    P0->>+ P2541: uses
    P2541-->>- P0: return
    P0->>+ P2542: uses
    P2542-->>- P0: return
    P0->>+ P2543: uses
    P2543-->>- P0: return
    P0->>+ P2544: uses
    P2544-->>- P0: return
    P0->>+ P2545: uses
    P2545-->>- P0: return
    P0->>+ P2546: uses
    P2546-->>- P0: return
    P0->>+ P2547: uses
    P2547-->>- P0: return
    P0->>+ P2548: uses
    P2548-->>- P0: return
    P0->>+ P2549: uses
    P2549-->>- P0: return
    P0->>+ P2550: uses
    P2550-->>- P0: return
    P0->>+ P2551: uses
    P2551-->>- P0: return
    P0->>+ P2552: uses
    P2552-->>- P0: return
    P0->>+ P2553: uses
    P2553-->>- P0: return
    P0->>+ P2554: uses
    P2554-->>- P0: return
    P0->>+ P2555: uses
    P2555-->>- P0: return
    P0->>+ P2556: uses
    P2556-->>- P0: return
    P0->>+ P2557: uses
    P2557-->>- P0: return
    P0->>+ P2558: uses
    P2558-->>- P0: return
    P0->>+ P2559: uses
    P2559-->>- P0: return
    P0->>+ P2560: uses
    P2560-->>- P0: return
    P0->>+ P2561: uses
    P2561-->>- P0: return
    P0->>+ P2562: uses
    P2562-->>- P0: return
    P0->>+ P2563: uses
    P2563-->>- P0: return
    P0->>+ P2564: uses
    P2564-->>- P0: return
    P0->>+ P2565: uses
    P2565-->>- P0: return
    P0->>+ P2566: uses
    P2566-->>- P0: return
    P0->>+ P2567: uses
    P2567-->>- P0: return
    P0->>+ P2568: uses
    P2568-->>- P0: return
    P0->>+ P2569: uses
    P2569-->>- P0: return
    P0->>+ P2570: uses
    P2570-->>- P0: return
    P0->>+ P2571: uses
    P2571-->>- P0: return
    P0->>+ P2572: uses
    P2572-->>- P0: return
    P0->>+ P2573: uses
    P2573-->>- P0: return
    P0->>+ P2574: uses
    P2574-->>- P0: return
    P0->>+ P2575: uses
    P2575-->>- P0: return
    P0->>+ P2576: uses
    P2576-->>- P0: return
    P0->>+ P2577: uses
    P2577-->>- P0: return
    P0->>+ P2578: uses
    P2578-->>- P0: return
    P0->>+ P2579: uses
    P2579-->>- P0: return
    P0->>+ P2580: uses
    P2580-->>- P0: return
    P0->>+ P2581: uses
    P2581-->>- P0: return
    P0->>+ P2582: uses
    P2582-->>- P0: return
    P0->>+ P2583: uses
    P2583-->>- P0: return
    P0->>+ P2584: uses
    P2584-->>- P0: return
    P0->>+ P2585: uses
    P2585-->>- P0: return
    P0->>+ P2586: uses
    P2586-->>- P0: return
    P0->>+ P2587: uses
    P2587-->>- P0: return
    P0->>+ P2588: uses
    P2588-->>- P0: return
    P0->>+ P2589: uses
    P2589-->>- P0: return
    P0->>+ P2590: uses
    P2590-->>- P0: return
    P0->>+ P2591: uses
    P2591-->>- P0: return
    P0->>+ P2592: uses
    P2592-->>- P0: return
    P0->>+ P948: uses
    P948-->>- P0: return
    P0->>+ P949: uses
    P949-->>- P0: return
    P0->>+ P950: uses
    P950-->>- P0: return
    P0->>+ P951: uses
    P951-->>- P0: return
    P0->>+ P2593: uses
    P2593-->>- P0: return
    P0->>+ P2594: calls
    P2594-->>- P0: return
    P0->>+ P2595: calls
    P2595-->>- P0: return
    P0->>+ P2596: calls
    P2596-->>- P0: return
    P0->>+ P2597: calls
    P2597-->>- P0: return
    P0->>+ P2598: calls
    P2598-->>- P0: return
    P0->>+ P2599: calls
    P2599-->>- P0: return
    P0->>+ P2600: calls
    P2600-->>- P0: return
    P0->>+ P2601: uses
    P2601-->>- P0: return
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
    P0->>+ P2602: uses
    P2602-->>- P0: return
    P0->>+ P2603: uses
    P2603-->>- P0: return
    P0->>+ P974: uses
    P974-->>- P0: return
    P0->>+ P2604: calls
    P2604-->>- P0: return
    P0->>+ P2605: calls
    P2605-->>- P0: return
    P0->>+ P2606: calls
    P2606-->>- P0: return
    P0->>+ P2607: calls
    P2607-->>- P0: return
    P0->>+ P2608: calls
    P2608-->>- P0: return
    P0->>+ P2609: calls
    P2609-->>- P0: return
    P0->>+ P2610: calls
    P2610-->>- P0: return
    P0->>+ P2611: calls
    P2611-->>- P0: return
    P0->>+ P2612: calls
    P2612-->>- P0: return
    P0->>+ P2613: calls
    P2613-->>- P0: return
    P0->>+ P2614: calls
    P2614-->>- P0: return
    P0->>+ P2615: uses
    P2615-->>- P0: return
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
    P0->>+ P987: uses
    P987-->>- P0: return
    P0->>+ P988: uses
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
    P0->>+ P2616: uses
    P2616-->>- P0: return
    P0->>+ P2617: uses
    P2617-->>- P0: return
    P0->>+ P2618: uses
    P2618-->>- P0: return
    P0->>+ P2619: uses
    P2619-->>- P0: return
    P0->>+ P2620: uses
    P2620-->>- P0: return
    P0->>+ P2621: uses
    P2621-->>- P0: return
    P0->>+ P2622: uses
    P2622-->>- P0: return
    P0->>+ P2623: uses
    P2623-->>- P0: return
    P0->>+ P2624: uses
    P2624-->>- P0: return
    P0->>+ P2625: uses
    P2625-->>- P0: return
    P0->>+ P2626: uses
    P2626-->>- P0: return
    P0->>+ P2627: uses
    P2627-->>- P0: return
    P0->>+ P2628: uses
    P2628-->>- P0: return
    P0->>+ P2629: uses
    P2629-->>- P0: return
    P0->>+ P2630: uses
    P2630-->>- P0: return
    P0->>+ P2631: uses
    P2631-->>- P0: return
    P0->>+ P2632: uses
    P2632-->>- P0: return
    P0->>+ P2633: uses
    P2633-->>- P0: return
    P0->>+ P2634: uses
    P2634-->>- P0: return
    P0->>+ P2635: uses
    P2635-->>- P0: return
    P0->>+ P2636: uses
    P2636-->>- P0: return
    P0->>+ P2637: uses
    P2637-->>- P0: return
    P0->>+ P2638: uses
    P2638-->>- P0: return
    P0->>+ P2639: uses
    P2639-->>- P0: return
    P0->>+ P2640: uses
    P2640-->>- P0: return
    P0->>+ P2641: uses
    P2641-->>- P0: return
    P0->>+ P2642: uses
    P2642-->>- P0: return
    P0->>+ P2643: uses
    P2643-->>- P0: return
    P0->>+ P2644: uses
    P2644-->>- P0: return
    P0->>+ P2645: uses
    P2645-->>- P0: return
    P0->>+ P2646: uses
    P2646-->>- P0: return
    P0->>+ P2647: uses
    P2647-->>- P0: return
    P0->>+ P2648: uses
    P2648-->>- P0: return
    P0->>+ P2649: uses
    P2649-->>- P0: return
    P0->>+ P2650: uses
    P2650-->>- P0: return
    P0->>+ P2651: uses
    P2651-->>- P0: return
    P0->>+ P2652: uses
    P2652-->>- P0: return
    P0->>+ P2653: uses
    P2653-->>- P0: return
    P0->>+ P2654: uses
    P2654-->>- P0: return
    P0->>+ P2655: uses
    P2655-->>- P0: return
    P0->>+ P2656: uses
    P2656-->>- P0: return
    P0->>+ P2657: uses
    P2657-->>- P0: return
    P0->>+ P2658: uses
    P2658-->>- P0: return
    P0->>+ P2659: uses
    P2659-->>- P0: return
    P0->>+ P2660: uses
    P2660-->>- P0: return
    P0->>+ P2661: uses
    P2661-->>- P0: return
    P0->>+ P2662: uses
    P2662-->>- P0: return
    P0->>+ P2663: uses
    P2663-->>- P0: return
    P0->>+ P2664: uses
    P2664-->>- P0: return
    P0->>+ P2665: uses
    P2665-->>- P0: return
    P0->>+ P2666: uses
    P2666-->>- P0: return
    P0->>+ P2667: uses
    P2667-->>- P0: return
    P0->>+ P2668: uses
    P2668-->>- P0: return
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
    P0->>+ P2669: uses
    P2669-->>- P0: return
    P0->>+ P2670: uses
    P2670-->>- P0: return
    P0->>+ P2671: uses
    P2671-->>- P0: return
    P0->>+ P2672: uses
    P2672-->>- P0: return
    P0->>+ P2673: calls
    P2673-->>- P0: return
    P0->>+ P2674: calls
    P2674-->>- P0: return
    P0->>+ P2675: calls
    P2675-->>- P0: return
    P0->>+ P2676: calls
    P2676-->>- P0: return
    P0->>+ P2677: calls
    P2677-->>- P0: return
    P0->>+ P2678: calls
    P2678-->>- P0: return
    P0->>+ P2679: calls
    P2679-->>- P0: return
    P0->>+ P2680: calls
    P2680-->>- P0: return
    P0->>+ P2681: uses
    P2681-->>- P0: return
    P0->>+ P2682: uses
    P2682-->>- P0: return
    P0->>+ P2683: uses
    P2683-->>- P0: return
    P0->>+ P2684: uses
    P2684-->>- P0: return
    P0->>+ P2685: uses
    P2685-->>- P0: return
    P0->>+ P2686: uses
    P2686-->>- P0: return
    P0->>+ P2687: uses
    P2687-->>- P0: return
    P0->>+ P1009: uses
    P1009-->>- P0: return
    P0->>+ P2688: uses
    P2688-->>- P0: return
    P0->>+ P2689: uses
    P2689-->>- P0: return
    P0->>+ P2690: uses
    P2690-->>- P0: return
    P0->>+ P2691: uses
    P2691-->>- P0: return
    P0->>+ P2692: uses
    P2692-->>- P0: return
    P0->>+ P2693: uses
    P2693-->>- P0: return
    P0->>+ P2694: uses
    P2694-->>- P0: return
    P0->>+ P2695: uses
    P2695-->>- P0: return
    P0->>+ P2696: uses
    P2696-->>- P0: return
    P0->>+ P2697: uses
    P2697-->>- P0: return
    P0->>+ P2698: uses
    P2698-->>- P0: return
    P0->>+ P2699: uses
    P2699-->>- P0: return
    P0->>+ P2700: uses
    P2700-->>- P0: return
    P0->>+ P2701: uses
    P2701-->>- P0: return
    P0->>+ P2702: uses
    P2702-->>- P0: return
    P0->>+ P2703: uses
    P2703-->>- P0: return
    P0->>+ P2704: uses
    P2704-->>- P0: return
    P0->>+ P2705: uses
    P2705-->>- P0: return
    P0->>+ P2706: uses
    P2706-->>- P0: return
    P0->>+ P2707: uses
    P2707-->>- P0: return
    P0->>+ P2708: uses
    P2708-->>- P0: return
    P0->>+ P2709: uses
    P2709-->>- P0: return
    P0->>+ P2710: uses
    P2710-->>- P0: return
    P0->>+ P2711: uses
    P2711-->>- P0: return
    P0->>+ P2712: uses
    P2712-->>- P0: return
    P0->>+ P2713: uses
    P2713-->>- P0: return
    P0->>+ P2714: uses
    P2714-->>- P0: return
    P0->>+ P2715: uses
    P2715-->>- P0: return
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
    P0->>+ P1057: uses
    P1057-->>- P0: return
    P0->>+ P1058: uses
    P1058-->>- P0: return
    P0->>+ P1059: uses
    P1059-->>- P0: return
    P0->>+ P1060: uses
    P1060-->>- P0: return
    P0->>+ P1061: uses
    P1061-->>- P0: return
    P0->>+ P1062: uses
    P1062-->>- P0: return
    P0->>+ P1063: uses
    P1063-->>- P0: return
    P0->>+ P1064: uses
    P1064-->>- P0: return
    P0->>+ P1065: uses
    P1065-->>- P0: return
    P0->>+ P1066: uses
    P1066-->>- P0: return
    P0->>+ P1067: uses
    P1067-->>- P0: return
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
    P0->>+ P1093: uses
    P1093-->>- P0: return
    P0->>+ P1094: uses
    P1094-->>- P0: return
    P0->>+ P1095: uses
    P1095-->>- P0: return
    P0->>+ P1096: uses
    P1096-->>- P0: return
    P0->>+ P1097: uses
    P1097-->>- P0: return
    P0->>+ P1098: uses
    P1098-->>- P0: return
    P0->>+ P1099: uses
    P1099-->>- P0: return
    P0->>+ P1100: uses
    P1100-->>- P0: return
    P0->>+ P1101: uses
    P1101-->>- P0: return
    P0->>+ P1102: uses
    P1102-->>- P0: return
    P0->>+ P1103: uses
    P1103-->>- P0: return
    P0->>+ P1104: uses
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
    P0->>+ P2716: calls
    P2716-->>- P0: return
    P0->>+ P2717: calls
    P2717-->>- P0: return
    P0->>+ P2718: calls
    P2718-->>- P0: return
    P0->>+ P2719: calls
    P2719-->>- P0: return
    P0->>+ P2720: calls
    P2720-->>- P0: return
    P0->>+ P2721: calls
    P2721-->>- P0: return
    P0->>+ P2722: calls
    P2722-->>- P0: return
    P0->>+ P2723: calls
    P2723-->>- P0: return
    P0->>+ P2724: calls
    P2724-->>- P0: return
    P0->>+ P2725: calls
    P2725-->>- P0: return
    P0->>+ P2726: calls
    P2726-->>- P0: return
    P0->>+ P2727: calls
    P2727-->>- P0: return
    P0->>+ P2728: calls
    P2728-->>- P0: return
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
    P0->>+ P2729: uses
    P2729-->>- P0: return
    P0->>+ P2730: uses
    P2730-->>- P0: return
    P0->>+ P2731: uses
    P2731-->>- P0: return
    P0->>+ P2732: uses
    P2732-->>- P0: return
    P0->>+ P2733: uses
    P2733-->>- P0: return
    P0->>+ P2734: uses
    P2734-->>- P0: return
    P0->>+ P2735: uses
    P2735-->>- P0: return
    P0->>+ P2736: uses
    P2736-->>- P0: return
    P0->>+ P2737: uses
    P2737-->>- P0: return
    P0->>+ P2738: uses
    P2738-->>- P0: return
    P0->>+ P2739: uses
    P2739-->>- P0: return
    P0->>+ P2740: uses
    P2740-->>- P0: return
    P0->>+ P2741: uses
    P2741-->>- P0: return
    P0->>+ P2742: uses
    P2742-->>- P0: return
    P0->>+ P2743: uses
    P2743-->>- P0: return
    P0->>+ P2744: uses
    P2744-->>- P0: return
    P0->>+ P2745: uses
    P2745-->>- P0: return
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
    P0->>+ P2746: uses
    P2746-->>- P0: return
    P0->>+ P2747: uses
    P2747-->>- P0: return
    P0->>+ P2748: uses
    P2748-->>- P0: return
    P0->>+ P2749: uses
    P2749-->>- P0: return
    P0->>+ P2750: uses
    P2750-->>- P0: return
    P0->>+ P2751: uses
    P2751-->>- P0: return
    P0->>+ P2752: uses
    P2752-->>- P0: return
    P0->>+ P2753: uses
    P2753-->>- P0: return
    P0->>+ P2754: uses
    P2754-->>- P0: return
    P0->>+ P2755: uses
    P2755-->>- P0: return
    P0->>+ P2756: uses
    P2756-->>- P0: return
    P0->>+ P2757: uses
    P2757-->>- P0: return
    P0->>+ P2758: uses
    P2758-->>- P0: return
    P0->>+ P2759: uses
    P2759-->>- P0: return
    P0->>+ P2760: uses
    P2760-->>- P0: return
    P0->>+ P2761: uses
    P2761-->>- P0: return
    P0->>+ P2762: uses
    P2762-->>- P0: return
    P0->>+ P2763: uses
    P2763-->>- P0: return
    P0->>+ P2764: uses
    P2764-->>- P0: return
    P0->>+ P2765: uses
    P2765-->>- P0: return
    P0->>+ P2766: uses
    P2766-->>- P0: return
    P0->>+ P2767: uses
    P2767-->>- P0: return
    P0->>+ P2768: uses
    P2768-->>- P0: return
    P0->>+ P2769: uses
    P2769-->>- P0: return
    P0->>+ P2770: uses
    P2770-->>- P0: return
    P0->>+ P2771: uses
    P2771-->>- P0: return
    P0->>+ P2772: uses
    P2772-->>- P0: return
    P0->>+ P2773: uses
    P2773-->>- P0: return
    P0->>+ P2774: uses
    P2774-->>- P0: return
    P0->>+ P2775: uses
    P2775-->>- P0: return
    P0->>+ P2776: uses
    P2776-->>- P0: return
    P0->>+ P2777: uses
    P2777-->>- P0: return
    P0->>+ P2778: uses
    P2778-->>- P0: return
    P0->>+ P2779: uses
    P2779-->>- P0: return
    P0->>+ P2780: uses
    P2780-->>- P0: return
    P0->>+ P2781: uses
    P2781-->>- P0: return
    P0->>+ P2782: uses
    P2782-->>- P0: return
    P0->>+ P2783: uses
    P2783-->>- P0: return
    P0->>+ P2784: uses
    P2784-->>- P0: return
    P0->>+ P2785: uses
    P2785-->>- P0: return
    P0->>+ P2786: uses
    P2786-->>- P0: return
    P0->>+ P2787: uses
    P2787-->>- P0: return
    P0->>+ P2788: uses
    P2788-->>- P0: return
    P0->>+ P2789: uses
    P2789-->>- P0: return
    P0->>+ P2790: uses
    P2790-->>- P0: return
    P0->>+ P2791: uses
    P2791-->>- P0: return
    P0->>+ P2792: uses
    P2792-->>- P0: return
    P0->>+ P2793: uses
    P2793-->>- P0: return
    P0->>+ P2794: uses
    P2794-->>- P0: return
    P0->>+ P2795: uses
    P2795-->>- P0: return
    P0->>+ P2796: uses
    P2796-->>- P0: return
    P0->>+ P2797: uses
    P2797-->>- P0: return
    P0->>+ P2798: uses
    P2798-->>- P0: return
    P0->>+ P2799: uses
    P2799-->>- P0: return
    P0->>+ P2800: uses
    P2800-->>- P0: return
    P0->>+ P2801: uses
    P2801-->>- P0: return
    P0->>+ P2802: uses
    P2802-->>- P0: return
    P0->>+ P2803: uses
    P2803-->>- P0: return
    P0->>+ P2804: uses
    P2804-->>- P0: return
    P0->>+ P2805: uses
    P2805-->>- P0: return
    P0->>+ P2806: uses
    P2806-->>- P0: return
    P0->>+ P2807: uses
    P2807-->>- P0: return
    P0->>+ P2808: uses
    P2808-->>- P0: return
    P0->>+ P2809: uses
    P2809-->>- P0: return
    P0->>+ P2810: uses
    P2810-->>- P0: return
    P0->>+ P2811: uses
    P2811-->>- P0: return
    P0->>+ P2812: uses
    P2812-->>- P0: return
    P0->>+ P2813: uses
    P2813-->>- P0: return
    P0->>+ P2814: uses
    P2814-->>- P0: return
    P0->>+ P2815: uses
    P2815-->>- P0: return
    P0->>+ P2816: uses
    P2816-->>- P0: return
    P0->>+ P2817: uses
    P2817-->>- P0: return
    P0->>+ P2818: uses
    P2818-->>- P0: return
    P0->>+ P2819: uses
    P2819-->>- P0: return
    P0->>+ P2820: uses
    P2820-->>- P0: return
    P0->>+ P2821: uses
    P2821-->>- P0: return
    P0->>+ P2822: uses
    P2822-->>- P0: return
    P0->>+ P2823: uses
    P2823-->>- P0: return
    P0->>+ P2824: uses
    P2824-->>- P0: return
    P0->>+ P2825: uses
    P2825-->>- P0: return
    P0->>+ P2826: uses
    P2826-->>- P0: return
    P0->>+ P2827: uses
    P2827-->>- P0: return
    P0->>+ P2828: uses
    P2828-->>- P0: return
    P0->>+ P2829: uses
    P2829-->>- P0: return
    P0->>+ P2830: uses
    P2830-->>- P0: return
    P0->>+ P2831: uses
    P2831-->>- P0: return
    P0->>+ P2832: uses
    P2832-->>- P0: return
    P0->>+ P2833: uses
    P2833-->>- P0: return
    P0->>+ P2834: uses
    P2834-->>- P0: return
    P0->>+ P2835: uses
    P2835-->>- P0: return
    P0->>+ P2836: uses
    P2836-->>- P0: return
    P0->>+ P2837: uses
    P2837-->>- P0: return
    P0->>+ P2838: uses
    P2838-->>- P0: return
    P0->>+ P2839: uses
    P2839-->>- P0: return
    P0->>+ P2840: uses
    P2840-->>- P0: return
    P0->>+ P2841: uses
    P2841-->>- P0: return
    P0->>+ P2842: uses
    P2842-->>- P0: return
    P0->>+ P2843: uses
    P2843-->>- P0: return
    P0->>+ P2844: uses
    P2844-->>- P0: return
    P0->>+ P2845: uses
    P2845-->>- P0: return
    P0->>+ P2846: uses
    P2846-->>- P0: return
    P0->>+ P2847: uses
    P2847-->>- P0: return
    P0->>+ P2848: uses
    P2848-->>- P0: return
    P0->>+ P2849: uses
    P2849-->>- P0: return
    P0->>+ P2850: uses
    P2850-->>- P0: return
    P0->>+ P2851: uses
    P2851-->>- P0: return
    P0->>+ P2852: uses
    P2852-->>- P0: return
    P0->>+ P2853: uses
    P2853-->>- P0: return
    P0->>+ P2854: uses
    P2854-->>- P0: return
    P0->>+ P2855: uses
    P2855-->>- P0: return
    P0->>+ P2856: uses
    P2856-->>- P0: return
    P0->>+ P2857: uses
    P2857-->>- P0: return
    P0->>+ P2858: uses
    P2858-->>- P0: return
    P0->>+ P2859: uses
    P2859-->>- P0: return
    P0->>+ P2860: uses
    P2860-->>- P0: return
    P0->>+ P2861: uses
    P2861-->>- P0: return
    P0->>+ P2862: uses
    P2862-->>- P0: return
    P0->>+ P2863: uses
    P2863-->>- P0: return
    P0->>+ P2864: uses
    P2864-->>- P0: return
    P0->>+ P2865: uses
    P2865-->>- P0: return
    P0->>+ P2866: uses
    P2866-->>- P0: return
    P0->>+ P2867: uses
    P2867-->>- P0: return
    P0->>+ P2868: uses
    P2868-->>- P0: return
    P0->>+ P2869: uses
    P2869-->>- P0: return
    P0->>+ P2870: uses
    P2870-->>- P0: return
    P0->>+ P2871: uses
    P2871-->>- P0: return
    P0->>+ P2872: uses
    P2872-->>- P0: return
    P0->>+ P2873: uses
    P2873-->>- P0: return
    P0->>+ P2874: uses
    P2874-->>- P0: return
    P0->>+ P2875: uses
    P2875-->>- P0: return
    P0->>+ P2876: uses
    P2876-->>- P0: return
    P0->>+ P2877: uses
    P2877-->>- P0: return
    P0->>+ P2878: uses
    P2878-->>- P0: return
    P0->>+ P2879: uses
    P2879-->>- P0: return
    P0->>+ P2880: uses
    P2880-->>- P0: return
    P0->>+ P2881: uses
    P2881-->>- P0: return
    P0->>+ P2882: uses
    P2882-->>- P0: return
    P0->>+ P2883: uses
    P2883-->>- P0: return
    P0->>+ P2884: uses
    P2884-->>- P0: return
    P0->>+ P2885: uses
    P2885-->>- P0: return
    P0->>+ P2886: uses
    P2886-->>- P0: return
    P0->>+ P2887: uses
    P2887-->>- P0: return
    P0->>+ P2888: uses
    P2888-->>- P0: return
    P0->>+ P2889: uses
    P2889-->>- P0: return
    P0->>+ P2890: uses
    P2890-->>- P0: return
    P0->>+ P2891: uses
    P2891-->>- P0: return
    P0->>+ P2892: uses
    P2892-->>- P0: return
    P0->>+ P2893: uses
    P2893-->>- P0: return
    P0->>+ P2894: uses
    P2894-->>- P0: return
    P0->>+ P2895: uses
    P2895-->>- P0: return
    P0->>+ P2896: uses
    P2896-->>- P0: return
    P0->>+ P2897: uses
    P2897-->>- P0: return
    P0->>+ P2898: uses
    P2898-->>- P0: return
    P0->>+ P2899: uses
    P2899-->>- P0: return
    P0->>+ P2900: uses
    P2900-->>- P0: return
    P0->>+ P2901: uses
    P2901-->>- P0: return
    P0->>+ P2902: uses
    P2902-->>- P0: return
    P0->>+ P2903: uses
    P2903-->>- P0: return
    P0->>+ P2904: uses
    P2904-->>- P0: return
    P0->>+ P2905: uses
    P2905-->>- P0: return
    P0->>+ P2906: uses
    P2906-->>- P0: return
    P0->>+ P2907: uses
    P2907-->>- P0: return
    P0->>+ P2908: uses
    P2908-->>- P0: return
    P0->>+ P2909: uses
    P2909-->>- P0: return
    P0->>+ P2910: uses
    P2910-->>- P0: return
    P0->>+ P2911: uses
    P2911-->>- P0: return
    P0->>+ P2912: uses
    P2912-->>- P0: return
    P0->>+ P2913: uses
    P2913-->>- P0: return
    P0->>+ P2914: uses
    P2914-->>- P0: return
    P0->>+ P2915: uses
    P2915-->>- P0: return
    P0->>+ P2916: uses
    P2916-->>- P0: return
    P0->>+ P2917: uses
    P2917-->>- P0: return
    P0->>+ P2918: uses
    P2918-->>- P0: return
    P0->>+ P2919: uses
    P2919-->>- P0: return
    P0->>+ P2920: uses
    P2920-->>- P0: return
    P0->>+ P2921: uses
    P2921-->>- P0: return
    P0->>+ P2922: uses
    P2922-->>- P0: return
    P0->>+ P2923: uses
    P2923-->>- P0: return
    P0->>+ P2924: uses
    P2924-->>- P0: return
    P0->>+ P2925: uses
    P2925-->>- P0: return
    P0->>+ P2926: uses
    P2926-->>- P0: return
    P0->>+ P2927: calls
    P2927-->>- P0: return
    P0->>+ P2928: calls
    P2928-->>- P0: return
    P0->>+ P2929: calls
    P2929-->>- P0: return
    P0->>+ P2930: calls
    P2930-->>- P0: return
    P0->>+ P2931: calls
    P2931-->>- P0: return
    P0->>+ P2932: calls
    P2932-->>- P0: return
    P0->>+ P2933: calls
    P2933-->>- P0: return
    P0->>+ P2934: calls
    P2934-->>- P0: return
    P0->>+ P2935: calls
    P2935-->>- P0: return
    P0->>+ P2936: uses
    P2936-->>- P0: return
    P0->>+ P2937: uses
    P2937-->>- P0: return
    P0->>+ P2938: uses
    P2938-->>- P0: return
    P0->>+ P2939: uses
    P2939-->>- P0: return
    P0->>+ P2940: uses
    P2940-->>- P0: return
    P0->>+ P2941: uses
    P2941-->>- P0: return
    P0->>+ P2942: uses
    P2942-->>- P0: return
    P0->>+ P2943: uses
    P2943-->>- P0: return
    P0->>+ P2944: uses
    P2944-->>- P0: return
    P0->>+ P2945: uses
    P2945-->>- P0: return
    P0->>+ P2946: uses
    P2946-->>- P0: return
    P0->>+ P2947: uses
    P2947-->>- P0: return
    P0->>+ P2948: uses
    P2948-->>- P0: return
    P0->>+ P2949: uses
    P2949-->>- P0: return
    P0->>+ P2950: uses
    P2950-->>- P0: return
    P0->>+ P2951: uses
    P2951-->>- P0: return
    P0->>+ P2952: uses
    P2952-->>- P0: return
    P0->>+ P2953: uses
    P2953-->>- P0: return
    P0->>+ P2954: uses
    P2954-->>- P0: return
    P0->>+ P2955: uses
    P2955-->>- P0: return
    P0->>+ P2956: uses
    P2956-->>- P0: return
    P0->>+ P2957: uses
    P2957-->>- P0: return
    P0->>+ P2958: calls
    P2958-->>- P0: return
    P0->>+ P2959: calls
    P2959-->>- P0: return
    P0->>+ P2960: calls
    P2960-->>- P0: return
    P0->>+ P2961: calls
    P2961-->>- P0: return
    P0->>+ P2962: calls
    P2962-->>- P0: return
    P0->>+ P2963: calls
    P2963-->>- P0: return
    P0->>+ P2964: calls
    P2964-->>- P0: return
    P0->>+ P2965: calls
    P2965-->>- P0: return
    P0->>+ P2966: calls
    P2966-->>- P0: return
    P0->>+ P2967: calls
    P2967-->>- P0: return
    P0->>+ P2968: calls
    P2968-->>- P0: return
    P0->>+ P2969: calls
    P2969-->>- P0: return
    P0->>+ P2970: calls
    P2970-->>- P0: return
    P0->>+ P2971: calls
    P2971-->>- P0: return
    P0->>+ P2972: calls
    P2972-->>- P0: return
    P0->>+ P2973: calls
    P2973-->>- P0: return
    P0->>+ P2974: calls
    P2974-->>- P0: return
    P0->>+ P2975: calls
    P2975-->>- P0: return
    P0->>+ P2976: calls
    P2976-->>- P0: return
    P0->>+ P2977: calls
    P2977-->>- P0: return
    P0->>+ P2978: calls
    P2978-->>- P0: return
    P0->>+ P2979: calls
    P2979-->>- P0: return
    P0->>+ P2980: calls
    P2980-->>- P0: return
    P0->>+ P2981: calls
    P2981-->>- P0: return
    P0->>+ P2982: calls
    P2982-->>- P0: return
    P0->>+ P2983: calls
    P2983-->>- P0: return
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
    P0->>+ P1185: uses
    P1185-->>- P0: return
    P0->>+ P1186: uses
    P1186-->>- P0: return
    P0->>+ P1187: uses
    P1187-->>- P0: return
    P0->>+ P2984: uses
    P2984-->>- P0: return
    P0->>+ P1188: uses
    P1188-->>- P0: return
    P0->>+ P1189: uses
    P1189-->>- P0: return
    P0->>+ P1190: uses
    P1190-->>- P0: return
    P0->>+ P2985: uses
    P2985-->>- P0: return
    P0->>+ P2986: uses
    P2986-->>- P0: return
    P0->>+ P1191: uses
    P1191-->>- P0: return
    P0->>+ P1192: uses
    P1192-->>- P0: return
    P0->>+ P1193: uses
    P1193-->>- P0: return
    P0->>+ P1194: uses
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
    P0->>+ P1204: uses
    P1204-->>- P0: return
    P0->>+ P1205: uses
    P1205-->>- P0: return
    P0->>+ P1206: uses
    P1206-->>- P0: return
    P0->>+ P1207: uses
    P1207-->>- P0: return
    P0->>+ P1208: uses
    P1208-->>- P0: return
    P0->>+ P2987: uses
    P2987-->>- P0: return
    P0->>+ P2988: uses
    P2988-->>- P0: return
    P0->>+ P2989: uses
    P2989-->>- P0: return
    P0->>+ P2990: uses
    P2990-->>- P0: return
    P0->>+ P2991: uses
    P2991-->>- P0: return
    P0->>+ P2992: uses
    P2992-->>- P0: return
    P0->>+ P2993: uses
    P2993-->>- P0: return
    P0->>+ P2994: uses
    P2994-->>- P0: return
    P0->>+ P2995: uses
    P2995-->>- P0: return
    P0->>+ P2996: uses
    P2996-->>- P0: return
    P0->>+ P2997: uses
    P2997-->>- P0: return
    P0->>+ P2998: uses
    P2998-->>- P0: return
    P0->>+ P2999: uses
    P2999-->>- P0: return
    P0->>+ P3000: uses
    P3000-->>- P0: return
    P0->>+ P3001: uses
    P3001-->>- P0: return
    P0->>+ P3002: uses
    P3002-->>- P0: return
    P0->>+ P3003: uses
    P3003-->>- P0: return
    P0->>+ P3004: uses
    P3004-->>- P0: return
    P0->>+ P3005: uses
    P3005-->>- P0: return
    P0->>+ P3006: uses
    P3006-->>- P0: return
    P0->>+ P3007: uses
    P3007-->>- P0: return
    P0->>+ P3008: uses
    P3008-->>- P0: return
    P0->>+ P3009: uses
    P3009-->>- P0: return
    P0->>+ P3010: uses
    P3010-->>- P0: return
    P0->>+ P3011: uses
    P3011-->>- P0: return
    P0->>+ P3012: uses
    P3012-->>- P0: return
    P0->>+ P3013: uses
    P3013-->>- P0: return
    P0->>+ P3014: uses
    P3014-->>- P0: return
    P0->>+ P3015: uses
    P3015-->>- P0: return
    P0->>+ P3016: uses
    P3016-->>- P0: return
    P0->>+ P3017: uses
    P3017-->>- P0: return
    P0->>+ P3018: uses
    P3018-->>- P0: return
    P0->>+ P3019: uses
    P3019-->>- P0: return
    P0->>+ P3020: uses
    P3020-->>- P0: return
    P0->>+ P3021: uses
    P3021-->>- P0: return
    P0->>+ P3022: calls
    P3022-->>- P0: return
    P0->>+ P3023: calls
    P3023-->>- P0: return
    P0->>+ P3024: calls
    P3024-->>- P0: return
    P0->>+ P3025: calls
    P3025-->>- P0: return
    P0->>+ P3026: calls
    P3026-->>- P0: return
    P0->>+ P3027: calls
    P3027-->>- P0: return
    P0->>+ P3028: calls
    P3028-->>- P0: return
    P0->>+ P3029: calls
    P3029-->>- P0: return
    P0->>+ P3030: calls
    P3030-->>- P0: return
    P0->>+ P3031: calls
    P3031-->>- P0: return
    P0->>+ P3032: calls
    P3032-->>- P0: return
    P0->>+ P3033: calls
    P3033-->>- P0: return
    P0->>+ P3034: calls
    P3034-->>- P0: return
    P0->>+ P3035: calls
    P3035-->>- P0: return
    P0->>+ P3036: calls
    P3036-->>- P0: return
    P0->>+ P3037: calls
    P3037-->>- P0: return
    P0->>+ P3038: calls
    P3038-->>- P0: return
    P0->>+ P3039: uses
    P3039-->>- P0: return
    P0->>+ P3040: uses
    P3040-->>- P0: return
    P0->>+ P3041: uses
    P3041-->>- P0: return
    P0->>+ P3042: uses
    P3042-->>- P0: return
    P0->>+ P3043: uses
    P3043-->>- P0: return
    P0->>+ P3044: uses
    P3044-->>- P0: return
    P0->>+ P3045: uses
    P3045-->>- P0: return
    P0->>+ P3046: uses
    P3046-->>- P0: return
    P0->>+ P3047: uses
    P3047-->>- P0: return
    P0->>+ P3048: uses
    P3048-->>- P0: return
    P0->>+ P3049: uses
    P3049-->>- P0: return
    P0->>+ P3050: uses
    P3050-->>- P0: return
    P0->>+ P3051: uses
    P3051-->>- P0: return
    P0->>+ P3052: uses
    P3052-->>- P0: return
    P0->>+ P3053: uses
    P3053-->>- P0: return
    P0->>+ P3054: uses
    P3054-->>- P0: return
    P0->>+ P3055: uses
    P3055-->>- P0: return
    P0->>+ P3056: uses
    P3056-->>- P0: return
    P0->>+ P3057: uses
    P3057-->>- P0: return
    P0->>+ P3058: uses
    P3058-->>- P0: return
    P0->>+ P3059: uses
    P3059-->>- P0: return
    P0->>+ P3060: uses
    P3060-->>- P0: return
    P0->>+ P3061: uses
    P3061-->>- P0: return
    P0->>+ P3062: uses
    P3062-->>- P0: return
    P0->>+ P3063: uses
    P3063-->>- P0: return
    P0->>+ P3064: uses
    P3064-->>- P0: return
    P0->>+ P3065: uses
    P3065-->>- P0: return
    P0->>+ P3066: uses
    P3066-->>- P0: return
    P0->>+ P3067: uses
    P3067-->>- P0: return
    P0->>+ P3068: uses
    P3068-->>- P0: return
    P0->>+ P3069: uses
    P3069-->>- P0: return
    P0->>+ P3070: uses
    P3070-->>- P0: return
    P0->>+ P3071: uses
    P3071-->>- P0: return
    P0->>+ P3072: uses
    P3072-->>- P0: return
    P0->>+ P3073: uses
    P3073-->>- P0: return
    P0->>+ P3074: uses
    P3074-->>- P0: return
    P0->>+ P3075: uses
    P3075-->>- P0: return
    P0->>+ P3076: uses
    P3076-->>- P0: return
    P0->>+ P3077: uses
    P3077-->>- P0: return
    P0->>+ P3078: uses
    P3078-->>- P0: return
    P0->>+ P3079: uses
    P3079-->>- P0: return
    P0->>+ P3080: uses
    P3080-->>- P0: return
    P0->>+ P3081: uses
    P3081-->>- P0: return
    P0->>+ P3082: uses
    P3082-->>- P0: return
    P0->>+ P3083: uses
    P3083-->>- P0: return
    P0->>+ P3084: uses
    P3084-->>- P0: return
    P0->>+ P3085: uses
    P3085-->>- P0: return
    P0->>+ P3086: uses
    P3086-->>- P0: return
    P0->>+ P3087: uses
    P3087-->>- P0: return
    P0->>+ P3088: uses
    P3088-->>- P0: return
    P0->>+ P3089: uses
    P3089-->>- P0: return
    P0->>+ P3090: uses
    P3090-->>- P0: return
    P0->>+ P3091: uses
    P3091-->>- P0: return
    P0->>+ P3092: uses
    P3092-->>- P0: return
    P0->>+ P3093: uses
    P3093-->>- P0: return
    P0->>+ P3094: uses
    P3094-->>- P0: return
    P0->>+ P3095: uses
    P3095-->>- P0: return
    P0->>+ P3096: uses
    P3096-->>- P0: return
    P0->>+ P3097: uses
    P3097-->>- P0: return
    P0->>+ P3098: uses
    P3098-->>- P0: return
    P0->>+ P3099: uses
    P3099-->>- P0: return
    P0->>+ P3100: uses
    P3100-->>- P0: return
    P0->>+ P3101: uses
    P3101-->>- P0: return
    P0->>+ P3102: uses
    P3102-->>- P0: return
    P0->>+ P3103: uses
    P3103-->>- P0: return
    P0->>+ P3104: uses
    P3104-->>- P0: return
    P0->>+ P3105: uses
    P3105-->>- P0: return
    P0->>+ P3106: uses
    P3106-->>- P0: return
    P0->>+ P3107: uses
    P3107-->>- P0: return
    P0->>+ P3108: uses
    P3108-->>- P0: return
    P0->>+ P3109: uses
    P3109-->>- P0: return
    P0->>+ P3110: uses
    P3110-->>- P0: return
    P0->>+ P3111: uses
    P3111-->>- P0: return
    P0->>+ P3112: uses
    P3112-->>- P0: return
    P0->>+ P3113: uses
    P3113-->>- P0: return
    P0->>+ P3114: uses
    P3114-->>- P0: return
    P0->>+ P3115: uses
    P3115-->>- P0: return
    P0->>+ P3116: uses
    P3116-->>- P0: return
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
    P0->>+ P3117: uses
    P3117-->>- P0: return
    P0->>+ P3118: uses
    P3118-->>- P0: return
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
    P0->>+ P3119: uses
    P3119-->>- P0: return
    P0->>+ P3120: uses
    P3120-->>- P0: return
    P0->>+ P3121: uses
    P3121-->>- P0: return
    P0->>+ P3122: uses
    P3122-->>- P0: return
    P0->>+ P3123: uses
    P3123-->>- P0: return
    P0->>+ P3124: uses
    P3124-->>- P0: return
    P0->>+ P3125: uses
    P3125-->>- P0: return
    P0->>+ P3126: calls
    P3126-->>- P0: return
    P0->>+ P3127: calls
    P3127-->>- P0: return
    P0->>+ P3128: calls
    P3128-->>- P0: return
    P0->>+ P3129: calls
    P3129-->>- P0: return
    P0->>+ P3130: calls
    P3130-->>- P0: return
    P0->>+ P3131: calls
    P3131-->>- P0: return
    P0->>+ P3132: calls
    P3132-->>- P0: return
    P0->>+ P3133: calls
    P3133-->>- P0: return
    P0->>+ P3134: calls
    P3134-->>- P0: return
    P0->>+ P3135: calls
    P3135-->>- P0: return
    P0->>+ P3136: calls
    P3136-->>- P0: return
    P0->>+ P3137: calls
    P3137-->>- P0: return
    P0->>+ P3138: calls
    P3138-->>- P0: return
    P0->>+ P3139: calls
    P3139-->>- P0: return
    P0->>+ P3140: calls
    P3140-->>- P0: return
    P0->>+ P3141: calls
    P3141-->>- P0: return
    P0->>+ P3142: uses
    P3142-->>- P0: return
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
    P0->>+ P3143: uses
    P3143-->>- P0: return
    P0->>+ P3144: uses
    P3144-->>- P0: return
    P0->>+ P3145: uses
    P3145-->>- P0: return
    P0->>+ P3146: uses
    P3146-->>- P0: return
    P0->>+ P3147: uses
    P3147-->>- P0: return
    P0->>+ P3148: uses
    P3148-->>- P0: return
    P0->>+ P3149: uses
    P3149-->>- P0: return
    P0->>+ P3150: uses
    P3150-->>- P0: return
    P0->>+ P3151: uses
    P3151-->>- P0: return
    P0->>+ P3152: uses
    P3152-->>- P0: return
    P0->>+ P3153: uses
    P3153-->>- P0: return
    P0->>+ P3154: uses
    P3154-->>- P0: return
    P0->>+ P3155: uses
    P3155-->>- P0: return
    P0->>+ P3156: uses
    P3156-->>- P0: return
    P0->>+ P3157: uses
    P3157-->>- P0: return
    P0->>+ P3158: uses
    P3158-->>- P0: return
    P0->>+ P3159: uses
    P3159-->>- P0: return
    P0->>+ P3160: uses
    P3160-->>- P0: return
    P0->>+ P3161: uses
    P3161-->>- P0: return
    P0->>+ P3162: uses
    P3162-->>- P0: return
    P0->>+ P3163: uses
    P3163-->>- P0: return
    P0->>+ P3164: uses
    P3164-->>- P0: return
    P0->>+ P3165: uses
    P3165-->>- P0: return
    P0->>+ P3166: uses
    P3166-->>- P0: return
    P0->>+ P3167: uses
    P3167-->>- P0: return
    P0->>+ P3168: uses
    P3168-->>- P0: return
    P0->>+ P3169: uses
    P3169-->>- P0: return
    P0->>+ P3170: uses
    P3170-->>- P0: return
    P0->>+ P3171: uses
    P3171-->>- P0: return
    P0->>+ P3172: uses
    P3172-->>- P0: return
    P0->>+ P3173: uses
    P3173-->>- P0: return
    P0->>+ P3174: uses
    P3174-->>- P0: return
    P0->>+ P3175: uses
    P3175-->>- P0: return
    P0->>+ P3176: uses
    P3176-->>- P0: return
    P0->>+ P3177: uses
    P3177-->>- P0: return
    P0->>+ P3178: uses
    P3178-->>- P0: return
    P0->>+ P3179: uses
    P3179-->>- P0: return
    P0->>+ P3180: uses
    P3180-->>- P0: return
    P0->>+ P3181: uses
    P3181-->>- P0: return
    P0->>+ P3182: uses
    P3182-->>- P0: return
    P0->>+ P3183: uses
    P3183-->>- P0: return
    P0->>+ P3184: uses
    P3184-->>- P0: return
    P0->>+ P3185: uses
    P3185-->>- P0: return
    P0->>+ P3186: uses
    P3186-->>- P0: return
    P0->>+ P3187: uses
    P3187-->>- P0: return
    P0->>+ P3188: uses
    P3188-->>- P0: return
    P0->>+ P3189: uses
    P3189-->>- P0: return
    P0->>+ P3190: uses
    P3190-->>- P0: return
    P0->>+ P3191: uses
    P3191-->>- P0: return
    P0->>+ P3192: uses
    P3192-->>- P0: return
    P0->>+ P3193: uses
    P3193-->>- P0: return
    P0->>+ P3194: uses
    P3194-->>- P0: return
    P0->>+ P3195: uses
    P3195-->>- P0: return
    P0->>+ P3196: uses
    P3196-->>- P0: return
    P0->>+ P3197: uses
    P3197-->>- P0: return
    P0->>+ P3198: uses
    P3198-->>- P0: return
    P0->>+ P3199: uses
    P3199-->>- P0: return
    P0->>+ P3200: uses
    P3200-->>- P0: return
    P0->>+ P3201: uses
    P3201-->>- P0: return
    P0->>+ P3202: uses
    P3202-->>- P0: return
    P0->>+ P3203: uses
    P3203-->>- P0: return
    P0->>+ P3204: calls
    P3204-->>- P0: return
    P0->>+ P3205: calls
    P3205-->>- P0: return
    P0->>+ P3206: calls
    P3206-->>- P0: return
    P0->>+ P3207: calls
    P3207-->>- P0: return
    P0->>+ P3208: calls
    P3208-->>- P0: return
    P0->>+ P3209: calls
    P3209-->>- P0: return
    P0->>+ P3210: calls
    P3210-->>- P0: return
    P0->>+ P3211: calls
    P3211-->>- P0: return
    P0->>+ P3212: calls
    P3212-->>- P0: return
    P0->>+ P3213: calls
    P3213-->>- P0: return
    P0->>+ P3214: calls
    P3214-->>- P0: return
    P0->>+ P3215: calls
    P3215-->>- P0: return
    P0->>+ P3216: calls
    P3216-->>- P0: return
    P0->>+ P3217: uses
    P3217-->>- P0: return
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
    P0->>+ P1396: uses
    P1396-->>- P0: return
    P0->>+ P1397: uses
    P1397-->>- P0: return
    P0->>+ P1398: uses
    P1398-->>- P0: return
    P0->>+ P1399: uses
    P1399-->>- P0: return
    P0->>+ P1400: uses
    P1400-->>- P0: return
    P0->>+ P1401: uses
    P1401-->>- P0: return
    P0->>+ P1402: uses
    P1402-->>- P0: return
    P0->>+ P1403: uses
    P1403-->>- P0: return
    P0->>+ P1404: uses
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
    P0->>+ P3218: uses
    P3218-->>- P0: return
    P0->>+ P3219: uses
    P3219-->>- P0: return
    P0->>+ P3220: uses
    P3220-->>- P0: return
    P0->>+ P3221: uses
    P3221-->>- P0: return
    P0->>+ P3222: uses
    P3222-->>- P0: return
    P0->>+ P3223: uses
    P3223-->>- P0: return
    P0->>+ P3224: uses
    P3224-->>- P0: return
    P0->>+ P3225: uses
    P3225-->>- P0: return
    P0->>+ P3226: uses
    P3226-->>- P0: return
    P0->>+ P3227: uses
    P3227-->>- P0: return
    P0->>+ P3228: uses
    P3228-->>- P0: return
    P0->>+ P3229: uses
    P3229-->>- P0: return
    P0->>+ P3230: uses
    P3230-->>- P0: return
    P0->>+ P3231: uses
    P3231-->>- P0: return
    P0->>+ P3232: uses
    P3232-->>- P0: return
    P0->>+ P3233: uses
    P3233-->>- P0: return
    P0->>+ P3234: uses
    P3234-->>- P0: return
    P0->>+ P3235: uses
    P3235-->>- P0: return
    P0->>+ P3236: uses
    P3236-->>- P0: return
    P0->>+ P3237: uses
    P3237-->>- P0: return
    P0->>+ P3238: uses
    P3238-->>- P0: return
    P0->>+ P1430: uses
    P1430-->>- P0: return
    P0->>+ P1431: uses
    P1431-->>- P0: return
    P0->>+ P1432: uses
    P1432-->>- P0: return
    P0->>+ P3239: uses
    P3239-->>- P0: return
    P0->>+ P3240: uses
    P3240-->>- P0: return
    P0->>+ P3241: uses
    P3241-->>- P0: return
    P0->>+ P3242: uses
    P3242-->>- P0: return
    P0->>+ P3243: uses
    P3243-->>- P0: return
    P0->>+ P3244: uses
    P3244-->>- P0: return
    P0->>+ P3245: uses
    P3245-->>- P0: return
    P0->>+ P3246: uses
    P3246-->>- P0: return
    P0->>+ P3247: uses
    P3247-->>- P0: return
    P0->>+ P3248: uses
    P3248-->>- P0: return
    P0->>+ P3249: uses
    P3249-->>- P0: return
    P0->>+ P3250: uses
    P3250-->>- P0: return
    P0->>+ P3251: uses
    P3251-->>- P0: return
    P0->>+ P3252: uses
    P3252-->>- P0: return
    P0->>+ P3253: uses
    P3253-->>- P0: return
    P0->>+ P3254: uses
    P3254-->>- P0: return
    P0->>+ P3255: uses
    P3255-->>- P0: return
    P0->>+ P3256: uses
    P3256-->>- P0: return
    P0->>+ P3257: uses
    P3257-->>- P0: return
    P0->>+ P3258: uses
    P3258-->>- P0: return
    P0->>+ P3259: uses
    P3259-->>- P0: return
    P0->>+ P3260: uses
    P3260-->>- P0: return
    P0->>+ P3261: uses
    P3261-->>- P0: return
    P0->>+ P3262: uses
    P3262-->>- P0: return
    P0->>+ P3263: uses
    P3263-->>- P0: return
    P0->>+ P3264: uses
    P3264-->>- P0: return
    P0->>+ P3265: uses
    P3265-->>- P0: return
    P0->>+ P3266: uses
    P3266-->>- P0: return
    P0->>+ P3267: uses
    P3267-->>- P0: return
    P0->>+ P3268: uses
    P3268-->>- P0: return
    P0->>+ P3269: uses
    P3269-->>- P0: return
    P0->>+ P3270: uses
    P3270-->>- P0: return
    P0->>+ P3271: uses
    P3271-->>- P0: return
    P0->>+ P3272: uses
    P3272-->>- P0: return
    P0->>+ P3273: uses
    P3273-->>- P0: return
    P0->>+ P3274: uses
    P3274-->>- P0: return
    P0->>+ P3275: uses
    P3275-->>- P0: return
    P0->>+ P3276: uses
    P3276-->>- P0: return
    P0->>+ P3277: uses
    P3277-->>- P0: return
    P0->>+ P3278: uses
    P3278-->>- P0: return
    P0->>+ P3279: uses
    P3279-->>- P0: return
    P0->>+ P3280: uses
    P3280-->>- P0: return
    P0->>+ P3281: uses
    P3281-->>- P0: return
    P0->>+ P3282: uses
    P3282-->>- P0: return
    P0->>+ P3283: uses
    P3283-->>- P0: return
    P0->>+ P3284: uses
    P3284-->>- P0: return
    P0->>+ P3285: uses
    P3285-->>- P0: return
    P0->>+ P3286: uses
    P3286-->>- P0: return
    P0->>+ P3287: uses
    P3287-->>- P0: return
    P0->>+ P3288: uses
    P3288-->>- P0: return
    P0->>+ P3289: uses
    P3289-->>- P0: return
    P0->>+ P3290: uses
    P3290-->>- P0: return
    P0->>+ P3291: uses
    P3291-->>- P0: return
    P0->>+ P3292: uses
    P3292-->>- P0: return
    P0->>+ P3293: uses
    P3293-->>- P0: return
    P0->>+ P3294: uses
    P3294-->>- P0: return
    P0->>+ P3295: uses
    P3295-->>- P0: return
    P0->>+ P3296: uses
    P3296-->>- P0: return
    P0->>+ P3297: uses
    P3297-->>- P0: return
    P0->>+ P3298: uses
    P3298-->>- P0: return
    P0->>+ P3299: uses
    P3299-->>- P0: return
    P0->>+ P3300: uses
    P3300-->>- P0: return
    P0->>+ P3301: uses
    P3301-->>- P0: return
    P0->>+ P3302: uses
    P3302-->>- P0: return
    P0->>+ P3303: uses
    P3303-->>- P0: return
    P0->>+ P3304: uses
    P3304-->>- P0: return
    P0->>+ P3305: uses
    P3305-->>- P0: return
    P0->>+ P3306: uses
    P3306-->>- P0: return
    P0->>+ P3307: uses
    P3307-->>- P0: return
    P0->>+ P3308: uses
    P3308-->>- P0: return
    P0->>+ P3309: uses
    P3309-->>- P0: return
    P0->>+ P3310: uses
    P3310-->>- P0: return
    P0->>+ P3311: uses
    P3311-->>- P0: return
    P0->>+ P3312: uses
    P3312-->>- P0: return
    P0->>+ P3313: uses
    P3313-->>- P0: return
    P0->>+ P3314: uses
    P3314-->>- P0: return
    P0->>+ P3315: uses
    P3315-->>- P0: return
    P0->>+ P3316: uses
    P3316-->>- P0: return
    P0->>+ P3317: uses
    P3317-->>- P0: return
    P0->>+ P3318: uses
    P3318-->>- P0: return
    P0->>+ P3319: uses
    P3319-->>- P0: return
    P0->>+ P3320: uses
    P3320-->>- P0: return
    P0->>+ P3321: uses
    P3321-->>- P0: return
    P0->>+ P3322: uses
    P3322-->>- P0: return
    P0->>+ P3323: uses
    P3323-->>- P0: return
    P0->>+ P3324: uses
    P3324-->>- P0: return
    P0->>+ P3325: uses
    P3325-->>- P0: return
    P0->>+ P3326: uses
    P3326-->>- P0: return
    P0->>+ P3327: uses
    P3327-->>- P0: return
    P0->>+ P3328: uses
    P3328-->>- P0: return
    P0->>+ P3329: uses
    P3329-->>- P0: return
    P0->>+ P3330: uses
    P3330-->>- P0: return
    P0->>+ P3331: uses
    P3331-->>- P0: return
    P0->>+ P3332: uses
    P3332-->>- P0: return
    P0->>+ P3333: uses
    P3333-->>- P0: return
    P0->>+ P3334: uses
    P3334-->>- P0: return
    P0->>+ P3335: uses
    P3335-->>- P0: return
    P0->>+ P3336: uses
    P3336-->>- P0: return
    P0->>+ P3337: uses
    P3337-->>- P0: return
    P0->>+ P3338: uses
    P3338-->>- P0: return
    P0->>+ P3339: uses
    P3339-->>- P0: return
    P0->>+ P3340: uses
    P3340-->>- P0: return
    P0->>+ P3341: uses
    P3341-->>- P0: return
    P0->>+ P3342: uses
    P3342-->>- P0: return
    P0->>+ P3343: uses
    P3343-->>- P0: return
    P0->>+ P3344: uses
    P3344-->>- P0: return
    P0->>+ P3345: uses
    P3345-->>- P0: return
    P0->>+ P3346: uses
    P3346-->>- P0: return
    P0->>+ P3347: uses
    P3347-->>- P0: return
    P0->>+ P3348: uses
    P3348-->>- P0: return
    P0->>+ P3349: uses
    P3349-->>- P0: return
    P0->>+ P3350: uses
    P3350-->>- P0: return
    P0->>+ P3351: uses
    P3351-->>- P0: return
    P0->>+ P3352: uses
    P3352-->>- P0: return
    P0->>+ P3353: uses
    P3353-->>- P0: return
    P0->>+ P3354: uses
    P3354-->>- P0: return
    P0->>+ P3355: uses
    P3355-->>- P0: return
    P0->>+ P3356: uses
    P3356-->>- P0: return
    P0->>+ P3357: uses
    P3357-->>- P0: return
    P0->>+ P3358: uses
    P3358-->>- P0: return
    P0->>+ P3359: uses
    P3359-->>- P0: return
    P0->>+ P3360: uses
    P3360-->>- P0: return
    P0->>+ P3361: uses
    P3361-->>- P0: return
    P0->>+ P3362: uses
    P3362-->>- P0: return
    P0->>+ P3363: uses
    P3363-->>- P0: return
    P0->>+ P3364: uses
    P3364-->>- P0: return
    P0->>+ P3365: uses
    P3365-->>- P0: return
    P0->>+ P3366: uses
    P3366-->>- P0: return
    P0->>+ P3367: uses
    P3367-->>- P0: return
    P0->>+ P3368: uses
    P3368-->>- P0: return
    P0->>+ P3369: uses
    P3369-->>- P0: return
    P0->>+ P3370: uses
    P3370-->>- P0: return
    P0->>+ P3371: uses
    P3371-->>- P0: return
    P0->>+ P3372: uses
    P3372-->>- P0: return
    P0->>+ P3373: uses
    P3373-->>- P0: return
    P0->>+ P3374: uses
    P3374-->>- P0: return
    P0->>+ P3375: uses
    P3375-->>- P0: return
    P0->>+ P3376: uses
    P3376-->>- P0: return
    P0->>+ P3377: uses
    P3377-->>- P0: return
    P0->>+ P3378: uses
    P3378-->>- P0: return
    P0->>+ P3379: uses
    P3379-->>- P0: return
    P0->>+ P3380: uses
    P3380-->>- P0: return
    P0->>+ P3381: uses
    P3381-->>- P0: return
    P0->>+ P3382: uses
    P3382-->>- P0: return
    P0->>+ P3383: uses
    P3383-->>- P0: return
    P0->>+ P3384: uses
    P3384-->>- P0: return
    P0->>+ P3385: uses
    P3385-->>- P0: return
    P0->>+ P3386: uses
    P3386-->>- P0: return
    P0->>+ P3387: uses
    P3387-->>- P0: return
    P0->>+ P3388: uses
    P3388-->>- P0: return
    P0->>+ P3389: uses
    P3389-->>- P0: return
    P0->>+ P3390: uses
    P3390-->>- P0: return
    P0->>+ P3391: uses
    P3391-->>- P0: return
    P0->>+ P3392: uses
    P3392-->>- P0: return
    P0->>+ P3393: uses
    P3393-->>- P0: return
    P0->>+ P3394: uses
    P3394-->>- P0: return
    P0->>+ P3395: uses
    P3395-->>- P0: return
    P0->>+ P3396: uses
    P3396-->>- P0: return
    P0->>+ P3397: uses
    P3397-->>- P0: return
    P0->>+ P3398: uses
    P3398-->>- P0: return
    P0->>+ P3399: uses
    P3399-->>- P0: return
    P0->>+ P3400: uses
    P3400-->>- P0: return
    P0->>+ P3401: uses
    P3401-->>- P0: return
    P0->>+ P3402: uses
    P3402-->>- P0: return
    P0->>+ P3403: uses
    P3403-->>- P0: return
    P0->>+ P3404: uses
    P3404-->>- P0: return
    P0->>+ P3405: uses
    P3405-->>- P0: return
    P0->>+ P3406: uses
    P3406-->>- P0: return
    P0->>+ P3407: uses
    P3407-->>- P0: return
    P0->>+ P3408: uses
    P3408-->>- P0: return
    P0->>+ P3409: uses
    P3409-->>- P0: return
    P0->>+ P3410: uses
    P3410-->>- P0: return
    P0->>+ P3411: uses
    P3411-->>- P0: return
    P0->>+ P3412: uses
    P3412-->>- P0: return
    P0->>+ P3413: uses
    P3413-->>- P0: return
    P0->>+ P3414: uses
    P3414-->>- P0: return
    P0->>+ P3415: uses
    P3415-->>- P0: return
    P0->>+ P3416: uses
    P3416-->>- P0: return
    P0->>+ P3417: uses
    P3417-->>- P0: return
    P0->>+ P3418: uses
    P3418-->>- P0: return
    P0->>+ P3419: uses
    P3419-->>- P0: return
    P0->>+ P3420: uses
    P3420-->>- P0: return
    P0->>+ P3421: uses
    P3421-->>- P0: return
    P0->>+ P3422: uses
    P3422-->>- P0: return
    P0->>+ P3423: uses
    P3423-->>- P0: return
    P0->>+ P3424: uses
    P3424-->>- P0: return
    P0->>+ P3425: uses
    P3425-->>- P0: return
    P0->>+ P3426: uses
    P3426-->>- P0: return
    P0->>+ P3427: uses
    P3427-->>- P0: return
    P0->>+ P3428: uses
    P3428-->>- P0: return
    P0->>+ P3429: uses
    P3429-->>- P0: return
    P0->>+ P3430: uses
    P3430-->>- P0: return
    P0->>+ P3431: uses
    P3431-->>- P0: return
    P0->>+ P3432: uses
    P3432-->>- P0: return
    P0->>+ P3433: uses
    P3433-->>- P0: return
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
    P0->>+ P3434: uses
    P3434-->>- P0: return
    P0->>+ P3435: uses
    P3435-->>- P0: return
    P0->>+ P3436: uses
    P3436-->>- P0: return
    P0->>+ P3437: uses
    P3437-->>- P0: return
    P0->>+ P3438: uses
    P3438-->>- P0: return
    P0->>+ P3439: uses
    P3439-->>- P0: return
    P0->>+ P3440: uses
    P3440-->>- P0: return
    P0->>+ P3441: uses
    P3441-->>- P0: return
    P0->>+ P3442: uses
    P3442-->>- P0: return
    P0->>+ P3443: uses
    P3443-->>- P0: return
    P0->>+ P3444: uses
    P3444-->>- P0: return
    P0->>+ P3445: uses
    P3445-->>- P0: return
    P0->>+ P3446: uses
    P3446-->>- P0: return
    P0->>+ P3447: uses
    P3447-->>- P0: return
    P0->>+ P3448: uses
    P3448-->>- P0: return
    P0->>+ P3449: uses
    P3449-->>- P0: return
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
    P0->>+ P3450: uses
    P3450-->>- P0: return
    P0->>+ P3451: uses
    P3451-->>- P0: return
    P0->>+ P3452: uses
    P3452-->>- P0: return
    P0->>+ P3453: uses
    P3453-->>- P0: return
    P0->>+ P3454: uses
    P3454-->>- P0: return
    P0->>+ P3455: uses
    P3455-->>- P0: return
    P0->>+ P3456: uses
    P3456-->>- P0: return
    P0->>+ P3457: uses
    P3457-->>- P0: return
    P0->>+ P3458: uses
    P3458-->>- P0: return
    P0->>+ P3459: uses
    P3459-->>- P0: return
    P0->>+ P3460: uses
    P3460-->>- P0: return
    P0->>+ P3461: uses
    P3461-->>- P0: return
    P0->>+ P3462: uses
    P3462-->>- P0: return
    P0->>+ P3463: uses
    P3463-->>- P0: return
    P0->>+ P3464: uses
    P3464-->>- P0: return
    P0->>+ P3465: uses
    P3465-->>- P0: return
    P0->>+ P3466: uses
    P3466-->>- P0: return
    P0->>+ P3467: uses
    P3467-->>- P0: return
    P0->>+ P3468: uses
    P3468-->>- P0: return
    P0->>+ P3469: uses
    P3469-->>- P0: return
    P0->>+ P3470: uses
    P3470-->>- P0: return
    P0->>+ P3471: uses
    P3471-->>- P0: return
    P0->>+ P3472: uses
    P3472-->>- P0: return
    P0->>+ P3473: uses
    P3473-->>- P0: return
    P0->>+ P3474: uses
    P3474-->>- P0: return
    P0->>+ P3475: uses
    P3475-->>- P0: return
    P0->>+ P3476: uses
    P3476-->>- P0: return
    P0->>+ P3477: uses
    P3477-->>- P0: return
    P0->>+ P3478: uses
    P3478-->>- P0: return
    P0->>+ P3479: uses
    P3479-->>- P0: return
    P0->>+ P3480: uses
    P3480-->>- P0: return
    P0->>+ P3481: uses
    P3481-->>- P0: return
    P0->>+ P3482: uses
    P3482-->>- P0: return
    P0->>+ P3483: uses
    P3483-->>- P0: return
    P0->>+ P3484: uses
    P3484-->>- P0: return
    P0->>+ P3485: uses
    P3485-->>- P0: return
    P0->>+ P3486: uses
    P3486-->>- P0: return
    P0->>+ P3487: uses
    P3487-->>- P0: return
    P0->>+ P3488: uses
    P3488-->>- P0: return
    P0->>+ P3489: uses
    P3489-->>- P0: return
    P0->>+ P3490: uses
    P3490-->>- P0: return
    P0->>+ P3491: uses
    P3491-->>- P0: return
    P0->>+ P3492: uses
    P3492-->>- P0: return
    P0->>+ P3493: uses
    P3493-->>- P0: return
    P0->>+ P3494: calls
    P3494-->>- P0: return
    P0->>+ P3495: calls
    P3495-->>- P0: return
    P0->>+ P3496: uses
    P3496-->>- P0: return
    P0->>+ P3497: uses
    P3497-->>- P0: return
    P0->>+ P3498: uses
    P3498-->>- P0: return
    P0->>+ P3499: uses
    P3499-->>- P0: return
    P0->>+ P3500: uses
    P3500-->>- P0: return
    P0->>+ P3501: uses
    P3501-->>- P0: return
    P0->>+ P3502: uses
    P3502-->>- P0: return
    P0->>+ P3503: uses
    P3503-->>- P0: return
    P0->>+ P3504: uses
    P3504-->>- P0: return
    P0->>+ P3505: uses
    P3505-->>- P0: return
    P0->>+ P3506: uses
    P3506-->>- P0: return
    P0->>+ P3507: uses
    P3507-->>- P0: return
    P0->>+ P3508: uses
    P3508-->>- P0: return
    P0->>+ P3509: uses
    P3509-->>- P0: return
    P0->>+ P3510: uses
    P3510-->>- P0: return
    P0->>+ P3511: uses
    P3511-->>- P0: return
    P0->>+ P3512: uses
    P3512-->>- P0: return
    P0->>+ P3513: uses
    P3513-->>- P0: return
    P0->>+ P3514: uses
    P3514-->>- P0: return
    P0->>+ P3515: uses
    P3515-->>- P0: return
    P0->>+ P3516: uses
    P3516-->>- P0: return
    P0->>+ P3517: uses
    P3517-->>- P0: return
    P0->>+ P3518: uses
    P3518-->>- P0: return
    P0->>+ P3519: uses
    P3519-->>- P0: return
    P0->>+ P3520: uses
    P3520-->>- P0: return
    P0->>+ P3521: uses
    P3521-->>- P0: return
    P0->>+ P3522: uses
    P3522-->>- P0: return
    P0->>+ P3523: uses
    P3523-->>- P0: return
    P0->>+ P3524: uses
    P3524-->>- P0: return
    P0->>+ P3525: uses
    P3525-->>- P0: return
    P0->>+ P3526: uses
    P3526-->>- P0: return
    P0->>+ P1472: uses
    P1472-->>- P0: return
    P0->>+ P1473: uses
    P1473-->>- P0: return
    P0->>+ P1474: uses
    P1474-->>- P0: return
    P0->>+ P3527: uses
    P3527-->>- P0: return
    P0->>+ P3528: uses
    P3528-->>- P0: return
    P0->>+ P3529: uses
    P3529-->>- P0: return
    P0->>+ P3530: uses
    P3530-->>- P0: return
    P0->>+ P3531: uses
    P3531-->>- P0: return
    P0->>+ P3532: uses
    P3532-->>- P0: return
    P0->>+ P3533: uses
    P3533-->>- P0: return
    P0->>+ P3534: uses
    P3534-->>- P0: return
    P0->>+ P3535: uses
    P3535-->>- P0: return
    P0->>+ P3536: uses
    P3536-->>- P0: return
    P0->>+ P3537: uses
    P3537-->>- P0: return
    P0->>+ P3538: uses
    P3538-->>- P0: return
    P0->>+ P3539: uses
    P3539-->>- P0: return
    P0->>+ P3540: uses
    P3540-->>- P0: return
    P0->>+ P3541: uses
    P3541-->>- P0: return
    P0->>+ P3542: uses
    P3542-->>- P0: return
    P0->>+ P3543: uses
    P3543-->>- P0: return
    P0->>+ P3544: uses
    P3544-->>- P0: return
    P0->>+ P3545: uses
    P3545-->>- P0: return
    P0->>+ P3546: uses
    P3546-->>- P0: return
    P0->>+ P3547: uses
    P3547-->>- P0: return
    P0->>+ P3548: uses
    P3548-->>- P0: return
    P0->>+ P3549: uses
    P3549-->>- P0: return
    P0->>+ P3550: uses
    P3550-->>- P0: return
    P0->>+ P3551: uses
    P3551-->>- P0: return
    P0->>+ P3552: uses
    P3552-->>- P0: return
    P0->>+ P3553: uses
    P3553-->>- P0: return
    P0->>+ P3554: uses
    P3554-->>- P0: return
    P0->>+ P3555: uses
    P3555-->>- P0: return
    P0->>+ P3556: uses
    P3556-->>- P0: return
    P0->>+ P3557: uses
    P3557-->>- P0: return
    P0->>+ P3558: uses
    P3558-->>- P0: return
    P0->>+ P3559: uses
    P3559-->>- P0: return
    P0->>+ P3560: uses
    P3560-->>- P0: return
    P0->>+ P3561: uses
    P3561-->>- P0: return
    P0->>+ P3562: uses
    P3562-->>- P0: return
    P0->>+ P3563: uses
    P3563-->>- P0: return
    P0->>+ P3564: uses
    P3564-->>- P0: return
    P0->>+ P3565: uses
    P3565-->>- P0: return
    P0->>+ P3566: uses
    P3566-->>- P0: return
    P0->>+ P3567: uses
    P3567-->>- P0: return
    P0->>+ P3568: uses
    P3568-->>- P0: return
    P0->>+ P3569: uses
    P3569-->>- P0: return
    P0->>+ P3570: uses
    P3570-->>- P0: return
    P0->>+ P3571: uses
    P3571-->>- P0: return
    P0->>+ P3572: uses
    P3572-->>- P0: return
    P0->>+ P3573: uses
    P3573-->>- P0: return
    P0->>+ P3574: uses
    P3574-->>- P0: return
    P0->>+ P3575: uses
    P3575-->>- P0: return
    P0->>+ P3576: uses
    P3576-->>- P0: return
    P0->>+ P3577: uses
    P3577-->>- P0: return
    P0->>+ P3578: uses
    P3578-->>- P0: return
    P0->>+ P3579: uses
    P3579-->>- P0: return
    P0->>+ P3580: uses
    P3580-->>- P0: return
    P0->>+ P3581: uses
    P3581-->>- P0: return
    P0->>+ P3582: uses
    P3582-->>- P0: return
    P0->>+ P3583: uses
    P3583-->>- P0: return
    P0->>+ P3584: uses
    P3584-->>- P0: return
    P0->>+ P3585: uses
    P3585-->>- P0: return
    P0->>+ P3586: uses
    P3586-->>- P0: return
    P0->>+ P3587: uses
    P3587-->>- P0: return
    P0->>+ P3588: uses
    P3588-->>- P0: return
    P0->>+ P3589: uses
    P3589-->>- P0: return
    P0->>+ P3590: uses
    P3590-->>- P0: return
    P0->>+ P3591: uses
    P3591-->>- P0: return
    P0->>+ P3592: uses
    P3592-->>- P0: return
    P0->>+ P3593: uses
    P3593-->>- P0: return
    P0->>+ P3594: uses
    P3594-->>- P0: return
    P0->>+ P3595: uses
    P3595-->>- P0: return
    P0->>+ P3596: uses
    P3596-->>- P0: return
    P0->>+ P3597: uses
    P3597-->>- P0: return
    P0->>+ P3598: uses
    P3598-->>- P0: return
    P0->>+ P3599: uses
    P3599-->>- P0: return
    P0->>+ P3600: uses
    P3600-->>- P0: return
    P0->>+ P3601: uses
    P3601-->>- P0: return
    P0->>+ P3602: uses
    P3602-->>- P0: return
    P0->>+ P3603: uses
    P3603-->>- P0: return
    P0->>+ P3604: uses
    P3604-->>- P0: return
    P0->>+ P3605: uses
    P3605-->>- P0: return
    P0->>+ P3606: uses
    P3606-->>- P0: return
    P0->>+ P3607: uses
    P3607-->>- P0: return
    P0->>+ P3608: uses
    P3608-->>- P0: return
    P0->>+ P3609: uses
    P3609-->>- P0: return
    P0->>+ P3610: uses
    P3610-->>- P0: return
    P0->>+ P3611: uses
    P3611-->>- P0: return
    P0->>+ P3612: uses
    P3612-->>- P0: return
    P0->>+ P3613: uses
    P3613-->>- P0: return
    P0->>+ P3614: uses
    P3614-->>- P0: return
    P0->>+ P3615: uses
    P3615-->>- P0: return
    P0->>+ P3616: uses
    P3616-->>- P0: return
    P0->>+ P3617: uses
    P3617-->>- P0: return
    P0->>+ P3618: uses
    P3618-->>- P0: return
    P0->>+ P3619: uses
    P3619-->>- P0: return
    P0->>+ P3620: uses
    P3620-->>- P0: return
    P0->>+ P3621: uses
    P3621-->>- P0: return
    P0->>+ P3622: uses
    P3622-->>- P0: return
    P0->>+ P3623: uses
    P3623-->>- P0: return
    P0->>+ P3624: uses
    P3624-->>- P0: return
    P0->>+ P3625: uses
    P3625-->>- P0: return
    P0->>+ P3626: uses
    P3626-->>- P0: return
    P0->>+ P3627: uses
    P3627-->>- P0: return
    P0->>+ P3628: uses
    P3628-->>- P0: return
    P0->>+ P3629: uses
    P3629-->>- P0: return
    P0->>+ P3630: uses
    P3630-->>- P0: return
    P0->>+ P3631: uses
    P3631-->>- P0: return
    P0->>+ P3632: uses
    P3632-->>- P0: return
    P0->>+ P3633: uses
    P3633-->>- P0: return
    P0->>+ P3634: uses
    P3634-->>- P0: return
    P0->>+ P3635: uses
    P3635-->>- P0: return
    P0->>+ P3636: uses
    P3636-->>- P0: return
    P0->>+ P3637: uses
    P3637-->>- P0: return
    P0->>+ P3638: uses
    P3638-->>- P0: return
    P0->>+ P3639: uses
    P3639-->>- P0: return
    P0->>+ P3640: uses
    P3640-->>- P0: return
    P0->>+ P3641: uses
    P3641-->>- P0: return
    P0->>+ P3642: uses
    P3642-->>- P0: return
    P0->>+ P3643: uses
    P3643-->>- P0: return
    P0->>+ P3644: uses
    P3644-->>- P0: return
    P0->>+ P3645: uses
    P3645-->>- P0: return
    P0->>+ P3646: uses
    P3646-->>- P0: return
    P0->>+ P3647: uses
    P3647-->>- P0: return
    P0->>+ P3648: uses
    P3648-->>- P0: return
    P0->>+ P3649: uses
    P3649-->>- P0: return
    P0->>+ P3650: uses
    P3650-->>- P0: return
    P0->>+ P3651: uses
    P3651-->>- P0: return
    P0->>+ P3652: uses
    P3652-->>- P0: return
    P0->>+ P3653: uses
    P3653-->>- P0: return
    P0->>+ P3654: uses
    P3654-->>- P0: return
    P0->>+ P3655: uses
    P3655-->>- P0: return
    P0->>+ P3656: uses
    P3656-->>- P0: return
    P0->>+ P3657: uses
    P3657-->>- P0: return
    P0->>+ P3658: uses
    P3658-->>- P0: return
    P0->>+ P3659: uses
    P3659-->>- P0: return
    P0->>+ P3660: uses
    P3660-->>- P0: return
    P0->>+ P3661: uses
    P3661-->>- P0: return
    P0->>+ P3662: uses
    P3662-->>- P0: return
    P0->>+ P3663: uses
    P3663-->>- P0: return
    P0->>+ P3664: uses
    P3664-->>- P0: return
    P0->>+ P3665: uses
    P3665-->>- P0: return
    P0->>+ P3666: uses
    P3666-->>- P0: return
    P0->>+ P3667: uses
    P3667-->>- P0: return
    P0->>+ P3668: uses
    P3668-->>- P0: return
    P0->>+ P3669: uses
    P3669-->>- P0: return
    P0->>+ P3670: uses
    P3670-->>- P0: return
    P0->>+ P3671: uses
    P3671-->>- P0: return
    P0->>+ P3672: uses
    P3672-->>- P0: return
    P0->>+ P3673: uses
    P3673-->>- P0: return
    P0->>+ P3674: uses
    P3674-->>- P0: return
    P0->>+ P3675: uses
    P3675-->>- P0: return
    P0->>+ P3676: uses
    P3676-->>- P0: return
    P0->>+ P3677: uses
    P3677-->>- P0: return
    P0->>+ P3678: uses
    P3678-->>- P0: return
    P0->>+ P3679: uses
    P3679-->>- P0: return
    P0->>+ P3680: uses
    P3680-->>- P0: return
    P0->>+ P3681: uses
    P3681-->>- P0: return
    P0->>+ P3682: uses
    P3682-->>- P0: return
    P0->>+ P3683: uses
    P3683-->>- P0: return
    P0->>+ P3684: uses
    P3684-->>- P0: return
    P0->>+ P3685: uses
    P3685-->>- P0: return
    P0->>+ P3686: uses
    P3686-->>- P0: return
    P0->>+ P3687: uses
    P3687-->>- P0: return
    P0->>+ P3688: uses
    P3688-->>- P0: return
    P0->>+ P3689: uses
    P3689-->>- P0: return
    P0->>+ P3690: uses
    P3690-->>- P0: return
    P0->>+ P3691: uses
    P3691-->>- P0: return
    P0->>+ P3692: uses
    P3692-->>- P0: return
    P0->>+ P3693: uses
    P3693-->>- P0: return
    P0->>+ P3694: uses
    P3694-->>- P0: return
    P0->>+ P3695: uses
    P3695-->>- P0: return
```

## Connections by Relation

### calls
- [[load_providers()]] `INFERRED`
- [[_get_session_snapshot()]] `INFERRED`
- [[_parse_guardrails()]] `INFERRED`
- [[require_json_object()]] `EXTRACTED`
- [[agent_spec_to_agent_def()]] `INFERRED`
- [[get_default_provider()]] `INFERRED`
- [[_resolve_provider_for_build()]] `INFERRED`
- [[parse()]] `INFERRED`
- [[_create_session_from_existing_agent()]] `INFERRED`
- [[validate_agent_bundle()]] `INFERRED`
- [[_parse_os_env_sandbox()]] `INFERRED`
- [[load_omnigent_yaml()]] `INFERRED`
- [[._post_session_event()]] `INFERRED`
- [[configure_agent_harness_with_provider()]] `INFERRED`
- [[compact_conversation_now()]] `INFERRED`
- [[set_default_provider()]] `INFERRED`
- [[.send()]] `INFERRED`
- [[strip_ucode_codex_config()]] `INFERRED`
- [[_parse_credential_proxy()]] `INFERRED`
- [[load()]] `INFERRED`

### contains
- [[_errors.py]] `EXTRACTED`
- [[errors.py]] `EXTRACTED`

### inherits
- [[Exception]] `EXTRACTED`
- [[FileNotFoundError]] `EXTRACTED`
- [[ConversationNotFoundError]] `EXTRACTED`
- [[InvalidInputError]] `EXTRACTED`
- [[ConflictError]] `EXTRACTED`
- [[ServerError]] `EXTRACTED`
- [[AgentNotFoundError]] `EXTRACTED`
- [[ResponseNotFoundError]] `EXTRACTED`
- [[BundleInvalidError]] `EXTRACTED`

### method
- [[.__init__()]] `EXTRACTED`

### rationale_for
- [[Application-level error with a machine-readable code.      Raise this from rou]] `EXTRACTED`
- [[Base exception for all omnigent client errors.]] `EXTRACTED`

### uses
- [[ToolManager]] `INFERRED`
- [[ProviderEntry]] `INFERRED`
- [[ResolvedSpec]] `INFERRED`
- [[CodexAppServerClient]] `INFERRED`
- [[RunnerRouter]] `INFERRED`
- [[Shared test helpers across `tests/inner/`, `tests/e2e/`, etc.]] `INFERRED`
- [[ExecutorAdapter]] `INFERRED`
- [[TurnContext]] `INFERRED`
- [[HarnessApp]] `INFERRED`
- [[SessionLiveness]] `INFERRED`
- [[PolicyVerdictPayload]] `INFERRED`
- [[RetryableLLMError]] `INFERRED`
- [[ApprovalEvent]] `INFERRED`
- [[SkillSourceContext]] `INFERRED`
- [[ChatOverrides]] `INFERRED`
- [[SessionsChat]] `INFERRED`
- [[CodexNativeAppServer]] `INFERRED`
- [[LLMErrorDetail]] `INFERRED`
- [[PermanentLLMError]] `INFERRED`
- [[_PendingPolicyAskWrites]] `INFERRED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*