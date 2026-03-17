FROM python:3.12-slim AS backend-build

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim

WORKDIR /app

# Install nginx for serving frontend
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin
COPY backend/ /app/backend/

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Nginx config: serve frontend + proxy /api to backend
RUN cat > /etc/nginx/sites-available/default << 'NGINX'
server {
    listen 7860;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

# Start script
RUN cat > /app/start.sh << 'START'
#!/bin/bash
cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
nginx -g 'daemon off;'
START
RUN chmod +x /app/start.sh

EXPOSE 7860

CMD ["/app/start.sh"]
