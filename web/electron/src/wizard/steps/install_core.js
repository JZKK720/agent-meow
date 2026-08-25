// web/electron/src/wizard/steps/install_core.js
// Step 2: Verify embedded Python + detect/install Hermes CLI + scan API key.

"use strict";

const { execFile, execFileSync, spawn } = require("node:child_process");
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

  // On Windows, curl|bash doesn't work (no bash). Use PowerShell to download
  // and execute the install script. On Unix, use curl|bash as before.
  const isWindows = process.platform === "win32";

  if (isWindows) {
    // On Windows, Hermes is typically run via Docker. If it's not running,
    // try to start the Docker container, or inform the user.
    onProgress(0, "Checking for Hermes Docker container...");
    const containerNames = ["hermes-gateway", "hermes-agent", "hermes"];
    let started = false;
    for (const name of containerNames) {
      try {
        execFileSync("docker", ["start", name], {
          encoding: "utf-8",
          timeout: 15000,
          windowsHide: true,
        });
        onProgress(50, `Started Docker container '${name}', waiting for port 8642...`);
        // Wait up to 10 seconds for Hermes to bind to port 8642.
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (await isHermesRunning()) {
            started = true;
            break;
          }
        }
        if (started) break;
      } catch {
        // Container doesn't exist or Docker not available — try next name.
      }
    }
    if (started) {
      onProgress(100, "Hermes started from Docker container.");
      return;
    }
    // Hermes not running and not in Docker — download the install script
    // via PowerShell and execute it with bash if available (WSL/Git Bash).
    onProgress(20, "Hermes not in Docker. Attempting install script via PowerShell...");
    return new Promise((resolve, reject) => {
      const ps = spawn("powershell", [
        "-NoProfile", "-NonInteractive", "-Command",
        "Invoke-WebRequest -Uri 'https://hermes-agent.nousresearch.com/install.sh' -UseBasicParsing | bash -s --",
      ], {
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stderr = "";
      ps.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
      const timer = setTimeout(() => {
        ps.kill();
        reject(new Error("Hermes install timed out (120s)"));
      }, 120000);
      ps.on("error", (err) => {
        clearTimeout(timer);
        reject(new Error(`Hermes install failed: ${err.message}. Install bash (WSL/Git Bash) or start Hermes via Docker.`));
      });
      ps.on("close", (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(new Error(`Hermes install failed (exit ${code}): ${stderr}. Start Hermes via Docker instead.`));
          return;
        }
        onProgress(100, "Hermes CLI installed");
        resolve();
      });
    });
  }

  // Unix: use curl | bash.
  return new Promise((resolve, reject) => {
    onProgress(0, "Downloading and installing Hermes CLI...");
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
