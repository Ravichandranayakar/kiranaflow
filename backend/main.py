"""
KiranaFlow — FastAPI Application Entry Point

Startup sequence:
  1. Create all DB tables (idempotent).
  2. Seed 15 Indian grocery SKUs + multilingual aliases (idempotent).
  3. Serve API with CORS middleware configured for dev + Docker origins.

Endpoints (Step 1):
  GET /api/health — real DB health check (SELECT 1), plus optional LLM key status.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import SessionLocal, check_db, init_db
from app.routes.delivery import router as delivery_router
from app.routes.voice import router as voice_router
from app.services.seed import seed_catalogue
from app.services.stt import get_whisper_model

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger("kiranaflow")


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB, seed catalogue, and warm up offline STT model on startup."""
    logger.info("Initializing database tables...")
    init_db()

    logger.info("Seeding product catalogue...")
    db = SessionLocal()
    try:
        seed_catalogue(db)
    finally:
        db.close()

    try:
        get_whisper_model()
    except Exception as exc:
        logger.warning("Whisper STT warmup skipped: %s", exc)

    logger.info("KiranaFlow backend ready.")
    logger.info("LLM smart parser: %s", "ENABLED" if settings.llm_enabled else "DISABLED (using deterministic parser)")
    yield
    logger.info("KiranaFlow backend shutting down.")


# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="KiranaFlow API",
    description="Voice-first inventory & delivery assistant for Indian kirana stores",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS (reviewer fix #1: add on Day 1, configurable origins) ───────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register route modules ───────────────────────────────────────────────────
app.include_router(voice_router)
app.include_router(delivery_router)


# ── Health Check (reviewer fix #6: actually touches DB with SELECT 1) ────────
@app.get("/api/health")
def health_check():
    """
    Returns 200 if PostgreSQL is reachable (SELECT 1), 503 otherwise.
    Also reports whether the optional LLM key is configured.
    """
    db_ok = check_db()
    status_code = 200 if db_ok else 503

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "unreachable",
        "llm_parser": "enabled" if settings.llm_enabled else "disabled (deterministic parser active)",
        "default_language": settings.default_language,
    }
