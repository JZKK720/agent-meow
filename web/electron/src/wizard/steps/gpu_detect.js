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
 * Detect the GPU vendor via PowerShell Get-CimInstance.
 *
 * Previously used `wmic`, which Microsoft deprecated and removed from
 * Windows 11 (KB update). On a Win11 machine without the RSAT wmic
 * addon, `wmic` is not on PATH, so GPU detection silently failed and
 * the wizard fell back to "CPU" — hiding Vulkan GPU acceleration from
 * the user. Get-CimInstance is the modern replacement and ships with
 * every Windows 10+ install.
 *
 * @returns {Promise<{vendor: string, name: string}>}
 */
function detectGpu() {
  return new Promise((resolve) => {
    // Get-CimInstance is the modern replacement for the removed wmic.
    // Format-List -Property Name keeps the output parseable across locales.
    execFile(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command",
       "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name"],
      { timeout: 10000, windowsHide: true },
      (err, stdout) => {
        if (err || !stdout) {
          resolve({ vendor: "CPU", name: "Not detected" });
          return;
        }
        const name = stdout
          .trim()
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
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
