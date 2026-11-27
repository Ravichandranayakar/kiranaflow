"""
KiranaFlow — SQLAlchemy ORM Models
Tables: products, product_aliases, stock_movements

Design decisions (from reviewer audit):
  - Separate usable_stock and damaged_stock columns (never a single "stock" int).
  - stock_movements has a UNIQUE idempotency_key so retried confirms never double-count.
  - stock_movements stores raw_transcript, lang, source, was_corrected for audit/metrics.
  - All stock mutations use atomic SQL (usable_stock = usable_stock + delta), never read-modify-write.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Shared declarative base for all KiranaFlow models."""
    pass


class Product(Base):
    """
    A grocery product in the shop catalogue.
    Pre-seeded with 15 common Indian kirana SKUs.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, unique=True)          # e.g. "Nandini Toned Milk 500ml"
    category = Column(String(100), nullable=False, default="general") # e.g. "dairy", "staples"
    default_unit = Column(String(50), nullable=False, default="packets") # e.g. "packets", "kg", "pieces"
    usable_stock = Column(Integer, nullable=False, default=0)
    damaged_stock = Column(Integer, nullable=False, default=0)
    min_threshold = Column(Integer, nullable=False, default=5)        # for "what is running low?" query
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    aliases = relationship("ProductAlias", back_populates="product", cascade="all, delete-orphan")
    movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Product id={self.id} name='{self.name}' usable={self.usable_stock} damaged={self.damaged_stock}>"


class ProductAlias(Base):
    """
    Phonetic / multilingual aliases for catalogue matching.
    Allows shopkeepers to say "haalu", "doodh", or "milk" and match the same SKU.
    Each alias is lowercased for case-insensitive matching.
    """
    __tablename__ = "product_aliases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    alias = Column(String(200), nullable=False)
    lang = Column(String(10), nullable=False, default="en")  # "en", "hi", "kn"

    product = relationship("Product", back_populates="aliases")

    __table_args__ = (
        UniqueConstraint("alias", "lang", name="uq_alias_lang"),
    )

    def __repr__(self) -> str:
        return f"<ProductAlias alias='{self.alias}' lang='{self.lang}' product_id={self.product_id}>"


class StockMovement(Base):
    """
    Immutable audit log of every confirmed stock change.

    Design (from reviewer):
      - idempotency_key is UNIQUE: duplicate confirm retries safely return
        the existing row instead of inserting again.
      - raw_transcript preserves the shopkeeper's exact words for debugging
        and for backing the Impact metric ("we'd track correction rates").
      - source distinguishes voice / text / demo entries.
    """
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    idempotency_key = Column(String(64), nullable=False, unique=True)   # UUID generated per pending entry

    received = Column(Integer, nullable=False)
    damaged = Column(Integer, nullable=False, default=0)
    usable_delta = Column(Integer, nullable=False)                      # received - damaged (what was added)

    raw_transcript = Column(Text, nullable=True)                        # exact spoken/typed input
    lang = Column(String(10), nullable=False, default="en")             # language used for this entry
    source = Column(String(20), nullable=False, default="voice")        # "voice" | "text" | "demo"
    was_corrected = Column(Boolean, nullable=False, default=False)      # True if shopkeeper corrected before confirming

    confirmed_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    product = relationship("Product", back_populates="movements")

    def __repr__(self) -> str:
        return (
            f"<StockMovement id={self.id} product_id={self.product_id} "
            f"received={self.received} damaged={self.damaged} usable_delta={self.usable_delta}>"
        )
