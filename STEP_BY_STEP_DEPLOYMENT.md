# Render Deployment Guide - Step by Step

## ✅ Step 1: Project on GitHub (COMPLETED)
Your project is now on GitHub!

## 🚀 Step 2: Deploy on Render

### Option A: Automatic Deployment (Recommended)
1. **Go to Render Dashboard**: https://render.com
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** → **"Blueprint"**
4. **Connect your GitHub repository**
5. **Select your repository**: `DocumentVerify` (or whatever you named it)
6. **Render will automatically detect** the `render.yaml` file
7. **Click "Apply"** - This will create all services automatically!

### Option B: Manual Deployment
If automatic doesn't work, deploy each service manually:

#### 1. Database First
- Go to Render Dashboard
- Click "New +" → "PostgreSQL" (or use MongoDB Atlas)
- Name: `document-verify-db`
- Plan: Free
- Note the connection string

#### 2. Backend Service
- Click "New +" → "Web Service"
- Connect GitHub repo
- **Root Directory**: `server`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  NODE_ENV=production
  PORT=10000
  MONGODB_URI=your_database_connection_string
  JWT_SECRET=generate_random_32_char_string
  AI_ML_SERVICE_URL=https://document-verify-ai-ml.onrender.com
  CORS_ORIGIN=https://document-verify-frontend.onrender.com
  ```

#### 3. AI/ML Service
- Click "New +" → "Web Service"
- Connect GitHub repo
- **Root Directory**: `ai-ml-service`
- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  ```
  PYTHON_VERSION=3.11.0
  PORT=10000
  ```

#### 4. Frontend
- Click "New +" → "Static Site"
- Connect GitHub repo
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Environment Variables**:
  ```
  REACT_APP_API_URL=https://document-verify-backend.onrender.com/api
  REACT_APP_AI_ML_URL=https://document-verify-ai-ml.onrender.com
  ```

## ⚙️ Step 3: Configure Environment Variables

### Required Environment Variables:

#### Backend Service:
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/documentverify
JWT_SECRET=your_super_secure_32_character_random_string_here
AI_ML_SERVICE_URL=https://your-ai-ml-service.onrender.com
CORS_ORIGIN=https://your-frontend.onrender.com
```

#### Frontend Service:
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_AI_ML_URL=https://your-ai-ml-service.onrender.com
REACT_APP_ENVIRONMENT=production
```

#### AI/ML Service:
```env
PORT=10000
ENVIRONMENT=production
```

## 🔧 Step 4: Database Setup Options

### Option A: MongoDB Atlas (Recommended)
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Get connection string
5. Use in MONGODB_URI

### Option B: Render PostgreSQL
1. Create PostgreSQL database on Render
2. Update backend to use PostgreSQL instead of MongoDB
3. Use connection string in environment variables

## 📝 Step 5: Update Service URLs

After deployment, update the URLs in environment variables:
1. Note the URLs of each deployed service
2. Update CORS_ORIGIN in backend
3. Update REACT_APP_API_URL in frontend
4. Update AI_ML_SERVICE_URL in backend

## 🧪 Step 6: Test Deployment

1. **Check all services are running**
2. **Test health endpoints**:
   - Backend: `https://your-backend.onrender.com/api/health`
   - AI/ML: `https://your-ai-ml.onrender.com/health`
3. **Test frontend**: Open your frontend URL
4. **Test registration/login**
5. **Test document upload**

## 🚨 Common Issues & Solutions

### Build Failures:
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Check Node/Python versions

### Service Communication:
- Update CORS settings
- Check environment variable URLs
- Verify all services are deployed

### Database Connection:
- Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
- Verify connection string format
- Check database user permissions

## 📞 Need Help?
- Check Render logs for specific errors
- Verify all environment variables are set
- Ensure GitHub repository is properly connected

## 🎉 Success Indicators:
- All services show "Live" status in Render
- Frontend loads without errors
- API health endpoints return 200 OK
- User registration/login works
- Document upload functions properly

---

**Ready to deploy? Start with Step 2 above!** 🚀
