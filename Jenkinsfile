pipeline {
    agent any
    
    environment {
        DOCKER_BUILDKIT = "1"
        DOCKER_REGISTRY = "localhost:6000"
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
        DOCKER_ARGS = "--build-arg BUILDKIT_INLINE_CACHE=1"
    }
    
    triggers {
        pollSCM('H/5 * * * *')  // More reliable than githubPush()
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'RelativeTargetDirectory', relativeTargetDir: 'Riskos']
                    ],
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
                    // Backend setup
                    bat '''
                        cd Riskos
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
                    
                    // Frontend setup with proper nginx config handling
                    bat '''
                        cd Riskos
                        IF NOT EXIST frontend (
                            mkdir frontend
                        )
                        
                        IF EXIST "nginx-config.conf" (
                            copy nginx-config.conf frontend\\nginx.conf
                        ) ELSE (
                            echo Creating default nginx.conf...
                            echo server { > frontend\\nginx.conf
                            echo     listen 3000; >> frontend\\nginx.conf
                            echo     server_name localhost; >> frontend\\nginx.conf
                            echo. >> frontend\\nginx.conf
                            echo     location / { >> frontend\\nginx.conf
                            echo         root /usr/share/nginx/html; >> frontend\\nginx.conf
                            echo         index index.html; >> frontend\\nginx.conf
                            echo         try_files $uri $uri/ /index.html; >> frontend\\nginx.conf
                            echo     } >> frontend\\nginx.conf
                            echo. >> frontend\\nginx.conf
                            echo     location /api/ { >> frontend\\nginx.conf
                            echo         proxy_pass http://backend:5100/api/; >> frontend\\nginx.conf
                            echo         proxy_http_version 1.1; >> frontend\\nginx.conf
                            echo         proxy_set_header Upgrade $http_upgrade; >> frontend\\nginx.conf
                            echo         proxy_set_header Connection 'upgrade'; >> frontend\\nginx.conf
                            echo         proxy_set_header Host $host; >> frontend\\nginx.conf
                            echo         proxy_cache_bypass $http_upgrade; >> frontend\\nginx.conf
                            echo     } >> frontend\\nginx.conf
                            echo } >> frontend\\nginx.conf
                        )
                    '''
                    
                    env.IMAGE_TAG = "${BUILD_NUMBER}"
                    bat 'docker info || (echo "Docker not running" && exit 1)'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend') {
                    steps {
                        script {
                            bat """
                                cd Riskos
                                docker build %DOCKER_ARGS% -t %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f backend.Dockerfile .
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% || echo "Push failed but continuing"
                            """
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        script {
                            bat """
                                cd Riskos
                                docker build %DOCKER_ARGS% -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f frontend.Dockerfile .
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% || echo "Push failed but continuing"
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    bat """
                        cd Riskos
                        echo version: '3.8' > docker-compose-temp.yml
                        echo. >> docker-compose-temp.yml
                        echo services: >> docker-compose-temp.yml
                        echo   backend: >> docker-compose-temp.yml
                        echo     image: %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% >> docker-compose-temp.yml
                        echo     ports: >> docker-compose-temp.yml
                        echo       - "5100:5000" >> docker-compose-temp.yml
                        echo       - "5101:5001" >> docker-compose-temp.yml
                        echo     environment: >> docker-compose-temp.yml
                        echo       - NODE_ENV=production >> docker-compose-temp.yml
                        echo       - MONGO_URI=%MONGO_URI% >> docker-compose-temp.yml
                        echo     restart: unless-stopped >> docker-compose-temp.yml
                        echo. >> docker-compose-temp.yml
                        echo   frontend: >> docker-compose-temp.yml
                        echo     image: %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% >> docker-compose-temp.yml
                        echo     ports: >> docker-compose-temp.yml
                        echo       - "3000:80" >> docker-compose-temp.yml
                        echo     restart: unless-stopped >> docker-compose-temp.yml
                        
                        docker-compose -f docker-compose-temp.yml down || echo "Cleanup failed"
                        docker-compose -f docker-compose-temp.yml up -d
                    """
                }
            }
        }
    }
    
    post {
        always {
            bat 'docker system prune -f'
            cleanWs()
        }
    }
}