pipeline {
    agent any

    environment {
        // Ensure Docker is in the PATH
        PATH = "C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"
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
                powershell '''
                try {
                    docker-compose down
                } catch {
                    Write-Host "No containers to stop or an error occurred. Continuing anyway..."
                }
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image without cache...'
                powershell 'docker-compose build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application using Docker Compose...'
                powershell 'docker-compose up -d'
            }
        }

        stage('Check Running Services') {
            steps {
                echo 'Checking status of running services...'
                powershell 'docker-compose ps'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above for details.'
        }
    }
}
