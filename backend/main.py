from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from openai import OpenAI, OpenAIError
import os

# Load environment variables from .env
load_dotenv()

app = FastAPI()

# Add CORS middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    text: str
    mode: str = "summarize"

# OpenAI client
client: OpenAI | None = None

def get_client() -> OpenAI:
    """Lazy OpenAI client: created only when needed."""
    global client
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        # Raise a clear error only when an AI endpoint is actually called
        raise OpenAIError("OPENAI_API_KEY environment variable is not set.")
    if client is None:
        client = OpenAI(api_key=api_key)
    return client

class SummaryRequest(BaseModel):
    text: str
    lang: str = "auto"


@app.get("/")
def root():
    return {"message": "Majelani Accounting Backend Ready"}

@app.get("/health")
def health():
    return {"status": "healthy", "message": "Backend is running"}




@app.post("/ai/summary")
async def ai_summary(request: SummaryRequest):
    """
    Mode 1: Summarize accounting text in 3-6 bullet points.
    """
    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text is required.",
        )
    
    # Check if OpenAI API key is configured
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "sk-test-key-for-development":
        return {
            "summary": f"⚠️ OpenAI API key not configured\n\nTo get real AI responses:\n1. Get an OpenAI API key from https://platform.openai.com\n2. Add it to backend/.env file:\nOPENAI_API_KEY=your_key_here\n3. Restart backend"
        }
    
    try:
        openai_client = get_client()
    except OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    # Enhanced multilingual prompt based on detected language
    lang_instruction = ""
    if request.lang == "fa":
        lang_instruction = "The user has written in Persian/Farsi. Respond in natural, professional Persian with proper RTL formatting."
    else:
        lang_instruction = "The user has written in English. Respond in clear, professional English."
    
    prompt = f"{lang_instruction}\n\nSummarize the following accounting text in 3-6 bullet points:\n\n{request.text}"

    try:
        response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
        You are an AI accounting assistant for Majelani Accounting.

        LANGUAGE RULES:
        - The user may write in any language.
        - Always answer in the SAME language as the user input.
        - If the user writes in Persian (Farsi), you must:
        * Write in natural, high-quality Persian suitable for right-to-left display.
        * Use clear paragraphs and bullet points where helpful.
        * Use correct Persian forms, for example: «دارایی‌ها»، «بدهی‌ها»، «سرمایه».
        * Tone: professional, polite, friendly, and easy to understand.
        - If the user writes in English, answer in clear, concise, professional business English.
        - For other languages, answer in the same language with a clear and helpful tone.

        TASK:
        You receive accounting-related text and must summarize it in 3–6 short bullet points.
        Focus on clarity and practical insight, avoid unnecessary fluff.
        """
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=300,
            temperature=0.4,
        )
    except OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI error: {str(e)}",
        )

    summary = response.choices[0].message.content
    return {"summary": summary}


@app.post("/ai/explain")
async def ai_explain(request: SummaryRequest):
    """
    Mode 2: Explain an accounting concept in simple language for beginners.
    """
    try:
        openai_client = get_client()
    except OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text is required.",
        )

    # Enhanced multilingual prompt based on detected language
    lang_instruction = ""
    if request.lang == "fa":
        lang_instruction = "The user has asked in Persian/Farsi. Explain in natural, educational Persian with proper RTL formatting and clear examples."
    else:
        lang_instruction = "The user has asked in English. Explain in clear, educational English with examples."
    
    prompt = f"{lang_instruction}\n\nExplain this accounting concept for beginners:\n\n{request.text}"

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
        You are an AI accounting teacher for Majelani Accounting.
        LANGUAGE RULES:
        - The user may write in any language.
        - Always answer in the SAME language as the user input.
        - If the user writes in Persian (Farsi), you must:
        * Write in natural, high-quality Persian suitable for right-to-left display.
        * Use clear paragraphs, section titles (for example: «تعریف»، «نکات کلیدی»، «مثال»، «جمع‌بندی»), and bullet points where helpful.
        * Use correct Persian spacing and forms, for example: «دارایی‌ها»، «بدهی‌ها»، «سرمایه».
        * Tone: professional, polite, friendly, and easy to understand.
        - If the user writes in English, answer in clear, structured, professional English:
        * Use headings, bullet points, and short paragraphs.
        - For other languages, answer in the same language with a clear, educational tone.

        TASK:
        Explain the accounting concept in simple language suitable for beginners.
        Use short paragraphs and bullet points where they make the explanation clearer.
        """
                },
        {"role": "user", "content": prompt},
        ],
            max_tokens=450,
            temperature=0.5,
        )
    except OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI error: {str(e)}",
        )

    explanation = response.choices[0].message.content
    return {"summary": explanation}

@app.post("/ai")
async def ai_router(request: AIRequest):
    """
    Unified endpoint for the frontend.
    mode:
      - "summarize" -> use /ai/summary logic
      - "explain"   -> use /ai/explain logic
    """
    # Reuse existing handlers so we don't duplicate logic
    summary_request = SummaryRequest(text=request.text)

    if request.mode == "summarize":
        return await ai_summary(summary_request)
    elif request.mode == "explain":
        return await ai_explain(summary_request)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid mode. Use 'summarize' or 'explain'.",
        )