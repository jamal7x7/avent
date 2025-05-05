# syntax=docker/dockerfile:1

# ----------- Build arguments -----------
ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=10.4.1

# ----------- Base image -----------
FROM node:${NODE_VERSION} AS base
RUN --mount=type=cache,target=/root/.npm \
    npm install --global corepack@latest
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# ----------- Builder stage -----------
FROM base AS builder
WORKDIR /app

# Copy only package manager files first for better caching
COPY --link package.json pnpm-lock.yaml ./

# Set up pnpm cache
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV PNPM_STORE_DIR=/root/.pnpm-store

# Install dependencies (including dev dependencies for build)
RUN --mount=type=cache,target=${PNPM_STORE_DIR} \
    pnpm install --frozen-lockfile

# Copy the rest of the application source
COPY --link . .

# Remove any .env files that may have been copied (defense-in-depth)
RUN rm -f .env .env.* || true

# Build the Next.js app (outputs to .next)
RUN pnpm run build

# ----------- Production image -----------
FROM node:${NODE_VERSION}-slim AS final

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

WORKDIR /app

# Enable corepack and pnpm
RUN npm install --global corepack@latest && corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy only production dependencies and build output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Set environment
ENV NODE_ENV=production

# Expose Next.js default port
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "start"]
