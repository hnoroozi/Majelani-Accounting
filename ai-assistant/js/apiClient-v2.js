// ai-assistant/js/apiClient-v2.js
// Fixed API client with correct endpoints

const API_BASE_URL = 'https://api.majelaniaccounting.com';

console.log('Majelani AI Assistant v2 loaded');

async function callBackend(endpoint, payload) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Calling:', url, payload);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log('Backend error:', response.status, '-', errorText);
    throw new Error(`Backend error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

export async function summarizeText(text) {
  const data = await callBackend('/api/summary', { text: text.trim() });
  return data.summary || 'No summary generated';
}

export async function explainConcept(text) {
  const data = await callBackend('/api/explain', { text: text.trim() });
  return data.summary || 'No explanation generated';
}

// Test connection
fetch(`${API_BASE_URL}/health`)
  .then(r => r.json())
  .then(data => console.log('Backend test:', data))
  .catch(e => console.error('Backend test failed:', e));

window.MajelaniAI = { summarizeText, explainConcept };