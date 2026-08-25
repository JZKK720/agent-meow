// web/electron/src/wizard/steps/verify.js
// Step 5: Start server, poll /v1/stack/status until all green.

"use strict";

const http = require("node:http");
const { isPortOpen, OLLAMA_PORT, HERMES_PORT, AGENT_MEOW_PORT } = require("./port_check");

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
 * Check all critical service ports directly. More reliable than just
 * the stack status endpoint, which may not report all services.
 * @returns {Promise<{server: boolean, hermes: boolean, ollama: boolean}>}
 */
async function checkPorts() {
  const [server, hermes, ollama] = await Promise.all([
    isPortOpen(AGENT_MEOW_PORT),
    isPortOpen(HERMES_PORT),
    isPortOpen(OLLAMA_PORT),
  ]);
  return { server, hermes, ollama };
}

/**
 * Poll the stack status until all critical services are ready, or timeout.
 * Uses both the stack status API and direct port checks.
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<object>} The final stack status
 */
async function verifySetup(onProgress) {
  const deadline = Date.now() + VERIFY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await checkStackStatus();
    const ports = await checkPorts();
    if (status) {
      const serverOk = status.server?.status === "ok" || ports.server;
      const hermesOk = status.hermes?.status === "ok" || ports.hermes;
      onProgress(
        50,
        `Checking: server=${ports.server ? "listening" : status.server?.status || "?"}, hermes=${ports.hermes ? "listening" : status.hermes?.status || "?"}, ollama=${ports.ollama ? "listening" : "down"}`,
      );
      if (serverOk && hermesOk) {
        onProgress(100, "All services ready!");
        return { ...status, ports };
      }
    } else {
      onProgress(10, `Waiting for server... (ollama=${ports.ollama ? "up" : "down"}, hermes=${ports.hermes ? "up" : "down"})`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error("Verification timed out — some services may not be ready");
}

module.exports = { verifySetup, checkStackStatus, checkPorts, VERIFY_TIMEOUT_MS };
