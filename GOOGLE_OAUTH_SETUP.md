# Google OAuth Setup Instructions

## Steps to Configure Google OAuth for Document Verification System

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or Google OAuth API

### 2. Create OAuth 2.0 Credentials
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Web application" as the application type
4. Configure the following:
   - **Name**: DocumentVerify OAuth
   - **Authorized JavaScript origins**: 
     - `http://localhost:50011` (for development)
     - Your production domain (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:50011/api/auth/google/callback` (for development)
     - Your production callback URL (for production)

### 3. Update Environment Variables
1. Copy the Client ID and Client Secret from Google Cloud Console
2. Update the `.env` file in the `server` directory:
   ```
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   ```

### 4. Test the Setup
1. Start your backend server
2. Start your frontend server
3. Try clicking "Continue with Google" on the login/register page
4. If configured correctly, you should be redirected to Google for authentication

### 5. Troubleshooting
- If you see "OAuth is not configured" error, check that the environment variables are set correctly
- If you get redirect URI mismatch error, ensure the callback URL in Google Cloud Console matches your server URL
- Make sure your server is running on the correct port (50011 for development)

### Current Status
- ✅ GitHub OAuth has been removed from the application
- ✅ Google OAuth backend is configured and ready
- ✅ Error handling is in place for missing credentials
- ⚠️ Google OAuth credentials need to be added to `.env` file
