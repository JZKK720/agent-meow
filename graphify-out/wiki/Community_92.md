# Community 92

> 17 nodes · cohesion 0.20

## Key Concepts

- [_inject_mcp_schemas()](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/app.py#L6996) (10 connections)
- [test_app_schema_injection.py](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L1) (8 connections)
- [_schema()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L18) (8 connections)
- [test_inject_does_not_share_list_with_caller()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L82) (5 connections)
- [test_inject_noop_on_empty_mcp_schemas()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L68) (5 connections)
- [test_inject_skips_mcp_already_present()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L100) (5 connections)
- [test_inject_appends_after_existing_tools()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L28) (4 connections)
- [test_inject_creates_tools_when_missing()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L48) (4 connections)
- [test_inject_treats_none_tools_as_empty()](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L58) (4 connections)
- [Tests for ``_inject_mcp_schemas`` — the proxy_stream merge helper.  The runner](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L1) (1 connections)
- [An MCP schema already in ``body["tools"]`` is not appended again.      Regress](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L101) (1 connections)
- [OpenAI function-tool schema dict for use in expected/actual.](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L19) (1 connections)
- [MCP schemas land AFTER the agent-meow server's tools, in order.      Order mat](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L29) (1 connections)
- [A body with no ``tools`` key gets one populated from the MCP list.](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L49) (1 connections)
- [``tools: None`` (vs missing) is also handled — the ``or []`` guard.](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L59) (1 connections)
- [Empty MCP list leaves the body's tools list untouched (not even rewritten).](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L69) (1 connections)
- [The result list is independent of the mcp_schemas argument.      A later mutat](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py#L83) (1 connections)

## Relationships

- [[Community 3]] (1 shared connections)

## Source Files

- [C:\Users\1\github-pr\agent-meow\agent_meow\runner\app.py](file:///C:/Users/1/github-pr/agent-meow/agent_meow/runner/app.py)
- [C:\Users\1\github-pr\agent-meow\tests\runner\test_app_schema_injection.py](file:///C:/Users/1/github-pr/agent-meow/tests/runner/test_app_schema_injection.py)

## Audit Trail

- EXTRACTED: 44 (72%)
- INFERRED: 17 (28%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*