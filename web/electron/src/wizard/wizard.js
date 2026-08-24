// web/electron/src/wizard/wizard.js
// Bootstrap wizard renderer logic. Runs in the wizard BrowserWindow.
// Communicates with the main process via IPC (wizard_preload.js).

"use strict";

const STEPS = [
  { id: "gpu", title: "Detecting your hardware" },
  { id: "core", title: "Installing core runtime" },
  { id: "ollama", title: "Installing model runtime" },
  { id: "voice", title: "Installing voice support" },
  { id: "verify", title: "Verifying setup" },
];

let currentStep = 0;
let selectedModel = "qwen3.5:9b-q8_0";
let voiceSkipped = false;
let ollamaSkipped = false;

function renderStepsIndicator() {
  const container = document.getElementById("steps-indicator");
  container.innerHTML = STEPS.map((step, i) => {
    let cls = "step-dot";
    if (i < currentStep) cls += " done";
    else if (i === currentStep) cls += " active";
    return `<div class="${cls}"></div>`;
  }).join("");
}

function renderStep(index) {
  const step = STEPS[index];
  document.getElementById("step-title").textContent = step.title;
  document.getElementById("step-detail").innerHTML = "";
  document.getElementById("progress-fill").style.width = `${(index / STEPS.length) * 100}%`;
  const backBtn = document.getElementById("btn-back");
  if (index > 0) backBtn.classList.remove("hidden");
  else backBtn.classList.add("hidden");
  const skipBtn = document.getElementById("btn-skip");
  if (step.id === "ollama") {
    skipBtn.classList.remove("hidden");
    skipBtn.textContent = "Skip — I already have Ollama";
  } else if (step.id === "voice") {
    skipBtn.classList.remove("hidden");
    skipBtn.textContent = "Skip voice setup";
  } else {
    skipBtn.classList.add("hidden");
  }
  renderStepsIndicator();
}

function setProgress(percent, status) {
  document.getElementById("progress-fill").style.width = `${percent}%`;
  if (status) {
    const detail = document.getElementById("step-detail");
    detail.innerHTML = `<p>${status}</p>`;
  }
}

function showError(message) {
  const detail = document.getElementById("step-detail");
  detail.innerHTML = `<div class="error">${message}</div>`;
}

function showSuccess(message) {
  const detail = document.getElementById("step-detail");
  detail.innerHTML = `<div class="success">${message}</div>`;
}

// Listen for progress updates from the main process
window.wizard.onProgress((data) => {
  setProgress(data.percent || 0, data.status);
});

// Step 1: GPU Detection
async function stepGpu() {
  const gpu = await window.wizard.detectGpu();
  const detail = document.getElementById("step-detail");
  detail.innerHTML = `
    <div class="gpu-info">
      <span class="gpu-badge ${gpu.vendor}">${gpu.vendor}</span>
      <span>${gpu.name}</span>
    </div>
    <p>${gpu.vendor === "CPU"
      ? "No GPU detected — voice will use CPU (slower but functional)."
      : `${gpu.vendor} GPU detected — voice will use GPU acceleration.`}</p>
  `;
}

// Step 2: Core Runtime
async function stepCore() {
  const detail = document.getElementById("step-detail");
  detail.innerHTML = `<p>Checking for existing Hermes service and verifying embedded Python...</p>`;
  try {
    await window.wizard.installCore();
    showSuccess("Core runtime ready.");
  } catch (err) {
    showError(`Failed to set up core runtime: ${err.message}`);
    throw err;
  }
}

