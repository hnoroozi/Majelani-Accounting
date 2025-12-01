# Deployment Guide

## Cloudflare Pages Configuration

### Repository Settings
- **Git Repository**: `hnoroozi/Majelani-Accounting`
- **Production Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: (empty - no build required)
- **Build Output Directory**: `frontend`

### Domain Configuration
- **Production URL**: https://www.majelaniaccounting.com
- **API Backend**: https://api.majelaniaccounting.com (to be configured separately)

## Frontend Structure
```
frontend/
├── index.html              # Landing page (served as /)
├── ai-assistant.html       # AI Assistant page (served as /ai-assistant.html)
├── js/
│   ├── apiClient.js        # API client with auto environment detection
│   ├── aiAssistant.js      # AI Assistant UI controller
│   └── main.js             # Main entry point
├── css/                    # (empty - styles are inline)
└── assets/                 # (empty - for future assets)
```

## API Configuration
The frontend automatically detects the environment:
- **Local Development**: `http://127.0.0.1:8001`
- **Production**: `https://api.majelaniaccounting.com`

## Deployment Steps
1. Push code to `main` branch on GitHub
2. Cloudflare Pages will automatically deploy from `frontend/` directory
3. Configure custom domain in Cloudflare Pages dashboard
4. Set up API backend separately and point DNS for `api.majelaniaccounting.com`

## Local Development
```bash
# Frontend (from repository root)
cd frontend
python -m http.server 5500

# Backend (from repository root)
cd backend
python -m uvicorn main:app --reload --port 8001
```

## Navigation
- Landing page: `/` (index.html)
- AI Assistant: `/ai-assistant.html`
- Back navigation uses relative paths for proper routing