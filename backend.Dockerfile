FROM node:18-bullseye

WORKDIR /app

# Install Python and create a virtual environment
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create a virtual environment
RUN python3 -m venv /opt/venv
# Activate the virtual environment in all commands
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install Node.js dependencies
COPY backend/package*.json ./
RUN npm install

# Copy and install Python requirements in the virtual environment
COPY backend/flask-api/requirements.txt ./flask-api/
RUN pip install --no-cache-dir -r ./flask-api/requirements.txt

# Copy the rest of the backend code
COPY backend/ ./

# Expose ports for Node.js and Flask
EXPOSE 5000
EXPOSE 5001

# Start both servers (Node.js and Flask)
CMD ["sh", "-c", "python3 flask-api/app.py & npm start"]