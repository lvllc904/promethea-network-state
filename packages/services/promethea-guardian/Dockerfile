FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml ./

# Copy the service code (directory name is promethea-guardian)
COPY packages/services/promethea-guardian ./packages/services/promethea-guardian

# Install dependencies (package name is @promethea/promethea-guardian-service)
RUN pnpm install --filter @promethea/promethea-guardian-service...

WORKDIR /app/packages/services/promethea-guardian

# Build
RUN pnpm run build

EXPOSE 8080
CMD ["pnpm", "start"]
