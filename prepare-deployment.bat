@echo off
echo ========================================
echo Document Verification System
echo Render Deployment Preparation
echo ========================================
echo.

echo Step 1: Checking local setup...
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo ✓ Git initialized
) else (
    echo ✓ Git repository already initialized
)

echo.
echo Step 2: Adding deployment files to git...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "Ready for Render deployment - All services configured"

echo.
echo ========================================
echo 🚀 READY FOR DEPLOYMENT!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Push to GitHub:
echo    git remote add origin [YOUR_GITHUB_REPO_URL]
echo    git branch -M main
echo    git push -u origin main
echo.
echo 2. Deploy on Render:
echo    - Go to https://render.com
echo    - Click "New +" → "Blueprint"
echo    - Connect your GitHub repository
echo    - Render will auto-deploy using render.yaml!
echo.
echo 3. Set up MongoDB Atlas:
echo    - Visit https://cloud.mongodb.com
echo    - Create free cluster
echo    - Get connection string
echo    - Add to Render environment variables
echo.
echo ========================================
echo 📋 Important URLs After Deployment:
echo ========================================
echo Frontend:  https://document-verify-frontend.onrender.com
echo Backend:   https://document-verify-backend.onrender.com
echo AI/ML:     https://document-verify-ai-ml.onrender.com
echo.
echo Health Checks:
echo Backend:   https://document-verify-backend.onrender.com/api/health
echo AI/ML:     https://document-verify-ai-ml.onrender.com/health
echo.
echo 🎯 Deployment files ready:
echo ✓ render.yaml - Automatic deployment configuration
echo ✓ Dockerfiles - Container configurations
echo ✓ Environment examples - Variable templates
echo ✓ .gitignore - Proper file exclusions
echo.
pause
