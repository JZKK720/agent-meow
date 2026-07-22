# Auth Config

> 8603 nodes · cohesion 0.00

## Key Concepts

- **str** (1991 connections)
- [len()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/monacoCodeEditor-BzxvY4cV.js#L832) (1802 connections)
- [startsWith()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/index-D0w-K1tO.js#L43) (622 connections)
- [sleep()](file:///C:/Users/1/github-pr/agent-meow/tests/resources/examples/_shared/tool_functions.py#L150) (577 connections)
- [.set()](file:///C:/Users/1/github-pr/agent-meow/tests/server/test_performance_metrics.py#L142) (515 connections)
- [run()](file:///C:/Users/1/github-pr/agent-meow/web/src/store/chatStore.test.ts#L7411) (467 connections)
- [pop()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/monacoCodeEditor-BzxvY4cV.js#L15) (444 connections)
- [AntigravityRpcError](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_rpc.py#L491) (398 connections)
- [list](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/TipTapTaskList.test.ts#L56) (376 connections)
- [exists](file:///C:/Users/1/github-pr/agent-meow/web/src/hooks/useWorkspaceChangedFiles.test.tsx#L731) (363 connections)
- [.replace()](file:///C:/Users/1/github-pr/agent-meow/tests/cli/test_cli.py#L2169) (327 connections)
- [split](file:///C:/Users/1/github-pr/agent-meow/web/src/pages/ChatPage.tsx#L4420) (322 connections)
- [range](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/codeViewerHelpers.test.ts#L407) (307 connections)
- [.add()](file:///C:/Users/1/github-pr/agent-meow/tests/tools/builtins/test_update_comment.py#L32) (295 connections)
- **RuntimeError** (292 connections)
- [test_app_sessions_native.py](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_sessions_native.py#L1) (264 connections)
- [.wait()](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_modal.py#L145) (254 connections)
- [ClaudeTranscriptItem](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_bridge.py#L289) (246 connections)
- [ClaudeMessageDelta](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_bridge.py#L477) (241 connections)
- [Int()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/index-D0w-K1tO.js#L694) (239 connections)
- [PendingInteraction](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_steps.py#L201) (218 connections)
- [open](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/MarkdownRichTextViewer.test.tsx#L299) (216 connections)
- [create_runner_app()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/app.py#L7875) (207 connections)
- [OutboundEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_steps.py#L65) (197 connections)
- [.cancel()](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_cwsandbox.py#L75) (189 connections)
- *... and 8578 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class PassthroughStream {
        +agentBundle.test.ts()
        +.constructor()
    }
    class Deliver {
        +antigravity_native_interactions.py()
        +.__call__()
    }
    class NativeAntigravityLaunch {
        +antigravity_native_launch.py()
    }
    class _ReaderState {
        +antigravity_native_reader.py()
    }
    class AntigravityRpcError {
        +antigravity_native_rpc.py()
    }
    class OutboundEvent {
        +antigravity_native_steps.py()
    }
    class PendingInteraction {
        +antigravity_native_steps.py()
    }
    class _ToolCallIdAllocator {
        +antigravity_native_steps.py()
        +.claim_call_id()
        +.match_output_id()
    }
    class RenderedLines {
        +banner.py()
    }
    class ClaudeHookRecord {
        +claude_native_bridge.py()
    }
    class ClaudeMessageDelta {
        +claude_native_bridge.py()
    }
    class ClaudeTranscriptItem {
        +claude_native_bridge.py()
    }
    class HookReadResult {
        +claude_native_bridge.py()
    }
    class TranscriptReadResult {
        +claude_native_bridge.py()
    }
    class DeltaForwardState {
        +claude_native_forwarder.py()
    }
    class _DeltaOrderingState {
        +claude_native_forwarder.py()
    }
    class _ForwardDedupeState {
        +claude_native_forwarder.py()
    }
    class _ForwardedDeltaText {
        +claude_native_forwarder.py()
    }
    class _ForwardHealth {
        +claude_native_forwarder.py()
    }
    class HookForwardState {
        +claude_native_forwarder.py()
    }
    class _PostRetryDecision {
        +claude_native_forwarder.py()
    }
    class _PostRetryEntry {
        +claude_native_forwarder.py()
    }
    class _PostRetryTracker {
        +claude_native_forwarder.py()
        +.__init__()
        +.retry_delay_s()
        +.clear()
        +.record_failure()
    }
    class SubagentEntry {
        +claude_native_forwarder.py()
    }
    class SubagentForwardState {
        +claude_native_forwarder.py()
    }
    class _TranscriptCostCacheEntry {
        +claude_native_forwarder.py()
    }
    class TranscriptForwardState {
        +claude_native_forwarder.py()
    }
    class CliLogContext {
        +cli_diagnostics.py()
    }
    class _LoggingStreamSnapshot {
        +cli_diagnostics.py()
    }
    class _RedactingFormatter {
        +cli_diagnostics.py()
        +.format()
    }
    class _RedactingStderr {
        +cli_diagnostics.py()
        +.__init__()
        +.write()
        +.flush()
        +.close()
        +.isatty()
    }
    class _CodexForwarderState {
        +codex_native_forwarder.py()
        +.note_resume_response()
        +.note_thread_settings_updated()
        +.record_completed_plan()
        +.mark_prompted()
        +.plan_prompt_context()
        +.session_for_child_thread()
        +.note_child_thread()
        +.note_parent_rotation()
        +.note_pending_child_thread()
    }
    class PreparedCodexTerminal {
        +codex_native.py()
    }
    class CodexNativeProcessEntry {
        +codex_native_process_registry.py()
    }
    class MockedCodexNativeSession {
        +conftest.py()
    }
    class DataUriParts {
        +_content.py()
    }
    class _PaneMetadata {
        +control_bridge.py()
    }
    class _ForwardState {
        +cursor_native_forwarder.py()
    }
    class _MirrorItem {
        +cursor_native_forwarder.py()
    }
    class _ModelMirrorState {
        +cursor_native_forwarder.py()
    }
    class CursorApprovalPrompt {
        +cursor_native_permissions.py()
    }
    class CursorPendingToolCall {
        +cursor_native_permissions.py()
    }
    class _UsageAccumulator {
        +cursor_native_usage.py()
        +.add_line()
        +.seen_count()
    }
    class _ClassifiedWheels {
        +deploy.py()
    }
    class _PreResolvedHarnessElicitation {
        +_elicitation_registry.py()
    }
    class _ManagedMintTokenFactory {
        +_entry.py()
        +.__init__()
        +.__call__()
        +._still_valid_cached_token()
    }
    class _RunnerDatabricksAuth {
        +_entry.py()
        +.__init__()
        +.auth_flow()
    }
    class StoredFile {
        +file.py()
    }
    class CreatedWorktree {
        +git_worktree.py()
    }
    class _ShellOp {
        +github.py()
    }
    class GooseApprovalPrompt {
        +goose_native_permissions.py()
    }
    class HermesApprovalPrompt {
        +hermes_native_permissions.py()
    }
    class _InFlightTurn {
        +inflight_text.py()
    }
    class _NativeMessage {
        +inflight_text.py()
    }
    class AuthField {
        +__init__.py()
    }
    class AuthMode {
        +__init__.py()
    }
    class ModelInfo {
        +__init__.py()
    }
    class ProviderConfig {
        +__init__.py()
    }
    class _TermUIWithHiddenPrompt {
        +interactive.py()
    }
    class KiroPermissionRequest {
        +kiro_native_permissions.py()
    }
    class _PendingPermission {
        +kiro_native_permissions.py()
    }
    class _PermissionEvent {
        +kiro_native_permissions.py()
    }
    class _KiroConversationMessage {
        +kiro_native_session_forwarder.py()
    }
    class HarnessCredentials {
        +live_server.py()
    }
    class MascotPayload {
        +mascots.py()
    }
    class MockState {
        +mock_llm_server.py()
        +.__init__()
        +.get_queue()
        +.resolve_queue()
        +.resolve_queue_for_request()
        +.reset()
    }
    class QueuedResponse {
        +mock_llm_server.py()
    }
    class _ResponseQueue {
        +mock_llm_server.py()
        +.__init__()
        +.next()
        +.reset()
    }
    class ModalSandboxLauncher {
        +modal.py()
        +.__init__()
        +._resolve_sandbox_secrets()
        +._resolve()
        +.prepare()
        +.provision()
        +.attach()
        +.keep_alive()
        +.terminate()
        +.run()
    }
    class _TestContext {
        +_model_pools.py()
    }
    class OpenCodeGatewayResolution {
        +opencode_native_provider.py()
    }
    class _HelperProcessClient {
        +os_env.py()
        +.__init__()
        +.request()
        +.close()
        +._request_locked()
        +._ensure_started_locked()
        +._start_locked()
        +._helper_exit_detail_locked()
        +._stop_locked()
        +._start_egress_proxy_locked()
    }
    class _Connection {
        +presence.py()
    }
    class _ViewerEntry {
        +presence.py()
    }
    class _ProcessLike {
        +_proc.py()
        +.terminate()
        +.kill()
    }
    class _HarnessEndpoint {
        +process_manager.py()
        +.spawn_args()
        +.make_transport()
        +.can_connect()
        +.harden()
        +.cleanup()
    }
    class _SubprocessEntry {
        +process_manager.py()
        +.__init__()
    }
    class _ForwardState {
        +qwen_native_forwarder.py()
    }
    class _MirrorItem {
        +qwen_native_forwarder.py()
    }
    class _ControlEvent {
        +qwen_native_permissions.py()
    }
    class QwenApprovalRequest {
        +qwen_native_permissions.py()
    }
    class LocalServer {
        +_server.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +._start()
        +._find_project_root()
        +._wait_for_ready()
        +._stop()
    }
    class CodexResponsesSidecar {
        +sidecar_harness.py()
        +.__init__()
        +.requests()
        +.close()
        +._command()
        +._read_stdout_line()
        +._drain_stderr()
        +.stderr_tail()
    }
    class SnapshotField {
        +_snapshot.py()
    }
    class ToolState {
        +_state.py()
        +.__init__()
        +.get()
        +.set()
        +.delete()
        +.keys()
        +.__contains__()
        +._path_for()
    }
    class ExtractionError {
        +tar_utils.py()
    }
    class _DeliverRecorder {
        +test_antigravity_native_interactions.py()
        +.__init__()
        +.__call__()
    }
    class _InjectTuiRecorder {
        +test_antigravity_native_interactions.py()
        +.__init__()
        +.__call__()
    }
    class TestAgyBinaryPath {
        +test_antigravity_native_launch.py()
        +.test_returns_path_from_which()
        +.test_returns_fallback_when_which_none()
        +.test_raises_when_not_found()
        +.test_error_mentions_fallback_path()
    }
    class TestBuildAgyLaunch {
        +test_antigravity_native_launch.py()
        +.test_argv_starts_with_binary()
        +.test_fresh_env_is_empty()
        +.test_fresh_env_has_no_conversation_id()
        +.test_fresh_argv_no_conversation_flag()
        +.test_resume_argv_has_conversation_flag()
        +.test_resume_env_no_conversation_id()
        +.test_resume_without_conversation_id_raises()
        +.test_model_flag_present_when_given()
        +.test_model_flag_absent_when_none()
    }
    class TestResolveNativeAntigravityLaunch {
        +test_antigravity_native_launch.py()
        +.test_returns_subscription_when_credential_present()
        +.test_returns_subscription_when_credential_absent()
        +.test_passes_model_through()
        +.test_model_none_by_default()
        +.test_warns_when_no_credential()
    }
    class TestShouldSkipPermissions {
        +test_antigravity_native_launch.py()
        +.test_bypass_mode_true()
        +.test_non_bypass_interactive_false()
        +.test_non_bypass_headless_true()
        +.test_none_mode_interactive_false()
        +.test_none_mode_headless_true()
    }
    class _BlockingStream {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class _FrameScript {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class _PostSink {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
        +.item_types()
        +.statuses()
        +.message_roles()
        +.deltas()
        +.reasonings()
        +.event_types()
    }
    class _RaisingStream {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class _RaisingThenOk {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class _RotationFetchScript {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class _StepScript {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class _StopAfter {
        +test_antigravity_native_reader.py()
        +.__init__()
        +.__call__()
    }
    class TestAskQuestionDone {
        +test_antigravity_native_steps.py()
        +.test_returns_function_call_output()
        +.test_call_id_is_real_agy_id()
        +.test_step_index()
    }
    class TestAskQuestionWaiting {
        +test_antigravity_native_steps.py()
        +.test_waiting_emits_no_event()
    }
    class TestExecutionDiscriminator {
        +test_antigravity_native_steps.py()
        +.test_prefers_execution_id()
        +.test_falls_back_to_created_at()
        +.test_skips_empty_execution_id()
        +.test_none_when_no_metadata()
        +.test_none_when_no_discriminating_fields()
        +.test_real_fixture_has_execution_id()
    }
    class TestListDirectoryDone {
        +test_antigravity_native_steps.py()
        +.test_returns_one_function_call_output()
        +.test_call_id_is_real_agy_id()
        +.test_step_index()
    }
    class TestMapStepEmitsNoReasoning {
        +test_antigravity_native_steps.py()
        +.test_done_planner_with_thinking_emits_no_reasoning_item()
    }
    class TestModifiedResponsePrecedence {
        +test_antigravity_native_steps.py()
        +.test_modified_response_wins_when_different()
        +.test_response_used_when_modified_absent()
        +.test_response_used_when_modified_empty()
    }
    class TestOutputReasoningDeltaEvent {
        +test_antigravity_native_steps.py()
        +.test_shape_started_true()
        +.test_shape_started_false()
        +.test_no_message_id()
    }
    class TestPendingInteractionAskQuestionWaiting {
        +test_antigravity_native_steps.py()
        +.test_returns_not_none()
        +.test_kind_is_ask_question()
        +.test_trajectory_id()
        +.test_step_index()
        +.test_spec_is_ask_question_block()
        +.test_spec_questions_list()
        +.test_spec_question_text()
        +.test_spec_options_list()
        +.test_spec_option_id_and_text()
    }
    class TestPendingInteractionDoneReturnsNone {
        +test_antigravity_native_steps.py()
        +.test_ask_question_done_returns_none()
        +.test_run_command_done_returns_none()
    }
    class TestPendingInteractionIsMultiSelect {
        +test_antigravity_native_steps.py()
        +.test_fixture_is_multi_select_false()
        +.test_synthetic_is_multi_select_true()
        +.test_absent_arguments_json_defaults_false()
        +.test_malformed_arguments_json_defaults_false()
        +.test_input_step_not_mutated()
    }
    class TestPendingInteractionRunCommandWaiting {
        +test_antigravity_native_steps.py()
        +.test_returns_not_none()
        +.test_kind_is_permission()
        +.test_trajectory_id()
        +.test_step_index()
        +.test_spec_is_permission_block()
        +.test_spec_resource_action()
        +.test_spec_resource_target()
        +.test_spec_action_description()
    }
    class TestPlannerResponseError {
        +test_antigravity_native_steps.py()
        +.test_error_planner_emits_one_error_message()
        +.test_error_planner_includes_error_detail_when_present()
    }
    class TestPlannerResponseText {
        +test_antigravity_native_steps.py()
        +.test_returns_exactly_one_event()
        +.test_event_type_is_conversation_item()
        +.test_item_type_is_message()
        +.test_message_role_is_assistant()
        +.test_message_content_is_output_text()
        +.test_no_delta_event()
        +.test_step_index_from_fixture()
        +.test_response_id_stable()
    }
    class TestPlannerResponseToolCallAskQuestion {
        +test_antigravity_native_steps.py()
        +.test_returns_one_function_call()
        +.test_function_call_name()
        +.test_function_call_id_is_real_agy_id()
    }
    class TestPlannerResponseToolCallRunCommand {
        +test_antigravity_native_steps.py()
        +.test_returns_one_function_call()
        +.test_function_call_name()
        +.test_function_call_id_is_real_agy_id()
        +.test_function_call_arguments_strip_display_keys()
        +.test_no_delta_event()
        +.test_step_index()
    }
    class TestRealIdPairing {
        +test_antigravity_native_steps.py()
        +.test_planner_then_run_command_done_share_real_id()
        +.test_two_results_out_of_order_pair_by_real_id()
    }
    class TestRunCommandDone {
        +test_antigravity_native_steps.py()
        +.test_returns_one_event()
        +.test_event_type_is_conversation_item()
        +.test_item_type_is_function_call_output()
        +.test_output_from_combined_output_full()
        +.test_call_id_is_real_agy_id()
        +.test_step_index()
    }
    class TestRunCommandError {
        +test_antigravity_native_steps.py()
        +.test_error_emits_one_output_event()
        +.test_error_output_keyed_on_real_id()
        +.test_error_output_text_is_nonempty_marker()
        +.test_error_step_index()
    }
    class TestRunCommandWaiting {
        +test_antigravity_native_steps.py()
        +.test_waiting_emits_no_output_event()
        +.test_waiting_no_delta()
    }
    class TestSlotZeroStepIndex {
        +test_antigravity_native_steps.py()
        +.test_absent_step_index_emits_event_at_zero()
        +.test_string_encoded_step_index_accepted()
    }
    class TestSystemStepsSkipped {
        +test_antigravity_native_steps.py()
        +.test_checkpoint_returns_empty()
        +.test_conversation_history_returns_empty()
    }
    class TestToolResultClosure {
        +test_antigravity_native_steps.py()
        +.test_done_run_command_empty_output_still_closes()
        +.test_unmapped_tool_result_type_with_id_closes()
        +.test_system_step_without_tool_id_is_skipped()
    }
    class TestUserInputCommitted {
        +test_antigravity_native_steps.py()
        +.test_user_input_commits_user_message()
        +.test_user_input_no_delta()
        +.test_user_input_without_text_is_skipped()
    }
    class _FakeProcessManager {
        +test_app_sessions_native.py()
        +.__init__()
        +.get_client()
        +.has_session()
        +.has_active_turn()
        +.mark_turn_active()
        +.mark_in_flight()
        +.clear_in_flight()
        +.forward_cancel()
        +.release()
    }
    class _ScriptedHarnessClient {
        +test_app_sessions_native.py()
        +.__init__()
        +.stream()
        +.post()
    }
    class _NoPrefixReadFile {
        +test_claude_native_bridge.py()
        +.__init__()
        +.__enter__()
        +.__exit__()
        +.seek()
        +.tell()
        +.read()
        +.readline()
        +._assert_not_prefix_read()
    }
    class _CapturedDeltaPost {
        +test_claude_native_forwarder.py()
    }
    class _CapturedRequest {
        +test_claude_native_forwarder.py()
    }
    class _CountingAuth {
        +test_claude_native_forwarder.py()
        +.__init__()
        +.auth_flow()
    }
    class _RecordingHTTPServer {
        +test_claude_native_forwarder.py()
    }
    class _FailingRedirectedStderr {
        +test_cli_diagnostics.py()
        +.__init__()
        +.close()
    }
    class _LoggerSnapshot {
        +test_cli_diagnostics.py()
    }
    class _HostRun {
        +test_cli_host.py()
    }
    class _RecordingAgentCache {
        +test_cli.py()
        +.__init__()
        +.replace()
    }
    class _RecordingAgentStore {
        +test_cli.py()
        +.__init__()
        +.get_by_name()
        +.delete()
        +.create()
    }
    class _RecordingArtifactStore {
        +test_cli.py()
        +.__init__()
        +.put()
        +.delete()
    }
    class _FakeCodexClient {
        +test_codex_native_app_server.py()
        +.request()
    }
    class _Req {
        +test_codex_native_app_server.py()
    }
    class _SpawnRecorder {
        +test_codex_native_app_server.py()
        +._record()
        +.wait()
    }
    class TestModelFlagHelpers {
        +test_codex_native_app_server.py()
        +.test_model_flag_disabled_when_env_absent()
        +.test_supports_model_flag_true_when_help_lists_it()
        +.test_supports_model_flag_false_when_help_omits_it()
        +.test_supports_model_flag_false_when_probe_cannot_run()
        +.test_supports_model_flag_ignores_lookalike_options_and_prose()
    }
    class TestModelFlagPlumbing {
        +test_codex_native_app_server.py()
        +.test_flag_off_omits_model_flag_and_env()
        +.test_flag_on_with_cli_support_passes_global_model_flag()
        +.test_flag_on_without_cli_support_skips_model_flag()
        +.test_flag_in_spawn_env_alone_does_not_enable()
    }
    class TestPinCodexConfigModel {
        +test_codex_native_app_server.py()
        +.test_replaces_top_level_model_only()
        +.test_inserts_model_when_absent()
        +.test_materializes_symlink_without_touching_source()
        +.test_read_back_by_forwarder_mirror_source()
    }
    class _FakeCodexAppServerClient {
        +test_codex_native.py()
        +.__init__()
        +.connect()
        +.request()
        +.iter_events()
        +.respond()
        +.close()
    }
    class _FakeCodexWebSocket {
        +test_codex_native.py()
        +.__init__()
        +.send()
        +.__aiter__()
        +.__anext__()
        +.close()
    }
    class _FakeTerminalClient {
        +test_codex_native.py()
        +.__init__()
        +.post()
    }
    class _FlakyElicitationClient {
        +test_codex_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class _RecordingClient {
        +test_codex_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class _RecordingPostClient {
        +test_codex_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class _StatusClient {
        +test_codex_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class _PerThreadFakeCodexClient {
        +test_codex_native.py()
        +.__init__()
        +.request()
    }
    class FakeFileStore {
        +test_content_resolver.py()
        +.get()
    }
    class _FakeWebSocket {
        +test_control_bridge.py()
        +.__init__()
        +.send_bytes()
        +.receive()
        +.close()
    }
    class _FakeCompleted {
        +test_cursor_native_bridge.py()
        +.__init__()
    }
    class TestHooksConfig {
        +test_cursor_native_bridge.py()
        +.test_build_hooks_config_shape()
        +.test_build_hooks_config_quotes_spaced_paths()
        +.test_write_hooks_config_writes_project_scoped_file()
    }
    class TestInjectModelGate {
        +test_cursor_native_bridge.py()
        +.test_presses_enter_when_picker_matches()
        +.test_raises_without_enter_on_no_match()
        +.test_echoed_command_alone_does_not_satisfy_the_gate()
    }
    class TestBridge {
        +test_cursor_native_executor.py()
        +.test_bridge_dir_is_deterministic_and_session_scoped()
        +.test_spawn_env_carries_bridge_dir()
        +.test_tmux_target_round_trip()
        +.test_read_tmux_info_missing()
        +.test_build_mcp_config_registers_omnigent_relay()
        +.test_write_mcp_config_is_workspace_scoped()
        +.test_write_mcp_bridge_config_is_idempotent()
        +.test_cursor_project_key_matches_cursor_workspace_state()
        +.test_enable_mcp_for_workspace_removes_disabled_entry()
    }
    class TestPastePayload {
        +test_cursor_native_executor.py()
        +.test_newlines_become_cr()
        +.test_tab_kept_other_control_dropped()
        +.test_unicode_passthrough()
    }
    class _FakePoster {
        +test_cursor_native_forwarder.py()
        +.__init__()
        +.__call__()
    }
    class _PatchRecordingClient {
        +test_cursor_native_forwarder.py()
        +.__init__()
        +.patch()
    }
    class _RecordingClient {
        +test_cursor_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class TestBlobToItem {
        +test_cursor_native_forwarder.py()
        +.test_user_query_becomes_input_text_item()
        +.test_response_id_capped_at_column_width()
        +.test_assistant_text_becomes_output_text_item()
        +.test_assistant_without_prose_is_skipped()
        +.test_system_and_context_dump_are_skipped()
        +.test_binary_merkle_node_is_skipped()
        +.test_summary_rollup_becomes_compaction_completed()
        +.test_plain_string_user_without_marker_is_skipped()
    }
    class TestChatClaim {
        +test_cursor_native_forwarder.py()
        +.test_yields_to_earlier_live_session()
        +.test_unrelated_store_is_not_claimed()
        +.test_stale_sibling_claim_is_ignored()
    }
    class TestCompactionCompletedForwarding {
        +test_cursor_native_forwarder.py()
    }
    class TestDiscoverStore {
        +test_cursor_native_forwarder.py()
        +._seed_chat()
        +.test_picks_newest_chat_at_or_after_launch()
        +.test_excludes_chats_created_before_launch()
        +.test_falls_back_across_workspace_dirs()
        +.test_ambiguous_fallback_returns_none()
    }
    class TestForwardLoopExternalSessionId {
        +test_cursor_native_forwarder.py()
    }
    class TestForwardLoopPostFailures {
        +test_cursor_native_forwarder.py()
    }
    class TestForwardLoopPreseedResume {
        +test_cursor_native_forwarder.py()
    }
    class TestLastUsedModelFromMetaValue {
        +test_cursor_native_forwarder.py()
        +.test_decodes_hex_json()
        +.test_strips_whitespace()
        +.test_missing_field_is_none()
        +.test_empty_model_is_none()
        +.test_non_hex_text_is_none()
        +.test_bytes_value_is_decoded()
    }
    class TestPostModelChangeIfNew {
        +test_cursor_native_forwarder.py()
    }
    class TestPreseedResumeState {
        +test_cursor_native_forwarder.py()
        +._seed_chat()
        +.test_returns_false_when_store_absent()
        +.test_writes_store_path_and_current_rowid()
        +.test_empty_store_seeds_rowid_zero()
    }
    class TestStateRoundTrip {
        +test_cursor_native_forwarder.py()
        +.test_write_then_read()
        +.test_cold_default_when_absent()
        +.test_clear_removes_state()
    }
    class TestUnwrapUserQuery {
        +test_cursor_native_forwarder.py()
        +.test_extracts_inner_prompt_and_strips_control_bytes()
        +.test_context_dump_without_wrapper_is_skipped()
        +.test_empty_query_is_skipped()
        +.test_strips_injected_attachment_markers()
        +.test_strips_fork_history_preamble_block()
        +.test_embedded_close_tag_in_history_does_not_leak()
        +.test_user_message_containing_close_tag_is_preserved()
        +.test_unterminated_history_block_strips_to_end()
    }
    class _FakeAsyncCM {
        +test_cursor_native_permissions.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
    }
    class _QueueClient {
        +test_cursor_native_permissions.py()
        +.__init__()
        +.post()
    }
    class _StatusRecorder {
        +test_cursor_native_status.py()
        +.__init__()
        +.__call__()
    }
    class _CtxRecordingClient {
        +test_cursor_native_usage.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.post()
    }
    class TestClearUsageState {
        +test_cursor_native_usage.py()
        +.test_removes_log_and_state()
        +.test_noop_when_absent()
    }
    class TestForwardLoop {
        +test_cursor_native_usage.py()
        +.test_posts_cumulative_usage_and_persists()
        +.test_no_repost_when_unchanged()
        +.test_new_turn_triggers_followup_post()
        +.test_completed_turn_posts_idle_wake_edge()
        +.test_idle_posted_once_per_turn()
        +.test_restart_reposts_idle_for_dedup_not_skip()
        +.test_failed_post_is_not_persisted()
    }
    class TestNormalizeHookPayload {
        +test_cursor_native_usage.py()
        +.test_extracts_usage_fields()
        +.test_falls_back_to_conversation_id()
        +.test_skips_when_no_generation_id()
        +.test_skips_when_all_tokens_zero()
        +.test_omits_model_when_absent()
        +.test_coerces_and_floors_negative_tokens()
        +.test_non_dict_is_skipped()
    }
    class TestRecordUsageCli {
        +test_cursor_native_usage.py()
        +.test_cli_reads_stdin_appends_and_emits_continue()
        +.test_cli_never_fails_on_garbage_stdin()
        +.test_module_main_entrypoint()
    }
    class TestRecordUsagePayload {
        +test_cursor_native_usage.py()
        +.test_appends_one_line_per_turn()
        +.test_non_billable_payload_is_skipped()
    }
    class TestStateRoundTrip {
        +test_cursor_native_usage.py()
        +.test_write_then_read_preserves_totals_and_seen()
        +.test_missing_state_is_cold_default()
    }
    class TestUsageAccumulator {
        +test_cursor_native_usage.py()
        +.test_sums_per_turn_counts()
        +.test_dedups_by_generation_id()
        +.test_latest_model_wins()
        +.test_line_without_gen_id_is_ignored()
    }
    class TestUsagePostBody {
        +test_cursor_native_usage.py()
        +.test_shape_with_model()
        +.test_omits_model_when_none()
    }
    class _FakeClient {
        +test_goose_native_permissions.py()
        +.__init__()
        +.post()
    }
    class _Resp {
        +test_goose_native_permissions.py()
        +.__init__()
        +.json()
    }
    class _FakeClient {
        +test_hermes_native_permissions.py()
        +.__init__()
        +.post()
    }
    class _Resp {
        +test_hermes_native_permissions.py()
        +.__init__()
        +.json()
    }
    class TestApprovalKeystroke {
        +test_kimi_native_executor.py()
        +._stub_tmux()
        +.test_injects_digit_and_enter_when_menu_present()
        +.test_deny_key_selects_reject()
        +.test_skips_when_menu_absent()
        +.test_skips_when_tui_exited()
    }
    class TestPastePayload {
        +test_kimi_native_executor.py()
        +.test_newlines_become_cr()
        +.test_tab_kept_other_control_dropped()
        +.test_unicode_passthrough()
    }
    class TestDiscoverWire {
        +test_kimi_native_forwarder.py()
        +._make_session()
        +.test_picks_newest_matching_workspace()
        +.test_none_before_any_session()
        +.test_ignores_sessions_before_launch()
    }
    class TestState {
        +test_kimi_native_forwarder.py()
        +.test_round_trip_and_clear()
    }
    class _QueueClient {
        +test_kiro_native_permissions.py()
        +.__init__()
        +.post()
    }
    class TestLoaderOsEnvValidation {
        +test_loader.py()
        +.test_load_agent_def_preserves_egress_allow_private_destinations()
        +.test_load_agent_def_rejects_egress_rules_on_none()
        +.test_load_agent_def_rejects_start_in_scratch_with_sandbox_none()
        +.test_load_agent_def_rejects_start_in_scratch_with_fork()
        +.test_load_agent_def_rejects_allow_sandbox_override_with_egress_rules()
        +.test_load_agent_def_rejects_allow_sandbox_override_with_own_egress_rules()
        +.test_load_agent_def_rejects_non_bool_egress_allow_private_destinations()
        +.test_load_agent_def_parses_credential_proxy()
        +.test_load_agent_def_rejects_credential_proxy_without_egress_rules()
    }
    class _Procs {
        +test_local_server_lifecycle_e2e.py()
        +.__init__()
        +.spawn()
        +.track_pidfile()
        +.track_server_home()
    }
    class _CopyCall {
        +test_modal.py()
    }
    class _CreateCall {
        +test_modal.py()
    }
    class _ExecCall {
        +test_modal.py()
    }
    class _FakeFilesystem {
        +test_modal.py()
        +.__init__()
        +.copy_from_local()
    }
    class _FakeImage {
        +test_modal.py()
    }
    class _FakeModalState {
        +test_modal.py()
    }
    class _FakeNotFoundError {
        +test_modal.py()
    }
    class _FakeProcess {
        +test_modal.py()
        +.__init__()
        +.wait()
        +.poll()
    }
    class _FakeSandbox {
        +test_modal.py()
        +.__init__()
        +.exec()
        +.set_tags()
        +.poll()
    }
    class _FakeSecret {
        +test_modal.py()
    }
    class _FakeStream {
        +test_modal.py()
        +.__init__()
        +.__iter__()
        +.read()
    }
    class _LookupCall {
        +test_modal.py()
    }
    class _FakeClock {
        +test_native_forwarder_health.py()
        +.__init__()
        +.monotonic()
    }
    class _Resp {
        +test_native_subagent_inbox_delivery.py()
        +.__init__()
        +.json()
        +.raise_for_status()
    }
    class _SnapshotServerClient {
        +test_native_subagent_inbox_delivery.py()
        +.__init__()
        +.get()
    }
    class TestCopyTree {
        +test_os_env_fork.py()
        +.setUp()
        +.tearDown()
        +.test_files_are_copied()
        +.test_subdirectories_are_recreated()
        +.test_symlinks_are_copied_as_symlinks()
        +.test_empty_directory()
        +.test_writes_to_copy_dont_affect_original()
    }
    class TestForkedOSEnvironment {
        +test_os_env_fork.py()
        +.setUp()
        +.tearDown()
        +._make_env()
        +.test_read_sees_original_content()
        +.test_write_does_not_modify_original()
        +.test_edit_does_not_modify_original()
        +.test_write_new_file_does_not_appear_in_original()
        +.test_shell_does_not_modify_original()
        +.test_nested_file_isolation()
    }
    class _Fakes {
        +test_pane_reaper.py()
        +.__init__()
        +.is_busy()
        +.reap()
    }
    class _GetClient {
        +test_pi_native_resume_wiring.py()
        +.__init__()
        +.get()
    }
    class _FakeProc {
        +test_qwen_native_forwarder.py()
        +.__init__()
    }
    class _RecordingClient {
        +test_qwen_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class _QueueClient {
        +test_qwen_native_permissions.py()
        +.__init__()
        +.post()
    }
    class _ItemsClient {
        +test_qwen_native_runner.py()
        +.__init__()
        +.get()
    }
    class _RecordingClient {
        +test_qwen_native_runner.py()
        +.__init__()
        +.patch()
    }
    class _CapturingHost {
        +test_repl_fork_command.py()
        +.__init__()
        +.output()
        +.render_plain()
    }
    class _LegacyStubSession {
        +test_repl_fork_command.py()
    }
    class _StubClient {
        +test_repl_fork_command.py()
        +.__init__()
    }
    class _StubFmt {
        +test_repl_fork_command.py()
        +.welcome()
    }
    class _StubSessionsNamespace {
        +test_repl_fork_command.py()
        +.__init__()
        +.fork()
    }
    class _StubSessionWithId {
        +test_repl_fork_command.py()
        +.__init__()
        +.switch_session()
    }
    class _HeartbeatRunnerClient {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.stream()
    }
    class _RecordingLabelStore {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.set_labels()
        +.get_conversation()
    }
    class _ScriptedRunnerClient {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.stream()
    }
    class _TunnelCloseRunnerClient {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.stream()
    }
    class _TunnelCloseStreamResponse {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _GatedEscalation {
        +test_subagent_block_notifier.py()
        +.__init__()
        +.__call__()
        +.release()
    }
    class _RecordingDispatch {
        +test_subagent_block_notifier.py()
        +.__init__()
        +.__call__()
    }
    class _ResolveDuringDispatch {
        +test_subagent_block_notifier.py()
        +.__init__()
        +.__call__()
    }
    class _TimerPostRecorder {
        +test_tool_dispatch_timer.py()
        +.__init__()
        +.__call__()
    }
    class _StringFile {
        +test_wordmark.py()
        +.__init__()
        +.write()
        +.flush()
        +.getvalue()
    }
    class _CollectingFakeWebSocket {
        +test_ws_bridge.py()
        +.__init__()
        +.send_bytes()
    }
    class _ParkingFakeWebSocket {
        +test_ws_bridge.py()
        +.__init__()
        +.send_bytes()
        +.receive()
        +.close()
    }
    class _RecordingWebSocket {
        +test_ws_bridge.py()
        +.__init__()
        +.send_bytes()
    }
    class _ScriptedWebSocket {
        +test_ws_bridge.py()
        +.__init__()
        +.send_bytes()
        +.receive()
        +.close()
    }
    class SplitBinding {
        +_tmux_pane.py()
    }
    class _ResultParser {
        +web_search_duckduckgo.py()
        +.__init__()
        +.handle_starttag()
        +.handle_data()
        +.handle_endtag()
    }
    class _SpawnedPty {
        +ws_bridge.py()
    }
    Deliver --> AntigravityRpcError
    Deliver --> PendingInteraction
    NativeAntigravityLaunch --> TestAgyBinaryPath
    NativeAntigravityLaunch --> TestResolveNativeAntigravityLaunch
    NativeAntigravityLaunch --> TestBuildAgyLaunch
    NativeAntigravityLaunch --> TestShouldSkipPermissions
    _ReaderState --> AntigravityRpcError
    _ReaderState --> OutboundEvent
    _ReaderState --> PendingInteraction
    AntigravityRpcError --> Deliver
    AntigravityRpcError --> _ReaderState
    AntigravityRpcError --> _DeliverRecorder
    AntigravityRpcError --> _InjectTuiRecorder
    AntigravityRpcError --> _PostSink
    AntigravityRpcError --> _StepScript
    AntigravityRpcError --> _RaisingThenOk
    AntigravityRpcError --> _FrameScript
    AntigravityRpcError --> _RaisingStream
    AntigravityRpcError --> _StopAfter
    AntigravityRpcError --> _RotationFetchScript
    AntigravityRpcError --> _BlockingStream
    OutboundEvent --> _ReaderState
    OutboundEvent --> TestUserInputCommitted
    OutboundEvent --> TestPlannerResponseText
    OutboundEvent --> TestPlannerResponseError
    OutboundEvent --> TestPlannerResponseToolCallRunCommand
    OutboundEvent --> TestPlannerResponseToolCallAskQuestion
    OutboundEvent --> TestRunCommandDone
    OutboundEvent --> TestRunCommandWaiting
    OutboundEvent --> TestRunCommandError
    OutboundEvent --> TestToolResultClosure
    OutboundEvent --> TestListDirectoryDone
    OutboundEvent --> TestAskQuestionWaiting
    OutboundEvent --> TestAskQuestionDone
    OutboundEvent --> TestSystemStepsSkipped
    OutboundEvent --> TestSlotZeroStepIndex
    OutboundEvent --> TestModifiedResponsePrecedence
    OutboundEvent --> TestRealIdPairing
    OutboundEvent --> TestPendingInteractionAskQuestionWaiting
    OutboundEvent --> TestPendingInteractionRunCommandWaiting
    OutboundEvent --> TestPendingInteractionDoneReturnsNone
    OutboundEvent --> TestPendingInteractionIsMultiSelect
    OutboundEvent --> TestOutputReasoningDeltaEvent
    OutboundEvent --> TestMapStepEmitsNoReasoning
    OutboundEvent --> TestExecutionDiscriminator
    PendingInteraction --> Deliver
    PendingInteraction --> _ReaderState
    PendingInteraction --> _DeliverRecorder
    PendingInteraction --> _InjectTuiRecorder
    PendingInteraction --> _PostSink
    PendingInteraction --> _StepScript
    PendingInteraction --> _RaisingThenOk
    PendingInteraction --> _FrameScript
    PendingInteraction --> _RaisingStream
    PendingInteraction --> _StopAfter
    PendingInteraction --> _RotationFetchScript
    PendingInteraction --> _BlockingStream
    ClaudeHookRecord --> _ForwardedDeltaText
    ClaudeHookRecord --> _DeltaOrderingState
    ClaudeHookRecord --> _ForwardHealth
    ClaudeHookRecord --> HookForwardState
    ClaudeHookRecord --> SubagentEntry
    ClaudeHookRecord --> SubagentForwardState
    ClaudeHookRecord --> TranscriptForwardState
    ClaudeHookRecord --> DeltaForwardState
    ClaudeHookRecord --> _ForwardDedupeState
    ClaudeHookRecord --> _TranscriptCostCacheEntry
    ClaudeHookRecord --> _PostRetryEntry
    ClaudeHookRecord --> _PostRetryDecision
    ClaudeHookRecord --> _PostRetryTracker
    ClaudeMessageDelta --> _ForwardedDeltaText
    ClaudeMessageDelta --> _DeltaOrderingState
    ClaudeMessageDelta --> _ForwardHealth
    ClaudeMessageDelta --> HookForwardState
    ClaudeMessageDelta --> SubagentEntry
    ClaudeMessageDelta --> SubagentForwardState
    ClaudeMessageDelta --> TranscriptForwardState
    ClaudeMessageDelta --> DeltaForwardState
    ClaudeMessageDelta --> _ForwardDedupeState
    ClaudeMessageDelta --> _TranscriptCostCacheEntry
    ClaudeMessageDelta --> _PostRetryEntry
    ClaudeMessageDelta --> _PostRetryDecision
    ClaudeMessageDelta --> _PostRetryTracker
    ClaudeMessageDelta --> _RecordingHTTPServer
    ClaudeMessageDelta --> _CountingAuth
    ClaudeMessageDelta --> _CapturedRequest
    ClaudeMessageDelta --> _CapturedDeltaPost
    ClaudeTranscriptItem --> _ForwardedDeltaText
    ClaudeTranscriptItem --> _DeltaOrderingState
    ClaudeTranscriptItem --> _ForwardHealth
    ClaudeTranscriptItem --> HookForwardState
    ClaudeTranscriptItem --> SubagentEntry
    ClaudeTranscriptItem --> SubagentForwardState
    ClaudeTranscriptItem --> TranscriptForwardState
    ClaudeTranscriptItem --> DeltaForwardState
    ClaudeTranscriptItem --> _ForwardDedupeState
    ClaudeTranscriptItem --> _TranscriptCostCacheEntry
    ClaudeTranscriptItem --> _PostRetryEntry
    ClaudeTranscriptItem --> _PostRetryDecision
    ClaudeTranscriptItem --> _PostRetryTracker
    ClaudeTranscriptItem --> _RecordingHTTPServer
    ClaudeTranscriptItem --> _CountingAuth
    ClaudeTranscriptItem --> _CapturedRequest
    ClaudeTranscriptItem --> _CapturedDeltaPost
    HookReadResult --> _ForwardedDeltaText
    HookReadResult --> _DeltaOrderingState
    HookReadResult --> _ForwardHealth
    HookReadResult --> HookForwardState
    HookReadResult --> SubagentEntry
    HookReadResult --> SubagentForwardState
    HookReadResult --> TranscriptForwardState
    HookReadResult --> DeltaForwardState
    HookReadResult --> _ForwardDedupeState
    HookReadResult --> _TranscriptCostCacheEntry
    HookReadResult --> _PostRetryEntry
    HookReadResult --> _PostRetryDecision
    HookReadResult --> _PostRetryTracker
    TranscriptReadResult --> _ForwardedDeltaText
    TranscriptReadResult --> _DeltaOrderingState
    TranscriptReadResult --> _ForwardHealth
    TranscriptReadResult --> HookForwardState
    TranscriptReadResult --> SubagentEntry
    TranscriptReadResult --> SubagentForwardState
    TranscriptReadResult --> TranscriptForwardState
    TranscriptReadResult --> DeltaForwardState
    TranscriptReadResult --> _ForwardDedupeState
    TranscriptReadResult --> _TranscriptCostCacheEntry
    TranscriptReadResult --> _PostRetryEntry
    TranscriptReadResult --> _PostRetryDecision
    TranscriptReadResult --> _PostRetryTracker
    DeltaForwardState --> ClaudeHookRecord
    DeltaForwardState --> ClaudeMessageDelta
    DeltaForwardState --> ClaudeTranscriptItem
    DeltaForwardState --> HookReadResult
    DeltaForwardState --> TranscriptReadResult
    _DeltaOrderingState --> ClaudeHookRecord
    _DeltaOrderingState --> ClaudeMessageDelta
    _DeltaOrderingState --> ClaudeTranscriptItem
    _DeltaOrderingState --> HookReadResult
    _DeltaOrderingState --> TranscriptReadResult
    _ForwardDedupeState --> ClaudeHookRecord
    _ForwardDedupeState --> ClaudeMessageDelta
    _ForwardDedupeState --> ClaudeTranscriptItem
    _ForwardDedupeState --> HookReadResult
    _ForwardDedupeState --> TranscriptReadResult
    _ForwardedDeltaText --> ClaudeHookRecord
    _ForwardedDeltaText --> ClaudeMessageDelta
    _ForwardedDeltaText --> ClaudeTranscriptItem
    _ForwardedDeltaText --> HookReadResult
    _ForwardedDeltaText --> TranscriptReadResult
    _ForwardHealth --> ClaudeHookRecord
    _ForwardHealth --> ClaudeMessageDelta
    _ForwardHealth --> ClaudeTranscriptItem
    _ForwardHealth --> HookReadResult
    _ForwardHealth --> TranscriptReadResult
    HookForwardState --> ClaudeHookRecord
    HookForwardState --> ClaudeMessageDelta
    HookForwardState --> ClaudeTranscriptItem
    HookForwardState --> HookReadResult
    HookForwardState --> TranscriptReadResult
    _PostRetryDecision --> ClaudeHookRecord
    _PostRetryDecision --> ClaudeMessageDelta
    _PostRetryDecision --> ClaudeTranscriptItem
    _PostRetryDecision --> HookReadResult
    _PostRetryDecision --> TranscriptReadResult
    _PostRetryEntry --> ClaudeHookRecord
    _PostRetryEntry --> ClaudeMessageDelta
    _PostRetryEntry --> ClaudeTranscriptItem
    _PostRetryEntry --> HookReadResult
    _PostRetryEntry --> TranscriptReadResult
    _PostRetryTracker --> ClaudeHookRecord
    _PostRetryTracker --> ClaudeMessageDelta
    _PostRetryTracker --> ClaudeTranscriptItem
    _PostRetryTracker --> HookReadResult
    _PostRetryTracker --> TranscriptReadResult
    SubagentEntry --> ClaudeHookRecord
    SubagentEntry --> ClaudeMessageDelta
    SubagentEntry --> ClaudeTranscriptItem
    SubagentEntry --> HookReadResult
    SubagentEntry --> TranscriptReadResult
    SubagentForwardState --> ClaudeHookRecord
    SubagentForwardState --> ClaudeMessageDelta
    SubagentForwardState --> ClaudeTranscriptItem
    SubagentForwardState --> HookReadResult
    SubagentForwardState --> TranscriptReadResult
    _TranscriptCostCacheEntry --> ClaudeHookRecord
    _TranscriptCostCacheEntry --> ClaudeMessageDelta
    _TranscriptCostCacheEntry --> ClaudeTranscriptItem
    _TranscriptCostCacheEntry --> HookReadResult
    _TranscriptCostCacheEntry --> TranscriptReadResult
    TranscriptForwardState --> ClaudeHookRecord
    TranscriptForwardState --> ClaudeMessageDelta
    TranscriptForwardState --> ClaudeTranscriptItem
    TranscriptForwardState --> HookReadResult
    TranscriptForwardState --> TranscriptReadResult
    MockedCodexNativeSession --> CodexResponsesSidecar
    CursorApprovalPrompt --> _QueueClient
    CursorApprovalPrompt --> _FakeAsyncCM
    CursorPendingToolCall --> _QueueClient
    CursorPendingToolCall --> _FakeAsyncCM
    ModalSandboxLauncher --> _FakeNotFoundError
    ModalSandboxLauncher --> _ExecCall
    ModalSandboxLauncher --> _CopyCall
    ModalSandboxLauncher --> _LookupCall
    ModalSandboxLauncher --> _CreateCall
    ModalSandboxLauncher --> _FakeStream
    ModalSandboxLauncher --> _FakeProcess
    ModalSandboxLauncher --> _FakeFilesystem
    ModalSandboxLauncher --> _FakeSandbox
    ModalSandboxLauncher --> _FakeSecret
    ModalSandboxLauncher --> _FakeImage
    ModalSandboxLauncher --> _FakeModalState
    CodexResponsesSidecar --> MockedCodexNativeSession
    _DeliverRecorder --> AntigravityRpcError
    _DeliverRecorder --> PendingInteraction
    _InjectTuiRecorder --> AntigravityRpcError
    _InjectTuiRecorder --> PendingInteraction
    TestAgyBinaryPath --> NativeAntigravityLaunch
    TestBuildAgyLaunch --> NativeAntigravityLaunch
    TestResolveNativeAntigravityLaunch --> NativeAntigravityLaunch
    TestShouldSkipPermissions --> NativeAntigravityLaunch
    _BlockingStream --> AntigravityRpcError
    _BlockingStream --> PendingInteraction
    _FrameScript --> AntigravityRpcError
    _FrameScript --> PendingInteraction
    _PostSink --> AntigravityRpcError
    _PostSink --> PendingInteraction
    _RaisingStream --> AntigravityRpcError
    _RaisingStream --> PendingInteraction
    _RaisingThenOk --> AntigravityRpcError
    _RaisingThenOk --> PendingInteraction
    _RotationFetchScript --> AntigravityRpcError
    _RotationFetchScript --> PendingInteraction
    _StepScript --> AntigravityRpcError
    _StepScript --> PendingInteraction
    _StopAfter --> AntigravityRpcError
    _StopAfter --> PendingInteraction
    TestAskQuestionDone --> OutboundEvent
    TestAskQuestionWaiting --> OutboundEvent
    TestExecutionDiscriminator --> OutboundEvent
    TestListDirectoryDone --> OutboundEvent
    TestMapStepEmitsNoReasoning --> OutboundEvent
    TestModifiedResponsePrecedence --> OutboundEvent
    TestOutputReasoningDeltaEvent --> OutboundEvent
    TestPendingInteractionAskQuestionWaiting --> OutboundEvent
    TestPendingInteractionDoneReturnsNone --> OutboundEvent
    TestPendingInteractionIsMultiSelect --> OutboundEvent
    TestPendingInteractionRunCommandWaiting --> OutboundEvent
    TestPlannerResponseError --> OutboundEvent
    TestPlannerResponseText --> OutboundEvent
    TestPlannerResponseToolCallAskQuestion --> OutboundEvent
    TestPlannerResponseToolCallRunCommand --> OutboundEvent
    TestRealIdPairing --> OutboundEvent
    TestRunCommandDone --> OutboundEvent
    TestRunCommandError --> OutboundEvent
    TestRunCommandWaiting --> OutboundEvent
    TestSlotZeroStepIndex --> OutboundEvent
    TestSystemStepsSkipped --> OutboundEvent
    TestToolResultClosure --> OutboundEvent
    TestUserInputCommitted --> OutboundEvent
    _CapturedDeltaPost --> ClaudeMessageDelta
    _CapturedDeltaPost --> ClaudeTranscriptItem
    _CapturedRequest --> ClaudeMessageDelta
    _CapturedRequest --> ClaudeTranscriptItem
    _CountingAuth --> ClaudeMessageDelta
    _CountingAuth --> ClaudeTranscriptItem
    _RecordingHTTPServer --> ClaudeMessageDelta
    _RecordingHTTPServer --> ClaudeTranscriptItem
    _PerThreadFakeCodexClient <|-- _FakeCodexAppServerClient
    _FakeCodexAppServerClient <|-- _PerThreadFakeCodexClient
    _FakeAsyncCM --> CursorApprovalPrompt
    _FakeAsyncCM --> CursorPendingToolCall
    _QueueClient --> CursorApprovalPrompt
    _QueueClient --> CursorPendingToolCall
    _CopyCall --> ModalSandboxLauncher
    _CreateCall --> ModalSandboxLauncher
    _ExecCall --> ModalSandboxLauncher
    _FakeFilesystem --> ModalSandboxLauncher
    _FakeImage --> ModalSandboxLauncher
    _FakeModalState --> ModalSandboxLauncher
    _FakeNotFoundError --> ModalSandboxLauncher
    _FakeProcess --> ModalSandboxLauncher
    _FakeSandbox --> ModalSandboxLauncher
    _FakeSecret --> ModalSandboxLauncher
    _FakeStream --> ModalSandboxLauncher
    _LookupCall --> ModalSandboxLauncher
    _ParkingFakeWebSocket <|-- _CollectingFakeWebSocket
    _CollectingFakeWebSocket <|-- _ParkingFakeWebSocket
```

## Relationships

- [[Community 3]] (823 shared connections)
- [[Community 4]] (178 shared connections)
- [[Community 13]] (64 shared connections)
- [[Community 1]] (29 shared connections)
- [[Community 19]] (21 shared connections)
- [[Community 6]] (19 shared connections)
- [[Community 8]] (18 shared connections)
- [[Community 14]] (9 shared connections)
- [[Community 11]] (7 shared connections)
- [[Community 16]] (6 shared connections)
- [[Community 9]] (4 shared connections)
- [[Community 15]] (3 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\_env_compat.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_env_compat.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_native_forwarder_health.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_native_forwarder_health.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_native_post_delivery.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_native_post_delivery.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_platform.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_platform.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_interactions.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_interactions.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_launch.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_launch.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_reader.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_reader.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_rpc.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_rpc.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_steps.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_steps.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_launcher.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_launcher.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_forwarder.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_state.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_state.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_status.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_status.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli_auth.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli_auth.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli_diagnostics.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli_diagnostics.py)

## Audit Trail

- EXTRACTED: 26700 (44%)
- INFERRED: 34075 (56%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*