pipeline {
    agent any
    
    environment {
        DOCKER_BUILDKIT = "1"  // Enable faster Docker builds
        DOCKER_REGISTRY = "localhost:5000"  // Consider changing if not using a local registry
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
        // Cache directories for faster builds
        DOCKER_ARGS = "--build-arg BUILDKIT_INLINE_CACHE=1"
    }
    
    triggers {
        githubPush()  // Explicit GitHub webhook trigger
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
        skipDefaultCheckout(true)  // We'll handle checkout ourselves
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Clean workspace before checkout for Windows
                cleanWs()
                
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [[$class: 'CleanBeforeCheckout']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/AnkitaKapoor980/Riskos.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }
        
        stage('Prepare Environment') {
            steps {
                script {
                    // List files in the root directory to debug
                    bat 'dir'
                    
                    // Create requirements.txt if missing
                    bat '''
                        IF NOT EXIST backend\\flask-api (
                            mkdir backend\\flask-api
                        )
                        
                        IF NOT EXIST backend\\flask-api\\requirements.txt (
                            echo Flask==2.2.3 > backend\\flask-api\\requirements.txt
                            echo pymongo==4.3.3 >> backend\\flask-api\\requirements.txt
                            echo flask-cors==3.0.10 >> backend\\flask-api\\requirements.txt
                            echo python-dotenv==1.0.0 >> backend\\flask-api\\requirements.txt
                            echo gunicorn==20.1.0 >> backend\\flask-api\\requirements.txt
                        )
                    '''
                    
                    // Create frontend directory if it doesn't exist
                    bat '''
                        IF NOT EXIST frontend (
                            mkdir frontend
                        )
                    '''
                    
                    // Copy nginx.conf from root to frontend directory if it exists
                    bat '''
                        IF EXIST nginx.conf (
                            copy nginx.conf frontend\\nginx.conf
                        ) ELSE IF EXIST nginx-config.config (
                            copy nginx-config.config frontend\\nginx.conf
                        ) ELSE (
                            echo server { > frontend\\nginx.conf
                            echo     listen 80; >> frontend\\nginx.conf
                            echo     server_name localhost; >> frontend\\nginx.conf
                            echo. >> frontend\\nginx.conf
                            echo     location / { >> frontend\\nginx.conf
                            echo         root /usr/share/nginx/html; >> frontend\\nginx.conf
                            echo         index index.html; >> frontend\\nginx.conf
                            echo         try_files $uri $uri/ /index.html; >> frontend\\nginx.conf
                            echo     } >> frontend\\nginx.conf
                            echo. >> frontend\\nginx.conf
                            echo     location /api/ { >> frontend\\nginx.conf
                            echo         proxy_pass http://backend:5000/api/; >> frontend\\nginx.conf
                            echo         proxy_http_version 1.1; >> frontend\\nginx.conf
                            echo         proxy_set_header Upgrade $http_upgrade; >> frontend\\nginx.conf
                            echo         proxy_set_header Connection 'upgrade'; >> frontend\\nginx.conf
                            echo         proxy_set_header Host $host; >> frontend\\nginx.conf
                            echo         proxy_cache_bypass $http_upgrade; >> frontend\\nginx.conf
                            echo     } >> frontend\\nginx.conf
                            echo } >> frontend\\nginx.conf
                        )
                    '''
                    
                    // Tag images with build number for better caching
                    env.IMAGE_TAG = "${BUILD_NUMBER}"
                    
                    // Check if Docker is running
                    bat 'docker info || (echo "Docker not running" && exit 1)'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend') {
                    steps {
                        script {
                            // Build backend image
                            bat """
                                docker build %DOCKER_ARGS% -t %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f backend.Dockerfile .
                            """
                            
                            // Push images to registry
                            bat """
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% || echo "Failed to push but continuing"
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-backend:latest || echo "Failed to push but continuing"
                            """
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        script {
                            // Build frontend image
                            bat """
                                docker build %DOCKER_ARGS% -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f frontend.Dockerfile .
                            """
                            
                            // Push images to registry
                            bat """
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% || echo "Failed to push but continuing"
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest || echo "Failed to push but continuing"
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Create a temporary docker-compose file with correct values
                    bat '''
                        echo version: '3.8' > docker-compose-temp.yml
                        echo. >> docker-compose-temp.yml
                        echo services: >> docker-compose-temp.yml
                        echo   backend: >> docker-compose-temp.yml
                        echo     image: %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% >> docker-compose-temp.yml
                        echo     ports: >> docker-compose-temp.yml
                        echo       - "5002:5000" >> docker-compose-temp.yml
                        echo       - "5003:5001" >> docker-compose-temp.yml
                        echo     environment: >> docker-compose-temp.yml
                        echo       - NODE_ENV=production >> docker-compose-temp.yml
                        echo       - MONGO_URI=%MONGO_URI% >> docker-compose-temp.yml
                        echo     restart: unless-stopped >> docker-compose-temp.yml
                        echo     networks: >> docker-compose-temp.yml
                        echo       - riskos-network >> docker-compose-temp.yml
                        echo. >> docker-compose-temp.yml
                        echo   frontend: >> docker-compose-temp.yml
                        echo     image: %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% >> docker-compose-temp.yml
                        echo     ports: >> docker-compose-temp.yml
                        echo       - "80:80" >> docker-compose-temp.yml
                        echo     depends_on: >> docker-compose-temp.yml
                        echo       - backend >> docker-compose-temp.yml
                        echo     restart: unless-stopped >> docker-compose-temp.yml
                        echo     networks: >> docker-compose-temp.yml
                        echo       - riskos-network >> docker-compose-temp.yml
                        echo. >> docker-compose-temp.yml
                        echo networks: >> docker-compose-temp.yml
                        echo   riskos-network: >> docker-compose-temp.yml
                        echo     driver: bridge >> docker-compose-temp.yml
                    '''
                    
                    // Deploy using the temporary file
                    bat '''
                        docker-compose -f docker-compose-temp.yml down || echo "No containers to stop"
                        docker-compose -f docker-compose-temp.yml up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Prune only dangling images to avoid removing cached layers
                bat "docker image prune -f"
                
                // Clean up temporary files
                bat "if exist docker-compose-temp.yml del docker-compose-temp.yml"
            }
            cleanWs()
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}