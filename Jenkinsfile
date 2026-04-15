pipeline {
    agent any
    stages {
        stage('Build Frontend') {

            environment {
        // This pulls the secret you just created into a variable
        VITE_API_URL = credentials('VITE_API_URL')
    }
            
            steps {
                sh "docker build --build-arg VITE_API_URL=${VITE_API_URL} -t men-frontend-builder ."
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
