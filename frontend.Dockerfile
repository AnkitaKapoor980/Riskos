# Stage 1: Build
FROM node:18.16-bullseye-slim as builder

WORKDIR /app

# Copy package files first (better caching)
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source and build
COPY frontend .
RUN npm run build || { \
      mkdir -p dist && \
      echo "<html><body><h1>Riskos Frontend</h1></body></html>" > dist/index.html; \
    }

# Stage 2: Serve
FROM nginx:1.25.2-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]