// Step 3: Ollama + Model Picker
async function stepOllama() {
  const detail = document.getElementById("step-detail");

  // Show model picker first
  const models = [
    { id: "qwen3.5:9b-q8_0", label: "Qwen 3.5 9B (Q8)", size: "~10GB", desc: "Fast, good quality" },
    { id: "nemotron-3.5-lightning:30b-a3b", label: "Nemotron 3.5 30B", size: "~25GB", desc: "Best quality" },
    { id: "deepseek-v4-flash:0731-cloud", label: "DeepSeek V4 Flash", size: "~15GB", desc: "Balanced" },
    { id: "qwen3.6:35b-a3b-mtp-q4_K_M", label: "Qwen 3.6 35B", size: "~20GB", desc: "Large context" },
  ];

  detail.innerHTML = `
    <p>Select an AI model to download (skipped if already available):</p>
    ${models
      .map(
        (m) => `
      <label class="model-option ${m.id === selectedModel ? "selected" : ""}" data-model="${m.id}">
        <input type="radio" name="model" value="${m.id}" ${m.id === selectedModel ? "checked" : ""}>
        <div class="model-info">
          <div class="model-label">${m.label}</div>
          <div class="model-desc">${m.desc}</div>
        </div>
        <div class="model-size">${m.size}</div>
      </label>
    `,
      )
      .join("")}
  `;

  // Add click handlers for model selection
  document.querySelectorAll(".model-option").forEach((el) => {
    el.addEventListener("click", () => {
      selectedModel = el.dataset.model;
      document.querySelectorAll(".model-option").forEach((o) => o.classList.remove("selected"));
      el.classList.add("selected");
      el.querySelector("input").checked = true;
    });
  });

  // Change button text to indicate install
  document.getElementById("btn-next").textContent = "Download & Install";
}

async function stepOllamaInstall() {
  document.getElementById("btn-next").disabled = true;
  document.getElementById("btn-next").textContent = "Installing...";
  try {
    await window.wizard.installOllama(selectedModel);
    showSuccess(`Model ${selectedModel} installed successfully.`);
  } catch (err) {
    showError(`Failed to install Ollama or model: ${err.message}`);
    throw err;
  } finally {
    document.getElementById("btn-next").disabled = false;
    document.getElementById("btn-next").textContent = "Next";
  }
}

// Step 4: Voice Stack
async function stepVoice() {
  if (voiceSkipped) {
    currentStep++;
    return;
  }
  const detail = document.getElementById("step-detail");
  detail.innerHTML = `<p>Installing Whisper STT and Qwen3-TTS...</p>`;
  try {
    await window.wizard.installVoice();
    showSuccess("Voice stack installed successfully.");
  } catch (err) {
    showError(`Failed to install voice stack: ${err.message}`);
    throw err;
  }
}

// Step 5: Verify
async function stepVerify() {
  const detail = document.getElementById("step-detail");
  detail.innerHTML = `<p>Verifying all services are running...</p>`;
  try {
    const status = await window.wizard.verify();
    showSuccess("Setup complete! agent-meow is ready to use.");
    document.getElementById("btn-next").textContent = "Start agent-meow";
  } catch (err) {
    showError(`Verification incomplete: ${err.message}`);
    document.getElementById("btn-next").textContent = "Start anyway";
  }
}

// Button handlers
document.getElementById("btn-next").addEventListener("click", async () => {
  const step = STEPS[currentStep];
  const btn = document.getElementById("btn-next");
  btn.disabled = true;

  try {
    if (step.id === "gpu") {
      await stepGpu();
    } else if (step.id === "core") {
      await stepCore();
    } else if (step.id === "ollama") {
      // First click shows the picker; second click installs
      if (btn.textContent === "Download & Install") {
        await stepOllamaInstall();
      } else if (ollamaSkipped) {
        // Skip — do nothing, just advance
      }
    } else if (step.id === "voice") {
      await stepVoice();
    } else if (step.id === "verify") {
      await stepVerify();
      window.wizard.done();
      return;
    }

    currentStep++;
    if (currentStep < STEPS.length) {
      renderStep(currentStep);
      if (STEPS[currentStep].id === "ollama") {
        await stepOllama();
      }
    }
  } catch (err) {
    // Error already shown by the step function
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("btn-skip").addEventListener("click", () => {
  const step = STEPS[currentStep];
  if (step) {
    if (step.id === "voice") {
      voiceSkipped = true;
    } else if (step.id === "ollama") {
      ollamaSkipped = true;
    }
  }
  currentStep++;
  if (currentStep < STEPS.length) {
    renderStep(currentStep);
  }
});

document.getElementById("btn-back").addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    renderStep(currentStep);
  }
});

// Initialize
renderStep(0);
