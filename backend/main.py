from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from openai import OpenAI, OpenAIError
import os

# Load environment variables from .env
load_dotenv()

app = FastAPI()

# Allowed frontends (local + production)
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://www.majelaniaccounting.com",
    "https://majelaniaccounting.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class SummaryRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"message": "Majelani Accounting Backend Ready"}


@app.post("/ai/summary")
async def ai_summary(request: SummaryRequest):
    """
    Mode 1: Summarize accounting text in 3-6 bullet points.
    """
    if not client.api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not set on the server.",
        )

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text is required.",
        )

    prompt = (
        "You are an AI assistant for Majelani Accounting. "
        "The user may write in English or Persian (Farsi). "
        "Summarize the following accounting-related text in 3–6 short bullet points. "
        "If the input is in Persian, answer in Persian. "
        "If the input is in English, answer in English.\n\n"
        f"{request.text}"
    )

    try:
        response = client.chat.completions.create(
        model="gpt-4.1-mini",
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
    if not client.api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not set on the server.",
        )

    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text is required.",
        )

    prompt = (
        "You are an accounting teacher for Majelani Accounting users. "
        "The user may ask about an accounting concept in English or Persian (Farsi). "
        "Explain the concept in simple language suitable for a beginner. "
        "If the question is in Persian, answer in Persian. "
        "If the question is in English, answer in English. "
        "Use short paragraphs and bullet points where helpful.\n\n"
        f"User question: {request.text}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
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