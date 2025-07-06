@echo off
echo Starting Document Verification Backend Server...
cd /d "C:\Users\Yuvi\OneDrive\Desktop\d\DocumentVerify\server"

echo Killing any existing node processes...
taskkill /f /im node.exe >nul 2>&1

echo Starting server on port 50011...
node server.js
pause
