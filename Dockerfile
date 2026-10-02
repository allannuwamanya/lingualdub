# ── STAGE 1: Build Modern React/TypeScript Studio Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /app/website

COPY website/package*.json ./
RUN npm ci

COPY website/ ./
RUN npm run build

# ── STAGE 2: Python Backend & Unified Server ──
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    LINGUALDUB_CACHE_DIR=/app/data/cache

# Install system dependencies (curl for healthcheck, libsndfile for audio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python package
COPY pyproject.toml ./
COPY lingualdub/ ./lingualdub/
RUN pip install --no-cache-dir .

# Copy compiled frontend from Stage 1 into website/dist
COPY --from=frontend-builder /app/website/dist /app/website/dist

# Create persistent model cache directory
RUN mkdir -p /app/data/cache/models

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/health || exit 1

ENTRYPOINT ["python", "-m", "lingualdub", "serve", "--host", "0.0.0.0", "--port", "8000"]
