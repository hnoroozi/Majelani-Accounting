@echo off
echo ========================================
echo    Majelani Accounting - Startup
echo ========================================
echo.

echo [1/3] Cleaning up unnecessary files...
if exist ai-copilot.html del ai-copilot.html
if exist ai.html del ai.html
if exist app.py del app.py
if exist config.py del config.py
if exist run.py del run.py
if exist test.html del test.html
if exist working-ai.html del working-ai.html
if exist google-ai-studio-prompt.md del google-ai-studio-prompt.md
if exist README-clean.md del README-clean.md
if exist SETUP.md del SETUP.md
if exist DEPLOYMENT.md del DEPLOYMENT.md
if exist git-sync.bat del git-sync.bat

echo [2/3] Starting local development server...
echo Opening Majelani Accounting Dashboard...
echo.
echo Available URLs:
echo - Dashboard: http://localhost:8000/dashboard.html
echo - AI Assistant: http://localhost:8000/ai-assistant.html
echo - Main Page: http://localhost:8000/index.html
echo.

echo [3/3] Starting Python HTTP Server on port 8000...
python -m http.server 8000

pause