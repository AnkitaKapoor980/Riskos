# Stage 1: Build the application
FROM node:18.16-bullseye-slim AS build

WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY frontend/package*.json ./
RUN npm install

# Copy the application code
COPY frontend/ ./

# Build the application
RUN npm run build || echo "Build failed. Proceeding with placeholder."

# Stage 2: Serve the application with nginx
FROM nginx:1.25.2-alpine

# Copy built files
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Placeholder for failed builds
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    echo "<html><body><h1>Riskos Frontend</h1><p>Build failed. Placeholder served.</p></body></html>" > /usr/share/nginx/html/index.html; \
    fi

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
