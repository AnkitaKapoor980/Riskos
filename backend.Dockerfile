FROM node:18-bullseye

WORKDIR /app

# Install Python and create a virtual environment
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a virtual environment
RUN python3 -m venv /opt/venv
# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Copy the entire context first - we'll figure out the structure later
COPY . /tmp/build-context/

# Debug - list files to see what we have
RUN ls -la /tmp/build-context/
RUN find /tmp/build-context/ -type d | sort

# Now try to find and copy package.json files
RUN if [ -d "/tmp/build-context/backend" ]; then \
        echo "Found backend dir at /tmp/build-context/backend" && \
        mkdir -p /app && \
        cp -r /tmp/build-context/backend/* /app/; \
    elif [ -d "/tmp/build-context/Riskos/backend" ]; then \
        echo "Found backend dir at /tmp/build-context/Riskos/backend" && \
        mkdir -p /app && \
        cp -r /tmp/build-context/Riskos/backend/* /app/; \
    else \
        echo "No backend directory found"; \
        find /tmp/build-context -name "package.json" | head -1; \
        find /tmp/build-context -name "requirements.txt" | head -1; \
        exit 1; \
    fi

# Install Node.js dependencies
RUN if [ -f "package.json" ]; then \
        echo "Found package.json, installing dependencies..." && \
        npm install; \
    else \
        echo "No package.json found"; \
        ls -la; \
        exit 1; \
    fi

# Install Python dependencies
RUN if [ -f "flask-api/requirements.txt" ]; then \
        echo "Found requirements.txt, installing dependencies..." && \
        pip install --no-cache-dir -r flask-api/requirements.txt; \
    elif [ -f "requirements.txt" ]; then \
        echo "Found requirements.txt at root, installing dependencies..." && \
        pip install --no-cache-dir -r requirements.txt; \
    else \
        echo "No requirements.txt found"; \
        find / -name "requirements.txt"; \
        exit 1; \
    fi

# Expose ports for Node.js and Flask
EXPOSE 5000
EXPOSE 5001

# Start both servers (Node.js and Flask)
CMD ["sh", "-c", "echo 'Starting servers...' && if [ -f 'flask-api/app.py' ]; then python3 flask-api/app.py & npm start; else echo 'Application entry points not found'; exit 1; fi"]