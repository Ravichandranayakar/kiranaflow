"""
KiranaFlow — Catalogue Service

Loads product catalogue from the database into a lightweight list-of-dicts
format that the parser can consume without needing a DB session.

This separates the parser (pure logic, testable without DB) from the
database layer (SQLAlchemy models).
"""

from __future__ import annotations

from typing import Dict, List

from sqlalchemy.orm import Session

from app.models.db_models import Product, ProductAlias


def load_catalogue(db: Session) -> List[Dict]:
    """
    Load all products and their aliases into a plain list-of-dicts.
    Format matches what parser.parse_transcript() expects.

    Returns:
        [
            {
                "id": 1,
                "name": "Nandini Toned Milk 500ml",
                "aliases": ["milk", "nandini milk", "haalu", "doodh", ...],
                "default_unit": "packets",
                "category": "dairy",
            },
            ...
        ]
    """
    products = db.query(Product).all()
    catalogue = []

    for product in products:
        aliases = [a.alias.lower() for a in product.aliases]
        # Also add the product name itself and its words as implicit aliases
        name_words = product.name.lower().split()
        aliases.extend([product.name.lower()])

        catalogue.append({
            "id": product.id,
            "name": product.name,
            "aliases": list(set(aliases)),
            "default_unit": product.default_unit,
            "category": product.category,
        })

    return catalogue
