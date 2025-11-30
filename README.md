# Majelani Accounting

Majelani Accounting is a next-generation, plugin-based accounting platform with AI-powered assistance and modern UI.
The project is currently structured as a **static frontend** (for GitHub Pages + Cloudflare Pages) and a **FastAPI backend** for AI features.

---

## Project Structure

```text
Majelani-Accounting/
├─ backend/
│  ├─ main.py          # FastAPI app (AI summary & explain endpoints)
│  ├─ .venv/           # Local virtual environment (ignored by Git)
│  └─ ...              # Future backend modules
├─ index.html          # Main static landing page with AI assistant UI
├─ js/
│  └─ api.js           # Frontend → Backend API calls (fetch)
├─ .github/
│  └─ workflows/
│     └─ ci.yml        # GitHub Actions CI for backend dependencies
└─ README.md

Backend (FastAPI + OpenAI)

The backend is located in the backend/ folder and exposes AI endpoints such as:

GET / — health/info endpoint

POST /ai/summary — summarize accounting text

POST /ai/explain — explain accounting concepts in simple language

1. Create and activate virtual environment

From the backend folder:

cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# or:
.\.venv\Scripts\activate

2. Install backend dependencies
pip install -r requirements.txt


The requirements.txt contains:

fastapi==0.115.2
uvicorn[standard]==0.31.1
python-dotenv==1.0.1
openai==1.35.14
pydantic==2.8.2

3. Environment variables

Create a .env file inside the backend folder with at least:

OPENAI_API_KEY=your_real_openai_key_here

4. Run the backend server

From inside backend with the virtual environment activated:

uvicorn main:app --reload


The API will be available at:

http://127.0.0.1:8000

Frontend (Static, GitHub Pages + Cloudflare Pages)

The frontend is a static landing page with an AI assistant box:

index.html — main UI (Majelani Accounting landing + AI assistant section)

js/api.js — sends requests to the FastAPI backend

For local testing, you can open index.html directly in a browser or serve it with a simple HTTP server.

Example (from repository root):

# Python simple HTTP server
python -m http.server 5500


Then open:

http://127.0.0.1:5500/index.html

Make sure the backend (uvicorn main:app --reload) is running so that the "Send to AI" button works.

Deployment
GitHub → Cloudflare Pages

The repository is hosted on GitHub:
https://github.com/hnoroozi/Majelani-Accounting

Cloudflare Pages is configured to:

Use this repository

Build as a static site (no build command)

Serve index.html from the repository root

This means:

Frontend is deployed automatically when main is pushed.

Backend currently runs locally (FastAPI on your machine or future separate deployment).

Continuous Integration (GitHub Actions)

The CI workflow is defined in:

.github/workflows/ci.yml

It currently:

Checks out the repository

Sets up Python 3.12

Installs backend dependencies from backend/requirements.txt

Verifies backend imports (FastAPI, uvicorn, dotenv, openai)

This ensures that the backend environment is consistent and dependencies are installable.

Notes

All code, comments, and technical identifiers are written in English.

The project is being evolved step by step:

Stable Git + GitHub + CI

Static frontend via GitHub Pages + Cloudflare Pages

Local FastAPI backend with OpenAI integration

Future: production backend deployment, plugin system, and more AI features.


---