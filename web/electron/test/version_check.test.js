// web/electron/test/version_check.test.js
// Tests for the Layer 2 agent_meow version-check and upgrade logic.

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const cli = require("../src/omnigent_cli");

test("readBundledAgentMeowVersion returns null when file not found", () => {
  const originalResourcesPath = process.resourcesPath;
  process.resourcesPath = path.join(os.tmpdir(), "nonexistent-test-" + Date.now());
  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli2 = require("../src/omnigent_cli");
    const result = cli2.readBundledAgentMeowVersion();
    assert.strictEqual(result, null);
  } finally {
    process.resourcesPath = originalResourcesPath;
  }
});

test("readBundledAgentMeowVersion returns version string when file exists", () => {
  const originalResourcesPath = process.resourcesPath;
  const tmpResources = path.join(os.tmpdir(), "agent-meow-test-resources-" + Date.now());
  const embeddedDir = path.join(tmpResources, "embedded-python");
  fs.mkdirSync(embeddedDir, { recursive: true });
  fs.writeFileSync(path.join(embeddedDir, "agent_meow_version.txt"), "1.2.3");
  process.resourcesPath = tmpResources;

  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli2 = require("../src/omnigent_cli");
    const result = cli2.readBundledAgentMeowVersion();
    assert.strictEqual(result, "1.2.3");
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.rmSync(tmpResources, { recursive: true, force: true });
  }
});

test("checkAgentMeowVersion returns needsUpgrade=false when both null", () => {
  const originalResourcesPath = process.resourcesPath;
  process.resourcesPath = path.join(os.tmpdir(), "nonexistent-test-" + Date.now());
  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli2 = require("../src/omnigent_cli");
    const result = cli2.checkAgentMeowVersion();
    assert.strictEqual(result.needsUpgrade, false);
    assert.strictEqual(result.bundled, null);
  } finally {
    process.resourcesPath = originalResourcesPath;
  }
});

test("checkAgentMeowVersion returns needsUpgrade=false when installed is null", () => {
  const originalResourcesPath = process.resourcesPath;
  const tmpResources = path.join(os.tmpdir(), "agent-meow-test-resources2-" + Date.now());
  const embeddedDir = path.join(tmpResources, "embedded-python");
  fs.mkdirSync(embeddedDir, { recursive: true });
  fs.writeFileSync(path.join(embeddedDir, "agent_meow_version.txt"), "2.0.0");
  fs.writeFileSync(path.join(embeddedDir, "python.exe"), "fake");
  process.resourcesPath = tmpResources;

  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli2 = require("../src/omnigent_cli");
    const result = cli2.checkAgentMeowVersion();
    assert.strictEqual(result.bundled, "2.0.0");
    assert.strictEqual(result.installed, null);
    assert.strictEqual(result.needsUpgrade, false);
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.rmSync(tmpResources, { recursive: true, force: true });
  }
});

test("upgradeAgentMeowInVenv returns false in dev mode", () => {
  const originalResourcesPath = process.resourcesPath;
  process.resourcesPath = path.join(os.tmpdir(), "nonexistent-test-" + Date.now());
  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli2 = require("../src/omnigent_cli");
    const result = cli2.upgradeAgentMeowInVenv();
    assert.strictEqual(result, false);
  } finally {
    process.resourcesPath = originalResourcesPath;
  }
});
