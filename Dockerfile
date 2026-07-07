# syntax=docker/dockerfile:1.7

# ----------------------------------------------------------------------------
# Stage 1: Dependencies (cached separately from source for faster rebuilds)
# ----------------------------------------------------------------------------
FROM node:22-alpine AS deps
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate
WORKDIR /app

# Only copy manifests first to maximize layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# ----------------------------------------------------------------------------
# Stage 2: Build
# ----------------------------------------------------------------------------
FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# ----------------------------------------------------------------------------
# Stage 3: Runtime (Node server for static assets + chatbot API)
# ----------------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache tini wget && \
    addgroup -S ganipedia && \
    adduser -S -G ganipedia ganipedia

ENV NODE_ENV=production \
    PORT=3300 \
    HOST=0.0.0.0

COPY --from=builder --chown=ganipedia:ganipedia /app/dist ./dist
COPY --chown=ganipedia:ganipedia api ./api
COPY --chown=ganipedia:ganipedia server.js package.json ./

USER ganipedia

EXPOSE 3300

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3300/health >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
