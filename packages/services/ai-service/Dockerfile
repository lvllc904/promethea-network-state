# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-workspace.yaml ./

# Copy shared packages
COPY packages/lib ./packages/lib
COPY packages/firebase ./packages/firebase
COPY packages/ai ./packages/ai

# Copy the service code
COPY packages/services/ai-service ./packages/services/ai-service

# Install dependencies (filtered for this service and its deps)
RUN pnpm install --filter @promethea/ai-service...

# Set workdir to the service
WORKDIR /app/packages/services/ai-service

# Build the TypeScript code (if not already handled by pnpm install lifecycle, but usually needs explicit build)
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["pnpm", "start"]
