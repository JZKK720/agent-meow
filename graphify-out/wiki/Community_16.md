# Community 16

> 1011 nodes · cohesion 0.02

## Key Concepts

- [FilesystemRegistry](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/filesystem_registry.py#L316) (292 connections)
- [WebSearchTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/web_search.py#L56) (272 connections)
- [SysTerminalSendTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/sys_terminal.py#L798) (209 connections)
- [SysTerminalReadTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/sys_terminal.py#L872) (208 connections)
- [SysTerminalListTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/sys_terminal.py#L943) (207 connections)
- [UploadFileTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/upload_file.py#L63) (196 connections)
- [SysSessionGetHistoryTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/spawn.py#L1282) (195 connections)
- [SysCancelTaskTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/async_inbox.py#L37) (194 connections)
- [ListCommentsTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/list_comments.py#L12) (184 connections)
- [SysAddPolicyTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/policy.py#L18) (183 connections)
- [SysPolicyRegistryTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/policy.py#L94) (183 connections)
- [UpdateCommentTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/update_comment.py#L14) (183 connections)
- [DownloadFileTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/download_file.py#L13) (182 connections)
- [SysSessionListTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/spawn.py#L439) (182 connections)
- [SysCallAsyncTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/async_inbox.py#L129) (169 connections)
- [SysReadInboxTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/async_inbox.py#L240) (169 connections)
- [SysCancelAsyncTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/async_inbox.py#L334) (168 connections)
- [ReadSkillFileTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/read_skill_file.py#L13) (161 connections)
- [LoadSkillTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/load_skill.py#L13) (159 connections)
- [SysAgentDownloadTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/agents.py#L101) (156 connections)
- [SysAgentGetTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/agents.py#L31) (156 connections)
- [SysAgentListTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/agents.py#L187) (156 connections)
- [SysSessionGetInfoTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/spawn.py#L573) (150 connections)
- [SysOsEditTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/os_env.py#L289) (145 connections)
- [SysOsReadTool](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/os_env.py#L199) (145 connections)
- *... and 986 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class SysAdviseModelsTool {
        +advise_models.py()
        +.get_schema()
        +.invoke()
    }
    class SysAgentDownloadTool {
        +agents.py()
        +.get_schema()
    }
    class SysAgentGetTool {
        +agents.py()
        +.get_schema()
    }
    class SysAgentListTool {
        +agents.py()
        +.get_schema()
    }
    class SysCallAsyncTool {
        +async_inbox.py()
        +.get_schema()
        +.is_async()
    }
    class SysCancelAsyncTool {
        +async_inbox.py()
        +.get_schema()
    }
    class SysCancelTaskTool {
        +async_inbox.py()
        +.get_schema()
        +.invoke()
    }
    class SysReadInboxTool {
        +async_inbox.py()
        +.get_schema()
        +.is_async()
    }
    class Comment {
        +comment.py()
    }
    class CommentsFingerprint {
        +comment.py()
    }
    class DocConvertTool {
        +docs.py()
        +.get_schema()
    }
    class DocCreateOfficeTool {
        +docs.py()
        +.get_schema()
    }
    class DocCreateTool {
        +docs.py()
        +.get_schema()
    }
    class DocEditOfficeTool {
        +docs.py()
        +.get_schema()
    }
    class DocExportTool {
        +docs.py()
        +.get_schema()
    }
    class DocGenerateTool {
        +docs.py()
        +.get_schema()
    }
    class DocGetTool {
        +docs.py()
        +.get_schema()
    }
    class DocListTool {
        +docs.py()
        +.get_schema()
    }
    class DocUpdateTool {
        +docs.py()
        +.get_schema()
    }
    class DownloadFileTool {
        +download_file.py()
        +.get_schema()
        +.invoke()
    }
    class ExportAgentTool {
        +export_agent.py()
        +.get_schema()
        +.invoke()
    }
    class FilesystemRegistry {
        +filesystem_registry.py()
        +.__init__()
        +.record_change()
        +.seed_snapshot()
        +.unregister_conversation()
        +.start()
        +.stop()
    }
    class ImageEditAiTool {
        +images.py()
        +.get_schema()
    }
    class ImageEditTool {
        +images.py()
        +.get_schema()
    }
    class ImageGenerateTool {
        +images.py()
        +.get_schema()
    }
    class ImageGetTool {
        +images.py()
        +.get_schema()
    }
    class ImageListTool {
        +images.py()
        +.get_schema()
    }
    class ImageRemoveBgTool {
        +images.py()
        +.get_schema()
    }
    class ImageUploadTool {
        +images.py()
        +.get_schema()
    }
    class ListCommentsTool {
        +list_comments.py()
        +.get_schema()
        +.invoke()
    }
    class ListFilesTool {
        +list_files.py()
        +.get_schema()
        +.invoke()
    }
    class LoadSkillTool {
        +load_skill.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class _OSEnvBackedTool {
        +os_env.py()
        +.__init__()
        +.invoke()
        +._invoke_async()
    }
    class SysOsEditTool {
        +os_env.py()
        +.get_schema()
        +._invoke_async()
    }
    class SysOsReadTool {
        +os_env.py()
        +.get_schema()
        +._invoke_async()
    }
    class SysOsShellTool {
        +os_env.py()
        +.get_schema()
        +._invoke_async()
    }
    class SysOsWriteTool {
        +os_env.py()
        +.get_schema()
        +._invoke_async()
    }
    class SysAddPolicyTool {
        +policy.py()
        +.get_schema()
    }
    class SysPolicyRegistryTool {
        +policy.py()
        +.get_schema()
    }
    class ReadSkillFileTool {
        +read_skill_file.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class SysSessionCreateTool {
        +spawn.py()
        +.get_schema()
    }
    class SysSessionGetHistoryTool {
        +spawn.py()
        +.get_schema()
        +.invoke()
    }
    class SysSessionGetInfoTool {
        +spawn.py()
        +.get_schema()
    }
    class SysSessionListTool {
        +spawn.py()
        +.get_schema()
        +.invoke()
    }
    class SysSessionShareTool {
        +spawn.py()
        +.__init__()
        +.get_schema()
    }
    class SysTerminalListTool {
        +sys_terminal.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class SysTerminalReadTool {
        +sys_terminal.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class SysTerminalSendTool {
        +sys_terminal.py()
        +.__init__()
        +.get_schema()
        +.invoke()
    }
    class TestSysAgentDownloadTool {
        +test_agents.py()
        +.test_name()
        +.test_description_non_empty()
        +.test_schema_shape()
        +.test_invoke_raises()
    }
    class TestSysAgentGetTool {
        +test_agents.py()
        +.test_name()
        +.test_description_non_empty()
        +.test_schema_shape()
        +.test_invoke_raises()
    }
    class TestSysAgentListTool {
        +test_agents.py()
        +.test_name()
        +.test_description_non_empty()
        +.test_schema_shape()
        +.test_invoke_raises()
    }
    class _FakeArtifactStore {
        +test_file_tools.py()
        +.__init__()
        +.get()
    }
    class _FakeFile {
        +test_file_tools.py()
    }
    class _FakeFileStore {
        +test_file_tools.py()
        +.__init__()
        +.list()
        +.get()
    }
    class _FakePage {
        +test_file_tools.py()
    }
    class _InMemoryCommentStore {
        +test_list_comments.py()
        +.__init__()
        +.add()
        +.get()
        +.list_for_conversation()
        +.update_comment()
        +.delete()
        +.get_comments_fingerprints()
        +.remove_conversation()
    }
    class TestSysAddPolicyTool {
        +test_policy.py()
        +.test_name()
        +.test_description_non_empty()
        +.test_schema_shape()
        +.test_invoke_raises_not_implemented()
    }
    class TestSysPolicyRegistryTool {
        +test_policy.py()
        +.test_name()
        +.test_description_non_empty()
        +.test_schema_shape()
        +.test_invoke_raises_not_implemented()
    }
    class _FakePostClient {
        +test_policy_tool_dispatch.py()
        +.__init__()
        +.post()
    }
    class _FakePostResponse {
        +test_policy_tool_dispatch.py()
        +.json()
    }
    class _InMemoryCommentStore {
        +test_update_comment.py()
        +.__init__()
        +.add()
        +.get()
        +.list_for_conversation()
        +.update_comment()
        +.delete()
        +.get_comments_fingerprints()
        +.remove_conversation()
    }
    class SysTimerCancelTool {
        +timer.py()
        +.get_schema()
        +.invoke()
    }
    class SysTimerSetTool {
        +timer.py()
        +.get_schema()
        +.invoke()
    }
    class _CancelAsyncToolResult {
        +tool_dispatch.py()
    }
    class _ParsedTitle {
        +tool_dispatch.py()
    }
    class _PeekMeta {
        +tool_dispatch.py()
    }
    class _SubagentInboxEvaluation {
        +tool_dispatch.py()
    }
    class _SubagentLabel {
        +tool_dispatch.py()
    }
    class TranscribeAudioHighQualityTool {
        +transcribe.py()
        +.get_schema()
    }
    class TranscribeAudioTool {
        +transcribe.py()
        +.get_schema()
    }
    class SpeakTool {
        +tts.py()
        +.get_schema()
    }
    class TextToSpeechTool {
        +tts.py()
        +.get_schema()
    }
    class UpdateCommentTool {
        +update_comment.py()
        +.get_schema()
        +.invoke()
    }
    class UploadFileTool {
        +upload_file.py()
        +.get_schema()
        +.invoke()
    }
    class VideoGenerateTool {
        +videos.py()
        +.get_schema()
    }
    class VideoGetTool {
        +videos.py()
        +.get_schema()
    }
    class VideoListTool {
        +videos.py()
        +.get_schema()
    }
    class WebSearchTool {
        +web_search.py()
        +.__init__()
        +.get_schema()
        +.is_async()
        +.invoke()
    }
    SysAgentDownloadTool --> _CancelAsyncToolResult
    SysAgentDownloadTool --> _SubagentInboxEvaluation
    SysAgentDownloadTool --> _SubagentLabel
    SysAgentDownloadTool --> _ParsedTitle
    SysAgentDownloadTool --> _PeekMeta
    SysAgentDownloadTool --> TestSysAgentGetTool
    SysAgentDownloadTool --> TestSysAgentDownloadTool
    SysAgentDownloadTool --> TestSysAgentListTool
    SysAgentGetTool --> _CancelAsyncToolResult
    SysAgentGetTool --> _SubagentInboxEvaluation
    SysAgentGetTool --> _SubagentLabel
    SysAgentGetTool --> _ParsedTitle
    SysAgentGetTool --> _PeekMeta
    SysAgentGetTool --> TestSysAgentGetTool
    SysAgentGetTool --> TestSysAgentDownloadTool
    SysAgentGetTool --> TestSysAgentListTool
    SysAgentListTool --> _CancelAsyncToolResult
    SysAgentListTool --> _SubagentInboxEvaluation
    SysAgentListTool --> _SubagentLabel
    SysAgentListTool --> _ParsedTitle
    SysAgentListTool --> _PeekMeta
    SysAgentListTool --> TestSysAgentGetTool
    SysAgentListTool --> TestSysAgentDownloadTool
    SysAgentListTool --> TestSysAgentListTool
    SysCallAsyncTool --> _CancelAsyncToolResult
    SysCallAsyncTool --> _SubagentInboxEvaluation
    SysCallAsyncTool --> _SubagentLabel
    SysCallAsyncTool --> _ParsedTitle
    SysCallAsyncTool --> _PeekMeta
    SysCancelTaskTool <|-- SysCancelAsyncTool
    SysCancelAsyncTool --> _CancelAsyncToolResult
    SysCancelAsyncTool --> _SubagentInboxEvaluation
    SysCancelAsyncTool --> _SubagentLabel
    SysCancelAsyncTool --> _ParsedTitle
    SysCancelAsyncTool --> _PeekMeta
    SysCancelAsyncTool <|-- SysCancelTaskTool
    SysCancelTaskTool --> _CancelAsyncToolResult
    SysCancelTaskTool --> _SubagentInboxEvaluation
    SysCancelTaskTool --> _SubagentLabel
    SysCancelTaskTool --> _ParsedTitle
    SysCancelTaskTool --> _PeekMeta
    SysReadInboxTool --> _CancelAsyncToolResult
    SysReadInboxTool --> _SubagentInboxEvaluation
    SysReadInboxTool --> _SubagentLabel
    SysReadInboxTool --> _ParsedTitle
    SysReadInboxTool --> _PeekMeta
    Comment --> _InMemoryCommentStore
    Comment --> _InMemoryCommentStore
    CommentsFingerprint --> _InMemoryCommentStore
    CommentsFingerprint --> _InMemoryCommentStore
    DocConvertTool --> _CancelAsyncToolResult
    DocConvertTool --> _SubagentInboxEvaluation
    DocConvertTool --> _SubagentLabel
    DocConvertTool --> _ParsedTitle
    DocConvertTool --> _PeekMeta
    DocCreateOfficeTool --> _CancelAsyncToolResult
    DocCreateOfficeTool --> _SubagentInboxEvaluation
    DocCreateOfficeTool --> _SubagentLabel
    DocCreateOfficeTool --> _ParsedTitle
    DocCreateOfficeTool --> _PeekMeta
    DocCreateTool --> _CancelAsyncToolResult
    DocCreateTool --> _SubagentInboxEvaluation
    DocCreateTool --> _SubagentLabel
    DocCreateTool --> _ParsedTitle
    DocCreateTool --> _PeekMeta
    DocEditOfficeTool --> _CancelAsyncToolResult
    DocEditOfficeTool --> _SubagentInboxEvaluation
    DocEditOfficeTool --> _SubagentLabel
    DocEditOfficeTool --> _ParsedTitle
    DocEditOfficeTool --> _PeekMeta
    DocExportTool --> _CancelAsyncToolResult
    DocExportTool --> _SubagentInboxEvaluation
    DocExportTool --> _SubagentLabel
    DocExportTool --> _ParsedTitle
    DocExportTool --> _PeekMeta
    DocGenerateTool --> _CancelAsyncToolResult
    DocGenerateTool --> _SubagentInboxEvaluation
    DocGenerateTool --> _SubagentLabel
    DocGenerateTool --> _ParsedTitle
    DocGenerateTool --> _PeekMeta
    DocGetTool --> _CancelAsyncToolResult
    DocGetTool --> _SubagentInboxEvaluation
    DocGetTool --> _SubagentLabel
    DocGetTool --> _ParsedTitle
    DocGetTool --> _PeekMeta
    DocListTool --> _CancelAsyncToolResult
    DocListTool --> _SubagentInboxEvaluation
    DocListTool --> _SubagentLabel
    DocListTool --> _ParsedTitle
    DocListTool --> _PeekMeta
    DocUpdateTool --> _CancelAsyncToolResult
    DocUpdateTool --> _SubagentInboxEvaluation
    DocUpdateTool --> _SubagentLabel
    DocUpdateTool --> _ParsedTitle
    DocUpdateTool --> _PeekMeta
    DownloadFileTool --> _CancelAsyncToolResult
    DownloadFileTool --> _SubagentInboxEvaluation
    DownloadFileTool --> _SubagentLabel
    DownloadFileTool --> _ParsedTitle
    DownloadFileTool --> _PeekMeta
    DownloadFileTool --> _FakeFile
    DownloadFileTool --> _FakePage
    DownloadFileTool --> _FakeFileStore
    DownloadFileTool --> _FakeArtifactStore
    FilesystemRegistry --> _CancelAsyncToolResult
    FilesystemRegistry --> _SubagentInboxEvaluation
    FilesystemRegistry --> _SubagentLabel
    FilesystemRegistry --> _ParsedTitle
    FilesystemRegistry --> _PeekMeta
    ImageEditAiTool --> _CancelAsyncToolResult
    ImageEditAiTool --> _SubagentInboxEvaluation
    ImageEditAiTool --> _SubagentLabel
    ImageEditAiTool --> _ParsedTitle
    ImageEditAiTool --> _PeekMeta
    ImageEditTool --> _CancelAsyncToolResult
    ImageEditTool --> _SubagentInboxEvaluation
    ImageEditTool --> _SubagentLabel
    ImageEditTool --> _ParsedTitle
    ImageEditTool --> _PeekMeta
    ImageGenerateTool --> _CancelAsyncToolResult
    ImageGenerateTool --> _SubagentInboxEvaluation
    ImageGenerateTool --> _SubagentLabel
    ImageGenerateTool --> _ParsedTitle
    ImageGenerateTool --> _PeekMeta
    ImageGetTool --> _CancelAsyncToolResult
    ImageGetTool --> _SubagentInboxEvaluation
    ImageGetTool --> _SubagentLabel
    ImageGetTool --> _ParsedTitle
    ImageGetTool --> _PeekMeta
    ImageListTool --> _CancelAsyncToolResult
    ImageListTool --> _SubagentInboxEvaluation
    ImageListTool --> _SubagentLabel
    ImageListTool --> _ParsedTitle
    ImageListTool --> _PeekMeta
    ImageRemoveBgTool --> _CancelAsyncToolResult
    ImageRemoveBgTool --> _SubagentInboxEvaluation
    ImageRemoveBgTool --> _SubagentLabel
    ImageRemoveBgTool --> _ParsedTitle
    ImageRemoveBgTool --> _PeekMeta
    ImageUploadTool --> _CancelAsyncToolResult
    ImageUploadTool --> _SubagentInboxEvaluation
    ImageUploadTool --> _SubagentLabel
    ImageUploadTool --> _ParsedTitle
    ImageUploadTool --> _PeekMeta
    ListCommentsTool --> _CancelAsyncToolResult
    ListCommentsTool --> _SubagentInboxEvaluation
    ListCommentsTool --> _SubagentLabel
    ListCommentsTool --> _ParsedTitle
    ListCommentsTool --> _PeekMeta
    ListCommentsTool --> _InMemoryCommentStore
    ListFilesTool --> _FakeFile
    ListFilesTool --> _FakePage
    ListFilesTool --> _FakeFileStore
    ListFilesTool --> _FakeArtifactStore
    LoadSkillTool --> _CancelAsyncToolResult
    LoadSkillTool --> _SubagentInboxEvaluation
    LoadSkillTool --> _SubagentLabel
    LoadSkillTool --> _ParsedTitle
    LoadSkillTool --> _PeekMeta
    SysOsReadTool <|-- _OSEnvBackedTool
    SysOsWriteTool <|-- _OSEnvBackedTool
    SysOsEditTool <|-- _OSEnvBackedTool
    SysOsShellTool <|-- _OSEnvBackedTool
    _OSEnvBackedTool <|-- SysOsEditTool
    SysOsEditTool --> _CancelAsyncToolResult
    SysOsEditTool --> _SubagentInboxEvaluation
    SysOsEditTool --> _SubagentLabel
    SysOsEditTool --> _ParsedTitle
    SysOsEditTool --> _PeekMeta
    _OSEnvBackedTool <|-- SysOsReadTool
    SysOsReadTool --> _CancelAsyncToolResult
    SysOsReadTool --> _SubagentInboxEvaluation
    SysOsReadTool --> _SubagentLabel
    SysOsReadTool --> _ParsedTitle
    SysOsReadTool --> _PeekMeta
    _OSEnvBackedTool <|-- SysOsShellTool
    SysOsShellTool --> _CancelAsyncToolResult
    SysOsShellTool --> _SubagentInboxEvaluation
    SysOsShellTool --> _SubagentLabel
    SysOsShellTool --> _ParsedTitle
    SysOsShellTool --> _PeekMeta
    _OSEnvBackedTool <|-- SysOsWriteTool
    SysOsWriteTool --> _CancelAsyncToolResult
    SysOsWriteTool --> _SubagentInboxEvaluation
    SysOsWriteTool --> _SubagentLabel
    SysOsWriteTool --> _ParsedTitle
    SysOsWriteTool --> _PeekMeta
    SysAddPolicyTool --> _CancelAsyncToolResult
    SysAddPolicyTool --> _SubagentInboxEvaluation
    SysAddPolicyTool --> _SubagentLabel
    SysAddPolicyTool --> _ParsedTitle
    SysAddPolicyTool --> _PeekMeta
    SysAddPolicyTool --> TestSysAddPolicyTool
    SysAddPolicyTool --> TestSysPolicyRegistryTool
    SysPolicyRegistryTool --> _CancelAsyncToolResult
    SysPolicyRegistryTool --> _SubagentInboxEvaluation
    SysPolicyRegistryTool --> _SubagentLabel
    SysPolicyRegistryTool --> _ParsedTitle
    SysPolicyRegistryTool --> _PeekMeta
    SysPolicyRegistryTool --> TestSysAddPolicyTool
    SysPolicyRegistryTool --> TestSysPolicyRegistryTool
    ReadSkillFileTool --> _CancelAsyncToolResult
    ReadSkillFileTool --> _SubagentInboxEvaluation
    ReadSkillFileTool --> _SubagentLabel
    ReadSkillFileTool --> _ParsedTitle
    ReadSkillFileTool --> _PeekMeta
    SysSessionGetHistoryTool --> _CancelAsyncToolResult
    SysSessionGetHistoryTool --> _SubagentInboxEvaluation
    SysSessionGetHistoryTool --> _SubagentLabel
    SysSessionGetHistoryTool --> _ParsedTitle
    SysSessionGetHistoryTool --> _PeekMeta
    SysSessionGetInfoTool --> _CancelAsyncToolResult
    SysSessionGetInfoTool --> _SubagentInboxEvaluation
    SysSessionGetInfoTool --> _SubagentLabel
    SysSessionGetInfoTool --> _ParsedTitle
    SysSessionGetInfoTool --> _PeekMeta
    SysSessionListTool --> _CancelAsyncToolResult
    SysSessionListTool --> _SubagentInboxEvaluation
    SysSessionListTool --> _SubagentLabel
    SysSessionListTool --> _ParsedTitle
    SysSessionListTool --> _PeekMeta
    SysTerminalListTool --> _CancelAsyncToolResult
    SysTerminalListTool --> _SubagentInboxEvaluation
    SysTerminalListTool --> _SubagentLabel
    SysTerminalListTool --> _ParsedTitle
    SysTerminalListTool --> _PeekMeta
    SysTerminalReadTool --> _CancelAsyncToolResult
    SysTerminalReadTool --> _SubagentInboxEvaluation
    SysTerminalReadTool --> _SubagentLabel
    SysTerminalReadTool --> _ParsedTitle
    SysTerminalReadTool --> _PeekMeta
    SysTerminalSendTool --> _CancelAsyncToolResult
    SysTerminalSendTool --> _SubagentInboxEvaluation
    SysTerminalSendTool --> _SubagentLabel
    SysTerminalSendTool --> _ParsedTitle
    SysTerminalSendTool --> _PeekMeta
    TestSysAgentDownloadTool --> SysAgentDownloadTool
    TestSysAgentDownloadTool --> SysAgentGetTool
    TestSysAgentDownloadTool --> SysAgentListTool
    TestSysAgentGetTool --> SysAgentDownloadTool
    TestSysAgentGetTool --> SysAgentGetTool
    TestSysAgentGetTool --> SysAgentListTool
    TestSysAgentListTool --> SysAgentDownloadTool
    TestSysAgentListTool --> SysAgentGetTool
    TestSysAgentListTool --> SysAgentListTool
    _FakeArtifactStore --> DownloadFileTool
    _FakeArtifactStore --> ListFilesTool
    _FakeFile --> DownloadFileTool
    _FakeFile --> ListFilesTool
    _FakeFileStore --> DownloadFileTool
    _FakeFileStore --> ListFilesTool
    _FakePage --> DownloadFileTool
    _FakePage --> ListFilesTool
    _InMemoryCommentStore --> Comment
    _InMemoryCommentStore --> CommentsFingerprint
    _InMemoryCommentStore --> ListCommentsTool
    TestSysAddPolicyTool --> SysAddPolicyTool
    TestSysAddPolicyTool --> SysPolicyRegistryTool
    TestSysPolicyRegistryTool --> SysAddPolicyTool
    TestSysPolicyRegistryTool --> SysPolicyRegistryTool
    _InMemoryCommentStore --> Comment
    _InMemoryCommentStore --> CommentsFingerprint
    _InMemoryCommentStore --> UpdateCommentTool
    _CancelAsyncToolResult --> FilesystemRegistry
    _CancelAsyncToolResult --> SysCallAsyncTool
    _CancelAsyncToolResult --> SysCancelAsyncTool
    _CancelAsyncToolResult --> SysCancelTaskTool
    _CancelAsyncToolResult --> SysReadInboxTool
    _CancelAsyncToolResult --> DownloadFileTool
    _CancelAsyncToolResult --> ListCommentsTool
    _CancelAsyncToolResult --> SysOsEditTool
    _CancelAsyncToolResult --> SysOsReadTool
    _CancelAsyncToolResult --> SysOsShellTool
    _CancelAsyncToolResult --> SysOsWriteTool
    _CancelAsyncToolResult --> SysTerminalListTool
    _CancelAsyncToolResult --> SysTerminalReadTool
    _CancelAsyncToolResult --> SysTerminalSendTool
    _CancelAsyncToolResult --> UpdateCommentTool
    _CancelAsyncToolResult --> UploadFileTool
    _CancelAsyncToolResult --> SysAgentDownloadTool
    _CancelAsyncToolResult --> SysAgentGetTool
    _CancelAsyncToolResult --> SysAgentListTool
    _CancelAsyncToolResult --> DocConvertTool
    _CancelAsyncToolResult --> DocCreateOfficeTool
    _CancelAsyncToolResult --> DocCreateTool
    _CancelAsyncToolResult --> DocEditOfficeTool
    _CancelAsyncToolResult --> DocExportTool
    _CancelAsyncToolResult --> DocGenerateTool
    _CancelAsyncToolResult --> DocGetTool
    _CancelAsyncToolResult --> DocListTool
    _CancelAsyncToolResult --> DocUpdateTool
    _CancelAsyncToolResult --> ImageEditAiTool
    _CancelAsyncToolResult --> ImageEditTool
    _CancelAsyncToolResult --> ImageGenerateTool
    _CancelAsyncToolResult --> ImageGetTool
    _CancelAsyncToolResult --> ImageListTool
    _CancelAsyncToolResult --> ImageRemoveBgTool
    _CancelAsyncToolResult --> ImageUploadTool
    _CancelAsyncToolResult --> TranscribeAudioHighQualityTool
    _CancelAsyncToolResult --> TranscribeAudioTool
    _CancelAsyncToolResult --> SpeakTool
    _CancelAsyncToolResult --> TextToSpeechTool
    _CancelAsyncToolResult --> VideoGenerateTool
    _CancelAsyncToolResult --> VideoGetTool
    _CancelAsyncToolResult --> VideoListTool
    _CancelAsyncToolResult --> SysSessionGetHistoryTool
    _CancelAsyncToolResult --> SysSessionGetInfoTool
    _CancelAsyncToolResult --> SysSessionListTool
    _CancelAsyncToolResult --> SysAddPolicyTool
    _CancelAsyncToolResult --> SysPolicyRegistryTool
    _CancelAsyncToolResult --> WebSearchTool
    _CancelAsyncToolResult --> LoadSkillTool
    _CancelAsyncToolResult --> ReadSkillFileTool
    _ParsedTitle --> FilesystemRegistry
    _ParsedTitle --> SysCallAsyncTool
    _ParsedTitle --> SysCancelAsyncTool
    _ParsedTitle --> SysCancelTaskTool
    _ParsedTitle --> SysReadInboxTool
    _ParsedTitle --> DownloadFileTool
    _ParsedTitle --> ListCommentsTool
    _ParsedTitle --> SysOsEditTool
    _ParsedTitle --> SysOsReadTool
    _ParsedTitle --> SysOsShellTool
    _ParsedTitle --> SysOsWriteTool
    _ParsedTitle --> SysTerminalListTool
    _ParsedTitle --> SysTerminalReadTool
    _ParsedTitle --> SysTerminalSendTool
    _ParsedTitle --> UpdateCommentTool
    _ParsedTitle --> UploadFileTool
    _ParsedTitle --> SysAgentDownloadTool
    _ParsedTitle --> SysAgentGetTool
    _ParsedTitle --> SysAgentListTool
    _ParsedTitle --> DocConvertTool
    _ParsedTitle --> DocCreateOfficeTool
    _ParsedTitle --> DocCreateTool
    _ParsedTitle --> DocEditOfficeTool
    _ParsedTitle --> DocExportTool
    _ParsedTitle --> DocGenerateTool
    _ParsedTitle --> DocGetTool
    _ParsedTitle --> DocListTool
    _ParsedTitle --> DocUpdateTool
    _ParsedTitle --> ImageEditAiTool
    _ParsedTitle --> ImageEditTool
    _ParsedTitle --> ImageGenerateTool
    _ParsedTitle --> ImageGetTool
    _ParsedTitle --> ImageListTool
    _ParsedTitle --> ImageRemoveBgTool
    _ParsedTitle --> ImageUploadTool
    _ParsedTitle --> TranscribeAudioHighQualityTool
    _ParsedTitle --> TranscribeAudioTool
    _ParsedTitle --> SpeakTool
    _ParsedTitle --> TextToSpeechTool
    _ParsedTitle --> VideoGenerateTool
    _ParsedTitle --> VideoGetTool
    _ParsedTitle --> VideoListTool
    _ParsedTitle --> SysSessionGetHistoryTool
    _ParsedTitle --> SysSessionGetInfoTool
    _ParsedTitle --> SysSessionListTool
    _ParsedTitle --> SysAddPolicyTool
    _ParsedTitle --> SysPolicyRegistryTool
    _ParsedTitle --> WebSearchTool
    _ParsedTitle --> LoadSkillTool
    _ParsedTitle --> ReadSkillFileTool
    _PeekMeta --> FilesystemRegistry
    _PeekMeta --> SysCallAsyncTool
    _PeekMeta --> SysCancelAsyncTool
    _PeekMeta --> SysCancelTaskTool
    _PeekMeta --> SysReadInboxTool
    _PeekMeta --> DownloadFileTool
    _PeekMeta --> ListCommentsTool
    _PeekMeta --> SysOsEditTool
    _PeekMeta --> SysOsReadTool
    _PeekMeta --> SysOsShellTool
    _PeekMeta --> SysOsWriteTool
    _PeekMeta --> SysTerminalListTool
    _PeekMeta --> SysTerminalReadTool
    _PeekMeta --> SysTerminalSendTool
    _PeekMeta --> UpdateCommentTool
    _PeekMeta --> UploadFileTool
    _PeekMeta --> SysAgentDownloadTool
    _PeekMeta --> SysAgentGetTool
    _PeekMeta --> SysAgentListTool
    _PeekMeta --> DocConvertTool
    _PeekMeta --> DocCreateOfficeTool
    _PeekMeta --> DocCreateTool
    _PeekMeta --> DocEditOfficeTool
    _PeekMeta --> DocExportTool
    _PeekMeta --> DocGenerateTool
    _PeekMeta --> DocGetTool
    _PeekMeta --> DocListTool
    _PeekMeta --> DocUpdateTool
    _PeekMeta --> ImageEditAiTool
    _PeekMeta --> ImageEditTool
    _PeekMeta --> ImageGenerateTool
    _PeekMeta --> ImageGetTool
    _PeekMeta --> ImageListTool
    _PeekMeta --> ImageRemoveBgTool
    _PeekMeta --> ImageUploadTool
    _PeekMeta --> TranscribeAudioHighQualityTool
    _PeekMeta --> TranscribeAudioTool
    _PeekMeta --> SpeakTool
    _PeekMeta --> TextToSpeechTool
    _PeekMeta --> VideoGenerateTool
    _PeekMeta --> VideoGetTool
    _PeekMeta --> VideoListTool
    _PeekMeta --> SysSessionGetHistoryTool
    _PeekMeta --> SysSessionGetInfoTool
    _PeekMeta --> SysSessionListTool
    _PeekMeta --> SysAddPolicyTool
    _PeekMeta --> SysPolicyRegistryTool
    _PeekMeta --> WebSearchTool
    _PeekMeta --> LoadSkillTool
    _PeekMeta --> ReadSkillFileTool
    _SubagentInboxEvaluation --> FilesystemRegistry
    _SubagentInboxEvaluation --> SysCallAsyncTool
    _SubagentInboxEvaluation --> SysCancelAsyncTool
    _SubagentInboxEvaluation --> SysCancelTaskTool
    _SubagentInboxEvaluation --> SysReadInboxTool
    _SubagentInboxEvaluation --> DownloadFileTool
    _SubagentInboxEvaluation --> ListCommentsTool
    _SubagentInboxEvaluation --> SysOsEditTool
    _SubagentInboxEvaluation --> SysOsReadTool
    _SubagentInboxEvaluation --> SysOsShellTool
    _SubagentInboxEvaluation --> SysOsWriteTool
    _SubagentInboxEvaluation --> SysTerminalListTool
    _SubagentInboxEvaluation --> SysTerminalReadTool
    _SubagentInboxEvaluation --> SysTerminalSendTool
    _SubagentInboxEvaluation --> UpdateCommentTool
    _SubagentInboxEvaluation --> UploadFileTool
    _SubagentInboxEvaluation --> SysAgentDownloadTool
    _SubagentInboxEvaluation --> SysAgentGetTool
    _SubagentInboxEvaluation --> SysAgentListTool
    _SubagentInboxEvaluation --> DocConvertTool
    _SubagentInboxEvaluation --> DocCreateOfficeTool
    _SubagentInboxEvaluation --> DocCreateTool
    _SubagentInboxEvaluation --> DocEditOfficeTool
    _SubagentInboxEvaluation --> DocExportTool
    _SubagentInboxEvaluation --> DocGenerateTool
    _SubagentInboxEvaluation --> DocGetTool
    _SubagentInboxEvaluation --> DocListTool
    _SubagentInboxEvaluation --> DocUpdateTool
    _SubagentInboxEvaluation --> ImageEditAiTool
    _SubagentInboxEvaluation --> ImageEditTool
    _SubagentInboxEvaluation --> ImageGenerateTool
    _SubagentInboxEvaluation --> ImageGetTool
    _SubagentInboxEvaluation --> ImageListTool
    _SubagentInboxEvaluation --> ImageRemoveBgTool
    _SubagentInboxEvaluation --> ImageUploadTool
    _SubagentInboxEvaluation --> TranscribeAudioHighQualityTool
    _SubagentInboxEvaluation --> TranscribeAudioTool
    _SubagentInboxEvaluation --> SpeakTool
    _SubagentInboxEvaluation --> TextToSpeechTool
    _SubagentInboxEvaluation --> VideoGenerateTool
    _SubagentInboxEvaluation --> VideoGetTool
    _SubagentInboxEvaluation --> VideoListTool
    _SubagentInboxEvaluation --> SysSessionGetHistoryTool
    _SubagentInboxEvaluation --> SysSessionGetInfoTool
    _SubagentInboxEvaluation --> SysSessionListTool
    _SubagentInboxEvaluation --> SysAddPolicyTool
    _SubagentInboxEvaluation --> SysPolicyRegistryTool
    _SubagentInboxEvaluation --> WebSearchTool
    _SubagentInboxEvaluation --> LoadSkillTool
    _SubagentInboxEvaluation --> ReadSkillFileTool
    _SubagentLabel --> FilesystemRegistry
    _SubagentLabel --> SysCallAsyncTool
    _SubagentLabel --> SysCancelAsyncTool
    _SubagentLabel --> SysCancelTaskTool
    _SubagentLabel --> SysReadInboxTool
    _SubagentLabel --> DownloadFileTool
    _SubagentLabel --> ListCommentsTool
    _SubagentLabel --> SysOsEditTool
    _SubagentLabel --> SysOsReadTool
    _SubagentLabel --> SysOsShellTool
    _SubagentLabel --> SysOsWriteTool
    _SubagentLabel --> SysTerminalListTool
    _SubagentLabel --> SysTerminalReadTool
    _SubagentLabel --> SysTerminalSendTool
    _SubagentLabel --> UpdateCommentTool
    _SubagentLabel --> UploadFileTool
    _SubagentLabel --> SysAgentDownloadTool
    _SubagentLabel --> SysAgentGetTool
    _SubagentLabel --> SysAgentListTool
    _SubagentLabel --> DocConvertTool
    _SubagentLabel --> DocCreateOfficeTool
    _SubagentLabel --> DocCreateTool
    _SubagentLabel --> DocEditOfficeTool
    _SubagentLabel --> DocExportTool
    _SubagentLabel --> DocGenerateTool
    _SubagentLabel --> DocGetTool
    _SubagentLabel --> DocListTool
    _SubagentLabel --> DocUpdateTool
    _SubagentLabel --> ImageEditAiTool
    _SubagentLabel --> ImageEditTool
    _SubagentLabel --> ImageGenerateTool
    _SubagentLabel --> ImageGetTool
    _SubagentLabel --> ImageListTool
    _SubagentLabel --> ImageRemoveBgTool
    _SubagentLabel --> ImageUploadTool
    _SubagentLabel --> TranscribeAudioHighQualityTool
    _SubagentLabel --> TranscribeAudioTool
    _SubagentLabel --> SpeakTool
    _SubagentLabel --> TextToSpeechTool
    _SubagentLabel --> VideoGenerateTool
    _SubagentLabel --> VideoGetTool
    _SubagentLabel --> VideoListTool
    _SubagentLabel --> SysSessionGetHistoryTool
    _SubagentLabel --> SysSessionGetInfoTool
    _SubagentLabel --> SysSessionListTool
    _SubagentLabel --> SysAddPolicyTool
    _SubagentLabel --> SysPolicyRegistryTool
    _SubagentLabel --> WebSearchTool
    _SubagentLabel --> LoadSkillTool
    _SubagentLabel --> ReadSkillFileTool
    TranscribeAudioHighQualityTool --> _CancelAsyncToolResult
    TranscribeAudioHighQualityTool --> _SubagentInboxEvaluation
    TranscribeAudioHighQualityTool --> _SubagentLabel
    TranscribeAudioHighQualityTool --> _ParsedTitle
    TranscribeAudioHighQualityTool --> _PeekMeta
    TranscribeAudioTool --> _CancelAsyncToolResult
    TranscribeAudioTool --> _SubagentInboxEvaluation
    TranscribeAudioTool --> _SubagentLabel
    TranscribeAudioTool --> _ParsedTitle
    TranscribeAudioTool --> _PeekMeta
    SpeakTool --> _CancelAsyncToolResult
    SpeakTool --> _SubagentInboxEvaluation
    SpeakTool --> _SubagentLabel
    SpeakTool --> _ParsedTitle
    SpeakTool --> _PeekMeta
    TextToSpeechTool --> _CancelAsyncToolResult
    TextToSpeechTool --> _SubagentInboxEvaluation
    TextToSpeechTool --> _SubagentLabel
    TextToSpeechTool --> _ParsedTitle
    TextToSpeechTool --> _PeekMeta
    UpdateCommentTool --> _CancelAsyncToolResult
    UpdateCommentTool --> _SubagentInboxEvaluation
    UpdateCommentTool --> _SubagentLabel
    UpdateCommentTool --> _ParsedTitle
    UpdateCommentTool --> _PeekMeta
    UpdateCommentTool --> _InMemoryCommentStore
    UploadFileTool --> _CancelAsyncToolResult
    UploadFileTool --> _SubagentInboxEvaluation
    UploadFileTool --> _SubagentLabel
    UploadFileTool --> _ParsedTitle
    UploadFileTool --> _PeekMeta
    VideoGenerateTool --> _CancelAsyncToolResult
    VideoGenerateTool --> _SubagentInboxEvaluation
    VideoGenerateTool --> _SubagentLabel
    VideoGenerateTool --> _ParsedTitle
    VideoGenerateTool --> _PeekMeta
    VideoGetTool --> _CancelAsyncToolResult
    VideoGetTool --> _SubagentInboxEvaluation
    VideoGetTool --> _SubagentLabel
    VideoGetTool --> _ParsedTitle
    VideoGetTool --> _PeekMeta
    VideoListTool --> _CancelAsyncToolResult
    VideoListTool --> _SubagentInboxEvaluation
    VideoListTool --> _SubagentLabel
    VideoListTool --> _ParsedTitle
    VideoListTool --> _PeekMeta
    WebSearchTool --> _CancelAsyncToolResult
    WebSearchTool --> _SubagentInboxEvaluation
    WebSearchTool --> _SubagentLabel
    WebSearchTool --> _ParsedTitle
    WebSearchTool --> _PeekMeta
```

## Relationships

- [[Community 3]] (556 shared connections)
- [[Auth Config]] (28 shared connections)
- [[Community 14]] (26 shared connections)
- [[Community 4]] (2 shared connections)
- [[Community 1]] (2 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\_startup_profile.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/_startup_profile.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\comment.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/comment.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\native_coding_agents.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_coding_agents.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\agent\tools\python\list_builtin_tools.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/agent/tools/python/list_builtin_tools.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\tool_dispatch.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/tool_dispatch.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runtime\filesystem_registry.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runtime/filesystem_registry.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\server\performance_metrics.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/performance_metrics.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\session_lifecycle.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/session_lifecycle.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\base.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/base.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\__init__.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/__init__.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\advise_models.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/advise_models.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\agents.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/agents.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\async_inbox.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/async_inbox.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\docs.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/docs.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\download_file.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/download_file.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\export_agent.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/export_agent.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\images.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/images.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\list_comments.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/list_comments.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\list_files.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/list_files.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\tools\builtins\load_skill.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/tools/builtins/load_skill.py)

## Audit Trail

- EXTRACTED: 2800 (13%)
- INFERRED: 18219 (87%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*