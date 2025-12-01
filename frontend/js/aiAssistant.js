// frontend/js/aiAssistant.js
// UI wiring for the Majelani Accounting AI assistant

import { summarizeText, explainConcept, testBackend, detectLanguage } from "./apiClient.js";

function $(selector) {
  return document.querySelector(selector);
}

function setStatus(message, type = "info") {
  const statusEl = $("#ai-status");
  if (!statusEl) return;
  statusEl.textContent = message || "";
  statusEl.dataset.type = type;
}

async function handleSubmit(event) {
  event.preventDefault();

  const inputEl = $("#ai-input");
  const modeEl = $("#ai-mode");
  const resultEl = $("#ai-result");
  const resultWrapperEl = $("#ai-result-wrapper");
  const buttonEl = $("#ai-submit");
  const buttonTextEl = $("#button-text");

  if (!inputEl || !modeEl || !resultEl || !buttonEl || !buttonTextEl) {
    console.error("AI assistant elements not found in the DOM.");
    return;
  }

  const text = inputEl.value.trim();
  const mode = modeEl.value;

  if (!text) {
    setStatus("Please enter some text first.", "error");
    return;
  }

  // Show loading state
  buttonEl.disabled = true;
  buttonTextEl.innerHTML = '<div class="spinner"></div><span>Processing...</span>';
  setStatus("Analyzing your text...", "info");
  resultEl.textContent = "";
  resultWrapperEl.classList.remove("show");

  try {
    let result;

    if (mode === "summary") {
      result = await summarizeText(text);
    } else if (mode === "explain") {
      result = await explainConcept(text);
    } else {
      throw new Error("Unknown mode selected.");
    }

    const { summary, lang } = result;
    
    // Apply RTL styling if needed
    if (lang === 'fa') {
      resultEl.classList.add('rtl');
    } else {
      resultEl.classList.remove('rtl');
    }

    resultEl.textContent = summary || "No response received from the assistant.";
    resultWrapperEl.classList.add("show");
    setStatus(`Response generated (${lang === 'fa' ? 'Persian' : 'English'})`, "success");
  } catch (error) {
    console.error(error);
    setStatus(
      "An error occurred while contacting the AI assistant. Please try again.",
      "error"
    );
    resultEl.textContent = "";
  } finally {
    buttonEl.disabled = false;
    buttonTextEl.innerHTML = "Ask AI Copilot";
  }
}

async function initAiAssistant() {
  const formEl = $("#ai-form");
  if (!formEl) {
    console.warn("AI assistant form not found.");
    return;
  }
  
  // Test backend connectivity
  try {
    await testBackend();
    setStatus("Backend connected successfully.", "success");
  } catch (error) {
    setStatus("Backend connection failed. Make sure backend is running on port 8000.", "error");
  }
  
  formEl.addEventListener("submit", handleSubmit);
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", initAiAssistant);

// Optional: expose helper for debugging in browser console
window.MajelaniAIUI = {
  initAiAssistant,
};