@echo off
title Agent for Code Agents - AI Workflow System
echo.
echo ================================
echo  Agent for Code Agents Starter
echo ================================
echo.

echo Starting services...
echo.

:: Start backend in new window
echo [1/3] Starting Backend Server (Port 8002)...
start "Backend Server" cmd /c "title Backend Server && conda activate agent && python simple_backend.py && pause"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 8 /nobreak >nul

:: Start frontend in new window
echo [2/3] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /c "title Frontend Server && cd frontend && npm run dev && pause"

:: Wait for frontend to start
echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul

:: Open browser
echo [3/3] Opening browser...
start "" "http://localhost:3000"

echo.
echo ================================
echo  Services Started Successfully!
echo ================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:8002
echo.
echo The servers are running in separate windows.
echo Close those windows to stop the services.
echo.
echo Press any key to exit this launcher...
pause >nul
exit


