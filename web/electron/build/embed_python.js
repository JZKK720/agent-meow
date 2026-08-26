// web/electron/build/embed_python.js
// Downloads CPython 3.12 embeddable zip, creates a venv, pip-installs agent_meow.
// Run during electron-builder prebuild: node web/electron/build/embed_python.js
//
// This produces web/electron/embedded-python/ containing a portable CPython 3.12
// with agent_meow pre-installed. electron-builder packages it into extraResources
// so the .exe ships with its own Python runtime — zero system prerequisites.
//
// Why portable CPython (not PyInstaller/Nuitka):
//   The bootstrap wizard needs to download whisper-server.exe and
//   tts-server.exe at runtime (not pip packages). A frozen binary cannot
//   pip install. The portable CPython embeddable zip is a real Python that
//   supports pip — but we install agent-meow from the local source tree,
//   NEVER from PyPI's upstream `omnigent` package (the legacy Databricks name).

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const https = require("node:https");
const os = require("node:os");

const PYTHON_VERSION = "3.12.10";
const PYTHON_ARCH = "amd64";
// CPython embeddable zip URL (official python.org distribution)
const EMBED_URL = `https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-embed-${PYTHON_ARCH}.zip`;
const OUTPUT_DIR = path.join(__dirname, "..", "embedded-python");
const ZIP_PATH = path.join(os.tmpdir(), "python-embed.zip");
const GET_PIP_URL = "https://bootstrap.pypa.io/get-pip.py";

/**
 * Download a URL to a local file, following redirects.
 * @param {string} url
 * @param {string} dest
 * @returns {Promise<void>}
 */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (resp) => {
      if (resp.statusCode === 301 || resp.statusCode === 302 || resp.statusCode === 307 || resp.statusCode === 308) {
        file.close();
        fs.unlinkSync(dest);
        return download(resp.headers.location, dest).then(resolve, reject);
      }
      if (resp.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
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
 * Extract a zip file using PowerShell Expand-Archive (available on all Windows 10+).
 * @param {string} zipPath
 * @param {string} destDir
 */
function extractZip(zipPath, destDir) {
  execFileSync("powershell", ["-NoProfile", "-Command",
    `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force`], { stdio: "inherit" });
}

async function main() {
  console.log("[embed-python] Cleaning output dir...");
  if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("[embed-python] Downloading CPython embeddable zip...");
  await download(EMBED_URL, ZIP_PATH);

  console.log("[embed-python] Extracting...");
  extractZip(ZIP_PATH, OUTPUT_DIR);
  fs.unlinkSync(ZIP_PATH);

  // Enable site packages by uncommenting import site in python312._pth
  // The embeddable zip uses python3XX._pth where XX is the minor version (e.g. python312._pth)
  const pthFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.match(/^python\d+\._pth$/));
  for (const pthFile of pthFiles) {
    const pthPath = path.join(OUTPUT_DIR, pthFile);
    let content = fs.readFileSync(pthPath, "utf-8");
    content = content.replace("#import site", "import site");
    fs.writeFileSync(pthPath, content);
    console.log(`[embed-python] Enabled site packages in ${pthFile}`);
  }

  console.log("[embed-python] Downloading get-pip.py...");
  const getPipPath = path.join(OUTPUT_DIR, "get-pip.py");
  await download(GET_PIP_URL, getPipPath);

  const pyExe = path.join(OUTPUT_DIR, "python.exe");
  console.log("[embed-python] Installing pip...");
  execFileSync(pyExe, [getPipPath, "--no-warn-script-location"], { stdio: "inherit" });
  fs.unlinkSync(getPipPath);

  // Install agent-meow from the local source tree — NOT from PyPI.
  // The PyPI `omnigent` package is the upstream Databricks version; it lacks
  // agent-meow's custom server code (service_supervisor, voice_proxy,
  // whisper_server support). Installing from the local tree ensures the
  // embedded Python has agent-meow's code, not upstream.
  // __dirname is web/electron/build → repo root is 3 levels up.
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  console.log("[embed-python] Installing setuptools (needed for install)...");
  execFileSync(pyExe, ["-m", "pip", "install", "setuptools", "wheel", "hatchling", "--no-warn-script-location"], {
    stdio: "inherit",
    cwd: OUTPUT_DIR,
  });
  console.log("[embed-python] Installing agent-meow from local source at:", repoRoot);
  // Clean stale egg-info dirs so setuptools regenerates entry_points.txt.
  // Both the old omnigent.egg-info and agent_meow.egg-info are cleaned.
  for (const eggInfoName of ["omnigent.egg-info", "agent_meow.egg-info", "agent-meow.egg-info"]) {
    const eggInfo = path.join(repoRoot, eggInfoName);
    if (fs.existsSync(eggInfo)) {
      fs.rmSync(eggInfo, { recursive: true, force: true });
      console.log(`[embed-python] Deleted stale ${eggInfoName}`);
    }
  }
  // Regular install (NOT -e editable): copies all package files into
  // site-packages/, including agent_meow/server/static/web-ui/ with the
  // VAD worklet, ONNX model, and onnxruntime WASM files. An editable
  // install only creates a .pth pointing at the repo root — which doesn't
  // exist on a client machine, breaking both the server import AND the
  // static file serving (VAD assets, SPA bundle).
  //
  // The root package and its sibling SDKs (agent-meow-client,
  // agent-meow-ui-sdk) pin each other with ==. pip's resolver cannot
  // satisfy circular ==-pins from local source dirs in a single pass
  // (it evaluates each package's metadata before any install, and
  // the sibling pin isn't yet in site-packages). Install the SDKs with
  // --no-deps first (they only need agent-meow for type-checking / SSE
  // envelope validation, already provided by the root install that
  // follows), then install the root package which pulls remaining deps
  // from PyPI as usual.
  const sdkClientDir = path.join(repoRoot, "sdks", "python-client");
  const sdkUiDir = path.join(repoRoot, "sdks", "ui");
  console.log("[embed-python] Installing sibling SDKs (--no-deps)...");
  execFileSync(pyExe, ["-m", "pip", "install", sdkClientDir, sdkUiDir, "--no-deps", "--no-warn-script-location", "--no-build-isolation"], {
    stdio: "inherit",
    cwd: OUTPUT_DIR,
  });
  console.log("[embed-python] Installing agent-meow from local source...");
  execFileSync(pyExe, ["-m", "pip", "install", repoRoot, "--no-warn-script-location", "--no-build-isolation"], {
    stdio: "inherit",
    cwd: OUTPUT_DIR,
  });

  // Write the installed version for diagnostics (no longer used for
  // pip-upgrade — that was removed as dangerous).
  try {
    const installedVersion = execFileSync(pyExe, ["-c", "from agent_meow.version import VERSION; print(VERSION)"], {
      encoding: "utf-8",
    }).trim();
    fs.writeFileSync(path.join(OUTPUT_DIR, "agent_meow_version.txt"), installedVersion);
    console.log("[embed-python] agent_meow version:", installedVersion);
  } catch {
    console.warn("[embed-python] could not read agent_meow version — continuing");
  }

  console.log("[embed-python] Done. Output at:", OUTPUT_DIR);
}

main().catch((err) => { console.error("[embed-python] FAILED:", err); process.exit(1); });
