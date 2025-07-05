# Multi-stage build for Document Verification System
FROM node:18-alpine AS base

# Install Python for AI/ML service
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production && \
    cd server && npm ci --only=production && \
    cd ../client && npm ci --only=production

# Build stage for client
FROM base AS build
WORKDIR /app
COPY . .
RUN cd client && npm run build

# Production stage
FROM node:18-alpine AS production

# Install Python for AI/ML service
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy built application
COPY --from=build /app/package*.json ./
COPY --from=build /app/server ./server/
COPY --from=build /app/client/build ./client/build/
COPY --from=build /app/ai-ml-service ./ai-ml-service/
COPY --from=build /app/node_modules ./node_modules/

# Install Python dependencies for AI/ML service
RUN cd ai-ml-service && pip3 install -r requirements.txt

# Create uploads directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 3000 5000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
