# Community 3

> 7202 nodes · cohesion 0.00

## Key Concepts

- [OmnigentError](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_errors.py#L10) (3425 connections)
- [OSEnvSpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/datamodel.py#L666) (3169 connections)
- [OSEnvSandboxSpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/datamodel.py#L466) (2758 connections)
- [AgentSpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L1366) (2723 connections)
- [ErrorCode](file:///C:/Users/1/github-pr/agent-meow/agent_meow/errors.py#L15) (1475 connections)
- [ExecutorSpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L487) (1399 connections)
- [ToolContext](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/base.py#L29) (1195 connections)
- [TerminalEnvSpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/datamodel.py#L685) (1138 connections)
- [HarnessProcessManager](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/harnesses/process_manager.py#L502) (933 connections)
- [DatabricksAuth](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L416) (922 connections)
- [LocalToolInfo](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L1003) (914 connections)
- [NullServerClient](file:///C:/Users/1/github-pr/agent-meow/tests/runner/helpers.py#L12) (903 connections)
- [MCPServerConfig](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L845) (902 connections)
- [SessionResourceRegistry](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/resource_registry.py#L240) (889 connections)
- [CodexNativeBridgeState](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_bridge.py#L48) (822 connections)
- [LLMConfig](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L644) (776 connections)
- [ApiKeyAuth](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L375) (754 connections)
- [TerminalInstance](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/terminal.py#L842) (722 connections)
- [Tool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/base.py#L64) (700 connections)
- [SessionResourceView](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/session_resources.py#L61) (681 connections)
- [ToolManager](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/manager.py#L97) (576 connections)
- [TerminalExitEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/resource_registry.py#L119) (560 connections)
- [TerminalLifecycle](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/resource_registry.py#L111) (559 connections)
- [OpenCodeNativeBridgeState](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_bridge.py#L209) (535 connections)
- [ClaudeNativeUcodeConfig](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native.py#L267) (526 connections)
- *... and 7177 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class AntigravityNativeBridgeState {
        +antigravity_native_bridge.py()
    }
    class _BodyRequest {
        +app.py()
        +.__init__()
        +.json()
    }
    class _ChildParentMeta {
        +app.py()
    }
    class _CodexNativeLaunchConfig {
        +app.py()
    }
    class _CodexNativeModelOptionsNotReady {
        +app.py()
    }
    class _ContextWindowOverflow {
        +app.py()
        +.__init__()
    }
    class _KiroNativeLaunchConfig {
        +app.py()
    }
    class _OpenCodeNativeLaunchConfig {
        +app.py()
    }
    class _PiNativeLaunchConfig {
        +app.py()
    }
    class ResolvedSpec {
        +app.py()
        +.__getattr__()
    }
    class _SessionSnapshot {
        +app.py()
    }
    class _SubagentDeliveryAck {
        +app.py()
    }
    class _SubagentWorkEntry {
        +app.py()
    }
    class TurnDispatch {
        +app.py()
    }
    class SessionAccess {
        +_auth_helpers.py()
    }
    class BaseAdapter {
        +base.py()
    }
    class Tool {
        +base.py()
        +.invoke()
        +.cancel()
        +.shutdown()
        +.is_async()
        +.dispatch_async()
    }
    class ToolContext {
        +base.py()
    }
    class BwrapSandboxBackend {
        +bwrap_sandbox.py()
        +.resolve()
        +.wrap_launcher_argv()
        +.activate()
    }
    class ClaudeLauncher {
        +claude_launcher.py()
    }
    class ClaudeNativeToolRelay {
        +claude_native_bridge.py()
        +.__init__()
        +.close()
    }
    class _JsonlReadResult {
        +claude_native_bridge.py()
    }
    class _JsonlRecord {
        +claude_native_bridge.py()
    }
    class MessageDeltaReadResult {
        +claude_native_bridge.py()
    }
    class _SlashCommandPayload {
        +claude_native_bridge.py()
    }
    class ClaudeNativeUcodeConfig {
        +claude_native.py()
    }
    class _ClaudeTerminalTmux {
        +claude_native.py()
    }
    class PreparedClaudeTerminal {
        +claude_native.py()
    }
    class _ResumeWorkspaceActionOption {
        +claude_native.py()
    }
    class _ResumeWorkspaceActionPickerState {
        +claude_native.py()
        +.move_selection()
        +.selected_action()
    }
    class _SignalRestore {
        +claude_native.py()
    }
    class _CodexElicitationAdapter {
        +_codex_elicitation.py()
    }
    class CodexElicitationRequest {
        +_codex_elicitation.py()
        +.build_response()
    }
    class CodexAppServerClient {
        +codex_native_app_server.py()
        +.__init__()
        +.connect()
        +.close()
        +.request()
        +.notify()
        +.respond()
        +.iter_events()
        +._reader_loop()
    }
    class CodexNativeAppServer {
        +codex_native_app_server.py()
        +.start()
        +._trust_policy_hooks()
        +._codex_config_error_hint()
        +._disable_policy_hook()
        +._warn_policy_hook_disabled()
        +.close()
        +._wait_until_ready()
        +._stderr_loop()
    }
    class CodexNativeBridgeState {
        +codex_native_bridge.py()
    }
    class _CodexAuthSource {
        +codex_native.py()
    }
    class _CodexTerminalError {
        +codex_native_forwarder.py()
    }
    class _DeltaChunk {
        +codex_native_forwarder.py()
    }
    class _DeltaFlushBarrier {
        +codex_native_forwarder.py()
    }
    class _DeltaFlushStop {
        +codex_native_forwarder.py()
    }
    class _ForwarderTarget {
        +codex_native_forwarder.py()
    }
    class _ForwardHealth {
        +codex_native_forwarder.py()
    }
    class _PartialTextBuffer {
        +codex_native_forwarder.py()
        +.append()
        +.text()
    }
    class _PendingCodexElicitation {
        +codex_native_forwarder.py()
    }
    class _PostResult {
        +codex_native_forwarder.py()
    }
    class LaunchedCodexTerminal {
        +codex_native.py()
    }
    class CodexNativeProcessOwnerLock {
        +codex_native_process_registry.py()
        +.close()
    }
    class _ResumeWorkspaceActionOption {
        +codex_native.py()
    }
    class CompactionResult {
        +compaction.py()
    }
    class _CompactionState {
        +compaction.py()
    }
    class SummaryMetadata {
        +compaction.py()
    }
    class AdvisorConfig {
        +cost_advisor.py()
    }
    class AdvisorTurnResult {
        +cost_advisor.py()
    }
    class Judge {
        +cost_advisor.py()
        +.judge()
    }
    class AdvisorVerdict {
        +cost_plan.py()
    }
    class MaskedEntry {
        +_cwd_scan.py()
    }
    class AgentDef {
        +datamodel.py()
    }
    class AskRequest {
        +datamodel.py()
    }
    class CredentialProxyEntry {
        +datamodel.py()
    }
    class CredentialProxySpec {
        +datamodel.py()
    }
    class CredentialSourceSpec {
        +datamodel.py()
    }
    class ExecutorSpec {
        +datamodel.py()
    }
    class LabelSchemaRule {
        +datamodel.py()
        +.normalize()
        +.allows()
    }
    class MemoryConfig {
        +datamodel.py()
    }
    class OSEnvSandboxSpec {
        +datamodel.py()
    }
    class OSEnvSpec {
        +datamodel.py()
    }
    class ParamDef {
        +datamodel.py()
    }
    class TerminalEnvSpec {
        +datamodel.py()
    }
    class CallerProcessFilesystem {
        +environment_filesystem.py()
        +.__init__()
        +._resolve()
        +.list_dir()
        +.search_files()
        +.read()
        +.write()
        +.stat()
        +.edit_text()
        +._stat_via_shell()
    }
    class DeleteFilesystemResult {
        +environment_filesystem.py()
    }
    class DirectoryNotEmpty {
        +environment_filesystem.py()
    }
    class EditFileResult {
        +environment_filesystem.py()
    }
    class FileContent {
        +environment_filesystem.py()
    }
    class FilesystemEntry {
        +environment_filesystem.py()
    }
    class FilesystemPathNotFound {
        +environment_filesystem.py()
    }
    class FileTooLarge {
        +environment_filesystem.py()
    }
    class InvalidPath {
        +environment_filesystem.py()
    }
    class PageRequest {
        +environment_filesystem.py()
    }
    class PermissionDenied {
        +environment_filesystem.py()
    }
    class ResourceError {
        +environment_filesystem.py()
        +.__init__()
    }
    class ResourceNotFound {
        +environment_filesystem.py()
    }
    class ShellResult {
        +environment_filesystem.py()
    }
    class TextEditRequest {
        +environment_filesystem.py()
    }
    class TextReplacement {
        +environment_filesystem.py()
    }
    class UnsupportedMediaType {
        +environment_filesystem.py()
    }
    class WriteFileResult {
        +environment_filesystem.py()
    }
    class ErrorCode {
        +errors.py()
    }
    class FileNotFoundError {
        +_errors.py()
    }
    class OmnigentError {
        +errors.py()
        +.__init__()
        +_errors.py()
    }
    class GitStatusUnavailable {
        +filesystem_registry.py()
        +.__init__()
    }
    class GeminiAdapter {
        +gemini.py()
        +._get_base_url()
        +._get_headers()
        +.chat_completions()
        +._send_request()
        +._stream_request()
    }
    class DispatchCapability {
        +_globals.py()
    }
    class CodexGoalRunner {
        +goal.py()
        +.__init__()
        +._request()
        +.get()
        +.set()
        +.update_status()
        +.clear()
        +.handle_event()
    }
    class NullServerClient {
        +helpers.py()
        +.get()
        +.post()
        +.patch()
    }
    class _Response {
        +helpers.py()
        +.json()
        +.raise_for_status()
    }
    class RunningFlagTerminalInstance {
        +helpers.py()
        +.set_conversation_link()
        +.is_alive()
    }
    class ClientSideTool {
        +__init__.py()
        +.__init__()
        +.name()
        +.get_schema()
        +.invoke()
    }
    class ClientSideToolSpec {
        +__init__.py()
    }
    class SysListModelsTool {
        +list_models.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class _OmnigentYamlLoader {
        +loader.py()
    }
    class LocalCallableTool {
        +local_callable.py()
        +.__init__()
        +.name()
        +.dotted_path()
        +.get_schema()
        +.invoke()
        +._ensure_resolved()
    }
    class _DiscoveredTool {
        +local.py()
        +.__init__()
    }
    class LocalPythonTool {
        +local.py()
        +.__init__()
        +.name()
        +.module_path()
        +.get_schema()
        +.invoke()
        +._invoke_subprocess()
        +._invoke_stdout()
        +._build_command()
        +._build_uv_command()
    }
    class LocalToolLoadError {
        +local.py()
    }
    class ToolManager {
        +manager.py()
        +.__init__()
        +._register_policy_tools()
        +._register_async_inbox_tools()
        +._register_timer_tools()
        +._register_skill_tools()
        +._register_builtin_tools()
        +._create_builtin()
        +._create_web_search()
        +._create_web_fetch()
    }
    class _UCFunctionSchemaTool {
        +manager.py()
        +.__init__()
        +.name()
        +.description()
        +.get_schema()
    }
    class _CircuitBreaker {
        +mcp.py()
        +.pre_call()
        +.record_success()
        +.record_failure()
    }
    class McpSchemasResult {
        +mcp_manager.py()
    }
    class RunnerMcpManager {
        +mcp_manager.py()
        +.__init__()
        +._build_elicitation_callback()
        +.prewarm()
        +.schemas_for()
        +.call_tool()
        +._resolve_tool_route()
        +._resolve_owning_server()
        +.shutdown()
        +._ensure_entry()
    }
    class _ServerEntry {
        +mcp_manager.py()
    }
    class _SpecEntry {
        +mcp_manager.py()
    }
    class McpElicitationRequired {
        +mcp.py()
        +.__init__()
    }
    class McpServerConnection {
        +mcp.py()
        +.__post_init__()
        +.connect()
        +.call_tool()
        +._invoke_tool()
        +.call_tool_with_elicitation()
        +._reconnect()
        +._run_lifecycle()
        +._discover_or_use_cache()
        +.close()
    }
    class McpServerDisabledError {
        +mcp.py()
        +.__init__()
    }
    class _AgentEntry {
        +mcp_pool.py()
    }
    class _McpServerEntry {
        +mcp_pool.py()
    }
    class McpToolEntry {
        +mcp_pool.py()
    }
    class ModelEntry {
        +model_catalog.py()
    }
    class ModelListing {
        +model_catalog.py()
    }
    class ResolvedModelProvider {
        +model_catalog.py()
    }
    class RepostResult {
        +_native_post_delivery.py()
    }
    class OpenCodeNativeServer {
        +opencode_native_app_server.py()
        +.__init__()
        +.build_argv()
        +.start()
        +._wait_until_ready()
        +.client()
        +.close()
    }
    class OpenCodeNativeBridgeState {
        +opencode_native_bridge.py()
        +.auth_headers()
    }
    class OpenCodeClientError {
        +opencode_native_client.py()
    }
    class OpenCodeSession {
        +opencode_native_client.py()
    }
    class OpenCodeNativeForwarder {
        +opencode_native_forwarder.py()
        +.__init__()
        +.seed_dedupe_from_history()
        +.run()
        +._consume_once()
        +.handle_event()
        +._event_targets_session()
        +._key()
        +._post_event()
        +._post_status()
    }
    class CallerProcessOSEnvironment {
        +os_env.py()
        +.__post_init__()
        +.read()
        +.write()
        +.edit()
        +.shell()
        +.close()
        +.__del__()
    }
    class OSEnvironment {
        +os_env.py()
        +.close()
    }
    class PagedList {
        +pagination.py()
    }
    class NativePaneReaper {
        +pane_reaper.py()
        +.__init__()
        +.start()
        +.shutdown()
        +._classify()
        +._reap_loop()
        +._scan_once()
    }
    class PaneRef {
        +pane_reaper.py()
    }
    class _ConfigYamlLoader {
        +parser.py()
    }
    class _CredentialProxyItemModel {
        +parser.py()
    }
    class _CredentialSourceModel {
        +parser.py()
        +.to_spec()
    }
    class FunctionPolicy {
        +policies.py()
        +.__post_init__()
        +.reset_turn()
        +.evaluate()
    }
    class PromptPolicy {
        +policies.py()
        +.evaluate()
        +._resolve_executor()
        +._resolve_executor_config()
        +._build_policy_input()
        +._parse_policy_decision()
    }
    class RunnerToolPolicyGate {
        +policy.py()
        +.__init__()
        +.reset_turn()
        +.evaluate_tool_call()
        +.evaluate_tool_result()
        +._evaluate_policies()
    }
    class HarnessProcessManager {
        +process_manager.py()
        +.__init__()
        +.socket_path()
        +.start()
        +.get_client()
        +.forward_cancel()
        +.has_session()
        +.has_active_turn()
        +.mark_in_flight()
        +.clear_in_flight()
    }
    class NoLiveHarnessError {
        +process_manager.py()
    }
    class FamilyConfig {
        +provider_config.py()
    }
    class ResolvedCredential {
        +provider_config.py()
    }
    class ProxyMcpManager {
        +proxy_mcp_manager.py()
        +.__init__()
        +.schemas_for()
        +.call_tool()
        +.prewarm()
        +.shutdown()
    }
    class TerminalListEntry {
        +registry.py()
    }
    class TerminalRegistry {
        +registry.py()
        +.__init__()
        +.conversation_link_for_id()
        +.launch()
        +.get_instance_lock()
        +.get()
        +.list_for_conversation()
        +.native_panes()
        +.transfer()
        +.close()
    }
    class SessionResourceRegistry {
        +resource_registry.py()
        +.__init__()
        +.set_terminal_activity_publisher()
        +.set_session_status_publisher()
        +.set_terminal_exit_publisher()
        +._set_session_status_memo()
        +._take_session_status_memo()
        +.note_session_turn_started()
        +.note_external_session_status()
        +.terminal_resource_role()
    }
    class TerminalExitEvent {
        +resource_registry.py()
    }
    class TerminalLifecycle {
        +resource_registry.py()
    }
    class ContainmentHandle {
        +sandbox.py()
        +.close()
    }
    class SandboxBackend {
        +sandbox.py()
        +.wrap_launcher_argv()
        +.post_spawn()
    }
    class ApprovalEvent {
        +_scaffold.py()
        +.to_elicitation_result()
    }
    class SessionResourceCreatedEvent {
        +schemas.py()
    }
    class SessionResourceDeletedEvent {
        +schemas.py()
    }
    class _ScmpArgCmp {
        +_seccomp.py()
    }
    class SeccompArgFilter {
        +_seccomp.py()
    }
    class SeccompRule {
        +_seccomp.py()
    }
    class SessionResourceView {
        +session_resources.py()
    }
    class SessionEventInput {
        +_sessions.py()
    }
    class SkillSourceContext {
        +skill_sources.py()
    }
    class _AgentTitle {
        +spawn.py()
    }
    class _CallerTree {
        +spawn.py()
    }
    class _SessionResolution {
        +spawn.py()
    }
    class SysSessionCloseTool {
        +spawn.py()
        +.get_schema()
        +.invoke()
    }
    class SysSessionSendTool {
        +spawn.py()
        +.__init__()
        +.get_schema()
    }
    class _CloseFailed {
        +sys_terminal.py()
    }
    class _ResolvedInstance {
        +sys_terminal.py()
    }
    class SysTerminalCloseTool {
        +sys_terminal.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class SysTerminalLaunchTool {
        +sys_terminal.py()
        +.__init__()
        +.get_schema()
        +.invoke()
        +._spawn_and_format()
        +._perform_launch()
        +._validate_launch_args()
        +._resolve_cwd()
    }
    class _ValidatedLaunchArgs {
        +sys_terminal.py()
    }
    class _IdleDetector {
        +terminal.py()
        +.__init__()
        +.tick()
    }
    class TerminalCreateResult {
        +terminal.py()
    }
    class TerminalInstance {
        +terminal.py()
        +.note_client_interaction()
        +.last_pane_text()
        +._remember_pane_snapshot()
        +._tmux_base_cmd()
        +.set_conversation_link()
        +.launch()
        +.send()
        +.read()
        +._bootstrap_egress_proxy()
    }
    class TestCursorForkHistoryPreamble {
        +test_app_cursor_native_model.py()
        +.test_renders_user_and_assistant_turns()
        +.test_skips_non_message_and_empty_items()
        +.test_no_replayable_text_yields_empty()
    }
    class TestCursorMessageItemText {
        +test_app_cursor_native_model.py()
        +.test_string_content()
        +.test_joins_text_blocks()
        +.test_non_text_is_empty()
    }
    class _AntigravityAutoCreateScenario {
        +test_app_sessions_native.py()
    }
    class _AntigravitySnapshotServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.get()
    }
    class _AutoCreateScenario {
        +test_app_sessions_native.py()
    }
    class _BlockingHandle {
        +test_app_sessions_native.py()
        +.__init__()
        +.aiter_text()
    }
    class _BlockingHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.stream()
    }
    class _EnsureCodexTerminalCase {
        +test_app_sessions_native.py()
    }
    class _EnsureTerminalCase {
        +test_app_sessions_native.py()
    }
    class _ErrHandle {
        +test_app_sessions_native.py()
        +.__init__()
        +.aiter_text()
    }
    class _EventRecordingServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.post()
    }
    class _FakeFileServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.get()
    }
    class _FakeMcpManager {
        +test_app_sessions_native.py()
        +.__init__()
        +.schemas_for()
        +.call_tool()
    }
    class _FakeOpenCodeCompactClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.get_session()
        +.list_messages()
        +.summarize()
        +.aclose()
    }
    class _FakeOpenCodeCompactServer {
        +test_app_sessions_native.py()
        +.__init__()
        +.client()
    }
    class _FakeServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.get()
    }
    class _ForwardBlockingHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.post()
    }
    class _ForwarderRun {
        +test_app_sessions_native.py()
    }
    class _GatedFileServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.get()
    }
    class _Handle {
        +test_app_sessions_native.py()
        +.__init__()
        +.aiter_text()
    }
    class _HandshakeHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.stream()
        +.post()
    }
    class _LabelPatchRecordingServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.patch()
    }
    class _LabelsAndEmptyHistoryServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.get()
    }
    class _McpToolsListServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.post()
    }
    class _NativeBlockingHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.stream()
    }
    class _OverflowThenSuccessHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.stream()
        +.post()
    }
    class _PublishedEvent {
        +test_app_sessions_native.py()
    }
    class _QueuedResponseServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.post()
    }
    class _ReadTimeoutTransport {
        +test_app_sessions_native.py()
        +.__init__()
        +.handle_async_request()
    }
    class _RecordedPatch {
        +test_app_sessions_native.py()
    }
    class _RecordingCodexAppServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.connect()
        +.request()
        +.close()
    }
    class _Resp {
        +test_app_sessions_native.py()
        +.__init__()
        +.json()
        +.raise_for_status()
    }
    class _SignalOnCreatedHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.stream()
    }
    class _StreamErrorHarnessClient {
        +test_app_sessions_native.py()
        +.stream()
    }
    class _StreamHandle {
        +test_app_sessions_native.py()
        +.__init__()
        +.aiter_text()
    }
    class _WakePost {
        +test_app_sessions_native.py()
    }
    class _WakeRecordingServerClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.post()
    }
    class ProbeResult {
        +test_bwrap_sandbox.py()
    }
    class _AttachCallRecord {
        +test_claude_native.py()
    }
    class _AttachWSContext {
        +test_claude_native.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
    }
    class _AttachWSStub {
        +test_claude_native.py()
        +.__init__()
        +.__aiter__()
        +.__anext__()
        +.send()
        +.close()
    }
    class _capture_warnings {
        +test_claude_native.py()
        +.__init__()
        +.__enter__()
        +.__exit__()
    }
    class _FakeTerminalServer {
        +test_claude_native.py()
    }
    class _HeaderRecordingAttach {
        +test_claude_native.py()
        +.__call__()
    }
    class _ScriptedAttach {
        +test_claude_native.py()
        +.__call__()
    }
    class _WorkspaceActionTtyResult {
        +test_claude_native.py()
    }
    class TestCodexCommandPreview {
        +test_codex_elicitation.py()
        +.test_string_command()
        +.test_list_command()
        +.test_empty_command()
        +.test_missing_command()
    }
    class TestExecpolicyAmendment {
        +test_codex_elicitation.py()
        +.test_none_returns_none()
        +.test_valid_list()
        +.test_empty_list_raises()
        +.test_non_list_raises()
        +.test_list_with_non_strings_raises()
    }
    class TestJsonPreview {
        +test_codex_elicitation.py()
        +.test_simple_object()
        +.test_truncated()
    }
    class TestStringListAnswer {
        +test_codex_elicitation.py()
        +.test_string_input()
        +.test_empty_string()
        +.test_list_input()
        +.test_list_with_non_strings()
        +.test_none_input()
        +.test_numeric_input()
    }
    class _HelpProc {
        +test_codex_native_app_server.py()
        +.communicate()
        +.kill()
        +.wait()
    }
    class _CapturedSessionEvent {
        +test_codex_native.py()
    }
    class _DenyHttpxClient {
        +test_codex_native_hook.py()
        +.__init__()
        +.__enter__()
        +.__exit__()
        +.post()
    }
    class _RaisesIfCalled {
        +test_codex_native_hook.py()
        +.__init__()
        +.__enter__()
        +.__exit__()
        +.post()
    }
    class _RelayEnv {
        +test_comment_relay.py()
    }
    class _StubResourceRegistry {
        +test_comment_relay.py()
        +.__init__()
        +.set_terminal_activity_publisher()
        +.set_session_status_publisher()
        +.set_terminal_exit_publisher()
        +.compute_default_env_root()
        +.launch_required_terminal()
        +.launch_auxiliary_terminal()
        +._launch()
        +.cleanup_session()
    }
    class _PatchCapture {
        +test_cost_advisor.py()
        +.__init__()
        +.handler()
    }
    class _ScriptedJudge {
        +test_cost_advisor.py()
        +.__init__()
        +.judge()
    }
    class TestAgentDef {
        +test_datamodel.py()
        +.test_default()
        +.test_with_values()
    }
    class _CapturingUpstream {
        +test_egress_e2e.py()
        +.__init__()
        +.close()
    }
    class _FakeProcessManager {
        +test_enforce_sandbox_gate.py()
        +.__init__()
        +.get_client()
        +.has_session()
        +.forward_cancel()
        +.release()
        +.mark_in_flight()
        +.clear_in_flight()
    }
    class _ScriptedHarnessClient {
        +test_enforce_sandbox_gate.py()
        +.close()
    }
    class TestInstructionsField {
        +test_loader.py()
        +.test_instructions_resolves_relative_path_to_file_contents()
        +.test_instructions_inline_text_when_no_matching_file()
        +.test_instructions_multiline_string_treated_as_inline()
        +.test_instructions_absent_yields_none()
        +.test_instructions_resolves_relative_to_yaml_dir_not_cwd()
        +.test_instructions_from_dict_input_treated_as_inline()
    }
    class TestLoadFromDict {
        +test_loader.py()
        +.test_minimal()
        +.test_executor_string()
        +.test_executor_dict()
        +.test_tools_function()
        +.test_tools_cancellable_function()
        +.test_tools_mcp()
        +.test_tools_agent()
        +.test_tools_agent_with_executor()
        +.test_tools_agent_with_inherited_os_env()
    }
    class TestLoadFromYAML {
        +test_loader.py()
        +.test_yaml_on_key_is_not_parsed_as_boolean()
        +.test_load_yaml_file()
        +.test_load_yaml_file_with_command_mcp()
    }
    class _TestSleepRunner {
        +test_loader.py()
        +.start()
    }
    class CapturedHttpArgs {
        +test_mcp.py()
    }
    class _FakeConn {
        +test_mcp_manager.py()
        +.__init__()
        +.connect()
        +.close()
        +.call_tool()
    }
    class _FakeConn {
        +test_mcp_pool.py()
        +.__post_init__()
        +.connect()
        +.close()
        +.call_tool()
    }
    class _CatchUpServer {
        +test_native_subagent_harness_resolution.py()
        +.get()
    }
    class _Resp {
        +test_native_subagent_harness_resolution.py()
        +.__init__()
        +.json()
        +.raise_for_status()
    }
    class _SubAgentSnapshotServer {
        +test_native_subagent_harness_resolution.py()
        +.get()
    }
    class _AgentDefYamlPair {
        +test_omnigent_adapter.py()
    }
    class _StubCancellableRunner {
        +test_omnigent_adapter.py()
        +.start()
    }
    class TestForkYAMLLoading {
        +test_os_env_fork.py()
        +.test_loader_parses_fork_field()
        +.test_loader_default_fork_false()
    }
    class _AliveProc {
        +test_process_manager.py()
    }
    class _StubTransport {
        +test_proxy_mcp_manager.py()
        +.__init__()
        +.handle_async_request()
    }
    class _FakeOSEnvironment {
        +test_resource_registry.py()
        +.read()
        +.write()
        +.edit()
        +.shell()
        +.close()
    }
    class _ContentCapturingHarnessClient {
        +test_runner_dispatch.py()
        +.__init__()
        +.stream()
    }
    class _ContentCapturingProcessManager {
        +test_runner_dispatch.py()
        +.__init__()
        +.get_client()
        +.mark_in_flight()
        +.clear_in_flight()
    }
    class _FakeHarnessClient {
        +test_runner_dispatch.py()
        +.__init__()
        +.stream()
    }
    class _FakeHarnessStream {
        +test_runner_dispatch.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _FakeProcessManager {
        +test_runner_dispatch.py()
        +.__init__()
        +.get_client()
        +.mark_in_flight()
        +.clear_in_flight()
    }
    class _GatedTwoTurnHarnessClient {
        +test_runner_dispatch.py()
        +.__init__()
        +.stream()
        +.post()
    }
    class _GatedTwoTurnHarnessStream {
        +test_runner_dispatch.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _ModelSendResult {
        +test_runner_dispatch.py()
    }
    class _RecordingProcessManager {
        +test_runner_dispatch.py()
        +.__init__()
        +.get_client()
        +.mark_in_flight()
        +.clear_in_flight()
    }
    class _StubTerminalInstance {
        +test_runner_dispatch.py()
        +.__init__()
        +.start_idle_watcher_thread()
    }
    class _StubTerminalRegistry {
        +test_runner_dispatch.py()
        +.__init__()
        +.get()
    }
    class _CapturingResourceRegistry {
        +test_session_resources.py()
        +.__init__()
        +.set_terminal_activity_publisher()
        +.set_session_status_publisher()
        +.set_terminal_exit_publisher()
        +.compute_default_env_root()
        +.launch_required_terminal()
        +.launch_auxiliary_terminal()
        +._launch()
    }
    class _ConversationStore {
        +test_session_resources.py()
        +.__init__()
        +.get_conversation()
        +.list_conversations()
        +.update_conversation()
        +.set_labels()
        +.append()
        +.list_items()
    }
    class _FakeOSEnvironment {
        +test_session_resources.py()
        +.read()
        +.write()
        +.edit()
        +.shell()
        +.close()
    }
    class _FakeRunnerClient {
        +test_session_resources.py()
        +.__init__()
        +._make_response()
        +.get()
        +.post()
        +.put()
        +.patch()
        +.delete()
    }
    class _FakeRunnerRouter {
        +test_session_resources.py()
        +.__init__()
        +.client_for_session_resources()
    }
    class _FakeStreamCtx {
        +test_session_resources.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _FakeStreamingRunnerClient {
        +test_session_resources.py()
        +.__init__()
        +.stream()
    }
    class _InMemoryArtifactStore {
        +test_session_resources.py()
        +.__init__()
        +.put()
        +.get()
        +.delete()
    }
    class _LaunchReturningRegistry {
        +test_session_resources.py()
        +.__init__()
        +.launch()
    }
    class _Response {
        +test_session_resources.py()
        +.__init__()
        +.json()
        +.raise_for_status()
    }
    class _RoutedRunner {
        +test_session_resources.py()
        +.__init__()
    }
    class _ScriptedStreamCtx {
        +test_session_resources.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _ScriptedStreamingRunnerClient {
        +test_session_resources.py()
        +.__init__()
        +.stream()
    }
    class _StatusEdge {
        +test_session_resources.py()
    }
    class _StreamAndCaptureRunnerClient {
        +test_session_resources.py()
        +.__init__()
        +.post()
    }
    class _SubagentTerminalStore {
        +test_session_resources.py()
        +.__init__()
        +.get_conversation()
        +.list_items()
    }
    class _SwitchableServerClient {
        +test_session_resources.py()
        +.__init__()
        +.get()
        +.post()
        +.patch()
    }
    class _WatcherCapture {
        +test_session_resources.py()
    }
    class _StubLoadedAgent {
        +test_sessions_fork.py()
        +.__init__()
    }
    class _StubLoadedSpec {
        +test_sessions_fork.py()
        +.__init__()
    }
    class _StubAgentStore {
        +test_shell_permission_gate.py()
        +.get()
    }
    class _Response {
        +test_skills.py()
        +.__init__()
        +.json()
    }
    class _Fixture {
        +test_sys_session.py()
    }
    class _ProcessWithStdout {
        +test_terminal.py()
        +.communicate()
    }
    class _SuccessfulProcess {
        +test_terminal.py()
        +.communicate()
    }
    class _FakeAgentSpec {
        +test_uc_function.py()
    }
    class _FakeDatabricksAuth {
        +test_uc_function.py()
    }
    class _FakeExecutorSpec {
        +test_uc_function.py()
    }
    class _FakeResultData {
        +test_uc_function.py()
    }
    class _FakeStatementError {
        +test_uc_function.py()
    }
    class _FakeStatementResponse {
        +test_uc_function.py()
    }
    class _FakeStatementState {
        +test_uc_function.py()
        +.__init__()
        +.__eq__()
    }
    class _FakeStatementStatus {
        +test_uc_function.py()
    }
    class AgentTool {
        +tools.py()
    }
    class CancellableFunctionTool {
        +tools.py()
    }
    class CancellableRun {
        +tools.py()
        +.cancel()
    }
    class CancellableRunner {
        +tools.py()
        +.start()
    }
    class FunctionTool {
        +tools.py()
    }
    class HandoffTool {
        +tools.py()
    }
    class InheritedTool {
        +tools.py()
    }
    class MCPTool {
        +tools.py()
    }
    class SelfAgentTool {
        +tools.py()
    }
    class SkillTool {
        +tools.py()
    }
    class Tool {
        +tools.py()
        +.tool_schema()
    }
    class AgentSpec {
        +types.py()
    }
    class _AnthropicRetryAdapter {
        +types.py()
        +.kwargs()
    }
    class ApiKeyAuth {
        +types.py()
    }
    class BuiltinToolConfig {
        +types.py()
    }
    class _ClaudeCliRetryAdapter {
        +types.py()
        +.env()
    }
    class _CodexCliRetryAdapter {
        +types.py()
        +.env()
    }
    class CompactionConfig {
        +types.py()
    }
    class DatabricksAuth {
        +types.py()
    }
    class ExecutorSpec {
        +types.py()
    }
    class GuardrailsSpec {
        +types.py()
    }
    class InteractionConfig {
        +types.py()
    }
    class LabelDef {
        +types.py()
    }
    class LLMConfig {
        +types.py()
    }
    class LocalToolInfo {
        +types.py()
    }
    class MCPServerConfig {
        +types.py()
        +.__repr__()
    }
    class ModalityConfig {
        +types.py()
    }
    class _OpenAIRetryAdapter {
        +types.py()
        +.kwargs()
    }
    class _PiRetryAdapter {
        +types.py()
        +.settings()
    }
    class ProviderAuth {
        +types.py()
    }
    class SandboxConfig {
        +types.py()
        +.__post_init__()
    }
    class SharePolicy {
        +types.py()
    }
    class ToolRuntime {
        +types.py()
    }
    class ToolsConfig {
        +types.py()
    }
    class UcodeAgentState {
        +ucode_state.py()
    }
    class UcodeWorkspaceState {
        +ucode_state.py()
        +.agent()
    }
    class ValidationError {
        +validator.py()
    }
    class ValidationResult {
        +validator.py()
        +.add()
    }
    class WebFetchTool {
        +web_fetch.py()
        +.__init__()
        +.get_schema()
        +.is_async()
    }
    class _Backend {
        +web_search.py()
    }
    class _IO_COUNTERS {
        +windows_jobobject_sandbox.py()
    }
    class _JobHandle {
        +windows_jobobject_sandbox.py()
        +.__init__()
        +.close()
        +.__enter__()
        +.__exit__()
    }
    class _JOBOBJECT_BASIC_LIMIT_INFORMATION {
        +windows_jobobject_sandbox.py()
    }
    class _JOBOBJECT_EXTENDED_LIMIT_INFORMATION {
        +windows_jobobject_sandbox.py()
    }
    class WindowsJobObjectSandboxBackend {
        +windows_jobobject_sandbox.py()
        +.resolve()
        +.activate()
        +.post_spawn()
    }
    class _AsyncToolHandle {
        +workflow.py()
        +.to_handle_json()
    }
    class _LoadedHistory {
        +workflow.py()
    }
    class UcodeHarnessConfig {
        +workflow.py()
    }
    AntigravityNativeBridgeState --> _CodexNativeModelOptionsNotReady
    AntigravityNativeBridgeState --> _CodexNativeLaunchConfig
    AntigravityNativeBridgeState --> _PiNativeLaunchConfig
    AntigravityNativeBridgeState --> _KiroNativeLaunchConfig
    AntigravityNativeBridgeState --> _OpenCodeNativeLaunchConfig
    AntigravityNativeBridgeState --> ResolvedSpec
    AntigravityNativeBridgeState --> _SessionSnapshot
    AntigravityNativeBridgeState --> TurnDispatch
    AntigravityNativeBridgeState --> _ContextWindowOverflow
    AntigravityNativeBridgeState --> _SubagentWorkEntry
    AntigravityNativeBridgeState --> _SubagentDeliveryAck
    AntigravityNativeBridgeState --> _ChildParentMeta
    AntigravityNativeBridgeState --> _BodyRequest
    _BodyRequest --> CodexAppServerClient
    _BodyRequest --> AdvisorTurnResult
    _BodyRequest --> TerminalListEntry
    _BodyRequest --> SessionResourceView
    _BodyRequest --> ErrorCode
    _BodyRequest --> OmnigentError
    _BodyRequest --> CodexGoalRunner
    _BodyRequest --> ProxyMcpManager
    _BodyRequest --> SessionResourceRegistry
    _BodyRequest --> TerminalExitEvent
    _BodyRequest --> TerminalLifecycle
    _BodyRequest --> HarnessProcessManager
    _BodyRequest --> NoLiveHarnessError
    _BodyRequest --> SkillSourceContext
    _BodyRequest --> AgentSpec
    _BodyRequest --> LocalToolInfo
    _BodyRequest --> OSEnvSpec
    _BodyRequest --> TerminalEnvSpec
    _BodyRequest --> OpenCodeNativeServer
    _BodyRequest --> OpenCodeNativeBridgeState
    _BodyRequest --> OpenCodeNativeForwarder
    _BodyRequest --> CodexNativeBridgeState
    _BodyRequest --> AntigravityNativeBridgeState
    _BodyRequest --> OSEnvSandboxSpec
    _BodyRequest --> ClaudeNativeUcodeConfig
    _BodyRequest --> FilesystemEntry
    _BodyRequest --> ResourceError
    _BodyRequest --> DirectoryNotEmpty
    _BodyRequest --> FilesystemPathNotFound
    _BodyRequest --> FileTooLarge
    _BodyRequest --> InvalidPath
    _BodyRequest --> UnsupportedMediaType
    _BodyRequest --> OpenCodeClientError
    _BodyRequest --> ClaudeNativeToolRelay
    _BodyRequest --> ToolManager
    _BodyRequest --> CallerProcessFilesystem
    _BodyRequest --> GitStatusUnavailable
    _BodyRequest --> TextEditRequest
    _BodyRequest --> McpElicitationRequired
    _BodyRequest --> ApiKeyAuth
    _BodyRequest --> DatabricksAuth
    _BodyRequest --> ProviderAuth
    _BodyRequest --> NativePaneReaper
    _BodyRequest --> PaneRef
    _BodyRequest --> RunnerToolPolicyGate
    _ChildParentMeta --> CodexAppServerClient
    _ChildParentMeta --> AdvisorTurnResult
    _ChildParentMeta --> TerminalListEntry
    _ChildParentMeta --> SessionResourceView
    _ChildParentMeta --> ErrorCode
    _ChildParentMeta --> OmnigentError
    _ChildParentMeta --> CodexGoalRunner
    _ChildParentMeta --> ProxyMcpManager
    _ChildParentMeta --> SessionResourceRegistry
    _ChildParentMeta --> TerminalExitEvent
    _ChildParentMeta --> TerminalLifecycle
    _ChildParentMeta --> HarnessProcessManager
    _ChildParentMeta --> NoLiveHarnessError
    _ChildParentMeta --> SkillSourceContext
    _ChildParentMeta --> AgentSpec
    _ChildParentMeta --> LocalToolInfo
    _ChildParentMeta --> OSEnvSpec
    _ChildParentMeta --> TerminalEnvSpec
    _ChildParentMeta --> OpenCodeNativeServer
    _ChildParentMeta --> OpenCodeNativeBridgeState
    _ChildParentMeta --> OpenCodeNativeForwarder
    _ChildParentMeta --> CodexNativeBridgeState
    _ChildParentMeta --> AntigravityNativeBridgeState
    _ChildParentMeta --> OSEnvSandboxSpec
    _ChildParentMeta --> ClaudeNativeUcodeConfig
    _ChildParentMeta --> FilesystemEntry
    _ChildParentMeta --> ResourceError
    _ChildParentMeta --> DirectoryNotEmpty
    _ChildParentMeta --> FilesystemPathNotFound
    _ChildParentMeta --> FileTooLarge
    _ChildParentMeta --> InvalidPath
    _ChildParentMeta --> UnsupportedMediaType
    _ChildParentMeta --> OpenCodeClientError
    _ChildParentMeta --> ClaudeNativeToolRelay
    _ChildParentMeta --> ToolManager
    _ChildParentMeta --> CallerProcessFilesystem
    _ChildParentMeta --> GitStatusUnavailable
    _ChildParentMeta --> TextEditRequest
    _ChildParentMeta --> McpElicitationRequired
    _ChildParentMeta --> ApiKeyAuth
    _ChildParentMeta --> DatabricksAuth
    _ChildParentMeta --> ProviderAuth
    _ChildParentMeta --> NativePaneReaper
    _ChildParentMeta --> PaneRef
    _ChildParentMeta --> RunnerToolPolicyGate
    _CodexNativeLaunchConfig --> CodexAppServerClient
    _CodexNativeLaunchConfig --> AdvisorTurnResult
    _CodexNativeLaunchConfig --> TerminalListEntry
    _CodexNativeLaunchConfig --> SessionResourceView
    _CodexNativeLaunchConfig --> ErrorCode
    _CodexNativeLaunchConfig --> OmnigentError
    _CodexNativeLaunchConfig --> CodexGoalRunner
    _CodexNativeLaunchConfig --> ProxyMcpManager
    _CodexNativeLaunchConfig --> SessionResourceRegistry
    _CodexNativeLaunchConfig --> TerminalExitEvent
    _CodexNativeLaunchConfig --> TerminalLifecycle
    _CodexNativeLaunchConfig --> HarnessProcessManager
    _CodexNativeLaunchConfig --> NoLiveHarnessError
    _CodexNativeLaunchConfig --> SkillSourceContext
    _CodexNativeLaunchConfig --> AgentSpec
    _CodexNativeLaunchConfig --> LocalToolInfo
    _CodexNativeLaunchConfig --> OSEnvSpec
    _CodexNativeLaunchConfig --> TerminalEnvSpec
    _CodexNativeLaunchConfig --> OpenCodeNativeServer
    _CodexNativeLaunchConfig --> OpenCodeNativeBridgeState
    _CodexNativeLaunchConfig --> OpenCodeNativeForwarder
    _CodexNativeLaunchConfig --> CodexNativeBridgeState
    _CodexNativeLaunchConfig --> AntigravityNativeBridgeState
    _CodexNativeLaunchConfig --> OSEnvSandboxSpec
    _CodexNativeLaunchConfig --> ClaudeNativeUcodeConfig
    _CodexNativeLaunchConfig --> FilesystemEntry
    _CodexNativeLaunchConfig --> ResourceError
    _CodexNativeLaunchConfig --> DirectoryNotEmpty
    _CodexNativeLaunchConfig --> FilesystemPathNotFound
    _CodexNativeLaunchConfig --> FileTooLarge
    _CodexNativeLaunchConfig --> InvalidPath
    _CodexNativeLaunchConfig --> UnsupportedMediaType
    _CodexNativeLaunchConfig --> OpenCodeClientError
    _CodexNativeLaunchConfig --> ClaudeNativeToolRelay
    _CodexNativeLaunchConfig --> ToolManager
    _CodexNativeLaunchConfig --> CallerProcessFilesystem
    _CodexNativeLaunchConfig --> GitStatusUnavailable
    _CodexNativeLaunchConfig --> TextEditRequest
    _CodexNativeLaunchConfig --> McpElicitationRequired
    _CodexNativeLaunchConfig --> ApiKeyAuth
    _CodexNativeLaunchConfig --> DatabricksAuth
    _CodexNativeLaunchConfig --> ProviderAuth
    _CodexNativeLaunchConfig --> NativePaneReaper
    _CodexNativeLaunchConfig --> PaneRef
    _CodexNativeLaunchConfig --> RunnerToolPolicyGate
    _CodexNativeModelOptionsNotReady --> CodexAppServerClient
    _CodexNativeModelOptionsNotReady --> AdvisorTurnResult
    _CodexNativeModelOptionsNotReady --> TerminalListEntry
    _CodexNativeModelOptionsNotReady --> SessionResourceView
    _CodexNativeModelOptionsNotReady --> ErrorCode
    _CodexNativeModelOptionsNotReady --> OmnigentError
    _CodexNativeModelOptionsNotReady --> CodexGoalRunner
    _CodexNativeModelOptionsNotReady --> ProxyMcpManager
    _CodexNativeModelOptionsNotReady --> SessionResourceRegistry
    _CodexNativeModelOptionsNotReady --> TerminalExitEvent
    _CodexNativeModelOptionsNotReady --> TerminalLifecycle
    _CodexNativeModelOptionsNotReady --> HarnessProcessManager
    _CodexNativeModelOptionsNotReady --> NoLiveHarnessError
    _CodexNativeModelOptionsNotReady --> SkillSourceContext
    _CodexNativeModelOptionsNotReady --> AgentSpec
    _CodexNativeModelOptionsNotReady --> LocalToolInfo
    _CodexNativeModelOptionsNotReady --> OSEnvSpec
    _CodexNativeModelOptionsNotReady --> TerminalEnvSpec
    _CodexNativeModelOptionsNotReady --> OpenCodeNativeServer
    _CodexNativeModelOptionsNotReady --> OpenCodeNativeBridgeState
    _CodexNativeModelOptionsNotReady --> OpenCodeNativeForwarder
    _CodexNativeModelOptionsNotReady --> CodexNativeBridgeState
    _CodexNativeModelOptionsNotReady --> AntigravityNativeBridgeState
    _CodexNativeModelOptionsNotReady --> OSEnvSandboxSpec
    _CodexNativeModelOptionsNotReady --> ClaudeNativeUcodeConfig
    _CodexNativeModelOptionsNotReady --> FilesystemEntry
    _CodexNativeModelOptionsNotReady --> ResourceError
    _CodexNativeModelOptionsNotReady --> DirectoryNotEmpty
    _CodexNativeModelOptionsNotReady --> FilesystemPathNotFound
    _CodexNativeModelOptionsNotReady --> FileTooLarge
    _CodexNativeModelOptionsNotReady --> InvalidPath
    _CodexNativeModelOptionsNotReady --> UnsupportedMediaType
    _CodexNativeModelOptionsNotReady --> OpenCodeClientError
    _CodexNativeModelOptionsNotReady --> ClaudeNativeToolRelay
    _CodexNativeModelOptionsNotReady --> ToolManager
    _CodexNativeModelOptionsNotReady --> CallerProcessFilesystem
    _CodexNativeModelOptionsNotReady --> GitStatusUnavailable
    _CodexNativeModelOptionsNotReady --> TextEditRequest
    _CodexNativeModelOptionsNotReady --> McpElicitationRequired
    _CodexNativeModelOptionsNotReady --> ApiKeyAuth
    _CodexNativeModelOptionsNotReady --> DatabricksAuth
    _CodexNativeModelOptionsNotReady --> ProviderAuth
    _CodexNativeModelOptionsNotReady --> NativePaneReaper
    _CodexNativeModelOptionsNotReady --> PaneRef
    _CodexNativeModelOptionsNotReady --> RunnerToolPolicyGate
    _ContextWindowOverflow --> CodexAppServerClient
    _ContextWindowOverflow --> AdvisorTurnResult
    _ContextWindowOverflow --> TerminalListEntry
    _ContextWindowOverflow --> SessionResourceView
    _ContextWindowOverflow --> ErrorCode
    _ContextWindowOverflow --> OmnigentError
    _ContextWindowOverflow --> CodexGoalRunner
    _ContextWindowOverflow --> ProxyMcpManager
    _ContextWindowOverflow --> SessionResourceRegistry
    _ContextWindowOverflow --> TerminalExitEvent
    _ContextWindowOverflow --> TerminalLifecycle
    _ContextWindowOverflow --> HarnessProcessManager
    _ContextWindowOverflow --> NoLiveHarnessError
    _ContextWindowOverflow --> SkillSourceContext
    _ContextWindowOverflow --> AgentSpec
    _ContextWindowOverflow --> LocalToolInfo
    _ContextWindowOverflow --> OSEnvSpec
    _ContextWindowOverflow --> TerminalEnvSpec
    _ContextWindowOverflow --> OpenCodeNativeServer
    _ContextWindowOverflow --> OpenCodeNativeBridgeState
    _ContextWindowOverflow --> OpenCodeNativeForwarder
    _ContextWindowOverflow --> CodexNativeBridgeState
    _ContextWindowOverflow --> AntigravityNativeBridgeState
    _ContextWindowOverflow --> OSEnvSandboxSpec
    _ContextWindowOverflow --> ClaudeNativeUcodeConfig
    _ContextWindowOverflow --> FilesystemEntry
    _ContextWindowOverflow --> ResourceError
    _ContextWindowOverflow --> DirectoryNotEmpty
    _ContextWindowOverflow --> FilesystemPathNotFound
    _ContextWindowOverflow --> FileTooLarge
    _ContextWindowOverflow --> InvalidPath
    _ContextWindowOverflow --> UnsupportedMediaType
    _ContextWindowOverflow --> OpenCodeClientError
    _ContextWindowOverflow --> ClaudeNativeToolRelay
    _ContextWindowOverflow --> ToolManager
    _ContextWindowOverflow --> CallerProcessFilesystem
    _ContextWindowOverflow --> GitStatusUnavailable
    _ContextWindowOverflow --> TextEditRequest
    _ContextWindowOverflow --> McpElicitationRequired
    _ContextWindowOverflow --> ApiKeyAuth
    _ContextWindowOverflow --> DatabricksAuth
    _ContextWindowOverflow --> ProviderAuth
    _ContextWindowOverflow --> NativePaneReaper
    _ContextWindowOverflow --> PaneRef
    _ContextWindowOverflow --> RunnerToolPolicyGate
    _KiroNativeLaunchConfig --> CodexAppServerClient
    _KiroNativeLaunchConfig --> AdvisorTurnResult
    _KiroNativeLaunchConfig --> TerminalListEntry
    _KiroNativeLaunchConfig --> SessionResourceView
    _KiroNativeLaunchConfig --> ErrorCode
    _KiroNativeLaunchConfig --> OmnigentError
    _KiroNativeLaunchConfig --> CodexGoalRunner
    _KiroNativeLaunchConfig --> ProxyMcpManager
    _KiroNativeLaunchConfig --> SessionResourceRegistry
    _KiroNativeLaunchConfig --> TerminalExitEvent
    _KiroNativeLaunchConfig --> TerminalLifecycle
    _KiroNativeLaunchConfig --> HarnessProcessManager
    _KiroNativeLaunchConfig --> NoLiveHarnessError
    _KiroNativeLaunchConfig --> SkillSourceContext
    _KiroNativeLaunchConfig --> AgentSpec
    _KiroNativeLaunchConfig --> LocalToolInfo
    _KiroNativeLaunchConfig --> OSEnvSpec
    _KiroNativeLaunchConfig --> TerminalEnvSpec
    _KiroNativeLaunchConfig --> OpenCodeNativeServer
    _KiroNativeLaunchConfig --> OpenCodeNativeBridgeState
    _KiroNativeLaunchConfig --> OpenCodeNativeForwarder
    _KiroNativeLaunchConfig --> CodexNativeBridgeState
    _KiroNativeLaunchConfig --> AntigravityNativeBridgeState
    _KiroNativeLaunchConfig --> OSEnvSandboxSpec
    _KiroNativeLaunchConfig --> ClaudeNativeUcodeConfig
    _KiroNativeLaunchConfig --> FilesystemEntry
    _KiroNativeLaunchConfig --> ResourceError
    _KiroNativeLaunchConfig --> DirectoryNotEmpty
    _KiroNativeLaunchConfig --> FilesystemPathNotFound
    _KiroNativeLaunchConfig --> FileTooLarge
    _KiroNativeLaunchConfig --> InvalidPath
    _KiroNativeLaunchConfig --> UnsupportedMediaType
    _KiroNativeLaunchConfig --> OpenCodeClientError
    _KiroNativeLaunchConfig --> ClaudeNativeToolRelay
    _KiroNativeLaunchConfig --> ToolManager
    _KiroNativeLaunchConfig --> CallerProcessFilesystem
    _KiroNativeLaunchConfig --> GitStatusUnavailable
    _KiroNativeLaunchConfig --> TextEditRequest
    _KiroNativeLaunchConfig --> McpElicitationRequired
    _KiroNativeLaunchConfig --> ApiKeyAuth
    _KiroNativeLaunchConfig --> DatabricksAuth
    _KiroNativeLaunchConfig --> ProviderAuth
    _KiroNativeLaunchConfig --> NativePaneReaper
    _KiroNativeLaunchConfig --> PaneRef
    _KiroNativeLaunchConfig --> RunnerToolPolicyGate
    _OpenCodeNativeLaunchConfig --> CodexAppServerClient
    _OpenCodeNativeLaunchConfig --> AdvisorTurnResult
    _OpenCodeNativeLaunchConfig --> TerminalListEntry
    _OpenCodeNativeLaunchConfig --> SessionResourceView
    _OpenCodeNativeLaunchConfig --> ErrorCode
    _OpenCodeNativeLaunchConfig --> OmnigentError
    _OpenCodeNativeLaunchConfig --> CodexGoalRunner
    _OpenCodeNativeLaunchConfig --> ProxyMcpManager
    _OpenCodeNativeLaunchConfig --> SessionResourceRegistry
    _OpenCodeNativeLaunchConfig --> TerminalExitEvent
    _OpenCodeNativeLaunchConfig --> TerminalLifecycle
    _OpenCodeNativeLaunchConfig --> HarnessProcessManager
    _OpenCodeNativeLaunchConfig --> NoLiveHarnessError
    _OpenCodeNativeLaunchConfig --> SkillSourceContext
    _OpenCodeNativeLaunchConfig --> AgentSpec
    _OpenCodeNativeLaunchConfig --> LocalToolInfo
    _OpenCodeNativeLaunchConfig --> OSEnvSpec
    _OpenCodeNativeLaunchConfig --> TerminalEnvSpec
    _OpenCodeNativeLaunchConfig --> OpenCodeNativeServer
    _OpenCodeNativeLaunchConfig --> OpenCodeNativeBridgeState
    _OpenCodeNativeLaunchConfig --> OpenCodeNativeForwarder
    _OpenCodeNativeLaunchConfig --> CodexNativeBridgeState
    _OpenCodeNativeLaunchConfig --> AntigravityNativeBridgeState
    _OpenCodeNativeLaunchConfig --> OSEnvSandboxSpec
    _OpenCodeNativeLaunchConfig --> ClaudeNativeUcodeConfig
    _OpenCodeNativeLaunchConfig --> FilesystemEntry
    _OpenCodeNativeLaunchConfig --> ResourceError
    _OpenCodeNativeLaunchConfig --> DirectoryNotEmpty
    _OpenCodeNativeLaunchConfig --> FilesystemPathNotFound
    _OpenCodeNativeLaunchConfig --> FileTooLarge
    _OpenCodeNativeLaunchConfig --> InvalidPath
    _OpenCodeNativeLaunchConfig --> UnsupportedMediaType
    _OpenCodeNativeLaunchConfig --> OpenCodeClientError
    _OpenCodeNativeLaunchConfig --> ClaudeNativeToolRelay
    _OpenCodeNativeLaunchConfig --> ToolManager
    _OpenCodeNativeLaunchConfig --> CallerProcessFilesystem
    _OpenCodeNativeLaunchConfig --> GitStatusUnavailable
    _OpenCodeNativeLaunchConfig --> TextEditRequest
    _OpenCodeNativeLaunchConfig --> McpElicitationRequired
    _OpenCodeNativeLaunchConfig --> ApiKeyAuth
    _OpenCodeNativeLaunchConfig --> DatabricksAuth
    _OpenCodeNativeLaunchConfig --> ProviderAuth
    _OpenCodeNativeLaunchConfig --> NativePaneReaper
    _OpenCodeNativeLaunchConfig --> PaneRef
    _OpenCodeNativeLaunchConfig --> RunnerToolPolicyGate
    _PiNativeLaunchConfig --> CodexAppServerClient
    _PiNativeLaunchConfig --> AdvisorTurnResult
    _PiNativeLaunchConfig --> TerminalListEntry
    _PiNativeLaunchConfig --> SessionResourceView
    _PiNativeLaunchConfig --> ErrorCode
    _PiNativeLaunchConfig --> OmnigentError
    _PiNativeLaunchConfig --> CodexGoalRunner
    _PiNativeLaunchConfig --> ProxyMcpManager
    _PiNativeLaunchConfig --> SessionResourceRegistry
    _PiNativeLaunchConfig --> TerminalExitEvent
    _PiNativeLaunchConfig --> TerminalLifecycle
    _PiNativeLaunchConfig --> HarnessProcessManager
    _PiNativeLaunchConfig --> NoLiveHarnessError
    _PiNativeLaunchConfig --> SkillSourceContext
    _PiNativeLaunchConfig --> AgentSpec
    _PiNativeLaunchConfig --> LocalToolInfo
    _PiNativeLaunchConfig --> OSEnvSpec
    _PiNativeLaunchConfig --> TerminalEnvSpec
    _PiNativeLaunchConfig --> OpenCodeNativeServer
    _PiNativeLaunchConfig --> OpenCodeNativeBridgeState
    _PiNativeLaunchConfig --> OpenCodeNativeForwarder
    _PiNativeLaunchConfig --> CodexNativeBridgeState
    _PiNativeLaunchConfig --> AntigravityNativeBridgeState
    _PiNativeLaunchConfig --> OSEnvSandboxSpec
    _PiNativeLaunchConfig --> ClaudeNativeUcodeConfig
    _PiNativeLaunchConfig --> FilesystemEntry
    _PiNativeLaunchConfig --> ResourceError
    _PiNativeLaunchConfig --> DirectoryNotEmpty
    _PiNativeLaunchConfig --> FilesystemPathNotFound
    _PiNativeLaunchConfig --> FileTooLarge
    _PiNativeLaunchConfig --> InvalidPath
    _PiNativeLaunchConfig --> UnsupportedMediaType
    _PiNativeLaunchConfig --> OpenCodeClientError
    _PiNativeLaunchConfig --> ClaudeNativeToolRelay
    _PiNativeLaunchConfig --> ToolManager
    _PiNativeLaunchConfig --> CallerProcessFilesystem
    _PiNativeLaunchConfig --> GitStatusUnavailable
    _PiNativeLaunchConfig --> TextEditRequest
    _PiNativeLaunchConfig --> McpElicitationRequired
    _PiNativeLaunchConfig --> ApiKeyAuth
    _PiNativeLaunchConfig --> DatabricksAuth
    _PiNativeLaunchConfig --> ProviderAuth
    _PiNativeLaunchConfig --> NativePaneReaper
    _PiNativeLaunchConfig --> PaneRef
    _PiNativeLaunchConfig --> RunnerToolPolicyGate
    ResolvedSpec --> CodexAppServerClient
    ResolvedSpec --> AdvisorTurnResult
    ResolvedSpec --> TerminalListEntry
    ResolvedSpec --> SessionResourceView
    ResolvedSpec --> ErrorCode
    ResolvedSpec --> OmnigentError
    ResolvedSpec --> CodexGoalRunner
    ResolvedSpec --> ProxyMcpManager
    ResolvedSpec --> SessionResourceRegistry
    ResolvedSpec --> TerminalExitEvent
    ResolvedSpec --> TerminalLifecycle
    ResolvedSpec --> HarnessProcessManager
    ResolvedSpec --> NoLiveHarnessError
    ResolvedSpec --> SkillSourceContext
    ResolvedSpec --> AgentSpec
    ResolvedSpec --> LocalToolInfo
    ResolvedSpec --> OSEnvSpec
    ResolvedSpec --> TerminalEnvSpec
    ResolvedSpec --> OpenCodeNativeServer
    ResolvedSpec --> OpenCodeNativeBridgeState
    ResolvedSpec --> OpenCodeNativeForwarder
    ResolvedSpec --> CodexNativeBridgeState
    ResolvedSpec --> AntigravityNativeBridgeState
    ResolvedSpec --> OSEnvSandboxSpec
    ResolvedSpec --> ClaudeNativeUcodeConfig
    ResolvedSpec --> FilesystemEntry
    ResolvedSpec --> ResourceError
    ResolvedSpec --> DirectoryNotEmpty
    ResolvedSpec --> FilesystemPathNotFound
    ResolvedSpec --> FileTooLarge
    ResolvedSpec --> InvalidPath
    ResolvedSpec --> UnsupportedMediaType
    ResolvedSpec --> OpenCodeClientError
    ResolvedSpec --> ClaudeNativeToolRelay
    ResolvedSpec --> ToolManager
    ResolvedSpec --> CallerProcessFilesystem
    ResolvedSpec --> GitStatusUnavailable
    ResolvedSpec --> TextEditRequest
    ResolvedSpec --> McpElicitationRequired
    ResolvedSpec --> ApiKeyAuth
    ResolvedSpec --> DatabricksAuth
    ResolvedSpec --> ProviderAuth
    ResolvedSpec --> NativePaneReaper
    ResolvedSpec --> PaneRef
    ResolvedSpec --> RunnerToolPolicyGate
    ResolvedSpec --> _FakeMcpManager
    ResolvedSpec --> _StreamHandle
    ResolvedSpec --> _ReadTimeoutTransport
    ResolvedSpec --> _McpToolsListServerClient
    ResolvedSpec --> _FakeFileServerClient
    ResolvedSpec --> _StreamErrorHarnessClient
    ResolvedSpec --> _ErrHandle
    ResolvedSpec --> _SignalOnCreatedHarnessClient
    ResolvedSpec --> _Handle
    ResolvedSpec --> _BlockingHarnessClient
    ResolvedSpec --> _BlockingHandle
    ResolvedSpec --> _HandshakeHarnessClient
    ResolvedSpec --> _NativeBlockingHarnessClient
    ResolvedSpec --> _GatedFileServerClient
    ResolvedSpec --> _Resp
    ResolvedSpec --> _FakeServerClient
    ResolvedSpec --> _OverflowThenSuccessHarnessClient
    ResolvedSpec --> _ForwardBlockingHarnessClient
    ResolvedSpec --> _WakeRecordingServerClient
    ResolvedSpec --> _EventRecordingServerClient
    ResolvedSpec --> _RecordingCodexAppServerClient
    ResolvedSpec --> _FakeOpenCodeCompactClient
    ResolvedSpec --> _FakeOpenCodeCompactServer
    ResolvedSpec --> _PublishedEvent
    ResolvedSpec --> _AutoCreateScenario
    ResolvedSpec --> _LabelsAndEmptyHistoryServerClient
    ResolvedSpec --> _AntigravityAutoCreateScenario
    ResolvedSpec --> _AntigravitySnapshotServerClient
    ResolvedSpec --> _EnsureTerminalCase
    ResolvedSpec --> _EnsureCodexTerminalCase
    ResolvedSpec --> _RecordedPatch
    ResolvedSpec --> _WakePost
    ResolvedSpec --> _QueuedResponseServerClient
    ResolvedSpec --> _LabelPatchRecordingServerClient
    ResolvedSpec --> _ForwarderRun
    ResolvedSpec --> _Response
    _SessionSnapshot --> CodexAppServerClient
    _SessionSnapshot --> AdvisorTurnResult
    _SessionSnapshot --> TerminalListEntry
    _SessionSnapshot --> SessionResourceView
    _SessionSnapshot --> ErrorCode
    _SessionSnapshot --> OmnigentError
    _SessionSnapshot --> CodexGoalRunner
    _SessionSnapshot --> ProxyMcpManager
    _SessionSnapshot --> SessionResourceRegistry
    _SessionSnapshot --> TerminalExitEvent
    _SessionSnapshot --> TerminalLifecycle
    _SessionSnapshot --> HarnessProcessManager
    _SessionSnapshot --> NoLiveHarnessError
    _SessionSnapshot --> SkillSourceContext
    _SessionSnapshot --> AgentSpec
    _SessionSnapshot --> LocalToolInfo
    _SessionSnapshot --> OSEnvSpec
    _SessionSnapshot --> TerminalEnvSpec
    _SessionSnapshot --> OpenCodeNativeServer
    _SessionSnapshot --> OpenCodeNativeBridgeState
    _SessionSnapshot --> OpenCodeNativeForwarder
    _SessionSnapshot --> CodexNativeBridgeState
    _SessionSnapshot --> AntigravityNativeBridgeState
    _SessionSnapshot --> OSEnvSandboxSpec
    _SessionSnapshot --> ClaudeNativeUcodeConfig
    _SessionSnapshot --> FilesystemEntry
    _SessionSnapshot --> ResourceError
    _SessionSnapshot --> DirectoryNotEmpty
    _SessionSnapshot --> FilesystemPathNotFound
    _SessionSnapshot --> FileTooLarge
    _SessionSnapshot --> InvalidPath
    _SessionSnapshot --> UnsupportedMediaType
    _SessionSnapshot --> OpenCodeClientError
    _SessionSnapshot --> ClaudeNativeToolRelay
    _SessionSnapshot --> ToolManager
    _SessionSnapshot --> CallerProcessFilesystem
    _SessionSnapshot --> GitStatusUnavailable
    _SessionSnapshot --> TextEditRequest
    _SessionSnapshot --> McpElicitationRequired
    _SessionSnapshot --> ApiKeyAuth
    _SessionSnapshot --> DatabricksAuth
    _SessionSnapshot --> ProviderAuth
    _SessionSnapshot --> NativePaneReaper
    _SessionSnapshot --> PaneRef
    _SessionSnapshot --> RunnerToolPolicyGate
    _SubagentDeliveryAck --> CodexAppServerClient
    _SubagentDeliveryAck --> AdvisorTurnResult
    _SubagentDeliveryAck --> TerminalListEntry
    _SubagentDeliveryAck --> SessionResourceView
    _SubagentDeliveryAck --> ErrorCode
    _SubagentDeliveryAck --> OmnigentError
    _SubagentDeliveryAck --> CodexGoalRunner
    _SubagentDeliveryAck --> ProxyMcpManager
    _SubagentDeliveryAck --> SessionResourceRegistry
    _SubagentDeliveryAck --> TerminalExitEvent
    _SubagentDeliveryAck --> TerminalLifecycle
    _SubagentDeliveryAck --> HarnessProcessManager
    _SubagentDeliveryAck --> NoLiveHarnessError
    _SubagentDeliveryAck --> SkillSourceContext
    _SubagentDeliveryAck --> AgentSpec
    _SubagentDeliveryAck --> LocalToolInfo
    _SubagentDeliveryAck --> OSEnvSpec
    _SubagentDeliveryAck --> TerminalEnvSpec
    _SubagentDeliveryAck --> OpenCodeNativeServer
    _SubagentDeliveryAck --> OpenCodeNativeBridgeState
    _SubagentDeliveryAck --> OpenCodeNativeForwarder
    _SubagentDeliveryAck --> CodexNativeBridgeState
    _SubagentDeliveryAck --> AntigravityNativeBridgeState
    _SubagentDeliveryAck --> OSEnvSandboxSpec
    _SubagentDeliveryAck --> ClaudeNativeUcodeConfig
    _SubagentDeliveryAck --> FilesystemEntry
    _SubagentDeliveryAck --> ResourceError
    _SubagentDeliveryAck --> DirectoryNotEmpty
    _SubagentDeliveryAck --> FilesystemPathNotFound
    _SubagentDeliveryAck --> FileTooLarge
    _SubagentDeliveryAck --> InvalidPath
    _SubagentDeliveryAck --> UnsupportedMediaType
    _SubagentDeliveryAck --> OpenCodeClientError
    _SubagentDeliveryAck --> ClaudeNativeToolRelay
    _SubagentDeliveryAck --> ToolManager
    _SubagentDeliveryAck --> CallerProcessFilesystem
    _SubagentDeliveryAck --> GitStatusUnavailable
    _SubagentDeliveryAck --> TextEditRequest
    _SubagentDeliveryAck --> McpElicitationRequired
    _SubagentDeliveryAck --> ApiKeyAuth
    _SubagentDeliveryAck --> DatabricksAuth
    _SubagentDeliveryAck --> ProviderAuth
    _SubagentDeliveryAck --> NativePaneReaper
    _SubagentDeliveryAck --> PaneRef
    _SubagentDeliveryAck --> RunnerToolPolicyGate
    _SubagentWorkEntry --> CodexAppServerClient
    _SubagentWorkEntry --> AdvisorTurnResult
    _SubagentWorkEntry --> TerminalListEntry
    _SubagentWorkEntry --> SessionResourceView
    _SubagentWorkEntry --> ErrorCode
    _SubagentWorkEntry --> OmnigentError
    _SubagentWorkEntry --> CodexGoalRunner
    _SubagentWorkEntry --> ProxyMcpManager
    _SubagentWorkEntry --> SessionResourceRegistry
    _SubagentWorkEntry --> TerminalExitEvent
    _SubagentWorkEntry --> TerminalLifecycle
    _SubagentWorkEntry --> HarnessProcessManager
    _SubagentWorkEntry --> NoLiveHarnessError
    _SubagentWorkEntry --> SkillSourceContext
    _SubagentWorkEntry --> AgentSpec
    _SubagentWorkEntry --> LocalToolInfo
    _SubagentWorkEntry --> OSEnvSpec
    _SubagentWorkEntry --> TerminalEnvSpec
    _SubagentWorkEntry --> OpenCodeNativeServer
    _SubagentWorkEntry --> OpenCodeNativeBridgeState
    _SubagentWorkEntry --> OpenCodeNativeForwarder
    _SubagentWorkEntry --> CodexNativeBridgeState
    _SubagentWorkEntry --> AntigravityNativeBridgeState
    _SubagentWorkEntry --> OSEnvSandboxSpec
    _SubagentWorkEntry --> ClaudeNativeUcodeConfig
    _SubagentWorkEntry --> FilesystemEntry
    _SubagentWorkEntry --> ResourceError
    _SubagentWorkEntry --> DirectoryNotEmpty
    _SubagentWorkEntry --> FilesystemPathNotFound
    _SubagentWorkEntry --> FileTooLarge
    _SubagentWorkEntry --> InvalidPath
    _SubagentWorkEntry --> UnsupportedMediaType
    _SubagentWorkEntry --> OpenCodeClientError
    _SubagentWorkEntry --> ClaudeNativeToolRelay
    _SubagentWorkEntry --> ToolManager
    _SubagentWorkEntry --> CallerProcessFilesystem
    _SubagentWorkEntry --> GitStatusUnavailable
    _SubagentWorkEntry --> TextEditRequest
    _SubagentWorkEntry --> McpElicitationRequired
    _SubagentWorkEntry --> ApiKeyAuth
    _SubagentWorkEntry --> DatabricksAuth
    _SubagentWorkEntry --> ProviderAuth
    _SubagentWorkEntry --> NativePaneReaper
    _SubagentWorkEntry --> PaneRef
    _SubagentWorkEntry --> RunnerToolPolicyGate
    TurnDispatch --> CodexAppServerClient
    TurnDispatch --> AdvisorTurnResult
    TurnDispatch --> TerminalListEntry
    TurnDispatch --> SessionResourceView
    TurnDispatch --> ErrorCode
    TurnDispatch --> OmnigentError
    TurnDispatch --> CodexGoalRunner
    TurnDispatch --> ProxyMcpManager
    TurnDispatch --> SessionResourceRegistry
    TurnDispatch --> TerminalExitEvent
    TurnDispatch --> TerminalLifecycle
    TurnDispatch --> HarnessProcessManager
    TurnDispatch --> NoLiveHarnessError
    TurnDispatch --> SkillSourceContext
    TurnDispatch --> AgentSpec
    TurnDispatch --> LocalToolInfo
    TurnDispatch --> OSEnvSpec
    TurnDispatch --> TerminalEnvSpec
    TurnDispatch --> OpenCodeNativeServer
    TurnDispatch --> OpenCodeNativeBridgeState
    TurnDispatch --> OpenCodeNativeForwarder
    TurnDispatch --> CodexNativeBridgeState
    TurnDispatch --> AntigravityNativeBridgeState
    TurnDispatch --> OSEnvSandboxSpec
    TurnDispatch --> ClaudeNativeUcodeConfig
    TurnDispatch --> FilesystemEntry
    TurnDispatch --> ResourceError
    TurnDispatch --> DirectoryNotEmpty
    TurnDispatch --> FilesystemPathNotFound
    TurnDispatch --> FileTooLarge
    TurnDispatch --> InvalidPath
    TurnDispatch --> UnsupportedMediaType
    TurnDispatch --> OpenCodeClientError
    TurnDispatch --> ClaudeNativeToolRelay
    TurnDispatch --> ToolManager
    TurnDispatch --> CallerProcessFilesystem
    TurnDispatch --> GitStatusUnavailable
    TurnDispatch --> TextEditRequest
    TurnDispatch --> McpElicitationRequired
    TurnDispatch --> ApiKeyAuth
    TurnDispatch --> DatabricksAuth
    TurnDispatch --> ProviderAuth
    TurnDispatch --> NativePaneReaper
    TurnDispatch --> PaneRef
    TurnDispatch --> RunnerToolPolicyGate
    SessionAccess --> ErrorCode
    SessionAccess --> OmnigentError
    BaseAdapter --> GeminiAdapter
    Tool --> _JsonlRecord
    Tool --> _JsonlReadResult
    Tool --> MessageDeltaReadResult
    Tool --> ClaudeNativeToolRelay
    Tool --> _SlashCommandPayload
    Tool --> LocalToolLoadError
    Tool --> LocalPythonTool
    Tool --> _DiscoveredTool
    Tool --> LocalCallableTool
    Tool --> _UCFunctionSchemaTool
    Tool --> ToolManager
    Tool --> SysListModelsTool
    Tool --> SysSessionSendTool
    Tool --> _SessionResolution
    Tool --> _AgentTitle
    Tool --> _CallerTree
    Tool --> SysSessionCloseTool
    Tool --> _CloseFailed
    Tool --> _ValidatedLaunchArgs
    Tool --> _ResolvedInstance
    Tool --> SysTerminalLaunchTool
    Tool --> SysTerminalCloseTool
    Tool --> WebFetchTool
    Tool --> _Backend
    Tool --> ClientSideToolSpec
    Tool --> ClientSideTool
    ToolContext --> _JsonlRecord
    ToolContext --> _JsonlReadResult
    ToolContext --> MessageDeltaReadResult
    ToolContext --> ClaudeNativeToolRelay
    ToolContext --> _SlashCommandPayload
    ToolContext --> DispatchCapability
    ToolContext --> LocalToolLoadError
    ToolContext --> LocalPythonTool
    ToolContext --> _DiscoveredTool
    ToolContext --> LocalCallableTool
    ToolContext --> _UCFunctionSchemaTool
    ToolContext --> ToolManager
    ToolContext --> SysListModelsTool
    ToolContext --> SysSessionSendTool
    ToolContext --> _SessionResolution
    ToolContext --> _AgentTitle
    ToolContext --> _CallerTree
    ToolContext --> SysSessionCloseTool
    ToolContext --> _CloseFailed
    ToolContext --> _ValidatedLaunchArgs
    ToolContext --> _ResolvedInstance
    ToolContext --> SysTerminalLaunchTool
    ToolContext --> SysTerminalCloseTool
    ToolContext --> _Backend
    ToolContext --> ClientSideToolSpec
    ToolContext --> ClientSideTool
    ToolContext --> _FakeHarnessStream
    ToolContext --> _FakeHarnessClient
    ToolContext --> _FakeProcessManager
    ToolContext --> _RecordingProcessManager
    ToolContext --> _ContentCapturingProcessManager
    ToolContext --> _ContentCapturingHarnessClient
    ToolContext --> _StubTerminalInstance
    ToolContext --> _StubTerminalRegistry
    ToolContext --> _ModelSendResult
    ToolContext --> _GatedTwoTurnHarnessStream
    ToolContext --> _GatedTwoTurnHarnessClient
    ToolContext --> _Fixture
    BwrapSandboxBackend --> SeccompArgFilter
    BwrapSandboxBackend --> SeccompRule
    BwrapSandboxBackend --> OSEnvSandboxSpec
    BwrapSandboxBackend --> OSEnvSpec
    BwrapSandboxBackend --> SandboxBackend
    BwrapSandboxBackend --> ProbeResult
    ClaudeLauncher --> _AttachCallRecord
    ClaudeLauncher --> _ScriptedAttach
    ClaudeLauncher --> _HeaderRecordingAttach
    ClaudeLauncher --> _FakeTerminalServer
    ClaudeLauncher --> _AttachWSStub
    ClaudeLauncher --> _AttachWSContext
    ClaudeLauncher --> _WorkspaceActionTtyResult
    ClaudeLauncher --> _capture_warnings
    ClaudeNativeToolRelay --> OSEnvSandboxSpec
    ClaudeNativeToolRelay --> OSEnvSpec
    ClaudeNativeToolRelay --> OSEnvironment
    ClaudeNativeToolRelay --> Tool
    ClaudeNativeToolRelay --> ToolContext
    ClaudeNativeToolRelay --> _CodexNativeModelOptionsNotReady
    ClaudeNativeToolRelay --> _CodexNativeLaunchConfig
    ClaudeNativeToolRelay --> _PiNativeLaunchConfig
    ClaudeNativeToolRelay --> _KiroNativeLaunchConfig
    ClaudeNativeToolRelay --> _OpenCodeNativeLaunchConfig
    ClaudeNativeToolRelay --> ResolvedSpec
    ClaudeNativeToolRelay --> _SessionSnapshot
    ClaudeNativeToolRelay --> TurnDispatch
    ClaudeNativeToolRelay --> _ContextWindowOverflow
    ClaudeNativeToolRelay --> _SubagentWorkEntry
    ClaudeNativeToolRelay --> _SubagentDeliveryAck
    ClaudeNativeToolRelay --> _ChildParentMeta
    ClaudeNativeToolRelay --> _BodyRequest
    _JsonlReadResult --> OSEnvSandboxSpec
    _JsonlReadResult --> OSEnvSpec
    _JsonlReadResult --> OSEnvironment
    _JsonlReadResult --> Tool
    _JsonlReadResult --> ToolContext
    _JsonlRecord --> OSEnvSandboxSpec
    _JsonlRecord --> OSEnvSpec
    _JsonlRecord --> OSEnvironment
    _JsonlRecord --> Tool
    _JsonlRecord --> ToolContext
    MessageDeltaReadResult --> OSEnvSandboxSpec
    MessageDeltaReadResult --> OSEnvSpec
    MessageDeltaReadResult --> OSEnvironment
    MessageDeltaReadResult --> Tool
    MessageDeltaReadResult --> ToolContext
    _SlashCommandPayload --> OSEnvSandboxSpec
    _SlashCommandPayload --> OSEnvSpec
    _SlashCommandPayload --> OSEnvironment
    _SlashCommandPayload --> Tool
    _SlashCommandPayload --> ToolContext
    ClaudeNativeUcodeConfig --> AgentSpec
    ClaudeNativeUcodeConfig --> DatabricksAuth
    ClaudeNativeUcodeConfig --> _CodexNativeModelOptionsNotReady
    ClaudeNativeUcodeConfig --> _CodexNativeLaunchConfig
    ClaudeNativeUcodeConfig --> _PiNativeLaunchConfig
    ClaudeNativeUcodeConfig --> _KiroNativeLaunchConfig
    ClaudeNativeUcodeConfig --> _OpenCodeNativeLaunchConfig
    ClaudeNativeUcodeConfig --> ResolvedSpec
    ClaudeNativeUcodeConfig --> _SessionSnapshot
    ClaudeNativeUcodeConfig --> TurnDispatch
    ClaudeNativeUcodeConfig --> _ContextWindowOverflow
    ClaudeNativeUcodeConfig --> _SubagentWorkEntry
    ClaudeNativeUcodeConfig --> _SubagentDeliveryAck
    ClaudeNativeUcodeConfig --> _ChildParentMeta
    ClaudeNativeUcodeConfig --> _BodyRequest
    ClaudeNativeUcodeConfig --> _FakeMcpManager
    ClaudeNativeUcodeConfig --> _StreamHandle
    ClaudeNativeUcodeConfig --> _ReadTimeoutTransport
    ClaudeNativeUcodeConfig --> _McpToolsListServerClient
    ClaudeNativeUcodeConfig --> _FakeFileServerClient
    ClaudeNativeUcodeConfig --> _StreamErrorHarnessClient
    ClaudeNativeUcodeConfig --> _ErrHandle
    ClaudeNativeUcodeConfig --> _SignalOnCreatedHarnessClient
    ClaudeNativeUcodeConfig --> _Handle
    ClaudeNativeUcodeConfig --> _BlockingHarnessClient
    ClaudeNativeUcodeConfig --> _BlockingHandle
    ClaudeNativeUcodeConfig --> _HandshakeHarnessClient
    ClaudeNativeUcodeConfig --> _NativeBlockingHarnessClient
    ClaudeNativeUcodeConfig --> _GatedFileServerClient
    ClaudeNativeUcodeConfig --> _Resp
    ClaudeNativeUcodeConfig --> _FakeServerClient
    ClaudeNativeUcodeConfig --> _OverflowThenSuccessHarnessClient
    ClaudeNativeUcodeConfig --> _ForwardBlockingHarnessClient
    ClaudeNativeUcodeConfig --> _WakeRecordingServerClient
    ClaudeNativeUcodeConfig --> _EventRecordingServerClient
    ClaudeNativeUcodeConfig --> _RecordingCodexAppServerClient
    ClaudeNativeUcodeConfig --> _FakeOpenCodeCompactClient
    ClaudeNativeUcodeConfig --> _FakeOpenCodeCompactServer
    ClaudeNativeUcodeConfig --> _PublishedEvent
    ClaudeNativeUcodeConfig --> _AutoCreateScenario
    ClaudeNativeUcodeConfig --> _LabelsAndEmptyHistoryServerClient
    ClaudeNativeUcodeConfig --> _AntigravityAutoCreateScenario
    ClaudeNativeUcodeConfig --> _AntigravitySnapshotServerClient
    ClaudeNativeUcodeConfig --> _EnsureTerminalCase
    ClaudeNativeUcodeConfig --> _EnsureCodexTerminalCase
    ClaudeNativeUcodeConfig --> _RecordedPatch
    ClaudeNativeUcodeConfig --> _WakePost
    ClaudeNativeUcodeConfig --> _QueuedResponseServerClient
    ClaudeNativeUcodeConfig --> _LabelPatchRecordingServerClient
    ClaudeNativeUcodeConfig --> _ForwarderRun
    _ClaudeTerminalTmux --> AgentSpec
    _ClaudeTerminalTmux --> DatabricksAuth
    PreparedClaudeTerminal --> AgentSpec
    PreparedClaudeTerminal --> DatabricksAuth
    _ResumeWorkspaceActionOption --> AgentSpec
    _ResumeWorkspaceActionOption --> DatabricksAuth
    _ResumeWorkspaceActionPickerState --> AgentSpec
    _ResumeWorkspaceActionPickerState --> DatabricksAuth
    _SignalRestore --> AgentSpec
    _SignalRestore --> DatabricksAuth
    _CodexElicitationAdapter --> ErrorCode
    _CodexElicitationAdapter --> OmnigentError
    CodexElicitationRequest --> ErrorCode
    CodexElicitationRequest --> OmnigentError
    CodexAppServerClient --> _CodexAuthSource
    CodexAppServerClient --> _ResumeWorkspaceActionOption
    CodexAppServerClient --> LaunchedCodexTerminal
    CodexAppServerClient --> CodexNativeProcessOwnerLock
    CodexAppServerClient --> OmnigentError
    CodexAppServerClient --> DatabricksAuth
    CodexAppServerClient --> _ForwarderTarget
    CodexAppServerClient --> _PartialTextBuffer
    CodexAppServerClient --> _CodexTerminalError
    CodexAppServerClient --> _DeltaChunk
    CodexAppServerClient --> _DeltaFlushBarrier
    CodexAppServerClient --> _DeltaFlushStop
    CodexAppServerClient --> _PendingCodexElicitation
    CodexAppServerClient --> _ForwardHealth
    CodexAppServerClient --> _PostResult
    CodexAppServerClient --> _CodexNativeModelOptionsNotReady
    CodexAppServerClient --> _CodexNativeLaunchConfig
    CodexAppServerClient --> _PiNativeLaunchConfig
    CodexAppServerClient --> _KiroNativeLaunchConfig
    CodexAppServerClient --> _OpenCodeNativeLaunchConfig
    CodexAppServerClient --> ResolvedSpec
    CodexAppServerClient --> _SessionSnapshot
    CodexAppServerClient --> TurnDispatch
    CodexAppServerClient --> _ContextWindowOverflow
    CodexAppServerClient --> _SubagentWorkEntry
    CodexAppServerClient --> _SubagentDeliveryAck
    CodexAppServerClient --> _ChildParentMeta
    CodexAppServerClient --> _BodyRequest
    CodexNativeAppServer --> _CodexAuthSource
    CodexNativeAppServer --> _ResumeWorkspaceActionOption
    CodexNativeAppServer --> LaunchedCodexTerminal
    CodexNativeAppServer --> CodexNativeProcessOwnerLock
    CodexNativeAppServer --> OmnigentError
    CodexNativeAppServer --> DatabricksAuth
    CodexNativeAppServer --> _HelpProc
    CodexNativeBridgeState --> _CodexAuthSource
    CodexNativeBridgeState --> _ResumeWorkspaceActionOption
    CodexNativeBridgeState --> LaunchedCodexTerminal
    CodexNativeBridgeState --> _ForwarderTarget
    CodexNativeBridgeState --> _PartialTextBuffer
    CodexNativeBridgeState --> _CodexTerminalError
    CodexNativeBridgeState --> _DeltaChunk
    CodexNativeBridgeState --> _DeltaFlushBarrier
    CodexNativeBridgeState --> _DeltaFlushStop
    CodexNativeBridgeState --> _PendingCodexElicitation
    CodexNativeBridgeState --> _ForwardHealth
    CodexNativeBridgeState --> _PostResult
    CodexNativeBridgeState --> _CodexNativeModelOptionsNotReady
    CodexNativeBridgeState --> _CodexNativeLaunchConfig
    CodexNativeBridgeState --> _PiNativeLaunchConfig
    CodexNativeBridgeState --> _KiroNativeLaunchConfig
    CodexNativeBridgeState --> _OpenCodeNativeLaunchConfig
    CodexNativeBridgeState --> ResolvedSpec
    CodexNativeBridgeState --> _SessionSnapshot
    CodexNativeBridgeState --> TurnDispatch
    CodexNativeBridgeState --> _ContextWindowOverflow
    CodexNativeBridgeState --> _SubagentWorkEntry
    CodexNativeBridgeState --> _SubagentDeliveryAck
    CodexNativeBridgeState --> _ChildParentMeta
    CodexNativeBridgeState --> _BodyRequest
    CodexNativeBridgeState --> _CapturedSessionEvent
    CodexNativeBridgeState --> _DenyHttpxClient
    CodexNativeBridgeState --> _RaisesIfCalled
    _CodexAuthSource --> CodexAppServerClient
    _CodexAuthSource --> CodexNativeAppServer
    _CodexAuthSource --> CodexNativeBridgeState
    _CodexTerminalError --> RepostResult
    _CodexTerminalError --> CodexAppServerClient
    _CodexTerminalError --> CodexNativeBridgeState
    _DeltaChunk --> RepostResult
    _DeltaChunk --> CodexAppServerClient
    _DeltaChunk --> CodexNativeBridgeState
    _DeltaFlushBarrier --> RepostResult
    _DeltaFlushBarrier --> CodexAppServerClient
    _DeltaFlushBarrier --> CodexNativeBridgeState
    _DeltaFlushStop --> RepostResult
    _DeltaFlushStop --> CodexAppServerClient
    _DeltaFlushStop --> CodexNativeBridgeState
    _ForwarderTarget --> RepostResult
    _ForwarderTarget --> CodexAppServerClient
    _ForwarderTarget --> CodexNativeBridgeState
    _ForwardHealth --> RepostResult
    _ForwardHealth --> CodexAppServerClient
    _ForwardHealth --> CodexNativeBridgeState
    _PartialTextBuffer --> RepostResult
    _PartialTextBuffer --> CodexAppServerClient
    _PartialTextBuffer --> CodexNativeBridgeState
    _PendingCodexElicitation --> RepostResult
    _PendingCodexElicitation --> CodexAppServerClient
    _PendingCodexElicitation --> CodexNativeBridgeState
    _PostResult --> RepostResult
    _PostResult --> CodexAppServerClient
    _PostResult --> CodexNativeBridgeState
    LaunchedCodexTerminal --> CodexAppServerClient
    LaunchedCodexTerminal --> CodexNativeAppServer
    LaunchedCodexTerminal --> CodexNativeBridgeState
    CodexNativeProcessOwnerLock --> CodexAppServerClient
    CodexNativeProcessOwnerLock --> CodexNativeAppServer
    _ResumeWorkspaceActionOption --> CodexAppServerClient
    _ResumeWorkspaceActionOption --> CodexNativeAppServer
    _ResumeWorkspaceActionOption --> CodexNativeBridgeState
    CompactionResult --> CompactionConfig
    CompactionResult --> UcodeHarnessConfig
    CompactionResult --> _AsyncToolHandle
    CompactionResult --> _LoadedHistory
    _CompactionState --> CompactionConfig
    SummaryMetadata --> CompactionConfig
    SummaryMetadata --> UcodeHarnessConfig
    SummaryMetadata --> _AsyncToolHandle
    SummaryMetadata --> _LoadedHistory
    AdvisorConfig --> AdvisorVerdict
    AdvisorConfig --> DatabricksAuth
    AdvisorConfig --> _ScriptedJudge
    AdvisorConfig --> _PatchCapture
    AdvisorTurnResult --> _CodexNativeModelOptionsNotReady
    AdvisorTurnResult --> _CodexNativeLaunchConfig
    AdvisorTurnResult --> _PiNativeLaunchConfig
    AdvisorTurnResult --> _KiroNativeLaunchConfig
    AdvisorTurnResult --> _OpenCodeNativeLaunchConfig
    AdvisorTurnResult --> ResolvedSpec
    AdvisorTurnResult --> _SessionSnapshot
    AdvisorTurnResult --> TurnDispatch
    AdvisorTurnResult --> _ContextWindowOverflow
    AdvisorTurnResult --> _SubagentWorkEntry
    AdvisorTurnResult --> _SubagentDeliveryAck
    AdvisorTurnResult --> _ChildParentMeta
    AdvisorTurnResult --> _BodyRequest
    AdvisorTurnResult --> AdvisorVerdict
    AdvisorTurnResult --> DatabricksAuth
    Judge --> AdvisorVerdict
    Judge --> DatabricksAuth
    AdvisorVerdict --> AdvisorConfig
    AdvisorVerdict --> Judge
    AdvisorVerdict --> AdvisorTurnResult
    AdvisorVerdict --> _FakeMcpManager
    AdvisorVerdict --> _StreamHandle
    AdvisorVerdict --> _ReadTimeoutTransport
    AdvisorVerdict --> _McpToolsListServerClient
    AdvisorVerdict --> _FakeFileServerClient
    AdvisorVerdict --> _StreamErrorHarnessClient
    AdvisorVerdict --> _ErrHandle
    AdvisorVerdict --> _SignalOnCreatedHarnessClient
    AdvisorVerdict --> _Handle
    AdvisorVerdict --> _BlockingHarnessClient
    AdvisorVerdict --> _BlockingHandle
    AdvisorVerdict --> _HandshakeHarnessClient
    AdvisorVerdict --> _NativeBlockingHarnessClient
    AdvisorVerdict --> _GatedFileServerClient
    AdvisorVerdict --> _Resp
    AdvisorVerdict --> _FakeServerClient
    AdvisorVerdict --> _OverflowThenSuccessHarnessClient
    AdvisorVerdict --> _ForwardBlockingHarnessClient
    AdvisorVerdict --> _WakeRecordingServerClient
    AdvisorVerdict --> _EventRecordingServerClient
    AdvisorVerdict --> _RecordingCodexAppServerClient
    AdvisorVerdict --> _FakeOpenCodeCompactClient
    AdvisorVerdict --> _FakeOpenCodeCompactServer
    AdvisorVerdict --> _PublishedEvent
    AdvisorVerdict --> _AutoCreateScenario
    AdvisorVerdict --> _LabelsAndEmptyHistoryServerClient
    AdvisorVerdict --> _AntigravityAutoCreateScenario
    AdvisorVerdict --> _AntigravitySnapshotServerClient
    AdvisorVerdict --> _EnsureTerminalCase
    AdvisorVerdict --> _EnsureCodexTerminalCase
    AdvisorVerdict --> _RecordedPatch
    AdvisorVerdict --> _WakePost
    AdvisorVerdict --> _QueuedResponseServerClient
    AdvisorVerdict --> _LabelPatchRecordingServerClient
    AdvisorVerdict --> _ForwarderRun
    AdvisorVerdict --> _ScriptedJudge
    AdvisorVerdict --> _PatchCapture
    MaskedEntry --> ProbeResult
    AgentDef --> _OmnigentYamlLoader
    AgentDef --> FunctionPolicy
    AgentDef --> PromptPolicy
    AgentDef --> CancellableRun
    AgentDef --> CancellableRunner
    AgentDef --> Tool
    AgentDef --> FunctionTool
    AgentDef --> CancellableFunctionTool
    AgentDef --> MCPTool
    AgentDef --> AgentTool
    AgentDef --> SelfAgentTool
    AgentDef --> InheritedTool
    AgentDef --> SkillTool
    AgentDef --> HandoffTool
    AgentDef --> TestAgentDef
    AgentDef --> _FakeOSEnvironment
    AgentDef --> _CapturingResourceRegistry
    AgentDef --> _SwitchableServerClient
    AgentDef --> _Response
    AgentDef --> _StatusEdge
    AgentDef --> _WatcherCapture
    AgentDef --> _LaunchReturningRegistry
    AgentDef --> _StubCancellableRunner
    AgentDef --> _AgentDefYamlPair
    CredentialProxyEntry --> _ConfigYamlLoader
    CredentialProxyEntry --> _CredentialSourceModel
    CredentialProxyEntry --> _CredentialProxyItemModel
    CredentialProxyEntry --> _CapturingUpstream
    CredentialProxySpec --> OSEnvironment
    CredentialProxySpec --> CallerProcessOSEnvironment
    CredentialProxySpec --> ContainmentHandle
    CredentialProxySpec --> SandboxBackend
    CredentialProxySpec --> _ConfigYamlLoader
    CredentialProxySpec --> _CredentialSourceModel
    CredentialProxySpec --> _CredentialProxyItemModel
    CredentialProxySpec --> _CapturingUpstream
    CredentialSourceSpec --> _ConfigYamlLoader
    CredentialSourceSpec --> _CredentialSourceModel
    CredentialSourceSpec --> _CredentialProxyItemModel
    CredentialSourceSpec --> _CapturingUpstream
    ExecutorSpec --> _OmnigentYamlLoader
    ExecutorSpec --> FunctionPolicy
    ExecutorSpec --> PromptPolicy
    ExecutorSpec --> CancellableRun
    ExecutorSpec --> CancellableRunner
    ExecutorSpec --> Tool
    ExecutorSpec --> FunctionTool
    ExecutorSpec --> CancellableFunctionTool
    ExecutorSpec --> MCPTool
    ExecutorSpec --> AgentTool
    ExecutorSpec --> SelfAgentTool
    ExecutorSpec --> InheritedTool
    ExecutorSpec --> SkillTool
    ExecutorSpec --> HandoffTool
    ExecutorSpec --> _TestSleepRunner
    ExecutorSpec --> TestLoadFromDict
    ExecutorSpec --> TestLoadFromYAML
    ExecutorSpec --> TestInstructionsField
    ExecutorSpec --> _StubCancellableRunner
    ExecutorSpec --> _AgentDefYamlPair
    LabelSchemaRule --> _OmnigentYamlLoader
    MemoryConfig --> _OmnigentYamlLoader
    MemoryConfig --> TestAgentDef
    OSEnvSandboxSpec --> _JsonlRecord
    OSEnvSandboxSpec --> _JsonlReadResult
    OSEnvSandboxSpec --> MessageDeltaReadResult
    OSEnvSandboxSpec --> ClaudeNativeToolRelay
    OSEnvSandboxSpec --> _SlashCommandPayload
    OSEnvSandboxSpec --> BwrapSandboxBackend
    OSEnvSandboxSpec --> _OmnigentYamlLoader
    OSEnvSandboxSpec --> ContainmentHandle
    OSEnvSandboxSpec --> SandboxBackend
    OSEnvSandboxSpec --> _IdleDetector
    OSEnvSandboxSpec --> TerminalInstance
    OSEnvSandboxSpec --> TerminalCreateResult
    OSEnvSandboxSpec --> _JOBOBJECT_BASIC_LIMIT_INFORMATION
    OSEnvSandboxSpec --> _IO_COUNTERS
    OSEnvSandboxSpec --> _JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    OSEnvSandboxSpec --> _JobHandle
    OSEnvSandboxSpec --> WindowsJobObjectSandboxBackend
    OSEnvSandboxSpec --> _CodexNativeModelOptionsNotReady
    OSEnvSandboxSpec --> _CodexNativeLaunchConfig
    OSEnvSandboxSpec --> _PiNativeLaunchConfig
    OSEnvSandboxSpec --> _KiroNativeLaunchConfig
    OSEnvSandboxSpec --> _OpenCodeNativeLaunchConfig
    OSEnvSandboxSpec --> ResolvedSpec
    OSEnvSandboxSpec --> _SessionSnapshot
    OSEnvSandboxSpec --> TurnDispatch
    OSEnvSandboxSpec --> _ContextWindowOverflow
    OSEnvSandboxSpec --> _SubagentWorkEntry
    OSEnvSandboxSpec --> _SubagentDeliveryAck
    OSEnvSandboxSpec --> _ChildParentMeta
    OSEnvSandboxSpec --> _BodyRequest
    OSEnvSandboxSpec --> TerminalLifecycle
    OSEnvSandboxSpec --> TerminalExitEvent
    OSEnvSandboxSpec --> SessionResourceRegistry
    OSEnvSandboxSpec --> _ConfigYamlLoader
    OSEnvSandboxSpec --> _CredentialSourceModel
    OSEnvSandboxSpec --> _CredentialProxyItemModel
    OSEnvSandboxSpec --> ProbeResult
    OSEnvSandboxSpec --> _TestSleepRunner
    OSEnvSandboxSpec --> TestLoadFromDict
    OSEnvSandboxSpec --> TestLoadFromYAML
    OSEnvSandboxSpec --> TestInstructionsField
    OSEnvSandboxSpec --> TestForkYAMLLoading
    OSEnvSandboxSpec --> _SuccessfulProcess
    OSEnvSandboxSpec --> _ProcessWithStdout
    OSEnvSandboxSpec --> _CapturingUpstream
    OSEnvSandboxSpec --> _FakeMcpManager
    OSEnvSandboxSpec --> _StreamHandle
    OSEnvSandboxSpec --> _ReadTimeoutTransport
    OSEnvSandboxSpec --> _McpToolsListServerClient
    OSEnvSandboxSpec --> _FakeFileServerClient
    OSEnvSandboxSpec --> _StreamErrorHarnessClient
    OSEnvSandboxSpec --> _ErrHandle
    OSEnvSandboxSpec --> _SignalOnCreatedHarnessClient
    OSEnvSandboxSpec --> _Handle
    OSEnvSandboxSpec --> _BlockingHarnessClient
    OSEnvSandboxSpec --> _BlockingHandle
    OSEnvSandboxSpec --> _HandshakeHarnessClient
    OSEnvSandboxSpec --> _NativeBlockingHarnessClient
    OSEnvSandboxSpec --> _GatedFileServerClient
    OSEnvSandboxSpec --> _Resp
    OSEnvSandboxSpec --> _FakeServerClient
    OSEnvSandboxSpec --> _OverflowThenSuccessHarnessClient
    OSEnvSandboxSpec --> _ForwardBlockingHarnessClient
    OSEnvSandboxSpec --> _WakeRecordingServerClient
    OSEnvSandboxSpec --> _EventRecordingServerClient
    OSEnvSandboxSpec --> _RecordingCodexAppServerClient
    OSEnvSandboxSpec --> _FakeOpenCodeCompactClient
    OSEnvSandboxSpec --> _FakeOpenCodeCompactServer
    OSEnvSandboxSpec --> _PublishedEvent
    OSEnvSandboxSpec --> _AutoCreateScenario
    OSEnvSandboxSpec --> _LabelsAndEmptyHistoryServerClient
    OSEnvSandboxSpec --> _AntigravityAutoCreateScenario
    OSEnvSandboxSpec --> _AntigravitySnapshotServerClient
    OSEnvSandboxSpec --> _EnsureTerminalCase
    OSEnvSandboxSpec --> _EnsureCodexTerminalCase
    OSEnvSandboxSpec --> _RecordedPatch
    OSEnvSandboxSpec --> _WakePost
    OSEnvSandboxSpec --> _QueuedResponseServerClient
    OSEnvSandboxSpec --> _LabelPatchRecordingServerClient
    OSEnvSandboxSpec --> _ForwarderRun
    OSEnvSandboxSpec --> _ScriptedHarnessClient
    OSEnvSandboxSpec --> _FakeProcessManager
    OSEnvSandboxSpec --> _FakeOSEnvironment
    OSEnvSandboxSpec --> _FakeHarnessStream
    OSEnvSandboxSpec --> _FakeHarnessClient
    OSEnvSandboxSpec --> _FakeProcessManager
    OSEnvSandboxSpec --> _RecordingProcessManager
    OSEnvSandboxSpec --> _ContentCapturingProcessManager
    OSEnvSandboxSpec --> _ContentCapturingHarnessClient
    OSEnvSandboxSpec --> _StubTerminalInstance
    OSEnvSandboxSpec --> _StubTerminalRegistry
    OSEnvSandboxSpec --> _ModelSendResult
    OSEnvSandboxSpec --> _GatedTwoTurnHarnessStream
    OSEnvSandboxSpec --> _GatedTwoTurnHarnessClient
    OSEnvSandboxSpec --> _FakeOSEnvironment
    OSEnvSandboxSpec --> _CapturingResourceRegistry
    OSEnvSandboxSpec --> _SwitchableServerClient
    OSEnvSandboxSpec --> _Response
    OSEnvSandboxSpec --> _StatusEdge
    OSEnvSandboxSpec --> _WatcherCapture
    OSEnvSandboxSpec --> _LaunchReturningRegistry
    OSEnvSandboxSpec --> _StubCancellableRunner
    OSEnvSandboxSpec --> _AgentDefYamlPair
    OSEnvSpec --> _JsonlRecord
    OSEnvSpec --> _JsonlReadResult
    OSEnvSpec --> MessageDeltaReadResult
    OSEnvSpec --> ClaudeNativeToolRelay
    OSEnvSpec --> _SlashCommandPayload
    OSEnvSpec --> BwrapSandboxBackend
    OSEnvSpec --> _OmnigentYamlLoader
    OSEnvSpec --> OSEnvironment
    OSEnvSpec --> CallerProcessOSEnvironment
    OSEnvSpec --> ContainmentHandle
    OSEnvSpec --> SandboxBackend
    OSEnvSpec --> _IdleDetector
    OSEnvSpec --> TerminalInstance
    OSEnvSpec --> TerminalCreateResult
    OSEnvSpec --> CancellableRun
    OSEnvSpec --> CancellableRunner
    OSEnvSpec --> Tool
    OSEnvSpec --> FunctionTool
    OSEnvSpec --> CancellableFunctionTool
    OSEnvSpec --> MCPTool
    OSEnvSpec --> AgentTool
    OSEnvSpec --> SelfAgentTool
    OSEnvSpec --> InheritedTool
    OSEnvSpec --> SkillTool
    OSEnvSpec --> HandoffTool
    OSEnvSpec --> _JOBOBJECT_BASIC_LIMIT_INFORMATION
    OSEnvSpec --> _IO_COUNTERS
    OSEnvSpec --> _JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    OSEnvSpec --> _JobHandle
    OSEnvSpec --> WindowsJobObjectSandboxBackend
    OSEnvSpec --> _CodexNativeModelOptionsNotReady
    OSEnvSpec --> _CodexNativeLaunchConfig
    OSEnvSpec --> _PiNativeLaunchConfig
    OSEnvSpec --> _KiroNativeLaunchConfig
    OSEnvSpec --> _OpenCodeNativeLaunchConfig
    OSEnvSpec --> ResolvedSpec
    OSEnvSpec --> _SessionSnapshot
    OSEnvSpec --> TurnDispatch
    OSEnvSpec --> _ContextWindowOverflow
    OSEnvSpec --> _SubagentWorkEntry
    OSEnvSpec --> _SubagentDeliveryAck
    OSEnvSpec --> _ChildParentMeta
    OSEnvSpec --> _BodyRequest
    OSEnvSpec --> TerminalLifecycle
    OSEnvSpec --> TerminalExitEvent
    OSEnvSpec --> SessionResourceRegistry
    OSEnvSpec --> UcodeHarnessConfig
    OSEnvSpec --> _AsyncToolHandle
    OSEnvSpec --> _LoadedHistory
    OSEnvSpec --> _ConfigYamlLoader
    OSEnvSpec --> _CredentialSourceModel
    OSEnvSpec --> _CredentialProxyItemModel
    OSEnvSpec --> _OpenAIRetryAdapter
    OSEnvSpec --> _AnthropicRetryAdapter
    OSEnvSpec --> _ClaudeCliRetryAdapter
    OSEnvSpec --> _CodexCliRetryAdapter
    OSEnvSpec --> _PiRetryAdapter
    OSEnvSpec --> ApiKeyAuth
    OSEnvSpec --> DatabricksAuth
    OSEnvSpec --> ProviderAuth
    OSEnvSpec --> ExecutorSpec
    OSEnvSpec --> CompactionConfig
    OSEnvSpec --> LLMConfig
    OSEnvSpec --> ModalityConfig
    OSEnvSpec --> InteractionConfig
    OSEnvSpec --> BuiltinToolConfig
    OSEnvSpec --> SandboxConfig
    OSEnvSpec --> ToolsConfig
    OSEnvSpec --> MCPServerConfig
    OSEnvSpec --> ToolRuntime
    OSEnvSpec --> SharePolicy
    OSEnvSpec --> LocalToolInfo
    OSEnvSpec --> LabelDef
    OSEnvSpec --> GuardrailsSpec
    OSEnvSpec --> AgentSpec
    OSEnvSpec --> TerminalListEntry
    OSEnvSpec --> TerminalRegistry
    OSEnvSpec --> _CloseFailed
    OSEnvSpec --> _ValidatedLaunchArgs
    OSEnvSpec --> _ResolvedInstance
    OSEnvSpec --> SysTerminalLaunchTool
    OSEnvSpec --> SysTerminalCloseTool
    OSEnvSpec --> WebFetchTool
    OSEnvSpec --> ProbeResult
    OSEnvSpec --> _TestSleepRunner
    OSEnvSpec --> TestLoadFromDict
    OSEnvSpec --> TestLoadFromYAML
    OSEnvSpec --> TestInstructionsField
    OSEnvSpec --> TestForkYAMLLoading
    OSEnvSpec --> _SuccessfulProcess
    OSEnvSpec --> _ProcessWithStdout
    OSEnvSpec --> _CapturingUpstream
    OSEnvSpec --> _FakeMcpManager
    OSEnvSpec --> _StreamHandle
    OSEnvSpec --> _ReadTimeoutTransport
    OSEnvSpec --> _McpToolsListServerClient
    OSEnvSpec --> _FakeFileServerClient
    OSEnvSpec --> _StreamErrorHarnessClient
    OSEnvSpec --> _ErrHandle
    OSEnvSpec --> _SignalOnCreatedHarnessClient
    OSEnvSpec --> _Handle
    OSEnvSpec --> _BlockingHarnessClient
    OSEnvSpec --> _BlockingHandle
    OSEnvSpec --> _HandshakeHarnessClient
    OSEnvSpec --> _NativeBlockingHarnessClient
    OSEnvSpec --> _GatedFileServerClient
    OSEnvSpec --> _Resp
    OSEnvSpec --> _FakeServerClient
    OSEnvSpec --> _OverflowThenSuccessHarnessClient
    OSEnvSpec --> _ForwardBlockingHarnessClient
    OSEnvSpec --> _WakeRecordingServerClient
    OSEnvSpec --> _EventRecordingServerClient
    OSEnvSpec --> _RecordingCodexAppServerClient
    OSEnvSpec --> _FakeOpenCodeCompactClient
    OSEnvSpec --> _FakeOpenCodeCompactServer
    OSEnvSpec --> _PublishedEvent
    OSEnvSpec --> _AutoCreateScenario
    OSEnvSpec --> _LabelsAndEmptyHistoryServerClient
    OSEnvSpec --> _AntigravityAutoCreateScenario
    OSEnvSpec --> _AntigravitySnapshotServerClient
    OSEnvSpec --> _EnsureTerminalCase
    OSEnvSpec --> _EnsureCodexTerminalCase
    OSEnvSpec --> _RecordedPatch
    OSEnvSpec --> _WakePost
    OSEnvSpec --> _QueuedResponseServerClient
    OSEnvSpec --> _LabelPatchRecordingServerClient
    OSEnvSpec --> _ForwarderRun
    OSEnvSpec --> _ScriptedHarnessClient
    OSEnvSpec --> _FakeProcessManager
    OSEnvSpec --> _FakeOSEnvironment
    OSEnvSpec --> _FakeHarnessStream
    OSEnvSpec --> _FakeHarnessClient
    OSEnvSpec --> _FakeProcessManager
    OSEnvSpec --> _RecordingProcessManager
    OSEnvSpec --> _ContentCapturingProcessManager
    OSEnvSpec --> _ContentCapturingHarnessClient
    OSEnvSpec --> _StubTerminalInstance
    OSEnvSpec --> _StubTerminalRegistry
    OSEnvSpec --> _ModelSendResult
    OSEnvSpec --> _GatedTwoTurnHarnessStream
    OSEnvSpec --> _GatedTwoTurnHarnessClient
    OSEnvSpec --> _FakeOSEnvironment
    OSEnvSpec --> _CapturingResourceRegistry
    OSEnvSpec --> _SwitchableServerClient
    OSEnvSpec --> _Response
    OSEnvSpec --> _StatusEdge
    OSEnvSpec --> _WatcherCapture
    OSEnvSpec --> _LaunchReturningRegistry
    OSEnvSpec --> _StubCancellableRunner
    OSEnvSpec --> _AgentDefYamlPair
    ParamDef --> _OmnigentYamlLoader
    TerminalEnvSpec --> _OmnigentYamlLoader
    TerminalEnvSpec --> _IdleDetector
    TerminalEnvSpec --> TerminalInstance
    TerminalEnvSpec --> TerminalCreateResult
    TerminalEnvSpec --> _CodexNativeModelOptionsNotReady
    TerminalEnvSpec --> _CodexNativeLaunchConfig
    TerminalEnvSpec --> _PiNativeLaunchConfig
    TerminalEnvSpec --> _KiroNativeLaunchConfig
    TerminalEnvSpec --> _OpenCodeNativeLaunchConfig
    TerminalEnvSpec --> ResolvedSpec
    TerminalEnvSpec --> _SessionSnapshot
    TerminalEnvSpec --> TurnDispatch
    TerminalEnvSpec --> _ContextWindowOverflow
    TerminalEnvSpec --> _SubagentWorkEntry
    TerminalEnvSpec --> _SubagentDeliveryAck
    TerminalEnvSpec --> _ChildParentMeta
    TerminalEnvSpec --> _BodyRequest
    TerminalEnvSpec --> _ConfigYamlLoader
    TerminalEnvSpec --> _CredentialSourceModel
    TerminalEnvSpec --> _CredentialProxyItemModel
    TerminalEnvSpec --> _OpenAIRetryAdapter
    TerminalEnvSpec --> _AnthropicRetryAdapter
    TerminalEnvSpec --> _ClaudeCliRetryAdapter
    TerminalEnvSpec --> _CodexCliRetryAdapter
    TerminalEnvSpec --> _PiRetryAdapter
    TerminalEnvSpec --> ApiKeyAuth
    TerminalEnvSpec --> DatabricksAuth
    TerminalEnvSpec --> ProviderAuth
    TerminalEnvSpec --> ExecutorSpec
    TerminalEnvSpec --> CompactionConfig
    TerminalEnvSpec --> LLMConfig
    TerminalEnvSpec --> ModalityConfig
    TerminalEnvSpec --> InteractionConfig
    TerminalEnvSpec --> BuiltinToolConfig
    TerminalEnvSpec --> SandboxConfig
    TerminalEnvSpec --> ToolsConfig
    TerminalEnvSpec --> MCPServerConfig
    TerminalEnvSpec --> ToolRuntime
    TerminalEnvSpec --> SharePolicy
    TerminalEnvSpec --> LocalToolInfo
    TerminalEnvSpec --> LabelDef
    TerminalEnvSpec --> GuardrailsSpec
    TerminalEnvSpec --> AgentSpec
    TerminalEnvSpec --> TerminalListEntry
    TerminalEnvSpec --> TerminalRegistry
    TerminalEnvSpec --> _CloseFailed
    TerminalEnvSpec --> _ValidatedLaunchArgs
    TerminalEnvSpec --> _ResolvedInstance
    TerminalEnvSpec --> SysTerminalLaunchTool
    TerminalEnvSpec --> SysTerminalCloseTool
    TerminalEnvSpec --> _SuccessfulProcess
    TerminalEnvSpec --> _ProcessWithStdout
    TerminalEnvSpec --> _StubResourceRegistry
    TerminalEnvSpec --> _RelayEnv
    TerminalEnvSpec --> _FakeOSEnvironment
    TerminalEnvSpec --> _FakeHarnessStream
    TerminalEnvSpec --> _FakeHarnessClient
    TerminalEnvSpec --> _FakeProcessManager
    TerminalEnvSpec --> _RecordingProcessManager
    TerminalEnvSpec --> _ContentCapturingProcessManager
    TerminalEnvSpec --> _ContentCapturingHarnessClient
    TerminalEnvSpec --> _StubTerminalInstance
    TerminalEnvSpec --> _StubTerminalRegistry
    TerminalEnvSpec --> _ModelSendResult
    TerminalEnvSpec --> _GatedTwoTurnHarnessStream
    TerminalEnvSpec --> _GatedTwoTurnHarnessClient
    TerminalEnvSpec --> _FakeOSEnvironment
    TerminalEnvSpec --> _CapturingResourceRegistry
    TerminalEnvSpec --> _SwitchableServerClient
    TerminalEnvSpec --> _Response
    TerminalEnvSpec --> _StatusEdge
    TerminalEnvSpec --> _WatcherCapture
    TerminalEnvSpec --> _LaunchReturningRegistry
    TerminalEnvSpec --> _ConversationStore
    TerminalEnvSpec --> _FakeRunnerClient
    TerminalEnvSpec --> _RoutedRunner
    TerminalEnvSpec --> _FakeRunnerRouter
    TerminalEnvSpec --> _InMemoryArtifactStore
    TerminalEnvSpec --> _FakeStreamCtx
    TerminalEnvSpec --> _FakeStreamingRunnerClient
    TerminalEnvSpec --> _ScriptedStreamCtx
    TerminalEnvSpec --> _ScriptedStreamingRunnerClient
    TerminalEnvSpec --> _StreamAndCaptureRunnerClient
    TerminalEnvSpec --> _SubagentTerminalStore
    TerminalEnvSpec --> _StubCancellableRunner
    TerminalEnvSpec --> _AgentDefYamlPair
    CallerProcessFilesystem --> _CodexNativeModelOptionsNotReady
    CallerProcessFilesystem --> _CodexNativeLaunchConfig
    CallerProcessFilesystem --> _PiNativeLaunchConfig
    CallerProcessFilesystem --> _KiroNativeLaunchConfig
    CallerProcessFilesystem --> _OpenCodeNativeLaunchConfig
    CallerProcessFilesystem --> ResolvedSpec
    CallerProcessFilesystem --> _SessionSnapshot
    CallerProcessFilesystem --> TurnDispatch
    CallerProcessFilesystem --> _ContextWindowOverflow
    CallerProcessFilesystem --> _SubagentWorkEntry
    CallerProcessFilesystem --> _SubagentDeliveryAck
    CallerProcessFilesystem --> _ChildParentMeta
    CallerProcessFilesystem --> _BodyRequest
    CallerProcessFilesystem --> DeleteFilesystemResult
    CallerProcessFilesystem --> DirectoryNotEmpty
    CallerProcessFilesystem --> EditFileResult
    CallerProcessFilesystem --> FileContent
    CallerProcessFilesystem --> FilesystemEntry
    CallerProcessFilesystem --> FilesystemPathNotFound
    CallerProcessFilesystem --> InvalidPath
    CallerProcessFilesystem --> TextEditRequest
    CallerProcessFilesystem --> WriteFileResult
    CallerProcessFilesystem --> PagedList
    CallerProcessFilesystem --> OSEnvironment
    CallerProcessFilesystem --> TextReplacement
    DeleteFilesystemResult --> CallerProcessFilesystem
    ResourceError <|-- DirectoryNotEmpty
    DirectoryNotEmpty --> _CodexNativeModelOptionsNotReady
    DirectoryNotEmpty --> _CodexNativeLaunchConfig
    DirectoryNotEmpty --> _PiNativeLaunchConfig
    DirectoryNotEmpty --> _KiroNativeLaunchConfig
    DirectoryNotEmpty --> _OpenCodeNativeLaunchConfig
    DirectoryNotEmpty --> ResolvedSpec
    DirectoryNotEmpty --> _SessionSnapshot
    DirectoryNotEmpty --> TurnDispatch
    DirectoryNotEmpty --> _ContextWindowOverflow
    DirectoryNotEmpty --> _SubagentWorkEntry
    DirectoryNotEmpty --> _SubagentDeliveryAck
    DirectoryNotEmpty --> _ChildParentMeta
    DirectoryNotEmpty --> _BodyRequest
    DirectoryNotEmpty --> CallerProcessFilesystem
    EditFileResult --> CallerProcessFilesystem
    FileContent --> CallerProcessFilesystem
    FilesystemEntry --> _CodexNativeModelOptionsNotReady
    FilesystemEntry --> _CodexNativeLaunchConfig
    FilesystemEntry --> _PiNativeLaunchConfig
    FilesystemEntry --> _KiroNativeLaunchConfig
    FilesystemEntry --> _OpenCodeNativeLaunchConfig
    FilesystemEntry --> ResolvedSpec
    FilesystemEntry --> _SessionSnapshot
    FilesystemEntry --> TurnDispatch
    FilesystemEntry --> _ContextWindowOverflow
    FilesystemEntry --> _SubagentWorkEntry
    FilesystemEntry --> _SubagentDeliveryAck
    FilesystemEntry --> _ChildParentMeta
    FilesystemEntry --> _BodyRequest
    FilesystemEntry --> CallerProcessFilesystem
    ResourceError <|-- FilesystemPathNotFound
    FilesystemPathNotFound --> _CodexNativeModelOptionsNotReady
    FilesystemPathNotFound --> _CodexNativeLaunchConfig
    FilesystemPathNotFound --> _PiNativeLaunchConfig
    FilesystemPathNotFound --> _KiroNativeLaunchConfig
    FilesystemPathNotFound --> _OpenCodeNativeLaunchConfig
    FilesystemPathNotFound --> ResolvedSpec
    FilesystemPathNotFound --> _SessionSnapshot
    FilesystemPathNotFound --> TurnDispatch
    FilesystemPathNotFound --> _ContextWindowOverflow
    FilesystemPathNotFound --> _SubagentWorkEntry
    FilesystemPathNotFound --> _SubagentDeliveryAck
    FilesystemPathNotFound --> _ChildParentMeta
    FilesystemPathNotFound --> _BodyRequest
    FilesystemPathNotFound --> CallerProcessFilesystem
    ResourceError <|-- FileTooLarge
    FileTooLarge --> _CodexNativeModelOptionsNotReady
    FileTooLarge --> _CodexNativeLaunchConfig
    FileTooLarge --> _PiNativeLaunchConfig
    FileTooLarge --> _KiroNativeLaunchConfig
    FileTooLarge --> _OpenCodeNativeLaunchConfig
    FileTooLarge --> ResolvedSpec
    FileTooLarge --> _SessionSnapshot
    FileTooLarge --> TurnDispatch
    FileTooLarge --> _ContextWindowOverflow
    FileTooLarge --> _SubagentWorkEntry
    FileTooLarge --> _SubagentDeliveryAck
    FileTooLarge --> _ChildParentMeta
    FileTooLarge --> _BodyRequest
    ResourceError <|-- InvalidPath
    InvalidPath --> _CodexNativeModelOptionsNotReady
    InvalidPath --> _CodexNativeLaunchConfig
    InvalidPath --> _PiNativeLaunchConfig
    InvalidPath --> _KiroNativeLaunchConfig
    InvalidPath --> _OpenCodeNativeLaunchConfig
    InvalidPath --> ResolvedSpec
    InvalidPath --> _SessionSnapshot
    InvalidPath --> TurnDispatch
    InvalidPath --> _ContextWindowOverflow
    InvalidPath --> _SubagentWorkEntry
    InvalidPath --> _SubagentDeliveryAck
    InvalidPath --> _ChildParentMeta
    InvalidPath --> _BodyRequest
    InvalidPath --> CallerProcessFilesystem
    ResourceError <|-- PermissionDenied
    InvalidPath <|-- ResourceError
    ResourceNotFound <|-- ResourceError
    FilesystemPathNotFound <|-- ResourceError
    DirectoryNotEmpty <|-- ResourceError
    FileTooLarge <|-- ResourceError
    UnsupportedMediaType <|-- ResourceError
    PermissionDenied <|-- ResourceError
    ResourceError --> _CodexNativeModelOptionsNotReady
    ResourceError --> _CodexNativeLaunchConfig
    ResourceError --> _PiNativeLaunchConfig
    ResourceError --> _KiroNativeLaunchConfig
    ResourceError --> _OpenCodeNativeLaunchConfig
    ResourceError --> ResolvedSpec
    ResourceError --> _SessionSnapshot
    ResourceError --> TurnDispatch
    ResourceError --> _ContextWindowOverflow
    ResourceError --> _SubagentWorkEntry
    ResourceError --> _SubagentDeliveryAck
    ResourceError --> _ChildParentMeta
    ResourceError --> _BodyRequest
    ResourceError <|-- ResourceNotFound
    TextEditRequest --> _CodexNativeModelOptionsNotReady
    TextEditRequest --> _CodexNativeLaunchConfig
    TextEditRequest --> _PiNativeLaunchConfig
    TextEditRequest --> _KiroNativeLaunchConfig
    TextEditRequest --> _OpenCodeNativeLaunchConfig
    TextEditRequest --> ResolvedSpec
    TextEditRequest --> _SessionSnapshot
    TextEditRequest --> TurnDispatch
    TextEditRequest --> _ContextWindowOverflow
    TextEditRequest --> _SubagentWorkEntry
    TextEditRequest --> _SubagentDeliveryAck
    TextEditRequest --> _ChildParentMeta
    TextEditRequest --> _BodyRequest
    TextEditRequest --> CallerProcessFilesystem
    TextReplacement --> CallerProcessFilesystem
    ResourceError <|-- UnsupportedMediaType
    UnsupportedMediaType --> _CodexNativeModelOptionsNotReady
    UnsupportedMediaType --> _CodexNativeLaunchConfig
    UnsupportedMediaType --> _PiNativeLaunchConfig
    UnsupportedMediaType --> _KiroNativeLaunchConfig
    UnsupportedMediaType --> _OpenCodeNativeLaunchConfig
    UnsupportedMediaType --> ResolvedSpec
    UnsupportedMediaType --> _SessionSnapshot
    UnsupportedMediaType --> TurnDispatch
    UnsupportedMediaType --> _ContextWindowOverflow
    UnsupportedMediaType --> _SubagentWorkEntry
    UnsupportedMediaType --> _SubagentDeliveryAck
    UnsupportedMediaType --> _ChildParentMeta
    UnsupportedMediaType --> _BodyRequest
    WriteFileResult --> CallerProcessFilesystem
    ErrorCode --> GeminiAdapter
    ErrorCode --> FamilyConfig
    ErrorCode --> ResolvedCredential
    ErrorCode --> _CodexNativeModelOptionsNotReady
    ErrorCode --> _CodexNativeLaunchConfig
    ErrorCode --> _PiNativeLaunchConfig
    ErrorCode --> _KiroNativeLaunchConfig
    ErrorCode --> _OpenCodeNativeLaunchConfig
    ErrorCode --> ResolvedSpec
    ErrorCode --> _SessionSnapshot
    ErrorCode --> TurnDispatch
    ErrorCode --> _ContextWindowOverflow
    ErrorCode --> _SubagentWorkEntry
    ErrorCode --> _SubagentDeliveryAck
    ErrorCode --> _ChildParentMeta
    ErrorCode --> _BodyRequest
    ErrorCode --> UcodeHarnessConfig
    ErrorCode --> _AsyncToolHandle
    ErrorCode --> _LoadedHistory
    ErrorCode --> ApprovalEvent
    ErrorCode --> SessionAccess
    ErrorCode --> _CodexElicitationAdapter
    ErrorCode --> CodexElicitationRequest
    ErrorCode --> _ConfigYamlLoader
    ErrorCode --> _CredentialSourceModel
    ErrorCode --> _CredentialProxyItemModel
    ErrorCode --> _UCFunctionSchemaTool
    ErrorCode --> ToolManager
    ErrorCode --> _FakeHarnessStream
    ErrorCode --> _FakeHarnessClient
    ErrorCode --> _FakeProcessManager
    ErrorCode --> _RecordingProcessManager
    ErrorCode --> _ContentCapturingProcessManager
    ErrorCode --> _ContentCapturingHarnessClient
    ErrorCode --> _StubTerminalInstance
    ErrorCode --> _StubTerminalRegistry
    ErrorCode --> _ModelSendResult
    ErrorCode --> _GatedTwoTurnHarnessStream
    ErrorCode --> _GatedTwoTurnHarnessClient
    ErrorCode --> _ConversationStore
    ErrorCode --> _FakeRunnerClient
    ErrorCode --> _RoutedRunner
    ErrorCode --> _FakeRunnerRouter
    ErrorCode --> _InMemoryArtifactStore
    ErrorCode --> _FakeStreamCtx
    ErrorCode --> _FakeStreamingRunnerClient
    ErrorCode --> _ScriptedStreamCtx
    ErrorCode --> _ScriptedStreamingRunnerClient
    ErrorCode --> _StreamAndCaptureRunnerClient
    ErrorCode --> _SubagentTerminalStore
    OmnigentError <|-- FileNotFoundError
    FileNotFoundError <|-- OmnigentError
    OmnigentError --> CodexAppServerClient
    OmnigentError --> CodexNativeAppServer
    OmnigentError --> ModelEntry
    OmnigentError --> ModelListing
    OmnigentError --> ResolvedModelProvider
    OmnigentError --> GeminiAdapter
    OmnigentError --> FamilyConfig
    OmnigentError --> ResolvedCredential
    OmnigentError --> _CodexNativeModelOptionsNotReady
    OmnigentError --> _CodexNativeLaunchConfig
    OmnigentError --> _PiNativeLaunchConfig
    OmnigentError --> _KiroNativeLaunchConfig
    OmnigentError --> _OpenCodeNativeLaunchConfig
    OmnigentError --> ResolvedSpec
    OmnigentError --> _SessionSnapshot
    OmnigentError --> TurnDispatch
    OmnigentError --> _ContextWindowOverflow
    OmnigentError --> _SubagentWorkEntry
    OmnigentError --> _SubagentDeliveryAck
    OmnigentError --> _ChildParentMeta
    OmnigentError --> _BodyRequest
    OmnigentError --> UcodeHarnessConfig
    OmnigentError --> _AsyncToolHandle
    OmnigentError --> _LoadedHistory
    OmnigentError --> ApprovalEvent
    OmnigentError --> SessionAccess
    OmnigentError --> _CodexElicitationAdapter
    OmnigentError --> CodexElicitationRequest
    OmnigentError --> _ConfigYamlLoader
    OmnigentError --> _CredentialSourceModel
    OmnigentError --> _CredentialProxyItemModel
    OmnigentError --> SkillSourceContext
    OmnigentError --> _UCFunctionSchemaTool
    OmnigentError --> ToolManager
    OmnigentError --> _FakeHarnessStream
    OmnigentError --> _FakeHarnessClient
    OmnigentError --> _FakeProcessManager
    OmnigentError --> _RecordingProcessManager
    OmnigentError --> _ContentCapturingProcessManager
    OmnigentError --> _ContentCapturingHarnessClient
    OmnigentError --> _StubTerminalInstance
    OmnigentError --> _StubTerminalRegistry
    OmnigentError --> _ModelSendResult
    OmnigentError --> _GatedTwoTurnHarnessStream
    OmnigentError --> _GatedTwoTurnHarnessClient
    OmnigentError --> TestStringListAnswer
    OmnigentError --> TestCodexCommandPreview
    OmnigentError --> TestJsonPreview
    OmnigentError --> TestExecpolicyAmendment
    OmnigentError --> _StubLoadedSpec
    OmnigentError --> _StubLoadedAgent
    OmnigentError --> _ConversationStore
    OmnigentError --> _FakeRunnerClient
    OmnigentError --> _RoutedRunner
    OmnigentError --> _FakeRunnerRouter
    OmnigentError --> _InMemoryArtifactStore
    OmnigentError --> _FakeStreamCtx
    OmnigentError --> _FakeStreamingRunnerClient
    OmnigentError --> _ScriptedStreamCtx
    OmnigentError --> _ScriptedStreamingRunnerClient
    OmnigentError --> _StreamAndCaptureRunnerClient
    OmnigentError --> _SubagentTerminalStore
    OmnigentError --> _StubAgentStore
    OmnigentError --> _StubCancellableRunner
    OmnigentError --> _AgentDefYamlPair
    GitStatusUnavailable --> _CodexNativeModelOptionsNotReady
    GitStatusUnavailable --> _CodexNativeLaunchConfig
    GitStatusUnavailable --> _PiNativeLaunchConfig
    GitStatusUnavailable --> _KiroNativeLaunchConfig
    GitStatusUnavailable --> _OpenCodeNativeLaunchConfig
    GitStatusUnavailable --> ResolvedSpec
    GitStatusUnavailable --> _SessionSnapshot
    GitStatusUnavailable --> TurnDispatch
    GitStatusUnavailable --> _ContextWindowOverflow
    GitStatusUnavailable --> _SubagentWorkEntry
    GitStatusUnavailable --> _SubagentDeliveryAck
    GitStatusUnavailable --> _ChildParentMeta
    GitStatusUnavailable --> _BodyRequest
    GeminiAdapter --> ErrorCode
    GeminiAdapter --> OmnigentError
    GeminiAdapter --> BaseAdapter
    DispatchCapability --> SessionResourceRegistry
    DispatchCapability --> HarnessProcessManager
    DispatchCapability --> ToolContext
    CodexGoalRunner --> _CodexNativeModelOptionsNotReady
    CodexGoalRunner --> _CodexNativeLaunchConfig
    CodexGoalRunner --> _PiNativeLaunchConfig
    CodexGoalRunner --> _KiroNativeLaunchConfig
    CodexGoalRunner --> _OpenCodeNativeLaunchConfig
    CodexGoalRunner --> ResolvedSpec
    CodexGoalRunner --> _SessionSnapshot
    CodexGoalRunner --> TurnDispatch
    CodexGoalRunner --> _ContextWindowOverflow
    CodexGoalRunner --> _SubagentWorkEntry
    CodexGoalRunner --> _SubagentDeliveryAck
    CodexGoalRunner --> _ChildParentMeta
    CodexGoalRunner --> _BodyRequest
    NullServerClient --> OSEnvironment
    NullServerClient --> TerminalInstance
    NullServerClient --> _FakeMcpManager
    NullServerClient --> _StreamHandle
    NullServerClient --> _ReadTimeoutTransport
    NullServerClient --> _McpToolsListServerClient
    NullServerClient --> _FakeFileServerClient
    NullServerClient --> _StreamErrorHarnessClient
    NullServerClient --> _ErrHandle
    NullServerClient --> _SignalOnCreatedHarnessClient
    NullServerClient --> _Handle
    NullServerClient --> _BlockingHarnessClient
    NullServerClient --> _BlockingHandle
    NullServerClient --> _HandshakeHarnessClient
    NullServerClient --> _NativeBlockingHarnessClient
    NullServerClient --> _GatedFileServerClient
    NullServerClient --> _Resp
    NullServerClient --> _FakeServerClient
    NullServerClient --> _OverflowThenSuccessHarnessClient
    NullServerClient --> _ForwardBlockingHarnessClient
    NullServerClient --> _WakeRecordingServerClient
    NullServerClient --> _EventRecordingServerClient
    NullServerClient --> _RecordingCodexAppServerClient
    NullServerClient --> _FakeOpenCodeCompactClient
    NullServerClient --> _FakeOpenCodeCompactServer
    NullServerClient --> _PublishedEvent
    NullServerClient --> _AutoCreateScenario
    NullServerClient --> _LabelsAndEmptyHistoryServerClient
    NullServerClient --> _AntigravityAutoCreateScenario
    NullServerClient --> _AntigravitySnapshotServerClient
    NullServerClient --> _EnsureTerminalCase
    NullServerClient --> _EnsureCodexTerminalCase
    NullServerClient --> _RecordedPatch
    NullServerClient --> _WakePost
    NullServerClient --> _QueuedResponseServerClient
    NullServerClient --> _LabelPatchRecordingServerClient
    NullServerClient --> _ForwarderRun
    NullServerClient --> _StubResourceRegistry
    NullServerClient --> _RelayEnv
    NullServerClient --> _ScriptedHarnessClient
    NullServerClient --> _FakeProcessManager
    NullServerClient --> _FakeOSEnvironment
    NullServerClient --> _FakeHarnessStream
    NullServerClient --> _FakeHarnessClient
    NullServerClient --> _FakeProcessManager
    NullServerClient --> _RecordingProcessManager
    NullServerClient --> _ContentCapturingProcessManager
    NullServerClient --> _ContentCapturingHarnessClient
    NullServerClient --> _StubTerminalInstance
    NullServerClient --> _StubTerminalRegistry
    NullServerClient --> _ModelSendResult
    NullServerClient --> _GatedTwoTurnHarnessStream
    NullServerClient --> _GatedTwoTurnHarnessClient
    NullServerClient --> _FakeOSEnvironment
    NullServerClient --> _CapturingResourceRegistry
    NullServerClient --> _SwitchableServerClient
    NullServerClient --> _Response
    NullServerClient --> _StatusEdge
    NullServerClient --> _WatcherCapture
    NullServerClient --> _LaunchReturningRegistry
    _Response --> OSEnvironment
    _Response --> TerminalInstance
    RunningFlagTerminalInstance --> OSEnvironment
    RunningFlagTerminalInstance --> TerminalInstance
    ClientSideTool --> Tool
    ClientSideTool --> ToolContext
    ClientSideToolSpec --> Tool
    ClientSideToolSpec --> ToolContext
    SysListModelsTool --> AgentSpec
    SysListModelsTool --> Tool
    SysListModelsTool --> ToolContext
    _OmnigentYamlLoader --> AgentDef
    _OmnigentYamlLoader --> ExecutorSpec
    _OmnigentYamlLoader --> MemoryConfig
    _OmnigentYamlLoader --> OSEnvSandboxSpec
    _OmnigentYamlLoader --> OSEnvSpec
    _OmnigentYamlLoader --> ParamDef
    _OmnigentYamlLoader --> TerminalEnvSpec
    _OmnigentYamlLoader --> FunctionPolicy
    _OmnigentYamlLoader --> PromptPolicy
    _OmnigentYamlLoader --> AgentTool
    _OmnigentYamlLoader --> CancellableFunctionTool
    _OmnigentYamlLoader --> FunctionTool
    _OmnigentYamlLoader --> HandoffTool
    _OmnigentYamlLoader --> InheritedTool
    _OmnigentYamlLoader --> MCPTool
    _OmnigentYamlLoader --> SelfAgentTool
    _OmnigentYamlLoader --> SkillTool
    _OmnigentYamlLoader --> Tool
    _OmnigentYamlLoader --> LabelSchemaRule
    LocalCallableTool --> LocalToolInfo
    LocalCallableTool --> Tool
    LocalCallableTool --> ToolContext
    LocalCallableTool --> ToolRuntime
    _DiscoveredTool --> LocalToolInfo
    _DiscoveredTool --> SandboxConfig
    _DiscoveredTool --> Tool
    _DiscoveredTool --> ToolContext
    LocalPythonTool --> LocalToolInfo
    LocalPythonTool --> SandboxConfig
    LocalPythonTool --> Tool
    LocalPythonTool --> ToolContext
    LocalToolLoadError --> LocalToolInfo
    LocalToolLoadError --> SandboxConfig
    LocalToolLoadError --> Tool
    LocalToolLoadError --> ToolContext
    ToolManager --> _CodexNativeModelOptionsNotReady
    ToolManager --> _CodexNativeLaunchConfig
    ToolManager --> _PiNativeLaunchConfig
    ToolManager --> _KiroNativeLaunchConfig
    ToolManager --> _OpenCodeNativeLaunchConfig
    ToolManager --> ResolvedSpec
    ToolManager --> _SessionSnapshot
    ToolManager --> TurnDispatch
    ToolManager --> _ContextWindowOverflow
    ToolManager --> _SubagentWorkEntry
    ToolManager --> _SubagentDeliveryAck
    ToolManager --> _ChildParentMeta
    ToolManager --> _BodyRequest
    ToolManager --> ErrorCode
    ToolManager --> OmnigentError
    ToolManager --> OSEnvironment
    ToolManager --> SharePolicy
    ToolManager --> ToolRuntime
    ToolManager --> Tool
    ToolManager --> ToolContext
    ToolManager --> WebFetchTool
    ToolManager --> SysTerminalCloseTool
    ToolManager --> SysTerminalLaunchTool
    ToolManager --> _FakeHarnessStream
    ToolManager --> _FakeHarnessClient
    ToolManager --> _FakeProcessManager
    ToolManager --> _RecordingProcessManager
    ToolManager --> _ContentCapturingProcessManager
    ToolManager --> _ContentCapturingHarnessClient
    ToolManager --> _StubTerminalInstance
    ToolManager --> _StubTerminalRegistry
    ToolManager --> _ModelSendResult
    ToolManager --> _GatedTwoTurnHarnessStream
    ToolManager --> _GatedTwoTurnHarnessClient
    _UCFunctionSchemaTool --> ErrorCode
    _UCFunctionSchemaTool --> OmnigentError
    _UCFunctionSchemaTool --> OSEnvironment
    _UCFunctionSchemaTool --> SharePolicy
    _UCFunctionSchemaTool --> ToolRuntime
    _UCFunctionSchemaTool --> Tool
    _UCFunctionSchemaTool --> ToolContext
    _UCFunctionSchemaTool --> WebFetchTool
    _UCFunctionSchemaTool --> SysTerminalCloseTool
    _UCFunctionSchemaTool --> SysTerminalLaunchTool
    _CircuitBreaker --> MCPServerConfig
    McpSchemasResult --> AgentSpec
    McpSchemasResult --> MCPServerConfig
    McpSchemasResult --> McpServerConnection
    McpSchemasResult --> ProxyMcpManager
    McpSchemasResult --> _McpServerEntry
    McpSchemasResult --> _AgentEntry
    McpSchemasResult --> McpToolEntry
    McpSchemasResult --> _FakeMcpManager
    McpSchemasResult --> _StreamHandle
    McpSchemasResult --> _ReadTimeoutTransport
    McpSchemasResult --> _McpToolsListServerClient
    McpSchemasResult --> _FakeFileServerClient
    McpSchemasResult --> _StreamErrorHarnessClient
    McpSchemasResult --> _ErrHandle
    McpSchemasResult --> _SignalOnCreatedHarnessClient
    McpSchemasResult --> _Handle
    McpSchemasResult --> _BlockingHarnessClient
    McpSchemasResult --> _BlockingHandle
    McpSchemasResult --> _HandshakeHarnessClient
    McpSchemasResult --> _NativeBlockingHarnessClient
    McpSchemasResult --> _GatedFileServerClient
    McpSchemasResult --> _Resp
    McpSchemasResult --> _FakeServerClient
    McpSchemasResult --> _OverflowThenSuccessHarnessClient
    McpSchemasResult --> _ForwardBlockingHarnessClient
    McpSchemasResult --> _WakeRecordingServerClient
    McpSchemasResult --> _EventRecordingServerClient
    McpSchemasResult --> _RecordingCodexAppServerClient
    McpSchemasResult --> _FakeOpenCodeCompactClient
    McpSchemasResult --> _FakeOpenCodeCompactServer
    McpSchemasResult --> _PublishedEvent
    McpSchemasResult --> _AutoCreateScenario
    McpSchemasResult --> _LabelsAndEmptyHistoryServerClient
    McpSchemasResult --> _AntigravityAutoCreateScenario
    McpSchemasResult --> _AntigravitySnapshotServerClient
    McpSchemasResult --> _EnsureTerminalCase
    McpSchemasResult --> _EnsureCodexTerminalCase
    McpSchemasResult --> _RecordedPatch
    McpSchemasResult --> _WakePost
    McpSchemasResult --> _QueuedResponseServerClient
    McpSchemasResult --> _LabelPatchRecordingServerClient
    McpSchemasResult --> _ForwarderRun
    McpSchemasResult --> _FakeConn
    McpSchemasResult --> _StubTransport
    RunnerMcpManager --> AgentSpec
    RunnerMcpManager --> MCPServerConfig
    RunnerMcpManager --> McpServerConnection
    RunnerMcpManager --> _FakeConn
    _ServerEntry --> AgentSpec
    _ServerEntry --> MCPServerConfig
    _ServerEntry --> McpServerConnection
    _SpecEntry --> AgentSpec
    _SpecEntry --> MCPServerConfig
    _SpecEntry --> McpServerConnection
    McpElicitationRequired --> _CodexNativeModelOptionsNotReady
    McpElicitationRequired --> _CodexNativeLaunchConfig
    McpElicitationRequired --> _PiNativeLaunchConfig
    McpElicitationRequired --> _KiroNativeLaunchConfig
    McpElicitationRequired --> _OpenCodeNativeLaunchConfig
    McpElicitationRequired --> ResolvedSpec
    McpElicitationRequired --> _SessionSnapshot
    McpElicitationRequired --> TurnDispatch
    McpElicitationRequired --> _ContextWindowOverflow
    McpElicitationRequired --> _SubagentWorkEntry
    McpElicitationRequired --> _SubagentDeliveryAck
    McpElicitationRequired --> _ChildParentMeta
    McpElicitationRequired --> _BodyRequest
    McpElicitationRequired --> MCPServerConfig
    McpElicitationRequired --> CapturedHttpArgs
    McpServerConnection --> _ServerEntry
    McpServerConnection --> _SpecEntry
    McpServerConnection --> McpSchemasResult
    McpServerConnection --> RunnerMcpManager
    McpServerConnection --> _McpServerEntry
    McpServerConnection --> _AgentEntry
    McpServerConnection --> McpToolEntry
    McpServerConnection --> MCPServerConfig
    McpServerConnection --> CapturedHttpArgs
    McpServerDisabledError --> MCPServerConfig
    McpServerDisabledError --> CapturedHttpArgs
    _AgentEntry --> McpSchemasResult
    _AgentEntry --> AgentSpec
    _AgentEntry --> MCPServerConfig
    _AgentEntry --> McpServerConnection
    _McpServerEntry --> McpSchemasResult
    _McpServerEntry --> AgentSpec
    _McpServerEntry --> MCPServerConfig
    _McpServerEntry --> McpServerConnection
    McpToolEntry --> McpSchemasResult
    McpToolEntry --> AgentSpec
    McpToolEntry --> MCPServerConfig
    McpToolEntry --> McpServerConnection
    McpToolEntry --> _FakeConn
    ModelEntry --> OmnigentError
    ModelEntry --> ApiKeyAuth
    ModelEntry --> DatabricksAuth
    ModelListing --> OmnigentError
    ModelListing --> ApiKeyAuth
    ModelListing --> DatabricksAuth
    ResolvedModelProvider --> OmnigentError
    ResolvedModelProvider --> ApiKeyAuth
    ResolvedModelProvider --> DatabricksAuth
    RepostResult --> _ForwarderTarget
    RepostResult --> _PartialTextBuffer
    RepostResult --> _CodexTerminalError
    RepostResult --> _DeltaChunk
    RepostResult --> _DeltaFlushBarrier
    RepostResult --> _DeltaFlushStop
    RepostResult --> _PendingCodexElicitation
    RepostResult --> _ForwardHealth
    RepostResult --> _PostResult
    OpenCodeNativeServer --> _CodexNativeModelOptionsNotReady
    OpenCodeNativeServer --> _CodexNativeLaunchConfig
    OpenCodeNativeServer --> _PiNativeLaunchConfig
    OpenCodeNativeServer --> _KiroNativeLaunchConfig
    OpenCodeNativeServer --> _OpenCodeNativeLaunchConfig
    OpenCodeNativeServer --> ResolvedSpec
    OpenCodeNativeServer --> _SessionSnapshot
    OpenCodeNativeServer --> TurnDispatch
    OpenCodeNativeServer --> _ContextWindowOverflow
    OpenCodeNativeServer --> _SubagentWorkEntry
    OpenCodeNativeServer --> _SubagentDeliveryAck
    OpenCodeNativeServer --> _ChildParentMeta
    OpenCodeNativeServer --> _BodyRequest
    OpenCodeNativeBridgeState --> _CodexNativeModelOptionsNotReady
    OpenCodeNativeBridgeState --> _CodexNativeLaunchConfig
    OpenCodeNativeBridgeState --> _PiNativeLaunchConfig
    OpenCodeNativeBridgeState --> _KiroNativeLaunchConfig
    OpenCodeNativeBridgeState --> _OpenCodeNativeLaunchConfig
    OpenCodeNativeBridgeState --> ResolvedSpec
    OpenCodeNativeBridgeState --> _SessionSnapshot
    OpenCodeNativeBridgeState --> TurnDispatch
    OpenCodeNativeBridgeState --> _ContextWindowOverflow
    OpenCodeNativeBridgeState --> _SubagentWorkEntry
    OpenCodeNativeBridgeState --> _SubagentDeliveryAck
    OpenCodeNativeBridgeState --> _ChildParentMeta
    OpenCodeNativeBridgeState --> _BodyRequest
    OpenCodeNativeBridgeState --> _FakeMcpManager
    OpenCodeNativeBridgeState --> _StreamHandle
    OpenCodeNativeBridgeState --> _ReadTimeoutTransport
    OpenCodeNativeBridgeState --> _McpToolsListServerClient
    OpenCodeNativeBridgeState --> _FakeFileServerClient
    OpenCodeNativeBridgeState --> _StreamErrorHarnessClient
    OpenCodeNativeBridgeState --> _ErrHandle
    OpenCodeNativeBridgeState --> _SignalOnCreatedHarnessClient
    OpenCodeNativeBridgeState --> _Handle
    OpenCodeNativeBridgeState --> _BlockingHarnessClient
    OpenCodeNativeBridgeState --> _BlockingHandle
    OpenCodeNativeBridgeState --> _HandshakeHarnessClient
    OpenCodeNativeBridgeState --> _NativeBlockingHarnessClient
    OpenCodeNativeBridgeState --> _GatedFileServerClient
    OpenCodeNativeBridgeState --> _Resp
    OpenCodeNativeBridgeState --> _FakeServerClient
    OpenCodeNativeBridgeState --> _OverflowThenSuccessHarnessClient
    OpenCodeNativeBridgeState --> _ForwardBlockingHarnessClient
    OpenCodeNativeBridgeState --> _WakeRecordingServerClient
    OpenCodeNativeBridgeState --> _EventRecordingServerClient
    OpenCodeNativeBridgeState --> _RecordingCodexAppServerClient
    OpenCodeNativeBridgeState --> _FakeOpenCodeCompactClient
    OpenCodeNativeBridgeState --> _FakeOpenCodeCompactServer
    OpenCodeNativeBridgeState --> _PublishedEvent
    OpenCodeNativeBridgeState --> _AutoCreateScenario
    OpenCodeNativeBridgeState --> _LabelsAndEmptyHistoryServerClient
    OpenCodeNativeBridgeState --> _AntigravityAutoCreateScenario
    OpenCodeNativeBridgeState --> _AntigravitySnapshotServerClient
    OpenCodeNativeBridgeState --> _EnsureTerminalCase
    OpenCodeNativeBridgeState --> _EnsureCodexTerminalCase
    OpenCodeNativeBridgeState --> _RecordedPatch
    OpenCodeNativeBridgeState --> _WakePost
    OpenCodeNativeBridgeState --> _QueuedResponseServerClient
    OpenCodeNativeBridgeState --> _LabelPatchRecordingServerClient
    OpenCodeNativeBridgeState --> _ForwarderRun
    OpenCodeClientError --> _CodexNativeModelOptionsNotReady
    OpenCodeClientError --> _CodexNativeLaunchConfig
    OpenCodeClientError --> _PiNativeLaunchConfig
    OpenCodeClientError --> _KiroNativeLaunchConfig
    OpenCodeClientError --> _OpenCodeNativeLaunchConfig
    OpenCodeClientError --> ResolvedSpec
    OpenCodeClientError --> _SessionSnapshot
    OpenCodeClientError --> TurnDispatch
    OpenCodeClientError --> _ContextWindowOverflow
    OpenCodeClientError --> _SubagentWorkEntry
    OpenCodeClientError --> _SubagentDeliveryAck
    OpenCodeClientError --> _ChildParentMeta
    OpenCodeClientError --> _BodyRequest
    OpenCodeClientError --> _FakeMcpManager
    OpenCodeClientError --> _StreamHandle
    OpenCodeClientError --> _ReadTimeoutTransport
    OpenCodeClientError --> _McpToolsListServerClient
    OpenCodeClientError --> _FakeFileServerClient
    OpenCodeClientError --> _StreamErrorHarnessClient
    OpenCodeClientError --> _ErrHandle
    OpenCodeClientError --> _SignalOnCreatedHarnessClient
    OpenCodeClientError --> _Handle
    OpenCodeClientError --> _BlockingHarnessClient
    OpenCodeClientError --> _BlockingHandle
    OpenCodeClientError --> _HandshakeHarnessClient
    OpenCodeClientError --> _NativeBlockingHarnessClient
    OpenCodeClientError --> _GatedFileServerClient
    OpenCodeClientError --> _Resp
    OpenCodeClientError --> _FakeServerClient
    OpenCodeClientError --> _OverflowThenSuccessHarnessClient
    OpenCodeClientError --> _ForwardBlockingHarnessClient
    OpenCodeClientError --> _WakeRecordingServerClient
    OpenCodeClientError --> _EventRecordingServerClient
    OpenCodeClientError --> _RecordingCodexAppServerClient
    OpenCodeClientError --> _FakeOpenCodeCompactClient
    OpenCodeClientError --> _FakeOpenCodeCompactServer
    OpenCodeClientError --> _PublishedEvent
    OpenCodeClientError --> _AutoCreateScenario
    OpenCodeClientError --> _LabelsAndEmptyHistoryServerClient
    OpenCodeClientError --> _AntigravityAutoCreateScenario
    OpenCodeClientError --> _AntigravitySnapshotServerClient
    OpenCodeClientError --> _EnsureTerminalCase
    OpenCodeClientError --> _EnsureCodexTerminalCase
    OpenCodeClientError --> _RecordedPatch
    OpenCodeClientError --> _WakePost
    OpenCodeClientError --> _QueuedResponseServerClient
    OpenCodeClientError --> _LabelPatchRecordingServerClient
    OpenCodeClientError --> _ForwarderRun
    OpenCodeSession --> _FakeMcpManager
    OpenCodeSession --> _StreamHandle
    OpenCodeSession --> _ReadTimeoutTransport
    OpenCodeSession --> _McpToolsListServerClient
    OpenCodeSession --> _FakeFileServerClient
    OpenCodeSession --> _StreamErrorHarnessClient
    OpenCodeSession --> _ErrHandle
    OpenCodeSession --> _SignalOnCreatedHarnessClient
    OpenCodeSession --> _Handle
    OpenCodeSession --> _BlockingHarnessClient
    OpenCodeSession --> _BlockingHandle
    OpenCodeSession --> _HandshakeHarnessClient
    OpenCodeSession --> _NativeBlockingHarnessClient
    OpenCodeSession --> _GatedFileServerClient
    OpenCodeSession --> _Resp
    OpenCodeSession --> _FakeServerClient
    OpenCodeSession --> _OverflowThenSuccessHarnessClient
    OpenCodeSession --> _ForwardBlockingHarnessClient
    OpenCodeSession --> _WakeRecordingServerClient
    OpenCodeSession --> _EventRecordingServerClient
    OpenCodeSession --> _RecordingCodexAppServerClient
    OpenCodeSession --> _FakeOpenCodeCompactClient
    OpenCodeSession --> _FakeOpenCodeCompactServer
    OpenCodeSession --> _PublishedEvent
    OpenCodeSession --> _AutoCreateScenario
    OpenCodeSession --> _LabelsAndEmptyHistoryServerClient
    OpenCodeSession --> _AntigravityAutoCreateScenario
    OpenCodeSession --> _AntigravitySnapshotServerClient
    OpenCodeSession --> _EnsureTerminalCase
    OpenCodeSession --> _EnsureCodexTerminalCase
    OpenCodeSession --> _RecordedPatch
    OpenCodeSession --> _WakePost
    OpenCodeSession --> _QueuedResponseServerClient
    OpenCodeSession --> _LabelPatchRecordingServerClient
    OpenCodeSession --> _ForwarderRun
    OpenCodeNativeForwarder --> _CodexNativeModelOptionsNotReady
    OpenCodeNativeForwarder --> _CodexNativeLaunchConfig
    OpenCodeNativeForwarder --> _PiNativeLaunchConfig
    OpenCodeNativeForwarder --> _KiroNativeLaunchConfig
    OpenCodeNativeForwarder --> _OpenCodeNativeLaunchConfig
    OpenCodeNativeForwarder --> ResolvedSpec
    OpenCodeNativeForwarder --> _SessionSnapshot
    OpenCodeNativeForwarder --> TurnDispatch
    OpenCodeNativeForwarder --> _ContextWindowOverflow
    OpenCodeNativeForwarder --> _SubagentWorkEntry
    OpenCodeNativeForwarder --> _SubagentDeliveryAck
    OpenCodeNativeForwarder --> _ChildParentMeta
    OpenCodeNativeForwarder --> _BodyRequest
    OSEnvironment <|-- CallerProcessOSEnvironment
    CallerProcessOSEnvironment --> CredentialProxySpec
    CallerProcessOSEnvironment --> OSEnvSpec
    CallerProcessOSEnvironment --> ContainmentHandle
    CallerProcessOSEnvironment <|-- OSEnvironment
    OSEnvironment --> _JsonlRecord
    OSEnvironment --> _JsonlReadResult
    OSEnvironment --> MessageDeltaReadResult
    OSEnvironment --> ClaudeNativeToolRelay
    OSEnvironment --> _SlashCommandPayload
    OSEnvironment --> CredentialProxySpec
    OSEnvironment --> OSEnvSpec
    OSEnvironment --> ContainmentHandle
    OSEnvironment --> _IdleDetector
    OSEnvironment --> TerminalInstance
    OSEnvironment --> TerminalCreateResult
    OSEnvironment --> CallerProcessFilesystem
    OSEnvironment --> TerminalLifecycle
    OSEnvironment --> TerminalExitEvent
    OSEnvironment --> SessionResourceRegistry
    OSEnvironment --> _UCFunctionSchemaTool
    OSEnvironment --> ToolManager
    OSEnvironment --> NullServerClient
    OSEnvironment --> _Response
    OSEnvironment --> RunningFlagTerminalInstance
    OSEnvironment --> _FakeOSEnvironment
    OSEnvironment --> _FakeOSEnvironment
    OSEnvironment --> _CapturingResourceRegistry
    OSEnvironment --> _SwitchableServerClient
    OSEnvironment --> _Response
    OSEnvironment --> _StatusEdge
    OSEnvironment --> _WatcherCapture
    OSEnvironment --> _LaunchReturningRegistry
    PagedList --> SessionResourceView
    PagedList --> CallerProcessFilesystem
    PagedList --> TerminalLifecycle
    PagedList --> TerminalExitEvent
    PagedList --> SessionResourceRegistry
    NativePaneReaper --> _CodexNativeModelOptionsNotReady
    NativePaneReaper --> _CodexNativeLaunchConfig
    NativePaneReaper --> _PiNativeLaunchConfig
    NativePaneReaper --> _KiroNativeLaunchConfig
    NativePaneReaper --> _OpenCodeNativeLaunchConfig
    NativePaneReaper --> ResolvedSpec
    NativePaneReaper --> _SessionSnapshot
    NativePaneReaper --> TurnDispatch
    NativePaneReaper --> _ContextWindowOverflow
    NativePaneReaper --> _SubagentWorkEntry
    NativePaneReaper --> _SubagentDeliveryAck
    NativePaneReaper --> _ChildParentMeta
    NativePaneReaper --> _BodyRequest
    PaneRef --> _CodexNativeModelOptionsNotReady
    PaneRef --> _CodexNativeLaunchConfig
    PaneRef --> _PiNativeLaunchConfig
    PaneRef --> _KiroNativeLaunchConfig
    PaneRef --> _OpenCodeNativeLaunchConfig
    PaneRef --> ResolvedSpec
    PaneRef --> _SessionSnapshot
    PaneRef --> TurnDispatch
    PaneRef --> _ContextWindowOverflow
    PaneRef --> _SubagentWorkEntry
    PaneRef --> _SubagentDeliveryAck
    PaneRef --> _ChildParentMeta
    PaneRef --> _BodyRequest
    _ConfigYamlLoader --> ErrorCode
    _ConfigYamlLoader --> OmnigentError
    _ConfigYamlLoader --> CredentialProxyEntry
    _ConfigYamlLoader --> CredentialProxySpec
    _ConfigYamlLoader --> CredentialSourceSpec
    _ConfigYamlLoader --> OSEnvSandboxSpec
    _ConfigYamlLoader --> OSEnvSpec
    _ConfigYamlLoader --> TerminalEnvSpec
    _ConfigYamlLoader --> AgentSpec
    _ConfigYamlLoader --> ApiKeyAuth
    _ConfigYamlLoader --> BuiltinToolConfig
    _ConfigYamlLoader --> CompactionConfig
    _ConfigYamlLoader --> DatabricksAuth
    _ConfigYamlLoader --> ExecutorSpec
    _ConfigYamlLoader --> GuardrailsSpec
    _ConfigYamlLoader --> InteractionConfig
    _ConfigYamlLoader --> LabelDef
    _ConfigYamlLoader --> LLMConfig
    _ConfigYamlLoader --> LocalToolInfo
    _ConfigYamlLoader --> MCPServerConfig
    _ConfigYamlLoader --> ModalityConfig
    _ConfigYamlLoader --> ProviderAuth
    _ConfigYamlLoader --> SandboxConfig
    _ConfigYamlLoader --> SharePolicy
    _ConfigYamlLoader --> ToolsConfig
    _CredentialProxyItemModel --> ErrorCode
    _CredentialProxyItemModel --> OmnigentError
    _CredentialProxyItemModel --> CredentialProxyEntry
    _CredentialProxyItemModel --> CredentialProxySpec
    _CredentialProxyItemModel --> CredentialSourceSpec
    _CredentialProxyItemModel --> OSEnvSandboxSpec
    _CredentialProxyItemModel --> OSEnvSpec
    _CredentialProxyItemModel --> TerminalEnvSpec
    _CredentialProxyItemModel --> AgentSpec
    _CredentialProxyItemModel --> ApiKeyAuth
    _CredentialProxyItemModel --> BuiltinToolConfig
    _CredentialProxyItemModel --> CompactionConfig
    _CredentialProxyItemModel --> DatabricksAuth
    _CredentialProxyItemModel --> ExecutorSpec
    _CredentialProxyItemModel --> GuardrailsSpec
    _CredentialProxyItemModel --> InteractionConfig
    _CredentialProxyItemModel --> LabelDef
    _CredentialProxyItemModel --> LLMConfig
    _CredentialProxyItemModel --> LocalToolInfo
    _CredentialProxyItemModel --> MCPServerConfig
    _CredentialProxyItemModel --> ModalityConfig
    _CredentialProxyItemModel --> ProviderAuth
    _CredentialProxyItemModel --> SandboxConfig
    _CredentialProxyItemModel --> SharePolicy
    _CredentialProxyItemModel --> ToolsConfig
    _CredentialSourceModel --> ErrorCode
    _CredentialSourceModel --> OmnigentError
    _CredentialSourceModel --> CredentialProxyEntry
    _CredentialSourceModel --> CredentialProxySpec
    _CredentialSourceModel --> CredentialSourceSpec
    _CredentialSourceModel --> OSEnvSandboxSpec
    _CredentialSourceModel --> OSEnvSpec
    _CredentialSourceModel --> TerminalEnvSpec
    _CredentialSourceModel --> AgentSpec
    _CredentialSourceModel --> ApiKeyAuth
    _CredentialSourceModel --> BuiltinToolConfig
    _CredentialSourceModel --> CompactionConfig
    _CredentialSourceModel --> DatabricksAuth
    _CredentialSourceModel --> ExecutorSpec
    _CredentialSourceModel --> GuardrailsSpec
    _CredentialSourceModel --> InteractionConfig
    _CredentialSourceModel --> LabelDef
    _CredentialSourceModel --> LLMConfig
    _CredentialSourceModel --> LocalToolInfo
    _CredentialSourceModel --> MCPServerConfig
    _CredentialSourceModel --> ModalityConfig
    _CredentialSourceModel --> ProviderAuth
    _CredentialSourceModel --> SandboxConfig
    _CredentialSourceModel --> SharePolicy
    _CredentialSourceModel --> ToolsConfig
    FunctionPolicy --> _OmnigentYamlLoader
    FunctionPolicy --> AgentDef
    FunctionPolicy --> ExecutorSpec
    FunctionPolicy --> RunnerToolPolicyGate
    FunctionPolicy --> _TestSleepRunner
    FunctionPolicy --> TestLoadFromDict
    FunctionPolicy --> TestLoadFromYAML
    FunctionPolicy --> TestInstructionsField
    PromptPolicy --> _OmnigentYamlLoader
    PromptPolicy --> AgentDef
    PromptPolicy --> ExecutorSpec
    PromptPolicy --> _TestSleepRunner
    PromptPolicy --> TestLoadFromDict
    PromptPolicy --> TestLoadFromYAML
    PromptPolicy --> TestInstructionsField
    RunnerToolPolicyGate --> _CodexNativeModelOptionsNotReady
    RunnerToolPolicyGate --> _CodexNativeLaunchConfig
    RunnerToolPolicyGate --> _PiNativeLaunchConfig
    RunnerToolPolicyGate --> _KiroNativeLaunchConfig
    RunnerToolPolicyGate --> _OpenCodeNativeLaunchConfig
    RunnerToolPolicyGate --> ResolvedSpec
    RunnerToolPolicyGate --> _SessionSnapshot
    RunnerToolPolicyGate --> TurnDispatch
    RunnerToolPolicyGate --> _ContextWindowOverflow
    RunnerToolPolicyGate --> _SubagentWorkEntry
    RunnerToolPolicyGate --> _SubagentDeliveryAck
    RunnerToolPolicyGate --> _ChildParentMeta
    RunnerToolPolicyGate --> _BodyRequest
    RunnerToolPolicyGate --> FunctionPolicy
    RunnerToolPolicyGate --> AgentSpec
    HarnessProcessManager --> _CodexNativeModelOptionsNotReady
    HarnessProcessManager --> _CodexNativeLaunchConfig
    HarnessProcessManager --> _PiNativeLaunchConfig
    HarnessProcessManager --> _KiroNativeLaunchConfig
    HarnessProcessManager --> _OpenCodeNativeLaunchConfig
    HarnessProcessManager --> ResolvedSpec
    HarnessProcessManager --> _SessionSnapshot
    HarnessProcessManager --> TurnDispatch
    HarnessProcessManager --> _ContextWindowOverflow
    HarnessProcessManager --> _SubagentWorkEntry
    HarnessProcessManager --> _SubagentDeliveryAck
    HarnessProcessManager --> _ChildParentMeta
    HarnessProcessManager --> _BodyRequest
    HarnessProcessManager --> DispatchCapability
    HarnessProcessManager --> _FakeHarnessStream
    HarnessProcessManager --> _FakeHarnessClient
    HarnessProcessManager --> _FakeProcessManager
    HarnessProcessManager --> _RecordingProcessManager
    HarnessProcessManager --> _ContentCapturingProcessManager
    HarnessProcessManager --> _ContentCapturingHarnessClient
    HarnessProcessManager --> _StubTerminalInstance
    HarnessProcessManager --> _StubTerminalRegistry
    HarnessProcessManager --> _ModelSendResult
    HarnessProcessManager --> _GatedTwoTurnHarnessStream
    HarnessProcessManager --> _GatedTwoTurnHarnessClient
    HarnessProcessManager --> _AliveProc
    NoLiveHarnessError --> _CodexNativeModelOptionsNotReady
    NoLiveHarnessError --> _CodexNativeLaunchConfig
    NoLiveHarnessError --> _PiNativeLaunchConfig
    NoLiveHarnessError --> _KiroNativeLaunchConfig
    NoLiveHarnessError --> _OpenCodeNativeLaunchConfig
    NoLiveHarnessError --> ResolvedSpec
    NoLiveHarnessError --> _SessionSnapshot
    NoLiveHarnessError --> TurnDispatch
    NoLiveHarnessError --> _ContextWindowOverflow
    NoLiveHarnessError --> _SubagentWorkEntry
    NoLiveHarnessError --> _SubagentDeliveryAck
    NoLiveHarnessError --> _ChildParentMeta
    NoLiveHarnessError --> _BodyRequest
    FamilyConfig --> ErrorCode
    FamilyConfig --> OmnigentError
    FamilyConfig --> UcodeHarnessConfig
    FamilyConfig --> _AsyncToolHandle
    FamilyConfig --> _LoadedHistory
    ResolvedCredential --> ErrorCode
    ResolvedCredential --> OmnigentError
    ProxyMcpManager --> _CodexNativeModelOptionsNotReady
    ProxyMcpManager --> _CodexNativeLaunchConfig
    ProxyMcpManager --> _PiNativeLaunchConfig
    ProxyMcpManager --> _KiroNativeLaunchConfig
    ProxyMcpManager --> _OpenCodeNativeLaunchConfig
    ProxyMcpManager --> ResolvedSpec
    ProxyMcpManager --> _SessionSnapshot
    ProxyMcpManager --> TurnDispatch
    ProxyMcpManager --> _ContextWindowOverflow
    ProxyMcpManager --> _SubagentWorkEntry
    ProxyMcpManager --> _SubagentDeliveryAck
    ProxyMcpManager --> _ChildParentMeta
    ProxyMcpManager --> _BodyRequest
    ProxyMcpManager --> McpSchemasResult
    ProxyMcpManager --> AgentSpec
    ProxyMcpManager --> _StubTransport
    TerminalListEntry --> SessionResourceView
    TerminalListEntry --> _CodexNativeModelOptionsNotReady
    TerminalListEntry --> _CodexNativeLaunchConfig
    TerminalListEntry --> _PiNativeLaunchConfig
    TerminalListEntry --> _KiroNativeLaunchConfig
    TerminalListEntry --> _OpenCodeNativeLaunchConfig
    TerminalListEntry --> ResolvedSpec
    TerminalListEntry --> _SessionSnapshot
    TerminalListEntry --> TurnDispatch
    TerminalListEntry --> _ContextWindowOverflow
    TerminalListEntry --> _SubagentWorkEntry
    TerminalListEntry --> _SubagentDeliveryAck
    TerminalListEntry --> _ChildParentMeta
    TerminalListEntry --> _BodyRequest
    TerminalListEntry --> TerminalLifecycle
    TerminalListEntry --> TerminalExitEvent
    TerminalListEntry --> SessionResourceRegistry
    TerminalListEntry --> OSEnvSpec
    TerminalListEntry --> TerminalEnvSpec
    TerminalListEntry --> TerminalInstance
    TerminalRegistry --> SessionResourceView
    TerminalRegistry --> TerminalLifecycle
    TerminalRegistry --> TerminalExitEvent
    TerminalRegistry --> SessionResourceRegistry
    TerminalRegistry --> OSEnvSpec
    TerminalRegistry --> TerminalEnvSpec
    TerminalRegistry --> TerminalInstance
    TerminalRegistry --> _FakeHarnessStream
    TerminalRegistry --> _FakeHarnessClient
    TerminalRegistry --> _FakeProcessManager
    TerminalRegistry --> _RecordingProcessManager
    TerminalRegistry --> _ContentCapturingProcessManager
    TerminalRegistry --> _ContentCapturingHarnessClient
    TerminalRegistry --> _StubTerminalInstance
    TerminalRegistry --> _StubTerminalRegistry
    TerminalRegistry --> _ModelSendResult
    TerminalRegistry --> _GatedTwoTurnHarnessStream
    TerminalRegistry --> _GatedTwoTurnHarnessClient
    SessionResourceRegistry --> _CodexNativeModelOptionsNotReady
    SessionResourceRegistry --> _CodexNativeLaunchConfig
    SessionResourceRegistry --> _PiNativeLaunchConfig
    SessionResourceRegistry --> _KiroNativeLaunchConfig
    SessionResourceRegistry --> _OpenCodeNativeLaunchConfig
    SessionResourceRegistry --> ResolvedSpec
    SessionResourceRegistry --> _SessionSnapshot
    SessionResourceRegistry --> TurnDispatch
    SessionResourceRegistry --> _ContextWindowOverflow
    SessionResourceRegistry --> _SubagentWorkEntry
    SessionResourceRegistry --> _SubagentDeliveryAck
    SessionResourceRegistry --> _ChildParentMeta
    SessionResourceRegistry --> _BodyRequest
    SessionResourceRegistry --> PagedList
    SessionResourceRegistry --> SessionResourceView
    SessionResourceRegistry --> OSEnvironment
    SessionResourceRegistry --> TerminalRegistry
    SessionResourceRegistry --> OSEnvSandboxSpec
    SessionResourceRegistry --> OSEnvSpec
    SessionResourceRegistry --> TerminalListEntry
    SessionResourceRegistry --> DispatchCapability
    SessionResourceRegistry --> _FakeMcpManager
    SessionResourceRegistry --> _StreamHandle
    SessionResourceRegistry --> _ReadTimeoutTransport
    SessionResourceRegistry --> _McpToolsListServerClient
    SessionResourceRegistry --> _FakeFileServerClient
    SessionResourceRegistry --> _StreamErrorHarnessClient
    SessionResourceRegistry --> _ErrHandle
    SessionResourceRegistry --> _SignalOnCreatedHarnessClient
    SessionResourceRegistry --> _Handle
    SessionResourceRegistry --> _BlockingHarnessClient
    SessionResourceRegistry --> _BlockingHandle
    SessionResourceRegistry --> _HandshakeHarnessClient
    SessionResourceRegistry --> _NativeBlockingHarnessClient
    SessionResourceRegistry --> _GatedFileServerClient
    SessionResourceRegistry --> _Resp
    SessionResourceRegistry --> _FakeServerClient
    SessionResourceRegistry --> _OverflowThenSuccessHarnessClient
    SessionResourceRegistry --> _ForwardBlockingHarnessClient
    SessionResourceRegistry --> _WakeRecordingServerClient
    SessionResourceRegistry --> _EventRecordingServerClient
    SessionResourceRegistry --> _RecordingCodexAppServerClient
    SessionResourceRegistry --> _FakeOpenCodeCompactClient
    SessionResourceRegistry --> _FakeOpenCodeCompactServer
    SessionResourceRegistry --> _PublishedEvent
    SessionResourceRegistry --> _AutoCreateScenario
    SessionResourceRegistry --> _LabelsAndEmptyHistoryServerClient
    SessionResourceRegistry --> _AntigravityAutoCreateScenario
    SessionResourceRegistry --> _AntigravitySnapshotServerClient
    SessionResourceRegistry --> _EnsureTerminalCase
    SessionResourceRegistry --> _EnsureCodexTerminalCase
    SessionResourceRegistry --> _RecordedPatch
    SessionResourceRegistry --> _WakePost
    SessionResourceRegistry --> _QueuedResponseServerClient
    SessionResourceRegistry --> _LabelPatchRecordingServerClient
    SessionResourceRegistry --> _ForwarderRun
    SessionResourceRegistry --> _FakeOSEnvironment
    SessionResourceRegistry --> _FakeOSEnvironment
    SessionResourceRegistry --> _CapturingResourceRegistry
    SessionResourceRegistry --> _SwitchableServerClient
    SessionResourceRegistry --> _Response
    SessionResourceRegistry --> _StatusEdge
    SessionResourceRegistry --> _WatcherCapture
    SessionResourceRegistry --> _LaunchReturningRegistry
    TerminalExitEvent --> _CodexNativeModelOptionsNotReady
    TerminalExitEvent --> _CodexNativeLaunchConfig
    TerminalExitEvent --> _PiNativeLaunchConfig
    TerminalExitEvent --> _KiroNativeLaunchConfig
    TerminalExitEvent --> _OpenCodeNativeLaunchConfig
    TerminalExitEvent --> ResolvedSpec
    TerminalExitEvent --> _SessionSnapshot
    TerminalExitEvent --> TurnDispatch
    TerminalExitEvent --> _ContextWindowOverflow
    TerminalExitEvent --> _SubagentWorkEntry
    TerminalExitEvent --> _SubagentDeliveryAck
    TerminalExitEvent --> _ChildParentMeta
    TerminalExitEvent --> _BodyRequest
    TerminalExitEvent --> PagedList
    TerminalExitEvent --> SessionResourceView
    TerminalExitEvent --> OSEnvironment
    TerminalExitEvent --> TerminalRegistry
    TerminalExitEvent --> OSEnvSandboxSpec
    TerminalExitEvent --> OSEnvSpec
    TerminalExitEvent --> TerminalListEntry
    TerminalExitEvent --> _FakeMcpManager
    TerminalExitEvent --> _StreamHandle
    TerminalExitEvent --> _ReadTimeoutTransport
    TerminalExitEvent --> _McpToolsListServerClient
    TerminalExitEvent --> _FakeFileServerClient
    TerminalExitEvent --> _StreamErrorHarnessClient
    TerminalExitEvent --> _ErrHandle
    TerminalExitEvent --> _SignalOnCreatedHarnessClient
    TerminalExitEvent --> _Handle
    TerminalExitEvent --> _BlockingHarnessClient
    TerminalExitEvent --> _BlockingHandle
    TerminalExitEvent --> _HandshakeHarnessClient
    TerminalExitEvent --> _NativeBlockingHarnessClient
    TerminalExitEvent --> _GatedFileServerClient
    TerminalExitEvent --> _Resp
    TerminalExitEvent --> _FakeServerClient
    TerminalExitEvent --> _OverflowThenSuccessHarnessClient
    TerminalExitEvent --> _ForwardBlockingHarnessClient
    TerminalExitEvent --> _WakeRecordingServerClient
    TerminalExitEvent --> _EventRecordingServerClient
    TerminalExitEvent --> _RecordingCodexAppServerClient
    TerminalExitEvent --> _FakeOpenCodeCompactClient
    TerminalExitEvent --> _FakeOpenCodeCompactServer
    TerminalExitEvent --> _PublishedEvent
    TerminalExitEvent --> _AutoCreateScenario
    TerminalExitEvent --> _LabelsAndEmptyHistoryServerClient
    TerminalExitEvent --> _AntigravityAutoCreateScenario
    TerminalExitEvent --> _AntigravitySnapshotServerClient
    TerminalExitEvent --> _EnsureTerminalCase
    TerminalExitEvent --> _EnsureCodexTerminalCase
    TerminalExitEvent --> _RecordedPatch
    TerminalExitEvent --> _WakePost
    TerminalExitEvent --> _QueuedResponseServerClient
    TerminalExitEvent --> _LabelPatchRecordingServerClient
    TerminalExitEvent --> _ForwarderRun
    TerminalExitEvent --> _FakeOSEnvironment
    TerminalLifecycle --> _CodexNativeModelOptionsNotReady
    TerminalLifecycle --> _CodexNativeLaunchConfig
    TerminalLifecycle --> _PiNativeLaunchConfig
    TerminalLifecycle --> _KiroNativeLaunchConfig
    TerminalLifecycle --> _OpenCodeNativeLaunchConfig
    TerminalLifecycle --> ResolvedSpec
    TerminalLifecycle --> _SessionSnapshot
    TerminalLifecycle --> TurnDispatch
    TerminalLifecycle --> _ContextWindowOverflow
    TerminalLifecycle --> _SubagentWorkEntry
    TerminalLifecycle --> _SubagentDeliveryAck
    TerminalLifecycle --> _ChildParentMeta
    TerminalLifecycle --> _BodyRequest
    TerminalLifecycle --> PagedList
    TerminalLifecycle --> SessionResourceView
    TerminalLifecycle --> OSEnvironment
    TerminalLifecycle --> TerminalRegistry
    TerminalLifecycle --> OSEnvSandboxSpec
    TerminalLifecycle --> OSEnvSpec
    TerminalLifecycle --> TerminalListEntry
    TerminalLifecycle --> _FakeMcpManager
    TerminalLifecycle --> _StreamHandle
    TerminalLifecycle --> _ReadTimeoutTransport
    TerminalLifecycle --> _McpToolsListServerClient
    TerminalLifecycle --> _FakeFileServerClient
    TerminalLifecycle --> _StreamErrorHarnessClient
    TerminalLifecycle --> _ErrHandle
    TerminalLifecycle --> _SignalOnCreatedHarnessClient
    TerminalLifecycle --> _Handle
    TerminalLifecycle --> _BlockingHarnessClient
    TerminalLifecycle --> _BlockingHandle
    TerminalLifecycle --> _HandshakeHarnessClient
    TerminalLifecycle --> _NativeBlockingHarnessClient
    TerminalLifecycle --> _GatedFileServerClient
    TerminalLifecycle --> _Resp
    TerminalLifecycle --> _FakeServerClient
    TerminalLifecycle --> _OverflowThenSuccessHarnessClient
    TerminalLifecycle --> _ForwardBlockingHarnessClient
    TerminalLifecycle --> _WakeRecordingServerClient
    TerminalLifecycle --> _EventRecordingServerClient
    TerminalLifecycle --> _RecordingCodexAppServerClient
    TerminalLifecycle --> _FakeOpenCodeCompactClient
    TerminalLifecycle --> _FakeOpenCodeCompactServer
    TerminalLifecycle --> _PublishedEvent
    TerminalLifecycle --> _AutoCreateScenario
    TerminalLifecycle --> _LabelsAndEmptyHistoryServerClient
    TerminalLifecycle --> _AntigravityAutoCreateScenario
    TerminalLifecycle --> _AntigravitySnapshotServerClient
    TerminalLifecycle --> _EnsureTerminalCase
    TerminalLifecycle --> _EnsureCodexTerminalCase
    TerminalLifecycle --> _RecordedPatch
    TerminalLifecycle --> _WakePost
    TerminalLifecycle --> _QueuedResponseServerClient
    TerminalLifecycle --> _LabelPatchRecordingServerClient
    TerminalLifecycle --> _ForwarderRun
    TerminalLifecycle --> _FakeOSEnvironment
    ContainmentHandle --> OSEnvironment
    ContainmentHandle --> CallerProcessOSEnvironment
    ContainmentHandle --> CredentialProxySpec
    ContainmentHandle --> OSEnvSandboxSpec
    ContainmentHandle --> OSEnvSpec
    ContainmentHandle --> _JOBOBJECT_BASIC_LIMIT_INFORMATION
    ContainmentHandle --> _IO_COUNTERS
    ContainmentHandle --> _JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    ContainmentHandle --> _JobHandle
    ContainmentHandle --> WindowsJobObjectSandboxBackend
    SandboxBackend --> BwrapSandboxBackend
    SandboxBackend --> CredentialProxySpec
    SandboxBackend --> OSEnvSandboxSpec
    SandboxBackend --> OSEnvSpec
    SandboxBackend --> _JOBOBJECT_BASIC_LIMIT_INFORMATION
    SandboxBackend --> _IO_COUNTERS
    SandboxBackend --> _JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    SandboxBackend --> _JobHandle
    SandboxBackend --> WindowsJobObjectSandboxBackend
    ApprovalEvent --> ErrorCode
    ApprovalEvent --> OmnigentError
    ApprovalEvent --> _FakeHarnessStream
    ApprovalEvent --> _FakeHarnessClient
    ApprovalEvent --> _FakeProcessManager
    ApprovalEvent --> _RecordingProcessManager
    ApprovalEvent --> _ContentCapturingProcessManager
    ApprovalEvent --> _ContentCapturingHarnessClient
    ApprovalEvent --> _StubTerminalInstance
    ApprovalEvent --> _StubTerminalRegistry
    ApprovalEvent --> _ModelSendResult
    ApprovalEvent --> _GatedTwoTurnHarnessStream
    ApprovalEvent --> _GatedTwoTurnHarnessClient
    SessionResourceCreatedEvent --> _ConversationStore
    SessionResourceCreatedEvent --> _FakeRunnerClient
    SessionResourceCreatedEvent --> _RoutedRunner
    SessionResourceCreatedEvent --> _FakeRunnerRouter
    SessionResourceCreatedEvent --> _InMemoryArtifactStore
    SessionResourceCreatedEvent --> _FakeStreamCtx
    SessionResourceCreatedEvent --> _FakeStreamingRunnerClient
    SessionResourceCreatedEvent --> _ScriptedStreamCtx
    SessionResourceCreatedEvent --> _ScriptedStreamingRunnerClient
    SessionResourceCreatedEvent --> _StreamAndCaptureRunnerClient
    SessionResourceCreatedEvent --> _SubagentTerminalStore
    SessionResourceDeletedEvent --> _ConversationStore
    SessionResourceDeletedEvent --> _FakeRunnerClient
    SessionResourceDeletedEvent --> _RoutedRunner
    SessionResourceDeletedEvent --> _FakeRunnerRouter
    SessionResourceDeletedEvent --> _InMemoryArtifactStore
    SessionResourceDeletedEvent --> _FakeStreamCtx
    SessionResourceDeletedEvent --> _FakeStreamingRunnerClient
    SessionResourceDeletedEvent --> _ScriptedStreamCtx
    SessionResourceDeletedEvent --> _ScriptedStreamingRunnerClient
    SessionResourceDeletedEvent --> _StreamAndCaptureRunnerClient
    SessionResourceDeletedEvent --> _SubagentTerminalStore
    SeccompArgFilter --> BwrapSandboxBackend
    SeccompRule --> BwrapSandboxBackend
    SessionResourceView --> PagedList
    SessionResourceView --> TerminalListEntry
    SessionResourceView --> TerminalRegistry
    SessionResourceView --> _CodexNativeModelOptionsNotReady
    SessionResourceView --> _CodexNativeLaunchConfig
    SessionResourceView --> _PiNativeLaunchConfig
    SessionResourceView --> _KiroNativeLaunchConfig
    SessionResourceView --> _OpenCodeNativeLaunchConfig
    SessionResourceView --> ResolvedSpec
    SessionResourceView --> _SessionSnapshot
    SessionResourceView --> TurnDispatch
    SessionResourceView --> _ContextWindowOverflow
    SessionResourceView --> _SubagentWorkEntry
    SessionResourceView --> _SubagentDeliveryAck
    SessionResourceView --> _ChildParentMeta
    SessionResourceView --> _BodyRequest
    SessionResourceView --> TerminalLifecycle
    SessionResourceView --> TerminalExitEvent
    SessionResourceView --> SessionResourceRegistry
    SessionResourceView --> _FakeMcpManager
    SessionResourceView --> _StreamHandle
    SessionResourceView --> _ReadTimeoutTransport
    SessionResourceView --> _McpToolsListServerClient
    SessionResourceView --> _FakeFileServerClient
    SessionResourceView --> _StreamErrorHarnessClient
    SessionResourceView --> _ErrHandle
    SessionResourceView --> _SignalOnCreatedHarnessClient
    SessionResourceView --> _Handle
    SessionResourceView --> _BlockingHarnessClient
    SessionResourceView --> _BlockingHandle
    SessionResourceView --> _HandshakeHarnessClient
    SessionResourceView --> _NativeBlockingHarnessClient
    SessionResourceView --> _GatedFileServerClient
    SessionResourceView --> _Resp
    SessionResourceView --> _FakeServerClient
    SessionResourceView --> _OverflowThenSuccessHarnessClient
    SessionResourceView --> _ForwardBlockingHarnessClient
    SessionResourceView --> _WakeRecordingServerClient
    SessionResourceView --> _EventRecordingServerClient
    SessionResourceView --> _RecordingCodexAppServerClient
    SessionResourceView --> _FakeOpenCodeCompactClient
    SessionResourceView --> _FakeOpenCodeCompactServer
    SessionResourceView --> _PublishedEvent
    SessionResourceView --> _AutoCreateScenario
    SessionResourceView --> _LabelsAndEmptyHistoryServerClient
    SessionResourceView --> _AntigravityAutoCreateScenario
    SessionResourceView --> _AntigravitySnapshotServerClient
    SessionResourceView --> _EnsureTerminalCase
    SessionResourceView --> _EnsureCodexTerminalCase
    SessionResourceView --> _RecordedPatch
    SessionResourceView --> _WakePost
    SessionResourceView --> _QueuedResponseServerClient
    SessionResourceView --> _LabelPatchRecordingServerClient
    SessionResourceView --> _ForwarderRun
    SessionResourceView --> _StubResourceRegistry
    SessionResourceView --> _RelayEnv
    SessionResourceView --> _FakeOSEnvironment
    SessionResourceView --> _CapturingResourceRegistry
    SessionResourceView --> _SwitchableServerClient
    SessionResourceView --> _Response
    SessionResourceView --> _StatusEdge
    SessionResourceView --> _WatcherCapture
    SessionResourceView --> _LaunchReturningRegistry
    SkillSourceContext --> _CodexNativeModelOptionsNotReady
    SkillSourceContext --> _CodexNativeLaunchConfig
    SkillSourceContext --> _PiNativeLaunchConfig
    SkillSourceContext --> _KiroNativeLaunchConfig
    SkillSourceContext --> _OpenCodeNativeLaunchConfig
    SkillSourceContext --> ResolvedSpec
    SkillSourceContext --> _SessionSnapshot
    SkillSourceContext --> TurnDispatch
    SkillSourceContext --> _ContextWindowOverflow
    SkillSourceContext --> _SubagentWorkEntry
    SkillSourceContext --> _SubagentDeliveryAck
    SkillSourceContext --> _ChildParentMeta
    SkillSourceContext --> _BodyRequest
    SkillSourceContext --> OmnigentError
    _AgentTitle --> Tool
    _AgentTitle --> ToolContext
    _CallerTree --> Tool
    _CallerTree --> ToolContext
    _SessionResolution --> Tool
    _SessionResolution --> ToolContext
    SysSessionCloseTool --> Tool
    SysSessionCloseTool --> ToolContext
    SysSessionCloseTool --> _Fixture
    SysSessionSendTool --> Tool
    SysSessionSendTool --> ToolContext
    SysSessionSendTool --> _Fixture
    _CloseFailed --> OSEnvSpec
    _CloseFailed --> TerminalEnvSpec
    _CloseFailed --> TerminalInstance
    _CloseFailed --> AgentSpec
    _CloseFailed --> Tool
    _CloseFailed --> ToolContext
    _ResolvedInstance --> OSEnvSpec
    _ResolvedInstance --> TerminalEnvSpec
    _ResolvedInstance --> TerminalInstance
    _ResolvedInstance --> AgentSpec
    _ResolvedInstance --> Tool
    _ResolvedInstance --> ToolContext
    SysTerminalCloseTool --> _UCFunctionSchemaTool
    SysTerminalCloseTool --> ToolManager
    SysTerminalCloseTool --> OSEnvSpec
    SysTerminalCloseTool --> TerminalEnvSpec
    SysTerminalCloseTool --> TerminalInstance
    SysTerminalCloseTool --> AgentSpec
    SysTerminalCloseTool --> Tool
    SysTerminalCloseTool --> ToolContext
    SysTerminalCloseTool --> _FakeHarnessStream
    SysTerminalCloseTool --> _FakeHarnessClient
    SysTerminalCloseTool --> _FakeProcessManager
    SysTerminalCloseTool --> _RecordingProcessManager
    SysTerminalCloseTool --> _ContentCapturingProcessManager
    SysTerminalCloseTool --> _ContentCapturingHarnessClient
    SysTerminalCloseTool --> _StubTerminalInstance
    SysTerminalCloseTool --> _StubTerminalRegistry
    SysTerminalCloseTool --> _ModelSendResult
    SysTerminalCloseTool --> _GatedTwoTurnHarnessStream
    SysTerminalCloseTool --> _GatedTwoTurnHarnessClient
    SysTerminalLaunchTool --> _UCFunctionSchemaTool
    SysTerminalLaunchTool --> ToolManager
    SysTerminalLaunchTool --> OSEnvSpec
    SysTerminalLaunchTool --> TerminalEnvSpec
    SysTerminalLaunchTool --> TerminalInstance
    SysTerminalLaunchTool --> AgentSpec
    SysTerminalLaunchTool --> Tool
    SysTerminalLaunchTool --> ToolContext
    SysTerminalLaunchTool --> _FakeHarnessStream
    SysTerminalLaunchTool --> _FakeHarnessClient
    SysTerminalLaunchTool --> _FakeProcessManager
    SysTerminalLaunchTool --> _RecordingProcessManager
    SysTerminalLaunchTool --> _ContentCapturingProcessManager
    SysTerminalLaunchTool --> _ContentCapturingHarnessClient
    SysTerminalLaunchTool --> _StubTerminalInstance
    SysTerminalLaunchTool --> _StubTerminalRegistry
    SysTerminalLaunchTool --> _ModelSendResult
    SysTerminalLaunchTool --> _GatedTwoTurnHarnessStream
    SysTerminalLaunchTool --> _GatedTwoTurnHarnessClient
    _ValidatedLaunchArgs --> OSEnvSpec
    _ValidatedLaunchArgs --> TerminalEnvSpec
    _ValidatedLaunchArgs --> TerminalInstance
    _ValidatedLaunchArgs --> AgentSpec
    _ValidatedLaunchArgs --> Tool
    _ValidatedLaunchArgs --> ToolContext
    _IdleDetector --> OSEnvSandboxSpec
    _IdleDetector --> OSEnvSpec
    _IdleDetector --> TerminalEnvSpec
    _IdleDetector --> OSEnvironment
    TerminalCreateResult --> OSEnvSandboxSpec
    TerminalCreateResult --> OSEnvSpec
    TerminalCreateResult --> TerminalEnvSpec
    TerminalCreateResult --> OSEnvironment
    TerminalInstance --> OSEnvSandboxSpec
    TerminalInstance --> OSEnvSpec
    TerminalInstance --> TerminalEnvSpec
    TerminalInstance --> OSEnvironment
    TerminalInstance --> TerminalListEntry
    TerminalInstance --> TerminalRegistry
    TerminalInstance --> _CloseFailed
    TerminalInstance --> _ValidatedLaunchArgs
    TerminalInstance --> _ResolvedInstance
    TerminalInstance --> SysTerminalLaunchTool
    TerminalInstance --> SysTerminalCloseTool
    TerminalInstance --> _SuccessfulProcess
    TerminalInstance --> _ProcessWithStdout
    TerminalInstance --> NullServerClient
    TerminalInstance --> _Response
    TerminalInstance --> RunningFlagTerminalInstance
    TerminalInstance --> _FakeMcpManager
    TerminalInstance --> _StreamHandle
    TerminalInstance --> _ReadTimeoutTransport
    TerminalInstance --> _McpToolsListServerClient
    TerminalInstance --> _FakeFileServerClient
    TerminalInstance --> _StreamErrorHarnessClient
    TerminalInstance --> _ErrHandle
    TerminalInstance --> _SignalOnCreatedHarnessClient
    TerminalInstance --> _Handle
    TerminalInstance --> _BlockingHarnessClient
    TerminalInstance --> _BlockingHandle
    TerminalInstance --> _HandshakeHarnessClient
    TerminalInstance --> _NativeBlockingHarnessClient
    TerminalInstance --> _GatedFileServerClient
    TerminalInstance --> _Resp
    TerminalInstance --> _FakeServerClient
    TerminalInstance --> _OverflowThenSuccessHarnessClient
    TerminalInstance --> _ForwardBlockingHarnessClient
    TerminalInstance --> _WakeRecordingServerClient
    TerminalInstance --> _EventRecordingServerClient
    TerminalInstance --> _RecordingCodexAppServerClient
    TerminalInstance --> _FakeOpenCodeCompactClient
    TerminalInstance --> _FakeOpenCodeCompactServer
    TerminalInstance --> _PublishedEvent
    TerminalInstance --> _AutoCreateScenario
    TerminalInstance --> _LabelsAndEmptyHistoryServerClient
    TerminalInstance --> _AntigravityAutoCreateScenario
    TerminalInstance --> _AntigravitySnapshotServerClient
    TerminalInstance --> _EnsureTerminalCase
    TerminalInstance --> _EnsureCodexTerminalCase
    TerminalInstance --> _RecordedPatch
    TerminalInstance --> _WakePost
    TerminalInstance --> _QueuedResponseServerClient
    TerminalInstance --> _LabelPatchRecordingServerClient
    TerminalInstance --> _ForwarderRun
    TerminalInstance --> _FakeOSEnvironment
    TerminalInstance --> _FakeOSEnvironment
    TerminalInstance --> _CapturingResourceRegistry
    TerminalInstance --> _SwitchableServerClient
    TerminalInstance --> _Response
    TerminalInstance --> _StatusEdge
    TerminalInstance --> _WatcherCapture
    TerminalInstance --> _LaunchReturningRegistry
    TestCursorForkHistoryPreamble --> AgentSpec
    TestCursorForkHistoryPreamble --> ExecutorSpec
    TestCursorMessageItemText --> AgentSpec
    TestCursorMessageItemText --> ExecutorSpec
    _AntigravityAutoCreateScenario --> SessionResourceView
    _AntigravityAutoCreateScenario --> TerminalInstance
    _AntigravityAutoCreateScenario --> ResolvedSpec
    _AntigravityAutoCreateScenario --> McpSchemasResult
    _AntigravityAutoCreateScenario --> SessionResourceRegistry
    _AntigravityAutoCreateScenario --> AgentSpec
    _AntigravityAutoCreateScenario --> ExecutorSpec
    _AntigravityAutoCreateScenario --> LocalToolInfo
    _AntigravityAutoCreateScenario --> MCPServerConfig
    _AntigravityAutoCreateScenario --> NullServerClient
    _AntigravityAutoCreateScenario --> OSEnvSandboxSpec
    _AntigravityAutoCreateScenario --> OSEnvSpec
    _AntigravityAutoCreateScenario --> TerminalExitEvent
    _AntigravityAutoCreateScenario --> TerminalLifecycle
    _AntigravityAutoCreateScenario --> OpenCodeNativeBridgeState
    _AntigravityAutoCreateScenario --> OpenCodeSession
    _AntigravityAutoCreateScenario --> OpenCodeClientError
    _AntigravityAutoCreateScenario --> ClaudeNativeUcodeConfig
    _AntigravityAutoCreateScenario --> AdvisorVerdict
    _AntigravitySnapshotServerClient --> SessionResourceView
    _AntigravitySnapshotServerClient --> TerminalInstance
    _AntigravitySnapshotServerClient --> ResolvedSpec
    _AntigravitySnapshotServerClient --> McpSchemasResult
    _AntigravitySnapshotServerClient --> SessionResourceRegistry
    _AntigravitySnapshotServerClient --> AgentSpec
    _AntigravitySnapshotServerClient --> ExecutorSpec
    _AntigravitySnapshotServerClient --> LocalToolInfo
    _AntigravitySnapshotServerClient --> MCPServerConfig
    _AntigravitySnapshotServerClient --> NullServerClient
    _AntigravitySnapshotServerClient --> OSEnvSandboxSpec
    _AntigravitySnapshotServerClient --> OSEnvSpec
    _AntigravitySnapshotServerClient --> TerminalExitEvent
    _AntigravitySnapshotServerClient --> TerminalLifecycle
    _AntigravitySnapshotServerClient --> OpenCodeNativeBridgeState
    _AntigravitySnapshotServerClient --> OpenCodeSession
    _AntigravitySnapshotServerClient --> OpenCodeClientError
    _AntigravitySnapshotServerClient --> ClaudeNativeUcodeConfig
    _AntigravitySnapshotServerClient --> AdvisorVerdict
    _AutoCreateScenario --> SessionResourceView
    _AutoCreateScenario --> TerminalInstance
    _AutoCreateScenario --> ResolvedSpec
    _AutoCreateScenario --> McpSchemasResult
    _AutoCreateScenario --> SessionResourceRegistry
    _AutoCreateScenario --> AgentSpec
    _AutoCreateScenario --> ExecutorSpec
    _AutoCreateScenario --> LocalToolInfo
    _AutoCreateScenario --> MCPServerConfig
    _AutoCreateScenario --> NullServerClient
    _AutoCreateScenario --> OSEnvSandboxSpec
    _AutoCreateScenario --> OSEnvSpec
    _AutoCreateScenario --> TerminalExitEvent
    _AutoCreateScenario --> TerminalLifecycle
    _AutoCreateScenario --> OpenCodeNativeBridgeState
    _AutoCreateScenario --> OpenCodeSession
    _AutoCreateScenario --> OpenCodeClientError
    _AutoCreateScenario --> ClaudeNativeUcodeConfig
    _AutoCreateScenario --> AdvisorVerdict
    _BlockingHandle --> SessionResourceView
    _BlockingHandle --> TerminalInstance
    _BlockingHandle --> ResolvedSpec
    _BlockingHandle --> McpSchemasResult
    _BlockingHandle --> SessionResourceRegistry
    _BlockingHandle --> AgentSpec
    _BlockingHandle --> ExecutorSpec
    _BlockingHandle --> LocalToolInfo
    _BlockingHandle --> MCPServerConfig
    _BlockingHandle --> NullServerClient
    _BlockingHandle --> OSEnvSandboxSpec
    _BlockingHandle --> OSEnvSpec
    _BlockingHandle --> TerminalExitEvent
    _BlockingHandle --> TerminalLifecycle
    _BlockingHandle --> OpenCodeNativeBridgeState
    _BlockingHandle --> OpenCodeSession
    _BlockingHandle --> OpenCodeClientError
    _BlockingHandle --> ClaudeNativeUcodeConfig
    _BlockingHandle --> AdvisorVerdict
    _ForwardBlockingHarnessClient <|-- _BlockingHarnessClient
    _BlockingHarnessClient --> SessionResourceView
    _BlockingHarnessClient --> TerminalInstance
    _BlockingHarnessClient --> ResolvedSpec
    _BlockingHarnessClient --> McpSchemasResult
    _BlockingHarnessClient --> SessionResourceRegistry
    _BlockingHarnessClient --> AgentSpec
    _BlockingHarnessClient --> ExecutorSpec
    _BlockingHarnessClient --> LocalToolInfo
    _BlockingHarnessClient --> MCPServerConfig
    _BlockingHarnessClient --> NullServerClient
    _BlockingHarnessClient --> OSEnvSandboxSpec
    _BlockingHarnessClient --> OSEnvSpec
    _BlockingHarnessClient --> TerminalExitEvent
    _BlockingHarnessClient --> TerminalLifecycle
    _BlockingHarnessClient --> OpenCodeNativeBridgeState
    _BlockingHarnessClient --> OpenCodeSession
    _BlockingHarnessClient --> OpenCodeClientError
    _BlockingHarnessClient --> ClaudeNativeUcodeConfig
    _BlockingHarnessClient --> AdvisorVerdict
    _EnsureCodexTerminalCase --> SessionResourceView
    _EnsureCodexTerminalCase --> TerminalInstance
    _EnsureCodexTerminalCase --> ResolvedSpec
    _EnsureCodexTerminalCase --> McpSchemasResult
    _EnsureCodexTerminalCase --> SessionResourceRegistry
    _EnsureCodexTerminalCase --> AgentSpec
    _EnsureCodexTerminalCase --> ExecutorSpec
    _EnsureCodexTerminalCase --> LocalToolInfo
    _EnsureCodexTerminalCase --> MCPServerConfig
    _EnsureCodexTerminalCase --> NullServerClient
    _EnsureCodexTerminalCase --> OSEnvSandboxSpec
    _EnsureCodexTerminalCase --> OSEnvSpec
    _EnsureCodexTerminalCase --> TerminalExitEvent
    _EnsureCodexTerminalCase --> TerminalLifecycle
    _EnsureCodexTerminalCase --> OpenCodeNativeBridgeState
    _EnsureCodexTerminalCase --> OpenCodeSession
    _EnsureCodexTerminalCase --> OpenCodeClientError
    _EnsureCodexTerminalCase --> ClaudeNativeUcodeConfig
    _EnsureCodexTerminalCase --> AdvisorVerdict
    _EnsureTerminalCase --> SessionResourceView
    _EnsureTerminalCase --> TerminalInstance
    _EnsureTerminalCase --> ResolvedSpec
    _EnsureTerminalCase --> McpSchemasResult
    _EnsureTerminalCase --> SessionResourceRegistry
    _EnsureTerminalCase --> AgentSpec
    _EnsureTerminalCase --> ExecutorSpec
    _EnsureTerminalCase --> LocalToolInfo
    _EnsureTerminalCase --> MCPServerConfig
    _EnsureTerminalCase --> NullServerClient
    _EnsureTerminalCase --> OSEnvSandboxSpec
    _EnsureTerminalCase --> OSEnvSpec
    _EnsureTerminalCase --> TerminalExitEvent
    _EnsureTerminalCase --> TerminalLifecycle
    _EnsureTerminalCase --> OpenCodeNativeBridgeState
    _EnsureTerminalCase --> OpenCodeSession
    _EnsureTerminalCase --> OpenCodeClientError
    _EnsureTerminalCase --> ClaudeNativeUcodeConfig
    _EnsureTerminalCase --> AdvisorVerdict
    _ErrHandle --> SessionResourceView
    _ErrHandle --> TerminalInstance
    _ErrHandle --> ResolvedSpec
    _ErrHandle --> McpSchemasResult
    _ErrHandle --> SessionResourceRegistry
    _ErrHandle --> AgentSpec
    _ErrHandle --> ExecutorSpec
    _ErrHandle --> LocalToolInfo
    _ErrHandle --> MCPServerConfig
    _ErrHandle --> NullServerClient
    _ErrHandle --> OSEnvSandboxSpec
    _ErrHandle --> OSEnvSpec
    _ErrHandle --> TerminalExitEvent
    _ErrHandle --> TerminalLifecycle
    _ErrHandle --> OpenCodeNativeBridgeState
    _ErrHandle --> OpenCodeSession
    _ErrHandle --> OpenCodeClientError
    _ErrHandle --> ClaudeNativeUcodeConfig
    _ErrHandle --> AdvisorVerdict
    _EventRecordingServerClient --> SessionResourceView
    _EventRecordingServerClient --> TerminalInstance
    _EventRecordingServerClient --> ResolvedSpec
    _EventRecordingServerClient --> McpSchemasResult
    _EventRecordingServerClient --> SessionResourceRegistry
    _EventRecordingServerClient --> AgentSpec
    _EventRecordingServerClient --> ExecutorSpec
    _EventRecordingServerClient --> LocalToolInfo
    _EventRecordingServerClient --> MCPServerConfig
    _EventRecordingServerClient --> NullServerClient
    _EventRecordingServerClient --> OSEnvSandboxSpec
    _EventRecordingServerClient --> OSEnvSpec
    _EventRecordingServerClient --> TerminalExitEvent
    _EventRecordingServerClient --> TerminalLifecycle
    _EventRecordingServerClient --> OpenCodeNativeBridgeState
    _EventRecordingServerClient --> OpenCodeSession
    _EventRecordingServerClient --> OpenCodeClientError
    _EventRecordingServerClient --> ClaudeNativeUcodeConfig
    _EventRecordingServerClient --> AdvisorVerdict
    _FakeFileServerClient --> SessionResourceView
    _FakeFileServerClient --> TerminalInstance
    _FakeFileServerClient --> ResolvedSpec
    _FakeFileServerClient --> McpSchemasResult
    _FakeFileServerClient --> SessionResourceRegistry
    _FakeFileServerClient --> AgentSpec
    _FakeFileServerClient --> ExecutorSpec
    _FakeFileServerClient --> LocalToolInfo
    _FakeFileServerClient --> MCPServerConfig
    _FakeFileServerClient --> NullServerClient
    _FakeFileServerClient --> OSEnvSandboxSpec
    _FakeFileServerClient --> OSEnvSpec
    _FakeFileServerClient --> TerminalExitEvent
    _FakeFileServerClient --> TerminalLifecycle
    _FakeFileServerClient --> OpenCodeNativeBridgeState
    _FakeFileServerClient --> OpenCodeSession
    _FakeFileServerClient --> OpenCodeClientError
    _FakeFileServerClient --> ClaudeNativeUcodeConfig
    _FakeFileServerClient --> AdvisorVerdict
    _FakeMcpManager --> SessionResourceView
    _FakeMcpManager --> TerminalInstance
    _FakeMcpManager --> ResolvedSpec
    _FakeMcpManager --> McpSchemasResult
    _FakeMcpManager --> SessionResourceRegistry
    _FakeMcpManager --> AgentSpec
    _FakeMcpManager --> ExecutorSpec
    _FakeMcpManager --> LocalToolInfo
    _FakeMcpManager --> MCPServerConfig
    _FakeMcpManager --> NullServerClient
    _FakeMcpManager --> OSEnvSandboxSpec
    _FakeMcpManager --> OSEnvSpec
    _FakeMcpManager --> TerminalExitEvent
    _FakeMcpManager --> TerminalLifecycle
    _FakeMcpManager --> OpenCodeNativeBridgeState
    _FakeMcpManager --> OpenCodeSession
    _FakeMcpManager --> OpenCodeClientError
    _FakeMcpManager --> ClaudeNativeUcodeConfig
    _FakeMcpManager --> AdvisorVerdict
    _FakeOpenCodeCompactClient --> SessionResourceView
    _FakeOpenCodeCompactClient --> TerminalInstance
    _FakeOpenCodeCompactClient --> ResolvedSpec
    _FakeOpenCodeCompactClient --> McpSchemasResult
    _FakeOpenCodeCompactClient --> SessionResourceRegistry
    _FakeOpenCodeCompactClient --> AgentSpec
    _FakeOpenCodeCompactClient --> ExecutorSpec
    _FakeOpenCodeCompactClient --> LocalToolInfo
    _FakeOpenCodeCompactClient --> MCPServerConfig
    _FakeOpenCodeCompactClient --> NullServerClient
    _FakeOpenCodeCompactClient --> OSEnvSandboxSpec
    _FakeOpenCodeCompactClient --> OSEnvSpec
    _FakeOpenCodeCompactClient --> TerminalExitEvent
    _FakeOpenCodeCompactClient --> TerminalLifecycle
    _FakeOpenCodeCompactClient --> OpenCodeNativeBridgeState
    _FakeOpenCodeCompactClient --> OpenCodeSession
    _FakeOpenCodeCompactClient --> OpenCodeClientError
    _FakeOpenCodeCompactClient --> ClaudeNativeUcodeConfig
    _FakeOpenCodeCompactClient --> AdvisorVerdict
    _FakeOpenCodeCompactServer --> SessionResourceView
    _FakeOpenCodeCompactServer --> TerminalInstance
    _FakeOpenCodeCompactServer --> ResolvedSpec
    _FakeOpenCodeCompactServer --> McpSchemasResult
    _FakeOpenCodeCompactServer --> SessionResourceRegistry
    _FakeOpenCodeCompactServer --> AgentSpec
    _FakeOpenCodeCompactServer --> ExecutorSpec
    _FakeOpenCodeCompactServer --> LocalToolInfo
    _FakeOpenCodeCompactServer --> MCPServerConfig
    _FakeOpenCodeCompactServer --> NullServerClient
    _FakeOpenCodeCompactServer --> OSEnvSandboxSpec
    _FakeOpenCodeCompactServer --> OSEnvSpec
    _FakeOpenCodeCompactServer --> TerminalExitEvent
    _FakeOpenCodeCompactServer --> TerminalLifecycle
    _FakeOpenCodeCompactServer --> OpenCodeNativeBridgeState
    _FakeOpenCodeCompactServer --> OpenCodeSession
    _FakeOpenCodeCompactServer --> OpenCodeClientError
    _FakeOpenCodeCompactServer --> ClaudeNativeUcodeConfig
    _FakeOpenCodeCompactServer --> AdvisorVerdict
    _LabelPatchRecordingServerClient <|-- _FakeServerClient
    _FakeServerClient --> SessionResourceView
    _FakeServerClient --> TerminalInstance
    _FakeServerClient --> ResolvedSpec
    _FakeServerClient --> McpSchemasResult
    _FakeServerClient --> SessionResourceRegistry
    _FakeServerClient --> AgentSpec
    _FakeServerClient --> ExecutorSpec
    _FakeServerClient --> LocalToolInfo
    _FakeServerClient --> MCPServerConfig
    _FakeServerClient --> NullServerClient
    _FakeServerClient --> OSEnvSandboxSpec
    _FakeServerClient --> OSEnvSpec
    _FakeServerClient --> TerminalExitEvent
    _FakeServerClient --> TerminalLifecycle
    _FakeServerClient --> OpenCodeNativeBridgeState
    _FakeServerClient --> OpenCodeSession
    _FakeServerClient --> OpenCodeClientError
    _FakeServerClient --> ClaudeNativeUcodeConfig
    _FakeServerClient --> AdvisorVerdict
    _BlockingHarnessClient <|-- _ForwardBlockingHarnessClient
    _ForwardBlockingHarnessClient --> SessionResourceView
    _ForwardBlockingHarnessClient --> TerminalInstance
    _ForwardBlockingHarnessClient --> ResolvedSpec
    _ForwardBlockingHarnessClient --> McpSchemasResult
    _ForwardBlockingHarnessClient --> SessionResourceRegistry
    _ForwardBlockingHarnessClient --> AgentSpec
    _ForwardBlockingHarnessClient --> ExecutorSpec
    _ForwardBlockingHarnessClient --> LocalToolInfo
    _ForwardBlockingHarnessClient --> MCPServerConfig
    _ForwardBlockingHarnessClient --> NullServerClient
    _ForwardBlockingHarnessClient --> OSEnvSandboxSpec
    _ForwardBlockingHarnessClient --> OSEnvSpec
    _ForwardBlockingHarnessClient --> TerminalExitEvent
    _ForwardBlockingHarnessClient --> TerminalLifecycle
    _ForwardBlockingHarnessClient --> OpenCodeNativeBridgeState
    _ForwardBlockingHarnessClient --> OpenCodeSession
    _ForwardBlockingHarnessClient --> OpenCodeClientError
    _ForwardBlockingHarnessClient --> ClaudeNativeUcodeConfig
    _ForwardBlockingHarnessClient --> AdvisorVerdict
    _ForwarderRun --> SessionResourceView
    _ForwarderRun --> TerminalInstance
    _ForwarderRun --> ResolvedSpec
    _ForwarderRun --> McpSchemasResult
    _ForwarderRun --> SessionResourceRegistry
    _ForwarderRun --> AgentSpec
    _ForwarderRun --> ExecutorSpec
    _ForwarderRun --> LocalToolInfo
    _ForwarderRun --> MCPServerConfig
    _ForwarderRun --> NullServerClient
    _ForwarderRun --> OSEnvSandboxSpec
    _ForwarderRun --> OSEnvSpec
    _ForwarderRun --> TerminalExitEvent
    _ForwarderRun --> TerminalLifecycle
    _ForwarderRun --> OpenCodeNativeBridgeState
    _ForwarderRun --> OpenCodeSession
    _ForwarderRun --> OpenCodeClientError
    _ForwarderRun --> ClaudeNativeUcodeConfig
    _ForwarderRun --> AdvisorVerdict
    _GatedFileServerClient --> SessionResourceView
    _GatedFileServerClient --> TerminalInstance
    _GatedFileServerClient --> ResolvedSpec
    _GatedFileServerClient --> McpSchemasResult
    _GatedFileServerClient --> SessionResourceRegistry
    _GatedFileServerClient --> AgentSpec
    _GatedFileServerClient --> ExecutorSpec
    _GatedFileServerClient --> LocalToolInfo
    _GatedFileServerClient --> MCPServerConfig
    _GatedFileServerClient --> NullServerClient
    _GatedFileServerClient --> OSEnvSandboxSpec
    _GatedFileServerClient --> OSEnvSpec
    _GatedFileServerClient --> TerminalExitEvent
    _GatedFileServerClient --> TerminalLifecycle
    _GatedFileServerClient --> OpenCodeNativeBridgeState
    _GatedFileServerClient --> OpenCodeSession
    _GatedFileServerClient --> OpenCodeClientError
    _GatedFileServerClient --> ClaudeNativeUcodeConfig
    _GatedFileServerClient --> AdvisorVerdict
    _Handle --> SessionResourceView
    _Handle --> TerminalInstance
    _Handle --> ResolvedSpec
    _Handle --> McpSchemasResult
    _Handle --> SessionResourceRegistry
    _Handle --> AgentSpec
    _Handle --> ExecutorSpec
    _Handle --> LocalToolInfo
    _Handle --> MCPServerConfig
    _Handle --> NullServerClient
    _Handle --> OSEnvSandboxSpec
    _Handle --> OSEnvSpec
    _Handle --> TerminalExitEvent
    _Handle --> TerminalLifecycle
    _Handle --> OpenCodeNativeBridgeState
    _Handle --> OpenCodeSession
    _Handle --> OpenCodeClientError
    _Handle --> ClaudeNativeUcodeConfig
    _Handle --> AdvisorVerdict
    _HandshakeHarnessClient --> SessionResourceView
    _HandshakeHarnessClient --> TerminalInstance
    _HandshakeHarnessClient --> ResolvedSpec
    _HandshakeHarnessClient --> McpSchemasResult
    _HandshakeHarnessClient --> SessionResourceRegistry
    _HandshakeHarnessClient --> AgentSpec
    _HandshakeHarnessClient --> ExecutorSpec
    _HandshakeHarnessClient --> LocalToolInfo
    _HandshakeHarnessClient --> MCPServerConfig
    _HandshakeHarnessClient --> NullServerClient
    _HandshakeHarnessClient --> OSEnvSandboxSpec
    _HandshakeHarnessClient --> OSEnvSpec
    _HandshakeHarnessClient --> TerminalExitEvent
    _HandshakeHarnessClient --> TerminalLifecycle
    _HandshakeHarnessClient --> OpenCodeNativeBridgeState
    _HandshakeHarnessClient --> OpenCodeSession
    _HandshakeHarnessClient --> OpenCodeClientError
    _HandshakeHarnessClient --> ClaudeNativeUcodeConfig
    _HandshakeHarnessClient --> AdvisorVerdict
    _FakeServerClient <|-- _LabelPatchRecordingServerClient
    _LabelPatchRecordingServerClient --> SessionResourceView
    _LabelPatchRecordingServerClient --> TerminalInstance
    _LabelPatchRecordingServerClient --> ResolvedSpec
    _LabelPatchRecordingServerClient --> McpSchemasResult
    _LabelPatchRecordingServerClient --> SessionResourceRegistry
    _LabelPatchRecordingServerClient --> AgentSpec
    _LabelPatchRecordingServerClient --> ExecutorSpec
    _LabelPatchRecordingServerClient --> LocalToolInfo
    _LabelPatchRecordingServerClient --> MCPServerConfig
    _LabelPatchRecordingServerClient --> NullServerClient
    _LabelPatchRecordingServerClient --> OSEnvSandboxSpec
    _LabelPatchRecordingServerClient --> OSEnvSpec
    _LabelPatchRecordingServerClient --> TerminalExitEvent
    _LabelPatchRecordingServerClient --> TerminalLifecycle
    _LabelPatchRecordingServerClient --> OpenCodeNativeBridgeState
    _LabelPatchRecordingServerClient --> OpenCodeSession
    _LabelPatchRecordingServerClient --> OpenCodeClientError
    _LabelPatchRecordingServerClient --> ClaudeNativeUcodeConfig
    _LabelPatchRecordingServerClient --> AdvisorVerdict
    _LabelsAndEmptyHistoryServerClient --> SessionResourceView
    _LabelsAndEmptyHistoryServerClient --> TerminalInstance
    _LabelsAndEmptyHistoryServerClient --> ResolvedSpec
    _LabelsAndEmptyHistoryServerClient --> McpSchemasResult
    _LabelsAndEmptyHistoryServerClient --> SessionResourceRegistry
    _LabelsAndEmptyHistoryServerClient --> AgentSpec
    _LabelsAndEmptyHistoryServerClient --> ExecutorSpec
    _LabelsAndEmptyHistoryServerClient --> LocalToolInfo
    _LabelsAndEmptyHistoryServerClient --> MCPServerConfig
    _LabelsAndEmptyHistoryServerClient --> NullServerClient
    _LabelsAndEmptyHistoryServerClient --> OSEnvSandboxSpec
    _LabelsAndEmptyHistoryServerClient --> OSEnvSpec
    _LabelsAndEmptyHistoryServerClient --> TerminalExitEvent
    _LabelsAndEmptyHistoryServerClient --> TerminalLifecycle
    _LabelsAndEmptyHistoryServerClient --> OpenCodeNativeBridgeState
    _LabelsAndEmptyHistoryServerClient --> OpenCodeSession
    _LabelsAndEmptyHistoryServerClient --> OpenCodeClientError
    _LabelsAndEmptyHistoryServerClient --> ClaudeNativeUcodeConfig
    _LabelsAndEmptyHistoryServerClient --> AdvisorVerdict
    _McpToolsListServerClient --> SessionResourceView
    _McpToolsListServerClient --> TerminalInstance
    _McpToolsListServerClient --> ResolvedSpec
    _McpToolsListServerClient --> McpSchemasResult
    _McpToolsListServerClient --> SessionResourceRegistry
    _McpToolsListServerClient --> AgentSpec
    _McpToolsListServerClient --> ExecutorSpec
    _McpToolsListServerClient --> LocalToolInfo
    _McpToolsListServerClient --> MCPServerConfig
    _McpToolsListServerClient --> NullServerClient
    _McpToolsListServerClient --> OSEnvSandboxSpec
    _McpToolsListServerClient --> OSEnvSpec
    _McpToolsListServerClient --> TerminalExitEvent
    _McpToolsListServerClient --> TerminalLifecycle
    _McpToolsListServerClient --> OpenCodeNativeBridgeState
    _McpToolsListServerClient --> OpenCodeSession
    _McpToolsListServerClient --> OpenCodeClientError
    _McpToolsListServerClient --> ClaudeNativeUcodeConfig
    _McpToolsListServerClient --> AdvisorVerdict
    _NativeBlockingHarnessClient --> SessionResourceView
    _NativeBlockingHarnessClient --> TerminalInstance
    _NativeBlockingHarnessClient --> ResolvedSpec
    _NativeBlockingHarnessClient --> McpSchemasResult
    _NativeBlockingHarnessClient --> SessionResourceRegistry
    _NativeBlockingHarnessClient --> AgentSpec
    _NativeBlockingHarnessClient --> ExecutorSpec
    _NativeBlockingHarnessClient --> LocalToolInfo
    _NativeBlockingHarnessClient --> MCPServerConfig
    _NativeBlockingHarnessClient --> NullServerClient
    _NativeBlockingHarnessClient --> OSEnvSandboxSpec
    _NativeBlockingHarnessClient --> OSEnvSpec
    _NativeBlockingHarnessClient --> TerminalExitEvent
    _NativeBlockingHarnessClient --> TerminalLifecycle
    _NativeBlockingHarnessClient --> OpenCodeNativeBridgeState
    _NativeBlockingHarnessClient --> OpenCodeSession
    _NativeBlockingHarnessClient --> OpenCodeClientError
    _NativeBlockingHarnessClient --> ClaudeNativeUcodeConfig
    _NativeBlockingHarnessClient --> AdvisorVerdict
    _OverflowThenSuccessHarnessClient --> SessionResourceView
    _OverflowThenSuccessHarnessClient --> TerminalInstance
    _OverflowThenSuccessHarnessClient --> ResolvedSpec
    _OverflowThenSuccessHarnessClient --> McpSchemasResult
    _OverflowThenSuccessHarnessClient --> SessionResourceRegistry
    _OverflowThenSuccessHarnessClient --> AgentSpec
    _OverflowThenSuccessHarnessClient --> ExecutorSpec
    _OverflowThenSuccessHarnessClient --> LocalToolInfo
    _OverflowThenSuccessHarnessClient --> MCPServerConfig
    _OverflowThenSuccessHarnessClient --> NullServerClient
    _OverflowThenSuccessHarnessClient --> OSEnvSandboxSpec
    _OverflowThenSuccessHarnessClient --> OSEnvSpec
    _OverflowThenSuccessHarnessClient --> TerminalExitEvent
    _OverflowThenSuccessHarnessClient --> TerminalLifecycle
    _OverflowThenSuccessHarnessClient --> OpenCodeNativeBridgeState
    _OverflowThenSuccessHarnessClient --> OpenCodeSession
    _OverflowThenSuccessHarnessClient --> OpenCodeClientError
    _OverflowThenSuccessHarnessClient --> ClaudeNativeUcodeConfig
    _OverflowThenSuccessHarnessClient --> AdvisorVerdict
    _PublishedEvent --> SessionResourceView
    _PublishedEvent --> TerminalInstance
    _PublishedEvent --> ResolvedSpec
    _PublishedEvent --> McpSchemasResult
    _PublishedEvent --> SessionResourceRegistry
    _PublishedEvent --> AgentSpec
    _PublishedEvent --> ExecutorSpec
    _PublishedEvent --> LocalToolInfo
    _PublishedEvent --> MCPServerConfig
    _PublishedEvent --> NullServerClient
    _PublishedEvent --> OSEnvSandboxSpec
    _PublishedEvent --> OSEnvSpec
    _PublishedEvent --> TerminalExitEvent
    _PublishedEvent --> TerminalLifecycle
    _PublishedEvent --> OpenCodeNativeBridgeState
    _PublishedEvent --> OpenCodeSession
    _PublishedEvent --> OpenCodeClientError
    _PublishedEvent --> ClaudeNativeUcodeConfig
    _PublishedEvent --> AdvisorVerdict
    _QueuedResponseServerClient --> SessionResourceView
    _QueuedResponseServerClient --> TerminalInstance
    _QueuedResponseServerClient --> ResolvedSpec
    _QueuedResponseServerClient --> McpSchemasResult
    _QueuedResponseServerClient --> SessionResourceRegistry
    _QueuedResponseServerClient --> AgentSpec
    _QueuedResponseServerClient --> ExecutorSpec
    _QueuedResponseServerClient --> LocalToolInfo
    _QueuedResponseServerClient --> MCPServerConfig
    _QueuedResponseServerClient --> NullServerClient
    _QueuedResponseServerClient --> OSEnvSandboxSpec
    _QueuedResponseServerClient --> OSEnvSpec
    _QueuedResponseServerClient --> TerminalExitEvent
    _QueuedResponseServerClient --> TerminalLifecycle
    _QueuedResponseServerClient --> OpenCodeNativeBridgeState
    _QueuedResponseServerClient --> OpenCodeSession
    _QueuedResponseServerClient --> OpenCodeClientError
    _QueuedResponseServerClient --> ClaudeNativeUcodeConfig
    _QueuedResponseServerClient --> AdvisorVerdict
    _ReadTimeoutTransport --> SessionResourceView
    _ReadTimeoutTransport --> TerminalInstance
    _ReadTimeoutTransport --> ResolvedSpec
    _ReadTimeoutTransport --> McpSchemasResult
    _ReadTimeoutTransport --> SessionResourceRegistry
    _ReadTimeoutTransport --> AgentSpec
    _ReadTimeoutTransport --> ExecutorSpec
    _ReadTimeoutTransport --> LocalToolInfo
    _ReadTimeoutTransport --> MCPServerConfig
    _ReadTimeoutTransport --> NullServerClient
    _ReadTimeoutTransport --> OSEnvSandboxSpec
    _ReadTimeoutTransport --> OSEnvSpec
    _ReadTimeoutTransport --> TerminalExitEvent
    _ReadTimeoutTransport --> TerminalLifecycle
    _ReadTimeoutTransport --> OpenCodeNativeBridgeState
    _ReadTimeoutTransport --> OpenCodeSession
    _ReadTimeoutTransport --> OpenCodeClientError
    _ReadTimeoutTransport --> ClaudeNativeUcodeConfig
    _ReadTimeoutTransport --> AdvisorVerdict
    _RecordedPatch --> SessionResourceView
    _RecordedPatch --> TerminalInstance
    _RecordedPatch --> ResolvedSpec
    _RecordedPatch --> McpSchemasResult
    _RecordedPatch --> SessionResourceRegistry
    _RecordedPatch --> AgentSpec
    _RecordedPatch --> ExecutorSpec
    _RecordedPatch --> LocalToolInfo
    _RecordedPatch --> MCPServerConfig
    _RecordedPatch --> NullServerClient
    _RecordedPatch --> OSEnvSandboxSpec
    _RecordedPatch --> OSEnvSpec
    _RecordedPatch --> TerminalExitEvent
    _RecordedPatch --> TerminalLifecycle
    _RecordedPatch --> OpenCodeNativeBridgeState
    _RecordedPatch --> OpenCodeSession
    _RecordedPatch --> OpenCodeClientError
    _RecordedPatch --> ClaudeNativeUcodeConfig
    _RecordedPatch --> AdvisorVerdict
    _RecordingCodexAppServerClient --> SessionResourceView
    _RecordingCodexAppServerClient --> TerminalInstance
    _RecordingCodexAppServerClient --> ResolvedSpec
    _RecordingCodexAppServerClient --> McpSchemasResult
    _RecordingCodexAppServerClient --> SessionResourceRegistry
    _RecordingCodexAppServerClient --> AgentSpec
    _RecordingCodexAppServerClient --> ExecutorSpec
    _RecordingCodexAppServerClient --> LocalToolInfo
    _RecordingCodexAppServerClient --> MCPServerConfig
    _RecordingCodexAppServerClient --> NullServerClient
    _RecordingCodexAppServerClient --> OSEnvSandboxSpec
    _RecordingCodexAppServerClient --> OSEnvSpec
    _RecordingCodexAppServerClient --> TerminalExitEvent
    _RecordingCodexAppServerClient --> TerminalLifecycle
    _RecordingCodexAppServerClient --> OpenCodeNativeBridgeState
    _RecordingCodexAppServerClient --> OpenCodeSession
    _RecordingCodexAppServerClient --> OpenCodeClientError
    _RecordingCodexAppServerClient --> ClaudeNativeUcodeConfig
    _RecordingCodexAppServerClient --> AdvisorVerdict
    _Resp --> SessionResourceView
    _Resp --> TerminalInstance
    _Resp --> ResolvedSpec
    _Resp --> McpSchemasResult
    _Resp --> SessionResourceRegistry
    _Resp --> AgentSpec
    _Resp --> ExecutorSpec
    _Resp --> LocalToolInfo
    _Resp --> MCPServerConfig
    _Resp --> NullServerClient
    _Resp --> OSEnvSandboxSpec
    _Resp --> OSEnvSpec
    _Resp --> TerminalExitEvent
    _Resp --> TerminalLifecycle
    _Resp --> OpenCodeNativeBridgeState
    _Resp --> OpenCodeSession
    _Resp --> OpenCodeClientError
    _Resp --> ClaudeNativeUcodeConfig
    _Resp --> AdvisorVerdict
    _SignalOnCreatedHarnessClient --> SessionResourceView
    _SignalOnCreatedHarnessClient --> TerminalInstance
    _SignalOnCreatedHarnessClient --> ResolvedSpec
    _SignalOnCreatedHarnessClient --> McpSchemasResult
    _SignalOnCreatedHarnessClient --> SessionResourceRegistry
    _SignalOnCreatedHarnessClient --> AgentSpec
    _SignalOnCreatedHarnessClient --> ExecutorSpec
    _SignalOnCreatedHarnessClient --> LocalToolInfo
    _SignalOnCreatedHarnessClient --> MCPServerConfig
    _SignalOnCreatedHarnessClient --> NullServerClient
    _SignalOnCreatedHarnessClient --> OSEnvSandboxSpec
    _SignalOnCreatedHarnessClient --> OSEnvSpec
    _SignalOnCreatedHarnessClient --> TerminalExitEvent
    _SignalOnCreatedHarnessClient --> TerminalLifecycle
    _SignalOnCreatedHarnessClient --> OpenCodeNativeBridgeState
    _SignalOnCreatedHarnessClient --> OpenCodeSession
    _SignalOnCreatedHarnessClient --> OpenCodeClientError
    _SignalOnCreatedHarnessClient --> ClaudeNativeUcodeConfig
    _SignalOnCreatedHarnessClient --> AdvisorVerdict
    _StreamErrorHarnessClient --> SessionResourceView
    _StreamErrorHarnessClient --> TerminalInstance
    _StreamErrorHarnessClient --> ResolvedSpec
    _StreamErrorHarnessClient --> McpSchemasResult
    _StreamErrorHarnessClient --> SessionResourceRegistry
    _StreamErrorHarnessClient --> AgentSpec
    _StreamErrorHarnessClient --> ExecutorSpec
    _StreamErrorHarnessClient --> LocalToolInfo
    _StreamErrorHarnessClient --> MCPServerConfig
    _StreamErrorHarnessClient --> NullServerClient
    _StreamErrorHarnessClient --> OSEnvSandboxSpec
    _StreamErrorHarnessClient --> OSEnvSpec
    _StreamErrorHarnessClient --> TerminalExitEvent
    _StreamErrorHarnessClient --> TerminalLifecycle
    _StreamErrorHarnessClient --> OpenCodeNativeBridgeState
    _StreamErrorHarnessClient --> OpenCodeSession
    _StreamErrorHarnessClient --> OpenCodeClientError
    _StreamErrorHarnessClient --> ClaudeNativeUcodeConfig
    _StreamErrorHarnessClient --> AdvisorVerdict
    _StreamHandle --> SessionResourceView
    _StreamHandle --> TerminalInstance
    _StreamHandle --> ResolvedSpec
    _StreamHandle --> McpSchemasResult
    _StreamHandle --> SessionResourceRegistry
    _StreamHandle --> AgentSpec
    _StreamHandle --> ExecutorSpec
    _StreamHandle --> LocalToolInfo
    _StreamHandle --> MCPServerConfig
    _StreamHandle --> NullServerClient
    _StreamHandle --> OSEnvSandboxSpec
    _StreamHandle --> OSEnvSpec
    _StreamHandle --> TerminalExitEvent
    _StreamHandle --> TerminalLifecycle
    _StreamHandle --> OpenCodeNativeBridgeState
    _StreamHandle --> OpenCodeSession
    _StreamHandle --> OpenCodeClientError
    _StreamHandle --> ClaudeNativeUcodeConfig
    _StreamHandle --> AdvisorVerdict
    _WakePost --> SessionResourceView
    _WakePost --> TerminalInstance
    _WakePost --> ResolvedSpec
    _WakePost --> McpSchemasResult
    _WakePost --> SessionResourceRegistry
    _WakePost --> AgentSpec
    _WakePost --> ExecutorSpec
    _WakePost --> LocalToolInfo
    _WakePost --> MCPServerConfig
    _WakePost --> NullServerClient
    _WakePost --> OSEnvSandboxSpec
    _WakePost --> OSEnvSpec
    _WakePost --> TerminalExitEvent
    _WakePost --> TerminalLifecycle
    _WakePost --> OpenCodeNativeBridgeState
    _WakePost --> OpenCodeSession
    _WakePost --> OpenCodeClientError
    _WakePost --> ClaudeNativeUcodeConfig
    _WakePost --> AdvisorVerdict
    _WakeRecordingServerClient --> SessionResourceView
    _WakeRecordingServerClient --> TerminalInstance
    _WakeRecordingServerClient --> ResolvedSpec
    _WakeRecordingServerClient --> McpSchemasResult
    _WakeRecordingServerClient --> SessionResourceRegistry
    _WakeRecordingServerClient --> AgentSpec
    _WakeRecordingServerClient --> ExecutorSpec
    _WakeRecordingServerClient --> LocalToolInfo
    _WakeRecordingServerClient --> MCPServerConfig
    _WakeRecordingServerClient --> NullServerClient
    _WakeRecordingServerClient --> OSEnvSandboxSpec
    _WakeRecordingServerClient --> OSEnvSpec
    _WakeRecordingServerClient --> TerminalExitEvent
    _WakeRecordingServerClient --> TerminalLifecycle
    _WakeRecordingServerClient --> OpenCodeNativeBridgeState
    _WakeRecordingServerClient --> OpenCodeSession
    _WakeRecordingServerClient --> OpenCodeClientError
    _WakeRecordingServerClient --> ClaudeNativeUcodeConfig
    _WakeRecordingServerClient --> AdvisorVerdict
    ProbeResult --> BwrapSandboxBackend
    ProbeResult --> OSEnvSandboxSpec
    ProbeResult --> OSEnvSpec
    ProbeResult --> MaskedEntry
    _AttachCallRecord --> ClaudeLauncher
    _AttachCallRecord --> UcodeAgentState
    _AttachCallRecord --> UcodeWorkspaceState
    _AttachCallRecord --> AgentSpec
    _AttachCallRecord --> ExecutorSpec
    _AttachWSContext --> ClaudeLauncher
    _AttachWSContext --> UcodeAgentState
    _AttachWSContext --> UcodeWorkspaceState
    _AttachWSContext --> AgentSpec
    _AttachWSContext --> ExecutorSpec
    _AttachWSStub --> ClaudeLauncher
    _AttachWSStub --> UcodeAgentState
    _AttachWSStub --> UcodeWorkspaceState
    _AttachWSStub --> AgentSpec
    _AttachWSStub --> ExecutorSpec
    _capture_warnings --> ClaudeLauncher
    _capture_warnings --> UcodeAgentState
    _capture_warnings --> UcodeWorkspaceState
    _capture_warnings --> AgentSpec
    _capture_warnings --> ExecutorSpec
    _FakeTerminalServer --> ClaudeLauncher
    _FakeTerminalServer --> UcodeAgentState
    _FakeTerminalServer --> UcodeWorkspaceState
    _FakeTerminalServer --> AgentSpec
    _FakeTerminalServer --> ExecutorSpec
    _HeaderRecordingAttach --> ClaudeLauncher
    _HeaderRecordingAttach --> UcodeAgentState
    _HeaderRecordingAttach --> UcodeWorkspaceState
    _HeaderRecordingAttach --> AgentSpec
    _HeaderRecordingAttach --> ExecutorSpec
    _ScriptedAttach --> ClaudeLauncher
    _ScriptedAttach --> UcodeAgentState
    _ScriptedAttach --> UcodeWorkspaceState
    _ScriptedAttach --> AgentSpec
    _ScriptedAttach --> ExecutorSpec
    _WorkspaceActionTtyResult --> ClaudeLauncher
    _WorkspaceActionTtyResult --> UcodeAgentState
    _WorkspaceActionTtyResult --> UcodeWorkspaceState
    _WorkspaceActionTtyResult --> AgentSpec
    _WorkspaceActionTtyResult --> ExecutorSpec
    TestCodexCommandPreview --> OmnigentError
    TestExecpolicyAmendment --> OmnigentError
    TestJsonPreview --> OmnigentError
    TestStringListAnswer --> OmnigentError
    _HelpProc --> CodexNativeAppServer
    _CapturedSessionEvent --> CodexNativeBridgeState
    _DenyHttpxClient --> CodexNativeBridgeState
    _RaisesIfCalled --> CodexNativeBridgeState
    _RelayEnv --> SessionResourceView
    _RelayEnv --> TerminalEnvSpec
    _RelayEnv --> NullServerClient
    _StubResourceRegistry --> SessionResourceView
    _StubResourceRegistry --> TerminalEnvSpec
    _StubResourceRegistry --> NullServerClient
    _PatchCapture --> AdvisorVerdict
    _PatchCapture --> AdvisorConfig
    _PatchCapture --> AgentSpec
    _PatchCapture --> ExecutorSpec
    _ScriptedJudge --> AdvisorVerdict
    _ScriptedJudge --> AdvisorConfig
    _ScriptedJudge --> AgentSpec
    _ScriptedJudge --> ExecutorSpec
    TestAgentDef --> AgentDef
    TestAgentDef --> MemoryConfig
    _CapturingUpstream --> CredentialProxyEntry
    _CapturingUpstream --> CredentialProxySpec
    _CapturingUpstream --> CredentialSourceSpec
    _CapturingUpstream --> OSEnvSandboxSpec
    _CapturingUpstream --> OSEnvSpec
    _FakeProcessManager --> AgentSpec
    _FakeProcessManager --> ExecutorSpec
    _FakeProcessManager --> GuardrailsSpec
    _FakeProcessManager --> NullServerClient
    _FakeProcessManager --> OSEnvSandboxSpec
    _FakeProcessManager --> OSEnvSpec
    _ScriptedHarnessClient --> AgentSpec
    _ScriptedHarnessClient --> ExecutorSpec
    _ScriptedHarnessClient --> GuardrailsSpec
    _ScriptedHarnessClient --> NullServerClient
    _ScriptedHarnessClient --> OSEnvSandboxSpec
    _ScriptedHarnessClient --> OSEnvSpec
    TestInstructionsField --> ExecutorSpec
    TestInstructionsField --> OSEnvSandboxSpec
    TestInstructionsField --> OSEnvSpec
    TestInstructionsField --> FunctionPolicy
    TestInstructionsField --> PromptPolicy
    TestInstructionsField --> AgentTool
    TestInstructionsField --> CancellableFunctionTool
    TestInstructionsField --> FunctionTool
    TestInstructionsField --> HandoffTool
    TestInstructionsField --> InheritedTool
    TestInstructionsField --> MCPTool
    TestInstructionsField --> SkillTool
    TestLoadFromDict --> ExecutorSpec
    TestLoadFromDict --> OSEnvSandboxSpec
    TestLoadFromDict --> OSEnvSpec
    TestLoadFromDict --> FunctionPolicy
    TestLoadFromDict --> PromptPolicy
    TestLoadFromDict --> AgentTool
    TestLoadFromDict --> CancellableFunctionTool
    TestLoadFromDict --> FunctionTool
    TestLoadFromDict --> HandoffTool
    TestLoadFromDict --> InheritedTool
    TestLoadFromDict --> MCPTool
    TestLoadFromDict --> SkillTool
    TestLoadFromYAML --> ExecutorSpec
    TestLoadFromYAML --> OSEnvSandboxSpec
    TestLoadFromYAML --> OSEnvSpec
    TestLoadFromYAML --> FunctionPolicy
    TestLoadFromYAML --> PromptPolicy
    TestLoadFromYAML --> AgentTool
    TestLoadFromYAML --> CancellableFunctionTool
    TestLoadFromYAML --> FunctionTool
    TestLoadFromYAML --> HandoffTool
    TestLoadFromYAML --> InheritedTool
    TestLoadFromYAML --> MCPTool
    TestLoadFromYAML --> SkillTool
    _TestSleepRunner --> ExecutorSpec
    _TestSleepRunner --> OSEnvSandboxSpec
    _TestSleepRunner --> OSEnvSpec
    _TestSleepRunner --> FunctionPolicy
    _TestSleepRunner --> PromptPolicy
    _TestSleepRunner --> AgentTool
    _TestSleepRunner --> CancellableFunctionTool
    _TestSleepRunner --> FunctionTool
    _TestSleepRunner --> HandoffTool
    _TestSleepRunner --> InheritedTool
    _TestSleepRunner --> MCPTool
    _TestSleepRunner --> SkillTool
    CapturedHttpArgs --> MCPServerConfig
    CapturedHttpArgs --> McpElicitationRequired
    CapturedHttpArgs --> McpServerConnection
    CapturedHttpArgs --> McpServerDisabledError
    _FakeConn --> McpSchemasResult
    _FakeConn --> RunnerMcpManager
    _FakeConn --> AgentSpec
    _FakeConn --> MCPServerConfig
    _FakeConn --> McpToolEntry
    _FakeConn --> AgentSpec
    _FakeConn --> MCPServerConfig
    _SubAgentSnapshotServer <|-- _CatchUpServer
    _CatchUpServer --> AgentSpec
    _CatchUpServer --> ExecutorSpec
    _Resp --> AgentSpec
    _Resp --> ExecutorSpec
    _CatchUpServer <|-- _SubAgentSnapshotServer
    _SubAgentSnapshotServer --> AgentSpec
    _SubAgentSnapshotServer --> ExecutorSpec
    _AgentDefYamlPair --> OmnigentError
    _AgentDefYamlPair --> AgentSpec
    _AgentDefYamlPair --> AgentDef
    _AgentDefYamlPair --> ToolRuntime
    _AgentDefYamlPair --> OSEnvSpec
    _AgentDefYamlPair --> MCPTool
    _AgentDefYamlPair --> ExecutorSpec
    _AgentDefYamlPair --> CancellableFunctionTool
    _AgentDefYamlPair --> FunctionTool
    _AgentDefYamlPair --> OSEnvSandboxSpec
    _AgentDefYamlPair --> AgentTool
    _AgentDefYamlPair --> TerminalEnvSpec
    _AgentDefYamlPair --> SelfAgentTool
    _AgentDefYamlPair --> DatabricksAuth
    _AgentDefYamlPair --> ApiKeyAuth
    _StubCancellableRunner --> OmnigentError
    _StubCancellableRunner --> AgentSpec
    _StubCancellableRunner --> AgentDef
    _StubCancellableRunner --> ToolRuntime
    _StubCancellableRunner --> OSEnvSpec
    _StubCancellableRunner --> MCPTool
    _StubCancellableRunner --> ExecutorSpec
    _StubCancellableRunner --> CancellableFunctionTool
    _StubCancellableRunner --> FunctionTool
    _StubCancellableRunner --> OSEnvSandboxSpec
    _StubCancellableRunner --> AgentTool
    _StubCancellableRunner --> TerminalEnvSpec
    _StubCancellableRunner --> SelfAgentTool
    _StubCancellableRunner --> DatabricksAuth
    _StubCancellableRunner --> ApiKeyAuth
    TestForkYAMLLoading --> OSEnvSandboxSpec
    TestForkYAMLLoading --> OSEnvSpec
    _AliveProc --> HarnessProcessManager
    _StubTransport --> McpSchemasResult
    _StubTransport --> ProxyMcpManager
    _StubTransport --> AgentSpec
    _StubTransport --> MCPServerConfig
    _FakeOSEnvironment --> OSEnvSandboxSpec
    _FakeOSEnvironment --> OSEnvSpec
    _FakeOSEnvironment --> TerminalEnvSpec
    _FakeOSEnvironment --> OSEnvironment
    _FakeOSEnvironment --> TerminalInstance
    _FakeOSEnvironment --> SessionResourceRegistry
    _FakeOSEnvironment --> TerminalExitEvent
    _FakeOSEnvironment --> TerminalLifecycle
    _FakeOSEnvironment --> NullServerClient
    _ContentCapturingHarnessClient --> HarnessProcessManager
    _ContentCapturingHarnessClient --> AgentSpec
    _ContentCapturingHarnessClient --> ExecutorSpec
    _ContentCapturingHarnessClient --> SharePolicy
    _ContentCapturingHarnessClient --> NullServerClient
    _ContentCapturingHarnessClient --> ErrorCode
    _ContentCapturingHarnessClient --> OmnigentError
    _ContentCapturingHarnessClient --> OSEnvSandboxSpec
    _ContentCapturingHarnessClient --> OSEnvSpec
    _ContentCapturingHarnessClient --> TerminalEnvSpec
    _ContentCapturingHarnessClient --> ToolContext
    _ContentCapturingHarnessClient --> SysTerminalLaunchTool
    _ContentCapturingHarnessClient --> SysTerminalCloseTool
    _ContentCapturingHarnessClient --> ToolsConfig
    _ContentCapturingHarnessClient --> ToolManager
    _ContentCapturingHarnessClient --> TerminalRegistry
    _ContentCapturingHarnessClient --> ApprovalEvent
    _ContentCapturingProcessManager --> HarnessProcessManager
    _ContentCapturingProcessManager --> AgentSpec
    _ContentCapturingProcessManager --> ExecutorSpec
    _ContentCapturingProcessManager --> SharePolicy
    _ContentCapturingProcessManager --> NullServerClient
    _ContentCapturingProcessManager --> ErrorCode
    _ContentCapturingProcessManager --> OmnigentError
    _ContentCapturingProcessManager --> OSEnvSandboxSpec
    _ContentCapturingProcessManager --> OSEnvSpec
    _ContentCapturingProcessManager --> TerminalEnvSpec
    _ContentCapturingProcessManager --> ToolContext
    _ContentCapturingProcessManager --> SysTerminalLaunchTool
    _ContentCapturingProcessManager --> SysTerminalCloseTool
    _ContentCapturingProcessManager --> ToolsConfig
    _ContentCapturingProcessManager --> ToolManager
    _ContentCapturingProcessManager --> TerminalRegistry
    _ContentCapturingProcessManager --> ApprovalEvent
    _FakeHarnessClient --> HarnessProcessManager
    _FakeHarnessClient --> AgentSpec
    _FakeHarnessClient --> ExecutorSpec
    _FakeHarnessClient --> SharePolicy
    _FakeHarnessClient --> NullServerClient
    _FakeHarnessClient --> ErrorCode
    _FakeHarnessClient --> OmnigentError
    _FakeHarnessClient --> OSEnvSandboxSpec
    _FakeHarnessClient --> OSEnvSpec
    _FakeHarnessClient --> TerminalEnvSpec
    _FakeHarnessClient --> ToolContext
    _FakeHarnessClient --> SysTerminalLaunchTool
    _FakeHarnessClient --> SysTerminalCloseTool
    _FakeHarnessClient --> ToolsConfig
    _FakeHarnessClient --> ToolManager
    _FakeHarnessClient --> TerminalRegistry
    _FakeHarnessClient --> ApprovalEvent
    _FakeHarnessStream --> HarnessProcessManager
    _FakeHarnessStream --> AgentSpec
    _FakeHarnessStream --> ExecutorSpec
    _FakeHarnessStream --> SharePolicy
    _FakeHarnessStream --> NullServerClient
    _FakeHarnessStream --> ErrorCode
    _FakeHarnessStream --> OmnigentError
    _FakeHarnessStream --> OSEnvSandboxSpec
    _FakeHarnessStream --> OSEnvSpec
    _FakeHarnessStream --> TerminalEnvSpec
    _FakeHarnessStream --> ToolContext
    _FakeHarnessStream --> SysTerminalLaunchTool
    _FakeHarnessStream --> SysTerminalCloseTool
    _FakeHarnessStream --> ToolsConfig
    _FakeHarnessStream --> ToolManager
    _FakeHarnessStream --> TerminalRegistry
    _FakeHarnessStream --> ApprovalEvent
    _FakeProcessManager --> HarnessProcessManager
    _FakeProcessManager --> AgentSpec
    _FakeProcessManager --> ExecutorSpec
    _FakeProcessManager --> SharePolicy
    _FakeProcessManager --> NullServerClient
    _FakeProcessManager --> ErrorCode
    _FakeProcessManager --> OmnigentError
    _FakeProcessManager --> OSEnvSandboxSpec
    _FakeProcessManager --> OSEnvSpec
    _FakeProcessManager --> TerminalEnvSpec
    _FakeProcessManager --> ToolContext
    _FakeProcessManager --> SysTerminalLaunchTool
    _FakeProcessManager --> SysTerminalCloseTool
    _FakeProcessManager --> ToolsConfig
    _FakeProcessManager --> ToolManager
    _FakeProcessManager --> TerminalRegistry
    _FakeProcessManager --> ApprovalEvent
    _GatedTwoTurnHarnessClient --> HarnessProcessManager
    _GatedTwoTurnHarnessClient --> AgentSpec
    _GatedTwoTurnHarnessClient --> ExecutorSpec
    _GatedTwoTurnHarnessClient --> SharePolicy
    _GatedTwoTurnHarnessClient --> NullServerClient
    _GatedTwoTurnHarnessClient --> ErrorCode
    _GatedTwoTurnHarnessClient --> OmnigentError
    _GatedTwoTurnHarnessClient --> OSEnvSandboxSpec
    _GatedTwoTurnHarnessClient --> OSEnvSpec
    _GatedTwoTurnHarnessClient --> TerminalEnvSpec
    _GatedTwoTurnHarnessClient --> ToolContext
    _GatedTwoTurnHarnessClient --> SysTerminalLaunchTool
    _GatedTwoTurnHarnessClient --> SysTerminalCloseTool
    _GatedTwoTurnHarnessClient --> ToolsConfig
    _GatedTwoTurnHarnessClient --> ToolManager
    _GatedTwoTurnHarnessClient --> TerminalRegistry
    _GatedTwoTurnHarnessClient --> ApprovalEvent
    _GatedTwoTurnHarnessStream --> HarnessProcessManager
    _GatedTwoTurnHarnessStream --> AgentSpec
    _GatedTwoTurnHarnessStream --> ExecutorSpec
    _GatedTwoTurnHarnessStream --> SharePolicy
    _GatedTwoTurnHarnessStream --> NullServerClient
    _GatedTwoTurnHarnessStream --> ErrorCode
    _GatedTwoTurnHarnessStream --> OmnigentError
    _GatedTwoTurnHarnessStream --> OSEnvSandboxSpec
    _GatedTwoTurnHarnessStream --> OSEnvSpec
    _GatedTwoTurnHarnessStream --> TerminalEnvSpec
    _GatedTwoTurnHarnessStream --> ToolContext
    _GatedTwoTurnHarnessStream --> SysTerminalLaunchTool
    _GatedTwoTurnHarnessStream --> SysTerminalCloseTool
    _GatedTwoTurnHarnessStream --> ToolsConfig
    _GatedTwoTurnHarnessStream --> ToolManager
    _GatedTwoTurnHarnessStream --> TerminalRegistry
    _GatedTwoTurnHarnessStream --> ApprovalEvent
    _ModelSendResult --> HarnessProcessManager
    _ModelSendResult --> AgentSpec
    _ModelSendResult --> ExecutorSpec
    _ModelSendResult --> SharePolicy
    _ModelSendResult --> NullServerClient
    _ModelSendResult --> ErrorCode
    _ModelSendResult --> OmnigentError
    _ModelSendResult --> OSEnvSandboxSpec
    _ModelSendResult --> OSEnvSpec
    _ModelSendResult --> TerminalEnvSpec
    _ModelSendResult --> ToolContext
    _ModelSendResult --> SysTerminalLaunchTool
    _ModelSendResult --> SysTerminalCloseTool
    _ModelSendResult --> ToolsConfig
    _ModelSendResult --> ToolManager
    _ModelSendResult --> TerminalRegistry
    _ModelSendResult --> ApprovalEvent
    _RecordingProcessManager --> HarnessProcessManager
    _RecordingProcessManager --> AgentSpec
    _RecordingProcessManager --> ExecutorSpec
    _RecordingProcessManager --> SharePolicy
    _RecordingProcessManager --> NullServerClient
    _RecordingProcessManager --> ErrorCode
    _RecordingProcessManager --> OmnigentError
    _RecordingProcessManager --> OSEnvSandboxSpec
    _RecordingProcessManager --> OSEnvSpec
    _RecordingProcessManager --> TerminalEnvSpec
    _RecordingProcessManager --> ToolContext
    _RecordingProcessManager --> SysTerminalLaunchTool
    _RecordingProcessManager --> SysTerminalCloseTool
    _RecordingProcessManager --> ToolsConfig
    _RecordingProcessManager --> ToolManager
    _RecordingProcessManager --> TerminalRegistry
    _RecordingProcessManager --> ApprovalEvent
    _StubTerminalInstance --> HarnessProcessManager
    _StubTerminalInstance --> AgentSpec
    _StubTerminalInstance --> ExecutorSpec
    _StubTerminalInstance --> SharePolicy
    _StubTerminalInstance --> NullServerClient
    _StubTerminalInstance --> ErrorCode
    _StubTerminalInstance --> OmnigentError
    _StubTerminalInstance --> OSEnvSandboxSpec
    _StubTerminalInstance --> OSEnvSpec
    _StubTerminalInstance --> TerminalEnvSpec
    _StubTerminalInstance --> ToolContext
    _StubTerminalInstance --> SysTerminalLaunchTool
    _StubTerminalInstance --> SysTerminalCloseTool
    _StubTerminalInstance --> ToolsConfig
    _StubTerminalInstance --> ToolManager
    _StubTerminalInstance --> TerminalRegistry
    _StubTerminalInstance --> ApprovalEvent
    _StubTerminalRegistry --> HarnessProcessManager
    _StubTerminalRegistry --> AgentSpec
    _StubTerminalRegistry --> ExecutorSpec
    _StubTerminalRegistry --> SharePolicy
    _StubTerminalRegistry --> NullServerClient
    _StubTerminalRegistry --> ErrorCode
    _StubTerminalRegistry --> OmnigentError
    _StubTerminalRegistry --> OSEnvSandboxSpec
    _StubTerminalRegistry --> OSEnvSpec
    _StubTerminalRegistry --> TerminalEnvSpec
    _StubTerminalRegistry --> ToolContext
    _StubTerminalRegistry --> SysTerminalLaunchTool
    _StubTerminalRegistry --> SysTerminalCloseTool
    _StubTerminalRegistry --> ToolsConfig
    _StubTerminalRegistry --> ToolManager
    _StubTerminalRegistry --> TerminalRegistry
    _StubTerminalRegistry --> ApprovalEvent
    _CapturingResourceRegistry --> SessionResourceView
    _CapturingResourceRegistry --> OSEnvSandboxSpec
    _CapturingResourceRegistry --> OSEnvSpec
    _CapturingResourceRegistry --> TerminalEnvSpec
    _CapturingResourceRegistry --> OSEnvironment
    _CapturingResourceRegistry --> TerminalInstance
    _CapturingResourceRegistry --> SessionResourceRegistry
    _CapturingResourceRegistry --> AgentSpec
    _CapturingResourceRegistry --> ExecutorSpec
    _CapturingResourceRegistry --> NullServerClient
    _CapturingResourceRegistry --> AgentDef
    _ConversationStore --> ErrorCode
    _ConversationStore --> OmnigentError
    _ConversationStore --> TerminalEnvSpec
    _ConversationStore --> AgentSpec
    _ConversationStore --> SessionResourceCreatedEvent
    _ConversationStore --> SessionResourceDeletedEvent
    _FakeOSEnvironment --> SessionResourceView
    _FakeOSEnvironment --> OSEnvSandboxSpec
    _FakeOSEnvironment --> OSEnvSpec
    _FakeOSEnvironment --> TerminalEnvSpec
    _FakeOSEnvironment --> OSEnvironment
    _FakeOSEnvironment --> TerminalInstance
    _FakeOSEnvironment --> SessionResourceRegistry
    _FakeOSEnvironment --> AgentSpec
    _FakeOSEnvironment --> ExecutorSpec
    _FakeOSEnvironment --> NullServerClient
    _FakeOSEnvironment --> AgentDef
    _FakeRunnerClient --> ErrorCode
    _FakeRunnerClient --> OmnigentError
    _FakeRunnerClient --> TerminalEnvSpec
    _FakeRunnerClient --> AgentSpec
    _FakeRunnerClient --> SessionResourceCreatedEvent
    _FakeRunnerClient --> SessionResourceDeletedEvent
    _FakeRunnerRouter --> ErrorCode
    _FakeRunnerRouter --> OmnigentError
    _FakeRunnerRouter --> TerminalEnvSpec
    _FakeRunnerRouter --> AgentSpec
    _FakeRunnerRouter --> SessionResourceCreatedEvent
    _FakeRunnerRouter --> SessionResourceDeletedEvent
    _FakeStreamCtx --> ErrorCode
    _FakeStreamCtx --> OmnigentError
    _FakeStreamCtx --> TerminalEnvSpec
    _FakeStreamCtx --> AgentSpec
    _FakeStreamCtx --> SessionResourceCreatedEvent
    _FakeStreamCtx --> SessionResourceDeletedEvent
    _StreamAndCaptureRunnerClient <|-- _FakeStreamingRunnerClient
    _FakeStreamingRunnerClient --> ErrorCode
    _FakeStreamingRunnerClient --> OmnigentError
    _FakeStreamingRunnerClient --> TerminalEnvSpec
    _FakeStreamingRunnerClient --> AgentSpec
    _FakeStreamingRunnerClient --> SessionResourceCreatedEvent
    _FakeStreamingRunnerClient --> SessionResourceDeletedEvent
    _InMemoryArtifactStore --> ErrorCode
    _InMemoryArtifactStore --> OmnigentError
    _InMemoryArtifactStore --> TerminalEnvSpec
    _InMemoryArtifactStore --> AgentSpec
    _InMemoryArtifactStore --> SessionResourceCreatedEvent
    _InMemoryArtifactStore --> SessionResourceDeletedEvent
    _LaunchReturningRegistry --> SessionResourceView
    _LaunchReturningRegistry --> OSEnvSandboxSpec
    _LaunchReturningRegistry --> OSEnvSpec
    _LaunchReturningRegistry --> TerminalEnvSpec
    _LaunchReturningRegistry --> OSEnvironment
    _LaunchReturningRegistry --> TerminalInstance
    _LaunchReturningRegistry --> SessionResourceRegistry
    _LaunchReturningRegistry --> AgentSpec
    _LaunchReturningRegistry --> ExecutorSpec
    _LaunchReturningRegistry --> NullServerClient
    _LaunchReturningRegistry --> AgentDef
    _Response --> SessionResourceView
    _Response --> OSEnvSandboxSpec
    _Response --> OSEnvSpec
    _Response --> TerminalEnvSpec
    _Response --> OSEnvironment
    _Response --> TerminalInstance
    _Response --> SessionResourceRegistry
    _Response --> AgentSpec
    _Response --> ExecutorSpec
    _Response --> NullServerClient
    _Response --> AgentDef
    _RoutedRunner --> ErrorCode
    _RoutedRunner --> OmnigentError
    _RoutedRunner --> TerminalEnvSpec
    _RoutedRunner --> AgentSpec
    _RoutedRunner --> SessionResourceCreatedEvent
    _RoutedRunner --> SessionResourceDeletedEvent
    _ScriptedStreamCtx --> ErrorCode
    _ScriptedStreamCtx --> OmnigentError
    _ScriptedStreamCtx --> TerminalEnvSpec
    _ScriptedStreamCtx --> AgentSpec
    _ScriptedStreamCtx --> SessionResourceCreatedEvent
    _ScriptedStreamCtx --> SessionResourceDeletedEvent
    _ScriptedStreamingRunnerClient --> ErrorCode
    _ScriptedStreamingRunnerClient --> OmnigentError
    _ScriptedStreamingRunnerClient --> TerminalEnvSpec
    _ScriptedStreamingRunnerClient --> AgentSpec
    _ScriptedStreamingRunnerClient --> SessionResourceCreatedEvent
    _ScriptedStreamingRunnerClient --> SessionResourceDeletedEvent
    _StatusEdge --> SessionResourceView
    _StatusEdge --> OSEnvSandboxSpec
    _StatusEdge --> OSEnvSpec
    _StatusEdge --> TerminalEnvSpec
    _StatusEdge --> OSEnvironment
    _StatusEdge --> TerminalInstance
    _StatusEdge --> SessionResourceRegistry
    _StatusEdge --> AgentSpec
    _StatusEdge --> ExecutorSpec
    _StatusEdge --> NullServerClient
    _StatusEdge --> AgentDef
    _FakeStreamingRunnerClient <|-- _StreamAndCaptureRunnerClient
    _StreamAndCaptureRunnerClient --> ErrorCode
    _StreamAndCaptureRunnerClient --> OmnigentError
    _StreamAndCaptureRunnerClient --> TerminalEnvSpec
    _StreamAndCaptureRunnerClient --> AgentSpec
    _StreamAndCaptureRunnerClient --> SessionResourceCreatedEvent
    _StreamAndCaptureRunnerClient --> SessionResourceDeletedEvent
    _SubagentTerminalStore --> ErrorCode
    _SubagentTerminalStore --> OmnigentError
    _SubagentTerminalStore --> TerminalEnvSpec
    _SubagentTerminalStore --> AgentSpec
    _SubagentTerminalStore --> SessionResourceCreatedEvent
    _SubagentTerminalStore --> SessionResourceDeletedEvent
    _SwitchableServerClient --> SessionResourceView
    _SwitchableServerClient --> OSEnvSandboxSpec
    _SwitchableServerClient --> OSEnvSpec
    _SwitchableServerClient --> TerminalEnvSpec
    _SwitchableServerClient --> OSEnvironment
    _SwitchableServerClient --> TerminalInstance
    _SwitchableServerClient --> SessionResourceRegistry
    _SwitchableServerClient --> AgentSpec
    _SwitchableServerClient --> ExecutorSpec
    _SwitchableServerClient --> NullServerClient
    _SwitchableServerClient --> AgentDef
    _WatcherCapture --> SessionResourceView
    _WatcherCapture --> OSEnvSandboxSpec
    _WatcherCapture --> OSEnvSpec
    _WatcherCapture --> TerminalEnvSpec
    _WatcherCapture --> OSEnvironment
    _WatcherCapture --> TerminalInstance
    _WatcherCapture --> SessionResourceRegistry
    _WatcherCapture --> AgentSpec
    _WatcherCapture --> ExecutorSpec
    _WatcherCapture --> NullServerClient
    _WatcherCapture --> AgentDef
    _StubLoadedAgent --> OmnigentError
    _StubLoadedSpec --> OmnigentError
    _StubAgentStore --> OmnigentError
    _Response --> ResolvedSpec
    _Fixture --> AgentSpec
    _Fixture --> ExecutorSpec
    _Fixture --> ToolContext
    _Fixture --> SysSessionCloseTool
    _Fixture --> SysSessionSendTool
    _ProcessWithStdout --> OSEnvSandboxSpec
    _ProcessWithStdout --> OSEnvSpec
    _ProcessWithStdout --> TerminalEnvSpec
    _ProcessWithStdout --> TerminalInstance
    _SuccessfulProcess --> OSEnvSandboxSpec
    _SuccessfulProcess --> OSEnvSpec
    _SuccessfulProcess --> TerminalEnvSpec
    _SuccessfulProcess --> TerminalInstance
    _FakeAgentSpec --> LocalToolInfo
    _FakeAgentSpec --> ToolRuntime
    _FakeDatabricksAuth --> LocalToolInfo
    _FakeDatabricksAuth --> ToolRuntime
    _FakeExecutorSpec --> LocalToolInfo
    _FakeExecutorSpec --> ToolRuntime
    _FakeResultData --> LocalToolInfo
    _FakeResultData --> ToolRuntime
    _FakeStatementError --> LocalToolInfo
    _FakeStatementError --> ToolRuntime
    _FakeStatementResponse --> LocalToolInfo
    _FakeStatementResponse --> ToolRuntime
    _FakeStatementState --> LocalToolInfo
    _FakeStatementState --> ToolRuntime
    _FakeStatementStatus --> LocalToolInfo
    _FakeStatementStatus --> ToolRuntime
    Tool <|-- AgentTool
    AgentTool --> _OmnigentYamlLoader
    AgentTool --> AgentDef
    AgentTool --> ExecutorSpec
    AgentTool --> OSEnvSpec
    AgentTool --> _TestSleepRunner
    AgentTool --> TestLoadFromDict
    AgentTool --> TestLoadFromYAML
    AgentTool --> TestInstructionsField
    AgentTool --> _StubCancellableRunner
    AgentTool --> _AgentDefYamlPair
    Tool <|-- CancellableFunctionTool
    CancellableFunctionTool --> _OmnigentYamlLoader
    CancellableFunctionTool --> AgentDef
    CancellableFunctionTool --> ExecutorSpec
    CancellableFunctionTool --> OSEnvSpec
    CancellableFunctionTool --> _TestSleepRunner
    CancellableFunctionTool --> TestLoadFromDict
    CancellableFunctionTool --> TestLoadFromYAML
    CancellableFunctionTool --> TestInstructionsField
    CancellableFunctionTool --> _StubCancellableRunner
    CancellableFunctionTool --> _AgentDefYamlPair
    CancellableRun --> AgentDef
    CancellableRun --> ExecutorSpec
    CancellableRun --> OSEnvSpec
    CancellableRunner --> AgentDef
    CancellableRunner --> ExecutorSpec
    CancellableRunner --> OSEnvSpec
    Tool <|-- FunctionTool
    FunctionTool --> _OmnigentYamlLoader
    FunctionTool --> AgentDef
    FunctionTool --> ExecutorSpec
    FunctionTool --> OSEnvSpec
    FunctionTool --> _TestSleepRunner
    FunctionTool --> TestLoadFromDict
    FunctionTool --> TestLoadFromYAML
    FunctionTool --> TestInstructionsField
    FunctionTool --> _StubCancellableRunner
    FunctionTool --> _AgentDefYamlPair
    Tool <|-- HandoffTool
    HandoffTool --> _OmnigentYamlLoader
    HandoffTool --> AgentDef
    HandoffTool --> ExecutorSpec
    HandoffTool --> OSEnvSpec
    HandoffTool --> _TestSleepRunner
    HandoffTool --> TestLoadFromDict
    HandoffTool --> TestLoadFromYAML
    HandoffTool --> TestInstructionsField
    Tool <|-- InheritedTool
    InheritedTool --> _OmnigentYamlLoader
    InheritedTool --> AgentDef
    InheritedTool --> ExecutorSpec
    InheritedTool --> OSEnvSpec
    InheritedTool --> _TestSleepRunner
    InheritedTool --> TestLoadFromDict
    InheritedTool --> TestLoadFromYAML
    InheritedTool --> TestInstructionsField
    Tool <|-- MCPTool
    MCPTool --> _OmnigentYamlLoader
    MCPTool --> AgentDef
    MCPTool --> ExecutorSpec
    MCPTool --> OSEnvSpec
    MCPTool --> _TestSleepRunner
    MCPTool --> TestLoadFromDict
    MCPTool --> TestLoadFromYAML
    MCPTool --> TestInstructionsField
    MCPTool --> _StubCancellableRunner
    MCPTool --> _AgentDefYamlPair
    Tool <|-- SelfAgentTool
    SelfAgentTool --> _OmnigentYamlLoader
    SelfAgentTool --> AgentDef
    SelfAgentTool --> ExecutorSpec
    SelfAgentTool --> OSEnvSpec
    SelfAgentTool --> _StubCancellableRunner
    SelfAgentTool --> _AgentDefYamlPair
    Tool <|-- SkillTool
    SkillTool --> _OmnigentYamlLoader
    SkillTool --> AgentDef
    SkillTool --> ExecutorSpec
    SkillTool --> OSEnvSpec
    SkillTool --> _TestSleepRunner
    SkillTool --> TestLoadFromDict
    SkillTool --> TestLoadFromYAML
    SkillTool --> TestInstructionsField
    FunctionTool <|-- Tool
    CancellableFunctionTool <|-- Tool
    MCPTool <|-- Tool
    AgentTool <|-- Tool
    SelfAgentTool <|-- Tool
    InheritedTool <|-- Tool
    SkillTool <|-- Tool
    HandoffTool <|-- Tool
    Tool --> _OmnigentYamlLoader
    Tool --> AgentDef
    Tool --> ExecutorSpec
    Tool --> OSEnvSpec
    AgentSpec --> _ResumeWorkspaceActionOption
    AgentSpec --> _ResumeWorkspaceActionPickerState
    AgentSpec --> PreparedClaudeTerminal
    AgentSpec --> ClaudeNativeUcodeConfig
    AgentSpec --> _ClaudeTerminalTmux
    AgentSpec --> _SignalRestore
    AgentSpec --> _CodexNativeModelOptionsNotReady
    AgentSpec --> _CodexNativeLaunchConfig
    AgentSpec --> _PiNativeLaunchConfig
    AgentSpec --> _KiroNativeLaunchConfig
    AgentSpec --> _OpenCodeNativeLaunchConfig
    AgentSpec --> ResolvedSpec
    AgentSpec --> _SessionSnapshot
    AgentSpec --> TurnDispatch
    AgentSpec --> _ContextWindowOverflow
    AgentSpec --> _SubagentWorkEntry
    AgentSpec --> _SubagentDeliveryAck
    AgentSpec --> _ChildParentMeta
    AgentSpec --> _BodyRequest
    AgentSpec --> _ServerEntry
    AgentSpec --> _SpecEntry
    AgentSpec --> McpSchemasResult
    AgentSpec --> RunnerMcpManager
    AgentSpec --> RunnerToolPolicyGate
    AgentSpec --> ProxyMcpManager
    AgentSpec --> _McpServerEntry
    AgentSpec --> _AgentEntry
    AgentSpec --> McpToolEntry
    AgentSpec --> _ConfigYamlLoader
    AgentSpec --> _CredentialSourceModel
    AgentSpec --> _CredentialProxyItemModel
    AgentSpec --> OSEnvSpec
    AgentSpec --> TerminalEnvSpec
    AgentSpec --> ValidationError
    AgentSpec --> ValidationResult
    AgentSpec --> SysListModelsTool
    AgentSpec --> _CloseFailed
    AgentSpec --> _ValidatedLaunchArgs
    AgentSpec --> _ResolvedInstance
    AgentSpec --> SysTerminalLaunchTool
    AgentSpec --> SysTerminalCloseTool
    AgentSpec --> WebFetchTool
    AgentSpec --> _AttachCallRecord
    AgentSpec --> _ScriptedAttach
    AgentSpec --> _HeaderRecordingAttach
    AgentSpec --> _FakeTerminalServer
    AgentSpec --> _AttachWSStub
    AgentSpec --> _AttachWSContext
    AgentSpec --> _WorkspaceActionTtyResult
    AgentSpec --> _capture_warnings
    AgentSpec --> TestCursorMessageItemText
    AgentSpec --> TestCursorForkHistoryPreamble
    AgentSpec --> _FakeMcpManager
    AgentSpec --> _StreamHandle
    AgentSpec --> _ReadTimeoutTransport
    AgentSpec --> _McpToolsListServerClient
    AgentSpec --> _FakeFileServerClient
    AgentSpec --> _StreamErrorHarnessClient
    AgentSpec --> _ErrHandle
    AgentSpec --> _SignalOnCreatedHarnessClient
    AgentSpec --> _Handle
    AgentSpec --> _BlockingHarnessClient
    AgentSpec --> _BlockingHandle
    AgentSpec --> _HandshakeHarnessClient
    AgentSpec --> _NativeBlockingHarnessClient
    AgentSpec --> _GatedFileServerClient
    AgentSpec --> _Resp
    AgentSpec --> _FakeServerClient
    AgentSpec --> _OverflowThenSuccessHarnessClient
    AgentSpec --> _ForwardBlockingHarnessClient
    AgentSpec --> _WakeRecordingServerClient
    AgentSpec --> _EventRecordingServerClient
    AgentSpec --> _RecordingCodexAppServerClient
    AgentSpec --> _FakeOpenCodeCompactClient
    AgentSpec --> _FakeOpenCodeCompactServer
    AgentSpec --> _PublishedEvent
    AgentSpec --> _AutoCreateScenario
    AgentSpec --> _LabelsAndEmptyHistoryServerClient
    AgentSpec --> _AntigravityAutoCreateScenario
    AgentSpec --> _AntigravitySnapshotServerClient
    AgentSpec --> _EnsureTerminalCase
    AgentSpec --> _EnsureCodexTerminalCase
    AgentSpec --> _RecordedPatch
    AgentSpec --> _WakePost
    AgentSpec --> _QueuedResponseServerClient
    AgentSpec --> _LabelPatchRecordingServerClient
    AgentSpec --> _ForwarderRun
    AgentSpec --> _ScriptedJudge
    AgentSpec --> _PatchCapture
    AgentSpec --> _ScriptedHarnessClient
    AgentSpec --> _FakeProcessManager
    AgentSpec --> _FakeConn
    AgentSpec --> _SubAgentSnapshotServer
    AgentSpec --> _Resp
    AgentSpec --> _CatchUpServer
    AgentSpec --> _StubTransport
    AgentSpec --> _FakeHarnessStream
    AgentSpec --> _FakeHarnessClient
    AgentSpec --> _FakeProcessManager
    AgentSpec --> _RecordingProcessManager
    AgentSpec --> _ContentCapturingProcessManager
    AgentSpec --> _ContentCapturingHarnessClient
    AgentSpec --> _StubTerminalInstance
    AgentSpec --> _StubTerminalRegistry
    AgentSpec --> _ModelSendResult
    AgentSpec --> _GatedTwoTurnHarnessStream
    AgentSpec --> _GatedTwoTurnHarnessClient
    AgentSpec --> _FakeOSEnvironment
    AgentSpec --> _CapturingResourceRegistry
    AgentSpec --> _SwitchableServerClient
    AgentSpec --> _Response
    AgentSpec --> _StatusEdge
    AgentSpec --> _WatcherCapture
    AgentSpec --> _LaunchReturningRegistry
    AgentSpec --> _FakeConn
    AgentSpec --> _ConversationStore
    AgentSpec --> _FakeRunnerClient
    AgentSpec --> _RoutedRunner
    AgentSpec --> _FakeRunnerRouter
    AgentSpec --> _InMemoryArtifactStore
    AgentSpec --> _FakeStreamCtx
    AgentSpec --> _FakeStreamingRunnerClient
    AgentSpec --> _ScriptedStreamCtx
    AgentSpec --> _ScriptedStreamingRunnerClient
    AgentSpec --> _StreamAndCaptureRunnerClient
    AgentSpec --> _SubagentTerminalStore
    AgentSpec --> _StubCancellableRunner
    AgentSpec --> _AgentDefYamlPair
    AgentSpec --> _Fixture
    _AnthropicRetryAdapter --> OSEnvSpec
    _AnthropicRetryAdapter --> TerminalEnvSpec
    ApiKeyAuth --> ModelEntry
    ApiKeyAuth --> ModelListing
    ApiKeyAuth --> ResolvedModelProvider
    ApiKeyAuth --> _CodexNativeModelOptionsNotReady
    ApiKeyAuth --> _CodexNativeLaunchConfig
    ApiKeyAuth --> _PiNativeLaunchConfig
    ApiKeyAuth --> _KiroNativeLaunchConfig
    ApiKeyAuth --> _OpenCodeNativeLaunchConfig
    ApiKeyAuth --> ResolvedSpec
    ApiKeyAuth --> _SessionSnapshot
    ApiKeyAuth --> TurnDispatch
    ApiKeyAuth --> _ContextWindowOverflow
    ApiKeyAuth --> _SubagentWorkEntry
    ApiKeyAuth --> _SubagentDeliveryAck
    ApiKeyAuth --> _ChildParentMeta
    ApiKeyAuth --> _BodyRequest
    ApiKeyAuth --> UcodeHarnessConfig
    ApiKeyAuth --> _AsyncToolHandle
    ApiKeyAuth --> _LoadedHistory
    ApiKeyAuth --> _ConfigYamlLoader
    ApiKeyAuth --> _CredentialSourceModel
    ApiKeyAuth --> _CredentialProxyItemModel
    ApiKeyAuth --> OSEnvSpec
    ApiKeyAuth --> TerminalEnvSpec
    ApiKeyAuth --> _StubCancellableRunner
    ApiKeyAuth --> _AgentDefYamlPair
    BuiltinToolConfig --> _ConfigYamlLoader
    BuiltinToolConfig --> _CredentialSourceModel
    BuiltinToolConfig --> _CredentialProxyItemModel
    BuiltinToolConfig --> OSEnvSpec
    BuiltinToolConfig --> TerminalEnvSpec
    _ClaudeCliRetryAdapter --> OSEnvSpec
    _ClaudeCliRetryAdapter --> TerminalEnvSpec
    _CodexCliRetryAdapter --> OSEnvSpec
    _CodexCliRetryAdapter --> TerminalEnvSpec
    CompactionConfig --> SummaryMetadata
    CompactionConfig --> CompactionResult
    CompactionConfig --> _CompactionState
    CompactionConfig --> UcodeHarnessConfig
    CompactionConfig --> _AsyncToolHandle
    CompactionConfig --> _LoadedHistory
    CompactionConfig --> _ConfigYamlLoader
    CompactionConfig --> _CredentialSourceModel
    CompactionConfig --> _CredentialProxyItemModel
    CompactionConfig --> OSEnvSpec
    CompactionConfig --> TerminalEnvSpec
    DatabricksAuth --> _ResumeWorkspaceActionOption
    DatabricksAuth --> _ResumeWorkspaceActionPickerState
    DatabricksAuth --> PreparedClaudeTerminal
    DatabricksAuth --> ClaudeNativeUcodeConfig
    DatabricksAuth --> _ClaudeTerminalTmux
    DatabricksAuth --> _SignalRestore
    DatabricksAuth --> CodexAppServerClient
    DatabricksAuth --> CodexNativeAppServer
    DatabricksAuth --> ModelEntry
    DatabricksAuth --> ModelListing
    DatabricksAuth --> ResolvedModelProvider
    DatabricksAuth --> _CodexNativeModelOptionsNotReady
    DatabricksAuth --> _CodexNativeLaunchConfig
    DatabricksAuth --> _PiNativeLaunchConfig
    DatabricksAuth --> _KiroNativeLaunchConfig
    DatabricksAuth --> _OpenCodeNativeLaunchConfig
    DatabricksAuth --> ResolvedSpec
    DatabricksAuth --> _SessionSnapshot
    DatabricksAuth --> TurnDispatch
    DatabricksAuth --> _ContextWindowOverflow
    DatabricksAuth --> _SubagentWorkEntry
    DatabricksAuth --> _SubagentDeliveryAck
    DatabricksAuth --> _ChildParentMeta
    DatabricksAuth --> _BodyRequest
    DatabricksAuth --> AdvisorConfig
    DatabricksAuth --> Judge
    DatabricksAuth --> AdvisorTurnResult
    DatabricksAuth --> UcodeHarnessConfig
    DatabricksAuth --> _AsyncToolHandle
    DatabricksAuth --> _LoadedHistory
    DatabricksAuth --> _ConfigYamlLoader
    DatabricksAuth --> _CredentialSourceModel
    DatabricksAuth --> _CredentialProxyItemModel
    DatabricksAuth --> OSEnvSpec
    DatabricksAuth --> TerminalEnvSpec
    DatabricksAuth --> _StubCancellableRunner
    DatabricksAuth --> _AgentDefYamlPair
    ExecutorSpec --> _ConfigYamlLoader
    ExecutorSpec --> _CredentialSourceModel
    ExecutorSpec --> _CredentialProxyItemModel
    ExecutorSpec --> OSEnvSpec
    ExecutorSpec --> TerminalEnvSpec
    ExecutorSpec --> WebFetchTool
    ExecutorSpec --> _AttachCallRecord
    ExecutorSpec --> _ScriptedAttach
    ExecutorSpec --> _HeaderRecordingAttach
    ExecutorSpec --> _FakeTerminalServer
    ExecutorSpec --> _AttachWSStub
    ExecutorSpec --> _AttachWSContext
    ExecutorSpec --> _WorkspaceActionTtyResult
    ExecutorSpec --> _capture_warnings
    ExecutorSpec --> TestCursorMessageItemText
    ExecutorSpec --> TestCursorForkHistoryPreamble
    ExecutorSpec --> _FakeMcpManager
    ExecutorSpec --> _StreamHandle
    ExecutorSpec --> _ReadTimeoutTransport
    ExecutorSpec --> _McpToolsListServerClient
    ExecutorSpec --> _FakeFileServerClient
    ExecutorSpec --> _StreamErrorHarnessClient
    ExecutorSpec --> _ErrHandle
    ExecutorSpec --> _SignalOnCreatedHarnessClient
    ExecutorSpec --> _Handle
    ExecutorSpec --> _BlockingHarnessClient
    ExecutorSpec --> _BlockingHandle
    ExecutorSpec --> _HandshakeHarnessClient
    ExecutorSpec --> _NativeBlockingHarnessClient
    ExecutorSpec --> _GatedFileServerClient
    ExecutorSpec --> _Resp
    ExecutorSpec --> _FakeServerClient
    ExecutorSpec --> _OverflowThenSuccessHarnessClient
    ExecutorSpec --> _ForwardBlockingHarnessClient
    ExecutorSpec --> _WakeRecordingServerClient
    ExecutorSpec --> _EventRecordingServerClient
    ExecutorSpec --> _RecordingCodexAppServerClient
    ExecutorSpec --> _FakeOpenCodeCompactClient
    ExecutorSpec --> _FakeOpenCodeCompactServer
    ExecutorSpec --> _PublishedEvent
    ExecutorSpec --> _AutoCreateScenario
    ExecutorSpec --> _LabelsAndEmptyHistoryServerClient
    ExecutorSpec --> _AntigravityAutoCreateScenario
    ExecutorSpec --> _AntigravitySnapshotServerClient
    ExecutorSpec --> _EnsureTerminalCase
    ExecutorSpec --> _EnsureCodexTerminalCase
    ExecutorSpec --> _RecordedPatch
    ExecutorSpec --> _WakePost
    ExecutorSpec --> _QueuedResponseServerClient
    ExecutorSpec --> _LabelPatchRecordingServerClient
    ExecutorSpec --> _ForwarderRun
    ExecutorSpec --> _ScriptedJudge
    ExecutorSpec --> _PatchCapture
    ExecutorSpec --> _ScriptedHarnessClient
    ExecutorSpec --> _FakeProcessManager
    ExecutorSpec --> _SubAgentSnapshotServer
    ExecutorSpec --> _Resp
    ExecutorSpec --> _CatchUpServer
    ExecutorSpec --> _FakeHarnessStream
    ExecutorSpec --> _FakeHarnessClient
    ExecutorSpec --> _FakeProcessManager
    ExecutorSpec --> _RecordingProcessManager
    ExecutorSpec --> _ContentCapturingProcessManager
    ExecutorSpec --> _ContentCapturingHarnessClient
    ExecutorSpec --> _StubTerminalInstance
    ExecutorSpec --> _StubTerminalRegistry
    ExecutorSpec --> _ModelSendResult
    ExecutorSpec --> _GatedTwoTurnHarnessStream
    ExecutorSpec --> _GatedTwoTurnHarnessClient
    ExecutorSpec --> _FakeOSEnvironment
    ExecutorSpec --> _CapturingResourceRegistry
    ExecutorSpec --> _SwitchableServerClient
    ExecutorSpec --> _Response
    ExecutorSpec --> _StatusEdge
    ExecutorSpec --> _WatcherCapture
    ExecutorSpec --> _LaunchReturningRegistry
    ExecutorSpec --> _Fixture
    GuardrailsSpec --> _ConfigYamlLoader
    GuardrailsSpec --> _CredentialSourceModel
    GuardrailsSpec --> _CredentialProxyItemModel
    GuardrailsSpec --> OSEnvSpec
    GuardrailsSpec --> TerminalEnvSpec
    GuardrailsSpec --> _ScriptedHarnessClient
    GuardrailsSpec --> _FakeProcessManager
    InteractionConfig --> _ConfigYamlLoader
    InteractionConfig --> _CredentialSourceModel
    InteractionConfig --> _CredentialProxyItemModel
    InteractionConfig --> OSEnvSpec
    InteractionConfig --> TerminalEnvSpec
    InteractionConfig --> WebFetchTool
    LabelDef --> _ConfigYamlLoader
    LabelDef --> _CredentialSourceModel
    LabelDef --> _CredentialProxyItemModel
    LabelDef --> OSEnvSpec
    LabelDef --> TerminalEnvSpec
    LLMConfig --> UcodeHarnessConfig
    LLMConfig --> _AsyncToolHandle
    LLMConfig --> _LoadedHistory
    LLMConfig --> _ConfigYamlLoader
    LLMConfig --> _CredentialSourceModel
    LLMConfig --> _CredentialProxyItemModel
    LLMConfig --> OSEnvSpec
    LLMConfig --> TerminalEnvSpec
    LocalToolInfo --> _CodexNativeModelOptionsNotReady
    LocalToolInfo --> _CodexNativeLaunchConfig
    LocalToolInfo --> _PiNativeLaunchConfig
    LocalToolInfo --> _KiroNativeLaunchConfig
    LocalToolInfo --> _OpenCodeNativeLaunchConfig
    LocalToolInfo --> ResolvedSpec
    LocalToolInfo --> _SessionSnapshot
    LocalToolInfo --> TurnDispatch
    LocalToolInfo --> _ContextWindowOverflow
    LocalToolInfo --> _SubagentWorkEntry
    LocalToolInfo --> _SubagentDeliveryAck
    LocalToolInfo --> _ChildParentMeta
    LocalToolInfo --> _BodyRequest
    LocalToolInfo --> _ConfigYamlLoader
    LocalToolInfo --> _CredentialSourceModel
    LocalToolInfo --> _CredentialProxyItemModel
    LocalToolInfo --> OSEnvSpec
    LocalToolInfo --> TerminalEnvSpec
    LocalToolInfo --> LocalToolLoadError
    LocalToolInfo --> LocalPythonTool
    LocalToolInfo --> _DiscoveredTool
    LocalToolInfo --> LocalCallableTool
    LocalToolInfo --> _FakeMcpManager
    LocalToolInfo --> _StreamHandle
    LocalToolInfo --> _ReadTimeoutTransport
    LocalToolInfo --> _McpToolsListServerClient
    LocalToolInfo --> _FakeFileServerClient
    LocalToolInfo --> _StreamErrorHarnessClient
    LocalToolInfo --> _ErrHandle
    LocalToolInfo --> _SignalOnCreatedHarnessClient
    LocalToolInfo --> _Handle
    LocalToolInfo --> _BlockingHarnessClient
    LocalToolInfo --> _BlockingHandle
    LocalToolInfo --> _HandshakeHarnessClient
    LocalToolInfo --> _NativeBlockingHarnessClient
    LocalToolInfo --> _GatedFileServerClient
    LocalToolInfo --> _Resp
    LocalToolInfo --> _FakeServerClient
    LocalToolInfo --> _OverflowThenSuccessHarnessClient
    LocalToolInfo --> _ForwardBlockingHarnessClient
    LocalToolInfo --> _WakeRecordingServerClient
    LocalToolInfo --> _EventRecordingServerClient
    LocalToolInfo --> _RecordingCodexAppServerClient
    LocalToolInfo --> _FakeOpenCodeCompactClient
    LocalToolInfo --> _FakeOpenCodeCompactServer
    LocalToolInfo --> _PublishedEvent
    LocalToolInfo --> _AutoCreateScenario
    LocalToolInfo --> _LabelsAndEmptyHistoryServerClient
    LocalToolInfo --> _AntigravityAutoCreateScenario
    LocalToolInfo --> _AntigravitySnapshotServerClient
    LocalToolInfo --> _EnsureTerminalCase
    LocalToolInfo --> _EnsureCodexTerminalCase
    LocalToolInfo --> _RecordedPatch
    LocalToolInfo --> _WakePost
    LocalToolInfo --> _QueuedResponseServerClient
    LocalToolInfo --> _LabelPatchRecordingServerClient
    LocalToolInfo --> _ForwarderRun
    LocalToolInfo --> _FakeStatementStatus
    LocalToolInfo --> _FakeStatementError
    LocalToolInfo --> _FakeResultData
    LocalToolInfo --> _FakeStatementResponse
    LocalToolInfo --> _FakeStatementState
    LocalToolInfo --> _FakeAgentSpec
    LocalToolInfo --> _FakeExecutorSpec
    LocalToolInfo --> _FakeDatabricksAuth
    MCPServerConfig --> _ServerEntry
    MCPServerConfig --> _SpecEntry
    MCPServerConfig --> McpSchemasResult
    MCPServerConfig --> RunnerMcpManager
    MCPServerConfig --> _McpServerEntry
    MCPServerConfig --> _AgentEntry
    MCPServerConfig --> McpToolEntry
    MCPServerConfig --> _ConfigYamlLoader
    MCPServerConfig --> _CredentialSourceModel
    MCPServerConfig --> _CredentialProxyItemModel
    MCPServerConfig --> OSEnvSpec
    MCPServerConfig --> TerminalEnvSpec
    MCPServerConfig --> McpServerDisabledError
    MCPServerConfig --> McpElicitationRequired
    MCPServerConfig --> _CircuitBreaker
    MCPServerConfig --> McpServerConnection
    MCPServerConfig --> _FakeMcpManager
    MCPServerConfig --> _StreamHandle
    MCPServerConfig --> _ReadTimeoutTransport
    MCPServerConfig --> _McpToolsListServerClient
    MCPServerConfig --> _FakeFileServerClient
    MCPServerConfig --> _StreamErrorHarnessClient
    MCPServerConfig --> _ErrHandle
    MCPServerConfig --> _SignalOnCreatedHarnessClient
    MCPServerConfig --> _Handle
    MCPServerConfig --> _BlockingHarnessClient
    MCPServerConfig --> _BlockingHandle
    MCPServerConfig --> _HandshakeHarnessClient
    MCPServerConfig --> _NativeBlockingHarnessClient
    MCPServerConfig --> _GatedFileServerClient
    MCPServerConfig --> _Resp
    MCPServerConfig --> _FakeServerClient
    MCPServerConfig --> _OverflowThenSuccessHarnessClient
    MCPServerConfig --> _ForwardBlockingHarnessClient
    MCPServerConfig --> _WakeRecordingServerClient
    MCPServerConfig --> _EventRecordingServerClient
    MCPServerConfig --> _RecordingCodexAppServerClient
    MCPServerConfig --> _FakeOpenCodeCompactClient
    MCPServerConfig --> _FakeOpenCodeCompactServer
    MCPServerConfig --> _PublishedEvent
    MCPServerConfig --> _AutoCreateScenario
    MCPServerConfig --> _LabelsAndEmptyHistoryServerClient
    MCPServerConfig --> _AntigravityAutoCreateScenario
    MCPServerConfig --> _AntigravitySnapshotServerClient
    MCPServerConfig --> _EnsureTerminalCase
    MCPServerConfig --> _EnsureCodexTerminalCase
    MCPServerConfig --> _RecordedPatch
    MCPServerConfig --> _WakePost
    MCPServerConfig --> _QueuedResponseServerClient
    MCPServerConfig --> _LabelPatchRecordingServerClient
    MCPServerConfig --> _ForwarderRun
    MCPServerConfig --> _FakeConn
    MCPServerConfig --> _StubTransport
    MCPServerConfig --> _FakeConn
    MCPServerConfig --> CapturedHttpArgs
    ModalityConfig --> _ConfigYamlLoader
    ModalityConfig --> _CredentialSourceModel
    ModalityConfig --> _CredentialProxyItemModel
    ModalityConfig --> OSEnvSpec
    ModalityConfig --> TerminalEnvSpec
    _OpenAIRetryAdapter --> OSEnvSpec
    _OpenAIRetryAdapter --> TerminalEnvSpec
    _PiRetryAdapter --> OSEnvSpec
    _PiRetryAdapter --> TerminalEnvSpec
    ProviderAuth --> _CodexNativeModelOptionsNotReady
    ProviderAuth --> _CodexNativeLaunchConfig
    ProviderAuth --> _PiNativeLaunchConfig
    ProviderAuth --> _KiroNativeLaunchConfig
    ProviderAuth --> _OpenCodeNativeLaunchConfig
    ProviderAuth --> ResolvedSpec
    ProviderAuth --> _SessionSnapshot
    ProviderAuth --> TurnDispatch
    ProviderAuth --> _ContextWindowOverflow
    ProviderAuth --> _SubagentWorkEntry
    ProviderAuth --> _SubagentDeliveryAck
    ProviderAuth --> _ChildParentMeta
    ProviderAuth --> _BodyRequest
    ProviderAuth --> UcodeHarnessConfig
    ProviderAuth --> _AsyncToolHandle
    ProviderAuth --> _LoadedHistory
    ProviderAuth --> _ConfigYamlLoader
    ProviderAuth --> _CredentialSourceModel
    ProviderAuth --> _CredentialProxyItemModel
    ProviderAuth --> OSEnvSpec
    ProviderAuth --> TerminalEnvSpec
    SandboxConfig --> _ConfigYamlLoader
    SandboxConfig --> _CredentialSourceModel
    SandboxConfig --> _CredentialProxyItemModel
    SandboxConfig --> OSEnvSpec
    SandboxConfig --> TerminalEnvSpec
    SandboxConfig --> LocalToolLoadError
    SandboxConfig --> LocalPythonTool
    SandboxConfig --> _DiscoveredTool
    SharePolicy --> _ConfigYamlLoader
    SharePolicy --> _CredentialSourceModel
    SharePolicy --> _CredentialProxyItemModel
    SharePolicy --> OSEnvSpec
    SharePolicy --> TerminalEnvSpec
    SharePolicy --> _UCFunctionSchemaTool
    SharePolicy --> ToolManager
    SharePolicy --> _FakeHarnessStream
    SharePolicy --> _FakeHarnessClient
    SharePolicy --> _FakeProcessManager
    SharePolicy --> _RecordingProcessManager
    SharePolicy --> _ContentCapturingProcessManager
    SharePolicy --> _ContentCapturingHarnessClient
    SharePolicy --> _StubTerminalInstance
    SharePolicy --> _StubTerminalRegistry
    SharePolicy --> _ModelSendResult
    SharePolicy --> _GatedTwoTurnHarnessStream
    SharePolicy --> _GatedTwoTurnHarnessClient
    ToolRuntime --> OSEnvSpec
    ToolRuntime --> TerminalEnvSpec
    ToolRuntime --> ValidationError
    ToolRuntime --> ValidationResult
    ToolRuntime --> LocalCallableTool
    ToolRuntime --> _UCFunctionSchemaTool
    ToolRuntime --> ToolManager
    ToolRuntime --> _FakeStatementStatus
    ToolRuntime --> _FakeStatementError
    ToolRuntime --> _FakeResultData
    ToolRuntime --> _FakeStatementResponse
    ToolRuntime --> _FakeStatementState
    ToolRuntime --> _FakeAgentSpec
    ToolRuntime --> _FakeExecutorSpec
    ToolRuntime --> _FakeDatabricksAuth
    ToolRuntime --> _StubCancellableRunner
    ToolRuntime --> _AgentDefYamlPair
    ToolsConfig --> _ConfigYamlLoader
    ToolsConfig --> _CredentialSourceModel
    ToolsConfig --> _CredentialProxyItemModel
    ToolsConfig --> OSEnvSpec
    ToolsConfig --> TerminalEnvSpec
    ToolsConfig --> WebFetchTool
    ToolsConfig --> _FakeHarnessStream
    ToolsConfig --> _FakeHarnessClient
    ToolsConfig --> _FakeProcessManager
    ToolsConfig --> _RecordingProcessManager
    ToolsConfig --> _ContentCapturingProcessManager
    ToolsConfig --> _ContentCapturingHarnessClient
    ToolsConfig --> _StubTerminalInstance
    ToolsConfig --> _StubTerminalRegistry
    ToolsConfig --> _ModelSendResult
    ToolsConfig --> _GatedTwoTurnHarnessStream
    ToolsConfig --> _GatedTwoTurnHarnessClient
    UcodeAgentState --> UcodeHarnessConfig
    UcodeAgentState --> _AsyncToolHandle
    UcodeAgentState --> _LoadedHistory
    UcodeAgentState --> _AttachCallRecord
    UcodeAgentState --> _ScriptedAttach
    UcodeAgentState --> _HeaderRecordingAttach
    UcodeAgentState --> _FakeTerminalServer
    UcodeAgentState --> _AttachWSStub
    UcodeAgentState --> _AttachWSContext
    UcodeAgentState --> _WorkspaceActionTtyResult
    UcodeAgentState --> _capture_warnings
    UcodeWorkspaceState --> _AttachCallRecord
    UcodeWorkspaceState --> _ScriptedAttach
    UcodeWorkspaceState --> _HeaderRecordingAttach
    UcodeWorkspaceState --> _FakeTerminalServer
    UcodeWorkspaceState --> _AttachWSStub
    UcodeWorkspaceState --> _AttachWSContext
    UcodeWorkspaceState --> _WorkspaceActionTtyResult
    UcodeWorkspaceState --> _capture_warnings
    ValidationError --> AgentSpec
    ValidationError --> ToolRuntime
    ValidationResult --> AgentSpec
    ValidationResult --> ToolRuntime
    WebFetchTool --> _UCFunctionSchemaTool
    WebFetchTool --> ToolManager
    WebFetchTool --> AgentSpec
    WebFetchTool --> ExecutorSpec
    WebFetchTool --> InteractionConfig
    WebFetchTool --> ToolsConfig
    WebFetchTool --> Tool
    WebFetchTool --> OSEnvSpec
    _Backend --> Tool
    _Backend --> ToolContext
    _IO_COUNTERS --> OSEnvSandboxSpec
    _IO_COUNTERS --> OSEnvSpec
    _IO_COUNTERS --> ContainmentHandle
    _IO_COUNTERS --> SandboxBackend
    _JobHandle --> OSEnvSandboxSpec
    _JobHandle --> OSEnvSpec
    _JobHandle --> ContainmentHandle
    _JobHandle --> SandboxBackend
    _JOBOBJECT_BASIC_LIMIT_INFORMATION --> OSEnvSandboxSpec
    _JOBOBJECT_BASIC_LIMIT_INFORMATION --> OSEnvSpec
    _JOBOBJECT_BASIC_LIMIT_INFORMATION --> ContainmentHandle
    _JOBOBJECT_BASIC_LIMIT_INFORMATION --> SandboxBackend
    _JOBOBJECT_EXTENDED_LIMIT_INFORMATION --> OSEnvSandboxSpec
    _JOBOBJECT_EXTENDED_LIMIT_INFORMATION --> OSEnvSpec
    _JOBOBJECT_EXTENDED_LIMIT_INFORMATION --> ContainmentHandle
    _JOBOBJECT_EXTENDED_LIMIT_INFORMATION --> SandboxBackend
    WindowsJobObjectSandboxBackend --> OSEnvSandboxSpec
    WindowsJobObjectSandboxBackend --> OSEnvSpec
    WindowsJobObjectSandboxBackend --> ContainmentHandle
    WindowsJobObjectSandboxBackend --> SandboxBackend
    _AsyncToolHandle --> OSEnvSpec
    _AsyncToolHandle --> ErrorCode
    _AsyncToolHandle --> OmnigentError
    _AsyncToolHandle --> FamilyConfig
    _AsyncToolHandle --> UcodeAgentState
    _AsyncToolHandle --> CompactionResult
    _AsyncToolHandle --> SummaryMetadata
    _AsyncToolHandle --> ApiKeyAuth
    _AsyncToolHandle --> DatabricksAuth
    _AsyncToolHandle --> LLMConfig
    _AsyncToolHandle --> ProviderAuth
    _AsyncToolHandle --> CompactionConfig
    _LoadedHistory --> OSEnvSpec
    _LoadedHistory --> ErrorCode
    _LoadedHistory --> OmnigentError
    _LoadedHistory --> FamilyConfig
    _LoadedHistory --> UcodeAgentState
    _LoadedHistory --> CompactionResult
    _LoadedHistory --> SummaryMetadata
    _LoadedHistory --> ApiKeyAuth
    _LoadedHistory --> DatabricksAuth
    _LoadedHistory --> LLMConfig
    _LoadedHistory --> ProviderAuth
    _LoadedHistory --> CompactionConfig
    UcodeHarnessConfig --> OSEnvSpec
    UcodeHarnessConfig --> ErrorCode
    UcodeHarnessConfig --> OmnigentError
    UcodeHarnessConfig --> FamilyConfig
    UcodeHarnessConfig --> UcodeAgentState
    UcodeHarnessConfig --> CompactionResult
    UcodeHarnessConfig --> SummaryMetadata
    UcodeHarnessConfig --> ApiKeyAuth
    UcodeHarnessConfig --> DatabricksAuth
    UcodeHarnessConfig --> LLMConfig
    UcodeHarnessConfig --> ProviderAuth
    UcodeHarnessConfig --> CompactionConfig
```

## Relationships

- [[Community 4]] (2587 shared connections)
- [[Community 6]] (1561 shared connections)
- [[Community 16]] (1400 shared connections)
- [[Auth Config]] (570 shared connections)
- [[Community 8]] (563 shared connections)
- [[Community 1]] (238 shared connections)
- [[Community 19]] (207 shared connections)
- [[Community 10]] (196 shared connections)
- [[Community 11]] (179 shared connections)
- [[Community 18]] (147 shared connections)
- [[Community 9]] (61 shared connections)
- [[Community 14]] (54 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\_native_post_delivery.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_native_post_delivery.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\chat.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/chat.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_launcher.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_launcher.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_app_server.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_app_server.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_forwarder.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_process_registry.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_process_registry.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cost_plan.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cost_plan.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\environment_filesystem.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/environment_filesystem.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\pagination.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/pagination.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\session_resources.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/session_resources.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\errors.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/errors.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\_cwd_scan.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/_cwd_scan.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\_seccomp.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/_seccomp.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\bwrap_sandbox.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/bwrap_sandbox.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\datamodel.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/datamodel.py)

## Audit Trail

- EXTRACTED: 17086 (16%)
- INFERRED: 92983 (84%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*