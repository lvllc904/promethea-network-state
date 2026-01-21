FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml ./

# Copy shared packages
COPY packages/lib ./packages/lib
COPY packages/firebase ./packages/firebase

# Copy the service code
COPY packages/services/mcp-subscriber ./packages/services/mcp-subscriber

# Install dependencies
RUN pnpm install --filter @promethea/mcp-subscriber...

WORKDIR /app/packages/services/mcp-subscriber

# Build
RUN pnpm run build

EXPOSE 8080
CMD ["pnpm", "start"]
