# 🆓 Deploy on Render - 100% FREE (No Payment Info Required)

## ❌ Issue: Blueprint asking for payment
The Blueprint deployment sometimes asks for payment info even for free services.

## ✅ Solution: Manual Deployment (Completely FREE)

### Step 1: Close the Payment Dialog
- Click the "X" or "Cancel" to close the payment dialog
- Go back to Render Dashboard

### Step 2: Deploy Services One by One (FREE)

#### 🟢 Service 1: Frontend (Static Site - Always FREE)
1. **Click "New +"** → **"Static Site"**
2. **Connect GitHub** → Select your repository
3. **Settings:**
   - **Name**: `document-verify-frontend`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. **Environment Variables**: (Add these)
   ```
   REACT_APP_API_URL=https://document-verify-backend.onrender.com/api
   REACT_APP_AI_ML_URL=https://document-verify-ai-ml.onrender.com
   ```
5. **Click "Create Static Site"** - This is 100% FREE!

#### 🟢 Service 2: Backend (Web Service - FREE Tier)
1. **Click "New +"** → **"Web Service"**
2. **Connect GitHub** → Select your repository
3. **Settings:**
   - **Name**: `document-verify-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Instance Type**: Select **"Free"** (should be default)
5. **Environment Variables**: (Add these)
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_secure_random_string_here
   MONGODB_URI=your_mongodb_connection_here
   ```
6. **Click "Create Web Service"** - This uses FREE tier!

#### 🟢 Service 3: AI/ML Service (Web Service - FREE Tier)
1. **Click "New +"** → **"Web Service"**
2. **Connect GitHub** → Select your repository
3. **Settings:**
   - **Name**: `document-verify-ai-ml`
   - **Environment**: `Python`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `ai-ml-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. **Instance Type**: Select **"Free"** (should be default)
5. **Environment Variables**: (Add these)
   ```
   PORT=10000
   ENVIRONMENT=production
   ```
6. **Click "Create Web Service"** - This uses FREE tier!

## 🔗 After All Services are Created:

### Update Frontend URLs:
1. Go to your **frontend service** settings
2. Update environment variables with actual service URLs:
   ```
   REACT_APP_API_URL=https://document-verify-backend-xyz.onrender.com/api
   REACT_APP_AI_ML_URL=https://document-verify-ai-ml-xyz.onrender.com
   ```

### Update Backend CORS:
1. Go to your **backend service** settings
2. Add this environment variable:
   ```
   CORS_ORIGIN=https://document-verify-frontend-xyz.onrender.com
   ```

## 🎯 Generate JWT Secret:
Use this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ Setup FREE Database:
### Option A: MongoDB Atlas (Recommended)
1. Go to https://cloud.mongodb.com
2. Create free account and cluster
3. Get connection string
4. Add to backend's `MONGODB_URI`

### Option B: Use Render's PostgreSQL (Also FREE)
1. Create PostgreSQL database on Render
2. I can help you convert the backend to use PostgreSQL

## ✅ All Services Will Be FREE:
- **Static Site**: Unlimited (FREE)
- **Web Services**: 750 hours/month each (FREE)
- **MongoDB Atlas**: 512MB storage (FREE)

**No payment information needed!** 🎉

---

## 🚀 Quick Start:
1. Deploy Static Site first (frontend)
2. Deploy Backend Web Service
3. Deploy AI/ML Web Service
4. Update environment variables with actual URLs
5. Set up MongoDB Atlas
6. Test your app!

**This method is 100% FREE and doesn't require any payment info!**
