pipeline {
    agent any
    
    environment {
        DOCKER_BUILDKIT = "1"  // Enable faster Docker builds
        DOCKER_REGISTRY = "localhost:5000"
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
    }
    
    triggers {
        githubPush()  // Trigger on GitHub commits via smee.io
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [[
                        $class: 'CleanBeforeCheckout',
                        deleteUntrackedNestedRepositories: true
                    ]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/AnkitaKapoor980/Riskos.git'
                    ]]
                ])
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend') {
                    steps {
                        script {
                            docker.build("${DOCKER_REGISTRY}/${APP_NAME}-backend:latest", 
                                       "-f backend.Dockerfile .")
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        script {
                            docker.build("${DOCKER_REGISTRY}/${APP_NAME}-frontend:latest", 
                                       "-f frontend.Dockerfile .")
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d'
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
            cleanWs()
        }
    }
}