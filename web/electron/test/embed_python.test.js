// web/electron/test/embed_python.test.js
// Tests that the embed_python build script produces a working embedded Python.
// These tests require the build script to have been run first:
//   node web/electron/build/embed_python.js

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const EMBEDDED_DIR = path.join(__dirname, "..", "embedded-python");

test("embed_python produces a python.exe in the expected directory", () => {
  const pyExe = path.join(EMBEDDED_DIR, "python.exe");
  assert.ok(fs.existsSync(pyExe), `Expected python.exe at ${pyExe}`);
});

test("embedded python has agent_meow installed", () => {
  const { execFileSync } = require("node:child_process");
  const pyExe = path.join(EMBEDDED_DIR, "python.exe");
  if (!fs.existsSync(pyExe)) {
    test.skip("embedded-python not built — run node web/electron/build/embed_python.js first");
    return;
  }
  // agent_meow exposes its version via agent_meow.version.VERSION (not
  // __version__, which doesn't exist on the package). The CLI's --version
  // flag reads the same constant.
  const output = execFileSync(
    pyExe,
    ["-c", "from agent_meow.version import VERSION; print(VERSION)"],
    {
      encoding: "utf-8",
      timeout: 10000,
    },
  ).trim();
  assert.match(output, /^\d+\.\d+/);
});
