// Cloudflare Worker - AI Backend for Majelani Accounting
// Replaces FastAPI backend with Worker API

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.majelaniaccounting.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }
  return null;
}

// OpenAI API call helper
async function callOpenAI(apiKey, messages, maxTokens = 300) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages,
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleSummary(request, apiKey) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI accounting assistant for Majelani Accounting.

LANGUAGE RULES:
- The user may write in any language.
- Always answer in the SAME language as the user input.
- If the user writes in Persian (Farsi), write in natural, high-quality Persian.
- If the user writes in English, answer in clear, professional business English.

TASK: Summarize the accounting-related text in 3–6 short bullet points.
Focus on clarity and practical insight.`,
      },
      {
        role: 'user',
        content: `Summarize this accounting text in 3–6 bullet points:\n\n${text}`,
      },
    ];

    const summary = await callOpenAI(apiKey, messages);

    return new Response(
      JSON.stringify({ summary }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process summary request' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
}

async function handleExplain(request, apiKey) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI accounting teacher for Majelani Accounting.

LANGUAGE RULES:
- The user may write in any language.
- Always answer in the SAME language as the user input.
- If the user writes in Persian (Farsi), write in natural, high-quality Persian with clear paragraphs and bullet points.
- If the user writes in English, answer in clear, structured, professional English.

TASK: Explain the accounting concept in simple language suitable for beginners.
Use short paragraphs and bullet points where helpful.`,
      },
      {
        role: 'user',
        content: `Explain this accounting concept in simple language:\n\n${text}`,
      },
    ];

    const explanation = await callOpenAI(apiKey, messages, 450);

    return new Response(
      JSON.stringify({ summary: explanation }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process explanation request' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured in Worker environment.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL(request.url);

    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    if (url.pathname === '/api/summary' && request.method === 'POST') {
      return handleSummary(request, apiKey);
    }

    if (url.pathname === '/api/explain' && request.method === 'POST') {
      return handleExplain(request, apiKey);
    }

    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({ message: 'Majelani Accounting AI Backend Ready' }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  },
};