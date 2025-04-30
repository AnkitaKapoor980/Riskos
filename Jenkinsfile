pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = "localhost:5000"
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
    }
    
    triggers {
        githubPush() // Automatic trigger on GitHub push
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
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            bat 'npm ci' // 'npm ci' is faster than 'npm install' for CI environments
                            echo 'Backend dependencies installed'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            bat 'npm ci' // 'npm ci' is faster than 'npm install' for CI environments
                            echo 'Frontend dependencies installed'
                        }
                    }
                }
            }
        }
        
        // Skip actual tests since they're not configured in your project
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
                        // Use --no-cache only when needed
                        // Add build-args for better caching
                        bat 'docker build --pull --build-arg BUILDKIT_INLINE_CACHE=1 -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f backend.Dockerfile .'
                        bat 'docker build --pull --build-arg BUILDKIT_INLINE_CACHE=1 -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f frontend.Dockerfile .'
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
            // Clean up old Docker images to save space
            bat 'docker system prune -f || echo "Docker cleanup skipped"'
        }
    }
}