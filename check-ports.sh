#!/bin/bash
# Port checker and killer script for Unix/Linux/macOS

echo "Checking ports used by Document Verification System..."
echo

echo "Checking port 3000 (React frontend):"
lsof -i :3000 || echo "Port 3000 is free"
echo

echo "Checking port 5001 (Node.js backend):"
lsof -i :5001 || echo "Port 5001 is free"
echo

echo "Checking port 8000 (AI/ML service):"
lsof -i :8000 || echo "Port 8000 is free"
echo

read -p "Do you want to kill processes on these ports? (y/n): " choice
if [[ $choice == [Yy]* ]]; then
    echo "Killing processes on port 3000..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || echo "No process on port 3000"
    
    echo "Killing processes on port 5001..."
    kill -9 $(lsof -ti:5001) 2>/dev/null || echo "No process on port 5001"
    
    echo "Killing processes on port 8000..."
    kill -9 $(lsof -ti:8000) 2>/dev/null || echo "No process on port 8000"
    
    echo "Done!"
else
    echo "No processes killed."
fi
