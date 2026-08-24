// web/electron/build/embed_python.js
// Downloads CPython 3.12 embeddable zip, bootstraps pip, builds the local
// omnigent (agent_meow) wheel, and installs it + deps into the embedded Python.
// Run during electron-builder prebuild: node web/electron/build/embed_python.js
//
// This produces web/electron/embedded-python/ containing a portable CPython 3.12
// with omnigent pre-installed. electron-builder packages it into extraResources
// so the .exe ships with its own Python runtime — zero system prerequisites.
//
// Why portable CPython (not PyInstaller/Nuitka):
//   The bootstrap wizard needs to `pip install` hardware-specific packages
//   (lemonade-server) at runtime. A frozen binary cannot pip install. The
//   portable CPython embeddable zip is a real Python that supports pip.
//
// Why build a wheel from the local repo (not `pip install agent_meow`):
//   The package is not on PyPI. The distribution name is `omnigent` (the
//   import name is `agent_meow` via a shim). We build the wheel with the
//   system uv (which has all build backends) and install the artifact.

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, execSync } = require("node:child_process");
const https = require("node:https");
const os = require("node:os");

// CPython 3.12.x — use the latest patch available on python.org.
// 3.12.13 does not exist (HTTP 404); 3.12.9 is the latest 3.12.x with an
// embeddable zip as of 2026-08. Bump here when python.org ships a newer 3.12.x.
const PYTHON_VERSION = "3.12.9";
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
      if (resp.statusCode === 301 || resp.statusCode === 302) {
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

  // Enable site packages by uncommenting `import site` in python312._pth.
  // The embeddable distribution ships with site disabled, which makes pip
  // unimportable as a module. We rewrite the whole file to be robust against
  // CRLF line endings and any reformatting python.org may do.
  // NOTE: the _pth filename is `python3XY._pth` using only major+minor (e.g.
  // `python312._pth`), NOT the full patch version — CPython omits the patch.
  const pyVerNoPatch = PYTHON_VERSION.split(".").slice(0, 2).join("");
  const pthPath = path.join(OUTPUT_DIR, `python${pyVerNoPatch}._pth`);
  if (fs.existsSync(pthPath)) {
    let content = fs.readFileSync(pthPath, "utf-8");
    // Match `#import site` with optional surrounding whitespace/CRLF.
    content = content.replace(/^#\s*import\s+site\s*$/m, "import site");
    fs.writeFileSync(pthPath, content);
    console.log("[embed-python] Enabled site-packages in", path.basename(pthPath));
  } else {
    console.warn("[embed-python] WARNING: _pth file not found at", pthPath);
  }

  console.log("[embed-python] Downloading get-pip.py...");
  const getPipPath = path.join(OUTPUT_DIR, "get-pip.py");
  await download(GET_PIP_URL, getPipPath);

  const pyExe = path.join(OUTPUT_DIR, "python.exe");
  console.log("[embed-python] Installing pip...");
  execFileSync(pyExe, [getPipPath, "--no-warn-script-location"], { stdio: "inherit" });
  fs.unlinkSync(getPipPath);

  // Install build backends so sdist deps (e.g. SDK subpackages using hatchling)
  // can be built without build isolation failing on a bare embedded Python.
  console.log("[embed-python] Installing build backends (setuptools, wheel, hatchling)...");
  execFileSync(pyExe, ["-m", "pip", "install", "setuptools", "wheel", "hatchling", "--no-warn-script-location", "--no-user"], {
    stdio: "inherit",
  });

  // Build the omnigent (agent_meow) wheel from the local repo source.
  // The package is not on PyPI; the distribution name is `omnigent`.
  // We use the system `uv` (which has all build backends) to build the wheel,
  // then install the artifact + deps into the embedded Python.
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const wheelDir = path.join(os.tmpdir(), "amw-wheelhouse");
  if (fs.existsSync(wheelDir)) fs.rmSync(wheelDir, { recursive: true });
  fs.mkdirSync(wheelDir, { recursive: true });
  console.log("[embed-python] Building omnigent wheel from", repoRoot, "→", wheelDir);
  execFileSync("uv", ["build", "--wheel", "--out-dir", wheelDir], {
    stdio: "inherit",
    cwd: repoRoot,
  });
  const wheelFile = fs.readdirSync(wheelDir).find((f) => f.endsWith(".whl"));
  if (!wheelFile) throw new Error("No .whl produced by uv build");
  const wheelPath = path.join(wheelDir, wheelFile);
  console.log("[embed-python] Installing", wheelFile, "+ deps...");
  execFileSync(pyExe, ["-m", "pip", "install", wheelPath, "--no-warn-script-location", "--no-user", "--no-build-isolation"], {
    stdio: "inherit",
    cwd: OUTPUT_DIR,
  });

  // Write the installed omnigent version to a file so main.js can detect
  // when a .exe update ships a newer bundled version and pip-upgrade the
  // embedded venv on next boot (Layer 2 update — no .exe rebuild needed for
  // Python-only changes). Use importlib.metadata because __version__ may be
  // empty (the package sets it lazily via a shim).
  const installedVersion = execFileSync(pyExe, ["-c", "from importlib.metadata import version; print(version('omnigent'))"], {
    encoding: "utf-8",
  }).trim();
  fs.writeFileSync(path.join(OUTPUT_DIR, "agent_meow_version.txt"), installedVersion);
  console.log("[embed-python] omnigent version:", installedVersion);

  console.log("[embed-python] Done. Output at:", OUTPUT_DIR);
}

main().catch((err) => { console.error("[embed-python] FAILED:", err); process.exit(1); });
