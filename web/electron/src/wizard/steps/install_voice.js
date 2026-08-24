// web/electron/src/wizard/steps/install_voice.js
// Step 4: Install whisper-server.exe (STT, Vulkan) + tts-server.exe (TTS, Vulkan).

"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");

// whisper.cpp server binary (Vulkan GPU backend for STT)
const WHISPER_SERVER_URL = "https://github.com/ggml-org/whisper.cpp/releases/latest/download/whisper-server.exe";
const WHISPER_MODEL_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin";

// qwentts.cpp server binary (Vulkan GPU backend for TTS)
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
 * Install whisper-server.exe (Vulkan STT) + ggml-large-v3-turbo model.
 * @param {string} installDir - Directory to install whisper files
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<{whisperExePath: string, whisperModelPath: string}>}
 */
async function installWhisperServer(installDir, onProgress) {
  fs.mkdirSync(installDir, { recursive: true });
  const whisperExePath = path.join(installDir, "whisper-server.exe");
  const whisperModelPath = path.join(installDir, "models", "ggml-large-v3-turbo.bin");
  fs.mkdirSync(path.dirname(whisperModelPath), { recursive: true });

  onProgress(0, "Downloading Whisper STT engine...");
  await downloadFile(WHISPER_SERVER_URL, whisperExePath);

  onProgress(40, "Downloading Whisper large-v3-turbo model...");
  await downloadFile(WHISPER_MODEL_URL, whisperModelPath);

  onProgress(100, "Whisper STT ready");
  return { whisperExePath, whisperModelPath };
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

module.exports = { installWhisperServer, installTts, downloadFile, WHISPER_SERVER_URL, WHISPER_MODEL_URL, TTS_SERVER_URL, TTS_MODEL_URL };
