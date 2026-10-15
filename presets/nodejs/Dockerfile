# Multi-stage hardened Dockerfile for Node.js / TypeScript
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN if [ -f "tsconfig.json" ]; then npm run build --if-present; fi

# Stage 2: Hardened Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8000

# Security: Dedicated unprivileged non-root user (UID 10001)
RUN addgroup -g 10001 appgroup && \
    adduser -u 10001 -G appgroup -s /sbin/nologin -D appuser

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist 2>/dev/null || true
COPY --from=builder --chown=appuser:appgroup /app/src ./src 2>/dev/null || true
COPY --from=builder --chown=appuser:appgroup /app/index.js ./index.js 2>/dev/null || true

USER appuser:appgroup

EXPOSE 8000

CMD ["node", "dist/index.js"]
