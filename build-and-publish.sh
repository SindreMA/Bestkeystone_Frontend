#!/bin/bash

IMAGE_NAME="registry.k8s.sindrema.com/images/bestkeystone_client:latest"

echo "Building Docker image..."
docker build -t $IMAGE_NAME .

echo "Pushing Docker image..."
docker push $IMAGE_NAME

echo "Done!"
echo ""
echo "To run with custom API URL:"
echo "  docker run -e API_URL=https://your-api-url.com/api -p 80:80 $IMAGE_NAME"
