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
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/sovereign-store/package.json ./packages/sovereign-store/
COPY packages/services/ai-service/package.json ./packages/services/ai-service/
COPY packages/services/authentication-service/package.json ./packages/services/authentication-service/
COPY packages/services/economic-engine/package.json ./packages/services/economic-engine/
COPY packages/cartographer/package.json ./packages/cartographer/

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

ARG CACHE_BUSTER=1776555364
RUN echo "Metabolic Cache: $CACHE_BUSTER"

# Copy source code
COPY . .

# Step 1: Build internal libraries in order
RUN npx tsc --build packages/lib/tsconfig.json || true
RUN npx tsc --build packages/cartographer/tsconfig.json || true

# Step 2: Build the engine TypeScript
RUN cd packages/services/economic-engine && npm run build

# Final environment configuration
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the sovereign engine
CMD ["node", "packages/services/economic-engine/dist/server.js"]
