# Use official Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .

# Upgrade pip first to avoid hash/checksum issues
RUN pip install --upgrade pip

# Install packages without cache
RUN pip install --default-timeout=10000 --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose flask port inside container
EXPOSE 5002

# Command to run app
CMD ["python", "app.py"]