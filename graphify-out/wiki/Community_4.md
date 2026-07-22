# Community 4

> 6140 nodes · cohesion 0.00

## Key Concepts

- [SqlAlchemyConversationStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/conversation_store/sqlalchemy_store.py#L457) (2608 connections)
- [HostStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/host_store.py#L165) (1591 connections)
- [SqlAlchemyAgentStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/agent_store/sqlalchemy_store.py#L18) (1572 connections)
- [AgentCache](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/agent_cache.py#L16) (1454 connections)
- [SqlAlchemyFileStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/file_store/sqlalchemy_store.py#L35) (1185 connections)
- [RunnerStartupProgress](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_runner_startup.py#L89) (1158 connections)
- [SqlAlchemyPermissionStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/permission_store/sqlalchemy_store.py#L55) (1147 connections)
- [LocalArtifactStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/artifact_store/local.py#L10) (1130 connections)
- [EvaluationContext](file:///C:/Users/1/github-pr/agent-meow/agent_meow/policies/types.py#L65) (1106 connections)
- [FunctionPolicySpec](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L1316) (1092 connections)
- [UnifiedAuthProvider](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/auth.py#L271) (1067 connections)
- [Phase](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L1074) (1053 connections)
- [PolicyAction](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L1116) (950 connections)
- [SqlAlchemyCommentStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/comment_store/sqlalchemy_store.py#L40) (910 connections)
- [PolicyEngine](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/policies/engine.py#L43) (756 connections)
- [DetectedProvider](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/ambient.py#L90) (693 connections)
- [FunctionRef](file:///C:/Users/1/github-pr/agent-meow/agent_meow/spec/types.py#L1245) (658 connections)
- [TunnelRegistry](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/transports/ws_tunnel/registry.py#L195) (652 connections)
- [ElicitationRequestParams](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L3146) (632 connections)
- [AuthProvider](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/auth.py#L237) (607 connections)
- [RuntimeCaps](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/caps.py#L16) (605 connections)
- [SqlAlchemyAccountStore](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/accounts_store.py#L73) (601 connections)
- [SessionCreatedEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/schemas.py#L2759) (591 connections)
- [PolicyResult](file:///C:/Users/1/github-pr/agent-meow/agent_meow/policies/types.py#L204) (586 connections)
- [HostHelloFrame](file:///C:/Users/1/github-pr/agent-meow/agent_meow/host/frames.py#L62) (575 connections)
- *... and 6115 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class ChangePasswordRequest {
        +accounts_auth.py()
    }
    class InviteRequest {
        +accounts_auth.py()
    }
    class LoginRequest {
        +accounts_auth.py()
    }
    class RegisterRequest {
        +accounts_auth.py()
    }
    class SetupRequest {
        +accounts_auth.py()
    }
    class BootstrapResult {
        +accounts_bootstrap.py()
    }
    class AccountsConfig {
        +accounts_config.py()
    }
    class SqlAlchemyAccountStore {
        +accounts_store.py()
        +.__init__()
        +.create_user_with_password()
        +.get_user()
        +.is_admin()
        +.set_admin()
        +.list_users()
        +.delete_user()
        +.get_password_hash()
        +.update_password()
    }
    class AdminFlagStore {
        +admin_list.py()
        +.is_admin()
        +.set_admin()
    }
    class AdminList {
        +admin_list.py()
        +.__init__()
        +.is_admin()
    }
    class MtimeCachedIdentitySet {
        +admin_list.py()
        +.__init__()
        +._refresh()
        +.contains()
        +.snapshot()
    }
    class Agent {
        +agent.py()
    }
    class AgentCache {
        +agent_cache.py()
        +.__init__()
        +.load()
        +.replace()
        +.evict()
        +._extract_and_cache()
    }
    class LoadedAgent {
        +agent.py()
    }
    class DetectedProvider {
        +ambient.py()
    }
    class _FastAPICallNext {
        +app.py()
        +.__call__()
    }
    class _RangeAwareGZipMiddleware {
        +app.py()
        +.__call__()
    }
    class _SPAStaticFiles {
        +app.py()
        +.__call__()
        +.get_response()
    }
    class _WebSocketMetricsMiddleware {
        +app.py()
        +.__init__()
        +.__call__()
    }
    class AuthProvider {
        +auth.py()
        +.mint_runner_token()
    }
    class _CliTicket {
        +auth.py()
    }
    class UnifiedAuthProvider {
        +auth.py()
        +.__init__()
        +.get_user_id()
        +.mint_runner_token()
        +._check_cookie()
        +._check_header()
    }
    class Policy {
        +base.py()
        +.reset_turn()
    }
    class RuntimeCaps {
        +caps.py()
    }
    class _AttachOutcome {
        +claude_native.py()
    }
    class _BuiltinEntry {
        +cli.py()
    }
    class _CliRunnerProcess {
        +cli.py()
    }
    class _ConfigGroup {
        +cli.py()
        +.parse_args()
    }
    class _DaemonReuseDecision {
        +cli.py()
    }
    class _DaemonSessionsResult {
        +cli.py()
    }
    class _DeployConfig {
        +cli.py()
    }
    class _ExecutorDeploy {
        +cli.py()
    }
    class _FirstRunPlan {
        +cli.py()
    }
    class _HarnessMenuRow {
        +cli.py()
    }
    class _HostDaemonRecord {
        +cli.py()
    }
    class _HostGroup {
        +cli.py()
        +.parse_args()
        +._rewrite_positional_server()
        +._token_is_positional_server()
    }
    class _HostHttpResult {
        +cli.py()
    }
    class _HostSessionsTableWidths {
        +cli.py()
    }
    class _LLMDeploy {
        +cli.py()
    }
    class _OmnigentCLI {
        +cli.py()
        +.format_help()
    }
    class _ResumeChoice {
        +cli.py()
    }
    class _SessionPagesResult {
        +cli.py()
    }
    class _SessionsPageResult {
        +cli.py()
    }
    class _SpawnedDaemonProcess {
        +cli.py()
    }
    class _ToolsDeploy {
        +cli.py()
    }
    class SendCommentsRequest {
        +comments.py()
    }
    class UpdateCommentRequest {
        +comments.py()
    }
    class AddOption {
        +configure_models.py()
    }
    class _VendorEndpoint {
        +configure_models.py()
    }
    class ControllableMockClient {
        +conftest.py()
        +.__init__()
        +.add_call()
        +._next_call()
        +.release_all()
        +.get_call()
    }
    class HostConnectError {
        +connect.py()
    }
    class HostProcess {
        +connect.py()
        +.__init__()
        +._tracked_runner_pids()
        +._orphan_reaper_loop()
        +._reap_orphans_once()
        +._reap_orphans_waitid()
        +._reap_orphans_waitpid()
        +._runner_handle_for_pid()
        +._alive_runner_ids()
        +._tunnel_url()
    }
    class _RunnerHandle {
        +connect.py()
    }
    class ModelPricing {
        +context_window.py()
    }
    class Conversation {
        +conversation.py()
    }
    class FunctionCallData {
        +conversation.py()
    }
    class FunctionCallOutputData {
        +conversation.py()
    }
    class ResourceEventData {
        +conversation.py()
    }
    class _ExpensiveModelConfig {
        +cost.py()
    }
    class DatabricksVolumesArtifactStore {
        +databricks_volumes.py()
        +.__init__()
        +._resolve()
        +.put()
        +.get()
        +.delete()
        +.exists()
    }
    class SqlConversation {
        +db_models.py()
    }
    class SqlConversationItem {
        +db_models.py()
    }
    class SqlHost {
        +db_models.py()
    }
    class SqlUser {
        +db_models.py()
    }
    class CreateDocumentRequest {
        +documents.py()
    }
    class UpdateDocumentRequest {
        +documents.py()
    }
    class _ParkedHarnessElicitation {
        +_elicitation_registry.py()
    }
    class PolicyEngine {
        +engine.py()
        +.__init__()
        +.evaluate()
        +._evaluate_composed()
        +._compose_deny()
        +._should_fire()
        +.apply_label_writes()
        +.apply_state_updates()
        +._record_root_cost_ask_approved()
        +._record_user_daily_ask_approved()
    }
    class _BuiltApp {
        +entrypoint.py()
    }
    class _ResolvedConfig {
        +entrypoint.py()
    }
    class ElicitationDeclinedError {
        +errors.py()
        +.__init__()
    }
    class HostCreateDirFrame {
        +frames.py()
    }
    class HostCreateDirResultFrame {
        +frames.py()
    }
    class HostCreateWorktreeFrame {
        +frames.py()
    }
    class HostCreateWorktreeResultFrame {
        +frames.py()
    }
    class HostHelloFrame {
        +frames.py()
    }
    class HostLaunchRunnerFrame {
        +frames.py()
    }
    class HostLaunchRunnerResultFrame {
        +frames.py()
    }
    class HostListDirEntry {
        +frames.py()
    }
    class HostListDirFrame {
        +frames.py()
    }
    class HostListDirResultFrame {
        +frames.py()
    }
    class HostRemoveWorktreeFrame {
        +frames.py()
    }
    class HostRemoveWorktreeResultFrame {
        +frames.py()
    }
    class HostRunnerExitedFrame {
        +frames.py()
    }
    class HostStatFrame {
        +frames.py()
    }
    class HostStatResultFrame {
        +frames.py()
    }
    class HostStopRunnerFrame {
        +frames.py()
    }
    class HostStopRunnerResultFrame {
        +frames.py()
    }
    class PongFrame {
        +frames.py()
    }
    class FunctionPolicy {
        +function.py()
        +.__init__()
        +.evaluate()
        +.reset_turn()
        +._call()
    }
    class WorktreeError {
        +git_worktree.py()
        +.__init__()
    }
    class _CalCfg {
        +google.py()
    }
    class _DriveCfg {
        +google.py()
    }
    class _GmailCfg {
        +google.py()
    }
    class _ParsedToolCall {
        +google.py()
    }
    class NativeCodingAgent {
        +harness_plugins.py()
    }
    class CapturingRunnerClient {
        +helpers.py()
        +.__init__()
        +.post()
    }
    class FakeSandboxLauncher {
        +helpers.py()
        +.__init__()
        +.prepare()
        +.provision()
        +.attach()
        +.keep_alive()
        +.run()
        +.put()
        +.stream_exec()
        +.exec_foreground()
    }
    class HostStartInvocation {
        +helpers.py()
    }
    class HostLaunchTarget {
        +_host_launch.py()
    }
    class HostConnection {
        +host_registry.py()
    }
    class HostRegistry {
        +host_registry.py()
        +.__init__()
        +.register()
        +.deregister()
        +.get()
        +.online_host_ids()
        +.send_text()
    }
    class RunnerExitReport {
        +host_registry.py()
    }
    class RunnerExitReports {
        +host_registry.py()
        +.__init__()
        +.record()
        +.get()
        +.get_visible()
    }
    class WebSocketLike {
        +host_registry.py()
        +.send_text()
        +.receive_text()
    }
    class Host {
        +host_store.py()
    }
    class HostStore {
        +host_store.py()
        +.__init__()
        +.upsert_on_connect()
        +._reown_host_id()
        +.set_offline()
        +.heartbeat()
        +.is_online()
        +.online_host_ids()
        +.list_hosts()
        +.get_host()
    }
    class CreatedWorktree {
        +_host_worktree.py()
    }
    class WorktreeHostUnavailableError {
        +_host_worktree.py()
    }
    class WorktreeProxyError {
        +_host_worktree.py()
        +.__init__()
    }
    class CreateDirectoryRequest {
        +hosts.py()
    }
    class LaunchRunnerRequest {
        +hosts.py()
    }
    class HostIdentity {
        +identity.py()
    }
    class UpdateImageEditRequest {
        +images.py()
    }
    class LocalArtifactStore {
        +local.py()
        +.__init__()
        +._resolve()
        +.put()
        +.get()
        +.delete()
        +.exists()
    }
    class ManagedHostLaunch {
        +managed_hosts.py()
    }
    class ManagedLaunch {
        +managed_hosts.py()
    }
    class ManagedLaunchTracker {
        +managed_hosts.py()
        +.__init__()
        +.begin()
        +.get()
        +.finish()
        +.fail()
    }
    class ManagedSandboxConfig {
        +managed_hosts.py()
    }
    class RepoWorkspace {
        +managed_hosts.py()
    }
    class ServerMcpPool {
        +mcp_pool.py()
        +.__init__()
        +.list_tools()
        +.call_tool()
        +.shutdown_for()
        +.shutdown_all()
        +._ensure_warm()
        +._connect_all()
        +._connect_server()
        +._close_entry()
    }
    class InvitedEmailLookup {
        +oidc_access.py()
        +.is_email_invited()
    }
    class OidcAdmissionPolicy {
        +oidc_access.py()
        +.__init__()
        +.effective_domains()
        +.is_admitted()
    }
    class OIDCConfig {
        +oidc.py()
    }
    class CompletedRequestTiming {
        +performance_metrics.py()
    }
    class CounterInstrument {
        +performance_metrics.py()
        +.add()
    }
    class GaugeInstrument {
        +performance_metrics.py()
        +.set()
    }
    class HistogramInstrument {
        +performance_metrics.py()
        +.record()
    }
    class RequestDurationAccessFormatter {
        +performance_metrics.py()
        +.formatMessage()
    }
    class RequestMetricValues {
        +performance_metrics.py()
    }
    class ServerMetricsOtelPublisher {
        +performance_metrics.py()
        +.__init__()
        +.record_request_duration()
        +.publish()
        +._publish_counter_deltas()
        +._add_delta()
    }
    class ServerMetricsSnapshot {
        +performance_metrics.py()
    }
    class ServerPerformanceMetrics {
        +performance_metrics.py()
        +.__init__()
        +.request_started()
        +.request_finished()
        +.websocket_connected()
        +.websocket_disconnected()
        +.snapshot()
        +._request_metric_values_locked()
        +._prune_locked()
        +._count_since_locked()
    }
    class SystemLoadAverage {
        +performance_metrics.py()
    }
    class ResolvedAccess {
        +permission.py()
    }
    class SessionPermission {
        +permission.py()
    }
    class _GatedPolicy {
        +policy.py()
    }
    class PolicyVerdict {
        +policy.py()
    }
    class ProviderEntry {
        +provider_config.py()
        +.family()
        +.family_default_model()
    }
    class TunnelRegistry {
        +registry.py()
        +.__init__()
        +.register()
        +.deregister()
        +.get()
        +.wait_for_runner()
        +.connect_waiter_count()
        +.connect_wait_started_at()
        +.online_runner_ids()
        +.runner_owner()
    }
    class _RiskCfg {
        +risk_score.py()
    }
    class RoutedRunner {
        +routing.py()
    }
    class RunnerRouter {
        +routing.py()
        +.__init__()
        +.client_for_conversation()
        +.client_for_session_resources()
        +.client_for_existing_conversation()
        +.runner_is_online()
        +.runner_owner()
        +.aclose()
        +._routed_pinned_runner()
        +._client_for_runner()
    }
    class RunnerStartupProgress {
        +_runner_startup.py()
    }
    class ActorContext {
        +schema.py()
    }
    class EventContext {
        +schema.py()
    }
    class PolicyCallable {
        +schema.py()
        +.__call__()
    }
    class PolicyCallableWithConfig {
        +schema.py()
        +.__call__()
    }
    class PolicyEvent {
        +schema.py()
    }
    class PolicyResponse {
        +schema.py()
    }
    class StateUpdateEntry {
        +schema.py()
    }
    class UsageContext {
        +schema.py()
    }
    class UserDailyCostContext {
        +schema.py()
    }
    class AgentObject {
        +schemas.py()
    }
    class ChildSessionList {
        +schemas.py()
    }
    class ChildSessionSummary {
        +schemas.py()
    }
    class ClearCodexGoalResponse {
        +schemas.py()
    }
    class CodexGoalObject {
        +schemas.py()
    }
    class CodexGoalResponse {
        +schemas.py()
    }
    class ConversationDeleted {
        +schemas.py()
    }
    class ConversationObject {
        +schemas.py()
    }
    class ConversationRef {
        +schemas.py()
    }
    class CreateDefaultPolicyRequest {
        +schemas.py()
    }
    class CreatedSessionResponse {
        +schemas.py()
    }
    class CreateSessionPolicyRequest {
        +schemas.py()
    }
    class DefaultPolicyObject {
        +schemas.py()
    }
    class ElicitationRequestParams {
        +schemas.py()
    }
    class ElicitationResult {
        +schemas.py()
    }
    class ErrorDetail {
        +schemas.py()
    }
    class FileObject {
        +schemas.py()
    }
    class GrantPermissionRequest {
        +schemas.py()
    }
    class MCPServerSummary {
        +schemas.py()
    }
    class ModelUsage {
        +schemas.py()
    }
    class PaginatedList {
        +schemas.py()
    }
    class PermissionObject {
        +schemas.py()
    }
    class PolicySummary {
        +schemas.py()
    }
    class PresenceViewer {
        +schemas.py()
    }
    class ReadStatePutRequest {
        +schemas.py()
    }
    class ResponseObject {
        +schemas.py()
    }
    class SandboxStatus {
        +schemas.py()
    }
    class SessionAgentChangedEvent {
        +schemas.py()
    }
    class SessionCollaborationModeEvent {
        +schemas.py()
    }
    class SessionCreatedEvent {
        +schemas.py()
    }
    class SessionCreateMetadata {
        +schemas.py()
    }
    class SessionCreateRequest {
        +schemas.py()
    }
    class SessionEventInput {
        +schemas.py()
    }
    class SessionForkRequest {
        +schemas.py()
    }
    class SessionGitOptions {
        +schemas.py()
    }
    class SessionInputConsumedPayload {
        +schemas.py()
    }
    class SessionInterruptedEvent {
        +schemas.py()
    }
    class SessionInterruptedPayload {
        +schemas.py()
    }
    class SessionLabelsResponse {
        +schemas.py()
    }
    class SessionList {
        +schemas.py()
    }
    class SessionListItem {
        +schemas.py()
    }
    class SessionModelEvent {
        +schemas.py()
    }
    class SessionModelOptionsEvent {
        +schemas.py()
    }
    class SessionPolicyObject {
        +schemas.py()
    }
    class SessionReasoningEffortEvent {
        +schemas.py()
    }
    class SessionResourceListPage {
        +schemas.py()
    }
    class SessionResourceObject {
        +schemas.py()
    }
    class SessionResourcePaginatedList {
        +schemas.py()
    }
    class SessionResponse {
        +schemas.py()
    }
    class SessionSandboxStatusEvent {
        +schemas.py()
    }
    class SessionSkillsEvent {
        +schemas.py()
    }
    class SessionSupersededEvent {
        +schemas.py()
    }
    class SessionSwitchAgentRequest {
        +schemas.py()
    }
    class SessionTerminalPendingEvent {
        +schemas.py()
    }
    class SessionTodosEvent {
        +schemas.py()
    }
    class SessionUsageEvent {
        +schemas.py()
    }
    class SetCodexGoalRequest {
        +schemas.py()
    }
    class SkillSummary {
        +schemas.py()
    }
    class ToolResult {
        +schemas.py()
    }
    class UpdateCodexGoalStatusRequest {
        +schemas.py()
    }
    class UpdateDefaultPolicyRequest {
        +schemas.py()
    }
    class UpdateSessionPolicyRequest {
        +schemas.py()
    }
    class UpdateSessionRequest {
        +schemas.py()
    }
    class UpsertMCPServerRequest {
        +schemas.py()
    }
    class UsageDetails {
        +schemas.py()
    }
    class _McpLocation {
        +session_mcp_servers.py()
    }
    class _HostLaunchAttempt {
        +sessions.py()
    }
    class _MirroredToolCall {
        +sessions.py()
    }
    class _NativeTerminalEnsureOutcome {
        +sessions.py()
    }
    class _PendingPolicyAskWrites {
        +sessions.py()
    }
    class _RelayHandle {
        +sessions.py()
    }
    class _RunnerForwardResult {
        +sessions.py()
    }
    class _SessionEventDispatchResult {
        +sessions.py()
    }
    class SessionLiveness {
        +sessions.py()
    }
    class LLMRoutingClient {
        +smart_routing.py()
        +.__init__()
        +.route()
    }
    class RoutingClient {
        +smart_routing.py()
        +.route()
    }
    class SqlAlchemyAgentStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.create()
        +.get()
        +.get_by_name()
        +.list()
        +.get_names()
        +.update()
        +.delete()
    }
    class SqlAlchemyCommentStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.get()
        +.add()
        +.list_for_conversation()
        +.update_comment()
        +.delete()
        +.get_comments_fingerprints()
        +.remove_conversation()
    }
    class SqlAlchemyConversationStore {
        +sqlalchemy_store.py()
        +.__init__()
        +._lock_conversation()
        +.create_conversation()
        +.get_conversation()
        +.get_runner_ids()
        +.get_session_connectivity()
        +.get_conversations()
        +.list_child_conversation_ids_by_parent()
        +.set_labels()
    }
    class SqlAlchemyDocumentStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.get()
        +.add()
        +.list_for_conversation()
        +.update()
        +.delete()
        +.delete_for_conversation()
    }
    class SqlAlchemyFileStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.create()
        +.get()
        +.list()
        +.delete()
        +.delete_all_for_session()
    }
    class SqlAlchemyImageStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.get()
        +.add()
        +.list_for_conversation()
        +.update_edit()
        +.delete()
        +.delete_for_conversation()
    }
    class SqlAlchemyPermissionStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.grant()
        +.revoke()
        +.get()
        +.reassign_user_grants()
        +.list_for_session()
        +.list_for_sessions()
        +.list_for_user()
        +.ensure_user()
    }
    class SqlAlchemyPolicyStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.create()
        +.get()
        +.list_for_session()
        +.update()
        +.delete()
        +.create_default()
        +.get_default()
        +.list_defaults()
    }
    class SqlAlchemyVideoStore {
        +sqlalchemy_store.py()
        +.__init__()
        +.get()
        +.add()
        +.list_for_conversation()
        +.delete()
        +.delete_for_conversation()
    }
    class StartupProfiler {
        +_startup_profile.py()
        +.__post_init__()
        +.mark()
    }
    class SubagentBlockNotifier {
        +subagent_block_notifier.py()
        +.__init__()
        +.observe()
        +._discard_inflight()
        +.close()
        +.handle_request()
        +._deliver_with_retry()
    }
    class _WakeOutcome {
        +subagent_block_notifier.py()
    }
    class _FakeReq {
        +test_accounts.py()
        +.__init__()
    }
    class _LivenessApp {
        +test_app.py()
    }
    class _SeedStores {
        +test_app.py()
    }
    class _StubWebSocket {
        +test_app.py()
        +.send_text()
        +.receive_text()
    }
    class _Recorder {
        +test_approval.py()
        +.__init__()
        +.register()
        +.emit()
    }
    class _ElicitationHarness {
        +test_ask_cycle_e2e.py()
        +.__init__()
        +.register()
        +.emit()
        +.park()
    }
    class _Harness {
        +test_ask_with_schema_validation.py()
        +.__init__()
        +.register()
        +.emit()
        +.park()
    }
    class _AcceptingConnect {
        +test_connect.py()
        +.__aenter__()
        +.__aexit__()
    }
    class _ConnectSpy {
        +test_connect.py()
        +.__init__()
        +.__call__()
    }
    class _DroppedTunnel {
        +test_connect.py()
        +.send()
        +.recv()
    }
    class _FakeTunnel {
        +test_connect.py()
        +.__init__()
        +.send()
        +.recv()
    }
    class _HandshakeFailingConnect {
        +test_connect.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
    }
    class _StubConversationStore {
        +test_engine_read_only.py()
        +.set_labels()
        +.set_session_state()
        +.list_items()
    }
    class _StubPolicy {
        +test_engine_read_only.py()
        +.evaluate()
    }
    class _CapturingPolicy {
        +test_engine_trajectory.py()
        +.__init__()
        +.evaluate()
    }
    class _CapturingPolicySpec {
        +test_engine_trajectory.py()
    }
    class FakeWebSocket {
        +test_host_registry.py()
        +.send_text()
        +.receive_text()
    }
    class _FakeWebSocket {
        +test_host_runner_launch_worktree.py()
        +.send_text()
    }
    class _HostCapture {
        +test_host_runner_launch_worktree.py()
    }
    class ManagedSessionEnv {
        +test_host_session_binding.py()
    }
    class _FixedAuthProvider {
        +test_host_tunnel_route.py()
        +.__init__()
        +.get_user_id()
    }
    class _FakeWebSocket {
        +test_host_worktree.py()
        +.__init__()
        +.send_text()
    }
    class _StubAuthProvider {
        +test_hosts_api.py()
        +.__init__()
        +.get_user_id()
    }
    class _EntrypointFakeLauncher {
        +test_managed_hosts.py()
        +.__init__()
        +.provision()
        +.run()
        +.start_host()
    }
    class _StubInvitedLookup {
        +test_oidc_access.py()
        +.__init__()
        +.is_email_invited()
    }
    class _IdpKeys {
        +test_oidc_callback.py()
        +.__init__()
        +.sign_id_token()
    }
    class _FakeAsyncClient {
        +test_oidc_open_redirect.py()
        +.__aenter__()
        +.__aexit__()
        +.post()
    }
    class _FakeResponse {
        +test_oidc_open_redirect.py()
        +.json()
    }
    class _FakeCounter {
        +test_performance_metrics.py()
        +.add()
    }
    class _FakeGauge {
        +test_performance_metrics.py()
        +.set()
    }
    class _FakeHistogram {
        +test_performance_metrics.py()
        +.record()
    }
    class _FakeMeter {
        +test_performance_metrics.py()
        +.create_counter()
        +.create_gauge()
        +.create_histogram()
    }
    class _FakeMetricInputs {
        +test_performance_metrics.py()
        +.clock()
        +.process_time()
        +.rss_bytes()
        +.load_average()
    }
    class _MetricRecord {
        +test_performance_metrics.py()
    }
    class _StubConversationStore {
        +test_permissions.py()
        +.__init__()
        +.get_conversation()
        +.add()
    }
    class _StubPermissionStore {
        +test_permissions.py()
        +.__init__()
        +.get()
        +.is_admin()
        +.add_grant()
        +.add_admin()
        +.check_access()
        +.get_permission_level()
    }
    class _FakeClient {
        +test_policy_llm_client.py()
        +.__init__()
    }
    class _FakeResponsesNamespace {
        +test_policy_llm_client.py()
        +.__init__()
    }
    class _FakeAPClient {
        +test_resume_picker.py()
        +.__init__()
    }
    class _FakeConversationsNamespace {
        +test_resume_picker.py()
        +.list_items()
    }
    class _FakeSessionsNamespace {
        +test_resume_picker.py()
        +.__init__()
        +.list()
    }
    class _ConversationStore {
        +test_routing.py()
        +.__init__()
        +.get_conversation()
    }
    class _FakeWebSocket {
        +test_routing.py()
        +.send_text()
        +.receive_text()
    }
    class _NeverConnectsRegistry {
        +test_runner_connect_wait.py()
        +.__init__()
        +.wait_for_runner()
    }
    class _NoopRunnerWS {
        +test_session_host_launch.py()
        +.send_text()
        +.receive_text()
    }
    class _NoIdentityAuthProvider {
        +test_session_updates_ws.py()
        +.get_user_id()
    }
    class _FakeWebSocket {
        +test_session_worktree_create.py()
        +.send_text()
    }
    class _FakeWebSocket {
        +test_session_worktree_delete.py()
        +.send_text()
    }
    class _CaptureRunnerClient {
        +test_sessions_attribution.py()
        +.post()
        +.get()
    }
    class _InputRequiredRunnerClient {
        +test_sessions_elicitation_resolve_url.py()
        +.__init__()
        +.post()
    }
    class _ForwardedEffort {
        +test_sessions_endpoints.py()
    }
    class _FixedPolicyEngine {
        +test_sessions_mcp_proxy_policy_retry.py()
        +.evaluate()
        +.apply_label_writes()
        +.apply_state_updates()
    }
    class _StubAgentStore {
        +test_sessions_mcp_proxy_policy_retry.py()
        +.get()
    }
    class _StubConversationStore {
        +test_sessions_mcp_proxy_policy_retry.py()
        +.get_conversation()
    }
    class _RaisingRunnerClient {
        +test_sessions_mcp_proxy.py()
        +.post()
    }
    class _RaisingRunnerRouter {
        +test_sessions_mcp_proxy.py()
        +.client_for_session_resources()
    }
    class _FakeAgentStore {
        +test_sessions_policy.py()
        +.get()
    }
    class _FakeBody {
        +test_sessions_policy.py()
    }
    class _FakeConversationStore {
        +test_sessions_policy.py()
        +.get_conversation()
        +.get_conversation_labels()
        +.set_labels()
        +.append()
    }
    class _FakeRequest {
        +test_sessions_policy.py()
        +.is_disconnected()
    }
    class _HeartbeatStreamResponse {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _ScriptedStreamResponse {
        +test_sessions_runner_relay.py()
        +.__init__()
        +.__aenter__()
        +.__aexit__()
        +.aiter_text()
    }
    class _PublishedUsage {
        +test_sessions_snapshot.py()
    }
    class _UsageStreamRecorder {
        +test_sessions_snapshot.py()
        +.publish()
    }
    class _CaptureRunnerClient {
        +test_sessions_tool_result_forward.py()
        +.__init__()
        +.post()
        +.get()
    }
    class FakeProcessManager {
        +test_sessions_tunnel_three_layer.py()
        +.__init__()
        +.start()
        +.shutdown()
        +.get_client()
        +.has_session()
        +.has_active_turn()
        +.mark_in_flight()
        +.clear_in_flight()
        +.release()
    }
    class _TunnelStack {
        +test_sessions_tunnel_three_layer.py()
    }
    class _FakeUpload {
        +test_sessions_upload_limits.py()
        +.__init__()
        +.read()
    }
    class _CapturedWake {
        +test_subagent_block_notifier.py()
    }
    class _FailThenSucceedDispatch {
        +test_subagent_block_notifier.py()
        +.__init__()
        +.__call__()
    }
    class _DispatchCall {
        +test_subagent_block_wake.py()
    }
    class _FakeWebSocket {
        +test_workspace_validation.py()
        +.__init__()
        +.send_text()
    }
    class ElicitationRequest {
        +types.py()
    }
    class EvaluationContext {
        +types.py()
    }
    class FunctionPolicySpec {
        +types.py()
    }
    class FunctionRef {
        +types.py()
    }
    class Phase {
        +types.py()
    }
    class PhaseSelector {
        +types.py()
        +.matches()
    }
    class PolicyAction {
        +types.py()
    }
    class PolicyLLMClient {
        +types.py()
        +.create()
    }
    class PolicyResult {
        +types.py()
    }
    class PolicySpec {
        +types.py()
    }
    class StateUpdate {
        +types.py()
    }
    class StateUpdateAction {
        +types.py()
    }
    class _DirOp {
        +working_dir.py()
    }
    class WorkspaceValidationError {
        +_workspace_validation.py()
        +.__init__()
    }
    class WebSocketOriginMiddleware {
        +ws_origin.py()
        +.__init__()
        +.__call__()
    }
    ChangePasswordRequest --> SqlAlchemyAccountStore
    ChangePasswordRequest --> AdminList
    ChangePasswordRequest --> UnifiedAuthProvider
    InviteRequest --> SqlAlchemyAccountStore
    InviteRequest --> AdminList
    InviteRequest --> UnifiedAuthProvider
    LoginRequest --> SqlAlchemyAccountStore
    LoginRequest --> AdminList
    LoginRequest --> UnifiedAuthProvider
    RegisterRequest --> SqlAlchemyAccountStore
    RegisterRequest --> AdminList
    RegisterRequest --> UnifiedAuthProvider
    SetupRequest --> SqlAlchemyAccountStore
    SetupRequest --> AdminList
    SetupRequest --> UnifiedAuthProvider
    BootstrapResult --> SqlAlchemyAccountStore
    AccountsConfig --> AuthProvider
    AccountsConfig --> UnifiedAuthProvider
    AccountsConfig --> _FakeReq
    SqlAlchemyAccountStore --> _FirstRunPlan
    SqlAlchemyAccountStore --> _OmnigentCLI
    SqlAlchemyAccountStore --> _HostDaemonRecord
    SqlAlchemyAccountStore --> _HostHttpResult
    SqlAlchemyAccountStore --> _HostSessionsTableWidths
    SqlAlchemyAccountStore --> _DaemonSessionsResult
    SqlAlchemyAccountStore --> _SessionsPageResult
    SqlAlchemyAccountStore --> _SessionPagesResult
    SqlAlchemyAccountStore --> _SpawnedDaemonProcess
    SqlAlchemyAccountStore --> _DaemonReuseDecision
    SqlAlchemyAccountStore --> _CliRunnerProcess
    SqlAlchemyAccountStore --> _LLMDeploy
    SqlAlchemyAccountStore --> _BuiltinEntry
    SqlAlchemyAccountStore --> _ToolsDeploy
    SqlAlchemyAccountStore --> _ExecutorDeploy
    SqlAlchemyAccountStore --> _DeployConfig
    SqlAlchemyAccountStore --> _ResumeChoice
    SqlAlchemyAccountStore --> _HostGroup
    SqlAlchemyAccountStore --> _ConfigGroup
    SqlAlchemyAccountStore --> _HarnessMenuRow
    SqlAlchemyAccountStore --> BootstrapResult
    SqlAlchemyAccountStore --> SqlUser
    SqlAlchemyAccountStore --> _FastAPICallNext
    SqlAlchemyAccountStore --> _WebSocketMetricsMiddleware
    SqlAlchemyAccountStore --> _SPAStaticFiles
    SqlAlchemyAccountStore --> _RangeAwareGZipMiddleware
    SqlAlchemyAccountStore --> LoginRequest
    SqlAlchemyAccountStore --> RegisterRequest
    SqlAlchemyAccountStore --> SetupRequest
    SqlAlchemyAccountStore --> InviteRequest
    SqlAlchemyAccountStore --> ChangePasswordRequest
    SqlAlchemyAccountStore --> _CliTicket
    SqlAlchemyAccountStore --> _ResolvedConfig
    SqlAlchemyAccountStore --> _BuiltApp
    SqlAlchemyAccountStore --> _FakeReq
    AdminList --> InvitedEmailLookup
    AdminList --> OidcAdmissionPolicy
    AdminList --> LoginRequest
    AdminList --> RegisterRequest
    AdminList --> SetupRequest
    AdminList --> InviteRequest
    AdminList --> ChangePasswordRequest
    AdminList --> _CliTicket
    AdminList --> _StubInvitedLookup
    AdminList --> _IdpKeys
    AdminList --> _FakeResponse
    AdminList --> _FakeAsyncClient
    MtimeCachedIdentitySet --> InvitedEmailLookup
    MtimeCachedIdentitySet --> OidcAdmissionPolicy
    Agent --> _FakeConversationStore
    Agent --> _FakeAgentStore
    Agent --> _FakeBody
    Agent --> _FakeRequest
    AgentCache --> _FirstRunPlan
    AgentCache --> _OmnigentCLI
    AgentCache --> _HostDaemonRecord
    AgentCache --> _HostHttpResult
    AgentCache --> _HostSessionsTableWidths
    AgentCache --> _DaemonSessionsResult
    AgentCache --> _SessionsPageResult
    AgentCache --> _SessionPagesResult
    AgentCache --> _SpawnedDaemonProcess
    AgentCache --> _DaemonReuseDecision
    AgentCache --> _CliRunnerProcess
    AgentCache --> _LLMDeploy
    AgentCache --> _BuiltinEntry
    AgentCache --> _ToolsDeploy
    AgentCache --> _ExecutorDeploy
    AgentCache --> _DeployConfig
    AgentCache --> _ResumeChoice
    AgentCache --> _HostGroup
    AgentCache --> _ConfigGroup
    AgentCache --> _HarnessMenuRow
    AgentCache --> _FastAPICallNext
    AgentCache --> _WebSocketMetricsMiddleware
    AgentCache --> _SPAStaticFiles
    AgentCache --> _RangeAwareGZipMiddleware
    AgentCache --> CreateDirectoryRequest
    AgentCache --> LaunchRunnerRequest
    AgentCache --> _MirroredToolCall
    AgentCache --> _PendingPolicyAskWrites
    AgentCache --> _RelayHandle
    AgentCache --> SessionLiveness
    AgentCache --> _RunnerForwardResult
    AgentCache --> _HostLaunchAttempt
    AgentCache --> _NativeTerminalEnsureOutcome
    AgentCache --> _SessionEventDispatchResult
    AgentCache --> _McpLocation
    AgentCache --> _ResolvedConfig
    AgentCache --> _BuiltApp
    AgentCache --> ControllableMockClient
    AgentCache --> _FakeReq
    AgentCache --> _StubWebSocket
    AgentCache --> _LivenessApp
    AgentCache --> _SeedStores
    AgentCache --> _EntrypointFakeLauncher
    AgentCache --> _StubAuthProvider
    AgentCache --> _FakeWebSocket
    AgentCache --> _HostCapture
    AgentCache --> ManagedSessionEnv
    AgentCache --> _CaptureRunnerClient
    AgentCache --> _InputRequiredRunnerClient
    AgentCache --> _CaptureRunnerClient
    AgentCache --> FakeProcessManager
    AgentCache --> _TunnelStack
    AgentCache --> _NoopRunnerWS
    LoadedAgent --> _FakeConversationStore
    LoadedAgent --> _FakeAgentStore
    LoadedAgent --> _FakeBody
    LoadedAgent --> _FakeRequest
    DetectedProvider --> _FirstRunPlan
    DetectedProvider --> _OmnigentCLI
    DetectedProvider --> _HostDaemonRecord
    DetectedProvider --> _HostHttpResult
    DetectedProvider --> _HostSessionsTableWidths
    DetectedProvider --> _DaemonSessionsResult
    DetectedProvider --> _SessionsPageResult
    DetectedProvider --> _SessionPagesResult
    DetectedProvider --> _SpawnedDaemonProcess
    DetectedProvider --> _DaemonReuseDecision
    DetectedProvider --> _CliRunnerProcess
    DetectedProvider --> _LLMDeploy
    DetectedProvider --> _BuiltinEntry
    DetectedProvider --> _ToolsDeploy
    DetectedProvider --> _ExecutorDeploy
    DetectedProvider --> _DeployConfig
    DetectedProvider --> _ResumeChoice
    DetectedProvider --> _HostGroup
    DetectedProvider --> _ConfigGroup
    DetectedProvider --> _HarnessMenuRow
    DetectedProvider --> _VendorEndpoint
    DetectedProvider --> AddOption
    _FastAPICallNext --> AgentCache
    _FastAPICallNext --> AuthProvider
    _FastAPICallNext --> ManagedSandboxConfig
    _FastAPICallNext --> ServerMcpPool
    _FastAPICallNext --> ServerMetricsOtelPublisher
    _FastAPICallNext --> ServerPerformanceMetrics
    _FastAPICallNext --> SessionLiveness
    _FastAPICallNext --> WebSocketOriginMiddleware
    _FastAPICallNext --> HostStore
    _FastAPICallNext --> UnifiedAuthProvider
    _FastAPICallNext --> RunnerRouter
    _FastAPICallNext --> TunnelRegistry
    _FastAPICallNext --> HostRegistry
    _FastAPICallNext --> RunnerExitReports
    _FastAPICallNext --> ManagedLaunchTracker
    _FastAPICallNext --> ErrorDetail
    _FastAPICallNext --> SqlAlchemyAccountStore
    _RangeAwareGZipMiddleware --> AgentCache
    _RangeAwareGZipMiddleware --> AuthProvider
    _RangeAwareGZipMiddleware --> ManagedSandboxConfig
    _RangeAwareGZipMiddleware --> ServerMcpPool
    _RangeAwareGZipMiddleware --> ServerMetricsOtelPublisher
    _RangeAwareGZipMiddleware --> ServerPerformanceMetrics
    _RangeAwareGZipMiddleware --> SessionLiveness
    _RangeAwareGZipMiddleware --> WebSocketOriginMiddleware
    _RangeAwareGZipMiddleware --> HostStore
    _RangeAwareGZipMiddleware --> UnifiedAuthProvider
    _RangeAwareGZipMiddleware --> RunnerRouter
    _RangeAwareGZipMiddleware --> TunnelRegistry
    _RangeAwareGZipMiddleware --> HostRegistry
    _RangeAwareGZipMiddleware --> RunnerExitReports
    _RangeAwareGZipMiddleware --> ManagedLaunchTracker
    _RangeAwareGZipMiddleware --> ErrorDetail
    _RangeAwareGZipMiddleware --> SqlAlchemyAccountStore
    _SPAStaticFiles --> AgentCache
    _SPAStaticFiles --> AuthProvider
    _SPAStaticFiles --> ManagedSandboxConfig
    _SPAStaticFiles --> ServerMcpPool
    _SPAStaticFiles --> ServerMetricsOtelPublisher
    _SPAStaticFiles --> ServerPerformanceMetrics
    _SPAStaticFiles --> SessionLiveness
    _SPAStaticFiles --> WebSocketOriginMiddleware
    _SPAStaticFiles --> HostStore
    _SPAStaticFiles --> UnifiedAuthProvider
    _SPAStaticFiles --> RunnerRouter
    _SPAStaticFiles --> TunnelRegistry
    _SPAStaticFiles --> HostRegistry
    _SPAStaticFiles --> RunnerExitReports
    _SPAStaticFiles --> ManagedLaunchTracker
    _SPAStaticFiles --> ErrorDetail
    _SPAStaticFiles --> SqlAlchemyAccountStore
    _WebSocketMetricsMiddleware --> AgentCache
    _WebSocketMetricsMiddleware --> AuthProvider
    _WebSocketMetricsMiddleware --> ManagedSandboxConfig
    _WebSocketMetricsMiddleware --> ServerMcpPool
    _WebSocketMetricsMiddleware --> ServerMetricsOtelPublisher
    _WebSocketMetricsMiddleware --> ServerPerformanceMetrics
    _WebSocketMetricsMiddleware --> SessionLiveness
    _WebSocketMetricsMiddleware --> WebSocketOriginMiddleware
    _WebSocketMetricsMiddleware --> HostStore
    _WebSocketMetricsMiddleware --> UnifiedAuthProvider
    _WebSocketMetricsMiddleware --> RunnerRouter
    _WebSocketMetricsMiddleware --> TunnelRegistry
    _WebSocketMetricsMiddleware --> HostRegistry
    _WebSocketMetricsMiddleware --> RunnerExitReports
    _WebSocketMetricsMiddleware --> ManagedLaunchTracker
    _WebSocketMetricsMiddleware --> ErrorDetail
    _WebSocketMetricsMiddleware --> SqlAlchemyAccountStore
    UnifiedAuthProvider <|-- AuthProvider
    AuthProvider --> _FastAPICallNext
    AuthProvider --> _WebSocketMetricsMiddleware
    AuthProvider --> _SPAStaticFiles
    AuthProvider --> _RangeAwareGZipMiddleware
    AuthProvider --> OIDCConfig
    AuthProvider --> AccountsConfig
    AuthProvider --> UpdateCommentRequest
    AuthProvider --> SendCommentsRequest
    AuthProvider --> CreateDocumentRequest
    AuthProvider --> UpdateDocumentRequest
    AuthProvider --> CreateDirectoryRequest
    AuthProvider --> LaunchRunnerRequest
    AuthProvider --> UpdateImageEditRequest
    AuthProvider --> _MirroredToolCall
    AuthProvider --> _PendingPolicyAskWrites
    AuthProvider --> _RelayHandle
    AuthProvider --> SessionLiveness
    AuthProvider --> _RunnerForwardResult
    AuthProvider --> _HostLaunchAttempt
    AuthProvider --> _NativeTerminalEnsureOutcome
    AuthProvider --> _SessionEventDispatchResult
    AuthProvider --> _McpLocation
    AuthProvider --> _FakeReq
    AuthProvider --> _FixedAuthProvider
    _CliTicket --> SqlAlchemyAccountStore
    _CliTicket --> AdminList
    _CliTicket --> UnifiedAuthProvider
    _CliTicket --> OidcAdmissionPolicy
    _CliTicket --> OIDCConfig
    AuthProvider <|-- UnifiedAuthProvider
    UnifiedAuthProvider --> _FirstRunPlan
    UnifiedAuthProvider --> _OmnigentCLI
    UnifiedAuthProvider --> _HostDaemonRecord
    UnifiedAuthProvider --> _HostHttpResult
    UnifiedAuthProvider --> _HostSessionsTableWidths
    UnifiedAuthProvider --> _DaemonSessionsResult
    UnifiedAuthProvider --> _SessionsPageResult
    UnifiedAuthProvider --> _SessionPagesResult
    UnifiedAuthProvider --> _SpawnedDaemonProcess
    UnifiedAuthProvider --> _DaemonReuseDecision
    UnifiedAuthProvider --> _CliRunnerProcess
    UnifiedAuthProvider --> _LLMDeploy
    UnifiedAuthProvider --> _BuiltinEntry
    UnifiedAuthProvider --> _ToolsDeploy
    UnifiedAuthProvider --> _ExecutorDeploy
    UnifiedAuthProvider --> _DeployConfig
    UnifiedAuthProvider --> _ResumeChoice
    UnifiedAuthProvider --> _HostGroup
    UnifiedAuthProvider --> _ConfigGroup
    UnifiedAuthProvider --> _HarnessMenuRow
    UnifiedAuthProvider --> _FastAPICallNext
    UnifiedAuthProvider --> _WebSocketMetricsMiddleware
    UnifiedAuthProvider --> _SPAStaticFiles
    UnifiedAuthProvider --> _RangeAwareGZipMiddleware
    UnifiedAuthProvider --> OIDCConfig
    UnifiedAuthProvider --> AccountsConfig
    UnifiedAuthProvider --> LoginRequest
    UnifiedAuthProvider --> RegisterRequest
    UnifiedAuthProvider --> SetupRequest
    UnifiedAuthProvider --> InviteRequest
    UnifiedAuthProvider --> ChangePasswordRequest
    UnifiedAuthProvider --> _CliTicket
    UnifiedAuthProvider --> _ResolvedConfig
    UnifiedAuthProvider --> _BuiltApp
    UnifiedAuthProvider --> _FakeReq
    UnifiedAuthProvider --> _IdpKeys
    UnifiedAuthProvider --> _FakeResponse
    UnifiedAuthProvider --> _FakeAsyncClient
    UnifiedAuthProvider --> _StubPermissionStore
    UnifiedAuthProvider --> _StubConversationStore
    UnifiedAuthProvider --> _CaptureRunnerClient
    UnifiedAuthProvider --> _InputRequiredRunnerClient
    UnifiedAuthProvider --> _CaptureRunnerClient
    UnifiedAuthProvider --> _NoIdentityAuthProvider
    Policy --> EvaluationContext
    Policy --> PolicyResult
    Policy --> PolicySpec
    Policy --> FunctionPolicy
    Policy --> PolicyEngine
    Policy --> _StubConversationStore
    Policy --> _StubPolicy
    Policy --> _CapturingPolicySpec
    Policy --> _CapturingPolicy
    RuntimeCaps --> _FirstRunPlan
    RuntimeCaps --> _OmnigentCLI
    RuntimeCaps --> _HostDaemonRecord
    RuntimeCaps --> _HostHttpResult
    RuntimeCaps --> _HostSessionsTableWidths
    RuntimeCaps --> _DaemonSessionsResult
    RuntimeCaps --> _SessionsPageResult
    RuntimeCaps --> _SessionPagesResult
    RuntimeCaps --> _SpawnedDaemonProcess
    RuntimeCaps --> _DaemonReuseDecision
    RuntimeCaps --> _CliRunnerProcess
    RuntimeCaps --> _LLMDeploy
    RuntimeCaps --> _BuiltinEntry
    RuntimeCaps --> _ToolsDeploy
    RuntimeCaps --> _ExecutorDeploy
    RuntimeCaps --> _DeployConfig
    RuntimeCaps --> _ResumeChoice
    RuntimeCaps --> _HostGroup
    RuntimeCaps --> _ConfigGroup
    RuntimeCaps --> _HarnessMenuRow
    RuntimeCaps --> RoutingClient
    RuntimeCaps --> PolicySpec
    RuntimeCaps --> _ResolvedConfig
    RuntimeCaps --> _BuiltApp
    RuntimeCaps --> _FakeResponsesNamespace
    RuntimeCaps --> _FakeClient
    RuntimeCaps --> _FakeReq
    RuntimeCaps --> _InputRequiredRunnerClient
    _AttachOutcome --> ProviderEntry
    _AttachOutcome --> RunnerStartupProgress
    _AttachOutcome --> StartupProfiler
    _BuiltinEntry --> StartupProfiler
    _BuiltinEntry --> RunnerStartupProgress
    _BuiltinEntry --> DetectedProvider
    _BuiltinEntry --> ProviderEntry
    _BuiltinEntry --> UnifiedAuthProvider
    _BuiltinEntry --> DatabricksVolumesArtifactStore
    _BuiltinEntry --> LocalArtifactStore
    _BuiltinEntry --> SqlAlchemyAgentStore
    _BuiltinEntry --> SqlAlchemyCommentStore
    _BuiltinEntry --> SqlAlchemyConversationStore
    _BuiltinEntry --> SqlAlchemyFileStore
    _BuiltinEntry --> SqlAlchemyPolicyStore
    _BuiltinEntry --> SqlAlchemyPermissionStore
    _BuiltinEntry --> SqlAlchemyDocumentStore
    _BuiltinEntry --> SqlAlchemyImageStore
    _BuiltinEntry --> SqlAlchemyVideoStore
    _BuiltinEntry --> AgentCache
    _BuiltinEntry --> RuntimeCaps
    _BuiltinEntry --> LLMRoutingClient
    _BuiltinEntry --> HostStore
    _BuiltinEntry --> SqlAlchemyAccountStore
    _BuiltinEntry --> AddOption
    _CliRunnerProcess --> StartupProfiler
    _CliRunnerProcess --> RunnerStartupProgress
    _CliRunnerProcess --> DetectedProvider
    _CliRunnerProcess --> ProviderEntry
    _CliRunnerProcess --> UnifiedAuthProvider
    _CliRunnerProcess --> DatabricksVolumesArtifactStore
    _CliRunnerProcess --> LocalArtifactStore
    _CliRunnerProcess --> SqlAlchemyAgentStore
    _CliRunnerProcess --> SqlAlchemyCommentStore
    _CliRunnerProcess --> SqlAlchemyConversationStore
    _CliRunnerProcess --> SqlAlchemyFileStore
    _CliRunnerProcess --> SqlAlchemyPolicyStore
    _CliRunnerProcess --> SqlAlchemyPermissionStore
    _CliRunnerProcess --> SqlAlchemyDocumentStore
    _CliRunnerProcess --> SqlAlchemyImageStore
    _CliRunnerProcess --> SqlAlchemyVideoStore
    _CliRunnerProcess --> AgentCache
    _CliRunnerProcess --> RuntimeCaps
    _CliRunnerProcess --> LLMRoutingClient
    _CliRunnerProcess --> HostStore
    _CliRunnerProcess --> SqlAlchemyAccountStore
    _CliRunnerProcess --> AddOption
    _ConfigGroup --> StartupProfiler
    _ConfigGroup --> RunnerStartupProgress
    _ConfigGroup --> DetectedProvider
    _ConfigGroup --> ProviderEntry
    _ConfigGroup --> UnifiedAuthProvider
    _ConfigGroup --> DatabricksVolumesArtifactStore
    _ConfigGroup --> LocalArtifactStore
    _ConfigGroup --> SqlAlchemyAgentStore
    _ConfigGroup --> SqlAlchemyCommentStore
    _ConfigGroup --> SqlAlchemyConversationStore
    _ConfigGroup --> SqlAlchemyFileStore
    _ConfigGroup --> SqlAlchemyPolicyStore
    _ConfigGroup --> SqlAlchemyPermissionStore
    _ConfigGroup --> SqlAlchemyDocumentStore
    _ConfigGroup --> SqlAlchemyImageStore
    _ConfigGroup --> SqlAlchemyVideoStore
    _ConfigGroup --> AgentCache
    _ConfigGroup --> RuntimeCaps
    _ConfigGroup --> LLMRoutingClient
    _ConfigGroup --> HostStore
    _ConfigGroup --> SqlAlchemyAccountStore
    _ConfigGroup --> AddOption
    _DaemonReuseDecision --> StartupProfiler
    _DaemonReuseDecision --> RunnerStartupProgress
    _DaemonReuseDecision --> DetectedProvider
    _DaemonReuseDecision --> ProviderEntry
    _DaemonReuseDecision --> UnifiedAuthProvider
    _DaemonReuseDecision --> DatabricksVolumesArtifactStore
    _DaemonReuseDecision --> LocalArtifactStore
    _DaemonReuseDecision --> SqlAlchemyAgentStore
    _DaemonReuseDecision --> SqlAlchemyCommentStore
    _DaemonReuseDecision --> SqlAlchemyConversationStore
    _DaemonReuseDecision --> SqlAlchemyFileStore
    _DaemonReuseDecision --> SqlAlchemyPolicyStore
    _DaemonReuseDecision --> SqlAlchemyPermissionStore
    _DaemonReuseDecision --> SqlAlchemyDocumentStore
    _DaemonReuseDecision --> SqlAlchemyImageStore
    _DaemonReuseDecision --> SqlAlchemyVideoStore
    _DaemonReuseDecision --> AgentCache
    _DaemonReuseDecision --> RuntimeCaps
    _DaemonReuseDecision --> LLMRoutingClient
    _DaemonReuseDecision --> HostStore
    _DaemonReuseDecision --> SqlAlchemyAccountStore
    _DaemonReuseDecision --> AddOption
    _DaemonSessionsResult --> StartupProfiler
    _DaemonSessionsResult --> RunnerStartupProgress
    _DaemonSessionsResult --> DetectedProvider
    _DaemonSessionsResult --> ProviderEntry
    _DaemonSessionsResult --> UnifiedAuthProvider
    _DaemonSessionsResult --> DatabricksVolumesArtifactStore
    _DaemonSessionsResult --> LocalArtifactStore
    _DaemonSessionsResult --> SqlAlchemyAgentStore
    _DaemonSessionsResult --> SqlAlchemyCommentStore
    _DaemonSessionsResult --> SqlAlchemyConversationStore
    _DaemonSessionsResult --> SqlAlchemyFileStore
    _DaemonSessionsResult --> SqlAlchemyPolicyStore
    _DaemonSessionsResult --> SqlAlchemyPermissionStore
    _DaemonSessionsResult --> SqlAlchemyDocumentStore
    _DaemonSessionsResult --> SqlAlchemyImageStore
    _DaemonSessionsResult --> SqlAlchemyVideoStore
    _DaemonSessionsResult --> AgentCache
    _DaemonSessionsResult --> RuntimeCaps
    _DaemonSessionsResult --> LLMRoutingClient
    _DaemonSessionsResult --> HostStore
    _DaemonSessionsResult --> SqlAlchemyAccountStore
    _DaemonSessionsResult --> AddOption
    _DeployConfig --> StartupProfiler
    _DeployConfig --> RunnerStartupProgress
    _DeployConfig --> DetectedProvider
    _DeployConfig --> ProviderEntry
    _DeployConfig --> UnifiedAuthProvider
    _DeployConfig --> DatabricksVolumesArtifactStore
    _DeployConfig --> LocalArtifactStore
    _DeployConfig --> SqlAlchemyAgentStore
    _DeployConfig --> SqlAlchemyCommentStore
    _DeployConfig --> SqlAlchemyConversationStore
    _DeployConfig --> SqlAlchemyFileStore
    _DeployConfig --> SqlAlchemyPolicyStore
    _DeployConfig --> SqlAlchemyPermissionStore
    _DeployConfig --> SqlAlchemyDocumentStore
    _DeployConfig --> SqlAlchemyImageStore
    _DeployConfig --> SqlAlchemyVideoStore
    _DeployConfig --> AgentCache
    _DeployConfig --> RuntimeCaps
    _DeployConfig --> LLMRoutingClient
    _DeployConfig --> HostStore
    _DeployConfig --> SqlAlchemyAccountStore
    _DeployConfig --> AddOption
    _ExecutorDeploy --> StartupProfiler
    _ExecutorDeploy --> RunnerStartupProgress
    _ExecutorDeploy --> DetectedProvider
    _ExecutorDeploy --> ProviderEntry
    _ExecutorDeploy --> UnifiedAuthProvider
    _ExecutorDeploy --> DatabricksVolumesArtifactStore
    _ExecutorDeploy --> LocalArtifactStore
    _ExecutorDeploy --> SqlAlchemyAgentStore
    _ExecutorDeploy --> SqlAlchemyCommentStore
    _ExecutorDeploy --> SqlAlchemyConversationStore
    _ExecutorDeploy --> SqlAlchemyFileStore
    _ExecutorDeploy --> SqlAlchemyPolicyStore
    _ExecutorDeploy --> SqlAlchemyPermissionStore
    _ExecutorDeploy --> SqlAlchemyDocumentStore
    _ExecutorDeploy --> SqlAlchemyImageStore
    _ExecutorDeploy --> SqlAlchemyVideoStore
    _ExecutorDeploy --> AgentCache
    _ExecutorDeploy --> RuntimeCaps
    _ExecutorDeploy --> LLMRoutingClient
    _ExecutorDeploy --> HostStore
    _ExecutorDeploy --> SqlAlchemyAccountStore
    _ExecutorDeploy --> AddOption
    _FirstRunPlan --> StartupProfiler
    _FirstRunPlan --> RunnerStartupProgress
    _FirstRunPlan --> DetectedProvider
    _FirstRunPlan --> ProviderEntry
    _FirstRunPlan --> UnifiedAuthProvider
    _FirstRunPlan --> DatabricksVolumesArtifactStore
    _FirstRunPlan --> LocalArtifactStore
    _FirstRunPlan --> SqlAlchemyAgentStore
    _FirstRunPlan --> SqlAlchemyCommentStore
    _FirstRunPlan --> SqlAlchemyConversationStore
    _FirstRunPlan --> SqlAlchemyFileStore
    _FirstRunPlan --> SqlAlchemyPolicyStore
    _FirstRunPlan --> SqlAlchemyPermissionStore
    _FirstRunPlan --> SqlAlchemyDocumentStore
    _FirstRunPlan --> SqlAlchemyImageStore
    _FirstRunPlan --> SqlAlchemyVideoStore
    _FirstRunPlan --> AgentCache
    _FirstRunPlan --> RuntimeCaps
    _FirstRunPlan --> LLMRoutingClient
    _FirstRunPlan --> HostStore
    _FirstRunPlan --> SqlAlchemyAccountStore
    _FirstRunPlan --> AddOption
    _HarnessMenuRow --> StartupProfiler
    _HarnessMenuRow --> RunnerStartupProgress
    _HarnessMenuRow --> DetectedProvider
    _HarnessMenuRow --> ProviderEntry
    _HarnessMenuRow --> UnifiedAuthProvider
    _HarnessMenuRow --> DatabricksVolumesArtifactStore
    _HarnessMenuRow --> LocalArtifactStore
    _HarnessMenuRow --> SqlAlchemyAgentStore
    _HarnessMenuRow --> SqlAlchemyCommentStore
    _HarnessMenuRow --> SqlAlchemyConversationStore
    _HarnessMenuRow --> SqlAlchemyFileStore
    _HarnessMenuRow --> SqlAlchemyPolicyStore
    _HarnessMenuRow --> SqlAlchemyPermissionStore
    _HarnessMenuRow --> SqlAlchemyDocumentStore
    _HarnessMenuRow --> SqlAlchemyImageStore
    _HarnessMenuRow --> SqlAlchemyVideoStore
    _HarnessMenuRow --> AgentCache
    _HarnessMenuRow --> RuntimeCaps
    _HarnessMenuRow --> LLMRoutingClient
    _HarnessMenuRow --> HostStore
    _HarnessMenuRow --> SqlAlchemyAccountStore
    _HarnessMenuRow --> AddOption
    _HostDaemonRecord --> StartupProfiler
    _HostDaemonRecord --> RunnerStartupProgress
    _HostDaemonRecord --> DetectedProvider
    _HostDaemonRecord --> ProviderEntry
    _HostDaemonRecord --> UnifiedAuthProvider
    _HostDaemonRecord --> DatabricksVolumesArtifactStore
    _HostDaemonRecord --> LocalArtifactStore
    _HostDaemonRecord --> SqlAlchemyAgentStore
    _HostDaemonRecord --> SqlAlchemyCommentStore
    _HostDaemonRecord --> SqlAlchemyConversationStore
    _HostDaemonRecord --> SqlAlchemyFileStore
    _HostDaemonRecord --> SqlAlchemyPolicyStore
    _HostDaemonRecord --> SqlAlchemyPermissionStore
    _HostDaemonRecord --> SqlAlchemyDocumentStore
    _HostDaemonRecord --> SqlAlchemyImageStore
    _HostDaemonRecord --> SqlAlchemyVideoStore
    _HostDaemonRecord --> AgentCache
    _HostDaemonRecord --> RuntimeCaps
    _HostDaemonRecord --> LLMRoutingClient
    _HostDaemonRecord --> HostStore
    _HostDaemonRecord --> SqlAlchemyAccountStore
    _HostDaemonRecord --> AddOption
    _HostGroup --> StartupProfiler
    _HostGroup --> RunnerStartupProgress
    _HostGroup --> DetectedProvider
    _HostGroup --> ProviderEntry
    _HostGroup --> UnifiedAuthProvider
    _HostGroup --> DatabricksVolumesArtifactStore
    _HostGroup --> LocalArtifactStore
    _HostGroup --> SqlAlchemyAgentStore
    _HostGroup --> SqlAlchemyCommentStore
    _HostGroup --> SqlAlchemyConversationStore
    _HostGroup --> SqlAlchemyFileStore
    _HostGroup --> SqlAlchemyPolicyStore
    _HostGroup --> SqlAlchemyPermissionStore
    _HostGroup --> SqlAlchemyDocumentStore
    _HostGroup --> SqlAlchemyImageStore
    _HostGroup --> SqlAlchemyVideoStore
    _HostGroup --> AgentCache
    _HostGroup --> RuntimeCaps
    _HostGroup --> LLMRoutingClient
    _HostGroup --> HostStore
    _HostGroup --> SqlAlchemyAccountStore
    _HostGroup --> AddOption
    _HostHttpResult --> StartupProfiler
    _HostHttpResult --> RunnerStartupProgress
    _HostHttpResult --> DetectedProvider
    _HostHttpResult --> ProviderEntry
    _HostHttpResult --> UnifiedAuthProvider
    _HostHttpResult --> DatabricksVolumesArtifactStore
    _HostHttpResult --> LocalArtifactStore
    _HostHttpResult --> SqlAlchemyAgentStore
    _HostHttpResult --> SqlAlchemyCommentStore
    _HostHttpResult --> SqlAlchemyConversationStore
    _HostHttpResult --> SqlAlchemyFileStore
    _HostHttpResult --> SqlAlchemyPolicyStore
    _HostHttpResult --> SqlAlchemyPermissionStore
    _HostHttpResult --> SqlAlchemyDocumentStore
    _HostHttpResult --> SqlAlchemyImageStore
    _HostHttpResult --> SqlAlchemyVideoStore
    _HostHttpResult --> AgentCache
    _HostHttpResult --> RuntimeCaps
    _HostHttpResult --> LLMRoutingClient
    _HostHttpResult --> HostStore
    _HostHttpResult --> SqlAlchemyAccountStore
    _HostHttpResult --> AddOption
    _HostSessionsTableWidths --> StartupProfiler
    _HostSessionsTableWidths --> RunnerStartupProgress
    _HostSessionsTableWidths --> DetectedProvider
    _HostSessionsTableWidths --> ProviderEntry
    _HostSessionsTableWidths --> UnifiedAuthProvider
    _HostSessionsTableWidths --> DatabricksVolumesArtifactStore
    _HostSessionsTableWidths --> LocalArtifactStore
    _HostSessionsTableWidths --> SqlAlchemyAgentStore
    _HostSessionsTableWidths --> SqlAlchemyCommentStore
    _HostSessionsTableWidths --> SqlAlchemyConversationStore
    _HostSessionsTableWidths --> SqlAlchemyFileStore
    _HostSessionsTableWidths --> SqlAlchemyPolicyStore
    _HostSessionsTableWidths --> SqlAlchemyPermissionStore
    _HostSessionsTableWidths --> SqlAlchemyDocumentStore
    _HostSessionsTableWidths --> SqlAlchemyImageStore
    _HostSessionsTableWidths --> SqlAlchemyVideoStore
    _HostSessionsTableWidths --> AgentCache
    _HostSessionsTableWidths --> RuntimeCaps
    _HostSessionsTableWidths --> LLMRoutingClient
    _HostSessionsTableWidths --> HostStore
    _HostSessionsTableWidths --> SqlAlchemyAccountStore
    _HostSessionsTableWidths --> AddOption
    _LLMDeploy --> StartupProfiler
    _LLMDeploy --> RunnerStartupProgress
    _LLMDeploy --> DetectedProvider
    _LLMDeploy --> ProviderEntry
    _LLMDeploy --> UnifiedAuthProvider
    _LLMDeploy --> DatabricksVolumesArtifactStore
    _LLMDeploy --> LocalArtifactStore
    _LLMDeploy --> SqlAlchemyAgentStore
    _LLMDeploy --> SqlAlchemyCommentStore
    _LLMDeploy --> SqlAlchemyConversationStore
    _LLMDeploy --> SqlAlchemyFileStore
    _LLMDeploy --> SqlAlchemyPolicyStore
    _LLMDeploy --> SqlAlchemyPermissionStore
    _LLMDeploy --> SqlAlchemyDocumentStore
    _LLMDeploy --> SqlAlchemyImageStore
    _LLMDeploy --> SqlAlchemyVideoStore
    _LLMDeploy --> AgentCache
    _LLMDeploy --> RuntimeCaps
    _LLMDeploy --> LLMRoutingClient
    _LLMDeploy --> HostStore
    _LLMDeploy --> SqlAlchemyAccountStore
    _LLMDeploy --> AddOption
    _OmnigentCLI --> StartupProfiler
    _OmnigentCLI --> RunnerStartupProgress
    _OmnigentCLI --> DetectedProvider
    _OmnigentCLI --> ProviderEntry
    _OmnigentCLI --> UnifiedAuthProvider
    _OmnigentCLI --> DatabricksVolumesArtifactStore
    _OmnigentCLI --> LocalArtifactStore
    _OmnigentCLI --> SqlAlchemyAgentStore
    _OmnigentCLI --> SqlAlchemyCommentStore
    _OmnigentCLI --> SqlAlchemyConversationStore
    _OmnigentCLI --> SqlAlchemyFileStore
    _OmnigentCLI --> SqlAlchemyPolicyStore
    _OmnigentCLI --> SqlAlchemyPermissionStore
    _OmnigentCLI --> SqlAlchemyDocumentStore
    _OmnigentCLI --> SqlAlchemyImageStore
    _OmnigentCLI --> SqlAlchemyVideoStore
    _OmnigentCLI --> AgentCache
    _OmnigentCLI --> RuntimeCaps
    _OmnigentCLI --> LLMRoutingClient
    _OmnigentCLI --> HostStore
    _OmnigentCLI --> SqlAlchemyAccountStore
    _OmnigentCLI --> AddOption
    _ResumeChoice --> StartupProfiler
    _ResumeChoice --> RunnerStartupProgress
    _ResumeChoice --> DetectedProvider
    _ResumeChoice --> ProviderEntry
    _ResumeChoice --> UnifiedAuthProvider
    _ResumeChoice --> DatabricksVolumesArtifactStore
    _ResumeChoice --> LocalArtifactStore
    _ResumeChoice --> SqlAlchemyAgentStore
    _ResumeChoice --> SqlAlchemyCommentStore
    _ResumeChoice --> SqlAlchemyConversationStore
    _ResumeChoice --> SqlAlchemyFileStore
    _ResumeChoice --> SqlAlchemyPolicyStore
    _ResumeChoice --> SqlAlchemyPermissionStore
    _ResumeChoice --> SqlAlchemyDocumentStore
    _ResumeChoice --> SqlAlchemyImageStore
    _ResumeChoice --> SqlAlchemyVideoStore
    _ResumeChoice --> AgentCache
    _ResumeChoice --> RuntimeCaps
    _ResumeChoice --> LLMRoutingClient
    _ResumeChoice --> HostStore
    _ResumeChoice --> SqlAlchemyAccountStore
    _ResumeChoice --> AddOption
    _SessionPagesResult --> StartupProfiler
    _SessionPagesResult --> RunnerStartupProgress
    _SessionPagesResult --> DetectedProvider
    _SessionPagesResult --> ProviderEntry
    _SessionPagesResult --> UnifiedAuthProvider
    _SessionPagesResult --> DatabricksVolumesArtifactStore
    _SessionPagesResult --> LocalArtifactStore
    _SessionPagesResult --> SqlAlchemyAgentStore
    _SessionPagesResult --> SqlAlchemyCommentStore
    _SessionPagesResult --> SqlAlchemyConversationStore
    _SessionPagesResult --> SqlAlchemyFileStore
    _SessionPagesResult --> SqlAlchemyPolicyStore
    _SessionPagesResult --> SqlAlchemyPermissionStore
    _SessionPagesResult --> SqlAlchemyDocumentStore
    _SessionPagesResult --> SqlAlchemyImageStore
    _SessionPagesResult --> SqlAlchemyVideoStore
    _SessionPagesResult --> AgentCache
    _SessionPagesResult --> RuntimeCaps
    _SessionPagesResult --> LLMRoutingClient
    _SessionPagesResult --> HostStore
    _SessionPagesResult --> SqlAlchemyAccountStore
    _SessionPagesResult --> AddOption
    _SessionsPageResult --> StartupProfiler
    _SessionsPageResult --> RunnerStartupProgress
    _SessionsPageResult --> DetectedProvider
    _SessionsPageResult --> ProviderEntry
    _SessionsPageResult --> UnifiedAuthProvider
    _SessionsPageResult --> DatabricksVolumesArtifactStore
    _SessionsPageResult --> LocalArtifactStore
    _SessionsPageResult --> SqlAlchemyAgentStore
    _SessionsPageResult --> SqlAlchemyCommentStore
    _SessionsPageResult --> SqlAlchemyConversationStore
    _SessionsPageResult --> SqlAlchemyFileStore
    _SessionsPageResult --> SqlAlchemyPolicyStore
    _SessionsPageResult --> SqlAlchemyPermissionStore
    _SessionsPageResult --> SqlAlchemyDocumentStore
    _SessionsPageResult --> SqlAlchemyImageStore
    _SessionsPageResult --> SqlAlchemyVideoStore
    _SessionsPageResult --> AgentCache
    _SessionsPageResult --> RuntimeCaps
    _SessionsPageResult --> LLMRoutingClient
    _SessionsPageResult --> HostStore
    _SessionsPageResult --> SqlAlchemyAccountStore
    _SessionsPageResult --> AddOption
    _SpawnedDaemonProcess --> StartupProfiler
    _SpawnedDaemonProcess --> RunnerStartupProgress
    _SpawnedDaemonProcess --> DetectedProvider
    _SpawnedDaemonProcess --> ProviderEntry
    _SpawnedDaemonProcess --> UnifiedAuthProvider
    _SpawnedDaemonProcess --> DatabricksVolumesArtifactStore
    _SpawnedDaemonProcess --> LocalArtifactStore
    _SpawnedDaemonProcess --> SqlAlchemyAgentStore
    _SpawnedDaemonProcess --> SqlAlchemyCommentStore
    _SpawnedDaemonProcess --> SqlAlchemyConversationStore
    _SpawnedDaemonProcess --> SqlAlchemyFileStore
    _SpawnedDaemonProcess --> SqlAlchemyPolicyStore
    _SpawnedDaemonProcess --> SqlAlchemyPermissionStore
    _SpawnedDaemonProcess --> SqlAlchemyDocumentStore
    _SpawnedDaemonProcess --> SqlAlchemyImageStore
    _SpawnedDaemonProcess --> SqlAlchemyVideoStore
    _SpawnedDaemonProcess --> AgentCache
    _SpawnedDaemonProcess --> RuntimeCaps
    _SpawnedDaemonProcess --> LLMRoutingClient
    _SpawnedDaemonProcess --> HostStore
    _SpawnedDaemonProcess --> SqlAlchemyAccountStore
    _SpawnedDaemonProcess --> AddOption
    _ToolsDeploy --> StartupProfiler
    _ToolsDeploy --> RunnerStartupProgress
    _ToolsDeploy --> DetectedProvider
    _ToolsDeploy --> ProviderEntry
    _ToolsDeploy --> UnifiedAuthProvider
    _ToolsDeploy --> DatabricksVolumesArtifactStore
    _ToolsDeploy --> LocalArtifactStore
    _ToolsDeploy --> SqlAlchemyAgentStore
    _ToolsDeploy --> SqlAlchemyCommentStore
    _ToolsDeploy --> SqlAlchemyConversationStore
    _ToolsDeploy --> SqlAlchemyFileStore
    _ToolsDeploy --> SqlAlchemyPolicyStore
    _ToolsDeploy --> SqlAlchemyPermissionStore
    _ToolsDeploy --> SqlAlchemyDocumentStore
    _ToolsDeploy --> SqlAlchemyImageStore
    _ToolsDeploy --> SqlAlchemyVideoStore
    _ToolsDeploy --> AgentCache
    _ToolsDeploy --> RuntimeCaps
    _ToolsDeploy --> LLMRoutingClient
    _ToolsDeploy --> HostStore
    _ToolsDeploy --> SqlAlchemyAccountStore
    _ToolsDeploy --> AddOption
    SendCommentsRequest --> AuthProvider
    UpdateCommentRequest --> AuthProvider
    AddOption --> _FirstRunPlan
    AddOption --> _OmnigentCLI
    AddOption --> _HostDaemonRecord
    AddOption --> _HostHttpResult
    AddOption --> _HostSessionsTableWidths
    AddOption --> _DaemonSessionsResult
    AddOption --> _SessionsPageResult
    AddOption --> _SessionPagesResult
    AddOption --> _SpawnedDaemonProcess
    AddOption --> _DaemonReuseDecision
    AddOption --> _CliRunnerProcess
    AddOption --> _LLMDeploy
    AddOption --> _BuiltinEntry
    AddOption --> _ToolsDeploy
    AddOption --> _ExecutorDeploy
    AddOption --> _DeployConfig
    AddOption --> _ResumeChoice
    AddOption --> _HostGroup
    AddOption --> _ConfigGroup
    AddOption --> _HarnessMenuRow
    AddOption --> DetectedProvider
    AddOption --> ProviderEntry
    _VendorEndpoint --> DetectedProvider
    _VendorEndpoint --> ProviderEntry
    ControllableMockClient --> AgentCache
    ControllableMockClient --> SqlAlchemyAgentStore
    ControllableMockClient --> LocalArtifactStore
    ControllableMockClient --> SqlAlchemyCommentStore
    ControllableMockClient --> SqlAlchemyConversationStore
    ControllableMockClient --> SqlAlchemyFileStore
    ControllableMockClient --> _CaptureRunnerClient
    ControllableMockClient --> _InputRequiredRunnerClient
    HostConnectError --> HostCreateDirFrame
    HostConnectError --> HostCreateDirResultFrame
    HostConnectError --> HostCreateWorktreeFrame
    HostConnectError --> HostCreateWorktreeResultFrame
    HostConnectError --> HostHelloFrame
    HostConnectError --> HostLaunchRunnerFrame
    HostConnectError --> HostLaunchRunnerResultFrame
    HostConnectError --> HostListDirEntry
    HostConnectError --> HostListDirFrame
    HostConnectError --> HostListDirResultFrame
    HostConnectError --> HostRemoveWorktreeFrame
    HostConnectError --> HostRemoveWorktreeResultFrame
    HostConnectError --> HostRunnerExitedFrame
    HostConnectError --> HostStatFrame
    HostConnectError --> HostStatResultFrame
    HostConnectError --> HostStopRunnerFrame
    HostConnectError --> HostStopRunnerResultFrame
    HostConnectError --> WorktreeError
    HostConnectError --> HostIdentity
    HostConnectError --> PongFrame
    HostConnectError --> _FakeTunnel
    HostConnectError --> _HandshakeFailingConnect
    HostConnectError --> _DroppedTunnel
    HostConnectError --> _AcceptingConnect
    HostConnectError --> _ConnectSpy
    HostProcess --> HostCreateDirFrame
    HostProcess --> HostCreateDirResultFrame
    HostProcess --> HostCreateWorktreeFrame
    HostProcess --> HostCreateWorktreeResultFrame
    HostProcess --> HostHelloFrame
    HostProcess --> HostLaunchRunnerFrame
    HostProcess --> HostLaunchRunnerResultFrame
    HostProcess --> HostListDirEntry
    HostProcess --> HostListDirFrame
    HostProcess --> HostListDirResultFrame
    HostProcess --> HostRemoveWorktreeFrame
    HostProcess --> HostRemoveWorktreeResultFrame
    HostProcess --> HostRunnerExitedFrame
    HostProcess --> HostStatFrame
    HostProcess --> HostStatResultFrame
    HostProcess --> HostStopRunnerFrame
    HostProcess --> HostStopRunnerResultFrame
    HostProcess --> WorktreeError
    HostProcess --> HostIdentity
    HostProcess --> PongFrame
    HostProcess --> _FakeTunnel
    HostProcess --> _HandshakeFailingConnect
    HostProcess --> _DroppedTunnel
    HostProcess --> _AcceptingConnect
    HostProcess --> _ConnectSpy
    _RunnerHandle --> HostCreateDirFrame
    _RunnerHandle --> HostCreateDirResultFrame
    _RunnerHandle --> HostCreateWorktreeFrame
    _RunnerHandle --> HostCreateWorktreeResultFrame
    _RunnerHandle --> HostHelloFrame
    _RunnerHandle --> HostLaunchRunnerFrame
    _RunnerHandle --> HostLaunchRunnerResultFrame
    _RunnerHandle --> HostListDirEntry
    _RunnerHandle --> HostListDirFrame
    _RunnerHandle --> HostListDirResultFrame
    _RunnerHandle --> HostRemoveWorktreeFrame
    _RunnerHandle --> HostRemoveWorktreeResultFrame
    _RunnerHandle --> HostRunnerExitedFrame
    _RunnerHandle --> HostStatFrame
    _RunnerHandle --> HostStatResultFrame
    _RunnerHandle --> HostStopRunnerFrame
    _RunnerHandle --> HostStopRunnerResultFrame
    _RunnerHandle --> WorktreeError
    _RunnerHandle --> HostIdentity
    _RunnerHandle --> PongFrame
    ModelPricing --> PolicyEngine
    ModelPricing --> _ForwardedEffort
    Conversation --> _WakeOutcome
    Conversation --> SubagentBlockNotifier
    Conversation --> _CapturedWake
    Conversation --> _FailThenSucceedDispatch
    Conversation --> _StubPermissionStore
    Conversation --> _StubConversationStore
    Conversation --> _StubConversationStore
    Conversation --> _StubAgentStore
    Conversation --> _FixedPolicyEngine
    Conversation --> _DispatchCall
    FunctionCallData --> _MirroredToolCall
    FunctionCallData --> _PendingPolicyAskWrites
    FunctionCallData --> _RelayHandle
    FunctionCallData --> SessionLiveness
    FunctionCallData --> _RunnerForwardResult
    FunctionCallData --> _HostLaunchAttempt
    FunctionCallData --> _NativeTerminalEnsureOutcome
    FunctionCallData --> _SessionEventDispatchResult
    FunctionCallData --> _FakeConversationStore
    FunctionCallData --> _FakeAgentStore
    FunctionCallData --> _FakeBody
    FunctionCallData --> _FakeRequest
    FunctionCallOutputData --> _MirroredToolCall
    FunctionCallOutputData --> _PendingPolicyAskWrites
    FunctionCallOutputData --> _RelayHandle
    FunctionCallOutputData --> SessionLiveness
    FunctionCallOutputData --> _RunnerForwardResult
    FunctionCallOutputData --> _HostLaunchAttempt
    FunctionCallOutputData --> _NativeTerminalEnsureOutcome
    FunctionCallOutputData --> _SessionEventDispatchResult
    ResourceEventData --> _MirroredToolCall
    ResourceEventData --> _PendingPolicyAskWrites
    ResourceEventData --> _RelayHandle
    ResourceEventData --> SessionLiveness
    ResourceEventData --> _RunnerForwardResult
    ResourceEventData --> _HostLaunchAttempt
    ResourceEventData --> _NativeTerminalEnsureOutcome
    ResourceEventData --> _SessionEventDispatchResult
    _ExpensiveModelConfig --> PolicyCallable
    _ExpensiveModelConfig --> PolicyEvent
    _ExpensiveModelConfig --> PolicyResponse
    DatabricksVolumesArtifactStore --> _FirstRunPlan
    DatabricksVolumesArtifactStore --> _OmnigentCLI
    DatabricksVolumesArtifactStore --> _HostDaemonRecord
    DatabricksVolumesArtifactStore --> _HostHttpResult
    DatabricksVolumesArtifactStore --> _HostSessionsTableWidths
    DatabricksVolumesArtifactStore --> _DaemonSessionsResult
    DatabricksVolumesArtifactStore --> _SessionsPageResult
    DatabricksVolumesArtifactStore --> _SessionPagesResult
    DatabricksVolumesArtifactStore --> _SpawnedDaemonProcess
    DatabricksVolumesArtifactStore --> _DaemonReuseDecision
    DatabricksVolumesArtifactStore --> _CliRunnerProcess
    DatabricksVolumesArtifactStore --> _LLMDeploy
    DatabricksVolumesArtifactStore --> _BuiltinEntry
    DatabricksVolumesArtifactStore --> _ToolsDeploy
    DatabricksVolumesArtifactStore --> _ExecutorDeploy
    DatabricksVolumesArtifactStore --> _DeployConfig
    DatabricksVolumesArtifactStore --> _ResumeChoice
    DatabricksVolumesArtifactStore --> _HostGroup
    DatabricksVolumesArtifactStore --> _ConfigGroup
    DatabricksVolumesArtifactStore --> _HarnessMenuRow
    SqlConversation --> Host
    SqlConversation --> HostStore
    SqlConversation --> SqlAlchemyConversationStore
    SqlConversationItem --> SqlAlchemyConversationStore
    SqlHost --> Host
    SqlHost --> HostStore
    SqlHost --> _FixedAuthProvider
    SqlUser --> SqlAlchemyAccountStore
    SqlUser --> SqlAlchemyPermissionStore
    SqlUser --> _FakeReq
    CreateDocumentRequest --> AuthProvider
    UpdateDocumentRequest --> AuthProvider
    _ParkedHarnessElicitation --> ElicitationResult
    PolicyEngine --> ModelPricing
    PolicyEngine --> Policy
    PolicyEngine --> EvaluationContext
    PolicyEngine --> PolicyResult
    PolicyEngine --> PolicyAction
    PolicyEngine --> PolicySpec
    PolicyEngine --> StateUpdate
    PolicyEngine --> StateUpdateAction
    PolicyEngine --> _MirroredToolCall
    PolicyEngine --> _PendingPolicyAskWrites
    PolicyEngine --> _RelayHandle
    PolicyEngine --> SessionLiveness
    PolicyEngine --> _RunnerForwardResult
    PolicyEngine --> _HostLaunchAttempt
    PolicyEngine --> _NativeTerminalEnsureOutcome
    PolicyEngine --> _SessionEventDispatchResult
    PolicyEngine --> _StubConversationStore
    PolicyEngine --> _StubPolicy
    PolicyEngine --> _Recorder
    PolicyEngine --> _ElicitationHarness
    PolicyEngine --> _Harness
    PolicyEngine --> _CapturingPolicySpec
    PolicyEngine --> _CapturingPolicy
    PolicyEngine --> _FakeResponsesNamespace
    PolicyEngine --> _FakeClient
    _BuiltApp --> LocalArtifactStore
    _BuiltApp --> AgentCache
    _BuiltApp --> RuntimeCaps
    _BuiltApp --> SqlAlchemyAgentStore
    _BuiltApp --> SqlAlchemyCommentStore
    _BuiltApp --> SqlAlchemyConversationStore
    _BuiltApp --> SqlAlchemyDocumentStore
    _BuiltApp --> SqlAlchemyFileStore
    _BuiltApp --> HostStore
    _BuiltApp --> SqlAlchemyImageStore
    _BuiltApp --> SqlAlchemyPermissionStore
    _BuiltApp --> UnifiedAuthProvider
    _BuiltApp --> SqlAlchemyAccountStore
    _ResolvedConfig --> LocalArtifactStore
    _ResolvedConfig --> AgentCache
    _ResolvedConfig --> RuntimeCaps
    _ResolvedConfig --> SqlAlchemyAgentStore
    _ResolvedConfig --> SqlAlchemyCommentStore
    _ResolvedConfig --> SqlAlchemyConversationStore
    _ResolvedConfig --> SqlAlchemyDocumentStore
    _ResolvedConfig --> SqlAlchemyFileStore
    _ResolvedConfig --> HostStore
    _ResolvedConfig --> SqlAlchemyImageStore
    _ResolvedConfig --> SqlAlchemyPermissionStore
    _ResolvedConfig --> UnifiedAuthProvider
    _ResolvedConfig --> SqlAlchemyAccountStore
    ElicitationDeclinedError --> _MirroredToolCall
    ElicitationDeclinedError --> _PendingPolicyAskWrites
    ElicitationDeclinedError --> _RelayHandle
    ElicitationDeclinedError --> SessionLiveness
    ElicitationDeclinedError --> _RunnerForwardResult
    ElicitationDeclinedError --> _HostLaunchAttempt
    ElicitationDeclinedError --> _NativeTerminalEnsureOutcome
    ElicitationDeclinedError --> _SessionEventDispatchResult
    ElicitationDeclinedError --> _Recorder
    ElicitationDeclinedError --> _ElicitationHarness
    HostCreateDirFrame --> HostConnectError
    HostCreateDirFrame --> _RunnerHandle
    HostCreateDirFrame --> HostProcess
    HostCreateDirFrame --> CreateDirectoryRequest
    HostCreateDirFrame --> LaunchRunnerRequest
    HostCreateDirFrame --> _FakeTunnel
    HostCreateDirFrame --> _HandshakeFailingConnect
    HostCreateDirFrame --> _DroppedTunnel
    HostCreateDirFrame --> _AcceptingConnect
    HostCreateDirFrame --> _ConnectSpy
    HostCreateDirResultFrame --> HostConnectError
    HostCreateDirResultFrame --> _RunnerHandle
    HostCreateDirResultFrame --> HostProcess
    HostCreateDirResultFrame --> _FakeTunnel
    HostCreateDirResultFrame --> _HandshakeFailingConnect
    HostCreateDirResultFrame --> _DroppedTunnel
    HostCreateDirResultFrame --> _AcceptingConnect
    HostCreateDirResultFrame --> _ConnectSpy
    HostCreateWorktreeFrame --> HostConnectError
    HostCreateWorktreeFrame --> _RunnerHandle
    HostCreateWorktreeFrame --> HostProcess
    HostCreateWorktreeFrame --> WorktreeProxyError
    HostCreateWorktreeFrame --> WorktreeHostUnavailableError
    HostCreateWorktreeFrame --> CreatedWorktree
    HostCreateWorktreeFrame --> _FakeWebSocket
    HostCreateWorktreeFrame --> _HostCapture
    HostCreateWorktreeFrame --> _FakeWebSocket
    HostCreateWorktreeFrame --> _FakeWebSocket
    HostCreateWorktreeResultFrame --> HostConnectError
    HostCreateWorktreeResultFrame --> _RunnerHandle
    HostCreateWorktreeResultFrame --> HostProcess
    HostHelloFrame --> HostConnectError
    HostHelloFrame --> _RunnerHandle
    HostHelloFrame --> HostProcess
    HostHelloFrame --> RunnerExitReport
    HostHelloFrame --> RunnerExitReports
    HostHelloFrame --> WebSocketLike
    HostHelloFrame --> HostConnection
    HostHelloFrame --> HostRegistry
    HostHelloFrame --> _FakeTunnel
    HostHelloFrame --> _HandshakeFailingConnect
    HostHelloFrame --> _DroppedTunnel
    HostHelloFrame --> _AcceptingConnect
    HostHelloFrame --> _ConnectSpy
    HostHelloFrame --> _StubWebSocket
    HostHelloFrame --> _LivenessApp
    HostHelloFrame --> _SeedStores
    HostHelloFrame --> FakeWebSocket
    HostHelloFrame --> _StubAuthProvider
    HostHelloFrame --> _FakeWebSocket
    HostHelloFrame --> _HostCapture
    HostHelloFrame --> ManagedSessionEnv
    HostHelloFrame --> _FixedAuthProvider
    HostHelloFrame --> _NoopRunnerWS
    HostHelloFrame --> _FakeWebSocket
    HostHelloFrame --> _FakeWebSocket
    HostHelloFrame --> _FakeWebSocket
    HostHelloFrame --> _FakeWebSocket
    HostLaunchRunnerFrame --> HostConnectError
    HostLaunchRunnerFrame --> _RunnerHandle
    HostLaunchRunnerFrame --> HostProcess
    HostLaunchRunnerFrame --> CreateDirectoryRequest
    HostLaunchRunnerFrame --> LaunchRunnerRequest
    HostLaunchRunnerFrame --> _MirroredToolCall
    HostLaunchRunnerFrame --> _PendingPolicyAskWrites
    HostLaunchRunnerFrame --> _RelayHandle
    HostLaunchRunnerFrame --> SessionLiveness
    HostLaunchRunnerFrame --> _RunnerForwardResult
    HostLaunchRunnerFrame --> _HostLaunchAttempt
    HostLaunchRunnerFrame --> _NativeTerminalEnsureOutcome
    HostLaunchRunnerFrame --> _SessionEventDispatchResult
    HostLaunchRunnerFrame --> _FakeTunnel
    HostLaunchRunnerFrame --> _HandshakeFailingConnect
    HostLaunchRunnerFrame --> _DroppedTunnel
    HostLaunchRunnerFrame --> _AcceptingConnect
    HostLaunchRunnerFrame --> _ConnectSpy
    HostLaunchRunnerFrame --> _StubAuthProvider
    HostLaunchRunnerFrame --> _FakeWebSocket
    HostLaunchRunnerFrame --> _HostCapture
    HostLaunchRunnerFrame --> ManagedSessionEnv
    HostLaunchRunnerFrame --> _NoopRunnerWS
    HostLaunchRunnerResultFrame --> HostConnectError
    HostLaunchRunnerResultFrame --> _RunnerHandle
    HostLaunchRunnerResultFrame --> HostProcess
    HostLaunchRunnerResultFrame --> _FakeTunnel
    HostLaunchRunnerResultFrame --> _HandshakeFailingConnect
    HostLaunchRunnerResultFrame --> _DroppedTunnel
    HostLaunchRunnerResultFrame --> _AcceptingConnect
    HostLaunchRunnerResultFrame --> _ConnectSpy
    HostLaunchRunnerResultFrame --> _StubAuthProvider
    HostLaunchRunnerResultFrame --> ManagedSessionEnv
    HostLaunchRunnerResultFrame --> _FixedAuthProvider
    HostLaunchRunnerResultFrame --> _NoopRunnerWS
    HostListDirEntry --> HostConnectError
    HostListDirEntry --> _RunnerHandle
    HostListDirEntry --> HostProcess
    HostListDirFrame --> HostConnectError
    HostListDirFrame --> _RunnerHandle
    HostListDirFrame --> HostProcess
    HostListDirFrame --> CreateDirectoryRequest
    HostListDirFrame --> LaunchRunnerRequest
    HostListDirFrame --> _FakeTunnel
    HostListDirFrame --> _HandshakeFailingConnect
    HostListDirFrame --> _DroppedTunnel
    HostListDirFrame --> _AcceptingConnect
    HostListDirFrame --> _ConnectSpy
    HostListDirResultFrame --> HostConnectError
    HostListDirResultFrame --> _RunnerHandle
    HostListDirResultFrame --> HostProcess
    HostListDirResultFrame --> _FakeTunnel
    HostListDirResultFrame --> _HandshakeFailingConnect
    HostListDirResultFrame --> _DroppedTunnel
    HostListDirResultFrame --> _AcceptingConnect
    HostListDirResultFrame --> _ConnectSpy
    HostRemoveWorktreeFrame --> HostConnectError
    HostRemoveWorktreeFrame --> _RunnerHandle
    HostRemoveWorktreeFrame --> HostProcess
    HostRemoveWorktreeFrame --> WorktreeProxyError
    HostRemoveWorktreeFrame --> WorktreeHostUnavailableError
    HostRemoveWorktreeFrame --> CreatedWorktree
    HostRemoveWorktreeFrame --> _FakeWebSocket
    HostRemoveWorktreeFrame --> _HostCapture
    HostRemoveWorktreeFrame --> _FakeWebSocket
    HostRemoveWorktreeFrame --> _FakeWebSocket
    HostRemoveWorktreeResultFrame --> HostConnectError
    HostRemoveWorktreeResultFrame --> _RunnerHandle
    HostRemoveWorktreeResultFrame --> HostProcess
    HostRunnerExitedFrame --> HostConnectError
    HostRunnerExitedFrame --> _RunnerHandle
    HostRunnerExitedFrame --> HostProcess
    HostRunnerExitedFrame --> _FakeTunnel
    HostRunnerExitedFrame --> _HandshakeFailingConnect
    HostRunnerExitedFrame --> _DroppedTunnel
    HostRunnerExitedFrame --> _AcceptingConnect
    HostRunnerExitedFrame --> _ConnectSpy
    HostRunnerExitedFrame --> _StubAuthProvider
    HostStatFrame --> HostConnectError
    HostStatFrame --> _RunnerHandle
    HostStatFrame --> HostProcess
    HostStatFrame --> WorkspaceValidationError
    HostStatFrame --> _FakeTunnel
    HostStatFrame --> _HandshakeFailingConnect
    HostStatFrame --> _DroppedTunnel
    HostStatFrame --> _AcceptingConnect
    HostStatFrame --> _ConnectSpy
    HostStatFrame --> _FakeWebSocket
    HostStatFrame --> _HostCapture
    HostStatFrame --> _NoopRunnerWS
    HostStatFrame --> _FakeWebSocket
    HostStatFrame --> _FakeWebSocket
    HostStatResultFrame --> HostConnectError
    HostStatResultFrame --> _RunnerHandle
    HostStatResultFrame --> HostProcess
    HostStatResultFrame --> _FakeTunnel
    HostStatResultFrame --> _HandshakeFailingConnect
    HostStatResultFrame --> _DroppedTunnel
    HostStatResultFrame --> _AcceptingConnect
    HostStatResultFrame --> _ConnectSpy
    HostStatResultFrame --> _NoopRunnerWS
    HostStopRunnerFrame --> HostConnectError
    HostStopRunnerFrame --> _RunnerHandle
    HostStopRunnerFrame --> HostProcess
    HostStopRunnerFrame --> _MirroredToolCall
    HostStopRunnerFrame --> _PendingPolicyAskWrites
    HostStopRunnerFrame --> _RelayHandle
    HostStopRunnerFrame --> SessionLiveness
    HostStopRunnerFrame --> _RunnerForwardResult
    HostStopRunnerFrame --> _HostLaunchAttempt
    HostStopRunnerFrame --> _NativeTerminalEnsureOutcome
    HostStopRunnerFrame --> _SessionEventDispatchResult
    HostStopRunnerFrame --> _FakeTunnel
    HostStopRunnerFrame --> _HandshakeFailingConnect
    HostStopRunnerFrame --> _DroppedTunnel
    HostStopRunnerFrame --> _AcceptingConnect
    HostStopRunnerFrame --> _ConnectSpy
    HostStopRunnerFrame --> _NoopRunnerWS
    HostStopRunnerResultFrame --> HostConnectError
    HostStopRunnerResultFrame --> _RunnerHandle
    HostStopRunnerResultFrame --> HostProcess
    HostStopRunnerResultFrame --> _FakeTunnel
    HostStopRunnerResultFrame --> _HandshakeFailingConnect
    HostStopRunnerResultFrame --> _DroppedTunnel
    HostStopRunnerResultFrame --> _AcceptingConnect
    HostStopRunnerResultFrame --> _ConnectSpy
    HostStopRunnerResultFrame --> _NoopRunnerWS
    PongFrame --> HostConnectError
    PongFrame --> _RunnerHandle
    PongFrame --> HostProcess
    FunctionPolicy --> Policy
    FunctionPolicy --> EvaluationContext
    FunctionPolicy --> PolicyResult
    FunctionPolicy --> FunctionPolicySpec
    FunctionPolicy --> Phase
    FunctionPolicy --> PolicyAction
    FunctionPolicy --> StateUpdate
    FunctionPolicy --> StateUpdateAction
    FunctionPolicy --> _Recorder
    FunctionPolicy --> _ElicitationHarness
    FunctionPolicy --> _FakeResponsesNamespace
    FunctionPolicy --> _FakeClient
    WorktreeError --> HostConnectError
    WorktreeError --> _RunnerHandle
    WorktreeError --> HostProcess
    WorktreeError --> CreateDirectoryRequest
    WorktreeError --> LaunchRunnerRequest
    WorktreeError --> _MirroredToolCall
    WorktreeError --> _PendingPolicyAskWrites
    WorktreeError --> _RelayHandle
    WorktreeError --> SessionLiveness
    WorktreeError --> _RunnerForwardResult
    WorktreeError --> _HostLaunchAttempt
    WorktreeError --> _NativeTerminalEnsureOutcome
    WorktreeError --> _SessionEventDispatchResult
    _CalCfg --> PolicyEvent
    _CalCfg --> PolicyResponse
    _CalCfg --> StateUpdateEntry
    _DriveCfg --> PolicyEvent
    _DriveCfg --> PolicyResponse
    _DriveCfg --> StateUpdateEntry
    _GmailCfg --> PolicyEvent
    _GmailCfg --> PolicyResponse
    _GmailCfg --> StateUpdateEntry
    _ParsedToolCall --> PolicyEvent
    _ParsedToolCall --> PolicyResponse
    _ParsedToolCall --> StateUpdateEntry
    NativeCodingAgent --> _MirroredToolCall
    NativeCodingAgent --> _PendingPolicyAskWrites
    NativeCodingAgent --> _RelayHandle
    NativeCodingAgent --> SessionLiveness
    NativeCodingAgent --> _RunnerForwardResult
    NativeCodingAgent --> _HostLaunchAttempt
    NativeCodingAgent --> _NativeTerminalEnsureOutcome
    NativeCodingAgent --> _SessionEventDispatchResult
    FakeSandboxLauncher --> _EntrypointFakeLauncher
    FakeSandboxLauncher --> ManagedSessionEnv
    HostStartInvocation --> _EntrypointFakeLauncher
    HostStartInvocation --> ManagedSessionEnv
    HostLaunchTarget --> HostConnection
    HostLaunchTarget --> HostRegistry
    HostLaunchTarget --> Host
    HostLaunchTarget --> HostStore
    HostLaunchTarget --> _StubAuthProvider
    HostConnection --> HostHelloFrame
    HostConnection --> CreateDirectoryRequest
    HostConnection --> LaunchRunnerRequest
    HostConnection --> _MirroredToolCall
    HostConnection --> _PendingPolicyAskWrites
    HostConnection --> _RelayHandle
    HostConnection --> SessionLiveness
    HostConnection --> _RunnerForwardResult
    HostConnection --> _HostLaunchAttempt
    HostConnection --> _NativeTerminalEnsureOutcome
    HostConnection --> _SessionEventDispatchResult
    HostConnection --> HostLaunchTarget
    HostConnection --> WorktreeProxyError
    HostConnection --> WorktreeHostUnavailableError
    HostConnection --> CreatedWorktree
    HostConnection --> WorkspaceValidationError
    HostConnection --> _FakeWebSocket
    HostConnection --> _HostCapture
    HostConnection --> _FakeWebSocket
    HostRegistry --> _FastAPICallNext
    HostRegistry --> _WebSocketMetricsMiddleware
    HostRegistry --> _SPAStaticFiles
    HostRegistry --> _RangeAwareGZipMiddleware
    HostRegistry --> HostHelloFrame
    HostRegistry --> CreateDirectoryRequest
    HostRegistry --> LaunchRunnerRequest
    HostRegistry --> _MirroredToolCall
    HostRegistry --> _PendingPolicyAskWrites
    HostRegistry --> _RelayHandle
    HostRegistry --> SessionLiveness
    HostRegistry --> _RunnerForwardResult
    HostRegistry --> _HostLaunchAttempt
    HostRegistry --> _NativeTerminalEnsureOutcome
    HostRegistry --> _SessionEventDispatchResult
    HostRegistry --> HostLaunchTarget
    HostRegistry --> WorktreeProxyError
    HostRegistry --> WorktreeHostUnavailableError
    HostRegistry --> CreatedWorktree
    HostRegistry --> WorkspaceValidationError
    HostRegistry --> FakeWebSocket
    HostRegistry --> _StubAuthProvider
    HostRegistry --> ManagedSessionEnv
    HostRegistry --> _FixedAuthProvider
    HostRegistry --> _FakeWebSocket
    HostRegistry --> _FakeWebSocket
    RunnerExitReport --> HostHelloFrame
    RunnerExitReports --> _FastAPICallNext
    RunnerExitReports --> _WebSocketMetricsMiddleware
    RunnerExitReports --> _SPAStaticFiles
    RunnerExitReports --> _RangeAwareGZipMiddleware
    RunnerExitReports --> HostHelloFrame
    RunnerExitReports --> _MirroredToolCall
    RunnerExitReports --> _PendingPolicyAskWrites
    RunnerExitReports --> _RelayHandle
    RunnerExitReports --> SessionLiveness
    RunnerExitReports --> _RunnerForwardResult
    RunnerExitReports --> _HostLaunchAttempt
    RunnerExitReports --> _NativeTerminalEnsureOutcome
    RunnerExitReports --> _SessionEventDispatchResult
    RunnerExitReports --> FakeWebSocket
    RunnerExitReports --> _StubAuthProvider
    RunnerExitReports --> _NeverConnectsRegistry
    RunnerExitReports --> _PublishedUsage
    RunnerExitReports --> _UsageStreamRecorder
    WebSocketLike --> HostHelloFrame
    Host --> ManagedLaunch
    Host --> ManagedLaunchTracker
    Host --> ManagedSandboxConfig
    Host --> ManagedHostLaunch
    Host --> RepoWorkspace
    Host --> _MirroredToolCall
    Host --> _PendingPolicyAskWrites
    Host --> _RelayHandle
    Host --> SessionLiveness
    Host --> _RunnerForwardResult
    Host --> _HostLaunchAttempt
    Host --> _NativeTerminalEnsureOutcome
    Host --> _SessionEventDispatchResult
    Host --> HostLaunchTarget
    Host --> SqlConversation
    Host --> SqlHost
    HostStore --> _FirstRunPlan
    HostStore --> _OmnigentCLI
    HostStore --> _HostDaemonRecord
    HostStore --> _HostHttpResult
    HostStore --> _HostSessionsTableWidths
    HostStore --> _DaemonSessionsResult
    HostStore --> _SessionsPageResult
    HostStore --> _SessionPagesResult
    HostStore --> _SpawnedDaemonProcess
    HostStore --> _DaemonReuseDecision
    HostStore --> _CliRunnerProcess
    HostStore --> _LLMDeploy
    HostStore --> _BuiltinEntry
    HostStore --> _ToolsDeploy
    HostStore --> _ExecutorDeploy
    HostStore --> _DeployConfig
    HostStore --> _ResumeChoice
    HostStore --> _HostGroup
    HostStore --> _ConfigGroup
    HostStore --> _HarnessMenuRow
    HostStore --> _FastAPICallNext
    HostStore --> _WebSocketMetricsMiddleware
    HostStore --> _SPAStaticFiles
    HostStore --> _RangeAwareGZipMiddleware
    HostStore --> ManagedLaunch
    HostStore --> ManagedLaunchTracker
    HostStore --> ManagedSandboxConfig
    HostStore --> ManagedHostLaunch
    HostStore --> RepoWorkspace
    HostStore --> CreateDirectoryRequest
    HostStore --> LaunchRunnerRequest
    HostStore --> _MirroredToolCall
    HostStore --> _PendingPolicyAskWrites
    HostStore --> _RelayHandle
    HostStore --> SessionLiveness
    HostStore --> _RunnerForwardResult
    HostStore --> _HostLaunchAttempt
    HostStore --> _NativeTerminalEnsureOutcome
    HostStore --> _SessionEventDispatchResult
    HostStore --> HostLaunchTarget
    HostStore --> SqlConversation
    HostStore --> SqlHost
    HostStore --> _ResolvedConfig
    HostStore --> _BuiltApp
    HostStore --> _FakeReq
    HostStore --> _StubWebSocket
    HostStore --> _LivenessApp
    HostStore --> _SeedStores
    HostStore --> _EntrypointFakeLauncher
    HostStore --> _StubAuthProvider
    HostStore --> _FakeWebSocket
    HostStore --> _HostCapture
    HostStore --> ManagedSessionEnv
    HostStore --> _FixedAuthProvider
    HostStore --> _ForwardedEffort
    HostStore --> _NoopRunnerWS
    HostStore --> _FakeWebSocket
    HostStore --> _FakeWebSocket
    CreatedWorktree --> _MirroredToolCall
    CreatedWorktree --> _PendingPolicyAskWrites
    CreatedWorktree --> _RelayHandle
    CreatedWorktree --> SessionLiveness
    CreatedWorktree --> _RunnerForwardResult
    CreatedWorktree --> _HostLaunchAttempt
    CreatedWorktree --> _NativeTerminalEnsureOutcome
    CreatedWorktree --> _SessionEventDispatchResult
    CreatedWorktree --> HostCreateWorktreeFrame
    CreatedWorktree --> HostRemoveWorktreeFrame
    CreatedWorktree --> HostConnection
    CreatedWorktree --> HostRegistry
    WorktreeProxyError <|-- WorktreeHostUnavailableError
    WorktreeHostUnavailableError --> CreateDirectoryRequest
    WorktreeHostUnavailableError --> LaunchRunnerRequest
    WorktreeHostUnavailableError --> _MirroredToolCall
    WorktreeHostUnavailableError --> _PendingPolicyAskWrites
    WorktreeHostUnavailableError --> _RelayHandle
    WorktreeHostUnavailableError --> SessionLiveness
    WorktreeHostUnavailableError --> _RunnerForwardResult
    WorktreeHostUnavailableError --> _HostLaunchAttempt
    WorktreeHostUnavailableError --> _NativeTerminalEnsureOutcome
    WorktreeHostUnavailableError --> _SessionEventDispatchResult
    WorktreeHostUnavailableError --> HostCreateWorktreeFrame
    WorktreeHostUnavailableError --> HostRemoveWorktreeFrame
    WorktreeHostUnavailableError --> HostConnection
    WorktreeHostUnavailableError --> HostRegistry
    WorktreeHostUnavailableError --> _FakeWebSocket
    WorktreeHostUnavailableError <|-- WorktreeProxyError
    WorktreeProxyError --> CreateDirectoryRequest
    WorktreeProxyError --> LaunchRunnerRequest
    WorktreeProxyError --> _MirroredToolCall
    WorktreeProxyError --> _PendingPolicyAskWrites
    WorktreeProxyError --> _RelayHandle
    WorktreeProxyError --> SessionLiveness
    WorktreeProxyError --> _RunnerForwardResult
    WorktreeProxyError --> _HostLaunchAttempt
    WorktreeProxyError --> _NativeTerminalEnsureOutcome
    WorktreeProxyError --> _SessionEventDispatchResult
    WorktreeProxyError --> HostCreateWorktreeFrame
    WorktreeProxyError --> HostRemoveWorktreeFrame
    WorktreeProxyError --> HostConnection
    WorktreeProxyError --> HostRegistry
    WorktreeProxyError --> _FakeWebSocket
    CreateDirectoryRequest --> HostCreateDirFrame
    CreateDirectoryRequest --> HostLaunchRunnerFrame
    CreateDirectoryRequest --> HostListDirFrame
    CreateDirectoryRequest --> AgentCache
    CreateDirectoryRequest --> AuthProvider
    CreateDirectoryRequest --> HostConnection
    CreateDirectoryRequest --> HostRegistry
    CreateDirectoryRequest --> SessionGitOptions
    CreateDirectoryRequest --> HostStore
    CreateDirectoryRequest --> WorkspaceValidationError
    CreateDirectoryRequest --> WorktreeError
    CreateDirectoryRequest --> WorktreeHostUnavailableError
    CreateDirectoryRequest --> WorktreeProxyError
    LaunchRunnerRequest --> HostCreateDirFrame
    LaunchRunnerRequest --> HostLaunchRunnerFrame
    LaunchRunnerRequest --> HostListDirFrame
    LaunchRunnerRequest --> AgentCache
    LaunchRunnerRequest --> AuthProvider
    LaunchRunnerRequest --> HostConnection
    LaunchRunnerRequest --> HostRegistry
    LaunchRunnerRequest --> SessionGitOptions
    LaunchRunnerRequest --> HostStore
    LaunchRunnerRequest --> WorkspaceValidationError
    LaunchRunnerRequest --> WorktreeError
    LaunchRunnerRequest --> WorktreeHostUnavailableError
    LaunchRunnerRequest --> WorktreeProxyError
    HostIdentity --> HostConnectError
    HostIdentity --> _RunnerHandle
    HostIdentity --> HostProcess
    HostIdentity --> _FakeTunnel
    HostIdentity --> _HandshakeFailingConnect
    HostIdentity --> _DroppedTunnel
    HostIdentity --> _AcceptingConnect
    HostIdentity --> _ConnectSpy
    UpdateImageEditRequest --> AuthProvider
    LocalArtifactStore --> _FirstRunPlan
    LocalArtifactStore --> _OmnigentCLI
    LocalArtifactStore --> _HostDaemonRecord
    LocalArtifactStore --> _HostHttpResult
    LocalArtifactStore --> _HostSessionsTableWidths
    LocalArtifactStore --> _DaemonSessionsResult
    LocalArtifactStore --> _SessionsPageResult
    LocalArtifactStore --> _SessionPagesResult
    LocalArtifactStore --> _SpawnedDaemonProcess
    LocalArtifactStore --> _DaemonReuseDecision
    LocalArtifactStore --> _CliRunnerProcess
    LocalArtifactStore --> _LLMDeploy
    LocalArtifactStore --> _BuiltinEntry
    LocalArtifactStore --> _ToolsDeploy
    LocalArtifactStore --> _ExecutorDeploy
    LocalArtifactStore --> _DeployConfig
    LocalArtifactStore --> _ResumeChoice
    LocalArtifactStore --> _HostGroup
    LocalArtifactStore --> _ConfigGroup
    LocalArtifactStore --> _HarnessMenuRow
    LocalArtifactStore --> _ResolvedConfig
    LocalArtifactStore --> _BuiltApp
    LocalArtifactStore --> ControllableMockClient
    LocalArtifactStore --> _FakeReq
    LocalArtifactStore --> _StubWebSocket
    LocalArtifactStore --> _LivenessApp
    LocalArtifactStore --> _SeedStores
    LocalArtifactStore --> _EntrypointFakeLauncher
    LocalArtifactStore --> _StubAuthProvider
    LocalArtifactStore --> _FakeWebSocket
    LocalArtifactStore --> _HostCapture
    LocalArtifactStore --> ManagedSessionEnv
    LocalArtifactStore --> _CaptureRunnerClient
    LocalArtifactStore --> _InputRequiredRunnerClient
    LocalArtifactStore --> _CaptureRunnerClient
    LocalArtifactStore --> FakeProcessManager
    LocalArtifactStore --> _TunnelStack
    LocalArtifactStore --> _NoopRunnerWS
    LocalArtifactStore --> _FakeUpload
    ManagedHostLaunch --> Host
    ManagedHostLaunch --> HostStore
    ManagedHostLaunch --> _MirroredToolCall
    ManagedHostLaunch --> _PendingPolicyAskWrites
    ManagedHostLaunch --> _RelayHandle
    ManagedHostLaunch --> SessionLiveness
    ManagedHostLaunch --> _RunnerForwardResult
    ManagedHostLaunch --> _HostLaunchAttempt
    ManagedHostLaunch --> _NativeTerminalEnsureOutcome
    ManagedHostLaunch --> _SessionEventDispatchResult
    ManagedLaunch --> Host
    ManagedLaunch --> HostStore
    ManagedLaunch --> _MirroredToolCall
    ManagedLaunch --> _PendingPolicyAskWrites
    ManagedLaunch --> _RelayHandle
    ManagedLaunch --> SessionLiveness
    ManagedLaunch --> _RunnerForwardResult
    ManagedLaunch --> _HostLaunchAttempt
    ManagedLaunch --> _NativeTerminalEnsureOutcome
    ManagedLaunch --> _SessionEventDispatchResult
    ManagedLaunchTracker --> _FastAPICallNext
    ManagedLaunchTracker --> _WebSocketMetricsMiddleware
    ManagedLaunchTracker --> _SPAStaticFiles
    ManagedLaunchTracker --> _RangeAwareGZipMiddleware
    ManagedLaunchTracker --> Host
    ManagedLaunchTracker --> HostStore
    ManagedLaunchTracker --> _MirroredToolCall
    ManagedLaunchTracker --> _PendingPolicyAskWrites
    ManagedLaunchTracker --> _RelayHandle
    ManagedLaunchTracker --> SessionLiveness
    ManagedLaunchTracker --> _RunnerForwardResult
    ManagedLaunchTracker --> _HostLaunchAttempt
    ManagedLaunchTracker --> _NativeTerminalEnsureOutcome
    ManagedLaunchTracker --> _SessionEventDispatchResult
    ManagedSandboxConfig --> _FastAPICallNext
    ManagedSandboxConfig --> _WebSocketMetricsMiddleware
    ManagedSandboxConfig --> _SPAStaticFiles
    ManagedSandboxConfig --> _RangeAwareGZipMiddleware
    ManagedSandboxConfig --> Host
    ManagedSandboxConfig --> HostStore
    ManagedSandboxConfig --> _MirroredToolCall
    ManagedSandboxConfig --> _PendingPolicyAskWrites
    ManagedSandboxConfig --> _RelayHandle
    ManagedSandboxConfig --> SessionLiveness
    ManagedSandboxConfig --> _RunnerForwardResult
    ManagedSandboxConfig --> _HostLaunchAttempt
    ManagedSandboxConfig --> _NativeTerminalEnsureOutcome
    ManagedSandboxConfig --> _SessionEventDispatchResult
    ManagedSandboxConfig --> _EntrypointFakeLauncher
    RepoWorkspace --> Host
    RepoWorkspace --> HostStore
    RepoWorkspace --> _MirroredToolCall
    RepoWorkspace --> _PendingPolicyAskWrites
    RepoWorkspace --> _RelayHandle
    RepoWorkspace --> SessionLiveness
    RepoWorkspace --> _RunnerForwardResult
    RepoWorkspace --> _HostLaunchAttempt
    RepoWorkspace --> _NativeTerminalEnsureOutcome
    RepoWorkspace --> _SessionEventDispatchResult
    RepoWorkspace --> _EntrypointFakeLauncher
    ServerMcpPool --> _FastAPICallNext
    ServerMcpPool --> _WebSocketMetricsMiddleware
    ServerMcpPool --> _SPAStaticFiles
    ServerMcpPool --> _RangeAwareGZipMiddleware
    ServerMcpPool --> _MirroredToolCall
    ServerMcpPool --> _PendingPolicyAskWrites
    ServerMcpPool --> _RelayHandle
    ServerMcpPool --> SessionLiveness
    ServerMcpPool --> _RunnerForwardResult
    ServerMcpPool --> _HostLaunchAttempt
    ServerMcpPool --> _NativeTerminalEnsureOutcome
    ServerMcpPool --> _SessionEventDispatchResult
    InvitedEmailLookup --> AdminList
    InvitedEmailLookup --> MtimeCachedIdentitySet
    OidcAdmissionPolicy --> AdminList
    OidcAdmissionPolicy --> MtimeCachedIdentitySet
    OidcAdmissionPolicy --> _CliTicket
    OidcAdmissionPolicy --> _StubInvitedLookup
    OIDCConfig --> AuthProvider
    OIDCConfig --> UnifiedAuthProvider
    OIDCConfig --> _CliTicket
    OIDCConfig --> _IdpKeys
    OIDCConfig --> _FakeResponse
    OIDCConfig --> _FakeAsyncClient
    RequestDurationAccessFormatter --> _FakeMetricInputs
    RequestDurationAccessFormatter --> _MetricRecord
    RequestDurationAccessFormatter --> _FakeCounter
    RequestDurationAccessFormatter --> _FakeGauge
    RequestDurationAccessFormatter --> _FakeHistogram
    RequestDurationAccessFormatter --> _FakeMeter
    ServerMetricsOtelPublisher --> _FastAPICallNext
    ServerMetricsOtelPublisher --> _WebSocketMetricsMiddleware
    ServerMetricsOtelPublisher --> _SPAStaticFiles
    ServerMetricsOtelPublisher --> _RangeAwareGZipMiddleware
    ServerMetricsOtelPublisher --> _FakeMetricInputs
    ServerMetricsOtelPublisher --> _MetricRecord
    ServerMetricsOtelPublisher --> _FakeCounter
    ServerMetricsOtelPublisher --> _FakeGauge
    ServerMetricsOtelPublisher --> _FakeHistogram
    ServerMetricsOtelPublisher --> _FakeMeter
    ServerMetricsSnapshot --> _FakeMetricInputs
    ServerMetricsSnapshot --> _MetricRecord
    ServerMetricsSnapshot --> _FakeCounter
    ServerMetricsSnapshot --> _FakeGauge
    ServerMetricsSnapshot --> _FakeHistogram
    ServerMetricsSnapshot --> _FakeMeter
    ServerPerformanceMetrics --> _FastAPICallNext
    ServerPerformanceMetrics --> _WebSocketMetricsMiddleware
    ServerPerformanceMetrics --> _SPAStaticFiles
    ServerPerformanceMetrics --> _RangeAwareGZipMiddleware
    ServerPerformanceMetrics --> _FakeMetricInputs
    ServerPerformanceMetrics --> _MetricRecord
    ServerPerformanceMetrics --> _FakeCounter
    ServerPerformanceMetrics --> _FakeGauge
    ServerPerformanceMetrics --> _FakeHistogram
    ServerPerformanceMetrics --> _FakeMeter
    SystemLoadAverage --> _FakeMetricInputs
    SystemLoadAverage --> _MetricRecord
    SystemLoadAverage --> _FakeCounter
    SystemLoadAverage --> _FakeGauge
    SystemLoadAverage --> _FakeHistogram
    SystemLoadAverage --> _FakeMeter
    ResolvedAccess --> _StubPermissionStore
    ResolvedAccess --> _StubConversationStore
    SessionPermission --> _MirroredToolCall
    SessionPermission --> _PendingPolicyAskWrites
    SessionPermission --> _RelayHandle
    SessionPermission --> SessionLiveness
    SessionPermission --> _RunnerForwardResult
    SessionPermission --> _HostLaunchAttempt
    SessionPermission --> _NativeTerminalEnsureOutcome
    SessionPermission --> _SessionEventDispatchResult
    SessionPermission --> _StubPermissionStore
    SessionPermission --> _StubConversationStore
    _GatedPolicy --> EvaluationContext
    _GatedPolicy --> PolicyResult
    _GatedPolicy --> FunctionPolicySpec
    _GatedPolicy --> Phase
    _GatedPolicy --> PolicyAction
    PolicyVerdict --> EvaluationContext
    PolicyVerdict --> PolicyResult
    PolicyVerdict --> FunctionPolicySpec
    PolicyVerdict --> Phase
    PolicyVerdict --> PolicyAction
    ProviderEntry --> _AttachOutcome
    ProviderEntry --> _FirstRunPlan
    ProviderEntry --> _OmnigentCLI
    ProviderEntry --> _HostDaemonRecord
    ProviderEntry --> _HostHttpResult
    ProviderEntry --> _HostSessionsTableWidths
    ProviderEntry --> _DaemonSessionsResult
    ProviderEntry --> _SessionsPageResult
    ProviderEntry --> _SessionPagesResult
    ProviderEntry --> _SpawnedDaemonProcess
    ProviderEntry --> _DaemonReuseDecision
    ProviderEntry --> _CliRunnerProcess
    ProviderEntry --> _LLMDeploy
    ProviderEntry --> _BuiltinEntry
    ProviderEntry --> _ToolsDeploy
    ProviderEntry --> _ExecutorDeploy
    ProviderEntry --> _DeployConfig
    ProviderEntry --> _ResumeChoice
    ProviderEntry --> _HostGroup
    ProviderEntry --> _ConfigGroup
    ProviderEntry --> _HarnessMenuRow
    ProviderEntry --> _VendorEndpoint
    ProviderEntry --> AddOption
    TunnelRegistry --> RoutedRunner
    TunnelRegistry --> RunnerRouter
    TunnelRegistry --> _FastAPICallNext
    TunnelRegistry --> _WebSocketMetricsMiddleware
    TunnelRegistry --> _SPAStaticFiles
    TunnelRegistry --> _RangeAwareGZipMiddleware
    TunnelRegistry --> _MirroredToolCall
    TunnelRegistry --> _PendingPolicyAskWrites
    TunnelRegistry --> _RelayHandle
    TunnelRegistry --> SessionLiveness
    TunnelRegistry --> _RunnerForwardResult
    TunnelRegistry --> _HostLaunchAttempt
    TunnelRegistry --> _NativeTerminalEnsureOutcome
    TunnelRegistry --> _SessionEventDispatchResult
    TunnelRegistry --> _FakeWebSocket
    TunnelRegistry --> _ConversationStore
    TunnelRegistry --> _StubAuthProvider
    _RiskCfg --> PolicyEvent
    _RiskCfg --> PolicyResponse
    _RiskCfg --> StateUpdateEntry
    RoutedRunner --> TunnelRegistry
    RoutedRunner --> FakeProcessManager
    RoutedRunner --> _TunnelStack
    RoutedRunner --> _RaisingRunnerClient
    RoutedRunner --> _RaisingRunnerRouter
    RoutedRunner --> _PublishedUsage
    RoutedRunner --> _UsageStreamRecorder
    RunnerRouter --> TunnelRegistry
    RunnerRouter --> _FastAPICallNext
    RunnerRouter --> _WebSocketMetricsMiddleware
    RunnerRouter --> _SPAStaticFiles
    RunnerRouter --> _RangeAwareGZipMiddleware
    RunnerRouter --> _MirroredToolCall
    RunnerRouter --> _PendingPolicyAskWrites
    RunnerRouter --> _RelayHandle
    RunnerRouter --> SessionLiveness
    RunnerRouter --> _RunnerForwardResult
    RunnerRouter --> _HostLaunchAttempt
    RunnerRouter --> _NativeTerminalEnsureOutcome
    RunnerRouter --> _SessionEventDispatchResult
    RunnerRouter --> _McpLocation
    RunnerRouter --> _FakeWebSocket
    RunnerRouter --> _ConversationStore
    RunnerStartupProgress --> _AttachOutcome
    RunnerStartupProgress --> _FirstRunPlan
    RunnerStartupProgress --> _OmnigentCLI
    RunnerStartupProgress --> _HostDaemonRecord
    RunnerStartupProgress --> _HostHttpResult
    RunnerStartupProgress --> _HostSessionsTableWidths
    RunnerStartupProgress --> _DaemonSessionsResult
    RunnerStartupProgress --> _SessionsPageResult
    RunnerStartupProgress --> _SessionPagesResult
    RunnerStartupProgress --> _SpawnedDaemonProcess
    RunnerStartupProgress --> _DaemonReuseDecision
    RunnerStartupProgress --> _CliRunnerProcess
    RunnerStartupProgress --> _LLMDeploy
    RunnerStartupProgress --> _BuiltinEntry
    RunnerStartupProgress --> _ToolsDeploy
    RunnerStartupProgress --> _ExecutorDeploy
    RunnerStartupProgress --> _DeployConfig
    RunnerStartupProgress --> _ResumeChoice
    RunnerStartupProgress --> _HostGroup
    RunnerStartupProgress --> _ConfigGroup
    RunnerStartupProgress --> _HarnessMenuRow
    ActorContext --> PolicyLLMClient
    EventContext --> PolicyLLMClient
    PolicyCallable --> PolicyLLMClient
    PolicyCallable --> _ExpensiveModelConfig
    PolicyCallableWithConfig --> PolicyLLMClient
    PolicyEvent --> PolicyLLMClient
    PolicyEvent --> _ExpensiveModelConfig
    PolicyEvent --> _ParsedToolCall
    PolicyEvent --> _DriveCfg
    PolicyEvent --> _GmailCfg
    PolicyEvent --> _CalCfg
    PolicyEvent --> _RiskCfg
    PolicyEvent --> _DirOp
    PolicyResponse --> PolicyLLMClient
    PolicyResponse --> _ExpensiveModelConfig
    PolicyResponse --> _ParsedToolCall
    PolicyResponse --> _DriveCfg
    PolicyResponse --> _GmailCfg
    PolicyResponse --> _CalCfg
    PolicyResponse --> _RiskCfg
    PolicyResponse --> _DirOp
    StateUpdateEntry --> PolicyLLMClient
    StateUpdateEntry --> _ParsedToolCall
    StateUpdateEntry --> _DriveCfg
    StateUpdateEntry --> _GmailCfg
    StateUpdateEntry --> _CalCfg
    StateUpdateEntry --> _RiskCfg
    UsageContext --> PolicyLLMClient
    UserDailyCostContext --> PolicyLLMClient
    AgentObject --> _MirroredToolCall
    AgentObject --> _PendingPolicyAskWrites
    AgentObject --> _RelayHandle
    AgentObject --> SessionLiveness
    AgentObject --> _RunnerForwardResult
    AgentObject --> _HostLaunchAttempt
    AgentObject --> _NativeTerminalEnsureOutcome
    AgentObject --> _SessionEventDispatchResult
    ChildSessionList --> _MirroredToolCall
    ChildSessionList --> _PendingPolicyAskWrites
    ChildSessionList --> _RelayHandle
    ChildSessionList --> SessionLiveness
    ChildSessionList --> _RunnerForwardResult
    ChildSessionList --> _HostLaunchAttempt
    ChildSessionList --> _NativeTerminalEnsureOutcome
    ChildSessionList --> _SessionEventDispatchResult
    ChildSessionSummary --> _MirroredToolCall
    ChildSessionSummary --> _PendingPolicyAskWrites
    ChildSessionSummary --> _RelayHandle
    ChildSessionSummary --> SessionLiveness
    ChildSessionSummary --> _RunnerForwardResult
    ChildSessionSummary --> _HostLaunchAttempt
    ChildSessionSummary --> _NativeTerminalEnsureOutcome
    ChildSessionSummary --> _SessionEventDispatchResult
    ConversationDeleted --> _MirroredToolCall
    ConversationDeleted --> _PendingPolicyAskWrites
    ConversationDeleted --> _RelayHandle
    ConversationDeleted --> SessionLiveness
    ConversationDeleted --> _RunnerForwardResult
    ConversationDeleted --> _HostLaunchAttempt
    ConversationDeleted --> _NativeTerminalEnsureOutcome
    ConversationDeleted --> _SessionEventDispatchResult
    CreatedSessionResponse --> _MirroredToolCall
    CreatedSessionResponse --> _PendingPolicyAskWrites
    CreatedSessionResponse --> _RelayHandle
    CreatedSessionResponse --> SessionLiveness
    CreatedSessionResponse --> _RunnerForwardResult
    CreatedSessionResponse --> _HostLaunchAttempt
    CreatedSessionResponse --> _NativeTerminalEnsureOutcome
    CreatedSessionResponse --> _SessionEventDispatchResult
    ElicitationRequestParams --> _MirroredToolCall
    ElicitationRequestParams --> _PendingPolicyAskWrites
    ElicitationRequestParams --> _RelayHandle
    ElicitationRequestParams --> SessionLiveness
    ElicitationRequestParams --> _RunnerForwardResult
    ElicitationRequestParams --> _HostLaunchAttempt
    ElicitationRequestParams --> _NativeTerminalEnsureOutcome
    ElicitationRequestParams --> _SessionEventDispatchResult
    ElicitationResult --> _ParkedHarnessElicitation
    ElicitationResult --> _MirroredToolCall
    ElicitationResult --> _PendingPolicyAskWrites
    ElicitationResult --> _RelayHandle
    ElicitationResult --> SessionLiveness
    ElicitationResult --> _RunnerForwardResult
    ElicitationResult --> _HostLaunchAttempt
    ElicitationResult --> _NativeTerminalEnsureOutcome
    ElicitationResult --> _SessionEventDispatchResult
    ErrorDetail --> _FastAPICallNext
    ErrorDetail --> _WebSocketMetricsMiddleware
    ErrorDetail --> _SPAStaticFiles
    ErrorDetail --> _RangeAwareGZipMiddleware
    ErrorDetail --> _MirroredToolCall
    ErrorDetail --> _PendingPolicyAskWrites
    ErrorDetail --> _RelayHandle
    ErrorDetail --> SessionLiveness
    ErrorDetail --> _RunnerForwardResult
    ErrorDetail --> _HostLaunchAttempt
    ErrorDetail --> _NativeTerminalEnsureOutcome
    ErrorDetail --> _SessionEventDispatchResult
    ErrorDetail --> FakeProcessManager
    ErrorDetail --> _TunnelStack
    ErrorDetail --> _PublishedUsage
    ErrorDetail --> _UsageStreamRecorder
    GrantPermissionRequest --> _MirroredToolCall
    GrantPermissionRequest --> _PendingPolicyAskWrites
    GrantPermissionRequest --> _RelayHandle
    GrantPermissionRequest --> SessionLiveness
    GrantPermissionRequest --> _RunnerForwardResult
    GrantPermissionRequest --> _HostLaunchAttempt
    GrantPermissionRequest --> _NativeTerminalEnsureOutcome
    GrantPermissionRequest --> _SessionEventDispatchResult
    MCPServerSummary --> _MirroredToolCall
    MCPServerSummary --> _PendingPolicyAskWrites
    MCPServerSummary --> _RelayHandle
    MCPServerSummary --> SessionLiveness
    MCPServerSummary --> _RunnerForwardResult
    MCPServerSummary --> _HostLaunchAttempt
    MCPServerSummary --> _NativeTerminalEnsureOutcome
    MCPServerSummary --> _SessionEventDispatchResult
    MCPServerSummary --> _McpLocation
    ModelUsage --> _MirroredToolCall
    ModelUsage --> _PendingPolicyAskWrites
    ModelUsage --> _RelayHandle
    ModelUsage --> SessionLiveness
    ModelUsage --> _RunnerForwardResult
    ModelUsage --> _HostLaunchAttempt
    ModelUsage --> _NativeTerminalEnsureOutcome
    ModelUsage --> _SessionEventDispatchResult
    PaginatedList --> _MirroredToolCall
    PaginatedList --> _PendingPolicyAskWrites
    PaginatedList --> _RelayHandle
    PaginatedList --> SessionLiveness
    PaginatedList --> _RunnerForwardResult
    PaginatedList --> _HostLaunchAttempt
    PaginatedList --> _NativeTerminalEnsureOutcome
    PaginatedList --> _SessionEventDispatchResult
    PermissionObject --> _MirroredToolCall
    PermissionObject --> _PendingPolicyAskWrites
    PermissionObject --> _RelayHandle
    PermissionObject --> SessionLiveness
    PermissionObject --> _RunnerForwardResult
    PermissionObject --> _HostLaunchAttempt
    PermissionObject --> _NativeTerminalEnsureOutcome
    PermissionObject --> _SessionEventDispatchResult
    PolicySummary --> _MirroredToolCall
    PolicySummary --> _PendingPolicyAskWrites
    PolicySummary --> _RelayHandle
    PolicySummary --> SessionLiveness
    PolicySummary --> _RunnerForwardResult
    PolicySummary --> _HostLaunchAttempt
    PolicySummary --> _NativeTerminalEnsureOutcome
    PolicySummary --> _SessionEventDispatchResult
    ReadStatePutRequest --> _MirroredToolCall
    ReadStatePutRequest --> _PendingPolicyAskWrites
    ReadStatePutRequest --> _RelayHandle
    ReadStatePutRequest --> SessionLiveness
    ReadStatePutRequest --> _RunnerForwardResult
    ReadStatePutRequest --> _HostLaunchAttempt
    ReadStatePutRequest --> _NativeTerminalEnsureOutcome
    ReadStatePutRequest --> _SessionEventDispatchResult
    ResponseObject --> _MirroredToolCall
    ResponseObject --> _PendingPolicyAskWrites
    ResponseObject --> _RelayHandle
    ResponseObject --> SessionLiveness
    ResponseObject --> _RunnerForwardResult
    ResponseObject --> _HostLaunchAttempt
    ResponseObject --> _NativeTerminalEnsureOutcome
    ResponseObject --> _SessionEventDispatchResult
    SandboxStatus --> _MirroredToolCall
    SandboxStatus --> _PendingPolicyAskWrites
    SandboxStatus --> _RelayHandle
    SandboxStatus --> SessionLiveness
    SandboxStatus --> _RunnerForwardResult
    SandboxStatus --> _HostLaunchAttempt
    SandboxStatus --> _NativeTerminalEnsureOutcome
    SandboxStatus --> _SessionEventDispatchResult
    SessionAgentChangedEvent --> _MirroredToolCall
    SessionAgentChangedEvent --> _PendingPolicyAskWrites
    SessionAgentChangedEvent --> _RelayHandle
    SessionAgentChangedEvent --> SessionLiveness
    SessionAgentChangedEvent --> _RunnerForwardResult
    SessionAgentChangedEvent --> _HostLaunchAttempt
    SessionAgentChangedEvent --> _NativeTerminalEnsureOutcome
    SessionAgentChangedEvent --> _SessionEventDispatchResult
    SessionAgentChangedEvent --> _McpLocation
    SessionCollaborationModeEvent --> _MirroredToolCall
    SessionCollaborationModeEvent --> _PendingPolicyAskWrites
    SessionCollaborationModeEvent --> _RelayHandle
    SessionCollaborationModeEvent --> SessionLiveness
    SessionCollaborationModeEvent --> _RunnerForwardResult
    SessionCollaborationModeEvent --> _HostLaunchAttempt
    SessionCollaborationModeEvent --> _NativeTerminalEnsureOutcome
    SessionCollaborationModeEvent --> _SessionEventDispatchResult
    SessionCreatedEvent --> _MirroredToolCall
    SessionCreatedEvent --> _PendingPolicyAskWrites
    SessionCreatedEvent --> _RelayHandle
    SessionCreatedEvent --> SessionLiveness
    SessionCreatedEvent --> _RunnerForwardResult
    SessionCreatedEvent --> _HostLaunchAttempt
    SessionCreatedEvent --> _NativeTerminalEnsureOutcome
    SessionCreatedEvent --> _SessionEventDispatchResult
    SessionCreateMetadata --> _MirroredToolCall
    SessionCreateMetadata --> _PendingPolicyAskWrites
    SessionCreateMetadata --> _RelayHandle
    SessionCreateMetadata --> SessionLiveness
    SessionCreateMetadata --> _RunnerForwardResult
    SessionCreateMetadata --> _HostLaunchAttempt
    SessionCreateMetadata --> _NativeTerminalEnsureOutcome
    SessionCreateMetadata --> _SessionEventDispatchResult
    SessionCreateRequest --> _MirroredToolCall
    SessionCreateRequest --> _PendingPolicyAskWrites
    SessionCreateRequest --> _RelayHandle
    SessionCreateRequest --> SessionLiveness
    SessionCreateRequest --> _RunnerForwardResult
    SessionCreateRequest --> _HostLaunchAttempt
    SessionCreateRequest --> _NativeTerminalEnsureOutcome
    SessionCreateRequest --> _SessionEventDispatchResult
    SessionEventInput --> _MirroredToolCall
    SessionEventInput --> _PendingPolicyAskWrites
    SessionEventInput --> _RelayHandle
    SessionEventInput --> SessionLiveness
    SessionEventInput --> _RunnerForwardResult
    SessionEventInput --> _HostLaunchAttempt
    SessionEventInput --> _NativeTerminalEnsureOutcome
    SessionEventInput --> _SessionEventDispatchResult
    SessionEventInput --> _CaptureRunnerClient
    SessionEventInput --> _FakeConversationStore
    SessionEventInput --> _FakeAgentStore
    SessionEventInput --> _FakeBody
    SessionEventInput --> _FakeRequest
    SessionEventInput --> _DispatchCall
    SessionForkRequest --> _MirroredToolCall
    SessionForkRequest --> _PendingPolicyAskWrites
    SessionForkRequest --> _RelayHandle
    SessionForkRequest --> SessionLiveness
    SessionForkRequest --> _RunnerForwardResult
    SessionForkRequest --> _HostLaunchAttempt
    SessionForkRequest --> _NativeTerminalEnsureOutcome
    SessionForkRequest --> _SessionEventDispatchResult
    SessionGitOptions --> CreateDirectoryRequest
    SessionGitOptions --> LaunchRunnerRequest
    SessionGitOptions --> _MirroredToolCall
    SessionGitOptions --> _PendingPolicyAskWrites
    SessionGitOptions --> _RelayHandle
    SessionGitOptions --> SessionLiveness
    SessionGitOptions --> _RunnerForwardResult
    SessionGitOptions --> _HostLaunchAttempt
    SessionGitOptions --> _NativeTerminalEnsureOutcome
    SessionGitOptions --> _SessionEventDispatchResult
    SessionInputConsumedPayload --> _MirroredToolCall
    SessionInputConsumedPayload --> _PendingPolicyAskWrites
    SessionInputConsumedPayload --> _RelayHandle
    SessionInputConsumedPayload --> SessionLiveness
    SessionInputConsumedPayload --> _RunnerForwardResult
    SessionInputConsumedPayload --> _HostLaunchAttempt
    SessionInputConsumedPayload --> _NativeTerminalEnsureOutcome
    SessionInputConsumedPayload --> _SessionEventDispatchResult
    SessionInterruptedEvent --> _MirroredToolCall
    SessionInterruptedEvent --> _PendingPolicyAskWrites
    SessionInterruptedEvent --> _RelayHandle
    SessionInterruptedEvent --> SessionLiveness
    SessionInterruptedEvent --> _RunnerForwardResult
    SessionInterruptedEvent --> _HostLaunchAttempt
    SessionInterruptedEvent --> _NativeTerminalEnsureOutcome
    SessionInterruptedEvent --> _SessionEventDispatchResult
    SessionInterruptedPayload --> _MirroredToolCall
    SessionInterruptedPayload --> _PendingPolicyAskWrites
    SessionInterruptedPayload --> _RelayHandle
    SessionInterruptedPayload --> SessionLiveness
    SessionInterruptedPayload --> _RunnerForwardResult
    SessionInterruptedPayload --> _HostLaunchAttempt
    SessionInterruptedPayload --> _NativeTerminalEnsureOutcome
    SessionInterruptedPayload --> _SessionEventDispatchResult
    SessionLabelsResponse --> _MirroredToolCall
    SessionLabelsResponse --> _PendingPolicyAskWrites
    SessionLabelsResponse --> _RelayHandle
    SessionLabelsResponse --> SessionLiveness
    SessionLabelsResponse --> _RunnerForwardResult
    SessionLabelsResponse --> _HostLaunchAttempt
    SessionLabelsResponse --> _NativeTerminalEnsureOutcome
    SessionLabelsResponse --> _SessionEventDispatchResult
    SessionList --> _MirroredToolCall
    SessionList --> _PendingPolicyAskWrites
    SessionList --> _RelayHandle
    SessionList --> SessionLiveness
    SessionList --> _RunnerForwardResult
    SessionList --> _HostLaunchAttempt
    SessionList --> _NativeTerminalEnsureOutcome
    SessionList --> _SessionEventDispatchResult
    SessionListItem --> _MirroredToolCall
    SessionListItem --> _PendingPolicyAskWrites
    SessionListItem --> _RelayHandle
    SessionListItem --> SessionLiveness
    SessionListItem --> _RunnerForwardResult
    SessionListItem --> _HostLaunchAttempt
    SessionListItem --> _NativeTerminalEnsureOutcome
    SessionListItem --> _SessionEventDispatchResult
    SessionModelEvent --> _MirroredToolCall
    SessionModelEvent --> _PendingPolicyAskWrites
    SessionModelEvent --> _RelayHandle
    SessionModelEvent --> SessionLiveness
    SessionModelEvent --> _RunnerForwardResult
    SessionModelEvent --> _HostLaunchAttempt
    SessionModelEvent --> _NativeTerminalEnsureOutcome
    SessionModelEvent --> _SessionEventDispatchResult
    SessionModelOptionsEvent --> _MirroredToolCall
    SessionModelOptionsEvent --> _PendingPolicyAskWrites
    SessionModelOptionsEvent --> _RelayHandle
    SessionModelOptionsEvent --> SessionLiveness
    SessionModelOptionsEvent --> _RunnerForwardResult
    SessionModelOptionsEvent --> _HostLaunchAttempt
    SessionModelOptionsEvent --> _NativeTerminalEnsureOutcome
    SessionModelOptionsEvent --> _SessionEventDispatchResult
    SessionReasoningEffortEvent --> _MirroredToolCall
    SessionReasoningEffortEvent --> _PendingPolicyAskWrites
    SessionReasoningEffortEvent --> _RelayHandle
    SessionReasoningEffortEvent --> SessionLiveness
    SessionReasoningEffortEvent --> _RunnerForwardResult
    SessionReasoningEffortEvent --> _HostLaunchAttempt
    SessionReasoningEffortEvent --> _NativeTerminalEnsureOutcome
    SessionReasoningEffortEvent --> _SessionEventDispatchResult
    SessionResourceListPage --> _MirroredToolCall
    SessionResourceListPage --> _PendingPolicyAskWrites
    SessionResourceListPage --> _RelayHandle
    SessionResourceListPage --> SessionLiveness
    SessionResourceListPage --> _RunnerForwardResult
    SessionResourceListPage --> _HostLaunchAttempt
    SessionResourceListPage --> _NativeTerminalEnsureOutcome
    SessionResourceListPage --> _SessionEventDispatchResult
    SessionResourceObject --> _MirroredToolCall
    SessionResourceObject --> _PendingPolicyAskWrites
    SessionResourceObject --> _RelayHandle
    SessionResourceObject --> SessionLiveness
    SessionResourceObject --> _RunnerForwardResult
    SessionResourceObject --> _HostLaunchAttempt
    SessionResourceObject --> _NativeTerminalEnsureOutcome
    SessionResourceObject --> _SessionEventDispatchResult
    SessionResourcePaginatedList --> _MirroredToolCall
    SessionResourcePaginatedList --> _PendingPolicyAskWrites
    SessionResourcePaginatedList --> _RelayHandle
    SessionResourcePaginatedList --> SessionLiveness
    SessionResourcePaginatedList --> _RunnerForwardResult
    SessionResourcePaginatedList --> _HostLaunchAttempt
    SessionResourcePaginatedList --> _NativeTerminalEnsureOutcome
    SessionResourcePaginatedList --> _SessionEventDispatchResult
    SessionResponse --> _MirroredToolCall
    SessionResponse --> _PendingPolicyAskWrites
    SessionResponse --> _RelayHandle
    SessionResponse --> SessionLiveness
    SessionResponse --> _RunnerForwardResult
    SessionResponse --> _HostLaunchAttempt
    SessionResponse --> _NativeTerminalEnsureOutcome
    SessionResponse --> _SessionEventDispatchResult
    SessionSandboxStatusEvent --> _MirroredToolCall
    SessionSandboxStatusEvent --> _PendingPolicyAskWrites
    SessionSandboxStatusEvent --> _RelayHandle
    SessionSandboxStatusEvent --> SessionLiveness
    SessionSandboxStatusEvent --> _RunnerForwardResult
    SessionSandboxStatusEvent --> _HostLaunchAttempt
    SessionSandboxStatusEvent --> _NativeTerminalEnsureOutcome
    SessionSandboxStatusEvent --> _SessionEventDispatchResult
    SessionSkillsEvent --> _MirroredToolCall
    SessionSkillsEvent --> _PendingPolicyAskWrites
    SessionSkillsEvent --> _RelayHandle
    SessionSkillsEvent --> SessionLiveness
    SessionSkillsEvent --> _RunnerForwardResult
    SessionSkillsEvent --> _HostLaunchAttempt
    SessionSkillsEvent --> _NativeTerminalEnsureOutcome
    SessionSkillsEvent --> _SessionEventDispatchResult
    SessionSupersededEvent --> _MirroredToolCall
    SessionSupersededEvent --> _PendingPolicyAskWrites
    SessionSupersededEvent --> _RelayHandle
    SessionSupersededEvent --> SessionLiveness
    SessionSupersededEvent --> _RunnerForwardResult
    SessionSupersededEvent --> _HostLaunchAttempt
    SessionSupersededEvent --> _NativeTerminalEnsureOutcome
    SessionSupersededEvent --> _SessionEventDispatchResult
    SessionSwitchAgentRequest --> _MirroredToolCall
    SessionSwitchAgentRequest --> _PendingPolicyAskWrites
    SessionSwitchAgentRequest --> _RelayHandle
    SessionSwitchAgentRequest --> SessionLiveness
    SessionSwitchAgentRequest --> _RunnerForwardResult
    SessionSwitchAgentRequest --> _HostLaunchAttempt
    SessionSwitchAgentRequest --> _NativeTerminalEnsureOutcome
    SessionSwitchAgentRequest --> _SessionEventDispatchResult
    SessionTerminalPendingEvent --> _MirroredToolCall
    SessionTerminalPendingEvent --> _PendingPolicyAskWrites
    SessionTerminalPendingEvent --> _RelayHandle
    SessionTerminalPendingEvent --> SessionLiveness
    SessionTerminalPendingEvent --> _RunnerForwardResult
    SessionTerminalPendingEvent --> _HostLaunchAttempt
    SessionTerminalPendingEvent --> _NativeTerminalEnsureOutcome
    SessionTerminalPendingEvent --> _SessionEventDispatchResult
    SessionTodosEvent --> _MirroredToolCall
    SessionTodosEvent --> _PendingPolicyAskWrites
    SessionTodosEvent --> _RelayHandle
    SessionTodosEvent --> SessionLiveness
    SessionTodosEvent --> _RunnerForwardResult
    SessionTodosEvent --> _HostLaunchAttempt
    SessionTodosEvent --> _NativeTerminalEnsureOutcome
    SessionTodosEvent --> _SessionEventDispatchResult
    SessionUsageEvent --> _MirroredToolCall
    SessionUsageEvent --> _PendingPolicyAskWrites
    SessionUsageEvent --> _RelayHandle
    SessionUsageEvent --> SessionLiveness
    SessionUsageEvent --> _RunnerForwardResult
    SessionUsageEvent --> _HostLaunchAttempt
    SessionUsageEvent --> _NativeTerminalEnsureOutcome
    SessionUsageEvent --> _SessionEventDispatchResult
    SkillSummary --> _MirroredToolCall
    SkillSummary --> _PendingPolicyAskWrites
    SkillSummary --> _RelayHandle
    SkillSummary --> SessionLiveness
    SkillSummary --> _RunnerForwardResult
    SkillSummary --> _HostLaunchAttempt
    SkillSummary --> _NativeTerminalEnsureOutcome
    SkillSummary --> _SessionEventDispatchResult
    UpdateSessionRequest --> _MirroredToolCall
    UpdateSessionRequest --> _PendingPolicyAskWrites
    UpdateSessionRequest --> _RelayHandle
    UpdateSessionRequest --> SessionLiveness
    UpdateSessionRequest --> _RunnerForwardResult
    UpdateSessionRequest --> _HostLaunchAttempt
    UpdateSessionRequest --> _NativeTerminalEnsureOutcome
    UpdateSessionRequest --> _SessionEventDispatchResult
    UpsertMCPServerRequest --> _McpLocation
    _McpLocation --> AgentCache
    _McpLocation --> AuthProvider
    _McpLocation --> MCPServerSummary
    _McpLocation --> SessionAgentChangedEvent
    _McpLocation --> UpsertMCPServerRequest
    _McpLocation --> RunnerRouter
    _HostLaunchAttempt --> FunctionCallData
    _HostLaunchAttempt --> FunctionCallOutputData
    _HostLaunchAttempt --> SessionPermission
    _HostLaunchAttempt --> ElicitationDeclinedError
    _HostLaunchAttempt --> NativeCodingAgent
    _HostLaunchAttempt --> ElicitationRequest
    _HostLaunchAttempt --> EvaluationContext
    _HostLaunchAttempt --> PolicyAction
    _HostLaunchAttempt --> PolicyResult
    _HostLaunchAttempt --> RunnerRouter
    _HostLaunchAttempt --> TunnelRegistry
    _HostLaunchAttempt --> AgentCache
    _HostLaunchAttempt --> PolicyEngine
    _HostLaunchAttempt --> AuthProvider
    _HostLaunchAttempt --> HostConnection
    _HostLaunchAttempt --> HostRegistry
    _HostLaunchAttempt --> RunnerExitReports
    _HostLaunchAttempt --> ManagedHostLaunch
    _HostLaunchAttempt --> ManagedLaunch
    _HostLaunchAttempt --> ManagedLaunchTracker
    _HostLaunchAttempt --> ManagedSandboxConfig
    _HostLaunchAttempt --> RepoWorkspace
    _HostLaunchAttempt --> ServerMcpPool
    _HostLaunchAttempt --> CreatedWorktree
    _HostLaunchAttempt --> AgentObject
    _HostLaunchAttempt --> ChildSessionList
    _HostLaunchAttempt --> ChildSessionSummary
    _HostLaunchAttempt --> ConversationDeleted
    _HostLaunchAttempt --> CreatedSessionResponse
    _HostLaunchAttempt --> ElicitationRequestParams
    _HostLaunchAttempt --> ElicitationResult
    _HostLaunchAttempt --> ErrorDetail
    _HostLaunchAttempt --> GrantPermissionRequest
    _HostLaunchAttempt --> MCPServerSummary
    _HostLaunchAttempt --> ModelUsage
    _HostLaunchAttempt --> PaginatedList
    _HostLaunchAttempt --> PermissionObject
    _HostLaunchAttempt --> PolicySummary
    _HostLaunchAttempt --> ReadStatePutRequest
    _HostLaunchAttempt --> ResponseObject
    _HostLaunchAttempt --> SandboxStatus
    _HostLaunchAttempt --> SessionAgentChangedEvent
    _HostLaunchAttempt --> SessionCollaborationModeEvent
    _HostLaunchAttempt --> SessionCreatedEvent
    _HostLaunchAttempt --> SessionCreateMetadata
    _HostLaunchAttempt --> SessionCreateRequest
    _HostLaunchAttempt --> SessionEventInput
    _HostLaunchAttempt --> SessionForkRequest
    _HostLaunchAttempt --> SessionGitOptions
    _HostLaunchAttempt --> SessionInputConsumedPayload
    _HostLaunchAttempt --> SessionInterruptedEvent
    _HostLaunchAttempt --> SessionInterruptedPayload
    _HostLaunchAttempt --> SessionLabelsResponse
    _HostLaunchAttempt --> SessionList
    _HostLaunchAttempt --> SessionListItem
    _HostLaunchAttempt --> SessionModelEvent
    _HostLaunchAttempt --> SessionModelOptionsEvent
    _HostLaunchAttempt --> SessionReasoningEffortEvent
    _HostLaunchAttempt --> SessionResourceListPage
    _HostLaunchAttempt --> SessionResourceObject
    _HostLaunchAttempt --> SessionResourcePaginatedList
    _HostLaunchAttempt --> SessionResponse
    _HostLaunchAttempt --> SessionSandboxStatusEvent
    _HostLaunchAttempt --> SessionSkillsEvent
    _HostLaunchAttempt --> SessionSupersededEvent
    _HostLaunchAttempt --> SessionSwitchAgentRequest
    _HostLaunchAttempt --> SessionTerminalPendingEvent
    _HostLaunchAttempt --> SessionTodosEvent
    _HostLaunchAttempt --> SessionUsageEvent
    _HostLaunchAttempt --> SkillSummary
    _HostLaunchAttempt --> UpdateSessionRequest
    _HostLaunchAttempt --> FunctionPolicySpec
    _HostLaunchAttempt --> Phase
    _HostLaunchAttempt --> PolicySpec
    _HostLaunchAttempt --> StateUpdate
    _HostLaunchAttempt --> Host
    _HostLaunchAttempt --> HostStore
    _HostLaunchAttempt --> ResourceEventData
    _HostLaunchAttempt --> WorkspaceValidationError
    _HostLaunchAttempt --> HostLaunchRunnerFrame
    _HostLaunchAttempt --> HostStopRunnerFrame
    _HostLaunchAttempt --> SubagentBlockNotifier
    _HostLaunchAttempt --> WorktreeError
    _HostLaunchAttempt --> WorktreeHostUnavailableError
    _HostLaunchAttempt --> WorktreeProxyError
    _MirroredToolCall --> FunctionCallData
    _MirroredToolCall --> FunctionCallOutputData
    _MirroredToolCall --> SessionPermission
    _MirroredToolCall --> ElicitationDeclinedError
    _MirroredToolCall --> NativeCodingAgent
    _MirroredToolCall --> ElicitationRequest
    _MirroredToolCall --> EvaluationContext
    _MirroredToolCall --> PolicyAction
    _MirroredToolCall --> PolicyResult
    _MirroredToolCall --> RunnerRouter
    _MirroredToolCall --> TunnelRegistry
    _MirroredToolCall --> AgentCache
    _MirroredToolCall --> PolicyEngine
    _MirroredToolCall --> AuthProvider
    _MirroredToolCall --> HostConnection
    _MirroredToolCall --> HostRegistry
    _MirroredToolCall --> RunnerExitReports
    _MirroredToolCall --> ManagedHostLaunch
    _MirroredToolCall --> ManagedLaunch
    _MirroredToolCall --> ManagedLaunchTracker
    _MirroredToolCall --> ManagedSandboxConfig
    _MirroredToolCall --> RepoWorkspace
    _MirroredToolCall --> ServerMcpPool
    _MirroredToolCall --> CreatedWorktree
    _MirroredToolCall --> AgentObject
    _MirroredToolCall --> ChildSessionList
    _MirroredToolCall --> ChildSessionSummary
    _MirroredToolCall --> ConversationDeleted
    _MirroredToolCall --> CreatedSessionResponse
    _MirroredToolCall --> ElicitationRequestParams
    _MirroredToolCall --> ElicitationResult
    _MirroredToolCall --> ErrorDetail
    _MirroredToolCall --> GrantPermissionRequest
    _MirroredToolCall --> MCPServerSummary
    _MirroredToolCall --> ModelUsage
    _MirroredToolCall --> PaginatedList
    _MirroredToolCall --> PermissionObject
    _MirroredToolCall --> PolicySummary
    _MirroredToolCall --> ReadStatePutRequest
    _MirroredToolCall --> ResponseObject
    _MirroredToolCall --> SandboxStatus
    _MirroredToolCall --> SessionAgentChangedEvent
    _MirroredToolCall --> SessionCollaborationModeEvent
    _MirroredToolCall --> SessionCreatedEvent
    _MirroredToolCall --> SessionCreateMetadata
    _MirroredToolCall --> SessionCreateRequest
    _MirroredToolCall --> SessionEventInput
    _MirroredToolCall --> SessionForkRequest
    _MirroredToolCall --> SessionGitOptions
    _MirroredToolCall --> SessionInputConsumedPayload
    _MirroredToolCall --> SessionInterruptedEvent
    _MirroredToolCall --> SessionInterruptedPayload
    _MirroredToolCall --> SessionLabelsResponse
    _MirroredToolCall --> SessionList
    _MirroredToolCall --> SessionListItem
    _MirroredToolCall --> SessionModelEvent
    _MirroredToolCall --> SessionModelOptionsEvent
    _MirroredToolCall --> SessionReasoningEffortEvent
    _MirroredToolCall --> SessionResourceListPage
    _MirroredToolCall --> SessionResourceObject
    _MirroredToolCall --> SessionResourcePaginatedList
    _MirroredToolCall --> SessionResponse
    _MirroredToolCall --> SessionSandboxStatusEvent
    _MirroredToolCall --> SessionSkillsEvent
    _MirroredToolCall --> SessionSupersededEvent
    _MirroredToolCall --> SessionSwitchAgentRequest
    _MirroredToolCall --> SessionTerminalPendingEvent
    _MirroredToolCall --> SessionTodosEvent
    _MirroredToolCall --> SessionUsageEvent
    _MirroredToolCall --> SkillSummary
    _MirroredToolCall --> UpdateSessionRequest
    _MirroredToolCall --> FunctionPolicySpec
    _MirroredToolCall --> Phase
    _MirroredToolCall --> PolicySpec
    _MirroredToolCall --> StateUpdate
    _MirroredToolCall --> Host
    _MirroredToolCall --> HostStore
    _MirroredToolCall --> ResourceEventData
    _MirroredToolCall --> WorkspaceValidationError
    _MirroredToolCall --> HostLaunchRunnerFrame
    _MirroredToolCall --> HostStopRunnerFrame
    _MirroredToolCall --> SubagentBlockNotifier
    _MirroredToolCall --> WorktreeError
    _MirroredToolCall --> WorktreeHostUnavailableError
    _MirroredToolCall --> WorktreeProxyError
    _NativeTerminalEnsureOutcome --> FunctionCallData
    _NativeTerminalEnsureOutcome --> FunctionCallOutputData
    _NativeTerminalEnsureOutcome --> SessionPermission
    _NativeTerminalEnsureOutcome --> ElicitationDeclinedError
    _NativeTerminalEnsureOutcome --> NativeCodingAgent
    _NativeTerminalEnsureOutcome --> ElicitationRequest
    _NativeTerminalEnsureOutcome --> EvaluationContext
    _NativeTerminalEnsureOutcome --> PolicyAction
    _NativeTerminalEnsureOutcome --> PolicyResult
    _NativeTerminalEnsureOutcome --> RunnerRouter
    _NativeTerminalEnsureOutcome --> TunnelRegistry
    _NativeTerminalEnsureOutcome --> AgentCache
    _NativeTerminalEnsureOutcome --> PolicyEngine
    _NativeTerminalEnsureOutcome --> AuthProvider
    _NativeTerminalEnsureOutcome --> HostConnection
    _NativeTerminalEnsureOutcome --> HostRegistry
    _NativeTerminalEnsureOutcome --> RunnerExitReports
    _NativeTerminalEnsureOutcome --> ManagedHostLaunch
    _NativeTerminalEnsureOutcome --> ManagedLaunch
    _NativeTerminalEnsureOutcome --> ManagedLaunchTracker
    _NativeTerminalEnsureOutcome --> ManagedSandboxConfig
    _NativeTerminalEnsureOutcome --> RepoWorkspace
    _NativeTerminalEnsureOutcome --> ServerMcpPool
    _NativeTerminalEnsureOutcome --> CreatedWorktree
    _NativeTerminalEnsureOutcome --> AgentObject
    _NativeTerminalEnsureOutcome --> ChildSessionList
    _NativeTerminalEnsureOutcome --> ChildSessionSummary
    _NativeTerminalEnsureOutcome --> ConversationDeleted
    _NativeTerminalEnsureOutcome --> CreatedSessionResponse
    _NativeTerminalEnsureOutcome --> ElicitationRequestParams
    _NativeTerminalEnsureOutcome --> ElicitationResult
    _NativeTerminalEnsureOutcome --> ErrorDetail
    _NativeTerminalEnsureOutcome --> GrantPermissionRequest
    _NativeTerminalEnsureOutcome --> MCPServerSummary
    _NativeTerminalEnsureOutcome --> ModelUsage
    _NativeTerminalEnsureOutcome --> PaginatedList
    _NativeTerminalEnsureOutcome --> PermissionObject
    _NativeTerminalEnsureOutcome --> PolicySummary
    _NativeTerminalEnsureOutcome --> ReadStatePutRequest
    _NativeTerminalEnsureOutcome --> ResponseObject
    _NativeTerminalEnsureOutcome --> SandboxStatus
    _NativeTerminalEnsureOutcome --> SessionAgentChangedEvent
    _NativeTerminalEnsureOutcome --> SessionCollaborationModeEvent
    _NativeTerminalEnsureOutcome --> SessionCreatedEvent
    _NativeTerminalEnsureOutcome --> SessionCreateMetadata
    _NativeTerminalEnsureOutcome --> SessionCreateRequest
    _NativeTerminalEnsureOutcome --> SessionEventInput
    _NativeTerminalEnsureOutcome --> SessionForkRequest
    _NativeTerminalEnsureOutcome --> SessionGitOptions
    _NativeTerminalEnsureOutcome --> SessionInputConsumedPayload
    _NativeTerminalEnsureOutcome --> SessionInterruptedEvent
    _NativeTerminalEnsureOutcome --> SessionInterruptedPayload
    _NativeTerminalEnsureOutcome --> SessionLabelsResponse
    _NativeTerminalEnsureOutcome --> SessionList
    _NativeTerminalEnsureOutcome --> SessionListItem
    _NativeTerminalEnsureOutcome --> SessionModelEvent
    _NativeTerminalEnsureOutcome --> SessionModelOptionsEvent
    _NativeTerminalEnsureOutcome --> SessionReasoningEffortEvent
    _NativeTerminalEnsureOutcome --> SessionResourceListPage
    _NativeTerminalEnsureOutcome --> SessionResourceObject
    _NativeTerminalEnsureOutcome --> SessionResourcePaginatedList
    _NativeTerminalEnsureOutcome --> SessionResponse
    _NativeTerminalEnsureOutcome --> SessionSandboxStatusEvent
    _NativeTerminalEnsureOutcome --> SessionSkillsEvent
    _NativeTerminalEnsureOutcome --> SessionSupersededEvent
    _NativeTerminalEnsureOutcome --> SessionSwitchAgentRequest
    _NativeTerminalEnsureOutcome --> SessionTerminalPendingEvent
    _NativeTerminalEnsureOutcome --> SessionTodosEvent
    _NativeTerminalEnsureOutcome --> SessionUsageEvent
    _NativeTerminalEnsureOutcome --> SkillSummary
    _NativeTerminalEnsureOutcome --> UpdateSessionRequest
    _NativeTerminalEnsureOutcome --> FunctionPolicySpec
    _NativeTerminalEnsureOutcome --> Phase
    _NativeTerminalEnsureOutcome --> PolicySpec
    _NativeTerminalEnsureOutcome --> StateUpdate
    _NativeTerminalEnsureOutcome --> Host
    _NativeTerminalEnsureOutcome --> HostStore
    _NativeTerminalEnsureOutcome --> ResourceEventData
    _NativeTerminalEnsureOutcome --> WorkspaceValidationError
    _NativeTerminalEnsureOutcome --> HostLaunchRunnerFrame
    _NativeTerminalEnsureOutcome --> HostStopRunnerFrame
    _NativeTerminalEnsureOutcome --> SubagentBlockNotifier
    _NativeTerminalEnsureOutcome --> WorktreeError
    _NativeTerminalEnsureOutcome --> WorktreeHostUnavailableError
    _NativeTerminalEnsureOutcome --> WorktreeProxyError
    _PendingPolicyAskWrites --> FunctionCallData
    _PendingPolicyAskWrites --> FunctionCallOutputData
    _PendingPolicyAskWrites --> SessionPermission
    _PendingPolicyAskWrites --> ElicitationDeclinedError
    _PendingPolicyAskWrites --> NativeCodingAgent
    _PendingPolicyAskWrites --> ElicitationRequest
    _PendingPolicyAskWrites --> EvaluationContext
    _PendingPolicyAskWrites --> PolicyAction
    _PendingPolicyAskWrites --> PolicyResult
    _PendingPolicyAskWrites --> RunnerRouter
    _PendingPolicyAskWrites --> TunnelRegistry
    _PendingPolicyAskWrites --> AgentCache
    _PendingPolicyAskWrites --> PolicyEngine
    _PendingPolicyAskWrites --> AuthProvider
    _PendingPolicyAskWrites --> HostConnection
    _PendingPolicyAskWrites --> HostRegistry
    _PendingPolicyAskWrites --> RunnerExitReports
    _PendingPolicyAskWrites --> ManagedHostLaunch
    _PendingPolicyAskWrites --> ManagedLaunch
    _PendingPolicyAskWrites --> ManagedLaunchTracker
    _PendingPolicyAskWrites --> ManagedSandboxConfig
    _PendingPolicyAskWrites --> RepoWorkspace
    _PendingPolicyAskWrites --> ServerMcpPool
    _PendingPolicyAskWrites --> CreatedWorktree
    _PendingPolicyAskWrites --> AgentObject
    _PendingPolicyAskWrites --> ChildSessionList
    _PendingPolicyAskWrites --> ChildSessionSummary
    _PendingPolicyAskWrites --> ConversationDeleted
    _PendingPolicyAskWrites --> CreatedSessionResponse
    _PendingPolicyAskWrites --> ElicitationRequestParams
    _PendingPolicyAskWrites --> ElicitationResult
    _PendingPolicyAskWrites --> ErrorDetail
    _PendingPolicyAskWrites --> GrantPermissionRequest
    _PendingPolicyAskWrites --> MCPServerSummary
    _PendingPolicyAskWrites --> ModelUsage
    _PendingPolicyAskWrites --> PaginatedList
    _PendingPolicyAskWrites --> PermissionObject
    _PendingPolicyAskWrites --> PolicySummary
    _PendingPolicyAskWrites --> ReadStatePutRequest
    _PendingPolicyAskWrites --> ResponseObject
    _PendingPolicyAskWrites --> SandboxStatus
    _PendingPolicyAskWrites --> SessionAgentChangedEvent
    _PendingPolicyAskWrites --> SessionCollaborationModeEvent
    _PendingPolicyAskWrites --> SessionCreatedEvent
    _PendingPolicyAskWrites --> SessionCreateMetadata
    _PendingPolicyAskWrites --> SessionCreateRequest
    _PendingPolicyAskWrites --> SessionEventInput
    _PendingPolicyAskWrites --> SessionForkRequest
    _PendingPolicyAskWrites --> SessionGitOptions
    _PendingPolicyAskWrites --> SessionInputConsumedPayload
    _PendingPolicyAskWrites --> SessionInterruptedEvent
    _PendingPolicyAskWrites --> SessionInterruptedPayload
    _PendingPolicyAskWrites --> SessionLabelsResponse
    _PendingPolicyAskWrites --> SessionList
    _PendingPolicyAskWrites --> SessionListItem
    _PendingPolicyAskWrites --> SessionModelEvent
    _PendingPolicyAskWrites --> SessionModelOptionsEvent
    _PendingPolicyAskWrites --> SessionReasoningEffortEvent
    _PendingPolicyAskWrites --> SessionResourceListPage
    _PendingPolicyAskWrites --> SessionResourceObject
    _PendingPolicyAskWrites --> SessionResourcePaginatedList
    _PendingPolicyAskWrites --> SessionResponse
    _PendingPolicyAskWrites --> SessionSandboxStatusEvent
    _PendingPolicyAskWrites --> SessionSkillsEvent
    _PendingPolicyAskWrites --> SessionSupersededEvent
    _PendingPolicyAskWrites --> SessionSwitchAgentRequest
    _PendingPolicyAskWrites --> SessionTerminalPendingEvent
    _PendingPolicyAskWrites --> SessionTodosEvent
    _PendingPolicyAskWrites --> SessionUsageEvent
    _PendingPolicyAskWrites --> SkillSummary
    _PendingPolicyAskWrites --> UpdateSessionRequest
    _PendingPolicyAskWrites --> FunctionPolicySpec
    _PendingPolicyAskWrites --> Phase
    _PendingPolicyAskWrites --> PolicySpec
    _PendingPolicyAskWrites --> StateUpdate
    _PendingPolicyAskWrites --> Host
    _PendingPolicyAskWrites --> HostStore
    _PendingPolicyAskWrites --> ResourceEventData
    _PendingPolicyAskWrites --> WorkspaceValidationError
    _PendingPolicyAskWrites --> HostLaunchRunnerFrame
    _PendingPolicyAskWrites --> HostStopRunnerFrame
    _PendingPolicyAskWrites --> SubagentBlockNotifier
    _PendingPolicyAskWrites --> WorktreeError
    _PendingPolicyAskWrites --> WorktreeHostUnavailableError
    _PendingPolicyAskWrites --> WorktreeProxyError
    _RelayHandle --> FunctionCallData
    _RelayHandle --> FunctionCallOutputData
    _RelayHandle --> SessionPermission
    _RelayHandle --> ElicitationDeclinedError
    _RelayHandle --> NativeCodingAgent
    _RelayHandle --> ElicitationRequest
    _RelayHandle --> EvaluationContext
    _RelayHandle --> PolicyAction
    _RelayHandle --> PolicyResult
    _RelayHandle --> RunnerRouter
    _RelayHandle --> TunnelRegistry
    _RelayHandle --> AgentCache
    _RelayHandle --> PolicyEngine
    _RelayHandle --> AuthProvider
    _RelayHandle --> HostConnection
    _RelayHandle --> HostRegistry
    _RelayHandle --> RunnerExitReports
    _RelayHandle --> ManagedHostLaunch
    _RelayHandle --> ManagedLaunch
    _RelayHandle --> ManagedLaunchTracker
    _RelayHandle --> ManagedSandboxConfig
    _RelayHandle --> RepoWorkspace
    _RelayHandle --> ServerMcpPool
    _RelayHandle --> CreatedWorktree
    _RelayHandle --> AgentObject
    _RelayHandle --> ChildSessionList
    _RelayHandle --> ChildSessionSummary
    _RelayHandle --> ConversationDeleted
    _RelayHandle --> CreatedSessionResponse
    _RelayHandle --> ElicitationRequestParams
    _RelayHandle --> ElicitationResult
    _RelayHandle --> ErrorDetail
    _RelayHandle --> GrantPermissionRequest
    _RelayHandle --> MCPServerSummary
    _RelayHandle --> ModelUsage
    _RelayHandle --> PaginatedList
    _RelayHandle --> PermissionObject
    _RelayHandle --> PolicySummary
    _RelayHandle --> ReadStatePutRequest
    _RelayHandle --> ResponseObject
    _RelayHandle --> SandboxStatus
    _RelayHandle --> SessionAgentChangedEvent
    _RelayHandle --> SessionCollaborationModeEvent
    _RelayHandle --> SessionCreatedEvent
    _RelayHandle --> SessionCreateMetadata
    _RelayHandle --> SessionCreateRequest
    _RelayHandle --> SessionEventInput
    _RelayHandle --> SessionForkRequest
    _RelayHandle --> SessionGitOptions
    _RelayHandle --> SessionInputConsumedPayload
    _RelayHandle --> SessionInterruptedEvent
    _RelayHandle --> SessionInterruptedPayload
    _RelayHandle --> SessionLabelsResponse
    _RelayHandle --> SessionList
    _RelayHandle --> SessionListItem
    _RelayHandle --> SessionModelEvent
    _RelayHandle --> SessionModelOptionsEvent
    _RelayHandle --> SessionReasoningEffortEvent
    _RelayHandle --> SessionResourceListPage
    _RelayHandle --> SessionResourceObject
    _RelayHandle --> SessionResourcePaginatedList
    _RelayHandle --> SessionResponse
    _RelayHandle --> SessionSandboxStatusEvent
    _RelayHandle --> SessionSkillsEvent
    _RelayHandle --> SessionSupersededEvent
    _RelayHandle --> SessionSwitchAgentRequest
    _RelayHandle --> SessionTerminalPendingEvent
    _RelayHandle --> SessionTodosEvent
    _RelayHandle --> SessionUsageEvent
    _RelayHandle --> SkillSummary
    _RelayHandle --> UpdateSessionRequest
    _RelayHandle --> FunctionPolicySpec
    _RelayHandle --> Phase
    _RelayHandle --> PolicySpec
    _RelayHandle --> StateUpdate
    _RelayHandle --> Host
    _RelayHandle --> HostStore
    _RelayHandle --> ResourceEventData
    _RelayHandle --> WorkspaceValidationError
    _RelayHandle --> HostLaunchRunnerFrame
    _RelayHandle --> HostStopRunnerFrame
    _RelayHandle --> SubagentBlockNotifier
    _RelayHandle --> WorktreeError
    _RelayHandle --> WorktreeHostUnavailableError
    _RelayHandle --> WorktreeProxyError
    _RunnerForwardResult --> FunctionCallData
    _RunnerForwardResult --> FunctionCallOutputData
    _RunnerForwardResult --> SessionPermission
    _RunnerForwardResult --> ElicitationDeclinedError
    _RunnerForwardResult --> NativeCodingAgent
    _RunnerForwardResult --> ElicitationRequest
    _RunnerForwardResult --> EvaluationContext
    _RunnerForwardResult --> PolicyAction
    _RunnerForwardResult --> PolicyResult
    _RunnerForwardResult --> RunnerRouter
    _RunnerForwardResult --> TunnelRegistry
    _RunnerForwardResult --> AgentCache
    _RunnerForwardResult --> PolicyEngine
    _RunnerForwardResult --> AuthProvider
    _RunnerForwardResult --> HostConnection
    _RunnerForwardResult --> HostRegistry
    _RunnerForwardResult --> RunnerExitReports
    _RunnerForwardResult --> ManagedHostLaunch
    _RunnerForwardResult --> ManagedLaunch
    _RunnerForwardResult --> ManagedLaunchTracker
    _RunnerForwardResult --> ManagedSandboxConfig
    _RunnerForwardResult --> RepoWorkspace
    _RunnerForwardResult --> ServerMcpPool
    _RunnerForwardResult --> CreatedWorktree
    _RunnerForwardResult --> AgentObject
    _RunnerForwardResult --> ChildSessionList
    _RunnerForwardResult --> ChildSessionSummary
    _RunnerForwardResult --> ConversationDeleted
    _RunnerForwardResult --> CreatedSessionResponse
    _RunnerForwardResult --> ElicitationRequestParams
    _RunnerForwardResult --> ElicitationResult
    _RunnerForwardResult --> ErrorDetail
    _RunnerForwardResult --> GrantPermissionRequest
    _RunnerForwardResult --> MCPServerSummary
    _RunnerForwardResult --> ModelUsage
    _RunnerForwardResult --> PaginatedList
    _RunnerForwardResult --> PermissionObject
    _RunnerForwardResult --> PolicySummary
    _RunnerForwardResult --> ReadStatePutRequest
    _RunnerForwardResult --> ResponseObject
    _RunnerForwardResult --> SandboxStatus
    _RunnerForwardResult --> SessionAgentChangedEvent
    _RunnerForwardResult --> SessionCollaborationModeEvent
    _RunnerForwardResult --> SessionCreatedEvent
    _RunnerForwardResult --> SessionCreateMetadata
    _RunnerForwardResult --> SessionCreateRequest
    _RunnerForwardResult --> SessionEventInput
    _RunnerForwardResult --> SessionForkRequest
    _RunnerForwardResult --> SessionGitOptions
    _RunnerForwardResult --> SessionInputConsumedPayload
    _RunnerForwardResult --> SessionInterruptedEvent
    _RunnerForwardResult --> SessionInterruptedPayload
    _RunnerForwardResult --> SessionLabelsResponse
    _RunnerForwardResult --> SessionList
    _RunnerForwardResult --> SessionListItem
    _RunnerForwardResult --> SessionModelEvent
    _RunnerForwardResult --> SessionModelOptionsEvent
    _RunnerForwardResult --> SessionReasoningEffortEvent
    _RunnerForwardResult --> SessionResourceListPage
    _RunnerForwardResult --> SessionResourceObject
    _RunnerForwardResult --> SessionResourcePaginatedList
    _RunnerForwardResult --> SessionResponse
    _RunnerForwardResult --> SessionSandboxStatusEvent
    _RunnerForwardResult --> SessionSkillsEvent
    _RunnerForwardResult --> SessionSupersededEvent
    _RunnerForwardResult --> SessionSwitchAgentRequest
    _RunnerForwardResult --> SessionTerminalPendingEvent
    _RunnerForwardResult --> SessionTodosEvent
    _RunnerForwardResult --> SessionUsageEvent
    _RunnerForwardResult --> SkillSummary
    _RunnerForwardResult --> UpdateSessionRequest
    _RunnerForwardResult --> FunctionPolicySpec
    _RunnerForwardResult --> Phase
    _RunnerForwardResult --> PolicySpec
    _RunnerForwardResult --> StateUpdate
    _RunnerForwardResult --> Host
    _RunnerForwardResult --> HostStore
    _RunnerForwardResult --> ResourceEventData
    _RunnerForwardResult --> WorkspaceValidationError
    _RunnerForwardResult --> HostLaunchRunnerFrame
    _RunnerForwardResult --> HostStopRunnerFrame
    _RunnerForwardResult --> SubagentBlockNotifier
    _RunnerForwardResult --> WorktreeError
    _RunnerForwardResult --> WorktreeHostUnavailableError
    _RunnerForwardResult --> WorktreeProxyError
    _SessionEventDispatchResult --> FunctionCallData
    _SessionEventDispatchResult --> FunctionCallOutputData
    _SessionEventDispatchResult --> SessionPermission
    _SessionEventDispatchResult --> ElicitationDeclinedError
    _SessionEventDispatchResult --> NativeCodingAgent
    _SessionEventDispatchResult --> ElicitationRequest
    _SessionEventDispatchResult --> EvaluationContext
    _SessionEventDispatchResult --> PolicyAction
    _SessionEventDispatchResult --> PolicyResult
    _SessionEventDispatchResult --> RunnerRouter
    _SessionEventDispatchResult --> TunnelRegistry
    _SessionEventDispatchResult --> AgentCache
    _SessionEventDispatchResult --> PolicyEngine
    _SessionEventDispatchResult --> AuthProvider
    _SessionEventDispatchResult --> HostConnection
    _SessionEventDispatchResult --> HostRegistry
    _SessionEventDispatchResult --> RunnerExitReports
    _SessionEventDispatchResult --> ManagedHostLaunch
    _SessionEventDispatchResult --> ManagedLaunch
    _SessionEventDispatchResult --> ManagedLaunchTracker
    _SessionEventDispatchResult --> ManagedSandboxConfig
    _SessionEventDispatchResult --> RepoWorkspace
    _SessionEventDispatchResult --> ServerMcpPool
    _SessionEventDispatchResult --> CreatedWorktree
    _SessionEventDispatchResult --> AgentObject
    _SessionEventDispatchResult --> ChildSessionList
    _SessionEventDispatchResult --> ChildSessionSummary
    _SessionEventDispatchResult --> ConversationDeleted
    _SessionEventDispatchResult --> CreatedSessionResponse
    _SessionEventDispatchResult --> ElicitationRequestParams
    _SessionEventDispatchResult --> ElicitationResult
    _SessionEventDispatchResult --> ErrorDetail
    _SessionEventDispatchResult --> GrantPermissionRequest
    _SessionEventDispatchResult --> MCPServerSummary
    _SessionEventDispatchResult --> ModelUsage
    _SessionEventDispatchResult --> PaginatedList
    _SessionEventDispatchResult --> PermissionObject
    _SessionEventDispatchResult --> PolicySummary
    _SessionEventDispatchResult --> ReadStatePutRequest
    _SessionEventDispatchResult --> ResponseObject
    _SessionEventDispatchResult --> SandboxStatus
    _SessionEventDispatchResult --> SessionAgentChangedEvent
    _SessionEventDispatchResult --> SessionCollaborationModeEvent
    _SessionEventDispatchResult --> SessionCreatedEvent
    _SessionEventDispatchResult --> SessionCreateMetadata
    _SessionEventDispatchResult --> SessionCreateRequest
    _SessionEventDispatchResult --> SessionEventInput
    _SessionEventDispatchResult --> SessionForkRequest
    _SessionEventDispatchResult --> SessionGitOptions
    _SessionEventDispatchResult --> SessionInputConsumedPayload
    _SessionEventDispatchResult --> SessionInterruptedEvent
    _SessionEventDispatchResult --> SessionInterruptedPayload
    _SessionEventDispatchResult --> SessionLabelsResponse
    _SessionEventDispatchResult --> SessionList
    _SessionEventDispatchResult --> SessionListItem
    _SessionEventDispatchResult --> SessionModelEvent
    _SessionEventDispatchResult --> SessionModelOptionsEvent
    _SessionEventDispatchResult --> SessionReasoningEffortEvent
    _SessionEventDispatchResult --> SessionResourceListPage
    _SessionEventDispatchResult --> SessionResourceObject
    _SessionEventDispatchResult --> SessionResourcePaginatedList
    _SessionEventDispatchResult --> SessionResponse
    _SessionEventDispatchResult --> SessionSandboxStatusEvent
    _SessionEventDispatchResult --> SessionSkillsEvent
    _SessionEventDispatchResult --> SessionSupersededEvent
    _SessionEventDispatchResult --> SessionSwitchAgentRequest
    _SessionEventDispatchResult --> SessionTerminalPendingEvent
    _SessionEventDispatchResult --> SessionTodosEvent
    _SessionEventDispatchResult --> SessionUsageEvent
    _SessionEventDispatchResult --> SkillSummary
    _SessionEventDispatchResult --> UpdateSessionRequest
    _SessionEventDispatchResult --> FunctionPolicySpec
    _SessionEventDispatchResult --> Phase
    _SessionEventDispatchResult --> PolicySpec
    _SessionEventDispatchResult --> StateUpdate
    _SessionEventDispatchResult --> Host
    _SessionEventDispatchResult --> HostStore
    _SessionEventDispatchResult --> ResourceEventData
    _SessionEventDispatchResult --> WorkspaceValidationError
    _SessionEventDispatchResult --> HostLaunchRunnerFrame
    _SessionEventDispatchResult --> HostStopRunnerFrame
    _SessionEventDispatchResult --> SubagentBlockNotifier
    _SessionEventDispatchResult --> WorktreeError
    _SessionEventDispatchResult --> WorktreeHostUnavailableError
    _SessionEventDispatchResult --> WorktreeProxyError
    SessionLiveness --> _FastAPICallNext
    SessionLiveness --> _WebSocketMetricsMiddleware
    SessionLiveness --> _SPAStaticFiles
    SessionLiveness --> _RangeAwareGZipMiddleware
    SessionLiveness --> FunctionCallData
    SessionLiveness --> FunctionCallOutputData
    SessionLiveness --> SessionPermission
    SessionLiveness --> ElicitationDeclinedError
    SessionLiveness --> NativeCodingAgent
    SessionLiveness --> ElicitationRequest
    SessionLiveness --> EvaluationContext
    SessionLiveness --> PolicyAction
    SessionLiveness --> PolicyResult
    SessionLiveness --> RunnerRouter
    SessionLiveness --> TunnelRegistry
    SessionLiveness --> AgentCache
    SessionLiveness --> PolicyEngine
    SessionLiveness --> AuthProvider
    SessionLiveness --> HostConnection
    SessionLiveness --> HostRegistry
    SessionLiveness --> RunnerExitReports
    SessionLiveness --> ManagedHostLaunch
    SessionLiveness --> ManagedLaunch
    SessionLiveness --> ManagedLaunchTracker
    SessionLiveness --> ManagedSandboxConfig
    SessionLiveness --> RepoWorkspace
    SessionLiveness --> ServerMcpPool
    SessionLiveness --> CreatedWorktree
    SessionLiveness --> AgentObject
    SessionLiveness --> ChildSessionList
    SessionLiveness --> ChildSessionSummary
    SessionLiveness --> ConversationDeleted
    SessionLiveness --> CreatedSessionResponse
    SessionLiveness --> ElicitationRequestParams
    SessionLiveness --> ElicitationResult
    SessionLiveness --> ErrorDetail
    SessionLiveness --> GrantPermissionRequest
    SessionLiveness --> MCPServerSummary
    SessionLiveness --> ModelUsage
    SessionLiveness --> PaginatedList
    SessionLiveness --> PermissionObject
    SessionLiveness --> PolicySummary
    SessionLiveness --> ReadStatePutRequest
    SessionLiveness --> ResponseObject
    SessionLiveness --> SandboxStatus
    SessionLiveness --> SessionAgentChangedEvent
    SessionLiveness --> SessionCollaborationModeEvent
    SessionLiveness --> SessionCreatedEvent
    SessionLiveness --> SessionCreateMetadata
    SessionLiveness --> SessionCreateRequest
    SessionLiveness --> SessionEventInput
    SessionLiveness --> SessionForkRequest
    SessionLiveness --> SessionGitOptions
    SessionLiveness --> SessionInputConsumedPayload
    SessionLiveness --> SessionInterruptedEvent
    SessionLiveness --> SessionInterruptedPayload
    SessionLiveness --> SessionLabelsResponse
    SessionLiveness --> SessionList
    SessionLiveness --> SessionListItem
    SessionLiveness --> SessionModelEvent
    SessionLiveness --> SessionModelOptionsEvent
    SessionLiveness --> SessionReasoningEffortEvent
    SessionLiveness --> SessionResourceListPage
    SessionLiveness --> SessionResourceObject
    SessionLiveness --> SessionResourcePaginatedList
    SessionLiveness --> SessionResponse
    SessionLiveness --> SessionSandboxStatusEvent
    SessionLiveness --> SessionSkillsEvent
    SessionLiveness --> SessionSupersededEvent
    SessionLiveness --> SessionSwitchAgentRequest
    SessionLiveness --> SessionTerminalPendingEvent
    SessionLiveness --> SessionTodosEvent
    SessionLiveness --> SessionUsageEvent
    SessionLiveness --> SkillSummary
    SessionLiveness --> UpdateSessionRequest
    SessionLiveness --> FunctionPolicySpec
    SessionLiveness --> Phase
    SessionLiveness --> PolicySpec
    SessionLiveness --> StateUpdate
    SessionLiveness --> Host
    SessionLiveness --> HostStore
    SessionLiveness --> ResourceEventData
    SessionLiveness --> WorkspaceValidationError
    SessionLiveness --> HostLaunchRunnerFrame
    SessionLiveness --> HostStopRunnerFrame
    SessionLiveness --> SubagentBlockNotifier
    SessionLiveness --> WorktreeError
    SessionLiveness --> WorktreeHostUnavailableError
    SessionLiveness --> WorktreeProxyError
    SessionLiveness --> _PublishedUsage
    SessionLiveness --> _UsageStreamRecorder
    SessionLiveness --> _NoIdentityAuthProvider
    LLMRoutingClient --> _FirstRunPlan
    LLMRoutingClient --> _OmnigentCLI
    LLMRoutingClient --> _HostDaemonRecord
    LLMRoutingClient --> _HostHttpResult
    LLMRoutingClient --> _HostSessionsTableWidths
    LLMRoutingClient --> _DaemonSessionsResult
    LLMRoutingClient --> _SessionsPageResult
    LLMRoutingClient --> _SessionPagesResult
    LLMRoutingClient --> _SpawnedDaemonProcess
    LLMRoutingClient --> _DaemonReuseDecision
    LLMRoutingClient --> _CliRunnerProcess
    LLMRoutingClient --> _LLMDeploy
    LLMRoutingClient --> _BuiltinEntry
    LLMRoutingClient --> _ToolsDeploy
    LLMRoutingClient --> _ExecutorDeploy
    LLMRoutingClient --> _DeployConfig
    LLMRoutingClient --> _ResumeChoice
    LLMRoutingClient --> _HostGroup
    LLMRoutingClient --> _ConfigGroup
    LLMRoutingClient --> _HarnessMenuRow
    RoutingClient --> RuntimeCaps
    SqlAlchemyAgentStore --> _FirstRunPlan
    SqlAlchemyAgentStore --> _OmnigentCLI
    SqlAlchemyAgentStore --> _HostDaemonRecord
    SqlAlchemyAgentStore --> _HostHttpResult
    SqlAlchemyAgentStore --> _HostSessionsTableWidths
    SqlAlchemyAgentStore --> _DaemonSessionsResult
    SqlAlchemyAgentStore --> _SessionsPageResult
    SqlAlchemyAgentStore --> _SessionPagesResult
    SqlAlchemyAgentStore --> _SpawnedDaemonProcess
    SqlAlchemyAgentStore --> _DaemonReuseDecision
    SqlAlchemyAgentStore --> _CliRunnerProcess
    SqlAlchemyAgentStore --> _LLMDeploy
    SqlAlchemyAgentStore --> _BuiltinEntry
    SqlAlchemyAgentStore --> _ToolsDeploy
    SqlAlchemyAgentStore --> _ExecutorDeploy
    SqlAlchemyAgentStore --> _DeployConfig
    SqlAlchemyAgentStore --> _ResumeChoice
    SqlAlchemyAgentStore --> _HostGroup
    SqlAlchemyAgentStore --> _ConfigGroup
    SqlAlchemyAgentStore --> _HarnessMenuRow
    SqlAlchemyAgentStore --> _ResolvedConfig
    SqlAlchemyAgentStore --> _BuiltApp
    SqlAlchemyAgentStore --> _FakeSessionsNamespace
    SqlAlchemyAgentStore --> _FakeConversationsNamespace
    SqlAlchemyAgentStore --> _FakeAPClient
    SqlAlchemyAgentStore --> ControllableMockClient
    SqlAlchemyAgentStore --> _FakeReq
    SqlAlchemyAgentStore --> _StubWebSocket
    SqlAlchemyAgentStore --> _LivenessApp
    SqlAlchemyAgentStore --> _SeedStores
    SqlAlchemyAgentStore --> _EntrypointFakeLauncher
    SqlAlchemyAgentStore --> _StubAuthProvider
    SqlAlchemyAgentStore --> _FakeWebSocket
    SqlAlchemyAgentStore --> _HostCapture
    SqlAlchemyAgentStore --> ManagedSessionEnv
    SqlAlchemyAgentStore --> _CaptureRunnerClient
    SqlAlchemyAgentStore --> _InputRequiredRunnerClient
    SqlAlchemyAgentStore --> _ForwardedEffort
    SqlAlchemyAgentStore --> _CaptureRunnerClient
    SqlAlchemyAgentStore --> FakeProcessManager
    SqlAlchemyAgentStore --> _TunnelStack
    SqlAlchemyAgentStore --> _NoopRunnerWS
    SqlAlchemyAgentStore --> _FakeUpload
    SqlAlchemyAgentStore --> _NoIdentityAuthProvider
    SqlAlchemyCommentStore --> _FirstRunPlan
    SqlAlchemyCommentStore --> _OmnigentCLI
    SqlAlchemyCommentStore --> _HostDaemonRecord
    SqlAlchemyCommentStore --> _HostHttpResult
    SqlAlchemyCommentStore --> _HostSessionsTableWidths
    SqlAlchemyCommentStore --> _DaemonSessionsResult
    SqlAlchemyCommentStore --> _SessionsPageResult
    SqlAlchemyCommentStore --> _SessionPagesResult
    SqlAlchemyCommentStore --> _SpawnedDaemonProcess
    SqlAlchemyCommentStore --> _DaemonReuseDecision
    SqlAlchemyCommentStore --> _CliRunnerProcess
    SqlAlchemyCommentStore --> _LLMDeploy
    SqlAlchemyCommentStore --> _BuiltinEntry
    SqlAlchemyCommentStore --> _ToolsDeploy
    SqlAlchemyCommentStore --> _ExecutorDeploy
    SqlAlchemyCommentStore --> _DeployConfig
    SqlAlchemyCommentStore --> _ResumeChoice
    SqlAlchemyCommentStore --> _HostGroup
    SqlAlchemyCommentStore --> _ConfigGroup
    SqlAlchemyCommentStore --> _HarnessMenuRow
    SqlAlchemyCommentStore --> _ResolvedConfig
    SqlAlchemyCommentStore --> _BuiltApp
    SqlAlchemyCommentStore --> ControllableMockClient
    SqlAlchemyCommentStore --> _FakeReq
    SqlAlchemyCommentStore --> _FakeWebSocket
    SqlAlchemyCommentStore --> _HostCapture
    SqlAlchemyCommentStore --> ManagedSessionEnv
    SqlAlchemyCommentStore --> _CaptureRunnerClient
    SqlAlchemyCommentStore --> _InputRequiredRunnerClient
    SqlAlchemyCommentStore --> _CaptureRunnerClient
    SqlAlchemyCommentStore --> _NoopRunnerWS
    SqlAlchemyCommentStore --> _NoIdentityAuthProvider
    SqlAlchemyConversationStore --> _FirstRunPlan
    SqlAlchemyConversationStore --> _OmnigentCLI
    SqlAlchemyConversationStore --> _HostDaemonRecord
    SqlAlchemyConversationStore --> _HostHttpResult
    SqlAlchemyConversationStore --> _HostSessionsTableWidths
    SqlAlchemyConversationStore --> _DaemonSessionsResult
    SqlAlchemyConversationStore --> _SessionsPageResult
    SqlAlchemyConversationStore --> _SessionPagesResult
    SqlAlchemyConversationStore --> _SpawnedDaemonProcess
    SqlAlchemyConversationStore --> _DaemonReuseDecision
    SqlAlchemyConversationStore --> _CliRunnerProcess
    SqlAlchemyConversationStore --> _LLMDeploy
    SqlAlchemyConversationStore --> _BuiltinEntry
    SqlAlchemyConversationStore --> _ToolsDeploy
    SqlAlchemyConversationStore --> _ExecutorDeploy
    SqlAlchemyConversationStore --> _DeployConfig
    SqlAlchemyConversationStore --> _ResumeChoice
    SqlAlchemyConversationStore --> _HostGroup
    SqlAlchemyConversationStore --> _ConfigGroup
    SqlAlchemyConversationStore --> _HarnessMenuRow
    SqlAlchemyConversationStore --> SqlConversation
    SqlAlchemyConversationStore --> SqlConversationItem
    SqlAlchemyConversationStore --> _ResolvedConfig
    SqlAlchemyConversationStore --> _BuiltApp
    SqlAlchemyConversationStore --> _FakeSessionsNamespace
    SqlAlchemyConversationStore --> _FakeConversationsNamespace
    SqlAlchemyConversationStore --> _FakeAPClient
    SqlAlchemyConversationStore --> _CapturedWake
    SqlAlchemyConversationStore --> _FailThenSucceedDispatch
    SqlAlchemyConversationStore --> _Recorder
    SqlAlchemyConversationStore --> _ElicitationHarness
    SqlAlchemyConversationStore --> _Harness
    SqlAlchemyConversationStore --> _CapturingPolicySpec
    SqlAlchemyConversationStore --> _CapturingPolicy
    SqlAlchemyConversationStore --> _FakeResponsesNamespace
    SqlAlchemyConversationStore --> _FakeClient
    SqlAlchemyConversationStore --> ControllableMockClient
    SqlAlchemyConversationStore --> _FakeReq
    SqlAlchemyConversationStore --> _StubWebSocket
    SqlAlchemyConversationStore --> _LivenessApp
    SqlAlchemyConversationStore --> _SeedStores
    SqlAlchemyConversationStore --> _EntrypointFakeLauncher
    SqlAlchemyConversationStore --> _StubAuthProvider
    SqlAlchemyConversationStore --> _FakeWebSocket
    SqlAlchemyConversationStore --> _HostCapture
    SqlAlchemyConversationStore --> ManagedSessionEnv
    SqlAlchemyConversationStore --> _CaptureRunnerClient
    SqlAlchemyConversationStore --> _InputRequiredRunnerClient
    SqlAlchemyConversationStore --> _ForwardedEffort
    SqlAlchemyConversationStore --> _CaptureRunnerClient
    SqlAlchemyConversationStore --> FakeProcessManager
    SqlAlchemyConversationStore --> _TunnelStack
    SqlAlchemyConversationStore --> _NoopRunnerWS
    SqlAlchemyConversationStore --> _FakeWebSocket
    SqlAlchemyConversationStore --> _HeartbeatStreamResponse
    SqlAlchemyConversationStore --> _ScriptedStreamResponse
    SqlAlchemyConversationStore --> _FakeUpload
    SqlAlchemyConversationStore --> _NoIdentityAuthProvider
    SqlAlchemyConversationStore --> _DispatchCall
    SqlAlchemyDocumentStore --> _FirstRunPlan
    SqlAlchemyDocumentStore --> _OmnigentCLI
    SqlAlchemyDocumentStore --> _HostDaemonRecord
    SqlAlchemyDocumentStore --> _HostHttpResult
    SqlAlchemyDocumentStore --> _HostSessionsTableWidths
    SqlAlchemyDocumentStore --> _DaemonSessionsResult
    SqlAlchemyDocumentStore --> _SessionsPageResult
    SqlAlchemyDocumentStore --> _SessionPagesResult
    SqlAlchemyDocumentStore --> _SpawnedDaemonProcess
    SqlAlchemyDocumentStore --> _DaemonReuseDecision
    SqlAlchemyDocumentStore --> _CliRunnerProcess
    SqlAlchemyDocumentStore --> _LLMDeploy
    SqlAlchemyDocumentStore --> _BuiltinEntry
    SqlAlchemyDocumentStore --> _ToolsDeploy
    SqlAlchemyDocumentStore --> _ExecutorDeploy
    SqlAlchemyDocumentStore --> _DeployConfig
    SqlAlchemyDocumentStore --> _ResumeChoice
    SqlAlchemyDocumentStore --> _HostGroup
    SqlAlchemyDocumentStore --> _ConfigGroup
    SqlAlchemyDocumentStore --> _HarnessMenuRow
    SqlAlchemyDocumentStore --> _ResolvedConfig
    SqlAlchemyDocumentStore --> _BuiltApp
    SqlAlchemyFileStore --> _FirstRunPlan
    SqlAlchemyFileStore --> _OmnigentCLI
    SqlAlchemyFileStore --> _HostDaemonRecord
    SqlAlchemyFileStore --> _HostHttpResult
    SqlAlchemyFileStore --> _HostSessionsTableWidths
    SqlAlchemyFileStore --> _DaemonSessionsResult
    SqlAlchemyFileStore --> _SessionsPageResult
    SqlAlchemyFileStore --> _SessionPagesResult
    SqlAlchemyFileStore --> _SpawnedDaemonProcess
    SqlAlchemyFileStore --> _DaemonReuseDecision
    SqlAlchemyFileStore --> _CliRunnerProcess
    SqlAlchemyFileStore --> _LLMDeploy
    SqlAlchemyFileStore --> _BuiltinEntry
    SqlAlchemyFileStore --> _ToolsDeploy
    SqlAlchemyFileStore --> _ExecutorDeploy
    SqlAlchemyFileStore --> _DeployConfig
    SqlAlchemyFileStore --> _ResumeChoice
    SqlAlchemyFileStore --> _HostGroup
    SqlAlchemyFileStore --> _ConfigGroup
    SqlAlchemyFileStore --> _HarnessMenuRow
    SqlAlchemyFileStore --> _ResolvedConfig
    SqlAlchemyFileStore --> _BuiltApp
    SqlAlchemyFileStore --> ControllableMockClient
    SqlAlchemyFileStore --> _FakeReq
    SqlAlchemyFileStore --> _StubWebSocket
    SqlAlchemyFileStore --> _LivenessApp
    SqlAlchemyFileStore --> _SeedStores
    SqlAlchemyFileStore --> _EntrypointFakeLauncher
    SqlAlchemyFileStore --> _FakeWebSocket
    SqlAlchemyFileStore --> _HostCapture
    SqlAlchemyFileStore --> ManagedSessionEnv
    SqlAlchemyFileStore --> _CaptureRunnerClient
    SqlAlchemyFileStore --> _InputRequiredRunnerClient
    SqlAlchemyFileStore --> _CaptureRunnerClient
    SqlAlchemyFileStore --> FakeProcessManager
    SqlAlchemyFileStore --> _TunnelStack
    SqlAlchemyFileStore --> _NoopRunnerWS
    SqlAlchemyFileStore --> _FakeUpload
    SqlAlchemyImageStore --> _FirstRunPlan
    SqlAlchemyImageStore --> _OmnigentCLI
    SqlAlchemyImageStore --> _HostDaemonRecord
    SqlAlchemyImageStore --> _HostHttpResult
    SqlAlchemyImageStore --> _HostSessionsTableWidths
    SqlAlchemyImageStore --> _DaemonSessionsResult
    SqlAlchemyImageStore --> _SessionsPageResult
    SqlAlchemyImageStore --> _SessionPagesResult
    SqlAlchemyImageStore --> _SpawnedDaemonProcess
    SqlAlchemyImageStore --> _DaemonReuseDecision
    SqlAlchemyImageStore --> _CliRunnerProcess
    SqlAlchemyImageStore --> _LLMDeploy
    SqlAlchemyImageStore --> _BuiltinEntry
    SqlAlchemyImageStore --> _ToolsDeploy
    SqlAlchemyImageStore --> _ExecutorDeploy
    SqlAlchemyImageStore --> _DeployConfig
    SqlAlchemyImageStore --> _ResumeChoice
    SqlAlchemyImageStore --> _HostGroup
    SqlAlchemyImageStore --> _ConfigGroup
    SqlAlchemyImageStore --> _HarnessMenuRow
    SqlAlchemyImageStore --> _ResolvedConfig
    SqlAlchemyImageStore --> _BuiltApp
    SqlAlchemyPermissionStore --> _FirstRunPlan
    SqlAlchemyPermissionStore --> _OmnigentCLI
    SqlAlchemyPermissionStore --> _HostDaemonRecord
    SqlAlchemyPermissionStore --> _HostHttpResult
    SqlAlchemyPermissionStore --> _HostSessionsTableWidths
    SqlAlchemyPermissionStore --> _DaemonSessionsResult
    SqlAlchemyPermissionStore --> _SessionsPageResult
    SqlAlchemyPermissionStore --> _SessionPagesResult
    SqlAlchemyPermissionStore --> _SpawnedDaemonProcess
    SqlAlchemyPermissionStore --> _DaemonReuseDecision
    SqlAlchemyPermissionStore --> _CliRunnerProcess
    SqlAlchemyPermissionStore --> _LLMDeploy
    SqlAlchemyPermissionStore --> _BuiltinEntry
    SqlAlchemyPermissionStore --> _ToolsDeploy
    SqlAlchemyPermissionStore --> _ExecutorDeploy
    SqlAlchemyPermissionStore --> _DeployConfig
    SqlAlchemyPermissionStore --> _ResumeChoice
    SqlAlchemyPermissionStore --> _HostGroup
    SqlAlchemyPermissionStore --> _ConfigGroup
    SqlAlchemyPermissionStore --> _HarnessMenuRow
    SqlAlchemyPermissionStore --> SqlUser
    SqlAlchemyPermissionStore --> _ResolvedConfig
    SqlAlchemyPermissionStore --> _BuiltApp
    SqlAlchemyPermissionStore --> _FakeReq
    SqlAlchemyPermissionStore --> _IdpKeys
    SqlAlchemyPermissionStore --> _FakeResponse
    SqlAlchemyPermissionStore --> _FakeAsyncClient
    SqlAlchemyPermissionStore --> _StubAuthProvider
    SqlAlchemyPermissionStore --> _CaptureRunnerClient
    SqlAlchemyPermissionStore --> _InputRequiredRunnerClient
    SqlAlchemyPermissionStore --> _CaptureRunnerClient
    SqlAlchemyPermissionStore --> _NoIdentityAuthProvider
    SqlAlchemyPolicyStore --> _FirstRunPlan
    SqlAlchemyPolicyStore --> _OmnigentCLI
    SqlAlchemyPolicyStore --> _HostDaemonRecord
    SqlAlchemyPolicyStore --> _HostHttpResult
    SqlAlchemyPolicyStore --> _HostSessionsTableWidths
    SqlAlchemyPolicyStore --> _DaemonSessionsResult
    SqlAlchemyPolicyStore --> _SessionsPageResult
    SqlAlchemyPolicyStore --> _SessionPagesResult
    SqlAlchemyPolicyStore --> _SpawnedDaemonProcess
    SqlAlchemyPolicyStore --> _DaemonReuseDecision
    SqlAlchemyPolicyStore --> _CliRunnerProcess
    SqlAlchemyPolicyStore --> _LLMDeploy
    SqlAlchemyPolicyStore --> _BuiltinEntry
    SqlAlchemyPolicyStore --> _ToolsDeploy
    SqlAlchemyPolicyStore --> _ExecutorDeploy
    SqlAlchemyPolicyStore --> _DeployConfig
    SqlAlchemyPolicyStore --> _ResumeChoice
    SqlAlchemyPolicyStore --> _HostGroup
    SqlAlchemyPolicyStore --> _ConfigGroup
    SqlAlchemyPolicyStore --> _HarnessMenuRow
    SqlAlchemyVideoStore --> _FirstRunPlan
    SqlAlchemyVideoStore --> _OmnigentCLI
    SqlAlchemyVideoStore --> _HostDaemonRecord
    SqlAlchemyVideoStore --> _HostHttpResult
    SqlAlchemyVideoStore --> _HostSessionsTableWidths
    SqlAlchemyVideoStore --> _DaemonSessionsResult
    SqlAlchemyVideoStore --> _SessionsPageResult
    SqlAlchemyVideoStore --> _SessionPagesResult
    SqlAlchemyVideoStore --> _SpawnedDaemonProcess
    SqlAlchemyVideoStore --> _DaemonReuseDecision
    SqlAlchemyVideoStore --> _CliRunnerProcess
    SqlAlchemyVideoStore --> _LLMDeploy
    SqlAlchemyVideoStore --> _BuiltinEntry
    SqlAlchemyVideoStore --> _ToolsDeploy
    SqlAlchemyVideoStore --> _ExecutorDeploy
    SqlAlchemyVideoStore --> _DeployConfig
    SqlAlchemyVideoStore --> _ResumeChoice
    SqlAlchemyVideoStore --> _HostGroup
    SqlAlchemyVideoStore --> _ConfigGroup
    SqlAlchemyVideoStore --> _HarnessMenuRow
    StartupProfiler --> _AttachOutcome
    StartupProfiler --> _FirstRunPlan
    StartupProfiler --> _OmnigentCLI
    StartupProfiler --> _HostDaemonRecord
    StartupProfiler --> _HostHttpResult
    StartupProfiler --> _HostSessionsTableWidths
    StartupProfiler --> _DaemonSessionsResult
    StartupProfiler --> _SessionsPageResult
    StartupProfiler --> _SessionPagesResult
    StartupProfiler --> _SpawnedDaemonProcess
    StartupProfiler --> _DaemonReuseDecision
    StartupProfiler --> _CliRunnerProcess
    StartupProfiler --> _LLMDeploy
    StartupProfiler --> _BuiltinEntry
    StartupProfiler --> _ToolsDeploy
    StartupProfiler --> _ExecutorDeploy
    StartupProfiler --> _DeployConfig
    StartupProfiler --> _ResumeChoice
    StartupProfiler --> _HostGroup
    StartupProfiler --> _ConfigGroup
    StartupProfiler --> _HarnessMenuRow
    SubagentBlockNotifier --> Conversation
    SubagentBlockNotifier --> _MirroredToolCall
    SubagentBlockNotifier --> _PendingPolicyAskWrites
    SubagentBlockNotifier --> _RelayHandle
    SubagentBlockNotifier --> SessionLiveness
    SubagentBlockNotifier --> _RunnerForwardResult
    SubagentBlockNotifier --> _HostLaunchAttempt
    SubagentBlockNotifier --> _NativeTerminalEnsureOutcome
    SubagentBlockNotifier --> _SessionEventDispatchResult
    SubagentBlockNotifier --> _CapturedWake
    SubagentBlockNotifier --> _FailThenSucceedDispatch
    _WakeOutcome --> Conversation
    _FakeReq --> AccountsConfig
    _FakeReq --> SqlAlchemyAccountStore
    _FakeReq --> AuthProvider
    _FakeReq --> UnifiedAuthProvider
    _FakeReq --> SqlAlchemyPermissionStore
    _FakeReq --> AgentCache
    _FakeReq --> RuntimeCaps
    _FakeReq --> SqlAlchemyAgentStore
    _FakeReq --> LocalArtifactStore
    _FakeReq --> SqlAlchemyCommentStore
    _FakeReq --> SqlAlchemyConversationStore
    _FakeReq --> SqlAlchemyFileStore
    _FakeReq --> HostStore
    _FakeReq --> SqlUser
    _LivenessApp --> AgentCache
    _LivenessApp --> SqlAlchemyAgentStore
    _LivenessApp --> LocalArtifactStore
    _LivenessApp --> SqlAlchemyConversationStore
    _LivenessApp --> SqlAlchemyFileStore
    _LivenessApp --> HostStore
    _LivenessApp --> HostHelloFrame
    _SeedStores --> AgentCache
    _SeedStores --> SqlAlchemyAgentStore
    _SeedStores --> LocalArtifactStore
    _SeedStores --> SqlAlchemyConversationStore
    _SeedStores --> SqlAlchemyFileStore
    _SeedStores --> HostStore
    _SeedStores --> HostHelloFrame
    _StubWebSocket --> AgentCache
    _StubWebSocket --> SqlAlchemyAgentStore
    _StubWebSocket --> LocalArtifactStore
    _StubWebSocket --> SqlAlchemyConversationStore
    _StubWebSocket --> SqlAlchemyFileStore
    _StubWebSocket --> HostStore
    _StubWebSocket --> HostHelloFrame
    _Recorder --> ElicitationDeclinedError
    _Recorder --> FunctionPolicy
    _Recorder --> ElicitationRequest
    _Recorder --> PolicyResult
    _Recorder --> PolicyEngine
    _Recorder --> Phase
    _Recorder --> PhaseSelector
    _Recorder --> PolicyAction
    _Recorder --> SqlAlchemyConversationStore
    _ElicitationHarness --> ElicitationDeclinedError
    _ElicitationHarness --> FunctionPolicy
    _ElicitationHarness --> EvaluationContext
    _ElicitationHarness --> PolicyResult
    _ElicitationHarness --> PolicyEngine
    _ElicitationHarness --> Phase
    _ElicitationHarness --> PhaseSelector
    _ElicitationHarness --> PolicyAction
    _ElicitationHarness --> SqlAlchemyConversationStore
    _Harness --> EvaluationContext
    _Harness --> PolicyEngine
    _Harness --> Phase
    _Harness --> PhaseSelector
    _Harness --> PolicyAction
    _Harness --> SqlAlchemyConversationStore
    _AcceptingConnect --> HostConnectError
    _AcceptingConnect --> HostProcess
    _AcceptingConnect --> HostCreateDirFrame
    _AcceptingConnect --> HostCreateDirResultFrame
    _AcceptingConnect --> HostHelloFrame
    _AcceptingConnect --> HostLaunchRunnerFrame
    _AcceptingConnect --> HostLaunchRunnerResultFrame
    _AcceptingConnect --> HostListDirFrame
    _AcceptingConnect --> HostListDirResultFrame
    _AcceptingConnect --> HostRunnerExitedFrame
    _AcceptingConnect --> HostStatFrame
    _AcceptingConnect --> HostStatResultFrame
    _AcceptingConnect --> HostStopRunnerFrame
    _AcceptingConnect --> HostStopRunnerResultFrame
    _AcceptingConnect --> HostIdentity
    _ConnectSpy --> HostConnectError
    _ConnectSpy --> HostProcess
    _ConnectSpy --> HostCreateDirFrame
    _ConnectSpy --> HostCreateDirResultFrame
    _ConnectSpy --> HostHelloFrame
    _ConnectSpy --> HostLaunchRunnerFrame
    _ConnectSpy --> HostLaunchRunnerResultFrame
    _ConnectSpy --> HostListDirFrame
    _ConnectSpy --> HostListDirResultFrame
    _ConnectSpy --> HostRunnerExitedFrame
    _ConnectSpy --> HostStatFrame
    _ConnectSpy --> HostStatResultFrame
    _ConnectSpy --> HostStopRunnerFrame
    _ConnectSpy --> HostStopRunnerResultFrame
    _ConnectSpy --> HostIdentity
    _DroppedTunnel --> HostConnectError
    _DroppedTunnel --> HostProcess
    _DroppedTunnel --> HostCreateDirFrame
    _DroppedTunnel --> HostCreateDirResultFrame
    _DroppedTunnel --> HostHelloFrame
    _DroppedTunnel --> HostLaunchRunnerFrame
    _DroppedTunnel --> HostLaunchRunnerResultFrame
    _DroppedTunnel --> HostListDirFrame
    _DroppedTunnel --> HostListDirResultFrame
    _DroppedTunnel --> HostRunnerExitedFrame
    _DroppedTunnel --> HostStatFrame
    _DroppedTunnel --> HostStatResultFrame
    _DroppedTunnel --> HostStopRunnerFrame
    _DroppedTunnel --> HostStopRunnerResultFrame
    _DroppedTunnel --> HostIdentity
    _FakeTunnel --> HostConnectError
    _FakeTunnel --> HostProcess
    _FakeTunnel --> HostCreateDirFrame
    _FakeTunnel --> HostCreateDirResultFrame
    _FakeTunnel --> HostHelloFrame
    _FakeTunnel --> HostLaunchRunnerFrame
    _FakeTunnel --> HostLaunchRunnerResultFrame
    _FakeTunnel --> HostListDirFrame
    _FakeTunnel --> HostListDirResultFrame
    _FakeTunnel --> HostRunnerExitedFrame
    _FakeTunnel --> HostStatFrame
    _FakeTunnel --> HostStatResultFrame
    _FakeTunnel --> HostStopRunnerFrame
    _FakeTunnel --> HostStopRunnerResultFrame
    _FakeTunnel --> HostIdentity
    _HandshakeFailingConnect --> HostConnectError
    _HandshakeFailingConnect --> HostProcess
    _HandshakeFailingConnect --> HostCreateDirFrame
    _HandshakeFailingConnect --> HostCreateDirResultFrame
    _HandshakeFailingConnect --> HostHelloFrame
    _HandshakeFailingConnect --> HostLaunchRunnerFrame
    _HandshakeFailingConnect --> HostLaunchRunnerResultFrame
    _HandshakeFailingConnect --> HostListDirFrame
    _HandshakeFailingConnect --> HostListDirResultFrame
    _HandshakeFailingConnect --> HostRunnerExitedFrame
    _HandshakeFailingConnect --> HostStatFrame
    _HandshakeFailingConnect --> HostStatResultFrame
    _HandshakeFailingConnect --> HostStopRunnerFrame
    _HandshakeFailingConnect --> HostStopRunnerResultFrame
    _HandshakeFailingConnect --> HostIdentity
    _StubConversationStore --> Policy
    _StubConversationStore --> EvaluationContext
    _StubConversationStore --> PolicyResult
    _StubConversationStore --> PolicyEngine
    _StubConversationStore --> FunctionPolicySpec
    _StubConversationStore --> Phase
    _StubConversationStore --> PolicyAction
    _StubConversationStore --> StateUpdate
    _StubConversationStore --> StateUpdateAction
    _StubPolicy --> Policy
    _StubPolicy --> EvaluationContext
    _StubPolicy --> PolicyResult
    _StubPolicy --> PolicyEngine
    _StubPolicy --> FunctionPolicySpec
    _StubPolicy --> Phase
    _StubPolicy --> PolicyAction
    _StubPolicy --> StateUpdate
    _StubPolicy --> StateUpdateAction
    _CapturingPolicy --> Policy
    _CapturingPolicy --> EvaluationContext
    _CapturingPolicy --> PolicyResult
    _CapturingPolicy --> PolicyEngine
    _CapturingPolicy --> Phase
    _CapturingPolicy --> PhaseSelector
    _CapturingPolicy --> PolicyAction
    _CapturingPolicy --> PolicySpec
    _CapturingPolicy --> SqlAlchemyConversationStore
    _CapturingPolicySpec --> Policy
    _CapturingPolicySpec --> EvaluationContext
    _CapturingPolicySpec --> PolicyResult
    _CapturingPolicySpec --> PolicyEngine
    _CapturingPolicySpec --> Phase
    _CapturingPolicySpec --> PhaseSelector
    _CapturingPolicySpec --> PolicyAction
    _CapturingPolicySpec --> PolicySpec
    _CapturingPolicySpec --> SqlAlchemyConversationStore
    FakeWebSocket --> HostHelloFrame
    FakeWebSocket --> HostRegistry
    FakeWebSocket --> RunnerExitReports
    _FakeWebSocket --> HostCreateWorktreeFrame
    _FakeWebSocket --> HostHelloFrame
    _FakeWebSocket --> HostLaunchRunnerFrame
    _FakeWebSocket --> HostRemoveWorktreeFrame
    _FakeWebSocket --> HostStatFrame
    _FakeWebSocket --> AgentCache
    _FakeWebSocket --> HostConnection
    _FakeWebSocket --> SqlAlchemyAgentStore
    _FakeWebSocket --> LocalArtifactStore
    _FakeWebSocket --> SqlAlchemyCommentStore
    _FakeWebSocket --> SqlAlchemyConversationStore
    _FakeWebSocket --> SqlAlchemyFileStore
    _FakeWebSocket --> HostStore
    _HostCapture --> HostCreateWorktreeFrame
    _HostCapture --> HostHelloFrame
    _HostCapture --> HostLaunchRunnerFrame
    _HostCapture --> HostRemoveWorktreeFrame
    _HostCapture --> HostStatFrame
    _HostCapture --> AgentCache
    _HostCapture --> HostConnection
    _HostCapture --> SqlAlchemyAgentStore
    _HostCapture --> LocalArtifactStore
    _HostCapture --> SqlAlchemyCommentStore
    _HostCapture --> SqlAlchemyConversationStore
    _HostCapture --> SqlAlchemyFileStore
    _HostCapture --> HostStore
    ManagedSessionEnv --> HostHelloFrame
    ManagedSessionEnv --> HostLaunchRunnerFrame
    ManagedSessionEnv --> HostLaunchRunnerResultFrame
    ManagedSessionEnv --> AgentCache
    ManagedSessionEnv --> HostRegistry
    ManagedSessionEnv --> SqlAlchemyAgentStore
    ManagedSessionEnv --> LocalArtifactStore
    ManagedSessionEnv --> SqlAlchemyCommentStore
    ManagedSessionEnv --> SqlAlchemyConversationStore
    ManagedSessionEnv --> SqlAlchemyFileStore
    ManagedSessionEnv --> HostStore
    ManagedSessionEnv --> FakeSandboxLauncher
    ManagedSessionEnv --> HostStartInvocation
    _FixedAuthProvider --> SqlHost
    _FixedAuthProvider --> HostHelloFrame
    _FixedAuthProvider --> HostLaunchRunnerResultFrame
    _FixedAuthProvider --> AuthProvider
    _FixedAuthProvider --> HostRegistry
    _FixedAuthProvider --> HostStore
    _FakeWebSocket --> HostCreateWorktreeFrame
    _FakeWebSocket --> HostHelloFrame
    _FakeWebSocket --> HostRemoveWorktreeFrame
    _FakeWebSocket --> HostRegistry
    _FakeWebSocket --> WorktreeHostUnavailableError
    _FakeWebSocket --> WorktreeProxyError
    _StubAuthProvider --> HostHelloFrame
    _StubAuthProvider --> HostLaunchRunnerResultFrame
    _StubAuthProvider --> HostRegistry
    _StubAuthProvider --> HostLaunchTarget
    _StubAuthProvider --> SqlAlchemyConversationStore
    _StubAuthProvider --> HostStore
    _StubAuthProvider --> SqlAlchemyPermissionStore
    _StubAuthProvider --> HostLaunchRunnerFrame
    _StubAuthProvider --> AgentCache
    _StubAuthProvider --> SqlAlchemyAgentStore
    _StubAuthProvider --> LocalArtifactStore
    _StubAuthProvider --> HostRunnerExitedFrame
    _StubAuthProvider --> RunnerExitReports
    _StubAuthProvider --> TunnelRegistry
    _EntrypointFakeLauncher --> AgentCache
    _EntrypointFakeLauncher --> ManagedSandboxConfig
    _EntrypointFakeLauncher --> RepoWorkspace
    _EntrypointFakeLauncher --> SqlAlchemyAgentStore
    _EntrypointFakeLauncher --> LocalArtifactStore
    _EntrypointFakeLauncher --> SqlAlchemyConversationStore
    _EntrypointFakeLauncher --> SqlAlchemyFileStore
    _EntrypointFakeLauncher --> HostStore
    _EntrypointFakeLauncher --> FakeSandboxLauncher
    _EntrypointFakeLauncher --> HostStartInvocation
    _StubInvitedLookup --> AdminList
    _StubInvitedLookup --> OidcAdmissionPolicy
    _IdpKeys --> AdminList
    _IdpKeys --> UnifiedAuthProvider
    _IdpKeys --> OIDCConfig
    _IdpKeys --> SqlAlchemyPermissionStore
    _FakeAsyncClient --> AdminList
    _FakeAsyncClient --> UnifiedAuthProvider
    _FakeAsyncClient --> OIDCConfig
    _FakeAsyncClient --> SqlAlchemyPermissionStore
    _FakeResponse --> AdminList
    _FakeResponse --> UnifiedAuthProvider
    _FakeResponse --> OIDCConfig
    _FakeResponse --> SqlAlchemyPermissionStore
    _FakeCounter --> RequestDurationAccessFormatter
    _FakeCounter --> ServerMetricsOtelPublisher
    _FakeCounter --> ServerMetricsSnapshot
    _FakeCounter --> ServerPerformanceMetrics
    _FakeCounter --> SystemLoadAverage
    _FakeGauge --> RequestDurationAccessFormatter
    _FakeGauge --> ServerMetricsOtelPublisher
    _FakeGauge --> ServerMetricsSnapshot
    _FakeGauge --> ServerPerformanceMetrics
    _FakeGauge --> SystemLoadAverage
    _FakeHistogram --> RequestDurationAccessFormatter
    _FakeHistogram --> ServerMetricsOtelPublisher
    _FakeHistogram --> ServerMetricsSnapshot
    _FakeHistogram --> ServerPerformanceMetrics
    _FakeHistogram --> SystemLoadAverage
    _FakeMeter --> RequestDurationAccessFormatter
    _FakeMeter --> ServerMetricsOtelPublisher
    _FakeMeter --> ServerMetricsSnapshot
    _FakeMeter --> ServerPerformanceMetrics
    _FakeMeter --> SystemLoadAverage
    _FakeMetricInputs --> RequestDurationAccessFormatter
    _FakeMetricInputs --> ServerMetricsOtelPublisher
    _FakeMetricInputs --> ServerMetricsSnapshot
    _FakeMetricInputs --> ServerPerformanceMetrics
    _FakeMetricInputs --> SystemLoadAverage
    _MetricRecord --> RequestDurationAccessFormatter
    _MetricRecord --> ServerMetricsOtelPublisher
    _MetricRecord --> ServerMetricsSnapshot
    _MetricRecord --> ServerPerformanceMetrics
    _MetricRecord --> SystemLoadAverage
    _StubConversationStore --> Conversation
    _StubConversationStore --> ResolvedAccess
    _StubConversationStore --> SessionPermission
    _StubConversationStore --> UnifiedAuthProvider
    _StubPermissionStore --> Conversation
    _StubPermissionStore --> ResolvedAccess
    _StubPermissionStore --> SessionPermission
    _StubPermissionStore --> UnifiedAuthProvider
    _FakeClient --> FunctionPolicy
    _FakeClient --> EvaluationContext
    _FakeClient --> PolicyLLMClient
    _FakeClient --> RuntimeCaps
    _FakeClient --> PolicyEngine
    _FakeClient --> FunctionPolicySpec
    _FakeClient --> FunctionRef
    _FakeClient --> Phase
    _FakeClient --> PhaseSelector
    _FakeClient --> SqlAlchemyConversationStore
    _FakeResponsesNamespace --> FunctionPolicy
    _FakeResponsesNamespace --> EvaluationContext
    _FakeResponsesNamespace --> PolicyLLMClient
    _FakeResponsesNamespace --> RuntimeCaps
    _FakeResponsesNamespace --> PolicyEngine
    _FakeResponsesNamespace --> FunctionPolicySpec
    _FakeResponsesNamespace --> FunctionRef
    _FakeResponsesNamespace --> Phase
    _FakeResponsesNamespace --> PhaseSelector
    _FakeResponsesNamespace --> SqlAlchemyConversationStore
    _FakeAPClient --> SqlAlchemyAgentStore
    _FakeAPClient --> SqlAlchemyConversationStore
    _FakeConversationsNamespace --> SqlAlchemyAgentStore
    _FakeConversationsNamespace --> SqlAlchemyConversationStore
    _FakeSessionsNamespace --> SqlAlchemyAgentStore
    _FakeSessionsNamespace --> SqlAlchemyConversationStore
    _ConversationStore --> RunnerRouter
    _ConversationStore --> TunnelRegistry
    _FakeWebSocket --> RunnerRouter
    _FakeWebSocket --> TunnelRegistry
    _NeverConnectsRegistry --> RunnerExitReports
    _NoopRunnerWS --> HostHelloFrame
    _NoopRunnerWS --> HostLaunchRunnerFrame
    _NoopRunnerWS --> HostLaunchRunnerResultFrame
    _NoopRunnerWS --> HostStatFrame
    _NoopRunnerWS --> HostStatResultFrame
    _NoopRunnerWS --> HostStopRunnerFrame
    _NoopRunnerWS --> HostStopRunnerResultFrame
    _NoopRunnerWS --> AgentCache
    _NoopRunnerWS --> SqlAlchemyAgentStore
    _NoopRunnerWS --> LocalArtifactStore
    _NoopRunnerWS --> SqlAlchemyCommentStore
    _NoopRunnerWS --> SqlAlchemyConversationStore
    _NoopRunnerWS --> SqlAlchemyFileStore
    _NoopRunnerWS --> HostStore
    _NoIdentityAuthProvider --> UnifiedAuthProvider
    _NoIdentityAuthProvider --> SessionLiveness
    _NoIdentityAuthProvider --> SqlAlchemyAgentStore
    _NoIdentityAuthProvider --> SqlAlchemyCommentStore
    _NoIdentityAuthProvider --> SqlAlchemyConversationStore
    _NoIdentityAuthProvider --> SqlAlchemyPermissionStore
    _FakeWebSocket --> HostCreateWorktreeFrame
    _FakeWebSocket --> HostHelloFrame
    _FakeWebSocket --> HostStatFrame
    _FakeWebSocket --> HostConnection
    _FakeWebSocket --> HostStore
    _FakeWebSocket --> HostHelloFrame
    _FakeWebSocket --> HostRemoveWorktreeFrame
    _FakeWebSocket --> SqlAlchemyConversationStore
    _FakeWebSocket --> HostStore
    _CaptureRunnerClient --> AgentCache
    _CaptureRunnerClient --> SessionEventInput
    _CaptureRunnerClient --> SqlAlchemyAgentStore
    _CaptureRunnerClient --> LocalArtifactStore
    _CaptureRunnerClient --> SqlAlchemyCommentStore
    _CaptureRunnerClient --> SqlAlchemyConversationStore
    _CaptureRunnerClient --> SqlAlchemyFileStore
    _CaptureRunnerClient --> SqlAlchemyPermissionStore
    _CaptureRunnerClient --> ControllableMockClient
    _CaptureRunnerClient --> UnifiedAuthProvider
    _InputRequiredRunnerClient --> AgentCache
    _InputRequiredRunnerClient --> RuntimeCaps
    _InputRequiredRunnerClient --> FunctionPolicySpec
    _InputRequiredRunnerClient --> FunctionRef
    _InputRequiredRunnerClient --> SqlAlchemyAgentStore
    _InputRequiredRunnerClient --> LocalArtifactStore
    _InputRequiredRunnerClient --> SqlAlchemyCommentStore
    _InputRequiredRunnerClient --> SqlAlchemyConversationStore
    _InputRequiredRunnerClient --> SqlAlchemyFileStore
    _InputRequiredRunnerClient --> SqlAlchemyPermissionStore
    _InputRequiredRunnerClient --> ControllableMockClient
    _InputRequiredRunnerClient --> UnifiedAuthProvider
    _ForwardedEffort --> ModelPricing
    _ForwardedEffort --> SqlAlchemyConversationStore
    _ForwardedEffort --> HostStore
    _ForwardedEffort --> SqlAlchemyAgentStore
    _FixedPolicyEngine --> Conversation
    _FixedPolicyEngine --> EvaluationContext
    _FixedPolicyEngine --> PolicyResult
    _FixedPolicyEngine --> PolicyAction
    _StubAgentStore --> Conversation
    _StubAgentStore --> EvaluationContext
    _StubAgentStore --> PolicyResult
    _StubAgentStore --> PolicyAction
    _StubConversationStore --> Conversation
    _StubConversationStore --> EvaluationContext
    _StubConversationStore --> PolicyResult
    _StubConversationStore --> PolicyAction
    _RaisingRunnerClient --> RoutedRunner
    _RaisingRunnerRouter --> RoutedRunner
    _FakeAgentStore --> Agent
    _FakeAgentStore --> LoadedAgent
    _FakeAgentStore --> FunctionCallData
    _FakeAgentStore --> PolicyAction
    _FakeAgentStore --> PolicyResult
    _FakeAgentStore --> SessionEventInput
    _FakeAgentStore --> Phase
    _FakeAgentStore --> PolicySpec
    _FakeBody --> Agent
    _FakeBody --> LoadedAgent
    _FakeBody --> FunctionCallData
    _FakeBody --> PolicyAction
    _FakeBody --> PolicyResult
    _FakeBody --> SessionEventInput
    _FakeBody --> Phase
    _FakeBody --> PolicySpec
    _FakeConversationStore --> Agent
    _FakeConversationStore --> LoadedAgent
    _FakeConversationStore --> FunctionCallData
    _FakeConversationStore --> PolicyAction
    _FakeConversationStore --> PolicyResult
    _FakeConversationStore --> SessionEventInput
    _FakeConversationStore --> Phase
    _FakeConversationStore --> PolicySpec
    _FakeRequest --> Agent
    _FakeRequest --> LoadedAgent
    _FakeRequest --> FunctionCallData
    _FakeRequest --> PolicyAction
    _FakeRequest --> PolicyResult
    _FakeRequest --> SessionEventInput
    _FakeRequest --> Phase
    _FakeRequest --> PolicySpec
    _HeartbeatStreamResponse --> SqlAlchemyConversationStore
    _ScriptedStreamResponse --> SqlAlchemyConversationStore
    _PublishedUsage --> SessionLiveness
    _PublishedUsage --> RunnerExitReports
    _PublishedUsage --> RoutedRunner
    _PublishedUsage --> ErrorDetail
    _UsageStreamRecorder --> SessionLiveness
    _UsageStreamRecorder --> RunnerExitReports
    _UsageStreamRecorder --> RoutedRunner
    _UsageStreamRecorder --> ErrorDetail
    _CaptureRunnerClient --> AgentCache
    _CaptureRunnerClient --> UnifiedAuthProvider
    _CaptureRunnerClient --> SqlAlchemyAgentStore
    _CaptureRunnerClient --> LocalArtifactStore
    _CaptureRunnerClient --> SqlAlchemyCommentStore
    _CaptureRunnerClient --> SqlAlchemyConversationStore
    _CaptureRunnerClient --> SqlAlchemyFileStore
    _CaptureRunnerClient --> SqlAlchemyPermissionStore
    FakeProcessManager --> AgentCache
    FakeProcessManager --> SqlAlchemyAgentStore
    FakeProcessManager --> LocalArtifactStore
    FakeProcessManager --> SqlAlchemyConversationStore
    FakeProcessManager --> SqlAlchemyFileStore
    FakeProcessManager --> RoutedRunner
    FakeProcessManager --> ErrorDetail
    _TunnelStack --> AgentCache
    _TunnelStack --> SqlAlchemyAgentStore
    _TunnelStack --> LocalArtifactStore
    _TunnelStack --> SqlAlchemyConversationStore
    _TunnelStack --> SqlAlchemyFileStore
    _TunnelStack --> RoutedRunner
    _TunnelStack --> ErrorDetail
    _FakeUpload --> SqlAlchemyAgentStore
    _FakeUpload --> LocalArtifactStore
    _FakeUpload --> SqlAlchemyConversationStore
    _FakeUpload --> SqlAlchemyFileStore
    _CapturedWake --> Conversation
    _CapturedWake --> SubagentBlockNotifier
    _CapturedWake --> SqlAlchemyConversationStore
    _FailThenSucceedDispatch --> Conversation
    _FailThenSucceedDispatch --> SubagentBlockNotifier
    _FailThenSucceedDispatch --> SqlAlchemyConversationStore
    _DispatchCall --> Conversation
    _DispatchCall --> SessionEventInput
    _DispatchCall --> SqlAlchemyConversationStore
    _FakeWebSocket --> HostHelloFrame
    _FakeWebSocket --> HostStatFrame
    _FakeWebSocket --> HostRegistry
    _FakeWebSocket --> WorkspaceValidationError
    ElicitationRequest --> Phase
    ElicitationRequest --> PolicyAction
    ElicitationRequest --> StateUpdate
    ElicitationRequest --> _MirroredToolCall
    ElicitationRequest --> _PendingPolicyAskWrites
    ElicitationRequest --> _RelayHandle
    ElicitationRequest --> SessionLiveness
    ElicitationRequest --> _RunnerForwardResult
    ElicitationRequest --> _HostLaunchAttempt
    ElicitationRequest --> _NativeTerminalEnsureOutcome
    ElicitationRequest --> _SessionEventDispatchResult
    ElicitationRequest --> _Recorder
    EvaluationContext --> Policy
    EvaluationContext --> FunctionPolicy
    EvaluationContext --> Phase
    EvaluationContext --> PolicyAction
    EvaluationContext --> StateUpdate
    EvaluationContext --> _GatedPolicy
    EvaluationContext --> PolicyVerdict
    EvaluationContext --> PolicyEngine
    EvaluationContext --> _MirroredToolCall
    EvaluationContext --> _PendingPolicyAskWrites
    EvaluationContext --> _RelayHandle
    EvaluationContext --> SessionLiveness
    EvaluationContext --> _RunnerForwardResult
    EvaluationContext --> _HostLaunchAttempt
    EvaluationContext --> _NativeTerminalEnsureOutcome
    EvaluationContext --> _SessionEventDispatchResult
    EvaluationContext --> StateUpdateAction
    EvaluationContext --> PhaseSelector
    EvaluationContext --> FunctionRef
    EvaluationContext --> PolicySpec
    EvaluationContext --> FunctionPolicySpec
    EvaluationContext --> _StubConversationStore
    EvaluationContext --> _StubPolicy
    EvaluationContext --> _ElicitationHarness
    EvaluationContext --> _Harness
    EvaluationContext --> _CapturingPolicySpec
    EvaluationContext --> _CapturingPolicy
    EvaluationContext --> _FakeResponsesNamespace
    EvaluationContext --> _FakeClient
    EvaluationContext --> _StubConversationStore
    EvaluationContext --> _StubAgentStore
    EvaluationContext --> _FixedPolicyEngine
    PolicySpec <|-- FunctionPolicySpec
    FunctionPolicySpec --> FunctionPolicy
    FunctionPolicySpec --> _GatedPolicy
    FunctionPolicySpec --> PolicyVerdict
    FunctionPolicySpec --> _MirroredToolCall
    FunctionPolicySpec --> _PendingPolicyAskWrites
    FunctionPolicySpec --> _RelayHandle
    FunctionPolicySpec --> SessionLiveness
    FunctionPolicySpec --> _RunnerForwardResult
    FunctionPolicySpec --> _HostLaunchAttempt
    FunctionPolicySpec --> _NativeTerminalEnsureOutcome
    FunctionPolicySpec --> _SessionEventDispatchResult
    FunctionPolicySpec --> EvaluationContext
    FunctionPolicySpec --> _StubConversationStore
    FunctionPolicySpec --> _StubPolicy
    FunctionPolicySpec --> _FakeResponsesNamespace
    FunctionPolicySpec --> _FakeClient
    FunctionPolicySpec --> _InputRequiredRunnerClient
    FunctionRef --> EvaluationContext
    FunctionRef --> _FakeResponsesNamespace
    FunctionRef --> _FakeClient
    FunctionRef --> _InputRequiredRunnerClient
    Phase --> FunctionPolicy
    Phase --> EvaluationContext
    Phase --> PolicyResult
    Phase --> ElicitationRequest
    Phase --> PolicyLLMClient
    Phase --> _GatedPolicy
    Phase --> PolicyVerdict
    Phase --> _MirroredToolCall
    Phase --> _PendingPolicyAskWrites
    Phase --> _RelayHandle
    Phase --> SessionLiveness
    Phase --> _RunnerForwardResult
    Phase --> _HostLaunchAttempt
    Phase --> _NativeTerminalEnsureOutcome
    Phase --> _SessionEventDispatchResult
    Phase --> _StubConversationStore
    Phase --> _StubPolicy
    Phase --> _Recorder
    Phase --> _ElicitationHarness
    Phase --> _Harness
    Phase --> _CapturingPolicySpec
    Phase --> _CapturingPolicy
    Phase --> _FakeResponsesNamespace
    Phase --> _FakeClient
    Phase --> _FakeConversationStore
    Phase --> _FakeAgentStore
    Phase --> _FakeBody
    Phase --> _FakeRequest
    PhaseSelector --> EvaluationContext
    PhaseSelector --> _Recorder
    PhaseSelector --> _ElicitationHarness
    PhaseSelector --> _Harness
    PhaseSelector --> _CapturingPolicySpec
    PhaseSelector --> _CapturingPolicy
    PhaseSelector --> _FakeResponsesNamespace
    PhaseSelector --> _FakeClient
    PolicyAction --> FunctionPolicy
    PolicyAction --> EvaluationContext
    PolicyAction --> PolicyResult
    PolicyAction --> ElicitationRequest
    PolicyAction --> PolicyLLMClient
    PolicyAction --> _GatedPolicy
    PolicyAction --> PolicyVerdict
    PolicyAction --> PolicyEngine
    PolicyAction --> _MirroredToolCall
    PolicyAction --> _PendingPolicyAskWrites
    PolicyAction --> _RelayHandle
    PolicyAction --> SessionLiveness
    PolicyAction --> _RunnerForwardResult
    PolicyAction --> _HostLaunchAttempt
    PolicyAction --> _NativeTerminalEnsureOutcome
    PolicyAction --> _SessionEventDispatchResult
    PolicyAction --> _StubConversationStore
    PolicyAction --> _StubPolicy
    PolicyAction --> _Recorder
    PolicyAction --> _ElicitationHarness
    PolicyAction --> _Harness
    PolicyAction --> _CapturingPolicySpec
    PolicyAction --> _CapturingPolicy
    PolicyAction --> _StubConversationStore
    PolicyAction --> _StubAgentStore
    PolicyAction --> _FixedPolicyEngine
    PolicyAction --> _FakeConversationStore
    PolicyAction --> _FakeAgentStore
    PolicyAction --> _FakeBody
    PolicyAction --> _FakeRequest
    PolicyLLMClient --> ActorContext
    PolicyLLMClient --> UsageContext
    PolicyLLMClient --> UserDailyCostContext
    PolicyLLMClient --> EventContext
    PolicyLLMClient --> PolicyEvent
    PolicyLLMClient --> StateUpdateEntry
    PolicyLLMClient --> PolicyResponse
    PolicyLLMClient --> PolicyCallable
    PolicyLLMClient --> PolicyCallableWithConfig
    PolicyLLMClient --> Phase
    PolicyLLMClient --> PolicyAction
    PolicyLLMClient --> StateUpdate
    PolicyLLMClient --> _FakeResponsesNamespace
    PolicyLLMClient --> _FakeClient
    PolicyResult --> Policy
    PolicyResult --> FunctionPolicy
    PolicyResult --> Phase
    PolicyResult --> PolicyAction
    PolicyResult --> StateUpdate
    PolicyResult --> _GatedPolicy
    PolicyResult --> PolicyVerdict
    PolicyResult --> PolicyEngine
    PolicyResult --> _MirroredToolCall
    PolicyResult --> _PendingPolicyAskWrites
    PolicyResult --> _RelayHandle
    PolicyResult --> SessionLiveness
    PolicyResult --> _RunnerForwardResult
    PolicyResult --> _HostLaunchAttempt
    PolicyResult --> _NativeTerminalEnsureOutcome
    PolicyResult --> _SessionEventDispatchResult
    PolicyResult --> _StubConversationStore
    PolicyResult --> _StubPolicy
    PolicyResult --> _Recorder
    PolicyResult --> _ElicitationHarness
    PolicyResult --> _CapturingPolicySpec
    PolicyResult --> _CapturingPolicy
    PolicyResult --> _StubConversationStore
    PolicyResult --> _StubAgentStore
    PolicyResult --> _FixedPolicyEngine
    PolicyResult --> _FakeConversationStore
    PolicyResult --> _FakeAgentStore
    PolicyResult --> _FakeBody
    PolicyResult --> _FakeRequest
    FunctionPolicySpec <|-- PolicySpec
    PolicySpec --> Policy
    PolicySpec --> RuntimeCaps
    PolicySpec --> PolicyEngine
    PolicySpec --> _MirroredToolCall
    PolicySpec --> _PendingPolicyAskWrites
    PolicySpec --> _RelayHandle
    PolicySpec --> SessionLiveness
    PolicySpec --> _RunnerForwardResult
    PolicySpec --> _HostLaunchAttempt
    PolicySpec --> _NativeTerminalEnsureOutcome
    PolicySpec --> _SessionEventDispatchResult
    PolicySpec --> EvaluationContext
    PolicySpec --> _CapturingPolicySpec
    PolicySpec --> _CapturingPolicy
    PolicySpec --> _FakeConversationStore
    PolicySpec --> _FakeAgentStore
    PolicySpec --> _FakeBody
    PolicySpec --> _FakeRequest
    StateUpdate --> FunctionPolicy
    StateUpdate --> EvaluationContext
    StateUpdate --> PolicyResult
    StateUpdate --> ElicitationRequest
    StateUpdate --> PolicyLLMClient
    StateUpdate --> PolicyEngine
    StateUpdate --> _MirroredToolCall
    StateUpdate --> _PendingPolicyAskWrites
    StateUpdate --> _RelayHandle
    StateUpdate --> SessionLiveness
    StateUpdate --> _RunnerForwardResult
    StateUpdate --> _HostLaunchAttempt
    StateUpdate --> _NativeTerminalEnsureOutcome
    StateUpdate --> _SessionEventDispatchResult
    StateUpdate --> _StubConversationStore
    StateUpdate --> _StubPolicy
    StateUpdateAction --> FunctionPolicy
    StateUpdateAction --> PolicyEngine
    StateUpdateAction --> EvaluationContext
    StateUpdateAction --> _StubConversationStore
    StateUpdateAction --> _StubPolicy
    _DirOp --> PolicyEvent
    _DirOp --> PolicyResponse
    WorkspaceValidationError --> CreateDirectoryRequest
    WorkspaceValidationError --> LaunchRunnerRequest
    WorkspaceValidationError --> _MirroredToolCall
    WorkspaceValidationError --> _PendingPolicyAskWrites
    WorkspaceValidationError --> _RelayHandle
    WorkspaceValidationError --> SessionLiveness
    WorkspaceValidationError --> _RunnerForwardResult
    WorkspaceValidationError --> _HostLaunchAttempt
    WorkspaceValidationError --> _NativeTerminalEnsureOutcome
    WorkspaceValidationError --> _SessionEventDispatchResult
    WorkspaceValidationError --> HostStatFrame
    WorkspaceValidationError --> HostConnection
    WorkspaceValidationError --> HostRegistry
    WorkspaceValidationError --> _FakeWebSocket
    WebSocketOriginMiddleware --> _FastAPICallNext
    WebSocketOriginMiddleware --> _WebSocketMetricsMiddleware
    WebSocketOriginMiddleware --> _SPAStaticFiles
    WebSocketOriginMiddleware --> _RangeAwareGZipMiddleware
```

## Relationships

- [[Community 3]] (1798 shared connections)
- [[Community 8]] (999 shared connections)
- [[Auth Config]] (516 shared connections)
- [[Community 9]] (398 shared connections)
- [[Community 10]] (300 shared connections)
- [[Community 1]] (298 shared connections)
- [[Community 18]] (268 shared connections)
- [[Community 11]] (176 shared connections)
- [[Community 16]] (147 shared connections)
- [[Community 13]] (125 shared connections)
- [[Community 19]] (124 shared connections)
- [[Community 6]] (102 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\_e2e_policy_callables.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_e2e_policy_callables.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_runner_startup.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_runner_startup.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\_startup_profile.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_startup_profile.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\db_models.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\utils.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/utils.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\agent.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/agent.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\conversation.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/conversation.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\permission.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/permission.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\errors.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/errors.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\harness_plugins.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/harness_plugins.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\host\connect.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/host/connect.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\host\frames.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/host/frames.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\host\git_worktree.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/host/git_worktree.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\host\identity.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/host/identity.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\llms\context_window.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/llms/context_window.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\ambient.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/ambient.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\configure_models.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/configure_models.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\provider_config.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/provider_config.py)

## Audit Trail

- EXTRACTED: 12933 (10%)
- INFERRED: 121722 (90%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*