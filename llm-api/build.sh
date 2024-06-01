#!/bin/bash

MAX_RETRIES=5
RETRY_DELAY=10 # in seconds

retry_build() {
    local retry_count=0
    while [ $retry_count -lt $MAX_RETRIES ]; do
        docker build -t pole-api:$1 . && {
            docker tag pole-api:$1 kweg/pole-api:$1 && {
                docker push kweg/pole-api:$1
                return 0
            }
            return 0
        }
        if [ $? -ne 0 ]; then
            echo "Error: Connection reset by peer. Retrying..."
             ((retry_count++))
            sleep $RETRY_DELAY
        else
            return 0
        fi
    done
    echo "Failed to build image after $MAX_RETRIES retries."
    exit 1
}

retry_build $1