#!/bin/sh
set -e

# Default API URL if not provided
: ${API_URL:=https://bestkeystone.com/api}

echo "Configuring application with API_URL: $API_URL"

# Generate config.json with environment variable substitution
cat > /usr/share/nginx/html/config.json << EOF
{
  "apiUrl": "${API_URL}"
}
EOF

echo "Configuration file created successfully"

# Execute the CMD
exec "$@"
