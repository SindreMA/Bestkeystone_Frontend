# Runtime Configuration Guide

This application supports runtime configuration, allowing you to change the API URL without rebuilding the application.

## How it Works

The application loads its configuration from `/config.json` at runtime. This file is generated dynamically when the Docker container starts, based on environment variables.

## Configuration Options

- `API_URL`: The backend API endpoint URL (default: `https://bestkeystone.com/api`)

## Usage

### Local Development

1. Create a `.env` file in the project root:
```bash
VITE_API_URL=https://bestkeystone-test.k8s.sindrema.com/api
```

2. Run the development server:
```bash
npm run dev
```

The dev server will use the URL from `.env` or fall back to the default.

### Docker

#### Running with default configuration:
```bash
docker run -p 80:80 registry.k8s.sindrema.com/images/bestkeystone_client:latest
```

#### Running with custom API URL:
```bash
docker run -e API_URL=https://bestkeystone-test.k8s.sindrema.com/api -p 80:80 registry.k8s.sindrema.com/images/bestkeystone_client:latest
```

### Kubernetes

Add the environment variable to your deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bestkeystone-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: registry.k8s.sindrema.com/images/bestkeystone_client:latest
        env:
        - name: API_URL
          value: "https://bestkeystone-test.k8s.sindrema.com/api"
        ports:
        - containerPort: 80
```

Or use a ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bestkeystone-config
data:
  api_url: "https://bestkeystone-test.k8s.sindrema.com/api"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bestkeystone-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: registry.k8s.sindrema.com/images/bestkeystone_client:latest
        env:
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: bestkeystone-config
              key: api_url
```

## Files Modified

- `public/config.json` - Runtime configuration file (template)
- `src/config/env.ts` - Configuration loader
- `src/boot/axios.ts` - Loads config at app initialization
- `src/store/data.ts` - Uses runtime configuration for API URL
- `Dockerfile` - Supports runtime config injection
- `docker-entrypoint.sh` - Generates config.json from environment variables

## Switching Between Environments

You can now easily switch between production and test environments by changing the `API_URL` environment variable:

**Production:**
```bash
docker run -e API_URL=https://bestkeystone.com/api -p 80:80 <image>
```

**Test:**
```bash
docker run -e API_URL=https://bestkeystone-test.k8s.sindrema.com/api -p 80:80 <image>
```

No rebuild required!
