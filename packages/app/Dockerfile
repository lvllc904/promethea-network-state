FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy manifests
COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/
COPY packages/lib/package.json ./packages/lib/
COPY packages/ui/package.json ./packages/ui/
COPY packages/components/package.json ./packages/components/
COPY packages/firebase/package.json ./packages/firebase/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/sovereign-store/package.json ./packages/sovereign-store/
COPY packages/ai/package.json ./packages/ai/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Environment variables
ARG NEXT_PUBLIC_AI_SERVICE_URL
ARG NEXT_PUBLIC_GUARDIAN_URL
ARG NEXT_PUBLIC_ENGINE_URL
ARG NEXT_PUBLIC_DISABLE_FIREBASE
ARG CACHE_BUSTER=1776555360

ENV NEXT_PUBLIC_AI_SERVICE_URL=$NEXT_PUBLIC_AI_SERVICE_URL
ENV NEXT_PUBLIC_GUARDIAN_URL=$NEXT_PUBLIC_GUARDIAN_URL
ENV NEXT_PUBLIC_ENGINE_URL=$NEXT_PUBLIC_ENGINE_URL
ENV NEXT_PUBLIC_DISABLE_FIREBASE=$NEXT_PUBLIC_DISABLE_FIREBASE
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9105849211-9ba48
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build dependencies in CORRECT order
RUN echo "Cache Busting Substrate: $CACHE_BUSTER"
RUN npx tsc --build packages/lib/tsconfig.json
RUN npx tsc --build packages/sovereign-store/tsconfig.json
RUN npx tsc --build packages/hooks/tsconfig.json
RUN npx tsc --build packages/firebase/tsconfig.json
RUN npx tsc --build packages/ui/tsconfig.json
RUN npx tsc --build packages/ai/tsconfig.json
RUN npx tsc --build packages/components/tsconfig.json

# Build the main app
RUN rm -rf packages/app/.next
RUN npm run build --workspace=@promethea/app

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/static ./packages/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/public ./packages/app/public

USER nextjs
EXPOSE 8080

CMD ["node", "packages/app/server.js"]
