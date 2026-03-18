# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Dependencies
# Install node_modules in a separate layer so they are cached by Docker
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Builder
# Compile TypeScript + bundle with Vite
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run linting & tests before the production build so a broken build never ships
RUN npm run lint --if-present
RUN npm run test:run --if-present

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Production image
# Serve static assets via nginx (tiny, read-only filesystem)
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

LABEL maintainer="OddsUp.io Platform Team"
LABEL org.opencontainers.image.title="AI Campus Portal"
LABEL org.opencontainers.image.description="Home Campus AI Assignment — Student Management Portal"

# Remove the default nginx configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx runs on port 80 inside the container
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
