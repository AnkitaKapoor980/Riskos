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
                    
                    // Ensure nginx.conf exists
                    bat '''
                        IF NOT EXIST frontend\\nginx.conf (
                            copy nginx-config.config frontend\\nginx.conf
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
                            // Use cache-from for better caching
                            bat """
                                docker build %DOCKER_ARGS% --cache-from %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -t %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG% -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f backend.Dockerfile .
                            """
                            
                            // Push images to registry
                            bat """
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-backend:%IMAGE_TAG%
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-backend:latest
                            """
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        script {
                            bat """
                                docker build %DOCKER_ARGS% --cache-from %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG% -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f frontend.Dockerfile .
                            """
                            
                            // Push images to registry
                            bat """
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-frontend:%IMAGE_TAG%
                                docker push %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Export environment variables for docker-compose
                    bat """
                        set DOCKER_REGISTRY=%DOCKER_REGISTRY%
                        set APP_NAME=%APP_NAME%
                        set IMAGE_TAG=%IMAGE_TAG%
                        set MONGO_URI=%MONGO_URI%
                        docker-compose down || echo "No containers to stop"
                        docker-compose up -d
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Prune only dangling images to avoid removing cached layers
                bat "docker image prune -f"
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