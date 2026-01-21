FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml ./

# Copy the service code
COPY packages/services/mcp-server ./packages/services/mcp-server

# Install dependencies
RUN pnpm install --filter @promethea/mcp-server...

WORKDIR /app/packages/services/mcp-server

# Build
RUN pnpm run build

EXPOSE 8080
CMD ["pnpm", "start"]
