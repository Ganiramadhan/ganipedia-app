pipeline {
    agent any

    environment {
        // Registry configuration
        REGISTRY = "registry.ganipedia.com"
        REGISTRY_CREDENTIALS_ID = "ganipedia-registry"

        // Remote production server
        PRODUCTION_SERVER = "43.133.144.126"
        PRODUCTION_SSH_PORT = "22"
        PRODUCTION_USER = "ganipedia"
        PRODUCTION_SSH_PASSWORD_CREDENTIALS_ID = "ganipedia-server-password"

        // Chatbot runtime secrets
        CLAUDE_API_KEY_CREDENTIALS_ID = "ganipedia-claude-api-key"
        CLAUDE_MODEL_CREDENTIALS_ID = "ganipedia-claude-model"

        // Application configuration
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
        timeout(time: 30, unit: 'MINUTES')
    }

    triggers {
        // Poll SCM every 2 minutes as fallback if webhook fails.
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            when {
                branch 'main'
            }
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }

        stage('Build Image') {
            when {
                branch 'main'
            }
            steps {
                echo "Building Docker image: ${IMAGE_FULL}:${IMAGE_TAG}"
                sh '''
                    set -euo pipefail
                    DOCKER_BUILDKIT=1 docker build \\
                        --tag "$IMAGE_FULL:$IMAGE_TAG" \\
                        --progress=plain \\
                        .
                '''
            }
        }

        stage('Push Image') {
            when {
                branch 'main'
            }
            steps {
                echo "Pushing Docker image to registry..."
                withCredentials([usernamePassword(
                    credentialsId: "${REGISTRY_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        set -euo pipefail
                        echo "$DOCKER_PASS" | docker login "$REGISTRY" -u "$DOCKER_USER" --password-stdin
                        docker push "$IMAGE_FULL:$IMAGE_TAG"
                        docker logout "$REGISTRY"
                    '''
                }
            }
        }

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying on ${PRODUCTION_USER}@${PRODUCTION_SERVER}..."
                withCredentials([
                    usernamePassword(
                        credentialsId: "${REGISTRY_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    ),
                    string(credentialsId: "${PRODUCTION_SSH_PASSWORD_CREDENTIALS_ID}", variable: 'SSH_PASS'),
                    string(credentialsId: "${CLAUDE_API_KEY_CREDENTIALS_ID}", variable: 'CLAUDE_API_KEY'),
                    string(credentialsId: "${CLAUDE_MODEL_CREDENTIALS_ID}", variable: 'CLAUDE_MODEL')
                ]) {
                    sh '''
                        set -euo pipefail
                        set +x

                        ASKPASS_FILE="$(mktemp)"
                        cleanup_local() {
                            rm -f "$ASKPASS_FILE"
                        }
                        trap cleanup_local EXIT

                        cat > "$ASKPASS_FILE" << 'ENDASKPASS'
#!/bin/sh
printf '%s\n' "$SSH_PASS"
ENDASKPASS
                        chmod 700 "$ASKPASS_FILE"
                        export SSH_ASKPASS="$ASKPASS_FILE"
                        export SSH_ASKPASS_REQUIRE=force
                        export DISPLAY=:0

                        ssh_remote() {
                            if command -v setsid >/dev/null 2>&1; then
                                setsid ssh \\
                                    -o StrictHostKeyChecking=no \\
                                    -o ConnectTimeout=30 \\
                                    -o BatchMode=no \\
                                    -p "$PRODUCTION_SSH_PORT" \\
                                    "$PRODUCTION_USER@$PRODUCTION_SERVER" "$@"
                            else
                                ssh \\
                                    -o StrictHostKeyChecking=no \\
                                    -o ConnectTimeout=30 \\
                                    -o BatchMode=no \\
                                    -p "$PRODUCTION_SSH_PORT" \\
                                    "$PRODUCTION_USER@$PRODUCTION_SERVER" "$@"
                            fi
                        }

                        REMOTE_ENV_FILE="/tmp/$CONTAINER_NAME.env.$BUILD_NUMBER"

                        {
                            printf 'NODE_ENV=production\n'
                            printf 'CLAUDE_API_KEY=%s\n' "$CLAUDE_API_KEY"
                            printf 'CLAUDE_MODEL=%s\n' "$CLAUDE_MODEL"
                        } | ssh_remote "umask 077; cat > '$REMOTE_ENV_FILE'"

                        echo "Authenticating remote Docker host to registry..."
                        printf '%s\n' "$DOCKER_PASS" | ssh_remote "docker login '$REGISTRY' -u '$DOCKER_USER' --password-stdin"

                        ssh_remote "
                            set -euo pipefail
                            trap 'rm -f \"$REMOTE_ENV_FILE\"' EXIT

                            echo 'Pulling $IMAGE_FULL:$IMAGE_TAG...'
                            docker pull '$IMAGE_FULL:$IMAGE_TAG'

                            echo 'Replacing container $CONTAINER_NAME...'
                            docker stop '$CONTAINER_NAME' >/dev/null 2>&1 || true
                            docker rm '$CONTAINER_NAME' >/dev/null 2>&1 || true

                            docker run -d \\
                                --name '$CONTAINER_NAME' \\
                                --restart unless-stopped \\
                                --env-file '$REMOTE_ENV_FILE' \\
                                -p '$APP_PORT:$CONTAINER_PORT' \\
                                '$IMAGE_FULL:$IMAGE_TAG'

                            docker logout '$REGISTRY' >/dev/null 2>&1 || true
                            docker image prune -f >/dev/null 2>&1 || true

                            echo 'Remote deployment completed'
                        "
                    '''
                }
            }
        }

        stage('Verify Production') {
            when {
                branch 'main'
            }
            steps {
                echo "Verifying container on ${PRODUCTION_SERVER}..."
                withCredentials([string(
                    credentialsId: "${PRODUCTION_SSH_PASSWORD_CREDENTIALS_ID}",
                    variable: 'SSH_PASS'
                )]) {
                    sh '''
                        set -euo pipefail
                        set +x

                        ASKPASS_FILE="$(mktemp)"
                        cleanup_local() {
                            rm -f "$ASKPASS_FILE"
                        }
                        trap cleanup_local EXIT

                        cat > "$ASKPASS_FILE" << 'ENDASKPASS'
#!/bin/sh
printf '%s\n' "$SSH_PASS"
ENDASKPASS
                        chmod 700 "$ASKPASS_FILE"
                        export SSH_ASKPASS="$ASKPASS_FILE"
                        export SSH_ASKPASS_REQUIRE=force
                        export DISPLAY=:0

                        if command -v setsid >/dev/null 2>&1; then
                            SSH_PREFIX="setsid ssh"
                        else
                            SSH_PREFIX="ssh"
                        fi

                        $SSH_PREFIX \\
                            -o StrictHostKeyChecking=no \\
                            -o ConnectTimeout=30 \\
                            -o BatchMode=no \\
                            -p "$PRODUCTION_SSH_PORT" \\
                            "$PRODUCTION_USER@$PRODUCTION_SERVER" "
                                set -euo pipefail

                                echo 'Waiting for $CONTAINER_NAME to start...'
                                sleep 8

                                if ! docker ps --filter 'name=^/$CONTAINER_NAME\\$' --format '{{.Names}}' | grep -q '^$CONTAINER_NAME\\$'; then
                                    echo 'ERROR: $CONTAINER_NAME is not running'
                                    docker logs --tail=100 '$CONTAINER_NAME' 2>&1 || true
                                    exit 1
                                fi

                                for i in \$(seq 1 5); do
                                    if docker exec '$CONTAINER_NAME' wget -qO- 'http://127.0.0.1:$CONTAINER_PORT/health' >/dev/null 2>&1; then
                                        echo 'Production health check passed'
                                        docker ps --filter 'name=^/$CONTAINER_NAME\\$'
                                        exit 0
                                    fi

                                    echo \"Health check attempt \$i failed; retrying...\"
                                    sleep 5
                                done

                                echo 'ERROR: Health check failed'
                                docker logs --tail=100 '$CONTAINER_NAME' 2>&1 || true
                                exit 1
                            "
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker logout "$REGISTRY" >/dev/null 2>&1 || true
                docker image prune -f >/dev/null 2>&1 || true
            '''
        }
        success {
            echo "Deployment successful"
            echo "Image: ${IMAGE_FULL}:${IMAGE_TAG}"
            echo "Remote: ${PRODUCTION_USER}@${PRODUCTION_SERVER}"
            echo "Container: ${CONTAINER_NAME}"
            echo "Port: ${APP_PORT} -> ${CONTAINER_PORT}"
        }
        failure {
            echo "Deployment failed. Check Jenkins logs for details."
        }
    }
}
