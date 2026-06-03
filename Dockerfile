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
# Stage 3: Runtime (nginx serving static assets)
# ----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Drop default config & copy our SPA-tuned config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets only (no source, no node_modules)
COPY --from=builder /app/dist /usr/share/nginx/html

# Smaller image: no extra packages. Use built-in wget for healthcheck.
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3001/health >/dev/null 2>&1 || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
