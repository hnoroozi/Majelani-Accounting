// frontend/js/apiClient.js
// Reusable client for calling the Majelani Accounting backend (FastAPI)

// API Configuration for Local vs Production
const isLocalhost =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost";

export const API_BASE_URL = isLocalhost
  ? "http://127.0.0.1:8001"
  : "https://api.majelaniaccounting.com";

// Language detection utility
function detectLanguage(text) {
  // Check for Arabic/Persian Unicode ranges
  const arabicPersianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  if (arabicPersianRegex.test(text)) {
    return 'fa'; // Persian/Arabic (RTL)
  }
  
  return 'en'; // Default to English (LTR)
}

async function callBackend(endpoint, payload) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Calling: ${url}`, payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`Backend error: ${response.status} - ${text}`);
      throw new Error(
        `Backend error (${response.status}): ${text || "Unknown error"}`
      );
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Summarize accounting-related text in 3–6 bullet points.
 * @param {string} text
 * @returns {Promise<{summary: string, lang: string}>} summary text and detected language
 */
export async function summarizeText(text) {
  const detectedLang = detectLanguage(text);
  const data = await callBackend("/ai/summary", { 
    text, 
    lang: detectedLang 
  });
  return {
    summary: data.summary || "",
    lang: detectedLang
  };
}

/**
 * Explain an accounting concept in simple language.
 * @param {string} text
 * @returns {Promise<{summary: string, lang: string}>} explanation text and detected language
 */
export async function explainConcept(text) {
  const detectedLang = detectLanguage(text);
  const data = await callBackend("/ai/explain", { 
    text, 
    lang: detectedLang 
  });
  return {
    summary: data.summary || "",
    lang: detectedLang
  };
}

// Test backend connectivity
export async function testBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    console.log('Backend test:', data);
    return data;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
}

// Export language detection for use in UI
export { detectLanguage };

// Optional: attach helpers to window for quick manual testing in browser console
window.MajelaniAI = {
  summarizeText,
  explainConcept,
  testBackend,
  detectLanguage,
  API_BASE_URL,
};