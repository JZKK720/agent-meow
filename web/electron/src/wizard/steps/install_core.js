// web/electron/src/wizard/steps/install_core.js
// Step 2: Verify embedded Python + detect/install Hermes CLI.

"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const { isPortOpen, HERMES_PORT } = require("./port_check");

const HERMES_INSTALL_CMD = "curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash";

/**
 * Verify the embedded Python exists in extraResources.
 * @returns {boolean}
 */
function verifyEmbeddedPython() {
  const pyPath = path.join(process.resourcesPath || "", "embedded-python", "python.exe");
  return fs.existsSync(pyPath);
}

/**
 * Check if Hermes CLI is already running on port 8642.
 * @returns {Promise<boolean>}
 */
async function isHermesRunning() {
  return isPortOpen(HERMES_PORT);
}

/**
 * Install Hermes CLI via curl.
 * Skips the download if Hermes is already running on port 8642.
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<void>}
 */
async function installHermesCli(onProgress) {
  // Check if Hermes is already running — skip install entirely.
  const running = await isHermesRunning();
  if (running) {
    onProgress(100, "Hermes already running on port 8642, skipping install.");
    return;
  }

  return new Promise((resolve, reject) => {
    onProgress(0, "Downloading Hermes CLI...");
    execFile(
      "curl",
      ["-fsSL", "https://hermes-agent.nousresearch.com/install.sh"],
      { windowsHide: true, timeout: 120000 },
      (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }
        onProgress(50, "Installing Hermes CLI...");
        onProgress(100, "Hermes CLI installed");
        resolve();
      },
    );
  });
}

module.exports = { verifyEmbeddedPython, installHermesCli, isHermesRunning, HERMES_INSTALL_CMD };
