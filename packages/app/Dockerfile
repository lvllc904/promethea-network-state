FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/
COPY packages/lib/package.json ./packages/lib/
COPY packages/ui/package.json ./packages/ui/
COPY packages/components/package.json ./packages/components/
COPY packages/firebase/package.json ./packages/firebase/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/sovereign-store/package.json ./packages/sovereign-store/

RUN npm ci --legacy-peer-deps

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages_deps

# Copy all source
COPY . .

# Rebuild any native deps for the target platform
RUN npm ci --legacy-peer-deps

# Build Next.js standalone output
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build --workspace=@promethea/app

# Production image - copy only standalone output
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/static ./packages/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/public ./packages/app/public

USER nextjs

EXPOSE 8080

CMD ["node", "packages/app/server.js"]
