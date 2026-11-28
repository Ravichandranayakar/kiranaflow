"""
KiranaFlow — Catalogue Service

Loads product catalogue from the database into a lightweight list-of-dicts
format that the parser can consume without needing a DB session.

This separates the parser (pure logic, testable without DB) from the
database layer (SQLAlchemy models).
"""

from __future__ import annotations

from typing import Dict, List

from sqlalchemy.orm import Session, joinedload

from app.models.db_models import Product


def load_catalogue(db: Session) -> List[Dict]:
    """
    Load all products and their aliases into a plain list-of-dicts in a single query.
    Format matches what parser.parse_transcript() expects.
    """
    products = db.query(Product).options(joinedload(Product.aliases)).all()
    catalogue = []

    for product in products:
        aliases = {a.alias.lower() for a in product.aliases}
        aliases.add(product.name.lower())

        catalogue.append({
            "id": product.id,
            "name": product.name,
            "aliases": list(aliases),
            "default_unit": product.default_unit,
            "category": product.category,
        })

    return catalogue
