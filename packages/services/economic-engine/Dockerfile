FROM node:20
WORKDIR /app

# Copy entire monorepo
COPY . .

# Install dependencies
RUN npm install

# Build in specific order to resolve typescript reference issues
RUN npm run build --workspace=@promethea/lib || npx tsc --build packages/lib/tsconfig.json
RUN npm run build --workspace=@promethea/firebase || npx tsc --build packages/firebase/tsconfig.json
RUN npm run build --workspace=@promethea/ai || npx tsc --build packages/ai/tsconfig.json
RUN npm run build --workspace=@promethea/guardian || npx tsc --build packages/guardian/tsconfig.json
RUN npm run build --workspace=@promethea/economic-engine || npx tsc --build packages/services/economic-engine/tsconfig.json

# Set workdir to the service
WORKDIR /app/packages/services/economic-engine

# Environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start directly with node to bypass npm overhead/lookup issues
# Since we are in packages/services/economic-engine, dist/server.js should be local
CMD ["node", "dist/server.js"]
