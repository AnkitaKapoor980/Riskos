pipeline {
    agent any
    
    environment {
        DOCKER_BUILDKIT = "1"  // Enable faster Docker builds
        DOCKER_REGISTRY = "localhost:5000"
        APP_NAME = "riskos"
        MONGO_URI = credentials('mongodb-uri')
    }
    
    triggers {
        pollSCM('H/2 * * * *')  // Poll every 2 minutes as fallback
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
                        url: 'https://github.com/AnkitaKapoor980/Riskos.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend') {
                    steps {
                        script {
                            bat """
                                docker build --pull -t %DOCKER_REGISTRY%/%APP_NAME%-backend:latest -f backend.Dockerfile .
                            """
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        script {
                            bat """
                                docker build --pull -t %DOCKER_REGISTRY%/%APP_NAME%-frontend:latest -f frontend.Dockerfile .
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
                        docker-compose down || echo "No containers to stop"
                        docker-compose up -d
                    """
                }
            }
        }
    }
    
    post {
        always {
            bat "docker system prune -f || echo \"Docker cleanup skipped\""
            cleanWs()
        }
    }
}