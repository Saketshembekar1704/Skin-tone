@echo off
REM Virtual Try-On Startup Batch Script
REM This script starts both the backend and frontend servers

echo.
echo ========================================
echo  Virtual Try-On Application Startup
echo ========================================
echo.

REM Get the script directory
set PROJECT_ROOT=%~dp0

REM Set paths
set BACKEND_PATH=%PROJECT_ROOT%skin-tone-backend\fast-api
set FRONTEND_PATH=%PROJECT_ROOT%skin-tone-frontend

echo Backend path: %BACKEND_PATH%
echo Frontend path: %FRONTEND_PATH%
echo.

REM Check if directories exist
if not exist "%BACKEND_PATH%" (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

if not exist "%FRONTEND_PATH%" (
    echo ERROR: Frontend directory not found!
    pause
    exit /b 1
)

echo Starting Backend and Frontend servers...
echo.
echo Backend will be at: http://127.0.0.1:8000
echo Frontend will be at: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd /d %BACKEND_PATH% && (if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else if exist ..\..\venv\Scripts\activate.bat (call ..\..\venv\Scripts\activate.bat) else if exist ..\..\.venv\Scripts\activate.bat (call ..\..\.venv\Scripts\activate.bat)) && uvicorn main:app --reload"

REM Wait a bit for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd /d %FRONTEND_PATH% && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo You can close this window now.
echo.
pause
