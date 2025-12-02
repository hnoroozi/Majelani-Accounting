// ai-assistant/js/apiClient.js
// Production API client for Majelani Accounting AI Backend (Cloudflare Worker)

const API_BASE_URL = 'https://api.majelaniaccounting.com';
const REQUEST_TIMEOUT = 30000; // 30 seconds

class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

async function callBackend(endpoint, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorDetails = errorData.details || null;
        
        console.error('API Error Response:', {
          status: response.status,
          error: errorData.error,
          details: errorData.details,
          url: response.url
        });
      } catch {
        const errorText = await response.text().catch(() => '');
        if (errorText) {
          errorMessage = errorText;
          console.error('API Error Text:', errorText);
        }
      }
      
      const fullMessage = errorDetails ? `${errorMessage} (${errorDetails})` : errorMessage;
      throw new APIError(fullMessage, response.status, response);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout - please try again', 408);
    }
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError(
      'Unable to connect to AI service. Please check your connection and try again.',
      0,
      null
    );
  }
}

/**
 * Summarize accounting-related text in bullet points
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} The AI-generated summary
 */
export async function summarizeText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new APIError('Text is required for summarization', 400);
  }
  
  console.log('FIXED: Using /api/summary endpoint');
  const data = await callBackend('/api/summary', { text: text.trim() });
  return data.summary || 'No summary generated';
}

/**
 * Explain an accounting concept in simple language
 * @param {string} text - The concept to explain
 * @returns {Promise<string>} The AI-generated explanation
 */
export async function explainConcept(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new APIError('Text is required for explanation', 400);
  }
  
  console.log('FIXED: Using /api/explain endpoint');
  const data = await callBackend('/api/explain', { text: text.trim() });
  return data.summary || 'No explanation generated';
}

/**
 * Test API connectivity
 * @returns {Promise<boolean>} True if API is accessible
 */
export async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Expose API for debugging and manual testing
window.MajelaniAI = {
  summarizeText,
  explainConcept,
  testConnection,
  APIError,
};