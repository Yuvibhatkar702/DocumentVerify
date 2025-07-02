@echo off
REM Development startup script for Document Verification System

echo Starting Document Verification System...
echo.

REM Check if ports are free
echo Checking for port conflicts...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo WARNING: Port 3000 is already in use!
    set /p choice="Kill existing process? (y/n): "
    if /i "%choice%"=="y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>nul
    )
)

netstat -ano | findstr :5001 >nul
if %errorlevel%==0 (
    echo WARNING: Port 5001 is already in use!
    set /p choice="Kill existing process? (y/n): "
    if /i "%choice%"=="y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do taskkill /PID %%a /F 2>nul
    )
)

netstat -ano | findstr :8000 >nul
if %errorlevel%==0 (
    echo WARNING: Port 8000 is already in use!
    set /p choice="Kill existing process? (y/n): "
    if /i "%choice%"=="y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F 2>nul
    )
)

echo.
echo Starting services...

REM Start AI/ML service in background
echo Starting AI/ML service on port 8000...
start "AI/ML Service" cmd /k "cd ai-ml-service && python app.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start backend server
echo Starting backend server on port 5001...
start "Backend Server" cmd /k "cd server && npm start"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend on port 3000...
start "Frontend" cmd /k "cd client && npm start"

echo.
echo All services starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5001
echo AI/ML: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
