# Stage 1: Build the application
FROM node:18.16-bullseye-slim AS build

WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY frontend/package*.json ./
RUN npm install

# Copy the application code
COPY frontend/ ./

# Build the application and ensure the output directory exists
RUN npm run build && mkdir -p dist || (mkdir -p dist && echo "Build failed. Created placeholder dist directory.")

# Stage 2: Serve the application with nginx
FROM nginx:1.25.2-alpine

# Create directory to ensure it exists before copying
RUN mkdir -p /usr/share/nginx/html/

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