# Stage 1: Builder with robust error handling
FROM node:18-bullseye-slim AS builder

# Configure reliable package sources with retries
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list

# Install Python with retries and progress
RUN apt-get update -o Acquire::Retries=3 && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv && \
    python3 -m venv /opt/venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app

# Copy package files first
COPY backend/package*.json ./

# Install Node.js dependencies with fallback
RUN npm ci --only=production --no-audit --progress=false || \
    { echo "Fallback to npm install" && npm install --only=production; } && \
    npm cache clean --force

# Conditional Python dependencies (handles missing requirements.txt)
COPY backend/flask-api/ ./flask-api/
RUN if [ -f "flask-api/requirements.txt" ]; then \
        pip install --no-cache-dir -r flask-api/requirements.txt; \
    else \
        echo "No requirements.txt found - skipping Python dependencies"; \
    fi

# Stage 2: Final image
FROM node:18-bullseye-slim
WORKDIR /app

# Copy installed dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY backend .

ENV PATH="/opt/venv/bin:$PATH"
EXPOSE 5000 5001

CMD ["sh", "-c", "python3 flask-api/app.py & npm start"]