// web/electron/src/wizard/steps/install_core.js
// Step 2: Verify embedded Python + detect/install Hermes CLI + scan API key.

"use strict";

const { execFile, execFileSync } = require("node:child_process");
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
 * Try to extract the Hermes API key from a running Docker container.
 * Hermes stores it as API_SERVER_KEY in the container environment.
 * @returns {string | null} The API key, or null if not found.
 */
function scanHermesApiKey() {
  // Try common Hermes Docker container names.
  const containerNames = ["hermes-gateway", "hermes-agent", "hermes"];
  for (const name of containerNames) {
    try {
      const output = execFileSync("docker", ["exec", name, "env"], {
        encoding: "utf-8",
        timeout: 5000,
        windowsHide: true,
      });
      const match = output.match(/^API_SERVER_KEY=(.+)$/m);
      if (match) return match[1].trim();
    } catch {
      // Container not found or Docker not available — try next name.
    }
  }
  return null;
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
    onProgress(0, "Downloading and installing Hermes CLI...");
    // Download the install script and pipe it to bash for execution.
    // The previous version captured stdout but never ran it, so Hermes was
    // never actually installed — the wizard reported success falsely.
    const { spawn } = require("node:child_process");
    const curl = spawn("curl", ["-fsSL", "https://hermes-agent.nousresearch.com/install.sh"], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const bash = spawn("bash", ["-s"], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    curl.stdout.pipe(bash.stdin);
    let stderr = "";
    bash.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    bash.on("error", (err) => {
      reject(new Error(`Failed to run bash for Hermes install: ${err.message}`));
    });
    curl.on("error", (err) => {
      reject(new Error(`Failed to download Hermes install script: ${err.message}`));
    });
    const timer = setTimeout(() => {
      curl.kill();
      bash.kill();
      reject(new Error("Hermes install timed out"));
    }, 120000);
    bash.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Hermes install failed (exit ${code}): ${stderr}`));
        return;
      }
      onProgress(50, "Installing Hermes CLI...");
      onProgress(100, "Hermes CLI installed");
      resolve();
    });
  });
}

module.exports = { verifyEmbeddedPython, installHermesCli, isHermesRunning, scanHermesApiKey, HERMES_INSTALL_CMD };
