# Quick Fix: Google OAuth Setup

## What's happening?
The "Error 401: invalid_client" means Google OAuth is not properly configured. The system is trying to use placeholder credentials.

## Quick Setup Steps:

### 1. Go to Google Cloud Console
- Open: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create/Select Project
- Click "Select a project" at the top
- Click "New Project" or use existing project
- Name it: "Document Verification System"

### 3. Enable APIs
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" and enable it
- Search for "Google Identity" and enable it

### 4. Create OAuth Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- If prompted, configure OAuth consent screen:
  - Choose "External" user type
  - Fill in app name: "Document Verification System"
  - Add your email as developer contact

### 5. Configure OAuth Client
- Application type: "Web application"
- Name: "DocuVerify Web Client"
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:50011/api/auth/google/callback`

### 6. Get Your Credentials
You'll get:
- Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)
- Client Secret (looks like: `GOCSPX-abc123def456`)

### 7. Update Your .env File
Replace in `server/.env`:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
```

### 8. Restart Backend
```bash
cd server
npm start
```

## Alternative: Use Email/Password Login
If you don't want to set up Google OAuth right now, you can:
1. Use the email/password login form instead
2. Register with email/password
3. The Google button will be hidden or show a helpful message

## Test Credentials
- Email: test2@example.com
- Password: Password123

The system works perfectly without Google OAuth!
