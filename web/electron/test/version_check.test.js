// web/electron/test/version_check.test.js
// Tests that verify the Layer 2 pip-upgrader was REMOVED.
//
// The upgrader was dangerous: it ran `pip install --upgrade omnigent` which
// pulled the UPSTREAM PyPI package, overwriting agent-meow's custom server
// code (service_supervisor, voice_proxy, whisper_server support) with upstream
// code that lacks those features. These tests ensure the removed functions
// stay removed.

const { test } = require("node:test");
const assert = require("node:assert");

const cli = require("../src/omnigent_cli");

test("readBundledAgentMeowVersion is not exported (removed)", () => {
  assert.strictEqual(typeof cli.readBundledAgentMeowVersion, "undefined");
});

test("readInstalledAgentMeowVersion is not exported (removed)", () => {
  assert.strictEqual(typeof cli.readInstalledAgentMeowVersion, "undefined");
});

test("checkAgentMeowVersion is not exported (removed)", () => {
  assert.strictEqual(typeof cli.checkAgentMeowVersion, "undefined");
});

test("upgradeAgentMeowInVenv is not exported (removed)", () => {
  assert.strictEqual(typeof cli.upgradeAgentMeowInVenv, "undefined");
});
