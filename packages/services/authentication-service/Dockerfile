FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml ./

# Copy the service code
COPY packages/services/authentication-service ./packages/services/authentication-service

# Install dependencies (package name is @promethea/authentication-service)
RUN pnpm install --filter @promethea/authentication-service...

WORKDIR /app/packages/services/authentication-service

# Build
RUN pnpm run build

EXPOSE 8080
CMD ["pnpm", "start"]
