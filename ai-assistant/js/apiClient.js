// ai-assistant/js/apiClient.js
// API client for production Cloudflare Worker backend

const API_BASE_URL = 'https://api.majelaniaccounting.com';

async function callBackend(endpoint, payload) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Backend error (${response.status}): ${text || 'Unknown error'}`);
  }

  return response.json();
}

export async function summarizeText(text) {
  const data = await callBackend('/api/summary', { text });
  return data.summary || '';
}

export async function explainConcept(text) {
  const data = await callBackend('/api/explain', { text });
  return data.summary || '';
}

// Expose helpers for debugging
window.MajelaniAI = { summarizeText, explainConcept };