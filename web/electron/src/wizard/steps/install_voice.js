// web/electron/src/wizard/steps/install_voice.js
// Step 4: Install whisper-server.exe (STT) from whisper-bin-x64.zip + whisper model.
// TTS is optional — pre-built tts-server.exe binaries are not yet published,
// so the wizard installs STT only and marks TTS as "not configured" (the
// server's service_supervisor handles this gracefully — TTS falls back to
// edge-tts or Hermes TTS).

"use strict";

const { execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { createWriteStream } = require("node:fs");

// whisper.cpp Windows x64 binaries (CPU build — Vulkan builds are not
// published as pre-built release artifacts; see README for Vulkan build
// instructions: cmake -B build -DGGML_VULKAN=1)
const WHISPER_ZIP_URL = "https://github.com/ggml-org/whisper.cpp/releases/latest/download/whisper-bin-x64.zip";

// Whisper large-v3-turbo model (GGML format, ~1.6 GB)
const WHISPER_MODEL_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin";

// TTS URLs (placeholder — pre-built binaries not yet available; TTS falls
// back to edge-tts or Hermes TTS when not configured)
const TTS_SERVER_URL = "";
const TTS_MODEL_URL = "";

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
 * Extract a zip file using the built-in unzip available on Windows.
 * @param {string} zipPath
 * @param {string} destDir
 * @returns {Promise<void>}
 */
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    // Use tar (available on Windows 10+) to extract zip files.
    execFile("tar", ["-xf", zipPath, "-C", destDir], { windowsHide: true, timeout: 60000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Install whisper-server.exe (STT) from whisper-bin-x64.zip + ggml-large-v3-turbo model.
 * Downloads the zip, extracts whisper-server.exe + DLLs, then downloads the model.
 * @param {string} installDir - Directory to install whisper files
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<{whisperExePath: string, whisperModelPath: string}>}
 */
async function installWhisperServer(installDir, onProgress) {
  fs.mkdirSync(installDir, { recursive: true });
  const whisperExePath = path.join(installDir, "whisper-server.exe");
  const whisperModelPath = path.join(installDir, "models", "ggml-large-v3-turbo.bin");
  fs.mkdirSync(path.dirname(whisperModelPath), { recursive: true });

  // Download the zip to a temp file, then extract whisper-server.exe + DLLs.
  const zipPath = path.join(installDir, "whisper-bin-x64.zip");
  onProgress(0, "Downloading Whisper STT binaries (CPU build — Vulkan not yet available as pre-built)...");
  await downloadFile(WHISPER_ZIP_URL, zipPath);

  onProgress(20, "Extracting whisper-server.exe + DLLs...");
  const extractDir = path.join(installDir, "whisper-extract");
  fs.mkdirSync(extractDir, { recursive: true });
  await extractZip(zipPath, extractDir);

  // The zip contains Release/whisper-server.exe + Release/*.dll
  const releaseDir = path.join(extractDir, "Release");
  if (!fs.existsSync(releaseDir)) {
    throw new Error("whisper-bin-x64.zip does not contain Release/ directory");
  }

  // Copy whisper-server.exe + all DLLs to the install dir.
  const files = fs.readdirSync(releaseDir);
  for (const file of files) {
    const src = path.join(releaseDir, file);
    const dst = path.join(installDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dst);
    }
  }

  // Clean up the zip + extraction temp dir.
  try { fs.rmSync(zipPath, { force: true }); } catch { /* best-effort */ }
  try { fs.rmSync(extractDir, { recursive: true, force: true }); } catch { /* best-effort */ }

  if (!fs.existsSync(whisperExePath)) {
    throw new Error("whisper-server.exe not found in extracted zip");
  }

  onProgress(40, "Downloading Whisper large-v3-turbo model (1.6 GB)...");
  await downloadFile(WHISPER_MODEL_URL, whisperModelPath);

  onProgress(100, "Whisper STT ready");
  return { whisperExePath, whisperModelPath };
}

/**
 * Install TTS server. Pre-built tts-server.exe binaries are not yet available
 * as release artifacts — TTS falls back to edge-tts or Hermes TTS when not
 * configured. This is a no-op that reports the situation to the user.
 * @param {string} installDir - Directory to install TTS files (unused)
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<{ttsExePath: string|null, ttsModelPath: string|null}>}
 */
async function installTts(installDir, onProgress) {
  // Pre-built Vulkan tts-server.exe binaries are not yet published.
  // The server's service_supervisor handles missing TTS gracefully —
  // it falls back to edge-tts (cloud) or Hermes TTS.
  onProgress(100, "TTS: using edge-tts fallback (pre-built Vulkan TTS not yet available)");
  return { ttsExePath: null, ttsModelPath: null };
}

module.exports = { installWhisperServer, installTts, downloadFile, WHISPER_ZIP_URL, WHISPER_MODEL_URL, TTS_SERVER_URL, TTS_MODEL_URL };
