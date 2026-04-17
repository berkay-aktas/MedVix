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
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/* \
    # Make nginx work as non-root (HuggingFace Spaces runs as uid 1000)
    && sed -i 's/user www-data;/# user www-data;/' /etc/nginx/nginx.conf \
    && sed -i 's|/run/nginx.pid|/tmp/nginx.pid|' /etc/nginx/nginx.conf \
    && mkdir -p /tmp/nginx /var/log/nginx /var/lib/nginx/body /var/cache/nginx \
    && chmod -R 777 /var/log/nginx /var/lib/nginx /var/cache/nginx /tmp/nginx /run \
    && chmod 777 /etc/nginx/sites-available /etc/nginx/sites-enabled

# Copy backend
COPY --from=backend-build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin
COPY backend/ /app/backend/

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Nginx config: serve frontend + proxy /api to backend
RUN cat > /etc/nginx/sites-available/default << 'NGINX'
server {
    listen 7860;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    client_max_body_size 50M;

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

# Forward nginx logs to stdout/stderr for container visibility
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Start script — use printf to avoid CRLF issues
# Uses $PORT env var if set (Render, Cloud Run), falls back to 7860 (HF Spaces)
RUN printf '#!/bin/bash\nPORT_VALUE="${PORT:-7860}"\nsed -i "s/listen 7860;/listen ${PORT_VALUE};/" /etc/nginx/sites-available/default\necho "Starting MedVix on port ${PORT_VALUE}..."\ncd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &\necho "Waiting for backend..."\nsleep 2\nnginx -g "daemon off;"\n' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 7860

CMD ["/bin/bash", "/app/start.sh"]
