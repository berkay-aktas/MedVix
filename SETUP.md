# Setup Guide

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Python | 3.12+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org/) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/) |
| Docker | 24+ | [docker.com](https://www.docker.com/get-started/) |

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --reload --port 8000
```

Verify: open `http://localhost:8000/health` — should return `{"status":"ok"}`

API documentation: `http://localhost:8000/docs` (Swagger UI)

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Verify: open `http://localhost:5173`

## Environment Variables

Create a `.env` file in the project root (not committed to git):

```env
# Backend
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:8000
```

## Running with Docker

```bash
# Build and start all services
docker compose up --build

# Stop services
docker compose down
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |

## Running Tests

```bash
# Backend
cd backend
pip install pytest httpx
pytest

# Frontend
cd frontend
npm test
```

## Common Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'app'` | Make sure you are in the `backend/` directory before running uvicorn |
| Port 8000 already in use | `lsof -i :8000` to find the process, then `kill -9 <PID>` |
| Port 5173 already in use | `lsof -i :5173` to find the process, then `kill -9 <PID>` |
| Docker build fails | Ensure Docker daemon is running: `docker info` |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then retry |
| CORS errors in browser | Verify `CORS_ORIGINS` in backend matches your frontend URL |

## IDE Recommendations

**VS Code** with the following extensions:
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- ES7+ React/Redux/React-Native Snippets
- Prettier - Code Formatter
- ESLint
- Docker
- Thunder Client (API testing)

**PyCharm** (Professional) also works well for the backend.
