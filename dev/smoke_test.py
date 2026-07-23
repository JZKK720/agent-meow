"""Smoke test the gateway server (6767) and web dev server (5173)."""
import http.client
import json
import sys

def test_endpoint(host, port, path, method="GET", expected_status=200):
    """Test an HTTP endpoint and return (success, status, body_snippet)."""
    try:
        conn = http.client.HTTPConnection(host, port, timeout=10)
        conn.request(method, path)
        resp = conn.getresponse()
        body = resp.read().decode("utf-8", errors="replace")
        conn.close()
        success = resp.status == expected_status
        return (success, resp.status, body[:200])
    except Exception as e:
        return (False, 0, str(e))

print("=" * 60)
print("SMOKE TEST: gateway :6767 + web :5173")
print("=" * 60)

# Test gateway server endpoints
print("\n--- Gateway Server (127.0.0.1:6767) ---")
gateway_tests = [
    ("/health", "GET", 200),
    ("/v1/sessions", "GET", 200),
    ("/v1/agents", "GET", 200),
    ("/v1/harnesses", "GET", 200),
]
gw_pass = 0
gw_fail = 0
for path, method, expected in gateway_tests:
    ok, status, body = test_endpoint("127.0.0.1", 6767, path, method, expected)
    icon = "✅" if ok else "❌"
    print(f"  {icon} {method} {path} -> {status} (expected {expected})")
    if not ok:
        print(f"     body: {body[:150]}")
    if ok:
        gw_pass += 1
    else:
        gw_fail += 1

# Test web dev server
print("\n--- Web Dev Server (127.0.0.1:5173) ---")
web_tests = [
    ("/", "GET", 200),
]
web_pass = 0
web_fail = 0
for path, method, expected in web_tests:
    ok, status, body = test_endpoint("127.0.0.1", 5173, path, method, expected)
    icon = "✅" if ok else "❌"
    print(f"  {icon} {method} {path} -> {status} (expected {expected})")
    if not ok:
        print(f"     body: {body[:150]}")
    if ok:
        web_pass += 1
    else:
        web_fail += 1

# Test proxy: web -> gateway
print("\n--- Proxy: Web :5173 -> Gateway :6767 ---")
ok, status, body = test_endpoint("127.0.0.1", 5173, "/health", "GET", 200)
icon = "✅" if ok else "❌"
print(f"  {icon} GET /health via :5173 proxy -> {status}")
if not ok:
    print(f"     body: {body[:150]}")
if ok:
    web_pass += 1
else:
    web_fail += 1

# Summary
print("\n" + "=" * 60)
total_pass = gw_pass + web_pass
total_fail = gw_fail + web_fail
print(f"Gateway: {gw_pass} passed, {gw_fail} failed")
print(f"Web:     {web_pass} passed, {web_fail} failed")
print(f"TOTAL:   {total_pass} passed, {total_fail} failed")
print("=" * 60)
sys.exit(0 if total_fail == 0 else 1)
