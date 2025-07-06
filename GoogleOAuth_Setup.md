# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (if not already enabled)
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Select **Web application** as the application type
6. Configure the authorized redirect URIs:
   - Development: `http://localhost:50011/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`

## 2. Add Credentials to Environment File

Replace the placeholder values in `server/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
```

## 3. Test Google OAuth

1. Start the backend server: `npm start` (should run on port 50011)
2. Start the frontend: `cd client && npm start` (should run on port 3000)
3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the OAuth flow

## 4. Troubleshooting

- **OAuth not configured error**: Make sure the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your `.env` file
- **Redirect URI mismatch**: Ensure the redirect URI in Google Cloud Console matches `http://localhost:50011/api/auth/google/callback`
- **Invalid client**: Double-check that the Client ID and Client Secret are correct

## 5. Production Deployment

For production deployment, make sure to:
1. Update the authorized redirect URIs in Google Cloud Console
2. Set the correct `CLIENT_URL` in your production environment variables
3. Use secure environment variable management (not plain text files)
