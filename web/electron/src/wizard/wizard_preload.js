// web/electron/src/wizard/wizard_preload.js
// Preload script for the bootstrap wizard. Exposes a safe IPC API.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("wizard", {
  detectGpu: () => ipcRenderer.invoke("wizard:detect-gpu"),
  installCore: () => ipcRenderer.invoke("wizard:install-core"),
  installOllama: (model) => ipcRenderer.invoke("wizard:install-ollama", model),
  installVoice: () => ipcRenderer.invoke("wizard:install-voice"),
  verify: () => ipcRenderer.invoke("wizard:verify"),
  done: () => ipcRenderer.send("wizard:done"),
  onProgress: (callback) =>
    ipcRenderer.on("wizard:progress", (_e, data) => callback(data)),
});
