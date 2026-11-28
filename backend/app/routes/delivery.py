"""
KiranaFlow — API Routes: Delivery Confirmation & Stock Queries

POST /api/deliveries/confirm
  Atomically commits a confirmed delivery entry to stock.
  Uses idempotency_key so retries never double-count.

POST /api/deliveries/confirm-batch
  Atomically commits all entries from a multi-item delivery in one transaction.

POST /api/stock/adjust
  Manually adds or subtracts usable_stock / damaged_stock with audit log.

GET /api/stock
  Returns current stock summary for all products.

GET /api/stock/movements
  Returns stock movement history (audit log).
"""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, update
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.db_models import Product, ProductAlias, StockMovement
from app.models.schemas import (
    ConfirmBatchRequest,
    ConfirmBatchResponse,
    ConfirmRequest,
    ConfirmResponse,
    MovementRecord,
    PendingEntry,
    ProductCreateRequest,
    ProductCreateResponse,
    ProductDeleteResponse,
    StockAdjustRequest,
    StockAdjustResponse,
    StockItem,
    StockSummaryResponse,
)

router = APIRouter(prefix="/api", tags=["deliveries", "stock"])


def _commit_single_entry(
    db: Session,
    entry: PendingEntry,
    raw_transcript: str,
    lang: str,
    source: str,
    was_corrected: bool,
) -> ConfirmResponse:
    """Commit one PendingEntry idempotently with atomic SQL stock increments."""
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

    product = db.query(Product).filter(Product.id == entry.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product ID {entry.product_id} not found.")

    if entry.damaged > entry.received:
        raise HTTPException(
            status_code=400,
            detail=f"Damaged ({entry.damaged}) cannot exceed received ({entry.received}).",
        )

    usable_delta = entry.received - entry.damaged

    db.execute(
        update(Product)
        .where(Product.id == entry.product_id)
        .values(
            usable_stock=Product.usable_stock + usable_delta,
            damaged_stock=Product.damaged_stock + entry.damaged,
        )
    )

    movement = StockMovement(
        product_id=entry.product_id,
        idempotency_key=entry.idempotency_key,
        received=entry.received,
        damaged=entry.damaged,
        usable_delta=usable_delta,
        raw_transcript=raw_transcript,
        lang=lang,
        source=source,
        was_corrected=was_corrected,
    )
    db.add(movement)
    db.flush()
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


# ── POST /api/deliveries/confirm ─────────────────────────────────────────────

@router.post("/deliveries/confirm", response_model=ConfirmResponse)
def confirm_delivery(req: ConfirmRequest, db: Session = Depends(get_db)) -> ConfirmResponse:
    """Atomically commit a single confirmed delivery entry."""
    return _commit_single_entry(
        db=db,
        entry=req.entry,
        raw_transcript=req.raw_transcript,
        lang=req.lang,
        source=req.source,
        was_corrected=req.was_corrected,
    )


# ── POST /api/deliveries/confirm-batch ───────────────────────────────────────

@router.post("/deliveries/confirm-batch", response_model=ConfirmBatchResponse)
def confirm_delivery_batch(req: ConfirmBatchRequest, db: Session = Depends(get_db)) -> ConfirmBatchResponse:
    """Atomically commit multiple delivery entries in a single database transaction."""
    results: List[ConfirmResponse] = []
    for entry in req.entries:
        res = _commit_single_entry(
            db=db,
            entry=entry,
            raw_transcript=req.raw_transcript,
            lang=req.lang,
            source=req.source,
            was_corrected=req.was_corrected,
        )
        results.append(res)

    all_dup = all(r.status == "duplicate" for r in results)
    summary = ", ".join(r.product_name for r in results if r.product_name)
    return ConfirmBatchResponse(
        status="duplicate" if all_dup else "committed",
        message=(
            "All items were already saved (safe retry)."
            if all_dup
            else f"Saved {len(results)} items: {summary}."
        ),
        results=results,
    )


# ── POST /api/stock/adjust ───────────────────────────────────────────────────

@router.post("/stock/adjust", response_model=StockAdjustResponse)
def adjust_stock(req: StockAdjustRequest, db: Session = Depends(get_db)) -> StockAdjustResponse:
    """
    Atomically add or subtract usable_stock / damaged_stock and record an audit row.
    Prevents negative shelf balances while leaving maximum stock unrestricted.
    """
    if req.usable_delta == 0 and req.damaged_delta == 0:
        raise HTTPException(status_code=400, detail="No stock change requested.")

    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product ID {req.product_id} not found.")

    if product.usable_stock + req.usable_delta < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot subtract {-req.usable_delta}; only {product.usable_stock} usable in stock.",
        )
    if product.damaged_stock + req.damaged_delta < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot subtract {-req.damaged_delta}; only {product.damaged_stock} damaged in stock.",
        )

    db.execute(
        update(Product)
        .where(Product.id == req.product_id)
        .values(
            usable_stock=Product.usable_stock + req.usable_delta,
            damaged_stock=Product.damaged_stock + req.damaged_delta,
        )
    )

    movement = StockMovement(
        product_id=req.product_id,
        idempotency_key=str(uuid.uuid4()),
        received=max(0, req.usable_delta) + max(0, req.damaged_delta),
        damaged=max(0, req.damaged_delta),
        usable_delta=req.usable_delta,
        raw_transcript=req.reason,
        lang="en",
        source="manual",
        was_corrected=False,
    )
    db.add(movement)
    db.flush()
    db.refresh(product)

    return StockAdjustResponse(
        status="adjusted",
        message=f"Updated {product.name}: usable={product.usable_stock}, return={product.damaged_stock}.",
        product_id=product.id,
        product_name=product.name,
        usable_stock=product.usable_stock,
        damaged_stock=product.damaged_stock,
        movement_id=movement.id,
    )


