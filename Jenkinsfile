pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USERNAME       = 'franciscovelhinho99'
        IMAGE_BACKEND            = "${DOCKERHUB_USERNAME}/seriesapp-backend"
        IMAGE_FRONTEND           = "${DOCKERHUB_USERNAME}/seriesapp-frontend"
        EMAIL_RECIPIENT          = 'kikonunes.2004@hotmail.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    def backendImage = docker.build(
                        "${IMAGE_BACKEND}:${BUILD_NUMBER}",
                        "-f Dockerfile ."
                    )
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    def frontendImage = docker.build(
                        "${IMAGE_FRONTEND}:${BUILD_NUMBER}",
                        "--build-arg VITE_API_BASE_URL=http://SEU_SERVIDOR_IP:8000/api/v1 -f frontend/Dockerfile ./frontend"
                    )
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKERHUB_CREDENTIALS_ID) {
                        def backendImage = docker.image("${IMAGE_BACKEND}:${BUILD_NUMBER}")
                        def frontendImage = docker.image("${IMAGE_FRONTEND}:${BUILD_NUMBER}")

                        backendImage.push("${BUILD_NUMBER}")
                        backendImage.push('latest')
                        frontendImage.push("${BUILD_NUMBER}")
                        frontendImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                pip install ansible
            
                sh "ansible-playbook -i ansible/inventory ansible/playbook.yml --extra-vars 'image_tag=${BUILD_NUMBER}'"
            }
        }
    }

    post {
        success {
            emailext(
                subject: "[SUCCESS] ${JOB_NAME} - Build #${BUILD_NUMBER}",
                body: """
                    <h2>Pipeline concluido com sucesso!</h2>
                    <p><b>Job:</b> ${JOB_NAME}</p>
                    <p><b>Build:</b> #${BUILD_NUMBER}</p>
                    <p><b>Imagens publicadas no Docker Hub:</b></p>
                    <ul>
                        <li>${IMAGE_BACKEND}:${BUILD_NUMBER}</li>
                        <li>${IMAGE_FRONTEND}:${BUILD_NUMBER}</li>
                    </ul>
                    <p><a href="${BUILD_URL}">Ver build no Jenkins</a></p>
                """,
                mimeType: 'text/html',
                to: "${EMAIL_RECIPIENT}"
            )
        }
        failure {
            emailext(
                subject: "[FAILED] ${JOB_NAME} - Build #${BUILD_NUMBER}",
                body: """
                    <h2>O pipeline falhou!</h2>
                    <p><b>Job:</b> ${JOB_NAME}</p>
                    <p><b>Build:</b> #${BUILD_NUMBER}</p>
                    <p>Verifica os logs para mais detalhes.</p>
                    <p><a href="${BUILD_URL}console">Ver logs no Jenkins</a></p>
                """,
                mimeType: 'text/html',
                to: "${EMAIL_RECIPIENT}"
            )
        }
    }
}
