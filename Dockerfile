# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM node:26-alpine AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM node:26-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=postgresql://build:build@example.invalid/aegis?sslmode=require
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM production-dependencies AS tooling
ENV NODE_ENV=production
COPY drizzle ./drizzle
COPY scripts/run-migrations.mjs ./scripts/run-migrations.mjs
RUN apk upgrade --no-cache \
    && rm -rf /opt/yarn-v1.22.22 \
        /usr/local/lib/node_modules/npm \
        /usr/local/lib/node_modules/corepack \
    && rm -f /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/bin/corepack \
        /usr/local/bin/yarn \
        /usr/local/bin/yarnpkg
USER node
CMD ["node", "scripts/run-migrations.mjs"]

FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN apk upgrade --no-cache \
    && rm -rf /opt/yarn-v1.22.22 \
        /usr/local/lib/node_modules/npm \
        /usr/local/lib/node_modules/corepack \
    && rm -f /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/bin/corepack \
        /usr/local/bin/yarn \
        /usr/local/bin/yarnpkg \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs \
    && mkdir -p /app/data /app/.next/cache \
    && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER 1001:1001
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
