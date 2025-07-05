# Railway Environment Variables for DocumentVerify

Add these environment variables in your Railway dashboard:

## Required Variables:
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://yuvibhatkar702:Yuvi123@dvs.wfn30nz.mongodb.net/documentverify?retryWrites=true&w=majority
JWT_SECRET=DocumentVerify2025SuperSecretKeyForJWTTokensProductionEnvironment
CORS_ORIGIN=https://web-production-11172.up.railway.app
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

## How to add:
1. Go to your Railway project dashboard
2. Click on "Variables" tab
3. Add each variable one by one
4. Click "Deploy" to restart with new variables

## Notes:
- CORS_ORIGIN is set to your Railway URL: https://web-production-11172.up.railway.app
- JWT_SECRET is a strong production secret
- MongoDB URI is your existing Atlas connection
