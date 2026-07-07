pipeline {
    agent any

    environment {
        REGISTRY = "registry.ganipedia.com"
        REGISTRY_CREDENTIALS_ID = "ganipedia-registry"
        
        // Application Configuration 
        IMAGE_NAME = "ganipedia-app"
        CONTAINER_NAME = "ganipedia-app"
        APP_PORT = "3300"
        CONTAINER_PORT = "3300"
        
        // Computed values
        IMAGE_FULL = "${REGISTRY}/${IMAGE_NAME}"
        NEW_VERSION = ""
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
        stage('Prepare') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🔍 Detecting current version..."
                    
                    // Get current running container image tag (not SHA)
                    def containerImage = ""
                    try {
                        containerImage = sh(
                            script: "docker inspect ${CONTAINER_NAME} --format='{{.Config.Image}}' 2>/dev/null | awk -F: '{print \$NF}' || echo ''",
                            returnStdout: true
                        ).trim()
                    } catch (Exception e) {
                        echo "⚠️ No container found: ${e.message}"
                    }
                    
                    echo "📦 Detected image tag: '${containerImage}'"
                    
                    // Default version starts at 1.0.0
                    def major = 1
                    def minor = 0  
                    def patch = 0
                    
                    // Try to parse existing version
                    if (containerImage && containerImage != "" && containerImage != "null" && containerImage != "latest" && containerImage.startsWith('v')) {
                        try {
                            def versionString = containerImage.replaceAll('v', '')
                            def versionParts = versionString.split('\\.')
                            
                            if (versionParts.length == 3) {
                                major = Integer.parseInt(versionParts[0])
                                minor = Integer.parseInt(versionParts[1])
                                patch = Integer.parseInt(versionParts[2])
                                echo "📌 Current version: v${major}.${minor}.${patch}"
                            }
                        } catch (Exception e) {
                            echo "⚠️ Parse error: ${e.message}, using default"
                        }
                    } else {
                        echo "🆕 No valid version, starting from v3.0.0"
                    }
                    
                    // Increment version with logic: patch 0-10, then increment minor
                    patch = patch + 1
                    if (patch > 10) {
                        patch = 0
                        minor = minor + 1
                    }
                    if (minor > 10) {
                        minor = 0
                        major = major + 1
                    }
                    
                    // CRITICAL: Direct string assignment without intermediate variable
                    NEW_VERSION = "v${major}.${minor}.${patch}"
                    
                    echo "✨ New version: ${NEW_VERSION}"
                }
            }
        }

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
                echo "Image: ${IMAGE_FULL}:${NEW_VERSION}"
                sh """
                    docker build -t ${IMAGE_FULL}:${NEW_VERSION} .
                """
            }
        }

        stage('Push') {
            when {
                branch 'main'
            }
            steps {
                echo "📦 Pushing to registry..."
                withCredentials([usernamePassword(
                    credentialsId: "${REGISTRY_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login ${REGISTRY} -u "\$DOCKER_USER" --password-stdin
                        
                        docker push ${IMAGE_FULL}:${NEW_VERSION}
                        
                        docker tag ${IMAGE_FULL}:${NEW_VERSION} ${IMAGE_FULL}:latest
                        docker push ${IMAGE_FULL}:latest
                        
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
                sh """
                    # Stop and remove old container
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    
                    # Pull new image
                    docker pull ${IMAGE_FULL}:${NEW_VERSION}
                    
                    # Run new container
                    docker run -d \\
                        --name ${CONTAINER_NAME} \\
                        --restart unless-stopped \\
                        -p ${APP_PORT}:${CONTAINER_PORT} \\
                        ${IMAGE_FULL}:${NEW_VERSION}
                """
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
                    
                    # Keep only last 3 versions (excluding latest and current)
                    docker images ${IMAGE_FULL} --format "{{.ID}} {{.Tag}}" | \\
                    grep -v "latest" | \\
                    grep -v "${NEW_VERSION}" | \\
                    tail -n +4 | \\
                    awk '{print \$1}' | \\
                    xargs -r docker rmi -f || true
                """
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "📦 Image: ${IMAGE_FULL}:${NEW_VERSION}"
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
            echo "  Version: ${NEW_VERSION}"
        }
    }
}
