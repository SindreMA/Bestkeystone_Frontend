#!/bin/bash

IMAGE_NAME="registry.k8s.sindrema.com/images/bestkeystone_client:test_2"

echo "Building Docker image..."
docker build -t $IMAGE_NAME .

echo "Pushing Docker image..."
docker push $IMAGE_NAME

echo "Done!"
