# ── KiranaFlow Backend ────────────────────────────────────────
# Multi-stage: install deps + cache offline Whisper base model → slim uvicorn runtime
FROM python:3.12-slim AS base

WORKDIR /app
ENV HF_HOME=/opt/hf_cache

# Install system deps for psycopg binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download offline Whisper base (int8) model so runtime needs zero internet/API keys
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('base', device='cpu', compute_type='int8')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
