FROM node:18 AS node-base
WORKDIR /app

# Install Python for the Flask API
FROM node-base AS backend
RUN apt-get update && apt-get install -y python3 python3-pip

# Copy and install Node.js dependencies
COPY backend/package*.json ./
RUN npm install

# Copy and install Python requirements
COPY backend/flask-api/requirements.txt ./flask-api/
RUN pip3 install -r ./flask-api/requirements.txt

# Copy the rest of the backend code
COPY backend/ ./

# Expose ports for Node.js and Flask
EXPOSE 5000
EXPOSE 5001

# Start both servers (Node.js and Flask)
CMD ["sh", "-c", "python3 flask-api/app.py & npm start"]