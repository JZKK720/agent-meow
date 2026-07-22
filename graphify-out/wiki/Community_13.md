# Community 13

> 1386 nodes · cohesion 0.00

## Key Concepts

- [SandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/base.py#L152) (312 connections)
- [SandboxCapabilityError](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/base.py#L79) (305 connections)
- [RemoteCommandResult](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/base.py#L92) (290 connections)
- **ValueError** (238 connections)
- [RemoteProcess](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/base.py#L109) (192 connections)
- [DaytonaSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/daytona.py#L174) (184 connections)
- [BoxliteSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/boxlite.py#L176) (174 connections)
- [E2BSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/e2b.py#L341) (140 connections)
- [OpenShellSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/openshell.py#L302) (140 connections)
- [KubernetesSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/kubernetes.py#L736) (125 connections)
- [IsloSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/islo.py#L297) (117 connections)
- [echo](file:///C:/Users/1/github-pr/agent-meow/web/src/store/chatStore.test.ts#L934) (114 connections)
- [CWSandboxLauncher](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/cwsandbox.py#L115) (104 connections)
- [.provision()](file:///C:/Users/1/github-pr/agent-meow/tests/server/test_managed_hosts.py#L1240) (92 connections)
- [DerivedWorkspace](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/bootstrap.py#L343) (71 connections)
- [parse_sandbox_config()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/managed_hosts.py#L604) (63 connections)
- [test_e2b.py](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_e2b.py#L1) (59 connections)
- [managed_hosts.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/managed_hosts.py#L1) (55 connections)
- [test_boxlite.py](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_boxlite.py#L1) (50 connections)
- [test_daytona.py](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_daytona.py#L1) (49 connections)
- [test_bootstrap.py](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_bootstrap.py#L1) (39 connections)
- [test_openshell.py](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_openshell.py#L1) (33 connections)
- [_FakeLauncher](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_bootstrap.py#L100) (33 connections)
- [test_kubernetes.py](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_kubernetes.py#L1) (30 connections)
- [_FakeOpenShellAPI](file:///C:/Users/1/github-pr/agent-meow/tests/onboarding/sandboxes/test_openshell.py#L50) (26 connections)
- *... and 1361 more nodes in this community*

## Class Diagram

```mermaid
classDiagram
    class RemoteCommandResult {
        +base.py()
    }
    class RemoteProcess {
        +base.py()
    }
    class SandboxCapabilityError {
        +base.py()
    }
    class SandboxLauncher {
        +base.py()
        +.start_host()
        +.attach()
        +.keep_alive()
        +.run_background()
        +.put()
        +.stream_exec()
        +.forward_capability_error()
        +.forward_local_port()
        +.terminate()
    }
    class DerivedWorkspace {
        +bootstrap.py()
    }
    class BoxliteSandboxLauncher {
        +boxlite.py()
        +.__init__()
        +._aruntime()
        +._local_options()
        +._build_image_registries()
        +._resolve_env_name()
        +._resolve_sandbox_env()
        +.prepare()
        +.provision()
        +._best_effort_remove()
    }
    class _CWRemoteProcess {
        +cwsandbox.py()
        +.__init__()
        +.wait()
        +.close()
    }
    class CWSandboxLauncher {
        +cwsandbox.py()
        +.__init__()
        +._resolve()
        +._resolve_sandbox_env()
        +.prepare()
        +.provision()
        +.attach()
        +.keep_alive()
        +.run()
        +.put()
    }
    class DaytonaSandboxLauncher {
        +daytona.py()
        +.__init__()
        +._daytona()
        +._resolve()
        +._resolve_sandbox_env()
        +.prepare()
        +.provision()
        +.attach()
        +.keep_alive()
        +.run()
    }
    class _E2BRemoteProcess {
        +e2b.py()
        +.__init__()
        +.wait()
        +.close()
        +._run()
        +._iter_lines()
        +._enqueue()
    }
    class E2BSandboxLauncher {
        +e2b.py()
        +.__init__()
        +._resolved_template()
        +._resolve()
        +._resolve_sandbox_env()
        +.prepare()
        +.provision()
        +._create_sandbox()
        +.attach()
        +.keep_alive()
    }
    class _IsloAPIError {
        +islo.py()
    }
    class _IsloClient {
        +islo.py()
        +.__init__()
        +.close()
        +.create_sandbox()
        +.get_sandbox()
        +.delete_sandbox()
        +.upload_file()
        +.exec_stream()
        +._request_json()
        +._request()
    }
    class _IsloRemoteProcess {
        +islo.py()
        +.__init__()
        +.wait()
        +.close()
        +._run()
        +._enqueue()
    }
    class IsloSandboxLauncher {
        +islo.py()
        +.__init__()
        +.prepare()
        +.provision()
        +._clear_seeded_api_key_helper()
        +.attach()
        +.keep_alive()
        +.run()
        +.put()
        +.stream_exec()
    }
    class KubernetesSandboxLauncher {
        +kubernetes.py()
        +.__init__()
        +._load_core()
        +._close_clients()
        +._name_env_override()
        +._resolve_image()
        +._resolve_namespace()
        +._resolve_secret()
        +._resolve_service_account()
        +._resolve_sandbox_env()
    }
    class _ModalRemoteProcess {
        +modal.py()
        +.__init__()
        +.wait()
        +.close()
    }
    class _OpenShellClient {
        +openshell.py()
        +.__init__()
        +.close()
        +.create_sandbox()
        +.execute()
        +.run_foreground()
        +.exec_background()
        +.get_status()
        +.delete_sandbox()
        +._id_for()
    }
    class OpenShellSandboxLauncher {
        +openshell.py()
        +.__init__()
        +.prepare()
        +.provision()
        +.attach()
        +.keep_alive()
        +.run()
        +.run_background()
        +.put()
        +.exec_foreground()
    }
    class _RecordingLauncher {
        +test_base.py()
        +.__init__()
        +.prepare()
        +.provision()
        +.run()
        +.run_background()
    }
    class _FakeLauncher {
        +test_bootstrap.py()
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
    class _FakeRemoteProcess {
        +test_bootstrap.py()
        +.__init__()
        +.wait()
        +.close()
    }
    class _NoForwardLauncher {
        +test_bootstrap.py()
    }
    class _PutCall {
        +test_bootstrap.py()
    }
    class _StreamCall {
        +test_bootstrap.py()
    }
    class _CreateCall {
        +test_boxlite.py()
    }
    class _ExecCall {
        +test_boxlite.py()
    }
    class _FakeApiKeyCredential {
        +test_boxlite.py()
    }
    class _FakeBox {
        +test_boxlite.py()
        +.__init__()
        +._exec()
    }
    class _FakeBoxliteError {
        +test_boxlite.py()
    }
    class _FakeBoxliteState {
        +test_boxlite.py()
    }
    class _FakeBoxOptions {
        +test_boxlite.py()
        +.__init__()
    }
    class _FakeExecResult {
        +test_boxlite.py()
    }
    class _FakeExecution {
        +test_boxlite.py()
        +.__init__()
        +.stdout()
        +.stderr()
        +.wait()
    }
    class _FakeImageRegistry {
        +test_boxlite.py()
    }
    class _FakeOptions {
        +test_boxlite.py()
    }
    class _FakeRestOptions {
        +test_boxlite.py()
    }
    class _FakeStream {
        +test_boxlite.py()
        +.__init__()
        +.__aiter__()
        +.__anext__()
    }
    class _CWSandboxError {
        +test_cwsandbox.py()
    }
    class _FakeNetworkOptions {
        +test_cwsandbox.py()
    }
    class _FakeOp {
        +test_cwsandbox.py()
        +.__init__()
        +.result()
    }
    class _FakeProcess {
        +test_cwsandbox.py()
        +.__init__()
        +.result()
        +.wait()
        +.cancel()
    }
    class _FakeResult {
        +test_cwsandbox.py()
    }
    class _FakeSandbox {
        +test_cwsandbox.py()
        +.__init__()
        +.wait()
        +.exec()
        +.write_file()
        +.stop()
    }
    class _SandboxNotFoundError {
        +test_cwsandbox.py()
    }
    class _State {
        +test_cwsandbox.py()
    }
    class _CreateCall {
        +test_daytona.py()
    }
    class _CreateParams {
        +test_daytona.py()
    }
    class _ExecCall {
        +test_daytona.py()
    }
    class _ExecResponse {
        +test_daytona.py()
    }
    class _FakeConflictError {
        +test_daytona.py()
    }
    class _FakeDaytonaError {
        +test_daytona.py()
    }
    class _FakeDaytonaState {
        +test_daytona.py()
    }
    class _FakeFileSystem {
        +test_daytona.py()
        +.__init__()
        +.upload_file()
    }
    class _FakeNotFoundError {
        +test_daytona.py()
    }
    class _FakeProcess {
        +test_daytona.py()
        +.__init__()
        +.exec()
        +.create_pty_session()
    }
    class _FakePtyHandle {
        +test_daytona.py()
        +.__init__()
        +.send_input()
        +.wait()
        +.kill()
        +.disconnect()
    }
    class _FakePtyResult {
        +test_daytona.py()
    }
    class _FakeResources {
        +test_daytona.py()
    }
    class _FakeSandbox {
        +test_daytona.py()
        +.__init__()
        +.refresh_data()
        +.start()
        +.set_autostop_interval()
    }
    class _FakeSandboxState {
        +test_daytona.py()
    }
    class _UploadCall {
        +test_daytona.py()
    }
    class _AuthenticationException {
        +test_e2b.py()
    }
    class _CommandExitException {
        +test_e2b.py()
        +.__init__()
    }
    class _FakeCommandHandle {
        +test_e2b.py()
        +.__init__()
        +.wait()
        +.kill()
    }
    class _FakeCommandResult {
        +test_e2b.py()
    }
    class _FakeCommands {
        +test_e2b.py()
        +.__init__()
        +.run()
    }
    class _FakeFiles {
        +test_e2b.py()
        +.__init__()
        +.write()
    }
    class _FakeSandbox {
        +test_e2b.py()
        +.__init__()
        +.is_running()
        +.set_timeout()
    }
    class _NotFoundException {
        +test_e2b.py()
    }
    class _SandboxException {
        +test_e2b.py()
    }
    class _State {
        +test_e2b.py()
    }
    class _TemplateException {
        +test_e2b.py()
    }
    class _ExecCall {
        +test_islo.py()
    }
    class _FakeHTTPClient {
        +test_islo.py()
        +.__init__()
        +.post()
        +.request()
        +.close()
    }
    class _FakeIsloAPI {
        +test_islo.py()
        +.create_sandbox()
        +.get_sandbox()
        +.delete_sandbox()
        +.upload_file()
        +.exec_stream()
    }
    class _FakeResponse {
        +test_islo.py()
        +.__init__()
        +.json()
    }
    class _HttpRequest {
        +test_islo.py()
    }
    class _FakeApiException {
        +test_kubernetes.py()
        +.__init__()
    }
    class _FakeConfigException {
        +test_kubernetes.py()
    }
    class _FakeCore {
        +test_kubernetes.py()
        +.__init__()
        +.create_namespaced_secret()
        +.create_namespaced_pod()
        +.read_namespaced_pod()
        +.delete_namespaced_pod()
        +.delete_namespaced_secret()
        +.list_namespaced_event()
        +.read_namespaced_pod_log()
    }
    class _FakeExecChunk {
        +test_openshell.py()
    }
    class _FakeExecResult {
        +test_openshell.py()
    }
    class _FakeOpenShellAPI {
        +test_openshell.py()
        +.exec_background()
        +.create_sandbox()
        +.run_foreground()
        +.execute()
        +.get_status()
        +.delete_sandbox()
        +.close()
    }
    class _SDKState {
        +test_openshell.py()
    }
    class Package {
        +update_versions.py()
    }
    RemoteCommandResult --> BoxliteSandboxLauncher
    RemoteCommandResult --> _CWRemoteProcess
    RemoteCommandResult --> CWSandboxLauncher
    RemoteCommandResult --> DaytonaSandboxLauncher
    RemoteCommandResult --> _E2BRemoteProcess
    RemoteCommandResult --> E2BSandboxLauncher
    RemoteCommandResult --> _IsloAPIError
    RemoteCommandResult --> _IsloClient
    RemoteCommandResult --> _IsloRemoteProcess
    RemoteCommandResult --> IsloSandboxLauncher
    RemoteCommandResult --> KubernetesSandboxLauncher
    RemoteCommandResult --> _ModalRemoteProcess
    RemoteCommandResult --> _OpenShellClient
    RemoteCommandResult --> OpenShellSandboxLauncher
    RemoteCommandResult --> _RecordingLauncher
    RemoteCommandResult --> _FakeRemoteProcess
    RemoteCommandResult --> _PutCall
    RemoteCommandResult --> _StreamCall
    RemoteCommandResult --> _FakeLauncher
    RemoteCommandResult --> _NoForwardLauncher
    RemoteProcess --> DerivedWorkspace
    RemoteProcess --> _CWRemoteProcess
    RemoteProcess --> CWSandboxLauncher
    RemoteProcess --> _E2BRemoteProcess
    RemoteProcess --> E2BSandboxLauncher
    RemoteProcess --> _IsloAPIError
    RemoteProcess --> _IsloClient
    RemoteProcess --> _IsloRemoteProcess
    RemoteProcess --> IsloSandboxLauncher
    RemoteProcess --> _ModalRemoteProcess
    RemoteProcess --> _FakeRemoteProcess
    RemoteProcess --> _PutCall
    RemoteProcess --> _StreamCall
    RemoteProcess --> _FakeLauncher
    RemoteProcess --> _NoForwardLauncher
    SandboxCapabilityError --> _FakeRemoteProcess
    SandboxCapabilityError --> _PutCall
    SandboxCapabilityError --> _StreamCall
    SandboxCapabilityError --> _FakeLauncher
    SandboxCapabilityError --> _NoForwardLauncher
    SandboxCapabilityError --> _FakeBoxliteError
    SandboxCapabilityError --> _ExecCall
    SandboxCapabilityError --> _FakeStream
    SandboxCapabilityError --> _FakeExecResult
    SandboxCapabilityError --> _FakeExecution
    SandboxCapabilityError --> _FakeBox
    SandboxCapabilityError --> _FakeBoxOptions
    SandboxCapabilityError --> _CreateCall
    SandboxCapabilityError --> _FakeApiKeyCredential
    SandboxCapabilityError --> _FakeRestOptions
    SandboxCapabilityError --> _FakeImageRegistry
    SandboxCapabilityError --> _FakeOptions
    SandboxCapabilityError --> _FakeBoxliteState
    SandboxCapabilityError --> _FakeDaytonaError
    SandboxCapabilityError --> _FakeNotFoundError
    SandboxCapabilityError --> _FakeConflictError
    SandboxCapabilityError --> _FakeSandboxState
    SandboxCapabilityError --> _ExecCall
    SandboxCapabilityError --> _ExecResponse
    SandboxCapabilityError --> _FakePtyResult
    SandboxCapabilityError --> _FakePtyHandle
    SandboxCapabilityError --> _FakeProcess
    SandboxCapabilityError --> _FakeFileSystem
    SandboxCapabilityError --> _UploadCall
    SandboxCapabilityError --> _FakeSandbox
    SandboxCapabilityError --> _CreateParams
    SandboxCapabilityError --> _FakeResources
    SandboxCapabilityError --> _CreateCall
    SandboxCapabilityError --> _FakeDaytonaState
    SandboxCapabilityError --> _SandboxException
    SandboxCapabilityError --> _NotFoundException
    SandboxCapabilityError --> _TemplateException
    SandboxCapabilityError --> _AuthenticationException
    SandboxCapabilityError --> _CommandExitException
    SandboxCapabilityError --> _FakeCommandResult
    SandboxCapabilityError --> _State
    SandboxCapabilityError --> _FakeCommandHandle
    SandboxCapabilityError --> _FakeCommands
    SandboxCapabilityError --> _FakeFiles
    SandboxCapabilityError --> _FakeSandbox
    SandboxCapabilityError --> _FakeApiException
    SandboxCapabilityError --> _FakeConfigException
    SandboxCapabilityError --> _FakeCore
    SandboxLauncher --> DerivedWorkspace
    SandboxLauncher --> BoxliteSandboxLauncher
    SandboxLauncher --> _CWRemoteProcess
    SandboxLauncher --> CWSandboxLauncher
    SandboxLauncher --> DaytonaSandboxLauncher
    SandboxLauncher --> _E2BRemoteProcess
    SandboxLauncher --> E2BSandboxLauncher
    SandboxLauncher --> _IsloAPIError
    SandboxLauncher --> _IsloClient
    SandboxLauncher --> _IsloRemoteProcess
    SandboxLauncher --> IsloSandboxLauncher
    SandboxLauncher --> KubernetesSandboxLauncher
    SandboxLauncher --> _ModalRemoteProcess
    SandboxLauncher --> _OpenShellClient
    SandboxLauncher --> OpenShellSandboxLauncher
    SandboxLauncher --> _RecordingLauncher
    SandboxLauncher --> _FakeRemoteProcess
    SandboxLauncher --> _PutCall
    SandboxLauncher --> _StreamCall
    SandboxLauncher --> _FakeLauncher
    SandboxLauncher --> _NoForwardLauncher
    DerivedWorkspace --> RemoteProcess
    DerivedWorkspace --> SandboxLauncher
    DerivedWorkspace --> _FakeRemoteProcess
    DerivedWorkspace --> _PutCall
    DerivedWorkspace --> _StreamCall
    DerivedWorkspace --> _FakeLauncher
    DerivedWorkspace --> _NoForwardLauncher
    BoxliteSandboxLauncher --> RemoteCommandResult
    BoxliteSandboxLauncher --> SandboxLauncher
    BoxliteSandboxLauncher --> _FakeBoxliteError
    BoxliteSandboxLauncher --> _ExecCall
    BoxliteSandboxLauncher --> _FakeStream
    BoxliteSandboxLauncher --> _FakeExecResult
    BoxliteSandboxLauncher --> _FakeExecution
    BoxliteSandboxLauncher --> _FakeBox
    BoxliteSandboxLauncher --> _FakeBoxOptions
    BoxliteSandboxLauncher --> _CreateCall
    BoxliteSandboxLauncher --> _FakeApiKeyCredential
    BoxliteSandboxLauncher --> _FakeRestOptions
    BoxliteSandboxLauncher --> _FakeImageRegistry
    BoxliteSandboxLauncher --> _FakeOptions
    BoxliteSandboxLauncher --> _FakeBoxliteState
    _CWRemoteProcess --> RemoteCommandResult
    _CWRemoteProcess --> RemoteProcess
    _CWRemoteProcess --> SandboxLauncher
    CWSandboxLauncher --> RemoteCommandResult
    CWSandboxLauncher --> RemoteProcess
    CWSandboxLauncher --> SandboxLauncher
    CWSandboxLauncher --> _CWSandboxError
    CWSandboxLauncher --> _SandboxNotFoundError
    CWSandboxLauncher --> _FakeNetworkOptions
    CWSandboxLauncher --> _FakeResult
    CWSandboxLauncher --> _FakeOp
    CWSandboxLauncher --> _FakeProcess
    CWSandboxLauncher --> _State
    CWSandboxLauncher --> _FakeSandbox
    DaytonaSandboxLauncher --> RemoteCommandResult
    DaytonaSandboxLauncher --> SandboxLauncher
    DaytonaSandboxLauncher --> _FakeDaytonaError
    DaytonaSandboxLauncher --> _FakeNotFoundError
    DaytonaSandboxLauncher --> _FakeConflictError
    DaytonaSandboxLauncher --> _FakeSandboxState
    DaytonaSandboxLauncher --> _ExecCall
    DaytonaSandboxLauncher --> _ExecResponse
    DaytonaSandboxLauncher --> _FakePtyResult
    DaytonaSandboxLauncher --> _FakePtyHandle
    DaytonaSandboxLauncher --> _FakeProcess
    DaytonaSandboxLauncher --> _FakeFileSystem
    DaytonaSandboxLauncher --> _UploadCall
    DaytonaSandboxLauncher --> _FakeSandbox
    DaytonaSandboxLauncher --> _CreateParams
    DaytonaSandboxLauncher --> _FakeResources
    DaytonaSandboxLauncher --> _CreateCall
    DaytonaSandboxLauncher --> _FakeDaytonaState
    _E2BRemoteProcess --> RemoteCommandResult
    _E2BRemoteProcess --> RemoteProcess
    _E2BRemoteProcess --> SandboxLauncher
    E2BSandboxLauncher --> RemoteCommandResult
    E2BSandboxLauncher --> RemoteProcess
    E2BSandboxLauncher --> SandboxLauncher
    E2BSandboxLauncher --> _SandboxException
    E2BSandboxLauncher --> _NotFoundException
    E2BSandboxLauncher --> _TemplateException
    E2BSandboxLauncher --> _AuthenticationException
    E2BSandboxLauncher --> _CommandExitException
    E2BSandboxLauncher --> _FakeCommandResult
    E2BSandboxLauncher --> _State
    E2BSandboxLauncher --> _FakeCommandHandle
    E2BSandboxLauncher --> _FakeCommands
    E2BSandboxLauncher --> _FakeFiles
    E2BSandboxLauncher --> _FakeSandbox
    _IsloAPIError --> RemoteCommandResult
    _IsloAPIError --> RemoteProcess
    _IsloAPIError --> SandboxLauncher
    _IsloClient --> RemoteCommandResult
    _IsloClient --> RemoteProcess
    _IsloClient --> SandboxLauncher
    _IsloRemoteProcess --> RemoteCommandResult
    _IsloRemoteProcess --> RemoteProcess
    _IsloRemoteProcess --> SandboxLauncher
    IsloSandboxLauncher --> RemoteCommandResult
    IsloSandboxLauncher --> RemoteProcess
    IsloSandboxLauncher --> SandboxLauncher
    IsloSandboxLauncher --> _HttpRequest
    IsloSandboxLauncher --> _FakeResponse
    IsloSandboxLauncher --> _FakeHTTPClient
    IsloSandboxLauncher --> _ExecCall
    IsloSandboxLauncher --> _FakeIsloAPI
    KubernetesSandboxLauncher --> RemoteCommandResult
    KubernetesSandboxLauncher --> SandboxLauncher
    KubernetesSandboxLauncher --> _FakeApiException
    KubernetesSandboxLauncher --> _FakeConfigException
    KubernetesSandboxLauncher --> _FakeCore
    _ModalRemoteProcess --> RemoteCommandResult
    _ModalRemoteProcess --> RemoteProcess
    _ModalRemoteProcess --> SandboxLauncher
    _OpenShellClient --> RemoteCommandResult
    _OpenShellClient --> SandboxLauncher
    OpenShellSandboxLauncher --> RemoteCommandResult
    OpenShellSandboxLauncher --> SandboxLauncher
    OpenShellSandboxLauncher --> _FakeExecResult
    OpenShellSandboxLauncher --> _FakeExecChunk
    OpenShellSandboxLauncher --> _FakeOpenShellAPI
    OpenShellSandboxLauncher --> _SDKState
    _RecordingLauncher --> RemoteCommandResult
    _RecordingLauncher --> SandboxLauncher
    _NoForwardLauncher <|-- _FakeLauncher
    _FakeLauncher --> RemoteCommandResult
    _FakeLauncher --> RemoteProcess
    _FakeLauncher --> SandboxCapabilityError
    _FakeLauncher --> SandboxLauncher
    _FakeLauncher --> DerivedWorkspace
    _FakeRemoteProcess --> RemoteCommandResult
    _FakeRemoteProcess --> RemoteProcess
    _FakeRemoteProcess --> SandboxCapabilityError
    _FakeRemoteProcess --> SandboxLauncher
    _FakeRemoteProcess --> DerivedWorkspace
    _FakeLauncher <|-- _NoForwardLauncher
    _NoForwardLauncher --> RemoteCommandResult
    _NoForwardLauncher --> RemoteProcess
    _NoForwardLauncher --> SandboxCapabilityError
    _NoForwardLauncher --> SandboxLauncher
    _NoForwardLauncher --> DerivedWorkspace
    _PutCall --> RemoteCommandResult
    _PutCall --> RemoteProcess
    _PutCall --> SandboxCapabilityError
    _PutCall --> SandboxLauncher
    _PutCall --> DerivedWorkspace
    _StreamCall --> RemoteCommandResult
    _StreamCall --> RemoteProcess
    _StreamCall --> SandboxCapabilityError
    _StreamCall --> SandboxLauncher
    _StreamCall --> DerivedWorkspace
    _CreateCall --> SandboxCapabilityError
    _CreateCall --> BoxliteSandboxLauncher
    _ExecCall --> SandboxCapabilityError
    _ExecCall --> BoxliteSandboxLauncher
    _FakeApiKeyCredential --> SandboxCapabilityError
    _FakeApiKeyCredential --> BoxliteSandboxLauncher
    _FakeBox --> SandboxCapabilityError
    _FakeBox --> BoxliteSandboxLauncher
    _FakeBoxliteError --> SandboxCapabilityError
    _FakeBoxliteError --> BoxliteSandboxLauncher
    _FakeBoxliteState --> SandboxCapabilityError
    _FakeBoxliteState --> BoxliteSandboxLauncher
    _FakeBoxOptions --> SandboxCapabilityError
    _FakeBoxOptions --> BoxliteSandboxLauncher
    _FakeExecResult --> SandboxCapabilityError
    _FakeExecResult --> BoxliteSandboxLauncher
    _FakeExecution --> SandboxCapabilityError
    _FakeExecution --> BoxliteSandboxLauncher
    _FakeImageRegistry --> SandboxCapabilityError
    _FakeImageRegistry --> BoxliteSandboxLauncher
    _FakeOptions --> SandboxCapabilityError
    _FakeOptions --> BoxliteSandboxLauncher
    _FakeRestOptions --> SandboxCapabilityError
    _FakeRestOptions --> BoxliteSandboxLauncher
    _FakeStream --> SandboxCapabilityError
    _FakeStream --> BoxliteSandboxLauncher
    _SandboxNotFoundError <|-- _CWSandboxError
    _CWSandboxError --> CWSandboxLauncher
    _FakeNetworkOptions --> CWSandboxLauncher
    _FakeOp --> CWSandboxLauncher
    _FakeProcess --> CWSandboxLauncher
    _FakeResult --> CWSandboxLauncher
    _FakeSandbox --> CWSandboxLauncher
    _CWSandboxError <|-- _SandboxNotFoundError
    _SandboxNotFoundError --> CWSandboxLauncher
    _State --> CWSandboxLauncher
    _CreateCall --> SandboxCapabilityError
    _CreateCall --> DaytonaSandboxLauncher
    _CreateParams --> SandboxCapabilityError
    _CreateParams --> DaytonaSandboxLauncher
    _ExecCall --> SandboxCapabilityError
    _ExecCall --> DaytonaSandboxLauncher
    _ExecResponse --> SandboxCapabilityError
    _ExecResponse --> DaytonaSandboxLauncher
    _FakeDaytonaError <|-- _FakeConflictError
    _FakeConflictError --> SandboxCapabilityError
    _FakeConflictError --> DaytonaSandboxLauncher
    _FakeNotFoundError <|-- _FakeDaytonaError
    _FakeConflictError <|-- _FakeDaytonaError
    _FakeDaytonaError --> SandboxCapabilityError
    _FakeDaytonaError --> DaytonaSandboxLauncher
    _FakeDaytonaState --> SandboxCapabilityError
    _FakeDaytonaState --> DaytonaSandboxLauncher
    _FakeFileSystem --> SandboxCapabilityError
    _FakeFileSystem --> DaytonaSandboxLauncher
    _FakeDaytonaError <|-- _FakeNotFoundError
    _FakeNotFoundError --> SandboxCapabilityError
    _FakeNotFoundError --> DaytonaSandboxLauncher
    _FakeProcess --> SandboxCapabilityError
    _FakeProcess --> DaytonaSandboxLauncher
    _FakePtyHandle --> SandboxCapabilityError
    _FakePtyHandle --> DaytonaSandboxLauncher
    _FakePtyResult --> SandboxCapabilityError
    _FakePtyResult --> DaytonaSandboxLauncher
    _FakeResources --> SandboxCapabilityError
    _FakeResources --> DaytonaSandboxLauncher
    _FakeSandbox --> SandboxCapabilityError
    _FakeSandbox --> DaytonaSandboxLauncher
    _FakeSandboxState --> SandboxCapabilityError
    _FakeSandboxState --> DaytonaSandboxLauncher
    _UploadCall --> SandboxCapabilityError
    _UploadCall --> DaytonaSandboxLauncher
    _AuthenticationException --> SandboxCapabilityError
    _AuthenticationException --> E2BSandboxLauncher
    _SandboxException <|-- _CommandExitException
    _CommandExitException --> SandboxCapabilityError
    _CommandExitException --> E2BSandboxLauncher
    _FakeCommandHandle --> SandboxCapabilityError
    _FakeCommandHandle --> E2BSandboxLauncher
    _FakeCommandResult --> SandboxCapabilityError
    _FakeCommandResult --> E2BSandboxLauncher
    _FakeCommands --> SandboxCapabilityError
    _FakeCommands --> E2BSandboxLauncher
    _FakeFiles --> SandboxCapabilityError
    _FakeFiles --> E2BSandboxLauncher
    _FakeSandbox --> SandboxCapabilityError
    _FakeSandbox --> E2BSandboxLauncher
    _SandboxException <|-- _NotFoundException
    _NotFoundException --> SandboxCapabilityError
    _NotFoundException --> E2BSandboxLauncher
    _NotFoundException <|-- _SandboxException
    _TemplateException <|-- _SandboxException
    _CommandExitException <|-- _SandboxException
    _SandboxException --> SandboxCapabilityError
    _SandboxException --> E2BSandboxLauncher
    _State --> SandboxCapabilityError
    _State --> E2BSandboxLauncher
    _SandboxException <|-- _TemplateException
    _TemplateException --> SandboxCapabilityError
    _TemplateException --> E2BSandboxLauncher
    _ExecCall --> IsloSandboxLauncher
    _FakeHTTPClient --> IsloSandboxLauncher
    _FakeIsloAPI --> IsloSandboxLauncher
    _FakeResponse --> IsloSandboxLauncher
    _HttpRequest --> IsloSandboxLauncher
    _FakeApiException --> SandboxCapabilityError
    _FakeApiException --> KubernetesSandboxLauncher
    _FakeConfigException --> SandboxCapabilityError
    _FakeConfigException --> KubernetesSandboxLauncher
    _FakeCore --> SandboxCapabilityError
    _FakeCore --> KubernetesSandboxLauncher
    _FakeExecChunk --> OpenShellSandboxLauncher
    _FakeExecResult --> OpenShellSandboxLauncher
    _FakeOpenShellAPI --> OpenShellSandboxLauncher
    _SDKState --> OpenShellSandboxLauncher
```

## Relationships

- [[Auth Config]] (46 shared connections)
- [[Community 3]] (6 shared connections)
- [[Community 14]] (6 shared connections)
- [[Community 1]] (2 shared connections)
- [[Community 2]] (1 shared connections)
- [[Community 23]] (1 shared connections)
- [[Community 18]] (1 shared connections)
- [[Community 4]] (1 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\cli_sandbox.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/cli_sandbox.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\codex_native_app_server.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/codex_native_app_server.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\entities\conversation.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/entities/conversation.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\egress\controller.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/egress/controller.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\inner\policies.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/inner/policies.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\__init__.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/__init__.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\base.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/base.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\bootstrap.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/bootstrap.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\boxlite.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/boxlite.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\cwsandbox.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/cwsandbox.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\daytona.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/daytona.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\e2b.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/e2b.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\islo.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/islo.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\kubernetes.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/kubernetes.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\modal.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/modal.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\onboarding\sandboxes\openshell.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/onboarding/sandboxes/openshell.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\app.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/app.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\transports\ws_tunnel\registry.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/transports/ws_tunnel/registry.py)
- [C:\Users\1\github-pr\agent-meow\agent_meow\server\managed_hosts.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/server/managed_hosts.py)

## Audit Trail

- EXTRACTED: 3781 (40%)
- INFERRED: 5567 (60%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*