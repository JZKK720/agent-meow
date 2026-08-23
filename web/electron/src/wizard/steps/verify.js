// web/electron/src/wizard/steps/verify.js
// Step 5: Start server, poll /v1/stack/status until all green.

"use strict";

const http = require("node:http");

const VERIFY_TIMEOUT_MS = 60000;
const POLL_INTERVAL_MS = 2000;

/**
 * Check the stack status endpoint.
 * @returns {Promise<object | null>}
 */
function checkStackStatus() {
  return new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:6767/v1/stack/status", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Poll the stack status until all critical services are ready, or timeout.
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<object>} The final stack status
 */
async function verifySetup(onProgress) {
  const deadline = Date.now() + VERIFY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await checkStackStatus();
    if (status) {
      const serverOk = status.server?.status === "ok";
      const hermesOk = status.hermes?.status === "ok";
      onProgress(
        50,
        `Checking: server=${status.server?.status || "?"}, hermes=${status.hermes?.status || "?"}`,
      );
      if (serverOk && hermesOk) {
        onProgress(100, "All services ready!");
        return status;
      }
    } else {
      onProgress(10, "Waiting for server to start...");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error("Verification timed out — some services may not be ready");
}

module.exports = { verifySetup, checkStackStatus, VERIFY_TIMEOUT_MS };
