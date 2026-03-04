FROM node:20
WORKDIR /app

# Copy entire monorepo
COPY . .

# Install dependencies (workspaces handle the rest)
RUN npm install

# Build in specific order to resolve typescript reference issues
RUN npm run build --workspace=@promethea/lib || npx tsc --build packages/lib/tsconfig.json
RUN npm run build --workspace=@promethea/firebase || npx tsc --build packages/firebase/tsconfig.json
RUN npm run build --workspace=@promethea/ai || npx tsc --build packages/ai/tsconfig.json
RUN npm run build --workspace=@promethea/guardian || npx tsc --build packages/guardian/tsconfig.json
RUN npm run build --workspace=@promethea/ai-service || npx tsc --build packages/services/ai-service/tsconfig.json

# Set workdir to the service
WORKDIR /app/packages/services/ai-service

# Environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
