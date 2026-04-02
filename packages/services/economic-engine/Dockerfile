FROM node:20-slim

# Install system dependencies including build tools for native modules (sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Fix for older native modules like bs-platform on GCC 10+
ENV CFLAGS="-fcommon"
ENV CXXFLAGS="-fcommon"
ENV LDFLAGS="-Wl,--allow-multiple-definition"

WORKDIR /app

# Copy manifests
COPY package*.json ./
COPY packages/app/package.json ./packages/app/
COPY packages/lib/package.json ./packages/lib/
COPY packages/ui/package.json ./packages/ui/
COPY packages/components/package.json ./packages/components/
COPY packages/firebase/package.json ./packages/firebase/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/sovereign-store/package.json ./packages/sovereign-store/
COPY packages/services/ai-service/package.json ./packages/services/ai-service/
COPY packages/services/authentication-service/package.json ./packages/services/authentication-service/
COPY packages/services/economic-engine/package.json ./packages/services/economic-engine/

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Final environment configuration
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the sovereign engine
CMD ["node", "dist/server.js"]
