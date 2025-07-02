@echo off
echo ================================================
echo Document Verification System - Quick Start
echo ================================================
echo.

echo Checking if required services are running...
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.runCommand('ping').ok" --quiet 2>nul
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running
) else (
    echo ✗ MongoDB is not running or not installed
    echo.
    echo To fix this, you can:
    echo 1. Install MongoDB Community Edition locally
    echo 2. Use MongoDB Atlas ^(cloud^) - Free tier available
    echo 3. Update MONGODB_URI in server/.env to point to your database
    echo.
    echo For MongoDB Atlas:
    echo - Visit https://cloud.mongodb.com
    echo - Create free cluster
    echo - Get connection string
    echo - Update server/.env file
    echo.
)

echo.
echo Starting all services...
echo.

REM Start AI/ML Service
echo Starting AI/ML Service on port 8000...
start "AI/ML Service" cmd /k "cd ai-ml-service && python app.py"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Backend Server
echo Starting Backend Server on port 5001...
start "Backend Server" cmd /k "cd server && npm start"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend on port 3000...
start "Frontend" cmd /k "cd client && npm start"

echo.
echo ================================================
echo All services are starting up!
echo ================================================
echo.
echo Service URLs:
echo - Frontend:  http://localhost:3000
echo - Backend:   http://localhost:5001
echo - AI/ML:     http://localhost:8000
echo.
echo Check the individual terminal windows for any errors.
echo.
echo To stop all services, close the terminal windows or run:
echo npm run stop:all
echo.
pause
