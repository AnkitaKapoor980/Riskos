# Stage 1: Builder with robust error handling
FROM node:18-bullseye-slim AS builder

# Set environment variables to skip interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Configure reliable package sources with retries
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list

# Install Python with minimal packages needed
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

# Copy package files first for better layer caching
COPY backend/package*.json ./

# Install Node.js dependencies with cache optimization
RUN npm ci --only=production --no-audit --progress=false --prefer-offline || \
    npm install --only=production --no-audit --progress=false && \
    npm cache clean --force

# Install Python dependencies
RUN pip install --no-cache-dir -r flask-api/requirements.txt || \
    (echo "Flask==2.2.3\npymongo==4.3.3" > flask-api/requirements.txt && \
     pip install --no-cache-dir -r flask-api/requirements.txt)

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

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5000/ || exit 1

CMD ["sh", "-c", "python3 flask-api/app.py & npm start"]