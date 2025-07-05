# Railway Deployment Guide for Document Verification System

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. GitHub account
3. Git installed on your local machine

## Step 1: Prepare Your Repository

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Railway deployment"
   ```

2. **Create GitHub Repository:**
   - Go to GitHub and create a new repository
   - Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy on Railway

1. **Login to Railway:**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Configure Environment Variables:**
   Add these environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   MONGODB_URI=your-mongodb-connection-string
   CORS_ORIGIN=https://your-app.railway.app
   MAX_FILE_SIZE=10485760
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup (MongoDB Atlas):**
   - Go to https://cloud.mongodb.com
   - Create a free cluster
   - Create a database user
   - Get the connection string
   - Add it to MONGODB_URI in Railway

## Step 3: Configure Custom Domain (Optional)

1. **Add Custom Domain:**
   - In Railway dashboard, go to your project
   - Click on "Settings" → "Domains"
   - Add your custom domain

## Step 4: Deploy

1. **Automatic Deployment:**
   - Railway will automatically deploy when you push to main branch
   - First deployment may take 5-10 minutes

2. **Monitor Deployment:**
   - Check the "Deployments" tab for build logs
   - Check the "Metrics" tab for runtime logs

## Step 5: Verify Deployment

1. **Check Health Endpoint:**
   - Visit: `https://your-app.railway.app/health`
   - Should return: `{"status":"OK","timestamp":"...","uptime":...}`

2. **Test Application:**
   - Visit your app URL
   - Test user registration/login
   - Test document upload

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Server port (auto-set by Railway) | `5000` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://your-app.railway.app` |

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check build logs in Railway dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **App Doesn't Start:**
   - Check runtime logs
   - Verify environment variables
   - Check if MongoDB connection is working

3. **File Upload Issues:**
   - Railway provides ephemeral storage
   - Consider using cloud storage (AWS S3, Cloudinary) for production

### Useful Commands:

```bash
# View logs
railway logs

# Connect to Railway CLI
npm install -g @railway/cli
railway login
railway link
```

## Post-Deployment Checklist

- [ ] Health endpoint responds correctly
- [ ] User registration works
- [ ] User login works
- [ ] Document upload works
- [ ] Database operations work
- [ ] Environment variables are set
- [ ] CORS is configured correctly
- [ ] Domain is configured (if using custom domain)

## Notes

- Railway provides 500 hours of free usage per month
- Ephemeral storage means uploaded files are lost on restarts
- Consider upgrading to a paid plan for production use
- Monitor usage in Railway dashboard

## Support

- Railway Documentation: https://docs.railway.app
- Railway Community: https://discord.gg/railway
- GitHub Issues: Create issues in your repository
