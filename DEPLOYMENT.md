# Document Verification System - Render Deployment

This repository contains a Document Verification System deployed on Render with three services:

## Services

1. **Frontend (React)** - Static site
2. **Backend (Node.js)** - Web service
3. **AI/ML Service (Python/FastAPI)** - Web service
4. **MongoDB Database** - Database service

## Deployment Steps

### Prerequisites
- GitHub repository with this code
- Render account (free tier available)

### Quick Deploy
1. Fork/clone this repository to your GitHub account
2. Connect your GitHub account to Render
3. Import this repository to Render
4. Render will automatically detect the `render.yaml` file and deploy all services

### Manual Deployment

#### 1. Database Setup
1. Go to Render Dashboard → New → PostgreSQL (or use MongoDB Atlas)
2. Create database named `document-verify-db`
3. Note the connection string

#### 2. Backend Service
1. Go to Render Dashboard → New → Web Service
2. Connect GitHub repository
3. Select root directory: `server`
4. Environment: `Node`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: Your database connection string
   - `JWT_SECRET`: Generate a secure random string
   - `AI_ML_SERVICE_URL`: URL of your AI/ML service

#### 3. AI/ML Service
1. Go to Render Dashboard → New → Web Service
2. Connect GitHub repository
3. Select root directory: `ai-ml-service`
4. Environment: `Python`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
7. Add environment variables:
   - `PYTHON_VERSION`: `3.11.0`
   - `PORT`: `10000`

#### 4. Frontend Service
1. Go to Render Dashboard → New → Static Site
2. Connect GitHub repository
3. Select root directory: `client`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `build`

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AI_ML_SERVICE_URL=https://your-ai-ml-service-url.onrender.com
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### AI/ML Service (.env)
```
PORT=10000
ENVIRONMENT=production
```

## Post-Deployment Configuration

1. Update CORS settings in both backend and AI/ML service to include your frontend URL
2. Update API endpoints in the frontend to point to your deployed backend
3. Test all services are communicating correctly

## Service URLs
After deployment, you'll get URLs like:
- Frontend: `https://document-verify-frontend.onrender.com`
- Backend: `https://document-verify-backend.onrender.com`
- AI/ML: `https://document-verify-ai-ml.onrender.com`

## Monitoring
- All services include health check endpoints
- Monitor logs through Render Dashboard
- Set up alerts for service downtime

## Scaling
- Free tier: Services may sleep after 15 minutes of inactivity
- Paid tier: Always-on services with better performance
- Consider upgrading for production use

## Support
For deployment issues, check:
1. Render service logs
2. Build logs for any errors
3. Environment variable configuration
4. Database connectivity
