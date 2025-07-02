@echo off
REM Port checker and killer script for Windows

echo Checking ports used by Document Verification System...
echo.

echo Checking port 3000 (React frontend):
netstat -ano | findstr :3000
echo.

echo Checking port 5001 (Node.js backend):
netstat -ano | findstr :5001
echo.

echo Checking port 8000 (AI/ML service):
netstat -ano | findstr :8000
echo.

echo If you need to kill a process, use: taskkill /PID [PID_NUMBER] /F
echo.

set /p choice="Do you want to kill all Node.js and Python processes? (y/n): "
if /i "%choice%"=="y" (
    echo Killing Node.js processes...
    taskkill /F /IM node.exe 2>nul
    echo Killing Python processes...
    taskkill /F /IM python.exe 2>nul
    taskkill /F /IM python3.exe 2>nul
    echo Done!
) else (
    echo No processes killed.
)

pause
