# Deployment Guide for ExpliUI

This guide explains how to deploy the ExpliUI project (Frontend & Backend) using Docker and Docker Compose on a Linux server.

## Prerequisites

- Docker installed on the server.
- Docker Compose installed on the server.
- Git (to clone the repository).

## Deployment Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd ExpliUI
   ```

2. **Build and Start the containers**:
   Run the following command in the root directory (where [docker-compose.yml](file:///e:/test/Host/ExpliUI/docker-compose.yml) is located):
   ```bash
   docker-compose up --build -d
   ```
   - `--build`: Rebuilds the images if changes are detected.
   - `-d`: Runs the containers in detached mode (background).

3. **Verify the deployment**:
   - Check if containers are running:
     ```bash
     docker-compose ps
     ```
   - Access the application:
     - **Frontend**: `http://<your-server-ip>` (Port 80)
     - **Backend API**: `http://<your-server-ip>/api` (Port 8000)

4. **Monitoring Logs**:
   To see real-time logs for both services:
   ```bash
   docker-compose logs -f
   ```

## Key Components

- **Frontend**: A React/Vite app served by Nginx. It reverse proxies requests starting with `/api` to the backend.
- **BackendV2**: A FastAPI application with Tesseract OCR and Selenium (Chromium) support.
- **Volumes**: The `./backendV2/upload_image` directory is mounted to `/app/upload_image` in the backend container to ensure uploaded images/screenshots are persisted.

## Troubleshooting

- **Check Container Health**:
  If a service fails to start, check its logs:
  ```bash
  docker-compose logs backend
  docker-compose logs frontend
  ```
- **Permission Issues**:
  If the backend cannot save images, ensure the `upload_image` directory on the host has the correct permissions:
  ```bash
  chmod -R 777 ./backendV2/upload_image
  ```

## Customization

- To change the frontend port, modify the `ports` mapping in [docker-compose.yml](file:///e:/test/Host/ExpliUI/docker-compose.yml) (e.g., `"8080:80"`).
- To update environment variables, add an `.env` file or modify the `environment` section in [docker-compose.yml](file:///e:/test/Host/ExpliUI/docker-compose.yml).
