// web/electron/test/port_check.test.js
// Tests for the port-based service detection helper.

const { test } = require("node:test");
const assert = require("node:assert");
const net = require("node:net");
const { isPortOpen, OLLAMA_PORT, HERMES_PORT, AGENT_MEOW_PORT } = require("../src/wizard/steps/port_check");

test("isPortOpen returns false for a closed port", async () => {
  // Use a port that's very unlikely to be open.
  const result = await isPortOpen(1);
  assert.strictEqual(result, false);
});

test("isPortOpen returns true when a server is listening", async () => {
  // Start a temporary TCP server on an ephemeral port.
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    const result = await isPortOpen(port);
    assert.strictEqual(result, true);
  } finally {
    server.close();
  }
});

test("isPortOpen returns false after server closes", async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  // Give the OS a moment to release the port.
  await new Promise((resolve) => setTimeout(resolve, 100));
  const result = await isPortOpen(port);
  assert.strictEqual(result, false);
});

test("port constants are correct", () => {
  assert.strictEqual(OLLAMA_PORT, 11434);
  assert.strictEqual(HERMES_PORT, 8642);
  assert.strictEqual(AGENT_MEOW_PORT, 6767);
});