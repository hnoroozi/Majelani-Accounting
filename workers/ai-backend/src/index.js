// Cloudflare Worker - AI Backend for Majelani Accounting
// Handles summary and explanation endpoints for the AI Copilot.

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function handleCORS(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }
  return null;
}

async function callOpenAI(messages, maxTokens, apiKey) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI API error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

async function handleSummary(request, apiKey) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const messages = [
      {
        role: "system",
        content: `
You are an AI accounting assistant for Majelani Accounting.

LANGUAGE RULES:
- Detect the user input language automatically.
- Answer in the SAME language as the user.
- If user writes in Persian (Farsi), answer in natural Persian.
- If user writes in English, answer in clear business English.

TASK:
Summarize the accounting-related text in 3–6 short bullet points.
Focus on clarity and practical insight.`,
      },
      {
        role: "user",
        content: `Summarize this accounting text in 3–6 bullet points:\n\n${text}`,
      },
    ];

    const summary = await callOpenAI(messages, 300, apiKey);
    return jsonResponse({ summary });
  } catch (error) {
    console.error("Summary handler error:", error);
    return jsonResponse(
      { error: "Failed to process summary request." },
      500
    );
  }
}

async function handleExplain(request, apiKey) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const messages = [
      {
        role: "system",
        content: `
You are an AI accounting teacher for Majelani Accounting.

LANGUAGE RULES:
- Detect the user input language automatically.
- Answer in the SAME language as the user.
- If user writes in Persian (Farsi), write natural, structured Persian.
- If user writes in English, write clear structured English.

TASK:
Explain the accounting concept in simple language for beginners.
Use short paragraphs and bullet points where helpful.`,
      },
      {
        role: "user",
        content: `Explain this accounting concept in simple language:\n\n${text}`,
      },
    ];

    const explanation = await callOpenAI(messages, 450, apiKey);
    return jsonResponse({ summary: explanation });
  } catch (error) {
    console.error("Explain handler error:", error);
    return jsonResponse(
      { error: "Failed to process explanation request." },
      500
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    const cors = handleCORS(request);
    if (cors) return cors;

    const url = new URL(request.url);

    // Health check does NOT require OpenAI
    if (url.pathname === "/health" || url.pathname === "/") {
      return jsonResponse({ message: "Majelani Accounting AI Backend Ready" });
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set in Worker environment.");
      return jsonResponse(
        { error: "OPENAI_API_KEY is not configured in the Worker environment." },
        500
      );
    }

    if (url.pathname === "/api/summary" && request.method === "POST") {
      return handleSummary(request, apiKey);
    }

    if (url.pathname === "/api/explain" && request.method === "POST") {
      return handleExplain(request, apiKey);
    }

    return jsonResponse({ error: "Not Found" }, 404);
  },
};