"""
KiranaFlow — Database Engine, Session Management & Initialization

Usage:
  from app.db import get_db, init_db

  - get_db(): FastAPI dependency that yields a SQLAlchemy Session per request.
  - init_db(): Creates all tables if they don't exist (called on app startup).
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.models.db_models import Base

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def init_db() -> None:
    """Create all tables defined in Base.metadata (idempotent)."""
    Base.metadata.create_all(bind=engine)


def check_db() -> bool:
    """
    Real health check: runs SELECT 1 against PostgreSQL.
    Returns True if the DB is reachable, False otherwise.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a session, commits on success, rolls back on error."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
