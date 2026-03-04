# Economic Engine - Cloud Run Deployment
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY packages/services/economic-engine/package*.json ./
COPY packages/lib ./packages/lib

# Install dependencies
RUN npm install --production

# Copy built application
COPY packages/services/economic-engine/dist ./dist

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "dist/packages/services/economic-engine/src/server.js"]
