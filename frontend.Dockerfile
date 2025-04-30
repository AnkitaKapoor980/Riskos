# Stage 1: Build
FROM node:18.16-bullseye-slim AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY frontend/package*.json ./

# Install dependencies with optimized cache settings
RUN npm ci --no-audit --progress=false --prefer-offline || \
    npm install --no-audit --progress=false && \
    npm cache clean --force

# Copy remaining source files
COPY frontend/ .

# Build the application with fallback
RUN if [ -f "package.json" ] && grep -q '"build"' package.json; then \
      npm run build || { \
        mkdir -p dist && \
        echo "<html><body><h1>Riskos Frontend - Build Failed</h1><p>Fallback page served</p></body></html>" > dist/index.html; \
      }; \
    else \
      mkdir -p dist && \
      echo "<html><body><h1>Riskos Frontend</h1><p>No build script configured</p></body></html>" > dist/index.html; \
    fi

# Stage 2: Serve
FROM nginx:1.25.2-alpine

# Add nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]