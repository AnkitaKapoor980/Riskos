FROM node:18-alpine

WORKDIR /app/backend

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend ./

# Expose the port your backend runs on
EXPOSE 5000

CMD ["node", "server.js"]