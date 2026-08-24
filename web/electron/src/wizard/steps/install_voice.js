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

// whisper-server.exe with Vulkan backend (built locally with -DGGML_VULKAN=1,
// detects AMD Radeon 8060S iGPU + 7900 XTX dGPU). Hosted in our release
// because whisper.cpp doesn't publish pre-built Vulkan Windows binaries.
const WHISPER_ZIP_URL = "https://github.com/JZKK720/agent-meow/releases/download/v0.7.4/whisper-vulkan-bin-x64.zip";

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
function downloadFile(url, dest, _depth = 0) {
  return new Promise((resolve, reject) => {
    // Cap redirect depth to prevent infinite loops (HuggingFace URLs chain
    // through 2-3 hops; 10 is a safe ceiling).
    if (_depth > 10) {
      reject(new Error(`Too many redirects downloading ${url}`));
      return;
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (resp) => {
      // Follow redirects recursively — HuggingFace download URLs chain through
      // multiple 302 hops (cdn-lfs → signed URL), and the previous single-level
      // follow silently failed on the second hop, aborting large model downloads.
      if (resp.statusCode === 301 || resp.statusCode === 302 || resp.statusCode === 307 || resp.statusCode === 308) {
        file.close();
        try { fs.unlinkSync(dest); } catch { /* ignore */ }
        const location = resp.headers.location;
        if (!location) {
          reject(new Error(`Redirect with no Location header downloading ${url}`));
          return;
        }
        return downloadFile(location, dest, _depth + 1).then(resolve, reject);
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

  // Skip the binary download if whisper-server.exe already exists (re-run wizard).
  if (fs.existsSync(whisperExePath)) {
    onProgress(30, "whisper-server.exe already installed, skipping download...");
  } else {
    // Download the zip to a temp file, then extract whisper-server.exe + DLLs.
    const zipPath = path.join(installDir, "whisper-bin-x64.zip");
    onProgress(0, "Downloading Whisper STT binaries (Vulkan GPU build)...");
    await downloadFile(WHISPER_ZIP_URL, zipPath);

    onProgress(20, "Extracting whisper-server.exe + DLLs...");
    const extractDir = path.join(installDir, "whisper-extract");
    fs.mkdirSync(extractDir, { recursive: true });
    await extractZip(zipPath, extractDir);

    // The zip may contain files at root level (our Vulkan build) or inside
    // a Release/ subdirectory (upstream whisper-bin-x64.zip). Handle both.
    let sourceDir = extractDir;
    const releaseDir = path.join(extractDir, "Release");
    if (fs.existsSync(releaseDir)) {
      sourceDir = releaseDir;
    }

    // Copy whisper-server.exe + all DLLs to the install dir.
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      const src = path.join(sourceDir, file);
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
  }

  // Skip the 1.6 GB model download if it already exists (re-run wizard).
  if (fs.existsSync(whisperModelPath)) {
    onProgress(100, "Whisper model already downloaded, skipping...");
  } else {
    onProgress(40, "Downloading Whisper large-v3-turbo model (1.6 GB)...");
    await downloadFile(WHISPER_MODEL_URL, whisperModelPath);
  }

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
