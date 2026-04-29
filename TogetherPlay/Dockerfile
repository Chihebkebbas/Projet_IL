# ─── Stage 1: Build the React frontend ───────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build


# ─── Stage 2: Production Node.js server ──────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY src/server ./src/server

# Copy built frontend from stage 1
COPY --from=build /app/dist ./dist

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the server port (default 3000, overridable via PORT env)
EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health 2>/dev/null || exit 1

CMD ["node", "src/server/index.js"]
