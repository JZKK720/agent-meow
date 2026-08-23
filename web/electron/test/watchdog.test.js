// web/electron/test/watchdog.test.js
// Tests for the silent watchdog health monitor.

const { test } = require("node:test");
const assert = require("node:assert");

const { checkServiceHealth, WatchdogState, startWatchdog } = require("../src/watchdog");

test("WatchdogState shouldNotify returns true only on state change", () => {
  const state = new WatchdogState();
  assert.ok(state.shouldNotify("server", "down"));   // first time → notify
  assert.ok(!state.shouldNotify("server", "down"));  // still down → no notify
  assert.ok(state.shouldNotify("server", "ok"));     // changed → notify
  assert.ok(!state.shouldNotify("server", "ok"));    // still ok → no notify
});

test("WatchdogState tracks multiple services independently", () => {
  const state = new WatchdogState();
  assert.ok(state.shouldNotify("server", "ok"));
  assert.ok(state.shouldNotify("ollama", "ok"));
  assert.ok(!state.shouldNotify("server", "ok"));  // server unchanged
  assert.ok(state.shouldNotify("ollama", "down")); // ollama changed
});

test("WatchdogState getLastState returns last known state", () => {
  const state = new WatchdogState();
  state.shouldNotify("server", "ok");
  assert.strictEqual(state.getLastState("server"), "ok");
  state.shouldNotify("server", "down");
  assert.strictEqual(state.getLastState("server"), "down");
  assert.strictEqual(state.getLastState("unknown"), undefined);
});

test("checkServiceHealth returns ok or down", async () => {
  // Test against a non-existent server — should return "down"
  const result = await checkServiceHealth("http://127.0.0.1:65530/health", 1000);
  assert.ok(["ok", "down"].includes(result));
  assert.strictEqual(result, "down"); // port 65530 won't respond
});

test("startWatchdog returns a stop function", () => {
  const stop = startWatchdog(null);
  assert.strictEqual(typeof stop, "function");
  stop(); // clean up immediately
});

test("POLL_INTERVAL_MS is 15 minutes", () => {
  const { POLL_INTERVAL_MS } = require("../src/watchdog");
  assert.strictEqual(POLL_INTERVAL_MS, 15 * 60 * 1000);
});

test("INITIAL_DELAY_MS is 30 seconds", () => {
  const { INITIAL_DELAY_MS } = require("../src/watchdog");
  assert.strictEqual(INITIAL_DELAY_MS, 30000);
});
