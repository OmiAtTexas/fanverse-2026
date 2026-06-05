# ============================================================
# FANVERSE 2026 — DOCKER CONFIGURATION
# Multi-stage build for production NestJS API
# ============================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod=false

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the NestJS app
RUN cd apps/api && pnpm build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 fanverse && \
    adduser --system --uid 1001 --ingroup fanverse fanverse

# Install only production deps
RUN npm install -g pnpm@9

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Change ownership
RUN chown -R fanverse:fanverse /app

USER fanverse

WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3001}/health || exit 1

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/main.js"]
