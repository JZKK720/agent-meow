# Community 74

> 23 nodes · cohesion 0.16

## Key Concepts

- [_run()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L12) (14 connections)
- [_diff()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L34) (13 connections)
- [test_exfil_scan.py](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L1) (11 connections)
- [test_benign_diff_is_clean()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L54) (4 connections)
- [test_ci_file_touch_is_info_not_blocking()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L147) (4 connections)
- [test_decode_then_exec_blocks()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L87) (4 connections)
- [test_environ_dump_blocks()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L99) (4 connections)
- [test_generic_access_token_field_not_blocked()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L169) (4 connections)
- [test_normal_gateway_test_not_blocked()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L126) (4 connections)
- [test_passing_environ_around_not_blocked()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L158) (4 connections)
- [test_reverse_shell_blocks()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L114) (4 connections)
- [test_secret_source_plus_network_blocks()](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L67) (4 connections)
- [Serializing the whole environment blocks (wholesale-secret exfil).      ``json](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L100) (1 connections)
- [A /dev/tcp reverse-shell shape blocks. Asserts exit 1.](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L115) (1 connections)
- [Using LLM_API_KEY + a network call (a normal e2e test) does NOT block.      Lo](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L127) (1 connections)
- [Run exfil-scan.py over a unified-diff string and return the finished process.](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L13) (1 connections)
- [A benign edit to a CI-executed file is INFO (clean), not blocking.      Editin](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L148) (1 connections)
- [Passing os.environ to a helper (no dump) does NOT block.      Regression: a ba](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L159) (1 connections)
- [A generic ``access_token`` field + a network call does NOT block.      Regress](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L170) (1 connections)
- [Build a minimal unified diff that ADDS *added* lines to *path*.      :param pa](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L35) (1 connections)
- [A normal test addition (no exfil, no CI-bootstrap file) scans clean.      Guar](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L55) (1 connections)
- [Reading a secret-named cred AND a network sink in one file blocks.      The ca](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L68) (1 connections)
- [A decode-then-exec payload blocks even without a network sink.      ``eval(bas](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py#L88) (1 connections)

## Relationships

- No strong cross-community connections detected

## Source Files

- [C:\Users\1\github-pr\agent-meow\tests\scripts\test_exfil_scan.py](file:///C:/Users/1/github-pr/agent-meow/tests/scripts/test_exfil_scan.py)

## Audit Trail

- EXTRACTED: 80 (94%)
- INFERRED: 5 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*