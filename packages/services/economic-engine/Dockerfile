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

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

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
