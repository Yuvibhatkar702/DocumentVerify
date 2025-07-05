# Fix Your Existing Render Deployment

## Current Services:
1. **DocuVerify-backend** (https://documentverify-backend.onrender.com) - NEEDS FIX
2. **DocuVerify** (https://docuverify-wuh9.onrender.com) - Static site
3. **DocuVerify-ai-ml** (https://docuverify-ai-ml.onrender.com) - AI service

## Fix the Backend Service

### 1. Go to your Render Dashboard
- Visit https://dashboard.render.com
- Click on your **DocuVerify-backend** service

### 2. Update Build Command
**Current Build Command:** (probably empty or wrong)
**New Build Command:** 
```bash
npm install && cd client && npm install && npm run build && cd ..
```

### 3. Update Start Command
**Current Start Command:** (probably `npm start`)
**New Start Command:** 
```bash
npm start
```

### 4. Update Environment Variables
Add these environment variables in your Render service:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://yuvibhatkar702:Yuvi123@dvs.wfn30nz.mongodb.net/documentverify?retryWrites=true&w=majority
JWT_SECRET=DocumentVerify2025SuperSecretKeyForJWTTokensProductionEnvironment
CORS_ORIGIN=https://documentverify-backend.onrender.com
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Redeploy
- Click "Manual Deploy" → "Deploy Latest Commit"
- Wait for the build to complete
- Check the logs for any errors

## Alternative: Use the Static Site for Frontend

Since you already have a static site deployed at `https://docuverify-wuh9.onrender.com`, you can:

1. **Update the static site** to use your backend API
2. **Configure the backend** to only serve API endpoints
3. **Update CORS** to allow the static site domain

## Test After Deployment

1. **Backend Health Check:** https://documentverify-backend.onrender.com/health
2. **Frontend:** https://docuverify-wuh9.onrender.com
3. **API Test:** Try registering a user through the frontend

## If Still Not Working

If the backend still doesn't work, create a new service with these settings:
- **Service Type:** Web Service
- **Build Command:** `npm install && cd client && npm install && npm run build && cd ..`
- **Start Command:** `npm start`
- **Environment:** Node
- **Branch:** main
