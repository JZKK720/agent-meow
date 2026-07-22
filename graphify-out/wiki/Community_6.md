# Community 6

> 4254 nodes · cohesion 0.00

## Key Concepts

- [TurnComplete](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L150) (1507 connections)
- [ExecutorError](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L245) (1416 connections)
- [TextChunk](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L102) (1163 connections)
- [ExecutorConfig](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L71) (1145 connections)
- [ToolCallRequest](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L134) (1029 connections)
- [ToolCallComplete](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L186) (882 connections)
- [Executor](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L518) (799 connections)
- [RetryPolicy](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L43) (773 connections)
- [ToolCallStatus](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L178) (762 connections)
- [DatabricksAuthError](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/databricks_executor.py#L281) (698 connections)
- [ExecutorEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L97) (650 connections)
- [SandboxPolicy](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/sandbox.py#L50) (557 connections)
- [ReasoningChunk](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L114) (546 connections)
- [.close()](file:///C:/Users/1/github-pr/agent-meow/web/src/lib/sessionUpdatesSocket.test.ts#L32) (434 connections)
- [DatabricksCredentials](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/databricks_executor.py#L69) (406 connections)
- [warning](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/CodeViewer.test.tsx#L334) (376 connections)
- [CompactionComplete](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L214) (345 connections)
- [ExecutorAdapter](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/harnesses/_executor_adapter.py#L142) (254 connections)
- [TurnContext](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/harnesses/_scaffold.py#L353) (238 connections)
- [CreateResponseRequest](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L826) (234 connections)
- [HarnessApp](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/harnesses/_scaffold.py#L716) (229 connections)
- [TurnCancelled](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/executor.py#L237) (228 connections)
- [ClaudeSDKExecutor](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/claude_sdk_executor.py#L1055) (219 connections)
- [PolicyVerdictPayload](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/harnesses/_scaffold.py#L119) (217 connections)
- [RetryableLLMError](file:///C:/Users/1/github-pr/agent-meow/agent_meow/llms/errors.py#L77) (196 connections)
- *... and 4229 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class AntigravityExecutor {
        +antigravity_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.supports_tool_boundary_interrupt()
        +.max_context_tokens()
        +._session_key()
        +.close_session()
        +.close()
    }
    class _AntigravitySessionState {
        +antigravity_executor.py()
    }
    class _NeverRaisedError {
        +antigravity_executor.py()
    }
    class _PendingTool {
        +antigravity_executor.py()
    }
    class AntigravityNativeExecutor {
        +antigravity_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.interrupt_session()
        +.run_turn()
        +._deliver()
    }
    class ClaudeGatewayShim {
        +claude_gateway_shim.py()
        +.__init__()
        +.start()
        +._start_locked()
        +.aclose()
        +._asgi_app()
    }
    class _NoSignalServer {
        +claude_gateway_shim.py()
    }
    class ClaudeNativeExecutor {
        +claude_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
    }
    class _AssistantMessageObj {
        +claude_sdk_executor.py()
    }
    class _CancelScope {
        +claude_sdk_executor.py()
        +.cancel()
    }
    class _ClaudeClient {
        +claude_sdk_executor.py()
        +.connect()
        +.disconnect()
        +.query()
        +.set_model()
        +.interrupt()
        +.receive_response()
    }
    class _ClaudeClientState {
        +claude_sdk_executor.py()
    }
    class _ClaudeQuery {
        +claude_sdk_executor.py()
    }
    class _ClaudeSDK {
        +claude_sdk_executor.py()
    }
    class ClaudeSDKExecutor {
        +claude_sdk_executor.py()
        +.__init__()
        +.__del__()
        +._route_options_through_gateway_shim()
        +._get_or_create_client()
        +.close_session()
        +._close_live_client()
        +.close()
        +.interrupt_session()
        +.enqueue_session_message()
    }
    class _ClaudeTransport {
        +claude_sdk_executor.py()
    }
    class PreparedClaudeCli {
        +claude_sdk_executor.py()
    }
    class _Process {
        +claude_sdk_executor.py()
        +.terminate()
        +.kill()
        +.wait()
    }
    class _ResolvedSkills {
        +claude_sdk_executor.py()
    }
    class _ResultMessageObj {
        +claude_sdk_executor.py()
    }
    class _Stream {
        +claude_sdk_executor.py()
        +.aclose()
    }
    class _StreamEventObj {
        +claude_sdk_executor.py()
    }
    class _SystemMessageObj {
        +claude_sdk_executor.py()
    }
    class _TaskGroup {
        +claude_sdk_executor.py()
    }
    class _TaskHandle {
        +claude_sdk_executor.py()
        +.cancel()
    }
    class _TextBlockObj {
        +claude_sdk_executor.py()
    }
    class _ToolResultBlockObj {
        +claude_sdk_executor.py()
    }
    class _ToolUseBlockObj {
        +claude_sdk_executor.py()
    }
    class _UserMessageObj {
        +claude_sdk_executor.py()
    }
    class _ResponsesNamespace {
        +client.py()
        +.__init__()
        +.create()
        +._do_create()
    }
    class _AppSessionFactory {
        +codex_executor.py()
        +.__call__()
    }
    class _CodexAppServerSession {
        +codex_executor.py()
        +.__init__()
        +.start()
        +.close()
        +._cleanup_process_cwd()
        +._record_event()
        +._format_recent_events()
        +._drain_turn_completed_tail()
        +.run_turn()
        +.enqueue_message()
    }
    class CodexExecutor {
        +codex_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.supports_live_message_queue()
        +.interrupt_session()
        +.enqueue_session_message()
        +.close_session()
        +.close()
    }
    class _CodexSessionState {
        +codex_executor.py()
    }
    class _PendingToolResult {
        +codex_executor.py()
    }
    class _Process {
        +codex_executor.py()
        +.terminate()
        +.kill()
    }
    class CodexNativeExecutor {
        +codex_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.interrupt_session()
        +.run_turn()
    }
    class CopilotExecutor {
        +copilot_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.supports_live_message_queue()
        +._session_key()
        +._make_tools()
        +._make_handler()
        +._on_permission_request()
    }
    class _CopilotSessionState {
        +copilot_executor.py()
    }
    class CursorExecutor {
        +cursor_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.supports_live_message_queue()
        +._session_key()
        +._evaluate_native_tool_policy()
        +._make_custom_tools()
        +._make_execute()
    }
    class _CursorSessionState {
        +cursor_executor.py()
    }
    class CursorNativeExecutor {
        +cursor_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
    }
    class DatabricksAuthError {
        +databricks_executor.py()
    }
    class _DatabricksBearerAuth {
        +databricks_executor.py()
        +.__init__()
        +._authenticate_headers()
        +.current_token()
        +.auth_flow()
    }
    class DatabricksCredentials {
        +databricks_executor.py()
    }
    class DatabricksExecutor {
        +databricks_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.max_context_tokens()
        +._session_key()
        +._get_or_create_session_state()
        +.close_session()
        +.interrupt_session()
        +.run_turn()
    }
    class _DatabricksSessionState {
        +databricks_executor.py()
    }
    class LLMErrorDetail {
        +errors.py()
    }
    class PermanentLLMError {
        +errors.py()
        +.__init__()
    }
    class RetryableLLMError {
        +errors.py()
        +.__init__()
    }
    class ExecutorAdapter {
        +_executor_adapter.py()
        +.__init__()
        +.run_turn()
        +._handle_interrupt_event()
        +._watch_injections()
        +._stable_tool_executor()
        +._stable_elicitation_handler()
        +._stable_policy_evaluator()
        +._ensure_executor()
        +._translate_event()
    }
    class _ClosableIterator {
        +executor.py()
        +.close()
    }
    class CompactionComplete {
        +executor.py()
    }
    class Executor {
        +executor.py()
        +.run_turn()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.max_context_tokens()
        +.close_session()
        +.interrupt_session()
        +.enqueue_session_message()
        +.supports_live_message_queue()
    }
    class ExecutorConfig {
        +executor.py()
    }
    class ExecutorError {
        +executor.py()
    }
    class ExecutorEvent {
        +executor.py()
    }
    class MessageSplit {
        +executor.py()
    }
    class MockExecutor {
        +executor.py()
        +.__init__()
        +.enqueue_response()
        +.enqueue_tool_call()
        +.enqueue_events()
        +.run_turn()
    }
    class ReasoningChunk {
        +executor.py()
    }
    class _StreamDone {
        +executor.py()
    }
    class _StreamError {
        +executor.py()
    }
    class _StreamItem {
        +executor.py()
    }
    class TextChunk {
        +executor.py()
    }
    class ToolCallComplete {
        +executor.py()
    }
    class ToolCallRequest {
        +executor.py()
    }
    class ToolCallStatus {
        +executor.py()
    }
    class ToolResultClassification {
        +executor.py()
    }
    class TurnCancelled {
        +executor.py()
    }
    class TurnComplete {
        +executor.py()
    }
    class _AcpRequestError {
        +goose_executor.py()
        +.__init__()
    }
    class GooseExecutor {
        +goose_executor.py()
        +.__init__()
        +._start_process()
        +._provider_env()
        +._sandbox_launch_path()
        +._read_stderr()
        +._read_stdout()
        +._send()
        +._rpc()
        +._ensure_initialized()
    }
    class GooseNativeExecutor {
        +goose_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
    }
    class CapturedEvent {
        +helpers.py()
    }
    class HermesExecutor {
        +hermes_executor.py()
        +.__init__()
        +._setup_hermes_home()
        +._hermes_session_id()
        +.supports_streaming()
        +.handles_tools_internally()
        +.run_turn()
        +._session_key()
        +.close_session()
        +.close()
    }
    class HermesNativeExecutor {
        +hermes_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
        +.interrupt_session()
    }
    class KimiExecutor {
        +kimi_executor.py()
        +.__init__()
        +.handles_tools_internally()
        +.supports_streaming()
        +.supports_tool_calling()
        +._build_spawn_env()
        +._sandbox_launch_path()
        +._build_argv()
        +._translate_event()
        +.run_turn()
    }
    class KimiNativeExecutor {
        +kimi_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
    }
    class KiroNativeExecutor {
        +kiro_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
    }
    class _OverflowTokens {
        +llm_retry.py()
    }
    class DataUri {
        +native_attachments.py()
    }
    class NativeServerHarness {
        +native_server_harness.py()
        +.__init__()
        +.supports_streaming()
        +.handles_tools_internally()
        +.supports_live_message_queue()
        +._await_session_id()
        +.run_turn()
        +.interrupt_session()
        +.enqueue_session_message()
    }
    class NativeServerTransport {
        +native_server_transport.py()
        +.start_server()
        +.stop_server()
        +.create_or_resume_session()
        +.send_prompt()
        +.abort()
        +.events()
        +.list_history()
        +.fork()
        +.reply_permission()
    }
    class OpenResponsesExecutor {
        +open_responses_sdk.py()
        +.__init__()
        +._session_key()
        +._get_or_create_session_state()
        +.close_session()
        +.interrupt_session()
        +._build_delta_input()
        +.supports_streaming()
        +.supports_tool_calling()
        +.max_context_tokens()
    }
    class _ResponsesSessionState {
        +open_responses_sdk.py()
        +.reset()
    }
    class _AgentsSDK {
        +openai_agents_sdk_executor.py()
    }
    class _AgentsSessionState {
        +openai_agents_sdk_executor.py()
    }
    class _CallModelData {
        +openai_agents_sdk_executor.py()
    }
    class _ModelInputData {
        +openai_agents_sdk_executor.py()
    }
    class OpenAIAgentsSDKExecutor {
        +openai_agents_sdk_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.supports_stepwise_internal_turns()
        +.max_context_tokens()
        +._session_key()
        +._get_or_create_session_state()
        +.close_session()
    }
    class _RawResponseData {
        +openai_agents_sdk_executor.py()
    }
    class _RawResponseEvent {
        +openai_agents_sdk_executor.py()
    }
    class RawToolItemParts {
        +openai_agents_sdk_executor.py()
    }
    class _ReasoningBlockFilterChat {
        +openai_agents_sdk_executor.py()
        +.__init__()
        +.__getattr__()
    }
    class _ReasoningBlockFilterCompletions {
        +openai_agents_sdk_executor.py()
        +.__init__()
        +.create()
        +.__getattr__()
    }
    class _ReasoningBlockFilterStream {
        +openai_agents_sdk_executor.py()
        +.__init__()
        +.__aiter__()
        +.__anext__()
        +.__aenter__()
        +.__aexit__()
        +.__getattr__()
    }
    class _RunItem {
        +openai_agents_sdk_executor.py()
    }
    class _RunItemEvent {
        +openai_agents_sdk_executor.py()
    }
    class _RunResult {
        +openai_agents_sdk_executor.py()
        +.cancel()
        +.stream_events()
        +.to_state()
    }
    class _RunState {
        +openai_agents_sdk_executor.py()
    }
    class _SanitizingSession {
        +openai_agents_sdk_executor.py()
        +.__init__()
        +.get_items()
        +.add_items()
        +.pop_item()
        +.clear_session()
    }
    class _SDKSession {
        +openai_agents_sdk_executor.py()
        +.get_items()
        +.add_items()
        +.pop_item()
        +.clear_session()
    }
    class _ShellCommandBearerAuth {
        +openai_agents_sdk_executor.py()
        +.__init__()
        +.auth_flow()
    }
    class _StreamEvent {
        +openai_agents_sdk_executor.py()
    }
    class _ToolCallOutputRawItem {
        +openai_agents_sdk_executor.py()
    }
    class _ToolCallRawItem {
        +openai_agents_sdk_executor.py()
    }
    class OpenCodeNativeExecutor {
        +opencode_native_executor.py()
        +.__init__()
        +._build_prompt_with_model_override()
        +._resolve_opencode_session_id()
    }
    class FloatSampler {
        +performance_metrics.py()
        +.__call__()
    }
    class LoadAverageSampler {
        +performance_metrics.py()
        +.__call__()
    }
    class RssSampler {
        +performance_metrics.py()
        +.__call__()
    }
    class BlockedCheck {
        +pi_executor.py()
    }
    class PiExecutor {
        +pi_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_tool_calling()
        +.handles_tools_internally()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.close_session()
        +.interrupt_session()
        +.close()
    }
    class _PiRpcSession {
        +pi_executor.py()
        +.start()
        +._reader()
        +._stderr_reader()
        +.send_command()
        +.read_line()
        +.close()
    }
    class _PiSessionState {
        +pi_executor.py()
    }
    class PiSubprocessConfig {
        +pi_executor.py()
    }
    class SandboxedPiCli {
        +pi_executor.py()
    }
    class _ToolServer {
        +pi_executor.py()
        +.__init__()
        +.start()
        +.stop()
        +._handle_client()
        +._token_ok()
        +._execute()
        +._evaluate_policy()
    }
    class PiNativeExecutor {
        +pi_native_executor.py()
        +.__init__()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
        +._refresh_auth_headers()
    }
    class Policy {
        +policies.py()
        +.bind_runtime()
        +.evaluate()
        +.reset_turn()
        +._get_context()
    }
    class PolicyAction {
        +policies.py()
    }
    class PolicyResult {
        +policies.py()
    }
    class PolicyRuntimeContext {
        +policies.py()
    }
    class _AcpRequestError {
        +qwen_executor.py()
        +.__init__()
    }
    class QwenExecutor {
        +qwen_executor.py()
        +.__init__()
        +._start_process()
        +._sandbox_launch_path()
        +._resolve_gateway_env()
        +._read_stderr()
        +._read_stdout()
        +._send()
        +._rpc()
        +._notify()
    }
    class QwenNativeExecutor {
        +qwen_native_executor.py()
        +.__init__()
        +._ensure_ready()
        +.supports_streaming()
        +.supports_live_message_queue()
        +.enqueue_session_message()
        +.run_turn()
    }
    class _RetryTestHarness {
        +_retry_test_harness.py()
        +.run_turn()
    }
    class SandboxPolicy {
        +sandbox.py()
        +.to_jsonable()
    }
    class HarnessApp {
        +_scaffold.py()
        +.__init__()
        +.on_shutdown()
        +.run_turn()
        +._build_error_detail()
        +.build()
        +._check_auth()
        +._on_shutdown_signal()
        +._drain_for_shutdown()
        +._build_v1_router()
    }
    class PolicyVerdictEvent {
        +_scaffold.py()
    }
    class PolicyVerdictPayload {
        +_scaffold.py()
    }
    class TurnContext {
        +_scaffold.py()
        +.__init__()
        +.emit()
        +.dispatch_tool()
        +.elicit()
        +.next_injection()
        +._complete_tool()
        +._complete_elicitation()
        +.evaluate_policy()
        +._complete_policy_evaluation()
    }
    class CreateResponseRequest {
        +schemas.py()
    }
    class InjectionConsumedEvent {
        +schemas.py()
    }
    class _AntigravityCancelledError {
        +test_antigravity_executor.py()
    }
    class _BlockingConversation {
        +test_antigravity_executor.py()
        +.__init__()
        +.send()
        +.receive_steps()
        +.cancel()
    }
    class _FakeAgent {
        +test_antigravity_executor.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
    }
    class _FakeConversation {
        +test_antigravity_executor.py()
        +.__init__()
        +.send()
        +.receive_steps()
        +.cancel()
    }
    class _FakeLocalAgentConfig {
        +test_antigravity_executor.py()
        +.__init__()
    }
    class _FakePostToolCallHook {
        +test_antigravity_executor.py()
        +.run()
    }
    class _FakeStep {
        +test_antigravity_executor.py()
        +.__init__()
    }
    class _FakeToolCall {
        +test_antigravity_executor.py()
        +.__init__()
    }
    class _FakeToolResult {
        +test_antigravity_executor.py()
        +.__init__()
    }
    class _FakeUsage {
        +test_antigravity_executor.py()
        +.__init__()
    }
    class _FireToolResult {
        +test_antigravity_executor.py()
    }
    class _RaiseCancelled {
        +test_antigravity_executor.py()
    }
    class _RaiseGeneric {
        +test_antigravity_executor.py()
    }
    class _RebuildConversation {
        +test_antigravity_executor.py()
        +.__init__()
        +.send()
        +.receive_steps()
        +.cancel()
    }
    class _StepSource {
        +test_antigravity_executor.py()
    }
    class _StepStatus {
        +test_antigravity_executor.py()
    }
    class _StepTarget {
        +test_antigravity_executor.py()
    }
    class _StepType {
        +test_antigravity_executor.py()
    }
    class _YieldStep {
        +test_antigravity_executor.py()
    }
    class _CapturedRequest {
        +test_claude_gateway_shim.py()
    }
    class _RecordingUpstream {
        +test_claude_gateway_shim.py()
        +._app()
        +.start()
        +.stop()
    }
    class TestBuildMcpTools {
        +test_claude_sdk_executor.py()
        +.test_builds_tools_from_schemas()
        +.test_empty_schemas()
        +.test_handler_calls_executor()
        +.test_handler_marks_blocked_result_as_error()
        +.test_handler_marks_error_result_as_error()
        +.test_handler_no_executor()
    }
    class TestConstructor {
        +test_claude_sdk_executor.py()
        +.test_default_values()
        +.test_os_env_spec_with_no_sandbox_keeps_native_tools_enabled()
        +.test_os_env_spec_wraps_cli_and_enables_native_tools()
        +.test_prepare_claude_cli_path_adds_internal_roots_to_read_allowlist()
        +.test_default_process_sandbox_wraps_cli_without_enabling_native_tools()
        +.test_os_env_spec_without_supported_native_sandbox_disables_native_tools()
        +.test_model_override()
        +.test_supports_streaming()
        +.test_supports_tool_calling()
    }
    class TestEmptyPrompt {
        +test_claude_sdk_executor.py()
        +.test_empty_prompt_yields_turn_complete()
    }
    class TestPromptExtraction {
        +test_claude_sdk_executor.py()
        +._make_executor()
        +.test_resumed_session_uses_last_user_message()
        +.test_empty_messages()
        +.test_no_user_messages()
        +.test_dict_content_converted()
        +.test_fresh_session_with_history_serializes_context()
    }
    class TestResolveGatewayEnv {
        +test_claude_sdk_executor.py()
        +.test_from_profile()
        +.test_strips_trailing_slash()
        +.test_no_creds_returns_empty()
        +.test_host_override_skips_profile_lookup()
        +.test_host_override_requires_base_url()
        +.test_host_override_requires_auth_command()
    }
    class TestSkillsFilterTranslation {
        +test_claude_sdk_executor.py()
        +.test_all_lets_sdk_default_setting_sources()
        +.test_none_zeros_skills_and_setting_sources()
        +.test_list_lets_sdk_default_setting_sources()
        +.test_unknown_string_returns_none_for_caller_fallback()
    }
    class TestStreamEventStreaming {
        +test_claude_sdk_executor.py()
        +.test_live_clients_are_reused_per_omnigent_session()
        +.test_os_env_spec_exposes_only_explicit_native_tools()
        +.test_mcp_only_session_disables_native_tool_base_set()
        +.test_session_send_tool_is_exposed_via_mcp()
        +.test_crashed_session_refuses_future_turns()
        +.test_close_session_disconnects_live_client()
        +.test_interrupt_session_interrupts_then_drops_session()
        +.test_interrupt_session_closes_even_when_interrupt_fails()
        +.test_close_disconnects_all_live_clients()
    }
    class TestSystemMessages {
        +test_claude_sdk_executor.py()
        +.test_databricks_auth_uses_api_key_helper_settings()
        +.test_auth_retry_surfaces_executor_error()
        +.test_auth_retry_databricks_gateway_mentions_databrickscfg()
    }
    class TestToolCallPolicyGate {
        +test_claude_sdk_executor.py()
        +._make_executor()
        +.test_connector_native_tool_triggers_tool_call_eval()
        +.test_deny_verdict_blocks_execution()
        +.test_ask_verdict_prompts_even_under_bypass()
        +.test_ask_verdict_denies_when_user_declines()
        +.test_ask_verdict_without_elicitation_handler_fails_closed()
        +.test_unspecified_verdict_falls_through()
        +.test_unexpected_verdict_fails_closed()
        +.test_allow_verdict_no_human_prompt_under_bypass()
    }
    class _ChunkedPipe {
        +test_codex_executor.py()
        +.__init__()
        +.read()
    }
    class _FakeAppSession {
        +test_codex_executor.py()
        +.__post_init__()
        +.run_turn()
        +.close()
        +.interrupt_turn()
    }
    class _FakePipe {
        +test_codex_executor.py()
        +.__init__()
        +.write()
        +.drain()
        +.close()
        +.wait_closed()
        +.readline()
        +.read()
    }
    class _FakeProcess {
        +test_codex_executor.py()
        +.__init__()
        +.terminate()
        +.kill()
        +.wait()
    }
    class _FakeVersionProcess {
        +test_codex_executor.py()
        +.communicate()
    }
    class _OverflowingPipe {
        +test_codex_executor.py()
        +.__init__()
        +.read()
    }
    class TestCodexExecutor {
        +test_codex_executor.py()
        +.test_databricks_codex_config_overrides()
        +.test_codex_config_overrides_neutralize_toml_breakout()
        +.test_constructor_databricks_flag_with_profile()
        +.test_constructor_does_not_force_codex_debug_env_by_default()
        +.test_constructor_databricks_flag_with_profile_uses_profile_credentials()
        +.test_constructor_databricks_flag_with_host_override_skips_profile_lookup()
        +.test_constructor_databricks_flag_with_host_override_requires_base_url()
        +.test_constructor_databricks_flag_with_host_override_requires_auth_command()
        +.test_constructor_databricks_flag_no_creds_raises()
    }
    class _FakeCodexNativeClient {
        +test_codex_native_executor.py()
        +.__init__()
        +.connect()
        +.close()
        +.request()
        +.iter_events()
    }
    class _ApproveOnce {
        +test_copilot_executor.py()
    }
    class _FakeEvent {
        +test_copilot_executor.py()
        +.__init__()
        +.to_dict()
    }
    class _FakeSession {
        +test_copilot_executor.py()
        +.__init__()
        +.on()
        +.send_and_wait()
        +.disconnect()
        +.abort()
    }
    class _PermissionHandler {
        +test_copilot_executor.py()
    }
    class _Reject {
        +test_copilot_executor.py()
        +.__init__()
    }
    class _Unsub {
        +test_copilot_executor.py()
        +.__init__()
        +.__call__()
    }
    class TestContentExtraction {
        +test_cursor_native_executor.py()
        +.test_string_content()
        +.test_input_text_blocks()
        +.test_real_image_attachment_materialized()
        +.test_empty_and_none()
        +.test_latest_user_text()
    }
    class TestExecutorCapabilities {
        +test_cursor_native_executor.py()
        +.test_capability_flags()
    }
    class TestForkPreamble {
        +test_cursor_native_executor.py()
        +.test_read_does_not_consume_clear_does()
        +.test_empty_preamble_is_not_written()
        +.test_read_missing_is_none_and_clear_is_noop()
        +.test_wrap_fences_preamble_before_user_text()
        +.test_wrap_defangs_sentinels_inside_preamble()
    }
    class TestRegistration {
        +test_cursor_native_executor.py()
        +.test_harness_is_registered()
        +.test_harness_is_allowlisted()
        +.test_cursor_native_is_terminal_native()
        +.test_native_coding_agent_record()
    }
    class TestRunTurnPreambleInjection {
        +test_cursor_native_executor.py()
    }
    class FakeChat {
        +test_databricks_executor.py()
        +.__init__()
    }
    class FakeClient {
        +test_databricks_executor.py()
        +.__init__()
    }
    class FakeCompletions {
        +test_databricks_executor.py()
        +.__init__()
        +.create()
    }
    class FakeDelta {
        +test_databricks_executor.py()
    }
    class FakeFunctionDelta {
        +test_databricks_executor.py()
    }
    class FakeStreamChoice {
        +test_databricks_executor.py()
    }
    class FakeStreamChunk {
        +test_databricks_executor.py()
    }
    class FakeToolCallDelta {
        +test_databricks_executor.py()
    }
    class _StubSdkConfig {
        +test_databricks_executor.py()
        +.__init__()
        +.authenticate()
    }
    class TestConvertMessages {
        +test_databricks_executor.py()
        +.test_system_prompt()
        +.test_user_and_assistant()
        +.test_tool_call_and_result_pair()
        +.test_invalid_tool_name_is_normalized_in_history_replay()
        +.test_orphan_tool_result()
        +.test_tool_call_content_as_string()
    }
    class TestConvertTools {
        +test_databricks_executor.py()
        +.test_basic_tool()
        +.test_tool_without_parameters()
        +.test_preserves_required_args_in_async_tool_schema()
        +.test_preserves_required_args_in_session_send_schema()
        +.test_empty_tools()
        +.test_invalid_tool_name_is_normalized_for_provider()
    }
    class TestDatabricksExecutorConfig {
        +test_databricks_executor.py()
        +.test_passes_model_and_params()
        +.test_default_model()
        +.test_tools_passed_in_openai_format()
    }
    class TestDatabricksExecutorErrors {
        +test_databricks_executor.py()
        +.test_empty_stream()
        +.test_api_exception()
    }
    class TestDatabricksExecutorMultiTurn {
        +test_databricks_executor.py()
        +.test_tool_call_then_response()
        +.test_interrupt_session_closes_active_stream()
    }
    class TestDatabricksExecutorTextResponse {
        +test_databricks_executor.py()
        +.test_simple_text_response()
        +.test_empty_content()
    }
    class TestDatabricksExecutorToolCalls {
        +test_databricks_executor.py()
        +.test_single_tool_call()
        +.test_multiple_tool_calls()
        +.test_tool_call_with_text()
        +.test_malformed_arguments()
    }
    class _AcceptingInjectionExecutor {
        +test_executor_adapter.py()
        +.__init__()
        +.enqueue_session_message()
    }
    class _CapturingExecutor {
        +_test_executor_adapter_harness.py()
        +.run_turn()
        +.close()
        +.close_session()
    }
    class _InterruptTrackingExecutor {
        +test_executor_adapter.py()
        +.__init__()
        +.interrupt_session()
    }
    class _OneInjectionCtx {
        +test_executor_adapter.py()
        +.__init__()
        +.next_injection()
        +.emit()
    }
    class _ParsedSSEEvent {
        +test_executor_adapter.py()
    }
    class _RecordingTurnContext {
        +test_executor_adapter.py()
        +.__init__()
        +.emit()
    }
    class _StubExecutor {
        +test_executor_adapter.py()
    }
    class TestMockExecutor {
        +test_executor.py()
        +.test_simple_response()
        +.test_tool_call()
        +.test_tool_call_with_followup()
        +.test_multiple_turns()
        +.test_empty_queue_fallback()
        +.test_custom_events()
    }
    class TestSplitTransientTail {
        +test_executor.py()
        +.test_empty_list()
        +.test_no_transient_tail()
        +.test_single_transient_at_tail()
        +.test_multiple_transient_at_tail()
        +.test_framework_message_in_middle_stays_persisted()
        +.test_missing_metadata_key_is_persisted()
    }
    class _AskVerdict {
        +test_goose_acp_e2e.py()
    }
    class _FakeOSEnv {
        +test_goose_executor.py()
        +.__init__()
        +.read()
        +.write()
        +.close()
    }
    class TestPopulateHermesHome {
        +test_hermes_executor.py()
        +.test_creates_config_with_hook()
        +.test_creates_wrapper_script()
        +.test_creates_allowlist()
    }
    class TestUtils {
        +test_hermes_executor.py()
        +.test_strip_hermes_metadata_removes_session_id_line()
        +.test_strip_hermes_metadata_removes_resume_notice()
        +.test_strip_hermes_metadata_removes_warnings()
        +.test_strip_hermes_metadata_preserves_empty_response()
        +.test_strip_hermes_metadata_preserves_multi_line_response()
        +.test_parse_session_id_found()
        +.test_parse_session_id_not_found()
        +.test_parse_session_id_empty_output()
        +.test_extract_last_user_message_simple()
    }
    class _MarkerPoller {
        +test_host_cross_family_fork_e2e.py()
        +.__call__()
    }
    class _FakeProcess {
        +test_kimi_harness.py()
        +.__init__()
        +.wait()
        +.terminate()
        +.kill()
    }
    class _FakeStderr {
        +test_kimi_harness.py()
        +.__init__()
        +.read()
    }
    class _FakeStdout {
        +test_kimi_harness.py()
        +.__init__()
        +.__aiter__()
        +.__anext__()
    }
    class TestContentExtraction {
        +test_kimi_native_executor.py()
        +.test_string_content()
        +.test_input_text_blocks()
        +.test_real_image_attachment_materialized()
        +.test_empty_and_none()
        +.test_latest_user_text()
    }
    class TestExecutorCapabilities {
        +test_kimi_native_executor.py()
        +.test_capability_flags()
    }
    class TestSettlePaneReadiness {
        +test_kimi_native_executor.py()
        +.test_marker_matches_live_kimi_footer()
        +.test_settle_returns_on_first_capture_when_ready()
    }
    class _FakeTransport {
        +test_native_server_harness.py()
        +.__init__()
        +.send_prompt()
        +.abort()
    }
    class FakeClient {
        +test_open_responses_sdk.py()
        +.__init__()
    }
    class FakeFunctionCallItem {
        +test_open_responses_sdk.py()
    }
    class FakeIncomplete {
        +test_open_responses_sdk.py()
    }
    class FakeMessageItem {
        +test_open_responses_sdk.py()
    }
    class FakeResponse {
        +test_open_responses_sdk.py()
    }
    class FakeResponsesAPI {
        +test_open_responses_sdk.py()
        +.__init__()
        +.create()
    }
    class FakeTextPart {
        +test_open_responses_sdk.py()
    }
    class TestConvertMessages {
        +test_open_responses_sdk.py()
        +.test_user_and_assistant()
        +.test_tool_call_and_result_pair()
        +.test_invalid_tool_name_is_normalized_in_history_replay()
        +.test_orphan_tool_result_becomes_user_message()
        +.test_user_message_preserves_structured_content_list()
        +.test_assistant_message_preserves_structured_content_list()
        +.test_user_message_empty_content_substitutes_placeholder()
    }
    class TestConvertTools {
        +test_open_responses_sdk.py()
        +.test_basic_tool()
        +.test_invalid_tool_name_is_normalized_for_provider()
        +.test_preserves_required_args_in_async_tool_schema()
        +.test_preserves_required_args_in_session_send_schema()
    }
    class TestDatabricksBaseUrl {
        +test_open_responses_sdk.py()
        +.test_databricks_openai_base_url_normalizes_trailing_slash()
    }
    class TestNormalizeResponseOutput {
        +test_open_responses_sdk.py()
        +.test_strips_provider_only_fields()
        +.test_reasoning_replay_always_includes_summary()
    }
    class TestOpenAIClientConfig {
        +test_open_responses_sdk.py()
        +.test_client_uses_openai_env()
        +.test_client_uses_openai_base_url_override()
        +.test_client_uses_databricks_config()
    }
    class TestOpenResponsesExecutor {
        +test_open_responses_sdk.py()
        +.test_simple_text_response()
        +.test_function_call_response()
        +.test_follow_up_tool_result_uses_previous_response_id()
        +.test_transient_framework_notice_is_included_in_delta_and_not_persisted_in_cursor()
        +.test_falls_back_when_backend_rejects_previous_response_id()
        +.test_conversation_state_is_scoped_by_session_id()
        +.test_incomplete_without_text_surfaces_error()
        +.test_interrupt_session_closes_active_stream()
    }
    class _FakeAgent {
        +test_openai_agents_sdk_executor.py()
        +.__init__()
    }
    class _FakeCompactionItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeFunctionTool {
        +test_openai_agents_sdk_executor.py()
        +.__init__()
    }
    class _FakeItemHelpers {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeMaxTurnsExceeded {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeMessageOutputItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeModelSettings {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeOpenAIProvider {
        +test_openai_agents_sdk_executor.py()
        +.__init__()
    }
    class _FakePromptTokensDetails {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeRawEvent {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeRawResponse {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeRawTextDelta {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeReasoningItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeResult {
        +test_openai_agents_sdk_executor.py()
        +.__init__()
        +.stream_events()
        +.cancel()
        +.to_state()
    }
    class _FakeRunConfig {
        +test_openai_agents_sdk_executor.py()
        +.__init__()
    }
    class _FakeRunItemEvent {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeRunner {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeSessionSettings {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeSQLiteSession {
        +test_openai_agents_sdk_executor.py()
        +.__init__()
        +.get_items()
        +.add_items()
        +.pop_item()
        +.clear_session()
    }
    class _FakeToolCallItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeToolCallRawItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeToolOutputItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeToolOutputRawItem {
        +test_openai_agents_sdk_executor.py()
    }
    class _FakeUsage {
        +test_openai_agents_sdk_executor.py()
    }
    class TestOpenAIAgentsSDKExecutor {
        +test_openai_agents_sdk_executor.py()
        +.test_sanitize_replay_item_drops_long_ids()
        +.test_build_tools_preserves_session_send_schema()
        +.test_streams_text_and_tool_events()
        +.test_databricks_client_default_model_uses_databricks_model()
        +.test_parallel_tool_calls_can_be_overridden()
        +.test_max_tokens_is_passed_to_model_settings()
        +.test_max_tokens_is_omitted_when_unset()
        +.test_tool_error_output_sets_error_field()
        +.test_tool_blocked_output_sets_blocked_status()
    }
    class _FakeServer {
        +test_opencode_native_executor.py()
        +.__init__()
        +.handler()
    }
    class _FakeProcess {
        +test_pi_executor.py()
        +.__init__()
        +.terminate()
        +.kill()
        +.wait()
    }
    class _FakeStreamReader {
        +test_pi_executor.py()
        +.__init__()
        +.readline()
        +.read()
        +.__aiter__()
        +.__anext__()
    }
    class _FakeStreamWriter {
        +test_pi_executor.py()
        +.__init__()
        +.write()
        +.drain()
        +.close()
        +.wait_closed()
    }
    class TestBlockedToolDetection {
        +test_pi_executor.py()
        +._make_executor()
        +._run_with_events()
        +.test_blocked_dict_result()
        +.test_blocked_content_wrapped_result()
        +.test_blocked_string_result()
        +.test_blocked_nested_isError_in_result()
        +.test_non_blocked_error_stays_error()
    }
    class TestBuildEnvAndDir {
        +test_pi_executor.py()
        +.test_databricks_creates_models_json()
        +.test_tools_generate_extension_js()
    }
    class TestBuildModelsJson {
        +test_pi_executor.py()
        +.test_has_three_providers()
        +.test_dynamic_model_declared_image_capable()
        +.test_static_model_declared_image_capable()
        +.test_base_urls_use_host()
        +.test_base_urls_can_come_from_ucode_state()
        +.test_ucode_codex_gateway_rerouted_off_responses_path()
        +.test_gemini_model_routed_off_codex_gateway()
        +.test_generic_openai_base_url_used_as_is()
        +.test_api_key_set()
    }
    class TestClose {
        +test_pi_executor.py()
        +.test_close_all_sessions_and_tool_server()
    }
    class TestGateNativeTool {
        +test_pi_executor.py()
        +.test_deny_verdict_blocks_with_reason()
        +.test_allow_verdict_does_not_block()
        +.test_deny_without_reason_uses_fallback()
        +.test_no_evaluator_allows()
    }
    class TestGenerateExtensionJs {
        +test_pi_executor.py()
        +.test_contains_tool_names()
        +.test_empty_tools()
        +.test_registers_native_tool_call_policy_hook()
    }
    class TestPiExecutorConstructor {
        +test_pi_executor.py()
        +.test_constructor_finds_pi()
        +.test_constructor_raises_when_pi_not_found()
        +.test_constructor_databricks_with_env()
        +.test_constructor_databricks_with_host_override_requires_auth_command()
        +.test_constructor_databricks_with_auth_command()
        +.test_constructor_databricks_no_creds_raises()
        +.test_constructor_with_model_override()
        +.test_supports_streaming()
        +.test_supports_tool_calling()
    }
    class TestPiProviderForModel {
        +test_pi_executor.py()
        +.test_gpt_model()
        +.test_claude_model()
        +.test_other_model()
    }
    class TestPiRpcSession {
        +test_pi_executor.py()
        +.test_reader_accepts_single_stdout_line_larger_than_default_stream_limit()
        +.test_send_command()
        +.test_send_command_raises_when_no_process()
        +.test_close_terminates_process()
    }
    class TestResolveModel {
        +test_pi_executor.py()
        +.test_cfg_model_takes_priority_over_constructor()
        +.test_constructor_default_used_when_no_cfg_override()
        +.test_cfg_model_used_when_no_constructor_default()
    }
    class TestRunTurn {
        +test_pi_executor.py()
        +._make_executor()
        +.test_empty_user_message_returns_turn_complete()
        +.test_streaming_text_events()
        +.test_tool_execution_events()
        +.test_error_on_failed_response()
        +.test_eof_without_response_yields_error()
        +.test_agent_end_extracts_response_from_messages()
        +.test_tool_error_event()
        +.test_message_end_with_error_stop_reason()
    }
    class TestSanitizeSchema {
        +test_pi_executor.py()
        +.test_removes_examples_and_default()
        +.test_collapses_anyof_to_first_typed()
        +.test_removes_additional_properties()
        +.test_nested_properties_are_sanitized()
        +.test_items_are_sanitized()
        +.test_passthrough_for_non_dict()
    }
    class TestSessionManagement {
        +test_pi_executor.py()
        +.test_session_key_from_session_id()
        +.test_session_key_from_metadata()
        +.test_session_key_default()
        +.test_close_session()
        +.test_enqueue_session_message()
        +.test_enqueue_session_message_no_session()
        +.test_interrupt_session_aborts_then_drops_session()
    }
    class TestToolServer {
        +test_pi_executor.py()
        +.setUp()
        +._run_generated_bridge_tool()
        +.test_start_and_stop()
        +.test_tool_execution_over_tcp()
        +.test_tool_execution_error()
        +.test_no_executor_returns_error()
        +.test_non_json_serializable_result_returns_error_frame()
        +.test_safe_dumps_with_non_serializable_req_id_does_not_raise()
        +.test_generated_bridge_returns_error_for_unserializable_tool_result()
    }
    class TestFunctionPolicy {
        +test_policies.py()
        +.test_allow_by_default()
        +.test_sync_callable_block()
        +.test_sync_callable_allow()
        +.test_async_callable()
        +.test_callable_returns_dict()
        +.test_deny_action_from_dict()
    }
    class TestPromptPolicy {
        +test_policies.py()
        +.test_prompt_policy_input_is_json_envelope()
        +.test_prompt_policy_allows_from_json()
        +.test_prompt_policy_denies_content()
        +.test_prompt_policy_can_set_labels_when_enabled()
        +.test_prompt_policy_ignores_set_labels_when_disabled()
        +.test_prompt_policy_uses_configured_executor_spec()
        +.test_prompt_policy_loader_fields()
        +.test_prompt_policy_invalid_json_blocks()
    }
    class TestRateLimitPolicy {
        +test_policies.py()
        +.test_tool_call_rate_limit()
        +.test_reset_turn()
    }
    class _FakeOSEnv {
        +test_qwen_executor.py()
        +.__init__()
        +.read()
        +.write()
        +.close()
    }
    class _TrackingAsyncClient {
        +test_runner_entry.py()
        +.__init__()
        +.aclose()
    }
    class _TrackingMcpManager {
        +test_runner_entry.py()
        +.__init__()
        +.shutdown()
    }
    class _TrackingSyncClient {
        +test_runner_entry.py()
        +.__init__()
        +.close()
    }
    class _TrackingTerminalRegistry {
        +test_runner_entry.py()
        +.__init__()
        +.shutdown()
    }
    class _BusyProgressHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _CancellableHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _ElicitationHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _FastHeartbeatHarness {
        +_test_scaffold_harnesses.py()
        +._heartbeat_loop()
        +.run_turn()
    }
    class _InjectionHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _NativeToolEmittingHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _SlowStreamHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _ToolDispatchHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _UsageHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _WedgedFastHeartbeatHarness {
        +_test_scaffold_harnesses.py()
        +._heartbeat_loop()
        +.run_turn()
    }
    class _WedgedHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _ParsedSSEEvent {
        +test_scaffold.py()
    }
    class RetryPolicy {
        +types.py()
        +.__post_init__()
        +.to_json()
        +.compute_backoff_delay()
    }
    class UsageObserver {
        +_usage_observer.py()
        +.__call__()
    }
    AntigravityExecutor --> RetryPolicy
    AntigravityExecutor --> Executor
    AntigravityExecutor --> ExecutorConfig
    AntigravityExecutor --> ExecutorError
    AntigravityExecutor --> ExecutorEvent
    AntigravityExecutor --> ReasoningChunk
    AntigravityExecutor --> TextChunk
    AntigravityExecutor --> ToolCallComplete
    AntigravityExecutor --> ToolCallRequest
    AntigravityExecutor --> ToolCallStatus
    AntigravityExecutor --> TurnCancelled
    AntigravityExecutor --> TurnComplete
    AntigravityExecutor --> _StepType
    AntigravityExecutor --> _StepStatus
    AntigravityExecutor --> _StepSource
    AntigravityExecutor --> _StepTarget
    AntigravityExecutor --> _AntigravityCancelledError
    AntigravityExecutor --> _FakeToolCall
    AntigravityExecutor --> _FakeToolResult
    AntigravityExecutor --> _FakeUsage
    AntigravityExecutor --> _FakeStep
    AntigravityExecutor --> _YieldStep
    AntigravityExecutor --> _FireToolResult
    AntigravityExecutor --> _RaiseCancelled
    AntigravityExecutor --> _RaiseGeneric
    AntigravityExecutor --> _FakeConversation
    AntigravityExecutor --> _FakeAgent
    AntigravityExecutor --> _FakeLocalAgentConfig
    AntigravityExecutor --> _FakePostToolCallHook
    AntigravityExecutor --> _BlockingConversation
    AntigravityExecutor --> _RebuildConversation
    _AntigravitySessionState --> RetryPolicy
    _AntigravitySessionState --> Executor
    _AntigravitySessionState --> ExecutorConfig
    _AntigravitySessionState --> ExecutorError
    _AntigravitySessionState --> ExecutorEvent
    _AntigravitySessionState --> ReasoningChunk
    _AntigravitySessionState --> TextChunk
    _AntigravitySessionState --> ToolCallComplete
    _AntigravitySessionState --> ToolCallRequest
    _AntigravitySessionState --> ToolCallStatus
    _AntigravitySessionState --> TurnCancelled
    _AntigravitySessionState --> TurnComplete
    _NeverRaisedError --> RetryPolicy
    _NeverRaisedError --> Executor
    _NeverRaisedError --> ExecutorConfig
    _NeverRaisedError --> ExecutorError
    _NeverRaisedError --> ExecutorEvent
    _NeverRaisedError --> ReasoningChunk
    _NeverRaisedError --> TextChunk
    _NeverRaisedError --> ToolCallComplete
    _NeverRaisedError --> ToolCallRequest
    _NeverRaisedError --> ToolCallStatus
    _NeverRaisedError --> TurnCancelled
    _NeverRaisedError --> TurnComplete
    _PendingTool --> RetryPolicy
    _PendingTool --> Executor
    _PendingTool --> ExecutorConfig
    _PendingTool --> ExecutorError
    _PendingTool --> ExecutorEvent
    _PendingTool --> ReasoningChunk
    _PendingTool --> TextChunk
    _PendingTool --> ToolCallComplete
    _PendingTool --> ToolCallRequest
    _PendingTool --> ToolCallStatus
    _PendingTool --> TurnCancelled
    _PendingTool --> TurnComplete
    AntigravityNativeExecutor --> Executor
    AntigravityNativeExecutor --> ExecutorConfig
    AntigravityNativeExecutor --> ExecutorError
    AntigravityNativeExecutor --> ExecutorEvent
    AntigravityNativeExecutor --> TurnComplete
    AntigravityNativeExecutor --> PermanentLLMError
    ClaudeGatewayShim --> _Process
    ClaudeGatewayShim --> _CancelScope
    ClaudeGatewayShim --> _TaskGroup
    ClaudeGatewayShim --> _TaskHandle
    ClaudeGatewayShim --> _ClaudeQuery
    ClaudeGatewayShim --> _Stream
    ClaudeGatewayShim --> _ClaudeTransport
    ClaudeGatewayShim --> _ClaudeClient
    ClaudeGatewayShim --> _StreamEventObj
    ClaudeGatewayShim --> _AssistantMessageObj
    ClaudeGatewayShim --> _UserMessageObj
    ClaudeGatewayShim --> _ResultMessageObj
    ClaudeGatewayShim --> _SystemMessageObj
    ClaudeGatewayShim --> _TextBlockObj
    ClaudeGatewayShim --> _ToolUseBlockObj
    ClaudeGatewayShim --> _ToolResultBlockObj
    ClaudeGatewayShim --> _ClaudeSDK
    ClaudeGatewayShim --> _ClaudeClientState
    ClaudeGatewayShim --> PreparedClaudeCli
    ClaudeGatewayShim --> _ResolvedSkills
    ClaudeGatewayShim --> ClaudeSDKExecutor
    ClaudeGatewayShim --> _CapturedRequest
    ClaudeGatewayShim --> _RecordingUpstream
    ClaudeNativeExecutor --> Executor
    ClaudeNativeExecutor --> ExecutorConfig
    ClaudeNativeExecutor --> ExecutorError
    ClaudeNativeExecutor --> ExecutorEvent
    ClaudeNativeExecutor --> TurnComplete
    _AssistantMessageObj --> RetryPolicy
    _AssistantMessageObj --> ClaudeGatewayShim
    _AssistantMessageObj --> Executor
    _AssistantMessageObj --> ExecutorConfig
    _AssistantMessageObj --> ExecutorError
    _AssistantMessageObj --> ExecutorEvent
    _AssistantMessageObj --> ReasoningChunk
    _AssistantMessageObj --> TextChunk
    _AssistantMessageObj --> ToolCallComplete
    _AssistantMessageObj --> ToolCallRequest
    _AssistantMessageObj --> ToolCallStatus
    _AssistantMessageObj --> TurnComplete
    _AssistantMessageObj --> CompactionComplete
    _CancelScope --> RetryPolicy
    _CancelScope --> ClaudeGatewayShim
    _CancelScope --> Executor
    _CancelScope --> ExecutorConfig
    _CancelScope --> ExecutorError
    _CancelScope --> ExecutorEvent
    _CancelScope --> ReasoningChunk
    _CancelScope --> TextChunk
    _CancelScope --> ToolCallComplete
    _CancelScope --> ToolCallRequest
    _CancelScope --> ToolCallStatus
    _CancelScope --> TurnComplete
    _CancelScope --> CompactionComplete
    _ClaudeClient --> RetryPolicy
    _ClaudeClient --> ClaudeGatewayShim
    _ClaudeClient --> Executor
    _ClaudeClient --> ExecutorConfig
    _ClaudeClient --> ExecutorError
    _ClaudeClient --> ExecutorEvent
    _ClaudeClient --> ReasoningChunk
    _ClaudeClient --> TextChunk
    _ClaudeClient --> ToolCallComplete
    _ClaudeClient --> ToolCallRequest
    _ClaudeClient --> ToolCallStatus
    _ClaudeClient --> TurnComplete
    _ClaudeClient --> CompactionComplete
    _ClaudeClientState --> RetryPolicy
    _ClaudeClientState --> ClaudeGatewayShim
    _ClaudeClientState --> Executor
    _ClaudeClientState --> ExecutorConfig
    _ClaudeClientState --> ExecutorError
    _ClaudeClientState --> ExecutorEvent
    _ClaudeClientState --> ReasoningChunk
    _ClaudeClientState --> TextChunk
    _ClaudeClientState --> ToolCallComplete
    _ClaudeClientState --> ToolCallRequest
    _ClaudeClientState --> ToolCallStatus
    _ClaudeClientState --> TurnComplete
    _ClaudeClientState --> CompactionComplete
    _ClaudeQuery --> RetryPolicy
    _ClaudeQuery --> ClaudeGatewayShim
    _ClaudeQuery --> Executor
    _ClaudeQuery --> ExecutorConfig
    _ClaudeQuery --> ExecutorError
    _ClaudeQuery --> ExecutorEvent
    _ClaudeQuery --> ReasoningChunk
    _ClaudeQuery --> TextChunk
    _ClaudeQuery --> ToolCallComplete
    _ClaudeQuery --> ToolCallRequest
    _ClaudeQuery --> ToolCallStatus
    _ClaudeQuery --> TurnComplete
    _ClaudeQuery --> CompactionComplete
    _ClaudeSDK --> RetryPolicy
    _ClaudeSDK --> ClaudeGatewayShim
    _ClaudeSDK --> Executor
    _ClaudeSDK --> ExecutorConfig
    _ClaudeSDK --> ExecutorError
    _ClaudeSDK --> ExecutorEvent
    _ClaudeSDK --> ReasoningChunk
    _ClaudeSDK --> TextChunk
    _ClaudeSDK --> ToolCallComplete
    _ClaudeSDK --> ToolCallRequest
    _ClaudeSDK --> ToolCallStatus
    _ClaudeSDK --> TurnComplete
    _ClaudeSDK --> CompactionComplete
    ClaudeSDKExecutor --> RetryPolicy
    ClaudeSDKExecutor --> ClaudeGatewayShim
    ClaudeSDKExecutor --> Executor
    ClaudeSDKExecutor --> ExecutorConfig
    ClaudeSDKExecutor --> ExecutorError
    ClaudeSDKExecutor --> ExecutorEvent
    ClaudeSDKExecutor --> ReasoningChunk
    ClaudeSDKExecutor --> TextChunk
    ClaudeSDKExecutor --> ToolCallComplete
    ClaudeSDKExecutor --> ToolCallRequest
    ClaudeSDKExecutor --> ToolCallStatus
    ClaudeSDKExecutor --> TurnComplete
    ClaudeSDKExecutor --> CompactionComplete
    ClaudeSDKExecutor --> _CapturedRequest
    ClaudeSDKExecutor --> _RecordingUpstream
    ClaudeSDKExecutor --> TestPromptExtraction
    ClaudeSDKExecutor --> TestConstructor
    ClaudeSDKExecutor --> TestBuildMcpTools
    ClaudeSDKExecutor --> TestResolveGatewayEnv
    ClaudeSDKExecutor --> TestEmptyPrompt
    ClaudeSDKExecutor --> TestSystemMessages
    ClaudeSDKExecutor --> TestSkillsFilterTranslation
    ClaudeSDKExecutor --> TestStreamEventStreaming
    ClaudeSDKExecutor --> TestToolCallPolicyGate
    ClaudeSDKExecutor --> FakeFunctionDelta
    ClaudeSDKExecutor --> FakeToolCallDelta
    ClaudeSDKExecutor --> FakeDelta
    ClaudeSDKExecutor --> FakeStreamChoice
    ClaudeSDKExecutor --> FakeStreamChunk
    ClaudeSDKExecutor --> FakeCompletions
    ClaudeSDKExecutor --> FakeChat
    ClaudeSDKExecutor --> FakeClient
    ClaudeSDKExecutor --> TestConvertTools
    ClaudeSDKExecutor --> TestConvertMessages
    ClaudeSDKExecutor --> TestDatabricksExecutorTextResponse
    ClaudeSDKExecutor --> TestDatabricksExecutorToolCalls
    ClaudeSDKExecutor --> TestDatabricksExecutorErrors
    ClaudeSDKExecutor --> TestDatabricksExecutorConfig
    ClaudeSDKExecutor --> TestDatabricksExecutorMultiTurn
    ClaudeSDKExecutor --> _StubSdkConfig
    _ClaudeTransport --> RetryPolicy
    _ClaudeTransport --> ClaudeGatewayShim
    _ClaudeTransport --> Executor
    _ClaudeTransport --> ExecutorConfig
    _ClaudeTransport --> ExecutorError
    _ClaudeTransport --> ExecutorEvent
    _ClaudeTransport --> ReasoningChunk
    _ClaudeTransport --> TextChunk
    _ClaudeTransport --> ToolCallComplete
    _ClaudeTransport --> ToolCallRequest
    _ClaudeTransport --> ToolCallStatus
    _ClaudeTransport --> TurnComplete
    _ClaudeTransport --> CompactionComplete
    PreparedClaudeCli --> RetryPolicy
    PreparedClaudeCli --> ClaudeGatewayShim
    PreparedClaudeCli --> Executor
    PreparedClaudeCli --> ExecutorConfig
    PreparedClaudeCli --> ExecutorError
    PreparedClaudeCli --> ExecutorEvent
    PreparedClaudeCli --> ReasoningChunk
    PreparedClaudeCli --> TextChunk
    PreparedClaudeCli --> ToolCallComplete
    PreparedClaudeCli --> ToolCallRequest
    PreparedClaudeCli --> ToolCallStatus
    PreparedClaudeCli --> TurnComplete
    PreparedClaudeCli --> CompactionComplete
    PreparedClaudeCli --> TestPromptExtraction
    PreparedClaudeCli --> TestConstructor
    PreparedClaudeCli --> TestBuildMcpTools
    PreparedClaudeCli --> TestResolveGatewayEnv
    PreparedClaudeCli --> TestEmptyPrompt
    PreparedClaudeCli --> TestSystemMessages
    PreparedClaudeCli --> TestSkillsFilterTranslation
    PreparedClaudeCli --> TestStreamEventStreaming
    PreparedClaudeCli --> TestToolCallPolicyGate
    _Process --> RetryPolicy
    _Process --> ClaudeGatewayShim
    _Process --> Executor
    _Process --> ExecutorConfig
    _Process --> ExecutorError
    _Process --> ExecutorEvent
    _Process --> ReasoningChunk
    _Process --> TextChunk
    _Process --> ToolCallComplete
    _Process --> ToolCallRequest
    _Process --> ToolCallStatus
    _Process --> TurnComplete
    _Process --> CompactionComplete
    _ResolvedSkills --> RetryPolicy
    _ResolvedSkills --> ClaudeGatewayShim
    _ResolvedSkills --> Executor
    _ResolvedSkills --> ExecutorConfig
    _ResolvedSkills --> ExecutorError
    _ResolvedSkills --> ExecutorEvent
    _ResolvedSkills --> ReasoningChunk
    _ResolvedSkills --> TextChunk
    _ResolvedSkills --> ToolCallComplete
    _ResolvedSkills --> ToolCallRequest
    _ResolvedSkills --> ToolCallStatus
    _ResolvedSkills --> TurnComplete
    _ResolvedSkills --> CompactionComplete
    _ResultMessageObj --> RetryPolicy
    _ResultMessageObj --> ClaudeGatewayShim
    _ResultMessageObj --> Executor
    _ResultMessageObj --> ExecutorConfig
    _ResultMessageObj --> ExecutorError
    _ResultMessageObj --> ExecutorEvent
    _ResultMessageObj --> ReasoningChunk
    _ResultMessageObj --> TextChunk
    _ResultMessageObj --> ToolCallComplete
    _ResultMessageObj --> ToolCallRequest
    _ResultMessageObj --> ToolCallStatus
    _ResultMessageObj --> TurnComplete
    _ResultMessageObj --> CompactionComplete
    _Stream --> RetryPolicy
    _Stream --> ClaudeGatewayShim
    _Stream --> Executor
    _Stream --> ExecutorConfig
    _Stream --> ExecutorError
    _Stream --> ExecutorEvent
    _Stream --> ReasoningChunk
    _Stream --> TextChunk
    _Stream --> ToolCallComplete
    _Stream --> ToolCallRequest
    _Stream --> ToolCallStatus
    _Stream --> TurnComplete
    _Stream --> CompactionComplete
    _StreamEventObj --> RetryPolicy
    _StreamEventObj --> ClaudeGatewayShim
    _StreamEventObj --> Executor
    _StreamEventObj --> ExecutorConfig
    _StreamEventObj --> ExecutorError
    _StreamEventObj --> ExecutorEvent
    _StreamEventObj --> ReasoningChunk
    _StreamEventObj --> TextChunk
    _StreamEventObj --> ToolCallComplete
    _StreamEventObj --> ToolCallRequest
    _StreamEventObj --> ToolCallStatus
    _StreamEventObj --> TurnComplete
    _StreamEventObj --> CompactionComplete
    _SystemMessageObj --> RetryPolicy
    _SystemMessageObj --> ClaudeGatewayShim
    _SystemMessageObj --> Executor
    _SystemMessageObj --> ExecutorConfig
    _SystemMessageObj --> ExecutorError
    _SystemMessageObj --> ExecutorEvent
    _SystemMessageObj --> ReasoningChunk
    _SystemMessageObj --> TextChunk
    _SystemMessageObj --> ToolCallComplete
    _SystemMessageObj --> ToolCallRequest
    _SystemMessageObj --> ToolCallStatus
    _SystemMessageObj --> TurnComplete
    _SystemMessageObj --> CompactionComplete
    _TaskGroup --> RetryPolicy
    _TaskGroup --> ClaudeGatewayShim
    _TaskGroup --> Executor
    _TaskGroup --> ExecutorConfig
    _TaskGroup --> ExecutorError
    _TaskGroup --> ExecutorEvent
    _TaskGroup --> ReasoningChunk
    _TaskGroup --> TextChunk
    _TaskGroup --> ToolCallComplete
    _TaskGroup --> ToolCallRequest
    _TaskGroup --> ToolCallStatus
    _TaskGroup --> TurnComplete
    _TaskGroup --> CompactionComplete
    _TaskHandle --> RetryPolicy
    _TaskHandle --> ClaudeGatewayShim
    _TaskHandle --> Executor
    _TaskHandle --> ExecutorConfig
    _TaskHandle --> ExecutorError
    _TaskHandle --> ExecutorEvent
    _TaskHandle --> ReasoningChunk
    _TaskHandle --> TextChunk
    _TaskHandle --> ToolCallComplete
    _TaskHandle --> ToolCallRequest
    _TaskHandle --> ToolCallStatus
    _TaskHandle --> TurnComplete
    _TaskHandle --> CompactionComplete
    _TextBlockObj --> RetryPolicy
    _TextBlockObj --> ClaudeGatewayShim
    _TextBlockObj --> Executor
    _TextBlockObj --> ExecutorConfig
    _TextBlockObj --> ExecutorError
    _TextBlockObj --> ExecutorEvent
    _TextBlockObj --> ReasoningChunk
    _TextBlockObj --> TextChunk
    _TextBlockObj --> ToolCallComplete
    _TextBlockObj --> ToolCallRequest
    _TextBlockObj --> ToolCallStatus
    _TextBlockObj --> TurnComplete
    _TextBlockObj --> CompactionComplete
    _ToolResultBlockObj --> RetryPolicy
    _ToolResultBlockObj --> ClaudeGatewayShim
    _ToolResultBlockObj --> Executor
    _ToolResultBlockObj --> ExecutorConfig
    _ToolResultBlockObj --> ExecutorError
    _ToolResultBlockObj --> ExecutorEvent
    _ToolResultBlockObj --> ReasoningChunk
    _ToolResultBlockObj --> TextChunk
    _ToolResultBlockObj --> ToolCallComplete
    _ToolResultBlockObj --> ToolCallRequest
    _ToolResultBlockObj --> ToolCallStatus
    _ToolResultBlockObj --> TurnComplete
    _ToolResultBlockObj --> CompactionComplete
    _ToolUseBlockObj --> RetryPolicy
    _ToolUseBlockObj --> ClaudeGatewayShim
    _ToolUseBlockObj --> Executor
    _ToolUseBlockObj --> ExecutorConfig
    _ToolUseBlockObj --> ExecutorError
    _ToolUseBlockObj --> ExecutorEvent
    _ToolUseBlockObj --> ReasoningChunk
    _ToolUseBlockObj --> TextChunk
    _ToolUseBlockObj --> ToolCallComplete
    _ToolUseBlockObj --> ToolCallRequest
    _ToolUseBlockObj --> ToolCallStatus
    _ToolUseBlockObj --> TurnComplete
    _ToolUseBlockObj --> CompactionComplete
    _UserMessageObj --> RetryPolicy
    _UserMessageObj --> ClaudeGatewayShim
    _UserMessageObj --> Executor
    _UserMessageObj --> ExecutorConfig
    _UserMessageObj --> ExecutorError
    _UserMessageObj --> ExecutorEvent
    _UserMessageObj --> ReasoningChunk
    _UserMessageObj --> TextChunk
    _UserMessageObj --> ToolCallComplete
    _UserMessageObj --> ToolCallRequest
    _UserMessageObj --> ToolCallStatus
    _UserMessageObj --> TurnComplete
    _UserMessageObj --> CompactionComplete
    _ResponsesNamespace --> PermanentLLMError
    _ResponsesNamespace --> RetryableLLMError
    _ResponsesNamespace --> RetryPolicy
    _AppSessionFactory --> RetryPolicy
    _AppSessionFactory --> Executor
    _AppSessionFactory --> ExecutorConfig
    _AppSessionFactory --> ExecutorError
    _AppSessionFactory --> ExecutorEvent
    _AppSessionFactory --> ReasoningChunk
    _AppSessionFactory --> TextChunk
    _AppSessionFactory --> ToolCallComplete
    _AppSessionFactory --> ToolCallRequest
    _AppSessionFactory --> ToolCallStatus
    _AppSessionFactory --> TurnComplete
    _CodexAppServerSession --> RetryPolicy
    _CodexAppServerSession --> Executor
    _CodexAppServerSession --> ExecutorConfig
    _CodexAppServerSession --> ExecutorError
    _CodexAppServerSession --> ExecutorEvent
    _CodexAppServerSession --> ReasoningChunk
    _CodexAppServerSession --> TextChunk
    _CodexAppServerSession --> ToolCallComplete
    _CodexAppServerSession --> ToolCallRequest
    _CodexAppServerSession --> ToolCallStatus
    _CodexAppServerSession --> TurnComplete
    CodexExecutor --> RetryPolicy
    CodexExecutor --> Executor
    CodexExecutor --> ExecutorConfig
    CodexExecutor --> ExecutorError
    CodexExecutor --> ExecutorEvent
    CodexExecutor --> ReasoningChunk
    CodexExecutor --> TextChunk
    CodexExecutor --> ToolCallComplete
    CodexExecutor --> ToolCallRequest
    CodexExecutor --> ToolCallStatus
    CodexExecutor --> TurnComplete
    CodexExecutor --> _FakeAppSession
    CodexExecutor --> _FakePipe
    CodexExecutor --> _OverflowingPipe
    CodexExecutor --> _ChunkedPipe
    CodexExecutor --> _FakeProcess
    CodexExecutor --> TestCodexExecutor
    CodexExecutor --> _FakeVersionProcess
    CodexExecutor --> FakeFunctionDelta
    CodexExecutor --> FakeToolCallDelta
    CodexExecutor --> FakeDelta
    CodexExecutor --> FakeStreamChoice
    CodexExecutor --> FakeStreamChunk
    CodexExecutor --> FakeCompletions
    CodexExecutor --> FakeChat
    CodexExecutor --> FakeClient
    CodexExecutor --> TestConvertTools
    CodexExecutor --> TestConvertMessages
    CodexExecutor --> TestDatabricksExecutorTextResponse
    CodexExecutor --> TestDatabricksExecutorToolCalls
    CodexExecutor --> TestDatabricksExecutorErrors
    CodexExecutor --> TestDatabricksExecutorConfig
    CodexExecutor --> TestDatabricksExecutorMultiTurn
    CodexExecutor --> _StubSdkConfig
    _CodexSessionState --> RetryPolicy
    _CodexSessionState --> Executor
    _CodexSessionState --> ExecutorConfig
    _CodexSessionState --> ExecutorError
    _CodexSessionState --> ExecutorEvent
    _CodexSessionState --> ReasoningChunk
    _CodexSessionState --> TextChunk
    _CodexSessionState --> ToolCallComplete
    _CodexSessionState --> ToolCallRequest
    _CodexSessionState --> ToolCallStatus
    _CodexSessionState --> TurnComplete
    _PendingToolResult --> RetryPolicy
    _PendingToolResult --> Executor
    _PendingToolResult --> ExecutorConfig
    _PendingToolResult --> ExecutorError
    _PendingToolResult --> ExecutorEvent
    _PendingToolResult --> ReasoningChunk
    _PendingToolResult --> TextChunk
    _PendingToolResult --> ToolCallComplete
    _PendingToolResult --> ToolCallRequest
    _PendingToolResult --> ToolCallStatus
    _PendingToolResult --> TurnComplete
    _Process --> RetryPolicy
    _Process --> Executor
    _Process --> ExecutorConfig
    _Process --> ExecutorError
    _Process --> ExecutorEvent
    _Process --> ReasoningChunk
    _Process --> TextChunk
    _Process --> ToolCallComplete
    _Process --> ToolCallRequest
    _Process --> ToolCallStatus
    _Process --> TurnComplete
    CodexNativeExecutor --> Executor
    CodexNativeExecutor --> ExecutorConfig
    CodexNativeExecutor --> ExecutorError
    CodexNativeExecutor --> ExecutorEvent
    CodexNativeExecutor --> TurnComplete
    CodexNativeExecutor --> _FakeCodexNativeClient
    CopilotExecutor --> CompactionComplete
    CopilotExecutor --> Executor
    CopilotExecutor --> ExecutorConfig
    CopilotExecutor --> ExecutorError
    CopilotExecutor --> ExecutorEvent
    CopilotExecutor --> ReasoningChunk
    CopilotExecutor --> TextChunk
    CopilotExecutor --> ToolCallComplete
    CopilotExecutor --> ToolCallRequest
    CopilotExecutor --> ToolCallStatus
    CopilotExecutor --> TurnComplete
    CopilotExecutor --> _FakeEvent
    CopilotExecutor --> _FakeSession
    CopilotExecutor --> _Unsub
    CopilotExecutor --> _PermissionHandler
    CopilotExecutor --> _ApproveOnce
    CopilotExecutor --> _Reject
    _CopilotSessionState --> CompactionComplete
    _CopilotSessionState --> Executor
    _CopilotSessionState --> ExecutorConfig
    _CopilotSessionState --> ExecutorError
    _CopilotSessionState --> ExecutorEvent
    _CopilotSessionState --> ReasoningChunk
    _CopilotSessionState --> TextChunk
    _CopilotSessionState --> ToolCallComplete
    _CopilotSessionState --> ToolCallRequest
    _CopilotSessionState --> ToolCallStatus
    _CopilotSessionState --> TurnComplete
    CursorExecutor --> Executor
    CursorExecutor --> ExecutorConfig
    CursorExecutor --> ExecutorError
    CursorExecutor --> ExecutorEvent
    CursorExecutor --> ReasoningChunk
    CursorExecutor --> TextChunk
    CursorExecutor --> ToolCallComplete
    CursorExecutor --> ToolCallRequest
    CursorExecutor --> ToolCallStatus
    CursorExecutor --> TurnCancelled
    CursorExecutor --> TurnComplete
    _CursorSessionState --> Executor
    _CursorSessionState --> ExecutorConfig
    _CursorSessionState --> ExecutorError
    _CursorSessionState --> ExecutorEvent
    _CursorSessionState --> ReasoningChunk
    _CursorSessionState --> TextChunk
    _CursorSessionState --> ToolCallComplete
    _CursorSessionState --> ToolCallRequest
    _CursorSessionState --> ToolCallStatus
    _CursorSessionState --> TurnCancelled
    _CursorSessionState --> TurnComplete
    CursorNativeExecutor --> Executor
    CursorNativeExecutor --> ExecutorConfig
    CursorNativeExecutor --> ExecutorError
    CursorNativeExecutor --> ExecutorEvent
    CursorNativeExecutor --> TurnComplete
    CursorNativeExecutor --> TestContentExtraction
    CursorNativeExecutor --> TestExecutorCapabilities
    CursorNativeExecutor --> TestForkPreamble
    CursorNativeExecutor --> TestRunTurnPreambleInjection
    CursorNativeExecutor --> TestRegistration
    DatabricksAuthError --> Executor
    DatabricksAuthError --> ExecutorConfig
    DatabricksAuthError --> ExecutorError
    DatabricksAuthError --> ExecutorEvent
    DatabricksAuthError --> TextChunk
    DatabricksAuthError --> ToolCallRequest
    DatabricksAuthError --> TurnComplete
    DatabricksAuthError --> _SDKSession
    DatabricksAuthError --> _AgentsSDK
    DatabricksAuthError --> _RunResult
    DatabricksAuthError --> _RunState
    DatabricksAuthError --> _StreamEvent
    DatabricksAuthError --> _RawResponseEvent
    DatabricksAuthError --> _RawResponseData
    DatabricksAuthError --> _RunItemEvent
    DatabricksAuthError --> _RunItem
    DatabricksAuthError --> _ToolCallRawItem
    DatabricksAuthError --> _ToolCallOutputRawItem
    DatabricksAuthError --> _CallModelData
    DatabricksAuthError --> _ModelInputData
    DatabricksAuthError --> _ShellCommandBearerAuth
    DatabricksAuthError --> _AgentsSessionState
    DatabricksAuthError --> _SanitizingSession
    DatabricksAuthError --> RawToolItemParts
    DatabricksAuthError --> _ReasoningBlockFilterStream
    DatabricksAuthError --> _ReasoningBlockFilterCompletions
    DatabricksAuthError --> _ReasoningBlockFilterChat
    DatabricksAuthError --> OpenAIAgentsSDKExecutor
    DatabricksAuthError --> FakeFunctionDelta
    DatabricksAuthError --> FakeToolCallDelta
    DatabricksAuthError --> FakeDelta
    DatabricksAuthError --> FakeStreamChoice
    DatabricksAuthError --> FakeStreamChunk
    DatabricksAuthError --> FakeCompletions
    DatabricksAuthError --> FakeChat
    DatabricksAuthError --> FakeClient
    DatabricksAuthError --> TestConvertTools
    DatabricksAuthError --> TestConvertMessages
    DatabricksAuthError --> TestDatabricksExecutorTextResponse
    DatabricksAuthError --> TestDatabricksExecutorToolCalls
    DatabricksAuthError --> TestDatabricksExecutorErrors
    DatabricksAuthError --> TestDatabricksExecutorConfig
    DatabricksAuthError --> TestDatabricksExecutorMultiTurn
    DatabricksAuthError --> _StubSdkConfig
    DatabricksAuthError --> _FakeToolCallRawItem
    DatabricksAuthError --> _FakeToolOutputRawItem
    DatabricksAuthError --> _FakeToolCallItem
    DatabricksAuthError --> _FakeToolOutputItem
    DatabricksAuthError --> _FakeRawTextDelta
    DatabricksAuthError --> _FakeRawEvent
    DatabricksAuthError --> _FakeRunItemEvent
    DatabricksAuthError --> _FakeModelSettings
    DatabricksAuthError --> _FakePromptTokensDetails
    DatabricksAuthError --> _FakeUsage
    DatabricksAuthError --> _FakeRawResponse
    DatabricksAuthError --> _FakeResult
    DatabricksAuthError --> _FakeRunner
    DatabricksAuthError --> _FakeFunctionTool
    DatabricksAuthError --> _FakeSessionSettings
    DatabricksAuthError --> _FakeSQLiteSession
    DatabricksAuthError --> _FakeOpenAIProvider
    DatabricksAuthError --> _FakeRunConfig
    DatabricksAuthError --> _FakeAgent
    DatabricksAuthError --> _FakeItemHelpers
    DatabricksAuthError --> _FakeMaxTurnsExceeded
    DatabricksAuthError --> TestOpenAIAgentsSDKExecutor
    DatabricksAuthError --> _FakeReasoningItem
    DatabricksAuthError --> _FakeMessageOutputItem
    DatabricksAuthError --> _FakeCompactionItem
    DatabricksAuthError --> _TrackingTerminalRegistry
    DatabricksAuthError --> _TrackingMcpManager
    DatabricksAuthError --> _TrackingAsyncClient
    DatabricksAuthError --> _TrackingSyncClient
    _DatabricksBearerAuth --> Executor
    _DatabricksBearerAuth --> ExecutorConfig
    _DatabricksBearerAuth --> ExecutorError
    _DatabricksBearerAuth --> ExecutorEvent
    _DatabricksBearerAuth --> TextChunk
    _DatabricksBearerAuth --> ToolCallRequest
    _DatabricksBearerAuth --> TurnComplete
    DatabricksCredentials --> Executor
    DatabricksCredentials --> ExecutorConfig
    DatabricksCredentials --> ExecutorError
    DatabricksCredentials --> ExecutorEvent
    DatabricksCredentials --> TextChunk
    DatabricksCredentials --> ToolCallRequest
    DatabricksCredentials --> TurnComplete
    DatabricksCredentials --> _CapturedRequest
    DatabricksCredentials --> _RecordingUpstream
    DatabricksCredentials --> TestPromptExtraction
    DatabricksCredentials --> TestConstructor
    DatabricksCredentials --> TestBuildMcpTools
    DatabricksCredentials --> TestResolveGatewayEnv
    DatabricksCredentials --> TestEmptyPrompt
    DatabricksCredentials --> TestSystemMessages
    DatabricksCredentials --> TestSkillsFilterTranslation
    DatabricksCredentials --> TestStreamEventStreaming
    DatabricksCredentials --> TestToolCallPolicyGate
    DatabricksCredentials --> _FakeAppSession
    DatabricksCredentials --> _FakePipe
    DatabricksCredentials --> _OverflowingPipe
    DatabricksCredentials --> _ChunkedPipe
    DatabricksCredentials --> _FakeProcess
    DatabricksCredentials --> TestCodexExecutor
    DatabricksCredentials --> _FakeVersionProcess
    DatabricksCredentials --> FakeTextPart
    DatabricksCredentials --> FakeMessageItem
    DatabricksCredentials --> FakeFunctionCallItem
    DatabricksCredentials --> FakeIncomplete
    DatabricksCredentials --> FakeResponse
    DatabricksCredentials --> FakeResponsesAPI
    DatabricksCredentials --> FakeClient
    DatabricksCredentials --> TestConvertTools
    DatabricksCredentials --> TestConvertMessages
    DatabricksCredentials --> TestNormalizeResponseOutput
    DatabricksCredentials --> TestOpenResponsesExecutor
    DatabricksCredentials --> TestOpenAIClientConfig
    DatabricksCredentials --> TestDatabricksBaseUrl
    DatabricksCredentials --> _FakeStreamReader
    DatabricksCredentials --> _FakeStreamWriter
    DatabricksCredentials --> _FakeProcess
    DatabricksCredentials --> TestSanitizeSchema
    DatabricksCredentials --> TestPiProviderForModel
    DatabricksCredentials --> TestBuildModelsJson
    DatabricksCredentials --> TestGenerateExtensionJs
    DatabricksCredentials --> TestToolServer
    DatabricksCredentials --> TestPiRpcSession
    DatabricksCredentials --> TestPiExecutorConstructor
    DatabricksCredentials --> TestGateNativeTool
    DatabricksCredentials --> TestResolveModel
    DatabricksCredentials --> TestBuildEnvAndDir
    DatabricksCredentials --> TestRunTurn
    DatabricksCredentials --> TestSessionManagement
    DatabricksCredentials --> TestClose
    DatabricksCredentials --> TestBlockedToolDetection
    DatabricksExecutor --> Executor
    DatabricksExecutor --> ExecutorConfig
    DatabricksExecutor --> ExecutorError
    DatabricksExecutor --> ExecutorEvent
    DatabricksExecutor --> TextChunk
    DatabricksExecutor --> ToolCallRequest
    DatabricksExecutor --> TurnComplete
    DatabricksExecutor --> FakeFunctionDelta
    DatabricksExecutor --> FakeToolCallDelta
    DatabricksExecutor --> FakeDelta
    DatabricksExecutor --> FakeStreamChoice
    DatabricksExecutor --> FakeStreamChunk
    DatabricksExecutor --> FakeCompletions
    DatabricksExecutor --> FakeChat
    DatabricksExecutor --> FakeClient
    DatabricksExecutor --> TestConvertTools
    DatabricksExecutor --> TestConvertMessages
    DatabricksExecutor --> TestDatabricksExecutorTextResponse
    DatabricksExecutor --> TestDatabricksExecutorToolCalls
    DatabricksExecutor --> TestDatabricksExecutorErrors
    DatabricksExecutor --> TestDatabricksExecutorConfig
    DatabricksExecutor --> TestDatabricksExecutorMultiTurn
    DatabricksExecutor --> _StubSdkConfig
    _DatabricksSessionState --> Executor
    _DatabricksSessionState --> ExecutorConfig
    _DatabricksSessionState --> ExecutorError
    _DatabricksSessionState --> ExecutorEvent
    _DatabricksSessionState --> TextChunk
    _DatabricksSessionState --> ToolCallRequest
    _DatabricksSessionState --> TurnComplete
    LLMErrorDetail --> _OverflowTokens
    LLMErrorDetail --> _ParsedSSEEvent
    LLMErrorDetail --> _StubExecutor
    LLMErrorDetail --> _RecordingTurnContext
    LLMErrorDetail --> _AcceptingInjectionExecutor
    LLMErrorDetail --> _OneInjectionCtx
    LLMErrorDetail --> _InterruptTrackingExecutor
    PermanentLLMError --> AntigravityNativeExecutor
    PermanentLLMError --> _ResponsesNamespace
    PermanentLLMError --> _OverflowTokens
    RetryableLLMError --> _ResponsesNamespace
    RetryableLLMError --> _OverflowTokens
    RetryableLLMError --> _ParsedSSEEvent
    RetryableLLMError --> _StubExecutor
    RetryableLLMError --> _RecordingTurnContext
    RetryableLLMError --> _AcceptingInjectionExecutor
    RetryableLLMError --> _OneInjectionCtx
    RetryableLLMError --> _InterruptTrackingExecutor
    ExecutorAdapter --> CompactionComplete
    ExecutorAdapter --> Executor
    ExecutorAdapter --> ExecutorConfig
    ExecutorAdapter --> ExecutorError
    ExecutorAdapter --> ExecutorEvent
    ExecutorAdapter --> ReasoningChunk
    ExecutorAdapter --> TextChunk
    ExecutorAdapter --> ToolCallComplete
    ExecutorAdapter --> ToolCallRequest
    ExecutorAdapter --> TurnCancelled
    ExecutorAdapter --> TurnComplete
    ExecutorAdapter --> HarnessApp
    ExecutorAdapter --> PolicyVerdictPayload
    ExecutorAdapter --> TurnContext
    ExecutorAdapter --> CreateResponseRequest
    ExecutorAdapter --> InjectionConsumedEvent
    ExecutorAdapter --> _ParsedSSEEvent
    ExecutorAdapter --> _StubExecutor
    ExecutorAdapter --> _RecordingTurnContext
    ExecutorAdapter --> _AcceptingInjectionExecutor
    ExecutorAdapter --> _OneInjectionCtx
    ExecutorAdapter --> _InterruptTrackingExecutor
    ExecutorAdapter --> _CapturingExecutor
    ExecutorEvent <|-- CompactionComplete
    CompactionComplete --> _Process
    CompactionComplete --> _CancelScope
    CompactionComplete --> _TaskGroup
    CompactionComplete --> _TaskHandle
    CompactionComplete --> _ClaudeQuery
    CompactionComplete --> _Stream
    CompactionComplete --> _ClaudeTransport
    CompactionComplete --> _ClaudeClient
    CompactionComplete --> _StreamEventObj
    CompactionComplete --> _AssistantMessageObj
    CompactionComplete --> _UserMessageObj
    CompactionComplete --> _ResultMessageObj
    CompactionComplete --> _SystemMessageObj
    CompactionComplete --> _TextBlockObj
    CompactionComplete --> _ToolUseBlockObj
    CompactionComplete --> _ToolResultBlockObj
    CompactionComplete --> _ClaudeSDK
    CompactionComplete --> _ClaudeClientState
    CompactionComplete --> PreparedClaudeCli
    CompactionComplete --> _ResolvedSkills
    CompactionComplete --> ClaudeSDKExecutor
    CompactionComplete --> _CopilotSessionState
    CompactionComplete --> CopilotExecutor
    CompactionComplete --> _SDKSession
    CompactionComplete --> _AgentsSDK
    CompactionComplete --> _RunResult
    CompactionComplete --> _RunState
    CompactionComplete --> _StreamEvent
    CompactionComplete --> _RawResponseEvent
    CompactionComplete --> _RawResponseData
    CompactionComplete --> _RunItemEvent
    CompactionComplete --> _RunItem
    CompactionComplete --> _ToolCallRawItem
    CompactionComplete --> _ToolCallOutputRawItem
    CompactionComplete --> _CallModelData
    CompactionComplete --> _ModelInputData
    CompactionComplete --> _ShellCommandBearerAuth
    CompactionComplete --> _AgentsSessionState
    CompactionComplete --> _SanitizingSession
    CompactionComplete --> RawToolItemParts
    CompactionComplete --> _ReasoningBlockFilterStream
    CompactionComplete --> _ReasoningBlockFilterCompletions
    CompactionComplete --> _ReasoningBlockFilterChat
    CompactionComplete --> OpenAIAgentsSDKExecutor
    CompactionComplete --> ExecutorAdapter
    CompactionComplete --> TestPromptExtraction
    CompactionComplete --> TestConstructor
    CompactionComplete --> TestBuildMcpTools
    CompactionComplete --> TestResolveGatewayEnv
    CompactionComplete --> TestEmptyPrompt
    CompactionComplete --> TestSystemMessages
    CompactionComplete --> TestSkillsFilterTranslation
    CompactionComplete --> TestStreamEventStreaming
    CompactionComplete --> TestToolCallPolicyGate
    CompactionComplete --> _FakeEvent
    CompactionComplete --> _FakeSession
    CompactionComplete --> _Unsub
    CompactionComplete --> _PermissionHandler
    CompactionComplete --> _ApproveOnce
    CompactionComplete --> _Reject
    CompactionComplete --> _FakeToolCallRawItem
    CompactionComplete --> _FakeToolOutputRawItem
    CompactionComplete --> _FakeToolCallItem
    CompactionComplete --> _FakeToolOutputItem
    CompactionComplete --> _FakeRawTextDelta
    CompactionComplete --> _FakeRawEvent
    CompactionComplete --> _FakeRunItemEvent
    CompactionComplete --> _FakeModelSettings
    CompactionComplete --> _FakePromptTokensDetails
    CompactionComplete --> _FakeUsage
    CompactionComplete --> _FakeRawResponse
    CompactionComplete --> _FakeResult
    CompactionComplete --> _FakeRunner
    CompactionComplete --> _FakeFunctionTool
    CompactionComplete --> _FakeSessionSettings
    CompactionComplete --> _FakeSQLiteSession
    CompactionComplete --> _FakeOpenAIProvider
    CompactionComplete --> _FakeRunConfig
    CompactionComplete --> _FakeAgent
    CompactionComplete --> _FakeItemHelpers
    CompactionComplete --> _FakeMaxTurnsExceeded
    CompactionComplete --> TestOpenAIAgentsSDKExecutor
    CompactionComplete --> _FakeReasoningItem
    CompactionComplete --> _FakeMessageOutputItem
    CompactionComplete --> _FakeCompactionItem
    MockExecutor <|-- Executor
    Executor --> NativeServerHarness
    Executor --> _NeverRaisedError
    Executor --> _PendingTool
    Executor --> _AntigravitySessionState
    Executor --> AntigravityExecutor
    Executor --> AntigravityNativeExecutor
    Executor --> ClaudeNativeExecutor
    Executor --> _Process
    Executor --> _CancelScope
    Executor --> _TaskGroup
    Executor --> _TaskHandle
    Executor --> _ClaudeQuery
    Executor --> _Stream
    Executor --> _ClaudeTransport
    Executor --> _ClaudeClient
    Executor --> _StreamEventObj
    Executor --> _AssistantMessageObj
    Executor --> _UserMessageObj
    Executor --> _ResultMessageObj
    Executor --> _SystemMessageObj
    Executor --> _TextBlockObj
    Executor --> _ToolUseBlockObj
    Executor --> _ToolResultBlockObj
    Executor --> _ClaudeSDK
    Executor --> _ClaudeClientState
    Executor --> PreparedClaudeCli
    Executor --> _ResolvedSkills
    Executor --> ClaudeSDKExecutor
    Executor --> _Process
    Executor --> _PendingToolResult
    Executor --> _CodexAppServerSession
    Executor --> _CodexSessionState
    Executor --> _AppSessionFactory
    Executor --> CodexExecutor
    Executor --> CodexNativeExecutor
    Executor --> _CopilotSessionState
    Executor --> CopilotExecutor
    Executor --> _CursorSessionState
    Executor --> CursorExecutor
    Executor --> CursorNativeExecutor
    Executor --> _DatabricksSessionState
    Executor --> DatabricksCredentials
    Executor --> DatabricksAuthError
    Executor --> _DatabricksBearerAuth
    Executor --> DatabricksExecutor
    Executor --> _AcpRequestError
    Executor --> GooseExecutor
    Executor --> GooseNativeExecutor
    Executor --> HermesExecutor
    Executor --> HermesNativeExecutor
    Executor --> KimiExecutor
    Executor --> KimiNativeExecutor
    Executor --> KiroNativeExecutor
    Executor --> _SDKSession
    Executor --> _AgentsSDK
    Executor --> _RunResult
    Executor --> _RunState
    Executor --> _StreamEvent
    Executor --> _RawResponseEvent
    Executor --> _RawResponseData
    Executor --> _RunItemEvent
    Executor --> _RunItem
    Executor --> _ToolCallRawItem
    Executor --> _ToolCallOutputRawItem
    Executor --> _CallModelData
    Executor --> _ModelInputData
    Executor --> _ShellCommandBearerAuth
    Executor --> _AgentsSessionState
    Executor --> _SanitizingSession
    Executor --> RawToolItemParts
    Executor --> _ReasoningBlockFilterStream
    Executor --> _ReasoningBlockFilterCompletions
    Executor --> _ReasoningBlockFilterChat
    Executor --> OpenAIAgentsSDKExecutor
    Executor --> OpenResponsesExecutor
    Executor --> _ResponsesSessionState
    Executor --> _ToolServer
    Executor --> _PiRpcSession
    Executor --> _PiSessionState
    Executor --> BlockedCheck
    Executor --> PiSubprocessConfig
    Executor --> SandboxedPiCli
    Executor --> PiExecutor
    Executor --> PiNativeExecutor
    Executor --> PolicyAction
    Executor --> PolicyResult
    Executor --> PolicyRuntimeContext
    Executor --> Policy
    Executor --> _AcpRequestError
    Executor --> QwenExecutor
    Executor --> QwenNativeExecutor
    Executor --> ExecutorAdapter
    Executor --> _ParsedSSEEvent
    Executor --> _StubExecutor
    Executor --> _RecordingTurnContext
    Executor --> _AcceptingInjectionExecutor
    Executor --> _OneInjectionCtx
    Executor --> _InterruptTrackingExecutor
    Executor --> _CapturingExecutor
    ExecutorConfig --> NativeServerHarness
    ExecutorConfig --> _NeverRaisedError
    ExecutorConfig --> _PendingTool
    ExecutorConfig --> _AntigravitySessionState
    ExecutorConfig --> AntigravityExecutor
    ExecutorConfig --> AntigravityNativeExecutor
    ExecutorConfig --> ClaudeNativeExecutor
    ExecutorConfig --> _Process
    ExecutorConfig --> _CancelScope
    ExecutorConfig --> _TaskGroup
    ExecutorConfig --> _TaskHandle
    ExecutorConfig --> _ClaudeQuery
    ExecutorConfig --> _Stream
    ExecutorConfig --> _ClaudeTransport
    ExecutorConfig --> _ClaudeClient
    ExecutorConfig --> _StreamEventObj
    ExecutorConfig --> _AssistantMessageObj
    ExecutorConfig --> _UserMessageObj
    ExecutorConfig --> _ResultMessageObj
    ExecutorConfig --> _SystemMessageObj
    ExecutorConfig --> _TextBlockObj
    ExecutorConfig --> _ToolUseBlockObj
    ExecutorConfig --> _ToolResultBlockObj
    ExecutorConfig --> _ClaudeSDK
    ExecutorConfig --> _ClaudeClientState
    ExecutorConfig --> PreparedClaudeCli
    ExecutorConfig --> _ResolvedSkills
    ExecutorConfig --> ClaudeSDKExecutor
    ExecutorConfig --> _Process
    ExecutorConfig --> _PendingToolResult
    ExecutorConfig --> _CodexAppServerSession
    ExecutorConfig --> _CodexSessionState
    ExecutorConfig --> _AppSessionFactory
    ExecutorConfig --> CodexExecutor
    ExecutorConfig --> CodexNativeExecutor
    ExecutorConfig --> _CopilotSessionState
    ExecutorConfig --> CopilotExecutor
    ExecutorConfig --> _CursorSessionState
    ExecutorConfig --> CursorExecutor
    ExecutorConfig --> CursorNativeExecutor
    ExecutorConfig --> _DatabricksSessionState
    ExecutorConfig --> DatabricksCredentials
    ExecutorConfig --> DatabricksAuthError
    ExecutorConfig --> _DatabricksBearerAuth
    ExecutorConfig --> DatabricksExecutor
    ExecutorConfig --> _AcpRequestError
    ExecutorConfig --> GooseExecutor
    ExecutorConfig --> GooseNativeExecutor
    ExecutorConfig --> HermesExecutor
    ExecutorConfig --> HermesNativeExecutor
    ExecutorConfig --> KimiExecutor
    ExecutorConfig --> KimiNativeExecutor
    ExecutorConfig --> KiroNativeExecutor
    ExecutorConfig --> _SDKSession
    ExecutorConfig --> _AgentsSDK
    ExecutorConfig --> _RunResult
    ExecutorConfig --> _RunState
    ExecutorConfig --> _StreamEvent
    ExecutorConfig --> _RawResponseEvent
    ExecutorConfig --> _RawResponseData
    ExecutorConfig --> _RunItemEvent
    ExecutorConfig --> _RunItem
    ExecutorConfig --> _ToolCallRawItem
    ExecutorConfig --> _ToolCallOutputRawItem
    ExecutorConfig --> _CallModelData
    ExecutorConfig --> _ModelInputData
    ExecutorConfig --> _ShellCommandBearerAuth
    ExecutorConfig --> _AgentsSessionState
    ExecutorConfig --> _SanitizingSession
    ExecutorConfig --> RawToolItemParts
    ExecutorConfig --> _ReasoningBlockFilterStream
    ExecutorConfig --> _ReasoningBlockFilterCompletions
    ExecutorConfig --> _ReasoningBlockFilterChat
    ExecutorConfig --> OpenAIAgentsSDKExecutor
    ExecutorConfig --> OpenResponsesExecutor
    ExecutorConfig --> _ResponsesSessionState
    ExecutorConfig --> _ToolServer
    ExecutorConfig --> _PiRpcSession
    ExecutorConfig --> _PiSessionState
    ExecutorConfig --> BlockedCheck
    ExecutorConfig --> PiSubprocessConfig
    ExecutorConfig --> SandboxedPiCli
    ExecutorConfig --> PiExecutor
    ExecutorConfig --> PiNativeExecutor
    ExecutorConfig --> PolicyAction
    ExecutorConfig --> PolicyResult
    ExecutorConfig --> PolicyRuntimeContext
    ExecutorConfig --> Policy
    ExecutorConfig --> _AcpRequestError
    ExecutorConfig --> QwenExecutor
    ExecutorConfig --> QwenNativeExecutor
    ExecutorConfig --> ExecutorAdapter
    ExecutorConfig --> _FakeTransport
    ExecutorConfig --> _StepType
    ExecutorConfig --> _StepStatus
    ExecutorConfig --> _StepSource
    ExecutorConfig --> _StepTarget
    ExecutorConfig --> _AntigravityCancelledError
    ExecutorConfig --> _FakeToolCall
    ExecutorConfig --> _FakeToolResult
    ExecutorConfig --> _FakeUsage
    ExecutorConfig --> _FakeStep
    ExecutorConfig --> _YieldStep
    ExecutorConfig --> _FireToolResult
    ExecutorConfig --> _RaiseCancelled
    ExecutorConfig --> _RaiseGeneric
    ExecutorConfig --> _FakeConversation
    ExecutorConfig --> _FakeAgent
    ExecutorConfig --> _FakeLocalAgentConfig
    ExecutorConfig --> _FakePostToolCallHook
    ExecutorConfig --> _BlockingConversation
    ExecutorConfig --> _RebuildConversation
    ExecutorConfig --> _FakeCodexNativeClient
    ExecutorConfig --> _FakeEvent
    ExecutorConfig --> _FakeSession
    ExecutorConfig --> _Unsub
    ExecutorConfig --> _PermissionHandler
    ExecutorConfig --> _ApproveOnce
    ExecutorConfig --> _Reject
    ExecutorConfig --> FakeFunctionDelta
    ExecutorConfig --> FakeToolCallDelta
    ExecutorConfig --> FakeDelta
    ExecutorConfig --> FakeStreamChoice
    ExecutorConfig --> FakeStreamChunk
    ExecutorConfig --> FakeCompletions
    ExecutorConfig --> FakeChat
    ExecutorConfig --> FakeClient
    ExecutorConfig --> TestConvertTools
    ExecutorConfig --> TestConvertMessages
    ExecutorConfig --> TestDatabricksExecutorTextResponse
    ExecutorConfig --> TestDatabricksExecutorToolCalls
    ExecutorConfig --> TestDatabricksExecutorErrors
    ExecutorConfig --> TestDatabricksExecutorConfig
    ExecutorConfig --> TestDatabricksExecutorMultiTurn
    ExecutorConfig --> _StubSdkConfig
    ExecutorConfig --> TestUtils
    ExecutorConfig --> TestPopulateHermesHome
    ExecutorConfig --> _FakeToolCallRawItem
    ExecutorConfig --> _FakeToolOutputRawItem
    ExecutorConfig --> _FakeToolCallItem
    ExecutorConfig --> _FakeToolOutputItem
    ExecutorConfig --> _FakeRawTextDelta
    ExecutorConfig --> _FakeRawEvent
    ExecutorConfig --> _FakeRunItemEvent
    ExecutorConfig --> _FakeModelSettings
    ExecutorConfig --> _FakePromptTokensDetails
    ExecutorConfig --> _FakeUsage
    ExecutorConfig --> _FakeRawResponse
    ExecutorConfig --> _FakeResult
    ExecutorConfig --> _FakeRunner
    ExecutorConfig --> _FakeFunctionTool
    ExecutorConfig --> _FakeSessionSettings
    ExecutorConfig --> _FakeSQLiteSession
    ExecutorConfig --> _FakeOpenAIProvider
    ExecutorConfig --> _FakeRunConfig
    ExecutorConfig --> _FakeAgent
    ExecutorConfig --> _FakeItemHelpers
    ExecutorConfig --> _FakeMaxTurnsExceeded
    ExecutorConfig --> TestOpenAIAgentsSDKExecutor
    ExecutorConfig --> _FakeReasoningItem
    ExecutorConfig --> _FakeMessageOutputItem
    ExecutorConfig --> _FakeCompactionItem
    ExecutorConfig --> FakeTextPart
    ExecutorConfig --> FakeMessageItem
    ExecutorConfig --> FakeFunctionCallItem
    ExecutorConfig --> FakeIncomplete
    ExecutorConfig --> FakeResponse
    ExecutorConfig --> FakeResponsesAPI
    ExecutorConfig --> FakeClient
    ExecutorConfig --> TestConvertTools
    ExecutorConfig --> TestConvertMessages
    ExecutorConfig --> TestNormalizeResponseOutput
    ExecutorConfig --> TestOpenResponsesExecutor
    ExecutorConfig --> TestOpenAIClientConfig
    ExecutorConfig --> TestDatabricksBaseUrl
    ExecutorConfig --> _FakeStreamReader
    ExecutorConfig --> _FakeStreamWriter
    ExecutorConfig --> _FakeProcess
    ExecutorConfig --> TestSanitizeSchema
    ExecutorConfig --> TestPiProviderForModel
    ExecutorConfig --> TestBuildModelsJson
    ExecutorConfig --> TestGenerateExtensionJs
    ExecutorConfig --> TestToolServer
    ExecutorConfig --> TestPiRpcSession
    ExecutorConfig --> TestPiExecutorConstructor
    ExecutorConfig --> TestGateNativeTool
    ExecutorConfig --> TestResolveModel
    ExecutorConfig --> TestBuildEnvAndDir
    ExecutorConfig --> TestRunTurn
    ExecutorConfig --> TestSessionManagement
    ExecutorConfig --> TestClose
    ExecutorConfig --> TestBlockedToolDetection
    ExecutorConfig --> _ParsedSSEEvent
    ExecutorConfig --> _StubExecutor
    ExecutorConfig --> _RecordingTurnContext
    ExecutorConfig --> _AcceptingInjectionExecutor
    ExecutorConfig --> _OneInjectionCtx
    ExecutorConfig --> _InterruptTrackingExecutor
    ExecutorConfig --> _CapturingExecutor
    ExecutorEvent <|-- ExecutorError
    ExecutorError --> NativeServerHarness
    ExecutorError --> _NeverRaisedError
    ExecutorError --> _PendingTool
    ExecutorError --> _AntigravitySessionState
    ExecutorError --> AntigravityExecutor
    ExecutorError --> AntigravityNativeExecutor
    ExecutorError --> ClaudeNativeExecutor
    ExecutorError --> _Process
    ExecutorError --> _CancelScope
    ExecutorError --> _TaskGroup
    ExecutorError --> _TaskHandle
    ExecutorError --> _ClaudeQuery
    ExecutorError --> _Stream
    ExecutorError --> _ClaudeTransport
    ExecutorError --> _ClaudeClient
    ExecutorError --> _StreamEventObj
    ExecutorError --> _AssistantMessageObj
    ExecutorError --> _UserMessageObj
    ExecutorError --> _ResultMessageObj
    ExecutorError --> _SystemMessageObj
    ExecutorError --> _TextBlockObj
    ExecutorError --> _ToolUseBlockObj
    ExecutorError --> _ToolResultBlockObj
    ExecutorError --> _ClaudeSDK
    ExecutorError --> _ClaudeClientState
    ExecutorError --> PreparedClaudeCli
    ExecutorError --> _ResolvedSkills
    ExecutorError --> ClaudeSDKExecutor
    ExecutorError --> _Process
    ExecutorError --> _PendingToolResult
    ExecutorError --> _CodexAppServerSession
    ExecutorError --> _CodexSessionState
    ExecutorError --> _AppSessionFactory
    ExecutorError --> CodexExecutor
    ExecutorError --> CodexNativeExecutor
    ExecutorError --> _CopilotSessionState
    ExecutorError --> CopilotExecutor
    ExecutorError --> _CursorSessionState
    ExecutorError --> CursorExecutor
    ExecutorError --> CursorNativeExecutor
    ExecutorError --> _DatabricksSessionState
    ExecutorError --> DatabricksCredentials
    ExecutorError --> DatabricksAuthError
    ExecutorError --> _DatabricksBearerAuth
    ExecutorError --> DatabricksExecutor
    ExecutorError --> _AcpRequestError
    ExecutorError --> GooseExecutor
    ExecutorError --> GooseNativeExecutor
    ExecutorError --> HermesExecutor
    ExecutorError --> HermesNativeExecutor
    ExecutorError --> KimiExecutor
    ExecutorError --> KimiNativeExecutor
    ExecutorError --> KiroNativeExecutor
    ExecutorError --> _SDKSession
    ExecutorError --> _AgentsSDK
    ExecutorError --> _RunResult
    ExecutorError --> _RunState
    ExecutorError --> _StreamEvent
    ExecutorError --> _RawResponseEvent
    ExecutorError --> _RawResponseData
    ExecutorError --> _RunItemEvent
    ExecutorError --> _RunItem
    ExecutorError --> _ToolCallRawItem
    ExecutorError --> _ToolCallOutputRawItem
    ExecutorError --> _CallModelData
    ExecutorError --> _ModelInputData
    ExecutorError --> _ShellCommandBearerAuth
    ExecutorError --> _AgentsSessionState
    ExecutorError --> _SanitizingSession
    ExecutorError --> RawToolItemParts
    ExecutorError --> _ReasoningBlockFilterStream
    ExecutorError --> _ReasoningBlockFilterCompletions
    ExecutorError --> _ReasoningBlockFilterChat
    ExecutorError --> OpenAIAgentsSDKExecutor
    ExecutorError --> OpenResponsesExecutor
    ExecutorError --> _ResponsesSessionState
    ExecutorError --> _ToolServer
    ExecutorError --> _PiRpcSession
    ExecutorError --> _PiSessionState
    ExecutorError --> BlockedCheck
    ExecutorError --> PiSubprocessConfig
    ExecutorError --> SandboxedPiCli
    ExecutorError --> PiExecutor
    ExecutorError --> PiNativeExecutor
    ExecutorError --> PolicyAction
    ExecutorError --> PolicyResult
    ExecutorError --> PolicyRuntimeContext
    ExecutorError --> Policy
    ExecutorError --> _AcpRequestError
    ExecutorError --> QwenExecutor
    ExecutorError --> QwenNativeExecutor
    ExecutorError --> ExecutorAdapter
    ExecutorError --> _FakeTransport
    ExecutorError --> _AskVerdict
    ExecutorError --> _StepType
    ExecutorError --> _StepStatus
    ExecutorError --> _StepSource
    ExecutorError --> _StepTarget
    ExecutorError --> _AntigravityCancelledError
    ExecutorError --> _FakeToolCall
    ExecutorError --> _FakeToolResult
    ExecutorError --> _FakeUsage
    ExecutorError --> _FakeStep
    ExecutorError --> _YieldStep
    ExecutorError --> _FireToolResult
    ExecutorError --> _RaiseCancelled
    ExecutorError --> _RaiseGeneric
    ExecutorError --> _FakeConversation
    ExecutorError --> _FakeAgent
    ExecutorError --> _FakeLocalAgentConfig
    ExecutorError --> _FakePostToolCallHook
    ExecutorError --> _BlockingConversation
    ExecutorError --> _RebuildConversation
    ExecutorError --> TestPromptExtraction
    ExecutorError --> TestConstructor
    ExecutorError --> TestBuildMcpTools
    ExecutorError --> TestResolveGatewayEnv
    ExecutorError --> TestEmptyPrompt
    ExecutorError --> TestSystemMessages
    ExecutorError --> TestSkillsFilterTranslation
    ExecutorError --> TestStreamEventStreaming
    ExecutorError --> TestToolCallPolicyGate
    ExecutorError --> _FakeAppSession
    ExecutorError --> _FakePipe
    ExecutorError --> _OverflowingPipe
    ExecutorError --> _ChunkedPipe
    ExecutorError --> _FakeProcess
    ExecutorError --> TestCodexExecutor
    ExecutorError --> _FakeVersionProcess
    ExecutorError --> _FakeCodexNativeClient
    ExecutorError --> _FakeEvent
    ExecutorError --> _FakeSession
    ExecutorError --> _Unsub
    ExecutorError --> _PermissionHandler
    ExecutorError --> _ApproveOnce
    ExecutorError --> _Reject
    ExecutorError --> TestContentExtraction
    ExecutorError --> TestExecutorCapabilities
    ExecutorError --> TestForkPreamble
    ExecutorError --> TestRunTurnPreambleInjection
    ExecutorError --> TestRegistration
    ExecutorError --> FakeFunctionDelta
    ExecutorError --> FakeToolCallDelta
    ExecutorError --> FakeDelta
    ExecutorError --> FakeStreamChoice
    ExecutorError --> FakeStreamChunk
    ExecutorError --> FakeCompletions
    ExecutorError --> FakeChat
    ExecutorError --> FakeClient
    ExecutorError --> TestConvertTools
    ExecutorError --> TestConvertMessages
    ExecutorError --> TestDatabricksExecutorTextResponse
    ExecutorError --> TestDatabricksExecutorToolCalls
    ExecutorError --> TestDatabricksExecutorErrors
    ExecutorError --> TestDatabricksExecutorConfig
    ExecutorError --> TestDatabricksExecutorMultiTurn
    ExecutorError --> _StubSdkConfig
    ExecutorError --> _FakeOSEnv
    ExecutorError --> TestUtils
    ExecutorError --> TestPopulateHermesHome
    ExecutorError --> _FakeStdout
    ExecutorError --> _FakeStderr
    ExecutorError --> _FakeProcess
    ExecutorError --> _FakeToolCallRawItem
    ExecutorError --> _FakeToolOutputRawItem
    ExecutorError --> _FakeToolCallItem
    ExecutorError --> _FakeToolOutputItem
    ExecutorError --> _FakeRawTextDelta
    ExecutorError --> _FakeRawEvent
    ExecutorError --> _FakeRunItemEvent
    ExecutorError --> _FakeModelSettings
    ExecutorError --> _FakePromptTokensDetails
    ExecutorError --> _FakeUsage
    ExecutorError --> _FakeRawResponse
    ExecutorError --> _FakeResult
    ExecutorError --> _FakeRunner
    ExecutorError --> _FakeFunctionTool
    ExecutorError --> _FakeSessionSettings
    ExecutorError --> _FakeSQLiteSession
    ExecutorError --> _FakeOpenAIProvider
    ExecutorError --> _FakeRunConfig
    ExecutorError --> _FakeAgent
    ExecutorError --> _FakeItemHelpers
    ExecutorError --> _FakeMaxTurnsExceeded
    ExecutorError --> TestOpenAIAgentsSDKExecutor
    ExecutorError --> _FakeReasoningItem
    ExecutorError --> _FakeMessageOutputItem
    ExecutorError --> _FakeCompactionItem
    ExecutorError --> _FakeServer
    ExecutorError --> FakeTextPart
    ExecutorError --> FakeMessageItem
    ExecutorError --> FakeFunctionCallItem
    ExecutorError --> FakeIncomplete
    ExecutorError --> FakeResponse
    ExecutorError --> FakeResponsesAPI
    ExecutorError --> FakeClient
    ExecutorError --> TestConvertTools
    ExecutorError --> TestConvertMessages
    ExecutorError --> TestNormalizeResponseOutput
    ExecutorError --> TestOpenResponsesExecutor
    ExecutorError --> TestOpenAIClientConfig
    ExecutorError --> TestDatabricksBaseUrl
    ExecutorError --> _FakeStreamReader
    ExecutorError --> _FakeStreamWriter
    ExecutorError --> _FakeProcess
    ExecutorError --> TestSanitizeSchema
    ExecutorError --> TestPiProviderForModel
    ExecutorError --> TestBuildModelsJson
    ExecutorError --> TestGenerateExtensionJs
    ExecutorError --> TestToolServer
    ExecutorError --> TestPiRpcSession
    ExecutorError --> TestPiExecutorConstructor
    ExecutorError --> TestGateNativeTool
    ExecutorError --> TestResolveModel
    ExecutorError --> TestBuildEnvAndDir
    ExecutorError --> TestRunTurn
    ExecutorError --> TestSessionManagement
    ExecutorError --> TestClose
    ExecutorError --> TestBlockedToolDetection
    ExecutorError --> _FakeOSEnv
    ExecutorError --> _CapturingExecutor
    TextChunk <|-- ExecutorEvent
    ReasoningChunk <|-- ExecutorEvent
    ToolCallRequest <|-- ExecutorEvent
    TurnComplete <|-- ExecutorEvent
    ToolCallComplete <|-- ExecutorEvent
    CompactionComplete <|-- ExecutorEvent
    TurnCancelled <|-- ExecutorEvent
    ExecutorError <|-- ExecutorEvent
    ExecutorEvent --> NativeServerHarness
    ExecutorEvent --> _NeverRaisedError
    ExecutorEvent --> _PendingTool
    ExecutorEvent --> _AntigravitySessionState
    ExecutorEvent --> AntigravityExecutor
    ExecutorEvent --> AntigravityNativeExecutor
    ExecutorEvent --> ClaudeNativeExecutor
    ExecutorEvent --> _Process
    ExecutorEvent --> _CancelScope
    ExecutorEvent --> _TaskGroup
    ExecutorEvent --> _TaskHandle
    ExecutorEvent --> _ClaudeQuery
    ExecutorEvent --> _Stream
    ExecutorEvent --> _ClaudeTransport
    ExecutorEvent --> _ClaudeClient
    ExecutorEvent --> _StreamEventObj
    ExecutorEvent --> _AssistantMessageObj
    ExecutorEvent --> _UserMessageObj
    ExecutorEvent --> _ResultMessageObj
    ExecutorEvent --> _SystemMessageObj
    ExecutorEvent --> _TextBlockObj
    ExecutorEvent --> _ToolUseBlockObj
    ExecutorEvent --> _ToolResultBlockObj
    ExecutorEvent --> _ClaudeSDK
    ExecutorEvent --> _ClaudeClientState
    ExecutorEvent --> PreparedClaudeCli
    ExecutorEvent --> _ResolvedSkills
    ExecutorEvent --> ClaudeSDKExecutor
    ExecutorEvent --> _Process
    ExecutorEvent --> _PendingToolResult
    ExecutorEvent --> _CodexAppServerSession
    ExecutorEvent --> _CodexSessionState
    ExecutorEvent --> _AppSessionFactory
    ExecutorEvent --> CodexExecutor
    ExecutorEvent --> CodexNativeExecutor
    ExecutorEvent --> _CopilotSessionState
    ExecutorEvent --> CopilotExecutor
    ExecutorEvent --> _CursorSessionState
    ExecutorEvent --> CursorExecutor
    ExecutorEvent --> CursorNativeExecutor
    ExecutorEvent --> _DatabricksSessionState
    ExecutorEvent --> DatabricksCredentials
    ExecutorEvent --> DatabricksAuthError
    ExecutorEvent --> _DatabricksBearerAuth
    ExecutorEvent --> DatabricksExecutor
    ExecutorEvent --> _AcpRequestError
    ExecutorEvent --> GooseExecutor
    ExecutorEvent --> GooseNativeExecutor
    ExecutorEvent --> HermesExecutor
    ExecutorEvent --> HermesNativeExecutor
    ExecutorEvent --> KimiExecutor
    ExecutorEvent --> KimiNativeExecutor
    ExecutorEvent --> KiroNativeExecutor
    ExecutorEvent --> _SDKSession
    ExecutorEvent --> _AgentsSDK
    ExecutorEvent --> _RunResult
    ExecutorEvent --> _RunState
    ExecutorEvent --> _StreamEvent
    ExecutorEvent --> _RawResponseEvent
    ExecutorEvent --> _RawResponseData
    ExecutorEvent --> _RunItemEvent
    ExecutorEvent --> _RunItem
    ExecutorEvent --> _ToolCallRawItem
    ExecutorEvent --> _ToolCallOutputRawItem
    ExecutorEvent --> _CallModelData
    ExecutorEvent --> _ModelInputData
    ExecutorEvent --> _ShellCommandBearerAuth
    ExecutorEvent --> _AgentsSessionState
    ExecutorEvent --> _SanitizingSession
    ExecutorEvent --> RawToolItemParts
    ExecutorEvent --> _ReasoningBlockFilterStream
    ExecutorEvent --> _ReasoningBlockFilterCompletions
    ExecutorEvent --> _ReasoningBlockFilterChat
    ExecutorEvent --> OpenAIAgentsSDKExecutor
    ExecutorEvent --> OpenResponsesExecutor
    ExecutorEvent --> _ResponsesSessionState
    ExecutorEvent --> _ToolServer
    ExecutorEvent --> _PiRpcSession
    ExecutorEvent --> _PiSessionState
    ExecutorEvent --> BlockedCheck
    ExecutorEvent --> PiSubprocessConfig
    ExecutorEvent --> SandboxedPiCli
    ExecutorEvent --> PiExecutor
    ExecutorEvent --> PiNativeExecutor
    ExecutorEvent --> _AcpRequestError
    ExecutorEvent --> QwenExecutor
    ExecutorEvent --> QwenNativeExecutor
    ExecutorEvent --> ExecutorAdapter
    ExecutorEvent --> _CapturingExecutor
    Executor <|-- MockExecutor
    MockExecutor --> TestMockExecutor
    MockExecutor --> TestSplitTransientTail
    MockExecutor --> TestFunctionPolicy
    MockExecutor --> TestRateLimitPolicy
    MockExecutor --> TestPromptPolicy
    MockExecutor --> _CapturingExecutor
    ExecutorEvent <|-- ReasoningChunk
    ReasoningChunk --> _NeverRaisedError
    ReasoningChunk --> _PendingTool
    ReasoningChunk --> _AntigravitySessionState
    ReasoningChunk --> AntigravityExecutor
    ReasoningChunk --> _Process
    ReasoningChunk --> _CancelScope
    ReasoningChunk --> _TaskGroup
    ReasoningChunk --> _TaskHandle
    ReasoningChunk --> _ClaudeQuery
    ReasoningChunk --> _Stream
    ReasoningChunk --> _ClaudeTransport
    ReasoningChunk --> _ClaudeClient
    ReasoningChunk --> _StreamEventObj
    ReasoningChunk --> _AssistantMessageObj
    ReasoningChunk --> _UserMessageObj
    ReasoningChunk --> _ResultMessageObj
    ReasoningChunk --> _SystemMessageObj
    ReasoningChunk --> _TextBlockObj
    ReasoningChunk --> _ToolUseBlockObj
    ReasoningChunk --> _ToolResultBlockObj
    ReasoningChunk --> _ClaudeSDK
    ReasoningChunk --> _ClaudeClientState
    ReasoningChunk --> PreparedClaudeCli
    ReasoningChunk --> _ResolvedSkills
    ReasoningChunk --> ClaudeSDKExecutor
    ReasoningChunk --> _Process
    ReasoningChunk --> _PendingToolResult
    ReasoningChunk --> _CodexAppServerSession
    ReasoningChunk --> _CodexSessionState
    ReasoningChunk --> _AppSessionFactory
    ReasoningChunk --> CodexExecutor
    ReasoningChunk --> _CopilotSessionState
    ReasoningChunk --> CopilotExecutor
    ReasoningChunk --> _CursorSessionState
    ReasoningChunk --> CursorExecutor
    ReasoningChunk --> _ToolServer
    ReasoningChunk --> _PiRpcSession
    ReasoningChunk --> _PiSessionState
    ReasoningChunk --> BlockedCheck
    ReasoningChunk --> PiSubprocessConfig
    ReasoningChunk --> SandboxedPiCli
    ReasoningChunk --> PiExecutor
    ReasoningChunk --> ExecutorAdapter
    ReasoningChunk --> _StepType
    ReasoningChunk --> _StepStatus
    ReasoningChunk --> _StepSource
    ReasoningChunk --> _StepTarget
    ReasoningChunk --> _AntigravityCancelledError
    ReasoningChunk --> _FakeToolCall
    ReasoningChunk --> _FakeToolResult
    ReasoningChunk --> _FakeUsage
    ReasoningChunk --> _FakeStep
    ReasoningChunk --> _YieldStep
    ReasoningChunk --> _FireToolResult
    ReasoningChunk --> _RaiseCancelled
    ReasoningChunk --> _RaiseGeneric
    ReasoningChunk --> _FakeConversation
    ReasoningChunk --> _FakeAgent
    ReasoningChunk --> _FakeLocalAgentConfig
    ReasoningChunk --> _FakePostToolCallHook
    ReasoningChunk --> _BlockingConversation
    ReasoningChunk --> _RebuildConversation
    ReasoningChunk --> _FakeAppSession
    ReasoningChunk --> _FakePipe
    ReasoningChunk --> _OverflowingPipe
    ReasoningChunk --> _ChunkedPipe
    ReasoningChunk --> _FakeProcess
    ReasoningChunk --> TestCodexExecutor
    ReasoningChunk --> _FakeVersionProcess
    ReasoningChunk --> _FakeEvent
    ReasoningChunk --> _FakeSession
    ReasoningChunk --> _Unsub
    ReasoningChunk --> _PermissionHandler
    ReasoningChunk --> _ApproveOnce
    ReasoningChunk --> _Reject
    ReasoningChunk --> _FakeStreamReader
    ReasoningChunk --> _FakeStreamWriter
    ReasoningChunk --> _FakeProcess
    ReasoningChunk --> TestSanitizeSchema
    ReasoningChunk --> TestPiProviderForModel
    ReasoningChunk --> TestBuildModelsJson
    ReasoningChunk --> TestGenerateExtensionJs
    ReasoningChunk --> TestToolServer
    ReasoningChunk --> TestPiRpcSession
    ReasoningChunk --> TestPiExecutorConstructor
    ReasoningChunk --> TestGateNativeTool
    ReasoningChunk --> TestResolveModel
    ReasoningChunk --> TestBuildEnvAndDir
    ReasoningChunk --> TestRunTurn
    ReasoningChunk --> TestSessionManagement
    ReasoningChunk --> TestClose
    ReasoningChunk --> TestBlockedToolDetection
    ExecutorEvent <|-- TextChunk
    TextChunk --> _NeverRaisedError
    TextChunk --> _PendingTool
    TextChunk --> _AntigravitySessionState
    TextChunk --> AntigravityExecutor
    TextChunk --> _Process
    TextChunk --> _CancelScope
    TextChunk --> _TaskGroup
    TextChunk --> _TaskHandle
    TextChunk --> _ClaudeQuery
    TextChunk --> _Stream
    TextChunk --> _ClaudeTransport
    TextChunk --> _ClaudeClient
    TextChunk --> _StreamEventObj
    TextChunk --> _AssistantMessageObj
    TextChunk --> _UserMessageObj
    TextChunk --> _ResultMessageObj
    TextChunk --> _SystemMessageObj
    TextChunk --> _TextBlockObj
    TextChunk --> _ToolUseBlockObj
    TextChunk --> _ToolResultBlockObj
    TextChunk --> _ClaudeSDK
    TextChunk --> _ClaudeClientState
    TextChunk --> PreparedClaudeCli
    TextChunk --> _ResolvedSkills
    TextChunk --> ClaudeSDKExecutor
    TextChunk --> _Process
    TextChunk --> _PendingToolResult
    TextChunk --> _CodexAppServerSession
    TextChunk --> _CodexSessionState
    TextChunk --> _AppSessionFactory
    TextChunk --> CodexExecutor
    TextChunk --> _CopilotSessionState
    TextChunk --> CopilotExecutor
    TextChunk --> _CursorSessionState
    TextChunk --> CursorExecutor
    TextChunk --> _DatabricksSessionState
    TextChunk --> DatabricksCredentials
    TextChunk --> DatabricksAuthError
    TextChunk --> _DatabricksBearerAuth
    TextChunk --> DatabricksExecutor
    TextChunk --> _AcpRequestError
    TextChunk --> GooseExecutor
    TextChunk --> HermesExecutor
    TextChunk --> KimiExecutor
    TextChunk --> _SDKSession
    TextChunk --> _AgentsSDK
    TextChunk --> _RunResult
    TextChunk --> _RunState
    TextChunk --> _StreamEvent
    TextChunk --> _RawResponseEvent
    TextChunk --> _RawResponseData
    TextChunk --> _RunItemEvent
    TextChunk --> _RunItem
    TextChunk --> _ToolCallRawItem
    TextChunk --> _ToolCallOutputRawItem
    TextChunk --> _CallModelData
    TextChunk --> _ModelInputData
    TextChunk --> _ShellCommandBearerAuth
    TextChunk --> _AgentsSessionState
    TextChunk --> _SanitizingSession
    TextChunk --> RawToolItemParts
    TextChunk --> _ReasoningBlockFilterStream
    TextChunk --> _ReasoningBlockFilterCompletions
    TextChunk --> _ReasoningBlockFilterChat
    TextChunk --> OpenAIAgentsSDKExecutor
    TextChunk --> OpenResponsesExecutor
    TextChunk --> _ResponsesSessionState
    TextChunk --> _ToolServer
    TextChunk --> _PiRpcSession
    TextChunk --> _PiSessionState
    TextChunk --> BlockedCheck
    TextChunk --> PiSubprocessConfig
    TextChunk --> SandboxedPiCli
    TextChunk --> PiExecutor
    TextChunk --> PolicyAction
    TextChunk --> PolicyResult
    TextChunk --> PolicyRuntimeContext
    TextChunk --> Policy
    TextChunk --> _AcpRequestError
    TextChunk --> QwenExecutor
    TextChunk --> ExecutorAdapter
    TextChunk --> _AskVerdict
    TextChunk --> _StepType
    TextChunk --> _StepStatus
    TextChunk --> _StepSource
    TextChunk --> _StepTarget
    TextChunk --> _AntigravityCancelledError
    TextChunk --> _FakeToolCall
    TextChunk --> _FakeToolResult
    TextChunk --> _FakeUsage
    TextChunk --> _FakeStep
    TextChunk --> _YieldStep
    TextChunk --> _FireToolResult
    TextChunk --> _RaiseCancelled
    TextChunk --> _RaiseGeneric
    TextChunk --> _FakeConversation
    TextChunk --> _FakeAgent
    TextChunk --> _FakeLocalAgentConfig
    TextChunk --> _FakePostToolCallHook
    TextChunk --> _BlockingConversation
    TextChunk --> _RebuildConversation
    TextChunk --> TestPromptExtraction
    TextChunk --> TestConstructor
    TextChunk --> TestBuildMcpTools
    TextChunk --> TestResolveGatewayEnv
    TextChunk --> TestEmptyPrompt
    TextChunk --> TestSystemMessages
    TextChunk --> TestSkillsFilterTranslation
    TextChunk --> TestStreamEventStreaming
    TextChunk --> TestToolCallPolicyGate
    TextChunk --> _FakeAppSession
    TextChunk --> _FakePipe
    TextChunk --> _OverflowingPipe
    TextChunk --> _ChunkedPipe
    TextChunk --> _FakeProcess
    TextChunk --> TestCodexExecutor
    TextChunk --> _FakeVersionProcess
    TextChunk --> _FakeEvent
    TextChunk --> _FakeSession
    TextChunk --> _Unsub
    TextChunk --> _PermissionHandler
    TextChunk --> _ApproveOnce
    TextChunk --> _Reject
    TextChunk --> FakeFunctionDelta
    TextChunk --> FakeToolCallDelta
    TextChunk --> FakeDelta
    TextChunk --> FakeStreamChoice
    TextChunk --> FakeStreamChunk
    TextChunk --> FakeCompletions
    TextChunk --> FakeChat
    TextChunk --> FakeClient
    TextChunk --> TestConvertTools
    TextChunk --> TestConvertMessages
    TextChunk --> TestDatabricksExecutorTextResponse
    TextChunk --> TestDatabricksExecutorToolCalls
    TextChunk --> TestDatabricksExecutorErrors
    TextChunk --> TestDatabricksExecutorConfig
    TextChunk --> TestDatabricksExecutorMultiTurn
    TextChunk --> _StubSdkConfig
    TextChunk --> TestMockExecutor
    TextChunk --> TestSplitTransientTail
    TextChunk --> _FakeOSEnv
    TextChunk --> TestUtils
    TextChunk --> TestPopulateHermesHome
    TextChunk --> _FakeStdout
    TextChunk --> _FakeStderr
    TextChunk --> _FakeProcess
    TextChunk --> _FakeToolCallRawItem
    TextChunk --> _FakeToolOutputRawItem
    TextChunk --> _FakeToolCallItem
    TextChunk --> _FakeToolOutputItem
    TextChunk --> _FakeRawTextDelta
    TextChunk --> _FakeRawEvent
    TextChunk --> _FakeRunItemEvent
    TextChunk --> _FakeModelSettings
    TextChunk --> _FakePromptTokensDetails
    TextChunk --> _FakeUsage
    TextChunk --> _FakeRawResponse
    TextChunk --> _FakeResult
    TextChunk --> _FakeRunner
    TextChunk --> _FakeFunctionTool
    TextChunk --> _FakeSessionSettings
    TextChunk --> _FakeSQLiteSession
    TextChunk --> _FakeOpenAIProvider
    TextChunk --> _FakeRunConfig
    TextChunk --> _FakeAgent
    TextChunk --> _FakeItemHelpers
    TextChunk --> _FakeMaxTurnsExceeded
    TextChunk --> TestOpenAIAgentsSDKExecutor
    TextChunk --> _FakeReasoningItem
    TextChunk --> _FakeMessageOutputItem
    TextChunk --> _FakeCompactionItem
    TextChunk --> FakeTextPart
    TextChunk --> FakeMessageItem
    TextChunk --> FakeFunctionCallItem
    TextChunk --> FakeIncomplete
    TextChunk --> FakeResponse
    TextChunk --> FakeResponsesAPI
    TextChunk --> FakeClient
    TextChunk --> TestConvertTools
    TextChunk --> TestConvertMessages
    TextChunk --> TestNormalizeResponseOutput
    TextChunk --> TestOpenResponsesExecutor
    TextChunk --> TestOpenAIClientConfig
    TextChunk --> TestDatabricksBaseUrl
    TextChunk --> _FakeStreamReader
    TextChunk --> _FakeStreamWriter
    TextChunk --> _FakeProcess
    TextChunk --> TestSanitizeSchema
    TextChunk --> TestPiProviderForModel
    TextChunk --> TestBuildModelsJson
    TextChunk --> TestGenerateExtensionJs
    TextChunk --> TestToolServer
    TextChunk --> TestPiRpcSession
    TextChunk --> TestPiExecutorConstructor
    TextChunk --> TestGateNativeTool
    TextChunk --> TestResolveModel
    TextChunk --> TestBuildEnvAndDir
    TextChunk --> TestRunTurn
    TextChunk --> TestSessionManagement
    TextChunk --> TestClose
    TextChunk --> TestBlockedToolDetection
    TextChunk --> _FakeOSEnv
    ExecutorEvent <|-- ToolCallComplete
    ToolCallComplete --> _NeverRaisedError
    ToolCallComplete --> _PendingTool
    ToolCallComplete --> _AntigravitySessionState
    ToolCallComplete --> AntigravityExecutor
    ToolCallComplete --> _Process
    ToolCallComplete --> _CancelScope
    ToolCallComplete --> _TaskGroup
    ToolCallComplete --> _TaskHandle
    ToolCallComplete --> _ClaudeQuery
    ToolCallComplete --> _Stream
    ToolCallComplete --> _ClaudeTransport
    ToolCallComplete --> _ClaudeClient
    ToolCallComplete --> _StreamEventObj
    ToolCallComplete --> _AssistantMessageObj
    ToolCallComplete --> _UserMessageObj
    ToolCallComplete --> _ResultMessageObj
    ToolCallComplete --> _SystemMessageObj
    ToolCallComplete --> _TextBlockObj
    ToolCallComplete --> _ToolUseBlockObj
    ToolCallComplete --> _ToolResultBlockObj
    ToolCallComplete --> _ClaudeSDK
    ToolCallComplete --> _ClaudeClientState
    ToolCallComplete --> PreparedClaudeCli
    ToolCallComplete --> _ResolvedSkills
    ToolCallComplete --> ClaudeSDKExecutor
    ToolCallComplete --> _Process
    ToolCallComplete --> _PendingToolResult
    ToolCallComplete --> _CodexAppServerSession
    ToolCallComplete --> _CodexSessionState
    ToolCallComplete --> _AppSessionFactory
    ToolCallComplete --> CodexExecutor
    ToolCallComplete --> _CopilotSessionState
    ToolCallComplete --> CopilotExecutor
    ToolCallComplete --> _CursorSessionState
    ToolCallComplete --> CursorExecutor
    ToolCallComplete --> KimiExecutor
    ToolCallComplete --> _SDKSession
    ToolCallComplete --> _AgentsSDK
    ToolCallComplete --> _RunResult
    ToolCallComplete --> _RunState
    ToolCallComplete --> _StreamEvent
    ToolCallComplete --> _RawResponseEvent
    ToolCallComplete --> _RawResponseData
    ToolCallComplete --> _RunItemEvent
    ToolCallComplete --> _RunItem
    ToolCallComplete --> _ToolCallRawItem
    ToolCallComplete --> _ToolCallOutputRawItem
    ToolCallComplete --> _CallModelData
    ToolCallComplete --> _ModelInputData
    ToolCallComplete --> _ShellCommandBearerAuth
    ToolCallComplete --> _AgentsSessionState
    ToolCallComplete --> _SanitizingSession
    ToolCallComplete --> RawToolItemParts
    ToolCallComplete --> _ReasoningBlockFilterStream
    ToolCallComplete --> _ReasoningBlockFilterCompletions
    ToolCallComplete --> _ReasoningBlockFilterChat
    ToolCallComplete --> OpenAIAgentsSDKExecutor
    ToolCallComplete --> _ToolServer
    ToolCallComplete --> _PiRpcSession
    ToolCallComplete --> _PiSessionState
    ToolCallComplete --> BlockedCheck
    ToolCallComplete --> PiSubprocessConfig
    ToolCallComplete --> SandboxedPiCli
    ToolCallComplete --> PiExecutor
    ToolCallComplete --> ExecutorAdapter
    ToolCallComplete --> _StepType
    ToolCallComplete --> _StepStatus
    ToolCallComplete --> _StepSource
    ToolCallComplete --> _StepTarget
    ToolCallComplete --> _AntigravityCancelledError
    ToolCallComplete --> _FakeToolCall
    ToolCallComplete --> _FakeToolResult
    ToolCallComplete --> _FakeUsage
    ToolCallComplete --> _FakeStep
    ToolCallComplete --> _YieldStep
    ToolCallComplete --> _FireToolResult
    ToolCallComplete --> _RaiseCancelled
    ToolCallComplete --> _RaiseGeneric
    ToolCallComplete --> _FakeConversation
    ToolCallComplete --> _FakeAgent
    ToolCallComplete --> _FakeLocalAgentConfig
    ToolCallComplete --> _FakePostToolCallHook
    ToolCallComplete --> _BlockingConversation
    ToolCallComplete --> _RebuildConversation
    ToolCallComplete --> TestPromptExtraction
    ToolCallComplete --> TestConstructor
    ToolCallComplete --> TestBuildMcpTools
    ToolCallComplete --> TestResolveGatewayEnv
    ToolCallComplete --> TestEmptyPrompt
    ToolCallComplete --> TestSystemMessages
    ToolCallComplete --> TestSkillsFilterTranslation
    ToolCallComplete --> TestStreamEventStreaming
    ToolCallComplete --> TestToolCallPolicyGate
    ToolCallComplete --> _FakeAppSession
    ToolCallComplete --> _FakePipe
    ToolCallComplete --> _OverflowingPipe
    ToolCallComplete --> _ChunkedPipe
    ToolCallComplete --> _FakeProcess
    ToolCallComplete --> TestCodexExecutor
    ToolCallComplete --> _FakeVersionProcess
    ToolCallComplete --> _FakeEvent
    ToolCallComplete --> _FakeSession
    ToolCallComplete --> _Unsub
    ToolCallComplete --> _PermissionHandler
    ToolCallComplete --> _ApproveOnce
    ToolCallComplete --> _Reject
    ToolCallComplete --> _FakeStdout
    ToolCallComplete --> _FakeStderr
    ToolCallComplete --> _FakeProcess
    ToolCallComplete --> _FakeToolCallRawItem
    ToolCallComplete --> _FakeToolOutputRawItem
    ToolCallComplete --> _FakeToolCallItem
    ToolCallComplete --> _FakeToolOutputItem
    ToolCallComplete --> _FakeRawTextDelta
    ToolCallComplete --> _FakeRawEvent
    ToolCallComplete --> _FakeRunItemEvent
    ToolCallComplete --> _FakeModelSettings
    ToolCallComplete --> _FakePromptTokensDetails
    ToolCallComplete --> _FakeUsage
    ToolCallComplete --> _FakeRawResponse
    ToolCallComplete --> _FakeResult
    ToolCallComplete --> _FakeRunner
    ToolCallComplete --> _FakeFunctionTool
    ToolCallComplete --> _FakeSessionSettings
    ToolCallComplete --> _FakeSQLiteSession
    ToolCallComplete --> _FakeOpenAIProvider
    ToolCallComplete --> _FakeRunConfig
    ToolCallComplete --> _FakeAgent
    ToolCallComplete --> _FakeItemHelpers
    ToolCallComplete --> _FakeMaxTurnsExceeded
    ToolCallComplete --> TestOpenAIAgentsSDKExecutor
    ToolCallComplete --> _FakeReasoningItem
    ToolCallComplete --> _FakeMessageOutputItem
    ToolCallComplete --> _FakeCompactionItem
    ToolCallComplete --> _FakeStreamReader
    ToolCallComplete --> _FakeStreamWriter
    ToolCallComplete --> _FakeProcess
    ToolCallComplete --> TestSanitizeSchema
    ToolCallComplete --> TestPiProviderForModel
    ToolCallComplete --> TestBuildModelsJson
    ToolCallComplete --> TestGenerateExtensionJs
    ToolCallComplete --> TestToolServer
    ToolCallComplete --> TestPiRpcSession
    ToolCallComplete --> TestPiExecutorConstructor
    ToolCallComplete --> TestGateNativeTool
    ToolCallComplete --> TestResolveModel
    ToolCallComplete --> TestBuildEnvAndDir
    ToolCallComplete --> TestRunTurn
    ToolCallComplete --> TestSessionManagement
    ToolCallComplete --> TestClose
    ToolCallComplete --> TestBlockedToolDetection
    ToolCallComplete --> _ParsedSSEEvent
    ToolCallComplete --> _StubExecutor
    ToolCallComplete --> _RecordingTurnContext
    ToolCallComplete --> _AcceptingInjectionExecutor
    ToolCallComplete --> _OneInjectionCtx
    ToolCallComplete --> _InterruptTrackingExecutor
    ToolCallComplete --> _CapturingExecutor
    ExecutorEvent <|-- ToolCallRequest
    ToolCallRequest --> _NeverRaisedError
    ToolCallRequest --> _PendingTool
    ToolCallRequest --> _AntigravitySessionState
    ToolCallRequest --> AntigravityExecutor
    ToolCallRequest --> _Process
    ToolCallRequest --> _CancelScope
    ToolCallRequest --> _TaskGroup
    ToolCallRequest --> _TaskHandle
    ToolCallRequest --> _ClaudeQuery
    ToolCallRequest --> _Stream
    ToolCallRequest --> _ClaudeTransport
    ToolCallRequest --> _ClaudeClient
    ToolCallRequest --> _StreamEventObj
    ToolCallRequest --> _AssistantMessageObj
    ToolCallRequest --> _UserMessageObj
    ToolCallRequest --> _ResultMessageObj
    ToolCallRequest --> _SystemMessageObj
    ToolCallRequest --> _TextBlockObj
    ToolCallRequest --> _ToolUseBlockObj
    ToolCallRequest --> _ToolResultBlockObj
    ToolCallRequest --> _ClaudeSDK
    ToolCallRequest --> _ClaudeClientState
    ToolCallRequest --> PreparedClaudeCli
    ToolCallRequest --> _ResolvedSkills
    ToolCallRequest --> ClaudeSDKExecutor
    ToolCallRequest --> _Process
    ToolCallRequest --> _PendingToolResult
    ToolCallRequest --> _CodexAppServerSession
    ToolCallRequest --> _CodexSessionState
    ToolCallRequest --> _AppSessionFactory
    ToolCallRequest --> CodexExecutor
    ToolCallRequest --> _CopilotSessionState
    ToolCallRequest --> CopilotExecutor
    ToolCallRequest --> _CursorSessionState
    ToolCallRequest --> CursorExecutor
    ToolCallRequest --> _DatabricksSessionState
    ToolCallRequest --> DatabricksCredentials
    ToolCallRequest --> DatabricksAuthError
    ToolCallRequest --> _DatabricksBearerAuth
    ToolCallRequest --> DatabricksExecutor
    ToolCallRequest --> KimiExecutor
    ToolCallRequest --> _SDKSession
    ToolCallRequest --> _AgentsSDK
    ToolCallRequest --> _RunResult
    ToolCallRequest --> _RunState
    ToolCallRequest --> _StreamEvent
    ToolCallRequest --> _RawResponseEvent
    ToolCallRequest --> _RawResponseData
    ToolCallRequest --> _RunItemEvent
    ToolCallRequest --> _RunItem
    ToolCallRequest --> _ToolCallRawItem
    ToolCallRequest --> _ToolCallOutputRawItem
    ToolCallRequest --> _CallModelData
    ToolCallRequest --> _ModelInputData
    ToolCallRequest --> _ShellCommandBearerAuth
    ToolCallRequest --> _AgentsSessionState
    ToolCallRequest --> _SanitizingSession
    ToolCallRequest --> RawToolItemParts
    ToolCallRequest --> _ReasoningBlockFilterStream
    ToolCallRequest --> _ReasoningBlockFilterCompletions
    ToolCallRequest --> _ReasoningBlockFilterChat
    ToolCallRequest --> OpenAIAgentsSDKExecutor
    ToolCallRequest --> OpenResponsesExecutor
    ToolCallRequest --> _ResponsesSessionState
    ToolCallRequest --> _ToolServer
    ToolCallRequest --> _PiRpcSession
    ToolCallRequest --> _PiSessionState
    ToolCallRequest --> BlockedCheck
    ToolCallRequest --> PiSubprocessConfig
    ToolCallRequest --> SandboxedPiCli
    ToolCallRequest --> PiExecutor
    ToolCallRequest --> PolicyAction
    ToolCallRequest --> PolicyResult
    ToolCallRequest --> PolicyRuntimeContext
    ToolCallRequest --> Policy
    ToolCallRequest --> ExecutorAdapter
    ToolCallRequest --> _StepType
    ToolCallRequest --> _StepStatus
    ToolCallRequest --> _StepSource
    ToolCallRequest --> _StepTarget
    ToolCallRequest --> _AntigravityCancelledError
    ToolCallRequest --> _FakeToolCall
    ToolCallRequest --> _FakeToolResult
    ToolCallRequest --> _FakeUsage
    ToolCallRequest --> _FakeStep
    ToolCallRequest --> _YieldStep
    ToolCallRequest --> _FireToolResult
    ToolCallRequest --> _RaiseCancelled
    ToolCallRequest --> _RaiseGeneric
    ToolCallRequest --> _FakeConversation
    ToolCallRequest --> _FakeAgent
    ToolCallRequest --> _FakeLocalAgentConfig
    ToolCallRequest --> _FakePostToolCallHook
    ToolCallRequest --> _BlockingConversation
    ToolCallRequest --> _RebuildConversation
    ToolCallRequest --> TestPromptExtraction
    ToolCallRequest --> TestConstructor
    ToolCallRequest --> TestBuildMcpTools
    ToolCallRequest --> TestResolveGatewayEnv
    ToolCallRequest --> TestEmptyPrompt
    ToolCallRequest --> TestSystemMessages
    ToolCallRequest --> TestSkillsFilterTranslation
    ToolCallRequest --> TestStreamEventStreaming
    ToolCallRequest --> TestToolCallPolicyGate
    ToolCallRequest --> _FakeAppSession
    ToolCallRequest --> _FakePipe
    ToolCallRequest --> _OverflowingPipe
    ToolCallRequest --> _ChunkedPipe
    ToolCallRequest --> _FakeProcess
    ToolCallRequest --> TestCodexExecutor
    ToolCallRequest --> _FakeVersionProcess
    ToolCallRequest --> _FakeEvent
    ToolCallRequest --> _FakeSession
    ToolCallRequest --> _Unsub
    ToolCallRequest --> _PermissionHandler
    ToolCallRequest --> _ApproveOnce
    ToolCallRequest --> _Reject
    ToolCallRequest --> FakeFunctionDelta
    ToolCallRequest --> FakeToolCallDelta
    ToolCallRequest --> FakeDelta
    ToolCallRequest --> FakeStreamChoice
    ToolCallRequest --> FakeStreamChunk
    ToolCallRequest --> FakeCompletions
    ToolCallRequest --> FakeChat
    ToolCallRequest --> FakeClient
    ToolCallRequest --> TestConvertTools
    ToolCallRequest --> TestConvertMessages
    ToolCallRequest --> TestDatabricksExecutorTextResponse
    ToolCallRequest --> TestDatabricksExecutorToolCalls
    ToolCallRequest --> TestDatabricksExecutorErrors
    ToolCallRequest --> TestDatabricksExecutorConfig
    ToolCallRequest --> TestDatabricksExecutorMultiTurn
    ToolCallRequest --> _StubSdkConfig
    ToolCallRequest --> TestMockExecutor
    ToolCallRequest --> TestSplitTransientTail
    ToolCallRequest --> _FakeStdout
    ToolCallRequest --> _FakeStderr
    ToolCallRequest --> _FakeProcess
    ToolCallRequest --> _FakeToolCallRawItem
    ToolCallRequest --> _FakeToolOutputRawItem
    ToolCallRequest --> _FakeToolCallItem
    ToolCallRequest --> _FakeToolOutputItem
    ToolCallRequest --> _FakeRawTextDelta
    ToolCallRequest --> _FakeRawEvent
    ToolCallRequest --> _FakeRunItemEvent
    ToolCallRequest --> _FakeModelSettings
    ToolCallRequest --> _FakePromptTokensDetails
    ToolCallRequest --> _FakeUsage
    ToolCallRequest --> _FakeRawResponse
    ToolCallRequest --> _FakeResult
    ToolCallRequest --> _FakeRunner
    ToolCallRequest --> _FakeFunctionTool
    ToolCallRequest --> _FakeSessionSettings
    ToolCallRequest --> _FakeSQLiteSession
    ToolCallRequest --> _FakeOpenAIProvider
    ToolCallRequest --> _FakeRunConfig
    ToolCallRequest --> _FakeAgent
    ToolCallRequest --> _FakeItemHelpers
    ToolCallRequest --> _FakeMaxTurnsExceeded
    ToolCallRequest --> TestOpenAIAgentsSDKExecutor
    ToolCallRequest --> _FakeReasoningItem
    ToolCallRequest --> _FakeMessageOutputItem
    ToolCallRequest --> _FakeCompactionItem
    ToolCallRequest --> FakeTextPart
    ToolCallRequest --> FakeMessageItem
    ToolCallRequest --> FakeFunctionCallItem
    ToolCallRequest --> FakeIncomplete
    ToolCallRequest --> FakeResponse
    ToolCallRequest --> FakeResponsesAPI
    ToolCallRequest --> FakeClient
    ToolCallRequest --> TestConvertTools
    ToolCallRequest --> TestConvertMessages
    ToolCallRequest --> TestNormalizeResponseOutput
    ToolCallRequest --> TestOpenResponsesExecutor
    ToolCallRequest --> TestOpenAIClientConfig
    ToolCallRequest --> TestDatabricksBaseUrl
    ToolCallRequest --> _FakeStreamReader
    ToolCallRequest --> _FakeStreamWriter
    ToolCallRequest --> _FakeProcess
    ToolCallRequest --> TestSanitizeSchema
    ToolCallRequest --> TestPiProviderForModel
    ToolCallRequest --> TestBuildModelsJson
    ToolCallRequest --> TestGenerateExtensionJs
    ToolCallRequest --> TestToolServer
    ToolCallRequest --> TestPiRpcSession
    ToolCallRequest --> TestPiExecutorConstructor
    ToolCallRequest --> TestGateNativeTool
    ToolCallRequest --> TestResolveModel
    ToolCallRequest --> TestBuildEnvAndDir
    ToolCallRequest --> TestRunTurn
    ToolCallRequest --> TestSessionManagement
    ToolCallRequest --> TestClose
    ToolCallRequest --> TestBlockedToolDetection
    ToolCallRequest --> _ParsedSSEEvent
    ToolCallRequest --> _StubExecutor
    ToolCallRequest --> _RecordingTurnContext
    ToolCallRequest --> _AcceptingInjectionExecutor
    ToolCallRequest --> _OneInjectionCtx
    ToolCallRequest --> _InterruptTrackingExecutor
    ToolCallRequest --> _CapturingExecutor
    ToolCallStatus --> _NeverRaisedError
    ToolCallStatus --> _PendingTool
    ToolCallStatus --> _AntigravitySessionState
    ToolCallStatus --> AntigravityExecutor
    ToolCallStatus --> _Process
    ToolCallStatus --> _CancelScope
    ToolCallStatus --> _TaskGroup
    ToolCallStatus --> _TaskHandle
    ToolCallStatus --> _ClaudeQuery
    ToolCallStatus --> _Stream
    ToolCallStatus --> _ClaudeTransport
    ToolCallStatus --> _ClaudeClient
    ToolCallStatus --> _StreamEventObj
    ToolCallStatus --> _AssistantMessageObj
    ToolCallStatus --> _UserMessageObj
    ToolCallStatus --> _ResultMessageObj
    ToolCallStatus --> _SystemMessageObj
    ToolCallStatus --> _TextBlockObj
    ToolCallStatus --> _ToolUseBlockObj
    ToolCallStatus --> _ToolResultBlockObj
    ToolCallStatus --> _ClaudeSDK
    ToolCallStatus --> _ClaudeClientState
    ToolCallStatus --> PreparedClaudeCli
    ToolCallStatus --> _ResolvedSkills
    ToolCallStatus --> ClaudeSDKExecutor
    ToolCallStatus --> _Process
    ToolCallStatus --> _PendingToolResult
    ToolCallStatus --> _CodexAppServerSession
    ToolCallStatus --> _CodexSessionState
    ToolCallStatus --> _AppSessionFactory
    ToolCallStatus --> CodexExecutor
    ToolCallStatus --> _CopilotSessionState
    ToolCallStatus --> CopilotExecutor
    ToolCallStatus --> _CursorSessionState
    ToolCallStatus --> CursorExecutor
    ToolCallStatus --> KimiExecutor
    ToolCallStatus --> _ToolServer
    ToolCallStatus --> _PiRpcSession
    ToolCallStatus --> _PiSessionState
    ToolCallStatus --> BlockedCheck
    ToolCallStatus --> PiSubprocessConfig
    ToolCallStatus --> SandboxedPiCli
    ToolCallStatus --> PiExecutor
    ToolCallStatus --> _StepType
    ToolCallStatus --> _StepStatus
    ToolCallStatus --> _StepSource
    ToolCallStatus --> _StepTarget
    ToolCallStatus --> _AntigravityCancelledError
    ToolCallStatus --> _FakeToolCall
    ToolCallStatus --> _FakeToolResult
    ToolCallStatus --> _FakeUsage
    ToolCallStatus --> _FakeStep
    ToolCallStatus --> _YieldStep
    ToolCallStatus --> _FireToolResult
    ToolCallStatus --> _RaiseCancelled
    ToolCallStatus --> _RaiseGeneric
    ToolCallStatus --> _FakeConversation
    ToolCallStatus --> _FakeAgent
    ToolCallStatus --> _FakeLocalAgentConfig
    ToolCallStatus --> _FakePostToolCallHook
    ToolCallStatus --> _BlockingConversation
    ToolCallStatus --> _RebuildConversation
    ToolCallStatus --> TestPromptExtraction
    ToolCallStatus --> TestConstructor
    ToolCallStatus --> TestBuildMcpTools
    ToolCallStatus --> TestResolveGatewayEnv
    ToolCallStatus --> TestEmptyPrompt
    ToolCallStatus --> TestSystemMessages
    ToolCallStatus --> TestSkillsFilterTranslation
    ToolCallStatus --> TestStreamEventStreaming
    ToolCallStatus --> TestToolCallPolicyGate
    ToolCallStatus --> _FakeAppSession
    ToolCallStatus --> _FakePipe
    ToolCallStatus --> _OverflowingPipe
    ToolCallStatus --> _ChunkedPipe
    ToolCallStatus --> _FakeProcess
    ToolCallStatus --> TestCodexExecutor
    ToolCallStatus --> _FakeVersionProcess
    ToolCallStatus --> _FakeEvent
    ToolCallStatus --> _FakeSession
    ToolCallStatus --> _Unsub
    ToolCallStatus --> _PermissionHandler
    ToolCallStatus --> _ApproveOnce
    ToolCallStatus --> _Reject
    ToolCallStatus --> _FakeToolCallRawItem
    ToolCallStatus --> _FakeToolOutputRawItem
    ToolCallStatus --> _FakeToolCallItem
    ToolCallStatus --> _FakeToolOutputItem
    ToolCallStatus --> _FakeRawTextDelta
    ToolCallStatus --> _FakeRawEvent
    ToolCallStatus --> _FakeRunItemEvent
    ToolCallStatus --> _FakeModelSettings
    ToolCallStatus --> _FakePromptTokensDetails
    ToolCallStatus --> _FakeUsage
    ToolCallStatus --> _FakeRawResponse
    ToolCallStatus --> _FakeResult
    ToolCallStatus --> _FakeRunner
    ToolCallStatus --> _FakeFunctionTool
    ToolCallStatus --> _FakeSessionSettings
    ToolCallStatus --> _FakeSQLiteSession
    ToolCallStatus --> _FakeOpenAIProvider
    ToolCallStatus --> _FakeRunConfig
    ToolCallStatus --> _FakeAgent
    ToolCallStatus --> _FakeItemHelpers
    ToolCallStatus --> _FakeMaxTurnsExceeded
    ToolCallStatus --> TestOpenAIAgentsSDKExecutor
    ToolCallStatus --> _FakeReasoningItem
    ToolCallStatus --> _FakeMessageOutputItem
    ToolCallStatus --> _FakeCompactionItem
    ToolCallStatus --> _FakeStreamReader
    ToolCallStatus --> _FakeStreamWriter
    ToolCallStatus --> _FakeProcess
    ToolCallStatus --> TestSanitizeSchema
    ToolCallStatus --> TestPiProviderForModel
    ToolCallStatus --> TestBuildModelsJson
    ToolCallStatus --> TestGenerateExtensionJs
    ToolCallStatus --> TestToolServer
    ToolCallStatus --> TestPiRpcSession
    ToolCallStatus --> TestPiExecutorConstructor
    ToolCallStatus --> TestGateNativeTool
    ToolCallStatus --> TestResolveModel
    ToolCallStatus --> TestBuildEnvAndDir
    ToolCallStatus --> TestRunTurn
    ToolCallStatus --> TestSessionManagement
    ToolCallStatus --> TestClose
    ToolCallStatus --> TestBlockedToolDetection
    ToolCallStatus --> _ParsedSSEEvent
    ToolCallStatus --> _StubExecutor
    ToolCallStatus --> _RecordingTurnContext
    ToolCallStatus --> _AcceptingInjectionExecutor
    ToolCallStatus --> _OneInjectionCtx
    ToolCallStatus --> _InterruptTrackingExecutor
    ToolCallStatus --> _CapturingExecutor
    ExecutorEvent <|-- TurnCancelled
    TurnCancelled --> _NeverRaisedError
    TurnCancelled --> _PendingTool
    TurnCancelled --> _AntigravitySessionState
    TurnCancelled --> AntigravityExecutor
    TurnCancelled --> _CursorSessionState
    TurnCancelled --> CursorExecutor
    TurnCancelled --> ExecutorAdapter
    TurnCancelled --> _StepType
    TurnCancelled --> _StepStatus
    TurnCancelled --> _StepSource
    TurnCancelled --> _StepTarget
    TurnCancelled --> _AntigravityCancelledError
    TurnCancelled --> _FakeToolCall
    TurnCancelled --> _FakeToolResult
    TurnCancelled --> _FakeUsage
    TurnCancelled --> _FakeStep
    TurnCancelled --> _YieldStep
    TurnCancelled --> _FireToolResult
    TurnCancelled --> _RaiseCancelled
    TurnCancelled --> _RaiseGeneric
    TurnCancelled --> _FakeConversation
    TurnCancelled --> _FakeAgent
    TurnCancelled --> _FakeLocalAgentConfig
    TurnCancelled --> _FakePostToolCallHook
    TurnCancelled --> _BlockingConversation
    TurnCancelled --> _RebuildConversation
    TurnCancelled --> _CapturingExecutor
    ExecutorEvent <|-- TurnComplete
    TurnComplete --> NativeServerHarness
    TurnComplete --> _NeverRaisedError
    TurnComplete --> _PendingTool
    TurnComplete --> _AntigravitySessionState
    TurnComplete --> AntigravityExecutor
    TurnComplete --> AntigravityNativeExecutor
    TurnComplete --> ClaudeNativeExecutor
    TurnComplete --> _Process
    TurnComplete --> _CancelScope
    TurnComplete --> _TaskGroup
    TurnComplete --> _TaskHandle
    TurnComplete --> _ClaudeQuery
    TurnComplete --> _Stream
    TurnComplete --> _ClaudeTransport
    TurnComplete --> _ClaudeClient
    TurnComplete --> _StreamEventObj
    TurnComplete --> _AssistantMessageObj
    TurnComplete --> _UserMessageObj
    TurnComplete --> _ResultMessageObj
    TurnComplete --> _SystemMessageObj
    TurnComplete --> _TextBlockObj
    TurnComplete --> _ToolUseBlockObj
    TurnComplete --> _ToolResultBlockObj
    TurnComplete --> _ClaudeSDK
    TurnComplete --> _ClaudeClientState
    TurnComplete --> PreparedClaudeCli
    TurnComplete --> _ResolvedSkills
    TurnComplete --> ClaudeSDKExecutor
    TurnComplete --> _Process
    TurnComplete --> _PendingToolResult
    TurnComplete --> _CodexAppServerSession
    TurnComplete --> _CodexSessionState
    TurnComplete --> _AppSessionFactory
    TurnComplete --> CodexExecutor
    TurnComplete --> CodexNativeExecutor
    TurnComplete --> _CopilotSessionState
    TurnComplete --> CopilotExecutor
    TurnComplete --> _CursorSessionState
    TurnComplete --> CursorExecutor
    TurnComplete --> CursorNativeExecutor
    TurnComplete --> _DatabricksSessionState
    TurnComplete --> DatabricksCredentials
    TurnComplete --> DatabricksAuthError
    TurnComplete --> _DatabricksBearerAuth
    TurnComplete --> DatabricksExecutor
    TurnComplete --> _AcpRequestError
    TurnComplete --> GooseExecutor
    TurnComplete --> GooseNativeExecutor
    TurnComplete --> HermesExecutor
    TurnComplete --> HermesNativeExecutor
    TurnComplete --> KimiExecutor
    TurnComplete --> KimiNativeExecutor
    TurnComplete --> KiroNativeExecutor
    TurnComplete --> _SDKSession
    TurnComplete --> _AgentsSDK
    TurnComplete --> _RunResult
    TurnComplete --> _RunState
    TurnComplete --> _StreamEvent
    TurnComplete --> _RawResponseEvent
    TurnComplete --> _RawResponseData
    TurnComplete --> _RunItemEvent
    TurnComplete --> _RunItem
    TurnComplete --> _ToolCallRawItem
    TurnComplete --> _ToolCallOutputRawItem
    TurnComplete --> _CallModelData
    TurnComplete --> _ModelInputData
    TurnComplete --> _ShellCommandBearerAuth
    TurnComplete --> _AgentsSessionState
    TurnComplete --> _SanitizingSession
    TurnComplete --> RawToolItemParts
    TurnComplete --> _ReasoningBlockFilterStream
    TurnComplete --> _ReasoningBlockFilterCompletions
    TurnComplete --> _ReasoningBlockFilterChat
    TurnComplete --> OpenAIAgentsSDKExecutor
    TurnComplete --> OpenResponsesExecutor
    TurnComplete --> _ResponsesSessionState
    TurnComplete --> _ToolServer
    TurnComplete --> _PiRpcSession
    TurnComplete --> _PiSessionState
    TurnComplete --> BlockedCheck
    TurnComplete --> PiSubprocessConfig
    TurnComplete --> SandboxedPiCli
    TurnComplete --> PiExecutor
    TurnComplete --> PiNativeExecutor
    TurnComplete --> PolicyAction
    TurnComplete --> PolicyResult
    TurnComplete --> PolicyRuntimeContext
    TurnComplete --> Policy
    TurnComplete --> _AcpRequestError
    TurnComplete --> QwenExecutor
    TurnComplete --> QwenNativeExecutor
    TurnComplete --> ExecutorAdapter
    TurnComplete --> _FakeTransport
    TurnComplete --> _AskVerdict
    TurnComplete --> _StepType
    TurnComplete --> _StepStatus
    TurnComplete --> _StepSource
    TurnComplete --> _StepTarget
    TurnComplete --> _AntigravityCancelledError
    TurnComplete --> _FakeToolCall
    TurnComplete --> _FakeToolResult
    TurnComplete --> _FakeUsage
    TurnComplete --> _FakeStep
    TurnComplete --> _YieldStep
    TurnComplete --> _FireToolResult
    TurnComplete --> _RaiseCancelled
    TurnComplete --> _RaiseGeneric
    TurnComplete --> _FakeConversation
    TurnComplete --> _FakeAgent
    TurnComplete --> _FakeLocalAgentConfig
    TurnComplete --> _FakePostToolCallHook
    TurnComplete --> _BlockingConversation
    TurnComplete --> _RebuildConversation
    TurnComplete --> TestPromptExtraction
    TurnComplete --> TestConstructor
    TurnComplete --> TestBuildMcpTools
    TurnComplete --> TestResolveGatewayEnv
    TurnComplete --> TestEmptyPrompt
    TurnComplete --> TestSystemMessages
    TurnComplete --> TestSkillsFilterTranslation
    TurnComplete --> TestStreamEventStreaming
    TurnComplete --> TestToolCallPolicyGate
    TurnComplete --> _FakeAppSession
    TurnComplete --> _FakePipe
    TurnComplete --> _OverflowingPipe
    TurnComplete --> _ChunkedPipe
    TurnComplete --> _FakeProcess
    TurnComplete --> TestCodexExecutor
    TurnComplete --> _FakeVersionProcess
    TurnComplete --> _FakeCodexNativeClient
    TurnComplete --> _FakeEvent
    TurnComplete --> _FakeSession
    TurnComplete --> _Unsub
    TurnComplete --> _PermissionHandler
    TurnComplete --> _ApproveOnce
    TurnComplete --> _Reject
    TurnComplete --> FakeFunctionDelta
    TurnComplete --> FakeToolCallDelta
    TurnComplete --> FakeDelta
    TurnComplete --> FakeStreamChoice
    TurnComplete --> FakeStreamChunk
    TurnComplete --> FakeCompletions
    TurnComplete --> FakeChat
    TurnComplete --> FakeClient
    TurnComplete --> TestConvertTools
    TurnComplete --> TestConvertMessages
    TurnComplete --> TestDatabricksExecutorTextResponse
    TurnComplete --> TestDatabricksExecutorToolCalls
    TurnComplete --> TestDatabricksExecutorErrors
    TurnComplete --> TestDatabricksExecutorConfig
    TurnComplete --> TestDatabricksExecutorMultiTurn
    TurnComplete --> _StubSdkConfig
    TurnComplete --> TestMockExecutor
    TurnComplete --> TestSplitTransientTail
    TurnComplete --> _FakeOSEnv
    TurnComplete --> TestUtils
    TurnComplete --> TestPopulateHermesHome
    TurnComplete --> _FakeStdout
    TurnComplete --> _FakeStderr
    TurnComplete --> _FakeProcess
    TurnComplete --> _FakeToolCallRawItem
    TurnComplete --> _FakeToolOutputRawItem
    TurnComplete --> _FakeToolCallItem
    TurnComplete --> _FakeToolOutputItem
    TurnComplete --> _FakeRawTextDelta
    TurnComplete --> _FakeRawEvent
    TurnComplete --> _FakeRunItemEvent
    TurnComplete --> _FakeModelSettings
    TurnComplete --> _FakePromptTokensDetails
    TurnComplete --> _FakeUsage
    TurnComplete --> _FakeRawResponse
    TurnComplete --> _FakeResult
    TurnComplete --> _FakeRunner
    TurnComplete --> _FakeFunctionTool
    TurnComplete --> _FakeSessionSettings
    TurnComplete --> _FakeSQLiteSession
    TurnComplete --> _FakeOpenAIProvider
    TurnComplete --> _FakeRunConfig
    TurnComplete --> _FakeAgent
    TurnComplete --> _FakeItemHelpers
    TurnComplete --> _FakeMaxTurnsExceeded
    TurnComplete --> TestOpenAIAgentsSDKExecutor
    TurnComplete --> _FakeReasoningItem
    TurnComplete --> _FakeMessageOutputItem
    TurnComplete --> _FakeCompactionItem
    TurnComplete --> _FakeServer
    TurnComplete --> FakeTextPart
    TurnComplete --> FakeMessageItem
    TurnComplete --> FakeFunctionCallItem
    TurnComplete --> FakeIncomplete
    TurnComplete --> FakeResponse
    TurnComplete --> FakeResponsesAPI
    TurnComplete --> FakeClient
    TurnComplete --> TestConvertTools
    TurnComplete --> TestConvertMessages
    TurnComplete --> TestNormalizeResponseOutput
    TurnComplete --> TestOpenResponsesExecutor
    TurnComplete --> TestOpenAIClientConfig
    TurnComplete --> TestDatabricksBaseUrl
    TurnComplete --> _FakeStreamReader
    TurnComplete --> _FakeStreamWriter
    TurnComplete --> _FakeProcess
    TurnComplete --> TestSanitizeSchema
    TurnComplete --> TestPiProviderForModel
    TurnComplete --> TestBuildModelsJson
    TurnComplete --> TestGenerateExtensionJs
    TurnComplete --> TestToolServer
    TurnComplete --> TestPiRpcSession
    TurnComplete --> TestPiExecutorConstructor
    TurnComplete --> TestGateNativeTool
    TurnComplete --> TestResolveModel
    TurnComplete --> TestBuildEnvAndDir
    TurnComplete --> TestRunTurn
    TurnComplete --> TestSessionManagement
    TurnComplete --> TestClose
    TurnComplete --> TestBlockedToolDetection
    TurnComplete --> _FakeOSEnv
    TurnComplete --> _ParsedSSEEvent
    TurnComplete --> _StubExecutor
    TurnComplete --> _RecordingTurnContext
    TurnComplete --> _AcceptingInjectionExecutor
    TurnComplete --> _OneInjectionCtx
    TurnComplete --> _InterruptTrackingExecutor
    TurnComplete --> _CapturingExecutor
    _AcpRequestError --> Executor
    _AcpRequestError --> ExecutorConfig
    _AcpRequestError --> ExecutorError
    _AcpRequestError --> ExecutorEvent
    _AcpRequestError --> TextChunk
    _AcpRequestError --> TurnComplete
    GooseExecutor --> Executor
    GooseExecutor --> ExecutorConfig
    GooseExecutor --> ExecutorError
    GooseExecutor --> ExecutorEvent
    GooseExecutor --> TextChunk
    GooseExecutor --> TurnComplete
    GooseExecutor --> _AskVerdict
    GooseExecutor --> _FakeOSEnv
    GooseNativeExecutor --> Executor
    GooseNativeExecutor --> ExecutorConfig
    GooseNativeExecutor --> ExecutorError
    GooseNativeExecutor --> ExecutorEvent
    GooseNativeExecutor --> TurnComplete
    HermesExecutor --> Executor
    HermesExecutor --> ExecutorConfig
    HermesExecutor --> ExecutorError
    HermesExecutor --> ExecutorEvent
    HermesExecutor --> TextChunk
    HermesExecutor --> TurnComplete
    HermesExecutor --> TestUtils
    HermesExecutor --> TestPopulateHermesHome
    HermesNativeExecutor --> Executor
    HermesNativeExecutor --> ExecutorConfig
    HermesNativeExecutor --> ExecutorError
    HermesNativeExecutor --> ExecutorEvent
    HermesNativeExecutor --> TurnComplete
    KimiExecutor --> Executor
    KimiExecutor --> ExecutorConfig
    KimiExecutor --> ExecutorError
    KimiExecutor --> ExecutorEvent
    KimiExecutor --> TextChunk
    KimiExecutor --> ToolCallComplete
    KimiExecutor --> ToolCallRequest
    KimiExecutor --> ToolCallStatus
    KimiExecutor --> TurnComplete
    KimiExecutor --> _FakeStdout
    KimiExecutor --> _FakeStderr
    KimiExecutor --> _FakeProcess
    KimiNativeExecutor --> Executor
    KimiNativeExecutor --> ExecutorConfig
    KimiNativeExecutor --> ExecutorError
    KimiNativeExecutor --> ExecutorEvent
    KimiNativeExecutor --> TurnComplete
    KimiNativeExecutor --> TestContentExtraction
    KimiNativeExecutor --> TestExecutorCapabilities
    KimiNativeExecutor --> TestSettlePaneReadiness
    KiroNativeExecutor --> Executor
    KiroNativeExecutor --> ExecutorConfig
    KiroNativeExecutor --> ExecutorError
    KiroNativeExecutor --> ExecutorEvent
    KiroNativeExecutor --> TurnComplete
    _OverflowTokens --> LLMErrorDetail
    _OverflowTokens --> PermanentLLMError
    _OverflowTokens --> RetryableLLMError
    _OverflowTokens --> RetryPolicy
    NativeServerHarness --> Executor
    NativeServerHarness --> ExecutorConfig
    NativeServerHarness --> ExecutorError
    NativeServerHarness --> ExecutorEvent
    NativeServerHarness --> TurnComplete
    NativeServerHarness --> NativeServerTransport
    NativeServerHarness --> OpenCodeNativeExecutor
    NativeServerHarness --> _FakeTransport
    NativeServerTransport --> NativeServerHarness
    OpenResponsesExecutor --> RetryPolicy
    OpenResponsesExecutor --> Executor
    OpenResponsesExecutor --> ExecutorConfig
    OpenResponsesExecutor --> ExecutorError
    OpenResponsesExecutor --> ExecutorEvent
    OpenResponsesExecutor --> TextChunk
    OpenResponsesExecutor --> ToolCallRequest
    OpenResponsesExecutor --> TurnComplete
    OpenResponsesExecutor --> FakeTextPart
    OpenResponsesExecutor --> FakeMessageItem
    OpenResponsesExecutor --> FakeFunctionCallItem
    OpenResponsesExecutor --> FakeIncomplete
    OpenResponsesExecutor --> FakeResponse
    OpenResponsesExecutor --> FakeResponsesAPI
    OpenResponsesExecutor --> FakeClient
    OpenResponsesExecutor --> TestConvertTools
    OpenResponsesExecutor --> TestConvertMessages
    OpenResponsesExecutor --> TestNormalizeResponseOutput
    OpenResponsesExecutor --> TestOpenResponsesExecutor
    OpenResponsesExecutor --> TestOpenAIClientConfig
    OpenResponsesExecutor --> TestDatabricksBaseUrl
    _ResponsesSessionState --> RetryPolicy
    _ResponsesSessionState --> Executor
    _ResponsesSessionState --> ExecutorConfig
    _ResponsesSessionState --> ExecutorError
    _ResponsesSessionState --> ExecutorEvent
    _ResponsesSessionState --> TextChunk
    _ResponsesSessionState --> ToolCallRequest
    _ResponsesSessionState --> TurnComplete
    _AgentsSDK --> RetryPolicy
    _AgentsSDK --> Executor
    _AgentsSDK --> ExecutorConfig
    _AgentsSDK --> ExecutorError
    _AgentsSDK --> ExecutorEvent
    _AgentsSDK --> TextChunk
    _AgentsSDK --> ToolCallComplete
    _AgentsSDK --> ToolCallRequest
    _AgentsSDK --> TurnComplete
    _AgentsSDK --> DatabricksAuthError
    _AgentsSDK --> CompactionComplete
    _AgentsSessionState --> RetryPolicy
    _AgentsSessionState --> Executor
    _AgentsSessionState --> ExecutorConfig
    _AgentsSessionState --> ExecutorError
    _AgentsSessionState --> ExecutorEvent
    _AgentsSessionState --> TextChunk
    _AgentsSessionState --> ToolCallComplete
    _AgentsSessionState --> ToolCallRequest
    _AgentsSessionState --> TurnComplete
    _AgentsSessionState --> DatabricksAuthError
    _AgentsSessionState --> CompactionComplete
    _CallModelData --> RetryPolicy
    _CallModelData --> Executor
    _CallModelData --> ExecutorConfig
    _CallModelData --> ExecutorError
    _CallModelData --> ExecutorEvent
    _CallModelData --> TextChunk
    _CallModelData --> ToolCallComplete
    _CallModelData --> ToolCallRequest
    _CallModelData --> TurnComplete
    _CallModelData --> DatabricksAuthError
    _CallModelData --> CompactionComplete
    _ModelInputData --> RetryPolicy
    _ModelInputData --> Executor
    _ModelInputData --> ExecutorConfig
    _ModelInputData --> ExecutorError
    _ModelInputData --> ExecutorEvent
    _ModelInputData --> TextChunk
    _ModelInputData --> ToolCallComplete
    _ModelInputData --> ToolCallRequest
    _ModelInputData --> TurnComplete
    _ModelInputData --> DatabricksAuthError
    _ModelInputData --> CompactionComplete
    OpenAIAgentsSDKExecutor --> RetryPolicy
    OpenAIAgentsSDKExecutor --> Executor
    OpenAIAgentsSDKExecutor --> ExecutorConfig
    OpenAIAgentsSDKExecutor --> ExecutorError
    OpenAIAgentsSDKExecutor --> ExecutorEvent
    OpenAIAgentsSDKExecutor --> TextChunk
    OpenAIAgentsSDKExecutor --> ToolCallComplete
    OpenAIAgentsSDKExecutor --> ToolCallRequest
    OpenAIAgentsSDKExecutor --> TurnComplete
    OpenAIAgentsSDKExecutor --> DatabricksAuthError
    OpenAIAgentsSDKExecutor --> CompactionComplete
    OpenAIAgentsSDKExecutor --> _FakeToolCallRawItem
    OpenAIAgentsSDKExecutor --> _FakeToolOutputRawItem
    OpenAIAgentsSDKExecutor --> _FakeToolCallItem
    OpenAIAgentsSDKExecutor --> _FakeToolOutputItem
    OpenAIAgentsSDKExecutor --> _FakeRawTextDelta
    OpenAIAgentsSDKExecutor --> _FakeRawEvent
    OpenAIAgentsSDKExecutor --> _FakeRunItemEvent
    OpenAIAgentsSDKExecutor --> _FakeModelSettings
    OpenAIAgentsSDKExecutor --> _FakePromptTokensDetails
    OpenAIAgentsSDKExecutor --> _FakeUsage
    OpenAIAgentsSDKExecutor --> _FakeRawResponse
    OpenAIAgentsSDKExecutor --> _FakeResult
    OpenAIAgentsSDKExecutor --> _FakeRunner
    OpenAIAgentsSDKExecutor --> _FakeFunctionTool
    OpenAIAgentsSDKExecutor --> _FakeSessionSettings
    OpenAIAgentsSDKExecutor --> _FakeSQLiteSession
    OpenAIAgentsSDKExecutor --> _FakeOpenAIProvider
    OpenAIAgentsSDKExecutor --> _FakeRunConfig
    OpenAIAgentsSDKExecutor --> _FakeAgent
    OpenAIAgentsSDKExecutor --> _FakeItemHelpers
    OpenAIAgentsSDKExecutor --> _FakeMaxTurnsExceeded
    OpenAIAgentsSDKExecutor --> TestOpenAIAgentsSDKExecutor
    OpenAIAgentsSDKExecutor --> _FakeReasoningItem
    OpenAIAgentsSDKExecutor --> _FakeMessageOutputItem
    OpenAIAgentsSDKExecutor --> _FakeCompactionItem
    _RawResponseData --> RetryPolicy
    _RawResponseData --> Executor
    _RawResponseData --> ExecutorConfig
    _RawResponseData --> ExecutorError
    _RawResponseData --> ExecutorEvent
    _RawResponseData --> TextChunk
    _RawResponseData --> ToolCallComplete
    _RawResponseData --> ToolCallRequest
    _RawResponseData --> TurnComplete
    _RawResponseData --> DatabricksAuthError
    _RawResponseData --> CompactionComplete
    _RawResponseEvent --> RetryPolicy
    _RawResponseEvent --> Executor
    _RawResponseEvent --> ExecutorConfig
    _RawResponseEvent --> ExecutorError
    _RawResponseEvent --> ExecutorEvent
    _RawResponseEvent --> TextChunk
    _RawResponseEvent --> ToolCallComplete
    _RawResponseEvent --> ToolCallRequest
    _RawResponseEvent --> TurnComplete
    _RawResponseEvent --> DatabricksAuthError
    _RawResponseEvent --> CompactionComplete
    RawToolItemParts --> RetryPolicy
    RawToolItemParts --> Executor
    RawToolItemParts --> ExecutorConfig
    RawToolItemParts --> ExecutorError
    RawToolItemParts --> ExecutorEvent
    RawToolItemParts --> TextChunk
    RawToolItemParts --> ToolCallComplete
    RawToolItemParts --> ToolCallRequest
    RawToolItemParts --> TurnComplete
    RawToolItemParts --> DatabricksAuthError
    RawToolItemParts --> CompactionComplete
    _ReasoningBlockFilterChat --> RetryPolicy
    _ReasoningBlockFilterChat --> Executor
    _ReasoningBlockFilterChat --> ExecutorConfig
    _ReasoningBlockFilterChat --> ExecutorError
    _ReasoningBlockFilterChat --> ExecutorEvent
    _ReasoningBlockFilterChat --> TextChunk
    _ReasoningBlockFilterChat --> ToolCallComplete
    _ReasoningBlockFilterChat --> ToolCallRequest
    _ReasoningBlockFilterChat --> TurnComplete
    _ReasoningBlockFilterChat --> DatabricksAuthError
    _ReasoningBlockFilterChat --> CompactionComplete
    _ReasoningBlockFilterCompletions --> RetryPolicy
    _ReasoningBlockFilterCompletions --> Executor
    _ReasoningBlockFilterCompletions --> ExecutorConfig
    _ReasoningBlockFilterCompletions --> ExecutorError
    _ReasoningBlockFilterCompletions --> ExecutorEvent
    _ReasoningBlockFilterCompletions --> TextChunk
    _ReasoningBlockFilterCompletions --> ToolCallComplete
    _ReasoningBlockFilterCompletions --> ToolCallRequest
    _ReasoningBlockFilterCompletions --> TurnComplete
    _ReasoningBlockFilterCompletions --> DatabricksAuthError
    _ReasoningBlockFilterCompletions --> CompactionComplete
    _ReasoningBlockFilterStream --> RetryPolicy
    _ReasoningBlockFilterStream --> Executor
    _ReasoningBlockFilterStream --> ExecutorConfig
    _ReasoningBlockFilterStream --> ExecutorError
    _ReasoningBlockFilterStream --> ExecutorEvent
    _ReasoningBlockFilterStream --> TextChunk
    _ReasoningBlockFilterStream --> ToolCallComplete
    _ReasoningBlockFilterStream --> ToolCallRequest
    _ReasoningBlockFilterStream --> TurnComplete
    _ReasoningBlockFilterStream --> DatabricksAuthError
    _ReasoningBlockFilterStream --> CompactionComplete
    _RunItem --> RetryPolicy
    _RunItem --> Executor
    _RunItem --> ExecutorConfig
    _RunItem --> ExecutorError
    _RunItem --> ExecutorEvent
    _RunItem --> TextChunk
    _RunItem --> ToolCallComplete
    _RunItem --> ToolCallRequest
    _RunItem --> TurnComplete
    _RunItem --> DatabricksAuthError
    _RunItem --> CompactionComplete
    _RunItemEvent --> RetryPolicy
    _RunItemEvent --> Executor
    _RunItemEvent --> ExecutorConfig
    _RunItemEvent --> ExecutorError
    _RunItemEvent --> ExecutorEvent
    _RunItemEvent --> TextChunk
    _RunItemEvent --> ToolCallComplete
    _RunItemEvent --> ToolCallRequest
    _RunItemEvent --> TurnComplete
    _RunItemEvent --> DatabricksAuthError
    _RunItemEvent --> CompactionComplete
    _RunResult --> RetryPolicy
    _RunResult --> Executor
    _RunResult --> ExecutorConfig
    _RunResult --> ExecutorError
    _RunResult --> ExecutorEvent
    _RunResult --> TextChunk
    _RunResult --> ToolCallComplete
    _RunResult --> ToolCallRequest
    _RunResult --> TurnComplete
    _RunResult --> DatabricksAuthError
    _RunResult --> CompactionComplete
    _RunState --> RetryPolicy
    _RunState --> Executor
    _RunState --> ExecutorConfig
    _RunState --> ExecutorError
    _RunState --> ExecutorEvent
    _RunState --> TextChunk
    _RunState --> ToolCallComplete
    _RunState --> ToolCallRequest
    _RunState --> TurnComplete
    _RunState --> DatabricksAuthError
    _RunState --> CompactionComplete
    _SanitizingSession --> RetryPolicy
    _SanitizingSession --> Executor
    _SanitizingSession --> ExecutorConfig
    _SanitizingSession --> ExecutorError
    _SanitizingSession --> ExecutorEvent
    _SanitizingSession --> TextChunk
    _SanitizingSession --> ToolCallComplete
    _SanitizingSession --> ToolCallRequest
    _SanitizingSession --> TurnComplete
    _SanitizingSession --> DatabricksAuthError
    _SanitizingSession --> CompactionComplete
    _SDKSession --> RetryPolicy
    _SDKSession --> Executor
    _SDKSession --> ExecutorConfig
    _SDKSession --> ExecutorError
    _SDKSession --> ExecutorEvent
    _SDKSession --> TextChunk
    _SDKSession --> ToolCallComplete
    _SDKSession --> ToolCallRequest
    _SDKSession --> TurnComplete
    _SDKSession --> DatabricksAuthError
    _SDKSession --> CompactionComplete
    _ShellCommandBearerAuth --> RetryPolicy
    _ShellCommandBearerAuth --> Executor
    _ShellCommandBearerAuth --> ExecutorConfig
    _ShellCommandBearerAuth --> ExecutorError
    _ShellCommandBearerAuth --> ExecutorEvent
    _ShellCommandBearerAuth --> TextChunk
    _ShellCommandBearerAuth --> ToolCallComplete
    _ShellCommandBearerAuth --> ToolCallRequest
    _ShellCommandBearerAuth --> TurnComplete
    _ShellCommandBearerAuth --> DatabricksAuthError
    _ShellCommandBearerAuth --> CompactionComplete
    _StreamEvent --> RetryPolicy
    _StreamEvent --> Executor
    _StreamEvent --> ExecutorConfig
    _StreamEvent --> ExecutorError
    _StreamEvent --> ExecutorEvent
    _StreamEvent --> TextChunk
    _StreamEvent --> ToolCallComplete
    _StreamEvent --> ToolCallRequest
    _StreamEvent --> TurnComplete
    _StreamEvent --> DatabricksAuthError
    _StreamEvent --> CompactionComplete
    _ToolCallOutputRawItem --> RetryPolicy
    _ToolCallOutputRawItem --> Executor
    _ToolCallOutputRawItem --> ExecutorConfig
    _ToolCallOutputRawItem --> ExecutorError
    _ToolCallOutputRawItem --> ExecutorEvent
    _ToolCallOutputRawItem --> TextChunk
    _ToolCallOutputRawItem --> ToolCallComplete
    _ToolCallOutputRawItem --> ToolCallRequest
    _ToolCallOutputRawItem --> TurnComplete
    _ToolCallOutputRawItem --> DatabricksAuthError
    _ToolCallOutputRawItem --> CompactionComplete
    _ToolCallRawItem --> RetryPolicy
    _ToolCallRawItem --> Executor
    _ToolCallRawItem --> ExecutorConfig
    _ToolCallRawItem --> ExecutorError
    _ToolCallRawItem --> ExecutorEvent
    _ToolCallRawItem --> TextChunk
    _ToolCallRawItem --> ToolCallComplete
    _ToolCallRawItem --> ToolCallRequest
    _ToolCallRawItem --> TurnComplete
    _ToolCallRawItem --> DatabricksAuthError
    _ToolCallRawItem --> CompactionComplete
    OpenCodeNativeExecutor --> NativeServerHarness
    OpenCodeNativeExecutor --> _FakeServer
    BlockedCheck --> RetryPolicy
    BlockedCheck --> Executor
    BlockedCheck --> ExecutorConfig
    BlockedCheck --> ExecutorError
    BlockedCheck --> ExecutorEvent
    BlockedCheck --> ReasoningChunk
    BlockedCheck --> TextChunk
    BlockedCheck --> ToolCallComplete
    BlockedCheck --> ToolCallRequest
    BlockedCheck --> ToolCallStatus
    BlockedCheck --> TurnComplete
    PiExecutor --> RetryPolicy
    PiExecutor --> Executor
    PiExecutor --> ExecutorConfig
    PiExecutor --> ExecutorError
    PiExecutor --> ExecutorEvent
    PiExecutor --> ReasoningChunk
    PiExecutor --> TextChunk
    PiExecutor --> ToolCallComplete
    PiExecutor --> ToolCallRequest
    PiExecutor --> ToolCallStatus
    PiExecutor --> TurnComplete
    PiExecutor --> _FakeStreamReader
    PiExecutor --> _FakeStreamWriter
    PiExecutor --> _FakeProcess
    PiExecutor --> TestSanitizeSchema
    PiExecutor --> TestPiProviderForModel
    PiExecutor --> TestBuildModelsJson
    PiExecutor --> TestGenerateExtensionJs
    PiExecutor --> TestToolServer
    PiExecutor --> TestPiRpcSession
    PiExecutor --> TestPiExecutorConstructor
    PiExecutor --> TestGateNativeTool
    PiExecutor --> TestResolveModel
    PiExecutor --> TestBuildEnvAndDir
    PiExecutor --> TestRunTurn
    PiExecutor --> TestSessionManagement
    PiExecutor --> TestClose
    PiExecutor --> TestBlockedToolDetection
    _PiRpcSession --> RetryPolicy
    _PiRpcSession --> Executor
    _PiRpcSession --> ExecutorConfig
    _PiRpcSession --> ExecutorError
    _PiRpcSession --> ExecutorEvent
    _PiRpcSession --> ReasoningChunk
    _PiRpcSession --> TextChunk
    _PiRpcSession --> ToolCallComplete
    _PiRpcSession --> ToolCallRequest
    _PiRpcSession --> ToolCallStatus
    _PiRpcSession --> TurnComplete
    _PiSessionState --> RetryPolicy
    _PiSessionState --> Executor
    _PiSessionState --> ExecutorConfig
    _PiSessionState --> ExecutorError
    _PiSessionState --> ExecutorEvent
    _PiSessionState --> ReasoningChunk
    _PiSessionState --> TextChunk
    _PiSessionState --> ToolCallComplete
    _PiSessionState --> ToolCallRequest
    _PiSessionState --> ToolCallStatus
    _PiSessionState --> TurnComplete
    PiSubprocessConfig --> RetryPolicy
    PiSubprocessConfig --> Executor
    PiSubprocessConfig --> ExecutorConfig
    PiSubprocessConfig --> ExecutorError
    PiSubprocessConfig --> ExecutorEvent
    PiSubprocessConfig --> ReasoningChunk
    PiSubprocessConfig --> TextChunk
    PiSubprocessConfig --> ToolCallComplete
    PiSubprocessConfig --> ToolCallRequest
    PiSubprocessConfig --> ToolCallStatus
    PiSubprocessConfig --> TurnComplete
    SandboxedPiCli --> RetryPolicy
    SandboxedPiCli --> Executor
    SandboxedPiCli --> ExecutorConfig
    SandboxedPiCli --> ExecutorError
    SandboxedPiCli --> ExecutorEvent
    SandboxedPiCli --> ReasoningChunk
    SandboxedPiCli --> TextChunk
    SandboxedPiCli --> ToolCallComplete
    SandboxedPiCli --> ToolCallRequest
    SandboxedPiCli --> ToolCallStatus
    SandboxedPiCli --> TurnComplete
    _ToolServer --> RetryPolicy
    _ToolServer --> Executor
    _ToolServer --> ExecutorConfig
    _ToolServer --> ExecutorError
    _ToolServer --> ExecutorEvent
    _ToolServer --> ReasoningChunk
    _ToolServer --> TextChunk
    _ToolServer --> ToolCallComplete
    _ToolServer --> ToolCallRequest
    _ToolServer --> ToolCallStatus
    _ToolServer --> TurnComplete
    PiNativeExecutor --> Executor
    PiNativeExecutor --> ExecutorConfig
    PiNativeExecutor --> ExecutorError
    PiNativeExecutor --> ExecutorEvent
    PiNativeExecutor --> TurnComplete
    Policy --> Executor
    Policy --> ExecutorConfig
    Policy --> ExecutorError
    Policy --> TextChunk
    Policy --> ToolCallRequest
    Policy --> TurnComplete
    PolicyAction --> Executor
    PolicyAction --> ExecutorConfig
    PolicyAction --> ExecutorError
    PolicyAction --> TextChunk
    PolicyAction --> ToolCallRequest
    PolicyAction --> TurnComplete
    PolicyAction --> TestFunctionPolicy
    PolicyAction --> TestRateLimitPolicy
    PolicyAction --> TestPromptPolicy
    PolicyResult --> Executor
    PolicyResult --> ExecutorConfig
    PolicyResult --> ExecutorError
    PolicyResult --> TextChunk
    PolicyResult --> ToolCallRequest
    PolicyResult --> TurnComplete
    PolicyResult --> TestFunctionPolicy
    PolicyResult --> TestRateLimitPolicy
    PolicyResult --> TestPromptPolicy
    PolicyRuntimeContext --> Executor
    PolicyRuntimeContext --> ExecutorConfig
    PolicyRuntimeContext --> ExecutorError
    PolicyRuntimeContext --> TextChunk
    PolicyRuntimeContext --> ToolCallRequest
    PolicyRuntimeContext --> TurnComplete
    PolicyRuntimeContext --> TestFunctionPolicy
    PolicyRuntimeContext --> TestRateLimitPolicy
    PolicyRuntimeContext --> TestPromptPolicy
    _AcpRequestError --> Executor
    _AcpRequestError --> ExecutorConfig
    _AcpRequestError --> ExecutorError
    _AcpRequestError --> ExecutorEvent
    _AcpRequestError --> TextChunk
    _AcpRequestError --> TurnComplete
    QwenExecutor --> Executor
    QwenExecutor --> ExecutorConfig
    QwenExecutor --> ExecutorError
    QwenExecutor --> ExecutorEvent
    QwenExecutor --> TextChunk
    QwenExecutor --> TurnComplete
    QwenExecutor --> _FakeOSEnv
    QwenNativeExecutor --> Executor
    QwenNativeExecutor --> ExecutorConfig
    QwenNativeExecutor --> ExecutorError
    QwenNativeExecutor --> ExecutorEvent
    QwenNativeExecutor --> TurnComplete
    _RetryTestHarness --> HarnessApp
    _RetryTestHarness --> TurnContext
    _RetryTestHarness --> CreateResponseRequest
    SandboxPolicy --> TestPromptExtraction
    SandboxPolicy --> TestConstructor
    SandboxPolicy --> TestBuildMcpTools
    SandboxPolicy --> TestResolveGatewayEnv
    SandboxPolicy --> TestEmptyPrompt
    SandboxPolicy --> TestSystemMessages
    SandboxPolicy --> TestSkillsFilterTranslation
    SandboxPolicy --> TestStreamEventStreaming
    SandboxPolicy --> TestToolCallPolicyGate
    SandboxPolicy --> _FakeOSEnv
    SandboxPolicy --> _FakeStreamReader
    SandboxPolicy --> _FakeStreamWriter
    SandboxPolicy --> _FakeProcess
    SandboxPolicy --> TestSanitizeSchema
    SandboxPolicy --> TestPiProviderForModel
    SandboxPolicy --> TestBuildModelsJson
    SandboxPolicy --> TestGenerateExtensionJs
    SandboxPolicy --> TestToolServer
    SandboxPolicy --> TestPiRpcSession
    SandboxPolicy --> TestPiExecutorConstructor
    SandboxPolicy --> TestGateNativeTool
    SandboxPolicy --> TestResolveModel
    SandboxPolicy --> TestBuildEnvAndDir
    SandboxPolicy --> TestRunTurn
    SandboxPolicy --> TestSessionManagement
    SandboxPolicy --> TestClose
    SandboxPolicy --> TestBlockedToolDetection
    SandboxPolicy --> _FakeOSEnv
    HarnessApp --> ExecutorAdapter
    HarnessApp --> CreateResponseRequest
    HarnessApp --> _ParsedSSEEvent
    HarnessApp --> _StubExecutor
    HarnessApp --> _RecordingTurnContext
    HarnessApp --> _AcceptingInjectionExecutor
    HarnessApp --> _OneInjectionCtx
    HarnessApp --> _InterruptTrackingExecutor
    HarnessApp --> _ParsedSSEEvent
    HarnessApp --> _RetryTestHarness
    HarnessApp --> _UsageHarness
    HarnessApp --> _ToolDispatchHarness
    HarnessApp --> _ElicitationHarness
    HarnessApp --> _CancellableHarness
    HarnessApp --> _InjectionHarness
    HarnessApp --> _NativeToolEmittingHarness
    HarnessApp --> _FastHeartbeatHarness
    HarnessApp --> _SlowStreamHarness
    HarnessApp --> _WedgedHarness
    HarnessApp --> _BusyProgressHarness
    HarnessApp --> _WedgedFastHeartbeatHarness
    PolicyVerdictEvent --> CreateResponseRequest
    PolicyVerdictPayload --> ExecutorAdapter
    PolicyVerdictPayload --> CreateResponseRequest
    PolicyVerdictPayload --> TestPromptExtraction
    PolicyVerdictPayload --> TestConstructor
    PolicyVerdictPayload --> TestBuildMcpTools
    PolicyVerdictPayload --> TestResolveGatewayEnv
    PolicyVerdictPayload --> TestEmptyPrompt
    PolicyVerdictPayload --> TestSystemMessages
    PolicyVerdictPayload --> TestSkillsFilterTranslation
    PolicyVerdictPayload --> TestStreamEventStreaming
    PolicyVerdictPayload --> TestToolCallPolicyGate
    PolicyVerdictPayload --> _FakeStreamReader
    PolicyVerdictPayload --> _FakeStreamWriter
    PolicyVerdictPayload --> _FakeProcess
    PolicyVerdictPayload --> TestSanitizeSchema
    PolicyVerdictPayload --> TestPiProviderForModel
    PolicyVerdictPayload --> TestBuildModelsJson
    PolicyVerdictPayload --> TestGenerateExtensionJs
    PolicyVerdictPayload --> TestToolServer
    PolicyVerdictPayload --> TestPiRpcSession
    PolicyVerdictPayload --> TestPiExecutorConstructor
    PolicyVerdictPayload --> TestGateNativeTool
    PolicyVerdictPayload --> TestResolveModel
    PolicyVerdictPayload --> TestBuildEnvAndDir
    PolicyVerdictPayload --> TestRunTurn
    PolicyVerdictPayload --> TestSessionManagement
    PolicyVerdictPayload --> TestClose
    PolicyVerdictPayload --> TestBlockedToolDetection
    TurnContext --> ExecutorAdapter
    TurnContext --> CreateResponseRequest
    TurnContext --> _ParsedSSEEvent
    TurnContext --> _StubExecutor
    TurnContext --> _RecordingTurnContext
    TurnContext --> _AcceptingInjectionExecutor
    TurnContext --> _OneInjectionCtx
    TurnContext --> _InterruptTrackingExecutor
    TurnContext --> _ParsedSSEEvent
    TurnContext --> _RetryTestHarness
    TurnContext --> _UsageHarness
    TurnContext --> _ToolDispatchHarness
    TurnContext --> _ElicitationHarness
    TurnContext --> _CancellableHarness
    TurnContext --> _InjectionHarness
    TurnContext --> _NativeToolEmittingHarness
    TurnContext --> _FastHeartbeatHarness
    TurnContext --> _SlowStreamHarness
    TurnContext --> _WedgedHarness
    TurnContext --> _BusyProgressHarness
    TurnContext --> _WedgedFastHeartbeatHarness
    CreateResponseRequest --> ExecutorAdapter
    CreateResponseRequest --> PolicyVerdictPayload
    CreateResponseRequest --> PolicyVerdictEvent
    CreateResponseRequest --> TurnContext
    CreateResponseRequest --> HarnessApp
    CreateResponseRequest --> _ParsedSSEEvent
    CreateResponseRequest --> _StubExecutor
    CreateResponseRequest --> _RecordingTurnContext
    CreateResponseRequest --> _AcceptingInjectionExecutor
    CreateResponseRequest --> _OneInjectionCtx
    CreateResponseRequest --> _InterruptTrackingExecutor
    CreateResponseRequest --> _RetryTestHarness
    CreateResponseRequest --> _UsageHarness
    CreateResponseRequest --> _ToolDispatchHarness
    CreateResponseRequest --> _ElicitationHarness
    CreateResponseRequest --> _CancellableHarness
    CreateResponseRequest --> _InjectionHarness
    CreateResponseRequest --> _NativeToolEmittingHarness
    CreateResponseRequest --> _FastHeartbeatHarness
    CreateResponseRequest --> _SlowStreamHarness
    CreateResponseRequest --> _WedgedHarness
    CreateResponseRequest --> _BusyProgressHarness
    CreateResponseRequest --> _WedgedFastHeartbeatHarness
    InjectionConsumedEvent --> ExecutorAdapter
    InjectionConsumedEvent --> _ParsedSSEEvent
    InjectionConsumedEvent --> _StubExecutor
    InjectionConsumedEvent --> _RecordingTurnContext
    InjectionConsumedEvent --> _AcceptingInjectionExecutor
    InjectionConsumedEvent --> _OneInjectionCtx
    InjectionConsumedEvent --> _InterruptTrackingExecutor
    _AntigravityCancelledError --> AntigravityExecutor
    _AntigravityCancelledError --> ExecutorConfig
    _AntigravityCancelledError --> ExecutorError
    _AntigravityCancelledError --> ReasoningChunk
    _AntigravityCancelledError --> TextChunk
    _AntigravityCancelledError --> ToolCallComplete
    _AntigravityCancelledError --> ToolCallRequest
    _AntigravityCancelledError --> ToolCallStatus
    _AntigravityCancelledError --> TurnCancelled
    _AntigravityCancelledError --> TurnComplete
    _BlockingConversation --> AntigravityExecutor
    _BlockingConversation --> ExecutorConfig
    _BlockingConversation --> ExecutorError
    _BlockingConversation --> ReasoningChunk
    _BlockingConversation --> TextChunk
    _BlockingConversation --> ToolCallComplete
    _BlockingConversation --> ToolCallRequest
    _BlockingConversation --> ToolCallStatus
    _BlockingConversation --> TurnCancelled
    _BlockingConversation --> TurnComplete
    _FakeAgent --> AntigravityExecutor
    _FakeAgent --> ExecutorConfig
    _FakeAgent --> ExecutorError
    _FakeAgent --> ReasoningChunk
    _FakeAgent --> TextChunk
    _FakeAgent --> ToolCallComplete
    _FakeAgent --> ToolCallRequest
    _FakeAgent --> ToolCallStatus
    _FakeAgent --> TurnCancelled
    _FakeAgent --> TurnComplete
    _FakeConversation --> AntigravityExecutor
    _FakeConversation --> ExecutorConfig
    _FakeConversation --> ExecutorError
    _FakeConversation --> ReasoningChunk
    _FakeConversation --> TextChunk
    _FakeConversation --> ToolCallComplete
    _FakeConversation --> ToolCallRequest
    _FakeConversation --> ToolCallStatus
    _FakeConversation --> TurnCancelled
    _FakeConversation --> TurnComplete
    _FakeLocalAgentConfig --> AntigravityExecutor
    _FakeLocalAgentConfig --> ExecutorConfig
    _FakeLocalAgentConfig --> ExecutorError
    _FakeLocalAgentConfig --> ReasoningChunk
    _FakeLocalAgentConfig --> TextChunk
    _FakeLocalAgentConfig --> ToolCallComplete
    _FakeLocalAgentConfig --> ToolCallRequest
    _FakeLocalAgentConfig --> ToolCallStatus
    _FakeLocalAgentConfig --> TurnCancelled
    _FakeLocalAgentConfig --> TurnComplete
    _FakePostToolCallHook --> AntigravityExecutor
    _FakePostToolCallHook --> ExecutorConfig
    _FakePostToolCallHook --> ExecutorError
    _FakePostToolCallHook --> ReasoningChunk
    _FakePostToolCallHook --> TextChunk
    _FakePostToolCallHook --> ToolCallComplete
    _FakePostToolCallHook --> ToolCallRequest
    _FakePostToolCallHook --> ToolCallStatus
    _FakePostToolCallHook --> TurnCancelled
    _FakePostToolCallHook --> TurnComplete
    _FakeStep --> AntigravityExecutor
    _FakeStep --> ExecutorConfig
    _FakeStep --> ExecutorError
    _FakeStep --> ReasoningChunk
    _FakeStep --> TextChunk
    _FakeStep --> ToolCallComplete
    _FakeStep --> ToolCallRequest
    _FakeStep --> ToolCallStatus
    _FakeStep --> TurnCancelled
    _FakeStep --> TurnComplete
    _FakeToolCall --> AntigravityExecutor
    _FakeToolCall --> ExecutorConfig
    _FakeToolCall --> ExecutorError
    _FakeToolCall --> ReasoningChunk
    _FakeToolCall --> TextChunk
    _FakeToolCall --> ToolCallComplete
    _FakeToolCall --> ToolCallRequest
    _FakeToolCall --> ToolCallStatus
    _FakeToolCall --> TurnCancelled
    _FakeToolCall --> TurnComplete
    _FakeToolResult --> AntigravityExecutor
    _FakeToolResult --> ExecutorConfig
    _FakeToolResult --> ExecutorError
    _FakeToolResult --> ReasoningChunk
    _FakeToolResult --> TextChunk
    _FakeToolResult --> ToolCallComplete
    _FakeToolResult --> ToolCallRequest
    _FakeToolResult --> ToolCallStatus
    _FakeToolResult --> TurnCancelled
    _FakeToolResult --> TurnComplete
    _FakeUsage --> AntigravityExecutor
    _FakeUsage --> ExecutorConfig
    _FakeUsage --> ExecutorError
    _FakeUsage --> ReasoningChunk
    _FakeUsage --> TextChunk
    _FakeUsage --> ToolCallComplete
    _FakeUsage --> ToolCallRequest
    _FakeUsage --> ToolCallStatus
    _FakeUsage --> TurnCancelled
    _FakeUsage --> TurnComplete
    _FireToolResult --> AntigravityExecutor
    _FireToolResult --> ExecutorConfig
    _FireToolResult --> ExecutorError
    _FireToolResult --> ReasoningChunk
    _FireToolResult --> TextChunk
    _FireToolResult --> ToolCallComplete
    _FireToolResult --> ToolCallRequest
    _FireToolResult --> ToolCallStatus
    _FireToolResult --> TurnCancelled
    _FireToolResult --> TurnComplete
    _RaiseCancelled --> AntigravityExecutor
    _RaiseCancelled --> ExecutorConfig
    _RaiseCancelled --> ExecutorError
    _RaiseCancelled --> ReasoningChunk
    _RaiseCancelled --> TextChunk
    _RaiseCancelled --> ToolCallComplete
    _RaiseCancelled --> ToolCallRequest
    _RaiseCancelled --> ToolCallStatus
    _RaiseCancelled --> TurnCancelled
    _RaiseCancelled --> TurnComplete
    _RaiseGeneric --> AntigravityExecutor
    _RaiseGeneric --> ExecutorConfig
    _RaiseGeneric --> ExecutorError
    _RaiseGeneric --> ReasoningChunk
    _RaiseGeneric --> TextChunk
    _RaiseGeneric --> ToolCallComplete
    _RaiseGeneric --> ToolCallRequest
    _RaiseGeneric --> ToolCallStatus
    _RaiseGeneric --> TurnCancelled
    _RaiseGeneric --> TurnComplete
    _RebuildConversation --> AntigravityExecutor
    _RebuildConversation --> ExecutorConfig
    _RebuildConversation --> ExecutorError
    _RebuildConversation --> ReasoningChunk
    _RebuildConversation --> TextChunk
    _RebuildConversation --> ToolCallComplete
    _RebuildConversation --> ToolCallRequest
    _RebuildConversation --> ToolCallStatus
    _RebuildConversation --> TurnCancelled
    _RebuildConversation --> TurnComplete
    _StepSource --> AntigravityExecutor
    _StepSource --> ExecutorConfig
    _StepSource --> ExecutorError
    _StepSource --> ReasoningChunk
    _StepSource --> TextChunk
    _StepSource --> ToolCallComplete
    _StepSource --> ToolCallRequest
    _StepSource --> ToolCallStatus
    _StepSource --> TurnCancelled
    _StepSource --> TurnComplete
    _StepStatus --> AntigravityExecutor
    _StepStatus --> ExecutorConfig
    _StepStatus --> ExecutorError
    _StepStatus --> ReasoningChunk
    _StepStatus --> TextChunk
    _StepStatus --> ToolCallComplete
    _StepStatus --> ToolCallRequest
    _StepStatus --> ToolCallStatus
    _StepStatus --> TurnCancelled
    _StepStatus --> TurnComplete
    _StepTarget --> AntigravityExecutor
    _StepTarget --> ExecutorConfig
    _StepTarget --> ExecutorError
    _StepTarget --> ReasoningChunk
    _StepTarget --> TextChunk
    _StepTarget --> ToolCallComplete
    _StepTarget --> ToolCallRequest
    _StepTarget --> ToolCallStatus
    _StepTarget --> TurnCancelled
    _StepTarget --> TurnComplete
    _StepType --> AntigravityExecutor
    _StepType --> ExecutorConfig
    _StepType --> ExecutorError
    _StepType --> ReasoningChunk
    _StepType --> TextChunk
    _StepType --> ToolCallComplete
    _StepType --> ToolCallRequest
    _StepType --> ToolCallStatus
    _StepType --> TurnCancelled
    _StepType --> TurnComplete
    _YieldStep --> AntigravityExecutor
    _YieldStep --> ExecutorConfig
    _YieldStep --> ExecutorError
    _YieldStep --> ReasoningChunk
    _YieldStep --> TextChunk
    _YieldStep --> ToolCallComplete
    _YieldStep --> ToolCallRequest
    _YieldStep --> ToolCallStatus
    _YieldStep --> TurnCancelled
    _YieldStep --> TurnComplete
    _CapturedRequest --> ClaudeGatewayShim
    _CapturedRequest --> ClaudeSDKExecutor
    _CapturedRequest --> DatabricksCredentials
    _RecordingUpstream --> ClaudeGatewayShim
    _RecordingUpstream --> ClaudeSDKExecutor
    _RecordingUpstream --> DatabricksCredentials
    TestBuildMcpTools --> ExecutorError
    TestBuildMcpTools --> TextChunk
    TestBuildMcpTools --> ToolCallComplete
    TestBuildMcpTools --> ToolCallRequest
    TestBuildMcpTools --> ToolCallStatus
    TestBuildMcpTools --> TurnComplete
    TestBuildMcpTools --> ClaudeSDKExecutor
    TestBuildMcpTools --> RetryPolicy
    TestBuildMcpTools --> PreparedClaudeCli
    TestBuildMcpTools --> SandboxPolicy
    TestBuildMcpTools --> DatabricksCredentials
    TestBuildMcpTools --> PolicyVerdictPayload
    TestBuildMcpTools --> CompactionComplete
    TestConstructor --> ExecutorError
    TestConstructor --> TextChunk
    TestConstructor --> ToolCallComplete
    TestConstructor --> ToolCallRequest
    TestConstructor --> ToolCallStatus
    TestConstructor --> TurnComplete
    TestConstructor --> ClaudeSDKExecutor
    TestConstructor --> RetryPolicy
    TestConstructor --> PreparedClaudeCli
    TestConstructor --> SandboxPolicy
    TestConstructor --> DatabricksCredentials
    TestConstructor --> PolicyVerdictPayload
    TestConstructor --> CompactionComplete
    TestEmptyPrompt --> ExecutorError
    TestEmptyPrompt --> TextChunk
    TestEmptyPrompt --> ToolCallComplete
    TestEmptyPrompt --> ToolCallRequest
    TestEmptyPrompt --> ToolCallStatus
    TestEmptyPrompt --> TurnComplete
    TestEmptyPrompt --> ClaudeSDKExecutor
    TestEmptyPrompt --> RetryPolicy
    TestEmptyPrompt --> PreparedClaudeCli
    TestEmptyPrompt --> SandboxPolicy
    TestEmptyPrompt --> DatabricksCredentials
    TestEmptyPrompt --> PolicyVerdictPayload
    TestEmptyPrompt --> CompactionComplete
    TestPromptExtraction --> ExecutorError
    TestPromptExtraction --> TextChunk
    TestPromptExtraction --> ToolCallComplete
    TestPromptExtraction --> ToolCallRequest
    TestPromptExtraction --> ToolCallStatus
    TestPromptExtraction --> TurnComplete
    TestPromptExtraction --> ClaudeSDKExecutor
    TestPromptExtraction --> RetryPolicy
    TestPromptExtraction --> PreparedClaudeCli
    TestPromptExtraction --> SandboxPolicy
    TestPromptExtraction --> DatabricksCredentials
    TestPromptExtraction --> PolicyVerdictPayload
    TestPromptExtraction --> CompactionComplete
    TestResolveGatewayEnv --> ExecutorError
    TestResolveGatewayEnv --> TextChunk
    TestResolveGatewayEnv --> ToolCallComplete
    TestResolveGatewayEnv --> ToolCallRequest
    TestResolveGatewayEnv --> ToolCallStatus
    TestResolveGatewayEnv --> TurnComplete
    TestResolveGatewayEnv --> ClaudeSDKExecutor
    TestResolveGatewayEnv --> RetryPolicy
    TestResolveGatewayEnv --> PreparedClaudeCli
    TestResolveGatewayEnv --> SandboxPolicy
    TestResolveGatewayEnv --> DatabricksCredentials
    TestResolveGatewayEnv --> PolicyVerdictPayload
    TestResolveGatewayEnv --> CompactionComplete
    TestSkillsFilterTranslation --> ExecutorError
    TestSkillsFilterTranslation --> TextChunk
    TestSkillsFilterTranslation --> ToolCallComplete
    TestSkillsFilterTranslation --> ToolCallRequest
    TestSkillsFilterTranslation --> ToolCallStatus
    TestSkillsFilterTranslation --> TurnComplete
    TestSkillsFilterTranslation --> ClaudeSDKExecutor
    TestSkillsFilterTranslation --> RetryPolicy
    TestSkillsFilterTranslation --> PreparedClaudeCli
    TestSkillsFilterTranslation --> SandboxPolicy
    TestSkillsFilterTranslation --> DatabricksCredentials
    TestSkillsFilterTranslation --> PolicyVerdictPayload
    TestSkillsFilterTranslation --> CompactionComplete
    TestStreamEventStreaming --> ExecutorError
    TestStreamEventStreaming --> TextChunk
    TestStreamEventStreaming --> ToolCallComplete
    TestStreamEventStreaming --> ToolCallRequest
    TestStreamEventStreaming --> ToolCallStatus
    TestStreamEventStreaming --> TurnComplete
    TestStreamEventStreaming --> ClaudeSDKExecutor
    TestStreamEventStreaming --> RetryPolicy
    TestStreamEventStreaming --> PreparedClaudeCli
    TestStreamEventStreaming --> SandboxPolicy
    TestStreamEventStreaming --> DatabricksCredentials
    TestStreamEventStreaming --> PolicyVerdictPayload
    TestStreamEventStreaming --> CompactionComplete
    TestSystemMessages --> ExecutorError
    TestSystemMessages --> TextChunk
    TestSystemMessages --> ToolCallComplete
    TestSystemMessages --> ToolCallRequest
    TestSystemMessages --> ToolCallStatus
    TestSystemMessages --> TurnComplete
    TestSystemMessages --> ClaudeSDKExecutor
    TestSystemMessages --> RetryPolicy
    TestSystemMessages --> PreparedClaudeCli
    TestSystemMessages --> SandboxPolicy
    TestSystemMessages --> DatabricksCredentials
    TestSystemMessages --> PolicyVerdictPayload
    TestSystemMessages --> CompactionComplete
    TestToolCallPolicyGate --> ExecutorError
    TestToolCallPolicyGate --> TextChunk
    TestToolCallPolicyGate --> ToolCallComplete
    TestToolCallPolicyGate --> ToolCallRequest
    TestToolCallPolicyGate --> ToolCallStatus
    TestToolCallPolicyGate --> TurnComplete
    TestToolCallPolicyGate --> ClaudeSDKExecutor
    TestToolCallPolicyGate --> RetryPolicy
    TestToolCallPolicyGate --> PreparedClaudeCli
    TestToolCallPolicyGate --> SandboxPolicy
    TestToolCallPolicyGate --> DatabricksCredentials
    TestToolCallPolicyGate --> PolicyVerdictPayload
    TestToolCallPolicyGate --> CompactionComplete
    _ChunkedPipe --> CodexExecutor
    _ChunkedPipe --> DatabricksCredentials
    _ChunkedPipe --> ExecutorError
    _ChunkedPipe --> ReasoningChunk
    _ChunkedPipe --> TextChunk
    _ChunkedPipe --> ToolCallComplete
    _ChunkedPipe --> ToolCallRequest
    _ChunkedPipe --> ToolCallStatus
    _ChunkedPipe --> TurnComplete
    _FakeAppSession --> CodexExecutor
    _FakeAppSession --> DatabricksCredentials
    _FakeAppSession --> ExecutorError
    _FakeAppSession --> ReasoningChunk
    _FakeAppSession --> TextChunk
    _FakeAppSession --> ToolCallComplete
    _FakeAppSession --> ToolCallRequest
    _FakeAppSession --> ToolCallStatus
    _FakeAppSession --> TurnComplete
    _FakePipe --> CodexExecutor
    _FakePipe --> DatabricksCredentials
    _FakePipe --> ExecutorError
    _FakePipe --> ReasoningChunk
    _FakePipe --> TextChunk
    _FakePipe --> ToolCallComplete
    _FakePipe --> ToolCallRequest
    _FakePipe --> ToolCallStatus
    _FakePipe --> TurnComplete
    _FakeProcess --> CodexExecutor
    _FakeProcess --> DatabricksCredentials
    _FakeProcess --> ExecutorError
    _FakeProcess --> ReasoningChunk
    _FakeProcess --> TextChunk
    _FakeProcess --> ToolCallComplete
    _FakeProcess --> ToolCallRequest
    _FakeProcess --> ToolCallStatus
    _FakeProcess --> TurnComplete
    _FakeVersionProcess --> CodexExecutor
    _FakeVersionProcess --> DatabricksCredentials
    _FakeVersionProcess --> ExecutorError
    _FakeVersionProcess --> ReasoningChunk
    _FakeVersionProcess --> TextChunk
    _FakeVersionProcess --> ToolCallComplete
    _FakeVersionProcess --> ToolCallRequest
    _FakeVersionProcess --> ToolCallStatus
    _FakeVersionProcess --> TurnComplete
    _OverflowingPipe --> CodexExecutor
    _OverflowingPipe --> DatabricksCredentials
    _OverflowingPipe --> ExecutorError
    _OverflowingPipe --> ReasoningChunk
    _OverflowingPipe --> TextChunk
    _OverflowingPipe --> ToolCallComplete
    _OverflowingPipe --> ToolCallRequest
    _OverflowingPipe --> ToolCallStatus
    _OverflowingPipe --> TurnComplete
    TestCodexExecutor --> CodexExecutor
    TestCodexExecutor --> DatabricksCredentials
    TestCodexExecutor --> ExecutorError
    TestCodexExecutor --> ReasoningChunk
    TestCodexExecutor --> TextChunk
    TestCodexExecutor --> ToolCallComplete
    TestCodexExecutor --> ToolCallRequest
    TestCodexExecutor --> ToolCallStatus
    TestCodexExecutor --> TurnComplete
    _FakeCodexNativeClient --> CodexNativeExecutor
    _FakeCodexNativeClient --> ExecutorConfig
    _FakeCodexNativeClient --> ExecutorError
    _FakeCodexNativeClient --> TurnComplete
    _ApproveOnce --> CopilotExecutor
    _ApproveOnce --> CompactionComplete
    _ApproveOnce --> ExecutorConfig
    _ApproveOnce --> ExecutorError
    _ApproveOnce --> ReasoningChunk
    _ApproveOnce --> TextChunk
    _ApproveOnce --> ToolCallComplete
    _ApproveOnce --> ToolCallRequest
    _ApproveOnce --> ToolCallStatus
    _ApproveOnce --> TurnComplete
    _FakeEvent --> CopilotExecutor
    _FakeEvent --> CompactionComplete
    _FakeEvent --> ExecutorConfig
    _FakeEvent --> ExecutorError
    _FakeEvent --> ReasoningChunk
    _FakeEvent --> TextChunk
    _FakeEvent --> ToolCallComplete
    _FakeEvent --> ToolCallRequest
    _FakeEvent --> ToolCallStatus
    _FakeEvent --> TurnComplete
    _FakeSession --> CopilotExecutor
    _FakeSession --> CompactionComplete
    _FakeSession --> ExecutorConfig
    _FakeSession --> ExecutorError
    _FakeSession --> ReasoningChunk
    _FakeSession --> TextChunk
    _FakeSession --> ToolCallComplete
    _FakeSession --> ToolCallRequest
    _FakeSession --> ToolCallStatus
    _FakeSession --> TurnComplete
    _PermissionHandler --> CopilotExecutor
    _PermissionHandler --> CompactionComplete
    _PermissionHandler --> ExecutorConfig
    _PermissionHandler --> ExecutorError
    _PermissionHandler --> ReasoningChunk
    _PermissionHandler --> TextChunk
    _PermissionHandler --> ToolCallComplete
    _PermissionHandler --> ToolCallRequest
    _PermissionHandler --> ToolCallStatus
    _PermissionHandler --> TurnComplete
    _Reject --> CopilotExecutor
    _Reject --> CompactionComplete
    _Reject --> ExecutorConfig
    _Reject --> ExecutorError
    _Reject --> ReasoningChunk
    _Reject --> TextChunk
    _Reject --> ToolCallComplete
    _Reject --> ToolCallRequest
    _Reject --> ToolCallStatus
    _Reject --> TurnComplete
    _Unsub --> CopilotExecutor
    _Unsub --> CompactionComplete
    _Unsub --> ExecutorConfig
    _Unsub --> ExecutorError
    _Unsub --> ReasoningChunk
    _Unsub --> TextChunk
    _Unsub --> ToolCallComplete
    _Unsub --> ToolCallRequest
    _Unsub --> ToolCallStatus
    _Unsub --> TurnComplete
    TestContentExtraction --> CursorNativeExecutor
    TestContentExtraction --> ExecutorError
    TestExecutorCapabilities --> CursorNativeExecutor
    TestExecutorCapabilities --> ExecutorError
    TestForkPreamble --> CursorNativeExecutor
    TestForkPreamble --> ExecutorError
    TestRegistration --> CursorNativeExecutor
    TestRegistration --> ExecutorError
    TestRunTurnPreambleInjection --> CursorNativeExecutor
    TestRunTurnPreambleInjection --> ExecutorError
    FakeChat --> DatabricksExecutor
    FakeChat --> ExecutorConfig
    FakeChat --> ExecutorError
    FakeChat --> TextChunk
    FakeChat --> ToolCallRequest
    FakeChat --> TurnComplete
    FakeChat --> DatabricksAuthError
    FakeChat --> CodexExecutor
    FakeChat --> ClaudeSDKExecutor
    FakeClient --> DatabricksExecutor
    FakeClient --> ExecutorConfig
    FakeClient --> ExecutorError
    FakeClient --> TextChunk
    FakeClient --> ToolCallRequest
    FakeClient --> TurnComplete
    FakeClient --> DatabricksAuthError
    FakeClient --> CodexExecutor
    FakeClient --> ClaudeSDKExecutor
    FakeCompletions --> DatabricksExecutor
    FakeCompletions --> ExecutorConfig
    FakeCompletions --> ExecutorError
    FakeCompletions --> TextChunk
    FakeCompletions --> ToolCallRequest
    FakeCompletions --> TurnComplete
    FakeCompletions --> DatabricksAuthError
    FakeCompletions --> CodexExecutor
    FakeCompletions --> ClaudeSDKExecutor
    FakeDelta --> DatabricksExecutor
    FakeDelta --> ExecutorConfig
    FakeDelta --> ExecutorError
    FakeDelta --> TextChunk
    FakeDelta --> ToolCallRequest
    FakeDelta --> TurnComplete
    FakeDelta --> DatabricksAuthError
    FakeDelta --> CodexExecutor
    FakeDelta --> ClaudeSDKExecutor
    FakeFunctionDelta --> DatabricksExecutor
    FakeFunctionDelta --> ExecutorConfig
    FakeFunctionDelta --> ExecutorError
    FakeFunctionDelta --> TextChunk
    FakeFunctionDelta --> ToolCallRequest
    FakeFunctionDelta --> TurnComplete
    FakeFunctionDelta --> DatabricksAuthError
    FakeFunctionDelta --> CodexExecutor
    FakeFunctionDelta --> ClaudeSDKExecutor
    FakeStreamChoice --> DatabricksExecutor
    FakeStreamChoice --> ExecutorConfig
    FakeStreamChoice --> ExecutorError
    FakeStreamChoice --> TextChunk
    FakeStreamChoice --> ToolCallRequest
    FakeStreamChoice --> TurnComplete
    FakeStreamChoice --> DatabricksAuthError
    FakeStreamChoice --> CodexExecutor
    FakeStreamChoice --> ClaudeSDKExecutor
    FakeStreamChunk --> DatabricksExecutor
    FakeStreamChunk --> ExecutorConfig
    FakeStreamChunk --> ExecutorError
    FakeStreamChunk --> TextChunk
    FakeStreamChunk --> ToolCallRequest
    FakeStreamChunk --> TurnComplete
    FakeStreamChunk --> DatabricksAuthError
    FakeStreamChunk --> CodexExecutor
    FakeStreamChunk --> ClaudeSDKExecutor
    FakeToolCallDelta --> DatabricksExecutor
    FakeToolCallDelta --> ExecutorConfig
    FakeToolCallDelta --> ExecutorError
    FakeToolCallDelta --> TextChunk
    FakeToolCallDelta --> ToolCallRequest
    FakeToolCallDelta --> TurnComplete
    FakeToolCallDelta --> DatabricksAuthError
    FakeToolCallDelta --> CodexExecutor
    FakeToolCallDelta --> ClaudeSDKExecutor
    _StubSdkConfig --> DatabricksExecutor
    _StubSdkConfig --> ExecutorConfig
    _StubSdkConfig --> ExecutorError
    _StubSdkConfig --> TextChunk
    _StubSdkConfig --> ToolCallRequest
    _StubSdkConfig --> TurnComplete
    _StubSdkConfig --> DatabricksAuthError
    _StubSdkConfig --> CodexExecutor
    _StubSdkConfig --> ClaudeSDKExecutor
    TestConvertMessages --> DatabricksExecutor
    TestConvertMessages --> ExecutorConfig
    TestConvertMessages --> ExecutorError
    TestConvertMessages --> TextChunk
    TestConvertMessages --> ToolCallRequest
    TestConvertMessages --> TurnComplete
    TestConvertMessages --> DatabricksAuthError
    TestConvertMessages --> CodexExecutor
    TestConvertMessages --> ClaudeSDKExecutor
    TestConvertTools --> DatabricksExecutor
    TestConvertTools --> ExecutorConfig
    TestConvertTools --> ExecutorError
    TestConvertTools --> TextChunk
    TestConvertTools --> ToolCallRequest
    TestConvertTools --> TurnComplete
    TestConvertTools --> DatabricksAuthError
    TestConvertTools --> CodexExecutor
    TestConvertTools --> ClaudeSDKExecutor
    TestDatabricksExecutorConfig --> DatabricksExecutor
    TestDatabricksExecutorConfig --> ExecutorConfig
    TestDatabricksExecutorConfig --> ExecutorError
    TestDatabricksExecutorConfig --> TextChunk
    TestDatabricksExecutorConfig --> ToolCallRequest
    TestDatabricksExecutorConfig --> TurnComplete
    TestDatabricksExecutorConfig --> DatabricksAuthError
    TestDatabricksExecutorConfig --> CodexExecutor
    TestDatabricksExecutorConfig --> ClaudeSDKExecutor
    TestDatabricksExecutorErrors --> DatabricksExecutor
    TestDatabricksExecutorErrors --> ExecutorConfig
    TestDatabricksExecutorErrors --> ExecutorError
    TestDatabricksExecutorErrors --> TextChunk
    TestDatabricksExecutorErrors --> ToolCallRequest
    TestDatabricksExecutorErrors --> TurnComplete
    TestDatabricksExecutorErrors --> DatabricksAuthError
    TestDatabricksExecutorErrors --> CodexExecutor
    TestDatabricksExecutorErrors --> ClaudeSDKExecutor
    TestDatabricksExecutorMultiTurn --> DatabricksExecutor
    TestDatabricksExecutorMultiTurn --> ExecutorConfig
    TestDatabricksExecutorMultiTurn --> ExecutorError
    TestDatabricksExecutorMultiTurn --> TextChunk
    TestDatabricksExecutorMultiTurn --> ToolCallRequest
    TestDatabricksExecutorMultiTurn --> TurnComplete
    TestDatabricksExecutorMultiTurn --> DatabricksAuthError
    TestDatabricksExecutorMultiTurn --> CodexExecutor
    TestDatabricksExecutorMultiTurn --> ClaudeSDKExecutor
    TestDatabricksExecutorTextResponse --> DatabricksExecutor
    TestDatabricksExecutorTextResponse --> ExecutorConfig
    TestDatabricksExecutorTextResponse --> ExecutorError
    TestDatabricksExecutorTextResponse --> TextChunk
    TestDatabricksExecutorTextResponse --> ToolCallRequest
    TestDatabricksExecutorTextResponse --> TurnComplete
    TestDatabricksExecutorTextResponse --> DatabricksAuthError
    TestDatabricksExecutorTextResponse --> CodexExecutor
    TestDatabricksExecutorTextResponse --> ClaudeSDKExecutor
    TestDatabricksExecutorToolCalls --> DatabricksExecutor
    TestDatabricksExecutorToolCalls --> ExecutorConfig
    TestDatabricksExecutorToolCalls --> ExecutorError
    TestDatabricksExecutorToolCalls --> TextChunk
    TestDatabricksExecutorToolCalls --> ToolCallRequest
    TestDatabricksExecutorToolCalls --> TurnComplete
    TestDatabricksExecutorToolCalls --> DatabricksAuthError
    TestDatabricksExecutorToolCalls --> CodexExecutor
    TestDatabricksExecutorToolCalls --> ClaudeSDKExecutor
    _AcceptingInjectionExecutor --> Executor
    _AcceptingInjectionExecutor --> LLMErrorDetail
    _AcceptingInjectionExecutor --> RetryableLLMError
    _AcceptingInjectionExecutor --> ExecutorAdapter
    _AcceptingInjectionExecutor --> HarnessApp
    _AcceptingInjectionExecutor --> ToolCallRequest
    _AcceptingInjectionExecutor --> ToolCallComplete
    _AcceptingInjectionExecutor --> ToolCallStatus
    _AcceptingInjectionExecutor --> ExecutorConfig
    _AcceptingInjectionExecutor --> TurnComplete
    _AcceptingInjectionExecutor --> TurnContext
    _AcceptingInjectionExecutor --> CreateResponseRequest
    _AcceptingInjectionExecutor --> InjectionConsumedEvent
    _CapturingExecutor --> Executor
    _CapturingExecutor --> ExecutorConfig
    _CapturingExecutor --> ExecutorError
    _CapturingExecutor --> ExecutorEvent
    _CapturingExecutor --> MockExecutor
    _CapturingExecutor --> ToolCallComplete
    _CapturingExecutor --> ToolCallRequest
    _CapturingExecutor --> ToolCallStatus
    _CapturingExecutor --> TurnCancelled
    _CapturingExecutor --> TurnComplete
    _CapturingExecutor --> ExecutorAdapter
    _InterruptTrackingExecutor --> Executor
    _InterruptTrackingExecutor --> LLMErrorDetail
    _InterruptTrackingExecutor --> RetryableLLMError
    _InterruptTrackingExecutor --> ExecutorAdapter
    _InterruptTrackingExecutor --> HarnessApp
    _InterruptTrackingExecutor --> ToolCallRequest
    _InterruptTrackingExecutor --> ToolCallComplete
    _InterruptTrackingExecutor --> ToolCallStatus
    _InterruptTrackingExecutor --> ExecutorConfig
    _InterruptTrackingExecutor --> TurnComplete
    _InterruptTrackingExecutor --> TurnContext
    _InterruptTrackingExecutor --> CreateResponseRequest
    _InterruptTrackingExecutor --> InjectionConsumedEvent
    _OneInjectionCtx --> Executor
    _OneInjectionCtx --> LLMErrorDetail
    _OneInjectionCtx --> RetryableLLMError
    _OneInjectionCtx --> ExecutorAdapter
    _OneInjectionCtx --> HarnessApp
    _OneInjectionCtx --> ToolCallRequest
    _OneInjectionCtx --> ToolCallComplete
    _OneInjectionCtx --> ToolCallStatus
    _OneInjectionCtx --> ExecutorConfig
    _OneInjectionCtx --> TurnComplete
    _OneInjectionCtx --> TurnContext
    _OneInjectionCtx --> CreateResponseRequest
    _OneInjectionCtx --> InjectionConsumedEvent
    _ParsedSSEEvent --> Executor
    _ParsedSSEEvent --> LLMErrorDetail
    _ParsedSSEEvent --> RetryableLLMError
    _ParsedSSEEvent --> ExecutorAdapter
    _ParsedSSEEvent --> HarnessApp
    _ParsedSSEEvent --> ToolCallRequest
    _ParsedSSEEvent --> ToolCallComplete
    _ParsedSSEEvent --> ToolCallStatus
    _ParsedSSEEvent --> ExecutorConfig
    _ParsedSSEEvent --> TurnComplete
    _ParsedSSEEvent --> TurnContext
    _ParsedSSEEvent --> CreateResponseRequest
    _ParsedSSEEvent --> InjectionConsumedEvent
    _RecordingTurnContext --> Executor
    _RecordingTurnContext --> LLMErrorDetail
    _RecordingTurnContext --> RetryableLLMError
    _RecordingTurnContext --> ExecutorAdapter
    _RecordingTurnContext --> HarnessApp
    _RecordingTurnContext --> ToolCallRequest
    _RecordingTurnContext --> ToolCallComplete
    _RecordingTurnContext --> ToolCallStatus
    _RecordingTurnContext --> ExecutorConfig
    _RecordingTurnContext --> TurnComplete
    _RecordingTurnContext --> TurnContext
    _RecordingTurnContext --> CreateResponseRequest
    _RecordingTurnContext --> InjectionConsumedEvent
    _StubExecutor --> Executor
    _StubExecutor --> LLMErrorDetail
    _StubExecutor --> RetryableLLMError
    _StubExecutor --> ExecutorAdapter
    _StubExecutor --> HarnessApp
    _StubExecutor --> ToolCallRequest
    _StubExecutor --> ToolCallComplete
    _StubExecutor --> ToolCallStatus
    _StubExecutor --> ExecutorConfig
    _StubExecutor --> TurnComplete
    _StubExecutor --> TurnContext
    _StubExecutor --> CreateResponseRequest
    _StubExecutor --> InjectionConsumedEvent
    TestMockExecutor --> MockExecutor
    TestMockExecutor --> TextChunk
    TestMockExecutor --> ToolCallRequest
    TestMockExecutor --> TurnComplete
    TestSplitTransientTail --> MockExecutor
    TestSplitTransientTail --> TextChunk
    TestSplitTransientTail --> ToolCallRequest
    TestSplitTransientTail --> TurnComplete
    _AskVerdict --> ExecutorError
    _AskVerdict --> TextChunk
    _AskVerdict --> TurnComplete
    _AskVerdict --> GooseExecutor
    _FakeOSEnv --> ExecutorError
    _FakeOSEnv --> TextChunk
    _FakeOSEnv --> TurnComplete
    _FakeOSEnv --> GooseExecutor
    _FakeOSEnv --> SandboxPolicy
    TestPopulateHermesHome --> ExecutorConfig
    TestPopulateHermesHome --> ExecutorError
    TestPopulateHermesHome --> TextChunk
    TestPopulateHermesHome --> TurnComplete
    TestPopulateHermesHome --> HermesExecutor
    TestUtils --> ExecutorConfig
    TestUtils --> ExecutorError
    TestUtils --> TextChunk
    TestUtils --> TurnComplete
    TestUtils --> HermesExecutor
    _FakeProcess --> ExecutorError
    _FakeProcess --> TextChunk
    _FakeProcess --> ToolCallComplete
    _FakeProcess --> ToolCallRequest
    _FakeProcess --> TurnComplete
    _FakeProcess --> KimiExecutor
    _FakeStderr --> ExecutorError
    _FakeStderr --> TextChunk
    _FakeStderr --> ToolCallComplete
    _FakeStderr --> ToolCallRequest
    _FakeStderr --> TurnComplete
    _FakeStderr --> KimiExecutor
    _FakeStdout --> ExecutorError
    _FakeStdout --> TextChunk
    _FakeStdout --> ToolCallComplete
    _FakeStdout --> ToolCallRequest
    _FakeStdout --> TurnComplete
    _FakeStdout --> KimiExecutor
    TestContentExtraction --> KimiNativeExecutor
    TestExecutorCapabilities --> KimiNativeExecutor
    TestSettlePaneReadiness --> KimiNativeExecutor
    _FakeTransport --> ExecutorConfig
    _FakeTransport --> ExecutorError
    _FakeTransport --> TurnComplete
    _FakeTransport --> NativeServerHarness
    FakeClient --> ExecutorConfig
    FakeClient --> ExecutorError
    FakeClient --> TextChunk
    FakeClient --> ToolCallRequest
    FakeClient --> TurnComplete
    FakeClient --> OpenResponsesExecutor
    FakeClient --> RetryPolicy
    FakeClient --> DatabricksCredentials
    FakeFunctionCallItem --> ExecutorConfig
    FakeFunctionCallItem --> ExecutorError
    FakeFunctionCallItem --> TextChunk
    FakeFunctionCallItem --> ToolCallRequest
    FakeFunctionCallItem --> TurnComplete
    FakeFunctionCallItem --> OpenResponsesExecutor
    FakeFunctionCallItem --> RetryPolicy
    FakeFunctionCallItem --> DatabricksCredentials
    FakeIncomplete --> ExecutorConfig
    FakeIncomplete --> ExecutorError
    FakeIncomplete --> TextChunk
    FakeIncomplete --> ToolCallRequest
    FakeIncomplete --> TurnComplete
    FakeIncomplete --> OpenResponsesExecutor
    FakeIncomplete --> RetryPolicy
    FakeIncomplete --> DatabricksCredentials
    FakeMessageItem --> ExecutorConfig
    FakeMessageItem --> ExecutorError
    FakeMessageItem --> TextChunk
    FakeMessageItem --> ToolCallRequest
    FakeMessageItem --> TurnComplete
    FakeMessageItem --> OpenResponsesExecutor
    FakeMessageItem --> RetryPolicy
    FakeMessageItem --> DatabricksCredentials
    FakeResponse --> ExecutorConfig
    FakeResponse --> ExecutorError
    FakeResponse --> TextChunk
    FakeResponse --> ToolCallRequest
    FakeResponse --> TurnComplete
    FakeResponse --> OpenResponsesExecutor
    FakeResponse --> RetryPolicy
    FakeResponse --> DatabricksCredentials
    FakeResponsesAPI --> ExecutorConfig
    FakeResponsesAPI --> ExecutorError
    FakeResponsesAPI --> TextChunk
    FakeResponsesAPI --> ToolCallRequest
    FakeResponsesAPI --> TurnComplete
    FakeResponsesAPI --> OpenResponsesExecutor
    FakeResponsesAPI --> RetryPolicy
    FakeResponsesAPI --> DatabricksCredentials
    FakeTextPart --> ExecutorConfig
    FakeTextPart --> ExecutorError
    FakeTextPart --> TextChunk
    FakeTextPart --> ToolCallRequest
    FakeTextPart --> TurnComplete
    FakeTextPart --> OpenResponsesExecutor
    FakeTextPart --> RetryPolicy
    FakeTextPart --> DatabricksCredentials
    TestConvertMessages --> ExecutorConfig
    TestConvertMessages --> ExecutorError
    TestConvertMessages --> TextChunk
    TestConvertMessages --> ToolCallRequest
    TestConvertMessages --> TurnComplete
    TestConvertMessages --> OpenResponsesExecutor
    TestConvertMessages --> RetryPolicy
    TestConvertMessages --> DatabricksCredentials
    TestConvertTools --> ExecutorConfig
    TestConvertTools --> ExecutorError
    TestConvertTools --> TextChunk
    TestConvertTools --> ToolCallRequest
    TestConvertTools --> TurnComplete
    TestConvertTools --> OpenResponsesExecutor
    TestConvertTools --> RetryPolicy
    TestConvertTools --> DatabricksCredentials
    TestDatabricksBaseUrl --> ExecutorConfig
    TestDatabricksBaseUrl --> ExecutorError
    TestDatabricksBaseUrl --> TextChunk
    TestDatabricksBaseUrl --> ToolCallRequest
    TestDatabricksBaseUrl --> TurnComplete
    TestDatabricksBaseUrl --> OpenResponsesExecutor
    TestDatabricksBaseUrl --> RetryPolicy
    TestDatabricksBaseUrl --> DatabricksCredentials
    TestNormalizeResponseOutput --> ExecutorConfig
    TestNormalizeResponseOutput --> ExecutorError
    TestNormalizeResponseOutput --> TextChunk
    TestNormalizeResponseOutput --> ToolCallRequest
    TestNormalizeResponseOutput --> TurnComplete
    TestNormalizeResponseOutput --> OpenResponsesExecutor
    TestNormalizeResponseOutput --> RetryPolicy
    TestNormalizeResponseOutput --> DatabricksCredentials
    TestOpenAIClientConfig --> ExecutorConfig
    TestOpenAIClientConfig --> ExecutorError
    TestOpenAIClientConfig --> TextChunk
    TestOpenAIClientConfig --> ToolCallRequest
    TestOpenAIClientConfig --> TurnComplete
    TestOpenAIClientConfig --> OpenResponsesExecutor
    TestOpenAIClientConfig --> RetryPolicy
    TestOpenAIClientConfig --> DatabricksCredentials
    TestOpenResponsesExecutor --> ExecutorConfig
    TestOpenResponsesExecutor --> ExecutorError
    TestOpenResponsesExecutor --> TextChunk
    TestOpenResponsesExecutor --> ToolCallRequest
    TestOpenResponsesExecutor --> TurnComplete
    TestOpenResponsesExecutor --> OpenResponsesExecutor
    TestOpenResponsesExecutor --> RetryPolicy
    TestOpenResponsesExecutor --> DatabricksCredentials
    _FakeAgent --> ExecutorConfig
    _FakeAgent --> ExecutorError
    _FakeAgent --> TextChunk
    _FakeAgent --> ToolCallComplete
    _FakeAgent --> ToolCallRequest
    _FakeAgent --> ToolCallStatus
    _FakeAgent --> TurnComplete
    _FakeAgent --> OpenAIAgentsSDKExecutor
    _FakeAgent --> DatabricksAuthError
    _FakeAgent --> CompactionComplete
    _FakeCompactionItem --> ExecutorConfig
    _FakeCompactionItem --> ExecutorError
    _FakeCompactionItem --> TextChunk
    _FakeCompactionItem --> ToolCallComplete
    _FakeCompactionItem --> ToolCallRequest
    _FakeCompactionItem --> ToolCallStatus
    _FakeCompactionItem --> TurnComplete
    _FakeCompactionItem --> OpenAIAgentsSDKExecutor
    _FakeCompactionItem --> DatabricksAuthError
    _FakeCompactionItem --> CompactionComplete
    _FakeFunctionTool --> ExecutorConfig
    _FakeFunctionTool --> ExecutorError
    _FakeFunctionTool --> TextChunk
    _FakeFunctionTool --> ToolCallComplete
    _FakeFunctionTool --> ToolCallRequest
    _FakeFunctionTool --> ToolCallStatus
    _FakeFunctionTool --> TurnComplete
    _FakeFunctionTool --> OpenAIAgentsSDKExecutor
    _FakeFunctionTool --> DatabricksAuthError
    _FakeFunctionTool --> CompactionComplete
    _FakeItemHelpers --> ExecutorConfig
    _FakeItemHelpers --> ExecutorError
    _FakeItemHelpers --> TextChunk
    _FakeItemHelpers --> ToolCallComplete
    _FakeItemHelpers --> ToolCallRequest
    _FakeItemHelpers --> ToolCallStatus
    _FakeItemHelpers --> TurnComplete
    _FakeItemHelpers --> OpenAIAgentsSDKExecutor
    _FakeItemHelpers --> DatabricksAuthError
    _FakeItemHelpers --> CompactionComplete
    _FakeMaxTurnsExceeded --> ExecutorConfig
    _FakeMaxTurnsExceeded --> ExecutorError
    _FakeMaxTurnsExceeded --> TextChunk
    _FakeMaxTurnsExceeded --> ToolCallComplete
    _FakeMaxTurnsExceeded --> ToolCallRequest
    _FakeMaxTurnsExceeded --> ToolCallStatus
    _FakeMaxTurnsExceeded --> TurnComplete
    _FakeMaxTurnsExceeded --> OpenAIAgentsSDKExecutor
    _FakeMaxTurnsExceeded --> DatabricksAuthError
    _FakeMaxTurnsExceeded --> CompactionComplete
    _FakeMessageOutputItem --> ExecutorConfig
    _FakeMessageOutputItem --> ExecutorError
    _FakeMessageOutputItem --> TextChunk
    _FakeMessageOutputItem --> ToolCallComplete
    _FakeMessageOutputItem --> ToolCallRequest
    _FakeMessageOutputItem --> ToolCallStatus
    _FakeMessageOutputItem --> TurnComplete
    _FakeMessageOutputItem --> OpenAIAgentsSDKExecutor
    _FakeMessageOutputItem --> DatabricksAuthError
    _FakeMessageOutputItem --> CompactionComplete
    _FakeModelSettings --> ExecutorConfig
    _FakeModelSettings --> ExecutorError
    _FakeModelSettings --> TextChunk
    _FakeModelSettings --> ToolCallComplete
    _FakeModelSettings --> ToolCallRequest
    _FakeModelSettings --> ToolCallStatus
    _FakeModelSettings --> TurnComplete
    _FakeModelSettings --> OpenAIAgentsSDKExecutor
    _FakeModelSettings --> DatabricksAuthError
    _FakeModelSettings --> CompactionComplete
    _FakeOpenAIProvider --> ExecutorConfig
    _FakeOpenAIProvider --> ExecutorError
    _FakeOpenAIProvider --> TextChunk
    _FakeOpenAIProvider --> ToolCallComplete
    _FakeOpenAIProvider --> ToolCallRequest
    _FakeOpenAIProvider --> ToolCallStatus
    _FakeOpenAIProvider --> TurnComplete
    _FakeOpenAIProvider --> OpenAIAgentsSDKExecutor
    _FakeOpenAIProvider --> DatabricksAuthError
    _FakeOpenAIProvider --> CompactionComplete
    _FakePromptTokensDetails --> ExecutorConfig
    _FakePromptTokensDetails --> ExecutorError
    _FakePromptTokensDetails --> TextChunk
    _FakePromptTokensDetails --> ToolCallComplete
    _FakePromptTokensDetails --> ToolCallRequest
    _FakePromptTokensDetails --> ToolCallStatus
    _FakePromptTokensDetails --> TurnComplete
    _FakePromptTokensDetails --> OpenAIAgentsSDKExecutor
    _FakePromptTokensDetails --> DatabricksAuthError
    _FakePromptTokensDetails --> CompactionComplete
    _FakeRawEvent --> ExecutorConfig
    _FakeRawEvent --> ExecutorError
    _FakeRawEvent --> TextChunk
    _FakeRawEvent --> ToolCallComplete
    _FakeRawEvent --> ToolCallRequest
    _FakeRawEvent --> ToolCallStatus
    _FakeRawEvent --> TurnComplete
    _FakeRawEvent --> OpenAIAgentsSDKExecutor
    _FakeRawEvent --> DatabricksAuthError
    _FakeRawEvent --> CompactionComplete
    _FakeRawResponse --> ExecutorConfig
    _FakeRawResponse --> ExecutorError
    _FakeRawResponse --> TextChunk
    _FakeRawResponse --> ToolCallComplete
    _FakeRawResponse --> ToolCallRequest
    _FakeRawResponse --> ToolCallStatus
    _FakeRawResponse --> TurnComplete
    _FakeRawResponse --> OpenAIAgentsSDKExecutor
    _FakeRawResponse --> DatabricksAuthError
    _FakeRawResponse --> CompactionComplete
    _FakeRawTextDelta --> ExecutorConfig
    _FakeRawTextDelta --> ExecutorError
    _FakeRawTextDelta --> TextChunk
    _FakeRawTextDelta --> ToolCallComplete
    _FakeRawTextDelta --> ToolCallRequest
    _FakeRawTextDelta --> ToolCallStatus
    _FakeRawTextDelta --> TurnComplete
    _FakeRawTextDelta --> OpenAIAgentsSDKExecutor
    _FakeRawTextDelta --> DatabricksAuthError
    _FakeRawTextDelta --> CompactionComplete
    _FakeReasoningItem --> ExecutorConfig
    _FakeReasoningItem --> ExecutorError
    _FakeReasoningItem --> TextChunk
    _FakeReasoningItem --> ToolCallComplete
    _FakeReasoningItem --> ToolCallRequest
    _FakeReasoningItem --> ToolCallStatus
    _FakeReasoningItem --> TurnComplete
    _FakeReasoningItem --> OpenAIAgentsSDKExecutor
    _FakeReasoningItem --> DatabricksAuthError
    _FakeReasoningItem --> CompactionComplete
    _FakeResult --> ExecutorConfig
    _FakeResult --> ExecutorError
    _FakeResult --> TextChunk
    _FakeResult --> ToolCallComplete
    _FakeResult --> ToolCallRequest
    _FakeResult --> ToolCallStatus
    _FakeResult --> TurnComplete
    _FakeResult --> OpenAIAgentsSDKExecutor
    _FakeResult --> DatabricksAuthError
    _FakeResult --> CompactionComplete
    _FakeRunConfig --> ExecutorConfig
    _FakeRunConfig --> ExecutorError
    _FakeRunConfig --> TextChunk
    _FakeRunConfig --> ToolCallComplete
    _FakeRunConfig --> ToolCallRequest
    _FakeRunConfig --> ToolCallStatus
    _FakeRunConfig --> TurnComplete
    _FakeRunConfig --> OpenAIAgentsSDKExecutor
    _FakeRunConfig --> DatabricksAuthError
    _FakeRunConfig --> CompactionComplete
    _FakeRunItemEvent --> ExecutorConfig
    _FakeRunItemEvent --> ExecutorError
    _FakeRunItemEvent --> TextChunk
    _FakeRunItemEvent --> ToolCallComplete
    _FakeRunItemEvent --> ToolCallRequest
    _FakeRunItemEvent --> ToolCallStatus
    _FakeRunItemEvent --> TurnComplete
    _FakeRunItemEvent --> OpenAIAgentsSDKExecutor
    _FakeRunItemEvent --> DatabricksAuthError
    _FakeRunItemEvent --> CompactionComplete
    _FakeRunner --> ExecutorConfig
    _FakeRunner --> ExecutorError
    _FakeRunner --> TextChunk
    _FakeRunner --> ToolCallComplete
    _FakeRunner --> ToolCallRequest
    _FakeRunner --> ToolCallStatus
    _FakeRunner --> TurnComplete
    _FakeRunner --> OpenAIAgentsSDKExecutor
    _FakeRunner --> DatabricksAuthError
    _FakeRunner --> CompactionComplete
    _FakeSessionSettings --> ExecutorConfig
    _FakeSessionSettings --> ExecutorError
    _FakeSessionSettings --> TextChunk
    _FakeSessionSettings --> ToolCallComplete
    _FakeSessionSettings --> ToolCallRequest
    _FakeSessionSettings --> ToolCallStatus
    _FakeSessionSettings --> TurnComplete
    _FakeSessionSettings --> OpenAIAgentsSDKExecutor
    _FakeSessionSettings --> DatabricksAuthError
    _FakeSessionSettings --> CompactionComplete
    _FakeSQLiteSession --> ExecutorConfig
    _FakeSQLiteSession --> ExecutorError
    _FakeSQLiteSession --> TextChunk
    _FakeSQLiteSession --> ToolCallComplete
    _FakeSQLiteSession --> ToolCallRequest
    _FakeSQLiteSession --> ToolCallStatus
    _FakeSQLiteSession --> TurnComplete
    _FakeSQLiteSession --> OpenAIAgentsSDKExecutor
    _FakeSQLiteSession --> DatabricksAuthError
    _FakeSQLiteSession --> CompactionComplete
    _FakeToolCallItem --> ExecutorConfig
    _FakeToolCallItem --> ExecutorError
    _FakeToolCallItem --> TextChunk
    _FakeToolCallItem --> ToolCallComplete
    _FakeToolCallItem --> ToolCallRequest
    _FakeToolCallItem --> ToolCallStatus
    _FakeToolCallItem --> TurnComplete
    _FakeToolCallItem --> OpenAIAgentsSDKExecutor
    _FakeToolCallItem --> DatabricksAuthError
    _FakeToolCallItem --> CompactionComplete
    _FakeToolCallRawItem --> ExecutorConfig
    _FakeToolCallRawItem --> ExecutorError
    _FakeToolCallRawItem --> TextChunk
    _FakeToolCallRawItem --> ToolCallComplete
    _FakeToolCallRawItem --> ToolCallRequest
    _FakeToolCallRawItem --> ToolCallStatus
    _FakeToolCallRawItem --> TurnComplete
    _FakeToolCallRawItem --> OpenAIAgentsSDKExecutor
    _FakeToolCallRawItem --> DatabricksAuthError
    _FakeToolCallRawItem --> CompactionComplete
    _FakeToolOutputItem --> ExecutorConfig
    _FakeToolOutputItem --> ExecutorError
    _FakeToolOutputItem --> TextChunk
    _FakeToolOutputItem --> ToolCallComplete
    _FakeToolOutputItem --> ToolCallRequest
    _FakeToolOutputItem --> ToolCallStatus
    _FakeToolOutputItem --> TurnComplete
    _FakeToolOutputItem --> OpenAIAgentsSDKExecutor
    _FakeToolOutputItem --> DatabricksAuthError
    _FakeToolOutputItem --> CompactionComplete
    _FakeToolOutputRawItem --> ExecutorConfig
    _FakeToolOutputRawItem --> ExecutorError
    _FakeToolOutputRawItem --> TextChunk
    _FakeToolOutputRawItem --> ToolCallComplete
    _FakeToolOutputRawItem --> ToolCallRequest
    _FakeToolOutputRawItem --> ToolCallStatus
    _FakeToolOutputRawItem --> TurnComplete
    _FakeToolOutputRawItem --> OpenAIAgentsSDKExecutor
    _FakeToolOutputRawItem --> DatabricksAuthError
    _FakeToolOutputRawItem --> CompactionComplete
    _FakeUsage --> ExecutorConfig
    _FakeUsage --> ExecutorError
    _FakeUsage --> TextChunk
    _FakeUsage --> ToolCallComplete
    _FakeUsage --> ToolCallRequest
    _FakeUsage --> ToolCallStatus
    _FakeUsage --> TurnComplete
    _FakeUsage --> OpenAIAgentsSDKExecutor
    _FakeUsage --> DatabricksAuthError
    _FakeUsage --> CompactionComplete
    TestOpenAIAgentsSDKExecutor --> ExecutorConfig
    TestOpenAIAgentsSDKExecutor --> ExecutorError
    TestOpenAIAgentsSDKExecutor --> TextChunk
    TestOpenAIAgentsSDKExecutor --> ToolCallComplete
    TestOpenAIAgentsSDKExecutor --> ToolCallRequest
    TestOpenAIAgentsSDKExecutor --> ToolCallStatus
    TestOpenAIAgentsSDKExecutor --> TurnComplete
    TestOpenAIAgentsSDKExecutor --> OpenAIAgentsSDKExecutor
    TestOpenAIAgentsSDKExecutor --> DatabricksAuthError
    TestOpenAIAgentsSDKExecutor --> CompactionComplete
    _FakeServer --> ExecutorError
    _FakeServer --> TurnComplete
    _FakeServer --> OpenCodeNativeExecutor
    _FakeProcess --> DatabricksCredentials
    _FakeProcess --> ExecutorConfig
    _FakeProcess --> ExecutorError
    _FakeProcess --> ReasoningChunk
    _FakeProcess --> TextChunk
    _FakeProcess --> ToolCallComplete
    _FakeProcess --> ToolCallRequest
    _FakeProcess --> ToolCallStatus
    _FakeProcess --> TurnComplete
    _FakeProcess --> PiExecutor
    _FakeProcess --> PolicyVerdictPayload
    _FakeProcess --> SandboxPolicy
    _FakeStreamReader --> DatabricksCredentials
    _FakeStreamReader --> ExecutorConfig
    _FakeStreamReader --> ExecutorError
    _FakeStreamReader --> ReasoningChunk
    _FakeStreamReader --> TextChunk
    _FakeStreamReader --> ToolCallComplete
    _FakeStreamReader --> ToolCallRequest
    _FakeStreamReader --> ToolCallStatus
    _FakeStreamReader --> TurnComplete
    _FakeStreamReader --> PiExecutor
    _FakeStreamReader --> PolicyVerdictPayload
    _FakeStreamReader --> SandboxPolicy
    _FakeStreamWriter --> DatabricksCredentials
    _FakeStreamWriter --> ExecutorConfig
    _FakeStreamWriter --> ExecutorError
    _FakeStreamWriter --> ReasoningChunk
    _FakeStreamWriter --> TextChunk
    _FakeStreamWriter --> ToolCallComplete
    _FakeStreamWriter --> ToolCallRequest
    _FakeStreamWriter --> ToolCallStatus
    _FakeStreamWriter --> TurnComplete
    _FakeStreamWriter --> PiExecutor
    _FakeStreamWriter --> PolicyVerdictPayload
    _FakeStreamWriter --> SandboxPolicy
    TestBlockedToolDetection --> DatabricksCredentials
    TestBlockedToolDetection --> ExecutorConfig
    TestBlockedToolDetection --> ExecutorError
    TestBlockedToolDetection --> ReasoningChunk
    TestBlockedToolDetection --> TextChunk
    TestBlockedToolDetection --> ToolCallComplete
    TestBlockedToolDetection --> ToolCallRequest
    TestBlockedToolDetection --> ToolCallStatus
    TestBlockedToolDetection --> TurnComplete
    TestBlockedToolDetection --> PiExecutor
    TestBlockedToolDetection --> PolicyVerdictPayload
    TestBlockedToolDetection --> SandboxPolicy
    TestBuildEnvAndDir --> DatabricksCredentials
    TestBuildEnvAndDir --> ExecutorConfig
    TestBuildEnvAndDir --> ExecutorError
    TestBuildEnvAndDir --> ReasoningChunk
    TestBuildEnvAndDir --> TextChunk
    TestBuildEnvAndDir --> ToolCallComplete
    TestBuildEnvAndDir --> ToolCallRequest
    TestBuildEnvAndDir --> ToolCallStatus
    TestBuildEnvAndDir --> TurnComplete
    TestBuildEnvAndDir --> PiExecutor
    TestBuildEnvAndDir --> PolicyVerdictPayload
    TestBuildEnvAndDir --> SandboxPolicy
    TestBuildModelsJson --> DatabricksCredentials
    TestBuildModelsJson --> ExecutorConfig
    TestBuildModelsJson --> ExecutorError
    TestBuildModelsJson --> ReasoningChunk
    TestBuildModelsJson --> TextChunk
    TestBuildModelsJson --> ToolCallComplete
    TestBuildModelsJson --> ToolCallRequest
    TestBuildModelsJson --> ToolCallStatus
    TestBuildModelsJson --> TurnComplete
    TestBuildModelsJson --> PiExecutor
    TestBuildModelsJson --> PolicyVerdictPayload
    TestBuildModelsJson --> SandboxPolicy
    TestClose --> DatabricksCredentials
    TestClose --> ExecutorConfig
    TestClose --> ExecutorError
    TestClose --> ReasoningChunk
    TestClose --> TextChunk
    TestClose --> ToolCallComplete
    TestClose --> ToolCallRequest
    TestClose --> ToolCallStatus
    TestClose --> TurnComplete
    TestClose --> PiExecutor
    TestClose --> PolicyVerdictPayload
    TestClose --> SandboxPolicy
    TestGateNativeTool --> DatabricksCredentials
    TestGateNativeTool --> ExecutorConfig
    TestGateNativeTool --> ExecutorError
    TestGateNativeTool --> ReasoningChunk
    TestGateNativeTool --> TextChunk
    TestGateNativeTool --> ToolCallComplete
    TestGateNativeTool --> ToolCallRequest
    TestGateNativeTool --> ToolCallStatus
    TestGateNativeTool --> TurnComplete
    TestGateNativeTool --> PiExecutor
    TestGateNativeTool --> PolicyVerdictPayload
    TestGateNativeTool --> SandboxPolicy
    TestGenerateExtensionJs --> DatabricksCredentials
    TestGenerateExtensionJs --> ExecutorConfig
    TestGenerateExtensionJs --> ExecutorError
    TestGenerateExtensionJs --> ReasoningChunk
    TestGenerateExtensionJs --> TextChunk
    TestGenerateExtensionJs --> ToolCallComplete
    TestGenerateExtensionJs --> ToolCallRequest
    TestGenerateExtensionJs --> ToolCallStatus
    TestGenerateExtensionJs --> TurnComplete
    TestGenerateExtensionJs --> PiExecutor
    TestGenerateExtensionJs --> PolicyVerdictPayload
    TestGenerateExtensionJs --> SandboxPolicy
    TestPiExecutorConstructor --> DatabricksCredentials
    TestPiExecutorConstructor --> ExecutorConfig
    TestPiExecutorConstructor --> ExecutorError
    TestPiExecutorConstructor --> ReasoningChunk
    TestPiExecutorConstructor --> TextChunk
    TestPiExecutorConstructor --> ToolCallComplete
    TestPiExecutorConstructor --> ToolCallRequest
    TestPiExecutorConstructor --> ToolCallStatus
    TestPiExecutorConstructor --> TurnComplete
    TestPiExecutorConstructor --> PiExecutor
    TestPiExecutorConstructor --> PolicyVerdictPayload
    TestPiExecutorConstructor --> SandboxPolicy
    TestPiProviderForModel --> DatabricksCredentials
    TestPiProviderForModel --> ExecutorConfig
    TestPiProviderForModel --> ExecutorError
    TestPiProviderForModel --> ReasoningChunk
    TestPiProviderForModel --> TextChunk
    TestPiProviderForModel --> ToolCallComplete
    TestPiProviderForModel --> ToolCallRequest
    TestPiProviderForModel --> ToolCallStatus
    TestPiProviderForModel --> TurnComplete
    TestPiProviderForModel --> PiExecutor
    TestPiProviderForModel --> PolicyVerdictPayload
    TestPiProviderForModel --> SandboxPolicy
    TestPiRpcSession --> DatabricksCredentials
    TestPiRpcSession --> ExecutorConfig
    TestPiRpcSession --> ExecutorError
    TestPiRpcSession --> ReasoningChunk
    TestPiRpcSession --> TextChunk
    TestPiRpcSession --> ToolCallComplete
    TestPiRpcSession --> ToolCallRequest
    TestPiRpcSession --> ToolCallStatus
    TestPiRpcSession --> TurnComplete
    TestPiRpcSession --> PiExecutor
    TestPiRpcSession --> PolicyVerdictPayload
    TestPiRpcSession --> SandboxPolicy
    TestResolveModel --> DatabricksCredentials
    TestResolveModel --> ExecutorConfig
    TestResolveModel --> ExecutorError
    TestResolveModel --> ReasoningChunk
    TestResolveModel --> TextChunk
    TestResolveModel --> ToolCallComplete
    TestResolveModel --> ToolCallRequest
    TestResolveModel --> ToolCallStatus
    TestResolveModel --> TurnComplete
    TestResolveModel --> PiExecutor
    TestResolveModel --> PolicyVerdictPayload
    TestResolveModel --> SandboxPolicy
    TestRunTurn --> DatabricksCredentials
    TestRunTurn --> ExecutorConfig
    TestRunTurn --> ExecutorError
    TestRunTurn --> ReasoningChunk
    TestRunTurn --> TextChunk
    TestRunTurn --> ToolCallComplete
    TestRunTurn --> ToolCallRequest
    TestRunTurn --> ToolCallStatus
    TestRunTurn --> TurnComplete
    TestRunTurn --> PiExecutor
    TestRunTurn --> PolicyVerdictPayload
    TestRunTurn --> SandboxPolicy
    TestSanitizeSchema --> DatabricksCredentials
    TestSanitizeSchema --> ExecutorConfig
    TestSanitizeSchema --> ExecutorError
    TestSanitizeSchema --> ReasoningChunk
    TestSanitizeSchema --> TextChunk
    TestSanitizeSchema --> ToolCallComplete
    TestSanitizeSchema --> ToolCallRequest
    TestSanitizeSchema --> ToolCallStatus
    TestSanitizeSchema --> TurnComplete
    TestSanitizeSchema --> PiExecutor
    TestSanitizeSchema --> PolicyVerdictPayload
    TestSanitizeSchema --> SandboxPolicy
    TestSessionManagement --> DatabricksCredentials
    TestSessionManagement --> ExecutorConfig
    TestSessionManagement --> ExecutorError
    TestSessionManagement --> ReasoningChunk
    TestSessionManagement --> TextChunk
    TestSessionManagement --> ToolCallComplete
    TestSessionManagement --> ToolCallRequest
    TestSessionManagement --> ToolCallStatus
    TestSessionManagement --> TurnComplete
    TestSessionManagement --> PiExecutor
    TestSessionManagement --> PolicyVerdictPayload
    TestSessionManagement --> SandboxPolicy
    TestToolServer --> DatabricksCredentials
    TestToolServer --> ExecutorConfig
    TestToolServer --> ExecutorError
    TestToolServer --> ReasoningChunk
    TestToolServer --> TextChunk
    TestToolServer --> ToolCallComplete
    TestToolServer --> ToolCallRequest
    TestToolServer --> ToolCallStatus
    TestToolServer --> TurnComplete
    TestToolServer --> PiExecutor
    TestToolServer --> PolicyVerdictPayload
    TestToolServer --> SandboxPolicy
    TestFunctionPolicy --> MockExecutor
    TestFunctionPolicy --> PolicyAction
    TestFunctionPolicy --> PolicyResult
    TestFunctionPolicy --> PolicyRuntimeContext
    TestPromptPolicy --> MockExecutor
    TestPromptPolicy --> PolicyAction
    TestPromptPolicy --> PolicyResult
    TestPromptPolicy --> PolicyRuntimeContext
    TestRateLimitPolicy --> MockExecutor
    TestRateLimitPolicy --> PolicyAction
    TestRateLimitPolicy --> PolicyResult
    TestRateLimitPolicy --> PolicyRuntimeContext
    _FakeOSEnv --> ExecutorError
    _FakeOSEnv --> TextChunk
    _FakeOSEnv --> TurnComplete
    _FakeOSEnv --> QwenExecutor
    _FakeOSEnv --> SandboxPolicy
    _TrackingAsyncClient --> DatabricksAuthError
    _TrackingMcpManager --> DatabricksAuthError
    _TrackingSyncClient --> DatabricksAuthError
    _TrackingTerminalRegistry --> DatabricksAuthError
    _BusyProgressHarness --> HarnessApp
    _BusyProgressHarness --> TurnContext
    _BusyProgressHarness --> CreateResponseRequest
    _CancellableHarness --> HarnessApp
    _CancellableHarness --> TurnContext
    _CancellableHarness --> CreateResponseRequest
    _ElicitationHarness --> HarnessApp
    _ElicitationHarness --> TurnContext
    _ElicitationHarness --> CreateResponseRequest
    _FastHeartbeatHarness --> HarnessApp
    _FastHeartbeatHarness --> TurnContext
    _FastHeartbeatHarness --> CreateResponseRequest
    _InjectionHarness --> HarnessApp
    _InjectionHarness --> TurnContext
    _InjectionHarness --> CreateResponseRequest
    _NativeToolEmittingHarness --> HarnessApp
    _NativeToolEmittingHarness --> TurnContext
    _NativeToolEmittingHarness --> CreateResponseRequest
    _SlowStreamHarness --> HarnessApp
    _SlowStreamHarness --> TurnContext
    _SlowStreamHarness --> CreateResponseRequest
    _ToolDispatchHarness --> HarnessApp
    _ToolDispatchHarness --> TurnContext
    _ToolDispatchHarness --> CreateResponseRequest
    _UsageHarness --> HarnessApp
    _UsageHarness --> TurnContext
    _UsageHarness --> CreateResponseRequest
    _WedgedFastHeartbeatHarness --> HarnessApp
    _WedgedFastHeartbeatHarness --> TurnContext
    _WedgedFastHeartbeatHarness --> CreateResponseRequest
    _WedgedHarness --> HarnessApp
    _WedgedHarness --> TurnContext
    _WedgedHarness --> CreateResponseRequest
    _ParsedSSEEvent --> HarnessApp
    _ParsedSSEEvent --> TurnContext
    RetryPolicy --> _NeverRaisedError
    RetryPolicy --> _PendingTool
    RetryPolicy --> _AntigravitySessionState
    RetryPolicy --> AntigravityExecutor
    RetryPolicy --> _Process
    RetryPolicy --> _CancelScope
    RetryPolicy --> _TaskGroup
    RetryPolicy --> _TaskHandle
    RetryPolicy --> _ClaudeQuery
    RetryPolicy --> _Stream
    RetryPolicy --> _ClaudeTransport
    RetryPolicy --> _ClaudeClient
    RetryPolicy --> _StreamEventObj
    RetryPolicy --> _AssistantMessageObj
    RetryPolicy --> _UserMessageObj
    RetryPolicy --> _ResultMessageObj
    RetryPolicy --> _SystemMessageObj
    RetryPolicy --> _TextBlockObj
    RetryPolicy --> _ToolUseBlockObj
    RetryPolicy --> _ToolResultBlockObj
    RetryPolicy --> _ClaudeSDK
    RetryPolicy --> _ClaudeClientState
    RetryPolicy --> PreparedClaudeCli
    RetryPolicy --> _ResolvedSkills
    RetryPolicy --> ClaudeSDKExecutor
    RetryPolicy --> _Process
    RetryPolicy --> _PendingToolResult
    RetryPolicy --> _CodexAppServerSession
    RetryPolicy --> _CodexSessionState
    RetryPolicy --> _AppSessionFactory
    RetryPolicy --> CodexExecutor
    RetryPolicy --> _SDKSession
    RetryPolicy --> _AgentsSDK
    RetryPolicy --> _RunResult
    RetryPolicy --> _RunState
    RetryPolicy --> _StreamEvent
    RetryPolicy --> _RawResponseEvent
    RetryPolicy --> _RawResponseData
    RetryPolicy --> _RunItemEvent
    RetryPolicy --> _RunItem
    RetryPolicy --> _ToolCallRawItem
    RetryPolicy --> _ToolCallOutputRawItem
    RetryPolicy --> _CallModelData
    RetryPolicy --> _ModelInputData
    RetryPolicy --> _ShellCommandBearerAuth
    RetryPolicy --> _AgentsSessionState
    RetryPolicy --> _SanitizingSession
    RetryPolicy --> RawToolItemParts
    RetryPolicy --> _ReasoningBlockFilterStream
    RetryPolicy --> _ReasoningBlockFilterCompletions
    RetryPolicy --> _ReasoningBlockFilterChat
    RetryPolicy --> OpenAIAgentsSDKExecutor
    RetryPolicy --> OpenResponsesExecutor
    RetryPolicy --> _ResponsesSessionState
    RetryPolicy --> _ToolServer
    RetryPolicy --> _PiRpcSession
    RetryPolicy --> _PiSessionState
    RetryPolicy --> BlockedCheck
    RetryPolicy --> PiSubprocessConfig
    RetryPolicy --> SandboxedPiCli
    RetryPolicy --> PiExecutor
    RetryPolicy --> _ResponsesNamespace
    RetryPolicy --> _OverflowTokens
    RetryPolicy --> TestPromptExtraction
    RetryPolicy --> TestConstructor
    RetryPolicy --> TestBuildMcpTools
    RetryPolicy --> TestResolveGatewayEnv
    RetryPolicy --> TestEmptyPrompt
    RetryPolicy --> TestSystemMessages
    RetryPolicy --> TestSkillsFilterTranslation
    RetryPolicy --> TestStreamEventStreaming
    RetryPolicy --> TestToolCallPolicyGate
    RetryPolicy --> FakeTextPart
    RetryPolicy --> FakeMessageItem
    RetryPolicy --> FakeFunctionCallItem
    RetryPolicy --> FakeIncomplete
    RetryPolicy --> FakeResponse
    RetryPolicy --> FakeResponsesAPI
    RetryPolicy --> FakeClient
    RetryPolicy --> TestConvertTools
    RetryPolicy --> TestConvertMessages
    RetryPolicy --> TestNormalizeResponseOutput
    RetryPolicy --> TestOpenResponsesExecutor
    RetryPolicy --> TestOpenAIClientConfig
    RetryPolicy --> TestDatabricksBaseUrl
```

## Relationships

- [[Community 3]] (490 shared connections)
- [[Community 4]] (268 shared connections)
- [[Community 8]] (184 shared connections)
- [[Community 11]] (184 shared connections)
- [[Community 19]] (162 shared connections)
- [[Auth Config]] (97 shared connections)
- [[Community 14]] (19 shared connections)
- [[App Server Goals]] (14 shared connections)
- [[Community 1]] (10 shared connections)
- [[Community 16]] (1 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_rpc.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_rpc.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_message_display_hook.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_message_display_hook.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_app_server.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_app_server.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cursor_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cursor_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\hermes_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/hermes_native_forwarder.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\_subprocess_lifecycle.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/_subprocess_lifecycle.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\antigravity_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/antigravity_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\antigravity_harness.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/antigravity_harness.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\antigravity_native_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/antigravity_native_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\antigravity_native_harness.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/antigravity_native_harness.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\async_utils.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/async_utils.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\claude_gateway_shim.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/claude_gateway_shim.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\claude_native_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/claude_native_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\claude_native_harness.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/claude_native_harness.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\claude_sdk_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/claude_sdk_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\claude_sdk_harness.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/claude_sdk_harness.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\codex_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/codex_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\codex_harness.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/codex_harness.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\codex_native_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/codex_native_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\codex_native_harness.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/codex_native_harness.py)

## Audit Trail

- EXTRACTED: 11688 (23%)
- INFERRED: 39352 (77%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*