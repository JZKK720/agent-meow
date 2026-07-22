# Community 9

> 2213 nodes · cohesion 0.00

## Key Concepts

- [create_conversation()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/stores/conversation_store/__init__.py#L223) (318 connections)
- [MessageData](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/conversation.py#L213) (283 connections)
- [NewConversationItem](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/conversation.py#L652) (203 connections)
- [.execute()](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_openshell.py#L78) (168 connections)
- [.create()](file:///C:/Users/1/github-pr/agent-meow/tests/server/routes/test_sessions_fork.py#L52) (162 connections)
- [test_conversation_store.py](file:///C:/Users/1/github-pr/agent-meow/tests/stores/test_conversation_store.py#L1) (156 connections)
- [.get_conversation()](file:///C:/Users/1/github-pr/agent-meow/tests/server/routes/test_terminal_attach.py#L100) (152 connections)
- [_Session](file:///C:/Users/1/github-pr/agent-meow/tests/repl/test_report_command.py#L30) (134 connections)
- [.connect()](file:///C:/Users/1/github-pr/agent-meow/web/src/lib/sessionUpdatesSocket.ts#L164) (117 connections)
- [text](file:///C:/Users/1/github-pr/agent-meow/web/src/store/chatStore.test.ts#L2429) (109 connections)
- [SqlAgent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L27) (108 connections)
- [SqlSessionPermission](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L195) (103 connections)
- [SqlConversationLabel](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L513) (95 connections)
- [get_or_create_engine()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/utils.py#L292) (95 connections)
- [SqlUserDailyCost](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L752) (79 connections)
- [SqlAccountToken](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L145) (67 connections)
- [build_policy_engine()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/policies/builder.py#L214) (63 connections)
- [ConversationItem](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/conversation.py#L683) (63 connections)
- [SqlPolicy](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L611) (63 connections)
- [test_permission_store.py](file:///C:/Users/1/github-pr/agent-meow/tests/stores/test_permission_store.py#L1) (61 connections)
- [search](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/SubagentsPanel.tsx#L579) (61 connections)
- [SqlComment](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py#L555) (59 connections)
- [make_managed_session_maker()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/utils.py#L511) (58 connections)
- [ErrorData](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/conversation.py#L323) (56 connections)
- [grant](file:///C:/Users/1/github-pr/agent-meow/web/src/components/PermissionsModal.tsx#L58) (56 connections)
- *... and 2188 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class CompactionData {
        +conversation.py()
    }
    class ConversationItem {
        +conversation.py()
        +.to_api_dict()
    }
    class ErrorData {
        +conversation.py()
    }
    class MessageData {
        +conversation.py()
    }
    class NativeToolData {
        +conversation.py()
    }
    class NewConversationItem {
        +conversation.py()
    }
    class ReasoningData {
        +conversation.py()
    }
    class RoutingDecisionData {
        +conversation.py()
    }
    class SlashCommandData {
        +conversation.py()
    }
    class TerminalCommandData {
        +conversation.py()
    }
    class Base {
        +db_models.py()
    }
    class SqlAccountToken {
        +db_models.py()
    }
    class SqlAgent {
        +db_models.py()
    }
    class SqlComment {
        +db_models.py()
    }
    class SqlConversationLabel {
        +db_models.py()
    }
    class SqlDocument {
        +db_models.py()
    }
    class SqlFile {
        +db_models.py()
    }
    class SqlImage {
        +db_models.py()
    }
    class SqlPolicy {
        +db_models.py()
    }
    class SqlSessionPermission {
        +db_models.py()
    }
    class SqlUserDailyCost {
        +db_models.py()
    }
    class SqlVideo {
        +db_models.py()
    }
    class ConversationNotFoundError {
        +_errors.py()
    }
    class HomeTreeProvider {
        +extension.ts()
        +.getTreeItem()
        +.getChildren()
    }
    class _GrantArgs {
        +grant_sp_perms.py()
    }
    class _ForwardState {
        +hermes_native_forwarder.py()
    }
    class _HermesUsageTracker {
        +hermes_native_forwarder.py()
        +.__init__()
        +.flush()
    }
    class _MirrorItem {
        +hermes_native_forwarder.py()
    }
    class RemapReport {
        +identity_migration.py()
        +._bump()
    }
    class ImageAsset {
        +image.py()
    }
    class ConversationNotFoundError {
        +__init__.py()
    }
    class CreatedSession {
        +__init__.py()
    }
    class NameAlreadyExistsError {
        +__init__.py()
    }
    class SessionConnectivity {
        +__init__.py()
    }
    class SearchConversationsTool {
        +search_conversations.py()
        +.get_schema()
        +.invoke()
    }
    class FakeArtifactStore {
        +test_content_resolver.py()
        +.get()
    }
    class TestSqlAgentToEntity {
        +test_converters.py()
        +.test_basic_conversion()
        +.test_nullable_fields_as_none()
        +.test_special_characters_in_fields()
        +.test_round_trip_entity_to_orm_to_entity()
        +.test_round_trip_persisted_through_db()
        +.test_version_default_after_persist()
        +.test_empty_string_description()
    }
    class TestReadLastUsedModel {
        +test_cursor_native_forwarder.py()
        +.test_reads_model_from_live_wal_store()
        +.test_no_meta_table_is_none()
    }
    class TestReadNewItems {
        +test_cursor_native_forwarder.py()
        +.test_reads_live_wal_store()
        +.test_rowid_dedup_skips_already_seen()
    }
    class TestSqlAccountToken {
        +test_db_models.py()
        +.test_persist_invite_token()
        +.test_persist_magic_token()
        +.test_check_constraint_rejects_invalid_kind()
    }
    class TestSqlAgent {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_nullable_columns()
        +.test_session_scoped_agent_fk()
        +.test_unique_session_id_index()
    }
    class TestSqlComment {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_nullable_anchor_and_created_by()
    }
    class TestSqlConversation {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_defaults()
        +.test_check_constraint_rejects_invalid_kind()
        +.test_sub_agent_kind()
        +.test_cascade_delete_removes_children()
    }
    class TestSqlConversationItem {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_unique_position_per_conversation()
        +.test_cascade_delete_with_conversation()
        +.test_multiple_items_ordered_by_position()
    }
    class TestSqlConversationLabel {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_composite_pk_allows_different_keys()
    }
    class TestSqlFile {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_nullable_content_type()
    }
    class TestSqlHost {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_check_constraint_rejects_invalid_status()
        +.test_unique_host_id()
    }
    class TestSqlPolicy {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_unique_constraint_session_name()
    }
    class TestSqlSessionPermission {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_check_constraint_rejects_invalid_level()
    }
    class TestSqlUser {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_admin_user()
        +.test_duplicate_id_raises()
    }
    class TestSqlUserDailyCost {
        +test_db_models.py()
        +.test_persist_and_read()
        +.test_composite_pk_multiple_days()
    }
    class _PagedStore {
        +test_fetch_all_items.py()
        +.__init__()
        +.list_items()
    }
    class _FakeClient {
        +test_hermes_native_forwarder.py()
        +.__init__()
        +.post()
        +.patch()
    }
    class _Resp {
        +test_hermes_native_forwarder.py()
        +.__init__()
        +.raise_for_status()
    }
    class TestReadNewItems {
        +test_kimi_native_forwarder.py()
        +._wire()
        +.test_parses_user_and_assistant_only()
        +.test_offset_skips_already_seen()
        +.test_missing_file_is_empty()
    }
    class _Session {
        +test_report_command.py()
        +.__init__()
    }
    class _FakeConversationStore {
        +test_search_conversations.py()
        +.__init__()
        +.search()
    }
    class _FakeItem {
        +test_search_conversations.py()
    }
    class _ConversationStore {
        +test_sessions_snapshot.py()
        +.__init__()
        +.get_conversation()
        +.list_conversations()
        +.list_items()
    }
    class _AgentCacheStub {
        +test_sessions_switch_agent.py()
        +.__init__()
        +.load()
    }
    class _AgentStore {
        +test_sessions_switch_agent.py()
        +.__init__()
        +.get()
        +.list()
    }
    class _ConversationStore {
        +test_sessions_switch_agent.py()
        +.__init__()
        +.get_conversation()
        +.switch_conversation_agent()
        +.list_items()
    }
    class _HarnessAgentCacheStub {
        +test_sessions_switch_agent.py()
        +.__init__()
        +.load()
    }
    class _LoadedAgentStub {
        +test_sessions_switch_agent.py()
        +.__init__()
    }
    class _RunnerClientStub {
        +test_sessions_switch_agent.py()
        +.__init__()
        +.post()
    }
    class _FakeRunnerRouter {
        +test_shell_permission_gate.py()
        +.__init__()
        +.client_for_session_resources()
    }
    class _RecordingRunnerClient {
        +test_shell_permission_gate.py()
        +.__init__()
        +.post()
    }
    class _RoutedRunner {
        +test_shell_permission_gate.py()
        +.__init__()
    }
    class _StubConversationStore {
        +test_shell_permission_gate.py()
        +.__init__()
        +.get_conversation()
        +.add()
    }
    class _StubPermissionStore {
        +test_shell_permission_gate.py()
        +.__init__()
        +.get()
        +.is_admin()
        +.add_grant()
        +.check_access()
        +.get_permission_level()
        +.resolve_access()
    }
    class TestEngineCaching {
        +test_utils_extended.py()
        +.test_same_uri_returns_same_engine()
        +.test_different_uri_returns_different_engine()
        +.test_clear_engine_cache_removes_engines()
    }
    class TestFtsHelpers {
        +test_utils_extended.py()
        +.test_ensure_fts_table_idempotent()
        +.test_insert_and_search_fts()
        +.test_delete_fts_by_conversation()
    }
    class TestIdGenerators {
        +test_utils_extended.py()
        +.test_generate_file_id_format()
        +.test_generate_conversation_id_format()
        +.test_generate_task_id_format()
        +.test_generate_item_id_all_types()
        +.test_generate_item_id_unknown_type_raises()
        +.test_ids_are_unique()
    }
    class TestManagedSessionMaker {
        +test_utils_extended.py()
        +.test_auto_commit_on_success()
        +.test_auto_rollback_on_exception()
        +.test_sqlite_foreign_keys_enabled()
        +.test_immediate_mode()
    }
    class TestNormalizeDatabaseUrl {
        +test_utils_extended.py()
        +.test_postgres_prefix()
        +.test_postgresql_prefix()
        +.test_sqlite_passthrough()
        +.test_already_psycopg_passthrough()
        +.test_empty_string()
        +.test_mysql_passthrough()
    }
    class TestTimestampHelpers {
        +test_utils_extended.py()
        +.test_now_epoch_is_close_to_time()
        +.test_now_epoch_us_is_microseconds()
        +.test_now_epoch_us_is_monotonically_increasing()
        +.test_utc_day_known_value()
        +.test_utc_day_midnight_boundary()
        +.test_utc_day_format()
    }
    class LakebaseSentinel {
        +test_utils.py()
        +.__call__()
    }
    class _ConversationStore {
        +test_workflow_history.py()
        +.__init__()
        +.list_items()
    }
    class _RecordingASGIApp {
        +test_ws_origin.py()
        +.__init__()
        +.__call__()
    }
    class VideoAsset {
        +video.py()
    }
    ConversationItem --> _PagedStore
    ErrorData --> LakebaseSentinel
    MessageData --> FakeArtifactStore
    MessageData --> _PagedStore
    MessageData --> _FakeItem
    MessageData --> _FakeConversationStore
    NewConversationItem --> LakebaseSentinel
    SlashCommandData --> LakebaseSentinel
    SqlAgent <|-- Base
    SqlFile <|-- Base
    SqlAccountToken <|-- Base
    SqlSessionPermission <|-- Base
    SqlConversationLabel <|-- Base
    SqlComment <|-- Base
    SqlPolicy <|-- Base
    SqlUserDailyCost <|-- Base
    SqlDocument <|-- Base
    SqlImage <|-- Base
    SqlVideo <|-- Base
    Base <|-- SqlAccountToken
    SqlAccountToken --> RemapReport
    SqlAccountToken --> TestSqlAgent
    SqlAccountToken --> TestSqlFile
    SqlAccountToken --> TestSqlUser
    SqlAccountToken --> TestSqlAccountToken
    SqlAccountToken --> TestSqlConversation
    SqlAccountToken --> TestSqlConversationItem
    SqlAccountToken --> TestSqlConversationLabel
    SqlAccountToken --> TestSqlSessionPermission
    SqlAccountToken --> TestSqlComment
    SqlAccountToken --> TestSqlPolicy
    SqlAccountToken --> TestSqlHost
    SqlAccountToken --> TestSqlUserDailyCost
    Base <|-- SqlAgent
    SqlAgent --> TestSqlAgentToEntity
    SqlAgent --> TestSqlAgent
    SqlAgent --> TestSqlFile
    SqlAgent --> TestSqlUser
    SqlAgent --> TestSqlAccountToken
    SqlAgent --> TestSqlConversation
    SqlAgent --> TestSqlConversationItem
    SqlAgent --> TestSqlConversationLabel
    SqlAgent --> TestSqlSessionPermission
    SqlAgent --> TestSqlComment
    SqlAgent --> TestSqlPolicy
    SqlAgent --> TestSqlHost
    SqlAgent --> TestSqlUserDailyCost
    Base <|-- SqlComment
    SqlComment --> RemapReport
    SqlComment --> TestSqlAgent
    SqlComment --> TestSqlFile
    SqlComment --> TestSqlUser
    SqlComment --> TestSqlAccountToken
    SqlComment --> TestSqlConversation
    SqlComment --> TestSqlConversationItem
    SqlComment --> TestSqlConversationLabel
    SqlComment --> TestSqlSessionPermission
    SqlComment --> TestSqlComment
    SqlComment --> TestSqlPolicy
    SqlComment --> TestSqlHost
    SqlComment --> TestSqlUserDailyCost
    Base <|-- SqlConversationLabel
    SqlConversationLabel --> TestSqlAgent
    SqlConversationLabel --> TestSqlFile
    SqlConversationLabel --> TestSqlUser
    SqlConversationLabel --> TestSqlAccountToken
    SqlConversationLabel --> TestSqlConversation
    SqlConversationLabel --> TestSqlConversationItem
    SqlConversationLabel --> TestSqlConversationLabel
    SqlConversationLabel --> TestSqlSessionPermission
    SqlConversationLabel --> TestSqlComment
    SqlConversationLabel --> TestSqlPolicy
    SqlConversationLabel --> TestSqlHost
    SqlConversationLabel --> TestSqlUserDailyCost
    Base <|-- SqlDocument
    Base <|-- SqlFile
    SqlFile --> TestSqlAgent
    SqlFile --> TestSqlFile
    SqlFile --> TestSqlUser
    SqlFile --> TestSqlAccountToken
    SqlFile --> TestSqlConversation
    SqlFile --> TestSqlConversationItem
    SqlFile --> TestSqlConversationLabel
    SqlFile --> TestSqlSessionPermission
    SqlFile --> TestSqlComment
    SqlFile --> TestSqlPolicy
    SqlFile --> TestSqlHost
    SqlFile --> TestSqlUserDailyCost
    Base <|-- SqlImage
    Base <|-- SqlPolicy
    SqlPolicy --> RemapReport
    SqlPolicy --> TestSqlAgent
    SqlPolicy --> TestSqlFile
    SqlPolicy --> TestSqlUser
    SqlPolicy --> TestSqlAccountToken
    SqlPolicy --> TestSqlConversation
    SqlPolicy --> TestSqlConversationItem
    SqlPolicy --> TestSqlConversationLabel
    SqlPolicy --> TestSqlSessionPermission
    SqlPolicy --> TestSqlComment
    SqlPolicy --> TestSqlPolicy
    SqlPolicy --> TestSqlHost
    SqlPolicy --> TestSqlUserDailyCost
    Base <|-- SqlSessionPermission
    SqlSessionPermission --> RemapReport
    SqlSessionPermission --> TestSqlAgent
    SqlSessionPermission --> TestSqlFile
    SqlSessionPermission --> TestSqlUser
    SqlSessionPermission --> TestSqlAccountToken
    SqlSessionPermission --> TestSqlConversation
    SqlSessionPermission --> TestSqlConversationItem
    SqlSessionPermission --> TestSqlConversationLabel
    SqlSessionPermission --> TestSqlSessionPermission
    SqlSessionPermission --> TestSqlComment
    SqlSessionPermission --> TestSqlPolicy
    SqlSessionPermission --> TestSqlHost
    SqlSessionPermission --> TestSqlUserDailyCost
    Base <|-- SqlUserDailyCost
    SqlUserDailyCost --> TestSqlAgent
    SqlUserDailyCost --> TestSqlFile
    SqlUserDailyCost --> TestSqlUser
    SqlUserDailyCost --> TestSqlAccountToken
    SqlUserDailyCost --> TestSqlConversation
    SqlUserDailyCost --> TestSqlConversationItem
    SqlUserDailyCost --> TestSqlConversationLabel
    SqlUserDailyCost --> TestSqlSessionPermission
    SqlUserDailyCost --> TestSqlComment
    SqlUserDailyCost --> TestSqlPolicy
    SqlUserDailyCost --> TestSqlHost
    SqlUserDailyCost --> TestSqlUserDailyCost
    Base <|-- SqlVideo
    RemapReport --> SqlAccountToken
    RemapReport --> SqlComment
    RemapReport --> SqlPolicy
    RemapReport --> SqlSessionPermission
    SearchConversationsTool --> _FakeItem
    SearchConversationsTool --> _FakeConversationStore
    FakeArtifactStore --> MessageData
    TestSqlAgentToEntity --> SqlAgent
    TestSqlAccountToken --> SqlAccountToken
    TestSqlAccountToken --> SqlAgent
    TestSqlAccountToken --> SqlComment
    TestSqlAccountToken --> SqlConversationLabel
    TestSqlAccountToken --> SqlFile
    TestSqlAccountToken --> SqlPolicy
    TestSqlAccountToken --> SqlSessionPermission
    TestSqlAccountToken --> SqlUserDailyCost
    TestSqlAgent --> SqlAccountToken
    TestSqlAgent --> SqlAgent
    TestSqlAgent --> SqlComment
    TestSqlAgent --> SqlConversationLabel
    TestSqlAgent --> SqlFile
    TestSqlAgent --> SqlPolicy
    TestSqlAgent --> SqlSessionPermission
    TestSqlAgent --> SqlUserDailyCost
    TestSqlComment --> SqlAccountToken
    TestSqlComment --> SqlAgent
    TestSqlComment --> SqlComment
    TestSqlComment --> SqlConversationLabel
    TestSqlComment --> SqlFile
    TestSqlComment --> SqlPolicy
    TestSqlComment --> SqlSessionPermission
    TestSqlComment --> SqlUserDailyCost
    TestSqlConversation --> SqlAccountToken
    TestSqlConversation --> SqlAgent
    TestSqlConversation --> SqlComment
    TestSqlConversation --> SqlConversationLabel
    TestSqlConversation --> SqlFile
    TestSqlConversation --> SqlPolicy
    TestSqlConversation --> SqlSessionPermission
    TestSqlConversation --> SqlUserDailyCost
    TestSqlConversationItem --> SqlAccountToken
    TestSqlConversationItem --> SqlAgent
    TestSqlConversationItem --> SqlComment
    TestSqlConversationItem --> SqlConversationLabel
    TestSqlConversationItem --> SqlFile
    TestSqlConversationItem --> SqlPolicy
    TestSqlConversationItem --> SqlSessionPermission
    TestSqlConversationItem --> SqlUserDailyCost
    TestSqlConversationLabel --> SqlAccountToken
    TestSqlConversationLabel --> SqlAgent
    TestSqlConversationLabel --> SqlComment
    TestSqlConversationLabel --> SqlConversationLabel
    TestSqlConversationLabel --> SqlFile
    TestSqlConversationLabel --> SqlPolicy
    TestSqlConversationLabel --> SqlSessionPermission
    TestSqlConversationLabel --> SqlUserDailyCost
    TestSqlFile --> SqlAccountToken
    TestSqlFile --> SqlAgent
    TestSqlFile --> SqlComment
    TestSqlFile --> SqlConversationLabel
    TestSqlFile --> SqlFile
    TestSqlFile --> SqlPolicy
    TestSqlFile --> SqlSessionPermission
    TestSqlFile --> SqlUserDailyCost
    TestSqlHost --> SqlAccountToken
    TestSqlHost --> SqlAgent
    TestSqlHost --> SqlComment
    TestSqlHost --> SqlConversationLabel
    TestSqlHost --> SqlFile
    TestSqlHost --> SqlPolicy
    TestSqlHost --> SqlSessionPermission
    TestSqlHost --> SqlUserDailyCost
    TestSqlPolicy --> SqlAccountToken
    TestSqlPolicy --> SqlAgent
    TestSqlPolicy --> SqlComment
    TestSqlPolicy --> SqlConversationLabel
    TestSqlPolicy --> SqlFile
    TestSqlPolicy --> SqlPolicy
    TestSqlPolicy --> SqlSessionPermission
    TestSqlPolicy --> SqlUserDailyCost
    TestSqlSessionPermission --> SqlAccountToken
    TestSqlSessionPermission --> SqlAgent
    TestSqlSessionPermission --> SqlComment
    TestSqlSessionPermission --> SqlConversationLabel
    TestSqlSessionPermission --> SqlFile
    TestSqlSessionPermission --> SqlPolicy
    TestSqlSessionPermission --> SqlSessionPermission
    TestSqlSessionPermission --> SqlUserDailyCost
    TestSqlUser --> SqlAccountToken
    TestSqlUser --> SqlAgent
    TestSqlUser --> SqlComment
    TestSqlUser --> SqlConversationLabel
    TestSqlUser --> SqlFile
    TestSqlUser --> SqlPolicy
    TestSqlUser --> SqlSessionPermission
    TestSqlUser --> SqlUserDailyCost
    TestSqlUserDailyCost --> SqlAccountToken
    TestSqlUserDailyCost --> SqlAgent
    TestSqlUserDailyCost --> SqlComment
    TestSqlUserDailyCost --> SqlConversationLabel
    TestSqlUserDailyCost --> SqlFile
    TestSqlUserDailyCost --> SqlPolicy
    TestSqlUserDailyCost --> SqlSessionPermission
    TestSqlUserDailyCost --> SqlUserDailyCost
    _PagedStore --> ConversationItem
    _PagedStore --> MessageData
    _FakeConversationStore --> MessageData
    _FakeConversationStore --> SearchConversationsTool
    _FakeItem --> MessageData
    _FakeItem --> SearchConversationsTool
    LakebaseSentinel --> ErrorData
    LakebaseSentinel --> NewConversationItem
    LakebaseSentinel --> SlashCommandData
```

## Relationships

- [[Community 4]] (521 shared connections)
- [[Community 3]] (146 shared connections)
- [[Auth Config]] (23 shared connections)
- [[Community 14]] (19 shared connections)
- [[Community 16]] (7 shared connections)
- [[Community 2]] (2 shared connections)
- [[Community 11]] (1 shared connections)
- [[Community 13]] (1 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\claude_native_bridge.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/claude_native_bridge.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cli.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\cursor_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cursor_native_forwarder.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\converters.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/converters.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\db_models.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/db_models.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\env.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/env.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\43fb65b29464_initial_schema_agents_files_.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/43fb65b29464_initial_schema_agents_files_.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\5db033a3d4b7_replace_line_anchor_with_range.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/5db033a3d4b7_replace_line_anchor_with_range.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\8a4f1e9c2b07_add_policies_table.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/8a4f1e9c2b07_add_policies_table.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\93c04fcdff56_add_comments_table.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/93c04fcdff56_add_comments_table.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\a3b4c5d6e7f8_add_session_policy_columns.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/a3b4c5d6e7f8_add_session_policy_columns.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\a7f3c2d18e94_add_terminal_launch_args_to_conversations.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/a7f3c2d18e94_add_terminal_launch_args_to_conversations.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\b2c3d4e5f6a7_add_session_usage_to_conversations.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/b2c3d4e5f6a7_add_session_usage_to_conversations.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\c7f2a1d83e49_add_anchor_content_to_comments.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/c7f2a1d83e49_add_anchor_content_to_comments.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\d4e5f6a7b8c9_add_session_permissions.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/d4e5f6a7b8c9_add_session_permissions.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\d7a6b3c91f48_add_session_id_to_agents.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/d7a6b3c91f48_add_session_id_to_agents.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\d8e2f3b4c910_add_root_conversation_id.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/d8e2f3b4c910_add_root_conversation_id.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\e3b1f2a4c9d7_drop_pending_tool_calls_table.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/e3b1f2a4c9d7_drop_pending_tool_calls_table.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\e9f2a7c4d1b8_backfill_unbound_runner_id.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/e9f2a7c4d1b8_backfill_unbound_runner_id.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\db\migrations\versions\ecc0e25727b0_add_updated_at_to_comments.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/db/migrations/versions/ecc0e25727b0_add_updated_at_to_comments.py)

## Audit Trail

- EXTRACTED: 6513 (44%)
- INFERRED: 8437 (56%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*