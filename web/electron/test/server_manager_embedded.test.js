// web/electron/test/server_manager_embedded.test.js
// Tests that the embedded Python path resolution works correctly.

const { test } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");

// Mock process.resourcesPath before requiring the module
const originalResourcesPath = process.resourcesPath;

test("resolveEmbeddedPython returns embedded path when resourcesPath has it", () => {
  // Create a temp dir to simulate embedded-python
  const tmpDir = path.join(__dirname, "..", "embedded-python-test-tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const pyExe = path.join(tmpDir, "python.exe");
  fs.writeFileSync(pyExe, "fake");

  process.resourcesPath = path.dirname(tmpDir);
  // Rename to match expected dir name
  const expectedDir = path.join(path.dirname(tmpDir), "embedded-python");
  if (tmpDir !== expectedDir) {
    fs.renameSync(tmpDir, expectedDir);
  }

  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli = require("../src/omnigent_cli");
    const result = cli.resolveEmbeddedPython();
    assert.ok(result.includes("embedded-python"), `Expected embedded-python in path, got: ${result}`);
    assert.ok(result.includes("python.exe"), `Expected python.exe in path, got: ${result}`);
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.rmSync(expectedDir, { recursive: true, force: true });
  }
});

test("resolveEmbeddedPython falls back to system python when embedded not found", () => {
  process.resourcesPath = "/nonexistent/path";
  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli = require("../src/omnigent_cli");
    const result = cli.resolveEmbeddedPython();
    assert.ok(typeof result === "string" && result.length > 0);
    // Should fall back to "python" or similar
    assert.ok(!result.includes("nonexistent"), `Should not include nonexistent path: ${result}`);
  } finally {
    process.resourcesPath = originalResourcesPath;
  }
});

test("resolveEmbeddedCliArgs returns correct args for embedded Python", () => {
  const tmpDir = path.join(__dirname, "..", "embedded-python-test-tmp2");
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, "python.exe"), "fake");
  const expectedDir = path.join(path.dirname(tmpDir), "embedded-python");
  if (tmpDir !== expectedDir) {
    fs.renameSync(tmpDir, expectedDir);
  }
  process.resourcesPath = path.dirname(expectedDir);

  try {
    delete require.cache[require.resolve("../src/omnigent_cli")];
    const cli = require("../src/omnigent_cli");
    const { exe, args } = cli.resolveEmbeddedCliArgs(["server", "start"]);
    assert.ok(exe.includes("python.exe"));
    assert.deepStrictEqual(args, ["-m", "agent_meow", "server", "start"]);
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.rmSync(expectedDir, { recursive: true, force: true });
  }
});
