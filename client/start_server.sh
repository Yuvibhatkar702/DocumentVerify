#!/bin/bash

echo "Starting the React development server..."
cd "f:/DVS/document-verification-system/client"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install react-scroll if not already installed
npm install react-scroll

# Start the development server
npm start
