#!/bin/bash
# Development startup script for Document Verification System

echo "Starting Document Verification System..."
echo

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "WARNING: Port $port is already in use!"
        read -p "Kill existing process? (y/n): " choice
        if [[ $choice == [Yy]* ]]; then
            kill -9 $(lsof -ti:$port) 2>/dev/null || echo "Failed to kill process on port $port"
        fi
    fi
}

# Check for port conflicts
echo "Checking for port conflicts..."
check_port 3000
check_port 5001
check_port 8000

echo
echo "Starting services..."

# Start AI/ML service in background
echo "Starting AI/ML service on port 8000..."
cd ai-ml-service
python app.py &
AI_ML_PID=$!
cd ..

# Wait a moment
sleep 3

# Start backend server
echo "Starting backend server on port 5001..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment
sleep 3

# Start frontend
echo "Starting frontend on port 3000..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo "AI/ML: http://localhost:8000"
echo
echo "Process IDs:"
echo "AI/ML: $AI_ML_PID"
echo "Backend: $BACKEND_PID" 
echo "Frontend: $FRONTEND_PID"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping all services..."
    kill $AI_ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Setup trap for cleanup
trap cleanup INT TERM

# Wait for all background processes
wait
