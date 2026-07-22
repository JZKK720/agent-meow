# App Server Goals

> 581 nodes · cohesion 0.01

## Key Concepts

- [.aclose()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_runner_entry.py#L84) (155 connections)
- [OpenCodeClient](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_client.py#L123) (119 connections)
- [OpenCodeEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_client.py#L81) (78 connections)
- [NativePrompt](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_server_transport.py#L62) (57 connections)
- [test_opencode_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_forwarder.py#L1) (41 connections)
- [_FakeOpenCodeClient](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_forwarder.py#L26) (41 connections)
- [_RecordingServerClient](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_forwarder.py#L15) (41 connections)
- [.handle_event()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/codex/goal.py#L275) (40 connections)
- [test_sessions_namespace.py](file:///C:/Users/1/github-pr/agent-meow/tests/frontends/sdk/test_sessions_namespace.py#L1) (37 connections)
- [OpenCodeHttpTransport](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_http_transport.py#L126) (37 connections)
- [RunnerTCPSubprocess](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/transports/tcp.py#L54) (37 connections)
- [_forwarder()](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_forwarder.py#L41) (37 connections)
- [_event()](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_forwarder.py#L55) (33 connections)
- [_make_namespace()](file:///C:/Users/1/github-pr/agent-meow/tests/frontends/sdk/test_sessions_namespace.py#L56) (33 connections)
- [RunnerSubprocess](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/transports/uds.py#L62) (32 connections)
- [test_opencode_native_client.py](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_client.py#L1) (30 connections)
- [_client()](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_client.py#L21) (30 connections)
- [_FakeClient](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_http_transport.py#L70) (26 connections)
- [NativeLaunchConfig](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_server_transport.py#L21) (24 connections)
- [NativePermissionDecision](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_server_transport.py#L102) (24 connections)
- [test_opencode_native_app_server.py](file:///C:/Users/1/github-pr/agent-meow/tests/test_opencode_native_app_server.py#L1) (23 connections)
- [jsonResponse()](file:///C:/Users/1/github-pr/agent-meow/web/src/pages/ApprovePage.test.tsx#L21) (21 connections)
- [NativeEvent](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_server_transport.py#L85) (21 connections)
- [NativeServerHandle](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_server_transport.py#L45) (21 connections)
- [htmlCommentBridge.test.ts](file:///C:/Users/1/github-pr/agent-meow/web/src/shell/htmlCommentBridge.test.ts#L1) (20 connections)
- *... and 556 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class BridgeStateForSession {
        +goal.py()
        +.__call__()
    }
    class ClientSafeErrorDetail {
        +goal.py()
        +.__call__()
    }
    class NativeEvent {
        +native_server_transport.py()
    }
    class NativeLaunchConfig {
        +native_server_transport.py()
    }
    class NativePermissionDecision {
        +native_server_transport.py()
    }
    class NativePrompt {
        +native_server_transport.py()
        +.is_empty()
    }
    class NativeServerHandle {
        +native_server_transport.py()
    }
    class OpenCodeHttpTransport {
        +opencode_http_transport.py()
        +.__init__()
        +._client()
        +.start_server()
        +.stop_server()
        +.create_or_resume_session()
        +.send_prompt()
        +.abort()
        +.events()
        +.list_history()
    }
    class OpenCodeCliNotFoundError {
        +opencode_native_app_server.py()
    }
    class OpenCodeVersionError {
        +opencode_native_app_server.py()
    }
    class OpenCodeClient {
        +opencode_native_client.py()
        +.__init__()
        +.aclose()
        +.__aenter__()
        +.__aexit__()
        +._request_json()
        +.create_session()
        +.get_session()
        +.list_messages()
        +.get_message()
    }
    class OpenCodeEvent {
        +opencode_native_client.py()
    }
    class OpenCodeForwarderState {
        +opencode_native_forwarder.py()
        +.mark()
    }
    class OpenCodePermissionRequest {
        +opencode_native_permissions.py()
    }
    class RunnerTCPSubprocess {
        +tcp.py()
        +.__enter__()
        +.__exit__()
        +._kill()
    }
    class _Client {
        +test_codex_native_launch_config.py()
        +.__init__()
        +.get()
    }
    class _Resp {
        +test_codex_native_launch_config.py()
        +.__init__()
        +.json()
    }
    class _FakeClient {
        +test_opencode_http_transport.py()
        +.__init__()
        +.get_session()
        +.create_session()
        +.prompt_async()
        +.abort()
        +.list_messages()
        +.fork()
        +.reply_permission()
        +.events()
    }
    class _FakeOpenCodeClient {
        +test_opencode_native_forwarder.py()
        +.__init__()
        +.list_messages()
        +.reply_permission()
    }
    class _RecordingServerClient {
        +test_opencode_native_forwarder.py()
        +.__init__()
        +.post()
    }
    class _FakeOpenCodeClient {
        +test_opencode_resume.py()
        +.__init__()
        +.seed_context()
    }
    class _FakeServerClient {
        +test_opencode_resume.py()
        +.__init__()
        +.get()
    }
    class _Resp {
        +test_opencode_resume.py()
        +.__init__()
        +.raise_for_status()
        +.json()
    }
    class RunnerSubprocess {
        +uds.py()
        +.__enter__()
        +.__exit__()
        +._kill()
    }
    NativeEvent --> OpenCodeHttpTransport
    NativeLaunchConfig --> OpenCodeHttpTransport
    NativeLaunchConfig --> _FakeClient
    NativePermissionDecision --> OpenCodeHttpTransport
    NativePermissionDecision --> _FakeClient
    NativePrompt --> OpenCodeHttpTransport
    NativePrompt --> _FakeClient
    NativeServerHandle --> OpenCodeHttpTransport
    OpenCodeHttpTransport --> NativeEvent
    OpenCodeHttpTransport --> NativeLaunchConfig
    OpenCodeHttpTransport --> NativePermissionDecision
    OpenCodeHttpTransport --> NativePrompt
    OpenCodeHttpTransport --> NativeServerHandle
    OpenCodeHttpTransport --> OpenCodeClient
    OpenCodeHttpTransport --> _FakeClient
    OpenCodeCliNotFoundError --> OpenCodeClient
    OpenCodeVersionError --> OpenCodeClient
    OpenCodeClient --> OpenCodeHttpTransport
    OpenCodeClient --> OpenCodeVersionError
    OpenCodeClient --> OpenCodeCliNotFoundError
    OpenCodeClient --> OpenCodeForwarderState
    OpenCodeEvent --> OpenCodeForwarderState
    OpenCodeEvent --> _RecordingServerClient
    OpenCodeEvent --> _FakeOpenCodeClient
    OpenCodeForwarderState --> OpenCodeClient
    OpenCodeForwarderState --> OpenCodeEvent
    _FakeClient --> NativeLaunchConfig
    _FakeClient --> NativePermissionDecision
    _FakeClient --> NativePrompt
    _FakeClient --> OpenCodeHttpTransport
    _FakeOpenCodeClient --> OpenCodeEvent
    _RecordingServerClient --> OpenCodeEvent
```

## Relationships

- [[Community 1]] (40 shared connections)
- [[Auth Config]] (29 shared connections)
- [[Community 6]] (20 shared connections)
- [[Community 8]] (17 shared connections)
- [[Community 3]] (10 shared connections)
- [[Community 2]] (6 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\opencode_native_executor.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/opencode_native_executor.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\native_server_transport.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/native_server_transport.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\opencode_http_transport.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_http_transport.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\opencode_native_app_server.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_app_server.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\opencode_native_client.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_client.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\opencode_native_forwarder.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_forwarder.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\opencode_native_permissions.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/opencode_native_permissions.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\app.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/app.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\codex\goal.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/codex/goal.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\transports\tcp.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/transports/tcp.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\transports\uds.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/transports/uds.py)
- [C:\Users\1\github-pr\agent-meow\tests\e2e\test_opencode_native_wire_contract_e2e.py](file:///C:/Users/1/github-pr/agent-meow/tests/e2e/test_opencode_native_wire_contract_e2e.py)
- [C:\Users\1\github-pr\agent-meow\tests\frontends\sdk\test_sessions_chat.py](file:///C:/Users/1/github-pr/agent-meow/tests/frontends/sdk/test_sessions_chat.py)
- [C:\Users\1\github-pr\agent-meow\tests\frontends\sdk\test_sessions_namespace.py](file:///C:/Users/1/github-pr/agent-meow/tests/frontends/sdk/test_sessions_namespace.py)
- [C:\Users\1\github-pr\agent-meow\tests\inner\test_seccomp.py](file:///C:/Users/1/github-pr/agent-meow/tests/inner/test_seccomp.py)
- [C:\Users\1\github-pr\agent-meow\tests\repl\test_repl_fork_command.py](file:///C:/Users/1/github-pr/agent-meow/tests/repl/test_repl_fork_command.py)
- [C:\Users\1\github-pr\agent-meow\tests\repl\test_subagent_chat.py](file:///C:/Users/1/github-pr/agent-meow/tests/repl/test_subagent_chat.py)
- [C:\Users\1\github-pr\agent-meow\tests\repl\test_subagent_registry.py](file:///C:/Users/1/github-pr/agent-meow/tests/repl/test_subagent_registry.py)
- [C:\Users\1\github-pr\agent-meow\tests\runner\test_app_sessions_native.py](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_sessions_native.py)
- [C:\Users\1\github-pr\agent-meow\tests\runner\test_codex_native_launch_config.py](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_codex_native_launch_config.py)

## Audit Trail

- EXTRACTED: 1801 (54%)
- INFERRED: 1536 (46%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*