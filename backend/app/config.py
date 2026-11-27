"""
KiranaFlow — Centralized Configuration
Loads from environment variables with safe defaults.
No secret key is required for the app to start and run its core flow.
"""

from __future__ import annotations

import os
from typing import List


class Settings:
    """Application settings loaded from environment variables."""

    # ── Database ──────────────────────────────────────────────────────
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://kiranaflow:kiranaflow_dev@db:5432/kiranaflow",
    )

    # ── CORS ──────────────────────────────────────────────────────────
    cors_origins: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:8080,http://localhost:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]

    # ── Optional LLM key (empty = use deterministic parser) ──────────
    llm_api_key: str = os.getenv("LLM_API_KEY", "").strip()

    @property
    def llm_enabled(self) -> bool:
        return bool(self.llm_api_key)

    # ── App defaults ─────────────────────────────────────────────────
    default_language: str = os.getenv("DEFAULT_LANGUAGE", "en")


settings = Settings()
