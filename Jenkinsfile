pipeline {
    agent any

    environment {
        // Add Docker to system path
        PATH = "C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning the repository...'
                git branch: 'pipe', url: 'https://github.com/AnkitaKapoor980/Riskos.git'
            }
        }

        stage('Stop Previous Containers') {
            steps {
                echo 'Stopping any previously running containers...'
                bat '''
                    docker-compose down
                    if %ERRORLEVEL% NEQ 0 exit /b 0
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image without cache...'
                bat 'docker-compose build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application using Docker Compose...'
                bat 'docker-compose up -d'
            }
        }

        stage('Check Running Services') {
            steps {
                echo 'Checking status of running services...'
                bat 'docker-compose ps'
            }
        }
    }

    post {
        success {
            echo ' Pipeline completed successfully.'
        }
        failure {
            echo ' Pipeline failed. Check the logs above for details.'
        }
    }
}