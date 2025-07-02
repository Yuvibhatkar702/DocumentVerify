# 🚀 Pre-Deployment Checklist

## Before You Deploy - Complete This Checklist:

### ✅ Local Testing
- [ ] All services running locally (Frontend: 3000, Backend: 5001, AI/ML: 8000)
- [ ] User registration works
- [ ] User login works  
- [ ] Document upload functionality tested
- [ ] No console errors in browser
- [ ] API endpoints responding correctly

### ✅ Code Preparation
- [ ] All environment variables configured
- [ ] No hardcoded URLs or secrets in code
- [ ] .gitignore file properly excludes sensitive files
- [ ] All dependencies listed in package.json/requirements.txt

### ✅ Database Setup
Choose one option:
- [ ] **Option A**: MongoDB Atlas (Recommended for production)
  - Create free cluster at https://cloud.mongodb.com
  - Create database user
  - Whitelist all IP addresses (0.0.0.0/0)
  - Get connection string
- [ ] **Option B**: Local MongoDB (Development only)
  - Note: Won't work for Render deployment

### ✅ GitHub Repository
- [ ] Code committed to GitHub repository
- [ ] Repository is public or Render has access
- [ ] All deployment files present (render.yaml, Dockerfiles, etc.)

### ✅ Render Account
- [ ] Account created at https://render.com
- [ ] GitHub connected to Render account

## 📋 Environment Variables You'll Need:

### Backend Service:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/documentverify?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-random-string-here
AI_ML_SERVICE_URL=https://document-verify-ai-ml.onrender.com
CORS_ORIGIN=https://document-verify-frontend.onrender.com
```

### AI/ML Service:
```
PYTHON_VERSION=3.11.0
PORT=10000
ENVIRONMENT=production
```

### Frontend Service:
```
NODE_VERSION=18
REACT_APP_API_URL=https://document-verify-backend.onrender.com/api
REACT_APP_AI_ML_URL=https://document-verify-ai-ml.onrender.com
REACT_APP_ENVIRONMENT=production
```

## 🎯 Quick Start Commands:

### 1. Commit and Push to GitHub:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy to Render:
- Go to render.com
- Click "New +" → "Blueprint"
- Connect your GitHub repo
- Render will auto-deploy using render.yaml!

## ⚡ Expected Deployment Time:
- **Backend**: ~5-10 minutes
- **AI/ML Service**: ~10-15 minutes (Python dependencies)
- **Frontend**: ~3-5 minutes
- **Total**: ~20-30 minutes

## 🔍 Post-Deployment Testing:
1. Check all service health endpoints
2. Test user registration
3. Test document upload
4. Verify all features work

## 📞 Need Help?
- Check Render service logs for any errors
- Verify environment variables are set correctly
- Ensure MongoDB Atlas connection string is correct

---

**Ready to deploy? All checkboxes completed? Let's go! 🚀**
