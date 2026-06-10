FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy pre-compiled standalone Next.js server output from Cloud Build host
COPY packages/app/.next/standalone ./
COPY packages/app/.next/static ./packages/app/.next/static
COPY packages/app/public ./packages/app/public
COPY packages/ai/dist ./packages/ai/dist

USER nextjs
EXPOSE 8080

CMD ["node", "packages/app/server.js"]
