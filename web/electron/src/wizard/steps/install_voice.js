// web/electron/src/wizard/steps/install_voice.js
// Step 4: Install Lemonade (pip) + tts-server.exe (download).

"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

// These URLs are placeholders — the actual release URLs will be configured
// when qwentts.cpp publishes Windows binaries. For now they point to the
// GitHub releases page.
const TTS_SERVER_URL = "https://github.com/ggml-org/qwentts.cpp/releases/latest/download/tts-server.exe";
const TTS_MODEL_URL = "https://huggingface.co/Qwen/Qwen3-TTS-GGUF/resolve/main/qwen3-tts-q8_0.gguf";

/**
 * Download a file with redirect following.
 * @param {string} url
 * @param {string} dest
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (resp) => {
      if (resp.statusCode === 301 || resp.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(dest); } catch { /* ignore */ }
        return downloadFile(resp.headers.location, dest).then(resolve, reject);
      }
      if (resp.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch { /* ignore */ }
        reject(new Error(`HTTP ${resp.statusCode} downloading ${url}`));
        return;
      }
      resp.pipe(file);
      file.on("finish", () => { file.close(resolve); });
    }).on("error", (err) => {
      file.close();
      try { fs.unlinkSync(dest); } catch { /* ignore */ }
      reject(err);
    });
  });
}

/**
 * Install Lemonade STT via pip + pull Whisper model.
 * @param {string} pythonExe - Path to the embedded Python executable
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<void>}
 */
async function installLemonade(pythonExe, onProgress) {
  onProgress(0, "Installing Lemonade STT...");
  await new Promise((resolve, reject) => {
    execFile(
      pythonExe,
      ["-m", "pip", "install", "lemonade-server", "--no-warn-script-location"],
      { windowsHide: true, timeout: 300000 },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });

  onProgress(50, "Pulling Whisper model...");
  await new Promise((resolve, reject) => {
    execFile(
      pythonExe,
      ["-m", "lemonade.server", "model", "pull", "whisper-large-v3-turbo"],
      { windowsHide: true, timeout: 600000 },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });

  onProgress(100, "Lemonade STT ready");
}

/**
 * Download tts-server.exe + Qwen3-TTS Q8_0 model.
 * @param {string} installDir - Directory to install TTS files
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<{ttsExePath: string, ttsModelPath: string}>}
 */
async function installTts(installDir, onProgress) {
  fs.mkdirSync(installDir, { recursive: true });
  const ttsExePath = path.join(installDir, "tts-server.exe");
  const ttsModelPath = path.join(installDir, "models", "qwen3-tts-q8_0.gguf");
  fs.mkdirSync(path.dirname(ttsModelPath), { recursive: true });

  onProgress(0, "Downloading TTS engine...");
  await downloadFile(TTS_SERVER_URL, ttsExePath);

  onProgress(50, "Downloading TTS model...");
  await downloadFile(TTS_MODEL_URL, ttsModelPath);

  onProgress(100, "TTS engine ready");
  return { ttsExePath, ttsModelPath };
}

module.exports = { installLemonade, installTts, downloadFile, TTS_SERVER_URL, TTS_MODEL_URL };
