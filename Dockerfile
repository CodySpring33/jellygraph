# Multi-stage build for Jellyfin Analytics Dashboard

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies (including dev deps needed for build)
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the React app
RUN npm run build

# Clean up to reduce image size
RUN npm prune --production && npm cache clean --force

# Stage 2: Build the Node.js backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies needed for TypeScript compilation)
RUN npm ci

# Copy server source code and Prisma schema
COPY server/ ./server/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build:server

# Stage 3: Final production image
FROM node:20-alpine AS production

# Install sqlite3, OpenSSL, and other necessary packages for Prisma
RUN apk add --no-cache sqlite openssl openssl-dev

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend from backend-builder stage
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/server/setup.js ./server/

# Copy built frontend from frontend-builder stage to match server expectations
COPY --from=frontend-builder /app/client/dist ./dist/client/dist

# Copy environment configuration
COPY env.example ./.env.example

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app && \
    chmod 755 /app/data /app/logs /app/uploads

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/analytics.db"

# Start the application with setup
CMD ["sh", "-c", "node server/setup.js && node dist/server/app.js"]
