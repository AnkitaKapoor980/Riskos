# Stage 1: Builder with fixed package sources
FROM node:18-bullseye-slim as builder

# Configure proper package sources first
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list

# Install Python and create virtual env
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /opt/venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/venv/bin:$PATH"

# Copy only dependency files first (better caching)
COPY backend/package*.json ./
COPY backend/flask-api/ ./flask-api/

# Install dependencies
RUN npm ci --only=production && \
    [ -f "flask-api/requirements.txt" ] && \
    pip install --no-cache-dir -r flask-api/requirements.txt || \
    echo "No requirements.txt found"

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