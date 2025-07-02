#!/bin/bash

# Deployment setup script for Document Verification System

echo "Setting up Document Verification System for deployment..."

# Create production environment files
echo "Creating production environment files..."

# Backend environment
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "Created server/.env from example file"
    echo "Please update the environment variables in server/.env"
fi

# AI/ML service environment
if [ ! -f "ai-ml-service/.env" ]; then
    cp ai-ml-service/.env.example ai-ml-service/.env
    echo "Created ai-ml-service/.env from example file"
    echo "Please update the environment variables in ai-ml-service/.env"
fi

# Client environment
if [ ! -f "client/.env" ]; then
    cp client/.env.example client/.env
    echo "Created client/.env from example file"
    echo "Please update the environment variables in client/.env"
fi

# Create uploads directory
mkdir -p uploads
echo "Created uploads directory"

# Install dependencies
echo "Installing dependencies..."
echo "Installing root dependencies..."
npm install

echo "Installing client dependencies..."
cd client && npm install && cd ..

echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing AI/ML dependencies..."
cd ai-ml-service
if command -v python3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v python &> /dev/null; then
    pip install -r requirements.txt
else
    echo "Python not found. Please install Python 3.8+ and run: pip install -r ai-ml-service/requirements.txt"
fi
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "Next steps for Render deployment:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Render"
echo "3. Import the repository - Render will detect render.yaml automatically"
echo "4. Update environment variables in Render dashboard"
echo "5. Deploy!"
echo ""
echo "Important environment variables to set in Render:"
echo "- MONGODB_URI (use MongoDB Atlas or Render PostgreSQL)"
echo "- JWT_SECRET (generate a secure random string)"
echo "- CORS_ORIGIN (your frontend URL)"
echo ""
