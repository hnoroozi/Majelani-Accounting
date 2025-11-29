// api.js - Connect frontend to FastAPI backend

const API_BASE = "http://127.0.0.1:8000";

/**
 * Call backend AI endpoint.
 * mode: "summary" | "explain"
 */
export async function sendSummaryRequest(text, mode = "summary") {
  const endpoint = mode === "explain" ? "/ai/explain" : "/ai/summary";

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

/**
 * Handle button click from UI.
 */
async function sendToBackend() {
  const inputEl = document.getElementById("inputText");
  const summaryBox = document.getElementById("summaryBox");
  const modeSelect = document.getElementById("aiMode");

  if (!inputEl || !summaryBox) {
    console.error("AI elements not found in DOM.");
    return;
  }

  const text = inputEl.value;
  const mode = modeSelect ? modeSelect.value : "summary";

  if (!text.trim()) {
    summaryBox.style.direction = "ltr";
    summaryBox.style.textAlign = "left";
    summaryBox.innerHTML = "⚠ Please enter some text first.";
    return;
  }

  // Loading state
  summaryBox.style.direction = "ltr";
  summaryBox.style.textAlign = "left";
  summaryBox.innerHTML = `
  <div style="display:flex; align-items:center; gap:8px; font-size:14px;">
      <span style="color:#7cf5ff;">💡 AI is thinking</span>
      <span class="loading-dots">
          <span>.</span><span>.</span><span>.</span>
      </span>
  </div>
  `;
  try {
    const result = await sendSummaryRequest(text, mode);

    if (!result.ok) {
      summaryBox.style.direction = "ltr";
      summaryBox.style.textAlign = "left";

      const detail =
        (result.data && (result.data.detail || result.data.error)) || "";

      summaryBox.innerHTML =
        "❌ Backend error (" +
        result.status +
        "): " +
        (detail || JSON.stringify(result.data));

      return;
    }

    const outputText =
      result.data && typeof result.data.summary === "string"
        ? result.data.summary
        : "";

    if (!outputText) {
      summaryBox.style.direction = "ltr";
      summaryBox.style.textAlign = "left";
      summaryBox.innerHTML =
        "⚠ Unexpected response from server: " +
        JSON.stringify(result.data || {});
      return;
    }

    // Detect Persian/Arabic characters to set RTL or LTR
    const hasPersian = /[\u0600-\u06FF]/.test(outputText);

    if (hasPersian) {
      summaryBox.style.direction = "rtl";
      summaryBox.style.textAlign = "right";
    } else {
      summaryBox.style.direction = "ltr";
      summaryBox.style.textAlign = "left";
    }

    summaryBox.innerHTML = outputText;
  } catch (error) {
    console.error("Request failed:", error);
    summaryBox.style.direction = "ltr";
    summaryBox.style.textAlign = "left";
    summaryBox.innerHTML = "⚠ Connection error: " + error.message;
  }
}

// Wire up the button after DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("sendToAiBtn");
  if (btn) {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      sendToBackend();
    });
  }
});