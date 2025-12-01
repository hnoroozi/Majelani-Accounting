# Setup Instructions

## Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
# or
.\.venv\Scripts\activate      # Windows CMD
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in the backend folder:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the backend:
```bash
uvicorn main:app --reload
```
Backend will be available at: http://127.0.0.1:8000

## Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Start a simple HTTP server:
```bash
python -m http.server 5500
```

3. Open your browser and go to:
- Landing page: http://127.0.0.1:5500/index.html
- AI Assistant: http://127.0.0.1:5500/ai-assistant.html

## Testing the AI Assistant

1. Make sure both backend (port 8000) and frontend (port 5500) are running
2. First test backend connectivity: http://127.0.0.1:5500/test.html
3. Go to the AI Assistant page: http://127.0.0.1:5500/ai-assistant.html
4. Check browser console (F12) for any errors
5. Enter some accounting text or question
6. Select "Summarize this text" or "Explain this concept"
7. Click "Ask AI"

## Debugging

- Backend health check: http://127.0.0.1:8000/health
- Test page: http://127.0.0.1:5500/test.html
- Check browser console for detailed error logs
- Make sure .env file has valid OPENAI_API_KEY

The frontend will call the FastAPI backend endpoints:
- POST /ai/summary
- POST /ai/explain