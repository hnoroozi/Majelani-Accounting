@echo off
cd /d "C:\MajelaniAI\Web\MyWebs\Majelani-Accounting"

echo ============================
echo   Majelani Accounting Sync
echo ============================

echo.
echo Pulling latest changes...
git pull origin main

echo.
echo Adding new/changed files...
git add .

echo.
set /p msg=Enter commit message (default: update): 
if "%msg%"=="" set msg=update

echo.
echo Committing changes...
git commit -m "%msg%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ============================
echo       Sync Completed!
echo ============================
pause