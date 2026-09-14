@echo off
title PAIMANA AI - Startup Launcher
echo ===================================================
echo     PAIMANA AI - MoSPI Project Risk Platform
echo ===================================================
echo.

echo [1/2] Starting ML Backend Server (FastAPI on Port 8000)...
cd /d "%~dp0ml"
if exist "..\.venv\Scripts\python.exe" (
    start "PAIMANA AI - ML Server (Port 8000)" cmd /k "..\.venv\Scripts\python.exe server.py"
) else (
    start "PAIMANA AI - ML Server (Port 8000)" cmd /k "python server.py"
)

echo [2/2] Starting Frontend UI Server (Vite on Port 5173)...
cd /d "%~dp0"
start "PAIMANA AI - Frontend UI (Port 5173)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo [3/3] Opening PAIMANA AI in your default browser...
start http://localhost:5173/

echo.
echo ===================================================
echo  All systems running successfully!
echo  Don't close the two background terminal windows.
echo  Website: http://localhost:5173
echo ===================================================
