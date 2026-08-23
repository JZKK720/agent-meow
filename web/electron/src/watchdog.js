// web/electron/src/watchdog.js
// Layer 1: silent health monitor. Runs in Electron main process.
// Polls every 15 minutes. No terminal pop-ups, no visible windows.
// Desktop notification ONLY on state change (ok→down or down→ok).
//
// Uses Node.js http.get — no child_process, no PowerShell, no terminal flash.
// The only child_process calls are in server_manager.js (server restart),
// which uses windowsHide: true.

"use strict";

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const HEALTH_TIMEOUT_MS = 10000;
const INITIAL_DELAY_MS = 30000; // 30s after startup (let services settle)

/**
 * Tracks last-known state per service to detect state changes.
 * Only state changes trigger desktop notifications.
 */
class WatchdogState {
  constructor() {
    this._states = new Map();
  }

  /**
   * Record a new state and return whether it changed.
   * @param {string} serviceName
   * @param {string} newState - "ok" or "down"
   * @returns {boolean} true if the state changed (should notify)
   */
  shouldNotify(serviceName, newState) {
    const lastState = this._states.get(serviceName);
    this._states.set(serviceName, newState);
    return lastState !== newState;
  }

  /**
   * Get the last known state for a service.
   * @param {string} serviceName
   * @returns {string | undefined}
   */
  getLastState(serviceName) {
    return this._states.get(serviceName);
  }
}

/**
 * Check a service health endpoint. Returns "ok" or "down".
 * Uses Node.js http.get — no child_process, no terminal window.
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<"ok" | "down">}
 */
function checkServiceHealth(url, timeoutMs = HEALTH_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (result) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const req = http.get(url, (res) => {
      settle(res.statusCode === 200 ? "ok" : "down");
    });
    req.on("error", () => settle("down"));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      settle("down");
    });
  });
}

/**
 * Send a desktop notification (only if Electron is available).
 * @param {string} title
 * @param {string} body
 */
function notify(title, body) {
  try {
    const { Notification } = require("electron");
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show();
    }
  } catch {
    // Electron not available (test mode) — silently skip
  }
}

/**
 * Write a line to the rotating watchdog log.
 * @param {string} message
 */
function log(message) {
  const logDir = path.join(
    process.env.LOCALAPPDATA || process.env.HOME || "/tmp",
    "agent-meow",
    "logs",
  );
  const logPath = path.join(logDir, "watchdog.log");
  try {
    fs.mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    // Rotate: keep under 1MB
    const stats = fs.statSync(logPath);
    if (stats.size > 1024 * 1024) {
      const oldPath = `${logPath}.1`;
      try { fs.unlinkSync(oldPath); } catch { /* ignore */ }
      fs.renameSync(logPath, oldPath);
    }
  } catch {
    // Logging is best-effort
  }
}

/**
 * Start the silent watchdog.
 * @param {object} serverManager - The server_manager module (for restart).
 * @returns {function} stop function to clear the interval.
 */
function startWatchdog(serverManager) {
  const state = new WatchdogState();
  let polling = false;

  const check = async () => {
    if (polling) return; // skip if previous check still running
    polling = true;
    try {
      // 1. Check server health
      const serverStatus = await checkServiceHealth("http://127.0.0.1:6767/health");
      log(`server: ${serverStatus}`);
      if (state.shouldNotify("server", serverStatus)) {
        if (serverStatus === "down") {
          notify("agent-meow Server", "Server is down — attempting restart...");
          log("server down — triggering restart");
          if (serverManager && typeof serverManager.restartOwnedLocalServer === "function") {
            try {
              serverManager.restartOwnedLocalServer();
            } catch (err) {
              log(`server restart failed: ${err}`);
            }
          }
        } else {
          notify("agent-meow Server", "Server is back up.");
        }
      }

      // 2. Check host daemon (via server API)
      if (serverStatus === "ok") {
        const hostStatus = await checkServiceHealth("http://127.0.0.1:6767/v1/hosts");
        log(`host: ${hostStatus}`);
        if (state.shouldNotify("host", hostStatus)) {
          if (hostStatus === "down") {
            notify("agent-meow Host", "Host daemon disconnected — restarting server...");
            log("host down — triggering server restart");
            if (serverManager && typeof serverManager.restartOwnedLocalServer === "function") {
              try {
                serverManager.restartOwnedLocalServer();
              } catch (err) {
                log(`host restart (via server) failed: ${err}`);
              }
            }
          }
        }
      }

      // 3. Check Ollama (user-installed, can't auto-restart)
      const ollamaStatus = await checkServiceHealth("http://127.0.0.1:11434/api/tags");
      log(`ollama: ${ollamaStatus}`);
      if (state.shouldNotify("ollama", ollamaStatus)) {
        if (ollamaStatus === "down") {
          notify("Ollama Stopped", "Ollama is not running. Click to restart.");
        }
      }
    } finally {
      polling = false;
    }
  };

  // Initial check after 30s (let services settle on startup)
  const initialTimer = setTimeout(check, INITIAL_DELAY_MS);
  const interval = setInterval(check, POLL_INTERVAL_MS);

  log(`watchdog started (interval=${POLL_INTERVAL_MS / 1000}s, initial delay=${INITIAL_DELAY_MS / 1000}s)`);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
    log("watchdog stopped");
  };
}

module.exports = {
  checkServiceHealth,
  WatchdogState,
  startWatchdog,
  notify,
  log,
  POLL_INTERVAL_MS,
  INITIAL_DELAY_MS,
};
