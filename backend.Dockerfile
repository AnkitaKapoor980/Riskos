# Stage 1: Build Node.js dependencies
FROM node:18-bullseye-slim AS node-builder

WORKDIR /app

# Copy only package files first for better caching
# Changed path to reflect the actual location of the files in the build context
COPY ./backend/package*.json ./
RUN npm ci

# Stage 2: Build Python dependencies
FROM python:3.9-slim AS python-builder

WORKDIR /app

# Copy only Python requirements
# Changed path to reflect the actual location of the files in the build context
COPY ./backend/flask-api/requirements.txt ./flask-api/
RUN pip install --no-cache-dir -r ./flask-api/requirements.txt --target /python-deps

# Stage 3: Final image
FROM node:18-bullseye-slim

WORKDIR /app

# Install Python
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy Node.js dependencies
COPY --from=node-builder /app/node_modules ./node_modules

# Copy Python dependencies
COPY --from=python-builder /python-deps /usr/local/lib/python3.9/site-packages/

# Now copy the application code
# Changed path to reflect the actual location of the files in the build context
COPY ./backend/ ./

# Expose ports for Node.js and Flask
EXPOSE 5000
EXPOSE 5001

# Start both servers
CMD ["sh", "-c", "python3 flask-api/app.py & npm start"]