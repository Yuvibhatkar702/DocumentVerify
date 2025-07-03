# MongoDB Atlas Setup for Render Deployment

## 🗄️ Quick MongoDB Atlas Setup (Free Tier)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://cloud.mongodb.com
2. Click "Try Free"
3. Sign up with your email or Google account

### Step 2: Create a Cluster
1. Choose "Build a Database" → "M0 Sandbox (Free)"
2. Select a cloud provider (AWS recommended)
3. Choose a region close to your users
4. Cluster Name: `document-verify-cluster`
5. Click "Create"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `docverifyuser`
5. Password: Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Comment: "Render deployment"
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Databases" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 4.1 or later
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Replace `<dbname>` with `documentverify`

### Example Connection String:
```
mongodb+srv://docverifyuser:YOUR_PASSWORD@document-verify-cluster.abc123.mongodb.net/documentverify?retryWrites=true&w=majority
```

### Step 6: Test Connection (Optional)
1. Go back to your local project
2. Update `server/.env` with the new MONGODB_URI
3. Restart your backend server
4. Check if it connects successfully

---

## 🚀 Next Steps for Render:
1. Use this connection string as `MONGODB_URI` in Render environment variables
2. Make sure the IP whitelist includes 0.0.0.0/0 for Render to connect
3. Keep your password secure!

**Your MongoDB Atlas setup is complete!** ✅
