# Document Verification System - Render Deployment Guide

## 🚀 Ready to Deploy!

Your project is now configured and ready for Render deployment. Follow these steps:

## Prerequisites ✅
- [x] GitHub account
- [x] Render account (free tier available at render.com)
- [x] Code working locally

## Step 1: Prepare Your Code for Deployment

### 1.1 Create a GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Document Verification System ready for deployment"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/document-verification-system.git

# Push to GitHub
git push -u origin main
```

### 1.2 Environment Variables Setup
We've already created all the necessary environment files:
- `server/.env.example` - Backend environment template
- `ai-ml-service/.env.example` - AI/ML service template  
- `client/.env.example` - Frontend environment template

## Step 2: Deploy to Render

### Option A: Automatic Deployment (Recommended)
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and deploy all services!

### Option B: Manual Deployment

#### 2.1 Create Database
1. Go to Render Dashboard → "New +" → "PostgreSQL" (or use MongoDB Atlas)
2. Name: `document-verify-db`
3. Database Name: `documentverify`
4. Username: `docverifyuser`
5. Note the connection string

#### 2.2 Deploy Backend Service
1. Dashboard → "New +" → "Web Service"
2. Connect GitHub repository
3. **Settings:**
   - Name: `document-verify-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=[Your MongoDB Atlas connection string]
   JWT_SECRET=[Generate a secure random string]
   AI_ML_SERVICE_URL=https://document-verify-ai-ml.onrender.com
   CORS_ORIGIN=https://document-verify-frontend.onrender.com
   ```

#### 2.3 Deploy AI/ML Service
1. Dashboard → "New +" → "Web Service"
2. **Settings:**
   - Name: `document-verify-ai-ml`
   - Root Directory: `ai-ml-service`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables:**
   ```
   PYTHON_VERSION=3.11.0
   PORT=10000
   ENVIRONMENT=production
   ```

#### 2.4 Deploy Frontend
1. Dashboard → "New +" → "Static Site"
2. **Settings:**
   - Name: `document-verify-frontend`
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://document-verify-backend.onrender.com/api
   REACT_APP_AI_ML_URL=https://document-verify-ai-ml.onrender.com
   REACT_APP_ENVIRONMENT=production
   ```

## Step 3: Post-Deployment Configuration

### 3.1 Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Update `MONGODB_URI` in backend service environment

### 3.2 Update CORS Settings
Once deployed, update the CORS origins in your backend and AI/ML services with the actual Render URLs.

## Step 4: Monitor Deployment

### Service URLs (after deployment):
- **Frontend**: `https://document-verify-frontend.onrender.com`
- **Backend**: `https://document-verify-backend.onrender.com`
- **AI/ML**: `https://document-verify-ai-ml.onrender.com`

### Health Check URLs:
- Backend: `https://document-verify-backend.onrender.com/api/health`
- AI/ML: `https://document-verify-ai-ml.onrender.com/health`

## Step 5: Testing

1. Visit your frontend URL
2. Test user registration
3. Test document upload
4. Check all features work

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check build logs in Render dashboard
2. **Environment Variables**: Ensure all required env vars are set
3. **Database Connection**: Verify MongoDB Atlas connection string
4. **CORS Errors**: Update CORS origins with actual URLs

### Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- Cold start delay when waking up
- 750 hours/month limit
- Consider upgrading for production use

## Next Steps After Deployment:
1. Custom domain setup (optional)
2. SSL certificates (automatic with Render)
3. Monitoring and alerts
4. Database backups
5. Performance optimization

---

## Quick Commands for Git Deployment:

```bash
# Add and commit changes
git add .
git commit -m "Ready for Render deployment"
git push origin main

# If first time pushing:
git branch -M main
git remote add origin [your-repo-url]
git push -u origin main
```

Ready to deploy? Let's go! 🚀
