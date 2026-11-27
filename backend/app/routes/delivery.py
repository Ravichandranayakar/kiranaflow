"""
KiranaFlow — API Routes: Delivery Confirmation & Stock Queries

POST /api/deliveries/confirm
  Atomically commits a confirmed delivery entry to stock.
  Uses idempotency_key so retries never double-count.

GET /api/stock
  Returns current stock summary for all products.

GET /api/stock/movements
  Returns stock movement history (audit log).
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.db_models import Product, StockMovement
from app.models.schemas import (
    ConfirmRequest,
    ConfirmResponse,
    MovementRecord,
    StockItem,
    StockSummaryResponse,
)

router = APIRouter(prefix="/api", tags=["deliveries", "stock"])


# ── POST /api/deliveries/confirm ─────────────────────────────────────────────

@router.post("/deliveries/confirm", response_model=ConfirmResponse)
def confirm_delivery(req: ConfirmRequest, db: Session = Depends(get_db)) -> ConfirmResponse:
    """
    Atomically commit a confirmed delivery entry.

    Reviewer fix #5: Uses atomic UPDATE ... SET usable_stock = usable_stock + delta,
    never read-modify-write.

    Idempotency: If the idempotency_key already exists in stock_movements,
    return the existing record instead of inserting again (safe retry).
    """
    entry = req.entry

    # ── Idempotency check ─────────────────────────────────────────────────
    existing = (
        db.query(StockMovement)
        .filter(StockMovement.idempotency_key == entry.idempotency_key)
        .first()
    )
    if existing:
        product = db.query(Product).filter(Product.id == existing.product_id).first()
        return ConfirmResponse(
            status="duplicate",
            message="This entry was already saved (safe retry).",
            movement_id=existing.id,
            product_name=product.name if product else None,
            usable_stock=product.usable_stock if product else None,
            damaged_stock=product.damaged_stock if product else None,
        )

    # ── Validate product exists ───────────────────────────────────────────
    product = db.query(Product).filter(Product.id == entry.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product ID {entry.product_id} not found.")

    # ── Validate quantities ───────────────────────────────────────────────
    if entry.damaged > entry.received:
        raise HTTPException(
            status_code=400,
            detail=f"Damaged ({entry.damaged}) cannot exceed received ({entry.received}).",
        )

    usable_delta = entry.received - entry.damaged

    # ── Atomic stock update (Reviewer fix #5) ─────────────────────────────
    db.execute(
        update(Product)
        .where(Product.id == entry.product_id)
        .values(
            usable_stock=Product.usable_stock + usable_delta,
            damaged_stock=Product.damaged_stock + entry.damaged,
        )
    )

    # ── Insert movement record ────────────────────────────────────────────
    movement = StockMovement(
        product_id=entry.product_id,
        idempotency_key=entry.idempotency_key,
        received=entry.received,
        damaged=entry.damaged,
        usable_delta=usable_delta,
        raw_transcript=req.raw_transcript,
        lang=req.lang,
        source=req.source,
        was_corrected=req.was_corrected,
    )
    db.add(movement)
    db.flush()

    # Refresh product to get updated stock counts
    db.refresh(product)

    return ConfirmResponse(
        status="committed",
        message=f"Saved {usable_delta} usable {entry.unit} of {product.name}. "
                f"{entry.damaged} logged for supplier return.",
        movement_id=movement.id,
        product_name=product.name,
        usable_stock=product.usable_stock,
        damaged_stock=product.damaged_stock,
    )


# ── GET /api/stock ───────────────────────────────────────────────────────────

@router.get("/stock", response_model=StockSummaryResponse)
def get_stock_summary(db: Session = Depends(get_db)) -> StockSummaryResponse:
    """Return current stock levels for all products."""
    products = db.query(Product).order_by(Product.category, Product.name).all()

    items = []
    low_count = 0
    for p in products:
        is_low = p.usable_stock < p.min_threshold
        if is_low:
            low_count += 1
        items.append(
            StockItem(
                product_id=p.id,
                product_name=p.name,
                category=p.category,
                usable_stock=p.usable_stock,
                damaged_stock=p.damaged_stock,
                min_threshold=p.min_threshold,
                is_low=is_low,
            )
        )

    return StockSummaryResponse(items=items, low_stock_count=low_count)


# ── GET /api/stock/movements ─────────────────────────────────────────────────

@router.get("/stock/movements", response_model=List[MovementRecord])
def get_stock_movements(
    limit: int = 50,
    db: Session = Depends(get_db),
) -> List[MovementRecord]:
    """Return recent stock movement history (audit log)."""
    movements = (
        db.query(StockMovement)
        .order_by(StockMovement.confirmed_at.desc())
        .limit(limit)
        .all()
    )

    records = []
    for m in movements:
        product = db.query(Product).filter(Product.id == m.product_id).first()
        records.append(
            MovementRecord(
                id=m.id,
                product_name=product.name if product else f"Product #{m.product_id}",
                received=m.received,
                damaged=m.damaged,
                usable_delta=m.usable_delta,
                raw_transcript=m.raw_transcript,
                lang=m.lang,
                source=m.source,
                was_corrected=m.was_corrected,
                confirmed_at=m.confirmed_at.isoformat(),
            )
        )

    return records
