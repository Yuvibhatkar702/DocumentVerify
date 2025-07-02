# Document Verification System - Connection Fix

## Issue Fixed: ✅
The error "Unable to connect to server" was caused by the frontend trying to connect to the wrong port.

## What was changed:
1. Backend server now runs on port 5001 (instead of 5000 to avoid conflicts)
2. Updated frontend API URLs to point to port 5001
3. Created proper environment configuration

## Steps to restart and test:

### 1. Stop all running services
- Close all terminal windows running the services
- Or use Ctrl+C in each terminal

### 2. Restart the services in order:

#### Step 1: Start Backend (Terminal 1)
```bash
cd server
npm start
```
Wait for: "Server running on port 5001"

#### Step 2: Start AI/ML Service (Terminal 2)
```bash
cd ai-ml-service
python app.py
```
Wait for: "Uvicorn running on http://0.0.0.0:8000"

#### Step 3: Start Frontend (Terminal 3)
```bash
cd client
npm start
```
Wait for: "Local: http://localhost:3000"

### 3. Test the connection:
1. Go to http://localhost:3000
2. Try to register or login
3. The error should be gone

## Quick Start Script:
You can also use the automated script:
```bash
./start-all.bat
```

## Service URLs:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **AI/ML Service**: http://localhost:8000
- **Health Checks**: 
  - Backend: http://localhost:5001/api/health
  - AI/ML: http://localhost:8000/health

## Database Setup:
If you see database connection errors:
1. Install MongoDB locally, OR
2. Use MongoDB Atlas (cloud - free tier available)
3. Update `MONGODB_URI` in `server/.env`

## For Render Deployment:
The deployment files are ready:
- `render.yaml` - Automated deployment configuration
- `DEPLOYMENT.md` - Detailed deployment guide
- Environment examples for all services

The connection issue should now be resolved! 🎉
