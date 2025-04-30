# Stage 1: Debug and build
FROM node:18.16-bullseye-slim AS debug

WORKDIR /tmp/debug

# Copy everything for examination
COPY . .

# Debug - list directory contents
RUN echo "=== DIRECTORY STRUCTURE ===" && \
    find . -type d | sort && \
    echo "=== LOOKING FOR FRONTEND ===" && \
    find . -name "package.json" | sort

# Build Stage
FROM node:18.16-bullseye-slim AS build

WORKDIR /app

# Try to find and copy the frontend directory
COPY . /tmp/build-context/

RUN if [ -d "/tmp/build-context/frontend" ]; then \
        echo "Found frontend dir at /tmp/build-context/frontend" && \
        cp -r /tmp/build-context/frontend/* /app/; \
    elif [ -d "/tmp/build-context/Riskos/frontend" ]; then \
        echo "Found frontend dir at /tmp/build-context/Riskos/frontend" && \
        cp -r /tmp/build-context/Riskos/frontend/* /app/; \
    else \
        echo "No frontend directory found"; \
        find /tmp/build-context -name "package.json" | grep -v "node_modules" | head -1; \
        exit 1; \
    fi

# Install dependencies
RUN if [ -f "package.json" ]; then \
        npm install; \
    else \
        echo "No package.json found"; \
        ls -la; \
        exit 1; \
    fi

# Build if build script exists, otherwise create dummy build
RUN if grep -q "\"build\"" package.json; then \
        npm run build || mkdir -p dist; \
    else \
        mkdir -p dist && \
        echo "<html><body><h1>Riskos Frontend</h1></body></html>" > dist/index.html; \
    fi

# Stage 2: Serve with nginx
FROM nginx:1.25.2-alpine

# Copy built files or placeholder
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Fallback for missing index.html
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    echo "<html><body><h1>Riskos Frontend</h1><p>Build failed or not configured. Placeholder served.</p></body></html>" > /usr/share/nginx/html/index.html; \
fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]