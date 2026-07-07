pipeline {
    agent any

    environment {
        REGISTRY = "registry.ganipedia.com"
        REGISTRY_CREDENTIALS_ID = "ganipedia-registry"
        CLAUDE_API_KEY_CREDENTIALS_ID = "ganipedia-claude-api-key"
        CLAUDE_MODEL_CREDENTIALS_ID = "ganipedia-claude-model"
        
        // Application Configuration 
        IMAGE_NAME = "ganipedia-app"
        CONTAINER_NAME = "ganipedia-app"
        APP_PORT = "3300"
        CONTAINER_PORT = "3300"
        
        // Computed values
        IMAGE_FULL = "${REGISTRY}/${IMAGE_NAME}"
        IMAGE_TAG = "latest"
    }

    options {
        disableConcurrentBuilds()
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        // Poll SCM every 2 minutes as fallback (H/2 * * * *)
        // This is backup if webhook fails
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            when {
                branch 'main'
            }
            steps {
                echo "🔄 Checking out code..."
                checkout scm
            }
        }

        stage('Build') {
            when {
                branch 'main'
            }
            steps {
                echo "🔨 Building Docker image..."
                echo "Image: ${IMAGE_FULL}:${IMAGE_TAG}"
                sh """
                    docker build -t ${IMAGE_FULL}:${IMAGE_TAG} .
                """
            }
        }

        stage('Push') {
            when {
                branch 'main'
            }
            steps {
                echo "📦 Pushing to registry..."
                withCredentials([
                    usernamePassword(
                        credentialsId: "${REGISTRY_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    ),
                    string(credentialsId: "${CLAUDE_API_KEY_CREDENTIALS_ID}", variable: 'CLAUDE_API_KEY'),
                    string(credentialsId: "${CLAUDE_MODEL_CREDENTIALS_ID}", variable: 'CLAUDE_MODEL')
                ]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login ${REGISTRY} -u "\$DOCKER_USER" --password-stdin
                        
                        docker push ${IMAGE_FULL}:${IMAGE_TAG}
                        
                        docker logout ${REGISTRY}
                    """
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Deploying application..."
                withCredentials([usernamePassword(
                    credentialsId: "${REGISTRY_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login ${REGISTRY} -u "\$DOCKER_USER" --password-stdin
                        
                        # Pull new image before stopping the running container
                        docker pull ${IMAGE_FULL}:${IMAGE_TAG}
                        
                        # Stop and remove old container
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                        
                        # Run new container
                        docker run -d \\
                            --name ${CONTAINER_NAME} \\
                            --restart unless-stopped \\
                            -e NODE_ENV=production \\
                            -e CLAUDE_API_KEY \\
                            -e CLAUDE_MODEL \\
                            -p ${APP_PORT}:${CONTAINER_PORT} \\
                            ${IMAGE_FULL}:${IMAGE_TAG}
                        
                        docker logout ${REGISTRY}
                    """
                }
            }
        }

        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo "🏥 Performing health check..."
                sh """
                    sleep 5
                    
                    if docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}\$"; then
                        echo "✅ Container is running"
                        docker ps --filter "name=${CONTAINER_NAME}"
                        exit 0
                    else
                        echo "❌ Container failed to start"
                        docker logs ${CONTAINER_NAME} || true
                        exit 1
                    fi
                """
            }
        }

        stage('Cleanup') {
            when {
                branch 'main'
            }
            steps {
                echo "🧹 Cleaning up..."
                sh """
                    # Remove dangling images
                    docker image prune -f
                """
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "📦 Image: ${IMAGE_FULL}:${IMAGE_TAG}"
            echo "🐳 Container: ${CONTAINER_NAME}"
            echo "🔗 Port: ${APP_PORT} → ${CONTAINER_PORT}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        }
        failure {
            echo "❌ Deployment failed!"
            echo "Check logs above for details"
        }
        always {
            echo ""
            echo "📊 Build Summary"
            echo "  Project: ${IMAGE_NAME}"
            echo "  Branch: ${env.BRANCH_NAME}"
            echo "  Build: #${env.BUILD_NUMBER}"
            echo "  Image: ${IMAGE_FULL}:${IMAGE_TAG}"
        }
    }
}
