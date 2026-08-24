// web/electron/src/wizard/steps/port_check.js
// Shared helper: detect if a service is already listening on a port.
// Used by the wizard to skip installing Ollama (11434) or Hermes (8642)
// when they are already running on the user's machine.

"use strict";

const net = require("node:net");

/**
 * Check if a TCP port is currently listening on localhost.
 * @param {number} port - The port to check
 * @param {string} [host="127.0.0.1"] - The host to check
 * @returns {Promise<boolean>} true if something is listening on the port
 */
function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };
    socket.once("connect", () => {
      cleanup();
      resolve(true);
    });
    socket.once("timeout", () => {
      cleanup();
      resolve(false);
    });
    socket.once("error", () => {
      cleanup();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

/** Ollama's default API port. */
const OLLAMA_PORT = 11434;

/** Hermes agent server's default port. */
const HERMES_PORT = 8642;

/** The agent-meow server port. */
const AGENT_MEOW_PORT = 6767;

module.exports = { isPortOpen, OLLAMA_PORT, HERMES_PORT, AGENT_MEOW_PORT };