pipeline {
    agent any
    stages {
        stage('Build Frontend') {
            steps {
                sh 'docker build -t men-frontend-builder .'
            }
        }
        stage('Extract to Nginx Path') {
            steps {
                // 1. Create a temp container
                sh 'docker create --name temp-frontend men-frontend-builder'
                // 2. Clear old files in your Nginx root
                sh 'rm -rf /home/ubuntu/men-app-frontend/dist/*'
                // 3. Copy new files from container to EC2 folder
                sh 'docker cp temp-frontend:/app/dist/. /home/ubuntu/men-app-frontend/dist/'
                // 4. Cleanup temp container
                sh 'docker rm temp-frontend'
            }
        }
    }
}