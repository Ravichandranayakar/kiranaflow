"""
KiranaFlow — Seed Data: 15 Common Indian Grocery SKUs + Multilingual Aliases

This module seeds the products and product_aliases tables on first startup.
It is idempotent: if products already exist, it skips seeding.

SKU selection rationale:
  - Covers dairy, staples, snacks, oil, personal care, instant food, produce, eggs, cleaning
  - Each product has EN, HI, and KN aliases including colloquial/phonetic variants
  - Ambiguous SKUs (Aashirvaad 1kg vs 5kg) are separate rows to test the clarification flow
"""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.models.db_models import Product, ProductAlias

logger = logging.getLogger(__name__)

# ── Seed catalogue ────────────────────────────────────────────────────────────
# Format: (name, category, default_unit, min_threshold, aliases_by_lang)
SEED_CATALOGUE = [
    (
        "Nandini Toned Milk 500ml", "dairy", "packets", 10,
        {
            "en": ["milk", "nandini milk", "nandini", "toned milk", "nandini blue"],
            "hi": ["doodh", "dudh", "nandini doodh"],
            "kn": ["haalu", "halu", "nandini haalu"],
        },
    ),
    (
        "Loose Sugar 1kg", "staples", "kg", 5,
        {
            "en": ["sugar", "loose sugar"],
            "hi": ["cheeni", "shakkar", "chini"],
            "kn": ["sakre", "sakkare"],
        },
    ),
    (
        "Aashirvaad Atta 1kg", "staples", "packets", 5,
        {
            "en": ["aashirvaad 1kg", "aashirvaad atta 1kg", "atta 1kg", "aashirvaad small"],
            "hi": ["aashirvaad atta chhota", "atta chhota"],
            "kn": ["aashirvaad atta sanna"],
        },
    ),
    (
        "Aashirvaad Atta 5kg", "staples", "packets", 3,
        {
            "en": ["aashirvaad 5kg", "aashirvaad atta 5kg", "atta 5kg", "aashirvaad big"],
            "hi": ["aashirvaad atta bada", "atta bada"],
            "kn": ["aashirvaad atta dodda"],
        },
    ),
    (
        "Parle-G Biscuit Small", "snacks", "packets", 20,
        {
            "en": ["parle g", "parle-g", "parle g chota", "parle g small", "parle biscuit"],
            "hi": ["parle g chhota", "parle biscuit"],
            "kn": ["parle g sanna", "parle biscuit"],
        },
    ),
    (
        "Fortune Sunflower Oil 1L", "oil", "bottles", 5,
        {
            "en": ["fortune oil", "sunflower oil", "fortune sunflower", "cooking oil"],
            "hi": ["fortune tel", "tel", "surajmukhi tel"],
            "kn": ["fortune enne", "enne", "suryakanti enne"],
        },
    ),
    (
        "Toor Dal 1kg", "pulses", "kg", 5,
        {
            "en": ["toor dal", "tur dal", "arhar dal", "dal", "daal"],
            "hi": ["toor dal", "arhar dal", "dal", "daal"],
            "kn": ["togari bele", "bele"],
        },
    ),
    (
        "Tata Salt 1kg", "staples", "packets", 5,
        {
            "en": ["tata salt", "salt", "iodised salt", "namak"],
            "hi": ["namak", "tata namak"],
            "kn": ["uppu", "tata uppu"],
        },
    ),
    (
        "Colgate Toothpaste 100g", "personal care", "pieces", 5,
        {
            "en": ["colgate", "toothpaste", "colgate 100g"],
            "hi": ["colgate", "toothpaste"],
            "kn": ["colgate", "toothpaste"],
        },
    ),
    (
        "Maggi Noodles 70g", "instant food", "packets", 15,
        {
            "en": ["maggi", "maggi noodles", "noodles"],
            "hi": ["maggi", "noodles"],
            "kn": ["maggi", "noodles"],
        },
    ),
    (
        "Daawat Basmati Rice 1kg", "staples", "kg", 5,
        {
            "en": ["basmati rice", "rice", "daawat rice", "basmati"],
            "hi": ["chawal", "basmati chawal", "daawat chawal"],
            "kn": ["akki", "basmati akki", "daawat akki"],
        },
    ),
    (
        "Onion 1kg", "produce", "kg", 10,
        {
            "en": ["onion", "onions"],
            "hi": ["pyaaz", "pyaj", "kanda"],
            "kn": ["eerulli", "irulli"],
        },
    ),
    (
        "Potato 1kg", "produce", "kg", 10,
        {
            "en": ["potato", "potatoes", "aloo"],
            "hi": ["aloo", "aaloo"],
            "kn": ["aaloogadde", "batate"],
        },
    ),
    (
        "Eggs (12 pack)", "dairy", "dozens", 5,
        {
            "en": ["eggs", "egg", "anda", "egg tray"],
            "hi": ["anda", "ande"],
            "kn": ["motte", "motte tray"],
        },
    ),
    (
        "Surf Excel Detergent 500g", "cleaning", "packets", 5,
        {
            "en": ["surf excel", "surf", "detergent", "washing powder"],
            "hi": ["surf excel", "surf", "dhulai powder"],
            "kn": ["surf excel", "surf", "washing powder"],
        },
    ),
]


def seed_catalogue(db: Session) -> None:
    """
    Insert seed products and aliases if the products table is empty.
    Idempotent: skips entirely if any product rows already exist.
    """
    existing_count = db.query(Product).count()
    if existing_count > 0:
        logger.info("Catalogue already seeded (%d products). Skipping.", existing_count)
        return

    logger.info("Seeding %d products into the catalogue...", len(SEED_CATALOGUE))

    for name, category, default_unit, min_threshold, aliases_by_lang in SEED_CATALOGUE:
        product = Product(
            name=name,
            category=category,
            default_unit=default_unit,
            min_threshold=min_threshold,
            usable_stock=0,
            damaged_stock=0,
        )
        db.add(product)
        db.flush()  # get product.id before creating aliases

        for lang, alias_list in aliases_by_lang.items():
            for alias_text in alias_list:
                alias = ProductAlias(
                    product_id=product.id,
                    alias=alias_text.lower().strip(),
                    lang=lang,
                )
                db.add(alias)

    db.commit()
    logger.info("Catalogue seeded successfully: %d products.", len(SEED_CATALOGUE))
