# Community 8

> 2393 nodes · cohesion 0.01

## Key Concepts

- [SkillSpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L816) (961 connections)
- [Response](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_types.py#L54) (854 connections)
- [OutputItemDoneEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2939) (722 connections)
- [OutputTextDeltaEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2860) (698 connections)
- [CompletedEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3321) (666 connections)
- [ElicitationRequestEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3206) (651 connections)
- [ReasoningStartedEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2890) (625 connections)
- [ReasoningTextDeltaEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2905) (625 connections)
- [SessionStatusEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2281) (621 connections)
- [ErrorEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3440) (534 connections)
- [SessionInputConsumedEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2692) (469 connections)
- [ResponseCompleted](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L59) (436 connections)
- [ErrorEvent](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L254) (409 connections)
- [CreatedEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3272) (394 connections)
- [ErrorInfo](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_types.py#L39) (386 connections)
- [ResponseFailed](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L66) (370 connections)
- [ReasoningSummaryTextDeltaEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2922) (370 connections)
- [TextDelta](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L91) (365 connections)
- [ResponseCancelled](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L81) (346 connections)
- [ResponseIncomplete](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L73) (346 connections)
- [Document](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/document.py#L14) (344 connections)
- [FailedEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3337) (340 connections)
- [CancelledEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3354) (339 connections)
- [InProgressEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3305) (339 connections)
- [ResponseCreated](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py#L38) (322 connections)
- *... and 2368 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class BannerLine {
        +banner.py()
    }
    class ReasoningChunk {
        +_blocks.py()
    }
    class BlockStream {
        +blockStream.ts()
        +.constructor()
        +.reduce()
        +.reduceSync()
    }
    class _AttachSessionInfo {
        +chat.py()
    }
    class _DaemonChatSession {
        +chat.py()
    }
    class _DatabricksTokenAuth {
        +chat.py()
        +.__init__()
        +._sdk_token()
        +.auth_flow()
    }
    class LocalServer {
        +chat.py()
    }
    class _SessionToolAdapter {
        +chat.py()
        +.__call__()
    }
    class OmnigentClient {
        +_client.py()
        +.__init__()
        +.session()
        +.query()
        +.sessions_chat()
        +._fetch_agent_tools()
        +.close()
        +.__aenter__()
        +.__aexit__()
    }
    class FileMentionCompleter {
        +_completer.py()
        +.__init__()
    }
    class _FileMentionCompleterCore {
        +_completer.py()
        +.__init__()
        +.get_completions()
    }
    class ToolMetadata {
        +_decorator.py()
    }
    class Document {
        +document.py()
    }
    class AgentNotFoundError {
        +_errors.py()
    }
    class BundleInvalidError {
        +_errors.py()
    }
    class ConflictError {
        +_errors.py()
    }
    class InvalidInputError {
        +_errors.py()
    }
    class ResponseNotFoundError {
        +_errors.py()
    }
    class ServerError {
        +_errors.py()
    }
    class ToolCallDenied {
        +_errors.py()
    }
    class EventTape {
        +_event_tape.py()
        +.__init__()
        +.record_raw()
        +.update_translation()
        +.update_format()
        +.mark_rendered()
        +.summary_counts()
        +.reset_turn()
    }
    class _OverlayTargetLike {
        +_event_tape.py()
    }
    class PipelineCounters {
        +_event_tape.py()
        +.reset()
        +.toolbar_text()
    }
    class Stage {
        +_event_tape.py()
    }
    class TapeEntry {
        +_event_tape.py()
    }
    class ClientTaskCancel {
        +_events.py()
    }
    class CompactionCompleted {
        +_events.py()
    }
    class CompactionFailed {
        +_events.py()
    }
    class CompactionInProgress {
        +_events.py()
    }
    class ElicitationRequest {
        +_events.py()
    }
    class ErrorEvent {
        +_events.py()
    }
    class MessageDone {
        +_events.py()
    }
    class NativeToolCall {
        +_events.py()
    }
    class OutputFileDone {
        +_events.py()
    }
    class ReasoningDelta {
        +_events.py()
    }
    class ReasoningStarted {
        +_events.py()
    }
    class ReasoningSummaryDelta {
        +_events.py()
    }
    class ResponseCancelled {
        +_events.py()
    }
    class ResponseCompleted {
        +_events.py()
    }
    class ResponseCreated {
        +_events.py()
    }
    class ResponseFailed {
        +_events.py()
    }
    class ResponseIncomplete {
        +_events.py()
    }
    class ResponseInProgress {
        +_events.py()
    }
    class ResponseQueued {
        +_events.py()
    }
    class RetryEvent {
        +_events.py()
    }
    class TextDelta {
        +_events.py()
    }
    class ToolCall {
        +_events.py()
    }
    class ToolResult {
        +_events.py()
    }
    class FilesNamespace {
        +_files.py()
        +.__init__()
        +.for_session()
        +.upload()
        +.list()
        +.get()
        +.get_content()
        +.download()
        +.delete()
    }
    class SessionFilesNamespace {
        +_files.py()
        +.__init__()
        +.upload()
        +.list()
        +.get()
        +.get_content()
        +.download()
        +.delete()
    }
    class CapturingHost {
        +helpers.py()
        +.__init__()
        +.output()
    }
    class PendingAttachment {
        +_host.py()
    }
    class QueryResult {
        +_query.py()
    }
    class QueryStream {
        +_query.py()
        +.__init__()
        +.__aiter__()
    }
    class _ApprovalState {
        +_repl.py()
        +.__init__()
        +.is_pre_approved()
        +.remember_always()
        +.begin()
        +.resolve_verdict()
        +.cancel()
    }
    class _ApprovalVerdict {
        +_repl.py()
    }
    class _BangInputLexer {
        +_repl.py()
        +.lex_document()
    }
    class _ContextItems {
        +_repl.py()
    }
    class _FieldInputState {
        +_repl.py()
        +.__init__()
        +.begin()
        +.resolve()
        +.cancel()
    }
    class _OutputItemRenderPlan {
        +_repl.py()
    }
    class _SessionsChatReplAdapter {
        +_repl.py()
        +.__init__()
        +._recover_runner_if_needed()
        +._runner_recover_watch()
        +.set_model_override()
        +.set_reasoning_effort()
        +.compact()
        +._hydrate_from_session_snapshot()
        +._ensure_session()
        +._notify_session_start_once()
    }
    class _SessionSnapshot {
        +_repl.py()
    }
    class _SlashCommandCompleter {
        +_repl.py()
        +.get_completions()
    }
    class _StartupHeader {
        +_repl.py()
    }
    class _TerminalInfo {
        +_repl.py()
    }
    class TimedFormatter {
        +_repl.py()
        +.__init__()
        +.format_response_start()
        +.format_response_end()
    }
    class _TurnProseTracker {
        +_repl.py()
        +.on_delta()
        +.commit_segment()
        +.reset_turn()
        +.consume_match()
    }
    class ResponsesNamespace {
        +_responses.py()
        +.__init__()
        +._deprecation_warn()
        +.create()
        +.stream()
        +.get()
        +.poll()
        +._handle_polling_tool_calls()
        +._patch_tool_results()
        +.steer()
    }
    class InterruptEvent {
        +_scaffold.py()
    }
    class MessageEvent {
        +_scaffold.py()
        +.to_create_request()
    }
    class ToolResultEvent {
        +_scaffold.py()
    }
    class CancelledEvent {
        +schemas.py()
    }
    class ClientTaskCancelEvent {
        +schemas.py()
    }
    class CompactionCompletedEvent {
        +schemas.py()
    }
    class CompactionFailedEvent {
        +schemas.py()
    }
    class CompactionInProgressEvent {
        +schemas.py()
    }
    class CompletedEvent {
        +schemas.py()
    }
    class CreatedEvent {
        +schemas.py()
    }
    class ElicitationRequestEvent {
        +schemas.py()
    }
    class ElicitationResolvedEvent {
        +schemas.py()
    }
    class ErrorEvent {
        +schemas.py()
    }
    class FailedEvent {
        +schemas.py()
    }
    class HeartbeatEvent {
        +schemas.py()
    }
    class IncompleteDetails {
        +schemas.py()
    }
    class IncompleteEvent {
        +schemas.py()
    }
    class InProgressEvent {
        +schemas.py()
    }
    class OutputFileDoneEvent {
        +schemas.py()
    }
    class OutputItemDoneEvent {
        +schemas.py()
    }
    class OutputTextDeltaEvent {
        +schemas.py()
    }
    class PolicyEvaluationRequestEvent {
        +schemas.py()
    }
    class QueuedEvent {
        +schemas.py()
    }
    class ReasoningStartedEvent {
        +schemas.py()
    }
    class ReasoningSummaryTextDeltaEvent {
        +schemas.py()
    }
    class ReasoningTextDeltaEvent {
        +schemas.py()
    }
    class RetryErrorDetail {
        +schemas.py()
    }
    class RetryEvent {
        +schemas.py()
    }
    class SessionChangedFilesInvalidatedEvent {
        +schemas.py()
    }
    class SessionChildSessionUpdatedEvent {
        +schemas.py()
    }
    class SessionHeartbeatEvent {
        +schemas.py()
    }
    class SessionInputConsumedEvent {
        +schemas.py()
    }
    class SessionPresenceEvent {
        +schemas.py()
    }
    class SessionStatusEvent {
        +schemas.py()
    }
    class SessionTerminalActivityEvent {
        +schemas.py()
    }
    class _SSEEventBase {
        +schemas.py()
    }
    class TurnCancelledEvent {
        +schemas.py()
    }
    class TurnCompletedEvent {
        +schemas.py()
    }
    class TurnFailedEvent {
        +schemas.py()
    }
    class TurnStartedEvent {
        +schemas.py()
    }
    class Usage {
        +schemas.py()
    }
    class Session {
        +_session.py()
        +.__init__()
        +.set_reasoning_effort()
        +._reasoning_request()
        +.set_model_override()
        +.send()
        +._stream_and_track()
        +.query()
        +._collect_query()
        +._stream_query()
    }
    class _AgentToolsGetter {
        +_sessions_chat.py()
        +.__call__()
    }
    class _FilesGetter {
        +_sessions_chat.py()
        +.__call__()
    }
    class _FilesUploader {
        +_sessions_chat.py()
        +.__call__()
    }
    class SessionsChat {
        +_sessions_chat.py()
        +.__init__()
        +.refresh()
        +.tree_busy()
        +.send()
        +._validate_tool_callables()
        +._maybe_dispatch_tool_call()
        +.cancel()
        +.post_event()
        +.stream()
    }
    class SessionToolCallInfo {
        +_sessions_chat.py()
    }
    class _StreamHookState {
        +_sessions_chat.py()
    }
    class Session {
        +_sessions.py()
    }
    class SessionListItem {
        +_sessions.py()
    }
    class SessionsNamespace {
        +_sessions.py()
        +.__init__()
        +.create()
        +.list()
        +.bind_runner()
        +.unbind_runner()
        +.set_reasoning_effort()
        +.set_model_override()
        +.set_archived()
        +.set_external_session_id()
    }
    class BlockStream {
        +_stream.py()
        +.__init__()
        +.stream()
    }
    class _RaisingClient {
        +test_agent_switch_refresh.py()
        +.__init__()
    }
    class _RaisingSessions {
        +test_agent_switch_refresh.py()
        +.get()
    }
    class _SnapshotClient {
        +test_agent_switch_refresh.py()
        +.__init__()
    }
    class _SnapshotSessions {
        +test_agent_switch_refresh.py()
        +.__init__()
        +.get()
    }
    class _SwitchHost {
        +test_agent_switch_refresh.py()
        +.__init__()
        +.set_model_name()
        +.output()
    }
    class _FakeFmt {
        +test_bang_command.py()
    }
    class _FakeHost {
        +test_bang_command.py()
        +.__init__()
        +.output()
    }
    class _CompactSession {
        +test_compact_command.py()
        +.__init__()
        +.compact()
    }
    class _ItemsClient {
        +test_context_command.py()
        +.__init__()
    }
    class _OnePageSessionsApi {
        +test_context_command.py()
        +.__init__()
        +.list_items()
    }
    class _RingHost {
        +test_context_command.py()
        +.__init__()
        +.update_context_usage()
    }
    class _RingUpdate {
        +test_context_command.py()
    }
    class _Session {
        +test_context_command.py()
        +.__init__()
    }
    class _AsyncSession {
        +test_effort_command.py()
        +.set_reasoning_effort()
    }
    class _Session {
        +test_effort_command.py()
        +.__init__()
        +.set_reasoning_effort()
    }
    class _FakeCompletedEvent {
        +test_event_tape.py()
    }
    class _FakeDroppedEvent {
        +test_event_tape.py()
    }
    class _FakeFmt {
        +test_event_tape.py()
    }
    class _FakeSDKTextDelta {
        +test_event_tape.py()
    }
    class _FakeStreamingText {
        +test_event_tape.py()
    }
    class _FakeTextDelta {
        +test_event_tape.py()
    }
    class _Client {
        +test_logs_command.py()
    }
    class _Session {
        +test_logs_command.py()
    }
    class _CapturingHost {
        +test_repl.py()
        +.__init__()
        +.output()
        +.render_plain()
    }
    class _StubSession {
        +test_repl_pending_model_override.py()
    }
    class _StubFmt {
        +test_repl.py()
        +.welcome()
        +.user_message()
    }
    class _StubHost {
        +test_repl.py()
        +.__init__()
        +.output()
        +.start_timer()
        +.clear_subagents()
    }
    class _StubSession {
        +test_repl.py()
        +.__init__()
        +.reset()
    }
    class _StubSessionsModeSession {
        +test_repl.py()
        +.__init__()
        +.reset()
        +.start_new_conversation()
    }
    class _StubSkillSession {
        +test_repl.py()
        +.__init__()
        +.send_skill_slash_command()
    }
    class _EchoHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _ShutdownTrackingHarness {
        +_test_scaffold_harnesses.py()
        +.on_shutdown()
        +.run_turn()
    }
    class _UnclassifiedExceptionHarness {
        +_test_scaffold_harnesses.py()
        +.run_turn()
    }
    class _FakeFmt {
        +test_sdk_elicitation_wiring.py()
    }
    class _FakeHost {
        +test_sdk_elicitation_wiring.py()
        +.__init__()
        +.output()
    }
    class _FakeHttpClient {
        +test_sdk_elicitation_wiring.py()
        +.__init__()
        +.post()
    }
    class _FakeResponse {
        +test_sdk_elicitation_wiring.py()
        +.__init__()
    }
    class _ClientStub {
        +test_session_model.py()
        +.__init__()
    }
    class _ResponsesStub {
        +test_session_model.py()
        +.__init__()
        +.stream()
        +.steer()
    }
    class _ClientStub {
        +test_session_reasoning.py()
        +.__init__()
    }
    class _ResponsesStub {
        +test_session_reasoning.py()
        +.__init__()
        +.stream()
        +.steer()
    }
    class _ScriptedSession {
        +test_session.py()
        +.__init__()
        +.send()
    }
    class _AgentToolsCall {
        +test_sessions_chat.py()
    }
    class _FakeAgentToolsGetter {
        +test_sessions_chat.py()
        +.__init__()
        +.__call__()
    }
    class _FakeGetter {
        +test_sessions_chat.py()
        +.__init__()
        +.__call__()
    }
    class _FakeNamespace {
        +test_sessions_chat.py()
        +.__init__()
        +.create()
        +.get()
        +.post_event()
        +.resolve_elicitation()
        +.interrupt()
        +.subtree_busy()
        +.stream()
    }
    class _FakeUploader {
        +test_sessions_chat.py()
        +.__init__()
        +.__call__()
    }
    class _GatedReadyNamespace {
        +test_sessions_chat.py()
        +.__init__()
        +.post_event()
        +.stream()
    }
    class _GetterCall {
        +test_sessions_chat.py()
    }
    class _PostEventCall {
        +test_sessions_chat.py()
    }
    class _ResolveElicitationCall {
        +test_sessions_chat.py()
    }
    class _StreamScript {
        +test_sessions_chat.py()
    }
    class _UploaderCall {
        +test_sessions_chat.py()
    }
    class _ExecutorStub {
        +test_skills.py()
        +.__init__()
    }
    class _ServerClient {
        +test_skills.py()
        +.__init__()
        +.get()
    }
    class _SpecStub {
        +test_skills.py()
        +.__init__()
    }
    class FakeSession {
        +test_stream.py()
        +.__init__()
        +.send()
    }
    class _ChatClient {
        +test_subagent_chat.py()
        +.__init__()
    }
    class _ChatSessions {
        +test_subagent_chat.py()
        +.__init__()
        +.get()
        +.post_event()
        +.bind_runner()
        +.stream()
    }
    class _DiscoveryClient {
        +test_subagent_chat.py()
        +.__init__()
    }
    class _DiscoverySessions {
        +test_subagent_chat.py()
        +.__init__()
        +.child_sessions()
        +.child_sessions_tree()
    }
    class _FakeClient {
        +test_subagent_registry.py()
        +.__init__()
    }
    class _FakeSessions {
        +test_subagent_registry.py()
        +.__init__()
        +.child_sessions()
        +.child_sessions_tree()
    }
    class CompactionEndCtx {
        +_tool_handler.py()
    }
    class CompactionStartCtx {
        +_tool_handler.py()
    }
    class ElicitationRequestCtx {
        +_tool_handler.py()
    }
    class FileOutputCtx {
        +_tool_handler.py()
    }
    class MessageEndCtx {
        +_tool_handler.py()
    }
    class MessageStartCtx {
        +_tool_handler.py()
    }
    class NativeToolCallCtx {
        +_tool_handler.py()
    }
    class ReasoningEndCtx {
        +_tool_handler.py()
    }
    class ReasoningStartCtx {
        +_tool_handler.py()
    }
    class ResponseEndCtx {
        +_tool_handler.py()
    }
    class ResponseStartCtx {
        +_tool_handler.py()
    }
    class RetryCtx {
        +_tool_handler.py()
    }
    class ServerErrorCtx {
        +_tool_handler.py()
    }
    class StreamHooks {
        +_tool_handler.py()
    }
    class SubAgentCompletedCtx {
        +_tool_handler.py()
    }
    class SubAgentInfo {
        +_tool_handler.py()
    }
    class SubAgentSpawnedCtx {
        +_tool_handler.py()
    }
    class ToolCallEndCtx {
        +_tool_handler.py()
    }
    class ToolCallInfo {
        +_tool_handler.py()
    }
    class ToolCallStartCtx {
        +_tool_handler.py()
    }
    class ToolHandler {
        +_tool_handler.py()
    }
    class ToolResultInfo {
        +_tool_handler.py()
    }
    class ToolResultsReadyCtx {
        +_tool_handler.py()
    }
    class TransportErrorCtx {
        +_tool_handler.py()
    }
    class Agent {
        +_types.py()
    }
    class Conversation {
        +_types.py()
    }
    class ConversationRef {
        +_types.py()
    }
    class ErrorInfo {
        +_types.py()
    }
    class File {
        +_types.py()
    }
    class IncompleteDetails {
        +_types.py()
    }
    class PaginatedList {
        +_types.py()
    }
    class Response {
        +types.py()
        +_types.py()
    }
    class SkillSpec {
        +types.py()
    }
    BannerLine --> _SessionSnapshot
    BannerLine --> _StartupHeader
    BannerLine --> TimedFormatter
    BannerLine --> _ApprovalVerdict
    BannerLine --> _ApprovalState
    BannerLine --> _FieldInputState
    BannerLine --> _SessionsChatReplAdapter
    BannerLine --> _OutputItemRenderPlan
    BannerLine --> _TurnProseTracker
    BannerLine --> _ContextItems
    BannerLine --> _TerminalInfo
    BannerLine --> _SlashCommandCompleter
    BannerLine --> _BangInputLexer
    ReasoningChunk --> Response
    ReasoningChunk --> BlockStream
    ReasoningChunk --> FakeSession
    _AttachSessionInfo --> ErrorEvent
    _AttachSessionInfo --> ResponseCancelled
    _AttachSessionInfo --> ResponseCompleted
    _AttachSessionInfo --> ResponseFailed
    _AttachSessionInfo --> ResponseIncomplete
    _AttachSessionInfo --> TextDelta
    _AttachSessionInfo --> SkillSpec
    _DaemonChatSession --> ErrorEvent
    _DaemonChatSession --> ResponseCancelled
    _DaemonChatSession --> ResponseCompleted
    _DaemonChatSession --> ResponseFailed
    _DaemonChatSession --> ResponseIncomplete
    _DaemonChatSession --> TextDelta
    _DaemonChatSession --> SkillSpec
    _DatabricksTokenAuth --> ErrorEvent
    _DatabricksTokenAuth --> ResponseCancelled
    _DatabricksTokenAuth --> ResponseCompleted
    _DatabricksTokenAuth --> ResponseFailed
    _DatabricksTokenAuth --> ResponseIncomplete
    _DatabricksTokenAuth --> TextDelta
    _DatabricksTokenAuth --> SkillSpec
    LocalServer --> ErrorEvent
    LocalServer --> ResponseCancelled
    LocalServer --> ResponseCompleted
    LocalServer --> ResponseFailed
    LocalServer --> ResponseIncomplete
    LocalServer --> TextDelta
    LocalServer --> SkillSpec
    _SessionToolAdapter --> ErrorEvent
    _SessionToolAdapter --> ResponseCancelled
    _SessionToolAdapter --> ResponseCompleted
    _SessionToolAdapter --> ResponseFailed
    _SessionToolAdapter --> ResponseIncomplete
    _SessionToolAdapter --> TextDelta
    _SessionToolAdapter --> SkillSpec
    OmnigentClient --> FilesNamespace
    OmnigentClient --> QueryResult
    OmnigentClient --> QueryStream
    OmnigentClient --> ResponsesNamespace
    OmnigentClient --> Session
    OmnigentClient --> SessionsNamespace
    OmnigentClient --> SessionsChat
    OmnigentClient --> StreamHooks
    OmnigentClient --> ToolHandler
    FileMentionCompleter --> _SessionSnapshot
    FileMentionCompleter --> _StartupHeader
    FileMentionCompleter --> TimedFormatter
    FileMentionCompleter --> _ApprovalVerdict
    FileMentionCompleter --> _ApprovalState
    FileMentionCompleter --> _FieldInputState
    FileMentionCompleter --> _SessionsChatReplAdapter
    FileMentionCompleter --> _OutputItemRenderPlan
    FileMentionCompleter --> _TurnProseTracker
    FileMentionCompleter --> _ContextItems
    FileMentionCompleter --> _TerminalInfo
    FileMentionCompleter --> _SlashCommandCompleter
    FileMentionCompleter --> _BangInputLexer
    FileMentionCompleter --> Document
    FileMentionCompleter --> PendingAttachment
    _FileMentionCompleterCore --> Document
    _FileMentionCompleterCore --> PendingAttachment
    Document --> _SessionSnapshot
    Document --> _StartupHeader
    Document --> TimedFormatter
    Document --> _ApprovalVerdict
    Document --> _ApprovalState
    Document --> _FieldInputState
    Document --> _SessionsChatReplAdapter
    Document --> _OutputItemRenderPlan
    Document --> _TurnProseTracker
    Document --> _ContextItems
    Document --> _TerminalInfo
    Document --> _SlashCommandCompleter
    Document --> _BangInputLexer
    Document --> _FileMentionCompleterCore
    Document --> FileMentionCompleter
    Document --> _FakeHost
    Document --> _FakeFmt
    Document --> _CapturingHost
    Document --> _StubSession
    Document --> _StubHost
    Document --> _StubFmt
    Document --> _StubSkillSession
    Document --> _StubSessionsModeSession
    ToolCallDenied --> ResponsesNamespace
    EventTape --> _SessionSnapshot
    EventTape --> _StartupHeader
    EventTape --> TimedFormatter
    EventTape --> _ApprovalVerdict
    EventTape --> _ApprovalState
    EventTape --> _FieldInputState
    EventTape --> _SessionsChatReplAdapter
    EventTape --> _OutputItemRenderPlan
    EventTape --> _TurnProseTracker
    EventTape --> _ContextItems
    EventTape --> _TerminalInfo
    EventTape --> _SlashCommandCompleter
    EventTape --> _BangInputLexer
    EventTape --> _FakeTextDelta
    EventTape --> _FakeCompletedEvent
    EventTape --> _FakeDroppedEvent
    EventTape --> _FakeSDKTextDelta
    EventTape --> _FakeStreamingText
    EventTape --> _FakeFmt
    PipelineCounters --> _SessionSnapshot
    PipelineCounters --> _StartupHeader
    PipelineCounters --> TimedFormatter
    PipelineCounters --> _ApprovalVerdict
    PipelineCounters --> _ApprovalState
    PipelineCounters --> _FieldInputState
    PipelineCounters --> _SessionsChatReplAdapter
    PipelineCounters --> _OutputItemRenderPlan
    PipelineCounters --> _TurnProseTracker
    PipelineCounters --> _ContextItems
    PipelineCounters --> _TerminalInfo
    PipelineCounters --> _SlashCommandCompleter
    PipelineCounters --> _BangInputLexer
    PipelineCounters --> _FakeTextDelta
    PipelineCounters --> _FakeCompletedEvent
    PipelineCounters --> _FakeDroppedEvent
    PipelineCounters --> _FakeSDKTextDelta
    PipelineCounters --> _FakeStreamingText
    PipelineCounters --> _FakeFmt
    Stage --> _FakeTextDelta
    Stage --> _FakeCompletedEvent
    Stage --> _FakeDroppedEvent
    Stage --> _FakeSDKTextDelta
    Stage --> _FakeStreamingText
    Stage --> _FakeFmt
    TapeEntry --> _SessionSnapshot
    TapeEntry --> _StartupHeader
    TapeEntry --> TimedFormatter
    TapeEntry --> _ApprovalVerdict
    TapeEntry --> _ApprovalState
    TapeEntry --> _FieldInputState
    TapeEntry --> _SessionsChatReplAdapter
    TapeEntry --> _OutputItemRenderPlan
    TapeEntry --> _TurnProseTracker
    TapeEntry --> _ContextItems
    TapeEntry --> _TerminalInfo
    TapeEntry --> _SlashCommandCompleter
    TapeEntry --> _BangInputLexer
    TapeEntry --> _FakeTextDelta
    TapeEntry --> _FakeCompletedEvent
    TapeEntry --> _FakeDroppedEvent
    TapeEntry --> _FakeSDKTextDelta
    TapeEntry --> _FakeStreamingText
    TapeEntry --> _FakeFmt
    ClientTaskCancel --> ErrorInfo
    ClientTaskCancel --> Response
    ClientTaskCancel --> ResponsesNamespace
    CompactionCompleted --> _SessionSnapshot
    CompactionCompleted --> _StartupHeader
    CompactionCompleted --> TimedFormatter
    CompactionCompleted --> _ApprovalVerdict
    CompactionCompleted --> _ApprovalState
    CompactionCompleted --> _FieldInputState
    CompactionCompleted --> _SessionsChatReplAdapter
    CompactionCompleted --> _OutputItemRenderPlan
    CompactionCompleted --> _TurnProseTracker
    CompactionCompleted --> _ContextItems
    CompactionCompleted --> _TerminalInfo
    CompactionCompleted --> _SlashCommandCompleter
    CompactionCompleted --> _BangInputLexer
    CompactionCompleted --> ErrorInfo
    CompactionCompleted --> Response
    CompactionFailed --> ErrorInfo
    CompactionFailed --> Response
    CompactionInProgress --> _SessionSnapshot
    CompactionInProgress --> _StartupHeader
    CompactionInProgress --> TimedFormatter
    CompactionInProgress --> _ApprovalVerdict
    CompactionInProgress --> _ApprovalState
    CompactionInProgress --> _FieldInputState
    CompactionInProgress --> _SessionsChatReplAdapter
    CompactionInProgress --> _OutputItemRenderPlan
    CompactionInProgress --> _TurnProseTracker
    CompactionInProgress --> _ContextItems
    CompactionInProgress --> _TerminalInfo
    CompactionInProgress --> _SlashCommandCompleter
    CompactionInProgress --> _BangInputLexer
    CompactionInProgress --> ErrorInfo
    CompactionInProgress --> Response
    CompactionInProgress --> ResponsesNamespace
    CompactionInProgress --> BlockStream
    ElicitationRequest --> _SessionSnapshot
    ElicitationRequest --> _StartupHeader
    ElicitationRequest --> TimedFormatter
    ElicitationRequest --> _ApprovalVerdict
    ElicitationRequest --> _ApprovalState
    ElicitationRequest --> _FieldInputState
    ElicitationRequest --> _SessionsChatReplAdapter
    ElicitationRequest --> _OutputItemRenderPlan
    ElicitationRequest --> _TurnProseTracker
    ElicitationRequest --> _ContextItems
    ElicitationRequest --> _TerminalInfo
    ElicitationRequest --> _SlashCommandCompleter
    ElicitationRequest --> _BangInputLexer
    ElicitationRequest --> ErrorInfo
    ElicitationRequest --> Response
    ElicitationRequest --> ResponsesNamespace
    ErrorEvent --> LocalServer
    ErrorEvent --> _SessionToolAdapter
    ErrorEvent --> _DatabricksTokenAuth
    ErrorEvent --> _AttachSessionInfo
    ErrorEvent --> _DaemonChatSession
    ErrorEvent --> _SessionSnapshot
    ErrorEvent --> _StartupHeader
    ErrorEvent --> TimedFormatter
    ErrorEvent --> _ApprovalVerdict
    ErrorEvent --> _ApprovalState
    ErrorEvent --> _FieldInputState
    ErrorEvent --> _SessionsChatReplAdapter
    ErrorEvent --> _OutputItemRenderPlan
    ErrorEvent --> _TurnProseTracker
    ErrorEvent --> _ContextItems
    ErrorEvent --> _TerminalInfo
    ErrorEvent --> _SlashCommandCompleter
    ErrorEvent --> _BangInputLexer
    ErrorEvent --> ErrorInfo
    ErrorEvent --> Response
    ErrorEvent --> ResponsesNamespace
    ErrorEvent --> BlockStream
    ErrorEvent --> _CapturingHost
    ErrorEvent --> _StubSession
    ErrorEvent --> _StubHost
    ErrorEvent --> _StubFmt
    ErrorEvent --> _StubSkillSession
    ErrorEvent --> _StubSessionsModeSession
    MessageDone --> ErrorInfo
    MessageDone --> Response
    MessageDone --> ResponsesNamespace
    MessageDone --> BlockStream
    MessageDone --> _ScriptedSession
    MessageDone --> FakeSession
    NativeToolCall --> ErrorInfo
    NativeToolCall --> Response
    NativeToolCall --> ResponsesNamespace
    NativeToolCall --> BlockStream
    OutputFileDone --> ErrorInfo
    OutputFileDone --> Response
    OutputFileDone --> ResponsesNamespace
    OutputFileDone --> BlockStream
    ReasoningDelta --> _SessionSnapshot
    ReasoningDelta --> _StartupHeader
    ReasoningDelta --> TimedFormatter
    ReasoningDelta --> _ApprovalVerdict
    ReasoningDelta --> _ApprovalState
    ReasoningDelta --> _FieldInputState
    ReasoningDelta --> _SessionsChatReplAdapter
    ReasoningDelta --> _OutputItemRenderPlan
    ReasoningDelta --> _TurnProseTracker
    ReasoningDelta --> _ContextItems
    ReasoningDelta --> _TerminalInfo
    ReasoningDelta --> _SlashCommandCompleter
    ReasoningDelta --> _BangInputLexer
    ReasoningDelta --> ErrorInfo
    ReasoningDelta --> Response
    ReasoningDelta --> ResponsesNamespace
    ReasoningDelta --> BlockStream
    ReasoningDelta --> FakeSession
    ReasoningStarted --> _SessionSnapshot
    ReasoningStarted --> _StartupHeader
    ReasoningStarted --> TimedFormatter
    ReasoningStarted --> _ApprovalVerdict
    ReasoningStarted --> _ApprovalState
    ReasoningStarted --> _FieldInputState
    ReasoningStarted --> _SessionsChatReplAdapter
    ReasoningStarted --> _OutputItemRenderPlan
    ReasoningStarted --> _TurnProseTracker
    ReasoningStarted --> _ContextItems
    ReasoningStarted --> _TerminalInfo
    ReasoningStarted --> _SlashCommandCompleter
    ReasoningStarted --> _BangInputLexer
    ReasoningStarted --> ErrorInfo
    ReasoningStarted --> Response
    ReasoningStarted --> ResponsesNamespace
    ReasoningStarted --> BlockStream
    ReasoningStarted --> FakeSession
    ReasoningSummaryDelta --> _SessionSnapshot
    ReasoningSummaryDelta --> _StartupHeader
    ReasoningSummaryDelta --> TimedFormatter
    ReasoningSummaryDelta --> _ApprovalVerdict
    ReasoningSummaryDelta --> _ApprovalState
    ReasoningSummaryDelta --> _FieldInputState
    ReasoningSummaryDelta --> _SessionsChatReplAdapter
    ReasoningSummaryDelta --> _OutputItemRenderPlan
    ReasoningSummaryDelta --> _TurnProseTracker
    ReasoningSummaryDelta --> _ContextItems
    ReasoningSummaryDelta --> _TerminalInfo
    ReasoningSummaryDelta --> _SlashCommandCompleter
    ReasoningSummaryDelta --> _BangInputLexer
    ReasoningSummaryDelta --> ErrorInfo
    ReasoningSummaryDelta --> Response
    ReasoningSummaryDelta --> ResponsesNamespace
    ReasoningSummaryDelta --> BlockStream
    ReasoningSummaryDelta --> FakeSession
    ResponseCancelled --> LocalServer
    ResponseCancelled --> _SessionToolAdapter
    ResponseCancelled --> _DatabricksTokenAuth
    ResponseCancelled --> _AttachSessionInfo
    ResponseCancelled --> _DaemonChatSession
    ResponseCancelled --> _SessionSnapshot
    ResponseCancelled --> _StartupHeader
    ResponseCancelled --> TimedFormatter
    ResponseCancelled --> _ApprovalVerdict
    ResponseCancelled --> _ApprovalState
    ResponseCancelled --> _FieldInputState
    ResponseCancelled --> _SessionsChatReplAdapter
    ResponseCancelled --> _OutputItemRenderPlan
    ResponseCancelled --> _TurnProseTracker
    ResponseCancelled --> _ContextItems
    ResponseCancelled --> _TerminalInfo
    ResponseCancelled --> _SlashCommandCompleter
    ResponseCancelled --> _BangInputLexer
    ResponseCancelled --> ErrorInfo
    ResponseCancelled --> Response
    ResponseCancelled --> ResponsesNamespace
    ResponseCancelled --> Session
    ResponseCancelled --> BlockStream
    ResponseCompleted --> LocalServer
    ResponseCompleted --> _SessionToolAdapter
    ResponseCompleted --> _DatabricksTokenAuth
    ResponseCompleted --> _AttachSessionInfo
    ResponseCompleted --> _DaemonChatSession
    ResponseCompleted --> _SessionSnapshot
    ResponseCompleted --> _StartupHeader
    ResponseCompleted --> TimedFormatter
    ResponseCompleted --> _ApprovalVerdict
    ResponseCompleted --> _ApprovalState
    ResponseCompleted --> _FieldInputState
    ResponseCompleted --> _SessionsChatReplAdapter
    ResponseCompleted --> _OutputItemRenderPlan
    ResponseCompleted --> _TurnProseTracker
    ResponseCompleted --> _ContextItems
    ResponseCompleted --> _TerminalInfo
    ResponseCompleted --> _SlashCommandCompleter
    ResponseCompleted --> _BangInputLexer
    ResponseCompleted --> ErrorInfo
    ResponseCompleted --> Response
    ResponseCompleted --> ResponsesNamespace
    ResponseCompleted --> Session
    ResponseCompleted --> BlockStream
    ResponseCompleted --> _ScriptedSession
    ResponseCompleted --> _ResponsesStub
    ResponseCompleted --> _ClientStub
    ResponseCompleted --> _ResponsesStub
    ResponseCompleted --> _ClientStub
    ResponseCompleted --> FakeSession
    ResponseCreated --> _SessionSnapshot
    ResponseCreated --> _StartupHeader
    ResponseCreated --> TimedFormatter
    ResponseCreated --> _ApprovalVerdict
    ResponseCreated --> _ApprovalState
    ResponseCreated --> _FieldInputState
    ResponseCreated --> _SessionsChatReplAdapter
    ResponseCreated --> _OutputItemRenderPlan
    ResponseCreated --> _TurnProseTracker
    ResponseCreated --> _ContextItems
    ResponseCreated --> _TerminalInfo
    ResponseCreated --> _SlashCommandCompleter
    ResponseCreated --> _BangInputLexer
    ResponseCreated --> ErrorInfo
    ResponseCreated --> Response
    ResponseCreated --> ResponsesNamespace
    ResponseCreated --> Session
    ResponseCreated --> BlockStream
    ResponseCreated --> _ScriptedSession
    ResponseCreated --> _ResponsesStub
    ResponseCreated --> _ClientStub
    ResponseCreated --> _ResponsesStub
    ResponseCreated --> _ClientStub
    ResponseCreated --> FakeSession
    ResponseFailed --> LocalServer
    ResponseFailed --> _SessionToolAdapter
    ResponseFailed --> _DatabricksTokenAuth
    ResponseFailed --> _AttachSessionInfo
    ResponseFailed --> _DaemonChatSession
    ResponseFailed --> _SessionSnapshot
    ResponseFailed --> _StartupHeader
    ResponseFailed --> TimedFormatter
    ResponseFailed --> _ApprovalVerdict
    ResponseFailed --> _ApprovalState
    ResponseFailed --> _FieldInputState
    ResponseFailed --> _SessionsChatReplAdapter
    ResponseFailed --> _OutputItemRenderPlan
    ResponseFailed --> _TurnProseTracker
    ResponseFailed --> _ContextItems
    ResponseFailed --> _TerminalInfo
    ResponseFailed --> _SlashCommandCompleter
    ResponseFailed --> _BangInputLexer
    ResponseFailed --> ErrorInfo
    ResponseFailed --> Response
    ResponseFailed --> ResponsesNamespace
    ResponseFailed --> Session
    ResponseFailed --> BlockStream
    ResponseIncomplete --> LocalServer
    ResponseIncomplete --> _SessionToolAdapter
    ResponseIncomplete --> _DatabricksTokenAuth
    ResponseIncomplete --> _AttachSessionInfo
    ResponseIncomplete --> _DaemonChatSession
    ResponseIncomplete --> _SessionSnapshot
    ResponseIncomplete --> _StartupHeader
    ResponseIncomplete --> TimedFormatter
    ResponseIncomplete --> _ApprovalVerdict
    ResponseIncomplete --> _ApprovalState
    ResponseIncomplete --> _FieldInputState
    ResponseIncomplete --> _SessionsChatReplAdapter
    ResponseIncomplete --> _OutputItemRenderPlan
    ResponseIncomplete --> _TurnProseTracker
    ResponseIncomplete --> _ContextItems
    ResponseIncomplete --> _TerminalInfo
    ResponseIncomplete --> _SlashCommandCompleter
    ResponseIncomplete --> _BangInputLexer
    ResponseIncomplete --> ErrorInfo
    ResponseIncomplete --> Response
    ResponseIncomplete --> ResponsesNamespace
    ResponseIncomplete --> Session
    ResponseIncomplete --> BlockStream
    ResponseInProgress --> _SessionSnapshot
    ResponseInProgress --> _StartupHeader
    ResponseInProgress --> TimedFormatter
    ResponseInProgress --> _ApprovalVerdict
    ResponseInProgress --> _ApprovalState
    ResponseInProgress --> _FieldInputState
    ResponseInProgress --> _SessionsChatReplAdapter
    ResponseInProgress --> _OutputItemRenderPlan
    ResponseInProgress --> _TurnProseTracker
    ResponseInProgress --> _ContextItems
    ResponseInProgress --> _TerminalInfo
    ResponseInProgress --> _SlashCommandCompleter
    ResponseInProgress --> _BangInputLexer
    ResponseInProgress --> ErrorInfo
    ResponseInProgress --> Response
    ResponseInProgress --> BlockStream
    ResponseInProgress --> _ScriptedSession
    ResponseInProgress --> FakeSession
    ResponseQueued --> _SessionSnapshot
    ResponseQueued --> _StartupHeader
    ResponseQueued --> TimedFormatter
    ResponseQueued --> _ApprovalVerdict
    ResponseQueued --> _ApprovalState
    ResponseQueued --> _FieldInputState
    ResponseQueued --> _SessionsChatReplAdapter
    ResponseQueued --> _OutputItemRenderPlan
    ResponseQueued --> _TurnProseTracker
    ResponseQueued --> _ContextItems
    ResponseQueued --> _TerminalInfo
    ResponseQueued --> _SlashCommandCompleter
    ResponseQueued --> _BangInputLexer
    ResponseQueued --> ErrorInfo
    ResponseQueued --> Response
    ResponseQueued --> BlockStream
    RetryEvent --> ErrorInfo
    RetryEvent --> Response
    RetryEvent --> ResponsesNamespace
    RetryEvent --> BlockStream
    TextDelta --> LocalServer
    TextDelta --> _SessionToolAdapter
    TextDelta --> _DatabricksTokenAuth
    TextDelta --> _AttachSessionInfo
    TextDelta --> _DaemonChatSession
    TextDelta --> _SessionSnapshot
    TextDelta --> _StartupHeader
    TextDelta --> TimedFormatter
    TextDelta --> _ApprovalVerdict
    TextDelta --> _ApprovalState
    TextDelta --> _FieldInputState
    TextDelta --> _SessionsChatReplAdapter
    TextDelta --> _OutputItemRenderPlan
    TextDelta --> _TurnProseTracker
    TextDelta --> _ContextItems
    TextDelta --> _TerminalInfo
    TextDelta --> _SlashCommandCompleter
    TextDelta --> _BangInputLexer
    TextDelta --> ErrorInfo
    TextDelta --> Response
    TextDelta --> ResponsesNamespace
    TextDelta --> BlockStream
    TextDelta --> _ScriptedSession
    TextDelta --> FakeSession
    ToolCall --> ErrorInfo
    ToolCall --> Response
    ToolCall --> ResponsesNamespace
    ToolCall --> BlockStream
    ToolCall --> FakeSession
    ToolResult --> ErrorInfo
    ToolResult --> Response
    ToolResult --> ResponsesNamespace
    ToolResult --> BlockStream
    ToolResult --> FakeSession
    FilesNamespace --> OmnigentClient
    FilesNamespace --> File
    FilesNamespace --> PaginatedList
    FilesNamespace --> SessionToolCallInfo
    FilesNamespace --> _AgentToolsGetter
    FilesNamespace --> _StreamHookState
    FilesNamespace --> SessionsChat
    FilesNamespace --> _FilesUploader
    FilesNamespace --> _FilesGetter
    SessionFilesNamespace --> File
    SessionFilesNamespace --> PaginatedList
    CapturingHost --> _CompactSession
    CapturingHost --> _Session
    CapturingHost --> _RingUpdate
    CapturingHost --> _RingHost
    CapturingHost --> _OnePageSessionsApi
    CapturingHost --> _ItemsClient
    CapturingHost --> _Session
    CapturingHost --> _AsyncSession
    CapturingHost --> _Session
    CapturingHost --> _Client
    PendingAttachment --> _FileMentionCompleterCore
    PendingAttachment --> FileMentionCompleter
    QueryResult --> OmnigentClient
    QueryResult --> File
    QueryResult --> Session
    QueryResult --> SessionToolCallInfo
    QueryResult --> _AgentToolsGetter
    QueryResult --> _StreamHookState
    QueryResult --> SessionsChat
    QueryResult --> _FilesUploader
    QueryResult --> _FilesGetter
    QueryResult --> _PostEventCall
    QueryResult --> _ResolveElicitationCall
    QueryResult --> _StreamScript
    QueryResult --> _FakeNamespace
    QueryResult --> _GatedReadyNamespace
    QueryResult --> _UploaderCall
    QueryResult --> _FakeUploader
    QueryResult --> _GetterCall
    QueryResult --> _FakeGetter
    QueryResult --> _AgentToolsCall
    QueryResult --> _FakeAgentToolsGetter
    QueryStream --> OmnigentClient
    QueryStream --> File
    QueryStream --> Session
    QueryStream --> SessionToolCallInfo
    QueryStream --> _AgentToolsGetter
    QueryStream --> _StreamHookState
    QueryStream --> SessionsChat
    QueryStream --> _FilesUploader
    QueryStream --> _FilesGetter
    QueryStream --> _PostEventCall
    QueryStream --> _ResolveElicitationCall
    QueryStream --> _StreamScript
    QueryStream --> _FakeNamespace
    QueryStream --> _GatedReadyNamespace
    QueryStream --> _UploaderCall
    QueryStream --> _FakeUploader
    QueryStream --> _GetterCall
    QueryStream --> _FakeGetter
    QueryStream --> _AgentToolsCall
    QueryStream --> _FakeAgentToolsGetter
    _ApprovalState --> FileMentionCompleter
    _ApprovalState --> Document
    _ApprovalState --> SkillSpec
    _ApprovalState --> SessionStatusEvent
    _ApprovalState --> BannerLine
    _ApprovalState --> CompactionCompleted
    _ApprovalState --> CompactionInProgress
    _ApprovalState --> ElicitationRequest
    _ApprovalState --> ReasoningDelta
    _ApprovalState --> ReasoningStarted
    _ApprovalState --> ReasoningSummaryDelta
    _ApprovalState --> ResponseCancelled
    _ApprovalState --> ResponseCompleted
    _ApprovalState --> ResponseCreated
    _ApprovalState --> ResponseFailed
    _ApprovalState --> ResponseIncomplete
    _ApprovalState --> ResponseInProgress
    _ApprovalState --> ResponseQueued
    _ApprovalState --> TextDelta
    _ApprovalState --> ErrorEvent
    _ApprovalState --> ErrorInfo
    _ApprovalState --> Response
    _ApprovalState --> CancelledEvent
    _ApprovalState --> ClientTaskCancelEvent
    _ApprovalState --> CompactionCompletedEvent
    _ApprovalState --> CompactionInProgressEvent
    _ApprovalState --> CompletedEvent
    _ApprovalState --> CreatedEvent
    _ApprovalState --> ElicitationRequestEvent
    _ApprovalState --> ErrorEvent
    _ApprovalState --> FailedEvent
    _ApprovalState --> IncompleteEvent
    _ApprovalState --> InProgressEvent
    _ApprovalState --> OutputItemDoneEvent
    _ApprovalState --> OutputTextDeltaEvent
    _ApprovalState --> QueuedEvent
    _ApprovalState --> ReasoningStartedEvent
    _ApprovalState --> ReasoningSummaryTextDeltaEvent
    _ApprovalState --> ReasoningTextDeltaEvent
    _ApprovalState --> RetryErrorDetail
    _ApprovalState --> ToolCallInfo
    _ApprovalState --> ElicitationRequestCtx
    _ApprovalState --> EventTape
    _ApprovalState --> PipelineCounters
    _ApprovalState --> TapeEntry
    _ApprovalState --> SessionInputConsumedEvent
    _ApprovalState --> ElicitationResolvedEvent
    _ApprovalState --> SessionChildSessionUpdatedEvent
    _ApprovalVerdict --> FileMentionCompleter
    _ApprovalVerdict --> Document
    _ApprovalVerdict --> SkillSpec
    _ApprovalVerdict --> SessionStatusEvent
    _ApprovalVerdict --> BannerLine
    _ApprovalVerdict --> CompactionCompleted
    _ApprovalVerdict --> CompactionInProgress
    _ApprovalVerdict --> ElicitationRequest
    _ApprovalVerdict --> ReasoningDelta
    _ApprovalVerdict --> ReasoningStarted
    _ApprovalVerdict --> ReasoningSummaryDelta
    _ApprovalVerdict --> ResponseCancelled
    _ApprovalVerdict --> ResponseCompleted
    _ApprovalVerdict --> ResponseCreated
    _ApprovalVerdict --> ResponseFailed
    _ApprovalVerdict --> ResponseIncomplete
    _ApprovalVerdict --> ResponseInProgress
    _ApprovalVerdict --> ResponseQueued
    _ApprovalVerdict --> TextDelta
    _ApprovalVerdict --> ErrorEvent
    _ApprovalVerdict --> ErrorInfo
    _ApprovalVerdict --> Response
    _ApprovalVerdict --> CancelledEvent
    _ApprovalVerdict --> ClientTaskCancelEvent
    _ApprovalVerdict --> CompactionCompletedEvent
    _ApprovalVerdict --> CompactionInProgressEvent
    _ApprovalVerdict --> CompletedEvent
    _ApprovalVerdict --> CreatedEvent
    _ApprovalVerdict --> ElicitationRequestEvent
    _ApprovalVerdict --> ErrorEvent
    _ApprovalVerdict --> FailedEvent
    _ApprovalVerdict --> IncompleteEvent
    _ApprovalVerdict --> InProgressEvent
    _ApprovalVerdict --> OutputItemDoneEvent
    _ApprovalVerdict --> OutputTextDeltaEvent
    _ApprovalVerdict --> QueuedEvent
    _ApprovalVerdict --> ReasoningStartedEvent
    _ApprovalVerdict --> ReasoningSummaryTextDeltaEvent
    _ApprovalVerdict --> ReasoningTextDeltaEvent
    _ApprovalVerdict --> RetryErrorDetail
    _ApprovalVerdict --> ToolCallInfo
    _ApprovalVerdict --> ElicitationRequestCtx
    _ApprovalVerdict --> EventTape
    _ApprovalVerdict --> PipelineCounters
    _ApprovalVerdict --> TapeEntry
    _ApprovalVerdict --> SessionInputConsumedEvent
    _ApprovalVerdict --> ElicitationResolvedEvent
    _ApprovalVerdict --> SessionChildSessionUpdatedEvent
    _BangInputLexer --> FileMentionCompleter
    _BangInputLexer --> Document
    _BangInputLexer --> SkillSpec
    _BangInputLexer --> SessionStatusEvent
    _BangInputLexer --> BannerLine
    _BangInputLexer --> CompactionCompleted
    _BangInputLexer --> CompactionInProgress
    _BangInputLexer --> ElicitationRequest
    _BangInputLexer --> ReasoningDelta
    _BangInputLexer --> ReasoningStarted
    _BangInputLexer --> ReasoningSummaryDelta
    _BangInputLexer --> ResponseCancelled
    _BangInputLexer --> ResponseCompleted
    _BangInputLexer --> ResponseCreated
    _BangInputLexer --> ResponseFailed
    _BangInputLexer --> ResponseIncomplete
    _BangInputLexer --> ResponseInProgress
    _BangInputLexer --> ResponseQueued
    _BangInputLexer --> TextDelta
    _BangInputLexer --> ErrorEvent
    _BangInputLexer --> ErrorInfo
    _BangInputLexer --> Response
    _BangInputLexer --> CancelledEvent
    _BangInputLexer --> ClientTaskCancelEvent
    _BangInputLexer --> CompactionCompletedEvent
    _BangInputLexer --> CompactionInProgressEvent
    _BangInputLexer --> CompletedEvent
    _BangInputLexer --> CreatedEvent
    _BangInputLexer --> ElicitationRequestEvent
    _BangInputLexer --> ErrorEvent
    _BangInputLexer --> FailedEvent
    _BangInputLexer --> IncompleteEvent
    _BangInputLexer --> InProgressEvent
    _BangInputLexer --> OutputItemDoneEvent
    _BangInputLexer --> OutputTextDeltaEvent
    _BangInputLexer --> QueuedEvent
    _BangInputLexer --> ReasoningStartedEvent
    _BangInputLexer --> ReasoningSummaryTextDeltaEvent
    _BangInputLexer --> ReasoningTextDeltaEvent
    _BangInputLexer --> RetryErrorDetail
    _BangInputLexer --> ToolCallInfo
    _BangInputLexer --> ElicitationRequestCtx
    _BangInputLexer --> EventTape
    _BangInputLexer --> PipelineCounters
    _BangInputLexer --> TapeEntry
    _BangInputLexer --> SessionInputConsumedEvent
    _BangInputLexer --> ElicitationResolvedEvent
    _BangInputLexer --> SessionChildSessionUpdatedEvent
    _ContextItems --> FileMentionCompleter
    _ContextItems --> Document
    _ContextItems --> SkillSpec
    _ContextItems --> SessionStatusEvent
    _ContextItems --> BannerLine
    _ContextItems --> CompactionCompleted
    _ContextItems --> CompactionInProgress
    _ContextItems --> ElicitationRequest
    _ContextItems --> ReasoningDelta
    _ContextItems --> ReasoningStarted
    _ContextItems --> ReasoningSummaryDelta
    _ContextItems --> ResponseCancelled
    _ContextItems --> ResponseCompleted
    _ContextItems --> ResponseCreated
    _ContextItems --> ResponseFailed
    _ContextItems --> ResponseIncomplete
    _ContextItems --> ResponseInProgress
    _ContextItems --> ResponseQueued
    _ContextItems --> TextDelta
    _ContextItems --> ErrorEvent
    _ContextItems --> ErrorInfo
    _ContextItems --> Response
    _ContextItems --> CancelledEvent
    _ContextItems --> ClientTaskCancelEvent
    _ContextItems --> CompactionCompletedEvent
    _ContextItems --> CompactionInProgressEvent
    _ContextItems --> CompletedEvent
    _ContextItems --> CreatedEvent
    _ContextItems --> ElicitationRequestEvent
    _ContextItems --> ErrorEvent
    _ContextItems --> FailedEvent
    _ContextItems --> IncompleteEvent
    _ContextItems --> InProgressEvent
    _ContextItems --> OutputItemDoneEvent
    _ContextItems --> OutputTextDeltaEvent
    _ContextItems --> QueuedEvent
    _ContextItems --> ReasoningStartedEvent
    _ContextItems --> ReasoningSummaryTextDeltaEvent
    _ContextItems --> ReasoningTextDeltaEvent
    _ContextItems --> RetryErrorDetail
    _ContextItems --> ToolCallInfo
    _ContextItems --> ElicitationRequestCtx
    _ContextItems --> EventTape
    _ContextItems --> PipelineCounters
    _ContextItems --> TapeEntry
    _ContextItems --> SessionInputConsumedEvent
    _ContextItems --> ElicitationResolvedEvent
    _ContextItems --> SessionChildSessionUpdatedEvent
    _FieldInputState --> FileMentionCompleter
    _FieldInputState --> Document
    _FieldInputState --> SkillSpec
    _FieldInputState --> SessionStatusEvent
    _FieldInputState --> BannerLine
    _FieldInputState --> CompactionCompleted
    _FieldInputState --> CompactionInProgress
    _FieldInputState --> ElicitationRequest
    _FieldInputState --> ReasoningDelta
    _FieldInputState --> ReasoningStarted
    _FieldInputState --> ReasoningSummaryDelta
    _FieldInputState --> ResponseCancelled
    _FieldInputState --> ResponseCompleted
    _FieldInputState --> ResponseCreated
    _FieldInputState --> ResponseFailed
    _FieldInputState --> ResponseIncomplete
    _FieldInputState --> ResponseInProgress
    _FieldInputState --> ResponseQueued
    _FieldInputState --> TextDelta
    _FieldInputState --> ErrorEvent
    _FieldInputState --> ErrorInfo
    _FieldInputState --> Response
    _FieldInputState --> CancelledEvent
    _FieldInputState --> ClientTaskCancelEvent
    _FieldInputState --> CompactionCompletedEvent
    _FieldInputState --> CompactionInProgressEvent
    _FieldInputState --> CompletedEvent
    _FieldInputState --> CreatedEvent
    _FieldInputState --> ElicitationRequestEvent
    _FieldInputState --> ErrorEvent
    _FieldInputState --> FailedEvent
    _FieldInputState --> IncompleteEvent
    _FieldInputState --> InProgressEvent
    _FieldInputState --> OutputItemDoneEvent
    _FieldInputState --> OutputTextDeltaEvent
    _FieldInputState --> QueuedEvent
    _FieldInputState --> ReasoningStartedEvent
    _FieldInputState --> ReasoningSummaryTextDeltaEvent
    _FieldInputState --> ReasoningTextDeltaEvent
    _FieldInputState --> RetryErrorDetail
    _FieldInputState --> ToolCallInfo
    _FieldInputState --> ElicitationRequestCtx
    _FieldInputState --> EventTape
    _FieldInputState --> PipelineCounters
    _FieldInputState --> TapeEntry
    _FieldInputState --> SessionInputConsumedEvent
    _FieldInputState --> ElicitationResolvedEvent
    _FieldInputState --> SessionChildSessionUpdatedEvent
    _OutputItemRenderPlan --> FileMentionCompleter
    _OutputItemRenderPlan --> Document
    _OutputItemRenderPlan --> SkillSpec
    _OutputItemRenderPlan --> SessionStatusEvent
    _OutputItemRenderPlan --> BannerLine
    _OutputItemRenderPlan --> CompactionCompleted
    _OutputItemRenderPlan --> CompactionInProgress
    _OutputItemRenderPlan --> ElicitationRequest
    _OutputItemRenderPlan --> ReasoningDelta
    _OutputItemRenderPlan --> ReasoningStarted
    _OutputItemRenderPlan --> ReasoningSummaryDelta
    _OutputItemRenderPlan --> ResponseCancelled
    _OutputItemRenderPlan --> ResponseCompleted
    _OutputItemRenderPlan --> ResponseCreated
    _OutputItemRenderPlan --> ResponseFailed
    _OutputItemRenderPlan --> ResponseIncomplete
    _OutputItemRenderPlan --> ResponseInProgress
    _OutputItemRenderPlan --> ResponseQueued
    _OutputItemRenderPlan --> TextDelta
    _OutputItemRenderPlan --> ErrorEvent
    _OutputItemRenderPlan --> ErrorInfo
    _OutputItemRenderPlan --> Response
    _OutputItemRenderPlan --> CancelledEvent
    _OutputItemRenderPlan --> ClientTaskCancelEvent
    _OutputItemRenderPlan --> CompactionCompletedEvent
    _OutputItemRenderPlan --> CompactionInProgressEvent
    _OutputItemRenderPlan --> CompletedEvent
    _OutputItemRenderPlan --> CreatedEvent
    _OutputItemRenderPlan --> ElicitationRequestEvent
    _OutputItemRenderPlan --> ErrorEvent
    _OutputItemRenderPlan --> FailedEvent
    _OutputItemRenderPlan --> IncompleteEvent
    _OutputItemRenderPlan --> InProgressEvent
    _OutputItemRenderPlan --> OutputItemDoneEvent
    _OutputItemRenderPlan --> OutputTextDeltaEvent
    _OutputItemRenderPlan --> QueuedEvent
    _OutputItemRenderPlan --> ReasoningStartedEvent
    _OutputItemRenderPlan --> ReasoningSummaryTextDeltaEvent
    _OutputItemRenderPlan --> ReasoningTextDeltaEvent
    _OutputItemRenderPlan --> RetryErrorDetail
    _OutputItemRenderPlan --> ToolCallInfo
    _OutputItemRenderPlan --> ElicitationRequestCtx
    _OutputItemRenderPlan --> EventTape
    _OutputItemRenderPlan --> PipelineCounters
    _OutputItemRenderPlan --> TapeEntry
    _OutputItemRenderPlan --> SessionInputConsumedEvent
    _OutputItemRenderPlan --> ElicitationResolvedEvent
    _OutputItemRenderPlan --> SessionChildSessionUpdatedEvent
    _SessionsChatReplAdapter --> FileMentionCompleter
    _SessionsChatReplAdapter --> Document
    _SessionsChatReplAdapter --> SkillSpec
    _SessionsChatReplAdapter --> SessionStatusEvent
    _SessionsChatReplAdapter --> BannerLine
    _SessionsChatReplAdapter --> CompactionCompleted
    _SessionsChatReplAdapter --> CompactionInProgress
    _SessionsChatReplAdapter --> ElicitationRequest
    _SessionsChatReplAdapter --> ReasoningDelta
    _SessionsChatReplAdapter --> ReasoningStarted
    _SessionsChatReplAdapter --> ReasoningSummaryDelta
    _SessionsChatReplAdapter --> ResponseCancelled
    _SessionsChatReplAdapter --> ResponseCompleted
    _SessionsChatReplAdapter --> ResponseCreated
    _SessionsChatReplAdapter --> ResponseFailed
    _SessionsChatReplAdapter --> ResponseIncomplete
    _SessionsChatReplAdapter --> ResponseInProgress
    _SessionsChatReplAdapter --> ResponseQueued
    _SessionsChatReplAdapter --> TextDelta
    _SessionsChatReplAdapter --> ErrorEvent
    _SessionsChatReplAdapter --> ErrorInfo
    _SessionsChatReplAdapter --> Response
    _SessionsChatReplAdapter --> CancelledEvent
    _SessionsChatReplAdapter --> ClientTaskCancelEvent
    _SessionsChatReplAdapter --> CompactionCompletedEvent
    _SessionsChatReplAdapter --> CompactionInProgressEvent
    _SessionsChatReplAdapter --> CompletedEvent
    _SessionsChatReplAdapter --> CreatedEvent
    _SessionsChatReplAdapter --> ElicitationRequestEvent
    _SessionsChatReplAdapter --> ErrorEvent
    _SessionsChatReplAdapter --> FailedEvent
    _SessionsChatReplAdapter --> IncompleteEvent
    _SessionsChatReplAdapter --> InProgressEvent
    _SessionsChatReplAdapter --> OutputItemDoneEvent
    _SessionsChatReplAdapter --> OutputTextDeltaEvent
    _SessionsChatReplAdapter --> QueuedEvent
    _SessionsChatReplAdapter --> ReasoningStartedEvent
    _SessionsChatReplAdapter --> ReasoningSummaryTextDeltaEvent
    _SessionsChatReplAdapter --> ReasoningTextDeltaEvent
    _SessionsChatReplAdapter --> RetryErrorDetail
    _SessionsChatReplAdapter --> ToolCallInfo
    _SessionsChatReplAdapter --> ElicitationRequestCtx
    _SessionsChatReplAdapter --> EventTape
    _SessionsChatReplAdapter --> PipelineCounters
    _SessionsChatReplAdapter --> TapeEntry
    _SessionsChatReplAdapter --> SessionInputConsumedEvent
    _SessionsChatReplAdapter --> ElicitationResolvedEvent
    _SessionsChatReplAdapter --> SessionChildSessionUpdatedEvent
    _SessionSnapshot --> FileMentionCompleter
    _SessionSnapshot --> Document
    _SessionSnapshot --> SkillSpec
    _SessionSnapshot --> SessionStatusEvent
    _SessionSnapshot --> BannerLine
    _SessionSnapshot --> CompactionCompleted
    _SessionSnapshot --> CompactionInProgress
    _SessionSnapshot --> ElicitationRequest
    _SessionSnapshot --> ReasoningDelta
    _SessionSnapshot --> ReasoningStarted
    _SessionSnapshot --> ReasoningSummaryDelta
    _SessionSnapshot --> ResponseCancelled
    _SessionSnapshot --> ResponseCompleted
    _SessionSnapshot --> ResponseCreated
    _SessionSnapshot --> ResponseFailed
    _SessionSnapshot --> ResponseIncomplete
    _SessionSnapshot --> ResponseInProgress
    _SessionSnapshot --> ResponseQueued
    _SessionSnapshot --> TextDelta
    _SessionSnapshot --> ErrorEvent
    _SessionSnapshot --> ErrorInfo
    _SessionSnapshot --> Response
    _SessionSnapshot --> CancelledEvent
    _SessionSnapshot --> ClientTaskCancelEvent
    _SessionSnapshot --> CompactionCompletedEvent
    _SessionSnapshot --> CompactionInProgressEvent
    _SessionSnapshot --> CompletedEvent
    _SessionSnapshot --> CreatedEvent
    _SessionSnapshot --> ElicitationRequestEvent
    _SessionSnapshot --> ErrorEvent
    _SessionSnapshot --> FailedEvent
    _SessionSnapshot --> IncompleteEvent
    _SessionSnapshot --> InProgressEvent
    _SessionSnapshot --> OutputItemDoneEvent
    _SessionSnapshot --> OutputTextDeltaEvent
    _SessionSnapshot --> QueuedEvent
    _SessionSnapshot --> ReasoningStartedEvent
    _SessionSnapshot --> ReasoningSummaryTextDeltaEvent
    _SessionSnapshot --> ReasoningTextDeltaEvent
    _SessionSnapshot --> RetryErrorDetail
    _SessionSnapshot --> ToolCallInfo
    _SessionSnapshot --> ElicitationRequestCtx
    _SessionSnapshot --> EventTape
    _SessionSnapshot --> PipelineCounters
    _SessionSnapshot --> TapeEntry
    _SessionSnapshot --> SessionInputConsumedEvent
    _SessionSnapshot --> ElicitationResolvedEvent
    _SessionSnapshot --> SessionChildSessionUpdatedEvent
    _SlashCommandCompleter --> FileMentionCompleter
    _SlashCommandCompleter --> Document
    _SlashCommandCompleter --> SkillSpec
    _SlashCommandCompleter --> SessionStatusEvent
    _SlashCommandCompleter --> BannerLine
    _SlashCommandCompleter --> CompactionCompleted
    _SlashCommandCompleter --> CompactionInProgress
    _SlashCommandCompleter --> ElicitationRequest
    _SlashCommandCompleter --> ReasoningDelta
    _SlashCommandCompleter --> ReasoningStarted
    _SlashCommandCompleter --> ReasoningSummaryDelta
    _SlashCommandCompleter --> ResponseCancelled
    _SlashCommandCompleter --> ResponseCompleted
    _SlashCommandCompleter --> ResponseCreated
    _SlashCommandCompleter --> ResponseFailed
    _SlashCommandCompleter --> ResponseIncomplete
    _SlashCommandCompleter --> ResponseInProgress
    _SlashCommandCompleter --> ResponseQueued
    _SlashCommandCompleter --> TextDelta
    _SlashCommandCompleter --> ErrorEvent
    _SlashCommandCompleter --> ErrorInfo
    _SlashCommandCompleter --> Response
    _SlashCommandCompleter --> CancelledEvent
    _SlashCommandCompleter --> ClientTaskCancelEvent
    _SlashCommandCompleter --> CompactionCompletedEvent
    _SlashCommandCompleter --> CompactionInProgressEvent
    _SlashCommandCompleter --> CompletedEvent
    _SlashCommandCompleter --> CreatedEvent
    _SlashCommandCompleter --> ElicitationRequestEvent
    _SlashCommandCompleter --> ErrorEvent
    _SlashCommandCompleter --> FailedEvent
    _SlashCommandCompleter --> IncompleteEvent
    _SlashCommandCompleter --> InProgressEvent
    _SlashCommandCompleter --> OutputItemDoneEvent
    _SlashCommandCompleter --> OutputTextDeltaEvent
    _SlashCommandCompleter --> QueuedEvent
    _SlashCommandCompleter --> ReasoningStartedEvent
    _SlashCommandCompleter --> ReasoningSummaryTextDeltaEvent
    _SlashCommandCompleter --> ReasoningTextDeltaEvent
    _SlashCommandCompleter --> RetryErrorDetail
    _SlashCommandCompleter --> ToolCallInfo
    _SlashCommandCompleter --> ElicitationRequestCtx
    _SlashCommandCompleter --> EventTape
    _SlashCommandCompleter --> PipelineCounters
    _SlashCommandCompleter --> TapeEntry
    _SlashCommandCompleter --> SessionInputConsumedEvent
    _SlashCommandCompleter --> ElicitationResolvedEvent
    _SlashCommandCompleter --> SessionChildSessionUpdatedEvent
    _StartupHeader --> FileMentionCompleter
    _StartupHeader --> Document
    _StartupHeader --> SkillSpec
    _StartupHeader --> SessionStatusEvent
    _StartupHeader --> BannerLine
    _StartupHeader --> CompactionCompleted
    _StartupHeader --> CompactionInProgress
    _StartupHeader --> ElicitationRequest
    _StartupHeader --> ReasoningDelta
    _StartupHeader --> ReasoningStarted
    _StartupHeader --> ReasoningSummaryDelta
    _StartupHeader --> ResponseCancelled
    _StartupHeader --> ResponseCompleted
    _StartupHeader --> ResponseCreated
    _StartupHeader --> ResponseFailed
    _StartupHeader --> ResponseIncomplete
    _StartupHeader --> ResponseInProgress
    _StartupHeader --> ResponseQueued
    _StartupHeader --> TextDelta
    _StartupHeader --> ErrorEvent
    _StartupHeader --> ErrorInfo
    _StartupHeader --> Response
    _StartupHeader --> CancelledEvent
    _StartupHeader --> ClientTaskCancelEvent
    _StartupHeader --> CompactionCompletedEvent
    _StartupHeader --> CompactionInProgressEvent
    _StartupHeader --> CompletedEvent
    _StartupHeader --> CreatedEvent
    _StartupHeader --> ElicitationRequestEvent
    _StartupHeader --> ErrorEvent
    _StartupHeader --> FailedEvent
    _StartupHeader --> IncompleteEvent
    _StartupHeader --> InProgressEvent
    _StartupHeader --> OutputItemDoneEvent
    _StartupHeader --> OutputTextDeltaEvent
    _StartupHeader --> QueuedEvent
    _StartupHeader --> ReasoningStartedEvent
    _StartupHeader --> ReasoningSummaryTextDeltaEvent
    _StartupHeader --> ReasoningTextDeltaEvent
    _StartupHeader --> RetryErrorDetail
    _StartupHeader --> ToolCallInfo
    _StartupHeader --> ElicitationRequestCtx
    _StartupHeader --> EventTape
    _StartupHeader --> PipelineCounters
    _StartupHeader --> TapeEntry
    _StartupHeader --> SessionInputConsumedEvent
    _StartupHeader --> ElicitationResolvedEvent
    _StartupHeader --> SessionChildSessionUpdatedEvent
    _TerminalInfo --> FileMentionCompleter
    _TerminalInfo --> Document
    _TerminalInfo --> SkillSpec
    _TerminalInfo --> SessionStatusEvent
    _TerminalInfo --> BannerLine
    _TerminalInfo --> CompactionCompleted
    _TerminalInfo --> CompactionInProgress
    _TerminalInfo --> ElicitationRequest
    _TerminalInfo --> ReasoningDelta
    _TerminalInfo --> ReasoningStarted
    _TerminalInfo --> ReasoningSummaryDelta
    _TerminalInfo --> ResponseCancelled
    _TerminalInfo --> ResponseCompleted
    _TerminalInfo --> ResponseCreated
    _TerminalInfo --> ResponseFailed
    _TerminalInfo --> ResponseIncomplete
    _TerminalInfo --> ResponseInProgress
    _TerminalInfo --> ResponseQueued
    _TerminalInfo --> TextDelta
    _TerminalInfo --> ErrorEvent
    _TerminalInfo --> ErrorInfo
    _TerminalInfo --> Response
    _TerminalInfo --> CancelledEvent
    _TerminalInfo --> ClientTaskCancelEvent
    _TerminalInfo --> CompactionCompletedEvent
    _TerminalInfo --> CompactionInProgressEvent
    _TerminalInfo --> CompletedEvent
    _TerminalInfo --> CreatedEvent
    _TerminalInfo --> ElicitationRequestEvent
    _TerminalInfo --> ErrorEvent
    _TerminalInfo --> FailedEvent
    _TerminalInfo --> IncompleteEvent
    _TerminalInfo --> InProgressEvent
    _TerminalInfo --> OutputItemDoneEvent
    _TerminalInfo --> OutputTextDeltaEvent
    _TerminalInfo --> QueuedEvent
    _TerminalInfo --> ReasoningStartedEvent
    _TerminalInfo --> ReasoningSummaryTextDeltaEvent
    _TerminalInfo --> ReasoningTextDeltaEvent
    _TerminalInfo --> RetryErrorDetail
    _TerminalInfo --> ToolCallInfo
    _TerminalInfo --> ElicitationRequestCtx
    _TerminalInfo --> EventTape
    _TerminalInfo --> PipelineCounters
    _TerminalInfo --> TapeEntry
    _TerminalInfo --> SessionInputConsumedEvent
    _TerminalInfo --> ElicitationResolvedEvent
    _TerminalInfo --> SessionChildSessionUpdatedEvent
    TimedFormatter --> FileMentionCompleter
    TimedFormatter --> Document
    TimedFormatter --> SkillSpec
    TimedFormatter --> SessionStatusEvent
    TimedFormatter --> BannerLine
    TimedFormatter --> CompactionCompleted
    TimedFormatter --> CompactionInProgress
    TimedFormatter --> ElicitationRequest
    TimedFormatter --> ReasoningDelta
    TimedFormatter --> ReasoningStarted
    TimedFormatter --> ReasoningSummaryDelta
    TimedFormatter --> ResponseCancelled
    TimedFormatter --> ResponseCompleted
    TimedFormatter --> ResponseCreated
    TimedFormatter --> ResponseFailed
    TimedFormatter --> ResponseIncomplete
    TimedFormatter --> ResponseInProgress
    TimedFormatter --> ResponseQueued
    TimedFormatter --> TextDelta
    TimedFormatter --> ErrorEvent
    TimedFormatter --> ErrorInfo
    TimedFormatter --> Response
    TimedFormatter --> CancelledEvent
    TimedFormatter --> ClientTaskCancelEvent
    TimedFormatter --> CompactionCompletedEvent
    TimedFormatter --> CompactionInProgressEvent
    TimedFormatter --> CompletedEvent
    TimedFormatter --> CreatedEvent
    TimedFormatter --> ElicitationRequestEvent
    TimedFormatter --> ErrorEvent
    TimedFormatter --> FailedEvent
    TimedFormatter --> IncompleteEvent
    TimedFormatter --> InProgressEvent
    TimedFormatter --> OutputItemDoneEvent
    TimedFormatter --> OutputTextDeltaEvent
    TimedFormatter --> QueuedEvent
    TimedFormatter --> ReasoningStartedEvent
    TimedFormatter --> ReasoningSummaryTextDeltaEvent
    TimedFormatter --> ReasoningTextDeltaEvent
    TimedFormatter --> RetryErrorDetail
    TimedFormatter --> ToolCallInfo
    TimedFormatter --> ElicitationRequestCtx
    TimedFormatter --> EventTape
    TimedFormatter --> PipelineCounters
    TimedFormatter --> TapeEntry
    TimedFormatter --> SessionInputConsumedEvent
    TimedFormatter --> ElicitationResolvedEvent
    TimedFormatter --> SessionChildSessionUpdatedEvent
    _TurnProseTracker --> FileMentionCompleter
    _TurnProseTracker --> Document
    _TurnProseTracker --> SkillSpec
    _TurnProseTracker --> SessionStatusEvent
    _TurnProseTracker --> BannerLine
    _TurnProseTracker --> CompactionCompleted
    _TurnProseTracker --> CompactionInProgress
    _TurnProseTracker --> ElicitationRequest
    _TurnProseTracker --> ReasoningDelta
    _TurnProseTracker --> ReasoningStarted
    _TurnProseTracker --> ReasoningSummaryDelta
    _TurnProseTracker --> ResponseCancelled
    _TurnProseTracker --> ResponseCompleted
    _TurnProseTracker --> ResponseCreated
    _TurnProseTracker --> ResponseFailed
    _TurnProseTracker --> ResponseIncomplete
    _TurnProseTracker --> ResponseInProgress
    _TurnProseTracker --> ResponseQueued
    _TurnProseTracker --> TextDelta
    _TurnProseTracker --> ErrorEvent
    _TurnProseTracker --> ErrorInfo
    _TurnProseTracker --> Response
    _TurnProseTracker --> CancelledEvent
    _TurnProseTracker --> ClientTaskCancelEvent
    _TurnProseTracker --> CompactionCompletedEvent
    _TurnProseTracker --> CompactionInProgressEvent
    _TurnProseTracker --> CompletedEvent
    _TurnProseTracker --> CreatedEvent
    _TurnProseTracker --> ElicitationRequestEvent
    _TurnProseTracker --> ErrorEvent
    _TurnProseTracker --> FailedEvent
    _TurnProseTracker --> IncompleteEvent
    _TurnProseTracker --> InProgressEvent
    _TurnProseTracker --> OutputItemDoneEvent
    _TurnProseTracker --> OutputTextDeltaEvent
    _TurnProseTracker --> QueuedEvent
    _TurnProseTracker --> ReasoningStartedEvent
    _TurnProseTracker --> ReasoningSummaryTextDeltaEvent
    _TurnProseTracker --> ReasoningTextDeltaEvent
    _TurnProseTracker --> RetryErrorDetail
    _TurnProseTracker --> ToolCallInfo
    _TurnProseTracker --> ElicitationRequestCtx
    _TurnProseTracker --> EventTape
    _TurnProseTracker --> PipelineCounters
    _TurnProseTracker --> TapeEntry
    _TurnProseTracker --> SessionInputConsumedEvent
    _TurnProseTracker --> ElicitationResolvedEvent
    _TurnProseTracker --> SessionChildSessionUpdatedEvent
    ResponsesNamespace --> OmnigentClient
    ResponsesNamespace --> ToolCallDenied
    ResponsesNamespace --> ClientTaskCancel
    ResponsesNamespace --> CompactionInProgress
    ResponsesNamespace --> ElicitationRequest
    ResponsesNamespace --> ErrorEvent
    ResponsesNamespace --> MessageDone
    ResponsesNamespace --> NativeToolCall
    ResponsesNamespace --> OutputFileDone
    ResponsesNamespace --> ReasoningDelta
    ResponsesNamespace --> ReasoningStarted
    ResponsesNamespace --> ReasoningSummaryDelta
    ResponsesNamespace --> ResponseCancelled
    ResponsesNamespace --> ResponseCompleted
    ResponsesNamespace --> ResponseCreated
    ResponsesNamespace --> ResponseFailed
    ResponsesNamespace --> ResponseIncomplete
    ResponsesNamespace --> RetryEvent
    ResponsesNamespace --> TextDelta
    ResponsesNamespace --> ToolCall
    ResponsesNamespace --> ToolResult
    ResponsesNamespace --> CompactionStartCtx
    ResponsesNamespace --> ElicitationRequestCtx
    ResponsesNamespace --> FileOutputCtx
    ResponsesNamespace --> MessageEndCtx
    ResponsesNamespace --> MessageStartCtx
    ResponsesNamespace --> NativeToolCallCtx
    ResponsesNamespace --> ReasoningEndCtx
    ResponsesNamespace --> ResponseEndCtx
    ResponsesNamespace --> ResponseStartCtx
    ResponsesNamespace --> RetryCtx
    ResponsesNamespace --> ServerErrorCtx
    ResponsesNamespace --> StreamHooks
    ResponsesNamespace --> ToolCallEndCtx
    ResponsesNamespace --> ToolCallInfo
    ResponsesNamespace --> ToolCallStartCtx
    ResponsesNamespace --> ToolHandler
    ResponsesNamespace --> ToolResultInfo
    ResponsesNamespace --> ToolResultsReadyCtx
    ResponsesNamespace --> ReasoningStartCtx
    ResponsesNamespace --> Response
    InterruptEvent --> CompletedEvent
    InterruptEvent --> CreatedEvent
    InterruptEvent --> ElicitationRequestEvent
    InterruptEvent --> FailedEvent
    InterruptEvent --> HeartbeatEvent
    InterruptEvent --> InProgressEvent
    InterruptEvent --> OutputItemDoneEvent
    InterruptEvent --> PolicyEvaluationRequestEvent
    InterruptEvent --> Usage
    InterruptEvent --> CancelledEvent
    MessageEvent --> CompletedEvent
    MessageEvent --> CreatedEvent
    MessageEvent --> ElicitationRequestEvent
    MessageEvent --> FailedEvent
    MessageEvent --> HeartbeatEvent
    MessageEvent --> InProgressEvent
    MessageEvent --> OutputItemDoneEvent
    MessageEvent --> PolicyEvaluationRequestEvent
    MessageEvent --> Usage
    MessageEvent --> CancelledEvent
    ToolResultEvent --> CompletedEvent
    ToolResultEvent --> CreatedEvent
    ToolResultEvent --> ElicitationRequestEvent
    ToolResultEvent --> FailedEvent
    ToolResultEvent --> HeartbeatEvent
    ToolResultEvent --> InProgressEvent
    ToolResultEvent --> OutputItemDoneEvent
    ToolResultEvent --> PolicyEvaluationRequestEvent
    ToolResultEvent --> Usage
    ToolResultEvent --> CancelledEvent
    _SSEEventBase <|-- CancelledEvent
    CancelledEvent --> _SessionSnapshot
    CancelledEvent --> _StartupHeader
    CancelledEvent --> TimedFormatter
    CancelledEvent --> _ApprovalVerdict
    CancelledEvent --> _ApprovalState
    CancelledEvent --> _FieldInputState
    CancelledEvent --> _SessionsChatReplAdapter
    CancelledEvent --> _OutputItemRenderPlan
    CancelledEvent --> _TurnProseTracker
    CancelledEvent --> _ContextItems
    CancelledEvent --> _TerminalInfo
    CancelledEvent --> _SlashCommandCompleter
    CancelledEvent --> _BangInputLexer
    CancelledEvent --> MessageEvent
    CancelledEvent --> InterruptEvent
    CancelledEvent --> ToolResultEvent
    CancelledEvent --> SessionToolCallInfo
    CancelledEvent --> _AgentToolsGetter
    CancelledEvent --> _StreamHookState
    CancelledEvent --> SessionsChat
    CancelledEvent --> _FilesUploader
    CancelledEvent --> _FilesGetter
    _SSEEventBase <|-- ClientTaskCancelEvent
    ClientTaskCancelEvent --> _SessionSnapshot
    ClientTaskCancelEvent --> _StartupHeader
    ClientTaskCancelEvent --> TimedFormatter
    ClientTaskCancelEvent --> _ApprovalVerdict
    ClientTaskCancelEvent --> _ApprovalState
    ClientTaskCancelEvent --> _FieldInputState
    ClientTaskCancelEvent --> _SessionsChatReplAdapter
    ClientTaskCancelEvent --> _OutputItemRenderPlan
    ClientTaskCancelEvent --> _TurnProseTracker
    ClientTaskCancelEvent --> _ContextItems
    ClientTaskCancelEvent --> _TerminalInfo
    ClientTaskCancelEvent --> _SlashCommandCompleter
    ClientTaskCancelEvent --> _BangInputLexer
    _SSEEventBase <|-- CompactionCompletedEvent
    CompactionCompletedEvent --> _SessionSnapshot
    CompactionCompletedEvent --> _StartupHeader
    CompactionCompletedEvent --> TimedFormatter
    CompactionCompletedEvent --> _ApprovalVerdict
    CompactionCompletedEvent --> _ApprovalState
    CompactionCompletedEvent --> _FieldInputState
    CompactionCompletedEvent --> _SessionsChatReplAdapter
    CompactionCompletedEvent --> _OutputItemRenderPlan
    CompactionCompletedEvent --> _TurnProseTracker
    CompactionCompletedEvent --> _ContextItems
    CompactionCompletedEvent --> _TerminalInfo
    CompactionCompletedEvent --> _SlashCommandCompleter
    CompactionCompletedEvent --> _BangInputLexer
    _SSEEventBase <|-- CompactionFailedEvent
    _SSEEventBase <|-- CompactionInProgressEvent
    CompactionInProgressEvent --> _SessionSnapshot
    CompactionInProgressEvent --> _StartupHeader
    CompactionInProgressEvent --> TimedFormatter
    CompactionInProgressEvent --> _ApprovalVerdict
    CompactionInProgressEvent --> _ApprovalState
    CompactionInProgressEvent --> _FieldInputState
    CompactionInProgressEvent --> _SessionsChatReplAdapter
    CompactionInProgressEvent --> _OutputItemRenderPlan
    CompactionInProgressEvent --> _TurnProseTracker
    CompactionInProgressEvent --> _ContextItems
    CompactionInProgressEvent --> _TerminalInfo
    CompactionInProgressEvent --> _SlashCommandCompleter
    CompactionInProgressEvent --> _BangInputLexer
    _SSEEventBase <|-- CompletedEvent
    CompletedEvent --> _SessionSnapshot
    CompletedEvent --> _StartupHeader
    CompletedEvent --> TimedFormatter
    CompletedEvent --> _ApprovalVerdict
    CompletedEvent --> _ApprovalState
    CompletedEvent --> _FieldInputState
    CompletedEvent --> _SessionsChatReplAdapter
    CompletedEvent --> _OutputItemRenderPlan
    CompletedEvent --> _TurnProseTracker
    CompletedEvent --> _ContextItems
    CompletedEvent --> _TerminalInfo
    CompletedEvent --> _SlashCommandCompleter
    CompletedEvent --> _BangInputLexer
    CompletedEvent --> MessageEvent
    CompletedEvent --> InterruptEvent
    CompletedEvent --> ToolResultEvent
    CompletedEvent --> SessionToolCallInfo
    CompletedEvent --> _AgentToolsGetter
    CompletedEvent --> _StreamHookState
    CompletedEvent --> SessionsChat
    CompletedEvent --> _FilesUploader
    CompletedEvent --> _FilesGetter
    CompletedEvent --> _PostEventCall
    CompletedEvent --> _ResolveElicitationCall
    CompletedEvent --> _StreamScript
    CompletedEvent --> _FakeNamespace
    CompletedEvent --> _GatedReadyNamespace
    CompletedEvent --> _UploaderCall
    CompletedEvent --> _FakeUploader
    CompletedEvent --> _GetterCall
    CompletedEvent --> _FakeGetter
    CompletedEvent --> _AgentToolsCall
    CompletedEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- CreatedEvent
    CreatedEvent --> _SessionSnapshot
    CreatedEvent --> _StartupHeader
    CreatedEvent --> TimedFormatter
    CreatedEvent --> _ApprovalVerdict
    CreatedEvent --> _ApprovalState
    CreatedEvent --> _FieldInputState
    CreatedEvent --> _SessionsChatReplAdapter
    CreatedEvent --> _OutputItemRenderPlan
    CreatedEvent --> _TurnProseTracker
    CreatedEvent --> _ContextItems
    CreatedEvent --> _TerminalInfo
    CreatedEvent --> _SlashCommandCompleter
    CreatedEvent --> _BangInputLexer
    CreatedEvent --> MessageEvent
    CreatedEvent --> InterruptEvent
    CreatedEvent --> ToolResultEvent
    CreatedEvent --> SessionToolCallInfo
    CreatedEvent --> _AgentToolsGetter
    CreatedEvent --> _StreamHookState
    CreatedEvent --> SessionsChat
    CreatedEvent --> _FilesUploader
    CreatedEvent --> _FilesGetter
    CreatedEvent --> _PostEventCall
    CreatedEvent --> _ResolveElicitationCall
    CreatedEvent --> _StreamScript
    CreatedEvent --> _FakeNamespace
    CreatedEvent --> _GatedReadyNamespace
    CreatedEvent --> _UploaderCall
    CreatedEvent --> _FakeUploader
    CreatedEvent --> _GetterCall
    CreatedEvent --> _FakeGetter
    CreatedEvent --> _AgentToolsCall
    CreatedEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- ElicitationRequestEvent
    ElicitationRequestEvent --> _SessionSnapshot
    ElicitationRequestEvent --> _StartupHeader
    ElicitationRequestEvent --> TimedFormatter
    ElicitationRequestEvent --> _ApprovalVerdict
    ElicitationRequestEvent --> _ApprovalState
    ElicitationRequestEvent --> _FieldInputState
    ElicitationRequestEvent --> _SessionsChatReplAdapter
    ElicitationRequestEvent --> _OutputItemRenderPlan
    ElicitationRequestEvent --> _TurnProseTracker
    ElicitationRequestEvent --> _ContextItems
    ElicitationRequestEvent --> _TerminalInfo
    ElicitationRequestEvent --> _SlashCommandCompleter
    ElicitationRequestEvent --> _BangInputLexer
    ElicitationRequestEvent --> MessageEvent
    ElicitationRequestEvent --> InterruptEvent
    ElicitationRequestEvent --> ToolResultEvent
    ElicitationRequestEvent --> SessionToolCallInfo
    ElicitationRequestEvent --> _AgentToolsGetter
    ElicitationRequestEvent --> _StreamHookState
    ElicitationRequestEvent --> SessionsChat
    ElicitationRequestEvent --> _FilesUploader
    ElicitationRequestEvent --> _FilesGetter
    ElicitationRequestEvent --> _PostEventCall
    ElicitationRequestEvent --> _ResolveElicitationCall
    ElicitationRequestEvent --> _StreamScript
    ElicitationRequestEvent --> _FakeNamespace
    ElicitationRequestEvent --> _GatedReadyNamespace
    ElicitationRequestEvent --> _UploaderCall
    ElicitationRequestEvent --> _FakeUploader
    ElicitationRequestEvent --> _GetterCall
    ElicitationRequestEvent --> _FakeGetter
    ElicitationRequestEvent --> _AgentToolsCall
    ElicitationRequestEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- ElicitationResolvedEvent
    ElicitationResolvedEvent --> _SessionSnapshot
    ElicitationResolvedEvent --> _StartupHeader
    ElicitationResolvedEvent --> TimedFormatter
    ElicitationResolvedEvent --> _ApprovalVerdict
    ElicitationResolvedEvent --> _ApprovalState
    ElicitationResolvedEvent --> _FieldInputState
    ElicitationResolvedEvent --> _SessionsChatReplAdapter
    ElicitationResolvedEvent --> _OutputItemRenderPlan
    ElicitationResolvedEvent --> _TurnProseTracker
    ElicitationResolvedEvent --> _ContextItems
    ElicitationResolvedEvent --> _TerminalInfo
    ElicitationResolvedEvent --> _SlashCommandCompleter
    ElicitationResolvedEvent --> _BangInputLexer
    _SSEEventBase <|-- ErrorEvent
    ErrorEvent --> _SessionSnapshot
    ErrorEvent --> _StartupHeader
    ErrorEvent --> TimedFormatter
    ErrorEvent --> _ApprovalVerdict
    ErrorEvent --> _ApprovalState
    ErrorEvent --> _FieldInputState
    ErrorEvent --> _SessionsChatReplAdapter
    ErrorEvent --> _OutputItemRenderPlan
    ErrorEvent --> _TurnProseTracker
    ErrorEvent --> _ContextItems
    ErrorEvent --> _TerminalInfo
    ErrorEvent --> _SlashCommandCompleter
    ErrorEvent --> _BangInputLexer
    ErrorEvent --> _CapturingHost
    ErrorEvent --> _StubSession
    ErrorEvent --> _StubHost
    ErrorEvent --> _StubFmt
    ErrorEvent --> _StubSkillSession
    ErrorEvent --> _StubSessionsModeSession
    _SSEEventBase <|-- FailedEvent
    FailedEvent --> _SessionSnapshot
    FailedEvent --> _StartupHeader
    FailedEvent --> TimedFormatter
    FailedEvent --> _ApprovalVerdict
    FailedEvent --> _ApprovalState
    FailedEvent --> _FieldInputState
    FailedEvent --> _SessionsChatReplAdapter
    FailedEvent --> _OutputItemRenderPlan
    FailedEvent --> _TurnProseTracker
    FailedEvent --> _ContextItems
    FailedEvent --> _TerminalInfo
    FailedEvent --> _SlashCommandCompleter
    FailedEvent --> _BangInputLexer
    FailedEvent --> MessageEvent
    FailedEvent --> InterruptEvent
    FailedEvent --> ToolResultEvent
    FailedEvent --> SessionToolCallInfo
    FailedEvent --> _AgentToolsGetter
    FailedEvent --> _StreamHookState
    FailedEvent --> SessionsChat
    FailedEvent --> _FilesUploader
    FailedEvent --> _FilesGetter
    _SSEEventBase <|-- HeartbeatEvent
    HeartbeatEvent --> MessageEvent
    HeartbeatEvent --> InterruptEvent
    HeartbeatEvent --> ToolResultEvent
    HeartbeatEvent --> _EchoHarness
    HeartbeatEvent --> _UnclassifiedExceptionHarness
    HeartbeatEvent --> _ShutdownTrackingHarness
    _SSEEventBase <|-- IncompleteEvent
    IncompleteEvent --> _SessionSnapshot
    IncompleteEvent --> _StartupHeader
    IncompleteEvent --> TimedFormatter
    IncompleteEvent --> _ApprovalVerdict
    IncompleteEvent --> _ApprovalState
    IncompleteEvent --> _FieldInputState
    IncompleteEvent --> _SessionsChatReplAdapter
    IncompleteEvent --> _OutputItemRenderPlan
    IncompleteEvent --> _TurnProseTracker
    IncompleteEvent --> _ContextItems
    IncompleteEvent --> _TerminalInfo
    IncompleteEvent --> _SlashCommandCompleter
    IncompleteEvent --> _BangInputLexer
    IncompleteEvent --> SessionToolCallInfo
    IncompleteEvent --> _AgentToolsGetter
    IncompleteEvent --> _StreamHookState
    IncompleteEvent --> SessionsChat
    IncompleteEvent --> _FilesUploader
    IncompleteEvent --> _FilesGetter
    _SSEEventBase <|-- InProgressEvent
    InProgressEvent --> _SessionSnapshot
    InProgressEvent --> _StartupHeader
    InProgressEvent --> TimedFormatter
    InProgressEvent --> _ApprovalVerdict
    InProgressEvent --> _ApprovalState
    InProgressEvent --> _FieldInputState
    InProgressEvent --> _SessionsChatReplAdapter
    InProgressEvent --> _OutputItemRenderPlan
    InProgressEvent --> _TurnProseTracker
    InProgressEvent --> _ContextItems
    InProgressEvent --> _TerminalInfo
    InProgressEvent --> _SlashCommandCompleter
    InProgressEvent --> _BangInputLexer
    InProgressEvent --> MessageEvent
    InProgressEvent --> InterruptEvent
    InProgressEvent --> ToolResultEvent
    InProgressEvent --> SessionToolCallInfo
    InProgressEvent --> _AgentToolsGetter
    InProgressEvent --> _StreamHookState
    InProgressEvent --> SessionsChat
    InProgressEvent --> _FilesUploader
    InProgressEvent --> _FilesGetter
    _SSEEventBase <|-- OutputFileDoneEvent
    OutputFileDoneEvent --> SessionToolCallInfo
    OutputFileDoneEvent --> _AgentToolsGetter
    OutputFileDoneEvent --> _StreamHookState
    OutputFileDoneEvent --> SessionsChat
    OutputFileDoneEvent --> _FilesUploader
    OutputFileDoneEvent --> _FilesGetter
    OutputFileDoneEvent --> _PostEventCall
    OutputFileDoneEvent --> _ResolveElicitationCall
    OutputFileDoneEvent --> _StreamScript
    OutputFileDoneEvent --> _FakeNamespace
    OutputFileDoneEvent --> _GatedReadyNamespace
    OutputFileDoneEvent --> _UploaderCall
    OutputFileDoneEvent --> _FakeUploader
    OutputFileDoneEvent --> _GetterCall
    OutputFileDoneEvent --> _FakeGetter
    OutputFileDoneEvent --> _AgentToolsCall
    OutputFileDoneEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- OutputItemDoneEvent
    OutputItemDoneEvent --> _SessionSnapshot
    OutputItemDoneEvent --> _StartupHeader
    OutputItemDoneEvent --> TimedFormatter
    OutputItemDoneEvent --> _ApprovalVerdict
    OutputItemDoneEvent --> _ApprovalState
    OutputItemDoneEvent --> _FieldInputState
    OutputItemDoneEvent --> _SessionsChatReplAdapter
    OutputItemDoneEvent --> _OutputItemRenderPlan
    OutputItemDoneEvent --> _TurnProseTracker
    OutputItemDoneEvent --> _ContextItems
    OutputItemDoneEvent --> _TerminalInfo
    OutputItemDoneEvent --> _SlashCommandCompleter
    OutputItemDoneEvent --> _BangInputLexer
    OutputItemDoneEvent --> MessageEvent
    OutputItemDoneEvent --> InterruptEvent
    OutputItemDoneEvent --> ToolResultEvent
    OutputItemDoneEvent --> SessionToolCallInfo
    OutputItemDoneEvent --> _AgentToolsGetter
    OutputItemDoneEvent --> _StreamHookState
    OutputItemDoneEvent --> SessionsChat
    OutputItemDoneEvent --> _FilesUploader
    OutputItemDoneEvent --> _FilesGetter
    OutputItemDoneEvent --> _PostEventCall
    OutputItemDoneEvent --> _ResolveElicitationCall
    OutputItemDoneEvent --> _StreamScript
    OutputItemDoneEvent --> _FakeNamespace
    OutputItemDoneEvent --> _GatedReadyNamespace
    OutputItemDoneEvent --> _UploaderCall
    OutputItemDoneEvent --> _FakeUploader
    OutputItemDoneEvent --> _GetterCall
    OutputItemDoneEvent --> _FakeGetter
    OutputItemDoneEvent --> _AgentToolsCall
    OutputItemDoneEvent --> _FakeAgentToolsGetter
    OutputItemDoneEvent --> _EchoHarness
    OutputItemDoneEvent --> _UnclassifiedExceptionHarness
    OutputItemDoneEvent --> _ShutdownTrackingHarness
    _SSEEventBase <|-- OutputTextDeltaEvent
    OutputTextDeltaEvent --> _SessionSnapshot
    OutputTextDeltaEvent --> _StartupHeader
    OutputTextDeltaEvent --> TimedFormatter
    OutputTextDeltaEvent --> _ApprovalVerdict
    OutputTextDeltaEvent --> _ApprovalState
    OutputTextDeltaEvent --> _FieldInputState
    OutputTextDeltaEvent --> _SessionsChatReplAdapter
    OutputTextDeltaEvent --> _OutputItemRenderPlan
    OutputTextDeltaEvent --> _TurnProseTracker
    OutputTextDeltaEvent --> _ContextItems
    OutputTextDeltaEvent --> _TerminalInfo
    OutputTextDeltaEvent --> _SlashCommandCompleter
    OutputTextDeltaEvent --> _BangInputLexer
    OutputTextDeltaEvent --> SessionToolCallInfo
    OutputTextDeltaEvent --> _AgentToolsGetter
    OutputTextDeltaEvent --> _StreamHookState
    OutputTextDeltaEvent --> SessionsChat
    OutputTextDeltaEvent --> _FilesUploader
    OutputTextDeltaEvent --> _FilesGetter
    OutputTextDeltaEvent --> _PostEventCall
    OutputTextDeltaEvent --> _ResolveElicitationCall
    OutputTextDeltaEvent --> _StreamScript
    OutputTextDeltaEvent --> _FakeNamespace
    OutputTextDeltaEvent --> _GatedReadyNamespace
    OutputTextDeltaEvent --> _UploaderCall
    OutputTextDeltaEvent --> _FakeUploader
    OutputTextDeltaEvent --> _GetterCall
    OutputTextDeltaEvent --> _FakeGetter
    OutputTextDeltaEvent --> _AgentToolsCall
    OutputTextDeltaEvent --> _FakeAgentToolsGetter
    OutputTextDeltaEvent --> _EchoHarness
    OutputTextDeltaEvent --> _UnclassifiedExceptionHarness
    OutputTextDeltaEvent --> _ShutdownTrackingHarness
    _SSEEventBase <|-- PolicyEvaluationRequestEvent
    PolicyEvaluationRequestEvent --> MessageEvent
    PolicyEvaluationRequestEvent --> InterruptEvent
    PolicyEvaluationRequestEvent --> ToolResultEvent
    _SSEEventBase <|-- QueuedEvent
    QueuedEvent --> _SessionSnapshot
    QueuedEvent --> _StartupHeader
    QueuedEvent --> TimedFormatter
    QueuedEvent --> _ApprovalVerdict
    QueuedEvent --> _ApprovalState
    QueuedEvent --> _FieldInputState
    QueuedEvent --> _SessionsChatReplAdapter
    QueuedEvent --> _OutputItemRenderPlan
    QueuedEvent --> _TurnProseTracker
    QueuedEvent --> _ContextItems
    QueuedEvent --> _TerminalInfo
    QueuedEvent --> _SlashCommandCompleter
    QueuedEvent --> _BangInputLexer
    QueuedEvent --> SessionToolCallInfo
    QueuedEvent --> _AgentToolsGetter
    QueuedEvent --> _StreamHookState
    QueuedEvent --> SessionsChat
    QueuedEvent --> _FilesUploader
    QueuedEvent --> _FilesGetter
    _SSEEventBase <|-- ReasoningStartedEvent
    ReasoningStartedEvent --> _SessionSnapshot
    ReasoningStartedEvent --> _StartupHeader
    ReasoningStartedEvent --> TimedFormatter
    ReasoningStartedEvent --> _ApprovalVerdict
    ReasoningStartedEvent --> _ApprovalState
    ReasoningStartedEvent --> _FieldInputState
    ReasoningStartedEvent --> _SessionsChatReplAdapter
    ReasoningStartedEvent --> _OutputItemRenderPlan
    ReasoningStartedEvent --> _TurnProseTracker
    ReasoningStartedEvent --> _ContextItems
    ReasoningStartedEvent --> _TerminalInfo
    ReasoningStartedEvent --> _SlashCommandCompleter
    ReasoningStartedEvent --> _BangInputLexer
    ReasoningStartedEvent --> SessionToolCallInfo
    ReasoningStartedEvent --> _AgentToolsGetter
    ReasoningStartedEvent --> _StreamHookState
    ReasoningStartedEvent --> SessionsChat
    ReasoningStartedEvent --> _FilesUploader
    ReasoningStartedEvent --> _FilesGetter
    ReasoningStartedEvent --> _PostEventCall
    ReasoningStartedEvent --> _ResolveElicitationCall
    ReasoningStartedEvent --> _StreamScript
    ReasoningStartedEvent --> _FakeNamespace
    ReasoningStartedEvent --> _GatedReadyNamespace
    ReasoningStartedEvent --> _UploaderCall
    ReasoningStartedEvent --> _FakeUploader
    ReasoningStartedEvent --> _GetterCall
    ReasoningStartedEvent --> _FakeGetter
    ReasoningStartedEvent --> _AgentToolsCall
    ReasoningStartedEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- ReasoningSummaryTextDeltaEvent
    ReasoningSummaryTextDeltaEvent --> _SessionSnapshot
    ReasoningSummaryTextDeltaEvent --> _StartupHeader
    ReasoningSummaryTextDeltaEvent --> TimedFormatter
    ReasoningSummaryTextDeltaEvent --> _ApprovalVerdict
    ReasoningSummaryTextDeltaEvent --> _ApprovalState
    ReasoningSummaryTextDeltaEvent --> _FieldInputState
    ReasoningSummaryTextDeltaEvent --> _SessionsChatReplAdapter
    ReasoningSummaryTextDeltaEvent --> _OutputItemRenderPlan
    ReasoningSummaryTextDeltaEvent --> _TurnProseTracker
    ReasoningSummaryTextDeltaEvent --> _ContextItems
    ReasoningSummaryTextDeltaEvent --> _TerminalInfo
    ReasoningSummaryTextDeltaEvent --> _SlashCommandCompleter
    ReasoningSummaryTextDeltaEvent --> _BangInputLexer
    ReasoningSummaryTextDeltaEvent --> SessionToolCallInfo
    ReasoningSummaryTextDeltaEvent --> _AgentToolsGetter
    ReasoningSummaryTextDeltaEvent --> _StreamHookState
    ReasoningSummaryTextDeltaEvent --> SessionsChat
    ReasoningSummaryTextDeltaEvent --> _FilesUploader
    ReasoningSummaryTextDeltaEvent --> _FilesGetter
    ReasoningSummaryTextDeltaEvent --> _PostEventCall
    ReasoningSummaryTextDeltaEvent --> _ResolveElicitationCall
    ReasoningSummaryTextDeltaEvent --> _StreamScript
    ReasoningSummaryTextDeltaEvent --> _FakeNamespace
    ReasoningSummaryTextDeltaEvent --> _GatedReadyNamespace
    ReasoningSummaryTextDeltaEvent --> _UploaderCall
    ReasoningSummaryTextDeltaEvent --> _FakeUploader
    ReasoningSummaryTextDeltaEvent --> _GetterCall
    ReasoningSummaryTextDeltaEvent --> _FakeGetter
    ReasoningSummaryTextDeltaEvent --> _AgentToolsCall
    ReasoningSummaryTextDeltaEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- ReasoningTextDeltaEvent
    ReasoningTextDeltaEvent --> _SessionSnapshot
    ReasoningTextDeltaEvent --> _StartupHeader
    ReasoningTextDeltaEvent --> TimedFormatter
    ReasoningTextDeltaEvent --> _ApprovalVerdict
    ReasoningTextDeltaEvent --> _ApprovalState
    ReasoningTextDeltaEvent --> _FieldInputState
    ReasoningTextDeltaEvent --> _SessionsChatReplAdapter
    ReasoningTextDeltaEvent --> _OutputItemRenderPlan
    ReasoningTextDeltaEvent --> _TurnProseTracker
    ReasoningTextDeltaEvent --> _ContextItems
    ReasoningTextDeltaEvent --> _TerminalInfo
    ReasoningTextDeltaEvent --> _SlashCommandCompleter
    ReasoningTextDeltaEvent --> _BangInputLexer
    ReasoningTextDeltaEvent --> SessionToolCallInfo
    ReasoningTextDeltaEvent --> _AgentToolsGetter
    ReasoningTextDeltaEvent --> _StreamHookState
    ReasoningTextDeltaEvent --> SessionsChat
    ReasoningTextDeltaEvent --> _FilesUploader
    ReasoningTextDeltaEvent --> _FilesGetter
    ReasoningTextDeltaEvent --> _PostEventCall
    ReasoningTextDeltaEvent --> _ResolveElicitationCall
    ReasoningTextDeltaEvent --> _StreamScript
    ReasoningTextDeltaEvent --> _FakeNamespace
    ReasoningTextDeltaEvent --> _GatedReadyNamespace
    ReasoningTextDeltaEvent --> _UploaderCall
    ReasoningTextDeltaEvent --> _FakeUploader
    ReasoningTextDeltaEvent --> _GetterCall
    ReasoningTextDeltaEvent --> _FakeGetter
    ReasoningTextDeltaEvent --> _AgentToolsCall
    ReasoningTextDeltaEvent --> _FakeAgentToolsGetter
    RetryErrorDetail --> _SessionSnapshot
    RetryErrorDetail --> _StartupHeader
    RetryErrorDetail --> TimedFormatter
    RetryErrorDetail --> _ApprovalVerdict
    RetryErrorDetail --> _ApprovalState
    RetryErrorDetail --> _FieldInputState
    RetryErrorDetail --> _SessionsChatReplAdapter
    RetryErrorDetail --> _OutputItemRenderPlan
    RetryErrorDetail --> _TurnProseTracker
    RetryErrorDetail --> _ContextItems
    RetryErrorDetail --> _TerminalInfo
    RetryErrorDetail --> _SlashCommandCompleter
    RetryErrorDetail --> _BangInputLexer
    RetryErrorDetail --> _CapturingHost
    RetryErrorDetail --> _StubSession
    RetryErrorDetail --> _StubHost
    RetryErrorDetail --> _StubFmt
    RetryErrorDetail --> _StubSkillSession
    RetryErrorDetail --> _StubSessionsModeSession
    _SSEEventBase <|-- RetryEvent
    _SSEEventBase <|-- SessionChangedFilesInvalidatedEvent
    _SSEEventBase <|-- SessionChildSessionUpdatedEvent
    SessionChildSessionUpdatedEvent --> _SessionSnapshot
    SessionChildSessionUpdatedEvent --> _StartupHeader
    SessionChildSessionUpdatedEvent --> TimedFormatter
    SessionChildSessionUpdatedEvent --> _ApprovalVerdict
    SessionChildSessionUpdatedEvent --> _ApprovalState
    SessionChildSessionUpdatedEvent --> _FieldInputState
    SessionChildSessionUpdatedEvent --> _SessionsChatReplAdapter
    SessionChildSessionUpdatedEvent --> _OutputItemRenderPlan
    SessionChildSessionUpdatedEvent --> _TurnProseTracker
    SessionChildSessionUpdatedEvent --> _ContextItems
    SessionChildSessionUpdatedEvent --> _TerminalInfo
    SessionChildSessionUpdatedEvent --> _SlashCommandCompleter
    SessionChildSessionUpdatedEvent --> _BangInputLexer
    SessionChildSessionUpdatedEvent --> _FakeSessions
    SessionChildSessionUpdatedEvent --> _FakeClient
    _SSEEventBase <|-- SessionHeartbeatEvent
    SessionHeartbeatEvent --> _PostEventCall
    SessionHeartbeatEvent --> _ResolveElicitationCall
    SessionHeartbeatEvent --> _StreamScript
    SessionHeartbeatEvent --> _FakeNamespace
    SessionHeartbeatEvent --> _GatedReadyNamespace
    SessionHeartbeatEvent --> _UploaderCall
    SessionHeartbeatEvent --> _FakeUploader
    SessionHeartbeatEvent --> _GetterCall
    SessionHeartbeatEvent --> _FakeGetter
    SessionHeartbeatEvent --> _AgentToolsCall
    SessionHeartbeatEvent --> _FakeAgentToolsGetter
    _SSEEventBase <|-- SessionInputConsumedEvent
    SessionInputConsumedEvent --> _SessionSnapshot
    SessionInputConsumedEvent --> _StartupHeader
    SessionInputConsumedEvent --> TimedFormatter
    SessionInputConsumedEvent --> _ApprovalVerdict
    SessionInputConsumedEvent --> _ApprovalState
    SessionInputConsumedEvent --> _FieldInputState
    SessionInputConsumedEvent --> _SessionsChatReplAdapter
    SessionInputConsumedEvent --> _OutputItemRenderPlan
    SessionInputConsumedEvent --> _TurnProseTracker
    SessionInputConsumedEvent --> _ContextItems
    SessionInputConsumedEvent --> _TerminalInfo
    SessionInputConsumedEvent --> _SlashCommandCompleter
    SessionInputConsumedEvent --> _BangInputLexer
    _SSEEventBase <|-- SessionPresenceEvent
    _SSEEventBase <|-- SessionStatusEvent
    SessionStatusEvent --> _SessionSnapshot
    SessionStatusEvent --> _StartupHeader
    SessionStatusEvent --> TimedFormatter
    SessionStatusEvent --> _ApprovalVerdict
    SessionStatusEvent --> _ApprovalState
    SessionStatusEvent --> _FieldInputState
    SessionStatusEvent --> _SessionsChatReplAdapter
    SessionStatusEvent --> _OutputItemRenderPlan
    SessionStatusEvent --> _TurnProseTracker
    SessionStatusEvent --> _ContextItems
    SessionStatusEvent --> _TerminalInfo
    SessionStatusEvent --> _SlashCommandCompleter
    SessionStatusEvent --> _BangInputLexer
    SessionStatusEvent --> SessionToolCallInfo
    SessionStatusEvent --> _AgentToolsGetter
    SessionStatusEvent --> _StreamHookState
    SessionStatusEvent --> SessionsChat
    SessionStatusEvent --> _FilesUploader
    SessionStatusEvent --> _FilesGetter
    SessionStatusEvent --> _PostEventCall
    SessionStatusEvent --> _ResolveElicitationCall
    SessionStatusEvent --> _StreamScript
    SessionStatusEvent --> _FakeNamespace
    SessionStatusEvent --> _GatedReadyNamespace
    SessionStatusEvent --> _UploaderCall
    SessionStatusEvent --> _FakeUploader
    SessionStatusEvent --> _GetterCall
    SessionStatusEvent --> _FakeGetter
    SessionStatusEvent --> _AgentToolsCall
    SessionStatusEvent --> _FakeAgentToolsGetter
    SessionStatusEvent --> _DiscoverySessions
    SessionStatusEvent --> _DiscoveryClient
    SessionStatusEvent --> _ChatSessions
    SessionStatusEvent --> _ChatClient
    _SSEEventBase <|-- SessionTerminalActivityEvent
    SessionStatusEvent <|-- _SSEEventBase
    SessionInputConsumedEvent <|-- _SSEEventBase
    OutputTextDeltaEvent <|-- _SSEEventBase
    ReasoningStartedEvent <|-- _SSEEventBase
    ReasoningTextDeltaEvent <|-- _SSEEventBase
    ReasoningSummaryTextDeltaEvent <|-- _SSEEventBase
    OutputItemDoneEvent <|-- _SSEEventBase
    OutputFileDoneEvent <|-- _SSEEventBase
    HeartbeatEvent <|-- _SSEEventBase
    SessionHeartbeatEvent <|-- _SSEEventBase
    SessionPresenceEvent <|-- _SSEEventBase
    ElicitationRequestEvent <|-- _SSEEventBase
    ElicitationResolvedEvent <|-- _SSEEventBase
    CreatedEvent <|-- _SSEEventBase
    QueuedEvent <|-- _SSEEventBase
    InProgressEvent <|-- _SSEEventBase
    CompletedEvent <|-- _SSEEventBase
    FailedEvent <|-- _SSEEventBase
    CancelledEvent <|-- _SSEEventBase
    IncompleteEvent <|-- _SSEEventBase
    RetryEvent <|-- _SSEEventBase
    ErrorEvent <|-- _SSEEventBase
    CompactionInProgressEvent <|-- _SSEEventBase
    CompactionCompletedEvent <|-- _SSEEventBase
    CompactionFailedEvent <|-- _SSEEventBase
    ClientTaskCancelEvent <|-- _SSEEventBase
    SessionChildSessionUpdatedEvent <|-- _SSEEventBase
    SessionChangedFilesInvalidatedEvent <|-- _SSEEventBase
    SessionTerminalActivityEvent <|-- _SSEEventBase
    TurnStartedEvent <|-- _SSEEventBase
    TurnCompletedEvent <|-- _SSEEventBase
    TurnFailedEvent <|-- _SSEEventBase
    TurnCancelledEvent <|-- _SSEEventBase
    PolicyEvaluationRequestEvent <|-- _SSEEventBase
    _SSEEventBase <|-- TurnCancelledEvent
    _SSEEventBase <|-- TurnCompletedEvent
    _SSEEventBase <|-- TurnFailedEvent
    _SSEEventBase <|-- TurnStartedEvent
    Usage --> MessageEvent
    Usage --> InterruptEvent
    Usage --> ToolResultEvent
    Session --> OmnigentClient
    Session --> ResponseCancelled
    Session --> ResponseCompleted
    Session --> ResponseCreated
    Session --> ResponseFailed
    Session --> ResponseIncomplete
    Session --> QueryResult
    Session --> QueryStream
    Session --> StreamHooks
    Session --> ToolHandler
    Session --> File
    Session --> Response
    Session --> BlockStream
    Session --> _ScriptedSession
    Session --> _ResponsesStub
    Session --> _ClientStub
    Session --> _ResponsesStub
    Session --> _ClientStub
    _AgentToolsGetter --> CancelledEvent
    _AgentToolsGetter --> CompletedEvent
    _AgentToolsGetter --> CreatedEvent
    _AgentToolsGetter --> ElicitationRequestEvent
    _AgentToolsGetter --> FailedEvent
    _AgentToolsGetter --> IncompleteEvent
    _AgentToolsGetter --> InProgressEvent
    _AgentToolsGetter --> OutputFileDoneEvent
    _AgentToolsGetter --> OutputItemDoneEvent
    _AgentToolsGetter --> OutputTextDeltaEvent
    _AgentToolsGetter --> QueuedEvent
    _AgentToolsGetter --> ReasoningStartedEvent
    _AgentToolsGetter --> ReasoningSummaryTextDeltaEvent
    _AgentToolsGetter --> ReasoningTextDeltaEvent
    _AgentToolsGetter --> SessionStatusEvent
    _AgentToolsGetter --> FilesNamespace
    _AgentToolsGetter --> QueryResult
    _AgentToolsGetter --> QueryStream
    _AgentToolsGetter --> Session
    _AgentToolsGetter --> SessionsNamespace
    _AgentToolsGetter --> ElicitationRequestCtx
    _AgentToolsGetter --> FileOutputCtx
    _AgentToolsGetter --> MessageEndCtx
    _AgentToolsGetter --> MessageStartCtx
    _AgentToolsGetter --> ReasoningEndCtx
    _AgentToolsGetter --> ReasoningStartCtx
    _AgentToolsGetter --> ResponseEndCtx
    _AgentToolsGetter --> ResponseStartCtx
    _AgentToolsGetter --> StreamHooks
    _AgentToolsGetter --> ToolCallEndCtx
    _AgentToolsGetter --> ToolCallStartCtx
    _AgentToolsGetter --> File
    _AgentToolsGetter --> Response
    _FilesGetter --> CancelledEvent
    _FilesGetter --> CompletedEvent
    _FilesGetter --> CreatedEvent
    _FilesGetter --> ElicitationRequestEvent
    _FilesGetter --> FailedEvent
    _FilesGetter --> IncompleteEvent
    _FilesGetter --> InProgressEvent
    _FilesGetter --> OutputFileDoneEvent
    _FilesGetter --> OutputItemDoneEvent
    _FilesGetter --> OutputTextDeltaEvent
    _FilesGetter --> QueuedEvent
    _FilesGetter --> ReasoningStartedEvent
    _FilesGetter --> ReasoningSummaryTextDeltaEvent
    _FilesGetter --> ReasoningTextDeltaEvent
    _FilesGetter --> SessionStatusEvent
    _FilesGetter --> FilesNamespace
    _FilesGetter --> QueryResult
    _FilesGetter --> QueryStream
    _FilesGetter --> Session
    _FilesGetter --> SessionsNamespace
    _FilesGetter --> ElicitationRequestCtx
    _FilesGetter --> FileOutputCtx
    _FilesGetter --> MessageEndCtx
    _FilesGetter --> MessageStartCtx
    _FilesGetter --> ReasoningEndCtx
    _FilesGetter --> ReasoningStartCtx
    _FilesGetter --> ResponseEndCtx
    _FilesGetter --> ResponseStartCtx
    _FilesGetter --> StreamHooks
    _FilesGetter --> ToolCallEndCtx
    _FilesGetter --> ToolCallStartCtx
    _FilesGetter --> File
    _FilesGetter --> Response
    _FilesUploader --> CancelledEvent
    _FilesUploader --> CompletedEvent
    _FilesUploader --> CreatedEvent
    _FilesUploader --> ElicitationRequestEvent
    _FilesUploader --> FailedEvent
    _FilesUploader --> IncompleteEvent
    _FilesUploader --> InProgressEvent
    _FilesUploader --> OutputFileDoneEvent
    _FilesUploader --> OutputItemDoneEvent
    _FilesUploader --> OutputTextDeltaEvent
    _FilesUploader --> QueuedEvent
    _FilesUploader --> ReasoningStartedEvent
    _FilesUploader --> ReasoningSummaryTextDeltaEvent
    _FilesUploader --> ReasoningTextDeltaEvent
    _FilesUploader --> SessionStatusEvent
    _FilesUploader --> FilesNamespace
    _FilesUploader --> QueryResult
    _FilesUploader --> QueryStream
    _FilesUploader --> Session
    _FilesUploader --> SessionsNamespace
    _FilesUploader --> ElicitationRequestCtx
    _FilesUploader --> FileOutputCtx
    _FilesUploader --> MessageEndCtx
    _FilesUploader --> MessageStartCtx
    _FilesUploader --> ReasoningEndCtx
    _FilesUploader --> ReasoningStartCtx
    _FilesUploader --> ResponseEndCtx
    _FilesUploader --> ResponseStartCtx
    _FilesUploader --> StreamHooks
    _FilesUploader --> ToolCallEndCtx
    _FilesUploader --> ToolCallStartCtx
    _FilesUploader --> File
    _FilesUploader --> Response
    SessionsChat --> OmnigentClient
    SessionsChat --> CancelledEvent
    SessionsChat --> CompletedEvent
    SessionsChat --> CreatedEvent
    SessionsChat --> ElicitationRequestEvent
    SessionsChat --> FailedEvent
    SessionsChat --> IncompleteEvent
    SessionsChat --> InProgressEvent
    SessionsChat --> OutputFileDoneEvent
    SessionsChat --> OutputItemDoneEvent
    SessionsChat --> OutputTextDeltaEvent
    SessionsChat --> QueuedEvent
    SessionsChat --> ReasoningStartedEvent
    SessionsChat --> ReasoningSummaryTextDeltaEvent
    SessionsChat --> ReasoningTextDeltaEvent
    SessionsChat --> SessionStatusEvent
    SessionsChat --> FilesNamespace
    SessionsChat --> QueryResult
    SessionsChat --> QueryStream
    SessionsChat --> Session
    SessionsChat --> SessionsNamespace
    SessionsChat --> ElicitationRequestCtx
    SessionsChat --> FileOutputCtx
    SessionsChat --> MessageEndCtx
    SessionsChat --> MessageStartCtx
    SessionsChat --> ReasoningEndCtx
    SessionsChat --> ReasoningStartCtx
    SessionsChat --> ResponseEndCtx
    SessionsChat --> ResponseStartCtx
    SessionsChat --> StreamHooks
    SessionsChat --> ToolCallEndCtx
    SessionsChat --> ToolCallStartCtx
    SessionsChat --> File
    SessionsChat --> Response
    SessionsChat --> _PostEventCall
    SessionsChat --> _ResolveElicitationCall
    SessionsChat --> _StreamScript
    SessionsChat --> _FakeNamespace
    SessionsChat --> _GatedReadyNamespace
    SessionsChat --> _UploaderCall
    SessionsChat --> _FakeUploader
    SessionsChat --> _GetterCall
    SessionsChat --> _FakeGetter
    SessionsChat --> _AgentToolsCall
    SessionsChat --> _FakeAgentToolsGetter
    SessionToolCallInfo --> CancelledEvent
    SessionToolCallInfo --> CompletedEvent
    SessionToolCallInfo --> CreatedEvent
    SessionToolCallInfo --> ElicitationRequestEvent
    SessionToolCallInfo --> FailedEvent
    SessionToolCallInfo --> IncompleteEvent
    SessionToolCallInfo --> InProgressEvent
    SessionToolCallInfo --> OutputFileDoneEvent
    SessionToolCallInfo --> OutputItemDoneEvent
    SessionToolCallInfo --> OutputTextDeltaEvent
    SessionToolCallInfo --> QueuedEvent
    SessionToolCallInfo --> ReasoningStartedEvent
    SessionToolCallInfo --> ReasoningSummaryTextDeltaEvent
    SessionToolCallInfo --> ReasoningTextDeltaEvent
    SessionToolCallInfo --> SessionStatusEvent
    SessionToolCallInfo --> FilesNamespace
    SessionToolCallInfo --> QueryResult
    SessionToolCallInfo --> QueryStream
    SessionToolCallInfo --> Session
    SessionToolCallInfo --> SessionsNamespace
    SessionToolCallInfo --> ElicitationRequestCtx
    SessionToolCallInfo --> FileOutputCtx
    SessionToolCallInfo --> MessageEndCtx
    SessionToolCallInfo --> MessageStartCtx
    SessionToolCallInfo --> ReasoningEndCtx
    SessionToolCallInfo --> ReasoningStartCtx
    SessionToolCallInfo --> ResponseEndCtx
    SessionToolCallInfo --> ResponseStartCtx
    SessionToolCallInfo --> StreamHooks
    SessionToolCallInfo --> ToolCallEndCtx
    SessionToolCallInfo --> ToolCallStartCtx
    SessionToolCallInfo --> File
    SessionToolCallInfo --> Response
    SessionToolCallInfo --> _PostEventCall
    SessionToolCallInfo --> _ResolveElicitationCall
    SessionToolCallInfo --> _StreamScript
    SessionToolCallInfo --> _FakeNamespace
    SessionToolCallInfo --> _GatedReadyNamespace
    SessionToolCallInfo --> _UploaderCall
    SessionToolCallInfo --> _FakeUploader
    SessionToolCallInfo --> _GetterCall
    SessionToolCallInfo --> _FakeGetter
    SessionToolCallInfo --> _AgentToolsCall
    SessionToolCallInfo --> _FakeAgentToolsGetter
    _StreamHookState --> CancelledEvent
    _StreamHookState --> CompletedEvent
    _StreamHookState --> CreatedEvent
    _StreamHookState --> ElicitationRequestEvent
    _StreamHookState --> FailedEvent
    _StreamHookState --> IncompleteEvent
    _StreamHookState --> InProgressEvent
    _StreamHookState --> OutputFileDoneEvent
    _StreamHookState --> OutputItemDoneEvent
    _StreamHookState --> OutputTextDeltaEvent
    _StreamHookState --> QueuedEvent
    _StreamHookState --> ReasoningStartedEvent
    _StreamHookState --> ReasoningSummaryTextDeltaEvent
    _StreamHookState --> ReasoningTextDeltaEvent
    _StreamHookState --> SessionStatusEvent
    _StreamHookState --> FilesNamespace
    _StreamHookState --> QueryResult
    _StreamHookState --> QueryStream
    _StreamHookState --> Session
    _StreamHookState --> SessionsNamespace
    _StreamHookState --> ElicitationRequestCtx
    _StreamHookState --> FileOutputCtx
    _StreamHookState --> MessageEndCtx
    _StreamHookState --> MessageStartCtx
    _StreamHookState --> ReasoningEndCtx
    _StreamHookState --> ReasoningStartCtx
    _StreamHookState --> ResponseEndCtx
    _StreamHookState --> ResponseStartCtx
    _StreamHookState --> StreamHooks
    _StreamHookState --> ToolCallEndCtx
    _StreamHookState --> ToolCallStartCtx
    _StreamHookState --> File
    _StreamHookState --> Response
    Session --> SessionToolCallInfo
    Session --> _AgentToolsGetter
    Session --> _StreamHookState
    Session --> SessionsChat
    Session --> _FilesUploader
    Session --> _FilesGetter
    Session --> _PostEventCall
    Session --> _ResolveElicitationCall
    Session --> _StreamScript
    Session --> _FakeNamespace
    Session --> _GatedReadyNamespace
    Session --> _UploaderCall
    Session --> _FakeUploader
    Session --> _GetterCall
    Session --> _FakeGetter
    Session --> _AgentToolsCall
    Session --> _FakeAgentToolsGetter
    Session --> _SnapshotSessions
    Session --> _SnapshotClient
    Session --> _RaisingSessions
    Session --> _RaisingClient
    Session --> _SwitchHost
    Session --> _DiscoverySessions
    Session --> _DiscoveryClient
    Session --> _ChatSessions
    Session --> _ChatClient
    SessionsNamespace --> OmnigentClient
    SessionsNamespace --> SessionToolCallInfo
    SessionsNamespace --> _AgentToolsGetter
    SessionsNamespace --> _StreamHookState
    SessionsNamespace --> SessionsChat
    SessionsNamespace --> _FilesUploader
    SessionsNamespace --> _FilesGetter
    SessionsNamespace --> _PostEventCall
    SessionsNamespace --> _ResolveElicitationCall
    SessionsNamespace --> _StreamScript
    SessionsNamespace --> _FakeNamespace
    SessionsNamespace --> _GatedReadyNamespace
    SessionsNamespace --> _UploaderCall
    SessionsNamespace --> _FakeUploader
    SessionsNamespace --> _GetterCall
    SessionsNamespace --> _FakeGetter
    SessionsNamespace --> _AgentToolsCall
    SessionsNamespace --> _FakeAgentToolsGetter
    SessionsNamespace --> _DiscoverySessions
    SessionsNamespace --> _DiscoveryClient
    SessionsNamespace --> _ChatSessions
    SessionsNamespace --> _ChatClient
    SessionsNamespace --> _FakeSessions
    SessionsNamespace --> _FakeClient
    BlockStream --> Session
    BlockStream --> ReasoningChunk
    BlockStream --> CompactionInProgress
    BlockStream --> ErrorEvent
    BlockStream --> MessageDone
    BlockStream --> NativeToolCall
    BlockStream --> OutputFileDone
    BlockStream --> ReasoningDelta
    BlockStream --> ReasoningStarted
    BlockStream --> ReasoningSummaryDelta
    BlockStream --> ResponseCancelled
    BlockStream --> ResponseCompleted
    BlockStream --> ResponseCreated
    BlockStream --> ResponseFailed
    BlockStream --> ResponseIncomplete
    BlockStream --> ResponseInProgress
    BlockStream --> ResponseQueued
    BlockStream --> RetryEvent
    BlockStream --> TextDelta
    BlockStream --> ToolCall
    BlockStream --> ToolResult
    BlockStream --> FakeSession
    _RaisingClient --> Session
    _RaisingSessions --> Session
    _SnapshotClient --> Session
    _SnapshotSessions --> Session
    _SwitchHost --> Session
    _FakeFmt --> Document
    _FakeHost --> Document
    _CompactSession --> CapturingHost
    _ItemsClient --> CapturingHost
    _OnePageSessionsApi --> CapturingHost
    _RingHost --> CapturingHost
    _RingUpdate --> CapturingHost
    _Session --> CapturingHost
    _Session <|-- _AsyncSession
    _AsyncSession --> CapturingHost
    _AsyncSession <|-- _Session
    _Session --> CapturingHost
    _FakeCompletedEvent --> EventTape
    _FakeCompletedEvent --> PipelineCounters
    _FakeCompletedEvent --> Stage
    _FakeCompletedEvent --> TapeEntry
    _FakeDroppedEvent --> EventTape
    _FakeDroppedEvent --> PipelineCounters
    _FakeDroppedEvent --> Stage
    _FakeDroppedEvent --> TapeEntry
    _FakeFmt --> EventTape
    _FakeFmt --> PipelineCounters
    _FakeFmt --> Stage
    _FakeFmt --> TapeEntry
    _FakeSDKTextDelta --> EventTape
    _FakeSDKTextDelta --> PipelineCounters
    _FakeSDKTextDelta --> Stage
    _FakeSDKTextDelta --> TapeEntry
    _FakeStreamingText --> EventTape
    _FakeStreamingText --> PipelineCounters
    _FakeStreamingText --> Stage
    _FakeStreamingText --> TapeEntry
    _FakeTextDelta --> EventTape
    _FakeTextDelta --> PipelineCounters
    _FakeTextDelta --> Stage
    _FakeTextDelta --> TapeEntry
    _Client --> CapturingHost
    _Session --> CapturingHost
    _CapturingHost --> Document
    _CapturingHost --> SkillSpec
    _CapturingHost --> ErrorEvent
    _CapturingHost --> ErrorInfo
    _CapturingHost --> ErrorEvent
    _CapturingHost --> RetryErrorDetail
    _StubFmt --> Document
    _StubFmt --> SkillSpec
    _StubFmt --> ErrorEvent
    _StubFmt --> ErrorInfo
    _StubFmt --> ErrorEvent
    _StubFmt --> RetryErrorDetail
    _StubHost --> Document
    _StubHost --> SkillSpec
    _StubHost --> ErrorEvent
    _StubHost --> ErrorInfo
    _StubHost --> ErrorEvent
    _StubHost --> RetryErrorDetail
    _StubSession --> Document
    _StubSession --> SkillSpec
    _StubSession --> ErrorEvent
    _StubSession --> ErrorInfo
    _StubSession --> ErrorEvent
    _StubSession --> RetryErrorDetail
    _StubSessionsModeSession --> Document
    _StubSessionsModeSession --> SkillSpec
    _StubSessionsModeSession --> ErrorEvent
    _StubSessionsModeSession --> ErrorInfo
    _StubSessionsModeSession --> ErrorEvent
    _StubSessionsModeSession --> RetryErrorDetail
    _StubSkillSession --> Document
    _StubSkillSession --> SkillSpec
    _StubSkillSession --> ErrorEvent
    _StubSkillSession --> ErrorInfo
    _StubSkillSession --> ErrorEvent
    _StubSkillSession --> RetryErrorDetail
    _EchoHarness --> OutputItemDoneEvent
    _EchoHarness --> OutputTextDeltaEvent
    _EchoHarness --> HeartbeatEvent
    _ShutdownTrackingHarness --> OutputItemDoneEvent
    _ShutdownTrackingHarness --> OutputTextDeltaEvent
    _ShutdownTrackingHarness --> HeartbeatEvent
    _UnclassifiedExceptionHarness --> OutputItemDoneEvent
    _UnclassifiedExceptionHarness --> OutputTextDeltaEvent
    _UnclassifiedExceptionHarness --> HeartbeatEvent
    _ClientStub --> ResponseCompleted
    _ClientStub --> ResponseCreated
    _ClientStub --> Session
    _ClientStub --> Response
    _ResponsesStub --> ResponseCompleted
    _ResponsesStub --> ResponseCreated
    _ResponsesStub --> Session
    _ResponsesStub --> Response
    _ClientStub --> ResponseCompleted
    _ClientStub --> ResponseCreated
    _ClientStub --> Session
    _ClientStub --> Response
    _ResponsesStub --> ResponseCompleted
    _ResponsesStub --> ResponseCreated
    _ResponsesStub --> Session
    _ResponsesStub --> Response
    _ScriptedSession --> MessageDone
    _ScriptedSession --> ResponseCompleted
    _ScriptedSession --> ResponseCreated
    _ScriptedSession --> ResponseInProgress
    _ScriptedSession --> TextDelta
    _ScriptedSession --> Session
    _ScriptedSession --> Response
    _AgentToolsCall --> QueryResult
    _AgentToolsCall --> QueryStream
    _AgentToolsCall --> Session
    _AgentToolsCall --> SessionsNamespace
    _AgentToolsCall --> SessionsChat
    _AgentToolsCall --> SessionToolCallInfo
    _AgentToolsCall --> StreamHooks
    _AgentToolsCall --> File
    _AgentToolsCall --> CompletedEvent
    _AgentToolsCall --> CreatedEvent
    _AgentToolsCall --> ElicitationRequestEvent
    _AgentToolsCall --> OutputFileDoneEvent
    _AgentToolsCall --> OutputItemDoneEvent
    _AgentToolsCall --> OutputTextDeltaEvent
    _AgentToolsCall --> ReasoningStartedEvent
    _AgentToolsCall --> ReasoningSummaryTextDeltaEvent
    _AgentToolsCall --> ReasoningTextDeltaEvent
    _AgentToolsCall --> SessionHeartbeatEvent
    _AgentToolsCall --> SessionStatusEvent
    _FakeAgentToolsGetter --> QueryResult
    _FakeAgentToolsGetter --> QueryStream
    _FakeAgentToolsGetter --> Session
    _FakeAgentToolsGetter --> SessionsNamespace
    _FakeAgentToolsGetter --> SessionsChat
    _FakeAgentToolsGetter --> SessionToolCallInfo
    _FakeAgentToolsGetter --> StreamHooks
    _FakeAgentToolsGetter --> File
    _FakeAgentToolsGetter --> CompletedEvent
    _FakeAgentToolsGetter --> CreatedEvent
    _FakeAgentToolsGetter --> ElicitationRequestEvent
    _FakeAgentToolsGetter --> OutputFileDoneEvent
    _FakeAgentToolsGetter --> OutputItemDoneEvent
    _FakeAgentToolsGetter --> OutputTextDeltaEvent
    _FakeAgentToolsGetter --> ReasoningStartedEvent
    _FakeAgentToolsGetter --> ReasoningSummaryTextDeltaEvent
    _FakeAgentToolsGetter --> ReasoningTextDeltaEvent
    _FakeAgentToolsGetter --> SessionHeartbeatEvent
    _FakeAgentToolsGetter --> SessionStatusEvent
    _FakeGetter --> QueryResult
    _FakeGetter --> QueryStream
    _FakeGetter --> Session
    _FakeGetter --> SessionsNamespace
    _FakeGetter --> SessionsChat
    _FakeGetter --> SessionToolCallInfo
    _FakeGetter --> StreamHooks
    _FakeGetter --> File
    _FakeGetter --> CompletedEvent
    _FakeGetter --> CreatedEvent
    _FakeGetter --> ElicitationRequestEvent
    _FakeGetter --> OutputFileDoneEvent
    _FakeGetter --> OutputItemDoneEvent
    _FakeGetter --> OutputTextDeltaEvent
    _FakeGetter --> ReasoningStartedEvent
    _FakeGetter --> ReasoningSummaryTextDeltaEvent
    _FakeGetter --> ReasoningTextDeltaEvent
    _FakeGetter --> SessionHeartbeatEvent
    _FakeGetter --> SessionStatusEvent
    _GatedReadyNamespace <|-- _FakeNamespace
    _FakeNamespace --> QueryResult
    _FakeNamespace --> QueryStream
    _FakeNamespace --> Session
    _FakeNamespace --> SessionsNamespace
    _FakeNamespace --> SessionsChat
    _FakeNamespace --> SessionToolCallInfo
    _FakeNamespace --> StreamHooks
    _FakeNamespace --> File
    _FakeNamespace --> CompletedEvent
    _FakeNamespace --> CreatedEvent
    _FakeNamespace --> ElicitationRequestEvent
    _FakeNamespace --> OutputFileDoneEvent
    _FakeNamespace --> OutputItemDoneEvent
    _FakeNamespace --> OutputTextDeltaEvent
    _FakeNamespace --> ReasoningStartedEvent
    _FakeNamespace --> ReasoningSummaryTextDeltaEvent
    _FakeNamespace --> ReasoningTextDeltaEvent
    _FakeNamespace --> SessionHeartbeatEvent
    _FakeNamespace --> SessionStatusEvent
    _FakeUploader --> QueryResult
    _FakeUploader --> QueryStream
    _FakeUploader --> Session
    _FakeUploader --> SessionsNamespace
    _FakeUploader --> SessionsChat
    _FakeUploader --> SessionToolCallInfo
    _FakeUploader --> StreamHooks
    _FakeUploader --> File
    _FakeUploader --> CompletedEvent
    _FakeUploader --> CreatedEvent
    _FakeUploader --> ElicitationRequestEvent
    _FakeUploader --> OutputFileDoneEvent
    _FakeUploader --> OutputItemDoneEvent
    _FakeUploader --> OutputTextDeltaEvent
    _FakeUploader --> ReasoningStartedEvent
    _FakeUploader --> ReasoningSummaryTextDeltaEvent
    _FakeUploader --> ReasoningTextDeltaEvent
    _FakeUploader --> SessionHeartbeatEvent
    _FakeUploader --> SessionStatusEvent
    _FakeNamespace <|-- _GatedReadyNamespace
    _GatedReadyNamespace --> QueryResult
    _GatedReadyNamespace --> QueryStream
    _GatedReadyNamespace --> Session
    _GatedReadyNamespace --> SessionsNamespace
    _GatedReadyNamespace --> SessionsChat
    _GatedReadyNamespace --> SessionToolCallInfo
    _GatedReadyNamespace --> StreamHooks
    _GatedReadyNamespace --> File
    _GatedReadyNamespace --> CompletedEvent
    _GatedReadyNamespace --> CreatedEvent
    _GatedReadyNamespace --> ElicitationRequestEvent
    _GatedReadyNamespace --> OutputFileDoneEvent
    _GatedReadyNamespace --> OutputItemDoneEvent
    _GatedReadyNamespace --> OutputTextDeltaEvent
    _GatedReadyNamespace --> ReasoningStartedEvent
    _GatedReadyNamespace --> ReasoningSummaryTextDeltaEvent
    _GatedReadyNamespace --> ReasoningTextDeltaEvent
    _GatedReadyNamespace --> SessionHeartbeatEvent
    _GatedReadyNamespace --> SessionStatusEvent
    _GetterCall --> QueryResult
    _GetterCall --> QueryStream
    _GetterCall --> Session
    _GetterCall --> SessionsNamespace
    _GetterCall --> SessionsChat
    _GetterCall --> SessionToolCallInfo
    _GetterCall --> StreamHooks
    _GetterCall --> File
    _GetterCall --> CompletedEvent
    _GetterCall --> CreatedEvent
    _GetterCall --> ElicitationRequestEvent
    _GetterCall --> OutputFileDoneEvent
    _GetterCall --> OutputItemDoneEvent
    _GetterCall --> OutputTextDeltaEvent
    _GetterCall --> ReasoningStartedEvent
    _GetterCall --> ReasoningSummaryTextDeltaEvent
    _GetterCall --> ReasoningTextDeltaEvent
    _GetterCall --> SessionHeartbeatEvent
    _GetterCall --> SessionStatusEvent
    _PostEventCall --> QueryResult
    _PostEventCall --> QueryStream
    _PostEventCall --> Session
    _PostEventCall --> SessionsNamespace
    _PostEventCall --> SessionsChat
    _PostEventCall --> SessionToolCallInfo
    _PostEventCall --> StreamHooks
    _PostEventCall --> File
    _PostEventCall --> CompletedEvent
    _PostEventCall --> CreatedEvent
    _PostEventCall --> ElicitationRequestEvent
    _PostEventCall --> OutputFileDoneEvent
    _PostEventCall --> OutputItemDoneEvent
    _PostEventCall --> OutputTextDeltaEvent
    _PostEventCall --> ReasoningStartedEvent
    _PostEventCall --> ReasoningSummaryTextDeltaEvent
    _PostEventCall --> ReasoningTextDeltaEvent
    _PostEventCall --> SessionHeartbeatEvent
    _PostEventCall --> SessionStatusEvent
    _ResolveElicitationCall --> QueryResult
    _ResolveElicitationCall --> QueryStream
    _ResolveElicitationCall --> Session
    _ResolveElicitationCall --> SessionsNamespace
    _ResolveElicitationCall --> SessionsChat
    _ResolveElicitationCall --> SessionToolCallInfo
    _ResolveElicitationCall --> StreamHooks
    _ResolveElicitationCall --> File
    _ResolveElicitationCall --> CompletedEvent
    _ResolveElicitationCall --> CreatedEvent
    _ResolveElicitationCall --> ElicitationRequestEvent
    _ResolveElicitationCall --> OutputFileDoneEvent
    _ResolveElicitationCall --> OutputItemDoneEvent
    _ResolveElicitationCall --> OutputTextDeltaEvent
    _ResolveElicitationCall --> ReasoningStartedEvent
    _ResolveElicitationCall --> ReasoningSummaryTextDeltaEvent
    _ResolveElicitationCall --> ReasoningTextDeltaEvent
    _ResolveElicitationCall --> SessionHeartbeatEvent
    _ResolveElicitationCall --> SessionStatusEvent
    _StreamScript --> QueryResult
    _StreamScript --> QueryStream
    _StreamScript --> Session
    _StreamScript --> SessionsNamespace
    _StreamScript --> SessionsChat
    _StreamScript --> SessionToolCallInfo
    _StreamScript --> StreamHooks
    _StreamScript --> File
    _StreamScript --> CompletedEvent
    _StreamScript --> CreatedEvent
    _StreamScript --> ElicitationRequestEvent
    _StreamScript --> OutputFileDoneEvent
    _StreamScript --> OutputItemDoneEvent
    _StreamScript --> OutputTextDeltaEvent
    _StreamScript --> ReasoningStartedEvent
    _StreamScript --> ReasoningSummaryTextDeltaEvent
    _StreamScript --> ReasoningTextDeltaEvent
    _StreamScript --> SessionHeartbeatEvent
    _StreamScript --> SessionStatusEvent
    _UploaderCall --> QueryResult
    _UploaderCall --> QueryStream
    _UploaderCall --> Session
    _UploaderCall --> SessionsNamespace
    _UploaderCall --> SessionsChat
    _UploaderCall --> SessionToolCallInfo
    _UploaderCall --> StreamHooks
    _UploaderCall --> File
    _UploaderCall --> CompletedEvent
    _UploaderCall --> CreatedEvent
    _UploaderCall --> ElicitationRequestEvent
    _UploaderCall --> OutputFileDoneEvent
    _UploaderCall --> OutputItemDoneEvent
    _UploaderCall --> OutputTextDeltaEvent
    _UploaderCall --> ReasoningStartedEvent
    _UploaderCall --> ReasoningSummaryTextDeltaEvent
    _UploaderCall --> ReasoningTextDeltaEvent
    _UploaderCall --> SessionHeartbeatEvent
    _UploaderCall --> SessionStatusEvent
    _ExecutorStub --> SkillSpec
    _ServerClient --> SkillSpec
    _SpecStub --> SkillSpec
    FakeSession --> ReasoningChunk
    FakeSession --> MessageDone
    FakeSession --> ReasoningDelta
    FakeSession --> ReasoningStarted
    FakeSession --> ReasoningSummaryDelta
    FakeSession --> ResponseCompleted
    FakeSession --> ResponseCreated
    FakeSession --> ResponseInProgress
    FakeSession --> TextDelta
    FakeSession --> ToolCall
    FakeSession --> ToolResult
    FakeSession --> BlockStream
    FakeSession --> Response
    _ChatClient --> Session
    _ChatClient --> SessionsNamespace
    _ChatClient --> SessionStatusEvent
    _ChatSessions --> Session
    _ChatSessions --> SessionsNamespace
    _ChatSessions --> SessionStatusEvent
    _DiscoveryClient --> Session
    _DiscoveryClient --> SessionsNamespace
    _DiscoveryClient --> SessionStatusEvent
    _DiscoverySessions --> Session
    _DiscoverySessions --> SessionsNamespace
    _DiscoverySessions --> SessionStatusEvent
    _FakeClient --> SessionsNamespace
    _FakeClient --> SessionChildSessionUpdatedEvent
    _FakeSessions --> SessionsNamespace
    _FakeSessions --> SessionChildSessionUpdatedEvent
    CompactionEndCtx --> ErrorInfo
    CompactionEndCtx --> Response
    CompactionStartCtx --> ResponsesNamespace
    CompactionStartCtx --> ErrorInfo
    CompactionStartCtx --> Response
    ElicitationRequestCtx --> _SessionSnapshot
    ElicitationRequestCtx --> _StartupHeader
    ElicitationRequestCtx --> TimedFormatter
    ElicitationRequestCtx --> _ApprovalVerdict
    ElicitationRequestCtx --> _ApprovalState
    ElicitationRequestCtx --> _FieldInputState
    ElicitationRequestCtx --> _SessionsChatReplAdapter
    ElicitationRequestCtx --> _OutputItemRenderPlan
    ElicitationRequestCtx --> _TurnProseTracker
    ElicitationRequestCtx --> _ContextItems
    ElicitationRequestCtx --> _TerminalInfo
    ElicitationRequestCtx --> _SlashCommandCompleter
    ElicitationRequestCtx --> _BangInputLexer
    ElicitationRequestCtx --> ResponsesNamespace
    ElicitationRequestCtx --> SessionToolCallInfo
    ElicitationRequestCtx --> _AgentToolsGetter
    ElicitationRequestCtx --> _StreamHookState
    ElicitationRequestCtx --> SessionsChat
    ElicitationRequestCtx --> _FilesUploader
    ElicitationRequestCtx --> _FilesGetter
    ElicitationRequestCtx --> ErrorInfo
    ElicitationRequestCtx --> Response
    FileOutputCtx --> ResponsesNamespace
    FileOutputCtx --> SessionToolCallInfo
    FileOutputCtx --> _AgentToolsGetter
    FileOutputCtx --> _StreamHookState
    FileOutputCtx --> SessionsChat
    FileOutputCtx --> _FilesUploader
    FileOutputCtx --> _FilesGetter
    FileOutputCtx --> ErrorInfo
    FileOutputCtx --> Response
    MessageEndCtx --> ResponsesNamespace
    MessageEndCtx --> SessionToolCallInfo
    MessageEndCtx --> _AgentToolsGetter
    MessageEndCtx --> _StreamHookState
    MessageEndCtx --> SessionsChat
    MessageEndCtx --> _FilesUploader
    MessageEndCtx --> _FilesGetter
    MessageEndCtx --> ErrorInfo
    MessageEndCtx --> Response
    MessageStartCtx --> ResponsesNamespace
    MessageStartCtx --> SessionToolCallInfo
    MessageStartCtx --> _AgentToolsGetter
    MessageStartCtx --> _StreamHookState
    MessageStartCtx --> SessionsChat
    MessageStartCtx --> _FilesUploader
    MessageStartCtx --> _FilesGetter
    MessageStartCtx --> ErrorInfo
    MessageStartCtx --> Response
    NativeToolCallCtx --> ResponsesNamespace
    NativeToolCallCtx --> ErrorInfo
    NativeToolCallCtx --> Response
    ReasoningEndCtx --> ResponsesNamespace
    ReasoningEndCtx --> SessionToolCallInfo
    ReasoningEndCtx --> _AgentToolsGetter
    ReasoningEndCtx --> _StreamHookState
    ReasoningEndCtx --> SessionsChat
    ReasoningEndCtx --> _FilesUploader
    ReasoningEndCtx --> _FilesGetter
    ReasoningEndCtx --> ErrorInfo
    ReasoningEndCtx --> Response
    ReasoningStartCtx --> ResponsesNamespace
    ReasoningStartCtx --> SessionToolCallInfo
    ReasoningStartCtx --> _AgentToolsGetter
    ReasoningStartCtx --> _StreamHookState
    ReasoningStartCtx --> SessionsChat
    ReasoningStartCtx --> _FilesUploader
    ReasoningStartCtx --> _FilesGetter
    ReasoningStartCtx --> ErrorInfo
    ReasoningStartCtx --> Response
    ResponseEndCtx --> ResponsesNamespace
    ResponseEndCtx --> SessionToolCallInfo
    ResponseEndCtx --> _AgentToolsGetter
    ResponseEndCtx --> _StreamHookState
    ResponseEndCtx --> SessionsChat
    ResponseEndCtx --> _FilesUploader
    ResponseEndCtx --> _FilesGetter
    ResponseEndCtx --> ErrorInfo
    ResponseEndCtx --> Response
    ResponseStartCtx --> ResponsesNamespace
    ResponseStartCtx --> SessionToolCallInfo
    ResponseStartCtx --> _AgentToolsGetter
    ResponseStartCtx --> _StreamHookState
    ResponseStartCtx --> SessionsChat
    ResponseStartCtx --> _FilesUploader
    ResponseStartCtx --> _FilesGetter
    ResponseStartCtx --> ErrorInfo
    ResponseStartCtx --> Response
    RetryCtx --> ResponsesNamespace
    RetryCtx --> ErrorInfo
    RetryCtx --> Response
    ServerErrorCtx --> ResponsesNamespace
    ServerErrorCtx --> ErrorInfo
    ServerErrorCtx --> Response
    StreamHooks --> OmnigentClient
    StreamHooks --> ResponsesNamespace
    StreamHooks --> Session
    StreamHooks --> SessionToolCallInfo
    StreamHooks --> _AgentToolsGetter
    StreamHooks --> _StreamHookState
    StreamHooks --> SessionsChat
    StreamHooks --> _FilesUploader
    StreamHooks --> _FilesGetter
    StreamHooks --> ErrorInfo
    StreamHooks --> Response
    StreamHooks --> _PostEventCall
    StreamHooks --> _ResolveElicitationCall
    StreamHooks --> _StreamScript
    StreamHooks --> _FakeNamespace
    StreamHooks --> _GatedReadyNamespace
    StreamHooks --> _UploaderCall
    StreamHooks --> _FakeUploader
    StreamHooks --> _GetterCall
    StreamHooks --> _FakeGetter
    StreamHooks --> _AgentToolsCall
    StreamHooks --> _FakeAgentToolsGetter
    SubAgentCompletedCtx --> ErrorInfo
    SubAgentCompletedCtx --> Response
    SubAgentInfo --> ErrorInfo
    SubAgentInfo --> Response
    SubAgentSpawnedCtx --> ErrorInfo
    SubAgentSpawnedCtx --> Response
    ToolCallEndCtx --> ResponsesNamespace
    ToolCallEndCtx --> SessionToolCallInfo
    ToolCallEndCtx --> _AgentToolsGetter
    ToolCallEndCtx --> _StreamHookState
    ToolCallEndCtx --> SessionsChat
    ToolCallEndCtx --> _FilesUploader
    ToolCallEndCtx --> _FilesGetter
    ToolCallEndCtx --> ErrorInfo
    ToolCallEndCtx --> Response
    ToolCallInfo --> _SessionSnapshot
    ToolCallInfo --> _StartupHeader
    ToolCallInfo --> TimedFormatter
    ToolCallInfo --> _ApprovalVerdict
    ToolCallInfo --> _ApprovalState
    ToolCallInfo --> _FieldInputState
    ToolCallInfo --> _SessionsChatReplAdapter
    ToolCallInfo --> _OutputItemRenderPlan
    ToolCallInfo --> _TurnProseTracker
    ToolCallInfo --> _ContextItems
    ToolCallInfo --> _TerminalInfo
    ToolCallInfo --> _SlashCommandCompleter
    ToolCallInfo --> _BangInputLexer
    ToolCallInfo --> ResponsesNamespace
    ToolCallInfo --> ErrorInfo
    ToolCallInfo --> Response
    ToolCallStartCtx --> ResponsesNamespace
    ToolCallStartCtx --> SessionToolCallInfo
    ToolCallStartCtx --> _AgentToolsGetter
    ToolCallStartCtx --> _StreamHookState
    ToolCallStartCtx --> SessionsChat
    ToolCallStartCtx --> _FilesUploader
    ToolCallStartCtx --> _FilesGetter
    ToolCallStartCtx --> ErrorInfo
    ToolCallStartCtx --> Response
    ToolHandler --> OmnigentClient
    ToolHandler --> ResponsesNamespace
    ToolHandler --> Session
    ToolHandler --> ErrorInfo
    ToolHandler --> Response
    ToolResultInfo --> ResponsesNamespace
    ToolResultInfo --> ErrorInfo
    ToolResultInfo --> Response
    ToolResultsReadyCtx --> ResponsesNamespace
    ToolResultsReadyCtx --> ErrorInfo
    ToolResultsReadyCtx --> Response
    TransportErrorCtx --> ErrorInfo
    TransportErrorCtx --> Response
    ErrorInfo --> _SessionSnapshot
    ErrorInfo --> _StartupHeader
    ErrorInfo --> TimedFormatter
    ErrorInfo --> _ApprovalVerdict
    ErrorInfo --> _ApprovalState
    ErrorInfo --> _FieldInputState
    ErrorInfo --> _SessionsChatReplAdapter
    ErrorInfo --> _OutputItemRenderPlan
    ErrorInfo --> _TurnProseTracker
    ErrorInfo --> _ContextItems
    ErrorInfo --> _TerminalInfo
    ErrorInfo --> _SlashCommandCompleter
    ErrorInfo --> _BangInputLexer
    ErrorInfo --> ResponseCreated
    ErrorInfo --> ResponseQueued
    ErrorInfo --> ResponseInProgress
    ErrorInfo --> ResponseCompleted
    ErrorInfo --> ResponseFailed
    ErrorInfo --> ResponseIncomplete
    ErrorInfo --> ResponseCancelled
    ErrorInfo --> TextDelta
    ErrorInfo --> ReasoningStarted
    ErrorInfo --> ReasoningDelta
    ErrorInfo --> ReasoningSummaryDelta
    ErrorInfo --> ToolCall
    ErrorInfo --> ToolResult
    ErrorInfo --> ElicitationRequest
    ErrorInfo --> NativeToolCall
    ErrorInfo --> MessageDone
    ErrorInfo --> OutputFileDone
    ErrorInfo --> RetryEvent
    ErrorInfo --> ErrorEvent
    ErrorInfo --> CompactionInProgress
    ErrorInfo --> CompactionCompleted
    ErrorInfo --> CompactionFailed
    ErrorInfo --> ClientTaskCancel
    ErrorInfo --> ToolCallInfo
    ErrorInfo --> ToolHandler
    ErrorInfo --> ToolCallStartCtx
    ErrorInfo --> ToolCallEndCtx
    ErrorInfo --> NativeToolCallCtx
    ErrorInfo --> ToolResultInfo
    ErrorInfo --> ToolResultsReadyCtx
    ErrorInfo --> ReasoningStartCtx
    ErrorInfo --> ReasoningEndCtx
    ErrorInfo --> CompactionStartCtx
    ErrorInfo --> CompactionEndCtx
    ErrorInfo --> MessageStartCtx
    ErrorInfo --> MessageEndCtx
    ErrorInfo --> FileOutputCtx
    ErrorInfo --> RetryCtx
    ErrorInfo --> ServerErrorCtx
    ErrorInfo --> TransportErrorCtx
    ErrorInfo --> SubAgentInfo
    ErrorInfo --> SubAgentSpawnedCtx
    ErrorInfo --> SubAgentCompletedCtx
    ErrorInfo --> ElicitationRequestCtx
    ErrorInfo --> ResponseStartCtx
    ErrorInfo --> ResponseEndCtx
    ErrorInfo --> StreamHooks
    ErrorInfo --> _CapturingHost
    ErrorInfo --> _StubSession
    ErrorInfo --> _StubHost
    ErrorInfo --> _StubFmt
    ErrorInfo --> _StubSkillSession
    ErrorInfo --> _StubSessionsModeSession
    File --> FilesNamespace
    File --> SessionFilesNamespace
    File --> QueryResult
    File --> QueryStream
    File --> Session
    File --> SessionToolCallInfo
    File --> _AgentToolsGetter
    File --> _StreamHookState
    File --> SessionsChat
    File --> _FilesUploader
    File --> _FilesGetter
    File --> _PostEventCall
    File --> _ResolveElicitationCall
    File --> _StreamScript
    File --> _FakeNamespace
    File --> _GatedReadyNamespace
    File --> _UploaderCall
    File --> _FakeUploader
    File --> _GetterCall
    File --> _FakeGetter
    File --> _AgentToolsCall
    File --> _FakeAgentToolsGetter
    PaginatedList --> FilesNamespace
    PaginatedList --> SessionFilesNamespace
    Response --> _SessionSnapshot
    Response --> _StartupHeader
    Response --> TimedFormatter
    Response --> _ApprovalVerdict
    Response --> _ApprovalState
    Response --> _FieldInputState
    Response --> _SessionsChatReplAdapter
    Response --> _OutputItemRenderPlan
    Response --> _TurnProseTracker
    Response --> _ContextItems
    Response --> _TerminalInfo
    Response --> _SlashCommandCompleter
    Response --> _BangInputLexer
    Response --> ReasoningChunk
    Response --> ResponseCreated
    Response --> ResponseQueued
    Response --> ResponseInProgress
    Response --> ResponseCompleted
    Response --> ResponseFailed
    Response --> ResponseIncomplete
    Response --> ResponseCancelled
    Response --> TextDelta
    Response --> ReasoningStarted
    Response --> ReasoningDelta
    Response --> ReasoningSummaryDelta
    Response --> ToolCall
    Response --> ToolResult
    Response --> ElicitationRequest
    Response --> NativeToolCall
    Response --> MessageDone
    Response --> OutputFileDone
    Response --> RetryEvent
    Response --> ErrorEvent
    Response --> CompactionInProgress
    Response --> CompactionCompleted
    Response --> CompactionFailed
    Response --> ClientTaskCancel
    Response --> ResponsesNamespace
    Response --> Session
    Response --> SessionToolCallInfo
    Response --> _AgentToolsGetter
    Response --> _StreamHookState
    Response --> SessionsChat
    Response --> _FilesUploader
    Response --> _FilesGetter
    Response --> ToolCallInfo
    Response --> ToolHandler
    Response --> ToolCallStartCtx
    Response --> ToolCallEndCtx
    Response --> NativeToolCallCtx
    Response --> ToolResultInfo
    Response --> ToolResultsReadyCtx
    Response --> ReasoningStartCtx
    Response --> ReasoningEndCtx
    Response --> CompactionStartCtx
    Response --> CompactionEndCtx
    Response --> MessageStartCtx
    Response --> MessageEndCtx
    Response --> FileOutputCtx
    Response --> RetryCtx
    Response --> ServerErrorCtx
    Response --> TransportErrorCtx
    Response --> SubAgentInfo
    Response --> SubAgentSpawnedCtx
    Response --> SubAgentCompletedCtx
    Response --> ElicitationRequestCtx
    Response --> ResponseStartCtx
    Response --> ResponseEndCtx
    Response --> StreamHooks
    Response --> _ScriptedSession
    Response --> _ResponsesStub
    Response --> _ClientStub
    Response --> _ResponsesStub
    Response --> _ClientStub
    Response --> FakeSession
    SkillSpec --> LocalServer
    SkillSpec --> _SessionToolAdapter
    SkillSpec --> _DatabricksTokenAuth
    SkillSpec --> _AttachSessionInfo
    SkillSpec --> _DaemonChatSession
    SkillSpec --> _SessionSnapshot
    SkillSpec --> _StartupHeader
    SkillSpec --> TimedFormatter
    SkillSpec --> _ApprovalVerdict
    SkillSpec --> _ApprovalState
    SkillSpec --> _FieldInputState
    SkillSpec --> _SessionsChatReplAdapter
    SkillSpec --> _OutputItemRenderPlan
    SkillSpec --> _TurnProseTracker
    SkillSpec --> _ContextItems
    SkillSpec --> _TerminalInfo
    SkillSpec --> _SlashCommandCompleter
    SkillSpec --> _BangInputLexer
    SkillSpec --> _CapturingHost
    SkillSpec --> _StubSession
    SkillSpec --> _StubHost
    SkillSpec --> _StubFmt
    SkillSpec --> _StubSkillSession
    SkillSpec --> _StubSessionsModeSession
    SkillSpec --> _ExecutorStub
    SkillSpec --> _SpecStub
    SkillSpec --> _ServerClient
```

## Relationships

- [[Community 4]] (2487 shared connections)
- [[Community 3]] (312 shared connections)
- [[Community 6]] (265 shared connections)
- [[Community 19]] (210 shared connections)
- [[Community 14]] (42 shared connections)
- [[Auth Config]] (26 shared connections)
- [[Community 1]] (19 shared connections)
- [[Community 10]] (10 shared connections)
- [[Community 16]] (8 shared connections)
- [[Community 9]] (1 shared connections)
- [[Community 31]] (1 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\chat.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/chat.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\conversation_browser.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/conversation_browser.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\document.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/document.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\banner.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/banner.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\llms\types.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/llms/types.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\configure_models.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/configure_models.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\repl\_event_tape.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/repl/_event_tape.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\repl\_repl.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/repl/_repl.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runtime\compaction.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/compaction.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runtime\harnesses\_scaffold.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/harnesses/_scaffold.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\server\schemas.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\server\static\web-ui\assets\monacoCodeEditor-BzxvY4cV.js](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/static/web-ui/assets/monacoCodeEditor-BzxvY4cV.js)
- [C:\Users\1\github-pr\agent-meow\agent_meow\spec\types.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\__init__.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/__init__.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_blocks.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_blocks.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_child_status.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_child_status.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_client.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_client.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_errors.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_errors.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_events.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_events.py)
- [C:\Users\1\github-pr\agent-meow\sdks\python-client\omnigent_client\_files.py](file:///C:/Users/1/github-pr/agent-meow/sdks/python-client/omnigent_client/_files.py)

## Audit Trail

- EXTRACTED: 6441 (13%)
- INFERRED: 42839 (87%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*