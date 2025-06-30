@echo off
echo Starting the React development server...
cd "f:\DVS\document-verification-system\client"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Install react-scroll
echo Installing react-scroll...
npm install react-scroll

REM Start the development server
echo Starting development server...
npm start
