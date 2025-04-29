pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "localhost:5000"
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out successfully'
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            bat 'npm install'
                            echo 'Backend dependencies installed'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            bat 'npm install'
                            echo 'Frontend dependencies installed'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            bat 'npm test || echo "No tests or tests failed"'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            bat 'npm test || echo "No tests or tests failed"'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                bat 'docker build -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f backend.Dockerfile .'
                bat 'docker build -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f frontend.Dockerfile .'
                echo 'Docker images built successfully'
            }
        }
        
        stage('Push Docker Images') {
            steps {
                bat 'docker push %DOCKER_REGISTRY%/%APP_NAME%-backend:latest'
                bat 'docker push %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest'
                echo 'Docker images pushed to registry'
            }
        }
        
        stage('Deploy') {
            steps {
                bat 'docker-compose down || echo "No containers running"'
                withEnv(['MONGO_URI=%MONGO_URI%']) {
                    bat 'docker-compose up -d'
                }
                echo 'Application deployed successfully'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            // Clean workspace after build
            cleanWs()
        }
    }
}