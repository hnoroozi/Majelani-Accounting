@echo off
echo ===============================================
echo   Majelani Accounting - Project Structuring
echo ===============================================

REM Create frontend structure
mkdir frontend
mkdir frontend\public
mkdir frontend\src
mkdir frontend\src\css
mkdir frontend\src\js
mkdir frontend\src\pages

REM Move existing website folder into frontend/public
if exist website (
    move website frontend\public\
)

REM Create backend structure
mkdir backend
mkdir backend\api
mkdir backend\models
mkdir backend\services
mkdir backend\utils

REM Create backend main file
echo from fastapi import FastAPI > backend\main.py
echo app = FastAPI() >> backend\main.py
echo. >> backend\main.py
echo @app.get("/") >> backend\main.py
echo def root(): >> backend\main.py
echo     return {"message": "Majelani Accounting Backend Ready"} >> backend\main.py

echo.
echo Structure created successfully!
echo ===============================================
pause