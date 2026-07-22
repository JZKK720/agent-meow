# Community 1

> 7471 nodes · cohesion 0.00

## Key Concepts

- [.get()](file:///C:/Users/1/github-pr/agent-meow/tests/tools/builtins/test_update_comment.py#L74) (3548 connections)
- [isInstance()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/chunk-NNHCCRGN-DlpIbxXb.js#L35) (2270 connections)
- [.append()](file:///C:/Users/1/github-pr/agent-meow/tests/server/routes/test_session_resources.py#L152) (1318 connections)
- [json](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/ImageEditor.tsx#L73) (1261 connections)
- [.post()](file:///C:/Users/1/github-pr/agent-meow/web/android/app/src/main/java/io/cubecloud/agentmeow/NativeNotificationManager.kt#L83) (855 connections)
- [.patch()](file:///C:/Users/1/github-pr/agent-meow/tests/server/routes/test_session_resources.py#L359) (470 connections)
- [create_test_agent()](file:///C:/Users/1/github-pr/agent-meow/tests/server/helpers.py#L747) (418 connections)
- [.raise_for_status()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_session_resources.py#L487) (383 connections)
- [lower](file:///C:/Users/1/github-pr/agent-meow/web/src/components/SlashCommandMenu.tsx#L128) (333 connections)
- [items](file:///C:/Users/1/github-pr/agent-meow/web/src/store/chatStore.test.ts#L411) (268 connections)
- [sessions.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/routes/sessions.py#L1) (248 connections)
- [.monotonic()](file:///C:/Users/1/github-pr/agent-meow/tests/test_native_forwarder_health.py#L26) (241 connections)
- [next](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/Sidebar.tsx#L975) (230 connections)
- [configure_mock_llm()](file:///C:/Users/1/github-pr/agent-meow/tests/e2e_ui/conftest.py#L512) (192 connections)
- **AssertionError** (191 connections)
- [.delete()](file:///C:/Users/1/github-pr/agent-meow/tests/tools/builtins/test_update_comment.py#L139) (173 connections)
- [test_sessions_endpoints.py](file:///C:/Users/1/github-pr/agent-meow/tests/server/integration/test_sessions_endpoints.py#L1) (163 connections)
- [codex_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_forwarder.py#L1) (156 connections)
- [print()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/monacoCodeEditor-BzxvY4cV.js#L15) (156 connections)
- [_create_session()](file:///C:/Users/1/github-pr/agent-meow/tests/server/integration/test_sessions_endpoints.py#L40) (154 connections)
- [reset_mock_llm()](file:///C:/Users/1/github-pr/agent-meow/tests/e2e_ui/conftest.py#L548) (142 connections)
- [.put()](file:///C:/Users/1/github-pr/agent-meow/tests/server/routes/test_session_resources.py#L1437) (114 connections)
- [TracingContext](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/tracing.py#L120) (111 connections)
- [test_antigravity_native_rpc.py](file:///C:/Users/1/github-pr/agent-meow/tests/test_antigravity_native_rpc.py#L1) (108 connections)
- [_create_runner_bound_session()](file:///C:/Users/1/github-pr/agent-meow/tests/e2e_ui/conftest.py#L1106) (98 connections)
- *... and 7446 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class CodexConfigProvider {
        +ambient.py()
    }
    class CodexConfigTransport {
        +ambient.py()
    }
    class LaunchedAntigravityTerminal {
        +antigravity_native.py()
    }
    class PreparedAntigravityTerminal {
        +antigravity_native.py()
    }
    class PaneAgyResolution {
        +antigravity_native_rpc.py()
    }
    class ClaudeNativeLaunchState {
        +claude_native_state.py()
    }
    class _CodexElicitationTaskTracker {
        +codex_native_forwarder.py()
        +.__init__()
        +.start()
        +.resolve_by_server_notification()
        +.resolve_by_terminal_turn_event()
        +.drain()
        +.close()
        +._run_one()
        +._discard_done()
        +._post_resolved_once()
    }
    class _CodexToolCall {
        +codex_native_forwarder.py()
    }
    class _CodexTurnStatusEdge {
        +codex_native_forwarder.py()
    }
    class _OutputTextDeltaCoalescer {
        +codex_native_forwarder.py()
        +.__init__()
        +.append()
        +.flush()
        +.close()
        +._ensure_worker()
        +._run()
        +._flush_buffer()
    }
    class _SessionUsageCoalescer {
        +codex_native_forwarder.py()
        +.__init__()
        +.record()
        +.flush()
        +.close()
    }
    class CodexNativeLaunchState {
        +codex_native_state.py()
    }
    class JourneySession {
        +conftest.py()
    }
    class LaunchedCursorTerminal {
        +cursor_native.py()
    }
    class NativeCursorLaunch {
        +cursor_native.py()
    }
    class PreparedCursorTerminal {
        +cursor_native.py()
    }
    class McpAuthOverride {
        +_example_helpers.py()
    }
    class PersonRecord {
        +format_record.py()
    }
    class _ForwardState {
        +goose_native_forwarder.py()
    }
    class _MirrorItem {
        +goose_native_forwarder.py()
    }
    class LaunchedGooseTerminal {
        +goose_native.py()
    }
    class NativeGooseLaunch {
        +goose_native.py()
    }
    class PreparedGooseTerminal {
        +goose_native.py()
    }
    class SessionStreamCollector {
        +helpers.py()
        +.next_event()
        +.assert_no_event()
        +.stop()
    }
    class LaunchedHermesTerminal {
        +hermes_native.py()
    }
    class NativeHermesLaunch {
        +hermes_native.py()
    }
    class PreparedHermesTerminal {
        +hermes_native.py()
    }
    class OmnigentServer {
        +index.js()
        +.constructor()
    }
    class _ForwardState {
        +kimi_native_forwarder.py()
    }
    class _MirrorItem {
        +kimi_native_forwarder.py()
    }
    class LaunchedKimiTerminal {
        +kimi_native.py()
    }
    class NativeKimiLaunch {
        +kimi_native.py()
    }
    class PreparedKimiTerminal {
        +kimi_native.py()
    }
    class LaunchedKiroTerminal {
        +kiro_native.py()
    }
    class NativeKiroLaunch {
        +kiro_native.py()
    }
    class PreparedKiroTerminal {
        +kiro_native.py()
    }
    class _ForwardState {
        +kiro_native_session_forwarder.py()
    }
    class PtyHandle {
        +_native_resume_helpers.py()
        +.output()
        +.terminate()
    }
    class DrainedInput {
        +pending_inputs.py()
    }
    class _Entry {
        +pending_inputs.py()
    }
    class MatchedDrain {
        +pending_inputs.py()
    }
    class LaunchedPiTerminal {
        +pi_native.py()
    }
    class NativePiLaunch {
        +pi_native.py()
    }
    class PreparedPiTerminal {
        +pi_native.py()
    }
    class ProviderSelection {
        +provider_selection.py()
    }
    class LaunchedQwenTerminal {
        +qwen_native.py()
    }
    class NativeQwenLaunch {
        +qwen_native.py()
    }
    class PreparedQwenTerminal {
        +qwen_native.py()
    }
    class S3ArtifactStore {
        +s3.py()
        +.__init__()
        +._resolve()
        +.put()
        +.get()
        +.delete()
        +.exists()
    }
    class FunctionSchemaResult {
        +_schema.py()
    }
    class Client {
        +smoke_test.py()
        +.__init__()
        +._request()
        +.provision()
        +.wait_running()
        +.exec()
        +.put_file()
        +.get_file()
        +.stop()
    }
    class SmokeError {
        +smoke_test.py()
    }
    class _BytesResponse {
        +test_agent_meow_dispatch.py()
        +.__init__()
        +.json()
    }
    class _FakeServerClient {
        +test_agent_meow_dispatch.py()
        +.__init__()
        +.post()
        +.patch()
    }
    class _JsonResponse {
        +test_agent_meow_dispatch.py()
        +.__init__()
        +.json()
    }
    class TestAskUserQuestionExtra {
        +test_antigravity_elicitation.py()
        +.test_ask_user_question_extra_present()
        +.test_ask_user_question_questions_shape()
        +.test_ask_user_question_multiselect_flag()
        +.test_ask_user_question_multi_question_indices()
    }
    class TestToElicitationParamsAskQuestion {
        +test_antigravity_elicitation.py()
        +.test_mode_is_form()
        +.test_message_set()
        +.test_phase_is_agy_ask_question()
        +.test_policy_name_is_agy_native_ask_question()
        +.test_ask_question_spec_present()
        +.test_ask_question_spec_carries_questions()
        +.test_ask_question_option_ids_present()
        +.test_multi_select_flag_preserved()
        +.test_single_select_flag_preserved()
    }
    class TestToElicitationParamsPermission {
        +test_antigravity_elicitation.py()
        +.test_mode_is_form()
        +.test_message_contains_command()
        +.test_phase_is_agy_permission()
        +.test_policy_name_is_agy_native_permission()
        +.test_permission_spec_present()
        +.test_trajectory_id_stored()
    }
    class _FakeStream {
        +test_antigravity_native.py()
        +.__init__()
        +.isatty()
    }
    class _ByteChunks {
        +test_antigravity_native_rpc.py()
        +.__init__()
        +.__aiter__()
        +.aclose()
    }
    class _CodexGoalAgentStore {
        +test_codex_goal.py()
        +.get()
    }
    class _CodexGoalConversationStore {
        +test_codex_goal.py()
        +.__init__()
        +.get_conversation()
    }
    class _CodexGoalRoutedRunner {
        +test_codex_goal.py()
        +.__init__()
    }
    class _CodexGoalRunnerClient {
        +test_codex_goal.py()
        +.__init__()
        +.post()
    }
    class _CodexGoalRunnerRouter {
        +test_codex_goal.py()
        +.__init__()
        +.client_for_session_resources()
    }
    class _FakeAsyncClient {
        +test_cursor_native.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.get()
        +.patch()
        +.post()
    }
    class TestContentText {
        +test_cursor_native_forwarder.py()
        +.test_string_content()
        +.test_part_list_joins_only_text_parts()
        +.test_unknown_content_is_empty()
    }
    class TestIsValidCursorChatId {
        +test_cursor_native.py()
    }
    class TestReadUsageLines {
        +test_cursor_native_usage.py()
        +.test_reads_valid_lines_and_skips_garbage()
        +.test_missing_file_is_empty()
    }
    class _StubFilesAPI {
        +test_databricks_volumes_artifact_store.py()
        +.__init__()
        +.upload()
        +.download()
        +.delete()
        +.get_metadata()
    }
    class _StubWorkspaceClient {
        +test_databricks_volumes_artifact_store.py()
        +.__init__()
    }
    class _FakeAsyncClient {
        +test_hermes_native.py()
        +.__init__()
        +.post()
        +.get()
        +.patch()
    }
    class _FakeResp {
        +test_hermes_native.py()
        +.__init__()
        +.json()
    }
    class _SpawnedHostDaemon {
        +test_host_e2e.py()
    }
    class TestRegistration {
        +test_kimi_native_executor.py()
        +.test_harness_is_registered()
        +.test_harness_is_allowlisted()
        +.test_kimi_native_is_terminal_native()
        +.test_native_coding_agent_record()
        +.test_distinct_from_headless_kimi_harness()
    }
    class TestRowToItem {
        +test_kimi_native_forwarder.py()
        +.test_turn_prompt_is_user()
        +.test_content_part_text_is_assistant()
        +.test_think_part_is_skipped()
        +.test_tool_call_and_metadata_skipped()
        +.test_non_user_turn_prompt_skipped()
    }
    class _FakeClient {
        +test_kiro_native.py()
        +.__init__()
        +.queue()
        +._replay()
        +.get()
        +.post()
        +.patch()
    }
    class _FakeResponse {
        +test_kiro_native.py()
        +.__init__()
        +.json()
    }
    class _CapturedRequest {
        +test_native_cost_popup.py()
    }
    class _FakeResponse {
        +test_native_cost_popup.py()
        +.__init__()
        +.__enter__()
        +.__exit__()
    }
    class _PopupHarness {
        +test_native_cost_popup.py()
    }
    class _Resp {
        +test_pi_native_resume_wiring.py()
        +.__init__()
        +.json()
    }
    class _Call {
        +test_proxy_mcp_manager.py()
    }
    class _FakeClient {
        +test_qwen_native.py()
        +.__init__()
        +.get()
        +.post()
    }
    class _Person {
        +test_schema.py()
    }
    class _AgentStore {
        +test_sessions_fork.py()
        +.__init__()
        +.get()
        +.create()
    }
    class _ConversationStore {
        +test_sessions_fork.py()
        +.__init__()
        +.get_conversation()
        +.fork_conversation()
        +.list_items()
    }
    class _StubAgentCache {
        +test_sessions_fork.py()
        +.__init__()
        +.load()
    }
    class _CaptureClient {
        +test_sessions_harness_override.py()
        +.__init__()
        +.post()
        +.get()
    }
    class _CaptureClient {
        +test_sessions_model_override.py()
        +.__init__()
        +.post()
        +.get()
    }
    class _SharedFixture {
        +test_sharing_journey.py()
    }
    class _OwnedSession {
        +test_sharing_permissions_e2e.py()
    }
    class _FakeResponse {
        +test_tool_dispatch_media.py()
        +.__init__()
        +.json()
    }
    class TracingContext {
        +tracing.py()
        +.__init__()
        +.start_agent_span()
        +.end_agent_span()
        +.start_tool_span()
        +.end_tool_span()
        +.start_policy_span()
        +.end_policy_span()
    }
    LaunchedKiroTerminal --> _FakeResponse
    LaunchedKiroTerminal --> _FakeClient
    PreparedKiroTerminal --> _FakeResponse
    PreparedKiroTerminal --> _FakeClient
    _FakeClient --> LaunchedKiroTerminal
    _FakeClient --> PreparedKiroTerminal
    _FakeResponse --> LaunchedKiroTerminal
    _FakeResponse --> PreparedKiroTerminal
```

## Relationships

- [[Community 4]] (1064 shared connections)
- [[Community 3]] (405 shared connections)
- [[Community 6]] (83 shared connections)
- [[Community 16]] (24 shared connections)
- [[Auth Config]] (14 shared connections)
- [[Community 23]] (12 shared connections)
- [[Community 9]] (12 shared connections)
- [[Community 8]] (10 shared connections)
- [[Community 18]] (4 shared connections)
- [[Community 14]] (2 shared connections)
- [[Community 19]] (2 shared connections)
- [[Community 11]] (2 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\_e2e_policy_callables.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_e2e_policy_callables.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_native_post_delivery.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_native_post_delivery.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_runner_startup.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_runner_startup.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_startup_profile.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_startup_profile.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_audit.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_audit.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_reader.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_reader.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_rpc.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_rpc.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\antigravity_native_steps.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/antigravity_native_steps.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\chat.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/chat.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_forwarder.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_hook.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_hook.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_state.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_state.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli_auth.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli_auth.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_app_server.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_app_server.py)

## Audit Trail

- EXTRACTED: 23243 (45%)
- INFERRED: 28644 (55%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*