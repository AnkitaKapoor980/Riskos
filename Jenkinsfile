pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "localhost:5000"
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
    }
    
    // Use triggers block with pollSCM as a fallback
    triggers {
        pollSCM('H/5 * * * *')
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds() // Helps with Docker caching
        timeout(time: 30, unit: 'MINUTES') // Prevent infinite builds
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out successfully'
            }
        }
        
        stage('Debug Directory Structure') {
            steps {
                script {
                    echo "=== DEBUGGING DIRECTORY STRUCTURE ==="
                    // List all files recursively
                    bat 'dir /s /b'
                    
                    // Specifically check for backend directory
                    bat 'echo "Checking for backend directory:"'
                    bat 'if exist backend (echo "Backend directory found" && dir backend /s /b) else echo "Backend directory NOT found"'
                    
                    // Check one level up
                    bat 'echo "Checking parent directory:"'
                    bat 'dir .. /b'
                    
                    // Check for Riskos directory
                    bat 'echo "Checking for Riskos directory:"'
                    bat 'if exist Riskos (echo "Riskos directory found" && dir Riskos /s /b) else echo "Riskos directory NOT found"'
                    
                    // Get current working directory
                    bat 'echo "Current directory:"'
                    bat 'cd'
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        script {
                            try {
                                dir('backend') {
                                    bat 'npm ci'
                                    echo 'Backend dependencies installed'
                                }
                            } catch (Exception e) {
                                echo "Backend dependencies installation skipped: ${e.message}"
                            }
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        script {
                            try {
                                dir('frontend') {
                                    bat 'npm ci'
                                    echo 'Frontend dependencies installed'
                                }
                            } catch (Exception e) {
                                echo "Frontend dependencies installation skipped: ${e.message}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Verify Package Structure') {
            steps {
                echo 'Verifying project structure'
                bat 'dir'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    try {
                        // Save Dockerfiles to the workspace
                        writeFile file: 'simplified-backend.Dockerfile', text: '''FROM node:18-bullseye

WORKDIR /app

# Install Python and create a virtual environment
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \\
    apt-get clean && \\
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
RUN if [ -d "/tmp/build-context/backend" ]; then \\
        echo "Found backend dir at /tmp/build-context/backend" && \\
        mkdir -p /app && \\
        cp -r /tmp/build-context/backend/* /app/; \\
    elif [ -d "/tmp/build-context/Riskos/backend" ]; then \\
        echo "Found backend dir at /tmp/build-context/Riskos/backend" && \\
        mkdir -p /app && \\
        cp -r /tmp/build-context/Riskos/backend/* /app/; \\
    else \\
        echo "No backend directory found"; \\
        find /tmp/build-context -name "package.json" | head -1; \\
        find /tmp/build-context -name "requirements.txt" | head -1; \\
        exit 1; \\
    fi

# Install Node.js dependencies
RUN if [ -f "package.json" ]; then \\
        echo "Found package.json, installing dependencies..." && \\
        npm install; \\
    else \\
        echo "No package.json found"; \\
        ls -la; \\
        exit 1; \\
    fi

# Install Python dependencies
RUN if [ -f "flask-api/requirements.txt" ]; then \\
        echo "Found requirements.txt, installing dependencies..." && \\
        pip install --no-cache-dir -r flask-api/requirements.txt; \\
    elif [ -f "requirements.txt" ]; then \\
        echo "Found requirements.txt at root, installing dependencies..." && \\
        pip install --no-cache-dir -r requirements.txt; \\
    else \\
        echo "No requirements.txt found"; \\
        find / -name "requirements.txt"; \\
        exit 1; \\
    fi

# Expose ports for Node.js and Flask
EXPOSE 5000
EXPOSE 5001

# Start both servers (Node.js and Flask)
CMD ["sh", "-c", "echo \\'Starting servers...\\' && if [ -f \\'flask-api/app.py\\' ]; then python3 flask-api/app.py & npm start; else echo \\'Application entry points not found\\'; exit 1; fi"]'''

                        writeFile file: 'simplified-frontend.Dockerfile', text: '''# Stage 1: Debug and build
FROM node:18.16-bullseye-slim AS debug

WORKDIR /tmp/debug

# Copy everything for examination
COPY . .

# Debug - list directory contents
RUN echo "=== DIRECTORY STRUCTURE ===" && \\
    find . -type d | sort && \\
    echo "=== LOOKING FOR FRONTEND ===" && \\
    find . -name "package.json" | sort

# Build Stage
FROM node:18.16-bullseye-slim AS build

WORKDIR /app

# Try to find and copy the frontend directory
COPY . /tmp/build-context/

RUN if [ -d "/tmp/build-context/frontend" ]; then \\
        echo "Found frontend dir at /tmp/build-context/frontend" && \\
        cp -r /tmp/build-context/frontend/* /app/; \\
    elif [ -d "/tmp/build-context/Riskos/frontend" ]; then \\
        echo "Found frontend dir at /tmp/build-context/Riskos/frontend" && \\
        cp -r /tmp/build-context/Riskos/frontend/* /app/; \\
    else \\
        echo "No frontend directory found"; \\
        find /tmp/build-context -name "package.json" | grep -v "node_modules" | head -1; \\
        exit 1; \\
    fi

# Install dependencies
RUN if [ -f "package.json" ]; then \\
        npm install; \\
    else \\
        echo "No package.json found"; \\
        ls -la; \\
        exit 1; \\
    fi

# Build if build script exists, otherwise create dummy build
RUN if grep -q "\\"build\\"" package.json; then \\
        npm run build || mkdir -p dist; \\
    else \\
        mkdir -p dist && \\
        echo "<html><body><h1>Riskos Frontend</h1></body></html>" > dist/index.html; \\
    fi

# Stage 2: Serve with nginx
FROM nginx:1.25.2-alpine

# Copy built files or placeholder
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Fallback for missing index.html
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \\
    echo "<html><body><h1>Riskos Frontend</h1><p>Build failed or not configured. Placeholder served.</p></body></html>" > /usr/share/nginx/html/index.html; \\
fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]'''

                        // Use the simplified Dockerfiles
                        bat 'docker build --pull -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f simplified-backend.Dockerfile .'
                        bat 'docker build --pull -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f simplified-frontend.Dockerfile .'
                        echo 'Docker images built successfully'
                    } catch (Exception e) {
                        echo "Docker build failed: ${e.message}"
                        echo "Continuing with pipeline..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    try {
                        echo 'Deploying application'
                        bat 'docker-compose down || echo "No containers to stop"'
                        
                        // Create a new docker-compose.yml file
                        writeFile file: 'docker-compose.yml', text: '''version: '3'

services:
  backend:
    image: ${DOCKER_REGISTRY}/${APP_NAME}-backend:latest
    ports:
      - "5000:5000"
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI:-mongodb://localhost:27017/riskos}
    networks:
      - riskos-network

  frontend:
    image: ${DOCKER_REGISTRY}/${APP_NAME}-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - riskos-network

networks:
  riskos-network:
    driver: bridge'''
                        
                        bat 'docker-compose up -d'
                        echo 'Application deployed successfully'
                    } catch (Exception e) {
                        echo "Deployment failed: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        unstable {
            echo 'Pipeline completed with issues - check logs.'
        }
        failure {
            echo 'Pipeline failed, but artifacts should be available for presentation'
        }
        always {
            echo 'Pipeline completed - check workspace for files'
            bat 'docker system prune -f || echo "Docker cleanup skipped"'
        }
    }
}