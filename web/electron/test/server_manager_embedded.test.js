// web/electron/test/server_manager_embedded.test.js
// Tests that the embedded Python path resolution works correctly.

const { test } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const originalResourcesPath = process.resourcesPath;

test("resolveEmbeddedPython returns embedded path when resourcesPath has it", () => {
  const tmpResources = path.join(os.tmpdir(), "agent-meow-embedded-test-" + Date.now());
  const embeddedDir = path.join(tmpResources, "embedded-python");
  fs.mkdirSync(embeddedDir, { recursive: true });
  fs.writeFileSync(path.join(embeddedDir, "python.exe"), "fake");
  process.resourcesPath = tmpResources;

  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli = require("../src/omnigent_cli");
    const result = cli.resolveEmbeddedPython();
    assert.ok(result.includes("embedded-python"), `Expected embedded-python in path, got: ${result}`);
    assert.ok(result.includes("python.exe"), `Expected python.exe in path, got: ${result}`);
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.rmSync(tmpResources, { recursive: true, force: true });
  }
});

test("resolveEmbeddedPython falls back to system python when embedded not found", () => {
  process.resourcesPath = path.join(os.tmpdir(), "nonexistent-" + Date.now());
  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli = require("../src/omnigent_cli");
    const result = cli.resolveEmbeddedPython();
    assert.ok(typeof result === "string" && result.length > 0);
    assert.ok(!result.includes("nonexistent"), `Should not include nonexistent path: ${result}`);
  } finally {
    process.resourcesPath = originalResourcesPath;
  }
});

test("resolveEmbeddedCliArgs returns correct args for embedded Python", () => {
  const tmpResources = path.join(os.tmpdir(), "agent-meow-cli-test-" + Date.now());
  const embeddedDir = path.join(tmpResources, "embedded-python");
  fs.mkdirSync(embeddedDir, { recursive: true });
  fs.writeFileSync(path.join(embeddedDir, "python.exe"), "fake");
  process.resourcesPath = tmpResources;

  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli = require("../src/omnigent_cli");
    const { exe, args } = cli.resolveEmbeddedCliArgs(["server", "start"]);
    assert.ok(exe.includes("python.exe"));
    assert.deepStrictEqual(args, ["-m", "agent_meow", "server", "start"]);
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.rmSync(tmpResources, { recursive: true, force: true });
  }
});
