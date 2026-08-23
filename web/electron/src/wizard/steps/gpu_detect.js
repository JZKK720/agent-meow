// web/electron/src/wizard/steps/gpu_detect.js
// Step 1: Detect GPU vendor via Windows WMI.

"use strict";

const { execFile } = require("node:child_process");

const STEPS = [
  { id: "gpu", label: "GPU Detection" },
  { id: "core", label: "Core Runtime" },
  { id: "ollama", label: "Model Runtime" },
  { id: "voice", label: "Voice Stack" },
  { id: "verify", label: "Verification" },
];

/**
 * Detect the GPU vendor via wmic.
 * @returns {Promise<{vendor: string, name: string}>}
 */
function detectGpu() {
  return new Promise((resolve) => {
    execFile(
      "wmic",
      ["path", "win32_VideoController", "get", "name"],
      { timeout: 10000, windowsHide: true },
      (err, stdout) => {
        if (err || !stdout) {
          resolve({ vendor: "CPU", name: "Not detected" });
          return;
        }
        const name = stdout
          .trim()
          .split("\n")
          .filter((l) => l.trim() && !l.includes("Name"))
          .join(" ");
        const upper = name.toUpperCase();
        let vendor = "CPU";
        if (upper.includes("AMD") || upper.includes("RADEON")) vendor = "AMD";
        else if (upper.includes("NVIDIA") || upper.includes("GEFORCE")) vendor = "NVIDIA";
        else if (upper.includes("INTEL")) vendor = "Intel";
        resolve({ vendor, name });
      },
    );
  });
}

module.exports = { detectGpu, STEPS };