# ── POST /api/stock/products ─────────────────────────────────────────────────

@router.post("/stock/products", response_model=ProductCreateResponse)
def create_product(req: ProductCreateRequest, db: Session = Depends(get_db)) -> ProductCreateResponse:
    """Explicitly add a new SKU and voice aliases to the shop catalogue."""
    clean_name = req.name.strip()
    existing = db.query(Product).filter(func.lower(Product.name) == clean_name.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"'{clean_name}' is already in your catalogue.")

    product = Product(
        name=clean_name,
        category=req.category.strip().lower() or "general",
        default_unit=req.default_unit.strip().lower() or "packets",
        min_threshold=req.min_threshold,
        usable_stock=req.usable_stock,
        damaged_stock=0,
    )
    db.add(product)
    db.flush()

    candidate_aliases = {clean_name.lower()}
    for raw_alias in req.aliases:
        cleaned = raw_alias.strip().lower()
        if cleaned:
            candidate_aliases.add(cleaned)

    existing_en_aliases = {
        a.alias.lower()
        for a in db.query(ProductAlias.alias).filter(ProductAlias.lang == "en").all()
    }
    for alias_text in candidate_aliases:
        if alias_text not in existing_en_aliases:
            db.add(ProductAlias(product_id=product.id, alias=alias_text, lang="en"))
            existing_en_aliases.add(alias_text)

    if req.usable_stock > 0:
        db.add(
            StockMovement(
                product_id=product.id,
                idempotency_key=str(uuid.uuid4()),
                received=req.usable_stock,
                damaged=0,
                usable_delta=req.usable_stock,
                raw_transcript=f"Added '{clean_name}' with opening stock",
                lang="en",
                source="manual",
                was_corrected=False,
            )
        )

    db.flush()
    db.refresh(product)

    item = StockItem(
        product_id=product.id,
        product_name=product.name,
        category=product.category,
        usable_stock=product.usable_stock,
        damaged_stock=product.damaged_stock,
        min_threshold=product.min_threshold,
        is_low=product.usable_stock < product.min_threshold,
    )
    return ProductCreateResponse(
        status="created",
        message=f"Added '{product.name}' to shop catalogue.",
        item=item,
    )


# ── DELETE /api/stock/products/{product_id} ──────────────────────────────────

@router.delete("/stock/products/{product_id}", response_model=ProductDeleteResponse)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> ProductDeleteResponse:
    """Remove a SKU and its aliases/history from the shop catalogue."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product ID {product_id} not found.")

    name = product.name
    db.delete(product)
    db.flush()

    return ProductDeleteResponse(
        status="deleted",
        message=f"Removed '{name}' from shop catalogue.",
        product_id=product_id,
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
    """Return recent stock movement history (audit log) in a single JOIN query."""
    movements = (
        db.query(StockMovement)
        .options(joinedload(StockMovement.product))
        .order_by(StockMovement.confirmed_at.desc())
        .limit(limit)
        .all()
    )

    return [
        MovementRecord(
            id=m.id,
            product_name=m.product.name if m.product else f"Product #{m.product_id}",
            received=m.received,
            damaged=m.damaged,
            usable_delta=m.usable_delta,
            raw_transcript=m.raw_transcript,
            lang=m.lang,
            source=m.source,
            was_corrected=m.was_corrected,
            confirmed_at=m.confirmed_at.isoformat(),
        )
        for m in movements
    ]
