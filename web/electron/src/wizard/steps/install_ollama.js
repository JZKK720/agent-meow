// web/electron/src/wizard/steps/install_ollama.js
// Step 3: Download + silent install Ollama, then pull user-selected model.

"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const os = require("node:os");

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
        fs.unlinkSync(dest);
        return downloadFile(resp.headers.location, dest, onProgress).then(resolve, reject);
      }
      if (resp.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
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
 * Download and silently install Ollama.
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<string>} Path to the installer (for cleanup)
 */
async function installOllama(onProgress) {
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
 * Pull an Ollama model.
 * @param {string} modelId
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<void>}
 */
async function pullModel(modelId, onProgress) {
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

module.exports = { MODELS, installOllama, pullModel, downloadFile, OLLAMA_SETUP_URL };
