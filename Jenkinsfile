pipeline {
    agent any

    environment {
        REGISTRY = "registry.ganipedia.com"
        REGISTRY_CREDENTIALS_ID = "ganipedia-registry"

        PRODUCTION_SERVER = "43.133.144.126"
        PRODUCTION_SSH_PORT = "22"
        PRODUCTION_USER = "ganipedia"
        PRODUCTION_SSH_PASSWORD_CREDENTIALS_ID = "ganipedia-server-password"

        CLAUDE_API_KEY_CREDENTIALS_ID = "ganipedia-claude-api-key"
        CLAUDE_MODEL_CREDENTIALS_ID = "ganipedia-claude-model"

        IMAGE_NAME = "ganipedia-app"
        CONTAINER_NAME = "ganipedia-app"
        APP_PORT = "3300"
        CONTAINER_PORT = "3300"
        HEALTH_PATH = "/health"

        DOCKER_BUILDKIT = "1"
        IMAGE_REPO = "${REGISTRY}/${IMAGE_NAME}"
    }

    options {
        disableConcurrentBuilds()
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        skipStagesAfterUnstable()
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            when {
                branch 'main'
            }
            steps {
                checkout scm
            }
        }

        stage('Initialize') {
            when {
                branch 'main'
            }
            steps {
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        returnStdout: true,
                        script: 'git rev-parse --short HEAD 2>/dev/null || echo unknown'
                    ).trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    env.IMAGE_FULL = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"
                    env.IMAGE_LATEST = "${env.IMAGE_REPO}:latest"

                    echo """
Build Configuration
-------------------
Branch      : ${env.BRANCH_NAME}
Commit      : ${env.GIT_COMMIT_SHORT}
Image       : ${env.IMAGE_FULL}
Latest      : ${env.IMAGE_LATEST}
Remote      : ${PRODUCTION_USER}@${PRODUCTION_SERVER}:${PRODUCTION_SSH_PORT}
Container   : ${CONTAINER_NAME}
Port        : ${APP_PORT} -> ${CONTAINER_PORT}
"""
                }
            }
        }

        stage('Build Image') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    set -euo pipefail

                    docker build \
                        --tag "$IMAGE_FULL" \
                        --tag "$IMAGE_LATEST" \
                        --label "org.opencontainers.image.revision=$GIT_COMMIT_SHORT" \
                        --label "org.opencontainers.image.source=$JOB_NAME" \
                        --progress=plain \
                        .
                '''
            }
        }

        stage('Push Image') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${REGISTRY_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        set -euo pipefail

                        printf '%s\n' "$DOCKER_PASS" | docker login "$REGISTRY" -u "$DOCKER_USER" --password-stdin
                        docker push "$IMAGE_FULL"
                        docker push "$IMAGE_LATEST"
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
                        REMOTE_SECRET_DIR="/tmp/$CONTAINER_NAME.$BUILD_NUMBER"

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
                        export DISPLAY="${DISPLAY:-:0}"

                        ssh_remote() {
                            runner="ssh"
                            if command -v setsid >/dev/null 2>&1; then
                                runner="setsid ssh"
                            fi

                            $runner \
                                -o StrictHostKeyChecking=no \
                                -o ConnectTimeout=30 \
                                -o BatchMode=no \
                                -p "$PRODUCTION_SSH_PORT" \
                                "$PRODUCTION_USER@$PRODUCTION_SERVER" "$@"
                        }

                        ssh_remote "rm -rf '$REMOTE_SECRET_DIR'; mkdir -p '$REMOTE_SECRET_DIR'; chmod 700 '$REMOTE_SECRET_DIR'"

                        {
                            printf 'NODE_ENV=production\n'
                            printf 'CLAUDE_API_KEY=%s\n' "$CLAUDE_API_KEY"
                            printf 'CLAUDE_MODEL=%s\n' "$CLAUDE_MODEL"
                        } | ssh_remote "umask 077; cat > '$REMOTE_SECRET_DIR/app.env'"

                        printf '%s\n' "$DOCKER_PASS" | ssh_remote "umask 077; cat > '$REMOTE_SECRET_DIR/docker.pass'"
                        printf '%s\n' "$SSH_PASS" | ssh_remote "umask 077; cat > '$REMOTE_SECRET_DIR/sudo.pass'"

                        ssh_remote "cat > /tmp/$CONTAINER_NAME-deploy.sh" << 'REMOTE_SCRIPT'
#!/bin/sh
set -eu

docker_cmd() {
    if docker info >/dev/null 2>&1; then
        docker "$@"
        return
    fi

    if command -v sudo >/dev/null 2>&1; then
        sudo -S -p '' sh -c 'exec docker "$@"' sh "$@" < "$SUDO_PASS_FILE"
        return
    fi

    echo "ERROR: current user cannot access Docker and sudo is not available." >&2
    echo "Fix server permission with: sudo usermod -aG docker $USER && newgrp docker" >&2
    exit 1
}

cleanup() {
    rm -rf "$REMOTE_SECRET_DIR" "/tmp/$CONTAINER_NAME-deploy.sh"
}
trap cleanup EXIT

echo "Checking Docker access..."
docker_cmd version >/dev/null

echo "Authenticating remote Docker host to registry..."
docker_cmd login "$REGISTRY" -u "$DOCKER_USER" --password-stdin < "$DOCKER_PASS_FILE"

echo "Pulling $IMAGE_FULL..."
docker_cmd pull "$IMAGE_FULL"

PREVIOUS_IMAGE="$(docker_cmd inspect --format='{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || true)"
if [ -n "$PREVIOUS_IMAGE" ]; then
    echo "Previous image: $PREVIOUS_IMAGE"
fi

echo "Replacing container $CONTAINER_NAME..."
docker_cmd stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker_cmd rm "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker_cmd run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    --env-file "$APP_ENV_FILE" \
    -p "$APP_PORT:$CONTAINER_PORT" \
    "$IMAGE_FULL"

echo "Waiting for application health..."
for i in $(seq 1 10); do
    if docker_cmd exec "$CONTAINER_NAME" wget -qO- "http://127.0.0.1:$CONTAINER_PORT$HEALTH_PATH" >/dev/null 2>&1; then
        echo "Health check passed"
        docker_cmd logout "$REGISTRY" >/dev/null 2>&1 || true
        docker_cmd image prune -f >/dev/null 2>&1 || true
        exit 0
    fi

    echo "Health check attempt $i failed; retrying..."
    sleep 3
done

echo "ERROR: new container failed health check"
docker_cmd logs --tail=120 "$CONTAINER_NAME" 2>&1 || true

if [ -n "$PREVIOUS_IMAGE" ]; then
    echo "Attempting rollback to $PREVIOUS_IMAGE..."
    docker_cmd stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker_cmd rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker_cmd run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        --env-file "$APP_ENV_FILE" \
        -p "$APP_PORT:$CONTAINER_PORT" \
        "$PREVIOUS_IMAGE" || true
fi

docker_cmd logout "$REGISTRY" >/dev/null 2>&1 || true
exit 1
REMOTE_SCRIPT

                        ssh_remote "
                            chmod 700 /tmp/$CONTAINER_NAME-deploy.sh
                            REGISTRY='$REGISTRY' \
                            DOCKER_USER='$DOCKER_USER' \
                            IMAGE_FULL='$IMAGE_FULL' \
                            CONTAINER_NAME='$CONTAINER_NAME' \
                            APP_PORT='$APP_PORT' \
                            CONTAINER_PORT='$CONTAINER_PORT' \
                            HEALTH_PATH='$HEALTH_PATH' \
                            REMOTE_SECRET_DIR='$REMOTE_SECRET_DIR' \
                            APP_ENV_FILE='$REMOTE_SECRET_DIR/app.env' \
                            DOCKER_PASS_FILE='$REMOTE_SECRET_DIR/docker.pass' \
                            SUDO_PASS_FILE='$REMOTE_SECRET_DIR/sudo.pass' \
                            /tmp/$CONTAINER_NAME-deploy.sh
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
                        export DISPLAY="${DISPLAY:-:0}"

                        ssh_remote() {
                            runner="ssh"
                            if command -v setsid >/dev/null 2>&1; then
                                runner="setsid ssh"
                            fi

                            $runner \
                                -o StrictHostKeyChecking=no \
                                -o ConnectTimeout=30 \
                                -o BatchMode=no \
                                -p "$PRODUCTION_SSH_PORT" \
                                "$PRODUCTION_USER@$PRODUCTION_SERVER" "$@"
                        }

                        REMOTE_VERIFY_DIR="/tmp/$CONTAINER_NAME.verify.$BUILD_NUMBER"
                        ssh_remote "rm -rf '$REMOTE_VERIFY_DIR'; mkdir -p '$REMOTE_VERIFY_DIR'; chmod 700 '$REMOTE_VERIFY_DIR'"
                        printf '%s\n' "$SSH_PASS" | ssh_remote "umask 077; cat > '$REMOTE_VERIFY_DIR/sudo.pass'"

                        ssh_remote "cat > /tmp/$CONTAINER_NAME-verify.sh" << 'REMOTE_VERIFY'
#!/bin/sh
set -eu

docker_cmd() {
    if docker info >/dev/null 2>&1; then
        docker "$@"
        return
    fi

    if command -v sudo >/dev/null 2>&1; then
        sudo -S -p '' sh -c 'exec docker "$@"' sh "$@" < "$SUDO_PASS_FILE"
        return
    fi

    echo "ERROR: current user cannot access Docker and sudo is not available." >&2
    exit 1
}

cleanup() {
    rm -rf "$REMOTE_VERIFY_DIR" "/tmp/$CONTAINER_NAME-verify.sh"
}
trap cleanup EXIT

if ! docker_cmd ps --filter "name=^/$CONTAINER_NAME\\$" --format "{{.Names}}" | grep -q "^$CONTAINER_NAME\\$"; then
    echo "ERROR: $CONTAINER_NAME is not running"
    docker_cmd logs --tail=120 "$CONTAINER_NAME" 2>&1 || true
    exit 1
fi

docker_cmd exec "$CONTAINER_NAME" wget -qO- "http://127.0.0.1:$CONTAINER_PORT$HEALTH_PATH" >/dev/null
docker_cmd ps --filter "name=^/$CONTAINER_NAME\\$"
REMOTE_VERIFY

                        ssh_remote "
                            chmod 700 /tmp/$CONTAINER_NAME-verify.sh
                            CONTAINER_NAME='$CONTAINER_NAME' \
                            CONTAINER_PORT='$CONTAINER_PORT' \
                            HEALTH_PATH='$HEALTH_PATH' \
                            REMOTE_VERIFY_DIR='$REMOTE_VERIFY_DIR' \
                            SUDO_PASS_FILE='$REMOTE_VERIFY_DIR/sudo.pass' \
                            /tmp/$CONTAINER_NAME-verify.sh
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
            echo "Deployment successful: ${IMAGE_FULL}"
        }
        failure {
            echo "Deployment failed. Check Jenkins logs for details."
            echo "If the remote error is Docker socket permission, add user '${PRODUCTION_USER}' to the docker group on ${PRODUCTION_SERVER}."
        }
    }
}
