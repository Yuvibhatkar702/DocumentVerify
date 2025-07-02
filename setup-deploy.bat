@echo off
REM Deployment setup script for Document Verification System (Windows)

echo Setting up Document Verification System for deployment...

REM Create production environment files
echo Creating production environment files...

REM Backend environment
if not exist "server\.env" (
    copy "server\.env.example" "server\.env" >nul
    echo Created server\.env from example file
    echo Please update the environment variables in server\.env
)

REM AI/ML service environment
if not exist "ai-ml-service\.env" (
    copy "ai-ml-service\.env.example" "ai-ml-service\.env" >nul
    echo Created ai-ml-service\.env from example file
    echo Please update the environment variables in ai-ml-service\.env
)

REM Client environment
if not exist "client\.env" (
    copy "client\.env.example" "client\.env" >nul
    echo Created client\.env from example file
    echo Please update the environment variables in client\.env
)

REM Create uploads directory
if not exist "uploads" mkdir uploads
echo Created uploads directory

REM Install dependencies
echo Installing dependencies...
echo Installing root dependencies...
call npm install

echo Installing client dependencies...
cd client
call npm install
cd ..

echo Installing server dependencies...
cd server
call npm install
cd ..

echo Installing AI/ML dependencies...
cd ai-ml-service
pip install -r requirements.txt
cd ..

echo.
echo Setup complete!
echo.
echo Next steps for Render deployment:
echo 1. Push your code to GitHub
echo 2. Connect your GitHub repo to Render
echo 3. Import the repository - Render will detect render.yaml automatically
echo 4. Update environment variables in Render dashboard
echo 5. Deploy!
echo.
echo Important environment variables to set in Render:
echo - MONGODB_URI (use MongoDB Atlas or Render PostgreSQL)
echo - JWT_SECRET (generate a secure random string)
echo - CORS_ORIGIN (your frontend URL)
echo.
