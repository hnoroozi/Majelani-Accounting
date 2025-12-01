from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Simple CORS - allow everything
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummaryRequest(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "Simple Backend Ready"}

@app.post("/ai/summary")
def ai_summary(request: SummaryRequest):
    return {
        "summary": f"Test summary for: {request.text}\n• This is working!\n• Backend connected successfully\n• CORS is fixed"
    }

@app.post("/ai/explain")
def ai_explain(request: SummaryRequest):
    return {
        "summary": f"Test explanation for: {request.text}\n• This is working!\n• Backend connected successfully\n• CORS is fixed"
    }