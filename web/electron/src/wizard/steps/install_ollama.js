// web/electron/src/wizard/steps/install_ollama.js
// Step 3: Download + silent install Ollama, then pull user-selected model.

"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const os = require("node:os");

const { isPortOpen, OLLAMA_PORT } = require("./port_check");

const OLLAMA_SETUP_URL = "https://ollama.com/download/OllamaSetup.exe";

const MODELS = [
  { id: "qwen3.5:9b-q8_0", label: "Qwen 3.5 9B (Q8)", size: "~10GB", desc: "Fast, good quality" },
  { id: "nemotron-3.5-lightning:30b-a3b", label: "Nemotron 3.5 30B", size: "~25GB", desc: "Best quality" },
  { id: "deepseek-v4-flash:0731-cloud", label: "DeepSeek V4 Flash", size: "~15GB", desc: "Balanced" },
  { id: "qwen3.6:35b-a3b-mtp-q4_K_M", label: "Qwen 3.6 35B", size: "~20GB", desc: "Large context" },
];

/**
 * Download a file with progress tracking.
 * @param {string} url
 * @param {string} dest
 * @param {function} onProgress - callback(fraction 0-1)
 * @returns {Promise<void>}
 */
function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (resp) => {
      if (resp.statusCode === 301 || resp.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(dest); } catch { /* file may not exist yet */ }
        return downloadFile(resp.headers.location, dest, onProgress).then(resolve, reject);
      }
      if (resp.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch { /* file may not exist yet */ }
        reject(new Error(`HTTP ${resp.statusCode} downloading ${url}`));
        return;
      }
      const total = parseInt(resp.headers["content-length"] || "0", 10);
      let received = 0;
      resp.on("data", (chunk) => {
        received += chunk.length;
        if (total && onProgress) onProgress(received / total);
      });
      resp.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      file.close();
      try { fs.unlinkSync(dest); } catch { /* ignore */ }
      reject(err);
    });
  });
}

/**
 * Check if Ollama is already installed on the system.
 * Checks both the CLI on PATH AND port 11434 (the Ollama API server).
 * @returns {Promise<{installed: boolean, running: boolean}>}
 */
async function isOllamaInstalled() {
  // Check if the Ollama API server is already listening on port 11434.
  const running = await isPortOpen(OLLAMA_PORT);
  if (running) return { installed: true, running: true };

  // Otherwise check if the CLI is on PATH (installed but not running).
  return new Promise((resolve) => {
    execFile("ollama", ["--version"], { windowsHide: true, timeout: 10000 }, (err) => {
      resolve({ installed: !err, running: false });
    });
  });
}

/**
 * Download and silently install Ollama.
 * Skips the download/install if Ollama is already on PATH or port 11434 is open.
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<string|null>} Path to the installer, or null if skipped
 */
async function installOllama(onProgress) {
  // Check if Ollama is already installed or running before downloading.
  const status = await isOllamaInstalled();
  if (status.running) {
    onProgress(60, "Ollama already running on port 11434, skipping install...");
    return null;
  }
  if (status.installed) {
    onProgress(60, "Ollama already installed, starting service...");
    // Try to start the Ollama service so port 11434 is available.
    try {
      const { spawn } = require("node:child_process");
      spawn("ollama", ["serve"], { windowsHide: true, detached: true, stdio: "ignore" }).unref();
      // Wait briefly for the service to bind.
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch {
      // best-effort — the user can start it manually
    }
    return null;
  }

  const tmpDir = path.join(os.tmpdir(), "agent-meow-setup");
  fs.mkdirSync(tmpDir, { recursive: true });
  const setupPath = path.join(tmpDir, "OllamaSetup.exe");

  onProgress(0, "Downloading Ollama...");
  await downloadFile(OLLAMA_SETUP_URL, setupPath, (pct) =>
    onProgress(Math.round(pct * 50), "Downloading Ollama..."),
  );

  onProgress(50, "Installing Ollama...");
  await new Promise((resolve, reject) => {
    execFile(setupPath, ["/S"], { windowsHide: true, timeout: 120000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  onProgress(60, "Ollama installed");
  return setupPath;
}

/**
 * Check if an Ollama model is already pulled locally.
 * @param {string} modelId
 * @returns {Promise<boolean>}
 */
function isModelPulled(modelId) {
  return new Promise((resolve) => {
    execFile("ollama", ["list"], { windowsHide: true, timeout: 10000 }, (err, stdout) => {
      if (err) {
        resolve(false);
        return;
      }
      // ollama list output includes the model name in the first column.
      const lines = stdout.split(/\r?\n/).slice(1); // skip header
      resolve(lines.some((line) => line.trim().startsWith(modelId.split(":")[0])));
    });
  });
}

/**
 * Pull an Ollama model. Skips if the model is already pulled locally.
 * @param {string} modelId
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<void>}
 */
async function pullModel(modelId, onProgress) {
  // Check if the model is already pulled.
  const alreadyPulled = await isModelPulled(modelId);
  if (alreadyPulled) {
    onProgress(100, `Model ${modelId} already available, skipping pull.`);
    return;
  }

  onProgress(60, `Pulling ${modelId}...`);
  return new Promise((resolve, reject) => {
    const child = execFile(
      "ollama",
      ["pull", modelId],
      { windowsHide: true, timeout: 1800000 },
      (err) => {
        if (err) reject(err);
        else {
          onProgress(100, `Model ${modelId} ready`);
          resolve();
        }
      },
    );
    // Parse ollama pull progress from stderr
    if (child.stderr) {
      child.stderr.on("data", (data) => {
        const match = data.toString().match(/(\d+)%/);
        if (match) {
          onProgress(60 + Math.round(parseInt(match[1], 10) * 0.4), `Pulling ${modelId}... ${match[1]}%`);
        }
      });
    }
  });
}

module.exports = { MODELS, installOllama, isOllamaInstalled, isModelPulled, pullModel, downloadFile, OLLAMA_SETUP_URL };
