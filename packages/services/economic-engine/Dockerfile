FROM node:20

WORKDIR /app

# Install native build tools
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including production and dev for build)
RUN npm install

# Copy source
COPY . .

# Build the app locally
RUN npm run build

# Final touches
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server.js"]
